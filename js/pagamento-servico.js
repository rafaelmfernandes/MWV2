/* =========================================================
PAGAMENTO DO SERVIÇO
MUSICALWORLD
========================================================= */

(function () {

"use strict";


/* =====================================================
   DADOS DA URL
====================================================== */

const params = new URLSearchParams(window.location.search);


/*
   Primeiro tenta pegar os dados diretamente da URL.
   Esses são os dados enviados pelo data-local.html.
*/

let dadosContratacao = {

    id: params.get("id") || "",

    artistaId: params.get("artistaId") || params.get("id") || "",

    artista: params.get("artista") || "",

    servico: params.get("servico") || "",

    preco: Number(
        String(params.get("preco") || "0").replace(",", ".")
    ) || 0,

    data: params.get("data") || "",

    horario: params.get("horario") || "",

    local: params.get("local") || "",

    endereco: params.get("endereco") || "",

    cep: params.get("cep") || "",

    lat: params.get("lat") || "",

    lng: params.get("lng") || "",

    pagamento: "",

    cartaoId: ""

};


/* =====================================================
   RECUPERA DADOS DO LOCALSTORAGE SE NECESSÁRIO
====================================================== */

function recuperarDadosSalvos() {

    try {

        const salvo = localStorage.getItem(
            "evento_artista_atual"
        );

        if (!salvo) {
            return;
        }

        const evento = JSON.parse(salvo);

        /*
           Só usa o localStorage quando o parâmetro
           correspondente não veio pela URL.
        */

        if (!dadosContratacao.artista && evento.artista) {
            dadosContratacao.artista = evento.artista;
        }

        if (!dadosContratacao.artistaId && evento.artistaId) {
            dadosContratacao.artistaId = evento.artistaId;
        }

        if (!dadosContratacao.servico && evento.servico) {
            dadosContratacao.servico = evento.servico;
        }

        if (!dadosContratacao.preco && evento.preco) {
            dadosContratacao.preco = Number(evento.preco);
        }

        if (!dadosContratacao.data && evento.dataDoEvento) {
            dadosContratacao.data = evento.dataDoEvento;
        }

        if (!dadosContratacao.horario && evento.horarioDoEvento) {
            dadosContratacao.horario = evento.horarioDoEvento;
        }

        if (!dadosContratacao.local && evento.nomeLocal) {
            dadosContratacao.local = evento.nomeLocal;
        }

        if (!dadosContratacao.endereco && evento.localDoEvento) {
            dadosContratacao.endereco = evento.localDoEvento;
        }

        if (!dadosContratacao.cep && evento.cep) {
            dadosContratacao.cep = evento.cep;
        }

        if (!dadosContratacao.lat && evento.coordenadasMapa) {
            dadosContratacao.lat =
                evento.coordenadasMapa.lat || "";
        }

        if (!dadosContratacao.lng && evento.coordenadasMapa) {
            dadosContratacao.lng =
                evento.coordenadasMapa.lng || "";
        }

    } catch (erro) {

        console.error(
            "Erro ao recuperar evento salvo:",
            erro
        );

    }

}


/* =====================================================
   FORMATA DATA
====================================================== */

function formatarData(data) {

    if (!data) {
        return "—";
    }


    /*
       Caso seja YYYY-MM-DD
    */

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {

        const partes = data.split("-");

        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2];

        return `${dia}/${mes}/${ano}`;
    }


    /*
       Caso já esteja DD/MM/YYYY
    */

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        return data;
    }


    return data;

}


/* =====================================================
   FORMATA PREÇO
====================================================== */

