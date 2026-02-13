/**
 * Interfaces TypeScript para o Cookie Clicker Brasil
 */

// ===== INTERFACES DE JOGADOR =====

export interface PlayerInfo {
  UID: string;
  NAME: string;
  PHOTO_URL: string;
  ORIGINAL: boolean;
}

export interface PlayerData {
  UID: string;
  NAME: string;
  PHOTO_URL: string;
  IS_ORIGINAL: string;
  ROOM_ID: string;
  COOKIES?: string;
}

export interface SafePlayer {
  UID: string;
  NAME: string;
  PHOTO_URL: string;
}

// ===== INTERFACES DE SALA =====

export interface RoomData {
  CODE: string;
  OWNER_ID: string;
  STATE: "WAITING" | "IN_GAME" | "FINISHED";
  PLAYER_LIMIT: string;
  PUBLIC: string;
  TIME: string;
  PLAYERS: string;
}

export interface SafeRoom {
  CODE: string;
  STATE: "WAITING" | "IN_GAME" | "FINISHED";
  PLAYER_LIMIT: number;
  PUBLIC: boolean;
  TIME: number;
  OWNER: SafePlayer;
  PLAYERS: SafePlayer[];
}

// ===== INTERFACES DE EVENTOS SOCKET =====

export interface RoomEventPayload {
  PLAYER: PlayerInfo;
  ROOM_PUBLIC?: boolean;
  ROOM_CODE?: string;
  ROOM_PLAYER_LIMIT?: number | string;
  ROOM_TIME?: number | string;
}

export interface LeaveRoomData {
  USER: PlayerInfo;
  ROOM_CODE: string;
}

export interface StartGameData {
  ROOM_CODE: string;
  USER: {
    UID: string;
    NAME: string;
  };
}

export interface UpdateCookiesData {
  ROOM_CODE: string;
  USER: {
    UID: string;
  };
  cookies: number;
}

export interface RejoinRoomData {
  USER: PlayerInfo;
  ROOM_CODE: string;
}

// ===== INTERFACES DE EVENTOS DO JOGO =====

export interface CountdownEvent {
  countdown: number;
}

export interface TimerEvent {
  time_game: number;
}

export interface PlayerScore {
  uid: string;
  name: string;
  cookies: number;
}

export interface RankingEntry {
  rank: number;
  room_player: string;
  cookies: number;
}

export interface GameEndEvent {
  ranking: RankingEntry[];
}
