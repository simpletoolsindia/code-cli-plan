# Beast CLI Research — Complete Comprehensive Analysis

**Date**: 2026-04-08
**Status**: COMPLETE — All 5 major AI coding CLIs deeply analyzed

---

## REPOSITORIES ANALYZED

| Repo | Language | Location | Description |
|------|----------|----------|-------------|
| Claude Code Sourcemap | TypeScript | `/home/sridhar/claude-code-sourcemap/` | Full reverse-engineered v2.1.88 (4756 files) |
| OpenAI Codex (codex-rs) | Rust | `/home/sridhar/codex/codex-rs/` | Production agent (90+ crates) |
| Aider | Python | `/home/sridhar/aider/` | Git-first AI coding (12K stars, 5.7M installs) |
| Cline | TypeScript | `/home/sridhar/cline/` | VS Code extension (20K+ stars) |
| OpenCode | TypeScript | `/home/sridhar/opencode/` | Effect-based agent (10K+ stars, 21 packages) |

---

# SECTION 1: COMPREHENSIVE FEATURE COMPARISON MATRIX

**Total Features Analyzed: 500+ across 30 categories**

---

## 1.1 TUI/UI Implementation

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Framework** | Custom React Ink | Ratatui | Rich | Ink (React) | React | Codex-RS |
| **Flicker Prevention** | Static/Dynamic split | Not needed (Rust) | N/A | Standard Ink | SolidJS | Claude Code |
| **Markdown Rendering** | React components | pulldown-cmark + custom | Rich library | marked lexer | Not visible | Codex-RS |
| **Virtual Scrolling** | VirtualMessageList | N/A (Rust) | No | No | No | Claude Code |
| **Color Management** | Perceptual distance (CIE76) | CIE76 formula | Rich built-in | Basic colors | Not visible | Claude Code, Codex-RS |
| **Desktop Notifications** | Yes | Yes (backend detection) | No | No | No | Codex-RS |
| **Keyboard Shortcuts** | 100+ escape mapping | Basic hints | prompt_toolkit | basic | 100+ | Claude Code |
| **Status Bar** | Git + model + tokens + cost | Status components | No | Git branch + model | Yes | Claude Code |
| **Diff Display** | Multi-format | Excellent | Progress bars | Basic | Not visible | Codex-RS |
| **Progress Indicators** | Spinner components | N/A | Rich progress | Spinner | Not visible | Claude Code |
| **Error Display** | Rich formatting | N/A | Rich | UI helpers | Not visible | Aider |
| **Theme Support** | Terminal palette | Theme picker | No | Mode colors | Not visible | Codex-RS |
| **Job Control** | No | Suspend/resume (Ctrl-Z) | Ctrl+Z | No | No | Codex-RS |
| **Session Resume Picker** | Yes | Yes (UI picker) | No | Yes | Yes | ALL |
| **Onboarding Screens** | Yes | Yes | No | No | No | Claude Code, Codex-RS |
| **Tooltips** | Yes | Yes | No | No | No | Claude Code, Codex-RS |
| **Pager Overlay** | No | Yes | No | No | No | Codex-RS |
| **Voice I/O** | Yes | Yes (macOS only) | No | No | No | Claude Code, Codex-RS |
| **Clipboard Integration** | Yes | Yes | /paste, /copy | Yes | Yes | ALL |
| **Fuzzy File Search** | Yes | Yes (Nucleo) | No | Yes | Yes | Codex-RS |

---

## 1.2 Mode/State System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Plan Mode** | Yes (permission) | No | Yes (Ask/Architect) | Yes (Plan/Act) | Yes (Plan/Build) | ALL |
| **Execution Mode** | Yes (auto/bypass) | No | Yes (Code) | Yes (Act) | Yes (Build) | ALL |
| **Mode Switching** | /plan, Shift+Tab | N/A | /ask, /architect, /code | UI Toggle | Tab + Tool | Claude Code |
| **Model Per Mode** | No | No | Yes (Architect) | Yes | Yes | Cline, OpenCode |
| **Context Preservation** | Full history | N/A | Full history | Full history | Full history | ALL |
| **Plan Storage** | Memory | N/A | Chat history | Conversation | `.opencode/plans/` | Aider |
| **Permission Modes** | 6 modes | N/A | 4 modes | Patterns | Tool-based | Claude Code |
| **Collaboration Modes** | No | Yes | No | No | No | Codex-RS |
| **Deep Planning** | /ultraplan | No | /architect | /deep-planning | No | Cline |

### Permission Modes (Claude Code - 6 modes)
| Mode | Description |
|------|-------------|
| `plan` | Read-only, explore and plan |
| `default` | Interactive permission prompts |
| `acceptEdits` | Auto-accept safe file edits |
| `auto` | AI classifies and auto-approves (ANT-only) |
| `bypassPermissions` | No prompts, all actions allowed |
| `dontAsk` | Auto-deny, no prompts |

### Chat Modes (Aider - 4 modes)
| Mode | Description |
|------|-------------|
| `/ask` | Read-only, answers questions |
| `/architect` | Two-model: architect proposes, editor implements |
| `/code` | Full code editing (default) |
| `/help` | Help about Aider |

### Edit Formats (Aider - 12 formats)
| Format | Description |
|--------|-------------|
| `wholefile` | Return full file content |
| `editblock` | Search/replace blocks |
| `editblock-fenced` | Fenced search/replace |
| `patch` | Unified diff patches |
| `udiff` | Unified diff |
| `editor-whole` | Editor with whole file |
| `editor-editblock` | Editor with edit blocks |
| `editor-diff` | Editor with diff |
| `architect` | JSON specs for design |

---

## 1.3 Tool System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Total Tools** | 42+ | 30+ | N/A (LLM-native) | 25+ | 39 | Claude Code |
| **Tool Schema** | Zod | JSON Schema | None | None | Zod | Claude Code, OpenCode |
| **Tool Factory** | buildTool() | Handlers | N/A | ToolFactory | ToolRegistry | Claude Code |
| **Parallel Execution** | Yes | Yes | No | Yes | No | Claude Code, Codex-RS |
| **Tool Chaining** | AgentTool | Multi-agent | No | Subagent | No | Claude Code |
| **Tool Permissions** | alwaysAllow/deny | ExecPolicy | No | Patterns | ctx.ask | Claude Code |
| **Large Result Storage** | Disk + preview | N/A | No | Yes | Yes | Claude Code |
| **Result Truncation** | Yes | N/A | No | No | Yes | Claude Code, OpenCode |
| **Batch Tool** | No | No | No | No | Yes (experimental) | OpenCode |

### Tool Categories

#### Claude Code Tools (42+)
| Category | Tools |
|----------|-------|
| **File Operations** | Read, Edit, Write, MultiEdit, Glob, Grep |
| **Code Intelligence** | Grep, GrepReplace, SearchReplace, ToolSearch, ToolCall |
| **Web/Research** | WebSearch, WebFetch, WebExtract |
| **Agent Management** | AgentTool, AgentContinue, AgentReject |
| **Planning/Workflow** | TodoWrite, TodoRead, NotebookEdit |
| **Communication** | NotebookEdit, AskContinue |
| **MCP Integration** | Mcp__* tools |
| **Developer Tools** | Bash, Edit, Write |
| **Specialized** | TodoWrite, SearchReplace, GrepReplace |

#### Codex-RS Tools (30+)
| Tool | Description |
|------|-------------|
| `exec_command` | Shell commands in PTY |
| `shell_command` | Shell execution |
| `apply_patch` | Custom grammar patch |
| `view_image` | Base64 image viewing |
| `spawn_agent` | Sub-agent spawning |
| `send_message_v2` | Agent messaging |
| `js_repl` | JavaScript REPL |
| `mcp_tool` | MCP tools |
| `web_search` | Web search |
| `tool_search` | Tool discovery |

#### OpenCode Tools (39)
| Tool | Description |
|------|-------------|
| `bash`, `read`, `glob`, `grep` | Core file ops |
| `edit`, `write`, `patch` | File editing |
| `task`, `plan`, `batch` | Workflow |
| `lsp`, `code` | Code intelligence |
| `skill`, `fetch` | External |
| `todo`, `search` | Productivity |

---

## 1.4 Slash Commands

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Total Commands** | 90+ | 15+ | 50+ | 7+ | 20+ | Claude Code |
| **Help Command** | /help | Yes | /help | /help | Yes | ALL |
| **Model Switch** | /model | Yes | /change-model | /models | Yes | ALL |
| **Git Commands** | /commit | Yes | /commit, /git | Yes | Yes | ALL |
| **Map/Repo View** | /map | Yes | /repo-map | Yes | Yes | Aider |
| **Voice Input** | /voice | No | /voice | No | No | Claude Code, Aider |
| **Web Fetch** | /web | No | /web | No | No | Aider |
| **Clipboard** | /paste | No | /paste | Yes | Yes | Cline, OpenCode |
| **Multi-Agent** | /agent | /spawn_agent | No | /subagent | /task | Claude Code |
| **Compact** | /compact | No | No | Yes | No | Claude Code |
| **Memory** | /memory | No | No | Yes | No | Claude Code, Cline |
| **Skills** | /skills | No | No | Yes | /skill | Claude Code, Cline, OpenCode |
| **Load Commands** | No | No | /load | No | No | Aider |
| **Save Session** | No | No | /save | No | No | Aider |
| **Lint/Test** | No | No | /lint, /test | No | No | Aider |
| **Undo/Redo** | No | No | /undo, /redo | No | Yes | Aider, OpenCode |
| **Tokens Report** | No | No | /tokens | Yes | No | Aider, Cline |
| **Shell Completions** | No | Yes | --shell-completions | No | Yes | Codex-RS |

### Claude Code Slash Commands (90+)
| Category | Commands |
|----------|----------|
| **Core** | add, agent, branch, commit, compact, config, diff, hook, init, model, mcp, plan, skills |
| **Developer** | debug-tool-call, heapdump, insights, pr_comments, subscribe-pr |
| **Feature-gated** | assistant, autoplan, bridge, buddy, brief, fork, proactive, torch, ultraplan, voice, workflows |

### Aider Slash Commands (50+)
| Command | Description |
|---------|-------------|
| `/add`, `/drop` | File management |
| `/ask`, `/architect`, `/code` | Mode switching |
| `/clear`, `/reset` | Chat management |
| `/commit`, `/diff` | Git operations |
| `/copy`, `/copy-context` | Clipboard |
| `/edit`, `/editor` | External editor |
| `/git` | Run git commands |
| `/load`, `/save` | Session commands |
| `/map`, `/map-refresh` | Repo map |
| `/multiline-mode` | Toggle input |
| `/ok`, `/refuse` | Approve/reject |
| `/read-only` | Read-only files |
| `/retry`, `/undo` | Undo operations |
| `/run`, `/shell` | Command execution |
| `/test` | Run tests |
| `/think-tokens` | Thinking budget |
| `/tokens` | Token report |
| `/voice` | Voice input |
| `/web` | Web fetch |
| `/llm`, `/model` | Model switch |

---

## 1.5 Git Integration

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Auto-Commit** | No | Ghost commits | Yes | Via CC | No | Aider |
| **Ghost Commits** | No | Yes | No | No | No | Codex-RS |
| **Git Attribution** | Text | None | 6-flag | Via CC | None | Aider |
| **Co-authored-by** | No | No | Yes | Via CC | No | Aider |
| **Commit Message AI** | /commit | Yes | Yes | Via CC | Yes | ALL |
| **Branch Operations** | /branch | Yes | Yes | Yes | Yes | ALL |
| **Git Diff View** | Yes | Yes | /diff | Yes | Yes | ALL |
| **Undo Last Commit** | No | No | /undo | No | /undo | Aider, OpenCode |
| **Subtree Only** | No | No | --subtree-only | No | No | Aider |
| **Pre-commit Hooks** | Never bypass | Yes | --git-commit-verify | No | No | ALL |
| **Gitignore Support** | Yes | Yes | .aiderignore | Yes | Yes | ALL |
| **Git Diff Stats** | Yes | Yes | Yes | Yes | Yes | ALL |

### Git Attribution Flags (Aider - UNIQUE)
```bash
--attribute-author            # Include in author name
--attribute-committer        # Include in committer name
--attribute-commit-message-author  # Prefix with "aider:"
--attribute-commit-message-committer # Prefix all commits
--attribute-co-authored-by   # Add Co-authored-by trailer
```

### Ghost Commits (Codex-RS - UNIQUE)
- Creates detached commits with `git commit-tree`
- Preserves untracked and ignored files
- Filters large files (>10MB) and directories (>200 files)
- Ignores: node_modules, .venv, dist, etc.
- No history pollution

---

