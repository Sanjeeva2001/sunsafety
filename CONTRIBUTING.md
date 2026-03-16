# Contributing

This project uses a pull-request workflow.

## Branch Rules

- Do not commit directly to `main`.
- Create a feature branch from `main` for each task.
- Open a pull request from your feature branch into `main`.
- Wait for review and approval before merge.

## Local Workflow

1. Sync your local `main`:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Create a branch for your work:

   ```bash
   git checkout -b feature/<short-name>
   ```

3. Make changes, then commit:

   ```bash
   git add .
   git commit -m "feat: <summary>"
   ```

4. Push your branch:

   ```bash
   git push -u origin feature/<short-name>
   ```

5. Open a pull request on GitHub:

- Base branch: `main`
- Compare branch: `feature/<short-name>`

## After Merge

```bash
git checkout main
git pull origin main
git branch -d feature/<short-name>
```

Optional remote cleanup:

```bash
git push origin --delete feature/<short-name>
```

## Recommended Repository Settings

In GitHub branch protection for `main`, enable:

- Require a pull request before merging
- Require at least one approval
- Require status checks to pass (if CI is configured)
- Include administrators
