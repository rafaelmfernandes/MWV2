/* =========================================================
   MUSICALWORLD — DADOS DA GESTÃO DE INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados-dados.js

   Responsabilidade:

   - Ler a oportunidade atual.
   - Validar o usuário logado.
   - Garantir que o usuário é o proprietário da oportunidade.
   - Carregar os interessados.
   - Carregar dados dos artistas.
   - Selecionar um artista.
   - Manter toda comunicação com o Supabase isolada deste módulo.

   ========================================================= */

window.MusicalWorldOportunidadeInteressadosDados = (() => {

    /* =====================================================
       NORMALIZAÇÃO
       ===================================================== */

    function normalizarTexto(valor) {

        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    }


    /* =====================================================
       OBTER SUPABASE
       ===================================================== */

    function obterSupabase() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            return window.supabaseClient;

        }


        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    /* =====================================================
       OBTER ID DA OPORTUNIDADE
       ===================================================== */

    function obterOportunidadeId() {

        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("id");

        if (!id) {

            throw new Error(
                "Oportunidade não informada."
            );

        }

        return id;

    }


    /* =====================================================
       CARREGAR OPORTUNIDADE
       ===================================================== */

    async function carregarOportunidade(
        supabase,
        oportunidadeId
    ) {

        const { data, error } = await supabase
            .from("oportunidades")
            .select(`
                id,
                contratante_id,
                titulo,
                descricao,
                tipo_artista,
                data_evento,
                hora_inicio,
                hora_fim,
                estilos,
                instrumentos,
                valor,
                local,
                prazo_interesse,
                status,
                created_at,
                updated_at
            `)
            .eq("id", oportunidadeId)
            .maybeSingle();

        if (error) {

            throw new Error(
                `Erro ao carregar oportunidade: ${error.message}`
            );

        }


        if (!data) {

            throw new Error(
                "Oportunidade não encontrada."
            );

        }


        return data;

    }


    /* =====================================================
       VALIDAR PROPRIETÁRIO
       ===================================================== */

    function validarProprietario(
        oportunidade,
        usuarioId
    ) {

        if (
            String(oportunidade.contratante_id) !==
            String(usuarioId)
        ) {

            throw new Error(
                "Você não tem permissão para gerenciar esta oportunidade."
            );

        }

    }


    /* =====================================================
       CARREGAR PERFIL DO ESTABELECIMENTO
       ===================================================== */

    async function carregarEstabelecimento(
        supabase,
        usuarioId
    ) {

        const { data, error } = await supabase
            .from("perfis")
            .select(`
                id,
                usuario_id,
                nome_exibicao,
                descricao,
                tipo_perfil_id,
                tipos_perfil (
                    id,
                    nome
                )
            `)
            .eq("usuario_id", usuarioId)
            .maybeSingle();

        if (error) {

            throw new Error(
                `Erro ao carregar estabelecimento: ${error.message}`
            );

        }


        if (!data) {

            throw new Error(
                "Perfil do estabelecimento não encontrado."
            );

        }


        return data;

    }


    /* =====================================================
       VERIFICAR TIPO DE ESTABELECIMENTO
       ===================================================== */

    function ehEstabelecimento(
        perfil
    ) {

        const tipo = normalizarTexto(
            perfil?.tipos_perfil?.nome
        ).replace(/_/g, " ");


        const tiposEstabelecimento = [
            "bar",
            "boate",
            "casa shows",
            "casa de shows",
            "clube",
            "contratante",
            "empresa agencia",
            "hotel",
            "organizador eventos",
            "pousada",
            "restaurante",
            "pub",
            "espaco para eventos",
            "estabelecimento"
        ];


        return tiposEstabelecimento.includes(tipo);

    }


    /* =====================================================
       CARREGAR INTERESSADOS
       ===================================================== */

    async function carregarInteressados(
        supabase,
        oportunidadeId
    ) {

        const { data, error } = await supabase
            .from("oportunidades_interessados")
            .select(`
                id,
                oportunidade_id,
                artista_id,
                mensagem,
                status,
                created_at,
                updated_at
            `)
            .eq("oportunidade_id", oportunidadeId)
            .order("created_at", {
                ascending: false
            });

        if (error) {

            throw new Error(
                `Erro ao carregar interessados: ${error.message}`
            );

        }


        return data || [];

    }


    /* =====================================================
       CARREGAR USUÁRIOS
       ===================================================== */

    async function carregarUsuarios(
        supabase,
        ids
    ) {

        if (!ids.length) {

            return [];

        }


        const { data, error } = await supabase
            .from("usuarios")
            .select(`
                id,
                nome,
                email
            `)
            .in("id", ids);

        if (error) {

            throw new Error(
                `Erro ao carregar artistas: ${error.message}`
            );

        }


        return data || [];

    }


    /* =====================================================
       CARREGAR PERFIS
       ===================================================== */

    async function carregarPerfis(
        supabase,
        ids
    ) {

        if (!ids.length) {

            return [];

        }


        const { data, error } = await supabase
            .from("perfis")
            .select(`
                id,
                usuario_id,
                nome_exibicao,
                descricao,
                tipo_perfil_id,
                perfil_publicado,
                tipos_perfil (
                    id,
                    nome
                )
            `)
            .in("usuario_id", ids);

        if (error) {

            throw new Error(
                `Erro ao carregar perfis dos artistas: ${error.message}`
            );

        }


        return data || [];

    }


    /* =====================================================
       CARREGAR PERFIS ARTÍSTICOS
       ===================================================== */

    async function carregarPerfisArtistas(
        supabase,
        perfilIds
    ) {

        if (!perfilIds.length) {

            return [];

        }


        const { data, error } = await supabase
            .from("perfis_artistas")
            .select(`
                id,
                perfil_id,
                tipo_artista,
                localizacao,
                experiencia,
                area_atendimento,
                disponivel,
                instrumentos,
                estilos,
                servicos,
                foto_url
            `)
            .in("perfil_id", perfilIds);

        if (error) {

            throw new Error(
                `Erro ao carregar dados artísticos: ${error.message}`
            );

        }


        return data || [];

    }


    /* =====================================================
       MONTAR INTERESSADOS
       ===================================================== */

    function montarInteressados(
        interessados,
        usuarios,
        perfis,
        perfisArtistas
    ) {

        return interessados.map((interessado) => {

            const usuario =
                usuarios.find(
                    item =>
                        String(item.id) ===
                        String(interessado.artista_id)
                ) || null;


            const perfil =
                perfis.find(
                    item =>
                        String(item.usuario_id) ===
                        String(interessado.artista_id)
                ) || null;


            const perfilArtista =
                perfisArtistas.find(
                    item =>
                        String(item.perfil_id) ===
                        String(perfil?.id)
                ) || null;


            return {

                ...interessado,

                usuario,

                perfil,

                perfilArtista

            };

        });

    }


    /* =====================================================
       CARREGAR TUDO
       ===================================================== */

    async function carregarTudo() {

        const supabase = obterSupabase();

        const oportunidadeId =
            obterOportunidadeId();


        const estadoSessao =
            await supabase.auth.getUser();


        const usuarioAtual =
            estadoSessao?.data?.user;


        if (!usuarioAtual) {

            throw new Error(
                "Usuário não autenticado."
            );

        }


        const oportunidade =
            await carregarOportunidade(
                supabase,
                oportunidadeId
            );


        validarProprietario(
            oportunidade,
            usuarioAtual.id
        );


        const estabelecimento =
            await carregarEstabelecimento(
                supabase,
                usuarioAtual.id
            );


        if (!ehEstabelecimento(estabelecimento)) {

            throw new Error(
                "A gestão de oportunidades está disponível apenas para perfis de estabelecimento."
            );

        }


        const interessados =
            await carregarInteressados(
                supabase,
                oportunidadeId
            );


        const artistaIds =
            interessados.map(
                item => item.artista_id
            );


        const [
            usuarios,
            perfis
        ] = await Promise.all([

            carregarUsuarios(
                supabase,
                artistaIds
            ),

            carregarPerfis(
                supabase,
                artistaIds
            )

        ]);


        const perfilIds =
            perfis.map(
                item => item.id
            );


        const perfisArtistas =
            await carregarPerfisArtistas(
                supabase,
                perfilIds
            );


        const interessadosCompletos =
            montarInteressados(
                interessados,
                usuarios,
                perfis,
                perfisArtistas
            );


        return {

            supabase,

            usuarioAtual,

            oportunidade,

            estabelecimento,

            interessados:
                interessadosCompletos

        };

    }


    /* =====================================================
       SELECIONAR ARTISTA
       ===================================================== */

    async function selecionarArtista(
        oportunidadeId,
        interessadoId
    ) {

        const supabase =
            obterSupabase();


        const { data: usuarioData } =
            await supabase.auth.getUser();


        const usuarioAtual =
            usuarioData?.user;


        if (!usuarioAtual) {

            throw new Error(
                "Usuário não autenticado."
            );

        }


        const oportunidade =
            await carregarOportunidade(
                supabase,
                oportunidadeId
            );


        validarProprietario(
            oportunidade,
            usuarioAtual.id
        );


        const { data, error } =
            await supabase
                .from("oportunidades_interessados")
                .update({
                    status: "selecionado",
                    updated_at: new Date().toISOString()
                })
                .eq("id", interessadoId)
                .eq(
                    "oportunidade_id",
                    oportunidadeId
                )
                .select(`
                    id,
                    oportunidade_id,
                    artista_id,
                    mensagem,
                    status,
                    created_at,
                    updated_at
                `)
                .maybeSingle();


        if (error) {

            throw new Error(
                `Não foi possível selecionar o artista: ${error.message}`
            );

        }


        if (!data) {

            throw new Error(
                "Interessado não encontrado ou sem permissão para atualização."
            );

        }


        return data;

    }


    /* =====================================================
       EXPORTAÇÃO
       ===================================================== */

    return {

        carregarTudo,

        selecionarArtista

    };

})();