// Procedural ambient score for the display — no audio files, generated live with
// the Web Audio API. A slow evolving pad whose chord and tone shift by game phase.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let filter: BiquadFilterNode | null = null;
let lfo: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let voices: { osc: OscillatorNode; gain: GainNode }[] = [];
let on = false;
let mood = "lobby";

// Frequencies (Hz) for each phase's pad chord.
const CHORDS: Record<string, number[]> = {
  home: [146.83, 220.0, 293.66],
  lobby: [146.83, 220.0, 293.66, 440.0],   // D minor-ish, calm and open
  night: [110.0, 146.83, 164.81, 220.0],   // low and tense
  night_result: [130.81, 196.0, 261.63],   // C, lifting toward relief
  day: [174.61, 261.63, 329.63, 440.0],    // brighter, F major-ish
  day_result: [103.83, 138.59, 155.56],    // low, unsettled
  ended: [130.81, 164.81, 196.0, 261.63],  // C major, resolved
};
const CUTOFF: Record<string, number> = {
  home: 760, lobby: 820, night: 460, night_result: 900, day: 1250, day_result: 420, ended: 1100,
};

export function isMusicOn() { return on; }

export async function musicStart() {
  if (on) return;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  const ac = ctx as AudioContext;
  try { await ac.resume(); } catch {}

  master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.value = CUTOFF[mood] ?? 700;
  filter.connect(master);

  // very slow filter sweep for "breathing"
  lfo = ac.createOscillator();
  lfo.frequency.value = 0.05;
  lfoGain = ac.createGain();
  lfoGain.gain.value = 160;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  voices = [];
  for (let i = 0; i < 4; i++) {
    const osc = ac.createOscillator();
    osc.type = i % 2 ? "sine" : "triangle";
    const g = ac.createGain();
    g.gain.value = 0;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    voices.push({ osc, gain: g });
  }

  on = true;
  applyMood(mood, 0.6);
  const t = ac.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.linearRampToValueAtTime(0.13, t + 2.5);
}

export function musicStop() {
  if (!ctx || !master) { on = false; return; }
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.linearRampToValueAtTime(0, t + 1.2);
  const c = ctx;
  const vs = voices, l = lfo;
  setTimeout(() => {
    try { vs.forEach((v) => v.osc.stop()); l?.stop(); } catch {}
    try { c.suspend(); } catch {}
  }, 1300);
  voices = []; lfo = null; lfoGain = null; master = null; filter = null;
  on = false;
}

export function musicMood(phase: string) {
  mood = phase || "lobby";
  if (on) applyMood(mood, 3.5);
}

function applyMood(phase: string, ramp: number) {
  if (!ctx || !filter) return;
  const t = ctx.currentTime;
  const chord = CHORDS[phase] || CHORDS.lobby;

  filter.frequency.cancelScheduledValues(t);
  filter.frequency.setValueAtTime(filter.frequency.value, t);
  filter.frequency.linearRampToValueAtTime(CUTOFF[phase] ?? 700, t + ramp);

  voices.forEach((v, i) => {
    const note = chord[i % chord.length];
    const oct = i >= chord.length ? 2 : 1;
    const detune = i === 0 ? 1 : 1 + (i % 2 ? 0.004 : -0.004);
    const freq = note * oct * detune;
    v.osc.frequency.cancelScheduledValues(t);
    v.osc.frequency.setValueAtTime(v.osc.frequency.value || freq, t);
    v.osc.frequency.linearRampToValueAtTime(freq, t + ramp);
    const vol = 0.13 / Math.max(2, chord.length);
    v.gain.gain.cancelScheduledValues(t);
    v.gain.gain.linearRampToValueAtTime(vol, t + ramp);
  });
}
