// Collaboration Modes - Mode-specific behavior and configurations
// Based on Codex-RS's collaboration modes

export type CollabMode = 'solo' | 'pair' | 'review' | 'teach' | 'custom'

export interface ModeConfig {
  name: string
  mode: CollabMode
  description: string
  availableTools: string[]
  promptVariants: string[]
  visibility: {
    tui: boolean
    tools: boolean
    thinking: boolean
  }
  hooks: string[]  // Hook names to enable
  maxTokens: number
  autoApprove: boolean  // Auto-approve certain actions
  customRules?: string[]
}

// Pre-configured collaboration modes
export const COLLAB_MODES: Record<CollabMode, ModeConfig> = {
  solo: {
    name: 'Solo Mode',
    mode: 'solo',
    description: 'Standard single-user mode with full access',
    availableTools: ['*'],  // All tools
    promptVariants: ['generic'],
    visibility: {
      tui: true,
      tools: true,
      thinking: false,
    },
    hooks: [],
    maxTokens: 50000,
    autoApprove: false,
  },
  pair: {
    name: 'Pair Programming',
    mode: 'pair',
    description: 'Two AI agents working together with shared context',
    availableTools: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob', 'TaskCreate', 'TaskUpdate', 'TaskList'],
    promptVariants: ['generic', 'next_gen'],
    visibility: {
      tui: true,
      tools: true,
      thinking: true,  // Show thinking for collaboration
    },
    hooks: ['pre-edit-notify', 'post-commit-notify'],
    maxTokens: 40000,
    autoApprove: false,
  },
  review: {
    name: 'Code Review',
    mode: 'review',
    description: 'Focused review mode with limited editing',
    availableTools: ['Read', 'Grep', 'Glob', 'Bash'],
    promptVariants: ['xs'],
    visibility: {
      tui: true,
      tools: false,  // Limited tools
      thinking: true,
    },
    hooks: ['review-summary'],
    maxTokens: 20000,
    autoApprove: false,
  },
  teach: {
    name: 'Teaching Mode',
    mode: 'teach',
    description: 'Explain and educate with reduced tool access',
    availableTools: ['Read', 'Grep', 'Glob'],
    promptVariants: ['xs'],
    visibility: {
      tui: true,
      tools: false,
      thinking: true,
    },
    hooks: ['teach-explain'],
    maxTokens: 30000,
    autoApprove: true,  // Auto-approve explanatory responses
  },
  custom: {
    name: 'Custom Mode',
    mode: 'custom',
    description: 'User-defined collaboration mode',
    availableTools: [],
    promptVariants: ['generic'],
    visibility: {
      tui: true,
      tools: true,
      thinking: false,
    },
    hooks: [],
    maxTokens: 50000,
    autoApprove: false,
  },
}

// Mode manager
export class CollabModeManager {
  private currentMode: CollabMode = 'solo'
  private customModes: Map<string, ModeConfig> = new Map()
  private onModeChange?: (mode: CollabMode) => void

  constructor(onModeChange?: (mode: CollabMode) => void) {
    this.onModeChange = onModeChange
  }

  // Get current mode config
  getMode(): ModeConfig {
    const custom = this.customModes.get(this.currentMode)
    if (custom) return custom

    const baseConfig = COLLAB_MODES[this.currentMode]
    // Ensure all required fields with defaults
    return {
      ...baseConfig,
      autoApprove: baseConfig.autoApprove ?? false,
    } as ModeConfig
  }

  // Get all available modes
  getAllModes(): ModeConfig[] {
    return [
      ...Object.values(COLLAB_MODES),
      ...Array.from(this.customModes.values()),
    ]
  }

  // Switch to a mode
  async switchMode(mode: CollabMode): Promise<void> {
    this.currentMode = mode
    console.log(`[Collab] Switched to ${COLLAB_MODES[mode]?.name ?? mode} mode`)

    if (this.onModeChange) {
      await this.onModeChange(mode)
    }
  }

  // Create custom mode
  createCustomMode(config: ModeConfig): void {
    this.customModes.set(config.name, { ...config, mode: 'custom' })
    console.log(`[Collab] Created custom mode: ${config.name}`)
  }

  // Delete custom mode
  deleteCustomMode(name: string): boolean {
    return this.customModes.delete(name)
  }

  // Check if tool is available in current mode
  isToolAvailable(toolName: string): boolean {
    const mode = this.getMode()
    if (mode.availableTools.includes('*')) return true
    return mode.availableTools.includes(toolName)
  }

  // Get prompt variant for current mode
  getPromptVariant(): string {
    const mode = this.getMode()
    return mode.promptVariants[0] ?? 'generic'
  }

  // Get visibility settings
  getVisibility(): ModeConfig['visibility'] {
    return this.getMode().visibility
  }

  // Should auto-approve?
  shouldAutoApprove(): boolean {
    return this.getMode().autoApprove
  }

