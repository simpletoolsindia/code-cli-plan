import { z } from 'zod'
import { buildTool, type Tool } from './Tool.ts'

// Input schema
const BashToolInputSchema = z.object({
  command: z.string().describe('Shell command to execute'),
  timeout: z.number().optional().describe('Timeout in milliseconds'),
})

// Tool definition
export type BashTool = Tool<typeof BashToolInputSchema, BashToolOutput>

export type BashToolOutput = {
  stdout: string
  stderr: string
  exitCode: number
  timedOut?: boolean
}

// Helper to check if command is read-only
function isReadOnlyCommand(command: string): boolean {
  const readOnlyCommands = [
    'ls', 'cat', 'head', 'tail', 'grep', 'rg', 'find', 'wc', 'stat',
    'file', 'tree', 'du', 'which', 'whereis', 'echo', 'pwd', 'cd'
  ]

  const trimmed = command.trim()
  const firstWord = trimmed.split(/\s+/)[0] ?? ''

  // Check for pipes
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|')
    return parts.every(part => {
      const cmd = part.trim().split(/\s+/)[0] ?? ''
      return readOnlyCommands.includes(cmd)
    })
  }

  return readOnlyCommands.includes(firstWord)
}

// Helper to check if command is dangerous
function isDangerousCommand(command: string): boolean {
  const dangerousPatterns = [
    /rm\s+-rf\s+\//,
    /rm\s+-rf\s+\*\s*$/,
    /format\s+/i,
    /mkfs/i,
    /dd\s+if=/i,
  ]

  return dangerousPatterns.some(pattern => pattern.test(command))
}

// Shell execution helper
async function executeCommand(
  command: string,
  timeout?: number
): Promise<BashToolOutput> {
  const { spawn } = await import('node:child_process')

  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let settled = false

    const timeoutId = timeout ? setTimeout(() => {
      if (!settled) {
        settled = true
        resolve({ stdout, stderr, exitCode: 124, timedOut: true })
      }
    }, timeout) : undefined

    const cmd = command.trim().split(/\s+/)[0] ?? 'sh'
    const args = command.trim().split(/\s+/).slice(1)

    const child = spawn(cmd, args, {
      shell: true,
      cwd: process.cwd(),
      env: process.env as Record<string, string>,
    })

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (!settled) {
        settled = true
        clearTimeout(timeoutId)
        resolve({ stdout, stderr, exitCode: code ?? 1 })
      }
    })

    child.on('error', (err) => {
      if (!settled) {
        settled = true
        clearTimeout(timeoutId)
        resolve({ stdout, stderr, exitCode: 1 })
      }
    })
  })
}

// Build the BashTool
export const BashTool = buildTool({
  name: 'Bash',
  inputSchema: BashToolInputSchema,

  isConcurrencySafe: (input) => isReadOnlyCommand(input.command),

  isReadOnly: (input) => isReadOnlyCommand(input.command),

  isDestructive: (input) => isDangerousCommand(input.command),

  maxResultSizeChars: 100_000,

  userFacingName: () => 'Bash',

  call: async (args, _context, _canUseTool) => {
    const result = await executeCommand(args.command, args.timeout)
    return { data: result }
  },

  description: async (input) => {
    const base = `Execute shell command: ${input.command}`
    const isRead = isReadOnlyCommand(input.command)
    return isRead
      ? `${base} (read-only)`
      : base
  },

  renderToolUseMessage: (input) => {
    return `Bash: ${input.command}`
  },

  mapToolResultToToolResultBlockParam: (content, _toolUseID) => {
    const { stdout, stderr, exitCode, timedOut } = content
    const lines = [`$ ${stdout || ''}`, stderr ? `⚠️ ${stderr}` : '']
    if (timedOut) lines.push('⏱️ Command timed out')
    if (exitCode !== 0) lines.push(`Exit: ${exitCode}`)
    return { type: 'tool_result' as const, content: lines.filter(Boolean).join('\n') }
  },
})
