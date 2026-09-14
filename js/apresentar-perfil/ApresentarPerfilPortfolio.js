(function (window) {


"use strict";

/* =========================================================
   MUSICALWORLD / ARTISTASHOW — PORTFÓLIO DO PERFIL PÚBLICO

   Arquivo:
   ApresentarPerfilPortfolio.js

   Responsabilidade:

   - Normalizar os itens de portfólio.
   - Renderizar imagens, vídeos e áudios.
   - Controlar a galeria principal.
   - Controlar o deck empilhado.
   - Controlar swipe/arraste lateral.
   - Controlar navegação pelos botões.
   - Controlar indicadores.
   - Controlar reprodução dos vídeos.
   - Controlar o observer dos vídeos.
   - Calcular as cores predominantes da mídia.
   - Alimentar o fundo dinâmico da página.
   - Expor a API pública do módulo.

   IMPORTANTE:

   Esta versão reorganiza o código por responsabilidade,
   preservando as funções, classes, configurações e
   comportamento da versão anterior.

   Relação com outros módulos:

   - ApresentarPerfil.js
   - PerfilPublico / módulos de dados
   - CSS do perfil público
   - ApresentarPerfilFundo / variáveis CSS do fundo

   Elementos HTML utilizados:

   - #portfolioGrid
   - #videoList
   - #audioList
   ========================================================= */


/* =========================================================
   01. ESTADO PRINCIPAL DO MÓDULO
   ========================================================= */

let portfolio = [];

let inicializado = false;

/*
 * Estado completo da galeria.
 */
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

/*
 * Evita que um clique seja executado imediatamente
 * depois de um swipe.
 */
let ignorarProximoClique = false;

/*
 * Controla se os eventos do deck já foram registrados.
 */
let eventosDeckRegistrados = false;


/* =========================================================
   02. ESTADO DOS VÍDEOS
   ========================================================= */

let observerVideos = null;

/*
 * Durante um swipe horizontal nenhum vídeo deve
 * iniciar ou continuar reproduzindo.
 */
let videosPausadosPorSwipe = false;


/* =========================================================
   03. ESTADO DO FUNDO DINÂMICO
   ========================================================= */

/*
 * O fundo dinâmico pertence à página inteira.
 *
 * O módulo:
 *
 * 1. identifica a mídia ativa;
 * 2. calcula as cores predominantes;
 * 3. envia as cores para as variáveis CSS do BODY;
 * 4. anima a transição entre as paletas;
 * 5. controla a intensidade conforme o portfólio
 *    entra ou sai da viewport.
 */
let fundoDinamico = {

    chaveAtual: "",

    processamento: 0,

    scrollRegistrado: false,

    /*
     * Guarda a paleta atualmente exibida.
     *
     * Isso permite iniciar uma nova transição
     * exatamente de onde a anterior parou.
     */
    coresAtuais: null,

    /*
     * requestAnimationFrame da transição atual.
     */
    animacaoId: null,

    /*
     * Duração da transição entre paletas.
     */
    duracaoTransicao: 800

};


/* =========================================================
   04. CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    elementos: {

        portfolioGrid: "portfolioGrid",

        videoList: "videoList",

        audioList: "audioList"

    },

    /*
     * Configurações do deck visual.
     */
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

    /*
     * Configurações relacionadas aos vídeos.
     */
    video: {

        /*
         * O vídeo precisa estar completamente visível
         * para iniciar automaticamente.
         */
        visibilidadeMinima: 1,

        /*
         * Mantido conforme comportamento atual.
         */
        muted: false,

        /*
         * Mantido para compatibilidade com a configuração
         * existente do módulo.
         */
        autoplay: true

    },

    /*
     * Configurações do fundo dinâmico.
     */
    fundoDinamico: {

        ativado: true,

        /*
         * Canvas pequeno utilizado para análise da mídia.
         */
        larguraCanvas: 40,

        alturaCanvas: 40,

        /*
         * Analisa um pixel a cada X posições.
         */
        passoAmostragem: 2,

        /*
         * Distância mínima entre cores selecionadas.
         */
        distanciaMinimaCores: 55,

        /*
         * Cores utilizadas quando não é possível
         * analisar a mídia.
         */
        corFallback1:
            "rgba(167, 182, 198, 0.30)",

        corFallback2:
            "rgba(200, 210, 222, 0.18)",

        corFallback3:
            "rgba(226, 232, 240, 0.12)"

    }

};


/* =========================================================
   05. UTILITÁRIOS GERAIS
   ========================================================= */

/*
 * Mantido para compatibilidade com a estrutura anterior.
 */
function obterUtils() {

    if (window.PerfilUtils) {

        return window.PerfilUtils;

    }

    return null;

}


/*
 * Busca um elemento pelo ID.
 */
function obterElemento(id) {

    if (!id) {

        return null;

    }

    return document.getElementById(id);

}


/*
 * Escapa valores antes de inseri-los em HTML.
 */
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


/*
 * Atualiza os ícones Lucide criados dinamicamente.
 */
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
   06. FUNDO DINÂMICO — UTILITÁRIOS
   ========================================================= */

/*
 * Retorna o BODY.
 */
function obterBody() {

    return document.body || null;

}


/*
 * Retorna as cores fallback.
 */
function obterCoresFallbackDinamica() {

    return [

        CONFIG.fundoDinamico.corFallback1,

        CONFIG.fundoDinamico.corFallback2,

        CONFIG.fundoDinamico.corFallback3

    ];

}


/*
 * Converte rgb()/rgba() em objeto RGB.
 */
function converterCssParaRgb(cor) {

    if (!cor) {

        return null;

    }

    const texto =
        String(cor).trim();

    const correspondencia =
        texto.match(
            /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
        );

    if (!correspondencia) {

        return null;

    }

    return {

        r:
            Number(
                correspondencia[1]
            ),

        g:
            Number(
                correspondencia[2]
            ),

        b:
            Number(
                correspondencia[3]
            ),

        a:
            correspondencia[4] !== undefined

                ? Number(
                    correspondencia[4]
                )

                : 1

    };

}


/*
 * Interpola duas cores.
 */
function interpolarCor(
    corInicial,
    corFinal,
    progresso
) {

    const inicial =
        converterCssParaRgb(
            corInicial
        );

    const final =
        converterCssParaRgb(
            corFinal
        );

    if (
        !inicial ||
        !final
    ) {

        return corFinal;

    }

    const r =

        inicial.r +
        (
            (final.r - inicial.r) *
            progresso
        );

    const g =

        inicial.g +
        (
            (final.g - inicial.g) *
            progresso
        );

    const b =

        inicial.b +
        (
            (final.b - inicial.b) *
            progresso
        );

    const a =

        inicial.a +
        (
            (final.a - inicial.a) *
            progresso
        );

    return converterRgbParaCss(
        r,
        g,
        b,
        a
    );

}


/*
 * Easing suave da transição de cores.
 */
function aplicarEasingSuave(progresso) {

    return (

        progresso < 0.5

            ? 2 *
                progresso *
                progresso

            : 1 -
                (
                    Math.pow(
                        -2 *
                        progresso +
                        2,
                        2
                    ) /
                    2
                )

    );

}


/*
 * Cancela a animação de cores em andamento.
 */
function cancelarTransicaoCores() {

    if (
        fundoDinamico.animacaoId !== null
    ) {

        cancelAnimationFrame(
            fundoDinamico.animacaoId
        );

        fundoDinamico.animacaoId =
            null;

    }

}


/*
 * Aplica uma paleta imediatamente.
 */
function aplicarCoresFundoImediatamente(cores) {

    const body =
        obterBody();

    if (
        !body ||
        !Array.isArray(cores) ||
        cores.length < 3
    ) {

        return;

    }

    body.style.setProperty(
        "--perfil-fundo-cor-1",
        cores[0]
    );

    body.style.setProperty(
        "--perfil-fundo-cor-2",
        cores[1]
    );

    body.style.setProperty(
        "--perfil-fundo-cor-3",
        cores[2]
    );

    fundoDinamico.coresAtuais = [

        cores[0],

        cores[1],

        cores[2]

    ];

}


/*
 * Anima a transição entre duas paletas.
 */
function animarCoresFundo(novasCores) {

    const body =
        obterBody();

    if (
        !body ||
        !Array.isArray(novasCores) ||
        novasCores.length < 3
    ) {

        return;

    }

    const destino = [

        novasCores[0],

        novasCores[1],

        novasCores[2]

    ];

    /*
     * Primeira paleta: aplicação imediata.
     */
    if (
        !Array.isArray(
            fundoDinamico.coresAtuais
        ) ||
        fundoDinamico.coresAtuais.length < 3
    ) {

        cancelarTransicaoCores();

        aplicarCoresFundoImediatamente(
            destino
        );

        return;

    }

    /*
     * Evita uma animação desnecessária.
     */
    if (

        fundoDinamico.coresAtuais[0] ===
            destino[0] &&

        fundoDinamico.coresAtuais[1] ===
            destino[1] &&

        fundoDinamico.coresAtuais[2] ===
            destino[2]

    ) {

        return;

    }

    cancelarTransicaoCores();

    const origem = [

        fundoDinamico.coresAtuais[0],

        fundoDinamico.coresAtuais[1],

        fundoDinamico.coresAtuais[2]

    ];

    const inicio =
        performance.now();

    const duracao =
        fundoDinamico.duracaoTransicao;


    function animar(agora) {

        const tempoDecorrido =
            agora - inicio;

        let progresso =

            Math.min(

                1,

                tempoDecorrido /
                duracao

            );

        progresso =
            aplicarEasingSuave(
                progresso
            );

        const coresInterpoladas = [

            interpolarCor(
                origem[0],
                destino[0],
                progresso
            ),

            interpolarCor(
                origem[1],
                destino[1],
                progresso
            ),

            interpolarCor(
                origem[2],
                destino[2],
                progresso
            )

        ];

        body.style.setProperty(
            "--perfil-fundo-cor-1",
            coresInterpoladas[0]
        );

        body.style.setProperty(
            "--perfil-fundo-cor-2",
            coresInterpoladas[1]
        );

        body.style.setProperty(
            "--perfil-fundo-cor-3",
            coresInterpoladas[2]
        );

        fundoDinamico.coresAtuais =
            coresInterpoladas;

        if (
            progresso < 1
        ) {

            fundoDinamico.animacaoId =

                requestAnimationFrame(
                    animar
                );

            return;

        }

        /*
         * Garante exatamente a paleta final.
         */
        fundoDinamico.coresAtuais = [

            destino[0],

            destino[1],

            destino[2]

        ];

        body.style.setProperty(
            "--perfil-fundo-cor-1",
            destino[0]
        );

        body.style.setProperty(
            "--perfil-fundo-cor-2",
            destino[1]
        );

        body.style.setProperty(
            "--perfil-fundo-cor-3",
            destino[2]
        );

        fundoDinamico.animacaoId =
            null;

    }


    fundoDinamico.animacaoId =
        requestAnimationFrame(
            animar
        );

}


/*
 * Aplica fallback utilizando a mesma transição suave.
 */
function aplicarCoresFundoFallback() {

    const cores =
        obterCoresFallbackDinamica();

    animarCoresFundo(
        cores
    );

}


/*
 * Aplica uma paleta calculada.
 */
function aplicarCoresFundoDinamico(cores) {

    if (
        !Array.isArray(cores) ||
        cores.length < 3
    ) {

        aplicarCoresFundoFallback();

        return;

    }

    animarCoresFundo(
        cores
    );

}


/* =========================================================
   07. FUNDO DINÂMICO — VISIBILIDADE
   ========================================================= */

/*
 * Calcula a intensidade do fundo conforme a área
 * do portfólio atualmente visível.
 */
function atualizarIntensidadeFundo() {

    const body =
        obterBody();

    const portfolioGrid =
        obterElemento(
            CONFIG.elementos.portfolioGrid
        );

    if (
        !body ||
        !portfolioGrid
    ) {

        return;

    }

    const rect =
        portfolioGrid.getBoundingClientRect();

    const viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight;

    if (
        rect.bottom <= 0 ||
        rect.top >= viewportHeight
    ) {

        body.style.setProperty(
            "--perfil-fundo-opacidade",
            "0"
        );

        body.classList.remove(
            "perfil-fundo-dinamico-visivel"
        );

        return;

    }

    const altura =
        Math.max(
            1,
            rect.height
        );

    const visivel =

        Math.min(
            rect.bottom,
            viewportHeight
        ) -

        Math.max(
            rect.top,
            0
        );

    let percentual =

        visivel /
        Math.min(
            altura,
            viewportHeight
        );

    percentual =

        Math.max(
            0,
            Math.min(
                1,
                percentual
            )
        );

    const intensidade =
        percentual * 0.85;

    body.style.setProperty(
        "--perfil-fundo-opacidade",
        intensidade.toFixed(3)
    );

    body.classList.add(
        "perfil-fundo-dinamico-visivel"
    );

}


/*
 * Registra os eventos de scroll e resize apenas uma vez.
 */
function configurarControleVisibilidadeFundo() {

    if (
        fundoDinamico.scrollRegistrado
    ) {

        atualizarIntensidadeFundo();

        return;

    }

    window.addEventListener(
        "scroll",
        atualizarIntensidadeFundo,
        {
            passive: true
        }
    );

    window.addEventListener(
        "resize",
        atualizarIntensidadeFundo
    );

    fundoDinamico.scrollRegistrado =
        true;

    atualizarIntensidadeFundo();

}


/* =========================================================
   08. FUNDO DINÂMICO — ANÁLISE DE CORES
   ========================================================= */

/*
 * Calcula uma aproximação simples da saturação.
 */
function calcularSaturacao(
    r,
    g,
    b
) {

    const maior =
        Math.max(
            r,
            g,
            b
        );

    const menor =
        Math.min(
            r,
            g,
            b
        );

    if (
        maior === 0
    ) {

        return 0;

    }

    return (
        maior -
        menor
    ) / maior;

}


/*
 * Calcula a distância entre duas cores.
 */
function calcularDistanciaCores(
    corA,
    corB
) {

    const diferencaR =
        corA.r -
        corB.r;

    const diferencaG =
        corA.g -
        corB.g;

    const diferencaB =
        corA.b -
        corB.b;

    return Math.sqrt(

        (
            diferencaR *
            diferencaR
        ) +

        (
            diferencaG *
            diferencaG
        ) +

        (
            diferencaB *
            diferencaB
        )

    );

}


/*
 * Converte RGB para rgba().
 */
function converterRgbParaCss(
    r,
    g,
    b,
    a
) {

    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

}


/*
 * Analisa os pixels de um canvas e retorna
 * três cores predominantes.
 */
function extrairCoresDoCanvas(contexto) {

    if (!contexto) {

        return null;

    }

    try {

        const dados =
            contexto.getImageData(

                0,
                0,

                CONFIG.fundoDinamico.larguraCanvas,
                CONFIG.fundoDinamico.alturaCanvas

            ).data;

        const agrupamentos =
            new Map();

        const passo =

            Math.max(

                1,

                CONFIG.fundoDinamico
                    .passoAmostragem

            );


        for (
            let y = 0;
            y < CONFIG.fundoDinamico.alturaCanvas;
            y += passo
        ) {

            for (
                let x = 0;
                x < CONFIG.fundoDinamico.larguraCanvas;
                x += passo
            ) {

                const posicao =

                    (
                        (
                            y *
                            CONFIG.fundoDinamico.larguraCanvas
                        ) +
                        x
                    ) *
                    4;

                const r =
                    dados[posicao];

                const g =
                    dados[posicao + 1];

                const b =
                    dados[posicao + 2];

                const a =
                    dados[posicao + 3];


                if (
                    a < 180
                ) {

                    continue;

                }

                if (
                    r +
                    g +
                    b >
                    720
                ) {

                    continue;

                }

                if (
                    r +
                    g +
                    b <
                    35
                ) {

                    continue;

                }


                const tamanhoGrupo =
                    24;

                const qr =

                    Math.min(

                        255,

                        Math.round(
                            r /
                            tamanhoGrupo
                        ) *
                        tamanhoGrupo

                    );

                const qg =

                    Math.min(

                        255,

                        Math.round(
                            g /
                            tamanhoGrupo
                        ) *
                        tamanhoGrupo

                    );

                const qb =

                    Math.min(

                        255,

                        Math.round(
                            b /
                            tamanhoGrupo
                        ) *
                        tamanhoGrupo

                    );

                const chave =
                    `${qr},${qg},${qb}`;

                const saturacao =

                    calcularSaturacao(
                        r,
                        g,
                        b
                    );

                const peso =

                    1 +
                    (
                        saturacao *
                        0.75
                    );


                if (
                    agrupamentos.has(
                        chave
                    )
                ) {

                    const grupo =

                        agrupamentos.get(
                            chave
                        );

                    grupo.peso +=
                        peso;

                    grupo.quantidade +=
                        1;

                } else {

                    agrupamentos.set(

                        chave,

                        {

                            r: qr,

                            g: qg,

                            b: qb,

                            peso: peso,

                            quantidade: 1

                        }

                    );

                }

            }

        }


        const grupos =

            Array.from(
                agrupamentos.values()
            );


        if (!grupos.length) {

            return null;

        }


        grupos.sort(

            function (
                a,
                b
            ) {

                return (
                    b.peso -
                    a.peso
                );

            }

        );


        const selecionadas = [];


        for (
            let indice = 0;
            indice < grupos.length;
            indice++
        ) {

            const candidata =
                grupos[indice];

            let muitoParecida =
                false;


            for (
                let j = 0;
                j < selecionadas.length;
                j++
            ) {

                const distancia =

                    calcularDistanciaCores(

                        candidata,

                        selecionadas[j]

                    );


                if (
                    distancia <
                    CONFIG.fundoDinamico
                        .distanciaMinimaCores
                ) {

                    muitoParecida =
                        true;

                    break;

                }

            }


            if (
                muitoParecida
            ) {

                continue;

            }


            selecionadas.push(
                candidata
            );


            if (
                selecionadas.length >= 3
            ) {

                break;

            }

        }


        /*
         * Caso não existam três cores suficientemente
         * diferentes, completa com os grupos restantes.
         */
        if (
            selecionadas.length < 3
        ) {

            for (
                let indice = 0;
                indice < grupos.length;
                indice++
            ) {

                if (
                    selecionadas.indexOf(
                        grupos[indice]
                    ) !== -1
                ) {

                    continue;

                }

                selecionadas.push(
                    grupos[indice]
                );

                if (
                    selecionadas.length >= 3
                ) {

                    break;

                }

            }

        }


        if (
            !selecionadas.length
        ) {

            return null;

        }


        const primeira =
            selecionadas[0];

        const segunda =
            selecionadas[1] ||
            primeira;

        const terceira =
            selecionadas[2] ||
            segunda ||
            primeira;


        return [

            converterRgbParaCss(
                primeira.r,
                primeira.g,
                primeira.b,
                1
            ),

            converterRgbParaCss(
                segunda.r,
                segunda.g,
                segunda.b,
                1
            ),

            converterRgbParaCss(
                terceira.r,
                terceira.g,
                terceira.b,
                1
            )

        ];

    } catch (erro) {

        console.warn(
            "ApresentarPerfilPortfolio: não foi possível analisar os pixels da mídia.",
            erro
        );

        return null;

    }

}


/*
 * Extrai cores de uma imagem sem alterar o <img>
 * utilizado visualmente no card.
 */
function extrairCoresImagem(url) {

    return new Promise(

        function (resolver) {

            if (!url) {

                resolver(null);

                return;

            }

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                CONFIG.fundoDinamico.larguraCanvas;

            canvas.height =
                CONFIG.fundoDinamico.alturaCanvas;

            const contexto =

                canvas.getContext(
                    "2d",
                    {
                        willReadFrequently: true
                    }
                );


            if (!contexto) {

                resolver(null);

                return;

            }


            const imagem =
                new Image();

            imagem.crossOrigin =
                "anonymous";


            imagem.onload =
                function () {

                    try {

                        contexto.clearRect(

                            0,
                            0,
                            canvas.width,
                            canvas.height

                        );

                        contexto.drawImage(

                            imagem,

                            0,
                            0,

                            canvas.width,
                            canvas.height

                        );


                        resolver(
                            extrairCoresDoCanvas(
                                contexto
                            )
                        );

                    } catch (erro) {

                        console.warn(
                            "ApresentarPerfilPortfolio: não foi possível analisar as cores da imagem.",
                            erro
                        );

                        resolver(null);

                    }

                };


            imagem.onerror =
                function () {

                    resolver(null);

                };


            imagem.src =
                url;

        }

    );

}


/*
 * Extrai cores do frame atual de um vídeo.
 */
function extrairCoresVideo(video) {

    return new Promise(

        function (resolver) {

            if (!video) {

                resolver(null);

                return;

            }

            const largura =
                video.videoWidth;

            const altura =
                video.videoHeight;


            if (
                !largura ||
                !altura
            ) {

                const tentarNovamente =
                    function () {

                        extrairCoresVideo(
                            video
                        ).then(
                            resolver
                        );

                    };


                video.addEventListener(
                    "loadeddata",
                    tentarNovamente,
                    {
                        once: true
                    }
                );

                video.addEventListener(
                    "loadedmetadata",
                    tentarNovamente,
                    {
                        once: true
                    }
                );

                return;

            }


            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                CONFIG.fundoDinamico.larguraCanvas;

            canvas.height =
                CONFIG.fundoDinamico.alturaCanvas;


            const contexto =

                canvas.getContext(
                    "2d",
                    {
                        willReadFrequently: true
                    }
                );


            if (!contexto) {

                resolver(null);

                return;

            }


            try {

                contexto.clearRect(

                    0,
                    0,

                    canvas.width,
                    canvas.height

                );


                const proporcaoVideo =
                    largura / altura;

                const proporcaoCanvas =
                    canvas.width / canvas.height;


                let larguraDesenho =
                    canvas.width;

                let alturaDesenho =
                    canvas.height;

                let deslocamentoX = 0;

                let deslocamentoY = 0;


                if (
                    proporcaoVideo >
                    proporcaoCanvas
                ) {

                    alturaDesenho =
                        canvas.height;

                    larguraDesenho =
                        alturaDesenho *
                        proporcaoVideo;

                    deslocamentoX =
                        (
                            canvas.width -
                            larguraDesenho
                        ) / 2;

                } else {

                    larguraDesenho =
                        canvas.width;

                    alturaDesenho =
                        larguraDesenho /
                        proporcaoVideo;

                    deslocamentoY =
                        (
                            canvas.height -
                            alturaDesenho
                        ) / 2;

                }


                contexto.drawImage(

                    video,

                    deslocamentoX,
                    deslocamentoY,

                    larguraDesenho,
                    alturaDesenho

                );


                const cores =
                    extrairCoresDoCanvas(
                        contexto
                    );


                resolver(
                    cores
                );

            } catch (erro) {

                console.warn(
                    "ApresentarPerfilPortfolio: não foi possível analisar o frame do vídeo.",
                    erro
                );

                resolver(null);

            }

        }

    );

}


/*
 * Atualiza o fundo com base no item ativo.
 */
function atualizarFundoDinamico() {

    if (
        !CONFIG.fundoDinamico.ativado
    ) {

        return;

    }

    const body =
        obterBody();

    if (!body) {

        return;

    }


    const item =
        galeria.itens[
            galeria.indiceAtual
        ];


    if (!item) {

        fundoDinamico.chaveAtual =
            "";

        aplicarCoresFundoFallback();

        atualizarIntensidadeFundo();

        return;

    }


    const chave =
        `${item._tipo}|${item._url}`;


    if (
        chave ===
        fundoDinamico.chaveAtual
    ) {

        atualizarIntensidadeFundo();

        return;

    }


    fundoDinamico.chaveAtual =
        chave;


    const processamentoAtual =

        ++fundoDinamico.processamento;


    /*
     * -----------------------------------------------------
     * VÍDEO
     * -----------------------------------------------------
     */
    if (
        item._tipo === "video"
    ) {

        const video =
            obterVideoAtivo();


        if (!video) {

            aplicarCoresFundoFallback();

            atualizarIntensidadeFundo();

            return;

        }


        const iniciarAnaliseVideo =
            function () {

                if (
                    processamentoAtual !==
                    fundoDinamico.processamento
                ) {

                    return;

                }


                extrairCoresVideo(
                    video
                )

                    .then(

                        function (cores) {

                            if (
                                processamentoAtual !==
                                fundoDinamico.processamento
                            ) {

                                return;

                            }


                            if (
                                Array.isArray(cores) &&
                                cores.length >= 3
                            ) {

                                aplicarCoresFundoDinamico(
                                    cores
                                );

                            } else {

                                aplicarCoresFundoFallback();

                            }


                            atualizarIntensidadeFundo();

                        }

                    )

                    .catch(

                        function (erro) {

                            if (
                                processamentoAtual !==
                                fundoDinamico.processamento
                            ) {

                                return;

                            }


                            console.warn(
                                "ApresentarPerfilPortfolio: erro ao calcular fundo dinâmico do vídeo.",
                                erro
                            );

                            aplicarCoresFundoFallback();

                            atualizarIntensidadeFundo();

                        }

                    );

            };


        if (
            video.readyState >= 2
        ) {

            iniciarAnaliseVideo();

        } else {

            video.addEventListener(
                "loadeddata",
                iniciarAnaliseVideo,
                {
                    once: true
                }
            );

        }

        return;

    }


    /*
     * -----------------------------------------------------
     * ÁUDIO / OUTROS
     * -----------------------------------------------------
     */
    if (
        item._tipo !== "imagem"
    ) {

        aplicarCoresFundoFallback();

        atualizarIntensidadeFundo();

        return;

    }


    /*
     * -----------------------------------------------------
     * IMAGEM
     * -----------------------------------------------------
     */
    extrairCoresImagem(
        item._url
    )

        .then(

            function (cores) {

                if (
                    processamentoAtual !==
                    fundoDinamico.processamento
                ) {

                    return;

                }


                if (
                    Array.isArray(cores) &&
                    cores.length >= 3
                ) {

                    aplicarCoresFundoDinamico(
                        cores
                    );

                } else {

                    aplicarCoresFundoFallback();

                }


                atualizarIntensidadeFundo();

            }

        )

        .catch(

            function (erro) {

                if (
                    processamentoAtual !==
                    fundoDinamico.processamento
                ) {

                    return;

                }


                console.warn(
                    "ApresentarPerfilPortfolio: erro ao calcular fundo dinâmico.",
                    erro
                );

                aplicarCoresFundoFallback();

                atualizarIntensidadeFundo();

            }

        );

}


/*
 * Reseta o estado do fundo dinâmico.
 */
function resetarFundoDinamico() {

    const body =
        obterBody();

    cancelarTransicaoCores();

    fundoDinamico.chaveAtual =
        "";

    fundoDinamico.processamento++;

    fundoDinamico.coresAtuais =
        null;


    if (body) {

        const cores =
            obterCoresFallbackDinamica();

        aplicarCoresFundoImediatamente(
            cores
        );

        body.style.setProperty(
            "--perfil-fundo-opacidade",
            "0"
        );

        body.classList.remove(
            "perfil-fundo-dinamico-visivel"
        );

    }

}


/* =========================================================
   09. NORMALIZAÇÃO DOS DADOS
   ========================================================= */

/*
 * Normaliza o tipo de mídia.
 */
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


/*
 * Obtém a URL da mídia.
 */
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


/*
 * Obtém o título.
 */
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


/*
 * Obtém a descrição.
 */
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


/*
 * Normaliza um item individual.
 */
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


/*
 * Normaliza toda a lista.
 */
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


/*
 * Retorna itens de determinado tipo.
 */
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
   10. ESTADO VAZIO E CONTAINERS
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

    renderizarIcones(
        container
    );

}


