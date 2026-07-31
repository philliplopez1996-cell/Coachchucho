  function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('show');
  }
  function closeMenu() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }
  function openModal(plan) {
    document.getElementById('planLabel').textContent = plan;
    document.getElementById('bookingModal').classList.add('show');
  }
  function closeModal() {
    document.getElementById('bookingModal').classList.remove('show');
  }
  function submitBooking(e) {
    e.preventDefault();
    const name = document.getElementById('parentName').value;
    alert('Thank you ' + name + '! Your inquiry has been sent. We will be in touch soon!');
    e.target.reset();
    closeModal();
  }
  document.getElementById('bookingModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => q.closest('.faq-item').classList.toggle('open'));
  });

  // Parallax glow orbs — drift at different rates as the page scrolls
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');

  let ticking = false;
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      orb1.style.transform = `translateY(${y * 0.18}px)`;
      orb2.style.transform = `translateY(${y * -0.12}px)`;
      lastScrollY = y;
      ticking = false;
    });
  }, { passive: true });

  // Floating 3D spheres (home page only) — randomized sizes scattered across the empty
  // side margins, bouncing continuously with extra drift/spin layered on as the page scrolls
  const ballField = document.getElementById('ballField3d');
  const balls3d = [];
  if (ballField) {
    const rand = (min, max) => Math.random() * (max - min) + min;
    const BALL_COUNT = 16;
    for (let i = 0; i < BALL_COUNT; i++) {
      const size = rand(16, 100);
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const edgeOffset = rand(0.5, 8.5);
      const top = rand(6, 94);

      const el = document.createElement('div');
      el.className = 'floating-3d ball-3d';
      el.setAttribute('aria-hidden', 'true');
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.top = top + 'vh';
      el.style[side] = edgeOffset + 'vw';
      el.style.opacity = String(rand(0.55, 1));
      ballField.appendChild(el);

      balls3d.push({
        el,
        ampY: rand(8, 36),
        freq: rand(0.0008, 0.0022),
        phase: rand(0, Math.PI * 2),
        spin: rand(-1, 1),
        driftAmp: rand(6, 28),
        driftFreq: rand(0.0012, 0.0032),
      });
    }
  }

  function animateBalls(timestamp) {
    if (balls3d.length) {
      const y = lastScrollY;
      balls3d.forEach(b => {
        const bounce = Math.sin(timestamp * b.freq + b.phase) * b.ampY;
        const drift = Math.sin(y * b.driftFreq + b.phase) * b.driftAmp;
        const rotate = y * b.spin;
        b.el.style.transform = `translateY(${bounce + drift}px) rotate(${rotate}deg)`;
      });
    }
    requestAnimationFrame(animateBalls);
  }
  requestAnimationFrame(animateBalls);

  // Auto-scrolling photo showcase — drifts left to right, pauses when a parent scrolls it manually
  const showcase = document.getElementById('photoShowcase');
  if (showcase) {
    let autoScroll = true;
    let resumeTimer;
    showcase.scrollLeft = showcase.scrollWidth - showcase.clientWidth;
    function driftShowcase() {
      if (autoScroll) {
        showcase.scrollLeft -= 0.6;
        if (showcase.scrollLeft <= 0) {
          showcase.scrollLeft = showcase.scrollWidth - showcase.clientWidth;
        }
      }
      requestAnimationFrame(driftShowcase);
    }
    requestAnimationFrame(driftShowcase);
    function pauseShowcase() {
      autoScroll = false;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { autoScroll = true; }, 3000);
    }
    showcase.addEventListener('pointerdown', pauseShowcase);
    showcase.addEventListener('wheel', pauseShowcase, { passive: true });
    showcase.addEventListener('touchstart', pauseShowcase, { passive: true });
  }

  // Scroll reveal — sections fade/slide in as they enter the viewport
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
