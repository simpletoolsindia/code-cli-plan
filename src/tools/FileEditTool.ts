import { z } from 'zod'
import { buildTool, type Tool } from './Tool.ts'
import type { BashToolOutput } from './BashTool.ts'

// Input schema
const FileEditToolInputSchema = z.object({
  file_path: z.string().describe('Path to the file to edit'),
  old_string: z.string().describe('The exact text to replace (must match exactly)'),
  new_string: z.string().describe('The replacement text'),
})

export type FileEditTool = Tool<typeof FileEditToolInputSchema, FileEditToolOutput>

export type FileEditToolOutput = {
  success: boolean
  diff: string
  message: string
}

// Edit file helper using node:fs patch
async function editFile(
  filePath: string,
  oldString: string,
  newString: string
): Promise<FileEditToolOutput> {
  const { readFileSync, writeFileSync } = await import('node:fs')

  try {
    const content = readFileSync(filePath, 'utf-8')

    // Check if old_string exists
    if (!content.includes(oldString)) {
      return {
        success: false,
        diff: '',
        message: `Could not find the specified text in ${filePath}. Please check the exact content.`,
      }
    }

    // Perform replacement
    const newContent = content.replace(oldString, newString)

    // Calculate diff (simplified)
    const diff = `--- ${filePath}\n+++ ${filePath}\n@@ @@\n${oldString}\n=> ${newString}`

    // Write back
    writeFileSync(filePath, newContent, 'utf-8')

    return {
      success: true,
      diff,
      message: `Successfully edited ${filePath}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      diff: '',
      message: `Error editing file: ${message}`,
    }
  }
}

// Build the FileEditTool
export const FileEditTool = buildTool({
  name: 'Edit',
  aliases: ['FileEdit'],
  inputSchema: FileEditToolInputSchema,

  isConcurrencySafe: (input) => {
    // Single file edits to different files are safe
    return false // For now, disable concurrent edits to same file
  },

  isReadOnly: () => false,

  isDestructive: () => false, // Non-destructive edit

  maxResultSizeChars: 10_000,

  userFacingName: (input) => `Edit ${input?.file_path ?? 'file'}`,

  searchHint: 'edit file content',

  call: async (args, _context, _canUseTool) => {
    const result = await editFile(args.file_path, args.old_string, args.new_string)
    return { data: result }
  },

  description: async (input, _options) => {
    return `Edit file: ${input.file_path}\nReplace: "${input.old_string.substring(0, 50)}..."\nWith: "${input.new_string.substring(0, 50)}..."`
  },

  renderToolUseMessage: (input, _options) => {
    return `Edit: ${input.file_path}`
  },

  mapToolResultToToolResultBlockParam: (content, _toolUseID) => {
    const { success, message, diff } = content
    if (!success) {
      return {
        type: 'tool_result',
        content: `❌ ${message}`,
      }
    }
    return {
      type: 'tool_result',
      content: `✅ ${message}\n\`\`\`diff\n${diff}\n\`\`\``,
    }
  },
})