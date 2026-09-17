/* =========================================================
   MUSICALWORLD — FINANCEIRO

   Arquivo:
   js/financeiro/financeiro.js

   Responsabilidades:
   - Inicializar a página Financeiro.
   - Identificar o usuário autenticado.
   - Consultar as contratações relacionadas ao usuário.
   - Identificar pagamentos realizados pelo usuário.
   - Identificar valores a receber pelo usuário.
   - Identificar valores efetivamente recebidos.
   - Calcular o resumo financeiro.
   - Renderizar movimentações.
   - Controlar filtros.
   - Controlar ações básicas da página.
   - Manter a estrutura preparada para a futura
     integração com pagamentos reais.

   IMPORTANTE:

   Nesta etapa o pagamento da contratação ainda é simulado.

   A tabela "contratacoes" é utilizada como fonte dos
   movimentos financeiros relacionados às contratações.

   O mesmo usuário pode ser:

   - contratante;
   - contratado;
   - pagador;
   - prestador;
   - possuir valores a receber;
   - possuir valores já recebidos.

   Portanto, o Financeiro NÃO utiliza o tipo de perfil
   para determinar sua situação financeira.

   A posição financeira é determinada pelos registros
   existentes na tabela:

   contratacoes

   Estrutura conceitual:

   contratacoes
       |
       +-- contratante_id
       |
       +-- contratado_id
       |
       +-- servico_id
       |
       +-- valor
       |
       +-- status
       |
       +-- status_pagamento
       |
       +-- data_evento
       |
       v
   Financeiro

========================================================= */


