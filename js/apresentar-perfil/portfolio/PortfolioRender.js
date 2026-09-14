(function (window) {

    "use strict";

    /*
     * =========================================================
     * MUSICALWORLD — RENDERIZAÇÃO DO PORTFÓLIO
     *
     * Arquivo:
     * PortfolioRender.js
     *
     * Responsabilidade:
     *
     * - Criar cards.
     * - Renderizar galeria.
     * - Renderizar áudios.
     * - Criar indicadores.
     * - Criar botões de navegação.
     * - Tratar erros de mídia.
     * - Renderizar estados vazios.
     *
     * Este arquivo não controla diretamente o swipe.
     * O comportamento do deck pertence ao PortfolioDeck.js.
     * =========================================================
     */


    const modulo =
        window.MusicalWorldPortfolio;

    const utils =
        window.MusicalWorldPortfolioUtils;


    if (!modulo || !utils) {

        console.error(
            "PortfolioRender.js: módulos obrigatórios não encontrados."
        );

        return;

    }


    const CONFIG =
        modulo.CONFIG;

    const estado =
        modulo.estado;


    /* =========================================================
       01. ESTADO VAZIO
       ========================================================= */

    function renderizarEstadoVazio(
        container,
        mensagem
    ) {

        if (!container) {

            return;

        }


        container.innerHTML = `

            <div class="portfolio-estado-vazio">

                <div class="portfolio-estado-vazio-icone">

                    <i data-lucide="images"></i>

                </div>

                <p>

                    ${utils.escaparHtml(

                        mensagem ||

                        "Este artista ainda não adicionou trabalhos ao portfólio."

                    )}

                </p>

            </div>

        `;


        utils.renderizarIcones(
            container
        );

    }


    /* =========================================================
       02. CONTAINERS
       ========================================================= */

    function prepararContainers() {

        const videoList =

            utils.obterElemento(
                CONFIG.elementos.videoList
            );


        const audioList =

            utils.obterElemento(
                CONFIG.elementos.audioList
            );


        if (videoList) {

            videoList.classList.add(
                "portfolio-container-preparado"
            );

        }


        if (audioList) {

            audioList.classList.add(
                "portfolio-container-preparado"
            );

        }

    }


    /* =========================================================
       03. RENDERIZAÇÃO PRINCIPAL DA GALERIA
       ========================================================= */

    function renderizarGaleria() {

        const container =

            utils.obterElemento(
                CONFIG.elementos.portfolioGrid
            );


        if (!container) {

            return;

        }


        const deckModule =
            window.MusicalWorldPortfolioDeck;


        if (!deckModule) {

            console.error(
                "PortfolioRender: PortfolioDeck.js ainda não foi carregado."
            );

            return;

        }


        deckModule.desmontarInteracaoDeck();


        container.innerHTML =
            "";


        const itensGaleria =

            estado.portfolio.filter(

                function (item) {

                    return (

                        item &&

                        (

                            item._tipo === "imagem" ||

                            item._tipo === "video"

                        )

                    );

                }

            );


        estado.galeria.itens =
            itensGaleria;


        if (!itensGaleria.length) {

            estado.galeria.indiceAtual =
                0;

            estado.galeria.deslocamentoX =
                0;


            utils.resetarFundoDinamico();


            renderizarEstadoVazio(

                container,

                "Este artista ainda não adicionou trabalhos ao portfólio."

            );


            return;

        }


        estado.galeria.indiceAtual =

            Math.min(

                estado.galeria.indiceAtual,

                itensGaleria.length - 1

            );


        if (
            itensGaleria.length > 1
        ) {

            criarBotoesNavegacaoGaleria(
                container
            );

        }


        const deck =
            document.createElement(
                "div"
            );


        deck.className =
            "portfolio-deck";


        deck.setAttribute(
            "aria-label",
            "Galeria de trabalhos do artista"
        );


        itensGaleria.forEach(

            function (
                item,
                indice
            ) {

                let card = null;


                if (
                    item._tipo === "video"
                ) {

                    card =
                        criarCardGaleriaVideo(
                            item,
                            indice
                        );

                } else {

                    card =
                        criarCardGaleriaImagem(
                            item,
                            indice
                        );

                }


                if (card) {

                    deck.appendChild(
                        card
                    );

                }

            }

        );


        container.appendChild(
            deck
        );


        criarIndicadoresGaleria(

            container,

            itensGaleria.length

        );


        configurarErrosImagens(
            deck
        );


        configurarErrosVideos(
            deck
        );


        deckModule.configurarDeck();


        deckModule.configurarObserverVideos();


        utils.atualizarFundoDinamico();

        utils.configurarControleVisibilidadeFundo();


        utils.renderizarIcones(
            container
        );

    }


    /* =========================================================
       04. NAVEGAÇÃO LATERAL
       ========================================================= */

    function criarBotoesNavegacaoGaleria(
        container
    ) {

        if (!container) {

            return;

        }


        const deckModule =
            window.MusicalWorldPortfolioDeck;


        const botaoAnterior =
            document.createElement(
                "button"
            );


        botaoAnterior.type =
            "button";


        botaoAnterior.className =
            "portfolio-deck-nav portfolio-deck-nav-prev";


        botaoAnterior.setAttribute(
            "aria-label",
            "Trabalho anterior"
        );


        botaoAnterior.setAttribute(
            "title",
            "Trabalho anterior"
        );


        botaoAnterior.innerHTML = `

            <i
                data-lucide="chevron-left"
                aria-hidden="true"
            ></i>

        `;


        botaoAnterior.addEventListener(

            "click",

            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                deckModule.pausarTodosVideos();

                deckModule.voltarGaleria();

            }

        );


        const botaoProximo =
            document.createElement(
                "button"
            );


        botaoProximo.type =
            "button";


        botaoProximo.className =
            "portfolio-deck-nav portfolio-deck-nav-next";


        botaoProximo.setAttribute(
            "aria-label",
            "Próximo trabalho"
        );


        botaoProximo.setAttribute(
            "title",
            "Próximo trabalho"
        );


        botaoProximo.innerHTML = `

            <i
                data-lucide="chevron-right"
                aria-hidden="true"
            ></i>

        `;


        botaoProximo.addEventListener(

            "click",

            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();


                deckModule.pausarTodosVideos();

                deckModule.avancarGaleria();

            }

        );


        container.appendChild(
            botaoAnterior
        );


        container.appendChild(
            botaoProximo
        );

    }


    /* =========================================================
       05. ESTILO DO CARD
       ========================================================= */

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
       06. CARD DE IMAGEM
       ========================================================= */

    function criarCardGaleriaImagem(
        item,
        indice
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "portfolio-deck-card";


        card.dataset.indice =
            String(indice);


        card.dataset.tipo =
            "imagem";


        card.setAttribute(
            "aria-label",
            item._titulo ||
            `Imagem ${indice + 1} do portfólio`
        );


        configurarEstiloCard(
            card
        );


        const imagem =
            document.createElement(
                "img"
            );


        imagem.className =
            "portfolio-deck-media";


        imagem.src =
            item._url;


        imagem.alt =
            item._titulo ||
            "Trabalho do artista";


        imagem.loading =

            indice === 0
                ? "eager"
                : "lazy";


        imagem.draggable =
            false;


        card.appendChild(
            imagem
        );


        adicionarLegendaCard(
            card,
            item
        );


        return card;

    }


    /* =========================================================
       07. CARD DE VÍDEO
       ========================================================= */

    function criarCardGaleriaVideo(
        item,
        indice
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "portfolio-deck-card portfolio-deck-card-video";


        card.dataset.indice =
            String(indice);


        card.dataset.tipo =
            "video";


        card.setAttribute(
            "aria-label",
            item._titulo ||
            `Vídeo ${indice + 1} do portfólio`
        );


        configurarEstiloCard(
            card
        );


        const video =
            document.createElement(
                "video"
            );


        video.className =
            "portfolio-deck-media";


        video.crossOrigin =
            "anonymous";


        video.src =
            item._url;


        video.controls =
            true;


        video.autoplay =
            false;


        video.muted =
            CONFIG.video.muted;


        video.defaultMuted =
            CONFIG.video.muted;


        video.preload =
            "metadata";


        video.playsInline =
            true;


        video.setAttribute(
            "webkit-playsinline",
            ""
        );


        video.dataset.autoplayControlado =
            "true";


        card.appendChild(
            video
        );


        adicionarLegendaCard(
            card,
            item
        );


        return card;

    }


    /* =========================================================
       08. LEGENDA
       ========================================================= */

    function adicionarLegendaCard(
        card,
        item
    ) {

        if (
            !item._titulo &&
            !item._descricao
        ) {

            return;

        }


        const informacoes =

            document.createElement(
                "div"
            );


        informacoes.className =
            "portfolio-deck-caption";


        if (item._titulo) {

            const titulo =

                document.createElement(
                    "strong"
                );


            titulo.textContent =
                item._titulo;


            informacoes.appendChild(
                titulo
            );

        }


        if (item._descricao) {

            const descricao =

                document.createElement(
                    "span"
                );


            descricao.textContent =
                item._descricao;


            informacoes.appendChild(
                descricao
            );

        }


        card.appendChild(
            informacoes
        );

    }


    /* =========================================================
       09. INDICADORES
       ========================================================= */

    function criarIndicadoresGaleria(
        container,
        quantidade
    ) {

        removerIndicadoresGaleria();


        if (
            !container ||
            quantidade <= 1
        ) {

            return;

        }


        const indicadores =

            document.createElement(
                "div"
            );


        indicadores.className =
            "portfolio-deck-indicadores";


        indicadores.setAttribute(
            "aria-label",
            "Navegação da galeria"
        );


        for (
            let indice = 0;
            indice < quantidade;
            indice++
        ) {

            const botao =

                document.createElement(
                    "button"
                );


            botao.type =
                "button";


            botao.className =
                "portfolio-deck-indicador";


            botao.dataset.indice =
                String(indice);


            botao.setAttribute(
                "aria-label",
                `Ir para o item ${indice + 1}`
            );


            botao.setAttribute(
                "aria-current",

                indice ===
                estado.galeria.indiceAtual

                    ? "true"

                    : "false"
            );


            botao.addEventListener(

                "click",

                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();


                    const deckModule =
                        window.MusicalWorldPortfolioDeck;


                    deckModule.pausarTodosVideos();


                    const alvo =

                        Number(
                            botao.dataset.indice
                        );


                    deckModule.irParaItem(
                        alvo
                    );

                }

            );


            indicadores.appendChild(
                botao
            );

        }


        container.appendChild(
            indicadores
        );

    }


    function removerIndicadoresGaleria() {

        const container =

            utils.obterElemento(
                CONFIG.elementos.portfolioGrid
            );


        if (!container) {

            return;

        }


        const indicadores =

            container.querySelector(
                ".portfolio-deck-indicadores"
            );


        if (indicadores) {

            indicadores.remove();

        }

    }


    function atualizarIndicadoresGaleria() {

        const container =

            utils.obterElemento(
                CONFIG.elementos.portfolioGrid
            );


        if (!container) {

            return;

        }


        const indicadores =

            container.querySelectorAll(
                ".portfolio-deck-indicador"
            );


        if (!indicadores.length) {

            return;

        }


        indicadores.forEach(

            function (
                botao,
                indice
            ) {

                const ativo =

                    indice ===
                    estado.galeria.indiceAtual;


                botao.setAttribute(

                    "aria-current",

                    ativo
                        ? "true"
                        : "false"

                );

            }

        );

    }


    /* =========================================================
       10. ERROS DE MÍDIA
       ========================================================= */

    function configurarErrosImagens(
        container
    ) {

        if (!container) {

            return;

        }


        const deckModule =
            window.MusicalWorldPortfolioDeck;


        const imagens =

            container.querySelectorAll(
                "img.portfolio-deck-media"
            );


        imagens.forEach(

            function (imagem) {

                imagem.addEventListener(

                    "error",

                    function () {

                        imagem.style.display =
                            "none";


                        const card =

                            imagem.closest(
                                ".portfolio-deck-card"
                            );


                        if (!card) {

                            return;

                        }


                        card.classList.add(
                            "portfolio-media-erro"
                        );


                        const mensagem =

                            document.createElement(
                                "div"
                            );


                        mensagem.className =
                            "portfolio-media-erro-mensagem";


                        mensagem.textContent =
                            "Não foi possível carregar esta imagem.";


                        card.appendChild(
                            mensagem
                        );


                        deckModule.ajustarAlturaDeck();

                    }

                );

            }

        );

    }


    function configurarErrosVideos(
        container
    ) {

        if (!container) {

            return;

        }


        const videos =

            container.querySelectorAll(
                "video.portfolio-deck-media"
            );


        videos.forEach(

            function (video) {

                video.addEventListener(

                    "error",

                    function () {

                        video.controls =
                            false;


                        const card =

                            video.closest(
                                ".portfolio-deck-card"
                            );


                        if (!card) {

                            return;

                        }


                        card.classList.add(
                            "portfolio-media-erro"
                        );

                    }

                );

            }

        );

    }


    /* =========================================================
       11. ÁUDIOS
       ========================================================= */

    function renderizarAudios() {

        const container =

            utils.obterElemento(
                CONFIG.elementos.audioList
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        const audios =
            utils.obterPorTipo(
                "audio"
            );


        if (!audios.length) {

            container.innerHTML =
                "";

            return;

        }


        audios.forEach(

            function (
                item,
                indice
            ) {

                const card =

                    criarCardAudio(
                        item,
                        indice
                    );


                if (card) {

                    container.appendChild(
                        card
                    );

                }

            }

        );


        utils.renderizarIcones(
            container
        );

    }


    function criarCardAudio(
        item,
        indice
    ) {

        const card =

            document.createElement(
                "article"
            );


        card.className =
            "portfolio-audio-card";


        const titulo =

            item._titulo ||
            `Áudio ${indice + 1}`;


        const descricao =
            item._descricao;


        card.innerHTML = `

            <div class="portfolio-audio-card-conteudo">

                <div class="portfolio-audio-card-icone">

                    <i data-lucide="music-2"></i>

                </div>

                <div class="portfolio-audio-card-info">

                    <strong>

                        ${utils.escaparHtml(titulo)}

                    </strong>

                    ${
                        descricao

                            ? `

                                <span>

                                    ${utils.escaparHtml(descricao)}

                                </span>

                            `

                            : ""

                    }

                </div>

            </div>

            <audio
                controls
                preload="metadata"
                src="${utils.escaparHtml(item._url)}"
            ></audio>

        `;


        return card;

    }


    /* =========================================================
       API INTERNA
       ========================================================= */

    window.MusicalWorldPortfolioRender = {

        renderizarEstadoVazio,

        prepararContainers,

        renderizarGaleria,

        criarBotoesNavegacaoGaleria,

        configurarEstiloCard,

        criarCardGaleriaImagem,

        criarCardGaleriaVideo,

        adicionarLegendaCard,

        criarIndicadoresGaleria,

        removerIndicadoresGaleria,

        atualizarIndicadoresGaleria,

        configurarErrosImagens,

        configurarErrosVideos,

        renderizarAudios,

        criarCardAudio

    };


})(window);