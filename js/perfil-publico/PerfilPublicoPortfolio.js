/* =========================================================
MUSICALWORLD — PERFIL PÚBLICO
Arquivo: PerfilPublicoPortfolio.js

Responsabilidade:

* Renderizar imagens do portfólio.
* Renderizar vídeos.
* Renderizar áudios.
* Controlar estados vazios.
* Trabalhar com os dados fornecidos pelo módulo
  PerfilPublicoDados.js.

IMPORTANTE:
Este módulo NÃO realiza consultas ao Supabase.

Os dados devem ser fornecidos pelo:

PerfilPublicoDados.js

Este arquivo também NÃO contém regras específicas
de Cantor, Músico ou qualquer outro tipo de artista.
========================================================= */

(function (window) {


"use strict";


/* =====================================================
   DEPENDÊNCIAS
   ===================================================== */

const Utils =
    window.PerfilPublicoUtils;


/* =====================================================
   ESTADO
   ===================================================== */

const estado = {

    portfolio: [],

    inicializado: false

};


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    elementos: {

        imagens: "portfolioGrid",

        videos: "videoList",

        audios: "audioList"

    }

};


/* =====================================================
   NORMALIZAR TIPO DE MÍDIA
   ===================================================== */

function normalizarTipoMedia(item) {

    if (!item || typeof item !== "object") {

        return "";

    }


    const tipo =
        Utils?.obterPrimeiroValor(

            item.tipo,

            item.tipo_media,

            item.media_type,

            item.type,

            item.tipoMidia

        );


    return Utils
        ? Utils.normalizarTexto(tipo)
        : String(tipo || "")
            .trim()
            .toLowerCase();

}


/* =====================================================
   IDENTIFICAR SE É IMAGEM
   ===================================================== */

function ehImagem(item) {

    const tipo =
        normalizarTipoMedia(item);


    return (

        tipo === "imagem" ||

        tipo === "image" ||

        tipo === "foto" ||

        tipo === "fotografia" ||

        tipo === "jpg" ||

        tipo === "jpeg" ||

        tipo === "png" ||

        tipo === "webp" ||

        tipo === "gif"

    );

}


/* =====================================================
   IDENTIFICAR SE É VÍDEO
   ===================================================== */

function ehVideo(item) {

    const tipo =
        normalizarTipoMedia(item);


    return (

        tipo === "video" ||

        tipo === "mp4" ||

        tipo === "webm" ||

        tipo === "ogg" ||

        tipo === "mov"

    );

}


/* =====================================================
   IDENTIFICAR SE É ÁUDIO
   ===================================================== */

function ehAudio(item) {

    const tipo =
        normalizarTipoMedia(item);


    return (

        tipo === "audio" ||

        tipo === "mp3" ||

        tipo === "wav" ||

        tipo === "ogg" ||

        tipo === "m4a" ||

        tipo === "aac"

    );

}


/* =====================================================
   OBTER URL DA MÍDIA
   ===================================================== */

function obterUrlMedia(item) {

    if (!item || typeof item !== "object") {

        return "";

    }


    return Utils
        ? Utils.obterPrimeiroValor(

            item.url,

            item.url_media,

            item.media_url,

            item.arquivo_url,

            item.foto_url,

            item.video_url,

            item.audio_url,

            item.src,

            item.caminho

        )
        : (

            item.url ||

            item.url_media ||

            item.media_url ||

            item.arquivo_url ||

            item.foto_url ||

            item.video_url ||

            item.audio_url ||

            item.src ||

            item.caminho ||

            ""

        );

}


/* =====================================================
   OBTER TÍTULO
   ===================================================== */

function obterTitulo(item, tituloPadrao = "Portfólio") {

    if (!item || typeof item !== "object") {

        return tituloPadrao;

    }


    const titulo =
        Utils
            ? Utils.obterPrimeiroValor(

                item.titulo,

                item.nome,

                item.nome_arquivo,

                item.descricao

            )
            : (

                item.titulo ||

                item.nome ||

                item.nome_arquivo ||

                item.descricao ||

                ""

            );


    return titulo || tituloPadrao;

}


/* =====================================================
   OBTER DESCRIÇÃO
   ===================================================== */

function obterDescricao(item) {

    if (!item || typeof item !== "object") {

        return "";

    }


    return Utils
        ? Utils.obterPrimeiroValor(

            item.descricao,

            item.descricao_media,

            item.observacao,

            item.legenda

        )
        : (

            item.descricao ||

            item.descricao_media ||

            item.observacao ||

            item.legenda ||

            ""

        );

}


/* =====================================================
   OBTER ELEMENTO
   ===================================================== */

function obterElemento(id) {

    return document.getElementById(id);

}


/* =====================================================
   ESTADO VAZIO — IMAGENS
   ===================================================== */

function renderizarEstadoVazioImagem() {

    const container =
        obterElemento(
            CONFIG.elementos.imagens
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i data-lucide="image"></i>

            <p>
                Nenhuma imagem adicionada ao portfólio.
            </p>

        </div>

    `;


    atualizarIcones();

}


/* =====================================================
   ESTADO VAZIO — VÍDEOS
   ===================================================== */

function renderizarEstadoVazioVideo() {

    const container =
        obterElemento(
            CONFIG.elementos.videos
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i data-lucide="video"></i>

            <p>
                Nenhum vídeo adicionado.
            </p>

        </div>

    `;


    atualizarIcones();

}


/* =====================================================
   ESTADO VAZIO — ÁUDIOS
   ===================================================== */

function renderizarEstadoVazioAudio() {

    const container =
        obterElemento(
            CONFIG.elementos.audios
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i data-lucide="headphones"></i>

            <p>
                Nenhum áudio adicionado.
            </p>

        </div>

    `;


    atualizarIcones();

}


/* =====================================================
   RENDERIZAR IMAGENS
   ===================================================== */

function renderizarImagens(lista = null) {

    const container =
        obterElemento(
            CONFIG.elementos.imagens
        );


    if (!container) {

        console.warn(
            "PerfilPublicoPortfolio: #portfolioGrid não encontrado."
        );

        return;

    }


    const imagens =
        Array.isArray(lista)
            ? lista.filter(ehImagem)
            : estado.portfolio.filter(ehImagem);


    if (!imagens.length) {

        renderizarEstadoVazioImagem();

        return;

    }


    container.innerHTML =
        imagens.map((item, indice) => {

            const url =
                obterUrlMedia(item);


            const titulo =
                obterTitulo(
                    item,
                    `Imagem ${indice + 1}`
                );


            const descricao =
                obterDescricao(item);


            /* =================================================
               IMAGEM SEM URL
               ================================================= */

            if (!url) {

                return `

                    <article
                        class="portfolio-card"
                        data-portfolio-index="${indice}"
                    >

                        <div class="portfolio-card-media">

                            <div class="portfolio-media-unavailable">

                                <i data-lucide="image-off"></i>

                                <span>
                                    Imagem indisponível
                                </span>

                            </div>

                        </div>

                        <div class="portfolio-info">

                            <div class="portfolio-title">
                                ${escaparHtml(titulo)}
                            </div>

                            ${
                                descricao
                                    ? `
                                        <div class="portfolio-description">
                                            ${escaparHtml(descricao)}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                    </article>

                `;

            }


            /* =================================================
               IMAGEM NORMAL
               ================================================= */

            return `

                <article
                    class="portfolio-card"
                    data-portfolio-index="${indice}"
                >

                    <div class="portfolio-card-media">

                        <img
                            src="${escaparAtributo(url)}"
                            alt="${escaparAtributo(titulo)}"
                            loading="lazy"
                            data-portfolio-image
                        >

                    </div>

                    <div class="portfolio-info">

                        <div class="portfolio-title">
                            ${escaparHtml(titulo)}
                        </div>

                        ${
                            descricao
                                ? `
                                    <div class="portfolio-description">
                                        ${escaparHtml(descricao)}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </article>

            `;

        }).join("");


    configurarErrosImagem();

    atualizarIcones();

}


/* =====================================================
   CONFIGURAR ERROS DAS IMAGENS
   ===================================================== */

function configurarErrosImagem() {

    const imagens =
        document.querySelectorAll(
            "#portfolioGrid img[data-portfolio-image]"
        );


    imagens.forEach(imagem => {

        imagem.addEventListener(
            "error",
            function () {

                const wrapper =
                    imagem.closest(
                        ".portfolio-card-media"
                    );


                if (!wrapper) {
                    return;
                }


                wrapper.innerHTML = `

                    <div class="portfolio-media-unavailable">

                        <i data-lucide="image-off"></i>

                        <span>
                            Imagem indisponível
                        </span>

                    </div>

                `;


                atualizarIcones();

            },
            {
                once: true
            }
        );

    });

}


/* =====================================================
   RENDERIZAR VÍDEOS
   ===================================================== */

function renderizarVideos(lista = null) {

    const container =
        obterElemento(
            CONFIG.elementos.videos
        );


    if (!container) {

        console.warn(
            "PerfilPublicoPortfolio: #videoList não encontrado."
        );

        return;

    }


    const videos =
        Array.isArray(lista)
            ? lista.filter(ehVideo)
            : estado.portfolio.filter(ehVideo);


    if (!videos.length) {

        renderizarEstadoVazioVideo();

        return;

    }


    container.innerHTML =
        videos.map((item, indice) => {

            const url =
                obterUrlMedia(item);


            const titulo =
                obterTitulo(
                    item,
                    `Vídeo ${indice + 1}`
                );


            const descricao =
                obterDescricao(item);


            /* =================================================
               VÍDEO SEM URL
               ================================================= */

            if (!url) {

                return `

                    <article
                        class="video-card"
                        data-video-index="${indice}"
                    >

                        <div class="video-media-unavailable">

                            <i data-lucide="video-off"></i>

                            <span>
                                Vídeo indisponível
                            </span>

                        </div>

                        <div class="video-info">

                            <div class="video-title">
                                ${escaparHtml(titulo)}
                            </div>

                            ${
                                descricao
                                    ? `
                                        <div class="video-description">
                                            ${escaparHtml(descricao)}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                    </article>

                `;

            }


            /* =================================================
               VÍDEO NORMAL
               ================================================= */

            return `

                <article
                    class="video-card"
                    data-video-index="${indice}"
                >

                    <div class="video-wrapper">

                        <video
                            controls
                            preload="metadata"
                            playsinline
                        >

                            <source
                                src="${escaparAtributo(url)}"
                            >

                            Seu navegador não suporta reprodução de vídeo.

                        </video>

                    </div>

                    <div class="video-info">

                        <div class="video-title">
                            ${escaparHtml(titulo)}
                        </div>

                        ${
                            descricao
                                ? `
                                    <div class="video-description">
                                        ${escaparHtml(descricao)}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </article>

            `;

        }).join("");


    configurarErrosVideo();

    atualizarIcones();

}


/* =====================================================
   CONFIGURAR ERROS DE VÍDEO
   ===================================================== */

function configurarErrosVideo() {

    const videos =
        document.querySelectorAll(
            "#videoList video"
        );


    videos.forEach(video => {

        video.addEventListener(
            "error",
            function () {

                const wrapper =
                    video.closest(
                        ".video-wrapper"
                    );


                if (!wrapper) {
                    return;
                }


                wrapper.innerHTML = `

                    <div class="video-media-unavailable">

                        <i data-lucide="video-off"></i>

                        <span>
                            Vídeo indisponível
                        </span>

                    </div>

                `;


                atualizarIcones();

            },
            {
                once: true
            }
        );

    });

}


/* =====================================================
   RENDERIZAR ÁUDIOS
   ===================================================== */

function renderizarAudios(lista = null) {

    const container =
        obterElemento(
            CONFIG.elementos.audios
        );


    if (!container) {

        console.warn(
            "PerfilPublicoPortfolio: #audioList não encontrado."
        );

        return;

    }


    const audios =
        Array.isArray(lista)
            ? lista.filter(ehAudio)
            : estado.portfolio.filter(ehAudio);


    if (!audios.length) {

        renderizarEstadoVazioAudio();

        return;

    }


    container.innerHTML =
        audios.map((item, indice) => {

            const url =
                obterUrlMedia(item);


            const titulo =
                obterTitulo(
                    item,
                    `Áudio ${indice + 1}`
                );


            const descricao =
                obterDescricao(item);


            /* =================================================
               ÁUDIO SEM URL
               ================================================= */

            if (!url) {

                return `

                    <article
                        class="audio-card"
                        data-audio-index="${indice}"
                    >

                        <div class="audio-icon">

                            <i data-lucide="headphones"></i>

                        </div>

                        <div class="audio-info">

                            <strong>
                                ${escaparHtml(titulo)}
                            </strong>

                            ${
                                descricao
                                    ? `
                                        <p>
                                            ${escaparHtml(descricao)}
                                        </p>
                                    `
                                    : ""
                            }

                            <span class="audio-unavailable">
                                Áudio indisponível
                            </span>

                        </div>

                    </article>

                `;

            }


            /* =================================================
               ÁUDIO NORMAL
               ================================================= */

            return `

                <article
                    class="audio-card"
                    data-audio-index="${indice}"
                >

                    <div class="audio-icon">

                        <i data-lucide="headphones"></i>

                    </div>

                    <div class="audio-info">

                        <strong>
                            ${escaparHtml(titulo)}
                        </strong>

                        ${
                            descricao
                                ? `
                                    <p>
                                        ${escaparHtml(descricao)}
                                    </p>
                                `
                                : ""
                        }

                        <audio
                            controls
                            preload="metadata"
                        >

                            <source
                                src="${escaparAtributo(url)}"
                            >

                            Seu navegador não suporta reprodução de áudio.

                        </audio>

                    </div>

                </article>

            `;

        }).join("");


    configurarErrosAudio();

    atualizarIcones();

}


/* =====================================================
   CONFIGURAR ERROS DE ÁUDIO
   ===================================================== */

function configurarErrosAudio() {

    const audios =
        document.querySelectorAll(
            "#audioList audio"
        );


    audios.forEach(audio => {

        audio.addEventListener(
            "error",
            function () {

                const container =
                    audio.closest(
                        ".audio-info"
                    );


                if (!container) {
                    return;
                }


                const aviso =
                    document.createElement("span");


                aviso.className =
                    "audio-unavailable";


                aviso.textContent =
                    "Áudio indisponível";


                audio.replaceWith(
                    aviso
                );

            },
            {
                once: true
            }
        );

    });

}


/* =====================================================
   RENDERIZAR TODO O PORTFÓLIO
   ===================================================== */

function renderizar(portfolio = null) {

    if (Array.isArray(portfolio)) {

        estado.portfolio =
            [...portfolio];

    } else if (
        window.PerfilPublicoDados &&
        typeof window.PerfilPublicoDados.obterPortfolio === "function"
    ) {

        estado.portfolio =
            window.PerfilPublicoDados
                .obterPortfolio();

    } else {

        estado.portfolio = [];

    }


    renderizarImagens(
        estado.portfolio
    );


    renderizarVideos(
        estado.portfolio
    );


    renderizarAudios(
        estado.portfolio
    );


    estado.inicializado = true;

}


/* =====================================================
   ATUALIZAR PORTFÓLIO
   ===================================================== */

function atualizar(portfolio = []) {

    renderizar(
        Array.isArray(portfolio)
            ? portfolio
            : []
    );

}


/* =====================================================
   OBTER PORTFÓLIO ATUAL
   ===================================================== */

function obterPortfolio() {

    return Array.isArray(
        estado.portfolio
    )
        ? [...estado.portfolio]
        : [];

}


/* =====================================================
   LIMPAR PORTFÓLIO
   ===================================================== */

function limpar() {

    estado.portfolio = [];

    estado.inicializado = false;


    renderizarEstadoVazioImagem();

    renderizarEstadoVazioVideo();

    renderizarEstadoVazioAudio();

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


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   ESCAPAR ATRIBUTO
   ===================================================== */

function escaparAtributo(valor) {

    return escaparHtml(
        valor
    );

}


/* =====================================================
   ATUALIZAR ÍCONES
   ===================================================== */

function atualizarIcones() {

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
   INICIALIZAR
   ===================================================== */

function inicializar(portfolio = null) {

    renderizar(
        portfolio
    );

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const PerfilPublicoPortfolio = {

    CONFIG,

    estado,

    inicializar,

    renderizar,

    atualizar,

    renderizarImagens,

    renderizarVideos,

    renderizarAudios,

    obterPortfolio,

    limpar,

    ehImagem,

    ehVideo,

    ehAudio,

    obterUrlMedia,

    obterTitulo,

    obterDescricao

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.PerfilPublicoPortfolio =
    PerfilPublicoPortfolio;


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "PerfilPublicoPortfolio.js carregado."
);


})(window);
