/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO — FLUXO

   Arquivo:
   js/contratacao/acompanhamento/contratacao-acompanhamento-fluxo.js

   Responsabilidades:
   - Aceitar contratação.
   - Recusar contratação.
   - Atualizar status.
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

   Observação importante:
   - A tabela contratacoes utiliza "em_andamento".
   - O banco NÃO utiliza "evento" como status válido.
   - Os UPDATEs não dependem de .select() imediatamente
     após a alteração.
   - Após cada UPDATE, o registro é consultado separadamente
     para confirmar o novo status.
   - A tabela contratacoes NÃO possui a coluna
     status_financeiro.
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
        pagamentoJaFoiLiberado,
        criarNotificacaoResultado,
        salvarContratacaoLocal
    } = modulo;


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