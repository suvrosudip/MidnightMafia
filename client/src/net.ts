import { Client, Room } from "colyseus.js";

const ENDPOINT = ((import.meta as any).env.VITE_SERVER_URL || "http://localhost:2567").replace(/\/+$/, "");
export const client = new Client(ENDPOINT);
export const HTTP = ENDPOINT;

export async function createDisplay(): Promise<Room> {
  return client.create("mafia", { display: true });
}

export async function joinByCode(code: string, name: string): Promise<Room> {
  const res = await fetch(`${HTTP}/api/room/${encodeURIComponent(code.toUpperCase())}`);
  if (!res.ok) throw new Error("No room with that code.");
  const { roomId } = await res.json();
  return client.joinById(roomId, { name });
}

export async function reconnect(token: string): Promise<Room> {
  return client.reconnect(token);
}

export type PlayerSnap = {
  id: string; name: string; connected: boolean; alive: boolean;
  isAdmin: boolean; hasActed: boolean; hasVoted: boolean; revealedRole: string; bot: boolean;
};
export type Settings = {
  mafiaMode: string; mafiaCount: number;
  doctor: boolean; detective: boolean; vigilante: boolean; godfather: boolean; jester: boolean;
  selfHeal: string; minPlayers: number;
};
export type Snap = {
  code: string; phase: string; round: number; narration: string; winner: string;
  settings: Settings;
  simulating: boolean;
  players: PlayerSnap[];
};

const DEFAULT_SETTINGS: Settings = {
  mafiaMode: "auto", mafiaCount: 1, doctor: true, detective: true,
  vigilante: false, godfather: false, jester: false, selfHeal: "alternate", minPlayers: 4,
};

export function snapshot(state: any): Snap {
  const players: PlayerSnap[] = [];
  state.players?.forEach((p: any, id: string) => {
    players.push({
      id, name: p.name, connected: p.connected, alive: p.alive, isAdmin: p.isAdmin,
      hasActed: p.hasActed, hasVoted: p.hasVoted, revealedRole: p.revealedRole, bot: !!p.bot,
    });
  });
  const s = state.settings;
  const settings: Settings = s ? {
    mafiaMode: s.mafiaMode, mafiaCount: s.mafiaCount, doctor: s.doctor, detective: s.detective,
    vigilante: s.vigilante, godfather: s.godfather, jester: s.jester, selfHeal: s.selfHeal, minPlayers: s.minPlayers,
  } : { ...DEFAULT_SETTINGS };
  return {
    code: state.code, phase: state.phase, round: state.round,
    narration: state.narration, winner: state.winner, settings, simulating: !!state.simulating, players,
  };
}
