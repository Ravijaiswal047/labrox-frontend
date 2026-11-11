# LabRox Web Git Workflow & Release Governance

## 1. Branch Strategy (Git Flow-Lite)

- **`main`**: Production-ready code only. Direct push is blocked. Protected branch requiring ≥ 2 reviews, signed commits, and all CI checks green.
- **`develop`**: Integration branch for new features and UI enhancements. Protected branch.
- **`feature/<ticket-description>`**: Cut from `develop`, merged back via PR.
- **`fix/<ticket-description>`**: Cut from `develop`, merged back via PR.

## 2. Commit Signing Policy (21 CFR Part 11)

All commits must be cryptographically signed with an approved SSH or GPG key:
```bash
git config commit.gpgsign true
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
```

## 3. Conventional Commits Standard

Format: `<type>(<scope>): <subject>`

Examples:
- `feat(result-entry): add numeric validation and auto-calculation`
- `fix(sample-collection): prevent duplicate submission on collect click`
- `perf(worklist): implement virtualized table for 5,000+ patient records`
- `docs(ui): document design tokens and clinical theme palette`

## 4. Release Lifecycle

1. Features tested on `develop` are promoted to `main` via PR.
2. Tagging triggers the automated release workflow:
   ```bash
   git tag -s -a v0.1.0 -m "Release v0.1.0: First production-ready LIMS frontend baseline"
   git push origin v0.1.0
   ```
3. GitHub Actions builds the production bundle (`dist/`), compresses it, and publishes the release.
