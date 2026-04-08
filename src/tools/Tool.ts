import type { z } from 'zod'
import type React from 'react'

// Types
export type ValidationResult =
  | { result: true }
  | { result: false; message: string; errorCode: number }

export type ToolResult<T> = {
  data: T
  newMessages?: unknown[]
}

export type ToolCallProgress<T extends ToolProgressData = ToolProgressData> = (
  progress: { toolUseID: string; data: T }
) => void

export type ToolProgressData = {
  type: string
  [key: string]: unknown
}

export type Progress = ToolProgressData

// Tool interface
export interface Tool<
  Input extends AnyObject = AnyObject,
  Output = unknown,
  P extends ToolProgressData = ToolProgressData,
> {
  name: string
  aliases?: string[]
  searchHint?: string

  call(
    args: z.infer<Input>,
    context: ToolUseContext,
    canUseTool: CanUseToolFn,
    onProgress?: ToolCallProgress<P>
  ): Promise<ToolResult<Output>>

  description(
    input: z.infer<Input>,
    options: {
      isNonInteractiveSession: boolean
      toolPermissionContext: ToolPermissionContext
      tools: Tools
    }
  ): Promise<string>

  readonly inputSchema: Input
  outputSchema?: z.ZodType<unknown>

  isConcurrencySafe(input: z.infer<Input>): boolean
  isEnabled(): boolean
  isReadOnly(input: z.infer<Input>): boolean
  isDestructive?(input: z.infer<Input>): boolean

  interruptBehavior?(): 'cancel' | 'block'

  isSearchOrReadCommand?(input: z.infer<Input>): {
    isSearch: boolean
    isRead: boolean
    isList?: boolean
  }

  isOpenWorld?(input: z.infer<Input>): boolean
  requiresUserInteraction?(): boolean
  isMcp?: boolean
  isLsp?: boolean
  shouldDefer?: boolean
  alwaysLoad?: boolean

  mcpInfo?: { serverName: string; toolName: string }
  maxResultSizeChars: number
  strict?: boolean

  userFacingName(input: Partial<z.infer<Input>> | undefined): string

  renderToolUseMessage(
    input: Partial<z.infer<Input>>,
    options: { theme: ThemeName; verbose: boolean; commands?: Command[] }
  ): React.ReactNode

  mapToolResultToToolResultBlockParam(
    content: Output,
    toolUseID: string
  ): ToolResultBlockParam

  renderToolResultMessage?(
    content: Output,
    progressMessagesForMessage: ProgressMessage<P>[],
    options: {
      style?: 'condensed'
      theme: ThemeName
      tools: Tools
      verbose: boolean
      isTranscriptMode?: boolean
      isBriefOnly?: boolean
      input?: unknown
    }
  ): React.ReactNode

  extractSearchText?(out: Output): string

  renderToolUseProgressMessage?(
    progressMessagesForMessage: ProgressMessage<P>[],
    options: {
      tools: Tools
      verbose: boolean
      terminalSize?: { columns: number; rows: number }
      inProgressToolCallCount?: number
      isTranscriptMode?: boolean
    }
  ): React.ReactNode

  renderToolUseQueuedMessage?(): React.ReactNode
}

// Helper types
export type AnyObject = z.ZodType<{ [key: string]: unknown }>
export type Tools = Tool[]
export type Command = { name: string; description: string }
export type ThemeName = 'dark' | 'light' | 'terminal'

export interface ToolResultBlockParam {
  type: 'tool_result'
  content: unknown
  tool_use_id?: string
}

export interface ProgressMessage<T extends ToolProgressData = ToolProgressData> {
  type: 'progress'
  toolUseID: string
  data: T
}

export type ToolUseContext = {
  abortController: AbortController
  messages: Message[]
  options: {
    tools: Tools
    verbose: boolean
    thinkingConfig?: ThinkingConfig
  }
}

export type ThinkingConfig = {
  enabled: boolean
  budget: number
}

export type Message = {
  type: string
  [key: string]: unknown
}

export type CanUseToolFn = (
  toolName: string,
  input: Record<string, unknown>
) => Promise<PermissionResult>

export type PermissionResult = {
  allowed: boolean
  reason?: string
}

export type ToolPermissionContext = {
  mode: PermissionMode
  alwaysAllowRules: ToolPermissionRulesBySource
  alwaysDenyRules: ToolPermissionRulesBySource
  alwaysAskRules: ToolPermissionRulesBySource
}

export type PermissionMode =
  | 'plan'
  | 'default'
  | 'acceptEdits'
  | 'auto'
  | 'bypass'
  | 'dontAsk'

export type ToolPermissionRulesBySource = Record<string, string[]>

// buildTool factory
export type ToolDef<
  Input extends AnyObject = AnyObject,
  Output = unknown,
  P extends ToolProgressData = ToolProgressData,
> = Partial<Tool<Input, Output, P>> & {
  name: string
  inputSchema: Input
}

export function buildTool<
  Input extends AnyObject,
  Output,
  P extends ToolProgressData,
>(def: ToolDef<Input, Output, P>): Tool<Input, Output, P> {
  return {
    // Default values
    isConcurrencySafe: () => false,
    isEnabled: () => true,
    isReadOnly: () => true,
    maxResultSizeChars: 10_000,
    userFacingName: () => def.name,
    alwaysLoad: def.alwaysLoad ?? false,
    shouldDefer: def.shouldDefer ?? false,
    ...def,
  } as Tool<Input, Output, P>
}