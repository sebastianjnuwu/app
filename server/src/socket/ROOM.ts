import { safePlayer, safeRoom, GENERATE_CODE } from "@functions/generator";
import { logger } from "@functions/logger";
import type { Socket } from "socket.io";
import db from "@db/prisma";
import chalk from "chalk";

export async function ROOM({
  PLAYER,
  ROOM_PUBLIC,
  ROOM_CODE,
  ROOM_PLAYER_LIMIT,
  ROOM_TIME,
}: RoomEventPayload) {

  const socket = this as Socket;

  const CODE = (!ROOM_CODE || ROOM_CODE.trim() === "") ? await GENERATE_CODE() : ROOM_CODE;
  
  let PLAYER_IN_DB = await db.PLAYER.findUnique({
    where: { UID: PLAYER.UID },
  });

  if (!PLAYER_IN_DB) {
    PLAYER_IN_DB = await db.PLAYER.create({
      data: {
        UID: PLAYER.UID,
        NAME: PLAYER.NAME,
        PHOTO_URL: PLAYER.PHOTO_URL,
        IS_ORIGINAL: PLAYER.ORIGINAL
      },
    });
  }

  let ROOM = await db.ROOM.findUnique({
    where: { CODE },
    include: { PLAYERS: true, OWNER: true },
  });

  if (!ROOM && !ROOM_CODE) {
    
    if (!ROOM_PLAYER_LIMIT) {
      return socket.emit("ERR_SOCKET", { ERR_SOCKET: "app.error.INVALID_PLAYER_LIMIT" });
    }

    const limit = Number(ROOM_PLAYER_LIMIT);
    const time = Number(ROOM_TIME);

    ROOM = await db.ROOM.create({
      data: {
        CODE,
        OWNER_ID: PLAYER_IN_DB.ID,
        STATE: "WAITING",
        PLAYER_LIMIT: limit,
        PUBLIC: ROOM_PUBLIC ?? false,
        TIME: time,
        PLAYERS: {
          connect: { ID: PLAYER_IN_DB.ID }
        },
      },
      include: { PLAYERS: true, OWNER: true },
    });

    socket.join(CODE);

    socket.emit("UPDATE_ROOM", {
      TYPE: "CREATE",
      PLAYER: safePlayer(PLAYER_IN_DB),
      ROOM: safeRoom(ROOM),
    });

    logger.info(`📦 Room ${chalk.cyanBright(`"${CODE}"`)} created by ${chalk.green(`"${PLAYER.NAME}"`)}.`);

    return;
  };

  if (!ROOM && ROOM_CODE) {
    return socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.ROOM_NOT_FOUND"
    });
  }
  
  if (ROOM.STATE === "IN_GAME") {
    return socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.ROOM_STATE_ERROR_IN_GAME"
    });
  }

  if (ROOM.STATE === "FINISHED") {
    return socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.ROOM_STATE_ERROR_FINISHED"
    });
  }

  if (ROOM.PLAYERS.find((p) => p.UID === PLAYER.UID)) {
    return socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.PLAYER_EXISTS"
    });
  }

  socket.join(CODE);

  PLAYER_IN_DB = await db.PLAYER.update({
    where: { UID: PLAYER.UID },
    data: {
      ROOM_ID: ROOM.ID,
      NAME: PLAYER.NAME,
      PHOTO_URL: PLAYER.PHOTO_URL,
      IS_ORIGINAL: PLAYER.ORIGINAL
    },
  });

  socket.emit("UPDATE_ROOM", {
    TYPE: "JOIN",
    PLAYER: safePlayer(PLAYER_IN_DB),
    ROOM: safeRoom(ROOM),
  });

  logger.info(`👋 Player ${chalk.green(`"${PLAYER.NAME}"`)} joined room ${chalk.cyanBright(`"${CODE}"`)}.`);

};