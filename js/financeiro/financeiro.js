(function (window) {

    "use strict";


    /* =========================================================
       MUSICALWORLD — PÁGINA FINANCEIRO

       Arquivo:
       js/financeiro/financeiro.js

       Responsabilidades:
       - Carregar as contratações financeiras do usuário.
       - Identificar pagamentos realizados.
       - Identificar valores a receber.
       - Identificar valores já recebidos.
       - Calcular saldo disponível.
       - Exibir os quatro indicadores financeiros.
       - Exibir as movimentações.
       - Permitir filtros de pagamentos e recebimentos.

       FONTE FINANCEIRA ATUAL:

       A tabela "contratacoes" é a fonte principal.

       O Financeiro NÃO depende de:
       - servicos_artistas
       - carteiras_musicos
       - transacoes_carteira
       - Mercado Pago

       Essas integrações poderão ser adicionadas posteriormente.

       REGRAS:

       1. TOTAL PAGO
          Usuário é contratante_id e
          status_pagamento = pago.

       2. A RECEBER
          Usuário é contratado_id,
          status_pagamento = pago,
          contratação ainda não concluída/liberada.

       3. TOTAL RECEBIDO
          Usuário é contratado_id,
          contratação concluída/liberada.

       4. SALDO DISPONÍVEL
          Nesta fase:
          saldo disponível = total recebido.

       IMPORTANTE:

       O serviço não é necessário para calcular nenhum
       valor financeiro.

       Por isso, este arquivo não consulta
       "servicos_artistas".
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
    ========================================================= */

    const CONFIG = {

        tabelaContratacoes:
            "contratacoes",

        tabelaUsuarios:
            "usuarios",

        statusPagamentoPago:
            "pago",

        statusContratacaoConcluida: [

            "concluida",
            "concluido",
            "finalizada",
            "finalizado",
            "realizada",
            "realizado",
            "encerrada",
            "encerrado",
            "servico_concluido",
            "evento_concluido",
            "completed",
            "finished",
            "liberado",
            "liberada",
            "recebido"

        ],

        elementos: {

            lista:
                "financeiro-lista",

            saldoDisponivel:
                "financeiro-saldo-disponivel",

            aReceber:
                "financeiro-a-receber",

            totalRecebido:
                "financeiro-total-recebido",

            totalPago:
                "financeiro-total-pago"

        }

    };


    /* =========================================================
       ESTADO DA PÁGINA
    ========================================================= */

    const estado = {

        usuario:
            null,

        carregando:
            false,

        erro:
            null,

        filtroAtual:
            "todas",

        resumo: {

            saldoDisponivel:
                0,

            aReceber:
                0,

            totalRecebido:
                0,

            totalPago:
                0

        },

        movimentacoes:
            [],

        saques:
            []

    };


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    async function inicializar() {

        configurarEventosFiltros();

        estado.carregando =
            true;

        estado.erro =
            null;

        renderizarResumo();

        renderizarMovimentacoes();


        try {

            const supabase =
                obterClienteSupabase();


            if (!supabase) {

                throw new Error(
                    "Cliente Supabase não encontrado."
                );

            }


            const usuario =
                await obterUsuarioAtual(
                    supabase
                );


            if (!usuario) {

                throw new Error(
                    "Usuário não autenticado."
                );

            }


            estado.usuario =
                usuario;


            await carregarDadosFinanceiros(
                supabase
            );


        } catch (erro) {

            console.error(
                "MusicalWorldFinanceiro: erro ao inicializar.",
                erro
            );


            estado.erro =
                erro;


        } finally {

            /*
             * IMPORTANTE:
             *
             * O problema anterior acontecia porque a lista
             * era renderizada enquanto "carregando" ainda
             * estava como true.
             *
             * Agora primeiro encerramos o carregamento e
             * depois renderizamos novamente a interface.
             */

            estado.carregando =
                false;


            if (estado.erro) {

                renderizarErro();

            } else {

                renderizarResumo();

                renderizarMovimentacoes();

            }

        }

    }


    /* =========================================================
       CLIENTE SUPABASE
    ========================================================= */

    function obterClienteSupabase() {

        try {

            if (
                window.supabaseClient &&
                typeof window.supabaseClient.from ===
                    "function"
            ) {

                return window.supabaseClient;

            }


            if (
                window.MusicalWorldSupabase &&
                window.MusicalWorldSupabase.client &&
                typeof window.MusicalWorldSupabase.client.from ===
                    "function"
            ) {

                return window.MusicalWorldSupabase.client;

            }


            if (
                window.MusicalWorld &&
                window.MusicalWorld.supabase &&
                typeof window.MusicalWorld.supabase.from ===
                    "function"
            ) {

                return window.MusicalWorld.supabase;

            }


            if (
                window.MusicalWorldSupabase &&
                typeof window.MusicalWorldSupabase.obterCliente ===
                    "function"
            ) {

                const cliente =
                    window.MusicalWorldSupabase.obterCliente();


                if (
                    cliente &&
                    typeof cliente.from ===
                        "function"
                ) {

                    return cliente;

                }

            }


            if (
                window.MusicalWorld &&
                typeof window.MusicalWorld.obterSupabaseClient ===
                    "function"
            ) {

                const cliente =
                    window.MusicalWorld.obterSupabaseClient();


                if (
                    cliente &&
                    typeof cliente.from ===
                        "function"
                ) {

                    return cliente;

                }

            }

        } catch (erro) {

            console.error(
                "MusicalWorldFinanceiro: erro ao obter cliente Supabase.",
                erro
            );

        }


        return null;

    }


    /* =========================================================
       USUÁRIO AUTENTICADO
    ========================================================= */

    async function obterUsuarioAtual(
        supabase
    ) {

        const resultado =
            await supabase.auth.getUser();


        if (resultado.error) {

            throw resultado.error;

        }


        return (
            resultado.data &&
            resultado.data.user
        )
            ? resultado.data.user
            : null;

    }


    /* =========================================================
       CARREGAR DADOS FINANCEIROS
    ========================================================= */

    async function carregarDadosFinanceiros(
        supabase
    ) {

        resetarEstadoFinanceiro();


        /*
         * Busca as contratações nas quais o usuário
         * participa como contratante ou contratado.
         *
         * Não existe consulta a servicos_artistas.
         */

        const { data: contratacoes, error } =
            await supabase
                .from(
                    CONFIG.tabelaContratacoes
                )
                .select("*")
                .or(
                    "contratante_id.eq." +
                    estado.usuario.id +
                    ",contratado_id.eq." +
                    estado.usuario.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            throw error;

        }


        const listaContratacoes =
            Array.isArray(contratacoes)
                ? contratacoes
                : [];


        /*
         * Busca os usuários envolvidos apenas para
         * exibir o nome da contraparte.
         */

        const idsUsuarios =
            new Set();


        listaContratacoes.forEach(
            function (contratacao) {

                if (
                    contratacao.contratante_id
                ) {

                    idsUsuarios.add(
                        String(
                            contratacao.contratante_id
                        )
                    );

                }


                if (
                    contratacao.contratado_id
                ) {

                    idsUsuarios.add(
                        String(
                            contratacao.contratado_id
                        )
                    );

                }

            }
        );


        const mapaUsuarios =
            await buscarUsuariosPorIds(
                supabase,
                Array.from(
                    idsUsuarios
                )
            );


        /*
         * Processa todas as contratações.
         */

        listaContratacoes.forEach(
            function (contratacao) {

                processarContratacao(
                    contratacao,
                    mapaUsuarios
                );

            }
        );


        /*
         * Ordena da movimentação mais recente
         * para a mais antiga.
         */

        estado.movimentacoes.sort(
            function (a, b) {

                return (
                    obterTimestamp(
                        b.data
                    ) -
                    obterTimestamp(
                        a.data
                    )
                );

            }
        );


        /*
         * Nesta fase não existe saque real.
         *
         * Portanto tudo que já foi efetivamente recebido
         * permanece disponível.
         */

        estado.resumo.saldoDisponivel =
            estado.resumo.totalRecebido;

    }


    /* =========================================================
       RESET FINANCEIRO
    ========================================================= */

    function resetarEstadoFinanceiro() {

        estado.resumo = {

            saldoDisponivel:
                0,

            aReceber:
                0,

            totalRecebido:
                0,

            totalPago:
                0

        };


        estado.movimentacoes =
            [];

        estado.saques =
            [];

    }


    /* =========================================================
       BUSCAR USUÁRIOS
    ========================================================= */

    async function buscarUsuariosPorIds(
        supabase,
        ids
    ) {

        const mapa =
            new Map();


        if (
            !Array.isArray(ids) ||
            ids.length === 0
        ) {

            return mapa;

        }


        try {

            const { data, error } =
                await supabase
                    .from(
                        CONFIG.tabelaUsuarios
                    )
                    .select(
                        "id,nome,email"
                    )
                    .in(
                        "id",
                        ids
                    );


            if (error) {

                console.warn(
                    "MusicalWorldFinanceiro: não foi possível carregar usuários.",
                    error
                );


                return mapa;

            }


            (data || []).forEach(
                function (usuario) {

                    mapa.set(
                        String(
                            usuario.id
                        ),
                        usuario
                    );

                }
            );

        } catch (erro) {

            console.warn(
                "MusicalWorldFinanceiro: erro ao carregar usuários.",
                erro
            );

        }


        return mapa;

    }


    /* =========================================================
       PROCESSAR CONTRATAÇÃO
    ========================================================= */

    function processarContratacao(
        contratacao,
        mapaUsuarios
    ) {

        if (!contratacao) {

            return;

        }


        const usuarioId =
            String(
                estado.usuario.id
            );


        const contratanteId =
            contratacao.contratante_id !==
                null &&
            contratacao.contratante_id !==
                undefined
                ? String(
                    contratacao.contratante_id
                )
                : "";


        const contratadoId =
            contratacao.contratado_id !==
                null &&
            contratacao.contratado_id !==
                undefined
                ? String(
                    contratacao.contratado_id
                )
                : "";


        const souContratante =
            contratanteId ===
            usuarioId;


        const souContratado =
            contratadoId ===
            usuarioId;


        /*
         * Segurança:
         * ignora contratos que não pertencem ao usuário.
         */

        if (
            !souContratante &&
            !souContratado
        ) {

            return;

        }


        const valor =
            obterValorNumerico(
                contratacao.valor
            );


        /*
         * Contratação sem valor não entra
         * nos indicadores financeiros.
         */

        if (
            valor <= 0
        ) {

            return;

        }


        const statusPagamento =
            normalizarTexto(
                contratacao.status_pagamento
            );


        const pagamentoFoiPago =
            statusPagamento ===
            CONFIG.statusPagamentoPago;


        const dataMovimentacao =
            contratacao.data_evento ||
            contratacao.created_at ||
            null;


        /*
         * Identifica a contraparte.
         */

        const contraparteId =
            souContratante
                ? contratadoId
                : contratanteId;


        const usuarioContraparte =
            mapaUsuarios.get(
                String(
                    contraparteId
                )
            );


        const nomeContraparte =
            obterNomeUsuario(
                usuarioContraparte
            );


        const nomeServico =
            obterNomeServicoDaContratacao(
                contratacao
            );


        /* =====================================================
           USUÁRIO É O CONTRATANTE
        ===================================================== */

        if (souContratante) {

            const status =
                pagamentoFoiPago
                    ? "Pago"
                    : "Pagamento pendente";


            estado.movimentacoes.push({

                id:
                    "pagamento-" +
                    contratacao.id,

                tipo:
                    "pagamento",

                contratacaoId:
                    contratacao.id,

                valor:
                    valor,

                nome:
                    nomeContraparte,

                servico:
                    nomeServico,

                data:
                    dataMovimentacao,

                status:
                    status,

                pagamentoPago:
                    pagamentoFoiPago,

                contratacao:
                    contratacao

            });


            if (
                pagamentoFoiPago
            ) {

                estado.resumo.totalPago +=
                    valor;

            }

        }


        /* =====================================================
           USUÁRIO É O CONTRATADO
        ===================================================== */

        if (souContratado) {

            /*
             * O contratante ainda não pagou.
             */

            if (
                !pagamentoFoiPago
            ) {

                estado.movimentacoes.push({

                    id:
                        "recebimento-" +
                        contratacao.id,

                    tipo:
                        "recebimento",

                    contratacaoId:
                        contratacao.id,

                    valor:
                        valor,

                    nome:
                        nomeContraparte,

                    servico:
                        nomeServico,

                    data:
                        dataMovimentacao,

                    status:
                        "Aguardando pagamento",

                    pagamentoPago:
                        false,

                    contratacao:
                        contratacao

                });


                return;

            }


            /*
             * Pagamento realizado.
             *
             * Agora verificamos se já foi liberado.
             */

            const foiLiberado =
                contratacaoFoiConcluidaOuLiberada(
                    contratacao
                );


            if (
                foiLiberado
            ) {

                estado.movimentacoes.push({

                    id:
                        "recebimento-" +
                        contratacao.id,

                    tipo:
                        "recebimento",

                    contratacaoId:
                        contratacao.id,

                    valor:
                        valor,

                    nome:
                        nomeContraparte,

                    servico:
                        nomeServico,

                    data:
                        dataMovimentacao,

                    status:
                        "Recebido",

                    pagamentoPago:
                        true,

                    contratacao:
                        contratacao

                });


                estado.resumo.totalRecebido +=
                    valor;


                return;

            }


            /*
             * Pagamento já realizado, mas serviço ainda
             * não foi concluído/liberado.
             */

            estado.movimentacoes.push({

                id:
                    "recebimento-" +
                    contratacao.id,

                tipo:
                    "recebimento",

                contratacaoId:
                    contratacao.id,

                valor:
                    valor,

                nome:
                    nomeContraparte,

                servico:
                    nomeServico,

                data:
                    dataMovimentacao,

                status:
                    "A receber",

                pagamentoPago:
                    true,

                contratacao:
                    contratacao

            });


            estado.resumo.aReceber +=
                valor;

        }

    }


    /* =========================================================
       NOME DO SERVIÇO
    ========================================================= */

    function obterNomeServicoDaContratacao(
        contratacao
    ) {

        if (!contratacao) {

            return "Serviço contratado";

        }


        return (
            contratacao.servico_nome ||
            contratacao.nome_servico ||
            contratacao.servico ||
            contratacao.tipo_servico ||
            "Serviço contratado"
        );

    }


    /* =========================================================
       VERIFICAR CONCLUSÃO / LIBERAÇÃO
    ========================================================= */

    function contratacaoFoiConcluidaOuLiberada(
        contratacao
    ) {

        if (!contratacao) {

            return false;

        }


        const statusFinanceiro =
            normalizarTexto(
                contratacao.status_financeiro
            );


        const statusRepasse =
            normalizarTexto(
                contratacao.status_repasse
            );


        if (
            statusFinanceiro === "recebido" ||
            statusFinanceiro === "liberado" ||
            statusFinanceiro === "concluido" ||
            statusFinanceiro === "concluida"
        ) {

            return true;

        }


        if (
            statusRepasse === "pago" ||
            statusRepasse === "recebido" ||
            statusRepasse === "liberado" ||
            statusRepasse === "concluido" ||
            statusRepasse === "concluida"
        ) {

            return true;

        }


        const status =
            normalizarTexto(
                contratacao.status
            );


        return CONFIG
            .statusContratacaoConcluida
            .includes(
                status
            );

    }


    /* =========================================================
       FILTROS
    ========================================================= */

    function configurarEventosFiltros() {

        const filtros =
            document.querySelectorAll(
                "[data-financeiro-filtro]"
            );


        filtros.forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        const filtro =
                            botao.dataset
                                .financeiroFiltro;


                        if (!filtro) {

                            return;

                        }


                        estado.filtroAtual =
                            filtro;


                        atualizarEstadoFiltros();

                        renderizarMovimentacoes();

                    }
                );

            }
        );


        atualizarEstadoFiltros();

    }


    function atualizarEstadoFiltros() {

        const filtros =
            document.querySelectorAll(
                "[data-financeiro-filtro]"
            );


        filtros.forEach(
            function (botao) {

                const ativo =
                    botao.dataset
                        .financeiroFiltro ===
                    estado.filtroAtual;


                botao.classList.toggle(
                    "ativo",
                    ativo
                );


                botao.setAttribute(
                    "aria-selected",
                    ativo
                        ? "true"
                        : "false"
                );

            }
        );

    }


    /* =========================================================
       RENDERIZAR RESUMO
    ========================================================= */

    function renderizarResumo() {

        atualizarValorElemento(
            CONFIG.elementos.saldoDisponivel,
            estado.resumo.saldoDisponivel
        );


        atualizarValorElemento(
            CONFIG.elementos.aReceber,
            estado.resumo.aReceber
        );


        atualizarValorElemento(
            CONFIG.elementos.totalRecebido,
            estado.resumo.totalRecebido
        );


        atualizarValorElemento(
            CONFIG.elementos.totalPago,
            estado.resumo.totalPago
        );

    }


    /* =========================================================
       RENDERIZAR MOVIMENTAÇÕES
    ========================================================= */

    function renderizarMovimentacoes() {

        const container =
            document.getElementById(
                CONFIG.elementos.lista
            );


        if (!container) {

            console.warn(
                "MusicalWorldFinanceiro: elemento #financeiro-lista não encontrado."
            );

            return;

        }


        /*
         * Só mostramos carregamento enquanto a consulta
         * realmente está acontecendo.
         */

        if (
            estado.carregando
        ) {

            container.innerHTML =
                "";


            const carregando =
                criarEstadoVazio(
                    "Carregando movimentações..."
                );


            container.appendChild(
                carregando
            );


            return;

        }


        const movimentacoes =
            obterMovimentacoesFiltradas();


        if (
            movimentacoes.length === 0
        ) {

            container.innerHTML =
                "";


            const vazio =
                criarEstadoVazio(
                    obterMensagemVazia()
                );


            container.appendChild(
                vazio
            );


            return;

        }


        /*
         * Limpa o estado anterior antes de adicionar
         * as movimentações reais.
         */

        container.innerHTML =
            "";


        movimentacoes.forEach(
            function (movimentacao) {

                const card =
                    criarCardMovimentacao(
                        movimentacao
                    );


                container.appendChild(
                    card
                );

            }
        );

    }


    /* =========================================================
       MOVIMENTAÇÕES FILTRADAS
    ========================================================= */

    function obterMovimentacoesFiltradas() {

        switch (
            estado.filtroAtual
        ) {

            case "recebimentos":

                return estado.movimentacoes.filter(
                    function (movimentacao) {

                        return (
                            movimentacao.tipo ===
                            "recebimento"
                        );

                    }
                );


            case "pagamentos":

                return estado.movimentacoes.filter(
                    function (movimentacao) {

                        return (
                            movimentacao.tipo ===
                            "pagamento"
                        );

                    }
                );


            case "saques":

                return estado.saques.map(
                    function (saque) {

                        return {

                            id:
                                saque.id,

                            tipo:
                                "saque",

                            valor:
                                saque.valor,

                            nome:
                                "Saque",

                            servico:
                                "",

                            data:
                                saque.created_at,

                            status:
                                saque.status ||
                                "Processando"

                        };

                    }
                );


            case "todas":

            default:

                return estado.movimentacoes;

        }

    }


    /* =========================================================
       CRIAR CARD DE MOVIMENTAÇÃO
    ========================================================= */

    function criarCardMovimentacao(
        movimentacao
    ) {

        const card =
            document.createElement(
                "article"
            );


        const ehRecebimento =
            movimentacao.tipo ===
            "recebimento";


        card.className =
            "financeiro-movimentacao " +
            (
                ehRecebimento
                    ? "positivo"
                    : "negativo"
            );


        const sinal =
            ehRecebimento
                ? "+"
                : "-";


        const valor =
            formatarMoeda(
                movimentacao.valor
            );


        const data =
            formatarData(
                movimentacao.data
            );


        const titulo =
            ehRecebimento
                ? "Recebimento"
                : "Pagamento";


        const nome =
            escaparHTML(
                movimentacao.nome ||
                "Usuário"
            );


        const servico =
            escaparHTML(
                movimentacao.servico ||
                "Serviço contratado"
            );


        const status =
            escaparHTML(
                movimentacao.status ||
                ""
            );


        /*
         * A estrutura abaixo foi feita para ser compatível
         * com o CSS financeiro atual.
         */

        card.innerHTML = `

            <div class="financeiro-movimentacao-icone">

                ${
                    ehRecebimento

                        ? `
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 5v14"></path>
                                <path d="M5 12l7 7 7-7"></path>
                            </svg>
                          `

                        : `
                            <svg
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 19V5"></path>
                                <path d="M5 12l7-7 7 7"></path>
                            </svg>
                          `
                }

            </div>


            <div class="financeiro-movimentacao-conteudo">

                <strong>
                    ${titulo}
                </strong>


                <p>

                    ${
                        ehRecebimento
                            ? "Contratação por "
                            : "Contratação de "
                    }

                    ${nome}

                </p>


                <p>

                    Serviço:
                    ${servico}

                </p>


                <span class="financeiro-movimentacao-status">

                    ${status}

                </span>

            </div>


            <div class="financeiro-movimentacao-valor">

                <strong>

                    ${sinal}
                    ${valor}

                </strong>

            </div>

        `;


        return card;

    }


    /* =========================================================
       ESTADO VAZIO
    ========================================================= */

    function criarEstadoVazio(
        mensagem
    ) {

        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "financeiro-vazio";


        elemento.innerHTML = `

            <div class="financeiro-vazio-icone">

                <svg
                    viewBox="0 0 24 24"
                    width="23"
                    height="23"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="M12 2v20"></path>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>

            </div>


            <h3>
                ${escaparHTML(mensagem)}
            </h3>


            <p>
                Suas movimentações financeiras aparecerão aqui.
            </p>

        `;


        return elemento;

    }


    /* =========================================================
       MENSAGEM VAZIA
    ========================================================= */

    function obterMensagemVazia() {

        switch (
            estado.filtroAtual
        ) {

            case "recebimentos":

                return "Nenhum recebimento encontrado.";


            case "pagamentos":

                return "Nenhum pagamento encontrado.";


            case "saques":

                return "Nenhum saque realizado.";


            case "todas":

            default:

                return "Nenhuma movimentação financeira encontrada.";

        }

    }


    /* =========================================================
       RENDERIZAR ERRO
    ========================================================= */

    function renderizarErro() {

        const container =
            document.getElementById(
                CONFIG.elementos.lista
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "financeiro-vazio financeiro-erro";


        elemento.innerHTML = `

            <div class="financeiro-vazio-icone">

                <svg
                    viewBox="0 0 24 24"
                    width="23"
                    height="23"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                    ></circle>

                    <line
                        x1="12"
                        y1="8"
                        x2="12"
                        y2="12"
                    ></line>

                    <line
                        x1="12"
                        y1="16"
                        x2="12.01"
                        y2="16"
                    ></line>
                </svg>

            </div>


            <h3>
                Não foi possível carregar o financeiro.
            </h3>


            <p>
                ${escaparHTML(
                    estado.erro?.message ||
                    "Ocorreu um erro ao carregar os dados."
                )}
            </p>

        `;


        container.appendChild(
            elemento
        );

    }


    /* =========================================================
       ATUALIZAR VALOR
    ========================================================= */

    function atualizarValorElemento(
        id,
        valor
    ) {

        const elemento =
            document.getElementById(
                id
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =
            formatarMoeda(
                valor
            );

    }


    /* =========================================================
       FORMATAR MOEDA
    ========================================================= */

    function formatarMoeda(
        valor
    ) {

        const numero =
            obterValorNumerico(
                valor
            );


        return numero.toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );

    }


    /* =========================================================
       FORMATAR DATA
    ========================================================= */

    function formatarData(
        valor
    ) {

        if (!valor) {

            return "Data não informada";

        }


        const data =
            new Date(
                valor
            );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return "Data não informada";

        }


        return data.toLocaleDateString(
            "pt-BR",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        );

    }


    /* =========================================================
       TIMESTAMP
    ========================================================= */

    function obterTimestamp(
        valor
    ) {

        if (!valor) {

            return 0;

        }


        const timestamp =
            new Date(
                valor
            ).getTime();


        return Number.isNaN(
            timestamp
        )
            ? 0
            : timestamp;

    }


    /* =========================================================
       CONVERTER VALOR PARA NÚMERO
    ========================================================= */

    function obterValorNumerico(
        valor
    ) {

        if (
            typeof valor ===
            "number"
        ) {

            return Number.isFinite(
                valor
            )
                ? valor
                : 0;

        }


        if (
            typeof valor ===
            "string"
        ) {

            let texto =
                valor
                    .trim()
                    .replace(
                        "R$",
                        ""
                    )
                    .replace(
                        /\s/g,
                        ""
                    );


            if (
                texto.includes(",")
            ) {

                texto =
                    texto
                        .replace(
                            /\./g,
                            ""
                        )
                        .replace(
                            ",",
                            "."
                        );

            }


            const numero =
                Number(
                    texto
                );


            return Number.isFinite(
                numero
            )
                ? numero
                : 0;

        }


        return 0;

    }


    /* =========================================================
       NOME DO USUÁRIO
    ========================================================= */

    function obterNomeUsuario(
        usuario
    ) {

        if (!usuario) {

            return "Usuário";

        }


        return (
            usuario.nome ||
            usuario.email ||
            "Usuário"
        );

    }


    /* =========================================================
       NORMALIZAR TEXTO
    ========================================================= */

    function normalizarTexto(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(
            valor
        )
            .trim()
            .toLowerCase()
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /\s+/g,
                "_"
            );

    }


    /* =========================================================
       ESCAPAR HTML
    ========================================================= */

    function escaparHTML(
        valor
    ) {

        return String(
            valor ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    window.MusicalWorldFinanceiro = {

        inicializar:
            inicializar,


        recarregar:
            async function () {

                const supabase =
                    obterClienteSupabase();


                if (!supabase) {

                    throw new Error(
                        "Cliente Supabase não encontrado."
                    );

                }


                if (!estado.usuario) {

                    estado.usuario =
                        await obterUsuarioAtual(
                            supabase
                        );

                }


                estado.erro =
                    null;

                estado.carregando =
                    true;


                renderizarMovimentacoes();


                try {

                    await carregarDadosFinanceiros(
                        supabase
                    );

                } catch (erro) {

                    console.error(
                        "MusicalWorldFinanceiro: erro ao recarregar.",
                        erro
                    );


                    estado.erro =
                        erro;

                } finally {

                    /*
                     * Mesmo comportamento da inicialização:
                     * encerra o carregamento antes de renderizar.
                     */

                    estado.carregando =
                        false;


                    if (estado.erro) {

                        renderizarErro();

                    } else {

                        renderizarResumo();

                        renderizarMovimentacoes();

                    }

                }

            },


        obterEstado:
            function () {

                return {

                    usuario:
                        estado.usuario,

                    filtroAtual:
                        estado.filtroAtual,

                    resumo:
                        {
                            ...estado.resumo
                        },

                    movimentacoes:
                        [
                            ...estado.movimentacoes
                        ]

                };

            }

    };


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