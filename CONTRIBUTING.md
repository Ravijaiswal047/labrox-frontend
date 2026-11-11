# Contributing to LabRox Web

Thank you for contributing to the LabRox Enterprise LIMS frontend.

## Branching Strategy (Git Flow-Lite)
- `main`: Production-ready, locked, tagged releases only.
- `develop`: Integration branch for tested features and UI enhancements.
- `feature/<name>`: Feature branch cut from `develop`.
- `fix/<name>`: Bugfix branch cut from `develop`.

Direct pushes to `main` and `develop` are prohibited. All code merges via Pull Requests.

## Commit Message Conventions
We enforce [Conventional Commits](https://www.conventionalcommits.org/):
`type(scope): concise description in imperative mood`

Examples:
- `feat(result-entry): add numeric validation and auto-calculation`
- `fix(sample-collection): prevent duplicate submission on collect click`
- `perf(worklist): implement virtualized table for 5,000+ patient records`
- `docs(ui): document design tokens and clinical theme palette`

## Signed Commits
All commits must be cryptographically signed using SSH or GPG keys:
```bash
git config commit.gpgsign true
git config user.signingkey ~/.ssh/id_ed25519.pub
```

## Pull Request Checklist
Before opening a PR into `develop`:
1. [ ] `npm run build` passes without errors.
2. [ ] `npm test` passes.
3. [ ] Zero API keys, tokens, or `.env` files committed.
4. [ ] All commits are signed.
5. [ ] Accessibility and cross-browser responsiveness verified.
