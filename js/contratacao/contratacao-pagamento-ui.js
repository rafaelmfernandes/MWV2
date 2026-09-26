(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — INTERFACE DA ETAPA 6: PAGAMENTO

       Arquivo:
       js/contratacao/contratacao-pagamento-ui.js

       Responsabilidades:
       ---------------------------------------------------------
       - Controlar a interface da etapa de pagamento.
       - Renderizar artista, serviço e valores.
       - Controlar seleção de Pix/cartão.
       - Controlar abertura e fechamento dos modais.
       - Copiar chave Pix.
       - Formatar campos de cartão.
       - Validar dados do cartão.
       - Exibir mensagens temporárias.
       - Registrar eventos visuais da página.

       IMPORTANTE:
       ---------------------------------------------------------
       Este arquivo NÃO cria contratações no Supabase.

       Este arquivo NÃO controla o fluxo específico de
       oportunidades.

       Este arquivo trabalha sobre o estado fornecido pelo
       controlador principal:

       js/contratacao/contratacao-pagamento.js
       ========================================================= */


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
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        moeda: "BRL",

        etapaAtual: 6

    };


    /* =========================================================
       ESTADO CENTRAL
       ========================================================= */

    let estadoCentral = null;


    /* =========================================================
       RECEBER ESTADO DO CONTROLADOR
       ========================================================= */

    function definirEstado(estado) {

        estadoCentral =
            estado || null;

    }


    function obterEstado() {

        return estadoCentral;

    }


    /* =========================================================
       RECEBER ESTADO DE PROCESSAMENTO
       ========================================================= */

    function definirProcessando(valor) {

        UI.processando =
            Boolean(valor);

        atualizarBotaoContinuar();

    }


    function definirSalvandoContratacao(valor) {

        UI.salvandoContratacao =
            Boolean(valor);

        atualizarBotaoContinuar();

    }


    /* =========================================================
       UTILITÁRIOS
       ========================================================= */

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
                                "MusicalWorldContratacaoPagamentoUI: " +
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
                "MusicalWorldContratacaoPagamentoUI: " +
                "elemento #artistaAvatar não foi encontrado."
            );

        }


        console.log(
            "MusicalWorldContratacaoPagamentoUI: dados do artista:",
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
       MÉTODO DE PAGAMENTO
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


    function salvarPagamentoParcial() {

        if (!estadoCentral) {

            return false;

        }


        const controlador =
            window.MusicalWorldContratacaoPagamento;


        if (
            !controlador ||
            typeof controlador.salvarPagamentoParcial !==
            "function"
        ) {

            /*
             * O controlador principal fornece a persistência.
             * Caso ainda não esteja disponível, apenas mantemos
             * o método localmente.
             */

            return true;

        }


        return controlador.salvarPagamentoParcial(
            UI.metodoPagamento
        );

    }


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
            UI.processando ||
            UI.salvandoContratacao;


        botao.classList.toggle(
            "disabled",
            !habilitado ||
            UI.processando ||
            UI.salvandoContratacao
        );

    }


    function abrirPagamento() {

        if (
            UI.processando ||
            UI.salvandoContratacao
        ) {

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
                "MusicalWorldContratacaoPagamentoUI: " +
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
                "MusicalWorldContratacaoPagamentoUI: " +
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
                "MusicalWorldContratacaoPagamentoUI: " +
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
                "MusicalWorldContratacaoPagamentoUI: " +
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
       EVENTOS DA INTERFACE
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


                    const controlador =
                        window.MusicalWorldContratacaoPagamento;


                    if (
                        controlador &&
                        typeof controlador.processarPagamento ===
                        "function"
                    ) {

                        controlador.processarPagamento();

                    }

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


                    const controlador =
                        window.MusicalWorldContratacaoPagamento;


                    if (
                        controlador &&
                        typeof controlador.processarPagamento ===
                        "function"
                    ) {

                        controlador.processarPagamento();

                    }

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

                    const controlador =
                        window.MusicalWorldContratacaoPagamento;


                    if (
                        controlador &&
                        typeof controlador.voltar ===
                        "function"
                    ) {

                        controlador.voltar();

                    }

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

                    const controlador =
                        window.MusicalWorldContratacaoPagamento;


                    if (
                        controlador &&
                        typeof controlador.cancelarContratacao ===
                        "function"
                    ) {

                        controlador.cancelarContratacao();

                    }

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
       API PÚBLICA
       ========================================================= */

    const API = {

        definirEstado,

        obterEstado,

        definirProcessando,

        definirSalvandoContratacao,

        renderizarArtista,

        renderizarServico,

        renderizarResumoPagamento,

        restaurarMetodoPagamento,

        obterBotoesPagamento,

        atualizarInterfaceMetodoPagamento,

        selecionarMetodoPagamento,

        /*
         * Retorna o método atualmente selecionado na interface.
         *
         * O controlador principal utiliza esta função para
         * sincronizar o método de pagamento antes de processar
         * a contratação.
         */
        obterMetodoPagamento:
            function () {

                return UI.metodoPagamento;

            },

        salvarPagamentoParcial,

        atualizarBotaoContinuar,

        abrirPagamento,

        exibirModalPix,

        preencherPix,

        copiarPix,

        exibirModalCartao,

        fecharModal,

        configurarFormatacaoCartao,

        validarDadosCartao,

        configurarEventosPagamento,

        mostrarMensagemTemporaria,

        formatarMoeda,

        obterValorServico,

        obterElemento,

        obterNomeArtista,

        obterTipoArtista,

        obterLocalizacaoArtista,

        obterFotoArtista

    };


    window.MusicalWorldContratacaoPagamentoUI =
        API;


})(window);