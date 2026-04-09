// LLM Provider Integration Test
// Tests all implemented providers with real API calls
// Run with: ~/.bun/bin/bun test-providers.ts

import { createProvider } from './src/providers/index.ts'

interface TestResult {
  provider: string
  status: 'pass' | 'fail' | 'skip'
  latency?: number
  response?: string
  error?: string
  tokens?: number
}

const TEST_MESSAGE = {
  role: 'user' as const,
  content: 'Say "Hello from [provider]" in exactly that format.',
}

const MAX_TOKENS = 100

async function testProvider(
  name: string,
  config: { provider: string; model: string; apiKey?: string; baseUrl?: string }
): Promise<TestResult> {
  const start = Date.now()

  console.log(`   Config: provider=${config.provider}, apiKey=${config.apiKey?.substring(0,5) ?? 'none'}...`)

  // Check if API key is needed but not provided
  const needsApiKey = ['openai', 'deepseek', 'openrouter', 'groq', 'qwen', 'gemini', 'mistral'].includes(config.provider)
  if (needsApiKey && (!config.apiKey || config.apiKey.length < 5)) {
    return { provider: name, status: 'skip', latency: 0, error: 'API key not set in environment' }
  }

  // Check if baseUrl is needed and local server should be running
  const needsServer = ['ollama', 'lmstudio', 'jan'].includes(config.provider)
  if (needsServer && config.baseUrl?.includes('localhost')) {
    // Try a quick connection check first
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 500)
      await fetch(config.baseUrl.replace('/v1', '') + '/api/tags', { signal: controller.signal })
      clearTimeout(timeout)
    } catch {
      return { provider: name, status: 'skip', latency: 0, error: 'Server not running on ' + config.baseUrl }
    }
  }

  try {
    const provider = await createProvider(config)
    console.log(`   Provider created: ${provider.name}`)

    const response = await provider.create({
      messages: [TEST_MESSAGE],
      maxTokens: MAX_TOKENS,
      temperature: 0.7,
    })

    const latency = Date.now() - start
    console.log(`   Response received: "${response.content?.substring(0, 50)}"`)

    // Validate response
    if (!response.content || response.content.length === 0) {
      console.log(`   FAIL: Empty content, response:`, JSON.stringify(response))
      return { provider: name, status: 'fail', latency, error: 'Empty response' }
    }

    const result = {
      provider: name,
      status: 'pass' as const,
      latency,
      response: response.content.substring(0, 100),
      tokens: response.usage?.completionTokens ?? 0,
    }
    console.log(`   PASS: result=`, JSON.stringify(result))
    return result
  } catch (e) {
    const latency = Date.now() - start
    const error = e instanceof Error ? e.message : String(e)

    // Determine if it's a connection error (server not running) vs API error
    if (error.includes('fetch') || error.includes('ECONNREFUSED') || error.includes('getaddrinfo') || error.includes('Connection')) {
      return { provider: name, status: 'skip', latency, error: 'Server not running or not reachable' }
    }

    return { provider: name, status: 'fail', latency, error }
  }
}

