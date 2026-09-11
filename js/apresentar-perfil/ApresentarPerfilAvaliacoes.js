(function (window) {
"use strict";


/* =========================================================
   MUSICALWORLD — APRESENTAR PERFIL
   Arquivo: ApresentarPerfilAvaliacoes.js

   Responsabilidade:

   - Renderizar avaliações do perfil visualizado
   - Renderizar resumo de avaliações
   - Calcular média quando necessário
   - Calcular distribuição de notas quando necessário
   - Exibir estrelas
   - Exibir avaliações verificadas
   - Exibir respostas do artista
   - Trabalhar com diferentes formatos de dados
   - Não acessar Supabase diretamente
   - Não depender do perfil do usuário logado

   Compatível com:
   - Cantor(a)
   - Músico(a)
   - Banda
   - Dupla musical
   - DJ
   - Dançarino(a)
   - Grupo de dança
   - MC
   - Compositor(a)
   - Produtor(a) musical
   - Contratante
   ========================================================= */


const CONFIG = {
    elementos: {
        resumo: "reviewsSummary",
        lista: "reviewsList"
    },

    notas: {
        minima: 1,
        maxima: 5
    }
};


const estado = {
    avaliacoes: [],
    media: 0,
    quantidade: 0,
    distribuicao: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    },
    inicializado: false
};


/* =========================================================
   DEPENDÊNCIAS
   ========================================================= */

function obterUtils() {
    return window.ApresentarPerfilUtils || null;
}


function obterElemento(id) {
    const utils = obterUtils();

    if (utils && typeof utils.obterElemento === "function") {
        return utils.obterElemento(id);
    }

    return document.getElementById(id);
}


function escaparHtml(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.escaparHtml === "function") {
        return utils.escaparHtml(valor);
    }

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function normalizarTexto(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.normalizarTexto === "function") {
        return utils.normalizarTexto(valor);
    }

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor).trim();
}


function normalizarNota(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.normalizarNota === "function") {
        return utils.normalizarNota(valor);
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.min(
        CONFIG.notas.maxima,
        Math.max(CONFIG.notas.minima, numero)
    );
}


function formatarNota(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.formatarNota === "function") {
        return utils.formatarNota(valor);
    }

    const nota = normalizarNota(valor);

    return nota > 0 ? nota.toFixed(1) : "0,0";
}


function formatarData(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.formatarData === "function") {
        return utils.formatarData(valor);
    }

    if (!valor) {
        return "";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return normalizarTexto(valor);
    }

    return data.toLocaleDateString("pt-BR");
}


function converterParaNumero(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.converterParaNumero === "function") {
        return utils.converterParaNumero(valor);
    }

    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : 0;
    }

    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }

    const numero = Number(
        String(valor)
            .replace(/\./g, "")
            .replace(",", ".")
    );

    return Number.isFinite(numero) ? numero : 0;
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarLista(valor) {
    if (Array.isArray(valor)) {
        return valor;
    }

    if (!valor) {
        return [];
    }

    if (typeof valor === "string") {
        const texto = valor.trim();

        if (!texto) {
            return [];
        }

        try {
            const convertido = JSON.parse(texto);

            if (Array.isArray(convertido)) {
                return convertido;
            }

            if (convertido && typeof convertido === "object") {
                return [convertido];
            }
        } catch (erro) {
            return [];
        }
    }

    if (typeof valor === "object") {
        return [valor];
    }

    return [];
}


function obterPrimeiroValor(objeto, campos) {
    if (!objeto || typeof objeto !== "object") {
        return "";
    }

    for (const campo of campos) {
        const valor = objeto[campo];

        if (
            valor !== undefined &&
            valor !== null &&
            String(valor).trim() !== ""
        ) {
            return valor;
        }
    }

    return "";
}


