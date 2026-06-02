# Setup — Reto IA Vepagos (Netlify + Resend + Brevo)

Esta guía deja el sitio 100% funcional:
- **Captura de inscripciones** → Netlify Forms (ya activo).
- **Email de confirmación** al participante → Resend.
- **Lista de email marketing** → Brevo.
- **Copia interna** a tu correo admin.

Tiempo total: ~20 minutos.

---

## 1. Crear cuenta en Resend (email transaccional)

1. Entra a https://resend.com y crea cuenta (gratis: 3.000 emails/mes, 100/día).
2. Menú **Domains → Add Domain** → escribe tu dominio (ej: `vepagos.com`).
3. Resend te muestra 3 registros DNS (SPF, DKIM, DMARC). Pégalos en tu proveedor DNS (Cloudflare, GoDaddy, etc.).
4. Espera unos minutos a que aparezcan en verde como **Verified**.
5. Menú **API Keys → Create API Key** → nombre `reto-ia-vepagos` → permisos *Sending access*. Copia la key (`re_...`). **Guárdala, sólo se ve una vez.**

> **Sin dominio propio aún?** Puedes empezar usando el remitente por defecto `onboarding@resend.dev`. Los correos llegarán pero con remitente genérico. Sólo sirve para pruebas.

---

## 2. Crear cuenta en Brevo (email marketing)

1. Entra a https://www.brevo.com y crea cuenta (gratis: 300 emails/día, contactos ilimitados).
2. Menú **Contacts → Lists → New list** → nombre `Reto IA 2026`. Anota el **ID numérico** que aparece junto al nombre (lo usaremos como `BREVO_LIST_ID`).
3. Menú **Contacts → Settings → Contact attributes** → crea estos atributos de tipo *Text*: `CARGO`, `AREA`, `GERENTE`, `PROBLEMA_1`. (FIRSTNAME y LASTNAME ya existen.)
4. Menú esquina superior derecha → **SMTP & API → API Keys → Generate a new API key** → nombre `reto-ia`. Copia la key (`xkeysib-...`).

---

## 3. Configurar variables de entorno en Netlify

1. Abre tu sitio en https://app.netlify.com.
2. **Site configuration → Environment variables → Add a variable**. Agrega estas 5:

| Variable | Valor |
|---|---|
| `RESEND_API_KEY` | la key de Resend (`re_...`) |
| `RESEND_FROM` | `Reto IA Vepagos <reto@tudominio.com>` (o `onboarding@resend.dev` para pruebas) |
| `ADMIN_EMAIL` | tu correo interno (recibe copia de cada inscripción) |
| `BREVO_API_KEY` | la key de Brevo (`xkeysib-...`) |
| `BREVO_LIST_ID` | el ID numérico de la lista (ej: `3`) |

3. **Save**.

---

## 4. Desplegar

Si tu sitio está conectado a un repo (GitHub/GitLab):
1. Sube los archivos nuevos:
   - `netlify/functions/notify.js`
   - `package.json`
   - `netlify.toml` (actualizado)
2. Netlify hace deploy automático en cada push.

Si lo subes por drag & drop:
1. Comprime la carpeta `site/` completa (con la subcarpeta `netlify/functions/` incluida).
2. Arrastra el zip al dashboard de Netlify, sección **Deploys**.

---

## 5. Activar el webhook de Netlify Forms

Esto es lo que dispara la función cada vez que alguien se inscribe.

1. En Netlify: **Site configuration → Forms → Form notifications → Add notification**.
2. Tipo: **Outgoing webhook**.
3. Event: **New form submission**.
4. URL to notify: `https://TU-SITIO.netlify.app/.netlify/functions/notify`
   (reemplaza `TU-SITIO` por el subdominio real de tu sitio en Netlify).
5. Form: selecciona `inscripcion-reto-ia`.
6. **Save**.

---

## 6. Probar

1. Entra a tu sitio en producción, llena el formulario con tu propio email.
2. Deberías recibir:
   - El email de confirmación de Resend en tu bandeja.
   - Una copia en `ADMIN_EMAIL`.
3. En Brevo, tu contacto debe aparecer en la lista `Reto IA 2026`.
4. Si algo falla: en Netlify → **Functions → notify → Logs**. Ahí ves el error exacto.

---

## 7. Mandar campañas de email marketing

Cuando quieras mandar el correo semanal del reto, recordatorios, etc.:
1. En Brevo: **Campaigns → Email → Create campaign**.
2. Plantilla → escribe el contenido (Brevo tiene editor visual).
3. Recipients → selecciona la lista `Reto IA 2026`.
4. Send / Schedule.

---

## Resumen de archivos creados

```
site/
├── netlify.toml              (actualizado: agrega [functions])
├── package.json              (nuevo: declara Node 18)
├── SETUP.md                  (esta guía)
└── netlify/
    └── functions/
        └── notify.js         (lógica de Resend + Brevo)
```

## ¿Y la "base de datos"?

Las inscripciones quedan en **3 lugares automáticamente**:
1. **Netlify dashboard → Forms** (exportable a CSV cuando quieras).
2. **Brevo → Contacts** (con todos los atributos).
3. **Tu inbox** (vía `ADMIN_EMAIL`).

Si más adelante quieres una vista tipo Google Sheets en vivo, conecta **Zapier** (gratis hasta 100 zaps/mes): trigger *New Netlify form submission* → acción *Add row to Google Sheets*. 5 minutos de setup.
