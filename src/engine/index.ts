// Engine - Core agent loop

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
}

// Token counting using simple approximation
export function countTokens(text: string): number {
  // Approximate: 1 token ≈ 4 chars for English
  // More accurate for code: 1 token ≈ 3.5 chars
  return Math.ceil(text.length / 4)
}

// Calculate total tokens for a conversation
export function calculateTotalTokens(messages: Message[]): number {
  return messages.reduce((sum, msg) => sum + countTokens(msg.content), 0)
}

// Check if compaction is needed (50K budget)
export function needsCompaction(
  messages: Message[],
  budget = 50_000
): boolean {
  return calculateTotalTokens(messages) > budget
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
    // Simulate async streaming delay
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
}

export async function runAgentLoop(
  messages: Message[],
  executeTool: (name: string, input: Record<string, unknown>) => Promise<unknown>,
  config: AgentLoopConfig = {}
): Promise<Message[]> {
  const {
    maxIterations = 10,
    timeout = 60000,
    compactionBudget = 50_000,
  } = config

  let iterations = 0
  const startTime = Date.now()

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

    // Check compaction
    if (needsCompaction(messages, compactionBudget)) {
      messages.push({
        role: 'system',
        content: 'Compaction triggered - context too large',
        timestamp: Date.now(),
      })
      break
    }

    iterations++
  }

  return messages
}

export default {
  createTurn,
  addToolCall,
  completeToolCall,
  countTokens,
  calculateTotalTokens,
  needsCompaction,
  runAgentLoop,
}