
interface PLAYER_INFO {
  ORIGINAL: boolean;
  UID: string;
  NAME: string;
  PHOTO_URL: string;
}

interface RoomEventPayload {
  PLAYER: PLAYER_INFO;
  ROOM_PUBLIC?: boolean;
  ROOM_CODE?: string;
  ROOM_PLAYER_LIMIT?: number | string;
  ROOM_TIME?: number | string;
}

export {};