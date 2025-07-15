import type { CapacitorConfig } from "@capacitor/cli";

// https://capacitorjs.com/docs/config
const config: CapacitorConfig = {
  appId: "sebastianjnuwu.cookie.app",
  appName: "Cookie Clicker Brasil",
  webDir: "build",
  plugins: {
    AdMob: {
      androidAppId: "ca-app-pub-6690516270288705~6535066913",
      maxAdContentRating: "G",
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    },
  },
};

export default config;
