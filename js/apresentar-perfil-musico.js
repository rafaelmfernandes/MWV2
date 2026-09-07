const MusicalWorldApresentarPerfilMusico = (() => {

    "use strict";


    const CONFIG = {

        tabelas: {

            usuarios: "usuarios",

            perfis: "perfis",

            tiposPerfil: "tipos_perfil",

            perfisArtistas: "perfis_artistas",

            portfolio: "portfolio_musicos",

            agenda: "agenda_musicos",

            avaliacoes: "avaliacoes_musicos"

        },

        tipoPerfilEsperado: "artista"

    };


    let perfilId = null;

    let usuario = null;

    let perfil = null;

    let perfilArtista = null;

    let dadosPerfil = null;


    let agendaMesAtual =
        new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
        );


    function obterSupabase() {

        if (
            typeof supabaseClient !== "undefined" &&
            supabaseClient
        ) {
            return supabaseClient;
        }


        if (
            window.supabaseClient
        ) {
            return window.supabaseClient;
        }


        if (
            window._supabase
        ) {
            return window._supabase;
        }


        if (
            window.supabase
        ) {
            return window.supabase;
        }


        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    async function inicializar() {

        try {

            obterIdPerfil();


            if (!perfilId) {

                mostrarErroPagina(
                    "Perfil não encontrado."
                );

                return;
            }


            await carregarPerfil();

            preencherPerfil();

            inicializarBotoes();

            atualizarIcones();


        } catch (erro) {

            console.error(
                "Erro ao carregar perfil público:",
                erro
            );


            mostrarErroPagina(
                erro?.message ||
                "Não foi possível carregar este perfil."
            );

        }

    }


    function obterIdPerfil() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const id =
            Number(
                parametros.get("id")
            );


        if (
            Number.isFinite(id) &&
            id > 0
        ) {

            perfilId = id;

        } else {

            perfilId = null;

        }

    }


    async function carregarPerfil() {

        const cliente =
            obterSupabase();


        const respostaPerfil =
            await cliente
                .from(
                    CONFIG.tabelas.perfis
                )
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
                    "id",
                    perfilId
                )
                .eq(
                    "ativo",
                    true
                )
                .maybeSingle();


        if (
            respostaPerfil.error
        ) {

            throw respostaPerfil.error;

        }


        if (
            !respostaPerfil.data
        ) {

            throw new Error(
                "Perfil não encontrado."
            );

        }


        perfil =
            respostaPerfil.data;


        const nomeTipo =
            String(
                perfil.tipos_perfil?.nome || ""
            )
                .trim()
                .toLowerCase();


        if (
            nomeTipo !==
            CONFIG.tipoPerfilEsperado
        ) {

            throw new Error(
                "Este perfil não é um perfil de músico."
            );

        }


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


        if (
            respostaArtista.error
        ) {

            throw respostaArtista.error;

        }


        perfilArtista =
            respostaArtista.data || {};


        await carregarUsuario(
            cliente
        );


        await carregarConteudo(
            cliente
        );

    }


    async function carregarUsuario(
        cliente
    ) {

        if (
            !perfil?.usuario_id
        ) {

            usuario = null;

            return;

        }


        const resposta =
            await cliente
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    foto_url,
                    ativo
                `)
                .eq(
                    "id",
                    perfil.usuario_id
                )
                .maybeSingle();


        if (
            resposta.error
        ) {

            throw resposta.error;

        }


        usuario =
            resposta.data || null;

    }


    async function carregarConteudo(
        cliente
    ) {

        let portfolioItens = [];

        let agendaItens = [];

        let avaliacaoItens = [];


        /* =====================================================
           PORTFÓLIO
        ====================================================== */

        const respostaPortfolio =
            await cliente
                .from(
                    CONFIG.tabelas.portfolio
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfil.id
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
                        ascending: false
                    }
                );


        if (
            respostaPortfolio.error
        ) {

            console.error(
                "Erro ao carregar portfólio:",
                respostaPortfolio.error
            );

        } else {

            portfolioItens =
                respostaPortfolio.data || [];

        }


        /* =====================================================
           AGENDA
        ====================================================== */

        const respostaAgenda =
            await cliente
                .from(
                    CONFIG.tabelas.agenda
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfil.id
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

            console.error(
                "Erro ao carregar agenda:",
                respostaAgenda.error
            );

        } else {

            agendaItens =
                respostaAgenda.data || [];

        }


        /* =====================================================
           AVALIAÇÕES
        ====================================================== */

        const respostaAvaliacoes =
            await cliente
                .from(
                    CONFIG.tabelas.avaliacoes
                )
                .select(`
                    *,
                    usuario:usuarios (
                        id,
                        nome,
                        foto_url
                    )
                `)
                .eq(
                    "perfil_id",
                    perfil.id
                )
                .eq(
                    "ativo",
                    true
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (
            respostaAvaliacoes.error
        ) {

            console.error(
                "Erro ao carregar avaliações:",
                respostaAvaliacoes.error
            );

        } else {

            avaliacaoItens =
                respostaAvaliacoes.data || [];

        }


        const imagens =
            portfolioItens.filter(
                item =>
                    String(
                        item.tipo || ""
                    ).toLowerCase() ===
                    "imagem"
            );


        const videos =
            portfolioItens.filter(
                item =>
                    String(
                        item.tipo || ""
                    ).toLowerCase() ===
                    "video"
            );


        const audios =
            portfolioItens.filter(
                item =>
                    String(
                        item.tipo || ""
                    ).toLowerCase() ===
                    "audio"
            );


        const notas =
            avaliacaoItens
                .map(
                    item =>
                        Number(
                            item.nota ||
                            item.avaliacao ||
                            0
                        )
                )
                .filter(
                    nota =>
                        Number.isFinite(nota) &&
                        nota > 0
                );


        const media =
            notas.length
                ? notas.reduce(
                    (
                        total,
                        nota
                    ) =>
                        total + nota,
                    0
                ) / notas.length
                : 0;


        dadosPerfil = {

            id:
                perfil.id,

            nome:
                perfil.nome_exibicao ||
                usuario?.nome ||
                "Músico",

            descricao:
                perfil.descricao ||
                "",

            categoria:
                perfilArtista.tipo_artista ||
                "Músico / Instrumentista",

            localizacao:
                perfilArtista.localizacao ||
                "Localização não informada",

            experiencia:
                perfilArtista.experiencia ||
                "",

            area:
                perfilArtista.area_atendimento ||
                "",

            disponibilidade:
                perfilArtista.disponivel !== false,

            instrumentos:
                normalizarArray(
                    perfilArtista.instrumentos
                ),

            generos:
                normalizarArray(
                    perfilArtista.estilos
                ),

            servicos:
                normalizarArray(
                    perfilArtista.servicos
                ),

            foto:
                perfilArtista.foto_url ||
                usuario?.foto_url ||
                "",

            telefone:
                usuario?.telefone ||
                "",

            email:
                usuario?.email ||
                "",

            portfolio:
                imagens,

            videos,

            audios,

            agenda:
                agendaItens,

            avaliacoes:
                avaliacaoItens,

            avaliacao: {

                media,

                total:
                    avaliacaoItens.length

            }

        };

    }


    function preencherPerfil() {

        if (!dadosPerfil) {
            return;
        }


        preencherAvatar();

        definirTexto(
            "profileName",
            dadosPerfil.nome
        );


        definirTexto(
            "profileCategory",
            dadosPerfil.categoria
        );


        definirTexto(
            "profileBio",
            dadosPerfil.descricao ||
            "Nenhuma descrição profissional cadastrada."
        );


        definirTexto(
            "profileExperience",
            dadosPerfil.experiencia ||
            "Não informada"
        );


        definirTexto(
            "profileArea",
            dadosPerfil.area ||
            "Não informada"
        );


        definirTexto(
            "profileType",
            "Artista"
        );


        definirTexto(
            "profileAvailability",
            dadosPerfil.disponibilidade
                ? "Disponível"
                : "Indisponível"
        );


        preencherLocalizacao();

        preencherStatus();

        preencherAvaliacao();

        preencherInstrumentos();

        preencherGeneros();

        preencherServicos();

        preencherPortfolio();

        preencherVideos();

        preencherAudios();

        preencherAgenda(
            dadosPerfil.agenda
        );

        preencherAvaliacoes();


        document.title =
            `${dadosPerfil.nome} | MusicalWorld`;

    }


    function preencherAvatar() {

        const container =
            document.getElementById(
                "profileAvatar"
            );


        const iniciais =
            document.getElementById(
                "profileInitials"
            );


        if (!container) {
            return;
        }


        container
            .querySelectorAll("img")
            .forEach(
                imagem =>
                    imagem.remove()
            );


        if (
            dadosPerfil?.foto
        ) {

            const imagem =
                document.createElement(
                    "img"
                );


            imagem.src =
                dadosPerfil.foto;


            imagem.alt =
                dadosPerfil.nome ||
                "Foto do músico";


            imagem.loading =
                "lazy";


            imagem.onerror =
                () => {

                    imagem.remove();

                    if (iniciais) {

                        iniciais.style.display =
                            "grid";

                    }

                };


            container.prepend(
                imagem
            );


            if (iniciais) {

                iniciais.style.display =
                    "none";

            }


            return;

        }


        if (iniciais) {

            iniciais.textContent =
                gerarIniciais(
                    dadosPerfil?.nome
                );

            iniciais.style.display =
                "grid";

        }

    }


    function preencherLocalizacao() {

        const elemento =
            document.getElementById(
                "profileLocation"
            );


        if (!elemento) {
            return;
        }


        const texto =
            elemento.querySelector(
                "span"
            );


        if (texto) {

            texto.textContent =
                dadosPerfil?.localizacao ||
                "Localização não informada";

        }

    }


    function preencherStatus() {

        const elemento =
            document.getElementById(
                "profileStatus"
            );


        if (!elemento) {
            return;
        }


        elemento.textContent =
            dadosPerfil?.disponibilidade
                ? "Disponível para contratação"
                : "Indisponível para contratação";


        elemento.style.background =
            dadosPerfil?.disponibilidade
                ? "#ecfdf3"
                : "#f3f4f6";


        elemento.style.color =
            dadosPerfil?.disponibilidade
                ? "#16804b"
                : "#667085";

    }


    function preencherAvaliacao() {

        const valor =
            document.getElementById(
                "ratingValue"
            );


        const quantidade =
            document.getElementById(
                "ratingReviews"
            );


        if (valor) {

            valor.textContent =
                Number(
                    dadosPerfil?.avaliacao?.media ||
                    0
                )
                    .toFixed(1)
                    .replace(
                        ".",
                        ","
                    );

        }


        if (quantidade) {

            const total =
                Number(
                    dadosPerfil?.avaliacao?.total ||
                    0
                );


            quantidade.textContent =
                `(${total} ${
                    total === 1
                        ? "avaliação"
                        : "avaliações"
                })`;

        }


        const estrelas =
            document.querySelectorAll(
                "#profileRating .rating-stars svg"
            );


        const media =
            Number(
                dadosPerfil?.avaliacao?.media ||
                0
            );


        estrelas.forEach(
            (estrela, indice) => {

                estrela.style.fill =
                    indice + 1 <=
                    Math.round(media)
                        ? "#f5b942"
                        : "none";

            }
        );

    }


    function gerarEstrelas(
        nota
    ) {

        const numero =
            Number(nota || 0);


        let html = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            html += `
                <i
                    data-lucide="star"
                    class="${i <= Math.round(numero) ? "preenchida" : ""}"
                ></i>
            `;

        }


        return html;

    }


    function preencherInstrumentos() {

        const container =
            document.getElementById(
                "instrumentGrid"
            );


        if (!container) {
            return;
        }


        const instrumentos =
            dadosPerfil?.instrumentos || [];


        if (!instrumentos.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="music-2"></i>
                    <strong>
                        Nenhum instrumento cadastrado
                    </strong>
                    <span>
                        Este músico ainda não cadastrou seus instrumentos.
                    </span>
                </div>
            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            instrumentos
                .map(
                    instrumento => `
                        <div class="instrument-card">

                            <div class="instrument-icon">
                                <i data-lucide="music-2"></i>
                            </div>

                            <div class="instrument-info">

                                <strong>
                                    ${escaparHtml(
                                        instrumento
                                    )}
                                </strong>

                                <span>
                                    Instrumento
                                </span>

                            </div>

                        </div>
                    `
                )
                .join("");


        atualizarIcones();

    }


    function preencherGeneros() {

        const container =
            document.getElementById(
                "genreList"
            );


        if (!container) {
            return;
        }


        const generos =
            dadosPerfil?.generos || [];


        if (!generos.length) {

            container.innerHTML = `
                <span class="empty-inline">
                    Nenhum gênero cadastrado.
                </span>
            `;

            return;

        }


        container.innerHTML =
            generos
                .map(
                    genero => `
                        <span class="genre-tag">
                            ${escaparHtml(genero)}
                        </span>
                    `
                )
                .join("");

    }


    function preencherServicos() {

        const container =
            document.getElementById(
                "servicesList"
            );


        if (!container) {
            return;
        }


        const servicos =
            dadosPerfil?.servicos || [];


        if (!servicos.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="briefcase-business"></i>
                    <strong>
                        Nenhum serviço cadastrado
                    </strong>
                    <span>
                        Nenhum serviço foi informado.
                    </span>
                </div>
            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            servicos
                .map(
                    servico => `
                        <div class="service-card">

                            <i
                                class="service-icon"
                                data-lucide="briefcase-business"
                            ></i>

                            <div class="service-info">

                                <strong>
                                    ${escaparHtml(servico)}
                                </strong>

                                <span>
                                    Serviço
                                </span>

                            </div>

                        </div>
                    `
                )
                .join("");


        atualizarIcones();

    }


    function preencherPortfolio() {

        const container =
            document.getElementById(
                "portfolioGrid"
            );


        if (!container) {
            return;
        }


        const itens =
            dadosPerfil?.portfolio || [];


        if (!itens.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="images"></i>
                    <strong>
                        Portfólio vazio
                    </strong>
                    <span>
                        Este músico ainda não adicionou trabalhos.
                    </span>
                </div>
            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            itens
                .map(
                    item => {

                        const imagem =
                            item.thumbnail_url ||
                            item.arquivo_url ||
                            "";


                        return `
                            <article class="portfolio-card">

                                ${
                                    imagem
                                        ? `
                                            <img
                                                src="${escaparHtml(imagem)}"
                                                alt="${escaparHtml(item.titulo || "Portfólio")}"
                                                loading="lazy"
                                            >
                                        `
                                        : `
                                            <div class="empty-state">
                                                <i data-lucide="file"></i>
                                            </div>
                                        `
                                }

                                <div class="portfolio-overlay">

                                    <strong>
                                        ${escaparHtml(
                                            item.titulo ||
                                            "Sem título"
                                        )}
                                    </strong>

                                    <span>
                                        ${escaparHtml(
                                            item.descricao ||
                                            item.tipo ||
                                            ""
                                        )}
                                    </span>

                                </div>

                            </article>
                        `;

                    }
                )
                .join("");


        atualizarIcones();

    }


    function preencherVideos() {

        const container =
            document.getElementById(
                "videoList"
            );


        if (!container) {
            return;
        }


        const videos =
            dadosPerfil?.videos || [];


        if (!videos.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="video"></i>
                    <strong>
                        Nenhum vídeo cadastrado
                    </strong>
                    <span>
                        Os vídeos deste músico aparecerão aqui.
                    </span>
                </div>
            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            videos
                .map(
                    video => `
                        <div class="video-item">

                            <video
                                src="${escaparHtml(video.arquivo_url)}"
                                controls
                                preload="metadata"
                                playsinline
                            ></video>

                        </div>
                    `
                )
                .join("");

    }


    function preencherAudios() {

        const container =
            document.getElementById(
                "audioList"
            );


        if (!container) {
            return;
        }


        const audios =
            dadosPerfil?.audios || [];


        if (!audios.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="headphones"></i>
                    <strong>
                        Nenhum áudio cadastrado
                    </strong>
                    <span>
                        As gravações deste músico aparecerão aqui.
                    </span>
                </div>
            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            audios
                .map(
                    audio => `
                        <article class="audio-card">

                            <div class="audio-header">

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

                                    <span>
                                        ${escaparHtml(
                                            audio.descricao ||
                                            "Gravação musical"
                                        )}
                                    </span>

                                </div>

                            </div>

                            <audio
                                class="audio-player"
                                src="${escaparHtml(audio.arquivo_url)}"
                                controls
                                preload="metadata"
                            ></audio>

                        </article>
                    `
                )
                .join("");


        atualizarIcones();

    }


    /* =====================================================
       AGENDA PÚBLICA
    ====================================================== */

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


        const calendario =
            container.querySelector(
                ".agenda-calendar"
            );


        if (!calendario) {

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


            atualizarIcones();

        }


        inicializarControlesAgenda();

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
         * JavaScript:
         * domingo = 0
         * segunda = 1
         *
         * O calendário começa na segunda-feira.
         */

        diaSemana =
            diaSemana === 0
                ? 6
                : diaSemana - 1;


        const quantidadeDias =
            ultimoDia.getDate();


        grid.innerHTML = "";


        /* Dias do mês anterior */

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


        /* Dias do mês atual */

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
         * Completa a última linha do calendário.
         */

        const totalCelulas =
            diaSemana +
            quantidadeDias;


        const faltantes =
            (7 -
                (totalCelulas % 7)) %
            7;


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


        if (
            dataNormalizada <
            hoje
        ) {

            return {

                classe:
                    "passado",

                label:
                    "Data passada",

                mostrarStatus:
                    false,

                hoje:
                    false

            };

        }


        /*
         * Primeiro verificamos se existe
         * compromisso neste dia.
         *
         * Agendado sempre tem prioridade.
         */

        const agendado =
            existeCompromissoNoDia(
                dataNormalizada,
                agenda
            );


        if (agendado) {

            return {

                classe:
                    "agendado",

                label:
                    "Agendado",

                mostrarStatus:
                    true,

                hoje:
                    datasIguais(
                        dataNormalizada,
                        hoje
                    )

            };

        }


        /*
         * Se o músico estiver indisponível
         * globalmente, os dias livres ficam
         * como indisponíveis.
         */

        if (
            dadosPerfil?.disponibilidade === false
        ) {

            return {

                classe:
                    "indisponivel",

                label:
                    "Indisponível",

                mostrarStatus:
                    true,

                hoje:
                    datasIguais(
                        dataNormalizada,
                        hoje
                    )

            };

        }


        /*
         * Sem compromisso e músico disponível:
         * dia disponível.
         */

        return {

            classe:
                "disponivel",

            label:
                "Disponível",

            mostrarStatus:
                true,

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
            evento => {

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
            new Date(valor);


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


    function preencherAvaliacoes() {

        const container =
            document.getElementById(
                "reviewsList"
            );


        if (!container) {
            return;
        }


        const avaliacoes =
            dadosPerfil?.avaliacoes || [];


        if (!avaliacoes.length) {

            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="star"></i>
                    <strong>
                        Ainda não há avaliações
                    </strong>
                    <span>
                        As avaliações aparecerão aqui após os trabalhos realizados.
                    </span>
                </div>
            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            avaliacoes
                .map(
                    avaliacao => {

                        const nome =
                            avaliacao.usuario?.nome ||
                            avaliacao.nome ||
                            "Contratante";


                        const foto =
                            avaliacao.usuario?.foto_url ||
                            "";


                        const nota =
                            Number(
                                avaliacao.nota ||
                                avaliacao.avaliacao ||
                                0
                            );


                        const texto =
                            avaliacao.comentario ||
                            avaliacao.descricao ||
                            avaliacao.texto ||
                            "";


                        return `
                            <article class="review-card">

                                <div class="review-header">

                                    <div class="review-user">

                                        <div class="review-avatar">

                                            ${
                                                foto
                                                    ? `
                                                        <img
                                                            src="${escaparHtml(foto)}"
                                                            alt="${escaparHtml(nome)}"
                                                            loading="lazy"
                                                        >
                                                    `
                                                    : `
                                                        ${escaparHtml(
                                                            gerarIniciais(nome)
                                                        )}
                                                    `
                                            }

                                        </div>

                                        <div>

                                            <strong>
                                                ${escaparHtml(nome)}
                                            </strong>

                                            <span>
                                                ${formatarData(
                                                    avaliacao.created_at
                                                )}
                                            </span>

                                        </div>

                                    </div>


                                    <div class="review-stars">

                                        ${gerarEstrelas(nota)}

                                    </div>

                                </div>


                                ${
                                    texto
                                        ? `
                                            <p class="review-text">
                                                ${escaparHtml(texto)}
                                            </p>
                                        `
                                        : ""
                                }

                            </article>
                        `;

                    }
                )
                .join("");


        atualizarIcones();

    }


    /* =====================================================
       BOTÕES
    ====================================================== */

    function inicializarBotoes() {

        const voltar =
            document.getElementById(
                "btnVoltar"
            );


        const compartilhar =
            document.getElementById(
                "btnCompartilhar"
            );


        const contato =
            document.getElementById(
                "btnContato"
            );


        const contratar =
            document.getElementById(
                "btnContratar"
            );


        if (voltar) {

            voltar.addEventListener(
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


        if (compartilhar) {

            compartilhar.addEventListener(
                "click",
                compartilharPerfil
            );

        }


        if (contato) {

            contato.addEventListener(
                "click",
                entrarEmContato
            );

        }


        if (contratar) {

            contratar.addEventListener(
                "click",
                contratarMusico
            );

        }

    }


    function entrarEmContato() {

        if (
            !dadosPerfil?.telefone
        ) {

            mostrarToast(
                "Este músico ainda não informou um telefone."
            );

            return;

        }


        const telefone =
            normalizarTelefone(
                dadosPerfil.telefone
            );


        if (!telefone) {

            mostrarToast(
                "Telefone não disponível."
            );

            return;

        }


        const mensagem =
            encodeURIComponent(
                `Olá, ${dadosPerfil.nome}! Encontrei seu perfil no MusicalWorld e gostaria de saber mais sobre seus serviços.`
            );


        window.open(
            `https://wa.me/${telefone}?text=${mensagem}`,
            "_blank"
        );

    }


    function contratarMusico() {

        const url =
            `${window.location.origin}${window.location.pathname}?id=${perfilId}`;


        sessionStorage.setItem(
            "musicalworld_perfil_contratacao",
            JSON.stringify({
                perfilId,
                nome:
                    dadosPerfil?.nome ||
                    ""
            })
        );


        /*
         * Mantemos o botão preparado para
         * a futura tela de contratação.
         */

        mostrarToast(
            "A contratação deste músico será iniciada em breve."
        );

    }


    async function compartilharPerfil() {

        const url =
            `${window.location.origin}${window.location.pathname}?id=${perfilId}`;


        const texto =
            `Confira o perfil de ${dadosPerfil?.nome || "um músico"} no MusicalWorld.`;


        try {

            if (
                navigator.share
            ) {

                await navigator.share({
                    title:
                        `${dadosPerfil?.nome || "Perfil"} | MusicalWorld`,
                    text:
                        texto,
                    url
                });


                return;

            }


            if (
                navigator.clipboard
            ) {

                await navigator.clipboard.writeText(
                    url
                );


                mostrarToast(
                    "Link do perfil copiado!"
                );


                return;

            }


            mostrarToast(
                "Não foi possível compartilhar o perfil."
            );


        } catch (erro) {

            if (
                erro?.name ===
                "AbortError"
            ) {

                return;

            }


            console.error(
                "Erro ao compartilhar:",
                erro
            );

        }

    }


    /* =====================================================
       HELPERS
    ====================================================== */

    function normalizarArray(
        valor
    ) {

        if (
            Array.isArray(valor)
        ) {

            return valor
                .filter(Boolean)
                .map(
                    item =>
                        String(item).trim()
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
                    item =>
                        item.trim()
                )
                .filter(Boolean);

        }


        return [];

    }


    function normalizarTelefone(
        telefone
    ) {

        return String(
            telefone || ""
        )
            .replace(
                /\D/g,
                ""
            );

    }


    function definirTexto(
        id,
        texto
    ) {

        const elemento =
            document.getElementById(
                id
            );


        if (elemento) {

            elemento.textContent =
                texto ?? "";

        }

    }


    function gerarIniciais(
        nome
    ) {

        const partes =
            String(
                nome ||
                "Músico"
            )
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {
            return "MU";
        }


        if (
            partes.length === 1
        ) {

            return partes[0]
                .slice(0, 2)
                .toUpperCase();

        }


        return (
            partes[0][0] +
            partes[
                partes.length - 1
            ][0]
        ).toUpperCase();

    }


    function formatarData(
        data
    ) {

        if (!data) {
            return "Data não informada";
        }


        const objeto =
            new Date(data);


        if (
            Number.isNaN(
                objeto.getTime()
            )
        ) {

            return "Data inválida";

        }


        return objeto.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

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


    function atualizarIcones() {

        if (
            window.lucide
        ) {

            lucide.createIcons();

        }

    }


    function mostrarToast(
        mensagem
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


        toast.classList.add(
            "visivel"
        );


        clearTimeout(
            mostrarToast.timer
        );


        mostrarToast.timer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "visivel"
                    );

                },
                3500
            );

    }


    function mostrarErroPagina(
        mensagem
    ) {

        const pagina =
            document.querySelector(
                ".profile-page"
            );


        if (!pagina) {
            return;
        }


        pagina.innerHTML = `
            <section class="profile-section">

                <div class="empty-state">

                    <i data-lucide="circle-alert"></i>

                    <strong>
                        Não foi possível carregar o perfil
                    </strong>

                    <span>
                        ${escaparHtml(mensagem)}
                    </span>

                    <button
                        type="button"
                        class="contact-button"
                        style="margin-top:10px;padding:10px 16px;"
                        onclick="window.history.back()"
                    >
                        Voltar
                    </button>

                </div>

            </section>
        `;


        atualizarIcones();

    }


    return {

        inicializar

    };

})();


document.addEventListener(
    "DOMContentLoaded",
    () => {

        MusicalWorldApresentarPerfilMusico.inicializar();

    }
);