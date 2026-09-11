/* =========================================================
MUSICALWORLD — APRESENTAR PERFIL
Arquivo: ApresentarPerfilUtils.js

Responsabilidade:

* Funções auxiliares da apresentação pública.
* Normalização de dados.
* Formatação de datas e valores.
* Tratamento de HTML.
* Iniciais.
* Ícones.
* Toasts.
* URL e parâmetros.
* Utilidades gerais.

IMPORTANTE:
Este arquivo não carrega dados do Supabase.
Este arquivo não contém regras específicas de tipo.
========================================================= */

(function (window) {


"use strict";


/* =====================================================
   NORMALIZAÇÃO DE TEXTO
   ===================================================== */

function normalizarTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

}


/* =====================================================
   NORMALIZAÇÃO DE ARRAY
   ===================================================== */

function normalizarArray(valor) {

    if (Array.isArray(valor)) {

        return valor.filter(item => {

            return (
                item !== null &&
                item !== undefined &&
                String(item).trim() !== ""
            );

        });

    }


    if (
        valor === null ||
        valor === undefined
    ) {
        return [];
    }


    if (typeof valor === "string") {

        const texto = valor.trim();


        if (!texto) {
            return [];
        }


        if (
            texto.startsWith("[") &&
            texto.endsWith("]")
        ) {

            try {

                const resultado =
                    JSON.parse(texto);


                if (Array.isArray(resultado)) {
                    return resultado;
                }

            } catch (erro) {

                console.warn(
                    "Não foi possível interpretar array JSON:",
                    erro
                );

            }

        }


        return texto
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

    }


    return [valor];

}


/* =====================================================
   OBTER PRIMEIRO VALOR VÁLIDO
   ===================================================== */

function obterPrimeiroValor(...valores) {

    for (const valor of valores) {

        if (
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
        ) {

            return valor;

        }

    }

    return "";

}


/* =====================================================
   CONVERTER PARA NÚMERO
   ===================================================== */

function converterParaNumero(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return 0;
    }


    if (typeof valor === "number") {

        return Number.isFinite(valor)
            ? valor
            : 0;

    }


    let texto =
        String(valor)
            .trim()
            .replace(/[R$\s]/g, "");


    if (
        texto.includes(".") &&
        texto.includes(",")
    ) {

        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");

    } else if (texto.includes(",")) {

        texto =
            texto.replace(",", ".");

    }


    const numero =
        Number(texto);


    return Number.isFinite(numero)
        ? numero
        : 0;

}


/* =====================================================
   FORMATAR MOEDA
   ===================================================== */

function formatarMoeda(valor) {

    const numero =
        converterParaNumero(valor);


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   FORMATAR NÚMERO
   ===================================================== */

function formatarNumero(
    valor,
    casas = 1
) {

    const numero =
        converterParaNumero(valor);


    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        }
    );

}


/* =====================================================
   CONVERTER DATA
   ===================================================== */

function converterData(data) {

    if (data instanceof Date) {

        if (!Number.isNaN(data.getTime())) {
            return data;
        }

        return null;

    }


    if (typeof data === "number") {

        const dataNumerica =
            new Date(data);


        return Number.isNaN(
            dataNumerica.getTime()
        )
            ? null
            : dataNumerica;

    }


    if (typeof data !== "string") {
        return null;
    }


    const valor =
        data.trim();


    if (!valor) {
        return null;
    }


    /*
     * DD/MM/YYYY
     */

    const formatoBrasileiro =
        valor.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );


    if (formatoBrasileiro) {

        const dia =
            Number(formatoBrasileiro[1]);

        const mes =
            Number(formatoBrasileiro[2]) - 1;

        const ano =
            Number(formatoBrasileiro[3]);


        const dataBrasileira =
            new Date(
                ano,
                mes,
                dia
            );


        return Number.isNaN(
            dataBrasileira.getTime()
        )
            ? null
            : dataBrasileira;

    }


    /*
     * YYYY-MM-DD
     *
     * Tratado manualmente para evitar
     * deslocamento de dia causado por UTC.
     */

    const formatoISOData =
        valor.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (formatoISOData) {

        const ano =
            Number(formatoISOData[1]);

        const mes =
            Number(formatoISOData[2]) - 1;

        const dia =
            Number(formatoISOData[3]);


        const dataLocal =
            new Date(
                ano,
                mes,
                dia
            );


        return Number.isNaN(
            dataLocal.getTime()
        )
            ? null
            : dataLocal;

    }


    /*
     * Datas ISO completas vindas do Supabase.
     */

    const dataISO =
        new Date(valor);


    if (!Number.isNaN(dataISO.getTime())) {
        return dataISO;
    }


    return null;

}