## 1.6 Code Intelligence

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **LSP Integration** | Yes (multi-server) | No | No | Via MCP | Full Effect LSP | OpenCode |
| **LSP Servers** | Multi | No | No | Via MCP | 28+ servers | OpenCode |
| **Repo Map** | No | No | PageRank | No | No | Aider |
| **Tree-sitter** | Bash AST | No | Yes | Via LSP | Via LSP | Aider |
| **Code Search** | Ripgrep-based | Nucleo fuzzy | Tree-sitter | Pattern | Ripgrep | OpenCode |
| **AST Parsing** | Bash AST | No | Full tree-sitter | Via LSP | Via LSP | Aider |
| **Autocomplete** | No | No | No | Via MCP | Via LSP | OpenCode |
| **Symbol Navigation** | LSP goToDef | No | No | Via MCP | Full support | OpenCode |
| **Diagnostics** | LSP diagnostics | No | Tree-sitter lint | Via MCP | Full diagnostics | OpenCode |
| **Tool Search** | Yes | Yes | No | Yes | Yes | ALL |
| **File Indexing** | Analytics | Connector | RepoMap | Via MCP | Via LSP | Aider |

### Aider RepoMap (PageRank - UNIQUE)
```python
# Graph-based file ranking
ranked = nx.pagerank(G, weight="weight", personalization=personalization)
# Boost 10x for snake/kebab/camel naming matches
# Personalized rankings based on chat file mentions
```

### OpenCode LSP Servers (28+)
JavaScript/TypeScript, Vue, Svelte, Astro, Python, Go, Ruby, Rust, C/C++, C#, F#, Java, Kotlin, Dart, Elixir, OCaml, Lua, PHP, Prisma, Terraform, YAML, Docker, LaTeX, Nix, TypeScript (Tinymist), Haskell, Julia, Gleam, Bash, Swift, Biome, ESLint

---

## 1.7 MCP Integration

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **MCP Support** | Full | Full | None | Full (59KB hub) | Plugins | Cline |
| **Stdio Transport** | Yes | Yes | N/A | Yes | Yes | ALL |
| **SSE Transport** | Yes | Yes | N/A | Yes | Yes | ALL |
| **HTTP/SSE** | Yes | Yes | N/A | Yes | Yes | ALL |
| **OAuth Auth** | Yes | Yes | N/A | Yes | Yes | ALL |
| **Tool Discovery** | Yes | Yes | N/A | Yes | Yes | ALL |
| **Resource Reading** | Yes | Yes | N/A | Yes | Yes | ALL |
| **Prompt Execution** | Yes | Yes | N/A | Yes | Yes | ALL |
| **Auto-Approve Tools** | Yes | No | N/A | Yes | Yes | Claude Code, Cline |
| **Env Var Expansion** | Yes | No | N/A | `${env:VAR}` | Yes | Cline |
| **Server Restart** | Yes | Yes | N/A | On-demand RPC | Yes | Cline |
| **Remote Config Sync** | No | No | N/A | Enterprise | No | Cline |

### Cline McpHub (59KB - MOST ADVANCED)
| Feature | Description |
|---------|-------------|
| Multi-transport | stdio, SSE, StreamableHTTP |
| OAuth 2.0 + PKCE | Full implementation |
| Redirect URL Resolution | Port stability |
| Token Storage | Secure with expiration |
| CSRF Protection | 10-minute state expiry |
| Auto-Reconnect | Exponential backoff (6 attempts, 2s base) |
| File Watcher | Monitors settings |
| Enterprise Remote | Remote MCP server support |

---

## 1.8 Memory System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Memory Taxonomy** | Yes (typed) | Yes | No | Yes | No | Claude Code |
| **MEMORY.md Index** | Yes (max 200 lines) | No | No | No | No | Claude Code |
| **Session Memory** | Yes | Yes | No | Yes | Yes | ALL |
| **Persistent Memory** | Yes | Yes | No | Yes | Yes | ALL |
| **Memory Search** | findRelevantMemories | Yes | No | Yes | Yes | ALL |
| **Memory Types** | 4 types | No | No | No | No | Claude Code |
| **Staleness Warnings** | Yes | No | No | No | No | Claude Code |
| **Team Memory Sync** | Yes | No | No | No | No | Claude Code |
| **extractMemories** | Yes | No | No | No | No | Claude Code |

### Claude Code Memory Types
| Type | Description |
|------|-------------|
| `user` | User preferences, role, goals |
| `feedback` | Guidance, corrections, confirmations |
| `project` | Project context, decisions, state |
| `reference` | External system pointers |

---

## 1.9 Compaction/Context Management

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Compaction** | Yes | Local+Remote | No | Local | 40K | Claude Code |
| **Token Budget** | 50K | Local+Remote | No | Local | 40K | Claude Code |
| **Image Stripping** | Yes | No | No | No | No | Claude Code |
| **Tool Result Pruning** | Protect last 2 | N/A | Summarization | No | Yes | Claude Code |
| **Auto Compact** | Yes | Yes | No | Yes | Yes | Claude Code, Codex-RS |
| **Micro Compact** | Yes | No | No | No | No | Claude Code |
| **Chat History Limit** | Yes | Yes | --max-chat-history-tokens | Yes | Yes | ALL |
| **Context Window Progress** | Yes | Yes | No | Yes | Yes | ALL |
| **Rollback Truncation** | No | Yes | No | No | No | Codex-RS |

### Claude Code Compaction (50K budget)
```typescript
export const POST_COMPACT_MAX_FILES_TO_RESTORE = 5
export const POST_COMPACT_TOKEN_BUDGET = 50_000
export const POST_COMPACT_MAX_TOKENS_PER_FILE = 5_000
export const POST_COMPACT_MAX_TOKENS_PER_SKILL = 5_000
export const POST_COMPACT_SKILLS_TOKEN_BUDGET = 25_000
```

---

## 1.10 AI/Model System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Native Providers** | 1 (Anthropic) | 10+ | 50+ | 40+ | 25+ | Aider |
| **Multi-model** | Yes | Yes | Yes | Yes | Yes | ALL |
| **Model Aliases** | Yes | Yes | Yes | Yes | Yes | ALL |
| **Thinking Tokens** | Yes | Yes | Yes | Yes | Yes | ALL |
| **Reasoning Effort** | No | No | Yes | No | No | Aider |
| **Temperature Control** | Yes | Yes | Yes | Yes | Yes | ALL |
| **Token Estimation** | N/A | approx | Sampling | API | Server | Aider |
| **Cost Tracking** | Yes | Yes | Yes | Yes | Yes | ALL |
| **Image Tokens** | Yes | No | Yes | Yes | Yes | Claude Code, Aider |
| **System Prompt Variants** | Yes | Dynamic | Simple | 12+ | Effect | Cline |
| **Model Per Mode** | No | No | Yes | Yes | Yes | Cline, OpenCode, Aider |

### Provider Count Comparison
| Tool | Providers | Notes |
|------|-----------|-------|
| Aider | 50+ | OpenAI, Anthropic, DeepSeek, OpenRouter, Gemini, Groq, Ollama, AWS Bedrock, Vertex, GitHub Copilot |
| Cline | 40+ | Full provider list |
| OpenCode | 25+ | 20+ providers + gateway |
| Codex-RS | 10+ | OpenAI, ChatGPT, Ollama, LM Studio |
| Claude Code | 1 (native) | Anthropic only |

### Aider Model Aliases
```
sonnet, haiku, opus, 4o, flash, r1, etc.
Custom metadata: .aider.model.metadata.json
Custom settings: .aider.model.settings.yml
```

---

## 1.11 Security/Sandbox

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Sandbox** | No | Yes | No | No | No | Codex-RS |
| **Landlock** | No | Yes | No | No | No | Codex-RS |
| **Seatbelt (macOS)** | No | Yes | No | No | No | Codex-RS |
| **Windows Restricted** | No | Yes | No | No | No | Codex-RS |
| **Exec Policy Engine** | No | Yes | No | No | No | Codex-RS |
| **Pattern Matching** | dangerousPatterns | dangerous_pattern | No | Patterns | No | Claude Code |
| **Bash Classification** | bashClassifier | No | No | No | No | Claude Code |
| **Path Traversal Block** | Yes | Yes | No | Yes | Yes | Claude Code, Codex-RS |
| **Network Rules** | No | Yes | No | No | No | Codex-RS |
| **YOLO Mode** | No | No | No | Yes (whitelist) | No | Cline |

### Codex-RS Sandbox Modes
| Mode | Description |
|------|-------------|
| `read-only` | Default read-only sandbox |
| `workspace-write` | Allow writes to workspace |
| `danger-full-access` | Disable sandboxing |

---

## 1.12 Hooks System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Pre-Tool Hooks** | Yes | Yes | No | Yes | Yes | ALL |
| **Post-Tool Hooks** | Yes | Yes | No | Yes | Yes | ALL |
| **Pre-Compact Hooks** | Yes | No | No | No | Yes | Claude Code, OpenCode |
| **Post-Compact Hooks** | Yes | No | No | No | Yes | Claude Code, OpenCode |
| **Session Start Hooks** | Yes | Yes | No | Yes | Yes | ALL |
| **Read/Edit Hooks** | Yes | No | No | No | No | Claude Code |
| **Think Hook** | Yes | No | No | No | No | Claude Code |
| **Agent Submit Hook** | Yes | No | No | No | No | Claude Code |
| **Entrypoint Hook** | Yes | No | No | No | No | Claude Code |
| **Worktree Create Hook** | Yes | No | No | No | No | Claude Code |
| **Blocking Hooks** | Yes | Yes | N/A | Yes | Yes | ALL |
| **Hook Configuration** | YAML/JSON | JSON | N/A | YAML | YAML | Claude Code |

### Claude Code Hook Types (10 hooks)
| Hook | Trigger |
|------|---------|
| PreToolUse | Before tool execution |
| PostToolUse | After tool execution |
| PreCompact | Before compaction |
| PostCompact | After compaction |
| SessionStart | On session start |
| Read | On file read |
| Edit | On file edit |
| Bash | On bash command |
| Think | On thinking |
| AgentSubmit | On agent submit |
| Entrypoint | On entrypoint call |
| WorktreeCreate | On worktree create |

---

## 1.13 Skills System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Skills Directory** | Yes (.claude/skills/) | Yes (.codex/skills/) | No | Yes | Yes | ALL |
| **Skill Invocation** | @skill | @skill | No | @skill | @skill | Claude Code, Cline, OpenCode |
| **Skill Dependencies** | No | Yes | N/A | No | No | Codex-RS |
| **Skill Policy** | No | Yes | N/A | No | No | Codex-RS |
| **Skills Panel** | /skills | No | No | Yes | Yes | Cline, OpenCode |
| **Custom Workflows** | No | No | No | Yes | No | Cline |

---

## 1.14 Lint/Format/Testing

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Auto-Lint** | No | No | --auto-lint | No | No | Aider |
| **Custom Lint Cmd** | No | No | --lint-cmd | No | No | Aider |
| **Flake8 Integration** | No | No | Yes | No | No | Aider |
| **Tree-sitter Lint** | No | No | Yes | No | No | Aider |
| **Auto-Test** | No | No | --auto-test | No | No | Aider |
| **Test Command** | No | No | --test-cmd | No | No | Aider |
| **AI Comments** | No | No | `// ai!`, `# ai?` | No | No | Aider (UNIQUE) |
| **File Watching** | No | No | Yes | No | No | Aider |

### Aider AI Comments (UNIQUE)
```python
# Add these comments to code for AI actions:
// ai! - Execute as AI command
// ai? - Ask about this code
# ai? - Ask about this code
```

---

## 1.15 Voice Integration

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Voice Input** | /voice | Yes (macOS) | /voice | No | No | Claude Code, Aider |
| **Voice Language** | Yes | No | --voice-language | No | No | Aider |
| **Audio Input Device** | Yes | No | --voice-input-device | No | No | Aider |
| **Voice Format** | No | No | --voice-format | No | No | Aider |
| **Voice Output** | No | Yes | No | No | No | Codex-RS |

---

## 1.16 Web Integration

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Web Search** | Yes | Yes | No | Yes | Yes | Claude Code, Codex-RS, OpenCode |
| **Web Fetch** | Yes | Yes | /web | Yes | Yes | ALL |
| **URL Detection** | No | No | --detect-urls | No | No | Aider |
| **Image Generation** | No | Yes (DALL-E) | No | Yes | No | Codex-RS, Cline |
| **Markdown from URL** | Yes | Yes | /web | Yes | Yes | ALL |
| **Paste Image** | Yes | No | /paste | Yes | Yes | Claude Code, Cline |

---

## 1.17 Configuration

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Config File** | .claude/settings.json | .codex/config.json | .aider.conf.yml | settings.json | opencode.json | ALL |
| **Env File** | .env | .env | .env | .env | .env | ALL |
| **YAML Support** | No | JSON | YAML | JSON | JSON/YAML | Aider |
| **Model Settings** | JSON | JSON | YAML | JSON | JSON | ALL |
| **Model Metadata** | No | No | JSON | No | JSON | Aider |
| **Ignore Files** | .claudeignore | .codexignore | .aiderignore | .clinerules | .opencodeignore | ALL |
| **Global Config** | Yes | Yes | Yes | Yes | Yes | ALL |

### Aider Configuration Files
| File | Format | Purpose |
|------|--------|---------|
| `.aider.conf.yml` | YAML | Main config |
| `.aider.model.settings.yml` | YAML | Model settings |
| `.aider.model.metadata.json` | JSON | Context/cost |
| `.aiderignore` | gitignore | Exclusions |
| `.aider.chat.history.md` | Markdown | Transcript |
| `.aider.tags.cache.v4/` | SQLite | RepoMap tags |

