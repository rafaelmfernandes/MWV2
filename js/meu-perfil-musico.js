const MusicalWorldMeuPerfilMusico = (() => {
"use strict";


const CONFIG = {
    usarSupabase: true,

    tabelas: {
        usuarios: "usuarios",
        perfis: "perfis",
        tiposPerfil: "tipos_perfil",
        perfisArtistas: "perfis_artistas",
        portfolio: "portfolio_musicos",
        agenda: "agenda_musicos",
        carteiras: "carteiras_musicos",
        transacoes: "transacoes_carteira"
    },

    storageKey: "musicalworld_perfil_musico",
    carteiraStorageKey: "musicalworld_carteira_musico",
    tipoPerfilEsperado: "artista"
};

let usuarioAtual = null;
let perfilAtual = null;
let perfilArtistaAtual = null;
let carteiraAtual = null;
let dadosPerfil = null;

let agendaMesAtual =
    new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

async function inicializar() {
    try {
        if (typeof ControleSessao !== "undefined") {
            const sessao = await ControleSessao.iniciar({
                exigirLogin: true,
                redirecionarPara: "login.html"
            });

            if (sessao === false) {
                return;
            }
        }

        const acesso = await verificarAcessoMusico();

        if (!acesso) {
            return;
        }

        await carregarDoSupabase();

        preencherPerfil(dadosPerfil);

        await carregarCarteiraReal();

        inicializarTabs();
        inicializarBotoes();
        atualizarIcones();

    } catch (erro) {
        console.error(
            "Erro ao inicializar meu perfil:",
            erro
        );

        mostrarToast(
            "Não foi possível carregar seu perfil.",
            "erro"
        );
    }
}

/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

function obterSupabase() {
    if (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
    ) {
        return supabaseClient;
    }

    if (
        typeof window !== "undefined" &&
        window.supabaseClient
    ) {
        return window.supabaseClient;
    }

    if (
        typeof window !== "undefined" &&
        window._supabase
    ) {
        return window._supabase;
    }

    if (
        typeof window !== "undefined" &&
        window.supabase
    ) {
        return window.supabase;
    }

    return null;
}

async function obterUsuarioAutenticado() {
    const cliente = obterSupabase();

    if (!cliente) {
        throw new Error(
            "Cliente Supabase não encontrado."
        );
    }

    if (
        typeof UsuarioAtual !== "undefined" &&
        typeof UsuarioAtual.obterId === "function"
    ) {
        try {
            const id =
                await UsuarioAtual.obterId();

            if (id) {
                const resultado =
                    await cliente
                        .from(CONFIG.tabelas.usuarios)
                        .select("*")
                        .eq("id", id)
                        .maybeSingle();

                if (
                    !resultado.error &&
                    resultado.data
                ) {
                    return resultado.data;
                }
            }

        } catch (erro) {
            console.warn(
                "Não foi possível obter usuário pelo UsuarioAtual:",
                erro
            );
        }
    }

    const respostaAuth =
        await cliente.auth.getUser();

    if (respostaAuth.error) {
        throw respostaAuth.error;
    }

    if (
        !respostaAuth.data ||
        !respostaAuth.data.user
    ) {
        return null;
    }

    const authUser =
        respostaAuth.data.user;

    const resultado =
        await cliente
            .from(CONFIG.tabelas.usuarios)
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

    if (resultado.error) {
        throw resultado.error;
    }

    return resultado.data;
}

/*
|--------------------------------------------------------------------------
| VERIFICAÇÃO DO PERFIL
|--------------------------------------------------------------------------
*/

async function verificarAcessoMusico() {
    try {
        const dados =
            await carregarDadosUsuario();

        if (
            !dados ||
            !dados.usuario ||
            !dados.perfil
        ) {
            mostrarToast(
                "Perfil de músico não encontrado.",
                "erro"
            );

            return false;
        }

        usuarioAtual =
            dados.usuario;

        perfilAtual =
            dados.perfil;

        perfilArtistaAtual =
            dados.perfilArtista;

        const tipoNome =
            String(
                dados.tipoPerfil?.nome || ""
            )
                .trim()
                .toLowerCase();

        if (
            tipoNome !==
            CONFIG.tipoPerfilEsperado
        ) {
            mostrarToast(
                "Este perfil não é um perfil de artista.",
                "erro"
            );

            return false;
        }

        return true;

    } catch (erro) {
        console.error(
            "Erro ao verificar acesso do músico:",
            erro
        );

        mostrarToast(
            "Não foi possível verificar seu perfil.",
            "erro"
        );

        return false;
    }
}

async function carregarDadosUsuario() {
    const cliente =
        obterSupabase();

    if (!cliente) {
        throw new Error(
            "Cliente Supabase não encontrado."
        );
    }

    const usuario =
        await obterUsuarioAutenticado();

    if (!usuario) {
        redirecionarLogin();
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | PERFIL
    |--------------------------------------------------------------------------
    */

    const respostaPerfis =
        await cliente
            .from(CONFIG.tabelas.perfis)
            .select(`
                *,
                tipos_perfil (
                    id,
                    nome,
                    descricao,
                    ativo
                )
            `)
            .eq(
                "usuario_id",
                usuario.id
            )
            .eq(
                "ativo",
                true
            )
            .order(
                "id",
                {
                    ascending: false
                }
            );

    if (respostaPerfis.error) {
        throw respostaPerfis.error;
    }

    const perfis =
        respostaPerfis.data || [];

    const perfil =
        perfis.find((item) => {
            const tipo =
                Array.isArray(
                    item.tipos_perfil
                )
                    ? item.tipos_perfil[0]
                    : item.tipos_perfil;

            return String(
                tipo?.nome || ""
            )
                .trim()
                .toLowerCase() ===
                CONFIG.tipoPerfilEsperado;
        });

    if (!perfil) {
        return {
            usuario,
            perfil: null,
            perfilArtista: null,
            tipoPerfil: null
        };
    }

    const tipoPerfil =
        Array.isArray(
            perfil.tipos_perfil
        )
            ? perfil.tipos_perfil[0]
            : perfil.tipos_perfil;

    /*
    |--------------------------------------------------------------------------
    | DADOS ESPECÍFICOS DO ARTISTA
    |--------------------------------------------------------------------------
    */

    const respostaArtista =
        await cliente
            .from(
                CONFIG.tabelas.perfisArtistas
            )
            .select("*")
            .eq(
                "perfil_id",
                perfil.id
            )
            .maybeSingle();

    if (respostaArtista.error) {
        throw respostaArtista.error;
    }

    return {
        usuario,
        perfil,
        perfilArtista:
            respostaArtista.data,
        tipoPerfil
    };
}

/*
|--------------------------------------------------------------------------
| CARREGAMENTO PRINCIPAL
|--------------------------------------------------------------------------
*/

async function carregarDoSupabase() {
    if (
        !usuarioAtual ||
        !perfilAtual
    ) {
        throw new Error(
            "Perfil ainda não carregado."
        );
    }

    const cliente =
        obterSupabase();

    if (!cliente) {
        throw new Error(
            "Cliente Supabase não encontrado."
        );
    }

    const artista =
        perfilArtistaAtual || {};

    /*
    |--------------------------------------------------------------------------
    | PORTFÓLIO REAL
    |--------------------------------------------------------------------------
    */

    let portfolio = [];

    try {
        const respostaPortfolio =
            await cliente
                .from(
                    CONFIG.tabelas.portfolio
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilAtual.id
                )
                .eq(
                    "ativo",
                    true
                )
                .order(
                    "ordem",
                    {
                        ascending: true
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (
            respostaPortfolio.error
        ) {
            throw respostaPortfolio.error;
        }

        portfolio =
            respostaPortfolio.data || [];

        console.log(
            "Portfólio carregado:",
            portfolio
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar portfólio:",
            erro
        );

        portfolio = [];
    }

    /*
    |--------------------------------------------------------------------------
    | DESTAQUE DO CATÁLOGO
    |--------------------------------------------------------------------------
    */

    const destaqueCatalogo =
    portfolio.find(
        (item) =>
            item &&
            (
                item.destaque_catalogo === true ||
                String(
                    item.destaque_catalogo
                )
                    .trim()
                    .toLowerCase() === "true"
            )
    ) || null;

    /*
    |--------------------------------------------------------------------------
    | AGENDA REAL
    |--------------------------------------------------------------------------
    */

    let agenda = [];

    try {
        const respostaAgenda =
            await cliente
                .from(
                    CONFIG.tabelas.agenda
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilAtual.id
                )
                .in(
                    "status",
                    [
                        "agendado",
                        "confirmado"
                    ]
                )
                .order(
                    "data_inicio",
                    {
                        ascending: true
                    }
                );

        if (
            respostaAgenda.error
        ) {
            throw respostaAgenda.error;
        }

        agenda =
            respostaAgenda.data || [];

        console.log(
            "Agenda carregada:",
            agenda
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar agenda:",
            erro
        );

        agenda = [];
    }

    /*
    |--------------------------------------------------------------------------
    | SEPARAÇÃO DO PORTFÓLIO
    |--------------------------------------------------------------------------
    */

    const imagens =
        portfolio.filter(
            (item) =>
                String(
                    item.tipo || ""
                )
                    .trim()
                    .toLowerCase() ===
                "imagem"
        );

    const videos =
        portfolio.filter(
            (item) =>
                String(
                    item.tipo || ""
                )
                    .trim()
                    .toLowerCase() ===
                "video"
        );

    const audios =
        portfolio.filter(
            (item) =>
                String(
                    item.tipo || ""
                )
                    .trim()
                    .toLowerCase() ===
                "audio"
        );

    /*
    |--------------------------------------------------------------------------
    | DADOS DO PERFIL
    |--------------------------------------------------------------------------
    */

    dadosPerfil = {
        id:
            perfilAtual.id,

        nome:
            perfilAtual.nome_exibicao ||
            usuarioAtual.nome ||
            "Músico",

        descricao:
            perfilAtual.descricao ||
            "",

        categoria:
            artista.tipo_artista ||
            "Músico / Instrumentista",

        localizacao:
            artista.localizacao ||
            "Localização não informada",

        experiencia:
            artista.experiencia ||
            "",

        area:
            artista.area_atendimento ||
            "",

        disponibilidade:
            artista.disponivel !== false,

        instrumentos:
            normalizarArray(
                artista.instrumentos
            ),

        generos:
            normalizarArray(
                artista.estilos
            ),

        servicos:
            normalizarArray(
                artista.servicos
            ),

        foto:
            artista.foto_url ||
            usuarioAtual.foto_url ||
            "",

        telefone:
            usuarioAtual.telefone ||
            "",

        email:
            usuarioAtual.email ||
            "",

        avaliacao: {
            media: 0,
            total: 0
        },

        portfolio:
            imagens,

        videos:
            videos,

        audios:
            audios,

        destaqueCatalogo:
            destaqueCatalogo,

        agenda:
            agenda,

        avaliacoes: []
    };

    console.log(
        "Dados do perfil carregados:",
        dadosPerfil
    );

    return dadosPerfil;
}

/*
|--------------------------------------------------------------------------
| PREENCHER PERFIL
|--------------------------------------------------------------------------
*/

function preencherPerfil(dados) {
    if (!dados) {
        return;
    }

    definirTexto(
        "profileName",
        dados.nome
    );

    definirTexto(
        "profileCategory",
        dados.categoria
    );

    definirTexto(
        "profileLocation",
        dados.localizacao
    );

    definirTexto(
        "profileBio",
        dados.descricao ||
        "Este músico ainda não adicionou uma descrição."
    );

    definirTexto(
        "profileExperience",
        dados.experiencia ||
        "Não informado"
    );

    definirTexto(
        "profileArea",
        dados.area ||
        "Não informado"
    );

    definirTexto(
        "profileType",
        dados.categoria ||
        "Artista"
    );

    definirTexto(
        "profileAvailability",
        dados.disponibilidade
            ? "Disponível para contratar"
            : "Indisponível no momento"
    );

    preencherAvatar(dados);

    preencherStatus(dados);

    preencherAvaliacao(dados);

    preencherInstrumentos(
        dados.instrumentos
    );

    preencherGeneros(
        dados.generos
    );

    preencherServicos(
        dados.servicos
    );

    preencherPortfolio(
        dados.portfolio
    );

    preencherDestaqueCatalogo(
        dados.destaqueCatalogo
    );

    preencherVideos(
        dados.videos
    );

    preencherAudios(
        dados.audios
    );

    preencherAgenda(
        dados.agenda
    );

    preencherAvaliacoes(
        dados.avaliacoes
    );

    atualizarBotoesContato(
        dados
    );

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| DESTAQUE NO CATÁLOGO
|--------------------------------------------------------------------------
*/

function preencherDestaqueCatalogo(
    item
) {
    const container =
        document.getElementById(
            "catalogoDestaqueInfo"
        );

    const nome =
        document.getElementById(
            "catalogoDestaqueNome"
        );

    if (
        !container ||
        !nome
    ) {
        return;
    }

    if (!item) {
        container.style.display =
            "none";

        nome.textContent =
            "";

        return;
    }

    nome.textContent =
        item.titulo ||
        "Item do portfólio";

    container.style.display =
        "flex";

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| AVATAR
|--------------------------------------------------------------------------
*/

function preencherAvatar(dados) {
    const avatar =
        document.getElementById(
            "profileAvatar"
        );

    const initials =
        document.getElementById(
            "profileInitials"
        );

    if (!avatar) {
        return;
    }

    let imagem =
        avatar.querySelector("img");

    if (dados.foto) {
        if (!imagem) {
            imagem =
                document.createElement(
                    "img"
                );

            imagem.alt =
                dados.nome ||
                "Perfil";

            avatar.insertBefore(
                imagem,
                avatar.firstChild
            );
        }

        imagem.src =
            dados.foto;

        imagem.alt =
            dados.nome ||
            "Perfil";

        imagem.style.display =
            "block";

        if (initials) {
            initials.style.display =
                "none";
        }

    } else {
        if (imagem) {
            imagem.style.display =
                "none";
        }

        if (initials) {
            initials.textContent =
                gerarIniciais(
                    dados.nome
                );

            initials.style.display =
                "flex";
        }
    }
}

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

function preencherStatus(dados) {
    const elemento =
        document.getElementById(
            "profileStatus"
        );

    if (!elemento) {
        return;
    }

    const disponivel =
        dados.disponibilidade;

    elemento.textContent =
        disponivel
            ? "Disponível"
            : "Indisponível";

    elemento.classList.toggle(
        "available",
        disponivel
    );

    elemento.classList.toggle(
        "unavailable",
        !disponivel
    );
}

/*
|--------------------------------------------------------------------------
| AVALIAÇÃO
|--------------------------------------------------------------------------
*/

function preencherAvaliacao(dados) {
    const media =
        Number(
            dados.avaliacao?.media ||
            0
        );

    const total =
        Number(
            dados.avaliacao?.total ||
            0
        );

    definirTexto(
        "ratingValue",
        media > 0
            ? media.toFixed(1)
            : "0,0"
    );

    definirTexto(
        "ratingReviews",
        total === 1
            ? "1 avaliação"
            : `${total} avaliações`
    );

    const container =
        document.getElementById(
            "profileRating"
        );

    if (container) {
        container.style.display =
            "flex";
    }

    const stars =
        document.querySelector(
            "#profileRating .rating-stars"
        );

    if (stars) {
        stars.innerHTML =
            gerarEstrelas(
                media
            );
    }
}

function gerarEstrelas(media) {
    let html = "";

    for (
        let i = 1;
        i <= 5;
        i++
    ) {
        const preenchida =
            media >= i;

        html += `
            <span class="rating-star ${preenchida ? "filled" : ""}">
                ★
            </span>
        `;
    }

    return html;
}

/*
|--------------------------------------------------------------------------
| INSTRUMENTOS
|--------------------------------------------------------------------------
*/

function preencherInstrumentos(
    instrumentos
) {
    const container =
        document.getElementById(
            "instrumentGrid"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !instrumentos ||
        !instrumentos.length
    ) {
        container.innerHTML = `
            <div class="empty-inline">
                Nenhum instrumento informado.
            </div>
        `;

        return;
    }

    instrumentos.forEach(
        (instrumento) => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "instrument-card";

            card.innerHTML = `
                <div class="instrument-icon">
                    <i data-lucide="music-2"></i>
                </div>

                <div class="instrument-info">
                    <strong>
                        ${escaparHtml(
                            instrumento
                        )}
                    </strong>
                </div>
            `;

            container.appendChild(
                card
            );
        }
    );

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| GÊNEROS / ESTILOS
|--------------------------------------------------------------------------
*/

function preencherGeneros(
    generos
) {
    const container =
        document.getElementById(
            "genreList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !generos ||
        !generos.length
    ) {
        container.innerHTML = `
            <span class="empty-inline">
                Nenhum estilo informado.
            </span>
        `;

        return;
    }

    generos.forEach(
        (genero) => {
            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "genre-tag";

            tag.textContent =
                genero;

            container.appendChild(
                tag
            );
        }
    );
}

/*
|--------------------------------------------------------------------------
| SERVIÇOS
|--------------------------------------------------------------------------
*/

function preencherServicos(
    servicos
) {
    const container =
        document.getElementById(
            "servicesList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !servicos ||
        !servicos.length
    ) {
        container.innerHTML = `
            <div class="empty-inline">
                Nenhum serviço informado.
            </div>
        `;

        return;
    }

    servicos.forEach(
        (servico) => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "service-card";

            card.innerHTML = `
                <div class="service-icon">
                    <i data-lucide="briefcase"></i>
                </div>

                <div class="service-info">
                    <strong>
                        ${escaparHtml(
                            servico
                        )}
                    </strong>
                </div>
            `;

            container.appendChild(
                card
            );
        }
    );

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| PORTFÓLIO
|--------------------------------------------------------------------------
*/

function preencherPortfolio(portfolio) {
    const container =
        document.getElementById(
            "portfolioGrid"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !portfolio ||
        !portfolio.length
    ) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="images"></i>

                <h3>
                    Nenhum trabalho no portfólio
                </h3>

                <p>
                    Os trabalhos adicionados pelo músico
                    aparecerão aqui.
                </p>
            </div>
        `;

        atualizarIcones();

        return;
    }

    portfolio.forEach((item) => {
    const card = document.createElement("div");

    card.className = "portfolio-card";

    const destaqueCatalogo =
        item.destaque_catalogo === true ||
        String(item.destaque_catalogo)
            .trim()
            .toLowerCase() === "true";

    if (destaqueCatalogo) {
        card.classList.add("portfolio-card-destaque");
    }

    const titulo =
        item.titulo ||
        "Trabalho";

    const descricao =
        item.descricao ||
        "";

    const url =
        item.arquivo_url ||
        "";

    if (!url) {
        return;
    }

    card.innerHTML = `
        <img
            src="${escaparAtributo(url)}"
            alt="${escaparAtributo(titulo)}"
            loading="lazy"
        >

        ${
            destaqueCatalogo
                ? `
                    <div
                        class="portfolio-destaque-badge"
                        aria-label="Destaque no catálogo"
                    >
                        <i data-lucide="star"></i>

                        <span>
                            Destaque no catálogo
                        </span>
                    </div>
                `
                : ""
        }

        <div class="portfolio-card-overlay">
            <div class="portfolio-card-title">
                ${escaparHtml(titulo)}
            </div>

            ${
                descricao
                    ? `
                        <div class="portfolio-card-subtitle">
                            ${escaparHtml(descricao)}
                        </div>
                    `
                    : ""
            }
        </div>
    `;

    container.appendChild(card);
});

    atualizarIcones();
    console.log("PORTFOLIO RECEBIDO:", portfolio);
}
/*
|--------------------------------------------------------------------------
| VÍDEOS
|--------------------------------------------------------------------------
*/

function preencherVideos(
    videos
) {
    const container =
        document.getElementById(
            "videoList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !videos ||
        !videos.length
    ) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="video"></i>

                <h3>
                    Nenhum vídeo
                </h3>

                <p>
                    Os vídeos adicionados ao portfólio
                    aparecerão aqui.
                </p>
            </div>
        `;

        atualizarIcones();

        return;
    }

    videos.forEach(
        (video) => {
            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "video-item";

            const destaqueCatalogo =
                video.destaque_catalogo === true ||
                String(
                    video.destaque_catalogo
                )
                    .trim()
                    .toLowerCase() === "true";

            if (
                destaqueCatalogo
            ) {
                item.classList.add(
                    "video-item-destaque"
                );
            }

            item.innerHTML = `
                <div class="video-portfolio">

                    ${
                        destaqueCatalogo
                            ? `
                                <div
                                    class="portfolio-destaque-badge"
                                    aria-label="Destaque no catálogo"
                                >
                                    <i data-lucide="star"></i>

                                    <span>
                                        Destaque no catálogo
                                    </span>
                                </div>
                            `
                            : ""
                    }

                    <video
                        src="${escaparAtributo(
                            video.arquivo_url
                        )}"
                        controls
                        preload="metadata"
                    ></video>

                </div>

                <div>
                    <strong>
                        ${escaparHtml(
                            video.titulo ||
                            "Vídeo"
                        )}
                    </strong>

                    ${
                        video.descricao
                            ? `
                                <p>
                                    ${escaparHtml(
                                        video.descricao
                                    )}
                                </p>
                            `
                            : ""
                    }
                </div>
            `;

            container.appendChild(
                item
            );
        }
    );

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| ÁUDIOS
|--------------------------------------------------------------------------
*/

function preencherAudios(
    audios
) {
    const container =
        document.getElementById(
            "audioList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !audios ||
        !audios.length
    ) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="headphones"></i>

                <h3>
                    Nenhum áudio
                </h3>

                <p>
                    Os áudios adicionados ao portfólio
                    aparecerão aqui.
                </p>
            </div>
        `;

        atualizarIcones();

        return;
    }

    audios.forEach(
        (audio) => {
            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "audio-card";

            item.innerHTML = `
                <div class="audio-icon">
                    <i data-lucide="music"></i>
                </div>

                <div class="audio-info">
                    <strong>
                        ${escaparHtml(
                            audio.titulo ||
                            "Áudio"
                        )}
                    </strong>

                    ${
                        audio.descricao
                            ? `
                                <span>
                                    ${escaparHtml(
                                        audio.descricao
                                    )}
                                </span>
                            `
                            : ""
                    }
                </div>

                <audio
                    class="audio-player"
                    controls
                    preload="metadata"
                    src="${escaparAtributo(
                        audio.arquivo_url
                    )}"
                ></audio>
            `;

            container.appendChild(
                item
            );
        }
    );

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| AGENDA
|--------------------------------------------------------------------------
*/

function preencherAgenda(
    agenda
) {
    const container =
        document.getElementById(
            "agendaList"
        );

    if (!container) {
        return;
    }

    if (
        !container.querySelector(
            ".agenda-calendar"
        )
    ) {
        container.innerHTML = `
            <div class="agenda-calendar">

                <div class="agenda-calendar-header">

                    <button
                        type="button"
                        class="agenda-month-button"
                        id="btnAgendaMesAnterior"
                        aria-label="Mês anterior"
                    >
                        <i data-lucide="chevron-left"></i>
                    </button>

                    <strong
                        class="agenda-month-title"
                        id="agendaMesTitulo"
                    ></strong>

                    <button
                        type="button"
                        class="agenda-month-button"
                        id="btnAgendaMesProximo"
                        aria-label="Próximo mês"
                    >
                        <i data-lucide="chevron-right"></i>
                    </button>

                </div>

                <div class="agenda-weekdays">
                    <span>SEG</span>
                    <span>TER</span>
                    <span>QUA</span>
                    <span>QUI</span>
                    <span>SEX</span>
                    <span>SÁB</span>
                    <span>DOM</span>
                </div>

                <div
                    class="agenda-calendar-grid"
                    id="agendaCalendarGrid"
                ></div>

                <div class="agenda-legend">

                    <span class="agenda-legend-item">
                        <span class="agenda-legend-dot disponivel"></span>
                        <span>Disponível</span>
                    </span>

                    <span class="agenda-legend-item">
                        <span class="agenda-legend-dot agendado"></span>
                        <span>Agendado</span>
                    </span>

                    <span class="agenda-legend-item">
                        <span class="agenda-legend-dot indisponivel"></span>
                        <span>Indisponível</span>
                    </span>

                </div>

            </div>
        `;

        inicializarControlesAgenda();
    }

    renderizarCalendarioAgenda(
        Array.isArray(agenda)
            ? agenda
            : []
    );
}

function inicializarControlesAgenda() {
    const anterior =
        document.getElementById(
            "btnAgendaMesAnterior"
        );

    const proximo =
        document.getElementById(
            "btnAgendaMesProximo"
        );

    if (
        anterior &&
        !anterior.dataset.agendaInicializado
    ) {
        anterior.dataset.agendaInicializado =
            "true";

        anterior.addEventListener(
            "click",
            () => {
                agendaMesAtual =
                    new Date(
                        agendaMesAtual.getFullYear(),
                        agendaMesAtual.getMonth() - 1,
                        1
                    );

                renderizarCalendarioAgenda(
                    dadosPerfil?.agenda || []
                );
            }
        );
    }

    if (
        proximo &&
        !proximo.dataset.agendaInicializado
    ) {
        proximo.dataset.agendaInicializado =
            "true";

        proximo.addEventListener(
            "click",
            () => {
                agendaMesAtual =
                    new Date(
                        agendaMesAtual.getFullYear(),
                        agendaMesAtual.getMonth() + 1,
                        1
                    );

                renderizarCalendarioAgenda(
                    dadosPerfil?.agenda || []
                );
            }
        );
    }
}

function renderizarCalendarioAgenda(
    agenda
) {
    const titulo =
        document.getElementById(
            "agendaMesTitulo"
        );

    const grid =
        document.getElementById(
            "agendaCalendarGrid"
        );

    if (
        !titulo ||
        !grid
    ) {
        return;
    }

    const ano =
        agendaMesAtual.getFullYear();

    const mes =
        agendaMesAtual.getMonth();

    titulo.textContent =
        agendaMesAtual.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );

    const primeiroDia =
        new Date(
            ano,
            mes,
            1
        );

    const ultimoDia =
        new Date(
            ano,
            mes + 1,
            0
        );

    let diaSemana =
        primeiroDia.getDay();

    /*
    Domingo = 0
    Segunda = 1

    O calendário começa na segunda-feira.
    */

    diaSemana =
        diaSemana === 0
            ? 6
            : diaSemana - 1;

    const quantidadeDias =
        ultimoDia.getDate();

    grid.innerHTML = "";

    /*
    |--------------------------------------------------------------------------
    | ESPAÇOS ANTES DO PRIMEIRO DIA
    |--------------------------------------------------------------------------
    */

    for (
        let i = 0;
        i < diaSemana;
        i++
    ) {
        const vazio =
            document.createElement(
                "div"
            );

        vazio.className =
            "agenda-day outro-mes";

        grid.appendChild(
            vazio
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DIAS DO MÊS
    |--------------------------------------------------------------------------
    */

    for (
        let dia = 1;
        dia <= quantidadeDias;
        dia++
    ) {
        const data =
            new Date(
                ano,
                mes,
                dia
            );

        const estadoDia =
            obterEstadoDiaAgenda(
                data,
                agenda
            );

        const elemento =
            document.createElement(
                "div"
            );

        elemento.className =
            `agenda-day ${estadoDia.classe}`;

        const numero =
            document.createElement(
                "span"
            );

        numero.className =
            "agenda-day-number";

        numero.textContent =
            String(dia);

        elemento.appendChild(
            numero
        );

        if (
            estadoDia.mostrarStatus
        ) {
            const indicador =
                document.createElement(
                    "span"
                );

            indicador.className =
                "agenda-day-status";

            elemento.appendChild(
                indicador
            );
        }

        if (
            estadoDia.hoje
        ) {
            elemento.classList.add(
                "hoje"
            );
        }

        elemento.title =
            estadoDia.label;

        grid.appendChild(
            elemento
        );
    }

    /*
    |--------------------------------------------------------------------------
    | COMPLETAR ÚLTIMA SEMANA
    |--------------------------------------------------------------------------
    */

    const totalCelulas =
        diaSemana +
        quantidadeDias;

    const faltantes =
        (
            7 -
            (
                totalCelulas % 7
            )
        ) % 7;

    for (
        let i = 0;
        i < faltantes;
        i++
    ) {
        const vazio =
            document.createElement(
                "div"
            );

        vazio.className =
            "agenda-day outro-mes";

        grid.appendChild(
            vazio
        );
    }

    atualizarIcones();
}

function obterEstadoDiaAgenda(
    data,
    agenda
) {
    const hoje =
        normalizarData(
            new Date()
        );

    const dataNormalizada =
        normalizarData(
            data
        );

    /*
    |--------------------------------------------------------------------------
    | DATA PASSADA
    |--------------------------------------------------------------------------
    */

    if (
        dataNormalizada < hoje
    ) {
        return {
            classe: "passado",
            label: "Data passada",
            mostrarStatus: false,
            hoje: false
        };
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR COMPROMISSO
    |--------------------------------------------------------------------------
    */

    const agendado =
        existeCompromissoNoDia(
            dataNormalizada,
            agenda
        );

    if (agendado) {
        return {
            classe: "agendado",
            label: "Agendado",
            mostrarStatus: true,
            hoje:
                datasIguais(
                    dataNormalizada,
                    hoje
                )
        };
    }

    /*
    |--------------------------------------------------------------------------
    | INDISPONÍVEL
    |--------------------------------------------------------------------------
    */

    if (
        dadosPerfil?.disponibilidade ===
        false
    ) {
        return {
            classe: "indisponivel",
            label: "Indisponível",
            mostrarStatus: true,
            hoje:
                datasIguais(
                    dataNormalizada,
                    hoje
                )
        };
    }

    /*
    |--------------------------------------------------------------------------
    | DISPONÍVEL
    |--------------------------------------------------------------------------
    */

    return {
        classe: "disponivel",
        label: "Disponível",
        mostrarStatus: true,
        hoje:
            datasIguais(
                dataNormalizada,
                hoje
            )
    };
}

function existeCompromissoNoDia(
    data,
    agenda
) {
    if (
        !Array.isArray(agenda) ||
        !agenda.length
    ) {
        return false;
    }

    return agenda.some(
        (evento) => {
            if (
                !evento?.data_inicio
            ) {
                return false;
            }

            const inicio =
                normalizarData(
                    converterDataEvento(
                        evento.data_inicio
                    )
                );

            const fim =
                evento.data_fim
                    ? normalizarData(
                        converterDataEvento(
                            evento.data_fim
                        )
                    )
                    : inicio;

            if (
                Number.isNaN(
                    inicio.getTime()
                )
            ) {
                return false;
            }

            if (
                Number.isNaN(
                    fim.getTime()
                )
            ) {
                return datasIguais(
                    data,
                    inicio
                );
            }

            return (
                data >= inicio &&
                data <= fim
            );
        }
    );
}

function converterDataEvento(
    valor
) {
    const data =
        new Date(
            valor
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return new Date(
            "invalid"
        );
    }

    return data;
}

function normalizarData(
    data
) {
    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    );
}

function datasIguais(
    primeira,
    segunda
) {
    return (
        primeira.getFullYear() ===
            segunda.getFullYear() &&

        primeira.getMonth() ===
            segunda.getMonth() &&

        primeira.getDate() ===
            segunda.getDate()
    );
}

/*
|--------------------------------------------------------------------------
| AVALIAÇÕES
|--------------------------------------------------------------------------
*/

function preencherAvaliacoes(
    avaliacoes
) {
    const container =
        document.getElementById(
            "reviewsList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !avaliacoes ||
        !avaliacoes.length
    ) {
        container.innerHTML = `
            <div class="empty-reviews">
                <i data-lucide="star"></i>

                <h3>
                    Nenhuma avaliação ainda
                </h3>

                <p>
                    As avaliações recebidas aparecerão aqui.
                </p>
            </div>
        `;

        atualizarIcones();

        return;
    }

    avaliacoes.forEach(
        (avaliacao) => {
            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "review-card";

            const nome =
                avaliacao.usuario?.nome ||
                "Usuário";

            const foto =
                avaliacao.usuario?.foto_url ||
                "";

            const iniciais =
                gerarIniciais(
                    nome
                );

            card.innerHTML = `
                <div class="review-header">
                    <div class="review-avatar">
                        ${
                            foto
                                ? `
                                    <img
                                        src="${escaparAtributo(
                                            foto
                                        )}"
                                        alt="${escaparAtributo(
                                            nome
                                        )}"
                                    >
                                `
                                : `
                                    <span>
                                        ${escaparHtml(
                                            iniciais
                                        )}
                                    </span>
                                `
                        }
                    </div>

                    <div class="review-author">
                        <strong>
                            ${escaparHtml(
                                nome
                            )}
                        </strong>

                        <div class="review-rating">
                            ${gerarEstrelas(
                                Number(
                                    avaliacao.nota ||
                                    0
                                )
                            )}
                        </div>
                    </div>
                </div>

                <p class="review-text">
                    ${escaparHtml(
                        avaliacao.comentario ||
                        "Sem comentário."
                    )}
                </p>
            `;

            container.appendChild(
                card
            );
        }
    );

    atualizarIcones();
}

/*
|--------------------------------------------------------------------------
| CARTEIRA REAL
|--------------------------------------------------------------------------
*/

async function carregarCarteiraReal() {
    const cliente =
        obterSupabase();

    if (
        !cliente ||
        !perfilAtual
    ) {
        preencherCarteiraVazia();
        return;
    }

    try {
        const respostaCarteira =
            await cliente
                .from(
                    CONFIG.tabelas.carteiras
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilAtual.id
                )
                .maybeSingle();

        if (
            respostaCarteira.error
        ) {
            throw respostaCarteira.error;
        }

        carteiraAtual =
            respostaCarteira.data;

        if (!carteiraAtual) {
            console.warn(
                "Nenhuma carteira encontrada para o perfil:",
                perfilAtual.id
            );

            preencherCarteiraVazia();

            return;
        }

        const respostaTransacoes =
            await cliente
                .from(
                    CONFIG.tabelas.transacoes
                )
                .select("*")
                .eq(
                    "carteira_id",
                    carteiraAtual.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (
            respostaTransacoes.error
        ) {
            throw respostaTransacoes.error;
        }

        const transacoes =
            respostaTransacoes.data ||
            [];

        preencherCarteira(
            carteiraAtual,
            transacoes
        );

        try {
            localStorage.setItem(
                CONFIG.carteiraStorageKey,
                JSON.stringify({
                    carteira:
                        carteiraAtual,
                    transacoes
                })
            );

        } catch (erroCache) {
            console.warn(
                "Não foi possível salvar cache da carteira:",
                erroCache
            );
        }

    } catch (erro) {
        console.error(
            "Erro ao carregar carteira:",
            erro
        );

        preencherCarteiraVazia();

        mostrarToast(
            "Não foi possível carregar a carteira.",
            "erro"
        );
    }
}

function preencherCarteira(
    carteira,
    transacoes
) {
    const total =
        Number(
            carteira?.saldo_total ||
            0
        );

    const disponivel =
        Number(
            carteira?.saldo_disponivel ||
            0
        );

    const pendente =
        Number(
            carteira?.saldo_pendente ||
            0
        );

    definirTexto(
        "walletTotal",
        formatarMoeda(total)
    );

    definirTexto(
        "walletAvailable",
        formatarMoeda(disponivel)
    );

    definirTexto(
        "walletPending",
        formatarMoeda(pendente)
    );

    preencherTransacoes(
        transacoes
    );
}

function preencherCarteiraVazia() {
    definirTexto(
        "walletTotal",
        formatarMoeda(0)
    );

    definirTexto(
        "walletAvailable",
        formatarMoeda(0)
    );

    definirTexto(
        "walletPending",
        formatarMoeda(0)
    );

    preencherTransacoes(
        []
    );
}

/*
|--------------------------------------------------------------------------
| TRANSAÇÕES
|--------------------------------------------------------------------------
*/

function preencherTransacoes(
    transacoes
) {
    const container =
        document.getElementById(
            "transactionList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !transacoes ||
        !transacoes.length
    ) {
        container.innerHTML = `
            <div class="empty-transactions">
                <i data-lucide="wallet-cards"></i>

                <h3>
                    Nenhuma movimentação
                </h3>

                <p>
                    Suas movimentações financeiras
                    aparecerão aqui.
                </p>
            </div>
        `;

        atualizarIcones();

        return;
    }

    transacoes.forEach(
        (transacao) => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "transaction-card";

            const valor =
                Number(
                    transacao.valor ||
                    0
                );

            const tipo =
                String(
                    transacao.tipo ||
                    ""
                )
                    .toLowerCase();

            const positivo =
                [
                    "pagamento",
                    "liberacao",
                    "ajuste"
                ].includes(
                    tipo
                );

            const classeValor =
                positivo
                    ? "positive"
                    : "negative";

            const sinal =
                positivo
                    ? "+"
                    : "-";

            const icone =
                obterIconeTransacao(
                    tipo
                );

            card.innerHTML = `
                <div class="transaction-item">

                    <div class="transaction-icon">
                        <i data-lucide="${icone}"></i>
                    </div>

                    <div class="transaction-info">
                        <strong>
                            ${escaparHtml(
                                transacao.descricao ||
                                formatarTipoTransacao(
                                    tipo
                                )
                            )}
                        </strong>

                        <span>
                            ${
                                transacao.created_at
                                    ? formatarData(
                                        transacao.created_at
                                    )
                                    : ""
                            }
                        </span>

                        ${
                            transacao.status
                                ? `
                                    <small>
                                        ${escaparHtml(
                                            formatarStatusTransacao(
                                                transacao.status
                                            )
                                        )}
                                    </small>
                                `
                                : ""
                        }
                    </div>

                    <div class="transaction-value ${classeValor}">
                        ${sinal} ${formatarMoeda(valor)}
                    </div>

                </div>
            `;

            container.appendChild(
                card
            );
        }
    );

    atualizarIcones();
}

function obterIconeTransacao(
    tipo
) {
    switch (tipo) {
        case "pagamento":
            return "arrow-down-left";

        case "liberacao":
            return "circle-check";

        case "saque":
            return "arrow-up-right";

        case "estorno":
            return "rotate-ccw";

        case "comissao":
            return "percent";

        case "ajuste":
            return "sliders-horizontal";

        default:
            return "wallet";
    }
}

function formatarTipoTransacao(
    tipo
) {
    const nomes = {
        pagamento: "Pagamento",
        liberacao: "Pagamento liberado",
        saque: "Saque",
        estorno: "Estorno",
        comissao: "Comissão",
        ajuste: "Ajuste"
    };

    return (
        nomes[tipo] ||
        "Movimentação"
    );
}

function formatarStatusTransacao(
    status
) {
    const nomes = {
        pendente: "Pendente",
        processando: "Processando",
        concluida: "Concluída",
        cancelada: "Cancelada"
    };

    return (
        nomes[status] ||
        status
    );
}

/*
|--------------------------------------------------------------------------
| TABS
|--------------------------------------------------------------------------
*/

function inicializarTabs() {
    const botoes =
        document.querySelectorAll(
            ".tab-button"
        );

    const conteudos =
        document.querySelectorAll(
            ".tab-content"
        );

    if (!botoes.length) {
        return;
    }

    botoes.forEach(
        (botao) => {
            botao.addEventListener(
                "click",
                async () => {
                    const tab =
                        botao.dataset.tab;

                    if (!tab) {
                        return;
                    }

                    botoes.forEach(
                        (item) => {
                            item.classList.toggle(
                                "active",
                                item === botao
                            );
                        }
                    );

                    conteudos.forEach(
                        (conteudo) => {
                            conteudo.classList.toggle(
                                "active",
                                conteudo.id ===
                                `tab-${tab}`
                            );
                        }
                    );

                    if (
                        tab ===
                        "carteira"
                    ) {
                        await carregarCarteiraReal();
                    }

                    atualizarIcones();
                }
            );
        }
    );
}

/*
|--------------------------------------------------------------------------
| BOTÕES
|--------------------------------------------------------------------------
*/

function inicializarBotoes() {

    /*
    |--------------------------------------------------------------------------
    | VISUALIZAR PERFIL
    |--------------------------------------------------------------------------
    */

    const btnVisualizarPerfil =
        document.getElementById(
            "btnVisualizarPerfil"
        );

    if (btnVisualizarPerfil) {
        btnVisualizarPerfil.addEventListener(
            "click",
            () => {

                if (
                    !perfilAtual ||
                    !perfilAtual.id
                ) {
                    mostrarToast(
                        "Não foi possível identificar seu perfil.",
                        "erro"
                    );

                    return;
                }

                const idPerfil =
                    encodeURIComponent(
                        perfilAtual.id
                    );

                window.location.href =
                    `apresentar-perfil-musico.html?id=${idPerfil}`;
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | VOLTAR
    |--------------------------------------------------------------------------
    */

    const btnVoltar =
        document.getElementById(
            "btnVoltar"
        );

    if (btnVoltar) {
        btnVoltar.addEventListener(
            "click",
            () => {
                if (
                    window.history.length >
                    1
                ) {
                    window.history.back();

                } else {
                    window.location.href =
                        "index.html";
                }
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | EDITAR PERFIL
    |--------------------------------------------------------------------------
    */

    const btnEditar =
        document.getElementById(
            "btnEditarPerfil"
        );

    if (btnEditar) {
        btnEditar.addEventListener(
            "click",
            () => {
                window.location.href =
                    "editar-perfil-musico.html";
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | WHATSAPP
    |--------------------------------------------------------------------------
    */

    const btnWhatsApp =
        document.getElementById(
            "btnWhatsApp"
        );

    if (btnWhatsApp) {
        btnWhatsApp.addEventListener(
            "click",
            compartilharWhatsApp
        );
    }

    /*
    |--------------------------------------------------------------------------
    | QR CODE
    |--------------------------------------------------------------------------
    */

    const btnQRCode =
        document.getElementById(
            "btnQRCode"
        );

    if (btnQRCode) {
        btnQRCode.addEventListener(
            "click",
            abrirQRCode
        );
    }

    const btnFecharQR =
        document.getElementById(
            "btnFecharQR"
        );

    if (btnFecharQR) {
        btnFecharQR.addEventListener(
            "click",
            fecharQRCode
        );
    }

    const overlay =
        document.getElementById(
            "qrOverlay"
        );

    if (overlay) {
        overlay.addEventListener(
            "click",
            (evento) => {
                if (
                    evento.target ===
                    overlay
                ) {
                    fecharQRCode();
                }
            }
        );
    }

    const btnCompartilharQR =
        document.getElementById(
            "btnCompartilharQR"
        );

    if (btnCompartilharQR) {
        btnCompartilharQR.addEventListener(
            "click",
            compartilharQRCode
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SAQUE
    |--------------------------------------------------------------------------
    */

    const btnSacar =
        document.getElementById(
            "btnSacar"
        );

    if (btnSacar) {
        btnSacar.addEventListener(
            "click",
            solicitarSaque
        );
    }
}

/*
|--------------------------------------------------------------------------
| CONTATO
|--------------------------------------------------------------------------
*/

function atualizarBotoesContato(
    dados
) {
    const btnWhatsApp =
        document.getElementById(
            "btnWhatsApp"
        );

    if (!btnWhatsApp) {
        return;
    }

    const telefone =
        normalizarTelefone(
            dados.telefone
        );

    if (!telefone) {
        btnWhatsApp.style.display =
            "none";

        return;
    }

    btnWhatsApp.style.display =
        "inline-flex";
}

function compartilharWhatsApp() {
    if (!dadosPerfil) {
        return;
    }

    const telefone =
        normalizarTelefone(
            dadosPerfil.telefone
        );

    if (!telefone) {
        mostrarToast(
            "Telefone não informado.",
            "erro"
        );

        return;
    }

    const urlPerfil =
        `${window.location.origin}/perfil-musico.html?id=${encodeURIComponent(
            perfilAtual?.id || ""
        )}`;

    const mensagem =
        `Olá! Encontrei o perfil de ${dadosPerfil.nome} no MusicalWorld. ${urlPerfil}`;

    const url =
        `https://wa.me/${telefone}?text=${encodeURIComponent(
            mensagem
        )}`;

    window.open(
        url,
        "_blank"
    );
}

/*
|--------------------------------------------------------------------------
| QR CODE
|--------------------------------------------------------------------------
*/

function abrirQRCode() {
    const overlay =
        document.getElementById(
            "qrOverlay"
        );

    const imagem =
        document.getElementById(
            "qrImage"
        );

    const link =
        document.getElementById(
            "profileLink"
        );

    if (!overlay) {
        return;
    }

    const url =
        `${window.location.origin}${window.location.pathname.substring(
            0,
            window.location.pathname.lastIndexOf("/")
        )}/apresentar-perfil-musico.html?id=${encodeURIComponent(
            perfilAtual?.id || ""
        )}`;

    if (link) {
        link.textContent =
            url;
    }

    if (imagem) {
        imagem.src =
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                url
            )}`;
    }

    overlay.classList.add(
        "active"
    );
}

function fecharQRCode() {
    const overlay =
        document.getElementById(
            "qrOverlay"
        );

    if (overlay) {
        overlay.classList.remove(
            "active"
        );
    }
}

async function compartilharQRCode() {
    const url =
        `${window.location.origin}${window.location.pathname.substring(
            0,
            window.location.pathname.lastIndexOf("/")
        )}/apresentar-perfil-musico.html?id=${encodeURIComponent(
            perfilAtual?.id || ""
        )}`;

    if (
        navigator.share
    ) {
        try {
            await navigator.share({
                title:
                    `Perfil de ${dadosPerfil?.nome || "Músico"}`,
                text:
                    "Confira meu perfil no MusicalWorld.",
                url
            });

            return;

        } catch (erro) {
            if (
                erro?.name ===
                "AbortError"
            ) {
                return;
            }
        }
    }

    try {
        await navigator.clipboard.writeText(
            url
        );

        mostrarToast(
            "Link do perfil copiado."
        );

    } catch (erro) {
        mostrarToast(
            "Não foi possível copiar o link.",
            "erro"
        );
    }
}

/*
|--------------------------------------------------------------------------
| SAQUE
|--------------------------------------------------------------------------
*/

function solicitarSaque() {
    const disponivel =
        Number(
            carteiraAtual?.saldo_disponivel ||
            0
        );

    if (disponivel <= 0) {
        mostrarToast(
            "Você não possui saldo disponível para saque."
        );

        return;
    }

    mostrarToast(
        "O sistema de saque será disponibilizado nesta etapa."
    );
}

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalizarArray(
    valor
) {
    if (Array.isArray(valor)) {
        return valor
            .map(
                (item) =>
                    String(
                        item || ""
                    ).trim()
            )
            .filter(Boolean);
    }

    if (
        typeof valor ===
        "string"
    ) {
        return valor
            .split(",")
            .map(
                (item) =>
                    item.trim()
            )
            .filter(Boolean);
    }

    return [];
}

function normalizarTelefone(
    telefone
) {
    if (!telefone) {
        return "";
    }

    let numero =
        String(
            telefone
        ).replace(
            /\D/g,
            ""
        );

    if (!numero) {
        return "";
    }

    if (
        numero.length === 10 ||
        numero.length === 11
    ) {
        numero =
            "55" +
            numero;
    }

    return numero;
}

function definirTexto(
    id,
    texto
) {
    const elemento =
        document.getElementById(
            id
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        texto ?? "";
}

function formatarMoeda(
    valor
) {
    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(
            valor || 0
        )
    );
}

function formatarData(
    valor
) {
    const data =
        valor instanceof Date
            ? valor
            : new Date(
                valor
            );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "";
    }

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function formatarDia(
    data
) {
    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit"
        }
    );
}

