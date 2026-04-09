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

export type TransportType = 'stdio' | 'sse' | 'http' | 'websocket'

// ─── Core Interfaces ─────────────────────────────────────────────────────────────

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

// ─── Transport Base ─────────────────────────────────────────────────────────────

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
        const numericId = typeof msg.id === 'string' ? parseInt(msg.id, 10) : msg.id
        const pending = this.pendingRequests.get(numericId)
        if (pending) {
          this.pendingRequests.delete(numericId)
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

// ─── WebSocket Transport ─────────────────────────────────────────────────────────
export class WebSocketTransport extends BaseTransport {
  private socket?: globalThis.WebSocket
  private baseUrl: string
  private sessionId?: string
  private abortController?: AbortController
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 3

  constructor(url: string, private headers: Record<string, string> = {}) {
    super()
    this.baseUrl = url.replace(/^http/, 'ws')
  }

  async connect(): Promise<void> {
    this.abortController = new AbortController()

    await new Promise<void>((resolve, reject) => {
      try {
        this.socket = new globalThis.WebSocket(this.baseUrl)

        this.socket.onopen = () => {
          // Initialize MCP session
          this.send('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {}, roots: { listChanged: true } },
            clientInfo: { name: 'beast-cli', version: '1.0.0' },
          }).then(() => {
            this.connected = true
            this.reconnectAttempts = 0
            resolve()
          }).catch(reject)
        }

        this.socket.onmessage = (event) => {
          const message = event.data.toString()
          if (message.trim()) {
            this.handleMessage(message)
          }
        }

        this.socket.onerror = (error) => {
          console.error('[MCP WebSocket error]:', error)
        }

        this.socket.onclose = async () => {
          this.connected = false
          this.onDisconnect?.()

          // Attempt reconnection if not intentionally closed
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`[MCP] WebSocket closed, reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            await new Promise(r => setTimeout(r, 1000 * this.reconnectAttempts))
            try {
              await this.connect()
            } catch {
              // Reconnection failed, give up
            }
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  async disconnect(): Promise<void> {
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent reconnection
    this.abortController?.abort()
    this.socket?.close()
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== globalThis.WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'))
        return
      }

      try {
        this.socket.send(message)
        resolve()
      } catch (error) {
        reject(error)
      }
    })
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
    })

    this.process.stdout?.on('data', (data: Buffer) => {
      const message = data.toString()
      const lines = message.split('\n').filter(Boolean)
      for (const line of lines) {
        this.handleMessage(line)
      }
    })

    this.process.stderr?.on('data', (data: Buffer) => {
      console.error('[MCP Stderr]:', data.toString())
    })

    this.process.on('exit', () => {
      this.connected = false
      this.onDisconnect?.()
    })

    // Send initialize
    await this.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'beast-cli', version: '1.0.0' },
    })

    this.connected = true

    // Flush write buffer
    for (const msg of this.writeBuffer) {
      await this.sendRaw(msg)
    }
    this.writeBuffer = []
  }

  async disconnect(): Promise<void> {
    this.process?.kill()
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    if (!this.connected) {
      this.writeBuffer.push(message)
      return
    }

    return new Promise((resolve, reject) => {
      this.process?.stdin?.write(message + '\n', (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

// SSE Transport (Server-Sent Events)
export class SSETransport extends BaseTransport {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private eventSource?: any
  private baseUrl: string

  constructor(url: string, private headers: Record<string, string> = {}) {
    super()
    this.baseUrl = url
  }

  async connect(): Promise<void> {
    // EventSource is browser-only - for Node.js, use HTTP transport instead
    if (typeof globalThis.EventSource === 'undefined') {
      throw new Error('EventSource not available in this environment. Use HTTP transport.')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const EventSourceConstructor = globalThis.EventSource as any
    this.eventSource = new EventSourceConstructor(this.baseUrl)

    this.eventSource.onmessage = (event: { data: string }) => {
      if (event.data.trim()) {
        this.handleMessage(event.data)
      }
    }

    this.eventSource.onerror = () => {
      this.connected = false
      this.onDisconnect?.()
    }

    // Send initialize
    await this.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'beast-cli', version: '1.0.0' },
    })

    this.connected = true
  }

  async disconnect(): Promise<void> {
    this.eventSource?.close()
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    // SSE is receive-only, so this is a no-op
    // For bidirectional, use HTTP POST endpoint
    console.warn('[MCP SSE] sendRaw called on SSE-only transport')
  }
}

// HTTP Transport (long-polling or webhooks)
export class HTTPTransport extends BaseTransport {
  private baseUrl: string
  private pollInterval?: ReturnType<typeof setInterval>
  private lastEventId?: string

  constructor(url: string, private headers: Record<string, string> = {}) {
    super()
    this.baseUrl = url
  }

  async connect(): Promise<void> {
    // Send initialize
    await this.send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'beast-cli', version: '1.0.0' },
    })

    this.connected = true

    // Start polling for notifications
    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/notifications`, {
          headers: {
            ...this.headers,
            ...(this.lastEventId ? { 'Last-Event-ID': this.lastEventId } : {}),
          },
        })

        if (response.ok) {
          const data = await response.json() as { notifications?: unknown[]; lastEventId?: string }
          if (data.notifications?.length) {
            for (const notification of data.notifications) {
              this.handleMessage(JSON.stringify(notification))
            }
          }
          if (data.lastEventId) {
            this.lastEventId = data.lastEventId
          }
        }
      } catch (e) {
        console.error('[MCP HTTP poll error]:', e)
      }
    }, 5000)
  }

  async disconnect(): Promise<void> {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }
    this.connected = false
  }

  async sendRaw(message: string): Promise<void> {
    await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.headers },
      body: message,
    })
  }
}

