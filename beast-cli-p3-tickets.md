# Beast CLI - Phase 3: Ecosystem Tickets

**Phase**: P3
**Focus**: MCP Integration, Multi-Provider, Prompts, Ghost Commits, LazyLiteLLM, Voice, Web, Auto-Lint
**Tickets**: 8 (P3-01 through P3-08)
**Timeline**: Week 5-6

---

## P3-01: MCP Integration

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Implement Cline's McpHub (59KB) with multi-transport support, OAuth, and tool discovery.

### Files to Create
```
src/
├── mcp/
│   ├── index.ts            # MCP entry
│   ├── hub.ts              # McpHub
│   ├── client.ts           # MCP client
│   ├── oauth.ts            # OAuth 2.0 + PKCE
│   ├── transport/
│   │   ├── index.ts        # Transport interface
│   │   ├── stdio.ts        # Stdio transport
│   │   ├── sse.ts          # SSE transport
│   │   └── http.ts         # StreamableHTTP
│   ├── tools.ts            # Tool conversion
│   └── config.ts           # Config schema
```

### Key Implementations
1. **Multi-transport**: stdio, SSE, StreamableHTTP
2. **OAuth 2.0 + PKCE**: Full implementation with CSRF protection
3. **Tool discovery**: List tools from all servers
4. **Short unique keys**: 6-char hash for tool names
5. **Auto-reconnect**: Exponential backoff (6 attempts, 2s base)
6. **Env var expansion**: `${env:VAR}` in URLs/headers

### How to Test
- Connect to local MCP servers via stdio
- Connect to remote MCP servers via HTTP
- Test OAuth authentication flow
- Verify tools discovered correctly
- Test tool execution via MCP

### Acceptance Criteria
- [ ] Stdio transport connects successfully
- [ ] HTTP transport connects successfully
- [ ] OAuth flow completes
- [ ] Tools discovered and converted
- [ ] Tool execution via MCP works
- [ ] Auto-reconnect works

### Reference
- Source: `/home/sridhar/cline/src/services/mcp/McpHub.ts` (59KB)
- OAuth: `/home/sridhar/cline/src/services/mcp/McpOAuthManager.ts`

---

## P3-02: Multi-Provider Support

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Implement multi-provider support using Cline's factory pattern with 40+ providers.

### Files to Create
```
src/
├── providers/
│   ├── index.ts            # Provider factory
│   ├── anthropic.ts        # Anthropic handler
│   ├── openai.ts           # OpenAI handler
│   ├── ollama.ts           # Ollama handler
│   ├── openrouter.ts       # OpenRouter handler
│   ├── gemini.ts           # Gemini handler
│   └── bedrock.ts          # AWS Bedrock handler
```

### Supported Providers (40+)
Anthropic, OpenAI, OpenRouter, Gemini, Groq, Ollama, AWS Bedrock, Azure, DeepSeek, Mistral, and more.

### Key Implementations
1. Factory pattern for handler creation
2. Unified interface for all providers
3. Model family detection for prompt variants
4. API format detection (native vs XML tool calls)
5. Token tracking per request
6. Cost calculation

### How to Test
- Test Anthropic API with Claude models
- Test OpenAI API with GPT models
- Test Ollama with local models
- Test OpenRouter with mixed models
- Verify token tracking accurate

### Acceptance Criteria
- [ ] Anthropic handler works with Claude
- [ ] OpenAI handler works with GPT
- [ ] Ollama handler works with local
- [ ] Factory creates correct handler
- [ ] Token tracking accurate within 5%

### Reference
- Source: `/home/sridhar/cline/cli/src/utils/providers.ts`

---

## P3-03: System Prompt Variants

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement model-specific prompt variants using Cline's Builder pattern.

### Files to Create
```
src/
├── prompt/
│   ├── index.ts            # Prompt entry
│   ├── registry.ts          # Prompt registry
│   ├── builder.ts          # Prompt builder
│   ├── components.ts       # Reusable sections
│   └── variants/
│       ├── generic.ts      # Generic model
│       ├── next_gen.ts     # Claude 4, GPT-5
│       └── xs.ts           # Small context
```

### Key Implementations
1. Builder pattern for variant configuration
2. Component override system
3. Tool list per variant
4. Rules/tips per variant
5. Model family detection

### How to Test
- Generate prompts for different model families
- Verify variant-specific tools
- Test component overrides
- Verify rules differ per variant

### Acceptance Criteria
- [ ] Generic variant generates correctly
- [ ] Next-gen variant includes advanced tools
- [ ] XS variant condenses prompt
- [ ] Component overrides work
- [ ] Tool list matches variant

