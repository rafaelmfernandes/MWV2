/* =========================================================
MUSICALWORLD — PÁGINA INICIAL
FEED DE PROFISSIONAIS
========================================================= */

/* =========================================================
CONFIGURAÇÃO DO FEED
========================================================= */

const FEED_CONFIG = {


limitePorPagina: 12,

paginaAtual: 0,

carregando: false,

acabou: false,

totalCarregado: 0,

observer: null,

filtrosAtuais: {

    estado: '',

    cidade: '',

    categoria: '',

    instrumento: '',

    estilo: '',

    valorMin: null,

    valorMax: null

}


};

/* =========================================================
NORMALIZAÇÃO DE TEXTO
========================================================= */

function normalizarTexto(valor) {


return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();


}

/* =========================================================
NORMALIZAR LISTAS
========================================================= */

function normalizarLista(valor) {


if (Array.isArray(valor)) {

    return valor
        .map(item => String(item || '').trim())
        .filter(Boolean);

}

if (typeof valor === 'string') {

    return valor
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

}

return [];


}

/* =========================================================
OBTER ARTISTA
========================================================= */

function obterArtistaPerfil(perfil) {


if (!perfil || !perfil.perfis_artistas) {
    return null;
}

if (Array.isArray(perfil.perfis_artistas)) {

    return perfil.perfis_artistas[0] || null;

}

return perfil.perfis_artistas;


}

/* =========================================================
OBTER DESTAQUE DO PORTFÓLIO
========================================================= */

function obterDestaquePortfolio(perfil) {


if (!perfil || !perfil.portfolio_musicos) {
    return null;
}

const portfolio =
    Array.isArray(perfil.portfolio_musicos)
        ? perfil.portfolio_musicos
        : [perfil.portfolio_musicos];


return portfolio.find(item => {

    if (!item) {
        return false;
    }

    if (item.ativo !== true) {
        return false;
    }

    if (item.destaque_catalogo !== true) {
        return false;
    }


    const tipo =
        normalizarTexto(item.tipo);


    return (
        tipo === 'imagem' ||
        tipo === 'video'
    );

}) || null;


}

/* =========================================================
GERAR INICIAIS
========================================================= */

function gerarIniciais(nome) {


const partes =
    String(nome || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);


if (partes.length === 0) {
    return 'U';
}


if (partes.length === 1) {

    return partes[0]
        .substring(0, 2)
        .toUpperCase();

}


return (
    partes[0].charAt(0) +
    partes[partes.length - 1].charAt(0)
).toUpperCase();


}

/* =========================================================
ESCAPAR HTML
========================================================= */

function escaparHtml(valor) {


return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');


}

/* =========================================================
NOME DO TIPO DE PERFIL
========================================================= */

function obterNomeTipo(tipo) {


const valor =
    String(tipo || '').trim();


if (!valor) {
    return 'Profissional';
}


return valor;


}

/* =========================================================
PÁGINA PÚBLICA DO PROFISSIONAL
========================================================= */

function obterPaginaPerfil(tipo) {


const tipoNormalizado =
    normalizarTexto(tipo);


if (
    tipoNormalizado === 'musico' ||
    tipoNormalizado === 'musica'
) {

    return 'apresentar-perfil-musico.html';

}


if (
    tipoNormalizado === 'cantor' ||
    tipoNormalizado === 'cantora'
) {

    return 'apresentar-perfil-cantor.html';

}


return 'apresentar-perfil-profissional.html';


}

/* =========================================================
AVISO DISCRETO DO FEED
========================================================= */

function iniciarAvisoFeed() {


const aviso =
    document.getElementById('feedAviso');


const botaoFechar =
    document.getElementById('btnFecharFeedAviso');


if (!aviso || !botaoFechar) {

    console.warn(
        '⚠️ Elementos do aviso do feed não encontrados.'
    );

    return;

}


const chaveAviso =
    'musicalworld_feed_aviso_fechado';


let avisoFechado = false;


try {

    avisoFechado =
        localStorage.getItem(chaveAviso) === 'true';

} catch (erro) {

    console.warn(
        '⚠️ Não foi possível acessar o localStorage.',
        erro
    );

}


if (avisoFechado) {

    aviso.style.display = 'none';

    return;

}


botaoFechar.addEventListener(
    'click',
    function (event) {

        event.preventDefault();

        event.stopPropagation();


        aviso.classList.add('ocultando');


        try {

            localStorage.setItem(
                chaveAviso,
                'true'
            );

        } catch (erro) {

            console.warn(
                '⚠️ Não foi possível salvar o fechamento do aviso.',
                erro
            );

        }


        setTimeout(
            function () {

                aviso.style.display = 'none';

            },
            200
        );

    }
);


}

