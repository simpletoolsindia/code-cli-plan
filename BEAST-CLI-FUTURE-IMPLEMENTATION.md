# Beast CLI - Future Implementation Blueprint

> Based on Claude Code v2.1.88 source map analysis (ChinaSiro/claude-code-sourcemap)

## Overview

This document captures architectural patterns from Claude Code for future implementation phases. Unlike `CLAUDE.md` which covers current implementation, this tracks patterns to implement when scaling up.

## Source Reference

- **Cloned from**: https://github.com/ChinaSiro/claude-code-sourcemap
- **Version analyzed**: 2.1.88 (1884 TypeScript source files, 4756 total files)
- **Location**: `/home/sridhar/claude-code-sourcemap/`

---

## Architecture Map

```
main.tsx (CLI entry)
    │
    ▼
query.ts (Main Agent Loop - 1729 lines)
    │
    ├── services/api/claude.ts (Anthropic API via SDK)
    │
    ├── services/tools/toolOrchestration.ts
    │       │
    │       ├── runTools() - partitions into serial/parallel batches
    │       ├── runToolsSerially() - non-concurrency-safe tools
    │       └── runToolsConcurrently() - read-only tools (max 10)
    │
    ├── services/mcp/client.ts (3348 lines)
    │       │
    │       ├── Multi-transport: stdio, SSE, HTTP, WebSocket
    │       ├── OAuth support
    │       ├── Session management
    │       └── McpAuthError, McpToolCallError
    │
    └── services/compact/
            ├── autoCompact.js - token budget triggering
            ├── compact.js - message summarization
            └── reactiveCompact.js - on-demand compaction
```

---

## Priority Patterns to Implement

### 1. Zod-Based Tool Schema → API Format

**Status**: Not implemented
**Priority**: High

**Current (Beast CLI)**:
- Manual JSON schemas in system prompt
- Regex-parsed tool calls

**Claude Code Pattern** (`utils/api.ts`):
```typescript
export async function toolToAPISchema(
  tool: Tool,
  options: {
    getToolPermissionContext: () => Promise<ToolPermissionContext>
    tools: Tools
    agents: AgentDefinition[]
    allowedAgentTypes?: string[]
    model?: string
    deferLoading?: boolean
    cacheControl?: { type: 'ephemeral'; scope?: 'global' | 'org' }
  },
): Promise<BetaToolUnion>
```

**Key features**:
- Zod schema → JSON Schema via `zodToJsonSchema()`
- Session-stable caching via `toolSchemaCache`
- `strict` mode for structured outputs
- `defer_loading` for tool search
- Cache control headers

**Implementation notes**:
- `inputJSONSchema` field on Tool interface
- Schema cache keyed by `{name}:{inputJSONSchema}`
- Prevents mid-session GrowthBook flips causing churn

---

### 2. Tool Schema Caching

**Status**: Not implemented
**Priority**: High

**Claude Code Pattern**:
```typescript
// Cache key includes inputJSONSchema for StructuredOutput uniqueness
const cacheKey =
  'inputJSONSchema' in tool && tool.inputJSONSchema
    ? `${tool.name}:${jsonStringify(tool.inputJSONSchema)}`
    : tool.name
const cache = getToolSchemaCache()
let base = cache.get(cacheKey)
```

