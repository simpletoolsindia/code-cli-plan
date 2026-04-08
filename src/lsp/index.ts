// LSP Integration - Language Server Protocol client
// Based on OpenCode's Effect-based LSP implementation

export type LanguageId =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'go'
  | 'ruby'
  | 'java'
  | 'kotlin'
  | 'dart'
  | 'cpp'
  | 'c'
  | 'csharp'
  | 'php'
  | 'swift'
  | 'html'
  | 'css'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'sql'

export interface LSPClient {
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  getCapabilities(): LSPServerCapabilities
}

export interface LSPPosition {
  line: number
  character: number
}

export interface LSPRange {
  start: LSPPosition
  end: LSPPosition
}

export interface LSPDocument {
  uri: string
  languageId: LanguageId
  version: number
  content: string
}

export interface LSPHover {
  contents: string | { language: string; value: string }
  range?: LSPRange
}

export interface LSPDefinition {
  uri: string
  range: LSPRange
}

export interface LSPLocation {
  uri: string
  range: LSPRange
}

export interface LSPDiagnostic {
  severity: 'error' | 'warning' | 'information' | 'hint'
  message: string
  range: LSPRange
  source?: string
  code?: string | number
}

export interface LSPServerCapabilities {
  hoverProvider?: boolean
  definitionProvider?: boolean
  referencesProvider?: boolean
  diagnosticProvider?: {
    interFileDependencies: boolean
    workspaceDiagnostics: boolean
  }
  textDocumentSync?: number
}

// Language server configuration
export interface LSPServerConfig {
  languageId: LanguageId
  command: string[]
  rootUri?: string
  debug?: boolean
}

// Language to server mapping
export const LANGUAGE_SERVERS: Record<LanguageId, string[]> = {
  typescript: ['typescript-language-server', '--stdio'],
  javascript: ['typescript-language-server', '--stdio'],
  python: ['pyright-langserver', '--stdio'],
  rust: ['rust-analyzer', '+x'],
  go: ['gopls'],
  ruby: ['solargraph', 'stdio'],
  java: ['jdtls'],
  kotlin: ['kotlin-language-server'],
  dart: ['dart_language_server'],
  cpp: ['clangd'],
  c: ['clangd'],
  csharp: ['omnisharp', '--languageserver'],
  php: ['php-language-server'],
  swift: ['sourcekit-lsp'],
  html: ['vscode-html-language-server', '--stdio'],
  css: ['vscode-css-language-server', '--stdio'],
  json: ['vscode-json-language-server', '--stdio'],
  yaml: ['yaml-language-server', '--stdio'],
  markdown: ['markdown-language-server', '--stdio'],
  sql: ['sql-language-server', '--method', 'stdio'],
}

// LSP message types
type MessageMethod =
  | 'initialize'
  | 'initialized'
  | 'shutdown'
  | 'exit'
  | 'textDocument/didOpen'
  | 'textDocument/didChange'
  | 'textDocument/didClose'
  | 'textDocument/hover'
  | 'textDocument/definition'
  | 'textDocument/references'
  | 'textDocument/publishDiagnostics'
  | 'workspace/diagnostics'

interface LSPMessage {
  jsonrpc: '2.0'
  id?: number | string
  method?: MessageMethod
  params?: unknown
  result?: unknown
  error?: { code: number; message: string }
}

// LSP Client implementation
export class LSPClientImpl implements LSPClient {
  private connected = false
  private capabilities: LSPServerCapabilities = {}
  private documents: Map<string, LSPDocument> = new Map()
  private diagnosticsCallback?: (uri: string, diagnostics: LSPDiagnostic[]) => void
  private pendingRequests: Map<number, { resolve: (value: unknown) => void; reject: (err: Error) => void }> = new Map()
  private messageId = 0

  constructor(
    private config: LSPServerConfig,
    private process?: ReturnType<typeof import('node:child_process').spawn>
  ) {}

  async connect(): Promise<void> {
    if (this.connected) return

    const { spawn } = await import('node:child_process')

    this.process = spawn(this.config.command[0], this.config.command.slice(1), {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let buffer = ''

    this.process.stdout?.on('data', (data: Buffer) => {
      buffer += data.toString()
      this.processMessages(buffer)
    })

    this.process.stderr?.on('data', (data: Buffer) => {
      console.error('[LSP stderr]:', data.toString())
    })

    this.process.on('close', () => {
      this.connected = false
    })

    // Initialize
    await this.initialize()

    this.connected = true
  }

  private processMessages(buffer: string): void {
    // Simple JSON-RPC message parsing
    const lines = buffer.split('\n')
    for (const line of lines) {
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const msg: LSPMessage = JSON.parse(line)
          this.handleMessage(msg)
        } catch {
          // Incomplete message, wait for more data
        }
      }
    }
  }

