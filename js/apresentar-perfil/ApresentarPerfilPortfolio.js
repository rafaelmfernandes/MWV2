(function (window) {

"use strict";


/* =========================================================
   MUSICALWORLD / ARTISTASHOW — PORTFÓLIO DO PERFIL PÚBLICO

   Arquivo:
   ApresentarPerfilPortfolio.js

   Responsabilidade:

   * Normalizar os itens de portfólio recebidos do banco.
   * Renderizar imagens, vídeos e áudios.
   * Controlar a galeria principal do perfil público.
   * Criar o efeito de deck empilhado.
   * Manter o formato visual vertical 9:16.
   * Controlar swipe/arraste lateral.
   * Permitir navegação pelos botões laterais.
   * Manter o deck circular.
   * Criar e atualizar os indicadores de paginação.
   * Permitir navegação pelas bolinhas.
   * Controlar reprodução automática dos vídeos.
   * Pausar vídeos durante swipe.
   * Pausar vídeos quando saem completamente da viewport.
   * Reproduzir novamente quando o vídeo volta a ficar
     completamente visível.
   * Manter compatibilidade com os demais módulos
     da página pública.

   Relação com outros módulos:

   * ApresentarPerfil.js
     chama este módulo para renderizar o portfólio.

   * PerfilPublico / módulos de dados
     fornecem os dados do portfólio.

   * apresentar-perfil-portfolio.css
     controla toda a apresentação visual estática.

   * O HTML fornece:
     #portfolioGrid
     #videoList
     #audioList
   ========================================================= */


/* =========================================================
   ESTADO
   ========================================================= */

let portfolio = [];

let inicializado = false;


let galeria = {

    itens: [],

    indiceAtual: 0,

    arrastando: false,

    gestoHorizontal: false,

    inicioX: 0,

    inicioY: 0,

    deslocamentoX: 0,

    ponteiroId: null,

    bloqueado: false,

    animando: false

};


let ignorarProximoClique = false;

let eventosDeckRegistrados = false;


/* =========================================================
   OBSERVER DOS VÍDEOS

   Responsabilidade:

   * Detectar quando um vídeo está completamente visível
     na tela.
   * Iniciar reprodução quando estiver 100% visível.
   * Pausar quando deixar de estar completamente visível.
   * Permitir que o vídeo volte a reproduzir quando retornar
     completamente para a viewport.
   ========================================================= */

let observerVideos = null;


/*
 * Indica se o usuário está realizando um swipe horizontal.
 *
 * Enquanto estiver true, nenhum vídeo deve reproduzir.
 */

let videosPausadosPorSwipe = false;


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    elementos: {

        portfolioGrid: "portfolioGrid",

        videoList: "videoList",

        audioList: "audioList"

    },


    deck: {

        limiteSwipe: 0.20,

        limitePixels: 55,

        duracao: 360,

        deslocamentoProximo: 28,

        deslocamentoVertical: 9,

        escalaProximo: 0.92,

        escalaDistante: 0.88,

        rotacaoMaxima: 4,

        blurProximo: "2px",

        blurDistante: "3px"

    },


    video: {

        /*
         * O vídeo precisa estar completamente visível
         * para iniciar automaticamente.
         *
         * threshold 1 = 100%.
         */

        visibilidadeMinima: 1,

        /*
         * O vídeo começa sem áudio para que o navegador
         * permita o autoplay.
         */

        muted: true,

        /*
         * Reproduz automaticamente quando ficar totalmente
         * visível.
         */

        autoplay: true

    }

};


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function obterUtils() {

    if (window.PerfilUtils) {

        return window.PerfilUtils;

    }

    return null;
}


function obterElemento(id) {

    if (!id) {

        return null;

    }


    return document.getElementById(id);
}


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


function renderizarIcones(container) {

    if (!container) {

        return;

    }


    try {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
            "function"
        ) {

            window.lucide.createIcons({

                attrs: {

                    "stroke-width": 1.8

                }

            });

        }

    } catch (erro) {

        console.warn(
            "ApresentarPerfilPortfolio: não foi possível atualizar ícones.",
            erro
        );

    }

}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarTipoMidia(item) {

    if (!item) {

        return "imagem";

    }


    const tipoOriginal =

        String(

            item.tipo_midia ||

            item.tipoMidia ||

            item.tipo ||

            item.media_type ||

            item.mediaType ||

            ""

        )

            .toLowerCase()

            .trim();


    const url =

        String(

            item.url ||

            item.arquivo_url ||

            item.arquivoUrl ||

            item.media_url ||

            item.mediaUrl ||

            item.caminho ||

            item.src ||

            ""

        )

            .toLowerCase();


    if (

        tipoOriginal.includes("video") ||

        tipoOriginal.includes("vídeo") ||

        tipoOriginal === "mp4" ||

        tipoOriginal === "webm" ||

        tipoOriginal === "mov" ||

        url.endsWith(".mp4") ||

        url.endsWith(".webm") ||

        url.endsWith(".mov")

    ) {

        return "video";

    }


    if (

        tipoOriginal.includes("audio") ||

        tipoOriginal.includes("áudio") ||

        tipoOriginal === "mp3" ||

        tipoOriginal === "wav" ||

        tipoOriginal === "ogg" ||

        url.endsWith(".mp3") ||

        url.endsWith(".wav") ||

        url.endsWith(".ogg")

    ) {

        return "audio";

    }


    return "imagem";

}


function obterUrlMidia(item) {

    if (!item) {

        return "";

    }


    return (

        item.url ||

        item.arquivo_url ||

        item.arquivoUrl ||

        item.media_url ||

        item.mediaUrl ||

        item.caminho ||

        item.src ||

        item.public_url ||

        item.publicUrl ||

        ""

    );

}


function obterTitulo(item) {

    if (!item) {

        return "";

    }


    return (

        item.titulo ||

        item.nome ||

        item.nome_arquivo ||

        item.nomeArquivo ||

        item.title ||

        ""

    );

}


function obterDescricao(item) {

    if (!item) {

        return "";

    }


    return (

        item.descricao ||

        item.description ||

        item.texto ||

        item.legenda ||

        ""

    );

}


function normalizarItem(
    item,
    indice
) {

    if (!item) {

        return null;

    }


    const url =

        obterUrlMidia(item);


    if (!url) {

        return null;

    }


    return {

        ...item,

        _indice: indice,

        _tipo:

            normalizarTipoMidia(item),

        _url: url,

        _titulo:

            obterTitulo(item),

        _descricao:

            obterDescricao(item)

    };

}


