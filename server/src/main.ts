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
import redis from "@database/redis";
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
        return socket.emit("ERR_SOCKET", {
          ERR_SOCKET: "app.error.INVALID_REJOIN_DATA",
        });
      }

      // Sanitizar UID
      const sanitizedUID = String(USER.UID).replace(/[^a-zA-Z0-9_-]/g, "");
      if (!sanitizedUID) {
        return socket.emit("ERR_SOCKET", {
          ERR_SOCKET: "app.error.INVALID_PLAYER_UID",
        });
      }

      // Recuperar dados do Redis
      const playerKey = `player:${sanitizedUID}`;
      const roomKey = `room:${ROOM_CODE}`;

      const playerData = await redis.hgetall(playerKey);
      const roomData = await redis.hgetall(roomKey);

      if (
        !playerData ||
        !roomData ||
        Object.keys(playerData).length === 0 ||
        Object.keys(roomData).length === 0
      ) {
        return socket.emit("ERR_SOCKET", {
          ERR_SOCKET: "app.error.ROOM_NOT_FOUND",
        });
      }

      // Verificar se o jogador está na sala
      const players: string[] = JSON.parse(roomData.PLAYERS || "[]");
      if (!players.includes(sanitizedUID)) {
        return socket.emit("ERR_SOCKET", {
          ERR_SOCKET: "app.error.PLAYER_NOT_IN_ROOM",
        });
      }

      socket.data.USER = playerData;
      socket.data.ROOM_CODE = ROOM_CODE;
      socket.join(ROOM_CODE);

      // Reconstruir ROOM completo com todos os jogadores
      const playerResults = await Promise.allSettled(
        players.map(async (uid) => {
          const p = await redis.hgetall(`player:${uid}`);
          return {
            UID: p.UID || "",
            NAME: p.NAME || "",
            PHOTO_URL: p.PHOTO_URL || "",
          };
        }),
      );

      const safePlayers = playerResults
        .filter(
          (result): result is PromiseFulfilledResult<{ UID: string; NAME: string; PHOTO_URL: string }> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      const ownerData = await redis.hgetall(`player:${roomData.OWNER_ID}`);

      const ROOM_OBJ = {
        ...roomData,
        OWNER: {
          UID: ownerData.UID || "",
          NAME: ownerData.NAME || "",
          PHOTO_URL: ownerData.PHOTO_URL || "",
        },
        PLAYERS: safePlayers,
      };

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
      socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.SERVER_ERROR",
      });
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
