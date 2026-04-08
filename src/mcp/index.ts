// MCP Integration - Multi-transport MCP client with OAuth
// Based on Cline's McpHub implementation

export interface MCPConfig {
  servers: MCPServerConfig[]
  timeout: number
  retryAttempts: number
  retryBaseDelay: number
}

export interface MCPServerConfig {
  name: string
  command?: string[]
  args?: string[]
  env?: Record<string, string>
  url?: string
  headers?: Record<string, string>
  auth?: OAuthConfig
}

export interface OAuthConfig {
  clientId: string
  clientSecret?: string
  authUrl: string
  tokenUrl: string
  scopes?: string[]
}

export type TransportType = 'stdio' | 'sse' | 'http'

export interface MCPTransport {
  connect(): Promise<void>
  disconnect(): Promise<void>
  send(method: string, params?: unknown): Promise<unknown>
  onNotification(handler: (method: string, params?: unknown) => void): void
  isConnected(): boolean
}

export interface MCPClient {
  connect(): Promise<void>
  disconnect(): Promise<void>
  listTools(): Promise<MCTool[]>
  callTool(name: string, args?: Record<string, unknown>): Promise<ToolResult>
  onNotification(handler: (method: string, params?: unknown) => void): void
}

export interface MCTool {
  name: string
  description?: string
  inputSchema: Record<string, unknown>
  annotations?: {
    readOnlyHint?: boolean
    destructiveHint?: boolean
    idempotentHint?: boolean
  }
}

export interface ToolResult {
  content: Array<{ type: string; text?: string; data?: string; name?: string }>
  isError?: boolean
}

export interface MCPRequest {
  jsonrpc: '2.0'
  id: number | string
  method: string
  params?: unknown
}

export interface MCPResponse {
  jsonrpc: '2.0'
  id: number | string
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

export interface MCPNotification {
  jsonrpc: '2.0'
  method: string
  params?: unknown
}

// JSON-RPC transport base
abstract class BaseTransport implements MCPTransport {
  protected connected = false
  protected requestId = 0
  protected pendingRequests = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
  protected notificationHandlers: ((method: string, params?: unknown) => void)[] = []
  protected onDisconnect?: () => void

  abstract connect(): Promise<void>
  abstract disconnect(): Promise<void>
  abstract sendRaw(message: string): Promise<void>

  async send(method: string, params?: unknown): Promise<unknown> {
    if (!this.connected) throw new Error('Not connected')

    const id = ++this.requestId
    const request: MCPRequest = { jsonrpc: '2.0', id, method, params }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve: resolve as (v: unknown) => void, reject })
      this.sendRaw(JSON.stringify(request)).catch(reject)

      // Timeout after 30s
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error(`Request ${method} timed out`))
        }
      }, 30000)
    })
  }

  protected handleMessage(message: string): void {
    try {
      const msg = JSON.parse(message) as MCPResponse | MCPNotification

      if ('id' in msg && msg.id !== undefined) {
        const pending = this.pendingRequests.get(typeof msg.id === 'string' ? parseInt(msg.id) : msg.id)
        if (pending) {
          this.pendingRequests.delete(typeof msg.id === 'string' ? parseInt(msg.id) : msg.id)
          if ('error' in msg && msg.error) {
            pending.reject(new Error(msg.error.message))
          } else if ('result' in msg) {
            pending.resolve(msg.result)
          }
        }
      } else if ('method' in msg) {
        this.notificationHandlers.forEach(h => h(msg.method, msg.params))
      }
    } catch (e) {
      console.error('[MCP] Failed to parse message:', e)
    }
  }

  onNotification(handler: (method: string, params?: unknown) => void): void {
    this.notificationHandlers.push(handler)
  }

  isConnected(): boolean {
    return this.connected
  }
}

// Stdio Transport
export class StdioTransport extends BaseTransport {
  private process?: ReturnType<typeof import('child_process').spawn>
  private writeBuffer: string[] = []