/*
 * Prepara os containers secundários do portfólio.
 */
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
   11. RENDERIZAÇÃO DA GALERIA
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

        resetarFundoDinamico();


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


    /*
     * Após os cards existirem no DOM,
     * calcula o fundo da mídia ativa.
     */
    atualizarFundoDinamico();

    configurarControleVisibilidadeFundo();

    renderizarIcones(
        container
    );

}


/* =========================================================
   12. NAVEGAÇÃO LATERAL
   ========================================================= */

function criarBotoesNavegacaoGaleria(container) {

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
   13. CARDS DO PORTFÓLIO
   ========================================================= */

/*
 * Configura apenas a transição do card.
 *
 * Dimensões, largura e proporção continuam sob
 * responsabilidade do CSS.
 */
function configurarEstiloCard(card) {

    if (!card) {

        return;

    }

    card.style.transition =

        `transform ${CONFIG.deck.duracao}ms cubic-bezier(.22,.61,.36,1), ` +

        `opacity ${CONFIG.deck.duracao}ms ease, ` +

        `filter ${CONFIG.deck.duracao}ms ease`;

}


/*
 * Cria card de imagem.
 */
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


/*
 * Cria card de vídeo.
 */
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


    /*
     * Permite leitura via canvas quando o Storage
     * fornecer os cabeçalhos CORS necessários.
     */
    video.crossOrigin =
        "anonymous";

    video.src =
        item._url;

    video.controls =
        true;

    video.autoplay =
        false;

    video.muted =
        CONFIG.video.muted;

    video.defaultMuted =
        CONFIG.video.muted;

    video.preload =
        "metadata";

    video.playsInline =
        true;

    video.setAttribute(
        "webkit-playsinline",
        ""
    );

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


/*
 * Adiciona título e descrição.
 */
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
   14. INDICADORES DA GALERIA
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
   15. TRATAMENTO DE ERROS DE MÍDIA
   ========================================================= */

function configurarErrosImagens(container) {

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


function configurarErrosVideos(container) {

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
   16. DECK — ACESSO AOS ELEMENTOS
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


function obterCardPorIndice(indice) {

    const deck =
        obterDeck();


    if (!deck) {

        return null;

    }


    return deck.querySelector(

        `.portfolio-deck-card[data-indice="${indice}"]`

    );

}


function normalizarIndice(indice) {

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
   17. DECK — POSICIONAMENTO
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


            /*
             * CARD ATIVO
             */
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


            /*
             * PRÓXIMO CARD
             */
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


            /*
             * CARD ANTERIOR
             */
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


            /*
             * CARDS DISTANTES
             */
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


            /*
             * A largura e proporção do card não são
             * controladas pelo JS.
             *
             * O JS controla apenas posição,
             * rotação, escala, opacidade e blur.
             */
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
   18. ALTURA DO DECK
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
   19. EVENTOS DO DECK
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
   20. GESTO — INÍCIO
   ========================================================= */

function iniciarArrasteDeck(evento) {

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
   21. GESTO — MOVIMENTO
   ========================================================= */

function moverArrasteDeck(evento) {

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


        /*
         * Se o gesto for vertical, devolvemos o controle
         * para o scroll normal da página.
         */
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
   22. GESTO — FINALIZAÇÃO
   ========================================================= */

function finalizarArrasteDeck(evento) {

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


    /*
     * Gesto que não se tornou horizontal.
     */
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
   23. GESTO — CANCELAMENTO
   ========================================================= */

function cancelarArrasteDeck(evento) {

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


/*
 * Libera a captura do ponteiro.
 */
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
   24. NAVEGAÇÃO DO DECK
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


    atualizarFundoDinamico();


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


    atualizarFundoDinamico();


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


/*
 * Evita o clique que pode acontecer logo após um swipe.
 */
function controlarCliqueDepoisSwipe(evento) {

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
   25. CONTROLE DOS VÍDEOS
   ========================================================= */

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
 * Pausa todos os vídeos existentes no deck.
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
 * Retorna o vídeo do card ativo.
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
 * Verifica se o elemento está completamente dentro
 * da viewport.
 */
function estaCompletamenteVisivel(elemento) {

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
 * Tenta reproduzir o vídeo.
 *
 * O comportamento de áudio permanece igual ao atual:
 * não força mute.
 */
function reproduzirVideoSePermitido(video) {

    if (!video) {

        return;

    }


    video.muted = false;

    video.defaultMuted = false;


    const tentativa =
        video.play();


    if (
        tentativa &&
        typeof tentativa.catch ===
        "function"
    ) {

        tentativa.catch(

            function (erro) {

                if (
                    erro &&
                    erro.name ===
                    "NotAllowedError"
                ) {

                    console.info(
                        "ApresentarPerfilPortfolio: autoplay aguardando interação do usuário."
                    );

                    return;

                }


                console.warn(
                    "ApresentarPerfilPortfolio: não foi possível reproduzir o vídeo.",
                    erro
                );

            }

        );

    }

}


/*
 * Atualiza o estado de reprodução de todos os vídeos.
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
             * Vídeo que não é o card ativo.
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
             * Durante swipe ou animação,
             * o vídeo permanece pausado.
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
             * Só reproduz quando o card estiver
             * completamente visível.
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
   26. INTERSECTION OBSERVER DOS VÍDEOS
   ========================================================= */

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


    try {

        observerVideos =

            new IntersectionObserver(

                function (entradas) {

                    entradas.forEach(

                        function (entrada) {

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
                             * Card que não está ativo.
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
                             * Swipe/animação.
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
                             * Card completamente visível.
                             */
                            if (
                                entrada.isIntersecting &&
                                entrada.intersectionRatio >=
                                CONFIG.video.visibilidadeMinima
                            ) {

                                /*
                                 * Aproveita a entrada completa
                                 * do card para atualizar o fundo.
                                 */
                                atualizarFundoDinamico();


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
   27. RESIZE
   ========================================================= */

function ajustarDeckNoResize() {

    aplicarPosicoesDeck(

        galeria.arrastando
            ? galeria.deslocamentoX
            : 0,

        false

    );


    ajustarAlturaDeck();

    atualizarVideoAtivo();

    atualizarIntensidadeFundo();

}


/* =========================================================
   28. DESMONTAGEM DO DECK
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


function resetarEstiloContainerDeck(deck) {

    if (!deck) {

        return;

    }


    deck.style.cursor =
        "grab";

}


/* =========================================================
   29. ÁUDIOS
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
   30. CICLO DE RENDERIZAÇÃO
   ========================================================= */

function renderizar(lista) {

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
   31. INICIALIZAÇÃO
   ========================================================= */

function inicializar(lista) {

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
   32. ATUALIZAÇÃO
   ========================================================= */

function atualizar(lista) {

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
   33. GETTERS
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
   34. NAVEGAÇÃO DIRETA
   ========================================================= */

function irParaItem(indice) {

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


    /*
     * Se já estamos no item solicitado,
     * apenas sincroniza o estado visual.
     */
    if (
        novoIndice ===
        galeria.indiceAtual
    ) {

        atualizarIndicadoresGaleria();

        atualizarVideoAtivo();

        atualizarFundoDinamico();

        return;

    }


    galeria.animando =
        true;

    galeria.indiceAtual =
        novoIndice;


    atualizarFundoDinamico();


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
   35. LIMPEZA COMPLETA
   ========================================================= */

function limpar() {

    desmontarInteracaoDeck();

    resetarFundoDinamico();


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
   36. API PÚBLICA
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
   37. DISPONIBILIZAÇÃO GLOBAL
   ========================================================= */

window.ApresentarPerfilPortfolio =
    ApresentarPerfilPortfolio;


console.log(
    "ApresentarPerfilPortfolio.js carregado."
);


})(window);
