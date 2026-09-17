/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO

   Arquivo:
   js/contratacao/contratacao-acompanhamento.js

   Responsabilidades:
   - Recuperar a contratação atual.
   - Identificar se o usuário enviou ou recebeu a solicitação.
   - Carregar os participantes relacionados à contratação.
   - Carregar o serviço contratado.
   - Carregar os dados do evento.
   - Exibir o status atual.
   - Controlar a timeline da contratação.
   - Exibir informações de pagamento.
   - Permitir ao profissional aceitar ou recusar
     uma solicitação recebida.
   - Simular a realização do evento durante o desenvolvimento.
   - Permitir ao contratante confirmar que o serviço
     foi realizado.
   - Liberar o pagamento automaticamente após a
     confirmação da conclusão.
   - Atualizar a contratação no Supabase.
   - Criar notificações relacionadas às mudanças
     importantes da contratação.
   - Manter compatibilidade com sessionStorage.
   - Evitar atualizações indevidas por usuários
     que não participam da contratação.
   - Evitar conclusão/liberação duplicada.

   FLUXO DE DESENVOLVIMENTO:

   1. Contratação aceita
      status = confirmada

   2. Contratante simula que o evento aconteceu
      status = evento

   3. Contratante confirma que o serviço foi realizado
      status = concluida

   4. O Financeiro interpreta "concluida" como
      pagamento liberado/recebido.

   IMPORTANTE:
   A simulação do evento existe apenas para permitir
   testes do fluxo completo enquanto ainda não existe
   uma confirmação real de realização do evento.

   Dependências:
   - SupabaseClient.js
   - @supabase/supabase-js
   - Lucide Icons
   - contratacao-acompanhamento.html

   Cliente Supabase esperado:
   - window.supabaseClient
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        armazenamento: {
            chave: "musicalworld_contratacao"
        },

        parametros: {
            id: "id"
        },

        paginas: {
            inicio: "index.html"
        },

        tabelas: {
            contratacoes: "contratacoes",
            usuarios: "usuarios",
            perfis: "perfis",
            perfisArtistas: "perfis_artistas",
            servicos: "servicos_artistas",
            notificacoes: "notificacoes"
        },

        seletores: {

            paginaEyebrow:
                "paginaEyebrow",

            paginaTitulo:
                "paginaTitulo",

            paginaDescricao:
                "paginaDescricao",

            relacaoCard:
                "relacaoCard",

            relacaoTitulo:
                "relacaoTitulo",

            relacaoDescricao:
                "relacaoDescricao",

            participanteEyebrow:
                "participanteEyebrow",

            participanteTitulo:
                "participanteTitulo",

            artistaAvatar:
                "artistaAvatar",

            artistaNome:
                "artistaNome",

            artistaTipo:
                "artistaTipo",

            artistaLocalizacao:
                "artistaLocalizacao",

            servicoNome:
                "servicoNome",

            servicoValor:
                "servicoValor",

            servicoDuracao:
                "servicoDuracao",

            servicoLocalizacao:
                "servicoLocalizacao",

            dataEvento:
                "dataEvento",

            horarioEvento:
                "horarioEvento",

            localEvento:
                "localEvento",

            tipoEvento:
                "tipoEvento",

            quantidadePessoas:
                "quantidadePessoas",

            quantidadePessoasContainer:
                "quantidadePessoasContainer",

            statusAtual:
                "statusAtual",

            statusDescricao:
                "statusDescricao",

            statusPrincipalIcon:
                "statusPrincipalIcon",

            timelineSolicitacaoDescricao:
                "timelineSolicitacaoDescricao",

            timelineArtistaTitulo:
                "timelineArtistaTitulo",

            timelineArtistaDescricao:
                "timelineArtistaDescricao",

            pagamentoCard:
                "pagamentoCard",

            pagamentoStatus:
                "pagamentoStatus",

            pagamentoDescricao:
                "pagamentoDescricao",

            pagamentoAcao:
                "pagamentoAcao",

            btnLiberarPagamento:
                "btnLiberarPagamento",

            pagamentoAcaoStatus:
                "pagamentoAcaoStatus",

            observacoesEvento:
                "observacoesEvento",

            acoesSolicitacao:
                "acoesSolicitacao",

            btnAceitar:
                "btnAceitar",

            btnRecusar:
                "btnRecusar",

            acoesConclusao:
                "acoesConclusao",

            btnConcluirContratacao:
                "btnConcluirContratacao",

            acoesStatus:
                "acoesStatus",

            btnVoltar:
                "btnVoltar",

            btnVoltarInicio:
                "btnVoltarInicio"
        }
    };


    /* =====================================================
       ESTADO INTERNO
       ===================================================== */

    const estado = {

        dados:
            null,

        statusAtual:
            "aguardando_artista",

        direcao:
            null,

        usuarioId:
            null,

        contratacaoId:
            null,

        carregando:
            false,

        atualizandoStatus:
            false,

        simulandoEvento:
            false,

        concluindoContratacao:
            false,

        inicializado:
            false,

        eventosConfigurados:
            false
    };


    /* =====================================================
       OBTER ELEMENTO PELO ID
       ===================================================== */

    function obterElemento(nome) {

        const id =
            CONFIG.seletores[nome];


        if (!id) {

            return null;
        }


        return document.getElementById(id);
    }


    /* =====================================================
       OBTER CLIENTE SUPABASE
       ===================================================== */

    function obterSupabase() {

        if (window.supabaseClient) {

            return window.supabaseClient;
        }


        console.error(
            "MusicalWorldContratacaoAcompanhamento: cliente Supabase não encontrado."
        );


        return null;
    }


    /* =====================================================
       FORMATAR MOEDA
       ===================================================== */

    function formatarMoeda(valor) {

        const numero =
            Number(valor);


        if (!Number.isFinite(numero)) {

            return "R$ 0,00";
        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    /* =====================================================
       FORMATAR DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {

            return "A definir";
        }


        const valor =
            String(data)
                .substring(0, 10);


        const partes =
            valor.split("-");


        if (
            partes.length !== 3
        ) {

            return String(data);
        }


        const ano =
            Number(partes[0]);

        const mes =
            Number(partes[1]);

        const dia =
            Number(partes[2]);


        if (
            !ano ||
            !mes ||
            !dia
        ) {

            return String(data);
        }


        return new Date(
            ano,
            mes - 1,
            dia
        ).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       NORMALIZAR HORÁRIO
       ===================================================== */

    function normalizarHorario(valor) {

        if (!valor) {

            return "";
        }


        const texto =
            String(valor)
                .trim();


        const correspondencia =
            texto.match(
                /^(\d{2}:\d{2})(?::\d{2})?$/
            );


        if (correspondencia) {

            return correspondencia[1];
        }


        return texto;
    }


    /* =====================================================
       FORMATAR HORÁRIO DO EVENTO
       ===================================================== */

    function formatarHorario(dados) {

        const inicio =
            normalizarHorario(
                dados?.horarioInicio
            );


        const fim =
            normalizarHorario(
                dados?.horarioFim
            );


        const chegada =
            normalizarHorario(
                dados?.horarioChegada
            );


        if (
            !inicio &&
            !fim &&
            !chegada
        ) {

            return "A definir";
        }


        const partes = [];


        if (inicio) {

            if (fim) {

                partes.push(
                    `${inicio} às ${fim}`
                );

            } else {

                partes.push(
                    inicio
                );
            }
        }


        if (chegada) {

            partes.push(
                `Chegada ${chegada}`
            );
        }


        return partes.join(" · ");
    }


    /* =====================================================
       FORMATAR LOCAL
       ===================================================== */

    function formatarLocal(local) {

        if (!local) {

            return "A definir";
        }


        if (
            typeof local === "string"
        ) {

            try {

                const convertido =
                    JSON.parse(local);


                return formatarLocal(
                    convertido
                );

            } catch (erro) {

                return local;
            }
        }


        if (
            typeof local !== "object"
        ) {

            return String(local);
        }


        if (
            local.enderecoCompleto
        ) {

            return String(
                local.enderecoCompleto
            );
        }


        const partes = [

            local.rua,

            local.numero,

            local.bairro,

            local.cidade,

            local.estado

        ].filter(Boolean);


        if (partes.length) {

            return partes.join(", ");
        }


        if (local.nome) {

            return String(
                local.nome
            );
        }


        if (local.tipoLocal) {

            return String(
                local.tipoLocal
            );
        }


        return "A definir";
    }


    /* =====================================================
       EXTRAIR CIDADE DO LOCAL
       ===================================================== */

    function extrairCidade(local) {

        if (!local) {

            return "";
        }


        if (
            typeof local === "string"
        ) {

            try {

                return extrairCidade(
                    JSON.parse(local)
                );

            } catch (erro) {

                return "";
            }
        }


        if (
            typeof local !== "object"
        ) {

            return "";
        }


        return (
            local.cidade ||
            ""
        );
    }


    /* =====================================================
       OBTER INICIAIS DO NOME
       ===================================================== */

    function obterIniciais(nome) {

        if (!nome) {

            return "MW";
        }


        const partes =
            String(nome)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {

            return "MW";
        }


        if (
            partes.length === 1
        ) {

            return partes[0]
                .substring(0, 2)
                .toUpperCase();
        }


        return (

            partes[0].charAt(0) +

            partes[
                partes.length - 1
            ].charAt(0)

        ).toUpperCase();
    }


    /* =====================================================
       OBTER ID DA CONTRATAÇÃO
       ===================================================== */

    function obterIdDaContratacao() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const idUrl =
            parametros.get(
                CONFIG.parametros.id
            );


        if (idUrl) {

            return idUrl;
        }


        try {

            const bruto =
                sessionStorage.getItem(
                    CONFIG.armazenamento.chave
                );


            if (!bruto) {

                return null;
            }


            const dados =
                JSON.parse(bruto);


            return (
                dados?.id ||
                null
            );

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao recuperar contratação salva.",
                erro
            );


            return null;
        }
    }


    /* =====================================================
       CARREGAR USUÁRIO AUTENTICADO
       ===================================================== */

    async function carregarUsuarioAtual() {

        try {

            if (
                window.UsuarioAtual &&
                typeof window.UsuarioAtual.obter ===
                    "function"
            ) {

                const dados =
                    await window.UsuarioAtual.obter();


                if (
                    dados &&
                    dados.auth &&
                    dados.auth.id
                ) {

                    return dados.auth.id;
                }
            }

        } catch (erro) {

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: não foi possível obter o usuário pelo módulo UsuarioAtual.",
                erro
            );
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return null;
        }


        try {

            const resposta =
                await supabase.auth.getUser();


            if (
                resposta &&
                resposta.data &&
                resposta.data.user
            ) {

                return resposta.data.user.id;
            }

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao obter usuário autenticado.",
                erro
            );
        }


        return null;
    }


    /* =====================================================
       CARREGAR PESSOA
       ===================================================== */

    async function carregarPessoa(
        supabase,
        usuarioId
    ) {

        if (!usuarioId) {

            return null;
        }


        const respostaUsuario =
            await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select(
                    "id,nome,email"
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (respostaUsuario.error) {

            throw respostaUsuario.error;
        }


        const usuario =
            respostaUsuario.data;


        const respostaPerfil =
            await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(
                    `
                    id,
                    usuario_id,
                    nome_exibicao,
                    descricao,
                    ativo,
                    tipo_perfil_id,
                    tipos_perfil (
                        id,
                        nome,
                        descricao
                    )
                    `
                )
                .eq(
                    "usuario_id",
                    usuarioId
                )
                .eq(
                    "ativo",
                    true
                )
                .maybeSingle();


        if (respostaPerfil.error) {

            throw respostaPerfil.error;
        }


        const perfil =
            respostaPerfil.data;


        let perfilArtista =
            null;


        if (perfil?.id) {

            const respostaArtista =
                await supabase
                    .from(
                        CONFIG.tabelas.perfisArtistas
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "perfil_id",
                        perfil.id
                    )
                    .maybeSingle();


            if (
                respostaArtista.error
            ) {

                throw respostaArtista.error;
            }


            perfilArtista =
                respostaArtista.data;
        }


        const nome =
            (
                perfil?.nome_exibicao ||
                usuario?.nome ||
                "Usuário"
            );


        const tipo =
            (
                perfilArtista?.tipo_artista ||
                perfil?.tipos_perfil?.nome ||
                "Usuário"
            );


        const fotoUrl =
            (
                perfilArtista?.foto_url ||
                perfilArtista?.avatar_url ||
                null
            );


        return {

            id:
                usuarioId,

            nome,

            tipo,

            email:
                usuario?.email ||
                null,

            iniciais:
                obterIniciais(
                    nome
                ),

            fotoUrl,

            localizacao:
                perfilArtista?.localizacao ||
                null,

            descricao:
                perfil?.descricao ||
                null,

            perfilId:
                perfil?.id ||
                null
        };
    }


    /* =====================================================
       CARREGAR SERVIÇO

       O serviço é complementar à contratação.

       Caso a relação com servicos_artistas não esteja
       compatível com o schema atual, a contratação continua
       carregando normalmente.
       ===================================================== */

    async function carregarServico(
        supabase,
        servicoId
    ) {

        if (!servicoId) {

            return null;
        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.servicos
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

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: não foi possível carregar o serviço.",
                resposta.error
            );


            return null;
        }


        const servico =
            resposta.data;


        if (!servico) {

            return null;
        }


        return {

            id:
                servico.id,

            nome:
                servico.nome_servico ||
                servico.nome ||
                servico.titulo ||
                "Serviço",

            valor:
                servico.valor ??
                0,

            duracao:
                servico.duracao ||
                "Não informado",

            localizacao:
                servico.area_atendimento ||
                servico.localizacao ||
                "Não informado"
        };
    }


    /* =====================================================
       CARREGAR CONTRATAÇÃO
       ===================================================== */

    async function carregarContratacao() {

        const supabase =
            obterSupabase();


        if (!supabase) {

            return null;
        }


        const id =
            obterIdDaContratacao();


        if (!id) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: ID da contratação não encontrado."
            );


            return null;
        }


        estado.contratacaoId =
            id;


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.contratacoes
                )
                .select("*")
                .eq(
                    "id",
                    id
                )
                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;
        }


        const registro =
            resposta.data;


        if (!registro) {

            return null;
        }


        const usuarioEhContratante =
            String(
                registro.contratante_id
            ) ===
            String(
                estado.usuarioId
            );


        const usuarioEhContratado =
            String(
                registro.contratado_id
            ) ===
            String(
                estado.usuarioId
            );


        const direcao =
            usuarioEhContratante
                ? "enviada"
                : usuarioEhContratado
                    ? "recebida"
                    : "desconhecida";


        if (
            direcao ===
            "desconhecida"
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: usuário não participa desta contratação."
            );


            return null;
        }


        estado.direcao =
            direcao;


        const [
            contratante,
            contratado,
            servico
        ] = await Promise.all([

            carregarPessoa(
                supabase,
                registro.contratante_id
            ),

            carregarPessoa(
                supabase,
                registro.contratado_id
            ),

            carregarServico(
                supabase,
                registro.servico_id
            )

        ]);


        const dados = {

            id:
                registro.id,

            contratanteId:
                registro.contratante_id,

            contratadoId:
                registro.contratado_id,

            servicoId:
                registro.servico_id,

            direcao,

            contratante,

            contratado,

            artista:
                contratado,

            servico: {

                ...(servico || {}),

                valor:
                    registro.valor ??
                    servico?.valor ??
                    0
            },

            data:
                registro.data_evento,

            horarioInicio:
                registro.horario_inicio,

            horarioFim:
                registro.horario_fim,

            horarioChegada:
                null,

            local:
                registro.local,

            tipoEvento:
                registro.tipo_evento,

            quantidadePessoas:
                registro.quantidade_pessoas ||
                registro.publico_estimado ||
                null,

            observacoes:
                registro.observacoes ||
                null,

            status:
                normalizarStatus(
                    registro.status
                ),

            statusBanco:
                registro.status,

            statusFinanceiro:
                registro.status_financeiro ||
                null,

            pagamento: {

                status:
                    registro.status_pagamento,

                metodo:
                    registro.metodo_pagamento
            },

            createdAt:
                registro.created_at,

            updatedAt:
                registro.updated_at
        };


        estado.dados =
            dados;


        return dados;
    }


    /* =====================================================
       NORMALIZAR STATUS
       ===================================================== */

    function normalizarStatus(status) {

        if (!status) {

            return "aguardando_artista";
        }


        const valor =
            String(status)
                .toLowerCase()
                .trim();


        const mapa = {

            rascunho:
                "rascunho",

            solicitacao_enviada:
                "aguardando_artista",

            "solicitação_enviada":
                "aguardando_artista",

            aguardando_confirmacao:
                "aguardando_artista",

            "aguardando_confirmação":
                "aguardando_artista",

            aguardando_artista:
                "aguardando_artista",

            confirmada:
                "confirmada",

            em_andamento:
                "evento",

            evento:
                "evento",

            concluida:
                "concluida",

            "concluída":
                "concluida",

            finalizada:
                "concluida",

            finalizado:
                "concluida",

            pagamento_liberado:
                "pagamento",

            pagamento:
                "pagamento",

            liberado:
                "pagamento",

            liberada:
                "pagamento",

            cancelada:
                "cancelada",

            recusada:
                "recusada"
        };


        return (
            mapa[valor] ||
            "aguardando_artista"
        );
    }


    /* =====================================================
       VERIFICAR SE PAGAMENTO JÁ FOI LIBERADO

       A contratação concluída representa o momento em
       que o pagamento é considerado liberado pelo
       Financeiro atual.

       Não alteramos status_pagamento de "pago".
       ===================================================== */

    function pagamentoJaFoiLiberado() {

        if (!estado.dados) {

            return false;
        }


        const status =
            String(
                estado.dados.statusBanco ||
                ""
            )
                .toLowerCase()
                .trim();


        const pagamento =
            String(
                estado.dados.pagamento?.status ||
                ""
            )
                .toLowerCase()
                .trim();


        const statusFinanceiro =
            String(
                estado.dados.statusFinanceiro ||
                ""
            )
                .toLowerCase()
                .trim();


        return (

            [
                "concluida",
                "concluída",
                "finalizada",
                "finalizado",
                "pagamento_liberado",
                "pagamento",
                "liberado",
                "liberada"
            ].includes(status)

            ||

            [
                "liberado",
                "liberada",
                "recebido"
            ].includes(pagamento)

            ||

            [
                "liberado",
                "liberada",
                "recebido"
            ].includes(statusFinanceiro)

        );
    }


    /* =====================================================
       CRIAR NOTIFICAÇÃO
       ===================================================== */

    async function criarNotificacaoResultado(
        novoStatus
    ) {

        const supabase =
            obterSupabase();


        if (!supabase) {

            return false;
        }


        if (!estado.dados) {

            return false;
        }


        const contratanteId =
            estado.dados.contratanteId;


        const artistaId =
            estado.dados.contratadoId;


        const contratacaoId =
            estado.dados.id;


        if (
            !contratanteId ||
            !artistaId ||
            !contratacaoId
        ) {

            return false;
        }


        /*
         * Aceite e recusa:
         * somente o artista pode gerar
         * estas notificações.
         */

        if (
            novoStatus === "confirmada" ||
            novoStatus === "recusada"
        ) {

            if (
                String(artistaId) !==
                String(estado.usuarioId)
            ) {

                return false;
            }
        }


        /*
         * Conclusão:
         * somente o contratante pode confirmar
         * a realização do serviço.
         */

        if (
            novoStatus ===
            "contratacao_concluida"
        ) {

            if (
                String(contratanteId) !==
                String(estado.usuarioId)
            ) {

                return false;
            }
        }


        /*
         * Compatibilidade com o fluxo antigo.
         */

        if (
            novoStatus ===
            "pagamento_liberado"
        ) {

            if (
                String(contratanteId) !==
                String(estado.usuarioId)
            ) {

                return false;
            }
        }


        let tipo;
        let titulo;
        let mensagem;
        let remetenteId;
        let destinatarioId;


        if (
            novoStatus ===
            "confirmada"
        ) {

            tipo =
                "contratacao_aceita";

            titulo =
                "Contratação aceita";

            mensagem =
                "O artista aceitou sua solicitação de contratação.";

            remetenteId =
                artistaId;

            destinatarioId =
                contratanteId;

        } else if (
            novoStatus ===
            "recusada"
        ) {

            tipo =
                "contratacao_recusada";

            titulo =
                "Contratação recusada";

            mensagem =
                "O artista recusou sua solicitação de contratação.";

            remetenteId =
                artistaId;

            destinatarioId =
                contratanteId;

        } else if (
            novoStatus ===
            "contratacao_concluida"
        ) {

            tipo =
                "pagamento_liberado";

            titulo =
                "Pagamento liberado";

            mensagem =
                "O contratante confirmou a realização do serviço. O pagamento foi liberado ao profissional.";

            remetenteId =
                contratanteId;

            destinatarioId =
                artistaId;

        } else if (
            novoStatus ===
            "pagamento_liberado"
        ) {

            tipo =
                "pagamento_liberado";

            titulo =
                "Pagamento liberado";

            mensagem =
                "O contratante liberou o pagamento referente à contratação.";

            remetenteId =
                contratanteId;

            destinatarioId =
                artistaId;

        } else {

            return false;
        }


        try {

            const resposta =
                await supabase
                    .from(
                        CONFIG.tabelas.notificacoes
                    )
                    .insert({

                        usuario_id:
                            destinatarioId,

                        remetente_id:
                            remetenteId,

                        tipo:
                            tipo,

                        titulo:
                            titulo,

                        mensagem:
                            mensagem,

                        referencia_id:
                            contratacaoId,

                        referencia_tipo:
                            "contratacao",

                        lida:
                            false
                    });


            if (resposta.error) {

                console.error(
                    "MusicalWorldContratacaoAcompanhamento: contratação atualizada, mas a notificação não pôde ser criada.",
                    resposta.error
                );


                return false;
            }


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao criar notificação.",
                erro
            );


            return false;
        }
    }


    /* =====================================================
       RENDERIZAR RELAÇÃO
       ===================================================== */

    function renderizarRelacao(dados) {

        const titulo =
            obterElemento(
                "relacaoTitulo"
            );


        const descricao =
            obterElemento(
                "relacaoDescricao"
            );


        const paginaTitulo =
            obterElemento(
                "paginaTitulo"
            );


        const paginaDescricao =
            obterElemento(
                "paginaDescricao"
            );


        const participanteEyebrow =
            obterElemento(
                "participanteEyebrow"
            );


        const participanteTitulo =
            obterElemento(
                "participanteTitulo"
            );


        const timelineTitulo =
            obterElemento(
                "timelineArtistaTitulo"
            );


        const timelineDescricao =
            obterElemento(
                "timelineArtistaDescricao"
            );


        /*
         * SOLICITAÇÃO RECEBIDA
         */

        if (
            dados.direcao ===
            "recebida"
        ) {

            if (titulo) {

                titulo.textContent =
                    "Solicitação recebida";
            }


            if (descricao) {

                if (
                    dados.status ===
                        "concluida" ||
                    dados.status ===
                        "pagamento"
                ) {

                    descricao.textContent =
                        "A contratação foi concluída e o pagamento foi liberado.";

                } else if (
                    dados.status ===
                    "evento"
                ) {

                    descricao.textContent =
                        "O evento está em andamento conforme o combinado.";

                } else {

                    descricao.textContent =
                        "Você recebeu uma solicitação de contratação e precisa analisar os detalhes do evento.";
                }
            }


            if (paginaTitulo) {

                paginaTitulo.textContent =
                    "Solicitação de contratação";
            }


            if (paginaDescricao) {

                paginaDescricao.textContent =
                    "Confira os detalhes do evento e acompanhe o andamento da solicitação.";
            }


            if (participanteEyebrow) {

                participanteEyebrow.textContent =
                    "Contratante";
            }


            if (participanteTitulo) {

                participanteTitulo.textContent =
                    "Pessoa que solicitou o serviço";
            }


            if (timelineTitulo) {

                if (
                    dados.status ===
                        "concluida" ||
                    dados.status ===
                        "pagamento"
                ) {

                    timelineTitulo.textContent =
                        "Contratação concluída";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "O serviço foi realizado e o pagamento foi liberado.";

                    }

                } else if (
                    dados.status ===
                    "evento"
                ) {

                    timelineTitulo.textContent =
                        "Evento em andamento";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "A contratação está sendo realizada conforme o combinado.";

                    }

                } else if (
                    dados.status ===
                    "confirmada"
                ) {

                    timelineTitulo.textContent =
                        "Contratação confirmada";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "Você aceitou a contratação e o evento está agendado.";

                    }

                } else {

                    timelineTitulo.textContent =
                        "Aguardando sua resposta";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "Analise a solicitação e confirme ou recuse a contratação.";
                    }
                }
            }


            return;
        }


        /*
         * CONTRATAÇÃO ENVIADA
         */

        if (titulo) {

            if (
                dados.status ===
                    "concluida" ||
                dados.status ===
                    "pagamento"
            ) {

                titulo.textContent =
                    "Contratação concluída";

            } else if (
                dados.status ===
                "evento"
            ) {

                titulo.textContent =
                    "Evento em andamento";

            } else {

                titulo.textContent =
                    "Contratação enviada";
            }
        }


        if (descricao) {

            if (
                dados.status ===
                    "concluida" ||
                dados.status ===
                    "pagamento"
            ) {

                descricao.textContent =
                    "O serviço foi realizado e o pagamento foi liberado ao profissional.";

            } else if (
                dados.status ===
                "evento"
            ) {

                descricao.textContent =
                    "O evento está em andamento conforme o combinado.";

            } else if (
                dados.status ===
                "confirmada"
            ) {

                descricao.textContent =
                    "O artista aceitou sua solicitação e o evento está agendado.";

            } else {

                descricao.textContent =
                    "Você enviou esta solicitação para o profissional.";
            }
        }


        if (paginaTitulo) {

            paginaTitulo.textContent =
                "Sua contratação";
        }


        if (paginaDescricao) {

            paginaDescricao.textContent =
                "Acompanhe cada etapa até a realização do evento.";
        }


        if (participanteEyebrow) {

            participanteEyebrow.textContent =
                "Artista";
        }


        if (participanteTitulo) {

            participanteTitulo.textContent =
                "Profissional contratado";
        }


        if (timelineTitulo) {

            if (
                dados.status ===
                "evento"
            ) {

                timelineTitulo.textContent =
                    "Evento em andamento";


                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O evento está sendo realizado conforme o combinado.";
                }

            } else if (
                dados.status ===
                    "concluida" ||
                dados.status ===
                    "pagamento"
            ) {

                timelineTitulo.textContent =
                    "Contratação concluída";


                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O serviço foi confirmado como realizado e o pagamento foi liberado.";
                }

            } else if (
                dados.status ===
                "confirmada"
            ) {

                timelineTitulo.textContent =
                    "Contratação confirmada";


                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O artista aceitou sua solicitação e a contratação está confirmada.";
                }

            } else {

                timelineTitulo.textContent =
                    "Aguardando o artista";


                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O artista está analisando a solicitação.";
                }
            }
        }
    }


    /* =====================================================
       RENDERIZAR PARTICIPANTE
       ===================================================== */

    function renderizarParticipante(dados) {

        const pessoa =
            dados.direcao ===
            "recebida"

                ? dados.contratante

                : dados.contratado;


        if (!pessoa) {

            return;
        }


        const avatar =
            obterElemento(
                "artistaAvatar"
            );


        if (avatar) {

            avatar.innerHTML =
                "";


            if (pessoa.fotoUrl) {

                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    pessoa.fotoUrl;


                imagem.alt =
                    pessoa.nome ||
                    "Usuário";


                imagem.loading =
                    "lazy";


                imagem.decoding =
                    "async";


                imagem.onerror =
                    function () {

                        avatar.innerHTML =
                            "";


                        avatar.textContent =
                            pessoa.iniciais ||
                            obterIniciais(
                                pessoa.nome
                            );
                    };


                avatar.appendChild(
                    imagem
                );

            } else {

                avatar.textContent =
                    pessoa.iniciais ||
                    obterIniciais(
                        pessoa.nome
                    );
            }
        }


        const nome =
            obterElemento(
                "artistaNome"
            );


        if (nome) {

            nome.textContent =
                pessoa.nome ||
                "Usuário";
        }


        const tipo =
            obterElemento(
                "artistaTipo"
            );


        if (tipo) {

            tipo.textContent =
                pessoa.tipo ||
                "Usuário";
        }


        const localizacao =
            obterElemento(
                "artistaLocalizacao"
            );


        if (localizacao) {

            if (
                typeof pessoa.localizacao ===
                "string"
            ) {

                localizacao.textContent =
                    pessoa.localizacao ||
                    "Localização não informada";

            } else {

                localizacao.textContent =
                    extrairCidade(
                        pessoa.localizacao
                    ) ||
                    "Localização não informada";
            }
        }
    }


    /* =====================================================
       RENDERIZAR SERVIÇO
       ===================================================== */

    function renderizarServico(servico) {

        const nome =
            obterElemento(
                "servicoNome"
            );


        const valor =
            obterElemento(
                "servicoValor"
            );


        const duracao =
            obterElemento(
                "servicoDuracao"
            );


        const localizacao =
            obterElemento(
                "servicoLocalizacao"
            );


        if (!servico) {

            if (nome) {

                nome.textContent =
                    "Serviço contratado";
            }


            if (valor) {

                valor.textContent =
                    "R$ 0,00";
            }


            if (duracao) {

                duracao.textContent =
                    "Não informado";
            }


            if (localizacao) {

                localizacao.textContent =
                    "Não informado";
            }


            return;
        }


        if (nome) {

            nome.textContent =
                servico.nome ||
                "Serviço";
        }


        if (valor) {

            valor.textContent =
                formatarMoeda(
                    servico.valor
                );
        }


        if (duracao) {

            duracao.textContent =
                servico.duracao ||
                "Não informado";
        }


        if (localizacao) {

            localizacao.textContent =
                servico.localizacao ||
                "Não informado";
        }
    }


    /* =====================================================
       RENDERIZAR EVENTO
       ===================================================== */

    function renderizarEvento(dados) {

        const data =
            obterElemento(
                "dataEvento"
            );


        if (data) {

            data.textContent =
                formatarData(
                    dados.data
                );
        }


        const horario =
            obterElemento(
                "horarioEvento"
            );


        if (horario) {

            horario.textContent =
                formatarHorario(
                    dados
                );
        }


        const local =
            obterElemento(
                "localEvento"
            );


        if (local) {

            local.textContent =
                formatarLocal(
                    dados.local
                );
        }


        const tipo =
            obterElemento(
                "tipoEvento"
            );


        if (tipo) {

            tipo.textContent =
                dados.tipoEvento ||
                "Não informado";
        }


        const quantidade =
            obterElemento(
                "quantidadePessoas"
            );


        const quantidadeContainer =
            obterElemento(
                "quantidadePessoasContainer"
            );


        if (quantidade) {

            if (
                dados.quantidadePessoas
            ) {

                quantidade.textContent =
                    Number(
                        dados.quantidadePessoas
                    ).toLocaleString(
                        "pt-BR"
                    ) +
                    " pessoas";

                if (quantidadeContainer) {

                    quantidadeContainer.hidden =
                        false;
                }

            } else {

                if (quantidadeContainer) {

                    quantidadeContainer.hidden =
                        true;
                }
            }
        }


        const observacoes =
            obterElemento(
                "observacoesEvento"
            );


        if (observacoes) {

            observacoes.textContent =
                dados.observacoes ||
                "Nenhuma observação adicionada.";
        }
    }


    /* =====================================================
       RENDERIZAR STATUS PRINCIPAL
       ===================================================== */

    function renderizarStatusPrincipal(
        status
    ) {

        const elementoStatus =
            obterElemento(
                "statusAtual"
            );


        const elementoDescricao =
            obterElemento(
                "statusDescricao"
            );


        const elementoIcone =
            obterElemento(
                "statusPrincipalIcon"
            );


        const recebida =
            estado.direcao ===
            "recebida";


        const configuracoes = {

            rascunho: {

                titulo:
                    "Rascunho",

                descricao:
                    "A contratação ainda não foi enviada.",

                icone:
                    "file-edit"
            },


            aguardando_artista: {

                titulo:
                    recebida
                        ? "Aguardando sua resposta"
                        : "Aguardando confirmação do artista",

                descricao:
                    recebida
                        ? "Você recebeu esta solicitação e precisa analisar os detalhes antes de aceitar ou recusar."
                        : "O artista precisa analisar sua solicitação antes de confirmar a contratação.",

                icone:
                    "clock-3"
            },


            confirmada: {

                titulo:
                    "Contratação confirmada",

                descricao:
                    recebida
                        ? "Você confirmou a contratação e o evento está agendado."
                        : "O artista aceitou sua solicitação e a contratação está confirmada.",

                icone:
                    "circle-check"
            },


            evento: {

                titulo:
                    "Evento realizado",

                descricao:
                    recebida
                        ? "O evento foi registrado como realizado na simulação."
                        : "O evento foi registrado como realizado. Agora confirme o serviço para liberar o pagamento.",

                icone:
                    "calendar-check"
            },


            concluida: {

                titulo:
                    "Contratação concluída",

                descricao:
                    "O serviço foi confirmado como realizado e o pagamento foi liberado ao profissional.",

                icone:
                    "check-check"
            },


            pagamento: {

                titulo:
                    "Pagamento liberado",

                descricao:
                    recebida
                        ? "O contratante liberou o pagamento. O valor agora está disponível no seu financeiro."
                        : "O pagamento foi liberado ao profissional.",

                icone:
                    "badge-check"
            },


            cancelada: {

                titulo:
                    "Contratação cancelada",

                descricao:
                    "Esta contratação foi cancelada.",

                icone:
                    "circle-x"
            },


            recusada: {

                titulo:
                    "Solicitação recusada",

                descricao:
                    recebida
                        ? "Você recusou esta solicitação de contratação."
                        : "O profissional recusou esta solicitação.",

                icone:
                    "circle-x"
            }
        };


        const configuracao =
            configuracoes[status] ||
            configuracoes.aguardando_artista;


        if (elementoStatus) {

            elementoStatus.textContent =
                configuracao.titulo;
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                configuracao.descricao;
        }


        if (elementoIcone) {

            elementoIcone.setAttribute(
                "data-lucide",
                configuracao.icone
            );
        }


        atualizarIcones();
    }


    /* =====================================================
       ATUALIZAR TIMELINE
       ===================================================== */

    function atualizarTimeline(status) {

        const itens =
            document.querySelectorAll(
                ".timeline-item"
            );


        if (!itens.length) {

            return;
        }


        let indiceAtual =
            1;


        switch (status) {

            case "rascunho":

                indiceAtual =
                    0;

                break;


            case "aguardando_artista":

                indiceAtual =
                    1;

                break;


            case "confirmada":

                indiceAtual =
                    2;

                break;


            case "evento":

                indiceAtual =
                    3;

                break;


            case "concluida":

                /*
                 * A conclusão representa:
                 *
                 * - evento realizado;
                 * - contratação concluída;
                 * - pagamento liberado.
                 */

                indiceAtual =
                    5;

                break;


            case "pagamento":

                indiceAtual =
                    5;

                break;


            case "cancelada":
            case "recusada":

                indiceAtual =
                    1;

                break;


            default:

                indiceAtual =
                    1;

                break;
        }


        itens.forEach(
            function (item, indice) {

                item.classList.remove(
                    "concluido"
                );


                item.classList.remove(
                    "ativo"
                );


                const marker =
                    item.querySelector(
                        ".timeline-marker"
                    );


                if (!marker) {

                    return;
                }


                if (
                    status === "cancelada" ||
                    status === "recusada"
                ) {

                    if (
                        indice === 0
                    ) {

                        item.classList.add(
                            "concluido"
                        );


                        marker.innerHTML =
                            '<i data-lucide="check"></i>';

                    } else if (
                        indice === 1
                    ) {

                        item.classList.add(
                            "ativo"
                        );


                        marker.innerHTML =
                            '<i data-lucide="circle-x"></i>';

                    } else {

                        marker.innerHTML =
                            '<i data-lucide="circle"></i>';
                    }


                    return;
                }


                if (
                    indice <=
                    indiceAtual
                ) {

                    item.classList.add(
                        "concluido"
                    );


                    marker.innerHTML =
                        '<i data-lucide="check"></i>';


                    return;
                }


                marker.innerHTML =
                    '<i data-lucide="circle"></i>';
            }
        );


        atualizarIcones();
    }


    /* =====================================================
       RENDERIZAR PAGAMENTO
       ===================================================== */

    function renderizarPagamento(
        pagamento
    ) {

        const elementoStatus =
            obterElemento(
                "pagamentoStatus"
            );


        const elementoDescricao =
            obterElemento(
                "pagamentoDescricao"
            );


        const status =
            String(
                pagamento?.status ||
                ""
            )
                .toLowerCase()
                .trim();


        const metodo =
            String(
                pagamento?.metodo ||
                ""
            )
                .toLowerCase()
                .trim();


        /*
         * ESTADO FINAL
         */

        if (
            estado.statusAtual ===
                "concluida" ||
            estado.statusAtual ===
                "pagamento" ||
            pagamentoJaFoiLiberado()
        ) {

            if (elementoStatus) {

                elementoStatus.textContent =
                    "Pagamento liberado";
            }


            if (elementoDescricao) {

                if (
                    estado.direcao ===
                    "recebida"
                ) {

                    elementoDescricao.textContent =
                        "O contratante confirmou a realização do serviço. O valor foi liberado e está disponível no seu financeiro.";

                } else {

                    elementoDescricao.textContent =
                        "O serviço foi confirmado como realizado e o pagamento foi liberado ao profissional.";
                }
            }


            return;
        }


        /*
         * PAGAMENTO PROCESSADO/PAGO,
         * MAS AINDA AGUARDANDO CONCLUSÃO.
         */

        if (
            status.includes("pago") ||
            status.includes("aprovado") ||
            status.includes("simulacao") ||
            status.includes("simulação")
        ) {

            if (elementoStatus) {

                elementoStatus.textContent =
                    (
                        status.includes("simulacao") ||
                        status.includes("simulação")
                    )
                        ? "Pagamento simulado"
                        : "Pagamento processado";
            }


            if (elementoDescricao) {

                if (
                    estado.direcao ===
                    "recebida"
                ) {

                    elementoDescricao.textContent =
                        "O pagamento foi realizado pelo contratante e permanece aguardando a conclusão do serviço.";

                } else if (
                    metodo ===
                    "pix"
                ) {

                    elementoDescricao.textContent =
                        "O pagamento via Pix foi associado à contratação e será liberado após a confirmação da realização do serviço.";

                } else {

                    elementoDescricao.textContent =
                        "O pagamento está associado à contratação e será liberado após a confirmação da realização do serviço.";
                }
            }


            return;
        }


        if (elementoStatus) {

            elementoStatus.textContent =
                "Pagamento aguardando atualização";
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                "As informações de pagamento serão atualizadas conforme o andamento da contratação.";
        }
    }


    /* =====================================================
       RENDERIZAR AÇÃO PRINCIPAL

       A mesma área é utilizada para as duas etapas:

       CONFIRMADA:
       "Simular evento realizado"

       EVENTO:
       "Confirmar serviço realizado"

       Depois de concluída:
       área desaparece.
       ===================================================== */

    function renderizarAcoesConclusao(
        dados
    ) {

        const container =
            obterElemento(
                "acoesConclusao"
            );


        const botao =
            obterElemento(
                "btnConcluirContratacao"
            );


        if (!container) {

            return;
        }


        /*
         * Somente o contratante pode executar
         * as ações de simulação/conclusão.
         */

        const ehContratante =
            dados &&
            dados.direcao ===
            "enviada";


        /*
         * ETAPA 1:
         *
         * A contratação foi aceita.
         *
         * Mostramos a simulação do evento.
         */

        const podeSimularEvento =
            ehContratante &&
            dados.status ===
            "confirmada" &&
            !estado.simulandoEvento;


        /*
         * ETAPA 2:
         *
         * O evento já foi simulado.
         *
         * Agora o contratante pode confirmar
         * que o serviço foi realizado.
         */

        const podeConcluir =
            ehContratante &&
            dados.status ===
            "evento" &&
            !estado.concluindoContratacao;


        const deveExibir =
            podeSimularEvento ||
            podeConcluir;


        container.hidden =
            !deveExibir;


        if (!botao) {

            return;
        }


        botao.disabled =
            !deveExibir;


        if (podeSimularEvento) {

            /*
             * Título principal do bloco.
             *
             * Caso o HTML possua um parágrafo dentro
             * de #acoesConclusao, também atualizamos
             * automaticamente.
             */

            atualizarTextoAcaoConclusao(
                container,
                "O evento já aconteceu?",
                "Como estamos em modo de simulação, registre o evento como realizado para continuar."
            );


            botao.innerHTML =
                `
                <i data-lucide="calendar-check"></i>
                Simular evento realizado
                `;


            botao.dataset.acao =
                "simular-evento";


        } else if (podeConcluir) {

            atualizarTextoAcaoConclusao(
                container,
                "O serviço foi realizado?",
                "Confirme a realização do serviço para concluir a contratação e liberar o pagamento ao profissional."
            );


            botao.innerHTML =
                `
                <i data-lucide="circle-check"></i>
                Confirmar serviço realizado
                `;


            botao.dataset.acao =
                "concluir-contratacao";

        } else {

            botao.dataset.acao =
                "";
        }


        atualizarIcones();
    }


    /* =====================================================
       ATUALIZAR TEXTO DO BLOCO DE AÇÃO

       Não depende de novos IDs no HTML.

       O código procura elementos de texto dentro
       do próprio container para manter compatibilidade
       com o HTML já existente.
       ===================================================== */

    function atualizarTextoAcaoConclusao(
        container,
        titulo,
        descricao
    ) {

        if (!container) {

            return;
        }


        const elementosTexto =
            container.querySelectorAll(
                "h2, h3, h4, strong, p"
            );


        if (!elementosTexto.length) {

            return;
        }


        let tituloEncontrado =
            false;


        elementosTexto.forEach(
            function (elemento) {

                const tag =
                    elemento.tagName
                        .toLowerCase();


                if (
                    (
                        tag === "h2" ||
                        tag === "h3" ||
                        tag === "h4" ||
                        tag === "strong"
                    ) &&
                    !tituloEncontrado
                ) {

                    elemento.textContent =
                        titulo;

                    tituloEncontrado =
                        true;

                    return;
                }


                if (
                    tag === "p"
                ) {

                    elemento.textContent =
                        descricao;
                }
            }
        );
    }


    /* =====================================================
       RENDERIZAR AÇÃO DE PAGAMENTO LEGADA

       O novo fluxo não possui mais um segundo botão
       chamado "Liberar pagamento".

       Esta função apenas mantém compatibilidade
       com HTMLs antigos.
       ===================================================== */

    function renderizarAcaoLiberacaoPagamento() {

        const container =
            obterElemento(
                "pagamentoAcao"
            );


        if (!container) {

            return;
        }


        container.hidden =
            true;
    }


    /* =====================================================
       SIMULAR EVENTO REALIZADO

       Esta função existe exclusivamente para o fluxo
       de desenvolvimento.

       O contratante é quem inicia a simulação.

       CONFIRMADA
          ↓
       EVENTO

       Nenhum pagamento é liberado nesta etapa.

       O pagamento somente será considerado liberado
       quando o contratante confirmar a conclusão.
       ===================================================== */

    async function simularEventoRealizado() {

        if (
            estado.simulandoEvento
        ) {

            return false;
        }


        if (!estado.dados) {

            return false;
        }


        /*
         * Somente o contratante pode simular
         * a realização do evento.
         */

        if (
            estado.direcao !==
            "enviada"
        ) {

            return false;
        }


        /*
         * A contratação precisa estar confirmada.
         */

        if (
            estado.dados.status !==
            "confirmada"
        ) {

            if (
                estado.dados.status ===
                    "evento" ||
                estado.dados.status ===
                    "concluida"
            ) {

                renderizarAcoesConclusao(
                    estado.dados
                );

                return false;
            }


            alert(
                "A contratação precisa estar confirmada antes de simular o evento."
            );


            return false;
        }


        const confirmar =
            window.confirm(
                "Simular que o evento aconteceu? O pagamento ainda não será liberado nesta etapa."
            );


        if (!confirmar) {

            return false;
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return false;
        }


        const botao =
            obterElemento(
                "btnConcluirContratacao"
            );


        estado.simulandoEvento =
            true;


        if (botao) {

            botao.disabled =
                true;


            botao.innerHTML =
                `
                <i data-lucide="loader-circle"></i>
                Registrando evento...
                `;


            atualizarIcones();
        }


        try {

            /*
             * Atualização protegida:
             *
             * somente confirmada → evento.
             *
             * Isso impede que o evento seja
             * simulado novamente depois.
             */

            const resposta =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .update({

                        status:
                            "evento",

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        estado.contratacaoId
                    )
                    .eq(
                        "contratante_id",
                        estado.usuarioId
                    )
                    .eq(
                        "status",
                        "confirmada"
                    )
                    .select(
                        "id,status,status_pagamento,updated_at"
                    )
                    .maybeSingle();


            if (resposta.error) {

                throw resposta.error;
            }


            if (!resposta.data) {

                throw new Error(
                    "O evento não pôde ser registrado. A contratação pode ter sido alterada em outra sessão."
                );
            }


            /*
             * Atualiza estado local.
             */

            estado.dados.statusBanco =
                resposta.data.status;


            estado.dados.status =
                "evento";


            estado.dados.updatedAt =
                resposta.data.updated_at;


            estado.statusAtual =
                "evento";


            /*
             * Atualiza interface.
             */

            renderizarRelacao(
                estado.dados
            );


            renderizarStatusPrincipal(
                estado.statusAtual
            );


            atualizarTimeline(
                estado.statusAtual
            );


            renderizarPagamento(
                estado.dados.pagamento
            );


            renderizarAcoes(
                estado.dados
            );


            renderizarAcoesConclusao(
                estado.dados
            );


            renderizarAcaoLiberacaoPagamento(
                estado.dados
            );


            /*
             * Atualiza cache local.
             */

            salvarContratacaoLocal();


            const acoesStatus =
                obterElemento(
                    "acoesStatus"
                );


            if (acoesStatus) {

                acoesStatus.hidden =
                    false;

                acoesStatus.textContent =
                    "Evento registrado. Agora confirme a realização do serviço para liberar o pagamento.";
            }


            console.log(
                "MusicalWorldContratacaoAcompanhamento: evento simulado com sucesso.",
                resposta.data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao simular evento.",
                erro
            );


            alert(
                "Não foi possível registrar o evento. Tente novamente."
            );


            if (botao) {

                botao.disabled =
                    false;


                botao.innerHTML =
                    `
                    <i data-lucide="calendar-check"></i>
                    Simular evento realizado
                    `;


                atualizarIcones();
            }


            return false;

        } finally {

            estado.simulandoEvento =
                false;


            if (
                estado.dados
            ) {

                renderizarAcoesConclusao(
                    estado.dados
                );
            }
        }
    }


    /* =====================================================
       CONCLUIR CONTRATAÇÃO E LIBERAR PAGAMENTO

       Esta é a segunda etapa do fluxo.

       EVENTO
          ↓
       CONTRATANTE CONFIRMA
          ↓
       CONCLUIDA
          ↓
       PAGAMENTO LIBERADO

       O Financeiro atual utiliza "concluida" como
       sinal de que o valor saiu de "A receber" e
       passou para "Total recebido / Saldo disponível".

       Não alteramos status_pagamento.
       ===================================================== */

    async function concluirContratacao() {

        if (
            estado.concluindoContratacao
        ) {

            return false;
        }


        if (!estado.dados) {

            return false;
        }


        /*
         * Somente o contratante pode concluir.
         */

        if (
            estado.direcao !==
            "enviada"
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: somente o contratante pode concluir a contratação."
            );


            return false;
        }


        /*
         * O evento precisa ter sido realizado.
         *
         * No desenvolvimento, isso significa que
         * o usuário primeiro clicou em:
         *
         * "Simular evento realizado"
         */

        if (
            estado.dados.status !==
            "evento"
        ) {

            if (
                estado.dados.status ===
                    "confirmada"
            ) {

                alert(
                    "Primeiro simule a realização do evento."
                );

                return false;
            }


            if (
                estado.dados.status ===
                    "concluida" ||
                estado.dados.status ===
                    "pagamento"
            ) {

                renderizarAcoesConclusao(
                    estado.dados
                );


                return false;
            }


            alert(
                "O evento precisa estar registrado antes de concluir a contratação."
            );


            return false;
        }


        /*
         * Proteção adicional contra pagamento duplicado.
         */

        if (
            pagamentoJaFoiLiberado()
        ) {

            alert(
                "Esta contratação já foi concluída e o pagamento já foi liberado."
            );


            renderizarAcoesConclusao(
                estado.dados
            );


            return false;
        }


        const confirmar =
            window.confirm(
                "Confirmar que o serviço foi realizado? Ao confirmar, a contratação será concluída e o pagamento será liberado ao profissional."
            );


        if (!confirmar) {

            return false;
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return false;
        }


        const botao =
            obterElemento(
                "btnConcluirContratacao"
            );


        estado.concluindoContratacao =
            true;


        if (botao) {

            botao.disabled =
                true;


            botao.innerHTML =
                `
                <i data-lucide="loader-circle"></i>
                Confirmando serviço...
                `;


            atualizarIcones();
        }


        try {

            /*
             * Atualização atômica:
             *
             * somente evento → concluida.
             *
             * Isso evita que duas abas liberem
             * o mesmo pagamento.
             */

            const resposta =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .update({

                        status:
                            "concluida",

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        estado.contratacaoId
                    )
                    .eq(
                        "contratante_id",
                        estado.usuarioId
                    )
                    .eq(
                        "status",
                        "evento"
                    )
                    .select(
                        "id,status,status_pagamento,updated_at"
                    )
                    .maybeSingle();


            if (resposta.error) {

                throw resposta.error;
            }


            if (!resposta.data) {

                throw new Error(
                    "A contratação não pôde ser concluída. Ela pode já ter sido concluída ou a alteração não foi permitida."
                );
            }


            /*
             * Atualiza estado local.
             */

            estado.dados.statusBanco =
                resposta.data.status;


            estado.dados.status =
                "concluida";


            estado.dados.updatedAt =
                resposta.data.updated_at;


            /*
             * Não alteramos status_pagamento.
             *
             * O Financeiro utiliza o status "concluida"
             * para considerar o pagamento liberado.
             */

            estado.statusAtual =
                "concluida";


            /*
             * Atualiza toda a interface.
             */

            renderizarRelacao(
                estado.dados
            );


            renderizarStatusPrincipal(
                estado.statusAtual
            );


            atualizarTimeline(
                estado.statusAtual
            );


            renderizarPagamento(
                estado.dados.pagamento
            );


            renderizarAcoes(
                estado.dados
            );


            renderizarAcoesConclusao(
                estado.dados
            );


            renderizarAcaoLiberacaoPagamento(
                estado.dados
            );


            /*
             * Notificação para o artista.
             *
             * A falha da notificação não desfaz
             * a conclusão da contratação.
             */

            await criarNotificacaoResultado(
                "contratacao_concluida"
            );


            /*
             * Atualiza cache local.
             */

            salvarContratacaoLocal();


            const acoesStatus =
                obterElemento(
                    "acoesStatus"
                );


            if (acoesStatus) {

                acoesStatus.hidden =
                    false;

                acoesStatus.textContent =
                    "Serviço confirmado. Pagamento liberado ao profissional.";
            }


            console.log(
                "MusicalWorldContratacaoAcompanhamento: contratação concluída e pagamento liberado.",
                resposta.data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao concluir contratação.",
                erro
            );


            alert(
                "Não foi possível concluir a contratação. Tente novamente."
            );


            if (botao) {

                botao.disabled =
                    false;


                botao.innerHTML =
                    `
                    <i data-lucide="circle-check"></i>
                    Confirmar serviço realizado
                    `;


                atualizarIcones();
            }


            return false;

        } finally {

            estado.concluindoContratacao =
                false;


            if (
                estado.dados
            ) {

                renderizarAcoesConclusao(
                    estado.dados
                );
            }
        }
    }


    /* =====================================================
       PROCESSAR AÇÃO PRINCIPAL

       O mesmo botão possui duas funções:

       confirmada → simular evento

       evento → concluir contratação
       ===================================================== */

    async function processarAcaoPrincipal() {

        if (!estado.dados) {

            return false;
        }


        if (
            estado.dados.status ===
            "confirmada"
        ) {

            return simularEventoRealizado();
        }


        if (
            estado.dados.status ===
            "evento"
        ) {

            return concluirContratacao();
        }


        return false;
    }


    /* =====================================================
       RENDERIZAR AÇÕES DA SOLICITAÇÃO
       ===================================================== */

    function renderizarAcoes(dados) {

        const container =
            obterElemento(
                "acoesSolicitacao"
            );


        if (container) {

            const deveExibir =
                dados &&
                dados.direcao ===
                    "recebida" &&
                dados.status ===
                    "aguardando_artista";


            container.hidden =
                !deveExibir;
        }


        /*
         * A ação de conclusão/simulação é controlada
         * separadamente.
         */

        renderizarAcoesConclusao(
            dados
        );
    }


    /* =====================================================
       ATUALIZAR STATUS DA CONTRATAÇÃO
       ===================================================== */

    async function atualizarStatusContratacao(
        novoStatus
    ) {

        if (
            estado.atualizandoStatus
        ) {

            return false;
        }


        if (
            estado.direcao !==
            "recebida"
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: usuário não pode alterar o status desta contratação."
            );


            return false;
        }


        const statusPermitidos = [

            "confirmada",

            "recusada"

        ];


        if (
            !statusPermitidos.includes(
                novoStatus
            )
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: status não permitido para esta ação.",
                novoStatus
            );


            return false;
        }


        if (
            !estado.dados ||
            estado.dados.status !==
                "aguardando_artista"
        ) {

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: esta contratação não está mais aguardando resposta."
            );


            return false;
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return false;
        }


        if (!estado.contratacaoId) {

            return false;
        }


        if (!estado.usuarioId) {

            return false;
        }


        estado.atualizandoStatus =
            true;


        const botaoAceitar =
            obterElemento(
                "btnAceitar"
            );


        const botaoRecusar =
            obterElemento(
                "btnRecusar"
            );


        if (botaoAceitar) {

            botaoAceitar.disabled =
                true;
        }


        if (botaoRecusar) {

            botaoRecusar.disabled =
                true;
        }


        try {

            const resposta =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .update({

                        status:
                            novoStatus,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        estado.contratacaoId
                    )
                    .eq(
                        "contratado_id",
                        estado.usuarioId
                    )
                    .eq(
                        "status",
                        estado.dados.statusBanco ||
                        "aguardando_confirmacao"
                    )
                    .select(
                        "id,status,updated_at"
                    )
                    .maybeSingle();


            if (resposta.error) {

                throw resposta.error;
            }


            if (!resposta.data) {

                throw new Error(
                    "A contratação não pôde ser atualizada. Verifique as permissões ou se o status já foi alterado."
                );
            }


            if (estado.dados) {

                estado.dados.status =
                    normalizarStatus(
                        resposta.data.status
                    );


                estado.dados.statusBanco =
                    resposta.data.status;


                estado.dados.updatedAt =
                    resposta.data.updated_at;
            }


            estado.statusAtual =
                normalizarStatus(
                    resposta.data.status
                );


            renderizarRelacao(
                estado.dados
            );


            renderizarStatusPrincipal(
                estado.statusAtual
            );


            atualizarTimeline(
                estado.statusAtual
            );


            renderizarAcoes(
                estado.dados
            );


            renderizarPagamento(
                estado.dados.pagamento
            );


            renderizarAcaoLiberacaoPagamento(
                estado.dados
            );


            await criarNotificacaoResultado(
                novoStatus
            );


            salvarContratacaoLocal();


            console.log(
                "MusicalWorldContratacaoAcompanhamento: status atualizado.",
                resposta.data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao atualizar status da contratação.",
                erro
            );


            alert(
                "Não foi possível atualizar a contratação. Tente novamente."
            );


            return false;

        } finally {

            estado.atualizandoStatus =
                false;


            const podeAgir =
                estado.direcao ===
                    "recebida" &&
                estado.dados &&
                estado.dados.status ===
                    "aguardando_artista";


            if (botaoAceitar) {

                botaoAceitar.disabled =
                    !podeAgir;
            }


            if (botaoRecusar) {

                botaoRecusar.disabled =
                    !podeAgir;
            }
        }
    }


    /* =====================================================
       ACEITAR CONTRATAÇÃO
       ===================================================== */

    async function aceitarContratacao() {

        if (
            estado.atualizandoStatus
        ) {

            return;
        }


        const confirmar =
            window.confirm(
                "Deseja aceitar esta contratação?"
            );


        if (!confirmar) {

            return;
        }


        await atualizarStatusContratacao(
            "confirmada"
        );
    }


    /* =====================================================
       RECUSAR CONTRATAÇÃO
       ===================================================== */

    async function recusarContratacao() {

        if (
            estado.atualizandoStatus
        ) {

            return;
        }


        const confirmar =
            window.confirm(
                "Deseja recusar esta solicitação de contratação?"
            );


        if (!confirmar) {

            return;
        }


        await atualizarStatusContratacao(
            "recusada"
        );
    }


    /* =====================================================
       SALVAR CONTRATAÇÃO LOCALMENTE
       ===================================================== */

    function salvarContratacaoLocal() {

        if (!estado.dados) {

            return;
        }


        try {

            sessionStorage.setItem(
                CONFIG.armazenamento.chave,
                JSON.stringify(
                    estado.dados
                )
            );

        } catch (erro) {

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: não foi possível atualizar o sessionStorage.",
                erro
            );
        }
    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        if (
            estado.eventosConfigurados
        ) {

            return;
        }


        const btnVoltar =
            obterElemento(
                "btnVoltar"
            );


        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                function () {

                    window.history.back();
                }
            );
        }


        const btnVoltarInicio =
            obterElemento(
                "btnVoltarInicio"
            );


        if (btnVoltarInicio) {

            btnVoltarInicio.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.inicio;
                }
            );
        }


        const btnAceitar =
            obterElemento(
                "btnAceitar"
            );


        if (btnAceitar) {

            btnAceitar.addEventListener(
                "click",
                aceitarContratacao
            );
        }


        const btnRecusar =
            obterElemento(
                "btnRecusar"
            );


        if (btnRecusar) {

            btnRecusar.addEventListener(
                "click",
                recusarContratacao
            );
        }


        /*
         * O botão principal possui duas funções:
         *
         * confirmada → simular evento
         *
         * evento → concluir contratação
         */

        const btnAcaoPrincipal =
            obterElemento(
                "btnConcluirContratacao"
            );


        if (btnAcaoPrincipal) {

            btnAcaoPrincipal.addEventListener(
                "click",
                processarAcaoPrincipal
            );
        }


        /*
         * Compatibilidade com HTML antigo.
         *
         * Caso ainda exista o botão "Liberar pagamento",
         * ele não cria um segundo fluxo.
         *
         * Ele simplesmente chama a conclusão atual.
         */

        const btnLiberarPagamento =
            obterElemento(
                "btnLiberarPagamento"
            );


        if (btnLiberarPagamento) {

            btnLiberarPagamento.addEventListener(
                "click",
                concluirContratacao
            );
        }


        estado.eventosConfigurados =
            true;
    }


    /* =====================================================
       ATUALIZAR ÍCONES LUCIDE
       ===================================================== */

    function atualizarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();
        }
    }


    /* =====================================================
       EXIBIR ESTADO DE ERRO
       ===================================================== */

    function renderizarErro(
        titulo,
        descricao
    ) {

        const status =
            obterElemento(
                "statusAtual"
            );


        const elementoDescricao =
            obterElemento(
                "statusDescricao"
            );


        if (status) {

            status.textContent =
                titulo;
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                descricao;
        }


        const card =
            obterElemento(
                "relacaoCard"
            );


        if (card) {

            card.hidden =
                true;
        }


        const acoes =
            obterElemento(
                "acoesSolicitacao"
            );


        if (acoes) {

            acoes.hidden =
                true;
        }


        const acoesConclusao =
            obterElemento(
                "acoesConclusao"
            );


        if (acoesConclusao) {

            acoesConclusao.hidden =
                true;
        }


        const pagamentoAcao =
            obterElemento(
                "pagamentoAcao"
            );


        if (pagamentoAcao) {

            pagamentoAcao.hidden =
                true;
        }
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        if (
            estado.inicializado
        ) {

            return;
        }


        if (
            estado.carregando
        ) {

            return;
        }


        estado.carregando =
            true;


        try {

            estado.usuarioId =
                await carregarUsuarioAtual();


            if (!estado.usuarioId) {

                console.error(
                    "MusicalWorldContratacaoAcompanhamento: usuário autenticado não encontrado."
                );


                renderizarErro(
                    "Usuário não identificado",
                    "Não foi possível identificar o usuário autenticado."
                );


                return;
            }


            const dados =
                await carregarContratacao();


            if (!dados) {

                console.error(
                    "MusicalWorldContratacaoAcompanhamento: contratação não encontrada ou acesso não permitido."
                );


                renderizarErro(
                    "Contratação não encontrada",
                    "Não foi possível localizar os dados desta contratação."
                );


                return;
            }


            const status =
                determinarStatus(
                    dados
                );


            estado.statusAtual =
                status;


            renderizarRelacao(
                dados
            );


            renderizarParticipante(
                dados
            );


            renderizarServico(
                dados.servico
            );


            renderizarEvento(
                dados
            );


            renderizarStatusPrincipal(
                status
            );


            atualizarTimeline(
                status
            );


            renderizarPagamento(
                dados.pagamento
            );


            renderizarAcaoLiberacaoPagamento(
                dados
            );


            renderizarAcoes(
                dados
            );


            renderizarAcoesConclusao(
                dados
            );


            configurarEventos();


            atualizarIcones();


            estado.inicializado =
                true;


            console.log(
                "MusicalWorldContratacaoAcompanhamento: módulo inicializado.",
                estado
            );

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao inicializar página.",
                erro
            );


            renderizarErro(
                "Não foi possível carregar a contratação",
                "Ocorreu um erro ao carregar os dados. Verifique sua conexão e tente novamente."
            );

        } finally {

            estado.carregando =
                false;
        }
    }


    /* =====================================================
       DETERMINAR STATUS
       ===================================================== */

    function determinarStatus(dados) {

        if (
            dados &&
            dados.status
        ) {

            return normalizarStatus(
                dados.status
            );
        }


        return "aguardando_artista";
    }


    /* =====================================================
       API PÚBLICA DO MÓDULO
       ===================================================== */

    window.MusicalWorldContratacaoAcompanhamento = {

        inicializar,


        obterEstado:
            function () {

                return estado;
            },


        atualizarStatus:
            async function (
                novoStatus
            ) {

                return atualizarStatusContratacao(
                    novoStatus
                );
            },


        simularEvento:
            async function () {

                return simularEventoRealizado();
            },


        concluir:
            async function () {

                return concluirContratacao();
            },


        /*
         * Mantido para compatibilidade com código antigo.
         *
         * No fluxo atual, a liberação acontece
         * automaticamente quando a conclusão é confirmada.
         */

        liberarPagamento:
            async function () {

                return concluirContratacao();
            },


        recarregar:
            async function () {

                estado.inicializado =
                    false;


                estado.dados =
                    null;


                estado.direcao =
                    null;


                estado.statusAtual =
                    "aguardando_artista";


                estado.simulandoEvento =
                    false;


                estado.concluindoContratacao =
                    false;


                estado.eventosConfigurados =
                    false;


                await inicializar();
            }
    };


    /* =====================================================
       INICIALIZAÇÃO DO DOM
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();
    }


})(window);