// LazyLiteLLM Pattern - Deferred LLM library loading
// Based on Aider's LazyLiteLLM

import type { LLMProvider, LLMRequest, LLMResponse } from '../providers/index'

// Lazy-loaded provider cache
let providerCache: Map<string, LLMProvider> = new Map()
let loadStartTime: number = 0

// Suppress debug logging during load
let originalConsoleDebug: typeof console.debug | null = null

function suppressDebug(): void {
  originalConsoleDebug = console.debug
  console.debug = () => {}
}

function restoreDebug(): void {
  if (originalConsoleDebug) {
    console.debug = originalConsoleDebug
    originalConsoleDebug = null
  }
}

// Lazy load a provider
export async function lazyLoadProvider(
  name: string,
  factory: () => Promise<LLMProvider>
): Promise<LLMProvider> {
  // Check cache first
  const cached = providerCache.get(name)
  if (cached) return cached

  // Track load time for metrics
  loadStartTime = Date.now()

  // Suppress debug during heavy import
  suppressDebug()

  try {
    const provider = await factory()
    providerCache.set(name, provider)

    const loadTime = Date.now() - loadStartTime
    if (loadTime > 100) {
      console.log(`[LazyLLM] Loaded ${name} in ${loadTime}ms`)
    }

    return provider
  } finally {
    restoreDebug()
  }
}

// Lazy LLM Client
export class LazyLLMClient {
  private providerName: string
  private providerFactory: () => Promise<LLMProvider>
  private provider?: LLMProvider
  private initialized = false

  constructor(providerName: string, factory: () => Promise<LLMProvider>) {
    this.providerName = providerName
    this.providerFactory = factory
  }

  // Lazy initialization
  private async ensureInitialized(): Promise<void> {
    if (this.initialized && this.provider) return

    this.provider = await lazyLoadProvider(this.providerName, this.providerFactory)
    this.initialized = true
  }

  // API calls are lazy - provider loads on first use
  async create(request: LLMRequest): Promise<LLMResponse> {
    await this.ensureInitialized()
    return this.provider!.create(request)
  }

  async *createStream(request: LLMRequest): AsyncGenerator<LLMResponse> {
    await this.ensureInitialized()

    if (this.provider?.createStream) {
      yield* this.provider.createStream(request)
    } else {
      // Fallback to non-streaming
      const response = await this.provider!.create(request)
      yield response
    }
  }

  // Check if provider is loaded
  isLoaded(): boolean {
    return this.initialized
  }

  // Force preload (for warm-up)
  async preload(): Promise<void> {
    await this.ensureInitialized()
  }

  // Clear cache
  static clearCache(): void {
    providerCache.clear()
  }

  // Get cache stats
  static getCacheStats(): { size: number; providers: string[] } {
    return {
      size: providerCache.size,
      providers: Array.from(providerCache.keys()),
    }
  }
}

// Factory function for lazy providers
export function createLazyProvider(
  name: string,
  config: {
    provider: string
    model: string
    apiKey?: string
    baseUrl?: string
  }
): () => Promise<LLMProvider> {
  return async (): Promise<LLMProvider> => {
    // Dynamic import based on provider type
    const { createProvider } = await import('../providers/index')
    return createProvider(config)
  }
}

// Deferred import utilities
export async function importAnthropic(): Promise<unknown> {
  suppressDebug()
  try {
    return await import('@anthropic-ai/sdk')
  } finally {
    restoreDebug()
  }
}

export async function importOpenAI(): Promise<unknown> {
  suppressDebug()
  try {
    return await import('openai')
  } finally {
    restoreDebug()
  }
}

// Startup time measurement
export interface StartupMetrics {
  lazyProviders: number
  eagerProviders: number
  totalLoadTime?: number
  providersLoaded: string[]
}

export async function measureStartup(
  providers: Array<{ name: string; factory: () => Promise<LLMProvider> }>,
  lazy: boolean = true
): Promise<StartupMetrics> {
  const start = Date.now()
  const metrics: StartupMetrics = {
    lazyProviders: 0,
    eagerProviders: 0,
    providersLoaded: [],
  }

  if (lazy) {
    metrics.lazyProviders = providers.length
    // Don't load yet - just track
  } else {
    metrics.eagerProviders = providers.length
    for (const p of providers) {
      const provider = await lazyLoadProvider(p.name, p.factory)
      metrics.providersLoaded.push(provider.name)
    }
    metrics.totalLoadTime = Date.now() - start
  }

  return metrics
}

// Estimate startup improvement
export function estimateStartupImprovement(
  lazyCount: number,
  avgLoadTimePerProvider: number = 200 // ms
): number {
  // With lazy loading, providers load on-demand
  // Initial startup only loads nothing
  // Worst case: all providers needed = full load time
  // Best case: no providers needed = 0ms
  // Average case: ~20% of providers needed
  const averageProvidersNeeded = lazyCount * 0.2
  return Math.round(lazyCount * avgLoadTimePerProvider * (1 - 0.2))
}

export default {
  LazyLLMClient,
  lazyLoadProvider,
  createLazyProvider,
  measureStartup,
  estimateStartupImprovement,
  importAnthropic,
  importOpenAI,
}
