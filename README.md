# Midnight Mafia — web edition (Colyseus + React)

Real-time, room-code party Mafia. A **shared display** (TV/laptop browser) shows
the room code + QR and narrates aloud; everyone else plays on their **phone**.
Secret roles never leave the server — each player is told only their own role.

```
server/   Node + Colyseus authoritative game server (TypeScript)
client/   React + Vite web app (display + phone)
```

## 1) Run it locally

Two terminals.

**Server**
```bash
cd server
npm install
npm run dev            # ws + http on http://localhost:2567
```

**Client**
```bash
cd client
npm install
cp .env.example .env   # VITE_SERVER_URL=http://localhost:2567
npm run dev            # opens http://localhost:5173
```

Open `http://localhost:5173` → **Open the display**. On your phone (same Wi-Fi,
use your computer's LAN IP, e.g. `http://192.168.1.20:5173`) → scan the QR or
enter the code. Need 4+ players to start.

## 2) How it's built

- **Rooms & reconnection** are Colyseus built-ins. The display calls `create`;
  players resolve their 4-letter code to a room via `GET /api/room/:code`, then
  join. First player to join is the **admin** and can also drive the game.
- **Secret roles:** only public info (names, alive, phase, narration) is in the
  synced state. Each player's role is sent privately with a `you` message, so no
  client ever receives anyone else's role. Roles are revealed in state only when
  the game ends.
- **Reconnect:** a dropped phone (refresh/close) auto-rejoins its seat for up to
  5 minutes using the stored reconnection token.
- **Narration** is spoken by the display's browser (Web Speech API).

## 3) Deploy (free / cheap stack)

**Client → static host (free):** Cloudflare Pages, Netlify, or Vercel.
```bash
cd client && npm run build      # outputs dist/
```
Deploy `dist/`. Set the env var **VITE_SERVER_URL** to your server's public
https URL (below) and rebuild. The QR/join links use the client's own origin, so
once the client has a public URL, phones can join from anywhere.

**Server → one always-on host** (a WebSocket server can't be static):

- *Cheapest free:* an **Oracle Cloud Always-Free VM**. Install Node, `npm install`,
  `npm run build`, run with `pm2 start build/index.js`. Put Nginx + Certbot in
  front for HTTPS (needed so an https client can reach a wss server). $0.
- *Easiest paid (~$2–5/mo):* **Fly.io** (`fly launch` uses the included
  `server/Dockerfile`), **Railway**, or **Render** (use a paid instance — the
  free one sleeps and would drop live games). All support WebSockets and give you
  HTTPS automatically.
- The server reads `PORT` from the environment, so these platforms work as-is.

**Important:** the client is https, so the server must be **https/wss** in
production (a plain-http server will be blocked by the browser). The managed
hosts give you TLS automatically; on a VM use Nginx + Let's Encrypt.

After deploying the server, set `VITE_SERVER_URL=https://your-server-url` in the
client host's env and redeploy the client.

## Notes / next steps

- Single server instance (rooms live in memory). Plenty for many parties; for
  multi-server later, move the code→room map and state to Redis.
- Reconnect keys on the token (covers refresh/close within 5 min). Longer-gap
  rejoin is a good follow-up.
- Accounts/sign-ups and billing are the next phase (Supabase Auth + Postgres).
