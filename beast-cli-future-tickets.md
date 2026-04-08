# Beast CLI - Future Enhancements

**Phase**: Future
**Focus**: Multi-Agent Coordination, Desktop App
**Tickets**: 2 (F1-01, F2-01)
**Timeline**: Future

---

## F1-01: Multi-Agent Coordination

**Status**: TODO
**Priority**: Future

### Description
Implement coordinator pattern for multi-agent workflows (Claude Code's agent swarms).

### Files to Create
```
src/
├── agents/
│   ├── mod.rs              # Agents entry
│   ├── coordinator.rs       # Coordinator agent
│   ├── worker.rs             # Worker agent
│   └── messages.rs           # Inter-agent messages
```

### Key Implementations
1. Coordinator spawns workers with restricted tools
2. SendMessage for inter-agent communication
3. TaskStop for worker termination
4. Result synthesis from workers
5. teamMemorySync keeps memory coherent

### How to Test
- Spawn multiple agents
- Send messages between agents
- Verify coordination
- Test result synthesis

### Acceptance Criteria
- [ ] Coordinator spawns workers
- [ ] SendMessage works
- [ ] TaskStop terminates workers
- [ ] Results synthesized

### Reference
- Source: `/home/sridhar/claude-code-sourcemap/restored-src/src/coordinator/`
- Tools: `/home/sridhar/claude-code-sourcemap/restored-src/src/tools/AgentTool/`

---

## F2-01: Desktop App

**Status**: TODO
**Priority**: Future

### Description
Wrap CLI in Tauri desktop app.

### Files to Create
```
desktop/
├── src/
│   ├── main.rs              # Tauri entry
│   ├── app.rs               # Desktop app logic
│   └── tray.rs              # System tray
```

### Key Implementations
1. Tauri 2.x with Rust backend
2. System tray integration
3. Global shortcuts
4. Desktop notifications
5. WebView-based UI

### How to Test
- Launch desktop app
- Test system tray
- Test global shortcuts
- Test notifications

### Acceptance Criteria
- [ ] Desktop app launches
- [ ] System tray works
- [ ] Global shortcuts registered
- [ ] Notifications display

### Reference
- OpenCode: `/home/sridhar/opencode/packages/@opencode/desktop/`

---

## Future Checklist

- [ ] F1-01: Multi-Agent Coordination
- [ ] F2-01: Desktop App

**Future Phase Complete When**: All 2 tickets checked above
