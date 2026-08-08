const express = require('express');
const { db, LINEUP_TYPES } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getOwnedTeam(teamId, coachId) {
  return db.prepare('SELECT * FROM teams WHERE id = ? AND coach_id = ?').get(teamId, coachId);
}

function defaultFormation(teamId, lineupType) {
  return { team_id: teamId, lineup_type: lineupType, formation_name: '4-3-3', positions: [] };
}

router.get('/:teamId', (req, res) => {
  const team = getOwnedTeam(req.params.teamId, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const rows = db.prepare('SELECT * FROM formations WHERE team_id = ?').all(team.id);
  const formations = {};
  LINEUP_TYPES.forEach((type) => {
    const row = rows.find((r) => r.lineup_type === type);
    formations[type] = row
      ? { ...row, positions: JSON.parse(row.positions) }
      : defaultFormation(team.id, type);
  });
  res.json({ formations });
});

router.put('/:teamId/:lineupType', (req, res) => {
  const team = getOwnedTeam(req.params.teamId, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const { lineupType } = req.params;
  if (!LINEUP_TYPES.includes(lineupType)) {
    return res.status(400).json({ error: 'Invalid lineup type' });
  }
  const { formation_name, positions } = req.body || {};
  const positionsJson = JSON.stringify(Array.isArray(positions) ? positions : []);

  const existing = db
    .prepare('SELECT id FROM formations WHERE team_id = ? AND lineup_type = ?')
    .get(team.id, lineupType);
  if (existing) {
    db.prepare(
      `UPDATE formations SET formation_name = ?, positions = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(formation_name || '4-3-3', positionsJson, existing.id);
  } else {
    db.prepare(
      'INSERT INTO formations (team_id, lineup_type, formation_name, positions) VALUES (?, ?, ?, ?)'
    ).run(team.id, lineupType, formation_name || '4-3-3', positionsJson);
  }

  const formation = db.prepare('SELECT * FROM formations WHERE team_id = ? AND lineup_type = ?').get(team.id, lineupType);
  res.json({ formation: { ...formation, positions: JSON.parse(formation.positions) } });
});

module.exports = router;
