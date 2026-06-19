// Browser narration. Only the display device calls this.
let chosen: SpeechSynthesisVoice | null = null;
let keep: any = null;

function pick(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const vs = speechSynthesis.getVoices();
  if (!vs.length) return null;
  if (chosen) return chosen;
  const en = vs.filter((v) => /^en/i.test(v.lang));
  const pool = en.length ? en : vs;
  const prefs = ["daniel", "arthur", "google uk english male", "microsoft guy", "microsoft david", "george", "male"];
  for (const k of prefs) {
    const m = pool.find((v) => v.name.toLowerCase().includes(k));
    if (m) { chosen = m; return m; }
  }
  chosen = pool[0];
  return chosen;
}

export function speak(text: string) {
  if (!("speechSynthesis" in window) || !text) return;
  speechSynthesis.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    const v = pick(); if (v) u.voice = v;
    u.rate = 0.9; u.pitch = 0.85; u.volume = 1;
    u.onend = stopKeep; u.onerror = stopKeep;
    speechSynthesis.speak(u);
    startKeep();
  }, 60);
}
export function stopSpeaking() { if ("speechSynthesis" in window) speechSynthesis.cancel(); stopKeep(); }
function startKeep() { stopKeep(); keep = setInterval(() => { if (speechSynthesis.speaking) { speechSynthesis.pause(); speechSynthesis.resume(); } else stopKeep(); }, 12000); }
function stopKeep() { if (keep) { clearInterval(keep); keep = null; } }
