import { 
  io, type Socket 
} from "socket.io-client";
import { showMessage } from "../app/showMessage";

const SOCKET_URL = "http://localhost:3000";

//import.meta.env.VITE_SOCKET_URL ?? "https://socket-hj1h.onrender.com";

const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 5000,
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("[Socket] connected.");
});

export { socket };