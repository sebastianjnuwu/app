import { socket } from "../app/Socket";
import $ from "jquery";

// Variáveis do jogo
let cookies = 0;
let cps = 0; // cookies per second

// Função para atualizar CPS
const updateCps = (): void => {
  $("#cps").text(cps.toString());
  cps = 0; // Reset após exibir
};

// Atualizar CPS a cada segundo
setInterval(updateCps, 1000);

// Função para atualizar cookies
const updateCookies = (): void => {
  cookies++;
  cps++;

  // Atualizar UI
  $("#click-cookie").text(cookies.toString());
  localStorage.setItem("cookie", cookies.toString());

  // Enviar para o servidor
  const playerInfo = localStorage.getItem("PLAYER_INFO");
  const roomCode = localStorage.getItem("CODE");

  if (!playerInfo || !roomCode) {
    return;
  }

  let parsedPlayer;
  try {
    parsedPlayer = JSON.parse(decodeURIComponent(escape(atob(playerInfo))));
  } catch {
    return;
  }

  socket.emit("UPDATE_COOKIES", {
    ROOM_CODE: roomCode,
    USER: {
      UID: parsedPlayer.uid,
    },
    cookies,
  });
};

// Click no cookie grande
$("#cookie").on("click", () => {
  updateCookies();

  // Animação de click
  $("#cookie").addClass("cookie-click");
  setTimeout(() => {
    $("#cookie").removeClass("cookie-click");
  }, 100);
});

// Garantir que cookies começa em 0 quando o jogo inicia
socket.on("GAME_START", () => {
  cookies = 0;
  cps = 0;
  $("#click-cookie").text("0");
  $("#cps").text("0");
});

// Resetar quando o jogo termina
socket.on("GAME_END", () => {
  cookies = 0;
  cps = 0;
  $("#click-cookie").text("0");
  $("#cps").text("0");
});