  private handleMessage(msg: LSPMessage): void {
    if (msg.id !== undefined && this.pendingRequests.has(msg.id as number)) {
      const pending = this.pendingRequests.get(msg.id as number)!
      this.pendingRequests.delete(msg.id as number)
      if (msg.error) {
        pending.reject(new Error(msg.error.message))
      } else {
        pending.resolve(msg.result)
      }
    } else if (msg.method === 'textDocument/publishDiagnostics' && this.diagnosticsCallback) {
      const params = msg.params as { uri: string; diagnostics: LSPDiagnostic[] }
      this.diagnosticsCallback(params.uri, params.diagnostics)
    }
  }

  private async sendRequest<T>(method: MessageMethod, params?: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.process) {
        reject(new Error('Not connected'))
        return
      }

      const id = ++this.messageId
      const msg: LSPMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      }

      this.pendingRequests.set(id, { resolve: resolve as (value: unknown) => void, reject })
      this.process.stdin?.write(JSON.stringify(msg) + '\n')

      // Timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error(`Request ${method} timed out`))
        }
      }, 10000)
    })
  }

  private async initialize(): Promise<void> {
    const result = await this.sendRequest<{
      capabilities: LSPServerCapabilities
    }>('initialize', {
      processId: process.pid,
      rootUri: this.config.rootUri ?? null,
      capabilities: {
        textDocument: {
          hover: true,
          definition: true,
          references: true,
          synchronization: { full: true },
        },
        workspace: {
          diagnostics: true,
        },
      },
    })

    this.capabilities = result.capabilities
  }

  async disconnect(): Promise<void> {
    if (!this.connected || !this.process) return

    try {
      await this.sendRequest('shutdown')
    } catch {}

    this.process.kill()
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  getCapabilities(): LSPServerCapabilities {
    return this.capabilities
  }

  // Document management
  openDocument(doc: LSPDocument): void {
    this.documents.set(doc.uri, doc)
    this.sendRequest('textDocument/didOpen', {
      textDocument: {
        uri: doc.uri,
        languageId: doc.languageId,
        version: doc.version,
        text: doc.content,
      },
    })
  }

  updateDocument(uri: string, content: string, version: number): void {
    const doc = this.documents.get(uri)
    if (doc) {
      doc.content = content
      doc.version = version
    }
    this.sendRequest('textDocument/didChange', {
      textDocument: { uri, version },
      contentChanges: [{ text: content }],
    })
  }

  closeDocument(uri: string): void {
    this.documents.delete(uri)
    this.sendRequest('textDocument/didClose', {
      textDocument: { uri },
    })
  }

  // Hover
  async hover(uri: string, position: LSPPosition): Promise<LSPHover | null> {
    try {
      const result = await this.sendRequest<{
        contents: LSPHover['contents']
        range?: LSPRange
      }>('textDocument/hover', {
        textDocument: { uri },
        position,
      })
      return result ?? null
    } catch {
      return null
    }
  }

  // Go-to-definition
  async getDefinition(uri: string, position: LSPPosition): Promise<LSPDefinition | null> {
    try {
      const result = await this.sendRequest<{
        uri: string
        range: LSPRange
      } | null>('textDocument/definition', {
        textDocument: { uri },
        position,
      })
      return result ?? null
    } catch {
      return null
    }
  }

  // Find references
  async findReferences(uri: string, position: LSPPosition): Promise<LSPLocation[]> {
    try {
      const result = await this.sendRequest<LSPLocation[] | null>('textDocument/references', {
        textDocument: { uri },
        position,
        context: { includeDeclaration: true },
      })
      return result ?? []
    } catch {
      return []
    }
  }

  // Set diagnostics callback
  onDiagnostics(callback: (uri: string, diagnostics: LSPDiagnostic[]) => void): void {
    this.diagnosticsCallback = callback
  }
}

// Factory to create LSP client for a language
export async function createLSPClient(languageId: LanguageId): Promise<LSPClientImpl> {
  const serverCmd = LANGUAGE_SERVERS[languageId]
  if (!serverCmd) {
    throw new Error(`No LSP server configured for ${languageId}`)
  }

  const client = new LSPClientImpl({
    languageId,
    command: serverCmd,
  })

  await client.connect()
  return client
}

// Auto-detect language from file extension
export function detectLanguage(filename: string): LanguageId | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, LanguageId> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    rb: 'ruby',
    java: 'java',
    kt: 'kotlin',
    dart: 'dart',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    html: 'html',
    css: 'css',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
  }
  return ext ? map[ext] ?? null : null
}

// URI helpers
export function pathToUri(path: string): string {
  return `file://${path}`
}

export function uriToPath(uri: string): string {
  return uri.replace(/^file:\/\//, '')
}

export default {
  LANGUAGE_SERVERS,
  createLSPClient,
  detectLanguage,
  pathToUri,
  uriToPath,
  LSPClientImpl,
}
