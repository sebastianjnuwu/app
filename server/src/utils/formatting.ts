/**
 * Formatting utilities for Cookie Clicker Brasil
 */

export const CONSTRAINTS = {
  MAX_NAME_LENGTH: 14,
  MAX_PLAYERS: 50,
  MIN_PLAYERS: 2,
  MIN_TIME: 10,
  MAX_TIME: 300,
  DEFAULT_TIME: 60,
} as const;

/**
 * Trunca nome do jogador para o tamanho máximo permitido
 */
export function truncateName(name: string): string {
  return name.substring(0, CONSTRAINTS.MAX_NAME_LENGTH);
}

/**
 * Converte string booleana do Redis para boolean
 */
export function parseBoolean(value: string | boolean | undefined): boolean {
  return value === "true" || value === true || value === "1";
}

/**
 * Converte número para string (para Redis)
 */
export function toString(value: number | string): string {
  return String(value);
}

/**
 * Converte string para número com fallback
 */
export function toNumber(value: string | number | undefined, fallback: number = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}
