const MusicalWorldMeuPerfilMusico = (() => {


const CONFIG = {

    usarSupabase: true,

    tabelaUsuarios: "usuarios",
    tabelaPerfis: "perfis",
    tabelaTiposPerfil: "tipos_perfil",

    storageKey: "musicalworld_perfil_musico",
    carteiraStorageKey: "musicalworld_carteira_musico",

    tipoPerfilEsperado: "artista"

};


const carteiraDemo = {

    saldoDisponivel: 0,
    saldoReceber: 0,
    totalRecebido: 0,
    transacoes: []

};


let usuarioAtual = null;
let perfilAtual = null;
let dadosPerfil = null;


/*
 * =========================================================
 * INICIALIZAÇÃO
 * =========================================================
 */

async function inicializar() {

    try {

        console.log(
            "🎸 Inicializando Meu Perfil de Músico..."
        );


        if (
            typeof ControleSessao === "undefined"
        ) {

            console.error(
                "❌ ControleSessao não está disponível."
            );

            redirecionarLogin();

            return;

        }


        const usuarioSessao =
            await ControleSessao.iniciar({

                exigirLogin: true,

                redirecionarPara:
                    "login.html"

            });


        if (!usuarioSessao) {

            console.warn(
                "🔒 Usuário não autenticado."
            );

            return;

        }


        /*
         * Verifica se o usuário possui o tipo
         * de perfil ARTISTA.
         *
         * No MusicalWorld, músicos e cantores
         * pertencem ao mesmo tipo "artista".
         */

        const autorizado =
            await verificarAcessoMusico();


        if (!autorizado) {

            return;

        }


        /*
         * Carrega os dados reais.
         */

        if (CONFIG.usarSupabase) {

            const dados =
                await carregarDoSupabase();


            if (dados) {

                dadosPerfil =
                    dados;


                preencherPerfil(
                    dados.perfil
                );

            }

        }


        /*
         * Carteira ainda é demonstrativa.
         */

        preencherCarteira();


        inicializarTabs();

        inicializarBotoes();

        atualizarIcones();


        console.log(
            "✅ Meu Perfil de Músico carregado."
        );


    } catch (error) {

        console.error(
            "❌ Erro ao inicializar Meu Perfil de Músico:",
            error
        );


        mostrarToast(
            "Não foi possível carregar seu perfil."
        );

    }

}


/*
 * =========================================================
 * VERIFICAÇÃO DE ACESSO
 * =========================================================
 *
 * Músicos utilizam o tipo de perfil "artista".
 */

async function verificarAcessoMusico() {

    try {

        const dados =
            await carregarDadosUsuario();


        if (!dados) {

            console.error(
                "❌ Não foi possível identificar o usuário."
            );

            redirecionarLogin();

            return false;

        }


        usuarioAtual =
            dados.usuario;


        perfilAtual =
            dados.perfil;


        const tipoPerfil =
            dados.tipoPerfil;


        console.log(
            "👤 Usuário:",
            usuarioAtual
        );


        console.log(
            "🎭 Tipo de perfil:",
            tipoPerfil
        );


        if (!perfilAtual) {

            console.warn(
                "⚠️ Usuário não possui perfil cadastrado."
            );


            mostrarToast(
                "Seu perfil ainda não foi configurado."
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


            return false;

        }


        const nomeTipo =
            String(
                tipoPerfil?.nome || ""
            )
            .trim()
            .toLowerCase();


        /*
         * IMPORTANTE:
         *
         * O banco não possui "musico".
         *
         * O tipo "artista" inclui:
         * cantores, músicos, instrumentistas,
         * DJs, bandas, duplas e grupos musicais.
         */

        if (
            nomeTipo !==
            CONFIG.tipoPerfilEsperado
        ) {

            console.warn(
                "🚫 Acesso negado. Tipo de perfil:",
                nomeTipo
            );


            mostrarToast(
                "Esta área é exclusiva para artistas e músicos."
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1600);


            return false;

        }


        console.log(
            "✅ Acesso autorizado para perfil musical."
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Erro ao verificar acesso:",
            error
        );


        redirecionarLogin();

        return false;

    }

}


/*
 * =========================================================
 * CARREGAR DADOS DO USUÁRIO
 * =========================================================
 */

async function carregarDadosUsuario() {

    if (
        typeof supabaseClient === "undefined"
    ) {

        console.error(
            "❌ supabaseClient não está disponível."
        );

        return null;

    }


    const {
        data: {
            user
        },
        error: erroSessao
    } =
        await supabaseClient.auth.getUser();


    if (erroSessao) {

        console.error(
            "❌ Erro ao obter usuário autenticado:",
            erroSessao
        );

        return null;

    }


    if (!user) {

        return null;

    }


    /*
     * Usuário.
     */

    const {
        data: usuario,
        error: erroUsuario
    } =
        await supabaseClient
            .from(CONFIG.tabelaUsuarios)
            .select("*")
            .eq("id", user.id)
            .maybeSingle();


    if (erroUsuario) {

        console.error(
            "❌ Erro ao carregar usuarios:",
            erroUsuario
        );

        throw erroUsuario;

    }


    if (!usuario) {

        console.error(
            "❌ Registro do usuário não encontrado em usuarios."
        );

        return null;

    }


    /*
     * Perfil.
     *
     * Aqui filtramos explicitamente o tipo "artista".
     *
     * Isso é importante porque no futuro um usuário
     * poderá possuir outros tipos de perfil.
     */

    const {
        data: perfis,
        error: erroPerfil
    } =
        await supabaseClient
            .from(CONFIG.tabelaPerfis)
            .select(`
                id,
                usuario_id,
                tipo_perfil_id,
                nome_exibicao,
                descricao,
                ativo,
                created_at,
                updated_at,
                tipos_perfil (
                    id,
                    nome,
                    descricao,
                    ativo
                )
            `)
            .eq(
                "usuario_id",
                user.id
            )
            .eq(
                "ativo",
                true
            );


    if (erroPerfil) {

        console.error(
            "❌ Erro ao carregar perfis:",
            erroPerfil
        );

        throw erroPerfil;

    }


    /*
     * Localiza especificamente o perfil artista.
     */

    const perfil =
        (perfis || []).find(
            item =>
                String(
                    item?.tipos_perfil?.nome || ""
                )
                .trim()
                .toLowerCase() ===
                "artista"
        ) || null;


    if (!perfil) {

        return {

            usuario,

            perfil: null,

            tipoPerfil: null

        };

    }


    return {

        usuario,

        perfil,

        tipoPerfil:
            perfil.tipos_perfil || null

    };

}


/*
 * =========================================================
 * CARREGAR PERFIL DO SUPABASE
 * =========================================================
 */

async function carregarDoSupabase() {

    const dados =
        await carregarDadosUsuario();


    if (!dados) {

        return null;

    }


    usuarioAtual =
        dados.usuario;


    perfilAtual =
        dados.perfil;


    const usuario =
        dados.usuario || {};


    const perfil =
        dados.perfil || {};


    const tipoPerfil =
        dados.tipoPerfil || {};


    /*
     * Nome principal.
     */

    const nome =
        perfil.nome_exibicao ||
        usuario.nome ||
        "Músico";


    /*
     * Descrição.
     */

    const descricao =
        perfil.descricao ||
        "Adicione uma descrição ao seu perfil.";


    /*
     * Dados que a interface já consegue utilizar.
     *
     * Os campos específicos do músico ficam preparados
     * para futuras tabelas.
     */

    const dadosFormatados = {

        id:
            perfil.id || null,

        usuarioId:
            usuario.id || null,

        nome,

        iniciais:
            gerarIniciais(nome),

        categoria:
            "Músico / Instrumentista",

        tipoPerfil:
            tipoPerfil.nome ||
            "artista",

        localizacao:
            "Localização não informada",

        fotoUrl:
            usuario.foto_url || "",

        avaliacao:
            0,

        avaliacoes:
            0,

        verificado:
            false,

        disponivel:
            true,

        /*
         * Dados específicos do músico.
         */

        instrumentos:
            [],

        generos:
            [],

        estilos:
            [],

        experiencia:
            "Não informada",

        areaAtendimento:
            "Não informada",

        bio:
            descricao,

        servicos:
            [],

        portfolio:
            [],

        videos:
            [],

        audios:
            [],

        agenda:
            [],

        avaliacoesLista:
            []

    };


    salvarPerfilLocal(
        dadosFormatados
    );


    return {

        usuario,

        perfil:
            dadosFormatados,

        tipoPerfil

    };

}


/*
 * =========================================================
 * PERFIL LOCAL
 * =========================================================
 */

function obterPerfilLocal() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.storageKey
            );


        if (!dados) {

            const nome =
                perfilAtual?.nome_exibicao ||
                usuarioAtual?.nome ||
                "Músico";


            return {

                id:
                    perfilAtual?.id ||
                    null,

                usuarioId:
                    usuarioAtual?.id ||
                    null,

                nome,

                iniciais:
                    gerarIniciais(nome),

                categoria:
                    "Músico / Instrumentista",

                localizacao:
                    "Localização não informada",

                avaliacao:
                    0,

                avaliacoes:
                    0,

                verificado:
                    false,

                disponivel:
                    true,

                instrumentos:
                    [],

                generos:
                    [],

                estilos:
                    [],

                experiencia:
                    "Não informada",

                areaAtendimento:
                    "Não informada",

                bio:
                    perfilAtual?.descricao ||
                    "Adicione uma descrição ao seu perfil.",

                servicos:
                    [],

                portfolio:
                    [],

                videos:
                    [],

                audios:
                    [],

                agenda:
                    [],

                avaliacoesLista:
                    []

            };

        }


        return JSON.parse(dados);


    } catch (error) {

        console.warn(
            "⚠️ Não foi possível carregar perfil local.",
            error
        );


        return {

            nome:
                usuarioAtual?.nome ||
                "Músico",

            iniciais:
                gerarIniciais(
                    usuarioAtual?.nome ||
                    "Músico"
                ),

            categoria:
                "Músico / Instrumentista",

            localizacao:
                "Localização não informada",

            avaliacao:
                0,

            avaliacoes:
                0,

            verificado:
                false,

            disponivel:
                true,

            instrumentos:
                [],

            generos:
                [],

            estilos:
                [],

            experiencia:
                "Não informada",

            areaAtendimento:
                "Não informada",

            bio:
                "Adicione uma descrição ao seu perfil.",

            servicos:
                [],

            portfolio:
                [],

            videos:
                [],

            audios:
                [],

            agenda:
                [],

            avaliacoesLista:
                []

        };

    }

}


