#!/usr/bin/env bash
# Despliegue: puntuacion 0-100 por proyecto + Indice del Reto en el ranking
#             + panel admin "Evaluacion por semana" (filtro evaluados/pendientes)
# Uso: ./_push_eval_proyectos.sh
set -e
cd "$(dirname "$0")"

# Quita un lock viejo de git si quedo (no afecta tu repo)
[ -f .git/index.lock ] && rm -f .git/index.lock

git add portal.html _push_eval_proyectos.sh

git commit -m "feat(portal): puntuacion 0-100 por proyecto + Indice del Reto en ranking + panel de evaluacion por semana

Que se agrego:
- Nota por proyecto (cada semana) de 0 a 100 que asigna el comite, con
  auditoria (quien califico y cuando). Se guarda en u.progress[n].score.
- Indice del Reto: el ranking publico ahora se ordena por una mezcla
  ponderada -> proyectos 50% + completitud 30% + evaluacion final 20%.
  Los pesos son editables por el admin en 'Criterios de evaluacion'.
- El promedio de proyectos solo cuenta semanas YA calificadas: lo que
  el comite aun no revisa NO penaliza a nadie.
- Visible para todos: la nota por proyecto aparece en los avances del
  participante, en el ranking de Comunidad (con desglose del Indice) y
  en el perfil de cada persona.
- Nuevo panel admin 'Evaluacion por semana': eliges una semana y ves de
  un vistazo a quien ya calificaste y a quien te falta, con filtro
  (pendientes / entregaron sin nota / evaluados / todos), barra de
  progreso y nota inline 0-100 para calificar rapido.

Seguridad:
- Migracion 100% no destructiva: loadDB y pullRemote SOLO agregan los
  campos nuevos (rankWeights, score) si faltan; nunca borran data.
- Misma ruta de guardado/sync que ya usabas (saveDB -> pushRemote).
- Verificado: node --check OK + pruebas de logica del Indice y de que
  ninguna data existente se pierde tras la migracion."

git push origin main

echo ""
echo "✓ Push enviado. Netlify deploya en 1-2 min."
echo ""
echo "DESPUES del deploy (refresca el portal como admin):"
echo "  1. Abre un participante -> pestana 'Avances': pon una nota 0-100 por semana y guarda."
echo "  2. Menu admin -> 'Evaluacion por semana': elige una semana y filtra 'Pendientes'."
echo "     Califica inline; al guardar, la persona desaparece de pendientes."
echo "  3. Como participante, entra a 'Comunidad -> Ranking': el orden ahora usa el Indice del Reto."
echo "  4. (Opcional) 'Criterios de evaluacion' -> ajusta los pesos del Indice si quieres."