/* =====================================================
   FORMATAR DATA
   ===================================================== */

function formatarData(
    data,
    incluirHora = false
) {

    const dataConvertida =
        converterData(data);


    if (!dataConvertida) {
        return "Data não informada";
    }


    const opcoes = {

        day: "2-digit",
        month: "2-digit",
        year: "numeric"

    };


    if (incluirHora) {

        opcoes.hour = "2-digit";
        opcoes.minute = "2-digit";

    }


    return new Intl.DateTimeFormat(
        "pt-BR",
        opcoes
    ).format(dataConvertida);

}


/* =====================================================
   FORMATAR DATA POR EXTENSO
   ===================================================== */

function formatarDataExtenso(data) {

    const dataConvertida =
        converterData(data);


    if (!dataConvertida) {
        return "Data não informada";
    }


    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    ).format(dataConvertida);

}


/* =====================================================
   FORMATAR DATA ISO
   ===================================================== */

function formatarDataISO(data) {

    const dataConvertida =
        converterData(data);


    if (!dataConvertida) {
        return "";
    }


    const ano =
        dataConvertida.getFullYear();

    const mes =
        String(
            dataConvertida.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            dataConvertida.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


/* =====================================================
   VERIFICAR SE É HOJE
   ===================================================== */

function ehHoje(data) {

    const dataConvertida =
        converterData(data);


    if (!dataConvertida) {
        return false;
    }


    const hoje =
        new Date();


    return (
        dataConvertida.getDate() === hoje.getDate() &&
        dataConvertida.getMonth() === hoje.getMonth() &&
        dataConvertida.getFullYear() === hoje.getFullYear()
    );

}


/* =====================================================
   OBTER INICIAIS
   ===================================================== */

function obterIniciais(nome) {

    if (!nome) {
        return "?";
    }


    const texto =
        String(nome)
            .trim()
            .replace(/\s+/g, " ");


    if (!texto) {
        return "?";
    }


    const partes =
        texto.split(" ");


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


/* =====================================================
   ESCAPAR HTML
   ===================================================== */

function escaparHtml(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   OBTER ELEMENTO
   ===================================================== */

function obterElemento(id) {

    if (!id) {
        return null;
    }


    return document.getElementById(id);

}


/* =====================================================
   DEFINIR TEXTO
   ===================================================== */

function definirTexto(
    id,
    texto,
    fallback = "Não informado"
) {

    const elemento =
        obterElemento(id);


    if (!elemento) {

        console.warn(
            `Elemento #${id} não encontrado.`
        );

        return;

    }


    if (
        texto === null ||
        texto === undefined ||
        String(texto).trim() === ""
    ) {

        elemento.textContent =
            fallback;

        return;

    }


    elemento.textContent =
        String(texto);

}


/* =====================================================
   MOSTRAR / ESCONDER ELEMENTO
   ===================================================== */

function mostrarElemento(
    elemento,
    mostrar = true
) {

    if (!elemento) {
        return;
    }


    elemento.hidden =
        !mostrar;


    if (mostrar) {

        elemento.removeAttribute(
            "aria-hidden"
        );

    } else {

        elemento.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


/* =====================================================
   MOSTRAR / ESCONDER POR ID
   ===================================================== */

function mostrarElementoPorId(
    id,
    mostrar = true
) {

    const elemento =
        obterElemento(id);


    mostrarElemento(
        elemento,
        mostrar
    );

}


/* =====================================================
   ATUALIZAR ÍCONES LUCIDE
   ===================================================== */

function renderizarIcones() {

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }

}


/* =====================================================
   NORMALIZAR NOTA
   ===================================================== */

function normalizarNota(valor) {

    const numero =
        converterParaNumero(valor);


    if (numero <= 0) {
        return 0;
    }


    if (numero > 5) {
        return 5;
    }


    return numero;

}


/* =====================================================
   FORMATAR NOTA
   ===================================================== */

function formatarNota(valor) {

    const nota =
        normalizarNota(valor);


    return nota.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }
    );

}


/* =====================================================
   TEXTO DE DISPONIBILIDADE
   ===================================================== */

function obterTextoDisponibilidade(
    disponivel
) {

    if (
        disponivel === true ||
        disponivel === "true" ||
        disponivel === 1 ||
        disponivel === "1"
    ) {

        return "Disponível";

    }


    if (
        disponivel === false ||
        disponivel === "false" ||
        disponivel === 0 ||
        disponivel === "0"
    ) {

        return "Indisponível";

    }


    return "Não informado";

}


/* =====================================================
   CONVERTER PARA BOOLEANO
   ===================================================== */

function converterParaBooleano(valor) {

    if (typeof valor === "boolean") {
        return valor;
    }


    if (
        valor === 1 ||
        valor === "1" ||
        valor === "true" ||
        valor === "TRUE" ||
        valor === "sim" ||
        valor === "SIM"
    ) {

        return true;

    }


    if (
        valor === 0 ||
        valor === "0" ||
        valor === "false" ||
        valor === "FALSE" ||
        valor === "nao" ||
        valor === "não" ||
        valor === "NAO" ||
        valor === "NÃO"
    ) {

        return false;

    }


    return Boolean(valor);

}


/* =====================================================
   OBTER PARÂMETRO DA URL
   ===================================================== */

function obterParametroUrl(
    nome
) {

    if (!nome) {
        return "";
    }


    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        return (
            parametros.get(nome) || ""
        ).trim();

    } catch (erro) {

        console.warn(
            "Não foi possível ler parâmetro da URL:",
            erro
        );

        return "";

    }

}


/* =====================================================
   OBTER ID DO PERFIL DA URL
   ===================================================== */

function obterPerfilIdUrl() {

    const valor =
        obterParametroUrl("id");


    if (!valor) {
        return null;
    }


    const numero =
        Number(valor);


    if (
        !Number.isInteger(numero) ||
        numero <= 0
    ) {

        return null;

    }


    return numero;

}


/* =====================================================
   CONSTRUIR URL DO PERFIL
   ===================================================== */

function construirUrlPerfil(
    perfilId
) {

    if (
        perfilId === null ||
        perfilId === undefined ||
        perfilId === ""
    ) {

        return "";

    }


    return (
        window.location.origin +
        window.location.pathname +
        "?id=" +
        encodeURIComponent(perfilId)
    );

}


/* =====================================================
   COPIAR TEXTO
   ===================================================== */

async function copiarTexto(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return false;

    }


    const valor =
        String(texto);


    if (!valor) {
        return false;
    }


    try {

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {

            await navigator.clipboard.writeText(
                valor
            );

            return true;

        }

    } catch (erro) {

        console.warn(
            "Clipboard API indisponível:",
            erro
        );

    }


    try {

        const textarea =
            document.createElement("textarea");


        textarea.value =
            valor;


        textarea.style.position =
            "fixed";

        textarea.style.opacity =
            "0";

        textarea.style.pointerEvents =
            "none";


        document.body.appendChild(
            textarea
        );


        textarea.focus();
        textarea.select();


        const resultado =
            document.execCommand("copy");


        textarea.remove();


        return resultado;

    } catch (erro) {

        console.error(
            "Erro ao copiar texto:",
            erro
        );


        return false;

    }

}


/* =====================================================
   ABRIR URL
   ===================================================== */

function abrirUrl(
    url,
    novaAba = true
) {

    if (!url) {
        return;
    }


    try {

        if (novaAba) {

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        } else {

            window.location.href =
                url;

        }

    } catch (erro) {

        console.error(
            "Erro ao abrir URL:",
            erro
        );

    }

}


/* =====================================================
   FORMATAR WHATSAPP
   ===================================================== */

function normalizarTelefone(
    telefone
) {

    if (
        telefone === null ||
        telefone === undefined
    ) {

        return "";

    }


    return String(telefone)
        .replace(/\D/g, "");

}


/* =====================================================
   CONSTRUIR URL DO WHATSAPP
   ===================================================== */

function construirUrlWhatsApp(
    telefone,
    mensagem = ""
) {

    const numero =
        normalizarTelefone(
            telefone
        );


    if (!numero) {
        return "";
    }


    const texto =
        mensagem
            ? encodeURIComponent(mensagem)
            : "";


    return (
        "https://wa.me/" +
        numero +
        (
            texto
                ? "?text=" + texto
                : ""
        )
    );

}


/* =====================================================
   MOSTRAR TOAST
   ===================================================== */

function mostrarToast(
    mensagem,
    tipo = "sucesso",
    duracao = 3000
) {

    const toast =
        document.getElementById("toast");


    if (!toast) {

        console.warn(
            "Elemento #toast não encontrado."
        );

        return;

    }


    /*
     * O HTML atual utiliza o próprio
     * elemento #toast como área de mensagem.
     */

    toast.textContent =
        mensagem ||
        "Operação realizada.";


    toast.classList.remove(
        "sucesso",
        "erro",
        "aviso",
        "info",
        "show",
        "visible"
    );


    if (tipo) {
        toast.classList.add(tipo);
    }


    void toast.offsetWidth;


    toast.classList.add("show");


    if (toast._timeoutToast) {

        clearTimeout(
            toast._timeoutToast
        );

    }


    toast._timeoutToast =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, duracao);

}


