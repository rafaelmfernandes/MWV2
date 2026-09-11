/* =========================================================
MUSICALWORLD — APRESENTAR PERFIL
Arquivo: ApresentarPerfilPortfolio.js

Responsabilidade:

* Renderizar o portfólio do perfil visualizado.
* Exibir imagens e vídeos em uma única galeria.
* Exibir áudios em uma seção própria.
* Identificar visualmente o tipo de mídia.
* Normalizar diferentes formatos de dados.
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

let portfolio = [];

let inicializado = false;

/* =====================================================
ELEMENTOS
===================================================== */

const CONFIG = {


elementos: {

    portfolioGrid: "portfolioGrid",

    videoList: "videoList",

    audioList: "audioList"

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
NORMALIZAR TIPO DE MÍDIA
===================================================== */

function normalizarTipoMidia(item) {


if (!item) {
    return "";
}


const valor =
    item.tipo ||
    item.tipo_media ||
    item.tipoMidia ||
    item.media_type ||
    item.type ||
    item.formato ||
    item.mime_type ||
    "";


const tipo =
    String(valor)
        .trim()
        .toLowerCase();


if (
    tipo.includes("image") ||
    tipo.includes("imagem") ||
    tipo.includes("foto")
) {

    return "imagem";

}


if (
    tipo.includes("video") ||
    tipo.includes("vídeo")
) {

    return "video";

}


if (
    tipo.includes("audio") ||
    tipo.includes("áudio") ||
    tipo.includes("musica") ||
    tipo.includes("música")
) {

    return "audio";

}


/*
 * Extensão do arquivo como fallback.
 */

const url =
    obterUrlMidia(item);


if (url) {

    const urlSemParametros =
        url
            .split("?")[0]
            .split("#")[0]
            .toLowerCase();


    if (
        /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i
            .test(urlSemParametros)
    ) {

        return "imagem";

    }


    if (
        /\.(mp4|webm|ogg|mov|m4v)$/i
            .test(urlSemParametros)
    ) {

        return "video";

    }


    if (
        /\.(mp3|wav|ogg|m4a|aac|flac)$/i
            .test(urlSemParametros)
    ) {

        return "audio";

    }

}


/*
 * Se não houver informação suficiente,
 * tratamos como imagem somente quando
 * existir uma URL de imagem explícita.
 */

if (
    item.foto_url ||
    item.imagem_url ||
    item.image_url ||
    item.imagem ||
    item.foto
) {

    return "imagem";

}


return "";


}

/* =====================================================
OBTER URL DA MÍDIA
===================================================== */

function obterUrlMidia(item) {


if (!item) {
    return "";
}


return (
    item.url ||
    item.url_media ||
    item.media_url ||
    item.arquivo_url ||
    item.arquivo ||
    item.foto_url ||
    item.imagem_url ||
    item.image_url ||
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

function obterTitulo(item) {


if (!item) {
    return "Item do portfólio";
}


return (
    item.titulo ||
    item.nome ||
    item.nome_arquivo ||
    item.nomeArquivo ||
    item.titulo_midia ||
    item.tituloMidia ||
    item.descricao ||
    "Item do portfólio"
);


}

/* =====================================================
OBTER DESCRIÇÃO
===================================================== */

function obterDescricao(item) {


if (!item) {
    return "";
}


return (
    item.descricao ||
    item.descricao_media ||
    item.descricaoMidia ||
    item.observacao ||
    item.observacoes ||
    item.legenda ||
    item.caption ||
    ""
);


}

/* =====================================================
NORMALIZAR ITEM
===================================================== */

function normalizarItem(item) {


if (
    item === null ||
    item === undefined
) {

    return null;

}


if (typeof item === "string") {

    return {

        original: item,

        tipo: normalizarTipoMidia({
            url: item
        }),

        url: item,

        titulo: "Item do portfólio",

        descricao: ""

    };

}


if (typeof item !== "object") {
    return null;
}


const url =
    obterUrlMidia(item);


if (!url) {
    return null;
}


const tipo =
    normalizarTipoMidia(item);


if (!tipo) {
    return null;
}


return {

    original: item,

    tipo,

    url,

    titulo:
        obterTitulo(item),

    descricao:
        obterDescricao(item)

};


}

/* =====================================================
NORMALIZAR PORTFÓLIO
===================================================== */

function normalizarPortfolio(
dados
) {


let lista =
    dados;


/*
 * Aceita:
 *
 * array
 * objeto { portfolio: [] }
 * objeto { itens: [] }
 * objeto { lista: [] }
 */

if (
    lista &&
    !Array.isArray(lista) &&
    typeof lista === "object"
) {

    lista =
        lista.portfolio ||
        lista.itens ||
        lista.lista ||
        lista.items ||
        [];

}


if (!Array.isArray(lista)) {

    lista = [];

}


return lista
    .map(item =>
        normalizarItem(item)
    )
    .filter(Boolean);


}

/* =====================================================
FILTRAR POR TIPO
===================================================== */

function obterPorTipo(
tipo
) {


return portfolio.filter(
    item =>
        item.tipo === tipo
);


}

/* =====================================================
ESTADO VAZIO
===================================================== */

function renderizarEstadoVazio(
elemento,
icone,
titulo,
descricao
) {


if (!elemento) {
    return;
}


elemento.innerHTML = `

    <div class="empty-state">

        <i data-lucide="${escaparHtml(icone)}"></i>

        <strong>
            ${escaparHtml(titulo)}
        </strong>

        <span>
            ${escaparHtml(descricao)}
        </span>

    </div>

`;


}

/* =====================================================
PREPARAR CONTAINERS
===================================================== */

function prepararContainers() {


const portfolioGrid =
    obterElemento(
        CONFIG.elementos.portfolioGrid
    );


const videoList =
    obterElemento(
        CONFIG.elementos.videoList
    );


/*
 * A partir de agora imagens e vídeos
 * pertencem à mesma galeria.
 *
 * O container antigo de vídeos é
 * mantido apenas para compatibilidade
 * com o HTML existente.
 */

if (videoList) {

    videoList.innerHTML = "";

    videoList.style.display = "none";

}


return {

    portfolioGrid,

    videoList

};


}

/* =====================================================
RENDERIZAR GALERIA DE PORTFÓLIO
===================================================== */

function renderizarGaleria() {


const container =
    obterElemento(
        CONFIG.elementos.portfolioGrid
    );


if (!container) {
    return;
}


/*
 * Imagens e vídeos são exibidos juntos.
 *
 * O filtro mantém apenas os dois tipos
 * que fazem parte da galeria visual.
 */

const itensGaleria =
    portfolio.filter(
        item =>
            item.tipo === "imagem" ||
            item.tipo === "video"
    );


if (!itensGaleria.length) {

    renderizarEstadoVazio(

        container,

        "images",

        "Portfólio vazio",

        "Este perfil ainda não adicionou trabalhos."

    );


    return;

}


container.innerHTML =
    itensGaleria
        .map(
            (item, indice) =>
                criarCardGaleria(
                    item,
                    indice
                )
        )
        .join("");


configurarErrosImagens();

configurarErrosVideos();

renderizarIcones();


}

/* =====================================================
CRIAR CARD DA GALERIA
===================================================== */

function criarCardGaleria(
item,
indice
) {


if (
    item.tipo === "video"
) {

    return criarCardGaleriaVideo(
        item,
        indice
    );

}


return criarCardGaleriaImagem(
    item,
    indice
);


}

/* =====================================================
CARD DE IMAGEM NA GALERIA
===================================================== */

function criarCardGaleriaImagem(
item,
indice
) {


const titulo =
    escaparHtml(
        item.titulo
    );


const descricao =
    escaparHtml(
        item.descricao
    );


const url =
    escaparHtml(
        item.url
    );


return `

    <article
        class="portfolio-card portfolio-gallery-item portfolio-gallery-image"
        data-portfolio-index="${indice}"
        data-portfolio-type="imagem"
    >

        <div class="portfolio-media">

            <img
                src="${url}"
                alt="${titulo}"
                loading="lazy"
                data-portfolio-image
            >


            <div
                class="portfolio-media-type"
                aria-label="Imagem"
                title="Imagem"
            >

                <i data-lucide="image"></i>

            </div>


            <div
                class="portfolio-image-fallback"
                hidden
            >

                <i data-lucide="image-off"></i>

                <span>
                    Imagem indisponível
                </span>

            </div>

        </div>


        ${
            titulo !== "Item do portfólio" ||
            descricao
                ? `

                    <div class="portfolio-card-content">

                        ${
                            titulo !== "Item do portfólio"
                                ? `
                                    <strong class="portfolio-card-title">
                                        ${titulo}
                                    </strong>
                                  `
                                : ""
                        }

                        ${
                            descricao
                                ? `
                                    <span class="portfolio-card-description">
                                        ${descricao}
                                    </span>
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
CARD DE VÍDEO NA GALERIA
===================================================== */

function criarCardGaleriaVideo(
item,
indice
) {


const titulo =
    escaparHtml(
        item.titulo
    );


const descricao =
    escaparHtml(
        item.descricao
    );


const url =
    escaparHtml(
        item.url
    );


return `

    <article
        class="portfolio-card portfolio-gallery-item portfolio-gallery-video"
        data-portfolio-index="${indice}"
        data-portfolio-type="video"
    >

        <div class="portfolio-media portfolio-video-media">

            <video
                controls
                preload="metadata"
                src="${url}"
                data-portfolio-video
            ></video>


            <div
                class="portfolio-media-type"
                aria-label="Vídeo"
                title="Vídeo"
            >

                <i data-lucide="play-circle"></i>

            </div>


            <div
                class="portfolio-video-fallback"
                hidden
            >

                <i data-lucide="video-off"></i>

                <span>
                    Vídeo indisponível
                </span>

            </div>

        </div>


        ${
            titulo !== "Item do portfólio" ||
            descricao
                ? `

                    <div class="portfolio-card-content">

                        ${
                            titulo !== "Item do portfólio"
                                ? `
                                    <strong class="portfolio-card-title">
                                        ${titulo}
                                    </strong>
                                  `
                                : ""
                        }

                        ${
                            descricao
                                ? `
                                    <span class="portfolio-card-description">
                                        ${descricao}
                                    </span>
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
CONFIGURAR ERROS DE IMAGEM
===================================================== */

function configurarErrosImagens() {


const container =
    obterElemento(
        CONFIG.elementos.portfolioGrid
    );


if (!container) {
    return;
}


container
    .querySelectorAll(
        "img[data-portfolio-image]"
    )
    .forEach(img => {

        img.addEventListener(
            "error",
            function () {

                this.style.display =
                    "none";


                const fallback =
                    this.parentElement
                        ?.querySelector(
                            ".portfolio-image-fallback"
                        );


                if (fallback) {

                    fallback.hidden =
                        false;

                }

            }
        );

    });


}

/* =====================================================
CONFIGURAR ERROS DE VÍDEO
===================================================== */

function configurarErrosVideos() {


const container =
    obterElemento(
        CONFIG.elementos.portfolioGrid
    );


if (!container) {
    return;
}


container
    .querySelectorAll(
        "video[data-portfolio-video]"
    )
    .forEach(video => {

        video.addEventListener(
            "error",
            function () {

                const fallback =
                    this.parentElement
                        ?.querySelector(
                            ".portfolio-video-fallback"
                        );


                this.style.display =
                    "none";


                if (fallback) {

                    fallback.hidden =
                        false;

                }

            }
        );

    });


}

/* =====================================================
RENDERIZAR ÁUDIOS
===================================================== */

function renderizarAudios() {


const container =
    obterElemento(
        CONFIG.elementos.audioList
    );


if (!container) {
    return;
}


const audios =
    obterPorTipo("audio");


if (!audios.length) {

    renderizarEstadoVazio(

        container,

        "headphones",

        "Nenhum áudio cadastrado",

        "As gravações deste perfil aparecerão aqui."

    );


    return;

}


container.innerHTML =
    audios
        .map(
            (item, indice) =>
                criarCardAudio(
                    item,
                    indice
                )
        )
        .join("");


renderizarIcones();


}

/* =====================================================
CARD DE ÁUDIO
===================================================== */

function criarCardAudio(
item,
indice
) {


const titulo =
    escaparHtml(
        item.titulo
    );


const descricao =
    escaparHtml(
        item.descricao
    );


const url =
    escaparHtml(
        item.url
    );


return `

    <article
        class="portfolio-audio-card"
        data-audio-index="${indice}"
    >

        <div class="portfolio-audio-icon">

            <i data-lucide="music-2"></i>

        </div>


        <div class="portfolio-audio-content">

            <strong class="portfolio-card-title">
                ${titulo}
            </strong>

            ${
                descricao
                    ? `
                        <span class="portfolio-card-description">
                            ${descricao}
                        </span>
                      `
                    : ""
            }


            <audio
                controls
                preload="metadata"
                src="${url}"
            ></audio>

        </div>

    </article>

`;


}

/* =====================================================
RENDERIZAR TUDO
===================================================== */

function renderizar(
dados
) {


portfolio =
    normalizarPortfolio(
        dados
    );


prepararContainers();

renderizarGaleria();

renderizarAudios();

renderizarIcones();


return portfolio;


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

} else {

    /*
     * Se os dados não forem fornecidos,
     * tenta obtê-los do módulo de dados.
     */

    if (
        window.ApresentarPerfilDados &&
        typeof window.ApresentarPerfilDados
            .obterPortfolio === "function"
    ) {

        renderizar(
            window.ApresentarPerfilDados
                .obterPortfolio()
        );

    } else {

        renderizar([]);

    }

}


inicializado = true;


return portfolio;


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
OBTER PORTFÓLIO
===================================================== */

function obterPortfolio() {


return [
    ...portfolio
];


}

/* =====================================================
OBTER IMAGENS
===================================================== */

function obterImagens() {


return obterPorTipo(
    "imagem"
);


}

/* =====================================================
OBTER VÍDEOS
===================================================== */

function obterVideos() {


return obterPorTipo(
    "video"
);


}

/* =====================================================
OBTER ÁUDIOS
===================================================== */

function obterAudios() {


return obterPorTipo(
    "audio"
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


portfolio = [];

inicializado = false;


const portfolioGrid =
    obterElemento(
        CONFIG.elementos.portfolioGrid
    );


const videoList =
    obterElemento(
        CONFIG.elementos.videoList
    );


const audioList =
    obterElemento(
        CONFIG.elementos.audioList
    );


if (portfolioGrid) {

    portfolioGrid.innerHTML = "";

}


if (videoList) {

    videoList.innerHTML = "";

    videoList.style.display = "none";

}


if (audioList) {

    audioList.innerHTML = "";

}


}

/* =====================================================
OBJETO PÚBLICO
===================================================== */

const ApresentarPerfilPortfolio = {


inicializar,

renderizar,

atualizar,

obterPortfolio,

obterImagens,

obterVideos,

obterAudios,

estaInicializado,

limpar,

normalizarItem,

normalizarPortfolio,

normalizarTipoMidia,

obterUrlMidia,

obterTitulo,

obterDescricao


};

/* =====================================================
DISPONIBILIZAR GLOBALMENTE
===================================================== */

window.ApresentarPerfilPortfolio =
ApresentarPerfilPortfolio;

/* =====================================================
CONFIRMAÇÃO DE CARREGAMENTO
===================================================== */

console.log(
"ApresentarPerfilPortfolio.js carregado."
);

})(window);
