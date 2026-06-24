import { useEffect, useRef, useState } from "react";
import { Room } from "colyseus.js";
import { QRCodeSVG } from "qrcode.react";
import { createDisplay, joinByCode, reconnect, snapshot, Snap, PlayerSnap, Settings } from "./net";
import { narrate, stopNarration, primeNarration, testNarration, initNarration, narrationMode, speechStatus } from "./narrator";
import Atmosphere from "./Atmosphere";
import { Crest } from "./Crest";
import { RoleArt } from "./RoleArt";

type Mode = "home" | "display" | "player";
type You = { role: string; roleName: string; blurb: string; partners?: string[]; investigation?: string; canHealSelf?: boolean; shots?: number };

export default function App() {
  const [mode, setMode] = useState<Mode>("home");
  const [snap, setSnap] = useState<Snap | null>(null);
  const [you, setYou] = useState<You | null>(null);
  const [sid, setSid] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [choice, setChoice] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [ttsWarn, setTtsWarn] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const lastSpoken = useRef("");
  const lastPhase = useRef("");
  const tried = useRef(false);

  // attach listeners to a room
  function attach(room: Room, isDisplay: boolean) {
    roomRef.current = room;
    setSid(room.sessionId);
    const update = () => setSnap(snapshot(room.state));
    room.onStateChange(update);
    update();
    if (!isDisplay) {
      room.onMessage("you", (m: You) => setYou(m && m.role ? m : null));
      // persist for reconnection after refresh/close
      try { localStorage.setItem("mm", JSON.stringify({ token: room.reconnectionToken, name })); } catch {}
    }
    room.onError(() => setError("Connection error."));
  }

  // first load: ?code prefill + try to reconnect a dropped session
  useEffect(() => {
    if (tried.current) return;
    tried.current = true;
    const params = new URLSearchParams(window.location.search);
    const c = params.get("code");
    if (c) setCode(c.toUpperCase());

    (async () => {
      let saved: any = null;
      try { saved = JSON.parse(localStorage.getItem("mm") || "null"); } catch {}
      if (saved?.token) {
        try {
          const room = await reconnect(saved.token);
          setName(saved.name || "");
          attach(room, false);
          setMode("player");
          return;
        } catch { try { localStorage.removeItem("mm"); } catch {} }
      }
      if (c) setMode("player");
    })();
  }, []);

  // reset selection when the phase changes
  useEffect(() => {
    if (!snap) return;
    const key = snap.phase + ":" + snap.round;
    if (key !== lastPhase.current) { lastPhase.current = key; setChoice(null); }
    if (snap.phase === "lobby") setYou(null);
  }, [snap]);

  // theme the sky by phase / mode / winner
  useEffect(() => {
    const b = document.body;
    b.dataset.phase = snap?.phase ?? (mode === "home" ? "home" : "lobby");
    b.dataset.mode = mode;
    b.dataset.winner = snap?.winner ?? "";
  }, [snap, mode]);

  // display narrates aloud
  useEffect(() => {
    if (mode !== "display" || !snap || !voiceOn) return;
    if (snap.phase !== "lobby" && snap.narration !== lastSpoken.current) {
      lastSpoken.current = snap.narration;
      narrate(snap.narration);
    }
  }, [snap, mode, voiceOn]);

  // ---- actions ----
  async function openDisplay() {
    primeNarration(); // the click is a valid gesture to unlock audio on strict browsers
    try {
      const room = await createDisplay(); attach(room, true); setMode("display");
      const server = await initNarration();
      // Only warn if neither server audio nor a browser voice is available.
      if (server) setTtsWarn(false);
      else setTimeout(() => setTtsWarn(speechStatus() !== "ok"), 1500);
    }
    catch { setError("Could not open a room. Is the server running?"); }
  }
  async function doJoin() {
    setError("");
    try { const room = await joinByCode(code, name); attach(room, false); setMode("player"); }
    catch (e: any) { setError(e?.message || "Could not join."); }
  }
  function send(type: string, payload?: any) { roomRef.current?.send(type, payload); }
  function leave() {
    try { localStorage.removeItem("mm"); } catch {}
    stopNarration();
    roomRef.current?.leave(true);
    roomRef.current = null;
    setSnap(null); setYou(null); setMode("home"); setError(""); setChoice(null);
  }
  function toggleVoice() {
    setVoiceOn((v) => { if (v) stopNarration(); else { primeNarration(); lastSpoken.current = ""; } return !v; });
  }
  function simulate() {
    send("simulate", { count: 7 });
  }

  const me: PlayerSnap | undefined = snap?.players.find((p) => p.id === sid);
  const alive = snap?.players.filter((p) => p.alive) ?? [];
  const aliveOthers = alive.filter((p) => p.id !== sid);
  const joinUrl = `${window.location.origin}/?code=${snap?.code ?? ""}`;

  // ============================ HOME ============================
  if (mode === "home") {
    return (
      <Shell>
        <div className="card muted">A shared screen runs the show and reads the story aloud — everyone else plays from their phone.</div>
        <div className="card">
          <button className="btn solid full big" onClick={openDisplay}>📺&nbsp; Open the display</button>
          <div className="muted small mt">The narrator screen: shows the room code, a QR to scan, and speaks the game.</div>
          <div className="divider"><span>or</span></div>
          <label className="lbl">Room code</label>
          <input className="inp code" value={code} maxLength={4} placeholder="ABCD"
            onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <label className="lbl mt">Your name</label>
          <input className="inp" value={name} maxLength={16} placeholder="e.g. Sam"
            onChange={(e) => setName(e.target.value)} />
          <button className="btn ghost full mt" onClick={doJoin}>📱&nbsp; Join on your phone</button>
          {error && <div className="err">{error}</div>}
        </div>
      </Shell>
    );
  }

  // ============================ JOIN form when arriving via ?code ============================
  if (mode === "player" && !me && !snap) {
    return (
      <Shell>
        <div className="card">
          <label className="lbl">Room code</label>
          <input className="inp code" value={code} maxLength={4} placeholder="ABCD"
            onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <label className="lbl mt">Your name</label>
          <input className="inp" value={name} maxLength={16} placeholder="e.g. Sam"
            onChange={(e) => setName(e.target.value)} />
          <button className="btn solid full mt" onClick={doJoin}>Join game</button>
          {error && <div className="err">{error}</div>}
        </div>
        <button className="leave" onClick={leave}>← back</button>
      </Shell>
    );
  }

  if (!snap) return <Shell><div className="card muted">Connecting…</div></Shell>;

  // ============================ DISPLAY ============================
  if (mode === "display") {
    return (
      <Shell>
        {ttsWarn && (
          <div className="notice">
            <b>No voice on this screen.</b> This TV’s browser can’t do spoken narration — but the story always appears on screen below, so the game plays fine. For a narrator voice, cast a Chrome tab to the TV or open <b>{window.location.host}</b> on a laptop/phone and use that as the display.
            <button className="btn ghost sm" onClick={() => setTtsWarn(false)}>Dismiss</button>
          </div>
        )}
        {snap.phase === "lobby" ? (
          <div className="card center">
            <div className="qr"><QRCodeSVG value={joinUrl} size={210} /></div>
            <div className="muted small">scan to join</div>
            <div className="lbl mt">or open {window.location.host} and enter code</div>
            <div className="bigcode">{snap.code}</div>
            <Roster players={snap.players} />
            <LobbySettings snap={snap} send={send} canEdit={true} />
            <div className="bar center">
              <button className="btn solid" disabled={snap.players.length < snap.settings.minPlayers} onClick={() => send("start")}>Start game</button>
              <button className="btn ghost" onClick={toggleVoice}>🔊 Voice {voiceOn ? "on" : "off"}</button>
              <button className="btn ghost" onClick={testNarration}>🔊 Test voice</button>
            </div>
            <div className="bar center">
              <button className="btn ghost" onClick={simulate}>▶ Simulate a game</button>
            </div>
            <div className="muted small">{snap.players.length} / {snap.settings.minPlayers} players minimum · ★ = admin</div>
            <div className="muted small">No one to play with? <b>Simulate</b> fills the room with bots and plays a full game itself.</div>
          </div>
        ) : (
          <>
            <Narration text={snap.narration} />
            <div className="card">
              <div className="row">
                <span className={"tag p-" + snap.phase}>{phaseLabel(snap.phase)}</span>
                <span className="muted small">Round {snap.round} · {alive.length} alive</span>
                {snap.simulating && <span className="simpill">◆ Simulation</span>}
              </div>
              <Roster players={snap.players} />
            </div>
            {snap.phase === "ended" ? (
              <>
                <Reveal snap={snap} />
                <div className="bar"><button className="btn solid" onClick={() => send("reset")}>New game</button>
                  <button className="btn ghost" onClick={toggleVoice}>🔊 Voice {voiceOn ? "on" : "off"}</button></div>
              </>
            ) : (
              <div className="bar">
                {snap.phase === "night_result" || snap.phase === "day_result"
                  ? <button className="btn solid" onClick={() => send("continue")}>Continue →</button>
                  : <button className="btn ghost" onClick={() => send("force")}>⏭ Skip ahead</button>}
                <button className="btn ghost" onClick={() => narrate(snap.narration)}>🔁 Replay</button>
                <button className="btn ghost" onClick={toggleVoice}>🔊 Voice {voiceOn ? "on" : "off"}</button>
                {snap.simulating && <button className="btn ghost" onClick={() => send("reset")}>■ Stop sim</button>}
              </div>
            )}
          </>
        )}
        <button className="leave" onClick={leave}>← close display</button>
      </Shell>
    );
  }

  // ============================ PLAYER (phone) ============================
  if (!me) return <Shell><div className="card muted">Joining…</div></Shell>;

  return (
    <Shell>
      {snap.phase === "lobby" ? (
        <div className="card">
          <div className="muted">You’re in <b style={{ color: "var(--candle)" }}>{snap.code}</b> as <b style={{ color: "var(--candle)" }}>{me.name}</b>{me.isAdmin ? " (admin ★)" : ""}.</div>
          <Chips players={snap.players} sid={sid} />
          <LobbySettings snap={snap} send={send} canEdit={me.isAdmin} />
          {me.isAdmin
            ? <><button className="btn solid full mt" disabled={snap.players.length < snap.settings.minPlayers} onClick={() => send("start")}>Start game</button>
                <div className="muted small mt">You’re the admin · {snap.players.length} / {snap.settings.minPlayers} minimum</div></>
            : <div className="muted mt">Waiting for the admin to start… ({snap.players.length} here)</div>}
        </div>
      ) : (
        <>
          {you && (
            <div className="rolecard" style={{ borderColor: roleColor(you.roleName) }}>
              <div className="roleart">
                <RoleArt name={you.roleName} />
                <div className="artcaption">
                  <span className="artcrest" style={{ color: roleColor(you.roleName) }}><Crest name={you.roleName} size={22} /></span>
                  <div>
                    <div className="arteyebrow">You are the</div>
                    <div className="artname" style={{ color: roleColor(you.roleName) }}>{you.roleName}{me.alive ? "" : " — out"}</div>
                  </div>
                </div>
              </div>
              <div className="muted">{you.blurb}</div>
              {you.partners?.length ? <div className="mates">Partners: {you.partners.join(", ")}</div> : null}
              {you.investigation ? <div className="priv">{you.investigation}</div> : null}
            </div>
          )}

          {snap.phase === "night" && me.alive && you && (
            (you.role === "mafia" || you.role === "godfather")
              ? <Picker title="Choose tonight’s victim." options={aliveOthers} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} />
            : you.role === "doctor"
              ? <Picker title={you.canHealSelf ? "Choose who to protect — you may pick yourself." : "Choose who to protect. (You can’t heal yourself two nights running.)"} options={you.canHealSelf ? alive : aliveOthers} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} />
            : you.role === "detective"
              ? <Picker title="Choose who to investigate." options={aliveOthers} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} />
            : you.role === "vigilante"
              ? ((you.shots ?? 0) > 0
                  ? <Picker title={`Take a shot? You have ${you.shots} bullet${you.shots === 1 ? "" : "s"} left.`} options={aliveOthers} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} extraAction={{ label: "Hold fire", onClick: () => send("night-action", { targetId: "skip" }) }} />
                  : <div className="card muted">🔫 Your pistol is spent. Rest, and watch the others.</div>)
            : you.role === "jester"
              ? <div className="card muted">🃏 You scheme in the dark. Your aim: get the town to vote <b>you</b> out by day.</div>
            : <div className="card muted">😴 You sleep soundly. Watch the screen for the dawn.</div>
          )}

          {snap.phase === "day" && me.alive && (
            <Picker title="Vote to send someone away." options={aliveOthers} locked={me.hasVoted} choice={choice} setChoice={setChoice} onSubmit={() => send("vote", { targetId: choice })} />
          )}

          {(snap.phase === "night_result" || snap.phase === "day_result") && <div className="card muted">Look to the big screen…</div>}
          {!me.alive && snap.phase !== "ended" && <div className="card muted">👻 You’ve been eliminated. Watch quietly.</div>}
          {snap.phase === "ended" && <div className="card muted">{winnerTitle(snap.winner)}. The big screen has the full reveal.</div>}

          {me.isAdmin && (
            <div className="bar mt">
              {snap.phase === "night" || snap.phase === "day"
                ? <button className="btn ghost" onClick={() => send("force")}>⏭ Force {snap.phase === "night" ? "dawn" : "the vote"}</button>
                : snap.phase === "night_result" || snap.phase === "day_result"
                ? <button className="btn solid" onClick={() => send("continue")}>Continue →</button>
                : snap.phase === "ended"
                ? <button className="btn solid" onClick={() => send("reset")}>New game</button> : null}
              <span className="admintag">admin ★</span>
            </div>
          )}
        </>
      )}
      <button className="leave" onClick={leave}>← leave</button>
    </Shell>
  );
}

