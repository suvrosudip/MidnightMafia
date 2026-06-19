import { useEffect, useRef, useState } from "react";
import { Room } from "colyseus.js";
import { QRCodeSVG } from "qrcode.react";
import { createDisplay, joinByCode, reconnect, snapshot, Snap, PlayerSnap } from "./net";
import { speak, stopSpeaking } from "./speech";
import Atmosphere from "./Atmosphere";
import { Crest } from "./Crest";
import { RoleArt } from "./RoleArt";

type Mode = "home" | "display" | "player";
type You = { role: string; roleName: string; blurb: string; partners?: string[]; investigation?: string };

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
      speak(snap.narration);
    }
  }, [snap, mode, voiceOn]);

  // ---- actions ----
  async function openDisplay() {
    try { const room = await createDisplay(); attach(room, true); setMode("display"); }
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
    stopSpeaking();
    roomRef.current?.leave(true);
    roomRef.current = null;
    setSnap(null); setYou(null); setMode("home"); setError(""); setChoice(null);
  }
  function toggleVoice() {
    setVoiceOn((v) => { if (v) stopSpeaking(); else lastSpoken.current = ""; return !v; });
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
        {snap.phase === "lobby" ? (
          <div className="card center">
            <div className="qr"><QRCodeSVG value={joinUrl} size={210} /></div>
            <div className="muted small">scan to join</div>
            <div className="lbl mt">or open {window.location.host} and enter code</div>
            <div className="bigcode">{snap.code}</div>
            <Roster players={snap.players} />
            <div className="bar center">
              <button className="btn solid" disabled={snap.players.length < 4} onClick={() => send("start")}>Start game</button>
              <button className="btn ghost" onClick={toggleVoice}>🔊 Voice {voiceOn ? "on" : "off"}</button>
            </div>
            <div className="muted small">{snap.players.length} / 4 players minimum · ★ = admin</div>
          </div>
        ) : (
          <>
            <Narration text={snap.narration} />
            <div className="card">
              <div className="row">
                <span className={"tag p-" + snap.phase}>{phaseLabel(snap.phase)}</span>
                <span className="muted small">Round {snap.round} · {alive.length} alive</span>
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
                <button className="btn ghost" onClick={() => speak(snap.narration)}>🔁 Replay</button>
                <button className="btn ghost" onClick={toggleVoice}>🔊 Voice {voiceOn ? "on" : "off"}</button>
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
          {me.isAdmin
            ? <><button className="btn solid full mt" disabled={snap.players.length < 4} onClick={() => send("start")}>Start game</button>
                <div className="muted small mt">You’re the admin · {snap.players.length} / 4 minimum</div></>
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
            you.role === "mafia" ? <Picker title="Choose tonight’s target." options={aliveOthers} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} />
            : you.role === "doctor" ? <Picker title="Choose who to protect — you may pick yourself." options={alive} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} />
            : you.role === "detective" ? <Picker title="Choose who to investigate." options={aliveOthers} locked={me.hasActed} choice={choice} setChoice={setChoice} onSubmit={() => send("night-action", { targetId: choice })} />
            : <div className="card muted">😴 You sleep soundly. Watch the screen for the dawn.</div>
          )}

          {snap.phase === "day" && me.alive && (
            <Picker title="Vote to send someone away." options={aliveOthers} locked={me.hasVoted} choice={choice} setChoice={setChoice} onSubmit={() => send("vote", { targetId: choice })} />
          )}

          {(snap.phase === "night_result" || snap.phase === "day_result") && <div className="card muted">Look to the big screen…</div>}
          {!me.alive && snap.phase !== "ended" && <div className="card muted">👻 You’ve been eliminated. Watch quietly.</div>}
          {snap.phase === "ended" && <div className="card muted">{snap.winner === "mafia" ? "Mafia win." : "Town wins."} The big screen has the full reveal.</div>}

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
    <div key={p.id} className={"seat" + (p.alive ? "" : " out")}>{p.name} {p.isAdmin ? "★" : ""}{p.connected ? "" : " ⚪"}</div>
  ))}{!players.length && <div className="muted">Waiting for players…</div>}</div>;
}
function Chips({ players, sid }: { players: PlayerSnap[]; sid: string }) {
  return <div className="chips mt">{players.map((p) => (
    <span key={p.id} className={"chip" + (p.id === sid ? " me" : "")}>{p.name} {p.isAdmin ? "★" : ""}</span>
  ))}</div>;
}
function Picker({ title, options, locked, choice, setChoice, onSubmit }:
  { title: string; options: PlayerSnap[]; locked: boolean; choice: string | null; setChoice: (s: string) => void; onSubmit: () => void }) {
  return (
    <div className="card">
      <div className="prompt">{title}</div>
      <div className="pickgrid">{options.map((p) => (
        <button key={p.id} className={"pick" + (choice === p.id ? " sel" : "")} disabled={locked} onClick={() => setChoice(p.id)}>{p.name}</button>
      ))}</div>
      {locked
        ? <div className="locked">Locked in. Waiting for the others…</div>
        : <button className="btn solid full" disabled={!choice} onClick={onSubmit}>Lock it in</button>}
    </div>
  );
}
function Reveal({ snap }: { snap: Snap }) {
  return (
    <div className="card result" style={{ borderColor: snap.winner === "mafia" ? "var(--maf)" : "var(--candle)" }}>
      <div className="resulttitle" style={{ color: snap.winner === "mafia" ? "var(--maf)" : "var(--candle)" }}>
        {snap.winner === "mafia" ? "Mafia win" : "Town wins"}</div>
      {snap.players.map((p) => (
        <div key={p.id} className="resultrow">
          <span className={p.alive ? "" : "dead"}>{p.name}</span>
          <span style={{ color: roleColor(p.revealedRole), display: "inline-flex", alignItems: "center", gap: "6px" }}><Crest name={p.revealedRole} size={15} /> {p.revealedRole}</span>
        </div>
      ))}
    </div>
  );
}
function phaseLabel(p: string) {
  return p === "night" ? "Night" : p === "night_result" ? "Dawn" : p === "day" ? "Day" : p === "day_result" ? "Verdict" : "";
}
function roleColor(roleName: string) {
  return roleName === "Mafia" ? "var(--maf)" : roleName === "Doctor" ? "var(--doc)"
    : roleName === "Detective" ? "var(--det)" : "var(--vil)";
}
