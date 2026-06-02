// netlify/functions/notify.js
// Se dispara con el evento "submission-created" de Netlify Forms.
// 1) Envía email de confirmación con Resend.
// 2) Agrega el contacto a una lista de Brevo (email marketing).
//
// Variables de entorno requeridas en Netlify (Site settings → Environment variables):
//   RESEND_API_KEY        → Tu API key de Resend (https://resend.com)
//   RESEND_FROM           → Remitente, ej: "Reto IA Vepagos <reto@tudominio.com>"
//   ADMIN_EMAIL           → Email interno que recibe copia de cada inscripción
//   BREVO_API_KEY         → Tu API key de Brevo (https://brevo.com)
//   BREVO_LIST_ID         → ID numérico de la lista en Brevo (ej: 3)

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const payload = JSON.parse(event.body || "{}");
    const data = payload.payload?.data || {};
    const formName = payload.payload?.form_name || "";

    // Sólo procesamos el form de inscripción.
    if (formName !== "inscripcion-reto-ia") {
      return { statusCode: 200, body: "Ignored (otro form)" };
    }

    const {
      nombre = "",
      cargo = "",
      area = "",
      email = "",
      gerente = "",
      problema_1 = "",
      problema_2 = "",
      problema_3 = "",
    } = data;

    if (!email) {
      return { statusCode: 400, body: "Falta email" };
    }

    // ---------- 1. EMAIL DE CONFIRMACIÓN (RESEND) ----------
    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM || "Reto IA Vepagos <onboarding@resend.dev>";
    const admin = process.env.ADMIN_EMAIL;

    const userHtml = `
      <div style="font-family:Barlow,Arial,sans-serif;color:#001F60;max-width:560px">
        <h2 style="color:#001F60">¡Recibimos tu inscripción, ${escapeHtml(nombre)}!</h2>
        <p>Gracias por sumarte al <strong>Reto IA Vepagos</strong>. Estamos revisando tu propuesta con tu gerente <strong>${escapeHtml(gerente)}</strong> y la directiva.</p>
        <p>En las próximas <strong>24 horas</strong> recibes un correo confirmando si fuiste aprobado. Si entras, ese mismo correo trae la presentación del reto, normativa, criterios de evaluación, premio y una carta para imprimir, leer y firmar.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
        <p style="color:#666;font-size:.9rem">Resumen de lo que enviaste:</p>
        <ul style="color:#333;font-size:.9rem;line-height:1.5">
          <li><strong>Cargo:</strong> ${escapeHtml(cargo)}</li>
          <li><strong>Área:</strong> ${escapeHtml(area)}</li>
          <li><strong>Problema 1:</strong> ${escapeHtml(problema_1)}</li>
          ${problema_2 ? `<li><strong>Problema 2:</strong> ${escapeHtml(problema_2)}</li>` : ""}
          ${problema_3 ? `<li><strong>Problema 3:</strong> ${escapeHtml(problema_3)}</li>` : ""}
        </ul>
        <p style="margin-top:24px">Equipo Reto IA · Vepagos</p>
      </div>
    `;

    const adminHtml = `
      <h3>Nueva inscripción Reto IA</h3>
      <p><strong>${escapeHtml(nombre)}</strong> (${escapeHtml(email)}) — ${escapeHtml(cargo)} / ${escapeHtml(area)}</p>
      <p><strong>Gerente:</strong> ${escapeHtml(gerente)}</p>
      <p><strong>Problema 1:</strong> ${escapeHtml(problema_1)}</p>
      ${problema_2 ? `<p><strong>Problema 2:</strong> ${escapeHtml(problema_2)}</p>` : ""}
      ${problema_3 ? `<p><strong>Problema 3:</strong> ${escapeHtml(problema_3)}</p>` : ""}
    `;

    if (resendKey) {
      // Email al participante
      await sendResend(resendKey, {
        from,
        to: [email],
        subject: "Recibimos tu inscripción al Reto IA Vepagos",
        html: userHtml,
      });

      // Copia al admin
      if (admin) {
        await sendResend(resendKey, {
          from,
          to: [admin],
          subject: `Nueva inscripción Reto IA — ${nombre}`,
          html: adminHtml,
          reply_to: email,
        });
      }
    } else {
      console.warn("RESEND_API_KEY no configurada — se omite envío de email");
    }

    // ---------- 2. AGREGAR A LISTA DE MARKETING (BREVO) ----------
    const brevoKey = process.env.BREVO_API_KEY;
    const brevoListId = parseInt(process.env.BREVO_LIST_ID || "0", 10);

    if (brevoKey && brevoListId) {
      const [firstName, ...rest] = nombre.split(" ");
      const lastName = rest.join(" ");
      await brevoUpsertContact(brevoKey, {
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          CARGO: cargo,
          AREA: area,
          GERENTE: gerente,
          PROBLEMA_1: problema_1,
        },
        listIds: [brevoListId],
        updateEnabled: true,
      });
    } else {
      console.warn("BREVO_API_KEY o BREVO_LIST_ID no configurados — se omite alta en lista");
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("notify.js error:", err);
    return { statusCode: 500, body: "Error: " + err.message };
  }
};

// ---------- helpers ----------

async function sendResend(apiKey, body) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Resend ${res.status}: ${txt}`);
  }
  return res.json();
}

async function brevoUpsertContact(apiKey, body) {
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 204) {
    const txt = await res.text();
    // Brevo devuelve 400 si el contacto ya existe sin updateEnabled; lo ignoramos
    console.warn(`Brevo ${res.status}: ${txt}`);
  }
  return true;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
