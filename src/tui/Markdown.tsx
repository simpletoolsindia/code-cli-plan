import React from 'react'
import { Box, Text } from 'ink'
import { marked } from 'marked'

// Simple markdown renderer using Ink components
export interface MarkdownProps {
  content: string
  codeTheme?: string
}

export function renderMarkdown(markdown: string): React.ReactNode[] {
  const lines = markdown.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeContent: string[] = []

  for (const line of lines) {
    // Code block handling
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeContent = []
      } else {
        // End of code block
        elements.push(
          <Box key={`code-${elements.length}`} flexDirection="column" paddingY={0}>
            <Text color="cyan">{codeContent.join('\n')}</Text>
          </Box>
        )
        inCodeBlock = false
        codeContent = []
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<Text key={`h1-${elements.length}`} bold>{line.slice(2)}</Text>)
    } else if (line.startsWith('## ')) {
      elements.push(<Text key={`h2-${elements.length}`} bold>{line.slice(3)}</Text>)
    } else if (line.startsWith('### ')) {
      elements.push(<Text key={`h3-${elements.length}`} bold>{line.slice(4)}</Text>)
    }
    // Bold
    else if (line.includes('**')) {
      const parts = line.split(/\*\*/)
      elements.push(
        <Text key={`bold-${elements.length}`}>
          {parts.map((part, i) => i % 2 === 1 ? <Text bold>{part}</Text> : part)}
        </Text>
      )
    }
    // Inline code
    else if (line.includes('`')) {
      const parts = line.split(/`/)
      elements.push(
        <Text key={`code-${elements.length}`}>
          {parts.map((part, i) => i % 2 === 1 ? <Text color="cyan">{part}</Text> : part)}
        </Text>
      )
    }
    // List items
    else if (line.startsWith('- ')) {
      elements.push(<Text key={`list-${elements.length}`}>  • {line.slice(2)}</Text>)
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<Box key={`space-${elements.length}`} height={0} />)
    }
    // Regular text
    else {
      elements.push(<Text key={`text-${elements.length}`}>{line}</Text>)
    }
  }

  return elements
}

// Markdown component
export const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  return (
    <Box flexDirection="column">
      {renderMarkdown(content)}
    </Box>
  )
}

export default Markdown