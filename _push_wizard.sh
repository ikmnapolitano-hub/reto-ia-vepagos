#!/bin/bash
# Sube los commits pendientes a GitHub.
# Uso: abre Terminal, ve a la carpeta del repo y corre:
#   bash _push_wizard.sh
set -e
cd "$(dirname "$0")"

echo "▸ Limpiando locks de git si quedaron..."
rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock

echo "▸ Estado actual:"
git status --short

echo "▸ Commits locales pendientes de subir:"
git log origin/main..HEAD --oneline || true

echo "▸ Push a origin/main..."
git push origin main

echo "✓ Listo. Netlify desplegará automáticamente en ~30s."
