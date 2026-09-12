/* =========================================================
MUSICALWORLD — PERFIL PÚBLICO
Arquivo: PerfilPublicoServicos.js

Responsabilidade:

* Renderizar os serviços do artista.
* Utilizar os dados fornecidos pelo PerfilPublicoDados.js.
* Não executar consultas diretamente no Supabase.
* Trabalhar com diferentes formatos de dados.
* Exibir estado vazio quando não houver serviços.

========================================================= */

(function (window) {


"use strict";


/* =====================================================
   DEPENDÊNCIAS
   ===================================================== */

const Utils =
    window.PerfilPublicoUtils;

const Dados =
    window.PerfilPublicoDados;


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    elementos: {

        listaServicos:
            "servicesList"

    }

};


/* =====================================================
   ESTADO
   ===================================================== */

const estado = {

    servicos: [],

    inicializado: false

};


/* =====================================================
   LOG
   ===================================================== */

function log(...mensagens) {

    console.log(
        "[PerfilPublicoServicos]",
        ...mensagens
    );

}


function aviso(...mensagens) {

    console.warn(
        "[PerfilPublicoServicos]",
        ...mensagens
    );

}


function erro(...mensagens) {

    console.error(
        "[PerfilPublicoServicos]",
        ...mensagens
    );

}


/* =====================================================
   OBTER ELEMENTO
   ===================================================== */

function obterElemento(id) {

    if (
        Utils &&
        typeof Utils.obterElemento === "function"
    ) {

        return Utils.obterElemento(
            id
        );

    }


    return document.getElementById(
        id
    );

}


/* =====================================================
   INICIALIZAR
   ===================================================== */

function inicializar(servicos = null) {

    log(
        "Inicializando serviços..."
    );


    if (
        servicos !== null &&
        servicos !== undefined
    ) {

        estado.servicos =
            normalizarServicos(
                servicos
            );

    } else {

        estado.servicos =
            obterServicosDosDados();

    }


    renderizar();


    estado.inicializado =
        true;


    log(
        "Serviços inicializados:",
        estado.servicos.length
    );


    return estado.servicos;

}


/* =====================================================
   OBTER SERVIÇOS DOS DADOS
   ===================================================== */

function obterServicosDosDados() {

    if (!Dados) {

        aviso(
            "PerfilPublicoDados.js não está disponível."
        );


        return [];

    }


    /*
     * Primeiro tenta obter diretamente do módulo
     * de dados, caso ele futuramente passe a expor
     * uma lista específica de serviços.
     */

    if (
        typeof Dados.obterServicos === "function"
    ) {

        const servicos =
            Dados.obterServicos();


        if (
            Array.isArray(servicos)
        ) {

            return normalizarServicos(
                servicos
            );

        }

    }


    /*
     * Como o PerfilPublicoDados atual concentra
     * os dados do perfil artístico, tentamos
     * recuperar os serviços diretamente dele.
     */

    let artista = null;


    if (
        typeof Dados.obterPerfilArtista === "function"
    ) {

        artista =
            Dados.obterPerfilArtista();

    }


    if (!artista) {
        return [];
    }


    const servicos =
        obterPrimeiroValor(

            artista.servicos,

            artista.servicos_oferecidos,

            artista.servicosOferecidos,

            artista.servicos_disponiveis,

            artista.servicosDisponiveis

        );


    return normalizarServicos(
        servicos
    );

}


/* =====================================================
   NORMALIZAR SERVIÇOS
   ===================================================== */

function normalizarServicos(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return [];

    }


    /*
     * Caso o banco tenha retornado JSON em formato
     * de string.
     */

    if (
        typeof valor === "string"
    ) {

        const texto =
            valor.trim();


        if (!texto) {
            return [];
        }


        /*
         * Tenta interpretar JSON.
         */

        if (
            (
                texto.startsWith("[") &&
                texto.endsWith("]")
            ) ||
            (
                texto.startsWith("{") &&
                texto.endsWith("}")
            )
        ) {

            try {

                const convertido =
                    JSON.parse(
                        texto
                    );


                return normalizarServicos(
                    convertido
                );

            } catch (error) {

                aviso(
                    "Não foi possível interpretar serviços como JSON."
                );

            }

        }


        /*
         * Caso seja apenas uma lista separada
         * por vírgulas.
         */

        return texto
            .split(",")
            .map(item =>
                item.trim()
            )
            .filter(Boolean)
            .map(item => ({
                nome: item
            }));

    }


    /*
     * Um único objeto.
     */

    if (
        typeof valor === "object" &&
        !Array.isArray(valor)
    ) {

        /*
         * Alguns formatos podem guardar os serviços
         * em uma propriedade interna.
         */

        const listaInterna =
            obterPrimeiroValor(

                valor.servicos,

                valor.items,

                valor.lista,

                valor.data

            );


        if (
            listaInterna &&
            listaInterna !== valor
        ) {

            return normalizarServicos(
                listaInterna
            );

        }


        return [
            normalizarServico(
                valor
            )
        ];

    }


    /*
     * Array de serviços.
     */

    if (
        Array.isArray(valor)
    ) {

        return valor
            .map(item =>
                normalizarServico(
                    item
                )
            )
            .filter(Boolean);

    }


    return [];

}


