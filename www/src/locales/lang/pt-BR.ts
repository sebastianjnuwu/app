// File: www/src/locales/lang/pt-BR.ts
// Project: Cookie Clicker Online
// Description: Portuguese (Brazil) translation for Cookie Clicker Online

// @lang/pt-BR
const translation = {
    general: {
        cookies: "Biscoitos",
        seconds: "Cliques",
        timeLabel: "Tempo:",
        start: "JA!",
        message_now: "Agora",
    },
    splashScreen: {
        splashClick: "Clique...",
    },
    menu: {
        cookieTitle: "Cookie",
        playButton: "Jogar",
        statistics: "Estatísticas",
        shop: "Loja",
        settings: "Configurações",
    },
    ranking: {
        rankingTitle: "Ranking",
        roomCode: "Código da Sala:",
        waiting: "Aguardando...",
        messages: "Mensagens",
        startButton: "Começar",
        leaveButton: "Sair",
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
    room: {
        message: {
            join: "O jogador <b>{{room_player}}</b> entrou na sala de {{owner}}.",
            leave: "O jogador <b>{{room_player}}</b> saiu da sala.",
            rejoin: "O jogador <b>{{room_player}}</b> reentrou na sala.",
        },
        no_room_player: "Parece que você não definiu seu nickname!",
        no_room_time: "Parece que você não definiu o tempo da sala!",
        time_check:
            "O tempo da sala deve ser maior que 10 segundos e menor ou igual a 10 minutos!",
        no_room_code: "Parece que você não adicionou o código da sala",
        room_limit_min: "O mínimo de 2 jogadores em uma sala.",
        room_limit_max: "O máximo de 50 jogadores em uma sala.",
        no_connected: "Parece que você foi desconectado do jogo Cookie!",
    },
    modal: {
        cancel: "Cancelar",
        confirm: "Confirmar",
    },
    err_message: {
        ROOM_NOT_FOUND: "A sala não foi encontrada!",
        ROOM_FULL: "A sala está cheia!",
        ROOM_STATE_ERROR_IN_GAME: "A partida ja começou",
        ROOM_STATE_ERROR_FINISHED: "A partida ja terminou",
        PLAYER_EXISTS: "Já existe um jogador com esse nome na sala.",
        INVALID_COOKIES: "Dados de cookies inválidos recebidos.",
        NO_PUBLIC_ROOMS_AVAILABLE: "Não há salas públicas disponíveis no momento.",
        ROOM_CODE_NOT_FOUND: "O código da sala não foi encontrado.",
    },
};

export default translation;
