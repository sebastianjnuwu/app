import { io, type Socket } from "socket.io-client";

/**
 * The URL of the Socket.IO server.
 *
 * This constant attempts to load the WebSocket server URL from the environment
 * variable `VITE_SOCKET_URL` (provided by Vite). If not available, it falls back
 * to a default production URL hosted on Render.
 */
const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL || "https://socket-hj1h.onrender.com";

/**
 * The Socket.IO client instance.
 *
 * This socket is configured with:
 * - Transport protocols: `websocket`, `polling` (as fallback).
 * - Automatic reconnection enabled (up to 10 attempts, with a delay of 1 second between each).
 *
 * @remarks
 * Export this socket to be reused across different modules of the application.
 */
const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export { socket };