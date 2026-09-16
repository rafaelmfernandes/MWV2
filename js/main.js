
/* =========================================================
   MUSICALWORLD — PÁGINA INICIAL
   Arquivo: feed.js

   FEED SOCIAL DE PROFISSIONAIS

   Responsabilidade deste arquivo:

   - Carregar os profissionais do feed.
   - Aplicar filtros recebidos do modal.
   - Controlar paginação e carregamento infinito.
   - Criar as publicações dos profissionais.
   - Organizar cada publicação em formato de timeline social.
   - Controlar a mídia de destaque.
   - Controlar reprodução automática dos vídeos.
   - Controlar vídeo e tela cheia.
   - Manter a navegação para o perfil.
   - Preservar compatibilidade com o restante do index.

   MODELO VISUAL:

   A publicação segue uma hierarquia semelhante a uma
   timeline social:

       Identidade
            ↓
       Texto / descrição
            ↓
       Imagem / vídeo
            ↓
       Ações sociais
            ↓
       Informações complementares

   A publicação NÃO é mais um grande card de marketplace.

   No desktop:

   - O feed possui largura controlada.
   - As publicações ficam centralizadas.
   - Existe uma linha visual contínua entre publicações.
   - A mídia continua sendo importante, mas não domina
     toda a estrutura da publicação.

   No celular:

   - O feed ocupa toda a largura disponível.
   - Não existem duas colunas.
   - Avatar, nome e texto possuem espaçamento interno.
   - A mídia pode encostar diretamente nas laterais da tela.
   - As ações ficam abaixo da mídia.
   - Informações complementares permanecem disponíveis.

   REPRODUÇÃO DOS VÍDEOS:

   - Cada vídeo é tratado individualmente.
   - Dois ou mais vídeos visíveis podem reproduzir.
   - Cada vídeo precisa permanecer visível por alguns
     segundos antes de começar.
   - Vídeos que saem da área visível são pausados.
   - O atraso de reprodução de cada vídeo é independente.
   - Rolagens rápidas cancelam vídeos que ainda estavam
     aguardando o início.
   - Vídeos fora da área visível permanecem pausados.

   IMPORTANTE:

   Este arquivo controla estrutura, dados, eventos e
   comportamento.

   A aparência visual permanece principalmente em:

       css/index/feed.css
       css/index/10-responsividade.css
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
   CONFIGURAÇÃO DA REPRODUÇÃO DOS VÍDEOS
========================================================= */

