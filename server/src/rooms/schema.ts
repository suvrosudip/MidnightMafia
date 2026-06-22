import { Schema, MapSchema, type } from "@colyseus/schema";

// Only PUBLIC info lives in synced state. Secret roles are NEVER put here —
// they are sent privately to each player via room messages.
export class PlayerState extends Schema {
  @type("string") name = "";
  @type("boolean") connected = true;
  @type("boolean") alive = true;
  @type("boolean") isAdmin = false;
  @type("boolean") hasActed = false;
  @type("boolean") hasVoted = false;
  @type("boolean") bot = false;
  @type("string") revealedRole = ""; // set only when the game ends
}

// Host-configurable game settings, edited in the lobby.
export class Settings extends Schema {
  @type("string") mafiaMode = "auto";    // "auto" | "fixed"
  @type("number") mafiaCount = 1;         // used when mafiaMode === "fixed"
  @type("boolean") doctor = true;
  @type("boolean") detective = true;
  @type("boolean") vigilante = false;
  @type("boolean") godfather = false;
  @type("boolean") jester = false;
  @type("string") selfHeal = "alternate"; // never | once | alternate | always
  @type("number") minPlayers = 4;
}

export class MafiaState extends Schema {
  @type("string") code = "";
  @type("string") phase = "lobby"; // lobby | night | night_result | day | day_result | ended
  @type("number") round = 0;
  @type("string") narration = "Waiting for players to join…";
  @type("string") winner = ""; // "mafia" | "town" | "jester" | ""
  @type("boolean") simulating = false;
  @type(Settings) settings = new Settings();
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
