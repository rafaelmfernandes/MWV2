/* =========================================================
   MUSICALWORLD — ETAPA 6: PAGAMENTO

   Responsabilidade deste arquivo:

   - Carregar os dados da contratação.
   - Exibir artista e serviço.
   - Controlar a escolha entre Pix e cartão.
   - Abrir e fechar os modais.
   - Validar os campos do cartão.
   - Preparar a estrutura para o Mercado Pago.
   - Registrar temporariamente o estado da contratação.

   IMPORTANTE:

   Neste momento o pagamento é apenas uma simulação visual.

   Nenhum pagamento real é realizado.

   Quando o Mercado Pago for integrado, os pontos de
   simulação deste arquivo serão substituídos pela criação
   e confirmação real do pagamento.
   ========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        paginas: {

            anterior:
                "contratacao-revisao.html",

            sucesso:
                "contratacao-sucesso.html",

            cancelar:
                "contratacao.html"

        },

        armazenamento: {

            chave:
                "musicalworld_contratacao"

        },

        seletores: {

            artistaAvatar:
                "artistaAvatar",

            artistaNome:
                "artistaNome",

            artistaTipo:
                "artistaTipo",

            servicoNome:
                "servicoNome",

            valorTotal:
                "valorTotal",

            pixValor:
                "pixValor",

            pixCodigo:
                "pixCodigo",

            pixMensagemCopiado:
                "pixMensagemCopiado",

            numeroCartao:
                "numeroCartao",

            nomeCartao:
                "nomeCartao",

            validadeCartao:
                "validadeCartao",

            codigoCartao:
                "codigoCartao",

            btnVoltar:
                "btnVoltar",

            btnAbrirPagamento:
                "btnAbrirPagamento",

            btnCancelar:
                "btnCancelarContratacao",

            btnCopiarPix:
                "btnCopiarPix",

            btnSimularPix:
                "btnSimularPix",

            formPagamentoCartao:
                "formPagamentoCartao",

            modalPix:
                "modalPix",

            modalCartao:
                "modalCartao",

            modalProcessando:
                "modalProcessando"

        }

    };


    /* =========================================================
       ESTADO
       ========================================================= */

    const estado = {

        metodoPagamento:
            "pix",

        modalAtual:
            null,

        processando:
            false,

        dados: null,

        pagamento: {

            status:
                "aguardando_pagamento",

            metodo:
                null,

            confirmado:
                false

        }

    };


    /* =========================================================
       DADOS DE DEMONSTRAÇÃO
       ========================================================= */

    const dadosDemonstracao = {

        artista: {

            nome:
                "Rafael Melo",

            tipo:
                "Cantor(a)",

            localizacao:
                "Goiânia, GO",

            iniciais:
                "RM",

            fotoUrl:
                null

        },

        servico: {

            nome:
                "Show acústico",

            valor:
                800,

            descricao:
                "Apresentação acústica com voz e violão para eventos, festas e confraternizações.",

            duracao:
                "2 horas",

            localizacao:
                "Goiânia e região"

        },

        data:
            null,

        horarioInicio:
            null,

        horarioFim:
            null,

        horarioChegada:
            null,

        local:
            null,

        tipoEvento:
            null,

        quantidadePessoas:
            null,

        nomeEvento:
            null,

        estrutura:
            [],

        observacoes:
            null

    };


    /* =========================================================
       OBTÉM ELEMENTO
       ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =========================================================
       FORMATA MOEDA
       ========================================================= */

    function formatarMoeda(valor) {

        const numero =
            Number(valor) || 0;

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
       CARREGA DADOS DA CONTRATAÇÃO
       ========================================================= */

    function carregarDados() {

        let dadosSalvos = null;

        try {

            const armazenamento =
                sessionStorage.getItem(
                    CONFIG.armazenamento.chave
                );

            if (armazenamento) {

                dadosSalvos =
                    JSON.parse(armazenamento);

            }

        } catch (erro) {

            console.warn(
                "MusicalWorld Pagamento: não foi possível ler o sessionStorage.",
                erro
            );

        }


        estado.dados = {

            ...dadosDemonstracao,

            ...(dadosSalvos || {}),

            artista: {

                ...dadosDemonstracao.artista,

                ...(
                    dadosSalvos &&
                    dadosSalvos.artista
                        ? dadosSalvos.artista
                        : {}
                )

            },

            servico: {

                ...dadosDemonstracao.servico,

                ...(
                    dadosSalvos &&
                    dadosSalvos.servico
                        ? dadosSalvos.servico
                        : {}
                )

            }

        };

    }


    /* =========================================================
       SALVA ESTADO
       ========================================================= */

    function salvarEstado() {

        if (!estado.dados) {
            return;
        }


        const dadosParaSalvar = {

            ...estado.dados,

            pagamento: {

                metodo:
                    estado.pagamento.metodo,

                status:
                    estado.pagamento.status,

                confirmado:
                    estado.pagamento.confirmado

            }

        };


        try {

            sessionStorage.setItem(

                CONFIG.armazenamento.chave,

                JSON.stringify(
                    dadosParaSalvar
                )

            );

        } catch (erro) {

            console.warn(
                "MusicalWorld Pagamento: não foi possível salvar a contratação.",
                erro
            );

        }

    }


    /* =========================================================
       RENDERIZA ARTISTA
       ========================================================= */

    function renderizarArtista() {

        const artista =
            estado.dados.artista;


        const avatar =
            obterElemento(
                CONFIG.seletores.artistaAvatar
            );

        const nome =
            obterElemento(
                CONFIG.seletores.artistaNome
            );

        const tipo =
            obterElemento(
                CONFIG.seletores.artistaTipo
            );


        if (nome) {

            nome.textContent =
                artista.nome ||
                "Artista";

        }


        if (tipo) {

            tipo.textContent =
                artista.tipo ||
                "Artista";

        }


        if (!avatar) {
            return;
        }


        if (artista.fotoUrl) {

            avatar.innerHTML = "";

            const imagem =
                document.createElement(
                    "img"
                );

            imagem.src =
                artista.fotoUrl;

            imagem.alt =
                artista.nome ||
                "Artista";

            avatar.appendChild(
                imagem
            );

        } else {

            avatar.textContent =
                artista.iniciais ||
                obterIniciais(
                    artista.nome
                );

        }

    }


    /* =========================================================
       OBTÉM INICIAIS
       ========================================================= */

    function obterIniciais(nome) {

        if (!nome) {
            return "MW";
        }


        return nome
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(function (parte) {

                return parte
                    .charAt(0)
                    .toUpperCase();

            })
            .join("");

    }


    /* =========================================================
       RENDERIZA SERVIÇO
       ========================================================= */

    function renderizarServico() {

        const servico =
            estado.dados.servico;


        const nome =
            obterElemento(
                CONFIG.seletores.servicoNome
            );

        const valor =
            obterElemento(
                CONFIG.seletores.valorTotal
            );

        const pixValor =
            obterElemento(
                CONFIG.seletores.pixValor
            );


        if (nome) {

            nome.textContent =
                servico.nome ||
                "Serviço";

        }


        const valorFormatado =
            formatarMoeda(
                servico.valor
            );


        if (valor) {

            valor.textContent =
                valorFormatado;

        }


        if (pixValor) {

            pixValor.textContent =
                valorFormatado;

        }

    }


    /* =========================================================
       SELECIONA MÉTODO
       ========================================================= */

    function selecionarMetodo(metodo) {

        if (
            metodo !== "pix" &&
            metodo !== "cartao"
        ) {

            return;

        }


        estado.metodoPagamento =
            metodo;


        const botoes =
            document.querySelectorAll(
                ".metodo-pagamento"
            );


        botoes.forEach(
            function (botao) {

                const metodoBotao =
                    botao.dataset.metodo;


                botao.setAttribute(
                    "aria-pressed",
                    metodoBotao === metodo
                        ? "true"
                        : "false"
                );

            }
        );

    }


    /* =========================================================
       ABRE MODAL
       ========================================================= */

    function abrirModal(metodo) {

        fecharTodosModais();


        const id =
            metodo === "pix"
                ? CONFIG.seletores.modalPix
                : CONFIG.seletores.modalCartao;


        const modal =
            obterElemento(id);


        if (!modal) {
            return;
        }


        estado.modalAtual =
            metodo;


        modal.classList.add(
            "aberto"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        const primeiroCampo =
            modal.querySelector(
                "input"
            );


        if (primeiroCampo) {

            window.setTimeout(
                function () {

                    primeiroCampo.focus();

                },
                220
            );

        }

    }


    /* =========================================================
       FECHA MODAL
       ========================================================= */

    function fecharModal(metodo) {

        const id =
            metodo === "pix"
                ? CONFIG.seletores.modalPix
                : CONFIG.seletores.modalCartao;


        const modal =
            obterElemento(id);


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "aberto"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        estado.modalAtual =
            null;


        if (
            !document.querySelector(
                ".modal-overlay.aberto"
            )
        ) {

            document.body.style.overflow =
                "";

        }

    }


    /* =========================================================
       FECHA TODOS OS MODAIS
       ========================================================= */

    function fecharTodosModais() {

        document
            .querySelectorAll(
                ".modal-overlay"
            )
            .forEach(
                function (modal) {

                    modal.classList.remove(
                        "aberto"
                    );

                    modal.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }
            );


        document.body.style.overflow =
            "";

        estado.modalAtual =
            null;

    }


    /* =========================================================
       ABRE O MÉTODO SELECIONADO
       ========================================================= */

    function abrirPagamento() {

        selecionarMetodo(
            estado.metodoPagamento
        );


        abrirModal(
            estado.metodoPagamento
        );

    }


    /* =========================================================
       FORMATA NÚMERO DO CARTÃO
       ========================================================= */

    function formatarNumeroCartao(valor) {

        return valor
            .replace(/\D/g, "")
            .slice(0, 16)
            .replace(
                /(\d{4})(?=\d)/g,
                "$1 "
            );

    }


    /* =========================================================
       FORMATA VALIDADE
       ========================================================= */

    function formatarValidade(valor) {

        const numeros =
            valor
                .replace(/\D/g, "")
                .slice(0, 4);


        if (
            numeros.length <= 2
        ) {

            return numeros;

        }


        return (
            numeros.slice(0, 2) +
            "/" +
            numeros.slice(2)
        );

    }


    /* =========================================================
       FORMATA CVV
       ========================================================= */

    function formatarCodigoCartao(valor) {

        return valor
            .replace(/\D/g, "")
            .slice(0, 4);

    }


    /* =========================================================
       VALIDA CARTÃO
       ========================================================= */

    function validarCartao() {

        let valido = true;


        const numero =
            obterElemento(
                CONFIG.seletores.numeroCartao
            );

        const nome =
            obterElemento(
                CONFIG.seletores.nomeCartao
            );

        const validade =
            obterElemento(
                CONFIG.seletores.validadeCartao
            );

        const codigo =
            obterElemento(
                CONFIG.seletores.codigoCartao
            );


        limparErros();


        const numeroLimpo =
            numero.value.replace(
                /\D/g,
                ""
            );


        if (
            numeroLimpo.length < 13
        ) {

            mostrarErro(
                numero,
                "erroNumeroCartao",
                "Informe um número de cartão válido."
            );

            valido = false;

        }


        if (
            nome.value.trim().length < 3
        ) {

            mostrarErro(
                nome,
                "erroNomeCartao",
                "Informe o nome do titular."
            );

            valido = false;

        }


        const validadeValor =
            validade.value.trim();


        if (
            !/^\d{2}\/\d{2}$/.test(
                validadeValor
            )
        ) {

            mostrarErro(
                validade,
                "erroValidadeCartao",
                "Informe a validade no formato MM/AA."
            );

            valido = false;

        } else {

            const partes =
                validadeValor.split("/");

            const mes =
                Number(partes[0]);


            if (
                mes < 1 ||
                mes > 12
            ) {

                mostrarErro(
                    validade,
                    "erroValidadeCartao",
                    "Informe uma validade válida."
                );

                valido = false;

            }

        }


        if (
            codigo.value.replace(
                /\D/g,
                ""
            ).length < 3
        ) {

            mostrarErro(
                codigo,
                "erroCodigoCartao",
                "Informe o código de segurança."
            );

            valido = false;

        }


        return valido;

    }


    /* =========================================================
       MOSTRA ERRO
       ========================================================= */

    function mostrarErro(
        campo,
        idErro,
        mensagem
    ) {

        if (campo) {

            campo.classList.add(
                "erro"
            );

        }


        const elementoErro =
            obterElemento(idErro);


        if (elementoErro) {

            elementoErro.textContent =
                mensagem;

        }

    }


    /* =========================================================
       LIMPA ERROS
       ========================================================= */

    function limparErros() {

        document
            .querySelectorAll(
                ".campo input"
            )
            .forEach(
                function (campo) {

                    campo.classList.remove(
                        "erro"
                    );

                }
            );


        document
            .querySelectorAll(
                ".campo-erro"
            )
            .forEach(
                function (erro) {

                    erro.textContent =
                        "";

                }
            );

    }


    /* =========================================================
       ABRE PROCESSAMENTO
       ========================================================= */

    function abrirProcessamento() {

        const modal =
            obterElemento(
                CONFIG.seletores.modalProcessando
            );


        if (!modal) {
            return;
        }


        estado.processando =
            true;


        modal.classList.add(
            "aberto"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";

    }


    /* =========================================================
       FECHA PROCESSAMENTO
       ========================================================= */

    function fecharProcessamento() {

        const modal =
            obterElemento(
                CONFIG.seletores.modalProcessando
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "aberto"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        estado.processando =
            false;

    }


    /* =========================================================
       SIMULA PAGAMENTO
       =========================================================

       IMPORTANTE:

       Esta função NÃO realiza pagamento real.

       Ela existe somente para testar o fluxo completo
       enquanto a integração com o Mercado Pago ainda não
       foi implementada.
       ========================================================= */

    function simularPagamento(metodo) {

        if (estado.processando) {
            return;
        }


        estado.pagamento = {

            metodo:
                metodo,

            status:
                "aprovado_simulacao",

            confirmado:
                true

        };


        salvarEstado();


        fecharTodosModais();


        abrirProcessamento();


        window.setTimeout(
            function () {

                finalizarFluxoSimulado();

            },
            1200
        );

    }


    /* =========================================================
       FINALIZA FLUXO SIMULADO
       ========================================================= */

    function finalizarFluxoSimulado() {

        fecharProcessamento();


        /*
         * A partir daqui o fluxo seguirá para a página
         * "contratacao-sucesso.html".
         *
         * Na integração real, esta navegação só deverá
         * acontecer depois da confirmação efetiva do
         * pagamento pelo Mercado Pago.
         */

        window.location.href =
            CONFIG.paginas.sucesso;

    }


    /* =========================================================
       COPIA PIX
       ========================================================= */

    async function copiarPix() {

        const campo =
            obterElemento(
                CONFIG.seletores.pixCodigo
            );

        const mensagem =
            obterElemento(
                CONFIG.seletores.pixMensagemCopiado
            );


        if (!campo) {
            return;
        }


        /*
         * Como o Mercado Pago ainda não está conectado,
         * não existe código Pix real neste momento.
         */

        const codigo =
            campo.value;


        if (
            codigo ===
            "Aguardando geração do pagamento"
        ) {

            if (mensagem) {

                mensagem.textContent =
                    "O código Pix real será disponibilizado após a integração com o Mercado Pago.";

            }

            return;

        }


        try {

            await navigator.clipboard.writeText(
                codigo
            );


            if (mensagem) {

                mensagem.textContent =
                    "Código Pix copiado.";

            }

        } catch (erro) {

            console.warn(
                "MusicalWorld Pagamento: não foi possível copiar o Pix.",
                erro
            );

        }

    }


    /* =========================================================
       CONFIGURA EVENTOS
       ========================================================= */

    function configurarEventos() {

        /*
         * Seleção do método.
         */

        document
            .querySelectorAll(
                ".metodo-pagamento"
            )
            .forEach(
                function (botao) {

                    botao.addEventListener(
                        "click",
                        function () {

                            selecionarMetodo(
                                botao.dataset.metodo
                            );

                        }
                    );

                }
            );


        /*
         * Botão Continuar.
         */

        const btnAbrirPagamento =
            obterElemento(
                CONFIG.seletores.btnAbrirPagamento
            );


        if (btnAbrirPagamento) {

            btnAbrirPagamento.addEventListener(
                "click",
                abrirPagamento
            );

        }


        /*
         * Botão Voltar.
         */

        const btnVoltar =
            obterElemento(
                CONFIG.seletores.btnVoltar
            );


        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.anterior;

                }
            );

        }


        /*
         * Cancelar.
         */

        const btnCancelar =
            obterElemento(
                CONFIG.seletores.btnCancelar
            );


        if (btnCancelar) {

            btnCancelar.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.cancelar;

                }
            );

        }


        /*
         * Fechamento dos modais.
         */

        document
            .querySelectorAll(
                "[data-fechar-modal]"
            )
            .forEach(
                function (botao) {

                    botao.addEventListener(
                        "click",
                        function () {

                            fecharModal(
                                botao.dataset.fecharModal
                            );

                        }
                    );

                }
            );


        /*
         * Clique fora do modal.
         */

        document
            .querySelectorAll(
                ".modal-overlay"
            )
            .forEach(
                function (overlay) {

                    overlay.addEventListener(
                        "click",
                        function (evento) {

                            if (
                                evento.target ===
                                overlay
                            ) {

                                fecharTodosModais();

                            }

                        }
                    );

                }
            );


        /*
         * Tecla ESC.
         */

        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key === "Escape" &&
                    !estado.processando
                ) {

                    fecharTodosModais();

                }

            }
        );


        /*
         * Copiar Pix.
         */

        const btnCopiarPix =
            obterElemento(
                CONFIG.seletores.btnCopiarPix
            );


        if (btnCopiarPix) {

            btnCopiarPix.addEventListener(
                "click",
                copiarPix
            );

        }


        /*
         * Simulação Pix.
         */

        const btnSimularPix =
            obterElemento(
                CONFIG.seletores.btnSimularPix
            );


        if (btnSimularPix) {

            btnSimularPix.addEventListener(
                "click",
                function () {

                    simularPagamento(
                        "pix"
                    );

                }
            );

        }


        /*
         * Formatação do cartão.
         */

        const numeroCartao =
            obterElemento(
                CONFIG.seletores.numeroCartao
            );


        if (numeroCartao) {

            numeroCartao.addEventListener(
                "input",
                function () {

                    numeroCartao.value =
                        formatarNumeroCartao(
                            numeroCartao.value
                        );

                }
            );

        }


        const validadeCartao =
            obterElemento(
                CONFIG.seletores.validadeCartao
            );


        if (validadeCartao) {

            validadeCartao.addEventListener(
                "input",
                function () {

                    validadeCartao.value =
                        formatarValidade(
                            validadeCartao.value
                        );

                }
            );

        }


        const codigoCartao =
            obterElemento(
                CONFIG.seletores.codigoCartao
            );


        if (codigoCartao) {

            codigoCartao.addEventListener(
                "input",
                function () {

                    codigoCartao.value =
                        formatarCodigoCartao(
                            codigoCartao.value
                        );

                }
            );

        }


        /*
         * Formulário do cartão.
         */

        const formulario =
            obterElemento(
                CONFIG.seletores.formPagamentoCartao
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                function (evento) {

                    evento.preventDefault();


                    if (
                        !validarCartao()
                    ) {

                        return;

                    }


                    simularPagamento(
                        "cartao"
                    );

                }
            );

        }

    }


    /* =========================================================
       LUCIDE
       ========================================================= */

    function atualizarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function inicializar() {

        carregarDados();

        renderizarArtista();

        renderizarServico();

        selecionarMetodo(
            "pix"
        );

        configurarEventos();

        atualizarIcones();


        console.log(
            "MusicalWorld Contratação Pagamento: módulo inicializado.",
            estado
        );

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.MusicalWorldContratacaoPagamento = {

        inicializar,

        abrirModal,

        fecharModal,

        selecionarMetodo,

        obterEstado:
            function () {

                return estado;

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