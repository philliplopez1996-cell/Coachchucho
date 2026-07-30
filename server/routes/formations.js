const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getOwnedTeam(teamId, coachId) {
  return db.prepare('SELECT * FROM teams WHERE id = ? AND coach_id = ?').get(teamId, coachId);
}

router.get('/:teamId', (req, res) => {
  const team = getOwnedTeam(req.params.teamId, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const formation = db.prepare('SELECT * FROM formations WHERE team_id = ?').get(team.id);
  if (!formation) {
    return res.json({ formation: { team_id: team.id, formation_name: '4-3-3', positions: [] } });
  }
  res.json({ formation: { ...formation, positions: JSON.parse(formation.positions) } });
});

router.put('/:teamId', (req, res) => {
  const team = getOwnedTeam(req.params.teamId, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const { formation_name, positions } = req.body || {};
  const positionsJson = JSON.stringify(Array.isArray(positions) ? positions : []);

  const existing = db.prepare('SELECT id FROM formations WHERE team_id = ?').get(team.id);
  if (existing) {
    db.prepare(
      `UPDATE formations SET formation_name = ?, positions = ?, updated_at = datetime('now') WHERE team_id = ?`
    ).run(formation_name || '4-3-3', positionsJson, team.id);
  } else {
    db.prepare(
      'INSERT INTO formations (team_id, formation_name, positions) VALUES (?, ?, ?)'
    ).run(team.id, formation_name || '4-3-3', positionsJson);
  }

  const formation = db.prepare('SELECT * FROM formations WHERE team_id = ?').get(team.id);
  res.json({ formation: { ...formation, positions: JSON.parse(formation.positions) } });
});

module.exports = router;
