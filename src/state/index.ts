// State Persistence using Bun's built-in SQLite

import { Database } from 'bun:sqlite'

export interface Session {
  id: string
  messages: string // JSON serialized
  createdAt: number
  updatedAt: number
}

export interface ChatHistory {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

// In-memory database (file-based persistence)
let db: Database | null = null

export function initDB(dbPath = './beast-state.db'): Database {
  if (db) return db

  db = new Database(dbPath)

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      messages TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      expires_at INTEGER
    )
  `)

  return db
}

// Session operations
let sessionCounter = 0

export function createSession(id?: string): Session {
  const database = initDB()
  const sessionId = id ?? `session-${Date.now()}-${++sessionCounter}`
  const now = Date.now()

  database.run(
    'INSERT INTO sessions (id, messages, created_at, updated_at) VALUES (?, ?, ?, ?)',
    [sessionId, '[]', now, now]
  )

  return {
    id: sessionId,
    messages: '[]',
    createdAt: now,
    updatedAt: now,
  }
}

export function getSession(id: string): Session | null {
  const database = initDB()
  const result = database.query(
    'SELECT id, messages, created_at as createdAt, updated_at as updatedAt FROM sessions WHERE id = ?'
  ).get(id) as Session | undefined

  return result ?? null
}

export function updateSession(id: string, messages: unknown[]): void {
  const database = initDB()
  database.run(
    'UPDATE sessions SET messages = ?, updated_at = ? WHERE id = ?',
    [JSON.stringify(messages), Date.now(), id]
  )
}

export function listSessions(limit = 10): Session[] {
  const database = initDB()
  const results = database.query(
    'SELECT id, messages, created_at as createdAt, updated_at as updatedAt FROM sessions ORDER BY updated_at DESC LIMIT ?'
  ).all(limit) as Session[]

  return results
}

export function deleteSession(id: string): void {
  const database = initDB()
  database.run('DELETE FROM chat_history WHERE session_id = ?', [id])
  database.run('DELETE FROM sessions WHERE id = ?', [id])
}

// Chat history operations
let messageCounter = 0

export function addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): ChatHistory {
  const database = initDB()
  const id = `msg-${Date.now()}-${++messageCounter}`
  const timestamp = Date.now()

  database.run(
    'INSERT INTO chat_history (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    [id, sessionId, role, content, timestamp]
  )

  return { id, sessionId, role, content, timestamp }
}

export function getHistory(sessionId: string, limit = 100): ChatHistory[] {
  const database = initDB()
  const results = database.query(
    'SELECT id, session_id as sessionId, role, content, timestamp FROM chat_history WHERE session_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).all(sessionId, limit) as ChatHistory[]

  return results.reverse()
}

export function searchHistory(query: string, limit = 20): ChatHistory[] {
  const database = initDB()
  const results = database.query(
    'SELECT id, session_id as sessionId, role, content, timestamp FROM chat_history WHERE content LIKE ? ORDER BY timestamp DESC LIMIT ?'
  ).all(`%${query}%`, limit) as ChatHistory[]

  return results
}

// Cache operations
export function setCache(key: string, value: unknown, ttl?: number): void {
  const database = initDB()
  const expiresAt = ttl ? Date.now() + ttl : null

  database.run(
    'INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)',
    [key, JSON.stringify(value), expiresAt]
  )
}

export function getCache<T>(key: string): T | null {
  const database = initDB()
  const result = database.query(
    'SELECT value, expires_at FROM cache WHERE key = ?'
  ).get(key) as { value: string; expires_at: number | null } | undefined

  if (!result) return null

  // Check expiration
  if (result.expires_at && result.expires_at < Date.now()) {
    database.run('DELETE FROM cache WHERE key = ?', [key])
    return null
  }

  return JSON.parse(result.value) as T
}

export function clearCache(): void {
  const database = initDB()
  database.run('DELETE FROM cache')
}

// Close database
export function closeDB(): void {
  if (db) {
    db.close()
    db = null
  }
}

export default {
  initDB,
  createSession,
  getSession,
  updateSession,
  listSessions,
  deleteSession,
  addMessage,
  getHistory,
  searchHistory,
  setCache,
  getCache,
  clearCache,
  closeDB,
}