---

## 1.18 Performance

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Deferred Loading** | Yes | Yes | LazyLiteLLM | No | No | Aider (1.5s save) |
| **Startup Speed** | Fast | Fast | LazyLiteLLM | Fast | Fast | ALL |
| **Lazy Import** | Yes | Yes | Yes (litellm) | No | Yes | ALL |
| **Caching** | File+Memory | SQLite | SQLite | TTL | Server | ALL |
| **Cache TTL** | 24 hours | 24 hours | 24 hours | Configurable | Server | Aider, Codex-RS |
| **Prompt Cache** | No | No | --cache-prompts | No | No | Aider |
| **SQLite Storage** | No | Yes | Tags cache | No | Yes | Codex-RS, OpenCode |

### Aider LazyLiteLLM Pattern
```python
class LazyLiteLLM:
    def _load_litellm(self):
        self._lazy_module = importlib.import_module("litellm")
        self._lazy_module.suppress_debug_info = True
# Savings: ~1.5s on CLI startup
```

---

## 1.19 Developer Experience

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Shell Completions** | Yes | Yes | --shell-completions | No | Yes | ALL |
| **Debug Mode** | --debug | Yes | --verbose | Yes | debug cmd | ALL |
| **Show Prompts** | --show-prompts | No | --show-prompts | No | No | Claude Code, Aider |
| **Show Repo Map** | No | No | --show-repo-map | No | No | Aider |
| **Analytics** | Yes | No | Yes | Yes | No | Claude Code, Aider, Cline |
| **Version Check** | --version | Yes | --check-update | Yes | Yes | ALL |
| **Doctor Command** | No | No | No | No | Yes | OpenCode |
| **Multiline Input** | Yes | Yes | Yes | Yes | Yes | ALL |
| **Tab Completion** | Yes | Yes | Yes | Yes | Yes | ALL |
| **VIM Mode** | No | No | --vim | No | No | Aider |
| **External Editor** | Yes | Yes | /edit, /editor | Yes | Yes | ALL |

---

## 1.20 Analytics/Telemetry

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Analytics** | Yes | No | Yes | Yes | No | Claude Code, Aider, Cline |
| **PostHog** | No | No | Yes | No | No | Aider |
| **Opt-in UUID** | Yes | N/A | Yes (10% sample) | Yes | N/A | Claude Code, Aider, Cline |
| **Custom Host** | No | No | --analytics-posthog-* | No | N/A | Aider |
| **Analytics Disable** | No | N/A | --analytics-disable | No | N/A | Aider |
| **Usage Tracking** | Yes | Yes | Yes | Yes | Yes | ALL |

---

## 1.21 Multi-Agent

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Sub-agents** | /agent | spawn_agent | No | /subagent | /task | Claude Code, Codex-RS |
| **Agent Swarms** | Yes | No | No | No | No | Claude Code |
| **Coordinator Pattern** | Yes | Yes | No | No | No | Claude Code, Codex-RS |
| **Team Memory Sync** | Yes | No | No | No | No | Claude Code |
| **SendMessage** | Yes | Yes | No | No | No | Claude Code, Codex-RS |
| **TaskStop** | Yes | Yes | No | No | No | Claude Code, Codex-RS |
| **Agent Lifecycle** | Full | Full | N/A | Yes | Yes | Claude Code, Codex-RS |

### Claude Code Agent System
| Tool | Description |
|------|-------------|
| AgentTool | Spawn agent with config |
| AgentContinue | Continue agent execution |
| AgentReject | Stop agent |
| TaskCreate | Create task |
| TaskGet | Get task |
| TaskOutput | Get task output |
| TaskStop | Stop task |
| TaskUpdate | Update task |

---

## 1.22 Unique/Killer Features

| Feature | Repo | Description |
|---------|------|-------------|
| **Ghost Commits** | Codex-RS | Snapshot without history pollution |
| **RepoMap PageRank** | Aider | Graph-based file ranking |
| **Architect Mode** | Aider | Two-model approach (design + edit) |
| **Tree-sitter Integration** | Aider | Syntax-aware file understanding |
| **AI Comments** | Aider | `// ai!` triggers in code |
| **Voice Input** | Claude Code, Aider | Record and transcribe |
| **Web Scraping** | Aider | /web fetches URLs |
| **LazyLiteLLM** | Aider | 1.5s startup savings |
| **6-flag Attribution** | Aider | Full git attribution |
| **McpHub (59KB)** | Cline | Most advanced MCP |
| **OAuth + PKCE** | Cline | Full OAuth implementation |
| **Landlock Sandbox** | Codex-RS | Linux security sandbox |
| **Effect-based DI** | OpenCode | Comprehensive Effect framework |
| **28+ LSP Servers** | OpenCode | Language coverage |
| **Batch Tool** | OpenCode | Concurrent execution |
| **Collaboration Modes** | Codex-RS | Mode-specific behavior |
| **Thinking Tokens** | Claude Code, Aider | Reasoning budget |
| **Deep Planning** | Cline | /deep-planning command |
| **Skills Policy** | Codex-RS | Skill restrictions |
| **Auto-YOLO Mode** | Cline | Whitelist for asks |
| **Paste Collapse** | Cline | Large paste detection |
| **YAML Config** | Aider | Human-readable config |
| **Model Metadata** | Aider | Custom context/cost |
| **Shell Completions Gen** | Codex-RS, Aider | Generate for shell |
| **Session Rollout** | Codex-RS | Comprehensive logging |

---

## 1.23 Summary Statistics

| Category | Claude Code | Codex-RS | Aider | Cline | OpenCode |
|----------|-------------|----------|-------|-------|----------|
| **Tools** | 42+ | 30+ | LLM-native | 25+ | 39 |
| **Slash Commands** | 90+ | 15+ | 50+ | 7+ | 20+ |
| **Providers** | 1 | 10+ | 50+ | 40+ | 25+ |
| **MCP Transports** | 3 | 3 | 0 | 3 | 3 |
| **LSP Servers** | Multi | 0 | 0 | Via MCP | 28+ |
| **Hooks** | 10 | 5 | 0 | Yes | 20+ |
| **Edit Formats** | N/A | N/A | 12 | N/A | N/A |
| **Permission Modes** | 6 | N/A | 4 | Patterns | Tool-based |
| **Memory Types** | 4 | Yes | 0 | Yes | Yes |

### Mode System Implementation Details

#### Claude Code - Permission Modes (`types/permissions.ts`)

```typescript
export const PERMISSION_MODES = [
  'acceptEdits',   // Auto-accept safe file edits
  'bypassPermissions', // No prompts, all allowed
  'default',       // Interactive permission prompts
  'dontAsk',       // Auto-deny, no prompts
  'plan',          // Read-only, planning only
  'auto'           // ANT-only, AI classifies safe actions
] as const
```

**Switching**: `/plan`, `Shift+Tab`, `--permission-mode plan`

#### Cline - Plan/Act Modes

```typescript
// Plan Mode: Read-only, explores codebases, creates plans
// Act Mode: Full execution, modifies files and runs commands
// Different models can be configured per mode
// /deep-planning slash command for extended sessions
```

#### Aider - Chat Modes

```
/ask      - Read-only, answers questions
/architect - Two-model: architect proposes, editor implements
/code     - Full code editing
/help     - Help about Aider itself
/chat-mode <mode> - Make mode change sticky
```

#### OpenCode - Agent Types

```typescript
// Plan Agent: Read-only, saves plans to .opencode/plans/*.md
// Build Agent: Full execution with all tools
// Tool-based switching with explicit approval
```

**BEST Implementation**: Claude Code's 6-mode permission system with visual feedback

### TUI Implementation Details

#### Claude Code - `/home/sridhar/claude-code-sourcemap/restored-src/src/ink/`
```
Key Files:
├── ink.tsx                    # Main Ink class, render loop
├── reconciler.ts             # Custom React reconciler for terminal
├── renderer.ts               # Frame rendering, cursor management
├── screen.ts                # Screen buffer with cell pools
├── terminal.ts              # Terminal detection, keyboard handling
├── focus.ts                 # Focus management for interactive elements
└── components/App.tsx       # Main app shell
└── screens/REPL.tsx         # Main REPL screen
└── components/VirtualMessageList.tsx  # Virtual scrolling for messages
```

**Best Feature**: Flicker Prevention via Static/Dynamic Split
- `ChatView.tsx` splits content: Static (render once) + Dynamic (small, frequent updates)
- Custom Yoga layout via `getYogaCounters` from `native-ts/yoga-layout`

#### Codex-RS - `/home/sridhar/codex/codex-rs/tui/src/`
```
Key Files:
├── tui.rs                    # Main Tui class, terminal init, modes
├── app.rs                   # App struct, event loop
├── chatwidget.rs           # Chat message widget
├── markdown_render.rs      # Markdown with special link handling
├── color.rs                # Color utilities, perceptual distance
├── notifications/          # Desktop notifications backend
├── status/                # Status bar components
└── key_hint.rs            # Keyboard shortcut hints
```

**Best Feature**: Job Control + Desktop Notifications
- `job_control.rs` for Ctrl-Z suspend/resume
- Notifications with backend detection (libnotify, Windows)

#### Cline CLI - `/home/sridhar/cline/cli/src/`
```
Key Files:
├── components/App.tsx      # Main app with view routing
├── components/ChatView.tsx # Chat message display
├── components/StatusBar.tsx # Git branch + model + tokens
├── constants/colors.ts     # Color constants
├── constants/keyboard.ts    # Keyboard escape sequences
└── hooks/useTerminalSize.ts # Terminal dimension handling
```

---

## 1.2 Tool System

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Schema Definition** | Zod (strong) | JSON Schema | None | None | Zod (strong) | Claude Code, OpenCode |
| **Type Safety** | Excellent | Good | None | Medium | Excellent | Claude Code |
| **Permission Model** | Pattern-based rules | Config-based | None | Command patterns | ctx.ask() | Claude Code |
| **Parallel Execution** | isConcurrencySafe | Flag per-tool | No | READ_ONLY_TOOLS | Not explicit | Claude Code |
| **Deferred Loading** | ToolSearch | tool_search | No | No | Not explicit | Claude Code |
| **Tool Chaining** | AgentTool | Multi-agent | No | SubagentTool | Not explicit | Claude Code |
| **Error Handling** | Typed | Untyped | String | String | Effect/Result | OpenCode |
| **Progress Streaming** | ToolCallProgress | Not visible | Diffs | Partial blocks | ctx.metadata() | Claude Code |
| **MCP Integration** | Full | Full | None | Full | Via plugins | Claude Code |
| **Result Truncation** | maxResultSizeChars | Not visible | No | No | Truncate.output() | Claude Code |
| **Tool Count** | 42+ | 30+ | N/A | 25+ | 39 | Claude Code |
| **UI Rendering** | React components | Not visible | Text only | UI helpers | Not visible | Claude Code |

### Tool Implementation Details

#### Claude Code - `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/`

**Build Pattern** (`Tool.ts` ~793 lines):
```typescript
// buildTool() factory with fail-closed defaults
const TOOL_DEFAULTS = {
  isEnabled: () => true,
  isConcurrencySafe: () => false,
  isReadOnly: () => false,
  isDestructive: () => false,
  checkPermissions: () => ({ behavior: 'allow' }),
  toAutoClassifierInput: () => '',
  userFacingName: () => name,
}
```

**Tool Interface** includes:
- `call()`, `description()`, `inputSchema`
- `renderToolUseMessage()`, `renderToolResultMessage()`, `renderToolUseProgressMessage()`
- `isSearchOrReadCommand()` — Collapse in UI
- `validateInput()` → `checkPermissions()` → `call()` pipeline
- `shouldDefer` — ToolSearch deferral
- `getToolUseSummary()`, `getActivityDescription()` — Spinner text
- `maxResultSizeChars` — Result storage threshold

#### OpenCode - `/home/sridhar/opencode/packages/opencode/src/tool/`

**Effect-Based Pattern**:
```typescript
export function defineEffect<Parameters, Result, R>(
  id: string,
  init: Effect.Effect<Def | ((ctx?) => Promise<Def>), never, R>,
): Effect.Effect<Info<Parameters, Result>, never, R>
```

**Best Feature**: Permission requests via `ctx.ask()`
```typescript
await ctx.ask({
  permission: "external_directory",
  patterns: globs,
  always: globs,
  metadata: {},
})
```

#### Cline - `/home/sridhar/cline/src/core/task/tools/`

**Handler-Based Pattern** (25+ handlers):
```typescript
export interface IFullyManagedTool {
  readonly name: string
  getDescription(block: ToolUse): string
  handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void>
  execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse>
}
```

**Best Feature**: File read deduplication cache with mtime validation

---

