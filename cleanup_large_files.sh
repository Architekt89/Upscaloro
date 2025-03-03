#!/bin/bash

# Cleanup Large Files Script for Upscalor
# This script helps remove large files from Git history

echo "🧹 Starting Git repository cleanup for large files..."

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &>/dev/null; then
    echo "❌ git-filter-repo is not installed."
    echo "Please install it using one of the following methods:"
    echo "  - macOS: brew install git-filter-repo"
    echo "  - Ubuntu: apt-get install git-filter-repo"
    echo "  - pip: pip install git-filter-repo"
    exit 1
fi

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ This doesn't appear to be a Git repository."
    echo "Please run this script from the root of your Git repository."
    exit 1
fi

# Warn the user about the destructive nature of this operation
echo "⚠️  WARNING: This script will rewrite Git history and force push to the remote repository."
echo "This is a destructive operation that cannot be undone."
echo "Make sure you have a backup of your repository before proceeding."
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 1
fi

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📋 Current branch: $CURRENT_BRANCH"

# Create a backup branch
BACKUP_BRANCH="backup-before-cleanup-$(date +%Y%m%d%H%M%S)"
echo "📦 Creating backup branch: $BACKUP_BRANCH"
git branch $BACKUP_BRANCH

# Remove large files from Git history
echo "🔄 Removing large files from Git history..."
echo "This may take a while depending on the size of your repository."

# Remove virtual environment
echo "🔍 Removing backend/venv directory from history..."
git filter-repo --path backend/venv --invert-paths --force

# Remove node_modules
echo "🔍 Removing frontend/node_modules directory from history..."
git filter-repo --path frontend/node_modules --invert-paths --force

# Remove dylib files
echo "🔍 Removing *.dylib files from history..."
git filter-repo --path-glob "*.dylib" --invert-paths --force

# Remove node binary files
echo "🔍 Removing *.node files from history..."
git filter-repo --path-glob "*.node" --invert-paths --force

# Remove other potential large files
echo "🔍 Removing other potential large files from history..."
git filter-repo --path-glob "*.so" --invert-paths --force
git filter-repo --path-glob "*.dll" --invert-paths --force
git filter-repo --path-glob "*.pyd" --invert-paths --force

echo "✅ Git history has been rewritten."

# Ask if the user wants to force push
echo "⚠️  The next step is to force push the cleaned repository to the remote."
echo "This will overwrite the remote repository history."
read -p "Do you want to force push now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Get the remote name (usually 'origin')
    REMOTE=$(git remote | head -n 1)
    if [ -z "$REMOTE" ]; then
        echo "❌ No remote repository found."
        exit 1
    fi
    
    echo "🚀 Force pushing to $REMOTE/$CURRENT_BRANCH..."
    git push --force $REMOTE $CURRENT_BRANCH
    
    echo "✅ Force push complete."
    echo "Your repository has been cleaned of large files."
else
    echo "Force push cancelled."
    echo "You can manually push the changes later with:"
    echo "  git push --force origin $CURRENT_BRANCH"
fi

echo "
🎉 Cleanup complete! 🎉

The following steps were performed:
1. Created a backup branch: $BACKUP_BRANCH
2. Removed large files from Git history
3. Force pushed the cleaned repository (if you chose to)

Next steps:
1. Make sure your .gitignore file includes the patterns for large files
2. Inform your team members to pull the latest changes and reset their local repositories
3. Team members should run: git fetch && git reset --hard origin/$CURRENT_BRANCH

For more information, see git_large_files_guide.md
" 