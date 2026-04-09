import type { Tool } from './Tool.ts'
import { BashTool } from './BashTool.ts'
import { FileReadTool } from './FileReadTool.ts'
import { FileEditTool } from './FileEditTool.ts'
import { GlobTool } from './GlobTool.ts'
import { GrepTool } from './GrepTool.ts'

// Registry of all built-in tools
export const builtInTools: Tool[] = [
  BashTool,
  FileReadTool,
  FileEditTool,
  GlobTool,
  GrepTool,
]

// Get all tools
export function getTools(): Tool[] {
  return [...builtInTools]
}

// Get tool by name
export function getToolByName(name: string): Tool | undefined {
  return builtInTools.find(t => t.name === name || t.aliases?.includes(name))
}

// Assemble tool pool (for adding MCP tools later)
export function assembleToolPool(additionalTools: Tool[] = []): Tool[] {
  const tools = [...builtInTools]

  // Add MCP tools, deduplicating by name
  for (const tool of additionalTools) {
    if (!tools.some(t => t.name === tool.name)) {
      tools.push(tool)
    }
  }

  return tools
}

// Export types
export type { Tool } from './Tool.ts'
