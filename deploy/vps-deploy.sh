#!/usr/bin/env bash
# Server-side deploy for lab.tj-hosting.ca on cmhs-vps.
# Run by site-autodeploy in hook mode when `main` moves (see C:\localhost\projects\server\autodeploy\README.md):
#   SRC=<repo checked out at SHA> TARGET=<docroot> OWNER=<user:group> SHA=<commit> [NODE_BIN] bash deploy/vps-deploy.sh
# No build step: the Lab is plain static files. It publishes what GitHub Pages published: the repo minus
# _config.yml's exclude list, dotfiles and Jekyll's _ files, plus deploy/ and CNAME (Pages only).
# Exit 0 = deployed; anything else = failed, and the live site is left as it was.
set -euo pipefail
: "${SRC:?}" "${TARGET:?}" "${OWNER:?}" "${SHA:?}"

[ -f "$SRC/index.html" ] && [ -f "$SRC/404.html" ] || { echo "vps-deploy: index.html or 404.html missing in $SRC"; exit 1; }
[ -d "$TARGET" ] || { echo "vps-deploy: target $TARGET missing"; exit 1; }

# Root-anchored, so a nested folder that happens to share a name is still published.
EXCLUDE=(README.md CREDITS.md TASKS.md TESTING.md package.json package-lock.json node_modules
         assets dispatches docs evidence tests tools deploy CNAME)

stage=$(mktemp -d); trap 'rm -rf "$stage"' EXIT
args=(-a --exclude='.*' --exclude='_*')
for x in "${EXCLUDE[@]}"; do args+=(--exclude="/$x"); done
rsync "${args[@]}" "$SRC/" "$stage/"

# Plesk serves through Apache; GitHub Pages used 404.html on its own.
printf 'ErrorDocument 404 /404.html\n' > "$stage/.htaccess"

# Never publish internals, whatever the lists above say.
for bad in .git evidence dispatches tools tests node_modules deploy; do
  [ ! -e "$stage/$bad" ] || { echo "vps-deploy: refusing, $bad is in the publish set"; exit 1; }
done
[ -f "$stage/index.html" ] || { echo "vps-deploy: stage has no index.html"; exit 1; }

# --delete clears files the site no longer has; .well-known (Let's Encrypt) is kept.
rsync -a --delete --exclude='/.well-known/' --chown="$OWNER" --chmod=D755,F644 "$stage/" "$TARGET/"
echo "vps-deploy: lab ${SHA:0:12} -> $TARGET ($(find "$stage" -type f | wc -l) files)"
