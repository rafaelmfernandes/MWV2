/* =========================================================
   MUSICALWORLD — DADOS DA PROPOSTA

   Arquivo:
   js/proposta/proposta-dados.js

   Responsabilidade:

   - Identificar o usuário atualmente autenticado.
   - Identificar o estabelecimento que está sendo visualizado.
   - Identificar o perfil de artista do usuário logado.
   - Carregar os dados do estabelecimento.
   - Carregar os dados profissionais do artista.
   - Carregar os serviços publicados pelo artista.
   - Montar os dados necessários para uma proposta.
   - Validar os dados antes do envio.
   - Criar a proposta na tabela contratacoes.

   FLUXO DESTE MÓDULO:

   ARTISTA LOGADO
        ↓
   visualiza estabelecimento
        ↓
   abre "Enviar proposta"
        ↓
   carrega estabelecimento
        ↓
   carrega perfil do artista logado
        ↓
   carrega serviços do artista
        ↓
   monta proposta
        ↓
   envia para o estabelecimento

   IMPORTANTE:

   O MusicalWorld possui dois fluxos diferentes:

   1. CONTRATANTE → ARTISTA
      Fluxo de contratação existente.

   2. ARTISTA → ESTABELECIMENTO
      Fluxo de envio de proposta implementado neste módulo.

   A estrutura atual da tabela "contratacoes" é reutilizada
   para armazenar a proposta, mantendo compatibilidade com
   a estrutura existente do projeto.

   ========================================================= */