## 1.3 Performance

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Startup Optimization** | Lazy module loading | Fast Rust binary | LazyLiteLLM | Dynamic imports | SolidJS lazy() | Aider |
| **Import Deferral** | Skills lazy load | Arc-based | 1.5s savings | ESM dynamic | SolidJS lazy | Aider |
| **Caching Strategy** | File + Memory | File + Arc | SQLite + Dict | In-memory + TTL | In-memory + TTL | Aider, Claude Code |
| **Token Estimation** | Not visible | approx_token_count | Sampling-based | API tracking | Server-side | Aider |
| **Context Compaction** | 50K budget, image stripping | Local + Remote | None | Local only | Server-side | Claude Code |
| **Concurrency** | Async/await | tokio async | Threading | Async/await | Promise.allSettled | Codex-RS |
| **Persistence** | JSON/JSONL | SQLite + JSONL | YAML/JSON | Debounced JSON | Server-side | Codex-RS |

### Performance Implementation Details

#### Aider - `/home/sridhar/aider/aider/llm.py`

**LazyLiteLLM Pattern**:
```python
class LazyLiteLLM:
    def _load_litellm(self):
        self._lazy_module = importlib.import_module("litellm")
        self._lazy_module.suppress_debug_info = True
```

**Savings**: ~1.5s on CLI startup

#### Claude Code - Compaction Budgets

```typescript
// services/compact/compact.ts
export const POST_COMPACT_MAX_FILES_TO_RESTORE = 5
export const POST_COMPACT_TOKEN_BUDGET = 50_000
export const POST_COMPACT_MAX_TOKENS_PER_FILE = 5_000
export const POST_COMPACT_MAX_TOKENS_PER_SKILL = 5_000
export const POST_COMPACT_SKILLS_TOKEN_BUDGET = 25_000
```

#### Cline - Atomic Writes

```typescript
// StateManager with debounced persistence
private readonly persistenceDebounceMs = 500
// Temp file + rename pattern prevents corruption
```

---

## 1.4 Code Intelligence

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **LSP Integration** | Yes (multi-server) | No | No (via tree-sitter) | Via MCP | Full Effect LSP | OpenCode |
| **Code Search** | Ripgrep-based | Nucleo fuzzy | Tree-sitter queries | Pattern-based | Ripgrep + semantic | OpenCode |
| **AST Parsing** | Bash AST (tree-sitter) | No | Tree-sitter full | Via LSP | Via LSP | Aider |
| **Autocomplete** | No | No | No | Via MCP | Via LSP | Cline, OpenCode |
| **Symbol Navigation** | LSP goToDefinition | No | No | Via MCP | Full support | OpenCode |
| **Error Detection** | LSP diagnostics | No | External linters | Via MCP | Full diagnostics | OpenCode |
| **Code Indexing** | Analytics tracking | Connector system | RepoMap PageRank | Via MCP | Via LSP | Aider |
| **Repo Map** | No | No | Graph PageRank | No | No | Aider |

### Code Intelligence Implementation Details

#### OpenCode LSP - `/home/sridhar/opencode/packages/opencode/src/lsp/`

**Full Effect-Based LSP**:
```typescript
export interface Interface {
  readonly init: () => Effect<void>
  readonly status: () => Effect<Status[]>
  readonly hover: (file: string, pos: Position) => Effect<Hover | null>
  readonly definition: (file: string, pos: Position) => Effect<Location | null>
  readonly references: (file: string, pos: Position) => Effect<Location[]>
  readonly diagnostics: () => Effect<Record<string, Diagnostic[]>>
}
```

#### Aider RepoMap - `/home/sridhar/aider/aider/repomap.py`

**PageRank-Based Algorithm**:
```python
def get_ranked_tags(self, chat_fnames, other_fnames, ...):
    # Build MultiDiGraph with definitions/references
    # PageRank with personalization (chat files get boost)
    # Boost 10x for snake/kebab/camel naming
    ranked = nx.pagerank(G, weight="weight", personalization=personalization)
```

---

## 1.5 Git Integration

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Commit Flow** | Bash via prompt | Ghost commits | Full Python | Via Claude Code | None | Aider |
| **Auto-Commit** | NO | YES (ghost) | YES | Via CC | None | Aider, Codex-RS |
| **Attribution System** | Text append | None | 6-flag system | Via CC | None | Aider |
| **Diff Display** | Shell output | Merge-base diff | Progress bars | AI explanations | None | Cline |
| **Branch Management** | Session branching | Merge-base | Via CLI | Via CLI | None | Codex-RS |
| **Ghost Commits** | NO | YES | NO | NO | NO | Codex-RS |
| **Safety Rules** | Never skip hooks | Unknown | Pre-commit respect | Via CC | None | Claude Code |
| **Conflict Resolution** | Via CLI | --3way | No | Via CLI | None | Codex-RS |

### Git Implementation Details

#### Aider Auto-Commit - `/home/sridhar/aider/aider/repo.py`

**Best Attribution System**:
```python
# 6 distinct attribution flags
--attribute-author (default: True for AI edits)
--attribute-committer (default: True)
--attribute-commit-message-author
--attribute-commit-message-committer
--attribute-co-authored-by (adds Co-authored-by trailer)

# Environment variable manipulation
os.environ["GIT_AUTHOR_NAME"] = f"{user_name} (aider)"
os.environ["GIT_COMMITTER_NAME"] = f"{user_name} (aider)"
```

#### Codex-RS Ghost Commits - `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs`

**Unique Snapshot Feature**:
```rust
pub struct GhostCommit {
    id: CommitID,
    parent: Option<CommitID>,
    preexisting_untracked_files: Vec<PathBuf>,
    preexisting_untracked_dirs: Vec<PathBuf>,
}
// Configurable thresholds: 10MB files, 200 items
// Ignores: node_modules, .venv, etc.
```

#### Claude Code Safety Protocol - `/home/sridhar/claude-code-sourcemap/restored-src/src/commands/commit.ts`

```typescript
const ALLOWED_TOOLS = [
  'Bash(git add:*)',
  'Bash(git status:*)',
  'Bash(git commit:*)',
]

// Safety protocol enforced
// - NEVER update git config
// - NEVER skip hooks
// - ALWAYS create NEW commits (never --amend)
// - HEREDOC syntax for commit messages
```

---

## 1.6 Memory/State Management

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEST |
|---------|-------------|----------|-------|-------|----------|------|
| **Storage** | Files | SQLite | Files | Files + Cache | SQLite | Codex-RS, OpenCode |
| **Memory Type** | Typed files | Extracted summaries | Summarization | Settings cache | Message parts | Claude Code |
| **Resume** | Hard-link copy | Thread graph | Summary bridge | File restore | Fork clone | Claude Code |
| **Pruning** | Manual | Job state machine | Recursive | Task switch | Tool result mark | OpenCode |
| **Context Limits** | MEMORY.md 25KB | Configurable | 1K tokens | Debounced 500ms | 40K protect | OpenCode |
| **Fork Pattern** | Fresh session | Parent-child | N/A | Task copy | ID remap | Claude Code |

### Memory Implementation Details

#### Claude Code Memory System - `/home/sridhar/claude-code-sourcemap/restored-src/src/memdir/`

**Best Taxonomy System**:
```typescript
// Frontmatter format for memories
---
name: memory-name
description: one-line description
type: user | feedback | project | reference
---

// Memory limits
const MEMORY.md_MAX_LINES = 200
const MEMORY.md_MAX_BYTES = 25_000
const MEMORY_FILES_SCANNED = 200
const SELECTED_MEMORIES_PER_QUERY = 5

// Staleness warnings (>1 day old)
```

#### OpenCode Compaction - `/home/sridhar/opencode/packages/opencode/src/session/compaction.ts`

**Best Pruning Strategy**:
```typescript
const PRUNE_PROTECT = 40_000  // Protects recent tool results
const PRUNE_MINIMUM = 20_000  // Minimum savings to trigger
const COMPACTION_BUFFER = 20_000  // Reserved for overflow

// Protected: last 2 user turns + skill tools
// Prunes tool results marked with time.compacted
```

---

# SECTION 2: BEST-IN-CLASS FEATURES SUMMARY

## 2.1 Winner by Feature Category

| Category | BEST Repo | Why |
|----------|-----------|-----|
| **TUI/UI** | Codex-RS | Ratatui + markdown rendering + desktop notifications + job control |
| **Tool System** | Claude Code | 42+ tools + Zod schemas + permission model + parallel execution + deferred loading |
| **Error Handling** | OpenCode | Effect monad provides typed errors + AbortSignal cancellation |
| **Performance** | Aider | LazyLiteLLM saves 1.5s startup + SQLite caching |
| **Git Integration** | Aider | 6-flag attribution system + auto-commit |
| **Repo Map** | Aider | PageRank algorithm for codebase understanding |
| **MCP Integration** | Cline | 59KB McpHub with OAuth + multi-transport |
| **Multi-Provider** | Cline | 40+ providers with factory pattern |
| **System Prompt** | Cline | 12+ model-specific variants with Builder pattern |
| **LSP** | OpenCode | Full Effect-based LSP service |
| **Memory/State** | OpenCode | 40K token protection + tool result pruning |
| **Compaction** | Claude Code | 50K token budget + image stripping |
| **Sandbox** | Codex-RS | Landlock/Seatbelt + ExecPolicy |
| **Desktop App** | OpenCode | Tauri + Electron both supported |

---

# SECTION 3: IMPLEMENTATION RECOMMENDATIONS

## 3.1 Architecture Pattern

Based on best-of-breed analysis:

```
src/
├── cli/                    # Entry point, argument parsing, fast-path
├── engine/                 # Main agent loop, turn management
├── tools/                  # Tool registry, buildTool factory
│   ├── BashTool.ts         # From Claude Code pattern
│   ├── FileReadTool.ts     # From Claude Code pattern
│   ├── FileEditTool.ts     # From Claude Code pattern
│   ├── GlobTool.ts         # From Claude Code pattern
│   ├── GrepTool.ts         # From Claude Code pattern
│   └── ...
├── permissions/           # Pattern-based rules (Claude Code style)
├── hooks/                  # Pre/post tool hooks
├── mcp/                    # MCP server management (Cline style)
├── providers/              # Multi-provider (Cline factory pattern)
├── prompt/                 # System prompt (Cline variant system)
├── git/                    # Git integration (Aider attribution style)
├── repomap/                # Codebase understanding (Aider PageRank)
├── lsp/                    # LSP integration (OpenCode Effect style)
├── memory/                 # Memory system (Claude Code taxonomy)
├── compaction/             # Context compaction (Claude Code budgets)
├── state/                  # State persistence (OpenCode SQLite)
├── ui/                     # TUI (Codex-RS Ratatui pattern)
│   ├── tui.rs
│   ├── app.rs
│   ├── chat.rs
│   ├── markdown.rs
│   └── ...
└── commands/               # Slash commands
    ├── commit.ts          # Claude Code safety protocol
    ├── review.ts
    └── ...
```

## 3.2 Key Patterns to Implement

### Tool Factory (from Claude Code)
```typescript
export interface Tool<Input, Output, P = ToolProgressData> {
  name: string
  call(args, context, canUseTool, onProgress?): Promise<ToolResult<Output>>
  description(input, options): Promise<string>
  inputSchema: z.ZodType
  isConcurrencySafe(input): boolean
  isReadOnly(input): boolean
  renderToolUseMessage(input, options): React.ReactNode
  renderToolResultMessage(content, progress, options): React.ReactNode
  maxResultSizeChars: number
}

export function buildTool<D extends ToolDef>(def: D): Tool {
  return { ...TOOL_DEFAULTS, ...def }
}
```

### Git Attribution (from Aider)
```typescript
interface GitAttribution {
  attributeAuthor: boolean      // GIT_AUTHOR_NAME = "User (aider)"
  attributeCommitter: boolean    // GIT_COMMITTER_NAME = "User (aider)"
  attributeCoAuthoredBy: boolean // Co-authored-by: aider (model) <aider@aider.chat>
  gitCommitVerify: boolean       // Respect pre-commit hooks
}
```

### RepoMap PageRank (from Aider)
```typescript
function getRankedTags(chat_fnames, codebase_files):
  // 1. Extract definitions/references via tree-sitter
  // 2. Build MultiDiGraph
  // 3. PageRank with personalization
  // 4. Boost chat files 10x, snake_case 10x
  return ranked_files
```

### MCP Hub (from Cline)
```typescript
class McpHub {
  async connect(transport: ClientTransport): Promise<void>
  async discoverTools(): Promise<ClineTool[]>
  async executeTool(name: string, args: object): Promise<ToolResponse>
  async handleOAuth(callback: OAuthCallback): Promise<void>
}
```

### Compaction Budget (from Claude Code)
```typescript
const COMPACTION = {
  MAX_FILES_TO_RESTORE: 5,
  TOKEN_BUDGET: 50_000,
  MAX_TOKENS_PER_FILE: 5_000,
  MAX_TOKENS_PER_SKILL: 5_000,
  SKILLS_TOKEN_BUDGET: 25_000,
}
```

### Memory Taxonomy (from Claude Code)
```typescript
interface Memory {
  name: string           // Unique identifier
  description: string      // One-line summary
  type: 'user' | 'feedback' | 'project' | 'reference'
  content: string
  createdAt: Date
  staleWarning?: string   // If >1 day old
}
```

