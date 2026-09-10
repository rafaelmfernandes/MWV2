"use strict";

/*

PERFIL UTILS
Funções auxiliares compartilhadas pelos perfis.
===============================================

*/

window.PerfilUtils = (() => {


function el(id) {
    return document.getElementById(id);
}


function normalizarArray(valor) {

    if (Array.isArray(valor)) {

        return valor
            .filter(Boolean)
            .map(item => String(item).trim())
            .filter(Boolean);

    }


    if (typeof valor === "string") {

        return valor
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

    }


    return [];

}


function obterIniciais(nome) {

    const partes =
        String(nome || "Usuário")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!partes.length) {
        return "U";
    }


    if (partes.length === 1) {

        return partes[0]
            .slice(0, 2)
            .toUpperCase();

    }


    return (
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();

}


function escaparHtml(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function removerAcentos(valor) {

    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


function normalizarTipoArtista(valor) {

    const original =
        String(valor || "").trim();


    if (!original) {
        return "";
    }


    const comparacao =
        removerAcentos(original)
            .toLowerCase();


    const equivalencias = {

        "cantor": "Cantor(a)",
        "cantor(a)": "Cantor(a)",

        "musico": "Músico(a)",
        "musico(a)": "Músico(a)",

        "banda": "Banda",

        "dupla": "Dupla musical",
        "dupla musical": "Dupla musical",

        "dj": "DJ",

        "dancarino": "Dançarino(a)",
        "dancarino(a)": "Dançarino(a)",

        "grupo de danca": "Grupo de dança",

        "mc": "MC",

        "compositor": "Compositor(a)",
        "compositor(a)": "Compositor(a)",

        "produtor musical": "Produtor(a) musical",
        "produtor(a) musical": "Produtor(a) musical"

    };


    return equivalencias[comparacao] || original;

}


function marcarChips(containerId, valores) {

    const container =
        el(containerId);


    if (!container) {
        return;
    }


    const selecionados =
        new Set(
            normalizarArray(valores)
                .map(valor => valor.toLowerCase())
        );


    container
        .querySelectorAll(".chip")
        .forEach(chip => {

            const valor =
                chip.dataset.value || "";


            chip.classList.toggle(
                "ativo",
                selecionados.has(
                    valor.toLowerCase()
                )
            );

        });

}


function obterChipsSelecionados(containerId) {

    const container =
        el(containerId);


    if (!container) {
        return [];
    }


    return [
        ...container.querySelectorAll(".chip.ativo")
    ]
        .map(chip => chip.dataset.value)
        .filter(Boolean);

}


function inicializarChips() {

    document
        .querySelectorAll(".chips .chip")
        .forEach(chip => {

            chip.addEventListener(
                "click",
                () => {

                    chip.classList.toggle("ativo");

                }
            );

        });

}


function mostrarLoading(texto = "Carregando...") {

    const overlay =
        el("loadingOverlay");

    const textoEl =
        el("loadingText");


    if (textoEl) {
        textoEl.textContent = texto;
    }


    if (overlay) {
        overlay.style.display = "grid";
    }

}


function esconderLoading() {

    const overlay =
        el("loadingOverlay");


    if (overlay) {
        overlay.style.display = "none";
    }

}


function mostrarToast(mensagem, tipo = "sucesso") {

    const toast =
        el("toast");

    const texto =
        el("toastMessage");


    if (!toast || !texto) {
        return;
    }


    texto.textContent = mensagem;


    toast.classList.toggle(
        tipo === "erro"
    );


    toast.classList.add("visivel");


    clearTimeout(
        mostrarToast.timer
    );


    mostrarToast.timer =
        setTimeout(() => {

            toast.classList.remove(
                "visivel"
            );

        }, 3500);

}


function atualizarIcones() {

    if (window.lucide) {
        lucide.createIcons();
    }

}


function formatarDataAgenda(data) {

    if (!data) {

        return {
            dia: "--",
            mes: "---"
        };

    }


    const dataObj =
        new Date(data);


    if (Number.isNaN(dataObj.getTime())) {

        return {
            dia: "--",
            mes: "---"
        };

    }


    const meses = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez"
    ];


    return {

        dia:
            String(dataObj.getDate())
                .padStart(2, "0"),

        mes:
            meses[dataObj.getMonth()]

    };

}


function formatarDataHora(data) {

    if (!data) {
        return "";
    }


    const dataObj =
        new Date(data);


    if (Number.isNaN(dataObj.getTime())) {
        return "";
    }


    return dataObj.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );

}


function converterDatetimeLocalParaISO(valor) {

    if (!valor) {
        return null;
    }


    const data =
        new Date(valor);


    if (Number.isNaN(data.getTime())) {
        return null;
    }


    return data.toISOString();

}


return {

    el,
    normalizarArray,
    obterIniciais,
    escaparHtml,
    removerAcentos,
    normalizarTipoArtista,
    marcarChips,
    obterChipsSelecionados,
    inicializarChips,
    mostrarLoading,
    esconderLoading,
    mostrarToast,
    atualizarIcones,
    formatarDataAgenda,
    formatarDataHora,
    converterDatetimeLocalParaISO

};


})();
