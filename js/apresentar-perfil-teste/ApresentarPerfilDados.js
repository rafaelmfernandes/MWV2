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
       - Buscar os dados específicos do estabelecimento.
       - Buscar avaliações.
       - Buscar os usuários que fizeram as avaliações.
       - Buscar serviços do artista.
       - Buscar agenda/eventos do perfil.
       - Buscar os dados do artista contratado quando
         um evento estiver vinculado a uma contratação.
       - Disponibilizar todos os dados para os demais módulos.

       REGRA DE AGENDA PÚBLICA:
       - Somente perfis de estabelecimento possuem agenda
         pública para outros usuários.
       - A agenda pública de estabelecimento utiliza a RPC:
         buscar_agenda_publica_estabelecimento
       - Contratações entre artistas continuam privadas.
       - Dados financeiros e privados das contratações não
         são expostos pela agenda pública.

       Este arquivo NÃO é responsável por:
       - Criar HTML.
       - Manipular o visual da página.
       - Renderizar portfólio.
       - Renderizar serviços.
       - Renderizar avaliações.
       - Renderizar agenda/eventos.
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

            perfisEstabelecimentos:
                "perfis_estabelecimentos",

            avaliacoes:
                "avaliacoes_musicos",

            servicos:
                "servicos_artistas",

            agenda:
                "agenda_musicos",

            contratacoes:
                "contratacoes"

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

            perfilEstabelecimento: null,

            tipoPerfil: null,

            avaliacoes: [],

            servicos: [],

            agenda: []

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
       CARREGAR PERFIL DO ESTABELECIMENTO
    =========================================================

       Busca os dados complementares existentes em:

       public.perfis_estabelecimentos

       O registro está relacionado diretamente ao:
       perfis.id

       Caso o perfil seja um artista e não exista registro
       nesta tabela, o resultado será simplesmente null.

       Isso permite que o mesmo módulo trabalhe com:

       - artistas
       - estabelecimentos
       ========================================================= */

    async function carregarPerfilEstabelecimento(perfilId) {

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

            estado.dados.perfilEstabelecimento =
                null;


            return null;

        }


        const {

            data,

            error

        } = await supabase

            .from(
                CONFIG.tabelas.perfisEstabelecimentos
            )

            .select("*")

            .eq(
                "perfil_id",
                id
            )

            .maybeSingle();


        if (error) {

            console.error(
                "MusicalWorld — Erro ao carregar perfil do estabelecimento:",
                error
            );


            throw error;

        }


        estado.dados.perfilEstabelecimento =
            data || null;


        console.log(
            "MusicalWorld — Perfil do estabelecimento carregado:",
            estado.dados.perfilEstabelecimento
        );


        return estado.dados.perfilEstabelecimento;

    }


    /* =========================================================
       CARREGAR DADOS DOS ARTISTAS DAS CONTRATAÇÕES
    =========================================================

       Esta função é utilizada somente pelo fluxo privado
       da agenda de perfis que não são estabelecimentos.

       Para estabelecimentos, a agenda pública NÃO utiliza
       esta função.

       A agenda pública de estabelecimentos utiliza a RPC:

       buscar_agenda_publica_estabelecimento

       Dessa forma:

       - estabelecimento → agenda pública controlada pela RPC;
       - artista → agenda continua privada;
       - contratação entre artistas continua protegida.

       IMPORTANTE:

       contratado_id referencia usuarios.id.

       Portanto:

       contratacoes.contratado_id
                    ↓
               usuarios.id
                    ↓
               perfis.usuario_id
                    ↓
                 perfis.id
                    ↓
             perfis_artistas

       Esta função não cria HTML.
       ========================================================= */

    async function carregarArtistasDasContratacoes(
        agenda
    ) {

        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        if (
            !Array.isArray(agenda) ||
            !agenda.length
        ) {

            return agenda;

        }


        /*
         * Somente eventos que possuem uma contratação
         * precisam dessa consulta adicional.
         */
        const contratacaoIds = [

            ...new Set(

                agenda

                    .map(
                        evento =>
                            normalizarId(
                                evento.contratacao_id
                            )
                    )

                    .filter(
                        Boolean
                    )

            )

        ];


        if (!contratacaoIds.length) {

            return agenda;

        }


        /* =====================================================
           BUSCAR CONTRATAÇÕES
        ===================================================== */

        const {

            data: contratacoes,

            error: erroContratacoes

        } = await supabase

            .from(
                CONFIG.tabelas.contratacoes
            )

            .select(`
                id,
                contratado_id
            `)

            .in(
                "id",
                contratacaoIds
            );


        if (erroContratacoes) {

            console.warn(
                "MusicalWorld — Não foi possível carregar as contratações da agenda:",
                erroContratacoes
            );


            return agenda;

        }


        const listaContratacoes =

            Array.isArray(
                contratacoes
            )

                ? contratacoes

                : [];


        if (!listaContratacoes.length) {

            return agenda;

        }


        /*
         * Mapa:
         *
         * contratacao_id
         * ->
         * contratado_id
         *
         * IMPORTANTE:
         * contratado_id é usuarios.id.
         */
        const mapaContratacoes =
            new Map();


        listaContratacoes.forEach(
            contratacao => {

                mapaContratacoes.set(

                    normalizarId(
                        contratacao.id
                    ),

                    normalizarId(
                        contratacao.contratado_id
                    )

                );

            }
        );


        /* =====================================================
           BUSCAR USUÁRIOS DOS ARTISTAS CONTRATADOS
        ===================================================== */

        const usuarioArtistaIds = [

            ...new Set(

                listaContratacoes

                    .map(
                        contratacao =>
                            normalizarId(
                                contratacao.contratado_id
                            )
                    )

                    .filter(
                        Boolean
                    )

            )

        ];


        if (!usuarioArtistaIds.length) {

            return agenda;

        }


        let usuarios = [];


        const {

            data: usuariosContratados,

            error: erroUsuarios

        } = await supabase

            .from(
                CONFIG.tabelas.usuarios
            )

            .select(`
                id,
                nome,
                foto_url
            `)

            .in(
                "id",
                usuarioArtistaIds
            );


        if (erroUsuarios) {

            console.warn(
                "MusicalWorld — Não foi possível carregar os usuários dos artistas contratados:",
                erroUsuarios
            );


            return agenda;

        }


        usuarios =

            Array.isArray(
                usuariosContratados
            )

                ? usuariosContratados

                : [];


        if (!usuarios.length) {

            return agenda;

        }


        /* =====================================================
           BUSCAR PERFIS DOS ARTISTAS
        ===================================================== */

        const {

            data: perfisArtistasContratados,

            error: erroPerfis

        } = await supabase

            .from(
                CONFIG.tabelas.perfis
            )

            .select(`
                id,
                usuario_id,
                nome_exibicao
            `)

            .in(
                "usuario_id",
                usuarioArtistaIds
            );


        if (erroPerfis) {

            console.warn(
                "MusicalWorld — Não foi possível carregar os perfis dos artistas contratados:",
                erroPerfis
            );


            return agenda;

        }


        const listaPerfis =

            Array.isArray(
                perfisArtistasContratados
            )

                ? perfisArtistasContratados

                : [];


        if (!listaPerfis.length) {

            return agenda;

        }


        /*
         * IDs dos perfis encontrados.
         *
         * Esses IDs agora são realmente perfis.id,
         * portanto podem ser utilizados com segurança
         * em perfis_artistas.perfil_id.
         */
        const perfilArtistaIds = [

            ...new Set(

                listaPerfis

                    .map(
                        perfil =>
                            normalizarId(
                                perfil.id
                            )
                    )

                    .filter(
                        Boolean
                    )

            )

        ];


        if (!perfilArtistaIds.length) {

            return agenda;

        }


        /* =====================================================
           BUSCAR DADOS PROFISSIONAIS DOS ARTISTAS
        ===================================================== */

        const {

            data: dadosArtistas,

            error: erroDadosArtistas

        } = await supabase

            .from(
                CONFIG.tabelas.perfisArtistas
            )

            .select(`
                perfil_id,
                tipo_artista,
                estilos,
                instrumentos,
                foto_url
            `)

            .in(
                "perfil_id",
                perfilArtistaIds
            );


        if (erroDadosArtistas) {

            console.warn(
                "MusicalWorld — Não foi possível carregar os dados profissionais dos artistas contratados:",
                erroDadosArtistas
            );

        }


        const listaDadosArtistas =

            Array.isArray(
                dadosArtistas
            )

                ? dadosArtistas

                : [];


        /* =====================================================
           MAPAS PARA ASSOCIAÇÃO
        ===================================================== */

        const mapaPerfis =
            new Map();

        const mapaUsuarios =
            new Map();

        const mapaDadosArtistas =
            new Map();


        listaPerfis.forEach(
            perfil => {

                mapaPerfis.set(

                    normalizarId(
                        perfil.usuario_id
                    ),

                    perfil

                );

            }
        );


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


        listaDadosArtistas.forEach(
            dadosArtista => {

                mapaDadosArtistas.set(

                    normalizarId(
                        dadosArtista.perfil_id
                    ),

                    dadosArtista

                );

            }
        );


        /* =====================================================
           ASSOCIAR ARTISTA À AGENDA
        ===================================================== */

        return agenda.map(
            evento => {

                const contratacaoId =
                    normalizarId(
                        evento.contratacao_id
                    );


                /*
                 * Evento sem contratação:
                 * permanece exatamente como estava.
                 */
                if (!contratacaoId) {

                    return evento;

                }


                /*
                 * Primeiro identificamos o usuário contratado.
                 */
                const contratadoId =
                    mapaContratacoes.get(
                        contratacaoId
                    );


                if (!contratadoId) {

                    return evento;

                }


                /*
                 * Agora encontramos o perfil através
                 * de perfis.usuario_id.
                 *
                 * contratadoId NÃO é perfil.id.
                 */
                const perfilArtista =
                    mapaPerfis.get(
                        contratadoId
                    ) || null;


                if (!perfilArtista) {

                    return evento;

                }


                /*
                 * O usuário já foi carregado diretamente
                 * através do contratado_id.
                 */
                const usuario =
                    mapaUsuarios.get(
                        contratadoId
                    ) || null;


                /*
                 * Os dados profissionais utilizam
                 * o verdadeiro perfil.id.
                 */
                const dadosArtista =
                    mapaDadosArtistas.get(

                        normalizarId(
                            perfilArtista.id
                        )

                    ) || null;


                /*
                 * A foto pode estar em:
                 *
                 * 1. perfis_artistas.foto_url
                 * 2. usuarios.foto_url
                 *
                 * Priorizamos a foto específica do perfil
                 * artístico.
                 */
                const fotoUrl =

                    (
                        dadosArtista &&
                        dadosArtista.foto_url
                    )

                        ?

                        dadosArtista.foto_url

                        :

                        (
                            usuario &&
                            usuario.foto_url
                        )

                            ?

                            usuario.foto_url

                            :

                            null;


                /*
                 * O nome público do artista vem primeiro
                 * de nome_exibicao.
                 *
                 * Caso não exista, usamos o nome da conta.
                 */
                const nome =

                    perfilArtista.nome_exibicao

                        ?

                        perfilArtista.nome_exibicao

                        :

                        (
                            usuario &&
                            usuario.nome
                        )

                            ?

                            usuario.nome

                            :

                            "Artista";


                return {

                    ...evento,

                    artista: {

                        perfil_id:
                            perfilArtista.id,

                        usuario_id:
                            perfilArtista.usuario_id,

                        nome,

                        foto_url:
                            fotoUrl,

                        tipo_artista:

                            dadosArtista &&
                            dadosArtista.tipo_artista

                                ?

                                dadosArtista.tipo_artista

                                :

                                null,

                        estilos:

                            dadosArtista &&
                            dadosArtista.estilos

                                ?

                                dadosArtista.estilos

                                :

                                null,

                        instrumentos:

                            dadosArtista &&
                            dadosArtista.instrumentos

                                ?

                                dadosArtista.instrumentos

                                :

                                null

                    }

                };

            }
        );

    }


    /* =========================================================
       CARREGAR AGENDA / EVENTOS
    =========================================================

       REGRA:

       ESTABELECIMENTO
       ----------------
       A agenda pública é carregada pela RPC:

       buscar_agenda_publica_estabelecimento

       A RPC já controla:

       - perfil ativo;
       - perfil publicado;
       - tipo de perfil estabelecimento;
       - agenda confirmada;
       - contratação válida;
       - artista contratado;
       - dados públicos do artista.

       ARTISTA
       -------
       A agenda continua sendo carregada pela consulta
       privada existente.

       Portanto:

       estabelecimento → agenda pública
       artista         → agenda privada

       Importante:
       Não confiamos somente no estado interno para saber
       se o perfil é estabelecimento, porque carregarTudo()
       utiliza Promise.all() e as consultas são executadas
       simultaneamente.

       Por isso fazemos uma consulta direta e simples em
       perfis_estabelecimentos antes de decidir qual fluxo
       utilizar.

       ========================================================= */

    async function carregarAgenda(perfilId) {

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

            estado.dados.agenda =
                [];


            return [];

        }


        /* =====================================================
           IDENTIFICAR SE O PERFIL É ESTABELECIMENTO
        =====================================================

           Não dependemos de estado.dados.perfilEstabelecimento
           porque carregarAgenda() pode executar em paralelo
           com carregarPerfilEstabelecimento().

           A existência de um registro em
           perfis_estabelecimentos identifica o perfil como
           estabelecimento.

           A RPC pública fará a validação definitiva do tipo,
           status e publicação.
        */

        const {

            data: estabelecimento,

            error: erroEstabelecimento

        } = await supabase

            .from(
                CONFIG.tabelas.perfisEstabelecimentos
            )

            .select(`
                id,
                perfil_id
            `)

            .eq(
                "perfil_id",
                id
            )

            .maybeSingle();


        if (erroEstabelecimento) {

            console.warn(
                "MusicalWorld — Não foi possível verificar se o perfil possui agenda pública de estabelecimento:",
                erroEstabelecimento
            );

        }


        /* =====================================================
           AGENDA PÚBLICA DO ESTABELECIMENTO
        ===================================================== */

        if (
            estabelecimento &&
            estabelecimento.id
        ) {

            const {

                data,
                error

            } = await supabase.rpc(

                "buscar_agenda_publica_estabelecimento",

                {
                    p_perfil_id:
                        Number(id)
                }

            );


            if (error) {

                console.error(
                    "MusicalWorld — Erro ao carregar agenda pública do estabelecimento:",
                    error
                );


                /*
                 * A agenda não deve impedir a abertura
                 * do perfil.
                 */
                estado.dados.agenda =
                    [];


                return [];

            }


            const agendaPublica =

                Array.isArray(data)

                    ? data

                    : [];


            /*
             * A RPC já retorna o artista contratado.
             *
             * Não executamos carregarArtistasDasContratacoes()
             * aqui porque isso faria uma consulta direta
             * em contratacoes.
             *
             * Para usuários que não participam da contratação,
             * essa tabela continua protegida pela RLS.
             */
            estado.dados.agenda =
                agendaPublica;


            console.log(
                "MusicalWorld — Agenda pública do estabelecimento carregada:",
                estado.dados.agenda.length
            );


            console.log(
                "MusicalWorld — Artistas vinculados à agenda pública:",
                estado.dados.agenda.filter(
                    evento =>
                        evento &&
                        evento.artista
                ).length
            );


            return estado.dados.agenda;

        }


        /* =====================================================
           AGENDA PRIVADA DE ARTISTA
        =====================================================

           Se não existe registro em
           perfis_estabelecimentos, seguimos o fluxo
           tradicional.

           Dessa forma, uma agenda de artista não é
           transformada em agenda pública.
        */


        const {

            data,

            error

        } = await supabase

            .from(
                CONFIG.tabelas.agenda
            )

            .select(`
                id,
                perfil_id,
                titulo,
                descricao,
                tipo,
                data_inicio,
                data_fim,
                localizacao,
                status,
                contratacao_id,
                created_at,
                updated_at
            `)

            .eq(
                "perfil_id",
                id
            )

            .in(
                "status",
                [
                    "agendado",
                    "confirmado"
                ]
            )

            .order(
                "data_inicio",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "MusicalWorld — Erro ao carregar agenda:",
                error
            );


            /*
             * A agenda não deve impedir a abertura
             * do perfil.
             */
            estado.dados.agenda =
                [];


            return [];

        }


        let agenda =

            Array.isArray(
                data
            )

                ? data

                : [];


        /*
         * Para perfis que não são estabelecimentos,
         * mantemos o enriquecimento privado existente.
         */
        agenda =
            await carregarArtistasDasContratacoes(
                agenda
            );


        estado.dados.agenda =
            agenda;


        console.log(
            "MusicalWorld — Agenda carregada:",
            estado.dados.agenda.length
        );


        console.log(
            "MusicalWorld — Artistas vinculados à agenda:",
            estado.dados.agenda.filter(
                evento =>
                    evento &&
                    evento.artista
            ).length
        );


        return estado.dados.agenda;

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
             *
             * O mesmo vale para os dados específicos:
             *
             * - perfilArtista
             * - perfilEstabelecimento
             */
            await Promise.all([

                carregarUsuario(
                    perfil
                ),

                carregarPerfilArtista(
                    perfilId
                ),

                carregarPerfilEstabelecimento(
                    perfilId
                ),

                carregarAvaliacoes(
                    perfilId
                ),

                carregarServicos(
                    perfilId
                ),

                carregarAgenda(
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


    function obterPerfilEstabelecimento() {

        return estado.dados.perfilEstabelecimento;

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


    function obterAgenda() {

        return [

            ...estado.dados.agenda

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

        carregarPerfilEstabelecimento,

        carregarAvaliacoes,

        carregarUsuariosAvaliadores,

        carregarServicos,

        carregarAgenda,

        carregarArtistasDasContratacoes,

        obterPerfilIdDaUrl,

        obterDados,

        obterUsuario,

        obterPerfil,

        obterPerfilArtista,

        obterPerfilEstabelecimento,

        obterTipoPerfil,

        obterAvaliacoes,

        obterServicos,

        obterAgenda,

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