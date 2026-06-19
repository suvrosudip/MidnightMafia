import { Client, Room } from "colyseus.js";

const ENDPOINT = (import.meta as any).env.VITE_SERVER_URL || "http://localhost:2567";
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
  isAdmin: boolean; hasActed: boolean; hasVoted: boolean; revealedRole: string;
};
export type Snap = {
  code: string; phase: string; round: number; narration: string; winner: string;
  players: PlayerSnap[];
};

export function snapshot(state: any): Snap {
  const players: PlayerSnap[] = [];
  state.players?.forEach((p: any, id: string) => {
    players.push({
      id, name: p.name, connected: p.connected, alive: p.alive, isAdmin: p.isAdmin,
      hasActed: p.hasActed, hasVoted: p.hasVoted, revealedRole: p.revealedRole,
    });
  });
  return {
    code: state.code, phase: state.phase, round: state.round,
    narration: state.narration, winner: state.winner, players,
  };
}
