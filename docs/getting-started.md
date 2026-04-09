# Getting Started

A quick guide to using Beast CLI for the first time.

---

## Starting Beast CLI

### Interactive Mode

```bash
beast
```

You'll see the Beast CLI prompt:

```
🐉 Beast CLI v1.0.0
═══════════════════════════════════════

> _
```

### One-liner Mode

```bash
beast "Explain this function"
```

### With Specific Provider

```bash
# Use Claude
beast --provider anthropic --model claude-sonnet-4-20250514

# Use GPT
beast --provider openai --model gpt-4o

# Use local Ollama
beast --provider ollama --model llama3.2

# Use LM Studio
beast --provider lmstudio --base-url http://localhost:1234/v1
```

---

## Basic Commands

### Reading Files

```
beast > read src/index.ts
beast > read README.md
beast > cat package.json
```

### Editing Files

```
beast > edit src/index.ts
# Then specify what to change
```

### Running Shell Commands

```
beast > bash npm install
beast > bash git status
beast > bash npm test
```

### Searching

```
beast > grep "login" --include="*.ts"
beast > glob "**/*.test.ts"
beast > search "authentication"
```

---

## Task Management

### Create Task

```
beast > task "Fix login bug"
beast > TodoWrite "Review PR #123"
```

### List Tasks

```
beast > tasks
beast > TodoList
```

### Update Task

```
beast > task update 1 --status completed
```

---

## Modes

Switch between different modes:

```
beast > mode solo         # Default, full access
beast > mode architect    # Planning mode
beast > mode review       # Code review
beast > mode teach       # Teaching mode
beast > mode pair        # Pair programming
```

---

## Working with Git

### Check Status

```
beast > bash git status
beast > bash git diff
```

### Commit Changes

Beast CLI auto-commits with AI-generated messages:

```
beast > commit
```

### View History

```
beast > bash git log --oneline
```

---

## Using MCP Servers

Configure MCP servers in `~/.beast/mcp.yaml`:

```yaml
servers:
  filesystem:
    command: npx
    args: [-y, @modelcontextprotocol/server-filesystem, /path]
```

Then use MCP tools:

```
beast > mcp_filesystem_read /path/to/file
```

---

## Examples

### Example 1: Fix a Bug

```
beast > read src/auth.ts
beast > search "password validation"
beast > edit src/auth.ts
# Specify the fix
beast > bash npm test
```

### Example 2: Add Feature

```
beast > mode architect
beast > plan "Add dark mode to UI"
beast > mode solo
beast > read src/theme.ts
beast > edit src/theme.ts
# Add dark mode
beast > commit
```

### Example 3: Code Review

```
beast > mode review
beast > read src/api.ts
beast > grep "TODO" --include="*.ts"
beast > bash npm run lint
```

---

## Exiting

```
beast > exit
beast > quit
beast > /exit
```

---

## Next Steps

- Learn about [Configuration](configuration.md)
- Explore [Providers](providers.md)
- Read [Commands Reference](commands.md)