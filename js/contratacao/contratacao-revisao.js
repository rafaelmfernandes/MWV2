/* =========================================================
MUSICALWORLD — ETAPA 5
Arquivo: contratacao-revisao.js

Responsabilidade:

* Controlar a etapa de revisão da contratação.
* Preparar a tela para receber os dados reais das etapas
  anteriores.
* Exibir os dados da contratação de forma organizada.
* Permitir retornar diretamente para cada etapa.
* Preparar a navegação para a etapa de pagamento.

Observação:
Neste primeiro momento o arquivo possui dados de demonstração
como fallback. A estrutura já está preparada para receber os
dados reais posteriormente através de sessionStorage, Supabase
ou outro mecanismo de estado compartilhado.
========================================================= */

(function (window) {


"use strict";


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    paginas: {

        inicio: "contratacao.html",

        dataHorario: "contratacao-data-horario.html",

        local: "contratacao-local.html",

        evento: "contratacao-detalhes-evento.html",

        pagamento: "contratacao-pagamento.html"

    },


    armazenamento: {

        chave: "musicalworld_contratacao"

    },


    seletores: {

        btnVoltar: "btnVoltar",

        btnAvancar: "btnAvancar",

        btnCancelar: "btnCancelarContratacao",

        editar: "[data-editar]",


        artistaAvatar: "artistaAvatar",

        artistaNome: "artistaNome",

        artistaTipo: "artistaTipo",

        artistaLocalizacao: "artistaLocalizacao",


        servicoNome: "servicoNome",

        servicoValor: "servicoValor",

        servicoDescricao: "servicoDescricao",

        servicoDuracao: "servicoDuracao",

        servicoLocalizacao: "servicoLocalizacao",


        dataEvento: "dataEvento",

        horarioEvento: "horarioEvento",

        horarioChegada: "horarioChegada",


        tipoLocal: "tipoLocal",

        enderecoEvento: "enderecoEvento",


        tipoEvento: "tipoEvento",

        quantidadePessoas: "quantidadePessoas",

        nomeEvento: "nomeEvento",

        estruturaEvento: "estruturaEvento",

        observacoesEvento: "observacoesEvento"

    }

};


/* =========================================================
   ESTADO
   ========================================================= */

const estado = {

    dados: {

        artista: {

            nome: "Rafael Melo",

            tipo: "Cantor(a)",

            localizacao: "Goiânia, GO",

            iniciais: "RM",

            fotoUrl: null

        },


        servico: {

            nome: "Show acústico",

            valor: 800,

            descricao:
                "Apresentação acústica com voz e violão para eventos, festas e confraternizações.",

            duracao: "2 horas",

            localizacao: "Goiânia e região"

        },


        dataHorario: {

            data: null,

            horarioInicio: null,

            horarioFim: null,

            horarioChegada: null

        },


        local: {

            tipoLocal: null,

            endereco: {

                cep: "",

                rua: "",

                numero: "",

                complemento: "",

                bairro: "",

                cidade: "",

                estado: ""

            },

            localAindaNaoDefinido: false

        },


        evento: {

            tipoEvento: null,

            quantidadePessoas: null,

            nomeEvento: "",

            estrutura: [],

            observacoes: ""

        }

    }

};


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function obterElemento(id) {

    return document.getElementById(id);

}


function definirTexto(id, valor, fallback) {

    const elemento = obterElemento(id);

    if (!elemento) {
        return;
    }

    const texto =
        valor !== null &&
        valor !== undefined &&
        String(valor).trim() !== ""
            ? String(valor)
            : fallback;

    elemento.textContent = texto;

}


function formatarMoeda(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "Não informado";
    }


    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return String(valor);
    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function obterIniciais(nome) {

    if (!nome) {
        return "MW";
    }


    const partes = String(nome)
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (!partes.length) {
        return "MW";
    }


    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();

}


function formatarData(data) {

    if (!data) {
        return "Não informado";
    }


    const dataObj = new Date(
        `${data}T00:00:00`
    );


    if (Number.isNaN(dataObj.getTime())) {
        return data;
    }


    return dataObj.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


function formatarHorario(
    inicio,
    fim
) {

    if (!inicio && !fim) {
        return "Não informado";
    }


    if (inicio && fim) {
        return `${inicio} às ${fim}`;
    }


    if (inicio) {
        return `A partir das ${inicio}`;
    }


    return fim
        ? `Até ${fim}`
        : "Não informado";

}


/* =========================================================
   ARMAZENAMENTO
   ========================================================= */

function carregarDadosArmazenados() {

    try {

        const dadosSalvos =
            sessionStorage.getItem(
                CONFIG.armazenamento.chave
            );


        if (!dadosSalvos) {
            return;
        }


        const dados =
            JSON.parse(dadosSalvos);


        if (!dados || typeof dados !== "object") {
            return;
        }


        estado.dados = mesclarDados(
            estado.dados,
            dados
        );


    } catch (erro) {

        console.warn(
            "MusicalWorld Contratação: não foi possível carregar os dados salvos.",
            erro
        );

    }

}


function mesclarDados(base, novosDados) {

    if (
        !novosDados ||
        typeof novosDados !== "object"
    ) {
        return base;
    }


    const resultado = {
        ...base,
        ...novosDados
    };


    resultado.artista = {
        ...base.artista,
        ...(novosDados.artista || {})
    };


    resultado.servico = {
        ...base.servico,
        ...(novosDados.servico || {})
    };


    resultado.dataHorario = {
        ...base.dataHorario,
        ...(novosDados.dataHorario || {})
    };


    resultado.local = {
        ...base.local,
        ...(novosDados.local || {})
    };


    resultado.local.endereco = {
        ...base.local.endereco,
        ...(
            novosDados.local &&
            novosDados.local.endereco
                ? novosDados.local.endereco
                : {}
        )
    };


    resultado.evento = {
        ...base.evento,
        ...(novosDados.evento || {})
    };


    return resultado;

}


/* =========================================================
   RENDERIZAÇÃO — ARTISTA
   ========================================================= */

function renderizarArtista() {

    const artista =
        estado.dados.artista;


    definirTexto(
        CONFIG.seletores.artistaNome,
        artista.nome,
        "Artista não informado"
    );


    definirTexto(
        CONFIG.seletores.artistaTipo,
        artista.tipo,
        "Tipo não informado"
    );


    definirTexto(
        CONFIG.seletores.artistaLocalizacao,
        artista.localizacao,
        "Localização não informada"
    );


    const avatar =
        obterElemento(
            CONFIG.seletores.artistaAvatar
        );


    if (!avatar) {
        return;
    }


    avatar.innerHTML = "";


    if (artista.fotoUrl) {

        const imagem =
            document.createElement("img");


        imagem.src = artista.fotoUrl;

        imagem.alt =
            artista.nome
                ? `Foto de ${artista.nome}`
                : "Foto do artista";


        imagem.addEventListener(
            "error",
            function () {

                avatar.textContent =
                    artista.iniciais ||
                    obterIniciais(
                        artista.nome
                    );

            }
        );


        avatar.appendChild(imagem);

        return;

    }


    avatar.textContent =
        artista.iniciais ||
        obterIniciais(
            artista.nome
        );

}


/* =========================================================
   RENDERIZAÇÃO — SERVIÇO
   ========================================================= */

function renderizarServico() {

    const servico =
        estado.dados.servico;


    definirTexto(
        CONFIG.seletores.servicoNome,
        servico.nome,
        "Serviço não informado"
    );


    definirTexto(
        CONFIG.seletores.servicoValor,
        formatarMoeda(
            servico.valor
        ),
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.servicoDescricao,
        servico.descricao,
        "Descrição não informada."
    );


    definirTexto(
        CONFIG.seletores.servicoDuracao,
        servico.duracao,
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.servicoLocalizacao,
        servico.localizacao,
        "Não informado"
    );

}


/* =========================================================
   RENDERIZAÇÃO — DATA E HORÁRIO
   ========================================================= */

function renderizarDataHorario() {

    const dados =
        estado.dados.dataHorario;


    definirTexto(
        CONFIG.seletores.dataEvento,
        formatarData(
            dados.data
        ),
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.horarioEvento,
        formatarHorario(
            dados.horarioInicio,
            dados.horarioFim
        ),
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.horarioChegada,
        dados.horarioChegada,
        "Não informado"
    );

}


/* =========================================================
   RENDERIZAÇÃO — LOCAL
   ========================================================= */

function renderizarLocal() {

    const local =
        estado.dados.local;


    if (
        local.localAindaNaoDefinido
    ) {

        definirTexto(
            CONFIG.seletores.tipoLocal,
            "Local ainda não definido",
            "Local ainda não definido"
        );


        definirTexto(
            CONFIG.seletores.enderecoEvento,
            "O endereço será informado posteriormente.",
            "O endereço será informado posteriormente."
        );


        return;

    }


    definirTexto(
        CONFIG.seletores.tipoLocal,
        local.tipoLocal,
        "Tipo de local não informado"
    );


    const endereco =
        local.endereco || {};


    const partes = [];


    if (endereco.rua) {

        let rua =
            endereco.rua;


        if (endereco.numero) {
            rua += `, ${endereco.numero}`;
        }


        partes.push(rua);

    }


    if (endereco.complemento) {
        partes.push(
            endereco.complemento
        );
    }


    if (endereco.bairro) {
        partes.push(
            endereco.bairro
        );
    }


    const cidadeEstado = [
        endereco.cidade,
        endereco.estado
    ]
        .filter(Boolean)
        .join(" - ");


    if (cidadeEstado) {
        partes.push(
            cidadeEstado
        );
    }


    if (endereco.cep) {
        partes.push(
            `CEP ${endereco.cep}`
        );
    }


    definirTexto(
        CONFIG.seletores.enderecoEvento,
        partes.join(", "),
        "O endereço ainda não foi informado."
    );

}


/* =========================================================
   RENDERIZAÇÃO — EVENTO
   ========================================================= */

function renderizarEvento() {

    const evento =
        estado.dados.evento;


    definirTexto(
        CONFIG.seletores.tipoEvento,
        evento.tipoEvento,
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.quantidadePessoas,
        evento.quantidadePessoas
            ? Number(
                evento.quantidadePessoas
            ).toLocaleString("pt-BR")
            : null,
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.nomeEvento,
        evento.nomeEvento,
        "Não informado"
    );


    const estruturas =
        Array.isArray(
            evento.estrutura
        )
            ? evento.estrutura
            : [];


    const nomesEstrutura = {

        som: "Som",

        palco: "Palco",

        iluminacao: "Iluminação",

        microfone: "Microfone",

        nenhuma: "Nenhuma"

    };


    const estruturaFormatada =
        estruturas
            .map(function (item) {

                return (
                    nomesEstrutura[item] ||
                    item
                );

            })
            .filter(Boolean)
            .join(", ");


    definirTexto(
        CONFIG.seletores.estruturaEvento,
        estruturaFormatada,
        "Não informado"
    );


    definirTexto(
        CONFIG.seletores.observacoesEvento,
        evento.observacoes,
        "Nenhuma observação adicionada."
    );

}


/* =========================================================
   RENDERIZAÇÃO COMPLETA
   ========================================================= */

function renderizar() {

    renderizarArtista();

    renderizarServico();

    renderizarDataHorario();

    renderizarLocal();

    renderizarEvento();

}


/* =========================================================
   NAVEGAÇÃO — EDIÇÃO
   ========================================================= */

function editarSecao(secao) {

    const paginas = {

        artista:
            CONFIG.paginas.inicio,

        servico:
            CONFIG.paginas.inicio,

        data:
            CONFIG.paginas.dataHorario,

        local:
            CONFIG.paginas.local,

        evento:
            CONFIG.paginas.evento

    };


    const pagina =
        paginas[secao];


    if (!pagina) {

        console.warn(
            "MusicalWorld Contratação: seção de edição não encontrada.",
            secao
        );

        return;

    }


    window.location.href =
        pagina;

}


/* =========================================================
   NAVEGAÇÃO — VOLTAR
   ========================================================= */

function voltar() {

    window.location.href =
        CONFIG.paginas.evento;

}


/* =========================================================
   NAVEGAÇÃO — PAGAMENTO
   ========================================================= */

function avancar() {

    salvarEstado();


    window.location.href =
        CONFIG.paginas.pagamento;

}


/* =========================================================
   CANCELAMENTO
   ========================================================= */

function cancelar() {

    const confirmar =
        window.confirm(
            "Deseja cancelar esta contratação?"
        );


    if (!confirmar) {
        return;
    }


    window.location.href =
        CONFIG.paginas.inicio;

}


/* =========================================================
   SALVAR ESTADO
   ========================================================= */

function salvarEstado() {

    try {

        sessionStorage.setItem(
            CONFIG.armazenamento.chave,
            JSON.stringify(
                estado.dados
            )
        );


    } catch (erro) {

        console.warn(
            "MusicalWorld Contratação: não foi possível salvar os dados.",
            erro
        );

    }

}


/* =========================================================
   EVENTOS
   ========================================================= */

function configurarEventos() {

    const btnVoltar =
        obterElemento(
            CONFIG.seletores.btnVoltar
        );


    const btnAvancar =
        obterElemento(
            CONFIG.seletores.btnAvancar
        );


    const btnCancelar =
        obterElemento(
            CONFIG.seletores.btnCancelar
        );


    if (btnVoltar) {

        btnVoltar.addEventListener(
            "click",
            voltar
        );

    }


    if (btnAvancar) {

        btnAvancar.addEventListener(
            "click",
            avancar
        );

    }


    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            cancelar
        );

    }


    document
        .querySelectorAll(
            CONFIG.seletores.editar
        )
        .forEach(function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    const secao =
                        botao.dataset.editar;


                    editarSecao(
                        secao
                    );

                }
            );

        });

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializar() {

    carregarDadosArmazenados();

    renderizar();

    configurarEventos();


    console.log(
        "MusicalWorld Contratação: Etapa 5 inicializada.",
        estado.dados
    );

}


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.MusicalWorldContratacaoRevisao = {

    inicializar,

    voltar,

    avancar,

    editarSecao,

    obterEstado: function () {

        return estado;

    },

    salvarEstado

};


/* =========================================================
   INICIALIZAÇÃO AUTOMÁTICA
   ========================================================= */

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


})(window);
