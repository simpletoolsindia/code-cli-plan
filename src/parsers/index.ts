// Tree-sitter Integration - Syntax parsing and tag extraction
// Based on Aider's tree-sitter usage

export interface ParsedDefinition {
  type: 'function' | 'class' | 'interface' | 'method' | 'const' | 'type'
  name: string
  startLine: number
  endLine: number
  visibility: 'public' | 'private' | 'protected'
  signatures: string[]
}

export interface ParsedFile {
  path: string
  language: string
  definitions: ParsedDefinition[]
  imports: string[]
  exports: string[]
  syntaxErrors: SyntaxError[]
}

export interface SyntaxError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
}

export interface Tag {
  name: string
  type: ParsedDefinition['type']
  file: string
  line: number
  scope?: string
}

// Simple regex-based parser (Tree-sitter would require native bindings)
// This provides a working implementation that doesn't need native deps

const LANGUAGE_PATTERNS: Record<string, {
  function: RegExp[]
  class: RegExp[]
  interface: RegExp[]
  method: RegExp[]
  const: RegExp[]
  type: RegExp[]
  import: RegExp
  export: RegExp
}> = {
  typescript: {
    function: [
      /function\s+(\w+)\s*\([^)]*\)/g,
      /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g,
    ],
    class: [/class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[\w,\s]+)?\s*{/g],
    interface: [/interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*{/g],
    method: [/(?:public|private|protected)\s+(?:async\s+)?(\w+)\s*\([^)]*\)/g],
    const: [/const\s+(\w+)\s*=/g],
    type: [/type\s+(\w+)\s*=/g],
    import: /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g,
    export: /export\s+(?:default\s+)?(?:const|function|class|interface|type)/g,
  },
  javascript: {
    function: [
      /function\s+(\w+)\s*\([^)]*\)/g,
      /const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g,
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*{/g,
    ],
    class: [/class\s+(\w+)(?:\s+extends\s+\w+)?\s*{/g],
    interface: [/interface\s+(\w+)\s*{/g],
    method: [],
    const: [/const\s+(\w+)\s*=/g],
    type: [],
    import: /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g,
    export: /export\s+(?:default\s+)?(?:const|function|class)/g,
  },
  python: {
    function: [
      /def\s+(\w+)\s*\([^)]*\)/g,
      /async\s+def\s+(\w+)\s*\([^)]*\)/g,
    ],
    class: [/class\s+(\w+)(?:\([^)]+\))?:/g],
    interface: [],
    method: [/def\s+(\w+)\s*\(/g],
    const: [/^([A-Z][A-Z_]+)\s*=/gm],
    type: [/^\s*#\s*type:\s*(\w+)/gm],
    import: /^(?:from\s+([\w.]+)\s+)?import\s+(?:{[^}]+}|\w+)/gm,
    export: /__(?:init|main|all)__/g,
  },
  rust: {
    function: [/fn\s+(\w+)\s*[<[^>]*>]?\s*\([^)]*\)/g],
    class: [/struct\s+(\w+)(?:<[^>]+>)?(?:\s+where)?/g],
    interface: [/trait\s+(\w+)(?:\s+where)?\s*{/g],
    method: [/fn\s+(\w+)\s*\([^)]*\)\s*->/g],
    const: [/const\s+(\w+)\s*:/g],
    type: [/type\s+(\w+)\s*=/g],
    import: /use\s+([\w:]+)/g,
    export: /pub\s+(?:fn|struct|trait|type|const)/g,
  },
  go: {
    function: [/func\s+(\w+)\s*\([^)]*\)/g],
    class: [/type\s+(\w+)\s+struct/g],
    interface: [/type\s+(\w+)\s+interface/g],
    method: [/func\s+\([^)]+\)\s*(\w+)\s*\(/g],
    const: [/const\s+(\w+)/g],
    type: [/type\s+(\w+)\s*/g],
    import: /import\s+(?:"[^"]+"|'[^']+')/g,
    export: /func\s+\([A-Z]\w*\)/g,
  },
  java: {
    function: [/(?:public|private|protected)\s+(?:static\s+)?(?:void|int|String|\w+)\s+(\w+)\s*\(/g],
    class: [/(?:public|private|protected)?\s*(?:abstract\s+)?class\s+(\w+)/g],
    interface: [/(?:public|private|protected)?\s*interface\s+(\w+)/g],
    method: [],
    const: [/static\s+(?:final\s+)?(?:int|String|\w+)\s+(\w+)/g],
    type: [/class\s+(\w+)/g],
    import: /import\s+([\w.]+);/g,
    export: /public\s+(?:class|interface|enum)/g,
  },
}

// Detect language from filename
function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    kt: 'kotlin',
    rb: 'ruby',
    php: 'php',
  }
  return ext ? map[ext] ?? 'javascript' : 'javascript'
}

