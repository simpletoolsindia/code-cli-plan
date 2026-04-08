import { z } from 'zod'
import { buildTool, type Tool } from './Tool.ts'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

// Input schema
const GlobToolInputSchema = z.object({
  pattern: z.string().describe('Glob pattern to match files (e.g., "**/*.ts")'),
  cwd: z.string().optional().describe('Working directory for search'),
  limit: z.number().optional().describe('Maximum number of results'),
})

export type GlobTool = Tool<typeof GlobToolInputSchema, GlobToolOutput>

export type GlobToolOutput = {
  files: string[]
  count: number
  pattern: string
}

// Glob implementation using node:fs
async function globFiles(
  pattern: string,
  cwd?: string,
  limit?: number
): Promise<GlobToolOutput> {
  const { readdirSync, statSync } = await import('node:fs')
  const { join, relative } = await import('node:path')

  const baseDir = cwd ?? process.cwd()
  const results: string[] = []

  // Simple glob matching
  function matches(filePath: string, pattern: string): boolean {
    const parts = pattern.split('/')
    const pathParts = filePath.split('/')

    let pathIndex = 0
    for (const part of parts) {
      if (part === '**') {
        // Match any number of directories
        const nextPart = parts[parts.indexOf(part) + 1]
        if (!nextPart) return true

        while (pathIndex < pathParts.length) {
          const remaining = pathParts.slice(pathIndex).join('/')
          if (matches(remaining, parts.slice(parts.indexOf(part) + 1).join('/'))) {
            return true
          }
          pathIndex++
        }
        return false
      } else if (part === '*') {
        // Match any single segment
        if (pathIndex >= pathParts.length) return false
        pathIndex++
      } else if (part.includes('*')) {
        // Match with wildcard
        const regex = new RegExp('^' + part.replace(/\*/g, '.*') + '$')
        if (pathIndex >= pathParts.length) return false
        if (!regex.test(pathParts[pathIndex])) return false
        pathIndex++
      } else {
        // Exact match
        if (pathIndex >= pathParts.length) return false
        if (pathParts[pathIndex] !== part) return false
        pathIndex++
      }
    }
    return pathIndex === pathParts.length
  }

  function walkDir(dir: string, depth = 0) {
    if (limit && results.length >= limit) return

    try {
      const entries = readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (limit && results.length >= limit) break

        const fullPath = join(dir, entry.name)
        const relativePath = relative(baseDir, fullPath)

        if (matches(relativePath, pattern)) {
          results.push(relativePath)
        }

        // Recurse into directories (limit depth to prevent infinite loops)
        if (entry.isDirectory() && depth < 20) {
          // Skip common ignored directories
          if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            walkDir(fullPath, depth + 1)
          }
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }

  walkDir(baseDir)

  return {
    files: results,
    count: results.length,
    pattern,
  }
}

// Build the GlobTool
export const GlobTool = buildTool({
  name: 'Glob',
  inputSchema: GlobToolInputSchema,

  isConcurrencySafe: (input) => true,

  isReadOnly: () => true,

  maxResultSizeChars: 50_000,

  userFacingName: (input) => `Glob ${input?.pattern ?? ''}`,

  searchHint: 'find files by pattern',

  isSearchOrReadCommand: () => ({ isSearch: true, isRead: false }),

  call: async (args, _context, _canUseTool) => {
    const result = await globFiles(args.pattern, args.cwd, args.limit)
    return { data: result }
  },

  description: async (input, _options) => {
    return `Find files matching: ${input.pattern}${input.limit ? ` (max ${input.limit} results)` : ''}`
  },

  renderToolUseMessage: (input, _options) => {
    return `Glob: ${input.pattern}`
  },

  mapToolResultToToolResultBlockParam: (content, _toolUseID) => {
    const { files, count } = content
    const fileList = files.slice(0, 100).join('\n')
    const more = files.length > 100 ? `\n... and ${files.length - 100} more` : ''
    return {
      type: 'tool_result',
      content: `Found ${count} files:\n\`\`\`\n${fileList}${more}\n\`\`\``,
    }
  },
})