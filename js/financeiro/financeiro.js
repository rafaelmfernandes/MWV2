/* =========================================================
   MUSICALWORLD — FINANCEIRO

   Arquivo:
   js/financeiro/financeiro.js

   Responsabilidades:
   - Inicializar a página Financeiro.
   - Controlar os filtros de movimentações.
   - Controlar as ações básicas da página.
   - Manter o estado financeiro do usuário.
   - Preparar a página para integração com o Supabase.
   - Formatar valores monetários.
   - Renderizar movimentações.
   - Renderizar estados vazios.
   - Controlar a navegação da página.

   IMPORTANTE:

   Esta versão ainda NÃO consulta os dados financeiros
   definitivos do Supabase.

   Isso é proposital.

   O MusicalWorld possui uma página financeira única.

   O mesmo usuário pode:

   - contratar outro usuário;
   - pagar por um serviço;
   - prestar um serviço;
   - receber um pagamento;
   - possuir valores pendentes;
   - possuir saldo disponível;
   - solicitar um saque.

   Portanto, recebimentos e pagamentos não devem ser
   determinados pelo tipo de perfil do usuário.

   Eles deverão ser determinados pelas movimentações
   financeiras relacionadas aos contratos.

   Quando a estrutura definitiva do banco estiver pronta,
   as consultas poderão ser separadas em módulos como:

   js/financeiro/dados.js
   js/financeiro/resumo.js
   js/financeiro/movimentacoes.js
   js/financeiro/saque.js

========================================================= */


(function (window) {

    "use strict";


    /* =====================================================
       NAMESPACE PRINCIPAL
    ===================================================== */

    const MusicalWorldFinanceiro = {


        /* =================================================
           ESTADO DA PÁGINA
        ================================================= */

        estado: {

            usuario: null,

            filtroAtual: "todas",

            carregando: false,

            erro: null,

            resumo: {

                saldoDisponivel: 0,

                aReceber: 0,

                totalRecebido: 0,

                totalPago: 0

            },

            movimentacoes: [],

            saques: []

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
                 * Configura primeiro os eventos da interface.
                 */

                this.configurarEventos();


                /*
                 * Tenta identificar o usuário autenticado.
                 *
                 * Nesta etapa não buscamos ainda os dados
                 * financeiros definitivos.
                 */

                await this.obterUsuarioAtual();


                /*
                 * Renderiza o resumo inicial.
                 */

                this.renderizarResumo();


                /*
                 * Renderiza o estado inicial das movimentações.
                 */

                this.renderizarMovimentacoes();


                console.log(
                    "MusicalWorldFinanceiro: página inicializada."
                );


            } catch (erro) {

                console.error(
                    "MusicalWorldFinanceiro: erro ao inicializar página.",
                    erro
                );


                this.estado.erro =
                    erro;

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

        },


        /* =================================================
           OBTER USUÁRIO ATUAL
        ================================================= */

        async obterUsuarioAtual() {

            /*
             * O financeiro utiliza o cliente Supabase
             * compartilhado pelo projeto.
             *
             * Nunca criamos um novo cliente nesta página.
             */

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
             * Tentamos primeiro as referências já utilizadas
             * pelo projeto.
             *
             * Esta função poderá ser simplificada quando
             * confirmarmos definitivamente a API exposta
             * pelo js/core/supabase.js.
             */


            if (
                window.supabaseClient &&
                typeof window.supabaseClient.auth ===
                    "object"
            ) {

                return window.supabaseClient;

            }


            if (
                window.MusicalWorldSupabase &&
                window.MusicalWorldSupabase.client
            ) {

                return window.MusicalWorldSupabase.client;

            }


            if (
                window.MusicalWorld &&
                window.MusicalWorld.supabase
            ) {

                return window.MusicalWorld.supabase;

            }


            /*
             * Alguns módulos do projeto podem disponibilizar
             * o cliente através de uma função.
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
           APLICAR FILTRO
        ================================================= */

        aplicarFiltro(tipo) {

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
                "#financeiro-saldo-disponivel",
                this.formatarMoeda(
                    resumo.saldoDisponivel
                )
            );


            this.definirTexto(
                "#financeiro-a-receber",
                this.formatarMoeda(
                    resumo.aReceber
                )
            );


            this.definirTexto(
                "#financeiro-total-recebido",
                this.formatarMoeda(
                    resumo.totalRecebido
                )
            );


            this.definirTexto(
                "#financeiro-total-pago",
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
                    "#financeiro-lista"
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


            /*
             * Limpa somente a lista de movimentações.
             */

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


            /*
             * Recebimentos representam entrada.
             *
             * Pagamentos e saques representam saída.
             */

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
                    Number(
                        movimentacao.valor
                    ) || 0
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


            /*
             * O tipo de movimentação fica no próprio article.
             *
             * Isso permite que o CSS identifique corretamente
             * recebimentos e pagamentos.
             */

            elemento.className =
                `financeiro-movimentacao ${classeDirecao}`;


            /* =============================================
               ÍCONE
            ============================================== */

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
             * O formulário definitivo de saque ainda não
             * será criado nesta etapa.
             *
             * Quando o fluxo financeiro real estiver pronto,
             * esta função deverá:
             *
             * - validar saldo;
             * - validar valor mínimo;
             * - verificar dados bancários;
             * - criar a solicitação;
             * - atualizar o saldo;
             * - registrar a movimentação;
             * - acompanhar o status do saque.
             */


            this.mostrarMensagem(
                "O fluxo de saque será disponibilizado nesta área."
            );

        },


        /* =================================================
           VER SAQUES
        ================================================= */

        verSaques() {

            /*
             * O filtro visual é alterado para saques.
             */

            this.aplicarFiltro(
                "saques"
            );


            /*
             * Depois levamos o usuário até a seção
             * de movimentações.
             */

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

            /*
             * Mantemos a navegação simples e compatível
             * com a estrutura atual do aplicativo.
             */

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


            if (
                !elemento
            ) {

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

            /*
             * Utiliza o sistema de toast existente,
             * quando disponível.
             */

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