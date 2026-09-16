(function (window) {


"use strict";

/* =========================================================
   MUSICALWORLD — ETAPA 6: PAGAMENTO

   Arquivo:
   js/contratacao/contratacao-pagamento.js

   Responsabilidade:
   ---------------------------------------------------------
   - Exibir os dados da contratação vindos do estado central.
   - Exibir nome, tipo, localização e foto do artista.
   - Permitir escolha do método de pagamento.
   - Abrir o modal SOMENTE após clicar em Continuar.
   - Controlar Pix e cartão.
   - Validar os dados do cartão.
   - Salvar o método de pagamento no estado central.
   - Encaminhar para a tela de sucesso.
   - Não criar outro estado de contratação.

   IMPORTANTE:
   ---------------------------------------------------------
   Este arquivo NÃO utiliza mais:

   sessionStorage("musicalworld_contratacao")
   dadosDemonstracao
   estado próprio contendo os dados da contratação.

   Toda a contratação utiliza:

   MusicalWorldContratacaoEstado

   O estado central é a única fonte de verdade do fluxo.
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

    simboloMoeda: "R$"

};


/* =========================================================
   ESTADO LOCAL DA INTERFACE

   Atenção:
   ---------------------------------------------------------
   Este objeto NÃO armazena dados da contratação.

   Ele existe somente para controlar o comportamento visual
   da tela de pagamento.
   ========================================================= */

const UI = {

    metodoPagamento: "",

    modalAtual: null,

    processando: false

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


/* =========================================================
   FOTO DO ARTISTA
   ========================================================= */

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


/* =========================================================
   SELETORES
   ========================================================= */

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


    /* -----------------------------------------------------
       FOTO DO ARTISTA
       ----------------------------------------------------- */

    if (elementoFoto) {

        /*
         * Caso seja uma imagem:
         *
         * <img id="artistaAvatar">
         */

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

            /*
             * Caso seja uma DIV:
             *
             * <div id="artistaAvatar">
             */

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

   IMPORTANTE:
   ---------------------------------------------------------
   Esta função NÃO abre nenhum modal.

   O usuário pode trocar entre Pix e Cartão livremente.

   O modal somente será aberto quando o usuário clicar
   explicitamente no botão "Continuar".
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


    /*
     * Apenas registra qual método foi escolhido.
     */

    UI.metodoPagamento =
        metodo;


    /*
     * Salva a escolha no estado central.
     */

    salvarPagamentoParcial();


    /*
     * Atualiza visualmente a seleção.
     */

    atualizarInterfaceMetodoPagamento();


    /*
     * NÃO abrir modal aqui.
     *
     * O modal será aberto somente pela função:
     *
     * abrirPagamento()
     *
     * chamada pelo botão "Continuar".
     */
}


/* =========================================================
   SALVAR PAGAMENTO NO ESTADO CENTRAL
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
   CONTINUAR — ABRIR MODAL CORRESPONDENTE

   IMPORTANTE:
   ---------------------------------------------------------
   Este é o único ponto da tela responsável por decidir
   qual modal deve ser aberto.

   Pix selecionado:
   -> abre modal Pix.

   Cartão selecionado:
   -> abre modal Cartão.

   Nenhum método:
   -> exibe mensagem.
   ========================================================= */

function abrirPagamento() {

    if (UI.processando) {
        return;
    }


    /*
     * Garante que existe um método selecionado.
     */

    if (
        UI.metodoPagamento !== "pix" &&
        UI.metodoPagamento !== "cartao"
    ) {

        mostrarMensagemTemporaria(
            "Selecione uma forma de pagamento."
        );

        return;
    }


    /*
     * Atualiza o estado antes de abrir o modal.
     */

    salvarPagamentoParcial();


    /*
     * Pix.
     */

    if (
        UI.metodoPagamento === "pix"
    ) {

        exibirModalPix();

        return;
    }


    /*
     * Cartão.
     */

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


    /*
     * Fecha qualquer outro modal antes de abrir o Pix.
     */

    fecharModal();


    UI.modalAtual =
        modal;


    /*
     * A CSS atual utiliza a classe "aberto".
     * Mantemos também "active" para compatibilidade.
     */

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


    /*
     * Fecha qualquer outro modal antes de abrir o cartão.
     */

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


    /*
     * Coloca o foco no número do cartão depois que
     * o modal estiver visível.
     */

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
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(
            /(\d{4})(?=\d)/g,
            "$1 "
        );
}


function formatarValidadeCartao(valor) {

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


function formatarCVV(valor) {

    return valor
        .replace(/\D/g, "")
        .slice(0, 4);
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
            .replace(/\D/g, "");


    if (
        numeros.length < 13 ||
        numeros.length > 19
    ) {

        return false;
    }


    let soma = 0;

    let alternar = false;


    for (
        let i = numeros.length - 1;
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
            .replace(/\D/g, "")
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
   PROCESSAMENTO DO PAGAMENTO
   ========================================================= */

async function processarPagamento() {

    if (UI.processando) {
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
        !estadoCentral.servico ||
        !estadoCentral.servico.id
    ) {

        mostrarMensagemTemporaria(
            "O serviço da contratação não foi identificado."
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


    atualizarBotaoContinuar();


    try {

        const valor =
            obterValorServico(
                estadoCentral
            );


        const pagamentoAnterior =
            estadoCentral.pagamento ||
            {};


        const salvo =
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


        if (!salvo) {

            throw new Error(
                "Não foi possível salvar o pagamento no estado central."
            );
        }


        estadoCentral =
            obterEstado();


        await simularProcessamentoPagamento();


        const estadoAtualizado =
            obterEstado();


        if (!estadoAtualizado) {

            throw new Error(
                "Não foi possível recuperar o estado após o pagamento."
            );
        }


        salvarEstado({

            pagamento: {

                ...(estadoAtualizado.pagamento || {}),

                metodo:
                    UI.metodoPagamento,

                valor:
                    Number.isFinite(valor)
                        ? valor
                        : null,

                status:
                    "aprovado",

                idTransacao:
                    gerarIdentificadorTemporario()
            },

            etapaAtual:
                CONFIG.etapaAtual
        });


        window.location.href =
            CONFIG.paginaSucesso;


    } catch (erro) {

        console.error(
            "MusicalWorldContratacaoPagamento: " +
            "erro ao processar pagamento.",
            erro
        );


        mostrarMensagemTemporaria(
            "Não foi possível processar o pagamento. Tente novamente."
        );


    } finally {

        UI.processando =
            false;


        atualizarBotaoContinuar();
    }
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


function gerarIdentificadorTemporario() {

    return (
        "TEMP-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
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


    /*
     * -----------------------------------------------------
     * IMPORTANTE
     * -----------------------------------------------------
     * O perfilId precisa ser capturado ANTES de limpar
     * o estado central.
     *
     * O ApresentarPerfil.js espera receber:
     *
     * apresentar-perfil.html?id=...
     *
     * Portanto, não podemos simplesmente limpar o estado
     * e redirecionar sem informar qual perfil estava sendo
     * visualizado.
     * -----------------------------------------------------
     */

    const gerenciador =
        obterGerenciadorEstado();


    let perfilId =
        null;


    /*
     * Recupera o perfilId do estado central.
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
     * -----------------------------------------------------
     * LIMPA A CONTRATAÇÃO
     * -----------------------------------------------------
     *
     * Somente depois de capturar o perfilId.
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
     * -----------------------------------------------------
     * RETORNA PARA O PERFIL DO ARTISTA
     * -----------------------------------------------------
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


    /*
     * Fallback:
     * caso, por algum motivo, o perfilId não exista.
     */

    window.location.href =
        CONFIG.paginaCancelar;
}

/* =========================================================
   MENSAGEM TEMPORÁRIA
   ========================================================= */

function mostrarMensagemTemporaria(mensagem) {

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
        3000
    );
}


/* =========================================================
   EVENTOS DOS BOTÕES
   ========================================================= */

function configurarEventosPagamento() {

    /*
     * -----------------------------------------------------
     * MÉTODOS DE PAGAMENTO
     * -----------------------------------------------------
     *
     * Clicar em Pix ou Cartão NÃO abre modal.
     *
     * Apenas seleciona o método.
     */

    document
        .querySelectorAll(
            "[data-metodo-pagamento]"
        )
        .forEach(
            function (elemento) {

                elemento.addEventListener(
                    "click",
                    function (evento) {

                        /*
                         * Evita que um botão dentro de formulário
                         * provoque submit inesperado.
                         */

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


    /*
     * -----------------------------------------------------
     * BOTÃO PIX
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * BOTÃO CARTÃO
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * BOTÃO CONTINUAR
     * -----------------------------------------------------
     *
     * Somente este botão abre o modal.
     */

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


    /*
     * -----------------------------------------------------
     * BOTÃO PAGAR CARTÃO
     * -----------------------------------------------------
     *
     * Esse botão existe dentro do modal.
     *
     * Aqui sim o pagamento é processado.
     */

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


    /*
     * -----------------------------------------------------
     * BOTÃO SIMULAR PIX
     * -----------------------------------------------------
     *
     * Esse botão existe dentro do modal Pix.
     *
     * Aqui sim o pagamento é processado.
     */

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


    /*
     * -----------------------------------------------------
     * BOTÃO VOLTAR
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * BOTÃO CANCELAR
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * FECHAMENTO DE MODAIS
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * COPIAR PIX
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * FECHAR MODAL CLICANDO NO FUNDO
     * -----------------------------------------------------
     */

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


    /*
     * -----------------------------------------------------
     * TECLA ESC
     * -----------------------------------------------------
     */

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
   CARREGAMENTO DO ESTADO
   ========================================================= */

function carregarEstadoCentral() {

    const gerenciador =
        obterGerenciadorEstado();


    if (!gerenciador) {

        throw new Error(
            "O estado central da contratação " +
            "não está disponível."
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
         * A Etapa 6 nunca deve resetar o estado.
         *
         * Apenas registra que a página atual é a Etapa 6.
         */

        definirEtapa(
            CONFIG.etapaAtual
        );


        estadoCentral =
            obterEstado();


        /*
         * Validações mínimas.
         */

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


        /*
         * Diagnóstico da informação do artista.
         */

        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "artista recebido:",
            estadoCentral.artista
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


        console.log(
            "MusicalWorldContratacaoPagamento: " +
            "estado central:",
            estadoCentral
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

    obterEstado: function () {

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
