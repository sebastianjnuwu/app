import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uwu.cookie.app',
  appName: 'Cookie',
  webDir: 'www',
  plugins: {
    Camera: {
      webUseInput: true,
    },
  },

};

export default config;