/* =========================================================
NORMALIZAR FILTROS
========================================================= */

function normalizarFiltros(filtros) {


const origem =
    filtros || {};


let valorMin =
    origem.valorMin !== undefined &&
    origem.valorMin !== null &&
    origem.valorMin !== ''
        ? Number(origem.valorMin)
        : null;


let valorMax =
    origem.valorMax !== undefined &&
    origem.valorMax !== null &&
    origem.valorMax !== ''
        ? Number(origem.valorMax)
        : null;


if (
    valorMin !== null &&
    !Number.isFinite(valorMin)
) {

    valorMin = null;

}


if (
    valorMax !== null &&
    !Number.isFinite(valorMax)
) {

    valorMax = null;

}


if (
    valorMin !== null &&
    valorMin < 0
) {

    valorMin = 0;

}


if (
    valorMax !== null &&
    valorMax < 0
) {

    valorMax = 0;

}


if (
    valorMin !== null &&
    valorMax !== null &&
    valorMin > valorMax
) {

    const temporario =
        valorMin;

    valorMin =
        valorMax;

    valorMax =
        temporario;

}


return {

    estado:
        String(origem.estado || '').trim(),

    cidade:
        String(origem.cidade || '').trim(),

    categoria:
        String(origem.categoria || '').trim(),

    instrumento:
        String(origem.instrumento || '').trim(),

    estilo:
        String(origem.estilo || '').trim(),

    valorMin,

    valorMax

};


}

/* =========================================================
VERIFICAR SE EXISTEM FILTROS
========================================================= */

function existemFiltrosAtivos() {


const filtros =
    FEED_CONFIG.filtrosAtuais;


return Boolean(

    filtros.estado ||

    filtros.cidade ||

    filtros.categoria ||

    filtros.instrumento ||

    filtros.estilo ||

    filtros.valorMin !== null ||

    filtros.valorMax !== null

);


}

/* =========================================================
CARREGAR PRIMEIRA PÁGINA
========================================================= */

async function carregarProfissionaisInicio(
filtros = null
) {


console.log(
    '🎵 Iniciando feed de profissionais...'
);


if (filtros !== null) {

    FEED_CONFIG.filtrosAtuais =
        normalizarFiltros(filtros);

}


FEED_CONFIG.paginaAtual = 0;

FEED_CONFIG.carregando = false;

FEED_CONFIG.acabou = false;

FEED_CONFIG.totalCarregado = 0;


const container =
    document.getElementById(
        'feed-profissionais'
    );


const vazio =
    document.getElementById(
        'feed-vazio'
    );


const fim =
    document.getElementById(
        'feed-fim'
    );


const carregandoMais =
    document.getElementById(
        'feed-carregando-mais'
    );


const contador =
    document.getElementById(
        'contador-profissionais'
    );


if (!container) {

    console.warn(
        '⚠️ Container do feed não encontrado.'
    );

    return;

}


container.innerHTML = `

    <div class="carregando-profissionais">

        <div class="feed-spinner"></div>

        <span>
            Carregando profissionais...
        </span>

    </div>

`;


if (vazio) {
    vazio.style.display = 'none';
}


if (fim) {
    fim.style.display = 'none';
}


if (carregandoMais) {
    carregandoMais.style.display = 'none';
}


if (contador) {
    contador.textContent = '';
}


configurarInfiniteScroll();


await carregarProximaPagina();


}

/* =========================================================
CARREGAR PRÓXIMA PÁGINA
========================================================= */

