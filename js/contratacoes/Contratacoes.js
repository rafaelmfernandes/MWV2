/* =========================================================
   MUSICALWORLD — CONTROLADOR DA CENTRAL DE CONTRATAÇÕES

   Arquivo:
   js/contratacoes/contratacoes.js

   Responsabilidade:

   - Inicializar a Central.
   - Controlar estado.
   - Carregar contratações.
   - Controlar filtros.
   - Controlar busca.
   - Controlar ordenação.
   - Controlar navegação.
   - Controlar eventos.
   - Abrir proposta ou contratação.

   Módulos utilizados:

   js/contratacoes/ContratacoesDados.js
   js/contratacoes/ContratacoesRender.js
========================================================= */

(function (window) {

    "use strict";


    const Dados =
        window.MusicalWorldContratacoesDados;


    const Render =
        window.MusicalWorldContratacoesRender;


    if (!Dados || !Render) {

        console.error(
            "MusicalWorld — módulos da Central de Contratações não foram carregados."
        );

        return;

    }


    const CONFIG =
        Dados.CONFIG;


    /* =====================================================
       ESTADO
    ====================================================== */

    const estado = {

        contratacoes: [],

        contratacoesFiltradas: [],

        filtroAtual:
            "todas",

        buscaAtual:
            "",

        ordenacao:
            "recentes",

        usuarioId:
            null,

        tipoPerfil:
            null,

        usuarioEhEstabelecimento:
            false,

        centralArea:
            "contratacoes",

        carregando:
            false,

        erro:
            null,

        inicializado:
            false

    };


    /* =====================================================
       UTILITÁRIOS
    ====================================================== */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       CONFIGURAR CENTRAL
    ====================================================== */

    function configurarCentral() {

        const botaoOportunidades =
            obterElemento(
                CONFIG.seletores
                    .btnCentralOportunidades
            );


        const titulo =
            obterElemento(
                CONFIG.seletores
                    .centralOportunidadesTitulo
            );


        const descricao =
            obterElemento(
                CONFIG.seletores
                    .centralOportunidadesDescricao
            );


        const icone =
            obterElemento(
                CONFIG.seletores
                    .centralOportunidadesIcone
            );


        if (!botaoOportunidades) {

            return;

        }


        botaoOportunidades.hidden =
            false;


        if (
            estado.usuarioEhEstabelecimento
        ) {

            if (titulo) {

                titulo.textContent =
                    "Minhas oportunidades";

            }


            if (descricao) {

                descricao.textContent =
                    "Gerencie oportunidades e interessados";

            }

        } else {

            if (titulo) {

                titulo.textContent =
                    "Fui selecionado";

            }


            if (descricao) {

                descricao.textContent =
                    "Oportunidades em que você foi selecionado";

            }

        }


        if (icone) {

            icone.setAttribute(
                "data-lucide",
                "target"
            );

        }

    }


    /* =====================================================
       CABEÇALHO
    ====================================================== */

    function atualizarCabecalho() {

        const titulo =
            document.querySelector(
                ".page-header h1"
            );


        const descricao =
            document.querySelector(
                ".page-header p"
            );


        if (titulo) {

            titulo.textContent =
                "Contratações";

        }


        if (descricao) {

            descricao.textContent =
                "Acompanhe solicitações, contratações e oportunidades selecionadas em um só lugar.";

        }


        const campoBusca =
            obterElemento(
                CONFIG.seletores.campoBusca
            );


        if (campoBusca) {

            campoBusca.placeholder =
                "Buscar pessoa, evento ou oportunidade...";

        }

    }


    /* =====================================================
       FILTRO
    ====================================================== */

    function definirFiltro(
        filtro
    ) {

        estado.centralArea =
            "contratacoes";


        estado.filtroAtual =
            filtro || "todas";


        const titulo =
            document.querySelector(
                ".lista-header h2"
            );


        if (titulo) {

            titulo.textContent =

                estado.filtroAtual ===
                    "recebidas"

                    ? "Solicitações recebidas"

                    : estado.filtroAtual ===
                        "enviadas"

                        ? "Solicitações enviadas"

                        : estado.filtroAtual ===
                            "oportunidades"

                            ? "Fui selecionado"

                            : "Suas contratações";

        }


        Render.atualizarFiltroVisual(
            estado.filtroAtual
        );


        Render.atualizarCentralVisual(
            estado.centralArea
        );


        Render.renderizarLista(
            estado
        );

    }


    /* =====================================================
       CENTRAL — CONTRATAÇÕES
    ====================================================== */

    function abrirCentralContratacoes() {

        estado.centralArea =
            "contratacoes";


        if (
            estado.filtroAtual ===
            "oportunidades"
        ) {

            estado.filtroAtual =
                "todas";

        }


        const titulo =
            document.querySelector(
                ".lista-header h2"
            );


        if (titulo) {

            titulo.textContent =
                "Suas contratações";

        }


        Render.atualizarCentralVisual(
            estado.centralArea
        );


        Render.atualizarFiltroVisual(
            estado.filtroAtual
        );


        Render.renderizarLista(
            estado
        );

    }


    /* =====================================================
       CENTRAL — OPORTUNIDADES
    ====================================================== */

    function abrirCentralOportunidades() {

        /*
         * ESTABELECIMENTO
         *
         * Possui página própria para gerenciamento
         * das oportunidades criadas.
         */

        if (
            estado.usuarioEhEstabelecimento
        ) {

            window.location.href =
                CONFIG.paginas
                    .minhasOportunidades;

            return;

        }


        /*
         * ARTISTA
         *
         * Não criamos outra consulta.
         *
         * O contrato originado da oportunidade já está
         * dentro da lista principal.
         */

        estado.centralArea =
            "oportunidades";


        estado.filtroAtual =
            "oportunidades";


        const titulo =
            document.querySelector(
                ".lista-header h2"
            );


        if (titulo) {

            titulo.textContent =
                "Fui selecionado";

        }


        Render.atualizarCentralVisual(
            estado.centralArea
        );


        Render.atualizarFiltroVisual(
            estado.filtroAtual
        );


        Render.renderizarLista(
            estado
        );

    }


    /* =====================================================
       BUSCA
    ====================================================== */

    function atualizarBusca(
        valor
    ) {

        estado.buscaAtual =
            String(
                valor || ""
            ).trim();


        const botaoLimpar =
            obterElemento(
                CONFIG.seletores
                    .btnLimparBusca
            );


        if (botaoLimpar) {

            botaoLimpar.hidden =
                !estado.buscaAtual;

        }


        Render.renderizarLista(
            estado
        );

    }


    function limparBusca() {

        const campo =
            obterElemento(
                CONFIG.seletores
                    .campoBusca
            );


        if (campo) {

            campo.value =
                "";

        }


        atualizarBusca("");

    }


    function limparFiltros() {

        estado.centralArea =
            "contratacoes";


        estado.filtroAtual =
            "todas";


        estado.buscaAtual =
            "";


        const campo =
            obterElemento(
                CONFIG.seletores
                    .campoBusca
            );


        if (campo) {

            campo.value =
                "";

        }


        const botaoLimpar =
            obterElemento(
                CONFIG.seletores
                    .btnLimparBusca
            );


        if (botaoLimpar) {

            botaoLimpar.hidden =
                true;

        }


        const titulo =
            document.querySelector(
                ".lista-header h2"
            );


        if (titulo) {

            titulo.textContent =
                "Suas contratações";

        }


        Render.atualizarCentralVisual(
            estado.centralArea
        );


        Render.atualizarFiltroVisual(
            estado.filtroAtual
        );


        Render.renderizarLista(
            estado
        );

    }


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    function alternarOrdenacao() {

        const opcoes = [

            {
                chave:
                    "recentes",

                texto:
                    "Mais recentes"

            },

            {
                chave:
                    "antigas",

                texto:
                    "Mais antigas"

            },

            {
                chave:
                    "valor_maior",

                texto:
                    "Maior valor"

            },

            {
                chave:
                    "valor_menor",

                texto:
                    "Menor valor"

            }

        ];


        const indiceAtual =
            opcoes.findIndex(
                function (opcao) {

                    return (
                        opcao.chave ===
                        estado.ordenacao
                    );

                }
            );


        const proximoIndice =
            (
                indiceAtual + 1
            ) %
            opcoes.length;


        const proximaOpcao =
            opcoes[
                proximoIndice
            ];


        estado.ordenacao =
            proximaOpcao.chave;


        const botao =
            obterElemento(
                CONFIG.seletores
                    .btnOrdenacao
            );


        if (botao) {

            const texto =
                botao.querySelector(
                    "span"
                );


            if (texto) {

                texto.textContent =
                    proximaOpcao.texto;

            }

        }


        Render.renderizarLista(
            estado
        );

    }


    /* =====================================================
       ABRIR CONTRATAÇÃO / PROPOSTA
    ====================================================== */

    function abrirContratacao(
        id
    ) {

        const contratacao =
            estado.contratacoes.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(id)
                    );

                }
            );


        if (!contratacao) {

            console.warn(
                "MusicalWorld — contratação não encontrada:",
                id
            );

            return;

        }


        try {

            sessionStorage.setItem(

                CONFIG.armazenamento
                    .chaveContratacao,

                JSON.stringify(
                    contratacao
                )

            );

        } catch (erro) {

            console.warn(
                "MusicalWorld — não foi possível salvar a contratação selecionada.",
                erro
            );

        }


        /*
         * PROPOSTA RECEBIDA
         */

        if (
            contratacao.propostaRecebida ===
            true
        ) {

            window.location.href =
                `${CONFIG.paginas.proposta}?id=${encodeURIComponent(
                    contratacao.id
                )}`;

            return;

        }


        /*
         * PROPOSTA ENVIADA
         */

        if (
            contratacao.propostaEnviada ===
            true
        ) {

            window.location.href =
                `${CONFIG.paginas.proposta}?id=${encodeURIComponent(
                    contratacao.id
                )}`;

            return;

        }


        /*
         * CONTRATAÇÃO NORMAL
         */

        window.location.href =
            `${CONFIG.paginas.acompanhamento}?id=${encodeURIComponent(
                contratacao.id
            )}`;

    }


    /* =====================================================
       CARREGAR CONTRATAÇÕES
    ====================================================== */

    async function carregarContratacoes() {

        if (
            !window.supabaseClient ||
            typeof window.supabaseClient.from !==
                "function"
        ) {

            estado.erro =
                "Cliente Supabase não encontrado.";


            estado.contratacoes =
                [];


            Render.atualizarResumo(
                estado.contratacoes
            );


            Render.renderizarLista(
                estado
            );


            console.error(
                "MusicalWorld — window.supabaseClient não encontrado."
            );


            return;

        }


        estado.carregando =
            true;


        estado.erro =
            null;


        try {

            const dadosUsuario =
                await UsuarioAtual.obter();


            if (!dadosUsuario) {

                console.warn(
                    "MusicalWorld — nenhum usuário autenticado."
                );


                estado.usuarioId =
                    null;


                estado.contratacoes =
                    [];


                Render.atualizarResumo(
                    estado.contratacoes
                );


                Render.renderizarLista(
                    estado
                );


                return;

            }


            estado.usuarioId =
                dadosUsuario.auth.id;


            estado.tipoPerfil =
                dadosUsuario.tipoPerfil ||
                null;


            estado.usuarioEhEstabelecimento =
                Dados.ehEstabelecimento({

                    tipoPerfil:
                        estado.tipoPerfil,

                    tipo:
                        estado.tipoPerfil?.nome

                });


            configurarCentral();


            const [
                respostaRealizadas,
                respostaRecebidas
            ] = await Promise.all([

                supabaseClient

                    .from(
                        CONFIG.tabelas
                            .contratacoes
                    )

                    .select("*")

                    .eq(
                        "contratante_id",
                        estado.usuarioId
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    ),


                supabaseClient

                    .from(
                        CONFIG.tabelas
                            .contratacoes
                    )

                    .select("*")

                    .eq(
                        "contratado_id",
                        estado.usuarioId
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    )

            ]);


            if (
                respostaRealizadas.error
            ) {

                throw respostaRealizadas.error;

            }


            if (
                respostaRecebidas.error
            ) {

                throw respostaRecebidas.error;

            }


            const registrosRealizados =
                respostaRealizadas.data ||
                [];


            const registrosRecebidos =
                respostaRecebidas.data ||
                [];


            const registrosMap =
                new Map();


            registrosRealizados.forEach(
                function (registro) {

                    registrosMap.set(
                        String(registro.id),
                        registro
                    );

                }
            );


            registrosRecebidos.forEach(
                function (registro) {

                    registrosMap.set(
                        String(registro.id),
                        registro
                    );

                }
            );


            const registros =
                Array.from(
                    registrosMap.values()
                );


            const contratosConvertidos =
                await Promise.all(

                    registros.map(
                        function (registro) {

                            return Dados.transformarContratacao(

                                supabaseClient,

                                registro,

                                estado.usuarioId

                            );

                        }
                    )

                );


            contratosConvertidos.sort(
                function (a, b) {

                    return (

                        new Date(
                            b.createdAt
                        ) -

                        new Date(
                            a.createdAt
                        )

                    );

                }
            );


            estado.contratacoes =
                contratosConvertidos;


            try {

                sessionStorage.setItem(

                    CONFIG.armazenamento
                        .chaveLista,

                    JSON.stringify(
                        estado.contratacoes
                    )

                );

            } catch (erro) {

                console.warn(
                    "MusicalWorld — não foi possível armazenar a lista localmente.",
                    erro
                );

            }


            Render.atualizarResumo(
                estado.contratacoes
            );


            Render.renderizarLista(
                estado
            );


        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao carregar contratações:",
                erro
            );


            estado.erro =
                erro;


            estado.contratacoes =
                [];


            Render.atualizarResumo(
                estado.contratacoes
            );


            Render.renderizarLista(
                estado
            );


        } finally {

            estado.carregando =
                false;

        }

    }


    /* =====================================================
       EVENTOS
    ====================================================== */

    function configurarEventos() {

        /*
         * FILTROS
         */

        document

            .querySelectorAll(
                CONFIG.seletores.filtros
            )

            .forEach(
                function (botao) {

                    botao.addEventListener(
                        "click",
                        function () {

                            definirFiltro(
                                botao.dataset.filtro
                            );

                        }
                    );

                }
            );


        /*
         * INDICADORES
         */

        document

            .querySelectorAll(
                CONFIG.seletores.cardsResumo
            )

            .forEach(
                function (card) {

                    card.addEventListener(
                        "click",
                        function () {

                            definirFiltro(
                                card.dataset.filtro
                            );

                        }
                    );

                }
            );


        /*
         * CENTRAL — CONTRATAÇÕES
         */

        const btnCentralContratacoes =
            obterElemento(
                CONFIG.seletores
                    .btnCentralContratacoes
            );


        if (
            btnCentralContratacoes
        ) {

            btnCentralContratacoes.addEventListener(
                "click",
                abrirCentralContratacoes
            );

        }


        /*
         * CENTRAL — OPORTUNIDADES
         */

        const btnCentralOportunidades =
            obterElemento(
                CONFIG.seletores
                    .btnCentralOportunidades
            );


        if (
            btnCentralOportunidades
        ) {

            btnCentralOportunidades.addEventListener(
                "click",
                abrirCentralOportunidades
            );

        }


        /*
         * BUSCA
         */

        const campoBusca =
            obterElemento(
                CONFIG.seletores
                    .campoBusca
            );


        if (
            campoBusca
        ) {

            campoBusca.addEventListener(
                "input",
                function () {

                    atualizarBusca(
                        campoBusca.value
                    );

                }
            );

        }


        const btnLimparBusca =
            obterElemento(
                CONFIG.seletores
                    .btnLimparBusca
            );


        if (
            btnLimparBusca
        ) {

            btnLimparBusca.addEventListener(
                "click",
                limparBusca
            );

        }


        const btnLimparFiltros =
            obterElemento(
                CONFIG.seletores
                    .btnLimparFiltros
            );


        if (
            btnLimparFiltros
        ) {

            btnLimparFiltros.addEventListener(
                "click",
                limparFiltros
            );

        }


        /*
         * ORDENAÇÃO
         */

        const btnOrdenacao =
            obterElemento(
                CONFIG.seletores
                    .btnOrdenacao
            );


        if (
            btnOrdenacao
        ) {

            btnOrdenacao.addEventListener(
                "click",
                alternarOrdenacao
            );

        }


        /*
         * CARD INTEIRO
         *
         * O botão interno continua funcionando.
         * No mobile, qualquer região do card abre a contratação.
         */

        const lista =
            obterElemento(
                CONFIG.seletores.lista
            );


        if (
            lista
        ) {

            lista.addEventListener(
                "click",
                function (evento) {

                    const botao =
                        evento.target.closest(
                            "[data-contratacao-id]"
                        );


                    if (botao) {

                        abrirContratacao(
                            botao.dataset
                                .contratacaoId
                        );

                        return;

                    }


                    const card =
                        evento.target.closest(
                            ".contratacao-card"
                        );


                    if (!card) {

                        return;

                    }


                    abrirContratacao(
                        card.dataset.id
                    );

                }
            );


            lista.addEventListener(
                "keydown",
                function (evento) {

                    if (
                        evento.key !== "Enter" &&
                        evento.key !== " "
                    ) {

                        return;

                    }


                    const card =
                        evento.target.closest(
                            ".contratacao-card"
                        );


                    if (!card) {

                        return;

                    }


                    evento.preventDefault();


                    abrirContratacao(
                        card.dataset.id
                    );

                }
            );

        }


        /*
         * VOLTAR
         */

        const btnVoltar =
            obterElemento(
                CONFIG.seletores
                    .btnVoltar
            );


        if (
            btnVoltar
        ) {

            btnVoltar.addEventListener(
                "click",
                function () {

                    if (
                        window.history.length > 1
                    ) {

                        window.history.back();

                    } else {

                        window.location.href =
                            CONFIG.paginas.inicio;

                    }

                }
            );

        }


        /*
         * INÍCIO
         */

        const btnInicio =
            obterElemento(
                CONFIG.seletores
                    .btnInicio
            );


        if (
            btnInicio
        ) {

            btnInicio.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.inicio;

                }
            );

        }


        /*
         * PERFIL
         */

        const btnPerfil =
            obterElemento(
                CONFIG.seletores
                    .btnPerfil
            );


        if (
            btnPerfil
        ) {

            btnPerfil.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.perfil;

                }
            );

        }


        /*
         * NOVA CONTRATAÇÃO
         *
         * Mantido apenas para compatibilidade.
         * O botão atualmente não existe no HTML.
         */

        const btnNovaContratacao =
            obterElemento(
                CONFIG.seletores
                    .btnNovaContratacao
            );


        if (
            btnNovaContratacao
        ) {

            btnNovaContratacao.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas
                            .novaContratacao;

                }
            );

        }

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    async function inicializar() {

        if (
            estado.inicializado
        ) {

            return;

        }


        estado.inicializado =
            true;


        configurarEventos();

        atualizarCabecalho();


        Render.atualizarCentralVisual(
            estado.centralArea
        );


        Render.atualizarFiltroVisual(
            estado.filtroAtual
        );


        await carregarContratacoes();


        configurarCentral();


        Render.atualizarCentralVisual(
            estado.centralArea
        );


        if (
            window.lucide
        ) {

            window.lucide.createIcons();

        }


        console.log(
            "MusicalWorld — Central de Contratações inicializada."
        );

    }


    /* =====================================================
       API PÚBLICA
    ====================================================== */

    window.MusicalWorldContratacoes = {

        inicializar,

        carregarContratacoes,

        definirFiltro,

        atualizarBusca,

        limparFiltros,

        abrirContratacao,

        abrirCentralContratacoes,

        abrirCentralOportunidades,

        obterEstado:
            function () {

                return estado;

            },

        obterContratacoes:
            function () {

                return estado.contratacoes;

            }

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                inicializar();

            }
        );

    } else {

        inicializar();

    }


})(window);