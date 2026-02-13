import { lang } from "../../locales/main";
import $ from "jquery";

/**
 * Displays a single Bootstrap toast message inside the "#message" container.
 *
 * @param message - The message text to display.
 * @param duration - How long to show the message (in milliseconds). Default is 5000 ms.
 *
 * @remarks
 * - Replaces any existing toast.
 * - Auto-dismisses after the given duration.
 * - Can also be manually dismissed.
 */
function showMessage(message: string, duration = 5000): void {
  const $message = $("#message");
  if (!$message.length) return;

  $message.empty();

  const RAW_HTML = `
    <div class="toast fade show">
      <div class="toast-header">
        <img src="/favicon.ico"
        class="rounded me-2" style="width: 10%;" alt="APP ICON">
        <strong class="me-auto">Cookie</strong>
        <small>
          <i18next i18next-id="app.message.now">${lang("app.message.now")}</i18next>
        </small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close" style="box-shadow: none; outline: none;"></button>
      </div>
      <div class="toast-body">${message}</div>
    </div>
  `;

  $message.html(RAW_HTML);

  setTimeout(() => {
    $message.empty();
  }, duration);
}

export { showMessage };
