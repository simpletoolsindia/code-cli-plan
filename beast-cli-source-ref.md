# Beast CLI - Complete Source Code Reference

**Purpose**: All source file paths organized by repository

---

## Claude Code Sourcemap
**Path**: `/home/sridhar/claude-code-sourcemap/restored-src/src/`

### Tool System
| File | Lines | Description |
|------|-------|-------------|
| `tools/Tool.ts` | 793 | buildTool() factory, Tool interface |
| `tools/tools.ts` | 390 | Registry, assembleToolPool |

### Commands (90+)
| Directory | Description |
|----------|-------------|
| `commands/plan/` | Plan mode |
| `commands/commit.ts` | Git commit |
| `commands/compact/` | Compaction |
| `commands/hooks/` | Hook management |
| `commands/memory/` | Memory commands |
| `commands/model/` | Model selection |
| `commands/mcp/` | MCP commands |

### Services
| Directory | Description |
|----------|-------------|
| `services/compact/` | 50K token compaction |
| `services/teamMemorySync/` | Team memory sync |
| `services/extractMemories/` | Memory extraction |
| `services/voice.ts` | Voice integration |

### Permissions
| File | Description |
|------|-------------|
| `types/permissions.ts` | 6 permission modes |
| `utils/permissions/dangerousPatterns.ts` | Pattern matching |
| `utils/permissions/bashClassifier.ts` | Bash classification |

### Hooks
| Directory | Description |
|----------|-------------|
| `utils/hooks/` | 10 hook types |

### Coordinator
| Directory | Description |
|----------|-------------|
| `coordinator/` | Agent swarms, coordination |

### Memory
| File | Description |
|------|-------------|
| `memdir/memdir.ts` | Memory taxonomy system |

---

## Codex-RS
**Path**: `/home/sridhar/codex/codex-rs/`

### TUI
| Directory | Description |
|----------|-------------|
| `tui/src/lib.rs` | Ratatui framework |
| `tui/src/notifications/` | Desktop notifications |
| `tui/src/markdown_render.rs` | Markdown rendering |
| `tui/src/streaming/` | Response streaming |

### Git
| File | Description |
|------|-------------|
| `git-utils/src/ghost_commits.rs` | Ghost commits |

### Sandbox
| Directory | Description |
|----------|-------------|
| `linux-sandbox/src/` | Landlock |
| `macos-sandbox/src/` | Seatbelt |
| `execpolicy/src/` | Policy engine |

### Core
| Directory | Description |
|----------|-------------|
| `core/src/unified_exec/` | Job control, PTY |
| `core/src/realtime_conversation.rs` | Voice I/O |

### State
| Directory | Description |
|----------|-------------|
| `state/src/` | SQLite persistence |

### Tools
| File | Description |
|------|-------------|
| `tools/src/lib.rs` | 30+ tools |

---

## Aider
**Path**: `/home/sridhar/aider/aider/`

### Core
| File | Lines | Description |
|------|-------|-------------|
| `repo.py` | 600+ | Git integration, 6-flag attribution |
| `repomap.py` | 400+ | PageRank file ranking |
| `llm.py` | 300+ | LazyLiteLLM pattern |
| `linter.py` | 200+ | Auto-lint |
| `diffs.py` | 200+ | Diff display |

### Coders
| File | Description |
|------|-------------|
| `coders/architect_coder.py` | Architect mode |
| `coders/ask_coder.py` | Ask mode, tree-sitter |
| `coders/wholefile_coder.py` | Whole file edits |

### Commands
| File | Description |
|------|-------------|
| `commands.py` | 50+ slash commands, /web |

### Args
| File | Lines | Description |
|------|-------|-------------|
| `args.py` | 1000+ | 100+ CLI arguments |

---

## Cline
**Path**: `/home/sridhar/cline/`

### MCP
| File | Lines | Description |
|------|-------|-------------|
| `src/services/mcp/McpHub.ts` | 1500+ | 59KB MCP hub |
| `src/services/mcp/McpOAuthManager.ts` | 500+ | OAuth 2.0 + PKCE |

### CLI
| Directory | Description |
|----------|-------------|
| `cli/src/components/` | 40+ React Ink components |
| `cli/src/utils/` | Utilities, slash commands |

### Prompts
| Directory | Description |
|----------|-------------|
| `src/core/prompts/` | System prompt variants |

---

## OpenCode
**Path**: `/home/sridhar/opencode/packages/opencode/src/`

### Tools
| File | Description |
|------|-------------|
| `tool/registry.ts` | Tool registry (39 tools) |
| `tool/batch.ts` | Batch execution |
| `tool/plan.ts` | Plan mode |

### Effects
| Directory | Files | Description |
|----------|-------|-------------|
| `effect/` | 20 | Effect-based DI |

### LSP
| File | Lines | Description |
|------|-------|-------------|
| `lsp/server.ts` | 500+ | 28+ LSP servers |

### Session
| File | Description |
|------|-------------|
| `session/index.ts` | Compaction (40K) |

### Providers
| File | Description |
|------|-------------|
| `provider/provider.ts` | 25+ providers |

### MCP
| File | Description |
|------|-------------|
| `mcp/index.ts` | MCP plugin system |

---

## Quick Lookup

### Want to implement Ghost Commits?
→ `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs`

### Want to implement PageRank?
→ `/home/sridhar/aider/aider/repomap.py`

### Want to implement MCP Hub?
→ `/home/sridhar/cline/src/services/mcp/McpHub.ts`

### Want to implement buildTool?
→ `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/Tool.ts`

### Want to implement Landlock?
→ `/home/sridhar/codex/codex-rs/linux-sandbox/src/lib.rs`

### Want to implement LazyLiteLLM?
→ `/home/sridhar/aider/aider/llm.py` (LazyLiteLLM class)

### Want to implement 6-flag attribution?
→ `/home/sridhar/aider/aider/repo.py`

### Want to implement 28+ LSP servers?
→ `/home/sridhar/opencode/packages/opencode/src/lsp/server.ts`

### Want to implement Voice?
→ `/home/sridhar/claude-code-sourcemap/restored-src/src/services/voice.ts`

### Want to implement Memory Taxonomy?
→ `/home/sridhar/claude-code-sourcemap/restored-src/src/memdir/memdir.ts`

### Want to implement Architect Mode?
→ `/home/sridhar/aider/aider/coders/architect_coder.py`

---

**End of Source Reference**