function normalizarPortfolio(lista) {

    if (!Array.isArray(lista)) {

        return [];

    }


    return lista

        .map(function (
            item,
            indice
        ) {

            return normalizarItem(
                item,
                indice
            );

        })

        .filter(Boolean);

}


function obterPorTipo(tipo) {

    return portfolio.filter(

        function (item) {

            return (

                item &&

                item._tipo === tipo

            );

        }

    );

}


/* =========================================================
   ESTADO VAZIO
   ========================================================= */

function renderizarEstadoVazio(
    container,
    mensagem
) {

    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="portfolio-estado-vazio">

            <div class="portfolio-estado-vazio-icone">

                <i data-lucide="images"></i>

            </div>

            <p>

                ${escaparHtml(

                    mensagem ||

                    "Este artista ainda não adicionou trabalhos ao portfólio."

                )}

            </p>

        </div>

    `;


    renderizarIcones(container);

}


/* =========================================================
   PREPARAÇÃO DOS CONTAINERS
   ========================================================= */

function prepararContainers() {

    const videoList =

        obterElemento(
            CONFIG.elementos.videoList
        );


    const audioList =

        obterElemento(
            CONFIG.elementos.audioList
        );


    if (videoList) {

        videoList.classList.add(
            "portfolio-container-preparado"
        );

    }


    if (audioList) {

        audioList.classList.add(
            "portfolio-container-preparado"
        );

    }

}


/* =========================================================
   GALERIA PRINCIPAL
   ========================================================= */

function renderizarGaleria() {

    const container =

        obterElemento(
            CONFIG.elementos.portfolioGrid
        );


    if (!container) {

        return;

    }


    desmontarInteracaoDeck();


    container.innerHTML =
        "";


    const itensGaleria =

        portfolio.filter(

            function (item) {

                return (

                    item &&

                    (

                        item._tipo === "imagem" ||

                        item._tipo === "video"

                    )

                );

            }

        );


    galeria.itens =
        itensGaleria;


    if (!itensGaleria.length) {

        galeria.indiceAtual =
            0;


        galeria.deslocamentoX =
            0;


        renderizarEstadoVazio(

            container,

            "Este artista ainda não adicionou trabalhos ao portfólio."

        );


        return;

    }


    galeria.indiceAtual =

        Math.min(

            galeria.indiceAtual,

            itensGaleria.length - 1

        );


    if (itensGaleria.length > 1) {

        criarBotoesNavegacaoGaleria(
            container
        );

    }


    const deck =
        document.createElement("div");


    deck.className =
        "portfolio-deck";


    deck.setAttribute(
        "aria-label",
        "Galeria de trabalhos do artista"
    );


    itensGaleria.forEach(

        function (
            item,
            indice
        ) {

            let card = null;


            if (
                item._tipo === "video"
            ) {

                card =

                    criarCardGaleriaVideo(

                        item,

                        indice

                    );

            } else {

                card =

                    criarCardGaleriaImagem(

                        item,

                        indice

                    );

            }


            if (card) {

                deck.appendChild(
                    card
                );

            }

        }

    );


    container.appendChild(
        deck
    );


    criarIndicadoresGaleria(

        container,

        itensGaleria.length

    );


    configurarErrosImagens(
        deck
    );


    configurarErrosVideos(
        deck
    );


    configurarDeck();


    configurarObserverVideos();


    renderizarIcones(
        container
    );

}


/* =========================================================
   BOTÕES DE NAVEGAÇÃO LATERAL
   ========================================================= */

function criarBotoesNavegacaoGaleria(
    container
) {

    if (!container) {

        return;

    }


    const botaoAnterior =
        document.createElement("button");


    botaoAnterior.type =
        "button";


    botaoAnterior.className =
        "portfolio-deck-nav portfolio-deck-nav-prev";


    botaoAnterior.setAttribute(
        "aria-label",
        "Trabalho anterior"
    );


    botaoAnterior.setAttribute(
        "title",
        "Trabalho anterior"
    );


    botaoAnterior.innerHTML = `

        <i
            data-lucide="chevron-left"
            aria-hidden="true"
        ></i>

    `;


    botaoAnterior.addEventListener(

        "click",

        function (evento) {

            evento.preventDefault();

            evento.stopPropagation();

            pausarTodosVideos();

            voltarGaleria();

        }

    );


    const botaoProximo =
        document.createElement("button");


    botaoProximo.type =
        "button";


    botaoProximo.className =
        "portfolio-deck-nav portfolio-deck-nav-next";


    botaoProximo.setAttribute(
        "aria-label",
        "Próximo trabalho"
    );


    botaoProximo.setAttribute(
        "title",
        "Próximo trabalho"
    );


    botaoProximo.innerHTML = `

        <i
            data-lucide="chevron-right"
            aria-hidden="true"
        ></i>

    `;


    botaoProximo.addEventListener(

        "click",

        function (evento) {

            evento.preventDefault();

            evento.stopPropagation();

            pausarTodosVideos();

            avancarGaleria();

        }

    );


    container.appendChild(
        botaoAnterior
    );


    container.appendChild(
        botaoProximo
    );

}


/* =========================================================
   CONFIGURAÇÃO VISUAL BASE DO CARD
   ========================================================= */

function configurarEstiloCard(
    card
) {

    if (!card) {

        return;

    }


    card.style.transition =

        `transform ${CONFIG.deck.duracao}ms cubic-bezier(.22,.61,.36,1), ` +

        `opacity ${CONFIG.deck.duracao}ms ease, ` +

        `filter ${CONFIG.deck.duracao}ms ease`;

}


/* =========================================================
   CARD DE IMAGEM
   ========================================================= */

function criarCardGaleriaImagem(
    item,
    indice
) {

    const card =

        document.createElement(
            "article"
        );


    card.className =
        "portfolio-deck-card";


    card.dataset.indice =
        String(indice);


    card.dataset.tipo =
        "imagem";


    card.setAttribute(
        "aria-label",
        item._titulo ||
        `Imagem ${indice + 1} do portfólio`
    );


    configurarEstiloCard(
        card
    );


    const imagem =

        document.createElement(
            "img"
        );


    imagem.className =
        "portfolio-deck-media";


    imagem.src =
        item._url;


    imagem.alt =
        item._titulo ||
        "Trabalho do artista";


    imagem.loading =

        indice === 0
            ? "eager"
            : "lazy";


    imagem.draggable =
        false;


    card.appendChild(
        imagem
    );


    adicionarLegendaCard(
        card,
        item
    );


    return card;

}


/* =========================================================
   CARD DE VÍDEO
   ========================================================= */

function criarCardGaleriaVideo(
    item,
    indice
) {

    const card =

        document.createElement(
            "article"
        );


    card.className =

        "portfolio-deck-card portfolio-deck-card-video";


    card.dataset.indice =
        String(indice);


    card.dataset.tipo =
        "video";


    card.setAttribute(
        "aria-label",
        item._titulo ||
        `Vídeo ${indice + 1} do portfólio`
    );


    configurarEstiloCard(
        card
    );


    const video =

        document.createElement(
            "video"
        );


    video.className =
        "portfolio-deck-media";


    video.src =
        item._url;


    /*
     * CONTROLES NORMAIS DO VÍDEO
     *
     * O usuário continua podendo tocar, pausar,
     * avançar e controlar o vídeo manualmente.
     */

    video.controls =
        true;


    /*
     * AUTOPLAY
     *
     * O JavaScript decide quando o vídeo realmente
     * deve começar. O atributo autoplay não é usado
     * diretamente porque precisamos esperar o card
     * ficar completamente visível.
     */

    video.autoplay =
        false;


    /*
     * MUTED
     *
     * Necessário para que o navegador permita a
     * reprodução automática.
     */

    video.muted =
        CONFIG.video.muted;


    video.defaultMuted =
        CONFIG.video.muted;


    video.setAttribute(
        "muted",
        ""
    );


    video.preload =
        "metadata";


    video.playsInline =
        true;


    video.setAttribute(
        "webkit-playsinline",
        ""
    );


    /*
     * Marca o elemento como vídeo controlado pelo
     * sistema automático desta galeria.
     */

    video.dataset.autoplayControlado =
        "true";


    card.appendChild(
        video
    );


    adicionarLegendaCard(
        card,
        item
    );


    return card;

}


/* =========================================================
   LEGENDA
   ========================================================= */

function adicionarLegendaCard(
    card,
    item
) {

    if (
        !item._titulo &&
        !item._descricao
    ) {

        return;

    }


    const informacoes =

        document.createElement(
            "div"
        );


    informacoes.className =
        "portfolio-deck-caption";


    if (item._titulo) {

        const titulo =

            document.createElement(
                "strong"
            );


        titulo.textContent =
            item._titulo;


        informacoes.appendChild(
            titulo
        );

    }


    if (item._descricao) {

        const descricao =

            document.createElement(
                "span"
            );


        descricao.textContent =
            item._descricao;


        informacoes.appendChild(
            descricao
        );

    }


    card.appendChild(
        informacoes
    );

}


/* =========================================================
   INDICADORES DE PAGINAÇÃO
   ========================================================= */

function criarIndicadoresGaleria(
    container,
    quantidade
) {

    removerIndicadoresGaleria();


    if (
        !container ||
        quantidade <= 1
    ) {

        return;

    }


    const indicadores =

        document.createElement(
            "div"
        );


    indicadores.className =
        "portfolio-deck-indicadores";


    indicadores.setAttribute(
        "aria-label",
        "Navegação da galeria"
    );


    for (
        let indice = 0;
        indice < quantidade;
        indice++
    ) {

        const botao =

            document.createElement(
                "button"
            );


        botao.type =
            "button";


        botao.className =
            "portfolio-deck-indicador";


        botao.dataset.indice =
            String(indice);


        botao.setAttribute(
            "aria-label",
            `Ir para o item ${indice + 1}`
        );


        botao.setAttribute(
            "aria-current",

            indice ===
            galeria.indiceAtual

                ? "true"

                : "false"
        );


        botao.addEventListener(

            "click",

            function (evento) {

                evento.preventDefault();

                evento.stopPropagation();

                pausarTodosVideos();


                const alvo =

                    Number(
                        botao.dataset.indice
                    );


                irParaItem(
                    alvo
                );

            }

        );


        indicadores.appendChild(
            botao
        );

    }


    container.appendChild(
        indicadores
    );

}


function removerIndicadoresGaleria() {

    const container =

        obterElemento(
            CONFIG.elementos.portfolioGrid
        );


    if (!container) {

        return;

    }


    const indicadores =

        container.querySelector(
            ".portfolio-deck-indicadores"
        );


    if (indicadores) {

        indicadores.remove();

    }

}


function atualizarIndicadoresGaleria() {

    const container =

        obterElemento(
            CONFIG.elementos.portfolioGrid
        );


    if (!container) {

        return;

    }


    const indicadores =

        container.querySelectorAll(
            ".portfolio-deck-indicador"
        );


    if (!indicadores.length) {

        return;

    }


    indicadores.forEach(

        function (
            botao,
            indice
        ) {

            const ativo =

                indice ===
                galeria.indiceAtual;


            botao.setAttribute(

                "aria-current",

                ativo
                    ? "true"
                    : "false"

            );

        }

    );

}


/* =========================================================
   ERROS DE IMAGEM
   ========================================================= */

function configurarErrosImagens(
    container
) {

    if (!container) {

        return;

    }


    const imagens =

        container.querySelectorAll(
            "img.portfolio-deck-media"
        );


    imagens.forEach(

        function (imagem) {

            imagem.addEventListener(

                "error",

                function () {

                    imagem.style.display =
                        "none";


                    const card =

                        imagem.closest(
                            ".portfolio-deck-card"
                        );


                    if (!card) {

                        return;

                    }


                    card.classList.add(
                        "portfolio-media-erro"
                    );


                    const mensagem =

                        document.createElement(
                            "div"
                        );


                    mensagem.className =
                        "portfolio-media-erro-mensagem";


                    mensagem.textContent =
                        "Não foi possível carregar esta imagem.";


                    card.appendChild(
                        mensagem
                    );


                    ajustarAlturaDeck();

                }

            );

        }

    );

}


/* =========================================================
   ERROS DE VÍDEO
   ========================================================= */

function configurarErrosVideos(
    container
) {

    if (!container) {

        return;

    }


    const videos =

        container.querySelectorAll(
            "video.portfolio-deck-media"
        );


    videos.forEach(

        function (video) {

            video.addEventListener(

                "error",

                function () {

                    video.controls =
                        false;


                    const card =

                        video.closest(
                            ".portfolio-deck-card"
                        );


                    if (!card) {

                        return;

                    }


                    card.classList.add(
                        "portfolio-media-erro"
                    );

                }

            );

        }

    );

}


/* =========================================================
   DECK
   ========================================================= */

function obterDeck() {

    const container =

        obterElemento(
            CONFIG.elementos.portfolioGrid
        );


    if (!container) {

        return null;

    }


    return container.querySelector(
        ".portfolio-deck"
    );

}


function obterCardsDeck() {

    const deck =
        obterDeck();


    if (!deck) {

        return [];

    }


    return Array.from(

        deck.querySelectorAll(
            ".portfolio-deck-card"
        )

    );

}


function obterCardPorIndice(
    indice
) {

    const deck =
        obterDeck();


    if (!deck) {

        return null;

    }


    return deck.querySelector(

        `.portfolio-deck-card[data-indice="${indice}"]`

    );

}


function normalizarIndice(
    indice
) {

    const total =
        galeria.itens.length;


    if (!total) {

        return 0;

    }


    let resultado =
        Number(indice);


    if (
        !Number.isFinite(
            resultado
        )
    ) {

        resultado = 0;

    }


    resultado =
        Math.round(
            resultado
        );


    resultado =
        (

            (

                resultado %
                total

            ) +

            total

        ) %

        total;


    return resultado;

}


function obterDiferencaCircular(
    indice,
    atual,
    total
) {

    if (total <= 1) {

        return 0;

    }


    let diferenca =
        indice - atual;


    if (
        diferenca >
        total / 2
    ) {

        diferenca -=
            total;

    }


    if (
        diferenca <
        -(total / 2)
    ) {

        diferenca +=
            total;

    }


    return diferenca;

}


/* =========================================================
   POSICIONAMENTO DO DECK
   ========================================================= */

function aplicarPosicoesDeck(
    deslocamento = 0,
    animar = true
) {

    const cards =
        obterCardsDeck();


    const total =
        cards.length;


    if (!total) {

        return;

    }


    const dx =
        Number(deslocamento) || 0;


    const progresso =

        Math.min(

            Math.abs(dx) / 140,

            1

        );


    cards.forEach(

        function (card) {

            const indice =

                Number(
                    card.dataset.indice
                );


            const diferenca =

                obterDiferencaCircular(

                    indice,

                    galeria.indiceAtual,

                    total

                );


            if (animar) {

                card.style.transition = `

                    transform ${CONFIG.deck.duracao}ms ease,

                    opacity ${CONFIG.deck.duracao}ms ease,

                    filter ${CONFIG.deck.duracao}ms ease

                `;

            } else {

                card.style.transition =
                    "none";

            }


            card.style.pointerEvents =
                "none";


            card.style.opacity =
                "0";


            card.style.zIndex =
                "5";


            let x = 0;

            let y = 0;

            let escala =
                CONFIG.deck.escalaDistante;

            let rotacao = 0;


            /* =============================================
               CARD PRINCIPAL
               ============================================= */

            if (
                diferenca === 0
            ) {

                x = dx;

                y = 0;

                escala = 1;


                card.style.filter =
                    "blur(0px)";


                rotacao =

                    Math.max(

                        -CONFIG.deck.rotacaoMaxima,

                        Math.min(

                            CONFIG.deck.rotacaoMaxima,

                            dx / 35

                        )

                    );


                card.style.opacity =
                    "1";


                card.style.zIndex =
                    "40";


                card.style.pointerEvents =

                    galeria.arrastando

                        ? "none"

                        : "auto";

            }


            /* =============================================
               PRÓXIMO CARD
               ============================================= */

            else if (
                diferenca === 1
            ) {

                const deslocamentoBase =
                    CONFIG.deck.deslocamentoProximo;


                const yBase =
                    CONFIG.deck.deslocamentoVertical;


                const escalaBase =
                    CONFIG.deck.escalaProximo;


                if (
                    galeria.arrastando &&
                    dx < 0
                ) {

                    const fator =
                        progresso;


                    x =
                        deslocamentoBase *
                        (1 - fator);


                    y =
                        yBase *
                        (1 - fator);


                    escala =
                        escalaBase +
                        (
                            (1 - escalaBase) *
                            fator
                        );


                    const blurInicial =

                        parseFloat(

                            CONFIG.deck.blurProximo

                        ) || 0;


                    const blur =

                        blurInicial *
                        (1 - fator);


                    card.style.filter =
                        `blur(${blur}px)`;

                } else {

                    x =
                        deslocamentoBase;


                    y =
                        yBase;


                    escala =
                        escalaBase;


                    card.style.filter =

                        `blur(${CONFIG.deck.blurProximo})`;

                }


                card.style.opacity =
                    "1";


                card.style.zIndex =
                    "20";

            }


            /* =============================================
               CARD ANTERIOR
               ============================================= */

            else if (
                diferenca === -1
            ) {

                const deslocamentoBase =

                    -CONFIG.deck.deslocamentoProximo;


                const yBase =
                    CONFIG.deck.deslocamentoVertical;


                const escalaBase =
                    CONFIG.deck.escalaProximo;


                if (
                    galeria.arrastando &&
                    dx > 0
                ) {

                    const fator =
                        progresso;


                    x =
                        deslocamentoBase *
                        (1 - fator);


                    y =
                        yBase *
                        (1 - fator);


                    escala =
                        escalaBase +
                        (
                            (1 - escalaBase) *
                            fator
                        );


                    const blurInicial =

                        parseFloat(

                            CONFIG.deck.blurProximo

                        ) || 0;


                    const blur =

                        blurInicial *
                        (1 - fator);


                    card.style.filter =
                        `blur(${blur}px)`;

                } else {

                    x =
                        deslocamentoBase;


                    y =
                        yBase;


                    escala =
                        escalaBase;


                    card.style.filter =

                        `blur(${CONFIG.deck.blurProximo})`;

                }


                card.style.opacity =
                    "1";


                card.style.zIndex =
                    "19";

            }


            /* =============================================
               CARDS DISTANTES
               ============================================= */

            else {

                x = 0;

                y = 14;

                escala =
                    CONFIG.deck.escalaDistante;


                card.style.opacity =
                    "0";


                card.style.zIndex =
                    "5";


                card.style.pointerEvents =
                    "none";


                card.style.filter =

                    `blur(${CONFIG.deck.blurDistante})`;

            }


            card.style.transform =

                `translate3d(calc(-50% + ${x}px), ${y}px, 0) ` +

                `rotate(${rotacao}deg) ` +

                `scale(${escala})`;

        }

    );


    atualizarIndicadoresGaleria();


    atualizarVideoAtivo();


    ajustarAlturaDeck();

}


/* =========================================================
   ALTURA DO DECK
   ========================================================= */

function ajustarAlturaDeck() {

    const deck =
        obterDeck();


    if (!deck) {

        return;

    }


    const cards =
        obterCardsDeck();


    if (!cards.length) {

        return;

    }


    let maiorAltura = 0;


    cards.forEach(

        function (card) {

            const altura =

                card.offsetHeight ||

                card.scrollHeight ||

                0;


            if (
                altura >
                maiorAltura
            ) {

                maiorAltura =
                    altura;

            }

        }

    );


    if (
        maiorAltura > 0
    ) {

        deck.style.height =
            `${maiorAltura + 36}px`;

    }


    const imagens =

        deck.querySelectorAll(
            "img"
        );


    imagens.forEach(

        function (imagem) {

            if (
                !imagem.complete
            ) {

                imagem.addEventListener(

                    "load",

                    ajustarAlturaDeck,

                    {
                        once: true
                    }

                );

            }

        }

    );


    const videos =

        deck.querySelectorAll(
            "video"
        );


    videos.forEach(

        function (video) {

            if (
                video.readyState >= 1
            ) {

                return;

            }


            video.addEventListener(

                "loadedmetadata",

                ajustarAlturaDeck,

                {
                    once: true
                }

            );

        }

    );

}


/* =========================================================
   CONFIGURAÇÃO INICIAL DO DECK
   ========================================================= */

function configurarDeck() {

    const deck =
        obterDeck();


    if (!deck) {

        return;

    }


    aplicarPosicoesDeck(
        0,
        false
    );


    configurarEventosDeck();


    ajustarAlturaDeck();

}


/* =========================================================
   EVENTOS
   ========================================================= */

function configurarEventosDeck() {

    const deck =
        obterDeck();


    if (!deck) {

        return;

    }


    removerEventosDeck();


    deck.addEventListener(
        "pointerdown",
        iniciarArrasteDeck
    );


    deck.addEventListener(
        "pointermove",
        moverArrasteDeck
    );


    deck.addEventListener(
        "pointerup",
        finalizarArrasteDeck
    );


    deck.addEventListener(
        "pointercancel",
        cancelarArrasteDeck
    );


    deck.addEventListener(
        "click",
        controlarCliqueDepoisSwipe
    );


    window.addEventListener(
        "resize",
        ajustarDeckNoResize
    );


    eventosDeckRegistrados =
        true;

}


function removerEventosDeck() {

    const deck =
        obterDeck();


    if (
        !deck &&
        !eventosDeckRegistrados
    ) {

        return;

    }


    if (deck) {

        deck.removeEventListener(
            "pointerdown",
            iniciarArrasteDeck
        );


        deck.removeEventListener(
            "pointermove",
            moverArrasteDeck
        );


        deck.removeEventListener(
            "pointerup",
            finalizarArrasteDeck
        );


        deck.removeEventListener(
            "pointercancel",
            cancelarArrasteDeck
        );


        deck.removeEventListener(
            "click",
            controlarCliqueDepoisSwipe
        );

    }


    window.removeEventListener(
        "resize",
        ajustarDeckNoResize
    );


    eventosDeckRegistrados =
        false;

}


/* =========================================================
   INÍCIO DO ARRASTE
   ========================================================= */

function iniciarArrasteDeck(
    evento
) {

    if (
        galeria.bloqueado ||
        galeria.animando ||
        galeria.itens.length <= 1
    ) {

        return;

    }


    if (
        evento.pointerType === "mouse" &&
        evento.button !== 0
    ) {

        return;

    }


    galeria.arrastando =
        true;


    galeria.gestoHorizontal =
        false;


    galeria.inicioX =
        evento.clientX;


    galeria.inicioY =
        evento.clientY;


    galeria.deslocamentoX =
        0;


    galeria.ponteiroId =
        evento.pointerId;


    ignorarProximoClique =
        false;


    /*
     * Assim que o usuário começa a interagir com o deck,
     * pausamos qualquer vídeo.
     */

    videosPausadosPorSwipe =
        true;


    pausarTodosVideos();


    const deck =
        obterDeck();


    if (deck) {

        deck.style.cursor =
            "grab";

    }

}


/* =========================================================
   MOVIMENTO DO ARRASTE
   ========================================================= */

function moverArrasteDeck(
    evento
) {

    if (
        !galeria.arrastando ||
        galeria.ponteiroId !== evento.pointerId
    ) {

        return;

    }


    const deslocamentoX =

        evento.clientX -
        galeria.inicioX;


    const deslocamentoY =

        evento.clientY -
        galeria.inicioY;


    if (
        !galeria.gestoHorizontal
    ) {

        if (
            Math.abs(deslocamentoX) < 8 &&
            Math.abs(deslocamentoY) < 8
        ) {

            return;

        }


        if (
            Math.abs(deslocamentoY) >
            Math.abs(deslocamentoX)
        ) {

            galeria.arrastando =
                false;


            galeria.gestoHorizontal =
                false;


            galeria.ponteiroId =
                null;


            videosPausadosPorSwipe =
                false;


            atualizarVideoAtivo();


            return;

        }


        galeria.gestoHorizontal =
            true;


        const deck =
            obterDeck();


        if (
            deck &&
            deck.setPointerCapture
        ) {

            try {

                deck.setPointerCapture(
                    evento.pointerId
                );

            } catch (erro) {

                console.warn(
                    "ApresentarPerfilPortfolio: não foi possível capturar o ponteiro.",
                    erro
                );

            }

        }

    }


    if (
        !galeria.gestoHorizontal
    ) {

        return;

    }


    evento.preventDefault();


    galeria.deslocamentoX =
        deslocamentoX;


    aplicarPosicoesDeck(
        deslocamentoX,
        false
    );


    const deck =
        obterDeck();


    if (deck) {

        deck.style.cursor =
            "grabbing";

    }

}


/* =========================================================
   FINALIZAÇÃO DO ARRASTE
   ========================================================= */

function finalizarArrasteDeck(
    evento
) {

    if (
        !galeria.arrastando ||
        galeria.ponteiroId !== evento.pointerId
    ) {

        return;

    }


    const deslocamento =
        galeria.deslocamentoX;


    const deck =
        obterDeck();


    liberarCapturaPonteiro(
        deck,
        evento.pointerId
    );


    galeria.arrastando =
        false;


    galeria.ponteiroId =
        null;


    if (
        !galeria.gestoHorizontal
    ) {

        galeria.deslocamentoX =
            0;


        galeria.gestoHorizontal =
            false;


        videosPausadosPorSwipe =
            false;


        aplicarPosicoesDeck(
            0,
            true
        );


        atualizarVideoAtivo();


        return;

    }


    galeria.gestoHorizontal =
        false;


    const largura =

        deck
            ? deck.clientWidth
            : window.innerWidth;


    const limitePorPorcentagem =

        largura *
        CONFIG.deck.limiteSwipe;


    const limite =

        Math.max(
            CONFIG.deck.limitePixels,
            limitePorPorcentagem
        );


    ignorarProximoClique =

        Math.abs(deslocamento) >=
        limite;


    if (
        Math.abs(deslocamento) >=
        limite
    ) {

        if (
            deslocamento < 0
        ) {

            avancarGaleria();

        } else {

            voltarGaleria();

        }

    } else {

        restaurarCardAtual();

    }


    galeria.deslocamentoX =
        0;


    /*
     * O swipe terminou.
     *
     * A reprodução não é iniciada imediatamente.
     * O observer verificará se o card está realmente
     * 100% visível na viewport.
     */

    videosPausadosPorSwipe =
        false;


    setTimeout(

        function () {

            atualizarVideoAtivo();

        },

        CONFIG.deck.duracao + 40

    );

}


/* =========================================================
   CANCELAMENTO
   ========================================================= */

function cancelarArrasteDeck(
    evento
) {

    if (
        !galeria.arrastando
    ) {

        return;

    }


    const deck =
        obterDeck();


    liberarCapturaPonteiro(
        deck,
        evento
            ? evento.pointerId
            : galeria.ponteiroId
    );


    galeria.arrastando =
        false;


    galeria.gestoHorizontal =
        false;


    galeria.ponteiroId =
        null;


    galeria.deslocamentoX =
        0;


    videosPausadosPorSwipe =
        false;


    restaurarCardAtual();


    setTimeout(

        function () {

            atualizarVideoAtivo();

        },

        CONFIG.deck.duracao + 40

    );

}


/* =========================================================
   CAPTURA DO PONTEIRO
   ========================================================= */

function liberarCapturaPonteiro(
    deck,
    ponteiroId
) {

    if (
        !deck ||
        ponteiroId === null ||
        ponteiroId === undefined
    ) {

        return;

    }


    if (
        typeof deck.hasPointerCapture ===
        "function" &&
        deck.hasPointerCapture(
            ponteiroId
        )
    ) {

        try {

            deck.releasePointerCapture(
                ponteiroId
            );

        } catch (erro) {

            console.warn(
                "ApresentarPerfilPortfolio: erro ao liberar captura do ponteiro.",
                erro
            );

        }

    }

}


/* =========================================================
   AVANÇAR
   ========================================================= */

function avancarGaleria() {

    if (
        galeria.animando ||
        galeria.itens.length <= 1
    ) {

        return;

    }


    pausarTodosVideos();


    galeria.animando =
        true;


    const novoIndice =

        normalizarIndice(

            galeria.indiceAtual + 1

        );


    galeria.indiceAtual =
        novoIndice;


    aplicarPosicoesDeck(
        0,
        true
    );


    atualizarIndicadoresGaleria();


    setTimeout(

        function () {

            galeria.animando =
                false;


            aplicarPosicoesDeck(
                0,
                false
            );


            atualizarIndicadoresGaleria();


            atualizarVideoAtivo();

        },

        CONFIG.deck.duracao + 30

    );

}


/* =========================================================
   VOLTAR
   ========================================================= */

function voltarGaleria() {

    if (
        galeria.animando ||
        galeria.itens.length <= 1
    ) {

        return;

    }


    pausarTodosVideos();


    galeria.animando =
        true;


    const novoIndice =

        normalizarIndice(

            galeria.indiceAtual - 1

        );


    galeria.indiceAtual =
        novoIndice;


    aplicarPosicoesDeck(
        0,
        true
    );


    atualizarIndicadoresGaleria();


    setTimeout(

        function () {

            galeria.animando =
                false;


            aplicarPosicoesDeck(
                0,
                false
            );


            atualizarIndicadoresGaleria();


            atualizarVideoAtivo();

        },

        CONFIG.deck.duracao + 30

    );

}


/* =========================================================
   RESTAURAR CARD
   ========================================================= */

function restaurarCardAtual() {

    if (
        galeria.animando
    ) {

        return;

    }


    pausarTodosVideos();


    aplicarPosicoesDeck(
        0,
        true
    );


    setTimeout(

        function () {

            aplicarPosicoesDeck(
                0,
                false
            );


            atualizarVideoAtivo();

        },

        CONFIG.deck.duracao + 30

    );

}


/* =========================================================
   CLIQUE APÓS SWIPE
   ========================================================= */

function controlarCliqueDepoisSwipe(
    evento
) {

    if (
        ignorarProximoClique
    ) {

        evento.preventDefault();

        evento.stopPropagation();

        ignorarProximoClique =
            false;

    }

}


/* =========================================================
   CONTROLE DOS VÍDEOS
   ========================================================= */

/*
 * Retorna todos os vídeos existentes no deck.
 */

function obterVideosDeck() {

    const deck =
        obterDeck();


    if (!deck) {

        return [];

    }


    return Array.from(

        deck.querySelectorAll(
            "video.portfolio-deck-media"
        )

    );

}


/*
 * Pausa todos os vídeos do deck.
 */

function pausarTodosVideos() {

    const videos =
        obterVideosDeck();


    videos.forEach(

        function (video) {

            try {

                if (!video.paused) {

                    video.pause();

                }

            } catch (erro) {

                console.warn(
                    "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                    erro
                );

            }

        }

    );

}


/*
 * Retorna o vídeo atualmente selecionado.
 */

function obterVideoAtivo() {

    const card =
        obterCardPorIndice(
            galeria.indiceAtual
        );


    if (!card) {

        return null;

    }


    return card.querySelector(
        "video.portfolio-deck-media"
    );

}


/*
 * Verifica se um elemento está completamente dentro
 * da viewport.
 *
 * A tolerância é pequena para evitar problemas causados
 * por arredondamentos de pixels do navegador.
 */

function estaCompletamenteVisivel(
    elemento
) {

    if (!elemento) {

        return false;

    }


    const rect =
        elemento.getBoundingClientRect();


    const alturaViewport =
        window.innerHeight ||
        document.documentElement.clientHeight;


    const larguraViewport =
        window.innerWidth ||
        document.documentElement.clientWidth;


    const tolerancia =
        1;


    return (

        rect.top >= -tolerancia &&

        rect.left >= -tolerancia &&

        rect.bottom <=
            alturaViewport + tolerancia &&

        rect.right <=
            larguraViewport + tolerancia

    );

}


/*
 * Reproduz um vídeo somente quando:

 * 1. Ele é o vídeo do card atual.
 * 2. O usuário não está realizando swipe.
 * 3. O card está completamente visível.
 */

function reproduzirVideoSePermitido(
    video
) {

    if (!video) {

        return;

    }


    if (
        videosPausadosPorSwipe ||
        galeria.arrastando ||
        galeria.animando
    ) {

        return;

    }


    const card =
        video.closest(
            ".portfolio-deck-card"
        );


    if (!card) {

        return;

    }


    const indice =
        Number(
            card.dataset.indice
        );


    if (
        indice !==
        galeria.indiceAtual
    ) {

        return;

    }


    if (
        !estaCompletamenteVisivel(
            card
        )
    ) {

        return;

    }


    /*
     * Autoplay precisa ser silencioso.
     */

    video.muted = true;

    video.defaultMuted = true;


    if (
        !video.paused
    ) {

        return;

    }


    try {

        const promessa =
            video.play();


        /*
         * Alguns navegadores retornam uma Promise
         * que pode ser rejeitada caso o autoplay seja
         * bloqueado.
         */

        if (
            promessa &&
            typeof promessa.catch ===
            "function"
        ) {

            promessa.catch(

                function (erro) {

                    console.warn(
                        "ApresentarPerfilPortfolio: autoplay do vídeo foi bloqueado pelo navegador.",
                        erro
                    );

                }

            );

        }

    } catch (erro) {

        console.warn(
            "ApresentarPerfilPortfolio: não foi possível iniciar vídeo.",
            erro
        );

    }

}


/*
 * Atualiza o estado do vídeo ativo.

 * O vídeo só inicia se estiver completamente visível.
 * Todos os demais vídeos são pausados.
 */

function atualizarVideoAtivo() {

    const videos =
        obterVideosDeck();


    if (!videos.length) {

        return;

    }


    videos.forEach(

        function (video) {

            const card =
                video.closest(
                    ".portfolio-deck-card"
                );


            if (!card) {

                return;

            }


            const indice =
                Number(
                    card.dataset.indice
                );


            /*
             * Qualquer vídeo que não seja o atual
             * deve permanecer pausado.
             */

            if (
                indice !==
                galeria.indiceAtual
            ) {

                if (
                    !video.paused
                ) {

                    try {

                        video.pause();

                    } catch (erro) {

                        console.warn(
                            "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                            erro
                        );

                    }

                }

                return;

            }


            /*
             * Se o usuário está arrastando ou animando
             * a galeria, o vídeo permanece pausado.
             */

            if (
                videosPausadosPorSwipe ||
                galeria.arrastando ||
                galeria.animando
            ) {

                if (
                    !video.paused
                ) {

                    try {

                        video.pause();

                    } catch (erro) {

                        console.warn(
                            "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                            erro
                        );

                    }

                }

                return;

            }


            /*
             * O vídeo atual precisa estar completamente
             * visível para reproduzir.
             */

            if (
                estaCompletamenteVisivel(
                    card
                )
            ) {

                reproduzirVideoSePermitido(
                    video
                );

            } else {

                if (
                    !video.paused
                ) {

                    try {

                        video.pause();

                    } catch (erro) {

                        console.warn(
                            "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                            erro
                        );

                    }

                }

            }

        }

    );

}


/* =========================================================
   OBSERVER DOS VÍDEOS
   ========================================================= */

/*
 * Cria o IntersectionObserver responsável por detectar
 * quando cada card de vídeo está completamente visível.
 */

function configurarObserverVideos() {

    destruirObserverVideos();


    const deck =
        obterDeck();


    if (!deck) {

        return;

    }


    const videos =
        obterVideosDeck();


    if (!videos.length) {

        return;

    }


    /*
     * O observer utiliza threshold 1.
     *
     * Isso significa que a callback será chamada quando
     * o elemento atingir 100% de visibilidade e também
     * quando deixar de estar 100% visível.
     */

    try {

        observerVideos =
            new IntersectionObserver(

                function (
                    entradas
                ) {

                    entradas.forEach(

                        function (
                            entrada
                        ) {

                            const card =
                                entrada.target;


                            const video =
                                card.querySelector(
                                    "video.portfolio-deck-media"
                                );


                            if (!video) {

                                return;

                            }


                            const indice =
                                Number(
                                    card.dataset.indice
                                );


                            /*
                             * Se não for o card atual,
                             * mantém o vídeo pausado.
                             */

                            if (
                                indice !==
                                galeria.indiceAtual
                            ) {

                                if (
                                    !video.paused
                                ) {

                                    try {

                                        video.pause();

                                    } catch (erro) {

                                        console.warn(
                                            "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                                            erro
                                        );

                                    }

                                }

                                return;

                            }


                            /*
                             * O usuário está passando para
                             * outro card.
                             */

                            if (
                                videosPausadosPorSwipe ||
                                galeria.arrastando ||
                                galeria.animando
                            ) {

                                if (
                                    !video.paused
                                ) {

                                    try {

                                        video.pause();

                                    } catch (erro) {

                                        console.warn(
                                            "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                                            erro
                                        );

                                    }

                                }

                                return;

                            }


                            /*
                             * Card 100% visível:
                             * reproduz.
                             */

                            if (
                                entrada.isIntersecting &&
                                entrada.intersectionRatio >=
                                CONFIG.video.visibilidadeMinima
                            ) {

                                reproduzirVideoSePermitido(
                                    video
                                );

                            } else {

                                /*
                                 * Card deixou de estar
                                 * completamente visível:
                                 * pausa.
                                 */

                                if (
                                    !video.paused
                                ) {

                                    try {

                                        video.pause();

                                    } catch (erro) {

                                        console.warn(
                                            "ApresentarPerfilPortfolio: não foi possível pausar vídeo.",
                                            erro
                                        );

                                    }

                                }

                            }

                        }

                    );

                },

                {

                    threshold: [

                        0,

                        0.5,

                        0.75,

                        0.99,

                        1

                    ]

                }

            );


        videos.forEach(

            function (video) {

                const card =
                    video.closest(
                        ".portfolio-deck-card"
                    );


                if (card) {

                    observerVideos.observe(
                        card
                    );

                }

            }

        );


        /*
         * Fazemos uma verificação inicial porque,
         * dependendo do navegador, o observer pode demorar
         * um pequeno intervalo para entregar o primeiro
         * evento.
         */

        requestAnimationFrame(

            function () {

                atualizarVideoAtivo();

            }

        );

    } catch (erro) {

        console.warn(
            "ApresentarPerfilPortfolio: não foi possível criar observer dos vídeos.",
            erro
        );

    }

}


/*
 * Destrói o observer anterior.
 *
 * Isso é importante porque a galeria é reconstruída
 * quando o portfólio é atualizado.
 */

function destruirObserverVideos() {

    if (observerVideos) {

        try {

            observerVideos.disconnect();

        } catch (erro) {

            console.warn(
                "ApresentarPerfilPortfolio: erro ao desconectar observer dos vídeos.",
                erro
            );

        }

        observerVideos =
            null;

    }

}


/* =========================================================
   RESIZE
   ========================================================= */

function ajustarDeckNoResize() {

    aplicarPosicoesDeck(

        galeria.arrastando
            ? galeria.deslocamentoX
            : 0,

        false

    );


    ajustarAlturaDeck();


    /*
     * Após redimensionamento, verificamos novamente
     * se o vídeo está completamente visível.
     */

    atualizarVideoAtivo();

}


/* =========================================================
   DESMONTAR INTERAÇÃO
   ========================================================= */

function desmontarInteracaoDeck() {

    removerEventosDeck();


    destruirObserverVideos();


    pausarTodosVideos();


    galeria.arrastando =
        false;


    galeria.gestoHorizontal =
        false;


    galeria.ponteiroId =
        null;


    galeria.deslocamentoX =
        0;


    galeria.animando =
        false;


    videosPausadosPorSwipe =
        false;


    const deck =
        obterDeck();


    if (deck) {

        resetarEstiloContainerDeck(
            deck
        );

    }

}


function resetarEstiloContainerDeck(
    deck
) {

    if (!deck) {

        return;

    }


    deck.style.cursor =
        "grab";

}


/* =========================================================
   ÁUDIOS
   ========================================================= */

function renderizarAudios() {

    const container =

        obterElemento(
            CONFIG.elementos.audioList
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const audios =
        obterPorTipo(
            "audio"
        );


    if (!audios.length) {

        container.innerHTML =
            "";

        return;

    }


    audios.forEach(

        function (
            item,
            indice
        ) {

            const card =

                criarCardAudio(
                    item,
                    indice
                );


            if (card) {

                container.appendChild(
                    card
                );

            }

        }

    );


    renderizarIcones(
        container
    );

}


function criarCardAudio(
    item,
    indice
) {

    const card =

        document.createElement(
            "article"
        );


    card.className =
        "portfolio-audio-card";


    const titulo =

        item._titulo ||
        `Áudio ${indice + 1}`;


    const descricao =
        item._descricao;


    card.innerHTML = `

        <div class="portfolio-audio-card-conteudo">

            <div class="portfolio-audio-card-icone">

                <i data-lucide="music-2"></i>

            </div>


            <div class="portfolio-audio-card-info">

                <strong>

                    ${escaparHtml(titulo)}

                </strong>

                ${
                    descricao

                        ? `

                            <span>

                                ${escaparHtml(descricao)}

                            </span>

                        `

                        : ""

                }

            </div>

        </div>


        <audio
            controls
            preload="metadata"
            src="${escaparHtml(item._url)}"
        ></audio>

    `;


    return card;

}


/* =========================================================
   RENDERIZAÇÃO COMPLETA
   ========================================================= */

function renderizar(
    lista
) {

    if (
        Array.isArray(lista)
    ) {

        portfolio =

            normalizarPortfolio(
                lista
            );

    }


    prepararContainers();


    renderizarGaleria();


    renderizarAudios();


    inicializado =
        true;


    return portfolio;

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializar(
    lista
) {

    if (
        Array.isArray(lista)
    ) {

        portfolio =

            normalizarPortfolio(
                lista
            );

    }


    renderizar(
        portfolio
    );


    inicializado =
        true;


    return portfolio;

}


/* =========================================================
   ATUALIZAÇÃO
   ========================================================= */

function atualizar(
    lista
) {

    if (
        !Array.isArray(lista)
    ) {

        return renderizar(
            portfolio
        );

    }


    portfolio =

        normalizarPortfolio(
            lista
        );


    galeria.indiceAtual =

        normalizarIndice(
            galeria.indiceAtual
        );


    return renderizar(
        portfolio
    );

}


/* =========================================================
   GETTERS
   ========================================================= */

function obterPortfolio() {

    return portfolio.slice();

}


function obterImagens() {

    return obterPorTipo(
        "imagem"
    );

}


function obterVideos() {

    return obterPorTipo(
        "video"
    );

}


function obterAudios() {

    return obterPorTipo(
        "audio"
    );

}


function obterEstadoGaleria() {

    return {

        indiceAtual:
            galeria.indiceAtual,

        total:
            galeria.itens.length,

        arrastando:
            galeria.arrastando,

        animando:
            galeria.animando

    };

}


/* =========================================================
   NAVEGAÇÃO DIRETA
   ========================================================= */

function irParaItem(
    indice
) {

    if (
        !galeria.itens.length
    ) {

        return;

    }


    if (
        galeria.animando
    ) {

        return;

    }


    pausarTodosVideos();


    const novoIndice =

        normalizarIndice(
            indice
        );


    if (
        novoIndice ===
        galeria.indiceAtual
    ) {

        atualizarIndicadoresGaleria();

        atualizarVideoAtivo();

        return;

    }


    galeria.animando =
        true;


    galeria.indiceAtual =
        novoIndice;


    aplicarPosicoesDeck(
        0,
        true
    );


    atualizarIndicadoresGaleria();


    setTimeout(

        function () {

            galeria.animando =
                false;


            aplicarPosicoesDeck(
                0,
                false
            );


            atualizarIndicadoresGaleria();


            atualizarVideoAtivo();

        },

        CONFIG.deck.duracao + 30

    );

}


/* =========================================================
   LIMPEZA
   ========================================================= */

function limpar() {

    desmontarInteracaoDeck();


    portfolio =
        [];


    galeria.itens =
        [];


    galeria.indiceAtual =
        0;


    galeria.deslocamentoX =
        0;


    galeria.arrastando =
        false;


    galeria.gestoHorizontal =
        false;


    galeria.animando =
        false;


    ignorarProximoClique =
        false;


    videosPausadosPorSwipe =
        false;


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

        portfolioGrid.innerHTML =
            "";

    }


    if (videoList) {

        videoList.innerHTML =
            "";

    }


    if (audioList) {

        audioList.innerHTML =
            "";

    }


    inicializado =
        false;

}


/* =========================================================
   API PÚBLICA
   ========================================================= */

const ApresentarPerfilPortfolio = {

    renderizar,

    inicializar,

    atualizar,

    limpar,

    obterPortfolio,

    obterImagens,

    obterVideos,

    obterAudios,

    obterEstadoGaleria,

    irParaItem,

    avancarGaleria,

    voltarGaleria,


    estaInicializado:

        function () {

            return inicializado;

        },


    normalizarItem,

    normalizarPortfolio

};


/* =========================================================
   DISPONIBILIZAÇÃO GLOBAL
   ========================================================= */

window.ApresentarPerfilPortfolio =
    ApresentarPerfilPortfolio;


console.log(
    "ApresentarPerfilPortfolio.js carregado."
);


})(window);