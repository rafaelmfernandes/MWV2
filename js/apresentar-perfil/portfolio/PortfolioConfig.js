(function (window) {

    "use strict";

    /*
     * =========================================================
     * MUSICALWORLD — CONFIGURAÇÃO DO PORTFÓLIO
     *
     * Arquivo:
     * PortfolioConfig.js
     *
     * Responsabilidade:
     *
     * - Centralizar configurações do portfólio.
     * - Centralizar estado interno da galeria.
     * - Centralizar estado dos vídeos.
     * - Centralizar estado do fundo dinâmico.
     *
     * Este arquivo NÃO renderiza HTML e NÃO registra eventos.
     * =========================================================
     */


    const CONFIG = {

        elementos: {

            portfolioGrid: "portfolioGrid",

            videoList: "videoList",

            audioList: "audioList"

        },


        /*
         * Configurações do deck visual.
         */
        deck: {

            limiteSwipe: 0.20,

            limitePixels: 55,

            duracao: 360,

            deslocamentoProximo: 28,

            deslocamentoVertical: 9,

            escalaProximo: 0.92,

            escalaDistante: 0.88,

            rotacaoMaxima: 4,

            blurProximo: "2px",

            blurDistante: "3px"

        },


        /*
         * Configurações dos vídeos.
         */
        video: {

            visibilidadeMinima: 1,

            muted: false,

            autoplay: true

        },


        /*
         * Configurações do fundo dinâmico.
         */
        fundoDinamico: {

            ativado: true,

            larguraCanvas: 40,

            alturaCanvas: 40,

            passoAmostragem: 2,

            distanciaMinimaCores: 55,

            corFallback1:
                "rgba(167, 182, 198, 0.30)",

            corFallback2:
                "rgba(200, 210, 222, 0.18)",

            corFallback3:
                "rgba(226, 232, 240, 0.12)"

        }

    };


    /*
     * =========================================================
     * ESTADO PRINCIPAL
     * =========================================================
     */

    const estado = {

        portfolio: [],

        inicializado: false,


        /*
         * Estado completo da galeria.
         */
        galeria: {

            itens: [],

            indiceAtual: 0,

            arrastando: false,

            gestoHorizontal: false,

            inicioX: 0,

            inicioY: 0,

            deslocamentoX: 0,

            ponteiroId: null,

            bloqueado: false,

            animando: false

        },


        /*
         * Evita clique imediatamente após swipe.
         */
        ignorarProximoClique: false,


        /*
         * Controla registro dos eventos.
         */
        eventosDeckRegistrados: false,


        /*
         * Observer dos vídeos.
         */
        observerVideos: null,


        /*
         * Durante swipe os vídeos ficam pausados.
         */
        videosPausadosPorSwipe: false,


        /*
         * Estado do fundo dinâmico.
         */
        fundoDinamico: {

            chaveAtual: "",

            processamento: 0,

            scrollRegistrado: false,

            coresAtuais: null,

            animacaoId: null,

            duracaoTransicao: 800

        }

    };


    /*
     * Disponibiliza configuração e estado para
     * os demais módulos internos.
     */
    window.MusicalWorldPortfolio = {

        CONFIG,

        estado

    };


})(window);