/* =====================================================
   GERAR ID TEMPORÁRIO
   ===================================================== */

function gerarIdTemporario(
    prefixo = "item"
) {

    return (
        prefixo +
        "-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =====================================================
   ESPERAR
   ===================================================== */

function esperar(
    milissegundos = 0
) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milissegundos
            );

        }
    );

}


/* =====================================================
   LOG CONTROLADO
   ===================================================== */

function log(...argumentos) {

    if (
        window.MusicalWorldDebug === true
    ) {

        console.log(
            "[ApresentarPerfil]",
            ...argumentos
        );

    }

}


/* =====================================================
   AVISO CONTROLADO
   ===================================================== */

function aviso(...argumentos) {

    console.warn(
        "[ApresentarPerfil]",
        ...argumentos
    );

}


/* =====================================================
   ERRO CONTROLADO
   ===================================================== */

function erro(...argumentos) {

    console.error(
        "[ApresentarPerfil]",
        ...argumentos
    );

}


/* =====================================================
   OBJETO PÚBLICO
   ===================================================== */

const ApresentarPerfilUtils = {

    normalizarTexto,
    normalizarArray,
    obterPrimeiroValor,

    converterParaNumero,
    formatarMoeda,
    formatarNumero,

    converterData,
    formatarData,
    formatarDataExtenso,
    formatarDataISO,
    ehHoje,

    obterIniciais,
    escaparHtml,

    obterElemento,
    definirTexto,
    mostrarElemento,
    mostrarElementoPorId,

    renderizarIcones,

    normalizarNota,
    formatarNota,

    obterTextoDisponibilidade,
    converterParaBooleano,

    obterParametroUrl,
    obterPerfilIdUrl,
    construirUrlPerfil,

    copiarTexto,
    abrirUrl,

    normalizarTelefone,
    construirUrlWhatsApp,

    mostrarToast,

    gerarIdTemporario,
    esperar,

    log,
    aviso,
    erro

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.ApresentarPerfilUtils =
    ApresentarPerfilUtils;


/* =====================================================
   CONFIRMAÇÃO DE CARREGAMENTO
   ===================================================== */

console.log(
    "ApresentarPerfilUtils.js carregado."
);


})(window);