async function main() {
  console.log('🐉 Beast CLI - LLM Provider Integration Test')
  console.log('═'.repeat(70))
  console.log()

  const results: TestResult[] = []

  // Test 1: Ollama (Local)
  console.log('📦 Testing Ollama (Local)')
  console.log('─'.repeat(50))
  const ollamaResult = await testProvider('Ollama', {
    provider: 'ollama',
    model: 'llama3.2',
    baseUrl: 'http://localhost:11434',
  })
  results.push(ollamaResult)

  // Test 2: LM Studio (Local)
  console.log('\n📦 Testing LM Studio (Local)')
  console.log('─'.repeat(50))
  const lmstudioResult = await testProvider('LM Studio', {
    provider: 'lmstudio',
    model: 'local-model',
    baseUrl: 'http://localhost:1234/v1',
  })
  results.push(lmstudioResult)

  // Test 3: Jan.ai (Local)
  console.log('\n📦 Testing Jan.ai (Local)')
  console.log('─'.repeat(50))
  const janResult = await testProvider('Jan.ai', {
    provider: 'jan',
    model: 'local-model',
    baseUrl: 'http://localhost:1337/v1',
  })
  results.push(janResult)

  // Test 4: OpenAI
  console.log('\n📦 Testing OpenAI')
  console.log('─'.repeat(50))
  const openaiResult = await testProvider('OpenAI', {
    provider: 'openai',
    model: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
  })
  results.push(openaiResult)

  // Test 5: DeepSeek
  console.log('\n📦 Testing DeepSeek')
  console.log('─'.repeat(50))
  const deepseekResult = await testProvider('DeepSeek', {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY ?? '',
  })
  results.push(deepseekResult)

  // Test 6: Anthropic (Claude)
  console.log('\n📦 Testing Anthropic (Claude)')
  console.log('─'.repeat(50))
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicApiKey) {
    console.log('   ⏭️ SKIP - ANTHROPIC_API_KEY not set')
    results.push({ provider: 'Anthropic', status: 'skip', error: 'API key not set' })
  } else {
    const anthropicResult = await testProvider('Anthropic', {
      provider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
      apiKey: anthropicApiKey,
    })
    results.push(anthropicResult)
  }

  // Test 7: OpenRouter (Qwen via OpenRouter)
  console.log('\n📦 Testing OpenRouter (Qwen)')
  console.log('─'.repeat(50))
  const openrouterResult = await testProvider('OpenRouter', {
    provider: 'openrouter',
    model: 'qwen/qwen-2.5-72b-instruct',
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
  })
  results.push(openrouterResult)

  // Test 8: Groq
  console.log('\n📦 Testing Groq')
  console.log('─'.repeat(50))
  const groqResult = await testProvider('Groq', {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    apiKey: process.env.GROQ_API_KEY ?? '',
  })
  results.push(groqResult)

  // Test 9: Qwen (Direct via DashScope)
  console.log('\n📦 Testing Qwen (DashScope)')
  console.log('─'.repeat(50))
  const qwenResult = await testProvider('Qwen', {
    provider: 'qwen',
    model: 'qwen-plus',
    apiKey: process.env.DASHSCOPE_API_KEY ?? '',
  })
  results.push(qwenResult)

  // Summary
  console.log('\n' + '═'.repeat(70))
  console.log('📊 LLM PROVIDER TEST RESULTS')
  console.log('═'.repeat(70))

  const passed = results.filter(r => r.status === 'pass')
  const failed = results.filter(r => r.status === 'fail')
  const skipped = results.filter(r => r.status === 'skip')

  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'skip' ? '⏭️' : '❌'
    console.log(`\n${icon} ${result.provider}`)
    console.log(`   Status: ${result.status.toUpperCase()}`)
    if (result.latency) console.log(`   Latency: ${result.latency}ms`)
    if (result.response) console.log(`   Response: ${result.response}`)
    if (result.tokens) console.log(`   Tokens: ${result.tokens}`)
    if (result.error) console.log(`   Error: ${result.error}`)
  }

  console.log('\n' + '─'.repeat(70))
  console.log(`\nSummary: ${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped`)

  // Local servers summary
  const localResults = results.filter(r =>
    ['Ollama', 'LM Studio', 'Jan.ai'].includes(r.provider)
  )
  const localRunning = localResults.filter(r => r.status !== 'skip').length
  const localTotal = localResults.length

  console.log(`\n📍 Local Servers: ${localRunning}/${localTotal} reachable`)

  if (skipped.length > 0) {
    console.log('\n💡 To enable more providers:')
    console.log('   - Start Ollama: `ollama serve`')
    console.log('   - Start LM Studio: Open LM Studio app')
    console.log('   - Start Jan.ai: `jan serve`')
    console.log('   - Set API keys in environment:')
    console.log('     export OPENAI_API_KEY=...')
    console.log('     export DEEPSEEK_API_KEY=...')
    console.log('     export ANTHROPIC_API_KEY=...')
    console.log('     export GROQ_API_KEY=...')
    console.log('     export DASHSCOPE_API_KEY=...')
  }

  console.log('\n' + '═'.repeat(70))

  // Exit with appropriate code
  if (failed.length > 0) {
    process.exit(1)
  }
}

main().catch(console.error)
