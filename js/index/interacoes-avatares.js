/* =========================================================
   MUSICALWORLD — AVATARES DAS INTERAÇÕES DO FEED

   Arquivo:
   js/index/interacoes-avatares.js

   Responsabilidade:

   - Funciona exclusivamente no Index.
   - Buscar usuários que curtiram um perfil.
   - Buscar usuários que comentaram em um perfil.
   - Buscar usuários que salvaram um perfil.
   - Exibir no máximo 3 avatares por interação.
   - Evitar usuários duplicados.
   - Utilizar a foto cadastrada em usuarios.
   - Utilizar iniciais como fallback.
   - Esconder o grupo quando não existir interação.

   IMPORTANTE:

   Este módulo NÃO altera:

   - js/components/interacoes-perfil.js
   - A página apresentar-perfil.html
   - O funcionamento dos botões de interação.
   - Os contadores existentes.

   Ele funciona apenas como uma camada visual adicional
   do Index.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        seletorFeed:
            "#feed-profissionais",

        seletorCard:
            ".ad-card-novo",

        seletorAvatares:
            "[data-interacao-avatares]",

        tabelas: {

            curtidas:
                "curtidas_perfis",

            comentarios:
                "comentarios_perfis",

            salvos:
                "favoritos_perfis"

        },

        maximoAvatares:
            3,

        quantidadeBusca:
            20

    };


    /* =====================================================
       OBTER SUPABASE
    ===================================================== */

    function obterSupabase() {

        if (
            window.supabaseClient
        ) {

            return window.supabaseClient;

        }

        return null;

    }


    /* =====================================================
       ESCAPAR HTML
    ===================================================== */

    function escaparHtml(valor) {

        return String(valor ?? "")

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       GERAR INICIAIS
    ===================================================== */

    function gerarIniciais(nome) {

        const partes =
            String(
                nome || ""
            )
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {

            return "U";

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

    }


    /* =====================================================
       OBTER PERFIL ID DO CARD
    ===================================================== */

    function obterPerfilId(card) {

        if (!card) {

            return null;

        }


        const perfilId =
            card.dataset.perfilId;


        if (!perfilId) {

            return null;

        }


        return String(
            perfilId
        ).trim();

    }


    /* =====================================================
       OBTER USUÁRIOS DA INTERAÇÃO
    ===================================================== */

    async function buscarUsuariosInteracao(
        perfilId,
        tipo
    ) {

        const supabase =
            obterSupabase();


        if (
            !supabase ||
            !perfilId ||
            !CONFIG.tabelas[tipo]
        ) {

            return [];

        }


        try {

            const resposta =
                await supabase

                    .from(
                        CONFIG.tabelas[tipo]
                    )

                    .select(
                        "usuario_id"
                    )

                    .eq(
                        "perfil_id",
                        perfilId
                    )

                    .limit(
                        CONFIG.quantidadeBusca
                    );


            if (
                resposta.error
            ) {

                console.warn(
                    "MusicalWorld: erro ao buscar usuários da interação.",
                    tipo,
                    resposta.error
                );

                return [];

            }


            const registros =
                Array.isArray(
                    resposta.data
                )
                    ? resposta.data
                    : [];


            const ids =
                [];


            registros.forEach(
                registro => {

                    const usuarioId =
                        registro?.usuario_id;


                    if (
                        !usuarioId
                    ) {

                        return;

                    }


                    const id =
                        String(
                            usuarioId
                        );


                    if (
                        ids.includes(id)
                    ) {

                        return;

                    }


                    ids.push(id);

                }
            );


            if (!ids.length) {

                return [];

            }


            return await buscarDadosUsuarios(
                ids
            );

        } catch (erro) {

            console.error(
                "MusicalWorld: erro inesperado ao buscar avatares.",
                tipo,
                erro
            );

            return [];

        }

    }


    /* =====================================================
       BUSCAR DADOS DOS USUÁRIOS
       ===================================================== */

    async function buscarDadosUsuarios(
        ids
    ) {

        const supabase =
            obterSupabase();


        if (
            !supabase ||
            !Array.isArray(ids) ||
            !ids.length
        ) {

            return [];

        }


        try {

            const resposta =
                await supabase

                    .from(
                        "usuarios"
                    )

                    .select(
                        `
                        id,
                        nome,
                        foto_url
                        `
                    )

                    .in(
                        "id",
                        ids
                    );


            if (
                resposta.error
            ) {

                console.warn(
                    "MusicalWorld: não foi possível carregar os usuários das interações.",
                    resposta.error
                );

                return [];

            }


            const usuarios =
                Array.isArray(
                    resposta.data
                )
                    ? resposta.data
                    : [];


            const mapa =
                new Map();


            usuarios.forEach(
                usuario => {

                    if (
                        !usuario?.id
                    ) {

                        return;

                    }


                    mapa.set(
                        String(
                            usuario.id
                        ),
                        usuario
                    );

                }
            );


            /*
             * Mantemos a ordem retornada pela tabela
             * de interação.
             *
             * Isso evita que a ordem dos usuários
             * seja alterada pela consulta em usuarios.
             */

            return ids

                .map(
                    id =>
                        mapa.get(
                            String(id)
                        )
                )

                .filter(Boolean)

                .slice(
                    0,
                    CONFIG.maximoAvatares
                );

        } catch (erro) {

            console.error(
                "MusicalWorld: erro ao carregar dados dos usuários.",
                erro
            );

            return [];

        }

    }


    /* =====================================================
       CRIAR AVATAR
       ===================================================== */

    function criarAvatar(
        usuario,
        indice,
        tipo
    ) {

        const nome =
            String(
                usuario?.nome ||
                "Usuário"
            ).trim();


        const fotoUrl =
            String(
                usuario?.foto_url ||
                ""
            ).trim();


        const iniciais =
            gerarIniciais(
                nome
            );


        const avatar =
            document.createElement(
                "span"
            );


        avatar.className =
            "ad-interacao-avatar";


        avatar.style.setProperty(
            "--avatar-index",
            String(indice)
        );


        avatar.dataset.interacaoTipo =
            tipo;


        avatar.title =
            nome;


        avatar.setAttribute(
            "aria-label",
            nome
        );


        if (fotoUrl) {

            const imagem =
                document.createElement(
                    "img"
                );


            imagem.src =
                fotoUrl;


            imagem.alt =
                "";


            imagem.loading =
                "lazy";


            imagem.className =
                "ad-interacao-avatar-imagem";


            imagem.addEventListener(
                "error",
                function () {

                    imagem.remove();

                    avatar.classList.add(
                        "ad-interacao-avatar-fallback"
                    );


                    avatar.textContent =
                        iniciais;

                },
                {
                    once: true
                }
            );


            avatar.appendChild(
                imagem
            );

        } else {

            avatar.classList.add(
                "ad-interacao-avatar-fallback"
            );


            avatar.textContent =
                iniciais;

        }


        return avatar;

    }


    /* =====================================================
       RENDERIZAR AVATARES
       ===================================================== */

    function renderizarAvatares(
        container,
        usuarios,
        tipo
    ) {

        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        if (
            !Array.isArray(usuarios) ||
            !usuarios.length
        ) {

            container.hidden =
                true;

            container.setAttribute(
                "aria-hidden",
                "true"
            );

            return;

        }


        usuarios

            .slice(
                0,
                CONFIG.maximoAvatares
            )

            .forEach(
                (
                    usuario,
                    indice
                ) => {

                    const avatar =
                        criarAvatar(
                            usuario,
                            indice,
                            tipo
                        );


                    container.appendChild(
                        avatar
                    );

                }
            );


        container.hidden =
            false;


        container.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CARREGAR UMA INTERAÇÃO
       ===================================================== */

    async function carregarInteracao(
        card,
        container
    ) {

        if (
            !card ||
            !container
        ) {

            return;

        }


        const perfilId =
            obterPerfilId(
                card
            );


        const tipo =
            container.dataset.interacaoAvatares;


        if (
            !perfilId ||
            !tipo
        ) {

            container.hidden =
                true;

            return;

        }


        /*
         * Evita consultas duplicadas enquanto o mesmo
         * card ainda está sendo processado.
         */

        if (
            container.dataset.carregando ===
            "true"
        ) {

            return;

        }


        container.dataset.carregando =
            "true";


        try {

            const usuarios =
                await buscarUsuariosInteracao(
                    perfilId,
                    tipo
                );


            renderizarAvatares(
                container,
                usuarios,
                tipo
            );

        } catch (erro) {

            console.error(
                "MusicalWorld: erro ao renderizar avatares da interação.",
                erro
            );

            container.hidden =
                true;

        } finally {

            container.dataset.carregando =
                "false";


            container.dataset.carregado =
                "true";

        }

    }


    /* =====================================================
       CARREGAR TODOS OS AVATARES DE UM CARD
       ===================================================== */

    async function carregarCard(
        card
    ) {

        if (!card) {

            return;

        }


        const containers =
            card.querySelectorAll(
                CONFIG.seletorAvatares
            );


        if (!containers.length) {

            return;

        }


        await Promise.all(

            Array.from(
                containers
            ).map(
                container =>
                    carregarInteracao(
                        card,
                        container
                    )
            )

        );

    }


    /* =====================================================
       CARREGAR CARDS EXISTENTES
       ===================================================== */

    function carregarCardsExistentes() {

        const feed =
            document.querySelector(
                CONFIG.seletorFeed
            );


        if (!feed) {

            return;

        }


        const cards =
            feed.querySelectorAll(
                CONFIG.seletorCard
            );


        cards.forEach(
            card => {

                carregarCard(
                    card
                );

            }
        );

    }


    /* =====================================================
       OBSERVAR NOVOS CARDS
       ===================================================== */

    function observarNovosCards() {

        const feed =
            document.querySelector(
                CONFIG.seletorFeed
            );


        if (!feed) {

            return;

        }


        const observer =
            new MutationObserver(
                mutacoes => {

                    mutacoes.forEach(
                        mutacao => {

                            mutacao.addedNodes.forEach(
                                node => {

                                    if (
                                        node.nodeType !==
                                        Node.ELEMENT_NODE
                                    ) {

                                        return;

                                    }


                                    if (
                                        node.matches &&
                                        node.matches(
                                            CONFIG.seletorCard
                                        )
                                    ) {

                                        carregarCard(
                                            node
                                        );

                                        return;

                                    }


                                    const cards =
                                        node.querySelectorAll
                                            ? node.querySelectorAll(
                                                CONFIG.seletorCard
                                            )
                                            : [];


                                    cards.forEach(
                                        card => {

                                            carregarCard(
                                                card
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );


        observer.observe(
            feed,
            {
                childList: true,
                subtree: true
            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function inicializar() {

        const feed =
            document.querySelector(
                CONFIG.seletorFeed
            );


        if (!feed) {

            console.warn(
                "MusicalWorld: feed não encontrado para os avatares das interações."
            );

            return;

        }


        carregarCardsExistentes();

        observarNovosCards();

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldInteracoesAvatares = {

        inicializar,

        carregarCard,

        carregarInteracao

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            {
                once: true
            }
        );

    } else {

        inicializar();

    }


})(window);