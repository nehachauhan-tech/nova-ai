# Pull Before Git Add

Always execute `git pull` (or `git pull --rebase`) to sync with the remote repository before running `git add` and `git commit`. This is required to minimize and resolve any conflicting commits prior to introducing local source changes.
