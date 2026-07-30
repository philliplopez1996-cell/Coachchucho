const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'coachchucho.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    photo TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(coach_id, key)
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4AFF3F',
    parent_password_hash TEXT,
    formation TEXT NOT NULL DEFAULT '4-3-3',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number INTEGER,
    position TEXT NOT NULL DEFAULT 'MID',
    photo TEXT,
    nationality TEXT,
    parent_email TEXT,
    parent_phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS player_attribute_values (
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    attribute_id INTEGER NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    value INTEGER NOT NULL DEFAULT 50,
    PRIMARY KEY (player_id, attribute_id)
  );

  CREATE TABLE IF NOT EXISTS formations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    lineup_type TEXT NOT NULL DEFAULT 'balanced',
    formation_name TEXT NOT NULL DEFAULT '4-3-3',
    positions TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(team_id, lineup_type)
  );

  CREATE TABLE IF NOT EXISTS player_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    overall INTEGER NOT NULL,
    attributes_json TEXT NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'practice',
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT,
    location TEXT,
    opponent TEXT,
    score_for INTEGER,
    score_against INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn('players', 'nationality', 'TEXT');
ensureColumn('players', 'parent_email', 'TEXT');
ensureColumn('players', 'parent_phone', 'TEXT');
ensureColumn('coaches', 'photo', 'TEXT');
ensureColumn('teams', 'parent_password_hash', 'TEXT');
ensureColumn('teams', 'formation', "TEXT NOT NULL DEFAULT '4-3-3'");
ensureColumn('coaches', 'theme', "TEXT NOT NULL DEFAULT 'field'");

function migrateFormationsTable() {
  const cols = db.prepare('PRAGMA table_info(formations)').all().map((c) => c.name);
  if (cols.includes('lineup_type')) return;
  db.exec(`
    ALTER TABLE formations RENAME TO formations_old;
    CREATE TABLE formations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      lineup_type TEXT NOT NULL DEFAULT 'balanced',
      formation_name TEXT NOT NULL DEFAULT '4-3-3',
      positions TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(team_id, lineup_type)
    );
    INSERT INTO formations (team_id, lineup_type, formation_name, positions, updated_at)
      SELECT team_id, 'balanced', formation_name, positions, updated_at FROM formations_old;
    DROP TABLE formations_old;
  `);
}
migrateFormationsTable();

const LINEUP_TYPES = ['defensive', 'balanced', 'attacking'];

const DEFAULT_ATTRIBUTES = ['Pace', 'Shooting', 'Passing', 'Dribbling', 'Defending', 'Physical'];

function slugify(name) {
  return String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function seedDefaultAttributes(coachId) {
  const insert = db.prepare(
    'INSERT INTO attributes (coach_id, name, key, sort_order) VALUES (?, ?, ?, ?)'
  );
  const seedAll = db.transaction(() => {
    DEFAULT_ATTRIBUTES.forEach((name, i) => {
      insert.run(coachId, name, slugify(name), i);
    });
  });
  seedAll();
}

function recordPlayerProgress(playerId, overall, attributes) {
  db.prepare(
    'INSERT INTO player_progress (player_id, overall, attributes_json) VALUES (?, ?, ?)'
  ).run(playerId, overall, JSON.stringify(attributes));
}

module.exports = {
  db,
  slugify,
  seedDefaultAttributes,
  DEFAULT_ATTRIBUTES,
  LINEUP_TYPES,
  recordPlayerProgress,
};
