import { z } from 'zod'
import { buildTool, type Tool } from './Tool.ts'

// Input schema
const FileReadToolInputSchema = z.object({
  filePath: z.string().describe('Path to the file to read').optional(),
  file_path: z.string().describe('Path to the file to read (alternative)').optional(),
  limit: z.number().optional().describe('Maximum number of lines to read'),
  offset: z.number().optional().describe('Line offset to start reading from'),
})

// Get file path from input (handle both naming conventions)
function getFilePath(input: z.infer<typeof FileReadToolInputSchema>): string | undefined {
  return input.filePath ?? input.file_path ?? (input as any).path
}

// Constants
const MAX_FILE_SIZE = 1_000_000 // 1MB
const MAX_LINES = 10_000

export type FileReadTool = Tool<typeof FileReadToolInputSchema, FileReadToolOutput>

export type FileReadToolOutput = {
  content: string
  lines: number
  truncated: boolean
}

// Read file helper
async function readFile(
  input: z.infer<typeof FileReadToolInputSchema>,
): Promise<FileReadToolOutput> {
  const filePath = getFilePath(input)
  if (!filePath) {
    return {
      content: 'Error: No file path provided. Use filePath or file_path parameter.',
      lines: 0,
      truncated: false,
    }
  }

  const { readFileSync, statSync } = await import('node:fs')

  try {
    // Check file size
    const stats = statSync(filePath)
    if (stats.size > MAX_FILE_SIZE) {
      return {
        content: `File too large (${(stats.size / 1024 / 1024).toFixed(2)} MB). Maximum size is 1MB.`,
        lines: 0,
        truncated: true,
      }
    }

    // Read file
    let content = readFileSync(filePath, 'utf-8')
    const totalLines = content.split('\n').length

    // Apply offset and limit
    const lines = content.split('\n')
    let startIndex = input.offset ?? 0

    // Negative offset from end
    if (input.offset && input.offset < 0) {
      startIndex = Math.max(0, totalLines + input.offset)
    }

    const endIndex = input.limit ? Math.min(startIndex + input.limit, totalLines) : totalLines
    const selectedLines = lines.slice(startIndex, endIndex)

    content = selectedLines.join('\n')
    const truncated = endIndex < totalLines

    return {
      content,
      lines: selectedLines.length,
      truncated,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: `Error reading file: ${message}`,
      lines: 0,
      truncated: false,
    }
  }
}

// Build the FileReadTool
export const FileReadTool = buildTool({
  name: 'Read',
  aliases: ['FileRead', 'cat'],
  inputSchema: FileReadToolInputSchema,

  isConcurrencySafe: () => true,

  isReadOnly: () => true,

  maxResultSizeChars: 500_000,

  userFacingName: (input) => input?.filePath ?? 'Read',

  searchHint: 'read file content',

  call: async (args, _context, _canUseTool) => {
    const result = await readFile(args)
    return { data: result }
  },

  description: async (input, _options) => {
    return `Read file: ${input.filePath}${input.limit ? ` (limit: ${input.limit} lines)` : ''}`
  },

  renderToolUseMessage: (input, _options) => {
    return `Read: ${input.filePath}`
  },

  mapToolResultToToolResultBlockParam: (content, _toolUseID) => {
    const { content: fileContent, lines, truncated } = content
    let display = fileContent
    if (truncated) {
      display += `\n... (${lines} lines shown)`
    }
    return {
      type: 'tool_result',
      content: display,
    }
  },
})