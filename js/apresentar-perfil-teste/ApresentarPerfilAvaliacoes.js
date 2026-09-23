(function (window) {

    "use strict";


    /* =========================================================
       MUSICALWORLD — APRESENTAÇÃO DE PERFIL — AVALIAÇÕES

       Arquivo:
       js/apresentar-perfil-teste/ApresentarPerfilAvaliacoes.js

       Responsabilidades:
       - Ler avaliações já carregadas pelo módulo de dados.
       - Calcular a média das avaliações.
       - Renderizar estrelas.
       - Renderizar quantidade de avaliações.
       - Renderizar os comentários.
       - Renderizar estado vazio quando necessário.

       Este arquivo NÃO consulta diretamente o Supabase.

       Os dados são fornecidos por:
       ApresentarPerfilDadosTeste
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        quantidadeEstrelas:
            5

    };


    /* =========================================================
       OBTENÇÃO DAS AVALIAÇÕES
       ========================================================= */

    function obterAvaliacoes() {

        if (
            window.ApresentarPerfilDadosTeste &&
            typeof
                window
                    .ApresentarPerfilDadosTeste
                    .obterAvaliacoes === "function"
        ) {

            return window
                .ApresentarPerfilDadosTeste
                .obterAvaliacoes();

        }


        return [];

    }


    /* =========================================================
       NORMALIZAR NOTA
       ========================================================= */

    function normalizarNota(avaliacao) {

        if (
            !avaliacao
        ) {

            return 0;

        }


        const nota =
            Number(
                avaliacao.nota
            );


        if (
            !Number.isFinite(nota)
        ) {

            return 0;

        }


        return Math.min(
            CONFIG.quantidadeEstrelas,
            Math.max(
                0,
                nota
            )
        );

    }


    /* =========================================================
       CALCULAR MÉDIA
       ========================================================= */

    function calcularMedia(avaliacoes) {

        if (
            !Array.isArray(avaliacoes) ||
            !avaliacoes.length
        ) {

            return 0;

        }


        const notas =
            avaliacoes

                .map(
                    normalizarNota
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


        return soma / notas.length;

    }


    /* =========================================================
       NOME DO AVALIADOR
       ========================================================= */

    function obterNomeAvaliador(avaliacao) {

        if (
            avaliacao &&
            avaliacao.usuario_avaliador &&
            avaliacao.usuario_avaliador.nome
        ) {

            return String(
                avaliacao
                    .usuario_avaliador
                    .nome
            ).trim();

        }


        return "Usuário";

    }


    /* =========================================================
       COMENTÁRIO
       ========================================================= */

    function obterComentario(avaliacao) {

        if (
            !avaliacao ||
            avaliacao.comentario === null ||
            avaliacao.comentario === undefined
        ) {

            return "";

        }


        return String(
            avaliacao.comentario
        ).trim();

    }


    /* =========================================================
       DATA
       ========================================================= */

    function formatarData(avaliacao) {

        if (
            !avaliacao ||
            !avaliacao.created_at
        ) {

            return "";

        }


        const data =
            new Date(
                avaliacao.created_at
            );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return "";

        }


        return new Intl.DateTimeFormat(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        ).format(
            data
        );

    }


    /* =========================================================
       ESCAPAR HTML
       ========================================================= */

    function escaparHtml(valor) {

        return String(
            valor || ""
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


    /* =========================================================
       INICIAIS
       ========================================================= */

    function obterIniciais(nome) {

        const texto =
            String(
                nome || "Usuário"
            ).trim();


        if (!texto) {

            return "U";

        }


        const partes =
            texto
                .split(/\s+/)
                .filter(Boolean);


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


    /* =========================================================
       RENDERIZAR ESTRELAS
       ========================================================= */

    function renderizarEstrelas(
        nota
    ) {

        const notaNormalizada =
            normalizarNota({
                nota
            });


        let html = "";


        for (
            let indice = 1;
            indice <= CONFIG.quantidadeEstrelas;
            indice++
        ) {

            const preenchida =
                indice <= notaNormalizada;


            html += `

                <svg
                    class="${preenchida ? "is-filled" : "is-empty"}"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >

                    <path
                        d="m12 3 2.78 5.63 6.22.9 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"
                    ></path>

                </svg>

            `;

        }


        return html;

    }


    /* =========================================================
       RENDERIZAR RESUMO
       ========================================================= */

    function renderizarResumo(
        avaliacoes,
        media
    ) {

        const mediaFormatada =
            media > 0
                ? media.toFixed(1)
                : "—";


        return `

            <div class="reviews-summary">

                <div class="reviews-score">

                    <strong class="reviews-score-value">
                        ${mediaFormatada}
                    </strong>

                    <span class="reviews-score-label">
                        média
                    </span>

                </div>


                <div class="reviews-summary-content">

                    <div
                        class="reviews-stars"
                        aria-label="Média de ${escaparHtml(mediaFormatada)} estrelas"
                        role="img"
                    >

                        ${renderizarEstrelas(media)}

                    </div>


                    <span class="reviews-summary-count">

                        ${
                            avaliacoes.length === 1
                                ? "1 avaliação"
                                : `${avaliacoes.length} avaliações`
                        }

                    </span>

                </div>

            </div>

        `;

    }


    /* =========================================================
       RENDERIZAR UMA AVALIAÇÃO
       ========================================================= */

    function renderizarAvaliacao(
        avaliacao
    ) {

        const nome =
            obterNomeAvaliador(
                avaliacao
            );


        const comentario =
            obterComentario(
                avaliacao
            );


        const data =
            formatarData(
                avaliacao
            );


        const nota =
            normalizarNota(
                avaliacao
            );


        const iniciais =
            obterIniciais(
                nome
            );


        return `

            <article class="review-card">

                <div class="review-header">


                    <div class="review-avatar">

                        <span>
                            ${escaparHtml(iniciais)}
                        </span>

                    </div>


                    <div class="review-author">

                        <strong class="review-author-name">
                            ${escaparHtml(nome)}
                        </strong>


                        ${
                            data
                                ? `
                                    <span class="review-date">
                                        ${escaparHtml(data)}
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <div class="review-rating">

                        <div class="reviews-stars">

                            ${renderizarEstrelas(nota)}

                        </div>


                        <span class="review-rating-value">
                            ${nota.toFixed(1)}
                        </span>

                    </div>

                </div>


                ${
                    comentario
                        ? `
                            <p class="review-comment">
                                ${escaparHtml(comentario)}
                            </p>
                          `
                        : `
                            <p class="review-without-comment">
                                Avaliação sem comentário.
                            </p>
                          `
                }

            </article>

        `;

    }


    /* =========================================================
       ESTADO VAZIO
       ========================================================= */

    function renderizarEstadoVazio(
        container
    ) {

        container.innerHTML = `

            <div class="reviews-empty">

                <div
                    class="reviews-empty-icon"
                    aria-hidden="true"
                >

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >

                        <path
                            d="m12 3 2.78 5.63 6.22.9 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3Z"
                        ></path>

                    </svg>

                </div>


                <h3 class="reviews-empty-title">
                    Ainda não há avaliações
                </h3>


                <p class="reviews-empty-text">
                    As avaliações aparecerão aqui depois que
                    os contratantes concluírem serviços com
                    este artista.
                </p>

            </div>

        `;

    }


    /* =========================================================
       RENDERIZAÇÃO PRINCIPAL
       ========================================================= */

    function renderizar(
        opcoes = {}
    ) {

        const container =
            opcoes.container ||
            document.getElementById(
                "reviewsRender"
            );


        if (
            !container
        ) {

            console.warn(
                "MusicalWorld — Container das avaliações não encontrado."
            );


            return;

        }


        const avaliacoes =
            obterAvaliacoes();


        if (
            !Array.isArray(avaliacoes) ||
            !avaliacoes.length
        ) {

            renderizarEstadoVazio(
                container
            );


            return;

        }


        const media =
            calcularMedia(
                avaliacoes
            );


        const listaHtml =
            avaliacoes
                .map(
                    renderizarAvaliacao
                )
                .join("");


        container.innerHTML = `

            ${renderizarResumo(
                avaliacoes,
                media
            )}


            <div class="reviews-list">

                ${listaHtml}

            </div>

        `;

    }


    /* =========================================================
       ATUALIZAR
       ========================================================= */

    function atualizar(
        opcoes = {}
    ) {

        renderizar(
            opcoes
        );

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ApresentarPerfilAvaliacoesTeste = {

        renderizar,

        atualizar,

        calcularMedia,

        obterAvaliacoes,

        renderizarEstrelas,

        obterNomeAvaliador,

        obterComentario,

        formatarData

    };


    /* =========================================================
       DIAGNÓSTICO
       ========================================================= */

    console.log(
        "ApresentarPerfilAvaliacoesTeste carregado."
    );


})(window);