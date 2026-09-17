/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO
   Arquivo: js/contratacao/contratacao-acompanhamento.js

   Responsabilidade:
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
   - Atualizar a contratação no Supabase.
   - Criar notificações para o contratante quando
     a solicitação for aceita ou recusada.
   - Manter compatibilidade com sessionStorage.
   - Evitar atualizações indevidas por usuários
     que não participam da contratação.

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


            pagamentoStatus:
                "pagamentoStatus",

            pagamentoDescricao:
                "pagamentoDescricao",


            observacoesEvento:
                "observacoesEvento",


            acoesSolicitacao:
                "acoesSolicitacao",

            btnAceitar:
                "btnAceitar",

            btnRecusar:
                "btnRecusar",


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


        /*
         * O campo local pode chegar como:
         * - objeto JSON;
         * - string JSON;
         * - texto simples.
         */

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

        /*
         * Primeiro tentamos o módulo central UsuarioAtual,
         * caso ele exista no projeto.
         */

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


        /*
         * Fallback direto para o Supabase Auth.
         */

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


        /*
         * Utilizamos somente colunas confirmadas da tabela
         * usuarios para evitar erros caso foto_url ou telefone
         * não existam nessa tabela.
         *
         * A foto do artista é carregada posteriormente de
         * perfis_artistas.foto_url.
         */

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


        /*
         * Perfil principal do usuário.
         */

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


        /*
         * Nem todo usuário necessariamente possui
         * perfil de artista.
         *
         * Por isso a busca só acontece quando existe
         * um perfil principal.
         */

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


        /*
         * A foto principal do artista vem de
         * perfis_artistas.foto_url.
         *
         * Mantemos avatar_url como fallback para
         * compatibilidade com estruturas antigas.
         */

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

            throw resposta.error;
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

            /*
             * O schema atual de servicos_artistas não possui
             * necessariamente area_atendimento/localizacao.
             *
             * Mantemos os dois como fallback para compatibilidade
             * com dados antigos/futuros.
             */

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


        /*
         * Recuperamos somente a contratação pelo ID.
         *
         * A autorização de visualização deve ser garantida
         * também pelas políticas RLS do Supabase.
         */

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


        /*
         * Verificação local adicional:
         * o usuário precisa participar da contratação.
         *
         * Ele pode ser:
         * - contratante;
         * - contratado.
         */

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


        /*
         * Se o usuário não participa da contratação,
         * não devemos carregar os dados das pessoas
         * relacionadas nem permitir qualquer ação.
         */

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


        /*
         * Carregamos os dois participantes e o serviço
         * em paralelo.
         */

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


            /*
             * Alias mantido para compatibilidade
             * com módulos anteriores.
             */

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


            /*
             * O schema atual de contratacoes não possui
             * horario_chegada.
             *
             * Mantemos o campo para compatibilidade
             * com versões futuras.
             */

            horarioChegada:
                null,


            local:
                registro.local,


            tipoEvento:
                registro.tipo_evento,


            /*
             * Estes campos não fazem parte do schema confirmado
             * atualmente, mas permanecem como fallback para
             * compatibilidade com versões futuras.
             */

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


            concluida:
                "concluida",


            "concluída":
                "concluida",


            cancelada:
                "cancelada",


            recusada:
                "recusada",


            pagamento_liberado:
                "pagamento"
        };


        return (
            mapa[valor] ||
            "aguardando_artista"
        );
    }


    /* =====================================================
       CRIAR NOTIFICAÇÃO DO RESULTADO DA CONTRATAÇÃO
       ===================================================== */

    async function criarNotificacaoResultado(
        novoStatus
    ) {

        /*
         * Esta função é executada depois que o artista
         * aceita ou recusa a solicitação.
         *
         * A notificação sempre será enviada para o
         * CONTRATANTE, porque foi ele quem iniciou
         * a solicitação.
         */

        const supabase =
            obterSupabase();


        if (!supabase) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: não foi possível criar notificação porque o cliente Supabase não está disponível."
            );


            return false;
        }


        if (!estado.dados) {

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: dados da contratação não disponíveis para criar notificação."
            );


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

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: dados insuficientes para criar notificação.",
                {
                    contratanteId,
                    artistaId,
                    contratacaoId
                }
            );


            return false;
        }


        /*
         * Segurança adicional:
         *
         * A função só deve ser chamada pelo artista que
         * recebeu a solicitação.
         */

        if (
            String(artistaId) !==
            String(estado.usuarioId)
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: usuário atual não corresponde ao artista da contratação."
            );


            return false;
        }


        let tipo =
            null;

        let titulo =
            null;

        let mensagem =
            null;


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

        } else {

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: status sem notificação configurada.",
                novoStatus
            );


            return false;
        }


        /*
         * Inserimos a notificação diretamente na tabela.
         *
         * usuario_id:
         *   recebe a notificação.
         *
         * remetente_id:
         *   artista que aceitou/recusou.
         *
         * referencia_id:
         *   contratação relacionada.
         *
         * referencia_tipo:
         *   permite que notificacoes.js saiba que a
         *   referência pertence a uma contratação.
         */

        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.notificacoes
                )
                .insert({

                    usuario_id:
                        contratanteId,

                    remetente_id:
                        artistaId,

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

            /*
             * IMPORTANTE:
             *
             * A contratação já foi atualizada neste ponto.
             *
             * Portanto não lançamos o erro novamente para
             * não informar ao usuário que a aceitação/recusa
             * falhou quando, na realidade, o status já foi
             * salvo no banco.
             *
             * O erro fica registrado no console para
             * identificarmos principalmente problemas de RLS.
             */

            console.error(
                "MusicalWorldContratacaoAcompanhamento: contratação atualizada, mas a notificação não pôde ser criada.",
                resposta.error
            );


            return false;
        }


        console.log(
            "MusicalWorldContratacaoAcompanhamento: notificação criada com sucesso.",
            {
                tipo,
                contratanteId,
                artistaId,
                contratacaoId
            }
        );


        return true;
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
         * FLUXO RECEBIDO
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

                descricao.textContent =
                    "Você recebeu uma solicitação de contratação e precisa analisar os detalhes do evento.";
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

                timelineTitulo.textContent =
                    "Aguardando sua resposta";
            }


            if (timelineDescricao) {

                timelineDescricao.textContent =
                    "Analise a solicitação e confirme ou recuse a contratação.";
            }


            return;
        }


        /*
         * FLUXO ENVIADO
         */

        if (titulo) {

            titulo.textContent =
                "Contratação enviada";
        }


        if (descricao) {

            descricao.textContent =
                "Você enviou esta solicitação para o profissional.";
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

            timelineTitulo.textContent =
                "Aguardando o artista";
        }


        if (timelineDescricao) {

            timelineDescricao.textContent =
                "O artista está analisando a solicitação.";
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
                    "Serviço não encontrado";
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

            } else {

                quantidade.textContent =
                    "Não informado";
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
                    "Evento em andamento",

                descricao:
                    "A contratação está em andamento conforme o combinado.",

                icone:
                    "music"
            },


            concluida: {

                titulo:
                    "Contratação concluída",

                descricao:
                    "O evento foi realizado e a contratação foi concluída.",

                icone:
                    "check-check"
            },


            pagamento: {

                titulo:
                    "Pagamento liberado",

                descricao:
                    "O fluxo foi concluído e o pagamento foi liberado ao profissional.",

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

                indiceAtual =
                    4;

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


                /*
                 * Estados finais de cancelamento/recusa.
                 */

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


                /*
                 * Etapas concluídas.
                 */

                if (
                    indice <
                    indiceAtual
                ) {

                    item.classList.add(
                        "concluido"
                    );


                    marker.innerHTML =
                        '<i data-lucide="check"></i>';


                    return;
                }


                /*
                 * Etapa atual.
                 */

                if (
                    indice ===
                    indiceAtual
                ) {

                    item.classList.add(
                        "ativo"
                    );


                    marker.innerHTML =
                        '<i data-lucide="clock-3"></i>';


                    return;
                }


                /*
                 * Etapas futuras.
                 */

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
            ).toLowerCase();


        const metodo =
            String(
                pagamento?.metodo ||
                ""
            ).toLowerCase();


        /*
         * Pagamento processado/pago.
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
                    metodo ===
                    "pix"
                ) {

                    elementoDescricao.textContent =
                        "O pagamento via Pix foi associado à contratação. A liberação ao profissional seguirá o fluxo da plataforma.";

                } else {

                    elementoDescricao.textContent =
                        "O pagamento está associado à contratação e seguirá o fluxo definido pela plataforma.";
                }
            }


            return;
        }


        /*
         * Pagamento ainda sem atualização final.
         */

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
       RENDERIZAR AÇÕES DA SOLICITAÇÃO
       ===================================================== */

    function renderizarAcoes(dados) {

        const container =
            obterElemento(
                "acoesSolicitacao"
            );


        if (!container) {

            return;
        }


        /*
         * Somente o contratado pode aceitar ou recusar.
         *
         * E somente enquanto a contratação estiver
         * aguardando resposta.
         */

        const deveExibir =
            dados &&
            dados.direcao === "recebida" &&
            dados.status === "aguardando_artista";


        container.hidden =
            !deveExibir;
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


        /*
         * Somente o usuário que recebeu a solicitação
         * pode aceitar ou recusar.
         */

        if (
            estado.direcao !==
            "recebida"
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: usuário não pode alterar o status desta contratação."
            );


            return false;
        }


        /*
         * Por segurança, aceitamos somente estes dois
         * estados através dos botões desta página.
         */

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


        /*
         * A ação só pode acontecer enquanto a solicitação
         * estiver aguardando resposta.
         */

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

            console.error(
                "MusicalWorldContratacaoAcompanhamento: contratação sem ID."
            );


            return false;
        }


        if (!estado.usuarioId) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: usuário autenticado não encontrado."
            );


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

            /*
             * O UPDATE é restringido por:
             *
             * 1. ID da contratação;
             * 2. contratado_id do usuário atual.
             *
             * Isso impede que o contratante altere diretamente
             * uma solicitação recebida.
             */

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
                    .select(
                        "id,status,updated_at"
                    )
                    .maybeSingle();


            if (resposta.error) {

                throw resposta.error;
            }


            /*
             * Se o UPDATE não retornou uma linha,
             * provavelmente a política RLS impediu a alteração
             * ou a contratação mudou de estado antes da ação.
             */

            if (!resposta.data) {

                throw new Error(
                    "A contratação não pôde ser atualizada. Verifique as permissões ou se o status já foi alterado."
                );
            }


            /*
             * Atualiza o estado local.
             */

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


            /*
             * Atualiza a interface imediatamente.
             */

            renderizarStatusPrincipal(
                estado.statusAtual
            );


            atualizarTimeline(
                estado.statusAtual
            );


            renderizarAcoes(
                estado.dados
            );


            /*
             * =================================================
             * NOVO:
             * CRIAR NOTIFICAÇÃO PARA O CONTRATANTE
             * =================================================
             *
             * A contratação já foi salva com sucesso.
             *
             * Agora criamos uma notificação persistente para
             * o usuário que enviou a solicitação.
             *
             * Se a notificação falhar, não desfazemos a
             * alteração da contratação.
             */

            await criarNotificacaoResultado(
                novoStatus
            );


            /*
             * Atualiza o armazenamento local para que
             * outras telas que dependam dele recebam
             * o novo estado.
             */

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


            /*
             * Os botões voltam a ser habilitados somente
             * se a contratação ainda estiver aguardando
             * resposta.
             */

            const podeAgir =
                estado.direcao === "recebida" &&
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

        /*
         * Evita registrar os mesmos listeners novamente
         * quando a API recarregar() for utilizada.
         */

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

            /*
             * Primeiro identificamos o usuário autenticado.
             */

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


            /*
             * Depois carregamos a contratação.
             */

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


            /*
             * Determina o status final usado pela interface.
             */

            const status =
                determinarStatus(
                    dados
                );


            estado.statusAtual =
                status;


            /*
             * Renderização completa da página.
             */

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


            renderizarAcoes(
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


        recarregar:
            async function () {

                /*
                 * O estado de eventos não é resetado.
                 * Assim, os listeners não são duplicados.
                 */

                estado.inicializado =
                    false;


                estado.dados =
                    null;


                estado.direcao =
                    null;


                estado.statusAtual =
                    "aguardando_artista";


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