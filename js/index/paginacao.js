/* =========================================================
   MUSICALWORLD — CONTROLE DE PAGINAÇÃO DO FEED

   Arquivo:
   js/index/paginacao.js

   Responsabilidades:
   - Controlar a página atual do feed.
   - Controlar o estado de carregamento.
   - Controlar quando o feed chegou ao fim.
   - Controlar o IntersectionObserver do sentinel.
   - Solicitar ao módulo principal o carregamento da
     próxima página.
   - Permitir reiniciar a paginação quando os filtros
     forem alterados.

   Este arquivo NÃO é responsável por:
   - Consultar o Supabase.
   - Criar anúncios.
   - Criar HTML de anúncios.
   - Controlar vídeos.
   - Controlar filtros.
   - Controlar elementos visuais do feed.

   O carregamento dos dados continua sendo coordenado
   pelo main.js através das funções públicas deste módulo.
========================================================= */

(function (window) {
    "use strict";


    /* =====================================================
       CONFIGURAÇÃO DA PAGINAÇÃO
    ===================================================== */

    const PAGINACAO_CONFIG = {

        limitePorPagina: 12,

        paginaAtual: 0,

        carregando: false,

        acabou: false,

        observer: null,

        sentinel: null,

        callbackCarregar: null,

        inicializado: false

    };


    /* =====================================================
       DEFINIR CALLBACK DE CARREGAMENTO
       
       O main.js informa ao módulo qual função deve ser
       executada quando for necessário carregar mais dados.
    ===================================================== */

    function definirCallbackCarregar(callback) {

        if (typeof callback !== "function") {

            console.warn(
                "MusicalWorld Paginação: callback de carregamento inválido."
            );

            PAGINACAO_CONFIG.callbackCarregar = null;

            return;

        }

        PAGINACAO_CONFIG.callbackCarregar = callback;

    }


    /* =====================================================
       EXECUTAR CARREGAMENTO
    ===================================================== */

    async function carregarProximaPagina() {

        if (PAGINACAO_CONFIG.carregando) {
            return;
        }

        if (PAGINACAO_CONFIG.acabou) {
            return;
        }

        if (
            typeof PAGINACAO_CONFIG.callbackCarregar !==
            "function"
        ) {

            console.error(
                "MusicalWorld Paginação: callback de carregamento não configurado."
            );

            return;

        }

        PAGINACAO_CONFIG.carregando = true;

        try {

            const resultado =
                await PAGINACAO_CONFIG.callbackCarregar({

                    pagina:
                        PAGINACAO_CONFIG.paginaAtual,

                    limite:
                        PAGINACAO_CONFIG.limitePorPagina,

                    offset:
                        PAGINACAO_CONFIG.paginaAtual *
                        PAGINACAO_CONFIG.limitePorPagina

                });


            /*
             * O callback pode informar quantos registros
             * foram carregados e se o feed chegou ao fim.
             */

            const quantidadeCarregada =
                resultado?.quantidade ?? 0;


            if (
                resultado &&
                typeof resultado.acabou === "boolean"
            ) {

                PAGINACAO_CONFIG.acabou =
                    resultado.acabou;

            } else {

                PAGINACAO_CONFIG.acabou =
                    quantidadeCarregada <
                    PAGINACAO_CONFIG.limitePorPagina;

            }


            /*
             * Só avançamos a página depois que o carregamento
             * foi concluído com sucesso.
             */

            PAGINACAO_CONFIG.paginaAtual += 1;


        } catch (erro) {

            console.error(
                "MusicalWorld Paginação: erro ao carregar página.",
                erro
            );

        } finally {

            PAGINACAO_CONFIG.carregando = false;

        }

    }


    /* =====================================================
       REINICIAR PAGINAÇÃO
       
       Utilizado quando:
       - o feed é recarregado;
       - os filtros mudam;
       - o usuário precisa voltar para a primeira página.
    ===================================================== */

    function reiniciar() {

        PAGINACAO_CONFIG.paginaAtual = 0;

        PAGINACAO_CONFIG.carregando = false;

        PAGINACAO_CONFIG.acabou = false;

    }


    /* =====================================================
       CONFIGURAR SENTINEL
       
       O sentinel fica no final do feed.
       Quando ele entra na área visível, solicitamos
       automaticamente a próxima página.
    ===================================================== */

    function configurarObserver(sentinel) {

        PAGINACAO_CONFIG.sentinel = sentinel || null;


        /*
         * Remove observer anterior para evitar múltiplos
         * observers executando simultaneamente.
         */

        if (PAGINACAO_CONFIG.observer) {

            PAGINACAO_CONFIG.observer.disconnect();

            PAGINACAO_CONFIG.observer = null;

        }


        if (!PAGINACAO_CONFIG.sentinel) {

            console.warn(
                "MusicalWorld Paginação: sentinel não encontrado."
            );

            return;

        }


        /* =================================================
           FALLBACK PARA NAVEGADORES SEM IntersectionObserver
        ================================================= */

        if (
            !("IntersectionObserver" in window)
        ) {

            window.addEventListener(
                "scroll",
                verificarScrollFallback,
                {
                    passive: true
                }
            );

            return;

        }


        /* =================================================
           INTERSECTION OBSERVER
        ================================================= */

        PAGINACAO_CONFIG.observer =
            new IntersectionObserver(

                entradas => {

                    entradas.forEach(entrada => {

                        if (
                            entrada.isIntersecting
                        ) {

                            carregarProximaPagina();

                        }

                    });

                },

                {
                    root: null,

                    rootMargin:
                        "0px 0px 800px 0px",

                    threshold: 0
                }

            );


        PAGINACAO_CONFIG.observer.observe(
            PAGINACAO_CONFIG.sentinel
        );

    }


    /* =====================================================
       FALLBACK DE SCROLL
    ===================================================== */

    function verificarScrollFallback() {

        if (PAGINACAO_CONFIG.carregando) {
            return;
        }

        if (PAGINACAO_CONFIG.acabou) {
            return;
        }


        const distancia =
            document.documentElement.scrollHeight -
            (
                window.scrollY +
                window.innerHeight
            );


        /*
         * Quando faltarem menos de 700px para o final,
         * solicitamos a próxima página.
         */

        if (distancia < 700) {

            carregarProximaPagina();

        }

    }


    /* =====================================================
       INICIALIZAR PAGINAÇÃO
    ===================================================== */

    function inicializar(options = {}) {

        const {

            sentinel = null,

            limitePorPagina = 12,

            callbackCarregar = null

        } = options;


        PAGINACAO_CONFIG.limitePorPagina =
            Number(limitePorPagina) || 12;


        definirCallbackCarregar(
            callbackCarregar
        );


        configurarObserver(
            sentinel
        );


        PAGINACAO_CONFIG.inicializado = true;

    }


    /* =====================================================
       MARCAR FIM DO FEED
       
       Permite que o main.js ou outro módulo informe
       explicitamente que não existem mais registros.
    ===================================================== */

    function marcarFim() {

        PAGINACAO_CONFIG.acabou = true;

    }


    /* =====================================================
       INFORMAR QUANTIDADE CARREGADA
       
       Útil quando outro módulo faz o carregamento e quer
       informar se aquela página foi completa.
    ===================================================== */

    function informarQuantidade(quantidade) {

        const quantidadeNumerica =
            Number(quantidade) || 0;


        if (
            quantidadeNumerica <
            PAGINACAO_CONFIG.limitePorPagina
        ) {

            PAGINACAO_CONFIG.acabou = true;

        }

    }


    /* =====================================================
       GETTERS
    ===================================================== */

    function obterPaginaAtual() {

        return PAGINACAO_CONFIG.paginaAtual;

    }


    function obterLimite() {

        return PAGINACAO_CONFIG.limitePorPagina;

    }


    function obterOffset() {

        return (
            PAGINACAO_CONFIG.paginaAtual *
            PAGINACAO_CONFIG.limitePorPagina
        );

    }


    function estaCarregando() {

        return PAGINACAO_CONFIG.carregando;

    }


    function chegouAoFim() {

        return PAGINACAO_CONFIG.acabou;

    }


    /* =====================================================
       DESTRUIR PAGINAÇÃO
       
       Remove observers e listeners quando necessário.
    ===================================================== */

    function destruir() {

        if (PAGINACAO_CONFIG.observer) {

            PAGINACAO_CONFIG.observer.disconnect();

            PAGINACAO_CONFIG.observer = null;

        }


        window.removeEventListener(
            "scroll",
            verificarScrollFallback
        );


        PAGINACAO_CONFIG.sentinel = null;

        PAGINACAO_CONFIG.callbackCarregar = null;

        PAGINACAO_CONFIG.inicializado = false;

    }


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    window.MusicalWorldPaginacao = {

        inicializar,

        definirCallbackCarregar,

        carregarProximaPagina,

        reiniciar,

        configurarObserver,

        marcarFim,

        informarQuantidade,

        obterPaginaAtual,

        obterLimite,

        obterOffset,

        estaCarregando,

        chegouAoFim,

        destruir

    };


})(window);