// ─── MCP Client ────────────────────────────────────────────────────────────────

export class MCPClientImpl implements MCPClient {
  private transport: BaseTransport
  private tools: MCTool[] = []

  constructor(transport: BaseTransport) {
    this.transport = transport
  }

  async connect(): Promise<void> {
    await this.transport.connect()

    // List available tools
    const result = await this.transport.send('tools/list') as { tools?: MCTool[] }
    if (result.tools) {
      this.tools = result.tools
    }
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect()
  }

  async listTools(): Promise<MCTool[]> {
    if (!this.transport.isConnected()) {
      throw new Error('Not connected')
    }

    const result = await this.transport.send('tools/list') as { tools?: MCTool[] }
    return result.tools ?? []
  }

  async callTool(name: string, args?: Record<string, unknown>): Promise<ToolResult> {
    if (!this.transport.isConnected()) {
      throw new Error('Not connected')
    }

    const result = await this.transport.send('tools/call', { name, arguments: args }) as ToolResult
    return result
  }

  onNotification(handler: (method: string, params?: unknown) => void): void {
    this.transport.onNotification(handler)
  }
}

// ─── MCP Manager ────────────────────────────────────────────────────────────────

export class MCPHub {
  private clients = new Map<string, MCPClient>()
  private transportFactories: Record<TransportType, (config: MCPServerConfig) => BaseTransport> = {
    stdio: (config) => new StdioTransport(config.command?.[0] ?? '', config.command?.slice(1) ?? [], config.env ?? {}),
    websocket: (config) => new WebSocketTransport(config.url ?? '', config.headers ?? {}),
    sse: (config) => new SSETransport(config.url ?? '', config.headers ?? {}),
    http: (config) => new HTTPTransport(config.url ?? '', config.headers ?? {}),
  }

  async addServer(config: MCPServerConfig): Promise<void> {
    const url = config.url ?? ''
    const transportType = this.detectTransport(url, config.command)
    const factory = this.transportFactories[transportType]
    if (!factory) throw new Error(`Unknown transport type: ${transportType}`)

    const transport = factory(config)
    const client = new MCPClientImpl(transport as BaseTransport)

    await client.connect()
    this.clients.set(config.name, client)
  }

  removeServer(name: string): void {
    const client = this.clients.get(name)
    if (client) {
      client.disconnect()
      this.clients.delete(name)
    }
  }

  getClient(name: string): MCPClient | undefined {
    return this.clients.get(name)
  }

  async getAllTools(): Promise<MCTool[]> {
    const tools: MCTool[] = []
    for (const client of this.clients.values()) {
      const clientTools = await client.listTools()
      tools.push(...clientTools)
    }
    return tools
  }

  private detectTransport(url: string, command?: string[]): TransportType {
    if (command?.length) return 'stdio'
    if (url.startsWith('ws://') || url.startsWith('wss://')) return 'websocket'
    if (url.startsWith('http://') || url.startsWith('https://')) return 'http'
    return 'stdio'
  }
}

export default MCPHub
