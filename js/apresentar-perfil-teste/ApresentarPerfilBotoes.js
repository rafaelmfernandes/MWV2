
/* =========================================================
   MUSICALWORLD — BOTÕES PRINCIPAIS DO PERFIL

   Arquivo:
   js/apresentar-perfil-teste/ApresentarPerfilBotoes.js

   Responsabilidade:

   - Controlar a apresentação dos botões principais do perfil.
   - Identificar se o perfil é de artista ou estabelecimento.
   - Exibir Mensagem + Contratar para artistas.
   - Exibir Mensagem + Enviar proposta para estabelecimentos.
   - Reutilizar as ações existentes de ApresentarPerfilAcoes.js.
   - Não duplicar a lógica de mensagens ou contratação.
   - Abrir o novo fluxo modular de propostas.

   Este arquivo NÃO:
   - consulta o Supabase;
   - carrega dados do perfil;
   - renderiza agenda;
   - renderiza portfólio;
   - executa diretamente a contratação;
   - cria conversas.
   ========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       ELEMENTOS
       ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =========================================================
       PERFIL
       ========================================================= */

    function obterDados() {

        return window.ApresentarPerfilDadosTeste || null;

    }


    function obterPerfil() {

        const dados =
            obterDados();


        if (
            !dados ||
            typeof dados.obterPerfil !== "function"
        ) {

            return {};

        }


        return dados.obterPerfil() || {};

    }


    function obterPerfilEstabelecimento() {

        const dados =
            obterDados();


        if (
            !dados ||
            typeof dados.obterPerfilEstabelecimento !== "function"
        ) {

            return null;

        }


        return dados.obterPerfilEstabelecimento() || null;

    }


    function obterTipoPerfil() {

        const dados =
            obterDados();


        if (
            !dados ||
            typeof dados.obterTipoPerfil !== "function"
        ) {

            return {};

        }


        return dados.obterTipoPerfil() || {};

    }


    /* =========================================================
       IDENTIFICAR ESTABELECIMENTO
       ========================================================= */

    function perfilEhEstabelecimento() {

        const estabelecimento =
            obterPerfilEstabelecimento();


        /*
         * A existência de um registro em
         * perfis_estabelecimentos identifica diretamente
         * que o perfil visitado é um estabelecimento.
         *
         * Essa é a fonte principal e mais confiável.
         */

        if (estabelecimento) {

            return true;

        }


        /*
         * Mantemos os identificadores do tipo geral como
         * compatibilidade para estruturas antigas ou casos
         * em que o registro complementar ainda não esteja
         * disponível.
         */

        const perfil =
            obterPerfil();


        const tipo =
            obterTipoPerfil();


        const valores = [

            perfil.tipo_perfil,

            perfil.tipo_perfil_nome,

            tipo.nome,

            tipo.codigo,

            tipo.slug

        ];


        return valores.some(
            function (valor) {

                if (
                    valor === null ||
                    valor === undefined
                ) {

                    return false;

                }


                const texto =
                    String(valor)
                        .trim()
                        .toLowerCase()
                        .replace(/[\s-]+/g, "_");


                return [

                    "estabelecimento",
                    "organizador_eventos",
                    "casa_shows",
                    "empresa_agencia",
                    "restaurante",
                    "hotel",
                    "clube",
                    "boate",
                    "pousada",
                    "bar"

                ].includes(texto);

            }
        );

    }


    /* =========================================================
       ID DO PERFIL
       ========================================================= */

    function obterPerfilId() {

        const dados =
            obterDados();


        if (
            !dados ||
            typeof dados.obterPerfilId !== "function"
        ) {

            return null;

        }


        return dados.obterPerfilId();

    }


    /* =========================================================
       EXIBIR / OCULTAR BOTÕES
       ========================================================= */

    function configurarVisibilidade() {

        const botaoMensagem =
            obterElemento(
                "btnMandarMensagem"
            );


        const botaoContratar =
            obterElemento(
                "btnContratar"
            );


        const botaoProposta =
            obterElemento(
                "btnEnviarProposta"
            );


        /*
         * O botão de mensagem permanece disponível
         * independentemente do tipo de perfil.
         */

        if (botaoMensagem) {

            botaoMensagem.hidden =
                false;

        }


        /*
         * =====================================================
         * ESTABELECIMENTO
         * =====================================================
         *
         * Estabelecimentos recebem:
         *
         * - Mensagem
         * - Enviar proposta
         *
         * O botão Contratar não aparece.
         */

        if (perfilEhEstabelecimento()) {

            if (botaoContratar) {

                botaoContratar.hidden =
                    true;

            }


            if (botaoProposta) {

                botaoProposta.hidden =
                    false;

            }


            return;

        }


        /*
         * =====================================================
         * ARTISTA
         * =====================================================
         *
         * Artistas recebem:
         *
         * - Mensagem
         * - Contratar
         *
         * O botão Enviar proposta não aparece.
         */

        if (botaoContratar) {

            botaoContratar.hidden =
                false;

        }


        if (botaoProposta) {

            botaoProposta.hidden =
                true;

        }

    }


    /* =========================================================
       AÇÃO — MENSAGEM
       ========================================================= */

    function abrirMensagens() {

        const acoes =
            window.ApresentarPerfilAcoesTeste;


        if (
            acoes &&
            typeof acoes.abrirMensagens === "function"
        ) {

            acoes.abrirMensagens();

            return;

        }


        console.warn(
            "ApresentarPerfilBotoes: ação de mensagem não encontrada."
        );

    }


    /* =========================================================
       AÇÃO — CONTRATAR
       ========================================================= */

    function contratarPerfil() {

        const acoes =
            window.ApresentarPerfilAcoesTeste;


        if (
            acoes &&
            typeof acoes.contratarPerfil === "function"
        ) {

            acoes.contratarPerfil();

            return;

        }


        console.warn(
            "ApresentarPerfilBotoes: ação de contratação não encontrada."
        );

    }


    /* =========================================================
       AÇÃO — ENVIAR PROPOSTA
       ========================================================= */

    function enviarProposta() {

        const perfilId =
            obterPerfilId();


        if (
            perfilId === null ||
            perfilId === undefined ||
            String(perfilId).trim() === ""
        ) {

            console.warn(
                "ApresentarPerfilBotoes: ID do estabelecimento não disponível."
            );


            return;

        }


        /*
         * =====================================================
         * NOVO FLUXO DE PROPOSTA
         * =====================================================
         *
         * O fluxo antigo redirecionava para:
         *
         * fluxo-proposta.html?perfil_id=...
         *
         * Esse comportamento foi removido.
         *
         * Agora o botão abre o módulo modular de proposta
         * diretamente dentro da página atual.
         */

        const proposta =
            window.MusicalWorldProposta;


        if (
            proposta &&
            typeof proposta.abrir === "function"
        ) {

            proposta.abrir(
                String(perfilId).trim()
            );


            return;

        }


        /*
         * Caso o módulo ainda não esteja disponível,
         * não fazemos redirecionamento para uma página antiga.
         */

        console.warn(
            "ApresentarPerfilBotoes: módulo MusicalWorldProposta não encontrado."
        );

    }


    /* =========================================================
       CONFIGURAR EVENTOS
       ========================================================= */

    function configurarEventos() {

        const botaoMensagem =
            obterElemento(
                "btnMandarMensagem"
            );


        const botaoContratar =
            obterElemento(
                "btnContratar"
            );


        const botaoProposta =
            obterElemento(
                "btnEnviarProposta"
            );


        if (
            botaoMensagem &&
            botaoMensagem.dataset.botoesConfigurado !== "true"
        ) {

            botaoMensagem.dataset.botoesConfigurado =
                "true";


            botaoMensagem.addEventListener(
                "click",
                function () {

                    abrirMensagens();

                }
            );

        }


        if (
            botaoContratar &&
            botaoContratar.dataset.botoesConfigurado !== "true"
        ) {

            botaoContratar.dataset.botoesConfigurado =
                "true";


            botaoContratar.addEventListener(
                "click",
                function () {

                    contratarPerfil();

                }
            );

        }


        if (
            botaoProposta &&
            botaoProposta.dataset.botoesConfigurado !== "true"
        ) {

            botaoProposta.dataset.botoesConfigurado =
                "true";


            botaoProposta.addEventListener(
                "click",
                function () {

                    enviarProposta();

                }
            );

        }

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function inicializar() {

        configurarVisibilidade();

        configurarEventos();


        console.log(
            "ApresentarPerfilBotoesTeste: botões configurados."
        );

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ApresentarPerfilBotoesTeste = {

        inicializar,

        configurarVisibilidade,

        configurarEventos,

        abrirMensagens,

        contratarPerfil,

        enviarProposta,

        perfilEhEstabelecimento,

        obterPerfilId

    };


    /* =========================================================
       DIAGNÓSTICO
       ========================================================= */

    console.log(
        "ApresentarPerfilBotoesTeste carregado."
    );


})(window);

