#!/bin/bash

# Render CLI Setup Script
# Installs Render CLI for Linux x86_64

set -e

echo "🚀 Setting up Render CLI..."

# Detect architecture
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

echo "Detected: $OS $ARCH"

# Determine download URL
if [ "$ARCH" = "x86_64" ]; then
    BINARY_NAME="render-linux-amd64"
elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    BINARY_NAME="render-linux-arm64"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

# Use render-oss/cli repository (correct one)
# Try amd64 first, fallback to 386
if [ "$ARCH" = "x86_64" ]; then
    DOWNLOAD_URL="https://github.com/render-oss/cli/releases/download/v2.5.0/cli_2.5.0_linux_amd64.zip"
    BINARY_NAME="cli_2.5.0"
elif [ "$ARCH" = "i386" ] || [ "$ARCH" = "i686" ]; then
    DOWNLOAD_URL="https://github.com/render-oss/cli/releases/download/v2.5.0/cli_2.5.0_linux_386.zip"
    BINARY_NAME="cli_2.5.0"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi
INSTALL_DIR="$HOME/.local/bin"
BINARY_PATH="$INSTALL_DIR/render"

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download Render CLI
echo "📥 Downloading Render CLI..."
cd /tmp
ZIP_FILE="render-cli.zip"
if command -v wget &> /dev/null; then
    wget -q "$DOWNLOAD_URL" -O "$ZIP_FILE"
elif command -v curl &> /dev/null; then
    curl -sL "$DOWNLOAD_URL" -o "$ZIP_FILE"
else
    echo "❌ Neither wget nor curl found. Please install one."
    exit 1
fi

# Extract ZIP file
echo "📦 Extracting..."
EXTRACT_DIR="/tmp/render-extract-$$"
mkdir -p "$EXTRACT_DIR"

if command -v unzip &> /dev/null; then
    unzip -q "$ZIP_FILE" -d "$EXTRACT_DIR"
elif command -v python3 &> /dev/null; then
    python3 -c "import zipfile; z = zipfile.ZipFile('$ZIP_FILE'); z.extractall('$EXTRACT_DIR')"
else
    echo "❌ Neither unzip nor python3 found. Please install one."
    exit 1
fi

# Find the binary (could be cli_v2.5.0 or cli)
if [ -f "$EXTRACT_DIR/$BINARY_NAME" ]; then
    EXTRACTED_BINARY="$EXTRACT_DIR/$BINARY_NAME"
elif [ -f "$EXTRACT_DIR/cli" ]; then
    EXTRACTED_BINARY="$EXTRACT_DIR/cli"
else
    echo "❌ Binary not found in ZIP file"
    echo "Contents: $(ls -la $EXTRACT_DIR)"
    exit 1
fi

chmod +x "$EXTRACTED_BINARY"
mv "$EXTRACTED_BINARY" "$BINARY_PATH"
rm -rf "$ZIP_FILE" "$EXTRACT_DIR"

# Add to PATH if not already present
if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
    echo "📝 Adding to PATH..."
    if [ -f "$HOME/.bashrc" ]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
        echo "✅ Added to ~/.bashrc"
    fi
    if [ -f "$HOME/.zshrc" ]; then
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc"
        echo "✅ Added to ~/.zshrc"
    fi
    export PATH="$HOME/.local/bin:$PATH"
fi

# Verify installation
if [ -f "$BINARY_PATH" ] && [ -x "$BINARY_PATH" ]; then
    echo "✅ Render CLI installed successfully!"
    echo ""
    echo "📍 Location: $BINARY_PATH"
    echo ""
    echo "🔐 Next steps:"
    echo "   1. Run: render login"
    echo "   2. Browser will open - click 'Generate token'"
    echo "   3. Close browser tab when done"
    echo "   4. Run: render workspace set"
    echo ""
    echo "📚 For more info, see:"
    echo "   docs/cleanarchitecture/deployment/RENDER_CLI_QUICK_REFERENCE.md"
    echo ""
    
    # Test version
    if "$BINARY_PATH" --version &> /dev/null; then
        echo "✅ Version check:"
        "$BINARY_PATH" --version
    fi
else
    echo "❌ Installation failed!"
    exit 1
fi

