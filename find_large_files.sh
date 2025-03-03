#!/bin/bash

# Find Large Files Script for Upscalor
# This script helps identify large files in the repository

echo "🔍 Searching for large files in the repository..."

# Default size threshold (in MB)
SIZE_THRESHOLD=50

# Check if a size threshold was provided
if [ $# -eq 1 ]; then
    SIZE_THRESHOLD=$1
fi

echo "Looking for files larger than ${SIZE_THRESHOLD}MB..."

# Find large files, excluding .git, node_modules, and venv directories
find . -type f -size +${SIZE_THRESHOLD}M -not -path "*/\.*" -not -path "*/node_modules/*" -not -path "*/venv/*" | while read file; do
    # Get file size in MB
    size=$(du -m "$file" | cut -f1)
    echo "- $file (${size}MB)"
done

# Check for large files in Git history
echo -e "\n🔍 Checking for large files in Git history..."

# Check if git-filter-repo is installed for more detailed analysis
if command -v git-filter-repo &>/dev/null; then
    echo "For a detailed analysis of large files in Git history, run:"
    echo "git filter-repo --analyze"
    echo "Then check the .git/filter-repo/analysis directory for reports."
else
    echo "For more detailed analysis, install git-filter-repo:"
    echo "  - macOS: brew install git-filter-repo"
    echo "  - Ubuntu: apt-get install git-filter-repo"
    echo "  - pip: pip install git-filter-repo"
fi

# Check for large files in Git objects
echo -e "\n🔍 Checking for large Git objects..."
git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | while read hash type size rest; do
    if [ "$type" = "blob" ] && [ $size -gt $((SIZE_THRESHOLD * 1024 * 1024)) ]; then
        # Convert size to MB for display
        size_mb=$(echo "scale=2; $size / 1024 / 1024" | bc)
        # Get the filename
        file=$(git rev-list --objects --all | grep $hash | awk '{print $2}')
        echo "- $file (${size_mb}MB)"
    fi
done

echo -e "\n✅ Search complete!"
echo "If you found large files that shouldn't be in the repository, use cleanup_large_files.sh to remove them."
echo "For more information, see git_large_files_guide.md" 