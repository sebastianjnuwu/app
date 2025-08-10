import { logger } from "@functions/logger";
import { safePlayer, safeRoom } from "@functions/generator";
import db from "@db/prisma";
import chalk from "chalk";
import type { Socket } from "socket.io";

export async function LEAVE_ROOM({ USER, ROOM_CODE }: LeaveRoomData) {
  
  const socket = this as Socket;

  let ROOM = await db.ROOM.findUnique({
    where: { CODE: ROOM_CODE },
    include: {
     OWNER: true,
     PLAYERS: {
      where: {
        UID: { not: USER.UID }
      }
     }
    }
  });
  
  if (!ROOM) return;
  
  if (ROOM.STATE !== "WAITING") {
    
    await db.PLAYER.update({
      where: { UID: USER.UID },
      data: { ROOM_ID: null }
    });

    logger.info(`🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)} with state: ${chalk.yellow(ROOM.STATE)}`);
    
    socket.leave(ROOM_CODE);
    return;
  }

  await db.PLAYER.update({
    where: { UID: USER.UID },
    data: { ROOM_ID: null }
  });
  
  if (ROOM.PLAYERS.length === 0) {
    
    await db.ROOM.delete({ 
      where: { ID: ROOM.ID } 
    });

    logger.info(`🗑️ Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} deleted. Last owner was ${chalk.green(`"${USER.NAME}"`)}.`);
    
    socket.leave(ROOM_CODE);
    return;
  };

  if (ROOM.OWNER.UID === USER.UID) {

    const NEW_OWNER = ROOM.PLAYERS[0];

    await db.ROOM.update({
      where: { ID: ROOM.ID },
      data: { OWNER_ID: NEW_OWNER.ID }
    });
  
    socket.to(ROOM_CODE).emit("UPDATE_ROOM", {
      TYPE: "OWNER_CHANGED",
      OLD_OWNER: USER.NAME,
      NEW_OWNER: NEW_OWNER.NAME,
      ROOM: safeRoom(ROOM),
    });
    
    logger.info(`👑 Room ${chalk.cyanBright(`"${ROOM_CODE}"`)} ownership changed: ${chalk.red(`"${USER.NAME}"`)} ➜ ${chalk.green(`"${NEW_OWNER.NAME}"`)}`);

  };

  socket.leave(ROOM_CODE);
  
  logger.info(`🚪 Player ${chalk.green(`"${USER.NAME}"`)} left room ${chalk.cyanBright(`"${ROOM_CODE}"`)}`);
  
};