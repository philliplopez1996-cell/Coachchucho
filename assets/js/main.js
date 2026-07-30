// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });
}

// Portfolio category filter
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');
const frameCount = document.querySelector('.frame-count');

function updateFrameCount() {
  if (!frameCount) return;
  const visible = document.querySelectorAll('.portfolio-item:not(.hidden)').length;
  frameCount.textContent = `${visible} FRAME${visible === 1 ? '' : 'S'}`;
}

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.filter;

    portfolioItems.forEach((item) => {
      const match = category === 'all' || item.dataset.category === category;
      item.classList.toggle('hidden', !match);
    });

    updateFrameCount();
  });
});

updateFrameCount();

// Lightbox
const lightbox = document.querySelector('.lightbox');

if (lightbox) {
  const lightboxTile = lightbox.querySelector('.ph-tile');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let activeItems = [];
  let activeIndex = 0;

  function openLightbox(items, index) {
    activeItems = items;
    activeIndex = index;
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderLightbox() {
    const item = activeItems[activeIndex];
    const label = item.querySelector('.ph-tile').dataset.label;
    const frame = String(activeIndex + 1).padStart(2, '0');
    const total = String(activeItems.length).padStart(2, '0');
    lightboxTile.dataset.label = label;
    lightboxCaption.textContent = `FRAME ${frame} / ${total} — ${label}`;
  }

  function step(delta) {
    activeIndex = (activeIndex + delta + activeItems.length) % activeItems.length;
    renderLightbox();
  }

  document.querySelectorAll('[data-lightbox-group]').forEach((group) => {
    const items = Array.from(group.querySelectorAll('.portfolio-item, .grid-item'));
    items.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(items, index);
      });
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}
