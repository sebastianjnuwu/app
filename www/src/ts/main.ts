import { signInWithGoogle } from "@ts/app/plugins/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import { showMessage } from "@ts/app/showMessage";
import { lang } from "@language/main";
import { socket } from "@ts/app/Socket";
import { LogEvent } from "@ts/app/plugins/firebase";
import "bootstrap";
import "@scss/ui.scss";
import "@ts/app/VersionUpdate";
import $ from "jquery";

import "@ts/game/StartRoom";
import "@ts/game/UpdateRoom";
import "@ts/game/LeaveRoom";

const encode = (data: object) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(data))));

$(() => {

socket.connect();

socket.on("ERR_SOCKET", ({ ERR_SOCKET }: { ERR_SOCKET: string }) => {
  return showMessage(lang(ERR_SOCKET));
});

socket.on("UPDATE_ROOM", (a) => {
  console.log(a)
});

$("#splash_screen img").on("click", () => {

  if (!localStorage.MusicEnabled) $("#MUSIC_SONG")[0].play();
  
  $("#splash_screen").attr("hidden", true);
  $("#home_menu").attr("hidden", false);
    
});

$(document).on("click", ".SOUND_EFFECT", () => {
  if (localStorage.getItem("SoundEnabled") !== "false") $("#CLICK_SONG")[0].play();
});

if (!localStorage.getItem('BITE')) {
  $('#overlay').attr("hidden", false);
  $("#cookie").css('display', 'block');
};

$('#reject-cookies').on('click', () => {
  $('#overlay').attr("hidden", true);
  $("#cookie").css('animation', 'slideInEnd 0.8s ease forwards');
});

$('#accept-cookies').on('click', () => {
  localStorage.setItem('BITE', "1");
  $('#overlay').attr("hidden", true);
  $("#cookie").css('animation', 'slideInEnd 0.8s ease forwards');
});
  
const UserStatus = localStorage.getItem("USER") ? "app.login.logout" : "app.login.google";

$("#google").text(lang(UserStatus));

$(".google").on("click", async () => {
  
  if (localStorage.getItem("USER")) {
    localStorage.removeItem("USER");
    return $("#google").text(lang("app.login.google"));
  };

  const user = await signInWithGoogle();
  if (!user) return;
  
  localStorage.setItem("USER", encode(user));
  $("#google").text(lang("app.login.logout"));
  
  await LogEvent("login", { method: "GOOGLE" });
  
});

$("#toggleSound").prop("checked", localStorage.getItem("SoundEnabled") !== "false");

$("#toggleMusic").prop("checked", localStorage.getItem("MusicEnabled") !== "false");

$("#toggleSound").on("change", (event) => {
  localStorage.setItem("SoundEnabled", event.target.checked.toString());
});

$("#toggleMusic").on("change", (event) => {
  localStorage.setItem("MusicEnabled", event.target.checked.toString());
  if (event.target.checked) $("#MUSIC_SONG")[0].play(); else $("#MUSIC_SONG")[0].pause();
});

function updateRoomCodeVisibility() {
  const hide = localStorage.getItem('hide_room_code') === 'true';
  const $code = $('#ROOM_CODE_TEXT');
  const $icon = $('#toggle_code_visibility i');

  if (hide) {
    $code.text('••••••');
    $icon.removeClass('fa-eye').addClass('fa-eye-slash');
  } else {
    $code.text(localStorage.getItem("CODE"));
    $icon.removeClass('fa-eye-slash').addClass('fa-eye');
  }
}

$('#toggle_code_visibility').on('click', function () {
  const hide = localStorage.getItem('hide_room_code') === 'true';
  localStorage.setItem('hide_room_code', (!hide).toString());
  updateRoomCodeVisibility();
});

updateRoomCodeVisibility();

});