**Why it matters**:
- Without caching, tool schemas recompute on every call
- StructuredOutput tools share names but have different schemas per workflow
- 5.4% → 51% error rate without proper keying (PR#25424)

---

### 3. Concurrency-Safe Tool Batching

**Status**: Not implemented
**Priority**: High

**Claude Code Pattern** (`services/tools/toolOrchestration.ts`):
```typescript
function partitionToolCalls(
  toolUseMessages: ToolUseBlock[],
  toolUseContext: ToolUseContext,
): Batch[] {
  return toolUseMessages.reduce((acc: Batch[], toolUse) => {
    const tool = findToolByName(toolUseContext.options.tools, toolUse.name)
    const parsedInput = tool?.inputSchema.safeParse(toolUse.input)
    const isConcurrencySafe = parsedInput?.success
      ? Boolean(tool?.isConcurrencySafe(parsedInput.data))
      : false
    // Group consecutive read-only tools together
    if (isConcurrencySafe && acc[acc.length - 1]?.isConcurrencySafe) {
      acc[acc.length - 1]!.blocks.push(toolUse)
    } else {
      acc.push({ isConcurrencySafe, blocks: [toolUse] })
    }
    return acc
  }, [])
}

function getMaxToolUseConcurrency(): number {
  return parseInt(process.env.CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY || '', 10) || 10
}
```

**Implementation notes**:
- `isConcurrencySafe(args)` method on Tool interface
- Read-only tools batched concurrently (up to 10)
- Write/side-effect tools run serially
- Tool input is parsed and validated before concurrency decision

---

### 4. Coordinator Mode (Multi-Agent)

**Status**: Partially implemented (WorkerAgent pattern)
**Priority**: Medium

**Claude Code Pattern** (`coordinator/coordinatorMode.ts`):
- Coordinator is the main AI, workers are spawned via AgentTool
- Task results delivered as XML `<task-notification>` in user messages
- `SendMessage` to continue existing workers
- `TaskStop` to halt mid-flight workers
- Phase model: Research → Synthesis → Implementation → Verification

**Coordinator System Prompt**:
```
You are a coordinator. Your job is to:
- Direct workers to research, implement and verify code changes
- Synthesize results and communicate with the user
- Workers can't see your conversation — every prompt must be self-contained
```

**Task Notification Format**:
```xml
<task-notification>
  <task-id>{agentId}</task-id>
  <status>completed|failed|killed</status>
  <summary>{human-readable status summary}</summary>
  <result>{agent's final text response}</result>
  <usage>
    <total_tokens>N</total_tokens>
    <tool_uses>N</tool_uses>
    <duration_ms>N</duration_ms>
  </usage>
</task-notification>
```

**Key insight**: Results are user-role messages, not assistant. Coordinator distinguishes via `<task-notification>` tag.

---

### 5. MCP Multi-Transport

**Status**: Partially implemented (stdio + HTTP)
**Priority**: Medium

**Claude Code Pattern** (`services/mcp/client.ts` - 3348 lines):
- StdioClientTransport
- SSEClientTransport
- StreamableHTTPClientTransport
- WebSocketTransport (custom via `utils/mcpWebSocketTransport.ts`)
- OAuth with PKCE
- Session management with `McpSessionExpiredError`
- Multi-server orchestration with caching

**Your current pattern** (`src/mcp/index.ts`):
- StdioTransport
- SSETransport
- HTTPTransport
- No WebSocket

**Missing from Beast CLI**:
- Session tracking (MCP-Session-ID header)
- OAuth PKCE flow
- Session expiration detection and retry
- `McpToolCallError` with result meta

---

### 6. Permission Classifier (Bash Security)

**Status**: Partially implemented (simple mode checks)
**Priority**: High

**Claude Code Pattern** (`tools/BashTool/bashPermissions.ts`):
```typescript
// Three-layer permission checking:
1. AST parsing with tree-sitter
   ├── parseForSecurityFromAst()
   ├── checkSemantics() - command type analysis
   └── nodeTypeId() - classify node types

2. Classifier-based (machine learning)
   ├── classifyBashCommand()
   ├── getBashPromptAllowDescriptions()
   ├── getBashPromptAskDescriptions()
   └── getBashPromptDenyDescriptions()

3. Rule-based (shell rule matching)
   ├── matchWildcardPattern()
   ├── permissionRuleExtractPrefix()
   └── suggestionForExactCommand()
```

**Why it matters**: Regex is brittle for security. AST + ML classifier handles:
- Compound commands: `cmd1 && cmd2 || cmd3`
- Redirections: `cmd > file 2>&1`
- Variable expansion: `$VAR`
- Heredocs: `cmd << 'EOF'`

---

### 7. Auto-Compaction System

**Status**: Basic token budget (not implemented)
**Priority**: Medium

**Claude Code Pattern** (`services/compact/`):
- `autoCompact.js` - token budget triggering
- `compact.js` - message summarization
- `reactiveCompact.js` - on-demand (triggered by API error)
- `snipCompact.js` - history trimming
- `contextCollapse/` - context-level collapsing

**Token Budget System**:
```typescript
// 500K auto-continue feature
const budgetTracker = createBudgetTracker()

interface BudgetTracker {
  getCurrentTurnTokenBudget(): number
  getTurnOutputTokens(): number
  incrementBudgetContinuationCount(): void
  checkTokenBudget(): boolean
}
```

---

### 8. Tool Streaming (Fine-Grained Token Streaming)

**Status**: Not implemented
**Priority**: Low

**Claude Code Pattern**:
```typescript
// API field: fine_grained_tool_streaming
// Without this, API buffers entire tool input before sending
// input_json_delta events

// Gated to direct api.anthropic.com only
// Proxies (LiteLLM etc.) reject with 400
if (getAPIProvider() === 'firstParty') {
  base.fine_grained_tool_streaming = true
}
```

**Why it matters**: Multi-minute hangs on large tool inputs without this.

---

### 9. Subagent Context Isolation

**Status**: Basic implementation (createSubagentContext)
**Priority**: Medium

**Claude Code Pattern** (`tools/AgentTool/runAgent.ts`):
```typescript
// Clone file state cache for forked context
const agentReadFileState =
  forkContextMessages !== undefined
    ? cloneFileStateCache(toolUseContext.readFileState)
    : createFileStateCacheWithSizeLimit(READ_FILE_STATE_CACHE_SIZE)

// Omit CLAUDE.md from read-only agents (Explore, Plan)
// Saves ~5-15 Gtok/week across 34M+ Explore spawns
const shouldOmitClaudeMd =
  agentDefinition.omitClaudeMd && !override?.userContext

// Omit gitStatus from search agents
// Saves ~1-3 Gtok/week fleet-wide
const resolvedSystemContext =
  agentDefinition.agentType === 'Explore' ||
  agentDefinition.agentType === 'Plan'
    ? systemContextNoGit
    : baseSystemContext
```

**Key optimizations**:
- File state cache cloning
- Selective CLAUDE.md omission
- gitStatus omitted for read-only agents
- Frontmatter MCP servers (agent-specific, additive)
- Frontmatter hooks (scoped to agent lifecycle)

---

### 10. Feature Flags (GrowthBook Integration)

**Status**: Not implemented
**Priority**: Low

**Claude Code Pattern**:
```typescript
import { feature } from 'bun:bundle'
import { getFeatureValue_CACHED_MAY_BE_STALE } from '../services/analytics/growthbook.js'

// Feature-gated code paths
const reactiveCompact = feature('REACTIVE_COMPACT')
  ? require('./services/compact/reactiveCompact.js')
  : null

// Experiment values
const shouldOmitClaudeMd =
  agentDefinition.omitClaudeMd &&
  !override?.userContext &&
  getFeatureValue_CACHED_MAY_BE_STALE('tengu_slim_subagent_claudemd', true)
```

**Why it matters**:
- Gradual rollouts
- A/B experiments on features
- Kill switches without redeployment
- Statsig/GrowthBook integration for remote config

---

## Tool Interface Comparison

### Current (Beast CLI)

```typescript
interface Tool {
  name: string
  description?: string
  inputSchema: Record<string, unknown>  // Manual JSON schema
  call(args, ctx, check): Promise<Result>
  isReadOnly?(args): boolean
}
```

### Target (Claude Code Pattern)

```typescript
interface Tool {
  name: string
  description?: string
  inputSchema: z.ZodType  // Zod schema
  inputJSONSchema?: ToolInputJSONSchema  // Pre-computed JSON schema
  strict?: boolean  // For structured outputs
  isConcurrencySafe?(args): boolean
  isDestructive?(args): boolean
  annotations?: ToolAnnotations
  call(args, ctx, check): Promise<Result>
  prompt(ctx): Promise<string>
}

interface ToolAnnotations {
  readOnlyHint?: boolean
  destructiveHint?: boolean
  idempotentHint?: boolean
  omitInFinder?: boolean
}
```

---

## Implementation Priority Order

| Priority | Pattern | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Zod-based Tool Schema | Medium | High |
| 2 | Tool Schema Caching | Low | High |
| 3 | Concurrency-Safe Batching | Medium | High |
| 4 | Permission Classifier (Bash) | High | High |
| 5 | MCP Multi-Transport | Medium | Medium |
| 6 | Coordinator Mode | Medium | High |
| 7 | Auto-Compaction | High | Medium |
| 8 | Feature Flags | Medium | Medium |
| 9 | Tool Streaming | Low | Low |
| 10 | Subagent Context Isolation | Medium | Medium |

---

## File Reference Index

| Pattern | Claude Code Source | Beast CLI Target |
|---------|-------------------|-----------------|
| Tool interface | `src/Tool.ts` | `src/tools/Tool.ts` |
| Tool schema conversion | `src/utils/api.ts` | (new) |
| Tool orchestration | `src/services/tools/toolOrchestration.ts` | `src/tools/` |
| MCP client | `src/services/mcp/client.ts` | `src/mcp/index.ts` |
| Coordinator | `src/coordinator/coordinatorMode.ts` | (new) |
| Bash permissions | `src/tools/BashTool/bashPermissions.ts` | `src/tools/BashTool/` |
| Agent loop | `src/query.ts` | `src/engine/index.ts` |
| Compaction | `src/services/compact/` | (new) |

---

## Key Metrics from Claude Code

- **Explore spawns**: 34M+ per week
- **CLAUDE.md savings**: 5-15 Gtok/week (omit for read-only agents)
- **gitStatus savings**: 1-3 Gtok/week (omit for search agents)
- **Error rate without schema cache**: 51% (was 5.4%)
- **Token budget**: 500K auto-continue
- **Tool concurrency**: 10 max parallel

---

## Notes

- Claude Code uses Bun runtime (`bun:bundle` imports)
- Heavy use of `feature()` for experiment gating
- Statsig/GrowthBook for remote config
- `@anthropic-ai/sdk` for API calls
- `@modelcontextprotocol/sdk` for MCP protocol
- tree-sitter for AST parsing (security)
