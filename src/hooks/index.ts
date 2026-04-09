// Advanced Hooks System - Extended hook types for Read/Edit/Bash/Think/AgentSubmit
// Based on Claude Code's hook system

export type HookType =
  | 'PreToolUse'
  | 'PostToolUse'
  | 'PreRead'
  | 'PostRead'
  | 'PreEdit'
  | 'PostEdit'
  | 'PreBash'
  | 'PostBash'
  | 'PreCompact'
  | 'PostCompact'
  | 'SessionStart'
  | 'SessionEnd'
  | 'Think'
  | 'AgentSubmit'
  | 'Entrypoint'

export type HookMode = 'blocking' | 'non-blocking'

export interface Hook {
  name: string
  type: HookType
  command: string
  mode: HookMode
  enabled: boolean
  description?: string
  condition?: string  // Optional condition to check before running
}

export interface HookContext {
  toolName?: string
  toolInput?: unknown
  toolOutput?: unknown
  filePath?: string
  fileContent?: string
  sessionId?: string
  cwd?: string
  timestamp: number
  agentThinking?: string  // For Think hooks
  agentResult?: string    // For AgentSubmit hooks
}

export interface HookResult {
  success: boolean
  modified?: {
    input?: unknown
    output?: unknown
    blocked?: boolean
    message?: string
    replaced?: string  // For file content replacement
  }
  error?: string
}

export interface HooksConfig {
  hooks: Hook[]
  timeout: number
  workingDirectory?: string
  enableThinkHooks?: boolean
  enableAgentHooks?: boolean
}

export const defaultHooksConfig: HooksConfig = {
  hooks: [],
  timeout: 5000,
  enableThinkHooks: false,
  enableAgentHooks: false,
}

// Hook registry
const registry = new Map<HookType, Hook[]>()

// Register a hook
export function registerHook(hook: Hook): void {
  const hooks = registry.get(hook.type) ?? []
  const idx = hooks.findIndex(h => h.name === hook.name)
  if (idx >= 0) {
    hooks[idx] = hook
  } else {
    hooks.push(hook)
  }
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

// Execute a single hook
async function executeHook(
  hook: Hook,
  context: HookContext,
  timeout: number
): Promise<HookResult> {
  try {
    const start = Date.now()

    // Build environment for hook script
    const env: Record<string, string> = {
      ...process.env,
      HOOK_NAME: hook.name,
      HOOK_TYPE: hook.type,
      HOOK_TIMEOUT: String(timeout),
      HOOK_TIMESTAMP: String(context.timestamp),
      CWD: context.cwd ?? process.cwd(),
    }

    if (context.toolName) env.HOOK_TOOL_NAME = context.toolName
    if (context.filePath) env.HOOK_FILE_PATH = context.filePath
    if (context.sessionId) env.HOOK_SESSION_ID = context.sessionId

    // Serialize input/output as JSON for hook scripts
    if (context.toolInput) env.HOOK_TOOL_INPUT = JSON.stringify(context.toolInput)
    if (context.toolOutput) env.HOOK_TOOL_OUTPUT = JSON.stringify(context.toolOutput)
    if (context.agentThinking) env.HOOK_AGENT_THINKING = context.agentThinking
    if (context.agentResult) env.HOOK_AGENT_RESULT = context.agentResult

    const result = await executeCommand(hook.command, timeout, env)

    // Parse result - expect JSON with optional modifications
    let parsed: Partial<HookResult> = { success: true }
    try {
      parsed = JSON.parse(result.trim())
    } catch {
      // Non-JSON output means just success
      parsed = { success: true }
    }

    return {
      success: parsed.success ?? true,
      modified: parsed.modified,
      error: parsed.error,
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

// Execute command with timeout
async function executeCommand(
  cmd: string,
  timeout: number,
  env: Record<string, string>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process')
    const parts = cmd.split(' ')
    const bin = parts[0]
    const args = parts.slice(1)

    const proc = spawn(bin, args, {
      env,
      timeout,
      cwd: env.CWD,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', d => stdout += d.toString())
    proc.stderr?.on('data', d => stderr += d.toString())

    proc.on('close', code => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(stderr || `Exit code: ${code}`))
      }
    })

    proc.on('error', reject)
  })
}

// Execute hooks for a specific type
export async function executeHooks(
  type: HookType,
  context: HookContext,
  config: HooksConfig = defaultHooksConfig
): Promise<HookResult[]> {
  let hooks = getHooks(type).filter(h => h.enabled)

  // Filter based on config flags
  if (type === 'Think' && !config.enableThinkHooks) {
    hooks = []
  }
  if (type === 'AgentSubmit' && !config.enableAgentHooks) {
    hooks = []
  }

  const results: HookResult[] = []

  for (const hook of hooks) {
    // Check condition if defined
    if (hook.condition && !evaluateCondition(hook.condition, context)) {
      continue
    }

    const result = await executeHook(hook, context, config.timeout)
    results.push(result)

    // If blocking hook and blocked, stop execution
    if (hook.mode === 'blocking' && result.modified?.blocked) {
      console.log(`[Hooks] Blocking hook '${hook.name}' blocked execution`)
      break
    }
  }

  return results
}

// Evaluate condition string
function evaluateCondition(condition: string, context: HookContext): boolean {
  // Simple condition evaluation
  // Supports: ${env:VAR}, ${toolName}, ${filePath}

  const resolved = condition
    .replace(/\$\{env:(\w+)\}/g, (_, name) => process.env[name] ?? '')
    .replace(/\$\{toolName\}/g, context.toolName ?? '')
    .replace(/\$\{filePath\}/g, context.filePath ?? '')

  // Check if resolved condition is truthy
  return resolved.trim().length > 0
}

// Hook chaining - run output through multiple hooks
export async function chainHooks(
  types: HookType[],
  context: HookContext,
  config: HooksConfig = defaultHooksConfig
): Promise<{ outputs: unknown[]; blocked: boolean }> {
  const outputs: unknown[] = []
  let blocked = false

  for (const type of types) {
    const results = await executeHooks(type, context, config)

    for (const result of results) {
      if (result.modified?.output !== undefined) {
        outputs.push(result.modified.output)
        context.toolOutput = result.modified.output
      }
      if (result.modified?.blocked) {
        blocked = true
      }
    }

    if (blocked) break
  }

  return { outputs, blocked }
}

// YAML config loading
export async function loadHooksFromYAML(yamlPath: string): Promise<Hook[]> {
  try {
    const { readFile } = await import('node:fs/promises')
    const content = await readFile(yamlPath, 'utf-8')
    return parseHooksYAML(content)
  } catch {
    return []
  }
}

export function parseHooksYAML(content: string): Hook[] {
  const hooks: Hook[] = []
  const lines = content.split('\n')
  let currentHook: Partial<Hook> | null = null

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('- name:')) {
      if (currentHook?.name) {
        hooks.push(currentHook as Hook)
      }
      currentHook = {
        enabled: true,
        mode: 'non-blocking',
        type: 'PreToolUse', // Default
      }
      currentHook.name = trimmed.split(':')[1].trim()
    } else if (currentHook) {
      if (trimmed.startsWith('type:')) currentHook.type = trimmed.split(':')[1].trim() as HookType
      else if (trimmed.startsWith('command:')) currentHook.command = trimmed.split(':').slice(1).join(':').trim()
      else if (trimmed.startsWith('mode:')) currentHook.mode = (trimmed.split(':')[1].trim()) as HookMode
      else if (trimmed.startsWith('enabled:')) currentHook.enabled = trimmed.split(':')[1].trim() === 'true'
      else if (trimmed.startsWith('description:')) currentHook.description = trimmed.split(':').slice(1).join(':').trim()
      else if (trimmed.startsWith('condition:')) currentHook.condition = trimmed.split(':').slice(1).join(':').trim()
    }
  }

  if (currentHook?.name) {
    hooks.push(currentHook as Hook)
  }

  return hooks
}

