/* =========================================================
   MUSICALWORLD — CONTROLADOR DA GESTÃO DE INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados.js

   Responsabilidade:

   - Inicializar a página.
   - Carregar os dados.
   - Coordenar Dados, Render e Fluxo.
   - Controlar carregamento e erros.
   - Controlar a navegação para edição da oportunidade.
   - Não concentrar regras de banco ou HTML neste arquivo.

   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       REFERÊNCIAS
       ===================================================== */

    const Dados =
        window.MusicalWorldOportunidadeInteressadosDados;


    const Render =
        window.MusicalWorldOportunidadeInteressadosRender;


    const Fluxo =
        window.MusicalWorldOportunidadeInteressadosFluxo;


    /* =====================================================
       VALIDAR MÓDULOS
       ===================================================== */

    function validarModulos() {

        if (!Dados) {

            throw new Error(
                "Módulo de dados dos interessados não encontrado."
            );

        }


        if (!Render) {

            throw new Error(
                "Módulo de renderização dos interessados não encontrado."
            );

        }


        if (!Fluxo) {

            throw new Error(
                "Módulo de fluxo dos interessados não encontrado."
            );

        }

    }


    /* =====================================================
       CARREGAR PÁGINA
       ===================================================== */

    async function carregarPagina() {

        validarModulos();


        Render.mostrarEstado(
            "carregando"
        );


        try {

            const estado =
                await Dados.carregarTudo();


            Render.definirEstado(
                estado
            );


            Render.renderizarOportunidade(
                estado.oportunidade,
                estado.estabelecimento
            );


            Render.renderizarLista();


            Render.mostrarEstado(
                "conteudo"
            );


            Fluxo.inicializar(
                estado
            );


            Fluxo.registrarEventos();


            registrarBotaoEditar(
                estado
            );


        } catch (erro) {

            console.error(
                "MusicalWorld — erro na gestão dos interessados:",
                erro
            );


            Render.mostrarErro(
                erro?.message ||
                "Não foi possível carregar a gestão desta oportunidade."
            );

        }

    }


    /* =====================================================
       BOTÃO EDITAR OPORTUNIDADE
       =====================================================

       Responsabilidade:

       - Ler o ID da oportunidade carregada.
       - Direcionar para criar-oportunidade.html.
       - Informar que a página deve abrir em modo edição.

       ===================================================== */

    function registrarBotaoEditar(
        estado
    ) {

        const botao =
            document.getElementById(
                "btnEditarOportunidade"
            );


        if (!botao) {

            return;

        }


        const oportunidade =
            estado?.oportunidade;


        const oportunidadeId =
            oportunidade?.id;


        if (!oportunidadeId) {

            console.warn(
                "MusicalWorld — ID da oportunidade não encontrado para edição."
            );

            return;

        }


        botao.addEventListener(
            "click",
            () => {

                const url =
                    `criar-oportunidade.html?id=${encodeURIComponent(
                        oportunidadeId
                    )}&modo=editar`;


                window.location.href =
                    url;

            }
        );

    }


    /* =====================================================
       TENTAR NOVAMENTE
       ===================================================== */

    function registrarBotaoRetry() {

        const botao =
            document.getElementById(
                "btnTentarNovamente"
            );


        if (!botao) {

            return;

        }


        botao.addEventListener(
            "click",
            carregarPagina
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function iniciar() {

        registrarBotaoRetry();

        await carregarPagina();

    }


    /* =====================================================
       DOM READY
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            {
                once: true
            }
        );

    } else {

        iniciar();

    }

})();