/* ============================================================
   RETO IA VEPAGOS · TOUR INTERACTIVO POR SECCIÓN
   Solo para rol participante. Botón "?" en la topbar antes del
   nombre. Cada sección tiene un mini-tour multi-paso explicando
   qué se puede hacer ahí. Se abre solo la primera vez por
   sección y se puede reabrir cuando quieras.
   ============================================================ */
(function () {
  'use strict';

  // ---------- 1. Tours por sección ----------
  // Cada tour es un array de pasos { emoji, title, body (HTML), action? }
  // action: { label, target } → botón que hace scroll a un selector dentro
  // del contenido principal (#main-content).
  var TOURS = {
    /* ---------------- RESUMEN ---------------- */
    resumen: [
      {
        emoji: '👋',
        title: 'Tu Resumen, en una sola pantalla',
        body:
          '<p>Acá ves <strong>todo tu reto de un vistazo</strong>: tu progreso, ' +
          'qué te toca hacer ahora, tus insignias y el estado de tu inscripción.</p>' +
          '<p class="vp-wiz-tip">Te voy a llevar por las 5 zonas de esta pantalla en 1 minuto. ' +
          'Puedes saltarte el tour cuando quieras.</p>'
      },
      {
        emoji: '📈',
        title: '1) Tu progreso del reto',
        body:
          '<p>Es la <strong>barra grande verde</strong>. Va de 0 a 100% y sube cada vez que ' +
          'completas una acción del reto (inscripción, avances semanales, sin bloqueos abiertos).</p>' +
          '<ul>' +
            '<li><strong>20 pts</strong> · por completar tu inscripción</li>' +
            '<li><strong>18 pts</strong> · por cada semana entregada</li>' +
            '<li><strong>8 pts</strong> · por no tener bloqueos abiertos</li>' +
          '</ul>' +
          '<p>Abajo verás cuántas personas van delante, contigo y detrás.</p>'
      },
      {
        emoji: '🎯',
        title: '2) Tu próximo reto',
        body:
          '<p>La <strong>tarjeta azul navy</strong> es la acción que más te conviene hacer ahora. ' +
          'Es lo que desbloquea el siguiente paso del reto.</p>' +
          '<p>Si haces clic en el botón verde "Ir →", el portal te lleva directo a esa sección. ' +
          'No tienes que adivinar qué sigue.</p>'
      },
      {
        emoji: '✅',
        title: '3) Mis retos · checklist',
        body:
          '<p>Es la lista de <strong>misiones</strong> que tienes que cumplir durante el reto. ' +
          'Cada misión cumplida suma a tu progreso y te acerca al Top 10.</p>' +
          '<ul>' +
            '<li>Las pendientes muestran un botón <em>"Ir →"</em> que te lleva a la sección.</li>' +
            '<li>Las cumplidas se tachan y aparecen con el badge verde "Cumplido".</li>' +
          '</ul>'
      },
      {
        emoji: '🏅',
        title: '4) Tus insignias coleccionables',
        body:
          '<p>Son los <strong>logros desbloqueables</strong>. Cada acción del reto desbloquea una. ' +
          'Aparecen a color cuando ya las tienes y en gris las que aún te faltan.</p>' +
          '<p class="vp-wiz-tip">Pasa el cursor por encima de cada insignia para ver cómo se gana.</p>'
      },
      {
        emoji: '📋',
        title: '5) Estado de inscripción y ritmo del reto',
        body:
          '<p>Más abajo verás:</p>' +
          '<ul>' +
            '<li><strong>Estado de inscripción</strong>: los pasos que te faltan para quedar 100% inscrito (carta firmada, términos aceptados…).</li>' +
            '<li><strong>Ritmo del reto</strong>: en qué semana vas y si estás al día, atrasado o adelantado.</li>' +
            '<li><strong>3 KPIs</strong>: tu estado, semanas con avance y puntaje actual sobre 100.</li>' +
          '</ul>'
      },
      {
        emoji: '🚨',
        title: '¿Te trancaste? Pide ayuda',
        body:
          '<p>Abajo a la derecha hay un botón rojo "<strong>Necesito ayuda</strong>". Tócalo ' +
          'cuando estés bloqueado en algo. Tu gerente y los admins lo ven al instante y te resuelven.</p>' +
          '<p>Tus solicitudes de ayuda (activas y resueltas) quedan registradas al final de esta pantalla.</p>'
      }
    ],

    /* ---------------- MI PROBLEMA ---------------- */
    problema: [
      {
        emoji: '🎯',
        title: 'Mi problema · lo que vas a resolver',
        body:
          '<p>Aquí está el <strong>problema oficial</strong> que el comité aprobó contigo ' +
          'para que lo resuelvas con IA durante el reto.</p>' +
          '<p>Te explico las 3 cosas que puedes hacer en esta página.</p>'
      },
      {
        emoji: '✅',
        title: '1) Aceptar o rechazar el reto',
        body:
          '<p>Lo primero: decidir si vas a desarrollar ese problema o no. Verás dos botones:</p>' +
          '<ul>' +
            '<li><strong>✅ Aceptar reto</strong> — empiezas a trabajar tu solución abajo.</li>' +
            '<li><strong>✗ Rechazar reto</strong> — abre un formulario donde explicas por qué no, ' +
            'y si quieres seguir participando con otro problema.</li>' +
          '</ul>' +
          '<p class="vp-wiz-tip">Tranquilo: la decisión la puedes cambiar después con "Cambiar decisión".</p>'
      },
      {
        emoji: '🛠️',
        title: '2) Documentar tu solución (si aceptaste)',
        body:
          '<p>Cuando aceptes, aparece el bloque <strong>"Tu solución"</strong>. Ahí cuentas:</p>' +
          '<ol>' +
            '<li><strong>Descripción</strong> — qué hace, para quién, cómo se usa.</li>' +
            '<li><strong>Cómo aplica IA</strong> — herramientas / modelos que usaste.</li>' +
            '<li><strong>Resultado esperado</strong> — qué cambia (tiempo, dinero, métricas).</li>' +
            '<li><strong>Archivos de apoyo</strong> — diagramas, capturas, prototipos, demo.</li>' +
          '</ol>' +
          '<p>Cuando termines, dale a <strong>Guardar solución</strong>.</p>'
      },
      {
        emoji: '📋',
        title: '3) Revisar tus 3 problemas originales',
        body:
          '<p>Al final de la página ves los <strong>1 a 3 problemas</strong> que tú propusiste ' +
          'al inscribirte. Es solo histórico — el aprobado oficial es el de arriba.</p>'
      }
    ],

    /* ---------------- AVANCES SEMANALES ---------------- */
    avances: [
      {
        emoji: '📈',
        title: 'Avances semanales · tu bitácora del reto',
        body:
          '<p>Esta es la sección <strong>más importante del reto</strong>. Aquí subes lo que ' +
          'hagas cada semana. Es lo que tu gerente y los admins revisan para evaluarte.</p>'
      },
      {
        emoji: '📅',
        title: 'Una tarjeta por semana (4 en total)',
        body:
          '<p>Vas a ver <strong>4 tarjetas</strong>, una por cada semana del reto.</p>' +
          '<p>Cada tarjeta muestra un badge a la derecha:</p>' +
          '<ul>' +
            '<li><span class="vp-wiz-pill vp-wiz-pill--green">Con avance</span> — ya entregaste algo esa semana</li>' +
            '<li><span class="vp-wiz-pill vp-wiz-pill--gray">Pendiente</span> — esa semana aún está vacía</li>' +
          '</ul>'
      },
      {
        emoji: '📝',
        title: 'Por cada semana tienes 2 campos',
        body:
          '<ol>' +
            '<li><strong>Resumen de avance</strong> — un texto contando qué hiciste, qué aprendiste ' +
            'y qué viene la próxima semana.</li>' +
            '<li><strong>Archivos</strong> — botón "+ Adjuntar archivos" para subir PDFs, imágenes, ' +
            'capturas o videos. Puedes subir varios a la vez.</li>' +
          '</ol>'
      },
      {
        emoji: '💾',
        title: 'No olvides "Guardar avance"',
        body:
          '<p>Después de escribir el resumen, dale al botón verde <strong>"Guardar avance"</strong> ' +
          'de esa semana. Cada semana se guarda por separado.</p>' +
          '<p class="vp-wiz-tip">Los archivos se suben automáticamente al adjuntarlos. ' +
          'El botón es solo para guardar el texto del resumen.</p>'
      },
      {
        emoji: '👀',
        title: '¿Quién lo ve?',
        body:
          '<p>Tus avances los ven en línea:</p>' +
          '<ul>' +
            '<li><strong>Tu gerente directo</strong> — los revisa y te puede dejar feedback.</li>' +
            '<li><strong>Los admins del reto</strong> — los califican según la rúbrica.</li>' +
          '</ul>' +
          '<p>Su feedback aparece en la sección <strong>Feedback</strong> del menú.</p>'
      }
    ],

    /* ---------------- EVALUACIÓN ---------------- */
    evaluacion: [
      {
        emoji: '🏅',
        title: 'Evaluación · tu puntaje sobre 100',
        body:
          '<p>Aquí ves <strong>cómo te están calificando</strong> en tiempo real. ' +
          'Cada vez que un admin o tu gerente actualiza una nota, se refleja aquí.</p>'
      },
      {
        emoji: '⚖️',
        title: 'Los 4 criterios y cuánto pesan',
        body:
          '<p>Verás la lista de criterios con el peso de cada uno:</p>' +
          '<ul>' +
            '<li><strong>Impacto · 40%</strong> — qué tanto mejoraste contra tu punto de partida.</li>' +
            '<li><strong>Adopción · 30%</strong> — si alguien más de tu equipo lo está usando.</li>' +
            '<li><strong>Avance · 20%</strong> — entregas a tiempo y documentación.</li>' +
            '<li><strong>Demo · 10%</strong> — votación del demo de los viernes.</li>' +
          '</ul>'
      },
      {
        emoji: '🔢',
        title: 'Tu nota actual en cada criterio',
        body:
          '<p>A la derecha de cada criterio ves tu nota actual <strong>sobre 10</strong>. ' +
          'Abajo de todo está tu <strong>puntaje total sobre 100</strong>.</p>' +
          '<p class="vp-wiz-tip">Recuerda: ganas por mejorar contra <strong>ti mismo</strong>, ' +
          'no contra los demás.</p>'
      },
      {
        emoji: '💬',
        title: 'Comentarios al final',
        body:
          '<p>Más abajo aparece el <strong>hilo de comentarios</strong> que tu gerente y los admins ' +
          'han dejado sobre tu proyecto. Son los mismos que ves en la sección Feedback.</p>'
      }
    ],

    /* ---------------- FEEDBACK ---------------- */
    feedback: [
      {
        emoji: '💬',
        title: 'Feedback · mensajes para ti',
        body:
          '<p>Aquí llegan todos los <strong>comentarios, sugerencias e ideas</strong> que tu ' +
          'gerente y los admins han dejado sobre tu proyecto.</p>'
      },
      {
        emoji: '🟢',
        title: 'Cómo sabes si hay mensajes nuevos',
        body:
          '<p>En el menú lateral, al lado de "Feedback", aparece un <strong>punto verde con un número</strong> ' +
          'cuando tienes mensajes sin leer.</p>' +
          '<p>Al abrir esta sección, automáticamente se marcan como leídos.</p>'
      },
      {
        emoji: '📎',
        title: 'Cada comentario puede traer extras',
        body:
          '<p>Los mensajes pueden incluir:</p>' +
          '<ul>' +
            '<li><strong>Texto</strong> — el comentario principal.</li>' +
            '<li><strong>Imágenes</strong> — capturas. Haz clic para verlas grandes.</li>' +
            '<li><strong>Links</strong> — enlaces a documentos, plantillas, ejemplos.</li>' +
          '</ul>' +
          '<p>Arriba de cada mensaje ves <strong>quién lo escribió</strong> y <strong>cuándo</strong>.</p>'
      }
    ],

    /* ---------------- RECURSOS ---------------- */
    recursos: [
      {
        emoji: '📚',
        title: 'Recursos del reto · todo lo que necesitas',
        body:
          '<p>Aquí están <strong>los enlaces y materiales</strong> oficiales del Reto IA: ' +
          'cómo entrar a Platzi, qué cuentas abrir, calendario, etc.</p>'
      },
      {
        emoji: '🎓',
        title: '2 planes Platzi que cubre Vepagos',
        body:
          '<p>Arriba de todo verás dos tarjetas:</p>' +
          '<ul>' +
            '<li><strong>Mensual · para TODOS los inscritos</strong> — Vepagos te cubre Platzi ' +
            'durante el mes del reto.</li>' +
            '<li><strong>Anual · Top 10–15 al cerrar</strong> — los mejores reciben Platzi Expert ' +
            'por 1 año completo como premio.</li>' +
          '</ul>'
      },
      {
        emoji: '🔗',
        title: 'Lista de recursos con enlace',
        body:
          '<p>Más abajo verás varias tarjetas. Cada una tiene:</p>' +
          '<ul>' +
            '<li><strong>Título y descripción</strong> del recurso (cuenta, herramienta, guía…).</li>' +
            '<li><strong>Botón verde "Abrir enlace ↗"</strong> si hay un link externo. Te abre ' +
            'en una pestaña nueva.</li>' +
          '</ul>'
      },
      {
        emoji: '⚠️',
        title: 'Recuerda: los videos viven en Platzi',
        body:
          '<p>En el portal Vepagos haces el <strong>seguimiento</strong> de tu proyecto. ' +
          'Las <strong>clases, cursos y comunidad</strong> están en platzi.com.</p>' +
          '<p>Son dos plataformas distintas: aquí entregas, allá aprendes.</p>'
      }
    ],

    /* ---------------- MARCA ---------------- */
    marca: [
      {
        emoji: '🎨',
        title: 'Manual de marca · cómo presentar tu proyecto',
        body:
          '<p>Esta sección define <strong>cómo se ve y se siente Vepagos</strong>: colores, ' +
          'tipografías, logos y tono. Aplica a presentaciones, demos, videos, todo.</p>' +
          '<p class="vp-wiz-tip">📌 <strong>El look &amp; feel pesa 5 puntos en tu evaluación final.</strong></p>'
      },
      {
        emoji: '4️⃣',
        title: 'Las 4 reglas básicas',
        body:
          '<ol>' +
            '<li><strong>Colores</strong>: usa solo los de la paleta (verde, navy, blanco, grises suaves).</li>' +
            '<li><strong>Tipografía</strong>: Bahnschrift para títulos, Barlow para textos.</li>' +
            '<li><strong>Logos</strong>: descarga los oficiales (no estirarlos, no cambiarles el color).</li>' +
            '<li><strong>Tono</strong>: claro, directo y con datos.</li>' +
          '</ol>'
      },
      {
        emoji: '🎨',
        title: 'Colores · cópialos con su HEX',
        body:
          '<p>Cada color tiene su <strong>código HEX</strong> al lado (ej. <code>#00CE7C</code>). ' +
          'Cópialo y pégalo en PowerPoint, Figma, Canva o donde estés diseñando.</p>' +
          '<p>Los más importantes:</p>' +
          '<ul>' +
            '<li><strong>Verde Vepagos</strong> · #00CE7C</li>' +
            '<li><strong>Azul Navy</strong> · #001F60</li>' +
          '</ul>'
      },
      {
        emoji: '⬇️',
        title: 'Descarga los logos oficiales',
        body:
          '<p>Hay <strong>3 familias</strong> de logo, cada una en 5 colores:</p>' +
          '<ul>' +
            '<li><strong>Wordmark</strong> — solo la palabra VEPAGOS.</li>' +
            '<li><strong>Wordmark + tagline</strong> — VEPAGOS + "Tu negocio vende más". Versiones ' +
            'con RIF para documentos oficiales.</li>' +
            '<li><strong>Isotipo</strong> — solo la "P". Para avatares, favicons, sellos.</li>' +
          '</ul>' +
          '<p>Cada logo tiene su botón <strong>⬇ PNG</strong> para descargarlo.</p>'
      },
      {
        emoji: '🚫',
        title: 'Reglas de uso (lo que NO se hace)',
        body:
          '<ul>' +
            '<li>No estires, deformes ni rotes el logo.</li>' +
            '<li>No le cambies los colores ni le agregues sombras o brillos.</li>' +
            '<li>Sobre fondos oscuros usa la versión <strong>blanca</strong>.</li>' +
            '<li>Si la pieza es muy chica, usa el <strong>isotipo</strong>, no el wordmark.</li>' +
          '</ul>'
      },
      {
        emoji: '🗣️',
        title: 'Tono de voz · cómo escribir',
        body:
          '<p>Al final ves las reglas del tono Vepagos:</p>' +
          '<ul>' +
            '<li><strong>Claro y directo</strong> — nada de "potencializar sinergias".</li>' +
            '<li><strong>Cercano</strong> — de tú a tú.</li>' +
            '<li><strong>Con datos</strong> — si dice "ahorra tiempo", di cuántas horas.</li>' +
            '<li><strong>Sin promesas vacías</strong>.</li>' +
          '</ul>'
      }
    ],

    /* ---------------- PANTALLAS GUÍA ---------------- */
    pantallas: [
      {
        emoji: '🖼️',
        title: 'Pantallas guía · inspiración visual',
        body:
          '<p>Son <strong>plantillas de pantallas</strong> que puedes usar como referencia ' +
          'para tu propio proyecto. Sirven para que tu MVP se sienta Vepagos sin partir de cero.</p>'
      },
      {
        emoji: '📐',
        title: '4 plantillas de pantallas',
        body:
          '<p>Verás miniaturas y la descripción de cómo construir cada una:</p>' +
          '<ul>' +
            '<li><strong>Login</strong> · fondo navy degradé, tarjeta blanca, CTA verde.</li>' +
            '<li><strong>Dashboard principal</strong> · sidebar blanco + topbar navy + KPIs.</li>' +
            '<li><strong>Formulario de carga</strong> · inputs con focus verde, labels Condensed.</li>' +
            '<li><strong>Tabla de seguimiento</strong> · headers navy, hover, badges de estado.</li>' +
          '</ul>'
      },
      {
        emoji: '✅',
        title: 'Patrones a respetar',
        body:
          '<p>Lista de reglas concretas que te ahorran decisiones:</p>' +
          '<ul>' +
            '<li>Botones primarios <strong>verdes con texto navy</strong>, esquinas pill.</li>' +
            '<li>Bordes <code>14px</code> en tarjetas, <code>10px</code> en inputs.</li>' +
            '<li>Sombras muy sutiles.</li>' +
            '<li>Estados: verde (ok) · ámbar (pendiente) · rojo (alerta) · navy (info).</li>' +
          '</ul>'
      },
      {
        emoji: '👀',
        title: 'El portal mismo es tu referencia',
        body:
          '<p>Este portal Vepagos donde estás <strong>sigue todo el manual</strong>. ' +
          'Inspírate en él: topbar navy, sidebar con secciones en Condensed, tarjetas blancas, ' +
          'badges de estado, botones pill verdes.</p>'
      }
    ],

    /* ---------------- CARTA Y TÉRMINOS ---------------- */
    carta: [
      {
        emoji: '✍️',
        title: 'Carta de compromiso · es requisito',
        body:
          '<p>Para participar en el reto necesitas <strong>3 cosas</strong> en esta sección. ' +
          'Te las explico una por una.</p>' +
          '<p class="vp-wiz-tip">Plazo: <strong>antes de cerrar la Semana 1</strong>.</p>'
      },
      {
        emoji: '⬇️',
        title: '1) Descarga tu carta personalizada',
        body:
          '<p>Botón verde <strong>"⬇ Descargar carta de compromiso"</strong>. ' +
          'Ya viene con tus datos y la cláusula de propiedad intelectual.</p>' +
          '<p>Imprímela, fírmala con tu supervisor (puedes firmar a mano y escanear, o firmar digital).</p>'
      },
      {
        emoji: '📤',
        title: '2) Sube la carta firmada',
        body:
          '<p>Después de firmar, dale a <strong>"+ Subir carta firmada"</strong> y sube el PDF o la ' +
          'imagen. Si te equivocas, puedes <strong>Reemplazar</strong> el archivo después.</p>'
      },
      {
        emoji: '☑️',
        title: '3) Acepta los términos',
        body:
          '<p>Marca el checkbox grande <strong>"Acepto los términos del Reto IA Vepagos"</strong>. ' +
          'Sin esto, tu inscripción no queda completa.</p>'
      },
      {
        emoji: '📜',
        title: 'Cláusulas clave · léelas',
        body:
          '<p>Abajo aparece un acordeón con las cláusulas. Tócalas para expandirlas:</p>' +
          '<ul>' +
            '<li><strong>Propiedad intelectual</strong> — lo que creas durante el reto es de Vepagos.</li>' +
            '<li><strong>Confidencialidad</strong> — no compartir info interna afuera.</li>' +
            '<li><strong>Asistencia</strong> — 2 inasistencias injustificadas te sacan del concurso.</li>' +
            '<li><strong>Descuento Platzi</strong> — si recibes Platzi Expert y sales antes de 12 meses, ' +
            'se descuenta el proporcional de tu liquidación.</li>' +
            '<li><strong>Uso de imagen</strong> — Vepagos puede usar fotos/testimonios del reto.</li>' +
          '</ul>'
      }
    ],

    /* ---------------- MI CUENTA ---------------- */
    cuenta: [
      {
        emoji: '👤',
        title: 'Mi cuenta · tus datos',
        body:
          '<p>Acá ves tu información: <strong>nombre, cargo, área, correo</strong>. ' +
          'Si algo está mal, avísale al admin del reto para corregirlo.</p>'
      },
      {
        emoji: '🔐',
        title: 'Cambia tu contraseña',
        body:
          '<p>Si entraste con la contraseña inicial que te enviaron por correo, ' +
          '<strong>cámbiala por una tuya</strong> desde aquí. Es la única sección donde ' +
          'puedes hacerlo.</p>' +
          '<p class="vp-wiz-tip">Tip: usa una contraseña diferente a las de otras plataformas.</p>'
      }
    ]
  };

  // ---------- 2. Estilos ----------
  var css = '' +
    '.vp-wiz-btn-help{background:rgba(0,206,124,.15);border:1.5px solid rgba(0,206,124,.55);color:#00CE7C;width:32px;height:32px;border-radius:50%;font-family:"Barlow Condensed","Bahnschrift",sans-serif;font-weight:700;font-size:1rem;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background .15s, border-color .15s, transform .1s;position:relative}' +
    '.vp-wiz-btn-help:hover{background:#00CE7C;color:#001F60;border-color:#00CE7C}' +
    '.vp-wiz-btn-help:active{transform:translateY(1px)}' +
    '.vp-wiz-btn-help.vp-wiz-pulse::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:2px solid #00CE7C;animation:vpWizPulse 1.8s ease-out infinite;pointer-events:none}' +
    '@keyframes vpWizPulse{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.6)}}' +
    '.vp-wiz-overlay{position:fixed;inset:0;background:rgba(0,20,60,.62);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:9999;display:none;align-items:center;justify-content:center;padding:1rem;animation:vpWizFade .25s ease}' +
    '.vp-wiz-overlay.open{display:flex}' +
    '@keyframes vpWizFade{from{opacity:0}to{opacity:1}}' +
    '@keyframes vpWizPop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}' +
    '.vp-wiz-card{background:#fff;border-radius:20px;width:100%;max-width:520px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden;animation:vpWizPop .28s cubic-bezier(.2,.8,.2,1);font-family:"Barlow","Bahnschrift","Inter",system-ui,sans-serif;color:#001F60}' +
    '.vp-wiz-head{background:#001F60;color:#fff;padding:.85rem 1.2rem;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #00CE7C;flex-shrink:0}' +
    '.vp-wiz-head__left{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}' +
    '.vp-wiz-head__eyebrow{font-family:"Barlow Condensed","Bahnschrift",sans-serif;font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:#00CE7C}' +
    '.vp-wiz-step-count{font-family:"Barlow Condensed","Bahnschrift",sans-serif;font-size:.7rem;letter-spacing:.1em;color:rgba(255,255,255,.6)}' +
    '.vp-wiz-close{background:transparent;border:none;color:#fff;font-size:1.4rem;line-height:1;padding:.2rem .4rem;cursor:pointer;border-radius:6px;opacity:.7;transition:opacity .15s, background .15s}' +
    '.vp-wiz-close:hover{opacity:1;background:rgba(255,255,255,.1)}' +
    '.vp-wiz-body{padding:1.5rem 1.6rem 1.2rem;overflow-y:auto;flex:1}' +
    '.vp-wiz-emoji{font-size:2.6rem;line-height:1;margin-bottom:.7rem;display:block;text-align:center}' +
    '.vp-wiz-title{font-family:"Barlow Condensed","Bahnschrift",sans-serif;font-size:1.4rem;font-weight:700;margin:0 0 .8rem;line-height:1.2;color:#001F60;text-align:center}' +
    '.vp-wiz-text{font-size:.95rem;line-height:1.6;color:#34406B}' +
    '.vp-wiz-text p{margin:0 0 .7rem}' +
    '.vp-wiz-text ul,.vp-wiz-text ol{margin:.3rem 0 .7rem;padding-left:1.3rem}' +
    '.vp-wiz-text li{margin-bottom:.35rem}' +
    '.vp-wiz-text strong{color:#001F60}' +
    '.vp-wiz-text code{background:#F0F2F7;padding:.1rem .35rem;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.85em;color:#001F60}' +
    '.vp-wiz-text .vp-wiz-tip{background:linear-gradient(135deg,rgba(0,206,124,.1),rgba(0,206,124,.04));border-left:3px solid #00CE7C;padding:.55rem .8rem;border-radius:6px;margin:.6rem 0;font-size:.9rem}' +
    '.vp-wiz-pill{display:inline-block;padding:.1rem .55rem;border-radius:999px;font-family:"Barlow Condensed","Bahnschrift",sans-serif;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;font-weight:700}' +
    '.vp-wiz-pill--green{background:rgba(0,206,124,.18);color:#00875A}' +
    '.vp-wiz-pill--gray{background:#EEF1F7;color:#5A6685}' +
    '.vp-wiz-dots{display:flex;justify-content:center;gap:6px;margin:1rem 0 .2rem}' +
    '.vp-wiz-dot{width:7px;height:7px;border-radius:50%;background:#D7DEEB;transition:background .15s, transform .15s;cursor:pointer}' +
    '.vp-wiz-dot.active{background:#00CE7C;transform:scale(1.35)}' +
    '.vp-wiz-foot{display:flex;justify-content:space-between;align-items:center;padding:.85rem 1.2rem 1.15rem;gap:.6rem;border-top:1px solid #F0F2F7;background:#FBFCFD;flex-shrink:0;flex-wrap:wrap}' +
    '.vp-wiz-foot__left{display:flex;align-items:center;gap:.6rem}' +
    '.vp-wiz-foot__nav{display:flex;gap:.5rem;align-items:center}' +
    '.vp-wiz-foot label{font-size:.78rem;color:#5A6685;display:flex;align-items:center;gap:.4rem;cursor:pointer;user-select:none}' +
    '.vp-wiz-foot input[type="checkbox"]{accent-color:#00CE7C}' +
    '.vp-wiz-btn{padding:.6rem 1.05rem;border-radius:999px;border:none;cursor:pointer;font-family:"Barlow Condensed","Bahnschrift",sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.06em;text-transform:uppercase;transition:transform .1s, background .15s, color .15s, opacity .15s}' +
    '.vp-wiz-btn:active{transform:translateY(1px)}' +
    '.vp-wiz-btn:disabled{opacity:.4;cursor:not-allowed}' +
    '.vp-wiz-btn--ghost{background:transparent;color:#5A6685}' +
    '.vp-wiz-btn--ghost:hover{color:#001F60}' +
    '.vp-wiz-btn--prev{background:#EEF1F7;color:#001F60}' +
    '.vp-wiz-btn--prev:hover{background:#E1E6F0}' +
    '.vp-wiz-btn--next{background:#00CE7C;color:#001F60}' +
    '.vp-wiz-btn--next:hover{background:#00B36C}' +
    '@media (max-width:520px){' +
    '.vp-wiz-card{max-width:100%;border-radius:14px;max-height:95vh}' +
    '.vp-wiz-title{font-size:1.2rem}' +
    '.vp-wiz-emoji{font-size:2.2rem}' +
    '.vp-wiz-body{padding:1.2rem 1.2rem .9rem}' +
    '.vp-wiz-foot{flex-direction:column;align-items:stretch}' +
    '.vp-wiz-foot__left{justify-content:center}' +
    '.vp-wiz-foot__nav{justify-content:center}' +
    '}';

  var styleTag = document.createElement('style');
  styleTag.setAttribute('data-vp-wizard', 'true');
  styleTag.appendChild(document.createTextNode(css));
  document.head.appendChild(styleTag);

  // ---------- 3. Modal ----------
  var overlay = document.createElement('div');
  overlay.className = 'vp-wiz-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<div class="vp-wiz-card" role="document">' +
      '<div class="vp-wiz-head">' +
        '<div class="vp-wiz-head__left">' +
          '<span class="vp-wiz-head__eyebrow">Cómo funciona esta página</span>' +
          '<span class="vp-wiz-step-count"></span>' +
        '</div>' +
        '<button class="vp-wiz-close" type="button" aria-label="Cerrar">×</button>' +
      '</div>' +
      '<div class="vp-wiz-body">' +
        '<span class="vp-wiz-emoji"></span>' +
        '<h2 class="vp-wiz-title"></h2>' +
        '<div class="vp-wiz-text"></div>' +
        '<div class="vp-wiz-dots"></div>' +
      '</div>' +
      '<div class="vp-wiz-foot">' +
        '<div class="vp-wiz-foot__left"></div>' +
        '<div class="vp-wiz-foot__nav">' +
          '<button class="vp-wiz-btn vp-wiz-btn--ghost vp-wiz-skip" type="button">Saltar</button>' +
          '<button class="vp-wiz-btn vp-wiz-btn--prev vp-wiz-prev" type="button">← Atrás</button>' +
          '<button class="vp-wiz-btn vp-wiz-btn--next vp-wiz-next" type="button">Siguiente →</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  function attachOverlay() {
    if (!overlay.parentNode) document.body.appendChild(overlay);
  }

  var els = {};
  function cacheEls() {
    els.emoji  = overlay.querySelector('.vp-wiz-emoji');
    els.title  = overlay.querySelector('.vp-wiz-title');
    els.text   = overlay.querySelector('.vp-wiz-text');
    els.dots   = overlay.querySelector('.vp-wiz-dots');
    els.count  = overlay.querySelector('.vp-wiz-step-count');
    els.prev   = overlay.querySelector('.vp-wiz-prev');
    els.next   = overlay.querySelector('.vp-wiz-next');
    els.skip   = overlay.querySelector('.vp-wiz-skip');
    els.close  = overlay.querySelector('.vp-wiz-close');
    els.foot   = overlay.querySelector('.vp-wiz-foot');
  }

  // ---------- 4. Estado ----------
  // El tour se autoabre UNA sola vez en total (la primera vez que el
  // participante entra al portal). Después solo se reabre desde el botón "?".
  var GLOBAL_SEEN_KEY = 'vpWizardEverSeen';
  function isParticipant() {
    try { return window.SESSION && window.SESSION.activeRole === 'participant'; }
    catch (e) { return false; }
  }
  function isEverSeen() {
    try { return localStorage.getItem(GLOBAL_SEEN_KEY) === '1'; }
    catch (e) { return false; }
  }
  function markEverSeen() {
    try { localStorage.setItem(GLOBAL_SEEN_KEY, '1'); } catch (e) {}
  }

  // ---------- 5. Render tour ----------
  var tour = null;
  var stepIdx = 0;
  var tourPage = null;

  function renderStep() {
    if (!tour) return;
    var s = tour[stepIdx];
    els.emoji.textContent = s.emoji || '';
    els.title.textContent = s.title || '';
    els.text.innerHTML    = s.body || '';
    els.count.textContent = 'Paso ' + (stepIdx + 1) + ' de ' + tour.length;

    els.dots.innerHTML = '';
    for (var k = 0; k < tour.length; k++) {
      var d = document.createElement('span');
      d.className = 'vp-wiz-dot' + (k === stepIdx ? ' active' : '');
      (function (idx) {
        d.addEventListener('click', function () { stepIdx = idx; renderStep(); });
      })(k);
      els.dots.appendChild(d);
    }

    els.prev.disabled = stepIdx === 0;
    els.next.textContent = (stepIdx === tour.length - 1) ? '¡Listo!' : 'Siguiente →';

    // scroll del cuerpo al tope
    var body = overlay.querySelector('.vp-wiz-body');
    if (body) body.scrollTop = 0;
  }

  function openTour(page) {
    if (!TOURS[page]) return;
    tour = TOURS[page];
    tourPage = page;
    stepIdx = 0;
    attachOverlay();
    if (!els.emoji) cacheEls();
    renderStep();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeTour() {
    // Al cerrar (por la X, Saltar, ¡Listo!, Esc o click afuera) marcamos
    // como visto a nivel global: nunca más se autoabre. El botón "?" sigue.
    markEverSeen();
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    tour = null;
    tourPage = null;
  }

  function next() {
    if (!tour) return;
    if (stepIdx < tour.length - 1) {
      stepIdx++; renderStep();
    } else {
      closeTour();
    }
  }
  function prev() {
    if (stepIdx > 0) { stepIdx--; renderStep(); }
  }

  // ---------- 6. Botón "?" en la topbar ----------
  function injectTopbarButton() {
    var topbar = document.querySelector('.topbar .user');
    if (!topbar) return false;
    if (topbar.querySelector('.vp-wiz-btn-help')) return true;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vp-wiz-btn-help';
    btn.id = 'vp-wiz-help';
    btn.setAttribute('aria-label', 'Cómo funciona esta página');
    btn.title = 'Cómo funciona esta página';
    btn.textContent = '?';
    btn.addEventListener('click', function () {
      var page = window.CURRENT_PAGE;
      if (page && TOURS[page]) openTour(page);
    });
    topbar.insertBefore(btn, topbar.firstChild);
    return true;
  }

  function refreshTopbarButton() {
    var btn = document.getElementById('vp-wiz-help');
    if (!btn) return;
    var page = window.CURRENT_PAGE;
    var available = isParticipant() && page && TOURS[page];
    btn.style.display = available ? 'flex' : 'none';
    // Pulso solo si el participante NUNCA ha visto el wizard. Una vez visto,
    // el botón queda discreto.
    if (available && !isEverSeen()) btn.classList.add('vp-wiz-pulse');
    else btn.classList.remove('vp-wiz-pulse');
  }

  // ---------- 7. Detectar cambios de página ----------
  // Solo autoabre UNA vez en total (primera vez que el participante entra a
  // cualquier sección con tour). Después: solo manual desde el botón "?".
  var lastPage = null;
  var autoOpenedThisSession = false;
  function tick() {
    var page = window.CURRENT_PAGE;
    var changed = page !== lastPage;
    if (changed) {
      lastPage = page;
      refreshTopbarButton();
      if (page && TOURS[page] && isParticipant() && !isEverSeen() && !autoOpenedThisSession) {
        autoOpenedThisSession = true;
        setTimeout(function () {
          if (window.CURRENT_PAGE === page && !overlay.classList.contains('open')) {
            openTour(page);
          }
        }, 450);
      }
    } else {
      refreshTopbarButton();
    }
  }

  // ---------- 8. Init ----------
  function init() {
    attachOverlay();
    cacheEls();

    els.next.addEventListener('click', next);
    els.prev.addEventListener('click', prev);
    els.skip.addEventListener('click', closeTour);
    els.close.addEventListener('click', closeTour);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeTour();
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') closeTour();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (injectTopbarButton() || tries > 40) {
        clearInterval(iv);
        refreshTopbarButton();
      }
    }, 250);

    setInterval(tick, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // API global
  window.VepagosWizard = {
    openCurrent: function () {
      var p = window.CURRENT_PAGE;
      if (p && TOURS[p]) openTour(p);
    },
    open: function (page) { if (TOURS[page]) openTour(page); },
    resetAll: function () {
      try {
        localStorage.removeItem(GLOBAL_SEEN_KEY);
        // limpiar también las claves antiguas por sección (compat)
        Object.keys(TOURS).forEach(function (k) {
          localStorage.removeItem('vpTourSeen_' + k);
        });
      } catch (e) {}
      autoOpenedThisSession = false;
    }
  };
})();
