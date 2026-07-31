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

  // Floating 3D spheres (home page only) — bounce continuously in the empty side margins,
  // with extra drift and spin layered on top as the page scrolls
  const balls3d = [
    { el: document.getElementById('ball3d1'), ampY: 34, freq: 0.0009, phase: 0,   spin: 0.5,  driftAmp: 26, driftFreq: 0.0016 },
    { el: document.getElementById('ball3d2'), ampY: 20, freq: 0.0013, phase: 1.4, spin: -0.7, driftAmp: 18, driftFreq: 0.0021 },
    { el: document.getElementById('ball3d3'), ampY: 14, freq: 0.0017, phase: 2.6, spin: 0.9,  driftAmp: 10, driftFreq: 0.0026 },
    { el: document.getElementById('ball3d4'), ampY: 26, freq: 0.0011, phase: 0.8, spin: -0.4, driftAmp: 22, driftFreq: 0.0018 },
    { el: document.getElementById('ball3d5'), ampY: 12, freq: 0.0021, phase: 3.5, spin: 0.6,  driftAmp: 8,  driftFreq: 0.003 },
    { el: document.getElementById('ball3d6'), ampY: 30, freq: 0.001,  phase: 4.2, spin: -0.5, driftAmp: 24, driftFreq: 0.0014 },
  ].filter(b => b.el);

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
