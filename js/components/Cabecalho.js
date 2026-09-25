/*
=========================================================
MUSICALWORLD — CABEÇALHO PRINCIPAL

Arquivo:
    js/components/Cabecalho.js

Responsabilidade deste módulo:

- Controlar o estado visual do cabeçalho.
- Exibir o logo do MusicalWorld.
- Identificar o usuário autenticado.
- Controlar o menu da conta através da logo.
- Controlar acesso à página de perfis salvos e curtidos.
- Controlar acesso à página de configurações da conta.
- Controlar acesso à página de minhas oportunidades.
- Identificar se o usuário atual é um estabelecimento.
- Disponibilizar a identificação do tipo de perfil para
  outros componentes do sistema.
- Controlar troca de usuário.
- Controlar logout.
- Manter compatibilidade com ControleSessao.js.
- Exibir a quantidade de mensagens não lidas.
- Atualizar o contador de mensagens em tempo real.
- Exibir uma prévia de novas mensagens recebidas.
- Verificar mensagens não lidas quando o usuário entra
  na sessão.
- Exibir a quantidade de notificações não lidas.
- Atualizar o contador de notificações em tempo real.
- Exibir uma prévia visual quando uma nova notificação
  for criada no banco.
- Direcionar notificações de contratação para a página
  de acompanhamento da contratação.
- Controlar o comportamento inteligente do cabeçalho
  durante a rolagem em dispositivos móveis.

IMPORTANTE:

A lógica deste arquivo NÃO marca mensagens como lidas.

A lógica deste arquivo NÃO marca notificações como lidas.

A leitura da mensagem continua sendo responsabilidade
do chat.

A leitura da notificação continua sendo responsabilidade
da página:

    notificacoes.html

A exibição visual temporária é responsabilidade de:

    window.ModalNotificacao
=========================================================
*/