  // Get max tokens for current mode
  getMaxTokens(): number {
    return this.getMode().maxTokens
  }

  // Serialize state for sharing
  serialize(): string {
    return JSON.stringify({
      currentMode: this.currentMode,
      customModes: Array.from(this.customModes.entries()),
    })
  }

  // Deserialize state
  deserialize(data: string): void {
    try {
      const parsed = JSON.parse(data)
      this.currentMode = parsed.currentMode ?? 'solo'
      if (parsed.customModes) {
        this.customModes = new Map(parsed.customModes)
      }
    } catch {
      // Ignore invalid data
    }
  }
}

// Preset configurations for common scenarios
export interface CollabPreset {
  mode: CollabMode
  availableTools: string[]
  maxTokens: number
  autoApprove?: boolean
  visibility?: {
    tui: boolean
    tools: boolean
    thinking: boolean
  }
}

export const COLLAB_PRESETS: Record<string, CollabPreset> = {
  // Quick review without editing
  readonly: {
    mode: 'review',
    availableTools: ['Read', 'Grep', 'Glob'],
    maxTokens: 15000,
    autoApprove: false,
  },

  // Full coding with all tools
  coding: {
    mode: 'solo',
    availableTools: ['*'],
    maxTokens: 50000,
    autoApprove: false,
  },

  // Teaching and explaining
  teaching: {
    mode: 'teach',
    availableTools: ['Read', 'Grep'],
    maxTokens: 25000,
    autoApprove: true,
  },

  // Pair programming session
  pairSession: {
    mode: 'pair',
    availableTools: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob'],
    visibility: {
      tui: true,
      tools: true,
      thinking: true,
    },
    maxTokens: 40000,
    autoApprove: false,
  },
}

// Apply preset
export function applyPreset(
  manager: CollabModeManager,
  presetName: string
): void {
  const preset = COLLAB_PRESETS[presetName]
  if (preset) {
    manager.switchMode(preset.mode)

    // Apply custom config from preset
    const mode = manager.getMode() as any
    if (mode) {
      mode.availableTools = preset.availableTools
      mode.maxTokens = preset.maxTokens ?? mode.maxTokens
      if (preset.autoApprove !== undefined) {
        mode.autoApprove = preset.autoApprove
      }
    }
  }
}

// Mode-specific tool filters
export function filterToolsForMode(
  allTools: string[],
  mode: CollabMode
): string[] {
  const modeConfig = COLLAB_MODES[mode]
  if (!modeConfig) return allTools

  if (modeConfig.availableTools.includes('*')) {
    return allTools
  }

  return allTools.filter(tool => modeConfig.availableTools.includes(tool))
}

// Mode-specific prompt templates
export function buildModePrompt(
  mode: CollabMode,
  basePrompt: string
): string {
  const modeConfig = COLLAB_MODES[mode]
  if (!modeConfig) return basePrompt

  const modeInstructions = {
    solo: 'You are working in solo mode with full access to all tools.',
    pair: 'You are collaborating in pair programming mode. Share your thinking process and coordinate with your partner.',
    review: 'You are in review mode. Focus on identifying issues, suggesting improvements, and explaining patterns.',
    teach: 'You are teaching mode. Explain concepts clearly, provide examples, and help the user understand.',
    custom: 'You are in custom collaboration mode. Follow the configured rules.',
  }

  return `${basePrompt}\n\n## Collaboration Mode\n${modeInstructions[mode] ?? ''}\n\n## Available Tools\n${modeConfig.availableTools.join(', ')}\n\n## Visibility Settings\n${modeConfig.visibility.thinking ? 'Your thinking process will be visible.' : 'Keep your reasoning internal.'}`
}

// Export shared session state
export interface SharedSession {
  id: string
  mode: CollabMode
  participants: string[]
  createdAt: Date
  sharedContext: Record<string, unknown>
}

export class SessionSharer {
  // Generate shareable session link/data
  static createShareableSession(
    manager: CollabModeManager,
    sessionId: string,
    participants: string[]
  ): SharedSession {
    const mode = manager.getMode()
    return {
      id: sessionId,
      mode: mode.mode,
      participants,
      createdAt: new Date(),
      sharedContext: {
        tools: mode.availableTools,
        maxTokens: mode.maxTokens,
        visibility: mode.visibility,
      },
    }
  }

  // Encode session for sharing
  static encodeSession(session: SharedSession): string {
    return Buffer.from(JSON.stringify(session)).toString('base64')
  }

  // Decode session from share
  static decodeSession(encoded: string): SharedSession | null {
    try {
      return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'))
    } catch {
      return null
    }
  }

  // Apply shared session to manager
  static applySession(
    manager: CollabModeManager,
    session: SharedSession
  ): void {
    manager.switchMode(session.mode)
    console.log(`[SessionShare] Applied session from ${session.participants.join(', ')}`)
  }
}