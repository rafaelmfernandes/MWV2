/* =========================================================
   MUSICALWORLD — AVISO DO FEED

   Arquivo:
   js/index/aviso-feed.js

   Responsabilidades:
   - Exibir o aviso normalmente ao abrir o Index.
   - Fechar o aviso somente quando o usuário clicar no X.
   - Salvar o fechamento no localStorage.
   - Manter o aviso fechado após recarregar a página.
   - Manter o espaçamento superior do feed quando
     o aviso for removido no celular ou tablet.
   - Permitir reabrir o aviso manualmente pelo código.

   Este arquivo NÃO controla:
   - Feed de profissionais.
   - Filtros.
   - Paginação.
   - Cards.
   - Interações de perfil.
========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const AVISO_CONFIG = {

        /*
         * Chave utilizada para lembrar que o usuário
         * já fechou o aviso.
         */
        chaveStorage:
            "musicalworld_feed_aviso_fechado",


        /*
         * Aviso existente no index.html.
         */
        seletorAviso:
            "#feedAviso",


        /*
         * Botão X existente no index.html.
         */
        seletorBotaoFechar:
            "#btnFecharFeedAviso",


        /*
         * Layout que contém o aviso e o feed.
         */
        seletorFeedLayout:
            ".feed-layout",


        /*
         * O seu CSS atual utiliza 45px de margem
         * superior no aviso em celular e tablet.
         *
         * Quando o aviso é removido, precisamos
         * preservar exatamente esse espaço para
         * impedir que o feed fique atrás do cabeçalho.
         */
        espacamentoTopo:
            "45px"

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
       OBTER LAYOUT DO FEED
    ===================================================== */

    function obterFeedLayout() {

        return document.querySelector(
            AVISO_CONFIG.seletorFeedLayout
        );

    }


    /* =====================================================
       VERIFICAR SE ESTÁ EM CELULAR OU TABLET
    ===================================================== */

    function estaEmTelaMobileOuTablet() {

        return window.matchMedia(
            "(max-width: 1199px)"
        ).matches;

    }


    /* =====================================================
       APLICAR ESPAÇAMENTO APÓS FECHAR O AVISO
    ===================================================== */

    function aplicarEspacamentoAposFechamento() {

        /*
         * Desktop não precisa desse espaçamento.
         *
         * No desktop o aviso permanece na lateral
         * e não interfere na posição superior do feed.
         */
        if (!estaEmTelaMobileOuTablet()) {

            return;

        }


        const feedLayout =
            obterFeedLayout();


        if (!feedLayout) {

            console.warn(
                "MusicalWorld Aviso: .feed-layout não encontrado."
            );

            return;

        }


        /*
         * Mantemos exatamente os 45px que anteriormente
         * pertenciam à margem superior do aviso.
         *
         * Assim, ao remover o aviso, o feed não sobe
         * para dentro da área do cabeçalho.
         */
        feedLayout.style.paddingTop =
            AVISO_CONFIG.espacamentoTopo;


        /*
         * Marca o estado para facilitar diagnóstico
         * e evitar qualquer ambiguidade no DOM.
         */
        feedLayout.dataset.avisoFechado =
            "true";

    }


    /* =====================================================
       REMOVER ESPAÇAMENTO APÓS REABRIR
    ===================================================== */

    function removerEspacamentoAposReabertura() {

        const feedLayout =
            obterFeedLayout();


        if (!feedLayout) {

            return;

        }


        /*
         * Retorna o padding para o estado original
         * definido pelo CSS.
         */
        feedLayout.style.paddingTop = "";


        delete feedLayout.dataset.avisoFechado;

    }


    /* =====================================================
       VERIFICAR SE O USUÁRIO JÁ FECHOU
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


        /*
         * Depois que o aviso desaparece,
         * preservamos o espaço superior somente
         * em celular e tablet.
         */
        aplicarEspacamentoAposFechamento();

    }


    /* =====================================================
       FECHAR AVISO
    ===================================================== */

    function fecharAviso() {

        /*
         * O fechamento continua sendo permitido
         * somente em telas menores que 1200px.
         *
         * Isso evita que o comportamento de fechamento
         * seja aplicado ao desktop.
         */
        if (!estaEmTelaMobileOuTablet()) {

            return;

        }


        /*
         * O localStorage só é alterado aqui,
         * ou seja, somente depois do clique no botão.
         */
        localStorage.setItem(
            AVISO_CONFIG.chaveStorage,
            "true"
        );


        /*
         * Depois de salvar o estado,
         * removemos o aviso e preservamos
         * o espaço superior necessário.
         */
        removerAviso();


        console.log(
            "Aviso do feed fechado pelo usuário."
        );

    }


    /* =====================================================
       CONFIGURAR BOTÃO FECHAR
    ===================================================== */

    function configurarBotaoFechar() {

        const aviso =
            obterAviso();


        if (!aviso) {

            console.warn(
                "MusicalWorld Aviso: aviso do feed não encontrado."
            );

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
         * Evita registrar o mesmo evento mais de uma vez.
         */
        if (
            botaoFechar.dataset.avisoConfigurado ===
            "true"
        ) {

            return;

        }


        botaoFechar.dataset.avisoConfigurado =
            "true";


        /*
         * O aviso só será fechado através deste clique.
         */
        botaoFechar.addEventListener(
            "click",
            fecharAviso
        );

    }


    /* =====================================================
       INICIALIZAR
    ===================================================== */

    function inicializar() {

        const aviso =
            obterAviso();


        /*
         * Se o aviso não existe no HTML,
         * não há nada para fazer.
         */
        if (!aviso) {

            console.warn(
                "MusicalWorld Aviso: elemento #feedAviso não encontrado."
            );

            return;

        }


        /*
         * Se o usuário já clicou no X anteriormente:
         *
         * - celular/tablet:
         *   remove o aviso e preserva os 45px;
         *
         * - desktop:
         *   mantém o aviso visível.
         */
        if (avisoFoiFechado()) {

            if (estaEmTelaMobileOuTablet()) {

                removerAviso();

                console.log(
                    "Aviso do feed permanece fechado."
                );

                return;

            }


            /*
             * No desktop ignoramos o estado salvo.
             *
             * O aviso continua visível.
             */
            removerEspacamentoAposReabertura();

            console.log(
                "Aviso do feed mantido no desktop."
            );

            return;

        }


        /*
         * IMPORTANTE:
         *
         * Quando ainda não existe registro no localStorage,
         * NÃO removemos o aviso.
         *
         * Portanto ele aparece normalmente.
         */
        configurarBotaoFechar();


        /*
         * Garantimos que o layout esteja no estado
         * original enquanto o aviso estiver presente.
         */
        removerEspacamentoAposReabertura();


        console.log(
            "Aviso do feed exibido."
        );

    }


    /* =====================================================
       REABRIR AVISO
    ===================================================== */

    function reabrir() {

        /*
         * Remove a memória de fechamento.
         */
        localStorage.removeItem(
            AVISO_CONFIG.chaveStorage
        );


        /*
         * Remove qualquer espaçamento aplicado
         * especificamente pelo fechamento.
         */
        removerEspacamentoAposReabertura();


        const aviso =
            obterAviso();


        /*
         * Se o elemento ainda existe,
         * apenas garantimos que esteja visível.
         */
        if (aviso) {

            aviso.hidden = false;

            aviso.style.display = "";


            configurarBotaoFechar();

            return;

        }


        /*
         * Se o aviso foi removido anteriormente pelo método
         * fecharAviso(), ele não pode ser recriado aqui
         * porque seu HTML pertence ao index.html.
         *
         * Nesse caso, basta recarregar a página.
         */
        console.log(
            "Aviso reativado para a próxima abertura da página."
        );

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

        fechar:
            fecharAviso,

        remover:
            removerAviso,

        reabrir,

        estaFechado

    };


})(window);