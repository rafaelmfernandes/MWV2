/* =========================================================
   MUSICALWORLD — MEU PERFIL UNIVERSAL

   Arquivo:
   js/PerfilPublico.js

   Responsabilidade:

   - Controlar a página "Meu Perfil".
   - Inicializar o perfil.
   - Carregar os dados através do PerfilPublicoDados.
   - Controlar as abas.
   - Acionar os módulos de portfólio, serviços, agenda
     e avaliações.
   - Controlar navegação.
   - Controlar WhatsApp.
   - Controlar QR Code.
   - Construir links públicos.
   - Manter o estado geral da página.

   Renderização:

   js/PerfilPublicoRender.js

   Dados:

   js/perfil-publico/PerfilPublicoDados.js

   IMPORTANTE:

   Este arquivo NÃO deve conter regras extensas de
   apresentação visual.

   A renderização básica do perfil pertence ao:
   js/PerfilPublicoRender.js

   ========================================================= */


(function (window) {

    "use strict";


    /* =====================================================
       DEPENDÊNCIAS
       ===================================================== */

    const Utils =
        window.PerfilPublicoUtils;


    const Dados =
        window.PerfilPublicoDados;


    const Render =
        window.PerfilPublicoRender;


    const Portfolio =
        window.PerfilPublicoPortfolio;


    const Servicos =
        window.PerfilPublicoServicos;


    const Agenda =
        window.PerfilPublicoAgenda;


    const Avaliacoes =
        window.PerfilPublicoAvaliacoes;


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        pagina: {

            apresentacao:
                "apresentar-perfil.html",

            edicao:
                "editar-perfil.html"

        },


        tiposPerfil: {

            artista:
                "artista",

            contratante:
                "contratante"

        },


        abas: {

            sobre: {

                id:
                    "tab-sobre"

            },


            portfolio: {

                id:
                    "tab-portfolio"

            },


            agenda: {

                id:
                    "tab-agenda"

            },


            avaliacoes: {

                id:
                    "tab-avaliacoes"

            }

        },


        elementos: {

            linkPerfil:
                "profileLink",

            qrImagem:
                "qrImage"

        },


        botoes: {

            voltar:
                "btnVoltar",

            visualizar:
                "btnVisualizarPerfil",

            editar:
                "btnEditarPerfil",

            whatsapp:
                "btnWhatsApp",

            qrCode:
                "btnQRCode",

            fecharQR:
                "btnFecharQR",

            compartilharQR:
                "btnCompartilharQR"

        },


        modais: {

            qr:
                "qrOverlay"

        },


        toast: {

            elemento:
                "toast",

            mensagem:
                "toastMessage"

        }

    };


    /* =====================================================
       ESTADO
       ===================================================== */

    const estado = {

        inicializado:
            false,


        carregando:
            false,


        abaAtual:
            "sobre",


        abasCarregadas: {

            sobre:
                false,

            portfolio:
                false,

            agenda:
                false,

            avaliacoes:
                false

        },


        perfil:
            null,


        perfilArtista:
            null,


        usuario:
            null,


        usuarioId:
            null,


        perfilId:
            null,


        tipoPerfil:
            null,


        portfolio:
            [],


        servicos:
            [],


        agenda:
            [],


        avaliacoes:
            []

    };


    /* =====================================================
       LOG
       ===================================================== */

    function log(...mensagens) {

        console.log(
            "[PerfilPublico]",
            ...mensagens
        );

    }


    function aviso(...mensagens) {

        console.warn(
            "[PerfilPublico]",
            ...mensagens
        );

    }


    function erro(...mensagens) {

        console.error(
            "[PerfilPublico]",
            ...mensagens
        );

    }


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    function obterElemento(
        id
    ) {

        if (!id) {
            return null;
        }


        return document.getElementById(
            id
        );

    }


    /* =====================================================
       PRIMEIRO VALOR
       ===================================================== */

    function obterPrimeiroValor(
        ...valores
    ) {

        if (
            Utils &&
            typeof Utils.obterPrimeiroValor === "function"
        ) {

            return Utils.obterPrimeiroValor(
                ...valores
            );

        }


        for (
            const valor of valores
        ) {

            if (
                valor !== null &&
                valor !== undefined &&
                String(
                    valor
                ).trim() !== ""
            ) {

                return valor;

            }

        }


        return "";

    }


    /* =====================================================
       NORMALIZAR TIPO DE PERFIL
       ===================================================== */

    function normalizarTipoPerfil(
        valor
    ) {

        if (
            Dados &&
            typeof Dados.normalizarTipoPerfil === "function"
        ) {

            return Dados.normalizarTipoPerfil(
                valor
            );

        }


        if (
            typeof valor === "object" &&
            valor !== null
        ) {

            valor =
                obterPrimeiroValor(

                    valor.nome,

                    valor.tipo,

                    valor.valor

                );

        }


        const texto =
            String(
                valor || ""
            )
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .trim()
                .toLowerCase();


        if (
            texto === "artista" ||
            texto === "artistas"
        ) {

            return CONFIG.tiposPerfil.artista;

        }


        if (
            texto === "contratante" ||
            texto === "contratantes" ||
            texto === "cliente" ||
            texto === "clientes"
        ) {

            return CONFIG.tiposPerfil.contratante;

        }


        return "";

    }


    /* =====================================================
       OBTER TIPO DO PERFIL
       ===================================================== */

    function obterTipoPerfilAtual() {

        if (
            Dados &&
            typeof Dados.obterTipoPerfil === "function"
        ) {

            const tipo =
                normalizarTipoPerfil(
                    Dados.obterTipoPerfil()
                );


            if (tipo) {

                estado.tipoPerfil =
                    tipo;


                return tipo;

            }

        }


        const perfil =
            estado.perfil || {};


        let relacionamento =
            perfil.tipos_perfil;


        if (
            Array.isArray(
                relacionamento
            )
        ) {

            relacionamento =
                relacionamento[0];

        }


        const tipo =
            normalizarTipoPerfil(

                relacionamento,

                perfil.tipoPerfil,

                perfil.tipo_perfil,

                perfil.tipo

            );


        estado.tipoPerfil =
            tipo || null;


        return tipo;

    }


    /* =====================================================
       VERIFICAR PERFIL
       ===================================================== */

    function ehArtista() {

        if (
            Dados &&
            typeof Dados.ehArtista === "function"
        ) {

            return Dados.ehArtista();

        }


        return (
            obterTipoPerfilAtual() ===
            CONFIG.tiposPerfil.artista
        );

    }


    function ehContratante() {

        if (
            Dados &&
            typeof Dados.ehContratante === "function"
        ) {

            return Dados.ehContratante();

        }


        return (
            obterTipoPerfilAtual() ===
            CONFIG.tiposPerfil.contratante
        );

    }


    /* =====================================================
       TIPO DE ARTISTA
       ===================================================== */

    function normalizarTipoArtista(
        valor
    ) {

        if (
            Render &&
            typeof Render.normalizarTipoArtista === "function"
        ) {

            return Render.normalizarTipoArtista(
                valor
            );

        }


        return String(
            valor || ""
        ).trim();

    }


    function obterTipoArtistaAtual() {

        if (
            !ehArtista()
        ) {

            return "";

        }


        if (
            Dados &&
            typeof Dados.obterPerfilArtista === "function"
        ) {

            const artista =
                Dados.obterPerfilArtista();


            const tipo =
                obterPrimeiroValor(

                    artista?.tipo_artista,

                    artista?.tipoArtista,

                    artista?.tipo

                );


            if (tipo) {

                return normalizarTipoArtista(
                    tipo
                );

            }

        }


        return normalizarTipoArtista(

            obterPrimeiroValor(

                estado.perfilArtista?.tipo_artista,

                estado.perfilArtista?.tipoArtista,

                estado.perfilArtista?.tipo

            )

        );

    }


    /* =====================================================
       ABA INICIAL
       ===================================================== */

    function obterAbaInicial() {

        const hash =
            String(
                window.location.hash || ""
            )
                .replace(
                    "#",
                    ""
                )
                .trim()
                .toLowerCase();


        if (
            CONFIG.abas[hash]
        ) {

            return hash;

        }


        return "sobre";

    }


    /* =====================================================
       INICIALIZAR
       ===================================================== */

    async function inicializar() {

        if (
            estado.carregando
        ) {

            aviso(
                "A página já está sendo inicializada."
            );


            return;

        }


        estado.carregando =
            true;


        try {

            log(
                "Inicializando Meu Perfil universal..."
            );


            if (!Render) {

                throw new Error(
                    "PerfilPublicoRender.js não foi carregado."
                );

            }


            estado.abaAtual =
                obterAbaInicial();


            configurarEventos();

            configurarAbas();


            await carregarDados();


            aplicarRegrasDePerfil();


            preencherInformacoesPerfil();


            await carregarAba(
                estado.abaAtual
            );


            ativarAba(
                estado.abaAtual,
                false
            );


            Render.renderizarIcones();


            estado.inicializado =
                true;


            log(
                "Meu Perfil universal inicializado com sucesso."
            );


        } catch (error) {

            erro(
                "Erro ao inicializar perfil:",
                error
            );


            mostrarToast(
                "Não foi possível carregar o perfil.",
                "erro"
            );


        } finally {

            estado.carregando =
                false;

        }

    }


    /* =====================================================
       CARREGAR DADOS
       ===================================================== */

    async function carregarDados() {

        if (!Dados) {

            throw new Error(
                "PerfilPublicoDados.js não foi carregado."
            );

        }


        log(
            "Carregando dados do perfil..."
        );


        let resultado =
            null;


        if (
            typeof Dados.carregarTudo === "function"
        ) {

            resultado =
                await Dados.carregarTudo({

                    incluirPortfolio:
                        true,

                    incluirServicos:
                        true,

                    incluirAgenda:
                        true,

                    incluirAvaliacoes:
                        false

                });

        } else {

            /*
             * Compatibilidade com versões anteriores
             * do módulo de dados.
             */

            if (
                typeof Dados.carregarUsuario === "function"
            ) {

                await Dados.carregarUsuario();

            }


            if (
                typeof Dados.carregarPerfil === "function"
            ) {

                await Dados.carregarPerfil();

            }


            if (
                typeof Dados.carregarPerfilArtista === "function"
            ) {

                await Dados.carregarPerfilArtista();

            }


            if (
                typeof Dados.carregarPortfolio === "function"
            ) {

                await Dados.carregarPortfolio();

            }


            if (
                typeof Dados.carregarServicos === "function" &&
                ehArtista()
            ) {

                await Dados.carregarServicos();

            }


            if (
                typeof Dados.carregarAgenda === "function"
            ) {

                await Dados.carregarAgenda();

            }

        }


        estado.usuario =
            obterEstadoDados(
                "obterUsuario",
                resultado?.usuario
            );


        estado.perfil =
            obterEstadoDados(
                "obterPerfil",
                resultado?.perfil
            );


        estado.perfilArtista =
            obterEstadoDados(
                "obterPerfilArtista",
                resultado?.perfilArtista
            );


        estado.usuarioId =
            obterEstadoDados(
                "obterUsuarioId",
                resultado?.usuarioId
            );


        estado.perfilId =
            obterEstadoDados(
                "obterPerfilId",
                resultado?.perfilId
            );


        estado.tipoPerfil =
            normalizarTipoPerfil(

                obterEstadoDados(
                    "obterTipoPerfil",
                    resultado?.tipoPerfil
                )

            ) || null;


        /*
         * Garante que o ID do perfil seja obtido mesmo
         * quando a versão do Dados não o devolve diretamente.
         */

        if (
            !estado.perfilId &&
            estado.perfil?.id
        ) {

            estado.perfilId =
                estado.perfil.id;

        }


        estado.portfolio =
            obterEstadoArray(
                "obterPortfolio",
                resultado?.portfolio
            );


        /*
         * Serviços são exclusivos de artistas.
         */

        if (
            ehArtista()
        ) {

            estado.servicos =
                obterEstadoArray(
                    "obterServicos",
                    resultado?.servicos
                );

        } else {

            estado.servicos =
                [];

        }


        estado.agenda =
            obterEstadoArray(
                "obterAgenda",
                resultado?.agenda
            );


        estado.avaliacoes =
            obterEstadoArray(
                "obterAvaliacoes",
                resultado?.avaliacoes
            );


        /*
         * Segunda proteção:
         *
         * Se o tipo for contratante, não mantemos
         * dados de artista na memória do controlador.
         */

        if (
            !ehArtista()
        ) {

            estado.perfilArtista =
                null;


            estado.servicos =
                [];

        }


        log(
            "Dados carregados:",
            {

                usuarioId:
                    estado.usuarioId,

                perfilId:
                    estado.perfilId,

                tipoPerfil:
                    obterTipoPerfilAtual(),

                tipoArtista:
                    obterTipoArtistaAtual(),

                portfolio:
                    estado.portfolio.length,

                servicos:
                    estado.servicos.length,

                agenda:
                    estado.agenda.length,

                avaliacoes:
                    estado.avaliacoes.length

            }
        );

    }


    /* =====================================================
       OBTER ESTADO DOS DADOS
       ===================================================== */

    function obterEstadoDados(
        metodo,
        fallback = null
    ) {

        if (
            Dados &&
            typeof Dados[metodo] === "function"
        ) {

            const valor =
                Dados[metodo]();


            if (
                valor !== undefined &&
                valor !== null
            ) {

                return valor;

            }

        }


        return fallback;

    }


    function obterEstadoArray(
        metodo,
        fallback = []
    ) {

        const valor =
            obterEstadoDados(
                metodo,
                fallback
            );


        return Array.isArray(
            valor
        )
            ? valor
            : [];

    }


    /* =====================================================
       REGRAS DE PERFIL
       ===================================================== */

    function aplicarRegrasDePerfil() {

        if (!Render) {
            return;
        }


        Render.aplicarRegrasDePerfil(
            estado
        );

    }


    /* =====================================================
       PREENCHER INFORMAÇÕES
       ===================================================== */

    function preencherInformacoesPerfil() {

        if (!Render) {

            erro(
                "PerfilPublicoRender.js não está disponível."
            );


            return;

        }


        Render.preencherInformacoes(
            estado
        );

    }


    /* =====================================================
       AVALIAÇÃO
       ===================================================== */

    function preencherAvaliacao() {

        if (!Render) {
            return;
        }


        Render.preencherAvaliacao(
            estado
        );

    }


    /* =====================================================
       SERVIÇOS
       ===================================================== */

    function preencherServicos() {

        if (!Render) {
            return;
        }


        Render.preencherServicos(
            estado
        );

    }


    async function carregarServicos() {

        if (!Dados) {
            return;
        }


        /*
         * Contratantes não possuem serviços de artista.
         */

        if (
            !ehArtista()
        ) {

            estado.servicos =
                [];


            if (Render) {

                Render.limparServicos();

            }


            return;

        }


        if (
            typeof Dados.carregarSomenteServicos === "function"
        ) {

            await Dados.carregarSomenteServicos();

        } else if (
            typeof Dados.carregarServicos === "function"
        ) {

            await Dados.carregarServicos();

        }


        estado.servicos =
            obterEstadoArray(
                "obterServicos",
                estado.servicos
            );


        preencherServicos();


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        const voltar =
            obterElemento(
                CONFIG.botoes.voltar
            );


        const visualizar =
            obterElemento(
                CONFIG.botoes.visualizar
            );


        const editar =
            obterElemento(
                CONFIG.botoes.editar
            );


        const whatsapp =
            obterElemento(
                CONFIG.botoes.whatsapp
            );


        const qrCode =
            obterElemento(
                CONFIG.botoes.qrCode
            );


        const fecharQR =
            obterElemento(
                CONFIG.botoes.fecharQR
            );


        const compartilharQR =
            obterElemento(
                CONFIG.botoes.compartilharQR
            );


        if (voltar) {

            voltar.addEventListener(
                "click",
                voltarPagina
            );

        }


        if (visualizar) {

            visualizar.addEventListener(
                "click",
                visualizarPerfil
            );

        }


        if (editar) {

            editar.addEventListener(
                "click",
                editarPerfil
            );

        }


        if (whatsapp) {

            whatsapp.addEventListener(
                "click",
                compartilharWhatsApp
            );

        }


        if (qrCode) {

            qrCode.addEventListener(
                "click",
                abrirQR
            );

        }


        if (fecharQR) {

            fecharQR.addEventListener(
                "click",
                fecharQRModal
            );

        }


        if (compartilharQR) {

            compartilharQR.addEventListener(
                "click",
                compartilharQRPerfil
            );

        }


        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key === "Escape"
                ) {

                    fecharQRModal();

                }

            }
        );


        const overlay =
            obterElemento(
                CONFIG.modais.qr
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target === overlay
                    ) {

                        fecharQRModal();

                    }

                }
            );

        }

    }


    /* =====================================================
       CONFIGURAR ABAS
       ===================================================== */

    function configurarAbas() {

        const botoes =
            document.querySelectorAll(
                ".tab-button"
            );


        if (!botoes.length) {

            aviso(
                "Nenhum .tab-button encontrado."
            );


            return;

        }


        botoes.forEach(
            botao => {

                botao.type =
                    "button";


                botao.addEventListener(
                    "click",
                    async function (evento) {

                        evento.preventDefault();

                        evento.stopPropagation();


                        const nomeAba =
                            botao.dataset.tab;


                        if (!nomeAba) {

                            aviso(
                                "Botão de aba sem data-tab:",
                                botao
                            );


                            return;

                        }


                        if (
                            !CONFIG.abas[nomeAba]
                        ) {

                            aviso(
                                "Aba não configurada:",
                                nomeAba
                            );


                            return;

                        }


                        ativarAba(
                            nomeAba
                        );


                        await carregarAba(
                            nomeAba
                        );


                        ativarAba(
                            nomeAba,
                            false
                        );

                    }
                );

            }
        );


        log(
            `${botoes.length} abas configuradas.`
        );

    }


    /* =====================================================
       ATIVAR ABA
       ===================================================== */

    function ativarAba(
        nomeAba,
        atualizarHash = true
    ) {

        if (
            !CONFIG.abas[nomeAba]
        ) {

            aviso(
                "Tentativa de ativar aba inexistente:",
                nomeAba
            );


            return;

        }


        const botoes =
            document.querySelectorAll(
                ".tab-button"
            );


        const conteudos =
            document.querySelectorAll(
                ".tab-content"
            );


        botoes.forEach(
            botao => {

                const ativa =
                    botao.dataset.tab ===
                    nomeAba;


                botao.classList.toggle(
                    "active",
                    ativa
                );


                botao.setAttribute(
                    "aria-selected",
                    ativa
                        ? "true"
                        : "false"
                );

            }
        );


        conteudos.forEach(
            conteudo => {

                const ativa =
                    conteudo.id ===
                    obterIdAba(
                        nomeAba
                    );


                conteudo.classList.toggle(
                    "active",
                    ativa
                );


                conteudo.hidden =
                    !ativa;


                conteudo.setAttribute(
                    "aria-hidden",
                    ativa
                        ? "false"
                        : "true"
                );

            }
        );


        estado.abaAtual =
            nomeAba;


        if (atualizarHash) {

            try {

                history.replaceState(
                    null,
                    "",
                    `#${nomeAba}`
                );

            } catch (error) {

                aviso(
                    "Não foi possível atualizar o hash da aba.",
                    error
                );

            }

        }


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       OBTER ID DA ABA
       ===================================================== */

    function obterIdAba(
        nomeAba
    ) {

        return (

            CONFIG.abas[nomeAba]?.id ||

            `tab-${nomeAba}`

        );

    }


    /* =====================================================
       CARREGAR ABA
       ===================================================== */

    async function carregarAba(
        nomeAba,
        forcar = false
    ) {

        if (
            !CONFIG.abas[nomeAba]
        ) {

            aviso(
                "Aba desconhecida:",
                nomeAba
            );


            return false;

        }


        if (
            estado.abasCarregadas[nomeAba] &&
            !forcar
        ) {

            log(
                `Aba "${nomeAba}" já foi carregada.`
            );


            return true;

        }


        try {

            log(
                `Carregando aba "${nomeAba}"...`
            );


            switch (
                nomeAba
            ) {

                case "sobre":

                    await carregarAbaSobre();

                    break;


                case "portfolio":

                    await carregarAbaPortfolio();

                    break;


                case "agenda":

                    await carregarAbaAgenda();

                    break;


                case "avaliacoes":

                    await carregarAbaAvaliacoes();

                    break;


                default:

                    throw new Error(
                        `Nenhum carregador definido para "${nomeAba}".`
                    );

            }


            estado.abasCarregadas[
                nomeAba
            ] =
                true;


            log(
                `Aba "${nomeAba}" carregada com sucesso.`
            );


            return true;


        } catch (error) {

            estado.abasCarregadas[
                nomeAba
            ] =
                false;


            erro(
                `Erro ao carregar aba "${nomeAba}":`,
                error
            );


            mostrarToast(
                `Não foi possível carregar a aba ${nomeAba}.`,
                "erro"
            );


            return false;

        }

    }


    /* =====================================================
       ABA SOBRE
       ===================================================== */

    async function carregarAbaSobre() {

        preencherInformacoesPerfil();


        /*
         * Serviços existem somente para artistas.
         */

        if (
            ehArtista()
        ) {

            if (
                Servicos &&
                typeof Servicos.renderizar === "function"
            ) {

                Servicos.renderizar(
                    estado.servicos
                );

            } else if (
                !estado.servicos.length
            ) {

                await carregarServicos();

            }

        } else {

            if (Render) {

                Render.limparServicos();

            }

        }


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       ABA PORTFÓLIO
       ===================================================== */

    async function carregarAbaPortfolio() {

        if (!Portfolio) {

            throw new Error(
                "PerfilPublicoPortfolio.js não foi carregado."
            );

        }


        let portfolio =
            Array.isArray(
                estado.portfolio
            )
                ? estado.portfolio
                : [];


        if (
            !portfolio.length &&
            Dados &&
            typeof Dados.carregarSomentePortfolio === "function"
        ) {

            await Dados.carregarSomentePortfolio();


            portfolio =
                obterEstadoArray(
                    "obterPortfolio",
                    []
                );


            estado.portfolio =
                portfolio;

        }


        if (
            typeof Portfolio.renderizar === "function"
        ) {

            await Promise.resolve(
                Portfolio.renderizar(
                    portfolio
                )
            );

        } else if (
            typeof Portfolio.inicializar === "function"
        ) {

            await Promise.resolve(
                Portfolio.inicializar(
                    portfolio
                )
            );

        } else {

            throw new Error(
                "PerfilPublicoPortfolio.js não possui renderizar() nem inicializar()."
            );

        }


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       ABA AGENDA
       ===================================================== */

    async function carregarAbaAgenda() {

        if (!Agenda) {

            throw new Error(
                "PerfilPublicoAgenda.js não foi carregado."
            );

        }


        let agenda =
            Array.isArray(
                estado.agenda
            )
                ? estado.agenda
                : [];


        if (
            !agenda.length &&
            Dados &&
            typeof Dados.carregarSomenteAgenda === "function"
        ) {

            await Dados.carregarSomenteAgenda();


            agenda =
                obterEstadoArray(
                    "obterAgenda",
                    []
                );


            estado.agenda =
                agenda;

        }


        if (
            typeof Agenda.renderizar === "function"
        ) {

            await Promise.resolve(
                Agenda.renderizar(
                    agenda
                )
            );

        } else if (
            typeof Agenda.inicializar === "function"
        ) {

            await Promise.resolve(
                Agenda.inicializar(
                    agenda
                )
            );

        } else {

            throw new Error(
                "PerfilPublicoAgenda.js não possui renderizar() nem inicializar()."
            );

        }


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       ABA AVALIAÇÕES
       ===================================================== */

    async function carregarAbaAvaliacoes() {

        if (!Avaliacoes) {

            throw new Error(
                "PerfilPublicoAvaliacoes.js não foi carregado."
            );

        }


        if (
            !estado.avaliacoes.length &&
            Dados &&
            typeof Dados.carregarSomenteAvaliacoes === "function"
        ) {

            log(
                "Buscando avaliações do perfil..."
            );


            await Dados.carregarSomenteAvaliacoes();


            estado.avaliacoes =
                obterEstadoArray(
                    "obterAvaliacoes",
                    []
                );


            log(
                "Avaliações encontradas:",
                estado.avaliacoes.length
            );

        }


        const lista =
            Array.isArray(
                estado.avaliacoes
            )
                ? estado.avaliacoes
                : [];


        const dadosAvaliacoes =
            construirDadosAvaliacoes(
                lista
            );


        if (
            typeof Avaliacoes.renderizar === "function"
        ) {

            await Promise.resolve(
                Avaliacoes.renderizar(
                    dadosAvaliacoes
                )
            );

        } else if (
            typeof Avaliacoes.inicializar === "function"
        ) {

            await Promise.resolve(
                Avaliacoes.inicializar(
                    dadosAvaliacoes
                )
            );

        } else {

            throw new Error(
                "PerfilPublicoAvaliacoes.js não possui renderizar() nem inicializar()."
            );

        }


        preencherAvaliacao();


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       CONSTRUIR DADOS DAS AVALIAÇÕES
       ===================================================== */

    function construirDadosAvaliacoes(
        avaliacoes
    ) {

        const lista =
            Array.isArray(
                avaliacoes
            )
                ? avaliacoes
                : [];


        const distribuicao = {

            cinco:
                0,

            quatro:
                0,

            tres:
                0,

            dois:
                0,

            um:
                0

        };


        const notas =
            lista
                .map(
                    avaliacao => {

                        const valor =
                            obterPrimeiroValor(

                                avaliacao?.nota,

                                avaliacao?.rating,

                                avaliacao?.avaliacao,

                                avaliacao?.estrelas,

                                0

                            );


                        return Number(
                            valor
                        );

                    }
                )
                .filter(
                    numero =>
                        Number.isFinite(
                            numero
                        ) &&
                        numero >= 1 &&
                        numero <= 5
                );


        notas.forEach(
            nota => {

                if (nota >= 5) {

                    distribuicao.cinco++;

                } else if (nota >= 4) {

                    distribuicao.quatro++;

                } else if (nota >= 3) {

                    distribuicao.tres++;

                } else if (nota >= 2) {

                    distribuicao.dois++;

                } else {

                    distribuicao.um++;

                }

            }
        );


        let media =
            0;


        if (notas.length) {

            media =
                notas.reduce(
                    (
                        total,
                        nota
                    ) =>
                        total + nota,
                    0
                ) /
                notas.length;

        } else {

            const mediaPerfil =
                Number(
                    obterPrimeiroValor(

                        estado.perfilArtista?.avaliacao_media,

                        estado.perfilArtista?.media_avaliacao,

                        estado.perfil?.avaliacao_media,

                        estado.perfil?.media_avaliacao,

                        0

                    )
                );


            if (
                Number.isFinite(
                    mediaPerfil
                ) &&
                mediaPerfil > 0
            ) {

                media =
                    mediaPerfil;

            }

        }


        return {

            media,

            quantidade:
                lista.length,

            distribuicao,

            avaliacoes:
                lista

        };

    }


    /* =====================================================
       VOLTAR
       ===================================================== */

    function voltarPagina() {

        if (
            window.history.length > 1
        ) {

            window.history.back();

            return;

        }


        window.location.href =
            "index.html";

    }


    /* =====================================================
       VISUALIZAR PERFIL
       ===================================================== */

    function visualizarPerfil() {

        const id =
            estado.perfilId;


        if (!id) {

            mostrarToast(
                "Perfil ainda não identificado.",
                "erro"
            );


            return;

        }


        const url =
            construirLinkPerfil();


        if (!url) {

            mostrarToast(
                "Não foi possível construir o endereço do perfil.",
                "erro"
            );


            return;

        }


        log(
            "Visualizando perfil público universal:",
            {

                tipoPerfil:
                    obterTipoPerfilAtual(),

                tipoArtista:
                    obterTipoArtistaAtual(),

                perfilId:
                    id,

                url

            }
        );


        window.location.href =
            url;

    }


    /* =====================================================
       EDITAR PERFIL
       ===================================================== */

    function editarPerfil() {

        const id =
            estado.perfilId;


        if (!id) {

            mostrarToast(
                "Perfil ainda não identificado.",
                "erro"
            );


            return;

        }


        const pagina =
            CONFIG.pagina.edicao;


        if (!pagina) {

            mostrarToast(
                "A página de edição não está disponível.",
                "erro"
            );


            return;

        }


        const url =
            construirLinkPagina(
                pagina
            );


        log(
            "Abrindo editor universal:",
            {

                tipoPerfil:
                    obterTipoPerfilAtual(),

                tipoArtista:
                    obterTipoArtistaAtual(),

                perfilId:
                    id,

                url

            }
        );


        window.location.href =
            url;

    }


    /* =====================================================
       WHATSAPP
       ===================================================== */

    function compartilharWhatsApp() {

        const nome =
            obterPrimeiroValor(

                ehArtista()
                    ? estado.perfilArtista?.nome_artistico
                    : "",

                ehArtista()
                    ? estado.perfilArtista?.nome
                    : "",

                estado.perfil?.nome_exibicao,

                estado.perfil?.nome,

                estado.usuario?.nome,

                "usuário"

            );


        const mensagem =
            "Olá! Vi seu perfil no MusicalWorld e gostaria de conversar com você sobre um possível trabalho.";


        const telefone =
            obterPrimeiroValor(

                ehArtista()
                    ? estado.perfilArtista?.telefone
                    : "",

                ehArtista()
                    ? estado.perfilArtista?.whatsapp
                    : "",

                estado.perfil?.telefone,

                estado.perfil?.whatsapp,

                estado.usuario?.telefone,

                estado.usuario?.whatsapp

            );


        if (!telefone) {

            mostrarToast(
                `O WhatsApp de ${nome} não está informado.`,
                "erro"
            );


            return;

        }


        const numero =
            String(
                telefone
            ).replace(
                /\D/g,
                ""
            );


        if (!numero) {

            mostrarToast(
                "Número de WhatsApp inválido.",
                "erro"
            );


            return;

        }


        const url =
            `https://wa.me/${numero}?text=${encodeURIComponent(
                mensagem
            )}`;


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    }


    /* =====================================================
       QR CODE
       ===================================================== */

    function abrirQR() {

        const overlay =
            obterElemento(
                CONFIG.modais.qr
            );


        if (!overlay) {

            aviso(
                "Modal QR não encontrado."
            );


            return;

        }


        const link =
            construirLinkPerfil();


        if (!link) {

            mostrarToast(
                "Não foi possível gerar o link do perfil.",
                "erro"
            );


            return;

        }


        const imagem =
            obterElemento(
                CONFIG.elementos.qrImagem
            );


        if (imagem) {

            imagem.src =
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    link
                )}`;

        }


        const campoLink =
            obterElemento(
                CONFIG.elementos.linkPerfil
            );


        if (campoLink) {

            campoLink.textContent =
                link;


            campoLink.dataset.url =
                link;

        }


        overlay.classList.add(
            "active"
        );


        overlay.removeAttribute(
            "hidden"
        );


        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       PÁGINAS
       ===================================================== */

    function obterPaginaApresentacao() {

        return CONFIG.pagina.apresentacao ||
            "";

    }


    function obterPaginaPerfilPublico() {

        return obterPaginaApresentacao();

    }


    function obterPaginaEdicao() {

        return CONFIG.pagina.edicao ||
            "";

    }


    /* =====================================================
       CONSTRUIR LINK DA PÁGINA
       ===================================================== */

    function construirLinkPagina(
        pagina
    ) {

        if (!pagina) {

            return "";

        }


        const diretorio =
            window.location.pathname.replace(
                /[^/]*$/,
                ""
            );


        return (
            `${window.location.origin}` +
            `${diretorio}` +
            `${pagina}`
        );

    }


    /* =====================================================
       CONSTRUIR LINK DO PERFIL
       ===================================================== */

    function construirLinkPerfil() {

        const id =
            estado.perfilId ||
            "";


        const pagina =
            obterPaginaApresentacao();


        if (!id) {

            aviso(
                "Não foi possível construir o link: perfil sem ID."
            );


            return "";

        }


        if (!pagina) {

            aviso(
                "Página pública universal não encontrada."
            );


            return "";

        }


        const base =
            construirLinkPagina(
                pagina
            );


        if (!base) {

            return "";

        }


        const separador =
            base.includes("?")
                ? "&"
                : "?";


        const url =
            `${base}${separador}id=${encodeURIComponent(
                id
            )}`;


        log(
            "Link de perfil público universal:",
            url
        );


        return url;

    }


    /* =====================================================
       FECHAR QR
       ===================================================== */

    function fecharQRModal() {

        const overlay =
            obterElemento(
                CONFIG.modais.qr
            );


        if (!overlay) {
            return;
        }


        overlay.classList.remove(
            "active"
        );


        overlay.setAttribute(
            "hidden",
            ""
        );


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       COMPARTILHAR QR
       ===================================================== */

    async function compartilharQRPerfil() {

        const link =
            construirLinkPerfil();


        if (!link) {

            mostrarToast(
                "Não foi possível compartilhar o perfil.",
                "erro"
            );


            return;

        }


        try {

            if (
                navigator.share
            ) {

                await navigator.share({

                    title:
                        "Meu perfil no MusicalWorld",

                    text:
                        "Confira meu perfil no MusicalWorld.",

                    url:
                        link

                });


                return;

            }


            if (
                navigator.clipboard
            ) {

                await navigator.clipboard.writeText(
                    link
                );


                mostrarToast(
                    "Link do perfil copiado.",
                    "sucesso"
                );


                return;

            }


            mostrarToast(
                "Não foi possível compartilhar o link.",
                "erro"
            );


        } catch (error) {

            if (
                error?.name ===
                "AbortError"
            ) {

                return;

            }


            erro(
                "Erro ao compartilhar QR:",
                error
            );

        }

    }


    /* =====================================================
       TOAST
       ===================================================== */

    function mostrarToast(
        mensagem,
        tipo = "sucesso"
    ) {

        if (
            Utils &&
            typeof Utils.mostrarToast === "function"
        ) {

            Utils.mostrarToast(
                mensagem,
                tipo
            );


            return;

        }


        const toast =
            obterElemento(
                CONFIG.toast.elemento
            );


        const toastMessage =
            obterElemento(
                CONFIG.toast.mensagem
            );


        if (!toast) {
            return;
        }


        if (toastMessage) {

            toastMessage.textContent =
                mensagem;

        }


        toast.classList.remove(
            "show",
            "sucesso",
            "erro"
        );


        toast.classList.add(
            tipo,
            "show"
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }


    /* =====================================================
       RECARREGAR ABA ATUAL
       ===================================================== */

    async function recarregarAbaAtual() {

        const aba =
            estado.abaAtual;


        estado.abasCarregadas[
            aba
        ] =
            false;


        ativarAba(
            aba,
            false
        );


        await carregarAba(
            aba,
            true
        );


        ativarAba(
            aba,
            false
        );

    }


    /* =====================================================
       RECARREGAR TUDO
       ===================================================== */

    async function recarregar() {

        estado.abasCarregadas = {

            sobre:
                false,

            portfolio:
                false,

            agenda:
                false,

            avaliacoes:
                false

        };


        /*
         * Evita que dados do perfil anterior permaneçam
         * durante uma nova leitura.
         */

        estado.tipoPerfil =
            null;


        estado.perfilArtista =
            null;


        estado.servicos =
            [];


        await carregarDados();


        aplicarRegrasDePerfil();


        preencherInformacoesPerfil();


        ativarAba(
            estado.abaAtual,
            false
        );


        await carregarAba(
            estado.abaAtual,
            true
        );


        ativarAba(
            estado.abaAtual,
            false
        );


        if (Render) {

            Render.renderizarIcones();

        }

    }


    /* =====================================================
       OBTER ESTADO
       ===================================================== */

    function obterEstado() {

        return {

            ...estado,

            portfolio:
                [
                    ...estado.portfolio
                ],

            servicos:
                [
                    ...estado.servicos
                ],

            agenda:
                [
                    ...estado.agenda
                ],

            avaliacoes:
                [
                    ...estado.avaliacoes
                ]

        };

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    const PerfilPublico = {

        CONFIG,

        estado,

        inicializar,

        carregarDados,

        carregarAba,

        carregarServicos,

        ativarAba,

        recarregarAbaAtual,

        recarregar,

        obterEstado,

        preencherInformacoesPerfil,

        preencherAvaliacao,

        preencherServicos,

        obterTipoPerfilAtual,

        obterTipoArtistaAtual,

        normalizarTipoPerfil,

        normalizarTipoArtista,

        ehArtista,

        ehContratante,

        aplicarRegrasDePerfil,

        obterPaginaApresentacao,

        obterPaginaPerfilPublico,

        obterPaginaEdicao,

        construirLinkPerfil,

        construirLinkPagina,

        visualizarPerfil,

        editarPerfil

    };


    /* =====================================================
       DISPONIBILIZAR GLOBALMENTE
       ===================================================== */

    window.PerfilPublico =
        PerfilPublico;


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            {
                once:
                    true
            }
        );


    } else {

        inicializar();

    }


    console.log(
        "PerfilPublico.js — Meu Perfil universal carregado."
    );


})(window);