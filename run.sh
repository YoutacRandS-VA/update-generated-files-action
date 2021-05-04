#!/bin/bash
set -o pipefail
set -eux

status="$(git status --porcelain)"
if [ -z "$status" ]; then
  : nothing to commit
  exit 0
fi

if [[ $GITHUB_EVENT_NAME == push ]]; then
  : "ERROR: $GITHUB_REF is broken because there is difference between sources and generated files"
  exit 1
fi

git config user.name "$GIT_COMMITTER_NAME"
git config user.email "$GIT_COMMITTER_EMAIL"

git add .
git status
git commit -m "$GIT_MESSAGE"
git push
