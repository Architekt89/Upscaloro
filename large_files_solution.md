# Solution for Large Files in Upscalor Repository

## Problem

The repository contains files that exceed GitHub's 100MB file size limit:

- `backend/venv/lib/python3.9/site-packages/torch/lib/libtorch_cpu.dylib` (177.57 MB)
- `frontend/node_modules/@next/swc-darwin-arm64/next-swc.darwin-arm64.node` (101.20 MB)

These files are causing issues when trying to push to GitHub.

## Solution Implemented

We've implemented a comprehensive solution to handle large files in the repository:

1. **Created a proper `.gitignore` file** that excludes:
   - Python virtual environments (`backend/venv/`)
   - Node.js dependencies (`frontend/node_modules/`)
   - Binary files (`.dylib`, `.so`, `.dll`, `.pyd`, `.node`)
   - Large model files (`.pt`, `.pth`, `.onnx`, etc.)

2. **Provided scripts for managing large files**:
   - `find_large_files.sh`: Identifies large files in the repository
   - `cleanup_large_files.sh`: Removes large files from Git history

3. **Added documentation**:
   - `git_large_files_guide.md`: Detailed guide for handling large files
   - Updated `README.md` with information about large files
   - Created `.gitattributes` for Git LFS configuration (optional)

## How to Use

### If you haven't pushed the large files yet:

1. Add the `.gitignore` file to your repository:
   ```bash
   git add .gitignore
   git commit -m "Add .gitignore to exclude large files"
   ```

2. Continue development without worrying about large files.

### If you've already committed large files:

1. Run the cleanup script:
   ```bash
   chmod +x cleanup_large_files.sh
   ./cleanup_large_files.sh
   ```

2. The script will:
   - Create a backup branch
   - Remove large files from Git history
   - Optionally force push the cleaned repository

### For team members:

After the repository has been cleaned, team members should:

1. Fetch the latest changes:
   ```bash
   git fetch origin
   ```

2. Reset their local branch:
   ```bash
   git reset --hard origin/main
   ```

3. Reinstall dependencies:
   ```bash
   ./setup.sh
   ```

## Alternative: Git LFS

If you need to track large files, you can use Git LFS:

1. Install Git LFS: https://git-lfs.github.com/
2. Initialize Git LFS: `git lfs install`
3. Use the provided `.gitattributes` file: `git add .gitattributes`
4. Commit: `git commit -m "Configure Git LFS"`

## Best Practices Going Forward

1. Never commit dependencies (use `requirements.txt` and `package.json` instead)
2. Use the setup script (`setup.sh`) to install dependencies locally
3. Periodically run `./find_large_files.sh` to check for large files
4. Always check `git status` before committing to ensure no large files are being tracked

## Additional Resources

- [GitHub Documentation on Large Files](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [Git LFS Documentation](https://git-lfs.github.com/)
- [Git Filter-Repo Documentation](https://github.com/newren/git-filter-repo) 