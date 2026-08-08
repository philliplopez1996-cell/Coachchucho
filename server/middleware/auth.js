const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'coachchucho-dev-secret-change-me';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type === 'parent' || !payload.coachId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.coachId = payload.coachId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireParentAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== 'parent' || !payload.email || !Array.isArray(payload.teamIds)) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.parentEmail = payload.email;
    req.parentTeamIds = payload.teamIds;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { requireAuth, requireParentAuth, JWT_SECRET };
