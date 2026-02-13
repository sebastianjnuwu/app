import {
  AdMob,
  BannerAdSize,
  BannerAdPosition,
} from "@capacitor-community/admob";
import $ from "jquery";

/**
 * Initializes AdMob and sets up event listeners for showing/removing banners and rewarded ads.
 * Only runs if the platform is Android.
 */
if (window.Capacitor.getPlatform() !== "android") {
  console.log(
    `AdMob: Unsupported platform (${window.Capacitor.getPlatform()})`,
  );
} else {
  // Initialize AdMob when on Android platform
  AdMob.initialize()
    .then(() => {
      console.log("AdMob initialized.");
    })
    .catch((err) => {
      console.error("Error initializing AdMob: ", err.message);
    });

  /**
   * Displays a banner ad at the bottom center of the screen.
   * @returns {Promise<void>}
   */
  function $show_banner(): void {
    AdMob.showBanner({
      adId: "ca-app-pub-6690516270288705/6940688181",
      adSize: BannerAdSize.FULL_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      // Optional flags:
      // isTesting: true,
      // npa: true
    })
      .then(() => {
        console.log("Banner displayed.");
      })
      .catch((err) => {
        console.error("Error displaying banner: ", err.message);
      });
  }

  /**
   * Removes the currently displayed banner ad.
   * @returns {Promise<void>}
   */
  function $remove_banner(): void {
    AdMob.removeBanner()
      .then(() => {
        console.log("Banner hidden successfully.");
      })
      .catch((err) => {
        console.error("Error hiding banner: ", err.message);
      });
  }

  /**
   * Prepares and shows a rewarded video ad.
   * @returns {Promise<void>}
   */
  function $show_video(): void {
    const adId = "ca-app-pub-6690516270288705/7898187843";
    AdMob.prepareRewardVideoAd({ adId })
      .then(() => {
        console.log("Rewarded interstitial prepared.");
        return AdMob.showRewardVideoAd();
      })
      .then(() => {
        console.log("Rewarded interstitial displayed successfully.");
      })
      .catch((err) => {
        console.error("Error displaying rewarded interstitial: ", err.message);
      });
  }

  // Attach click events to UI buttons
  $("#start-playing").on("click", () => $show_banner());

  $("#start_game").on("click", () => $remove_banner());

  $("#game_exit").on("click", () => $show_video());
  
}