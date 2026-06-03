#!/bin/bash
# Sube el cambio de 4 -> 5 semanas alineadas con P1-P5.
# Uso: abre Terminal y corre:
#   bash "/Users/isabella/Documents/Claude/Projects/VEPAGOS - Reto IA/site/_push_5semanas.sh"
set -e
cd "$(dirname "$0")"

echo "▸ Limpiando locks de git si quedaron..."
rm -f .git/index.lock .git/HEAD.lock .git/objects/maintenance.lock

echo "▸ Estado actual:"
git status --short

echo "▸ Push a origin/main (el commit ya está hecho)..."
git push origin main

echo "✓ Listo. Netlify desplegará automáticamente en ~30s."
