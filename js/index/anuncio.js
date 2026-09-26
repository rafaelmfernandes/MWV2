/* =========================================================
   MUSICALWORLD — MÓDULO DE ANÚNCIOS DO FEED

   Arquivo:
   js/index/anuncio.js

   Responsabilidades:

   * Criar e renderizar os anúncios do feed.
   * Montar a identidade do artista ou estabelecimento.
   * Renderizar imagem ou vídeo de destaque.
   * Controlar reprodução automática dos vídeos.
   * Controlar áudio dos vídeos.
   * Controlar play/pause dos vídeos.
   * Controlar vídeo em tela cheia.
   * Controlar menu da publicação.
   * Controlar compartilhamento do perfil.
   * Controlar fallbacks de imagem, avatar e vídeo.
   * Observar os vídeos presentes no feed.
   * Integrar o card ao componente de interações.
   * Controlar expansão da descrição do anúncio.

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

   10. DESCRIÇÃO:
       mostra no máximo 2 linhas inicialmente.
       Quando o usuário clicar na descrição,
       ela será expandida para mostrar todo o conteúdo.

   11. CONTROLES DE VÍDEO:
       vídeos iniciam respeitando a preferência
       global de áudio salva no navegador.

       No canto superior direito aparecem:

           áudio | play/pause | tela cheia

       Os controles funcionam independentemente
       da navegação do anúncio.

   12. ÁUDIO GLOBAL DO FEED:
       a preferência de áudio é compartilhada
       por todos os vídeos do feed.

       Se o usuário mutar um vídeo:

           todos os vídeos ficam mutados.

       Se o usuário desmutar um vídeo:

           todos os vídeos ficam desmutados.

       Vídeos que entrarem posteriormente no feed
       respeitam automaticamente essa preferência.

       A preferência fica salva no localStorage.

       Portanto, ao sair do Feed e voltar posteriormente,
       o estado de áudio continua igual ao escolhido
       anteriormente pelo usuário.

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

        configurado: false,

        /*
         * Preferência global de áudio do feed.
         *
         * false = vídeos desmutados
         * true  = vídeos mutados
         *
         * O valor inicial é atualizado imediatamente
         * pelo localStorage logo abaixo.
         */
        audioMutado: false
    };


    /* =========================================================
       PERSISTÊNCIA DA PREFERÊNCIA DE ÁUDIO
    =========================================================

       A preferência é armazenada no navegador.

       Isso permite que o estado sobreviva:

       * à troca de página;
       * ao retorno ao Feed;
       * à atualização da página;
       * ao fechamento e reabertura do navegador.

       A chave é específica do Feed do MusicalWorld.
    ========================================================= */

    const CHAVE_AUDIO_FEED =
        "musicalworld_feed_audio_mutado";


    function carregarPreferenciaAudio() {

        try {

            const valorSalvo =
                window.localStorage.getItem(
                    CHAVE_AUDIO_FEED
                );


            /*
             * Se ainda não existe uma preferência salva,
             * mantemos o comportamento inicial:
             *
             * áudio habilitado.
             */

            if (valorSalvo === null) {

                return false;
            }


            return valorSalvo === "true";

        } catch (erro) {

            /*
             * Caso o navegador bloqueie o localStorage,
             * o Feed continua funcionando normalmente.
             */

            console.warn(
                "MusicalWorld Anúncio: não foi possível ler a preferência de áudio salva.",
                erro
            );


            return false;
        }
    }


    function salvarPreferenciaAudio(mutado) {

        try {

            window.localStorage.setItem(
                CHAVE_AUDIO_FEED,
                String(Boolean(mutado))
            );

        } catch (erro) {

            /*
             * A falha de armazenamento não deve impedir
             * o funcionamento normal dos vídeos.
             */

            console.warn(
                "MusicalWorld Anúncio: não foi possível salvar a preferência de áudio.",
                erro
            );
        }
    }


    /*
     * Recupera a última preferência salva antes que
     * qualquer vídeo seja criado no Feed.
     *
     * Assim, o primeiro vídeo da página já nasce
     * com o estado correto.
     */

    ANUNCIO_VIDEO_CONFIG.audioMutado =
        carregarPreferenciaAudio();


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
       CONTROLE GLOBAL DE ÁUDIO DOS VÍDEOS

       Todos os vídeos do feed compartilham a mesma
       configuração de áudio.

       Quando o usuário altera o áudio de um vídeo,
       todos os vídeos existentes recebem imediatamente
       a mesma configuração.

       A preferência também fica armazenada em:

           ANUNCIO_VIDEO_CONFIG.audioMutado

       e em:

           localStorage

       Assim, novos vídeos que forem adicionados ao feed
       conseguem iniciar já com a configuração correta.

       Quando o usuário sai da página e retorna ao Feed,
       a preferência salva é recuperada automaticamente.
    ========================================================= */

    function atualizarIconeAudioVideo(video) {

        if (!video) {

            return;
        }


        const card =
            video.closest(".ad-card-novo");


        if (!card) {

            return;
        }


        const audioButton =
            card.querySelector(
                ".ad-video-audio"
            );


        if (!audioButton) {

            return;
        }


        const silenciado =
            video.muted;


        audioButton.setAttribute(
            "aria-label",
            silenciado
                ? "Ativar áudio"
                : "Desativar áudio"
        );


        audioButton.setAttribute(
            "title",
            silenciado
                ? "Ativar áudio"
                : "Desativar áudio"
        );


        audioButton.innerHTML =
            silenciado

                ? `
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M11 5 6 9H3v6h3l5 4V5z"/>
                        <path d="m19 9-4 6"/>
                        <path d="m15 9 4 6"/>
                    </svg>
                `

                : `
                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M11 5 6 9H3v6h3l5 4V5z"/>
                        <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
                        <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
                    </svg>
                `;
    }


    function aplicarAudioGlobal(mutado) {

        ANUNCIO_VIDEO_CONFIG.audioMutado =
            Boolean(mutado);


        /*
         * Salva imediatamente a escolha do usuário.
         *
         * Dessa forma, mesmo que ele saia do Feed logo
         * depois de clicar no botão, a próxima página
         * do Feed recuperará a mesma preferência.
         */

        salvarPreferenciaAudio(
            ANUNCIO_VIDEO_CONFIG.audioMutado
        );


        const videos =
            document.querySelectorAll(
                ".ad-media-video"
            );


        videos.forEach(video => {

            video.muted =
                ANUNCIO_VIDEO_CONFIG.audioMutado;


            video.defaultMuted =
                ANUNCIO_VIDEO_CONFIG.audioMutado;


            atualizarIconeAudioVideo(
                video
            );
        });
    }


    function aplicarAudioGlobalAoVideo(video) {

        if (!video) {

            return;
        }


        video.muted =
            ANUNCIO_VIDEO_CONFIG.audioMutado;


        video.defaultMuted =
            ANUNCIO_VIDEO_CONFIG.audioMutado;


        atualizarIconeAudioVideo(
            video
        );
    }


    /* =========================================================
       CONTROLE DA DESCRIÇÃO

       A descrição começa limitada visualmente a 2 linhas.

       O CSS do anúncio utiliza line-clamp para realizar
       o corte e apresentar os três pontos quando existir
       conteúdo além do limite.

       Ao clicar:

       * descrição limitada -> expandida
       * descrição expandida -> limitada

       A expansão somente acontece quando realmente existe
       conteúdo além das duas linhas.

       A classe:

           ad-card-descricao-expandida

       é responsável por informar ao CSS que a descrição
       deve mostrar todo o conteúdo.
    ========================================================= */

    function configurarExpansaoDescricao(card) {

        if (!card) {

            return;
        }


        const descricao =
            card.querySelector(
                ".ad-card-descricao"
            );


        if (!descricao) {

            return;
        }


        descricao.setAttribute(
            "aria-expanded",
            "false"
        );


        descricao.setAttribute(
            "role",
            "button"
        );


        descricao.setAttribute(
            "tabindex",
            "0"
        );


        const descricaoPossuiMaisConteudo = () => {

            return (
                descricao.scrollHeight >
                descricao.clientHeight + 1
            );
        };


        const alternarDescricao = () => {

            const expandida =
                descricao.classList.contains(
                    "ad-card-descricao-expandida"
                );


            if (
                !expandida &&
                !descricaoPossuiMaisConteudo()
            ) {

                return;
            }


            descricao.classList.toggle(
                "ad-card-descricao-expandida"
            );


            const agoraExpandida =
                descricao.classList.contains(
                    "ad-card-descricao-expandida"
                );


            descricao.setAttribute(
                "aria-expanded",
                agoraExpandida
                    ? "true"
                    : "false"
            );
        };


        descricao.addEventListener(
            "click",
            evento => {

                evento.preventDefault();
                evento.stopPropagation();

                alternarDescricao();
            }
        );


        descricao.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key !== "Enter" &&
                    evento.key !== " "
                ) {

                    return;
                }


                evento.preventDefault();
                evento.stopPropagation();

                alternarDescricao();
            }
        );
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
    ========================================================= */

    function obterPaginaPerfil() {

        return "meu-perfil.html";
    }


    /* =========================================================
       PÁGINA DE APRESENTAÇÃO DO PERFIL
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


        /*
         * Se o usuário pausou manualmente o vídeo,
         * o autoplay não deve reativá-lo imediatamente.
         */

        if (
            video.dataset.videoPausadoManual ===
            "true"
        ) {

            return;
        }


        cancelarTimerVideo(video);


        /*
         * Antes de reproduzir, o vídeo recebe a
         * preferência global atual de áudio.
         *
         * Isso garante que vídeos novos que entram
         * na tela respeitem a última escolha do usuário.
         */

        aplicarAudioGlobalAoVideo(
            video
        );


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


        if (
            video.dataset.videoPausadoManual ===
            "true"
        ) {

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

                if (
                    video.dataset.videoPausadoManual !==
                    "true"
                ) {

                    agendarReproducaoVideo(
                        video
                    );
                }

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


    /* =========================================================
       CONTROLES VISUAIS DO VÍDEO

       Cada vídeo possui três controles:

       1. Áudio
       2. Play / Pause
       3. Tela cheia

       Os controles ficam sobre o vídeo.

       O clique nos controles nunca deve abrir
       o link da apresentação do perfil.
    ========================================================= */

    function configurarControlesVideo(
        card,
        video
    ) {

        if (
            !card ||
            !video
        ) {

            return;
        }


        const audioButton =
            card.querySelector(
                ".ad-video-audio"
            );


        const playButton =
            card.querySelector(
                ".ad-video-play"
            );


        const fullscreenButton =
            card.querySelector(
                ".ad-video-fullscreen"
            );


        /* =====================================================
           ATUALIZA ÍCONE DO ÁUDIO
        ===================================================== */

        function atualizarControleAudio() {

            atualizarIconeAudioVideo(
                video
            );
        }


        /* =====================================================
           ATUALIZA ÍCONE DO PLAY / PAUSE
        ===================================================== */

        function atualizarControlePlay() {

            if (!playButton) {

                return;
            }


            const pausado =
                video.paused;


            playButton.setAttribute(
                "aria-label",
                pausado
                    ? "Reproduzir vídeo"
                    : "Pausar vídeo"
            );


            playButton.setAttribute(
                "title",
                pausado
                    ? "Reproduzir vídeo"
                    : "Pausar vídeo"
            );


            playButton.innerHTML =
                pausado

                    ? `
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            fill="currentColor"
                        >
                            <path d="M8 5v14l11-7L8 5z"/>
                        </svg>
                    `

                    : `
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            fill="currentColor"
                        >
                            <path d="M7 5h3v14H7z"/>
                            <path d="M14 5h3v14h-3z"/>
                        </svg>
                    `;
        }


        /* =====================================================
           CONTROLE DE ÁUDIO

           A alteração de áudio é GLOBAL.

           O estado escolhido neste vídeo é aplicado
           imediatamente a todos os vídeos existentes
           no feed.

           A preferência também é salva no localStorage.
        ===================================================== */

        if (audioButton) {

            audioButton.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();
                    evento.stopPropagation();


                    const novoEstadoMutado =
                        !video.muted;


                    aplicarAudioGlobal(
                        novoEstadoMutado
                    );
                }
            );
        }


        /* =====================================================
           CONTROLE DE PLAY / PAUSE
        ===================================================== */

        if (playButton) {

            playButton.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();
                    evento.stopPropagation();


                    if (video.paused) {

                        /*
                         * O usuário decidiu reproduzir
                         * manualmente.
                         *
                         * Removemos a marca de pausa manual.
                         */

                        video.dataset.videoPausadoManual =
                            "false";


                        /*
                         * O vídeo também recebe a
                         * configuração global de áudio.
                         *
                         * Isso garante que o botão play
                         * nunca desrespeite a preferência
                         * escolhida no feed.
                         */

                        aplicarAudioGlobalAoVideo(
                            video
                        );


                        pausarTodosVideos(
                            video
                        );


                        const promessa =
                            video.play();


                        if (
                            promessa &&
                            typeof promessa.catch ===
                                "function"
                        ) {

                            promessa.catch(erro => {

                                console.warn(
                                    "MusicalWorld Anúncio: não foi possível reproduzir o vídeo.",
                                    erro
                                );
                            });
                        }

                    } else {

                        /*
                         * O usuário pausou manualmente.
                         *
                         * O autoplay não deve iniciar
                         * novamente enquanto o usuário
                         * não tocar em reproduzir.
                         */

                        video.dataset.videoPausadoManual =
                            "true";


                        cancelarTimerVideo(
                            video
                        );


                        video.pause();
                    }


                    atualizarControlePlay();
                }
            );
        }


        /* =====================================================
           EVENTOS NATIVOS DO VÍDEO
        ===================================================== */

        video.addEventListener(
            "play",
            () => {

                atualizarControlePlay();
            }
        );


        video.addEventListener(
            "pause",
            () => {

                atualizarControlePlay();
            }
        );


        video.addEventListener(
            "volumechange",
            () => {

                /*
                 * Se o volume for alterado por alguma
                 * outra ação, o estado visual acompanha
                 * o estado real do vídeo.
                 *
                 * A configuração global continua sendo
                 * controlada pelo botão de áudio.
                 */

                atualizarControleAudio();
            }
        );


        /* =====================================================
           TELA CHEIA
        ===================================================== */

        if (fullscreenButton) {

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


        atualizarControleAudio();

        atualizarControlePlay();
    }


    /* =========================================================
       OBSERVADOR DOS VÍDEOS
    ========================================================= */

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

                            /*
                             * Não reativa um vídeo que o
                             * usuário pausou manualmente.
                             */

                            if (
                                video.dataset.videoPausadoManual !==
                                "true"
                            ) {

                                agendarReproducaoVideo(
                                    video
                                );
                            }

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

                /*
                 * Mesmo que o vídeo já esteja observado,
                 * garantimos que ele continue respeitando
                 * a configuração global de áudio.
                 */

                aplicarAudioGlobalAoVideo(
                    video
                );

                return;
            }


            video.dataset.feedVideoObserved =
                "true";


            if (
                !video.dataset.videoPausadoManual
            ) {

                video.dataset.videoPausadoManual =
                    "false";
            }


            /*
             * Todo vídeo novo recebe imediatamente
             * a preferência global atual de áudio.
             */

            aplicarAudioGlobalAoVideo(
                video
            );


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
       CRIAÇÃO DO CARD
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


        /* =====================================================
           FOTO DO PERFIL
        ===================================================== */

        const fotoUrl =
            dadosPerfil?.foto_url ||
            perfil?.foto_url ||
            perfil?.avatar_url ||
            perfil?.foto ||
            "";


        const iniciais =
            gerarIniciais(nome);


        /* =====================================================
           AVATAR
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
                /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(
                    arquivoUrl
                )
            );


        /* =====================================================
           VÍDEO DE PORTFÓLIO

           O vídeo inicia respeitando a configuração global
           de áudio do feed.

           Os controles são renderizados sobre o vídeo:

           * áudio
           * play/pause
           * tela cheia
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


                    <div
                        class="ad-video-controles"
                        role="group"
                        aria-label="Controles do vídeo"
                    >

                        <button
                            type="button"
                            class="ad-video-control ad-video-audio"
                            aria-label="Desativar áudio"
                            title="Desativar áudio"
                        >
                        </button>


                        <button
                            type="button"
                            class="ad-video-control ad-video-play"
                            aria-label="Pausar vídeo"
                            title="Pausar vídeo"
                        >
                        </button>


                        <button
                            type="button"
                            class="ad-video-control ad-video-fullscreen"
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


        card.dataset.tipoArtista =
            tipo;


        card.dataset.nomeArtista =
            nome;


        card.dataset.tipoPerfil =
            ehEstabelecimento
                ? "estabelecimento"
                : "artista";


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
           CONTROLES DO VÍDEO
        ===================================================== */

        if (video) {

            /*
             * O vídeo recebe a preferência global atual
             * do feed.
             *
             * Essa preferência já foi recuperada do
             * localStorage quando este módulo foi carregado.
             *
             * Portanto:
             *
             * primeira utilização:
             *     áudio habilitado
             *
             * usuário mutou anteriormente:
             *     vídeo começa mutado
             *
             * usuário desmutou anteriormente:
             *     vídeo começa desmutado
             */

            aplicarAudioGlobalAoVideo(
                video
            );


            configurarControlesVideo(
                card,
                video
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
        ===================================================== */

        inicializarInteracoesCard(
            card
        );


        /* =====================================================
           EXPANSÃO DA DESCRIÇÃO
        ===================================================== */

        configurarExpansaoDescricao(
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