import { logger } from "@functions/logger";
import { safePlayer, safeRoom } from "@functions/generator";
import redis from "@database/redis";
import chalk from "chalk";
import type { Socket } from "socket.io";

interface LeaveRoomData {
  USER: {
    UID: string;
    NAME: string;
    ORIGINAL?: boolean;
    PHOTO_URL?: string;
  };
  ROOM_CODE: string;
}

export async function LEAVE_ROOM({ USER, ROOM_CODE }: LeaveRoomData) {
  const socket = this as Socket;
  const io = socket.server;

  const roomKey = `room:${ROOM_CODE}`;
  const playerKey = `player:${USER.UID}`;

  // Recupera sala e jogador
  let ROOM = await redis.hgetall(roomKey);
  let PLAYER = await redis.hgetall(playerKey);

  if (!ROOM || Object.keys(ROOM).length === 0 || !PLAYER || Object.keys(PLAYER).length === 0) {
    return;
  }

  const players: string[] = JSON.parse(ROOM.PLAYERS || "[]");

  // Remove jogador da sala
  PLAYER.ROOM_ID = "";
  await redis.hmset(playerKey, PLAYER);

  // Se a sala não estiver esperando, apenas remove o player
  if (ROOM.STATE !== "WAITING") {
    socket.leave(ROOM_CODE);
    logger.info(
      `🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)} with state: ${chalk.yellow(ROOM.STATE)}`
    );
    return;
  }

  const remainingPlayers = players.filter(uid => uid !== USER.UID);

  // Sala vazia → deletar
  if (remainingPlayers.length === 0) {
    await redis.del(roomKey);
    socket.leave(ROOM_CODE);
    logger.info(
      `🗑️ Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} deleted. Last owner was ${chalk.green(`"${USER.NAME}"`)}.`
    );
    return;
  }

  // Atualiza sala com novos jogadores
  ROOM.PLAYERS = JSON.stringify(remainingPlayers);

  // Mudança de dono se necessário
  if (ROOM.OWNER_ID === USER.UID) {
    const NEW_OWNER_UID = remainingPlayers[0];
    ROOM.OWNER_ID = NEW_OWNER_UID;
    await redis.hmset(roomKey, ROOM);

    const NEW_OWNER = await redis.hgetall(`player:${NEW_OWNER_UID}`);

    io.in(ROOM_CODE).emit("UPDATE_ROOM", {
      TYPE: "CREATE",
      PLAYER: safePlayer(NEW_OWNER),
      ROOM: {
        ...ROOM,
        OWNER: safePlayer(NEW_OWNER),
        PLAYERS: await Promise.all(
          remainingPlayers.map(async (uid) => safePlayer(await redis.hgetall(`player:${uid}`)))
        ),
      },
    });

    logger.info(
      `👑 Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} ownership changed: ${chalk.red(`"${USER.NAME}"`)} ➜ ${chalk.green(`"${NEW_OWNER.NAME}"`)}`
    );
  } else {
    // Atualiza apenas a lista de jogadores na sala
    await redis.hmset(roomKey, ROOM);
  }

  socket.leave(ROOM_CODE);
  logger.info(`🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)}`);
}