/* =====================================================
   NORMALIZAR UM SERVIÇO
   ===================================================== */

function normalizarServico(servico) {

    /*
     * Caso seja apenas texto.
     */

    if (
        typeof servico === "string"
    ) {

        const nome =
            servico.trim();


        if (!nome) {
            return null;
        }


        return {

            nome,

            descricao: "",

            valor: null,

            valorMinimo: null,

            valorMaximo: null,

            tipoCobranca: "",

            duracao: "",

            ativo: true

        };

    }


    if (
        !servico ||
        typeof servico !== "object"
    ) {

        return null;

    }


    const nome =
        obterPrimeiroValor(

            servico.nome,

            servico.titulo,

            servico.nome_servico,

            servico.nomeServico,

            servico.servico,

            servico.servico_nome,

            servico.descricao_servico,

            servico.tipo

        );


    /*
     * Se não existe nome, ainda tentamos usar
     * descrição como identificação.
     */

    const descricao =
        obterPrimeiroValor(

            servico.descricao,

            servico.descricao_servico,

            servico.detalhes,

            servico.observacao,

            servico.observacoes,

            servico.info

        );


    if (
        !nome &&
        !descricao
    ) {

        return null;

    }


    const valor =
        obterPrimeiroValor(

            servico.valor,

            servico.preco,

            servico.preco_servico,

            servico.valor_servico,

            servico.valor_por_servico,

            servico.price

        );


    const valorMinimo =
        obterPrimeiroValor(

            servico.valor_minimo,

            servico.valorMinimo,

            servico.preco_minimo,

            servico.precoMinimo,

            servico.minimo

        );


    const valorMaximo =
        obterPrimeiroValor(

            servico.valor_maximo,

            servico.valorMaximo,

            servico.preco_maximo,

            servico.precoMaximo,

            servico.maximo

        );


    const tipoCobranca =
        obterPrimeiroValor(

            servico.tipo_cobranca,

            servico.tipoCobranca,

            servico.forma_cobranca,

            servico.formaCobranca,

            servico.unidade,

            servico.cobranca

        );


    const duracao =
        obterPrimeiroValor(

            servico.duracao,

            servico.duracao_servico,

            servico.tempo,

            servico.tempo_duracao

        );


    const ativo =
        obterPrimeiroValor(

            servico.ativo,

            servico.disponivel,

            servico.disponibilidade,

            servico.status

        );


    return {

        original:
            servico,

        id:
            obterPrimeiroValor(
                servico.id
            ),

        nome:
            nome ||
            "Serviço",

        descricao:
            descricao || "",

        valor:
            valor !== ""
                ? valor
                : null,

        valorMinimo:
            valorMinimo !== ""
                ? valorMinimo
                : null,

        valorMaximo:
            valorMaximo !== ""
                ? valorMaximo
                : null,

        tipoCobranca:
            tipoCobranca || "",

        duracao:
            duracao || "",

        ativo:
            ativo

    };

}


/* =====================================================
   RENDERIZAR
   ===================================================== */

function renderizar(servicos = null) {

    if (
        servicos !== null &&
        servicos !== undefined
    ) {

        estado.servicos =
            normalizarServicos(
                servicos
            );

    }


    const container =
        obterElemento(
            CONFIG.elementos.listaServicos
        );


    if (!container) {

        aviso(
            `Elemento #${CONFIG.elementos.listaServicos} não encontrado.`
        );


        return;

    }


    /*
     * Caso não existam serviços.
     */

    if (
        !estado.servicos.length
    ) {

        renderizarVazio(
            container
        );


        return;

    }


    /*
     * Renderiza os serviços.
     */

    container.innerHTML =
        estado.servicos
            .map(
                (
                    servico,
                    indice
                ) =>
                    renderizarServico(
                        servico,
                        indice
                    )
            )
            .join("");


    renderizarIcones();


    log(
        "Serviços renderizados:",
        estado.servicos.length
    );

}


/* =====================================================
   RENDERIZAR SERVIÇO
   ===================================================== */