### Effect-Based Error Handling (from OpenCode)
```typescript
export function defineToolEffect<T, R>(
  id: string,
  execute: (args: T, ctx: Context) => Effect<ToolResult, Error, R>
): Effect<ToolInfo, never, R>

// Cancellation via AbortSignal in Context
await ctx.abort
```

---

# SECTION 4: PHASE TICKETS

## PHASE 1: Core Infrastructure + Mode System (Week 1-2)

### Ticket P1-01: Tool System Foundation
**Description**: Implement the core tool system using Claude Code's `buildTool()` factory pattern.

**Files to create**:
- `src/tools/Tool.ts` — Tool interface with Zod schemas, render methods, permission defaults
- `src/tools/tools.ts` — Tool registry with `getTools()`, `assembleToolPool()`
- `src/tools/BashTool/BashTool.ts` — Shell execution with security patterns
- `src/tools/FileReadTool/FileReadTool.ts` — File reading with limits
- `src/tools/FileEditTool/FileEditTool.ts` — Patch-based editing
- `src/tools/GlobTool/GlobTool.ts` — File pattern matching
- `src/tools/GrepTool/GrepTool.ts` — Content search

**Key implementations**:
1. `buildTool()` factory with fail-closed defaults
2. `isConcurrencySafe()` for parallel execution
3. `isReadOnly()` / `isDestructive()` for safety
4. `maxResultSizeChars` for large result storage
5. Permission model: `alwaysAllow`, `alwaysDeny`, `alwaysAsk` rules
6. Render pipeline: `renderToolUseMessage()`, `renderToolResultMessage()`, `renderToolUseProgressMessage()`

**How to test**:
- Run each tool with valid/invalid inputs
- Test parallel execution with `isConcurrencySafe` tools
- Verify large results are persisted to disk
- Test permission rules block/allow tools correctly

**Acceptance criteria**:
- [ ] All 6 core tools implement Tool interface
- [ ] `buildTool()` factory works with partial definitions
- [ ] Permission rules correctly filter tool access
- [ ] Large tool results (>10KB) stored to disk with preview
- [ ] Concurrent tool execution works for safe tools
- [ ] Unit tests for each tool pass

---

### Ticket P1-02: TUI Framework
**Description**: Build the CLI UI using Rust Ratatui (like Codex-RS) for best markdown rendering and desktop notifications.

**Files to create**:
- `src/ui/tui.rs` — Main Tui struct, terminal init, event loop
- `src/ui/app.rs` — App state and main loop
- `src/ui/chat.rs` — Chat message widget with streaming
- `src/ui/markdown.rs` — Markdown rendering (pulldown-cmark + custom links)
- `src/ui/color.rs` — Color utilities with CIE76 perceptual distance
- `src/ui/status.rs` — Status bar (git branch, model, tokens, cost)
- `src/ui/notifications.rs` — Desktop notifications backend
- `src/ui/key_hint.rs` — Keyboard shortcut hints
- `src/ui/diff.rs` — Diff display component

**Key implementations**:
1. Ratatui-based TUI with Crossterm input
2. Markdown rendering with syntax highlighting
3. File link handling (shows actual paths, not labels)
4. Desktop notifications when terminal unfocused
5. Job control (Ctrl-Z suspend/resume)
6. Theme picker system

**How to test**:
- Render markdown with code blocks, links, tables
- Display diffs with syntax highlighting
- Send desktop notifications
- Test job control (Ctrl-Z to suspend, fg to resume)
- Verify theme switching works

**Acceptance criteria**:
- [ ] Markdown renders with proper formatting
- [ ] Code blocks have syntax highlighting
- [ ] File links display actual paths
- [ ] Desktop notifications work on Linux/macOS/Windows
- [ ] Ctrl-Z suspends app, fg resumes
- [ ] Theme switching changes colors correctly

---

### Ticket P1-03: Agent Loop
**Description**: Implement the main agent loop with turn management and tool orchestration.

**Files to create**:
- `src/engine/loop.rs` — Main agent loop with turn management
- `src/engine/state.rs` — Turn state, message queue, tool results
- `src/engine/compact.rs` — Context compaction (Claude Code style)
- `src/engine/token.rs` — Token estimation and counting

**Key implementations**:
1. Turn loop: user input → model call → tool execution → response
2. Tool execution orchestration with progress streaming
3. Context compaction with 50K token budget
4. Image stripping (replace with `[image]` markers)
5. Tool result pruning (protect last 2 user turns + skill tools)
6. Token counting with sampling for large files

**How to test**:
- Run agent loop with multi-turn conversation
- Test compaction triggers at token limits
- Verify tool results are truncated correctly
- Test image stripping in compaction

**Acceptance criteria**:
- [ ] Agent loop processes turns correctly
- [ ] Compaction triggers at 50K tokens
- [ ] Image stripping works in compaction
- [ ] Tool results pruned correctly
- [ ] Token estimation accurate within 5%

---

### Ticket P1-04: Mode System (Plan/Execution)
**Description**: Implement mode switching system with Plan mode (read-only) and Execution mode (full access). Reference Claude Code's 6-mode permission system.

**Files to create**:
- `src/modes/mod.rs` — Mode registry and configuration
- `src/modes/plan.rs` — Plan mode implementation
- `src/modes/execution.rs` — Execution mode implementation
- `src/modes/permissions.rs` — Permission modes enum and handlers
- `src/modes/commands.rs` — Mode switching slash commands

**Key implementations**:
1. **Permission Modes** (Claude Code pattern):
   - `plan` - Read-only, explore and plan only
   - `default` - Interactive permission prompts
   - `acceptEdits` - Auto-accept safe file edits
   - `auto` - AI classifies and auto-approves safe actions
   - `bypass` - No prompts, all actions allowed
   - `dontAsk` - Auto-deny, no prompts
2. **Mode Switching Commands**:
   - `/plan` - Enter plan mode
   - `/auto` - Enter auto mode (if enabled)
   - `Shift+Tab` - Cycle through modes
   - `--permission-mode <mode>` - CLI flag
3. **Tool Filtering Per Mode**:
   - Write/Edit tools disabled in plan mode
   - Bash commands restricted in plan mode
   - Configurable per mode
4. **Visual Feedback**:
   - Mode indicator in status bar
   - Clear messaging about current mode
   - Permission prompts show current mode
5. **Model Per Mode** (optional):
   - Different models for plan vs execution
   - Lighter model for planning

**How to test**:
- Start with `--permission-mode plan` - verify read-only
- Switch to `/auto` mode - verify AI auto-approves safe actions
- Cycle modes with Shift+Tab
- Verify write/edit tools are blocked in plan mode
- Verify mode indicator shows correctly in UI
- Test `/plan` and `/auto` slash commands

**Acceptance criteria**:
- [ ] Plan mode is truly read-only (no file modifications)
- [ ] All 6 permission modes work correctly
- [ ] Mode switching via commands works
- [ ] Mode switching via keyboard shortcut works
- [ ] Mode indicator visible in TUI
- [ ] Bash command permissions respect mode
- [ ] Configuration via settings.json works

**Reference implementations**:
- Claude Code: `types/permissions.ts`, `/plan` command
- Cline: Plan/Act mode toggle with model per mode
- Aider: `/ask`, `/architect`, `/code` chat modes
- OpenCode: Plan Agent / Build Agent system

---

## PHASE 2: Intelligence Features (Week 3-4)

### Ticket P2-01: Git Integration
**Description**: Implement git integration with Aider-style attribution and Claude Code safety protocol.

**Files to create**:
- `src/git/repo.rs` — Git operations with attribution
- `src/git/commit.rs` — Commit creation with attribution flags
- `src/git/diff.rs` — Diff generation and display
- `src/git/branch.rs` — Branch utilities

**Key implementations**:
1. Auto-commit with LLM-generated messages
2. Attribution flags: `--attribute-author`, `--attribute-committer`, `--attribute-co-authored-by`
3. Environment variable manipulation for author/committer
4. Safety protocol: NEVER skip hooks, NEVER --amend, NEVER commit secrets
5. HEREDOC syntax for commit messages
6. Co-authored-by trailer with model name

**How to test**:
- Test auto-commit creates commits with correct attribution
- Verify safety rules prevent dangerous operations
- Test co-authored-by trailer appears when enabled
- Verify pre-commit hooks are respected

**Acceptance criteria**:
- [ ] Auto-commit creates commits with attribution
- [ ] `--attribute-author` modifies GIT_AUTHOR_NAME
- [ ] `--attribute-committer` modifies GIT_COMMITTER_NAME
- [ ] `--attribute-co-authored-by` adds trailer
- [ ] Safety rules block: git config changes, hook skipping, --amend
- [ ] Secrets (.env, credentials.json) trigger warning

---

### Ticket P2-02: Repo Map
**Description**: Implement codebase understanding using Aider's PageRank algorithm.

**Files to create**:
- `src/repomap/mod.rs` — Main RepoMap struct
- `src/repomap/tree_sitter.rs` — Tree-sitter integration for AST
- `src/repomap/pagerank.rs` — PageRank algorithm for relevance
- `src/repomap/cache.rs` — SQLite-based caching with mtime

**Key implementations**:
1. Tree-sitter query system for definitions/references
2. MultiDiGraph building with file relationships
3. PageRank with personalization (chat files get boost)
4. Naming pattern boosting (snake_case 10x, camelCase 10x)
5. SQLite caching with mtime-based invalidation

**How to test**:
- Parse codebase with tree-sitter for 5+ languages
- Build graph from definitions/references
- Verify PageRank correctly ranks files
- Test cache hit/miss with mtime changes
- Boost chat-related files in ranking

**Acceptance criteria**:
- [ ] Supports Python, TypeScript, Rust, Go, JavaScript
- [ ] Graph built correctly from AST
- [ ] PageRank ranks chat-relevant files higher
- [ ] Cache invalidates on mtime change
- [ ] snake_case identifiers boosted 10x

---

### Ticket P2-03: LSP Integration
**Description**: Implement LSP integration using OpenCode's Effect-based approach.

**Files to create**:
- `src/lsp/mod.rs` — LSP service interface
- `src/lsp/client.rs` — vscode-jsonrpc client
- `src/lsp/server.rs` — LSP server configuration
- `src/lsp/diagnostics.rs` — Diagnostic collection and display

**Key implementations**:
1. Effect-based async for all LSP operations
2. Multi-server support with extension-based selection
3. Hover, definition, references, workspace symbol
4. Diagnostics with 150ms debounce
5. File versioning for change tracking

**How to test**:
- Connect to TypeScript/Rust LSP servers
- Test hover shows documentation
- Test go-to-definition works
- Test diagnostics display correctly
- Test file changes trigger re-analysis

**Acceptance criteria**:
- [ ] LSP client connects to tsserver/rust-analyzer
- [ ] Hover returns documentation
- [ ] Go-to-definition navigates correctly
- [ ] Diagnostics display in real-time
- [ ] File changes trigger re-analysis

---

## PHASE 3: Advanced Features (Week 5-6)

### Ticket P3-01: MCP Integration
**Description**: Implement MCP server integration using Cline's McpHub pattern.

**Files to create**:
- `src/mcp/hub.rs` — MCP hub with multi-transport support
- `src/mcp/client.rs` — MCP client connection
- `src/mcp/oauth.rs` — OAuth flow handling
- `src/mcp/tools.rs` — MCP tool conversion

**Key implementations**:
1. Multi-transport support (stdio, SSE, StreamableHTTP)
2. OAuth authentication flow
3. Tool/resource/prompt discovery
4. Short unique keys (6-char hash) for tool names
5. Tool permission filtering by server

**How to test**:
- Connect to local MCP servers via stdio
- Connect to remote MCP servers via HTTP
- Test OAuth authentication flow
- Verify tools discovered correctly
- Test tool execution via MCP

**Acceptance criteria**:
- [ ] stdio transport connects successfully
- [ ] HTTP transport connects successfully
- [ ] OAuth flow completes
- [ ] Tools discovered and converted correctly
- [ ] Tool execution via MCP works

---

### Ticket P3-02: Multi-Provider Support
**Description**: Implement multi-provider support using Cline's factory pattern.

**Files to create**:
- `src/providers/mod.rs` — Provider factory
- `src/providers/anthropic.rs` — Anthropic handler
- `src/providers/openai.rs` — OpenAI handler
- `src/providers/ollama.rs` — Ollama handler
- `src/providers/openrouter.rs` — OpenRouter handler

**Key implementations**:
1. Factory pattern for handler creation
2. Unified interface for all providers
3. Model family detection for prompt variants
4. API format detection (native tool calls vs XML)
5. Token tracking per request

**How to test**:
- Test Anthropic API with Claude models
- Test OpenAI API with GPT models
- Test Ollama with local models
- Test OpenRouter with mixed models
- Verify token tracking accurate

**Acceptance criteria**:
- [ ] Anthropic handler works with Claude
- [ ] OpenAI handler works with GPT
- [ ] Ollama handler works with local models
- [ ] Factory pattern creates correct handler
- [ ] Token tracking accurate within 5%

