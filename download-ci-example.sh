#!/bin/bash

# Download CI example workflow

REPO_URL="https://raw.githubusercontent.com/sara-golombeck/app-translator/main"
TARGET_DIR=".github/workflows"

echo "📥 Downloading CI example..."

# Create directory if not exists
mkdir -p "$TARGET_DIR"

# Download the file
curl -o "$TARGET_DIR/example-ci.yml" "$REPO_URL/.github/workflows/example-ci.yml"

if [ $? -eq 0 ]; then
    echo "✅ Downloaded to $TARGET_DIR/example-ci.yml"
    echo ""
    echo "📝 Next steps:"
    echo "1. Edit the file and replace 'sara3259' with your DockerHub username"
    echo "2. Commit and push to trigger the workflow"
else
    echo "❌ Download failed"
    exit 1
fi
