import { logger } from "@functions/logger";
import { createServer } from "node:http";
import { Server } from "socket.io"; // valor real para instância
import type { Socket } from "socket.io"; // apenas tipo
import { ROOM } from "@socket/ROOM";
import { LEAVE_ROOM } from "@socket/LEAVE_ROOM";
import { START_GAME } from "@socket/START_GAME";
import { UPDATE_COOKIES } from "@socket/UPDATE_COOKIES";
import { JOIN_RANDOM_ROOM } from "@socket/JOIN_RANDOM_ROOM";
import { UpdateRoomType } from "./constants/constants";
import { validateUID, isEmpty } from "./utils/validation";
import { emitError } from "./utils/socket";
import { getPlayer, getRoom } from "./utils/redis";
import { buildRoomObject, isPlayerInRoom } from "./utils/room";
import express from "express";
import colors from "colors";
import "@database/redis";
import "dotenv/config";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("*", (_, res) => {
  res.status(200).json({
    status: true,
    date: new Date(),
  });
});

io.on("connection", (socket: Socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Entrar na sala / Criar sala
  socket.on("ROOM", (data) => ROOM(socket, io, data));

  // Reentrada em sala
  socket.on("REJOIN_ROOM", async ({ USER, ROOM_CODE }) => {
    try {
      if (!USER || !ROOM_CODE) {
        return emitError(socket, "INVALID_REJOIN_DATA");
      }

      // Validar e sanitizar UID
      const { valid, sanitized: sanitizedUID } = validateUID(USER.UID);
      if (!valid) {
        return emitError(socket, "INVALID_PLAYER_UID");
      }

      // Recuperar dados do Redis
      const playerData = await getPlayer(sanitizedUID);
      const roomData = await getRoom(ROOM_CODE);

      if (isEmpty(playerData) || isEmpty(roomData)) {
        return emitError(socket, "ROOM_NOT_FOUND");
      }

      // Verificar se o jogador está na sala
      if (!isPlayerInRoom(roomData, sanitizedUID)) {
        return emitError(socket, "PLAYER_NOT_IN_ROOM");
      }

      socket.data.USER = playerData;
      socket.data.ROOM_CODE = ROOM_CODE;
      socket.join(ROOM_CODE);

      // Reconstruir ROOM completo
      const ROOM_OBJ = await buildRoomObject(roomData);

      io.in(ROOM_CODE).emit("UPDATE_ROOM", {
        TYPE: UpdateRoomType.REJOIN,
        PLAYER: {
          UID: playerData.UID || "",
          NAME: playerData.NAME || "",
          PHOTO_URL: playerData.PHOTO_URL || "",
        },
        ROOM: ROOM_OBJ,
      });

      logger.info(
        `👋 Player ${colors.green(playerData.NAME)} rejoined room ${colors.cyan(ROOM_CODE)}.`,
      );
    } catch (err) {
      logger.error(`Error on rejoin_room: ${err}`);
      emitError(socket, "SERVER_ERROR");
    }
  });

  // Sair da sala
  socket.on("LEAVE_ROOM", (data) => LEAVE_ROOM(socket, io, data));

  // Entrar em sala aleatória
  socket.on("JOIN_RANDOM_ROOM", (data) => JOIN_RANDOM_ROOM(socket, io, data));

  // Iniciar jogo
  socket.on("START_GAME", (data) => START_GAME(socket, io, data));

  // Atualizar cookies durante o jogo
  socket.on("UPDATE_COOKIES", (data) => UPDATE_COOKIES(socket, io, data));

  // Desconexão
  socket.on("disconnect", async () => {
    logger.info(`Client disconnected: ${socket.id}`);

    const USER = socket.data.USER;
    const ROOM_CODE = socket.data.ROOM_CODE;

    if (USER && ROOM_CODE) {
      try {
        await LEAVE_ROOM(socket, io, { USER, ROOM_CODE }).catch((err) =>
          logger.error(`Error leaving room on disconnect: ${err}`),
        );
      } catch (err) {
        logger.error(`Error handling disconnect: ${err}`);
      }
    }
  });
});

http.listen(
  Number(process.env.PORT) || 3000,
  process.env.HOST ?? "localhost",
  () => {
    logger.info(
      `Socket running on: ${colors.bold.green(`http://${process.env.HOST ?? "localhost"}:${process.env.PORT ?? 3000}`)}`,
    );
  },
);
