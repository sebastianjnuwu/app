import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import $ from "jquery";

const getCurrentVersion = async (): Promise<string> => {
  if (Capacitor.isNativePlatform()) {
    const { version } = await App.getInfo();
    return version;
  } 
  return "1.0.3";
};

getCurrentVersion().then((CURRENT_VERSION) => {
  $.getJSON("https://raw.githubusercontent.com/sebastianjnuwu/cookie-clicker-brasil/refs/heads/android/package.json", ({ version, repository }) => {
    if (version !== CURRENT_VERSION) {
      $("#update-screen").show();
      $(".update-btn").attr("href", repository.url);
    }
  });
});
