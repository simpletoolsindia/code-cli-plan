# Beast CLI - Full Feature Comparison Matrix

**Purpose**: 85+ features compared across 5 repositories

---

## TUI/UI Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| TUI Framework | React Ink | Ratatui | Rich | Ink | React | Ratatui |
| Markdown | React | pulldown-cmark | Rich | marked | N/A | pulldown-cmark |
| Virtual Scrolling | YES | N/A | NO | NO | NO | YES |
| Notifications | YES | YES | NO | NO | NO | YES |
| Job Control | NO | YES | YES | NO | NO | YES |
| Session Picker | YES | YES | NO | YES | YES | YES |
| Voice I/O | YES | YES (macOS) | NO | NO | NO | YES |
| Clipboard | YES | YES | YES | YES | YES | YES |
| Theme Picker | Terminal | YES | NO | Mode | NO | YES |
| Status Bar | YES | YES | NO | YES | YES | YES |

---

## Mode/State Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Modes | 6 | NO | 4 | Plan/Act | Plan/Build | 6 |
| Mode Switching | /plan, Shift+Tab | N/A | /ask, /code | UI | Tab | Commands |
| Model Per Mode | NO | NO | YES | YES | YES | YES |
| Deep Planning | /ultraplan | NO | /architect | /deep-planning | NO | YES |

---

## Tool System Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Tool Count | 42+ | 30+ | N/A | 25+ | 39 | 40+ |
| Tool Schema | Zod | JSON | None | None | Zod | Zod |
| Factory Pattern | buildTool() | Handlers | N/A | Factory | Registry | Factory |
| Parallel Exec | YES | YES | NO | YES | NO | YES |
| Batch Tool | NO | NO | NO | NO | YES | YES |

---

## Git Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Auto-Commit | NO | Ghost | YES | Via CC | NO | YES |
| Ghost Commits | NO | YES | NO | NO | NO | YES |
| Attribution | Text | None | 6-flag | Via CC | None | 6-flag |
| Co-authored-by | NO | NO | YES | Via CC | NO | YES |
| Subtree Only | NO | NO | YES | NO | NO | Aider |
| Pre-commit Hooks | Never bypass | YES | --verify | YES | YES | YES |

---

## Code Intelligence

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| LSP | YES | NO | NO | Via MCP | YES (28+) | YES |
| Repo Map | NO | NO | PageRank | NO | NO | PageRank |
| Tree-sitter | Bash AST | NO | YES | Via LSP | Via LSP | YES |
| Auto-lint | NO | NO | YES | NO | NO | YES |
| AI Comments | NO | NO | `// ai!` | NO | NO | YES |

---

## MCP Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| MCP Support | Full | Full | NONE | Full (59KB) | Plugins | Full |
| OAuth | YES | YES | N/A | YES | YES | YES |
| Auto-Reconnect | YES | YES | N/A | YES | YES | YES |
| Remote Config | NO | NO | N/A | Enterprise | NO | Cline |

---

## Memory Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Taxonomy | 4 types | YES | NO | YES | YES | 4 types |
| MEMORY.md | YES | NO | NO | NO | NO | YES |
| Staleness | YES | NO | NO | NO | NO | YES |
| Team Sync | YES | NO | NO | NO | NO | Claude Code |

---

## Compaction Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Compaction | YES | Local+Remote | NO | Local | YES | YES |
| Token Budget | 50K | Local+Remote | NO | Local | 40K | 50K |
| Image Stripping | YES | NO | NO | NO | NO | YES |
| Micro Compact | YES | NO | NO | NO | NO | Claude Code |

---

## Security Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Sandbox | NO | YES | NO | NO | NO | YES |
| Landlock | NO | YES | NO | NO | NO | YES |
| Seatbelt | NO | YES | NO | NO | NO | YES |
| Pattern Match | YES | YES | NO | YES | NO | YES |

---

## Hook Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Pre-Tool | YES | YES | NO | YES | YES | YES |
| Post-Tool | YES | YES | NO | YES | YES | YES |
| Pre-Compact | YES | NO | NO | NO | YES | YES |
| Read/Edit | YES | NO | NO | NO | NO | Claude Code |
| Think | YES | NO | NO | NO | NO | Claude Code |

---

## Provider Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| Providers | 1 | 10+ | 50+ | 40+ | 25+ | 40+ |
| Model Aliases | YES | YES | YES | YES | YES | YES |
| Thinking Tokens | YES | YES | YES | YES | YES | YES |
| Cost Tracking | YES | YES | YES | YES | YES | YES |

---

## Unique Killer Features

| Feature | Repo | Implement? |
|---------|------|------------|
| Ghost Commits | Codex-RS | YES |
| RepoMap PageRank | Aider | YES |
| Architect Mode | Aider | YES |
| AI Comments `// ai!` | Aider | YES |
| LazyLiteLLM 1.5s | Aider | YES |
| McpHub 59KB | Cline | YES |
| Landlock Sandbox | Codex-RS | YES |
| 28+ LSP Servers | OpenCode | YES |
| Memory Taxonomy | Claude Code | YES |
| 6-flag Attribution | Aider | YES |

---

## Summary Statistics

| Category | Claude | Codex | Aider | Cline | Open |
|----------|--------|-------|-------|-------|------|
| Tools | 42+ | 30+ | N/A | 25+ | 39 |
| Commands | 90+ | 15+ | 50+ | 7+ | 20+ |
| Providers | 1 | 10+ | 50+ | 40+ | 25+ |
| Hooks | 10 | 5 | 0 | YES | 20+ |
| Edit Formats | N/A | N/A | 12 | N/A | N/A |
| Modes | 6 | 0 | 4 | 2 | 2 |

---

**End of Feature Matrix**
