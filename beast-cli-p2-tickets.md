# Beast CLI - Phase 2: Intelligence Tickets

**Phase**: P2
**Focus**: Git Integration, RepoMap, Compaction, Hooks, LSP, Architect Mode, Tree-sitter, AI Comments
**Tickets**: 8 (P2-01 through P2-08)
**Timeline**: Week 3-4

---

## P2-01: Git Integration

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Implement git integration with Aider-style 6-flag attribution and Claude Code safety protocol.

### Files to Create
```
src/
├── git/
│   ├── mod.rs              # Git entry
│   ├── repo.rs             # Repo operations
│   ├── commit.rs           # Commit with attribution
│   ├── diff.rs             # Diff generation
│   ├── ghost.rs             # Ghost commits
│   └── branch.rs           # Branch utilities
```

### Key Implementations
1. **6-Flag Attribution**:
   - `--attribute-author` → GIT_AUTHOR_NAME="User (aider)"
   - `--attribute-committer` → GIT_COMMITTER_NAME
   - `--attribute-co-authored-by` → Co-authored-by trailer
2. Ghost commits for snapshots without history pollution
3. Auto-commit with AI-generated messages
4. Git diff viewing with syntax highlighting
5. Pre-commit hook respect (never bypass)

### How to Test
- Create commit with attribution flags
- Verify co-authored-by trailer appears
- Test ghost commit doesn't pollute history
- Verify pre-commit hooks run

### Acceptance Criteria
- [ ] 6-flag attribution works correctly
- [ ] Co-authored-by trailer in commits
- [ ] Ghost commits create snapshots
- [ ] Pre-commit hooks respected

### Reference
- Aider: `/home/sridhar/aider/aider/repo.py`
- Codex-RS: `/home/sridhar/codex/codex-rs/git-utils/src/ghost_commits.rs`

---

## P2-02: RepoMap with PageRank

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement Aider's PageRank-based codebase understanding for intelligent file selection.

### Files to Create
```
src/
├── repomap/
│   ├── mod.rs              # RepoMap entry
│   ├── pagerank.rs         # PageRank algorithm
│   ├── parser.rs           # Tree-sitter extraction
│   └── cache.rs             # SQLite cache
```

### Key Implementations
1. Build MultiDiGraph from tree-sitter definitions/references
2. Run NetworkX-style PageRank with personalization
3. Boost chat-mentioned files 10x
4. Boost snake_case/kebab/camel path matches 10x
5. Return ranked file list for context injection

### How to Test
- Run `/map` command
- Verify relevant files ranked higher
- Test boost for mentioned files
- Verify cache stores tags

### Acceptance Criteria
- [ ] PageRank ranks relevant files higher
- [ ] Chat mentions boost file priority
- [ ] Naming pattern matches boost
- [ ] Tags cache persists

### Reference
- Aider: `/home/sridhar/aider/aider/repomap.py` (400+ lines)
- Tree-sitter: `/home/sridhar/aider/aider/coders/ask_coder.py`

---

## P2-03: Compaction System

**Status**: TODO
**Priority**: P0 (Critical)

### Description
Implement context compaction with 50K token budget and image stripping.

### Files to Create
```
src/
├── compaction/
│   ├── mod.rs              # Compaction entry
│   ├── budget.rs           # Token budgeting
│   ├── prune.rs             # Message pruning
│   ├── restore.rs           # File restoration
│   └── strip.rs             # Image stripping
```

### Key Implementations
1. Trigger compaction at 50K tokens
2. Restore max 5 files with 5K budget each
3. Strip images, replace with `[image]` markers
4. Protect last 2 user turns + skill tools
5. Skills budget: 25K separate allocation
6. Micro-compact for minor pruning

### How to Test
- Run long conversation, verify compaction triggers
- Check image stripping works
- Verify protected content preserved
- Test micro-compact

### Acceptance Criteria
- [ ] Compaction triggers at 50K tokens
- [ ] Image stripping works
- [ ] Protected content preserved
- [ ] Skills have separate budget

### Reference
- Claude Code: `/home/sridhar/claude-code-sourcemap/restored-src/src/services/compact/compact.ts`

---

## P2-04: Hooks System

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement pre/post tool hooks with YAML configuration.

### Files to Create
```
src/
├── hooks/
│   ├── mod.rs              # Hooks entry
│   ├── registry.rs          # Hook registry
│   ├── config.rs            # YAML config
│   ├── executor.rs           # Hook execution
│   └── types.rs             # Hook types
```

### Hook Types
| Hook | Trigger |
|------|---------|
| PreToolUse | Before tool execution |
| PostToolUse | After tool execution |
| PreCompact | Before compaction |
| PostCompact | After compaction |
| SessionStart | On session start |

### Key Implementations
1. Hooks defined in YAML config with shell command
2. PreToolUse: modify input, block execution
3. PostToolUse: log results, modify output
4. Blocking vs non-blocking modes
5. JSON payload passing to hooks

