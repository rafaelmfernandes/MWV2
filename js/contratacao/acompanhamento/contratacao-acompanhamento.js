/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO

   Arquivo:
   js/contratacao/acompanhamento/contratacao-acompanhamento.js

   Responsabilidades:
   - Inicializar a página.
   - Coordenar os módulos de dados, renderização e fluxo.
   - Expor a API pública do acompanhamento.

   A lógica específica foi distribuída em:

   - contratacao-acompanhamento-dados.js
   - contratacao-acompanhamento-render.js
   - contratacao-acompanhamento-fluxo.js

   Este arquivo funciona como orquestrador.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       RECUPERAR MÓDULO INTERNO
       ===================================================== */

    const modulo =
        window.MusicalWorldContratacaoAcompanhamentoInterno;


    if (!modulo) {

        console.error(
            "MusicalWorldContratacaoAcompanhamento: módulo interno não encontrado."
        );

        return;
    }


    const {
        estado,
        carregarUsuarioAtual,
        carregarContratacao,
        determinarStatus
    } = modulo;


    const render =
        modulo.render;


    const fluxo =
        modulo.fluxo;


    /* =====================================================
       VERIFICAR DEPENDÊNCIAS
       ===================================================== */

    if (!render) {

        console.error(
            "MusicalWorldContratacaoAcompanhamento: módulo de renderização não encontrado."
        );

        return;
    }


    if (!fluxo) {

        console.error(
            "MusicalWorldContratacaoAcompanhamento: módulo de fluxo não encontrado."
        );

        return;
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        if (
            estado.inicializado
        ) {

            return;
        }


        if (
            estado.carregando
        ) {

            return;
        }


        estado.carregando =
            true;


        try {

            /* ---------------------------------------------
               1. Identificar usuário autenticado
               --------------------------------------------- */

            estado.usuarioId =
                await carregarUsuarioAtual();


            if (!estado.usuarioId) {

                console.error(
                    "MusicalWorldContratacaoAcompanhamento: usuário autenticado não encontrado."
                );


                render.renderizarErro(
                    "Usuário não identificado",
                    "Não foi possível identificar o usuário autenticado."
                );


                return;
            }


            /* ---------------------------------------------
               2. Carregar contratação
               --------------------------------------------- */

            const dados =
                await carregarContratacao();


            if (!dados) {

                console.error(
                    "MusicalWorldContratacaoAcompanhamento: contratação não encontrada ou acesso não permitido."
                );


                render.renderizarErro(
                    "Contratação não encontrada",
                    "Não foi possível localizar os dados desta contratação."
                );


                return;
            }


            /* ---------------------------------------------
               3. Determinar status atual
               --------------------------------------------- */

            const status =
                determinarStatus(
                    dados
                );


            estado.statusAtual =
                status;


            /* ---------------------------------------------
               4. Renderizar dados
               --------------------------------------------- */

            render.renderizarRelacao(
                dados
            );


            render.renderizarParticipante(
                dados
            );


            render.renderizarServico(
                dados.servico
            );


            render.renderizarEvento(
                dados
            );


            render.renderizarStatusPrincipal(
                status
            );


            render.atualizarTimeline(
                status
            );


            render.renderizarPagamento(
                dados.pagamento
            );


            render.renderizarAcaoLiberacaoPagamento(
                dados
            );


            render.renderizarAcoes(
                dados
            );


            render.renderizarAcoesConclusao(
                dados
            );


            /* ---------------------------------------------
               5. Configurar eventos
               --------------------------------------------- */

            fluxo.configurarEventos();


            /* ---------------------------------------------
               6. Atualizar ícones
               --------------------------------------------- */

            render.atualizarIcones();


            /* ---------------------------------------------
               7. Marcar como inicializado
               --------------------------------------------- */

            estado.inicializado =
                true;


            console.log(
                "MusicalWorldContratacaoAcompanhamento: módulo inicializado.",
                estado
            );

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao inicializar página.",
                erro
            );


            render.renderizarErro(
                "Não foi possível carregar a contratação",
                "Ocorreu um erro ao carregar os dados. Verifique sua conexão e tente novamente."
            );

        } finally {

            estado.carregando =
                false;
        }
    }


    /* =====================================================
       RECARREGAR
       ===================================================== */

    async function recarregar() {

        estado.inicializado =
            false;


        estado.dados =
            null;


        estado.direcao =
            null;


        estado.statusAtual =
            "aguardando_artista";


        estado.simulandoEvento =
            false;


        estado.concluindoContratacao =
            false;


        estado.eventosConfigurados =
            false;


        await inicializar();
    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoAcompanhamento = {

        inicializar,


        obterEstado:
            function () {

                return estado;
            },


        atualizarStatus:
            async function (
                novoStatus
            ) {

                return fluxo.atualizarStatus(
                    novoStatus
                );
            },


        simularEvento:
            async function () {

                return fluxo.simularEvento();
            },


        concluir:
            async function () {

                return fluxo.concluir();
            },


        liberarPagamento:
            async function () {

                /*
                 * Mantido para compatibilidade com
                 * código antigo.
                 *
                 * No fluxo atual, a liberação acontece
                 * automaticamente ao concluir.
                 */

                return fluxo.concluir();
            },


        recarregar
    };


    /* =====================================================
       INICIALIZAÇÃO DO DOM
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();
    }


})(window);