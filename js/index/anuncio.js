/* =========================================================
   MUSICALWORLD — MÓDULO DE ANÚNCIOS DO FEED

   Arquivo:
   js/index/anuncio.js

   Responsabilidades:

   * Criar e renderizar os anúncios do feed.
   * Montar a identidade do artista ou estabelecimento.
   * Renderizar imagem ou vídeo de destaque.
   * Controlar reprodução automática dos vídeos.
   * Controlar vídeo em tela cheia.
   * Controlar menu da publicação.
   * Controlar compartilhamento do perfil.
   * Controlar fallbacks de imagem, avatar e vídeo.
   * Observar os vídeos presentes no feed.
   * Integrar o card ao componente de interações.

   IMPORTANTE:

   A lógica de:

   * Curtir
   * Comentar
   * Salvar

   pertence ao:

       js/components/interacoes-perfil.js

   Este arquivo somente prepara os botões e entrega
   o card ao componente de interações.

   REGRA PRINCIPAL DA MÍDIA:

   1. Vídeo de portfólio:
      mostra o vídeo.

   2. Imagem de portfólio:
      mostra a imagem.

   3. Sem mídia de portfólio:
      NÃO mostra a foto de perfil na área de destaque.

   4. Foto de perfil:
      aparece SOMENTE no avatar da identidade.

   5. Sem foto de perfil:
      mostra somente o avatar padrão com iniciais.

   6. Se uma mídia de portfólio falhar:
      o anúncio NÃO é removido.
      A área de destaque é removida e o card
      permanece sem mídia.

   7. Sem localização:
      mostra "Localização não informada".

   8. IDENTIDADE COM MÍDIA:
      texto branco sobre a mídia.

   9. IDENTIDADE SEM MÍDIA:
      texto escuro em fluxo normal.

   IMPORTANTE:

   A foto de perfil NUNCA é utilizada como mídia
   de destaque.

   SUPORTE A PERFIS:

   * Artista:
     perfil.perfis_artistas

   * Estabelecimento:
     perfil.perfis_estabelecimentos

   A estrutura visual do anúncio permanece a mesma
   para os dois tipos de perfil.
========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÕES DOS VÍDEOS
    ========================================================= */

    const ANUNCIO_VIDEO_CONFIG = {

        atrasoInicial: 2000,

        percentualMinimoVisivel: 0.55,

        observer: null,

        timers: new Map(),

        configurado: false
    };


    /* =========================================================
       UTILITÁRIOS
    ========================================================= */

    function normalizarTexto(valor) {

        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    }


    function normalizarLista(valor) {

        if (Array.isArray(valor)) {

            return valor
                .map(item => String(item || "").trim())
                .filter(Boolean);
        }


        if (typeof valor === "string") {

            return valor
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
        }


        return [];
    }


    function escaparHtml(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function gerarIniciais(nome) {

        const texto =
            String(nome || "Profissional").trim();


        if (!texto) {

            return "P";
        }


        const partes =
            texto
                .split(/\s+/)
                .filter(Boolean);


        if (partes.length === 1) {

            return partes[0]
                .substring(0, 2)
                .toUpperCase();
        }


        return (
            partes[0].charAt(0) +
            partes[partes.length - 1].charAt(0)
        ).toUpperCase();
    }


    /* =========================================================
       IDENTIFICAÇÃO DO PERFIL
    ========================================================= */

    function obterArtistaPerfil(perfil) {

        if (!perfil) {

            return {};
        }


        return (
            perfil.perfil_artista ||
            perfil.perfis_artistas ||
            perfil.artista ||
            {}
        );
    }


    function obterEstabelecimentoPerfil(perfil) {

        if (!perfil) {

            return {};
        }


        return (
            perfil.perfil_estabelecimento ||
            perfil.perfis_estabelecimentos ||
            perfil.estabelecimento ||
            {}
        );
    }


    function perfilEhEstabelecimento(perfil) {

        const estabelecimento =
            obterEstabelecimentoPerfil(perfil);


        return Boolean(
            estabelecimento &&
            estabelecimento.id
        );
    }


    /* =========================================================
       NOMES DOS TIPOS DE PERFIL

       Os tipos 3 a 11 correspondem aos estabelecimentos
       atualmente cadastrados em tipos_perfil.

       Esta função é utilizada somente quando a RPC
       entrega o tipo_perfil_id, mas não entrega diretamente
       o nome do tipo.
    ========================================================= */

    function obterNomeTipoPerfil(id) {

        const tipos = {

            1: "Artista",

            2: "Contratante",

            3: "Organizador de eventos",

            4: "Casa de shows",

            5: "Empresa / Agência",

            6: "Restaurante",

            7: "Hotel",

            8: "Clube",

            9: "Boate",

            10: "Pousada",

            11: "Bar"
        };


        return tipos[id] || "Perfil";
    }


    function obterDestaquePortfolio(perfil) {

        if (!perfil) {

            return null;
        }


        const portfolio =
            Array.isArray(perfil.portfolio_musicos)
                ? perfil.portfolio_musicos
                : [];


        if (!portfolio.length) {

            return null;
        }


        const ativos =
            portfolio.filter(item => {

                return item &&
                    item.ativo !== false;
            });


        if (!ativos.length) {

            return null;
        }


        const destaque =
            ativos.find(item => {

                return (
                    item.destaque_catalogo === true ||
                    item.destaque_catalogo === "true"
                );
            });


        return destaque || null;
    }


    function obterNomeTipo(tipo) {

        if (!tipo) {

            return "Artista";
        }


        if (typeof tipo === "object") {

            return (
                tipo.nome ||
                tipo.titulo ||
                tipo.tipo ||
                "Artista"
            );
        }


        return String(tipo);
    }


    /* =========================================================
       PÁGINA DO PERFIL

       Foto e nome do perfil:

           meu-perfil.html?id=<perfilId>

       A página Meu Perfil interpreta esse ID como
       o perfil que está sendo visualizado.
    ========================================================= */

    function obterPaginaPerfil() {

        return "meu-perfil.html";
    }


    /* =========================================================
       PÁGINA DE APRESENTAÇÃO DO PERFIL

       A mídia do anúncio:

           apresentar-perfil.html?id=<perfilId>

       A mídia representa o conteúdo do anúncio e,
       portanto, abre a apresentação pública do perfil.
    ========================================================= */

    function obterPaginaApresentarPerfil() {

        return "apresentar-perfil.html";
    }


    /* =========================================================
       ÍCONES DOS ANÚNCIOS
    ========================================================= */

    function obterIconeAnuncio(tipo) {

        const icones = {

            comentar: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 8.7 3.9 8.4 8.4 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z"/>
                </svg>
            `,


            curtir: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M20.8 8.9c0 5.5-8.8 10.6-8.8 10.6S3.2 14.4 3.2 8.9A4.7 4.7 0 0 1 8 4.2c1.6 0 3.1.8 4 2.1.9-1.3 2.4-2.1 4-2.1a4.7 4.7 0 0 1 4.8 4.7z"/>
                </svg>
            `,


            compartilhar: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="18" cy="5" r="2.5"/>
                    <circle cx="6" cy="12" r="2.5"/>
                    <circle cx="18" cy="19" r="2.5"/>
                    <path d="m8.2 10.8 7.6-4.6"/>
                    <path d="m8.2 13.2 7.6 4.6"/>
                </svg>
            `,


            salvar: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5z"/>
                </svg>
            `,


            menu: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                >
                    <circle cx="5" cy="12" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="19" cy="12" r="1.5"/>
                </svg>
            `,


            localizacao: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M20 10.5c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0z"/>
                    <circle cx="12" cy="10.5" r="2.5"/>
                </svg>
            `,


            musica: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M9 18V5l11-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="17" cy="16" r="3"/>
                </svg>
            `,


            estrela: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="currentColor"
                >
                    <path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 2.8z"/>
                </svg>
            `
        };


        return icones[tipo] || "";
    }


    /* =========================================================
       CONTROLE DOS VÍDEOS
    ========================================================= */

    function cancelarTimerVideo(video) {

        if (!video) {

            return;
        }


        const timer =
            ANUNCIO_VIDEO_CONFIG.timers.get(video);


        if (timer) {

            clearTimeout(timer);

            ANUNCIO_VIDEO_CONFIG.timers.delete(video);
        }
    }


    function cancelarTodosTimersVideos() {

        ANUNCIO_VIDEO_CONFIG.timers.forEach(timer => {

            clearTimeout(timer);
        });


        ANUNCIO_VIDEO_CONFIG.timers.clear();
    }


    function pausarTodosVideos(exceptVideo = null) {

        const videos =
            document.querySelectorAll(
                ".ad-media-video"
            );


        videos.forEach(video => {

            if (video === exceptVideo) {

                return;
            }


            cancelarTimerVideo(video);


            try {

                video.pause();

            } catch (erro) {

                console.warn(
                    "MusicalWorld Anúncio: não foi possível pausar vídeo.",
                    erro
                );
            }
        });
    }


    function calcularVisibilidadeVideo(video) {

        if (!video) {

            return 0;
        }


        const rect =
            video.getBoundingClientRect();


        const alturaJanela =
            window.innerHeight ||
            document.documentElement.clientHeight;


        if (
            rect.bottom <= 0 ||
            rect.top >= alturaJanela
        ) {

            return 0;
        }


        const topoVisivel =
            Math.max(0, rect.top);


        const baixoVisivel =
            Math.min(
                alturaJanela,
                rect.bottom
            );


        const alturaVisivel =
            Math.max(
                0,
                baixoVisivel - topoVisivel
            );


        const alturaTotal =
            Math.max(1, rect.height);


        return (
            alturaVisivel /
            alturaTotal
        );
    }


    function videoEstaVisivel(video) {

        return (
            calcularVisibilidadeVideo(video) >=
            ANUNCIO_VIDEO_CONFIG.percentualMinimoVisivel
        );
    }


    function reproduzirVideo(video) {

        if (!video) {

            return;
        }


        if (!videoEstaVisivel(video)) {

            return;
        }


        cancelarTimerVideo(video);

        pausarTodosVideos(video);


        const promessa =
            video.play();


        if (
            promessa &&
            typeof promessa.catch === "function"
        ) {

            promessa.catch(() => {

                /*
                 * O navegador pode bloquear o autoplay.
                 */
            });
        }
    }


    function agendarReproducaoVideo(video) {

        if (!video) {

            return;
        }


        cancelarTimerVideo(video);


        if (!videoEstaVisivel(video)) {

            return;
        }


        const timer =
            setTimeout(() => {

                ANUNCIO_VIDEO_CONFIG.timers.delete(
                    video
                );


                if (
                    !document.body.contains(video)
                ) {

                    return;
                }


                reproduzirVideo(video);

            }, ANUNCIO_VIDEO_CONFIG.atrasoInicial);


        ANUNCIO_VIDEO_CONFIG.timers.set(
            video,
            timer
        );
    }


    function atualizarVideosVisiveis() {

        const videos =
            Array.from(
                document.querySelectorAll(
                    ".ad-media-video"
                )
            );


        if (!videos.length) {

            return;
        }


        videos.forEach(video => {

            if (videoEstaVisivel(video)) {

                agendarReproducaoVideo(video);

            } else {

                cancelarTimerVideo(video);


                try {

                    video.pause();

                } catch (erro) {

                    console.warn(
                        "MusicalWorld Anúncio: erro ao pausar vídeo.",
                        erro
                    );
                }
            }
        });
    }


    function inicializarObservadorVideos() {

        if (
            ANUNCIO_VIDEO_CONFIG.configurado &&
            ANUNCIO_VIDEO_CONFIG.observer
        ) {

            observarVideosExistentes();

            return;
        }


        if (
            !("IntersectionObserver" in window)
        ) {

            ANUNCIO_VIDEO_CONFIG.configurado =
                true;

            atualizarVideosVisiveis();

            return;
        }


        ANUNCIO_VIDEO_CONFIG.observer =
            new IntersectionObserver(
                entradas => {

                    entradas.forEach(entrada => {

                        const video =
                            entrada.target;


                        if (!video) {

                            return;
                        }


                        if (
                            entrada.isIntersecting &&
                            entrada.intersectionRatio >=
                                ANUNCIO_VIDEO_CONFIG.percentualMinimoVisivel
                        ) {

                            agendarReproducaoVideo(
                                video
                            );

                        } else {

                            cancelarTimerVideo(
                                video
                            );


                            try {

                                video.pause();

                            } catch (erro) {

                                console.warn(
                                    "MusicalWorld Anúncio: erro ao pausar vídeo.",
                                    erro
                                );
                            }
                        }
                    });

                },
                {
                    threshold: [
                        0,
                        ANUNCIO_VIDEO_CONFIG.percentualMinimoVisivel,
                        0.75,
                        1
                    ]
                }
            );


        ANUNCIO_VIDEO_CONFIG.configurado =
            true;


        observarVideosExistentes();
    }


    function observarVideosExistentes() {

        if (!ANUNCIO_VIDEO_CONFIG.observer) {

            return;
        }


        const videos =
            document.querySelectorAll(
                ".ad-media-video"
            );


        videos.forEach(video => {

            if (
                video.dataset.feedVideoObserved ===
                "true"
            ) {

                return;
            }


            video.dataset.feedVideoObserved =
                "true";


            ANUNCIO_VIDEO_CONFIG.observer.observe(
                video
            );
        });
    }


    function configurarVisibilidadePaginaVideos() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (document.hidden) {

                    cancelarTodosTimersVideos();

                    pausarTodosVideos();

                } else {

                    atualizarVideosVisiveis();
                }
            }
        );
    }


    function configurarControleScrollVideos() {

        let timeout = null;


        const atualizar = () => {

            if (timeout) {

                clearTimeout(timeout);
            }


            timeout =
                setTimeout(() => {

                    atualizarVideosVisiveis();

                }, 100);
        };


        window.addEventListener(
            "scroll",
            atualizar,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            atualizar
        );
    }


    /* =========================================================
       TRANSFORMA O CARD PARA O ESTADO SEM MÍDIA

       Esta função NÃO remove o anúncio.

       Ela remove somente a área grande de mídia
       e mantém a identidade do perfil.
    ========================================================= */

    function transformarCardSemMidia(card) {

        if (!card) {

            return;
        }


        const mediaBox =
            card.querySelector(
                ".ad-media-box"
            );


        const identidade =
            card.querySelector(
                ".ad-media-identidade"
            );


        const menu =
            card.querySelector(
                ".ad-card-menu"
            );


        if (mediaBox) {

            mediaBox.remove();
        }


        if (!identidade) {

            return;
        }


        identidade.classList.remove(
            "ad-identidade-com-midia"
        );


        identidade.classList.add(
            "ad-identidade-sem-midia"
        );


        identidade.style.position =
            "static";


        identidade.style.inset =
            "auto";


        identidade.style.color =
            "";


        const containerExistente =
            card.querySelector(
                ".ad-card-identidade-sem-midia"
            );


        if (containerExistente) {

            if (
                !containerExistente.contains(
                    identidade
                )
            ) {

                containerExistente.appendChild(
                    identidade
                );
            }


            if (
                menu &&
                !containerExistente.contains(
                    menu
                )
            ) {

                containerExistente.appendChild(
                    menu
                );
            }


            return;
        }


        const container =
            document.createElement(
                "div"
            );


        container.className =
            "ad-card-identidade-sem-midia";


        container.appendChild(
            identidade
        );


        if (menu) {

            container.appendChild(
                menu
            );
        }


        card.insertBefore(
            container,
            card.firstElementChild
        );
    }


    /* =========================================================
       COMPARTILHAR PERFIL

       Retorna:

       true  = compartilhamento/cópia realizado
       false = cancelado ou não realizado

       O contador só será incrementado quando esta função
       retornar true.
    ========================================================= */

    async function compartilharPerfil(
        perfilId,
        nome
    ) {

        if (!perfilId) {

            return false;
        }


        const url =
            new URL(
                obterPaginaPerfil(),
                window.location.href
            );


        url.searchParams.set(
            "id",
            perfilId
        );


        const dadosCompartilhamento = {

            title:
                `Perfil de ${nome || "perfil"} — MusicalWorld`,

            text:
                `Confira este perfil no MusicalWorld.`,

            url:
                url.href
        };


        try {

            if (
                navigator.share &&
                typeof navigator.share === "function"
            ) {

                await navigator.share(
                    dadosCompartilhamento
                );


                return true;
            }


            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText ===
                    "function"
            ) {

                await navigator.clipboard.writeText(
                    url.href
                );


                console.info(
                    "MusicalWorld: link do perfil copiado.",
                    url.href
                );


                return true;
            }


            console.info(
                "MusicalWorld: link do perfil:",
                url.href
            );


            return false;

        } catch (erro) {

            if (
                erro &&
                erro.name === "AbortError"
            ) {

                return false;
            }


            console.warn(
                "MusicalWorld Anúncio: não foi possível compartilhar o perfil.",
                erro
            );


            return false;
        }
    }


    /* =========================================================
       REGISTRA O COMPARTILHAMENTO

       A tabela compartilhamentos_perfis registra uma pessoa
       compartilhando um determinado perfil.

       Existe uma restrição única por:

           perfil_id + usuario_id

       Portanto, a mesma pessoa não aumenta novamente
       o contador ao compartilhar o mesmo perfil várias vezes.
    ========================================================= */

    async function registrarCompartilhamento(card) {

        if (!card) {

            return false;
        }


        if (
            !window.InteracoesPerfil ||
            typeof window.InteracoesPerfil
                .registrarCompartilhamento !==
                "function"
        ) {

            console.warn(
                "MusicalWorld Anúncio: componente de interações não possui registrarCompartilhamento()."
            );


            return false;
        }


        try {

            return await window.InteracoesPerfil
                .registrarCompartilhamento(card);

        } catch (erro) {

            console.error(
                "MusicalWorld Anúncio: erro ao registrar compartilhamento.",
                erro
            );


            return false;
        }
    }


    /* =========================================================
       INTEGRAÇÃO COM INTERAÇÕES

       O card já está pronto quando esta função é chamada.

       O componente de interações recebe o próprio card
       e passa a controlar:

       * Curtir
       * Comentar
       * Salvar
       * Contadores
       * Compartilhamentos

       O componente NÃO deve reconstruir o card.
    ========================================================= */

    function inicializarInteracoesCard(card) {

        if (!card) {

            return;
        }


        if (
            !window.InteracoesPerfil ||
            typeof window.InteracoesPerfil
                .inicializarElemento !==
                "function"
        ) {

            return;
        }


        window.InteracoesPerfil
            .inicializarElemento(card)
            .catch(erro => {

                console.error(
                    "MusicalWorld Anúncio: erro ao inicializar interações do card.",
                    erro
                );
            });
    }


    /* =========================================================
       CRIAÇÃO DO CARD DO PROFISSIONAL / ESTABELECIMENTO
    ========================================================= */

    function criarCardProfissional(
        perfil,
        artista,
        destaque
    ) {

        if (!perfil) {

            return null;
        }


        const card =
            document.createElement("article");


        card.className =
            "ad-card-novo";


        /* =====================================================
           IDENTIFICAÇÃO DO TIPO DE PERFIL
        ===================================================== */

        const estabelecimento =
            obterEstabelecimentoPerfil(
                perfil
            );


        const ehEstabelecimento =
            perfilEhEstabelecimento(
                perfil
            );


        /*
         * Quando o perfil é estabelecimento, utilizamos
         * diretamente os dados retornados pela RPC:
         *
         *     perfil.perfis_estabelecimentos
         *
         * Para artista, preservamos exatamente a estrutura
         * que o anúncio já utilizava.
         */

        const dadosPerfil =
            ehEstabelecimento
                ? estabelecimento
                : (
                    artista ||
                    obterArtistaPerfil(perfil)
                );


        /* =====================================================
           IDENTIDADE
        ===================================================== */

        const nome =
            perfil?.nome_exibicao ||
            perfil?.nome ||
            "Profissional";


        const descricao =
            perfil?.descricao ||
            "Perfil profissional do MusicalWorld.";


        /* =====================================================
           LOCALIZAÇÃO
        ===================================================== */

        let localizacao =
            "Localização não informada";


        if (ehEstabelecimento) {

            const cidade =
                String(
                    estabelecimento?.cidade ||
                    ""
                ).trim();


            const estado =
                String(
                    estabelecimento?.estado ||
                    ""
                ).trim();


            if (cidade && estado) {

                localizacao =
                    `${cidade} - ${estado}`;

            } else if (cidade) {

                localizacao =
                    cidade;

            } else if (estado) {

                localizacao =
                    estado;
            }

        } else if (
            typeof dadosPerfil?.localizacao === "string" &&
            dadosPerfil.localizacao.trim()
        ) {

            localizacao =
                dadosPerfil.localizacao.trim();
        }


        /* =====================================================
           TIPO DO PERFIL
        ===================================================== */

        let tipo =
            "Artista";


        if (ehEstabelecimento) {

            tipo =
                obterNomeTipoPerfil(
                    perfil?.tipo_perfil_id
                );

        } else {

            tipo =
                obterNomeTipo(
                    dadosPerfil?.tipo_artista
                );
        }


        /* =====================================================
           ESTILOS MUSICAIS
        ===================================================== */

        const estilosLista =
            ehEstabelecimento

                ? normalizarLista(
                    estabelecimento?.estilos_musicais
                )

                : normalizarLista(
                    dadosPerfil?.estilos
                );


        /*
         * A foto de perfil é utilizada SOMENTE
         * no pequeno avatar da identidade.
         *
         * Para artistas, mantemos exatamente as fontes
         * existentes.
         *
         * Para estabelecimentos, a RPC atual não retorna
         * foto_url no objeto de estabelecimento.
         * Portanto, caso exista uma foto diretamente no
         * perfil, ela ainda poderá ser utilizada.
         */

        const fotoUrl =
            dadosPerfil?.foto_url ||
            perfil?.foto_url ||
            perfil?.avatar_url ||
            perfil?.foto ||
            "";


        const iniciais =
            gerarIniciais(nome);


        /* =====================================================
           AVATAR DA IDENTIDADE
        ===================================================== */

        let avatarHtml = "";


        if (fotoUrl) {

            avatarHtml = `
                <img
                    class="ad-mini-avatar"
                    src="${escaparHtml(fotoUrl)}"
                    alt=""
                    loading="lazy"
                >

                <span
                    class="ad-mini-avatar-fallback"
                    aria-hidden="true"
                    style="display:none;"
                >
                    ${escaparHtml(iniciais)}
                </span>
            `;

        } else {

            avatarHtml = `
                <span
                    class="ad-mini-avatar-fallback ad-mini-avatar-fallback-principal"
                    aria-hidden="true"
                >
                    ${escaparHtml(iniciais)}
                </span>
            `;
        }


        /* =====================================================
           MÍDIA DE DESTAQUE

           IMPORTANTE:

           A mídia abre:

               apresentar-perfil.html?id=<perfilId>

           Ela NÃO abre mais meu-perfil.html.
        ===================================================== */

        let mediaHtml = "";


        const tipoDestaque =
            normalizarTexto(
                destaque?.tipo
            );


        const arquivoUrl =
            destaque?.arquivo_url ||
            destaque?.url ||
            "";


        const thumbnailUrl =
            destaque?.thumbnail_url ||
            destaque?.capa_url ||
            "";


        const destaqueEhVideo =
            tipoDestaque === "video" ||
            tipoDestaque === "vídeo" ||
            tipoDestaque === "mp4" ||
            /\.(mp4|webm|ogg)(\?.*)?$/i.test(
                arquivoUrl
            );


        const destaqueEhImagem =
            !destaqueEhVideo &&
            (
                tipoDestaque === "imagem" ||
                tipoDestaque === "foto" ||
                /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(
                    arquivoUrl
                )
            );


        /* =====================================================
           VÍDEO DE PORTFÓLIO
        ===================================================== */

        if (
            destaqueEhVideo &&
            arquivoUrl
        ) {

            mediaHtml = `
                <div class="ad-video-container">

                    <a
                        href="${escaparHtml(
                            obterPaginaApresentarPerfil()
                        )}?id=${encodeURIComponent(
                            perfil.id || ""
                        )}"
                        class="ad-media-link ad-video-link"
                        aria-label="Ver apresentação de ${escaparHtml(nome)}"
                    >

                        <video
                            class="ad-media-video"
                            muted
                            loop
                            playsinline
                            preload="metadata"
                            ${
                                thumbnailUrl
                                    ? `poster="${escaparHtml(
                                        thumbnailUrl
                                    )}"`
                                    : ""
                            }
                        >

                            <source
                                src="${escaparHtml(
                                    arquivoUrl
                                )}"
                            >

                        </video>

                    </a>


                    <button
                        type="button"
                        class="ad-video-fullscreen"
                        aria-label="Assistir vídeo em tela cheia"
                        title="Tela cheia"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                            <path d="M16 3h3a2 2 0 0 1 2 2v3"/>
                            <path d="M21 16v3a2 2 0 0 1-2 2h-3"/>
                            <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                        </svg>

                    </button>

                </div>
            `;


        /* =====================================================
           IMAGEM DE PORTFÓLIO
        ===================================================== */

        } else if (
            destaqueEhImagem &&
            arquivoUrl
        ) {

            mediaHtml = `
                <a
                    href="${escaparHtml(
                        obterPaginaApresentarPerfil()
                    )}?id=${encodeURIComponent(
                        perfil.id || ""
                    )}"
                    class="ad-media-link"
                    aria-label="Ver apresentação de ${escaparHtml(nome)}"
                >

                    <img
                        class="ad-media-img ad-media-destaque"
                        src="${escaparHtml(
                            arquivoUrl
                        )}"
                        alt=""
                        loading="lazy"
                    >

                </a>
            `;
        }


        /* =====================================================
           IDENTIDADE DO PERFIL

           Foto e nome continuam abrindo:

               meu-perfil.html?id=<perfilId>
        ===================================================== */

        const identidadeClasse =
            mediaHtml.trim()
                ? "ad-identidade-com-midia"
                : "ad-identidade-sem-midia";


        const identidadeHtml = `
            <div
                class="
                    ad-media-identidade
                    ${identidadeClasse}
                "
            >

                <a
                    href="${escaparHtml(
                        obterPaginaPerfil()
                    )}?id=${encodeURIComponent(
                        perfil.id || ""
                    )}"
                    class="ad-media-identidade-link"
                    aria-label="Ver perfil de ${escaparHtml(nome)}"
                >

                    <div class="ad-media-avatar-wrapper">

                        ${avatarHtml}

                    </div>


                    <div class="ad-media-nome-area">

                        <div class="ad-media-nome">
                            ${escaparHtml(nome)}
                        </div>


                        <div class="ad-media-tipo-localizacao">

                            <span class="ad-media-tipo">
                                ${escaparHtml(tipo)}
                            </span>


                            <span
                                class="ad-media-tipo-separador"
                                aria-hidden="true"
                            >
                                ·
                            </span>


                            <span class="ad-media-localizacao-inline">

                                ${obterIconeAnuncio(
                                    "localizacao"
                                )}

                                <span>
                                    ${escaparHtml(
                                        localizacao
                                    )}
                                </span>

                            </span>

                        </div>

                    </div>

                </a>

            </div>
        `;


        /* =====================================================
           MENU DO CARD
        ===================================================== */

        const menuHtml = `
            <button
                type="button"
                class="ad-card-menu"
                aria-label="Mais opções"
                title="Mais opções"
            >
                ${obterIconeAnuncio("menu")}
            </button>
        `;


        /* =====================================================
           ESTILOS MUSICAIS
        ===================================================== */

        let estilosHtml = "";


        if (estilosLista.length) {

            estilosHtml = `
                <div class="ad-card-estilos">

                    <span class="ad-card-estilos-icone">
                        ${obterIconeAnuncio("musica")}
                    </span>


                    <div class="ad-card-estilos-lista">

                        ${estilosLista
                            .slice(0, 6)
                            .map(estilo => `
                                <span class="ad-card-estilo">
                                    ${escaparHtml(estilo)}
                                </span>
                            `)
                            .join("")
                        }

                    </div>

                </div>
            `;
        }


        /* =====================================================
           TIPO DA PUBLICAÇÃO
        ===================================================== */

        const tipoPublicacaoHtml = `
            <div class="ad-card-tipo-publicacao">

                <span class="ad-card-tipo-publicacao-icone">
                    ${obterIconeAnuncio("estrela")}
                </span>


                <span>
                    ${escaparHtml(tipo)}
                </span>

            </div>
        `;


        /* =====================================================
           AÇÕES SOCIAIS

           Os botões possuem contadores próprios.

           O valor inicial é 0.

           O componente interacoes-perfil.js carrega os
           valores reais no banco depois que o card é criado.

           Os pequenos containers:

               data-interacao-avatares="curtidas"
               data-interacao-avatares="comentarios"
               data-interacao-avatares="salvos"

           pertencem EXCLUSIVAMENTE ao Index.

           O módulo:

               js/index/interacoes-avatares.js

           utiliza esses containers para mostrar até
           3 usuários por tipo de interação.

           IMPORTANTE:

           O componente universal de interações continua
           controlando os botões e contadores normalmente.
        ===================================================== */

        const acoesHtml = `
            <div
                class="ad-card-acoes"
                role="group"
                aria-label="Ações da publicação"
            >

                <div class="ad-social-action">

                    <button
                        type="button"
                        class="ad-social-btn"
                        data-acao="comentar"
                        data-interacao="comentar"
                        aria-label="Comentar"
                    >
                        ${obterIconeAnuncio("comentar")}

                        <span class="ad-social-label">
                            Comentar
                        </span>

                        <span
                            class="interacoes-contador"
                            aria-label="Quantidade de comentários"
                        >
                            0
                        </span>
                    </button>


                    <div
                        class="ad-interacao-avatares"
                        data-interacao-avatares="comentarios"
                        hidden
                        aria-hidden="true"
                    ></div>

                </div>


                <div class="ad-social-action">

                    <button
                        type="button"
                        class="ad-social-btn"
                        data-acao="curtir"
                        data-interacao="curtir"
                        aria-label="Curtir"
                        aria-pressed="false"
                    >
                        ${obterIconeAnuncio("curtir")}

                        <span class="ad-social-label">
                            Curtir
                        </span>

                        <span
                            class="interacoes-contador"
                            aria-label="Quantidade de curtidas"
                        >
                            0
                        </span>
                    </button>


                    <div
                        class="ad-interacao-avatares"
                        data-interacao-avatares="curtidas"
                        hidden
                        aria-hidden="true"
                    ></div>

                </div>


                <div class="ad-social-action">

                    <button
                        type="button"
                        class="ad-social-btn"
                        data-acao="compartilhar"
                        aria-label="Compartilhar"
                    >
                        ${obterIconeAnuncio("compartilhar")}

                        <span class="ad-social-label">
                            Compartilhar
                        </span>

                        <span
                            class="interacoes-contador"
                            aria-label="Quantidade de compartilhamentos"
                        >
                            0
                        </span>
                    </button>

                </div>


                <div class="ad-social-action">

                    <button
                        type="button"
                        class="ad-social-btn"
                        data-acao="salvar"
                        data-interacao="salvar"
                        aria-label="Salvar"
                        aria-pressed="false"
                    >
                        ${obterIconeAnuncio("salvar")}

                        <span class="ad-social-label">
                            Salvar
                        </span>

                        <span
                            class="interacoes-contador"
                            aria-label="Quantidade de pessoas que salvaram"
                        >
                            0
                        </span>
                    </button>


                    <div
                        class="ad-interacao-avatares"
                        data-interacao-avatares="salvos"
                        hidden
                        aria-hidden="true"
                    ></div>

                </div>

            </div>
        `;


        /* =====================================================
           ÁREA SUPERIOR DO CARD
        ===================================================== */

        let areaSuperiorHtml = "";


        if (mediaHtml.trim()) {

            areaSuperiorHtml = `

                <div class="ad-media-box">

                    ${mediaHtml}


                    <div
                        class="ad-media-overlay"
                        aria-hidden="true"
                    ></div>


                    ${identidadeHtml}


                    ${menuHtml}

                </div>

            `;

        } else {

            areaSuperiorHtml = `

                <div class="ad-card-identidade-sem-midia">

                    ${identidadeHtml}

                    ${menuHtml}

                </div>
            `;
        }


        /* =====================================================
           CONTEÚDO FINAL
        ===================================================== */

        card.innerHTML = `

            ${areaSuperiorHtml}


            <div class="ad-card-conteudo">

                ${tipoPublicacaoHtml}

                ${estilosHtml}


                <div class="ad-card-publicacao-texto">

                    <p class="ad-card-descricao">
                        ${escaparHtml(descricao)}
                    </p>

                </div>

            </div>


            ${acoesHtml}

        `;


        /* =====================================================
           DADOS INTERNOS
        ===================================================== */

        card.dataset.perfilId =
            perfil.id || "";


        /*
         * Mantemos o atributo antigo para não quebrar
         * nenhuma lógica existente que eventualmente
         * utilize data-tipo-artista.
         *
         * Para estabelecimentos, ele passa a receber
         * a categoria do estabelecimento.
         */

        card.dataset.tipoArtista =
            tipo;


        card.dataset.nomeArtista =
            nome;


        /*
         * Novo atributo específico para identificar
         * o tipo geral do perfil no anúncio.
         */

        card.dataset.tipoPerfil =
            ehEstabelecimento
                ? "estabelecimento"
                : "artista";


        /* =====================================================
           CLIQUE NO CARD

           IMPORTANTE:

           O card inteiro NÃO é mais clicável.

           A navegação acontece somente nos elementos
           que possuem seus próprios links:

           * Foto/nome:
             meu-perfil.html

           * Mídia:
             apresentar-perfil.html

           O restante do card permanece sem navegação.
        ===================================================== */


        /* =====================================================
           ERRO DO AVATAR
        ===================================================== */

        card
            .querySelectorAll(
                ".ad-mini-avatar"
            )
            .forEach(img => {

                img.addEventListener(
                    "error",
                    () => {

                        img.style.display =
                            "none";


                        const fallback =
                            img.nextElementSibling;


                        if (
                            fallback &&
                            fallback.classList.contains(
                                "ad-mini-avatar-fallback"
                            )
                        ) {

                            fallback.style.display =
                                "flex";
                        }

                    },
                    {
                        once: true
                    }
                );
            });


        /* =====================================================
           ERRO DA IMAGEM DE PORTFÓLIO
        ===================================================== */

        card
            .querySelectorAll(
                ".ad-media-img.ad-media-destaque"
            )
            .forEach(img => {

                img.addEventListener(
                    "error",
                    () => {

                        transformarCardSemMidia(
                            card
                        );

                    },
                    {
                        once: true
                    }
                );
            });


        /* =====================================================
           ERRO DO VÍDEO DE PORTFÓLIO
        ===================================================== */

        const video =
            card.querySelector(
                ".ad-media-video"
            );


        if (video) {

            video.addEventListener(
                "error",
                () => {

                    cancelarTimerVideo(
                        video
                    );


                    transformarCardSemMidia(
                        card
                    );

                },
                {
                    once: true
                }
            );
        }


        /* =====================================================
           TELA CHEIA DO VÍDEO
        ===================================================== */

        const fullscreenButton =
            card.querySelector(
                ".ad-video-fullscreen"
            );


        if (
            fullscreenButton &&
            video
        ) {

            fullscreenButton.addEventListener(
                "click",
                async evento => {

                    evento.preventDefault();

                    evento.stopPropagation();


                    try {

                        if (
                            document.fullscreenElement
                        ) {

                            await document.exitFullscreen();

                            return;
                        }


                        if (
                            video.requestFullscreen
                        ) {

                            await video.requestFullscreen();

                            return;
                        }


                        if (
                            video.webkitEnterFullscreen
                        ) {

                            video.webkitEnterFullscreen();

                            return;
                        }

                    } catch (erro) {

                        console.warn(
                            "MusicalWorld Anúncio: não foi possível abrir vídeo em tela cheia.",
                            erro
                        );
                    }

                }
            );
        }


        /* =====================================================
           MENU
        ===================================================== */

        const menuButton =
            card.querySelector(
                ".ad-card-menu"
            );


        if (menuButton) {

            menuButton.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    evento.stopPropagation();


                    menuButton.classList.toggle(
                        "ativo"
                    );
                }
            );
        }


        /* =====================================================
           COMPARTILHAMENTO
        ===================================================== */

        const botaoCompartilhar =
            card.querySelector(
                '[data-acao="compartilhar"]'
            );


        if (botaoCompartilhar) {

            botaoCompartilhar.addEventListener(
                "click",
                async evento => {

                    evento.preventDefault();

                    evento.stopPropagation();


                    const perfilId =
                        card.dataset.perfilId;


                    const nomeArtista =
                        card.dataset.nomeArtista ||
                        "perfil";


                    /*
                     * Primeiro executamos o compartilhamento.
                     *
                     * Somente se ele realmente for concluído
                     * registramos a pessoa no banco.
                     */

                    const compartilhado =
                        await compartilharPerfil(
                            perfilId,
                            nomeArtista
                        );


                    if (!compartilhado) {

                        return;
                    }


                    await registrarCompartilhamento(
                        card
                    );
                }
            );
        }


        /* =====================================================
           INTERAÇÕES DO PERFIL

           IMPORTANTE:

           O card já está completamente montado neste
           ponto.

           Só agora entregamos o card para o componente
           de interações.

           O componente não recria o card.

           Os containers de avatares permanecem
           independentes deste componente.
        ===================================================== */

        inicializarInteracoesCard(
            card
        );


        /* =====================================================
           OBSERVAÇÃO DO VÍDEO
        ===================================================== */

        if (video) {

            if (
                ANUNCIO_VIDEO_CONFIG.observer
            ) {

                observarVideosExistentes();

            } else if (
                ANUNCIO_VIDEO_CONFIG.configurado
            ) {

                atualizarVideosVisiveis();
            }
        }


        return card;
    }


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    window.MusicalWorldAnuncio = {

        criar:
            criarCardProfissional,

        obterArtista:
            obterArtistaPerfil,

        obterEstabelecimento:
            obterEstabelecimentoPerfil,

        obterDestaque:
            obterDestaquePortfolio,

        inicializarVideos:
            inicializarObservadorVideos,

        observarVideos:
            observarVideosExistentes,

        atualizarVideos:
            atualizarVideosVisiveis,

        configurarVisibilidadeVideos:
            configurarVisibilidadePaginaVideos,

        configurarScrollVideos:
            configurarControleScrollVideos,

        compartilharPerfil:
            compartilharPerfil,

        registrarCompartilhamento:
            registrarCompartilhamento
    };


})(window);