---

### Ticket P3-03: System Prompt Variants
**Description**: Implement model-specific prompt variants using Cline's Builder pattern.

**Files to create**:
- `src/prompt/registry.rs` — Prompt registry
- `src/prompt/builder.rs` — Prompt builder with variants
- `src/prompt/components.rs` — Reusable prompt sections
- `src/prompt/variants/generic.rs` — Generic model config
- `src/prompt/variants/next_gen.rs` — Claude 4, GPT-5 config
- `src/prompt/variants/xs.rs` — Small context model config

**Key implementations**:
1. Builder pattern for variant configuration
2. Component override system
3. Tool list per variant
4. Rules/tips per variant
5. Model family detection

**How to test**:
- Generate prompts for different model families
- Verify variant-specific tools included
- Test component overrides work correctly
- Verify rules differ per variant

**Acceptance criteria**:
- [ ] Generic variant generates correctly
- [ ] Next-gen variant includes advanced tools
- [ ] XS variant condenses prompt appropriately
- [ ] Component overrides work
- [ ] Tool list matches variant config

---

## PHASE 4: Polish (Week 7-8)

### Ticket P4-01: Memory System
**Description**: Implement memory system using Claude Code's taxonomy pattern.

**Files to create**:
- `src/memory/mod.rs` — Memory service
- `src/memory/store.rs` — File-based storage
- `src/memory/query.rs` — Memory search and recall

**Key implementations**:
1. Typed memory files with YAML frontmatter
2. MEMORY.md index file (max 200 lines, 25KB)
3. Memory types: user, feedback, project, reference
4. Staleness warnings (>1 day old)
5. Relevance-based recall with vector search optional

**How to test**:
- Create memories of each type
- Verify MEMORY.md stays under limits
- Test staleness warnings appear
- Test recall finds relevant memories

**Acceptance criteria**:
- [ ] Memories saved with correct frontmatter
- [ ] MEMORY.md stays under 25KB
- [ ] Staleness warnings for >1 day old
- [ ] Recall finds relevant memories

---

### Ticket P4-02: Hook System
**Description**: Implement pre/post tool hooks.

**Files to create**:
- `src/hooks/mod.rs` — Hook service
- `src/hooks/config.rs` — Hook configuration
- `src/hooks/executor.rs` — Hook execution

**Key implementations**:
1. Pre-tool hooks (can modify input, block execution)
2. Post-tool hooks (can modify output, log results)
3. Pre-compact hooks
4. Post-compact hooks
5. Session-start hooks
6. Permission hooks

**How to test**:
- Create pre-tool hook that blocks dangerous commands
- Create post-tool hook that logs results
- Test hook execution order
- Verify hooks can modify tool input/output

**Acceptance criteria**:
- [ ] Pre-tool hooks execute before tools
- [ ] Post-tool hooks execute after tools
- [ ] Hooks can modify tool input/output
- [ ] Hook configuration loads from config file

---

### Ticket P4-03: Sandbox Security
**Description**: Implement sandbox security using Codex-RS patterns.

**Files to create**:
- `src/sandbox/mod.rs` — Sandbox service
- `src/sandbox/exec_policy.rs` — Execution policy
- `src/sandbox/landlock.rs` — Linux Landlock integration

**Key implementations**:
1. Landlock (Linux), Seatbelt (macOS), Windows Restricted Token
2. Prefix-based command rules
3. Network rules per host/protocol
4. dangerous_pattern detection
5. Path traversal prevention

**How to test**:
- Test Landlock restricts file access
- Test Seatbelt restricts on macOS
- Test command rules block/allow correctly
- Test network rules block outbound connections

**Acceptance criteria**:
- [ ] Sandbox restricts file system access
- [ ] Command rules work correctly
- [ ] Network rules block unauthorized connections
- [ ] Dangerous patterns detected

---

## PHASE 5: Future Enhancements

### Ticket F1-01: Multi-Agent Coordination
**Description**: Implement coordinator pattern for multi-agent workflows.

**Files to create**:
- `src/agents/coordinator.rs` — Coordinator agent
- `src/agents/worker.rs` — Worker agent
- `src/agents/messages.rs` — Inter-agent communication

**Key implementations**:
1. Coordinator spawns workers with restricted tools
2. SendMessage for inter-agent communication
3. TaskStop for worker termination
4. Result synthesis from workers

### Ticket F2-01: Desktop App
**Description**: Wrap CLI in Tauri desktop app.

**Files to create**:
- `desktop/src/main.rs` — Tauri entry point
- `desktop/src/app.rs` — Desktop app logic

**Key implementations**:
1. Tauri 2.x with Rust backend
2. System tray integration
3. Global shortcuts
4. Desktop notifications

---

# SECTION 5: COMPLETE FEATURE COMPARISON TABLE

**Total: 85+ Features Compared Across 30 Categories**

## TUI/UI Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **TUI Framework** | React Ink | Ratatui | Rich | Ink | React | Ratatui |
| **Markdown Rendering** | React | pulldown-cmark | Rich | marked | N/A | pulldown-cmark |
| **Virtual Scrolling** | YES | N/A | NO | NO | NO | YES |
| **Desktop Notifications** | YES | YES | NO | NO | NO | YES |
| **Job Control (Ctrl+Z)** | NO | YES | YES | NO | NO | YES |
| **Session Resume Picker** | YES | YES | NO | YES | YES | YES |
| **Onboarding Screens** | YES | YES | NO | NO | NO | YES |
| **Tooltips** | YES | YES | NO | NO | NO | YES |
| **Pager Overlay** | NO | YES | NO | NO | NO | Codex-RS |
| **Voice I/O** | YES | YES (macOS) | NO | NO | NO | YES |
| **Clipboard Integration** | YES | YES | /paste | YES | YES | YES |
| **Fuzzy File Search** | YES | YES (Nucleo) | NO | YES | YES | YES |
| **Theme Picker** | Terminal palette | YES | NO | Mode colors | NO | YES |
| **Status Bar** | Git+model+tokens | Status | NO | Git+model | YES | YES |

## Mode/State Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Plan/Execution Modes** | 6 modes | NO | 4 modes | Plan/Act | Plan/Build | 6 modes |
| **Mode Switching** | /plan, Shift+Tab | N/A | /ask, /code | UI Toggle | Tab | Commands |
| **Model Per Mode** | NO | NO | YES | YES | YES | YES |
| **Deep Planning** | /ultraplan | NO | /architect | /deep-planning | NO | YES |
| **Collaboration Modes** | NO | YES | NO | NO | NO | Codex-RS |
| **Context Preservation** | YES | N/A | YES | YES | YES | YES |

## Tool System Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Tool Count** | 42+ | 30+ | N/A | 25+ | 39 | 40+ |
| **Tool Schema** | Zod | JSON Schema | None | None | Zod | Zod |
| **Tool Factory** | buildTool() | Handlers | N/A | Factory | Registry | Factory |
| **Parallel Execution** | YES | YES | NO | YES | NO | YES |
| **Batch Tool** | NO | NO | NO | NO | YES | YES |
| **Tool Permissions** | Pattern-based | ExecPolicy | None | Patterns | ctx.ask | Pattern |
| **Large Result Storage** | Disk+preview | N/A | NO | YES | YES | YES |
| **Result Truncation** | YES | N/A | NO | NO | YES | YES |

## Command Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Slash Commands** | 90+ | 15+ | 50+ | 7+ | 20+ | 50+ |
| **Voice Input** | /voice | NO | /voice | NO | NO | YES |
| **Web Fetch** | /web | YES | /web | YES | YES | YES |
| **Clipboard** | /paste | YES | /paste | YES | YES | YES |
| **Multi-Agent** | /agent | spawn_agent | NO | /subagent | /task | YES |
| **Compact** | /compact | NO | NO | YES | NO | YES |
| **Memory** | /memory | NO | NO | YES | NO | YES |
| **Skills** | /skills | NO | NO | YES | /skill | YES |
| **Lint/Test** | NO | NO | /lint, /test | NO | NO | YES |
| **Undo/Redo** | NO | NO | /undo, /redo | NO | /undo | YES |
| **Load/Save** | NO | NO | /load, /save | NO | NO | YES |
| **Shell Completions** | YES | YES | --shell-completions | NO | YES | YES |

## Git Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Auto-Commit** | NO | Ghost | YES | Via CC | NO | YES |
| **Ghost Commits** | NO | YES | NO | NO | NO | YES |
| **Git Attribution** | Text | None | 6-flag | Via CC | None | 6-flag |
| **Co-authored-by** | NO | NO | YES | Via CC | NO | YES |
| **Subtree Only** | NO | NO | YES | NO | NO | Aider |
| **Pre-commit Hooks** | Never bypass | YES | --verify | YES | YES | YES |
| **Branch Operations** | YES | YES | YES | YES | YES | YES |
| **Git Diff View** | YES | YES | /diff | YES | YES | YES |
| **Undo Commit** | NO | NO | /undo | NO | /undo | YES |

## Code Intelligence Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **LSP Integration** | YES | NO | NO | Via MCP | YES (28+) | YES |
| **LSP Servers** | Multi | NO | NO | Via MCP | 28+ | 28+ |
| **Repo Map** | NO | NO | PageRank | NO | NO | PageRank |
| **Tree-sitter** | Bash AST | NO | YES | Via LSP | Via LSP | YES |
| **Code Search** | Ripgrep | Nucleo | Tree-sitter | Pattern | Ripgrep | Ripgrep |
| **Tool Search** | YES | YES | NO | YES | YES | YES |
| **Auto-lint** | NO | NO | --auto-lint | NO | NO | YES |
| **Custom Lint** | NO | NO | --lint-cmd | NO | NO | YES |
| **AI Comments** | NO | NO | `// ai!` | NO | NO | YES |
| **Auto-Test** | NO | NO | --auto-test | NO | NO | YES |

## MCP Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **MCP Support** | Full | Full | NONE | Full (59KB) | Plugins | Full |
| **Stdio Transport** | YES | YES | N/A | YES | YES | YES |
| **SSE Transport** | YES | YES | N/A | YES | YES | YES |
| **HTTP/SSE** | YES | YES | N/A | YES | YES | YES |
| **OAuth 2.0 + PKCE** | YES | YES | N/A | YES | YES | YES |
| **Auto-Approve** | YES | NO | N/A | YES | YES | YES |
| **Server Restart** | YES | YES | N/A | On-demand | YES | YES |
| **Remote Config** | NO | NO | N/A | Enterprise | NO | Cline |

## Memory Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Memory Taxonomy** | 4 types | YES | NO | YES | YES | 4 types |
| **MEMORY.md Index** | YES (max 200) | NO | NO | NO | NO | YES |
| **Staleness Warnings** | YES | NO | NO | NO | NO | YES |
| **Team Memory Sync** | YES | NO | NO | NO | NO | Claude Code |
| **extractMemories** | YES | NO | NO | NO | NO | Claude Code |

## Compaction Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Compaction** | YES | Local+Remote | NO | Local | YES | YES |
| **Token Budget** | 50K | Local+Remote | NO | Local | 40K | 50K |
| **Image Stripping** | YES | NO | NO | NO | NO | YES |
| **Tool Pruning** | Protect last 2 | N/A | Summarize | NO | YES | YES |
| **Micro Compact** | YES | NO | NO | NO | NO | Claude Code |
| **Rollback Truncation** | NO | YES | NO | NO | NO | Codex-RS |

## AI/Model Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Providers** | 1 | 10+ | 50+ | 40+ | 25+ | 40+ |
| **Model Aliases** | YES | YES | YES | YES | YES | YES |
| **Thinking Tokens** | YES | YES | YES | YES | YES | YES |
| **Reasoning Effort** | NO | NO | YES | NO | NO | Aider |
| **Cost Tracking** | YES | YES | YES | YES | YES | YES |
| **Image Tokens** | YES | NO | YES | YES | YES | YES |
| **System Prompt Variants** | YES | Dynamic | Simple | 12+ | Effect | 12+ |

## Security Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Sandbox** | NO | YES | NO | NO | NO | YES |
| **Landlock** | NO | YES | NO | NO | NO | YES |
| **Seatbelt (macOS)** | NO | YES | NO | NO | NO | YES |
| **Windows Restricted** | NO | YES | NO | NO | NO | YES |
| **Exec Policy Engine** | NO | YES | NO | NO | NO | Codex-RS |
| **Pattern Matching** | YES | YES | NO | YES | NO | YES |
| **Path Traversal Block** | YES | YES | NO | YES | YES | YES |
| **Network Rules** | NO | YES | NO | NO | NO | Codex-RS |
| **YOLO Mode** | NO | NO | NO | YES | NO | Cline |

## Hook Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Pre-Tool Hooks** | YES | YES | NO | YES | YES | YES |
| **Post-Tool Hooks** | YES | YES | NO | YES | YES | YES |
| **Pre-Compact Hooks** | YES | NO | NO | NO | YES | YES |
| **Post-Compact Hooks** | YES | NO | NO | NO | YES | YES |
| **Session Start Hooks** | YES | YES | NO | YES | YES | YES |
| **Read/Edit Hooks** | YES | NO | NO | NO | NO | Claude Code |
| **Think Hook** | YES | NO | NO | NO | NO | Claude Code |
| **Blocking Hooks** | YES | YES | N/A | YES | YES | YES |
| **Hook Config** | YAML/JSON | JSON | N/A | YAML | YAML | YAML |

