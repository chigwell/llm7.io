#!/bin/bash

# VUI Release Script
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 1.3.1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if version is provided
if [ -z "$1" ]; then
    print_error "Version is required!"
    echo "Usage: $0 <version>"
    echo "Example: $0 1.3.1"
    echo ""
    echo "Available shortcuts:"
    echo "  yarn release:patch  - Increment patch version (1.3.0 → 1.3.1)"
    echo "  yarn release:minor  - Increment minor version (1.3.0 → 1.4.0)"
    echo "  yarn release:major  - Increment major version (1.3.0 → 2.0.0)"
    exit 1
fi

VERSION="$1"
TAG="v$VERSION"

print_status "Starting release process for version $VERSION"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Working directory is not clean. Uncommitted changes detected:"
    git status --short
    echo
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Release cancelled."
        exit 1
    fi
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    print_error "Tag $TAG already exists!"
    exit 1
fi

# Update package.json version
print_status "Updating package.json version to $VERSION"
if command -v jq >/dev/null 2>&1; then
    # Use jq if available (more reliable)
    jq ".version = \"$VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json
else
    # Fallback to sed
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json && rm package.json.bak
fi

# Run tests and build
print_status "Running tests and build..."
yarn install --frozen-lockfile
yarn lint
yarn build

print_success "Build completed successfully!"

# Commit version change
print_status "Committing version change..."
git add package.json
git commit -m "chore: bump version to $VERSION"

# Create and push tag
print_status "Creating and pushing tag $TAG..."
git tag -a "$TAG" -m "Release version $VERSION"
git push origin main
git push origin "$TAG"

print_success "🎉 Release $VERSION has been created!"
print_status "GitHub Actions will now build and create the release automatically."
print_status "Check the progress at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"

echo
print_status "Release assets will include:"
echo "  📦 vui-$TAG.zip (source code)"
echo "  🏗️  vui-built-$TAG.zip (built version)"
echo
print_success "All done! 🚀"