function formatarMes(
    data
) {
    return data
        .toLocaleDateString(
            "pt-BR",
            {
                month: "short"
            }
        )
        .replace(
            ".",
            ""
        );
}

function formatarHorario(
    inicio,
    fim
) {
    const horarioInicio =
        inicio.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    if (!fim) {
        return horarioInicio;
    }

    const horarioFim =
        fim.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    return `${horarioInicio} - ${horarioFim}`;
}

function gerarIniciais(
    nome
) {
    const partes =
        String(
            nome || ""
        )
            .trim()
            .split(
                /\s+/
            )
            .filter(Boolean);

    if (
        !partes.length
    ) {
        return "MW";
    }

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

function escaparHtml(
    valor
) {
    return String(
        valor ?? ""
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

function escaparAtributo(
    valor
) {
    return escaparHtml(
        valor
    );
}

function atualizarIcones() {
    if (
        typeof lucide !==
            "undefined" &&
        typeof lucide.createIcons ===
            "function"
    ) {
        lucide.createIcons();
    }
}

function mostrarToast(
    mensagem,
    tipo = "sucesso"
) {
    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {
        return;
    }

    toast.textContent =
        mensagem;

    toast.className =
        "toast";

    if (
        tipo ===
        "erro"
    ) {
        toast.classList.add(
            "erro"
        );
    }

    requestAnimationFrame(
        () => {
            toast.classList.add(
                "show"
            );
        }
    );

    clearTimeout(
        mostrarToast.timer
    );

    mostrarToast.timer =
        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            3500
        );
}

function redirecionarLogin() {
    window.location.href =
        "login.html";
}

/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO DO DOM
|--------------------------------------------------------------------------
*/

document.addEventListener(
    "DOMContentLoaded",
    inicializar
);

/*
|--------------------------------------------------------------------------
| API PÚBLICA
|--------------------------------------------------------------------------
*/

return {
    inicializar,
    carregarDoSupabase,
    carregarCarteiraReal,
    preencherPerfil
};


})();
