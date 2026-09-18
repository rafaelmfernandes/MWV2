
/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO — DADOS

   Arquivo:
   js/contratacao/acompanhamento/contratacao-acompanhamento-dados.js

   Responsabilidades:
   - Configuração compartilhada do módulo.
   - Estado interno da contratação.
   - Cliente Supabase.
   - Usuário autenticado.
   - Recuperação do ID da contratação.
   - Carregamento da contratação.
   - Carregamento dos participantes.
   - Carregamento do serviço.
   - Normalização dos dados.
   - Formatação de dados.
   - Verificação de pagamento.
   - Criação de notificações.
   - sessionStorage.

   Este arquivo NÃO manipula diretamente a interface.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       NAMESPACE INTERNO
       ===================================================== */

    const modulo =
        window.MusicalWorldContratacaoAcompanhamentoInterno =
            window.MusicalWorldContratacaoAcompanhamentoInterno ||
            {};


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
       FORMATAR HORÁRIO
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
       EXTRAIR CIDADE
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
       OBTER INICIAIS
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
       CARREGAR USUÁRIO ATUAL
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
       NORMALIZAR STATUS

       Fluxo oficial utilizado pela tabela contratacoes:

       aguardando_artista
           ↓
       confirmada
           ↓
       em_andamento
           ↓
       concluida

       O status "evento" não é mais utilizado como estado
       interno porque não existe na constraint atual do banco.

       Caso algum registro antigo ainda contenha "evento",
       ele é convertido para "em_andamento" para manter
       compatibilidade com registros anteriores.
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
                "em_andamento",

            evento:
                "em_andamento",

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
       VERIFICAR PAGAMENTO LIBERADO

       Nesta etapa, "pago" significa que o pagamento foi
       realizado, mas ainda não necessariamente liberado
       ao profissional.

       A liberação efetiva deverá ser tratada pelo fluxo
       financeiro específico.
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
       EXPOR API DE DADOS
       ===================================================== */

    modulo.CONFIG =
        CONFIG;

    modulo.estado =
        estado;

    modulo.obterElemento =
        obterElemento;

    modulo.obterSupabase =
        obterSupabase;

    modulo.formatarMoeda =
        formatarMoeda;

    modulo.formatarData =
        formatarData;

    modulo.normalizarHorario =
        normalizarHorario;

    modulo.formatarHorario =
        formatarHorario;

    modulo.formatarLocal =
        formatarLocal;

    modulo.extrairCidade =
        extrairCidade;

    modulo.obterIniciais =
        obterIniciais;

    modulo.obterIdDaContratacao =
        obterIdDaContratacao;

    modulo.carregarUsuarioAtual =
        carregarUsuarioAtual;

    modulo.carregarPessoa =
        carregarPessoa;

    modulo.carregarServico =
        carregarServico;

    modulo.carregarContratacao =
        carregarContratacao;

    modulo.normalizarStatus =
        normalizarStatus;

    modulo.determinarStatus =
        determinarStatus;

    modulo.pagamentoJaFoiLiberado =
        pagamentoJaFoiLiberado;

    modulo.criarNotificacaoResultado =
        criarNotificacaoResultado;

    modulo.salvarContratacaoLocal =
        salvarContratacaoLocal;


})(window);

