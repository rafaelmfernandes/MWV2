const Cabecalho = {


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
- Controlar troca de usuário.
- Controlar logout.
- Manter compatibilidade com ControleSessao.js.
- Exibir a quantidade de mensagens não lidas.
- Atualizar o contador de mensagens em tempo real.
- Exibir uma prévia de novas mensagens recebidas.
- Verificar mensagens não lidas quando o usuário entra
  na sessão.

O menu da conta atual é aberto através da:

    logo + seta

O menu apresenta:

    Trocar de usuário
    Sair

IMPORTANTE:

A lógica de mensagens deste arquivo não marca mensagens
como lidas.

A exibição do aviso visual de nova mensagem é feita por:

    ModalNotificacao

A leitura da mensagem continua sendo responsabilidade
do chat.

=========================================================
*/


/*
=========================================================
ESTADO DO MÓDULO
=========================================================
*/

inicializado: false,


/*
---------------------------------------------------------
Indica se o novo menu da conta está aberto.
---------------------------------------------------------
*/

menuContaAberto: false,


/*
---------------------------------------------------------
Mantido por compatibilidade com versões anteriores.

Algumas páginas antigas podem ainda consultar essa
propriedade.
---------------------------------------------------------
*/

menuUsuarioAberto: false,


/*
---------------------------------------------------------
Canal Realtime responsável pelas mensagens.

Criado somente quando existe um usuário autenticado.
---------------------------------------------------------
*/

canalMensagensRealtime: null,


/*
---------------------------------------------------------
ID do usuário atualmente autenticado.
---------------------------------------------------------
*/

usuarioAtualId: null,


/*
---------------------------------------------------------
Evita consultas simultâneas do contador.
---------------------------------------------------------
*/

carregandoContadorMensagens: false,


/*
---------------------------------------------------------
Evita verificações iniciais simultâneas.
---------------------------------------------------------
*/

carregandoNotificacaoInicial: false,


/*
=========================================================
INICIALIZAÇÃO
=========================================================
*/

async iniciar() {

    if (this.inicializado) {

        return;

    }


    console.log(
        'Inicializando cabeçalho...'
    );


    this.inicializado = true;


    this.mostrarCarregando();


    /*
    -----------------------------------------------------
    Inicialmente o contador permanece oculto.
    -----------------------------------------------------
    */

    this.ocultarContadorMensagens();


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
=========================================================
ESTADO DE CARREGAMENTO
=========================================================
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

},


/*
=========================================================
USUÁRIO DESLOGADO
=========================================================
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


    /*
    -----------------------------------------------------
    Encerra o Realtime antes de limpar o estado.
    -----------------------------------------------------
    */

    this.pararRealtimeMensagens();


    this.usuarioAtualId =
        null;


    this.carregandoContadorMensagens =
        false;


    this.carregandoNotificacaoInicial =
        false;


    /*
    -----------------------------------------------------
    Fecha o novo menu da conta.
    -----------------------------------------------------
    */

    this.fecharMenuConta();


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


    /*
    -----------------------------------------------------
    Usuário deslogado não possui mensagens não lidas.
    -----------------------------------------------------
    */

    this.ocultarContadorMensagens();

},


/*
=========================================================
USUÁRIO LOGADO
=========================================================
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


    /*
    -----------------------------------------------------
    PROTEÇÃO
    -----------------------------------------------------
    */

    if (!usuario) {

        this.mostrarDeslogado();

        return;

    }


    /*
    -----------------------------------------------------
    GUARDA O ID DO USUÁRIO.
    -----------------------------------------------------
    */

    this.usuarioAtualId =
        usuario.id || null;


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


    /*
    -----------------------------------------------------
    DADOS DO USUÁRIO
    -----------------------------------------------------
    */

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


    /*
    -----------------------------------------------------
    NOME
    -----------------------------------------------------
    */

    if (nomeElemento) {

        nomeElemento.textContent =
            nome;

    }


    /*
    -----------------------------------------------------
    TIPO DE PERFIL
    -----------------------------------------------------
    */

    if (tipoElemento) {

        tipoElemento.textContent =
            this.formatarTipoPerfil(
                tipo
            );

    }


    /*
    -----------------------------------------------------
    AVATAR
    -----------------------------------------------------
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


    /*
    -----------------------------------------------------
    Garante que o menu da conta esteja fechado.
    -----------------------------------------------------
    */

    this.fecharMenuConta();


    /*
    -----------------------------------------------------
    CONTADOR DE MENSAGENS

    Primeiro consultamos a quantidade atual.

    Depois verificamos se existe alguma mensagem não lida
    que chegou enquanto o usuário estava offline.

    Por último iniciamos o Realtime.
    -----------------------------------------------------
    */

    this.atualizarContadorMensagens();

    this.verificarNotificacaoInicialMensagens();

    this.iniciarRealtimeMensagens();

},


/*
=========================================================
CONTADOR DE MENSAGENS NÃO LIDAS
=========================================================

Conta somente mensagens:

- pertencentes às conversas do usuário;
- com lida = false;
- enviadas por outra pessoa.

Mensagens enviadas pelo próprio usuário nunca aparecem
como novas para ele.

=========================================================
*/

