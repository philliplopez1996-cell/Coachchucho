const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const EVENT_TYPES = ['practice', 'game'];

function getOwnedEvent(eventId, coachId) {
  return db.prepare('SELECT * FROM events WHERE id = ? AND coach_id = ?').get(eventId, coachId);
}

function serializeEvent(id) {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!event) return null;
  const goals = db
    .prepare(
      `SELECT eg.id, eg.player_id, p.name AS player_name
       FROM event_goals eg JOIN players p ON p.id = eg.player_id
       WHERE eg.event_id = ? ORDER BY eg.id ASC`
    )
    .all(id);
  let playerOfMatch = null;
  if (event.player_of_match_id) {
    playerOfMatch = db.prepare('SELECT id, name FROM players WHERE id = ?').get(event.player_of_match_id) || null;
  }
  return { ...event, goals, player_of_match: playerOfMatch };
}

// Replaces the goal list and player-of-the-match for an event. Both are only
// meaningful when the event has a team (we validate scorers against that
// team's roster), so anything without a team_id is quietly cleared.
function setGoalsAndPotm(eventId, teamId, goalPlayerIds, potmPlayerId) {
  let validGoalIds = [];
  let validPotmId = null;

  if (teamId && Array.isArray(goalPlayerIds)) {
    const placeholders = goalPlayerIds.map(() => '?').join(',') || "''";
    const rosterMatches = goalPlayerIds.length
      ? db.prepare(`SELECT id FROM players WHERE team_id = ? AND id IN (${placeholders})`).all(teamId, ...goalPlayerIds)
      : [];
    const rosterIds = new Set(rosterMatches.map((p) => p.id));
    validGoalIds = goalPlayerIds.filter((id) => rosterIds.has(Number(id))).map(Number);
  }

  if (teamId && potmPlayerId) {
    const potmMatch = db.prepare('SELECT id FROM players WHERE id = ? AND team_id = ?').get(potmPlayerId, teamId);
    if (potmMatch) validPotmId = potmMatch.id;
  }

  const tx = db.transaction(() => {
    db.prepare('DELETE FROM event_goals WHERE event_id = ?').run(eventId);
    const insertGoal = db.prepare('INSERT INTO event_goals (event_id, player_id) VALUES (?, ?)');
    validGoalIds.forEach((playerId) => insertGoal.run(eventId, playerId));
    db.prepare('UPDATE events SET player_of_match_id = ? WHERE id = ?').run(validPotmId, eventId);
  });
  tx();
}

router.get('/', (req, res) => {
  const { start, end } = req.query;
  let rows;
  if (start && end) {
    rows = db
      .prepare('SELECT id FROM events WHERE coach_id = ? AND event_date >= ? AND event_date <= ? ORDER BY event_date ASC, event_time ASC')
      .all(req.coachId, start, end);
  } else {
    rows = db.prepare('SELECT id FROM events WHERE coach_id = ? ORDER BY event_date ASC, event_time ASC').all(req.coachId);
  }
  res.json({ events: rows.map((r) => serializeEvent(r.id)) });
});

router.post('/', (req, res) => {
  const { team_id, type, title, event_date, event_time, location, opponent, score_for, score_against, notes, goals, player_of_match_id } = req.body || {};
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
  setGoalsAndPotm(info.lastInsertRowid, teamId, goals, player_of_match_id);
  res.status(201).json({ event: serializeEvent(info.lastInsertRowid) });
});

router.put('/:id', (req, res) => {
  const existing = getOwnedEvent(req.params.id, req.coachId);
  if (!existing) return res.status(404).json({ error: 'Event not found' });
  const { team_id, type, title, event_date, event_time, location, opponent, score_for, score_against, notes, goals, player_of_match_id } = req.body || {};

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

  if (goals !== undefined || player_of_match_id !== undefined) {
    setGoalsAndPotm(existing.id, teamId, goals !== undefined ? goals : [], player_of_match_id !== undefined ? player_of_match_id : null);
  } else if (team_id !== undefined && teamId !== existing.team_id) {
    // Team changed without new goals/POTM supplied — old scorers no longer apply.
    setGoalsAndPotm(existing.id, teamId, [], null);
  }

  res.json({ event: serializeEvent(existing.id) });
});

router.delete('/:id', (req, res) => {
  const existing = getOwnedEvent(req.params.id, req.coachId);
  if (!existing) return res.status(404).json({ error: 'Event not found' });
  db.prepare('DELETE FROM events WHERE id = ?').run(existing.id);
  res.json({ success: true });
});

module.exports = router;
