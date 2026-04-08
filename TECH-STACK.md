# Beast CLI - Tech Stack Recommendation

**Date**: 2026-04-08
**Status**: RECOMMENDED

---

## Executive Summary

**Primary Recommendation**: **TypeScript/Node.js with Bun runtime**

**Rationale**: MCP ecosystem, developer availability, proven patterns from Claude Code/Cline, fastest path to MVP

---

## Tech Stack Comparison

| Criteria | TypeScript/Bun | Rust | Python | Go | Zig |
|----------|-----------------|------|--------|----|----|
| **MCP SDK** | Official ✅ | rmcp 0.15 | None ❌ | None ❌ | None ❌ |
| **TUI Frameworks** | Ink (React) ✅ | Ratatui ✅ | Rich ✅ | Bubble Tea | None ❌ |
| **Startup Speed** | Fast (Bun) | Fastest | Slow | Fast | Fast |
| **Binary Size** | Small (Bun) | Smallest | Medium | Small | Smallest |
| **Learning Curve** | Low | High | Lowest | Medium | High |
| **AI Providers** | Vercel AI SDK | Custom | litellm (50+) | None | None |
| **Git Integration** | simple-git | git2 | GitPython | go-git | None |
| **LSP Integration** | vscode-lsp | tower-lsp | pyright | gopls | None |
| **Sandbox Security** | No | Landlock ✅ | No | Partial | Partial |

---

## Recommended Stack

### Primary: TypeScript + Bun

```
Runtime:         Bun (faster startup than Node.js)
Language:        TypeScript 5.x (strict mode)
TUI Framework:  Ink (React for CLI) + custom components
MCP SDK:        @modelcontextprotocol/sdk + Cline's McpHub patterns
HTTP Client:     undici (built-in, fast)
Git:            simple-git
CLI Parser:     cac
Type Safety:     Zod validation
AI SDK:         Vercel AI SDK (multiple providers)
```

### Alternative: Rust (for security-critical components)

```
Language:        Rust 1.76+
TUI Framework:  Ratatui + Crossterm
Async Runtime:  tokio
Database:        sqlx (SQLite)
MCP SDK:        rmcp 0.15.0
Git:            git2
Sandbox:        landlock, seccomp
```

---

## Why TypeScript/Bun?

### 1. MCP Ecosystem (Critical)

**Only TypeScript has official MCP SDK support:**
```typescript
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

// Cline's 59KB McpHub patterns available as reference
// Official Anthropic MCP examples in TypeScript
```

**Alternative Rust SDK**: rmcp 0.15.0 (less mature)

### 2. Proven Patterns Available

| Feature | Source | Lines | Language |
|---------|--------|-------|----------|
| buildTool() factory | Claude Code | 793 | TypeScript |
| McpHub 59KB | Cline | 1500 | TypeScript |
| Tool Registry | OpenCode | 500 | TypeScript |
| Ink TUI | Claude Code, Cline | 2000+ | TypeScript |

### 3. Bun Runtime Advantages

```
Startup:     3x faster than Node.js
Binary:     Can bundle to single .bin
API:        Built-in fetch, WebSocket
Compat:     npm packages work
```

### 4. Developer Availability

- Most AI tooling developers know TypeScript
- Claude Code, Cline, OpenCode = TypeScript
- Easier to find contributors

---

## Stack Components

### TUI: Ink (React for CLI)

```typescript
import { render, Text, Box } from "ink";
import React from "react";

const App = () => (
  <Box flexDirection="column">
    <Text bold>Beast CLI</Text>
    <Text dimColor>Type /help for commands</Text>
  </Box>
);

render(<App />);
```

**Why Ink?**
- Used by Claude Code and Cline
- React component model familiar
- Flicker prevention patterns documented
- Virtual scrolling available

### MCP: Official SDK + Cline Patterns

```typescript
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

// Reference: /home/sridhar/cline/src/services/mcp/McpHub.ts (59KB)
```

### Tool System: Claude Code's buildTool()

```typescript
// Reference: /home/sridhar/claude-code-sourcemap/restored-src/src/tools/Tool.ts
interface Tool<Input, Output> {
  name: string;
  inputSchema: z.ZodType;
  call(args, context): Promise<ToolResult<Output>>;
  description(): string;
  isConcurrencySafe(): boolean;
  isReadOnly(): boolean;
}

function buildTool<D extends ToolDef>(def: D): Tool { ... }
```

### Git: simple-git

```typescript
import simpleGit from "simple-git";

// Reference: Aider's git integration patterns
```