// Pre-built hook factories
export function createReadHook(name: string, command: string, mode: HookMode = 'non-blocking'): Hook {
  return { name, type: 'PreRead', command, mode, enabled: true }
}

export function createEditHook(name: string, command: string, mode: HookMode = 'non-blocking'): Hook {
  return { name, type: 'PreEdit', command, mode, enabled: true }
}

export function createBashHook(name: string, command: string, mode: HookMode = 'non-blocking'): Hook {
  return { name, type: 'PreBash', command, mode, enabled: true }
}

export function createThinkHook(name: string, command: string, mode: HookMode = 'non-blocking'): Hook {
  return { name, type: 'Think', command, mode, enabled: true }
}

export function createAgentSubmitHook(name: string, command: string, mode: HookMode = 'non-blocking'): Hook {
  return { name, type: 'AgentSubmit', command, mode, enabled: true }
}

// Hook manager for lifecycle
export class HookManager {
  private config: HooksConfig
  private sessionId: string

  constructor(config: HooksConfig, sessionId: string) {
    this.config = config
    this.sessionId = sessionId

    // Register all configured hooks
    for (const hook of config.hooks) {
      registerHook(hook)
    }
  }

  async onToolUse(toolName: string, input: unknown, output?: unknown): Promise<HookResult[]> {
    const context: HookContext = {
      toolName,
      toolInput: input,
      toolOutput: output,
      sessionId: this.sessionId,
      cwd: this.config.workingDirectory,
      timestamp: Date.now(),
    }

    const pre = await executeHooks('PreToolUse', context, this.config)
    const post = output
      ? await executeHooks('PostToolUse', context, this.config)
      : []

    return [...pre, ...post]
  }

  async onRead(filePath: string, content: string): Promise<{ content: string; blocked: boolean }> {
    const context: HookContext = {
      filePath,
      fileContent: content,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }

    const pre = await executeHooks('PreRead', context, this.config)

    for (const result of pre) {
      if (result.modified?.blocked) {
        return { content: '', blocked: true }
      }
    }

    const post = await executeHooks('PostRead', context, this.config)
    for (const result of post) {
      if (result.modified?.output) {
        return { content: result.modified.output as string, blocked: false }
      }
    }

    return { content, blocked: false }
  }

  async onEdit(filePath: string, oldContent: string, newContent: string): Promise<{ content: string; blocked: boolean }> {
    const context: HookContext = {
      filePath,
      fileContent: newContent,
      toolInput: { oldContent },
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }

    const pre = await executeHooks('PreEdit', context, this.config)

    for (const result of pre) {
      if (result.modified?.blocked) {
        return { content: oldContent, blocked: true }
      }
      if (result.modified?.replaced) {
        newContent = result.modified.replaced
      }
    }

    await executeHooks('PostEdit', context, this.config)
    return { content: newContent, blocked: false }
  }

  async onThink(thinking: string): Promise<string> {
    const context: HookContext = {
      agentThinking: thinking,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }

    const results = await executeHooks('Think', context, this.config)

    for (const result of results) {
      if (result.modified?.output) {
        return result.modified.output as string
      }
    }

    return thinking
  }

  async onAgentSubmit(result: string): Promise<HookResult[]> {
    const context: HookContext = {
      agentResult: result,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    }

    return executeHooks('AgentSubmit', context, this.config)
  }

  destroy(): void {
    for (const hook of this.config.hooks) {
      unregisterHook(hook.name)
    }
  }
}