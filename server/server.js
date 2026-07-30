const path = require('path');
const express = require('express');
const cors = require('cors');

require('./db');

const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coach');
const attributeRoutes = require('./routes/attributes');
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const formationRoutes = require('./routes/formations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '8mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/formations', formationRoutes);

const repoRoot = path.join(__dirname, '..');
app.use('/app', express.static(path.join(repoRoot, 'app')));
app.use(express.static(repoRoot));

app.get('/app', (req, res) => {
  res.sendFile(path.join(repoRoot, 'app', 'app.html'));
});

app.listen(PORT, () => {
  console.log(`Coach Chucho server running on http://localhost:${PORT}`);
  console.log(`  Marketing site:  http://localhost:${PORT}/`);
  console.log(`  Coaching app:    http://localhost:${PORT}/app`);
});
