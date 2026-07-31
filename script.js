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
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      orb1.style.transform = `translateY(${y * 0.18}px)`;
      orb2.style.transform = `translateY(${y * -0.12}px)`;
      ticking = false;
    });
  }, { passive: true });

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
