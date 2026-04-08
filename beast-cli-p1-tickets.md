# Beast CLI - Phase 1: Foundation Tickets

**Phase**: P1
**Focus**: Core infrastructure - Tool System, TUI, Core Engine, Mode System
**Tickets**: 6 (P1-01 through P1-06)
**Timeline**: Week 1-2

---

## P1-01: Tool System Foundation

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Implement the core tool system using Claude Code's `buildTool()` factory pattern with Zod schemas, permission defaults, and render pipeline.

### Files to Create
```
src/
├── tools/
│   ├── Tool.ts              # Tool interface (793 lines reference)
│   ├── tools.ts             # Registry + assembleToolPool
│   ├── BashTool/
│   │   └── BashTool.ts     # Shell execution
│   ├── FileReadTool/
│   │   └── FileReadTool.ts # File reading with limits
│   ├── FileEditTool/
│   │   └── FileEditTool.ts # Patch-based editing
│   ├── GlobTool/
│   │   └── GlobTool.ts     # Pattern matching
│   └── GrepTool/
│       └── GrepTool.ts     # Content search
```

### Key Implementations
1. `buildTool()` factory with fail-closed defaults
2. Zod schemas for input validation
3. `isConcurrencySafe()` for parallel execution
4. `isReadOnly()` / `isDestructive()` for safety
5. `maxResultSizeChars` for large result storage
6. Permission model: `alwaysAllow`, `alwaysDeny`, `alwaysAsk` rules

### How to Test
- Run each tool with valid/invalid inputs
- Test parallel execution with `isConcurrencySafe` tools
- Verify large results persisted to disk
- Test permission rules block/allow correctly

### Acceptance Criteria
- [ ] All 6 core tools implement Tool interface
- [ ] `buildTool()` factory works with partial definitions
- [ ] Permission rules correctly filter tool access
- [ ] Large tool results (>10KB) stored to disk with preview
- [ ] Concurrent tool execution works for safe tools
- [ ] Unit tests for each tool pass

### Reference
- Source: `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/Tool.ts` (793 lines)
- Pattern: Factory with defaults, Zod schemas, render pipeline

---

## P1-02: TUI Framework

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Build the CLI UI using Ink (React) for best markdown rendering, desktop notifications, and job control.

### Files to Create
```
src/
├── tui/
│   ├── App.tsx             # Main App
│   ├── Chat.tsx             # Chat widget
│   ├── StatusBar.tsx        # Status bar
│   ├── Markdown.tsx         # Markdown rendering
│   ├── Diff.tsx             # Diff display
│   ├── Notifications.tsx     # Desktop notifications
│   └── KeyHints.tsx         # Keyboard hints
```

### Key Implementations
1. Ink-based TUI with interactive components
2. Markdown rendering with syntax highlighting (using `marked`)
3. Desktop notifications via terminal bell
4. Job control (Ctrl+Z suspend/resume)
5. Theme/color system
6. File link handling

### How to Test
- Render markdown with code blocks, links, tables
- Display diffs with syntax highlighting
- Send desktop notifications
- Test job control (Ctrl+Z to suspend, fg to resume)
- Verify theme switching works

### Acceptance Criteria
- [ ] Markdown renders with proper formatting
- [ ] Code blocks have syntax highlighting
- [ ] File links display actual paths
- [ ] Desktop notifications work
- [ ] Ctrl+Z suspends app, fg resumes
- [ ] Theme switching changes colors

### Reference
- Source: `/home/sridhar/cline/cli/src/components/` (Ink components)
- Pattern: Ink + React for CLI rendering

---

## P1-03: Core Engine

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Implement the main agent loop with turn management, streaming, and Effect-based architecture.

### Files to Create
```
src/
├── engine/
│   ├── index.ts            # Main engine entry
│   ├── loop.ts             # Agent loop
│   ├── turn.ts             # Turn management
│   ├── streaming.ts        # Response streaming
│   └── token.ts            # Token counting
├── effect/
│   ├── index.ts            # Effect module
│   ├── service.ts          # Service layer DI
│   └── context.ts          # Effect context
```

### Key Implementations
1. Turn loop: user input → model call → tool execution → response
2. Streaming with incremental rendering
3. Token counting with sampling for large files
4. Effect-based async (no blocking)
5. Cancellation via AbortController
6. Service dependency injection via Effect patterns

### How to Test
- Run multi-turn conversation
- Test streaming output displays correctly
- Verify token counting accurate
- Test cancellation mid-operation

