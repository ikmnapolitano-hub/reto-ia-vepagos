#!/bin/bash
# Sube la Carta de Compromiso oficial al repositorio reto-ia-vepagos.
# Uso: bash _push_carta.sh
set -e
cd "$(dirname "$0")"

echo "▸ Limpiando lock de git si quedó..."
rm -f .git/index.lock

echo "▸ Agregando archivos..."
git add assets/Carta_Compromiso_Reto_IA_Vepagos_2026.pdf portal.html

echo "▸ Estado:"
git status --short

echo "▸ Commit..."
git commit -m "Reto IA: Carta de Compromiso oficial en PDF sobre hoja membretada

- Agrega site/assets/Carta_Compromiso_Reto_IA_Vepagos_2026.pdf
- Razón social legal: Consultora Alca, C.A. (marca Vepagos), R.I.F. J-411024449
- Portal: el botón 'Descargar carta' ahora entrega el PDF oficial"

echo "▸ Push a origin/main..."
git push origin main

echo "✓ Listo. Netlify desplegará automáticamente."
