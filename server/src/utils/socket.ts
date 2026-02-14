/**
 * Socket utilities for Cookie Clicker Brasil
 */

import type { Socket } from "socket.io";

/**
 * Mensagens de erro padronizadas
 */
export const ErrorMessages = {
  INVALID_PLAYER_DATA: "app.error.INVALID_PLAYER_DATA",
  INVALID_PLAYER_UID: "app.error.INVALID_PLAYER_UID",
  INVALID_PLAYER_LIMIT: "app.error.INVALID_PLAYER_LIMIT",
  INVALID_PLAYER_LIMIT_MIN: "app.error.INVALID_PLAYER_LIMIT_MIN",
  INVALID_PLAYER_LIMIT_MAX: "app.error.INVALID_PLAYER_LIMIT_MAX",
  INVALID_ROOM_TIME: "app.error.INVALID_ROOM_TIME",
  INVALID_ROOM_TIME_MIN: "app.error.INVALID_ROOM_TIME_MIN",
  INVALID_ROOM_TIME_MAX: "app.error.INVALID_ROOM_TIME_MAX",
  INVALID_REJOIN_DATA: "app.error.INVALID_REJOIN_DATA",
  INVALID_START_GAME_DATA: "app.error.INVALID_START_GAME_DATA",
  ROOM_FULL: "app.error.ROOM_FULL",
  ROOM_STATE_ERROR_IN_GAME: "app.error.ROOM_STATE_ERROR_IN_GAME",
  ROOM_STATE_ERROR_FINISHED: "app.error.ROOM_STATE_ERROR_FINISHED",
  ROOM_NOT_FOUND: "app.error.ROOM_NOT_FOUND",
  PLAYER_EXISTS: "app.error.PLAYER_EXISTS",
  PLAYER_NOT_IN_ROOM: "app.error.PLAYER_NOT_IN_ROOM",
  DUPLICATE_NAME: "app.error.DUPLICATE_NAME",
  NO_PUBLIC_ROOMS_AVAILABLE: "app.error.NO_PUBLIC_ROOMS_AVAILABLE",
  NO_PLAYERS: "app.error.NO_PLAYERS",
  NOT_ROOM_OWNER: "app.error.NOT_ROOM_OWNER",
  GAME_ALREADY_STARTED: "app.error.GAME_ALREADY_STARTED",
  DATA_NOT_FOUND: "app.error.DATA_NOT_FOUND",
  SERVER_ERROR: "app.error.SERVER_ERROR",
} as const;

export type ErrorKey = keyof typeof ErrorMessages;

/**
 * Emite erro padronizado para o socket
 */
export function emitError(socket: Socket, errorKey: ErrorKey): void {
  socket.emit("ERR_SOCKET", {
    ERR_SOCKET: ErrorMessages[errorKey],
  });
}

/**
 * Emite erro e retorna void (para early return)
 */
export function returnError(socket: Socket, errorKey: ErrorKey): void {
  emitError(socket, errorKey);
}
