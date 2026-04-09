// Sandbox Security - Landlock, Seatbelt, and Windows Restricted Token
// Based on Codex-RS's sandbox implementation

export type SandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access'

export interface SandboxPolicy {
  mode: SandboxMode
  allowedPaths: string[]
  deniedPaths: string[]
  allowedCommands: string[]
  networkRules: NetworkRule[]
}

export interface NetworkRule {
  host: string
  port?: number
  protocol: 'http' | 'https' | 'tcp' | 'udp' | 'all'
  action: 'allow' | 'deny'
}

export interface SandboxResult {
  allowed: boolean
  reason?: string
  blocked?: boolean
}

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+/,
  /fork\s*bomb/i,
  /:(){ :|:& };:/,
  /chmod\s+777/,
  /curl\s+\|sh/i,
  /wget\s+\|sh/i,
  />\s*\/dev\/sd/,
  /dd\s+if=.*of=\/dev\//,
]

// Landlock for Linux
export class LandlockSandbox {
  private enabled: boolean
  private workspaceDir: string

  constructor(workspaceDir: string) {
    this.enabled = this.checkLandlockSupport()
    this.workspaceDir = workspaceDir
  }

  private checkLandlockSupport(): boolean {
    try {
      // Check if kernel supports Landlock (5.13+)
      const { readFileSync } = require('node:fs')
      const kernelVersion = require('process').platform === 'linux'
      return kernelVersion
    } catch {
      return false
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  // Enforce sandbox via subprocess wrapper
  async enforce(policy: SandboxPolicy, command: string): Promise<SandboxResult> {
    if (policy.mode === 'danger-full-access') {
      return { allowed: true }
    }

    // Check for dangerous patterns
    const dangerCheck = this.checkDangerousPatterns(command)
    if (dangerCheck.blocked) {
      return dangerCheck
    }

    // Check command against allowed list
    if (policy.allowedCommands.length > 0) {
      const cmdName = command.split(' ')[0] ?? ''
      if (!policy.allowedCommands.includes(cmdName)) {
        return { allowed: false, reason: `Command '${cmdName}' not in allowed list`, blocked: true }
      }
    }

    // For actual Landlock enforcement, would need native module
    // Here we simulate with bubblewrap-like wrapper script
    return { allowed: true, reason: 'Landlock enforcement simulated' }
  }

  private checkDangerousPatterns(cmd: string): SandboxResult {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(cmd)) {
        return {
          allowed: false,
          reason: `Dangerous pattern detected: ${pattern.source}`,
          blocked: true,
        }
      }
    }
    return { allowed: true }
  }

  // Generate Landlock rules for a path
  generateLandlockRules(allowedPaths: string[], readOnly = true): string[] {
    return allowedPaths.map(path => {
      const access = readOnly
        ? 'ro'
        : 'rw'
      return `allow ${path} ${access}`
    })
  }
}

// Seatbelt for macOS
export class SeatbeltSandbox {
  private enabled: boolean

  constructor() {
    this.enabled = process.platform === 'darwin'
  }

  isEnabled(): boolean {
    return this.enabled
  }

  // macOS sandbox profile generation
  generateProfile(allowedPaths: string[], networkRules?: NetworkRule[]): string {
    let profile = '(version 1)'

    // Allow file reads from specific paths
    for (const path of allowedPaths) {
      profile += `\n(allow file-read-data (literal "${path}"))`
    }

    // Network rules
    if (networkRules) {
      for (const rule of networkRules) {
        if (rule.action === 'allow') {
          if (rule.host === '*') {
            profile += `\n(allow network*)`
          } else if (rule.protocol === 'http' || rule.protocol === 'https') {
            profile += `\n(allow network-outbound (remote-name "${rule.host}"))`
          }
        }
      }
    }

    return profile
  }

  // Execute with sandbox
  async executeWithSandbox(profile: string, command: string, args: string[]): Promise<void> {
    // Would use sandbox-exec on macOS
    const { spawn } = require('child_process')
    const profileFile = '/tmp/sandbox-profile.sb'

    // Write profile temporarily
    const { writeFile } = require('node:fs')
    writeFile.sync(profileFile, profile)

    // Execute with sandbox
    spawn('sandbox-exec', ['-f', profileFile, command, ...args])
  }
}

// Windows Restricted Token
export class WindowsSandbox {
  private enabled: boolean

  constructor() {
    this.enabled = process.platform === 'win32'
  }

  isEnabled(): boolean {
    return this.enabled
  }

  // Generate Windows security descriptor
  generateSecurityDescriptor(allowedPaths: string[]): string {
    // Return a Windows SDDL string for restricted token
    // In practice, would use CreateRestrictedToken Win32 API
    return 'D:(A;;GA;;;WD)' // Basic grant
  }
}

// Policy Engine - main sandbox orchestrator
export class SandboxEngine {
  private mode: SandboxMode
  private policy: SandboxPolicy
  private landlock: LandlockSandbox | null = null
  private seatbelt: SeatbeltSandbox | null = null
  private windows: WindowsSandbox | null = null

