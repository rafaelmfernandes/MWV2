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
       - Marcar notificações como lidas.
       - Marcar todas como lidas.
       - Atualizar a página em tempo real através do
         Supabase Realtime.
       - Direcionar notificações para suas páginas
         correspondentes.
       ========================================================= */

    const CONFIG = {
        tabela: "notificacoes",
        tabelaUsuarios: "usuarios",
        limiteInicial: 100,
        paginaAnterior: "index.html",
        imagemSistema: "img/logo-musicalworld.svg"
    };

    /* =========================================================
       ESTADO
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
       ========================================================= */

    function obterSupabase() {
        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from ===
                "function"
        ) {
            return window.supabaseClient;
        }

        if (
            window.SupabaseClient &&
            typeof window.SupabaseClient.getClient ===
                "function"
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
            typeof window.Sessao.usuarioAtual ===
                "function"
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
       ELEMENTOS
       ========================================================= */

    function obterElemento(id) {
        return document.getElementById(id);
    }

    function obterContainer() {
        return (
            obterElemento(
                "listaNotificacoes"
            ) ||
            document.querySelector(
                ".lista-notificacoes"
            ) ||
            document.querySelector(
                "[data-lista-notificacoes]"
            )
        );
    }

    /* =========================================================
       CARREGAMENTO
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

    async function carregarRemetentes() {
        const ids =
            [
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
            /*
             * A notificação continua podendo ser exibida
             * mesmo que o carregamento dos remetentes falhe.
             */
            console.warn(
                "MusicalWorldNotificacoes: não foi possível carregar remetentes.",
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
       DATA / HORA
       ========================================================= */

    function formatarData(
        data
    ) {
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
       ÍCONES
       ========================================================= */

    function obterIcone(
        tipo
    ) {
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

    function obterTituloPadrao(
        notificacao
    ) {
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

    function obterUrlNotificacao(
        notificacao
    ) {
        if (
            !notificacao?.referencia_id
        ) {
            return null;
        }

        const tipo =
            notificacao.tipo;

        /*
         * Mensagens continuam levando para o chat.
         */

        if (
            tipo === "mensagem" ||
            tipo === "nova_mensagem"
        ) {
            return `chat.html?id=${encodeURIComponent(
                notificacao.referencia_id
            )}`;
        }

        /*
         * Solicitações antigas continuam apontando para
         * a página geral de contratação.
         */

        if (
            tipo === "contratacao" ||
            tipo === "nova_contratacao" ||
            tipo === "solicitacao_contratacao"
        ) {
            return `contratacao.html?id=${encodeURIComponent(
                notificacao.referencia_id
            )}`;
        }

        /*
         * ACEITA / RECUSADA precisam levar o contratante
         * diretamente para o acompanhamento da contratação.
         */

        if (
            tipo === "contratacao_aceita" ||
            tipo === "contratacao_recusada"
        ) {
            return `contratacao-acompanhamento.html?id=${encodeURIComponent(
                notificacao.referencia_id
            )}`;
        }

        return null;
    }

    /* =========================================================
       REMETENTE
       ========================================================= */

    function obterRemetente(
        notificacao
    ) {
        if (
            !notificacao?.remetente_id
        ) {
            return {
                nome: "MusicalWorld",
                foto:
                    CONFIG.imagemSistema,
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
       ESCAPE HTML
       ========================================================= */

    function escaparHtml(
        valor
    ) {
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
       ========================================================= */

    function renderizarAvatar(
        remetente
    ) {
        if (remetente.foto) {
            return `
                <img
                    class="notificacao-avatar"
                    src="${escaparHtml(
                        remetente.foto
                    )}"
                    alt="${escaparHtml(
                        remetente.nome
                    )}"
                    loading="lazy"
                >
            `;
        }

        return `
            <div
                class="notificacao-avatar notificacao-avatar-fallback"
                aria-hidden="true"
            >
                ${obterIcone(
                    remetente.sistema
                        ? "sistema"
                        : "usuario"
                )}
            </div>
        `;
    }

    /* =========================================================
       CRIAÇÃO DO HTML
       ========================================================= */

    function criarHtmlNotificacao(
        notificacao
    ) {
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

        if (
            !notificacao.lida
        ) {
            classes.push(
                "nao-lida"
            );
        }

        if (
            url
        ) {
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
                class="${classes.join(
                    " "
                )}"
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
       RENDERIZAÇÃO
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

        if (
            !estado.notificacoes.length
        ) {
            container.innerHTML = `
                <div class="notificacoes-vazio">
                    <div class="notificacoes-vazio-icone">
                        ${obterIcone(
                            "sistema"
                        )}
                    </div>

                    <h2>
                        Nenhuma notificação
                    </h2>

                    <p>
                        Quando houver novidades, elas aparecerão aqui.
                    </p>
                </div>
            `;

            atualizarContadorNaoLidas();

            return;
        }

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
       CONTADOR DE NÃO LIDAS
       ========================================================= */

    function atualizarContadorNaoLidas() {
        const quantidade =
            estado.notificacoes.filter(
                notificacao =>
                    !notificacao.lida
            ).length;

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
       MARCAR TODAS COMO LIDAS
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
       EVENTOS DOS ITENS
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
                                "MusicalWorldNotificacoes: erro ao marcar notificação como lida.",
                                erro
                            );
                        }

                        if (url) {
                            window.location.href =
                                url;
                        }
                    }
                );

                item.addEventListener(
                    "keydown",
                    async function (
                        evento
                    ) {
                        if (
                            evento.key !==
                                "Enter" &&
                            evento.key !==
                                " "
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
                "#marcarTodasLidas, [data-marcar-todas-lidas]"
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
                                "MusicalWorldNotificacoes: erro ao marcar todas como lidas.",
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
       REALTIME
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
                "MusicalWorldNotificacoes: erro ao encerrar canal Realtime.",
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
                            "MusicalWorldNotificacoes: nova notificação recebida.",
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

                        /*
                         * Evita duplicação caso o Realtime
                         * envie um registro que já esteja
                         * na lista.
                         */

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

                        if (
                            jaExiste
                        ) {
                            return;
                        }

                        estado.notificacoes.unshift(
                            nova
                        );

                        await carregarRemetentes();

                        renderizarNotificacoes();
                    }
                )
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
                            "MusicalWorldNotificacoes: notificação atualizada.",
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
                .subscribe(
                    function (
                        status
                    ) {
                        console.info(
                            "MusicalWorldNotificacoes: Realtime:",
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
                "#btnVoltar, [data-voltar-notificacoes]"
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
       INICIALIZAÇÃO
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

        try {
            const usuario =
                await obterUsuarioAtual();

            if (!usuario?.id) {
                throw new Error(
                    "Usuário não autenticado."
                );
            }

            estado.usuarioId =
                usuario.id;

            await carregarNotificacoes();

            iniciarRealtime();

            configurarBotaoMarcarTodas();

            configurarBotaoVoltar();

            estado.inicializado =
                true;

            console.info(
                "MusicalWorldNotificacoes: módulo inicializado."
            );

        } catch (
            erro
        ) {
            console.error(
                "MusicalWorldNotificacoes: erro ao inicializar.",
                erro
            );

            const container =
                obterContainer();

            if (container) {
                container.innerHTML = `
                    <div class="notificacoes-erro">
                        <h2>
                            Não foi possível carregar as notificações
                        </h2>

                        <p>
                            Tente atualizar a página.
                        </p>
                    </div>
                `;
            }
        } finally {
            estado.carregando =
                false;
        }
    }

    /* =========================================================
       LIMPEZA
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
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );
    } else {
        inicializar();
    }

})(window);