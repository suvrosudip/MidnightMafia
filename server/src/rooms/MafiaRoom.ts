import { Room, Client } from "colyseus";
import { MafiaState, PlayerState } from "./schema";
import { codeToRoom } from "../registry";

type Role = "mafia" | "doctor" | "detective" | "villager";

const ROLE_NAME: Record<Role, string> = {
  mafia: "Mafia", doctor: "Doctor", detective: "Detective", villager: "Villager",
};
const BLURB: Record<Role, string> = {
  mafia: "Each night, you and your partners choose someone to eliminate. By day, lie convincingly.",
  doctor: "Each night, choose one person to protect. If the mafia strike them, they live.",
  detective: "Each night, investigate one person to learn whether they are mafia.",
  villager: "No special powers — only your voice and your vote. Find the mafia before they find you.",
};

export class MafiaRoom extends Room<MafiaState> {
  maxClients = 32;

  private roles = new Map<string, Role>();        // sessionId -> role (SECRET, server-only)
  private displayId = "";                          // the TV/display client
  private nightTargets = new Map<string, string>(); // sessionId -> targetSessionId
  private votes = new Map<string, string>();
  private priv = new Map<string, any>();           // sessionId -> private bundle sent to that client

  onCreate() {
    this.setState(new MafiaState());
    const code = this.uniqueCode();
    this.state.code = code;
    this.setMetadata({ code });
    codeToRoom.set(code, this.roomId);

    this.onMessage("start", (c) => { if (this.canControl(c)) this.startGame(); });
    this.onMessage("continue", (c) => { if (this.canControl(c)) this.continue(); });
    this.onMessage("force", (c) => { if (this.canControl(c)) this.forceResolve(); });
    this.onMessage("reset", (c) => { if (this.canControl(c)) this.resetToLobby(); });
    this.onMessage("night-action", (c, m) => this.setNightAction(c, m?.targetId));
    this.onMessage("vote", (c, m) => this.setVote(c, m?.targetId));
  }

  onJoin(client: Client, options: any) {
    if (options?.display) { this.displayId = client.sessionId; return; }
    const p = new PlayerState();
    p.name = (String(options?.name || "Player").slice(0, 16)) || "Player";
    p.isAdmin = this.state.players.size === 0; // first player is admin
    this.state.players.set(client.sessionId, p);
    this.pushPrivate(client.sessionId);
  }

  async onLeave(client: Client, consented: boolean) {
    const p = this.state.players.get(client.sessionId);
    if (p) p.connected = false;
    if (this.displayId === client.sessionId) this.displayId = "";
    try {
      if (consented) throw new Error("left");
      await this.allowReconnection(client, 300); // 5 min to come back (refresh/close)
      const pr = this.state.players.get(client.sessionId);
      if (pr) pr.connected = true;
      this.pushPrivate(client.sessionId); // resend their secret role
    } catch {
      if (this.state.phase === "lobby") {
        this.state.players.delete(client.sessionId);
        this.roles.delete(client.sessionId);
        this.priv.delete(client.sessionId);
        this.ensureAdmin();
      }
    }
  }

  onDispose() { codeToRoom.delete(this.state.code); }

