import { MusicSong, ClickSong } from "@ts/game/sound"
import { showMessage } from "@ts/game/toast";
import { lang } from "@language/main";
import $ from "jquery";

/**
 * This function runs when the document is ready.
 * It initializes interactions with the splash screen and handles the game room code visibility logic.
 */
$(() => {
 
  $("#splash-screen").on("click", () => {
    
    if (localStorage.musicEnabled !== "false") MusicSong.play();
  
    $("#splash-screen").hide();
    $("#start-screen").show();
    
  });
  
$(document).on("click", "button", () => {
  if (localStorage.soundEnabled !== "false") ClickSong.play();
});
  
  
  /**
   * Event handler for changing the game option selection (either creating a new game or joining an existing one).
   * Shows or hides the room code input field based on the user's choice.
   */
  $('input[name="option_game"]').on("change", () => {
    // Clear the room code input field
    const option = $('input[name="option_game"]:checked').val() as string;
    const $room_code_input = $("#room_code") as JQuery<HTMLInputElement>;
    const $code_container = $("#code_container");
    const $game_container = $("#game_container");
    const $room_join_input = $("#room_join") as JQuery<HTMLInputElement>;
    const $room_public_input = $("#room_public") as JQuery<HTMLInputElement>;

    $room_public_input.prop("checked", false);
    $room_code_input.val("");

    // Toggle visibility of the room code and game containers based on the selection
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

  $("#toggleSound").prop("checked", localStorage.soundEnabled !== "false");
  
  $("#toggleMusic").prop("checked",
  localStorage.musicEnabled !== "false");
  
  $("#toggleSound").on("change", (e) => {
    localStorage.soundEnabled = e.target.checked
  });
  
  $("#toggleMusic").on("change", (e) => {
    localStorage.musicEnabled = e.target.checked;
    if (e.target.checked) MusicSong.play();
    else MusicSong.pause();
  });

const PIX_KEY = "6eddc8ae-83cd-4af4-a206-7cd684a6557c";

const BITCOIN_KEY = "bc1qv8sfkevq0k65rq5d6t87klne2t8783dyk54p0w";
  
function showQRCode(type, keyOrAddress, imageUrl) {
  
  $("#donate_buttons").html(`
    <div class="text-center">
      <img src="${imageUrl}" alt="QR Code ${type}" style="max-width: 200px; margin-bottom: 15px; border: 1.5px solid #d2691e; border-radius: 16px;">
      <div class="d-grid gap-2">
        <button class="btn" id="copy_qr"><i class="fas fa-copy me-1"></i> Copiar ${type}</button>
        <button class="btn" id="back_donate"><i class="fas fa-arrow-left me-1"></i> Voltar</button>
      </div>
    </div>
  `);

  $("#copy_qr").on("click", () => {
    navigator.clipboard.writeText(keyOrAddress).then(() => {
      showMessage(lang(`donate.message.${type}`, { [type]: keyOrAddress }), 30000);
    });
  });

  $("#back_donate").on("click", () => {
    $("#donate_buttons").html(`
      <button id="pix">
        <i class="fas fa-qrcode fa-lg"></i>
        <span>Pix</span>  
      </button> 
      <button id="bitcoin">
        <i class="fab fa-bitcoin fa-lg"></i>
        <span>Bitcoin</span>
      </button> 
    `);
    RDB();
  });
  
}

function RDB() { 
$("#pix").on("click", () => {
    showQRCode("pix", PIX_KEY, "/images/QRCODE_PIX.png"); 
  });

  $("#bitcoin").on("click", () => {
    showQRCode("bitcoin", BITCOIN_KEY, "/images/QRCODE_BITCOIN.png");
  });
};

RDB();

});