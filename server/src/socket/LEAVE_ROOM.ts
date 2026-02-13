import { logger } from "@functions/logger";
import { safePlayer } from "@functions/generator";
import { RoomState, UpdateRoomType } from "../constants/constants";
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
  try {
    // Input validation
    if (!USER || !USER.UID || !ROOM_CODE) {
      return;
    }

    // Sanitize inputs - allow alphanumeric, hyphens, and underscores for Firebase UIDs
    const sanitizedUID = String(USER.UID).replace(/[^a-zA-Z0-9_-]/g, "");
    if (sanitizedUID.length === 0) {
      return;
    }

    const roomKey = `room:${ROOM_CODE}`;
    const playerKey = `player:${sanitizedUID}`;

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
    await redis.hset(playerKey, PLAYER);

    const players: string[] = JSON.parse(ROOM.PLAYERS || "[]");

    // Sala não está esperando → remove o player e pronto
    if (ROOM.STATE !== RoomState.WAITING) {
      socket.leave(ROOM_CODE);
      logger.info(
        `🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)} (state: ${chalk.yellow(ROOM.STATE)})`,
      );
      return;
    }

    const remainingPlayers = players.filter((uid) => uid !== sanitizedUID);

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
    if (ROOM.OWNER_ID === sanitizedUID) {
      const NEW_OWNER_UID = remainingPlayers[0];
      ROOM.OWNER_ID = NEW_OWNER_UID;
      await redis.hset(roomKey, ROOM);

      const NEW_OWNER = await redis.hgetall(`player:${NEW_OWNER_UID}`);
      const playerResults = await Promise.allSettled(
        remainingPlayers.map(async (uid) =>
          safePlayer(await redis.hgetall(`player:${uid}`)),
        ),
      );

      const ROOM_OBJ = {
        ...ROOM,
        OWNER: safePlayer(NEW_OWNER),
        PLAYERS: playerResults
          .filter(
            (result): result is PromiseFulfilledResult<ReturnType<typeof safePlayer>> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value),
      };

      io.in(ROOM_CODE).emit("UPDATE_ROOM", {
        TYPE: UpdateRoomType.OWNER_CHANGED,
        PLAYER: safePlayer(NEW_OWNER),
        ROOM: ROOM_OBJ,
      });

      logger.info(
        `👑 Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} ownership changed: ${chalk.red(`"${USER.NAME}"`)} ➜ ${chalk.green(`"${NEW_OWNER.NAME}"`)}`,
      );
    } else {
      await redis.hset(roomKey, ROOM);
    }

    socket.leave(ROOM_CODE);
    logger.info(
      `🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)}`,
    );
  } catch (err) {
    logger.error(`Error in LEAVE_ROOM handler: ${err}`);
  }
}
