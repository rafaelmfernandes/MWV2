(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — ETAPA 6: PAGAMENTO

       Arquivo:
       js/contratacao/contratacao-pagamento.js

       Responsabilidades:
       ---------------------------------------------------------
       - Controlar o fluxo principal da etapa 6.
       - Recuperar o estado central.
       - Validar contratação existente.
       - Criar contratação normal no Supabase.
       - Criar notificação para o artista.
       - Salvar dados da contratação no estado central.
       - Delegar contratações de oportunidades ao módulo:
         contratacao-pagamento-oportunidade.js
       - Coordenar a interface através do módulo:
         contratacao-pagamento-ui.js
       - Encaminhar para a tela de sucesso.

       IMPORTANTE:
       ---------------------------------------------------------
       A interface da página está em:

       js/contratacao/contratacao-pagamento-ui.js

       A lógica de oportunidades está em:

       js/contratacao/contratacao-pagamento-oportunidade.js

       Este arquivo permanece como controlador principal.

       O estado central continua sendo a fonte de verdade.

       Não são armazenados número do cartão, CVV ou validade
       dentro do banco.
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        etapaAtual: 6,

        totalEtapas: 6,

        paginaAnterior:
            "contratacao-revisao.html",

        paginaSucesso:
            "contratacao-sucesso.html",

        paginaCancelar:
            "apresentar-perfil.html",

        moeda:
            "BRL",

        simboloMoeda:
            "R$",

        tabelaContratacoes:
            "contratacoes",

        tabelaNotificacoes:
            "notificacoes",

        tabelaUsuarios:
            "usuarios",

        statusContratacao:
            "aguardando_confirmacao",

        statusPagamento:
            "pago"

    };


    /* =========================================================
       ESTADO LOCAL

       IMPORTANTE:
       ---------------------------------------------------------
       O método de pagamento também é mantido pela interface.
       O controlador utiliza obterMetodoPagamentoAtual() para
       sempre sincronizar o valor antes de processar.
       ========================================================= */

    const UI = {

        metodoPagamento:
            "",

        processando:
            false,

        salvandoContratacao:
            false

    };


    /* =========================================================
       ESTADO CENTRAL
       ========================================================= */

    let estadoCentral =
        null;


    /* =========================================================
       MÓDULO DE INTERFACE
       ========================================================= */

    function obterModuloUI() {

        return (
            window.MusicalWorldContratacaoPagamentoUI ||
            null
        );

    }


    /* =========================================================
       OBTER MÉTODO DE PAGAMENTO ATUAL
       
       IMPORTANTE:
       ---------------------------------------------------------
       A interface possui o estado real da seleção de Pix/cartão.

       Antes, o controlador consultava somente:
       
       UI.metodoPagamento

       Isso criava dois estados independentes.

       Agora o controlador consulta primeiro a interface e
       sincroniza sua própria variável local.
       ========================================================= */

    function obterMetodoPagamentoAtual() {

        const moduloUI =
            obterModuloUI();


        if (
            moduloUI &&
            typeof moduloUI.obterMetodoPagamento ===
            "function"
        ) {

            const metodo =
                moduloUI.obterMetodoPagamento();


            if (
                metodo === "pix" ||
                metodo === "cartao"
            ) {

                UI.metodoPagamento =
                    metodo;


                return metodo;

            }

        }


        return UI.metodoPagamento;

    }


    /* =========================================================
       SINCRONIZAR ESTADO COM UI
       ========================================================= */

    function sincronizarEstadoComUI() {

        const moduloUI =
            obterModuloUI();


        if (!moduloUI) {

            return;

        }


        if (
            typeof moduloUI.definirEstado ===
            "function"
        ) {

            moduloUI.definirEstado(
                estadoCentral
            );

        }


        if (
            typeof moduloUI.definirProcessando ===
            "function"
        ) {

            moduloUI.definirProcessando(
                UI.processando
            );

        }


        if (
            typeof moduloUI.definirSalvandoContratacao ===
            "function"
        ) {

            moduloUI.definirSalvandoContratacao(
                UI.salvandoContratacao
            );

        }

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

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "ContratacaoEstado.js não foi encontrado."
            );

            return null;

        }


        try {

            if (
                typeof gerenciador.inicializar ===
                "function"
            ) {

                gerenciador.inicializar();

            }


            const estado =
                gerenciador.obter();


            if (!estado) {

                console.error(
                    "MusicalWorldContratacaoPagamento: " +
                    "estado central vazio."
                );

                return null;

            }


            return estado;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao obter estado central.",
                erro
            );

            return null;

        }

    }


    function salvarEstado(dados) {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "gerenciador do estado central indisponível."
            );

            return false;

        }


        try {

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


            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "nenhum método de persistência disponível."
            );


            return false;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao salvar estado central.",
                erro
            );

            return false;

        }

    }


    function definirEtapa(etapa) {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            return false;

        }


        try {

            if (
                typeof gerenciador.definirEtapa ===
                "function"
            ) {

                gerenciador.definirEtapa(
                    etapa
                );

                return true;

            }


            return salvarEstado({

                etapaAtual:
                    etapa

            });

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao definir etapa.",
                erro
            );

            return false;

        }

    }


    /* =========================================================
       SUPABASE
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
                    "MusicalWorldContratacaoPagamento: " +
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


        console.error(
            "MusicalWorldContratacaoPagamento: " +
            "cliente Supabase não encontrado."
        );


        return null;

    }


    /* =========================================================
       AUTENTICAÇÃO
       ========================================================= */

    async function obterUsuarioAutenticado() {

        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );

        }


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
       VALOR DO SERVIÇO
       ========================================================= */

    function obterValorServico(estado) {

        const moduloUI =
            obterModuloUI();


        if (
            moduloUI &&
            typeof moduloUI.obterValorServico ===
            "function"
        ) {

            return moduloUI.obterValorServico(
                estado
            );

        }


        if (
            !estado ||
            !estado.servico
        ) {

            return 0;

        }


        const valor =
            Number(
                estado.servico.valor
            );


        if (
            Number.isFinite(valor)
        ) {

            return valor;

        }


        const minimo =
            Number(
                estado.servico.valorMinimo
            );


        if (
            Number.isFinite(minimo)
        ) {

            return minimo;

        }


        return 0;

    }


    /* =========================================================
       SALVAR PAGAMENTO PARCIAL
       ========================================================= */

    function salvarPagamentoParcial(
        metodoPagamento
    ) {

        if (!estadoCentral) {

            return false;

        }


        const metodo =
            metodoPagamento !== undefined
                ? metodoPagamento
                : obterMetodoPagamentoAtual();


        const valor =
            obterValorServico(
                estadoCentral
            );


        const pagamentoAtual =
            estadoCentral.pagamento ||
            {};


        const sucesso =
            salvarEstado({

                pagamento: {

                    ...pagamentoAtual,

                    metodo:
                        metodo,

                    valor:
                        Number.isFinite(valor)
                            ? valor
                            : null,

                    status:
                        pagamentoAtual.status ||
                        "pendente",

                    idTransacao:
                        pagamentoAtual.idTransacao ||
                        null

                },

                etapaAtual:
                    CONFIG.etapaAtual

            });


        if (sucesso) {

            estadoCentral =
                obterEstado();


            sincronizarEstadoComUI();

        }


        return sucesso;

    }


    /* =========================================================
       VALIDAR CONTRATAÇÃO EXISTENTE
       ========================================================= */

    async function verificarContratacaoExistente() {

        const estado =
            estadoCentral ||
            obterEstado();


        if (!estado) {

            return null;

        }


        const contratacaoId =
            estado.contratacaoId ||
            estado.contratacao_id ||
            null;


        if (!contratacaoId) {

            return null;

        }


        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );

        }


        const usuario =
            await obterUsuarioAutenticado();


        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "validando contratacaoId existente no Supabase.",
            contratacaoId
        );


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaContratacoes
                )

                .select(
                    "id,contratante_id,contratado_id,status,status_pagamento,oportunidade_id"
                )

                .eq(
                    "id",
                    contratacaoId
                )

                .maybeSingle();


        if (resposta.error) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao validar contratação existente.",
                resposta.error
            );


            throw resposta.error;

        }


        if (!resposta.data) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "contratacaoId antigo não existe mais no Supabase. " +
                "O ID será descartado e uma nova contratação poderá ser criada.",
                contratacaoId
            );


            const limpouEstado =
                salvarEstado({

                    contratacaoId:
                        null,

                    contratacao_id:
                        null

                });


            if (!limpouEstado) {

                console.warn(
                    "MusicalWorldContratacaoPagamento: " +
                    "não foi possível limpar o contratacaoId antigo do estado central."
                );

            }


            estadoCentral =
                obterEstado();


            sincronizarEstadoComUI();


            return null;

        }


        const pertenceAoUsuario =
            String(
                resposta.data.contratante_id
            ) === String(
                usuario.id
            ) ||

            String(
                resposta.data.contratado_id
            ) === String(
                usuario.id
            );


        if (!pertenceAoUsuario) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "o contratacaoId existente não pertence ao usuário autenticado.",
                {
                    contratacaoId:
                        contratacaoId,

                    usuarioId:
                        usuario.id
                }
            );


            throw new Error(
                "A contratação existente não pertence ao usuário autenticado."
            );

        }


        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "contratação existente confirmada no banco.",
            resposta.data
        );


        return resposta.data;

    }


    /* =========================================================
       PREPARAR DADOS DA CONTRATAÇÃO NORMAL
       ========================================================= */

    function prepararDadosContratacao(
        estado,
        usuarioAtualId
    ) {

        if (!estado) {

            throw new Error(
                "Estado da contratação não encontrado."
            );

        }


        const artista =
            estado.artista ||
            {};


        const servico =
            estado.servico ||
            {};


        const evento =
            estado.evento ||
            {};


        const local =
            estado.local ||
            {};


        const contratadoId =
            artista.usuarioId ||
            artista.usuario_id ||
            artista.idUsuario ||
            artista.id_usuario ||
            null;


        if (!usuarioAtualId) {

            throw new Error(
                "Usuário contratante não identificado."
            );

        }


        if (!contratadoId) {

            throw new Error(
                "Usuário contratado não identificado no estado da contratação."
            );

        }


        if (
            String(usuarioAtualId) ===
            String(contratadoId)
        ) {

            throw new Error(
                "O contratante não pode contratar o próprio perfil."
            );

        }


        const servicoId =
            servico.id ||
            null;


        if (!servicoId) {

            throw new Error(
                "Serviço da contratação não identificado."
            );

        }


        const dataEvento =
            estado.dataEvento ||
            null;


        if (!dataEvento) {

            throw new Error(
                "Data do evento não identificada."
            );

        }


        const valor =
            obterValorServico(
                estado
            );


        if (
            !Number.isFinite(valor) ||
            valor < 0
        ) {

            throw new Error(
                "Valor da contratação inválido."
            );

        }


        const tipoEvento =
            evento.tipoEvento ||
            evento.tipo_evento ||
            null;


        const observacoes =
            evento.observacoes ||
            evento.observacao ||
            evento.descricao ||
            null;


        return {

            contratante_id:
                usuarioAtualId,

            contratado_id:
                contratadoId,

            servico_id:
                servicoId,

            data_evento:
                dataEvento,

            horario_inicio:
                estado.horarioInicio ||
                null,

            horario_fim:
                estado.horarioFim ||
                null,

            valor:
                valor,

            status:
                CONFIG.statusContratacao,

            metodo_pagamento:
                obterMetodoPagamentoAtual(),

            status_pagamento:
                CONFIG.statusPagamento,

            tipo_evento:
                tipoEvento,

            local:
                local,

            observacoes:
                observacoes

        };

    }


    /* =========================================================
       CRIAR CONTRATAÇÃO NORMAL
       ========================================================= */

    async function criarContratacaoNoSupabase(
        estado
    ) {

        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );

        }


        const contratacaoExistente =
            await verificarContratacaoExistente();


        if (contratacaoExistente) {

            console.log(
                "MusicalWorldContratacaoPagamento: " +
                "contratação existente confirmada. Nenhuma nova contratação será criada.",
                contratacaoExistente.id
            );


            return {

                id:
                    contratacaoExistente.id

            };

        }


        const usuario =
            await obterUsuarioAutenticado();


        const estadoAtual =
            obterEstado() ||
            estado;


        estadoCentral =
            estadoAtual;


        sincronizarEstadoComUI();


        const dados =
            prepararDadosContratacao(
                estadoAtual,
                usuario.id
            );


        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "dados preparados para public.contratacoes:",
            dados
        );


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaContratacoes
                )

                .insert(
                    dados
                )

                .select(
                    "id"
                )

                .single();


        if (resposta.error) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao criar contratação no Supabase.",
                resposta.error
            );


            throw resposta.error;

        }


        if (
            !resposta.data ||
            !resposta.data.id
        ) {

            throw new Error(
                "O Supabase não retornou o ID da contratação criada."
            );

        }


        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "contratação criada com sucesso.",
            resposta.data.id
        );


        return resposta.data;

    }


    /* =========================================================
       NOTIFICAÇÃO — NOVA SOLICITAÇÃO
       ========================================================= */

    async function criarNotificacaoNovaContratacao(
        contratacao,
        usuarioContratante
    ) {

        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "não foi possível criar a notificação porque o cliente Supabase não está disponível."
            );

            return false;

        }


        if (
            !contratacao ||
            !contratacao.id
        ) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "não foi possível criar notificação porque o ID da contratação não está disponível."
            );

            return false;

        }


        if (
            !usuarioContratante ||
            !usuarioContratante.id
        ) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "usuário contratante não identificado para criação da notificação."
            );

            return false;

        }


        const artista =
            estadoCentral &&
            estadoCentral.artista
                ? estadoCentral.artista
                : {};


        const artistaId =
            artista.usuarioId ||
            artista.usuario_id ||
            artista.idUsuario ||
            artista.id_usuario ||
            null;


        if (!artistaId) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "artista não identificado para criação da notificação."
            );

            return false;

        }


        let nomeContratante =
            "Alguém";


        try {

            const respostaUsuario =
                await supabase

                    .from(
                        CONFIG.tabelaUsuarios
                    )

                    .select(
                        "id,nome"
                    )

                    .eq(
                        "id",
                        usuarioContratante.id
                    )

                    .maybeSingle();


            if (
                !respostaUsuario.error &&
                respostaUsuario.data &&
                respostaUsuario.data.nome
            ) {

                nomeContratante =
                    String(
                        respostaUsuario.data.nome
                    ).trim() ||
                    "Alguém";

            } else if (
                respostaUsuario.error
            ) {

                console.warn(
                    "MusicalWorldContratacaoPagamento: " +
                    "não foi possível recuperar o nome do contratante. Será utilizado um nome genérico.",
                    respostaUsuario.error
                );

            }

        } catch (erro) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao buscar nome do contratante para a notificação.",
                erro
            );

        }


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelaNotificacoes
                )

                .insert({

                    usuario_id:
                        artistaId,

                    remetente_id:
                        usuarioContratante.id,

                    tipo:
                        "nova_contratacao",

                    titulo:
                        "Nova solicitação de contratação",

                    mensagem:
                        `${nomeContratante} enviou uma solicitação de contratação para você.`,

                    referencia_id:
                        contratacao.id,

                    referencia_tipo:
                        "contratacao",

                    lida:
                        false

                });


        if (resposta.error) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "contratação criada, mas a notificação da nova solicitação não pôde ser criada.",
                resposta.error
            );

            return false;

        }


        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "notificação de nova solicitação criada com sucesso.",
            {
                notificacaoTipo:
                    "nova_contratacao",

                usuarioId:
                    artistaId,

                remetenteId:
                    usuarioContratante.id,

                contratacaoId:
                    contratacao.id

            }
        );


        return true;

    }


    /* =========================================================
       SALVAR CONTRATAÇÃO NO ESTADO CENTRAL
       ========================================================= */

    function salvarContratacaoNoEstado(
        contratacaoId
    ) {

        if (!contratacaoId) {

            return false;

        }


        const pagamentoAtual =
            estadoCentral &&
            estadoCentral.pagamento
                ? estadoCentral.pagamento
                : {};


        const sucesso =
            salvarEstado({

                contratacaoId:
                    contratacaoId,

                contratacao_id:
                    contratacaoId,

                statusContratacao:
                    CONFIG.statusContratacao,

                pagamento: {

                    ...pagamentoAtual,

                    metodo:
                        obterMetodoPagamentoAtual(),

                    valor:
                        obterValorServico(
                            estadoCentral
                        ),

                    status:
                        CONFIG.statusPagamento,

                    idTransacao:
                        pagamentoAtual.idTransacao ||
                        gerarIdentificadorTemporario()

                },

                etapaAtual:
                    CONFIG.etapaAtual

            });


        if (sucesso) {

            estadoCentral =
                obterEstado();


            sincronizarEstadoComUI();

        }


        return sucesso;

    }


    /* =========================================================
       SIMULAÇÃO TEMPORÁRIA
       ========================================================= */

    function simularProcessamentoPagamento() {

        return new Promise(
            function (resolve) {

                setTimeout(
                    function () {

                        resolve();

                    },
                    900
                );

            }
        );

    }


    /* =========================================================
       IDENTIFICADOR TEMPORÁRIO
       ========================================================= */

    function gerarIdentificadorTemporario() {

        return (

            "TEMP-" +

            Date.now() +

            "-" +

            Math.random()
                .toString(36)
                .substring(
                    2,
                    8
                )
                .toUpperCase()

        );

    }


    /* =========================================================
       PROCESSAMENTO DO PAGAMENTO
       ========================================================= */

    async function processarPagamento() {

        if (
            UI.processando ||
            UI.salvandoContratacao
        ) {

            return;

        }


        /*
         * IMPORTANTE:
         * -----------------------------------------------------
         * Recupera o método diretamente da interface antes de
         * qualquer validação.
         *
         * Isso corrige o problema em que PIX/cartão aparecia
         * selecionado visualmente, mas o controlador principal
         * ainda possuía UI.metodoPagamento vazio.
         */

        const metodoPagamento =
            obterMetodoPagamentoAtual();


        if (!estadoCentral) {

            mostrarMensagemTemporaria(
                "Não foi possível recuperar a contratação."
            );

            return;

        }


        if (!estadoCentral.perfilId) {

            mostrarMensagemTemporaria(
                "O artista da contratação não foi identificado."
            );

            return;

        }


        if (
            !estadoCentral.artista ||
            !(
                estadoCentral.artista.usuarioId ||
                estadoCentral.artista.usuario_id
            )
        ) {

            mostrarMensagemTemporaria(
                "O usuário contratado não foi identificado."
            );


            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "estado.artista não contém usuarioId.",
                estadoCentral.artista
            );


            return;

        }


        if (
            !estadoCentral.servico ||
            !estadoCentral.servico.id
        ) {

            mostrarMensagemTemporaria(
                "O serviço da contratação não foi identificado."
            );

            return;

        }


        if (!estadoCentral.dataEvento) {

            mostrarMensagemTemporaria(
                "A data do evento não foi identificada."
            );

            return;

        }


        const moduloUI =
            obterModuloUI();


        if (
            !moduloUI ||
            typeof moduloUI.validarDadosCartao !==
            "function"
        ) {

            mostrarMensagemTemporaria(
                "A interface de pagamento não foi carregada."
            );

            return;

        }


        if (
            metodoPagamento !== "pix" &&
            metodoPagamento !== "cartao"
        ) {

            mostrarMensagemTemporaria(
                "Selecione uma forma de pagamento."
            );

            return;

        }


        if (
            metodoPagamento ===
            "cartao"
        ) {

            if (
                !moduloUI.validarDadosCartao()
            ) {

                return;

            }

        }


        UI.processando =
            true;


        UI.salvandoContratacao =
            true;


        sincronizarEstadoComUI();


        try {

            /* =================================================
               ETAPA 1
               Verificar contratação existente.
               ================================================= */

            const contratacaoExistente =
                await verificarContratacaoExistente();


            /*
             * Se a contratação já veio de uma oportunidade,
             * o processamento é totalmente delegado ao módulo
             * específico.
             */

            if (
                contratacaoExistente &&
                contratacaoExistente.oportunidade_id &&
                window.MusicalWorldContratacaoPagamentoOportunidade &&
                typeof
                    window.MusicalWorldContratacaoPagamentoOportunidade
                        .processarPagamento ===
                    "function"
            ) {

                console.log(
                    "MusicalWorldContratacaoPagamento: " +
                    "contratação de oportunidade identificada. " +
                    "Delegando processamento ao módulo de oportunidade.",
                    contratacaoExistente
                );


                await window
                    .MusicalWorldContratacaoPagamentoOportunidade
                    .processarPagamento({

                        contratacao:
                            contratacaoExistente,

                        estado:
                            estadoCentral,

                        metodoPagamento:
                            metodoPagamento,

                        obterValorServico:
                            obterValorServico,

                        obterEstado:
                            obterEstado,

                        salvarEstado:
                            salvarEstado,

                        simularProcessamentoPagamento:
                            simularProcessamentoPagamento

                    });


                estadoCentral =
                    obterEstado();


                sincronizarEstadoComUI();


                window.location.href =
                    CONFIG.paginaSucesso;


                return;

            }


            /*
             * Se existe uma contratação normal, não criamos
             * outra.
             */

            if (contratacaoExistente) {

                console.log(
                    "MusicalWorldContratacaoPagamento: " +
                    "contratação existente confirmada no banco.",
                    contratacaoExistente.id
                );


                window.location.href =
                    CONFIG.paginaSucesso;


                return;

            }


            /* =================================================
               ETAPA 2
               Marca pagamento como processando.
               ================================================= */

            const valor =
                obterValorServico(
                    estadoCentral
                );


            const pagamentoAnterior =
                estadoCentral.pagamento ||
                {};


            const salvoProcessando =
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
                            "processando",

                        idTransacao:
                            pagamentoAnterior.idTransacao ||
                            null

                    },

                    etapaAtual:
                        CONFIG.etapaAtual

                });


            if (!salvoProcessando) {

                throw new Error(
                    "Não foi possível salvar o pagamento no estado central."
                );

            }


            estadoCentral =
                obterEstado();


            sincronizarEstadoComUI();


            /* =================================================
               ETAPA 3
               Simula processamento.
               ================================================= */

            await simularProcessamentoPagamento();


            const estadoAtualizado =
                obterEstado();


            if (!estadoAtualizado) {

                throw new Error(
                    "Não foi possível recuperar o estado após o pagamento."
                );

            }


            estadoCentral =
                estadoAtualizado;


            sincronizarEstadoComUI();


            /* =================================================
               ETAPA 4
               Identificação temporária.
               ================================================= */

            const idTransacao =
                pagamentoAnterior.idTransacao ||
                gerarIdentificadorTemporario();


            /* =================================================
               ETAPA 5
               Registra pagamento como pago.
               ================================================= */

            const salvoPago =
                salvarEstado({

                    pagamento: {

                        ...(estadoCentral.pagamento || {}),

                        metodo:
                            metodoPagamento,

                        valor:
                            Number.isFinite(valor)
                                ? valor
                                : null,

                        status:
                            CONFIG.statusPagamento,

                        idTransacao:
                            idTransacao

                    },

                    etapaAtual:
                        CONFIG.etapaAtual

                });


            if (!salvoPago) {

                throw new Error(
                    "Não foi possível registrar o pagamento aprovado."
                );

            }


            estadoCentral =
                obterEstado();


            sincronizarEstadoComUI();


            /* =================================================
               ETAPA 6
               Cria contratação normal.
               ================================================= */

            console.log(
                "MusicalWorldContratacaoPagamento: " +
                "iniciando criação da contratação..."
            );


            const contratacao =
                await criarContratacaoNoSupabase(
                    estadoCentral
                );


            if (
                !contratacao ||
                !contratacao.id
            ) {

                throw new Error(
                    "A contratação não foi criada corretamente."
                );

            }


            /* =================================================
               ETAPA 7
               Cria notificação para o artista.
               ================================================= */

            try {

                const usuarioContratante =
                    await obterUsuarioAutenticado();


                await criarNotificacaoNovaContratacao(
                    contratacao,
                    usuarioContratante
                );

            } catch (erroNotificacao) {

                console.error(
                    "MusicalWorldContratacaoPagamento: " +
                    "a contratação foi criada, mas ocorreu um erro ao criar a notificação da nova solicitação.",
                    erroNotificacao
                );

            }


            /* =================================================
               ETAPA 8
               Salva ID no estado central.
               ================================================= */

            const salvouContratacao =
                salvarContratacaoNoEstado(
                    contratacao.id
                );


            if (!salvouContratacao) {

                console.warn(
                    "MusicalWorldContratacaoPagamento: " +
                    "contratação criada, mas não foi possível atualizar o estado central."
                );

            }


            /* =================================================
               ETAPA 9
               Finaliza fluxo.
               ================================================= */

            console.log(
                "MusicalWorldContratacaoPagamento: " +
                "fluxo concluído com sucesso.",
                {
                    contratacaoId:
                        contratacao.id,

                    status:
                        CONFIG.statusContratacao,

                    statusPagamento:
                        CONFIG.statusPagamento,

                    metodoPagamento:
                        metodoPagamento

                }
            );


            window.location.href =
                CONFIG.paginaSucesso;


        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao finalizar contratação.",
                erro
            );


            let mensagem =
                "Não foi possível finalizar a contratação. Tente novamente.";


            if (
                erro &&
                erro.message
            ) {

                const texto =
                    String(
                        erro.message
                    ).toLowerCase();


                if (
                    texto.includes(
                        "não autenticado"
                    ) ||
                    texto.includes(
                        "usuário não autenticado"
                    )
                ) {

                    mensagem =
                        "Sua sessão não está ativa. Faça login novamente.";

                } else if (
                    texto.includes(
                        "cliente supabase"
                    )
                ) {

                    mensagem =
                        "Não foi possível conectar ao sistema. Tente novamente.";

                } else if (
                    texto.includes(
                        "contratante"
                    ) ||
                    texto.includes(
                        "contratado"
                    ) ||
                    texto.includes(
                        "serviço"
                    ) ||
                    texto.includes(
                        "data do evento"
                    ) ||
                    texto.includes(
                        "proposta"
                    ) ||
                    texto.includes(
                        "pagamento"
                    )
                ) {

                    mensagem =
                        erro.message;

                }

            }


            mostrarMensagemTemporaria(
                mensagem
            );


        } finally {

            UI.processando =
                false;


            UI.salvandoContratacao =
                false;


            sincronizarEstadoComUI();

        }

    }


    /* =========================================================
       NAVEGAÇÃO — VOLTAR
       ========================================================= */

    function voltar() {

        if (UI.processando) {

            return;

        }


        const metodoPagamento =
            obterMetodoPagamentoAtual();


        if (
            metodoPagamento
        ) {

            salvarPagamentoParcial(
                metodoPagamento
            );

        }


        window.location.href =
            CONFIG.paginaAnterior;

    }


    /* =========================================================
       CANCELAR CONTRATAÇÃO
       ========================================================= */

    function cancelarContratacao() {

        if (UI.processando) {

            return;

        }


        const confirmar =
            window.confirm(
                "Deseja cancelar esta contratação? " +
                "Os dados preenchidos até agora serão descartados."
            );


        if (!confirmar) {

            return;

        }


        const gerenciador =
            obterGerenciadorEstado();


        let perfilId =
            null;


        /*
         * Captura o perfil antes de limpar o estado.
         */

        if (
            gerenciador &&
            typeof gerenciador.obter ===
            "function"
        ) {

            try {

                const dados =
                    gerenciador.obter();


                if (
                    dados &&
                    dados.perfilId
                ) {

                    perfilId =
                        dados.perfilId;

                }

            } catch (erro) {

                console.error(
                    "MusicalWorldContratacaoPagamento: " +
                    "erro ao recuperar perfilId antes do cancelamento.",
                    erro
                );

            }

        }


        /*
         * Uma contratação já criada não pode ser apagada
         * através desta tela.
         */

        const contratacaoId =
            estadoCentral &&
            (
                estadoCentral.contratacaoId ||
                estadoCentral.contratacao_id
            );


        if (contratacaoId) {

            mostrarMensagemTemporaria(
                "Esta contratação já foi enviada e não pode ser descartada por esta tela."
            );

            return;

        }


        /*
         * Limpa somente a contratação ainda não enviada.
         */

        if (gerenciador) {

            try {

                if (
                    typeof gerenciador.limpar ===
                    "function"
                ) {

                    gerenciador.limpar();

                }

            } catch (erro) {

                console.error(
                    "MusicalWorldContratacaoPagamento: " +
                    "erro ao limpar contratação.",
                    erro
                );

            }

        }


        if (perfilId) {

            window.location.href =
                CONFIG.paginaCancelar +
                "?id=" +
                encodeURIComponent(
                    perfilId
                );

            return;

        }


        window.location.href =
            CONFIG.paginaCancelar;

    }


    /* =========================================================
       CARREGAMENTO DO ESTADO CENTRAL
       ========================================================= */

    async function carregarEstadoCentral() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            throw new Error(
                "O estado central da contratação não está disponível."
            );

        }


        try {

            if (
                typeof gerenciador.inicializar ===
                "function"
            ) {

                gerenciador.inicializar();

            }


            estadoCentral =
                gerenciador.obter();


            if (!estadoCentral) {

                throw new Error(
                    "Não foi possível recuperar o estado da contratação."
                );

            }


            /*
             * O módulo de oportunidade assume o carregamento
             * quando existe contratacaoId na URL.
             */

            const moduloOportunidade =
                window.MusicalWorldContratacaoPagamentoOportunidade;


            if (
                moduloOportunidade &&
                typeof moduloOportunidade.carregarSeNecessario ===
                "function"
            ) {

                await moduloOportunidade
                    .carregarSeNecessario();


                estadoCentral =
                    obterEstado();

            } else if (
                moduloOportunidade &&
                typeof moduloOportunidade.possuiContratacaoNaURL ===
                "function" &&
                typeof moduloOportunidade.carregarDados ===
                "function" &&
                moduloOportunidade.possuiContratacaoNaURL()
            ) {

                /*
                 * Compatibilidade com a versão anterior
                 * do módulo de oportunidade.
                 */

                await moduloOportunidade
                    .carregarDados();


                estadoCentral =
                    obterEstado();

            }


            definirEtapa(
                CONFIG.etapaAtual
            );


            estadoCentral =
                obterEstado();


            sincronizarEstadoComUI();


            if (
                !estadoCentral.perfilId
            ) {

                console.warn(
                    "MusicalWorldContratacaoPagamento: " +
                    "perfilId não encontrado no estado central."
                );

            }


            if (
                !estadoCentral.servico ||
                !estadoCentral.servico.id
            ) {

                console.warn(
                    "MusicalWorldContratacaoPagamento: " +
                    "serviço não encontrado no estado central."
                );

            }


            if (
                !estadoCentral.artista
            ) {

                console.warn(
                    "MusicalWorldContratacaoPagamento: " +
                    "artista não encontrado no estado central."
                );

            }


            console.log(
                "MusicalWorldContratacaoPagamento: " +
                "estado central carregado.",
                estadoCentral
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao carregar estado central.",
                erro
            );


            throw erro;

        }

    }


    /* =========================================================
       MENSAGEM TEMPORÁRIA
       ========================================================= */

    function mostrarMensagemTemporaria(
        mensagem
    ) {

        const moduloUI =
            obterModuloUI();


        if (
            moduloUI &&
            typeof moduloUI.mostrarMensagemTemporaria ===
            "function"
        ) {

            moduloUI.mostrarMensagemTemporaria(
                mensagem
            );

            return;

        }


        console.warn(
            mensagem
        );

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    async function inicializar() {

        try {

            const moduloUI =
                obterModuloUI();


            if (!moduloUI) {

                throw new Error(
                    "O módulo de interface do pagamento não foi carregado."
                );

            }


            await carregarEstadoCentral();


            sincronizarEstadoComUI();


            moduloUI.renderizarArtista();


            moduloUI.renderizarServico();


            moduloUI.renderizarResumoPagamento();


            moduloUI.restaurarMetodoPagamento();


            /*
             * Depois de restaurar o método pela interface,
             * sincroniza novamente a variável do controlador.
             *
             * Isso garante que, caso o estado central já possua
             * "pix" ou "cartao", o controlador também conheça
             * essa seleção.
             */

            obterMetodoPagamentoAtual();


            moduloUI.configurarFormatacaoCartao();


            moduloUI.configurarEventosPagamento();


            moduloUI.atualizarBotaoContinuar();


            console.log(
                "MusicalWorldContratacaoPagamento: " +
                "Etapa 6 inicializada."
            );


        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao inicializar Etapa 6:",
                erro
            );

        }

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    const API = {

        inicializar,

        obterEstado:
            function () {

                return estadoCentral;

            },

        selecionarMetodoPagamento:
            function (metodo) {

                const moduloUI =
                    obterModuloUI();


                if (
                    moduloUI &&
                    typeof moduloUI.selecionarMetodoPagamento ===
                    "function"
                ) {

                    UI.metodoPagamento =
                        metodo;


                    moduloUI.selecionarMetodoPagamento(
                        metodo
                    );

                }

            },

        obterMetodoPagamento:
            obterMetodoPagamentoAtual,

        processarPagamento,

        voltar,

        cancelarContratacao,

        salvarPagamentoParcial,

        mostrarMensagemTemporaria,

        obterValorServico,

        obterSupabaseClient,

        obterUsuarioAutenticado,

        fecharModal:
            function () {

                const moduloUI =
                    obterModuloUI();


                if (
                    moduloUI &&
                    typeof moduloUI.fecharModal ===
                    "function"
                ) {

                    moduloUI.fecharModal();

                }

            },

        copiarPix:
            function () {

                const moduloUI =
                    obterModuloUI();


                if (
                    moduloUI &&
                    typeof moduloUI.copiarPix ===
                    "function"
                ) {

                    return moduloUI.copiarPix();

                }

            },

        validarDadosCartao:
            function () {

                const moduloUI =
                    obterModuloUI();


                if (
                    moduloUI &&
                    typeof moduloUI.validarDadosCartao ===
                    "function"
                ) {

                    return moduloUI.validarDadosCartao();

                }


                return false;

            }

    };


    window.MusicalWorldContratacaoPagamento =
        API;


    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ========================================================= */

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