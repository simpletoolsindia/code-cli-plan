// Tool Orchestration - Concurrency-safe tool execution batching
// Based on Claude Code's toolOrchestration.ts pattern
// Key insight: Read-only tools can run in parallel; side-effect tools run serially

import type { Tool, ToolUseContext, CanUseToolFn } from '../tools/Tool.ts'
import type { Message } from '../engine/index.ts'

export type ToolUseBlock = {
  id: string
  name: string
  input: Record<string, unknown>
}

export type MessageUpdate = {
  message?: unknown
  newContext: ToolUseContext
}

/**
 * Find a tool by name from the available tools.
 */
export function findToolByName(tools: Tool[], name: string): Tool | undefined {
  return tools.find(t => t.name === name || t.aliases?.includes(name))
}

/**
 * Batch type: either a single non-concurrency-safe tool, or multiple read-only tools.
 * Based on Claude Code's partitionToolCalls() pattern.
 */
interface Batch {
  isConcurrencySafe: boolean
  blocks: ToolUseBlock[]
}

/**
 * Partition tool calls into batches where:
 * 1. Each batch is either a single non-read-only tool, OR
 * 2. Multiple consecutive read-only (concurrency-safe) tools
 *
 * This allows read-only tools to run in parallel while ensuring
 * side-effect tools (writes, mutations) run one at a time.
 *
 * Per Claude Code: "Without this, tool uses run sequentially even when independent."
 * Max concurrent: 10 (configurable via env)
 */
export function partitionToolCalls(
  toolUseBlocks: ToolUseBlock[],
  toolUseContext: ToolUseContext,
): Batch[] {
  return toolUseBlocks.reduce((acc: Batch[], toolUse) => {
    const tool = findToolByName(toolUseContext.options.tools, toolUse.name)

    // Validate input and check concurrency safety
    let isConcurrencySafe = false
    if (tool) {
      try {
        const parsed = tool.inputSchema.safeParse(toolUse.input)
        if (parsed.success) {
          isConcurrencySafe = tool.isConcurrencySafe(parsed.data)
        }
        // If validation fails, treat as non-concurrency-safe to be conservative
      } catch {
        isConcurrencySafe = false
      }
    }

    // Group consecutive concurrency-safe tools together
    if (isConcurrencySafe && acc[acc.length - 1]?.isConcurrencySafe) {
      acc[acc.length - 1]!.blocks.push(toolUse)
    } else {
      acc.push({ isConcurrencySafe, blocks: [toolUse] })
    }

    return acc
  }, [])
}

/**
 * Get max concurrent tool executions.
 * Per Claude Code: Default 10, configurable via env var.
 */
export function getMaxToolUseConcurrency(): number {
  return (
    parseInt(process.env['BEAST_CODE_MAX_TOOL_USE_CONCURRENCY'] ?? '', 10) ||
    10
  )
}

// ─── Parallel execution helpers ────────────────────────────────────────────────

/**
 * Run a single tool with permission checking.
 */
async function runSingleTool(
  block: ToolUseBlock,
  _assistantMessage: Message | undefined,
  canUseTool: CanUseToolFn,
  toolUseContext: ToolUseContext,
): Promise<unknown> {
  const tool = findToolByName(toolUseContext.options.tools, block.name)
  if (!tool) {
    return {
      type: 'tool_error',
      toolUseId: block.id,
      error: `Unknown tool: ${block.name}`,
    }
  }

  // Permission check
  const permission = await canUseTool(block.name, block.input)
  if (!permission.allowed) {
    return {
      type: 'tool_error',
      toolUseId: block.id,
      error: permission.reason ?? 'Permission denied',
    }
  }

  try {
    const result = await tool.call(
      block.input as Parameters<typeof tool.call>[0],
      toolUseContext,
      canUseTool
    )

    return {
      type: 'tool_result',
      toolUseId: block.id,
      content: result.data,
    }
  } catch (error) {
    return {
      type: 'tool_error',
      toolUseId: block.id,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Run tools concurrently (for read-only, concurrency-safe tools).
 * Uses Promise.all with concurrency limit.
 */
async function runToolsConcurrently(
  blocks: ToolUseBlock[],
  assistantMessages: Message[],
  canUseTool: CanUseToolFn,
  toolUseContext: ToolUseContext,
): Promise<unknown[]> {
  const maxConcurrency = getMaxToolUseConcurrency()
  const results: unknown[] = []

  // Process in chunks of maxConcurrency
  for (let i = 0; i < blocks.length; i += maxConcurrency) {
    const chunk = blocks.slice(i, i + maxConcurrency)
    const chunkResults = await Promise.all(
      chunk.map(block => {
        const assistant = assistantMessages.find(m => {
          if (typeof m.content !== 'string') return false
          // Look for tool_use references in message content
          return m.content.includes(`"id":"${block.id}"`) || m.content.includes(`"name":"${block.name}"`)
        })
        return runSingleTool(block, assistant, canUseTool, toolUseContext)
      })
    )
    results.push(...chunkResults.filter((r): r is unknown => r !== undefined))
  }

  return results
}

/**
 * Run tools serially (for non-concurrency-safe, side-effect tools).
 */
async function runToolsSerially(
  blocks: ToolUseBlock[],
  assistantMessages: Message[],
  canUseTool: CanUseToolFn,
  toolUseContext: ToolUseContext,
): Promise<unknown[]> {
  const results: unknown[] = []

  for (const block of blocks) {
    const assistant = assistantMessages.find(m => {
      if (typeof m.content !== 'string') return false
      // Look for tool_use references in message content
      return m.content.includes(`"id":"${block.id}"`) || m.content.includes(`"name":"${block.name}"`)
    })
    const result = await runSingleTool(block, assistant, canUseTool, toolUseContext)
    if (result) results.push(result)
  }

  return results
}

/**
 * Main orchestration: partition and execute tool calls.
 *
 * Per Claude Code:
 * - Read-only tools: batched and run concurrently (up to 10)
 * - Side-effect tools: run serially, one at a time
 * - Results are yielded as they complete for real-time feedback
 *
 * @param toolUseBlocks - Array of tool use blocks from the model's response
 * @param assistantMessages - The assistant messages containing tool use blocks
 * @param canUseTool - Permission checking function
 * @param toolUseContext - Tool use context with tools and options
 */
export async function* runTools(
  toolUseBlocks: ToolUseBlock[],
  assistantMessages: Message[],
  canUseTool: CanUseToolFn,
  toolUseContext: ToolUseContext,
): AsyncGenerator<{ message?: unknown; newContext: ToolUseContext }, void> {
  let currentContext = toolUseContext

  // Partition into concurrent vs serial batches
  const batches = partitionToolCalls(toolUseBlocks, currentContext)

  for (const batch of batches) {
    if (batch.isConcurrencySafe) {
      // Run read-only tools concurrently
      const results = await runToolsConcurrently(
        batch.blocks,
        assistantMessages,
        canUseTool,
        currentContext
      )

      for (const message of results) {
        yield { message, newContext: currentContext }
      }
    } else {
      // Run side-effect tools serially
      const results = await runToolsSerially(
        batch.blocks,
        assistantMessages,
        canUseTool,
        currentContext
      )

      for (const message of results) {
        yield { message, newContext: currentContext }
      }
    }
  }

  yield { newContext: currentContext }
}
