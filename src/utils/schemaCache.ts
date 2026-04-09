// Tool Schema Cache - Prevents mid-session schema churn from recomputing descriptions
// Based on Claude Code's toolSchemaCache pattern
// Key insight: Without caching, tool.prompt() drifts and causes 5.4% -> 51% error rates (PR#25424)

import type { LLMTool } from '../providers/index.ts'
import { zodToJsonSchema } from './zodToJsonSchema.ts'
import type { Tool } from '../tools/Tool.ts'

export interface ToolSchemaCache {
  get(key: string): LLMTool | undefined
  set(key: string, tool: LLMTool): void
  has(key: string): boolean
  clear(): void
  size(): number
}

/**
 * Create a session-stable tool schema cache.
 * Cache key must include inputJSONSchema for StructuredOutput uniqueness.
 * Per Claude Code: "Schema cache prevents mid-session GrowthBook flips causing churn."
 */
export function createToolSchemaCache(): ToolSchemaCache {
  const cache = new Map<string, LLMTool>()

  return {
    get(key: string): LLMTool | undefined {
      return cache.get(key)
    },

    set(key: string, tool: LLMTool): void {
      cache.set(key, tool)
    },

    has(key: string): boolean {
      return cache.has(key)
    },

    clear(): void {
      cache.clear()
    },

    size(): number {
      return cache.size
    },
  }
}

// Global cache instance - survives for session lifetime
let globalCache: ToolSchemaCache | null = null

export function getGlobalToolSchemaCache(): ToolSchemaCache {
  if (!globalCache) {
    globalCache = createToolSchemaCache()
  }
  return globalCache
}

/**
 * Convert a Tool to API format (LLMTool) with caching.
 * Uses inputJSONSchema in cache key for uniqueness.
 *
 * Per Claude Code:
 * - Cache per session to prevent mid-session GrowthBook flips
 * - Include inputJSONSchema for StructuredOutput uniqueness
 * - Session-stable: computed once, reused for entire session
 */
export async function toolToAPISchema(
  tool: Tool,
  options: {
    description: string
    inputJSONSchema?: Record<string, unknown>
    strict?: boolean
  },
  cache?: ToolSchemaCache
): Promise<LLMTool> {
  const cacheInstance = cache ?? getGlobalToolSchemaCache()

  // Build cache key: name + inputJSONSchema for uniqueness
  // StructuredOutput tools share names but have different schemas per workflow call
  // Without inputJSONSchema in key: 5.4% -> 51% error rate (PR#25424)
  const cacheKey = options.inputJSONSchema
    ? `${tool.name}:${JSON.stringify(options.inputJSONSchema)}`
    : tool.name

  // Check cache first
  const cached = cacheInstance.get(cacheKey)
  if (cached) {
    return cached
  }

  // Compute schema from Zod or pre-computed JSON schema
  const inputSchema = options.inputJSONSchema ?? zodToJsonSchema(tool.inputSchema)

  const apiTool: LLMTool = {
    name: tool.name,
    description: options.description,
    inputSchema,
  }

  // Cache for session
  cacheInstance.set(cacheKey, apiTool)

  return apiTool
}

/**
 * Convert multiple tools to API format with caching.
 * Groups tools by name to handle duplicates.
 */
export async function toolsToAPISchema(
  tools: Tool[],
  options: {
    getDescription: (tool: Tool) => Promise<string>
    getInputJSONSchema?: (tool: Tool) => Record<string, unknown> | undefined
    strict?: boolean
  },
  cache?: ToolSchemaCache
): Promise<LLMTool[]> {
  const seen = new Set<string>()
  const result: LLMTool[] = []

  for (const tool of tools) {
    if (seen.has(tool.name)) continue
    seen.add(tool.name)

    const description = await options.getDescription(tool)
    const inputJSONSchema = options.getInputJSONSchema?.(tool)

    const apiTool = await toolToAPISchema(
      tool,
      { description, inputJSONSchema, strict: options.strict },
      cache
    )

    result.push(apiTool)
  }

  return result
}

/**
 * Tool schema cache stats for debugging.
 */
export function getSchemaCacheStats(): { size: number; hitRate: number } {
  // In a production system, you'd track hits/misses
  // For now, just report size
  return {
    size: getGlobalToolSchemaCache().size(),
    hitRate: -1, // Not tracking yet
  }
}
