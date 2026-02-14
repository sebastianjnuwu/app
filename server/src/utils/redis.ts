/**
 * Redis utilities for Cookie Clicker Brasil
 */

import redis from "../database/redis";

/**
 * Busca dados de uma sala
 */
export async function getRoom(code: string): Promise<Record<string, any>> {
  return redis.hgetall(`room:${code}`);
}

/**
 * Busca dados de um jogador
 */
export async function getPlayer(uid: string): Promise<Record<string, any>> {
  return redis.hgetall(`player:${uid}`);
}

/**
 * Salva dados de uma sala
 */
export async function setRoom(code: string, data: Record<string, any>): Promise<void> {
  await redis.hset(`room:${code}`, data);
}

/**
 * Salva dados de um jogador
 */
export async function setPlayer(uid: string, data: Record<string, any>): Promise<void> {
  await redis.hset(`player:${uid}`, data);
}

/**
 * Deleta uma sala
 */
export async function deleteRoom(code: string): Promise<void> {
  await redis.del(`room:${code}`);
}

/**
 * Deleta um campo de um jogador
 */
export async function deletePlayerField(uid: string, field: string): Promise<void> {
  await redis.hdel(`player:${uid}`, field);
}

/**
 * Busca todas as chaves de salas
 */
export async function getAllRoomKeys(): Promise<string[]> {
  return redis.keys("room:*");
}