/* =========================================================
   PROTEÇÃO CONTRA DUPLICIDADE DE CARREGAMENTO
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       SUPABASE
       ===================================================== */

    const supabase =
        window.MusicalWorldSupabase ||
        window.supabaseClient ||
        window.supabase;


    if (!supabase) {

        console.error(
            "MusicalWorldPropostaDados: cliente Supabase não encontrado."
        );

        return;
    }


    /* =====================================================
       ESTADO INTERNO
       ===================================================== */

    const estado = {

        inicializado: false,

        usuario: null,

        perfilArtista: null,

        dadosArtista: null,

        estabelecimento: null,

        servicos: [],

        perfilId: null

    };


    /* =====================================================
       UTILITÁRIOS
       ===================================================== */

    function normalizarTexto(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }

        return String(valor).trim();

    }


    function normalizarValor(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return null;

        }

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {

            return null;

        }

        return numero;

    }


    function obterDataAtualISO() {

        return new Date().toISOString();

    }


    /* =====================================================
       OBTER USUÁRIO AUTENTICADO
       ===================================================== */

    async function obterUsuarioAtual() {

        const resultado =
            await supabase.auth.getUser();


        if (resultado.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao obter usuário autenticado.",
                resultado.error
            );

            throw resultado.error;

        }


        const usuario =
            resultado.data?.user || null;


        if (!usuario) {

            throw new Error(
                "Você precisa estar autenticado para enviar uma proposta."
            );

        }


        estado.usuario = usuario;


        console.log(
            "MusicalWorldPropostaDados — Usuário autenticado:",
            {
                id: usuario.id,
                email: usuario.email
            }
        );


        return usuario;

    }


    /* =====================================================
       CARREGAR PERFIL DO ESTABELECIMENTO
       ===================================================== */

    async function carregarPerfilEstabelecimento(perfilId) {

        const id =
            normalizarTexto(perfilId);


        if (!id) {

            throw new Error(
                "Não foi possível identificar o perfil do estabelecimento."
            );

        }


        console.log(
            "MusicalWorldPropostaDados — Carregando estabelecimento:",
            id
        );


        const resultadoPerfil =
            await supabase
                .from("perfis")
                .select(`
                    id,
                    usuario_id,
                    tipo_perfil_id,
                    nome_exibicao,
                    descricao,
                    ativo,
                    perfil_publicado,
                    created_at,
                    updated_at
                `)
                .eq("id", id)
                .eq("ativo", true)
                .maybeSingle();


        if (resultadoPerfil.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao carregar perfil do estabelecimento.",
                resultadoPerfil.error
            );

            throw resultadoPerfil.error;

        }


        const perfil =
            resultadoPerfil.data || null;


        if (!perfil) {

            throw new Error(
                "Estabelecimento não encontrado."
            );

        }


        /* =================================================
           CARREGAR USUÁRIO RESPONSÁVEL PELO PERFIL
           ================================================= */

        let usuarioEstabelecimento = null;


        if (perfil.usuario_id) {

            const resultadoUsuario =
                await supabase
                    .from("usuarios")
                    .select(`
                        id,
                        nome,
                        email,
                        telefone,
                        foto_url,
                        ativo
                    `)
                    .eq("id", perfil.usuario_id)
                    .maybeSingle();


            if (resultadoUsuario.error) {

                console.error(
                    "MusicalWorldPropostaDados: erro ao carregar usuário do estabelecimento.",
                    resultadoUsuario.error
                );

                throw resultadoUsuario.error;

            }


            usuarioEstabelecimento =
                resultadoUsuario.data || null;

        }


        /* =================================================
           CARREGAR TIPO DO PERFIL
           ================================================= */

        let tipoPerfil = null;


        if (perfil.tipo_perfil_id) {

            const resultadoTipo =
                await supabase
                    .from("tipos_perfil")
                    .select(`
                        id,
                        nome
                    `)
                    .eq("id", perfil.tipo_perfil_id)
                    .maybeSingle();


            if (resultadoTipo.error) {

                console.error(
                    "MusicalWorldPropostaDados: erro ao carregar tipo do perfil.",
                    resultadoTipo.error
                );

                throw resultadoTipo.error;

            }


            tipoPerfil =
                resultadoTipo.data || null;

        }


        /* =================================================
           CARREGAR DADOS DO ESTABELECIMENTO
           ================================================= */

        const resultadoEstabelecimento =
            await supabase
                .from("perfis_estabelecimentos")
                .select(`
                    id,
                    perfil_id,
                    endereco,
                    numero,
                    bairro,
                    cidade,
                    estado,
                    cep,
                    telefone_comercial,
                    instagram,
                    site,
                    capacidade,
                    estrutura,
                    estilos_musicais,
                    aceita_musica_ao_vivo,
                    created_at,
                    updated_at
                `)
                .eq("perfil_id", id)
                .maybeSingle();


        if (resultadoEstabelecimento.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao carregar dados do estabelecimento.",
                resultadoEstabelecimento.error
            );

            throw resultadoEstabelecimento.error;

        }


        const estabelecimento =
            resultadoEstabelecimento.data || null;


        /* =================================================
           LOCALIZAÇÃO FORMATADA
           ================================================= */

        let localizacao = "";


        if (estabelecimento) {

            const partes = [];


            if (estabelecimento.bairro) {

                partes.push(
                    estabelecimento.bairro
                );

            }


            if (estabelecimento.cidade) {

                partes.push(
                    estabelecimento.cidade
                );

            }


            if (estabelecimento.estado) {

                partes.push(
                    estabelecimento.estado
                );

            }


            localizacao =
                partes.join(" • ");

        }


        /* =================================================
           NORMALIZAÇÃO DO OBJETO DO ESTABELECIMENTO
           ================================================= */

        const estabelecimentoNormalizado = {

            ...estabelecimento,

            perfil_id:
                estabelecimento?.perfil_id ||
                perfil.id,

            usuario_id:
                perfil.usuario_id || "",

            nome:
                perfil.nome_exibicao ||
                usuarioEstabelecimento?.nome ||
                "Estabelecimento",

            nome_exibicao:
                perfil.nome_exibicao ||
                usuarioEstabelecimento?.nome ||
                "Estabelecimento",

            descricao:
                perfil.descricao || "",

            foto_url:
                usuarioEstabelecimento?.foto_url ||
                "",

            email:
                usuarioEstabelecimento?.email ||
                "",

            telefone:
                usuarioEstabelecimento?.telefone ||
                estabelecimento?.telefone_comercial ||
                "",

            localizacao,

            tipo_perfil:
                tipoPerfil?.nome ||
                "Estabelecimento"

        };


        estado.estabelecimento =
            estabelecimentoNormalizado;


        console.log(
            "MusicalWorldPropostaDados — Estabelecimento carregado:",
            {
                perfilId: perfil.id,
                usuarioId: perfil.usuario_id,
                nome: estabelecimentoNormalizado.nome,
                tipoPerfil: tipoPerfil?.nome || null,
                dadosEstabelecimento: estabelecimento
            }
        );


        return {

            perfil,

            usuario:
                usuarioEstabelecimento,

            tipoPerfil,

            estabelecimento:
                estabelecimentoNormalizado

        };

    }


    /* =====================================================
       CARREGAR PERFIL DO ARTISTA ATUAL
       ===================================================== */

    async function carregarPerfilArtistaAtual(usuarioId) {

        const id =
            normalizarTexto(usuarioId);


        if (!id) {

            throw new Error(
                "Não foi possível identificar o usuário do artista."
            );

        }


        console.log(
            "MusicalWorldPropostaDados — Procurando perfil do artista:",
            id
        );


        /* =================================================
           PERFIL PRINCIPAL
           ================================================= */

        const resultadoPerfil =
            await supabase
                .from("perfis")
                .select(`
                    id,
                    usuario_id,
                    tipo_perfil_id,
                    nome_exibicao,
                    descricao,
                    ativo,
                    perfil_publicado,
                    created_at,
                    updated_at
                `)
                .eq("usuario_id", id)
                .eq("ativo", true)
                .maybeSingle();


        if (resultadoPerfil.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao carregar perfil do artista.",
                resultadoPerfil.error
            );

            throw resultadoPerfil.error;

        }


        const perfil =
            resultadoPerfil.data || null;


        if (!perfil) {

            throw new Error(
                "Você precisa possuir um perfil ativo para enviar uma proposta."
            );

        }


        /* =================================================
           TIPO DO PERFIL
           ================================================= */

        let tipoPerfil = null;


        if (perfil.tipo_perfil_id) {

            const resultadoTipo =
                await supabase
                    .from("tipos_perfil")
                    .select(`
                        id,
                        nome
                    `)
                    .eq("id", perfil.tipo_perfil_id)
                    .maybeSingle();


            if (resultadoTipo.error) {

                console.error(
                    "MusicalWorldPropostaDados: erro ao carregar tipo do artista.",
                    resultadoTipo.error
                );

                throw resultadoTipo.error;

            }


            tipoPerfil =
                resultadoTipo.data || null;

        }


        /* =================================================
           PERFIL ARTÍSTICO
           ================================================= */

        const resultadoArtista =
            await supabase
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
                .eq("perfil_id", perfil.id)
                .maybeSingle();


        if (resultadoArtista.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao carregar dados artísticos.",
                resultadoArtista.error
            );

            throw resultadoArtista.error;

        }


        const artista =
            resultadoArtista.data || null;


        if (!artista) {

            throw new Error(
                "O seu perfil atual não está configurado como perfil artístico."
            );

        }


        /* =================================================
           CARREGAR DADOS DO USUÁRIO
           ================================================= */

        const resultadoUsuario =
            await supabase
                .from("usuarios")
                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    foto_url,
                    ativo
                `)
                .eq("id", id)
                .maybeSingle();


        if (resultadoUsuario.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao carregar usuário do artista.",
                resultadoUsuario.error
            );

            throw resultadoUsuario.error;

        }


        const usuario =
            resultadoUsuario.data || null;


        /* =================================================
           NORMALIZAÇÃO
           ================================================= */

        const artistaNormalizado = {

            ...artista,

            nome:
                perfil.nome_exibicao ||
                usuario?.nome ||
                "Artista",

            nome_exibicao:
                perfil.nome_exibicao ||
                usuario?.nome ||
                "Artista",

            descricao:
                perfil.descricao ||
                "",

            email:
                usuario?.email ||
                "",

            telefone:
                usuario?.telefone ||
                "",

            foto_url:
                artista.foto_url ||
                usuario?.foto_url ||
                "",

            tipo_perfil:
                tipoPerfil?.nome ||
                artista.tipo_artista ||
                "Artista"

        };


        estado.perfilArtista =
            perfil;

        estado.dadosArtista =
            artistaNormalizado;


        console.log(
            "MusicalWorldPropostaDados — Perfil do artista carregado:",
            {
                perfilId: perfil.id,
                usuarioId: perfil.usuario_id,
                nome: artistaNormalizado.nome,
                tipo: artistaNormalizado.tipo_perfil
            }
        );


        return {

            perfil,

            artista:
                artistaNormalizado,

            usuario,

            tipoPerfil

        };

    }


    /* =====================================================
       CARREGAR SERVIÇOS DO ARTISTA
       ===================================================== */

    async function carregarServicosArtista(perfilId) {

        const id =
            normalizarTexto(perfilId);


        if (!id) {

            return [];

        }


        console.log(
            "MusicalWorldPropostaDados — Carregando serviços do artista:",
            id
        );


        const resultado =
            await supabase
                .from("servicos_artistas")
                .select(`
                    id,
                    perfil_id,
                    nome_servico,
                    descricao,
                    duracao,
                    tipo_preco,
                    valor,
                    ativo,
                    created_at,
                    updated_at
                `)
                .eq("perfil_id", id)
                .eq("ativo", true)
                .order("created_at", {
                    ascending: true
                });


        if (resultado.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao carregar serviços do artista.",
                resultado.error
            );

            throw resultado.error;

        }


        const servicos =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        estado.servicos =
            servicos;


        console.log(
            "MusicalWorldPropostaDados — Serviços do artista carregados:",
            servicos.length
        );


        return servicos;

    }


    /* =====================================================
       CARREGAR TODOS OS DADOS DA PROPOSTA
       ===================================================== */

    async function carregarDadosProposta(perfilId) {

        const id =
            normalizarTexto(perfilId);


        if (!id) {

            throw new Error(
                "Perfil do estabelecimento não identificado."
            );

        }


        estado.perfilId =
            id;


        /* =================================================
           USUÁRIO AUTENTICADO
           ================================================= */

        const usuario =
            await obterUsuarioAtual();


        /* =================================================
           ESTABELECIMENTO VISUALIZADO
           ================================================= */

        const dadosEstabelecimento =
            await carregarPerfilEstabelecimento(id);


        const estabelecimento =
            dadosEstabelecimento.estabelecimento;


        /* =================================================
           DIAGNÓSTICO DOS IDs

           Este log foi incluído para verificar exatamente
           quem está logado e a quem pertence o estabelecimento.

           NÃO remover enquanto estivermos validando o fluxo.
           ================================================= */

        console.log(
            "MusicalWorldPropostaDados — DEBUG IDs:",
            {
                usuarioLogadoId:
                    usuario.id,

                estabelecimentoPerfilId:
                    dadosEstabelecimento.perfil?.id,

                estabelecimentoUsuarioId:
                    estabelecimento?.usuario_id,

                perfilIdSolicitado:
                    id,

                saoMesmoUsuario:
                    String(estabelecimento?.usuario_id || "") ===
                    String(usuario.id || "")
            }
        );


        /* =================================================
           PROTEÇÃO CONTRA AUTO-PROPOSTA

           O artista não pode enviar proposta para um
           estabelecimento pertencente ao próprio usuário.
           ================================================= */

        if (
            estabelecimento &&
            estabelecimento.usuario_id &&
            usuario.id &&
            String(estabelecimento.usuario_id) ===
            String(usuario.id)
        ) {

            console.warn(
                "MusicalWorldPropostaDados — Tentativa de proposta para o próprio perfil:",
                {
                    usuarioLogadoId:
                        usuario.id,

                    estabelecimentoUsuarioId:
                        estabelecimento.usuario_id,

                    perfilId:
                        id
                }
            );


            throw new Error(
                "Você não pode enviar uma proposta para o próprio perfil."
            );

        }


        /* =================================================
           PERFIL ARTÍSTICO DO USUÁRIO LOGADO
           ================================================= */

        const dadosArtista =
            await carregarPerfilArtistaAtual(
                usuario.id
            );


        /* =================================================
           SERVIÇOS PUBLICADOS PELO ARTISTA
           ================================================= */

        const servicos =
            await carregarServicosArtista(
                dadosArtista.perfil.id
            );


        /* =================================================
           CONTEXTO COMPLETO
           ================================================= */

        const contexto = {

            usuario,

            perfil:
                dadosEstabelecimento.perfil,

            tipoPerfil:
                dadosEstabelecimento.tipoPerfil,

            estabelecimento,

            perfilArtista:
                dadosArtista.perfil,

            artista:
                dadosArtista.artista,

            tipoPerfilArtista:
                dadosArtista.tipoPerfil,

            servicos

        };


        console.log(
            "MusicalWorldPropostaDados — Dados completos da proposta:",
            {
                usuarioId:
                    usuario.id,

                perfilArtistaId:
                    dadosArtista.perfil.id,

                estabelecimentoPerfilId:
                    dadosEstabelecimento.perfil.id,

                estabelecimentoUsuarioId:
                    estabelecimento.usuario_id,

                totalServicos:
                    servicos.length
            }
        );


        return contexto;

    }


    /* =====================================================
       VALIDAR PROPOSTA
       ===================================================== */

    function validarProposta(dados) {

        if (!dados) {

            throw new Error(
                "Não foi possível obter os dados da proposta."
            );

        }


        /* =================================================
           USUÁRIO INICIADOR
           ================================================= */

        if (!dados.usuarioId) {

            throw new Error(
                "Usuário do artista não identificado."
            );

        }


        /* =================================================
           ESTABELECIMENTO DESTINO
           ================================================= */

        if (!dados.estabelecimentoId) {

            throw new Error(
                "Estabelecimento de destino não identificado."
            );

        }


        /* =================================================
           PROTEÇÃO CONTRA AUTO-PROPOSTA
           ================================================= */

        if (
            String(dados.usuarioId) ===
            String(dados.estabelecimentoId)
        ) {

            throw new Error(
                "Você não pode enviar uma proposta para o próprio perfil."
            );

        }


        /* =================================================
           DATA DO EVENTO

           A data continua obrigatória.
           ================================================= */

        if (!dados.dataEvento) {

            throw new Error(
                "Informe a data da apresentação."
            );

        }


        /* =================================================
           HORÁRIOS

           REGRA:

           - Os dois vazios = permitido.
           - Início preenchido e término vazio = inválido.
           - Início vazio e término preenchido = inválido.
           - Os dois preenchidos = permitido.
           - Quando os dois forem preenchidos, o término
             precisa ser posterior ao início.

           Se os dois ficarem vazios, o estabelecimento
           poderá definir o horário posteriormente.
           ================================================= */

        const horarioInicio =
            normalizarTexto(
                dados.horarioInicio
            );

        const horarioFim =
            normalizarTexto(
                dados.horarioFim
            );


        const possuiInicio =
            Boolean(horarioInicio);

        const possuiFim =
            Boolean(horarioFim);


        /* =================================================
           APENAS UM HORÁRIO PREENCHIDO
           ================================================= */

        if (
            possuiInicio !==
            possuiFim
        ) {

            throw new Error(
                "Informe os dois horários ou deixe os dois em branco para o estabelecimento definir posteriormente."
            );

        }


        /* =================================================
           COMPARAÇÃO DE HORÁRIOS

           Só executamos a comparação quando os dois
           horários realmente foram informados.
           ================================================= */

        if (
            possuiInicio &&
            possuiFim &&
            horarioInicio >=
            horarioFim
        ) {

            throw new Error(
                "O horário de término deve ser posterior ao horário de início."
            );

        }


        /* =================================================
           VALOR
           ================================================= */

        const valor =
            normalizarValor(
                dados.valor
            );


        if (
            valor === null ||
            valor <= 0
        ) {

            throw new Error(
                "Informe um valor válido para a proposta."
            );

        }


        /* =================================================
           TIPO DE EVENTO

           O tipo de evento deixou de fazer parte da proposta.

           A coluna continua existindo na tabela "contratacoes"
           por compatibilidade com o banco, mas a proposta
           deverá gravar null nesse campo.

           Portanto, NÃO fazemos mais validação aqui.
           ================================================= */


        return true;

    }


    /* =====================================================
       MONTAR CONTRATAÇÃO / PROPOSTA
       ===================================================== */

    function montarContratacao(dados) {

        validarProposta(dados);


        const valor =
            normalizarValor(
                dados.valor
            );


        /*
         * COMPATIBILIDADE COM A TABELA ATUAL
         *
         * Nesta nova direção:
         *
         * contratante_id = artista que iniciou a proposta
         * contratado_id  = usuário responsável pelo estabelecimento
         *
         * Esses campos permanecem assim porque a estrutura
         * atual da tabela "contratacoes" ainda utiliza esses
         * nomes.
         */


        const contratanteId =
            dados.contratanteId ||
            dados.usuarioId;


        const contratadoId =
            dados.contratadoId ||
            dados.estabelecimentoId;


        const horarioInicio =
            normalizarTexto(
                dados.horarioInicio
            ) || null;


        const horarioFim =
            normalizarTexto(
                dados.horarioFim
            ) || null;


        const registro = {

            contratante_id:
                contratanteId,

            contratado_id:
                contratadoId,

            servico_id:
                dados.servicoId ||
                null,

            data_evento:
                dados.dataEvento,

            horario_inicio:
                horarioInicio,

            horario_fim:
                horarioFim,

            valor,

            status:
                "solicitacao_enviada",

            metodo_pagamento:
                dados.metodoPagamento ||
                "pix",

            status_pagamento:
                "pendente",

            /*
             * O tipo de evento não faz mais parte
             * da proposta.
             *
             * A coluna permanece no banco por compatibilidade,
             * mas o novo fluxo grava null.
             */

            tipo_evento:
                null,

            local:
                dados.local ||
                null,

            observacoes:
                dados.observacoes ||
                "",

            created_at:
                obterDataAtualISO(),

            updated_at:
                obterDataAtualISO()

        };


        return registro;

    }


    /* =====================================================
       CRIAR PROPOSTA
       ===================================================== */

    async function criarProposta(dados) {

        const registro =
            montarContratacao(dados);


        console.log(
            "MusicalWorldPropostaDados — Criando proposta:",
            registro
        );


        const resultado =
            await supabase
                .from("contratacoes")
                .insert(registro)
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
                .single();


        if (resultado.error) {

            console.error(
                "MusicalWorldPropostaDados: erro ao criar proposta.",
                resultado.error
            );

            throw resultado.error;

        }


        const proposta =
            resultado.data;


        console.log(
            "MusicalWorldPropostaDados — Proposta criada com sucesso:",
            proposta
        );


        return proposta;

    }


    /* =====================================================
       INICIALIZAR CONTEXTO
       ===================================================== */

    async function inicializarContexto(perfilId) {

        const contexto =
            await carregarDadosProposta(
                perfilId
            );


        estado.inicializado =
            true;


        return contexto;

    }


    /* =====================================================
       OBTER ESTADO
       ===================================================== */

    function obterEstado() {

        return {

            ...estado,

            servicos:
                Array.isArray(estado.servicos)
                    ? [...estado.servicos]
                    : []

        };

    }


    /* =====================================================
       RESETAR ESTADO
       ===================================================== */

    function reiniciar() {

        estado.inicializado =
            false;

        estado.usuario =
            null;

        estado.perfilArtista =
            null;

        estado.dadosArtista =
            null;

        estado.estabelecimento =
            null;

        estado.servicos =
            [];

        estado.perfilId =
            null;

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldPropostaDados = {

        obterUsuarioAtual,

        carregarPerfilEstabelecimento,

        carregarPerfilArtistaAtual,

        carregarServicosArtista,

        carregarDadosProposta,

        validarProposta,

        montarContratacao,

        criarProposta,

        inicializarContexto,

        obterEstado,

        reiniciar

    };


    /* =====================================================
       LOG DE CARREGAMENTO
       ===================================================== */

    console.log(
        "MusicalWorldPropostaDados carregado."
    );


})();