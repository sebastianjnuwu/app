import { safePlayer, safeRoom, GENERATE_CODE } from "@functions/generator";
import { logger } from "@functions/logger";
import type { Socket, Server } from "socket.io";
import redis from "@database/redis";
import chalk from "chalk";

interface PLAYER_INFO {
  ORIGINAL: boolean;
  UID: string;
  NAME: string;
  PHOTO_URL: string;
}

interface RoomEventPayload {
  PLAYER: PLAYER_INFO;
  ROOM_PUBLIC?: boolean;
  ROOM_CODE?: string;
  ROOM_PLAYER_LIMIT?: number | string;
  ROOM_TIME?: number | string;
}

/**
 * Cria ou entra em uma sala usando Redis.
 * @param socket - Socket do jogador
 * @param io - Instância do Socket.IO server
 * @param payload - Dados do evento ROOM
 */
export async function ROOM(
  socket: Socket,
  io: Server,
  {
    PLAYER,
    ROOM_PUBLIC,
    ROOM_CODE,
    ROOM_PLAYER_LIMIT,
    ROOM_TIME,
  }: RoomEventPayload,
) {
  try {
    // Input validation
    if (!PLAYER || !PLAYER.UID || !PLAYER.NAME) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.INVALID_PLAYER_DATA",
      });
    }

    // Sanitize inputs
    const sanitizedUID = String(PLAYER.UID).replace(/[^a-zA-Z0-9-]/g, "");
    if (sanitizedUID.length === 0) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.INVALID_PLAYER_UID",
      });
    }

    const CODE =
      !ROOM_CODE || ROOM_CODE.trim() === "" ? await GENERATE_CODE() : ROOM_CODE;

    // --- PLAYER ---
    const playerKey = `player:${sanitizedUID}`;
    let PLAYER_IN_DB = await redis.hgetall(playerKey);

    if (!PLAYER_IN_DB || Object.keys(PLAYER_IN_DB).length === 0) {
      PLAYER_IN_DB = {
        UID: sanitizedUID,
        NAME: PLAYER.NAME.substring(0, 14), // limite de 14 caracteres
        PHOTO_URL: PLAYER.PHOTO_URL,
        IS_ORIGINAL: PLAYER.ORIGINAL.toString(),
        ROOM_ID: "",
      };
      await redis.hmset(playerKey, PLAYER_IN_DB);
    }

    // --- ROOM ---
    const roomKey = `room:${CODE}`;
    let ROOM = await redis.hgetall(roomKey);

  if (!ROOM || Object.keys(ROOM).length === 0) {
    // Criar nova sala
    if (ROOM_CODE) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.ROOM_NOT_FOUND",
      });
    }
    if (!ROOM_PLAYER_LIMIT) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.INVALID_PLAYER_LIMIT",
      });
    }

    const limit = Number(ROOM_PLAYER_LIMIT);
    const time = Number(ROOM_TIME);

    ROOM = {
      CODE,
      OWNER_ID: sanitizedUID,
      STATE: "WAITING",
      PLAYER_LIMIT: limit.toString(),
      PUBLIC: (ROOM_PUBLIC ?? false).toString(),
      TIME: time.toString(),
      PLAYERS: JSON.stringify([sanitizedUID]),
    };

    await redis.hmset(roomKey, ROOM);

    socket.join(CODE);

    socket.emit("UPDATE_ROOM", {
      TYPE: "CREATE",
      PLAYER: safePlayer(PLAYER_IN_DB),
      ROOM: {
        ...ROOM,
        OWNER: safePlayer(PLAYER_IN_DB),
        PLAYERS: [safePlayer(PLAYER_IN_DB)],
      },
    });

    logger.info(
      `📦 Room ${chalk.cyanBright(`"${CODE}" - [0/${ROOM.PLAYER_LIMIT}] - ${ROOM.PUBLIC === "true" ? "public" : "private"}"`)} created by ${chalk.green(`"${PLAYER.NAME.substring(0, 14)}"`)}.`,
    );
    return;
  }

  // --- Verificação de estado ---
  if (ROOM.STATE === "IN_GAME") {
    return socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.ROOM_STATE_ERROR_IN_GAME",
    });
  }
  if (ROOM.STATE === "FINISHED") {
    return socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.ROOM_STATE_ERROR_FINISHED",
    });
  }

  const players: string[] = JSON.parse(ROOM.PLAYERS || "[]");
  if (players.includes(sanitizedUID)) {
    return socket.emit("ERR_SOCKET", { ERR_SOCKET: "app.error.PLAYER_EXISTS" });
  }

  // --- Entrar na sala ---
  socket.join(CODE);

  // Atualiza player
  PLAYER_IN_DB.ROOM_ID = CODE;
  PLAYER_IN_DB.NAME = PLAYER.NAME.substring(0, 14); // limite de 14 caracteres
  PLAYER_IN_DB.PHOTO_URL = PLAYER.PHOTO_URL;
  PLAYER_IN_DB.IS_ORIGINAL = PLAYER.ORIGINAL.toString();
  await redis.hmset(playerKey, PLAYER_IN_DB);

  // Atualiza lista de jogadores na sala
  players.push(sanitizedUID);
  ROOM.PLAYERS = JSON.stringify(players);
  await redis.hmset(roomKey, ROOM);

  // Reconstrói objeto ROOM completo
  const ROOM_OBJ = {
    ...ROOM,
    OWNER: safePlayer(await redis.hgetall(`player:${ROOM.OWNER_ID}`)),
    PLAYERS: (
      await Promise.allSettled(
        players.map(async (uid) => {
          const p = await redis.hgetall(`player:${uid}`);
          return safePlayer(p);
        }),
      )
    )
      .filter((result) => result.status === "fulfilled")
      .map((result: any) => result.value),
  };

  io.in(CODE).emit("UPDATE_ROOM", {
    TYPE: "JOIN",
    PLAYER: safePlayer(PLAYER_IN_DB),
    ROOM: ROOM_OBJ,
  });

  logger.info(
    `👋 Player ${chalk.green(`"${PLAYER.NAME.substring(0, 14)}"`)} joined room ${chalk.cyanBright(`"${CODE}"`)}.`,
  );
  } catch (err) {
    logger.error(`Error in ROOM handler: ${err}`);
    socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.SERVER_ERROR",
    });
  }
}
