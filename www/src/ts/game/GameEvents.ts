import { socket } from "../app/Socket";
import { showMessage } from "../app/showMessage";
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

// Iniciar jogo quando o dono clica no botão
$("#room_create_game").on("click", () => {
  const playerInfo = decode(localStorage.getItem("PLAYER_INFO"));
  const roomCode = localStorage.getItem("CODE");

  if (!playerInfo || !roomCode) {
    showMessage(
      `<i class="fas fa-exclamation-circle"></i> ${lang("app.error.INVALID_START_GAME_DATA")}`,
    );
    return;
  }

  socket.emit("START_GAME", {
    ROOM_CODE: roomCode,
    USER: {
      UID: playerInfo.UID,
      NAME: playerInfo.NAME || "Player",
    },
  });

  // Esconder botão após clicar
  $("#room_create_game").attr("hidden", "true");
});

// Ouvir eventos do jogo
socket.on("COUNT_DOWN", ({ countdown }: { countdown: number }) => {
  console.log("Countdown:", countdown);

  // Esconder tela de espera e mostrar countdown
  $("#GAMEPLAY").attr("hidden", "true");
  $("#countdown-container").removeAttr("hidden");

  if (countdown > 0) {
    $("#countdown").text(countdown);
  } else {
    $("#countdown").text(lang("general.start"));
  }
});

socket.on("GAME_START", () => {
  console.log("Game started!");

  // Resetar cookies
  localStorage.setItem("cookie", "0");

  // Esconder countdown e mostrar gameplay
  setTimeout(() => {
    $("#countdown-container").attr("hidden", "true");
    $("#GAMEPLAY").removeAttr("hidden");
    $("#game").show();
    $(".game-time").show();
  }, 1000);
});

socket.on("TIMER", ({ time_game }: { time_game: number }) => {
  $("#timer").text(time_game.toString());
});

socket.on("GAME_END", ({ ranking }: { ranking: Array<{ rank: number; room_player: string; cookies: number }> }) => {
  console.log("Game ended!", ranking);

  if (!Array.isArray(ranking)) {
    return;
  }

  // Resetar interface
  $("#cps").text("0");
  $("#click-cookie").text("0");
  localStorage.setItem("cookie", "0");

  // Esconder jogo e mostrar ranking
  $("#game").hide();
  $("#countdown-container").show();
  $("#countdown").html(
    '<i class="fas fa-trophy" style="color: #f4a261; font-size: 10rem; text-align: center;"></i>',
  );

  setTimeout(() => {
    $("#countdown-container").hide();
    $("#ranking").fadeIn();
    $("#ranking-list").empty();

    ranking.forEach((player, index) => {
      const playerName = player.room_player.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      $("#ranking-list").append(`
        <li class="${index === 0 ? "winner" : ""}">
          <span><b>#${player.rank}</b> ${playerName} - ${player.cookies || 0} cookies</span>
        </li>
      `);
    });

    showMessage(
      `<i class="fas fa-trophy"></i> ${lang("app.game.finished")}`,
    );
  }, 1200);
});
