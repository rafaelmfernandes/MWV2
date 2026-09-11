/* =========================================================
MUSICALWORLD — PERFIL PÚBLICO
Arquivo: PerfilPublicoAvaliacoes.js

Responsabilidade:

* Preparar a aba de avaliações do perfil público.
* Renderizar resumo das avaliações.
* Renderizar média e quantidade de avaliações.
* Renderizar distribuição das notas.
* Renderizar lista de avaliações quando existirem.
* Exibir estado vazio enquanto o sistema de avaliações
  ainda não estiver disponível.

IMPORTANTE:

* Este módulo NÃO consulta o Supabase.
* A tabela de avaliações será definida futuramente.
* A estrutura está preparada para receber os dados
  quando o sistema de contratação e avaliações for criado.

========================================================= */

(function (window) {


"use strict";


/* =====================================================
   DEPENDÊNCIAS
   ===================================================== */

const Utils =
    window.PerfilPublicoUtils;


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    elementos: {

        resumo:
            "reviewsSummary",

        lista:
            "reviewsList"

    },

    notaMinima:
        1,

    notaMaxima:
        5

};


/* =====================================================
   ESTADO
   ===================================================== */

const estado = {

    media:
        0,

    quantidade:
        0,

    distribuicao: {

        cinco:
            0,

        quatro:
            0,

        tres:
            0,

        dois:
            0,

        um:
            0

    },

    avaliacoes: [],

    inicializado:
        false

};


/* =====================================================
   LOG
   ===================================================== */

function log(...mensagens) {

    console.log(
        "[PerfilPublicoAvaliacoes]",
        ...mensagens
    );

}


function aviso(...mensagens) {

    console.warn(
        "[PerfilPublicoAvaliacoes]",
        ...mensagens
    );

}


/* =====================================================
   INICIALIZAR
   ===================================================== */

function inicializar(dados = null) {

    log(
        "Inicializando módulo de avaliações..."
    );


    if (
        dados
    ) {

        definirDados(
            dados
        );

    } else {

        limparDados();

    }


    renderizar();


    estado.inicializado =
        true;


    return obterDados();

}


/* =====================================================
   DEFINIR DADOS
   ===================================================== */

function definirDados(
    dados
) {

    if (
        !dados ||
        typeof dados !== "object"
    ) {

        limparDados();


        return;

    }


    /*
     * Aceita diferentes formatos futuros.
     */

    estado.avaliacoes =
        normalizarAvaliacoes(
            dados.avaliacoes ||
            dados.reviews ||
            dados.lista ||
            []
        );


    estado.quantidade =
        converterNumero(
            dados.quantidade ||
            dados.total ||
            estado.avaliacoes.length
        );


    estado.media =
        normalizarNota(
            dados.media ||
            dados.mediaNota ||
            dados.notaMedia ||
            calcularMedia(
                estado.avaliacoes
            )
        );


    estado.distribuicao =
        normalizarDistribuicao(
            dados.distribuicao ||
            calcularDistribuicao(
                estado.avaliacoes
            )
        );


    /*
     * Se a quantidade não foi informada,
     * utilizamos a quantidade real da lista.
     */

    if (
        !dados.quantidade &&
        !dados.total
    ) {

        estado.quantidade =
            estado.avaliacoes.length;

    }


    /*
     * Se a média não foi informada,
     * calculamos a partir da lista.
     */

    if (
        !dados.media &&
        !dados.mediaNota &&
        !dados.notaMedia
    ) {

        estado.media =
            calcularMedia(
                estado.avaliacoes
            );

    }

}


/* =====================================================
   NORMALIZAR AVALIAÇÕES
   ===================================================== */

function normalizarAvaliacoes(
    avaliacoes
) {

    if (
        !Array.isArray(
            avaliacoes
        )
    ) {

        return [];

    }


    return avaliacoes
        .map(
            normalizarAvaliacao
        )
        .filter(
            Boolean
        );

}


/* =====================================================
   NORMALIZAR UMA AVALIAÇÃO
   ===================================================== */

function normalizarAvaliacao(
    avaliacao
) {

    if (
        !avaliacao ||
        typeof avaliacao !== "object"
    ) {

        return null;

    }


    const nome =
        obterPrimeiroValor(

            avaliacao.nome,

            avaliacao.nome_usuario,

            avaliacao.nomeUsuario,

            avaliacao.avaliador_nome,

            avaliacao.avaliadorNome,

            avaliacao.contratante_nome,

            avaliacao.contratanteNome,

            "Cliente"

        );


    const comentario =
        obterPrimeiroValor(

            avaliacao.comentario,

            avaliacao.avaliacao,

            avaliacao.texto,

            avaliacao.mensagem,

            avaliacao.observacao,

            avaliacao.descricao

        );


    const nota =
        normalizarNota(

            obterPrimeiroValor(

                avaliacao.nota,

                avaliacao.rating,

                avaliacao.estrelas,

                avaliacao.avaliacao_nota,

                0

            )

        );


    const data =
        obterPrimeiroValor(

            avaliacao.data,

            avaliacao.data_avaliacao,

            avaliacao.dataAvaliacao,

            avaliacao.created_at,

            avaliacao.createdAt,

            avaliacao.criado_em

        );


    const foto =
        obterPrimeiroValor(

            avaliacao.foto,

            avaliacao.avatar,

            avaliacao.foto_url,

            avaliacao.avatar_url,

            avaliacao.avatarUrl

        );


    const verificada =
        converterBooleano(

            obterPrimeiroValor(

                avaliacao.verificada,

                avaliacao.avaliacao_verificada,

                avaliacao.avaliacaoVerificada,

                avaliacao.contratacao_verificada,

                false

            )

        );


    const resposta =
        obterPrimeiroValor(

            avaliacao.resposta,

            avaliacao.resposta_artista,

            avaliacao.respostaArtista,

            avaliacao.resposta_contratado

        );


    return {

        id:
            obterPrimeiroValor(
                avaliacao.id
            ),

        nome:
            String(
                nome || "Cliente"
            ),

        comentario:
            String(
                comentario || ""
            ),

        nota,

        data:
            data || "",

        foto:
            foto || "",

        verificada,

        resposta:
            resposta || "",

        original:
            avaliacao

    };

}


/* =====================================================
   RENDERIZAR
   ===================================================== */

function renderizar(
    dados = null
) {

    if (
        dados !== null &&
        dados !== undefined
    ) {

        definirDados(
            dados
        );

    }


    renderizarResumo();


    renderizarLista();


    renderizarIcones();


    log(
        "Avaliações renderizadas:",
        estado.quantidade
    );

}


/* =====================================================
   RENDERIZAR RESUMO
   ===================================================== */

function renderizarResumo() {

    const container =
        obterElemento(
            CONFIG.elementos.resumo
        );


    if (!container) {

        aviso(
            `Elemento #${CONFIG.elementos.resumo} não encontrado.`
        );

        return;

    }


    /*
     * Quando ainda não existem avaliações,
     * não exibimos um segundo estado vazio.
     *
     * A mensagem principal será exibida
     * somente em #reviewsList.
     */

    if (
        estado.quantidade <= 0
    ) {

        container.innerHTML = "";

        return;

    }


    const mediaFormatada =
        estado.media
            .toFixed(
                1
            )
            .replace(
                ".",
                ","
            );


    container.innerHTML = `

        <div class="reviews-summary-content">

            <div class="reviews-score">

                <strong class="reviews-average">
                    ${mediaFormatada}
                </strong>

                <div class="reviews-stars">

                    ${renderizarEstrelas(
                        estado.media
                    )}

                </div>

                <span class="reviews-count">
                    ${formatarQuantidade(
                        estado.quantidade
                    )}
                </span>

            </div>


            <div class="reviews-distribution">

                ${renderizarDistribuicao(
                    5,
                    estado.distribuicao.cinco
                )}

                ${renderizarDistribuicao(
                    4,
                    estado.distribuicao.quatro
                )}

                ${renderizarDistribuicao(
                    3,
                    estado.distribuicao.tres
                )}

                ${renderizarDistribuicao(
                    2,
                    estado.distribuicao.dois
                )}

                ${renderizarDistribuicao(
                    1,
                    estado.distribuicao.um
                )}

            </div>

        </div>

    `;

}


/* =====================================================
   RENDERIZAR ESTRELAS
   ===================================================== */

function renderizarEstrelas(
    nota
) {

    const notaNormalizada =
        normalizarNota(
            nota
        );


    let html = "";


    for (
        let i = 1;
        i <= CONFIG.notaMaxima;
        i++
    ) {

        const preenchida =
            notaNormalizada >= i;


        html += `

            <i
                data-lucide="star"
                class="${
                    preenchida
                        ? "star-filled"
                        : "star-empty"
                }"
                aria-hidden="true"
            ></i>

        `;

    }


    return html;

}


/* =====================================================
   RENDERIZAR DISTRIBUIÇÃO
   ===================================================== */

function renderizarDistribuicao(
    estrelas,
    quantidade
) {

    const total =
        estado.quantidade;


    const percentual =
        total > 0
            ? Math.round(
                (
                    quantidade /
                    total
                ) * 100
            )
            : 0;


    return `

        <div
            class="review-distribution-row"
            data-rating="${estrelas}"
        >

            <span class="review-distribution-label">

                ${estrelas}

                <i
                    data-lucide="star"
                    aria-hidden="true"
                ></i>

            </span>


            <div class="review-distribution-bar">

                <div
                    class="review-distribution-fill"
                    style="width: ${percentual}%"
                ></div>

            </div>


            <span class="review-distribution-count">
                ${quantidade}
            </span>

        </div>

    `;

}


/* =====================================================
   RENDERIZAR LISTA
   ===================================================== */

function renderizarLista() {

    const container =
        obterElemento(
            CONFIG.elementos.lista
        );


    if (!container) {

        aviso(
            `Elemento #${CONFIG.elementos.lista} não encontrado.`
        );


        return;

    }


    /*
     * Nenhuma avaliação.
     */

    if (
        !estado.avaliacoes.length
    ) {

        container.innerHTML = `

            <div class="empty-state reviews-empty">

                <i
                    data-lucide="message-square-text"
                    aria-hidden="true"
                ></i>

                <h4>
                    Nenhuma avaliação ainda
                </h4>

                <p>
                    Depois que os primeiros serviços
                    forem concluídos, as avaliações
                    dos contratantes aparecerão aqui.
                </p>

            </div>

        `;


        return;

    }


    container.innerHTML =
        estado.avaliacoes
            .map(
                (
                    avaliacao,
                    indice
                ) =>
                    renderizarAvaliacao(
                        avaliacao,
                        indice
                    )
            )
            .join("");


}


/* =====================================================
   RENDERIZAR AVALIAÇÃO
   ===================================================== */

function renderizarAvaliacao(
    avaliacao,
    indice
) {

    const iniciais =
        obterIniciais(
            avaliacao.nome
        );


    const data =
        formatarData(
            avaliacao.data
        );


    const estrelas =
        renderizarEstrelas(
            avaliacao.nota
        );


    const verificacao =
        avaliacao.verificada
            ? `

                <span
                    class="review-verified"
                    title="Avaliação verificada"
                >

                    <i
                        data-lucide="badge-check"
                        aria-hidden="true"
                    ></i>

                    Verificada

                </span>

            `
            : "";


    const comentario =
        avaliacao.comentario
            ? `

                <p class="review-comment">
                    ${escaparHtml(
                        avaliacao.comentario
                    )}
                </p>

            `
            : "";


    const resposta =
        avaliacao.resposta
            ? `

                <div class="review-response">

                    <div class="review-response-title">

                        <i
                            data-lucide="corner-down-right"
                            aria-hidden="true"
                        ></i>

                        Resposta do artista

                    </div>

                    <p>
                        ${escaparHtml(
                            avaliacao.resposta
                        )}
                    </p>

                </div>

            `
            : "";


    const avatar =
        avaliacao.foto
            ? `

                <img
                    src="${escaparAtributo(
                        avaliacao.foto
                    )}"
                    alt="${escaparAtributo(
                        avaliacao.nome
                    )}"
                    class="review-avatar"
                    data-review-avatar
                >

            `
            : `

                <div class="review-avatar review-avatar-initials">

                    ${escaparHtml(
                        iniciais
                    )}

                </div>

            `;


    return `

        <article
            class="review-item"
            data-review-index="${indice}"
        >

            <div class="review-avatar-wrapper">

                ${avatar}

            </div>


            <div class="review-content">

                <div class="review-header">

                    <div class="review-author">

                        <strong>
                            ${escaparHtml(
                                avaliacao.nome
                            )}
                        </strong>

                        ${verificacao}

                    </div>


                    ${
                        data
                            ? `
                                <time class="review-date">
                                    ${escaparHtml(
                                        data
                                    )}
                                </time>
                            `
                            : ""
                    }

                </div>


                <div class="review-rating">

                    <div class="review-stars">

                        ${estrelas}

                    </div>

                </div>


                ${comentario}


                ${resposta}

            </div>

        </article>

    `;

}


/* =====================================================
   CALCULAR MÉDIA
   ===================================================== */

function calcularMedia(
    avaliacoes
) {

    if (
        !Array.isArray(
            avaliacoes
        ) ||
        !avaliacoes.length
    ) {

        return 0;

    }


    const notas =
        avaliacoes
            .map(
                avaliacao =>
                    normalizarNota(
                        avaliacao.nota
                    )
            )
            .filter(
                nota =>
                    nota > 0
            );


    if (
        !notas.length
    ) {

        return 0;

    }


    const soma =
        notas.reduce(
            (
                total,
                nota
            ) =>
                total + nota,
            0
        );


    return (
        soma /
        notas.length
    );

}


/* =====================================================
   CALCULAR DISTRIBUIÇÃO
   ===================================================== */

function calcularDistribuicao(
    avaliacoes
) {

    const resultado = {

        cinco:
            0,

        quatro:
            0,

        tres:
            0,

        dois:
            0,

        um:
            0

    };


    if (
        !Array.isArray(
            avaliacoes
        )
    ) {

        return resultado;

    }


    avaliacoes.forEach(
        avaliacao => {

            const nota =
                Math.round(
                    normalizarNota(
                        avaliacao.nota
                    )
                );


            switch (
                nota
            ) {

                case 5:

                    resultado.cinco++;

                    break;


                case 4:

                    resultado.quatro++;

                    break;


                case 3:

                    resultado.tres++;

                    break;


                case 2:

                    resultado.dois++;

                    break;


                case 1:

                    resultado.um++;

                    break;

            }

        }
    );


    return resultado;

}


/* =====================================================
   NORMALIZAR DISTRIBUIÇÃO
   ===================================================== */

function normalizarDistribuicao(
    distribuicao
) {

    if (
        !distribuicao ||
        typeof distribuicao !== "object"
    ) {

        return {

            cinco:
                0,

            quatro:
                0,

            tres:
                0,

            dois:
                0,

            um:
                0

        };

    }


    return {

        cinco:
            converterNumero(
                distribuicao.cinco ||
                distribuicao[5] ||
                distribuicao["5"] ||
                0
            ),

        quatro:
            converterNumero(
                distribuicao.quatro ||
                distribuicao[4] ||
                distribuicao["4"] ||
                0
            ),

        tres:
            converterNumero(
                distribuicao.tres ||
                distribuicao[3] ||
                distribuicao["3"] ||
                0
            ),

        dois:
            converterNumero(
                distribuicao.dois ||
                distribuicao[2] ||
                distribuicao["2"] ||
                0
            ),

        um:
            converterNumero(
                distribuicao.um ||
                distribuicao[1] ||
                distribuicao["1"] ||
                0
            )

    };

}


/* =====================================================
   NORMALIZAR NOTA
   ===================================================== */

function normalizarNota(
    valor
) {

    const numero =
        converterNumero(
            valor
        );


    if (
        numero <= 0
    ) {

        return 0;

    }


    return Math.min(
        CONFIG.notaMaxima,
        Math.max(
            CONFIG.notaMinima,
            numero
        )
    );

}


/* =====================================================
   FORMATAR QUANTIDADE
   ===================================================== */

function formatarQuantidade(
    quantidade
) {

    const numero =
        converterNumero(
            quantidade
        );


    if (
        numero === 1
    ) {

        return "1 avaliação";

    }


    return (
        `${numero.toLocaleString(
            "pt-BR"
        )} avaliações`
    );

}


/* =====================================================
   FORMATAR DATA
   ===================================================== */

function formatarData(
    valor
) {

    if (
        !valor
    ) {

        return "";

    }


    const data =
        valor instanceof Date
            ? valor
            : new Date(
                valor
            );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return String(
            valor
        );

    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


/* =====================================================
   OBTER INICIAIS
   ===================================================== */

function obterIniciais(
    nome
) {

    if (
        Utils &&
        typeof Utils.obterIniciais === "function"
    ) {

        return Utils.obterIniciais(
            nome
        );

    }


    const partes =
        String(
            nome || "C"
        )
        .trim()
        .split(
            /\s+/
        )
        .filter(
            Boolean
        );


    if (
        !partes.length
    ) {

        return "C";

    }


    if (
        partes.length === 1
    ) {

        return partes[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }


    return (
        partes[0][0] +
        partes[
            partes.length - 1
        ][0]
    ).toUpperCase();

}


/* =====================================================
   CONVERTER NÚMERO
   ===================================================== */

function converterNumero(
    valor
) {

    if (
        typeof valor === "number"
    ) {

        return Number.isFinite(
            valor
        )
            ? valor
            : 0;

    }


    if (
        valor === null ||
        valor === undefined
    ) {

        return 0;

    }


    let texto =
        String(
            valor
        )
        .trim();


    if (!texto) {
        return 0;
    }


    texto =
        texto.replace(
            ",",
            "."
        );


    const numero =
        Number(
            texto
        );


    return Number.isFinite(
        numero
    )
        ? numero
        : 0;

}


/* =====================================================
   CONVERTER BOOLEANO
   ===================================================== */

function converterBooleano(
    valor
) {

    if (
        typeof valor === "boolean"
    ) {

        return valor;

    }


    if (
        typeof valor === "number"
    ) {

        return valor === 1;

    }


    const texto =
        String(
            valor || ""
        )
        .trim()
        .toLowerCase();


    return [
        "true",
        "1",
        "sim",
        "yes",
        "verificada",
        "verificado"
    ].includes(
        texto
    );

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

function escaparHtml(
    valor
) {

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
   ESCAPAR ATRIBUTO
   ===================================================== */

function escaparAtributo(
    valor
) {

    return escaparHtml(
        valor
    );

}


/* =====================================================
   OBTER ELEMENTO
   ===================================================== */

function obterElemento(
    id
) {

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
    dados
) {

    definirDados(
        dados
    );


    renderizar();


    return obterDados();

}


/* =====================================================
   OBTER DADOS
   ===================================================== */

function obterDados() {

    return {

        media:
            estado.media,

        quantidade:
            estado.quantidade,

        distribuicao:
            {
                ...estado.distribuicao
            },

        avaliacoes:
            [
                ...estado.avaliacoes
            ]

    };

}


/* =====================================================
   OBTER AVALIAÇÕES
   ===================================================== */

function obterAvaliacoes() {

    return [
        ...estado.avaliacoes
    ];

}


/* =====================================================
   LIMPAR DADOS
   ===================================================== */

function limparDados() {

    estado.media =
        0;


    estado.quantidade =
        0;


    estado.distribuicao = {

        cinco:
            0,

        quatro:
            0,

        tres:
            0,

        dois:
            0,

        um:
            0

    };


    estado.avaliacoes =
        [];

}


/* =====================================================
   LIMPAR
   ===================================================== */

function limpar() {

    limparDados();


    estado.inicializado =
        false;


    const resumo =
        obterElemento(
            CONFIG.elementos.resumo
        );


    const lista =
        obterElemento(
            CONFIG.elementos.lista
        );


    if (resumo) {

        resumo.innerHTML =
            "";

    }


    if (lista) {

        lista.innerHTML =
            "";

    }

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const PerfilPublicoAvaliacoes = {

    CONFIG,

    estado,

    inicializar,

    renderizar,

    atualizar,

    obterDados,

    obterAvaliacoes,

    limpar,

    limparDados,

    normalizarAvaliacao,

    normalizarAvaliacoes,

    calcularMedia,

    calcularDistribuicao,

    normalizarNota

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.PerfilPublicoAvaliacoes =
    PerfilPublicoAvaliacoes;


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "PerfilPublicoAvaliacoes.js carregado."
);


})(window);
