import { lang } from "@language/main";
import $ from "jquery";

/**
 * Displays a single Bootstrap toast message inside the "#message" container.
 *
 * @param text - The message text to display.
 *
 * @remarks
 * - Replaces any existing toast (no stacking).
 * - Auto-dismisses after 5 seconds.
 * - Can also be manually dismissed.
 */
function showMessage(text: string): void {
  
  const $message = $("#message");
  if (!$message.length) return;

  $message.empty();

  const toastHtml = `
    <div class="toast fade show">
      <div class="toast-header">
        <img src="favicon.ico" class="rounded me-2" style="width: 10%;" alt="icon">
        <strong class="me-auto">Cookie</strong>
        <small>
          <i18next i18next-id="general.message_now">${lang("general.message_now")}</i18next>
        </small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" style="box-shadow: none; outline: none;"></button>
      </div>
      <div class="toast-body">${text}</div>
    </div>
  `;

  $message.html(toastHtml);

  setTimeout(() => {
    $message.empty();
  }, 5000);
};

export { showMessage };