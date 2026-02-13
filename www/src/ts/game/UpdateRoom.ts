import { showMessage } from "../app/showMessage";
import { socket } from "../app/Socket";
import { lang } from "../../locales/main";
import $ from "jquery";

const decode = (encoded: string | null) => {
  if (!encoded) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
};

socket.on(
  "UPDATE_ROOM",
  ({
    TYPE,
    PLAYER,
    ROOM,
  }: { TYPE: string; PLAYER: { NAME: string }; ROOM: any }) => {
    if (!ROOM) return;

    // Se o player atual não está mais na sala, fecha a gameplay imediatamente
    const localPlayer = decode(localStorage.getItem("PLAYER_INFO"));
    const playerStillInRoom = ROOM.PLAYERS?.some(
      (p: any) => p.UID === localPlayer?.UID,
    );

    if (!playerStillInRoom) {
      $("#GAMEPLAY").attr("hidden", "true");
      $("#home_menu").removeAttr("hidden");
      showMessage(
        `<i class="fas fa-sign-out-alt"></i> ${lang("app.room.message.leave", { room_player: localPlayer?.NAME })}`,
      );
      return; // não processa mais nada, o jogador saiu
    }

    // Sala ainda válida, atualiza interface
    if (ROOM.STATE === "WAITING") {
      $("#home_menu").attr("hidden", "true");
      $("#GAMEPLAY").removeAttr("hidden");
    }

    localStorage.setItem("CODE", ROOM.CODE || "");
    $("#ROOM_CODE_TEXT").text(ROOM.CODE || "");
    $("#PLAYER_ONLINE").text(String(ROOM.PLAYERS?.length || 0));
    $("#PLAYER_MAX").text(String(ROOM.PLAYER_LIMIT || 0));

    switch (TYPE) {
      case "CREATE":
        $("#room_create_game").removeAttr("hidden");
        break;

      case "JOIN":
        showMessage(
          `<i class="fas fa-sign-in-alt"></i> ${lang("app.room.message.join", { room_player: PLAYER.NAME })}`,
        );
        break;

      case "LEAVE":
        showMessage(
          `<i class="fas fa-sign-out-alt"></i> ${lang("app.room.message.leave", { room_player: PLAYER.NAME })}`,
        );
        break;

      case "REJOIN":
        showMessage(
          `<i class="fas fa-user-clock"></i> ${lang("app.room.message.rejoin", { room_player: PLAYER.NAME })}`,
        );
        break;

      case "OWNER_CHANGED":
        if (localPlayer?.UID === ROOM.OWNER?.UID) {
          $("#room_create_game").removeAttr("hidden");
        } else {
          $("#room_create_game").attr("hidden", "true");
        }
        showMessage(
          `<i class="fas fa-crown"></i> ${lang("app.room.message.owner_changed")}`,
        );
        break;
    }
  },
);
