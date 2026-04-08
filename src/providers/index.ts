// Multi-Provider Support - Factory pattern for 40+ providers
// Based on Cline's provider factory

export interface LLMConfig {
  provider: string
  model: string
  apiKey?: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  name?: string
}

export interface LLMRequest {
  messages: LLMMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: LLMTool[]
  stream?: boolean
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason?: 'stop' | 'length' | 'content_filter'
}

export interface LLMTool {
  name: string
  description?: string
  inputSchema: Record<string, unknown>
}

export interface LLMProvider {
  name: string
  models: string[]
  apiFormat: 'anthropic' | 'openai' | 'ollama' | 'openrouter' | 'custom'
  create(request: LLMRequest): Promise<LLMResponse>
  createStream?(request: LLMRequest): AsyncGenerator<LLMResponse>
}

// Provider Registry
const providers = new Map<string, () => Promise<LLMProvider>>()

export function registerProvider(name: string, factory: () => Promise<LLMProvider>): void {
  providers.set(name, factory)
}

export async function getProvider(name: string): Promise<LLMProvider | null> {
  const factory = providers.get(name)
  if (!factory) return null
  return factory()
}

export async function createProvider(config: LLMConfig): Promise<LLMProvider> {
  switch (config.provider) {
    case 'anthropic':
      return createAnthropicProvider(config)
    case 'openai':
      return createOpenAIProvider(config)
    case 'openrouter':
      return createOpenRouterProvider(config)
    case 'ollama':
      return createOllamaProvider(config)
    case 'gemini':
      return createGeminiProvider(config)
    case 'groq':
      return createGroqProvider(config)
    case 'deepseek':
      return createDeepSeekProvider(config)
    case 'mistral':
      return createMistralProvider(config)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

// Anthropic Provider
async function createAnthropicProvider(config: LLMConfig): Promise<LLMProvider> {
  const Anthropic = await import('@anthropic-ai/sdk')

  return {
    name: 'anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    apiFormat: 'anthropic',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new Anthropic.Anthropic({ apiKey: config.apiKey })

      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      const response = await client.messages.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4096,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: otherMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        tools: request.tools?.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema,
        })),
      })

      return {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'length',
      }
    },
  }
}

// OpenAI Provider
async function createOpenAIProvider(config: LLMConfig): Promise<LLMProvider> {
  const OpenAI = await import('openai')

  return {
    name: 'openai',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new OpenAI.OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4096,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
          name: m.name,
        })),
        tools: request.tools?.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema,
          },
        })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// OpenRouter Provider
async function createOpenRouterProvider(config: LLMConfig): Promise<LLMProvider> {
  const OpenAI = await import('openai')

  return {
    name: 'openrouter',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro', 'meta-llama/llama-3-70b-instruct'],
    apiFormat: 'openrouter',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new OpenAI.OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl ?? 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://beast-cli.dev',
          'X-Title': 'Beast CLI',
        },
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4096,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
          name: m.name,
        })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// Ollama Provider
async function createOllamaProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'ollama',
    models: ['llama3', 'llama3.1', 'codellama', 'mistral', 'mixtral', 'phi3'],
    apiFormat: 'ollama',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const baseUrl = config.baseUrl ?? 'http://localhost:11434'
      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model ?? config.model,
          messages: [
            ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
            ...otherMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          stream: false,
        }),
      })

      const data = await response.json()

      return {
        content: data.message?.content ?? '',
        model: data.model ?? config.model,
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
        },
        finishReason: data.done ? 'stop' : 'length',
      }
    },
  }
}

// Gemini Provider
async function createGeminiProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    apiFormat: 'custom',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${request.model ?? config.model}:generateContent?key=${apiKey}`

      const systemMessage = request.messages.find(m => m.role === 'system')
      const otherMessages = request.messages.filter(m => m.role !== 'system')

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: otherMessages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
          generationConfig: {
            maxOutputTokens: request.maxTokens ?? config.maxTokens ?? 4096,
            temperature: request.temperature ?? config.temperature ?? 0.7,
          },
        }),
      })

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      return {
        content,
        model: request.model ?? config.model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0,
        },
        finishReason: data.candidates?.[0]?.finishReason === 'STOP' ? 'stop' : 'length',
      }
    },
  }
}

// Groq Provider
async function createGroqProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'groq',
    models: ['mixtral-8x7b-32768', 'llama3-8b-8192', 'llama3-70b-8192', 'gemma-7b-it'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4096,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// DeepSeek Provider
async function createDeepSeekProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'deepseek',
    models: ['deepseek-chat', 'deepseek-coder'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.deepseek.com/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4096,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// Mistral Provider
async function createMistralProvider(config: LLMConfig): Promise<LLMProvider> {
  return {
    name: 'mistral',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest'],
    apiFormat: 'openai',

    async create(request: LLMRequest): Promise<LLMResponse> {
      const client = new (await import('openai')).OpenAI({
        apiKey: config.apiKey,
        baseURL: 'https://api.mistral.ai/v1',
      })

      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 4096,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const choice = response.choices[0]
      return {
        content: choice.message.content ?? '',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        finishReason: choice.finish_reason as 'stop' | 'length',
      }
    },
  }
}

// Detect model family for prompt variants
export function detectModelFamily(model: string): 'generic' | 'next_gen' | 'xs' {
  const lower = model.toLowerCase()

  if (
    lower.includes('claude-3') ||
    lower.includes('gpt-5') ||
    lower.includes('gemini-1.5') ||
    lower.includes('llama-3.1')
  ) {
    return 'next_gen'
  }

  if (
    lower.includes('gemma') ||
    lower.includes('phi-3') ||
    lower.includes('llama3-8b') ||
    lower.includes('codellama')
  ) {
    return 'xs'
  }

  return 'generic'
}

// Token estimation (rough)
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Cost calculation (per 1M tokens)
export function calculateCost(provider: string, model: string, usage: { promptTokens: number; completionTokens: number }): number {
  const rates: Record<string, Record<string, { input: number; output: number }>> = {
    anthropic: {
      'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
      'claude-3-opus-20240229': { input: 15, output: 75 },
    },
    openai: {
      'gpt-4o': { input: 5, output: 15 },
      'gpt-4-turbo': { input: 10, output: 30 },
    },
    openrouter: {
      default: { input: 0.5, output: 1.5 },
    },
  }

  const modelRates = rates[provider]?.[model] ?? rates[provider]?.['default'] ?? { input: 1, output: 2 }

  const inputCost = (usage.promptTokens / 1_000_000) * modelRates.input
  const outputCost = (usage.completionTokens / 1_000_000) * modelRates.output

  return inputCost + outputCost
}

export default {
  createProvider,
  registerProvider,
  getProvider,
  detectModelFamily,
  estimateTokens,
  calculateCost,
}
