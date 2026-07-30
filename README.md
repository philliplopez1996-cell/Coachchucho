# Coachchucho

## Marketing site

`Index.html` is the public booking/marketing landing page — open it directly or serve it statically.

## Coaching app

`app/` is the coach-facing team & player management app (multi-coach login, team folders, FIFA-style
player cards, radar chart comparisons, and a drag-and-drop tactical pitch). It's backed by the API in
`server/`, which stores everything in a local SQLite database.

### Running it

```bash
cd server
npm install
npm start
```

Then open:

- `http://localhost:3000/` — the marketing site (`Index.html`)
- `http://localhost:3000/app` — the coaching app

Set `JWT_SECRET` and `PORT` as environment variables in production (a dev default is used otherwise).
The SQLite database file is created automatically at `server/data/coachchucho.sqlite`.

### What's in the app

- **Sign up / log in** — each coach has their own account (name, email, password).
- **Side menu** (top-left hamburger) — Coach Profile and FAQs.
- **Coach Profile** — edit name/email/password, plus add or delete the custom attributes
  (Pace, Shooting, Passing, Dribbling, Defending, Physical by default) used on every player card
  and the radar chart.
- **Roster tab** — team folders, each holding FIFA-style player cards. Tap a card to view its radar
  chart and full attribute breakdown, or tap the pencil icon to edit name/number/position/photo and
  attribute ratings.
- **Roster Radar tab** — pick any two players for an overlaid radar chart and a side-by-side stat
  comparison with the higher value highlighted.
- **Tactical Pitch tab** — pick a team, apply a formation (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 4-1-4-1), and
  drag players between the bench and the pitch. Save to persist the lineup per team.
