import redis from "@database/redis";

/**
 * Gera um código único de 6 caracteres para uma sala.
 * Verifica no Redis se já existe uma sala com esse código.
 */
export async function GENERATE_CODE(): Promise<string> {
  while (true) {
    const CODE = Math.random().toString(36).substring(2, 8).toUpperCase();
    const exists = await redis.exists(`room:${CODE}`);
    if (!exists) return CODE;
  }
}

/**
 * Retorna apenas os campos públicos de um jogador.
 */
export function safePlayer(p: Record<string, any>) {
  return {
    UID: p.UID,
    NAME: p.NAME,
    PHOTO_URL: p.PHOTO_URL,
  };
}

/**
 * Retorna apenas os campos públicos de uma sala,
 * incluindo owner e lista de players.
 */
export function safeRoom(r: Record<string, any>) {
  return {
    CODE: r.CODE,
    STATE: r.STATE,
    PLAYER_LIMIT: r.PLAYER_LIMIT,
    PUBLIC: r.PUBLIC === "true" || r.PUBLIC === true,
    TIME: Number(r.TIME),
    OWNER: {
      UID: r.OWNER.UID,
      NAME: r.OWNER.NAME,
      PHOTO_URL: r.OWNER.PHOTO_URL,
    },
    PLAYERS: r.PLAYERS.map(safePlayer),
  };
}