// ---------------- small components ----------------
function Shell({ children }: { children: any }) {
  return (
    <>
      <Atmosphere />
      <div className="wrap">
        <header className="hdr">
          <span className="crescent">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M14 2a10 10 0 1 0 8 16A8 8 0 0 1 14 2z" />
            </svg>
          </span>
          <div><div className="title">Midnight Mafia</div><div className="tagline">a narrated game of trust and betrayal</div></div>
        </header>
        {children}
      </div>
    </>
  );
}
function Narration({ text }: { text: string }) {
  return <div className="narr"><div className="narrlabel">◆ The Narrator</div><p>{text}</p></div>;
}
function Roster({ players }: { players: PlayerSnap[] }) {
  return <div className="roster">{players.map((p) => (
    <div key={p.id} className={"seat" + (p.alive ? "" : " out")}>{p.name} {p.isAdmin ? "★" : ""}{p.connected ? "" : " ⚪"}{p.bot ? <span className="botmark">bot</span> : null}</div>
  ))}{!players.length && <div className="muted">Waiting for players…</div>}</div>;
}
function Chips({ players, sid }: { players: PlayerSnap[]; sid: string }) {
  return <div className="chips mt">{players.map((p) => (
    <span key={p.id} className={"chip" + (p.id === sid ? " me" : "")}>{p.name} {p.isAdmin ? "★" : ""}{p.bot ? <span className="botmark">bot</span> : null}</span>
  ))}</div>;
}
function Picker({ title, options, locked, choice, setChoice, onSubmit, extraAction }:
  { title: string; options: PlayerSnap[]; locked: boolean; choice: string | null; setChoice: (s: string) => void; onSubmit: () => void; extraAction?: { label: string; onClick: () => void } }) {
  return (
    <div className="card">
      <div className="prompt">{title}</div>
      <div className="pickgrid">{options.map((p) => (
        <button key={p.id} className={"pick" + (choice === p.id ? " sel" : "")} disabled={locked} onClick={() => setChoice(p.id)}>{p.name}</button>
      ))}</div>
      {locked
        ? <div className="locked">Locked in. Waiting for the others…</div>
        : extraAction
          ? <div className="bar"><button className="btn solid" disabled={!choice} onClick={onSubmit}>Lock it in</button><button className="btn ghost" onClick={extraAction.onClick}>{extraAction.label}</button></div>
          : <button className="btn solid full" disabled={!choice} onClick={onSubmit}>Lock it in</button>}
    </div>
  );
}
function Reveal({ snap }: { snap: Snap }) {
  return (
    <div className="card result" style={{ borderColor: winnerColor(snap.winner) }}>
      <div className="resulttitle" style={{ color: winnerColor(snap.winner) }}>
        {winnerTitle(snap.winner)}</div>
      {snap.players.map((p) => (
        <div key={p.id} className="resultrow">
          <span className={p.alive ? "" : "dead"}>{p.name}</span>
          <span style={{ color: roleColor(p.revealedRole), display: "inline-flex", alignItems: "center", gap: "6px" }}><Crest name={p.revealedRole} size={15} /> {p.revealedRole}</span>
        </div>
      ))}
    </div>
  );
}
function LobbySettings({ snap, send, canEdit }: { snap: Snap; send: (t: string, p?: any) => void; canEdit: boolean }) {
  const s = snap.settings;
  const n = snap.players.length;
  const set = (patch: any) => send("settings", patch);
  if (!canEdit) {
    return (
      <div className="setsummary">
        Lineup for <b>{n}</b> player{n === 1 ? "" : "s"}: <b>{lineup(n, s)}</b>.
        <div className="mt">Doctor self-heal: <b>{selfHealLabel(s.selfHeal)}</b>.</div>
      </div>
    );
  }
  const Toggle = ({ k, label }: { k: keyof Settings; label: string }) => (
    <button className={"toggle" + ((s as any)[k] ? " on" : "")} onClick={() => set({ [k]: !(s as any)[k] })}>
      <span className="dot" />{label}
    </button>
  );
  return (
    <div className="settings">
      <div className="setlabel">Roles in play</div>
      <div className="togglerow">
        <Toggle k="detective" label="Detective" />
        <Toggle k="doctor" label="Doctor" />
        <Toggle k="vigilante" label="Vigilante" />
        <Toggle k="godfather" label="Godfather" />
        <Toggle k="jester" label="Jester" />
      </div>

      <div className="setlabel">Mafia count</div>
      <div className="seg">
        <button className={"segbtn" + (s.mafiaMode === "auto" ? " on" : "")} onClick={() => set({ mafiaMode: "auto" })}>Auto (scales)</button>
        <button className={"segbtn" + (s.mafiaMode === "fixed" ? " on" : "")} onClick={() => set({ mafiaMode: "fixed" })}>Fixed</button>
        {s.mafiaMode === "fixed" && (
          <span className="stepper">
            <button onClick={() => set({ mafiaCount: Math.max(1, s.mafiaCount - 1) })}>−</button>
            <span className="num">{s.mafiaCount}</span>
            <button onClick={() => set({ mafiaCount: Math.min(5, s.mafiaCount + 1) })}>+</button>
          </span>
        )}
      </div>

      <div className="setlabel">Doctor self-heal</div>
      <div className="seg">
        {([["never", "Never"], ["once", "Once"], ["alternate", "Every other night"], ["always", "Always"]] as const).map(([v, l]) => (
          <button key={v} className={"segbtn" + (s.selfHeal === v ? " on" : "")} onClick={() => set({ selfHeal: v })}>{l}</button>
        ))}
      </div>

      <div className="lineup">
        <div className="ltitle">With {n} player{n === 1 ? "" : "s"}, tonight deals</div>
        <div className="lbody">{n < s.minPlayers ? `Need ${s.minPlayers - n} more player${s.minPlayers - n === 1 ? "" : "s"} to begin.` : lineup(n, s)}</div>
      </div>
    </div>
  );
}
function phaseLabel(p: string) {
  return p === "night" ? "Night" : p === "night_result" ? "Dawn" : p === "day" ? "Day" : p === "day_result" ? "Verdict" : "";
}
function roleColor(roleName: string) {
  switch (roleName) {
    case "Mafia": return "var(--maf)";
    case "Godfather": return "var(--gf)";
    case "Doctor": return "var(--doc)";
    case "Detective": return "var(--det)";
    case "Vigilante": return "var(--vig)";
    case "Jester": return "var(--jester)";
    default: return "var(--vil)";
  }
}
function winnerColor(w: string) { return w === "mafia" ? "var(--maf)" : w === "jester" ? "var(--jester)" : "var(--candle)"; }
function winnerTitle(w: string) { return w === "mafia" ? "Mafia win" : w === "jester" ? "The Jester wins" : "Town wins"; }
function selfHealLabel(v: string) { return v === "never" ? "Never" : v === "once" ? "Once per game" : v === "always" ? "Always" : "Every other night"; }
function lineup(n: number, s: Settings): string {
  let maf = s.mafiaMode === "fixed" ? s.mafiaCount : (n >= 10 ? 3 : n >= 7 ? 2 : 1);
  maf = Math.max(1, Math.min(maf, Math.max(1, Math.floor((n - 1) / 2))));
  const pool: string[] = [];
  for (let i = 0; i < maf; i++) pool.push("mafia");
  if (s.godfather && pool.length) pool[0] = "godfather";
  const add = (r: string) => { if (pool.length < n) pool.push(r); };
  if (s.detective) add("detective");
  if (s.doctor) add("doctor");
  if (s.vigilante && n >= 6) add("vigilante");
  if (s.jester && n >= 6) add("jester");
  while (pool.length < n) pool.push("villager");
  const order = ["godfather", "mafia", "detective", "doctor", "vigilante", "jester", "villager"];
  const label: Record<string, string> = { godfather: "Godfather", mafia: "Mafia", detective: "Detective", doctor: "Doctor", vigilante: "Vigilante", jester: "Jester", villager: "Villager" };
  const counts: Record<string, number> = {};
  pool.slice(0, n).forEach((r) => (counts[r] = (counts[r] || 0) + 1));
  return order.filter((r) => counts[r]).map((r) => {
    const c = counts[r];
    return c === 1 ? label[r] : `${c} ${r === "villager" ? "Villagers" : label[r]}`;
  }).join(" · ");
}
