(function (window) {

"use strict";

/* =========================================================
MUSICALWORLD / ARTISTASHOW — PORTFÓLIO DO PERFIL PÚBLICO

Arquivo:
ApresentarPerfilPortfolio.js

Responsabilidade:

Normalizar os itens de portfólio recebidos do banco.
Renderizar imagens, vídeos e áudios.
Controlar a galeria principal do perfil público.
Criar o efeito de deck empilhado.
Manter o formato visual vertical 9:16.
Controlar swipe/arraste lateral.
Permitir navegação pelos botões laterais.
Manter o deck circular.
Criar e atualizar os indicadores de paginação.
Permitir navegação pelas bolinhas.
Controlar reprodução automática dos vídeos.
Pausar vídeos durante swipe.
Pausar vídeos quando saem completamente da viewport.
Reproduzir novamente quando o vídeo volta a ficar
completamente visível.
Calcular cores predominantes das imagens e vídeos
do portfólio.
Alimentar o fundo dinâmico de toda a página.
Realizar transições suaves entre as paletas de cores.
Controlar a intensidade do fundo conforme o portfólio
entra ou sai da viewport.
Manter compatibilidade com os demais módulos
da página pública.

Relação com outros módulos:

ApresentarPerfil.js
chama este módulo para renderizar o portfólio.

PerfilPublico / módulos de dados
fornecem os dados do portfólio.

apresentar-perfil-portfolio.css
controla a apresentação visual do portfólio.

apresentar-perfil-fundo.css
controla visualmente o fundo dinâmico da página
utilizando as variáveis fornecidas por este módulo.

O HTML fornece:
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
========================================================= */

let observerVideos = null;

/*

* Indica se o usuário está realizando um swipe horizontal.
* Enquanto estiver true, nenhum vídeo deve reproduzir.
  */

let videosPausadosPorSwipe = false;

/* =========================================================
FUNDO DINÂMICO DA PÁGINA

Este estado controla as cores utilizadas pelo fundo
dinâmico de toda a página pública.

O JavaScript:

1. analisa a imagem ou frame do vídeo ativo;
2. identifica as cores predominantes;
3. envia as cores para o BODY;
4. realiza a transição suave entre a paleta anterior
   e a nova paleta;
5. calcula a intensidade de visibilidade;
6. informa essa intensidade ao CSS.

O arquivo:

apresentar-perfil-fundo.css

é responsável por desenhar o efeito visual.

O #portfolioGrid NÃO recebe mais o fundo dinâmico.
========================================================= */

let fundoDinamico = {


chaveAtual: "",

processamento: 0,

scrollRegistrado: false,

/*
 * Guarda as três cores que estão atualmente
 * sendo exibidas no BODY.
 *
 * Isso permite que uma nova transição comece
 * exatamente de onde a animação anterior parou.
 */

coresAtuais: null,

/*
 * Identificador da animação requestAnimationFrame.
 *
 * Quando uma nova mídia é selecionada antes da
 * transição anterior terminar, cancelamos a animação
 * anterior e iniciamos uma nova a partir das cores
 * atuais.
 */

animacaoId: null,

/*
 * Duração da transição das cores.
 */

duracaoTransicao: 800


};

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
     */

    visibilidadeMinima: 1,

    /*
     * O vídeo começa sem áudio para que o navegador
     * permita o autoplay.
     */

    muted: false,

    /*
     * Reproduz automaticamente quando ficar totalmente
     * visível.
     */

    autoplay: true

},

/* =====================================================
   CONFIGURAÇÃO DO FUNDO DINÂMICO
   ===================================================== */

fundoDinamico: {

    ativado: true,

    /*
     * Tamanho reduzido do canvas utilizado para
     * análise das imagens e dos frames de vídeo.
     */

    larguraCanvas: 40,

    alturaCanvas: 40,

    /*
     * Analisa um pixel a cada X posições.
     */

    passoAmostragem: 2,

    /*
     * Distância mínima entre as cores escolhidas.
     *
     * Isso evita que as três cores sejam praticamente
     * iguais.
     */

    distanciaMinimaCores: 55,

    /*
     * Cores utilizadas quando não é possível analisar
     * a mídia.
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
FUNDO DINÂMICO DA PÁGINA
========================================================= */

/*

* Retorna o BODY da página.
*
* O fundo dinâmico pertence à página inteira,
* e não mais ao container do portfólio.
  */

function obterBody() {


return document.body || null;


}

/*

* Retorna as cores fallback configuradas.
  */

function obterCoresFallbackDinamica() {


return [

    CONFIG.fundoDinamico.corFallback1,

    CONFIG.fundoDinamico.corFallback2,

    CONFIG.fundoDinamico.corFallback3

];


}

/*

* Converte uma cor CSS rgba/rgb em objeto RGB.
*
* Esta função existe para que possamos interpolar
* matematicamente as cores durante a transição.
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

* Interpola duas cores RGB.
*
* progresso:
* 0 = cor inicial
* 1 = cor final
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

* Função de easing utilizada na transição.
*
* Começa suavemente, acelera no meio e desacelera
* novamente antes de chegar à cor final.
  */

function aplicarEasingSuave(
progresso
) {


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

* Interrompe uma animação de cores que ainda esteja
* em andamento.
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

* Aplica uma paleta de cores imediatamente ao BODY.
*
* Esta função é utilizada somente quando ainda não
* existe uma paleta anterior válida ou quando precisamos
* fazer uma alteração instantânea.
  */

function aplicarCoresFundoImediatamente(
cores
) {


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

* Faz a transição suave entre a paleta atual e a nova.
*
* IMPORTANTE:
*
* A animação ocorre nas próprias variáveis CSS.
* O CSS continua responsável pelo gradiente.
*
* Dessa maneira não alteramos o restante da estrutura
* visual da página.
  */

function animarCoresFundo(
novasCores
) {


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
 * Se não temos uma paleta anterior válida,
 * aplicamos a primeira diretamente.
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
 * Se a paleta atual já é igual à nova,
 * não precisamos criar uma nova animação.
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

function animar(
    agora
) {

    const tempoDecorrido =
        agora -
        inicio;

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

    /*
     * Guarda exatamente a cor que está sendo
     * exibida neste momento.
     *
     * Isso permite interromper a animação sem
     * causar um salto visual.
     */

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
     * Garante que o estado final seja exatamente
     * a paleta solicitada.
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

* Aplica as cores fallback ao BODY.
*
* Agora também passa pela transição suave.
  */

function aplicarCoresFundoFallback() {


const cores =
    obterCoresFallbackDinamica();

animarCoresFundo(
    cores
);


}

/*

* Aplica as três cores calculadas ao BODY.
*
* O JavaScript fornece os valores.
* O CSS continua responsável pelo gradiente.
  */

function aplicarCoresFundoDinamico(
cores
) {


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

/*

* Calcula a intensidade do fundo com base na
* quantidade do portfólio atualmente visível.
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

* Registra os eventos responsáveis por acompanhar
* a posição do portfólio na tela.
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

/*

* Calcula uma aproximação simples da saturação da cor.
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

* Calcula a distância entre duas cores RGB.
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

* Converte valores RGB para uma cor CSS rgba().
  */

function converterRgbParaCss(
r,
g,
b,
a
) {


return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;


}

/* =========================================================
EXTRAÇÃO DAS CORES
========================================================= */

/*

* Função central responsável por transformar os pixels
* de um canvas em três cores predominantes.
*
* Esta função é compartilhada por:
*
* * imagens;
* * frames de vídeos.
*
* A lógica de seleção das cores foi preservada.
  */

function extrairCoresDoCanvas(
contexto
) {


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

* Extrai as cores predominantes de uma imagem.
*
* A imagem é carregada em um objeto Image separado.
* Não alteramos o <img> que aparece no card.
  */

function extrairCoresImagem(
url
) {


return new Promise(

    function (
        resolver
    ) {

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

/* =========================================================
CORES DO VÍDEO
========================================================= */

/*

* Extrai as cores predominantes do frame atual do vídeo.
*
* Esta função NÃO modifica o vídeo.
*
* Ela apenas desenha um frame do <video> em um canvas
* pequeno e utiliza a mesma análise de cores das imagens.
*
* O vídeo precisa estar carregado e ter dimensões válidas.
*
* Caso o navegador bloqueie a leitura dos pixels por CORS,
* o fallback continua sendo utilizado.
  */

function extrairCoresVideo(
video
) {


return new Promise(

    function (
        resolver
    ) {

        if (
            !video
        ) {

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

            /*
             * O vídeo ainda não possui metadata suficiente.
             *
             * Esperamos o carregamento e tentamos novamente.
             */

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

            /*
             * Mantemos a proporção do vídeo para que
             * a análise represente corretamente a mídia.
             */

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

                /*
                 * Vídeo mais largo que o canvas.
                 */

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

                /*
                 * Vídeo mais alto que o canvas.
                 */

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

            /*
             * Se o navegador bloquear getImageData()
             * por CORS, utilizamos o fallback.
             *
             * Isso não interfere na reprodução do vídeo.
             */

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

* Atualiza o fundo de acordo com o card atualmente ativo.
*
* Imagens:
* utiliza extrairCoresImagem().
*
* Vídeos:
* utiliza o próprio elemento <video>;
* captura o frame atual;
* extrai as cores desse frame.
*
* A aplicação das cores é feita com transição suave.
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
 * =====================================================
 * VÍDEO
 * =====================================================
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

            /*
             * O processamento pode ter mudado enquanto
             * o vídeo carregava.
             */

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


    /*
     * Se o vídeo já possui dados suficientes,
     * fazemos a análise imediatamente.
     */

    if (
        video.readyState >= 2
    ) {

        iniciarAnaliseVideo();

    } else {

        /*
         * Caso ainda esteja carregando, esperamos
         * os dados do vídeo ficarem disponíveis.
         */

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
 * =====================================================
 * ÁUDIO / OUTROS
 * =====================================================
 */

if (
    item._tipo !== "imagem"
) {

    aplicarCoresFundoFallback();

    atualizarIntensidadeFundo();

    return;

}


/*
 * =====================================================
 * IMAGEM
 * =====================================================
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

* Reseta completamente o estado do fundo dinâmico.
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
NORMALIZAÇÃO
========================================================= */

function normalizarTipoMidia(
item
) {


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

function obterUrlMidia(
item
) {


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

function obterTitulo(
item
) {


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

function obterDescricao(
item
) {


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

function normalizarPortfolio(
lista
) {


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

function obterPorTipo(
tipo
) {


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
 * Depois que os cards existem no DOM,
 * calculamos a cor da mídia atualmente ativa.
 */

atualizarFundoDinamico();

configurarControleVisibilidadeFundo();

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

/*
 * Permite que o navegador faça a requisição do vídeo
 * preparada para leitura via canvas quando o servidor
 * fornecer os cabeçalhos CORS necessários.
 *
 * Isso não resolve CORS sozinho, mas é necessário
 * para que o canvas possa ler os pixels quando o
 * Storage permitir esse acesso.
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


if (
    !video.paused
) {

    return;

}

try {

    const promessa =
        video.play();

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

                        if (
                            entrada.isIntersecting &&
                            entrada.intersectionRatio >=
                            CONFIG.video.visibilidadeMinima
                        ) {

                            /*
                             * O vídeo já está no DOM e agora
                             * está completamente visível.
                             *
                             * Aproveitamos este momento para
                             * atualizar as cores do fundo.
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

atualizarVideoAtivo();

atualizarIntensidadeFundo();


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

    atualizarFundoDinamico();

    return;

}

galeria.animando =
    true;

galeria.indiceAtual =
    novoIndice;

/*
 * Atualiza as cores do fundo quando o usuário
 * navega diretamente pelas bolinhas.
 *
 * A troca agora ocorre através da transição suave.
 */

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
LIMPEZA
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