function formatarPreco(valor) {

    const numero = Number(valor) || 0;

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   PREENCHE RESUMO
====================================================== */

function carregarResumo() {

    const servico =
        document.getElementById("resumo-servico-nome");

    const artista =
        document.getElementById("resumo-artista");

    const local =
        document.getElementById("resumo-local");

    const endereco =
        document.getElementById("resumo-endereco");

    const cep =
        document.getElementById("resumo-cep");

    const data =
        document.getElementById("resumo-data");

    const horario =
        document.getElementById("resumo-horario");

    const preco =
        document.getElementById("resumo-servico-preco");


    if (servico) {

        servico.textContent =
            dadosContratacao.servico || "Serviço";

    }


    if (artista) {

        artista.textContent =
            dadosContratacao.artista || "Artista";

    }


    if (local) {

        local.textContent =
            dadosContratacao.local ||
            dadosContratacao.endereco ||
            "Local não informado";

    }


    if (endereco) {

        endereco.textContent =
            dadosContratacao.endereco ||
            "Endereço não informado";

    }


    if (cep) {

        cep.textContent =
            dadosContratacao.cep ||
            "Não informado";

    }


    if (data) {

        data.textContent =
            formatarData(
                dadosContratacao.data
            );

    }


    if (horario) {

        horario.textContent =
            dadosContratacao.horario ||
            "Não informado";

    }


    if (preco) {

        preco.textContent =
            formatarPreco(
                dadosContratacao.preco
            );

    }

}


/* =====================================================
   FORMA DE PAGAMENTO
====================================================== */

let formaPagamento = "pix";


function selecionarPagamento(tipo) {

    formaPagamento = tipo;


    const opcaoPix =
        document.getElementById("opcao-pix");

    const opcaoCartao =
        document.getElementById("opcao-cartao");

    const cartoes =
        document.getElementById(
            "saved-cards-section"
        );


    if (opcaoPix) {

        opcaoPix.classList.toggle(
            "selected",
            tipo === "pix"
        );

    }


    if (opcaoCartao) {

        opcaoCartao.classList.toggle(
            "selected",
            tipo === "cartao"
        );

    }


    if (cartoes) {

        cartoes.classList.toggle(
            "visible",
            tipo === "cartao"
        );

    }

}


/* =====================================================
   CARTÕES SALVOS
====================================================== */

let cartoesSalvos = [];


function carregarCartoes() {

    try {

        const dados =
            localStorage.getItem(
                "usuario_cartoes_salvos"
            );


        if (dados) {

            const parsed =
                JSON.parse(dados);

            if (Array.isArray(parsed)) {
                cartoesSalvos = parsed;
            } else {
                cartoesSalvos = [];
            }

        } else {

            cartoesSalvos = [];

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar cartões:",
            erro
        );

        cartoesSalvos = [];

    }


    renderizarCartoes();

}


/* =====================================================
   IDENTIFICA BANDEIRA
====================================================== */

function identificarBandeira(numero) {

    const n =
        String(numero).replace(/\D/g, "");


    if (/^4/.test(n)) {
        return "Visa";
    }


    if (/^(5[1-5]|2[2-7])/.test(n)) {
        return "Mastercard";
    }


    if (/^3[47]/.test(n)) {
        return "American Express";
    }


    if (/^(6011|65|64[4-9])/.test(n)) {
        return "Discover";
    }


    return "Cartão";

}


/* =====================================================
   RENDERIZA CARTÕES
====================================================== */

function renderizarCartoes() {

    const lista =
        document.getElementById(
            "saved-cards-list"
        );


    if (!lista) {
        return;
    }


    lista.innerHTML = "";


    if (!cartoesSalvos.length) {

        const vazio =
            document.createElement("div");

        vazio.className =
            "saved-card-empty";

        vazio.innerHTML = `
            <strong>Nenhum cartão salvo</strong>
            <span>Cadastre um cartão para pagar com cartão.</span>
        `;

        lista.appendChild(vazio);

        return;

    }


    cartoesSalvos.forEach(function (cartao, index) {

        const label =
            document.createElement("label");

        label.className =
            "saved-card-option";


        const radio =
            document.createElement("input");

        radio.type = "radio";

        radio.name = "cartaoSelecionado";

        radio.value =
            cartao.id || String(index);


        if (cartao.principal === true) {
            radio.checked = true;
        }


        radio.addEventListener(
            "change",
            function () {

                if (radio.checked) {

                    dadosContratacao.cartaoId =
                        radio.value;

                }

            }
        );


        const info =
            document.createElement("div");

        info.className =
            "saved-card-info";


        const titulo =
            document.createElement("strong");


        const bandeira =
            cartao.bandeira ||
            "Cartão";


        const ultimos =
            cartao.ultimos4 ||
            cartao.last4 ||
            "****";


        titulo.textContent =
            `${bandeira} •••• ${ultimos}`;


        const detalhe =
            document.createElement("span");


        detalhe.textContent =
            cartao.nome ||
            cartao.nomeTitular ||
            "Cartão salvo";


        info.appendChild(titulo);

        info.appendChild(detalhe);


        label.appendChild(radio);

        label.appendChild(info);


        lista.appendChild(label);


        /*
           Se o cartão for principal,
           guarda automaticamente o ID.
        */

        if (
            cartao.principal === true &&
            !dadosContratacao.cartaoId
        ) {

            dadosContratacao.cartaoId =
                radio.value;

        }

    });

}


/* =====================================================
   MODAL
====================================================== */

function abrirModalCartao() {

    const modal =
        document.getElementById(
            "modal-cartao"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "flex";

    document.body.style.overflow =
        "hidden";


    const numero =
        document.getElementById(
            "novo-num-cartao"
        );


    if (numero) {
        setTimeout(
            function () {
                numero.focus();
            },
            100
        );
    }

}


function fecharModalCartao() {

    const modal =
        document.getElementById(
            "modal-cartao"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "none";

    document.body.style.overflow =
        "";

}


/* =====================================================
   MÁSCARA CARTÃO
====================================================== */

function aplicarMascaraCartao(input) {

    input.addEventListener(
        "input",
        function () {

            let valor =
                input.value.replace(
                    /\D/g,
                    ""
                );


            valor =
                valor.substring(0, 16);


            const grupos =
                valor.match(/.{1,4}/g);


            input.value =
                grupos
                    ? grupos.join(" ")
                    : "";

        }
    );

}


/* =====================================================
   MÁSCARA VALIDADE
====================================================== */

function aplicarMascaraValidade(input) {

    input.addEventListener(
        "input",
        function () {

            let valor =
                input.value.replace(
                    /\D/g,
                    ""
                );


            valor =
                valor.substring(0, 4);


            if (valor.length > 2) {

                valor =
                    valor.substring(0, 2) +
                    "/" +
                    valor.substring(2);

            }


            input.value = valor;

        }
    );

}


/* =====================================================
   SOMENTE NÚMEROS
====================================================== */

function apenasNumeros(input) {

    input.addEventListener(
        "input",
        function () {

            input.value =
                input.value.replace(
                    /\D/g,
                    ""
                );

        }
    );

}


/* =====================================================
   SALVAR NOVO CARTÃO
====================================================== */

function salvarNovoCartao() {

    const numeroInput =
        document.getElementById(
            "novo-num-cartao"
        );

    const nomeInput =
        document.getElementById(
            "novo-nome-cartao"
        );

    const validadeInput =
        document.getElementById(
            "novo-val-cartao"
        );

    const cvvInput =
        document.getElementById(
            "novo-cvv-cartao"
        );


    const numero =
        numeroInput.value.replace(
            /\D/g,
            ""
        );

    const nome =
        nomeInput.value.trim();

    const validade =
        validadeInput.value.trim();

    const cvv =
        cvvInput.value.replace(
            /\D/g,
            ""
        );


    /* ================================================
       VALIDAÇÕES
    ================================================= */

    if (numero.length < 13) {

        alert(
            "Digite um número de cartão válido."
        );

        numeroInput.focus();

        return;

    }


    if (nome.length < 3) {

        alert(
            "Digite o nome do titular."
        );

        nomeInput.focus();

        return;

    }


    if (!/^\d{2}\/\d{2}$/.test(validade)) {

        alert(
            "Digite a validade no formato MM/AA."
        );

        validadeInput.focus();

        return;

    }


    const mes =
        Number(
            validade.substring(0, 2)
        );


    if (mes < 1 || mes > 12) {

        alert(
            "Digite uma validade válida."
        );

        validadeInput.focus();

        return;

    }


    if (cvv.length < 3) {

        alert(
            "Digite um CVV válido."
        );

        cvvInput.focus();

        return;

    }


    /* ================================================
       NÃO ARMAZENAR NÚMERO COMPLETO OU CVV
    ================================================= */

    const ultimos4 =
        numero.slice(-4);


    const cartao = {

        id:
            "cartao_" +
            Date.now(),

        bandeira:
            identificarBandeira(numero),

        ultimos4:
            ultimos4,

        nome:
            nome,

        validade:
            validade,

        principal:
            cartoesSalvos.length === 0

    };


    cartoesSalvos.push(cartao);


    localStorage.setItem(
        "usuario_cartoes_salvos",
        JSON.stringify(cartoesSalvos)
    );


    dadosContratacao.cartaoId =
        cartao.id;


    /*
       Seleciona cartão automaticamente
    */

    const radioCartao =
        document.querySelector(
            'input[name="formaPagamento"][value="cartao"]'
        );


    if (radioCartao) {

        radioCartao.checked = true;

    }


    selecionarPagamento("cartao");


    fecharModalCartao();


    /*
       Limpa formulário
    */

    numeroInput.value = "";

    nomeInput.value = "";

    validadeInput.value = "";

    cvvInput.value = "";


    carregarCartoes();


    /*
       Seleciona o cartão recém criado
    */

    setTimeout(
        function () {

            const radio =
                document.querySelector(
                    `input[name="cartaoSelecionado"][value="${cartao.id}"]`
                );


            if (radio) {

                radio.checked = true;

            }

        },
        50
    );

}


/* =====================================================
   FINALIZAR CONTRATAÇÃO
====================================================== */

function finalizarContratacao() {

    /*
       Garante que o tipo atual seja recuperado
       diretamente dos radios.
    */

    const radioSelecionado =
        document.querySelector(
            'input[name="formaPagamento"]:checked'
        );


    if (radioSelecionado) {

        formaPagamento =
            radioSelecionado.value;

    }


    /* ================================================
       VALIDA CARTÃO
    ================================================= */

    if (formaPagamento === "cartao") {

        const cartaoSelecionado =
            document.querySelector(
                'input[name="cartaoSelecionado"]:checked'
            );


        if (!cartaoSelecionado) {

            alert(
                "Selecione um cartão para continuar."
            );

            return;

        }


        dadosContratacao.cartaoId =
            cartaoSelecionado.value;

    }


    /* ================================================
       SALVA DADOS COMPLETOS
    ================================================= */

    dadosContratacao.pagamento =
        formaPagamento;


    const eventoAtual = {

        id:
            dadosContratacao.id ||
            "contratacao_" + Date.now(),

        artistaId:
            dadosContratacao.artistaId,

        artista:
            dadosContratacao.artista,

        servico:
            dadosContratacao.servico,

        preco:
            dadosContratacao.preco,

        nomeLocal:
            dadosContratacao.local,

        cep:
            dadosContratacao.cep,

        localDoEvento:
            dadosContratacao.endereco,

        coordenadasMapa: {

            lat:
                dadosContratacao.lat,

            lng:
                dadosContratacao.lng

        },

        dataDoEvento:
            dadosContratacao.data,

        horarioDoEvento:
            dadosContratacao.horario,

        formaPagamento:
            dadosContratacao.pagamento,

        cartaoId:
            dadosContratacao.cartaoId,

        status:
            "Pendente de Confirmação"

    };


    localStorage.setItem(
        "evento_artista_atual",
        JSON.stringify(eventoAtual)
    );


    /* ================================================
       MONTA URL DO RESUMO
    ================================================= */

    const parametrosResumo =
        new URLSearchParams();


    parametrosResumo.set(
        "id",
        dadosContratacao.id
    );


    parametrosResumo.set(
        "artistaId",
        dadosContratacao.artistaId
    );


    parametrosResumo.set(
        "artista",
        dadosContratacao.artista
    );


    parametrosResumo.set(
        "servico",
        dadosContratacao.servico
    );


    parametrosResumo.set(
        "preco",
        String(dadosContratacao.preco)
    );


    parametrosResumo.set(
        "data",
        dadosContratacao.data
    );


    parametrosResumo.set(
        "horario",
        dadosContratacao.horario
    );


    parametrosResumo.set(
        "local",
        dadosContratacao.local
    );


    parametrosResumo.set(
        "endereco",
        dadosContratacao.endereco
    );


    parametrosResumo.set(
        "cep",
        dadosContratacao.cep
    );


    parametrosResumo.set(
        "lat",
        dadosContratacao.lat
    );


    parametrosResumo.set(
        "lng",
        dadosContratacao.lng
    );


    parametrosResumo.set(
        "pagamento",
        dadosContratacao.pagamento
    );


    parametrosResumo.set(
        "cartao",
        dadosContratacao.cartaoId
    );


    /* ================================================
       VAI PARA RESUMO.HTML
    ================================================= */

    window.location.href =
        "resumo-servico.html?" +
        parametrosResumo.toString();

}


/* =====================================================
   VOLTAR PARA DATA-LOCAL
====================================================== */

function voltarPagina() {

    const parametros =
        new URLSearchParams();


    parametros.set(
        "id",
        dadosContratacao.artistaId ||
        dadosContratacao.id
    );


    parametros.set(
        "artista",
        dadosContratacao.artista
    );


    parametros.set(
        "servico",
        dadosContratacao.servico
    );


    parametros.set(
        "preco",
        String(dadosContratacao.preco)
    );


    parametros.set(
        "data",
        dadosContratacao.data
    );


    parametros.set(
        "horario",
        dadosContratacao.horario
    );


    parametros.set(
        "local",
        dadosContratacao.local
    );


    parametros.set(
        "endereco",
        dadosContratacao.endereco
    );


    parametros.set(
        "cep",
        dadosContratacao.cep
    );


    parametros.set(
        "lat",
        dadosContratacao.lat
    );


    parametros.set(
        "lng",
        dadosContratacao.lng
    );


    window.location.href =
        "data-local.html?" +
        parametros.toString();

}


/* =====================================================
   FECHAR MODAL CLICANDO FORA
====================================================== */

function configurarModal() {

    const modal =
        document.getElementById(
            "modal-cartao"
        );


    if (!modal) {
        return;
    }


    modal.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target === modal
            ) {

                fecharModalCartao();

            }

        }
    );

}


