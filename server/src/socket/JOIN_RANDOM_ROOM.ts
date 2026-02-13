import { logger } from "@functions/logger";
import { safePlayer } from "@functions/generator";
import { RoomState } from "../constants/constants";
import redis from "@database/redis";
import chalk from "chalk";
import type { Socket, Server } from "socket.io";

interface PlayerInfo {
  UID: string;
  NAME: string;
  PHOTO_URL: string;
  ORIGINAL: boolean;
}

interface JoinRandomRoomData {
  PLAYER: PlayerInfo;
}

/**
 * Entra em uma sala pública aleatória.
 * Busca salas públicas em estado WAITING e com vagas disponíveis.
 */
export async function JOIN_RANDOM_ROOM(
  socket: Socket,
  io: Server,
  { PLAYER }: JoinRandomRoomData,
) {
  try {
    // Validação de entrada
    if (!PLAYER || !PLAYER.UID || !PLAYER.NAME) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.INVALID_PLAYER_DATA",
      });
    }

    // Sanitizar UID
    const sanitizedUID = String(PLAYER.UID).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!sanitizedUID) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.INVALID_PLAYER_UID",
      });
    }

    // Buscar todas as chaves de sala no Redis
    const roomKeys = await redis.keys("room:*");

    if (roomKeys.length === 0) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.NO_PUBLIC_ROOMS_AVAILABLE",
      });
    }

    // Filtrar salas públicas disponíveis
    const availableRooms: Array<{ key: string; code: string; data: any }> = [];

    for (const roomKey of roomKeys) {
      const roomData = await redis.hgetall(roomKey);

      if (!roomData || Object.keys(roomData).length === 0) {
        continue;
      }

      // Verificar critérios:
      // 1. Sala pública
      // 2. Estado WAITING
      // 3. Não está cheia
      const isPublic = roomData.PUBLIC === "true";
      const isWaiting = roomData.STATE === RoomState.WAITING;
      const players: string[] = JSON.parse(roomData.PLAYERS || "[]");
      const playerLimit = Number(roomData.PLAYER_LIMIT) || 10;
      const hasSpace = players.length < playerLimit;
      const playerNotInRoom = !players.includes(sanitizedUID);

      if (isPublic && isWaiting && hasSpace && playerNotInRoom) {
        const roomCode = roomKey.replace("room:", "");
        availableRooms.push({
          key: roomKey,
          code: roomCode,
          data: roomData,
        });
      }
    }

    if (availableRooms.length === 0) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.NO_PUBLIC_ROOMS_AVAILABLE",
      });
    }

    // Selecionar sala aleatória
    const randomIndex = Math.floor(Math.random() * availableRooms.length);
    const selectedRoom = availableRooms[randomIndex];
    const CODE = selectedRoom.code;
    const ROOM = selectedRoom.data;

    // Verificar nome duplicado
    const players: string[] = JSON.parse(ROOM.PLAYERS || "[]");
    const playerNames = await Promise.allSettled(
      players.map(async (uid) => {
        const p = await redis.hgetall(`player:${uid}`);
        return p.NAME;
      }),
    );

    const existingNames = playerNames
      .filter((result) => result.status === "fulfilled")
      .map((result: any) => result.value);

    const truncatedName = PLAYER.NAME.substring(0, 14);
    if (existingNames.some((name) => name === truncatedName)) {
      return socket.emit("ERR_SOCKET", {
        ERR_SOCKET: "app.error.DUPLICATE_NAME",
      });
    }

    // Criar ou atualizar jogador no Redis
    const playerKey = `player:${sanitizedUID}`;
    let PLAYER_IN_DB = await redis.hgetall(playerKey);

    if (!PLAYER_IN_DB || Object.keys(PLAYER_IN_DB).length === 0) {
      PLAYER_IN_DB = {
        UID: sanitizedUID,
        NAME: truncatedName,
        PHOTO_URL: PLAYER.PHOTO_URL,
        IS_ORIGINAL: PLAYER.ORIGINAL.toString(),
        ROOM_ID: CODE,
      };
    } else {
      // Atualizar dados do jogador
      PLAYER_IN_DB.ROOM_ID = CODE;
      PLAYER_IN_DB.NAME = truncatedName;
      PLAYER_IN_DB.PHOTO_URL = PLAYER.PHOTO_URL;
      PLAYER_IN_DB.IS_ORIGINAL = PLAYER.ORIGINAL.toString();
    }

    await redis.hset(playerKey, PLAYER_IN_DB);

    // Adicionar jogador à sala
    players.push(sanitizedUID);
    ROOM.PLAYERS = JSON.stringify(players);
    await redis.hset(selectedRoom.key, ROOM);

    // Entrar no canal do socket.io
    socket.join(CODE);

    // Reconstruir lista de jogadores para enviar ao cliente
    const playerResults = await Promise.allSettled(
      players.map(async (uid) => {
        const p = await redis.hgetall(`player:${uid}`);
        return safePlayer(p);
      }),
    );

    const safePlayers = playerResults
      .filter(
        (result): result is PromiseFulfilledResult<ReturnType<typeof safePlayer>> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    // Buscar dono da sala
    const ownerData = await redis.hgetall(`player:${ROOM.OWNER_ID}`);

    const ROOM_OBJ = {
      ...ROOM,
      OWNER: safePlayer(ownerData),
      PLAYERS: safePlayers,
    };

    // Emitir evento para todos na sala
    io.in(CODE).emit("UPDATE_ROOM", {
      TYPE: "JOIN",
      PLAYER: safePlayer(PLAYER_IN_DB),
      ROOM: ROOM_OBJ,
    });

    logger.info(
      `🎲 Player ${chalk.green(`"${truncatedName}"`)} joined random room ${chalk.cyan(`"${CODE}"`)} (${safePlayers.length}/${ROOM.PLAYER_LIMIT} players)`,
    );
  } catch (err) {
    logger.error(`Error in JOIN_RANDOM_ROOM handler: ${err}`);
    socket.emit("ERR_SOCKET", {
      ERR_SOCKET: "app.error.SERVER_ERROR",
    });
  }
}
