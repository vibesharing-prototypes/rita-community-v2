# Collaboration workflow

This project is developed by two people, each using Claude Code Desktop. Follow these rules to minimize merge conflicts and keep the codebase healthy.

## Branch rules

- Always branch from `main`: `git checkout -b <initials>/<short-description>`
- Keep branches short-lived (1-4 hours of work)
- Rebase on `main` before opening a PR: `git fetch origin && git rebase origin/main`
- Never push directly to `main` — always use a PR
- Delete branches after merging

## Before creating a PR

1. Run `npm run build` (runs `tsc -b && vite build`) and fix all errors
2. Ensure the change is scoped to the task — do not include unrelated changes
3. Update `ROADMAP.md` only in your own section (Person A or Person B)

## File ownership and coordination

### Safe to work on independently
- Files in `src/pages/<your-page>/` — each person owns their page directories

### Coordinate before editing
- `src/App.tsx` — route definitions (additive changes usually auto-merge, but communicate)
- `src/Navigation.tsx` — nav links (same as above)
- `src/components/` — shared components (one person creates and merges, then the other uses)
- `DOMAIN.md` — edit via dedicated PRs or during sync sessions only

### ROADMAP.md rules
- Only edit your own section (Person A or Person B)
- The Milestones section at the top is edited during sync sessions only
- Never modify the other person's section

## PR descriptions

Include in every PR:
- What changed and why
- Which ROADMAP task this addresses
- Any shared files modified (so the reviewer knows to check for coordination issues)
