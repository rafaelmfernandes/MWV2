
/* =========================================================
   MUSICALWORLD — MÓDULO DE ANÚNCIOS DO FEED

   Arquivo:
   js/anuncio.js

   Responsabilidades:
   - Criar e renderizar os anúncios do feed.
   - Montar a identidade do artista.
   - Renderizar imagem ou vídeo de destaque.
   - Controlar reprodução automática dos vídeos.
   - Controlar vídeo em tela cheia.
   - Controlar menu da publicação.
   - Controlar ações sociais da publicação.
   - Controlar fallbacks de imagem, avatar e vídeo.
   - Observar os vídeos presentes no feed.

   REGRA PRINCIPAL DA MÍDIA:

   1. Vídeo de portfólio:
      mostra o vídeo.

   2. Imagem de portfólio:
      mostra a imagem.

   3. Sem mídia de portfólio, mas com foto de perfil:
      mostra a foto de perfil.

   4. Sem qualquer foto:
      NÃO cria uma área grande de mídia.
      Mostra somente o avatar padrão com iniciais
      junto da identidade do artista.

   5. Sem localização:
      mostra "Localização não informada".

   6. IDENTIDADE COM MÍDIA:
      texto branco sobre a mídia.

   7. IDENTIDADE SEM MÍDIA:
      texto escuro em fluxo normal.

   IMPORTANTE:
   O avatar padrão pertence à identidade do artista.
   Ele NÃO é considerado uma mídia de destaque.
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
       DADOS DO ARTISTA
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

                return item.destaque_catalogo === true;
            });

        if (destaque) {
            return destaque;
        }

        const ordenados =
            [...ativos].sort((a, b) => {

                const ordemA =
                    Number(a?.ordem ?? 999999);

                const ordemB =
                    Number(b?.ordem ?? 999999);

                return ordemA - ordemB;
            });

        return ordenados[0] || null;
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


    function obterPaginaPerfil() {

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
       CRIAÇÃO DO CARD DO PROFISSIONAL
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
           IDENTIDADE
        ===================================================== */

        const nome =
            perfil?.nome_exibicao ||
            perfil?.nome ||
            "Profissional";


        const descricao =
            perfil?.descricao ||
            "Perfil profissional do MusicalWorld.";


        const localizacao =
            artista?.localizacao?.trim?.() ||
            "Localização não informada";


        const tipo =
            obterNomeTipo(
                artista?.tipo_artista
            );


        const estilosLista =
            normalizarLista(
                artista?.estilos
            );


        const fotoUrl =
            artista?.foto_url ||
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
                !!arquivoUrl
            );


        /* =====================================================
           VÍDEO
        ===================================================== */

        if (
            destaqueEhVideo &&
            arquivoUrl
        ) {

            mediaHtml = `
                <div class="ad-video-container">

                    <a
                        href="${escaparHtml(
                            obterPaginaPerfil()
                        )}?id=${encodeURIComponent(
                            perfil.id || ""
                        )}"
                        class="ad-media-link ad-video-link"
                        aria-label="Ver perfil de ${escaparHtml(nome)}"
                    >

                        <video
                            class="ad-media-video"
                            muted
                            loop
                            playsinline
                            preload="metadata"
                            ${thumbnailUrl
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
                        obterPaginaPerfil()
                    )}?id=${encodeURIComponent(
                        perfil.id || ""
                    )}"
                    class="ad-media-link"
                    aria-label="Ver perfil de ${escaparHtml(nome)}"
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


        /* =====================================================
           FOTO DE PERFIL COMO FALLBACK
        ===================================================== */

        } else if (fotoUrl) {

            mediaHtml = `
                <a
                    href="${escaparHtml(
                        obterPaginaPerfil()
                    )}?id=${encodeURIComponent(
                        perfil.id || ""
                    )}"
                    class="ad-media-link"
                    aria-label="Ver perfil de ${escaparHtml(nome)}"
                >

                    <img
                        class="ad-media-img ad-media-foto-perfil"
                        src="${escaparHtml(
                            fotoUrl
                        )}"
                        alt=""
                        loading="lazy"
                    >

                </a>
            `;
        }


        /* =====================================================
           IDENTIDADE DO ARTISTA

           A classe visual depende da existência de mídia.

           COM MÍDIA:
           -> identidade sobre a mídia;
           -> texto branco.

           SEM MÍDIA:
           -> identidade em fluxo normal;
           -> texto escuro.
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
           AÇÕES
        ===================================================== */

        const acoesHtml = `
            <div
                class="ad-card-acoes"
                role="group"
                aria-label="Ações da publicação"
            >

                <button
                    type="button"
                    class="ad-social-btn"
                    data-acao="comentar"
                    aria-label="Comentar"
                >
                    ${obterIconeAnuncio("comentar")}

                    <span class="ad-social-label">
                        Comentar
                    </span>
                </button>


                <button
                    type="button"
                    class="ad-social-btn"
                    data-acao="curtir"
                    aria-label="Curtir"
                >
                    ${obterIconeAnuncio("curtir")}

                    <span class="ad-social-label">
                        Curtir
                    </span>
                </button>


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
                </button>


                <button
                    type="button"
                    class="ad-social-btn"
                    data-acao="salvar"
                    aria-label="Salvar"
                >
                    ${obterIconeAnuncio("salvar")}

                    <span class="ad-social-label">
                        Salvar
                    </span>
                </button>

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

        card.dataset.tipoArtista =
            tipo;

        card.dataset.nomeArtista =
            nome;


        /* =====================================================
           CLIQUE NO CARD
        ===================================================== */

        card.addEventListener(
            "click",
            evento => {

                const elementoInterativo =
                    evento.target.closest(
                        "button, a, input, textarea, select"
                    );

                if (elementoInterativo) {
                    return;
                }

                const perfilId =
                    card.dataset.perfilId;

                if (!perfilId) {
                    return;
                }

                window.location.href =
                    `${obterPaginaPerfil()}?id=${encodeURIComponent(
                        perfilId
                    )}`;
            }
        );


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
           ERRO DA IMAGEM DE MÍDIA
        ===================================================== */

        card
            .querySelectorAll(
                ".ad-media-img"
            )
            .forEach(img => {

                img.addEventListener(
                    "error",
                    () => {

                        const mediaBox =
                            card.querySelector(
                                ".ad-media-box"
                            );

                        if (!mediaBox) {
                            return;
                        }


                        const eraDestaque =
                            img.classList.contains(
                                "ad-media-destaque"
                            );


                        if (
                            eraDestaque &&
                            fotoUrl
                        ) {

                            img.src =
                                fotoUrl;

                            img.classList.remove(
                                "ad-media-destaque"
                            );

                            img.classList.add(
                                "ad-media-foto-perfil"
                            );

                            return;
                        }


                        /*
                         * Se não houver mais nenhuma imagem
                         * disponível, removemos a mídia.
                         *
                         * A identidade precisa deixar de ser
                         * "sobre mídia" e passar para o estado
                         * normal.
                         */

                        mediaBox.remove();

                        const identidadeSemMidia =
                            card.querySelector(
                                ".ad-media-identidade"
                            );

                        const containerSemMidia =
                            document.createElement(
                                "div"
                            );

                        containerSemMidia.className =
                            "ad-card-identidade-sem-midia";


                        if (identidadeSemMidia) {

                            identidadeSemMidia.classList.remove(
                                "ad-identidade-com-midia"
                            );

                            identidadeSemMidia.classList.add(
                                "ad-identidade-sem-midia"
                            );

                            identidadeSemMidia.style.position =
                                "static";

                            containerSemMidia.appendChild(
                                identidadeSemMidia
                            );

                            const menu =
                                card.querySelector(
                                    ".ad-card-menu"
                                );

                            if (menu) {

                                containerSemMidia.appendChild(
                                    menu
                                );
                            }

                            card
                                .querySelector(
                                    ".ad-card-novo"
                                );

                            card
                                .insertBefore(
                                    containerSemMidia,
                                    card.firstElementChild
                                );
                        }

                    },
                    {
                        once: true
                    }
                );
            });


        /* =====================================================
           ERRO DO VÍDEO
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


                    const container =
                        card.querySelector(
                            ".ad-video-container"
                        );


                    const mediaBox =
                        card.querySelector(
                            ".ad-media-box"
                        );


                    if (!container || !mediaBox) {
                        return;
                    }


                    if (fotoUrl) {

                        container.outerHTML = `

                            <a
                                href="${escaparHtml(
                                    obterPaginaPerfil()
                                )}?id=${encodeURIComponent(
                                    perfil.id || ""
                                )}"
                                class="ad-media-link"
                                aria-label="Ver perfil de ${escaparHtml(
                                    nome
                                )}"
                            >

                                <img
                                    class="ad-media-img ad-media-foto-perfil"
                                    src="${escaparHtml(
                                        fotoUrl
                                    )}"
                                    alt=""
                                    loading="lazy"
                                >

                            </a>

                        `;


                        const novaImagem =
                            mediaBox.querySelector(
                                ".ad-media-foto-perfil"
                            );


                        if (novaImagem) {

                            novaImagem.addEventListener(
                                "error",
                                () => {

                                    mediaBox.remove();

                                },
                                {
                                    once: true
                                }
                            );
                        }


                    } else {

                        /*
                         * Sem foto de perfil:
                         * remove somente a mídia.
                         */

                        mediaBox.remove();

                        const identidade =
                            card.querySelector(
                                ".ad-media-identidade"
                            );

                        if (identidade) {

                            identidade.classList.remove(
                                "ad-identidade-com-midia"
                            );

                            identidade.classList.add(
                                "ad-identidade-sem-midia"
                            );
                        }

                        const wrapper =
                            document.createElement(
                                "div"
                            );

                        wrapper.className =
                            "ad-card-identidade-sem-midia";


                        const identidadeExistente =
                            card.querySelector(
                                ".ad-media-identidade"
                            );

                        const menu =
                            card.querySelector(
                                ".ad-card-menu"
                            );


                        if (identidadeExistente) {

                            identidadeExistente
                                .parentNode
                                ?.removeChild(
                                    identidadeExistente
                                );

                            wrapper.appendChild(
                                identidadeExistente
                            );
                        }


                        if (menu) {

                            menu.parentNode
                                ?.removeChild(menu);

                            wrapper.appendChild(
                                menu
                            );
                        }


                        card.insertBefore(
                            wrapper,
                            card.firstElementChild
                        );
                    }

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
           AÇÕES SOCIAIS
        ===================================================== */

        card
            .querySelectorAll(
                ".ad-social-btn"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    evento => {

                        evento.preventDefault();

                        evento.stopPropagation();


                        const acao =
                            botao.dataset.acao;


                        if (!acao) {
                            return;
                        }


                        if (
                            acao === "curtir" ||
                            acao === "salvar"
                        ) {

                            botao.classList.toggle(
                                "ativo"
                            );
                        }

                    }
                );

            });


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
            configurarControleScrollVideos
    };


})(window);

