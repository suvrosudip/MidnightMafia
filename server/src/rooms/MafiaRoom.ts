import { Room, Client } from "colyseus";
import { MafiaState, PlayerState } from "./schema";
import { codeToRoom } from "../registry";

type Role = "mafia" | "godfather" | "doctor" | "detective" | "vigilante" | "jester" | "villager";

const ROLE_NAME: Record<Role, string> = {
  mafia: "Mafia", godfather: "Godfather", doctor: "Doctor", detective: "Detective",
  vigilante: "Vigilante", jester: "Jester", villager: "Villager",
};
const BLURB: Record<Role, string> = {
  mafia: "Each night, you and your fellow mafia choose someone to eliminate. By day, lie convincingly.",
  godfather: "You lead the mafia's kill each night — and to the Detective, you read as innocent. Hide in plain sight.",
  doctor: "Each night, choose one person to protect. If they are attacked, they live.",
  detective: "Each night, investigate one person to learn whether they serve the mafia.",
  vigilante: "You carry a loaded pistol. On a night of your choosing you may take a shot — but be sure of your aim.",
  jester: "You answer to no one. You win outright if the town votes YOU out during the day. Act guilty.",
  villager: "No special powers — only your voice and your vote. Find the mafia before they find you.",
};
const MAFIA_ALIGN = (r: Role | undefined) => r === "mafia" || r === "godfather";

export class MafiaRoom extends Room<MafiaState> {
  maxClients = 32;

