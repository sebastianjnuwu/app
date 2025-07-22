import { socket } from "@ts/app/Socket";
import $ from "jquery";

const decode = (encoded: string) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return false;
  }
};

$("#leave_room_game").on("click", () => {

  socket.emit("LEAVE_ROOM", {
    USER: decode(localStorage.getItem("PLAYER_INFO")),
    ROOM_CODE: localStorage.getItem("CODE")
  });
 
  $("#GAMEPLAY").attr("hidden", true);
  $("#home_menu").attr("hidden", false); 
  
  localStorage.removeItem("CODE");
    
});