import { AdMob } from '@capacitor-community/admob';

AdMob.initialize();

const options = {
  adId: 'ca-app-pub-6690516270288705/1043067086', 
  adSize: 'BANNER',
  position: 'BOTTOM_CENTER',
  margin: 0,
  isTesting: true 
};

AdMob.showBanner(options);