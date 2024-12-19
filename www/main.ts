import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const showBottomBanner = async () => {
  try {
    const bannerOptions: BannerAdOptions = {
      adId: "ca-app-pub-6690516270288705/1043067086",
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    };

    await AdMob.showBanner(bannerOptions);
    console.log('Banner exibido com sucesso.');
  } catch (error) {
    console.error('Erro ao exibir o banner:', error);
  }
};

const hideBanner = async () => {
  try {
    await AdMob.hideBanner();
    console.log('Banner ocultado com sucesso.');
  } catch (error) {
    console.error('Erro ao ocultar o banner:', error);
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

export { showBottomBanner, hideBanner, removeBanner };