(function (window) {

"use strict";

/* =========================================================
MUSICALWORLD — PERFIL INSTRUMENTOS
Arquivo: PerfilInstrumentos.js

Responsabilidades:

* Criar a seção de instrumentos para o perfil Músico(a)
* Renderizar os instrumentos disponíveis
* Permitir seleção dos instrumentos
* Integrar com PerfilUtils
* Integrar com PerfilEditor
* Manter os valores selecionados no campo #instrumentos
* Não realizar gravação direta no Supabase

Observação:

O PerfilEditor.js já é responsável por salvar:


   instrumentos: PerfilUtils.obterChipsSelecionados("instrumentos")


Portanto este módulo cuida somente da interface e estado
dos instrumentos.
========================================================= */

/* =========================================================
CONFIGURAÇÃO
========================================================= */

const CONFIG = {


containerId: "instrumentos",

campoId: "campoInstrumentos",

campoEstilosId: "estilos",

titulo: "Instrumentos que toca",

descricao:
    "Selecione os instrumentos que você toca para mostrar aos contratantes.",

ajuda:
    "Você pode selecionar mais de um instrumento.",

icone:
    "music-2",

instrumentos: [

    {
        valor: "Violão",
        label: "Violão"
    },

    {
        valor: "Guitarra",
        label: "Guitarra"
    },

    {
        valor: "Baixo",
        label: "Baixo"
    },

    {
        valor: "Teclado",
        label: "Teclado"
    },

    {
        valor: "Piano",
        label: "Piano"
    },

    {
        valor: "Bateria",
        label: "Bateria"
    },

    {
        valor: "Percussão",
        label: "Percussão"
    },

    {
        valor: "Cajón",
        label: "Cajón"
    },

    {
        valor: "Cavaco",
        label: "Cavaco"
    },

    {
        valor: "Ukulele",
        label: "Ukulele"
    },

    {
        valor: "Acordeon",
        label: "Acordeon"
    },

    {
        valor: "Gaita",
        label: "Gaita"
    },

    {
        valor: "Violino",
        label: "Violino"
    },

    {
        valor: "Viola",
        label: "Viola"
    },

    {
        valor: "Violoncelo",
        label: "Violoncelo"
    },

    {
        valor: "Contrabaixo acústico",
        label: "Contrabaixo acústico"
    },

    {
        valor: "Saxofone",
        label: "Saxofone"
    },

    {
        valor: "Trompete",
        label: "Trompete"
    },

    {
        valor: "Trombone",
        label: "Trombone"
    },

    {
        valor: "Flauta",
        label: "Flauta"
    },

    {
        valor: "Clarinete",
        label: "Clarinete"
    },

    {
        valor: "Instrumentos de sopro",
        label: "Instrumentos de sopro"
    }

]


};

/* =========================================================
ESTADO
========================================================= */

const estado = {


inicializado: false,

configurado: false,

contexto: null,

selecionados: []


};

/* =========================================================
REFERÊNCIAS
========================================================= */

function obterContainer() {


return document.getElementById(
    CONFIG.containerId
);


}

function obterCampo() {


return document.getElementById(
    CONFIG.campoId
);


}

/* =========================================================
NORMALIZAÇÃO
========================================================= */

function normalizarTexto(valor) {


return String(valor || "")
    .trim()
    .replace(/\s+/g, " ");


}

function normalizarValor(valor) {


return normalizarTexto(valor)
    .toLocaleLowerCase("pt-BR");


}

function normalizarLista(valor) {


if (!valor) {

    return [];

}


let lista = [];


if (Array.isArray(valor)) {

    lista = valor;

} else if (typeof valor === "string") {

    lista = valor
        .split(",")
        .map(item => item.trim());

}


const resultado = [];


lista.forEach(item => {

    const texto =
        normalizarTexto(item);


    if (!texto) {

        return;

    }


    const existente =
        resultado.find(
            atual =>
                normalizarValor(atual) ===
                normalizarValor(texto)
        );


    if (!existente) {

        resultado.push(texto);

    }

});


return resultado;


}

/* =========================================================
CRIAÇÃO DO CAMPO
========================================================= */

function criarCampo() {


const campoExistente =
    obterCampo();


if (campoExistente) {

    /*
     * Garante que um campo existente também seja reconhecido
     * como um módulo independente.
     */

    const containerExistente =
        campoExistente.querySelector(
            `#${CONFIG.containerId}`
        );


    if (containerExistente) {

        containerExistente.dataset.chipModule =
            "true";

    }


    return campoExistente;

}


const containerEstilos =
    document.getElementById(
        CONFIG.campoEstilosId
    );


if (!containerEstilos) {

    console.warn(
        "PerfilInstrumentos: campo #estilos não encontrado."
    );

    return null;

}


const campoEstilos =
    containerEstilos.closest(".campo");


if (!campoEstilos) {

    console.warn(
        "PerfilInstrumentos: container .campo de #estilos não encontrado."
    );

    return null;

}


const campo =
    document.createElement("div");


campo.className =
    "campo";


campo.id =
    CONFIG.campoId;


campo.innerHTML = `

    <label for="${CONFIG.containerId}">
        ${CONFIG.titulo}
    </label>

    <div
        class="chips"
        id="${CONFIG.containerId}"
        role="group"
        aria-label="${CONFIG.titulo}"
        data-chip-module="true"
    ></div>

    <span class="campo-ajuda">
        ${CONFIG.ajuda}
    </span>

`;


campoEstilos.insertAdjacentElement(
    "afterend",
    campo
);


return campo;


}

/* =========================================================
RENDERIZAÇÃO DOS CHIPS
========================================================= */

function renderizar() {


let container =
    obterContainer();


if (!container) {

    criarCampo();

    container =
        obterContainer();

}


if (!container) {

    console.error(
        "PerfilInstrumentos: não foi possível criar #instrumentos."
    );

    return;

}


/*
 * Este container pertence exclusivamente ao módulo
 * PerfilInstrumentos.
 *
 * O PerfilUtils não adicionará listeners nele.
 */

container.dataset.chipModule =
    "true";


container.innerHTML =
    "";


CONFIG.instrumentos.forEach(
    instrumento => {

        const chip =
            document.createElement("button");


        chip.type =
            "button";


        chip.className =
            "chip";


        chip.dataset.value =
            instrumento.valor;


        chip.textContent =
            instrumento.label;


        chip.setAttribute(
            "aria-pressed",
            "false"
        );


        /*
         * O listener deste chip pertence somente
         * ao PerfilInstrumentos.
         */

        chip.addEventListener(
            "click",
            function () {

                alternarInstrumento(
                    instrumento.valor,
                    chip
                );

            }
        );


        container.appendChild(
            chip
        );

    }
);


marcarSelecionados(
    estado.selecionados
);


}

/* =========================================================
ALTERNAR INSTRUMENTO
========================================================= */

function alternarInstrumento(
valor,
elemento
) {


const valorNormalizado =
    normalizarValor(valor);


const index =
    estado.selecionados.findIndex(
        item =>
            normalizarValor(item) ===
            valorNormalizado
    );


if (index >= 0) {

    estado.selecionados.splice(
        index,
        1
    );

} else {

    estado.selecionados.push(
        valor
    );

}


const ativo =
    estado.selecionados.some(
        item =>
            normalizarValor(item) ===
            valorNormalizado
    );


if (elemento) {

    elemento.classList.toggle(
        "ativo",
        ativo
    );


    elemento.setAttribute(
        "aria-pressed",
        ativo
            ? "true"
            : "false"
    );

}


sincronizarEstado();


}

/* =========================================================
MARCAR SELECIONADOS
========================================================= */

function marcarSelecionados(
valores
) {


const lista =
    normalizarLista(valores);


estado.selecionados =
    lista.filter(
        valor => {

            return CONFIG.instrumentos.some(
                instrumento =>
                    normalizarValor(
                        instrumento.valor
                    ) ===
                    normalizarValor(
                        valor
                    )
            );

        }
    );


const container =
    obterContainer();


if (!container) {

    return;

}


const chips =
    container.querySelectorAll(
        ".chip"
    );


chips.forEach(
    chip => {

        const valor =
            chip.dataset.value || "";


        const ativo =
            estado.selecionados.some(
                selecionado =>
                    normalizarValor(
                        selecionado
                    ) ===
                    normalizarValor(
                        valor
                    )
            );


        chip.classList.toggle(
            "ativo",
            ativo
        );


        chip.setAttribute(
            "aria-pressed",
            ativo
                ? "true"
                : "false"
        );

    }
);


}

/* =========================================================
SINCRONIZAÇÃO COM O ESTADO DO EDITOR
========================================================= */

function sincronizarEstado() {


if (
    !estado.contexto ||
    !estado.contexto.estado
) {

    return;

}


if (
    !estado.contexto.estado.perfilArtista
) {

    estado.contexto.estado.perfilArtista =
        {};

}


estado.contexto.estado.perfilArtista.instrumentos =
    [
        ...estado.selecionados
    ];


}

/* =========================================================
OBTER SELECIONADOS
========================================================= */

function obterSelecionados() {


const container =
    obterContainer();


if (container) {

    const ativos =
        container.querySelectorAll(
            ".chip.ativo"
        );


    if (ativos.length) {

        return Array.from(
            ativos
        )
            .map(
                chip =>
                    chip.dataset.value
            )
            .filter(Boolean);

    }

}


return [
    ...estado.selecionados
];


}

/* =========================================================
CARREGAR
========================================================= */

function carregar(
valores
) {


let instrumentos =
    valores;


if (
    typeof valores === "undefined" &&
    estado.contexto &&
    estado.contexto.estado &&
    estado.contexto.estado.perfilArtista
) {

    instrumentos =
        estado.contexto.estado.perfilArtista.instrumentos;

}


estado.selecionados =
    normalizarLista(
        instrumentos
    );


marcarSelecionados(
    estado.selecionados
);


sincronizarEstado();


}

/* =========================================================
LIMPAR
========================================================= */

function limpar() {


estado.selecionados =
    [];


marcarSelecionados(
    []
);


sincronizarEstado();


}

/* =========================================================
CONFIGURAR
========================================================= */

function configurar(
contexto
) {


estado.contexto =
    contexto || null;


estado.configurado =
    true;


}

/* =========================================================
INICIALIZAR
========================================================= */

function inicializar() {


if (
    estado.inicializado
) {

    return;

}


criarCampo();

renderizar();


estado.inicializado =
    true;


/*
 * Se o PerfilUtils estiver disponível,
 * garantimos a compatibilidade com a estrutura
 * de chips utilizada pelo restante do editor.
 *
 * Os eventos próprios deste módulo continuam sendo
 * usados para evitar dependência de listeners globais.
 */

if (
    window.PerfilUtils &&
    typeof window.PerfilUtils.normalizarArray === "function"
) {

    estado.selecionados =
        window.PerfilUtils.normalizarArray(
            estado.selecionados
        );

}


}

/* =========================================================
DESTRUIR
========================================================= */

function destruir() {


const campo =
    obterCampo();


if (campo) {

    campo.remove();

}


estado.inicializado =
    false;


estado.selecionados =
    [];


}

/* =========================================================
API PÚBLICA
========================================================= */

const API = {


configurar,

inicializar,

carregar,

renderizar,

limpar,

destruir,

obterSelecionados,

marcarSelecionados,

alternarInstrumento,

sincronizarEstado,

CONFIG,

estado


};

/* =========================================================
EXPORTAÇÃO
========================================================= */

window.PerfilInstrumentos =
API;

})(window);
