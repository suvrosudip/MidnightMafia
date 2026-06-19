import http from "http";
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

const gameServer = new Server({
  transport: new WebSocketTransport({ server: http.createServer(app) }),
});
gameServer.define("mafia", MafiaRoom);
gameServer.listen(port);
console.log(`🌙 Midnight Mafia server listening on :${port}`);
