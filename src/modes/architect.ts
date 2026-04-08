// Architect Mode - Two-model pattern (Aider-style)
// Architect proposes changes, Editor implements

import { z } from 'zod'

export interface ArchitectConfig {
  architectModel: string
  editorModel: string
  architectPrompt: string
  editorPrompt: string
  outputFormat: 'json' | 'markdown'
}

export const defaultArchitectConfig: ArchitectConfig = {
  architectModel: '',
  editorModel: '',
  architectPrompt: `You are an architect. Analyze the codebase and propose structured changes.
Output JSON with:
- "analysis": Current state assessment
- "proposedChanges": Array of {file, action, description}
- "dependencies": Array of related files
- "risks": Array of potential issues
`,
  editorPrompt: `You are an editor. Implement the architect's proposed changes exactly.
Follow the structured proposal and make precise edits.
`,
  outputFormat: 'json',
}

// Architect proposal schema
export const ArchitectProposalSchema = z.object({
  analysis: z.string(),
  proposedChanges: z.array(
    z.object({
      file: z.string(),
      action: z.enum(['create', 'edit', 'delete', 'refactor']),
      description: z.string(),
      priority: z.number().optional(),
    })
  ),
  dependencies: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
})

export type ArchitectProposal = z.infer<typeof ArchitectProposalSchema>

// Proposal status
export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'implemented'

export interface ProposalRecord {
  id: string
  proposal: ArchitectProposal
  status: ProposalStatus
  createdAt: number
  updatedAt: number
  reviewedBy?: string
}

// Architect session
export class ArchitectSession {
  private proposals: Map<string, ProposalRecord> = new Map()
  private currentProposalId: string | null = null

  constructor(
    private config: ArchitectConfig,
    private onArchitectRequest: (prompt: string) => Promise<string>,
    private onEditorRequest: (prompt: string) => Promise<string>
  ) {}

  // Generate proposal using architect model
  async generateProposal(
    task: string,
    context: {
      files?: string[]
      relevantCode?: string
      constraints?: string[]
    }
  ): Promise<ArchitectProposal> {
    const prompt = `
Task: ${task}

${context.files ? `Files to consider:\n${context.files.join('\n')}` : ''}
${context.relevantCode ? `\nRelevant code:\n\`\`\`\n${context.relevantCode}\n\`\`\`` : ''}
${context.constraints ? `\nConstraints:\n${context.constraints.map(c => `- ${c}`).join('\n')}` : ''}

${this.config.architectPrompt}
`

    const response = await this.onArchitectRequest(prompt)

    // Parse JSON response
    try {
      const parsed = JSON.parse(response)
      const proposal = ArchitectProposalSchema.parse(parsed)

      // Store proposal
      const id = `proposal-${Date.now()}`
      this.proposals.set(id, {
        id,
        proposal,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      this.currentProposalId = id

      return proposal
    } catch (e) {
      // If not valid JSON, return as text proposal
      return {
        analysis: response.substring(0, 500),
        proposedChanges: [],
        risks: ['Could not parse architect response as JSON'],
        confidence: 0.3,
      }
    }
  }

  // Approve proposal
  approveProposal(id?: string): boolean {
    const targetId = id ?? this.currentProposalId
    if (!targetId) return false

    const record = this.proposals.get(targetId)
    if (!record) return false

    record.status = 'approved'
    record.updatedAt = Date.now()
    return true
  }

  // Reject proposal
  rejectProposal(id?: string, reason?: string): boolean {
    const targetId = id ?? this.currentProposalId
    if (!targetId) return false

    const record = this.proposals.get(targetId)
    if (!record) return false

    record.status = 'rejected'
    record.updatedAt = Date.now()
    record.reviewedBy = reason
    return true
  }

  // Get current proposal
  getCurrentProposal(): ArchitectProposal | null {
    if (!this.currentProposalId) return null
    const record = this.proposals.get(this.currentProposalId)
    return record?.proposal ?? null
  }

  // Get all proposals
  getAllProposals(): ProposalRecord[] {
    return Array.from(this.proposals.values())
  }

  // Mark as implemented
  markImplemented(id?: string): boolean {
    const targetId = id ?? this.currentProposalId
    if (!targetId) return false

    const record = this.proposals.get(targetId)
    if (!record || record.status !== 'approved') return false

    record.status = 'implemented'
    record.updatedAt = Date.now()
    return true
  }
}

// Editor implementation
export async function editorImplement(
  proposal: ArchitectProposal,
  editorRequest: (prompt: string) => Promise<string>
): Promise<{ success: boolean; edits: string[]; errors?: string[] }> {
  const prompt = `
Implement the following proposed changes:

Analysis: ${proposal.analysis}

Changes to implement:
${proposal.proposedChanges.map((c, i) => `${i + 1}. ${c.file} - ${c.action}: ${c.description}`).join('\n')}

${proposal.dependencies ? `Dependencies:\n${proposal.dependencies.join('\n')}` : ''}
${proposal.risks ? `Risks to watch:\n${proposal.risks.join('\n')}` : ''}

${defaultArchitectConfig.editorPrompt}
`

  const response = await editorRequest(prompt)

  return {
    success: true,
    edits: response.split('\n').filter(l => l.includes('Edit:') || l.includes('Created:')),
  }
}

// Context preservation on mode switch
export interface ModeContext {
  mode: 'architect' | 'editor' | 'default'
  architectProposal?: ArchitectProposal
  pendingEdits: string[]
  conversationHistory: string[]
}

export function preserveContext(ctx: ModeContext): ModeContext {
  return {
    ...ctx,
    conversationHistory: [...ctx.conversationHistory],
    pendingEdits: [...ctx.pendingEdits],
  }
}

export function restoreContext(saved: ModeContext): ModeContext {
  return preserveContext(saved)
}

// Mode-specific prompts
export const modePrompts = {
  architect: {
    system: `You are in Architect Mode. Your role is to analyze the codebase and propose changes.
Be thorough: identify dependencies, risks, and implementation order.
Always output structured JSON proposals.`,
    user: `Enter architect mode to analyze this task:`,
  },
  editor: {
    system: `You are in Editor Mode. Implement the architect's approved proposals precisely.
Follow the structured plan exactly. Ask for clarification if needed.`,
    user: `Enter editor mode to implement changes:`,
  },
}

export default {
  ArchitectSession,
  ArchitectProposalSchema,
  defaultArchitectConfig,
  editorImplement,
  preserveContext,
  restoreContext,
  modePrompts,
}
