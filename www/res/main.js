const { AdMob } = window.Capacitor.Plugins;

AdMob.initialize().then(() => {
  console.log('AdMob inicializado...');
}).catch((err) => {
  console.error(err);
});

function a() {
AdMob.showBanner({
  adId: 'ca-app-pub-6690516270288705/1043067086', 
  adSize: 'BANNER',
  position: 'BOTTOM_CENTER',
  margin: 0,
}).then(() => {
  console.log('Banner exibido..');
}).catch((err) => {
  console.error(err);
});
};

function b() {
  AdMob.hideBanner()
  .then(() => {
    console.log('Banner ocultado com sucesso.');
  })
  .catch((error) => {
    console.error('Erro ao ocultar o banner:', error);
  });

};

function c() {
  const adId = 'ca-app-pub-6690516270288705/2597759707'; // ID do bloco real
  AdMob.prepareRewardVideoAd({ adId })
    .then(() => {
      console.log('Intersticial recompensado preparado.');
      return AdMob.showRewardVideoAd();
    })
    .then(() => {
      console.log('Intersticial recompensado exibido com sucesso.');
      // Aqui você pode adicionar a lógica para entregar a recompensa ao usuário
    })
    .catch((err) => {
      console.error('Erro ao exibir intersticial recompensado:', err);
    });
};