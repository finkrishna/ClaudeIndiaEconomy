#!/usr/bin/env bash
# Publish the Vite+React app to a GitHub repo. The included Actions workflow
# (.github/workflows/deploy.yml) then builds and deploys to GitHub Pages.
#
# Usage — run from inside the unzipped app/ directory:
#   export GITHUB_TOKEN=github_pat_xxx        # fine-grained PAT for the target repo
#   ./deploy.sh <github-username> <repo-name>
set -euo pipefail
USER="${1:?github username}"; REPO="${2:?repo name}"
: "${GITHUB_TOKEN:?set GITHUB_TOKEN}"
API="https://api.github.com"
H=(-H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28")

echo "→ ensuring repo $USER/$REPO exists"
curl -fsS "${H[@]}" "$API/repos/$USER/$REPO" >/dev/null 2>&1 || \
  curl -fsS "${H[@]}" -X POST "$API/user/repos" \
    -d "{\"name\":\"$REPO\",\"private\":false,\"description\":\"India AI econ-scenarios explorer\"}" >/dev/null

echo "→ pushing source to main"
git init -q 2>/dev/null || true
git checkout -qB main
git add -A
git -c user.email=deploy@local -c user.name=deploy commit -qm "Publish India AI econ-scenarios app" || echo "  (nothing new to commit)"
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/$USER/$REPO.git"
git push -qf origin main

echo "→ setting Pages to build from the GitHub Actions workflow"
curl -fsS "${H[@]}" -X POST "$API/repos/$USER/$REPO/pages" -d '{"build_type":"workflow"}' >/dev/null 2>&1 || \
curl -fsS "${H[@]}" -X PUT  "$API/repos/$USER/$REPO/pages" -d '{"build_type":"workflow"}' >/dev/null 2>&1 || \
  echo "  (enable Pages manually: Settings → Pages → Source = GitHub Actions)"

echo "✓ pushed. The Actions build will publish to: https://$USER.github.io/$REPO/"
echo "  Watch progress under the repo's Actions tab (first run ~1–2 min)."
