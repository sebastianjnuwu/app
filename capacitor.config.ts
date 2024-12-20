import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uwu.cookie.app',
  appName: 'Cookie',
  webDir: 'www',
  plugins: {
    AdMob: {
      androidAppId: 'ca-app-pub-6690516270288705/1043067086',
      maxAdContentRating: 'G', 
      tagForChildDirectedTreatment: false, 
      tagForUnderAgeOfConsent: false,
    },
  },
};

export default config;