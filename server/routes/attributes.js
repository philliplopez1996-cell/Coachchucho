const express = require('express');
const { db, slugify } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const attributes = db
    .prepare('SELECT * FROM attributes WHERE coach_id = ? ORDER BY sort_order ASC, id ASC')
    .all(req.coachId);
  res.json({ attributes });
});

router.post('/', (req, res) => {
  const { name } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Attribute name is required' });
  const key = slugify(name);
  if (!key) return res.status(400).json({ error: 'Attribute name is invalid' });

  const existing = db
    .prepare('SELECT id FROM attributes WHERE coach_id = ? AND key = ?')
    .get(req.coachId, key);
  if (existing) return res.status(409).json({ error: 'That attribute already exists' });

  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM attributes WHERE coach_id = ?')
    .get(req.coachId).m;

  const createAndBackfill = db.transaction(() => {
    const info = db
      .prepare('INSERT INTO attributes (coach_id, name, key, sort_order) VALUES (?, ?, ?, ?)')
      .run(req.coachId, name.trim(), key, maxOrder + 1);
    const attributeId = info.lastInsertRowid;

    const players = db
      .prepare(
        `SELECT p.id FROM players p JOIN teams t ON p.team_id = t.id WHERE t.coach_id = ?`
      )
      .all(req.coachId);
    const insertValue = db.prepare(
      'INSERT OR IGNORE INTO player_attribute_values (player_id, attribute_id, value) VALUES (?, ?, 50)'
    );
    players.forEach((p) => insertValue.run(p.id, attributeId));

    return attributeId;
  });

  const attributeId = createAndBackfill();
  const attribute = db.prepare('SELECT * FROM attributes WHERE id = ?').get(attributeId);
  res.status(201).json({ attribute });
});

router.delete('/:id', (req, res) => {
  const attribute = db
    .prepare('SELECT * FROM attributes WHERE id = ? AND coach_id = ?')
    .get(req.params.id, req.coachId);
  if (!attribute) return res.status(404).json({ error: 'Attribute not found' });

  const count = db.prepare('SELECT COUNT(*) AS c FROM attributes WHERE coach_id = ?').get(req.coachId).c;
  if (count <= 1) {
    return res.status(400).json({ error: 'You must keep at least one attribute' });
  }

  db.prepare('DELETE FROM attributes WHERE id = ?').run(attribute.id);
  res.json({ success: true });
});

module.exports = router;