### How to Test
- Create pre-tool hook that logs
- Create post-tool hook that blocks dangerous commands
- Test hook execution order
- Verify blocking works

### Acceptance Criteria
- [ ] Pre-tool hooks execute before tools
- [ ] Post-tool hooks execute after tools
- [ ] Hooks can modify tool input/output
- [ ] Blocking hooks work
- [ ] YAML config loads

### Reference
- Claude Code: `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/hooks/`

---

## P2-05: LSP Integration

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement OpenCode's Effect-based LSP with 28+ language servers.

### Files to Create
```
src/
├── lsp/
│   ├── mod.rs              # LSP entry
│   ├── server.rs           # Server management
│   ├── client.rs            # vscode-jsonrpc client
│   ├── hover.rs             # Hover provider
│   ├── goto.rs              # Go-to-definition
│   ├── refs.rs              # References
│   ├── diag.rs              # Diagnostics
│   └── install.rs           # Server auto-install
```

### Supported Languages (28+)
JavaScript/TypeScript, Python, Rust, Go, Ruby, C/C++, Java, Kotlin, Dart, PHP, and more.

### Key Implementations
1. Effect-based async for all LSP operations
2. Multi-server support with extension-based selection
3. Auto-install servers via npm
4. Hover, definition, references, diagnostics
5. File versioning for change tracking
6. 150ms debounce for diagnostics

### How to Test
- Connect to TypeScript/Rust LSP servers
- Test hover shows documentation
- Test go-to-definition works
- Test diagnostics display

### Acceptance Criteria
- [ ] LSP client connects to tsserver/rust-analyzer
- [ ] Hover returns documentation
- [ ] Go-to-definition navigates correctly
- [ ] Diagnostics display in real-time

### Reference
- OpenCode: `/home/sridhar/opencode/packages/opencode/src/lsp/server.ts`

---

## P2-06: Architect Mode

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement Aider's two-model architect mode where architect designs and editor implements.

### Files to Create
```
src/
├── modes/
│   ├── architect.rs        # Architect mode
│   └── dual.rs             # Dual model config
```

### Key Implementations
1. Separate architect and editor models
2. Architect proposes changes in structured format
3. Editor implements architect's proposals
4. Configuration for model per mode
5. JSON specs for design phase

### How to Test
- Configure architect and editor models
- Verify architect proposes, editor implements
- Test mode switching preserves context

### Acceptance Criteria
- [ ] Architect mode proposes changes
- [ ] Editor implements proposals
- [ ] Dual model configuration works
- [ ] Context preserved on switch

### Reference
- Aider: `/home/sridhar/aider/aider/coders/architect_coder.py`

---

## P2-07: Tree-sitter Integration

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement tree-sitter for syntax-aware file understanding.

### Files to Create
```
src/
├── parsers/
│   ├── mod.rs              # Parser entry
│   ├── tree_sitter.rs       # Tree-sitter bindings
│   ├── extract.rs           # Definition extraction
│   └── tags.rs             # Tags generation
```

### Key Implementations
1. Tree-sitter grammar loading for multiple languages
2. Extract function/class definitions
3. Generate tags cache stored in SQLite
4. Syntax error detection
5. RepoMap integration

### How to Test
- Parse TypeScript/Python files
- Extract function definitions
- Verify tags cache created
- Test syntax error detection

### Acceptance Criteria
- [ ] Tree-sitter parses files
- [ ] Definitions extracted
- [ ] Tags cache persists
- [ ] Syntax errors detected

### Reference
- Aider: `/home/sridhar/aider/aider/coders/ask_coder.py`

---

## P2-08: AI Comments System

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement Aider's `// ai!` comment system for inline AI commands.

### Files to Create
```
src/
├── ai_comments/
│   ├── mod.rs              # AI comments entry
│   ├── parser.rs            # Comment parser
│   └── watcher.rs           # File watcher
```

### Comment Patterns
```python
// ai! - Execute as AI command
// ai? - Ask about this code
# ai? - Ask about this code
```

### Key Implementations
1. Detect `// ai!` and `// ai?` patterns in code
2. Execute `// ai!` as AI command
3. Answer `// ai?` about surrounding code
4. File watching for real-time detection
5. Context: surrounding code block

### How to Test
- Add `// ai!` comment, verify execution
- Add `// ai?` comment, verify explanation
- Test file watching triggers

### Acceptance Criteria
- [ ] `// ai!` executes command
- [ ] `// ai?` explains code
- [ ] File watcher detects changes
- [ ] Context extracted correctly

### Reference
- Aider: `/home/sridhar/aider/aider/main.py` (main loop)

---

## Phase 2 Checklist

- [ ] P2-01: Git Integration
- [ ] P2-02: RepoMap with PageRank
- [ ] P2-03: Compaction System
- [ ] P2-04: Hooks System
- [ ] P2-05: LSP Integration
- [ ] P2-06: Architect Mode
- [ ] P2-07: Tree-sitter Integration
- [ ] P2-08: AI Comments System

**Phase 2 Complete When**: All 8 tickets checked above
