# Contributing to Beast CLI

We welcome contributions! Please follow these guidelines.

---

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `bun install`
4. Build: `bun run build`
5. Test: `bun test`

---

## Development Workflow

### Branch Naming

```
feature/your-feature-name
bugfix/issue-number
docs/update-readme
```

### Commits

Follow conventional commits:

```
feat: add new provider support
fix: resolve sandbox issue
docs: update installation guide
refactor: simplify provider factory
test: add provider integration tests
```

### Pull Requests

1. Create a descriptive PR title
2. Reference issues: "Fixes #123"
3. Describe what changed
4. Include screenshots for UI changes

---

## Code Style

- TypeScript with strict mode
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100

---

## Testing

```bash
# Run all tests
bun test

# Run specific test
bun test test-p1.ts

# Run with coverage
bun test --coverage
```

---

## Documentation

- Update relevant docs in `/docs`
- Add examples for new features
- Keep README.md current

---

## Questions?

- Open an issue for bugs
- Start a discussion for ideas
- Join our Discord for chat

---

## License

By contributing, you agree your contributions will be licensed under MIT.