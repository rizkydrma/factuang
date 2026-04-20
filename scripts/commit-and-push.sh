#!/usr/bin/env bash

set -euo pipefail

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository."
  exit 1
fi

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

generate_commit_message() {
  local file_count
  local file_list
  local insertions
  local deletions

  file_count="$(git diff --cached --name-only | wc -l | tr -d ' ')"
  file_list="$(git diff --cached --name-only | head -n 4 | paste -sd ', ' -)"
  if [[ -z "${file_list}" ]]; then
    file_list="project files"
  fi

  insertions="$(git diff --cached --numstat | awk '{ins += $1} END {print ins + 0}')"
  deletions="$(git diff --cached --numstat | awk '{del += $2} END {print del + 0}')"

  echo "chore: update ${file_count} file(s) (${insertions}+/${deletions}-) - ${file_list}"
}

git add .

if git diff --cached --quiet; then
  echo "No staged changes after git add ."
  exit 0
fi

COMMIT_MESSAGE="${COMMIT_MESSAGE:-}"
if [[ -z "${COMMIT_MESSAGE}" ]]; then
  COMMIT_MESSAGE="$(generate_commit_message)"
fi

if [[ "${DRY_RUN}" -eq 1 ]]; then
  echo "[DRY RUN] Commit message: ${COMMIT_MESSAGE}"
  git status --short
  exit 0
fi

git commit -m "${COMMIT_MESSAGE}"
git push

echo "Committed and pushed with message:"
echo "${COMMIT_MESSAGE}"
