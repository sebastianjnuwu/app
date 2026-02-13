import { logger } from "@functions/logger";
import { RoomState } from "../constants/constants";
import redis from "@database/redis";
import chalk from "chalk";
import type { Socket, Server } from "socket.io";

interface StartGameData {
  ROOM_CODE: string;
  USER: {
    UID: string;
    NAME: string;
  };
}

/**
 * Inicia o jogo em uma sala Redis.
 * Apenas o dono da sala pode iniciar.
 */
export async function START_GAME(
  socket: Socket,
  io: Server,
  { ROOM_CODE, USER }: StartGameData,
) {
  try {
    // Validação de entrada
    if (!ROOM_CODE || !USER || !USER.UID) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.INVALID_START_GAME_DATA",
      });
    }

    const roomKey = `room:${ROOM_CODE}`;
    const ROOM = await redis.hgetall(roomKey);

    if (!ROOM || Object.keys(ROOM).length === 0) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.ROOM_NOT_FOUND",
      });
    }

    // Verificar se o usuário é o dono da sala
    if (ROOM.OWNER_ID !== USER.UID) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.NOT_ROOM_OWNER",
      });
    }

    // Verificar se a sala está em estado WAITING
    if (ROOM.STATE !== RoomState.WAITING) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.GAME_ALREADY_STARTED",
      });
    }

    // Verificar se há pelo menos 1 jogador (pode jogar sozinho para teste)
    const players: string[] = JSON.parse(ROOM.PLAYERS || "[]");
    if (players.length === 0) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.NO_PLAYERS",
      });
    }

    // Atualizar estado da sala para IN_GAME
    ROOM.STATE = RoomState.IN_GAME;
    await redis.hset(roomKey, ROOM);

    // Reconstruir ROOM completo para emitir
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

    const ownerData = await redis.hgetall(`player:${ROOM.OWNER_ID}`);

    const ROOM_OBJ = {
      ...ROOM,
      OWNER: {
        UID: ownerData.UID || "",
        NAME: ownerData.NAME || "",
        PHOTO_URL: ownerData.PHOTO_URL || "",
      },
      PLAYERS: safePlayers,
    };

    // Notificar todos que o jogo está iniciando
    io.in(ROOM_CODE).emit("UPDATE_ROOM", {
      TYPE: "GAME_STARTING",
      ROOM: ROOM_OBJ,
    });

    logger.info(
      `🎮 Game starting in room ${chalk.cyan(ROOM_CODE)} by ${chalk.green(USER.NAME)}`,
    );

    // Emitir countdown (3, 2, 1, 0, start)
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      io.in(ROOM_CODE).emit("COUNT_DOWN", { countdown });

      if (countdown <= 0) {
        clearInterval(countdownInterval);

        // Emitir evento de início do jogo
        io.in(ROOM_CODE).emit("GAME_START");

        // Iniciar timer do jogo
        const gameTime = Number(ROOM.TIME) || 60; // Default 60 segundos
        let timeRemaining = gameTime;

        const timerInterval = setInterval(async () => {
          io.in(ROOM_CODE).emit("TIMER", { time_game: timeRemaining });

          if (timeRemaining <= 0) {
            clearInterval(timerInterval);

            // Buscar todos os jogadores e seus cookies
            const playerScores = await Promise.allSettled(
              players.map(async (uid) => {
                const playerKey = `player:${uid}`;
                const playerData = await redis.hgetall(playerKey);
                const cookies = Number(playerData.COOKIES || 0);

                return {
                  uid,
                  name: playerData.NAME || "Unknown",
                  cookies,
                };
              }),
            );

            // Filtrar apenas os sucessos e ordenar por cookies
            const validScores = playerScores
              .filter((result) => result.status === "fulfilled")
              .map((result: any) => result.value)
              .sort((a, b) => b.cookies - a.cookies);

            // Criar ranking
            const ranking = validScores.map((player, index) => ({
              rank: index + 1,
              room_player: player.name,
              cookies: player.cookies,
            }));

            // Atualizar estado da sala para FINISHED
            ROOM.STATE = RoomState.FINISHED;
            await redis.hset(roomKey, ROOM);

            // Emitir resultado final
            io.in(ROOM_CODE).emit("GAME_END", { ranking });

            logger.info(
              `🏁 Game ended in room ${chalk.cyan(ROOM_CODE)}. Winner: ${chalk.yellow(ranking[0]?.room_player)} with ${ranking[0]?.cookies} cookies`,
            );

            // Limpar cookies dos jogadores após o jogo
            for (const uid of players) {
              await redis.hdel(`player:${uid}`, "COOKIES");
            }

            // Deletar sala após 30 segundos
            setTimeout(async () => {
              await redis.del(roomKey);
              logger.info(`🗑️  Room ${chalk.cyan(ROOM_CODE)} deleted after game end`);
            }, 30000);
          }

          timeRemaining--;
        }, 1000);

        logger.info(
          `⏱️  Timer started for room ${chalk.cyan(ROOM_CODE)} - ${gameTime} seconds`,
        );
      }

      countdown--;
    }, 1000);
  } catch (err) {
    logger.error(`Error in START_GAME handler: ${err}`);
    socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.SERVER_ERROR",
    });
  }
}
