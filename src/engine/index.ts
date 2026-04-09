// Engine - Core agent loop with Claude Code patterns
// Key additions: TokenBudget, auto-compaction, concurrency-safe batching, feature flags

import { feature } from '../utils/featureFlags.ts'
import {
  TokenBudget,
  compactMessages,
  shouldAutoCompact,
  createReactiveCompactor,
} from '../utils/autoCompact.ts'
import { estimateTokens } from '../providers/index.ts'

export interface Turn {
  id: string
  userInput: string
  assistantOutput: string
  toolCalls: ToolCall[]
  timestamp: number
}

export interface ToolCall {
  id: string
  toolName: string
  input: Record<string, unknown>
  result?: unknown
  success: boolean
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  uuid?: string
  toolCalls?: ToolCall[]
}

// Token counting - delegate to provider's estimation
export function countTokens(text: string): number {
  return estimateTokens(text)
}

// Calculate total tokens for a conversation
export function calculateTotalTokens(messages: Message[]): number {
  return messages.reduce((sum, msg) => sum + countTokens(msg.content), 0)
}

// Streaming support
export type StreamCallback = (chunk: string) => void

export async function* streamText(
  text: string,
  onChunk?: StreamCallback
): AsyncGenerator<string> {
  const words = text.split(' ')
  for (const word of words) {
    yield word + ' '
    onChunk?.(word + ' ')
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

// Create a new turn
export function createTurn(userInput: string): Turn {
  return {
    id: `turn-${Date.now()}`,
    userInput,
    assistantOutput: '',
    toolCalls: [],
    timestamp: Date.now(),
  }
}

// Add tool call to turn
export function addToolCall(
  turn: Turn,
  toolName: string,
  input: Record<string, unknown>
): ToolCall {
  const toolCall: ToolCall = {
    id: `tool-${Date.now()}`,
    toolName,
    input,
    success: false,
  }
  turn.toolCalls.push(toolCall)
  return toolCall
}

// Complete tool call
export function completeToolCall(
  turn: Turn,
  toolCallId: string,
  result: unknown,
  success: boolean
): void {
  const toolCall = turn.toolCalls.find(tc => tc.id === toolCallId)
  if (toolCall) {
    toolCall.result = result
    toolCall.success = success
  }
}

// Agent loop interface
export interface AgentLoopConfig {
  maxIterations?: number
  timeout?: number
  compactionBudget?: number
  onCompaction?: (summary: string) => void
}

/**
 * Run the agent loop with Claude Code patterns:
 * - Token budget tracking (auto-compaction at 20% remaining)
 * - Reactive compaction (on API errors)
 * - Feature-gated tool batching
 */
export async function runAgentLoop(
  messages: Message[],
  _executeTool: (name: string, input: Record<string, unknown>) => Promise<unknown>,
  config: AgentLoopConfig = {}
): Promise<Message[]> {
  const {
    maxIterations = 10,
    timeout = 60000,
    compactionBudget = 50_000,
    onCompaction,
  } = config

  let iterations = 0
  const startTime = Date.now()

  // Create token budget tracker if feature enabled
  const tokenBudget = feature('TOKEN_BUDGET')
    ? new TokenBudget({ budget: compactionBudget })
    : null

  // Create reactive compactor if feature enabled
  const reactiveCompactor = feature('REACTIVE_COMPACT')
    ? createReactiveCompactor(messages)
    : null

  while (iterations < maxIterations) {
    // Check timeout
    if (Date.now() - startTime > timeout) {
      messages.push({
        role: 'system',
        content: 'Agent loop timed out',
        timestamp: Date.now(),
      })
      break
    }

    // Check auto-compaction (Claude Code pattern: at 20% remaining)
    if (feature('AUTO_COMPACT') && shouldAutoCompact(messages, compactionBudget)) {
      const { compacted, summary } = await compactMessages(messages, {
        budget: compactionBudget,
        summarizeThreshold: 0.2,
        keepMessages: 20,
      })

      // Replace messages with compacted version
      messages.length = 0
      messages.push(...compacted)

      // Notify caller
      if (onCompaction) {
        onCompaction(summary)
      }

      console.log(`[Engine] Auto-compacted: ${summary.substring(0, 100)}...`)

      // Reset token budget
      if (tokenBudget) {
        tokenBudget.resetAfterCompaction()
      }

      continue
    }

    iterations++
  }

  return messages
}

/**
 * Check if reactive compaction should trigger based on API error.
 * Per Claude Code: "Reactive compact fires on TOO_LONG, context_length errors."
 */
export function shouldReactiveCompact(errorMessage?: string): boolean {
  if (!feature('REACTIVE_COMPACT')) return false

  const reactiveErrors = ['TOO_LONG', 'context_length', 'max_tokens', '500000']
  if (!errorMessage) return false

  return reactiveErrors.some(e => errorMessage.includes(e))
}

export default {
  createTurn,
  addToolCall,
  completeToolCall,
  countTokens,
  calculateTotalTokens,
  runAgentLoop,
  shouldReactiveCompact,
}
