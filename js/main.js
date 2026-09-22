/* =========================================================
   MUSICALWORLD — FEED PRINCIPAL

   Arquivo:
   js/index/main.js

   Responsabilidades:
   - Inicializar o feed principal.
   - Controlar os filtros aplicados ao feed.
   - Consultar os profissionais no Supabase.
   - Entregar os dados para o módulo anuncio.js.
   - Atualizar os elementos gerais da interface do feed.
   - Coordenar os módulos anuncio.js e paginacao.js.

   Este arquivo NÃO é responsável por:
   - Controlar paginação diretamente.
   - Controlar IntersectionObserver.
   - Controlar o aviso do feed.
   - Criar HTML interno dos anúncios.
   - Controlar vídeos.
   - Controlar ações sociais.
   - Controlar menu dos anúncios.
   - Controlar identidade visual dos anúncios.

   Módulos utilizados:
   - anuncio.js
   - paginacao.js
   - aviso.js
   - núcleo compartilhado do Supabase

   IMPORTANTE:
   Os módulos anuncio.js, paginacao.js e aviso.js
   devem ser carregados antes deste arquivo.
========================================================= */

(function (window) {
    "use strict";


    /* =====================================================
       CONFIGURAÇÃO GERAL DO FEED
    ===================================================== */

    const FEED_CONFIG = {

        filtros: {

            estado: "",
            cidade: "",
            categoria: "",
            instrumento: "",
            estilo: "",

            /*
             * Filtros de valor dos serviços.
             *
             * null significa que o respectivo limite
             * não foi informado.
             */
            valorMin: null,
            valorMax: null

        },

        inicializado: false

    };


    /* =====================================================
       REFERÊNCIAS DOS ELEMENTOS DA PÁGINA
    ===================================================== */

    let feedContainer = null;
    let loadingElement = null;
    let endElement = null;
    let emptyElement = null;
    let sentinelElement = null;
    let counterElement = null;


    /* =====================================================
       OBTER MÓDULO DE ANÚNCIOS
    ===================================================== */

    function obterModuloAnuncio() {

        return window.MusicalWorldAnuncio || null;

    }


    /* =====================================================
       OBTER MÓDULO DE PAGINAÇÃO
    ===================================================== */

    function obterModuloPaginacao() {

        return window.MusicalWorldPaginacao || null;

    }


    /* =====================================================
       NORMALIZAR FILTROS
    ===================================================== */

    function normalizarFiltros(filtros = {}) {

        const valorMin =
            filtros.valorMin !== null &&
            filtros.valorMin !== undefined &&
            filtros.valorMin !== ""
                ? Number(filtros.valorMin)
                : null;


        const valorMax =
            filtros.valorMax !== null &&
            filtros.valorMax !== undefined &&
            filtros.valorMax !== ""
                ? Number(filtros.valorMax)
                : null;


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
                filtros.estilo || "",

            valorMin:
                Number.isFinite(valorMin)
                    ? valorMin
                    : null,

            valorMax:
                Number.isFinite(valorMax)
                    ? valorMax
                    : null

        };

    }


    /* =====================================================
       VERIFICAR SE EXISTEM FILTROS ATIVOS
    ===================================================== */

    function existemFiltrosAtivos() {

        return Object.values(
            FEED_CONFIG.filtros
        ).some(valor => {

            /*
             * Valores numéricos precisam ser considerados
             * somente quando realmente foram informados.
             */
            if (
                valor !== null &&
                typeof valor === "number"
            ) {

                return true;

            }


            return String(
                valor || ""
            ).trim() !== "";

        });

    }


    /* =====================================================
       OBTER CLIENTE SUPABASE

       O projeto possui um núcleo compartilhado para isso.
       Não colocamos URL ou credenciais neste arquivo.
    ===================================================== */

    function obterSupabase() {

        return (

            window.MusicalWorldSupabase?.getClient?.() ||

            window.supabaseClient ||

            window.supabase ||

            null

        );

    }


    /* =====================================================
       CARREGAR UMA PÁGINA DE PROFISSIONAIS

       Esta função é chamada pelo paginacao.js.

       O paginacao.js envia:
       {
           pagina,
           limite,
           offset
       }

       Este arquivo fica responsável apenas pela consulta
       e pela entrega dos profissionais ao anuncio.js.
    ===================================================== */

    async function carregarPaginaProfissionais(
        dadosPaginacao = {}
    ) {

        if (!feedContainer) {

            return {
                quantidade: 0,
                acabou: true
            };

        }


        const anuncio =
            obterModuloAnuncio();


        if (!anuncio) {

            console.error(
                "MusicalWorld Feed: módulo anuncio.js não encontrado."
            );

            return {
                quantidade: 0,
                acabou: true
            };

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            console.error(
                "MusicalWorld Feed: cliente Supabase não encontrado."
            );

            return {
                quantidade: 0,
                acabou: true
            };

        }


        const limite =
            Number(
                dadosPaginacao.limite
            ) || 12;


        const offset =
            Number(
                dadosPaginacao.offset
            ) || 0;


        mostrarElemento(
            loadingElement
        );


        try {

            const filtros =
                normalizarFiltros(
                    FEED_CONFIG.filtros
                );


            /* =============================================
               CONSULTA AO SUPABASE
            ============================================= */

            const {
                data,
                error
            } = await supabase.rpc(
                "buscar_profissionais_filtrados",
                {

                    p_estado:
                        filtros.estado || null,

                    p_cidade:
                        filtros.cidade || null,

                    p_categoria:
                        filtros.categoria || null,

                    p_instrumento:
                        filtros.instrumento || null,

                    p_estilo:
                        filtros.estilo || null,

                    /*
                     * Filtros de valor dos serviços.
                     *
                     * O banco verifica se existe pelo menos
                     * um serviço ativo do profissional dentro
                     * da faixa informada.
                     */
                    p_valor_min:
                        filtros.valorMin,

                    p_valor_max:
                        filtros.valorMax,

                    p_limite:
                        limite,

                    p_offset:
                        offset

                }
            );


            if (error) {

                throw error;

            }


            const profissionais =
                Array.isArray(data)
                    ? data
                    : [];


            /* =============================================
               CRIAR ANÚNCIOS
            ============================================= */

            profissionais.forEach(
                perfil => {

                    const artista =
                        anuncio.obterArtista(
                            perfil
                        );


                    const destaque =
                        anuncio.obterDestaque(
                            perfil
                        );


                    const card =
                        anuncio.criar(
                            perfil,
                            artista,
                            destaque
                        );


                    if (card) {

                        feedContainer.appendChild(
                            card
                        );

                    }

                }
            );


            /* =============================================
               ATUALIZAR CONTADOR
            ============================================= */

            atualizarContador();


            /* =============================================
               ATUALIZAR VÍDEOS
            ============================================= */

            if (
                typeof anuncio.observarVideos ===
                "function"
            ) {

                anuncio.observarVideos();

            }


            /* =============================================
               VERIFICAR FIM DO FEED
            ============================================= */

            const acabou =
                profissionais.length < limite;


            if (
                !feedContainer.children.length &&
                acabou
            ) {

                mostrarElemento(
                    emptyElement
                );

            }


            if (acabou) {

                mostrarElemento(
                    endElement
                );

            } else {

                esconderElemento(
                    endElement
                );

            }


            return {

                quantidade:
                    profissionais.length,

                acabou

            };


        } catch (erro) {

            console.error(
                "MusicalWorld Feed: erro ao carregar profissionais.",
                erro
            );


            return {

                quantidade: 0,

                acabou: true

            };

        } finally {

            esconderElemento(
                loadingElement
            );

        }

    }


    /* =====================================================
       RECARREGAR FEED DESDE A PRIMEIRA PÁGINA
    ===================================================== */

    async function carregarProfissionaisInicio() {

        const paginacao =
            obterModuloPaginacao();


        if (!paginacao) {

            console.error(
                "MusicalWorld Feed: módulo paginacao.js não encontrado."
            );

            return;

        }


        if (!feedContainer) {
            return;
        }


        /* =============================================
           LIMPAR FEED ATUAL
        ============================================= */

        feedContainer.innerHTML = "";


        esconderElemento(
            endElement
        );


        esconderElemento(
            emptyElement
        );


        /* =============================================
           REINICIAR PAGINAÇÃO
        ============================================= */

        paginacao.reiniciar();


        /* =============================================
           CARREGAR PRIMEIRA PÁGINA
        ============================================= */

        await paginacao.carregarProximaPagina();

    }


    /* =====================================================
       ATUALIZAR CONTADOR
    ===================================================== */

    function atualizarContador() {

        if (!counterElement) {
            return;
        }


        const quantidade =
            feedContainer
                ? feedContainer.children.length
                : 0;


        if (!quantidade) {

            counterElement.textContent = "";

            return;

        }


        counterElement.textContent =
            `${quantidade} profissional${
                quantidade === 1
                    ? ""
                    : "is"
            }`;

    }


    /* =====================================================
       MOSTRAR ELEMENTO
    ===================================================== */

    function mostrarElemento(elemento) {

        if (!elemento) {
            return;
        }


        elemento.hidden = false;

        elemento.style.display = "";

    }


    /* =====================================================
       ESCONDER ELEMENTO
    ===================================================== */

    function esconderElemento(elemento) {

        if (!elemento) {
            return;
        }


        elemento.hidden = true;

        elemento.style.display = "none";

    }


    /* =====================================================
       INICIALIZAR FEED
    ===================================================== */

    async function inicializarFeed() {

        if (FEED_CONFIG.inicializado) {
            return;
        }


        FEED_CONFIG.inicializado = true;


        /* =============================================
           BUSCAR ELEMENTOS DO DOM
        ============================================= */

        feedContainer =
            document.querySelector(
                "#feed-profissionais"
            );


        loadingElement =
            document.querySelector(
                "#feed-loading"
            );


        endElement =
            document.querySelector(
                "#feed-fim"
            );


        emptyElement =
            document.querySelector(
                "#feed-vazio"
            );


        sentinelElement =
            document.querySelector(
                "#feed-sentinel"
            );


        counterElement =
            document.querySelector(
                "#feed-contador"
            );


        if (!feedContainer) {

            console.warn(
                "MusicalWorld Feed: container #feed-profissionais não encontrado."
            );

            return;

        }


        /* =============================================
           VERIFICAR MÓDULO DE ANÚNCIO
        ============================================= */

        const anuncio =
            obterModuloAnuncio();


        if (!anuncio) {

            console.error(
                "MusicalWorld Feed: anuncio.js não foi carregado antes de main.js."
            );

            return;

        }


        /* =============================================
           VERIFICAR MÓDULO DE PAGINAÇÃO
        ============================================= */

        const paginacao =
            obterModuloPaginacao();


        if (!paginacao) {

            console.error(
                "MusicalWorld Feed: paginacao.js não foi carregado antes de main.js."
            );

            return;

        }


        /* =============================================
           ESTADO INICIAL DA INTERFACE
        ============================================= */

        esconderElemento(
            endElement
        );


        esconderElemento(
            emptyElement
        );


        /* =============================================
           INICIALIZAR VÍDEOS
        ============================================= */

        if (
            typeof anuncio.inicializarVideos ===
            "function"
        ) {

            anuncio.inicializarVideos();

        }


        if (
            typeof anuncio.configurarVisibilidadeVideos ===
            "function"
        ) {

            anuncio.configurarVisibilidadeVideos();

        }


        if (
            typeof anuncio.configurarScrollVideos ===
            "function"
        ) {

            anuncio.configurarScrollVideos();

        }


        /* =============================================
           INICIALIZAR PAGINAÇÃO
        ============================================= */

        paginacao.inicializar({

            sentinel:
                sentinelElement,

            limitePorPagina:
                12,

            callbackCarregar:
                carregarPaginaProfissionais

        });


        /* =============================================
           CARREGAR PRIMEIRA PÁGINA
        ============================================= */

        await carregarProfissionaisInicio();

    }


    /* =====================================================
       API PÚBLICA DO FEED
    ===================================================== */

    window.MusicalWorldFeed = {

        inicializar:
            inicializarFeed,


        recarregar:
            carregarProfissionaisInicio,


        carregarMais: () => {

            const paginacao =
                obterModuloPaginacao();


            if (
                paginacao &&
                typeof paginacao.carregarProximaPagina ===
                "function"
            ) {

                return paginacao.carregarProximaPagina();

            }

        },


        definirFiltros:
            filtros => {

                FEED_CONFIG.filtros =
                    normalizarFiltros(
                        filtros
                    );


                console.log(
                    "🔎 MusicalWorldFeed — filtros recebidos:",
                    FEED_CONFIG.filtros
                );


                return carregarProfissionaisInicio();

            },


        obterFiltros:
            () => {

                return {
                    ...FEED_CONFIG.filtros
                };

            },


        existemFiltrosAtivos:
            existemFiltrosAtivos,


        atualizarVideos:
            () => {

                const anuncio =
                    obterModuloAnuncio();


                if (
                    anuncio &&
                    typeof anuncio.atualizarVideos ===
                    "function"
                ) {

                    anuncio.atualizarVideos();

                }

            }

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializarFeed,
            {
                once: true
            }
        );

    } else {

        inicializarFeed();

    }


})(window);