function normalizarAvaliacao(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

    const nome = obterPrimeiroValor(item, [
        "nome",
        "nome_usuario",
        "nomeUsuario",
        "avaliador_nome",
        "avaliadorNome",
        "contratante_nome",
        "contratanteNome",
        "usuario_nome",
        "usuarioNome",
        "autor_nome",
        "autorNome"
    ]);

    const comentario = obterPrimeiroValor(item, [
        "comentario",
        "avaliacao",
        "texto",
        "mensagem",
        "observacao",
        "observações",
        "observacoes",
        "descricao",
        "descrição",
        "descricao_avaliacao",
        "descricaoAvaliacao"
    ]);

    const nota = obterPrimeiroValor(item, [
        "nota",
        "rating",
        "estrelas",
        "avaliacao_nota",
        "avaliacaoNota",
        "nota_avaliacao",
        "notaAvaliacao"
    ]);

    const data = obterPrimeiroValor(item, [
        "data",
        "data_avaliacao",
        "dataAvaliacao",
        "created_at",
        "createdAt",
        "criado_em",
        "criadoEm"
    ]);

    const foto = obterPrimeiroValor(item, [
        "foto",
        "avatar",
        "foto_url",
        "fotoUrl",
        "avatar_url",
        "avatarUrl",
        "imagem",
        "imagem_url",
        "imagemUrl"
    ]);

    const verificada = obterPrimeiroValor(item, [
        "verificada",
        "avaliacao_verificada",
        "avaliacaoVerificada",
        "contratacao_verificada",
        "contratacaoVerificada",
        "verified",
        "verificado"
    ]);

    const resposta = obterPrimeiroValor(item, [
        "resposta",
        "resposta_artista",
        "respostaArtista",
        "resposta_contratado",
        "respostaContratado",
        "resposta_profissional",
        "respostaProfissional"
    ]);

    return {
        original: item,
        id: obterPrimeiroValor(item, [
            "id",
            "avaliacao_id",
            "avaliacaoId"
        ]),

        nome: normalizarTexto(nome) || "Usuário",

        comentario: normalizarTexto(comentario),

        nota: normalizarNota(nota),

        data,

        foto: normalizarTexto(foto),

        verificada: converterBooleano(verificada),

        resposta: normalizarTexto(resposta)
    };
}


function converterBooleano(valor) {
    const utils = obterUtils();

    if (utils && typeof utils.converterParaBooleano === "function") {
        return utils.converterParaBooleano(valor);
    }

    if (typeof valor === "boolean") {
        return valor;
    }

    if (typeof valor === "number") {
        return valor === 1;
    }

    if (typeof valor === "string") {
        const texto = valor.trim().toLowerCase();

        if (
            [
                "true",
                "1",
                "sim",
                "yes",
                "verdadeiro",
                "verificado",
                "verificada"
            ].includes(texto)
        ) {
            return true;
        }

        if (
            [
                "false",
                "0",
                "nao",
                "não",
                "no",
                "falso"
            ].includes(texto)
        ) {
            return false;
        }
    }

    return false;
}


/* =========================================================
   EXTRAÇÃO DOS DADOS
   ========================================================= */

function extrairAvaliacoes(dados) {
    if (!dados) {
        return [];
    }

    if (Array.isArray(dados)) {
        return dados;
    }

    if (dados.avaliacoes !== undefined) {
        return normalizarLista(dados.avaliacoes);
    }

    if (dados.reviews !== undefined) {
        return normalizarLista(dados.reviews);
    }

    if (dados.lista !== undefined) {
        return normalizarLista(dados.lista);
    }

    if (dados.items !== undefined) {
        return normalizarLista(dados.items);
    }

    if (dados.data !== undefined) {
        return normalizarLista(dados.data);
    }

    return [];
}


function extrairMedia(dados) {
    if (!dados || typeof dados !== "object") {
        return 0;
    }

    return converterParaNumero(
        obterPrimeiroValor(dados, [
            "media",
            "mediaNota",
            "notaMedia",
            "media_nota",
            "rating",
            "avaliacao_media",
            "avaliacaoMedia"
        ])
    );
}


