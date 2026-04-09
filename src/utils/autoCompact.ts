// Auto-Compaction System - Token budget management and message summarization
// Based on Claude Code's compact.js + autoCompact.js patterns
// Key insight: Keep context under budget by summarizing old messages

import type { Message } from '../engine/index.ts'
import { estimateTokens } from '../providers/index.ts'

export interface CompactConfig {
  /** Token budget for the entire session (default: 50K) */
  budget: number
  /** Warning threshold (default: 80%) */
  warningThreshold: number
  /** Summarize when remaining budget drops below this (default: 20%) */
  summarizeThreshold: number
  /** Max messages to keep after compaction */
  keepMessages: number
}

export const defaultCompactConfig: CompactConfig = {
  budget: 50_000,
  warningThreshold: 0.8,
  summarizeThreshold: 0.2,
  keepMessages: 20,
}

export type CompactState = {
  isCompactPending: boolean
  lastCompactAt: number | null
  tokensUsed: number
  budgetRemaining: number
}

/**
 * Token budget tracker.
 * Per Claude Code: "500K auto-continue feature - cumulative tracking across compactions."
 */
export class TokenBudget {
  private totalTokens = 0
  private readonly budget: number
  private compactCount = 0
  private readonly config: CompactConfig

  constructor(config: Partial<CompactConfig> = {}) {
    this.config = { ...defaultCompactConfig, ...config }
    this.budget = this.config.budget
  }

  /** Add tokens from a message */
  addTokens(text: string): void {
    this.totalTokens += estimateTokens(text)
  }

  /** Get current usage percentage */
  getUsage(): number {
    return this.totalTokens / this.budget
  }

  /** Get remaining budget */
  getRemaining(): number {
    return Math.max(0, this.budget - this.totalTokens)
  }

  /** Check if compaction should trigger */
  needsCompaction(): boolean {
    return this.totalTokens >= this.budget * this.config.summarizeThreshold
  }

  /** Check if warning should be shown */
  needsWarning(): boolean {
    return this.getUsage() >= this.config.warningThreshold
  }

  /** Get compact state for tracking */
  getState(): CompactState {
    return {
      isCompactPending: this.needsCompaction(),
      lastCompactAt: null,
      tokensUsed: this.totalTokens,
      budgetRemaining: this.getRemaining(),
    }
  }

  /** Reset after compaction */
  resetAfterCompaction(): void {
    this.compactCount++
    // After compaction, we keep some messages but reset token count
    // In a real implementation, you'd track this differently
    this.totalTokens = Math.floor(this.totalTokens * 0.3) // Keep 30% as baseline
  }

  /** Get budget info */
  getInfo(): {
    total: number
    used: number
    remaining: number
    usage: number
    compactCount: number
  } {
    return {
      total: this.budget,
      used: this.totalTokens,
      remaining: this.getRemaining(),
      usage: this.getUsage(),
      compactCount: this.compactCount,
    }
  }
}

/**
 * Summarize messages for compaction.
 * Per Claude Code: "Compaction triggers at 20% remaining budget."
 *
 * Strategy: Keep recent messages, summarize older ones into a context summary.
 */
export async function summarizeMessages(
  messages: Message[],
  keepCount: number,
): Promise<{ summary: string; kept: Message[] }> {
  if (messages.length <= keepCount) {
    return { summary: '', kept: messages }
  }

  // Keep the most recent messages (they have the freshest context)
  const kept = messages.slice(-keepCount)
  const toSummarize = messages.slice(0, -keepCount)

  if (toSummarize.length === 0) {
    return { summary: '', kept }
  }

  // Build a summary of what happened
  const toolCalls = toSummarize.filter(m => m.role === 'assistant')
    .map(m => {
      // Try to extract tool call info
      const content = m.content
      if (typeof content === 'string') {
        // Try to find tool names in the content
        const toolPattern = /Using (\w+) tool/gi
        const tools: string[] = []
        let match
        while ((match = toolPattern.exec(content)) !== null) {
          if (match[1]) tools.push(match[1])
        }
        return tools.length > 0 ? tools.join(', ') : null
      }
      return null
    })
    .filter(Boolean)

  const userMessages = toSummarize.filter(m => m.role === 'user')
  const assistantMessages = toSummarize.filter(m => m.role === 'assistant')

  const summary = [
    `[Earlier conversation: ${assistantMessages.length} assistant turns, ${userMessages.length} user messages]`,
    toolCalls.length > 0 ? `[Tools used: ${[...new Set(toolCalls)].join(', ')}]` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return { summary, kept }
}

/**
 * Compact messages to stay within token budget.
 * Per Claude Code: "Context too large - running compaction."
 */
export async function compactMessages(
  messages: Message[],
  config: Partial<CompactConfig> = {},
): Promise<{ compacted: Message[]; summary: string }> {
  const cfg = { ...defaultCompactConfig, ...config }

  const { summary, kept } = await summarizeMessages(messages, cfg.keepMessages)

  // Build compacted message list with summary as a system message
  const compacted: Message[] = []

  if (summary) {
    compacted.push({
      role: 'system',
      content: `[Previous context summarized:\n${summary}\n]`,
      timestamp: Date.now(),
    })
  }

  compacted.push(...kept)

  return { compacted, summary }
}

/**
 * Check if auto-compaction should run.
 * Per Claude Code: "Token warning at 80%, compaction at 20% remaining."
 */
export function shouldAutoCompact(
  messages: Message[],
  budget: number,
  threshold: number = 0.2,
): boolean {
  const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0)
  const usage = totalTokens / budget
  return usage >= (1 - threshold)
}

/**
 * Create a reactive compaction checker.
 * Per Claude Code: "Reactive compact fires on API errors (prompt_too_long, etc.)"
 */
export function createReactiveCompactor(
  messages: Message[],
  config: Partial<CompactConfig> = {},
) {
  const cfg = { ...defaultCompactConfig, ...config }
  let lastCheck = Date.now()

  return {
    /**
     * Check if reactive compaction should trigger based on an API error.
     */
    shouldReact(errorMessage?: string): boolean {
      // Only react to specific errors
      const reactiveErrors = ['TOO_LONG', 'context_length', 'max_tokens']
      if (!errorMessage || !reactiveErrors.some(e => errorMessage.includes(e))) {
        return false
      }

      // Rate limit: don't react more than once per 10 seconds
      if (Date.now() - lastCheck < 10_000) {
        return false
      }

      lastCheck = Date.now()
      return true
    },

    /**
     * Get current state.
     */
    getState(): { pending: boolean; budgetUsed: number } {
      const totalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0)
      return {
        pending: totalTokens >= cfg.budget * cfg.summarizeThreshold,
        budgetUsed: totalTokens,
      }
    },
  }
}
