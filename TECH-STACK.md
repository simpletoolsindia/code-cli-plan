# Beast CLI - Tech Stack

**One stack. No alternatives. Ship it.**

---

## Stack

| Component | Choice |
|-----------|--------|
| Language | TypeScript 5.x |
| Runtime | Bun |
| TUI | Ink (React) |
| MCP | @modelcontextprotocol/sdk |
| Git | simple-git |
| AI | Vercel AI SDK |
| Validation | Zod |
| CLI Parser | cac |

---

## Why TypeScript + Bun?

1. **MCP only works in TypeScript** - Official SDK, Cline's 59KB McpHub
2. **Patterns ready to copy** - Claude Code buildTool(), Cline providers, OpenCode effects
3. **Bun is fast** - 3x faster startup, smaller binary
4. **One language** - No migration, no multi-language mess

---

## Dependencies

```json
{
  "dependencies": {
    "bun": "^1.1.0",
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "zod": "^3.22.0",
    "simple-git": "^3.22.0",
    "ai": "^2.2.0",
    "cac": "^6.7.0",
    "undici": "^6.0.0",
    "marked": "^12.0.0"
  }
}
```

---

## Project Structure

```
beast-cli/
├── src/
│   ├── main.ts              # Entry point
│   ├── tui/
│   │   ├── App.tsx         # Main UI
│   │   ├── Chat.tsx        # Chat view
│   │   └── StatusBar.tsx   # Status bar
│   ├── tools/
│   │   ├── Tool.ts         # Tool interface
│   │   ├── registry.ts    # Tool registry
│   │   ├── BashTool.ts     # Bash execution
│   │   ├── FileTool.ts     # File operations
│   │   └── ...
│   ├── mcp/
│   │   ├── hub.ts         # MCP hub
│   │   └── transport.ts    # Transport types
│   ├── providers/
│   │   ├── factory.ts      # Provider factory
│   │   ├── anthropic.ts    # Anthropic
│   │   └── openai.ts      # OpenAI
│   ├── git/
│   │   └── repo.ts         # Git operations
│   ├── memory/
│   │   └── memdir.ts      # Memory system
│   └── engine/
│       ├── loop.ts          # Agent loop
│       └── compact.ts       # Compaction
├── package.json
└── tsconfig.json
```

---

## Copy These Patterns

| Feature | Copy From | File |
|---------|-----------|------|
| buildTool() | Claude Code | `claude-code-sourcemap/restored-src/src/tools/Tool.ts` |
| MCP Hub | Cline | `cline/src/services/mcp/McpHub.ts` |
| Permissions | Claude Code | `claude-code-sourcemap/restored-src/src/types/permissions.ts` |
| Memory | Claude Code | `claude-code-sourcemap/restored-src/src/memdir/memdir.ts` |
| Compaction | Claude Code | `claude-code-sourcemap/restored-src/src/services/compact/`

---

## Start Command

```bash
bun init beast-cli
cd beast-cli
bun add ink react @modelcontextprotocol/sdk zod simple-git ai cac marked

# Copy patterns from repos above
# Implement features from phase tickets
# Ship it
```

---

**Done. TypeScript + Bun. No more decisions needed.**
