/* Hard Top Concrete — script.js */

// ── FOOTER YEAR ──────────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── NAV SCROLL EFFECT ────────────────────────────────────
const header  = document.getElementById('site-header');
const navBrand = document.querySelector('.nav-brand');

function onScroll() {
  const isScrolled = window.scrollY > 24;
  header.classList.toggle('scrolled', isScrolled);
  if (navBrand) navBrand.style.opacity = isScrolled ? '0' : '';
  highlightActiveSection();
}

window.addEventListener('scroll', onScroll, { passive: true });

// ── MOBILE MENU ──────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('open', !open);
  mobileMenu.setAttribute('aria-hidden', String(open));
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
  });
});

// ── ACTIVE NAV LINK ──────────────────────────────────────
const sections = Array.from(document.querySelectorAll('section[id]'));
const navLinks = Array.from(document.querySelectorAll('.nav-links a'));

function highlightActiveSection() {
  const scrollMid = window.scrollY + window.innerHeight * 0.4;
  let activeId = sections[0]?.id;

  sections.forEach(sec => {
    if (sec.offsetTop <= scrollMid) activeId = sec.id;
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
  });
}

// ── COUNTER ANIMATION ────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (!target) return;

  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = Math.round(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

// ── INTERSECTION OBSERVER ────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;

    // Reveal animation
    if (el.classList.contains('reveal') || el.classList.contains('reveal-left')) {
      el.classList.add('visible');
    }

    // Counter — only on .stat elements
    if (el.classList.contains('stat')) {
      const numEl = el.querySelector('.stat-num[data-target]');
      if (numEl) animateCounter(numEl);
    }

    observer.unobserve(el);
  });
}, { threshold: 0.15 });

// Slide-up reveals — grid items get staggered delays
const revealUpTargets = [
  '.service-card',
  '.process-step',
  '.about-visual',
  '.contact-form-wrap',
  '.ci-list',
  '.photo-card',
  '.sp-col',
  '.ls-teaser',
  '.footer-col',
];

revealUpTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    const delay = Math.min(i, 5);
    if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
    observer.observe(el);
  });
});

// Slide-in-from-left — section eyebrows and headings
const revealLeftTargets = [
  '.eyebrow',
  '.sp-title',
  '.page-hero h1',
  '.contact-info h2',
  '.about-text',
  'section h2',
];

revealLeftTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach(el => {
    if (!el.closest('.hero')) {
      el.classList.add('reveal-left');
      observer.observe(el);
    }
  });
});

// Observe stat rows for counter
document.querySelectorAll('.stat').forEach(el => observer.observe(el));

// ── CONTACT FORM ─────────────────────────────────────────
const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', e => {
    // If form has no real action URL, prevent default and show feedback
    if (!form.action || form.action === window.location.href) {
      e.preventDefault();
    }

    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;

    btn.textContent = 'Request Sent!';
    btn.disabled = true;
    btn.style.background = '#1a7a3a';
    btn.style.borderColor = '#1a7a3a';

    // Reset after 3.5s if we handled it client-side
    if (e.defaultPrevented) {
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = '';
        btn.style.borderColor = '';
        form.reset();
      }, 3500);
    }
  });
}

// ── SMOOTH ANCHOR OFFSET (accounts for fixed nav) ────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const navHeight = document.getElementById('site-header').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── STAMP DUST EFFECT ────────────────────────────────────
(function stampDust() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const logoImg = document.querySelector('.nav-center .logo-img');
  if (!logoImg) return;

  logoImg.addEventListener('animationend', () => {
    const rect = logoImg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Concrete-dust colors: light gray, warm beige, faint orange sparks
    const palette = [
      'rgba(210,200,185,0.95)',
      'rgba(235,225,210,0.90)',
      'rgba(180,170,155,0.85)',
      'rgba(255,255,255,0.70)',
      'rgba(230,115,40,0.80)',   // orange spark
      'rgba(230,115,40,0.60)',
    ];

    const count = 22;
    for (let i = 0; i < count; i++) {
      // Spread evenly around the circle with slight random jitter
      const baseAngle = (i / count) * Math.PI * 2;
      const angle = baseAngle + (Math.random() - 0.5) * 0.5;
      const dist = 38 + Math.random() * 48;          // 38–86 px travel
      const dx = Math.round(Math.cos(angle) * dist);
      const dy = Math.round(Math.sin(angle) * dist);
      const size = 4 + Math.random() * 7;             // 4–11 px
      const color = palette[Math.floor(Math.random() * palette.length)];
      const dur = 0.7 + Math.random() * 0.4;         // 0.7–1.1 s
      const delay = Math.random() * 0.08;

      const mote = document.createElement('div');
      mote.className = 'dust-mote';
      mote.style.cssText = `
        left: ${cx - size / 2}px;
        top:  ${cy - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        --dx: ${dx}px;
        --dy: ${dy}px;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
      `;
      document.body.appendChild(mote);
      mote.addEventListener('animationend', () => mote.remove(), { once: true });
    }
  }, { once: true });
})();

// ── HOMEPAGE SLIDESHOW ───────────────────────────────────
(function initSlideshow() {
  const el = document.getElementById('homepage-slideshow');
  if (!el) return;

  const slides = el.querySelectorAll('.ss-slide');
  const numEl  = el.querySelector('.ss-num');
  const total  = slides.length;
  if (!total) return;

  let current = 0;
  let timer;

  function pad(n) { return String(n + 1).padStart(2, '0'); }

  function goTo(index) {
    slides[current].classList.remove('active');
    current = (index + total) % total;
    slides[current].classList.add('active');
    if (numEl) numEl.textContent = pad(current);
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 4500);
  }

  el.querySelector('.ss-prev').addEventListener('click', () => goTo(current - 1));
  el.querySelector('.ss-next').addEventListener('click', () => goTo(current + 1));

  el.addEventListener('mouseenter', () => clearInterval(timer));
  el.addEventListener('mouseleave', resetTimer);

  // Touch swipe support
  let touchStartX = 0;
  el.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
  });

  resetTimer();
})();

// ── PHOTO GALLERY FILTER ─────────────────────────────────
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  const cards = document.querySelectorAll('.photo-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });
})();

// Run once on load
onScroll();

// ── ACTIVE NAV PAGE HIGHLIGHT ────────────────────────────
// Marks the nav link that matches the current page filename.
// Scroll-based highlighting only runs on pages with anchor sections.
(function markActivePage() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    const linkPage = href.split('#')[0].split('/').pop();
    if (linkPage === page) link.classList.add('active');
  });
})();
