(function () {
  'use strict';

  /* ============================================================
     CONSTANTS
  ============================================================ */
  const TOKEN_KEY = 'cc_token';
  const POSITIONS = ['GK', 'LB', 'CB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
  const TEAM_COLORS = ['#4AFF3F', '#00D9FF', '#FFD700', '#FF6B35', '#FF3F8E', '#8B5CF6', '#3F8CFF'];

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
    coach: null,
    attributes: [],
    teams: [],
    players: [],
    currentTeamId: null,
    currentPlayerId: null,
    playerModalMode: 'view',
    pitch: { teamId: null, players: [], placed: [], formationName: '4-3-3' },
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
    try {
      const { coach } = await api('/coach/me');
      state.coach = coach;
      await enterApp();
    } catch (e) {
      state.token = null;
      localStorage.removeItem(TOKEN_KEY);
      showAuth();
    }
  }

  function showAuth() {
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('appShell').classList.add('hidden');
  }

  async function enterApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
    document.getElementById('sidebarName').textContent = state.coach.name;
    document.getElementById('sidebarEmail').textContent = state.coach.email;
    document.getElementById('sidebarAvatar').textContent = initials(state.coach.name);
    document.getElementById('homeCoachName').textContent = state.coach.name.split(' ')[0];
    await loadAll();
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';
    try {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      state.token = data.token;
      state.coach = data.coach;
      localStorage.setItem(TOKEN_KEY, state.token);
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
      state.coach = data.coach;
      localStorage.setItem(TOKEN_KEY, state.token);
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
    state.token = null;
    state.coach = null;
    localStorage.removeItem(TOKEN_KEY);
    closeSidebar();
    showAuth();
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
    renderHomeStats();
    renderFolders();
    renderPlayerCardsForCurrentTeam();
    renderRadarPickers();
    renderPitchTeamSelect();
    renderAttrList();
  }

  function renderHomeStats() {
    document.getElementById('statTeams').textContent = state.teams.length;
    document.getElementById('statPlayers').textContent = state.players.length;
    document.getElementById('statAttrs').textContent = state.attributes.length;
    const avg = state.players.length
      ? Math.round(state.players.reduce((s, p) => s + p.overall, 0) / state.players.length)
      : 0;
    document.getElementById('statAvgOvr').textContent = avg;
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
  document.querySelectorAll('[data-goto-tab]').forEach((btn) => {
    btn.addEventListener('click', () => goToTab(btn.dataset.gotoTab));
  });

  /* ============================================================
     COACH PROFILE MODAL
  ============================================================ */
  function openProfileModal() {
    document.getElementById('profileName').value = state.coach.name;
    document.getElementById('profileEmail').value = state.coach.email;
    document.getElementById('profileCurrentPassword').value = '';
    document.getElementById('profileNewPassword').value = '';
    document.getElementById('profileMsg').textContent = '';
    document.getElementById('profileMsg').className = 'form-msg';
    renderAttrList();
    openModal('profile');
  }

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('profileMsg');
    msgEl.className = 'form-msg';
    msgEl.textContent = '';
    const body = {
      name: document.getElementById('profileName').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
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
      document.getElementById('sidebarAvatar').textContent = initials(coach.name);
      document.getElementById('homeCoachName').textContent = coach.name.split(' ')[0];
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
        <button class="attr-row-del" title="Delete attribute" ${state.attributes.length <= 1 ? 'disabled style="opacity:.3;cursor:not-allowed"' : ''}>🗑️</button>`;
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
      card.innerHTML = `<div class="folder-icon" style="color:${escapeHtml(team.color)}">🗂️</div>
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
    renderPlayerCardsForCurrentTeam();
  }

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
    openModal('team');
  }

  document.getElementById('teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgEl = document.getElementById('teamMsg');
    const name = document.getElementById('teamNameInput').value.trim();
    const selectedSwatch = document.querySelector('#teamColorSwatches .color-swatch.selected');
    const color = selectedSwatch ? selectedSwatch.dataset.color : TEAM_COLORS[0];
    if (!name) { msgEl.textContent = 'Team name is required'; return; }
    try {
      if (teamModalEditingId) {
        await api('/teams/' + teamModalEditingId, { method: 'PUT', body: { name, color } });
      } else {
        await api('/teams', { method: 'POST', body: { name, color } });
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

  function renderPlayerCardsForCurrentTeam() {
    if (!state.currentTeamId) return;
    const grid = document.getElementById('playerCardGrid');
    const empty = document.getElementById('teamEmptyState');
    grid.innerHTML = '';
    const players = state.players.filter((p) => p.team_id === state.currentTeamId);
    empty.classList.toggle('hidden', players.length > 0);
    players.forEach((p) => grid.appendChild(buildPlayerCardEl(p)));
  }

  document.getElementById('addPlayerBtn').addEventListener('click', () => openPlayerModal(null, state.currentTeamId));

  /* ============================================================
     PLAYER DETAIL / EDIT MODAL
  ============================================================ */
  function openPlayerModal(playerId, teamIdForCreate) {
    state.currentPlayerId = playerId;
    const isCreate = !playerId;
    document.getElementById('playerModalTitle').textContent = isCreate ? 'New Player' : 'Player';
    document.getElementById('playerDeleteBtn').classList.toggle('hidden', isCreate);
    document.getElementById('playerEditToggleBtn').classList.toggle('hidden', isCreate);

    if (isCreate) {
      enterPlayerEditMode(null, teamIdForCreate);
    } else {
      const player = state.players.find((p) => p.id === playerId);
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

    const bigAttrs = document.getElementById('bigAttrs');
    bigAttrs.innerHTML = player.attributes.map((a) => `
      <div class="big-attr-row">
        <div class="big-attr-top"><span>${escapeHtml(a.name)}</span><span class="big-attr-value">${a.value}</span></div>
        <div class="big-attr-bar-track"><div class="big-attr-bar-fill" style="width:${a.value}%"></div></div>
      </div>`).join('');
  }

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

    editPhotoDataUrl = player ? player.photo : null;
    const preview = document.getElementById('editPhotoPreview');
    updatePhotoPreview();

    document.getElementById('editPlayerName').value = player ? player.name : '';
    document.getElementById('editPlayerNumber').value = player && player.number != null ? player.number : '';
    posSelect.value = player ? player.position : 'ST';

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
      attributes: attrs,
    };
    if (!body.name) { msgEl.textContent = 'Player name is required'; return; }
    try {
      let player;
      if (form.dataset.mode === 'edit') {
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
      renderPlayerCardsForCurrentTeam();
      renderHomeStats();
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
    renderHomeStats();
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

  document.getElementById('pitchTeamSelect').addEventListener('change', async (e) => {
    const teamId = e.target.value;
    if (!teamId) {
      document.getElementById('pitchControls').classList.add('hidden');
      document.getElementById('pitchWrap').classList.add('hidden');
      document.getElementById('pitchEmptyState').classList.remove('hidden');
      return;
    }
    await loadPitchForTeam(Number(teamId));
  });

  async function loadPitchForTeam(teamId) {
    const players = state.players.filter((p) => p.team_id === teamId);
    let formationName = '4-3-3', positions = [];
    try {
      const res = await api('/formations/' + teamId);
      formationName = res.formation.formation_name || '4-3-3';
      positions = res.formation.positions || [];
    } catch (e) { /* no formation yet */ }

    const placed = positions
      .map((pos) => {
        const p = players.find((pl) => pl.id === pos.player_id);
        if (!p) return null;
        return { player_id: p.id, name: p.name, number: p.number, x: pos.x, y: pos.y };
      })
      .filter(Boolean);

    state.pitch = { teamId, players, placed, formationName };
    document.getElementById('pitchControls').classList.remove('hidden');
    document.getElementById('pitchWrap').classList.remove('hidden');
    document.getElementById('pitchEmptyState').classList.add('hidden');
    renderFormationButtons();
    renderPitch();
  }

  function renderFormationButtons() {
    const wrap = document.getElementById('formationButtons');
    wrap.innerHTML = Object.keys(FORMATIONS).map((name) =>
      `<button type="button" class="formation-btn ${name === state.pitch.formationName ? 'active' : ''}" data-formation="${name}">${name}</button>`
    ).join('');
    wrap.querySelectorAll('.formation-btn').forEach((btn) => {
      btn.addEventListener('click', () => applyFormation(btn.dataset.formation));
    });
  }

  function applyFormation(name) {
    const template = FORMATIONS[name];
    const allPlayers = state.pitch.players;
    const currentlyPlaced = state.pitch.placed.map((p) => p.player_id);
    const bench = allPlayers.filter((p) => !currentlyPlaced.includes(p.id));
    const ordered = state.pitch.placed.concat(bench.map((p) => ({ player_id: p.id, name: p.name, number: p.number })));
    const placed = ordered.slice(0, template.length).map((p, i) => ({
      player_id: p.player_id, name: p.name, number: p.number, x: template[i].x, y: template[i].y,
    }));
    state.pitch.placed = placed;
    state.pitch.formationName = name;
    document.querySelectorAll('.formation-btn').forEach((b) => b.classList.toggle('active', b.dataset.formation === name));
    renderPitch();
  }

  document.getElementById('clearPitchBtn').addEventListener('click', () => {
    state.pitch.placed = [];
    renderPitch();
  });

  document.getElementById('saveFormationBtn').addEventListener('click', async (e) => {
    const btn = e.target;
    try {
      await api('/formations/' + state.pitch.teamId, {
        method: 'PUT',
        body: {
          formation_name: state.pitch.formationName,
          positions: state.pitch.placed.map((p) => ({ player_id: p.player_id, x: p.x, y: p.y })),
        },
      });
      const original = btn.textContent;
      btn.textContent = '✅ Saved!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    } catch (err) {
      alert('Could not save formation: ' + err.message);
    }
  });

  function renderPitch() {
    const slotsWrap = document.getElementById('pitchSlots');
    const benchWrap = document.getElementById('pitchBenchList');
    slotsWrap.innerHTML = '';
    benchWrap.innerHTML = '';

    const placedIds = state.pitch.placed.map((p) => p.player_id);
    const bench = state.pitch.players.filter((p) => !placedIds.includes(p.id));

    state.pitch.placed.forEach((p) => {
      const chip = document.createElement('div');
      chip.className = 'pitch-chip';
      chip.style.left = p.x + '%';
      chip.style.top = p.y + '%';
      chip.dataset.playerId = p.player_id;
      chip.innerHTML = `<span class="chip-num">${p.number != null ? p.number : '–'}</span>
        <span class="chip-name">${escapeHtml(p.name)}</span>
        <span class="chip-remove">&times;</span>`;
      chip.querySelector('.chip-remove').addEventListener('click', (ev) => {
        ev.stopPropagation();
        state.pitch.placed = state.pitch.placed.filter((x) => x.player_id !== p.player_id);
        renderPitch();
      });
      attachDrag(chip, 'chip', p.player_id);
      slotsWrap.appendChild(chip);
    });

    if (bench.length === 0) {
      benchWrap.innerHTML = '<div style="font-size:12px;color:#7fae8b;">All players are on the pitch.</div>';
    }
    bench.forEach((p) => {
      const chip = document.createElement('div');
      chip.className = 'bench-chip';
      chip.dataset.playerId = p.id;
      chip.innerHTML = `<div class="bench-chip-circle">${p.number != null ? p.number : '–'}</div>
        <div class="bench-chip-name">${escapeHtml(p.name.split(' ')[0])}</div>`;
      attachDrag(chip, 'bench', p.id);
      benchWrap.appendChild(chip);
    });
  }

  function attachDrag(el, type, playerId) {
    el.addEventListener('pointerdown', (e) => {
      if (e.target.classList.contains('chip-remove')) return;
      e.preventDefault();
      const ghost = document.createElement('div');
      ghost.className = type === 'chip' ? 'pitch-chip' : 'bench-chip-circle';
      ghost.style.position = 'fixed';
      ghost.style.left = e.clientX - 22 + 'px';
      ghost.style.top = e.clientY - 22 + 'px';
      ghost.style.zIndex = 9999;
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.85';
      if (type === 'chip') {
        const num = el.querySelector('.chip-num').textContent;
        ghost.innerHTML = `<span class="chip-num">${num}</span>`;
      } else {
        ghost.style.width = '40px'; ghost.style.height = '40px';
        ghost.textContent = el.querySelector('.bench-chip-circle').textContent;
      }
      document.body.appendChild(ghost);
      el.style.opacity = '0.35';

      function onMove(ev) {
        ghost.style.left = ev.clientX - 22 + 'px';
        ghost.style.top = ev.clientY - 22 + 'px';
      }
      function onUp(ev) {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        ghost.remove();
        el.style.opacity = '';

        const board = document.getElementById('pitchBoard');
        const rect = board.getBoundingClientRect();
        const overPitch = ev.clientX >= rect.left && ev.clientX <= rect.right && ev.clientY >= rect.top && ev.clientY <= rect.bottom;

        if (overPitch) {
          const x = Math.max(2, Math.min(98, ((ev.clientX - rect.left) / rect.width) * 100));
          const y = Math.max(2, Math.min(98, ((ev.clientY - rect.top) / rect.height) * 100));
          const player = state.pitch.players.find((pl) => pl.id === playerId);
          state.pitch.placed = state.pitch.placed.filter((pl) => pl.player_id !== playerId);
          state.pitch.placed.push({ player_id: playerId, name: player.name, number: player.number, x, y });
        } else if (type === 'chip') {
          state.pitch.placed = state.pitch.placed.filter((pl) => pl.player_id !== playerId);
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