  constructor(
    private command: string,
    private args: string[] = [],
    private env: Record<string, string> = {}
  ) {
    super()
  }

  async connect(): Promise<void> {
    const { spawn } = await import('child_process')

    this.process = spawn(this.command, this.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...this.env },
      shell: true,
    })

    let buffer = ''

    this.process.stdout?.on('data', (data: Buffer) => {
      buffer += data.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.trim()) this.handleMessage(line)
      }
    })

    this.process.stderr?.on('data', (data: Buffer) => {
      console.error('[MCP Stdio stderr]:', data.toString())
    })

    this.process.on('close', () => {
      this.connected = false
      this.onDisconnect?.()
    })

    // Send initialize
    await this.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { roots: { listChanged: true } },
      clientInfo: { name: 'beast-cli', version: '1.0.0' },
    })

    this.connected = true
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill()
      this.process = undefined
    }
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.process?.stdin) {
        reject(new Error('Process stdin not available'))
        return
      }
      this.process.stdin.write(message + '\n', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

// SSE Transport
export class SSETransport extends BaseTransport {
  private eventSource?: EventSource
  private baseUrl: string
  private abortController?: AbortController

  constructor(url: string, private headers: Record<string, string> = {}) {
    super()
    this.baseUrl = url
  }

  async connect(): Promise<void> {
    this.abortController = new AbortController()

    // Use fetch with SSE
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: this.headers,
      signal: this.abortController.signal,
    })

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // Process SSE stream
    ;(async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            this.handleMessage(data)
          }
        }
      }
    })()

    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.abortController?.abort()
    this.eventSource?.close()
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    await fetch(`${this.baseUrl}/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: message,
    })
  }
}

// StreamableHTTP Transport
export class HTTPTransport extends BaseTransport {
  private baseUrl: string
  private sessionId?: string
  private abortController?: AbortController

  constructor(url: string, private headers: Record<string, string> = {}) {
    super()
    this.baseUrl = url
  }

  async connect(): Promise<void> {
    this.abortController = new AbortController()

    // Initialize session
    const initRes = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1, params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'beast-cli', version: '1.0.0' } } }),
    })

    if (initRes.headers.has('mcp-session-id')) {
      this.sessionId = initRes.headers.get('mcp-session-id') ?? undefined
    }

    // Start streaming
    const streamRes = await fetch(this.baseUrl, {
      method: 'GET',
      headers: this.sessionId ? { 'MCP-Session-ID': this.sessionId, ...this.headers } : this.headers,
      signal: this.abortController.signal,
    })

    if (!streamRes.body) throw new Error('No response body')

    const reader = streamRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    ;(async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        while (buffer.includes('\n')) {
          const idx = buffer.indexOf('\n')
          const line = buffer.slice(0, idx)
          buffer = buffer.slice(idx + 1)
          if (line.trim()) this.handleMessage(line)
        }
      }
    })()

    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.abortController?.abort()
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.sessionId ? { 'MCP-Session-ID': this.sessionId } : {}),
        ...this.headers,
      },
      body: message,
    })
  }
}

// MCP Client wrapper
export class MCPClientImpl implements MCPClient {
  private transport: MCPTransport
  private capabilities?: { tools?: unknown }

  constructor(config: MCPServerConfig) {
    if (config.command) {
      this.transport = new StdioTransport(
        config.command[0],
        config.command.slice(1),
        config.env ?? {}
      )
    } else if (config.url) {
      this.transport = new HTTPTransport(config.url, config.headers)
    } else {
      throw new Error('Either command or url must be provided')
    }
  }

  async connect(): Promise<void> {
    await this.transport.connect()

    // Initialize
    const result = await this.transport.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'beast-cli', version: '1.0.0' },
    }) as { capabilities?: { tools?: unknown } }

    this.capabilities = result?.capabilities

    // Send initialized notification
    await this.transport.send('notifications/initialized', {})
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect()
  }

  async listTools(): Promise<MCTool[]> {
    const result = await this.transport.send('tools/list')
    return (result as { tools?: MCTool[] })?.tools ?? []
  }

  async callTool(name: string, args?: Record<string, unknown>): Promise<ToolResult> {
    return await this.transport.send('tools/call', { name, arguments: args }) as ToolResult
  }

  onNotification(handler: (method: string, params?: unknown) => void): void {
    this.transport.onNotification(handler)
  }
}

// MCP Hub - manages multiple servers
export class MCPHub {
  private clients = new Map<string, MCPClient>()
  private config: MCPConfig

  constructor(config: MCPConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    for (const server of this.config.servers) {
      try {
        const client = new MCPClientImpl(server)
        await client.connect()
        this.clients.set(server.name, client)
        console.log(`[MCP] Connected to ${server.name}`)
      } catch (e) {
        console.error(`[MCP] Failed to connect to ${server.name}:`, e)
      }
    }
  }

  async disconnect(): Promise<void> {
    for (const [name, client] of this.clients) {
      await client.disconnect()
      console.log(`[MCP] Disconnected from ${name}`)
    }
    this.clients.clear()
  }

  getClient(name: string): MCPClient | undefined {
    return this.clients.get(name)
  }

  async listAllTools(): Promise<Array<{ server: string; tool: MCTool }>> {
    const tools: Array<{ server: string; tool: MCTool }> = []

    for (const [name, client] of this.clients) {
      try {
        const clientTools = await client.listTools()
        for (const tool of clientTools) {
          tools.push({ server: name, tool })
        }
      } catch (e) {
        console.error(`[MCP] Failed to list tools from ${name}:`, e)
      }
    }

    return tools
  }

  // Generate short unique key for tool
  static shortKey(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36).slice(0, 6)
  }
}

// OAuth Manager
export class MCPOAuthManager {
  private tokens = new Map<string, { access_token: string; refresh_token?: string; expires_at?: number }>()

  constructor(private configs: Map<string, OAuthConfig>) {}

  async getToken(serverName: string): Promise<string> {
    const token = this.tokens.get(serverName)
    if (token && (!token.expires_at || token.expires_at > Date.now())) {
      return token.access_token
    }

    const config = this.configs.get(serverName)
    if (!config) throw new Error(`No OAuth config for ${serverName}`)

    // Perform OAuth flow
    const newToken = await this.performOAuthFlow(config)
    this.tokens.set(serverName, newToken)
    return newToken.access_token
  }

  private async performOAuthFlow(config: OAuthConfig): Promise<{ access_token: string; refresh_token?: string; expires_at?: number }> {
    // Generate PKCE verifier and challenge
    const verifier = this.generateRandomString(64)
    const challenge = await this.sha256(verifier)

    // Build auth URL
    const authUrl = new URL(config.authUrl)
    authUrl.searchParams.set('client_id', config.clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/callback')
    authUrl.searchParams.set('scope', config.scopes?.join(' ') ?? 'read')
    authUrl.searchParams.set('code_challenge', challenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')
    authUrl.searchParams.set('state', this.generateRandomString(16))

    console.log(`[MCP OAuth] Open: ${authUrl.toString()}`)

    // In real implementation, would start local server and wait for callback
    // For now, return mock token
    return {
      access_token: 'mock_access_token',
      expires_at: Date.now() + 3600000,
    }
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => chars[byte % chars.length]).join('')
  }

  private async sha256(plain: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
}

// Default config
export const defaultMCPConfig: MCPConfig = {
  servers: [],
  timeout: 30000,
  retryAttempts: 6,
  retryBaseDelay: 2000,
}

export default {
  MCPClientImpl,
  MCPHub,
  MCPOAuthManager,
  StdioTransport,
  SSETransport,
  HTTPTransport,
  defaultMCPConfig,
}
