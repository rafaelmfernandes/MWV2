/* =========================================================
   MUSICALWORLD — PAGAMENTO DE OPORTUNIDADE

   Arquivo:
   js/contratacao/contratacao-pagamento-oportunidade.js

   Responsabilidades:
   ---------------------------------------------------------
   - Identificar contratação de oportunidade pela URL.
   - Carregar a contratação existente no Supabase.
   - Validar o contratante responsável.
   - Carregar dados do artista.
   - Carregar perfil e dados profissionais do artista.
   - Carregar serviço relacionado, quando existir.
   - Carregar dados da oportunidade.
   - Reconstruir o estado central para a etapa de pagamento.
   - Atualizar o pagamento de uma contratação de oportunidade.
   - Manter a contratação existente.
   - Nunca criar uma segunda contratação.
   - Deixar o fluxo normal de contratação separado deste módulo.

   Este arquivo trabalha em conjunto com:

   js/contratacao/contratacao-pagamento.js

   O arquivo principal continua responsável pela interface
   e pelo fluxo normal de pagamento.

   Este módulo é responsável somente pela particularidade
   das contratações originadas de oportunidades.
   ========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        tabelaContratacoes:
            "contratacoes",

        tabelaUsuarios:
            "usuarios",

        tabelaPerfis:
            "perfis",

        tabelaPerfisArtistas:
            "perfis_artistas",

        tabelaTiposPerfil:
            "tipos_perfil",

        tabelaServicos:
            "servicos_artistas",

        tabelaOportunidades:
            "oportunidades",

        statusConfirmada:
            "confirmada",

        statusPagamentoPendente:
            "pendente",

        statusPagamentoProcessando:
            "processando",

        statusPagamentoPago:
            "pago",

        etapaPagamento:
            6

    };


    /* =========================================================
       ESTADO INTERNO DO MÓDULO
       ========================================================= */

    let contratacaoAtual =
        null;


    let oportunidadeAtual =
        null;


    let modoOportunidade =
        false;


    /* =========================================================
       CLIENTE SUPABASE
       ========================================================= */

    function obterSupabaseClient() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from ===
                "function"
        ) {

            return window.supabaseClient;

        }


        if (
            window.SupabaseClient &&
            typeof window.SupabaseClient.getClient ===
                "function"
        ) {

            try {

                const cliente =
                    window.SupabaseClient.getClient();


                if (
                    cliente &&
                    typeof cliente.from ===
                        "function"
                ) {

                    return cliente;

                }

            } catch (erro) {

                console.error(
                    "MusicalWorldContratacaoPagamentoOportunidade: " +
                    "erro ao obter cliente Supabase.",
                    erro
                );

            }

        }


        if (
            window.SupabaseClient &&
            window.SupabaseClient.client &&
            typeof window.SupabaseClient.client.from ===
                "function"
        ) {

            return window.SupabaseClient.client;

        }


        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    /* =========================================================
       ESTADO CENTRAL
       ========================================================= */

    function obterGerenciadorEstado() {

        return (
            window.MusicalWorldContratacaoEstado ||
            window.ContratacaoEstado ||
            null
        );

    }


    function obterEstado() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            throw new Error(
                "Gerenciador do estado central não encontrado."
            );

        }


        if (
            typeof gerenciador.inicializar ===
                "function"
        ) {

            gerenciador.inicializar();

        }


        const estado =
            gerenciador.obter();


        if (!estado) {

            throw new Error(
                "Estado central da contratação não encontrado."
            );

        }


        return estado;

    }


    function salvarEstado(dados) {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            throw new Error(
                "Gerenciador do estado central não encontrado."
            );

        }


        if (
            typeof gerenciador.salvar ===
                "function"
        ) {

            gerenciador.salvar(
                dados
            );

            return true;

        }


        if (
            typeof gerenciador.definir ===
                "function"
        ) {

            Object.keys(
                dados
            ).forEach(
                function (campo) {

                    gerenciador.definir(
                        campo,
                        dados[campo]
                    );

                }
            );


            return true;

        }


        throw new Error(
            "O estado central não possui método de persistência."
        );

    }


    /* =========================================================
       AUTENTICAÇÃO
       ========================================================= */

    async function obterUsuarioAutenticado() {

        const supabase =
            obterSupabaseClient();


        if (
            !supabase.auth ||
            typeof supabase.auth.getUser !==
                "function"
        ) {

            throw new Error(
                "Sistema de autenticação do Supabase não está disponível."
            );

        }


        const resposta =
            await supabase.auth.getUser();


        if (resposta.error) {

            throw resposta.error;

        }


        if (
            !resposta.data ||
            !resposta.data.user
        ) {

            throw new Error(
                "Usuário não autenticado."
            );

        }


        return resposta.data.user;

    }


    /* =========================================================
       ID DA CONTRATAÇÃO NA URL
       ========================================================= */

    function obterContratacaoIdDaURL() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        return (
            parametros.get(
                "contratacaoId"
            ) ||

            parametros.get(
                "contratacao_id"
            ) ||

            parametros.get(
                "id"
            ) ||

            null
        );

    }


    function possuiContratacaoNaURL() {

        return Boolean(
            obterContratacaoIdDaURL()
        );

    }


    /* =========================================================
       IDENTIFICAÇÃO DE OPORTUNIDADE
       ========================================================= */

    function ehContratacaoDeOportunidade(
        contratacao
    ) {

        return Boolean(
            contratacao &&
            contratacao.oportunidade_id
        );

    }


    function ehModoOportunidade() {

        return modoOportunidade;

    }


    /* =========================================================
       CARREGAR USUÁRIO
       ========================================================= */

    async function carregarUsuario(
        usuarioId
    ) {

        if (!usuarioId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaUsuarios
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    usuarioId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        return (
            resposta.data ||
            null
        );

    }


    /* =========================================================
       CARREGAR PERFIL
       ========================================================= */

    async function carregarPerfil(
        usuarioId
    ) {

        if (!usuarioId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaPerfis
                )

                .select(
                    "*"
                )

                .eq(
                    "usuario_id",
                    usuarioId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        return (
            resposta.data ||
            null
        );

    }


    /* =========================================================
       CARREGAR DADOS DO ARTISTA
       ========================================================= */

    async function carregarPerfilArtista(
        perfilId
    ) {

        if (!perfilId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaPerfisArtistas
                )

                .select(
                    "*"
                )

                .eq(
                    "perfil_id",
                    perfilId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        return (
            resposta.data ||
            null
        );

    }


    /* =========================================================
       CARREGAR TIPO DE PERFIL
       ========================================================= */

    async function carregarTipoPerfil(
        tipoPerfilId
    ) {

        if (!tipoPerfilId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaTiposPerfil
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    tipoPerfilId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        return (
            resposta.data ||
            null
        );

    }


    /* =========================================================
       CARREGAR SERVIÇO
       ========================================================= */

    async function carregarServico(
        servicoId
    ) {

        if (!servicoId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaServicos
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    servicoId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        return (
            resposta.data ||
            null
        );

    }


    /* =========================================================
       CARREGAR OPORTUNIDADE
       ========================================================= */

    async function carregarOportunidade(
        oportunidadeId
    ) {

        if (!oportunidadeId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaOportunidades
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    oportunidadeId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        return (
            resposta.data ||
            null
        );

    }


    /* =========================================================
       NORMALIZAR LOCAL
       ========================================================= */

    function normalizarLocal(
        local
    ) {

        if (!local) {

            return {};

        }


        if (
            typeof local ===
                "object"
        ) {

            return {
                ...local
            };

        }


        if (
            typeof local ===
                "string"
        ) {

            try {

                const convertido =
                    JSON.parse(
                        local
                    );


                if (
                    convertido &&
                    typeof convertido ===
                        "object"
                ) {

                    return convertido;

                }

            } catch (erro) {

                return {
                    descricao:
                        local
                };

            }

        }


        return {};

    }


    /* =========================================================
       LOCALIZAÇÃO DO ARTISTA
       ========================================================= */

    function obterLocalizacaoArtista(
        perfilArtista,
        perfil
    ) {

        return (

            perfilArtista?.localizacao ||

            perfilArtista?.cidade ||

            perfil?.cidade ||

            perfil?.localizacao ||

            ""

        );

    }


    /* =========================================================
       VALOR DO SERVIÇO
       ========================================================= */

    function obterValorServico(
        contratacao,
        servico,
        oportunidade
    ) {

        const valorContratacao =
            Number(
                contratacao?.valor
            );


        if (
            Number.isFinite(
                valorContratacao
            )
        ) {

            return valorContratacao;

        }


        const valorServico =
            Number(
                servico?.valor
            );


        if (
            Number.isFinite(
                valorServico
            )
        ) {

            return valorServico;

        }


        const valorMinimo =
            Number(
                servico?.valor_minimo
            );


        if (
            Number.isFinite(
                valorMinimo
            )
        ) {

            return valorMinimo;

        }


        const valorOportunidade =
            Number(
                oportunidade?.valor
            );


        if (
            Number.isFinite(
                valorOportunidade
            )
        ) {

            return valorOportunidade;

        }


        const orcamento =
            Number(
                oportunidade?.orcamento
            );


        if (
            Number.isFinite(
                orcamento
            )
        ) {

            return orcamento;

        }


        const valorMaximo =
            Number(
                oportunidade?.valor_maximo
            );


        if (
            Number.isFinite(
                valorMaximo
            )
        ) {

            return valorMaximo;

        }


        return 0;

    }


    /* =========================================================
       NOME DO SERVIÇO
       ========================================================= */

    function obterNomeServico(
        contratacao,
        servico,
        oportunidade
    ) {

        return (

            servico?.nome ||

            servico?.nome_servico ||

            servico?.titulo ||

            oportunidade?.titulo ||

            oportunidade?.nome ||

            contratacao?.tipo_evento ||

            "Contratação musical"

        );

    }


    /* =========================================================
       MONTAR ARTISTA
       ========================================================= */

    function montarArtista(
        usuario,
        perfil,
        perfilArtista,
        tipoPerfil
    ) {

        const fotoUrl =

            perfilArtista?.foto_url ||

            perfilArtista?.avatar_url ||

            usuario?.foto_url ||

            "";


        const nome =

            perfil?.nome_exibicao ||

            usuario?.nome ||

            "Artista";


        const tipoArtista =

            perfilArtista?.tipo_artista ||

            perfilArtista?.tipo ||

            tipoPerfil?.nome ||

            "Artista";


        const localizacao =
            obterLocalizacaoArtista(
                perfilArtista,
                perfil
            );


        return {

            id:
                perfil?.id ||
                null,

            perfilId:
                perfil?.id ||
                null,

            usuarioId:
                usuario?.id ||
                null,

            usuario_id:
                usuario?.id ||
                null,

            nome:
                nome,

            nomeExibicao:
                nome,

            tipo:
                tipoArtista,

            tipoArtista:
                tipoArtista,

            tipo_artista:
                tipoArtista,

            localizacao:
                localizacao,

            fotoUrl:
                fotoUrl,

            foto_url:
                fotoUrl,

            avatarUrl:
                fotoUrl,

            avatar_url:
                fotoUrl

        };

    }


    /* =========================================================
       MONTAR SERVIÇO
       ========================================================= */

    function montarServico(
        contratacao,
        servico,
        oportunidade
    ) {

        const valor =
            obterValorServico(
                contratacao,
                servico,
                oportunidade
            );


        const nome =
            obterNomeServico(
                contratacao,
                servico,
                oportunidade
            );


        return {

            ...(servico || {}),

            id:
                servico?.id ||
                contratacao?.servico_id ||
                contratacao?.id ||
                null,

            nome:
                nome,

            nome_servico:
                servico?.nome_servico ||
                nome,

            titulo:
                servico?.titulo ||
                nome,

            valor:
                valor,

            valorMinimo:
                Number.isFinite(
                    Number(
                        servico?.valor_minimo
                    )
                )
                    ? Number(
                        servico.valor_minimo
                    )
                    : valor

        };

    }


    /* =========================================================
       MONTAR EVENTO
       ========================================================= */

    function montarEvento(
        contratacao,
        oportunidade
    ) {

        const local =
            normalizarLocal(
                contratacao?.local
            );


        return {

            dataEvento:
                contratacao?.data_evento ||
                oportunidade?.data_evento ||
                oportunidade?.data ||
                null,

            horarioInicio:
                contratacao?.horario_inicio ||
                oportunidade?.horario_inicio ||
                oportunidade?.hora_inicio ||
                null,

            horarioFim:
                contratacao?.horario_fim ||
                oportunidade?.horario_fim ||
                oportunidade?.hora_fim ||
                null,

            tipoEvento:
                contratacao?.tipo_evento ||
                oportunidade?.tipo_evento ||
                oportunidade?.tipo_artista ||
                null,

            observacoes:
                contratacao?.observacoes ||
                oportunidade?.observacoes ||
                oportunidade?.descricao ||
                null,

            local:
                local

        };

    }


    /* =========================================================
       MONTAR ESTADO CENTRAL
       ========================================================= */

    function montarEstado(
        contratacao,
        usuarioArtista,
        perfilArtista,
        dadosArtista,
        tipoPerfil,
        servico,
        oportunidade
    ) {

        const artista =
            montarArtista(
                usuarioArtista,
                perfilArtista,
                dadosArtista,
                tipoPerfil
            );


        const servicoEstado =
            montarServico(
                contratacao,
                servico,
                oportunidade
            );


        const evento =
            montarEvento(
                contratacao,
                oportunidade
            );


        const local =
            normalizarLocal(
                contratacao?.local
            );


        const valor =
            obterValorServico(
                contratacao,
                servico,
                oportunidade
            );


        return {

            perfilId:
                artista.perfilId,

            tipo:
                artista.tipoArtista,

            artista:
                artista,

            servico:
                servicoEstado,

            oportunidadeId:
                contratacao.oportunidade_id ||
                null,

            oportunidade_id:
                contratacao.oportunidade_id ||
                null,

            oportunidade:
                oportunidade ||
                null,

            contratacaoId:
                contratacao.id ||
                null,

            contratacao_id:
                contratacao.id ||
                null,

            statusContratacao:
                contratacao.status ||
                CONFIG.statusConfirmada,

            status:
                contratacao.status ||
                CONFIG.statusConfirmada,

            dataEvento:
                evento.dataEvento,

            horarioInicio:
                evento.horarioInicio,

            horarioFim:
                evento.horarioFim,

            local:
                local,

            evento:
                evento,

            pagamento: {

                status:
                    contratacao.status_pagamento ||
                    CONFIG.statusPagamentoPendente,

                metodo:
                    contratacao.metodo_pagamento ||
                    "",

                valor:
                    valor,

                idTransacao:
                    null

            },

            etapaAtual:
                CONFIG.etapaPagamento

        };

    }


    /* =========================================================
       CARREGAR CONTRATAÇÃO DE OPORTUNIDADE
       ========================================================= */

    async function carregarContratacao() {

        const contratacaoId =
            obterContratacaoIdDaURL();


        if (!contratacaoId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        const usuarioAtual =
            await obterUsuarioAutenticado();


        console.log(
            "MusicalWorldContratacaoPagamentoOportunidade: " +
            "carregando contratação pela URL.",
            contratacaoId
        );


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaContratacoes
                )

                .select(
                    "*"
                )

                .eq(
                    "id",
                    contratacaoId
                )

                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;

        }


        const contratacao =
            resposta.data;


        if (!contratacao) {

            throw new Error(
                "Contratação não encontrada."
            );

        }


        if (
            !ehContratacaoDeOportunidade(
                contratacao
            )
        ) {

            console.log(
                "MusicalWorldContratacaoPagamentoOportunidade: " +
                "a contratação encontrada não é originada de oportunidade."
            );


            return null;

        }


        if (
            String(
                contratacao.contratante_id
            ) !==
            String(
                usuarioAtual.id
            )
        ) {

            throw new Error(
                "Esta contratação não pertence ao contratante autenticado."
            );

        }


        const oportunidade =
            await carregarOportunidade(
                contratacao.oportunidade_id
            );


        const usuarioArtista =
            await carregarUsuario(
                contratacao.contratado_id
            );


        const perfilArtista =
            await carregarPerfil(
                contratacao.contratado_id
            );


        if (!perfilArtista) {

            throw new Error(
                "Perfil do artista não encontrado."
            );

        }


        const dadosArtista =
            await carregarPerfilArtista(
                perfilArtista.id
            );


        const tipoPerfil =
            await carregarTipoPerfil(
                perfilArtista.tipo_perfil_id ||
                perfilArtista.tipoPerfilId ||
                perfilArtista.tipo_artista_id ||
                null
            );


        const servico =
            await carregarServico(
                contratacao.servico_id
            );


        const estado =
            montarEstado(
                contratacao,
                usuarioArtista,
                perfilArtista,
                dadosArtista,
                tipoPerfil,
                servico,
                oportunidade
            );


        salvarEstado(
            estado
        );


        contratacaoAtual =
            contratacao;


        oportunidadeAtual =
            oportunidade;


        modoOportunidade =
            true;


        console.log(
            "MusicalWorldContratacaoPagamentoOportunidade: " +
            "contratação de oportunidade carregada.",
            {
                contratacao:
                    contratacao,

                oportunidade:
                    oportunidade,

                artista:
                    estado.artista,

                servico:
                    estado.servico,

                pagamento:
                    estado.pagamento
            }
        );


        return contratacao;

    }


    /* =========================================================
       CARREGAR DADOS
       ========================================================= */

    async function carregarDados() {

        if (
            !possuiContratacaoNaURL()
        ) {

            return null;

        }


        return await carregarContratacao();

    }


    /* =========================================================
       CARREGAR SOMENTE QUANDO NECESSÁRIO
       ========================================================= */

    async function carregarSeNecessario() {

        if (
            !possuiContratacaoNaURL()
        ) {

            return null;

        }


        return await carregarDados();

    }


    /* =========================================================
       ATUALIZAR PAGAMENTO DA OPORTUNIDADE
       ========================================================= */

    async function atualizarPagamentoContratacaoDeOportunidade(
        contratacao,
        metodoPagamento
    ) {

        if (!contratacao) {

            throw new Error(
                "Contratação da oportunidade não encontrada."
            );

        }


        if (
            !ehContratacaoDeOportunidade(
                contratacao
            )
        ) {

            throw new Error(
                "A contratação informada não pertence a uma oportunidade."
            );

        }


        const supabase =
            obterSupabaseClient();


        const usuario =
            await obterUsuarioAutenticado();


        if (
            String(
                contratacao.contratante_id
            ) !==
            String(
                usuario.id
            )
        ) {

            throw new Error(
                "Somente o contratante responsável pode realizar este pagamento."
            );

        }


        const status =
            String(
                contratacao.status ||
                ""
            )
                .toLowerCase()
                .trim();


        if (
            status !==
            CONFIG.statusConfirmada
        ) {

            throw new Error(
                "O artista ainda não aceitou a proposta ou a contratação não está pronta para pagamento."
            );

        }


        const statusPagamento =
            String(
                contratacao.status_pagamento ||
                ""
            )
                .toLowerCase()
                .trim();


        if (
            statusPagamento ===
            CONFIG.statusPagamentoPago
        ) {

            console.log(
                "MusicalWorldContratacaoPagamentoOportunidade: " +
                "o pagamento desta oportunidade já está registrado como pago."
            );


            return contratacao;

        }


        if (
            statusPagamento !==
            CONFIG.statusPagamentoPendente
        ) {

            throw new Error(
                "O pagamento desta contratação não está pendente."
            );

        }


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaContratacoes
                )

                .update({

                    status_pagamento:
                        CONFIG.statusPagamentoPago,

                    metodo_pagamento:
                        metodoPagamento ||
                        contratacao.metodo_pagamento ||
                        null

                })

                .eq(
                    "id",
                    contratacao.id
                )

                .eq(
                    "contratante_id",
                    usuario.id
                )

                .select(
                    "id,contratante_id,contratado_id,servico_id,data_evento,horario_inicio,horario_fim,valor,status,metodo_pagamento,status_pagamento,tipo_evento,local,observacoes,oportunidade_id"
                )

                .single();


        if (resposta.error) {

            console.error(
                "MusicalWorldContratacaoPagamentoOportunidade: " +
                "erro ao atualizar pagamento da oportunidade.",
                resposta.error
            );


            throw resposta.error;

        }


        if (!resposta.data) {

            throw new Error(
                "O Supabase não retornou a contratação após atualizar o pagamento."
            );

        }


        contratacaoAtual =
            resposta.data;


        console.log(
            "MusicalWorldContratacaoPagamentoOportunidade: " +
            "pagamento da oportunidade atualizado com sucesso.",
            resposta.data
        );


        return resposta.data;

    }


    /* =========================================================
       SALVAR PAGAMENTO DA OPORTUNIDADE NO ESTADO CENTRAL
       ========================================================= */

    function salvarPagamentoOportunidadeNoEstado(
        contratacao,
        estado,
        metodoPagamento,
        obterValorServicoPrincipal
    ) {

        if (!contratacao) {

            throw new Error(
                "Contratação não encontrada para atualização do estado."
            );

        }


        const estadoAtual =
            estado ||
            obterEstado();


        const pagamentoAtual =
            estadoAtual.pagamento ||
            {};


        let valor =
            Number(
                contratacao.valor
            );


        if (
            !Number.isFinite(
                valor
            )
        ) {

            if (
                typeof obterValorServicoPrincipal ===
                    "function"
            ) {

                valor =
                    Number(
                        obterValorServicoPrincipal(
                            estadoAtual
                        )
                    );

            }

        }


        const sucesso =
            salvarEstado({

                contratacaoId:
                    contratacao.id,

                contratacao_id:
                    contratacao.id,

                statusContratacao:
                    contratacao.status ||
                    CONFIG.statusConfirmada,

                status:
                    contratacao.status ||
                    CONFIG.statusConfirmada,

                oportunidadeId:
                    contratacao.oportunidade_id ||
                    estadoAtual.oportunidadeId ||
                    null,

                oportunidade_id:
                    contratacao.oportunidade_id ||
                    estadoAtual.oportunidade_id ||
                    null,

                pagamento: {

                    ...pagamentoAtual,

                    metodo:
                        metodoPagamento ||
                        contratacao.metodo_pagamento ||
                        pagamentoAtual.metodo ||
                        "",

                    valor:
                        Number.isFinite(valor)
                            ? valor
                            : null,

                    status:
                        contratacao.status_pagamento ||
                        CONFIG.statusPagamentoPago,

                    idTransacao:
                        pagamentoAtual.idTransacao ||
                        null

                },

                etapaAtual:
                    CONFIG.etapaPagamento

            });


        if (!sucesso) {

            throw new Error(
                "Não foi possível atualizar o estado central com o pagamento da oportunidade."
            );

        }


        return true;

    }


    /* =========================================================
       PROCESSAR PAGAMENTO DA OPORTUNIDADE
       ========================================================= */

    async function processarPagamento(
        opcoes
    ) {

        const configuracao =
            opcoes ||
            {};


        const contratacao =
            configuracao.contratacao ||
            contratacaoAtual;


        if (!contratacao) {

            throw new Error(
                "Contratação de oportunidade não encontrada."
            );

        }


        if (
            !ehContratacaoDeOportunidade(
                contratacao
            )
        ) {

            throw new Error(
                "A contratação informada não é uma contratação de oportunidade."
            );

        }


        const estado =
            configuracao.estado ||
            obterEstado();


        const metodoPagamento =
            configuracao.metodoPagamento ||
            "";


        const simularProcessamentoPagamento =
            configuracao.simularProcessamentoPagamento;


        const obterValorServicoPrincipal =
            configuracao.obterValorServico;


        const salvarEstadoPrincipal =
            configuracao.salvarEstado;


        const obterEstadoPrincipal =
            configuracao.obterEstado;


        /*
         * Antes do processamento, confirma novamente o estado
         * da contratação diretamente no banco.
         *
         * Isso evita pagar uma contratação que tenha sido
         * alterada em outra tela.
         */

        const supabase =
            obterSupabaseClient();


        const respostaAtual =
            await supabase

                .from(
                    CONFIG.tabelaContratacoes
                )

                .select(
                    "id,contratante_id,contratado_id,servico_id,data_evento,horario_inicio,horario_fim,valor,status,metodo_pagamento,status_pagamento,tipo_evento,local,observacoes,oportunidade_id"
                )

                .eq(
                    "id",
                    contratacao.id
                )

                .maybeSingle();


        if (respostaAtual.error) {

            throw respostaAtual.error;

        }


        if (!respostaAtual.data) {

            throw new Error(
                "A contratação da oportunidade não foi encontrada."
            );

        }


        const contratacaoBanco =
            respostaAtual.data;


        if (
            !ehContratacaoDeOportunidade(
                contratacaoBanco
            )
        ) {

            throw new Error(
                "A contratação deixou de estar vinculada a uma oportunidade."
            );

        }


        contratacaoAtual =
            contratacaoBanco;


        /*
         * O estado local é atualizado para processando antes
         * da simulação.
         */

        const pagamentoAnterior =
            estado.pagamento ||
            {};


        let valor =
            Number(
                contratacaoBanco.valor
            );


        if (
            !Number.isFinite(
                valor
            )
        ) {

            if (
                typeof obterValorServicoPrincipal ===
                    "function"
            ) {

                valor =
                    Number(
                        obterValorServicoPrincipal(
                            estado
                        )
                    );

            }

        }


        if (
            typeof salvarEstadoPrincipal ===
                "function"
        ) {

            salvarEstadoPrincipal({

                pagamento: {

                    ...pagamentoAnterior,

                    metodo:
                        metodoPagamento,

                    valor:
                        Number.isFinite(valor)
                            ? valor
                            : null,

                    status:
                        CONFIG.statusPagamentoProcessando,

                    idTransacao:
                        pagamentoAnterior.idTransacao ||
                        null

                },

                etapaAtual:
                    CONFIG.etapaPagamento

            });

        } else {

            salvarEstado({

                pagamento: {

                    ...pagamentoAnterior,

                    metodo:
                        metodoPagamento,

                    valor:
                        Number.isFinite(valor)
                            ? valor
                            : null,

                    status:
                        CONFIG.statusPagamentoProcessando,

                    idTransacao:
                        pagamentoAnterior.idTransacao ||
                        null

                },

                etapaAtual:
                    CONFIG.etapaPagamento

            });

        }


        /*
         * Simulação temporária do processamento do pagamento.
         */

        if (
            typeof simularProcessamentoPagamento ===
                "function"
        ) {

            await simularProcessamentoPagamento();

        }


        /*
         * Após a simulação, atualiza a contratação existente.
         *
         * Nenhuma nova linha é criada em contratacoes.
         */

        const contratacaoAtualizada =
            await atualizarPagamentoContratacaoDeOportunidade(
                contratacaoBanco,
                metodoPagamento
            );


        /*
         * Salva o resultado no estado central.
         */

        const estadoDepois =
            typeof obterEstadoPrincipal ===
                "function"
                ? obterEstadoPrincipal()
                : obterEstado();


        salvarPagamentoOportunidadeNoEstado(
            contratacaoAtualizada,
            estadoDepois,
            metodoPagamento,
            obterValorServicoPrincipal
        );


        console.log(
            "MusicalWorldContratacaoPagamentoOportunidade: " +
            "pagamento da oportunidade concluído.",
            {
                contratacaoId:
                    contratacaoAtualizada.id,

                oportunidadeId:
                    contratacaoAtualizada.oportunidade_id,

                status:
                    contratacaoAtualizada.status,

                statusPagamento:
                    contratacaoAtualizada.status_pagamento,

                metodoPagamento:
                    contratacaoAtualizada.metodo_pagamento
            }
        );


        return contratacaoAtualizada;

    }


    /* =========================================================
       OBTER CONTRATAÇÃO ATUAL
       ========================================================= */

    function obterContratacao() {

        return contratacaoAtual;

    }


    /* =========================================================
       OBTER OPORTUNIDADE ATUAL
       ========================================================= */

    function obterOportunidade() {

        return oportunidadeAtual;

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    const API = {

        carregarDados,

        carregarSeNecessario,

        carregarContratacao,

        possuiContratacaoNaURL,

        obterContratacaoIdDaURL,

        ehContratacaoDeOportunidade,

        ehModoOportunidade,

        obterContratacao,

        obterOportunidade,

        atualizarPagamentoContratacaoDeOportunidade,

        salvarPagamentoOportunidadeNoEstado,

        processarPagamento

    };


    window.MusicalWorldContratacaoPagamentoOportunidade =
        API;


})(window);