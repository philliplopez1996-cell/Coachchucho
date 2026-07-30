const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function getOwnedTeam(teamId, coachId) {
  return db.prepare('SELECT * FROM teams WHERE id = ? AND coach_id = ?').get(teamId, coachId);
}

function serializeTeam(team) {
  const { parent_password_hash, ...rest } = team;
  return { ...rest, has_parent_password: !!parent_password_hash };
}

router.get('/', (req, res) => {
  const teams = db
    .prepare(
      `SELECT t.*, (SELECT COUNT(*) FROM players p WHERE p.team_id = t.id) AS player_count
       FROM teams t WHERE t.coach_id = ? ORDER BY t.created_at ASC`
    )
    .all(req.coachId);
  res.json({ teams: teams.map(serializeTeam) });
});

router.post('/', (req, res) => {
  const { name, color, parent_password } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Team name is required' });
  const passwordHash = parent_password && parent_password.trim() ? bcrypt.hashSync(parent_password.trim(), 10) : null;
  const info = db
    .prepare('INSERT INTO teams (coach_id, name, color, parent_password_hash) VALUES (?, ?, ?, ?)')
    .run(req.coachId, name.trim(), color || '#4AFF3F', passwordHash);
  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ team: serializeTeam(team) });
});

router.put('/:id', (req, res) => {
  const team = getOwnedTeam(req.params.id, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const name = (req.body && req.body.name && req.body.name.trim()) || team.name;
  const color = (req.body && req.body.color) || team.color;

  let parentPasswordHash = team.parent_password_hash;
  if (req.body && req.body.clear_parent_password) {
    parentPasswordHash = null;
  } else if (req.body && req.body.parent_password && req.body.parent_password.trim()) {
    parentPasswordHash = bcrypt.hashSync(req.body.parent_password.trim(), 10);
  }

  db.prepare('UPDATE teams SET name = ?, color = ?, parent_password_hash = ? WHERE id = ?').run(
    name,
    color,
    parentPasswordHash,
    team.id
  );
  res.json({ team: serializeTeam(db.prepare('SELECT * FROM teams WHERE id = ?').get(team.id)) });
});

router.delete('/:id', (req, res) => {
  const team = getOwnedTeam(req.params.id, req.coachId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  db.prepare('DELETE FROM teams WHERE id = ?').run(team.id);
  res.json({ success: true });
});

module.exports = router;
