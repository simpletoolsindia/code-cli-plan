# Beast CLI - Phase 4: Source Code References

**Phase**: P4
**Purpose**: Exact source file paths with 3-line implementation explanations

---

## P4-01: Memory System

### Memory Taxonomy
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/memdir/memdir.ts` |
| **Lines** | 200 |
| **How it works** | 1. Typed memory files with YAML frontmatter (type, name, description) |
| | 2. MEMORY.md index file (max 200 lines, 25KB) |
| | 3. Staleness warnings when memories >1 day old |

### Team Memory Sync
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/teamMemorySync/` |
| **Lines** | 100+ |
| **How it works** | 1. Synchronizes memory across multi-agent team |
| | 2. Uses SendMessage for inter-agent sharing |
| | 3. Keeps teammates' memory coherent |

### extractMemories
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/services/extractMemories/` |
| **Lines** | 100+ |
| **How it works** | 1. Automatically extracts memories from conversation |
| | 2. Categorizes by type (user, feedback, project) |
| | 3. Saves to memory files |

---

## P4-02: Advanced Hooks

### Hook System
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/claude-code-sourcemap/restored-src/src/utils/hooks/` |
| **Files** | 10 |
| **How it works** | 1. Hooks defined in YAML with shell command or script path |
| | 2. Read/Edit/Bash hooks fire on specific operations |
| | 3. Think hooks show reasoning visibility |

---

## P4-03: Sandbox Security

### Landlock (Linux)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/linux-sandbox/src/lib.rs` |
| **Lines** | 300+ |
| **How it works** | 1. Uses Linux Landlock syscall to restrict filesystem access |
| | 2. Rules defined per directory: read-only, write, deny |
| | 3. Falls back to bubblewrap if Landlock unavailable |

### Seatbelt (macOS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/macos-sandbox/src/lib.rs` |
| **Lines** | 200+ |
| **How it works** | 1. Uses macOS Seatbelt (sandbox_execute) for sandboxing |
| | 2. Configurable profiles: read-only, workspace-write |
| | 3. Integrates with ExecPolicy engine |

### Exec Policy Engine
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/execpolicy/src/lib.rs` |
| **Lines** | 400+ |
| **How it works** | 1. Declarative permission system |
| | 2. Prefix-based command rules |
| | 3. Network rules per host/protocol |

---

## P4-04: Batch Tool

### Batch Tool (OpenCode)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/opencode/packages/opencode/src/tool/batch.ts` |
| **Lines** | 100 |
| **How it works** | 1. Queues multiple tool calls and executes concurrently |
| | 2. Collects all results and handles partial failures |
| | 3. Returns combined output from parallel executions |

---

## P4-05: Collaboration Modes

### Collaboration (Codex-RS)
| Attribute | Details |
|-----------|---------|
| **Source File** | `/home/sridhar/codex/codex-rs/tui/src/collaboration_modes.rs` |
| **Lines** | 100 |
| **How it works** | 1. Mode-specific tool availability |
| | 2. Mode-specific prompt variants |
| | 3. Preset collaboration configurations |

---

**End of P4 Reference**
