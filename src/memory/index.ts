// Memory System - Persistent file-based memory with typed taxonomy
// Based on Claude Code's memory system

export interface MemoryMetadata {
  name: string
  description: string
  type: 'user' | 'feedback' | 'project' | 'reference'
  updatedAt: string
}

export interface MemoryEntry extends MemoryMetadata {
  content: string
  filePath: string
}

// Memory file frontmatter format
export function formatMemoryFrontmatter(memory: MemoryMetadata): string {
  return `---
name: ${memory.name}
description: ${memory.description}
type: ${memory.type}
updatedAt: ${memory.updatedAt}
---

${memory.content ?? ''}`
}

export function parseMemoryFile(content: string): {
  metadata: MemoryMetadata
  content: string
} | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!frontmatterMatch) return null

  const yaml = frontmatterMatch[1]
  const body = frontmatterMatch[2]

  const nameMatch = yaml.match(/name:\s*(.+)/)
  const descMatch = yaml.match(/description:\s*(.+)/)
  const typeMatch = yaml.match(/type:\s*(user|feedback|project|reference)/)
  const updatedMatch = yaml.match(/updatedAt:\s*(.+)/)

  if (!nameMatch || !typeMatch) return null

  return {
    metadata: {
      name: nameMatch[1].trim(),
      description: descMatch?.[1]?.trim() ?? '',
      type: typeMatch[1] as MemoryMetadata['type'],
      updatedAt: updatedMatch?.[1]?.trim() ?? new Date().toISOString(),
    },
    content: body.trim(),
  }
}

// Save a memory to file
export async function saveMemory(
  memoryDir: string,
  type: MemoryMetadata['type'],
  name: string,
  content: string,
  description: string
): Promise<string> {
  const { writeFile, mkdir } = await import('node:fs/promises')
  const { join } = await import('path')

  // Ensure memory directory exists
  await mkdir(memoryDir, { recursive: true })

  // Generate filename from name
  const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '.md'
  const filePath = join(memoryDir, filename)

  const metadata: MemoryMetadata = {
    name,
    description,
    type,
    updatedAt: new Date().toISOString(),
  }

  const frontmatter = formatMemoryFrontmatter(metadata)
  await writeFile(filePath, frontmatter + content, 'utf-8')

  return filePath
}

// Load all memories from directory
export async function loadMemories(memoryDir: string): Promise<MemoryEntry[]> {
  const { readdir, readFile } = await import('node:fs/promises')
  const { join } = await import('path')

  try {
    const files = await readdir(memoryDir)
    const memories: MemoryEntry[] = []

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      try {
        const content = await readFile(join(memoryDir, file), 'utf-8')
        const parsed = parseMemoryFile(content)
        if (parsed) {
          memories.push({
            ...parsed.metadata,
            content: parsed.content,
            filePath: join(memoryDir, file),
          })
        }
      } catch {
        // Skip unreadable files
      }
    }

    return memories
  } catch {
    return [] // Directory doesn't exist yet
  }
}

// Check if memory is stale (>24 hours old)
export function isStale(memory: MemoryEntry): boolean {
  const updated = new Date(memory.updatedAt)
  const now = new Date()
  const diffHours = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)
  return diffHours > 24
}

// Update MEMORY.md index
export async function updateMemoryIndex(
  memoryDir: string,
  memories: MemoryEntry[]
): Promise<void> {
  const { writeFile } = await import('node:fs/promises')

  // Sort by type then name
  memories.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type)
    return a.name.localeCompare(b.name)
  })

  const lines: string[] = [
    '# Memory Index',
    '',
    '**Purpose**: Token-efficient navigation for implementation agents',
    `**Total Files**: ${memories.length}`,
    '**Usage**: Read this file first, then load specific topic files as needed',
    '',
  ]

  const byType = new Map<string, MemoryEntry[]>()
  for (const mem of memories) {
    const existing = byType.get(mem.type) ?? []
    existing.push(mem)
    byType.set(mem.type, existing)
  }

  for (const [type, entries] of byType) {
    lines.push(`## ${type}`)
    for (const entry of entries) {
      const filename = entry.filePath.split('/').pop()
      lines.push(`- [${entry.name}](${filename}) — ${entry.description}`)
    }
    lines.push('')
  }

  const content = lines.join('\n')
  await writeFile(memoryDir + 'MEMORY.md', content, 'utf-8')
}

