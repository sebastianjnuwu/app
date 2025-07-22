import { showMessage } from "@ts/app/showMessage";
import { socket } from "@ts/app/Socket";
import { lang } from "@language/main";
import { Modal } from "bootstrap";
import { v4 } from 'uuid';
import $ from "jquery";

const $room_modal = new Modal($("#room_modal"));

const encode = (data: object) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  
const decode = (encoded: string) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return false;
  }
};

const DATA = decode(localStorage.getItem("USER"));

const ROOM_NAME = $("#room_name") as JQuery<HTMLInputElement>;

const RANDOM_UID = v4();
const RANDOM_PHOTO = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${Date.now()}`;

if (DATA) {
  ROOM_NAME.val(DATA.displayName);
  ROOM_NAME.prop("readonly", true);
} else {
  ROOM_NAME.val("");
  ROOM_NAME.prop("readonly", false);
}

const DECODE_PLAYER = decode(localStorage.getItem("PLAYER_INFO"));

if (DECODE_PLAYER && typeof DECODE_PLAYER === "object") {
  ROOM_NAME.val(DECODE_PLAYER.NAME);
  ROOM_NAME.prop("readonly", true);
};

$('input[name="option_game"]').on("change", () => {
  const option = $('input[name="option_game"]:checked').val() as string;
  const $room_code_input = $("#room_code") as JQuery<HTMLInputElement>;
  const $code_container = $("#code_container");
  const $game_container = $("#game_container");
  const $room_join_input = $("#room_join") as JQuery<HTMLInputElement>;
  const $room_public_input = $("#room_public") as JQuery<HTMLInputElement>;

  $room_public_input.prop("checked", false);
  $room_code_input.val("");

  if ($room_join_input.is(":checked")) {
    $code_container.show();
    $game_container.hide();
  } else if (option === "room_random") {
    $code_container.hide();
    $game_container.hide();
  } else {
    $code_container.hide();
    $game_container.show();
  }
});


$("#create_room").on("click", () => {
  
  const OPTION = $('input[name="option_game"]:checked').val() as string;
  
  const ROOM_PLAYER = ROOM_NAME.val() as string;
  
  const ROOM_PLAYER_LIMIT = $("#player_limit").val() as number;
  
  const ROOM_CODE = $("#room_code").val() as string;
  
  const ROOM_PUBLIC = $("#room_public").prop("checked") as boolean;
  
  const ROOM_TIME = $("#room_time").val() as string | null;
  
  const PLAYER_INFO = {
    ORIGINAL: !!DATA,
    UID: DATA?.uid || RANDOM_UID,
    NAME: DATA?.displayName || ROOM_PLAYER,
    PHOTO_URL: DATA?.photoURL || RANDOM_PHOTO,
  };

  if (!ROOM_PLAYER) {
    return showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.NO_ROOM_PLAYER")}`,
    );
  };

  if (OPTION === "room_random") {
    $room_modal.hide();

    socket.emit("join_random_room", {
      PLAYER: { ...PLAYER_INFO }
    });

    return;
  };

  if (OPTION === "create") {
    if (!ROOM_TIME) {
      return showMessage(
        `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.NO_ROOM_TIME")}`,
      );
    }

    const TIME_CHECK = Number.parseInt(ROOM_TIME, 10);

    if (Number.isNaN(TIME_CHECK) || TIME_CHECK < 10 || TIME_CHECK > 300) {
      return showMessage(
        `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.TIME_CHECK")}`,
      );
    }

    if (ROOM_PLAYER_LIMIT < 2) {
      return showMessage(
        `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.ROOM_LIMIT_MIN")}`,
      );
    }

    if (ROOM_PLAYER_LIMIT > 50) {
      return showMessage(
        `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.ROOM_LIMIT_MAX")}`,
      );
    }
  };

  if (OPTION === "join" && !ROOM_CODE) {
    return showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.NO_ROOM_CODE")}`,
    );
  };

  if (!socket.connected) {
    return showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("app.room.NO_CONNECTED")}`,
    );
  };

  $room_modal.hide();

  localStorage.setItem("PLAYER_INFO", encode(PLAYER_INFO));
  
  socket.emit("ROOM", {
    PLAYER: { ...PLAYER_INFO },
    ROOM_PUBLIC,
    ROOM_CODE,
    ROOM_PLAYER_LIMIT,
    ROOM_TIME,
  });
  
});