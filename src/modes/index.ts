// Mode System - Permission modes for Beast CLI

export type PermissionMode =
  | 'plan'      // Read-only, explore and plan only
  | 'default'   // Interactive permission prompts
  | 'acceptEdits' // Auto-accept safe file edits
  | 'auto'      // AI classifies and auto-approves
  | 'bypass'    // No prompts, all allowed
  | 'dontAsk'    // Auto-deny, no prompts

export interface ModeConfig {
  name: PermissionMode
  description: string
  readOnly: boolean
  autoApprove: boolean
  allowDestructive: boolean
}

export const modeConfigs: Record<PermissionMode, ModeConfig> = {
  plan: {
    name: 'plan',
    description: 'Read-only mode - explore and plan only',
    readOnly: true,
    autoApprove: false,
    allowDestructive: false,
  },
  default: {
    name: 'default',
    description: 'Interactive mode - asks for permission on risky operations',
    readOnly: false,
    autoApprove: false,
    allowDestructive: false,
  },
  acceptEdits: {
    name: 'acceptEdits',
    description: 'Auto-accept safe file edits',
    readOnly: false,
    autoApprove: true,
    allowDestructive: false,
  },
  auto: {
    name: 'auto',
    description: 'AI classifies and auto-approves all operations',
    readOnly: false,
    autoApprove: true,
    allowDestructive: true,
  },
  bypass: {
    name: 'bypass',
    description: 'No prompts - all operations allowed',
    readOnly: false,
    autoApprove: true,
    allowDestructive: true,
  },
  dontAsk: {
    name: 'dontAsk',
    description: 'Auto-deny all operations',
    readOnly: true,
    autoApprove: false,
    allowDestructive: false,
  },
}

// Tools affected by mode restrictions
const writeTools = ['Edit', 'Write', 'Bash']
const destructiveTools = ['rm', 'format', 'mkfs', 'dd']

// Check if tool is allowed in current mode
export function canUseTool(
  toolName: string,
  mode: PermissionMode,
  isReadOnly: boolean,
  isDestructive?: boolean
): { allowed: boolean; reason?: string } {
  const config = modeConfigs[mode]

  // Read-only tools are always allowed
  if (isReadOnly && config.readOnly) {
    return { allowed: true }
  }

  // Don't ask mode - deny all
  if (mode === 'dontAsk') {
    return { allowed: false, reason: 'Mode is set to deny all operations' }
  }

  // Plan mode - only read-only tools
  if (mode === 'plan') {
    if (writeTools.includes(toolName)) {
      return { allowed: false, reason: 'Write tools not allowed in plan mode' }
    }
    if (isDestructive) {
      return { allowed: false, reason: 'Destructive operations not allowed in plan mode' }
    }
  }

  // Default mode - allow read-only, prompt for others
  if (mode === 'default') {
    if (isReadOnly) {
      return { allowed: true }
    }
    // Return false to trigger permission prompt
    return { allowed: false, reason: 'Permission required' }
  }

  // Auto, bypass modes - allow most things
  if (config.autoApprove) {
    if (isDestructive && !config.allowDestructive) {
      return { allowed: false, reason: 'Destructive operations require confirmation' }
    }
    return { allowed: true }
  }

  return { allowed: true }
}

// Mode cycle order
export const modeOrder: PermissionMode[] = [
  'plan',
  'default',
  'acceptEdits',
  'auto',
  'bypass',
  'dontAsk',
]

// Get next mode in cycle
export function getNextMode(current: PermissionMode): PermissionMode {
  const currentIndex = modeOrder.indexOf(current)
  const nextIndex = (currentIndex + 1) % modeOrder.length
  return modeOrder[nextIndex]
}

// Get previous mode in cycle
export function getPreviousMode(current: PermissionMode): PermissionMode {
  const currentIndex = modeOrder.indexOf(current)
  const prevIndex = currentIndex === 0 ? modeOrder.length - 1 : currentIndex - 1
  return modeOrder[prevIndex]
}

// Mode display info
export interface ModeInfo {
  mode: PermissionMode
  shortName: string
  color: string
  symbol: string
}

export const modeDisplayInfo: Record<PermissionMode, ModeInfo> = {
  plan: { mode: 'plan', shortName: 'PLAN', color: 'cyan', symbol: '🔍' },
  default: { mode: 'default', shortName: 'DEFAULT', color: 'white', symbol: '👤' },
  acceptEdits: { mode: 'acceptEdits', shortName: 'AUTO-EDIT', color: 'green', symbol: '✏️' },
  auto: { mode: 'auto', shortName: 'AUTO', color: 'yellow', symbol: '🤖' },
  bypass: { mode: 'bypass', shortName: 'BYPASS', color: 'magenta', symbol: '⚡' },
  dontAsk: { mode: 'dontAsk', shortName: 'NO', color: 'red', symbol: '🚫' },
}

export default {
  modeConfigs,
  canUseTool,
  getNextMode,
  getPreviousMode,
  modeOrder,
  modeDisplayInfo,
}