### AI: Vercel AI SDK

```typescript
import { createAzure } from "ai Azure";
import { createAnthropic } from "ai @anthropic";
import { createOpenAI } from "ai openai";

// Supports 30+ providers
```

---

## Why NOT Other Languages?

### Rust
**Pros**: Fastest, Landlock sandbox, smallest binary
**Cons**: High learning curve, less AI tooling, slower to develop

**Best for**: Security-critical subprocess wrappers (Phase 3+)

### Python
**Pros**: Lowest learning curve, litellm (50+ providers)
**Cons**: No MCP SDK, slow startup, no native binary

**Best for**: Scripts, not production CLI

### Go
**Pros**: Excellent concurrency, small binaries
**Cons**: No MCP SDK, less AI ecosystem

**Best for**: Microservices, not CLI

### Zig
**Pros**: Smallest binaries, no hidden allocations
**Cons**: Too early, no ecosystem, no MCP

**Best for**: Future consideration (5+ years)

---

## Implementation Order

### Phase 1: TypeScript Core
```
1. Initialize Bun project
   $ bun init beast-cli
   
2. Set up Ink TUI
   $ bun add ink react
   
3. Add MCP SDK
   $ bun add @modelcontextprotocol/sdk
   
4. Port buildTool() pattern
   Reference: Claude Code Tool.ts
   
5. Add Git integration
   $ bun add simple-git
```

### Phase 2: Add AI Providers
```
1. Add Vercel AI SDK
   $ bun add ai
   
2. Port provider factory
   Reference: Cline providers.ts
   
3. Add Claude Code patterns
```

### Phase 3: Rust Sandbox (Future)
```
1. Create rust-toolbox crate
2. Implement Landlock sandbox
3. Wrap with Bun FFI
```

---

## File Structure (TypeScript)

```
beast-cli/
├── src/
│   ├── cli/
│   │   ├── main.ts          # Entry point
│   │   ├── commands.ts      # Slash commands
│   │   └── config.ts       # Config loading
│   ├── tui/
│   │   ├── App.tsx         # Main UI
│   │   ├── Chat.tsx        # Chat view
│   │   ├── StatusBar.tsx   # Status bar
│   │   └── Markdown.tsx    # Markdown render
│   ├── tools/
│   │   ├── Tool.ts         # Tool interface
│   │   ├── registry.ts     # Tool registry
│   │   ├── BashTool.ts     # Bash execution
│   │   ├── FileTool.ts     # File operations
│   │   └── ...
│   ├── mcp/
│   │   ├── hub.ts          # MCP hub
│   │   ├── transport.ts     # Transport types
│   │   └── oauth.ts        # OAuth
│   ├── providers/
│   │   ├── factory.ts       # Provider factory
│   │   ├── anthropic.ts    # Anthropic
│   │   ├── openai.ts       # OpenAI
│   │   └── ...
│   ├── git/
│   │   └── repo.ts         # Git operations
│   ├── memory/
│   │   └── memdir.ts       # Memory system
│   └── engine/
│       ├── loop.ts         # Agent loop
│       └── compact.ts      # Compaction
├── package.json
├── tsconfig.json
└── bun.lockb
```

---

## Dependencies

```json
{
  "dependencies": {
    "bun": "^1.1.0",
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "zod": "^3.22.0",
    "simple-git": "^3.22.0",
    "ai": "^2.2.0",
    "cac": "^6.7.0",
    "undici": "^6.0.0",
    "marked": "^12.0.0"
  }
}
```

---

## Summary

| Aspect | Choice | Reason |
|--------|--------|--------|
| **Language** | TypeScript | MCP ecosystem, proven patterns |
| **Runtime** | Bun | Fast startup, small binary |
| **TUI** | Ink | React patterns, battle-tested |
| **MCP** | Official SDK | Only option available |
| **Git** | simple-git | TypeScript native |
| **AI** | Vercel AI SDK | Multiple providers |
| **Type Safety** | Zod | Claude Code pattern |

**Total Dependencies**: ~10 core packages
**Estimated Setup Time**: 1-2 weeks
**MVP Features**: 4-6 weeks

---

## Next Steps

1. Create repository with Bun + TypeScript
2. Set up Ink TUI shell
3. Port Claude Code's buildTool() pattern
4. Add MCP integration
5. Test with Claude/Anthropic API

---

**Recommendation**: Start with TypeScript/Bun for fastest path to MVP, add Rust sandbox in Phase 3 if needed.
