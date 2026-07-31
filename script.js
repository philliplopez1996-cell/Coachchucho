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

  // Floating 3D spheres (home page only) — randomized sizes scattered down the full page's
  // empty side margins, bouncing continuously with extra drift/spin layered on as it scrolls.
  // Small spheres sit hazy and subtle in the "back"; large ones are sharp and lively up "front".
  const ballField = document.getElementById('ballField3d');
  const balls3d = [];
  if (ballField) {
    const rand = (min, max) => Math.random() * (max - min) + min;
    const BALL_COUNT = 10;
    const pageHeight = document.body.scrollHeight;
    const MIN_GAP = 70; // minimum px gap (beyond combined radii) between balls on the same side
    const placed = { left: [], right: [] };

    const TIERS = [
      { name: 'small',  min: 16, max: 34, opacity: [0.35, 0.55], blur: 1.4, ampScale: 0.5 },
      { name: 'medium', min: 35, max: 64, opacity: [0.6, 0.8],   blur: 0.5, ampScale: 0.8 },
      { name: 'large',  min: 65, max: 100, opacity: [0.9, 1],    blur: 0,   ampScale: 1.3 },
    ];
    // Guarantee a real mix of sizes (not left to chance): ~1/3 small, 1/3 medium, 1/3 large
    const tierAssignments = [];
    for (let i = 0; i < BALL_COUNT; i++) tierAssignments.push(TIERS[i % TIERS.length]);
    for (let i = tierAssignments.length - 1; i > 0; i--) {
      const j = Math.floor(rand(0, i + 1));
      [tierAssignments[i], tierAssignments[j]] = [tierAssignments[j], tierAssignments[i]];
    }

    for (let i = 0; i < BALL_COUNT; i++) {
      const tier = tierAssignments[i];
      const size = rand(tier.min, tier.max);
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const edgeOffset = rand(0.5, 8.5);

      // Try to find a top position that doesn't crowd existing balls on the same side
      let top = rand(0.03, 0.97) * pageHeight;
      for (let attempt = 0; attempt < 25; attempt++) {
        const candidate = rand(0.03, 0.97) * pageHeight;
        const tooClose = placed[side].some(p => Math.abs(p.top - candidate) < (p.size + size) / 2 + MIN_GAP);
        if (!tooClose) { top = candidate; break; }
      }
      placed[side].push({ top, size });

      const el = document.createElement('div');
      el.className = 'floating-3d ball-3d';
      el.setAttribute('aria-hidden', 'true');
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.top = top + 'px';
      el.style[side] = edgeOffset + 'vw';
      el.style.opacity = String(rand(tier.opacity[0], tier.opacity[1]));
      if (tier.blur) el.style.filter = `blur(${tier.blur}px)`;
      ballField.appendChild(el);

      balls3d.push({
        el,
        ampY: rand(8, 36) * tier.ampScale,
        freq: rand(0.0008, 0.0022),
        phase: rand(0, Math.PI * 2),
        spin: rand(-1, 1) * tier.ampScale,
        driftAmp: rand(6, 28) * tier.ampScale,
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
