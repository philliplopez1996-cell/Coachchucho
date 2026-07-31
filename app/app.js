(function () {
  'use strict';

  /* ============================================================
     CONSTANTS
  ============================================================ */
  const TOKEN_KEY = 'cc_token';
  const ROLE_KEY = 'cc_role';
  const POSITIONS = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
  const TEAM_COLORS = ['#4AFF3F', '#00D9FF', '#FFD700', '#FF6B35', '#FF3F8E', '#8B5CF6', '#3F8CFF'];

  const THEMES = [
    { key: 'field', label: 'Field', premium: false, previewBg: '#0a1f10', previewDots: ['#4AFF3F', '#00D9FF', '#FFD700'] },
    { key: 'midnight', label: 'Midnight', premium: true, previewBg: '#0b1220', previewDots: ['#38BDF8', '#A78BFA', '#FFD700'] },
  ];
  // Premium themes are unlocked for everyone during the free period.
  // Flip this once real in-app purchases are wired up in a packaged app.
  const PREMIUM_UNLOCKED = true;

  function applyTheme(themeKey) {
    const theme = THEMES.find((t) => t.key === themeKey) || THEMES[0];
    document.documentElement.setAttribute('data-theme', theme.key);
  }

  const COUNTRIES = [
    ['United States', 'US'], ['Mexico', 'MX'], ['Canada', 'CA'], ['Brazil', 'BR'], ['Argentina', 'AR'],
    ['Colombia', 'CO'], ['Venezuela', 'VE'], ['Chile', 'CL'], ['Peru', 'PE'], ['Ecuador', 'EC'],
    ['Uruguay', 'UY'], ['Paraguay', 'PY'], ['Bolivia', 'BO'], ['Honduras', 'HN'], ['El Salvador', 'SV'],
    ['Guatemala', 'GT'], ['Nicaragua', 'NI'], ['Costa Rica', 'CR'], ['Panama', 'PA'],
    ['Dominican Republic', 'DO'], ['Puerto Rico', 'PR'], ['Cuba', 'CU'], ['Jamaica', 'JM'],
    ['Haiti', 'HT'], ['Spain', 'ES'], ['Portugal', 'PT'], ['England', 'GB'], ['Scotland', 'GB'],
    ['Wales', 'GB'], ['Ireland', 'IE'], ['France', 'FR'], ['Germany', 'DE'], ['Italy', 'IT'],
    ['Netherlands', 'NL'], ['Belgium', 'BE'], ['Switzerland', 'CH'], ['Austria', 'AT'],
    ['Sweden', 'SE'], ['Norway', 'NO'], ['Denmark', 'DK'], ['Poland', 'PL'], ['Croatia', 'HR'],
    ['Serbia', 'RS'], ['Greece', 'GR'], ['Turkey', 'TR'], ['Ukraine', 'UA'], ['Russia', 'RU'],
    ['Morocco', 'MA'], ['Algeria', 'DZ'], ['Tunisia', 'TN'], ['Egypt', 'EG'], ['Nigeria', 'NG'],
    ['Ghana', 'GH'], ['Senegal', 'SN'], ['Ivory Coast', 'CI'], ['Cameroon', 'CM'],
    ['South Africa', 'ZA'], ['Japan', 'JP'], ['South Korea', 'KR'], ['China', 'CN'], ['India', 'IN'],
    ['Philippines', 'PH'], ['Vietnam', 'VN'], ['Australia', 'AU'], ['New Zealand', 'NZ'],
  ];
  const COUNTRY_CODE_BY_NAME = Object.fromEntries(COUNTRIES);

  function flagEmoji(countryName) {
    const code = COUNTRY_CODE_BY_NAME[countryName];
    if (!code) return '';
    return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
  }

  const PLAYSTYLE_CATS = [
    {
      key: 'scoring', label: 'Scoring', color: '#FF6B1A',
      skills: [
        { key: 'power_shot',   name: 'Power Shot',   icon: '<circle cx="12" cy="12" r="5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>' },
        { key: 'dead_ball',    name: 'Dead Ball',    icon: '<circle cx="12" cy="8" r="4"/><path d="M12 12v5M8 17h8"/>' },
        { key: 'finesse_shot', name: 'Finesse Shot', icon: '<path d="M4 20C8 12 18 8 22 8"/><path d="M19 5l3 3-3 3"/>' },
        { key: 'chip_shot',    name: 'Chip Shot',    icon: '<path d="M3 20C5 10 12 4 18 5"/><circle cx="20" cy="8" r="3"/>' },
        { key: 'acrobatic',    name: 'Acrobatic',    icon: '<path d="M6 4l12 16M18 4L6 20"/>' },
        { key: 'bicycle_kick', name: 'Bicycle Kick', icon: '<path d="M4 18l8-12 8 12"/><circle cx="12" cy="3" r="2.5"/>' },
      ],
    },
    {
      key: 'passing', label: 'Passing', color: '#00CFFF',
      skills: [
        { key: 'incisive_pass', name: 'Incisive Pass', icon: '<path d="M3 12h18"/><path d="M13 6l6 6-6 6"/>' },
        { key: 'pinged_pass',   name: 'Pinged Pass',   icon: '<path d="M2 12h20"/><path d="M14 6l6 6-6 6"/><path d="M2 8v8"/>' },
        { key: 'whipped_pass',  name: 'Whipped Pass',  icon: '<path d="M4 18C4 18 4 4 20 12"/><path d="M16 9l4 3-4 3"/>' },
        { key: 'long_ball',     name: 'Long Ball Pass', icon: '<path d="M3 18C3 6 21 6 21 6"/><path d="M17 3l4 3-4 3"/>' },
        { key: 'tiki_taka',    name: 'Tiki Taka',     icon: '<path d="M3 8h7M14 16h7"/><path d="M7 5l3 3-3 3"/><path d="M17 13l-3 3 3 3"/>' },
        { key: 'foot_outside', name: 'Foot Outside',  icon: '<path d="M10 3C5 5 3 10 3 13C3 18 7 21 12 21C17 21 21 18 21 13C21 8 17 4 12 3"/>' },
      ],
    },
    {
      key: 'ball_control', label: 'Ball Control', color: '#00E564',
      skills: [
        { key: 'technical',    name: 'Technical',    icon: '<polygon points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7"/>' },
        { key: 'rapid',        name: 'Rapid',        icon: '<path d="M13 2L5 13h7l-1 9 8-11h-7z"/>' },
        { key: 'flair',        name: 'Flair',        icon: '<polygon points="12,2 15,8.5 22,9.5 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.5 9,8.5"/>' },
        { key: 'press_proven', name: 'Press Proven', icon: '<path d="M12 2L3 7v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V7z"/><path d="M9 12l2 2 4-4"/>' },
        { key: 'first_touch',  name: 'First Touch',  icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>' },
      ],
    },
    {
      key: 'defending', label: 'Defending', color: '#A855F7',
      skills: [
        { key: 'jockey',       name: 'Jockey',       icon: '<rect x="4" y="4" width="5" height="16" rx="1"/><rect x="15" y="4" width="5" height="16" rx="1"/>' },
        { key: 'block',        name: 'Block',         icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/>' },
        { key: 'intercept',    name: 'Intercept',     icon: '<path d="M3 7l6 5-6 5"/><path d="M21 7l-6 5 6 5"/><path d="M9 12h6"/>' },
        { key: 'anticipate',   name: 'Anticipate',    icon: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7"/><circle cx="12" cy="12" r="3"/>' },
        { key: 'bruiser',      name: 'Bruiser',       icon: '<circle cx="12" cy="12" r="8"/><path d="M9 12l2 2 4-4"/>' },
        { key: 'slide_tackle', name: 'Slide Tackle',  icon: '<path d="M2 18L22 6"/><path d="M2 18h5"/><path d="M19 6h3"/>' },
      ],
    },
    {
      key: 'physical', label: 'Physical', color: '#FFD700',
      skills: [
        { key: 'long_throw',   name: 'Long Throw',   icon: '<path d="M4 16C10 14 18 8 20 4"/><path d="M16 2l4 2-2 4"/>' },
        { key: 'power_header', name: 'Power Header',  icon: '<circle cx="12" cy="5" r="3"/><path d="M8 12h8M10 12v8M14 12v8"/>' },
        { key: 'aerial',       name: 'Aerial',        icon: '<circle cx="12" cy="4" r="3"/><path d="M12 7v7"/><path d="M7 20l5-6 5 6"/>' },
        { key: 'hard_tackle',  name: 'Hard Tackle',   icon: '<path d="M4 8l16 8M4 16l16-8"/>' },
      ],
    },
  ];

  const PLAYSTYLE_BY_KEY = {};
  PLAYSTYLE_CATS.forEach((cat) => {
    cat.skills.forEach((s) => { PLAYSTYLE_BY_KEY[s.key] = { ...s, cat: cat.key, color: cat.color, catLabel: cat.label }; });
  });

  const FORMATIONS = {
    '4-3-3': [
      { label: 'GK', x: 6, y: 50 }, { label: 'LB', x: 20, y: 18 }, { label: 'CB', x: 16, y: 40 },
      { label: 'CB', x: 16, y: 60 }, { label: 'RB', x: 20, y: 82 }, { label: 'CM', x: 45, y: 35 },
      { label: 'CM', x: 40, y: 50 }, { label: 'CM', x: 45, y: 65 }, { label: 'LW', x: 78, y: 20 },
      { label: 'ST', x: 85, y: 50 }, { label: 'RW', x: 78, y: 80 },
    ],
    '4-4-2': [
      { label: 'GK', x: 6, y: 50 }, { label: 'LB', x: 20, y: 18 }, { label: 'CB', x: 16, y: 40 },
      { label: 'CB', x: 16, y: 60 }, { label: 'RB', x: 20, y: 82 }, { label: 'LM', x: 45, y: 18 },
      { label: 'CM', x: 42, y: 42 }, { label: 'CM', x: 42, y: 58 }, { label: 'RM', x: 45, y: 82 },
      { label: 'ST', x: 82, y: 40 }, { label: 'ST', x: 82, y: 60 },
    ],
    '4-2-3-1': [
      { label: 'GK', x: 6, y: 50 }, { label: 'LB', x: 20, y: 18 }, { label: 'CB', x: 16, y: 40 },
      { label: 'CB', x: 16, y: 60 }, { label: 'RB', x: 20, y: 82 }, { label: 'CDM', x: 35, y: 40 },
      { label: 'CDM', x: 35, y: 60 }, { label: 'LAM', x: 62, y: 22 }, { label: 'CAM', x: 58, y: 50 },
      { label: 'RAM', x: 62, y: 78 }, { label: 'ST', x: 85, y: 50 },
    ],
    '3-5-2': [
      { label: 'GK', x: 6, y: 50 }, { label: 'CB', x: 16, y: 32 }, { label: 'CB', x: 14, y: 50 },
      { label: 'CB', x: 16, y: 68 }, { label: 'LM', x: 45, y: 12 }, { label: 'CM', x: 42, y: 38 },
      { label: 'CM', x: 38, y: 50 }, { label: 'CM', x: 42, y: 62 }, { label: 'RM', x: 45, y: 88 },
      { label: 'ST', x: 82, y: 42 }, { label: 'ST', x: 82, y: 58 },
    ],
    '4-1-4-1': [
      { label: 'GK', x: 6, y: 50 }, { label: 'LB', x: 20, y: 18 }, { label: 'CB', x: 16, y: 40 },
      { label: 'CB', x: 16, y: 60 }, { label: 'RB', x: 20, y: 82 }, { label: 'CDM', x: 35, y: 50 },
      { label: 'LM', x: 60, y: 18 }, { label: 'CM', x: 55, y: 40 }, { label: 'CM', x: 55, y: 60 },
      { label: 'RM', x: 60, y: 82 }, { label: 'ST', x: 85, y: 50 },
    ],
  };

  /* ============================================================
     STATE
  ============================================================ */
  const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    role: localStorage.getItem(ROLE_KEY) || 'coach',
    coach: null,
    parentPlayers: [],
    attributes: [],
    teams: [],
    players: [],
    currentTeamId: null,
    currentPlayerId: null,
    playerModalMode: 'view',
    pitch: { teamId: null, players: [], lineupType: 'balanced', formations: {} },
    drag: null,
    events: [],
    calendar: { year: 0, month: 0, selectedDate: null, editingEventId: null, formGoals: [], formCleanSheets: [] },
  };

  /* ============================================================
     API HELPER
  ============================================================ */
  async function api(path, opts) {
    opts = opts || {};
    const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
    if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
    const res = await fetch('/api' + path, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) {
      const err = new Error((data && data.error) || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/);
    return ((parts[0] || '')[0] || '?').toUpperCase() + ((parts[1] || '')[0] || '').toUpperCase();
  }

  function renderSidebarAvatar(coach) {
    const el = document.getElementById('sidebarAvatar');
    el.innerHTML = coach.photo
      ? `<img src="${coach.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
      : initials(coach.name);
  }

  function tierClass(ovr) {
    if (ovr >= 85) return 'tier-elite';
    if (ovr >= 75) return 'tier-gold';
    if (ovr >= 65) return 'tier-silver';
    return 'tier-bronze';
  }

  function abbr(name) {
    return String(name || '').trim().slice(0, 3).toUpperCase();
  }

  const ATTRIBUTE_ICON_PATHS = {
    pace: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    shooting: '<circle cx="12" cy="12" r="9"/><line x1="21" y1="12" x2="17" y2="12"/><line x1="7" y1="12" x2="3" y2="12"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="21" x2="12" y2="17"/>',
    passing: '<line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/>',
    dribbling: '<polyline points="22 12 18 12 15 20 9 4 6 12 2 12"/>',
    defending: '<path d="M12 21s7-3.5 7-9V6l-7-3-7 3v6c0 5.5 7 9 7 9z"/>',
    physical: '<rect x="1" y="9" width="3" height="6" rx="1"/><rect x="20" y="9" width="3" height="6" rx="1"/><rect x="4" y="10" width="2.5" height="4"/><rect x="17.5" y="10" width="2.5" height="4"/><line x1="6.5" y1="12" x2="17.5" y2="12"/>',
  };
  const ATTRIBUTE_ICON_FALLBACK = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';

  function attributeIconSvg(name) {
    const key = String(name || '').trim().toLowerCase();
    const inner = ATTRIBUTE_ICON_PATHS[key] || ATTRIBUTE_ICON_FALLBACK;
    return `<svg class="attr-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  }

  function starIconSvg(cls) {
    return `<svg class="${cls || 'stat-icon'}" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }

  function ballIconSvg(cls) {
    return `<svg class="${cls || 'stat-icon'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 6.5l3.5 2.6-1.3 4.1h-4.4l-1.3-4.1z"/><path d="M12 6.5V3.2M15.5 9.1l3-1.9M13.9 13.2l1.9 3.6M8.6 13.2l-1.9 3.6M8.5 9.1l-3-1.9"/></svg>`;
  }

  function assistIconSvg(cls) {
    return `<svg class="${cls || 'stat-icon'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="17" y2="12"/><polyline points="11 6 17 12 11 18"/></svg>`;
  }

  function shieldIconSvg(cls) {
    return `<svg class="${cls || 'stat-icon'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-3.5 7-9V6l-7-3-7 3v6c0 5.5 7 9 7 9z"/><polyline points="9 12 11 14 15 10"/></svg>`;
  }

  /* ============================================================
     AUTH FLOW
  ============================================================ */
  async function boot() {
    if (!state.token) return showAuth();
    if (state.role === 'parent') {
      try {
        await enterParentPortal();
      } catch (e) {
        logoutToAuth();
      }
      return;
    }
    try {
      const { coach } = await api('/coach/me');
      state.coach = coach;
      await enterApp();
    } catch (e) {
      logoutToAuth();
    }
  }

  function showAuth() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('parentShell').classList.add('hidden');
  }

  function logoutToAuth() {
    state.token = null;
    state.coach = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    showAuth();
  }

  async function enterApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('parentShell').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
    document.getElementById('sidebarName').textContent = state.coach.name;
    document.getElementById('sidebarEmail').textContent = state.coach.email;
    renderSidebarAvatar(state.coach);
    applyTheme(state.coach.theme);
    await loadAll();
  }

  async function enterParentPortal() {
    const { players } = await api('/parent/players');
    state.parentPlayers = players;
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('parentShell').classList.remove('hidden');
    const grid = document.getElementById('parentCardGrid');
    const empty = document.getElementById('parentEmptyState');
    grid.innerHTML = '';
    empty.classList.toggle('hidden', players.length > 0);
    players.forEach((p) => {
      const card = buildPlayerCardEl(p);
      grid.appendChild(card);
    });
  }

  document.getElementById('parentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('parentError');
    errEl.textContent = '';
    try {
      const email = document.getElementById('parentEmail').value.trim();
      const password = document.getElementById('parentPassword').value;
      const data = await api('/auth/parent-login', { method: 'POST', body: { email, password } });
      state.token = data.token;
      state.role = 'parent';
      localStorage.setItem(TOKEN_KEY, state.token);
      localStorage.setItem(ROLE_KEY, 'parent');
      await enterParentPortal();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById('parentLogoutBtn').addEventListener('click', () => {
    logoutToAuth();
  });

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';
    try {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      state.token = data.token;
      state.role = 'coach';
      state.coach = data.coach;
      localStorage.setItem(TOKEN_KEY, state.token);
      localStorage.setItem(ROLE_KEY, 'coach');
      await enterApp();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('signupError');
    errEl.textContent = '';
    try {
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const data = await api('/auth/signup', { method: 'POST', body: { name, email, password } });
      state.token = data.token;
      state.role = 'coach';
      state.coach = data.coach;
      localStorage.setItem(TOKEN_KEY, state.token);
      localStorage.setItem(ROLE_KEY, 'coach');
      await enterApp();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach((f) => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.authTab + 'Form').classList.add('active');
    });
  });

  document.getElementById('navLogout').addEventListener('click', () => {
    if (!confirm('Log out of your coach account?')) return;
    closeSidebar();
    logoutToAuth();
  });

  /* ============================================================
     DATA LOADING
  ============================================================ */
  async function loadAll() {
    const [attrsRes, teamsRes, playersRes] = await Promise.all([
      api('/attributes'), api('/teams'), api('/players'),
    ]);
    state.attributes = attrsRes.attributes;
    state.teams = teamsRes.teams;
    state.players = playersRes.players;
    renderFolders();
    renderPlayerCardsForCurrentTeam();
    renderRadarPickers();
    renderPitchTeamSelect();
    renderAttrList();
  }

  /* ============================================================
     SIDE MENU / TOPBAR
  ============================================================ */
  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('menuOverlay').classList.add('show');
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('menuOverlay').classList.remove('show');
  }
  document.getElementById('menuBtn').addEventListener('click', openSidebar);
  document.getElementById('menuOverlay').addEventListener('click', closeSidebar);

  document.getElementById('navProfile').addEventListener('click', () => {
    closeSidebar();
    openProfileModal();
  });
  document.getElementById('sidebarProfileBtn').addEventListener('click', () => {
    closeSidebar();
    openProfileModal();
  });
  document.getElementById('navFaq').addEventListener('click', () => {
    closeSidebar();
    openModal('faq');
  });
  document.getElementById('navCalendar').addEventListener('click', () => {
    closeSidebar();
    openCalendarModal();
  });

  /* ============================================================
     GENERIC MODAL HELPERS
  ============================================================ */
  function openModal(name) { document.getElementById('modal-' + name).classList.add('show'); }
  function closeModal(name) { document.getElementById('modal-' + name).classList.remove('show'); }
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.show').forEach((m) => m.classList.remove('show'));
  });

  /* ============================================================
     BOTTOM TABS / QUICKLINKS
  ============================================================ */
  function goToTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    document.querySelectorAll('.bottom-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabName));
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    if (tabName === 'pitch' && !state.pitch.teamId && state.teams.length > 0) {
      const sel = document.getElementById('pitchTeamSelect');
      sel.value = String(state.teams[0].id);
      loadPitchForTeam(state.teams[0].id);
    }
  }
  document.querySelectorAll('.bottom-tab').forEach((btn) => {
    btn.addEventListener('click', () => goToTab(btn.dataset.tab));
  });

  /* ============================================================
     COACH PROFILE MODAL
  ============================================================ */
  let profilePhotoDataUrl = null;

  function updateProfilePhotoPreview() {
    const preview = document.getElementById('profilePhotoPreview');
    if (profilePhotoDataUrl) {
      preview.innerHTML = `<img src="${profilePhotoDataUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      preview.textContent = initials(document.getElementById('profileName').value || state.coach.name);
    }
  }

  document.getElementById('profilePhotoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { profilePhotoDataUrl = reader.result; updateProfilePhotoPreview(); };
    reader.readAsDataURL(file);
  });
  document.getElementById('clearProfilePhotoBtn').addEventListener('click', () => {
    profilePhotoDataUrl = null;
    document.getElementById('profilePhotoInput').value = '';
    updateProfilePhotoPreview();
  });

  function openProfileModal() {
    document.getElementById('profileName').value = state.coach.name;
    document.getElementById('profileEmail').value = state.coach.email;
    document.getElementById('profileCurrentPassword').value = '';
    document.getElementById('profileNewPassword').value = '';
    document.getElementById('profileMsg').textContent = '';
    document.getElementById('profileMsg').className = 'form-msg';
    profilePhotoDataUrl = state.coach.photo || null;
    updateProfilePhotoPreview();
    renderThemeSwatches();
    renderAttrList();
    openModal('profile');
  }

  function renderThemeSwatches() {
    const wrap = document.getElementById('themeSwatches');
    const current = state.coach.theme || 'field';
    wrap.innerHTML = THEMES.map((t) => `
      <div class="theme-swatch ${t.key === current ? 'selected' : ''}" data-theme-key="${t.key}">
        <div class="theme-swatch-preview" style="background:${t.previewBg}">
          ${t.previewDots.map((c) => `<span class="theme-swatch-dot" style="background:${c}"></span>`).join('')}
        </div>
        <div class="theme-swatch-label">
          <span>${escapeHtml(t.label)}</span>
          ${t.premium ? '<span class="theme-swatch-pro">PRO</span>' : ''}
        </div>
      </div>`).join('');
    wrap.querySelectorAll('.theme-swatch').forEach((el) => {
      el.addEventListener('click', () => selectTheme(el.dataset.themeKey));
    });
  }

  async function selectTheme(themeKey) {
    const theme = THEMES.find((t) => t.key === themeKey);
    const msgEl = document.getElementById('themeMsg');
    msgEl.className = 'form-msg';
    if (theme.premium && !PREMIUM_UNLOCKED) {
      msgEl.textContent = `${theme.label} is a Premium theme. Upgrade to unlock it.`;
      return;
    }
    applyTheme(themeKey);
    try {
      const { coach } = await api('/coach/me', { method: 'PUT', body: { theme: themeKey } });
      state.coach = coach;
      renderThemeSwatches();
      msgEl.textContent = 'Theme saved!';
      msgEl.className = 'form-msg success';
    } catch (err) {
      msgEl.textContent = err.message;
    }
  }

  document.getElementById('profileName').addEventListener('input', () => {
    if (!profilePhotoDataUrl) updateProfilePhotoPreview();
  });

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('profileMsg');
    msgEl.className = 'form-msg';
    msgEl.textContent = '';
    const body = {
      name: document.getElementById('profileName').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      photo: profilePhotoDataUrl,
    };
    const newPassword = document.getElementById('profileNewPassword').value;
    if (newPassword) {
      body.password = newPassword;
      body.currentPassword = document.getElementById('profileCurrentPassword').value;
    }
    try {
      const { coach } = await api('/coach/me', { method: 'PUT', body });
      state.coach = coach;
      document.getElementById('sidebarName').textContent = coach.name;
      document.getElementById('sidebarEmail').textContent = coach.email;
      renderSidebarAvatar(coach);
      document.getElementById('profileCurrentPassword').value = '';
      document.getElementById('profileNewPassword').value = '';
      msgEl.textContent = 'Profile saved!';
      msgEl.className = 'form-msg success';
    } catch (err) {
      msgEl.textContent = err.message;
    }
  });

  function renderAttrList() {
    const list = document.getElementById('attrList');
    list.innerHTML = '';
    state.attributes.forEach((attr) => {
      const row = document.createElement('div');
      row.className = 'attr-row';
      row.innerHTML = `<span class="attr-row-name">${escapeHtml(attr.name)}</span>
        <button class="attr-row-del" title="Delete attribute" ${state.attributes.length <= 1 ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>`;
      row.querySelector('.attr-row-del').addEventListener('click', async () => {
        if (!confirm(`Delete the "${attr.name}" attribute? This removes it from every player.`)) return;
        try {
          await api('/attributes/' + attr.id, { method: 'DELETE' });
          await loadAll();
        } catch (err) {
          document.getElementById('attrMsg').textContent = err.message;
        }
      });
      list.appendChild(row);
    });
  }

  document.getElementById('addAttrForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('newAttrName');
    const msgEl = document.getElementById('attrMsg');
    msgEl.textContent = '';
    if (!input.value.trim()) return;
    try {
      await api('/attributes', { method: 'POST', body: { name: input.value.trim() } });
      input.value = '';
      await loadAll();
    } catch (err) {
      msgEl.textContent = err.message;
    }
  });

  /* ============================================================
     FAQ ACCORDION
  ============================================================ */
  document.querySelectorAll('#modal-faq .faq-item').forEach((item) => {
    item.querySelector('.faq-q').addEventListener('click', () => item.classList.toggle('open'));
  });

  /* ============================================================
     CALENDAR
  ============================================================ */
  function pad2(n) { return String(n).padStart(2, '0'); }
  function dateStrFromDate(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
  function formatLongDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function openCalendarModal() {
    if (!state.calendar.year) {
      const now = new Date();
      state.calendar.year = now.getFullYear();
      state.calendar.month = now.getMonth();
      state.calendar.selectedDate = dateStrFromDate(now);
    }
    showCalendarView();
    loadEventsForMonth();
    openModal('calendar');
  }

  function showCalendarView() {
    document.getElementById('calendarView').classList.remove('hidden');
    document.getElementById('calendarEventForm').classList.add('hidden');
  }
  function showEventFormView() {
    document.getElementById('calendarView').classList.add('hidden');
    document.getElementById('calendarEventForm').classList.remove('hidden');
  }

  async function loadEventsForMonth() {
    const y = state.calendar.year, m = state.calendar.month;
    const start = `${y}-${pad2(m + 1)}-01`;
    const end = `${y}-${pad2(m + 1)}-${pad2(new Date(y, m + 1, 0).getDate())}`;
    try {
      const { events } = await api(`/events?start=${start}&end=${end}`);
      state.events = events;
    } catch (e) {
      state.events = [];
    }
    renderCalendarGrid();
    renderAgenda();
  }

  function renderCalendarGrid() {
    const y = state.calendar.year, m = state.calendar.month;
    document.getElementById('calMonthLabel').textContent = new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const firstWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    const todayStr = dateStrFromDate(new Date());

    const cells = [];
    for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, otherMonth: true });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, otherMonth: false });
    const trailing = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= trailing; d++) cells.push({ day: d, otherMonth: true });

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    cells.forEach((cell) => {
      const cellDateStr = cell.otherMonth ? null : `${y}-${pad2(m + 1)}-${pad2(cell.day)}`;
      const div = document.createElement('div');
      div.className = 'calendar-day' + (cell.otherMonth ? ' other-month' : '');
      if (cellDateStr && cellDateStr === todayStr) div.classList.add('today');
      if (cellDateStr && cellDateStr === state.calendar.selectedDate) div.classList.add('selected');
      const dayNum = document.createElement('div');
      dayNum.textContent = cell.day;
      div.appendChild(dayNum);

      if (!cell.otherMonth) {
        const dayEvents = state.events.filter((e) => e.event_date === cellDateStr);
        const types = [...new Set(dayEvents.map((e) => e.type))];
        if (types.length) {
          const dotsWrap = document.createElement('div');
          dotsWrap.className = 'calendar-day-dots';
          types.forEach((t) => {
            const dot = document.createElement('span');
            dot.className = 'calendar-dot ' + (t === 'game' ? 'dot-game' : 'dot-practice');
            dotsWrap.appendChild(dot);
          });
          div.appendChild(dotsWrap);
        }
        div.addEventListener('click', () => {
          state.calendar.selectedDate = cellDateStr;
          renderCalendarGrid();
          renderAgenda();
        });
      }
      grid.appendChild(div);
    });
  }

  function buildEventRowHtml(ev) {
    const team = state.teams.find((t) => t.id === ev.team_id);
    const metaParts = [];
    if (team) metaParts.push(escapeHtml(team.name));
    if (ev.event_time) metaParts.push(ev.event_time);
    if (ev.location) metaParts.push(escapeHtml(ev.location));
    if (ev.type === 'game' && ev.opponent) metaParts.push(`vs ${escapeHtml(ev.opponent)}`);
    const icon = ev.type === 'game'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><circle cx="12" cy="12" r="3.2"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
    const scoreHtml = ev.type === 'game' && ev.score_for != null && ev.score_against != null
      ? `<div class="calendar-event-score">${ev.score_for}–${ev.score_against}</div>`
      : '';
    let scorersHtml = '';
    let assistsHtml = '';
    if (ev.type === 'game' && ev.goals && ev.goals.length) {
      const goalCounts = new Map();
      ev.goals.forEach((g) => goalCounts.set(g.player_name, (goalCounts.get(g.player_name) || 0) + 1));
      const goalParts = [...goalCounts.entries()].map(([name, n]) => escapeHtml(name) + (n > 1 ? ` (${n})` : ''));
      scorersHtml = `<div class="calendar-event-scorers"><strong>Goals:</strong> ${goalParts.join(', ')}</div>`;

      const assistCounts = new Map();
      ev.goals.forEach((g) => { if (g.assist_player_name) assistCounts.set(g.assist_player_name, (assistCounts.get(g.assist_player_name) || 0) + 1); });
      if (assistCounts.size) {
        const assistParts = [...assistCounts.entries()].map(([name, n]) => escapeHtml(name) + (n > 1 ? ` (${n})` : ''));
        assistsHtml = `<div class="calendar-event-scorers"><strong>Assists:</strong> ${assistParts.join(', ')}</div>`;
      }
    }
    const potmHtml = ev.type === 'game' && ev.player_of_match
      ? `<div class="calendar-event-potm">${starIconSvg()} Player of the Match: ${escapeHtml(ev.player_of_match.name)}</div>`
      : '';
    const cleanSheetHtml = ev.type === 'game' && ev.clean_sheets && ev.clean_sheets.length
      ? `<div class="calendar-event-cleansheet">${shieldIconSvg()} Clean Sheet: ${ev.clean_sheets.map((c) => escapeHtml(c.player_name)).join(', ')}</div>`
      : '';
    return `
      <div class="calendar-event-row type-${ev.type}">
        <div class="calendar-event-icon">${icon}</div>
        <div class="calendar-event-body">
          <div class="calendar-event-title">${escapeHtml(ev.title)}</div>
          <div class="calendar-event-meta">${metaParts.join(' · ')}</div>
          ${scorersHtml}
          ${assistsHtml}
          ${potmHtml}
          ${cleanSheetHtml}
        </div>
        ${scoreHtml}
        <div class="calendar-event-actions">
          <button class="btn-icon cal-edit-btn" data-id="${ev.id}" title="Edit event">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button class="btn-icon cal-delete-btn" data-id="${ev.id}" title="Delete event">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>`;
  }

  function renderAgenda() {
    const dateStr = state.calendar.selectedDate;
    const header = document.getElementById('calAgendaDate');
    const list = document.getElementById('calAgendaList');
    const empty = document.getElementById('calAgendaEmpty');
    if (!dateStr) {
      header.textContent = 'Select a day';
      list.innerHTML = '';
      empty.classList.add('hidden');
      return;
    }
    header.textContent = formatLongDate(dateStr);
    const dayEvents = state.events
      .filter((e) => e.event_date === dateStr)
      .slice()
      .sort((a, b) => (a.event_time || '99:99').localeCompare(b.event_time || '99:99'));
    empty.classList.toggle('hidden', dayEvents.length > 0);
    list.innerHTML = dayEvents.map(buildEventRowHtml).join('');
    list.querySelectorAll('.cal-edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => openEventForm(state.events.find((e) => e.id === Number(btn.dataset.id))));
    });
    list.querySelectorAll('.cal-delete-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this event?')) return;
        await api('/events/' + btn.dataset.id, { method: 'DELETE' });
        await loadEventsForMonth();
      });
    });
  }

  document.getElementById('calPrevMonthBtn').addEventListener('click', () => {
    state.calendar.month -= 1;
    if (state.calendar.month < 0) { state.calendar.month = 11; state.calendar.year -= 1; }
    state.calendar.selectedDate = null;
    loadEventsForMonth();
  });
  document.getElementById('calNextMonthBtn').addEventListener('click', () => {
    state.calendar.month += 1;
    if (state.calendar.month > 11) { state.calendar.month = 0; state.calendar.year += 1; }
    state.calendar.selectedDate = null;
    loadEventsForMonth();
  });
  document.getElementById('calTodayBtn').addEventListener('click', () => {
    const now = new Date();
    state.calendar.year = now.getFullYear();
    state.calendar.month = now.getMonth();
    state.calendar.selectedDate = dateStrFromDate(now);
    loadEventsForMonth();
  });

  function populateGoalScorerSelects(selectedTeamId, potmPlayerId) {
    const teamId = selectedTeamId ? Number(selectedTeamId) : null;
    const rosterPlayers = teamId ? state.players.filter((p) => p.team_id === teamId) : [];
    const scorerSelect = document.getElementById('goalScorerSelect');
    const assistSelect = document.getElementById('goalAssistSelect');
    const potmSelect = document.getElementById('potmSelect');
    const playerOptions = rosterPlayers.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    scorerSelect.innerHTML = '<option value="">Scorer…</option>' + playerOptions;
    assistSelect.innerHTML = '<option value="">No assist</option>' + playerOptions;
    potmSelect.innerHTML = '<option value="">None selected</option>' + playerOptions;
    potmSelect.value = potmPlayerId ? String(potmPlayerId) : '';
    scorerSelect.disabled = assistSelect.disabled = potmSelect.disabled = !teamId;
    document.getElementById('addGoalBtn').disabled = !teamId;

    const checksWrap = document.getElementById('cleanSheetChecks');
    checksWrap.innerHTML = rosterPlayers.map((p) => `
      <label class="clean-sheet-check">
        <input type="checkbox" value="${p.id}" ${state.calendar.formCleanSheets.includes(p.id) ? 'checked' : ''}>
        <span>${escapeHtml(p.name)}</span>
      </label>`).join('') || '<p class="section-hint">No players on this team yet.</p>';
    checksWrap.querySelectorAll('input[type=checkbox]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const playerId = Number(cb.value);
        state.calendar.formCleanSheets = cb.checked
          ? [...state.calendar.formCleanSheets, playerId]
          : state.calendar.formCleanSheets.filter((id) => id !== playerId);
      });
    });
  }

  function updateCleanSheetVisibility() {
    const type = document.querySelector('.event-type-tab.active').dataset.type;
    const scoreAgainst = document.getElementById('eventScoreAgainst').value;
    document.getElementById('cleanSheetGrp').classList.toggle('hidden', type !== 'game' || scoreAgainst !== '0');
  }

  function renderGoalScorerList() {
    const list = document.getElementById('goalScorerList');
    const teamId = document.getElementById('eventTeam').value ? Number(document.getElementById('eventTeam').value) : null;
    list.innerHTML = state.calendar.formGoals.map((goal, idx) => {
      const player = state.players.find((p) => p.id === goal.playerId);
      const name = player ? escapeHtml(player.name) : 'Unknown player';
      const assistPlayer = goal.assistId ? state.players.find((p) => p.id === goal.assistId) : null;
      const assistHtml = assistPlayer ? `<span class="goal-item-assist">${assistIconSvg('goal-item-assist-icon')}${escapeHtml(assistPlayer.name)}</span>` : '';
      return `<li class="goal-scorer-item">${ballIconSvg('goal-item-icon')}<span class="goal-item-name">${name}</span>${assistHtml}
        <button type="button" class="btn-icon-sm remove-goal-btn" data-idx="${idx}" title="Remove goal">&times;</button></li>`;
    }).join('');
    list.querySelectorAll('.remove-goal-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.calendar.formGoals.splice(Number(btn.dataset.idx), 1);
        renderGoalScorerList();
      });
    });
    if (!teamId) list.innerHTML = '';
  }

  document.getElementById('addGoalBtn').addEventListener('click', () => {
    const scorerSelect = document.getElementById('goalScorerSelect');
    const assistSelect = document.getElementById('goalAssistSelect');
    if (!scorerSelect.value) return;
    state.calendar.formGoals.push({
      playerId: Number(scorerSelect.value),
      assistId: assistSelect.value && assistSelect.value !== scorerSelect.value ? Number(assistSelect.value) : null,
    });
    renderGoalScorerList();
    scorerSelect.value = '';
    assistSelect.value = '';
  });

  document.getElementById('eventTeam').addEventListener('change', (e) => {
    state.calendar.formGoals = [];
    state.calendar.formCleanSheets = [];
    populateGoalScorerSelects(e.target.value, null);
    renderGoalScorerList();
  });

  document.getElementById('eventScoreAgainst').addEventListener('input', updateCleanSheetVisibility);

  function openEventForm(event) {
    state.calendar.editingEventId = event ? event.id : null;
    document.getElementById('eventMsg').textContent = '';

    const teamSelect = document.getElementById('eventTeam');
    teamSelect.innerHTML = '<option value="">No specific team</option>' +
      state.teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');

    const type = event ? event.type : 'practice';
    document.querySelectorAll('.event-type-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.type === type));
    document.getElementById('gameFields').classList.toggle('hidden', type !== 'game');

    document.getElementById('eventTitle').value = event ? event.title : '';
    teamSelect.value = event && event.team_id ? event.team_id : '';
    document.getElementById('eventDate').value = event ? event.event_date : (state.calendar.selectedDate || dateStrFromDate(new Date()));
    document.getElementById('eventTime').value = event && event.event_time ? event.event_time : '';
    document.getElementById('eventLocation').value = event && event.location ? event.location : '';
    document.getElementById('eventOpponent').value = event && event.opponent ? event.opponent : '';
    document.getElementById('eventScoreFor').value = event && event.score_for != null ? event.score_for : '';
    document.getElementById('eventScoreAgainst').value = event && event.score_against != null ? event.score_against : '';
    document.getElementById('eventNotes').value = event && event.notes ? event.notes : '';

    state.calendar.formGoals = event && event.goals
      ? event.goals.map((g) => ({ playerId: g.player_id, assistId: g.assist_player_id || null }))
      : [];
    state.calendar.formCleanSheets = event && event.clean_sheets ? event.clean_sheets.map((c) => c.player_id) : [];
    populateGoalScorerSelects(teamSelect.value, event && event.player_of_match ? event.player_of_match.id : null);
    renderGoalScorerList();
    updateCleanSheetVisibility();

    showEventFormView();
  }

  document.getElementById('addEventBtn').addEventListener('click', () => openEventForm(null));
  document.getElementById('cancelEventBtn').addEventListener('click', () => showCalendarView());

  document.querySelectorAll('.event-type-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.event-type-tab').forEach((t) => t.classList.toggle('active', t === tab));
      document.getElementById('gameFields').classList.toggle('hidden', tab.dataset.type !== 'game');
      updateCleanSheetVisibility();
    });
  });

  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('eventMsg');
    msgEl.textContent = '';
    const type = document.querySelector('.event-type-tab.active').dataset.type;
    const teamValue = document.getElementById('eventTeam').value;
    const body = {
      type,
      title: document.getElementById('eventTitle').value.trim(),
      team_id: teamValue ? Number(teamValue) : null,
      event_date: document.getElementById('eventDate').value,
      event_time: document.getElementById('eventTime').value,
      location: document.getElementById('eventLocation').value.trim(),
      notes: document.getElementById('eventNotes').value.trim(),
    };
    if (type === 'game') {
      body.opponent = document.getElementById('eventOpponent').value.trim();
      body.score_for = document.getElementById('eventScoreFor').value;
      body.score_against = document.getElementById('eventScoreAgainst').value;
      body.goals = state.calendar.formGoals.map((g) => ({ player_id: g.playerId, assist_player_id: g.assistId }));
      const potmValue = document.getElementById('potmSelect').value;
      body.player_of_match_id = potmValue ? Number(potmValue) : null;
      body.clean_sheet_player_ids = body.score_against === '0' ? state.calendar.formCleanSheets : [];
    } else {
      body.opponent = '';
      body.score_for = '';
      body.score_against = '';
      body.goals = [];
      body.player_of_match_id = null;
      body.clean_sheet_player_ids = [];
    }
    if (!body.title) { msgEl.textContent = 'Title is required'; return; }
    if (!body.event_date) { msgEl.textContent = 'Date is required'; return; }
    try {
      if (state.calendar.editingEventId) {
        await api('/events/' + state.calendar.editingEventId, { method: 'PUT', body });
      } else {
        await api('/events', { method: 'POST', body });
      }
      state.calendar.selectedDate = body.event_date;
      const [evYear, evMonth] = body.event_date.split('-').map(Number);
      state.calendar.year = evYear;
      state.calendar.month = evMonth - 1;
      showCalendarView();
      await loadEventsForMonth();
    } catch (err) {
      msgEl.textContent = err.message;
    }
  });

  /* ============================================================
     ROSTER: TEAMS (FOLDERS)
  ============================================================ */
  function renderFolders() {
    const grid = document.getElementById('folderGrid');
    const empty = document.getElementById('rosterEmptyState');
    grid.innerHTML = '';
    empty.classList.toggle('hidden', state.teams.length > 0);
    state.teams.forEach((team) => {
      const count = state.players.filter((p) => p.team_id === team.id).length;
      const teamPlayers = state.players.filter((p) => p.team_id === team.id);
      const avgOvr = teamPlayers.length
        ? Math.round(teamPlayers.reduce((s, p) => s + (p.overall || 0), 0) / teamPlayers.length)
        : null;
      const initial = team.name.charAt(0).toUpperCase();
      const color = team.color || '#00E564';
      const card = document.createElement('div');
      card.className = 'team-banner-card';
      card.style.setProperty('--team-color', color);
      card.innerHTML = `
        <div class="tbc-accent"></div>
        <div class="tbc-logo">${initial}</div>
        <div class="tbc-info">
          <div class="tbc-name">${escapeHtml(team.name)}</div>
          <div class="tbc-meta">${count} player${count === 1 ? '' : 's'}${avgOvr !== null ? ` &nbsp;·&nbsp; Avg <span class="tbc-ovr">${avgOvr}</span>` : ''}</div>
        </div>
        <div class="tbc-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></div>`;
      card.addEventListener('click', () => openTeamView(team.id));
      grid.appendChild(card);
    });
  }

  function openTeamView(teamId) {
    state.currentTeamId = teamId;
    document.getElementById('rosterFoldersView').classList.add('hidden');
    document.getElementById('rosterTeamView').classList.remove('hidden');
    const team = state.teams.find((t) => t.id === teamId);
    document.getElementById('rosterTeamName').textContent = team ? team.name : 'Team';
    document.getElementById('rosterSearchInput').value = '';
    document.querySelectorAll('#rosterPositionFilter .pos-pill').forEach((p) => p.classList.remove('active'));
    document.querySelector('#rosterPositionFilter .pos-pill[data-pos=""]').classList.add('active');
    renderPlayerCardsForCurrentTeam();
    loadTeamLeaderboard(teamId);
  }

  async function loadTeamLeaderboard(teamId) {
    const box = document.getElementById('teamLeaderboardBox');
    const list = document.getElementById('teamLeaderboardList');
    const csBox = document.getElementById('teamCleanSheetBox');
    const csList = document.getElementById('teamCleanSheetList');
    const recordBox = document.getElementById('teamRecordBox');
    try {
      const { leaderboard, record } = await api(`/teams/${teamId}/leaderboard`);

      const scorers = leaderboard.filter((row) => row.goals > 0 || row.assists > 0 || row.playerOfMatch > 0);
      box.classList.toggle('hidden', scorers.length === 0);
      list.innerHTML = scorers.map((row, idx) => `
        <div class="leaderboard-row">
          <span class="leaderboard-rank">${idx + 1}</span>
          <span class="leaderboard-name">${escapeHtml(row.name)}</span>
          <span class="leaderboard-stat">${ballIconSvg('leaderboard-icon')}${row.goals}</span>
          <span class="leaderboard-stat">${assistIconSvg('leaderboard-icon')}${row.assists}</span>
          <span class="leaderboard-stat">${starIconSvg('leaderboard-icon')}${row.playerOfMatch}</span>
        </div>`).join('');

      const keepers = leaderboard.filter((row) => row.cleanSheets > 0).sort((a, b) => b.cleanSheets - a.cleanSheets || a.name.localeCompare(b.name));
      csBox.classList.toggle('hidden', keepers.length === 0);
      csList.innerHTML = keepers.map((row, idx) => `
        <div class="leaderboard-row">
          <span class="leaderboard-rank">${idx + 1}</span>
          <span class="leaderboard-name">${escapeHtml(row.name)}</span>
          <span class="leaderboard-stat">${shieldIconSvg('leaderboard-icon')}${row.cleanSheets}</span>
        </div>`).join('');

      recordBox.classList.toggle('hidden', record.gamesPlayed === 0);
      document.getElementById('teamRecordWL').innerHTML = `
        <div class="record-chip record-win"><span class="record-chip-value">${record.wins}</span><span class="record-chip-label">Wins</span></div>
        <div class="record-chip record-loss"><span class="record-chip-value">${record.losses}</span><span class="record-chip-label">Losses</span></div>
        <div class="record-chip record-tie"><span class="record-chip-value">${record.ties}</span><span class="record-chip-label">Ties</span></div>`;
      document.getElementById('teamRecordGoals').innerHTML = `
        <span>${ballIconSvg('record-goals-icon')} Goals For <strong>${record.goalsFor}</strong></span>
        <span>${ballIconSvg('record-goals-icon')} Goals Against <strong>${record.goalsAgainst}</strong></span>`;
    } catch (e) {
      box.classList.add('hidden');
      csBox.classList.add('hidden');
      recordBox.classList.add('hidden');
    }
  }

  const posPillsWrap = document.getElementById('rosterPositionFilter');
  POSITIONS.forEach((pos) => {
    const btn = document.createElement('button');
    btn.className = 'pos-pill';
    btn.dataset.pos = pos;
    btn.textContent = pos;
    btn.addEventListener('click', () => {
      posPillsWrap.querySelectorAll('.pos-pill').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      renderPlayerCardsForCurrentTeam();
    });
    posPillsWrap.appendChild(btn);
  });
  posPillsWrap.querySelector('.pos-pill[data-pos=""]').addEventListener('click', () => {
    posPillsWrap.querySelectorAll('.pos-pill').forEach((p) => p.classList.remove('active'));
    posPillsWrap.querySelector('.pos-pill[data-pos=""]').classList.add('active');
    renderPlayerCardsForCurrentTeam();
  });
  document.getElementById('rosterSearchInput').addEventListener('input', renderPlayerCardsForCurrentTeam);
  document.getElementById('rosterSortSelect').addEventListener('change', renderPlayerCardsForCurrentTeam);

  document.getElementById('backToFoldersBtn').addEventListener('click', () => {
    state.currentTeamId = null;
    document.getElementById('rosterTeamView').classList.add('hidden');
    document.getElementById('rosterFoldersView').classList.remove('hidden');
  });

  document.getElementById('addTeamBtn').addEventListener('click', () => openTeamModal(null));
  document.getElementById('editTeamBtn').addEventListener('click', () => openTeamModal(state.currentTeamId));
  document.getElementById('deleteTeamBtn').addEventListener('click', async () => {
    const team = state.teams.find((t) => t.id === state.currentTeamId);
    if (!team) return;
    if (!confirm(`Delete "${team.name}" and all its players? This can't be undone.`)) return;
    await api('/teams/' + team.id, { method: 'DELETE' });
    document.getElementById('backToFoldersBtn').click();
    await loadAll();
  });

  let teamModalEditingId = null;
  function openTeamModal(teamId) {
    teamModalEditingId = teamId;
    const team = teamId ? state.teams.find((t) => t.id === teamId) : null;
    document.getElementById('teamModalTitle').textContent = team ? 'Edit Team' : 'New Team';
    document.getElementById('teamNameInput').value = team ? team.name : '';
    document.getElementById('teamMsg').textContent = '';
    const swatchWrap = document.getElementById('teamColorSwatches');
    swatchWrap.innerHTML = '';
    const selectedColor = team ? team.color : TEAM_COLORS[0];
    TEAM_COLORS.forEach((color) => {
      const sw = document.createElement('div');
      sw.className = 'color-swatch' + (color === selectedColor ? ' selected' : '');
      sw.style.background = color;
      sw.dataset.color = color;
      sw.addEventListener('click', () => {
        swatchWrap.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('selected'));
        sw.classList.add('selected');
      });
      swatchWrap.appendChild(sw);
    });

    const formationSelect = document.getElementById('teamFormationSelect');
    formationSelect.innerHTML = Object.keys(FORMATIONS).map((name) => `<option value="${name}">${name}</option>`).join('');
    formationSelect.value = team ? team.formation : '4-3-3';

    document.getElementById('teamParentPassword').value = '';
    document.getElementById('parentPasswordStatus').textContent = team
      ? (team.has_parent_password ? '(password is set)' : '(not set yet)')
      : '';
    document.getElementById('clearParentPasswordBtn').classList.toggle('hidden', !(team && team.has_parent_password));
    document.getElementById('teamForm').dataset.clearParentPassword = '';

    openModal('team');
  }

  document.getElementById('clearParentPasswordBtn').addEventListener('click', () => {
    document.getElementById('teamForm').dataset.clearParentPassword = '1';
    document.getElementById('teamParentPassword').value = '';
    document.getElementById('parentPasswordStatus').textContent = '(will be removed on save)';
    document.getElementById('clearParentPasswordBtn').classList.add('hidden');
  });

  document.getElementById('teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('teamMsg');
    const name = document.getElementById('teamNameInput').value.trim();
    const selectedSwatch = document.querySelector('#teamColorSwatches .color-swatch.selected');
    const color = selectedSwatch ? selectedSwatch.dataset.color : TEAM_COLORS[0];
    const formation = document.getElementById('teamFormationSelect').value;
    const parentPassword = document.getElementById('teamParentPassword').value.trim();
    const clearParentPassword = document.getElementById('teamForm').dataset.clearParentPassword === '1';
    if (!name) { msgEl.textContent = 'Team name is required'; return; }
    try {
      const body = { name, color, formation };
      if (parentPassword) body.parent_password = parentPassword;
      if (clearParentPassword) body.clear_parent_password = true;
      if (teamModalEditingId) {
        await api('/teams/' + teamModalEditingId, { method: 'PUT', body });
      } else {
        await api('/teams', { method: 'POST', body });
      }
      closeModal('team');
      await loadAll();
      if (state.currentTeamId) {
        const team = state.teams.find((t) => t.id === state.currentTeamId);
        if (team) document.getElementById('rosterTeamName').textContent = team.name;
      }
    } catch (err) {
      msgEl.textContent = err.message;
    }
  });

  /* ============================================================
     ROSTER: PLAYER CARDS (FIFA STYLE)
  ============================================================ */
  function buildPlayerCardEl(player) {
    const card = document.createElement('div');
    card.className = 'player-card ' + tierClass(player.overall);
    const shown = player.attributes.slice(0, 6);
    const photoHtml = player.photo
      ? `<img class="pc-photo-img" src="${player.photo}" alt="">`
      : `<div class="pc-photo-fallback">${initials(player.name)}</div>`;
    card.innerHTML = `
      <div class="pc-top">
        <div class="pc-ovr-pos">
          <div class="pc-ovr">${player.overall}</div>
          <div class="pc-pos">${escapeHtml(player.position)}</div>
        </div>
        <div class="pc-flag" title="${escapeHtml(player.nationality || '')}">${flagEmoji(player.nationality)}</div>
        <div class="pc-number">${player.number != null ? player.number : '–'}</div>
      </div>
      <div class="pc-photo-wrap">${photoHtml}</div>
      <div class="pc-name">${escapeHtml(player.name)}</div>
      <div class="pc-divider"></div>
      <div class="pc-stats">
        ${shown.map((a) => `<div class="pc-stat"><span class="pc-stat-label">${abbr(a.name)}</span><span class="pc-stat-value">${attributeIconSvg(a.name)}${a.value}</span></div>`).join('')}
      </div>`;
    card.addEventListener('click', () => openPlayerModal(player.id));
    return card;
  }

  const SORTERS = {
    name_asc: (a, b) => a.name.localeCompare(b.name),
    name_desc: (a, b) => b.name.localeCompare(a.name),
    overall_desc: (a, b) => b.overall - a.overall,
    overall_asc: (a, b) => a.overall - b.overall,
    number_asc: (a, b) => (a.number ?? 999) - (b.number ?? 999),
    position_asc: (a, b) => a.position.localeCompare(b.position) || a.name.localeCompare(b.name),
  };

  function renderPlayerCardsForCurrentTeam() {
    if (!state.currentTeamId) return;
    const grid = document.getElementById('playerCardGrid');
    const empty = document.getElementById('teamEmptyState');
    const noMatch = document.getElementById('teamNoMatchState');

    const allTeamPlayers = state.players.filter((p) => p.team_id === state.currentTeamId);
    const search = document.getElementById('rosterSearchInput').value.trim().toLowerCase();
    const positionFilter = document.querySelector('#rosterPositionFilter .pos-pill.active')?.dataset.pos || '';
    const sortKey = document.getElementById('rosterSortSelect').value;

    let players = allTeamPlayers;
    if (search) players = players.filter((p) => p.name.toLowerCase().includes(search));
    if (positionFilter) players = players.filter((p) => p.position === positionFilter);
    players = players.slice().sort(SORTERS[sortKey] || SORTERS.name_asc);

    grid.innerHTML = '';
    empty.classList.toggle('hidden', allTeamPlayers.length > 0);
    noMatch.classList.toggle('hidden', allTeamPlayers.length === 0 || players.length > 0);
    players.forEach((p) => grid.appendChild(buildPlayerCardEl(p)));
  }

  document.getElementById('addPlayerBtn').addEventListener('click', () => openPlayerModal(null, state.currentTeamId));

  /* ============================================================
     PLAYER DETAIL / EDIT MODAL
  ============================================================ */
  function openPlayerModal(playerId, teamIdForCreate) {
    state.currentPlayerId = playerId;
    const isParent = state.role === 'parent';
    const isCreate = !playerId && !isParent;
    document.getElementById('playerModalTitle').textContent = isCreate ? 'New Player' : 'Player';
    document.getElementById('playerDeleteBtn').classList.toggle('hidden', isCreate || isParent);
    document.getElementById('playerEditToggleBtn').classList.toggle('hidden', isCreate || isParent);

    if (isCreate) {
      enterPlayerEditMode(null, teamIdForCreate);
    } else {
      const player = isParent
        ? state.parentPlayers.find((p) => p.id === playerId)
        : state.players.find((p) => p.id === playerId);
      renderPlayerViewMode(player);
      document.getElementById('playerViewMode').classList.remove('hidden');
      document.getElementById('playerEditMode').classList.add('hidden');
    }
    openModal('player');
  }

  function renderPlayerViewMode(player) {
    const cardWrap = document.getElementById('playerDetailCardWrap');
    cardWrap.innerHTML = '';
    cardWrap.appendChild(buildPlayerCardEl(player));
    cardWrap.querySelector('.player-card').style.cursor = 'default';

    const radarWrap = document.getElementById('playerRadarSvg');
    radarWrap.innerHTML = buildRadarSVG([
      { color: '#4AFF3F', values: player.attributes.map((a) => ({ name: a.name, value: a.value })) },
    ], 260);

    const infoBox = document.getElementById('playerInfoBox');
    const natRow = `
      <div class="player-info-item">
        <div class="player-info-label">Nationality</div>
        <div class="player-info-value">${flagEmoji(player.nationality)} ${escapeHtml(player.nationality) || '<span class="muted">Not set</span>'}</div>
      </div>`;
    if (state.role === 'parent') {
      infoBox.innerHTML = natRow;
    } else {
      const emailVal = player.parent_email
        ? `<a href="mailto:${escapeHtml(player.parent_email)}">${escapeHtml(player.parent_email)}</a>`
        : '<span class="muted">Not provided</span>';
      const phoneVal = player.parent_phone
        ? `<a href="tel:${escapeHtml(player.parent_phone)}">${escapeHtml(player.parent_phone)}</a>`
        : '<span class="muted">Not provided</span>';
      infoBox.innerHTML = natRow + `
        <div class="player-info-item">
          <div class="player-info-label">Parent Email</div>
          <div class="player-info-value">${emailVal}</div>
        </div>
        <div class="player-info-item">
          <div class="player-info-label">Parent Phone</div>
          <div class="player-info-value">${phoneVal}</div>
        </div>`;
    }

    const bigAttrs = document.getElementById('bigAttrs');
    bigAttrs.innerHTML = player.attributes.map((a) => `
      <div class="big-attr-row">
        <div class="big-attr-top"><span>${escapeHtml(a.name)}</span><span class="big-attr-value">${attributeIconSvg(a.name)}${a.value}</span></div>
        <div class="big-attr-bar-track"><div class="big-attr-bar-fill" style="width:${a.value}%"></div></div>
      </div>`).join('');

    renderPlayerPlaystyles(player);

    const metricSelect = document.getElementById('progressMetricSelect');
    metricSelect.innerHTML = '<option value="overall">Overall</option>' +
      player.attributes.map((a) => `<option value="${a.attribute_id}">${escapeHtml(a.name)}</option>`).join('');
    metricSelect.value = 'overall';
    loadProgressForPlayer(player.id);
    loadStatsForPlayer(player.id);
  }

  function renderPlayerPlaystyles(player) {
    const wrap = document.getElementById('playerPlaystyles');
    const keys = player.playstyles || [];
    if (!keys.length) { wrap.innerHTML = ''; return; }

    const byCategory = {};
    keys.forEach((key) => {
      const ps = PLAYSTYLE_BY_KEY[key];
      if (!ps) return;
      if (!byCategory[ps.cat]) byCategory[ps.cat] = { cat: PLAYSTYLE_CATS.find((c) => c.key === ps.cat), skills: [] };
      byCategory[ps.cat].skills.push(ps);
    });

    const catOrder = PLAYSTYLE_CATS.map((c) => c.key);
    const html = '<div class="ps-section-title">Play Styles</div>' +
      catOrder
        .filter((k) => byCategory[k] && byCategory[k].skills.length)
        .map((k) => {
          const { cat, skills } = byCategory[k];
          return `<div class="ps-cat-group">
            <div class="ps-cat-label">
              <span class="ps-cat-dot" style="background:${cat.color}"></span>
              ${escapeHtml(cat.label)}
            </div>
            <div class="ps-badges-row">
              ${skills.map((s) => `
                <div class="ps-badge" style="--ps-color:${cat.color}" title="${escapeHtml(s.name)}">
                  <svg viewBox="0 0 24 24">${s.icon}</svg>
                </div>`).join('')}
            </div>
          </div>`;
        }).join('');
    wrap.innerHTML = html;
  }

  async function loadStatsForPlayer(playerId) {
    const box = document.getElementById('playerStatsBox');
    box.innerHTML = '';
    try {
      const path = state.role === 'parent' ? `/parent/players/${playerId}/stats` : `/players/${playerId}/stats`;
      const { stats } = await api(path);
      box.innerHTML = `
        <div class="player-stat-chip">
          ${ballIconSvg('player-stat-icon')}
          <div><div class="player-stat-value">${stats.goals}</div><div class="player-stat-label">Goals</div></div>
        </div>
        <div class="player-stat-chip">
          ${assistIconSvg('player-stat-icon')}
          <div><div class="player-stat-value">${stats.assists}</div><div class="player-stat-label">Assists</div></div>
        </div>
        <div class="player-stat-chip">
          ${starIconSvg('player-stat-icon')}
          <div><div class="player-stat-value">${stats.playerOfMatch}</div><div class="player-stat-label">Player of the Match</div></div>
        </div>
        <div class="player-stat-chip">
          ${shieldIconSvg('player-stat-icon')}
          <div><div class="player-stat-value">${stats.cleanSheets}</div><div class="player-stat-label">Clean Sheets</div></div>
        </div>`;
    } catch (e) { /* leave empty on failure */ }
  }

  let currentProgressSnapshots = [];

  async function loadProgressForPlayer(playerId) {
    currentProgressSnapshots = [];
    try {
      const path = state.role === 'parent' ? `/parent/players/${playerId}/progress` : `/players/${playerId}/progress`;
      const { progress } = await api(path);
      currentProgressSnapshots = progress;
    } catch (e) { /* leave empty on failure */ }
    renderProgressChart();
  }

  function renderProgressChart() {
    const metric = document.getElementById('progressMetricSelect').value;
    const wrap = document.getElementById('progressChartWrap');
    const values = currentProgressSnapshots.map((s) =>
      metric === 'overall' ? s.overall : (s.attributes.find((a) => String(a.attribute_id) === metric) || { value: 0 }).value
    );
    const dates = currentProgressSnapshots.map((s) => formatShortDate(s.recorded_at));
    wrap.innerHTML = buildLineChartSVG(values, dates, '#4AFF3F');
  }

  document.getElementById('progressMetricSelect').addEventListener('change', renderProgressChart);

  document.getElementById('playerEditToggleBtn').addEventListener('click', () => {
    const player = state.players.find((p) => p.id === state.currentPlayerId);
    enterPlayerEditMode(player, player ? player.team_id : null);
  });

  let editPhotoDataUrl = null;
  let selectedPlaystyles = [];

  function renderPlaystylePicker(currentKeys) {
    selectedPlaystyles = currentKeys ? [...currentKeys] : [];
    const wrap = document.getElementById('editPlaystyles');
    wrap.innerHTML = PLAYSTYLE_CATS.map((cat) => `
      <div class="ps-picker-cat">
        <div class="ps-picker-cat-label">
          <span class="ps-cat-dot" style="background:${cat.color}"></span>
          ${escapeHtml(cat.label)}
        </div>
        <div class="ps-picker-skills">
          ${cat.skills.map((s) => `
            <button type="button" class="ps-pick-btn${selectedPlaystyles.includes(s.key) ? ' ps-selected' : ''}"
              data-ps-key="${s.key}" style="--ps-color:${cat.color}">
              <svg viewBox="0 0 24 24">${s.icon}</svg>
              <span class="ps-pick-tooltip">${escapeHtml(s.name)}</span>
            </button>`).join('')}
        </div>
      </div>`).join('');

    wrap.querySelectorAll('.ps-pick-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.psKey;
        if (selectedPlaystyles.includes(key)) {
          selectedPlaystyles = selectedPlaystyles.filter((k) => k !== key);
          btn.classList.remove('ps-selected');
        } else if (selectedPlaystyles.length < 5) {
          selectedPlaystyles.push(key);
          btn.classList.add('ps-selected');
        }
      });
    });
  }

  function enterPlayerEditMode(player, teamIdForCreate) {
    document.getElementById('playerViewMode').classList.add('hidden');
    document.getElementById('playerEditMode').classList.remove('hidden');
    document.getElementById('playerEditMsg').textContent = '';

    const posSelect = document.getElementById('editPlayerPosition');
    posSelect.innerHTML = POSITIONS.map((p) => `<option value="${p}">${p}</option>`).join('');

    const natSelect = document.getElementById('editPlayerNationality');
    natSelect.innerHTML = '<option value="">Select…</option>' + COUNTRIES.map(([name]) =>
      `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');

    editPhotoDataUrl = player ? player.photo : null;
    const preview = document.getElementById('editPhotoPreview');
    updatePhotoPreview();

    document.getElementById('editPlayerName').value = player ? player.name : '';
    document.getElementById('editPlayerNumber').value = player && player.number != null ? player.number : '';
    posSelect.value = player ? player.position : 'ST';
    natSelect.value = player && player.nationality ? player.nationality : '';
    document.getElementById('editParentEmail').value = player && player.parent_email ? player.parent_email : '';
    document.getElementById('editParentPhone').value = player && player.parent_phone ? player.parent_phone : '';

    const moveRow = document.getElementById('moveTeamRow');
    const teamSelect = document.getElementById('editPlayerTeam');
    moveRow.classList.toggle('hidden', !player);
    if (player) {
      teamSelect.innerHTML = state.teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
      teamSelect.value = player.team_id;
    }

    const sliders = document.getElementById('attrSliders');
    const attrValues = player ? player.attributes : state.attributes.map((a) => ({ attribute_id: a.id, name: a.name, value: 50 }));
    sliders.innerHTML = attrValues.map((a) => `
      <div class="attr-slider-row" data-attr-id="${a.attribute_id}">
        <div class="attr-slider-label">${escapeHtml(a.name)}</div>
        <input type="range" min="0" max="99" value="${a.value}">
        <div class="attr-slider-value">${a.value}</div>
      </div>`).join('');
    sliders.querySelectorAll('.attr-slider-row').forEach((row) => {
      const input = row.querySelector('input');
      const valEl = row.querySelector('.attr-slider-value');
      input.addEventListener('input', () => { valEl.textContent = input.value; });
    });

    renderPlaystylePicker(player ? (player.playstyles || []) : []);

    document.getElementById('playerEditForm').dataset.mode = player ? 'edit' : 'create';
    document.getElementById('playerEditForm').dataset.teamId = teamIdForCreate || '';
  }

  function updatePhotoPreview() {
    const preview = document.getElementById('editPhotoPreview');
    if (editPhotoDataUrl) {
      preview.innerHTML = `<img src="${editPhotoDataUrl}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      const name = document.getElementById('editPlayerName').value || '?';
      preview.textContent = initials(name);
    }
  }

  document.getElementById('editPhotoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { editPhotoDataUrl = reader.result; updatePhotoPreview(); };
    reader.readAsDataURL(file);
  });
  document.getElementById('clearPhotoBtn').addEventListener('click', () => {
    editPhotoDataUrl = null;
    document.getElementById('editPhotoInput').value = '';
    updatePhotoPreview();
  });
  document.getElementById('editPlayerName').addEventListener('input', () => {
    if (!editPhotoDataUrl) updatePhotoPreview();
  });

  document.getElementById('playerEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const msgEl = document.getElementById('playerEditMsg');
    const attrs = {};
    document.querySelectorAll('#attrSliders .attr-slider-row').forEach((row) => {
      attrs[row.dataset.attrId] = Number(row.querySelector('input').value);
    });
    const body = {
      name: document.getElementById('editPlayerName').value.trim(),
      number: document.getElementById('editPlayerNumber').value === '' ? null : Number(document.getElementById('editPlayerNumber').value),
      position: document.getElementById('editPlayerPosition').value,
      photo: editPhotoDataUrl,
      nationality: document.getElementById('editPlayerNationality').value,
      parent_email: document.getElementById('editParentEmail').value.trim(),
      parent_phone: document.getElementById('editParentPhone').value.trim(),
      attributes: attrs,
      playstyles: selectedPlaystyles,
    };
    if (!body.name) { msgEl.textContent = 'Player name is required'; return; }
    try {
      let player;
      if (form.dataset.mode === 'edit') {
        body.team_id = Number(document.getElementById('editPlayerTeam').value);
        const res = await api('/players/' + state.currentPlayerId, { method: 'PUT', body });
        player = res.player;
      } else {
        body.team_id = Number(form.dataset.teamId);
        const res = await api('/players', { method: 'POST', body });
        player = res.player;
        state.currentPlayerId = player.id;
      }
      await refreshPlayersCache();
      const updated = state.players.find((p) => p.id === player.id);
      document.getElementById('playerViewMode').classList.remove('hidden');
      document.getElementById('playerEditMode').classList.add('hidden');
      document.getElementById('playerDeleteBtn').classList.remove('hidden');
      document.getElementById('playerEditToggleBtn').classList.remove('hidden');
      document.getElementById('playerModalTitle').textContent = 'Player';
      renderPlayerViewMode(updated);
      renderFolders();
      renderPlayerCardsForCurrentTeam();
      renderRadarPickers();
    } catch (err) {
      msgEl.textContent = err.message;
    }
  });

  document.getElementById('playerDeleteBtn').addEventListener('click', async () => {
    const player = state.players.find((p) => p.id === state.currentPlayerId);
    if (!player) return;
    if (!confirm(`Delete ${player.name}? This can't be undone.`)) return;
    await api('/players/' + player.id, { method: 'DELETE' });
    closeModal('player');
    await refreshPlayersCache();
    renderPlayerCardsForCurrentTeam();
    renderRadarPickers();
  });

  async function refreshPlayersCache() {
    const { players } = await api('/players');
    state.players = players;
    const { teams } = await api('/teams');
    state.teams = teams;
  }

  /* ============================================================
     RADAR CHART (custom SVG, supports 1 or 2 series)
  ============================================================ */
  function buildRadarSVG(series, size) {
    size = size || 320;
    const cx = size / 2, cy = size / 2;
    const labelPad = size * 0.16;
    const radius = size / 2 - labelPad;
    const attrNames = series[0].values.map((v) => v.name);
    const n = attrNames.length;
    if (n < 3) {
      return `<div style="color:#9fd8ae;font-size:13px;padding:20px;text-align:center;">Add at least 3 attributes to see a radar chart.</div>`;
    }
    const angleFor = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const pointAt = (i, frac) => {
      const a = angleFor(i);
      return [cx + Math.cos(a) * radius * frac, cy + Math.sin(a) * radius * frac];
    };

    let svg = `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:${size}px">`;

    // soft radial backdrop
    svg += `<circle cx="${cx}" cy="${cy}" r="${radius * 1.02}" fill="rgba(255,255,255,0.025)"/>`;

    // grid rings — banded, outer ring brighter
    [0.2, 0.4, 0.6, 0.8, 1].forEach((frac, i) => {
      const pts = attrNames.map((_, idx) => pointAt(idx, frac).join(',')).join(' ');
      const isOuter = i === 4;
      svg += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,${isOuter ? 0.22 : 0.12})" stroke-width="${isOuter ? 1.4 : 1}"/>`;
    });
    // axis lines + labels
    attrNames.forEach((name, i) => {
      const [x, y] = pointAt(i, 1);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>`;
      const [lx, ly] = pointAt(i, 1.17);
      svg += `<text x="${lx}" y="${ly}" fill="#dff2e2" font-size="${size * 0.034}" font-family="Poppins, sans-serif" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeHtml(name)}</text>`;
    });
    // series polygons
    series.forEach((s) => {
      const pts = s.values.map((v, i) => pointAt(i, Math.max(0.03, v.value / 99)).join(',')).join(' ');
      svg += `<polygon points="${pts}" fill="${s.color}" fill-opacity="0.3" stroke="${s.color}" stroke-width="3"/>`;
      s.values.forEach((v, i) => {
        const [x, y] = pointAt(i, Math.max(0.03, v.value / 99));
        svg += `<circle cx="${x}" cy="${y}" r="6.5" fill="${s.color}" fill-opacity="0.22"/>`;
        svg += `<circle cx="${x}" cy="${y}" r="3.6" fill="${s.color}" stroke="rgba(0,0,0,0.5)" stroke-width="1.2"/>`;
      });
    });

    svg += '</svg>';
    return svg;
  }

  function formatShortDate(isoLike) {
    const d = new Date(isoLike.replace(' ', 'T') + 'Z');
    if (Number.isNaN(d.getTime())) return isoLike;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function buildLineChartSVG(values, dates, color) {
    const width = 480, height = 200;
    const padL = 34, padR = 16, padT = 16, padB = 30;
    const plotW = width - padL - padR, plotH = height - padT - padB;
    const n = values.length;

    if (n < 2) {
      return `<div style="color:#9fd8ae;font-size:13px;padding:24px 8px;text-align:center;">
        Not enough history yet — a new point is recorded every time you save this player's ratings.</div>`;
    }

    const xAt = (i) => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
    const yAt = (v) => padT + plotH - (Math.max(0, Math.min(99, v)) / 99) * plotH;

    let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px">`;

    [0, 25, 50, 75, 99].forEach((v) => {
      const y = yAt(v);
      svg += `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
      svg += `<text x="${padL - 8}" y="${y}" fill="#7fae8b" font-size="10" font-family="JetBrains Mono, monospace" text-anchor="end" dominant-baseline="middle">${v}</text>`;
    });

    const points = values.map((v, i) => [xAt(i), yAt(v)]);
    const linePts = points.map((p) => p.join(',')).join(' ');
    const areaPts = `${padL},${padT + plotH} ${linePts} ${width - padR},${padT + plotH}`;
    svg += `<polygon points="${areaPts}" fill="${color}" fill-opacity="0.15"/>`;
    svg += `<polyline points="${linePts}" fill="none" stroke="${color}" stroke-width="2.5"/>`;

    points.forEach(([x, y], i) => {
      svg += `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}"/>`;
      const labelStep = Math.max(1, Math.ceil(n / 6));
      if (i === 0 || i === n - 1 || i % labelStep === 0) {
        svg += `<text x="${x}" y="${height - 8}" fill="#7fae8b" font-size="9.5" font-family="Poppins, sans-serif" text-anchor="middle">${escapeHtml(dates[i])}</text>`;
      }
    });
    const last = points[points.length - 1];
    svg += `<text x="${last[0]}" y="${last[1] - 10}" fill="${color}" font-size="13" font-weight="700" font-family="JetBrains Mono, monospace" text-anchor="middle">${values[values.length - 1]}</text>`;

    svg += '</svg>';
    return svg;
  }

  /* ============================================================
     ROSTER RADAR (2-PLAYER COMPARISON)
  ============================================================ */
  function updateRadarSlot(which) {
    const sel = document.getElementById(which === 'A' ? 'radarPlayerA' : 'radarPlayerB');
    const slot = document.getElementById(which === 'A' ? 'radarSlotA' : 'radarSlotB');
    const player = state.players.find((p) => String(p.id) === sel.value);
    if (!player) {
      slot.innerHTML = `<div class="rsc-empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg><span>Player ${which}</span></div>`;
      return;
    }
    const team = state.teams.find((t) => t.id === player.team_id);
    const color = team?.color || '#00E564';
    const photoHtml = player.photo
      ? `<img class="rsc-photo" src="${player.photo}" alt="">`
      : `<div class="rsc-photo rsc-initials">${initials(player.name)}</div>`;
    slot.innerHTML = `
      <div class="rsc-filled" style="--slot-color:${color}">
        ${photoHtml}
        <div class="rsc-info">
          <div class="rsc-name">${escapeHtml(player.name)}</div>
          <div class="rsc-sub">${escapeHtml(player.position)} · <span style="color:var(--lime)">${player.overall}</span></div>
        </div>
        <div class="rsc-change">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>`;
  }

  function renderRadarPickers() {
    const selA = document.getElementById('radarPlayerA');
    const selB = document.getElementById('radarPlayerB');
    const prevA = selA.value, prevB = selB.value;
    const options = state.players.map((p) => {
      const team = state.teams.find((t) => t.id === p.team_id);
      return `<option value="${p.id}">${escapeHtml(p.name)} — ${escapeHtml(team ? team.name : '')}</option>`;
    }).join('');
    selA.innerHTML = '<option value="">Select player…</option>' + options;
    selB.innerHTML = '<option value="">Select player…</option>' + options;
    if (state.players.some((p) => String(p.id) === prevA)) selA.value = prevA;
    if (state.players.some((p) => String(p.id) === prevB)) selB.value = prevB;
    updateRadarSlot('A');
    updateRadarSlot('B');
    renderRadarComparison();
  }

  function buildRadarHeadCard(player, side) {
    const photoHtml = player.photo
      ? `<img class="radar-head-photo-img" src="${player.photo}" alt="">`
      : `<div class="radar-head-photo-fallback">${initials(player.name)}</div>`;
    return `
      <div class="radar-head-card radar-head-${side}">
        <div class="radar-head-photo">${photoHtml}</div>
        <div class="radar-head-info">
          <div class="radar-head-name">${escapeHtml(player.name)}</div>
          <div class="radar-head-meta">${escapeHtml(player.position)}${player.number != null ? ' · #' + player.number : ''}</div>
        </div>
        <div class="radar-head-ovr">${player.overall}</div>
      </div>`;
  }

  const CAREER_STAT_FIELDS = [
    { key: 'goals', label: 'Goals', icon: () => ballIconSvg('compare-stat-icon') },
    { key: 'assists', label: 'Assists', icon: () => assistIconSvg('compare-stat-icon') },
    { key: 'playerOfMatch', label: 'Player of the Match', icon: () => starIconSvg('compare-stat-icon') },
    { key: 'cleanSheets', label: 'Clean Sheets', icon: () => shieldIconSvg('compare-stat-icon') },
  ];

  async function renderRadarComparison() {
    const idA = document.getElementById('radarPlayerA').value;
    const idB = document.getElementById('radarPlayerB').value;
    const content = document.getElementById('radarContent');
    const empty = document.getElementById('radarEmptyState');
    const playerA = state.players.find((p) => String(p.id) === idA);
    const playerB = state.players.find((p) => String(p.id) === idB);

    if (!playerA || !playerB) {
      content.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }
    content.classList.remove('hidden');
    empty.classList.add('hidden');

    document.getElementById('radarVsHeader').innerHTML =
      buildRadarHeadCard(playerA, 'a') + '<div class="radar-head-vs">VS</div>' + buildRadarHeadCard(playerB, 'b');

    document.getElementById('legendA').textContent = playerA.name;
    document.getElementById('legendB').textContent = playerB.name;
    document.getElementById('compareHeadA').textContent = playerA.name;
    document.getElementById('compareHeadB').textContent = playerB.name;

    document.getElementById('radarChartSvg').innerHTML = buildRadarSVG([
      { color: '#4AFF3F', values: playerA.attributes.map((a) => ({ name: a.name, value: a.value })) },
      { color: '#00D9FF', values: playerB.attributes.map((a) => ({ name: a.name, value: a.value })) },
    ], 340);

    let aWinCount = 0, bWinCount = 0;
    const rows = document.getElementById('compareRows');
    rows.innerHTML = playerA.attributes.map((a) => {
      const bAttr = playerB.attributes.find((x) => x.attribute_id === a.attribute_id) || { value: 0 };
      const aWin = a.value > bAttr.value, bWin = bAttr.value > a.value;
      if (aWin) aWinCount++; else if (bWin) bWinCount++;
      return `<div class="compare-row">
        <div class="compare-val ${aWin ? 'win-a' : ''}">${a.value}</div>
        <div class="compare-attr-name">${escapeHtml(a.name)}</div>
        <div class="compare-val ${bWin ? 'win-b' : ''}">${bAttr.value}</div>
      </div>`;
    }).join('') + `<div class="compare-row" style="border-top:1px solid rgba(74,255,63,0.18);margin-top:6px;padding-top:12px;">
        <div class="compare-val ${playerA.overall > playerB.overall ? 'win-a' : ''}" style="font-size:16px;">${playerA.overall}</div>
        <div class="compare-attr-name" style="font-weight:800;color:var(--gold);">OVERALL</div>
        <div class="compare-val ${playerB.overall > playerA.overall ? 'win-b' : ''}" style="font-size:16px;">${playerB.overall}</div>
      </div>`;
    if (playerA.overall > playerB.overall) aWinCount++; else if (playerB.overall > playerA.overall) bWinCount++;

    const careerRows = document.getElementById('compareCareerRows');
    const summaryChip = document.getElementById('radarSummaryChip');
    try {
      const [{ stats: statsA }, { stats: statsB }] = await Promise.all([
        api(`/players/${playerA.id}/stats`),
        api(`/players/${playerB.id}/stats`),
      ]);
      careerRows.innerHTML = CAREER_STAT_FIELDS.map((f) => {
        const aVal = statsA[f.key], bVal = statsB[f.key];
        const aWin = aVal > bVal, bWin = bVal > aVal;
        if (aWin) aWinCount++; else if (bWin) bWinCount++;
        return `<div class="compare-row">
          <div class="compare-val ${aWin ? 'win-a' : ''}">${aVal}</div>
          <div class="compare-attr-name">${f.icon()}${f.label}</div>
          <div class="compare-val ${bWin ? 'win-b' : ''}">${bVal}</div>
        </div>`;
      }).join('');
    } catch (e) {
      careerRows.innerHTML = '';
    }

    const totalCategories = aWinCount + bWinCount;
    if (totalCategories === 0) {
      summaryChip.innerHTML = '';
    } else if (aWinCount === bWinCount) {
      summaryChip.innerHTML = `<span class="radar-summary-tie">Dead even — tied across compared categories</span>`;
    } else {
      const leader = aWinCount > bWinCount ? playerA : playerB;
      const leaderSide = aWinCount > bWinCount ? 'a' : 'b';
      const leadCount = Math.max(aWinCount, bWinCount);
      summaryChip.innerHTML = `<span class="radar-summary-leader radar-summary-${leaderSide}">${escapeHtml(leader.name)} leads in ${leadCount} of ${totalCategories} categories</span>`;
    }
  }

  document.getElementById('radarPlayerA').addEventListener('change', () => { updateRadarSlot('A'); renderRadarComparison(); });
  document.getElementById('radarPlayerB').addEventListener('change', () => { updateRadarSlot('B'); renderRadarComparison(); });
  document.getElementById('radarSlotA').addEventListener('click', () => document.getElementById('radarPlayerA').showPicker?.() ?? document.getElementById('radarPlayerA').click());
  document.getElementById('radarSlotB').addEventListener('click', () => document.getElementById('radarPlayerB').showPicker?.() ?? document.getElementById('radarPlayerB').click());

  /* ============================================================
     TACTICAL PITCH
  ============================================================ */
  function renderPitchTeamSelect() {
    const sel = document.getElementById('pitchTeamSelect');
    const prev = sel.value;
    sel.innerHTML = '<option value="">Select team…</option>' + state.teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
    if (state.teams.some((t) => String(t.id) === prev)) {
      sel.value = prev;
    } else if (state.teams.length > 0 && !state.pitch.teamId) {
      // Auto-load the first team so the pitch is always populated on entry
      sel.value = String(state.teams[0].id);
      loadPitchForTeam(state.teams[0].id);
    } else {
      renderPitchGhost();
    }
  }

  const LINEUP_TYPES = ['defensive', 'balanced', 'attacking'];

  document.getElementById('pitchTeamSelect').addEventListener('change', async (e) => {
    const teamId = e.target.value;
    if (!teamId) {
      document.getElementById('lineupTypeTabs').classList.add('hidden');
      document.getElementById('pitchControls').classList.add('hidden');
      document.getElementById('pitchEmptyState').classList.remove('hidden');
      state.pitch.teamId = null;
      renderPitchGhost();
      return;
    }
    document.getElementById('pitchEmptyState').classList.add('hidden');
    await loadPitchForTeam(Number(teamId));
  });

  function currentLineup() {
    return state.pitch.formations[state.pitch.lineupType];
  }

  // Pitch data model stores x = field progress (0 = own goal, 100 = attack) and
  // y = lateral width, independent of display orientation. The board renders
  // portrait with the own goal at the bottom, so screen position is derived here.
  function dataToScreen(pos) {
    return { left: pos.y, top: 100 - pos.x };
  }
  function screenToData(leftPct, topPct) {
    return { x: 100 - topPct, y: leftPct };
  }

  function shiftForPhase(template, phase) {
    if (phase === 'balanced') return template;
    return template.map((pt) => {
      if (pt.label === 'GK') return pt;
      let x = pt.x;
      if (phase === 'defensive') {
        x = 6 + (pt.x - 6) * 0.62;
      } else if (phase === 'attacking') {
        x = pt.x + (94 - pt.x) * 0.4;
      }
      return { ...pt, x: Math.max(10, Math.min(94, x)) };
    });
  }

  function applyTeamFormationToLineup(lineupType) {
    const team = state.teams.find((t) => t.id === state.pitch.teamId);
    const template = shiftForPhase(FORMATIONS[team.formation] || FORMATIONS['4-3-3'], lineupType);
    const lineup = state.pitch.formations[lineupType];
    const currentlyPlaced = lineup.placed.map((p) => p.player_id);
    const pool = state.pitch.players.filter((p) => !currentlyPlaced.includes(p.id)).slice();

    // First pass: give each slot a player who actually plays that position.
    const assignments = template.map((slot) => {
      const idx = pool.findIndex((p) => p.position === slot.label);
      if (idx === -1) return null;
      return pool.splice(idx, 1)[0].id;
    });
    // Second pass: fill any remaining slots with leftover players in order.
    assignments.forEach((playerId, i) => {
      if (playerId === null && pool.length) assignments[i] = pool.shift().id;
    });

    lineup.placed = lineup.placed.concat(
      assignments.map((playerId, i) => (playerId ? { player_id: playerId, x: template[i].x, y: template[i].y } : null)).filter(Boolean)
    );
  }

  async function loadPitchForTeam(teamId) {
    const team = state.teams.find((t) => t.id === teamId);
    const players = state.players.filter((p) => p.team_id === teamId);
    let raw = {};
    try {
      const res = await api('/formations/' + teamId);
      raw = res.formations || {};
    } catch (e) { /* fall back to defaults below */ }

    const formations = {};
    LINEUP_TYPES.forEach((type) => {
      const data = raw[type];
      const placed = data
        ? (data.positions || []).filter((pos) => players.some((pl) => pl.id === pos.player_id)).map((pos) => ({ player_id: pos.player_id, x: pos.x, y: pos.y }))
        : [];
      formations[type] = { placed, everSaved: !!(data && data.id) };
    });

    state.pitch = { teamId, players, lineupType: 'balanced', formations };
    LINEUP_TYPES.forEach((type) => {
      if (!formations[type].everSaved && formations[type].placed.length === 0 && players.length > 0) {
        applyTeamFormationToLineup(type);
      }
    });

    document.getElementById('pitchFormationName').textContent = team.formation;
    document.querySelectorAll('.lineup-type-tab').forEach((b) => b.classList.toggle('active', b.dataset.lineup === 'balanced'));
    document.getElementById('lineupTypeTabs').classList.remove('hidden');
    document.getElementById('pitchControls').classList.remove('hidden');
    document.getElementById('pitchEmptyState').classList.add('hidden');
    renderPitch();
  }

  document.querySelectorAll('.lineup-type-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!state.pitch.teamId) return;
      state.pitch.lineupType = btn.dataset.lineup;
      document.querySelectorAll('.lineup-type-tab').forEach((b) => b.classList.toggle('active', b === btn));
      renderPitch();
    });
  });

  document.getElementById('resetFormationBtn').addEventListener('click', () => {
    if (!state.pitch.teamId) return;
    currentLineup().placed = [];
    applyTeamFormationToLineup(state.pitch.lineupType);
    renderPitch();
  });

  document.getElementById('clearPitchBtn').addEventListener('click', () => {
    currentLineup().placed = [];
    renderPitch();
  });

  const CHECK_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  document.getElementById('saveFormationBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const lineup = currentLineup();
    const team = state.teams.find((t) => t.id === state.pitch.teamId);
    try {
      await api(`/formations/${state.pitch.teamId}/${state.pitch.lineupType}`, {
        method: 'PUT',
        body: {
          formation_name: team.formation,
          positions: lineup.placed.map((p) => ({ player_id: p.player_id, x: p.x, y: p.y })),
        },
      });
      lineup.everSaved = true;
      const original = btn.innerHTML;
      btn.innerHTML = CHECK_ICON_SVG;
      setTimeout(() => { btn.innerHTML = original; }, 1500);
    } catch (err) {
      alert('Could not save formation: ' + err.message);
    }
  });

  function buildMiniCardEl(player) {
    const mini = document.createElement('div');
    mini.className = 'mini-card ' + tierClass(player.overall);
    mini.innerHTML = `
      <div class="mini-card-ovr">${player.overall}</div>
      <div class="mini-card-pos">${escapeHtml(player.position)}</div>
      <div class="mini-card-flag" title="${escapeHtml(player.nationality || '')}">${flagEmoji(player.nationality)}</div>`;
    return mini;
  }

  function buildPitchCardEl(player) {
    const card = document.createElement('div');
    card.className = 'pitch-card ' + tierClass(player.overall);
    const lastName = player.name.split(' ').slice(-1)[0];
    const photoHtml = player.photo
      ? `<img class="pitch-card-photo" src="${player.photo}" alt="">`
      : `<div class="pitch-card-fallback">${initials(player.name)}</div>`;
    card.innerHTML = `
      <div class="pitch-card-top">
        <div class="pitch-card-ovr">${player.overall}</div>
        <div class="pitch-card-pos">${escapeHtml(player.position)}</div>
      </div>
      <div class="pitch-card-photo-wrap">${photoHtml}</div>
      <div class="pitch-card-name">${escapeHtml(lastName).toUpperCase()}</div>`;
    return card;
  }

  function renderPitchGhost() {
    const slotsWrap = document.getElementById('pitchSlots');
    const benchWrap = document.getElementById('pitchBenchList');
    slotsWrap.innerHTML = '';
    benchWrap.innerHTML = '';
    const template = FORMATIONS['4-3-3'];
    template.forEach((slot) => {
      const screenPos = dataToScreen(slot);
      const ghost = document.createElement('div');
      ghost.className = 'pitch-ghost-slot';
      ghost.style.left = screenPos.left + '%';
      ghost.style.top = screenPos.top + '%';
      ghost.textContent = slot.label;
      slotsWrap.appendChild(ghost);
    });
  }

  function renderPitch() {
    const slotsWrap = document.getElementById('pitchSlots');
    const benchWrap = document.getElementById('pitchBenchList');
    slotsWrap.innerHTML = '';
    benchWrap.innerHTML = '';
    const lineup = currentLineup();

    const placedIds = lineup.placed.map((p) => p.player_id);
    const bench = state.pitch.players.filter((p) => !placedIds.includes(p.id));

    lineup.placed.forEach((pos) => {
      const player = state.pitch.players.find((pl) => pl.id === pos.player_id);
      if (!player) return;
      const chip = document.createElement('div');
      chip.className = 'pitch-chip';
      const screenPos = dataToScreen(pos);
      chip.style.left = screenPos.left + '%';
      chip.style.top = screenPos.top + '%';
      chip.dataset.playerId = player.id;
      chip.appendChild(buildPitchCardEl(player));
      const removeEl = document.createElement('span');
      removeEl.className = 'chip-remove';
      removeEl.innerHTML = '&times;';
      removeEl.addEventListener('click', (ev) => {
        ev.stopPropagation();
        lineup.placed = lineup.placed.filter((x) => x.player_id !== player.id);
        renderPitch();
      });
      chip.appendChild(removeEl);
      attachDrag(chip, 'chip', player.id);
      slotsWrap.appendChild(chip);
    });

    if (bench.length === 0) {
      benchWrap.innerHTML = '<div style="font-size:12px;color:var(--lime);">All players are on the pitch.</div>';
    }
    bench.forEach((player) => {
      const chip = document.createElement('div');
      chip.className = 'bench-chip';
      chip.dataset.playerId = player.id;
      chip.appendChild(buildMiniCardEl(player));
      const nameEl = document.createElement('div');
      nameEl.className = 'bench-chip-name';
      nameEl.textContent = player.name.split(' ')[0];
      chip.appendChild(nameEl);
      attachDrag(chip, 'bench', player.id);
      benchWrap.appendChild(chip);
    });
  }

  function attachDrag(el, type, playerId) {
    el.addEventListener('pointerdown', (e) => {
      if (e.target.classList.contains('chip-remove')) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      let didDrag = false;
      const player = state.pitch.players.find((pl) => pl.id === playerId);
      const ghost = document.createElement('div');
      ghost.style.position = 'fixed';
      ghost.style.left = e.clientX - 27 + 'px';
      ghost.style.top = e.clientY - 38 + 'px';
      ghost.style.zIndex = 9999;
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.85';
      ghost.appendChild(type === 'chip' ? buildPitchCardEl(player) : buildMiniCardEl(player));
      document.body.appendChild(ghost);
      el.style.opacity = '0.35';

      function onMove(ev) {
        if (Math.abs(ev.clientX - startX) > 6 || Math.abs(ev.clientY - startY) > 6) didDrag = true;
        ghost.style.left = ev.clientX - 27 + 'px';
        ghost.style.top = ev.clientY - 38 + 'px';
      }
      function onUp(ev) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        ghost.remove();
        el.style.opacity = '';

        if (!didDrag && type === 'chip') {
          openPlayerModal(playerId);
          return;
        }

        const board = document.getElementById('pitchBoard');
        const rect = board.getBoundingClientRect();
        const overPitch = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;

        const lineup = currentLineup();
        if (overPitch) {
          const leftPct = Math.max(2, Math.min(98, ((ev.clientX - rect.left) / rect.width) * 100));
          const topPct = Math.max(2, Math.min(98, ((ev.clientY - rect.top) / rect.height) * 100));
          const data = screenToData(leftPct, topPct);
          lineup.placed = lineup.placed.filter((pl) => pl.player_id !== playerId);
          lineup.placed.push({ player_id: playerId, x: data.x, y: data.y });
        } else if (type === 'chip') {
          lineup.placed = lineup.placed.filter((pl) => pl.player_id !== playerId);
        }
        renderPitch();
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  boot();
})();
