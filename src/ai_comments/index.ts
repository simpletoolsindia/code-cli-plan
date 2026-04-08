// AI Comments System - Inline AI commands via special comments
// Based on Aider's // ai! and // ai? comment patterns

export type AICommentType = 'execute' | 'ask' | 'refactor' | 'explain'

export interface AIComment {
  type: AICommentType
  content: string
  line: number
  file: string
  context: {
    startLine: number
    endLine: number
    code: string
  }
}

export interface AICommentMatch {
  pattern: RegExp
  type: AICommentType
  description: string
}

// AI comment patterns
export const AI_COMMENT_PATTERNS: AICommentMatch[] = [
  {
    pattern: /\/\/\s*ai\s*!/,
    type: 'execute',
    description: 'Execute as AI command',
  },
  {
    pattern: /\/\/\s*ai\s*\?/,
    type: 'ask',
    description: 'Ask about this code',
  },
  {
    pattern: /#\s*ai\s*\?/,
    type: 'ask',
    description: 'Ask about this code (Python style)',
  },
  {
    pattern: /\/\/\s*ai\s*r\s*:/,
    type: 'refactor',
    description: 'Refactor this code',
  },
  {
    pattern: /\/\/\s*ai\s*e\s*:/,
    type: 'explain',
    description: 'Explain this code',
  },
]

// Extract all AI comments from content
export function extractAIComments(
  content: string,
  filePath: string
): AIComment[] {
  const comments: AIComment[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const { pattern, type } of AI_COMMENT_PATTERNS) {
      if (pattern.test(line)) {
        // Extract the comment content (after the AI marker)
        const match = line.match(pattern)
        if (match) {
          const commandStart = match.index! + match[0].length
          const command = line.substring(commandStart).trim()

          // Get surrounding context (5 lines before and after)
          const startLine = Math.max(0, i - 5)
          const endLine = Math.min(lines.length - 1, i + 5)
          const contextCode = lines.slice(startLine, endLine + 1).join('\n')

          comments.push({
            type,
            content: command || getDefaultCommand(type),
            line: i + 1,
            file: filePath,
            context: {
              startLine: startLine + 1,
              endLine: endLine + 1,
              code: contextCode,
            },
          })
        }
      }
    }
  }

  return comments
}

// Get default command based on type
function getDefaultCommand(type: AICommentType): string {
  switch (type) {
    case 'execute':
      return 'implement the code above'
    case 'ask':
      return 'explain this code'
    case 'refactor':
      return 'refactor this code for better quality'
    case 'explain':
      return 'explain how this code works'
    default:
      return ''
  }
}

// Check if file contains AI comments
export function hasAIComments(content: string): boolean {
  for (const { pattern } of AI_COMMENT_PATTERNS) {
    if (pattern.test(content)) {
      return true
    }
  }
  return false
}

// Get comment type
export function getCommentType(line: string): AICommentType | null {
  for (const { pattern, type } of AI_COMMENT_PATTERNS) {
    if (pattern.test(line)) {
      return type
    }
  }
  return null
}

// File watcher integration
export interface FileWatcher {
  watch(paths: string[], callback: (event: FileEvent) => void): void
  unwatch(paths: string[]): void
  close(): void
}

export interface FileEvent {
  type: 'add' | 'change' | 'unlink'
  path: string
  comments: AIComment[]
}

// Simple file watcher using fs.watch
export class AICommentsWatcher {
  private watchers: Map<string, ReturnType<typeof import('fs').watch>> = new Map()
  private callbacks: ((event: FileEvent) => void)[] = []
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()
  private contentCache: Map<string, string> = new Map()

  constructor(private debounceMs = 500) {}

  watch(paths: string[], callback: (event: FileEvent) => void): void {
    const fs = require('fs')
    const path = require('path')

    this.callbacks.push(callback)

    for (const filePath of paths) {
      if (this.watchers.has(filePath)) continue

      try {
        // Store initial content
        const content = fs.readFileSync(filePath, 'utf-8')
        this.contentCache.set(filePath, content)

        const dir = path.dirname(filePath)
        const filename = path.basename(filePath)

        const watcher = fs.watch(dir, (eventType: string, filename: string) => {
          if (filename !== filePath.split('/').pop()) return

          // Debounce
          const existing = this.debounceTimers.get(filePath)
          if (existing) clearTimeout(existing)

          const timer = setTimeout(() => {
            this.debounceTimers.delete(filePath)
            this.handleChange(filePath, eventType)
          }, this.debounceMs)

          this.debounceTimers.set(filePath, timer)
        })

        this.watchers.set(filePath, watcher)
      } catch (e) {
        console.error(`Failed to watch ${filePath}:`, e)
      }
    }
  }

  private handleChange(filePath: string, eventType: string): void {
    const fs = require('fs')

    try {
      if (eventType === 'unlink') {
        this.contentCache.delete(filePath)
        const event: FileEvent = {
          type: 'unlink',
          path: filePath,
          comments: [],
        }
        this.callbacks.forEach(cb => cb(event))
        return
      }

      const newContent = fs.readFileSync(filePath, 'utf-8')
      const oldContent = this.contentCache.get(filePath)

      // Detect actual changes
      if (oldContent === newContent) return

      const comments = extractAIComments(newContent, filePath)
      this.contentCache.set(filePath, newContent)

      // Check if AI comments were added
      const oldComments = extractAIComments(oldContent ?? '', filePath)

      if (comments.length > oldComments.length) {
        const event: FileEvent = {
          type: 'change',
          path: filePath,
          comments: comments.slice(oldComments.length),
        }
        this.callbacks.forEach(cb => cb(event))
      }
    } catch (e) {
      console.error(`Error handling change for ${filePath}:`, e)
    }
  }

  unwatch(paths: string[]): void {
    for (const filePath of paths) {
      const watcher = this.watchers.get(filePath)
      if (watcher) {
        watcher.close()
        this.watchers.delete(filePath)
      }
      this.contentCache.delete(filePath)
    }
  }

  close(): void {
    for (const [, watcher] of this.watchers) {
      watcher.close()
    }
    this.watchers.clear()
    this.contentCache.clear()
    this.callbacks = []

    for (const [, timer] of this.debounceTimers) {
      clearTimeout(timer)
    }
    this.debounceTimers.clear()
  }
}

// AI comment executor
export interface AICommandExecutor {
  execute(comment: AIComment): Promise<AICommandResult>
}

export interface AICommandResult {
  success: boolean
  output?: string
  error?: string
  edits?: string[]
}

// Execute AI comment command
export async function executeAIComment(
  comment: AIComment,
  executor: AICommandExecutor
): Promise<AICommandResult> {
  return executor.execute(comment)
}

// Build prompt from comment context
export function buildContextPrompt(comment: AIComment): string {
  return `
File: ${comment.file}
Lines: ${comment.context.startLine}-${comment.context.endLine}

Code context:
\`\`\`
${comment.context.code}
\`\`\`

Task: ${comment.content}
`
}

export default {
  AI_COMMENT_PATTERNS,
  extractAIComments,
  hasAIComments,
  getCommentType,
  AICommentsWatcher,
  executeAIComment,
  buildContextPrompt,
}
