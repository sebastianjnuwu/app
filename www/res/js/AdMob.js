const { AdMob } = window.Capacitor.Plugins;

$(document).ready(() => {
  
AdMob.initialize().then(() => {
  console.log('AdMob inicializado...');
}).catch((err) => {
  console.error(err.message);
});

function $show_banner() {

AdMob.showBanner({
  adId: 'ca-app-pub-6690516270288705/1043067086', 
  adSize: 'BANNER',
  position: 'BOTTOM_CENTER',
  margin: 0,
}).then(() => {
  return console.log('Banner exibido..');
}).catch((err) => {
  return console.error('Erro ao exibir Banner: ', err.message);
});

};

function $hide_banner() {
  AdMob.hideBanner().then(() => {
    return console.log('Banner ocultado com sucesso...');
  }).catch((err) => {
    return console.error('Erro ao ocultar o banner: ', err.message);
  });
};

function $show_video() {
  const adId = 'ca-app-pub-6690516270288705/7898187843'; 
  AdMob.prepareRewardVideoAd({ adId }).then(() => {
      console.log('Intersticial recompensado preparado.');
      return AdMob.showRewardVideoAd();
  }).then(() => {
      console.log('Intersticial recompensado exibido com sucesso.'); 
  }).catch((err) => {
      console.error('Erro ao exibir intersticial recompensado: ', err.message);
  });

};

 $("#show_banner").on("click", () => {
   return $show_banner();
 });
 
 $("#show_video").on("click", () => {
   return $show_video();
 });
 
 $("#hide_banner").on("click", () => {
   return $hide_banner();
 });

 $("#award").on("click", () => {
  AdMob.prepareInterstitial({
    adId: 'ca-app-pub-6690516270288705/8937605645',
    autoShow: false,
  }).then(() => {
    console.log('Intersticial preparado.');
    return AdMob.showInterstitial();
  }).then(() => {
    console.log('Anúncio intersticial exibido com sucesso.');
  }).catch((err) => {
    console.error('Erro ao exibir anúncio intersticial:', err.message);
  });
});

});