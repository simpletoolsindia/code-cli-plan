// System Prompt Variants - Model-specific prompt builder
// Based on Cline's prompt builder pattern

export interface PromptVariant {
  name: string
  description: string
  maxTools?: number
  includeRules?: boolean
  includeTips?: boolean
  condensed?: boolean
}

export interface PromptComponent {
  id: string
  content: string
  enabled: boolean
  order: number
}

export interface PromptConfig {
  variant: PromptVariant
  components: PromptComponent[]
  tools?: PromptTool[]
  rules?: string[]
  tips?: string[]
}

// Tool definitions for prompts
export interface PromptTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

// Default variants
export const VARIANTS: Record<string, PromptVariant> = {
  generic: {
    name: 'generic',
    description: 'Generic model (GPT-4, Claude 2)',
    maxTools: 10,
    includeRules: true,
    includeTips: true,
  },
  next_gen: {
    name: 'next_gen',
    description: 'Next-gen models (Claude 3.5, GPT-4o, Gemini)',
    maxTools: 20,
    includeRules: true,
    includeTips: true,
    condensed: false,
  },
  xs: {
    name: 'xs',
    description: 'Small context models (Gemma, Phi-3)',
    maxTools: 5,
    includeRules: true,
    includeTips: false,
    condensed: true,
  },
}

// Prompt Registry
const registry = new Map<string, PromptConfig>()

export function registerPrompt(id: string, config: PromptConfig): void {
  registry.set(id, config)
}

export function getPrompt(id: string): PromptConfig | undefined {
  return registry.get(id)
}

// Builder pattern
export class PromptBuilder {
  private config: PromptConfig

  constructor(variant: PromptVariant = VARIANTS.generic) {
    this.config = {
      variant,
      components: [],
      rules: [],
      tips: [],
    }
  }

  addComponent(id: string, content: string, order = 0): this {
    this.config.components.push({ id, content, enabled: true, order })
    return this
  }

  addRule(rule: string): this {
    this.config.rules?.push(rule)
    return this
  }

  addTip(tip: string): this {
    this.config.tips?.push(tip)
    return this
  }

  setTools(tools: PromptTool[]): this {
    this.config.tools = tools
    return this
  }

  enableComponent(id: string): this {
    const comp = this.config.components.find(c => c.id === id)
    if (comp) comp.enabled = true
    return this
  }

  disableComponent(id: string): this {
    const comp = this.config.components.find(c => c.id === id)
    if (comp) comp.enabled = false
    return this
  }

  build(): string {
    const parts: string[] = []

    // System role header
    parts.push(this.buildHeader())

    // Components
    const sortedComponents = this.config.components
      .filter(c => c.enabled)
      .sort((a, b) => a.order - b.order)

    for (const comp of sortedComponents) {
      parts.push(comp.content)
    }

    // Rules
    if (this.config.variant.includeRules && this.config.rules?.length) {
      parts.push(this.buildRules())
    }

    // Tips
    if (this.config.variant.includeTips && this.config.tips?.length) {
      parts.push(this.buildTips())
    }

    // Tools
    if (this.config.tools?.length) {
      parts.push(this.buildTools())
    }

    return parts.join('\n\n')
  }

  private buildHeader(): string {
    const model = this.config.variant.name
    return `You are Beast CLI, an AI coding assistant.
Model variant: ${this.config.variant.description}`
  }

  private buildRules(): string {
    const rules = [
      'Always prioritize safety - never execute harmful commands',
      'Ask for confirmation before destructive operations',
      'Respect .gitignore and project conventions',
      'Use type-safe code patterns',
      'Prefer functional approaches over imperative where appropriate',
    ]

    if (this.config.rules) {
      rules.push(...this.config.rules)
    }

    return `## Rules\n${rules.map(r => `- ${r}`).join('\n')}`
  }

  private buildTips(): string {
    const tips = [
      'Use tools in parallel when possible',
      'Prefer Read before Edit operations',
      'Group related file changes in single commits',
    ]

    if (this.config.tips) {
      tips.push(...this.config.tips)
    }

    return `## Tips\n${tips.map(t => `- ${t}`).join('\n')}`
  }

  private buildTools(): string {
    const maxTools = this.config.variant.maxTools ?? 10
    const tools = this.config.tools?.slice(0, maxTools) ?? []

    if (tools.length === 0) {
      return ''
    }

    let toolSection = '## Available Tools\n\nUse tools when needed:\n\n'

    for (const tool of tools) {
      toolSection += `### ${tool.name}\n`
      if (tool.description) {
        toolSection += `${tool.description}\n`
      }
      if (tool.inputSchema && Object.keys(tool.inputSchema).length > 0) {
        toolSection += `Arguments:\n\`\`\`json\n${JSON.stringify(tool.inputSchema, null, 2)}\n\`\`\`\n`
      }
      toolSection += '\n'
    }

    return toolSection
  }
}

// Variant-specific builders
export function buildGenericPrompt(tools?: PromptTool[]): string {
  return new PromptBuilder(VARIANTS.generic)
    .addComponent('capabilities', '## Capabilities\n- Read, edit, and execute code\n- Search and navigate codebases\n- Run shell commands\n- Git operations')
    .addComponent('context', '## Context\nYou have access to the current working directory and can modify files as needed.')
    .setTools(tools ?? [])
    .build()
}

export function buildNextGenPrompt(tools?: PromptTool[]): string {
  return new PromptBuilder(VARIANTS.next_gen)
    .addComponent('capabilities', '## Capabilities\n- Advanced code analysis and refactoring\n- Multi-file context understanding\n- Parallel tool execution\n- Deep git integration')
    .addComponent('context', '## Context\nYou have full context of the codebase and can make informed decisions.')
    .addComponent('advanced', '## Advanced Features\n- Long context handling\n- Complex refactoring\n- Architectural suggestions\n- Performance optimization')
    .addTip('Use tools in parallel for efficiency')
    .addTip('Prefer structured approaches for large changes')
    .setTools(tools ?? [])
    .build()
}

export function buildXSPrompt(tools?: PromptTool[]): string {
  return new PromptBuilder(VARIANTS.xs)
    .addComponent('capabilities', '## Capabilities\n- Edit and execute code\n- Run commands')
    .setTools(tools ?? [])
    .build()
}

// Detect variant from model name
export function detectVariant(model: string): PromptVariant {
  const lower = model.toLowerCase()

  if (
    lower.includes('claude-3') ||
    lower.includes('gpt-4') ||
    lower.includes('gemini-1.5') ||
    lower.includes('llama-3') ||
    lower.includes('mistral-large')
  ) {
    return VARIANTS.next_gen
  }

  if (
    lower.includes('gemma') ||
    lower.includes('phi') ||
    lower.includes('codellama') ||
    lower.includes('tiny')
  ) {
    return VARIANTS.xs
  }

  return VARIANTS.generic
}

// Build prompt for model
export function buildPromptForModel(model: string, tools?: PromptTool[]): string {
  const variant = detectVariant(model)

  switch (variant.name) {
    case 'next_gen':
      return buildNextGenPrompt(tools)
    case 'xs':
      return buildXSPrompt(tools)
    default:
      return buildGenericPrompt(tools)
  }
}

export default {
  PromptBuilder,
  VARIANTS,
  registerPrompt,
  getPrompt,
  buildGenericPrompt,
  buildNextGenPrompt,
  buildXSPrompt,
  detectVariant,
  buildPromptForModel,
}
