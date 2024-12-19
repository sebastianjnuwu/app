import { AdMob } from '@capacitor-community/admob';

document.addEventListener('deviceready', () => {
  AdMob.initialize({
    requestTrackingAuthorization: true,
    initializeForTesting: true,
  });

  const options = {
    adId: 'ca-app-pub-6690516270288705/1043067086', 
    adSize: 'BANNER',
    position: 'BOTTOM_CENTER',
    margin: 0,
  };

  AdMob.showBanner(options);

  AdMob.addListener('onAdLoaded', () => {
    console.log('ok...');
  });

  AdMob.addListener('onAdFailedToLoad', (error) => {
    console.error('Erro', error);
  });
});
