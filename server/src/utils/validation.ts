/**
 * Validation utilities for Cookie Clicker Brasil
 */

const UID_REGEX = /[^a-zA-Z0-9_-]/g;

/**
 * Valida e sanitiza um UID
 */
export function validateUID(uid: any): { valid: boolean; sanitized: string } {
  const sanitized = String(uid ?? "").replace(UID_REGEX, "");
  return {
    valid: sanitized.length > 0,
    sanitized,
  };
}

/**
 * Verifica se um objeto do Redis está vazio
 */
export function isEmpty(obj: Record<string, any> | null | undefined): boolean {
  return !obj || Object.keys(obj).length === 0;
}

/**
 * Valida se um objeto do Redis existe e não está vazio
 */
export function exists(obj: Record<string, any> | null | undefined): boolean {
  return !isEmpty(obj);
}

/**
 * Valida dados básicos do jogador
 */
export function validatePlayer(player: any): boolean {
  return Boolean(player && player.UID && player.NAME);
}

/**
 * Valida dados básicos da sala
 */
export function validateRoom(room: any): boolean {
  return Boolean(room && room.CODE && room.OWNER_ID);
}