function salvarPerfilLocal(perfil) {

    try {

        localStorage.setItem(
            CONFIG.storageKey,
            JSON.stringify(perfil)
        );

    } catch (error) {

        console.error(
            "❌ Erro ao salvar perfil local.",
            error
        );

    }

}


/*
 * =========================================================
 * PREENCHER PERFIL
 * =========================================================
 */

function preencherPerfil(perfil) {


if (!perfil) {
    return;
}


/*
 * Nome
 */

definirTexto(
    "profileName",
    perfil.nome || "Músico"
);


/*
 * Iniciais
 */

definirTexto(
    "profileInitials",
    perfil.iniciais ||
    gerarIniciais(perfil.nome)
);


/*
 * Categoria
 */

definirTexto(
    "profileCategory",
    perfil.categoria ||
    "Músico / Instrumentista"
);


/*
 * Localização
 */

const locationElement =
    document.getElementById(
        "profileLocation"
    );

if (locationElement) {

    const locationText =
        locationElement.querySelector(
            "span"
        );

    if (locationText) {

        locationText.textContent =
            perfil.localizacao ||
            "Localização não informada";

    }

}


/*
 * Avaliação
 */

definirTexto(
    "ratingValue",
    Number(
        perfil.avaliacao || 0
    ).toFixed(1)
);


/*
 * Avaliações
 */

definirTexto(
    "ratingReviews",
    `(${perfil.avaliacoes || 0} avaliações)`
);


/*
 * Biografia
 */

definirTexto(
    "profileBio",
    perfil.bio ||
    "Adicione uma descrição ao seu perfil."
);


/*
 * Experiência
 */

definirTexto(
    "profileExperience",
    perfil.experiencia ||
    "Não informada"
);


/*
 * Área de atuação
 */

definirTexto(
    "profileArea",
    perfil.areaAtendimento ||
    "Não informada"
);


/*
 * Tipo de perfil
 */

definirTexto(
    "profileType",
    perfil.tipoPerfil ||
    "Artista"
);


/*
 * Status

 */

definirTexto(
    "profileAvailability",
    perfil.disponivel
        ? "Disponível"
        : "Indisponível"
);


/*
 * Status principal do perfil
 */

definirTexto(
    "profileStatus",
    perfil.disponivel
        ? "Disponível para contratação"
        : "Indisponível para contratação"
);


/*
 * Foto
 */

preencherAvatar(
    perfil
);


/*
 * Badge de verificação
 */

const verifiedBadge =
    document.getElementById(
        "verifiedBadge"
    );

if (verifiedBadge) {

    verifiedBadge.style.display =
        perfil.verificado
            ? "flex"
            : "none";

}


/*
 * Instrumentos
 */

preencherInstrumentos(
    perfil.instrumentos
);


/*
 * Gêneros musicais
 */

preencherEstilos(
    perfil.estilos?.length
        ? perfil.estilos
        : perfil.generos
);


/*
 * Serviços
 */

preencherServicos(
    perfil.servicos
);


/*
 * Portfólio
 */

preencherPortfolio(
    perfil.portfolio
);


/*
 * Vídeos
 */

preencherVideos(
    perfil.videos
);


/*
 * Áudios
 */

preencherAudios(
    perfil.audios
);


/*
 * Agenda
 */

preencherAgenda(
    perfil.agenda
);


/*
 * Avaliações
 */

preencherAvaliacoes(
    perfil.avaliacoesLista
);


atualizarIcones();


}



