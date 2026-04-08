// Hooks System - Pre/post tool hooks with YAML configuration
// Based on Claude Code's hook system

export type HookType =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PreCompact'
  | 'PostCompact'
  | 'SessionStart'
  | 'SessionEnd'

export type HookMode = 'blocking' | 'non-blocking'

export interface Hook {
  name: string
  type: HookType
  command: string
  mode: HookMode
  enabled: boolean
  description?: string
}

export interface HookContext {
  toolName?: string
  toolInput?: unknown
  toolOutput?: unknown
  sessionId?: string
  cwd?: string
  timestamp: number
}

export interface HookResult {
  success: boolean
  modified?: {
    input?: unknown
    output?: unknown
    blocked?: boolean
    message?: string
  }
  error?: string
}

export interface HooksConfig {
  hooks: Hook[]
  timeout: number  // ms
  workingDirectory?: string
}

export const defaultHooksConfig: HooksConfig = {
  hooks: [],
  timeout: 5000,
}

// Hook registry
const registry = new Map<HookType, Hook[]>()

// Register a hook
export function registerHook(hook: Hook): void {
  const hooks = registry.get(hook.type) ?? []
  hooks.push(hook)
  registry.set(hook.type, hooks)
}

// Unregister a hook
export function unregisterHook(name: string): boolean {
  for (const [type, hooks] of registry) {
    const idx = hooks.findIndex(h => h.name === name)
    if (idx !== -1) {
      hooks.splice(idx, 1)
      return true
    }
  }
  return false
}

// Get hooks by type
export function getHooks(type: HookType): Hook[] {
  return registry.get(type) ?? []
}

// Execute hooks for a specific type
export async function executeHooks(
  type: HookType,
  context: HookContext,
  config: HooksConfig = defaultHooksConfig
): Promise<HookResult[]> {
  const hooks = getHooks(type).filter(h => h.enabled)
  const results: HookResult[] = []

  for (const hook of hooks) {
    const result = await executeHook(hook, context, config.timeout)
    results.push(result)

    // If blocking hook and blocked, stop execution
    if (hook.mode === 'blocking' && result.modified?.blocked) {
      break
    }
  }

  return results
}

// Execute a single hook
async function executeHook(
  hook: Hook,
  context: HookContext,
  timeout: number
): Promise<HookResult> {
  return new Promise((resolve) => {
    const { spawn } = require('node:child_process')

    // Build payload for stdin
    const payload = JSON.stringify(context)

    const proc = spawn('sh', ['-c', hook.command], {
      timeout,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString() })
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString() })

    proc.on('close', (code: number | null) => {
      try {
        const modified = stdout.trim() ? JSON.parse(stdout) : {}
        resolve({
          success: code === 0,
          modified,
          error: stderr || undefined,
        })
      } catch {
        resolve({
          success: code === 0,
          error: stderr || `Hook exited with code ${code}`,
        })
      }
    })

    proc.on('error', (err: Error) => {
      resolve({
        success: false,
        error: err.message,
      })
    })

    // Send payload to hook
    proc.stdin?.write(payload)
    proc.stdin?.end()
  })
}

// Pre-tool hook middleware
export async function preToolHook(
  toolName: string,
  toolInput: unknown,
  context: Partial<HookContext> = {}
): Promise<{ input: unknown; blocked: boolean }> {
  const results = await executeHooks('PreToolUse', {
    toolName,
    toolInput,
    ...context,
    timestamp: Date.now(),
  })

  let input = toolInput
  let blocked = false

  for (const result of results) {
    if (result.modified?.blocked) {
      blocked = true
      break
    }
    if (result.modified?.input) {
      input = result.modified.input
    }
  }

  return { input, blocked }
}

// Post-tool hook middleware
export async function postToolHook(
  toolName: string,
  toolInput: unknown,
  toolOutput: unknown,
  context: Partial<HookContext> = {}
): Promise<unknown> {
  const results = await executeHooks('PostToolUse', {
    toolName,
    toolInput,
    toolOutput,
    ...context,
    timestamp: Date.now(),
  })

  let output = toolOutput

  for (const result of results) {
    if (result.modified?.output) {
      output = result.modified.output
    }
  }

  return output
}

// Session hooks
export async function sessionStartHook(sessionId: string, cwd: string): Promise<void> {
  await executeHooks('SessionStart', {
    sessionId,
    cwd,
    timestamp: Date.now(),
  })
}

export async function sessionEndHook(sessionId: string, cwd: string): Promise<void> {
  await executeHooks('SessionEnd', {
    sessionId,
    cwd,
    timestamp: Date.now(),
  })
}

// Compaction hooks
export async function preCompactHook(context: Partial<HookContext> = {}): Promise<void> {
  await executeHooks('PreCompact', {
    ...context,
    timestamp: Date.now(),
  })
}

export async function postCompactHook(
  removedMessages: number,
  tokensSaved: number,
  context: Partial<HookContext> = {}
): Promise<void> {
  await executeHooks('PostCompact', {
    toolOutput: { removedMessages, tokensSaved },
    ...context,
    timestamp: Date.now(),
  })
}

// Load hooks from YAML config
export function loadHooksFromConfig(config: HooksConfig): void {
  // Clear existing
  registry.clear()

  for (const hook of config.hooks) {
    registerHook(hook)
  }
}

// Create hook from YAML structure
export function createHook(
  name: string,
  type: HookType,
  command: string,
  mode: HookMode = 'non-blocking',
  description?: string
): Hook {
  return {
    name,
    type,
    command,
    mode,
    enabled: true,
    description,
  }
}

export default {
  registerHook,
  unregisterHook,
  getHooks,
  executeHooks,
  preToolHook,
  postToolHook,
  sessionStartHook,
  sessionEndHook,
  preCompactHook,
  postCompactHook,
  loadHooksFromConfig,
  createHook,
  defaultHooksConfig,
}