async function carregarProximaPagina() {


if (FEED_CONFIG.carregando) {
    return;
}


if (FEED_CONFIG.acabou) {
    return;
}


if (!window.supabaseClient) {

    console.error(
        '❌ SupabaseClient não encontrado.'
    );


    mostrarErroFeed(
        'Não foi possível conectar ao banco de dados.'
    );


    return;

}


FEED_CONFIG.carregando = true;


const primeiraPagina =
    FEED_CONFIG.paginaAtual === 0;


mostrarCarregamentoMais(
    !primeiraPagina
);


try {

    const offset =
        FEED_CONFIG.paginaAtual *
        FEED_CONFIG.limitePorPagina;


    const filtros =
        FEED_CONFIG.filtrosAtuais;


    console.log(
        '🔎 Buscando profissionais com filtros:',
        filtros
    );


    const { data, error } =
        await window.supabaseClient
            .rpc(
                'buscar_profissionais_filtrados',
                {

                    p_estado:
                        filtros.estado,

                    p_cidade:
                        filtros.cidade,

                    p_categoria:
                        filtros.categoria,

                    p_instrumento:
                        filtros.instrumento,

                    p_estilo:
                        filtros.estilo,

                    p_limite:
                        FEED_CONFIG.limitePorPagina,

                    p_offset:
                        offset

                }
            );


    if (error) {

        console.error(
            '❌ Erro ao carregar profissionais pela RPC:',
            error
        );


        mostrarErroFeed(
            'Não foi possível carregar os profissionais.'
        );


        return;

    }


    const profissionais =
        Array.isArray(data)
            ? data.filter(
                perfil => {

                    const artista =
                        obterArtistaPerfil(
                            perfil
                        );


                    return !!artista;

                }
            )
            : [];


    console.log(
        `📦 ${profissionais.length} profissional(is) recebido(s).`
    );


    if (
        !data ||
        data.length <
        FEED_CONFIG.limitePorPagina
    ) {

        FEED_CONFIG.acabou = true;

    }


    if (profissionais.length === 0) {

        if (
            FEED_CONFIG.paginaAtual === 0
        ) {

            mostrarFeedVazio();

        } else {

            mostrarFimFeed();

        }


        return;

    }


    const container =
        document.getElementById(
            'feed-profissionais'
        );


    if (
        primeiraPagina &&
        container
    ) {

        container.innerHTML = '';

    }


    profissionais.forEach(
        perfil => {

            const artista =
                obterArtistaPerfil(
                    perfil
                );


            if (!artista) {
                return;
            }


            const destaque =
                obterDestaquePortfolio(
                    perfil
                );


            const card =
                criarCardProfissional(
                    perfil,
                    artista,
                    destaque
                );


            if (container) {

                container.appendChild(
                    card
                );

            }

        }
    );


    FEED_CONFIG.totalCarregado +=
        profissionais.length;


    FEED_CONFIG.paginaAtual++;


    atualizarContador();


    if (FEED_CONFIG.acabou) {

        mostrarFimFeed();

    }


} catch (erro) {

    console.error(
        '❌ Erro inesperado no feed:',
        erro
    );


    mostrarErroFeed(
        'Ocorreu um erro ao carregar os profissionais.'
    );


} finally {

    FEED_CONFIG.carregando = false;

    mostrarCarregamentoMais(false);

}


}

/* =========================================================
CRIAR CARD
========================================================= */