(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        tabelaContratacoes:
            "contratacoes",

        tabelaUsuarios:
            "usuarios",

        tabelaServicos:
            "servicos_artistas",

        statusPagamentoPago:
            "pago",

        statusContratacaoConcluida: [
            "concluida",
            "concluído",
            "concluido",
            "finalizada",
            "finalizado",
            "encerrada",
            "encerrado"
        ],

        elementos: {

            lista:
                "#financeiro-lista",

            saldoDisponivel:
                "#financeiro-saldo-disponivel",

            aReceber:
                "#financeiro-a-receber",

            totalRecebido:
                "#financeiro-total-recebido",

            totalPago:
                "#financeiro-total-pago"

        }

    };


    /* =====================================================
       CONTROLADOR PRINCIPAL
    ===================================================== */

    const MusicalWorldFinanceiro = {


        /* =================================================
           ESTADO DA PÁGINA
        ================================================= */

        estado: {

            usuario: null,

            filtroAtual:
                "todas",

            carregando:
                false,

            erro:
                null,

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

        },


        /* =================================================
           INICIALIZAÇÃO
        ================================================= */

        async inicializar() {

            try {

                console.log(
                    "MusicalWorldFinanceiro: inicializando página."
                );


                /*
                 * Configura os eventos da interface
                 * antes de carregar os dados.
                 */

                this.configurarEventos();


                /*
                 * Identifica o usuário autenticado.
                 */

                const usuario =
                    await this.obterUsuarioAtual();


                if (!usuario) {

                    console.warn(
                        "MusicalWorldFinanceiro: nenhum usuário autenticado."
                    );


                    this.renderizarResumo();

                    this.renderizarMovimentacoes();

                    return;

                }


                /*
                 * Carrega as contratações relacionadas
                 * ao usuário.
                 */

                await this.carregarDadosFinanceiros();


                /*
                 * Renderiza os dados carregados.
                 */

                this.renderizarResumo();

                this.renderizarMovimentacoes();


                console.log(
                    "MusicalWorldFinanceiro: página inicializada com sucesso."
                );


            } catch (erro) {

                console.error(
                    "MusicalWorldFinanceiro: erro ao inicializar página.",
                    erro
                );


                this.estado.erro =
                    erro;


                this.renderizarResumo();

                this.renderizarErro();

            }

        },


        /* =================================================
           CONFIGURAÇÃO DOS EVENTOS
        ================================================= */

        configurarEventos() {

            /* =============================================
               BOTÃO VOLTAR
            ============================================== */

            const botaoVoltar =
                document.querySelector(
                    ".financeiro-voltar"
                );


            if (botaoVoltar) {

                botaoVoltar.addEventListener(
                    "click",
                    () => {

                        this.voltar();

                    }
                );

            }


            /* =============================================
               BOTÃO SOLICITAR SAQUE
            ============================================== */

            const botaoSolicitarSaque =
                document.querySelector(
                    "#btn-solicitar-saque"
                );


            if (botaoSolicitarSaque) {

                botaoSolicitarSaque.addEventListener(
                    "click",
                    () => {

                        this.solicitarSaque();

                    }
                );

            }


            /* =============================================
               BOTÃO VER SAQUES
            ============================================== */

            const botaoVerSaques =
                document.querySelector(
                    "#btn-ver-saques"
                );


            if (botaoVerSaques) {

                botaoVerSaques.addEventListener(
                    "click",
                    () => {

                        this.verSaques();

                    }
                );

            }


            /* =============================================
               FILTROS
            ============================================== */

            const filtros =
                document.querySelectorAll(
                    ".financeiro-filtro"
                );


            filtros.forEach(
                (filtro) => {

                    filtro.addEventListener(
                        "click",
                        () => {

                            const tipo =
                                filtro.dataset.filtro ||
                                "todas";


                            this.aplicarFiltro(
                                tipo
                            );

                        }
                    );

                }
            );


            /*
             * Estado visual inicial dos filtros.
             */

            this.atualizarVisualDosFiltros();

        },


        /* =================================================
           OBTER USUÁRIO ATUAL
        ================================================= */

        async obterUsuarioAtual() {

            const supabase =
                this.obterClienteSupabase();


            if (!supabase) {

                console.warn(
                    "MusicalWorldFinanceiro: cliente Supabase não encontrado."
                );


                return null;

            }


            try {

                const resultado =
                    await supabase.auth.getUser();


                if (
                    resultado &&
                    resultado.data &&
                    resultado.data.user
                ) {

                    this.estado.usuario =
                        resultado.data.user;


                    console.log(
                        "MusicalWorldFinanceiro: usuário autenticado encontrado.",
                        this.estado.usuario.id
                    );


                    return this.estado.usuario;

                }


                console.warn(
                    "MusicalWorldFinanceiro: nenhum usuário autenticado."
                );


                return null;


            } catch (erro) {

                console.error(
                    "MusicalWorldFinanceiro: erro ao obter usuário.",
                    erro
                );


                return null;

            }

        },


        /* =================================================
           OBTER CLIENTE SUPABASE
        ================================================= */

        obterClienteSupabase() {

            /*
             * Cliente compartilhado principal.
             */

            if (
                window.supabaseClient &&
                typeof window.supabaseClient.auth ===
                    "object"
            ) {

                return window.supabaseClient;

            }


            /*
             * Cliente exposto pelo núcleo
             * MusicalWorldSupabase.
             */

            if (
                window.MusicalWorldSupabase &&
                window.MusicalWorldSupabase.client
            ) {

                return window.MusicalWorldSupabase.client;

            }


            /*
             * Compatibilidade com possíveis versões
             * anteriores do núcleo.
             */

            if (
                window.MusicalWorld &&
                window.MusicalWorld.supabase
            ) {

                return window.MusicalWorld.supabase;

            }


            /*
             * Cliente obtido por função.
             */

            if (
                window.MusicalWorldSupabase &&
                typeof window.MusicalWorldSupabase
                    .obterCliente === "function"
            ) {

                return window.MusicalWorldSupabase
                    .obterCliente();

            }


            if (
                window.MusicalWorld &&
                typeof window.MusicalWorld
                    .obterSupabaseClient === "function"
            ) {

                return window.MusicalWorld
                    .obterSupabaseClient();

            }


            return null;

        },


        /* =================================================
           CARREGAR DADOS FINANCEIROS
        ================================================= */

        async carregarDadosFinanceiros() {

            const supabase =
                this.obterClienteSupabase();


            if (!supabase) {

                throw new Error(
                    "Cliente Supabase não disponível."
                );

            }


            const usuarioId =
                this.estado.usuario &&
                this.estado.usuario.id;


            if (!usuarioId) {

                throw new Error(
                    "Usuário autenticado não possui ID."
                );

            }


            this.estado.carregando =
                true;

            this.estado.erro =
                null;


            try {

                console.log(
                    "MusicalWorldFinanceiro: carregando contratações do usuário:",
                    usuarioId
                );


                /*
                 * Buscamos todas as contratações em que o
                 * usuário participa de qualquer lado.
                 *
                 * Não dependemos do tipo de perfil.
                 */

                const resultado =
                    await supabase
                        .from(
                            CONFIG.tabelaContratacoes
                        )
                        .select("*")
                        .or(
                            "contratante_id.eq." +
                            usuarioId +
                            ",contratado_id.eq." +
                            usuarioId
                        )
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );


                if (resultado.error) {

                    throw resultado.error;

                }


                const contratacoes =
                    Array.isArray(
                        resultado.data
                    )
                        ? resultado.data
                        : [];


                console.log(
                    "MusicalWorldFinanceiro: contratações encontradas:",
                    contratacoes.length
                );


                /*
                 * Enriquece os dados das contratações
                 * com nomes e serviços.
                 */

                const movimentacoes =
                    await this.transformarContratacoesEmMovimentacoes(
                        contratacoes,
                        usuarioId
                    );


                this.estado.movimentacoes =
                    movimentacoes;


                /*
                 * Calcula o resumo a partir das
                 * movimentações.
                 */

                this.calcularResumo();


                console.log(
                    "MusicalWorldFinanceiro: resumo financeiro calculado:",
                    this.estado.resumo
                );


                return movimentacoes;


            } catch (erro) {

                console.error(
                    "MusicalWorldFinanceiro: erro ao carregar dados financeiros.",
                    erro
                );


                this.estado.erro =
                    erro;


                this.estado.movimentacoes =
                    [];


                this.calcularResumo();


                throw erro;


            } finally {

                this.estado.carregando =
                    false;

            }

        },


        /* =================================================
           TRANSFORMAR CONTRATAÇÕES EM MOVIMENTAÇÕES
        ================================================= */

        async transformarContratacoesEmMovimentacoes(
            contratacoes,
            usuarioId
        ) {

            if (
                !Array.isArray(
                    contratacoes
                )
            ) {

                return [];

            }


            const movimentacoes = [];


            /*
             * Primeiro coletamos os IDs necessários para
             * buscar os dados complementares.
             */

            const usuarioIds =
                new Set();

            const servicoIds =
                new Set();


            contratacoes.forEach(
                (contratacao) => {

                    if (
                        contratacao.contratante_id
                    ) {

                        usuarioIds.add(
                            contratacao.contratante_id
                        );

                    }


                    if (
                        contratacao.contratado_id
                    ) {

                        usuarioIds.add(
                            contratacao.contratado_id
                        );

                    }


                    if (
                        contratacao.servico_id
                    ) {

                        servicoIds.add(
                            contratacao.servico_id
                        );

                    }

                }
            );


            /*
             * Busca os usuários envolvidos.
             */

            const usuarios =
                await this.buscarUsuariosPorIds(
                    Array.from(
                        usuarioIds
                    )
                );


            /*
             * Busca os serviços envolvidos.
             */

            const servicos =
                await this.buscarServicosPorIds(
                    Array.from(
                        servicoIds
                    )
                );


            /*
             * Converte cada contratação em uma
             * movimentação financeira.
             */

            contratacoes.forEach(
                (contratacao) => {

                    const valor =
                        this.obterValorNumerico(
                            contratacao.valor
                        );


                    if (
                        valor <= 0
                    ) {

                        return;

                    }


                    const souContratante =
                        String(
                            contratacao.contratante_id || ""
                        ) ===
                        String(
                            usuarioId
                        );


                    const souContratado =
                        String(
                            contratacao.contratado_id || ""
                        ) ===
                        String(
                            usuarioId
                        );


                    /*
                     * Uma contratação deve pertencer a
                     * pelo menos um dos lados.
                     */

                    if (
                        !souContratante &&
                        !souContratado
                    ) {

                        return;

                    }


                    const outroUsuarioId =
                        souContratante
                            ? contratacao.contratado_id
                            : contratacao.contratante_id;


                    const outroUsuario =
                        usuarios[
                            String(
                                outroUsuarioId || ""
                            )
                        ] || null;


                    const servico =
                        servicos[
                            String(
                                contratacao.servico_id || ""
                            )
                        ] || null;


                    const nomeOutraPessoa =
                        this.obterNomeUsuario(
                            outroUsuario
                        );


                    const nomeServico =
                        this.obterNomeServico(
                            servico
                        );


                    const statusPagamento =
                        this.normalizarStatus(
                            contratacao.status_pagamento
                        );


                    const statusContratacao =
                        this.normalizarStatus(
                            contratacao.status
                        );


                    /*
                     * =====================================
                     * PAGAMENTO
                     * =====================================
                     *
                     * Se o usuário é o contratante,
                     * a movimentação representa dinheiro
                     * saindo da conta dele.
                     */

                    if (
                        souContratante
                    ) {

                        const pagamentoConfirmado =
                            statusPagamento ===
                            CONFIG.statusPagamentoPago;


                        /*
                         * O Financeiro mostra o pagamento
                         * quando a contratação já foi marcada
                         * como paga.
                         *
                         * Caso o pagamento ainda não esteja
                         * confirmado, ele continua aparecendo
                         * como pendente.
                         */

                        movimentacoes.push({

                            id:
                                contratacao.id,

                            contratacaoId:
                                contratacao.id,

                            tipo:
                                "pagamentos",

                            valor:
                                valor,

                            nome:
                                nomeOutraPessoa,

                            descricao:
                                nomeServico,

                            status:
                                pagamentoConfirmado
                                    ? "Pago"
                                    : "Pagamento pendente",

                            statusPagamento:
                                statusPagamento,

                            statusContratacao:
                                statusContratacao,

                            dataEvento:
                                contratacao.data_evento ||
                                null,

                            createdAt:
                                contratacao.created_at ||
                                null,

                            atualizadoEm:
                                contratacao.updated_at ||
                                null,

                            contratadoId:
                                contratacao.contratado_id,

                            contratanteId:
                                contratacao.contratante_id,

                            servicoId:
                                contratacao.servico_id,

                            contratadoNome:
                                nomeOutraPessoa,

                            contrato:
                                contratacao

                        });

                    }


                    /*
                     * =====================================
                     * RECEBIMENTO
                     * =====================================
                     *
                     * Se o usuário é o contratado,
                     * a movimentação representa dinheiro
                     * que ele deverá receber.
                     */

                    if (
                        souContratado
                    ) {

                        const pagamentoConfirmado =
                            statusPagamento ===
                            CONFIG.statusPagamentoPago;


                        const contratacaoConcluida =
                            this.contratacaoFoiConcluida(
                                contratacao
                            );


                        let status =
                            "Aguardando pagamento";


                        if (
                            pagamentoConfirmado &&
                            !contratacaoConcluida
                        ) {

                            status =
                                "A receber";

                        }


                        if (
                            pagamentoConfirmado &&
                            contratacaoConcluida
                        ) {

                            status =
                                "Recebido";

                        }


                        movimentacoes.push({

                            id:
                                contratacao.id,

                            contratacaoId:
                                contratacao.id,

                            tipo:
                                "recebimentos",

                            valor:
                                valor,

                            nome:
                                nomeOutraPessoa,

                            descricao:
                                nomeServico,

                            status:
                                status,

                            statusPagamento:
                                statusPagamento,

                            statusContratacao:
                                statusContratacao,

                            dataEvento:
                                contratacao.data_evento ||
                                null,

                            createdAt:
                                contratacao.created_at ||
                                null,

                            atualizadoEm:
                                contratacao.updated_at ||
                                null,

                            contratadoId:
                                contratacao.contratado_id,

                            contratanteId:
                                contratacao.contratante_id,

                            servicoId:
                                contratacao.servico_id,

                            contratanteNome:
                                nomeOutraPessoa,

                            contrato:
                                contratacao

                        });

                    }

                }
            );


            /*
             * Mais recentes primeiro.
             */

            movimentacoes.sort(
                (
                    a,
                    b
                ) => {

                    const dataA =
                        this.obterDataOrdenacao(
                            a
                        );


                    const dataB =
                        this.obterDataOrdenacao(
                            b
                        );


                    return dataB - dataA;

                }
            );


            return movimentacoes;

        },


        /* =================================================
           BUSCAR USUÁRIOS POR IDS
        ================================================= */

        async buscarUsuariosPorIds(
            ids
        ) {

            const resultado =
                {};


            if (
                !Array.isArray(ids) ||
                !ids.length
            ) {

                return resultado;

            }


            const supabase =
                this.obterClienteSupabase();


            if (!supabase) {

                return resultado;

            }


            try {

                const idsValidos =
                    ids.filter(
                        Boolean
                    );


                if (
                    !idsValidos.length
                ) {

                    return resultado;

                }


                const resposta =
                    await supabase
                        .from(
                            CONFIG.tabelaUsuarios
                        )
                        .select(
                            "id, nome, email"
                        )
                        .in(
                            "id",
                            idsValidos
                        );


                if (
                    resposta.error
                ) {

                    console.warn(
                        "MusicalWorldFinanceiro: não foi possível carregar nomes dos usuários.",
                        resposta.error
                    );


                    return resultado;

                }


                (
                    resposta.data || []
                ).forEach(
                    (usuario) => {

                        resultado[
                            String(
                                usuario.id
                            )
                        ] =
                            usuario;

                    }
                );


            } catch (erro) {

                console.warn(
                    "MusicalWorldFinanceiro: erro ao buscar usuários.",
                    erro
                );

            }


            return resultado;

        },


        /* =================================================
           BUSCAR SERVIÇOS POR IDS
        ================================================= */

        async buscarServicosPorIds(
            ids
        ) {

            const resultado =
                {};


            if (
                !Array.isArray(ids) ||
                !ids.length
            ) {

                return resultado;

            }


            const supabase =
                this.obterClienteSupabase();


            if (!supabase) {

                return resultado;

            }


            try {

                const idsValidos =
                    ids.filter(
                        Boolean
                    );


                if (
                    !idsValidos.length
                ) {

                    return resultado;

                }


                const resposta =
                    await supabase
                        .from(
                            CONFIG.tabelaServicos
                        )
                        .select(
                            "id, nome, descricao"
                        )
                        .in(
                            "id",
                            idsValidos
                        );


                if (
                    resposta.error
                ) {

                    console.warn(
                        "MusicalWorldFinanceiro: não foi possível carregar os serviços.",
                        resposta.error
                    );


                    return resultado;

                }


                (
                    resposta.data || []
                ).forEach(
                    (servico) => {

                        resultado[
                            String(
                                servico.id
                            )
                        ] =
                            servico;

                    }
                );


            } catch (erro) {

                console.warn(
                    "MusicalWorldFinanceiro: erro ao buscar serviços.",
                    erro
                );

            }


            return resultado;

        },


        /* =================================================
           OBTER NOME DO USUÁRIO
        ================================================= */

        obterNomeUsuario(
            usuario
        ) {

            if (!usuario) {

                return "Usuário";

            }


            return this.normalizarTexto(

                usuario.nome ||
                usuario.nome_completo ||
                usuario.email ||
                "Usuário"

            );

        },


        /* =================================================
           OBTER NOME DO SERVIÇO
        ================================================= */

        obterNomeServico(
            servico
        ) {

            if (!servico) {

                return "Serviço contratado";

            }


            return this.normalizarTexto(

                servico.nome ||
                servico.titulo ||
                servico.descricao ||
                "Serviço contratado"

            );

        },


        /* =================================================
           OBTER VALOR NUMÉRICO
        ================================================= */

        obterValorNumerico(
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
                valor === null ||
                valor === undefined ||
                valor === ""
            ) {

                return 0;

            }


            const texto =
                String(
                    valor
                )
                    .trim()
                    .replace(
                        /R\$/gi,
                        ""
                    )
                    .replace(
                        /\s/g,
                        ""
                    );


            /*
             * Trata formatos como:
             *
             * 500
             * 500.50
             * 500,50
             * 1.500,50
             */

            let normalizado =
                texto;


            if (
                normalizado.includes(",") &&
                normalizado.includes(".")
            ) {

                normalizado =
                    normalizado
                        .replace(
                            /\./g,
                            ""
                        )
                        .replace(
                            ",",
                            "."
                        );

            } else if (
                normalizado.includes(",")
            ) {

                normalizado =
                    normalizado.replace(
                        ",",
                        "."
                    );

            }


            const numero =
                Number(
                    normalizado
                );


            return Number.isFinite(
                numero
            )
                ? numero
                : 0;

        },


        /* =================================================
           VERIFICAR CONTRATAÇÃO CONCLUÍDA
        ================================================= */

        contratacaoFoiConcluida(
            contratacao
        ) {

            if (!contratacao) {

                return false;

            }


            const status =
                this.normalizarStatus(
                    contratacao.status
                );


            if (
                CONFIG.statusContratacaoConcluida
                    .includes(
                        status
                    )
            ) {

                return true;

            }


            /*
             * Algumas estruturas podem utilizar campos
             * booleanos para indicar conclusão.
             */

            if (
                contratacao.concluida === true ||
                contratacao.finalizada === true
            ) {

                return true;

            }


            return false;

        },


        /* =================================================
           CALCULAR RESUMO
        ================================================= */

        calcularResumo() {

            let totalPago =
                0;

            let aReceber =
                0;

            let totalRecebido =
                0;

            let saldoDisponivel =
                0;


            const movimentacoes =
                Array.isArray(
                    this.estado.movimentacoes
                )
                    ? this.estado.movimentacoes
                    : [];


            movimentacoes.forEach(
                (movimentacao) => {

                    const valor =
                        this.obterValorNumerico(
                            movimentacao.valor
                        );


                    if (
                        movimentacao.tipo ===
                        "pagamentos"
                    ) {

                        /*
                         * Total pago representa valores
                         * efetivamente pagos pelo usuário.
                         */

                        if (
                            movimentacao.statusPagamento ===
                            CONFIG.statusPagamentoPago
                        ) {

                            totalPago +=
                                valor;

                        }

                    }


                    if (
                        movimentacao.tipo ===
                        "recebimentos"
                    ) {

                        if (
                            movimentacao.status ===
                            "Recebido"
                        ) {

                            totalRecebido +=
                                valor;

                            /*
                             * Por enquanto consideramos
                             * recebimento efetivado como
                             * saldo disponível.
                             *
                             * Quando o sistema de carteira
                             * estiver conectado, esta regra
                             * poderá ser substituída pelos
                             * registros de carteira.
                             */

                            saldoDisponivel +=
                                valor;

                        } else if (
                            movimentacao.status ===
                            "A receber"
                        ) {

                            aReceber +=
                                valor;

                        }

                    }

                }
            );


            this.estado.resumo = {

                saldoDisponivel:
                    saldoDisponivel,

                aReceber:
                    aReceber,

                totalRecebido:
                    totalRecebido,

                totalPago:
                    totalPago

            };

        },


        /* =================================================
           APLICAR FILTRO
        ================================================= */

        aplicarFiltro(
            tipo
        ) {

            const filtrosValidos = [

                "todas",

                "recebimentos",

                "pagamentos",

                "saques"

            ];


            if (
                !filtrosValidos.includes(
                    tipo
                )
            ) {

                tipo =
                    "todas";

            }


            this.estado.filtroAtual =
                tipo;


            this.atualizarVisualDosFiltros();

            this.renderizarMovimentacoes();

        },


        /* =================================================
           ATUALIZAR VISUAL DOS FILTROS
        ================================================= */

        atualizarVisualDosFiltros() {

            const filtros =
                document.querySelectorAll(
                    ".financeiro-filtro"
                );


            filtros.forEach(
                (filtro) => {

                    const ativo =
                        filtro.dataset.filtro ===
                        this.estado.filtroAtual;


                    filtro.classList.toggle(
                        "ativo",
                        ativo
                    );


                    filtro.setAttribute(
                        "aria-selected",
                        ativo
                            ? "true"
                            : "false"
                    );

                }
            );

        },


        /* =================================================
           RENDERIZAR RESUMO
        ================================================= */

        renderizarResumo() {

            const resumo =
                this.estado.resumo;


            this.definirTexto(
                CONFIG.elementos.saldoDisponivel,
                this.formatarMoeda(
                    resumo.saldoDisponivel
                )
            );


            this.definirTexto(
                CONFIG.elementos.aReceber,
                this.formatarMoeda(
                    resumo.aReceber
                )
            );


            this.definirTexto(
                CONFIG.elementos.totalRecebido,
                this.formatarMoeda(
                    resumo.totalRecebido
                )
            );


            this.definirTexto(
                CONFIG.elementos.totalPago,
                this.formatarMoeda(
                    resumo.totalPago
                )
            );

        },


        /* =================================================
           RENDERIZAR MOVIMENTAÇÕES
        ================================================= */

        renderizarMovimentacoes() {

            const lista =
                document.querySelector(
                    CONFIG.elementos.lista
                );


            if (!lista) {

                return;

            }


            const movimentacoes =
                this.obterMovimentacoesFiltradas();


            if (
                !movimentacoes.length
            ) {

                this.renderizarEstadoVazio(
                    lista
                );


                return;

            }


            lista.innerHTML =
                "";


            movimentacoes.forEach(
                (movimentacao) => {

                    lista.appendChild(
                        this.criarElementoMovimentacao(
                            movimentacao
                        )
                    );

                }
            );

        },


        /* =================================================
           OBTER MOVIMENTAÇÕES FILTRADAS
        ================================================= */

        obterMovimentacoesFiltradas() {

            const movimentacoes =
                Array.isArray(
                    this.estado.movimentacoes
                )
                    ? this.estado.movimentacoes
                    : [];


            if (
                this.estado.filtroAtual ===
                "todas"
            ) {

                return movimentacoes;

            }


            return movimentacoes.filter(
                (movimentacao) => {

                    return (
                        movimentacao.tipo ===
                        this.estado.filtroAtual
                    );

                }
            );

        },


        /* =================================================
           CRIAR ELEMENTO DE MOVIMENTAÇÃO
        ================================================= */

        criarElementoMovimentacao(
            movimentacao
        ) {

            const elemento =
                document.createElement(
                    "article"
                );


            const tipo =
                movimentacao.tipo ||
                "recebimentos";


            const entrada =
                tipo ===
                "recebimentos";


            const classeDirecao =
                entrada
                    ? "positivo"
                    : "negativo";


            const sinal =
                entrada
                    ? "+"
                    : "-";


            const valorNumerico =
                Math.abs(
                    this.obterValorNumerico(
                        movimentacao.valor
                    )
                );


            const valor =
                this.formatarMoeda(
                    valorNumerico
                );


            const nome =
                this.escaparHtml(
                    movimentacao.nome ||
                    "Usuário"
                );


            const descricao =
                this.escaparHtml(
                    movimentacao.descricao ||
                    "Movimentação financeira"
                );


            const status =
                this.escaparHtml(
                    movimentacao.status ||
                    "Processando"
                );


            const data =
                this.formatarData(
                    movimentacao.dataEvento ||
                    movimentacao.createdAt
                );


            elemento.className =
                `financeiro-movimentacao ${classeDirecao}`;


            /*
             * Guarda informações adicionais no elemento.
             * Isso será útil futuramente para abrir detalhes
             * da contratação.
             */

            if (
                movimentacao.contratacaoId
            ) {

                elemento.dataset.contratacaoId =
                    movimentacao.contratacaoId;

            }


            const icone =
                entrada
                    ? `

                        <svg
                            viewBox="0 0 24 24"
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
                    : `

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >

                            <path d="M12 5v14"></path>

                            <path d="M19 12l-7 7-7-7"></path>

                        </svg>

                    `;


            elemento.innerHTML = `

                <div
                    class="financeiro-movimentacao-icone"
                >

                    ${icone}

                </div>


                <div
                    class="financeiro-movimentacao-conteudo"
                >

                    <strong>
                        ${nome}
                    </strong>


                    <p>
                        ${descricao}
                    </p>


                    ${
                        data
                            ? `
                                <span
                                    class="financeiro-movimentacao-data"
                                >
                                    ${this.escaparHtml(data)}
                                </span>
                              `
                            : ""
                    }


                    <span
                        class="financeiro-movimentacao-status"
                    >
                        ${status}
                    </span>

                </div>


                <div
                    class="financeiro-movimentacao-valor"
                >

                    <strong>
                        ${sinal}
                        ${valor}
                    </strong>

                </div>

            `;


            return elemento;

        },


        /* =================================================
           ESTADO VAZIO
        ================================================= */

        renderizarEstadoVazio(
            lista
        ) {

            lista.innerHTML = `

                <div
                    class="financeiro-vazio"
                    id="financeiro-vazio"
                >

                    <div
                        class="financeiro-vazio-icone"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >

                            <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                            ></rect>

                            <line
                                x1="16"
                                y1="2"
                                x2="16"
                                y2="6"
                            ></line>

                            <line
                                x1="8"
                                y1="2"
                                x2="8"
                                y2="6"
                            ></line>

                            <line
                                x1="3"
                                y1="10"
                                x2="21"
                                y2="10"
                            ></line>

                        </svg>

                    </div>


                    <h3>
                        Nenhuma movimentação
                    </h3>


                    <p>
                        Seus pagamentos, recebimentos e saques
                        aparecerão aqui.
                    </p>

                </div>

            `;

        },


        /* =================================================
           RENDERIZAR ERRO
        ================================================= */

        renderizarErro() {

            const lista =
                document.querySelector(
                    CONFIG.elementos.lista
                );


            if (!lista) {

                return;

            }


            lista.innerHTML = `

                <div
                    class="financeiro-vazio"
                    id="financeiro-erro"
                >

                    <div
                        class="financeiro-vazio-icone"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >

                            <circle
                                cx="12"
                                cy="12"
                                r="9"
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
                        Não foi possível carregar o financeiro
                    </h3>


                    <p>
                        Tente atualizar a página novamente.
                    </p>

                </div>

            `;

        },


        /* =================================================
           SOLICITAR SAQUE
        ================================================= */

        solicitarSaque() {

            const saldo =
                Number(
                    this.estado.resumo
                        .saldoDisponivel
                ) || 0;


            if (
                saldo <= 0
            ) {

                this.mostrarMensagem(
                    "Você ainda não possui saldo disponível para saque."
                );


                return;

            }


            /*
             * O saque continuará sendo implementado
             * em uma etapa posterior.
             */

            this.mostrarMensagem(
                "O fluxo de saque será disponibilizado nesta área."
            );

        },


        /* =================================================
           VER SAQUES
        ================================================= */

        verSaques() {

            this.aplicarFiltro(
                "saques"
            );


            const movimentacoes =
                document.querySelector(
                    ".financeiro-movimentacoes"
                );


            if (
                movimentacoes
            ) {

                movimentacoes.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }

        },


        /* =================================================
           VOLTAR
        ================================================= */

        voltar() {

            if (
                window.history.length > 1
            ) {

                window.history.back();

                return;

            }


            window.location.href =
                "index.html";

        },


        /* =================================================
           FORMATAR MOEDA
        ================================================= */

        formatarMoeda(
            valor
        ) {

            const numero =
                Number(
                    valor
                ) || 0;


            return numero.toLocaleString(
                "pt-BR",
                {

                    style:
                        "currency",

                    currency:
                        "BRL"

                }
            );

        },


        /* =================================================
           FORMATAR DATA
        ================================================= */

        formatarData(
            valor
        ) {

            if (!valor) {

                return "";

            }


            try {

                /*
                 * Datas no formato YYYY-MM-DD são tratadas
                 * manualmente para evitar deslocamento de
                 * dia causado pelo timezone.
                 */

                if (
                    /^\d{4}-\d{2}-\d{2}$/
                        .test(
                            String(valor)
                        )
                ) {

                    const partes =
                        String(valor)
                            .split("-");


                    const data =
                        new Date(

                            Number(
                                partes[0]
                            ),

                            Number(
                                partes[1]
                            ) - 1,

                            Number(
                                partes[2]
                            )

                        );


                    return data.toLocaleDateString(
                        "pt-BR"
                    );

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

                    return "";

                }


                return data.toLocaleDateString(
                    "pt-BR"
                );


            } catch (erro) {

                console.warn(
                    "MusicalWorldFinanceiro: erro ao formatar data.",
                    erro
                );


                return "";

            }

        },


        /* =================================================
           OBTER DATA PARA ORDENAÇÃO
        ================================================= */

        obterDataOrdenacao(
            movimentacao
        ) {

            const valor =
                movimentacao &&
                (
                    movimentacao.createdAt ||
                    movimentacao.dataEvento
                );


            if (!valor) {

                return 0;

            }


            const data =
                new Date(
                    valor
                );


            const timestamp =
                data.getTime();


            return Number.isNaN(
                timestamp
            )
                ? 0
                : timestamp;

        },


        /* =================================================
           NORMALIZAR STATUS
        ================================================= */

        normalizarStatus(
            valor
        ) {

            return this.normalizarTexto(
                valor
            )
                .toLowerCase()
                .normalize(
                    "NFD"
                )
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

        },


        /* =================================================
           NORMALIZAR TEXTO
        ================================================= */

        normalizarTexto(
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
            ).trim();

        },


        /* =================================================
           DEFINIR TEXTO
        ================================================= */

        definirTexto(
            seletor,
            valor
        ) {

            const elemento =
                document.querySelector(
                    seletor
                );


            if (!elemento) {

                return;

            }


            elemento.textContent =
                valor;

        },


        /* =================================================
           ESCAPAR HTML
        ================================================= */

        escaparHtml(
            valor
        ) {

            return String(
                valor
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

        },


        /* =================================================
           MENSAGEM
        ================================================= */

        mostrarMensagem(
            mensagem
        ) {

            if (
                typeof window.mostrarToast ===
                "function"
            ) {

                window.mostrarToast(
                    mensagem
                );


                return;

            }


            if (
                window.MusicalWorld &&
                typeof window.MusicalWorld
                    .mostrarToast ===
                    "function"
            ) {

                window.MusicalWorld
                    .mostrarToast(
                        mensagem
                    );


                return;

            }


            console.info(
                "MusicalWorldFinanceiro:",
                mensagem
            );

        }

    };


    /* =====================================================
       EXPOR CONTROLADOR
    ===================================================== */

    window.MusicalWorldFinanceiro =
        MusicalWorldFinanceiro;


    /* =====================================================
       INICIALIZAÇÃO SEGURA
    ===================================================== */

    function iniciar() {

        MusicalWorldFinanceiro
            .inicializar();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar,
            {
                once:
                    true
            }
        );

    } else {

        iniciar();

    }


})(window);