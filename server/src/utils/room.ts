/**
 * Room utilities for Cookie Clicker Brasil
 */

import { safePlayer } from "../functions/generator";
import { getPlayer } from "./redis";

/**
 * Cria objeto SafePlayer a partir de dados do Redis
 */
function createSafePlayer(playerData: Record<string, any>) {
  return {
    UID: playerData.UID || "",
    NAME: playerData.NAME || "",
    PHOTO_URL: playerData.PHOTO_URL || "",
  };
}

/**
 * Reconstrói objeto ROOM completo com OWNER e PLAYERS
 */
export async function buildRoomObject(room: Record<string, any>) {
  const players: string[] = JSON.parse(room.PLAYERS || "[]");

  // Buscar todos os jogadores em paralelo
  const playerResults = await Promise.allSettled(
    players.map(async (uid) => {
      const p = await getPlayer(uid);
      return createSafePlayer(p);
    }),
  );

  // Filtrar apenas sucessos
  const safePlayers = playerResults
    .filter(
      (result): result is PromiseFulfilledResult<{
        UID: string;
        NAME: string;
        PHOTO_URL: string;
      }> => result.status === "fulfilled",
    )
    .map((result) => result.value);

  // Buscar dono
  const ownerData = await getPlayer(room.OWNER_ID);

  return {
    ...room,
    OWNER: createSafePlayer(ownerData),
    PLAYERS: safePlayers,
  };
}

/**
 * Verifica se jogador está na sala
 */
export function isPlayerInRoom(room: Record<string, any>, uid: string): boolean {
  const players: string[] = JSON.parse(room.PLAYERS || "[]");
  return players.includes(uid);
}

/**
 * Adiciona jogador à sala
 */
export function addPlayerToRoom(room: Record<string, any>, uid: string): void {
  const players: string[] = JSON.parse(room.PLAYERS || "[]");
  if (!players.includes(uid)) {
    players.push(uid);
    room.PLAYERS = JSON.stringify(players);
  }
}

/**
 * Remove jogador da sala
 */
export function removePlayerFromRoom(room: Record<string, any>, uid: string): string[] {
  const players: string[] = JSON.parse(room.PLAYERS || "[]");
  const remaining = players.filter((p) => p !== uid);
  room.PLAYERS = JSON.stringify(remaining);
  return remaining;
}

/**
 * Busca nomes de todos os jogadores na sala
 */
export async function getRoomPlayerNames(room: Record<string, any>): Promise<string[]> {
  const players: string[] = JSON.parse(room.PLAYERS || "[]");

  const nameResults = await Promise.allSettled(
    players.map(async (uid) => {
      const p = await getPlayer(uid);
      return p.NAME;
    }),
  );

  return nameResults
    .filter((result) => result.status === "fulfilled")
    .map((result: any) => result.value);
}
