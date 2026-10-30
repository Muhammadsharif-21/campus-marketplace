# Git Rollback & Branch Management Guide

## How to Roll Back / Switch Back to `main`

If you do not like the experimental changes and want to return to the `main` branch cleanly:

1. **Switch back to `main` branch:**
   ```bash
   git checkout main
   ```

2. **If you want to completely delete the experimental feature branch:**
   ```bash
   git branch -D feature/author-contact-and-chat
   ```

3. **If you decide you like the feature and want to merge it into `main`:**
   ```bash
   git checkout main
   git merge feature/author-contact-and-chat
   ```
