import { logger } from "@functions/logger";
import { safePlayer, safeRoom } from "@functions/generator";
import db from "@db/prisma";
import chalk from "chalk";
import type { Socket } from "socket.io";

export async function LEAVE_ROOM({
  USER,
  ROOM_CODE
}: LeaveRoomData) {

  const socket = this as Socket;

  const PLAYER = await db.PLAYER.findUnique({
    where: { UID: USER.UID },
    include: { ROOM: true }
  });

  if (PLAYER?.ROOM?.CODE !== ROOM_CODE) return;

  await db.PLAYER.update({
    where: { UID: USER.UID },
    data: { ROOM_ID: null }
  });

  const ROOM = await db.ROOM.findUnique({
    where: { CODE: ROOM_CODE },
    include: { PLAYERS: true, OWNER: true }
  });

  if (!ROOM) return;

  if (ROOM.PLAYERS.length === 0) {
    await db.ROOM.delete({
      where: { ID: ROOM.ID }
    });

    logger.info(`🗑️ Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} deleted. Last owner was ${chalk.green(`"${USER.NAME}"`)}.`);

    socket.leave(ROOM_CODE);
    return;
  };

  const NEW_OWNER = ROOM.PLAYERS[0];

  await db.ROOM.update({
    where: { ID: ROOM.ID },
    data: { OWNER_ID: NEW_OWNER.ID }
  });

  const UPDATED_ROOM = await db.ROOM.findUnique({
    where: { ID: ROOM.ID },
    include: { PLAYERS: true, OWNER: true }
  });

  socket.to(ROOM_CODE).emit("UPDATE_ROOM", {
    TYPE: "OWNER_CHANGED",
    ROOM: safeRoom(UPDATED_ROOM),
    NEW_OWNER: safePlayer(NEW_OWNER)
  });

  logger.info(`👑 Ownership of room ${chalk.cyanBright(`"${ROOM_CODE}"`)} passed to ${chalk.green(`"${NEW_OWNER.NAME}"`)}`);

  socket.to(ROOM_CODE).emit("UPDATE_ROOM", {
    TYPE: "LEAVE",
    PLAYER: safePlayer(PLAYER),
    ROOM: safeRoom(UPDATED_ROOM)
  });

  socket.leave(ROOM_CODE);

  logger.info(`🚪 Player ${chalk.green(`"${PLAYER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)}`);
  
}