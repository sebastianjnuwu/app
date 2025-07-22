import db from "@db/prisma";

export async function GENERATE_CODE(): Promise<string> {
  while (true) {
    const CODE = Math.random().toString(36).substring(2, 8).toUpperCase();
    const EXIST = await db.ROOM.findUnique({ where: { CODE } });
    if (!EXIST) return CODE;
  }
};

export function safePlayer(p: any) {
  return {
    NAME: p.NAME,
    PHOTO_URL: p.PHOTO_URL,
  };
}

export function safeRoom(r: any) {
  return {
    CODE: r.CODE,
    STATE: r.STATE,
    PLAYER_LIMIT: r.PLAYER_LIMIT,
    PUBLIC: r.PUBLIC,
    TIME: r.TIME,
    PLAYERS: r.PLAYERS.map(safePlayer),
  };
}