const Cabecalho = {

    /*
    =====================================================
    ESTADO DO MÓDULO
    =====================================================
    */

    inicializado: false,

    menuContaAberto: false,

    menuUsuarioAberto: false,

    canalMensagensRealtime: null,

    usuarioAtualId: null,

    /*
    -----------------------------------------------------
    Tipo de perfil atualmente autenticado.

    Este valor é mantido pelo cabeçalho para que outros
    componentes possam consultar se o usuário atual é um
    estabelecimento sem duplicar a regra de identificação.
    -----------------------------------------------------
    */

    tipoPerfilAtual: null,

    carregandoContadorMensagens: false,

    carregandoNotificacaoInicial: false,

    carregandoNotificacaoInicialBanco: false,

    carregandoContadorNotificacoes: false,


    /*
    =====================================================
    ESTADO DO CABEÇALHO DURANTE A ROLAGEM
    =====================================================
    */

    cabecalhoScrollInicializado: false,

    cabecalhoScrollElemento: null,

    cabecalhoUltimoScroll: 0,

    cabecalhoOculto: false,

    cabecalhoScrollProcessando: false,

    cabecalhoLarguraAnterior: null,


    /*
    =====================================================
    INICIALIZAÇÃO
    =====================================================
    */

    async iniciar() {

        if (this.inicializado) {

            return;

        }


        console.log(
            'Inicializando cabeçalho...'
        );


        this.inicializado = true;


        /*
        -------------------------------------------------
        O comportamento do cabeçalho é independente da
        autenticação.
        -------------------------------------------------
        */

        this.inicializarCabecalhoScroll();


        this.mostrarCarregando();


        this.ocultarContadorMensagens();

        this.ocultarContadorNotificacoes();

        this.ocultarMenuMinhasOportunidades();


        try {

            const usuario =
                await ControleSessao.iniciar({
                    exigirLogin: false
                });


            if (usuario) {

                console.log(
                    'Cabeçalho: usuário autenticado.'
                );


                this.mostrarUsuario(
                    usuario
                );

            } else {

                console.log(
                    'Cabeçalho: usuário não autenticado.'
                );


                this.mostrarDeslogado();

            }


            ControleSessao.observar();


        } catch (erro) {

            console.error(
                'Erro ao inicializar cabeçalho:',
                erro
            );


            this.mostrarDeslogado();

        }

    },


    /*
    =====================================================
    CABEÇALHO INTELIGENTE — ROLAGEM MOBILE
    =====================================================
    */

    inicializarCabecalhoScroll() {

        if (
            this.cabecalhoScrollInicializado
        ) {

            return;

        }


        const navbar =
            document.querySelector(
                '.navbar'
            );


        if (!navbar) {

            console.warn(
                'Cabeçalho: .navbar não encontrado para inicializar o comportamento de rolagem.'
            );

            return;

        }


        const elementoScroll =
            window;


        this.cabecalhoScrollElemento =
            elementoScroll;


        this.cabecalhoUltimoScroll =
            this.obterPosicaoScroll(
                elementoScroll
            );


        this.cabecalhoLarguraAnterior =
            window.innerWidth;


        navbar.style.transition =
            'transform 0.25s ease';


        navbar.style.willChange =
            'transform';


        navbar.style.transform =
            'translateY(0)';


        this.cabecalhoOculto =
            false;


        window.addEventListener(
            'scroll',
            () => {

                this.processarScrollCabecalho();

            },
            {
                passive: true
            }
        );


        window.addEventListener(
            'resize',
            () => {

                this.verificarLarguraCabecalho();

            },
            {
                passive: true
            }
        );


        this.cabecalhoScrollInicializado =
            true;


        console.log(
            'Cabeçalho: comportamento inteligente de rolagem inicializado usando window.'
        );

    },


    /*
    =====================================================
    OBTER POSIÇÃO ATUAL DO SCROLL
    =====================================================
    */

    obterPosicaoScroll(
        elemento
    ) {

        if (
            elemento ===
            window
        ) {

            return Math.max(
                0,
                window.scrollY ||
                window.pageYOffset ||
                0
            );

        }


        return Math.max(
            0,
            elemento?.scrollTop ||
            0
        );

    },


    /*
    =====================================================
    PROCESSAR ROLAGEM DO CABEÇALHO
    =====================================================
    */

    processarScrollCabecalho() {

        if (
            this.cabecalhoScrollProcessando
        ) {

            return;

        }


        this.cabecalhoScrollProcessando =
            true;


        requestAnimationFrame(
            () => {

                this.cabecalhoScrollProcessando =
                    false;


                const navbar =
                    document.querySelector(
                        '.navbar'
                    );


                if (!navbar) {

                    return;

                }


                /*
                =================================================
                DESKTOP
                =================================================
                */

                if (
                    window.innerWidth >
                    768
                ) {

                    this.mostrarCabecalhoScroll();


                    navbar.classList.remove(
                        'cabecalho-em-subida'
                    );


                    this.cabecalhoUltimoScroll =
                        this.obterPosicaoScroll(
                            this.cabecalhoScrollElemento
                        );


                    return;

                }


                /*
                =================================================
                MOBILE
                =================================================
                */

                const posicaoAtual =
                    this.obterPosicaoScroll(
                        this.cabecalhoScrollElemento
                    );


                const posicaoNormalizada =
                    Math.max(
                        0,
                        posicaoAtual
                    );


                /*
                -------------------------------------------------
                TOPO
                -------------------------------------------------
                */

                if (
                    posicaoNormalizada <=
                    5
                ) {

                    this.mostrarCabecalhoScroll();


                    navbar.classList.remove(
                        'cabecalho-em-subida'
                    );


                    this.cabecalhoUltimoScroll =
                        posicaoNormalizada;


                    return;

                }


                /*
                -------------------------------------------------
                DIREÇÃO
                -------------------------------------------------
                */

                const diferenca =
                    posicaoNormalizada -
                    this.cabecalhoUltimoScroll;


                const distanciaMinima =
                    6;


                if (
                    Math.abs(diferenca) <
                    distanciaMinima
                ) {

                    return;

                }


                /*
                =================================================
                DESCENDO
                =================================================
                */

                if (
                    diferenca >
                    0
                ) {

                    navbar.classList.remove(
                        'cabecalho-em-subida'
                    );


                    this.esconderCabecalhoScroll();

                }


                /*
                =================================================
                SUBINDO
                =================================================
                */

                else if (
                    diferenca <
                    0
                ) {

                    navbar.classList.add(
                        'cabecalho-em-subida'
                    );


                    this.mostrarCabecalhoScroll();

                }


                this.cabecalhoUltimoScroll =
                    posicaoNormalizada;

            }

        );

    },


    /*
    =====================================================
    ESCONDER CABEÇALHO DURANTE SCROLL
    =====================================================
    */

    esconderCabecalhoScroll() {

        if (
            window.innerWidth >
            768
        ) {

            return;

        }


        const navbar =
            document.querySelector(
                '.navbar'
            );


        if (!navbar) {

            return;

        }


        navbar.classList.remove(
            'cabecalho-em-subida'
        );


        if (
            this.cabecalhoOculto
        ) {

            return;

        }


        this.cabecalhoOculto =
            true;


        navbar.style.transform =
            'translateY(-100%)';

    },


    /*
    =====================================================
    MOSTRAR CABEÇALHO DURANTE SCROLL
    =====================================================
    */

    mostrarCabecalhoScroll() {

        const navbar =
            document.querySelector(
                '.navbar'
            );


        if (!navbar) {

            return;

        }


        this.cabecalhoOculto =
            false;


        navbar.style.transform =
            'translateY(0)';

    },


    /*
    =====================================================
    VERIFICAR LARGURA DO CABEÇALHO
    =====================================================
    */

    verificarLarguraCabecalho() {

        const larguraAtual =
            window.innerWidth;


        if (
            larguraAtual ===
            this.cabecalhoLarguraAnterior
        ) {

            return;

        }


        this.cabecalhoLarguraAnterior =
            larguraAtual;


        /*
        -------------------------------------------------
        DESKTOP
        -------------------------------------------------
        */

        if (
            larguraAtual >
            768
        ) {

            this.mostrarCabecalhoScroll();


            const navbar =
                document.querySelector(
                    '.navbar'
                );


            if (navbar) {

                navbar.classList.remove(
                    'cabecalho-em-subida'
                );

            }


            if (
                this.cabecalhoScrollElemento
            ) {

                this.cabecalhoUltimoScroll =
                    this.obterPosicaoScroll(
                        this.cabecalhoScrollElemento
                    );

            }


            return;

        }


        /*
        -------------------------------------------------
        MOBILE
        -------------------------------------------------
        */

        this.mostrarCabecalhoScroll();


        if (
            this.cabecalhoScrollElemento
        ) {

            this.cabecalhoUltimoScroll =
                this.obterPosicaoScroll(
                    this.cabecalhoScrollElemento
                );

        }

    },


    /*
    =====================================================
    ESTADO DE CARREGAMENTO
    =====================================================
    */

    mostrarCarregando() {

        const logo =
            document.getElementById(
                'cabecalho-logo'
            );

        const carregando =
            document.getElementById(
                'cabecalho-carregando'
            );

        const deslogado =
            document.getElementById(
                'cabecalho-deslogado'
            );

        const logado =
            document.getElementById(
                'cabecalho-logado'
            );


        if (logo) {

            logo.style.display =
                'block';

        }


        if (carregando) {

            carregando.style.display =
                'flex';

        }


        if (deslogado) {

            deslogado.style.display =
                'none';

        }


        if (logado) {

            logado.style.display =
                'none';

        }


        this.ocultarMenuMinhasOportunidades();

    },


    /*
    =====================================================
    USUÁRIO DESLOGADO
    =====================================================
    */

    mostrarDeslogado() {

        const logo =
            document.getElementById(
                'cabecalho-logo'
            );

        const carregando =
            document.getElementById(
                'cabecalho-carregando'
            );

        const deslogado =
            document.getElementById(
                'cabecalho-deslogado'
            );

        const logado =
            document.getElementById(
                'cabecalho-logado'
            );


        this.pararRealtimeMensagens();


        this.usuarioAtualId =
            null;


        this.tipoPerfilAtual =
            null;


        this.carregandoContadorMensagens =
            false;


        this.carregandoNotificacaoInicial =
            false;


        this.carregandoNotificacaoInicialBanco =
            false;


        this.carregandoContadorNotificacoes =
            false;


        this.fecharMenuConta();


        this.ocultarMenuMinhasOportunidades();


        if (logo) {

            logo.style.display =
                'block';

        }


        if (carregando) {

            carregando.style.display =
                'none';

        }


        if (deslogado) {

            deslogado.style.display =
                'flex';

        }


        if (logado) {

            logado.style.display =
                'none';

        }


        this.ocultarContadorMensagens();

        this.ocultarContadorNotificacoes();

    },


    /*
    =====================================================
    USUÁRIO LOGADO
    =====================================================
    */

    mostrarUsuario(dados) {

        const logo =
            document.getElementById(
                'cabecalho-logo'
            );

        const carregando =
            document.getElementById(
                'cabecalho-carregando'
            );

        const deslogado =
            document.getElementById(
                'cabecalho-deslogado'
            );

        const logado =
            document.getElementById(
                'cabecalho-logado'
            );


        const usuario =
            dados?.usuario;

        const tipoPerfil =
            dados?.tipoPerfil;


        if (!usuario) {

            this.mostrarDeslogado();

            return;

        }


        /*
        -------------------------------------------------
        ARMAZENAR TIPO DE PERFIL ATUAL
        -------------------------------------------------

        O tipo de perfil fica disponível para outros
        componentes, como o modal de anúncio do index.

        Dessa forma, não é necessário repetir a lista de
        tipos de estabelecimento em vários arquivos.
        -------------------------------------------------
        */

        this.tipoPerfilAtual =
            tipoPerfil || null;


        this.usuarioAtualId =
            typeof usuario.id === 'string' &&
            usuario.id.trim()
                ? usuario.id.trim()
                : null;


        if (!this.usuarioAtualId) {

            console.error(
                'Cabeçalho: usuário autenticado sem ID válido.',
                usuario
            );


            this.mostrarDeslogado();

            return;

        }


        if (logo) {

            logo.style.display =
                'block';

        }


        if (carregando) {

            carregando.style.display =
                'none';

        }


        if (deslogado) {

            deslogado.style.display =
                'none';

        }


        if (logado) {

            logado.style.display =
                'flex';

        }


        const nome =
            usuario.nome ||
            'Usuário';


        const tipo =
            tipoPerfil?.nome ||
            'Perfil';


        const nomeElemento =
            document.getElementById(
                'cabecalho-nome'
            );

        const tipoElemento =
            document.getElementById(
                'cabecalho-tipo'
            );

        const avatar =
            document.getElementById(
                'cabecalho-avatar'
            );

        const letras =
            document.getElementById(
                'cabecalho-avatar-letras'
            );


        if (nomeElemento) {

            nomeElemento.textContent =
                nome;

        }


        if (tipoElemento) {

            tipoElemento.textContent =
                this.formatarTipoPerfil(
                    tipo
                );

        }


        /*
        -------------------------------------------------
        MENU DE OPORTUNIDADES
        -------------------------------------------------

        A página de gestão de oportunidades pertence aos
        perfis que representam estabelecimentos.

        A identificação agora utiliza o mesmo método
        público ehEstabelecimento(), que também poderá ser
        utilizado pelo modal de anúncio do index.
        -------------------------------------------------
        */

        this.atualizarMenuMinhasOportunidades(
            tipoPerfil
        );


        /*
        -------------------------------------------------
        AVATAR
        -------------------------------------------------
        */

        if (usuario.foto_url) {

            if (avatar) {

                avatar.style.backgroundImage =
                    `url("${usuario.foto_url}")`;

                avatar.style.backgroundSize =
                    'cover';

                avatar.style.backgroundPosition =
                    'center';

                avatar.style.backgroundRepeat =
                    'no-repeat';

            }


            if (letras) {

                letras.style.display =
                    'none';

            }

        } else {

            if (avatar) {

                avatar.style.backgroundImage =
                    '';

            }


            if (letras) {

                letras.textContent =
                    this.obterIniciais(
                        nome
                    );

                letras.style.display =
                    'flex';

            }

        }


        this.fecharMenuConta();


        /*
        =================================================
        CONTADOR DE MENSAGENS
        =================================================
        */

        this.atualizarContadorMensagens();

        this.verificarNotificacaoInicialMensagens();


        /*
        =================================================
        CONTADOR DE NOTIFICAÇÕES
        =================================================
        */

        this.atualizarContadorNotificacoes();

        this.verificarNotificacaoInicialBanco();


        /*
        =================================================
        REALTIME
        =================================================
        */

        this.iniciarRealtimeMensagens();

    },


    /*
    =====================================================
    VERIFICAR SE O PERFIL ATUAL É UM ESTABELECIMENTO
    =====================================================

    Este método centraliza a regra utilizada pelo sistema
    para identificar perfis que podem trabalhar com
    oportunidades.

    Outros componentes podem consultar:

        window.Cabecalho.ehEstabelecimento()

    Dessa forma, a lista de tipos não precisa ser
    duplicada em cada módulo.
    =====================================================
    */

    ehEstabelecimento(
        tipoPerfil = this.tipoPerfilAtual
    ) {

        const tipo =
            String(
                tipoPerfil?.nome ||
                ''
            )
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .trim()
                .replace(/_/g, ' ');


        const tiposEstabelecimento = [

            'bar',

            'boate',

            'casa shows',

            'casa de shows',

            'clube',

            'contratante',

            'empresa agencia',

            'hotel',

            'organizador eventos',

            'pousada',

            'restaurante',

            'pub',

            'espaco para eventos',

            'estabelecimento'

        ];


        return tiposEstabelecimento.includes(
            tipo
        );

    },


    /*
    =====================================================
    MENU — MINHAS OPORTUNIDADES
    =====================================================

    Controla a visibilidade do item:

        #menu-minhas-oportunidades

    O item permanece oculto para artistas e demais perfis.

    A regra de identificação é centralizada em:

        ehEstabelecimento()
    =====================================================
    */

    atualizarMenuMinhasOportunidades(
        tipoPerfil
    ) {

        const menu =
            document.getElementById(
                'menu-minhas-oportunidades'
            );


        if (!menu) {

            return;

        }


        const ehEstabelecimento =
            this.ehEstabelecimento(
                tipoPerfil
            );


        if (ehEstabelecimento) {

            menu.style.display =
                'flex';

            menu.setAttribute(
                'aria-hidden',
                'false'
            );

            return;

        }


        this.ocultarMenuMinhasOportunidades();

    },


    /*
    =====================================================
    OCULTAR MENU — MINHAS OPORTUNIDADES
    =====================================================
    */

    ocultarMenuMinhasOportunidades() {

        const menu =
            document.getElementById(
                'menu-minhas-oportunidades'
            );


        if (!menu) {

            return;

        }


        menu.style.display =
            'none';


        menu.setAttribute(
            'aria-hidden',
            'true'
        );

    },


    /*
    =====================================================
    CONTADOR DE MENSAGENS NÃO LIDAS
    =====================================================
    */

    async atualizarContadorMensagens() {

        if (
            !this.usuarioAtualId ||
            typeof this.usuarioAtualId !== 'string' ||
            !this.usuarioAtualId.trim()
        ) {

            console.warn(
                'Cabeçalho: contador de mensagens ignorado porque o ID do usuário não é válido.'
            );


            this.ocultarContadorMensagens();

            return;

        }


        if (this.carregandoContadorMensagens) {

            return;

        }


        this.carregandoContadorMensagens =
            true;


        try {

            if (
                typeof supabaseClient ===
                'undefined'
            ) {

                throw new Error(
                    'supabaseClient não está disponível.'
                );

            }


            const {
                data: conversas,
                error: erroConversas
            } =
                await supabaseClient
                    .from('conversas')
                    .select('id')
                    .or(
                        `contratante_id.eq.${this.usuarioAtualId},contratado_id.eq.${this.usuarioAtualId}`
                    );


            if (erroConversas) {

                throw erroConversas;

            }


            if (
                !Array.isArray(conversas) ||
                conversas.length === 0
            ) {

                this.atualizarVisualContadorMensagens(
                    0
                );

                return;

            }


            const idsConversas =
                conversas
                    .map(
                        conversa =>
                            conversa.id
                    )
                    .filter(Boolean);


            if (idsConversas.length === 0) {

                this.atualizarVisualContadorMensagens(
                    0
                );

                return;

            }


            const {
                count,
                error: erroMensagens
            } =
                await supabaseClient
                    .from('mensagens')
                    .select(
                        'id',
                        {
                            count: 'exact',
                            head: true
                        }
                    )
                    .in(
                        'conversa_id',
                        idsConversas
                    )
                    .eq(
                        'lida',
                        false
                    )
                    .neq(
                        'remetente_id',
                        this.usuarioAtualId
                    );


            if (erroMensagens) {

                throw erroMensagens;

            }


            const quantidade =
                Number.isFinite(count)
                    ? count
                    : 0;


            this.atualizarVisualContadorMensagens(
                quantidade
            );


            console.log(
                'Cabeçalho: mensagens não lidas:',
                quantidade
            );


        } catch (erro) {

            console.error(
                'Cabeçalho: erro ao consultar mensagens não lidas:',
                erro
            );


            this.ocultarContadorMensagens();

        } finally {

            this.carregandoContadorMensagens =
                false;

        }

    },


    /*
    =====================================================
    CONTADOR DE NOTIFICAÇÕES NÃO LIDAS
    =====================================================
    */

    async atualizarContadorNotificacoes() {

        if (
            !this.usuarioAtualId ||
            typeof this.usuarioAtualId !== 'string' ||
            !this.usuarioAtualId.trim()
        ) {

            this.ocultarContadorNotificacoes();

            return;

        }


        if (this.carregandoContadorNotificacoes) {

            return;

        }


        this.carregandoContadorNotificacoes =
            true;


        try {

            if (
                typeof supabaseClient ===
                'undefined'
            ) {

                throw new Error(
                    'supabaseClient não está disponível.'
                );

            }


            const {
                count,
                error
            } =
                await supabaseClient
                    .from('notificacoes')
                    .select(
                        'id',
                        {
                            count: 'exact',
                            head: true
                        }
                    )
                    .eq(
                        'usuario_id',
                        this.usuarioAtualId
                    )
                    .eq(
                        'lida',
                        false
                    );


            if (error) {

                throw error;

            }


            const quantidade =
                Number.isFinite(count)
                    ? count
                    : 0;


            this.atualizarVisualContadorNotificacoes(
                quantidade
            );


            console.log(
                'Cabeçalho: notificações não lidas:',
                quantidade
            );


        } catch (erro) {

            console.error(
                'Cabeçalho: erro ao consultar notificações não lidas:',
                erro
            );


            this.ocultarContadorNotificacoes();

        } finally {

            this.carregandoContadorNotificacoes =
                false;

        }

    },


    /*
    =====================================================
    ATUALIZAR VISUAL DO CONTADOR DE NOTIFICAÇÕES
    =====================================================
    */

    atualizarVisualContadorNotificacoes(
        quantidade
    ) {

        const contador =
            document.getElementById(
                'badge-notificacoes'
            );


        if (!contador) {

            console.warn(
                'Cabeçalho: #badge-notificacoes não encontrado no HTML.'
            );

            return;

        }


        if (
            !quantidade ||
            quantidade <= 0
        ) {

            contador.textContent =
                '';

            contador.style.display =
                'none';

            contador.setAttribute(
                'aria-hidden',
                'true'
            );

            contador.setAttribute(
                'aria-label',
                'Nenhuma notificação não lida'
            );

            return;

        }


        contador.textContent =
            quantidade > 99
                ? '99+'
                : String(quantidade);


        contador.style.display =
            'flex';


        contador.setAttribute(
            'aria-hidden',
            'false'
        );


        contador.setAttribute(
            'aria-label',
            `${quantidade} notificações não lidas`
        );

    },


    /*
    =====================================================
    OCULTAR CONTADOR DE NOTIFICAÇÕES
    =====================================================
    */

    ocultarContadorNotificacoes() {

        const contador =
            document.getElementById(
                'badge-notificacoes'
            );


        if (!contador) {

            return;

        }


        contador.textContent =
            '';


        contador.style.display =
            'none';


        contador.setAttribute(
            'aria-hidden',
            'true'
        );


        contador.setAttribute(
            'aria-label',
            'Nenhuma notificação não lida'
        );

    },


    /*
    =====================================================
    VERIFICAR NOTIFICAÇÕES NÃO LIDAS
    =====================================================
    */

    verificarNotificacoesNaoLidas() {

        if (!this.usuarioAtualId) {

            this.ocultarContadorNotificacoes();

            return;

        }


        this.atualizarContadorNotificacoes();

    },


    /*
    =====================================================
    VERIFICAR NOTIFICAÇÃO INICIAL DE MENSAGENS
    =====================================================
    */

    async verificarNotificacaoInicialMensagens() {

        if (
            !this.usuarioAtualId ||
            typeof this.usuarioAtualId !== 'string' ||
            !this.usuarioAtualId.trim()
        ) {

            return;

        }


        if (this.carregandoNotificacaoInicial) {

            return;

        }


        this.carregandoNotificacaoInicial =
            true;


        try {

            if (
                typeof supabaseClient ===
                'undefined'
            ) {

                throw new Error(
                    'supabaseClient não está disponível.'
                );

            }


            if (
                typeof window.ModalNotificacao ===
                'undefined' ||
                typeof window.ModalNotificacao.mostrar !==
                'function'
            ) {

                console.warn(
                    'Cabeçalho: ModalNotificacao não está disponível para a verificação inicial.'
                );

                return;

            }


            const {
                data: conversas,
                error: erroConversas
            } =
                await supabaseClient
                    .from('conversas')
                    .select('id')
                    .or(
                        `contratante_id.eq.${this.usuarioAtualId},contratado_id.eq.${this.usuarioAtualId}`
                    );


            if (erroConversas) {

                throw erroConversas;

            }


            if (
                !Array.isArray(conversas) ||
                conversas.length === 0
            ) {

                return;

            }


            const idsConversas =
                conversas
                    .map(
                        conversa =>
                            conversa.id
                    )
                    .filter(Boolean);


            if (idsConversas.length === 0) {

                return;

            }


            const {
                data: mensagens,
                error: erroMensagens
            } =
                await supabaseClient
                    .from('mensagens')
                    .select(
                        `
                        id,
                        conversa_id,
                        remetente_id,
                        conteudo,
                        tipo,
                        lida,
                        created_at,
                        arquivo_nome,
                        arquivo_path,
                        arquivo_mime,
                        arquivo_tamanho
                        `
                    )
                    .in(
                        'conversa_id',
                        idsConversas
                    )
                    .eq(
                        'lida',
                        false
                    )
                    .neq(
                        'remetente_id',
                        this.usuarioAtualId
                    )
                    .order(
                        'created_at',
                        {
                            ascending: false
                        }
                    )
                    .limit(
                        20
                    );


            if (erroMensagens) {

                throw erroMensagens;

            }


            if (
                !Array.isArray(mensagens) ||
                mensagens.length === 0
            ) {

                return;

            }


            let mensagemParaExibir =
                null;


            for (
                const mensagem
                of mensagens
            ) {

                if (!mensagem?.id) {

                    continue;

                }


                const jaExibida =
                    typeof window.ModalNotificacao.jaFoiExibida ===
                    'function'
                        ? window.ModalNotificacao.jaFoiExibida(
                            mensagem.id
                        )
                        : false;


                if (!jaExibida) {

                    mensagemParaExibir =
                        mensagem;

                    break;

                }

            }


            if (!mensagemParaExibir) {

                return;

            }


            await this.processarNovaMensagem(
                mensagemParaExibir
            );


        } catch (erro) {

            console.error(
                'Cabeçalho: erro ao verificar notificações iniciais:',
                erro
            );

        } finally {

            this.carregandoNotificacaoInicial =
                false;

        }

    },


    /*
    =====================================================
    VERIFICAR NOTIFICAÇÃO INICIAL DO BANCO
    =====================================================
    */

    async verificarNotificacaoInicialBanco() {

        if (
            !this.usuarioAtualId ||
            typeof this.usuarioAtualId !== 'string' ||
            !this.usuarioAtualId.trim()
        ) {

            return;

        }


        if (this.carregandoNotificacaoInicialBanco) {

            return;

        }


        this.carregandoNotificacaoInicialBanco =
            true;


        try {

            if (
                typeof supabaseClient ===
                'undefined'
            ) {

                throw new Error(
                    'supabaseClient não está disponível.'
                );

            }


            if (
                typeof window.ModalNotificacao ===
                'undefined' ||
                typeof window.ModalNotificacao.mostrar !==
                'function'
            ) {

                console.warn(
                    'Cabeçalho: ModalNotificacao não está disponível para notificações do banco.'
                );

                return;

            }


            const {
                data: notificacoes,
                error
            } =
                await supabaseClient
                    .from('notificacoes')
                    .select(
                        `
                        id,
                        usuario_id,
                        remetente_id,
                        tipo,
                        titulo,
                        mensagem,
                        referencia_id,
                        referencia_tipo,
                        lida,
                        created_at
                        `
                    )
                    .eq(
                        'usuario_id',
                        this.usuarioAtualId
                    )
                    .eq(
                        'lida',
                        false
                    )
                    .order(
                        'created_at',
                        {
                            ascending: false
                        }
                    )
                    .limit(
                        20
                    );


            if (error) {

                throw error;

            }


            if (
                !Array.isArray(notificacoes) ||
                notificacoes.length === 0
            ) {

                return;

            }


            let notificacaoParaExibir =
                null;


            for (
                const notificacao
                of notificacoes
            ) {

                if (!notificacao?.id) {

                    continue;

                }


                const jaExibida =
                    typeof window.ModalNotificacao.jaFoiExibida ===
                    'function'
                        ? window.ModalNotificacao.jaFoiExibida(
                            notificacao.id
                        )
                        : false;


                if (!jaExibida) {

                    notificacaoParaExibir =
                        notificacao;

                    break;

                }

            }


            if (!notificacaoParaExibir) {

                return;

            }


            await this.processarNovaNotificacao(
                notificacaoParaExibir
            );


        } catch (erro) {

            console.error(
                'Cabeçalho: erro ao verificar notificação inicial do banco:',
                erro
            );

        } finally {

            this.carregandoNotificacaoInicialBanco =
                false;

        }

    },


    /*
    =====================================================
    PROCESSAR NOVA NOTIFICAÇÃO
    =====================================================
    */

    async processarNovaNotificacao(
        notificacao
    ) {

        if (!notificacao) {

            return;

        }


        if (!this.usuarioAtualId) {

            return;

        }


        if (!notificacao.id) {

            return;

        }


        if (
            notificacao.usuario_id !==
            this.usuarioAtualId
        ) {

            return;

        }


        if (
            typeof window.ModalNotificacao ===
            'undefined' ||
            typeof window.ModalNotificacao.mostrar !==
            'function'
        ) {

            return;

        }


        const titulo =
            this.obterTituloNotificacao(
                notificacao
            );


        const preview =
            notificacao.mensagem ||
            'Você recebeu uma nova notificação.';


        let acaoUrl =
            '';


        const referenciaTipo =
            String(
                notificacao.referencia_tipo ||
                ''
            )
                .trim()
                .toLowerCase();


        const referenciaId =
            typeof notificacao.referencia_id ===
                'string'
                ? notificacao.referencia_id.trim()
                : notificacao.referencia_id;


        if (
            referenciaTipo ===
                'contratacao' &&
            referenciaId
        ) {

            acaoUrl =
                `contratacao-acompanhamento.html?id=${encodeURIComponent(
                    referenciaId
                )}`;

        } else {

            acaoUrl =
                notificacao.acao_url ||
                notificacao.url ||
                '';

        }


        window.ModalNotificacao.mostrar({

            id:
                notificacao.id,

            tipo:
                notificacao.tipo ||
                'notificacao',

            nome:
                'MusicalWorld',

            titulo:
                titulo,

            preview:
                preview,

            avatarUrl:
                '',

            acaoUrl:
                acaoUrl

        });

    },


    /*
    =====================================================
    OBTER TÍTULO DA NOTIFICAÇÃO
    =====================================================
    */

    obterTituloNotificacao(
        notificacao
    ) {

        if (
            typeof notificacao?.titulo ===
            'string' &&
            notificacao.titulo.trim()
        ) {

            return notificacao.titulo.trim();

        }


        const tipos = {

            nova_contratacao:
                'Nova solicitação de contratação',

            contratacao_aceita:
                'Contratação aceita',

            pagamento_liberado:
                'Pagamento liberado',

            solicitacao_contrato:
                'Nova solicitação de contratação',

            'solicitacao-contrato':
                'Nova solicitação de contratação',

            contratacao:
                'Nova contratação',

            contratacao_concluida:
                'Contratação concluída',

            contratacao_recusada:
                'Contratação recusada',

            avaliacao:
                'Nova avaliação',

            avaliacao_recebida:
                'Nova avaliação',

            pagamento:
                'Pagamento',

            pagamento_recebido:
                'Pagamento recebido',

            mensagem:
                'Nova mensagem'

        };


        return (
            tipos[
                notificacao?.tipo
            ] ||
            'Nova notificação'
        );

    },


    /*
    =====================================================
    ATUALIZAR VISUAL DO CONTADOR DE MENSAGENS
    =====================================================
    */

    atualizarVisualContadorMensagens(
        quantidade
    ) {

        const contador =
            document.getElementById(
                'badge-mensagens'
            );


        if (!contador) {

            return;

        }


        if (
            !quantidade ||
            quantidade <= 0
        ) {

            contador.textContent =
                '';

            contador.style.display =
                'none';

            contador.setAttribute(
                'aria-hidden',
                'true'
            );

            contador.setAttribute(
                'aria-label',
                'Nenhuma mensagem não lida'
            );

            return;

        }


        contador.textContent =
            quantidade > 99
                ? '99+'
                : String(quantidade);


        contador.style.display =
            'flex';


        contador.setAttribute(
            'aria-hidden',
            'false'
        );


        contador.setAttribute(
            'aria-label',
            `${quantidade} mensagens não lidas`
        );

    },


    /*
    =====================================================
    OCULTAR CONTADOR DE MENSAGENS
    =====================================================
    */

    ocultarContadorMensagens() {

        const contador =
            document.getElementById(
                'badge-mensagens'
            );


        if (!contador) {

            return;

        }


        contador.textContent =
            '';


        contador.style.display =
            'none';


        contador.setAttribute(
            'aria-hidden',
            'true'
        );


        contador.setAttribute(
            'aria-label',
            'Nenhuma mensagem não lida'
        );

    },


    /*
    =====================================================
    REALTIME DAS MENSAGENS E NOTIFICAÇÕES
    =====================================================
    */

    iniciarRealtimeMensagens() {

        if (
            !this.usuarioAtualId ||
            typeof this.usuarioAtualId !== 'string' ||
            !this.usuarioAtualId.trim()
        ) {

            return;

        }


        if (this.canalMensagensRealtime) {

            return;

        }


        if (
            typeof supabaseClient ===
            'undefined'
        ) {

            console.error(
                'Cabeçalho: supabaseClient não está disponível para o Realtime.'
            );

            return;

        }


        this.canalMensagensRealtime =
            supabaseClient
                .channel(
                    `cabecalho-${this.usuarioAtualId}-${Date.now()}`
                )

                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'mensagens'
                    },
                    async (payload) => {

                        const mensagem =
                            payload?.new;


                        if (!mensagem) {

                            return;

                        }


                        if (
                            mensagem.remetente_id ===
                            this.usuarioAtualId
                        ) {

                            return;

                        }


                        this.atualizarContadorMensagens();


                        await this.processarNovaMensagem(
                            mensagem
                        );

                    }
                )

                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'mensagens'
                    },
                    () => {

                        this.atualizarContadorMensagens();

                    }
                )

                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notificacoes'
                    },
                    async (payload) => {

                        const notificacao =
                            payload?.new;


                        if (!notificacao) {

                            return;

                        }


                        if (
                            notificacao.usuario_id !==
                            this.usuarioAtualId
                        ) {

                            return;

                        }


                        this.atualizarContadorNotificacoes();


                        await this.processarNovaNotificacao(
                            notificacao
                        );

                    }
                )

                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notificacoes'
                    },
                    (payload) => {

                        const notificacao =
                            payload?.new;


                        if (!notificacao) {

                            return;

                        }


                        if (
                            notificacao.usuario_id !==
                            this.usuarioAtualId
                        ) {

                            return;

                        }


                        this.atualizarContadorNotificacoes();

                    }
                )

                .subscribe(
                    (status) => {

                        console.log(
                            'Cabeçalho: status Realtime:',
                            status
                        );

                    }
                );

    },


    /*
    =====================================================
    PROCESSAR NOVA MENSAGEM
    =====================================================
    */

    async processarNovaMensagem(
        mensagem
    ) {

        if (!mensagem) {

            return;

        }


        if (!this.usuarioAtualId) {

            return;

        }


        if (
            !mensagem.id ||
            !mensagem.conversa_id
        ) {

            return;

        }


        if (
            typeof window.ModalNotificacao ===
            'undefined' ||
            typeof window.ModalNotificacao.mostrar !==
            'function'
        ) {

            return;

        }


        try {

            const {
                data: conversa,
                error: erroConversa
            } =
                await supabaseClient
                    .from('conversas')
                    .select(
                        'id, contratante_id, contratado_id, servico_id, contratacao_id'
                    )
                    .eq(
                        'id',
                        mensagem.conversa_id
                    )
                    .maybeSingle();


            if (erroConversa) {

                throw erroConversa;

            }


            if (!conversa) {

                return;

            }


            const usuarioParticipa =
                conversa.contratante_id ===
                    this.usuarioAtualId ||
                conversa.contratado_id ===
                    this.usuarioAtualId;


            if (!usuarioParticipa) {

                return;

            }


            if (
                mensagem.remetente_id ===
                this.usuarioAtualId
            ) {

                return;

            }


            const {
                data: remetente,
                error: erroRemetente
            } =
                await supabaseClient
                    .from('usuarios')
                    .select(
                        'id, nome, foto_url'
                    )
                    .eq(
                        'id',
                        mensagem.remetente_id
                    )
                    .maybeSingle();


            if (erroRemetente) {

                throw erroRemetente;

            }


            const nomeRemetente =
                remetente?.nome ||
                'Novo contato';


            const preview =
                this.obterPreviewMensagem(
                    mensagem
                );


            const acaoUrl =
                `chat.html?id=${encodeURIComponent(
                    mensagem.conversa_id
                )}`;


            window.ModalNotificacao.mostrar({

                id:
                    mensagem.id,

                tipo:
                    'mensagem',

                nome:
                    nomeRemetente,

                titulo:
                    'Nova mensagem',

                preview:
                    preview,

                avatarUrl:
                    remetente?.foto_url ||
                    '',

                acaoUrl:
                    acaoUrl

            });


        } catch (erro) {

            console.error(
                'Cabeçalho: erro ao processar nova mensagem:',
                erro
            );

        }

    },


    /*
    =====================================================
    OBTER PRÉVIA DA MENSAGEM
    =====================================================
    */

    obterPreviewMensagem(
        mensagem
    ) {

        if (
            typeof mensagem.conteudo ===
            'string' &&
            mensagem.conteudo.trim()
        ) {

            const texto =
                mensagem.conteudo
                    .trim()
                    .replace(/\s+/g, ' ');


            const limite =
                100;


            if (
                texto.length >
                limite
            ) {

                return (
                    texto.substring(
                        0,
                        limite
                    ).trim() +
                    '...'
                );

            }


            return texto;

        }


        const tipo =
            (
                mensagem.tipo ||
                ''
            ).toLowerCase();


        const mime =
            (
                mensagem.arquivo_mime ||
                ''
            ).toLowerCase();


        if (
            tipo === 'imagem' ||
            mime.startsWith('image/')
        ) {

            return 'Enviou uma imagem';

        }


        if (
            tipo === 'video' ||
            mime.startsWith('video/')
        ) {

            return 'Enviou um vídeo';

        }


        if (
            tipo === 'audio' ||
            mime.startsWith('audio/')
        ) {

            return 'Enviou um áudio';

        }


        if (
            mensagem.arquivo_nome ||
            mensagem.arquivo_path ||
            mensagem.arquivo_mime
        ) {

            return 'Enviou um arquivo';

        }


        return 'Você recebeu uma nova mensagem';

    },


    /*
    =====================================================
    PARAR REALTIME
    =====================================================
    */

    pararRealtimeMensagens() {

        if (
            !this.canalMensagensRealtime
        ) {

            return;

        }


        try {

            if (
                typeof supabaseClient !==
                'undefined'
            ) {

                supabaseClient.removeChannel(
                    this.canalMensagensRealtime
                );

            }

        } catch (erro) {

            console.error(
                'Cabeçalho: erro ao encerrar Realtime:',
                erro
            );

        }


        this.canalMensagensRealtime =
            null;

    },


    /*
    =====================================================
    ABRIR / FECHAR MENU DA CONTA
    =====================================================
    */

    alternarMenuConta() {

        const menu =
            document.getElementById(
                'cabecalho-menu-conta'
            );

        const botao =
            document.getElementById(
                'cabecalho-conta-toggle'
            );


        if (!menu || !botao) {

            return;

        }


        if (
            this.menuContaAberto
        ) {

            this.fecharMenuConta();

            return;

        }


        this.fecharMenuUsuario();


        this.menuContaAberto =
            true;


        this.menuUsuarioAberto =
            true;


        botao.classList.add(
            'aberto'
        );


        botao.setAttribute(
            'aria-expanded',
            'true'
        );


        menu.classList.add(
            'aberto'
        );


        menu.setAttribute(
            'aria-hidden',
            'false'
        );


        const primeiroItem =
            menu.querySelector(
                '.cabecalho-menu-conta-item'
            );


        if (primeiroItem) {

            setTimeout(
                () => {

                    if (
                        this.menuContaAberto
                    ) {

                        primeiroItem.focus();

                    }

                },
                30
            );

        }

    },


    /*
    =====================================================
    FECHAR MENU DA CONTA
    =====================================================
    */

    fecharMenuConta() {

        const menu =
            document.getElementById(
                'cabecalho-menu-conta'
            );

        const botao =
            document.getElementById(
                'cabecalho-conta-toggle'
            );


        this.menuContaAberto =
            false;


        this.menuUsuarioAberto =
            false;


        if (menu) {

            menu.classList.remove(
                'aberto'
            );


            menu.setAttribute(
                'aria-hidden',
                'true'
            );

        }


        if (botao) {

            botao.classList.remove(
                'aberto'
            );


            botao.setAttribute(
                'aria-expanded',
                'false'
            );

        }

    },


    /*
    =====================================================
    COMPATIBILIDADE COM NOME ANTIGO
    =====================================================
    */

    alternarMenuUsuario() {

        this.alternarMenuConta();

    },


    /*
    =====================================================
    COMPATIBILIDADE COM FECHAMENTO ANTIGO
    =====================================================
    */

    fecharMenuUsuario() {

        this.fecharMenuConta();

    },


    /*
    =====================================================
    ABRIR PÁGINA DE SALVOS E CURTIDOS
    =====================================================
    */

    abrirSalvosCurtidos() {

        this.fecharMenuConta();


        window.location.href =
            'salvos-curtidos.html';

    },


    /*
    =====================================================
    ABRIR PÁGINA DE CONFIGURAÇÕES DA CONTA
    =====================================================
    */

    abrirConfiguracoesConta() {

        this.fecharMenuConta();


        window.location.href =
            'configuracoes-conta.html';

    },


    /*
    =====================================================
    TROCAR DE USUÁRIO
    =====================================================
    */

    trocarConta() {

        this.fecharMenuConta();


        const confirmou =
            confirm(
                'Para trocar de usuário, sua sessão atual será encerrada. Deseja continuar?'
            );


        if (!confirmou) {

            return;

        }


        ControleSessao.sair(
            'login.html'
        );

    },


    /*
    =====================================================
    SAIR DA CONTA
    =====================================================
    */

    async sair() {

        this.fecharMenuConta();


        const confirmou =
            confirm(
                'Deseja realmente sair da sua conta?'
            );


        if (!confirmou) {

            return;

        }


        const sucesso =
            await ControleSessao.sair(
                'login.html'
            );


        if (!sucesso) {

            alert(
                'Não foi possível encerrar a sessão. Tente novamente.'
            );

        }

    },


    /*
    =====================================================
    OBTER INICIAIS DO USUÁRIO
    =====================================================
    */

    obterIniciais(nome) {

        const partes =
            nome
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (
            partes.length === 0
        ) {

            return 'U';

        }


        if (
            partes.length === 1
        ) {

            return partes[0]
                .substring(
                    0,
                    2
                )
                .toUpperCase();

        }


        return (
            partes[0].charAt(0) +
            partes[
                partes.length - 1
            ].charAt(0)
        ).toUpperCase();

    },


    /*
    =====================================================
    FORMATAR TIPO DE PERFIL
    =====================================================
    */

    formatarTipoPerfil(tipo) {

        const tipos = {

            artista:
                'Artista',

            contratante:
                'Contratante',

            organizador_eventos:
                'Organizador de eventos',

            casa_shows:
                'Casa de shows',

            empresa_agencia:
                'Empresa / Agência'

        };


        return (
            tipos[tipo] ||
            tipo
        );

    }

};


/*
=========================================================
DISPONIBILIZA O MÓDULO GLOBALMENTE
=========================================================
*/

window.Cabecalho =
    Cabecalho;


/*
=========================================================
FECHAR MENU DA CONTA AO CLICAR FORA
=========================================================
*/

document.addEventListener(
    'click',
    function (evento) {

        const areaConta =
            document.querySelector(
                '.cabecalho-conta'
            );


        if (!areaConta) {

            return;

        }


        if (
            !areaConta.contains(
                evento.target
            )
        ) {

            Cabecalho.fecharMenuConta();

        }

    }
);


/*
=========================================================
FECHAR MENU COM ESC
=========================================================
*/

document.addEventListener(
    'keydown',
    function (evento) {

        if (
            evento.key !==
            'Escape'
        ) {

            return;

        }


        if (
            Cabecalho.menuContaAberto
        ) {

            Cabecalho.fecharMenuConta();

        }

    }
);