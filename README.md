# The Connection

Four clues. One answer. A small live trivia game for a college orientation
event — one host, teams playing from their phones, a projector for
everyone to watch.

## What's in here

```
/server        Node.js + Express + Socket.IO backend (in-memory game state)
/client        React + TypeScript + Vite + Tailwind frontend (Host / Join / Screen)
render.yaml    Deploy config for the server (Render)
client/vercel.json   Deploy config for the client (Vercel)
```

No database, no accounts, no build infrastructure beyond what's above.
If the server restarts, the game resets — that's expected for a one-night
event.

## Running it

You need two terminals: one for the server, one for the client.

**Terminal 1 — server**
```bash
cd server
npm install
npm run dev
```
This starts the game server on `http://localhost:3001`.

**Terminal 2 — client**
```bash
cd client
npm install
npm run dev
```
This starts the web app on `http://localhost:5173` (Vite will print the
exact URL, including a `Network:` address — see below).

Then open:

- **Host:** `http://localhost:5173/host`
- **Players:** `http://localhost:5173/join`
- **Projector:** `http://localhost:5173/screen`

## Deploying so players don't need the same WiFi

For the real event, deploy in two small pieces — the game still ends up
behind **one public URL** that the host, players, and projector all use.

Why two pieces? Vercel only runs stateless, short-lived functions — it
can't host a long-running process that keeps the game (teams, scores,
timer) in memory and holds open Socket.IO connections. So the frontend
(the pages people see) deploys to Vercel as normal, and the small
realtime server deploys to a host that *does* support a persistent
Node process. Nothing else about the game changes — same code, same
Socket.IO, same in-memory state, no database.

**1. Deploy the server (`/server`) to Render** — free tier, no code
changes needed:

1. Push this repo to GitHub.
2. On [render.com](https://render.com), click **New → Blueprint** and
   point it at your repo. It will read `render.yaml` at the repo root
   and configure itself (root dir `server`, build `npm install && npm
   run build`, start `npm start`) — click **Apply**.
3. Once deployed, copy its URL, e.g. `https://the-connection-server.onrender.com`.

   (Any host that runs a persistent Node process works the same way —
   Railway, Fly.io, etc. Render just has the simplest free git-based
   setup.)

**2. Deploy the client (`/client`) to Vercel:**

1. On [vercel.com](https://vercel.com), **Add New → Project**, import
   the same repo, and set **Root Directory** to `client` (Vercel
   auto-detects the Vite build — no build command changes needed).
2. Before the first deploy, add an environment variable:
   `VITE_SERVER_URL` = the Render URL from step 1
   (e.g. `https://the-connection-server.onrender.com`).
3. Deploy. Vercel gives you one URL, e.g. `https://the-connection.vercel.app`.

From then on, `git push` redeploys the client automatically on Vercel and
the server automatically on Render — no manual steps.

**Give out this one URL** — `https://the-connection.vercel.app` (yours
will differ) — to everyone:

- **Host:** `https://the-connection.vercel.app/host`
- **Players:** `https://the-connection.vercel.app/join`
- **Projector:** `https://the-connection.vercel.app/screen`

Players can be on mobile data or any WiFi network — everything routes
over the internet through that one URL.

One free-tier caveat: Render's free plan spins the server down after
inactivity, so the first connection after a quiet period can take
~30-50 seconds to wake up. Open the host page a few minutes before the
event starts to warm it up, or use a paid "always on" instance if that
matters to you.

## Testing locally with multiple tabs

You don't need multiple devices to try it out:

1. Open `http://localhost:5173/host` in one tab — click **Create game**
   and note the 4-letter code.
2. Open `http://localhost:5173/join` in two more tabs (or two different
   browsers, so they get separate sessions) and join with that code
   under different team names.
3. Open `http://localhost:5173/screen` in a fourth tab and enter the same
   code to connect it (or visit `/screen?code=XXXX` directly).
4. Back on the host tab, click **Start game**, then walk through
   **Reveal next clue**, submit answers from the player tabs, **Reveal
   answer**, and **Next question**.

Team sessions are tied to the browser tab's socket connection (via
`sessionStorage`), so separate tabs act as separate teams as long as
they're not sharing the same private/incognito session.

## Editing the questions

Everything about the questions lives in `server/src/questions.ts` — round
names, per-clue point values, and the question bank itself. The number of
questions per round is however many questions you list with that
`round` number; nothing about round sizes is hardcoded elsewhere. Each
question needs exactly 4 clues and an `acceptedAnswers` list (already
lowercase/trimmed — punctuation, hyphens, and extra spaces are normalized
automatically when a player submits, so you don't need to list every
variant).

8 sample questions are included across all 4 rounds so you can test the
whole flow immediately; add more before the real event.

## A couple of implementation notes

- The server is authoritative for everything that matters competitively:
  score, correctness, the current clue/question, the timer, and which
  teams are locked out. Clients only ever display what the server sends.
- If a player's phone refreshes or briefly drops connection, they
  reconnect into the current game state automatically (their team is
  remembered for the browser session). The host and projector reconnect
  the same way if the page is reloaded.
- `client/src/types.ts` intentionally duplicates the public shapes from
  `server/src/types.ts` rather than sharing a package — for a project
  this size, a shared workspace/package added more setup than it saved.
  If you change the server's public state shape, update both files.
- The server accepts cross-origin requests from anywhere (`cors: "*"`),
  which is what lets the Vercel-hosted client talk to the Render-hosted
  server. Fine for a low-stakes one-night event; not something you'd
  want on a long-lived public app.