/*
 * =========================================================
 * AVATAR
 * =========================================================
 */

function preencherAvatar(perfil) {

    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    const iniciais =
        document.getElementById(
            "profileInitials"
        );


    if (!avatar) {

        return;

    }


    if (perfil.fotoUrl) {

        avatar.style.backgroundImage =
            `url("${perfil.fotoUrl}")`;

        avatar.style.backgroundSize =
            "cover";

        avatar.style.backgroundPosition =
            "center";

        avatar.style.backgroundRepeat =
            "no-repeat";


        if (iniciais) {

            iniciais.style.display =
                "none";

        }

    } else {

        avatar.style.backgroundImage =
            "";


        if (iniciais) {

            iniciais.style.display =
                "flex";

        }

    }

}


/*
 * =========================================================
 * INSTRUMENTOS
 * =========================================================
 */

function preencherInstrumentos(instrumentos) {

    const container =
        document.getElementById(
            "instrumentList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(instrumentos) ||
        instrumentos.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="music-2"></i>

                <strong>
                    Nenhum instrumento informado
                </strong>

                <span>
                    Adicione seus instrumentos no seu perfil.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    instrumentos.forEach(
        instrumento => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "instrument-card";


            const nome =
                typeof instrumento ===
                "string"
                    ? instrumento
                    : instrumento.nome;


            const nivel =
                typeof instrumento ===
                "object"
                    ? instrumento.nivel || ""
                    : "";


            card.innerHTML = `

                <div class="instrument-icon">

                    <i data-lucide="music"></i>

                </div>

                <div class="instrument-info">

                    <strong>
                        ${escaparHtml(nome)}
                    </strong>

                    ${
                        nivel
                            ? `
                                <span>
                                    ${escaparHtml(nivel)}
                                </span>
                            `
                            : ""
                    }

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
 * =========================================================
 * ESTILOS / GÊNEROS
 * =========================================================
 */

function preencherEstilos(estilos) {

    const container =
        document.getElementById(
            "genreList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(estilos) ||
        estilos.length === 0
    ) {

        const tag =
            document.createElement(
                "span"
            );


        tag.className =
            "genre-tag";


        tag.textContent =
            "Estilos não informados";


        container.appendChild(
            tag
        );


        return;

    }


    estilos.forEach(
        estilo => {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "genre-tag";


            tag.textContent =
                typeof estilo ===
                "string"
                    ? estilo
                    : estilo.nome || "";


            container.appendChild(
                tag
            );

        }
    );

}


/*
 * =========================================================
 * SERVIÇOS
 * =========================================================
 */

function preencherServicos(servicos) {

    const container =
        document.getElementById(
            "servicesList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(servicos) ||
        servicos.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-transactions">

                <i data-lucide="music-2"></i>

                <strong>
                    Nenhum serviço cadastrado
                </strong>

                <span>
                    Adicione seus serviços no seu perfil.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    servicos.forEach(
        (servico, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "service-card";


            card.innerHTML = `

                <div class="service-icon">

                    <i data-lucide="${
                        index % 2 === 0
                            ? "music"
                            : "users"
                    }"></i>

                </div>

                <div class="service-info">

                    <strong>
                        ${escaparHtml(
                            servico.nome ||
                            "Serviço musical"
                        )}
                    </strong>

                    <span>
                        ${escaparHtml(
                            servico.duracao ||
                            ""
                        )}
                    </span>

                    <small>
                        ${escaparHtml(
                            servico.descricao ||
                            ""
                        )}
                    </small>

                </div>

                <div class="service-price">

                    ${formatarMoeda(
                        servico.preco
                    )}

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
 * =========================================================
 * PORTFÓLIO
 * =========================================================
 */

function preencherPortfolio(portfolio) {

    const container =
        document.getElementById(
            "portfolioGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(portfolio) ||
        portfolio.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="images"></i>

                <strong>
                    Portfólio vazio
                </strong>

                <span>
                    Seus trabalhos e apresentações aparecerão aqui.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    portfolio.forEach(
        item => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "portfolio-card";


            card.innerHTML = `

                ${
                    item.imagem
                        ? `
                            <img
                                src="${escaparHtml(
                                    item.imagem
                                )}"
                                alt="${escaparHtml(
                                    item.titulo ||
                                    "Trabalho musical"
                                )}"
                            >
                        `
                        : `
                            <div class="empty-state">
                                <i data-lucide="music"></i>
                            </div>
                        `
                }

                <div class="portfolio-card-overlay">

                    <div class="portfolio-card-title">
                        ${escaparHtml(
                            item.titulo ||
                            "Trabalho musical"
                        )}
                    </div>

                    ${
                        item.descricao
                            ? `
                                <div class="portfolio-card-subtitle">
                                    ${escaparHtml(
                                        item.descricao
                                    )}
                                </div>
                            `
                            : ""
                    }

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
 * =========================================================
 * VÍDEOS
 * =========================================================
 */

function preencherVideos(videos) {

    const container =
        document.getElementById(
            "videoPortfolio"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(videos) ||
        videos.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="video"></i>

                <strong>
                    Nenhum vídeo no portfólio
                </strong>

                <span>
                    Adicione vídeos das suas apresentações.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    videos.forEach(
        video => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "video-portfolio";


            wrapper.innerHTML = `

                <video
                    controls
                    preload="metadata"
                    src="${escaparHtml(
                        video.url || ""
                    )}"
                ></video>

            `;


            container.appendChild(
                wrapper
            );

        }
    );

}


/*
 * =========================================================
 * ÁUDIOS
 * =========================================================
 */

function preencherAudios(audios) {

    const container =
        document.getElementById(
            "audioList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(audios) ||
        audios.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="headphones"></i>

                <strong>
                    Nenhum áudio cadastrado
                </strong>

                <span>
                    Suas gravações aparecerão aqui.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    audios.forEach(
        audio => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "audio-card";


            card.innerHTML = `

                <div class="audio-icon">

                    <i data-lucide="music-2"></i>

                </div>

                <div class="audio-info">

                    <strong>
                        ${escaparHtml(
                            audio.titulo ||
                            "Gravação musical"
                        )}
                    </strong>

                    <span>
                        ${escaparHtml(
                            audio.descricao ||
                            ""
                        )}
                    </span>

                    <audio
                        class="audio-player"
                        controls
                        preload="none"
                        src="${escaparHtml(
                            audio.url || ""
                        )}"
                    ></audio>

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
 * =========================================================
 * AGENDA
 * =========================================================
 */

