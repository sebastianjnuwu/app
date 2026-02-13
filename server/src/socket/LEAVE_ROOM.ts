import { logger } from "@functions/logger";
import { safePlayer } from "@functions/generator";
import redis from "@database/redis";
import chalk from "chalk";
import type { Socket, Server } from "socket.io";

interface PLAYER_INFO {
  UID: string;
  NAME: string;
  ORIGINAL?: boolean;
  PHOTO_URL?: string;
}

interface LeaveRoomData {
  USER: PLAYER_INFO;
  ROOM_CODE: string;
}

/**
 * Remove um jogador de uma sala Redis.
 */
export async function LEAVE_ROOM(
  socket: Socket,
  io: Server,
  { USER, ROOM_CODE }: LeaveRoomData,
) {
  const roomKey = `room:${ROOM_CODE}`;
  const playerKey = `player:${USER.UID}`;

  const ROOM = await redis.hgetall(roomKey);
  const PLAYER = await redis.hgetall(playerKey);

  if (
    !ROOM ||
    !PLAYER ||
    Object.keys(ROOM).length === 0 ||
    Object.keys(PLAYER).length === 0
  )
    return;

  // Remove jogador da sala
  PLAYER.ROOM_ID = "";
  await redis.hmset(playerKey, PLAYER);

  const players: string[] = JSON.parse(ROOM.PLAYERS || "[]");

  // Sala não está esperando → remove o player e pronto
  if (ROOM.STATE !== "WAITING") {
    socket.leave(ROOM_CODE);
    logger.info(
      `🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)} (state: ${chalk.yellow(ROOM.STATE)})`,
    );
    return;
  }

  const remainingPlayers = players.filter((uid) => uid !== USER.UID);

  // Sala vazia → deletar
  if (remainingPlayers.length === 0) {
    await redis.del(roomKey);
    socket.leave(ROOM_CODE);
    logger.info(
      `🗑️  Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} deleted. Last owner: ${chalk.green(`"${USER.NAME}"`)}`,
    );
    return;
  }

  // Atualiza lista de jogadores
  ROOM.PLAYERS = JSON.stringify(remainingPlayers);

  // Mudança de dono se necessário
  if (ROOM.OWNER_ID === USER.UID) {
    const NEW_OWNER_UID = remainingPlayers[0];
    ROOM.OWNER_ID = NEW_OWNER_UID;
    await redis.hmset(roomKey, ROOM);

    const NEW_OWNER = await redis.hgetall(`player:${NEW_OWNER_UID}`);
    const ROOM_OBJ = {
      ...ROOM,
      OWNER: safePlayer(NEW_OWNER),
      PLAYERS: await Promise.all(
        remainingPlayers.map(async (uid) =>
          safePlayer(await redis.hgetall(`player:${uid}`)),
        ),
      ),
    };

    io.in(ROOM_CODE).emit("UPDATE_ROOM", {
      TYPE: "OWNER_CHANGED",
      PLAYER: safePlayer(NEW_OWNER),
      ROOM: ROOM_OBJ,
    });

    logger.info(
      `👑 Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} ownership changed: ${chalk.red(`"${USER.NAME}"`)} ➜ ${chalk.green(`"${NEW_OWNER.NAME}"`)}`,
    );
  } else {
    await redis.hmset(roomKey, ROOM);
  }

  socket.leave(ROOM_CODE);
  logger.info(
    `🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)}`,
  );
}
