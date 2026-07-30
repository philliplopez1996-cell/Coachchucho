const express = require('express');
const { db, getPlayerStats } = require('../db');
const { requireParentAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireParentAuth);

function getMatchedPlayerIds(req) {
  if (req.parentTeamIds.length === 0) return [];
  const placeholders = req.parentTeamIds.map(() => '?').join(',');
  return db
    .prepare(
      `SELECT id FROM players WHERE team_id IN (${placeholders}) AND LOWER(parent_email) = ?`
    )
    .all(...req.parentTeamIds, req.parentEmail)
    .map((p) => p.id);
}

function serializePlayer(playerId) {
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(playerId);
  if (!player) return null;
  const team = db.prepare('SELECT id, name, color FROM teams WHERE id = ?').get(player.team_id);
  const attributes = db
    .prepare(
      `SELECT a.id AS attribute_id, a.name, a.key, a.sort_order, COALESCE(v.value, 50) AS value
       FROM attributes a
       LEFT JOIN player_attribute_values v ON v.attribute_id = a.id AND v.player_id = ?
       WHERE a.coach_id = (SELECT coach_id FROM teams WHERE id = ?)
       ORDER BY a.sort_order ASC, a.id ASC`
    )
    .all(playerId, player.team_id);
  const overall = attributes.length
    ? Math.round(attributes.reduce((sum, a) => sum + a.value, 0) / attributes.length)
    : 0;
  const { parent_email, parent_phone, ...rest } = player;
  return { ...rest, team, attributes, overall };
}

router.get('/players', (req, res) => {
  const ids = getMatchedPlayerIds(req);
  res.json({ players: ids.map(serializePlayer) });
});

router.get('/players/:id/progress', (req, res) => {
  const ids = getMatchedPlayerIds(req);
  if (!ids.includes(Number(req.params.id))) return res.status(404).json({ error: 'Player not found' });
  const snapshots = db
    .prepare('SELECT id, overall, attributes_json, recorded_at FROM player_progress WHERE player_id = ? ORDER BY recorded_at ASC')
    .all(req.params.id)
    .map((s) => ({ id: s.id, overall: s.overall, attributes: JSON.parse(s.attributes_json), recorded_at: s.recorded_at }));
  res.json({ progress: snapshots });
});

router.get('/players/:id/stats', (req, res) => {
  const ids = getMatchedPlayerIds(req);
  if (!ids.includes(Number(req.params.id))) return res.status(404).json({ error: 'Player not found' });
  res.json({ stats: getPlayerStats(req.params.id) });
});

module.exports = router;
