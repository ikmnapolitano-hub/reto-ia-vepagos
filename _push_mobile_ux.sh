#!/bin/bash
# Sube la mejora masiva de UX móvil (drawer + bottom nav + bottom-sheets + inputs 16px + tablas scroll).
# Uso: abre Terminal y corre:
#   bash "/Users/isabella/Documents/Claude/Projects/VEPAGOS - Reto IA/site/_push_mobile_ux.sh"
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
echo "   Abre https://reto-ia-vepagos.netlify.app/ en tu celular para probar."
