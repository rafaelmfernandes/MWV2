(function (window) {

    "use strict";


    /* =========================================================
       MUSICALWORLD — PÁGINA DE NOTIFICAÇÕES

       Arquivo:
       js/notificacoes.js

       Responsabilidades:

       - Carregar as notificações do usuário.
       - Exibir notificações lidas e não lidas.
       - Identificar o remetente.
       - Exibir foto ou iniciais do remetente.
       - Marcar notificações como lidas.
       - Marcar todas as notificações como lidas.
       - Atualizar a página em tempo real através do
         Supabase Realtime.
       - Direcionar cada notificação para sua página
         correspondente.
       - Controlar corretamente os estados de carregamento,
         lista vazia e erro.
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        tabela: "notificacoes",

        tabelaUsuarios: "usuarios",

        limiteInicial: 100,

        paginaAnterior: "index.html",

        imagemSistema: "img/logo-musicalworld.svg"

    };


    /* =========================================================
       ESTADO DO MÓDULO
       ========================================================= */

    const estado = {

        inicializado: false,

        usuarioId: null,

        notificacoes: [],

        remetentes: new Map(),

        canalRealtime: null,

        carregando: false

    };


    /* =========================================================
       SUPABASE
       =========================================================

       Obtém o cliente Supabase já inicializado pelo núcleo
       da aplicação.
       ========================================================= */

    function obterSupabase() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            return window.supabaseClient;

        }


        if (
            window.SupabaseClient &&
            typeof window.SupabaseClient.getClient === "function"
        ) {

            return window.SupabaseClient.getClient();

        }


        if (
            window.SupabaseClient &&
            window.SupabaseClient.client
        ) {

            return window.SupabaseClient.client;

        }


        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    /* =========================================================
       USUÁRIO ATUAL
       ========================================================= */

    async function obterUsuarioAtual() {

        if (
            window.Sessao &&
            typeof window.Sessao.usuarioAtual === "function"
        ) {

            const usuario =
                await window.Sessao.usuarioAtual();


            if (usuario) {

                return usuario;

            }

        }


        const supabase =
            obterSupabase();


        const {
            data,
            error
        } = await supabase.auth.getUser();


        if (error) {

            throw error;

        }


        return data?.user || null;

    }


    /* =========================================================
       ELEMENTOS DA PÁGINA
       ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    function obterContainer() {

        return (

            obterElemento("listaNotificacoes") ||

            document.querySelector(
                ".lista-notificacoes"
            ) ||

            document.querySelector(
                "[data-lista-notificacoes]"
            )

        );

    }


    /* =========================================================
       CONTROLE DOS ESTADOS DA PÁGINA
       ========================================================= */

    function ocultarTodosEstados() {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");


        if (carregando) {

            carregando.hidden = true;

        }


        if (vazio) {

            vazio.hidden = true;

        }


        if (erro) {

            erro.hidden = true;

        }

    }


    function mostrarEstadoCarregando() {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");


        if (carregando) {

            carregando.hidden = false;

        }


        if (vazio) {

            vazio.hidden = true;

        }


        if (erro) {

            erro.hidden = true;

        }

    }


    function mostrarEstadoVazio() {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");


        if (carregando) {

            carregando.hidden = true;

        }


        if (vazio) {

            vazio.hidden = false;

        }


        if (erro) {

            erro.hidden = true;

        }

    }


    function mostrarEstadoErro(mensagem) {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");

        const mensagemErro =
            obterElemento("mensagemErro");


        if (carregando) {

            carregando.hidden = true;

        }


        if (vazio) {

            vazio.hidden = true;

        }


        if (erro) {

            erro.hidden = false;

        }


        if (
            mensagemErro &&
            mensagem
        ) {

            mensagemErro.textContent =
                mensagem;

        }

    }


    /* =========================================================
       CARREGAMENTO DAS NOTIFICAÇÕES
       ========================================================= */

    async function carregarNotificacoes() {

        const supabase =
            obterSupabase();


        if (!estado.usuarioId) {

            return;

        }


        const {
            data,
            error
        } = await supabase

            .from(CONFIG.tabela)

            .select(

                [

                    "id",

                    "usuario_id",

                    "remetente_id",

                    "tipo",

                    "titulo",

                    "mensagem",

                    "referencia_id",

                    "referencia_tipo",

                    "lida",

                    "created_at"

                ].join(",")

            )

            .eq(
                "usuario_id",
                estado.usuarioId
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            )

            .limit(
                CONFIG.limiteInicial
            );


        if (error) {

            throw error;

        }


        estado.notificacoes =
            data || [];


        await carregarRemetentes();


        renderizarNotificacoes();

    }


    /* =========================================================
       CARREGAR REMETENTES

       Busca os usuários responsáveis pelas notificações para
       exibir nome e foto corretamente.
       ========================================================= */

    async function carregarRemetentes() {

        const ids = [

            ...new Set(

                estado.notificacoes

                    .map(
                        notificacao =>
                            notificacao.remetente_id
                    )

                    .filter(Boolean)

            )

        ];


        if (!ids.length) {

            return;

        }


        const supabase =
            obterSupabase();


        const {
            data,
            error
        } = await supabase

            .from(
                CONFIG.tabelaUsuarios
            )

            .select(
                "id,nome,foto_url"
            )

            .in(
                "id",
                ids
            );


        if (error) {

            console.warn(

                "MusicalWorldNotificacoes: " +
                "não foi possível carregar remetentes.",

                error

            );

            return;

        }


        (data || []).forEach(
            usuario => {

                estado.remetentes.set(
                    usuario.id,
                    usuario
                );

            }
        );

    }


    /* =========================================================
       DATA E HORA
       ========================================================= */

    function formatarData(data) {

        if (!data) {

            return "";

        }


        const valor =
            new Date(data);


        if (
            Number.isNaN(
                valor.getTime()
            )
        ) {

            return "";

        }


        const hoje =
            new Date();


        const ontem =
            new Date();


        ontem.setDate(
            ontem.getDate() - 1
        );


        const mesmaData =
            (
                primeiro,
                segundo
            ) =>

                primeiro.getFullYear() ===
                    segundo.getFullYear() &&

                primeiro.getMonth() ===
                    segundo.getMonth() &&

                primeiro.getDate() ===
                    segundo.getDate();


        if (
            mesmaData(
                valor,
                hoje
            )
        ) {

            return `Hoje, ${valor.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}`;

        }


        if (
            mesmaData(
                valor,
                ontem
            )
        ) {

            return `Ontem, ${valor.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )}`;

        }


        return valor.toLocaleString(
            "pt-BR",
            {

                day: "2-digit",

                month: "2-digit",

                year: "numeric",

                hour: "2-digit",

                minute: "2-digit"

            }
        );

    }


    /* =========================================================
       ÍCONES DAS NOTIFICAÇÕES
       ========================================================= */

    function obterIcone(tipo) {

        switch (tipo) {

            case "mensagem":

            case "nova_mensagem":

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <path
                            d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4.2A8.4 8.4 0 0 1 3 11.5a8.38 8.38 0 0 1 9-8.5 8.38 8.38 0 0 1 9 8.5Z"
                        ></path>

                    </svg>

                `;


            case "contratacao":

            case "nova_contratacao":

            case "solicitacao_contratacao":

            case "contratacao_aceita":

            case "contratacao_recusada":

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="17"
                            rx="2"
                        ></rect>

                        <path
                            d="M16 2v4"
                        ></path>

                        <path
                            d="M8 2v4"
                        ></path>

                        <path
                            d="M3 10h18"
                        ></path>

                    </svg>

                `;


            default:

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <path
                            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                        ></path>

                        <path
                            d="M10 21h4"
                        ></path>

                    </svg>

                `;

        }

    }


    /* =========================================================
       TÍTULOS PADRÃO
       ========================================================= */

    function obterTituloPadrao(notificacao) {

        if (
            notificacao?.titulo
        ) {

            return notificacao.titulo;

        }


        switch (
            notificacao?.tipo
        ) {

            case "mensagem":

            case "nova_mensagem":

                return "Nova mensagem";


            case "contratacao":

            case "nova_contratacao":

            case "solicitacao_contratacao":

                return "Nova solicitação";


            case "contratacao_aceita":

                return "Contratação aceita";


            case "contratacao_recusada":

                return "Contratação recusada";


            default:

                return "Nova notificação";

        }

    }


    /* =========================================================
       URL DA NOTIFICAÇÃO
       ========================================================= */

    function obterUrlNotificacao(notificacao) {

        if (
            !notificacao?.referencia_id
        ) {

            return null;

        }


        const tipo =
            notificacao.tipo;


        /* -----------------------------------------------------
           NOTIFICAÇÕES DE MENSAGEM
           ----------------------------------------------------- */

        if (

            tipo === "mensagem" ||

            tipo === "nova_mensagem"

        ) {

            return `chat.html?id=${encodeURIComponent(
                notificacao.referencia_id
            )}`;

        }


        /* -----------------------------------------------------
           NOTIFICAÇÕES DE CONTRATAÇÃO
           ----------------------------------------------------- */

        if (

            tipo === "contratacao" ||

            tipo === "nova_contratacao" ||

            tipo === "solicitacao_contratacao" ||

            tipo === "contratacao_aceita" ||

            tipo === "contratacao_recusada"

        ) {

            return `contratacoes.html?id=${encodeURIComponent(
                notificacao.referencia_id
            )}`;

        }


        return null;

    }


    /* =========================================================
       REMETENTE
       ========================================================= */

    function obterRemetente(notificacao) {

        if (
            !notificacao?.remetente_id
        ) {

            return {

                nome: "MusicalWorld",

                foto: CONFIG.imagemSistema,

                sistema: true

            };

        }


        const remetente =
            estado.remetentes.get(
                notificacao.remetente_id
            );


        if (!remetente) {

            return {

                nome: "Usuário",

                foto: "",

                sistema: false

            };

        }


        return {

            nome:
                remetente.nome ||
                "Usuário",

            foto:
                remetente.foto_url ||
                "",

            sistema: false

        };

    }


    /* =========================================================
       OBTER INICIAIS DO NOME
       =========================================================

       Exemplos:

       João Silva
       → JS

       Maria
       → M

       Carlos Eduardo Souza
       → CS

       Ana Paula
       → AP

       Também remove palavras muito comuns do meio do nome
       quando necessário para deixar as iniciais mais limpas.
       ========================================================= */

    function obterIniciais(nome) {

        if (
            !nome ||
            typeof nome !== "string"
        ) {

            return "?";

        }


        const palavras =
            nome
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!palavras.length) {

            return "?";

        }


        /* -----------------------------------------------------
           NOME COM UMA PALAVRA
           ----------------------------------------------------- */

        if (
            palavras.length === 1
        ) {

            return palavras[0]
                .charAt(0)
                .toUpperCase();

        }


        /* -----------------------------------------------------
           PALAVRAS QUE NORMALMENTE NÃO DEVEM SER UTILIZADAS
           COMO INICIAIS PRINCIPAIS.
           ----------------------------------------------------- */

        const palavrasIgnoradas =
            new Set([

                "da",

                "das",

                "de",

                "do",

                "dos",

                "e"

            ]);


        const palavrasValidas =
            palavras.filter(
                palavra =>
                    !palavrasIgnoradas.has(
                        palavra.toLowerCase()
                    )
            );


        /* -----------------------------------------------------
           CASO O FILTRO REMOVA TODAS AS PALAVRAS,
           VOLTA PARA O NOME ORIGINAL.
           ----------------------------------------------------- */

        const base =
            palavrasValidas.length
                ? palavrasValidas
                : palavras;


        /* -----------------------------------------------------
           PRIMEIRA + ÚLTIMA PALAVRA
           ----------------------------------------------------- */

        const primeira =
            base[0]
                .charAt(0)
                .toUpperCase();


        const ultima =
            base[base.length - 1]
                .charAt(0)
                .toUpperCase();


        return primeira + ultima;

    }


    /* =========================================================
       ESCAPE HTML
       ========================================================= */

    function escaparHtml(valor) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            valor === null ||
            valor === undefined
                ? ""
                : String(valor);


        return div.innerHTML;

    }


    /* =========================================================
       AVATAR
       =========================================================

       Comportamento:

       1. Sistema:
          → mostra ícone do MusicalWorld.

       2. Usuário com foto:
          → mostra foto.

       3. Usuário sem foto:
          → mostra iniciais.

       4. Foto quebrada:
          → substitui automaticamente pelas iniciais.
       ========================================================= */

    function renderizarAvatar(remetente) {

        /* -----------------------------------------------------
           NOTIFICAÇÃO DO SISTEMA
           ----------------------------------------------------- */

        if (
            remetente.sistema
        ) {

            return `

                <div
                    class="notificacao-avatar notificacao-avatar-fallback notificacao-avatar-sistema"
                    aria-label="MusicalWorld"
                >

                    ${obterIcone("sistema")}

                </div>

            `;

        }


        const nome =
            remetente.nome ||
            "Usuário";


        const iniciais =
            obterIniciais(
                nome
            );


        /* -----------------------------------------------------
           USUÁRIO COM FOTO
           ----------------------------------------------------- */

        if (
            remetente.foto
        ) {

            return `

                <img
                    class="notificacao-avatar"
                    src="${escaparHtml(
                        remetente.foto
                    )}"
                    alt="${escaparHtml(
                        nome
                    )}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <div
                    class="notificacao-avatar notificacao-avatar-iniciais"
                    aria-label="${escaparHtml(
                        nome
                    )}"
                    style="display: none;"
                >

                    ${escaparHtml(
                        iniciais
                    )}

                </div>

            `;

        }


        /* -----------------------------------------------------
           USUÁRIO SEM FOTO
           ----------------------------------------------------- */

        return `

            <div
                class="notificacao-avatar notificacao-avatar-iniciais"
                aria-label="${escaparHtml(
                    nome
                )}"
            >

                ${escaparHtml(
                    iniciais
                )}

            </div>

        `;

    }


    /* =========================================================
       CRIAÇÃO DO HTML DE UMA NOTIFICAÇÃO
       ========================================================= */

    function criarHtmlNotificacao(notificacao) {

        const remetente =
            obterRemetente(
                notificacao
            );


        const url =
            obterUrlNotificacao(
                notificacao
            );


        const titulo =
            obterTituloPadrao(
                notificacao
            );


        const mensagem =
            notificacao.mensagem ||
            "";


        const data =
            formatarData(
                notificacao.created_at
            );


        const classes = [

            "notificacao-item"

        ];


        /* -----------------------------------------------------
           NOTIFICAÇÃO NÃO LIDA
           ----------------------------------------------------- */

        if (
            !notificacao.lida
        ) {

            classes.push(
                "nao-lida"
            );

        }


        /* -----------------------------------------------------
           NOTIFICAÇÃO CLICÁVEL
           ----------------------------------------------------- */

        if (url) {

            classes.push(
                "clicavel"
            );

        }


        const atributoUrl =
            url

                ? `data-url="${escaparHtml(
                      url
                  )}"`

                : "";


        return `

            <article
                class="${classes.join(" ")}"
                data-notificacao-id="${escaparHtml(
                    notificacao.id
                )}"
                ${atributoUrl}
                role="${
                    url
                        ? "button"
                        : "article"
                }"
                tabindex="${
                    url
                        ? "0"
                        : "-1"
                }"
            >

                <div class="notificacao-avatar-wrapper">

                    ${renderizarAvatar(
                        remetente
                    )}

                </div>


                <div class="notificacao-conteudo">

                    <div class="notificacao-cabecalho">

                        <strong class="notificacao-titulo">

                            ${escaparHtml(
                                titulo
                            )}

                        </strong>


                        <time
                            class="notificacao-data"
                            datetime="${escaparHtml(
                                notificacao.created_at ||
                                    ""
                            )}"
                        >

                            ${escaparHtml(
                                data
                            )}

                        </time>

                    </div>


                    <p class="notificacao-mensagem">

                        ${escaparHtml(
                            mensagem
                        )}

                    </p>


                    ${
                        !notificacao.lida

                            ? `

                                <span
                                    class="notificacao-indicador"
                                    aria-label="Não lida"
                                ></span>

                            `

                            : ""
                    }

                </div>


                <div class="notificacao-icone-tipo">

                    ${obterIcone(
                        notificacao.tipo
                    )}

                </div>

            </article>

        `;

    }


    /* =========================================================
       RENDERIZAÇÃO DA LISTA
       ========================================================= */

    function renderizarNotificacoes() {

        const container =
            obterContainer();


        if (!container) {

            console.warn(
                "MusicalWorldNotificacoes: container da lista não encontrado."
            );

            return;

        }


        ocultarTodosEstados();


        /* -----------------------------------------------------
           NENHUMA NOTIFICAÇÃO
           ----------------------------------------------------- */

        if (
            !estado.notificacoes.length
        ) {

            container.innerHTML = "";

            mostrarEstadoVazio();

            atualizarContadorNaoLidas();

            return;

        }


        /* -----------------------------------------------------
           EXISTEM NOTIFICAÇÕES
           ----------------------------------------------------- */

        container.innerHTML =
            estado.notificacoes

                .map(
                    criarHtmlNotificacao
                )

                .join("");


        configurarEventosItens();


        atualizarContadorNaoLidas();

    }


    /* =========================================================
       CONTADOR DE NOTIFICAÇÕES NÃO LIDAS
       ========================================================= */

    function atualizarContadorNaoLidas() {

        const quantidade =
            estado.notificacoes.filter(
                notificacao =>
                    !notificacao.lida
            ).length;


        /* -----------------------------------------------------
           CONTADORES EXTERNOS
           ----------------------------------------------------- */

        const elementos =
            document.querySelectorAll(
                "[data-notificacoes-nao-lidas]"
            );


        elementos.forEach(
            elemento => {

                elemento.textContent =
                    quantidade > 0
                        ? quantidade
                        : "";


                elemento.hidden =
                    quantidade === 0;

            }
        );


        /* -----------------------------------------------------
           CONTADOR DO CABEÇALHO
           ----------------------------------------------------- */

        const contador =
            obterElemento(
                "contadorNotificacoes"
            );


        if (contador) {

            contador.textContent =
                quantidade > 0
                    ? quantidade
                    : "";


            contador.hidden =
                quantidade === 0;

        }

    }


    /* =========================================================
       MARCAR UMA NOTIFICAÇÃO COMO LIDA
       ========================================================= */

    async function marcarComoLida(
        notificationId
    ) {

        if (!notificationId) {

            return;

        }


        const supabase =
            obterSupabase();


        const {
            error
        } = await supabase

            .from(CONFIG.tabela)

            .update({
                lida: true
            })

            .eq(
                "id",
                notificationId
            )

            .eq(
                "usuario_id",
                estado.usuarioId
            );


        if (error) {

            throw error;

        }


        /* -----------------------------------------------------
           ATUALIZA ESTADO LOCAL
           ----------------------------------------------------- */

        const notificacao =
            estado.notificacoes.find(
                item =>
                    String(item.id) ===
                    String(notificationId)
            );


        if (notificacao) {

            notificacao.lida =
                true;

        }


        atualizarContadorNaoLidas();


        /* -----------------------------------------------------
           ATUALIZA VISUALMENTE O ITEM
           ----------------------------------------------------- */

        const elemento =
            document.querySelector(

                `[data-notificacao-id="${CSS.escape(
                    String(
                        notificationId
                    )
                )}"]`

            );


        if (elemento) {

            elemento.classList.remove(
                "nao-lida"
            );


            const indicador =
                elemento.querySelector(
                    ".notificacao-indicador"
                );


            if (indicador) {

                indicador.remove();

            }

        }

    }


    /* =========================================================
       MARCAR TODAS AS NOTIFICAÇÕES COMO LIDAS
       ========================================================= */

    async function marcarTodasComoLidas() {

        const supabase =
            obterSupabase();


        const {
            error
        } = await supabase

            .from(CONFIG.tabela)

            .update({
                lida: true
            })

            .eq(
                "usuario_id",
                estado.usuarioId
            )

            .eq(
                "lida",
                false
            );


        if (error) {

            throw error;

        }


        estado.notificacoes =
            estado.notificacoes.map(
                notificacao => ({

                    ...notificacao,

                    lida: true

                })
            );


        renderizarNotificacoes();

    }


    /* =========================================================
       EVENTOS DOS ITENS DE NOTIFICAÇÃO
       ========================================================= */

    function configurarEventosItens() {

        const itens =
            document.querySelectorAll(
                ".notificacao-item"
            );


        itens.forEach(
            item => {

                const id =
                    item.dataset
                        .notificacaoId;


                const url =
                    item.dataset.url;


                /* -------------------------------------------------
                   CLIQUE
                   ------------------------------------------------- */

                item.addEventListener(
                    "click",
                    async function () {

                        try {

                            await marcarComoLida(
                                id
                            );

                        } catch (
                            erro
                        ) {

                            console.error(

                                "MusicalWorldNotificacoes: " +
                                "erro ao marcar notificação como lida.",

                                erro

                            );

                        }


                        if (url) {

                            window.location.href =
                                url;

                        }

                    }
                );


                /* -------------------------------------------------
                   TECLADO
                   ------------------------------------------------- */

                item.addEventListener(
                    "keydown",
                    async function (
                        evento
                    ) {

                        if (

                            evento.key !== "Enter" &&

                            evento.key !== " "

                        ) {

                            return;

                        }


                        evento.preventDefault();


                        item.click();

                    }
                );

            }
        );

    }


    /* =========================================================
       BOTÃO MARCAR TODAS
       ========================================================= */

    function configurarBotaoMarcarTodas() {

        const botoes =
            document.querySelectorAll(

                "#btnMarcarTodas, " +
                "#marcarTodasLidas, " +
                "[data-marcar-todas-lidas]"

            );


        botoes.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    async function () {

                        try {

                            botao.disabled =
                                true;


                            await marcarTodasComoLidas();

                        } catch (
                            erro
                        ) {

                            console.error(

                                "MusicalWorldNotificacoes: " +
                                "erro ao marcar todas como lidas.",

                                erro

                            );

                        } finally {

                            botao.disabled =
                                false;

                        }

                    }
                );

            }
        );

    }


    /* =========================================================
       SUPABASE REALTIME
       ========================================================= */

    function encerrarRealtime() {

        if (
            !estado.canalRealtime
        ) {

            return;

        }


        try {

            const supabase =
                obterSupabase();


            supabase.removeChannel(
                estado.canalRealtime
            );

        } catch (
            erro
        ) {

            console.warn(

                "MusicalWorldNotificacoes: " +
                "erro ao encerrar canal Realtime.",

                erro

            );

        }


        estado.canalRealtime =
            null;

    }


    function iniciarRealtime() {

        const supabase =
            obterSupabase();


        encerrarRealtime();


        if (!estado.usuarioId) {

            return;

        }


        const canal =
            supabase

                .channel(
                    "notificacoes-pagina"
                )


                /* ---------------------------------------------
                   NOVA NOTIFICAÇÃO
                   --------------------------------------------- */

                .on(

                    "postgres_changes",

                    {

                        event: "INSERT",

                        schema: "public",

                        table: CONFIG.tabela,

                        filter:
                            `usuario_id=eq.${estado.usuarioId}`

                    },

                    async function (
                        payload
                    ) {

                        console.info(

                            "MusicalWorldNotificacoes: " +
                            "nova notificação recebida.",

                            payload.new

                        );


                        const nova =
                            payload.new;


                        if (

                            !nova ||

                            String(
                                nova.usuario_id
                            ) !==
                            String(
                                estado.usuarioId
                            )

                        ) {

                            return;

                        }


                        const jaExiste =
                            estado.notificacoes.some(

                                notificacao =>

                                    String(
                                        notificacao.id
                                    ) ===

                                    String(
                                        nova.id
                                    )

                            );


                        if (jaExiste) {

                            return;

                        }


                        estado.notificacoes.unshift(
                            nova
                        );


                        await carregarRemetentes();


                        renderizarNotificacoes();

                    }
                )


                /* ---------------------------------------------
                   NOTIFICAÇÃO ATUALIZADA
                   --------------------------------------------- */

                .on(

                    "postgres_changes",

                    {

                        event: "UPDATE",

                        schema: "public",

                        table: CONFIG.tabela,

                        filter:
                            `usuario_id=eq.${estado.usuarioId}`

                    },

                    function (
                        payload
                    ) {

                        console.info(

                            "MusicalWorldNotificacoes: " +
                            "notificação atualizada.",

                            payload.new

                        );


                        const atualizada =
                            payload.new;


                        const indice =
                            estado.notificacoes.findIndex(

                                notificacao =>

                                    String(
                                        notificacao.id
                                    ) ===

                                    String(
                                        atualizada.id
                                    )

                            );


                        if (
                            indice === -1
                        ) {

                            return;

                        }


                        estado.notificacoes[
                            indice
                        ] =
                            atualizada;


                        renderizarNotificacoes();

                    }
                )


                /* ---------------------------------------------
                   ASSINATURA
                   --------------------------------------------- */

                .subscribe(

                    function (
                        status
                    ) {

                        console.info(

                            "MusicalWorldNotificacoes: " +
                            "Realtime:",

                            status

                        );

                    }

                );


        estado.canalRealtime =
            canal;

    }


    /* =========================================================
       BOTÃO VOLTAR
       ========================================================= */

    function configurarBotaoVoltar() {

        const botoes =
            document.querySelectorAll(

                "#btnVoltar, " +
                "[data-voltar-notificacoes]"

            );


        botoes.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            CONFIG.paginaAnterior;

                    }
                );

            }
        );

    }


    /* =========================================================
       BOTÃO TENTAR NOVAMENTE
       ========================================================= */

    function configurarBotaoTentarNovamente() {

        const botao =
            obterElemento(
                "btnTentarNovamente"
            );


        if (!botao) {

            return;

        }


        botao.addEventListener(
            "click",
            async function () {

                try {

                    botao.disabled =
                        true;


                    mostrarEstadoCarregando();


                    await carregarNotificacoes();

                } catch (
                    erro
                ) {

                    console.error(

                        "MusicalWorldNotificacoes: " +
                        "erro ao tentar carregar novamente.",

                        erro

                    );


                    mostrarEstadoErro(

                        "Ocorreu um problema ao carregar suas notificações."

                    );

                } finally {

                    botao.disabled =
                        false;

                }

            }
        );

    }


    /* =========================================================
       INICIALIZAÇÃO DO MÓDULO
       ========================================================= */

    async function inicializar() {

        if (
            estado.inicializado
        ) {

            return;

        }


        if (
            estado.carregando
        ) {

            return;

        }


        estado.carregando =
            true;


        mostrarEstadoCarregando();


        try {

            /* ---------------------------------------------
               USUÁRIO
               --------------------------------------------- */

            const usuario =
                await obterUsuarioAtual();


            if (
                !usuario?.id
            ) {

                throw new Error(
                    "Usuário não autenticado."
                );

            }


            estado.usuarioId =
                usuario.id;


            /* ---------------------------------------------
               NOTIFICAÇÕES
               --------------------------------------------- */

            await carregarNotificacoes();


            /* ---------------------------------------------
               REALTIME
               --------------------------------------------- */

            iniciarRealtime();


            /* ---------------------------------------------
               EVENTOS
               --------------------------------------------- */

            configurarBotaoMarcarTodas();

            configurarBotaoVoltar();

            configurarBotaoTentarNovamente();


            estado.inicializado =
                true;


            console.info(
                "MusicalWorldNotificacoes: módulo inicializado."
            );

        } catch (
            erro
        ) {

            console.error(

                "MusicalWorldNotificacoes: " +
                "erro ao inicializar.",

                erro

            );


            const container =
                obterContainer();


            if (container) {

                container.innerHTML = "";

            }


            mostrarEstadoErro(

                "Ocorreu um problema ao carregar suas notificações."

            );

        } finally {

            const carregando =
                obterElemento(
                    "estadoCarregando"
                );


            if (carregando) {

                carregando.hidden = true;

            }


            estado.carregando =
                false;

        }

    }


    /* =========================================================
       LIMPEZA DO MÓDULO
       ========================================================= */

    function destruir() {

        encerrarRealtime();


        estado.inicializado =
            false;


        estado.usuarioId =
            null;


        estado.notificacoes =
            [];


        estado.remetentes.clear();

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.MusicalWorldNotificacoes = {

        inicializar,

        carregarNotificacoes,

        marcarComoLida,

        marcarTodasComoLidas,

        iniciarRealtime,

        destruir

    };


    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();

    }


})(window);