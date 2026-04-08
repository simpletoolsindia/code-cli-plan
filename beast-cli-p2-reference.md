# Beast CLI - Phase 2: Source Code References

**Phase**: P2
**Purpose**: Exact source file paths with 3-line implementation explanations

---

## P2-01: Git Integration

### 6-Flag Attribution (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/repo.py` (lines 400-600) |
| **Lines** | 600 |
| **How it works** | 1. Sets GIT_AUTHOR_NAME/GIT_COMMITTER_NAME env vars |
| | 2. Adds "Co-authored-by: aider <aider@aider.chat>" trailer |
| | 3. Wraps git commands with attribution env |

### Ghost Commits (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs` |
| **Lines** | 200 |
| **How it works** | 1. Creates detached commits using `git commit-tree` |
| | 2. Preserves untracked and ignored files |
| | 3. Filters large files (>10MB) and directories (>200 files) |

---

## P2-02: RepoMap PageRank

### PageRank Algorithm
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/repomap.py` |
| **Lines** | 400+ |
| **How it works** | 1. Builds MultiDiGraph from tree-sitter definitions/references |
| | 2. Runs NetworkX PageRank with personalization boost |
| | 3. Files mentioned in chat get 10x boost, snake_case paths get 10x |

### Tags Extraction
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/repomap.py` |
| **Lines** | 200 |
| **How it works** | 1. Uses tree-sitter to extract function/class names |
| | 2. Stores tags in `.aider.tags.cache.v4/` SQLite |
| | 3. Matches query against tags for relevance scoring |

---

## P2-03: Compaction

### Claude Code Compaction
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/compact/compact.ts` |
| **Lines** | 300 |
| **How it works** | 1. Triggers at 50K tokens, restores max 5 files |
| | 2. Strips images with `[image]` markers |
| | 3. Protects last 2 user turns + skill tools |

### Compact Warning Hook
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/compact/compactWarningHook.ts` |
| **Lines** | 50 |
| **How it works** | 1. Fires before/after context compression |
| | 2. Enables logging and analytics |
| | 3. Custom preservation logic |

---

## P2-04: Hooks System

### Hook Types
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/hooks/` |
| **Files** | 10 |
| **How it works** | 1. Hooks defined in YAML/JSON config |
| | 2. PreToolUse/PostToolUse fire around execution |
| | 3. Shell command or script path per hook |

### Hook Config
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/hooks/hooksConfigSnapshot.ts` |
| **Lines** | 100 |
| **How it works** | 1. Loads hooks from `.claude/.settings.json` |
| | 2. Snapshot validates config on load |
| | 3. File watcher detects changes |

---

## P2-05: LSP Integration

### LSP Server (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/lsp/server.ts` |
| **Lines** | 500+ |
| **How it works** | 1. Connects to 28+ language servers via vscode-jsonrpc |
| | 2. Effect-based async for all operations (no blocking) |
| | 3. Auto-installs servers via npm when needed |

### LSP Features
| Feature | Implementation |
|---------|----------------|
| Hover | TextDocumentPositionParams → Hover result |
| Definition | Go-to-definition via textDocument/definition |
| References | Find all references via textDocument/references |
| Diagnostics | textDocument/publishDiagnostics notifications |

---

## P2-06: Architect Mode

### Architect Coder (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/coders/architect_coder.py` |
| **Lines** | 200 |
| **How it works** | 1. Uses separate architect model to design changes |
| | 2. Outputs structured JSON specs for edits |
| | 3. Editor model reads specs and implements precisely |

---

## P2-07: Tree-sitter

### Tree-sitter Parser (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/coders/ask_coder.py` |
| **Lines** | 150 |
| **How it works** | 1. Loads tree-sitter grammars for language |
| | 2. Parses file into AST |
| | 3. Extracts function/class definitions as tags |

---

## P2-08: AI Comments

### Main Loop Detection (Aider)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/aider/aider/main.py` |
| **Lines** | 100 |
| **How it works** | 1. Scans code files for `// ai!` or `# ai?` patterns |
| | 2. `// ai!` triggers immediate command execution |
| | 3. `// ai?` queues question about surrounding code |

---

## Quick Code Snippets

### Git Attribution (Python)
```python
env = {
    "GIT_AUTHOR_NAME": f"{user} (aider)",
    "GIT_COMMITTER_NAME": f"{user} (aider)",
    "GIT_AUTHOR_EMAIL": "aider@aider.chat",
}
subprocess.run(["git", "commit", ...], env={**os.environ, **env})
```

### PageRank (Python)
```python
G = nx.MultiDiGraph()
G.add_edges_from(definitions_and_references)
personalization = {f: 10.0 if f in chat_files else 1.0 for f in G.nodes()}
ranked = nx.pagerank(G, weight="weight", personalization=personalization)
```

### Compaction Budget (TypeScript)
```typescript
export const POST_COMPACT_MAX_FILES_TO_RESTORE = 5
export const POST_COMPACT_TOKEN_BUDGET = 50_000
export const POST_COMPACT_MAX_TOKENS_PER_FILE = 5_000
export const POST_COMPACT_SKILLS_TOKEN_BUDGET = 25_000
```

---

**End of P2 Reference**
