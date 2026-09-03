"use strict";

// =========================================================
// PARÂMETROS DA URL
// =========================================================

const params = new URLSearchParams(window.location.search);

const artistaId =
params.get("id") || "rafael-melo";

const artistaNome =
params.get("artista") || "Rafael Melo";

const servico =
params.get("servico") || "Voz e violão";

const preco =
Number(params.get("preco")) || 800;

// =========================================================
// VARIÁVEIS DO MAPA
// =========================================================

let mapa = null;

let marcador = null;

let coordenadas = {
lat: -16.6869,
lng: -49.2643
};

// =========================================================
// INICIALIZAÇÃO
// =========================================================

document.addEventListener(
"DOMContentLoaded",
function () {


    console.log(
        "data-local.js carregado corretamente."
    );

    carregarResumoServico();

    carregarDadosSalvos();

    inicializarMapa();

    configurarEventos();

}


);

// =========================================================
// RESUMO DO SERVIÇO
// =========================================================

function carregarResumoServico() {


const nomeServico =
    document.getElementById(
        "resumo-servico-nome"
    );

const precoServico =
    document.getElementById(
        "resumo-servico-preco"
    );


if (nomeServico) {

    nomeServico.textContent =
        servico;

}


if (precoServico) {

    precoServico.textContent =
        formatarMoeda(preco);

}


}

// =========================================================
// FORMATAR MOEDA
// =========================================================

function formatarMoeda(valor) {


return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);


}

// =========================================================
// FORMATAR CEP
// =========================================================

function formatarCEP(input) {


if (!input) {
    return;
}


let valor =
    input.value.replace(/\D/g, "");


if (valor.length > 8) {

    valor =
        valor.substring(0, 8);

}


if (valor.length > 5) {

    valor =
        valor.substring(0, 5) +
        "-" +
        valor.substring(5);

}


input.value = valor;


}

// =========================================================
// BUSCAR CEP
// =========================================================

async function buscarCep() {


const campoCEP =
    document.getElementById(
        "input-cep"
    );


if (!campoCEP) {
    return;
}


const cep =
    campoCEP.value.replace(/\D/g, "");


if (cep.length !== 8) {

    alert(
        "Digite um CEP válido com 8 números."
    );

    return;
}


try {

    const response =
        await fetch(
            "https://viacep.com.br/ws/" +
            cep +
            "/json/"
        );


    if (!response.ok) {

        throw new Error(
            "Erro ao consultar o CEP."
        );

    }


    const dados =
        await response.json();


    if (dados.erro) {

        alert(
            "CEP não encontrado."
        );

        return;
    }


    const campoEndereco =
        document.getElementById(
            "input-local"
        );


    if (campoEndereco) {

        const endereco = [

            dados.logradouro,

            dados.bairro,

            dados.localidade,

            dados.uf

        ]
        .filter(Boolean)
        .join(", ");


        campoEndereco.value =
            endereco;

    }


    const enderecoBusca = [

        dados.logradouro,

        dados.bairro,

        dados.localidade,

        dados.uf,

        "Brasil"

    ]
    .filter(Boolean)
    .join(", ");


    const localizacao =
        await localizarEndereco(
            enderecoBusca
        );


    if (localizacao) {

        coordenadas.lat =
            localizacao.lat;

        coordenadas.lng =
            localizacao.lng;


        atualizarMarcador();

    }

} catch (erro) {

    console.error(
        "Erro ao buscar CEP:",
        erro
    );


    alert(
        "Não foi possível consultar o CEP."
    );

}


}

// =========================================================
// LOCALIZAR ENDEREÇO
// =========================================================

async function localizarEndereco(
endereco
) {


try {

    const url =
        "https://nominatim.openstreetmap.org/search" +
        "?format=json" +
        "&limit=1" +
        "&q=" +
        encodeURIComponent(endereco);


    const response =
        await fetch(url);


    if (!response.ok) {

        return null;

    }


    const resultados =
        await response.json();


    if (
        !resultados ||
        resultados.length === 0
    ) {

        return null;

    }


    return {

        lat:
            Number(resultados[0].lat),

        lng:
            Number(resultados[0].lon)

    };

} catch (erro) {

    console.error(
        "Erro ao localizar endereço:",
        erro
    );


    return null;

}


}

// =========================================================
// INICIALIZAR MAPA
// =========================================================