function preencherAgenda(agenda) {

    const container =
        document.getElementById(
            "agendaList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(agenda) ||
        agenda.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i data-lucide="calendar-days"></i>

                <strong>
                    Nenhum compromisso na agenda
                </strong>

                <span>
                    Seus próximos eventos aparecerão aqui.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    agenda.forEach(
        evento => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "agenda-card";


            const data =
                evento.data
                    ? new Date(
                        evento.data
                    )
                    : null;


            const dia =
                data &&
                !isNaN(data.getTime())
                    ? String(
                        data.getDate()
                    ).padStart(2, "0")
                    : "--";


            const mes =
                data &&
                !isNaN(data.getTime())
                    ? data.toLocaleDateString(
                        "pt-BR",
                        {
                            month: "short"
                        }
                    )
                    : "---";


            card.innerHTML = `

                <div class="agenda-date">

                    <strong>
                        ${dia}
                    </strong>

                    <span>
                        ${mes}
                    </span>

                </div>

                <div class="agenda-info">

                    <strong>
                        ${escaparHtml(
                            evento.titulo ||
                            "Evento"
                        )}
                    </strong>

                    <span>
                        ${escaparHtml(
                            evento.local ||
                            "Local não informado"
                        )}
                    </span>

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
 * =========================================================
 * AVALIAÇÕES
 * =========================================================
 */

function preencherAvaliacoes(avaliacoes) {

    const container =
        document.getElementById(
            "reviewsList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        !Array.isArray(avaliacoes) ||
        avaliacoes.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-reviews">

                <i data-lucide="star"></i>

                <strong>
                    Nenhuma avaliação ainda
                </strong>

                <span>
                    As avaliações recebidas pelos seus trabalhos
                    aparecerão aqui.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    avaliacoes.forEach(
        avaliacao => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "review-card";


            const nota =
                Math.max(
                    0,
                    Math.min(
                        5,
                        Number(
                            avaliacao.nota
                        ) || 0
                    )
                );


            const estrelas =
                Array.from(
                    {
                        length: 5
                    },
                    (_, index) =>
                        `
                            <i
                                data-lucide="${
                                    index < nota
                                        ? "star"
                                        : "star"
                                }"
                            ></i>
                        `
                ).join("");


            card.innerHTML = `

                <div class="review-header">

                    <div class="review-avatar">

                        ${escaparHtml(
                            gerarIniciais(
                                avaliacao.nome ||
                                "Usuário"
                            )
                        )}

                    </div>

                    <div class="review-author">

                        <strong>
                            ${escaparHtml(
                                avaliacao.nome ||
                                "Usuário"
                            )}
                        </strong>

                        <span>
                            ${escaparHtml(
                                avaliacao.data ||
                                ""
                            )}
                        </span>

                    </div>

                    <div class="review-rating">

                        ${estrelas}

                    </div>

                </div>

                <div class="review-text">

                    ${escaparHtml(
                        avaliacao.comentario ||
                        ""
                    )}

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
 * =========================================================
 * CARTEIRA
 * =========================================================
 */

function obterCarteiraLocal() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.carteiraStorageKey
            );


        if (!dados) {

            return {
                ...carteiraDemo
            };

        }


        return {

            ...carteiraDemo,

            ...JSON.parse(dados)

        };


    } catch (error) {

        console.warn(
            "⚠️ Não foi possível carregar carteira.",
            error
        );


        return {
            ...carteiraDemo
        };

    }

}


