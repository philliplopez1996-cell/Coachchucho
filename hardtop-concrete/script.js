/* Hard Top Concrete — script.js */

// ── FOOTER YEAR ──────────────────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── NAV SCROLL EFFECT ────────────────────────────────────
const header = document.getElementById('site-header');

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 24);
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
    if (el.classList.contains('reveal')) {
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

// Apply reveal to key elements
const revealTargets = [
  '.service-card',
  '.process-step',
  '.about-text',
  '.about-visual',
  '.contact-form-wrap',
  '.ci-list',
];

revealTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    if (i > 0 && i <= 3) el.classList.add(`reveal-delay-${i}`);
    observer.observe(el);
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
