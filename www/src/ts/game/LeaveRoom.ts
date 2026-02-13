import { socket } from "@ts/app/Socket";
import $ from "jquery";

const decode = (encoded: string | null) => {
  if (!encoded) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
};

$("#leave_room_game").on("click", () => {
  const playerInfo = decode(localStorage.getItem("PLAYER_INFO"));
  const roomCode = localStorage.getItem("CODE");

  if (!playerInfo || !roomCode) {
    return;
  }

  socket.emit("LEAVE_ROOM", {
    USER: playerInfo,
    ROOM_CODE: roomCode,
  });

  $("#GAMEPLAY").attr("hidden", true);
  $("#home_menu").attr("hidden", false);

  localStorage.removeItem("CODE");
});