function preencherCarteira() {

    const carteira =
        obterCarteiraLocal();


    definirTexto(
        "saldoDisponivel",
        formatarMoeda(
            carteira.saldoDisponivel
        )
    );


    definirTexto(
        "saldoReceber",
        formatarMoeda(
            carteira.saldoReceber
        )
    );


    definirTexto(
        "totalRecebido",
        formatarMoeda(
            carteira.totalRecebido
        )
    );


    preencherTransacoes(
        carteira.transacoes
    );

}


function preencherTransacoes(transacoes) {

    const container =
        document.getElementById(
            "transactionList"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(transacoes) ||
        transacoes.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-transactions">

                <i data-lucide="receipt"></i>

                <strong>
                    Nenhuma movimentação ainda
                </strong>

                <span>
                    Quando você receber pagamentos pelos
                    seus serviços, eles aparecerão aqui.
                </span>

            </div>

        `;


        atualizarIcones();

        return;

    }


    container.innerHTML =
        "";


    transacoes.forEach(
        transacao => {

            const card =
                document.createElement(
                    "div"
                );


            const tipo =
                transacao.tipo ||
                "recebimento";


            card.className =
                `transaction-card ${
                    tipo === "saque"
                        ? "withdrawal"
                        : "received"
                }`;


            const valor =
                Number(
                    transacao.valor
                ) || 0;


            const negativo =
                tipo === "saque";


            card.innerHTML = `

                <div class="transaction-icon">

                    <i data-lucide="${
                        negativo
                            ? "arrow-up-right"
                            : "arrow-down-left"
                    }"></i>

                </div>

                <div class="transaction-info">

                    <strong>
                        ${escaparHtml(
                            transacao.descricao ||
                            (
                                negativo
                                    ? "Saque"
                                    : "Pagamento recebido"
                            )
                        )}
                    </strong>

                    <span>
                        ${escaparHtml(
                            transacao.data ||
                            ""
                        )}
                    </span>

                </div>

                <div class="transaction-value ${
                    negativo
                        ? "negative"
                        : "positive"
                }">

                    ${negativo ? "-" : "+"}
                    ${formatarMoeda(valor)}

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
 * =========================================================
 * ABAS
 * =========================================================
 */

