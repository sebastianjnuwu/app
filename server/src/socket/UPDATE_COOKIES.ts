import { logger } from "@functions/logger";
import { RoomState } from "../constants/constants";
import redis from "@database/redis";
import chalk from "chalk";
import type { Socket, Server } from "socket.io";

interface UpdateCookiesData {
  ROOM_CODE: string;
  USER: {
    UID: string;
  };
  cookies: number;
}

// Rate limiting por jogador (60 clicks/segundo max)
const clickRateLimit = new Map<string, { count: number; resetTime: number }>();

/**
 * Atualiza a contagem de cookies de um jogador durante o jogo.
 * Inclui validação anti-cheat e rate limiting.
 */
export async function UPDATE_COOKIES(
  socket: Socket,
  io: Server,
  { ROOM_CODE, USER, cookies }: UpdateCookiesData,
) {
  try {
    // Validação de entrada
    if (!ROOM_CODE || !USER || !USER.UID || typeof cookies !== "number") {
      return;
    }

    // Sanitizar UID
    const sanitizedUID = String(USER.UID).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitizedUID) {
      return;
    }

    // Rate limiting: máximo 60 clicks por segundo por jogador
    const now = Date.now();
    const rateLimitKey = `${ROOM_CODE}:${sanitizedUID}`;
    const limitData = clickRateLimit.get(rateLimitKey);

    if (limitData) {
      if (now < limitData.resetTime) {
        limitData.count++;
        if (limitData.count > 60) {
          // Excedeu rate limit
          logger.warn(
            `⚠️  Rate limit exceeded for player ${sanitizedUID} in room ${ROOM_CODE}`,
          );
          return;
        }
      } else {
        // Reset do contador após 1 segundo
        clickRateLimit.set(rateLimitKey, { count: 1, resetTime: now + 1000 });
      }
    } else {
      clickRateLimit.set(rateLimitKey, { count: 1, resetTime: now + 1000 });
    }

    const roomKey = `room:${ROOM_CODE}`;
    const playerKey = `player:${sanitizedUID}`;

    const ROOM = await redis.hgetall(roomKey);

    if (!ROOM || Object.keys(ROOM).length === 0) {
      return;
    }

    // Verificar se o jogo está em andamento
    if (ROOM.STATE !== RoomState.IN_GAME) {
      return;
    }

    // Validação anti-cheat: máximo de clicks = 60 * tempo_do_jogo
    const maxTime = Number(ROOM.TIME) || 60;
    const maxPossibleCookies = 60 * maxTime;

    if (cookies > maxPossibleCookies) {
      logger.warn(
        `🚫 Anti-cheat: Player ${sanitizedUID} exceeded max cookies (${cookies} > ${maxPossibleCookies}) in room ${ROOM_CODE}`,
      );
      // Limitar aos cookies máximos possíveis
      cookies = maxPossibleCookies;
    }

    // Garantir que cookies é não-negativo
    cookies = Math.max(0, Math.floor(cookies));

    // Atualizar cookies no Redis
    await redis.hset(playerKey, { COOKIES: cookies.toString() });

    // Log apenas a cada 10 cookies para não poluir
    if (cookies % 10 === 0) {
      logger.debug(
        `🍪 Player ${chalk.green(sanitizedUID)} updated cookies to ${chalk.yellow(cookies)} in room ${chalk.cyan(ROOM_CODE)}`,
      );
    }
  } catch (err) {
    logger.error(`Error in UPDATE_COOKIES handler: ${err}`);
  }
}

// Limpar rate limits antigos a cada minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of clickRateLimit.entries()) {
    if (now > data.resetTime + 60000) {
      // 1 minuto de inatividade
      clickRateLimit.delete(key);
    }
  }
}, 60000);