### Reference
- Cline: `/home/sridhar/cline/src/core/prompts/`

---

## P3-04: Ghost Commits

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement Codex-RS's ghost commit system for snapshots without history pollution.

### Files to Create
```
src/
├── git/
│   └── ghost.ts            # Ghost commit impl
```

### Key Implementations
1. Use `git commit-tree` for detached commits
2. Preserve untracked and ignored files
3. Filter large files (>10MB) and directories (>200 files)
4. Custom messages and subdirectory scoping
5. Ignore default directories (node_modules, .venv, dist)

### How to Test
- Create ghost commit
- Verify not in normal git log
- Restore from ghost commit
- Verify large files filtered

### Acceptance Criteria
- [ ] Ghost commits created
- [ ] Not visible in normal git log
- [ ] Large files filtered
- [ ] Restore works

### Reference
- Source: `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs`

---

## P3-05: LazyLiteLLM Pattern

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement Aider's LazyLiteLLM pattern for 1.5s startup time savings.

### Files to Create
```
src/
├── llm/
│   └── lazy.ts             # Lazy LLM loader
```

### Key Implementations
1. Deferred import of LLM libraries
2. Suppress debug info on load
3. Lazy initialization of API clients
4. On-demand model loading

### How to Test
- Measure startup time
- Verify ~1.5s improvement
- Test API calls work after lazy load

### Acceptance Criteria
- [ ] Startup time improved
- [ ] Lazy import works
- [ ] API calls functional

### Reference
- Source: `/home/sridhar/aider/aider/llm.py` (LazyLiteLLM class)

---

## P3-06: Voice Input

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement voice input using system audio capture.

### Files to Create
```
src/
├── voice/
│   ├── index.ts            # Voice entry
│   ├── input.ts            # Audio capture
│   ├── stt.ts             # Speech-to-text
│   └── config.ts           # Config
```

### Key Implementations
1. Audio device enumeration
2. Record and transcribe voice commands
3. Language configuration
4. Audio format support (wav, mp3, webm)

### How to Test
- List audio input devices
- Record and transcribe voice
- Test language setting
- Verify command execution

### Acceptance Criteria
- [ ] Audio devices listed
- [ ] Voice transcribed
- [ ] Commands executed
- [ ] Language configurable

### Reference
- Claude Code: `/home/sridhar/claude-code-sourcemap/restored-src/src/services/voice.ts`
- Aider: `/home/sridhar/aider/aider/commands.py` (/voice)

---

## P3-07: Web Scraping

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement URL fetching and conversion to markdown.

### Files to Create
```
src/
├── web/
│   ├── index.ts            # Web entry
│   ├── fetch.ts            # Web fetcher
│   └── markdown.ts          # HTML to markdown
```

### Key Implementations
1. Fetch and parse URLs
2. Convert HTML to markdown
3. Extract main content
4. Support for code blocks

### How to Test
- Fetch URL, verify markdown
- Test code blocks preserved
- Verify main content extracted

### Acceptance Criteria
- [ ] URLs fetched
- [ ] Markdown converted
- [ ] Code blocks preserved

### Reference
- Aider: `/home/sridhar/aider/aider/commands.py` (/web)

---

## P3-08: Auto-Lint Integration

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement auto-lint after code changes (Aider's --auto-lint).

### Files to Create
```
src/
├── lint/
│   ├── index.ts            # Lint entry
│   ├── runner.ts           # Lint runner
│   ├── flake8.ts           # Flake8 integration
│   └── config.ts          # Config
```

### Key Implementations
1. Configurable lint commands
2. Flake8 fatal error detection (E9, F821, F823)
3. Python syntax validation
4. Error context display
5. Auto-fix suggestions

### How to Test
- Configure lint command
- Make code change, verify lint runs
- Test fatal error detection
- Verify fix suggestions

### Acceptance Criteria
- [ ] Lint runs after changes
- [ ] Fatal errors detected
- [ ] Fix suggestions shown

### Reference
- Source: `/home/sridhar/aider/aider/linter.py`

---

## Phase 3 Checklist

- [ ] P3-01: MCP Integration
- [ ] P3-02: Multi-Provider Support
- [ ] P3-03: System Prompt Variants
- [ ] P3-04: Ghost Commits
- [ ] P3-05: LazyLiteLLM Pattern
- [ ] P3-06: Voice Input
- [ ] P3-07: Web Scraping
- [ ] P3-08: Auto-Lint Integration

**Phase 3 Complete When**: All 8 tickets checked above
