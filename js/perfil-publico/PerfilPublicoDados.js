/* =========================================================
   MUSICALWORLD — PERFIL PÚBLICO

   Arquivo:
   js/perfil-publico/PerfilPublicoDados.js

   Responsabilidades:

   - Obter o usuário atual.
   - Carregar o perfil principal.
   - Identificar o tipo geral do perfil.
   - Carregar dados artísticos somente para artistas.
   - Carregar serviços somente para artistas.
   - Carregar portfólio para qualquer tipo de perfil.
   - Carregar agenda para qualquer tipo de perfil.
   - Carregar avaliações para qualquer tipo de perfil.
   - Centralizar os dados utilizados pelo Perfil Público.

   REGRAS:

   ARTISTA:
   - perfis
   - perfis_artistas
   - servicos_artistas
   - portfolio_musicos
   - agenda_musicos
   - avaliacoes_musicos

   CONTRATANTE:
   - perfis
   - portfolio_musicos
   - agenda_musicos
   - avaliacoes_musicos

   IMPORTANTE:

   Este módulo NÃO decide qual tela, campo ou componente
   deve aparecer.

   Ele apenas identifica o tipo do perfil e fornece os
   dados corretos para os módulos superiores.

   Carteira e transações NÃO pertencem mais ao Perfil Público.

========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        tabelas: {

            usuarios:
                "usuarios",

            perfis:
                "perfis",

            tiposPerfil:
                "tipos_perfil",

            perfisArtistas:
                "perfis_artistas",

            servicos:
                "servicos_artistas",

            portfolio:
                "portfolio_musicos",

            agenda:
                "agenda_musicos",

            avaliacoes:
                "avaliacoes_musicos"

        },

        tiposPerfil: {

            artista:
                "artista",

            contratante:
                "contratante"

        }

    };


    /* =====================================================
       ESTADO INTERNO
    ===================================================== */

    const estado = {

        clienteSupabase:
            null,

        usuarioId:
            null,

        usuario:
            null,

        perfil:
            null,

        /*
         * Tipo geral do perfil.
         *
         * Valores possíveis:
         *
         * "artista"
         * "contratante"
         */
        tipoPerfil:
            null,

        /*
         * Dados específicos do artista.
         *
         * Para contratante permanece null.
         */
        perfilArtista:
            null,

        perfilId:
            null,

        /*
         * Serviços existem somente para artistas.
         *
         * Para contratantes permanece [].
         */
        servicos:
            [],

        /*
         * Portfólio é compartilhado entre os tipos.
         */
        portfolio:
            [],

        /*
         * Agenda é compartilhada entre os tipos.
         */
        agenda:
            [],

        /*
         * Avaliações são compartilhadas entre os tipos.
         */
        avaliacoes:
            [],

        carregado:
            false

    };


    /* =====================================================
       OBTER CLIENTE SUPABASE
    ===================================================== */

    function obterClienteSupabase() {

        if (
            estado.clienteSupabase &&
            typeof estado.clienteSupabase.from === "function"
        ) {

            return estado.clienteSupabase;

        }


        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            estado.clienteSupabase =
                window.supabaseClient;

            return estado.clienteSupabase;

        }


        if (
            window._supabase &&
            typeof window._supabase.from === "function"
        ) {

            estado.clienteSupabase =
                window._supabase;

            return estado.clienteSupabase;

        }


        if (
            window.supabase &&
            typeof window.supabase.from === "function"
        ) {

            estado.clienteSupabase =
                window.supabase;

            return estado.clienteSupabase;

        }


        console.error(
            "PerfilPublicoDados: cliente Supabase não encontrado."
        );


        return null;

    }


    /* =====================================================
       OBTER ID DO USUÁRIO ATUAL

       Primeiro tenta UsuarioAtual.

       Caso não esteja disponível, utiliza o Auth
       do Supabase.
    ===================================================== */

    async function obterUsuarioId() {

        if (
            window.UsuarioAtual &&
            typeof window.UsuarioAtual.obterId === "function"
        ) {

            try {

                const id =
                    await window.UsuarioAtual.obterId();


                if (id) {

                    estado.usuarioId =
                        id;

                    return id;

                }

            } catch (erro) {

                console.warn(
                    "PerfilPublicoDados: erro ao obter ID através de UsuarioAtual.",
                    erro
                );

            }

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            return null;

        }


        try {

            const resultado =
                await supabase.auth.getUser();


            if (
                resultado.error
            ) {

                console.error(
                    "PerfilPublicoDados: erro ao obter usuário autenticado.",
                    resultado.error
                );

                return null;

            }


            const usuario =
                resultado.data?.user;


            if (!usuario) {

                return null;

            }


            estado.usuarioId =
                usuario.id;


            return usuario.id;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: erro inesperado ao obter usuário.",
                erro
            );

            return null;

        }

    }


    /* =====================================================
       CARREGAR USUÁRIO
    ===================================================== */

    async function carregarUsuario(
        usuarioId = null
    ) {

        const id =
            usuarioId ||
            estado.usuarioId ||
            await obterUsuarioId();


        if (!id) {

            throw new Error(
                "Usuário não autenticado."
            );

        }


        estado.usuarioId =
            id;


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select("*")
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar usuário.",
                    error
                );

                throw error;

            }


            estado.usuario =
                data || null;


            return estado.usuario;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar usuário.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR PERFIS DO USUÁRIO

       A relação com tipos_perfil é carregada junto.

       Isso permite identificar corretamente:

       artista
       contratante
    ===================================================== */

    async function carregarPerfis(
        usuarioId = null
    ) {

        const id =
            usuarioId ||
            estado.usuarioId ||
            await obterUsuarioId();


        if (!id) {

            throw new Error(
                "ID do usuário não encontrado."
            );

        }


        estado.usuarioId =
            id;


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(`
                    *,
                    ${CONFIG.tabelas.tiposPerfil} (
                        id,
                        nome
                    )
                `)
                .eq(
                    "usuario_id",
                    id
                );


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar perfis.",
                    error
                );

                throw error;

            }


            return Array.isArray(data)
                ? data
                : [];

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar perfis.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       NORMALIZAR TIPO DE PERFIL

       Esta função trabalha somente com o tipo GERAL:

       artista
       contratante

       Ela NÃO trata "Cantor(a)", "DJ", "Banda" etc.

       Esses valores pertencem ao tipo artístico.
    ===================================================== */

    function normalizarTipoPerfil(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return null;

        }


        /*
         * Caso seja um objeto vindo de relacionamento.
         */

        if (
            typeof valor === "object"
        ) {

            valor =
                valor.nome ||
                valor.name ||
                valor.tipo ||
                valor.tipo_perfil ||
                null;

        }


        if (
            valor === null ||
            valor === undefined
        ) {

            return null;

        }


        const texto =
            String(valor)
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );


        if (!texto) {

            return null;

        }


        /*
         * ARTISTA
         */

        if (
            texto === "artista" ||
            texto === "artistas"
        ) {

            return CONFIG.tiposPerfil.artista;

        }


        /*
         * CONTRATANTE
         */

        if (
            texto === "contratante" ||
            texto === "contratantes" ||
            texto === "cliente" ||
            texto === "clientes"
        ) {

            return CONFIG.tiposPerfil.contratante;

        }


        return null;

    }


    /* =====================================================
       IDENTIFICAR TIPO DO PERFIL

       Prioridade:

       1. relacionamento tipos_perfil
       2. campos antigos de compatibilidade
    ===================================================== */

    function identificarTipoPerfil(
        perfil
    ) {

        if (
            !perfil ||
            typeof perfil !== "object"
        ) {

            return null;

        }


        /*
         * -------------------------------------------------
         * FONTE PRINCIPAL
         * -------------------------------------------------
         *
         * Resultado esperado da relação:
         *
         * tipos_perfil: {
         *     id: "...",
         *     nome: "artista"
         * }
         */

        const relacionamento =
            perfil.tipos_perfil;


        if (
            relacionamento &&
            typeof relacionamento === "object" &&
            !Array.isArray(relacionamento)
        ) {

            const tipo =
                normalizarTipoPerfil(
                    relacionamento
                );


            if (tipo) {

                return tipo;

            }

        }


        /*
         * Alguns relacionamentos podem retornar array.
         */

        if (
            Array.isArray(relacionamento) &&
            relacionamento.length > 0
        ) {

            const tipo =
                normalizarTipoPerfil(
                    relacionamento[0]
                );


            if (tipo) {

                return tipo;

            }

        }


        /*
         * -------------------------------------------------
         * FALLBACKS
         * -------------------------------------------------
         *
         * Mantidos apenas para compatibilidade com
         * estruturas antigas.
         */

        const camposFallback = [

            perfil.tipo_perfil_nome,

            perfil.tipoPerfilNome,

            perfil.tipo_perfil,

            perfil.tipoPerfil,

            perfil.tipo

        ];


        for (
            const valor of camposFallback
        ) {

            const tipo =
                normalizarTipoPerfil(
                    valor
                );


            if (tipo) {

                return tipo;

            }

        }


        return null;

    }


    /* =====================================================
       ATUALIZAR TIPO DO PERFIL
    ===================================================== */

    function atualizarTipoPerfil() {

        estado.tipoPerfil =
            identificarTipoPerfil(
                estado.perfil
            );


        return estado.tipoPerfil;

    }


    /* =====================================================
       VERIFICAR SE É ARTISTA
    ===================================================== */

    function ehArtista() {

        return (
            estado.tipoPerfil ===
            CONFIG.tiposPerfil.artista
        );

    }


    /* =====================================================
       VERIFICAR SE É CONTRATANTE
    ===================================================== */

    function ehContratante() {

        return (
            estado.tipoPerfil ===
            CONFIG.tiposPerfil.contratante
        );

    }


    /* =====================================================
       CARREGAR PERFIL PRINCIPAL
    ===================================================== */

    async function carregarPerfil(
        usuarioId = null
    ) {

        const perfis =
            await carregarPerfis(
                usuarioId
            );


        if (!perfis.length) {

            estado.perfil =
                null;

            estado.perfilId =
                null;

            estado.tipoPerfil =
                null;

            estado.perfilArtista =
                null;

            estado.servicos =
                [];

            return null;

        }


        /*
         * Prioriza perfil ativo.
         */

        let perfilEncontrado =
            perfis.find(
                perfil => {

                    return (
                        perfil.ativo === true ||
                        perfil.status === "ativo"
                    );

                }
            );


        /*
         * Caso não exista ativo,
         * utiliza o primeiro perfil.
         */

        if (!perfilEncontrado) {

            perfilEncontrado =
                perfis[0];

        }


        estado.perfil =
            perfilEncontrado;


        estado.perfilId =
            perfilEncontrado?.id ||
            null;


        atualizarTipoPerfil();


        return estado.perfil;

    }


    /* =====================================================
       CARREGAR PERFIL POR ID
    ===================================================== */

    async function carregarPerfilPorId(
        perfilId
    ) {

        if (!perfilId) {

            estado.perfil =
                null;

            estado.perfilId =
                null;

            estado.tipoPerfil =
                null;

            estado.perfilArtista =
                null;

            estado.servicos =
                [];

            return null;

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(`
                    *,
                    ${CONFIG.tabelas.tiposPerfil} (
                        id,
                        nome
                    )
                `)
                .eq(
                    "id",
                    perfilId
                )
                .maybeSingle();


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar perfil específico.",
                    error
                );

                throw error;

            }


            estado.perfil =
                data || null;


            estado.perfilId =
                data?.id || null;


            atualizarTipoPerfil();


            /*
             * Limpa dados artísticos sempre que o perfil
             * carregado não for artista.
             */

            if (!ehArtista()) {

                estado.perfilArtista =
                    null;

                estado.servicos =
                    [];

            }


            return estado.perfil;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar perfil específico.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR PERFIL ARTÍSTICO

       SOMENTE ARTISTAS.
    ===================================================== */

    async function carregarPerfilArtista(
        perfilId = null
    ) {

        /*
         * Regra absoluta:
         *
         * se não for artista, não existe consulta.
         */

        if (!ehArtista()) {

            estado.perfilArtista =
                null;

            return null;

        }


        const id =
            perfilId ||
            estado.perfilId;


        if (!id) {

            estado.perfilArtista =
                null;

            return null;

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.perfisArtistas
                )
                .select("*")
                .eq(
                    "perfil_id",
                    id
                )
                .maybeSingle();


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar perfil artístico.",
                    error
                );

                throw error;

            }


            estado.perfilArtista =
                data || null;


            return estado.perfilArtista;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar perfil artístico.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR SERVIÇOS

       SOMENTE ARTISTAS.
    ===================================================== */

    async function carregarServicos(
        perfilId = null
    ) {

        /*
         * Contratante nunca consulta servicos_artistas.
         */

        if (!ehArtista()) {

            estado.servicos =
                [];

            return [];

        }


        const id =
            perfilId ||
            estado.perfilId;


        if (!id) {

            estado.servicos =
                [];

            return [];

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            console.log(
                "PerfilPublicoDados: carregando serviços do artista:",
                id
            );


            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.servicos
                )
                .select("*")
                .eq(
                    "perfil_id",
                    id
                );


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar serviços.",
                    error
                );

                throw error;

            }


            estado.servicos =
                Array.isArray(data)
                    ? data
                    : [];


            console.log(
                "PerfilPublicoDados: serviços encontrados:",
                estado.servicos.length
            );


            return estado.servicos;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar serviços.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR PORTFÓLIO

       COMPARTILHADO ENTRE ARTISTA E CONTRATANTE.
    ===================================================== */

    async function carregarPortfolio(
        perfilId = null
    ) {

        const id =
            perfilId ||
            estado.perfilId;


        if (!id) {

            estado.portfolio =
                [];

            return [];

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            let resultado =
                await supabase
                    .from(
                        CONFIG.tabelas.portfolio
                    )
                    .select("*")
                    .eq(
                        "perfil_id",
                        id
                    )
                    .eq(
                        "ativo",
                        true
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            /*
             * Compatibilidade com versões antigas
             * que eventualmente não possuam "ativo".
             */

            if (
                resultado.error
            ) {

                console.warn(
                    "PerfilPublicoDados: consulta de portfólio com campo ativo falhou. Tentando consulta simples."
                );


                resultado =
                    await supabase
                        .from(
                            CONFIG.tabelas.portfolio
                        )
                        .select("*")
                        .eq(
                            "perfil_id",
                            id
                        )
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );

            }


            if (
                resultado.error
            ) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar portfólio.",
                    resultado.error
                );

                throw resultado.error;

            }


            estado.portfolio =
                Array.isArray(
                    resultado.data
                )
                    ? resultado.data
                    : [];


            return estado.portfolio;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar portfólio.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR AGENDA

       COMPARTILHADA ENTRE ARTISTA E CONTRATANTE.
    ===================================================== */

    async function carregarAgenda(
        perfilId = null
    ) {

        const id =
            perfilId ||
            estado.perfilId;


        if (!id) {

            estado.agenda =
                [];

            return [];

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.agenda
                )
                .select("*")
                .eq(
                    "perfil_id",
                    id
                )
                .order(
                    "data_inicio",
                    {
                        ascending: true
                    }
                );


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar agenda.",
                    error
                );

                throw error;

            }


            estado.agenda =
                Array.isArray(data)
                    ? data
                    : [];


            return estado.agenda;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar agenda.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR AVALIAÇÕES

       COMPARTILHADAS ENTRE ARTISTA E CONTRATANTE.
    ===================================================== */

    async function carregarAvaliacoes(
        perfilId = null
    ) {

        const id =
            perfilId ||
            estado.perfilId;


        if (!id) {

            estado.avaliacoes =
                [];

            return [];

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        try {

            const {
                data,
                error
            } = await supabase
                .from(
                    CONFIG.tabelas.avaliacoes
                )
                .select("*")
                .eq(
                    "perfil_id",
                    id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar avaliações.",
                    error
                );

                throw error;

            }


            estado.avaliacoes =
                Array.isArray(data)
                    ? data
                    : [];


            return estado.avaliacoes;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar avaliações.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR DADOS COMPLETOS

       FLUXO:

       1. Usuário
       2. Perfil
       3. Tipo do perfil
       4. Perfil artístico somente se artista
       5. Serviços somente se artista
       6. Portfólio
       7. Agenda
       8. Avaliações

       Carteira e transações NÃO são carregadas.
    ===================================================== */

    async function carregarTudo(
        opcoes = {}
    ) {

        const {

            usuarioId = null,

            perfilId = null,

            incluirServicos = true,

            incluirPortfolio = true,

            incluirAgenda = true,

            incluirAvaliacoes = true

        } = opcoes;


        const idUsuario =
            usuarioId ||
            estado.usuarioId ||
            await obterUsuarioId();


        if (!idUsuario) {

            throw new Error(
                "Usuário não autenticado."
            );

        }


        estado.usuarioId =
            idUsuario;


        /*
         * Limpa os dados dependentes do carregamento atual.
         *
         * Isso evita que dados de um artista anterior
         * permaneçam ao carregar um contratante.
         */

        estado.perfilArtista =
            null;

        estado.servicos =
            [];

        estado.portfolio =
            [];

        estado.agenda =
            [];

        estado.avaliacoes =
            [];

        estado.carregado =
            false;


        /* =================================================
           USUÁRIO
        ================================================= */

        await carregarUsuario(
            idUsuario
        );


        /* =================================================
           PERFIL
        ================================================= */

        if (perfilId) {

            await carregarPerfilPorId(
                perfilId
            );

        } else {

            await carregarPerfil(
                idUsuario
            );

        }


        /*
         * Sem perfil, não existem dados suficientes.
         */

        if (!estado.perfilId) {

            estado.carregado =
                true;

            return obterEstado();

        }


        /*
         * Garante que o tipo esteja atualizado.
         */

        atualizarTipoPerfil();


        console.log(
            "PerfilPublicoDados: tipo do perfil:",
            estado.tipoPerfil
        );


        /* =================================================
           PERFIL ARTÍSTICO
        ================================================= */

        if (
            ehArtista()
        ) {

            await carregarPerfilArtista(
                estado.perfilId
            );

        } else {

            /*
             * Garantia adicional:
             * contratante nunca mantém dados artísticos.
             */

            estado.perfilArtista =
                null;

            estado.servicos =
                [];

        }


        /* =================================================
           CONSULTAS COMPARTILHADAS
        ================================================= */

        const promessas =
            [];


        /*
         * Serviços:
         *
         * Somente artista.
         */

        if (
            incluirServicos &&
            ehArtista()
        ) {

            promessas.push(
                carregarServicos(
                    estado.perfilId
                )
            );

        }


        /*
         * Portfólio:
         *
         * Artista e contratante.
         */

        if (
            incluirPortfolio
        ) {

            promessas.push(
                carregarPortfolio(
                    estado.perfilId
                )
            );

        }


        /*
         * Agenda:
         *
         * Artista e contratante.
         */

        if (
            incluirAgenda
        ) {

            promessas.push(
                carregarAgenda(
                    estado.perfilId
                )
            );

        }


        /*
         * Avaliações:
         *
         * Artista e contratante.
         */

        if (
            incluirAvaliacoes
        ) {

            promessas.push(
                carregarAvaliacoes(
                    estado.perfilId
                )
            );

        }


        /*
         * Executa consultas independentes em paralelo.
         */

        await Promise.all(
            promessas
        );


        estado.carregado =
            true;


        return obterEstado();

    }


    /* =====================================================
       CARREGAR SOMENTE SERVIÇOS
    ===================================================== */

    async function carregarSomenteServicos(
        perfilId = null
    ) {

        return carregarServicos(
            perfilId
        );

    }


    /* =====================================================
       CARREGAR SOMENTE PORTFÓLIO
    ===================================================== */

    async function carregarSomentePortfolio(
        perfilId = null
    ) {

        return carregarPortfolio(
            perfilId
        );

    }


    /* =====================================================
       CARREGAR SOMENTE AGENDA
    ===================================================== */

    async function carregarSomenteAgenda(
        perfilId = null
    ) {

        return carregarAgenda(
            perfilId
        );

    }


    /* =====================================================
       CARREGAR SOMENTE AVALIAÇÕES
    ===================================================== */

    async function carregarSomenteAvaliacoes(
        perfilId = null
    ) {

        return carregarAvaliacoes(
            perfilId
        );

    }


    /* =====================================================
       OBTER ESTADO
    ===================================================== */

    function obterEstado() {

        return {

            usuarioId:
                estado.usuarioId,

            usuario:
                estado.usuario,

            perfil:
                estado.perfil,

            tipoPerfil:
                estado.tipoPerfil,

            perfilArtista:
                estado.perfilArtista,

            perfilId:
                estado.perfilId,

            servicos:
                Array.isArray(
                    estado.servicos
                )
                    ? [...estado.servicos]
                    : [],

            portfolio:
                Array.isArray(
                    estado.portfolio
                )
                    ? [...estado.portfolio]
                    : [],

            agenda:
                Array.isArray(
                    estado.agenda
                )
                    ? [...estado.agenda]
                    : [],

            avaliacoes:
                Array.isArray(
                    estado.avaliacoes
                )
                    ? [...estado.avaliacoes]
                    : [],

            carregado:
                estado.carregado

        };

    }


    /* =====================================================
       OBTER USUÁRIO
    ===================================================== */

    function obterUsuario() {

        return estado.usuario;

    }


    /* =====================================================
       OBTER PERFIL
    ===================================================== */

    function obterPerfil() {

        return estado.perfil;

    }


    /* =====================================================
       OBTER TIPO DO PERFIL
    ===================================================== */

    function obterTipoPerfil() {

        return estado.tipoPerfil;

    }


    /* =====================================================
       OBTER PERFIL ARTÍSTICO
    ===================================================== */

    function obterPerfilArtista() {

        return estado.perfilArtista;

    }


    /* =====================================================
       OBTER ID DO USUÁRIO
    ===================================================== */

    function obterUsuarioIdAtual() {

        return estado.usuarioId;

    }


    /* =====================================================
       OBTER ID DO PERFIL
    ===================================================== */

    function obterPerfilId() {

        return estado.perfilId;

    }


    /* =====================================================
       OBTER SERVIÇOS
    ===================================================== */

    function obterServicos() {

        return Array.isArray(
            estado.servicos
        )
            ? [...estado.servicos]
            : [];

    }


    /* =====================================================
       OBTER PORTFÓLIO
    ===================================================== */

    function obterPortfolio() {

        return Array.isArray(
            estado.portfolio
        )
            ? [...estado.portfolio]
            : [];

    }


    /* =====================================================
       OBTER AGENDA
    ===================================================== */

    function obterAgenda() {

        return Array.isArray(
            estado.agenda
        )
            ? [...estado.agenda]
            : [];

    }


    /* =====================================================
       OBTER AVALIAÇÕES
    ===================================================== */

    function obterAvaliacoes() {

        return Array.isArray(
            estado.avaliacoes
        )
            ? [...estado.avaliacoes]
            : [];

    }


    /* =====================================================
       LIMPAR ESTADO
    ===================================================== */

    function limpar() {

        estado.usuarioId =
            null;

        estado.usuario =
            null;

        estado.perfil =
            null;

        estado.tipoPerfil =
            null;

        estado.perfilArtista =
            null;

        estado.perfilId =
            null;

        estado.servicos =
            [];

        estado.portfolio =
            [];

        estado.agenda =
            [];

        estado.avaliacoes =
            [];

        estado.carregado =
            false;

    }


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    const PerfilPublicoDados = {

        CONFIG,

        estado,

        obterClienteSupabase,

        obterUsuarioId,

        carregarUsuario,

        carregarPerfis,

        carregarPerfil,

        carregarPerfilPorId,

        identificarTipoPerfil,

        normalizarTipoPerfil,

        atualizarTipoPerfil,

        ehArtista,

        ehContratante,

        carregarPerfilArtista,

        carregarServicos,

        carregarPortfolio,

        carregarAgenda,

        carregarAvaliacoes,

        carregarTudo,

        carregarSomenteServicos,

        carregarSomentePortfolio,

        carregarSomenteAgenda,

        carregarSomenteAvaliacoes,

        obterEstado,

        obterUsuario,

        obterPerfil,

        obterTipoPerfil,

        obterPerfilArtista,

        obterUsuarioIdAtual,

        obterPerfilId,

        obterServicos,

        obterPortfolio,

        obterAgenda,

        obterAvaliacoes,

        limpar

    };


    /* =====================================================
       DISPONIBILIZAR GLOBALMENTE
    ===================================================== */

    window.PerfilPublicoDados =
        PerfilPublicoDados;


    /* =====================================================
       CONFIRMAÇÃO DE CARREGAMENTO
    ===================================================== */

    console.log(
        "PerfilPublicoDados.js carregado."
    );


})(window);