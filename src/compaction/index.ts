// Context Compaction System - 50K token budget with image stripping
// Based on Claude Code's compaction approach

export interface CompactionConfig {
  maxTokens: number          // Budget (default 50K)
  maxFilesToRestore: number  // Max files to restore (5)
  maxTokensPerFile: number   // Budget per restored file (5K)
  skillsTokenBudget: number  // Separate budget for skills (25K)
  stripImages: boolean       // Replace images with markers
  protectLastUserTurns: number  // Keep last N user turns (2)
}

export const defaultCompactionConfig: CompactionConfig = {
  maxTokens: 50_000,
  maxFilesToRestore: 5,
  maxTokensPerFile: 5_000,
  skillsTokenBudget: 25_000,
  stripImages: true,
  protectLastUserTurns: 2,
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  images?: string[]  // Image URLs
}

export interface CompactionResult {
  compactedMessages: Message[]
  removedMessages: number
  restoredFiles: string[]
  tokensSaved: number
}

// Count tokens (simple approximation)
function countTokens(text: string): number {
  return Math.ceil(text.length / 4) // ~4 chars per token
}

// Count tokens in messages
function countMessageTokens(messages: Message[]): number {
  return messages.reduce((sum, msg) => sum + countTokens(msg.content), 0)
}

// Check if compaction is needed
export function needsCompaction(
  messages: Message[],
  config: CompactionConfig = defaultCompactionConfig
): boolean {
  return countMessageTokens(messages) > config.maxTokens
}

// Strip images from content
function stripImages(content: string): string {
  // Remove image URLs and replace with marker
  return content.replace(/!\[.*?\]\(.*?\)/g, '[image]')
}

// Get messages to preserve (last user turns + important messages)
function getProtectedMessages(messages: Message[]): Message[] {
  const preserved: Message[] = []
  let userTurns = 0

  // Go through messages in reverse, stop when we hit enough user turns
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (!msg) continue

    if (msg.role === 'user') {
      userTurns++
      if (userTurns > defaultCompactionConfig.protectLastUserTurns) {
        break
      }
    }

    preserved.unshift(msg)
  }

  return preserved
}

// Compact messages to fit within budget
export function compact(
  messages: Message[],
  config: CompactionConfig = defaultCompactionConfig
): CompactionResult {
  if (!needsCompaction(messages, config)) {
    return {
      compactedMessages: messages,
      removedMessages: 0,
      restoredFiles: [],
      tokensSaved: 0,
    }
  }

  const originalTokens = countMessageTokens(messages)
  const preserved = getProtectedMessages(messages)
  const preservedTokens = countMessageTokens(preserved)

  // Calculate budget for earlier messages
  const availableTokens = config.maxTokens - preservedTokens

  // Group older messages by file/operation
  const groupedMessages = new Map<string, Message[]>()
  let currentGroup = ''
  let currentGroupTokens = 0

  for (let i = 0; i < messages.length - preserved.length; i++) {
    const msg = messages[i]
    if (!msg) continue

    const msgTokens = countTokens(msg.content)

    // Check if this is a tool result
    if (msg.role === 'assistant' && typeof msg.content === 'string' && msg.content.includes('Tool Use:')) {
      // Extract file name from tool use
      const fileMatch = msg.content.match(/File(?:Read|Edit|Write):\s*(\S+)/)
      if (fileMatch && fileMatch[1]) {
        currentGroup = fileMatch[1]
      }
    }

    if (currentGroupTokens + msgTokens <= availableTokens / 10) {
      // Add to current group
      if (!groupedMessages.has(currentGroup)) {
        groupedMessages.set(currentGroup, [])
      }

      const group = groupedMessages.get(currentGroup)
      if (group) {
        group.push(msg)
      }
      currentGroupTokens += msgTokens
    }
  }

  // Select files to restore (most recent changes)
  const filesToRestore: string[] = []
  for (const [file, msgs] of groupedMessages) {
    if (filesToRestore.length >= config.maxFilesToRestore) break
    if (file) {
      filesToRestore.push(file)
    }
  }

  // Build summary of removed content
  const summary = `[Compacted ${messages.length - preserved.length} earlier messages. Restored ${filesToRestore.length} files: ${filesToRestore.join(', ')}]`

  // Create compacted message
  const compactionSummary: Message = {
    role: 'system',
    content: summary,
    timestamp: Date.now(),
  }

  // Build final message list
  const compactedMessages = [compactionSummary, ...preserved]

  const newTokens = countMessageTokens(compactedMessages)
  const tokensSaved = originalTokens - newTokens

  return {
    compactedMessages,
    removedMessages: messages.length - compactedMessages.length,
    restoredFiles: filesToRestore,
    tokensSaved,
  }
}

// Micro compact - minor pruning without full compaction
export function microCompact(
  messages: Message[],
  targetTokens?: number
): Message[] {
  const currentTokens = countMessageTokens(messages)
  const target = targetTokens ?? currentTokens * 0.8 // Reduce by 20%

  if (currentTokens <= target) {
    return messages
  }

  const result: Message[] = []

  for (const msg of messages) {
    const tokens = countTokens(msg.content)

    if (tokens > 1000 && msg.role === 'assistant') {
      // Summarize long assistant responses
      const summary = msg.content.substring(0, 200) + '... [content summarized]'
      result.push({ ...msg, content: summary })
    } else {
      result.push(msg)
    }

    if (countMessageTokens(result) <= target) break
  }

  return result
}

// Check if message contains images
export function hasImages(message: Message): boolean {
  return (message.images && message.images.length > 0) ||
         message.content.includes('![')
}

// Strip all images from messages
export function stripAllImages(messages: Message[]): Message[] {
  return messages.map(msg => ({
    ...msg,
    content: stripImages(msg.content),
    images: undefined,
  }))
}

// Get compaction statistics
export function getCompactionStats(messages: Message[]): {
  totalTokens: number
  messageCount: number
  imageCount: number
  toolResultCount: number
  needsCompaction: boolean
} {
  let imageCount = 0
  let toolResultCount = 0

  for (const msg of messages) {
    if (hasImages(msg)) imageCount++
    if (msg.content.includes('Tool Use:')) toolResultCount++
  }

  const totalTokens = countMessageTokens(messages)

  return {
    totalTokens,
    messageCount: messages.length,
    imageCount,
    toolResultCount,
    needsCompaction: needsCompaction(messages),
  }
}

export default {
  needsCompaction,
  compact,
  microCompact,
  stripAllImages,
  hasImages,
  getCompactionStats,
  defaultCompactionConfig,
}