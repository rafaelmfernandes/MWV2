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
   - Identificar corretamente o dono do perfil visualizado.
   - Identificar o participante relacionado a compromissos
     originados de uma contratação.
   - Identificar corretamente a foto do participante,
     seja ele artista ou contratante.

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
   - perfis_estabelecimentos
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

            perfisEstabelecimentos:
                "perfis_estabelecimentos",

            servicos:
                "servicos_artistas",

            portfolio:
                "portfolio_musicos",

            agenda:
                "agenda_musicos",

            avaliacoes:
                "avaliacoes_musicos",

            contratacoes:
                "contratacoes"

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

        usuarioPerfil:
            null,

        perfil:
            null,

        tipoPerfil:
            null,

        perfilArtista:
            null,

        perfilId:
            null,

        servicos:
            [],

        portfolio:
            [],

        agenda:
            [],

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
       CARREGAR USUÁRIO DO PERFIL VISUALIZADO
    ===================================================== */

    async function carregarUsuarioDoPerfil(
        perfil = null
    ) {

        if (
            !perfil ||
            !perfil.usuario_id
        ) {

            estado.usuarioPerfil =
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
                    CONFIG.tabelas.usuarios
                )
                .select("*")
                .eq(
                    "id",
                    perfil.usuario_id
                )
                .maybeSingle();


            if (error) {

                console.error(
                    "PerfilPublicoDados: erro ao carregar proprietário do perfil.",
                    error
                );

                throw error;

            }


            estado.usuarioPerfil =
                data || null;


            return estado.usuarioPerfil;

        } catch (erro) {

            console.error(
                "PerfilPublicoDados: falha ao carregar proprietário do perfil.",
                erro
            );

            throw erro;

        }

    }


    /* =====================================================
       CARREGAR PERFIS DO USUÁRIO
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


        return null;

    }


    /* =====================================================
       IDENTIFICAR TIPO DO PERFIL
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

            estado.usuarioPerfil =
                null;

            return null;

        }


        let perfilEncontrado =
            perfis.find(
                perfil => {

                    return (
                        perfil.ativo === true ||
                        perfil.status === "ativo"
                    );

                }
            );


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


        estado.usuarioPerfil =
            estado.usuario;


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

            estado.usuarioPerfil =
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


            await carregarUsuarioDoPerfil(
                estado.perfil
            );


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
    ===================================================== */

    async function carregarPerfilArtista(
        perfilId = null
    ) {

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
    ===================================================== */

    async function carregarServicos(
        perfilId = null
    ) {

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
       CARREGAR FOTO DO PARTICIPANTE NO STORAGE

       Estabelecimentos não possuem foto_url em
       perfis_estabelecimentos.

       O PerfilEditorFoto salva a foto diretamente no bucket
       perfil-musico, dentro da pasta correspondente ao
       usuario_id:

           perfil-musico/{usuario_id}/{arquivo}

       Como não existe uma coluna no banco apontando para
       o arquivo atual do estabelecimento, os arquivos da
       pasta são consultados e o mais recente é utilizado.

       Este recurso permanece como FALLBACK para casos em
       que usuarios.foto_url não estiver preenchido.
    ===================================================== */

    async function carregarFotoParticipanteStorage(
        usuarioId
    ) {

        if (!usuarioId) {

            return null;

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            return null;

        }


        try {

            const {
                data: arquivos,
                error
            } = await supabase
                .storage
                .from("perfil-musico")
                .list(
                    String(usuarioId),
                    {
                        limit: 100,
                        sortBy: {
                            column: "updated_at",
                            order: "desc"
                        }
                    }
                );


            if (error) {

                console.warn(
                    "PerfilPublicoDados: não foi possível carregar as fotos do participante no Storage.",
                    error
                );

                return null;

            }


            if (
                !Array.isArray(arquivos) ||
                !arquivos.length
            ) {

                return null;

            }


            /* -------------------------------------------------
               O Storage pode retornar entradas que não sejam
               imagens. Mantemos somente os formatos aceitos
               pelo PerfilEditorFoto.
            ------------------------------------------------- */

            const extensoesPermitidas = [
                "jpg",
                "jpeg",
                "png",
                "webp"
            ];


            const arquivosImagem =
                arquivos.filter(
                    arquivo => {

                        const nome =
                            String(
                                arquivo?.name || ""
                            )
                                .toLowerCase();

                        const extensao =
                            nome.includes(".")
                                ? nome
                                    .split(".")
                                    .pop()
                                : "";

                        return (
                            extensoesPermitidas.includes(
                                extensao
                            )
                        );

                    }
                );


            if (!arquivosImagem.length) {

                return null;

            }


            /* -------------------------------------------------
               O resultado já vem ordenado por updated_at.
               O primeiro arquivo de imagem é tratado como
               a foto mais recente do participante.
            ------------------------------------------------- */

            const arquivoAtual =
                arquivosImagem[0];


            if (
                !arquivoAtual?.name
            ) {

                return null;

            }


            const caminho =
                `${usuarioId}/${arquivoAtual.name}`;


            const {
                data
            } =
                supabase
                    .storage
                    .from("perfil-musico")
                    .getPublicUrl(
                        caminho
                    );


            return (
                data?.publicUrl ||
                null
            );

        } catch (erro) {

            console.warn(
                "PerfilPublicoDados: erro inesperado ao carregar foto do participante no Storage.",
                erro
            );

            return null;

        }

    }


    /* =====================================================
       CARREGAR PARTICIPANTE DE UMA CONTRATAÇÃO

       Esta função identifica o OUTRO participante da
       contratação em relação ao perfil que está sendo
       visualizado na agenda.

       FOTO:

       ARTISTA:
       - perfis_artistas.foto_url
       - usuarios.foto_url como fallback

       CONTRATANTE:
       - usuarios.foto_url
       - Storage perfil-musico/{usuario_id}/... como fallback

       O perfil geral é utilizado para descobrir o tipo,
       o perfil e o usuario_id.

    ===================================================== */

    async function carregarParticipanteContratacao(
        contratacaoId,
        perfilVisualizadoId
    ) {

        if (
            !contratacaoId ||
            !perfilVisualizadoId
        ) {

            return null;

        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            return null;

        }


        try {

            /* =================================================
               CARREGAR CONTRATAÇÃO
            ================================================= */

            const {
                data: contratacao,
                error: erroContratacao
            } = await supabase
                .from(
                    CONFIG.tabelas.contratacoes
                )
                .select(`
                    id,
                    contratante_id,
                    contratado_id
                `)
                .eq(
                    "id",
                    contratacaoId
                )
                .maybeSingle();


            if (erroContratacao) {

                console.warn(
                    "PerfilPublicoDados: não foi possível carregar a contratação da agenda.",
                    erroContratacao
                );

                return null;

            }


            if (!contratacao) {

                console.warn(
                    "PerfilPublicoDados: contratação não encontrada:",
                    contratacaoId
                );

                return null;

            }


            /* =================================================
               IDENTIFICAR USUÁRIO DO PERFIL VISUALIZADO
            ================================================= */

            const {
                data: perfilVisualizado,
                error: erroPerfil
            } = await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(
                    "id,usuario_id"
                )
                .eq(
                    "id",
                    perfilVisualizadoId
                )
                .maybeSingle();


            if (erroPerfil) {

                console.warn(
                    "PerfilPublicoDados: não foi possível identificar o usuário do perfil da agenda.",
                    erroPerfil
                );

                return null;

            }


            if (!perfilVisualizado?.usuario_id) {

                return null;

            }


            /* =================================================
               IDENTIFICAR O OUTRO PARTICIPANTE
            ================================================= */

            const usuarioVisualizado =
                String(
                    perfilVisualizado.usuario_id
                );


            const contratanteId =
                String(
                    contratacao.contratante_id || ""
                );


            const contratadoId =
                String(
                    contratacao.contratado_id || ""
                );


            let participanteUsuarioId =
                null;


            if (
                usuarioVisualizado ===
                contratanteId
            ) {

                participanteUsuarioId =
                    contratacao.contratado_id;

            } else if (
                usuarioVisualizado ===
                contratadoId
            ) {

                participanteUsuarioId =
                    contratacao.contratante_id;

            } else {

                console.warn(
                    "PerfilPublicoDados: o perfil visualizado não pertence aos participantes da contratação.",
                    {
                        perfilVisualizadoId,
                        usuarioVisualizado,
                        contratanteId,
                        contratadoId,
                        contratacaoId
                    }
                );

                return null;

            }


            if (!participanteUsuarioId) {

                return null;

            }


            /* =================================================
               CARREGAR PERFIL DO PARTICIPANTE
            ================================================= */

            const {
                data: perfilParticipante,
                error: erroPerfilParticipante
            } = await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(`
                    id,
                    usuario_id,
                    ${CONFIG.tabelas.tiposPerfil} (
                        id,
                        nome
                    )
                `)
                .eq(
                    "usuario_id",
                    participanteUsuarioId
                )
                .maybeSingle();


            if (erroPerfilParticipante) {

                console.warn(
                    "PerfilPublicoDados: erro ao carregar perfil do participante.",
                    erroPerfilParticipante
                );

                return null;

            }


            if (!perfilParticipante) {

                console.warn(
                    "PerfilPublicoDados: perfil do participante não encontrado.",
                    participanteUsuarioId
                );

                return null;

            }


            /* =================================================
               IDENTIFICAR TIPO DO PARTICIPANTE
            ================================================= */

            const tipoParticipante =
                identificarTipoPerfil(
                    perfilParticipante
                );


            /* =================================================
               CARREGAR USUÁRIO DO PARTICIPANTE

               usuarios.foto_url é carregado junto com os
               dados básicos do participante.

               A foto do usuário é mantida como fallback
               geral para evitar que uma eventual falha na
               identificação do tipo do perfil impeça a
               apresentação da foto.
            ================================================= */

            const {
                data: usuarioParticipante,
                error: erroUsuarioParticipante
            } = await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select(
                    "id,nome,email,foto_url"
                )
                .eq(
                    "id",
                    participanteUsuarioId
                )
                .maybeSingle();


            if (erroUsuarioParticipante) {

                console.warn(
                    "PerfilPublicoDados: erro ao carregar usuário participante.",
                    erroUsuarioParticipante
                );

            }


            /* =================================================
               FOTO DO PARTICIPANTE

               usuarios.foto_url começa como fallback geral.

               Artista:
               perfis_artistas.foto_url tem prioridade.

               Contratante:
               usuarios.foto_url é a fonte principal.

               Fallback final:
               Storage perfil-musico/{usuario_id}/...
            ================================================= */

            let fotoUrl =
                usuarioParticipante?.foto_url ||
                null;


            if (
                tipoParticipante ===
                CONFIG.tiposPerfil.artista
            ) {

                const {
                    data: perfilArtistaParticipante,
                    error: erroArtistaParticipante
                } = await supabase
                    .from(
                        CONFIG.tabelas.perfisArtistas
                    )
                    .select(
                        "foto_url"
                    )
                    .eq(
                        "perfil_id",
                        perfilParticipante.id
                    )
                    .maybeSingle();


                if (
                    erroArtistaParticipante
                ) {

                    console.warn(
                        "PerfilPublicoDados: perfil artístico do participante não disponível.",
                        erroArtistaParticipante
                    );

                }


                if (
                    perfilArtistaParticipante?.foto_url
                ) {

                    fotoUrl =
                        perfilArtistaParticipante.foto_url;

                }

            } else if (
                tipoParticipante ===
                CONFIG.tiposPerfil.contratante
            ) {

                /* -------------------------------------------------
                   ESTABELECIMENTO

                   A tabela perfis_estabelecimentos não possui
                   coluna de foto.

                   A foto oficial do estabelecimento está em:

                       usuarios.foto_url
                ------------------------------------------------- */

                fotoUrl =
                    usuarioParticipante?.foto_url ||
                    fotoUrl;


                if (!fotoUrl) {

                    fotoUrl =
                        await carregarFotoParticipanteStorage(
                            participanteUsuarioId
                        );

                }

            }


            /* =================================================
               FALLBACK FINAL

               Caso o tipo do participante não tenha sido
               identificado corretamente, ainda tentamos
               recuperar a foto pelo Storage.

               Isso não interfere no funcionamento normal
               de artistas ou contratantes.
            ================================================= */

            if (!fotoUrl) {

                fotoUrl =
                    await carregarFotoParticipanteStorage(
                        participanteUsuarioId
                    );

            }


            /* =================================================
               RESULTADO NORMALIZADO
            ================================================= */

            const participante = {

                perfilId:
                    perfilParticipante.id || null,

                usuarioId:
                    participanteUsuarioId,

                nome:
                    usuarioParticipante?.nome ||
                    "Usuário",

                fotoUrl:
                    fotoUrl || null

            };


            console.log(
                "PerfilPublicoDados: participante da contratação carregado:",
                participante
            );


            return participante;

        } catch (erro) {

            console.warn(
                "PerfilPublicoDados: falha ao carregar participante da contratação.",
                erro
            );

            return null;

        }

    }


    /* =====================================================
       CARREGAR DADOS DOS PARTICIPANTES DA AGENDA
    ===================================================== */

    async function carregarParticipantesDaAgenda(
        agenda,
        perfilId
    ) {

        if (
            !Array.isArray(agenda) ||
            !agenda.length ||
            !perfilId
        ) {

            return agenda;

        }


        const agendaEnriquecida =
            await Promise.all(

                agenda.map(
                    async evento => {

                        if (
                            !evento?.contratacao_id
                        ) {

                            return evento;

                        }


                        const participante =
                            await carregarParticipanteContratacao(
                                evento.contratacao_id,
                                perfilId
                            );


                        return {

                            ...evento,

                            participanteAgenda:
                                participante

                        };

                    }
                )

            );


        return agendaEnriquecida;

    }


    /* =====================================================
       CARREGAR AGENDA
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


            const agendaBase =
                Array.isArray(data)
                    ? data
                    : [];


            estado.agenda =
                await carregarParticipantesDaAgenda(
                    agendaBase,
                    id
                );


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


        estado.usuarioPerfil =
            null;

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
           USUÁRIO AUTENTICADO
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


        if (!estado.perfilId) {

            estado.carregado =
                true;

            return obterEstado();

        }


        atualizarTipoPerfil();


        console.log(
            "PerfilPublicoDados: tipo do perfil:",
            estado.tipoPerfil
        );


        /* =================================================
           GARANTIR USUÁRIO PROPRIETÁRIO
        ================================================= */

        if (!estado.usuarioPerfil) {

            if (
                estado.perfil?.usuario_id ===
                estado.usuarioId
            ) {

                estado.usuarioPerfil =
                    estado.usuario;

            } else {

                await carregarUsuarioDoPerfil(
                    estado.perfil
                );

            }

        }


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


        if (
            incluirPortfolio
        ) {

            promessas.push(
                carregarPortfolio(
                    estado.perfilId
                )
            );

        }


        if (
            incluirAgenda
        ) {

            promessas.push(
                carregarAgenda(
                    estado.perfilId
                )
            );

        }


        if (
            incluirAvaliacoes
        ) {

            promessas.push(
                carregarAvaliacoes(
                    estado.perfilId
                )
            );

        }


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

            usuarioPerfil:
                estado.usuarioPerfil,

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
       OBTER USUÁRIO DO PERFIL
    ===================================================== */

    function obterUsuarioPerfil() {

        return estado.usuarioPerfil;

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

        estado.usuarioPerfil =
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

        carregarUsuarioDoPerfil,

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

        carregarParticipanteContratacao,

        carregarParticipantesDaAgenda,

        carregarAvaliacoes,

        carregarTudo,

        carregarSomenteServicos,

        carregarSomentePortfolio,

        carregarSomenteAgenda,

        carregarSomenteAvaliacoes,

        obterEstado,

        obterUsuario,

        obterUsuarioPerfil,

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