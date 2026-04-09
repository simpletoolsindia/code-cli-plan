# Commands Reference

Complete list of Beast CLI commands.

---

## File Operations

### Read

```bash
beast > read <file>
beast > read src/index.ts
beast > read "path/to/file.txt"
```

Read file contents into context.

### Write

```bash
beast > write <path> <content>
beast > write new-file.ts "console.log('hello')"
```

Create new file with content.

### Edit

```bash
beast > edit <file>
beast > edit src/index.ts
```

Start editing a file. Beast CLI will ask what to change.

### Glob

```bash
beast > glob <pattern>
beast > glob "**/*.ts"
beast > glob "src/**/*.js"
```

Find files matching pattern.

### Grep

```bash
beast > grep <pattern>
beast > grep "function login"
beast > grep "TODO" --include="*.ts"
```

Search file contents.

---

## Shell Commands

### Bash

```bash
beast > bash <command>
beast > bash npm install
beast > bash git status
beast > bash "find . -name '*.log' -delete"
```

Run shell commands.

---

## Task Management

### TaskCreate

```bash
beast > task <description>
beast > task "Fix login bug"
beast > task "Add dark mode"
```

Create a new task.

### TaskUpdate

```bash
beast > task update <id> --status completed
beast > task update 1 --status in_progress
beast > task update 3 --priority high
```

Update task status/priority.

### TaskList

```bash
beast > tasks
beast > task list
```

List all tasks.

### TodoWrite / TodoRead

```bash
beast > TodoWrite <task>
beast > TodoRead
```

Legacy task commands (compatible with Claude Code).

---

## Search

### search

```bash
beast > search <query>
beast > search "login function"
```

Search the web for information.

### WebFetch

```bash
beast > fetch <url>
beast > fetch https://docs.example.com/api
```

Fetch URL and convert to markdown.

---

## Mode Commands

### mode

```bash
beast > mode <name>
beast > mode solo      # Default mode
beast > mode architect # Planning mode
beast > mode review    # Code review
beast > mode teach     # Teaching mode
beast > mode pair      # Pair programming
```

Switch collaboration mode.

---

## Git Commands

### git

```bash
beast > git <command>
beast > git status
beast > git diff
beast > git log --oneline -10
beast > git commit -m "message"
```

Run git commands.

### commit

```bash
beast > commit
beast > commit "your message"
```

Auto-generate commit message and commit.

---

## Provider Commands

### provider

```bash
beast > provider <name>
beast > provider anthropic
beast > provider openai
beast > provider ollama --model llama3.2
```

Switch LLM provider.

---

## Utility Commands

### help

```bash
beast > help
beast > ?
```

Show help information.

### exit / quit

```bash
beast > exit
beast > quit
beast > /exit
```

Exit Beast CLI.

### clear

```bash
beast > clear
```

Clear the screen.

### history

```bash
beast > history
```

Show command history.

---

## Slash Commands

### /mode

```bash
beast > /mode architect
beast > /mode review
```

Same as `mode` command.

### /task

```bash
beast > /task Fix this bug
```

Same as `task` command.

### /search

```bash
beast > /search latest AI news
```

Web search.

### /web

```bash
beast > /web https://example.com
```

Fetch URL.

### /commit

```bash
beast > /commit
```

Git commit.

### /test

```bash
beast > /test
```

Run tests.

### /lint

```bash
beast > /lint
```

Run linter.

---

## Configuration Commands

### config

```bash
beast > config
beast > config show
beast > config set key=value
beast > config get key
```

View/modify configuration.

---

## Info Commands

### info

```bash
beast > info
```

Show version, environment, settings.

### doctor

```bash
beast > doctor
```

Run diagnostic checks.

### status

```bash
beast > status
```

Show current session status.

---

## Examples

### Full Workflow

```bash
beast > read src/app.ts
beast > grep "login"
beast > edit src/auth.ts
# Make changes
beast > bash npm test
beast > commit
beast > mode review
beast > bash npm run lint
```

### Code Review

```bash
beast > mode review
beast > read src/api.ts
beast > grep "TODO" --include="*.ts"
beast > bash npm run build
```

### Planning

```bash
beast > mode architect
beast > read SPEC.md
beast > plan "Add user authentication"
beast > mode solo
beast > implement the plan
```