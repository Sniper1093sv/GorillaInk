// Año dinámico
document.getElementById('year').textContent = new Date().getFullYear();

// Filtros de portafolio
const filters = document.querySelectorAll('.filter');
const items = document.querySelectorAll('.grid-item');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const tag = btn.dataset.filter;
    items.forEach(it => {
      if (tag === 'all') {
        it.style.display = '';
      } else {
        const has = (it.dataset.tags || '').split(' ').includes(tag);
        it.style.display = has ? '' : 'none';
      }
    });
  });
});

// Viewer modal
const dialog = document.getElementById('viewer');
const viewerImg = document.getElementById('viewerImg');
const closeBtn = document.querySelector('.viewer-close');

document.getElementById('portfolioGrid')?.addEventListener('click', (e) => {
  const fig = e.target.closest('.grid-item');
  if (!fig) return;
  const img = fig.querySelector('img');
  viewerImg.src = img.src;
  viewerImg.alt = img.alt || 'Tatuaje ampliado';
  if (typeof dialog.showModal === 'function') dialog.showModal();
});

closeBtn?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (e) => {
  // Cerrar al hacer click fuera de la imagen
  const rect = viewerImg.getBoundingClientRect();
  const clickedInImage = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (!clickedInImage) dialog.close();
});

/* === PROMO ÚNICA GorillaInk ===
   Opción A: control por fechas (activa automáticamente si 'now' < 'end').
   Opción B: control manual con active:true (ignora fechas).
   Usa la que prefieras.
*/

// --- Opción A: Control por FECHAS (recomendada si cambias seguido) ---
const PROMOS = [
  {
    id: 'mini-3x20',
    title: '3 mini tattoos por $20',
    desc: 'Máx 5 cm cada uno, color negro, zonas comunes (muñeca, antebrazo, tobillo).',
    img: 'img/PROMO.png',
    old: 30,
    now: 20,
    code: 'GI-3X20',
    end: '2025-10-12T23:59:59-06:00', // ajusta fecha local ES
    waText: 'Hola GorillaInk, quiero la promo 3x$20 (código GI-3X20). Mi disponibilidad es...'
  },
  // Puedes dejar futuras promos aquí con otras fechas
];

// --- Opción B: Control por FLAG (activa solo si active:true) ---
// const PROMOS = [
//   {
//     id: 'lettering-7cm',
//     title: 'Lettering ondulado 7 cm',
//     desc: 'Tipografía limpia, negro sólido. Incluye boceto rápido.',
//     img: 'img/flash-03.jpg',
//     old: 35,
//     now: 25,
//     code: 'GI-LET25',
//     active: true, // <<<< enciende/apaga
//     waText: 'Hola GorillaInk, quiero la promo Lettering 7cm (código GI-LET25).'
//   }
// ];

/* Render de UNA sola promo (la más prioritaria).
   - Si no hay activa o está vencida: oculta sección y enlace del menú.
*/
(function renderSinglePromo(){
  const wrap = document.getElementById('promoCards');
  const section = document.getElementById('promos');
  const navLink = document.getElementById('navPromos');
  if (!wrap || !section) return;

  const now = Date.now();

  // Selección por fecha (Opción A)
  const pickByDate = () => {
    // Toma la primera no vencida; si varias, la que vence antes
    const candidates = PROMOS
      .map(p => ({...p, endMs: p.end ? new Date(p.end).getTime() : Infinity}))
      .filter(p => p.endMs > now)
      .sort((a,b) => a.endMs - b.endMs);
    return candidates[0] || null;
  };

  // Selección por flag (Opción B)
  const pickByFlag = () => PROMOS.find(p => p.active) || null;

  // *** Elige aquí el modo de selección ***
  const promo = pickByDate(); // usa esto para fechas
  // const promo = pickByFlag(); // o usa esto para flag

  if (!promo) {
    // No hay promo activa: ocultar sección + link de menú
    section.style.display = 'none';
    if (navLink) navLink.style.display = 'none';
    return;
  }

  const fmt = n => `$${n.toFixed(0)}`;
  const expired = promo.end ? (new Date(promo.end).getTime() <= now) : false;

  const cardHTML = (p, expired, countdown) => `
    <article class="promo-card ${expired ? 'expired' : ''}" data-id="${p.id}">
      <div class="promo-media">
        <img src="${p.img}" alt="${p.title}">
      </div>
      <div class="promo-body">
        <h3 class="promo-title">${p.title}</h3>
        <p class="promo-desc">${p.desc}</p>

        <div class="promo-meta">
          <span class="badge">Código: ${p.code}</span>
          ${expired ? `<span class="badge">Finalizada</span>` : `<span class="tag">Activa</span>`}
        </div>

        <div class="price-wrap">
          <span class="price-old">${fmt(p.old)}</span>
          <span class="price-new">${fmt(p.now)}</span>
        </div>

        <div class="timer" data-end="${p.end || ''}">
          ${expired ? 'Promoción finalizada' : (p.end ? `Termina en: ${countdown}` : 'Vigente')}
        </div>

        <div class="promo-actions">
          <a class="btn btn-primary"
             href="https://wa.me/50374913370?text=${encodeURIComponent(p.waText)}"
             target="_blank" rel="noopener">Reservar por WhatsApp</a>
          <a class="btn btn-secondary" href="#precios">Ver condiciones</a>
        </div>
      </div>
    </article>
  `;

  const endMs = promo.end ? new Date(promo.end).getTime() : null;
  const cd = (!endMs || endMs <= now) ? '' : formatCountdown(endMs - now);

  wrap.innerHTML = cardHTML(promo, expired, cd);

  // Si está vencida, oculta todo de inmediato
  if (expired) {
    section.style.display = 'none';
    if (navLink) navLink.style.display = 'none';
    return;
  }

  // Iniciar contador si hay fecha de fin
  if (endMs) startSingleCountdown(document.querySelector('.timer'), endMs, section, navLink);
})();

// === Helpers (reusa los que ya tenías si existen) ===
function formatCountdown(ms){
  if (ms <= 0) return '00d 00h 00m 00s';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(ss)}s`;
}

function startSingleCountdown(node, endMs, section, navLink){
  const tick = () => {
    const diff = endMs - Date.now();
    if (diff <= 0) {
      // Expirada: oculta sección y menú
      if (node) node.textContent = 'Promoción finalizada';
      if (section) section.style.display = 'none';
      if (navLink) navLink.style.display = 'none';
      clearInterval(iv);
      return;
    }
    if (node) node.textContent = 'Termina en: ' + formatCountdown(diff);
  };
  tick();
  const iv = setInterval(tick, 1000);
}