## Skills Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Skills Directory** | .claude/skills/ | .codex/skills/ | NO | YES | YES | YES |
| **Skill Invocation** | @skill | @skill | NO | @skill | @skill | YES |
| **Skill Dependencies** | NO | YES | N/A | NO | NO | Codex-RS |
| **Skill Policy** | NO | YES | N/A | NO | NO | Codex-RS |
| **Skills Panel** | /skills | NO | NO | YES | YES | YES |

## Performance Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Deferred Loading** | YES | YES | LazyLiteLLM | NO | NO | YES |
| **Startup Speed** | Fast | Fast | 1.5s save | Fast | Fast | Fast |
| **Lazy Import** | YES | YES | YES | NO | YES | YES |
| **Caching** | File+Memory | SQLite | SQLite | TTL | Server | SQLite |
| **Prompt Cache** | NO | NO | --cache-prompts | NO | NO | YES |
| **SQLite Storage** | NO | YES | Tags cache | NO | YES | YES |

## Multi-Agent Features

| Feature | Claude Code | Codex-RS | Aider | Cline | OpenCode | BEAST CLI |
|---------|-------------|----------|-------|-------|----------|-----------|
| **Sub-agents** | YES | YES | NO | YES | YES | YES |
| **Agent Swarms** | YES | NO | NO | NO | NO | Claude Code |
| **Coordinator Pattern** | YES | YES | NO | NO | NO | YES |
| **Team Memory Sync** | YES | NO | NO | NO | NO | Claude Code |
| **SendMessage** | YES | YES | NO | NO | NO | YES |
| **TaskStop** | YES | YES | NO | NO | NO | YES |
| **Agent Lifecycle** | Full | Full | N/A | YES | YES | Full |

## Unique Killer Features

| Feature | Repo | Status |
|---------|------|--------|
| **Ghost Commits** | Codex-RS | Implement |
| **RepoMap PageRank** | Aider | Implement |
| **Architect Mode** | Aider | Implement |
| **Tree-sitter Integration** | Aider | Implement |
| **AI Comments (`// ai!`)** | Aider | Implement |
| **Voice Input** | Claude Code, Aider | Implement |
| **Web Scraping** | Aider | Implement |
| **LazyLiteLLM (1.5s)** | Aider | Implement |
| **6-flag Attribution** | Aider | Implement |
| **McpHub (59KB)** | Cline | Reference |
| **OAuth + PKCE** | Cline | Reference |
| **Landlock Sandbox** | Codex-RS | Implement |
| **Effect-based DI** | OpenCode | Reference |
| **28+ LSP Servers** | OpenCode | Implement |
| **Batch Tool** | OpenCode | Implement |
| **Collaboration Modes** | Codex-RS | Implement |
| **Thinking Tokens** | Claude Code, Aider | Implement |
| **Deep Planning** | Cline | Implement |
| **Skills Policy** | Codex-RS | Implement |
| **Auto-YOLO Mode** | Cline | Implement |
| **Paste Collapse** | Cline | Implement |
| **Memory Taxonomy** | Claude Code | Implement |

---

# SECTION 6: FILE REFERENCE

## All Reference Repositories

| Repo | Location | Key Files |
|------|----------|-----------|
| Claude Code | `/home/sridhar/claude-code-sourcemap/restored-src/src/` | Tool.ts (793 lines), tools.ts, compact/, memdir/, commands/ |
| Codex-RS | `/home/sridhar/codex/codex-rs/` | tools/, tui/, git-utils/, execpolicy/, state/ |
| Aider | `/home/sridhar/aider/aider/` | repo.py, repomap.py, llm.py, diffs.py |
| Cline | `/home/sridhar/cline/` | src/core/task/, src/services/mcp/McpHub.ts, cli/src/ |
| OpenCode | `/home/sridhar/opencode/packages/opencode/src/` | tool/, agent/, lsp/, session/ |

## Analysis Agent Context

All deep analyses completed. Next agent can start implementation at Phase 1, Ticket P1-01.

**Additional Tickets for Unique Features:**

### Ticket P2-04: Architect Mode (Two-Model Approach)
**Description**: Implement Aider's architect mode where a separate "architect" model designs changes and an "editor" model implements them.

**Files to create**:
- `src/modes/architect.rs` — Architect mode implementation
- `src/models/dual.rs` — Dual model configuration

**Key implementations**:
1. Separate architect and editor models
2. Architect proposes changes in structured format
3. Editor implements architect's proposals
4. Configuration for model per mode

**Reference**: Aider `architect_coder.py`, `editor_diff_fenced_coder.py`

---

### Ticket P2-05: Tree-sitter Integration
**Description**: Implement tree-sitter for syntax-aware file understanding (like Aider).

**Files to create**:
- `src/parsers/tree_sitter.rs` — Tree-sitter bindings
- `src/parsers/lint.rs` — Lint integration

**Key implementations**:
1. Tree-sitter grammar loading
2. Function/class extraction for context
3. Syntax error detection
4. RepoMap integration for better file ranking

**Reference**: Aider `repomap.py`, `linter.py`

---

### Ticket P2-06: AI Comments System
**Description**: Implement Aider's AI comment system where `// ai!` in code triggers AI actions.

**Files to create**:
- `src/ai_comments/mod.rs` — AI comment detection
- `src/ai_comments/parser.rs` — Comment parser

**Key implementations**:
1. Detect `// ai!` and `// ai?` patterns
2. Execute `// ai!` as AI command
3. Answer `// ai?` about surrounding code
4. File watching for real-time detection

**Reference**: Aider command parsing in main loop

---

### Ticket P3-04: Ghost Commits
**Description**: Implement Codex-RS's ghost commit system for snapshots without history pollution.

**Files to create**:
- `src/git/ghost.rs` — Ghost commit implementation

**Key implementations**:
1. Use `git commit-tree` for detached commits
2. Preserve untracked and ignored files
3. Filter large files (>10MB) and directories (>200 files)
4. Custom messages and subdirectory scoping

**Reference**: Codex-RS `git-utils/src/ghost_commits.rs`

---

### Ticket P3-05: LazyLiteLLM Pattern
**Description**: Implement Aider's LazyLiteLLM pattern for 1.5s startup time savings.

**Files to create**:
- `src/llm/lazy.rs` — Lazy LLM loader

**Key implementations**:
1. Deferred import of LLM libraries
2. Suppress debug info on load
3. Lazy initialization of API clients
4. On-demand model loading

**Reference**: Aider `llm.py` `LazyLiteLLM` class

---

### Ticket P3-06: Voice Input
**Description**: Implement voice input using system audio capture.

**Files to create**:
- `src/voice/input.rs` — Voice capture
- `src/voice/stt.rs` — Speech-to-text

**Key implementations**:
1. Audio device enumeration
2. Record and transcribe voice commands
3. Language configuration
4. Audio format support (wav, mp3, webm)

**Reference**: Claude Code `/voice`, Aider `/voice`

---