// Extract definitions from content
function extractDefinitions(
  content: string,
  language: string
): ParsedDefinition[] {
  const patterns = LANGUAGE_PATTERNS[language]
  if (!patterns) return []

  const definitions: ParsedDefinition[] = []
  const lines = content.split('\n')

  // Function definitions
  for (const pattern of patterns.function) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        const lineNum = content.substring(0, match.index).split('\n').length
        definitions.push({
          type: 'function',
          name: match[1],
          startLine: lineNum,
          endLine: lineNum,
          visibility: 'public',
          signatures: [match[0].trim()],
        })
      }
    }
  }

  // Class definitions
  for (const pattern of patterns.class) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        const lineNum = content.substring(0, match.index).split('\n').length
        definitions.push({
          type: 'class',
          name: match[1],
          startLine: lineNum,
          endLine: lineNum,
          visibility: 'public',
          signatures: [match[0].trim()],
        })
      }
    }
  }

  // Interface definitions
  for (const pattern of patterns.interface) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        const lineNum = content.substring(0, match.index).split('\n').length
        definitions.push({
          type: 'interface',
          name: match[1],
          startLine: lineNum,
          endLine: lineNum,
          visibility: 'public',
          signatures: [match[0].trim()],
        })
      }
    }
  }

  return definitions
}

// Extract imports
function extractImports(content: string, language: string): string[] {
  const patterns = LANGUAGE_PATTERNS[language]
  if (!patterns?.import) return []

  const imports: string[] = []
  const regex = patterns.import
  let match

  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1] ?? match[0])
  }

  return [...new Set(imports)]
}

// Extract exports
function extractExports(content: string, language: string): string[] {
  const patterns = LANGUAGE_PATTERNS[language]
  if (!patterns) return []

  const exports: string[] = []
  const regex = /export\s+(?:{[^}]+}|default\s+)?(\w+)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    exports.push(match[1] ?? match[0])
  }

  return [...new Set(exports)]
}

// Detect syntax errors (basic)
function detectErrors(content: string): SyntaxError[] {
  const errors: SyntaxError[] = []
  const lines = content.split('\n')

  // Bracket matching
  const stack: { char: string; line: number; col: number }[] = []
  let inString = false
  let stringChar = ''
  let inComment = false
  let inBlockComment = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let col = 0

    for (const char of line) {
      col++

      // Skip strings
      if ((char === '"' || char === "'" || char === '`') && !inComment && !inBlockComment) {
        if (!inString) {
          inString = true
          stringChar = char
        } else if (char === stringChar) {
          inString = false
        }
        continue
      }

      if (inString) continue

      // Skip comments
      if (char === '/' && line[col] === '/') {
        inComment = true
        break
      }
      if (char === '/' && line[col] === '*') {
        inBlockComment = true
        continue
      }
      if (char === '*' && line[col] === '/') {
        inBlockComment = false
        continue
      }
      if (inComment || inBlockComment) continue

      // Check brackets
      if ('{[('.includes(char)) {
        stack.push({ char, line: i + 1, col })
      } else if ('}])'.includes(char)) {
        const open = stack.pop()
        if (!open) {
          errors.push({
            line: i + 1,
            column: col,
            message: `Unexpected closing bracket '${char}'`,
            severity: 'error',
          })
        } else if (
          (open.char === '(' && char !== ')') ||
          (open.char === '{' && char !== '}') ||
          (open.char === '[' && char !== ']')
        ) {
          errors.push({
            line: open.line,
            column: open.col,
            message: `Mismatched bracket: expected '${getMatch(open.char)}' but found '${char}'`,
            severity: 'error',
          })
        }
      }
    }
  }

  // Unclosed brackets
  for (const open of stack) {
    errors.push({
      line: open.line,
      column: open.col,
      message: `Unclosed bracket '${open.char}'`,
      severity: 'error',
    })
  }

  return errors
}

function getMatch(char: string): string {
  return { '(': ')', '{': '}', '[': ']' }[char] ?? char
}

// Main parser function
export function parseFile(path: string, content: string): ParsedFile {
  const language = detectLanguage(path)

  return {
    path,
    language,
    definitions: extractDefinitions(content, language),
    imports: extractImports(content, language),
    exports: extractExports(content, language),
    syntaxErrors: detectErrors(content),
  }
}

// Generate tags from parsed file
export function generateTags(parsed: ParsedFile): Tag[] {
  return parsed.definitions.map(def => ({
    name: def.name,
    type: def.type,
    file: parsed.path,
    line: def.startLine,
  }))
}

// Generate tags cache (simulated SQLite format)
export function generateTagsCache(files: ParsedFile[]): Map<string, Tag[]> {
  const cache = new Map<string, Tag[]>()

  for (const file of files) {
    cache.set(file.path, generateTags(file))
  }

  return cache
}

// Search tags by query
export function searchTags(
  cache: Map<string, Tag[]>,
  query: string
): Tag[] {
  const results: Tag[] = []
  const lower = query.toLowerCase()

  for (const [, tags] of cache) {
    for (const tag of tags) {
      if (tag.name.toLowerCase().includes(lower)) {
        results.push(tag)
      }
    }
  }

  return results
}

// RepoMap integration helper
export function toRepoMapFormat(tags: Tag[]): { path: string; tags: string[] }[] {
  const byFile = new Map<string, string[]>()

  for (const tag of tags) {
    const existing = byFile.get(tag.file) ?? []
    existing.push(tag.name)
    byFile.set(tag.file, existing)
  }

  return Array.from(byFile.entries()).map(([path, tags]) => ({
    path,
    tags: [...new Set(tags)],
  }))
}

export default {
  parseFile,
  generateTags,
  generateTagsCache,
  searchTags,
  toRepoMapFormat,
  detectLanguage,
}