  private roles = new Map<string, Role>();
  private displayId = "";
  private nightTargets = new Map<string, string>(); // sid -> targetId | "skip"
  private votes = new Map<string, string>();
  private priv = new Map<string, any>();
  private vigShots = new Map<string, number>();
  private selfHealLastRound = new Map<string, number>();
  private selfHealUsed = new Map<string, number>();
  private jesterWon = false;

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
    this.onMessage("settings", (c, m) => { if (this.canControl(c) && this.state.phase === "lobby") this.applySettings(m); });
    this.onMessage("night-action", (c, m) => this.setNightAction(c, m?.targetId));
    this.onMessage("vote", (c, m) => this.setVote(c, m?.targetId));
  }

  onJoin(client: Client, options: any) {
    if (options?.display) { this.displayId = client.sessionId; return; }
    const p = new PlayerState();
    p.name = (String(options?.name || "Player").slice(0, 16)) || "Player";
    p.isAdmin = this.state.players.size === 0;
    this.state.players.set(client.sessionId, p);
    this.pushPrivate(client.sessionId);
  }

  async onLeave(client: Client, consented: boolean) {
    const p = this.state.players.get(client.sessionId);
    if (p) p.connected = false;
    if (this.displayId === client.sessionId) this.displayId = "";
    try {
      if (consented) throw new Error("left");
      await this.allowReconnection(client, 300);
      const pr = this.state.players.get(client.sessionId);
      if (pr) pr.connected = true;
      this.pushPrivate(client.sessionId);
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
  private joinNames(a: string[]): string {
    return a.length <= 1 ? (a[0] || "") : a.length === 2 ? `${a[0]} and ${a[1]}` : `${a.slice(0, -1).join(", ")}, and ${a[a.length - 1]}`;
  }

  private applySettings(p: any) {
    if (!p || typeof p !== "object") return;
    const s = this.state.settings;
    if (p.mafiaMode === "auto" || p.mafiaMode === "fixed") s.mafiaMode = p.mafiaMode;
    if (typeof p.mafiaCount === "number") s.mafiaCount = Math.max(1, Math.min(5, Math.floor(p.mafiaCount)));
    (["doctor", "detective", "vigilante", "godfather", "jester"] as const).forEach((k) => {
      if (typeof p[k] === "boolean") (s as any)[k] = p[k];
    });
    if (["never", "once", "alternate", "always"].includes(p.selfHeal)) s.selfHeal = p.selfHeal;
  }

  // ---------------- flow ----------------
  private startGame() {
    if (this.state.phase !== "lobby" || this.state.players.size < this.state.settings.minPlayers) return;
    this.jesterWon = false;
    this.assignRoles();
    this.state.round = 1;
    this.beginNight();
  }

  private buildPool(n: number): Role[] {
    const s = this.state.settings;
    let maf = s.mafiaMode === "fixed" ? s.mafiaCount : (n >= 10 ? 3 : n >= 7 ? 2 : 1);
    maf = Math.max(1, Math.min(maf, Math.max(1, Math.floor((n - 1) / 2))));
    const pool: Role[] = [];
    for (let i = 0; i < maf; i++) pool.push("mafia");
    if (s.godfather && pool.length) pool[0] = "godfather";
    const add = (r: Role) => { if (pool.length < n) pool.push(r); };
    if (s.detective) add("detective");
    if (s.doctor) add("doctor");
    if (s.vigilante && n >= 6) add("vigilante");
    if (s.jester && n >= 6) add("jester");
    while (pool.length < n) pool.push("villager");
    return pool.slice(0, n);
  }

  private assignRoles() {
    const ids = [...this.state.players.keys()];
    const n = ids.length;
    const pool = this.buildPool(n);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    this.roles.clear(); this.priv.clear(); this.vigShots.clear();
    this.selfHealLastRound.clear(); this.selfHealUsed.clear();
    ids.forEach((sid, i) => {
      const role = pool[i];
      this.roles.set(sid, role);
      if (role === "vigilante") this.vigShots.set(sid, n >= 10 ? 2 : 1);
      const p = this.state.players.get(sid)!;
      p.alive = true; p.revealedRole = ""; p.hasActed = false; p.hasVoted = false;
    });
    ids.forEach((sid) => {
      const role = this.roles.get(sid)!;
      const bundle: any = { role, roleName: ROLE_NAME[role], blurb: BLURB[role] };
      if (MAFIA_ALIGN(role)) {
        bundle.partners = ids.filter((s) => s !== sid && MAFIA_ALIGN(this.roles.get(s)))
          .map((s) => this.state.players.get(s)!.name);
      }
      if (role === "vigilante") bundle.shots = this.vigShots.get(sid) || 0;
      this.priv.set(sid, bundle);
    });
    ids.forEach((sid) => this.pushPrivate(sid));
  }

  private canHealSelf(sid: string): boolean {
    const s = this.state.settings.selfHeal;
    if (s === "never") return false;
    if (s === "always") return true;
    if (s === "once") return (this.selfHealUsed.get(sid) || 0) < 1;
    return this.selfHealLastRound.get(sid) !== (this.state.round - 1); // alternate
  }
  private actsAtNight(sid: string): boolean {
    const r = this.roles.get(sid);
    if (r === "mafia" || r === "godfather" || r === "doctor" || r === "detective") return true;
    if (r === "vigilante") return (this.vigShots.get(sid) || 0) > 0;
    return false;
  }

  private beginNight() {
    this.state.phase = "night";
    this.nightTargets.clear();
    this.state.players.forEach((p) => (p.hasActed = false));
    // refresh per-night private info
    this.state.players.forEach((p, sid) => {
      if (!p.alive) return;
      const role = this.roles.get(sid);
      const b = this.priv.get(sid) || {};
      if (role === "doctor") b.canHealSelf = this.canHealSelf(sid);
      if (role === "vigilante") b.shots = this.vigShots.get(sid) || 0;
      if (role === "detective") delete b.investigation;
      this.priv.set(sid, b);
      this.pushPrivate(sid);
    });
    this.narrate("Night falls over the town. Everyone, close your eyes. In the dark, the mafia choose their victim, and those gifted to save or to see make their move. Make your choices now.");
  }

  private setNightAction(c: Client, targetId?: string) {
    if (this.state.phase !== "night" || !targetId) return;
    const me = this.state.players.get(c.sessionId);
    const role = this.roles.get(c.sessionId);
    if (!me || !me.alive || !role || !this.actsAtNight(c.sessionId)) return;
    if (targetId === "skip" && role !== "vigilante") return;
    if (targetId !== "skip" && !this.state.players.get(targetId)?.alive) return;
    if (role === "doctor" && targetId === c.sessionId && !this.canHealSelf(c.sessionId)) return;
    this.nightTargets.set(c.sessionId, targetId);
    me.hasActed = true;
    const done = this.aliveEntries().every(([sid]) => !this.actsAtNight(sid) || this.nightTargets.has(sid));
    if (done) this.resolveNight();
  }

  private resolveNight() {
    const alive = this.aliveEntries();

    // mafia target (vote among mafia-aligned)
    const tally: Record<string, number> = {};
    alive.forEach(([sid]) => {
      if (MAFIA_ALIGN(this.roles.get(sid))) {
        const t = this.nightTargets.get(sid);
        if (t && t !== "skip") tally[t] = (tally[t] || 0) + 1;
      }
    });
    let mafiaTarget: string | undefined; let best = -1;
    for (const [t, c] of Object.entries(tally)) if (c > best) { best = c; mafiaTarget = t; }

    // doctor protection
    const doctorSid = alive.find(([sid]) => this.roles.get(sid) === "doctor")?.[0];
    const save = doctorSid ? this.nightTargets.get(doctorSid) : undefined;
    if (doctorSid && save && save === doctorSid) {
      this.selfHealLastRound.set(doctorSid, this.state.round);
      this.selfHealUsed.set(doctorSid, (this.selfHealUsed.get(doctorSid) || 0) + 1);
    }

    // detective (godfather reads innocent)
    const detSid = alive.find(([sid]) => this.roles.get(sid) === "detective")?.[0];
    if (detSid) {
      const t = this.nightTargets.get(detSid);
      if (t && t !== "skip") {
        const tp = this.state.players.get(t); const reads = this.roles.get(t) === "mafia";
        const b = this.priv.get(detSid) || {};
        b.investigation = `Your investigation: ${tp?.name} is ${reads ? "MAFIA." : "not mafia."}`;
        this.priv.set(detSid, b); this.pushPrivate(detSid);
      }
    }

    // attacks: mafia kill + vigilante shots, minus doctor save
    const attacked = new Set<string>();
    if (mafiaTarget) attacked.add(mafiaTarget);
    alive.forEach(([sid]) => {
      if (this.roles.get(sid) === "vigilante") {
        const t = this.nightTargets.get(sid);
        if (t && t !== "skip" && (this.vigShots.get(sid) || 0) > 0) {
          attacked.add(t); this.vigShots.set(sid, (this.vigShots.get(sid) || 0) - 1);
        }
      }
    });
    if (save && save !== "skip") attacked.delete(save);

    const deaths: string[] = [];
    attacked.forEach((t) => {
      const v = this.state.players.get(t);
      if (v && v.alive) { v.alive = false; deaths.push(`${v.name} (the ${ROLE_NAME[this.roles.get(t)!]})`); }
    });

    this.state.phase = "night_result";
    this.narrate(deaths.length
      ? `Dawn breaks over the town. As everyone awakens, they find ${this.joinNames(deaths)} cold and still. Suspicion hangs heavy in the morning air.`
      : "Dawn breaks, and to everyone's relief, all are still breathing. A life was protected in the night.");
  }

  private continue() {
    if (this.state.phase === "night_result") {
      const w = this.checkWinner(); if (w) return this.endGame(w);
      this.beginDay();
    } else if (this.state.phase === "day_result") {
      if (this.jesterWon) return this.endGame("jester");
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
    if (!me || !me.alive || !this.state.players.get(targetId)?.alive) return;
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
    let name = "", role = "", roleKey: Role | undefined;
    if (elim && !tie && top > 0) {
      const p = this.state.players.get(elim);
      if (p) { p.alive = false; name = p.name; roleKey = this.roles.get(elim)!; role = ROLE_NAME[roleKey]; }
    }
    this.state.phase = "day_result";
    if (roleKey === "jester") {
      this.jesterWon = true;
      this.narrate(`The town turns on ${name} and casts them out — only to catch a wide, knowing grin spreading across their face. ${name} was the Jester, and this was exactly what they wanted.`);
      return;
    }
    this.narrate(name
      ? `The town has reached a verdict. ${name} is cast out, protesting to the last. ${name} was the ${role}.`
      : "The vote is split, and no one is sent away today. The mafia smile quietly to themselves.");
  }

  private checkWinner(): "mafia" | "town" | "" {
    const alive = this.aliveEntries();
    const maf = alive.filter(([sid]) => MAFIA_ALIGN(this.roles.get(sid))).length;
    const others = alive.length - maf;
    if (maf === 0) return "town";
    if (maf >= others) return "mafia";
    return "";
  }

  private endGame(w: "mafia" | "town" | "jester") {
    this.state.winner = w;
    this.state.phase = "ended";
    this.state.players.forEach((p, sid) => { p.revealedRole = ROLE_NAME[this.roles.get(sid) || "villager"]; });
    this.narrate(
      w === "mafia" ? "One by one the innocent fell, and now the night belongs to them. The mafia have taken the town. The mafia win."
        : w === "town" ? "The last of the mafia is dragged into the light. The town is safe once more. The town wins."
          : "The Jester wanted nothing but their own undoing — and the town obliged. By that grim design, the Jester alone has won.");
  }

  private forceResolve() {
    if (this.state.phase === "night") this.resolveNight();
    else if (this.state.phase === "day") this.resolveDay();
  }

  private resetToLobby() {
    this.state.phase = "lobby";
    this.state.round = 0;
    this.state.winner = "";
    this.jesterWon = false;
    this.state.narration = "Waiting for players to join…";
    this.roles.clear(); this.priv.clear(); this.nightTargets.clear(); this.votes.clear();
    this.vigShots.clear(); this.selfHealLastRound.clear(); this.selfHealUsed.clear();
    this.state.players.forEach((p) => { p.alive = true; p.hasActed = false; p.hasVoted = false; p.revealedRole = ""; });
    this.clients.forEach((c) => c.send("you", { role: "", roleName: "", blurb: "" }));
  }
}
