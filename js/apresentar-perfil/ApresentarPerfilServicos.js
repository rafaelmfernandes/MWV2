/* =========================================================
MUSICALWORLD — APRESENTAR PERFIL
Arquivo: ApresentarPerfilServicos.js

Responsabilidade:

* Renderizar os serviços oferecidos pelo perfil.
* Normalizar diferentes formatos de serviços.
* Exibir descrição, valor, duração e disponibilidade.
* Trabalhar independentemente do usuário logado.

IMPORTANTE:
Este arquivo não consulta o Supabase diretamente.
Os dados são fornecidos pelo ApresentarPerfilDados.js.
========================================================= */

(function (window) {


"use strict";


/* =====================================================
   ESTADO
   ===================================================== */

let servicos = [];

let inicializado = false;


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    elementos: {

        servicesList: "servicesList"

    }

};


/* =====================================================
   UTILITÁRIOS
   ===================================================== */

function obterUtils() {

    return window.ApresentarPerfilUtils || {};

}


function obterElemento(id) {

    const utils =
        obterUtils();


    if (
        typeof utils.obterElemento === "function"
    ) {

        return utils.obterElemento(id);

    }


    return document.getElementById(id);

}


function escaparHtml(valor) {

    const utils =
        obterUtils();


    if (
        typeof utils.escaparHtml === "function"
    ) {

        return utils.escaparHtml(valor);

    }


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


function converterParaNumero(valor) {

    const utils =
        obterUtils();


    if (
        typeof utils.converterParaNumero === "function"
    ) {

        return utils.converterParaNumero(valor);

    }


    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;

    }


    if (typeof valor === "number") {

        return Number.isFinite(valor)
            ? valor
            : null;

    }


    const numero =
        Number(
            String(valor)
                .replace(/[^\d,.-]/g, "")
                .replace(/\./g, "")
                .replace(",", ".")
        );


    return Number.isFinite(numero)
        ? numero
        : null;

}


function formatarMoeda(valor) {

    const utils =
        obterUtils();


    if (
        typeof utils.formatarMoeda === "function"
    ) {

        return utils.formatarMoeda(valor);

    }


    const numero =
        converterParaNumero(valor);


    if (numero === null) {
        return "";
    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function renderizarIcones() {

    const utils =
        obterUtils();


    if (
        typeof utils.renderizarIcones === "function"
    ) {

        utils.renderizarIcones();

    }

}


/* =====================================================
   NORMALIZAR SERVIÇOS
   ===================================================== */

function normalizarLista(
    dados
) {

    let lista =
        dados;


    /*
     * Aceita:
     *
     * array
     * { servicos: [] }
     * { services: [] }
     * { lista: [] }
     * { itens: [] }
     * JSON em string
     * string separada por vírgulas
     */

    if (
        typeof lista === "string"
    ) {

        const texto =
            lista.trim();


        if (!texto) {

            return [];

        }


        try {

            const convertido =
                JSON.parse(texto);


            if (
                Array.isArray(convertido)
            ) {

                lista =
                    convertido;

            } else if (
                convertido &&
                typeof convertido === "object"
            ) {

                lista =
                    convertido.servicos ||
                    convertido.services ||
                    convertido.lista ||
                    convertido.itens ||
                    [];

            }

        } catch (erro) {

            lista =
                texto
                    .split(",")
                    .map(item =>
                        item.trim()
                    )
                    .filter(Boolean);

        }

    }


    if (
        lista &&
        !Array.isArray(lista) &&
        typeof lista === "object"
    ) {

        lista =
            lista.servicos ||
            lista.services ||
            lista.lista ||
            lista.itens ||
            lista.items ||
            [];

    }


    if (!Array.isArray(lista)) {

        lista = [];

    }


    return lista;

}


/* =====================================================
   NORMALIZAR UM SERVIÇO
   ===================================================== */

function normalizarServico(
    item,
    indice
) {

    /*
     * Serviço simples em texto.
     */

    if (
        typeof item === "string"
    ) {

        return {

            id:
                `servico-${indice}`,

            nome:
                item.trim(),

            descricao:
                "",

            valor:
                null,

            valorMinimo:
                null,

            valorMaximo:
                null,

            tipoCobranca:
                "",

            duracao:
                "",

            ativo:
                true

        };

    }


    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;

    }


    const nome =
        item.nome ||
        item.titulo ||
        item.nome_servico ||
        item.nomeServico ||
        item.servico ||
        item.servico_nome ||
        item.servicoNome ||
        item.tipo_servico ||
        item.tipoServico ||
        "";


    const descricao =
        item.descricao ||
        item.descricao_servico ||
        item.descricaoServico ||
        item.detalhes ||
        item.observacao ||
        item.observacoes ||
        "";


    const valor =
        item.valor ??
        item.preco ??
        item.preço ??
        item.valor_servico ??
        item.valorServico ??
        item.preco_servico ??
        item.precoServico ??
        item.cache ??
        item.cachê ??
        null;


    const valorMinimo =
        item.valor_minimo ??
        item.valorMinimo ??
        item.preco_minimo ??
        item.precoMinimo ??
        item.minimo ??
        item.min ??
        null;


    const valorMaximo =
        item.valor_maximo ??
        item.valorMaximo ??
        item.preco_maximo ??
        item.precoMaximo ??
        item.maximo ??
        item.max ??
        null;


    const tipoCobranca =
        item.tipo_cobranca ||
        item.tipoCobranca ||
        item.forma_cobranca ||
        item.formaCobranca ||
        item.unidade_cobranca ||
        item.unidadeCobranca ||
        item.periodo ||
        item.unidade ||
        "";


    const duracao =
        item.duracao ||
        item.duração ||
        item.duracao_servico ||
        item.duracaoServico ||
        item.tempo ||
        item.tempo_duracao ||
        item.tempoDuracao ||
        "";


    const ativo =
        item.ativo ??
        item.disponivel ??
        item.disponibilidade ??
        item.status_ativo ??
        item.statusAtivo ??
        true;


    return {

        id:
            item.id ||
            `servico-${indice}`,

        nome:
            String(nome).trim(),

        descricao:
            String(descricao).trim(),

        valor:
            converterParaNumero(valor),

        valorMinimo:
            converterParaNumero(valorMinimo),

        valorMaximo:
            converterParaNumero(valorMaximo),

        tipoCobranca:
            String(tipoCobranca).trim(),

        duracao:
            String(duracao).trim(),

        ativo:
            ativo !== false &&
            ativo !== "false" &&
            ativo !== 0 &&
            ativo !== "0"

    };

}


function normalizarServicos(
    dados
) {

    const lista =
        normalizarLista(
            dados
        );


    return lista
        .map(
            (item, indice) =>
                normalizarServico(
                    item,
                    indice
                )
        )
        .filter(
            item =>
                item &&
                item.nome
        );

}


/* =====================================================
   FORMATAR TIPO DE COBRANÇA
   ===================================================== */

function formatarTipoCobranca(
    valor
) {

    if (!valor) {
        return "";
    }


    const texto =
        String(valor)
            .trim()
            .toLowerCase();


    const mapa = {

        hora: "por hora",

        horas: "por hora",

        diaria: "por diária",

        diária: "por diária",

        dia: "por dia",

        dias: "por dia",

        evento: "por evento",

        apresentação: "por apresentação",

        apresentacao: "por apresentação",

        show: "por apresentação",

        serviço: "por serviço",

        servico: "por serviço",

        mensal: "mensal",

        semana: "semanal",

        semanal: "semanal",

        projeto: "por projeto"

    };


    return mapa[texto] ||
        valor;

}


/* =====================================================
   FORMATAR PREÇO
   ===================================================== */

function formatarPreco(
    servico
) {

    if (!servico) {
        return "";
    }


    const valor =
        servico.valor;


    const valorMinimo =
        servico.valorMinimo;


    const valorMaximo =
        servico.valorMaximo;


    /*
     * Valor único.
     */

    if (
        valor !== null &&
        valor !== undefined
    ) {

        return formatarMoeda(
            valor
        );

    }


    /*
     * Faixa de valores.
     */

    if (
        valorMinimo !== null &&
        valorMinimo !== undefined &&
        valorMaximo !== null &&
        valorMaximo !== undefined
    ) {

        return (
            formatarMoeda(valorMinimo) +
            " – " +
            formatarMoeda(valorMaximo)
        );

    }


    if (
        valorMinimo !== null &&
        valorMinimo !== undefined
    ) {

        return (
            "A partir de " +
            formatarMoeda(valorMinimo)
        );

    }


    if (
        valorMaximo !== null &&
        valorMaximo !== undefined
    ) {

        return (
            "Até " +
            formatarMoeda(valorMaximo)
        );

    }


    return "Consultar valor";

}


/* =====================================================
   MONTAR METADADOS
   ===================================================== */

function criarMetadados(
    servico
) {

    const metadados = [];


    if (
        servico.tipoCobranca
    ) {

        metadados.push({

            icone: "receipt",

            texto:
                formatarTipoCobranca(
                    servico.tipoCobranca
                )

        });

    }


    if (
        servico.duracao
    ) {

        metadados.push({

            icone: "clock-3",

            texto:
                servico.duracao

        });

    }


    return metadados;

}


/* =====================================================
   ESTADO VAZIO
   ===================================================== */

function renderizarEstadoVazio(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i data-lucide="briefcase-business"></i>

            <strong>
                Nenhum serviço cadastrado
            </strong>

            <span>
                Os serviços oferecidos por este perfil aparecerão aqui.
            </span>

        </div>

    `;


    renderizarIcones();

}


/* =====================================================
   RENDERIZAR
   ===================================================== */

function renderizar(
    dados
) {

    servicos =
        normalizarServicos(
            dados
        );


    const container =
        obterElemento(
            CONFIG.elementos.servicesList
        );


    if (!container) {

        console.warn(
            "ApresentarPerfilServicos: #servicesList não encontrado."
        );


        return servicos;

    }


    /*
     * Mostra somente serviços ativos.
     */

    const servicosAtivos =
        servicos.filter(
            servico =>
                servico.ativo !== false
        );


    if (!servicosAtivos.length) {

        renderizarEstadoVazio(
            container
        );


        return servicos;

    }


    container.innerHTML =
        servicosAtivos
            .map(
                (
                    servico,
                    indice
                ) =>
                    criarCardServico(
                        servico,
                        indice
                    )
            )
            .join("");


    renderizarIcones();


    return servicos;

}


/* =====================================================
   CRIAR CARD DE SERVIÇO
   ===================================================== */

function criarCardServico(
    servico,
    indice
) {

    const nome =
        escaparHtml(
            servico.nome
        );


    const descricao =
        escaparHtml(
            servico.descricao
        );


    const preco =
        escaparHtml(
            formatarPreco(
                servico
            )
        );


    const metadados =
        criarMetadados(
            servico
        );


    const htmlMetadados =
        metadados.length
            ? `
                <div class="service-meta">

                    ${

                        metadados
                            .map(
                                meta => `

                                    <span class="service-meta-item">

                                        <i
                                            data-lucide="${escaparHtml(meta.icone)}"
                                        ></i>

                                        <span>
                                            ${escaparHtml(meta.texto)}
                                        </span>

                                    </span>

                                `
                            )
                            .join("")

                    }

                </div>
              `
            : "";


    return `

        <article
            class="service-card"
            data-service-index="${indice}"
            data-service-id="${escaparHtml(servico.id)}"
        >

            <div class="service-card-header">

                <div class="service-icon">

                    <i data-lucide="guitar"></i>

                </div>


                <div class="service-card-title-area">

                    <h3>
                        ${nome}
                    </h3>

                </div>

            </div>


            ${
                descricao
                    ? `
                        <p class="service-description">
                            ${descricao}
                        </p>
                      `
                    : ""
            }


            ${htmlMetadados}


            <div class="service-card-footer">

                <div class="service-price">

                    <span class="service-price-label">
                        Valor
                    </span>

                    <strong>
                        ${preco}
                    </strong>

                </div>

            </div>

        </article>

    `;

}


/* =====================================================
   INICIALIZAR
   ===================================================== */

function inicializar(
    dados = null
) {

    if (dados !== null) {

        renderizar(
            dados
        );

    } else if (
        window.ApresentarPerfilDados &&
        typeof window.ApresentarPerfilDados
            .obterServicos === "function"
    ) {

        renderizar(
            window.ApresentarPerfilDados
                .obterServicos()
        );

    } else {

        renderizar([]);

    }


    inicializado = true;


    return servicos;

}


/* =====================================================
   ATUALIZAR
   ===================================================== */

function atualizar(
    dados
) {

    return renderizar(
        dados
    );

}


/* =====================================================
   OBTER SERVIÇOS
   ===================================================== */

function obterServicos() {

    return [
        ...servicos
    ];

}


/* =====================================================
   OBTER SERVIÇO POR ID
   ===================================================== */

function obterServicoPorId(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;

    }


    return (
        servicos.find(
            servico =>
                String(servico.id) ===
                String(id)
        ) ||
        null
    );

}


/* =====================================================
   OBTER SERVIÇOS ATIVOS
   ===================================================== */

function obterServicosAtivos() {

    return servicos.filter(
        servico =>
            servico.ativo !== false
    );

}


/* =====================================================
   VERIFICAR INICIALIZAÇÃO
   ===================================================== */

function estaInicializado() {

    return inicializado;

}


/* =====================================================
   LIMPAR
   ===================================================== */

function limpar() {

    servicos = [];

    inicializado = false;


    const container =
        obterElemento(
            CONFIG.elementos.servicesList
        );


    if (container) {

        container.innerHTML = "";

    }

}


/* =====================================================
   OBJETO PÚBLICO
   ===================================================== */

const ApresentarPerfilServicos = {

    inicializar,

    renderizar,

    atualizar,

    obterServicos,

    obterServicoPorId,

    obterServicosAtivos,

    estaInicializado,

    limpar,

    normalizarLista,

    normalizarServico,

    normalizarServicos,

    formatarPreco,

    formatarTipoCobranca

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.ApresentarPerfilServicos =
    ApresentarPerfilServicos;


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "ApresentarPerfilServicos.js carregado."
);


})(window);