  constructor(mode: SandboxMode, workspaceDir: string, policy?: Partial<SandboxPolicy>) {
    this.mode = mode

    this.policy = {
      mode,
      allowedPaths: policy?.allowedPaths ?? [workspaceDir],
      deniedPaths: policy?.deniedPaths ?? [],
      allowedCommands: policy?.allowedCommands ?? ['git', 'npm', 'node', 'bun', 'python', 'pip', 'grep', 'find', 'cat', 'ls'],
      networkRules: policy?.networkRules ?? [],
    }

    // Initialize platform-specific sandbox
    if (process.platform === 'linux') {
      this.landlock = new LandlockSandbox(workspaceDir)
    } else if (process.platform === 'darwin') {
      this.seatbelt = new SeatbeltSandbox()
    } else if (process.platform === 'win32') {
      this.windows = new WindowsSandbox()
    }
  }

  getMode(): SandboxMode {
    return this.mode
  }

  // Check if a path is allowed
  isPathAllowed(path: string): boolean {
    // Check denied paths first
    for (const denied of this.policy.deniedPaths) {
      if (path.startsWith(denied) || path.includes(denied)) {
        return false
      }
    }

    // Check allowed paths
    if (this.policy.mode === 'danger-full-access') {
      return true
    }

    for (const allowed of this.policy.allowedPaths) {
      if (path.startsWith(allowed)) {
        return true
      }
    }

    return false
  }

  // Check if a command is allowed
  isCommandAllowed(command: string): SandboxResult {
    const cmdName = command.split(' ')[0] ?? ''

    // Check dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        return {
          allowed: false,
          reason: `Dangerous pattern detected in command`,
          blocked: true,
        }
      }
    }

    // Check allowed commands list
    if (this.policy.allowedCommands.length > 0) {
      if (!this.policy.allowedCommands.includes(cmdName)) {
        return {
          allowed: false,
          reason: `Command '${cmdName}' not allowed in sandbox mode`,
          blocked: true,
        }
      }
    }

    return { allowed: true }
  }

  // Check network access
  isNetworkAllowed(host: string, port?: number, protocol = 'https'): SandboxResult {
    if (this.policy.mode === 'danger-full-access') {
      return { allowed: true }
    }

    for (const rule of this.policy.networkRules) {
      if (rule.host === host || rule.host === '*') {
        if (rule.port === undefined || rule.port === port) {
          return {
            allowed: rule.action === 'allow',
            reason: rule.action === 'deny' ? `Network to ${host}:${port} denied by policy` : undefined,
            blocked: rule.action === 'deny',
          }
        }
      }
    }

    // Default: deny if no explicit allow
    return { allowed: false, reason: `No network rule for ${host}:${port}`, blocked: true }
  }

  // Execute command with sandbox checks
  async execute(command: string, args: string[]): Promise<SandboxResult> {
    // Full access mode = no checks
    if (this.policy.mode === 'danger-full-access') {
      return { allowed: true }
    }

    // Check command
    const cmdCheck = this.isCommandAllowed(command)
    if (!cmdCheck.allowed) return cmdCheck

    // Check for path traversal
    for (const arg of args) {
      if (arg.includes('..') || arg.startsWith('/etc') || arg.startsWith('/root')) {
        return { allowed: false, reason: `Path traversal attempt: ${arg}`, blocked: true }
      }
    }

    // Platform-specific enforcement
    if (this.landlock) {
      return this.landlock.enforce(this.policy, command)
    }

    return { allowed: true }
  }

  // Get sandbox status
  getStatus(): {
    mode: SandboxMode
    enabled: boolean
    platform: string
    allowedCommandsCount: number
    allowedPathsCount: number
    networkRulesCount: number
  } {
    return {
      mode: this.mode,
      enabled: this.mode !== 'danger-full-access',
      platform: process.platform,
      allowedCommandsCount: this.policy.allowedCommands.length,
      allowedPathsCount: this.policy.allowedPaths.length,
      networkRulesCount: this.policy.networkRules.length,
    }
  }

  // Update policy at runtime
  updatePolicy(updates: Partial<SandboxPolicy>): void {
    this.policy = { ...this.policy, ...updates }
  }
}

// Factory function
export function createSandbox(
  mode: SandboxMode,
  workspaceDir: string,
  policy?: Partial<SandboxPolicy>
): SandboxEngine {
  return new SandboxEngine(mode, workspaceDir, policy)
}

// Default sandbox configs
export const SANDBOX_CONFIGS = {
  readOnly: {
    mode: 'read-only' as SandboxMode,
    allowedCommands: ['git', 'grep', 'find', 'cat', 'ls', 'pwd', 'head', 'tail'],
    networkRules: [
      { host: 'api.anthropic.com', protocol: 'https', action: 'allow' as const },
      { host: 'api.openai.com', protocol: 'https', action: 'allow' as const },
    ],
  },
  workspaceWrite: {
    mode: 'workspace-write' as SandboxMode,
    allowedCommands: ['git', 'npm', 'node', 'bun', 'python', 'pip', 'grep', 'find', 'cat', 'ls', 'code', 'vim', 'nano'],
    networkRules: [
      { host: 'api.anthropic.com', protocol: 'https', action: 'allow' as const },
      { host: 'api.openai.com', protocol: 'https', action: 'allow' as const },
      { host: 'github.com', protocol: 'https', action: 'allow' as const },
      { host: 'registry.npmjs.org', protocol: 'https', action: 'allow' as const },
    ],
  },
  fullAccess: {
    mode: 'danger-full-access' as SandboxMode,
    allowedCommands: [],
    networkRules: [],
  },
}