/* =====================================================
   INICIALIZAÇÃO
====================================================== */

function inicializar() {

    console.log(
        "=== PAGAMENTO SERVIÇO ==="
    );

    console.log(
        "URL:",
        window.location.href
    );


    recuperarDadosSalvos();


    console.log(
        "Dados recebidos:",
        dadosContratacao
    );


    carregarResumo();

    carregarCartoes();

    selecionarPagamento("pix");

    configurarModal();


    /*
       Máscaras
    */

    const numero =
        document.getElementById(
            "novo-num-cartao"
        );

    const validade =
        document.getElementById(
            "novo-val-cartao"
        );

    const cvv =
        document.getElementById(
            "novo-cvv-cartao"
        );


    if (numero) {

        aplicarMascaraCartao(numero);

    }


    if (validade) {

        aplicarMascaraValidade(validade);

    }


    if (cvv) {

        apenasNumeros(cvv);

    }

}


/* =====================================================
   EXPÕE FUNÇÕES PARA O HTML
====================================================== */

window.selecionarPagamento =
    selecionarPagamento;

window.abrirModalCartao =
    abrirModalCartao;

window.fecharModalCartao =
    fecharModalCartao;

window.salvarNovoCartao =
    salvarNovoCartao;

window.finalizarContratacao =
    finalizarContratacao;

window.voltarPagina =
    voltarPagina;


/* =====================================================
   START
====================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializar
    );

} else {

    inicializar();

}

})();