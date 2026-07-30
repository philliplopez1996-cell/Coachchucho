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

- **Sign up / log in** — each coach has their own account (name, email, password, profile photo).
- **Side menu** (top-left hamburger) — Coach Profile, Calendar, and FAQs.
- **Coach Profile** — edit name/email/password/photo, choose an app color theme, and add or delete
  the custom attributes (Pace, Shooting, Passing, Dribbling, Defending, Physical by default) used
  on every player card and the radar chart.
- **Calendar** — a month view for scheduling games and practices per team. Games can be updated
  with a final score once played, along with who scored each goal (and who assisted it), who was
  Player of the Match, and — when the game finished 0 against — which players (usually the keeper
  and defenders) get credited with a clean sheet; each day shows a dot for practices and a
  different one for games, and the agenda lists scorers, assists, POTM, and clean sheets under
  each game.
- **Themes** — "Field" (the default green/lime look) and "Midnight" (a navy/cyan look), switchable
  from Coach Profile. Midnight is flagged as a Premium theme in the UI and unlocked for everyone
  during the current free period; the app has no real payment processing yet — that would need a
  native iOS/Android build with in-app purchases, which is a separate project from this web app.
- **Roster tab** — team folders, each holding FIFA-style player cards, with search/filter (by
  position) and sort (name, overall, number, position). A team record box (Wins/Losses/Ties and
  Goals For/Against, tallied from played games), a Top Scorers leaderboard (goals, assists, and
  Player of the Match count per player), and a Clean Sheets leaderboard sit above the roster
  whenever a team has recorded game stats. Tap a card to view its radar chart, full attribute
  breakdown, career Goals/Assists/Player-of-the-Match/Clean-Sheet totals, and progress-over-time
  chart, or tap the pencil icon to edit name/number/position/nationality/photo/parent contact
  info/attribute ratings, and to move a player to a different team.
- **Roster Radar tab** — pick any two players for a head-to-head comparison: mini player cards
  with photo/position/overall, a larger overlaid radar chart, an attribute-by-attribute table
  color-coded to whichever player leads each stat, a career stats comparison (goals, assists,
  Player of the Match, clean sheets), and a "leads in X of Y categories" summary chip.
- **Tactical Pitch tab** — each team has its own formation (4-3-3, 4-4-2, 4-2-3-1, 3-5-2, or 4-1-4-1),
  set when you create or edit the team. On the pitch, toggle between Defensive / Balanced / Attacking
  to see that same formation shift up or down the field (goalkeeper anchored, outfield players
  compressed deep or pushed forward) — each phase is saved independently per team. Drag players
  between the bench and the pitch as small tiered mini-cards; use Reset to snap back to the team's
  formation for the current phase.
- **Parent portal** — a separate "Parent" login on the auth screen. A coach sets a shared parent
  password per team (in the team's edit modal); parents log in with their own email (matched
  against the parent email on file) plus that password, and see a read-only view of just their own
  child's card, radar, and progress chart — no roster, tactics, or other players' data.
