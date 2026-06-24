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
// Set ELEVENLABS_API_KEY to enable spoken narration that works on TV browsers.
const TTS_KEY = process.env.ELEVENLABS_API_KEY || "";
const TTS_VOICE = process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb"; // "George" — warm narrator
const TTS_MODEL = process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5";
const ttsCache = new Map<string, Buffer>();
const TTS_CACHE_MAX = 250;

app.get("/api/tts-status", (_req, res) => res.json({ enabled: !!TTS_KEY }));

app.get("/api/tts", async (req, res) => {
  const text = String(req.query.text || "").slice(0, 800).trim();
  if (!text) return res.status(400).send("no text");
  if (!TTS_KEY) return res.status(503).send("tts disabled");
  const voice = String(req.query.v || TTS_VOICE);
  const key = crypto.createHash("sha1").update(`${voice}|${TTS_MODEL}|${text}`).digest("hex");

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "public, max-age=86400");

  const hit = ttsCache.get(key);
  if (hit) return res.end(hit);

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: { "xi-api-key": TTS_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
      }),
    });
    if (!r.ok) {
      console.error("ElevenLabs error", r.status, await r.text().catch(() => ""));
      return res.status(502).send("tts upstream error");
    }
    const buf = Buffer.from(await r.arrayBuffer());
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