async atualizarContadorMensagens() {

    if (!this.usuarioAtualId) {

        this.ocultarContadorMensagens();

        return;

    }


    if (this.carregandoContadorMensagens) {

        return;

    }


    this.carregandoContadorMensagens =
        true;


    try {

        /*
        -------------------------------------------------
        BUSCAR CONVERSAS DO USUÁRIO
        -------------------------------------------------
        */

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


        /*
        -------------------------------------------------
        BUSCAR MENSAGENS NÃO LIDAS
        -------------------------------------------------
        */

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
=========================================================
VERIFICAR NOTIFICAÇÕES PENDENTES AO ENTRAR
=========================================================

Procura mensagens que:

- pertencem às conversas do usuário;
- ainda estão com lida = false;
- foram enviadas por outra pessoa.

IMPORTANTE:

Esta consulta não altera "lida".

O histórico de avisos é controlado pelo ModalNotificacao.

=========================================================
*/

async verificarNotificacaoInicialMensagens() {

    if (!this.usuarioAtualId) {

        return;

    }


    if (this.carregandoNotificacaoInicial) {

        return;

    }


    this.carregandoNotificacaoInicial =
        true;


    try {

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


        /*
        -------------------------------------------------
        BUSCAR CONVERSAS
        -------------------------------------------------
        */

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

            console.log(
                'Cabeçalho: nenhuma conversa encontrada para verificar notificações pendentes.'
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

            return;

        }


        /*
        -------------------------------------------------
        BUSCAR MENSAGENS NÃO LIDAS
        -------------------------------------------------
        */

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

            console.log(
                'Cabeçalho: nenhuma mensagem não lida pendente de notificação.'
            );

            return;

        }


        /*
        -------------------------------------------------
        ENCONTRAR A PRIMEIRA MENSAGEM AINDA NÃO EXIBIDA
        -------------------------------------------------
        */

        let mensagemParaExibir =
            null;


        for (
            const mensagem
            of mensagens
        ) {

            if (
                !mensagem?.id
            ) {

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

            console.log(
                'Cabeçalho: mensagens não lidas encontradas, mas os avisos já foram exibidos anteriormente.'
            );

            return;

        }


        console.log(
            'Cabeçalho: mensagem não lida encontrada ao entrar na sessão.',
            mensagemParaExibir
        );


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
=========================================================
ATUALIZAR VISUAL DO CONTADOR
=========================================================
*/

atualizarVisualContadorMensagens(
    quantidade
) {

    const contador =
        document.getElementById(
            'badge-mensagens'
        );


    if (!contador) {

        console.warn(
            'Cabeçalho: #badge-mensagens não encontrado no HTML.'
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
=========================================================
OCULTAR CONTADOR DE MENSAGENS
=========================================================
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
=========================================================
REALTIME DAS MENSAGENS
=========================================================
*/

iniciarRealtimeMensagens() {

    if (!this.usuarioAtualId) {

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


    console.log(
        'Cabeçalho: iniciando Realtime das mensagens...'
    );


    this.canalMensagensRealtime =
        supabaseClient
            .channel(
                `cabecalho-mensagens-${this.usuarioAtualId}-${Date.now()}`
            )


            /*
            -------------------------------------------------
            NOVA MENSAGEM
            -------------------------------------------------
            */

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


                    /*
                    -----------------------------------------
                    Ignora mensagens enviadas pelo próprio
                    usuário.
                    -----------------------------------------
                    */

                    if (
                        mensagem.remetente_id ===
                        this.usuarioAtualId
                    ) {

                        return;

                    }


                    console.log(
                        'Cabeçalho: nova mensagem recebida.',
                        mensagem
                    );


                    /*
                    -----------------------------------------
                    Recalcula a quantidade real.
                    -----------------------------------------
                    */

                    this.atualizarContadorMensagens();


                    /*
                    -----------------------------------------
                    Exibe a prévia visual.
                    -----------------------------------------

                    Não marca a mensagem como lida.
                    -----------------------------------------
                    */

                    await this.processarNovaMensagem(
                        mensagem
                    );

                }
            )


            /*
            -------------------------------------------------
            MENSAGEM ATUALIZADA
            -------------------------------------------------
            */

            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'mensagens'
                },
                (payload) => {

                    console.log(
                        'Cabeçalho: mensagem atualizada.',
                        payload
                    );


                    this.atualizarContadorMensagens();

                }
            )


            /*
            -------------------------------------------------
            INSCRIÇÃO
            -------------------------------------------------
            */

            .subscribe(
                (status) => {

                    console.log(
                        'Cabeçalho: status Realtime mensagens:',
                        status
                    );

                }
            );

},


/*
=========================================================
PROCESSAR NOVA MENSAGEM
=========================================================
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

        console.warn(
            'Cabeçalho: nova mensagem sem ID ou conversa_id.',
            mensagem
        );

        return;

    }


    if (
        typeof window.ModalNotificacao ===
        'undefined' ||
        typeof window.ModalNotificacao.mostrar !==
        'function'
    ) {

        console.warn(
            'Cabeçalho: ModalNotificacao ainda não está disponível.'
        );

        return;

    }


    try {

        /*
        -------------------------------------------------
        VERIFICAR A CONVERSA
        -------------------------------------------------
        */

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

            console.log(
                'Cabeçalho: conversa da nova mensagem não encontrada.'
            );

            return;

        }


        const usuarioParticipa =
            conversa.contratante_id ===
                this.usuarioAtualId ||
            conversa.contratado_id ===
                this.usuarioAtualId;


        if (!usuarioParticipa) {

            console.log(
                'Cabeçalho: mensagem ignorada porque a conversa não pertence ao usuário atual.'
            );

            return;

        }


        /*
        -------------------------------------------------
        GARANTIR QUE NÃO É UMA MENSAGEM DO PRÓPRIO USUÁRIO
        -------------------------------------------------
        */

        if (
            mensagem.remetente_id ===
            this.usuarioAtualId
        ) {

            return;

        }


        /*
        -------------------------------------------------
        BUSCAR REMETENTE
        -------------------------------------------------
        */

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


        /*
        -------------------------------------------------
        ABRIR MODAL DE NOTIFICAÇÃO
        -------------------------------------------------

        O ID da mensagem funciona como chave única.

        O ModalNotificacao controla o histórico através
        do localStorage.

        Esta chamada não altera mensagens.lida.
        -------------------------------------------------
        */

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


        console.log(
            'Cabeçalho: prévia de nova mensagem enviada ao ModalNotificacao.',
            {
                mensagemId:
                    mensagem.id,

                conversaId:
                    mensagem.conversa_id,

                remetenteId:
                    mensagem.remetente_id
            }
        );


    } catch (erro) {

        console.error(
            'Cabeçalho: erro ao processar nova mensagem:',
            erro
        );

    }

},


/*
=========================================================
OBTER PRÉVIA DA MENSAGEM
=========================================================
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
=========================================================
PARAR REALTIME DAS MENSAGENS
=========================================================
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
            'Cabeçalho: erro ao encerrar Realtime das mensagens:',
            erro
        );

    }


    this.canalMensagensRealtime =
        null;

},


/*
=========================================================
ABRIR / FECHAR MENU DA CONTA
=========================================================

O novo menu é controlado diretamente pela logo.

HTML utilizado:

    #cabecalho-conta-toggle
    #cabecalho-menu-conta

A seta recebe a classe:

    aberto

através do botão.

O CSS é responsável pela animação visual.

=========================================================
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

        console.warn(
            'Cabeçalho: elementos do menu da conta não encontrados.'
        );

        return;

    }


    if (
        this.menuContaAberto
    ) {

        this.fecharMenuConta();

        return;

    }


    /*
    -----------------------------------------------------
    Fecha qualquer menu antigo antes de abrir o novo.
    -----------------------------------------------------
    */

    this.fecharMenuUsuario();


    this.menuContaAberto =
        true;


    this.menuUsuarioAberto =
        true;


    /*
    -----------------------------------------------------
    Ativa o estado visual do botão.

    O CSS utiliza .aberto para:

    - girar a seta;
    - alterar a cor da seta;
    - permitir a abertura visual do menu.
    -----------------------------------------------------
    */

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


    /*
    -----------------------------------------------------
    Foco acessível no primeiro item.
    -----------------------------------------------------
    */

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
=========================================================
FECHAR MENU DA CONTA
=========================================================
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
=========================================================
COMPATIBILIDADE COM O NOME ANTIGO
=========================================================

Algumas páginas antigas podem chamar:

    alternarMenuUsuario()

Agora o menu é o mesmo menu da conta.

Mantemos o método para evitar quebra de compatibilidade.

=========================================================
*/

alternarMenuUsuario() {

    this.alternarMenuConta();

},


/*
=========================================================
COMPATIBILIDADE COM O FECHAMENTO ANTIGO
=========================================================
*/

fecharMenuUsuario() {

    /*
    -----------------------------------------------------
    O antigo menu não existe mais no novo cabeçalho.

    Portanto simplesmente fechamos o menu atual da conta.
    -----------------------------------------------------
    */

    this.fecharMenuConta();

},


/*
=========================================================
TROCAR DE USUÁRIO
=========================================================

A troca de usuário encerra a sessão atual e retorna
para a tela de login.

O usuário poderá então entrar com outra conta.

=========================================================
*/

trocarConta() {

    console.log(
        'Usuário solicitou troca de conta.'
    );


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
=========================================================
SAIR DA CONTA
=========================================================
*/

async sair() {

    console.log(
        'Usuário solicitou logout pelo cabeçalho.'
    );


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
=========================================================
OBTER INICIAIS DO USUÁRIO
=========================================================
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
=========================================================
FORMATAR TIPO DE PERFIL
=========================================================
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

O menu agora fica próximo da logo.

Por isso verificamos a área:

    .cabecalho-conta

em vez da antiga:

    #cabecalho-logado

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

Melhora a acessibilidade e também deixa o comportamento
do menu mais natural em desktop.

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