(function (window) {

    "use strict";

    /*
     * =========================================================
     * MUSICALWORLD — CONTROLADOR DO PORTFÓLIO
     *
     * Arquivo:
     * ApresentarPerfilPortfolio.js
     *
     * Responsabilidade:
     *
     * - Ser a API pública do sistema de portfólio.
     * - Coordenar os módulos internos.
     * - Receber e atualizar os dados.
     * - Controlar o ciclo de vida do portfólio.
     *
     * A lógica detalhada foi dividida em:
     *
     * - PortfolioConfig.js
     * - PortfolioUtils.js
     * - PortfolioRender.js
     * - PortfolioDeck.js
     *
     * Outros módulos do MusicalWorld continuam utilizando:
     *
     * window.ApresentarPerfilPortfolio
     *
     * sem precisar conhecer essa divisão interna.
     * =========================================================
     */


    const modulo =
        window.MusicalWorldPortfolio;

    const utils =
        window.MusicalWorldPortfolioUtils;

    const render =
        window.MusicalWorldPortfolioRender;

    const deck =
        window.MusicalWorldPortfolioDeck;


    if (
        !modulo ||
        !utils ||
        !render ||
        !deck
    ) {

        console.error(
            "ApresentarPerfilPortfolio: módulos internos não foram carregados corretamente."
        );

        return;

    }


    const estado =
        modulo.estado;


    /* =========================================================
       01. CICLO DE RENDERIZAÇÃO
       ========================================================= */

    function renderizar(lista) {

        if (
            Array.isArray(lista)
        ) {

            estado.portfolio =

                utils.normalizarPortfolio(
                    lista
                );

        }


        render.prepararContainers();

        render.renderizarGaleria();

        render.renderizarAudios();


        estado.inicializado =
            true;


        return estado.portfolio;

    }


    /* =========================================================
       02. INICIALIZAÇÃO
       ========================================================= */

    function inicializar(lista) {

        if (
            Array.isArray(lista)
        ) {

            estado.portfolio =

                utils.normalizarPortfolio(
                    lista
                );

        }


        renderizar(
            estado.portfolio
        );


        estado.inicializado =
            true;


        return estado.portfolio;

    }


    /* =========================================================
       03. ATUALIZAÇÃO
       ========================================================= */

    function atualizar(lista) {

        if (
            !Array.isArray(lista)
        ) {

            return renderizar(
                estado.portfolio
            );

        }


        estado.portfolio =

            utils.normalizarPortfolio(
                lista
            );


        estado.galeria.indiceAtual =

            deck.normalizarIndice(
                estado.galeria.indiceAtual
            );


        return renderizar(
            estado.portfolio
        );

    }


    /* =========================================================
       04. GETTERS
       ========================================================= */

    function obterPortfolio() {

        return estado.portfolio.slice();

    }


    function obterImagens() {

        return utils.obterPorTipo(
            "imagem"
        );

    }


    function obterVideos() {

        return utils.obterPorTipo(
            "video"
        );

    }


    function obterAudios() {

        return utils.obterPorTipo(
            "audio"
        );

    }


    function obterEstadoGaleria() {

        return {

            indiceAtual:
                estado.galeria.indiceAtual,

            total:
                estado.galeria.itens.length,

            arrastando:
                estado.galeria.arrastando,

            animando:
                estado.galeria.animando

        };

    }


    /* =========================================================
       05. LIMPEZA COMPLETA
       ========================================================= */

    function limpar() {

        deck.desmontarInteracaoDeck();

        utils.resetarFundoDinamico();


        estado.portfolio =
            [];


        estado.galeria.itens =
            [];


        estado.galeria.indiceAtual =
            0;


        estado.galeria.deslocamentoX =
            0;


        estado.galeria.arrastando =
            false;


        estado.galeria.gestoHorizontal =
            false;


        estado.galeria.animando =
            false;


        estado.ignorarProximoClique =
            false;


        estado.videosPausadosPorSwipe =
            false;


        const portfolioGrid =

            utils.obterElemento(
                modulo.CONFIG.elementos.portfolioGrid
            );


        const videoList =

            utils.obterElemento(
                modulo.CONFIG.elementos.videoList
            );


        const audioList =

            utils.obterElemento(
                modulo.CONFIG.elementos.audioList
            );


        if (portfolioGrid) {

            portfolioGrid.innerHTML =
                "";

        }


        if (videoList) {

            videoList.innerHTML =
                "";

        }


        if (audioList) {

            audioList.innerHTML =
                "";

        }


        estado.inicializado =
            false;

    }


    /* =========================================================
       06. API PÚBLICA
       ========================================================= */

    const ApresentarPerfilPortfolio = {

        renderizar,

        inicializar,

        atualizar,

        limpar,

        obterPortfolio,

        obterImagens,

        obterVideos,

        obterAudios,

        obterEstadoGaleria,

        irParaItem:
            deck.irParaItem,

        avancarGaleria:
            deck.avancarGaleria,

        voltarGaleria:
            deck.voltarGaleria,

        estaInicializado:

            function () {

                return estado.inicializado;

            },


        normalizarItem:
            utils.normalizarItem,

        normalizarPortfolio:
            utils.normalizarPortfolio

    };


    /* =========================================================
       07. DISPONIBILIZAÇÃO GLOBAL
       ========================================================= */

    window.ApresentarPerfilPortfolio =
        ApresentarPerfilPortfolio;


    console.log(
        "ApresentarPerfilPortfolio.js carregado."
    );


})(window);