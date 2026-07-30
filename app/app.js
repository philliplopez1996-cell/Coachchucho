(function () {
  'use strict';

  /* ============================================================
     CONSTANTS
  ============================================================ */
  const TOKEN_KEY = 'cc_token';
  const ROLE_KEY = 'cc_role';
  const POSITIONS = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
  const TEAM_COLORS = ['#4AFF3F', '#00D9FF', '#FFD700', '#FF6B35', '#FF3F8E', '#8B5CF6', '#3F8CFF'];

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
    renderAttrList();
    openModal('profile');
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
     ROSTER: TEAMS (FOLDERS)
  ============================================================ */
  function renderFolders() {
    const grid = document.getElementById('folderGrid');
    const empty = document.getElementById('rosterEmptyState');
    grid.innerHTML = '';
    empty.classList.toggle('hidden', state.teams.length > 0);
    state.teams.forEach((team) => {
      const card = document.createElement('div');
      card.className = 'folder-card';
      card.style.setProperty('--folder-color', team.color);
      card.innerHTML = `<div class="folder-icon" style="color:${escapeHtml(team.color)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>
        </div>
        <div class="folder-name">${escapeHtml(team.name)}</div>
        <div class="folder-count">${team.player_count} player${team.player_count === 1 ? '' : 's'}</div>`;
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
    document.getElementById('rosterPositionFilter').value = '';
    renderPlayerCardsForCurrentTeam();
  }

  document.getElementById('rosterPositionFilter').innerHTML =
    '<option value="">All positions</option>' + POSITIONS.map((p) => `<option value="${p}">${p}</option>`).join('');
  document.getElementById('rosterSearchInput').addEventListener('input', renderPlayerCardsForCurrentTeam);
  document.getElementById('rosterPositionFilter').addEventListener('change', renderPlayerCardsForCurrentTeam);
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
        ${shown.map((a) => `<div class="pc-stat"><span class="pc-stat-label">${abbr(a.name)}</span><span>${a.value}</span></div>`).join('')}
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
    const positionFilter = document.getElementById('rosterPositionFilter').value;
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
        <div class="big-attr-top"><span>${escapeHtml(a.name)}</span><span class="big-attr-value">${a.value}</span></div>
        <div class="big-attr-bar-track"><div class="big-attr-bar-fill" style="width:${a.value}%"></div></div>
      </div>`).join('');

    const metricSelect = document.getElementById('progressMetricSelect');
    metricSelect.innerHTML = '<option value="overall">Overall</option>' +
      player.attributes.map((a) => `<option value="${a.attribute_id}">${escapeHtml(a.name)}</option>`).join('');
    metricSelect.value = 'overall';
    loadProgressForPlayer(player.id);
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

    // grid rings
    [0.2, 0.4, 0.6, 0.8, 1].forEach((frac) => {
      const pts = attrNames.map((_, i) => pointAt(i, frac).join(',')).join(' ');
      svg += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>`;
    });
    // axis lines + labels
    attrNames.forEach((name, i) => {
      const [x, y] = pointAt(i, 1);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>`;
      const [lx, ly] = pointAt(i, 1.16);
      svg += `<text x="${lx}" y="${ly}" fill="#cfeed6" font-size="${size * 0.032}" font-family="Poppins, sans-serif" font-weight="600" text-anchor="middle" dominant-baseline="middle">${escapeHtml(name)}</text>`;
    });
    // series polygons
    series.forEach((s) => {
      const pts = s.values.map((v, i) => pointAt(i, Math.max(0.03, v.value / 99)).join(',')).join(' ');
      svg += `<polygon points="${pts}" fill="${s.color}" fill-opacity="0.28" stroke="${s.color}" stroke-width="2.5"/>`;
      s.values.forEach((v, i) => {
        const [x, y] = pointAt(i, Math.max(0.03, v.value / 99));
        svg += `<circle cx="${x}" cy="${y}" r="3.2" fill="${s.color}"/>`;
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
    renderRadarComparison();
  }

  function renderRadarComparison() {
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

    document.getElementById('legendA').textContent = `${playerA.name} (${playerA.overall} OVR)`;
    document.getElementById('legendB').textContent = `${playerB.name} (${playerB.overall} OVR)`;
    document.getElementById('compareHeadA').textContent = playerA.name;
    document.getElementById('compareHeadB').textContent = playerB.name;

    document.getElementById('radarChartSvg').innerHTML = buildRadarSVG([
      { color: '#4AFF3F', values: playerA.attributes.map((a) => ({ name: a.name, value: a.value })) },
      { color: '#00D9FF', values: playerB.attributes.map((a) => ({ name: a.name, value: a.value })) },
    ], 300);

    const rows = document.getElementById('compareRows');
    rows.innerHTML = playerA.attributes.map((a) => {
      const bAttr = playerB.attributes.find((x) => x.attribute_id === a.attribute_id) || { value: 0 };
      const aWin = a.value > bAttr.value, bWin = bAttr.value > a.value;
      return `<div class="compare-row">
        <div class="compare-val ${aWin ? 'win' : ''}">${a.value}</div>
        <div class="compare-attr-name">${escapeHtml(a.name)}</div>
        <div class="compare-val ${bWin ? 'win' : ''}">${bAttr.value}</div>
      </div>`;
    }).join('') + `<div class="compare-row" style="border-top:1px solid rgba(74,255,63,0.18);margin-top:6px;padding-top:12px;">
        <div class="compare-val ${playerA.overall > playerB.overall ? 'win' : ''}" style="font-size:16px;">${playerA.overall}</div>
        <div class="compare-attr-name" style="font-weight:800;color:var(--gold);">OVERALL</div>
        <div class="compare-val ${playerB.overall > playerA.overall ? 'win' : ''}" style="font-size:16px;">${playerB.overall}</div>
      </div>`;
  }

  document.getElementById('radarPlayerA').addEventListener('change', renderRadarComparison);
  document.getElementById('radarPlayerB').addEventListener('change', renderRadarComparison);

  /* ============================================================
     TACTICAL PITCH
  ============================================================ */
  function renderPitchTeamSelect() {
    const sel = document.getElementById('pitchTeamSelect');
    const prev = sel.value;
    sel.innerHTML = '<option value="">Select team…</option>' + state.teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
    if (state.teams.some((t) => String(t.id) === prev)) sel.value = prev;
  }

  const LINEUP_TYPES = ['defensive', 'balanced', 'attacking'];

  document.getElementById('pitchTeamSelect').addEventListener('change', async (e) => {
    const teamId = e.target.value;
    if (!teamId) {
      document.getElementById('lineupTypeTabs').classList.add('hidden');
      document.getElementById('pitchControls').classList.add('hidden');
      document.getElementById('pitchWrap').classList.add('hidden');
      document.getElementById('pitchEmptyState').classList.remove('hidden');
      return;
    }
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
    document.getElementById('pitchWrap').classList.remove('hidden');
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
      chip.appendChild(buildMiniCardEl(player));
      const nameEl = document.createElement('span');
      nameEl.className = 'chip-name';
      nameEl.textContent = player.name;
      chip.appendChild(nameEl);
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
      benchWrap.innerHTML = '<div style="font-size:12px;color:#7fae8b;">All players are on the pitch.</div>';
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
      const player = state.pitch.players.find((pl) => pl.id === playerId);
      const ghost = document.createElement('div');
      ghost.style.position = 'fixed';
      ghost.style.left = e.clientX - 26 + 'px';
      ghost.style.top = e.clientY - 33 + 'px';
      ghost.style.zIndex = 9999;
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.85';
      ghost.appendChild(buildMiniCardEl(player));
      document.body.appendChild(ghost);
      el.style.opacity = '0.35';

      function onMove(ev) {
        ghost.style.left = ev.clientX - 26 + 'px';
        ghost.style.top = ev.clientY - 33 + 'px';
      }
      function onUp(ev) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        ghost.remove();
        el.style.opacity = '';

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
