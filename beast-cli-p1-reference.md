# Beast CLI - Phase 1: Source Code References

**Phase**: P1
**Purpose**: Exact source file paths with 3-line implementation explanations

---

## P1-01: Tool System

### buildTool() Factory
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/Tool.ts` |
| **Lines** | 793 |
| **How it works** | 1. Factory pattern with `buildTool(def)` accepting partial definitions |
| | 2. Provides defaults for all optional fields (fail-closed) |
| | 3. Zod schemas validate input, generate descriptions automatically |

### Tool Registry
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/tools.ts` |
| **Lines** | 390 |
| **How it works** | 1. `getTools()` returns all registered tools |
| | 2. `assembleToolPool()` appends MCP tools, deduplicates by name |
| | 3. Built-in tools first, MCP tools appended |

### Permission Patterns
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/permissions/dangerousPatterns.ts` |
| **Lines** | 150 |
| **How it works** | 1. Matches commands against dangerousPatterns list (rm -rf, git push --force) |
| | 2. `bashClassifier` uses ML model to classify bash safety |
| | 3. Pattern matching for path traversal (../, null bytes) |

---

## P1-02: TUI Framework

### Ink Components (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/cli/src/components/` |
| **Files** | 20+ |
| **How it works** | 1. React components using Ink for CLI rendering |
| | 2. `<Box>`, `<Text>`, `<Color>` primitives from ink |
| | 3. Event handling via `<StdinContext>` |

### Ink Main (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/cli/src/App.tsx` |
| **Lines** | 300+ |
| **How it works** | 1. `<render>` component with full app tree |
| | 2. `<StdinContext>` for keyboard input |
| | 3. `<Static>` for non-scrolling output areas |

### Markdown Rendering
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/src/utils/markdown.ts` |
| **Lines** | 100 |
| **How it works** | 1. Uses `marked` library for markdown parsing |
| | 2. Custom renderers for code blocks with syntax highlighting |
| | 3. Resolves local file links relative to workspace |

### Desktop Notifications
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/tui/src/notifications/mod.rs` |
| **Lines** | 150 |
| **How it works** | 1. OSC 9 escape sequences for WezTerm, ghostty, iTerm |
| | 2. BEL character (`\x07`) fallback for unsupported terminals |
| | 3. Detects terminal via `TERM_PROGRAM`, `TERM`, platform |

---

## P1-03: Core Engine

### Effect Module
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/effect/` |
| **Files** | 20 |
| **How it works** | 1. `Effect<E, A, R>` type represents computations with errors |
| | 2. Services provide dependency injection via Layer |
| | 3. Cancellation via AbortSignal in Context |

### Agent Loop
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/session/index.ts` |
| **Lines** | 500+ |
| **How it works** | 1. SQLite storage with JSON migration |
| | 2. Message versioning (MessageV2) |
| | 3. Compaction triggers at 40K tokens |

### Streaming
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/streaming/` |
| **Lines** | 200+ |
| **How it works** | 1. Streams AI responses incrementally |
| | 2. Buffer management for smooth display |
| | 3. Cancellation support via AbortController |

---

## P1-04: Mode System

### Permission Modes
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/types/permissions.ts` |
| **Lines** | 150 |
| **How it works** | 1. Enum with 6 modes: plan, default, acceptEdits, auto, bypass, dontAsk |
| | 2. Each mode affects how `canUseTool()` evaluates |
| | 3. Visual feedback via status line indicator |

### Mode Selection (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/cli/src/utils/mode-selection.ts` |
| **Lines** | 100 |
| **How it works** | 1. Plan mode disables write/edit/bash tools |
| | 2. Different models can be configured per mode |
| | 3. Conversation history preserved on mode switch |

---

## P1-05: Configuration

### YAML Config (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/args.py` |
| **Lines** | 1000+ |
| **How it works** | 1. Loads `.aider.conf.yml` from project root |
| | 2. Environment variables expand via `${VAR}` syntax |
| | 3. Defaults applied from code, overridden by file |

---

## P1-06: State Persistence

### SQLite Session (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/session/index.ts` |
| **Lines** | 500+ |
| **How it works** | 1. SQLite stores messages as JSON |
| | 2. Session ID ties messages to session |
| | 3. History queryable by time range |

### State (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/session/index.ts` |
| **Lines** | 300+ |
| **How it works** | 1. SQLite-backed persistent state via sql.js |
| | 2. Thread metadata storage |
| | 3. Memory state management |

---

## Quick Code Snippets

### Tool Interface (TypeScript)
```typescript
export interface Tool<Input, Output, P = ToolProgressData> {
  name: string
  call(args, context, canUseTool, onProgress?): Promise<ToolResult<Output>>
  description(input, options): Promise<string>
  inputSchema: z.ZodType
  isConcurrencySafe(input): boolean
  isReadOnly(input): boolean
  renderToolUseMessage(input, options): React.ReactNode
  maxResultSizeChars: number
}
```

### Effect Pattern (TypeScript)
```typescript
export function defineToolEffect<T, R>(
  id: string,
  execute: (args: T, ctx: Context) => Effect<ToolResult, Error, R>
): Effect<ToolInfo, never, R>
// Cancellation via AbortController
await ctx.abort
```

### Ink Component (TypeScript)
```typescript
import { Box, Text, render } from 'ink'
import React from 'react'

const App = () => (
  <Box>
    <Text>Hello, Beast CLI!</Text>
  </Box>
)

render(<App />)
```

---

**End of P1 Reference**
