// File: www/src/locales/lang/pt-BR.ts
// Project: Cookie Clicker Online
// Description: Portuguese (Brazil) translation for Cookie Clicker Online

// @lang/pt-BR
const translation = {
  app: {
    cookie: {
      message:
        "Este site usa cookies para deixar sua experiência ainda mais doce. Ao continuar, você concorda com nossa <a data-bs-toggle='modal' data-bs-target='#policy_modal'>Política de Privacidade</a> e com os <a data-bs-toggle='modal' data-bs-target='#terms_modal'>Termos de Uso</a>.",
      reject: "Rejeitar",
      accept: "Aceitar",
    },
    error: {
      INVALID_PLAYER_LIMIT: "Limite de jogadores em sala não foi definido.",
      INVALID_PLAYER_LIMIT_MIN:
        "O limite mínimo de jogadores em sala é de 2 pessoas.",
      INVALID_PLAYER_LIMIT_MAX:
        "O limite máximo de jogadores em sala é de 50 pessoas.",
      INVALID_ROOM_TIME: "O tempo de jogo de sala não foi definido.",
      INVALID_ROOM_TIME_MIN: "O tempo mínimo é de 10 segundos.",
      INVALID_ROOM_TIME_MAX: "O tempo máximo é de 5 minutos.",
      ROOM_FULL: "A sala esta cheia!",
      ROOM_STATE_ERROR_IN_GAME: "A partida nesta sala já começou.",
      ROOM_STATE_ERROR_FINISHED: "A partida nesta sala ja terminou.",
      PLAYER_EXISTS: "Ja existe um jogador com seu nome nesta sala.",
      ROOM_NOT_FOUND: "Sala não encontrada.",
    },
    game: {
      nicknameLabel: "Nome do Jogador",
      gameOptionLabel: "Escolha uma opção:",
      randomRoom: "Entre em uma sala aleatória",
      publicRoomLabel: "Sala pública:",
      gamePlayerLimit: "Limite de Jogadores",
      createRoom: "Criar uma sala",
      joinRoom: "Entrar em uma sala",
      roomCodeLabel: "Código da Sala",
      gameTimeLabel: "Tempo de Jogo",
    },
    login: {
      google: "Entrar",
      logout: "Sair",
    },
    menu: {
      title: "Cookie",
      button: {
        play: "Jogar",
        settings: "Configurações",
      },
    },
    message: {
      now: "Agora",
    },
    modal: {
      close: "Fechar",
      open: "Confirmar",
    },
    room: {
      message: {
        join: "O jogador <b>{{room_player}}</b> entrou na sala.",
        leave: "O jogador <b>{{room_player}}</b> saiu da sala.",
        rejoin: "O jogador <b>{{room_player}}</b> reentrou na sala.",
        owner_changed: "Você agora é o dono da sala!",
      },
      NO_ROOM_PLAYER: "Parece que você não definiu seu nickname!",
      NO_ROOM_TIME: "Parece que você não definiu o tempo da sala!",
      TIME_CHECK:
        "O tempo da sala deve ser maior que 10 segundos e menor ou igual a 10 minutos!",
      NO_ROOM_CODE: "Parece que você não adicionou o código da sala",
      ROOM_LIMIT_MIN: "O mínimo de 2 jogadores em uma sala.",
      ROOM_LIMIT_MAX: "O máximo de 50 jogadores em uma sala.",
      NO_CONNECTED: "Parece que você foi desconectado do jogo Cookie!",
    },
    settings: {
      notification: "Notificação",
      sound: "Efeito Sonoro",
      music: "Música",
    },
    splash_screen: {
      message:
        "<a target='_blank' data-bs-toggle='modal' data-bs-target='#terms_modal'>Termos de Uso</a> e <a target='_blank' data-bs-toggle='modal' data-bs-target='#policy_modal'>Política de Privacidade</a>",
    },
    update: {
      title: "Nova versão disponível!",
      download: "Baixar",
    },
    waiting: {
      title: "Aguardando...",
      code: "Código da Sala:",
      button: {
        chat: "Bate-Papo",
        leave: "Sair",
        start: "Começar",
      },
    },
  },
};

export default translation;
