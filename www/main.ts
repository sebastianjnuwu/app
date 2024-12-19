// Declaração para o TypeScript entender que estamos adicionando propriedades ao `window`
declare global {
    interface Window {
      showBottomBanner: () => Promise<void>;
      hideBanner: () => Promise<void>;
      removeBanner: () => Promise<void>;
    }
  }
  
  import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdmobConsentStatus, AdmobConsentInfo, AdmobConsentDebugGeography } from '@capacitor-community/admob';
  
  // Configuração do Banner
  const showBottomBanner = async () => {
    try {
      const bannerOptions: BannerAdOptions = {
        adId: "ca-app-pub-6690516270288705/1043067086", // Coloque seu ID de anúncio aqui
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
  
  // Ocultar o Banner
  const hideBanner = async () => {
    try {
      await AdMob.hideBanner();
      console.log('Banner ocultado com sucesso.');
    } catch (error) {
      console.error('Erro ao ocultar o banner:', error);
    }
  };
  
  // Remover o Banner
  const removeBanner = async () => {
    try {
      await AdMob.removeBanner();
      console.log('Banner removido com sucesso.');
    } catch (error) {
      console.error('Erro ao remover o banner:', error);
    }
  };
  
  // Solicitar informações de consentimento
  const requestConsent = async () => {
    try {
      // Solicitar informações de consentimento com configuração de geografia e dispositivo de teste
      const consentInfo: AdmobConsentInfo = await AdMob.requestConsentInfo({
        debugGeography: AdmobConsentDebugGeography.EEA, // Use sua região geográfica
        testDeviceIdentifiers: ['163FB114BEF1FC09FF772E930677A8D5'], // ID do dispositivo para teste
      });
  
      console.log('Informações de consentimento:', consentInfo);
  
      // Verificar se o consentimento é necessário
      if (consentInfo.status === AdmobConsentStatus.REQUIRED) {
        // Exibir o formulário de consentimento se necessário
        await showConsentForm();
      } else {
        console.log('Consentimento não necessário ou já obtido');
      }
    } catch (error) {
      console.error('Erro ao solicitar consentimento:', error);
    }
  };
  
  // Exibir o formulário de consentimento
  const showConsentForm = async () => {
    try {
      const { status } = await AdMob.showConsentForm();
      console.log(`Formulário de consentimento exibido com status: ${status}`);
    } catch (error) {
      console.error('Erro ao exibir o formulário de consentimento:', error);
    }
  };
  
  // Resetar as informações de consentimento
  const resetConsentInfo = async () => {
    try {
      await AdMob.resetConsentInfo();
      console.log('Informações de consentimento resetadas');
    } catch (error) {
      console.error('Erro ao resetar informações de consentimento:', error);
    }
  };
  
  // Chamada para iniciar o processo de consentimento e mostrar o banner
  const initAdmob = async () => {
    await requestConsent();  // Solicita o consentimento se necessário
    await showBottomBanner(); // Exibe o banner no rodapé
  };
  
  // Função de inicialização
  initAdmob();
  
  // Expor as funções para a janela (agora o TypeScript vai entender as propriedades do window)
  window.showBottomBanner = showBottomBanner;
  window.hideBanner = hideBanner;
  window.removeBanner = removeBanner;
  
  