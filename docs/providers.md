# Supported Providers

Beast CLI supports 45+ LLM providers.

---

## Cloud Providers

### Anthropic (Claude)

```bash
export ANTHROPIC_API_KEY=your_key_here

beast --provider anthropic --model claude-sonnet-4-20250514
```

**Models:**
- `claude-sonnet-4-20250514`
- `claude-3-5-sonnet-20241022`
- `claude-3-opus-20240229`
- `claude-3-haiku-20240307`

### OpenAI

```bash
export OPENAI_API_KEY=your_key_here

beast --provider openai --model gpt-4o
```

**Models:**
- `gpt-4o`
- `gpt-4o-mini`
- `gpt-4-turbo`
- `gpt-3.5-turbo`
- `o1-preview`
- `o1-mini`

### OpenRouter

```bash
export OPENROUTER_API_KEY=your_key_here

beast --provider openrouter --model qwen/qwen-2.5-72b-instruct
```

**Features:** Access to 100+ models via single API

### DeepSeek

```bash
export DEEPSEEK_API_KEY=your_key_here

beast --provider deepseek --model deepseek-chat
```

**Models:**
- `deepseek-chat`
- `deepseek-coder`

### Groq

```bash
export GROQ_API_KEY=your_key_here

beast --provider groq --model llama-3.1-8b-instant
```

**Features:** Ultra-fast inference

### Google Gemini

```bash
export GEMINI_API_KEY=your_key_here

beast --provider gemini --model gemini-1.5-pro
```

### Mistral

```bash
export MISTRAL_API_KEY=your_key_here

beast --provider mistral --model mistral-large-latest
```

### Qwen (Alibaba)

```bash
export DASHSCOPE_API_KEY=your_key_here

beast --provider qwen --model qwen-plus
```

---

## Local Providers

### Ollama

```bash
# Install
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3.2

# Start server
ollama serve

# Use
beast --provider ollama --model llama3.2
```

**Features:**
- Completely free
- Runs locally (privacy)
- Many models available

### LM Studio

```bash
# 1. Download from https://lmstudio.ai
# 2. Download a model
# 3. Enable "Local Server" in settings
# 4. Click "Start Server" (default port 1234)

beast --provider lmstudio --base-url http://localhost:1234/v1
```

**Features:**
- User-friendly GUI
- Model library built-in
- GPU acceleration

### Jan.ai

```bash
# 1. Download from https://jan.ai
# 2. Download a model
# 3. Enable "API Server" in settings
# 4. Click "Start Server" (default port 1337)

beast --provider jan --base-url http://localhost:1337/v1
```

**Features:**
- Offline-first
- NVIDIA/Apple Silicon support
- Customizable

---

## Provider Configuration

### In config.yaml

```yaml
provider:
  default: anthropic
  model: claude-sonnet-4-20250514

  # Or specify multiple
  models:
    fast: gpt-4o-mini
    balanced: claude-sonnet-4-20250514
    powerful: gpt-4o
```

### Environment Variables

| Provider | Variable |
|----------|----------|
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| OpenRouter | `OPENROUTER_API_KEY` |
| DeepSeek | `DEEPSEEK_API_KEY` |
| Groq | `GROQ_API_KEY` |
| Gemini | `GEMINI_API_KEY` |
| Mistral | `MISTRAL_API_KEY` |
| Qwen | `DASHSCOPE_API_KEY` |
| Ollama | `OLLAMA_HOST` (default: localhost:11434) |
| LM Studio | `LMSTUDIO_HOST` (default: localhost:1234) |
| Jan | `JAN_HOST` (default: localhost:1337) |

---

## Switching Providers

### In-session

```
beast > provider openai
beast > provider ollama --model llama3.2
```

### Via CLI

```bash
beast --provider anthropic "Your message"
beast --provider openai "Your message"
beast --provider ollama --model phi3 "Your message"
```

---

## Testing Providers

```bash
# Run provider tests
bun test-providers.ts

# Test specific provider
beast --provider ollama --model llama3.2 "Say hello"
```

---

## Recommendations

| Use Case | Provider |
|----------|----------|
| Best overall | Claude (Anthropic) |
| Fast/cheap | GPT-4o-mini, Groq |
| Code-focused | DeepSeek Coder |
| Local/privacy | Ollama, LM Studio, Jan |
| Many models | OpenRouter |