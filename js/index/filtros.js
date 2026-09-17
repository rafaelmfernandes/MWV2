/* =========================================================
   MUSICALWORLD — FILTROS DA PÁGINA INICIAL

   Arquivo:
   js/index/filtros.js

   Responsabilidades:
   - Controlar a interface de filtros.
   - Reunir estado, cidade, categoria,
     instrumento e estilo.
   - Enviar os filtros para o MusicalWorldFeed.
   - Permitir limpeza dos filtros.

   IMPORTANTE:
   Este arquivo não consulta o Supabase diretamente.
   O responsável pela consulta continua sendo o feed.js.
========================================================= */

(function (window) {
    "use strict";


    /* =========================================================
       ESTADO DOS FILTROS
    ========================================================= */

    const FILTROS = {

        estado: "",

        cidade: "",

        categoria: "",

        instrumento: "",

        estilo: "",

        inicializado: false
    };


    /* =========================================================
       NORMALIZAÇÃO
    ========================================================= */

    function normalizarFiltros(
        filtros = {}
    ) {

        return {

            estado:
                filtros.estado || "",

            cidade:
                filtros.cidade || "",

            categoria:
                filtros.categoria || "",

            instrumento:
                filtros.instrumento || "",

            estilo:
                filtros.estilo || ""
        };
    }


    /* =========================================================
       ATUALIZAR FILTROS
    ========================================================= */

    function definirFiltros(
        filtros = {}
    ) {

        const novosFiltros =
            normalizarFiltros(
                filtros
            );


        FILTROS.estado =
            novosFiltros.estado;

        FILTROS.cidade =
            novosFiltros.cidade;

        FILTROS.categoria =
            novosFiltros.categoria;

        FILTROS.instrumento =
            novosFiltros.instrumento;

        FILTROS.estilo =
            novosFiltros.estilo;


        if (
            window.MusicalWorldFeed
        ) {

            window.MusicalWorldFeed.definirFiltros(
                FILTROS
            );
        }
    }


    /* =========================================================
       LIMPAR FILTROS
    ========================================================= */

    function limpar() {

        FILTROS.estado = "";

        FILTROS.cidade = "";

        FILTROS.categoria = "";

        FILTROS.instrumento = "";

        FILTROS.estilo = "";


        if (
            window.MusicalWorldFeed
        ) {

            window.MusicalWorldFeed.definirFiltros(
                FILTROS
            );
        }
    }


    /* =========================================================
       OBTER FILTROS
    ========================================================= */

    function obter() {

        return {
            ...FILTROS
        };
    }


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    function inicializar() {

        if (
            FILTROS.inicializado
        ) {
            return;
        }

        FILTROS.inicializado =
            true;

        /*
         * A integração com os elementos específicos
         * do HTML pode ser adicionada aqui depois
         * de analisarmos o seu filtro atual.
         */
    }


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    window.MusicalWorldFiltros = {

        inicializar,

        definir:
            definirFiltros,

        limpar,

        obter
    };


})(window);