function criarCardProfissional(
perfil,
artista,
destaque
) {


const tipoArtista =
    String(
        artista.tipo_artista || ''
    ).trim();


const paginaPerfil =
    obterPaginaPerfil(
        tipoArtista
    );


const link =
    document.createElement('a');


link.href =
    `${paginaPerfil}?id=${encodeURIComponent(perfil.id)}`;


link.className =
    'profissional-card-link';


const card =
    document.createElement('div');


card.className =
    'ad-card-novo';


const nome =
    String(
        perfil.nome_exibicao || ''
    ).trim() ||
    'Profissional';


const descricao =
    String(
        perfil.descricao || ''
    ).trim() ||
    'Perfil profissional do MusicalWorld.';


const localizacao =
    String(
        artista.localizacao || ''
    ).trim() ||
    'Localização não informada';


const tipo =
    obterNomeTipo(
        tipoArtista
    );


const estilosLista =
    normalizarLista(
        artista.estilos
    );


const estilosTexto =
    estilosLista.length > 0
        ? estilosLista.join(' / ')
        : 'Estilos musicais não informados';


const fotoUrl =
    String(
        artista.foto_url || ''
    ).trim();


const iniciais =
    gerarIniciais(nome);


/* =====================================================
   AVATAR
====================================================== */

const avatarHtml =
    fotoUrl

        ? `
            <img
                src="${escaparHtml(fotoUrl)}"
                alt="${escaparHtml(nome)}"
                class="ad-avatar-img"
            >

            <div
                class="ad-avatar-user"
                style="display:none;"
            >
                ${escaparHtml(iniciais)}
            </div>
          `

        : `
            <div class="ad-avatar-user">
                ${escaparHtml(iniciais)}
            </div>
          `;


/* =====================================================
   DADOS DO DESTAQUE
====================================================== */

const tipoDestaque =
    normalizarTexto(
        destaque?.tipo
    );


const urlDestaque =
    String(
        destaque?.arquivo_url || ''
    ).trim();


const thumbnailDestaque =
    String(
        destaque?.thumbnail_url || ''
    ).trim();


/* =====================================================
   MÍDIA PRINCIPAL
====================================================== */

let mediaHtml = '';


/*
 * DESTAQUE — IMAGEM
 */

if (
    destaque &&
    urlDestaque &&
    tipoDestaque === 'imagem'
) {

    mediaHtml = `

        <img
            src="${escaparHtml(urlDestaque)}"
            alt="${escaparHtml(
                destaque.titulo ||
                `Destaque de ${nome}`
            )}"
            class="ad-media-img ad-media-destaque"
            loading="lazy"
        >

    `;

}


/*
 * DESTAQUE — VÍDEO
 */

else if (
    destaque &&
    urlDestaque &&
    tipoDestaque === 'video'
) {

    const posterHtml =
        thumbnailDestaque
            ? `poster="${escaparHtml(thumbnailDestaque)}"`
            : '';


    mediaHtml = `

        <div class="ad-video-container">

            <video
                src="${escaparHtml(urlDestaque)}"
                ${posterHtml}
                class="ad-media-img ad-media-destaque ad-media-video"
                muted
                autoplay
                loop
                playsinline
                preload="metadata"
            ></video>


            <button
                type="button"
                class="btn-video-tela-cheia"
                aria-label="Abrir vídeo em tela cheia"
                title="Tela cheia"
            >

                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >

                    <path
                        d="M8 3H5a2 2 0 0 0-2 2v3"
                    ></path>

                    <path
                        d="M16 3h3a2 2 0 0 1 2 2v3"
                    ></path>

                    <path
                        d="M21 16v3a2 2 0 0 1-2 2h-3"
                    ></path>

                    <path
                        d="M3 16v3a2 2 0 0 0 2 2h3"
                    ></path>

                </svg>

            </button>

        </div>

    `;

}


/*
 * SEM DESTAQUE:
 * FOTO DO PERFIL
 */

else if (fotoUrl) {

    mediaHtml = `

        <img
            src="${escaparHtml(fotoUrl)}"
            alt="Foto de ${escaparHtml(nome)}"
            class="ad-media-img"
            loading="lazy"
        >

    `;

}


/*
 * SEM FOTO
 */

else {

    mediaHtml = `

        <div class="ad-media-sem-foto">

            <span>
                ${escaparHtml(iniciais)}
            </span>

        </div>

    `;

}


/* =====================================================
   CARD
====================================================== */

card.innerHTML = `

    <div class="ad-header">

        ${avatarHtml}

        <div class="ad-user-info">

            <h4>
                ${escaparHtml(nome)}
            </h4>

            <div class="ad-meta-row">

                <span class="ad-estilo">
                    ${escaparHtml(estilosTexto)}
                </span>

            </div>

        </div>

    </div>


    <div class="ad-media-box">

        ${mediaHtml}

    </div>


    <div class="ad-descricao">

        <strong>
            ${escaparHtml(tipo)}
        </strong>

        <p>
            ${escaparHtml(descricao)}
        </p>

    </div>


    <div class="ad-footer">

        <span class="ad-localizacao">

            <svg
                class="icone-localizacao"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"></path>

                <circle
                    cx="12"
                    cy="9"
                    r="2.5"
                ></circle>

            </svg>

            ${escaparHtml(localizacao)}

        </span>


        <button
            class="btn-detalhes"
            type="button"
        >
            Ver perfil
        </button>

    </div>

`;


/* =====================================================
   BOTÃO VER PERFIL
====================================================== */

const botaoDetalhes =
    card.querySelector(
        '.btn-detalhes'
    );


if (botaoDetalhes) {

    botaoDetalhes.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            window.location.href =
                `${paginaPerfil}?id=${encodeURIComponent(perfil.id)}`;

        }
    );

}


