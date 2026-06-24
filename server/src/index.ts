import http from "http";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { MafiaRoom } from "./rooms/MafiaRoom";
import { codeToRoom } from "./registry";

const port = Number(process.env.PORT) || 2567;
const app = express();
app.use(cors());

app.get("/", (_req, res) => res.send("Midnight Mafia server OK"));

// Players resolve a short code to a Colyseus roomId, then join by id.
app.get("/api/room/:code", (req, res) => {
  const roomId = codeToRoom.get(String(req.params.code).toUpperCase());
  if (!roomId) return res.status(404).json({ error: "Room not found" });
  res.json({ roomId });
});

// ---------------- ElevenLabs narration (optional) ----------------
// Enable spoken narration that works on TV browsers. Two providers are supported;
// Google is preferred when its key is set (generous free tier), else ElevenLabs.
//   Google Cloud TTS (recommended): set GOOGLE_TTS_API_KEY
//   ElevenLabs:                     set ELEVENLABS_API_KEY
const G_KEY = process.env.GOOGLE_TTS_API_KEY || "";
const G_VOICE = process.env.GOOGLE_TTS_VOICE || "en-GB-Wavenet-D"; // deep British narrator
const G_LANG = process.env.GOOGLE_TTS_LANG || "en-GB";
const G_RATE = Number(process.env.GOOGLE_TTS_RATE || "0.92");
const G_PITCH = Number(process.env.GOOGLE_TTS_PITCH || "-2.0");

const EL_KEY = process.env.ELEVENLABS_API_KEY || "";
const EL_VOICE = process.env.ELEVENLABS_VOICE_ID || "pFZP5JQG7iQjIQuC4Bku"; // "Lily" — British female narrator
const EL_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";

const TTS_PROVIDER: "google" | "eleven" | "" = G_KEY ? "google" : EL_KEY ? "eleven" : "";
const ttsCache = new Map<string, Buffer>();
const TTS_CACHE_MAX = 250;

app.get("/api/tts-status", (_req, res) => res.json({ enabled: !!TTS_PROVIDER, provider: TTS_PROVIDER }));

async function synthGoogle(text: string): Promise<Buffer> {
  const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${G_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: G_LANG, name: G_VOICE },
      audioConfig: { audioEncoding: "MP3", speakingRate: G_RATE, pitch: G_PITCH },
    }),
  });
  if (!r.ok) throw new Error(`google ${r.status}: ${await r.text().catch(() => "")}`);
  const j = (await r.json()) as { audioContent?: string };
  if (!j.audioContent) throw new Error("google: empty audioContent");
  return Buffer.from(j.audioContent, "base64");
}

async function synthEleven(text: string): Promise<Buffer> {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE}`, {
    method: "POST",
    headers: { "xi-api-key": EL_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: EL_MODEL,
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!r.ok) throw new Error(`eleven ${r.status}: ${await r.text().catch(() => "")}`);
  return Buffer.from(await r.arrayBuffer());
}

app.get("/api/tts", async (req, res) => {
  const text = String(req.query.text || "").slice(0, 800).trim();
  if (!text) return res.status(400).send("no text");
  if (!TTS_PROVIDER) return res.status(503).send("tts disabled");

  const key = crypto.createHash("sha1").update(`${TTS_PROVIDER}|${G_VOICE}|${EL_VOICE}|${text}`).digest("hex");
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");

  const hit = ttsCache.get(key);
  if (hit) return res.end(hit);

  try {
    const buf = TTS_PROVIDER === "google" ? await synthGoogle(text) : await synthEleven(text);
    ttsCache.set(key, buf);
    if (ttsCache.size > TTS_CACHE_MAX) {
      const oldest = ttsCache.keys().next().value as string | undefined;
      if (oldest) ttsCache.delete(oldest);
    }
    res.end(buf);
  } catch (e) {
    console.error("tts failed", e);
    res.status(502).send("tts failed");
  }
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server: http.createServer(app) }),
});
gameServer.define("mafia", MafiaRoom);
gameServer.listen(port);
console.log(`🌙 Midnight Mafia server listening on :${port}`);
