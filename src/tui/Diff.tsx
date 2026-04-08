import React from 'react'
import { Box, Text } from 'ink'

export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  lineNumber?: number
}

export interface DiffProps {
  oldContent: string
  newContent: string
  filePath?: string
  contextLines?: number
}

// Simple diff generator
function generateDiff(oldContent: string, newContent: string): DiffLine[] {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  const result: DiffLine[] = []

  // Simple line-by-line diff
  let i = 0, j = 0

  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      // Remaining new lines are additions
      result.push({ type: 'add', content: newLines[j], lineNumber: j + 1 })
      j++
    } else if (j >= newLines.length) {
      // Remaining old lines are removals
      result.push({ type: 'remove', content: oldLines[i], lineNumber: i + 1 })
      i++
    } else if (oldLines[i] === newLines[j]) {
      // Lines match
      result.push({ type: 'context', content: oldLines[i], lineNumber: i + 1 })
      i++
      j++
    } else {
      // Lines differ - try to find a match
      const foundInNew = newLines.indexOf(oldLines[i], j)
      const foundInOld = oldLines.indexOf(newLines[j], i)

      if (foundInNew === -1 && foundInOld === -1) {
        // No match, both changed
        result.push({ type: 'remove', content: oldLines[i], lineNumber: i + 1 })
        result.push({ type: 'add', content: newLines[j], lineNumber: j + 1 })
        i++
        j++
      } else if (foundInOld === -1 || (foundInNew !== -1 && foundInNew - j < foundInOld - i)) {
        // Insertion in new
        result.push({ type: 'add', content: newLines[j], lineNumber: j + 1 })
        j++
      } else {
        // Deletion in old
        result.push({ type: 'remove', content: oldLines[i], lineNumber: i + 1 })
        i++
      }
    }
  }

  return result
}

// Diff component
export const Diff: React.FC<DiffProps> = ({
  oldContent,
  newContent,
  filePath = 'file',
}) => {
  const diff = generateDiff(oldContent, newContent)

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box>
        <Text bold color="red">- {filePath}</Text>
        <Text> → </Text>
        <Text bold color="green">+ {filePath}</Text>
      </Box>

      <Box flexDirection="column" paddingY={0}>
        {diff.slice(0, 100).map((line, idx) => {
          const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '
          const color = line.type === 'add' ? 'green' : line.type === 'remove' ? 'red' : 'white'
          const bg = line.type === 'add' ? 'greenBright' : line.type === 'remove' ? 'redBright' : undefined

          return (
            <Text key={idx} color={color as any} backgroundColor={bg}>
              {prefix} {line.content}
            </Text>
          )
        })}
        {diff.length > 100 && (
          <Text color="gray">... and {diff.length - 100} more lines</Text>
        )}
      </Box>
    </Box>
  )
}

export default Diff