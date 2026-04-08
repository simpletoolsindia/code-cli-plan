// Web Scraping - URL fetching and HTML to markdown conversion
// Based on Aider's /web command

export interface WebFetchOptions {
  headers?: Record<string, string>
  timeout?: number
  userAgent?: string
}

export interface WebFetchResult {
  url: string
  title?: string
  content: string
  markdown: string
  images: string[]
  links: string[]
}

// Default fetch options
const defaultOptions: Required<WebFetchOptions> = {
  headers: {},
  timeout: 10000,
  userAgent: 'Mozilla/5.0 (compatible; BeastCLI/1.0; +https://beast-cli.dev)',
}

// Fetch URL and convert to markdown
export async function fetchUrl(
  url: string,
  options: WebFetchOptions = {}
): Promise<WebFetchResult> {
  const opts = { ...defaultOptions, ...options }

  const response = await fetch(url, {
    headers: {
      'User-Agent': opts.userAgent,
      ...opts.headers,
    },
    signal: AbortSignal.timeout(opts.timeout),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const html = await response.text()
  const contentType = response.headers.get('content-type') ?? ''

  // Handle different content types
  if (contentType.includes('application/json')) {
    const json = JSON.parse(html)
    return {
      url,
      content: JSON.stringify(json, null, 2),
      markdown: formatJSONAsMarkdown(json),
      images: [],
      links: [],
    }
  }

  // Parse HTML
  const parsed = parseHTML(html, url)
  return {
    url,
    title: parsed.title,
    content: parsed.text,
    markdown: parsed.markdown,
    images: parsed.images,
    links: parsed.links,
  }
}

// Simple HTML parser (without external dependencies)
function parseHTML(html: string, baseUrl: string): {
  title: string
  text: string
  markdown: string
  images: string[]
  links: string[]
} {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch?.[1]?.trim() ?? ''

  // Extract main content (prefer article/main content)
  let content = ''

  // Try to find main content areas
  const mainMatch = html.match(/<(?:main|article|content)(?:\s[^>]*)?>([\s\S]*?)<\/(?:main|article|content)>/i)
  if (mainMatch) {
    content = mainMatch[1]
  } else {
    // Fallback to body
    const bodyMatch = html.match(/<body(?:\s[^>]*)?>([\s\S]*?)<\/body>/i)
    content = bodyMatch?.[1] ?? html
  }

  // Remove script and style tags
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '')
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '')

  // Extract images
  const images: string[] = []
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  let imgMatch
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    const src = imgMatch[1]
    if (src.startsWith('http') || src.startsWith('//')) {
      images.push(src.startsWith('//') ? `https:${src}` : src)
    } else if (src.startsWith('/')) {
      const base = new URL(baseUrl)
      images.push(`${base.origin}${src}`)
    }
  }

  // Extract links
  const links: string[] = []
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi
  let linkMatch
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const href = linkMatch[1]
    const text = linkMatch[2].trim()
    if (href.startsWith('http')) {
      links.push(href)
    }
  }

  // Convert to markdown
  let markdown = content
    // Headers
    .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, (_, t) => `# ${t.trim()}\n\n`)
    .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, (_, t) => `## ${t.trim()}\n\n`)
    .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, (_, t) => `### ${t.trim()}\n\n`)
    .replace(/<h4[^>]*>([^<]+)<\/h4>/gi, (_, t) => `#### ${t.trim()}\n\n`)
    // Lists
    .replace(/<li[^>]*>([^<]+)<\/li>/gi, (_, t) => `- ${t.trim()}\n`)
    .replace(/<\/?ul[^>]*>/gi, '\n')
    .replace(/<\/?ol[^>]*>/gi, '\n')
    // Code blocks
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, code) => `\`\`\`\n${stripTags(code).trim()}\n\`\`\`\n\n`)
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => `\`${code.trim()}\``)
    // Inline formatting
    .replace(/<strong[^>]*>([^<]+)<\/strong>/gi, (_, t) => `**${t.trim()}**`)
    .replace(/<b[^>]*>([^<]+)<\/b>/gi, (_, t) => `**${t.trim()}**`)
    .replace(/<em[^>]*>([^<]+)<\/em>/gi, (_, t) => `*${t.trim()}*`)
    .replace(/<i[^>]*>([^<]+)<\/i>/gi, (_, t) => `*${t.trim()}*`)
    // Links
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi, (_, href, text) =>
      text.trim() ? `[${text.trim()}](${href})` : href
    )
    // Images
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']+)["'][^>]*>/gi, (_, src, alt) =>
      `![${alt}](${src})\n`
    )
    .replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_, src) => `![](${src})\n`)
    // Paragraphs and line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    // Tables (basic)
    .replace(/<table([\s\S]*?)<\/table>/gi, formatTable)
    // Divs (convert to newlines)
    .replace(/<\/?div[^>]*>/gi, '\n')

  // Extract plain text for content
  const text = stripTags(content)

  return {
    title,
    text: text.trim(),
    markdown: markdown.trim(),
    images: [...new Set(images)].slice(0, 20), // Limit to 20 images
    links: [...new Set(links)].slice(0, 50),   // Limit to 50 links
  }
}

// Strip all HTML tags
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
}

// Format table as markdown
function formatTable(tableHtml: string): string {
  const rows: string[] = []
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch
  let rowIndex = 0

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const cells: string[] = []
    const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
    let cellMatch

    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      cells.push(stripTags(cellMatch[1]).trim())
    }

    if (cells.length > 0) {
      rows.push(`| ${cells.join(' | ')} |`)

      // Add separator after first row
      if (rowIndex === 0) {
        rows.push(`| ${cells.map(() => '---').join(' | ')} |`)
      }
      rowIndex++
    }
  }

  return '\n' + rows.join('\n') + '\n\n'
}

// Format JSON as markdown
function formatJSONAsMarkdown(json: unknown): string {
  const str = typeof json === 'string' ? json : JSON.stringify(json, null, 2)

  // Check if it's API response with text field
  if (typeof json === 'object' && json !== null && 'text' in json) {
    return String((json as Record<string, unknown>).text)
  }

  return `\`\`\`json\n${str}\n\`\`\``
}

// Fetch multiple URLs
export async function fetchUrls(
  urls: string[],
  options: WebFetchOptions = {}
): Promise<WebFetchResult[]> {
  const results: WebFetchResult[] = []

  for (const url of urls) {
    try {
      const result = await fetchUrl(url, options)
      results.push(result)
    } catch (e) {
      console.error(`[Web] Failed to fetch ${url}:`, e)
    }
  }

  return results
}

// Search web (placeholder - would need search API)
export async function searchWeb(
  query: string,
  limit = 5
): Promise<Array<{ title: string; url: string; snippet: string }>> {
  // In real implementation, use search API
  // For now, return empty results
  console.log(`[Web] Search for: ${query}`)
  return []
}

export default {
  fetchUrl,
  fetchUrls,
  searchWeb,
}
