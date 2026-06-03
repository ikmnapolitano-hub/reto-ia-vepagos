#!/bin/bash
# Sube el fix de login multi-navegador a GitHub.
# Uso: abre Terminal, ve a la carpeta del repo y corre:
#   bash _push_login_fix.sh
set -e
cd "$(dirname "$0")"

echo "▸ Limpiando locks de git si quedaron..."
rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock 2>/dev/null || true

echo "▸ Estado actual:"
git status --short

echo "▸ Commits locales pendientes de subir:"
git log origin/main..HEAD --oneline || true

echo "▸ Push a origin/main..."
git push origin main

echo "✓ Listo. Netlify desplegará automáticamente en ~30s."
echo "  Pruébalo: abre el portal en un navegador donde nunca entraste,"
echo "  pon tu correo y tu clave real (la que cambiaste). Debe entrar."