function inicializarTabs() {

    const botoes =
        document.querySelectorAll(
            ".tab-button"
        );


    const abas =
        document.querySelectorAll(
            ".tab-content"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const tab =
                        botao.dataset.tab;


                    botoes.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    abas.forEach(
                        aba => {

                            aba.classList.remove(
                                "active"
                            );

                        }
                    );


                    botao.classList.add(
                        "active"
                    );


                    const destino =
                        document.getElementById(
                            `tab-${tab}`
                        );


                    if (destino) {

                        destino.classList.add(
                            "active"
                        );

                    }


                    if (
                        tab ===
                        "carteira"
                    ) {

                        preencherCarteira();

                    }

                }
            );

        }
    );

}


/*
 * =========================================================
 * BOTÕES
 * =========================================================
 */

function inicializarBotoes() {

    const voltar =
        document.getElementById(
            "btnVoltar"
        );


    if (voltar) {

        voltar.addEventListener(
            "click",
            voltarPagina
        );

    }


    const editar =
        document.getElementById(
            "btnEditarPerfil"
        );


    if (editar) {

        editar.addEventListener(
            "click",
            () => {

                const id =
                    perfilAtual?.id ||
                    "";


                if (!id) {

                    mostrarToast(
                        "Seu perfil ainda não possui um ID válido."
                    );


                    return;

                }


                window.location.href =
                    `editar-perfil-musico.html?id=${encodeURIComponent(id)}`;

            }
        );

    }


    const qr =
        document.getElementById(
            "btnQrCode"
        );


    if (qr) {

        qr.addEventListener(
            "click",
            abrirQrCode
        );

    }


    const fecharQr =
        document.getElementById(
            "btnFecharQr"
        );


    if (fecharQr) {

        fecharQr.addEventListener(
            "click",
            fecharQrCode
        );

    }


    const overlay =
        document.getElementById(
            "qrOverlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {

                    fecharQrCode();

                }

            }
        );

    }


    const whatsapp =
        document.getElementById(
            "btnWhatsApp"
        );


    if (whatsapp) {

        whatsapp.addEventListener(
            "click",
            compartilharWhatsApp
        );

    }


    const sacar =
        document.getElementById(
            "btnSacar"
        );


    if (sacar) {

        sacar.addEventListener(
            "click",
            solicitarSaque
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                fecharQrCode();

            }

        }
    );

}


