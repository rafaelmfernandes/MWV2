(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — APRESENTAÇÃO DE PERFIL — DADOS

       Arquivo:
       js/apresentar-perfil-teste/ApresentarPerfilDados.js

       Responsabilidades:
       - Identificar o perfil pela URL.
       - Acessar o cliente Supabase centralizado.
       - Buscar os dados principais do perfil.
       - Buscar os dados do usuário.
       - Buscar os dados específicos do artista.
       - Buscar avaliações.
       - Buscar os usuários que fizeram as avaliações.
       - Buscar serviços do artista.
       - Disponibilizar todos os dados para os demais módulos.

       Este arquivo NÃO é responsável por:
       - Criar HTML.
       - Manipular o visual da página.
       - Renderizar portfólio.
       - Renderizar serviços.
       - Renderizar avaliações.
       - Controlar botões ou ações.

       A conexão com o Supabase continua centralizada em:
       js/core/SupabaseClient.js

       IMPORTANTE:
       Os demais módulos da página não devem criar consultas
       próprias ao Supabase quando os dados já estiverem
       disponíveis neste módulo.
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
    ========================================================= */

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

            avaliacoes:
                "avaliacoes_musicos",

            servicos:
                "servicos_artistas"

        }

    };


    /* =========================================================
       ESTADO INTERNO
    ========================================================= */

    const estado = {

        carregando: false,

        carregado: false,

        erro: null,

        perfilId: null,

        dados: {

            usuario: null,

            perfil: null,

            perfilArtista: null,

            tipoPerfil: null,

            avaliacoes: [],

            servicos: []

        }

    };


    /* =========================================================
       CLIENTE SUPABASE
    ========================================================= */

    function obterClienteSupabase() {

        /*
         * Cliente central utilizado pelo projeto.
         */
        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            return window.supabaseClient;

        }


        /*
         * Compatibilidade com a referência antiga.
         */
        if (
            window._supabase &&
            typeof window._supabase.from === "function"
        ) {

            return window._supabase;

        }


        /*
         * Compatibilidade adicional.
         */
        if (
            window.supabase &&
            typeof window.supabase.from === "function"
        ) {

            return window.supabase;

        }


        console.error(
            "MusicalWorld — Cliente Supabase não encontrado."
        );


        return null;
    }


    /* =========================================================
       ID DO PERFIL
    ========================================================= */

    function obterPerfilIdDaUrl() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const id =

            parametros.get("id") ||

            parametros.get("perfil_id") ||

            parametros.get("perfilId");


        if (!id) {

            console.error(
                "MusicalWorld — ID do perfil não encontrado na URL."
            );


            return null;
        }


        return id.trim();

    }


    /* =========================================================
       NORMALIZAÇÃO DE ID
    ========================================================= */

    function normalizarId(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return null;
        }


        return String(
            valor
        ).trim();

    }


    /* =========================================================
       CARREGAR PERFIL
    ========================================================= */

    async function carregarPerfil(perfilId) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        const id =
            normalizarId(
                perfilId
            );


        if (!id) {

            throw new Error(
                "ID do perfil não informado."
            );

        }


        const {

            data,

            error

        } = await supabase

            .from(
                CONFIG.tabelas.perfis
            )

            .select(`
                *,
                tipo:tipos_perfil (
                    id,
                    nome
                )
            `)

            .eq(
                "id",
                id
            )

            .maybeSingle();


        if (error) {

            console.error(
                "MusicalWorld — Erro ao carregar perfil:",
                error
            );


            throw error;

        }


        if (!data) {

            throw new Error(
                "Perfil não encontrado."
            );

        }


        estado.dados.perfil =
            data;


        /*
         * O relacionamento com tipos_perfil fornece
         * o tipo geral do perfil.
         */
        if (data.tipo) {

            estado.dados.tipoPerfil =
                data.tipo;

        }


        return data;

    }


    /* =========================================================
       CARREGAR USUÁRIO
    ========================================================= */

    async function carregarUsuario(perfil) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        if (
            !perfil ||
            !perfil.usuario_id
        ) {

            console.warn(
                "MusicalWorld — Perfil sem usuario_id."
            );


            estado.dados.usuario =
                null;


            return null;

        }


        const usuarioId =
            normalizarId(
                perfil.usuario_id
            );


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
                usuarioId
            )

            .maybeSingle();


        if (error) {

            console.error(
                "MusicalWorld — Erro ao carregar usuário:",
                error
            );


            throw error;

        }


        estado.dados.usuario =
            data || null;


        return estado.dados.usuario;

    }


    /* =========================================================
       CARREGAR PERFIL DO ARTISTA
    ========================================================= */

    async function carregarPerfilArtista(perfilId) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        const id =
            normalizarId(
                perfilId
            );


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
                "MusicalWorld — Erro ao carregar perfil do artista:",
                error
            );


            throw error;

        }


        estado.dados.perfilArtista =
            data || null;


        /*
         * Caso o relacionamento com tipos_perfil não esteja
         * disponível ou o tipo_artista seja a informação
         * específica disponível, mantemos essa informação
         * no mesmo objeto utilizado pelo Render.
         */
        if (
            data &&
            data.tipo_artista
        ) {

            estado.dados.tipoPerfil = {

                ...(estado.dados.tipoPerfil || {}),

                nome:
                    data.tipo_artista

            };

        }


        return estado.dados.perfilArtista;

    }


    /* =========================================================
       CARREGAR USUÁRIOS DAS AVALIAÇÕES
    ========================================================= */

    async function carregarUsuariosAvaliadores(
        avaliacoes
    ) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        if (
            !Array.isArray(avaliacoes) ||
            !avaliacoes.length
        ) {

            return avaliacoes;

        }


        /*
         * Obtém somente os IDs existentes nas avaliações.
         */
        const ids = [

            ...new Set(

                avaliacoes

                    .map(
                        avaliacao =>
                            normalizarId(
                                avaliacao.usuario_avaliador_id
                            )
                    )

                    .filter(
                        Boolean
                    )

            )

        ];


        if (!ids.length) {

            return avaliacoes;

        }


        /*
         * Buscamos somente os campos necessários
         * para a identificação visual do avaliador.
         *
         * O campo nome existe na tabela usuarios.
         */
        const {

            data,

            error

        } = await supabase

            .from(
                CONFIG.tabelas.usuarios
            )

            .select(`
                id,
                nome
            `)

            .in(
                "id",
                ids
            );


        if (error) {

            /*
             * A avaliação continua válida mesmo se
             * não conseguirmos carregar o nome.
             */
            console.warn(
                "MusicalWorld — Não foi possível carregar os usuários avaliadores:",
                error
            );


            return avaliacoes;

        }


        const usuarios =
            Array.isArray(data)
                ? data
                : [];


        const mapaUsuarios =
            new Map();


        usuarios.forEach(
            usuario => {

                mapaUsuarios.set(
                    normalizarId(
                        usuario.id
                    ),
                    usuario
                );

            }
        );


        /*
         * Associamos o usuário à avaliação.
         *
         * Não alteramos os campos originais da avaliação.
         */
        return avaliacoes.map(
            avaliacao => {

                const usuario =
                    mapaUsuarios.get(
                        normalizarId(
                            avaliacao.usuario_avaliador_id
                        )
                    ) || null;


                return {

                    ...avaliacao,

                    usuario_avaliador:
                        usuario

                };

            }
        );

    }


    /* =========================================================
       CARREGAR AVALIAÇÕES
    ========================================================= */

    async function carregarAvaliacoes(perfilId) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        const id =
            normalizarId(
                perfilId
            );


        /*
         * Buscamos somente avaliações ativas.
         */
        let resultado =
            await supabase

                .from(
                    CONFIG.tabelas.avaliacoes
                )

                .select(`
                    id,
                    perfil_id,
                    usuario_avaliador_id,
                    nota,
                    comentario,
                    ativo,
                    created_at,
                    updated_at,
                    contratacao_id
                `)

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
         * Algumas instalações podem não possuir
         * created_at.
         *
         * Nesse caso fazemos uma segunda consulta
         * sem a ordenação.
         */
        if (
            resultado.error &&
            resultado.error.message &&
            resultado.error.message
                .toLowerCase()
                .includes("created_at")
        ) {

            resultado =
                await supabase

                    .from(
                        CONFIG.tabelas.avaliacoes
                    )

                    .select(`
                        id,
                        perfil_id,
                        usuario_avaliador_id,
                        nota,
                        comentario,
                        ativo,
                        contratacao_id
                    `)

                    .eq(
                        "perfil_id",
                        id
                    )

                    .eq(
                        "ativo",
                        true
                    );

        }


        if (resultado.error) {

            console.error(
                "MusicalWorld — Erro ao carregar avaliações:",
                resultado.error
            );


            /*
             * Avaliações não impedem a abertura
             * do perfil.
             */
            estado.dados.avaliacoes =
                [];


            return [];

        }


        let avaliacoes =

            Array.isArray(
                resultado.data
            )

                ? resultado.data

                : [];


        /*
         * Depois de carregar as avaliações,
         * buscamos os usuários que fizeram cada uma.
         */
        avaliacoes =
            await carregarUsuariosAvaliadores(
                avaliacoes
            );


        estado.dados.avaliacoes =
            avaliacoes;


        console.log(
            "MusicalWorld — Avaliações carregadas:",
            avaliacoes.length
        );


        return estado.dados.avaliacoes;

    }


    /* =========================================================
       CARREGAR SERVIÇOS
    ========================================================= */

    async function carregarServicos(perfilId) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        const id =
            normalizarId(
                perfilId
            );


        if (!id) {

            estado.dados.servicos =
                [];


            return [];

        }


        /*
         * Primeira tentativa:
         *
         * carregamos todos os campos da tabela.
         *
         * A ordenação por created_at é útil quando
         * essa coluna existe.
         */
        let resultado =
            await supabase

                .from(
                    CONFIG.tabelas.servicos
                )

                .select("*")

                .eq(
                    "perfil_id",
                    id
                )

                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        /*
         * Algumas versões da tabela podem não possuir
         * created_at.
         *
         * Nesse caso fazemos uma nova consulta sem
         * a ordenação.
         */
        if (
            resultado.error
        ) {

            const mensagem =
                resultado.error.message
                    ? String(
                        resultado.error.message
                    ).toLowerCase()
                    : "";


            if (
                mensagem.includes(
                    "created_at"
                )
            ) {

                console.warn(
                    "MusicalWorld — created_at não disponível em servicos_artistas. Tentando novamente sem ordenação."
                );


                resultado =
                    await supabase

                        .from(
                            CONFIG.tabelas.servicos
                        )

                        .select("*")

                        .eq(
                            "perfil_id",
                            id
                        );

            }

        }


        if (resultado.error) {

            console.error(
                "MusicalWorld — Erro ao carregar serviços:",
                resultado.error
            );


            /*
             * Serviços não devem impedir a abertura
             * do perfil.
             */
            estado.dados.servicos =
                [];


            return [];

        }


        estado.dados.servicos =

            Array.isArray(
                resultado.data
            )

                ? resultado.data

                : [];


        console.log(
            "MusicalWorld — Serviços carregados:",
            estado.dados.servicos.length
        );


        return estado.dados.servicos;

    }


    /* =========================================================
       CARREGAR TODOS OS DADOS
    ========================================================= */

    async function carregarTudo(opcoes) {

        if (estado.carregando) {

            return estado.dados;

        }


        estado.carregando =
            true;


        estado.carregado =
            false;


        estado.erro =
            null;


        try {

            /*
             * Primeiro identificamos o perfil.
             */
            const perfilId =

                opcoes &&
                opcoes.perfilId

                    ? normalizarId(
                        opcoes.perfilId
                    )

                    : obterPerfilIdDaUrl();


            if (!perfilId) {

                throw new Error(
                    "Não foi possível identificar o perfil."
                );

            }


            estado.perfilId =
                perfilId;


            /*
             * Primeiro carregamos o perfil principal.
             *
             * O usuario_id necessário para buscar o usuário
             * vem desse registro.
             */
            const perfil =
                await carregarPerfil(
                    perfilId
                );


            /*
             * Depois carregamos os dados independentes.
             *
             * Um problema em avaliações ou serviços não
             * impede o carregamento dos dados principais.
             */
            await Promise.all([

                carregarUsuario(
                    perfil
                ),

                carregarPerfilArtista(
                    perfilId
                ),

                carregarAvaliacoes(
                    perfilId
                ),

                carregarServicos(
                    perfilId
                )

            ]);


            estado.carregado =
                true;


            console.log(
                "MusicalWorld — Dados do perfil carregados:",
                estado.dados
            );


            return estado.dados;


        } catch (erro) {

            estado.erro =
                erro;


            console.error(
                "MusicalWorld — Erro ao carregar dados do perfil:",
                erro
            );


            throw erro;


        } finally {

            estado.carregando =
                false;

        }

    }


    /* =========================================================
       GETTERS
    ========================================================= */

    function obterDados() {

        return estado.dados;

    }


    function obterUsuario() {

        return estado.dados.usuario;

    }


    function obterPerfil() {

        return estado.dados.perfil;

    }


    function obterPerfilArtista() {

        return estado.dados.perfilArtista;

    }


    function obterTipoPerfil() {

        return estado.dados.tipoPerfil;

    }


    function obterAvaliacoes() {

        return [

            ...estado.dados.avaliacoes

        ];

    }


    function obterServicos() {

        return [

            ...estado.dados.servicos

        ];

    }


    function obterPerfilId() {

        return estado.perfilId;

    }


    function estaCarregado() {

        return estado.carregado;

    }


    function estaCarregando() {

        return estado.carregando;

    }


    function obterErro() {

        return estado.erro;

    }


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    window.ApresentarPerfilDadosTeste = {

        carregarTudo,

        carregarPerfil,

        carregarUsuario,

        carregarPerfilArtista,

        carregarAvaliacoes,

        carregarUsuariosAvaliadores,

        carregarServicos,

        obterPerfilIdDaUrl,

        obterDados,

        obterUsuario,

        obterPerfil,

        obterPerfilArtista,

        obterTipoPerfil,

        obterAvaliacoes,

        obterServicos,

        obterPerfilId,

        estaCarregado,

        estaCarregando,

        obterErro

    };


    /* =========================================================
       DIAGNÓSTICO
    ========================================================= */

    console.log(
        "ApresentarPerfilDadosTeste carregado."
    );


})(window);