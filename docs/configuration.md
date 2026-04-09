# Configuration Guide

Configure Beast CLI for your needs.

---

## Config File Location

```
~/.beast/config.yaml
```

---

## Full Configuration Example

```yaml
# Provider settings
provider:
  default: anthropic
  model: claude-sonnet-4-20250514
  apiKeyEnvVar: ANTHROPIC_API_KEY

# Sandbox security
sandbox:
  mode: workspace-write  # read-only | workspace-write | danger-full-access
  allowedCommands:
    - git
    - npm
    - node
    - bun
    - python
    - pip
    - grep
    - find
    - cat
    - ls
  deniedPaths:
    - /etc
    - /root
    - /var/secret
  networkRules:
    - host: api.anthropic.com
      protocol: https
      action: allow
    - host: api.openai.com
      protocol: https
      action: allow
    - host: "*"
      action: deny

# Memory system
memory:
  enabled: true
  autoSync: true
  syncIntervalMinutes: 5

# Collaboration mode
collab:
  mode: solo  # solo | pair | review | teach
  visibility:
    tui: true
    tools: true
    thinking: false

# Token budget
tokens:
  maxBudget: 100000
  compactionThreshold: 50000

# MCP servers
mcp:
  servers: []
  timeout: 30000
  retryAttempts: 6

# Logging
logging:
  level: info  # debug | info | warn | error
  file: ~/.beast/logs/beast.log

# Hooks
hooks:
  - name: pre-edit-check
    type: PreEdit
    command: echo "Checking..."
    mode: non-blocking
    enabled: true
```

---

## Environment Variables

These can be used instead of or alongside config.yaml:

```bash
# API Keys
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export OPENROUTER_API_KEY=sk-or-...

# Provider hosts
export OLLAMA_HOST=http://localhost:11434
export LMSTUDIO_HOST=http://localhost:1234
export JAN_HOST=http://localhost:1337

# Sandbox mode
export BEAST_SANDBOX_MODE=workspace-write

# Token budget
export BEAST_MAX_TOKENS=100000

# Log level
export BEAST_LOG_LEVEL=info

# MCP config path
export BEAST_MCP_CONFIG=~/.beast/mcp.yaml
```

---

## Sandbox Modes

### read-only

```yaml
sandbox:
  mode: read-only
  allowedCommands:
    - git
    - grep
    - find
    - cat
    - ls
    - pwd
    - head
    - tail
```

No file modifications allowed.

### workspace-write

```yaml
sandbox:
  mode: workspace-write
  allowedCommands:
    - git
    - npm
    - node
    - bun
    - python
    - pip
    - grep
    - find
    - cat
    - ls
    - code
    - vim
```

Can modify files in workspace only.

### danger-full-access

```yaml
sandbox:
  mode: danger-full-access
```

**WARNING:** No restrictions. Use only for trusted environments.

---

## Memory Settings

```yaml
memory:
  enabled: true
  autoSync: true
  syncIntervalMinutes: 5
  types:
    - user        # User preferences
    - feedback    # Corrections/guidance
    - project     # Project context
    - reference   # External pointers
```

---

## MCP Configuration

Create `~/.beast/mcp.yaml`:

```yaml
servers:
  # File system access
  filesystem:
    command: npx
    args: [-y, @modelcontextprotocol/server-filesystem, /home/user/projects]

  # Git operations
  git:
    command: uvx
    args: [mcp-server-git]

  # Sequential thinking
  thinking:
    command: npx
    args: [-y, @modelcontextprotocol/server-sequential-thinking]

  # Brave search
  search:
    command: npx
    args: [-y, @modelcontextprotocol/server-brave-search]
    env:
      BRAVE_API_KEY: your_key_here
```

---

## Hook Configuration

```yaml
hooks:
  # Run before any edit
  - name: pre-edit-lint
    type: PreEdit
    command: ./scripts/lint-check.sh
    mode: non-blocking
    enabled: true

  # Block dangerous commands
  - name: block-rm-rf
    type: PreBash
    command: ./scripts/block-dangerous.sh
    mode: blocking
    enabled: true
    condition: "${command}"  # Block if command matches danger patterns

  # Notify on commit
  - name: post-commit-slack
    type: PostToolUse
    command: ./scripts/notify.sh
    mode: non-blocking
    enabled: false
    condition: "${toolName}"  # Only if tool was git commit
```

---

## Commands Reference

### Config Commands

```bash
beast config                    # Show current config
beast config provider            # Show provider settings
beast config sandbox             # Show sandbox settings
beast config memory             # Show memory settings
beast config set provider.default=openai  # Update config
```

### View Commands

```bash
beast info                      # Show version and environment
beast doctor                    # Run diagnostics
beast status                    # Show current session status
```

---

## Per-Project Config

Create `.beast.yaml` in your project root for project-specific settings:

```yaml
provider:
  default: openai
  model: gpt-4o-mini

sandbox:
  mode: read-only  # Extra security for this project

collab:
  mode: review  # Default to review mode
```

Project config overrides global config.