function inicializarMapa() {


const elementoMapa =
    document.getElementById(
        "map"
    );


if (!elementoMapa) {

    console.warn(
        "Elemento #map não encontrado."
    );

    return;

}


if (
    typeof L === "undefined"
) {

    console.error(
        "Leaflet não foi carregado."
    );

    return;

}


mapa =
    L.map("map").setView(
        [
            coordenadas.lat,
            coordenadas.lng
        ],
        13
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(mapa);


marcador =
    L.marker(
        [
            coordenadas.lat,
            coordenadas.lng
        ],
        {
            draggable: true
        }
    ).addTo(mapa);


marcador.bindPopup(
    "Arraste o marcador para definir o local do evento."
);


marcador.on(
    "dragend",
    function () {

        const posicao =
            marcador.getLatLng();


        coordenadas.lat =
            posicao.lat;

        coordenadas.lng =
            posicao.lng;


        gerarEnderecoPorCoordenadas(
            coordenadas.lat,
            coordenadas.lng
        );

    }
);


}

// =========================================================
// ATUALIZAR MARCADOR
// =========================================================

function atualizarMarcador() {


if (
    !mapa ||
    !marcador
) {

    return;

}


marcador.setLatLng(
    [
        coordenadas.lat,
        coordenadas.lng
    ]
);


mapa.setView(
    [
        coordenadas.lat,
        coordenadas.lng
    ],
    16
);


}

// =========================================================
// GERAR ENDEREÇO PELAS COORDENADAS
// =========================================================

async function gerarEnderecoPorCoordenadas(
lat,
lng
) {


try {

    const url =
        "https://nominatim.openstreetmap.org/reverse" +
        "?format=json" +
        "&lat=" +
        encodeURIComponent(lat) +
        "&lon=" +
        encodeURIComponent(lng) +
        "&zoom=18" +
        "&addressdetails=1";


    const response =
        await fetch(url);


    if (!response.ok) {

        return;

    }


    const dados =
        await response.json();


    if (
        !dados ||
        !dados.display_name
    ) {

        return;

    }


    const campoEndereco =
        document.getElementById(
            "input-local"
        );


    if (campoEndereco) {

        campoEndereco.value =
            dados.display_name;

    }

} catch (erro) {

    console.error(
        "Erro ao obter endereço pelas coordenadas:",
        erro
    );

}


}

// =========================================================
// CARREGAR DADOS SALVOS
// =========================================================

function carregarDadosSalvos() {


try {

    const dadosSalvos =
        localStorage.getItem(
            "evento_artista_atual"
        );


    if (!dadosSalvos) {

        return;

    }


    const evento =
        JSON.parse(
            dadosSalvos
        );


    if (!evento) {

        return;

    }


    const campoTitulo =
        document.getElementById(
            "input-titulo-local"
        );


    const campoCEP =
        document.getElementById(
            "input-cep"
        );


    const campoEndereco =
        document.getElementById(
            "input-local"
        );


    const campoData =
        document.getElementById(
            "input-data"
        );


    const campoHorario =
        document.getElementById(
            "input-horario"
        );


    if (
        campoTitulo &&
        evento.nomeLocal
    ) {

        campoTitulo.value =
            evento.nomeLocal;

    }


    if (
        campoCEP &&
        evento.cep
    ) {

        campoCEP.value =
            evento.cep;

    }


    if (
        campoEndereco &&
        evento.localDoEvento
    ) {

        campoEndereco.value =
            evento.localDoEvento;

    }


    if (
        campoData &&
        evento.dataDoEvento
    ) {

        campoData.value =
            evento.dataDoEvento;

    }


    if (
        campoHorario &&
        evento.horarioDoEvento
    ) {

        campoHorario.value =
            evento.horarioDoEvento;

    }


    if (
        evento.coordenadasMapa &&
        typeof evento.coordenadasMapa.lat === "number" &&
        typeof evento.coordenadasMapa.lng === "number"
    ) {

        coordenadas.lat =
            evento.coordenadasMapa.lat;

        coordenadas.lng =
            evento.coordenadasMapa.lng;


        setTimeout(
            function () {

                atualizarMarcador();

            },
            500
        );

    }

} catch (erro) {

    console.error(
        "Erro ao carregar dados salvos:",
        erro
    );

}


}

// =========================================================
// CONFIGURAR EVENTOS DOS BOTÕES
// =========================================================

function configurarEventos() {


// -----------------------------------------------------
// BOTÃO CONTINUAR
// -----------------------------------------------------

const btnContinuar =
    document.getElementById(
        "btn-continuar"
    );


if (btnContinuar) {

    btnContinuar.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            salvarInformacoesArtista();

        }
    );

}


// -----------------------------------------------------
// BOTÃO BUSCAR CEP
// -----------------------------------------------------

const btnBuscarCEP =
    document.getElementById(
        "btn-buscar-cep"
    );


if (btnBuscarCEP) {

    btnBuscarCEP.addEventListener(
        "click",
        function () {

            buscarCep();

        }
    );

}


// -----------------------------------------------------
// CAMPO CEP
// -----------------------------------------------------

const campoCEP =
    document.getElementById(
        "input-cep"
    );


if (campoCEP) {

    campoCEP.addEventListener(
        "input",
        function () {

            formatarCEP(this);

        }
    );


    campoCEP.addEventListener(
        "blur",
        function () {

            const valor =
                this.value.replace(
                    /\D/g,
                    ""
                );


            if (valor.length === 8) {

                buscarCep();

            }

        }
    );

}


