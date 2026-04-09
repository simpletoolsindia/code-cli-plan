#!/usr/bin/env bash
#
# Beast CLI Installation Script
# Version: 1.0.0
# URL: https://github.com/simpletoolsindia/beast-cli
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emoji
CHECK="✅"
CROSS="❌"
ARROW="👉"

# Configuration
REPO="simpletoolsindia/beast-cli"
INSTALL_DIR="${HOME}/.beast"
BIN_DIR="${HOME}/.local/bin"
GITHUB_RAW="https://raw.githubusercontent.com/${REPO}/main"

# Print functions
print_header() {
    echo ""
    echo -e "${BLUE}🐉 Beast CLI Installer v1.0.0${NC}"
    echo "================================"
    echo ""
}

print_step() {
    echo -e "${YELLOW}${ARROW} $1${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."

    local missing=()

    # Check for curl or wget
    if ! command -v curl &> /dev/null && ! command -v wget &> /dev/null; then
        missing+=("curl or wget")
    fi

    # Check for bun, npm, or node
    if ! command -v bun &> /dev/null && ! command -v npm &> /dev/null; then
        missing+=("bun or npm")
    fi

    if [ ${#missing[@]} -gt 0 ]; then
        echo ""
        print_error "Missing required dependencies: ${missing[*]}"
        echo ""
        echo "Please install the missing dependencies:"
        echo ""
        echo "  Bun (recommended):"
        echo "    curl -fsSL https://bun.sh/install | bash"
        echo ""
        echo "  Or npm:"
        echo "    npm install -g npm"
        echo ""
        exit 1
    fi

    print_success "Prerequisites OK"
}

# Detect OS
detect_os() {
    print_step "Detecting system..."

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
        OS="windows"
    else
        OS="unknown"
    fi

    print_success "Detected: ${OS}"
}

# Install Bun if needed
install_bun() {
    if command -v bun &> /dev/null; then
        print_success "Bun already installed: $(bun --version)"
        return
    fi

    print_step "Installing Bun..."

    if command -v curl &> /dev/null; then
        curl -fsSL https://bun.sh/install | bash
    elif command -v wget &> /dev/null; then
        wget -qO- https://bun.sh/install | bash
    fi

    # Source bun env
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"

    if command -v bun &> /dev/null; then
        print_success "Bun installed: $(bun --version)"
    else
        print_error "Failed to install Bun"
        exit 1
    fi
}

# Create directories
setup_directories() {
    print_step "Creating directories..."

    mkdir -p "${INSTALL_DIR}"
    mkdir -p "${BIN_DIR}"
    mkdir -p "${HOME}/.claude/projects"

    print_success "Directories created"
}

# Clone or update repo
clone_or_update() {
    print_step "Setting up Beast CLI..."

    if [ -d "${INSTALL_DIR}/src" ]; then
        print_info "Updating existing installation..."
        cd "${INSTALL_DIR}"
        git pull origin main 2>/dev/null || print_info "Not a git repo, using existing files"
    else
        # Clone repository
        if command -v git &> /dev/null; then
            git clone https://github.com/${REPO}.git "${INSTALL_DIR}"
        else
            # Download as zip
            print_info "Git not found, downloading release..."
            local zip_url="https://github.com/${REPO}/archive/refs/heads/main.zip"
            curl -fsSL -o /tmp/beast-cli.zip "${zip_url}"
            unzip -q /tmp/beast-cli.zip -d "${INSTALL_DIR}"
            rm /tmp/beast-cli.zip
        fi
    fi

    print_success "Beast CLI files ready"
}

# Install dependencies and build
build_beast() {
    print_step "Installing dependencies..."

    cd "${INSTALL_DIR}"

    if command -v bun &> /dev/null; then
        bun install
        bun run build
    elif command -v npm &> /dev/null; then
        npm install
        npm run build
    fi

    print_success "Beast CLI built"
}

# Create symlink
create_symlink() {
    print_step "Creating symlink..."

    local beast_bin="${INSTALL_DIR}/dist/beast"

    # Check if dist/beast exists
    if [ ! -f "${beast_bin}" ]; then
        # Try dist/index.js with shebang
        beast_bin="${INSTALL_DIR}/dist/index.js"
        if [ ! -f "${beast_bin}" ]; then
            print_error "Build output not found. Please run: bun run build"
            exit 1
        fi
    fi

    # Remove existing symlink if any
    rm -f "${BIN_DIR}/beast" 2>/dev/null

    # Create symlink
    ln -s "${beast_bin}" "${BIN_DIR}/beast"

    # Make executable
    chmod +x "${beast_bin}"

    print_success "Symlink created: ${BIN_DIR}/beast"
}

# Setup shell integration
setup_shell() {
    print_step "Setting up shell integration..."

    local shell_config=""
    local shell_name=""

    if [ -n "$BASH_VERSION" ]; then
        shell_config="${HOME}/.bashrc"
        shell_name="bash"
    elif [ -n "$ZSH_VERSION" ]; then
        shell_config="${HOME}/.zshrc"
        shell_name="zsh"
    fi

    if [ -n "$shell_config" ]; then
        # Add to PATH if not already there
        if ! grep -q "${BIN_DIR}" "${shell_config}"; then
            echo "" >> "${shell_config}"
            echo "# Beast CLI" >> "${shell_config}"
            echo "export PATH=\"${BIN_DIR}:\$PATH\"" >> "${shell_config}"
        fi

        # Add bun path if needed
        if ! command -v bun &> /dev/null && [ -f "${HOME}/.bun/bin/bun" ]; then
            if ! grep -q ".bun/bin" "${shell_config}"; then
                echo 'export BUN_INSTALL="$HOME/.bun"' >> "${shell_config}"
                echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> "${shell_config}"
            fi
        fi

        print_success "Added to ${shell_name} config: ${shell_config}"
    fi
}

# Create config file
create_config() {
    print_step "Creating default config..."

    local config_file="${INSTALL_DIR}/config.yaml"

    if [ -f "${config_file}" ]; then
        print_info "Config already exists, skipping..."
        return
    fi

    cat > "${config_file}" << 'EOF'
# Beast CLI Configuration
# https://github.com/simpletoolsindia/beast-cli

# Provider settings
provider:
  default: anthropic
  model: claude-sonnet-4-20250514

# Sandbox mode (read-only | workspace-write | danger-full-access)
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

# Memory settings
memory:
  enabled: true
  autoSync: true

# Collaboration mode (solo | pair | review | teach)
collab:
  mode: solo

# MCP servers (optional)
mcp:
  servers: []
EOF

    print_success "Config created: ${config_file}"
}

# Print next steps
print_next_steps() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Beast CLI installed successfully!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "  1. Add API keys to your shell profile:"
    echo ""
    echo "     # For ~/.bashrc or ~/.zshrc:"
    echo "     export ANTHROPIC_API_KEY=your_key_here"
    echo "     export OPENAI_API_KEY=your_key_here"
    echo ""
    echo "  2. Reload your shell:"
    echo ""
    echo "     source ~/.bashrc  # or source ~/.zshrc"
    echo ""
    echo "  3. Start Beast CLI:"
    echo ""
    echo "     beast"
    echo ""
    echo "  4. For local models, start Ollama first:"
    echo ""
    echo "     ollama serve"
    echo "     beast --provider ollama --model llama3.2"
    echo ""
    echo -e "${BLUE}Documentation: https://github.com/${REPO}${NC}"
    echo -e "${BLUE}Config file: ${INSTALL_DIR}/config.yaml${NC}"
    echo ""
}

# Main installation
main() {
    print_header

    check_prerequisites
    detect_os
    install_bun
    setup_directories
    clone_or_update
    build_beast
    create_symlink
    setup_shell
    create_config

    print_next_steps
}

# Run
main "$@"