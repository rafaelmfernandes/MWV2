/* =========================================================
MUSICALWORLD — ESTADOS E MUNICÍPIOS DO BRASIL
Fonte dos municípios: API de Localidades do IBGE
========================================================= */

window.MunicipiosBrasil = (() => {


"use strict";

/* =====================================================
   ESTADOS DO BRASIL
===================================================== */

const estados = [
    {
        sigla: "AC",
        nome: "Acre"
    },
    {
        sigla: "AL",
        nome: "Alagoas"
    },
    {
        sigla: "AP",
        nome: "Amapá"
    },
    {
        sigla: "AM",
        nome: "Amazonas"
    },
    {
        sigla: "BA",
        nome: "Bahia"
    },
    {
        sigla: "CE",
        nome: "Ceará"
    },
    {
        sigla: "DF",
        nome: "Distrito Federal"
    },
    {
        sigla: "ES",
        nome: "Espírito Santo"
    },
    {
        sigla: "GO",
        nome: "Goiás"
    },
    {
        sigla: "MA",
        nome: "Maranhão"
    },
    {
        sigla: "MT",
        nome: "Mato Grosso"
    },
    {
        sigla: "MS",
        nome: "Mato Grosso do Sul"
    },
    {
        sigla: "MG",
        nome: "Minas Gerais"
    },
    {
        sigla: "PA",
        nome: "Pará"
    },
    {
        sigla: "PB",
        nome: "Paraíba"
    },
    {
        sigla: "PR",
        nome: "Paraná"
    },
    {
        sigla: "PE",
        nome: "Pernambuco"
    },
    {
        sigla: "PI",
        nome: "Piauí"
    },
    {
        sigla: "RJ",
        nome: "Rio de Janeiro"
    },
    {
        sigla: "RN",
        nome: "Rio Grande do Norte"
    },
    {
        sigla: "RS",
        nome: "Rio Grande do Sul"
    },
    {
        sigla: "RO",
        nome: "Rondônia"
    },
    {
        sigla: "RR",
        nome: "Roraima"
    },
    {
        sigla: "SC",
        nome: "Santa Catarina"
    },
    {
        sigla: "SP",
        nome: "São Paulo"
    },
    {
        sigla: "SE",
        nome: "Sergipe"
    },
    {
        sigla: "TO",
        nome: "Tocantins"
    }
];


/* =====================================================
   CONFIGURAÇÃO DA API
===================================================== */

const CONFIG = {
    urlBase:
        "https://servicodados.ibge.gov.br/api/v1/localidades",

    cache: new Map()
};


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizarTexto(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

}


/* =====================================================
   GERAR VALOR DA CIDADE
===================================================== */

function gerarValorCidade(nome) {

    return normalizarTexto(nome)
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

}


/* =====================================================
   OBTER ESTADOS
===================================================== */

function obterEstados() {

    return [...estados];

}


/* =====================================================
   OBTER ESTADO
===================================================== */

function obterEstado(sigla) {

    const siglaNormalizada =
        String(sigla || "")
            .trim()
            .toUpperCase();

    return estados.find(
        estado =>
            estado.sigla === siglaNormalizada
    ) || null;

}


/* =====================================================
   CARREGAR MUNICÍPIOS
===================================================== */

async function carregarMunicipios(sigla) {

    const estado =
        obterEstado(sigla);

    if (!estado) {
        return [];
    }

    const chave =
        estado.sigla;

    if (CONFIG.cache.has(chave)) {

        return CONFIG.cache.get(chave);

    }

    const url =
        `${CONFIG.urlBase}/estados/${estado.sigla}/municipios`;

    try {

        const resposta =
            await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });

        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );

        }

        const dados =
            await resposta.json();

        const municipios =
            Array.isArray(dados)
                ? dados
                    .map(municipio => ({
                        id:
                            municipio.id,
                        nome:
                            municipio.nome,
                        valor:
                            gerarValorCidade(
                                municipio.nome
                            )
                    }))
                    .sort(
                        (a, b) =>
                            a.nome.localeCompare(
                                b.nome,
                                "pt-BR"
                            )
                    )
                : [];

        CONFIG.cache.set(
            chave,
            municipios
        );

        return municipios;

    } catch (erro) {

        console.error(
            "Erro ao carregar municípios do IBGE:",
            erro
        );

        throw erro;

    }

}


/* =====================================================
   LIMPAR CACHE
===================================================== */

function limparCache() {

    CONFIG.cache.clear();

}


/* =====================================================
   API PÚBLICA
===================================================== */

return {

    estados,

    obterEstados,

    obterEstado,

    carregarMunicipios,

    limparCache,

    normalizarTexto,

    gerarValorCidade

};


})();
