#!/usr/bin/env bash
# Despliegue: solicitudes de reset de clave ahora aparecen en "Solicitudes de ayuda"
# Uso: ./_push_pass_reset_panel.sh
set -e
cd "$(dirname "$0")"

[ -f .git/index.lock ] && rm -f .git/index.lock

git add portal.html _push_pass_reset_panel.sh

git commit -m "feat(portal): solicitudes de reset de clave visibles en admin

Antes: cuando un participante usaba '¿Olvidaste tu contraseña?' solo
salia un email a Catherine/Isabella via Netlify Forms. No quedaba
registrado en el portal, asi que era invisible para el resto de admins
y facil de pasar por alto.

Cambios:
- submitForgot() persiste la solicitud en DB.passResetRequests (se
  sincroniza al blob compartido).
- renderAdminAyuda muestra una tarjeta '🔑 Reset de clave pendientes'
  arriba de la ayuda normal, con boton 'Resetear a 123456' (un click
  pone u.pass='123456', passChanged=false, marca la solicitud como
  resuelta) y boton 'Descartar' para casos invalidos.
- Pill de 'Solicitudes de ayuda' en sidebar y bottom-nav suma estas
  pendientes al contador.
- Histórico de resueltas incluye los resets, con quién y cuándo.
- Init/migración del DB asegura DB.passResetRequests = [] en loadDB,
  pullRemote y DB inicial."

git push origin main

echo ""
echo "✓ Push enviado. Netlify deploya en 1-2 min."
echo ""
echo "DESPUES del deploy:"
echo "  1. Refresca el portal como admin."
echo "  2. Pide a alguien que use '¿Olvidaste tu contraseña?' o hazlo tu."
echo "  3. Entra a 'Solicitudes de ayuda' — debe salir arriba la tarjeta '🔑 Reset de clave pendientes'."
echo "  4. Click 'Resetear a 123456' y confirma."
