import React, { useState, useEffect } from 'react'
import { Box, Text, render } from 'ink'

// Theme colors
export type ThemeName = 'dark' | 'light' | 'terminal'

export interface Theme {
  name: ThemeName
  background: string
  foreground: string
  accent: string
  error: string
  warning: string
  success: string
  muted: string
}

export const themes: Record<ThemeName, Theme> = {
  dark: {
    name: 'dark',
    background: '#1a1a2e',
    foreground: '#eee',
    accent: '#00d9ff',
    error: '#ff6b6b',
    warning: '#ffd93d',
    success: '#6bcb77',
    muted: '#888',
  },
  light: {
    name: 'light',
    background: '#fff',
    foreground: '#333',
    accent: '#0066cc',
    error: '#d63031',
    warning: '#e17055',
    success: '#00b894',
    muted: '#888',
  },
  terminal: {
    name: 'terminal',
    background: 'transparent',
    foreground: 'inherit',
    accent: 'inherit',
    error: 'inherit',
    warning: 'inherit',
    success: 'inherit',
    muted: 'inherit',
  },
}

// CLI App component
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

export interface AppState {
  messages: Message[]
  input: string
  isLoading: boolean
  mode: 'plan' | 'default' | 'acceptEdits' | 'auto' | 'bypass' | 'dontAsk'
  theme: ThemeName
}

interface CLIProps {
  initialState?: Partial<AppState>
  onSubmit?: (input: string) => void
  onModeChange?: (mode: AppState['mode']) => void
  onThemeChange?: (theme: ThemeName) => void
}

export const CLI: React.FC<CLIProps> = ({
  initialState,
  onSubmit,
  onModeChange,
  onThemeChange,
}) => {
  const [state, setState] = useState<AppState>({
    messages: initialState?.messages ?? [],
    input: initialState?.input ?? '',
    isLoading: initialState?.isLoading ?? false,
    mode: initialState?.mode ?? 'default',
    theme: initialState?.theme ?? 'dark',
  })

  const theme = themes[state.theme]

  // Mode badge color
  const modeColors: Record<string, string> = {
    plan: 'cyan',
    default: 'white',
    acceptEdits: 'green',
    auto: 'yellow',
    bypass: 'magenta',
    dontAsk: 'red',
  }

  // Handle mode switch
  const cycleMode = () => {
    const modes: AppState['mode'][] = ['plan', 'default', 'acceptEdits', 'auto', 'bypass', 'dontAsk']
    const currentIndex = modes.indexOf(state.mode)
    const nextIndex = (currentIndex + 1) % modes.length
    const nextMode = modes[nextIndex]
    setState(s => ({ ...s, mode: nextMode }))
    onModeChange?.(nextMode)
  }

  // Handle theme switch
  const cycleTheme = () => {
    const themeNames: ThemeName[] = ['dark', 'light', 'terminal']
    const currentIndex = themeNames.indexOf(state.theme)
    const nextIndex = (currentIndex + 1) % themeNames.length
    const nextTheme = themeNames[nextIndex]
    setState(s => ({ ...s, theme: nextTheme }))
    onThemeChange?.(nextTheme)
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Status Bar */}
      <Box borderStyle="round" borderDim={false} flexDirection="column" padding={0}>
        <Box>
          <Text bold>🐉 Beast CLI</Text>
          <Text color={modeColors[state.mode] as any}> [{state.mode.toUpperCase()}]</Text>
          <Text color="gray"> | Press Tab to cycle mode, T for theme</Text>
        </Box>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" marginY={1} flexGrow={1}>
        {state.messages.length === 0 ? (
          <Box>
            <Text color="gray">No messages yet. Type to start!</Text>
          </Box>
        ) : (
          state.messages.map(msg => (
            <Box key={msg.id} flexDirection="column" marginY={0}>
              <Text bold color={msg.role === 'user' ? 'green' : msg.role === 'assistant' ? 'cyan' : 'gray'}>
                {msg.role === 'user' ? '>' : msg.role === 'assistant' ? '🤖' : '⚙️'}:
              </Text>
              <Text>{msg.content}</Text>
            </Box>
          ))
        )}
      </Box>

      {/* Input */}
      <Box>
        {state.isLoading ? (
          <Text color="yellow">⏳ Processing...</Text>
        ) : (
          <Text color="gray">&gt; {state.input || '(empty)'}</Text>
        )}
      </Box>
    </Box>
  )
}

// Render function for CLI
export function renderCLI(props?: CLIProps) {
  return render(<CLI {...props} />)
}

export default CLI