function extrairQuantidade(dados) {
    if (!dados || typeof dados !== "object") {
        return 0;
    }

    return Math.round(
        converterParaNumero(
            obterPrimeiroValor(dados, [
                "quantidade",
                "total",
                "totalAvaliacoes",
                "total_avaliacoes",
                "quantidadeAvaliacoes",
                "quantidade_avaliacoes",
                "count"
            ])
        )
    );
}


function extrairDistribuicao(dados) {
    if (!dados || typeof dados !== "object") {
        return null;
    }

    const distribuicao =
        dados.distribuicao ||
        dados.distribution ||
        dados.distribuicaoNotas ||
        dados.distribuicao_notas;

    if (!distribuicao || typeof distribuicao !== "object") {
        return null;
    }

    return {
        1: converterParaNumero(
            distribuicao[1] ??
            distribuicao["1"] ??
            distribuicao.nota1 ??
            distribuicao.nota_1
        ),

        2: converterParaNumero(
            distribuicao[2] ??
            distribuicao["2"] ??
            distribuicao.nota2 ??
            distribuicao.nota_2
        ),

        3: converterParaNumero(
            distribuicao[3] ??
            distribuicao["3"] ??
            distribuicao.nota3 ??
            distribuicao.nota_3
        ),

        4: converterParaNumero(
            distribuicao[4] ??
            distribuicao["4"] ??
            distribuicao.nota4 ??
            distribuicao.nota_4
        ),

        5: converterParaNumero(
            distribuicao[5] ??
            distribuicao["5"] ??
            distribuicao.nota5 ??
            distribuicao.nota_5
        )
    };
}


/* =========================================================
   CÁLCULOS
   ========================================================= */

function calcularMedia(avaliacoes) {
    const validas = avaliacoes.filter(
        avaliacao => avaliacao && avaliacao.nota > 0
    );

    if (!validas.length) {
        return 0;
    }

    const soma = validas.reduce(
        (total, avaliacao) => total + avaliacao.nota,
        0
    );

    return soma / validas.length;
}


function calcularDistribuicao(avaliacoes) {
    const distribuicao = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };

    avaliacoes.forEach(avaliacao => {
        const nota = Math.round(avaliacao.nota);

        if (nota >= 1 && nota <= 5) {
            distribuicao[nota]++;
        }
    });

    return distribuicao;
}


/* =========================================================
   ESTRELAS
   ========================================================= */

function renderizarEstrelas(nota) {
    const notaNormalizada = normalizarNota(nota);

    let html = "";

    for (let i = 1; i <= 5; i++) {
        const preenchida = i <= Math.round(notaNormalizada);

        html += `
            <i
                data-lucide="star"
                class="review-star ${preenchida ? "filled" : "empty"}"
                aria-hidden="true"
            ></i>
        `;
    }

    return html;
}


/* =========================================================
   RESUMO
   ========================================================= */

function renderizarResumo() {
    const elemento = obterElemento(CONFIG.elementos.resumo);

    if (!elemento) {
        return;
    }

    const quantidade = estado.quantidade;
    const media = estado.media;

    if (!quantidade) {
        elemento.innerHTML = `
            <div class="reviews-summary-empty">
                <div class="reviews-summary-icon">
                    <i data-lucide="star" aria-hidden="true"></i>
                </div>

                <div class="reviews-summary-content">
                    <strong>Ainda não há avaliações</strong>
                    <span>As avaliações aparecerão aqui após os primeiros serviços.</span>
                </div>
            </div>
        `;

        return;
    }

    const total = Math.max(quantidade, 1);

    let distribuicaoHtml = "";

    for (let nota = 5; nota >= 1; nota--) {
        const quantidadeNota = estado.distribuicao[nota] || 0;
        const percentual = (quantidadeNota / total) * 100;

        distribuicaoHtml += `
            <div class="review-distribution-row">
                <span class="review-distribution-label">
                    ${nota}
                </span>

                <i
                    data-lucide="star"
                    class="review-distribution-star"
                    aria-hidden="true"
                ></i>

                <div class="review-distribution-bar">
                    <div
                        class="review-distribution-fill"
                        style="width: ${percentual}%;"
                    ></div>
                </div>

                <span class="review-distribution-count">
                    ${quantidadeNota}
                </span>
            </div>
        `;
    }

    elemento.innerHTML = `
        <div class="reviews-summary-main">

            <div class="reviews-summary-score">
                <strong>${escaparHtml(formatarNota(media))}</strong>

                <div class="reviews-summary-stars">
                    ${renderizarEstrelas(media)}
                </div>

                <span>
                    ${quantidade} ${
                        quantidade === 1
                            ? "avaliação"
                            : "avaliações"
                    }
                </span>
            </div>

            <div class="reviews-summary-distribution">
                ${distribuicaoHtml}
            </div>

        </div>
    `;
}


