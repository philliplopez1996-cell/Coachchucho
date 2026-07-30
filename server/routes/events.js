const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const EVENT_TYPES = ['practice', 'game'];

function getOwnedEvent(eventId, coachId) {
  return db.prepare('SELECT * FROM events WHERE id = ? AND coach_id = ?').get(eventId, coachId);
}

router.get('/', (req, res) => {
  const { start, end } = req.query;
  let events;
  if (start && end) {
    events = db
      .prepare('SELECT * FROM events WHERE coach_id = ? AND event_date >= ? AND event_date <= ? ORDER BY event_date ASC, event_time ASC')
      .all(req.coachId, start, end);
  } else {
    events = db
      .prepare('SELECT * FROM events WHERE coach_id = ? ORDER BY event_date ASC, event_time ASC')
      .all(req.coachId);
  }
  res.json({ events });
});

router.post('/', (req, res) => {
  const { team_id, type, title, event_date, event_time, location, opponent, score_for, score_against, notes } = req.body || {};
  if (!event_date) return res.status(400).json({ error: 'Event date is required' });
  const eventType = EVENT_TYPES.includes(type) ? type : 'practice';
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

  let teamId = null;
  if (team_id) {
    const team = db.prepare('SELECT id FROM teams WHERE id = ? AND coach_id = ?').get(team_id, req.coachId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    teamId = team.id;
  }

  const info = db
    .prepare(
      `INSERT INTO events (coach_id, team_id, type, title, event_date, event_time, location, opponent, score_for, score_against, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      req.coachId,
      teamId,
      eventType,
      title.trim(),
      event_date,
      event_time || null,
      location || null,
      opponent || null,
      score_for !== undefined && score_for !== '' ? Number(score_for) : null,
      score_against !== undefined && score_against !== '' ? Number(score_against) : null,
      notes || null
    );
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ event });
});

router.put('/:id', (req, res) => {
  const existing = getOwnedEvent(req.params.id, req.coachId);
  if (!existing) return res.status(404).json({ error: 'Event not found' });
  const { team_id, type, title, event_date, event_time, location, opponent, score_for, score_against, notes } = req.body || {};

  let teamId = existing.team_id;
  if (team_id !== undefined) {
    if (team_id === null || team_id === '') {
      teamId = null;
    } else {
      const team = db.prepare('SELECT id FROM teams WHERE id = ? AND coach_id = ?').get(team_id, req.coachId);
      if (!team) return res.status(404).json({ error: 'Team not found' });
      teamId = team.id;
    }
  }

  db.prepare(
    `UPDATE events SET
      team_id = ?,
      type = ?,
      title = ?,
      event_date = ?,
      event_time = ?,
      location = ?,
      opponent = ?,
      score_for = ?,
      score_against = ?,
      notes = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    teamId,
    EVENT_TYPES.includes(type) ? type : existing.type,
    title && title.trim() ? title.trim() : existing.title,
    event_date || existing.event_date,
    event_time !== undefined ? (event_time || null) : existing.event_time,
    location !== undefined ? (location || null) : existing.location,
    opponent !== undefined ? (opponent || null) : existing.opponent,
    score_for !== undefined ? (score_for === '' || score_for === null ? null : Number(score_for)) : existing.score_for,
    score_against !== undefined ? (score_against === '' || score_against === null ? null : Number(score_against)) : existing.score_against,
    notes !== undefined ? (notes || null) : existing.notes,
    existing.id
  );

  res.json({ event: db.prepare('SELECT * FROM events WHERE id = ?').get(existing.id) });
});

router.delete('/:id', (req, res) => {
  const existing = getOwnedEvent(req.params.id, req.coachId);
  if (!existing) return res.status(404).json({ error: 'Event not found' });
  db.prepare('DELETE FROM events WHERE id = ?').run(existing.id);
  res.json({ success: true });
});

module.exports = router;
