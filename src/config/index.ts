// Configuration System for Beast CLI

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

export interface BeastConfig {
  // General
  model?: string
  apiKey?: string

  // Permission
  defaultMode?: 'plan' | 'default' | 'acceptEdits' | 'auto' | 'bypass' | 'dontAsk'

  // Model settings
  temperature?: number
  maxTokens?: number

  // Tool settings
  maxToolResultChars?: number
  toolTimeout?: number

  // UI settings
  theme?: 'dark' | 'light' | 'terminal'
  showTimestamps?: boolean
  verbose?: boolean

  // Git settings
  autoCommit?: boolean
  commitMessage?: string

  // MCP settings
  mcpServers?: Record<string, {
    type: 'stdio' | 'http'
    command?: string
    url?: string
  }>
}

// Environment variable expansion
function expandEnvVars(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_, varName) => {
    return process.env[varName] ?? ''
  })
}

// Parse YAML-like config (simple implementation)
function parseConfig(content: string): Partial<BeastConfig> {
  const config: Record<string, unknown> = {}

  // Simple key: value parsing
  const lines = content.split('\n')
  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) continue

    // Parse key: value
    const match = line.match(/^(\w+):\s*(.+)$/)
    if (match && match[1] && match[2]) {
      const key = match[1]
      const rawValue = match[2].trim()
      let value: unknown = rawValue

      // Handle quoted strings
      if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
        value = rawValue.slice(1, -1)
      } else if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
        value = rawValue.slice(1, -1)
      }

      // Handle numbers
      else if (!isNaN(Number(rawValue))) {
        value = Number(rawValue)
      }

      // Handle booleans
      else if (rawValue === 'true') {
        value = true
      } else if (rawValue === 'false') {
        value = false
      }

      // Handle nested objects (simple, no indent handling)
      else if (rawValue.startsWith('{') && rawValue.endsWith('}')) {
        try {
          value = JSON.parse(rawValue)
        } catch {
          // Keep as string
        }
      }

      // Expand environment variables
      if (typeof value === 'string') {
        value = expandEnvVars(value)
      }

      config[key] = value
    }
  }

  return config as Partial<BeastConfig>
}

// Load config from file
export function loadConfig(configPath?: string): BeastConfig {
  const paths = [
    configPath ?? '.beast-cli.yml',
    configPath ?? '.beast-cli.yaml',
    resolve(process.env.HOME ?? '~', '.beast-cli.yml'),
  ]

  for (const path of paths) {
    if (existsSync(path)) {
      try {
        const content = readFileSync(path, 'utf-8')
        const parsed = parseConfig(content)

        // Merge with defaults
        return {
          ...defaultConfig,
          ...parsed,
        }
      } catch (error) {
        console.warn(`Failed to load config from ${path}:`, error)
      }
    }
  }

  return defaultConfig
}

// Default configuration
export const defaultConfig: BeastConfig = {
  model: 'claude-3-5-sonnet-20241022',
  defaultMode: 'default',
  temperature: 0.7,
  maxTokens: 4096,
  maxToolResultChars: 10_000,
  toolTimeout: 30_000,
  theme: 'dark',
  showTimestamps: true,
  verbose: false,
  autoCommit: false,
}

// Validate config
export function validateConfig(config: BeastConfig): string[] {
  const errors: string[] = []

  // Validate mode
  const validModes = ['plan', 'default', 'acceptEdits', 'auto', 'bypass', 'dontAsk']
  if (config.defaultMode && !validModes.includes(config.defaultMode)) {
    errors.push(`Invalid defaultMode: ${config.defaultMode}`)
  }

  // Validate theme
  const validThemes = ['dark', 'light', 'terminal']
  if (config.theme && !validThemes.includes(config.theme)) {
    errors.push(`Invalid theme: ${config.theme}`)
  }

  // Validate numbers
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('temperature must be between 0 and 2')
  }

  if (config.maxTokens !== undefined && config.maxTokens < 1) {
    errors.push('maxTokens must be positive')
  }

  return errors
}

export default {
  loadConfig,
  validateConfig,
  defaultConfig,
}