  // ---------------- helpers ----------------
  private uniqueCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    do { code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""); }
    while (codeToRoom.has(code));
    return code;
  }
  private canControl(c: Client) {
    return c.sessionId === this.displayId || !!this.state.players.get(c.sessionId)?.isAdmin;
  }
  private clientById(sid: string) { return this.clients.find((c) => c.sessionId === sid); }
  private pushPrivate(sid: string) {
    const b = this.priv.get(sid); const c = this.clientById(sid);
    if (b && c) c.send("you", b);
  }
  private ensureAdmin() {
    const players = [...this.state.players.values()];
    if (players.length && !players.some((p) => p.isAdmin)) players[0].isAdmin = true;
  }
  private aliveEntries(): [string, PlayerState][] {
    return [...this.state.players.entries()].filter(([, p]) => p.alive);
  }
  private narrate(text: string) { this.state.narration = text; }

  // ---------------- flow ----------------
  private startGame() {
    if (this.state.phase !== "lobby" || this.state.players.size < 4) return;
    this.assignRoles();
    this.state.round = 1;
    this.beginNight();
  }

  private assignRoles() {
    const ids = [...this.state.players.keys()];
    const n = ids.length;
    const mafia = n >= 10 ? 3 : n >= 7 ? 2 : 1;
    const pool: Role[] = [];
    for (let i = 0; i < mafia; i++) pool.push("mafia");
    pool.push("doctor", "detective");
    while (pool.length < n) pool.push("villager");
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.roles.clear(); this.priv.clear();
    ids.forEach((sid, i) => {
      const role = pool[i];
      this.roles.set(sid, role);
      const p = this.state.players.get(sid)!;
      p.alive = true; p.revealedRole = ""; p.hasActed = false; p.hasVoted = false;
    });
    ids.forEach((sid) => {
      const role = this.roles.get(sid)!;
      const bundle: any = { role, roleName: ROLE_NAME[role], blurb: BLURB[role] };
      if (role === "mafia") {
        bundle.partners = ids
          .filter((s) => s !== sid && this.roles.get(s) === "mafia")
          .map((s) => this.state.players.get(s)!.name);
      }
      this.priv.set(sid, bundle);
    });
    ids.forEach((sid) => this.pushPrivate(sid));
  }

  private beginNight() {
    this.state.phase = "night";
    this.nightTargets.clear();
    this.state.players.forEach((p) => (p.hasActed = false));
    this.narrate("Night falls over the town. Everyone, close your eyes. In the dark, the mafia choose their victim, the doctor moves to save a life, and the detective searches for the truth. Make your choices now.");
  }

  private setNightAction(c: Client, targetId?: string) {
    if (this.state.phase !== "night" || !targetId) return;
    const me = this.state.players.get(c.sessionId);
    const role = this.roles.get(c.sessionId);
    if (!me || !me.alive || !role || role === "villager") return;
    if (!this.state.players.get(targetId)) return;
    this.nightTargets.set(c.sessionId, targetId);
    me.hasActed = true;

    const done = this.aliveEntries().every(([sid]) => {
      const r = this.roles.get(sid);
      return r === "villager" ? true : this.nightTargets.has(sid);
    });
    if (done) this.resolveNight();
  }

  private resolveNight() {
    const alive = this.aliveEntries();
    const mafiaTally: Record<string, number> = {};
    alive.forEach(([sid]) => {
      if (this.roles.get(sid) === "mafia") {
        const t = this.nightTargets.get(sid);
        if (t) mafiaTally[t] = (mafiaTally[t] || 0) + 1;
      }
    });
    let target: string | undefined; let best = -1;
    for (const [t, c] of Object.entries(mafiaTally)) if (c > best) { best = c; target = t; }

    const doctorSid = alive.find(([sid]) => this.roles.get(sid) === "doctor")?.[0];
    const save = doctorSid ? this.nightTargets.get(doctorSid) : undefined;

    const detSid = alive.find(([sid]) => this.roles.get(sid) === "detective")?.[0];
    if (detSid) {
      const t = this.nightTargets.get(detSid);
      if (t) {
        const tp = this.state.players.get(t); const tr = this.roles.get(t);
        const b = this.priv.get(detSid) || {};
        b.investigation = `Your investigation: ${tp?.name} is ${tr === "mafia" ? "MAFIA." : "not mafia."}`;
        this.priv.set(detSid, b);
        this.pushPrivate(detSid);
      }
    }

    let deadName = "", deadRole = "";
    if (target && target !== save) {
      const victim = this.state.players.get(target);
      if (victim && victim.alive) { victim.alive = false; deadName = victim.name; deadRole = ROLE_NAME[this.roles.get(target)!]; }
    }

    this.state.phase = "night_result";
    this.narrate(deadName
      ? `Dawn breaks over the town. As everyone awakens, they find ${deadName} cold and still. ${deadName} was the ${deadRole}. Suspicion hangs heavy in the morning air.`
      : "Dawn breaks, and to everyone's relief, all are still breathing. A life was protected in the night.");
  }

  private continue() {
    if (this.state.phase === "night_result") {
      const w = this.checkWinner(); if (w) return this.endGame(w);
      this.beginDay();
    } else if (this.state.phase === "day_result") {
      const w = this.checkWinner(); if (w) return this.endGame(w);
      this.state.round++; this.beginNight();
    }
  }

  private beginDay() {
    this.state.phase = "day";
    this.votes.clear();
    this.state.players.forEach((p) => (p.hasVoted = false));
    this.narrate("The town square fills with voices. Accuse, defend, and decide. When you are ready, cast your votes — one among you must be sent away.");
  }

  private setVote(c: Client, targetId?: string) {
    if (this.state.phase !== "day" || !targetId) return;
    const me = this.state.players.get(c.sessionId);
    if (!me || !me.alive || !this.state.players.get(targetId)) return;
    this.votes.set(c.sessionId, targetId);
    me.hasVoted = true;
    const done = this.aliveEntries().every(([sid]) => this.votes.has(sid));
    if (done) this.resolveDay();
  }

  private resolveDay() {
    const tally: Record<string, number> = {};
    for (const [sid, t] of this.votes) if (this.state.players.get(sid)?.alive) tally[t] = (tally[t] || 0) + 1;
    let top = -1, tie = false, elim: string | undefined;
    for (const [t, c] of Object.entries(tally)) {
      if (c > top) { top = c; elim = t; tie = false; } else if (c === top) tie = true;
    }
    let name = "", role = "";
    if (elim && !tie && top > 0) {
      const p = this.state.players.get(elim);
      if (p) { p.alive = false; name = p.name; role = ROLE_NAME[this.roles.get(elim)!]; }
    }
    this.state.phase = "day_result";
    this.narrate(name
      ? `The town has reached a verdict. ${name} is cast out, protesting to the last. ${name} was the ${role}.`
      : "The vote is split, and no one is sent away today. The mafia smile quietly to themselves.");
  }

  private checkWinner(): "mafia" | "town" | "" {
    const alive = this.aliveEntries();
    const maf = alive.filter(([sid]) => this.roles.get(sid) === "mafia").length;
    const town = alive.length - maf;
    if (maf === 0) return "town";
    if (maf >= town) return "mafia";
    return "";
  }

  private endGame(w: "mafia" | "town") {
    this.state.winner = w;
    this.state.phase = "ended";
    this.state.players.forEach((p, sid) => { p.revealedRole = ROLE_NAME[this.roles.get(sid) || "villager"]; });
    this.narrate(w === "mafia"
      ? "One by one, the innocent fell, and now the night belongs to them. The mafia have taken the town. The mafia win."
      : "The last of the mafia is dragged into the light. The town is safe once more. The town wins.");
  }

  private forceResolve() {
    if (this.state.phase === "night") this.resolveNight();
    else if (this.state.phase === "day") this.resolveDay();
  }

  private resetToLobby() {
    this.state.phase = "lobby";
    this.state.round = 0;
    this.state.winner = "";
    this.state.narration = "Waiting for players to join…";
    this.roles.clear(); this.priv.clear(); this.nightTargets.clear(); this.votes.clear();
    this.state.players.forEach((p) => { p.alive = true; p.hasActed = false; p.hasVoted = false; p.revealedRole = ""; });
    this.clients.forEach((c) => c.send("you", { role: "", roleName: "", blurb: "" }));
  }
}
