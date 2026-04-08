# Beast CLI - Phase 3: Source Code References

**Phase**: P3
**Purpose**: Exact source file paths with 3-line implementation explanations

---

## P3-01: MCP Integration

### McpHub (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/src/services/mcp/McpHub.ts` |
| **Lines** | 1500+ (59KB) |
| **How it works** | 1. Manages MCP server connections via transport abstraction |
| | 2. Handles OAuth 2.0 + PKCE with CSRF protection |
| | 3. Auto-reconnect with exponential backoff (6 attempts, 2s base) |

### OAuth Manager
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/src/services/mcp/McpOAuthManager.ts` |
| **Lines** | 500+ |
| **How it works** | 1. PKCE flow with code verifier and challenge |
| | 2. Token storage with expiration tracking |
| | 3. Redirect URL resolution for port stability |

### Transport Selection
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/src/services/mcp/types.ts` |
| **Lines** | 100 |
| **How it works** | 1. Configurable via `type` field (stdio/sse/streamableHttp) |
| | 2. Env var expansion `${env:VAR}` in URLs |
| | 3. Legacy support for `transportType` field |

---

## P3-02: Multi-Provider

### Provider Utils (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/cli/src/utils/providers.ts` |
| **Lines** | 300 |
| **How it works** | 1. Factory creates handler from provider ID |
| | 2. Unified interface for all providers |
| | 3. Model family detection for prompt variants |

### Provider List
| Provider | Status |
|----------|---------|
| anthropic | Supported |
| openai-codex | OAuth |
| bedrock | Custom ARN |
| openrouter | 100+ models |
| ollama | Local |
| gemini | Supported |
| groq | Fast inference |

---

## P3-03: Prompt Variants

### System Prompts (Cline)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/cline/src/core/prompts/` |
| **Files** | 20+ |
| **How it works** | 1. Builder pattern for variant configuration |
| | 2. Component overrides per variant |
| | 3. Tool list differs by model family |

---

## P3-04: Ghost Commits

### Ghost Commits (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs` |
| **Lines** | 200 |
| **How it works** | 1. Creates detached commits using `git commit-tree` |
| | 2. Filters large files (>10MB) and directories (>200 files) |
| | 3. Ignores: node_modules, .venv, dist, etc. |

---

## P3-05: LazyLiteLLM

### LazyLiteLLM (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/llm.py` |
| **Lines** | 50 (LazyLiteLLM class) |
| **How it works** | 1. Defers `importlib.import_module("litellm")` until first call |
| | 2. Sets `suppress_debug_info=True` to reduce noise |
| | 3. Saves ~1.5s on CLI startup |

---

## P3-06: Voice Input

### Voice Service (Claude Code)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/voice.ts` |
| **Lines** | 300 |
| **How it works** | 1. Captures audio from microphone via system APIs |
| | 2. Streams to speech-to-text service |
| | 3. Submits transcribed text as user message |

---

## P3-07: Web Scraping

### /web Command (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/commands.py` |
| **Lines** | 100 |
| **How it works** | 1. Fetches URL and parses HTML |
| | 2. Converts to markdown, preserves code blocks |
| | 3. Adds converted content to chat context |

---

## P3-08: Auto-Lint

### Linter (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/linter.py` |
| **Lines** | 200 |
| **How it works** | 1. Runs `--lint-cmd` after file edits when enabled |
| | 2. Checks for fatal errors (Flake8 E9, F821, F823) |
| | 3. Reports syntax errors with context |

---

**End of P3 Reference**
