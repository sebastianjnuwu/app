import { showMessage } from "@ts/app/showMessage";
import { socket } from "@ts/app/Socket";
import { lang } from "@language/main";
import $ from "jquery";

const decode = (encoded: string) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return false;
  }
};

socket.on("UPDATE_ROOM", ({ TYPE, PLAYER, ROOM }) => {

  if (ROOM.STATE == "WAITING") {
    $("#home_menu").attr("hidden", true);
    $("#GAMEPLAY").attr("hidden", false);
  };

  localStorage.setItem("CODE", ROOM.CODE);
  $("#ROOM_CODE_TEXT").text(ROOM.CODE);
  $("#PLAYER_ONLINE").text(ROOM.PLAYERS.length);
  $("#PLAYER_MAX").text(ROOM.PLAYER_LIMIT);

  switch (TYPE) {
    case "CREATE":
      $("#room_create_game").attr("hidden", false);
      break;
    case "JOIN":
      showMessage(`<i class="fas fa-sign-in-alt"></i> ${lang("app.room.message.join", { room_player: PLAYER.NAME })}`);
      break;
    case "LEAVE":
      showMessage(`<i class="fas fa-sign-out-alt"></i> ${lang("app.room.message.leave", { room_player: PLAYER.NAME })}`);
      break;
    case "REJOIN":
      showMessage(`<i class="fas fa-user-clock"></i> ${lang("app.room.message.rejoin", { room_player: PLAYER.NAME })}`);
      break;
    case "OWNER_CHANGED":
      if (decode(localStorage.getItem("PLAYER_INFO")).UID == ROOM.OWNER.UID) {
        $("#room_create_game").attr("hidden", false);
      }
      showMessage(`<i class="fas fa-crown"></i>
      ${lang("app.room.message.owner_changed")}`);
      break;
  }

});