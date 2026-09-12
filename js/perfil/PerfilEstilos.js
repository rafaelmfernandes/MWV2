(function (window) {


"use strict";

/*
============================================================
MUSICALWORLD — PERFIL ESTILOS MUSICAIS
Arquivo: PerfilEstilos.js
============================================================

Responsabilidade:

- Criar e controlar os chips de estilos musicais.
- Permitir selecionar múltiplos estilos.
- Carregar estilos já salvos no perfil.
- Manter os estilos selecionados no estado do editor.
- Disponibilizar os estilos selecionados para o PerfilEditor.js.

Este módulo NÃO:

- Faz consultas diretamente ao Supabase.
- Salva dados no banco.
- Controla o formulário principal.
- Controla instrumentos.
- Controla serviços.
- Controla portfólio ou agenda.

O salvamento definitivo é responsabilidade do:
    PerfilEditorDados.js

A coordenação do módulo é responsabilidade do:
    PerfilEditor.js

============================================================
*/

const CONFIG = {

    containerId: "estilos",

    estilos: [

        {
            valor: "Sertanejo",
            label: "Sertanejo"
        },

        {
            valor: "MPB",
            label: "MPB"
        },

        {
            valor: "Pop",
            label: "Pop"
        },

        {
            valor: "Rock",
            label: "Rock"
        },

        {
            valor: "Samba",
            label: "Samba"
        },

        {
            valor: "Pagode",
            label: "Pagode"
        },

        {
            valor: "Forró",
            label: "Forró"
        },

        {
            valor: "Gospel",
            label: "Gospel"
        },

        {
            valor: "Funk",
            label: "Funk"
        },

        {
            valor: "Rap / Hip Hop",
            label: "Rap / Hip Hop"
        },

        {
            valor: "Reggae",
            label: "Reggae"
        },

        {
            valor: "Axé",
            label: "Axé"
        },

        {
            valor: "Bossa Nova",
            label: "Bossa Nova"
        },

        {
            valor: "Jazz",
            label: "Jazz"
        },

        {
            valor: "Blues",
            label: "Blues"
        },

        {
            valor: "Country",
            label: "Country"
        },

        {
            valor: "Eletrônica",
            label: "Eletrônica"
        },

        {
            valor: "Música Clássica",
            label: "Música Clássica"
        },

        {
            valor: "R&B",
            label: "R&B"
        },

        {
            valor: "Soul",
            label: "Soul"
        },

        {
            valor: "Samba Rock",
            label: "Samba Rock"
        },

        {
            valor: "Arrocha",
            label: "Arrocha"
        },

        {
            valor: "Piseiro",
            label: "Piseiro"
        },

        {
            valor: "Baião",
            label: "Baião"
        },

        {
            valor: "Frevo",
            label: "Frevo"
        },

        {
            valor: "Choro",
            label: "Choro"
        },

        {
            valor: "Instrumental",
            label: "Instrumental"
        },

        {
            valor: "Música Latina",
            label: "Música Latina"
        },

        {
            valor: "Outro",
            label: "Outro"
        }

    ]

};


const estado = {

    inicializado: false,

    configurado: false,

    contexto: null,

    selecionados: []

};


/*
============================================================
UTILITÁRIOS
============================================================
*/

function normalizarTexto(valor) {

    return String(valor || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function normalizarArray(valores) {

    if (!Array.isArray(valores)) {
        return [];
    }

    return valores
        .map(valor => String(valor || "").trim())
        .filter(Boolean);

}


function obterContainer() {

    return document.getElementById(CONFIG.containerId);

}


function encontrarEstilo(valor) {

    const normalizado = normalizarTexto(valor);

    return CONFIG.estilos.find(estilo => {

        return normalizarTexto(estilo.valor) === normalizado;

    }) || null;

}


/*
============================================================
SINCRONIZAÇÃO COM O ESTADO DO EDITOR
============================================================
*/

function sincronizarEstado() {

    if (
        !estado.contexto ||
        !estado.contexto.estado ||
        !estado.contexto.estado.perfilArtista
    ) {
        return;
    }

    estado.contexto.estado.perfilArtista.estilos = [
        ...estado.selecionados
    ];

}


/*
============================================================
RENDERIZAÇÃO
============================================================
*/

function renderizar() {

    const container = obterContainer();

    if (!container) {

        console.warn(
            "PerfilEstilos: container #estilos não encontrado."
        );

        return;

    }

    /*
    Marca o container como sendo controlado por este módulo.

    Dessa forma o PerfilUtils não tentará adicionar
    listeners próprios aos chips.
    */

    container.dataset.chipModule = "true";

    container.innerHTML = "";

    CONFIG.estilos.forEach(estilo => {

        const chip = document.createElement("button");

        chip.type = "button";

        chip.className = "chip";

        chip.dataset.value = estilo.valor;

        chip.setAttribute("aria-pressed", "false");

        chip.textContent = estilo.label;

        chip.addEventListener("click", () => {

            alternarEstilo(estilo.valor);

        });

        container.appendChild(chip);

    });

    marcarSelecionados(estado.selecionados);

}


/*
============================================================
SELEÇÃO / DESSELEÇÃO
============================================================
*/

function alternarEstilo(valor) {

    const estilo = encontrarEstilo(valor);

    if (!estilo) {
        return;
    }

    const indice = estado.selecionados.findIndex(item => {

        return normalizarTexto(item) === normalizarTexto(estilo.valor);

    });


    if (indice >= 0) {

        estado.selecionados.splice(indice, 1);

    } else {

        estado.selecionados.push(estilo.valor);

    }


    marcarSelecionados(estado.selecionados);

    sincronizarEstado();

}


function marcarSelecionados(valores) {

    const selecionados = normalizarArray(valores);

    const container = obterContainer();

    if (!container) {
        return;
    }

    container.querySelectorAll(".chip").forEach(chip => {

        const valorChip = chip.dataset.value || "";

        const ativo = selecionados.some(valor => {

            return normalizarTexto(valor) === normalizarTexto(valorChip);

        });

        chip.classList.toggle("ativo", ativo);

        chip.setAttribute(
            "aria-pressed",
            ativo ? "true" : "false"
        );

    });

}


/*
============================================================
CARREGAMENTO
============================================================
*/

function carregar(valores) {

    const valoresRecebidos = normalizarArray(valores);

    estado.selecionados = [
        ...valoresRecebidos
    ];

    marcarSelecionados(estado.selecionados);

    sincronizarEstado();

}


/*
============================================================
OBTENÇÃO DOS VALORES
============================================================
*/

function obterSelecionados() {

    return [
        ...estado.selecionados
    ];

}


/*
============================================================
LIMPEZA
============================================================
*/

function limpar() {

    estado.selecionados = [];

    marcarSelecionados([]);

    sincronizarEstado();

}


/*
============================================================
CONFIGURAÇÃO
============================================================
*/

function configurar(contexto) {

    estado.contexto = contexto || null;

    estado.configurado = true;

}


/*
============================================================
INICIALIZAÇÃO
============================================================
*/

function inicializar() {

    if (estado.inicializado) {

        renderizar();

        return;

    }

    renderizar();

    estado.inicializado = true;

}


/*
============================================================
DESTRUIÇÃO
============================================================
*/

function destruir() {

    const container = obterContainer();

    if (container) {

        container.innerHTML = "";

        delete container.dataset.chipModule;

    }

    estado.inicializado = false;

    estado.configurado = false;

    estado.contexto = null;

    estado.selecionados = [];

}


/*
============================================================
API PÚBLICA
============================================================
*/

window.PerfilEstilos = {

    configurar,

    inicializar,

    renderizar,

    carregar,

    limpar,

    destruir,

    obterSelecionados,

    marcarSelecionados,

    alternarEstilo,

    sincronizarEstado,

    CONFIG,

    estado

};


console.log(
    "PerfilEstilos: módulo carregado."
);


})(window);
