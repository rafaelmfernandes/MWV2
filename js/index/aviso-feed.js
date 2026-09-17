 /* =========================================================
   MUSICALWORLD — AVISO DO FEED

   Arquivo:
   js/index/aviso.js

   Responsabilidades:
   - Controlar o aviso inicial exibido no feed.
   - Verificar se o usuário já fechou o aviso.
   - Fechar e remover o aviso da página.
   - Persistir o fechamento através do localStorage.

   Este arquivo NÃO é responsável por:
   - Carregar profissionais.
   - Consultar o Supabase.
   - Criar anúncios.
   - Controlar paginação.
   - Controlar filtros.
   - Controlar vídeos.

   Elementos esperados no HTML:
   - [data-feed-aviso]
   - [data-feed-aviso-fechar]
========================================================= */

(function (window) {
    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const AVISO_CONFIG = {

        chaveStorage:
            "musicalworld_feed_aviso_fechado",

        seletorAviso:
            "[data-feed-aviso]",

        seletorBotaoFechar:
            "[data-feed-aviso-fechar]"

    };


    /* =====================================================
       OBTER AVISO
    ===================================================== */

    function obterAviso() {

        return document.querySelector(
            AVISO_CONFIG.seletorAviso
        );

    }


    /* =====================================================
       VERIFICAR SE O AVISO FOI FECHADO
    ===================================================== */

    function avisoFoiFechado() {

        return (
            localStorage.getItem(
                AVISO_CONFIG.chaveStorage
            ) === "true"
        );

    }


    /* =====================================================
       REMOVER AVISO
    ===================================================== */

    function removerAviso() {

        const aviso =
            obterAviso();


        if (!aviso) {
            return;
        }


        aviso.remove();

    }


    /* =====================================================
       FECHAR AVISO
    ===================================================== */

    function fecharAviso() {

        localStorage.setItem(
            AVISO_CONFIG.chaveStorage,
            "true"
        );


        removerAviso();

    }


    /* =====================================================
       CONFIGURAR BOTÃO DE FECHAMENTO
    ===================================================== */

    function configurarBotaoFechar() {

        const aviso =
            obterAviso();


        if (!aviso) {
            return;
        }


        const botaoFechar =
            aviso.querySelector(
                AVISO_CONFIG.seletorBotaoFechar
            );


        if (!botaoFechar) {

            console.warn(
                "MusicalWorld Aviso: botão de fechamento não encontrado."
            );

            return;

        }


        /*
         * Evita registrar o mesmo evento mais de uma vez
         * caso o módulo seja inicializado novamente.
         */

        if (
            botaoFechar.dataset.avisoConfigurado ===
            "true"
        ) {

            return;

        }


        botaoFechar.dataset.avisoConfigurado =
            "true";


        botaoFechar.addEventListener(
            "click",
            fecharAviso
        );

    }


    /* =====================================================
       INICIALIZAR AVISO
    ===================================================== */

    function inicializar() {

        const aviso =
            obterAviso();


        if (!aviso) {
            return;
        }


        /*
         * Se o usuário já fechou anteriormente,
         * removemos o aviso imediatamente.
         */

        if (avisoFoiFechado()) {

            removerAviso();

            return;

        }


        configurarBotaoFechar();

    }


    /* =====================================================
       REABRIR AVISO
       
       Função útil para testes durante o desenvolvimento.
       
       Ela remove o registro do localStorage e permite
       que o aviso apareça novamente.
    ===================================================== */

    function reabrir() {

        localStorage.removeItem(
            AVISO_CONFIG.chaveStorage
        );


        /*
         * Caso o elemento ainda exista no DOM,
         * apenas mostramos novamente.
         */

        const aviso =
            obterAviso();


        if (aviso) {

            aviso.hidden = false;

            aviso.style.display = "";

            configurarBotaoFechar();

        }

    }


    /* =====================================================
       VERIFICAR ESTADO
    ===================================================== */

    function estaFechado() {

        return avisoFoiFechado();

    }


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    window.MusicalWorldAviso = {

        inicializar,

        fechar: fecharAviso,

        remover: removerAviso,

        reabrir,

        estaFechado

    };


})(window);