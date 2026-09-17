
(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — ETAPA 6: PAGAMENTO

       Arquivo:
       www/js/contratacao/contratacao-pagamento.js

       Responsabilidades:
       ---------------------------------------------------------
       - Exibir os dados da contratação vindos do estado central.
       - Exibir nome, tipo, localização e foto do artista.
       - Permitir escolha do método de pagamento.
       - Abrir o modal somente após clicar em Continuar.
       - Controlar Pix e cartão.
       - Validar os dados do cartão.
       - Simular o processamento do pagamento.
       - Criar a contratação real no Supabase.
       - Criar a notificação da nova solicitação para o artista.
       - Salvar o ID da contratação no estado central.
       - Encaminhar para a tela de sucesso.

       IMPORTANTE:
       ---------------------------------------------------------
       O estado central continua sendo a única fonte de verdade
       durante o fluxo da contratação.

       Este arquivo NÃO cria um segundo estado para a contratação.

       Depois do pagamento aprovado:

       1. Recupera o usuário autenticado.
       2. Identifica contratante e contratado.
       3. Monta o registro de public.contratacoes.
       4. Insere o registro no Supabase.
       5. Cria a notificação para o artista.
       6. Salva contratacaoId no estado central.
       7. Salva o pagamento como pago.
       8. Redireciona para a tela de sucesso.

       PROTEÇÃO CONTRA ID ANTIGO:
       ---------------------------------------------------------
       O contratacaoId armazenado no estado central é validado
       contra o banco antes de ser reutilizado.

       Isso evita que um ID antigo, por exemplo de uma contratação
       que foi apagada manualmente do Supabase, impeça a criação
       de uma nova contratação.

       Não são armazenados número do cartão, CVV ou validade
       dentro do banco.
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        etapaAtual: 6,

        totalEtapas: 6,

        paginaAnterior: "contratacao-revisao.html",

        paginaSucesso: "contratacao-sucesso.html",

        paginaCancelar: "apresentar-perfil.html",

        moeda: "BRL",

        simboloMoeda: "R$",

        tabelaContratacoes: "contratacoes",

        tabelaNotificacoes: "notificacoes",

        tabelaUsuarios: "usuarios",

        statusContratacao: "aguardando_confirmacao",

        statusPagamento: "pago"

    };


    /* =========================================================
       ESTADO LOCAL DA INTERFACE
       ========================================================= */

    const UI = {

        metodoPagamento: "",

        modalAtual: null,

        processando: false,

        salvandoContratacao: false

    };


    /* =========================================================
       ESTADO CENTRAL
       ========================================================= */

    let estadoCentral = null;


    /* =========================================================
       UTILITÁRIOS
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

                gerenciador.salvar(dados);

                return true;

            }


            if (
                typeof gerenciador.definir ===
                "function"
            ) {

                Object.keys(dados).forEach(
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


    function escaparHTML(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(valor)

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
                currency: CONFIG.moeda
            }
        );

    }


    function obterValorServico(estado) {

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


    function obterNomeArtista(estado) {

        if (
            !estado ||
            !estado.artista
        ) {

            return "Artista";

        }


        return (

            estado.artista.nomeExibicao ||

            estado.artista.nome ||

            "Artista"

        );

    }


    function obterTipoArtista(estado) {

        if (
            !estado ||
            !estado.artista
        ) {

            return "";

        }


        return (

            estado.artista.tipoArtista ||

            estado.artista.tipo_artista ||

            estado.tipo ||

            "Artista"

        );

    }


    function obterLocalizacaoArtista(estado) {

        if (
            !estado ||
            !estado.artista
        ) {

            return "";

        }


        return (

            estado.artista.localizacao ||

            estado.artista.localizacaoArtista ||

            ""

        );

    }


    function obterFotoArtista(estado) {

        if (
            !estado ||
            !estado.artista
        ) {

            return "";

        }


        return (

            estado.artista.fotoUrl ||

            estado.artista.foto_url ||

            estado.artista.avatarUrl ||

            estado.artista.avatar_url ||

            ""

        );

    }


    function obterElemento(...ids) {

        for (
            const id of ids
        ) {

            if (!id) {

                continue;

            }


            const elemento =
                document.getElementById(id);


            if (elemento) {

                return elemento;

            }

        }


        return null;

    }


    /* =========================================================
       SUPABASE
       ========================================================= */

    function obterSupabaseClient() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient
                .from === "function"
        ) {

            return window.supabaseClient;

        }


        if (
            window.SupabaseClient &&
            typeof window.SupabaseClient
                .getClient === "function"
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
            typeof window.SupabaseClient.client
                .from === "function"
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
       VALIDAR CONTRATAÇÃO EXISTENTE

       O estado central pode conter um contratacaoId antigo,
       especialmente depois de uma contratação ter sido apagada
       manualmente do banco durante testes.

       Esta função verifica o ID diretamente no Supabase.

       Retornos:

       - contratação encontrada e pertencente ao usuário:
         retorna os dados da contratação.

       - ID não existe mais:
         limpa o ID antigo e retorna null.

       - erro real de banco/autenticação:
         lança o erro para impedir uma nova criação insegura.
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
                    "id,contratante_id,contratado_id,status,status_pagamento"
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


        /*
         * -----------------------------------------------------
         * O ID está no estado, mas não existe mais no banco.
         *
         * Isso acontece, por exemplo, quando uma contratação
         * foi apagada manualmente durante os testes.
         *
         * Nesse caso, o estado antigo não pode bloquear uma
         * nova contratação.
         * -----------------------------------------------------
         */

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


            return null;

        }


        /*
         * -----------------------------------------------------
         * O ID existe, mas precisamos confirmar que pertence
         * ao usuário autenticado.
         * -----------------------------------------------------
         */

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
       RENDERIZAÇÃO — ARTISTA
       ========================================================= */

    function renderizarArtista() {

        if (!estadoCentral) {

            return;

        }


        const nome =
            obterNomeArtista(
                estadoCentral
            );


        const tipo =
            obterTipoArtista(
                estadoCentral
            );


        const localizacao =
            obterLocalizacaoArtista(
                estadoCentral
            );


        const foto =
            obterFotoArtista(
                estadoCentral
            );


        const elementoNome =
            obterElemento(
                "artistaNome",
                "artistName",
                "nomeArtista"
            );


        const elementoTipo =
            obterElemento(
                "artistaTipo",
                "artistType",
                "tipoArtista"
            );


        const elementoLocalizacao =
            obterElemento(
                "artistaLocalizacao",
                "artistLocation",
                "localizacaoArtista"
            );


        const elementoFoto =
            obterElemento(
                "artistaAvatar",
                "artistaFoto",
                "artistAvatar",
                "avatarArtista",
                "artistAvatarImage"
            );


        if (elementoNome) {

            elementoNome.textContent =
                nome;

        }


        if (elementoTipo) {

            elementoTipo.textContent =
                tipo ||
                "Artista";

        }


        if (elementoLocalizacao) {

            elementoLocalizacao.textContent =
                localizacao ||
                "Não informado";

        }


        if (elementoFoto) {

            if (
                elementoFoto.tagName &&
                elementoFoto.tagName.toLowerCase() ===
                "img"
            ) {

                if (foto) {

                    elementoFoto.src =
                        foto;

                    elementoFoto.alt =
                        `Foto de ${nome}`;

                    elementoFoto.style.display =
                        "block";


                    elementoFoto.onerror =
                        function () {

                            console.warn(
                                "MusicalWorldContratacaoPagamento: " +
                                "não foi possível carregar a foto do artista.",
                                foto
                            );


                            elementoFoto.removeAttribute(
                                "src"
                            );


                            elementoFoto.style.display =
                                "none";

                        };

                } else {

                    elementoFoto.removeAttribute(
                        "src"
                    );


                    elementoFoto.alt =
                        "";


                    elementoFoto.style.display =
                        "none";

                }

            } else {

                if (foto) {

                    elementoFoto.style.backgroundImage =
                        `url("${foto.replace(/"/g, '\\"')}")`;

                    elementoFoto.style.backgroundSize =
                        "cover";

                    elementoFoto.style.backgroundPosition =
                        "center";

                    elementoFoto.style.backgroundRepeat =
                        "no-repeat";

                    elementoFoto.classList.add(
                        "com-foto"
                    );

                } else {

                    elementoFoto.style.backgroundImage =
                        "none";

                    elementoFoto.classList.remove(
                        "com-foto"
                    );

                }

            }

        } else {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "elemento #artistaAvatar não foi encontrado."
            );

        }


        console.log(
            "MusicalWorldContratacaoPagamento: dados do artista:",
            {
                nome: nome,
                tipo: tipo,
                localizacao: localizacao,
                fotoUrl: foto
            }
        );

    }


    /* =========================================================
       RENDERIZAÇÃO — SERVIÇO
       ========================================================= */

    function renderizarServico() {

        if (!estadoCentral) {

            return;

        }


        const servico =
            estadoCentral.servico ||
            {};


        const nome =
            servico.nome ||
            "Serviço";


        const valor =
            obterValorServico(
                estadoCentral
            );


        const elementoNome =
            obterElemento(
                "servicoNome",
                "serviceName",
                "nomeServico"
            );


        const elementoValor =
            obterElemento(
                "servicoValor",
                "serviceValue",
                "valorServico",
                "valorPagamento"
            );


        if (elementoNome) {

            elementoNome.textContent =
                nome;

        }


        if (elementoValor) {

            elementoValor.textContent =
                formatarMoeda(
                    valor
                );

        }


        const elementosValor =
            document.querySelectorAll(
                "[data-valor-servico]"
            );


        elementosValor.forEach(
            function (elemento) {

                elemento.textContent =
                    formatarMoeda(
                        valor
                    );

            }
        );

    }


    /* =========================================================
       RENDERIZAÇÃO — RESUMO DO PAGAMENTO
       ========================================================= */

    function renderizarResumoPagamento() {

        if (!estadoCentral) {

            return;

        }


        const valor =
            obterValorServico(
                estadoCentral
            );


        const elementoTotal =
            obterElemento(
                "valorTotal",
                "totalPagamento",
                "pagamentoTotal",
                "total"
            );


        if (elementoTotal) {

            elementoTotal.textContent =
                formatarMoeda(
                    valor
                );

        }


        const elementos =
            document.querySelectorAll(
                "[data-total-pagamento]"
            );


        elementos.forEach(
            function (elemento) {

                elemento.textContent =
                    formatarMoeda(
                        valor
                    );

            }
        );

    }


    /* =========================================================
       RESTAURAÇÃO DO MÉTODO DE PAGAMENTO
       ========================================================= */

    function restaurarMetodoPagamento() {

        if (
            !estadoCentral ||
            !estadoCentral.pagamento
        ) {

            return;

        }


        const metodo =
            estadoCentral.pagamento.metodo ||
            "";


        if (!metodo) {

            return;

        }


        UI.metodoPagamento =
            metodo;


        atualizarInterfaceMetodoPagamento();

    }


    /* =========================================================
       INTERFACE DO MÉTODO DE PAGAMENTO
       ========================================================= */

    function obterBotoesPagamento() {

        return document.querySelectorAll(
            "[data-metodo-pagamento], " +
            ".payment-method, " +
            ".metodo-pagamento, " +
            "#btnPix, " +
            "#btnCartao"
        );

    }


    function atualizarInterfaceMetodoPagamento() {

        const metodo =
            UI.metodoPagamento;


        document
            .querySelectorAll(
                "[data-metodo-pagamento]"
            )
            .forEach(
                function (elemento) {

                    const valor =
                        elemento.dataset.metodoPagamento;


                    elemento.classList.toggle(
                        "active",
                        valor === metodo
                    );


                    elemento.classList.toggle(
                        "selected",
                        valor === metodo
                    );

                }
            );


        const btnPix =
            obterElemento(
                "btnPix",
                "metodoPix",
                "paymentPix"
            );


        const btnCartao =
            obterElemento(
                "btnCartao",
                "metodoCartao",
                "paymentCard",
                "pagamentoCartao"
            );


        if (btnPix) {

            btnPix.classList.toggle(
                "active",
                metodo === "pix"
            );


            btnPix.classList.toggle(
                "selected",
                metodo === "pix"
            );

        }


        if (btnCartao) {

            btnCartao.classList.toggle(
                "active",
                metodo === "cartao"
            );


            btnCartao.classList.toggle(
                "selected",
                metodo === "cartao"
            );

        }


        atualizarBotaoContinuar();

    }


    /* =========================================================
       SELEÇÃO DO MÉTODO DE PAGAMENTO
       ========================================================= */

    function selecionarMetodoPagamento(metodo) {

        if (
            metodo !== "pix" &&
            metodo !== "cartao"
        ) {

            console.warn(
                "Método de pagamento inválido:",
                metodo
            );

            return;

        }


        UI.metodoPagamento =
            metodo;


        salvarPagamentoParcial();


        atualizarInterfaceMetodoPagamento();

    }


    /* =========================================================
       SALVAR PAGAMENTO PARCIAL
       ========================================================= */

    function salvarPagamentoParcial() {

        if (!estadoCentral) {

            return false;

        }


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
                        UI.metodoPagamento,

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

        }


        return sucesso;

    }


    /* =========================================================
       BOTÃO CONTINUAR
       ========================================================= */

    function atualizarBotaoContinuar() {

        const botao =
            obterElemento(
                "btnContinuar",
                "btnAbrirPagamento",
                "btnPagar",
                "btnFinalizarPagamento",
                "continuarPagamento",
                "finalizarPagamento"
            );


        if (!botao) {

            return;

        }


        const habilitado =
            UI.metodoPagamento === "pix" ||
            UI.metodoPagamento === "cartao";


        botao.disabled =
            !habilitado ||
            UI.processando;


        botao.classList.toggle(
            "disabled",
            !habilitado ||
            UI.processando
        );

    }


    /* =========================================================
       CONTINUAR — ABRIR MODAL
       ========================================================= */

    function abrirPagamento() {

        if (UI.processando) {

            return;

        }


        if (
            UI.metodoPagamento !== "pix" &&
            UI.metodoPagamento !== "cartao"
        ) {

            mostrarMensagemTemporaria(
                "Selecione uma forma de pagamento."
            );

            return;

        }


        salvarPagamentoParcial();


        if (
            UI.metodoPagamento === "pix"
        ) {

            exibirModalPix();

            return;

        }


        if (
            UI.metodoPagamento === "cartao"
        ) {

            exibirModalCartao();

            return;

        }

    }


    /* =========================================================
       MODAL PIX
       ========================================================= */

    function obterModalPix() {

        return obterElemento(
            "modalPix",
            "pixModal",
            "modalPagamentoPix"
        );

    }


    function exibirModalPix() {

        const modal =
            obterModalPix();


        if (!modal) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "modal Pix não encontrado."
            );

            return;

        }


        fecharModal();


        UI.modalAtual =
            modal;


        modal.classList.add(
            "aberto"
        );


        modal.classList.add(
            "active"
        );


        modal.classList.remove(
            "hidden"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        preencherPix();

    }


    function preencherPix() {

        const valor =
            obterValorServico(
                estadoCentral
            );


        const elementoValor =
            obterElemento(
                "pixValor",
                "valorPix"
            );


        if (elementoValor) {

            elementoValor.textContent =
                formatarMoeda(
                    valor
                );

        }


        const chave =
            estadoCentral &&
            estadoCentral.pagamento &&
            estadoCentral.pagamento.chavePix
                ? estadoCentral.pagamento.chavePix
                : "PIX";


        const elementoChave =
            obterElemento(
                "pixCodigo",
                "pixChave",
                "chavePix",
                "pixCode"
            );


        if (elementoChave) {

            elementoChave.textContent =
                chave;

        }

    }


    /* =========================================================
       COPIAR PIX
       ========================================================= */

    async function copiarPix() {

        const elementoChave =
            obterElemento(
                "pixCodigo",
                "pixChave",
                "chavePix",
                "pixCode"
            );


        if (!elementoChave) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "código Pix não encontrado."
            );

            return;

        }


        const texto =
            elementoChave.textContent.trim();


        if (!texto) {

            return;

        }


        try {

            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                await navigator.clipboard.writeText(
                    texto
                );

            } else {

                const area =
                    document.createElement(
                        "textarea"
                    );


                area.value =
                    texto;


                area.style.position =
                    "fixed";


                area.style.opacity =
                    "0";


                document.body.appendChild(
                    area
                );


                area.focus();

                area.select();


                document.execCommand(
                    "copy"
                );


                area.remove();

            }


            mostrarMensagemTemporaria(
                "Chave Pix copiada."
            );

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoPagamento: " +
                "erro ao copiar Pix.",
                erro
            );

        }

    }


    /* =========================================================
       MODAL CARTÃO
       ========================================================= */

    function obterModalCartao() {

        return obterElemento(
            "modalCartao",
            "cartaoModal",
            "modalPagamentoCartao"
        );

    }


    function exibirModalCartao() {

        const modal =
            obterModalCartao();


        if (!modal) {

            console.warn(
                "MusicalWorldContratacaoPagamento: " +
                "modal de cartão não encontrado."
            );

            return;

        }


        fecharModal();


        UI.modalAtual =
            modal;


        modal.classList.add(
            "aberto"
        );


        modal.classList.add(
            "active"
        );


        modal.classList.remove(
            "hidden"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        setTimeout(
            function () {

                focarCampoCartao();

            },
            50
        );

    }


    function focarCampoCartao() {

        const campo =
            obterElemento(
                "numeroCartao",
                "cardNumber",
                "cartaoNumero"
            );


        if (campo) {

            campo.focus();

        }

    }


    /* =========================================================
       FECHAR MODAL
       ========================================================= */

    function fecharModal() {

        const modal =
            UI.modalAtual;


        if (modal) {

            modal.classList.remove(
                "aberto"
            );


            modal.classList.remove(
                "active"
            );


            modal.classList.add(
                "hidden"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        document
            .querySelectorAll(
                ".modal-overlay, .modal"
            )
            .forEach(
                function (elemento) {

                    elemento.classList.remove(
                        "aberto"
                    );


                    elemento.classList.remove(
                        "active"
                    );


                    elemento.classList.add(
                        "hidden"
                    );


                    elemento.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }
            );


        UI.modalAtual =
            null;

    }


    /* =========================================================
       CARTÃO — FORMATAÇÃO
       ========================================================= */

    function formatarNumeroCartao(valor) {

        return valor

            .replace(
                /\D/g,
                ""
            )

            .slice(
                0,
                16
            )

            .replace(
                /(\d{4})(?=\d)/g,
                "$1 "
            );

    }


    function formatarValidadeCartao(valor) {

        const numeros =
            valor

                .replace(
                    /\D/g,
                    ""
                )

                .slice(
                    0,
                    4
                );


        if (
            numeros.length <= 2
        ) {

            return numeros;

        }


        return (

            numeros.slice(
                0,
                2
            ) +

            "/" +

            numeros.slice(
                2
            )

        );

    }


    function formatarCVV(valor) {

        return valor

            .replace(
                /\D/g,
                ""
            )

            .slice(
                0,
                4
            );

    }


    function configurarFormatacaoCartao() {

        const numero =
            obterElemento(
                "numeroCartao",
                "cardNumber",
                "cartaoNumero"
            );


        const validade =
            obterElemento(
                "validadeCartao",
                "cardExpiry",
                "cartaoValidade"
            );


        const cvv =
            obterElemento(
                "codigoCartao",
                "cvvCartao",
                "cardCvv",
                "cartaoCvv"
            );


        if (numero) {

            numero.addEventListener(
                "input",
                function () {

                    numero.value =
                        formatarNumeroCartao(
                            numero.value
                        );

                }
            );

        }


        if (validade) {

            validade.addEventListener(
                "input",
                function () {

                    validade.value =
                        formatarValidadeCartao(
                            validade.value
                        );

                }
            );

        }


        if (cvv) {

            cvv.addEventListener(
                "input",
                function () {

                    cvv.value =
                        formatarCVV(
                            cvv.value
                        );

                }
            );

        }

    }


    /* =========================================================
       CARTÃO — VALIDAÇÃO
       ========================================================= */

    function validarNumeroCartao(numero) {

        const numeros =
            String(numero || "")
                .replace(
                    /\D/g,
                    ""
                );


        if (
            numeros.length < 13 ||
            numeros.length > 19
        ) {

            return false;

        }


        let soma = 0;

        let alternar = false;


        for (
            let i =
                numeros.length - 1;

            i >= 0;

            i--
        ) {

            let digito =
                Number(
                    numeros[i]
                );


            if (alternar) {

                digito *= 2;


                if (
                    digito > 9
                ) {

                    digito -= 9;

                }

            }


            soma +=
                digito;


            alternar =
                !alternar;

        }


        return (
            soma % 10 === 0
        );

    }


    function validarValidadeCartao(validade) {

        const partes =
            String(validade || "")
                .split("/");


        if (
            partes.length !== 2
        ) {

            return false;

        }


        const mes =
            Number(
                partes[0]
            );


        const ano =
            Number(
                partes[1]
            );


        if (
            !Number.isInteger(mes) ||
            mes < 1 ||
            mes > 12
        ) {

            return false;

        }


        if (
            !Number.isInteger(ano)
        ) {

            return false;

        }


        const agora =
            new Date();


        const anoAtual =
            agora.getFullYear() % 100;


        const mesAtual =
            agora.getMonth() + 1;


        if (
            ano < anoAtual
        ) {

            return false;

        }


        if (
            ano === anoAtual &&
            mes < mesAtual
        ) {

            return false;

        }


        return true;

    }


    function validarDadosCartao() {

        const numero =
            obterElemento(
                "numeroCartao",
                "cardNumber",
                "cartaoNumero"
            );


        const validade =
            obterElemento(
                "validadeCartao",
                "cardExpiry",
                "cartaoValidade"
            );


        const cvv =
            obterElemento(
                "codigoCartao",
                "cvvCartao",
                "cardCvv",
                "cartaoCvv"
            );


        const nome =
            obterElemento(
                "nomeCartao",
                "cardName",
                "cartaoNome"
            );


        if (!numero) {

            return true;

        }


        const numeroValor =
            numero.value.trim();


        if (
            !validarNumeroCartao(
                numeroValor
            )
        ) {

            mostrarMensagemTemporaria(
                "Informe um número de cartão válido."
            );


            numero.focus();


            return false;

        }


        if (
            validade &&
            !validarValidadeCartao(
                validade.value
            )
        ) {

            mostrarMensagemTemporaria(
                "Informe uma validade válida."
            );


            validade.focus();


            return false;

        }


        if (
            cvv &&
            cvv.value
                .replace(
                    /\D/g,
                    ""
                )
                .length < 3
        ) {

            mostrarMensagemTemporaria(
                "Informe o código de segurança do cartão."
            );


            cvv.focus();


            return false;

        }


        if (
            nome &&
            !nome.value.trim()
        ) {

            mostrarMensagemTemporaria(
                "Informe o nome impresso no cartão."
            );


            nome.focus();


            return false;

        }


        return true;

    }


    /* =========================================================
       PREPARAR DADOS DA CONTRATAÇÃO
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
                UI.metodoPagamento,

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
       CRIAR CONTRATAÇÃO NO SUPABASE

       Antes de criar:

       1. Verifica se existe contratacaoId no estado.
       2. Consulta o banco para confirmar se ele ainda existe.
       3. Se existir, reutiliza a contratação.
       4. Se não existir, cria uma nova.
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


        /*
         * -----------------------------------------------------
         * PROTEÇÃO CONTRA ID ANTIGO OU DUPLICIDADE
         * -----------------------------------------------------
         *
         * Nunca mais confiamos apenas no valor armazenado no
         * sessionStorage/estado central.
         *
         * O ID é validado diretamente no banco.
         */

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


        /*
         * Recupera o usuário autenticado diretamente do
         * Supabase.
         */

        const usuario =
            await obterUsuarioAutenticado();


        /*
         * O estado pode ter sido atualizado durante a validação
         * do ID antigo.
         */

        const estadoAtual =
            obterEstado() ||
            estado;


        estadoCentral =
            estadoAtual;


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


        /*
         * Insere a nova contratação.
         */

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
       CRIAR NOTIFICAÇÃO — NOVA SOLICITAÇÃO DE CONTRATAÇÃO
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


        const titulo =
            "Nova solicitação de contratação";


        const mensagem =
            `${nomeContratante} enviou uma solicitação de contratação para você.`;


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
                        titulo,

                    mensagem:
                        mensagem,

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
                        UI.metodoPagamento,

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

        }


        return sucesso;

    }


    /* =========================================================
       PROCESSAMENTO DO PAGAMENTO

       Fluxo:

       validação
           ↓
       verificar ID existente no banco
           ↓
       pagamento processando
           ↓
       simulação
           ↓
       pagamento pago
           ↓
       criar contratação
           ↓
       criar notificação
           ↓
       salvar ID
           ↓
       sucesso
       ========================================================= */

    async function processarPagamento() {

        if (
            UI.processando ||
            UI.salvandoContratacao
        ) {

            return;

        }


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


        if (
            !estadoCentral.dataEvento
        ) {

            mostrarMensagemTemporaria(
                "A data do evento não foi identificada."
            );

            return;

        }


        if (
            UI.metodoPagamento !== "pix" &&
            UI.metodoPagamento !== "cartao"
        ) {

            mostrarMensagemTemporaria(
                "Selecione uma forma de pagamento."
            );

            return;

        }


        if (
            UI.metodoPagamento ===
            "cartao"
        ) {

            if (
                !validarDadosCartao()
            ) {

                return;

            }

        }


        UI.processando =
            true;


        UI.salvandoContratacao =
            true;


        atualizarBotaoContinuar();


        try {

            /*
             * -------------------------------------------------
             * PRIMEIRO PASSO:
             * Verificar se o contratacaoId salvo no estado
             * ainda existe no banco.
             *
             * Se existir:
             *     não cria duplicidade e vai para sucesso.
             *
             * Se não existir:
             *     o ID antigo é removido e o fluxo continua
             *     normalmente para criar uma nova contratação.
             * -------------------------------------------------
             */

            const contratacaoExistente =
                await verificarContratacaoExistente();


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


            /*
             * -------------------------------------------------
             * ETAPA 1
             * Marca o pagamento como processando.
             * -------------------------------------------------
             */

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
                            UI.metodoPagamento,

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


            /*
             * -------------------------------------------------
             * ETAPA 2
             * Simula o processamento do pagamento.
             * -------------------------------------------------
             */

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


            /*
             * -------------------------------------------------
             * ETAPA 3
             * Gera identificação temporária do pagamento.
             * -------------------------------------------------
             */

            const idTransacao =
                pagamentoAnterior.idTransacao ||
                gerarIdentificadorTemporario();


            /*
             * -------------------------------------------------
             * ETAPA 4
             * Registra pagamento como pago no estado central.
             * -------------------------------------------------
             */

            const salvoPago =
                salvarEstado({

                    pagamento: {

                        ...(estadoCentral.pagamento || {}),

                        metodo:
                            UI.metodoPagamento,

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


            /*
             * -------------------------------------------------
             * ETAPA 5
             * CRIA A CONTRATAÇÃO REAL NO SUPABASE.
             * -------------------------------------------------
             */

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


            /*
             * -------------------------------------------------
             * ETAPA 6
             * CRIA A NOTIFICAÇÃO PARA O ARTISTA.
             * -------------------------------------------------
             */

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


            /*
             * -------------------------------------------------
             * ETAPA 7
             * Salva o ID retornado pelo Supabase no estado.
             * -------------------------------------------------
             */

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


            /*
             * -------------------------------------------------
             * ETAPA 8
             * Redireciona somente depois que o banco confirmou
             * a criação da contratação.
             * -------------------------------------------------
             */

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
                        UI.metodoPagamento
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


            atualizarBotaoContinuar();

        }

    }


    /* =========================================================
       SIMULAÇÃO TEMPORÁRIA DO PAGAMENTO
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
       IDENTIFICADOR TEMPORÁRIO DO PAGAMENTO
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
       NAVEGAÇÃO — VOLTAR
       ========================================================= */

    function voltar() {

        if (UI.processando) {

            return;

        }


        if (
            UI.metodoPagamento
        ) {

            salvarPagamentoParcial();

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
         * Não permitimos que uma contratação já criada seja
         * simplesmente apagada pelo botão cancelar.
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


        /*
         * Retorna para o perfil do artista.
         */

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
       MENSAGEM TEMPORÁRIA
       ========================================================= */

    function mostrarMensagemTemporaria(
        mensagem
    ) {

        const existente =
            document.querySelector(
                ".mw-pagamento-mensagem"
            );


        if (existente) {

            existente.remove();

        }


        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "mw-pagamento-mensagem";


        elemento.textContent =
            mensagem;


        elemento.style.position =
            "fixed";


        elemento.style.left =
            "50%";


        elemento.style.bottom =
            "24px";


        elemento.style.transform =
            "translateX(-50%)";


        elemento.style.zIndex =
            "99999";


        elemento.style.padding =
            "12px 18px";


        elemento.style.borderRadius =
            "10px";


        elemento.style.background =
            "#172033";


        elemento.style.color =
            "#ffffff";


        elemento.style.fontSize =
            "14px";


        elemento.style.fontWeight =
            "500";


        elemento.style.boxShadow =
            "0 8px 24px rgba(0, 0, 0, 0.18)";


        elemento.style.maxWidth =
            "calc(100vw - 32px)";


        elemento.style.textAlign =
            "center";


        elemento.style.lineHeight =
            "1.45";


        document.body.appendChild(
            elemento
        );


        setTimeout(
            function () {

                if (
                    elemento &&
                    elemento.parentNode
                ) {

                    elemento.remove();

                }

            },
            3500
        );

    }


    /* =========================================================
       EVENTOS DOS BOTÕES
       ========================================================= */

    function configurarEventosPagamento() {

        document
            .querySelectorAll(
                "[data-metodo-pagamento]"
            )
            .forEach(
                function (elemento) {

                    elemento.addEventListener(
                        "click",
                        function (evento) {

                            if (
                                evento &&
                                typeof evento.preventDefault ===
                                "function"
                            ) {

                                evento.preventDefault();

                            }


                            selecionarMetodoPagamento(
                                elemento.dataset.metodoPagamento
                            );

                        }
                    );

                }
            );


        const btnPix =
            obterElemento(
                "btnPix",
                "metodoPix",
                "paymentPix"
            );


        if (btnPix) {

            btnPix.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento &&
                        typeof evento.preventDefault ===
                        "function"
                    ) {

                        evento.preventDefault();

                    }


                    selecionarMetodoPagamento(
                        "pix"
                    );

                }
            );

        }


        const btnCartao =
            obterElemento(
                "btnCartao",
                "metodoCartao",
                "paymentCard",
                "pagamentoCartao"
            );


        if (btnCartao) {

            btnCartao.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento &&
                        typeof evento.preventDefault ===
                        "function"
                    ) {

                        evento.preventDefault();

                    }


                    selecionarMetodoPagamento(
                        "cartao"
                    );

                }
            );

        }


        const btnContinuar =
            obterElemento(
                "btnContinuar",
                "btnAbrirPagamento",
                "btnPagar",
                "btnFinalizarPagamento",
                "continuarPagamento",
                "finalizarPagamento"
            );


        if (btnContinuar) {

            btnContinuar.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento &&
                        typeof evento.preventDefault ===
                        "function"
                    ) {

                        evento.preventDefault();

                    }


                    abrirPagamento();

                }
            );

        }


        const btnPagarCartao =
            obterElemento(
                "btnPagarCartao"
            );


        if (btnPagarCartao) {

            btnPagarCartao.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento &&
                        typeof evento.preventDefault ===
                        "function"
                    ) {

                        evento.preventDefault();

                    }


                    processarPagamento();

                }
            );

        }


        const btnSimularPix =
            obterElemento(
                "btnSimularPix"
            );


        if (btnSimularPix) {

            btnSimularPix.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento &&
                        typeof evento.preventDefault ===
                        "function"
                    ) {

                        evento.preventDefault();

                    }


                    processarPagamento();

                }
            );

        }


        const btnVoltar =
            obterElemento(
                "btnVoltar",
                "btnAnterior",
                "voltarPagamento"
            );


        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                function () {

                    voltar();

                }
            );

        }


        const btnCancelar =
            obterElemento(
                "btnCancelarContratacao",
                "btnCancelar",
                "cancelarPagamento",
                "btnCancel"
            );


        if (btnCancelar) {

            btnCancelar.addEventListener(
                "click",
                function () {

                    cancelarContratacao();

                }
            );

        }


        document
            .querySelectorAll(
                "[data-fechar-modal], " +
                ".fechar-modal, " +
                ".modal-close, " +
                ".btn-fechar-modal"
            )
            .forEach(
                function (elemento) {

                    elemento.addEventListener(
                        "click",
                        function () {

                            fecharModal();

                        }
                    );

                }
            );


        const btnCopiarPix =
            obterElemento(
                "btnCopiarPix",
                "copiarPix",
                "copyPix"
            );


        if (btnCopiarPix) {

            btnCopiarPix.addEventListener(
                "click",
                function () {

                    copiarPix();

                }
            );

        }


        document
            .querySelectorAll(
                ".modal-overlay, .modal"
            )
            .forEach(
                function (modal) {

                    modal.addEventListener(
                        "click",
                        function (evento) {

                            if (
                                evento.target ===
                                modal
                            ) {

                                fecharModal();

                            }

                        }
                    );

                }
            );


        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key ===
                    "Escape"
                ) {

                    fecharModal();

                }

            }
        );

    }


    /* =========================================================
       CARREGAMENTO DO ESTADO CENTRAL
       ========================================================= */

    function carregarEstadoCentral() {

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
             * A Etapa 6 nunca reseta o estado.
             */

            definirEtapa(
                CONFIG.etapaAtual
            );


            estadoCentral =
                obterEstado();


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
       INICIALIZAÇÃO
       ========================================================= */

    function inicializar() {

        try {

            carregarEstadoCentral();


            renderizarArtista();


            renderizarServico();


            renderizarResumoPagamento();


            restaurarMetodoPagamento();


            configurarFormatacaoCartao();


            configurarEventosPagamento();


            atualizarBotaoContinuar();


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

        selecionarMetodoPagamento,

        processarPagamento,

        voltar,

        cancelarContratacao,

        fecharModal,

        copiarPix,

        validarDadosCartao

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