/* =========================================================
   AVALIAÇÃO INDIVIDUAL
   ========================================================= */

function renderizarAvatar(avaliacao) {
    if (avaliacao.foto) {
        return `
            <img
                class="review-avatar-image"
                src="${escaparHtml(avaliacao.foto)}"
                alt="${escaparHtml(avaliacao.nome)}"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <span
                class="review-avatar-initials"
                style="display:none;"
            >
                ${escaparHtml(obterIniciais(avaliacao.nome))}
            </span>
        `;
    }

    return `
        <span class="review-avatar-initials">
            ${escaparHtml(obterIniciais(avaliacao.nome))}
        </span>
    `;
}


function obterIniciais(nome) {
    const utils = obterUtils();

    if (utils && typeof utils.obterIniciais === "function") {
        return utils.obterIniciais(nome);
    }

    const partes = normalizarTexto(nome)
        .split(/\s+/)
        .filter(Boolean);

    if (!partes.length) {
        return "?";
    }

    if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
    }

    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();
}


function renderizarAvaliacao(avaliacao) {
    const dataFormatada = avaliacao.data
        ? formatarData(avaliacao.data)
        : "";

    return `
        <article class="review-card">

            <div class="review-header">

                <div class="review-user">

                    <div class="review-avatar">
                        ${renderizarAvatar(avaliacao)}
                    </div>

                    <div class="review-user-info">

                        <div class="review-user-name-row">

                            <strong class="review-user-name">
                                ${escaparHtml(avaliacao.nome)}
                            </strong>

                            ${
                                avaliacao.verificada
                                    ? `
                                        <span class="review-verified">
                                            <i
                                                data-lucide="badge-check"
                                                aria-hidden="true"
                                            ></i>
                                            <span>Verificada</span>
                                        </span>
                                    `
                                    : ""
                            }

                        </div>

                        ${
                            dataFormatada
                                ? `
                                    <span class="review-date">
                                        ${escaparHtml(dataFormatada)}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>

                <div class="review-rating">
                    ${renderizarEstrelas(avaliacao.nota)}
                </div>

            </div>

            ${
                avaliacao.comentario
                    ? `
                        <div class="review-comment">
                            <p>
                                ${escaparHtml(avaliacao.comentario)}
                            </p>
                        </div>
                    `
                    : ""
            }

            ${
                avaliacao.resposta
                    ? `
                        <div class="review-response">

                            <div class="review-response-header">
                                <i
                                    data-lucide="corner-down-right"
                                    aria-hidden="true"
                                ></i>

                                <strong>
                                    Resposta
                                </strong>
                            </div>

                            <p>
                                ${escaparHtml(avaliacao.resposta)}
                            </p>

                        </div>
                    `
                    : ""
            }

        </article>
    `;
}


/* =========================================================
   LISTA
   ========================================================= */

function renderizarLista() {
    const elemento = obterElemento(CONFIG.elementos.lista);

    if (!elemento) {
        return;
    }

    if (!estado.avaliacoes.length) {
        elemento.innerHTML = `
            <div class="reviews-empty">

                <div class="reviews-empty-icon">
                    <i data-lucide="star" aria-hidden="true"></i>
                </div>

                <h3>Nenhuma avaliação ainda</h3>

                <p>
                    As avaliações aparecerão aqui conforme os serviços
                    realizados forem concluídos.
                </p>

            </div>
        `;

        return;
    }

    elemento.innerHTML = estado.avaliacoes
        .map(renderizarAvaliacao)
        .join("");
}


/* =========================================================
   ÍCONES
   ========================================================= */

function renderizarIcones() {
    const utils = obterUtils();

    if (
        utils &&
        typeof utils.renderizarIcones === "function"
    ) {
        utils.renderizarIcones();
        return;
    }

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {
        window.lucide.createIcons();
    }
}


/* =========================================================
   RENDERIZAÇÃO PRINCIPAL
   ========================================================= */

function renderizar(dados) {
    const listaOriginal = extrairAvaliacoes(dados);

    estado.avaliacoes = listaOriginal
        .map(normalizarAvaliacao)
        .filter(Boolean);

    const mediaInformada = extrairMedia(dados);
    const quantidadeInformada = extrairQuantidade(dados);
    const distribuicaoInformada = extrairDistribuicao(dados);

    const mediaCalculada = calcularMedia(estado.avaliacoes);

    estado.media =
        mediaInformada > 0
            ? mediaInformada
            : mediaCalculada;

    estado.quantidade =
        quantidadeInformada > 0
            ? quantidadeInformada
            : estado.avaliacoes.length;

    estado.distribuicao =
        distribuicaoInformada ||
        calcularDistribuicao(estado.avaliacoes);

    renderizarResumo();
    renderizarLista();
    renderizarIcones();

    estado.inicializado = true;

    return obterEstado();
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializar(dados) {
    let dadosParaRenderizar = dados;

    if (
        dadosParaRenderizar === undefined &&
        window.ApresentarPerfilDados &&
        typeof window.ApresentarPerfilDados.obterAvaliacoes === "function"
    ) {
        dadosParaRenderizar =
            window.ApresentarPerfilDados.obterAvaliacoes();
    }

    return renderizar(dadosParaRenderizar);
}


/* =========================================================
   ATUALIZAÇÃO
   ========================================================= */

function atualizar(dados) {
    return renderizar(dados);
}


/* =========================================================
   ESTADO
   ========================================================= */

function obterAvaliacoes() {
    return [...estado.avaliacoes];
}


function obterMedia() {
    return estado.media;
}


function obterQuantidade() {
    return estado.quantidade;
}


function obterDistribuicao() {
    return {
        ...estado.distribuicao
    };
}


function obterEstado() {
    return {
        avaliacoes: [...estado.avaliacoes],
        media: estado.media,
        quantidade: estado.quantidade,
        distribuicao: {
            ...estado.distribuicao
        },
        inicializado: estado.inicializado
    };
}


/* =========================================================
   BUSCA DE AVALIAÇÃO
   ========================================================= */

function obterAvaliacaoPorId(id) {
    if (!id) {
        return null;
    }

    return (
        estado.avaliacoes.find(
            avaliacao =>
                String(avaliacao.id) === String(id)
        ) || null
    );
}


/* =========================================================
   LIMPAR
   ========================================================= */

function limpar() {
    estado.avaliacoes = [];
    estado.media = 0;
    estado.quantidade = 0;

    estado.distribuicao = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };

    estado.inicializado = false;

    const resumo = obterElemento(CONFIG.elementos.resumo);
    const lista = obterElemento(CONFIG.elementos.lista);

    if (resumo) {
        resumo.innerHTML = "";
    }

    if (lista) {
        lista.innerHTML = "";
    }
}


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.ApresentarPerfilAvaliacoes = {
    inicializar,
    renderizar,
    atualizar,

    obterAvaliacoes,
    obterMedia,
    obterQuantidade,
    obterDistribuicao,
    obterEstado,
    obterAvaliacaoPorId,

    normalizarAvaliacao,
    calcularMedia,
    calcularDistribuicao,

    renderizarEstrelas,
    renderizarResumo,
    renderizarLista,

    limpar
};


console.log(
    "ApresentarPerfilAvaliacoes.js carregado."
);


})(window);