/*
 * =========================================================
 * VOLTAR
 * =========================================================
 */

function voltarPagina() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

    } else {

        window.location.href =
            "index.html";

    }

}


/*
 * =========================================================
 * QR CODE
 * =========================================================
 */

function obterIdMusico() {

    return (
        perfilAtual?.id ||
        dadosPerfil?.perfil?.id ||
        ""
    );

}


function obterUrlPublicaPerfil() {

    const id =
        obterIdMusico();


    if (!id) {

        return "";

    }


    const diretorio =
        window.location.pathname
            .split("/")
            .slice(
                0,
                -1
            )
            .join("/");


    return (
        `${window.location.origin}` +
        `${diretorio}` +
        `/perfil-musico.html?id=${encodeURIComponent(id)}`
    );

}


function abrirQrCode() {

    const modal =
        document.getElementById(
            "qrModal"
        );


    const qrImage =
        document.getElementById(
            "qrImage"
        );


    const profileLink =
        document.getElementById(
            "profileLink"
        );


    if (
        !modal ||
        !qrImage
    ) {

        return;

    }


    const url =
        obterUrlPublicaPerfil();


    if (!url) {

        mostrarToast(
            "Não foi possível gerar o link do perfil."
        );


        return;

    }


    const qrUrl =
        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;


    qrImage.src =
        qrUrl;


    if (profileLink) {

        profileLink.textContent =
            url;

    }


    modal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


function fecharQrCode() {

    const modal =
        document.getElementById(
            "qrModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/*
 * =========================================================
 * WHATSAPP
 * =========================================================
 */

function compartilharWhatsApp() {

    const perfil =
        dadosPerfil?.perfil ||
        obterPerfilLocal();


    const url =
        obterUrlPublicaPerfil();


    if (!url) {

        mostrarToast(
            "Não foi possível obter o link do perfil."
        );


        return;

    }


    const mensagem =
        `Olá! Confira meu perfil de músico no MusicalWorld:\n\n` +
        `${perfil.nome || "Músico"}\n` +
        `${perfil.categoria || "Músico / Instrumentista"}\n\n` +
        `${url}`;


    const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(
            mensagem
        )}`;


    window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
    );

}


/*
 * =========================================================
 * SAQUE
 * =========================================================
 */

function solicitarSaque() {

    const carteira =
        obterCarteiraLocal();


    if (
        Number(
            carteira.saldoDisponivel
        ) <= 0
    ) {

        mostrarToast(
            "Você ainda não possui saldo disponível para saque."
        );


        return;

    }


    mostrarToast(
        "A área de saques será conectada ao sistema financeiro."
    );

}


/*
 * =========================================================
 * TOAST
 * =========================================================
 */

function mostrarToast(mensagem) {

    const toast =
        document.getElementById(
            "toast"
        );


    const texto =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !texto
    ) {

        return;

    }


    texto.textContent =
        mensagem;


    toast.classList.add(
        "active"
    );


    clearTimeout(
        mostrarToast.timeout
    );


    mostrarToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "active"
                );

            },
            3500
        );

}


/*
 * =========================================================
 * UTILITÁRIOS
 * =========================================================
 */

function definirTexto(id, texto) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            texto ?? "";

    }

}


function formatarMoeda(valor) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(valor) || 0
    );

}


function gerarIniciais(nome) {

    if (!nome) {

        return "MW";

    }


    return String(nome)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(
            palavra =>
                palavra
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


function escaparHtml(valor) {

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


function atualizarIcones() {

    if (
        window.lucide &&
        typeof lucide.createIcons ===
            "function"
    ) {

        lucide.createIcons();

    }

}


function redirecionarLogin() {

    const paginaAtual =
        window.location.pathname
            .split("/")
            .pop();


    const query =
        window.location.search ||
        "";


    sessionStorage.setItem(
        "musicalworld_destino_login",
        `${paginaAtual}${query}`
    );


    window.location.href =
        "login.html";

}


/*
 * =========================================================
 * DOM
 * =========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    inicializar
);


/*
 * =========================================================
 * API PÚBLICA
 * =========================================================
 */

return {

    obterPerfilLocal,

    obterCarteiraLocal,

    preencherPerfil,

    preencherCarteira,

    preencherInstrumentos,

    preencherEstilos,

    preencherServicos,

    preencherPortfolio,

    preencherVideos,

    preencherAudios,

    preencherAgenda,

    preencherAvaliacoes,

    abrirQrCode,

    fecharQrCode,

    verificarAcessoMusico,

    carregarDoSupabase

};


})();
