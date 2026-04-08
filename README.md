# Beast CLI

A next-generation AI coding CLI built by analyzing the best features from Claude Code, Codex-RS, Aider, Cline, and OpenCode.

## Status: Phase 1 Complete ✅

All Phase 1 tickets (P1-01 through P1-06) have been **implemented and tested**.

---

## Quick Start

```bash
# Navigate to project
cd /home/sridhar/code-cli-plan

# Run tests
~/.bun/bin/bun test-p1.ts

# Run individual tests
~/.bun/bin/bun test-tools.ts    # P1-01: Tool System
~/.bun/bin/bun test-tui.ts      # P1-02: TUI Framework
```

---

## Project Structure

```
beast-cli/
├── src/
│   ├── tools/           # P1-01: Tool system (BashTool, FileReadTool, etc.)
│   ├── tui/            # P1-02: Ink-based UI components
│   ├── engine/         # P1-03: Agent loop, token counting, compaction
│   ├── modes/          # P1-04: Permission modes (plan, default, etc.)
│   ├── config/         # P1-05: Configuration system
│   └── state/          # P1-06: SQLite-backed persistence
├── test-tools.ts       # Tool system tests
├── test-tui.ts         # TUI tests
└── test-p1.ts          # Full Phase 1 integration test
```

---

## Phase 1 Completed ✅

### P1-01: Tool System Foundation ✅
- **5 core tools**: Bash, Read, Edit, Glob, Grep
- **buildTool() factory**: Zod schemas, fail-closed defaults
- **Permission model**: `isReadOnly()`, `isDestructive()`, `isConcurrencySafe()`
- **maxResultSizeChars**: Large result handling
- **Status**: PASS - All tests passing

### P1-02: TUI Framework ✅
- **Ink (React)**: CLI-native React components
- **StatusBar**: Mode indicator, model, tokens, theme
- **Markdown**: Code blocks, syntax highlighting, lists
- **Diff**: Side-by-side comparison with color coding
- **Status**: PASS - All components rendering

### P1-03: Core Engine ✅
- **Agent loop**: Turn management, streaming support
- **Token counting**: 1 token ≈ 4 chars approximation
- **Compaction detection**: 50K token budget trigger
- **Tool call tracking**: Per-turn tool execution history
- **Status**: PASS - All engine functions working

### P1-04: Mode System ✅
- **6 permission modes**: plan, default, acceptEdits, auto, bypass, dontAsk
- **canUseTool()**: Mode-based tool filtering
- **Mode cycling**: Next/previous mode functions
- **Display info**: Colors, symbols, short names
- **Status**: PASS - All modes implemented

### P1-05: Configuration System ✅
- **YAML config**: `.beast-cli.yml` support
- **Env expansion**: `${VAR}` syntax
- **Validation**: Type checking, bounds validation
- **Defaults**: Fallback values for all settings
- **Status**: PASS - Config loading and validation working

### P1-06: State Persistence ✅
- **Bun SQLite**: Built-in database support
- **Sessions**: Create, update, list, delete
- **Chat history**: Per-session message storage
- **Cache**: TTL-based caching with expiration
- **Status**: PASS - All persistence operations working

---

## Testing Results

```
P1-01: Tool System Foundation      ✅ PASS
P1-02: TUI Framework               ✅ PASS
P1-03: Core Engine                 ✅ PASS
P1-04: Mode System                 ✅ PASS
P1-05: Configuration System        ✅ PASS
P1-06: State Persistence           ✅ PASS

All Phase 1 components: ✅ PASS
```

---

## Tech Stack

| Component | Choice |
|-----------|--------|
| Language | TypeScript 5.x |
| Runtime | Bun |
| TUI | Ink (React) |
| MCP | @modelcontextprotocol/sdk |
| Git | simple-git |
| AI | Vercel AI SDK |
| Validation | Zod |
| CLI Parser | cac |

---

## Remaining Phases

| Phase | Focus | Status |
|-------|-------|--------|
| P2 | Intelligence (Git, RepoMap, Compaction, LSP, etc.) | TODO |
| P3 | Ecosystem (MCP, Multi-Provider, Ghost Commits) | TODO |
| P4 | Polish (Memory, Sandbox, Batch Tools) | TODO |
| Future | Multi-Agent, Desktop App | TODO |

---

## References

Research based on analysis of:
- **Claude Code**: Tool factory, compaction, memory taxonomy
- **Codex-RS**: Ghost commits, sandbox, Ratatui TUI
- **Aider**: 6-flag attribution, RepoMap PageRank, Architect mode
- **Cline**: MCP Hub (59KB), multi-transport, 40+ providers
- **OpenCode**: Effect-based DI, 28+ LSP servers

All source file paths and implementation details in `beast-cli-*-tickets.md` and `beast-cli-*-reference.md`.

---

## License

MIT