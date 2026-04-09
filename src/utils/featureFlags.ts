// Feature Flags System - Experiment gating and kill switches
// Based on Claude Code's feature() + GrowthBook integration
// Key insight: Gradual rollouts, A/B experiments, kill switches without redeployment

/**
 * Feature flag value type.
 */
export type FeatureValue = boolean | string | number | object

/**
 * Feature flag definition.
 */
export interface FeatureFlag {
  name: string
  defaultValue: FeatureValue
  description?: string
  /** If true, flag can be overridden by environment variable */
  envOverride?: boolean
}

/**
 * Feature flag store.
 */
export interface FeatureStore {
  get(name: string): FeatureValue | undefined
  set(name: string, value: FeatureValue): void
  has(name: string): boolean
  delete(name: string): void
  keys(): string[]
}

/**
 * Create a feature flag store.
 */
export function createFeatureStore(): FeatureStore {
  const flags = new Map<string, FeatureValue>()

  return {
    get(name: string): FeatureValue | undefined {
      return flags.get(name)
    },

    set(name: string, value: FeatureValue): void {
      flags.set(name, value)
    },

    has(name: string): boolean {
      return flags.has(name)
    },

    delete(name: string): void {
      flags.delete(name)
    },

    keys(): string[] {
      return Array.from(flags.keys())
    },
  }
}

// Global feature store - initialized with defaults
let globalStore: FeatureStore | null = null

// Default feature flags
const defaultFlags: Record<string, FeatureValue> = {
  // Core features
  'TOOL_BATCHING': true,              // Concurrency-safe tool batching
  'TOOL_SCHEMA_CACHE': true,          // Tool schema caching
  'STREAMING': true,                  // Streaming responses

  // Agent features
  'COORDINATOR_MODE': false,          // Multi-agent coordinator
  'SUBAGENT_CONTEXT': true,          // Subagent context isolation
  'WORKER_TOOLS': true,              // Worker tool restrictions

  // MCP features
  'MCP_WEBSOCKET': false,            // WebSocket transport
  'MCP_OAUTH': false,                // OAuth support
  'MCP_SESSION_RETRY': true,         // Session expiration retry

  // Compaction
  'AUTO_COMPACT': true,              // Auto-compaction
  'TOKEN_BUDGET': true,               // Token budget tracking
  'REACTIVE_COMPACT': false,          // On-demand compaction

  // Hooks
  'HOOKS_PRE_TOOL': true,            // Pre-tool hooks
  'HOOKS_POST_TOOL': true,           // Post-tool hooks
  'HOOKS_THINK': false,              // Think hooks
  'HOOKS_AGENT': false,              // Agent submit hooks

  // LLM providers
  'OLLAMA_TOOLS': true,               // Ollama tool passing
  'TOOL_STREAMING': false,           // Fine-grained tool streaming

  // Debugging
  'DEBUG_TOOLS': false,               // Debug tool calls
  'DEBUG_MCP': false,                 // Debug MCP
  'DEBUG_TOKEN_BUDGET': false,       // Debug token budget
}

/**
 * Get the global feature store, initialized with defaults.
 */
export function getGlobalFeatureStore(): FeatureStore {
  if (!globalStore) {
    globalStore = createFeatureStore()
    // Initialize with defaults
    for (const [name, value] of Object.entries(defaultFlags)) {
      globalStore.set(name, value)
    }
  }
  return globalStore
}

/**
 * Check if a feature flag is enabled.
 *
 * Supports:
 * - Explicit override via setFeature()
 * - Environment variable override (BEAST_FLAG_$NAME=true|false)
 * - Default value
 *
 * Per Claude Code: "Feature-gated code paths are loaded lazily via require()."
 * We use dynamic import for the same effect.
 */
export function feature(name: string): boolean {
  const store = getGlobalFeatureStore()

  // 1. Environment variable override
  const envKey = `BEAST_FLAG_${name.toUpperCase().replace(/-/g, '_')}`
  if (envKey in process.env) {
    const envValue = process.env[envKey]
    if (envValue === 'true' || envValue === '1') return true
    if (envValue === 'false' || envValue === '0') return false
  }

  // 2. Explicit override in store
  if (store.has(name)) {
    const value = store.get(name)
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') return value === 'true' || value === '1'
  }

  // 3. Default value
  if (name in defaultFlags) {
    const defaultValue = defaultFlags[name]
    if (typeof defaultValue === 'boolean') return defaultValue
  }

  // 4. Fallback to false
  return false
}

/**
 * Get a feature flag value (not just boolean).
 */
export function getFeature<T extends FeatureValue>(name: string, fallback: T): T {
  const store = getGlobalFeatureStore()

  // Environment override
  const envKey = `BEAST_FLAG_${name.toUpperCase().replace(/-/g, '_')}`
  if (envKey in process.env) {
    const envValue = process.env[envKey]
    if (envValue === 'true') return true as T
    if (envValue === 'false') return false as T
    return envValue as T
  }

  // Store value
  if (store.has(name)) {
    return store.get(name) as T
  }

  // Default
  if (name in defaultFlags) {
    return defaultFlags[name] as T
  }

  return fallback
}

/**
 * Set a feature flag (runtime override).
 */
export function setFeature(name: string, value: FeatureValue): void {
  getGlobalFeatureStore().set(name, value)
}

/**
 * Reset feature flags to defaults.
 */
export function resetFeatures(): void {
  globalStore = null
}

/**
 * Get all feature flags for debugging.
 */
export function getAllFeatures(): Record<string, FeatureValue> {
  const store = getGlobalFeatureStore()
  const result: Record<string, FeatureValue> = {}

  for (const key of store.keys()) {
    result[key] = store.get(key)!
  }

  return result
}

/**
 * Feature-gated dynamic import.
 * Per Claude Code: "Feature-gated code paths are loaded lazily via require()."
 * We use dynamic import for the same effect.
 *
 * @example
 * const module = await featureImport(
 *   'REACTIVE_COMPACT',
 *   () => import('./services/compact/reactiveCompact.js')
 * )
 */
export async function featureImport<T>(
  flagName: string,
  factory: () => Promise<{ default?: T } & T>,
): Promise<T | null> {
  if (!feature(flagName)) {
    return null
  }

  try {
    const mod = await factory()
    // Handle both default export and named exports
    return (mod.default ?? mod) as T
  } catch (error) {
    console.warn(`[FeatureFlags] Failed to load feature '${flagName}':`, error)
    return null
  }
}

/**
 * Feature-gated code path execution.
 *
 * @example
 * await featureExecute('REACTIVE_COMPACT', async () => {
 *   await runReactiveCompact()
 * })
 */
export async function featureExecute(
  flagName: string,
  fn: () => Promise<void> | void,
): Promise<void> {
  if (!feature(flagName)) {
    return
  }

  await fn()
}
