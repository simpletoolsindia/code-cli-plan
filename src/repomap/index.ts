// RepoMap with PageRank - Intelligent file selection for context injection
// Based on Aider's approach

export interface FileNode {
  path: string
  tags: string[]        // Function/class names extracted
  imports: string[]       // Files this file imports
  importsFrom: string[]  // Files that import this file
  mentions: number       // Times mentioned in chat
  nameBoost: number      // Snake/camel case match boost
}

export interface RankedFile {
  path: string
  score: number
  reason: string
}

// Simple PageRank implementation
function pageRank(
  graph: Map<string, string[]>,
  damping = 0.85,
  iterations = 10
): Map<string, number> {
  const nodes = Array.from(graph.keys())
  const n = nodes.length
  const ranks = new Map<string, number>()

  // Initialize ranks
  for (const node of nodes) {
    ranks.set(node, 1 / n)
  }

  // Iterative PageRank
  for (let i = 0; i < iterations; i++) {
    const newRanks = new Map<string, number>()

    for (const node of nodes) {
      let rank = (1 - damping) / n

      // Sum incoming ranks
      for (const [other, neighbors] of graph) {
        if (neighbors.includes(node)) {
          rank += damping * (ranks.get(other)! / neighbors.length)
        }
      }

      newRanks.set(node, rank)
    }

    for (const node of nodes) {
      ranks.set(node, newRanks.get(node)!)
    }
  }

  return ranks
}

// Extract function/class names from file content
function extractTags(content: string): string[] {
  const tags: string[] = []

  // TypeScript/JavaScript patterns
  const patterns = [
    /function\s+(\w+)/g,           // function name()
    /const\s+(\w+)\s*=/g,         // const name =
    /let\s+(\w+)\s*=/g,           // let name =
    /class\s+(\w+)/g,             // class Name
    /interface\s+(\w+)/g,         // interface Name
    /type\s+(\w+)\s*=/g,          // type Name =
    /export\s+function\s+(\w+)/g, // export function name()
    /export\s+const\s+(\w+)/g,    // export const name
    /=>\s*{/g,                    // arrow functions (skip)
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && match[1].length > 2) {
        tags.push(match[1])
      }
    }
  }

  return [...new Set(tags)] // Dedupe
}

// Extract import statements
function extractImports(content: string): string[] {
  const imports: string[] = []

  // ES6 imports
  const importPattern = /import\s+.*?from\s+['"]([^'"]+)['"]/g
  let match
  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1]
    if (importPath) imports.push(importPath)
  }

  // Require statements
  const requirePattern = /require\(['"]([^'"]+)['"]\)/g
  while ((match = requirePattern.exec(content)) !== null) {
    const requirePath = match[1]
    if (requirePath) imports.push(requirePath)
  }

  return imports
}

// Check if path matches naming patterns (snake_case, kebab, camelCase)
function getNameBoost(path: string): number {
  const basename = path.split('/').pop() ?? ''

  const snakeCase = /^[a-z]+(_[a-z]+)+$/
  const camelCase = /^[a-z]+([A-Z][a-z]+)+$/
  const kebabCase = /^[a-z]+(-[a-z]+)+$/

  if (snakeCase.test(basename) || camelCase.test(basename) || kebabCase.test(basename)) {
    return 10
  }

  return 1
}

// Build dependency graph from files
function buildGraph(files: FileNode[]): Map<string, string[]> {
  const graph = new Map<string, string[]>()

  for (const file of files) {
    const edges: string[] = []

    for (const imported of file.imports) {
      // Find file that matches this import
      const match = files.find(f =>
        f.path.includes(imported) ||
        imported.includes(f.path.replace(/\.[^.]+$/, ''))
      )
      if (match) {
        edges.push(match.path)
      }
    }

    graph.set(file.path, edges)
  }

  return graph
}

// Main ranking function
export async function rankFiles(
  files: { path: string; content: string }[],
  chatMentions: string[] = [],
  query: string = ''
): Promise<RankedFile[]> {
  // Build file nodes
  const nodes: FileNode[] = files.map(file => ({
    path: file.path,
    tags: extractTags(file.content),
    imports: extractImports(file.content),
    importsFrom: [],
    mentions: 0,
    nameBoost: getNameBoost(file.path),
  }))

  // Update reverse imports
  for (const node of nodes) {
    for (const imp of node.imports) {
      const importer = nodes.find(n =>
        n.path.includes(imp) || imp.includes(n.path.replace(/\.[^.]+$/, ''))
      )
      if (importer) {
        importer.importsFrom.push(node.path)
      }
    }
  }

  // Boost for chat mentions
  for (const mention of chatMentions) {
    const matched = nodes.find(n =>
      n.path.toLowerCase().includes(mention.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(mention.toLowerCase()))
    )
    if (matched) {
      matched.mentions += 10
    }
  }

  // Query boost
  if (query) {
    const queryTerms = query.toLowerCase().split(/\s+/)
    for (const node of nodes) {
      for (const term of queryTerms) {
        if (node.path.toLowerCase().includes(term)) {
          node.nameBoost += 5
        }
        if (node.tags.some(t => t.toLowerCase().includes(term))) {
          node.nameBoost += 3
        }
      }
    }
  }

  // Build graph and run PageRank
  const graph = buildGraph(nodes)
  const ranks = pageRank(graph)

  // Combine PageRank scores with boosts
  const results: RankedFile[] = nodes.map(node => {
    const baseScore = ranks.get(node.path) ?? 0
    const mentionsBonus = node.mentions * 0.1
    const nameBonus = node.nameBoost * 0.01

    const totalScore = baseScore + mentionsBonus + nameBonus

    let reason = 'dependency'
    if (node.mentions > 0) reason = 'chat mention'
    else if (node.nameBoost > 1) reason = 'name match'

    return {
      path: node.path,
      score: totalScore,
      reason,
    }
  })

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  return results
}

// Get relevant files for context
export async function getRelevantFiles(
  allFiles: { path: string; content: string }[],
  query: string,
  limit = 10
): Promise<string[]> {
  const ranked = await rankFiles(allFiles, [], query)
  return ranked.slice(0, limit).map(r => r.path)
}

export default { rankFiles, getRelevantFiles, extractTags, extractImports }