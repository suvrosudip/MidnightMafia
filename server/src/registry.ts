// Single-instance lookup of short room codes -> Colyseus roomId.
// (Fine for one server. For multi-server later, move this to Redis.)
export const codeToRoom = new Map<string, string>();
