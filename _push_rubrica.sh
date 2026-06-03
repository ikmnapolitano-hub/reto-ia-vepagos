#!/bin/bash
# Sube la nueva rúbrica v2 (4 criterios) al repositorio reto-ia-vepagos.
# El commit ya está hecho — este script solo hace push usando tus credenciales locales (Keychain).
# Uso: bash _push_rubrica.sh
set -e
cd "$(dirname "$0")"

echo "▸ Limpiando lock de git si quedó..."
rm -f .git/index.lock

echo "▸ Estado actual:"
git status --short
echo ""
echo "▸ Último commit:"
git log -1 --oneline
echo ""

echo "▸ Push a origin/main..."
git push origin main

echo ""
echo "✓ Listo. Netlify desplegará en ~1-2 min."
echo "  Verifica en https://reto-ia-vepagos.netlify.app/portal.html → Evaluación"
