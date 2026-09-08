const MusicalWorldMeuPerfilCantor = (() => {

    const CONFIG = {
        usarSupabase: true,

        tabelas: {
            usuarios: "usuarios",
            perfis: "perfis",
            tiposPerfil: "tipos_perfil",
            perfisArtistas: "perfis_artistas",
            portfolio: "portfolio_musicos",
            agenda: "agenda_musicos",
            avaliacoes: "avaliacoes_musicos",
            carteiras: "carteiras_musicos",
            transacoes: "transacoes_carteira"
        },

        storageKey: "musicalworld_perfil_cantor",
        carteiraStorageKey: "musicalworld_carteira_cantor",

        // Cantor continua sendo tratado como ARTISTA no modelo atual
        tipoPerfilEsperado: "artista"
    };


    let usuarioAtual = null;
    let perfilAtual = null;
    let perfilArtistaAtual = null;
    let carteiraAtual = null;

    let dadosPerfil = {
        id: null,
        nome: "Cantor",
        descricao: "",
        categoria: "Cantor",
        localizacao: "Localização não informada",
        experiencia: "",
        area: "",
        disponibilidade: true,
        generos: [],
        servicos: [],
        foto: "",
        telefone: "",
        email: "",
        avaliacao: {
            media: 0,
            total: 0
        },
        portfolio: [],
        videos: [],
        audios: [],
        agenda: [],
        avaliacoes: []
    };


    let agendaMesAtual = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    );


    /* =========================================================
       SUPABASE
    ========================================================= */

    function obterSupabase() {

        if (typeof supabaseClient !== "undefined" && supabaseClient) {
            return supabaseClient;
        }

        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        if (window._supabase) {
            return window._supabase;
        }

        if (window.supabase) {
            return window.supabase;
        }

        return null;
    }


    async function obterUsuarioAutenticado() {

        try {

            if (
                window.UsuarioAtual &&
                typeof window.UsuarioAtual.obterId === "function"
            ) {

                const usuarioId = await window.UsuarioAtual.obterId();

                if (usuarioId) {

                    const client = obterSupabase();

                    if (!client) {
                        return null;
                    }

                    const { data, error } = await client
                        .from(CONFIG.tabelas.usuarios)
                        .select("*")
                        .eq("id", usuarioId)
                        .maybeSingle();

                    if (!error && data) {
                        return data;
                    }
                }
            }


            const client = obterSupabase();

            if (!client) {
                return null;
            }

            const {
                data: authData,
                error: authError
            } = await client.auth.getUser();


            if (authError || !authData?.user) {
                return null;
            }


            const {
                data,
                error
            } = await client
                .from(CONFIG.tabelas.usuarios)
                .select("*")
                .eq("id", authData.user.id)
                .maybeSingle();


            if (error) {
                console.error(
                    "Erro ao buscar usuário:",
                    error
                );

                return null;
            }

            return data || null;

        } catch (error) {

            console.error(
                "Erro ao obter usuário autenticado:",
                error
            );

            return null;
        }
    }


    /* =========================================================
       ACESSO
    ========================================================= */

    async function carregarDadosUsuario() {

        const client = obterSupabase();

        if (!client) {
            throw new Error(
                "Conexão com o Supabase não encontrada."
            );
        }


        usuarioAtual = await obterUsuarioAutenticado();


        if (!usuarioAtual) {
            throw new Error(
                "Usuário autenticado não encontrado."
            );
        }


        const {
            data: perfis,
            error: perfilError
        } = await client
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
            .eq("usuario_id", usuarioAtual.id)
            .eq("ativo", true)
            .order("id", {
                ascending: false
            });


        if (perfilError) {

            console.error(
                "Erro ao buscar perfis:",
                perfilError
            );

            throw perfilError;
        }


        perfilAtual = (perfis || []).find(
            perfil =>
                perfil.tipos_perfil &&
                perfil.tipos_perfil.nome === CONFIG.tipoPerfilEsperado
        );


        if (!perfilAtual) {

            throw new Error(
                "Perfil de artista não encontrado para este usuário."
            );
        }


        const {
            data: artista,
            error: artistaError
        } = await client
            .from(CONFIG.tabelas.perfisArtistas)
            .select("*")
            .eq("perfil_id", perfilAtual.id)
            .maybeSingle();


        if (artistaError) {

            console.error(
                "Erro ao buscar perfil do cantor:",
                artistaError
            );

            throw artistaError;
        }


        perfilArtistaAtual = artista || {};

        return {
            usuario: usuarioAtual,
            perfil: perfilAtual,
            artista: perfilArtistaAtual
        };
    }


    async function verificarAcessoCantor() {

        const dados = await carregarDadosUsuario();


        if (!dados.usuario) {
            throw new Error(
                "Usuário não encontrado."
            );
        }


        if (!dados.perfil) {
            throw new Error(
                "Perfil não encontrado."
            );
        }


        if (
            !dados.perfil.tipos_perfil ||
            dados.perfil.tipos_perfil.nome !== CONFIG.tipoPerfilEsperado
        ) {

            throw new Error(
                "Este perfil não possui permissão de artista."
            );
        }


        return true;
    }


    /* =========================================================
       CARREGAMENTO PRINCIPAL
    ========================================================= */

    async function carregarDoSupabase() {

        const client = obterSupabase();

        if (!client || !perfilAtual) {
            return;
        }


        /* PORTFÓLIO */

        const {
            data: portfolio,
            error: portfolioError
        } = await client
            .from(CONFIG.tabelas.portfolio)
            .select("*")
            .eq("perfil_id", perfilAtual.id)
            .eq("ativo", true)
            .order("ordem", {
                ascending: true
            })
            .order("created_at", {
                ascending: true
            });


        if (portfolioError) {

            console.warn(
                "Não foi possível carregar o portfólio:",
                portfolioError
            );
        }


        /* AGENDA */

        const {
            data: agenda,
            error: agendaError
        } = await client
            .from(CONFIG.tabelas.agenda)
            .select("*")
            .eq("perfil_id", perfilAtual.id)
            .in("status", [
                "agendado",
                "confirmado"
            ])
            .order("data_inicio", {
                ascending: true
            });


        if (agendaError) {

            console.warn(
                "Não foi possível carregar a agenda:",
                agendaError
            );
        }


        const itensPortfolio = portfolio || [];


        const imagens = itensPortfolio.filter(
            item =>
                String(item.tipo || "").toLowerCase() === "imagem"
        );


        const videos = itensPortfolio.filter(
            item =>
                String(item.tipo || "").toLowerCase() === "video"
        );


        const audios = itensPortfolio.filter(
            item =>
                String(item.tipo || "").toLowerCase() === "audio"
        );


        const artista = perfilArtistaAtual || {};


        dadosPerfil = {

            id: perfilAtual.id,

            nome:
                perfilAtual.nome_exibicao ||
                usuarioAtual?.nome ||
                "Cantor",

            descricao:
                perfilAtual.descricao ||
                "",

            categoria:
                artista.tipo_artista ||
                "Cantor",

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

            generos:
                normalizarArray(artista.estilos),

            servicos:
                normalizarArray(artista.servicos),

            foto:
                artista.foto_url ||
                usuarioAtual?.foto_url ||
                "",

            telefone:
                usuarioAtual?.telefone ||
                "",

            email:
                usuarioAtual?.email ||
                "",

            avaliacao: {
                media: 0,
                total: 0
            },

            portfolio: imagens,

            videos,

            audios,

            agenda:
                agenda || [],

            avaliacoes: []
        };


        try {
            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(dadosPerfil)
            );
        } catch (error) {
            console.warn(
                "Não foi possível salvar o perfil localmente:",
                error
            );
        }


        return dadosPerfil;
    }


    /* =========================================================
       PREENCHIMENTO DO PERFIL
    ========================================================= */

    function preencherPerfil(dados = dadosPerfil) {

        definirTexto(
            "profileName",
            dados.nome || "Cantor"
        );


        definirTexto(
            "profileCategory",
            dados.categoria || "Cantor"
        );


        definirTexto(
            "profileLocation",
            dados.localizacao || "Localização não informada"
        );


        definirTexto(
            "profileBio",
            dados.descricao || "Nenhuma descrição informada."
        );


        definirTexto(
            "profileExperience",
            dados.experiencia || "Não informada"
        );


        definirTexto(
            "profileArea",
            dados.area || "Não informada"
        );


        definirTexto(
            "profileType",
            dados.categoria || "Cantor"
        );


        definirTexto(
            "profileAvailability",
            dados.disponibilidade
                ? "Disponível"
                : "Indisponível"
        );


        preencherAvatar(dados);


        preencherStatus(
            dados.disponibilidade
        );


        preencherAvaliacao(
            dados.avaliacao
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


        definirTexto(
            "profileLink",
            gerarLinkPerfil()
        );


        atualizarIcones();
    }


    /* =========================================================
       AVATAR
    ========================================================= */

    function preencherAvatar(dados) {

        const container =
            document.getElementById("profileAvatar");

        const initials =
            document.getElementById("profileInitials");


        if (!container) {
            return;
        }


        const imagem =
            dados.foto ||
            "";


        const imagemExistente =
            container.querySelector("img");


        if (imagem) {

            if (imagemExistente) {

                imagemExistente.src = imagem;
                imagemExistente.alt =
                    dados.nome || "Cantor";

            } else {

                const img =
                    document.createElement("img");

                img.src = imagem;
                img.alt =
                    dados.nome || "Cantor";

                img.addEventListener(
                    "error",
                    () => {

                        img.remove();

                        if (initials) {
                            initials.textContent =
                                gerarIniciais(dados.nome);
                            initials.style.display = "inline";
                        }
                    }
                );

                container.appendChild(img);
            }


            if (initials) {
                initials.style.display = "none";
            }

        } else {

            if (imagemExistente) {
                imagemExistente.remove();
            }

            if (initials) {

                initials.textContent =
                    gerarIniciais(dados.nome);

                initials.style.display =
                    "inline";
            }
        }
    }


    /* =========================================================
       STATUS
    ========================================================= */

    function preencherStatus(disponivel) {

        const status =
            document.getElementById("profileStatus");

        const statusDot =
            document.getElementById("profileStatusDot");


        if (!status) {
            return;
        }


        const texto =
            status.querySelector(".status-text");


        status.classList.toggle(
            "available",
            disponivel
        );


        status.classList.toggle(
            "unavailable",
            !disponivel
        );


        if (texto) {

            texto.textContent =
                disponivel
                    ? "Disponível"
                    : "Indisponível";
        }


        if (statusDot) {

            statusDot.classList.toggle(
                "unavailable",
                !disponivel
            );
        }
    }


    /* =========================================================
       AVALIAÇÃO
    ========================================================= */

    function preencherAvaliacao(avaliacao) {

        const container =
            document.getElementById("profileRating");

        if (!container) {
            return;
        }


        const media =
            Number(avaliacao?.media || 0);


        const total =
            Number(avaliacao?.total || 0);


        container.innerHTML = "";


        for (let i = 1; i <= 5; i++) {

            const span =
                document.createElement("span");

            const icon =
                document.createElement("i");

            icon.setAttribute(
                "data-lucide",
                "star"
            );


            if (i <= Math.round(media)) {
                icon.style.fill = "currentColor";
            }


            span.appendChild(icon);
            container.appendChild(span);
        }


        definirTexto(
            "ratingValue",
            media.toFixed(1).replace(".", ",")
        );


        definirTexto(
            "ratingReviews",
            `(${total} ${total === 1 ? "avaliação" : "avaliações"})`
        );


        atualizarIcones();
    }


    /* =========================================================
       GÊNEROS
    ========================================================= */

    function preencherGeneros(generos) {

        const container =
            document.getElementById("genreList");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const lista =
            normalizarArray(generos);


        if (!lista.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum gênero informado.
                </span>
            `;

            return;
        }


        lista.forEach(genero => {

            const tag =
                document.createElement("span");

            tag.className =
                "genre-tag";

            tag.textContent =
                genero;

            container.appendChild(tag);
        });
    }


    /* =========================================================
       SERVIÇOS
    ========================================================= */

    function preencherServicos(servicos) {

        const container =
            document.getElementById("servicesList");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const lista =
            normalizarArray(servicos);


        if (!lista.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum serviço informado.
                </span>
            `;

            return;
        }


        lista.forEach(servico => {

            const card =
                document.createElement("div");

            card.className =
                "service-card";


            card.innerHTML = `
                <div class="service-card-icon">
                    <i data-lucide="briefcase"></i>
                </div>

                <span>
                    ${escaparHtml(servico)}
                </span>
            `;


            container.appendChild(card);
        });


        atualizarIcones();
    }


    /* =========================================================
       PORTFÓLIO
    ========================================================= */

    function preencherPortfolio(itens) {

        const container =
            document.getElementById("portfolioGrid");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const lista =
            Array.isArray(itens)
                ? itens
                : [];


        if (!lista.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum trabalho adicionado.
                </span>
            `;

            return;
        }


        lista.forEach(item => {

            if (!item.arquivo_url) {
                return;
            }


            const card =
                document.createElement("article");

            card.className =
                "portfolio-card";


            const titulo =
                item.titulo ||
                "Trabalho";


            const descricao =
                item.descricao ||
                "";


            card.innerHTML = `
                <img
                    class="portfolio-image"
                    src="${escaparAtributo(item.arquivo_url)}"
                    alt="${escaparAtributo(titulo)}"
                    loading="lazy"
                >

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
            `;


            container.appendChild(card);
        });


        if (!container.children.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum trabalho adicionado.
                </span>
            `;
        }
    }


    /* =========================================================
       VÍDEOS
    ========================================================= */

    function preencherVideos(itens) {

        const container =
            document.getElementById("videoList");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const lista =
            Array.isArray(itens)
                ? itens
                : [];


        if (!lista.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum vídeo adicionado.
                </span>
            `;

            return;
        }


        lista.forEach(item => {

            if (!item.arquivo_url) {
                return;
            }


            const card =
                document.createElement("article");

            card.className =
                "video-card";


            const titulo =
                item.titulo ||
                "Apresentação";


            card.innerHTML = `
                <video
                    controls
                    preload="metadata"
                    src="${escaparAtributo(item.arquivo_url)}"
                ></video>

                <div class="video-title">
                    ${escaparHtml(titulo)}
                </div>
            `;


            container.appendChild(card);
        });


        if (!container.children.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum vídeo adicionado.
                </span>
            `;
        }
    }


    /* =========================================================
       ÁUDIOS
    ========================================================= */

    function preencherAudios(itens) {

        const container =
            document.getElementById("audioList");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const lista =
            Array.isArray(itens)
                ? itens
                : [];


        if (!lista.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum áudio adicionado.
                </span>
            `;

            return;
        }


        lista.forEach(item => {

            if (!item.arquivo_url) {
                return;
            }


            const card =
                document.createElement("article");

            card.className =
                "audio-card";


            const titulo =
                item.titulo ||
                "Áudio";


            card.innerHTML = `
                <div class="audio-icon">
                    <i data-lucide="music-2"></i>
                </div>

                <div class="audio-content">

                    <span class="audio-title">
                        ${escaparHtml(titulo)}
                    </span>

                    <audio
                        controls
                        preload="metadata"
                        src="${escaparAtributo(item.arquivo_url)}"
                    ></audio>

                </div>
            `;


            container.appendChild(card);
        });


        if (!container.children.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhum áudio adicionado.
                </span>
            `;
        }


        atualizarIcones();
    }


    /* =========================================================
       AGENDA
    ========================================================= */

    function preencherAgenda(agenda) {

        const container =
            document.getElementById("agendaList");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const ano =
            agendaMesAtual.getFullYear();

        const mes =
            agendaMesAtual.getMonth();


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


        let inicioSemana =
            primeiroDia.getDay();


        // Domingo = 0
        // Segunda = 0
        inicioSemana =
            inicioSemana === 0
                ? 6
                : inicioSemana - 1;


        const diasNoMes =
            ultimoDia.getDate();


        const nomesMeses = [
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"
        ];


        const nomesSemana = [
            "SEG",
            "TER",
            "QUA",
            "QUI",
            "SEX",
            "SÁB",
            "DOM"
        ];


        const hoje =
            new Date();


        const agendaLista =
            Array.isArray(agenda)
                ? agenda
                : [];


        const diasAgendados =
            new Set();


        agendaLista.forEach(item => {

            if (!item.data_inicio) {
                return;
            }


            const data =
                new Date(item.data_inicio);


            if (
                data.getFullYear() === ano &&
                data.getMonth() === mes
            ) {

                diasAgendados.add(
                    data.getDate()
                );
            }
        });


        let html = `
            <div class="calendar">

                <div class="calendar-header">

                    <div class="calendar-title">
                        ${nomesMeses[mes]} ${ano}
                    </div>

                    <div class="calendar-navigation">

                        <button
                            type="button"
                            id="btnMesAnterior"
                            aria-label="Mês anterior"
                        >
                            <i data-lucide="chevron-left"></i>
                        </button>

                        <button
                            type="button"
                            id="btnMesProximo"
                            aria-label="Próximo mês"
                        >
                            <i data-lucide="chevron-right"></i>
                        </button>

                    </div>

                </div>


                <div class="calendar-weekdays">
        `;


        nomesSemana.forEach(dia => {

            html += `
                <span>${dia}</span>
            `;
        });


        html += `
                </div>

                <div class="calendar-days">
        `;


        for (
            let i = 0;
            i < inicioSemana;
            i++
        ) {

            html += `
                <div class="calendar-day vazio"></div>
            `;
        }


        for (
            let dia = 1;
            dia <= diasNoMes;
            dia++
        ) {

            const dataDia =
                new Date(
                    ano,
                    mes,
                    dia
                );


            const inicioHoje =
                new Date(
                    hoje.getFullYear(),
                    hoje.getMonth(),
                    hoje.getDate()
                );


            const passado =
                dataDia < inicioHoje;


            const agendado =
                diasAgendados.has(dia);


            const eHoje =
                dataDia.getTime() ===
                inicioHoje.getTime();


            let classe =
                "calendar-day";


            if (passado) {
                classe += " passado";
            }


            if (agendado) {
                classe += " agendado";
            } else if (
                !passado &&
                !dadosPerfil.disponibilidade
            ) {
                classe += " indisponivel";
            } else if (!passado) {
                classe += " disponivel";
            }


            if (eHoje) {
                classe += " hoje";
            }


            html += `
                <div class="${classe}">
                    ${dia}
                </div>
            `;
        }


        html += `
                </div>

                <div class="agenda-legend">

                    <div class="legend-item">
                        <span class="legend-dot disponivel"></span>
                        Disponível
                    </div>

                    <div class="legend-item">
                        <span class="legend-dot agendado"></span>
                        Agendado
                    </div>

                    <div class="legend-item">
                        <span class="legend-dot indisponivel"></span>
                        Indisponível
                    </div>

                </div>

            </div>
        `;


        container.innerHTML =
            html;


        const anterior =
            document.getElementById(
                "btnMesAnterior"
            );


        const proximo =
            document.getElementById(
                "btnMesProximo"
            );


        if (anterior) {

            anterior.addEventListener(
                "click",
                () => {

                    agendaMesAtual =
                        new Date(
                            ano,
                            mes - 1,
                            1
                        );

                    preencherAgenda(
                        dadosPerfil.agenda
                    );
                }
            );
        }


        if (proximo) {

            proximo.addEventListener(
                "click",
                () => {

                    agendaMesAtual =
                        new Date(
                            ano,
                            mes + 1,
                            1
                        );

                    preencherAgenda(
                        dadosPerfil.agenda
                    );
                }
            );
        }


        atualizarIcones();
    }


    /* =========================================================
       AVALIAÇÕES
    ========================================================= */

    function preencherAvaliacoes(avaliacoes) {

        const container =
            document.getElementById("reviewsList");


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const lista =
            Array.isArray(avaliacoes)
                ? avaliacoes
                : [];


        if (!lista.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhuma avaliação recebida.
                </span>
            `;

            return;
        }


        lista.forEach(avaliacao => {

            const usuario =
                avaliacao.usuario || {};


            const nome =
                usuario.nome ||
                "Usuário";


            const nota =
                Number(
                    avaliacao.nota || 0
                );


            const comentario =
                avaliacao.comentario ||
                "";


            const card =
                document.createElement("article");

            card.className =
                "review-card";


            let estrelas = "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                estrelas += `
                    <span>
                        <i
                            data-lucide="star"
                            ${
                                i <= Math.round(nota)
                                    ? 'style="fill:currentColor"'
                                    : ""
                            }
                        ></i>
                    </span>
                `;
            }


            card.innerHTML = `
                <div class="review-header">

                    <div class="review-avatar">

                        ${
                            usuario.foto_url
                                ? `
                                    <img
                                        src="${escaparAtributo(usuario.foto_url)}"
                                        alt="${escaparAtributo(nome)}"
                                    >
                                  `
                                : `
                                    ${escaparHtml(
                                        gerarIniciais(nome)
                                    )}
                                  `
                        }

                    </div>


                    <div class="review-user">

                        <strong>
                            ${escaparHtml(nome)}
                        </strong>

                        <div class="review-stars">
                            ${estrelas}
                        </div>

                    </div>

                </div>


                ${
                    comentario
                        ? `
                            <p class="review-comment">
                                ${escaparHtml(comentario)}
                            </p>
                          `
                        : ""
                }
            `;


            container.appendChild(card);
        });


        atualizarIcones();
    }


    /* =========================================================
       CARTEIRA
    ========================================================= */

    async function carregarCarteiraReal() {

        const client =
            obterSupabase();


        if (
            !client ||
            !perfilAtual
        ) {
            return;
        }


        try {

            const {
                data: carteira,
                error: carteiraError
            } = await client
                .from(CONFIG.tabelas.carteiras)
                .select("*")
                .eq(
                    "perfil_id",
                    perfilAtual.id
                )
                .maybeSingle();


            if (carteiraError) {

                console.warn(
                    "Erro ao carregar carteira:",
                    carteiraError
                );

                carteiraAtual = null;

                preencherCarteira(
                    null,
                    []
                );

                return;
            }


            if (!carteira) {

                carteiraAtual = null;

                preencherCarteira(
                    null,
                    []
                );

                return;
            }


            carteiraAtual =
                carteira;


            const {
                data: transacoes,
                error: transacoesError
            } = await client
                .from(CONFIG.tabelas.transacoes)
                .select("*")
                .eq(
                    "carteira_id",
                    carteira.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (transacoesError) {

                console.warn(
                    "Erro ao carregar transações:",
                    transacoesError
                );
            }


            preencherCarteira(
                carteira,
                transacoes || []
            );


            try {

                localStorage.setItem(
                    CONFIG.carteiraStorageKey,
                    JSON.stringify({
                        carteira,
                        transacoes:
                            transacoes || []
                    })
                );

            } catch (error) {

                console.warn(
                    "Não foi possível salvar carteira localmente:",
                    error
                );
            }

        } catch (error) {

            console.error(
                "Erro ao carregar carteira:",
                error
            );

            preencherCarteira(
                null,
                []
            );
        }
    }


    function preencherCarteira(
        carteira,
        transacoes
    ) {

        const dados =
            carteira || {};


        definirTexto(
            "walletTotal",
            formatarMoeda(
                dados.saldo_total || 0
            )
        );


        definirTexto(
            "walletAvailable",
            formatarMoeda(
                dados.saldo_disponivel || 0
            )
        );


        definirTexto(
            "walletPending",
            formatarMoeda(
                dados.saldo_pendente || 0
            )
        );


        preencherTransacoes(
            transacoes || []
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


        container.innerHTML = "";


        if (!transacoes.length) {

            container.innerHTML = `
                <span class="empty-message">
                    Nenhuma movimentação encontrada.
                </span>
            `;

            return;
        }


        const tiposPositivos = [
            "pagamento",
            "liberacao",
            "ajuste"
        ];


        transacoes.forEach(transacao => {

            const tipo =
                String(
                    transacao.tipo || ""
                ).toLowerCase();


            const valor =
                Number(
                    transacao.valor || 0
                );


            const positivo =
                tiposPositivos.includes(
                    tipo
                );


            let icone =
                "arrow-down-left";


            if (tipo === "pagamento") {
                icone = "credit-card";
            }

            if (tipo === "liberacao") {
                icone = "unlock";
            }

            if (tipo === "saque") {
                icone = "arrow-up-right";
            }

            if (tipo === "estorno") {
                icone = "rotate-ccw";
            }

            if (tipo === "comissao") {
                icone = "percent";
            }

            if (tipo === "ajuste") {
                icone = "settings-2";
            }


            const titulo =
                transacao.descricao ||
                formatarTipoTransacao(tipo);


            const data =
                transacao.created_at ||
                transacao.data ||
                null;


            const card =
                document.createElement("div");

            card.className =
                "transaction-card";


            card.innerHTML = `
                <div class="transaction-icon ${positivo ? "" : "negative"}">
                    <i data-lucide="${icone}"></i>
                </div>

                <div class="transaction-info">

                    <span class="transaction-title">
                        ${escaparHtml(titulo)}
                    </span>

                    <span class="transaction-date">
                        ${formatarData(data)}
                    </span>

                </div>

                <div class="transaction-value ${positivo ? "positive" : "negative"}">
                    ${positivo ? "+" : "-"} ${formatarMoeda(Math.abs(valor))}
                </div>
            `;


            container.appendChild(card);
        });


        atualizarIcones();
    }


    function formatarTipoTransacao(tipo) {

        const mapa = {
            pagamento: "Pagamento",
            liberacao: "Pagamento liberado",
            saque: "Saque",
            estorno: "Estorno",
            comissao: "Comissão",
            ajuste: "Ajuste"
        };


        return mapa[tipo] ||
            "Movimentação";
    }


    /* =========================================================
       ABAS
    ========================================================= */

    function inicializarTabs() {

        const tabs =
            document.querySelectorAll(
                ".profile-tab"
            );


        const contents =
            document.querySelectorAll(
                ".tab-content"
            );


        tabs.forEach(tab => {

            tab.addEventListener(
                "click",
                async () => {

                    const nome =
                        tab.dataset.tab;


                    tabs.forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === tab
                        );
                    });


                    contents.forEach(content => {

                        content.classList.toggle(
                            "active",
                            content.id ===
                                `tab-${nome}`
                        );
                    });


                    if (
                        nome === "carteira"
                    ) {

                        await carregarCarteiraReal();
                    }


                    atualizarIcones();
                }
            );
        });
    }


    /* =========================================================
       BOTÕES
    ========================================================= */

    function inicializarBotoes() {

        const btnVoltar =
            document.getElementById(
                "btnVoltar"
            );


        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                () => {

                    if (
                        window.history.length > 1
                    ) {

                        window.history.back();

                    } else {

                        window.location.href =
                            "index.html";
                    }
                }
            );
        }


        const btnVisualizar =
            document.getElementById(
                "btnVisualizarPerfil"
            );


        if (btnVisualizar) {

            btnVisualizar.addEventListener(
                "click",
                () => {

                    if (!dadosPerfil.id) {
                        mostrarToast(
                            "Perfil ainda não carregado."
                        );

                        return;
                    }


                    window.location.href =
                        `apresentar-perfil-cantor.html?id=${encodeURIComponent(dadosPerfil.id)}`;
                }
            );
        }


        const btnEditar =
            document.getElementById(
                "btnEditarPerfil"
            );


        if (btnEditar) {

            btnEditar.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "editar-perfil-cantor.html";
                }
            );
        }


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


        const qrOverlay =
            document.getElementById(
                "qrOverlay"
            );


        if (qrOverlay) {

            qrOverlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        qrOverlay
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
                compartilharQR
            );
        }


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


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    fecharQRCode();
                }
            }
        );
    }


    /* =========================================================
       WHATSAPP
    ========================================================= */

    function compartilharWhatsApp() {

        const telefone =
            normalizarTelefone(
                dadosPerfil.telefone
            );


        if (!telefone) {

            mostrarToast(
                "Telefone do perfil não informado."
            );

            return;
        }


        const link =
            gerarLinkPerfil();


        const mensagem =
            `Olá! Quero conhecer o perfil de ${dadosPerfil.nome} no MusicalWorld: ${link}`;


        const url =
            `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }


    /* =========================================================
       QR CODE
    ========================================================= */

    function gerarLinkPerfil() {

        return (
            `${window.location.origin}/apresentar-perfil-cantor.html?id=${encodeURIComponent(dadosPerfil.id || "")}`
        );
    }


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
            gerarLinkPerfil();


        const campo =
            document.getElementById(
                "profileLink"
            );


        if (!overlay || !imagem) {
            return;
        }


        const qrUrl =
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;


        imagem.src =
            qrUrl;


        if (campo) {
            campo.value = link;
        }


        overlay.classList.add(
            "active"
        );


        atualizarIcones();
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


    async function compartilharQR() {

        const link =
            gerarLinkPerfil();


        try {

            if (
                navigator.share
            ) {

                await navigator.share({
                    title:
                        `Perfil de ${dadosPerfil.nome}`,
                    text:
                        "Confira meu perfil no MusicalWorld.",
                    url:
                        link
                });

                return;
            }


            if (
                navigator.clipboard
            ) {

                await navigator.clipboard.writeText(
                    link
                );


                mostrarToast(
                    "Link do perfil copiado."
                );

                return;
            }


            mostrarToast(
                "Não foi possível compartilhar o perfil."
            );

        } catch (error) {

            if (
                error?.name ===
                "AbortError"
            ) {
                return;
            }


            console.error(
                "Erro ao compartilhar:",
                error
            );


            mostrarToast(
                "Não foi possível compartilhar o perfil."
            );
        }
    }


    /* =========================================================
       SAQUE
    ========================================================= */

    function solicitarSaque() {

        mostrarToast(
            "O sistema de saque será disponibilizado nesta etapa."
        );
    }


    /* =========================================================
       HELPERS
    ========================================================= */

    function normalizarArray(valor) {

        if (Array.isArray(valor)) {

            return valor
                .filter(Boolean)
                .map(item => {

                    if (
                        typeof item ===
                        "object"
                    ) {

                        return (
                            item.nome ||
                            item.name ||
                            item.valor ||
                            ""
                        );
                    }

                    return String(item);
                })
                .filter(Boolean);
        }


        if (
            typeof valor ===
            "string"
        ) {

            const texto =
                valor.trim();


            if (!texto) {
                return [];
            }


            try {

                const parsed =
                    JSON.parse(texto);


                if (
                    Array.isArray(parsed)
                ) {

                    return normalizarArray(
                        parsed
                    );
                }

            } catch (error) {
                // Não é JSON; continua como texto.
            }


            return texto
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);
        }


        return [];
    }


    function normalizarTelefone(telefone) {

        if (!telefone) {
            return "";
        }


        let numero =
            String(telefone)
                .replace(/\D/g, "");


        if (
            numero.length === 10 ||
            numero.length === 11
        ) {

            numero =
                "55" + numero;
        }


        return numero;
    }


    function definirTexto(
        id,
        texto
    ) {

        const elemento =
            document.getElementById(id);


        if (elemento) {

            elemento.textContent =
                texto ?? "";
        }
    }


    function formatarMoeda(valor) {

        const numero =
            Number(valor || 0);


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    function formatarData(data) {

        if (!data) {
            return "Data não informada";
        }


        const dataObj =
            new Date(data);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return "Data não informada";
        }


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    function formatarDia(data) {

        if (!data) {
            return "";
        }


        const dataObj =
            new Date(data);


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit"
            }
        );
    }


    function formatarMes(data) {

        if (!data) {
            return "";
        }


        const dataObj =
            new Date(data);


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                month: "long"
            }
        );
    }


    function formatarHorario(data) {

        if (!data) {
            return "";
        }


        const dataObj =
            new Date(data);


        return dataObj.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    function gerarIniciais(nome) {

        if (!nome) {
            return "C";
        }


        const partes =
            String(nome)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {
            return "C";
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


    function escaparHtml(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function escaparAtributo(valor) {

        return escaparHtml(valor);
    }


    function atualizarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();
        }
    }


    function mostrarToast(mensagem) {

        const toast =
            document.getElementById(
                "toast"
            );


        const texto =
            document.getElementById(
                "toastMessage"
            );


        if (!toast || !texto) {
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
                3000
            );
    }


    function redirecionarLogin() {

        window.location.href =
            "login.html";
    }


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    async function inicializar() {

        try {

            if (
                window.ControleSessao &&
                typeof window.ControleSessao.iniciar ===
                    "function"
            ) {

                await window.ControleSessao.iniciar({
                    exigirLogin: true,
                    redirecionarPara: "login.html"
                });
            }


            if (CONFIG.usarSupabase) {

                await verificarAcessoCantor();

                await carregarDoSupabase();

                preencherPerfil(
                    dadosPerfil
                );

                await carregarCarteiraReal();

            } else {

                preencherPerfil(
                    dadosPerfil
                );
            }


            inicializarTabs();

            inicializarBotoes();

            atualizarIcones();

        } catch (error) {

            console.error(
                "Erro ao inicializar meu perfil de cantor:",
                error
            );


            mostrarToast(
                error?.message ||
                "Não foi possível carregar seu perfil."
            );
        }
    }


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    return {

        inicializar,

        carregarDoSupabase,

        carregarCarteiraReal,

        preencherPerfil

    };

})();


document.addEventListener(
    "DOMContentLoaded",
    () => {

        MusicalWorldMeuPerfilCantor.inicializar();

    }
);