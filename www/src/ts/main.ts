import { signInWithGoogle, LogEvent } from "./app/plugins/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { showMessage } from "./app/showMessage";
import { lang } from "../locales/main";
import { socket } from "./app/Socket";
import "bootstrap";
import "@scss/ui.scss";
import "@ts/app/VersionUpdate";
import $ from "jquery";

import "@ts/game/StartRoom"; // Entrar na sala / Criar sala
import "@ts/game/UpdateRoom"; // Atualização de sala (entrada, saída, reentrada)
import "@ts/game/LeaveRoom";

// Função para serializar objetos no localStorage
const encode = (data: object) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(data))));

// Função para deserializar
const decode = <T = any>(str: string): T =>
  JSON.parse(decodeURIComponent(escape(atob(str))));

$(() => {
  // Conecta o socket
  socket.connect();

  // Listener para erros do servidor
  socket.on("ERR_SOCKET", ({ ERR_SOCKET }: { ERR_SOCKET: string }) => {
    showMessage(lang(ERR_SOCKET));
  });

  // Splash screen
  $("#splash_screen img").on("click", () => {
    const musicElem = document.getElementById("MUSIC_SONG") as HTMLAudioElement;
    if (!localStorage.MusicEnabled && musicElem) musicElem.play();

    $("#splash_screen").addClass("fade-out").attr("hidden", "true");
    $("#home_menu").addClass("fade-in").removeAttr("hidden");
  });

  // Efeitos sonoros
  $(document).on("click", ".SOUND_EFFECT", () => {
    const clickSong = document.getElementById("CLICK_SONG") as HTMLAudioElement;
    if (localStorage.getItem("SoundEnabled") !== "false" && clickSong)
      clickSong.play();
  });

  // Overlay de cookies
  if (!localStorage.getItem("BITE")) {
    $("#overlay").attr("hidden", "false");
    $("#cookie").css("display", "block");
  }

  $("#reject-cookies").on("click", () => {
    $("#overlay").attr("hidden", "true");
    $("#cookie").css("animation", "slideInEnd 0.8s ease forwards");
  });

  $("#accept-cookies").on("click", () => {
    localStorage.setItem("BITE", "1");
    $("#overlay").attr("hidden", "true");
    $("#cookie").css("animation", "slideInEnd 0.8s ease forwards");
  });

  // Status do login
  const UserStatus = localStorage.getItem("USER")
    ? "app.login.logout"
    : "app.login.google";
  $("#google").text(lang(UserStatus));

  $(".google").on("click", async () => {
    if (localStorage.getItem("USER")) {
      localStorage.removeItem("USER");
      $("#google").text(lang("app.login.google"));
      return;
    }

    const user = await signInWithGoogle();
    if (!user) return;

    localStorage.setItem("USER", encode(user));
    $("#google").text(lang("app.login.logout"));
    await LogEvent("login", { method: "GOOGLE" });
  });

  // Toggle sound/music
  const toggleAudio = (id: string, enabledKey: string) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    el.checked = localStorage.getItem(enabledKey) !== "false";

    el.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      localStorage.setItem(enabledKey, target.checked.toString());

      if (id === "toggleMusic") {
        const musicElem = document.getElementById(
          "MUSIC_SONG",
        ) as HTMLAudioElement;
        if (musicElem) {
          target.checked ? musicElem.play() : musicElem.pause();
        }
      }
    });
  };

  toggleAudio("toggleSound", "SoundEnabled");
  toggleAudio("toggleMusic", "MusicEnabled");

  // Atualiza visibilidade do código da sala
  function updateRoomCodeVisibility() {
    const hide = localStorage.getItem("hide_room_code") === "true";
    const $code = $("#ROOM_CODE_TEXT");
    const $icon = $("#toggle_code_visibility i");

    if ($code.length && $icon.length) {
      if (hide) {
        $code.text("••••••");
        $icon.removeClass("fa-eye").addClass("fa-eye-slash");
      } else {
        $code.text(localStorage.getItem("CODE") || "");
        $icon.removeClass("fa-eye-slash").addClass("fa-eye");
      }
    }
  }

  $("#toggle_code_visibility").on("click", () => {
    const hide = localStorage.getItem("hide_room_code") === "true";
    localStorage.setItem("hide_room_code", (!hide).toString());
    updateRoomCodeVisibility();
  });

  updateRoomCodeVisibility();
});
