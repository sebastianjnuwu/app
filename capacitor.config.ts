import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uwu.cookie.app',
  appName: 'Cookie',
  webDir: 'www',
  bundledWebRuntime: false,
  android: {
    backgroundColor: '#FFFFFF',
    appendUserAgent: 'Cookie' 
  }
};

export default config;