// Auto-Lint Integration - Run linters after code changes
// Based on Aider's --auto-lint and linter.py

export interface LintConfig {
  enabled: boolean
  commands: LintCommand[]
  fatalErrors: string[]  // Error codes that should stop execution
  autoFix: boolean
}

export interface LintCommand {
  name: string
  command: string
  language?: string
  workingDirectory?: string
}

export interface LintResult {
  tool: string
  passed: boolean
  errors: LintError[]
  warnings: LintWarning[]
  output: string
}

export interface LintError {
  file: string
  line: number
  column?: number
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface LintWarning {
  file: string
  line: number
  message: string
  rule?: string
}

// Fatal Python error codes (F***
export const PYTHON_FATAL_ERRORS = ['E9', 'F821', 'F823', 'F401']

// Default config
export const defaultLintConfig: LintConfig = {
  enabled: true,
  commands: [
    { name: 'ruff', command: 'ruff check {file}', language: 'python' },
    { name: 'eslint', command: 'eslint {file}', language: 'javascript' },
    { name: 'ruff', command: 'ruff format {file}', language: 'python' },
  ],
  fatalErrors: PYTHON_FATAL_ERRORS,
  autoFix: false,
}

// Run lint command
async function runLintCommand(cmd: LintCommand, file: string): Promise<{
  success: boolean
  output: string
  errors: LintError[]
  warnings: LintWarning[]
}> {
  const { spawn } = await import('child_process')

  // Replace {file} placeholder
  const command = cmd.command.replace('{file}', file)

  return new Promise((resolve) => {
    const proc = spawn('sh', ['-c', command], {
      cwd: cmd.workingDirectory,
      timeout: 30000,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (data: Buffer) => { stdout += data.toString() })
    proc.stderr?.on('data', (data: Buffer) => { stderr += data.toString() })

    proc.on('close', (code) => {
      const output = stdout + stderr
      const errors = parseLintOutput(output, cmd.language)
      const warnings = errors.filter(e => e.severity === 'warning') as LintWarning[]

      resolve({
        success: code === 0,
        output,
        errors,
        warnings,
      })
    })

    proc.on('error', (err) => {
      resolve({
        success: false,
        output: err.message,
        errors: [{
          file,
          line: 0,
          code: 'EXEC',
          message: err.message,
          severity: 'error',
        }],
        warnings: [],
      })
    })
  })
}

// Parse lint output
function parseLintOutput(output: string, language?: string): LintError[] {
  const errors: LintError[] = []

  // Ruff format: src/file.py:10:5: E501 Line too long
  const ruffRegex = /^(.+?):(\d+):(\d+):\s*(\w+)\s+(.+)$/gm
  let match

  while ((match = ruffRegex.exec(output)) !== null) {
    errors.push({
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      code: match[4],
      message: match[5],
      severity: match[4].startsWith('E') || match[4].startsWith('F') ? 'error' : 'warning',
    })
  }

  // ESLint format: /path/to/file.js:10:5: error message
  const eslintRegex = /^(.+?):(\d+):(\d+):\s*(error|warning|info)\s+(.+)$/gm

  while ((match = eslintRegex.exec(output)) !== null) {
    errors.push({
      file: match[1],
      line: parseInt(match[2]),
      column: parseInt(match[3]),
      code: 'ESLINT',
      message: match[5],
      severity: match[4] as 'error' | 'warning' | 'info',
    })
  }

  // Python syntax errors: File "<string>", line 10
  const pySyntaxRegex = /^File\s+"(.+?)",\s+line\s+(\d+)/gm

  while ((match = pySyntaxRegex.exec(output)) !== null) {
    // Try to extract more context
    const contextMatch = output.substring(match.index).match(/(.+?)$/m)
    errors.push({
      file: match[1],
      line: parseInt(match[2]),
      code: 'SYNTAX',
      message: contextMatch?.[1]?.trim() ?? 'Syntax error',
      severity: 'error',
    })
  }

  return errors
}

// Main lint runner
export class LintRunner {
  private config: LintConfig

  constructor(config: LintConfig = defaultLintConfig) {
    this.config = config
  }

  async lintFile(file: string): Promise<LintResult[]> {
    const results: LintResult[] = []

    if (!this.config.enabled) {
      return results
    }

    // Filter commands for file language
    const applicableCommands = this.config.commands.filter(
      cmd => !cmd.language || this.matchesLanguage(cmd.language, file)
    )

    for (const cmd of applicableCommands) {
      try {
        const result = await runLintCommand(cmd, file)
        results.push({
          tool: cmd.name,
          passed: result.success,
          errors: result.errors,
          warnings: result.warnings,
          output: result.output,
        })
      } catch (e) {
        console.error(`[Lint] ${cmd.name} failed:`, e)
      }
    }

    return results
  }

  async lintFiles(files: string[]): Promise<Map<string, LintResult[]>> {
    const results = new Map<string, LintResult[]>()

    for (const file of files) {
      const fileResults = await this.lintFile(file)
      if (fileResults.length > 0) {
        results.set(file, fileResults)
      }
    }

    return results
  }

  // Check for fatal errors
  hasFatalErrors(results: LintResult[]): LintError[] {
    const fatal: LintError[] = []

    for (const result of results) {
      for (const error of result.errors) {
        if (this.config.fatalErrors.includes(error.code)) {
          fatal.push(error)
        }
      }
    }

    return fatal
  }

  // Auto-fix using lint tools
  async autoFix(file: string): Promise<boolean> {
    if (!this.config.autoFix) {
      return false
    }

    const fixCommands = [
      'ruff check {file} --fix',
      'ruff format {file}',
      'eslint {file} --fix',
    ]

    for (const cmd of fixCommands) {
      const command = cmd.replace('{file}', file)

      try {
        const { spawn } = await import('child_process')
        const result = await new Promise<number>((resolve) => {
          const proc = spawn('sh', ['-c', command])
          proc.on('close', (code) => resolve(code ?? 1))
        })

        if (result === 0) {
          console.log(`[Lint] Auto-fixed: ${file}`)
          return true
        }
      } catch {
        // Continue with next command
      }
    }

    return false
  }

  private matchesLanguage(language: string, file: string): boolean {
    const ext = file.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string[]> = {
      python: ['py'],
      javascript: ['js', 'jsx', 'mjs'],
      typescript: ['ts', 'tsx'],
      ruby: ['rb'],
      go: ['go'],
      rust: ['rs'],
      java: ['java'],
      css: ['css', 'scss', 'sass'],
      html: ['html', 'htm'],
    }

    return langMap[language]?.includes(ext ?? '') ?? false
  }
}

// Format lint results for display
export function formatLintResults(results: LintResult[]): string {
  if (results.length === 0) {
    return 'No lint issues found.'
  }

  const lines: string[] = []

  for (const result of results) {
    lines.push(`## ${result.tool}: ${result.passed ? 'PASSED' : 'FAILED'}`)

    for (const error of result.errors) {
      const loc = error.column ? `:${error.column}` : ''
      lines.push(`  ${error.file}:${error.line}${loc} ${error.code}: ${error.message}`)
    }

    for (const warning of result.warnings) {
      lines.push(`  ${warning.file}:${warning.line} warning: ${warning.message}`)
    }

    if (result.errors.length === 0 && result.warnings.length === 0 && result.output) {
      lines.push(`  ${result.output.substring(0, 200)}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

// Generate fix suggestions
export function generateFixSuggestions(error: LintError): string {
  switch (error.code) {
    case 'E501':
      return 'Line too long. Break the line or increase max line length.'

    case 'F401':
      return 'Unused import. Remove it or prefix with underscore.'

    case 'F821':
      return 'Undefined name. Check for typos or missing imports.'

    case 'F823':
      return 'Local variable referenced before assignment. Initialize before use.'

    case 'E9':
      return 'Syntax or runtime error. Check Python version compatibility.'

    case 'SYNTAX':
      return `Syntax error: ${error.message}`

    default:
      return `Run the linter manually for more details.`
  }
}

export default {
  LintRunner,
  formatLintResults,
  generateFixSuggestions,
  defaultLintConfig,
  PYTHON_FATAL_ERRORS,
}
