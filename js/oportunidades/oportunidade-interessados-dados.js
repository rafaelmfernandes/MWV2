
/* =========================================================
   MUSICALWORLD — DADOS DA GESTÃO DE INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados-dados.js

   Responsabilidade:

   - Ler a oportunidade atual.
   - Validar o usuário autenticado.
   - Garantir que o usuário é proprietário da oportunidade.
   - Validar que o perfil é de estabelecimento.
   - Carregar os interessados.
   - Carregar usuários dos artistas.
   - Carregar perfis dos artistas.
   - Carregar dados específicos dos artistas.
   - Carregar a foto do estabelecimento.
   - Selecionar um artista.
   - Criar a contratação a partir da oportunidade.
   - Manter a comunicação com o Supabase isolada deste módulo.

   Observação importante:

   - A tabela "perfis" NÃO possui "foto_url".
   - A foto do usuário está em "usuarios.foto_url".
   - O vínculo entre as duas tabelas é:
     perfis.usuario_id → usuarios.id

   Este arquivo NÃO controla a interface.

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
       CLIENTE SUPABASE
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
       ID DA OPORTUNIDADE
       ===================================================== */

    function obterOportunidadeId() {

        const params =
            new URLSearchParams(
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

        const {
            data,
            error
        } = await supabase

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

            .eq(
                "id",
                oportunidadeId
            )

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
            String(oportunidade.contratante_id)
            !==
            String(usuarioId)
        ) {

            throw new Error(
                "Você não tem permissão para gerenciar esta oportunidade."
            );

        }

    }


    /* =====================================================
       CARREGAR ESTABELECIMENTO
       ===================================================== */

    async function carregarEstabelecimento(
        supabase,
        usuarioId
    ) {

        /*
         * Primeiro carregamos somente os dados que realmente
         * pertencem à tabela "perfis".
         *
         * Não utilizamos "foto_url" aqui porque essa coluna
         * não existe em "perfis".
         */

        const {
            data: perfil,
            error: erroPerfil
        } = await supabase

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

            .eq(
                "usuario_id",
                usuarioId
            )

            .maybeSingle();


        if (erroPerfil) {

            throw new Error(
                `Erro ao carregar estabelecimento: ${erroPerfil.message}`
            );

        }


        if (!perfil) {

            throw new Error(
                "Perfil do estabelecimento não encontrado."
            );

        }


        /*
         * A foto pertence à tabela "usuarios".
         *
         * Buscamos diretamente pelo ID do usuário autenticado.
         *
         * Isso evita depender de um relacionamento embutido
         * entre "perfis" e "usuarios" no Supabase.
         */

        const {
            data: usuario,
            error: erroUsuario
        } = await supabase

            .from("usuarios")

            .select(`
                id,
                foto_url
            `)

            .eq(
                "id",
                usuarioId
            )

            .maybeSingle();


        if (erroUsuario) {

            throw new Error(
                `Erro ao carregar foto do estabelecimento: ${erroUsuario.message}`
            );

        }


        /*
         * Mantemos os dados do usuário dentro do objeto
         * retornado para o módulo de renderização.
         *
         * Assim, o render.js poderá acessar:
         *
         * estabelecimento.usuarios.foto_url
         */

        return {

            ...perfil,

            usuarios:
                usuario || null

        };

    }


    /* =====================================================
       VALIDAR TIPO DE PERFIL
       ===================================================== */

    function ehEstabelecimento(perfil) {

        const tipo =
            normalizarTexto(
                perfil?.tipos_perfil?.nome
            )
            .replace(/_/g, " ");


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


        return tiposEstabelecimento.includes(
            tipo
        );

    }


    /* =====================================================
       CARREGAR INTERESSADOS
       ===================================================== */

    async function carregarInteressados(
        supabase,
        oportunidadeId
    ) {

        const {
            data,
            error
        } = await supabase

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

            .eq(
                "oportunidade_id",
                oportunidadeId
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


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


        const {
            data,
            error
        } = await supabase

            .from("usuarios")

            .select(`
                id,
                nome,
                email
            `)

            .in(
                "id",
                ids
            );


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


        const {
            data,
            error
        } = await supabase

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

            .in(
                "usuario_id",
                ids
            );


        if (error) {

            throw new Error(
                `Erro ao carregar perfis dos artistas: ${error.message}`
            );

        }


        return data || [];

    }


    /* =====================================================
       CARREGAR DADOS ARTÍSTICOS
       ===================================================== */

    async function carregarPerfisArtistas(
        supabase,
        perfilIds
    ) {

        if (!perfilIds.length) {

            return [];

        }


        const {
            data,
            error
        } = await supabase

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

            .in(
                "perfil_id",
                perfilIds
            );


        if (error) {

            throw new Error(
                `Erro ao carregar dados artísticos: ${error.message}`
            );

        }


        return data || [];

    }


    /* =====================================================
       MONTAR INTERESSADOS COMPLETOS
       ===================================================== */

    function montarInteressados(
        interessados,
        usuarios,
        perfis,
        perfisArtistas
    ) {

        return interessados.map(
            (interessado) => {

                const usuario =
                    usuarios.find(
                        item =>
                            String(item.id)
                            ===
                            String(interessado.artista_id)
                    ) || null;


                const perfil =
                    perfis.find(
                        item =>
                            String(item.usuario_id)
                            ===
                            String(interessado.artista_id)
                    ) || null;


                const perfilArtista =
                    perfisArtistas.find(
                        item =>
                            String(item.perfil_id)
                            ===
                            String(perfil?.id)
                    ) || null;


                return {

                    ...interessado,

                    usuario,

                    perfil,

                    perfilArtista

                };

            }
        );

    }


    /* =====================================================
       CARREGAR TUDO
       ===================================================== */

    async function carregarTudo() {

        const supabase =
            obterSupabase();


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


        if (
            !ehEstabelecimento(
                estabelecimento
            )
        ) {

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
            interessados
                .map(
                    item =>
                        item.artista_id
                )
                .filter(Boolean);


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
            perfis
                .map(
                    item => item.id
                )
                .filter(Boolean);


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


        /* =================================================
           1. VALIDAR USUÁRIO AUTENTICADO
           ================================================= */

        const {
            data: usuarioData
        } = await supabase.auth.getUser();


        const usuarioAtual =
            usuarioData?.user;


        if (!usuarioAtual) {

            throw new Error(
                "Usuário não autenticado."
            );

        }


        /* =================================================
           2. CARREGAR E VALIDAR OPORTUNIDADE
           ================================================= */

        const oportunidade =
            await carregarOportunidade(
                supabase,
                oportunidadeId
            );


        validarProprietario(
            oportunidade,
            usuarioAtual.id
        );


        /* =================================================
           3. LOCALIZAR O INTERESSADO

           Precisamos do artista_id para criar a contratação.

           O registro é buscado pelo ID do interessado e pelo
           ID da oportunidade, garantindo que o artista pertence
           realmente a esta oportunidade.
           ================================================= */

        const {
            data: interessado,
            error: erroInteressado
        } = await supabase

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

            .eq(
                "id",
                interessadoId
            )

            .eq(
                "oportunidade_id",
                oportunidadeId
            )

            .maybeSingle();


        if (erroInteressado) {

            throw new Error(
                `Não foi possível localizar o interessado: ${erroInteressado.message}`
            );

        }


        if (!interessado) {

            throw new Error(
                "Interessado não encontrado."
            );

        }


        if (!interessado.artista_id) {

            throw new Error(
                "O interessado não possui um artista válido para contratação."
            );

        }


        /* =================================================
           4. GUARDAR O STATUS ANTERIOR

           Isso permite restaurar o interessado caso a criação
           da contratação falhe depois.
           ================================================= */

        const statusAnterior =
            interessado.status || "interessado";


        /* =================================================
           5. SELECIONAR O ARTISTA
           ================================================= */

        const {
            data: interessadoAtualizado,
            error: erroSelecao
        } = await supabase

            .from("oportunidades_interessados")

            .update({

                status:
                    "selecionado",

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                interessadoId
            )

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


        if (erroSelecao) {

            throw new Error(
                `Não foi possível selecionar o artista: ${erroSelecao.message}`
            );

        }


        if (!interessadoAtualizado) {

            throw new Error(
                "Interessado não encontrado ou sem permissão para atualização."
            );

        }


        /* =================================================
           6. CRIAR A CONTRATAÇÃO

           A contratação nasce da oportunidade.

           Mapeamento:

           oportunidades.contratante_id
               → contratacoes.contratante_id

           interessado.artista_id
               → contratacoes.contratado_id

           oportunidades.data_evento
               → contratacoes.data_evento

           oportunidades.hora_inicio
               → contratacoes.horario_inicio

           oportunidades.hora_fim
               → contratacoes.horario_fim

           oportunidades.valor
               → contratacoes.valor

           oportunidades.tipo_artista
               → contratacoes.tipo_evento

           oportunidades.local
               → contratacoes.local

           oportunidades.descricao
               → contratacoes.observacoes

           A contratação começa como:

           status = solicitacao_enviada
           status_pagamento = pendente

           O pagamento NÃO acontece nesta etapa.
           ================================================= */

        const {

            data: contratacao,

            error: erroContratacao

        } = await supabase

            .from("contratacoes")

            .insert({

                contratante_id:
                    oportunidade.contratante_id,

                contratado_id:
                    interessado.artista_id,

                servico_id:
                    null,

                data_evento:
                    oportunidade.data_evento,

                horario_inicio:
                    oportunidade.hora_inicio,

                horario_fim:
                    oportunidade.hora_fim,

                valor:
                    oportunidade.valor,

                status:
                    "solicitacao_enviada",

                metodo_pagamento:
                    null,

                status_pagamento:
                    "pendente",

                tipo_evento:
                    oportunidade.tipo_artista,

                local:
                    oportunidade.local,

                observacoes:
                    oportunidade.descricao

            })

            .select(`

                id,

                contratante_id,

                contratado_id,

                servico_id,

                data_evento,

                horario_inicio,

                horario_fim,

                valor,

                status,

                metodo_pagamento,

                status_pagamento,

                tipo_evento,

                local,

                observacoes,

                created_at,

                updated_at

            `)

            .maybeSingle();


        /* =================================================
           7. TRATAR ERRO NA CRIAÇÃO DA CONTRATAÇÃO

           Se a contratação não puder ser criada, desfazemos
           a seleção do interessado.

           Dessa forma não ficamos com:

           interessado = selecionado

           sem existir uma contratação correspondente.
           ================================================= */

        if (erroContratacao) {

            await supabase

                .from("oportunidades_interessados")

                .update({

                    status:
                        statusAnterior,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    interessadoId
                )

                .eq(
                    "oportunidade_id",
                    oportunidadeId
                );


            throw new Error(
                `O artista foi selecionado, mas não foi possível criar a contratação: ${erroContratacao.message}`
            );

        }


        if (!contratacao) {

            await supabase

                .from("oportunidades_interessados")

                .update({

                    status:
                        statusAnterior,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    "id",
                    interessadoId
                )

                .eq(
                    "oportunidade_id",
                    oportunidadeId
                );


            throw new Error(
                "A contratação não foi criada."
            );

        }


        /* =================================================
           8. RETORNAR RESULTADO

           O módulo de renderização poderá utilizar o resultado
           para atualizar a interface.

           Retornamos tanto o interessado atualizado quanto
           a nova contratação.
           ================================================= */

        return {

            interessado:
                interessadoAtualizado,

            contratacao

        };

    }


    /* =====================================================
       API PÚBLICA DO MÓDULO
       ===================================================== */

    return {

        carregarTudo,

        selecionarArtista

    };


})();

