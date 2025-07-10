import $ from "jquery";
const CURRENT_VERSION = "1.0.2";

/**
 * This function runs when the document is ready.
 * It initializes interactions with the splash screen and handles the game room code visibility logic.
 */
$(() => {
  $("#start-screen").show();

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
});

$.getJSON("https://raw.githubusercontent.com/sebastianjnuwu/cookie-clicker-brasil/refs/heads/android/package.json", ({ version, repository }) => {
  if (version !== CURRENT_VERSION) {
    $("#update-screen").show();
    $(".update-btn").attr("href", repository.url);
  }
});