const FEED_VIDEO_CONFIG = {

    /*
     * Tempo que cada vídeo precisa permanecer visível
     * antes de começar a reprodução.
     */
    atrasoInicial: 2000,

    /*
     * Percentual mínimo da ÁREA DA MÍDIA que precisa
     * estar visível para que o vídeo seja considerado
     * pronto para reprodução.
     */
    percentualMinimoVisivel: 0.55,

    /*
     * IntersectionObserver dos vídeos.
     */
    observer: null,

    /*
     * Cada vídeo possui seu próprio timer.
     */
    timersReproducao: new Map()

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

   O destaque continua sendo utilizado internamente para
   definir a mídia principal da publicação.

   IMPORTANTE:

   O destaque do portfólio NÃO gera nenhuma tag visual
   "Destaque" na publicação.
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

function obterPaginaPerfil() {

    return 'apresentar-perfil.html';

}


/* =========================================================
   AVISO DISCRETO DO FEED
========================================================= */

function iniciarAvisoFeed() {

    const aviso =
        document.getElementById(
            'feedAviso'
        );

    const botaoFechar =
        document.getElementById(
            'btnFecharFeedAviso'
        );

    if (!aviso || !botaoFechar) {

        console.warn(
            'Elementos do aviso do feed não encontrados.'
        );

        return;

    }

    const chaveAviso =
        'musicalworld_feed_aviso_fechado';

    let avisoFechado = false;

    try {

        avisoFechado =
            localStorage.getItem(
                chaveAviso
            ) === 'true';

    } catch (erro) {

        console.warn(
            'Não foi possível acessar o localStorage.',
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

            aviso.classList.add(
                'ocultando'
            );

            try {

                localStorage.setItem(
                    chaveAviso,
                    'true'
                );

            } catch (erro) {

                console.warn(
                    'Não foi possível salvar o fechamento do aviso.',
                    erro
                );

            }

            setTimeout(
                function () {

                    aviso.style.display =
                        'none';

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
            String(
                origem.estado || ''
            ).trim(),

        cidade:
            String(
                origem.cidade || ''
            ).trim(),

        categoria:
            String(
                origem.categoria || ''
            ).trim(),

        instrumento:
            String(
                origem.instrumento || ''
            ).trim(),

        estilo:
            String(
                origem.estilo || ''
            ).trim(),

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
   =========================================================
   CONTROLADOR DE VÍDEOS
   =========================================================
   ========================================================= */


/* =========================================================
   CANCELAR TIMER DE UM VÍDEO
========================================================= */

function cancelarTimerVideo(video) {

    if (!video) {
        return;
    }

    const timer =
        FEED_VIDEO_CONFIG.timersReproducao.get(
            video
        );

    if (timer) {

        clearTimeout(timer);

        FEED_VIDEO_CONFIG.timersReproducao.delete(
            video
        );

    }

}


/* =========================================================
   CANCELAR TODOS OS TIMERS
========================================================= */

function cancelarTodosTimersVideos() {

    FEED_VIDEO_CONFIG.timersReproducao
        .forEach(
            timer => {

                clearTimeout(timer);

            }
        );

    FEED_VIDEO_CONFIG.timersReproducao.clear();

}


/* =========================================================
   PAUSAR TODOS OS VÍDEOS
========================================================= */

function pausarTodosVideos() {

    const videos =
        document.querySelectorAll(
            '.ad-media-video'
        );

    videos.forEach(
        video => {

            cancelarTimerVideo(
                video
            );

            if (!video.paused) {

                video.pause();

            }

        }
    );

}


/* =========================================================
   CALCULAR VISIBILIDADE DO VÍDEO
=========================================================

   A referência agora é a área da mídia.

   Isso é mais adequado para um feed social porque uma
   publicação pode possuir bastante texto acima ou abaixo
   da mídia.

   O vídeo deve iniciar quando a própria mídia estiver
   suficientemente visível na tela.
========================================================= */

function calcularVisibilidadeVideo(video) {

    if (!video) {
        return 0;
    }

    const areaMidia =
        video.closest(
            '.ad-media-box'
        );

    if (!areaMidia) {
        return 0;
    }

    const rect =
        areaMidia.getBoundingClientRect();

    const alturaJanela =
        window.innerHeight ||
        document.documentElement.clientHeight;

    const larguraJanela =
        window.innerWidth ||
        document.documentElement.clientWidth;

    const larguraVisivel =
        Math.max(
            0,
            Math.min(
                rect.right,
                larguraJanela
            ) -
            Math.max(
                rect.left,
                0
            )
        );

    const alturaVisivel =
        Math.max(
            0,
            Math.min(
                rect.bottom,
                alturaJanela
            ) -
            Math.max(
                rect.top,
                0
            )
        );

    const areaVisivel =
        larguraVisivel *
        alturaVisivel;

    const areaTotal =
        Math.max(
            1,
            rect.width *
            rect.height
        );

    return (
        areaVisivel /
        areaTotal
    );

}


/* =========================================================
   VERIFICAR SE VÍDEO ESTÁ VISÍVEL
========================================================= */

function videoEstaVisivel(video) {

    return (
        calcularVisibilidadeVideo(video) >=
        FEED_VIDEO_CONFIG.percentualMinimoVisivel
    );

}


/* =========================================================
   REPRODUZIR VÍDEO
========================================================= */

function reproduzirVideo(video) {

    if (!video) {
        return;
    }

    if (!videoEstaVisivel(video)) {

        cancelarTimerVideo(
            video
        );

        if (!video.paused) {

            video.pause();

        }

        return;

    }

    cancelarTimerVideo(
        video
    );

    video.muted = true;

    video.playsInline = true;

    video.loop = true;

    video.play()
        .then(
            function () {

                console.log(
                    'Vídeo do feed iniciado.'
                );

            }
        )
        .catch(
            function (erro) {

                console.debug(
                    'Reprodução automática do vídeo não foi iniciada:',
                    erro
                );

            }
        );

}


/* =========================================================
   AGENDAR REPRODUÇÃO DE UM VÍDEO
========================================================= */

function agendarReproducaoVideo(video) {

    if (!video) {
        return;
    }

    if (
        FEED_VIDEO_CONFIG.timersReproducao.has(
            video
        )
    ) {

        return;

    }

    if (!video.paused) {
        return;
    }

    if (!videoEstaVisivel(video)) {
        return;
    }

    const timer =
        setTimeout(
            function () {

                FEED_VIDEO_CONFIG.timersReproducao.delete(
                    video
                );

                /*
                 * Verificação final depois do atraso.
                 */
                if (!videoEstaVisivel(video)) {

                    if (!video.paused) {

                        video.pause();

                    }

                    return;

                }

                reproduzirVideo(
                    video
                );

            },
            FEED_VIDEO_CONFIG.atrasoInicial
        );

    FEED_VIDEO_CONFIG.timersReproducao.set(
        video,
        timer
    );

}


/* =========================================================
   ATUALIZAR TODOS OS VÍDEOS
========================================================= */

function atualizarVideosVisiveis() {

    const videos =
        Array.from(
            document.querySelectorAll(
                '.ad-media-video'
            )
        );

    if (videos.length === 0) {
        return;
    }

    videos.forEach(
        video => {

            const visivel =
                videoEstaVisivel(video);

            if (visivel) {

                if (video.paused) {

                    agendarReproducaoVideo(
                        video
                    );

                }

                return;

            }

            cancelarTimerVideo(
                video
            );

            if (!video.paused) {

                video.pause();

            }

        }
    );

}


/* =========================================================
   INICIALIZAR OBSERVADOR DOS VÍDEOS
========================================================= */

function inicializarObservadorVideos() {

    if (
        FEED_VIDEO_CONFIG.observer
    ) {

        FEED_VIDEO_CONFIG.observer.disconnect();

    }

    FEED_VIDEO_CONFIG.observer =
        new IntersectionObserver(

            function () {

                atualizarVideosVisiveis();

            },

            {
                root: null,

                threshold: [
                    0,
                    0.25,
                    0.5,
                    0.55,
                    0.75,
                    1
                ]

            }

        );

    observarVideosExistentes();

}


/* =========================================================
   OBSERVAR VÍDEOS EXISTENTES
========================================================= */

function observarVideosExistentes() {

    if (
        !FEED_VIDEO_CONFIG.observer
    ) {

        return;

    }

    const videos =
        document.querySelectorAll(
            '.ad-media-video'
        );

    videos.forEach(
        video => {

            if (
                video.dataset.videoObservado ===
                'true'
            ) {

                return;

            }

            video.dataset.videoObservado =
                'true';

            video.muted = true;

            video.playsInline = true;

            video.loop = true;

            FEED_VIDEO_CONFIG.observer.observe(
                video
            );

        }
    );

    setTimeout(
        function () {

            atualizarVideosVisiveis();

        },
        100
    );

}


/* =========================================================
   PAUSAR VÍDEOS QUANDO A PÁGINA FICA OCULTA
========================================================= */

function configurarVisibilidadePaginaVideos() {

    document.addEventListener(
        'visibilitychange',
        function () {

            if (
                document.hidden
            ) {

                cancelarTodosTimersVideos();

                pausarTodosVideos();

                return;

            }

            atualizarVideosVisiveis();

        }
    );

}


/* =========================================================
   CONTROLE DE SCROLL DOS VÍDEOS
========================================================= */

let feedVideoScrollTimer = null;

function configurarControleScrollVideos() {

    window.addEventListener(
        'scroll',
        function () {

            if (feedVideoScrollTimer) {

                clearTimeout(
                    feedVideoScrollTimer
                );

            }

            atualizarVideosVisiveis();

            feedVideoScrollTimer =
                setTimeout(
                    function () {

                        feedVideoScrollTimer =
                            null;

                        atualizarVideosVisiveis();

                    },
                    120
                );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   CARREGAR PRIMEIRA PÁGINA
========================================================= */

async function carregarProfissionaisInicio(
    filtros = null
) {

    console.log(
        'Iniciando feed social vertical de profissionais...'
    );

    if (filtros !== null) {

        FEED_CONFIG.filtrosAtuais =
            normalizarFiltros(
                filtros
            );

    }

    FEED_CONFIG.paginaAtual = 0;

    FEED_CONFIG.carregando = false;

    FEED_CONFIG.acabou = false;

    FEED_CONFIG.totalCarregado = 0;

    cancelarTodosTimersVideos();

    pausarTodosVideos();

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
            'Container do feed não encontrado.'
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

        vazio.style.display =
            'none';

    }

    if (fim) {

        fim.style.display =
            'none';

    }

    if (carregandoMais) {

        carregandoMais.style.display =
            'none';

    }

    if (contador) {

        contador.textContent =
            '';

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
            'SupabaseClient não encontrado.'
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
            'Buscando profissionais com filtros:',
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
                'Erro ao carregar profissionais pela RPC:',
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
            `${profissionais.length} profissional(is) recebido(s).`
        );

        if (
            !data ||
            data.length <
            FEED_CONFIG.limitePorPagina
        ) {

            FEED_CONFIG.acabou =
                true;

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

            container.innerHTML =
                '';

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

        /*
         * Os novos posts podem conter vídeos.
         */
        observarVideosExistentes();

        if (FEED_CONFIG.acabou) {

            mostrarFimFeed();

        }

    } catch (erro) {

        console.error(
            'Erro inesperado no feed:',
            erro
        );

        mostrarErroFeed(
            'Ocorreu um erro ao carregar os profissionais.'
        );

    } finally {

        FEED_CONFIG.carregando =
            false;

        mostrarCarregamentoMais(
            false
        );

    }

}


/* =========================================================
   ÍCONES DAS AÇÕES SOCIAIS
========================================================= */

/*
 * Os ícones são SVGs inline para manter o padrão visual
 * do MusicalWorld sem utilizar emojis.
 */

function obterIconeFeed(
    tipo
) {

    const icones = {

        comentar: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"></path>
            </svg>
        `,

        curtir: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        `,

        compartilhar: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M22 2 11 13"></path>
                <path d="m22 2-7 20-4-9-9-4Z"></path>
            </svg>
        `,

        salvar: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"></path>
            </svg>
        `,

        menu: `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <circle cx="5" cy="12" r="1.5"></circle>
                <circle cx="12" cy="12" r="1.5"></circle>
                <circle cx="19" cy="12" r="1.5"></circle>
            </svg>
        `,

        localizacao: `
            <svg
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
        `

    };

    return (
        icones[tipo] ||
        ''
    );

}


/* =========================================================
   CRIAR PUBLICAÇÃO DO PROFISSIONAL

   ESTRUTURA SOCIAL:

   1. Cabeçalho da publicação
   2. Texto da publicação
   3. Mídia
   4. Ações
   5. Informações complementares

   A publicação não fica mais dentro de um <a>.

   Isso evita links aninhados e permite que os controles
   sociais sejam elementos interativos independentes.
========================================================= */

function criarCardProfissional(
    perfil,
    artista,
    destaque
) {

    const paginaPerfil =
        obterPaginaPerfil();

    const perfilId =
        perfil?.id;

    if (!perfilId) {

        console.warn(
            'Perfil recebido sem ID. A publicação não poderá abrir o perfil:',
            perfil
        );

    }


    /* =====================================================
       POST PRINCIPAL
    ===================================================== */

    const card =
        document.createElement('article');

    card.className =
        'ad-card-novo';

    card.setAttribute(
        'data-perfil-id',
        perfilId || ''
    );


    /* =====================================================
       DADOS DO PROFISSIONAL
    ===================================================== */

    const nome =
        String(
            perfil?.nome_exibicao || ''
        ).trim() ||
        'Profissional';

    const descricao =
        String(
            perfil?.descricao || ''
        ).trim() ||
        'Perfil profissional do MusicalWorld.';

    const localizacao =
        String(
            artista?.localizacao || ''
        ).trim() ||
        'Localização não informada';

    const tipo =
        obterNomeTipo(
            artista?.tipo_artista
        );

    const estilosLista =
        normalizarLista(
            artista?.estilos
        );

    const fotoUrl =
        String(
            artista?.foto_url || ''
        ).trim();

    const iniciais =
        gerarIniciais(
            nome
        );


    /* =====================================================
       DADOS DA MÍDIA
    ===================================================== */

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
       MONTAR URL DO PERFIL
    ===================================================== */

    const urlPerfil =
        perfilId
            ? `${paginaPerfil}?id=${encodeURIComponent(
                perfilId
            )}`
            : 'javascript:void(0);';


    /* =====================================================
       MÍDIA PRINCIPAL
    ===================================================== */

    let mediaHtml =
        '';


    /* -----------------------------------------------------
       PRIORIDADE 1 — IMAGEM DE DESTAQUE
    ----------------------------------------------------- */

    if (
        destaque &&
        urlDestaque &&
        tipoDestaque === 'imagem'
    ) {

        mediaHtml = `

            <a
                href="${escaparHtml(
                    urlPerfil
                )}"
                class="ad-media-link"
                aria-label="Abrir perfil de ${escaparHtml(
                    nome
                )}"
            >

                <img
                    src="${escaparHtml(
                        urlDestaque
                    )}"
                    alt="${escaparHtml(
                        destaque.titulo ||
                        `Publicação de ${nome}`
                    )}"
                    class="ad-media-img ad-media-destaque"
                    loading="lazy"
                >

            </a>

        `;

    }


    /* -----------------------------------------------------
       PRIORIDADE 2 — VÍDEO DE DESTAQUE
    ----------------------------------------------------- */

    else if (
        destaque &&
        urlDestaque &&
        tipoDestaque === 'video'
    ) {

        const posterHtml =
            thumbnailDestaque
                ? `poster="${escaparHtml(
                    thumbnailDestaque
                )}"`
                : '';

        mediaHtml = `

            <div class="ad-video-container">

                <a
                    href="${escaparHtml(
                        urlPerfil
                    )}"
                    class="ad-media-link ad-video-link"
                    aria-label="Abrir perfil de ${escaparHtml(
                        nome
                    )}"
                >

                    <video
                        src="${escaparHtml(
                            urlDestaque
                        )}"
                        ${posterHtml}
                        class="ad-media-video"
                        muted
                        loop
                        playsinline
                        preload="metadata"
                    ></video>

                </a>


                <button
                    type="button"
                    class="btn-video-tela-cheia"
                    aria-label="Abrir vídeo em tela cheia"
                    title="Tela cheia"
                >

                    ${obterIconeFeed(
                        'compartilhar'
                    )}

                </button>

            </div>

        `;

    }


    /* -----------------------------------------------------
       PRIORIDADE 3 — FOTO DO PERFIL
    ----------------------------------------------------- */

    else if (fotoUrl) {

        mediaHtml = `

            <a
                href="${escaparHtml(
                    urlPerfil
                )}"
                class="ad-media-link"
                aria-label="Abrir perfil de ${escaparHtml(
                    nome
                )}"
            >

                <img
                    src="${escaparHtml(
                        fotoUrl
                    )}"
                    alt="Foto de ${escaparHtml(
                        nome
                    )}"
                    class="ad-media-img"
                    loading="lazy"
                >

            </a>

        `;

    }


    /* -----------------------------------------------------
       PRIORIDADE 4 — FALLBACK
    ----------------------------------------------------- */

    else {

        mediaHtml = `

            <a
                href="${escaparHtml(
                    urlPerfil
                )}"
                class="ad-media-link"
                aria-label="Abrir perfil de ${escaparHtml(
                    nome
                )}"
            >

                <div class="ad-media-sem-foto">

                    <span>
                        ${escaparHtml(
                            iniciais
                        )}
                    </span>

                </div>

            </a>

        `;

    }


    /* =====================================================
       ESTILOS
    ===================================================== */

    const estilosHtml =
        estilosLista.length > 0
            ? `

                <div class="ad-card-estilos">

                    <span class="ad-card-estilos-label">

                        ${escaparHtml(
                            estilosLista
                                .slice(0, 3)
                                .join(' / ')
                        )}

                    </span>

                </div>

              `
            : '';


    /* =====================================================
       IDENTIDADE
    ===================================================== */

    const identidadeHtml =
        fotoUrl
            ? `

                <img
                    src="${escaparHtml(
                        fotoUrl
                    )}"
                    alt=""
                    class="ad-mini-avatar"
                    aria-hidden="true"
                >

                <div
                    class="ad-mini-avatar-fallback"
                    aria-hidden="true"
                    style="display:none;"
                >
                    ${escaparHtml(
                        iniciais
                    )}
                </div>

              `
            : `

                <div
                    class="ad-mini-avatar-fallback"
                    aria-hidden="true"
                >
                    ${escaparHtml(
                        iniciais
                    )}
                </div>

              `;


    /* =====================================================
       ESTRUTURA SOCIAL DA PUBLICAÇÃO
    ===================================================== */

    card.innerHTML = `

        <!-- =================================================
             CABEÇALHO DA PUBLICAÇÃO
        ================================================= -->

        <div class="ad-card-conteudo">


            <div class="ad-card-identidade">

                <a
                    href="${escaparHtml(
                        urlPerfil
                    )}"
                    class="ad-card-identidade-link"
                    aria-label="Abrir perfil de ${escaparHtml(
                        nome
                    )}"
                >

                    ${identidadeHtml}

                    <div class="ad-card-nome-area">

                        <strong class="ad-card-nome">

                            ${escaparHtml(
                                nome
                            )}

                        </strong>

                        <span class="ad-card-tipo">

                            ${escaparHtml(
                                tipo
                            )}

                        </span>

                    </div>

                </a>


                <button
                    type="button"
                    class="ad-card-menu"
                    aria-label="Mais opções da publicação"
                    title="Mais opções"
                >

                    ${obterIconeFeed(
                        'menu'
                    )}

                </button>

            </div>


            <!-- =================================================
                 TEXTO DA PUBLICAÇÃO
            ================================================= -->

            <div class="ad-card-publicacao-texto">

                <p class="ad-card-descricao">

                    ${escaparHtml(
                        descricao
                    )}

                </p>

            </div>

        </div>


        <!-- =================================================
             MÍDIA
        ================================================= -->

        <div class="ad-media-box">

            ${mediaHtml}

            <div class="ad-media-overlay"></div>

        </div>


        <!-- =================================================
             AÇÕES SOCIAIS
        ================================================= -->

        <div
            class="ad-card-acoes"
            aria-label="Ações da publicação"
        >

            <button
                type="button"
                class="ad-social-btn ad-social-comentar"
                aria-label="Comentar"
                title="Comentar"
            >

                ${obterIconeFeed(
                    'comentar'
                )}

                <span class="ad-social-label">
                    Comentar
                </span>

            </button>


            <button
                type="button"
                class="ad-social-btn ad-social-curtir"
                aria-label="Curtir"
                title="Curtir"
            >

                ${obterIconeFeed(
                    'curtir'
                )}

                <span class="ad-social-label">
                    Curtir
                </span>

            </button>


            <button
                type="button"
                class="ad-social-btn ad-social-compartilhar"
                aria-label="Compartilhar"
                title="Compartilhar"
            >

                ${obterIconeFeed(
                    'compartilhar'
                )}

                <span class="ad-social-label">
                    Compartilhar
                </span>

            </button>


            <button
                type="button"
                class="ad-social-btn ad-social-salvar"
                aria-label="Salvar publicação"
                title="Salvar"
            >

                ${obterIconeFeed(
                    'salvar'
                )}

                <span class="ad-social-label">
                    Salvar
                </span>

            </button>

        </div>


        <!-- =================================================
             INFORMAÇÕES COMPLEMENTARES
        ================================================= -->

        <div class="ad-card-informacoes">


            <!-- LOCALIZAÇÃO -->

            <div class="ad-card-meta">

                <span class="ad-card-localizacao">

                    ${obterIconeFeed(
                        'localizacao'
                    )}

                    <span
                        class="ad-card-localizacao-texto"
                    >

                        ${escaparHtml(
                            localizacao
                        )}

                    </span>

                </span>

            </div>


            <!-- ESTILOS -->

            ${estilosHtml}


            <!-- =================================================
                 LINK DISCRETO PARA O PERFIL
            ================================================= -->

            <div class="ad-card-acao">

                <a
                    href="${escaparHtml(
                        urlPerfil
                    )}"
                    class="ad-card-ver-perfil"
                >
                    Ver perfil
                </a>

            </div>


        </div>

    `;


    /* =====================================================
       CLIQUE NA PUBLICAÇÃO
    =====================================================

       A publicação inteira continua sendo navegável.

       Entretanto, elementos interativos possuem seu próprio
       comportamento e não devem abrir o perfil.
    ===================================================== */

    card.addEventListener(
        'click',
        function (event) {

            const elementoInterativo =
                event.target.closest(
                    'button, a'
                );

            if (elementoInterativo) {
                return;
            }

            if (!perfilId) {
                return;
            }

            window.location.href =
                urlPerfil;

        }
    );


    /* =====================================================
       MINI AVATAR
    ===================================================== */

    const miniAvatar =
        card.querySelector(
            '.ad-mini-avatar:not(.ad-mini-avatar-fallback)'
        );

    if (miniAvatar) {

        miniAvatar.addEventListener(
            'error',
            function () {

                this.style.display =
                    'none';

                const fallback =
                    this.nextElementSibling;

                if (
                    fallback &&
                    fallback.classList.contains(
                        'ad-mini-avatar-fallback'
                    )
                ) {

                    fallback.style.display =
                        'flex';

                }

            }
        );

    }


    /* =====================================================
       ERRO DA IMAGEM PRINCIPAL
    ===================================================== */

    const imagemMedia =
        card.querySelector(
            '.ad-media-img:not(.ad-media-video)'
        );

    if (imagemMedia) {

        imagemMedia.addEventListener(
            'error',
            function () {

                this.style.display =
                    'none';

                const mediaBox =
                    this.closest(
                        '.ad-media-box'
                    );

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
    ===================================================== */

    const videoMedia =
        card.querySelector(
            '.ad-media-video'
        );

    if (videoMedia) {

        videoMedia.pause();

        videoMedia.muted =
            true;

        videoMedia.playsInline =
            true;

        videoMedia.loop =
            true;


        /* -------------------------------------------------
           BOTÃO DE TELA CHEIA
        ------------------------------------------------- */

        const botaoTelaCheia =
            card.querySelector(
                '.btn-video-tela-cheia'
            );

        if (botaoTelaCheia) {

            /*
             * Substituímos visualmente o ícone antigo por
             * um controle próprio de tela cheia.
             */
            botaoTelaCheia.innerHTML = `

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

            `;

            botaoTelaCheia.addEventListener(
                'click',
                async function (event) {

                    /*
                     * Impede que o clique abra o perfil.
                     */

                    event.preventDefault();

                    event.stopPropagation();

                    try {

                        /*
                         * iPhone / Safari.
                         */

                        if (
                            typeof videoMedia.webkitEnterFullscreen ===
                            'function'
                        ) {

                            videoMedia.webkitEnterFullscreen();

                            return;

                        }


                        /*
                         * Navegadores modernos.
                         */

                        if (
                            typeof videoMedia.requestFullscreen ===
                            'function'
                        ) {

                            await videoMedia.requestFullscreen();

                            return;

                        }


                        /*
                         * Fallback usando o container.
                         */

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
                            'Tela cheia não é suportada neste navegador.'
                        );

                    } catch (erro) {

                        console.warn(
                            'Não foi possível abrir o vídeo em tela cheia:',
                            erro
                        );

                    }

                }
            );

        }


        /* -------------------------------------------------
           ERRO DO VÍDEO
        ------------------------------------------------- */

        videoMedia.addEventListener(
            'error',
            function () {

                cancelarTimerVideo(
                    this
                );

                console.warn(
                    'Não foi possível carregar o vídeo do destaque:',
                    urlDestaque
                );

                const mediaBox =
                    this.closest(
                        '.ad-media-box'
                    );

                if (!mediaBox) {
                    return;
                }


                /*
                 * Se existir foto do perfil, utilizamos
                 * a foto como fallback.
                 */

                if (fotoUrl) {

                    mediaBox.innerHTML = `

                        <a
                            href="${escaparHtml(
                                urlPerfil
                            )}"
                            class="ad-media-link"
                            aria-label="Abrir perfil de ${escaparHtml(
                                nome
                            )}"
                        >

                            <img
                                src="${escaparHtml(
                                    fotoUrl
                                )}"
                                alt="Foto de ${escaparHtml(
                                    nome
                                )}"
                                class="ad-media-img"
                                loading="lazy"
                            >

                        </a>

                        <div
                            class="ad-media-overlay"
                        ></div>

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

                                    <a
                                        href="${escaparHtml(
                                            urlPerfil
                                        )}"
                                        class="ad-media-link"
                                        aria-label="Abrir perfil de ${escaparHtml(
                                            nome
                                        )}"
                                    >

                                        <div
                                            class="ad-media-sem-foto"
                                        >

                                            <span>

                                                ${escaparHtml(
                                                    iniciais
                                                )}

                                            </span>

                                        </div>

                                    </a>

                                    <div
                                        class="ad-media-overlay"
                                    ></div>

                                `;

                            }
                        );

                    }

                } else {

                    mediaBox.innerHTML = `

                        <a
                            href="${escaparHtml(
                                urlPerfil
                            )}"
                            class="ad-media-link"
                            aria-label="Abrir perfil de ${escaparHtml(
                                nome
                            )}"
                        >

                            <div
                                class="ad-media-sem-foto"
                            >

                                <span>

                                    ${escaparHtml(
                                        iniciais
                                    )}

                                </span>

                            </div>

                        </a>

                        <div
                            class="ad-media-overlay"
                        ></div>

                    `;

                }

            }
        );

    }


    /* =====================================================
       AÇÕES SOCIAIS — COMPORTAMENTO VISUAL
    =====================================================

       As ações ainda não possuem persistência no Supabase.

       Por enquanto:

       - impedem a navegação para o perfil;
       - permitem estado visual local;
       - deixam a estrutura pronta para integração futura.
    ===================================================== */

    const botoesSociais =
        card.querySelectorAll(
            '.ad-social-btn'
        );

    botoesSociais.forEach(
        botao => {

            botao.addEventListener(
                'click',
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    /*
                     * Estado visual local.
                     *
                     * A persistência real poderá ser ligada
                     * posteriormente às tabelas de interação.
                     */

                    if (
                        this.classList.contains(
                            'ad-social-curtir'
                        )
                    ) {

                        this.classList.toggle(
                            'ativo'
                        );

                    }

                    if (
                        this.classList.contains(
                            'ad-social-salvar'
                        )
                    ) {

                        this.classList.toggle(
                            'ativo'
                        );

                    }

                    if (
                        this.classList.contains(
                            'ad-social-comentar'
                        )
                    ) {

                        console.log(
                            'Comentários ainda não conectados ao banco.'
                        );

                    }

                    if (
                        this.classList.contains(
                            'ad-social-compartilhar'
                        )
                    ) {

                        compartilharPublicacao(
                            urlPerfil,
                            nome
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       MENU DA PUBLICAÇÃO
    ===================================================== */

    const botaoMenu =
        card.querySelector(
            '.ad-card-menu'
        );

    if (botaoMenu) {

        botaoMenu.addEventListener(
            'click',
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                console.log(
                    'Menu da publicação:',
                    {
                        perfilId,
                        nome
                    }
                );

            }
        );

    }


    return card;

}


/* =========================================================
   COMPARTILHAR PUBLICAÇÃO
========================================================= */

async function compartilharPublicacao(
    urlPerfil,
    nome
) {

    const url =
        new URL(
            urlPerfil,
            window.location.origin
        ).href;

    const titulo =
        `Perfil de ${nome} — MusicalWorld`;

    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    titulo,

                text:
                    `Confira o perfil de ${nome} no MusicalWorld.`,

                url

            });

            return;

        }

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText ===
                'function'
        ) {

            await navigator.clipboard.writeText(
                url
            );

            console.log(
                'Link do perfil copiado para a área de transferência.'
            );

            return;

        }

        console.log(
            'URL da publicação:',
            url
        );

    } catch (erro) {

        /*
         * Cancelamentos do compartilhamento nativo,
         * principalmente no celular, não precisam ser
         * tratados como erro crítico.
         */

        console.debug(
            'Compartilhamento cancelado ou indisponível:',
            erro
        );

    }

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
                ${escaparHtml(
                    mensagem
                )}
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
                'Filtros recebidos pelo feed:',
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
            'ModalFiltro ainda não foi carregado.'
        );

    };


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    function () {

        console.log(
            'Inicializando feed social vertical MusicalWorld...'
        );

        iniciarAvisoFeed();

        iniciarIntegracaoFiltros();

        inicializarObservadorVideos();

        configurarVisibilidadePaginaVideos();

        configurarControleScrollVideos();

        carregarProfissionaisInicio();

    }
);