// Extract relevant memories based on query
export async function recallMemories(
  memoryDir: string,
  query: string,
  limit = 5
): Promise<MemoryEntry[]> {
  const memories = await loadMemories(memoryDir)

  // Simple relevance scoring based on query words
  const queryWords = query.toLowerCase().split(/\s+/)
  const scored = memories.map(mem => {
    const score = queryWords.filter(word =>
      mem.name.toLowerCase().includes(word) ||
      mem.description.toLowerCase().includes(word) ||
      mem.content.toLowerCase().includes(word)
    ).length
    return { memory: mem, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.memory)
}

// Truncate index if too large
export async function truncateIndexIfNeeded(
  memoryDir: string,
  maxLines = 200,
  maxBytes = 25000
): Promise<boolean> {
  const { readFile, writeFile } = await import('node:fs/promises')

  try {
    const content = await readFile(memoryDir + 'MEMORY.md', 'utf-8')
    const lines = content.trim().split('\n')

    if (lines.length <= maxLines && content.length <= maxBytes) {
      return false // No truncation needed
    }

    const truncatedLines = lines.slice(0, maxLines)
    let truncated = truncatedLines.join('\n')

    // Truncate by bytes at last newline
    if (truncated.length > maxBytes) {
      const cutAt = truncated.lastIndexOf('\n', maxBytes)
      truncated = truncated.slice(0, cutAt > 0 ? cutAt : maxBytes)
    }

    const reason = lines.length > maxLines
      ? `${lines.length} lines (limit: ${maxLines})`
      : `${content.length} bytes (limit: ${maxBytes})`

    truncated += `\n\n> WARNING: MEMORY.md truncated to ${reason}. Keep entries concise.`

    await writeFile(memoryDir + 'MEMORY.md', truncated, 'utf-8')
    return true
  } catch {
    return false
  }
}

// Team memory sync
export class TeamMemorySync {
  private syncInterval: number
  private lastSync: Date | null = null

  constructor(syncIntervalMinutes = 5) {
    this.syncInterval = syncIntervalMinutes * 60 * 1000
  }

  async sync(teamDir: string, agentId: string): Promise<void> {
    // Load team memories and merge
    const teamMemories = await loadMemories(teamDir)
    this.lastSync = new Date()

    // In a real implementation, this would use SendMessage or similar
    // For now, just update local state
    console.log(`[TeamSync] Synced ${teamMemories.length} memories at ${this.lastSync.toISOString()}`)
  }

  shouldSync(): boolean {
    if (!this.lastSync) return true
    return Date.now() - this.lastSync.getTime() > this.syncInterval
  }
}

// Memory Store - main entry point
export class MemoryStore {
  private memoryDir: string

  constructor(memoryDir: string) {
    this.memoryDir = memoryDir.endsWith('/') ? memoryDir : memoryDir + '/'
  }

  async save(type: MemoryMetadata['type'], name: string, description: string, content: string): Promise<MemoryEntry> {
    const path = await saveMemory(this.memoryDir, type, name, content, description)
    const memories = await loadMemories(this.memoryDir)
    await updateMemoryIndex(this.memoryDir, memories)
    await truncateIndexIfNeeded(this.memoryDir)

    return {
      name,
      description,
      type,
      updatedAt: new Date().toISOString(),
      content,
      filePath: path,
    }
  }

  async recall(query: string, limit = 5): Promise<MemoryEntry[]> {
    return recallMemories(this.memoryDir, query, limit)
  }

  async list(): Promise<MemoryEntry[]> {
    return loadMemories(this.memoryDir)
  }

  async listStale(): Promise<MemoryEntry[]> {
    const memories = await loadMemories(this.memoryDir)
    return memories.filter(isStale)
  }

  getDir(): string {
    return this.memoryDir
  }
}

// Default store for user's memory
export function createMemoryStore(projectSlug: string): MemoryStore {
  const { homedir } = require('os')
  const baseDir = `${homedir()}/.claude/projects/${projectSlug}/memory/`
  return new MemoryStore(baseDir)
}