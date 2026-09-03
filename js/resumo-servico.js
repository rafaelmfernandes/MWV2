/* =========================================================
RESUMO DA CONTRATAÇÃO
MUSICALWORLD
========================================================= */

(function () {

"use strict";


/* =====================================================
   PARÂMETROS RECEBIDOS
====================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


let dados = {

    id:
        params.get("id") || "",

    artistaId:
        params.get("artistaId") ||
        params.get("id") ||
        "",

    artista:
        params.get("artista") ||
        "",

    servico:
        params.get("servico") ||
        "",

    preco:
        Number(
            String(
                params.get("preco") || "0"
            ).replace(",", ".")
        ) || 0,

    data:
        params.get("data") ||
        "",

    horario:
        params.get("horario") ||
        params.get("hora") ||
        "",

    local:
        params.get("local") ||
        "",

    endereco:
        params.get("endereco") ||
        "",

    cep:
        params.get("cep") ||
        "",

    lat:
        params.get("lat") ||
        "",

    lng:
        params.get("lng") ||
        "",

    pagamento:
        params.get("pagamento") ||
        params.get("formaPagamento") ||
        "",

    cartao:
        params.get("cartao") ||
        ""

};


/* =====================================================
   ARTISTAS
====================================================== */

const artistas = {

    "rafael-melo": {

        nome:
            "Rafael Melo",

        categoria:
            "Cantor e violonista",

        localizacao:
            "Goiânia, GO",

        avaliacao:
            "4.9",

        avatar:
            "RM"

    },


    "gabriel-tatu": {

        nome:
            "Gabriel Tatu",

        categoria:
            "Músico e guitarrista",

        localizacao:
            "Goiânia, GO",

        avaliacao:
            "4.8",

        avatar:
            "GT"

    },


    "marcos-lima": {

        nome:
            "Marcos Lima",

        categoria:
            "Compositor",

        localizacao:
            "Goiânia, GO",

        avaliacao:
            "4.9",

        avatar:
            "ML"

    },


    "carlos-silva": {

        nome:
            "Carlos Silva",

        categoria:
            "Artista e produtor",

        localizacao:
            "Goiânia, GO",

        avaliacao:
            "4.7",

        avatar:
            "CS"

    }

};


/* =====================================================
   LOCALSTORAGE
====================================================== */

function recuperarDadosSalvos() {

    try {

        const salvo =
            localStorage.getItem(
                "evento_artista_atual"
            );


        if (!salvo) {
            return;
        }


        const evento =
            JSON.parse(salvo);


        if (!dados.artista && evento.artista) {

            dados.artista =
                evento.artista;

        }


        if (
            !dados.artistaId &&
            evento.artistaId
        ) {

            dados.artistaId =
                evento.artistaId;

        }


        if (!dados.servico && evento.servico) {

            dados.servico =
                evento.servico;

        }


        if (!dados.preco && evento.preco) {

            dados.preco =
                Number(evento.preco);

        }


        if (
            !dados.data &&
            evento.dataDoEvento
        ) {

            dados.data =
                evento.dataDoEvento;

        }


        if (
            !dados.horario &&
            evento.horarioDoEvento
        ) {

            dados.horario =
                evento.horarioDoEvento;

        }


        if (
            !dados.local &&
            evento.nomeLocal
        ) {

            dados.local =
                evento.nomeLocal;

        }


        if (
            !dados.endereco &&
            evento.localDoEvento
        ) {

            dados.endereco =
                evento.localDoEvento;

        }


        if (
            !dados.cep &&
            evento.cep
        ) {

            dados.cep =
                evento.cep;

        }


        if (
            !dados.lat &&
            evento.coordenadasMapa
        ) {

            dados.lat =
                evento.coordenadasMapa.lat ||
                "";

        }


        if (
            !dados.lng &&
            evento.coordenadasMapa
        ) {

            dados.lng =
                evento.coordenadasMapa.lng ||
                "";

        }


        if (
            !dados.pagamento &&
            evento.formaPagamento
        ) {

            dados.pagamento =
                evento.formaPagamento;

        }


        if (
            !dados.cartao &&
            evento.cartaoId
        ) {

            dados.cartao =
                evento.cartaoId;

        }

    } catch (erro) {

        console.error(
            "Erro ao recuperar contratação:",
            erro
        );

    }

}


/* =====================================================
   FORMATAR DATA
====================================================== */

function formatarData(valor) {

    if (!valor) {

        return "Não informado";

    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {

        const partes =
            valor.split("-");


        const ano =
            Number(partes[0]);

        const mes =
            Number(partes[1]) - 1;

        const dia =
            Number(partes[2]);


        const dataObj =
            new Date(
                ano,
                mes,
                dia
            );


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }


    return valor;

}


/* =====================================================
   FORMATAR PREÇO
====================================================== */

function formatarPreco(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}


/* =====================================================
   CARREGAR ARTISTA
====================================================== */

function carregarArtista() {

    const artista =
        artistas[dados.artistaId];


    const nomeFinal =
        artista?.nome ||
        dados.artista ||
        "Artista";


    const categoria =
        artista?.categoria ||
        "Artista";


    const localizacao =
        artista?.localizacao ||
        "Goiânia, GO";


    const avaliacao =
        artista?.avaliacao ||
        "5.0";


    const avatar =
        artista?.avatar ||
        gerarAvatar(nomeFinal);


    const avatarElement =
        document.getElementById(
            "artistAvatar"
        );


    const nomeElement =
        document.getElementById(
            "artistName"
        );


    const categoriaElement =
        document.getElementById(
            "artistCategory"
        );


    const localizacaoElement =
        document.getElementById(
            "artistLocation"
        );


    const avaliacaoElement =
        document.getElementById(
            "artistRating"
        );


    if (avatarElement) {

        avatarElement.textContent =
            avatar;

    }


    if (nomeElement) {

        nomeElement.textContent =
            nomeFinal;

    }


    if (categoriaElement) {

        categoriaElement.textContent =
            categoria;

    }


    if (localizacaoElement) {

        localizacaoElement.textContent =
            localizacao;

    }


    if (avaliacaoElement) {

        avaliacaoElement.textContent =
            avaliacao;

    }

}


/* =====================================================
   CARREGAR SERVIÇO
====================================================== */

function carregarServico() {

    const element =
        document.getElementById(
            "serviceName"
        );


    if (!element) {
        return;
    }


    element.textContent =
        dados.servico ||
        "Serviço não informado";

}


/* =====================================================
   CARREGAR DATA
====================================================== */

function carregarData() {

    const element =
        document.getElementById(
            "serviceDate"
        );


    if (!element) {
        return;
    }


    element.textContent =
        formatarData(
            dados.data
        );

}


/* =====================================================
   CARREGAR HORÁRIO
====================================================== */

function carregarHorario() {

    const element =
        document.getElementById(
            "serviceTime"
        );


    if (!element) {
        return;
    }


    element.textContent =
        dados.horario ||
        "Não informado";

}


/* =====================================================
   CARREGAR LOCAL
====================================================== */

function carregarLocal() {

    const nomeLocal =
        document.getElementById(
            "eventName"
        );


    const enderecoElement =
        document.getElementById(
            "eventAddress"
        );


    const cepElement =
        document.getElementById(
            "eventCep"
        );


    if (nomeLocal) {

        nomeLocal.textContent =
            dados.local ||
            "Local do evento";

    }


    if (enderecoElement) {

        enderecoElement.textContent =
            dados.endereco ||
            "Endereço não informado";

    }


    if (cepElement) {

        cepElement.textContent =
            dados.cep
                ? "CEP: " + dados.cep
                : "CEP não informado";

    }

}


/* =====================================================
   CARREGAR PAGAMENTO
====================================================== */

function carregarPagamento() {

    const element =
        document.getElementById(
            "paymentMethod"
        );


    if (!element) {
        return;
    }


    let texto =
        "Não informado";


    if (
        dados.pagamento === "pix"
    ) {

        texto =
            "PIX";

    }


    if (
        dados.pagamento === "cartao"
    ) {

        texto =
            "Cartão";


        if (dados.cartao) {

            const cartoes =
                carregarCartoesSalvos();


            const cartao =
                cartoes.find(
                    function (item) {

                        return (
                            item.id ===
                            dados.cartao
                        );

                    }
                );


            if (cartao) {

                const bandeira =
                    cartao.bandeira ||
                    "Cartão";


                const ultimos4 =
                    cartao.ultimos4 ||
                    cartao.last4 ||
                    "****";


                texto =
                    `${bandeira} •••• ${ultimos4}`;

            }

        }

    }


    element.textContent =
        texto;

}


/* =====================================================
   CARTÕES SALVOS
====================================================== */

function carregarCartoesSalvos() {

    try {

        const dadosCartoes =
            localStorage.getItem(
                "usuario_cartoes_salvos"
            );


        if (!dadosCartoes) {

            return [];

        }


        const lista =
            JSON.parse(
                dadosCartoes
            );


        return Array.isArray(lista)
            ? lista
            : [];

    } catch (erro) {

        console.error(
            "Erro ao carregar cartões:",
            erro
        );

        return [];

    }

}


/* =====================================================
   CARREGAR PREÇO
====================================================== */

function carregarPreco() {

    const element =
        document.getElementById(
            "servicePrice"
        );


    if (!element) {
        return;
    }


    element.textContent =
        formatarPreco(
            dados.preco
        );

}


/* =====================================================
   GERAR AVATAR
====================================================== */

function gerarAvatar(nome) {

    if (!nome) {
        return "MW";
    }


    const partes =
        nome
            .trim()
            .split(/\s+/);


    if (
        partes.length === 1
    ) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0].charAt(0) +
        partes[
            partes.length - 1
        ].charAt(0)
    ).toUpperCase();

}


/* =====================================================
   MONTA PARÂMETROS
====================================================== */

function montarParametros() {

    const novosParams =
        new URLSearchParams();


    novosParams.set(
        "id",
        dados.id
    );


    novosParams.set(
        "artistaId",
        dados.artistaId
    );


    novosParams.set(
        "artista",
        dados.artista
    );


    novosParams.set(
        "servico",
        dados.servico
    );


    novosParams.set(
        "preco",
        String(dados.preco)
    );


    if (dados.data) {

        novosParams.set(
            "data",
            dados.data
        );

    }


    if (dados.horario) {

        novosParams.set(
            "horario",
            dados.horario
        );

    }


    if (dados.local) {

        novosParams.set(
            "local",
            dados.local
        );

    }


    if (dados.endereco) {

        novosParams.set(
            "endereco",
            dados.endereco
        );

    }


    if (dados.cep) {

        novosParams.set(
            "cep",
            dados.cep
        );

    }


    if (dados.lat) {

        novosParams.set(
            "lat",
            dados.lat
        );

    }


    if (dados.lng) {

        novosParams.set(
            "lng",
            dados.lng
        );

    }


    if (dados.pagamento) {

        novosParams.set(
            "pagamento",
            dados.pagamento
        );

    }


    if (dados.cartao) {

        novosParams.set(
            "cartao",
            dados.cartao
        );

    }


    return novosParams.toString();

}


/* =====================================================
   VOLTAR
====================================================== */

function voltarPagina() {

    const query =
        montarParametros();


    window.location.href =
        "pagamento-servico.html?" +
        query;

}


/* =====================================================
   CANCELAR
====================================================== */

function cancelarContratacao() {

    const confirmar =
        window.confirm(
            "Deseja cancelar esta contratação?"
        );


    if (!confirmar) {
        return;
    }


    localStorage.removeItem(
        "evento_artista_atual"
    );


    window.location.href =
        "index.html";

}


/* =====================================================
   CONFIRMAR AGENDAMENTO
====================================================== */

function confirmarAgendamento() {

    const botao =
        document.querySelector(
            ".btn-confirmar"
        );


    if (botao) {

        botao.disabled = true;

        botao.style.opacity =
            "0.7";


        const texto =
            botao.querySelector(
                "span"
            );


        if (texto) {

            texto.textContent =
                "Confirmando...";

        }

    }


    /*
       Atualiza o objeto da contratação
       antes de ir para confirmação.
    */

    try {

        const eventoSalvo =
            localStorage.getItem(
                "evento_artista_atual"
            );


        let evento = {};


        if (eventoSalvo) {

            evento =
                JSON.parse(
                    eventoSalvo
                );

        }


        evento.id =
            dados.id ||
            evento.id ||
            "contratacao_" +
            Date.now();


        evento.artistaId =
            dados.artistaId;


        evento.artista =
            dados.artista;


        evento.servico =
            dados.servico;


        evento.preco =
            dados.preco;


        evento.nomeLocal =
            dados.local;


        evento.localDoEvento =
            dados.endereco;


        evento.cep =
            dados.cep;


        evento.coordenadasMapa = {

            lat:
                dados.lat,

            lng:
                dados.lng

        };


        evento.dataDoEvento =
            dados.data;


        evento.horarioDoEvento =
            dados.horario;


        evento.formaPagamento =
            dados.pagamento;


        evento.cartaoId =
            dados.cartao;


        evento.status =
            "Pendente de Confirmação";


        localStorage.setItem(
            "evento_artista_atual",
            JSON.stringify(evento)
        );


    } catch (erro) {

        console.error(
            "Erro ao salvar contratação:",
            erro
        );

    }


    const query =
        montarParametros();


    /*
       Próxima página:
       confirmação.html
    */

    setTimeout(
        function () {

            window.location.href =
                "sucesso-servico.html?" +
                query;

        },
        300
    );

}


/* =====================================================
   INICIALIZAÇÃO
====================================================== */

function inicializar() {

    console.log(
        "=== RESUMO DA CONTRATAÇÃO ==="
    );


    recuperarDadosSalvos();


    console.log(
        "Dados recebidos no resumo:",
        dados
    );


    carregarArtista();

    carregarServico();

    carregarData();

    carregarHorario();

    carregarLocal();

    carregarPagamento();

    carregarPreco();

}


/* =====================================================
   FUNÇÕES GLOBAIS
====================================================== */

window.voltarPagina =
    voltarPagina;


window.cancelarContratacao =
    cancelarContratacao;


window.confirmarAgendamento =
    confirmarAgendamento;


/* =====================================================
   START
====================================================== */

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

})();