// Batch Tool - Concurrent tool execution
// Based on OpenCode's batch tool

export interface BatchItem<T = unknown> {
  id: string
  tool: string
  input: T
  priority?: number  // Higher = execute first
}

export interface BatchResult<T = unknown, R = unknown> {
  id: string
  success: boolean
  result?: R
  error?: string
  duration: number  // ms
}

export interface BatchOptions {
  concurrency?: number  // Max parallel executions (default: 5)
  stopOnError?: boolean  // Stop on first error (default: false)
  timeout?: number  // Per-item timeout in ms (default: 30000)
}

// Tool registry for batch execution
type ToolHandler = (input: unknown) => Promise<unknown>

const toolRegistry = new Map<string, ToolHandler>()

export function registerBatchTool(name: string, handler: ToolHandler): void {
  toolRegistry.set(name, handler)
}

export function getBatchTool(name: string): ToolHandler | undefined {
  return toolRegistry.get(name)
}

// Batch executor
export class BatchExecutor {
  private concurrency: number
  private stopOnError: boolean
  private timeout: number

  constructor(options: BatchOptions = {}) {
    this.concurrency = options.concurrency ?? 5
    this.stopOnError = options.stopOnError ?? false
    this.timeout = options.timeout ?? 30000
  }

  // Execute batch of tool calls
  async execute<TInput, TResult>(
    items: BatchItem<TInput>[],
    executor: (item: BatchItem<TInput>) => Promise<TResult>
  ): Promise<BatchResult<TInput, TResult>[]> {
    // Sort by priority (higher first)
    const sorted = [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))

    const results: BatchResult<TInput, TResult>[] = []
    let index = 0

    // Process in batches of concurrency
    while (index < sorted.length) {
      const batch = sorted.slice(index, index + this.concurrency)
      const batchPromises = batch.map(async item => {
        const start = Date.now()
        try {
          const result = await this.withTimeout(executor(item), this.timeout)
          return {
            id: item.id,
            success: true,
            result,
            duration: Date.now() - start,
          } as BatchResult<TInput, TResult>
        } catch (e) {
          return {
            id: item.id,
            success: false,
            error: e instanceof Error ? e.message : String(e),
            duration: Date.now() - start,
          } as BatchResult<TInput, TResult>
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Check for errors if stopOnError is enabled
      if (this.stopOnError) {
        const failed = batchResults.find(r => !r.success)
        if (failed) {
          // Add remaining items as skipped
          const remaining = sorted.slice(index + this.concurrency)
          for (const item of remaining) {
            results.push({
              id: item.id,
              success: false,
              error: 'Skipped due to previous error',
              duration: 0,
            })
          }
          break
        }
      }

      index += this.concurrency
    }

    return results
  }

  // Execute with timeout wrapper
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout after ${ms}ms`))
      }, ms)

      promise
        .then(value => {
          clearTimeout(timer)
          resolve(value)
        })
        .catch(err => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }

  // Execute using registered tools
  async executeTools(
    items: BatchItem[]
  ): Promise<BatchResult[]> {
    return this.execute(items, async item => {
      const handler = getBatchTool(item.tool)
      if (!handler) {
        throw new Error(`Tool '${item.tool}' not registered for batch execution`)
      }
      return handler(item.input)
    })
  }

  // Get batch statistics
  getStats(results: BatchResult[]): {
    total: number
    succeeded: number
    failed: number
    totalDuration: number
    avgDuration: number
  } {
    const succeeded = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

    return {
      total: results.length,
      succeeded,
      failed,
      totalDuration,
      avgDuration: results.length > 0 ? totalDuration / results.length : 0,
    }
  }
}

// Convenience function
export async function batchExecute<TInput, TResult>(
  items: BatchItem<TInput>[],
  executor: (item: BatchItem<TInput>) => Promise<TResult>,
  options?: BatchOptions
): Promise<BatchResult<TInput, TResult>[]> {
  const batch = new BatchExecutor(options)
  return batch.execute(items, executor)
}

// Batch tool registration for built-in tools
export function registerBuiltInTools(): void {
  // Register common tools for batch execution
  // These would be actual tool implementations

  registerBatchTool('Read', async (input: unknown) => {
    const { readFile } = await import('node:fs/promises')
    const { path } = input as { path: string }
    return readFile(path, 'utf-8')
  })

  registerBatchTool('Write', async (input: unknown) => {
    const { writeFile } = await import('node:fs/promises')
    const { path, content } = input as { path: string; content: string }
    await writeFile(path, content, 'utf-8')
    return { success: true }
  })

  registerBatchTool('Glob', async (input: unknown) => {
    const { glob } = await import('glob')
    const { pattern, cwd } = input as { pattern: string; cwd?: string }
    return glob(pattern, { cwd })
  })

  registerBatchTool('Grep', async (input: unknown) => {
    const { grep } = await import(' grep')
    const { pattern, path, glob } = input as { pattern: string; path: string; glob?: string }
    return grep({ pattern, path, glob })
  })
}

// Batch request from LLM
export interface BatchRequest {
  items: Array<{
    id: string
    tool: string
    input: unknown
  }>
  options?: BatchOptions
}

export interface BatchResponse {
  results: Array<{
    id: string
    success: boolean
    result?: unknown
    error?: string
  }>
  stats: {
    total: number
    succeeded: number
    failed: number
    totalDuration: number
  }
}

export async function executeBatchRequest(
  request: BatchRequest
): Promise<BatchResponse> {
  const executor = new BatchExecutor(request.options)
  const items: BatchItem[] = request.items.map(item => ({
    id: item.id,
    tool: item.tool,
    input: item.input,
  }))

  const results = await executor.executeTools(items)
  const stats = executor.getStats(results)

  return {
    results: results.map(r => ({
      id: r.id,
      success: r.success,
      result: r.result,
      error: r.error,
    })),
    stats: {
      total: stats.total,
      succeeded: stats.succeeded,
      failed: stats.failed,
      totalDuration: stats.totalDuration,
    },
  }
}

// Create batch item helper
export function createBatchItem<T>(
  id: string,
  tool: string,
  input: T,
  priority?: number
): BatchItem<T> {
  return { id, tool, input, priority }
}