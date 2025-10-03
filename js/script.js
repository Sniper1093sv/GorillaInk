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