/* =====================================================
   TRATAMENTO DE ERRO DO AVATAR
====================================================== */

const imagemAvatar =
    card.querySelector(
        '.ad-avatar-img'
    );


if (imagemAvatar) {

    imagemAvatar.addEventListener(
        'error',
        function () {

            this.style.display =
                'none';


            const fallback =
                this.nextElementSibling;


            if (fallback) {

                fallback.style.display =
                    'flex';

            }

        }
    );

}


/* =====================================================
   TRATAMENTO DE ERRO DA IMAGEM PRINCIPAL
====================================================== */

const imagemMedia =
    card.querySelector(
        '.ad-media-img:not(video)'
    );


if (imagemMedia) {

    imagemMedia.addEventListener(
        'error',
        function () {

            this.style.display =
                'none';


            const mediaBox =
                this.parentElement;


            if (!mediaBox) {
                return;
            }


            mediaBox.classList.add(
                'photo-bg'
            );


            if (
                !mediaBox.querySelector(
                    '.ad-media-fallback'
                )
            ) {

                const fallback =
                    document.createElement(
                        'div'
                    );


                fallback.className =
                    'ad-media-fallback';


                fallback.textContent =
                    iniciais;


                mediaBox.appendChild(
                    fallback
                );

            }

        }
    );

}


/* =====================================================
   TRATAMENTO DO VÍDEO
====================================================== */

const videoMedia =
    card.querySelector(
        '.ad-media-video'
    );


if (videoMedia) {

    videoMedia.addEventListener(
        'loadedmetadata',
        function () {

            this.play()
                .catch(
                    function () {}
                );

        }
    );


    const botaoTelaCheia =
        card.querySelector(
            '.btn-video-tela-cheia'
        );


    if (botaoTelaCheia) {

        botaoTelaCheia.addEventListener(
            'click',
            async function (event) {

                event.preventDefault();

                event.stopPropagation();


                try {

                    if (
                        typeof videoMedia.webkitEnterFullscreen ===
                        'function'
                    ) {

                        videoMedia.webkitEnterFullscreen();

                        return;

                    }


                    if (
                        typeof videoMedia.requestFullscreen ===
                        'function'
                    ) {

                        await videoMedia.requestFullscreen();

                        return;

                    }


                    const containerVideo =
                        videoMedia.parentElement;


                    if (
                        containerVideo &&
                        typeof containerVideo.requestFullscreen ===
                        'function'
                    ) {

                        await containerVideo.requestFullscreen();

                        return;

                    }


                    console.warn(
                        '⚠️ Tela cheia não é suportada neste navegador.'
                    );

                } catch (erro) {

                    console.warn(
                        '⚠️ Não foi possível abrir o vídeo em tela cheia:',
                        erro
                    );

                }

            }
        );

    }


    videoMedia.addEventListener(
        'error',
        function () {

            console.warn(
                '⚠️ Não foi possível carregar o vídeo do destaque:',
                urlDestaque
            );


            const mediaBox =
                this.closest('.ad-media-box');


            if (!mediaBox) {
                return;
            }


            if (fotoUrl) {

                mediaBox.innerHTML = `

                    <img
                        src="${escaparHtml(fotoUrl)}"
                        alt="Foto de ${escaparHtml(nome)}"
                        class="ad-media-img"
                        loading="lazy"
                    >

                `;


                const imagemFallback =
                    mediaBox.querySelector(
                        '.ad-media-img'
                    );


                if (imagemFallback) {

                    imagemFallback.addEventListener(
                        'error',
                        function () {

                            this.style.display =
                                'none';


                            mediaBox.innerHTML = `

                                <div class="ad-media-sem-foto">

                                    <span>
                                        ${escaparHtml(iniciais)}
                                    </span>

                                </div>

                            `;

                        }
                    );

                }

            } else {

                mediaBox.innerHTML = `

                    <div class="ad-media-sem-foto">

                        <span>
                            ${escaparHtml(iniciais)}
                        </span>

                    </div>

                `;

            }

        }
    );

}


