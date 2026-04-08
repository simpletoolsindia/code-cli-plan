import React from 'react'
import { Box, Text } from 'ink'

export interface StatusBarProps {
  mode: string
  model?: string
  tokens?: number
  theme?: string
}

// Status bar component
export const StatusBar: React.FC<StatusBarProps> = ({
  mode,
  model = 'claude-3-5-sonnet',
  tokens = 0,
  theme = 'dark',
}) => {
  const modeColors: Record<string, string> = {
    plan: 'cyan',
    default: 'white',
    acceptEdits: 'green',
    auto: 'yellow',
    bypass: 'magenta',
    dontAsk: 'red',
  }

  return (
    <Box
      borderStyle="single"
      borderDim={true}
      justifyContent="space-between"
      paddingX={1}
    >
      <Box>
        <Text bold color="cyan">🐉</Text>
        <Text color="gray"> Beast CLI</Text>
        <Text color={modeColors[mode] as any}> [{mode}]</Text>
      </Box>

      <Box>
        <Text color="gray">Model: </Text>
        <Text color="white">{model}</Text>
        <Text color="gray"> | Tokens: </Text>
        <Text color="white">{tokens.toLocaleString()}</Text>
        <Text color="gray"> | Theme: </Text>
        <Text color="white">{theme}</Text>
      </Box>
    </Box>
  )
}

export default StatusBar