// -----------------------------------------------------
// BOTÃO VOLTAR
// -----------------------------------------------------

const btnVoltar =
    document.getElementById(
        "btn-voltar"
    );


if (btnVoltar) {

    btnVoltar.addEventListener(
        "click",
        function () {

            voltarPagina();

        }
    );

}


// -----------------------------------------------------
// BOTÃO CANCELAR
// -----------------------------------------------------

const btnCancelar =
    document.getElementById(
        "btn-cancelar"
    );


if (btnCancelar) {

    btnCancelar.addEventListener(
        "click",
        function () {

            cancelarContratacao();

        }
    );

}


}

// =========================================================
// SALVAR INFORMAÇÕES
// E IR PARA PAGAMENTO
// =========================================================

function salvarInformacoesArtista() {


const campoTitulo =
    document.getElementById(
        "input-titulo-local"
    );


const campoCEP =
    document.getElementById(
        "input-cep"
    );


const campoEndereco =
    document.getElementById(
        "input-local"
    );


const campoData =
    document.getElementById(
        "input-data"
    );


const campoHorario =
    document.getElementById(
        "input-horario"
    );


const nomeLocal =
    campoTitulo
        ? campoTitulo.value.trim()
        : "";


const cep =
    campoCEP
        ? campoCEP.value.trim()
        : "";


const endereco =
    campoEndereco
        ? campoEndereco.value.trim()
        : "";


const dataEvento =
    campoData
        ? campoData.value
        : "";


const horarioEvento =
    campoHorario
        ? campoHorario.value
        : "";


// =====================================================
// VALIDAÇÕES
// =====================================================

if (!nomeLocal) {

    alert(
        "Informe o nome ou título do local do evento."
    );


    if (campoTitulo) {

        campoTitulo.focus();

    }


    return;

}


if (!endereco) {

    alert(
        "Informe o endereço do evento."
    );


    if (campoEndereco) {

        campoEndereco.focus();

    }


    return;

}


if (!dataEvento) {

    alert(
        "Selecione a data do evento."
    );


    if (campoData) {

        campoData.focus();

    }


    return;

}


if (!horarioEvento) {

    alert(
        "Informe o horário do evento."
    );


    if (campoHorario) {

        campoHorario.focus();

    }


    return;

}


// =====================================================
// CRIAR OBJETO DO EVENTO
// =====================================================

const evento = {

    id:
        "evento_" +
        Date.now(),

    artistaId:
        artistaId,

    artista:
        artistaNome,

    servico:
        servico,

    preco:
        preco,

    nomeLocal:
        nomeLocal,

    cep:
        cep,

    localDoEvento:
        endereco,

    coordenadasMapa: {

        lat:
            coordenadas.lat,

        lng:
            coordenadas.lng

    },

    dataDoEvento:
        dataEvento,

    horarioDoEvento:
        horarioEvento,

    status:
        "Pendente de Confirmação"

};


// =====================================================
// SALVAR NO LOCALSTORAGE
// =====================================================

try {

    localStorage.setItem(
        "evento_artista_atual",
        JSON.stringify(evento)
    );

} catch (erro) {

    console.error(
        "Erro ao salvar evento:",
        erro
    );

}


// =====================================================
// PREPARAR DADOS PARA PAGAMENTO
// =====================================================

const dadosPagamento =
    new URLSearchParams();


dadosPagamento.set(
    "id",
    artistaId
);


dadosPagamento.set(
    "artista",
    artistaNome
);


dadosPagamento.set(
    "servico",
    servico
);


dadosPagamento.set(
    "preco",
    preco
);


dadosPagamento.set(
    "data",
    dataEvento
);


dadosPagamento.set(
    "horario",
    horarioEvento
);


dadosPagamento.set(
    "local",
    nomeLocal
);


dadosPagamento.set(
    "endereco",
    endereco
);


dadosPagamento.set(
    "cep",
    cep
);


dadosPagamento.set(
    "lat",
    coordenadas.lat
);


dadosPagamento.set(
    "lng",
    coordenadas.lng
);


// =====================================================
// IR PARA PAGAMENTO
// =====================================================

window.location.href =
    "pagamento-servico.html?" +
    dadosPagamento.toString();


}

// =========================================================
// VOLTAR PARA SELEÇÃO DE SERVIÇO
// =========================================================

function voltarPagina() {


const dados =
    new URLSearchParams();


dados.set(
    "id",
    artistaId
);


dados.set(
    "artista",
    artistaNome
);


dados.set(
    "servico",
    servico
);


dados.set(
    "preco",
    preco
);


window.location.href =
    "selecao-servico.html?" +
    dados.toString();


}

// =========================================================
// CANCELAR CONTRATAÇÃO
// =========================================================

function cancelarContratacao() {


const confirmar =
    confirm(
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