/* =====================================================
   ADICIONAR LINK AO CARD
====================================================== */

link.appendChild(card);


return link;


}

/* =========================================================
CONTADOR
========================================================= */

function atualizarContador() {


const contador =
    document.getElementById(
        'contador-profissionais'
    );


if (!contador) {
    return;
}


if (
    FEED_CONFIG.totalCarregado > 0
) {

    contador.textContent =
        `${FEED_CONFIG.totalCarregado} carregados`;

}


}

/* =========================================================
INFINITE SCROLL
========================================================= */

function configurarInfiniteScroll() {


if (
    FEED_CONFIG.observer
) {

    FEED_CONFIG.observer.disconnect();

}


const sentinela =
    document.getElementById(
        'feed-sentinela'
    );


if (!sentinela) {
    return;
}


const areaRolagem =
    document.querySelector(
        '.main-content'
    );


FEED_CONFIG.observer =
    new IntersectionObserver(

        function (entries) {

            const entrada =
                entries[0];


            if (
                entrada &&
                entrada.isIntersecting
            ) {

                carregarProximaPagina();

            }

        },

        {

            root:
                areaRolagem || null,

            rootMargin:
                '500px 0px',

            threshold:
                0

        }

    );


FEED_CONFIG.observer.observe(
    sentinela
);


}

/* =========================================================
CARREGAMENTO MAIS
========================================================= */

function mostrarCarregamentoMais(
mostrar
) {


const elemento =
    document.getElementById(
        'feed-carregando-mais'
    );


if (!elemento) {
    return;
}


elemento.style.display =
    mostrar
        ? 'flex'
        : 'none';


}

/* =========================================================
FIM DO FEED
========================================================= */

function mostrarFimFeed() {


const elemento =
    document.getElementById(
        'feed-fim'
    );


if (!elemento) {
    return;
}


elemento.style.display =
    'block';


}

/* =========================================================
FEED VAZIO
========================================================= */

function mostrarFeedVazio() {


const container =
    document.getElementById(
        'feed-profissionais'
    );


const vazio =
    document.getElementById(
        'feed-vazio'
    );


if (container) {

    container.innerHTML =
        '';

}


if (vazio) {

    vazio.style.display =
        'block';

}


}

/* =========================================================
ERRO DO FEED
========================================================= */

function mostrarErroFeed(
mensagem
) {


const container =
    document.getElementById(
        'feed-profissionais'
    );


if (!container) {
    return;
}


container.innerHTML = `

    <div class="estado-vazio">

        <strong>
            Não foi possível carregar
        </strong>

        <p>
            ${escaparHtml(mensagem)}
        </p>

    </div>

`;


}

/* =========================================================
RECEBER FILTROS DO MODAL
========================================================= */

function iniciarIntegracaoFiltros() {


window.addEventListener(
    'musicalworld:filtros-aplicados',
    function (event) {

        const filtros =
            normalizarFiltros(
                event?.detail?.filtros || {}
            );


        console.log(
            '🎯 Filtros recebidos pelo feed:',
            filtros
        );


        FEED_CONFIG.filtrosAtuais =
            filtros;


        carregarProfissionaisInicio(
            filtros
        );

    }
);


}

/* =========================================================
COMPATIBILIDADE COM O FILTRO
========================================================= */

window.abrirModalFiltro =
function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.abrir ===
        'function'
) {

    window.ModalFiltro.abrir();

    return;

}


console.warn(
    '⚠️ ModalFiltro ainda não foi carregado.'
);


};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
'DOMContentLoaded',
function () {


    console.log(
        '🚀 Inicializando feed MusicalWorld...'
    );


    iniciarAvisoFeed();


    iniciarIntegracaoFiltros();


    carregarProfissionaisInicio();

}


);
