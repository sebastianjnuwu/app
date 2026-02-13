import { LogEvent } from "@ts/app/plugins/firebase";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import $ from "jquery";

/**
 * Retrieves the current app version.
 *
 * @returns {Promise<string>} The version string (e.g., "1.0.2").
 */
const getCurrentVersion = async (): Promise<string> => {
  if (Capacitor.isNativePlatform()) {
    const { version } = await App.getInfo();
    return version;
  }
  return "1.0.2";
};

// Fetches current version and compares with the latest version from GitHub
getCurrentVersion().then((VERSION) => {
  $.getJSON(
    "https://raw.githubusercontent.com/sebastianjnuwu/cookie-clicker-brasil/refs/heads/android/package.json",
    async ({ version, repository }) => {
      if (version !== VERSION) {
        $("#app_update").attr("hidden", false);
        $("#app_update a").attr("href", repository.url);

        await LogEvent("update_available", {
          current_version: VERSION,
          latest_version: version,
          has_update: VERSION !== version ? 1 : 0,
        });
      }
    },
  );
});
