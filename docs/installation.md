# Installation Guide

This guide covers all ways to install Beast CLI.

---

## Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/simpletoolsindia/beast-cli/main/install.sh | bash
```

This script will:
1. Check prerequisites (curl, bun/npm)
2. Install Bun if needed
3. Clone/download Beast CLI
4. Install dependencies
5. Create symlink
6. Setup shell integration

---

## Manual Installation

### Prerequisites

- **Node.js 18+** or **Bun 1.0+** or **npm**
- **Git** (optional, for cloning)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/simpletoolsindia/beast-cli.git
   cd beast-cli
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Build the project**
   ```bash
   bun run build
   ```

4. **Create symlink**
   ```bash
   # Linux/macOS
   ln -s $(pwd)/dist/beast /usr/local/bin/beast

   # Or add to PATH
   export PATH="$(pwd)/dist:$PATH"
   ```

---

## npm Installation

```bash
npm install -g beast-cli
```

> Note: npm package will be published soon.

---

## Docker

```bash
# Build image
docker build -t beast-cli .

# Run
docker run -it beast-cli
```

---

## Verifying Installation

```bash
# Check version
beast --version

# Run doctor (check all dependencies)
beast doctor

# Show help
beast --help
```

---

## Configuration After Install

### 1. Add API Keys

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANTHROPIC_API_KEY=your_key_here
export OPENAI_API_KEY=your_key_here
export OPENROUTER_API_KEY=your_key_here
export DEEPSEEK_API_KEY=your_key_here
export GROQ_API_KEY=your_key_here

# For local models
export OLLAMA_HOST=http://localhost:11434
```

### 2. Create Config File

```bash
# Default location: ~/.beast/config.yaml
mkdir -p ~/.beast
cat > ~/.beast/config.yaml << 'EOF'
provider:
  default: anthropic
  model: claude-sonnet-4-20250514

sandbox:
  mode: workspace-write

memory:
  enabled: true
EOF
```

### 3. For Local Models

**Ollama:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2

# Start server (runs by default)
ollama serve

# Use with Beast CLI
beast --provider ollama --model llama3.2
```

**LM Studio:**
```bash
# Download from https://lmstudio.ai

# 1. Download model in LM Studio
# 2. Enable "Local Server" in settings
# 3. Start server (default port 1234)

# Use with Beast CLI
beast --provider lmstudio --base-url http://localhost:1234/v1
```

**Jan.ai:**
```bash
# Download from https://jan.ai

# 1. Download model in Jan
# 2. Enable "API Server" in settings
# 3. Start server (default port 1337)

# Use with Beast CLI
beast --provider jan --base-url http://localhost:1337/v1
```

---

## Troubleshooting

### "beast: command not found"

```bash
# Add to PATH permanently
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Or check if symlink exists
ls -la ~/.local/bin/beast
```

### "Permission denied"

```bash
# Make executable
chmod +x ~/.beast/dist/beast

# Or run as
sudo ~/.beast/dist/beast --version
```

### "Module not found"

```bash
# Reinstall dependencies
cd ~/.beast
bun install
bun run build
```

---

## Uninstallation

```bash
# Remove symlink
rm ~/.local/bin/beast

# Remove files (optional)
rm -rf ~/.beast

# Remove from shell config
# Edit ~/.bashrc or ~/.zshrc and remove the lines added by install.sh
```

---

## Next Steps

- Read [Getting Started](getting-started.md)
- Configure [Providers](providers.md)
- Learn [Commands](commands.md)
- Join our [Discord](https://discord.gg/simpletools)