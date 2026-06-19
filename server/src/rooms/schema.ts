import { Schema, MapSchema, type } from "@colyseus/schema";

// Only PUBLIC info lives in synced state. Secret roles are NEVER put here —
// they are sent privately to each player via room messages, so no one's client
// ever receives another player's role.
export class PlayerState extends Schema {
  @type("string") name = "";
  @type("boolean") connected = true;
  @type("boolean") alive = true;
  @type("boolean") isAdmin = false;
  @type("boolean") hasActed = false;
  @type("boolean") hasVoted = false;
  @type("string") revealedRole = ""; // set only when the game ends
}

export class MafiaState extends Schema {
  @type("string") code = "";
  @type("string") phase = "lobby"; // lobby | night | night_result | day | day_result | ended
  @type("number") round = 0;
  @type("string") narration = "Waiting for players to join…";
  @type("string") winner = ""; // "mafia" | "town" | ""
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
