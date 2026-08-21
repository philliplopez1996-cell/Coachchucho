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
    // Reset back to the intake form after the close animation finishes
    setTimeout(() => {
      document.getElementById('bookingStep1').style.display = '';
      document.getElementById('bookingStep2').style.display = 'none';
      document.getElementById('bookingConfirmed').style.display = 'none';
      document.getElementById('calBookingContainer').style.display = '';
      document.getElementById('calBookingContainer').innerHTML = '';
      document.getElementById('bookingForm').reset();
    }, 300);
  }

  // ====== SCHEDULE / TIME-SLOT PICKER ======
  // Coach's working hours and session spacing — edit these to change availability everywhere.
  const SCHEDULE_START_MIN = 7 * 60 + 30;   // 7:30 AM
  const SCHEDULE_END_MIN = 15 * 60 + 30;    // 3:30 PM
  const SESSION_MINUTES = 75;               // length of a session
  const BUFFER_MINUTES = 30;                // gap required after a session before the next can start

  function getDaySlots() {
    const slots = [];
    for (let t = SCHEDULE_START_MIN; t + SESSION_MINUTES <= SCHEDULE_END_MIN; t += SESSION_MINUTES + BUFFER_MINUTES) {
      slots.push(t);
    }
    return slots;
  }
  function formatTime(mins) {
    const h = Math.floor(mins / 60), m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ampm;
  }

  // Renders a self-contained month calendar + open-times list into `container`,
  // calling onPick(dateLabel, timeLabel) when a time slot is chosen. Every day
  // Mon–Sun is available (per the coach's hours above); only past days are blocked.
  function createCalendarWidget(container, onPick, confirmLabel) {
    confirmLabel = confirmLabel || 'Confirm time';
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let viewYear, viewMonth;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    let selectedDate = new Date(today);

    function render() {
      const firstDay = new Date(viewYear, viewMonth, 1).getDay();
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
      const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

      let cells = ['S','M','T','W','T','F','S'].map(d => `<div class="cal-dow">${d}</div>`).join('');
      for (let i = 0; i < firstDay; i++) cells += '<div class="cal-day empty"></div>';
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth, d);
        const isPast = date < today;
        const isSelected = date.getTime() === selectedDate.getTime();
        const isToday = date.getTime() === today.getTime();
        cells += `<button type="button" class="cal-day${isPast ? ' disabled' : ''}${isSelected ? ' selected' : ''}${isToday && !isSelected ? ' today' : ''}" ${isPast ? 'disabled' : ''} data-d="${d}">${d}</button>`;
      }

      const slots = getDaySlots();
      const dateLabel = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const slotsHtml = slots.map(mins => `<button type="button" class="cal-slot" data-mins="${mins}">${formatTime(mins)}</button>`).join('');

      container.innerHTML = `
        <div class="cal-header">
          <button type="button" class="cal-nav" data-nav="-1" ${isCurrentMonth ? 'disabled' : ''}>‹</button>
          <div class="cal-month-label">${monthNames[viewMonth]} ${viewYear}</div>
          <button type="button" class="cal-nav" data-nav="1">›</button>
        </div>
        <div class="cal-grid">${cells}</div>
        <div class="cal-slots">
          <div class="cal-slots-label">Open times — ${dateLabel}</div>
          <div class="cal-slots-grid">${slotsHtml}</div>
        </div>
      `;

      container.querySelectorAll('.cal-day:not(.empty):not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedDate = new Date(viewYear, viewMonth, parseInt(btn.dataset.d, 10));
          render();
        });
      });
      container.querySelectorAll('.cal-nav').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.disabled) return;
          const delta = parseInt(btn.dataset.nav, 10);
          const next = new Date(viewYear, viewMonth + delta, 1);
          viewYear = next.getFullYear();
          viewMonth = next.getMonth();
          render();
        });
      });
      container.querySelectorAll('.cal-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          renderConfirm(dateLabel, formatTime(parseInt(btn.dataset.mins, 10)));
        });
      });
    }

    // A tap on a time slot doesn't commit right away — show a confirm/back
    // screen first so an accidental tap never books the wrong time.
    function renderConfirm(dateLabel, timeLabel) {
      container.innerHTML = `
        <div class="cal-confirm">
          <div class="cal-confirm-label">Confirm this time?</div>
          <div class="cal-confirm-datetime">${dateLabel}<br>${timeLabel}</div>
          <div class="modal-actions">
            <button type="button" class="send-btn cal-confirm-btn">${confirmLabel}</button>
            <button type="button" class="cancel-btn cal-back-btn">Choose another time</button>
          </div>
        </div>
      `;
      // Scoped to this widget's own container — createCalendarWidget can have
      // multiple independent instances alive in the DOM at once (sidebar preview,
      // booking form), so a global getElementById could grab the wrong instance.
      container.querySelector('.cal-confirm-btn').addEventListener('click', () => onPick(dateLabel, timeLabel));
      container.querySelector('.cal-back-btn').addEventListener('click', render);
    }
    render();
  }

  // Sidebar "Calendar" — schedule preview with a book-this-slot shortcut
  function openSchedule() {
    closeMenu();
    document.getElementById('scheduleModal').classList.add('show');
    createCalendarWidget(document.getElementById('calScheduleContainer'), function(dateLabel, timeLabel) {
      closeSchedule();
      openModal('Session request — ' + dateLabel + ' at ' + timeLabel);
    }, 'Confirm & start booking');
  }
  function closeSchedule() {
    document.getElementById('scheduleModal').classList.remove('show');
  }
  document.getElementById('scheduleModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeSchedule();
  });

  // Booking requests email straight to the coach via FormSubmit.co — a
  // free form-to-email service that needs no backend and no account beyond
  // a one-time confirmation click on the coach's email the very first time
  // it's used.
  const BOOKING_EMAIL = 'coachchucho@gmail.com';

  function submitBooking(e) {
    e.preventDefault();
    document.getElementById('bookingStep1').style.display = 'none';
    document.getElementById('bookingStep2').style.display = 'block';

    const bookingInfo = {
      plan: document.getElementById('planLabel').textContent,
      kidsName: document.getElementById('kidsName').value,
      kidsAge: document.getElementById('kidsAge').value,
      positions: document.getElementById('positions').value,
      parentName: document.getElementById('parentName').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      notes: document.getElementById('notes').value
    };

    createCalendarWidget(document.getElementById('calBookingContainer'), function(dateLabel, timeLabel) {
      sendBookingRequest(bookingInfo, dateLabel, timeLabel);
    }, 'Confirm & send request');
  }

  function sendBookingRequest(info, dateLabel, timeLabel) {
    const container = document.getElementById('calBookingContainer');
    container.innerHTML = '<div class="step2-hint">Sending your request…</div>';

    fetch('https://formsubmit.co/ajax/' + BOOKING_EMAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'New booking request — ' + info.plan,
        Plan: info.plan,
        'Requested date': dateLabel,
        'Requested time': timeLabel,
        "Kid's name": info.kidsName,
        "Kid's age": info.kidsAge,
        'Position(s)': info.positions,
        "Parent's name": info.parentName,
        "Parent's phone": info.phone,
        "Parent's email": info.email,
        'Notes': info.notes || '(none)'
      })
    })
      .then(res => { if (!res.ok) throw new Error('request failed'); })
      .then(() => {
        container.style.display = 'none';
        const confirmed = document.getElementById('bookingConfirmed');
        confirmed.textContent = '✓ Requested ' + dateLabel + ' at ' + timeLabel + " — we've emailed the coach, and you'll hear back to confirm.";
        confirmed.style.display = 'block';
      })
      .catch(() => {
        container.innerHTML = '<div class="step2-hint" style="margin-bottom:16px;">Something went wrong sending your request. Please call or text directly to confirm, or try again below.</div>';
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'send-btn';
        retryBtn.textContent = 'Try again';
        retryBtn.addEventListener('click', () => sendBookingRequest(info, dateLabel, timeLabel));
        container.appendChild(retryBtn);
      });
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
    const BALL_COUNT = 3;
    const pageHeight = document.body.scrollHeight;

    // Keep the hero photo completely clear — spheres only start appearing once you scroll past it
    const heroEl = document.querySelector('.hero');
    const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
    const zoneStart = (heroBottom + 110) / pageHeight;
    const zoneEnd = 0.97;

    const TIERS = [
      { min: 40, max: 60, opacity: [0.55, 0.7], blur: 0.5 },
      { min: 60, max: 85, opacity: [0.8, 0.95],  blur: 0 },
      { min: 85, max: 110, opacity: [0.95, 1],   blur: 0 },
    ];

    for (let i = 0; i < BALL_COUNT; i++) {
      const tier = TIERS[i % TIERS.length];
      const size = rand(tier.min, tier.max);
      const top = rand(zoneStart, zoneEnd) * pageHeight;

      const el = document.createElement('div');
      el.className = 'floating-3d ball-3d';
      el.setAttribute('aria-hidden', 'true');
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.top = top + 'px';
      el.style.left = '0px';
      el.style.opacity = String(rand(tier.opacity[0], tier.opacity[1]));
      if (tier.blur) el.style.filter = `blur(${tier.blur}px)`;
      ballField.appendChild(el);

      balls3d.push({
        el,
        size,
        ampY: rand(14, 32),
        freqY: rand(0.0007, 0.0015),
        phaseY: rand(0, Math.PI * 2),
        freqX: rand(0.00016, 0.00028),
        phaseX: rand(0, Math.PI * 2),
        spin: rand(-0.02, 0.02),
      });
    }
  }

  function animateBalls(timestamp) {
    if (balls3d.length) {
      const vw = window.innerWidth;
      balls3d.forEach(b => {
        const margin = b.size / 2 + 12;
        const rangeX = Math.max(vw - margin * 2, 0);
        const x = margin + ((Math.sin(timestamp * b.freqX + b.phaseX) * 0.5) + 0.5) * rangeX;
        const bounce = Math.sin(timestamp * b.freqY + b.phaseY) * b.ampY;
        const rotate = timestamp * b.spin;
        b.el.style.transform = `translate(${x}px, ${bounce}px) rotate(${rotate}deg)`;
      });
    }
    requestAnimationFrame(animateBalls);
  }
  requestAnimationFrame(animateBalls);

  // Photo showcase
  const showcase = document.getElementById('photoShowcase');
  if (showcase) {
    if (window.matchMedia('(max-width: 768px)').matches) {
      // Mobile: fade one photo in/out at a time in a fixed-height stage — no horizontal
      // spillover and no growth in page height.
      const photos = Array.from(showcase.querySelectorAll('.gallery-photo'));
      let activeIndex = 0;
      if (photos.length) {
        photos[0].classList.add('active');
        setInterval(() => {
          photos[activeIndex].classList.remove('active');
          activeIndex = (activeIndex + 1) % photos.length;
          photos[activeIndex].classList.add('active');
        }, 2600);
      }
    } else {
      // Desktop/tablet: drifts left to right, pauses when a parent scrolls it manually
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
