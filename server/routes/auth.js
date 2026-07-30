const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, seedDefaultAttributes } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function sign(coach) {
  return jwt.sign({ coachId: coach.id }, JWT_SECRET, { expiresIn: '30d' });
}

function publicCoach(coach) {
  return { id: coach.id, name: coach.name, email: coach.email, photo: coach.photo, theme: coach.theme };
}

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const existing = db.prepare('SELECT id FROM coaches WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO coaches (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name.trim(), email.toLowerCase().trim(), passwordHash);
  seedDefaultAttributes(info.lastInsertRowid);
  const coach = db.prepare('SELECT * FROM coaches WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ token: sign(coach), coach: publicCoach(coach) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const coach = db.prepare('SELECT * FROM coaches WHERE email = ?').get(email.toLowerCase().trim());
  if (!coach || !bcrypt.compareSync(password, coach.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ token: sign(coach), coach: publicCoach(coach) });
});

router.post('/parent-login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const normalizedEmail = email.toLowerCase().trim();

  const candidateTeams = db
    .prepare(
      `SELECT DISTINCT t.id, t.name, t.parent_password_hash
       FROM teams t JOIN players p ON p.team_id = t.id
       WHERE LOWER(p.parent_email) = ? AND t.parent_password_hash IS NOT NULL`
    )
    .all(normalizedEmail);

  const matchedTeams = candidateTeams.filter((t) => bcrypt.compareSync(password, t.parent_password_hash));
  if (matchedTeams.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { type: 'parent', email: normalizedEmail, teamIds: matchedTeams.map((t) => t.id) },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  res.json({ token, email: normalizedEmail, teams: matchedTeams.map((t) => ({ id: t.id, name: t.name })) });
});

module.exports = router;