function renderizarServico(servico, indice) {


const nome = escaparHtml(
    servico.nome || `Serviço ${indice + 1}`
);

const descricao = servico.descricao
    ? escaparHtml(servico.descricao)
    : "";

const preco = renderizarPreco(servico);

const meta = renderizarMeta(servico);

const status = renderizarStatus(servico);

return `
    <article
        class="service-card"
        data-service-index="${indice}"
    >

        <div class="service-icon">
            <i
                data-lucide="briefcase-business"
                aria-hidden="true"
            ></i>
        </div>


        <div class="service-info">

            <h4 class="service-name">
                ${nome}
            </h4>


            ${
                descricao
                    ? `
                        <p class="service-description">
                            ${descricao}
                        </p>
                    `
                    : ""
            }


            ${
                meta
                    ? `
                        <div class="service-meta">
                            ${meta}
                        </div>
                    `
                    : ""
            }

        </div>


        ${
            preco || status
                ? `
                    <div class="service-side">

                        ${
                            preco
                                ? `
                                    <div class="service-price">
                                        ${preco}
                                    </div>
                                `
                                : ""
                        }


                        ${
                            status
                                ? `
                                    <div class="service-status">
                                        ${status}
                                    </div>
                                `
                                : ""
                        }

                    </div>
                `
                : ""
        }

    </article>
`;


}


/* =====================================================
   RENDERIZAR PREÇO
   ===================================================== */

function renderizarPreco(servico) {

    const valor =
        converterParaNumero(
            servico.valor
        );


    const minimo =
        converterParaNumero(
            servico.valorMinimo
        );


    const maximo =
        converterParaNumero(
            servico.valorMaximo
        );


    /*
     * Valor único.
     */

    if (
        valor !== null &&
        valor > 0
    ) {

        return `
            A partir de
            <strong>
                ${formatarMoeda(valor)}
            </strong>
        `;

    }


    /*
     * Faixa de valores.
     */

    if (
        minimo !== null &&
        minimo > 0 &&
        maximo !== null &&
        maximo > 0
    ) {

        if (
            minimo === maximo
        ) {

            return `
                <strong>
                    ${formatarMoeda(minimo)}
                </strong>
            `;

        }


        return `
            <strong>
                ${formatarMoeda(minimo)}
                -
                ${formatarMoeda(maximo)}
            </strong>
        `;

    }


    /*
     * Somente valor mínimo.
     */

    if (
        minimo !== null &&
        minimo > 0
    ) {

        return `
            A partir de
            <strong>
                ${formatarMoeda(minimo)}
            </strong>
        `;

    }


    /*
     * Somente valor máximo.
     */

    if (
        maximo !== null &&
        maximo > 0
    ) {

        return `
            Até
            <strong>
                ${formatarMoeda(maximo)}
            </strong>
        `;

    }


    return "";

}


/* =====================================================
   RENDERIZAR META
   ===================================================== */

function renderizarMeta(servico) {

    const partes = [];


    if (
        servico.tipoCobranca
    ) {

        partes.push(
            `<span>${escaparHtml(
                formatarTipoCobranca(
                    servico.tipoCobranca
                )
            )}</span>`
        );

    }


    if (
        servico.duracao
    ) {

        partes.push(
            `<span>${escaparHtml(
                String(
                    servico.duracao
                )
            )}</span>`
        );

    }


    if (!partes.length) {
        return "";
    }


    return partes.join(
        `<span class="service-meta-separator">•</span>`
    );

}


/* =====================================================
   FORMATAR TIPO DE COBRANÇA
   ===================================================== */

function formatarTipoCobranca(valor) {

    const texto =
        String(
            valor || ""
        )
        .trim()
        .toLowerCase();


    const mapa = {

        "hora":
            "por hora",

        "horas":
            "por hora",

        "hora(s)":
            "por hora",

        "evento":
            "por evento",

        "eventos":
            "por evento",

        "show":
            "por show",

        "shows":
            "por show",

        "diaria":
            "por diária",

        "diária":
            "por diária",

        "diaria(s)":
            "por diária",

        "mensal":
            "mensal",

        "mensalidade":
            "mensal"

    };


    return mapa[texto] ||
        valor;

}


/* =====================================================
   RENDERIZAR STATUS
   ===================================================== */

function renderizarStatus(servico) {

    /*
     * Se o serviço não possui status explícito,
     * não mostramos nada.
     */

    if (
        servico.ativo === "" ||
        servico.ativo === null ||
        servico.ativo === undefined
    ) {

        return "";

    }


    const ativo =
        converterParaBooleano(
            servico.ativo
        );


    if (ativo) {

        return `
            <span class="service-status-active">
                <i
                    data-lucide="check-circle-2"
                    aria-hidden="true"
                ></i>
                Disponível
            </span>
        `;

    }


    return `
        <span class="service-status-inactive">
            Indisponível
        </span>
    `;

}


