console.log("Okkk.....");

import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

document.addEventListener('deviceready', async () => {
  try {
    await AdMob.initialize();
    console.log('AdMob inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar o AdMob:', error);
  }
});

 const showBanner = async () => {
  const options = {
    adId: 'ca-app-pub-6690516270288705/1043067086', 
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
  };

  try {
    await AdMob.showBanner(options);
    console.log('Banner exibido com sucesso.');
  } catch (error) {
    console.error('Erro ao exibir o banner:', error);
  }
};

const removeBanner = async () => {
  try {
    await AdMob.removeBanner();
    console.log('Banner removido com sucesso.');
  } catch (error) {
    console.error('Erro ao remover o banner:', error);
  }
};