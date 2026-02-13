/**
 * Enum for room states
 */
export enum RoomState {
  WAITING = "WAITING",
  IN_GAME = "IN_GAME",
  FINISHED = "FINISHED",
}

/**
 * Update room event types
 */
export enum UpdateRoomType {
  CREATE = "CREATE",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  REJOIN = "REJOIN",
  OWNER_CHANGED = "OWNER_CHANGED",
}