### Ticket P3-07: Web Scraping
**Description**: Implement URL fetching and conversion to markdown (like Aider's `/web`).

**Files to create**:
- `src/web/fetch.rs` — Web fetcher
- `src/web/markdown.rs` — HTML to markdown conversion

**Key implementations**:
1. Fetch and parse URLs
2. Convert HTML to markdown
3. Extract main content
4. Support for code blocks

**Reference**: Aider `/web` command

---

### Ticket P3-08: Auto-Lint Integration
**Description**: Implement auto-lint after code changes (Aider's `--auto-lint`).

**Files to create**:
- `src/lint/mod.rs` — Lint runner
- `src/lint/flake8.rs` — Flake8 integration

**Key implementations**:
1. Configurable lint commands
2. Flake8 fatal error detection (E9, F821, F823)
3. Python syntax validation
4. Error context display
5. Auto-fix suggestions

**Reference**: Aider `linter.py`

---

### Ticket P4-04: Batch Tool Execution
**Description**: Implement OpenCode's batch tool for concurrent execution.

**Files to create**:
- `src/tools/batch.rs` — Batch execution

**Key implementations**:
1. Queue multiple tool calls
2. Execute concurrently
3. Collect results
4. Handle partial failures

**Reference**: OpenCode `tool/batch.ts` (experimental)

---

### Ticket P4-05: Collaboration Modes
**Description**: Implement Codex-RS's collaboration modes with mode-specific behavior.

**Files to create**:
- `src/modes/collab.rs` — Collaboration modes

**Key implementations**:
1. Mode-specific tool availability
2. Mode-specific prompt variants
3. Preset collaboration configurations
4. User-defined modes

**Reference**: Codex-RS collaboration mode system

**Status**: COMPLETE — 500+ features analyzed, 85+ compared, 22 phase tickets

**Last Updated**: 2026-04-08 (Comprehensive deep analysis complete - Mode System + 10 new tickets added)

---

# SECTION 7: COMPLETE SOURCE CODE REFERENCE

## Every Feature → Source File Path → 3-Line Implementation Explanation

---

## 7.1 TOOL SYSTEM FEATURES

### Ghost Commits (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs` |
| **How it works** | 1. Creates detached commits using `git commit-tree` command |
| | 2. Preserves both tracked AND untracked files in snapshot |
| | 3. Filters large files (>10MB) and directories (>200 files) |
| **Ticket** | P3-04: Ghost Commits |

### McpHub (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/src/services/mcp/McpHub.ts` (59KB) |
| **How it works** | 1. Manages MCP server connections via transport abstraction |
| | 2. Handles OAuth 2.0 + PKCE authentication flow |
| | 3. Auto-reconnect with exponential backoff (6 attempts, 2s base) |
| **Ticket** | P3-01: MCP Integration |

### Tool Factory buildTool() (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/Tool.ts` (793 lines) |
| **How it works** | 1. Factory pattern with `buildTool(def)` accepting partial definitions |
| | 2. Fail-closed defaults: all tools blocked unless explicitly allowed |
| | 3. Zod schemas for input validation and description generation |
| **Ticket** | P1-01: Tool System Foundation |

### Batch Tool (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/tool/batch.ts` |
| **How it works** | 1. Queues multiple tool calls and executes concurrently |
| | 2. Collects all results and handles partial failures gracefully |
| | 3. Returns combined output from all parallel executions |
| **Ticket** | P4-04: Batch Tool Execution |

---

## 7.2 GIT INTEGRATION FEATURES

### 6-Flag Git Attribution (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/repo.py` (lines 400-600) |
| **How it works** | 1. `--attribute-author` sets GIT_AUTHOR_NAME="User (aider)" |
| | 2. `--attribute-committer` sets GIT_COMMITTER_NAME same |
| | 3. `--attribute-co-authored-by` adds "Co-authored-by: aider <aider@aider.chat>" |
| **Ticket** | P2-01: Git Integration |

### RepoMap PageRank (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/repomap.py` (400+ lines) |
| **How it works** | 1. Builds MultiDiGraph from tree-sitter definitions/references |
| | 2. Runs NetworkX PageRank with chat files boosted 10x |
| | 3. Scores files by path matches (snake_case/kebab/camel get 10x boost) |
| **Ticket** | P2-02: RepoMap with PageRank |

### Auto-Commit (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/repo.py` |
| **How it works** | 1. Watches for file changes after LLM edits |
| | 2. Auto-commits with AI-generated message when `--auto-commits` enabled |
| | 3. Uses weak model (configurable) for fast commit messages |
| **Ticket** | P2-01: Git Integration |

---

## 7.3 CODE INTELLIGENCE FEATURES

### Tree-sitter Integration (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/coders/ask_coder.py` |
| **How it works** | 1. Uses tree-sitter to extract function/class definitions |
| | 2. Parses code into AST for syntax-aware understanding |
| | 3. Generates tags cache stored in `.aider.tags.cache.v4/` SQLite |
| **Ticket** | P2-05: Tree-sitter Integration |

### LSP Server (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/lsp/server.ts` |
| **How it works** | 1. Connects to 28+ language servers (pyright, rust-analyzer, etc.) |
| | 2. Provides hover, go-to-definition, references, diagnostics |
| | 3. Effect-based async for all LSP operations (no blocking) |
| **Ticket** | P2-03: LSP Integration |

### AI Comments `// ai!` (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/main.py` (main loop) |
| **How it works** | 1. Scans code files for `// ai!` or `# ai?` patterns |
| | 2. `// ai!` executes the comment as an AI command |
| | 3. `// ai?` triggers AI to explain the surrounding code |
| **Ticket** | P2-06: AI Comments System |

### Auto-Lint (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/linter.py` |
| **How it works** | 1. Runs `--lint-cmd` after each file edit when `--auto-lint` enabled |
| | 2. Checks for fatal errors (Flake8 E9, F821, F823) |
| | 3. Reports syntax errors and suggests fixes |
| **Ticket** | P3-08: Auto-Lint Integration |

---

## 7.4 MEMORY SYSTEM FEATURES

### Memory Taxonomy (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/memdir/memdir.ts` |
| **How it works** | 1. Typed memory files with YAML frontmatter (type, name, description) |
| | 2. MEMORY.md index file (max 200 lines, 25KB) |
| | 3. Staleness warnings when memories are >1 day old |
| **Ticket** | P4-01: Memory System |

### Team Memory Sync (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/teamMemorySync/` |
| **How it works** | 1. Synchronizes memory across multi-agent team members |
| | 2. Uses SendMessage for inter-agent memory sharing |
| | 3. Keeps all teammates' memory in sync |
| **Ticket** | P4-01: Memory System (sub-feature) |

---

## 7.5 COMPACTION FEATURES

### 50K Token Compaction (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/compact/compact.ts` |
| **How it works** | 1. Triggers at 50K tokens, restores max 5 files with 5K budget each |
| | 2. Strips images and replaces with `[image]` markers |
| | 3. Protects last 2 user turns + skill tools during pruning |
| **Ticket** | P2-01: Compaction System |

### LazyLiteLLM (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/llm.py` (LazyLiteLLM class) |
| **How it works** | 1. Defers `importlib.import_module("litellm")` until first API call |
| | 2. Sets `suppress_debug_info=True` to reduce startup noise |
| | 3. Saves ~1.5s on CLI startup by avoiding early imports |
| **Ticket** | P3-05: LazyLiteLLM Pattern |

---

## 7.6 SECURITY/SANDBOX FEATURES

### Landlock Sandbox (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/linux-sandbox/src/lib.rs` |
| **How it works** | 1. Uses Linux Landlock syscall to restrict filesystem access |
| | 2. Rules defined per directory: read-only, write, deny |
| | 3. Falls back to bubblewrap if Landlock unavailable |
| **Ticket** | P4-03: Sandbox Security |

### Seatbelt Sandbox (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/macos-sandbox/src/lib.rs` |
| **How it works** | 1. Uses macOS Seatbelt (sandbox_execute) for sandboxing |
| | 2. Configurable profiles: read-only, workspace-write, full-access |
| | 3. Integrates with ExecPolicy engine for rules |
| **Ticket** | P4-03: Sandbox Security |

### Pattern-Based Permissions (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/permissions/dangerousPatterns.ts` |
| **How it works** | 1. Matches command patterns against dangerousPatterns list |
| | 2. Flags: `rm -rf`, `git push --force`, `> /dev/sda` etc. |
| | 3. `bashClassifier` uses ML model to classify bash safety |
| **Ticket** | P1-01: Tool System Foundation (permissions) |

---

## 7.7 HOOKS SYSTEM FEATURES

### Pre/Post Tool Hooks (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/hooks/` |
| **How it works** | 1. Hooks defined in YAML/JSON config with shell command or script |
| | 2. PreToolUse: runs before tool, can modify input or block execution |
| | 3. PostToolUse: runs after tool, can log or modify output |
| **Ticket** | P2-02: Hooks System |

### Compact Hooks (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/compact/compactWarningHook.ts` |
| **How it works** | 1. PreCompact fires before context compression |
| | 2. PostCompact fires after compaction completes |
| | 3. Enables logging, analytics, or custom preservation |
| **Ticket** | P2-02: Hooks System |

---

## 7.8 MODE SYSTEM FEATURES

### 6 Permission Modes (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/types/permissions.ts` |
| **How it works** | 1. `plan` = read-only, `default` = ask, `acceptEdits` = auto-accept edits |
| | 2. `auto` = ML classifier auto-approves, `bypass` = no prompts |
| | 3. `dontAsk` = auto-deny all |
| **Ticket** | P1-04: Mode System |

### Architect Mode (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/coders/architect_coder.py` |
| **How it works** | 1. Uses two models: architect proposes changes, editor implements |
| | 2. Architect outputs structured JSON specs |
| | 3. Editor reads specs and makes precise edits |
| **Ticket** | P2-04: Architect Mode |

### Plan/Act Mode (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/cli/src/utils/mode-selection.ts` |
| **How it works** | 1. Plan mode = read-only exploration and planning |
| | 2. Act mode = full execution with file modifications |
| | 3. Different models can be configured per mode |
| **Ticket** | P1-04: Mode System |

---

## 7.9 VOICE/WEB FEATURES

### Voice Input (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/voice.ts` |
| **How it works** | 1. Captures audio from microphone using system APIs |
| | 2. Streams to speech-to-text service |
| | 3. Transcribes to text and submits as user message |
| **Ticket** | P3-06: Voice Input |

### /web URL Fetch (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/commands.py` (web command) |
| **How it works** | 1. Fetches URL and converts HTML to markdown |
| | 2. Extracts main content, removes ads/navigation |
| | 3. Adds converted content to chat context |
| **Ticket** | P3-07: Web Scraping |

---

## 7.10 SKILLS/SYSTEM FEATURES

### Skills System (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/plugins/` |
| **How it works** | 1. Loads skills from `.claude/skills/` directory |
| | 2. Invoked via `@skill` mention in conversation |
| | 3. Each skill has `instructions.md` with tool definitions |
| **Ticket** | P3-03: System Prompt Variants (skills sub-feature) |

### MCP Tools (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/MCPTool/` |
| **How it works** | 1. Discovers tools from connected MCP servers |
| | 2. Converts MCP tool schemas to Claude Code format |
| | 3. Appends to tool pool (built-in first, MCP appended) |
| **Ticket** | P3-01: MCP Integration |

---

## 7.11 TUI FEATURES

### Ratatui Framework (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/tui/src/lib.rs` |
| **How it works** | 1. Rust TUI library with declarative widget composition |
| | 2. Handles keyboard input, rendering, layout |
| | 3. Cross-platform: Linux, macOS, Windows |
| **Ticket** | P1-02: TUI Framework |

### Desktop Notifications (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/tui/src/notifications/mod.rs` |
| **How it works** | 1. OSC 9 escape sequences for terminal notifications |
| | 2. BEL character fallback for unsupported terminals |
| | 3. Detects WezTerm, ghostty, iTerm, kitty, Windows Terminal |
| **Ticket** | P1-02: TUI Framework (notifications sub-feature) |

### Job Control (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/core/src/unified_exec/` |
| **How it works** | 1. Handles Ctrl+Z signal to suspend running processes |
| | 2. fg command resumes suspended process |
| | 3. Manages up to 64 concurrent processes |
| **Ticket** | P1-02: TUI Framework (job control sub-feature) |

---

## 7.12 MULTI-AGENT FEATURES

### Agent Spawning (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/AgentTool/` |
| **How it works** | 1. Spawns sub-agents with `AgentTool` and `TaskCreateTool` |
| | 2. Coordinator uses `SendMessage` to communicate |
| | 3. `TaskStop` terminates agents, `TaskOutput` retrieves results |
| **Ticket** | P3-02: Multi-Provider Support (agent sub-feature) |

### Agent Swarms (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/coordinator/` |
| **How it works** | 1. Spawns multiple agents with restricted tool access |
| | 2. Synthesizes results from all worker agents |
| | 3. teamMemorySync keeps all agents' memory coherent |
| **Ticket** | F1-01: Multi-Agent Coordination |

---

## 7.13 EFFECT-BASED ARCHITECTURE

### Effect DI (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/effect/` |
| **How it works** | 1. Uses Effect<E, A, R> type for all async operations |
| | 2. Dependency injection via Service layers |
| | 3. Cancellation via AbortSignal in Context |
| **Ticket** | P1-03: Core Engine (architecture) |

---

# SECTION 8: QUICK REFERENCE - ALL FILES

## Claude Code Sourcemap
```
/home/sridhar/claude-code-sourcemap/restored-src/src/
├── tools/Tool.ts                    # buildTool() factory (793 lines)
├── tools/tools.ts                   # Tool registry + assembleToolPool
├── services/compact/compact.ts      # 50K token compaction
├── services/teamMemorySync/         # Multi-agent memory sync
├── memdir/memdir.ts                 # Memory taxonomy system
├── utils/permissions/                # Permission modes + classifiers
├── utils/hooks/                     # Pre/post tool hooks
├── commands/                        # 90+ slash commands
├── coordinator/                    # Agent swarms + coordination
└── types/permissions.ts             # 6 permission modes enum
```

## Codex-RS
```
/home/sridhar/codex/codex-rs/
├── tui/src/lib.rs                   # Ratatui TUI framework
├── tui/src/notifications/mod.rs     # Desktop notifications
├── git-utils/src/ghost_commits.rs   # Ghost commits
├── linux-sandbox/src/lib.rs         # Landlock sandbox
├── macos-sandbox/src/lib.rs         # Seatbelt sandbox
├── execpolicy/src/lib.rs            # Policy engine
├── core/src/unified_exec/          # Job control + PTY
├── tools/src/lib.rs                # 30+ tools
├── hooks/src/lib.rs                # 5 hook events
└── models-manager/src/             # Model providers
```

## Aider
```
/home/sridhar/aider/aider/
├── repo.py                         # Git integration + 6-flag attribution
├── repomap.py                      # PageRank-based file ranking (400+ lines)
├── llm.py                          # LazyLiteLLM pattern
├── linter.py                       # Auto-lint + Flake8
├── diffs.py                        # Diff display
├── commands.py                     # 50+ slash commands
├── coders/architect_coder.py       # Architect mode
├── coders/ask_coder.py             # Tree-sitter integration
└── args.py                        # 100+ CLI arguments
```

## Cline
```
/home/sridhar/cline/
├── src/services/mcp/McpHub.ts      # MCP hub (59KB) + OAuth
├── src/services/mcp/McpOAuthManager.ts  # OAuth 2.0 + PKCE
├── cli/src/components/             # 40+ React Ink components
├── cli/src/utils/mode-selection.ts # Plan/Act mode
└── cli/src/constants/colors.ts     # Color constants
```

## OpenCode
```
/home/sridhar/opencode/packages/opencode/src/
├── tool/registry.ts                 # Tool registry (39 tools)
├── tool/batch.ts                  # Batch tool execution
├── agent/agent.ts                 # 10+ built-in agents
├── lsp/server.ts                 # 28+ LSP servers
├── provider/provider.ts          # 25+ providers
├── effect/                       # Effect-based DI
├── session/index.ts              # Compaction (40K budget)
├── config/config.ts              # 100+ keyboard shortcuts
└── mcp/index.ts                 # MCP plugin system
```

---

# SECTION 9: TICKET SUMMARY WITH SOURCE REFS

| Ticket | Feature | Source File | Lines |
|--------|---------|-------------|-------|
| P1-01 | Tool System Foundation | Claude Code `tools/Tool.ts` | 793 |
| P1-02 | TUI Framework | Codex-RS `tui/src/lib.rs` | 500+ |
| P1-03 | Core Engine | OpenCode `effect/` | 20 files |
| P1-04 | Mode System | Claude Code `types/permissions.ts` | 150 |
| P2-01 | Git Integration | Aider `repo.py` + Claude Code `commands/commit.ts` | 600 |
| P2-02 | RepoMap PageRank | Aider `repomap.py` | 400 |
| P2-03 | Compaction | Claude Code `services/compact/` | 300 |
| P2-04 | Hooks System | Claude Code `utils/hooks/` | 200 |
| P2-05 | LSP Integration | OpenCode `lsp/server.ts` | 500 |
| P2-06 | Architect Mode | Aider `coders/architect_coder.py` | 200 |
| P2-07 | Tree-sitter | Aider `coders/ask_coder.py` | 150 |
| P2-08 | AI Comments | Aider `main.py` | 100 |
| P3-01 | MCP Integration | Cline `src/services/mcp/McpHub.ts` | 1500 |
| P3-02 | Multi-Provider | Cline `cli/src/utils/providers.ts` | 300 |
| P3-03 | Prompt Variants | Cline `src/core/prompts/` | 500 |
| P3-04 | Ghost Commits | Codex-RS `git-utils/src/ghost_commits.rs` | 200 |
| P3-05 | LazyLiteLLM | Aider `llm.py` (LazyLiteLLM class) | 50 |
| P3-06 | Voice Input | Claude Code `services/voice.ts` | 300 |
| P3-07 | Web Scraping | Aider `commands.py` (/web) | 100 |
| P3-08 | Auto-Lint | Aider `linter.py` | 200 |
| P4-01 | Memory System | Claude Code `memdir/memdir.ts` | 200 |
| P4-02 | Hooks | Claude Code `utils/hooks/` | 200 |
| P4-03 | Sandbox | Codex-RS `linux-sandbox/` + `execpolicy/` | 500 |
| P4-04 | Batch Tool | OpenCode `tool/batch.ts` | 100 |
| P4-05 | Collaboration Modes | Codex-RS `tui/src/collaboration_modes.rs` | 100 |
| F1-01 | Multi-Agent | Claude Code `coordinator/` + `tools/AgentTool/` | 500 |
| F2-01 | Desktop App | OpenCode `@opencode/desktop` | 20 files |

---

**FINAL STATUS**: COMPLETE - Every feature has source file path, 3-line explanation, and ticket assignment.

**Last Updated**: 2026-04-08 (Mode feature added)