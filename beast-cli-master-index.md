# Beast CLI - Master Index

**Purpose**: Token-efficient navigation for implementation agents
**Total Files**: 12
**Usage**: Read this file first, then load specific phase/topic files as needed

---

## FILE STRUCTURE

```
beast-cli-master-index.md      ← YOU ARE HERE (start here)
beast-cli-research.md          ← Full analysis (30+ categories, recommendations)
├── Phase 1: Foundation
│   ├── beast-cli-p1-tickets.md           ← All P1 tickets (6 tickets)
│   └── beast-cli-p1-reference.md        ← P1 source code references
├── Phase 2: Intelligence
│   ├── beast-cli-p2-tickets.md          ← All P2 tickets (8 tickets)
│   └── beast-cli-p2-reference.md         ← P2 source code references
├── Phase 3: Ecosystem
│   ├── beast-cli-p3-tickets.md          ← All P3 tickets (8 tickets)
│   └── beast-cli-p3-reference.md         ← P3 source code references
├── Phase 4: Polish
│   ├── beast-cli-p4-tickets.md          ← All P4 tickets (5 tickets)
│   └── beast-cli-p4-reference.md         ← P4 source code references
├── Future
│   └── beast-cli-future-tickets.md       ← Future tickets (2 tickets)
└── References
    ├── beast-cli-source-ref.md           ← All source files by repo
    └── beast-cli-features-matrix.md       ← 85+ feature comparison
```

---

## QUICK NAVIGATION

### By Phase (Implementation Order)

| Phase | Focus | Tickets | Load File |
|-------|-------|---------|-----------|
| **Phase 1** | Foundation (Tool System, TUI, Core Engine, Mode System) | 6 | `beast-cli-p1-tickets.md` |
| **Phase 2** | Intelligence (Git, RepoMap, Compaction, Hooks, LSP, Architect, Tree-sitter, AI Comments) | 8 | `beast-cli-p2-tickets.md` |
| **Phase 3** | Ecosystem (MCP, Multi-Provider, Prompts, Ghost Commits, LazyLiteLLM, Voice, Web, Auto-Lint) | 8 | `beast-cli-p3-tickets.md` |
| **Phase 4** | Polish (Memory, Hooks, Sandbox, Batch, Collaboration) | 5 | `beast-cli-p4-tickets.md` |
| **Future** | Multi-Agent, Desktop App | 2 | `beast-cli-future-tickets.md` |

### By Topic (For Reference)

| Topic | Description | Load File |
|-------|-------------|-----------|
| **Architecture** | Best patterns from all repos | `beast-cli-research.md` (Section 3) |
| **TUI/UI** | Ratatui, notifications, job control | `beast-cli-research.md` (Section 1.1) |
| **Tool System** | buildTool, permissions, MCP | `beast-cli-research.md` (Section 1.3) |
| **Git** | Attribution, Ghost Commits, RepoMap | `beast-cli-research.md` (Section 1.5) |
| **Memory** | Taxonomy, staleness, team sync | `beast-cli-research.md` (Section 1.8) |
| **Security** | Landlock, Seatbelt, pattern matching | `beast-cli-research.md` (Section 1.11) |
| **Modes** | Plan/Execution, Architect, permissions | `beast-cli-research.md` (Section 1.2) |
| **Providers** | 40+ providers comparison | `beast-cli-research.md` (Section 1.10) |
| **Source Code** | All file paths by repo | `beast-cli-source-ref.md` |

---

## WHAT EACH FILE CONTAINS

### Phase Ticket Files (beast-cli-p*-tickets.md)
Each contains:
- **Ticket ID** (P1-01, P2-03, etc.)
- **Description** - What to implement
- **Files to create** - New source files with paths
- **Key implementations** - 4-6 bullet points
- **How to test** - Testing steps
- **Acceptance criteria** - Checklist with [ ]
- **Reference** - Source repo and file path

### Phase Reference Files (beast-cli-p*-reference.md)
Each contains:
- **Source file paths** - Exact paths on this machine
- **3-line explanations** - How each feature is implemented
- **Line counts** - For estimation
- **Code snippets** - Key patterns to copy

### Research File (beast-cli-research.md)
Contains:
- Full 500+ feature analysis
- 30 category comparisons
- Architecture recommendations
- Best patterns from each repo

---

## IMPLEMENTATION WORKFLOW

### For Single Ticket (e.g., implement P1-01)
```
1. Read: beast-cli-master-index.md (this file)
2. Read: beast-cli-p1-tickets.md (find P1-01)
3. Read: beast-cli-p1-reference.md (get source paths)
4. Implement: Create files as specified
```

### For Entire Phase (e.g., implement all Phase 1)
```
1. Read: beast-cli-master-index.md
2. Read: beast-cli-p1-tickets.md (all 6 P1 tickets)
3. Read: beast-cli-p1-reference.md (all source paths)
4. Implement: Tickets in order P1-01 → P1-06
```

### For Research (understanding features)
```
1. Read: beast-cli-master-index.md
2. Read: beast-cli-features-matrix.md (quick comparison)
3. Read: beast-cli-research.md (detailed analysis)
4. Read: beast-cli-source-ref.md (find exact files)
```

---

## TOKEN ESTIMATES (Per Phase)

| File | Tokens | When to Load |
|------|--------|--------------|
| `beast-cli-master-index.md` | 500 | Always |
| `beast-cli-p1-tickets.md` | 2,000 | Phase 1 |
| `beast-cli-p1-reference.md` | 2,000 | Phase 1 |
| `beast-cli-p2-tickets.md` | 3,000 | Phase 2 |
| `beast-cli-p2-reference.md` | 2,500 | Phase 2 |
| `beast-cli-p3-tickets.md` | 3,000 | Phase 3 |
| `beast-cli-p3-reference.md` | 2,000 | Phase 3 |
| `beast-cli-p4-tickets.md` | 2,000 | Phase 4 |
| `beast-cli-p4-reference.md` | 2,000 | Phase 4 |
| `beast-cli-future-tickets.md` | 500 | Future |
| `beast-cli-features-matrix.md` | 2,000 | Research |
| `beast-cli-source-ref.md` | 3,000 | Research |

**Per Phase Load**: ~5,000 tokens
**Full Research**: ~10,000 tokens
**Full Implementation**: ~20,000 tokens

---

## SOURCE REPOSITORIES

All source code is located at:

| Repo | Path |
|------|------|
| Claude Code Sourcemap | `/home/sridhar/claude-code-sourcemap/restored-src/src/` |
| Codex-RS | `/home/sridhar/codex/codex-rs/` |
| Aider | `/home/sridhar/aider/aider/` |
| Cline | `/home/sridhar/cline/` |
| OpenCode | `/home/sridhar/opencode/packages/opencode/src/` |

---

**Last Updated**: 2026-04-08
**Status**: READY FOR IMPLEMENTATION