/* =====================================================
   ESTADO VAZIO
   ===================================================== */

function renderizarVazio(
    container
) {

    container.innerHTML = `

        <div class="empty-state">

            <i
                data-lucide="briefcase-business"
                aria-hidden="true"
            ></i>

            <h4>
                Nenhum serviço cadastrado
            </h4>

            <p>
                Os serviços oferecidos pelo artista
                aparecerão aqui.
            </p>

        </div>

    `;


    renderizarIcones();

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

        return null;

    }


    if (
        typeof valor === "number"
    ) {

        return Number.isFinite(
            valor
        )
            ? valor
            : null;

    }


    let texto =
        String(
            valor
        )
        .trim();


    if (!texto) {
        return null;
    }


    /*
     * Remove moeda, espaços e outros caracteres.
     */

    texto =
        texto.replace(
            /R\$/gi,
            ""
        )
        .replace(
            /\s/g,
            ""
        );


    /*
     * Trata formatos brasileiros:
     * 1.500,00
     */

    if (
        texto.includes(",") &&
        texto.includes(".")
    ) {

        texto =
            texto
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );

    } else if (
        texto.includes(",")
    ) {

        texto =
            texto.replace(
                ",",
                "."
            );

    }


    texto =
        texto.replace(
            /[^0-9.-]/g,
            ""
        );


    const numero =
        Number(
            texto
        );


    return Number.isFinite(
        numero
    )
        ? numero
        : null;

}


/* =====================================================
   FORMATAR MOEDA
   ===================================================== */

function formatarMoeda(valor) {

    if (
        Utils &&
        typeof Utils.formatarMoeda === "function"
    ) {

        return Utils.formatarMoeda(
            valor
        );

    }


    const numero =
        converterParaNumero(
            valor
        );


    if (
        numero === null
    ) {

        return "R$ 0,00";

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =====================================================
   CONVERTER BOOLEANO
   ===================================================== */

function converterParaBooleano(valor) {

    if (
        Utils &&
        typeof Utils.converterParaBooleano === "function"
    ) {

        return Utils.converterParaBooleano(
            valor
        );

    }


    if (
        typeof valor === "boolean"
    ) {

        return valor;

    }


    const texto =
        String(
            valor || ""
        )
        .trim()
        .toLowerCase();


    if (
        [
            "true",
            "1",
            "sim",
            "ativo",
            "disponivel",
            "disponível"
        ].includes(
            texto
        )
    ) {

        return true;

    }


    return false;

}


/* =====================================================
   OBTER PRIMEIRO VALOR
   ===================================================== */

function obterPrimeiroValor(
    ...valores
) {

    if (
        Utils &&
        typeof Utils.obterPrimeiroValor === "function"
    ) {

        return Utils.obterPrimeiroValor(
            ...valores
        );

    }


    for (
        const valor of valores
    ) {

        if (
            valor !== null &&
            valor !== undefined &&
            String(
                valor
            ).trim() !== ""
        ) {

            return valor;

        }

    }


    return "";

}


/* =====================================================
   ESCAPAR HTML
   ===================================================== */

function escaparHtml(valor) {

    if (
        Utils &&
        typeof Utils.escaparHtml === "function"
    ) {

        return Utils.escaparHtml(
            valor
        );

    }


    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(
        valor
    )
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


/* =====================================================
   RENDERIZAR ÍCONES
   ===================================================== */

function renderizarIcones() {

    if (
        Utils &&
        typeof Utils.renderizarIcones === "function"
    ) {

        Utils.renderizarIcones();


        return;

    }


    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }

}


/* =====================================================
   ATUALIZAR
   ===================================================== */

function atualizar(
    servicos
) {

    estado.servicos =
        normalizarServicos(
            servicos
        );


    renderizar();


    return estado.servicos;

}


/* =====================================================
   OBTER SERVIÇOS
   ===================================================== */

function obterServicos() {

    return [
        ...estado.servicos
    ];

}


/* =====================================================
   LIMPAR
   ===================================================== */

function limpar() {

    estado.servicos =
        [];

    estado.inicializado =
        false;


    const container =
        obterElemento(
            CONFIG.elementos.listaServicos
        );


    if (container) {

        container.innerHTML =
            "";

    }

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const PerfilPublicoServicos = {

    CONFIG,

    estado,

    inicializar,

    renderizar,

    atualizar,

    obterServicos,

    limpar,

    normalizarServicos,

    normalizarServico

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.PerfilPublicoServicos =
    PerfilPublicoServicos;


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "PerfilPublicoServicos.js carregado."
);


})(window);
