/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO — FLUXO

   Arquivo:
   js/contratacao/acompanhamento/contratacao-acompanhamento-fluxo.js

   Responsabilidades:
   - Aceitar contratação.
   - Recusar contratação.
   - Atualizar status.
   - Criar automaticamente compromissos nas agendas do
     artista e do contratante quando uma contratação for
     confirmada.
   - Simular realização do evento.
   - Concluir contratação.
   - Liberar pagamento pelo fluxo atual.
   - Configurar eventos dos botões.

   FLUXO DE STATUS UTILIZADO PELO BANCO:

   aguardando_artista
          ↓
      confirmada
          ↓
     em_andamento
          ↓
       concluida

   AGENDA:

   aguardando_artista
          ↓
      confirmada
          ↓
   agenda_musicos

   IMPORTANTE:

   - A tabela contratacoes utiliza "em_andamento".
   - O banco NÃO utiliza "evento" como status válido.
   - Os UPDATEs não dependem de .select() imediatamente
     após a alteração.
   - Após cada UPDATE, o registro é consultado separadamente
     para confirmar o novo status.
   - A tabela contratacoes NÃO possui a coluna
     status_financeiro.
   - Uma contratação confirmada gera duas entradas
     automáticas na agenda_musicos:
       1. uma para o artista contratado;
       2. uma para o contratante.
   - As duas entradas compartilham o mesmo contratacao_id,
     mas possuem perfil_id diferentes.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       NAMESPACE INTERNO
       ===================================================== */

    const modulo =
        window.MusicalWorldContratacaoAcompanhamentoInterno;


    if (!modulo) {

        console.error(
            "MusicalWorldContratacaoAcompanhamento: módulo de dados não carregado."
        );

        return;
    }


    /* =====================================================
       DEPENDÊNCIAS DO MÓDULO DE DADOS
       ===================================================== */

    const {
        CONFIG,
        estado,
        obterElemento,
        obterSupabase,
        normalizarStatus,
        formatarLocal,
        pagamentoJaFoiLiberado,
        criarNotificacaoResultado,
        salvarContratacaoLocal
    } = modulo;


    /* =====================================================
       TABELA DA AGENDA

       A agenda automática é vinculada diretamente à
       contratação através da coluna contratacao_id.

       Uma mesma contratação pode possuir duas entradas:
       - uma para o perfil do artista;
       - uma para o perfil do contratante.
       ===================================================== */

    const TABELA_AGENDA =
        "agenda_musicos";


    /* =====================================================
       TIPOS ACEITOS PELA AGENDA

       A tabela agenda_musicos possui tipos próprios.
       Caso tipo_evento da contratação não corresponda
       a um deles, usamos "evento" como padrão seguro.
       ===================================================== */

    const TIPOS_AGENDA_PERMITIDOS = [

        "evento",

        "show",

        "apresentacao",

        "bloqueio",

        "disponibilidade"

    ];


    /* =====================================================
       DEPENDÊNCIA DO MÓDULO DE RENDERIZAÇÃO
       ===================================================== */

    const render =
        modulo.render;


    if (!render) {

        console.error(
            "MusicalWorldContratacaoAcompanhamento: módulo de renderização não carregado."
        );

        return;
    }


    /* =====================================================
       CONVERTER DATA + HORÁRIO PARA ISO

       A contratação salva:
       - data_evento: YYYY-MM-DD
       - horario_inicio: HH:MM:SS
       - horario_fim: HH:MM:SS

       A agenda utiliza timestamptz.

       O comportamento abaixo segue a mesma lógica usada
       pelo editor da agenda ao converter datetime-local
       para ISO.
       ===================================================== */

    function converterDataHoraParaISO(
        data,
        horario
    ) {

        if (!data) {

            return null;
        }


        const dataTexto =
            String(data)
                .trim();


        if (!dataTexto) {

            return null;
        }


        const horarioTexto =
            String(
                horario ||
                "00:00:00"
            )
                .trim();


        const valor =
            `${dataTexto}T${horarioTexto}`;


        const dataObjeto =
            new Date(
                valor
            );


        if (
            Number.isNaN(
                dataObjeto.getTime()
            )
        ) {

            console.warn(
                "MusicalWorldContratacaoAcompanhamento: não foi possível converter data/horário da contratação.",
                {
                    data,
                    horario
                }
            );

            return null;
        }


        return dataObjeto.toISOString();
    }


    /* =====================================================
       OBTER TIPO DA AGENDA

       O campo tipo_evento da contratação pode conter
       valores próprios do formulário de contratação,
       como "festa".

       A agenda possui uma lista diferente de tipos.
       Portanto, somente copiamos o valor quando ele
       realmente pertence aos tipos permitidos.
       ===================================================== */

    function obterTipoAgenda(
        tipoEvento
    ) {

        const tipo =
            String(
                tipoEvento ||
                ""
            )
                .trim()
                .toLowerCase();


        if (
            TIPOS_AGENDA_PERMITIDOS.includes(
                tipo
            )
        ) {

            return tipo;
        }


        return "evento";
    }


    /* =====================================================
       OBTER NOME DO SERVIÇO
       ===================================================== */

    function obterNomeServico() {

        return String(
            estado.dados?.servico?.nome ||
            estado.dados?.servico?.nome_servico ||
            ""
        )
            .trim();
    }


    /* =====================================================
       OBTER NOME DO ARTISTA
       ===================================================== */

    function obterNomeArtista() {

        return String(
            estado.dados?.artista?.nome ||
            estado.dados?.contratado?.nome ||
            ""
        )
            .trim();
    }


    /* =====================================================
       OBTER NOME DO CONTRATANTE
       ===================================================== */

    function obterNomeContratante() {

        return String(
            estado.dados?.contratante?.nome ||
            ""
        )
            .trim();
    }


    /* =====================================================
       OBTER TÍTULO DA AGENDA DO ARTISTA

       O artista verá a contratação como um compromisso
       profissional recebido.
       ===================================================== */

    function obterTituloAgendaArtista() {

        const nomeServico =
            obterNomeServico();


        if (nomeServico) {

            return `Contratação — ${nomeServico}`;
        }


        const nomeContratante =
            obterNomeContratante();


        if (nomeContratante) {

            return `Contratação — ${nomeContratante}`;
        }


        return "Contratação MusicalWorld";
    }


    /* =====================================================
       OBTER TÍTULO DA AGENDA DO CONTRATANTE

       O contratante verá a contratação como um compromisso
       com o profissional contratado.
       ===================================================== */

    function obterTituloAgendaContratante() {

        const nomeArtista =
            obterNomeArtista();


        if (nomeArtista) {

            return `Compromisso com ${nomeArtista}`;
        }


        const nomeServico =
            obterNomeServico();


        if (nomeServico) {

            return `Compromisso — ${nomeServico}`;
        }


        return "Compromisso MusicalWorld";
    }


    /* =====================================================
       OBTER DESCRIÇÃO DA AGENDA

       Mantemos as observações fornecidas pelo contratante,
       quando existirem.
       ===================================================== */

    function obterDescricaoAgenda() {

        return String(
            estado.dados?.observacoes ||
            ""
        )
            .trim() ||
            null;
    }


    /* =====================================================
       OBTER LOCALIZAÇÃO DA CONTRATAÇÃO
       ===================================================== */

    function obterLocalizacaoAgenda() {

        let localizacao =
            null;


        if (
            typeof formatarLocal ===
            "function"
        ) {

            localizacao =
                formatarLocal(
                    estado.dados?.local
                );
        }


        /*
         * Caso formatarLocal não retorne conteúdo,
         * preservamos uma representação simples do local.
         */

        if (
            !localizacao &&
            estado.dados?.local
        ) {

            if (
                typeof estado.dados.local ===
                "string"
            ) {

                localizacao =
                    estado.dados.local
                        .trim() ||
                    null;

            } else {

                try {

                    localizacao =
                        JSON.stringify(
                            estado.dados.local
                        );

                } catch {

                    localizacao =
                        null;
                }
            }
        }


        return localizacao;
    }


    /* =====================================================
       LOCALIZAR PERFIL PELO ID DO USUÁRIO

       Relação:

       usuarios.id
            ↓
       perfis.usuario_id
            ↓
       perfis.id

       O perfil encontrado será utilizado como
       agenda_musicos.perfil_id.
       ===================================================== */

    async function obterPerfilPorUsuario(
        supabase,
        usuarioId
    ) {

        const idUsuario =
            String(
                usuarioId ||
                ""
            )
                .trim();


        if (!idUsuario) {

            return null;
        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(
                    "id,usuario_id"
                )
                .eq(
                    "usuario_id",
                    idUsuario
                )
                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;
        }


        return resposta.data || null;
    }


    /* =====================================================
       CRIAR UMA ENTRADA INDIVIDUAL NA AGENDA

       Esta função trabalha com um único perfil.

       Assim conseguimos criar:

       1. agenda do artista;
       2. agenda do contratante.

       A verificação de duplicidade considera:

       contratacao_id + perfil_id

       Isso acompanha o índice criado no banco.
       ===================================================== */

    async function criarAgendaParaPerfil(
        supabase,
        perfilId,
        dadosAgenda
    ) {

        if (!perfilId) {

            return false;
        }


        if (!estado.contratacaoId) {

            return false;
        }


        /* =================================================
           VERIFICAR SE ESTA AGENDA JÁ EXISTE

           Importante:

           Não podemos mais procurar somente por
           contratacao_id porque agora uma contratação
           pode possuir duas agendas.

           A combinação correta é:

           contratacao_id + perfil_id
           ================================================= */

        const agendaExistente =
            await supabase
                .from(
                    TABELA_AGENDA
                )
                .select(
                    "id,perfil_id,contratacao_id"
                )
                .eq(
                    "contratacao_id",
                    estado.contratacaoId
                )
                .eq(
                    "perfil_id",
                    perfilId
                )
                .maybeSingle();


        if (agendaExistente.error) {

            throw agendaExistente.error;
        }


        if (agendaExistente.data) {

            console.log(
                "MusicalWorldContratacaoAcompanhamento: compromisso já existente para este perfil.",
                agendaExistente.data
            );


            return true;
        }


        /* =================================================
           CRIAR REGISTRO
           ================================================= */

        const novoEvento = {

            perfil_id:
                perfilId,

            contratacao_id:
                estado.contratacaoId,

            titulo:
                dadosAgenda.titulo,

            descricao:
                dadosAgenda.descricao,

            tipo:
                dadosAgenda.tipo,

            data_inicio:
                dadosAgenda.dataInicio,

            data_fim:
                dadosAgenda.dataFim,

            localizacao:
                dadosAgenda.localizacao,

            status:
                "confirmado",

            updated_at:
                new Date()
                    .toISOString()
        };


        console.log(
            "MusicalWorldContratacaoAcompanhamento: criando compromisso automático na agenda.",
            novoEvento
        );


        const insercao =
            await supabase
                .from(
                    TABELA_AGENDA
                )
                .insert(
                    novoEvento
                )
                .select(
                    "id,perfil_id,contratacao_id,data_inicio,data_fim,status"
                )
                .maybeSingle();


        if (insercao.error) {

            /*
             * O índice UNIQUE composto por:
             *
             * contratacao_id + perfil_id
             *
             * protege contra duplicidade em situações
             * de chamadas simultâneas.
             *
             * Se outra execução já criou a mesma entrada,
             * consideramos a operação concluída.
             */

            const codigoErro =
                insercao.error.code;


            if (
                codigoErro ===
                "23505"
            ) {

                console.log(
                    "MusicalWorldContratacaoAcompanhamento: a agenda deste perfil já havia sido criada para esta contratação."
                );


                return true;
            }


            throw insercao.error;
        }


        console.log(
            "MusicalWorldContratacaoAcompanhamento: compromisso criado na agenda com sucesso.",
            insercao.data
        );


        return true;
    }


    /* =====================================================
       CRIAR AGENDAS DA CONTRATAÇÃO

       Esta função é chamada somente depois que o banco
       confirmou que a contratação passou para "confirmada".

       A contratação gera dois compromissos:

       ┌──────────────────────────────────────────────┐
       │ CONTRATAÇÃO                                  │
       │ contratacao_id = X                           │
       └──────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       PERFIL ARTISTA        PERFIL CONTRATANTE
              │                     │
              ▼                     ▼
       Agenda do artista      Agenda do contratante

       Importante:
       - Não cria agenda para contratação pendente.
       - Não cria agenda para contratação recusada.
       - Não cria duplicidade.
       - A falha aqui NÃO cancela a contratação.
       ===================================================== */

    async function criarAgendasDaContratacao() {

        if (!estado.dados) {

            return false;
        }


        if (
            estado.dados.status !==
            "confirmada"
        ) {

            return false;
        }


        if (!estado.contratacaoId) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: não foi possível criar agendas porque o ID da contratação não foi encontrado."
            );

            return false;
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return false;
        }


        /* =================================================
           IDs DOS PARTICIPANTES

           contratado_id = artista
           contratante_id = pessoa que realizou a contratação
           ================================================= */

        const contratadoId =
            String(
                estado.dados.contratadoId ||
                ""
            )
                .trim();


        const contratanteId =
            String(
                estado.dados.contratanteId ||
                ""
            )
                .trim();


        if (!contratadoId) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: contratado_id não encontrado para criação da agenda."
            );

            return false;
        }


        if (!contratanteId) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: contratante_id não encontrado para criação da agenda."
            );

            return false;
        }


        try {

            /* =================================================
               LOCALIZAR OS DOIS PERFIS

               ARTISTA:

               contratacoes.contratado_id
                         ↓
               usuarios.id
                         ↓
               perfis.usuario_id
                         ↓
               perfis.id

               CONTRATANTE:

               contratacoes.contratante_id
                         ↓
               usuarios.id
                         ↓
               perfis.usuario_id
                         ↓
               perfis.id
               ================================================= */

            const perfilArtista =
                await obterPerfilPorUsuario(
                    supabase,
                    contratadoId
                );


            if (!perfilArtista) {

                throw new Error(
                    "O perfil do artista contratado não foi encontrado para criar o compromisso na agenda."
                );
            }


            const perfilContratante =
                await obterPerfilPorUsuario(
                    supabase,
                    contratanteId
                );


            if (!perfilContratante) {

                throw new Error(
                    "O perfil do contratante não foi encontrado para criar o compromisso na agenda."
                );
            }


            /* =================================================
               DATA E HORÁRIO
               ================================================= */

            const dataEvento =
                estado.dados.data;


            const horarioInicio =
                estado.dados.horarioInicio;


            const horarioFim =
                estado.dados.horarioFim;


            const dataInicio =
                converterDataHoraParaISO(
                    dataEvento,
                    horarioInicio
                );


            if (!dataInicio) {

                throw new Error(
                    "A data e o horário da contratação não puderam ser convertidos para a agenda."
                );
            }


            const dataFim =
                horarioFim
                    ? converterDataHoraParaISO(
                        dataEvento,
                        horarioFim
                    )
                    : null;


            /* =================================================
               LOCALIZAÇÃO
               ================================================= */

            const localizacao =
                obterLocalizacaoAgenda();


            /* =================================================
               TIPO
               ================================================= */

            const tipo =
                obterTipoAgenda(
                    estado.dados.tipoEvento
                );


            /* =================================================
               DESCRIÇÃO
               ================================================= */

            const descricao =
                obterDescricaoAgenda();


            /* =================================================
               DADOS BASE DO COMPROMISSO

               Data, horário, local e tipo são iguais para
               os dois participantes.
               ================================================= */

            const dadosBaseAgenda = {

                descricao:

                    descricao,

                tipo:

                    tipo,

                dataInicio:

                    dataInicio,

                dataFim:

                    dataFim,

                localizacao:

                    localizacao
            };


            /* =================================================
               CRIAR AGENDA DO ARTISTA
               ================================================= */

            const agendaArtista =
                await criarAgendaParaPerfil(
                    supabase,
                    perfilArtista.id,
                    {

                        ...dadosBaseAgenda,

                        titulo:
                            obterTituloAgendaArtista()
                    }
                );


            /* =================================================
               CRIAR AGENDA DO CONTRATANTE
               ================================================= */

            const agendaContratante =
                await criarAgendaParaPerfil(
                    supabase,
                    perfilContratante.id,
                    {

                        ...dadosBaseAgenda,

                        titulo:
                            obterTituloAgendaContratante()
                    }
                );


            /*
             * As duas operações precisam ter sido concluídas
             * para considerarmos a criação automática completa.
             */

            const agendasCriadas =
                agendaArtista &&
                agendaContratante;


            if (agendasCriadas) {

                console.log(
                    "MusicalWorldContratacaoAcompanhamento: compromissos criados nas agendas do artista e do contratante.",
                    {
                        contratacaoId:
                            estado.contratacaoId,

                        perfilArtista:
                            perfilArtista.id,

                        perfilContratante:
                            perfilContratante.id
                    }
                );

            } else {

                console.warn(
                    "MusicalWorldContratacaoAcompanhamento: contratação confirmada, mas uma ou mais agendas não foram criadas.",
                    {
                        contratacaoId:
                            estado.contratacaoId,

                        agendaArtista,

                        agendaContratante
                    }
                );
            }


            return agendasCriadas;

        } catch (erro) {

            /*
             * IMPORTANTE:
             *
             * A contratação já foi confirmada no banco antes
             * desta função ser chamada.
             *
             * Portanto, não lançamos novamente o erro para
             * impedir a aceitação da contratação.
             *
             * O problema fica registrado para investigação.
             */

            console.error(
                "MusicalWorldContratacaoAcompanhamento: contratação confirmada, mas não foi possível criar todos os compromissos nas agendas.",
                erro
            );


            return false;
        }
    }


    /* =====================================================
       SIMULAR EVENTO REALIZADO

       O banco utiliza:

       confirmada → em_andamento

       "evento" não é um status válido na tabela.
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
         * Somente o contratante pode registrar que o
         * evento está acontecendo.
         */

        if (
            estado.direcao !==
            "enviada"
        ) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: somente o contratante pode simular o evento."
            );

            return false;
        }


        /*
         * O evento somente pode ser registrado depois
         * que o artista aceitou a contratação.
         */

        if (
            estado.dados.status !==
            "confirmada"
        ) {

            if (
                estado.dados.status ===
                "em_andamento" ||

                estado.dados.status ===
                "concluida"
            ) {

                render.renderizarAcoesConclusao(
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
                "Simular que o evento está acontecendo? O pagamento ainda não será liberado nesta etapa."
            );


        if (!confirmar) {

            return false;
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return false;
        }


        if (!estado.contratacaoId) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: ID da contratação não encontrado."
            );

            return false;
        }


        if (!estado.usuarioId) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: usuário autenticado não encontrado."
            );

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


            render.atualizarIcones();
        }


        try {

            /*
             * statusBanco representa o valor bruto atualmente
             * salvo no banco.
             *
             * Para esta transição, esperamos "confirmada".
             */

            const statusAtualBanco =
                estado.dados.statusBanco ||
                "confirmada";


            console.log(
                "MusicalWorldContratacaoAcompanhamento: tentando registrar evento.",
                {
                    contratacaoId:
                        estado.contratacaoId,

                    usuarioId:
                        estado.usuarioId,

                    statusBanco:
                        statusAtualBanco,

                    novoStatus:
                        "em_andamento"
                }
            );


            /* =================================================
               ATUALIZAR CONTRATAÇÃO
               ================================================= */

            const resposta =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .update({

                        /*
                         * O banco possui "em_andamento".
                         *
                         * Não utilizar "evento", pois esse valor
                         * não faz parte da CHECK CONSTRAINT.
                         */

                        status:
                            "em_andamento",

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
                        statusAtualBanco
                    );


            if (resposta.error) {

                throw resposta.error;
            }


            /* =================================================
               VERIFICAR RESULTADO
               ================================================= */

            const verificacao =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .select(
                        "id,status,status_pagamento,updated_at"
                    )
                    .eq(
                        "id",
                        estado.contratacaoId
                    )
                    .maybeSingle();


            if (verificacao.error) {

                throw verificacao.error;
            }


            if (!verificacao.data) {

                throw new Error(
                    "A contratação foi alterada, mas não foi possível confirmar o novo status no banco."
                );
            }


            if (
                normalizarStatus(
                    verificacao.data.status
                ) !==
                "em_andamento"
            ) {

                throw new Error(
                    "A contratação foi localizada, mas o status não foi alterado para em_andamento."
                );
            }


            /* =================================================
               ATUALIZAR ESTADO LOCAL
               ================================================= */

            estado.dados.statusBanco =
                verificacao.data.status;


            estado.dados.status =
                "em_andamento";


            estado.dados.pagamento =
                estado.dados.pagamento ||
                {};


            /*
             * O evento ainda NÃO libera o pagamento.
             *
             * Portanto, mantemos exatamente o status de
             * pagamento que já estava salvo no banco.
             */

            if (
                Object.prototype.hasOwnProperty.call(
                    verificacao.data,
                    "status_pagamento"
                )
            ) {

                estado.dados.pagamento.status =
                    verificacao.data.status_pagamento;
            }


            estado.dados.updatedAt =
                verificacao.data.updated_at;


            estado.statusAtual =
                "em_andamento";


            /* =================================================
               ATUALIZAR INTERFACE
               ================================================= */

            render.renderizarRelacao(
                estado.dados
            );


            render.renderizarStatusPrincipal(
                estado.statusAtual
            );


            render.atualizarTimeline(
                estado.statusAtual
            );


            render.renderizarPagamento(
                estado.dados.pagamento
            );


            render.renderizarAcoes(
                estado.dados
            );


            render.renderizarAcoesConclusao(
                estado.dados
            );


            render.renderizarAcaoLiberacaoPagamento(
                estado.dados
            );


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
                verificacao.data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao simular evento.",
                erro
            );


            alert(
                erro?.message ||
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


                render.atualizarIcones();
            }


            return false;

        } finally {

            estado.simulandoEvento =
                false;


            if (
                estado.dados
            ) {

                render.renderizarAcoesConclusao(
                    estado.dados
                );
            }
        }
    }


    /* =====================================================
       CONCLUIR CONTRATAÇÃO

       Fluxo:

       em_andamento → concluida

       Neste momento o código mantém o comportamento
       financeiro já existente. A integração real com
       carteira/transação será tratada separadamente.
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
         * Somente o contratante pode confirmar a realização
         * do serviço.
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
         * A contratação precisa estar em andamento.
         */

        if (
            estado.dados.status !==
            "em_andamento"
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

                render.renderizarAcoesConclusao(
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
         * Evita tentar liberar novamente um pagamento que
         * já foi processado pelo fluxo atual.
         */

        if (
            pagamentoJaFoiLiberado()
        ) {

            alert(
                "Esta contratação já foi concluída e o pagamento já foi liberado."
            );


            render.renderizarAcoesConclusao(
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


        if (!estado.contratacaoId) {

            return false;
        }


        if (!estado.usuarioId) {

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


            render.atualizarIcones();
        }


        try {

            const statusAtualBanco =
                estado.dados.statusBanco ||
                "em_andamento";


            /* =================================================
               ATUALIZAR STATUS PARA CONCLUÍDA
               ================================================= */

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
                        statusAtualBanco
                    );


            if (resposta.error) {

                throw resposta.error;
            }


            /* =================================================
               VERIFICAR RESULTADO
               ================================================= */

            const verificacao =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .select(
                        "id,status,status_pagamento,updated_at"
                    )
                    .eq(
                        "id",
                        estado.contratacaoId
                    )
                    .maybeSingle();


            if (verificacao.error) {

                throw verificacao.error;
            }


            if (!verificacao.data) {

                throw new Error(
                    "A contratação foi atualizada, mas não foi possível confirmar a conclusão."
                );
            }


            if (
                normalizarStatus(
                    verificacao.data.status
                ) !==
                "concluida"
            ) {

                throw new Error(
                    "A contratação foi localizada, mas não chegou ao status concluida."
                );
            }


            /* =================================================
               ATUALIZAR ESTADO LOCAL
               ================================================= */

            estado.dados.statusBanco =
                verificacao.data.status;


            estado.dados.status =
                "concluida";


            estado.dados.pagamento =
                estado.dados.pagamento ||
                {};


            if (
                Object.prototype.hasOwnProperty.call(
                    verificacao.data,
                    "status_pagamento"
                )
            ) {

                estado.dados.pagamento.status =
                    verificacao.data.status_pagamento;
            }


            estado.dados.updatedAt =
                verificacao.data.updated_at;


            estado.statusAtual =
                "concluida";


            /* =================================================
               ATUALIZAR INTERFACE
               ================================================= */

            render.renderizarRelacao(
                estado.dados
            );


            render.renderizarStatusPrincipal(
                estado.statusAtual
            );


            render.atualizarTimeline(
                estado.statusAtual
            );


            render.renderizarPagamento(
                estado.dados.pagamento
            );


            render.renderizarAcoes(
                estado.dados
            );


            render.renderizarAcoesConclusao(
                estado.dados
            );


            render.renderizarAcaoLiberacaoPagamento(
                estado.dados
            );


            /*
             * A notificação é criada somente depois que
             * a contratação foi confirmada como concluída.
             */

            await criarNotificacaoResultado(
                "contratacao_concluida"
            );


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
                "MusicalWorldContratacaoAcompanhamento: contratação concluída.",
                verificacao.data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao concluir contratação.",
                erro
            );


            alert(
                erro?.message ||
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


                render.atualizarIcones();
            }


            return false;

        } finally {

            estado.concluindoContratacao =
                false;


            if (
                estado.dados
            ) {

                render.renderizarAcoesConclusao(
                    estado.dados
                );
            }
        }
    }


    /* =====================================================
       PROCESSAR AÇÃO PRINCIPAL

       confirmada    → simular evento
       em_andamento  → concluir contratação
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
            "em_andamento"
        ) {

            return concluirContratacao();
        }


        return false;
    }


    /* =====================================================
       ATUALIZAR STATUS DA CONTRATAÇÃO

       Utilizado pelo artista/contratado para:

       aguardando_artista → confirmada

       aguardando_artista → recusada
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

            const statusAtualBanco =
                estado.dados.statusBanco ||
                "aguardando_confirmacao";


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
                        statusAtualBanco
                    );


            if (resposta.error) {

                throw resposta.error;
            }


            const verificacao =
                await supabase
                    .from(
                        CONFIG.tabelas.contratacoes
                    )
                    .select(
                        "id,status,updated_at"
                    )
                    .eq(
                        "id",
                        estado.contratacaoId
                    )
                    .maybeSingle();


            if (verificacao.error) {

                throw verificacao.error;
            }


            if (!verificacao.data) {

                throw new Error(
                    "A contratação foi atualizada, mas não foi possível confirmar o novo status."
                );
            }


            if (
                normalizarStatus(
                    verificacao.data.status
                ) !==
                normalizarStatus(
                    novoStatus
                )
            ) {

                throw new Error(
                    "A contratação foi localizada, mas o novo status não foi confirmado."
                );
            }


            if (estado.dados) {

                estado.dados.status =
                    normalizarStatus(
                        verificacao.data.status
                    );


                estado.dados.statusBanco =
                    verificacao.data.status;


                estado.dados.updatedAt =
                    verificacao.data.updated_at;
            }


            estado.statusAtual =
                normalizarStatus(
                    verificacao.data.status
                );


            /* =================================================
               CRIAR AGENDAS SOMENTE APÓS CONFIRMAR NO BANCO

               A contratação já está oficialmente confirmada
               neste ponto.

               Serão criadas duas entradas:

               1. agenda do artista;
               2. agenda do contratante.

               Se a criação das agendas falhar, a contratação
               permanece confirmada.
               ================================================= */

            let agendasCriadas =
                true;


            if (
                novoStatus ===
                "confirmada"
            ) {

                agendasCriadas =
                    await criarAgendasDaContratacao();
            }


            render.renderizarRelacao(
                estado.dados
            );


            render.renderizarStatusPrincipal(
                estado.statusAtual
            );


            render.atualizarTimeline(
                estado.statusAtual
            );


            render.renderizarAcoes(
                estado.dados
            );


            render.renderizarPagamento(
                estado.dados.pagamento
            );


            render.renderizarAcaoLiberacaoPagamento(
                estado.dados
            );


            await criarNotificacaoResultado(
                novoStatus
            );


            salvarContratacaoLocal();


            /*
             * Se a contratação foi confirmada mas houve
             * problema somente na agenda, mostramos uma
             * informação específica sem tratar a aceitação
             * como erro.
             */

            if (
                novoStatus ===
                "confirmada" &&

                !agendasCriadas
            ) {

                const acoesStatus =
                    obterElemento(
                        "acoesStatus"
                    );


                if (acoesStatus) {

                    acoesStatus.hidden =
                        false;


                    acoesStatus.textContent =
                        "Contratação confirmada. Não foi possível registrar automaticamente todos os compromissos nas agendas.";
                }


                console.warn(
                    "MusicalWorldContratacaoAcompanhamento: contratação confirmada sem criação automática de todas as agendas."
                );
            }


            console.log(
                "MusicalWorldContratacaoAcompanhamento: status atualizado.",
                verificacao.data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoAcompanhamento: erro ao atualizar status da contratação.",
                erro
            );


            alert(
                erro?.message ||
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
       EXPOR API DE FLUXO
       ===================================================== */

    modulo.fluxo = {

        simularEvento:
            simularEventoRealizado,

        concluir:
            concluirContratacao,

        processarAcaoPrincipal,

        atualizarStatus:
            atualizarStatusContratacao,

        aceitar:
            aceitarContratacao,

        recusar:
            recusarContratacao,

        configurarEventos
    };


})(window);