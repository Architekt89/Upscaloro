# Handling Large Files in Git for Upscalor

This guide provides instructions for dealing with large files in the Upscalor project that exceed GitHub's file size limit of 100MB.

## Identified Large Files

The following files exceed GitHub's 100MB limit:

- `backend/venv/lib/python3.9/site-packages/torch/lib/libtorch_cpu.dylib` (177.57 MB)
- `frontend/node_modules/@next/swc-darwin-arm64/next-swc.darwin-arm64.node` (101.20 MB)

## Finding Large Files

We've provided a script to help you identify large files in your repository:

```bash
chmod +x find_large_files.sh
./find_large_files.sh
```

By default, this script will find files larger than 50MB. You can specify a different threshold:

```bash
./find_large_files.sh 10  # Find files larger than 10MB
```

The script will:
1. Search for large files in your working directory (excluding .git, node_modules, and venv)
2. Check for large files in Git history
3. Identify large Git objects

## Solution: Using .gitignore

We've added these directories to the `.gitignore` file to prevent them from being tracked by Git:

```
# Project specific
backend/venv/
frontend/node_modules/
*.dylib
*.so
*.dll
*.pyd
*.node
```

## If You've Already Committed Large Files

If you've already committed these large files to your repository, you can use our cleanup script:

```bash
chmod +x cleanup_large_files.sh
./cleanup_large_files.sh
```

This script will:
1. Create a backup branch of your current state
2. Remove large files from Git history
3. Optionally force push the cleaned repository

If you prefer to do this manually, follow these steps:

1. **Remove the files from Git history**:

   ```bash
   # Install git-filter-repo if you don't have it
   # On macOS: brew install git-filter-repo
   # On Ubuntu: apt-get install git-filter-repo
   # Or with pip: pip install git-filter-repo

   # Clone a fresh copy of your repository
   git clone --mirror https://github.com/yourusername/upscalor.git upscalor-mirror
   cd upscalor-mirror

   # Remove the large files from history
   git filter-repo --path backend/venv --invert-paths
   git filter-repo --path frontend/node_modules --invert-paths
   git filter-repo --path-glob "*.dylib" --invert-paths
   git filter-repo --path-glob "*.node" --invert-paths

   # Push the cleaned repository
   git push --force
   ```

2. **Update your local repository**:

   ```bash
   # Go back to your original repository
   cd ../upscalor

   # Fetch the cleaned repository
   git fetch --all

   # Reset your local branch to the cleaned remote branch
   git reset --hard origin/main  # or whatever your branch name is
   ```

## Alternative: Git LFS (Large File Storage)

If you need to track large files in your repository, consider using Git LFS:

1. **Install Git LFS**:

   ```bash
   # On macOS
   brew install git-lfs

   # On Ubuntu
   apt-get install git-lfs

   # On Windows
   # Download from https://git-lfs.github.com/
   ```

2. **Initialize Git LFS**:

   ```bash
   cd upscalor
   git lfs install
   ```

3. **Track large file types**:

   ```bash
   git lfs track "*.dylib"
   git lfs track "*.node"
   git lfs track "*.pt"  # PyTorch model files
   git lfs track "*.pth"  # PyTorch model files
   ```

4. **Commit the .gitattributes file**:

   ```bash
   git add .gitattributes
   git commit -m "Configure Git LFS for large files"
   ```

## Best Practices for This Project

1. **Never commit the virtual environment or node_modules**:
   - Always use the provided setup script (`setup.sh`) to create these locally
   - These should remain in the `.gitignore` file

2. **For model files**:
   - Store large model files externally (e.g., AWS S3, Google Cloud Storage)
   - Add a download script to fetch them during setup

3. **For development**:
   - Use the `.gitignore` file provided in this repository
   - Run `git status` before committing to ensure no large files are being tracked
   - Periodically run `./find_large_files.sh` to check for large files

## Dependency Management

Instead of committing dependencies, use the proper dependency management files:

- For Python: `requirements.txt`
- For Node.js: `package.json` and `package-lock.json`

These files are small and can be committed to the repository. Users can then install the dependencies locally using:

```bash
# For Python
pip install -r requirements.txt

# For Node.js
npm install
```

## Using the Setup Script

The provided `setup.sh` script will handle the installation of dependencies for you:

```bash
chmod +x setup.sh
./setup.sh
```

## For Team Members After Cleanup

If a team member has cleaned up the repository using the methods above, other team members should follow these steps:

1. **Fetch the latest changes**:
   ```bash
   git fetch origin
   ```

2. **Reset your local branch to match the remote**:
   ```bash
   git reset --hard origin/main  # or whatever your branch name is
   ```

3. **Clean up any untracked files**:
   ```bash
   git clean -fd
   ```

4. **Reinstall dependencies**:
   ```bash
   ./setup.sh
   ``` 