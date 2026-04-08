import { z } from 'zod'
import { buildTool, type Tool } from './Tool.ts'

// Input schema
const GrepToolInputSchema = z.object({
  pattern: z.string().describe('Search pattern (regex supported)'),
  files: z.array(z.string()).optional().describe('Files to search in (defaults to all files)'),
  cwd: z.string().optional().describe('Working directory for search'),
  case_sensitive: z.boolean().optional().default(true).describe('Case sensitive search'),
  whole_word: z.boolean().optional().default(false).describe('Match whole word only'),
  context: z.number().optional().default(0).describe('Lines of context to show'),
  limit: z.number().optional().describe('Maximum number of results'),
})

export type GrepTool = Tool<typeof GrepToolInputSchema, GrepToolOutput>

export type GrepToolOutput = {
  matches: GrepMatch[]
  total: number
  searchedFiles: number
}

export type GrepMatch = {
  file: string
  line: number
  content: string
  context: string[]
}

// Grep implementation
async function grepFiles(
  pattern: string,
  files?: string[],
  cwd?: string,
  caseSensitive = true,
  wholeWord = false,
  context = 0,
  limit?: number
): Promise<GrepToolOutput> {
  const { readdirSync, statSync, readFileSync } = await import('node:fs')
  const { join, relative } = await import('node:path')

  const baseDir = cwd ?? process.cwd()
  const matches: GrepMatch[] = []
  let searchedFiles = 0

  // Build regex pattern
  let regexPattern = caseSensitive ? pattern : pattern.toLowerCase()
  if (wholeWord) {
    regexPattern = `\\b${regexPattern}\\b`
  }

  let regex: RegExp
  try {
    regex = new RegExp(regexPattern, caseSensitive ? 'g' : 'gi')
  } catch {
    return {
      matches: [],
      total: 0,
      searchedFiles: 0,
    }
  }

  // Get list of files to search
  const fileList: string[] = []

  if (files && files.length > 0) {
    fileList.push(...files)
  } else {
    // Recursively find all text files
    function walkDir(dir: string, depth = 0) {
      if (depth > 10) return // Limit depth

      try {
        const entries = readdirSync(dir, { withFileTypes: true })

        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name === '.git') continue

          const fullPath = join(dir, entry.name)

          if (entry.isDirectory()) {
            walkDir(fullPath, depth + 1)
          } else {
            // Check if it's a text file
            const ext = entry.name.split('.').pop()?.toLowerCase()
            if (['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'txt', 'yaml', 'yml', 'css', 'html'].includes(ext ?? '')) {
              fileList.push(fullPath)
            }
          }
        }
      } catch {
        // Skip inaccessible
      }
    }

    walkDir(baseDir)
  }

  // Search each file
  for (const filePath of fileList) {
    if (limit && matches.length >= limit) break

    try {
      const stats = statSync(filePath)
      if (stats.size > 5_000_000) continue // Skip files > 5MB

      const content = readFileSync(filePath, 'utf-8')
      searchedFiles++

      const lines = content.split('\n')
      let lineNum = 0
      let matchCount = 0

      for (const line of lines) {
        lineNum++
        const searchLine = caseSensitive ? line : line.toLowerCase()
        const searchPattern = caseSensitive ? pattern : pattern.toLowerCase()

        if (wholeWord) {
          const regexWhole = new RegExp(`\\b${searchPattern}\\b`, caseSensitive ? '' : 'i')
          if (!regexWhole.test(line)) continue
        } else {
          if (!searchLine.includes(searchPattern)) continue
        }

        // Get context lines
        const contextLines: string[] = []
        if (context > 0) {
          const start = Math.max(0, lineNum - context - 1)
          const end = Math.min(lines.length, lineNum + context)
          for (let i = start; i < end; i++) {
            if (i !== lineNum - 1) {
              contextLines.push(`${i + 1}: ${lines[i]}`)
            }
          }
        }

        matches.push({
          file: relative(baseDir, filePath),
          line: lineNum,
          content: line,
          context: contextLines,
        })

        matchCount++
        if (limit && matches.length >= limit) break
      }
    } catch {
      // Skip unreadable files
    }
  }

  return {
    matches,
    total: matches.length,
    searchedFiles,
  }
}

// Build the GrepTool
export const GrepTool = buildTool({
  name: 'Grep',
  inputSchema: GrepToolInputSchema,

  isConcurrencySafe: (input) => true,

  isReadOnly: () => true,

  maxResultSizeChars: 100_000,

  userFacingName: (input) => `Grep "${input?.pattern ?? ''}"`,

  searchHint: 'search file contents',

  isSearchOrReadCommand: () => ({ isSearch: true, isRead: false }),

  call: async (args, _context, _canUseTool) => {
    const result = await grepFiles(
      args.pattern,
      args.files,
      args.cwd,
      args.case_sensitive,
      args.whole_word,
      args.context,
      args.limit
    )
    return { data: result }
  },

  description: async (input, _options) => {
    return `Search for: "${input.pattern}"${input.files ? ` in ${input.files.length} files` : ''}`
  },

  renderToolUseMessage: (input, _options) => {
    return `Grep: "${input.pattern}"`
  },

  mapToolResultToToolResultBlockParam: (content, _toolUseID) => {
    const { matches, total, searchedFiles } = content

    if (matches.length === 0) {
      return {
        type: 'tool_result',
        content: `No matches found for "${content.matches.length > 0 ? 'pattern' : '?'}" in ${searchedFiles} files`,
      }
    }

    const output = matches.slice(0, 50).map(m => {
      const ctx = m.context.length > 0 ? `\n  Context: ${m.context.slice(0, 3).join('\n  ')}` : ''
      return `${m.file}:${m.line}: ${m.content}${ctx}`
    }).join('\n')

    const more = matches.length > 50 ? `\n... and ${matches.length - 50} more matches` : ''

    return {
      type: 'tool_result',
      content: `Found ${total} matches in ${searchedFiles} files:\n\`\`\`\n${output}${more}\n\`\`\``,
    }
  },
})