### Acceptance Criteria
- [ ] Agent loop processes turns correctly
- [ ] Streaming displays incrementally
- [ ] Token counting accurate within 5%
- [ ] Cancellation works mid-operation
- [ ] Effect-based DI functional

### Reference
- Source: `/home/sridhar/opencode/packages/opencode/src/effect/`
- Pattern: Effect<E, A, R> type with Service layers

---

## P1-04: Mode System (Plan/Execution)

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement mode switching with Plan mode (read-only) and Execution mode (full access). 6 permission modes.

### Files to Create
```
src/
├── modes/
│   ├── index.ts            # Mode registry
│   ├── plan.ts             # Plan mode
│   ├── execution.ts        # Execution mode
│   ├── permissions.ts      # 6 permission modes
│   └── commands.ts         # /plan, /auto commands
```

### Permission Modes
| Mode | Description |
|------|-------------|
| `plan` | Read-only, explore and plan only |
| `default` | Interactive permission prompts |
| `acceptEdits` | Auto-accept safe file edits |
| `auto` | AI classifies and auto-approves |
| `bypass` | No prompts, all allowed |
| `dontAsk` | Auto-deny, no prompts |

### Key Implementations
1. 6 permission modes with tool filtering
2. `/plan` command to enter plan mode
3. `Shift+Tab` to cycle modes
4. Mode indicator in status bar
5. Bash command permissions per mode
6. Configuration via settings.json

### How to Test
- Start with `--permission-mode plan` - verify read-only
- Switch to `/auto` mode - verify AI auto-approves
- Cycle modes with Shift+Tab
- Verify write/edit tools blocked in plan mode
- Test mode indicator shows correctly

### Acceptance Criteria
- [ ] Plan mode is truly read-only
- [ ] All 6 permission modes work
- [ ] Mode switching via commands works
- [ ] Mode switching via keyboard works
- [ ] Mode indicator visible in TUI
- [ ] Bash permissions respect mode

### Reference
- Source: `/home/sridhar/claude-code-sourcemap/restored-src/src/types/permissions.ts`
- Cline: `/home/sridhar/cline/cli/src/utils/mode-selection.ts`

---

## P1-05: Configuration System

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement YAML-based configuration with environment variable expansion.

### Files to Create
```
src/
├── config/
│   ├── index.ts            # Config entry
│   ├── yaml.ts             # YAML parser
│   ├── env.ts              # Env expansion
│   └── schema.ts           # Config validation
```

### Key Implementations
1. YAML config file (`.beast-cli.yml`)
2. Environment variable expansion (`${VAR}`)
3. Config validation with defaults
4. Per-project and global config
5. Config hot-reload

### How to Test
- Create config file with all options
- Verify env expansion works
- Test per-project overrides global
- Verify invalid config shows errors

### Acceptance Criteria
- [ ] YAML config loads correctly
- [ ] Env vars expand in config
- [ ] Defaults applied when missing
- [ ] Validation errors shown

### Reference
- Aider: `.aider.conf.yml` in `/home/sridhar/aider/aider/`
- Cline: `/home/sridhar/cline/cli/src/components/SettingsPanelContent.tsx`

---

## P1-06: State Persistence

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement SQLite-backed state persistence for sessions, history, and cache.

### Files to Create
```
src/
├── state/
│   ├── index.ts            # State entry
│   ├── db.ts               # SQLite connection (sql.js)
│   ├── session.ts          # Session storage
│   ├── history.ts          # Chat history
│   └── cache.ts            # Cache management
```

### Key Implementations
1. sql.js (SQLite in WASM) for persistent storage
2. Session persistence across restarts
3. Chat history with search
4. Cache with TTL
5. JSON serialization for complex types

### How to Test
- Start session, verify state saved
- Restart, verify session restored
- Search chat history
- Verify cache expires

### Acceptance Criteria
- [ ] Session state persists
- [ ] History searchable
- [ ] Cache respects TTL
- [ ] Migrations work

### Reference
- Source: `/home/sridhar/opencode/packages/opencode/src/session/index.ts`
- Codex-RS: `/home/sridhar/codex/codex-rs/state/src/`

---

## Phase 1 Checklist

- [ ] P1-01: Tool System Foundation
- [ ] P1-02: TUI Framework
- [ ] P1-03: Core Engine
- [ ] P1-04: Mode System
- [ ] P1-05: Configuration System
- [ ] P1-06: State Persistence

**Phase 1 Complete When**: All 6 tickets checked above
