const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function serializePlayer(playerId) {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return null;
  const team = db.prepare('SELECT id, coach_id, name, color FROM teams WHERE id = ?').get(player.team_id);
  const attributes = db
    .prepare(
      `SELECT a.id AS attribute_id, a.name, a.key, a.sort_order, COALESCE(v.value, 50) AS value
       FROM attributes a
       LEFT JOIN player_attribute_values v ON v.attribute_id = a.id AND v.player_id = ?
       WHERE a.coach_id = ?
       ORDER BY a.sort_order ASC, a.id ASC`
    )
    .all(playerId, team.coach_id);
  const overall = attributes.length
    ? Math.round(attributes.reduce((sum, a) => sum + a.value, 0) / attributes.length)
    : 0;
  return { ...player, team, attributes, overall };
}

function getOwnedPlayer(playerId, coachId) {
  const player = db
    .prepare(
      `SELECT p.* FROM players p JOIN teams t ON p.team_id = t.id WHERE p.id = ? AND t.coach_id = ?`
    )
    .get(playerId, coachId);
  return player;
}

router.get('/', (req, res) => {
  const { team_id } = req.query;
  let players;
  if (team_id) {
    const team = db.prepare('SELECT * FROM teams WHERE id = ? AND coach_id = ?').get(team_id, req.coachId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    players = db.prepare('SELECT id FROM players WHERE team_id = ? ORDER BY name ASC').all(team_id);
  } else {
    players = db
      .prepare(
        `SELECT p.id FROM players p JOIN teams t ON p.team_id = t.id WHERE t.coach_id = ? ORDER BY p.name ASC`
      )
      .all(req.coachId);
  }
  res.json({ players: players.map((p) => serializePlayer(p.id)) });
});

router.get('/:id', (req, res) => {
  const owned = getOwnedPlayer(req.params.id, req.coachId);
  if (!owned) return res.status(404).json({ error: 'Player not found' });
  res.json({ player: serializePlayer(owned.id) });
});

router.post('/', (req, res) => {
  const { team_id, name, number, position, photo, attributes } = req.body || {};
  if (!team_id || !name || !name.trim()) {
    return res.status(400).json({ error: 'team_id and name are required' });
  }
  const team = db.prepare('SELECT * FROM teams WHERE id = ? AND coach_id = ?').get(team_id, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const createPlayer = db.transaction(() => {
    const info = db
      .prepare(
        'INSERT INTO players (team_id, name, number, position, photo) VALUES (?, ?, ?, ?, ?)'
      )
      .run(team_id, name.trim(), number || null, position || 'MID', photo || null);
    const playerId = info.lastInsertRowid;

    const coachAttrs = db.prepare('SELECT id FROM attributes WHERE coach_id = ?').all(req.coachId);
    const insertValue = db.prepare(
      'INSERT INTO player_attribute_values (player_id, attribute_id, value) VALUES (?, ?, ?)'
    );
    coachAttrs.forEach((a) => {
      const v = attributes && attributes[a.id] != null ? clampValue(attributes[a.id]) : 50;
      insertValue.run(playerId, a.id, v);
    });
    return playerId;
  });

  const playerId = createPlayer();
  res.status(201).json({ player: serializePlayer(playerId) });
});

function clampValue(v) {
  const n = Math.round(Number(v));
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(99, n));
}

router.put('/:id', (req, res) => {
  const owned = getOwnedPlayer(req.params.id, req.coachId);
  if (!owned) return res.status(404).json({ error: 'Player not found' });
  const { name, number, position, photo, attributes } = req.body || {};

  const updatePlayer = db.transaction(() => {
    db.prepare(
      `UPDATE players SET
        name = COALESCE(?, name),
        number = ?,
        position = COALESCE(?, position),
        photo = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      name && name.trim() ? name.trim() : null,
      number !== undefined ? number : owned.number,
      position || null,
      photo !== undefined ? photo : owned.photo,
      owned.id
    );

    if (attributes && typeof attributes === 'object') {
      const upsert = db.prepare(
        `INSERT INTO player_attribute_values (player_id, attribute_id, value) VALUES (?, ?, ?)
         ON CONFLICT(player_id, attribute_id) DO UPDATE SET value = excluded.value`
      );
      Object.entries(attributes).forEach(([attributeId, value]) => {
        upsert.run(owned.id, Number(attributeId), clampValue(value));
      });
    }
  });

  updatePlayer();
  res.json({ player: serializePlayer(owned.id) });
});

router.delete('/:id', (req, res) => {
  const owned = getOwnedPlayer(req.params.id, req.coachId);
  if (!owned) return res.status(404).json({ error: 'Player not found' });
  db.prepare('DELETE FROM players WHERE id = ?').run(owned.id);
  res.json({ success: true });
});

module.exports = router;
