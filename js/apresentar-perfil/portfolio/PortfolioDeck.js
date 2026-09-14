(function (window) {

    "use strict";

    /*
     * =========================================================
     * MUSICALWORLD — DECK DO PORTFÓLIO
     *
     * Arquivo:
     * PortfolioDeck.js
     *
     * Responsabilidade:
     *
     * - Controlar o deck empilhado.
     * - Posicionar os cards.
     * - Controlar altura do deck.
     * - Controlar swipe/arraste.
     * - Controlar navegação.
     * - Controlar vídeos.
     * - Controlar IntersectionObserver.
     * - Controlar resize.
     * - Desmontar corretamente os eventos.
     *
     * =========================================================
     */


    const modulo =
        window.MusicalWorldPortfolio;

    const utils =
        window.MusicalWorldPortfolioUtils;


    if (!modulo || !utils) {

        console.error(
            "PortfolioDeck.js: módulos obrigatórios não encontrados."
        );

        return;

    }


    const CONFIG =
        modulo.CONFIG;

    const estado =
        modulo.estado;


    /* =========================================================
       01. ACESSO AO DECK
       ========================================================= */

    function obterDeck() {

        const container =

            utils.obterElemento(
                CONFIG.elementos.portfolioGrid
            );


        if (!container) {

            return null;

        }


        return container.querySelector(
            ".portfolio-deck"
        );

    }


    function obterCardsDeck() {

        const deck =
            obterDeck();


        if (!deck) {

            return [];

        }


        return Array.from(

            deck.querySelectorAll(
                ".portfolio-deck-card"
            )

        );

    }


    function obterCardPorIndice(indice) {

        const deck =
            obterDeck();


        if (!deck) {

            return null;

        }


        return deck.querySelector(

            `.portfolio-deck-card[data-indice="${indice}"]`

        );

    }


    function normalizarIndice(indice) {

        const total =
            estado.galeria.itens.length;


        if (!total) {

            return 0;

        }


        let resultado =
            Number(indice);


        if (
            !Number.isFinite(
                resultado
            )
        ) {

            resultado = 0;

        }


        resultado =
            Math.round(
                resultado
            );


        resultado =

            (

                (

                    resultado %
                    total

                ) +

                total

            ) %

            total;


        return resultado;

    }


    function obterDiferencaCircular(
        indice,
        atual,
        total
    ) {

        if (total <= 1) {

            return 0;

        }


        let diferenca =
            indice - atual;


        if (
            diferenca >
            total / 2
        ) {

            diferenca -=
                total;

        }


        if (
            diferenca <
            -(total / 2)
        ) {

            diferenca +=
                total;

        }


        return diferenca;

    }


    /* =========================================================
       02. POSICIONAMENTO
       ========================================================= */

    function aplicarPosicoesDeck(
        deslocamento = 0,
        animar = true
    ) {

        const cards =
            obterCardsDeck();


        const total =
            cards.length;


        if (!total) {

            return;

        }


        const dx =
            Number(deslocamento) || 0;


        const progresso =

            Math.min(

                Math.abs(dx) / 140,

                1

            );


        cards.forEach(

            function (card) {

                const indice =

                    Number(
                        card.dataset.indice
                    );


                const diferenca =

                    obterDiferencaCircular(

                        indice,

                        estado.galeria.indiceAtual,

                        total

                    );


                if (animar) {

                    card.style.transition = `

                        transform ${CONFIG.deck.duracao}ms ease,

                        opacity ${CONFIG.deck.duracao}ms ease,

                        filter ${CONFIG.deck.duracao}ms ease

                    `;

                } else {

                    card.style.transition =
                        "none";

                }


                card.style.pointerEvents =
                    "none";

                card.style.opacity =
                    "0";

                card.style.zIndex =
                    "5";


                let x = 0;

                let y = 0;

                let escala =
                    CONFIG.deck.escalaDistante;

                let rotacao = 0;


                /*
                 * CARD ATIVO
                 */
                if (
                    diferenca === 0
                ) {

                    x = dx;

                    y = 0;

                    escala = 1;


                    card.style.filter =
                        "blur(0px)";


                    rotacao =

                        Math.max(

                            -CONFIG.deck.rotacaoMaxima,

                            Math.min(

                                CONFIG.deck.rotacaoMaxima,

                                dx / 35

                            )

                        );


                    card.style.opacity =
                        "1";


                    card.style.zIndex =
                        "40";


                    card.style.pointerEvents =

                        estado.galeria.arrastando

                            ? "none"

                            : "auto";

                }


                /*
                 * PRÓXIMO CARD
                 */
                else if (
                    diferenca === 1
                ) {

                    const deslocamentoBase =
                        CONFIG.deck.deslocamentoProximo;

                    const yBase =
                        CONFIG.deck.deslocamentoVertical;

                    const escalaBase =
                        CONFIG.deck.escalaProximo;


                    if (
                        estado.galeria.arrastando &&
                        dx < 0
                    ) {

                        const fator =
                            progresso;


                        x =
                            deslocamentoBase *
                            (1 - fator);


                        y =
                            yBase *
                            (1 - fator);


                        escala =
                            escalaBase +
                            (
                                (1 - escalaBase) *
                                fator
                            );


                        const blurInicial =

                            parseFloat(
                                CONFIG.deck.blurProximo
                            ) || 0;


                        const blur =

                            blurInicial *
                            (1 - fator);


                        card.style.filter =
                            `blur(${blur}px)`;

                    } else {

                        x =
                            deslocamentoBase;

                        y =
                            yBase;

                        escala =
                            escalaBase;


                        card.style.filter =

                            `blur(${CONFIG.deck.blurProximo})`;

                    }


                    card.style.opacity =
                        "1";

                    card.style.zIndex =
                        "20";

                }


                /*
                 * CARD ANTERIOR
                 */
                else if (
                    diferenca === -1
                ) {

                    const deslocamentoBase =

                        -CONFIG.deck.deslocamentoProximo;

                    const yBase =
                        CONFIG.deck.deslocamentoVertical;

                    const escalaBase =
                        CONFIG.deck.escalaProximo;


                    if (
                        estado.galeria.arrastando &&
                        dx > 0
                    ) {

                        const fator =
                            progresso;


                        x =
                            deslocamentoBase *
                            (1 - fator);


                        y =
                            yBase *
                            (1 - fator);


                        escala =
                            escalaBase +
                            (
                                (1 - escalaBase) *
                                fator
                            );


                        const blurInicial =

                            parseFloat(
                                CONFIG.deck.blurProximo
                            ) || 0;


                        const blur =

                            blurInicial *
                            (1 - fator);


                        card.style.filter =
                            `blur(${blur}px)`;

                    } else {

                        x =
                            deslocamentoBase;

                        y =
                            yBase;

                        escala =
                            escalaBase;


                        card.style.filter =

                            `blur(${CONFIG.deck.blurProximo})`;

                    }


                    card.style.opacity =
                        "1";

                    card.style.zIndex =
                        "19";

                }


                /*
                 * CARDS DISTANTES
                 */
                else {

                    x = 0;

                    y = 14;

                    escala =
                        CONFIG.deck.escalaDistante;


                    card.style.opacity =
                        "0";


                    card.style.zIndex =
                        "5";


                    card.style.pointerEvents =
                        "none";


                    card.style.filter =

                        `blur(${CONFIG.deck.blurDistante})`;

                }


                card.style.transform =

                    `translate3d(calc(-50% + ${x}px), ${y}px, 0) ` +

                    `rotate(${rotacao}deg) ` +

                    `scale(${escala})`;

            }

        );


        const renderModule =
            window.MusicalWorldPortfolioRender;


        if (renderModule) {

            renderModule.atualizarIndicadoresGaleria();

        }


        atualizarVideoAtivo();

        ajustarAlturaDeck();

        if (
        utils &&
        typeof utils.atualizarFundoDinamico === "function"
        ) {

            utils.atualizarFundoDinamico();

        }

    }


    /* =========================================================
       03. ALTURA DO DECK
       ========================================================= */

    function ajustarAlturaDeck() {

        const deck =
            obterDeck();


        if (!deck) {

            return;

        }


        const cards =
            obterCardsDeck();


        if (!cards.length) {

            return;

        }


        let maiorAltura = 0;


        cards.forEach(

            function (card) {

                const altura =

                    card.offsetHeight ||

                    card.scrollHeight ||

                    0;


                if (
                    altura >
                    maiorAltura
                ) {

                    maiorAltura =
                        altura;

                }

            }

        );


        if (
            maiorAltura > 0
        ) {

            /*
             * O card é position:absolute.
             *
             * Portanto ele não participa naturalmente
             * da altura do pai.
             *
             * Reservamos espaço adicional para:
             * - deslocamento visual;
             * - indicadores;
             * - navegação;
             * - transição do deck.
             */
            deck.style.height =
                `${maiorAltura + 36}px`;

        }


        const imagens =

            deck.querySelectorAll(
                "img"
            );


        imagens.forEach(

            function (imagem) {

                if (
                    !imagem.complete
                ) {

                    imagem.addEventListener(

                        "load",

                        ajustarAlturaDeck,

                        {
                            once: true
                        }

                    );

                }

            }

        );


        const videos =

            deck.querySelectorAll(
                "video"
            );


        videos.forEach(

            function (video) {

                if (
                    video.readyState >= 1
                ) {

                    return;

                }


                video.addEventListener(

                    "loadedmetadata",

                    ajustarAlturaDeck,

                    {
                        once: true
                    }

                );

            }

        );

    }


    /* =========================================================
       04. CONFIGURAÇÃO DO DECK
       ========================================================= */

    function configurarDeck() {

        const deck =
            obterDeck();


        if (!deck) {

            return;

        }


        aplicarPosicoesDeck(
            0,
            false
        );


        configurarEventosDeck();

        ajustarAlturaDeck();

    }


    function configurarEstiloCard(card) {

        if (!card) {

            return;

        }


        card.style.transition =

            `transform ${CONFIG.deck.duracao}ms cubic-bezier(.22,.61,.36,1), ` +

            `opacity ${CONFIG.deck.duracao}ms ease, ` +

            `filter ${CONFIG.deck.duracao}ms ease`;

    }


    /* =========================================================
       05. EVENTOS
       ========================================================= */

    function configurarEventosDeck() {

        const deck =
            obterDeck();


        if (!deck) {

            return;

        }


        removerEventosDeck();


        deck.addEventListener(
            "pointerdown",
            iniciarArrasteDeck
        );


        deck.addEventListener(
            "pointermove",
            moverArrasteDeck
        );


        deck.addEventListener(
            "pointerup",
            finalizarArrasteDeck
        );


        deck.addEventListener(
            "pointercancel",
            cancelarArrasteDeck
        );


        deck.addEventListener(
            "click",
            controlarCliqueDepoisSwipe
        );


        window.addEventListener(
            "resize",
            ajustarDeckNoResize
        );


        estado.eventosDeckRegistrados =
            true;

    }


    function removerEventosDeck() {

        const deck =
            obterDeck();


        if (
            !deck &&
            !estado.eventosDeckRegistrados
        ) {

            return;

        }


        if (deck) {

            deck.removeEventListener(
                "pointerdown",
                iniciarArrasteDeck
            );


            deck.removeEventListener(
                "pointermove",
                moverArrasteDeck
            );


            deck.removeEventListener(
                "pointerup",
                finalizarArrasteDeck
            );


            deck.removeEventListener(
                "pointercancel",
                cancelarArrasteDeck
            );


            deck.removeEventListener(
                "click",
                controlarCliqueDepoisSwipe
            );

        }


        window.removeEventListener(
            "resize",
            ajustarDeckNoResize
        );


        estado.eventosDeckRegistrados =
            false;

    }


    /* =========================================================
       06. SWIPE — INÍCIO
       ========================================================= */

    function iniciarArrasteDeck(evento) {

        if (
            estado.galeria.bloqueado ||
            estado.galeria.animando ||
            estado.galeria.itens.length <= 1
        ) {

            return;

        }


        if (
            evento.pointerType === "mouse" &&
            evento.button !== 0
        ) {

            return;

        }


        estado.galeria.arrastando =
            true;


        estado.galeria.gestoHorizontal =
            false;


        estado.galeria.inicioX =
            evento.clientX;


        estado.galeria.inicioY =
            evento.clientY;


        estado.galeria.deslocamentoX =
            0;


        estado.galeria.ponteiroId =
            evento.pointerId;


        estado.ignorarProximoClique =
            false;


        estado.videosPausadosPorSwipe =
            true;


        pausarTodosVideos();


        const deck =
            obterDeck();


        if (deck) {

            deck.style.cursor =
                "grab";

        }

    }


    /* =========================================================
       07. SWIPE — MOVIMENTO
       ========================================================= */

    function moverArrasteDeck(evento) {

        if (
            !estado.galeria.arrastando ||
            estado.galeria.ponteiroId !==
            evento.pointerId
        ) {

            return;

        }


        const deslocamentoX =

            evento.clientX -
            estado.galeria.inicioX;


        const deslocamentoY =

            evento.clientY -
            estado.galeria.inicioY;


        if (
            !estado.galeria.gestoHorizontal
        ) {

            if (
                Math.abs(deslocamentoX) < 8 &&
                Math.abs(deslocamentoY) < 8
            ) {

                return;

            }


            if (
                Math.abs(deslocamentoY) >
                Math.abs(deslocamentoX)
            ) {

                estado.galeria.arrastando =
                    false;

                estado.galeria.gestoHorizontal =
                    false;

                estado.galeria.ponteiroId =
                    null;

                estado.videosPausadosPorSwipe =
                    false;


                atualizarVideoAtivo();

                return;

            }


            estado.galeria.gestoHorizontal =
                true;


            const deck =
                obterDeck();


            if (
                deck &&
                deck.setPointerCapture
            ) {

                try {

                    deck.setPointerCapture(
                        evento.pointerId
                    );

                } catch (erro) {

                    console.warn(
                        "PortfolioDeck: não foi possível capturar o ponteiro.",
                        erro
                    );

                }

            }

        }


        if (
            !estado.galeria.gestoHorizontal
        ) {

            return;

        }


        evento.preventDefault();


        estado.galeria.deslocamentoX =
            deslocamentoX;


        aplicarPosicoesDeck(
            deslocamentoX,
            false
        );


        const deck =
            obterDeck();


        if (deck) {

            deck.style.cursor =
                "grabbing";

        }

    }


    /* =========================================================
       08. SWIPE — FINALIZAÇÃO
       ========================================================= */

    function finalizarArrasteDeck(evento) {

        if (
            !estado.galeria.arrastando ||
            estado.galeria.ponteiroId !==
            evento.pointerId
        ) {

            return;

        }


        const deslocamento =
            estado.galeria.deslocamentoX;


        const deck =
            obterDeck();


        liberarCapturaPonteiro(
            deck,
            evento.pointerId
        );


        estado.galeria.arrastando =
            false;


        estado.galeria.ponteiroId =
            null;


        if (
            !estado.galeria.gestoHorizontal
        ) {

            estado.galeria.deslocamentoX =
                0;

            estado.galeria.gestoHorizontal =
                false;

            estado.videosPausadosPorSwipe =
                false;


            aplicarPosicoesDeck(
                0,
                true
            );


            atualizarVideoAtivo();

            return;

        }


        estado.galeria.gestoHorizontal =
            false;


        const largura =

            deck
                ? deck.clientWidth
                : window.innerWidth;


        const limitePorPorcentagem =

            largura *
            CONFIG.deck.limiteSwipe;


        const limite =

            Math.max(
                CONFIG.deck.limitePixels,
                limitePorPorcentagem
            );


        estado.ignorarProximoClique =

            Math.abs(deslocamento) >=
            limite;


        if (
            Math.abs(deslocamento) >=
            limite
        ) {

            if (
                deslocamento < 0
            ) {

                avancarGaleria();

            } else {

                voltarGaleria();

            }

        } else {

            restaurarCardAtual();

        }


        estado.galeria.deslocamentoX =
            0;


        estado.videosPausadosPorSwipe =
            false;


        setTimeout(

            function () {

                atualizarVideoAtivo();

            },

            CONFIG.deck.duracao + 40

        );

    }


    /* =========================================================
       09. SWIPE — CANCELAMENTO
       ========================================================= */

    function cancelarArrasteDeck(evento) {

        if (
            !estado.galeria.arrastando
        ) {

            return;

        }


        const deck =
            obterDeck();


        liberarCapturaPonteiro(

            deck,

            evento
                ? evento.pointerId
                : estado.galeria.ponteiroId

        );


        estado.galeria.arrastando =
            false;


        estado.galeria.gestoHorizontal =
            false;


        estado.galeria.ponteiroId =
            null;


        estado.galeria.deslocamentoX =
            0;


        estado.videosPausadosPorSwipe =
            false;


        restaurarCardAtual();


        setTimeout(

            function () {

                atualizarVideoAtivo();

            },

            CONFIG.deck.duracao + 40

        );

    }


    function liberarCapturaPonteiro(
        deck,
        ponteiroId
    ) {

        if (
            !deck ||
            ponteiroId === null ||
            ponteiroId === undefined
        ) {

            return;

        }


        if (
            typeof deck.hasPointerCapture ===
            "function" &&
            deck.hasPointerCapture(
                ponteiroId
            )
        ) {

            try {

                deck.releasePointerCapture(
                    ponteiroId
                );

            } catch (erro) {

                console.warn(
                    "PortfolioDeck: erro ao liberar captura do ponteiro.",
                    erro
                );

            }

        }

    }


    /* =========================================================
       10. NAVEGAÇÃO
       ========================================================= */

    function avancarGaleria() {

        if (
            estado.galeria.animando ||
            estado.galeria.itens.length <= 1
        ) {

            return;

        }


        pausarTodosVideos();


        estado.galeria.animando =
            true;


        const novoIndice =

            normalizarIndice(

                estado.galeria.indiceAtual + 1

            );


        estado.galeria.indiceAtual =
            novoIndice;


        utils.atualizarFundoDinamico();


        aplicarPosicoesDeck(
            0,
            true
        );


        const renderModule =
            window.MusicalWorldPortfolioRender;


        if (renderModule) {

            renderModule.atualizarIndicadoresGaleria();

        }


        setTimeout(

            function () {

                estado.galeria.animando =
                    false;


                aplicarPosicoesDeck(
                    0,
                    false
                );


                if (renderModule) {

                    renderModule.atualizarIndicadoresGaleria();

                }


                atualizarVideoAtivo();

            },

            CONFIG.deck.duracao + 30

        );

    }


    function voltarGaleria() {

        if (
            estado.galeria.animando ||
            estado.galeria.itens.length <= 1
        ) {

            return;

        }


        pausarTodosVideos();


        estado.galeria.animando =
            true;


        const novoIndice =

            normalizarIndice(

                estado.galeria.indiceAtual - 1

            );


        estado.galeria.indiceAtual =
            novoIndice;


        utils.atualizarFundoDinamico();


        aplicarPosicoesDeck(
            0,
            true
        );


        const renderModule =
            window.MusicalWorldPortfolioRender;


        if (renderModule) {

            renderModule.atualizarIndicadoresGaleria();

        }


        setTimeout(

            function () {

                estado.galeria.animando =
                    false;


                aplicarPosicoesDeck(
                    0,
                    false
                );


                if (renderModule) {

                    renderModule.atualizarIndicadoresGaleria();

                }


                atualizarVideoAtivo();

            },

            CONFIG.deck.duracao + 30

        );

    }


    function restaurarCardAtual() {

        if (
            estado.galeria.animando
        ) {

            return;

        }


        pausarTodosVideos();


        aplicarPosicoesDeck(
            0,
            true
        );


        setTimeout(

            function () {

                aplicarPosicoesDeck(
                    0,
                    false
                );


                atualizarVideoAtivo();

            },

            CONFIG.deck.duracao + 30

        );

    }


    function controlarCliqueDepoisSwipe(
        evento
    ) {

        if (
            estado.ignorarProximoClique
        ) {

            evento.preventDefault();

            evento.stopPropagation();


            estado.ignorarProximoClique =
                false;

        }

    }


    function irParaItem(indice) {

        if (
            !estado.galeria.itens.length
        ) {

            return;

        }


        if (
            estado.galeria.animando
        ) {

            return;

        }


        pausarTodosVideos();


        const novoIndice =

            normalizarIndice(
                indice
            );


        if (
            novoIndice ===
            estado.galeria.indiceAtual
        ) {

            const renderModule =
                window.MusicalWorldPortfolioRender;


            if (renderModule) {

                renderModule.atualizarIndicadoresGaleria();

            }


            atualizarVideoAtivo();

            utils.atualizarFundoDinamico();

            return;

        }


        estado.galeria.animando =
            true;


        estado.galeria.indiceAtual =
            novoIndice;


        utils.atualizarFundoDinamico();


        aplicarPosicoesDeck(
            0,
            true
        );


        const renderModule =
            window.MusicalWorldPortfolioRender;


        if (renderModule) {

            renderModule.atualizarIndicadoresGaleria();

        }


        setTimeout(

            function () {

                estado.galeria.animando =
                    false;


                aplicarPosicoesDeck(
                    0,
                    false
                );


                if (renderModule) {

                    renderModule.atualizarIndicadoresGaleria();

                }


                atualizarVideoAtivo();

            },

            CONFIG.deck.duracao + 30

        );

    }


    /* =========================================================
       11. VÍDEOS
       ========================================================= */

    function obterVideosDeck() {

        const deck =
            obterDeck();


        if (!deck) {

            return [];

        }


        return Array.from(

            deck.querySelectorAll(
                "video.portfolio-deck-media"
            )

        );

    }


    function pausarTodosVideos() {

        const videos =
            obterVideosDeck();


        videos.forEach(

            function (video) {

                try {

                    if (!video.paused) {

                        video.pause();

                    }

                } catch (erro) {

                    console.warn(
                        "PortfolioDeck: não foi possível pausar vídeo.",
                        erro
                    );

                }

            }

        );

    }


    function obterVideoAtivo() {

        const card =
            obterCardPorIndice(
                estado.galeria.indiceAtual
            );


        if (!card) {

            return null;

        }


        return card.querySelector(
            "video.portfolio-deck-media"
        );

    }


    function estaCompletamenteVisivel(
        elemento
    ) {

        if (!elemento) {

            return false;

        }


        const rect =
            elemento.getBoundingClientRect();


        const alturaViewport =
            window.innerHeight ||
            document.documentElement.clientHeight;


        const larguraViewport =
            window.innerWidth ||
            document.documentElement.clientWidth;


        const tolerancia =
            1;


        return (

            rect.top >= -tolerancia &&

            rect.left >= -tolerancia &&

            rect.bottom <=
                alturaViewport + tolerancia &&

            rect.right <=
                larguraViewport + tolerancia

        );

    }


    function reproduzirVideoSePermitido(
        video
    ) {

        if (!video) {

            return;

        }


        video.muted = false;

        video.defaultMuted = false;


        const tentativa =
            video.play();


        if (
            tentativa &&
            typeof tentativa.catch ===
            "function"
        ) {

            tentativa.catch(

                function (erro) {

                    if (
                        erro &&
                        erro.name ===
                        "NotAllowedError"
                    ) {

                        console.info(
                            "PortfolioDeck: autoplay aguardando interação do usuário."
                        );

                        return;

                    }


                    console.warn(
                        "PortfolioDeck: não foi possível reproduzir o vídeo.",
                        erro
                    );

                }

            );

        }

    }


    function atualizarVideoAtivo() {

        const videos =
            obterVideosDeck();


        if (!videos.length) {

            return;

        }


        videos.forEach(

            function (video) {

                const card =
                    video.closest(
                        ".portfolio-deck-card"
                    );


                if (!card) {

                    return;

                }


                const indice =
                    Number(
                        card.dataset.indice
                    );


                if (
                    indice !==
                    estado.galeria.indiceAtual
                ) {

                    if (
                        !video.paused
                    ) {

                        try {

                            video.pause();

                        } catch (erro) {

                            console.warn(
                                "PortfolioDeck: não foi possível pausar vídeo.",
                                erro
                            );

                        }

                    }

                    return;

                }


                if (
                    estado.videosPausadosPorSwipe ||
                    estado.galeria.arrastando ||
                    estado.galeria.animando
                ) {

                    if (
                        !video.paused
                    ) {

                        try {

                            video.pause();

                        } catch (erro) {

                            console.warn(
                                "PortfolioDeck: não foi possível pausar vídeo.",
                                erro
                            );

                        }

                    }

                    return;

                }


                if (
                    estaCompletamenteVisivel(
                        card
                    )
                ) {

                    reproduzirVideoSePermitido(
                        video
                    );

                } else {

                    if (
                        !video.paused
                    ) {

                        try {

                            video.pause();

                        } catch (erro) {

                            console.warn(
                                "PortfolioDeck: não foi possível pausar vídeo.",
                                erro
                            );

                        }

                    }

                }

            }

        );

    }


    /* =========================================================
       12. OBSERVER DOS VÍDEOS
       ========================================================= */

    function configurarObserverVideos() {

        destruirObserverVideos();


        const deck =
            obterDeck();


        if (!deck) {

            return;

        }


        const videos =
            obterVideosDeck();


        if (!videos.length) {

            return;

        }


        try {

            estado.observerVideos =

                new IntersectionObserver(

                    function (entradas) {

                        entradas.forEach(

                            function (entrada) {

                                const card =
                                    entrada.target;


                                const video =
                                    card.querySelector(
                                        "video.portfolio-deck-media"
                                    );


                                if (!video) {

                                    return;

                                }


                                const indice =
                                    Number(
                                        card.dataset.indice
                                    );


                                if (
                                    indice !==
                                    estado.galeria.indiceAtual
                                ) {

                                    if (
                                        !video.paused
                                    ) {

                                        try {

                                            video.pause();

                                        } catch (erro) {

                                            console.warn(
                                                "PortfolioDeck: não foi possível pausar vídeo.",
                                                erro
                                            );

                                        }

                                    }

                                    return;

                                }


                                if (
                                    estado.videosPausadosPorSwipe ||
                                    estado.galeria.arrastando ||
                                    estado.galeria.animando
                                ) {

                                    if (
                                        !video.paused
                                    ) {

                                        try {

                                            video.pause();

                                        } catch (erro) {

                                            console.warn(
                                                "PortfolioDeck: não foi possível pausar vídeo.",
                                                erro
                                            );

                                        }

                                    }

                                    return;

                                }


                                if (
                                    entrada.isIntersecting &&
                                    entrada.intersectionRatio >=
                                    CONFIG.video.visibilidadeMinima
                                ) {

                                    utils.atualizarFundoDinamico();


                                    reproduzirVideoSePermitido(
                                        video
                                    );

                                } else {

                                    if (
                                        !video.paused
                                    ) {

                                        try {

                                            video.pause();

                                        } catch (erro) {

                                            console.warn(
                                                "PortfolioDeck: não foi possível pausar vídeo.",
                                                erro
                                            );

                                        }

                                    }

                                }

                            }

                        );

                    },

                    {

                        threshold: [

                            0,

                            0.5,

                            0.75,

                            0.99,

                            1

                        ]

                    }

                );


            videos.forEach(

                function (video) {

                    const card =
                        video.closest(
                            ".portfolio-deck-card"
                        );


                    if (card) {

                        estado.observerVideos.observe(
                            card
                        );

                    }

                }

            );


            requestAnimationFrame(

                function () {

                    atualizarVideoAtivo();

                }

            );


        } catch (erro) {

            console.warn(
                "PortfolioDeck: não foi possível criar observer dos vídeos.",
                erro
            );

        }

    }


    function destruirObserverVideos() {

        if (
            estado.observerVideos
        ) {

            try {

                estado.observerVideos.disconnect();

            } catch (erro) {

                console.warn(
                    "PortfolioDeck: erro ao desconectar observer dos vídeos.",
                    erro
                );

            }


            estado.observerVideos =
                null;

        }

    }


    /* =========================================================
       13. RESIZE
       ========================================================= */

    function ajustarDeckNoResize() {

        aplicarPosicoesDeck(

            estado.galeria.arrastando
                ? estado.galeria.deslocamentoX
                : 0,

            false

        );


        ajustarAlturaDeck();

        atualizarVideoAtivo();

        utils.atualizarIntensidadeFundo();

    }


    /* =========================================================
       14. DESMONTAGEM
       ========================================================= */

    function desmontarInteracaoDeck() {

        removerEventosDeck();

        destruirObserverVideos();

        pausarTodosVideos();


        estado.galeria.arrastando =
            false;

        estado.galeria.gestoHorizontal =
            false;

        estado.galeria.ponteiroId =
            null;

        estado.galeria.deslocamentoX =
            0;

        estado.galeria.animando =
            false;


        estado.videosPausadosPorSwipe =
            false;


        const deck =
            obterDeck();


        if (deck) {

            resetarEstiloContainerDeck(
                deck
            );

        }

    }


    function resetarEstiloContainerDeck(
        deck
    ) {

        if (!deck) {

            return;

        }


        deck.style.cursor =
            "grab";

    }


    /* =========================================================
       API INTERNA
       ========================================================= */

    window.MusicalWorldPortfolioDeck = {

        obterDeck,

        obterCardsDeck,

        obterCardPorIndice,

        normalizarIndice,

        obterDiferencaCircular,

        aplicarPosicoesDeck,

        ajustarAlturaDeck,

        configurarDeck,

        configurarEstiloCard,

        configurarEventosDeck,

        removerEventosDeck,

        iniciarArrasteDeck,

        moverArrasteDeck,

        finalizarArrasteDeck,

        cancelarArrasteDeck,

        liberarCapturaPonteiro,

        avancarGaleria,

        voltarGaleria,

        restaurarCardAtual,

        controlarCliqueDepoisSwipe,

        irParaItem,

        obterVideosDeck,

        pausarTodosVideos,

        obterVideoAtivo,

        estaCompletamenteVisivel,

        reproduzirVideoSePermitido,

        atualizarVideoAtivo,

        configurarObserverVideos,

        destruirObserverVideos,

        ajustarDeckNoResize,

        desmontarInteracaoDeck,

        resetarEstiloContainerDeck

    };


})(window);