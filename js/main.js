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

observer: null


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
GERAR INICIAIS
========================================================= */

function gerarIniciais(nome) {


const partes = String(nome || '')
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


const valor = String(tipo || '').trim();

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
CARREGAR PRIMEIRA PÁGINA
========================================================= */

async function carregarProfissionaisInicio() {


console.log(
    '🎵 Iniciando feed de profissionais...'
);


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

    const inicio =
        FEED_CONFIG.paginaAtual *
        FEED_CONFIG.limitePorPagina;


    const fim =
        inicio +
        FEED_CONFIG.limitePorPagina -
        1;


    console.log(
        `🔎 Buscando profissionais ${inicio} até ${fim}`
    );


    const { data, error } =
        await window.supabaseClient

            .from('perfis')

            .select(`
                id,
                usuario_id,
                tipo_perfil_id,
                nome_exibicao,
                descricao,
                ativo,
                perfil_publicado,
                created_at,

                perfis_artistas (
                    id,
                    perfil_id,
                    tipo_artista,
                    localizacao,
                    experiencia,
                    area_atendimento,
                    disponivel,
                    instrumentos,
                    estilos,
                    servicos,
                    foto_url
                )
            `)

            .eq('ativo', true)

            .eq('perfil_publicado', true)

            .order(
                'created_at',
                {
                    ascending: false
                }
            )

            .range(
                inicio,
                fim
            );


    if (error) {

        console.error(
            '❌ Erro ao carregar profissionais:',
            error
        );

        mostrarErroFeed(
            'Não foi possível carregar os profissionais.'
        );

        return;

    }


    const profissionais =
        (data || []).filter(
            perfil => {

                const artista =
                    obterArtistaPerfil(
                        perfil
                    );

                return !!artista;

            }
        );


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


            const card =
                criarCardProfissional(
                    perfil,
                    artista
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
artista
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
   ÁREA PRINCIPAL DA FOTO
====================================================== */

const mediaHtml =
    fotoUrl

        ? `
            <img
                src="${escaparHtml(fotoUrl)}"
                alt="Foto de ${escaparHtml(nome)}"
                class="ad-media-img"
                loading="lazy"
            >
          `

        : `
            <div class="ad-media-sem-foto">

                <span>
                    ${escaparHtml(iniciais)}
                </span>

            </div>
          `;


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

            📍 ${escaparHtml(localizacao)}

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
   TRATAMENTO DE ERRO DA FOTO PRINCIPAL
====================================================== */

const imagemMedia =
    card.querySelector(
        '.ad-media-img'
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


    /*
     * Primeiro inicializamos o aviso.
     * Ele é independente do feed e não
     * interfere no infinite scroll.
     */

    iniciarAvisoFeed();


    /*
     * Depois iniciamos o feed.
     */

    carregarProfissionaisInicio();

}


);
