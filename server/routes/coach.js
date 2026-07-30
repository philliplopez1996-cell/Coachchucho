const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function publicCoach(coach) {
  return { id: coach.id, name: coach.name, email: coach.email, photo: coach.photo };
}

router.get('/me', (req, res) => {
  const coach = db.prepare('SELECT * FROM coaches WHERE id = ?').get(req.coachId);
  if (!coach) return res.status(404).json({ error: 'Coach not found' });
  res.json({ coach: publicCoach(coach) });
});

router.put('/me', (req, res) => {
  const coach = db.prepare('SELECT * FROM coaches WHERE id = ?').get(req.coachId);
  if (!coach) return res.status(404).json({ error: 'Coach not found' });

  const { name, email, password, currentPassword, photo } = req.body || {};
  const updates = {
    name: coach.name,
    email: coach.email,
    password_hash: coach.password_hash,
    photo: photo !== undefined ? photo : coach.photo,
  };

  if (name && name.trim()) updates.name = name.trim();

  if (email && email.trim().toLowerCase() !== coach.email) {
    const clash = db
      .prepare('SELECT id FROM coaches WHERE email = ? AND id != ?')
      .get(email.trim().toLowerCase(), coach.id);
    if (clash) return res.status(409).json({ error: 'That email is already in use' });
    updates.email = email.trim().toLowerCase();
  }

  if (password) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, coach.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    updates.password_hash = bcrypt.hashSync(password, 10);
  }

  db.prepare('UPDATE coaches SET name = ?, email = ?, password_hash = ?, photo = ? WHERE id = ?').run(
    updates.name,
    updates.email,
    updates.password_hash,
    updates.photo,
    coach.id
  );

  const updated = db.prepare('SELECT * FROM coaches WHERE id = ?').get(coach.id);
  res.json({ coach: publicCoach(updated) });
});

module.exports = router;
