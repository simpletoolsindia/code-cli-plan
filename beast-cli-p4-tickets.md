# Beast CLI - Phase 4: Polish Tickets

**Phase**: P4
**Focus**: Memory System, Hooks, Sandbox, Batch Tool, Collaboration Modes
**Tickets**: 5 (P4-01 through P4-05)
**Timeline**: Week 7-8

---

## P4-01: Memory System

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement Claude Code's memory taxonomy with typed files, staleness warnings, and team sync.

### Files to Create
```
src/
├── memory/
│   ├── mod.rs              # Memory entry
│   ├── store.rs             # File-based storage
│   ├── query.rs              # Memory search
│   ├── taxonomy.rs           # Typed memory
│   └── sync.rs              # Team memory sync
```

### Memory Types
| Type | Description |
|------|-------------|
| `user` | User preferences, role, goals |
| `feedback` | Guidance, corrections |
| `project` | Project context, decisions |
| `reference` | External system pointers |

### Key Implementations
1. Typed memory files with YAML frontmatter
2. MEMORY.md index file (max 200 lines, 25KB)
3. Staleness warnings (>1 day old)
4. Team memory synchronization
5. Relevance-based recall
6. extractMemories for automatic extraction

### How to Test
- Create memories of each type
- Verify MEMORY.md stays under limits
- Test staleness warnings
- Test recall finds relevant memories

### Acceptance Criteria
- [ ] Memories saved with frontmatter
- [ ] MEMORY.md under 25KB
- [ ] Staleness warnings appear
- [ ] Recall finds relevant memories
- [ ] Team sync works

### Reference
- Source: `/home/sridhar/claude-code-sourcemap/restored-src/src/memdir/memdir.ts`
- Team Sync: `/home/sridhar/claude-code-sourcemap/restored-src/src/services/teamMemorySync/`

---

## P4-02: Hooks (Advanced)

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement advanced hooks including Read/Edit/Bash hooks.

### Additional Hook Types
| Hook | Trigger |
|------|---------|
| Read | On file read |
| Edit | On file edit |
| Bash | On bash command |
| Think | On thinking |
| AgentSubmit | On agent submission |
| Entrypoint | On entrypoint call |

### Key Implementations
1. Read/Edit hooks for file operations
2. Think hooks for reasoning visibility
3. AgentSubmit hooks for result handling
4. Blocking and non-blocking modes
5. Hook chaining

### Acceptance Criteria
- [ ] Read hooks fire on file read
- [ ] Edit hooks fire on file edit
- [ ] Think hooks show reasoning
- [ ] Blocking hooks work

### Reference
- Source: `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/hooks/`

---

## P4-03: Sandbox Security

**Status**: TODO
**Priority**: P1 (High)

### Description
Implement Codex-RS's sandbox using Landlock, Seatbelt, and Windows Restricted Token.

### Files to Create
```
src/
├── sandbox/
│   ├── mod.rs              # Sandbox entry
│   ├── landlock.rs          # Linux Landlock
│   ├── seatbelt.rs          # macOS Seatbelt
│   ├── windows.rs            # Windows Restricted Token
│   └── policy.rs            # Policy engine
```

### Sandbox Modes
| Mode | Description |
|------|-------------|
| `read-only` | Default read-only sandbox |
| `workspace-write` | Allow writes to workspace |
| `danger-full-access` | Disable sandboxing |

### Key Implementations
1. Landlock (Linux), Seatbelt (macOS), Windows Restricted Token
2. Prefix-based command rules
3. Network rules per host/protocol
4. dangerous_pattern detection
5. Path traversal prevention

### How to Test
- Test Landlock restricts file access
- Test Seatbelt restricts on macOS
- Test command rules
- Test network rules block unauthorized

### Acceptance Criteria
- [ ] Sandbox restricts file access
- [ ] Command rules work
- [ ] Network rules block
- [ ] Dangerous patterns detected

### Reference
- Landlock: `/home/sridhar/codex/codex-rs/linux-sandbox/src/lib.rs`
- Seatbelt: `/home/sridhar/codex/codex-rs/macos-sandbox/src/lib.rs`
- Policy: `/home/sridhar/codex/codex-rs/execpolicy/src/lib.rs`

---

## P4-04: Batch Tool Execution

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement OpenCode's batch tool for concurrent execution.

### Files to Create
```
src/
├── tools/
│   └── batch.rs            # Batch execution
```

### Key Implementations
1. Queue multiple tool calls
2. Execute concurrently
3. Collect results
4. Handle partial failures

### Acceptance Criteria
- [ ] Batch executes concurrently
- [ ] Results collected
- [ ] Partial failures handled

### Reference
- Source: `/home/sridhar/opencode/packages/opencode/src/tool/batch.ts`

---

## P4-05: Collaboration Modes

**Status**: TODO
**Priority**: P2 (Medium)

### Description
Implement Codex-RS's collaboration modes with mode-specific behavior.

### Files to Create
```
src/
├── modes/
│   └── collab.rs           # Collaboration modes
```

### Key Implementations
1. Mode-specific tool availability
2. Mode-specific prompt variants
3. Preset collaboration configurations
4. User-defined modes
5. TUI visibility control per mode

### Acceptance Criteria
- [ ] Modes switch correctly
- [ ] Tools differ per mode
- [ ] Prompts differ per mode

### Reference
- Source: `/home/sridhar/codex/codex-rs/tui/src/collaboration_modes.rs`

---

## Phase 4 Checklist

- [ ] P4-01: Memory System
- [ ] P4-02: Hooks (Advanced)
- [ ] P4-03: Sandbox Security
- [ ] P4-04: Batch Tool Execution
- [ ] P4-05: Collaboration Modes

**Phase 4 Complete When**: All 5 tickets checked above
