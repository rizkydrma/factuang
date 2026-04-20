# Codex Project Rules (Factuang)

Scope: only this repository.

## Utility Reuse Rule

- Before creating any new formatter/helper/utility function, always inspect `src/lib/utils.ts` first.
- Reuse or extend existing functions in `src/lib/utils.ts` when possible.
- Avoid adding redundant utility functions with overlapping behavior.
- If a new behavior is needed, prefer adding optional parameters to an existing utility rather than creating a parallel function.

## Commit Command Rule

- When user writes `/commit`, run `scripts/commit-and-push.sh`.
- The script must generate a commit message automatically, then run: `git add .` -> `git commit -m "<generated_message>"` -> `git push`.
- Optional override: set env var `COMMIT_MESSAGE` before running the script to force a custom message.
