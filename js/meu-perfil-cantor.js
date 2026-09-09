(function () {
    "use strict";

    const MusicalWorldMeuPerfilCantor = {

        CONFIG: {
            tabelas: {
                usuarios: "usuarios",
                perfis: "perfis",
                tiposPerfil: "tipos_perfil",
                perfisArtistas: "perfis_artistas",
                portfolio: "portfolio_musicos",
                agenda: "agenda_musicos",
                avaliacoes: "avaliacoes_musicos",
                carteira: "carteiras_musicos",
                transacoes: "transacoes_carteira"
            },

            storage: {
                perfil: "musicalworld_perfil_cantor",
                carteira: "musicalworld_carteira_cantor"
            },

            tipoPerfilEsperado: "artista",
            tipoArtistaEsperado: "Cantor(a)"
        },

        estado: {
            usuarioId: null,
            usuario: null,
            perfil: null,
            perfilArtista: null,
            portfolio: [],
            agenda: [],
            avaliacoes: [],
            carteira: null,
            transacoes: [],
            mesAtual: new Date(),
            perfilId: null
        },


        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        async inicializar() {

            try {

                this.configurarEventos();

                this.renderizarIcones();

                const usuarioId =
                    await this.obterUsuarioId();

                if (!usuarioId) {

                    this.mostrarToast(
                        "Faça login para acessar seu perfil."
                    );

                    this.redirecionarLogin();

                    return;
                }

                this.estado.usuarioId =
                    usuarioId;

                await this.carregarUsuario(
                    usuarioId
                );

                const acesso =
                    await this.verificarPerfilCantor(
                        usuarioId
                    );

                if (!acesso) {

                    this.mostrarToast(
                        "Perfil de cantor não encontrado."
                    );

                    return;
                }

                await this.carregarDoSupabase();

                await this.carregarCarteiraReal();

                this.preencherPerfil();

                this.inicializarAbas();

                this.renderizarIcones();

            } catch (erro) {

                console.error(
                    "Erro ao inicializar perfil de cantor:",
                    erro
                );

                this.mostrarToast(
                    "Não foi possível carregar seu perfil."
                );
            }
        },


        /* =====================================================
           SUPABASE
           ===================================================== */

        obterClienteSupabase() {

            if (window.supabaseClient) {
                return window.supabaseClient;
            }

            if (window._supabase) {
                return window._supabase;
            }

            if (window.supabase) {
                return window.supabase;
            }

            console.error(
                "Cliente Supabase não encontrado."
            );

            return null;
        },


        async obterUsuarioId() {

            try {

                if (
                    window.UsuarioAtual &&
                    typeof window.UsuarioAtual.obterId ===
                    "function"
                ) {

                    const id =
                        await window.UsuarioAtual.obterId();

                    if (id) {
                        return id;
                    }
                }

                const supabase =
                    this.obterClienteSupabase();

                if (!supabase) {
                    return null;
                }

                const {
                    data,
                    error
                } =
                    await supabase.auth.getUser();

                if (error) {

                    console.error(
                        "Erro ao obter usuário autenticado:",
                        error
                    );

                    return null;
                }

                return data?.user?.id || null;

            } catch (erro) {

                console.error(
                    "Erro ao obter usuário:",
                    erro
                );

                return null;
            }
        },


        /* =====================================================
           CARREGAR USUÁRIO
           ===================================================== */

        async carregarUsuario(usuarioId) {

            const supabase =
                this.obterClienteSupabase();

            if (!supabase || !usuarioId) {
                return;
            }

            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas.usuarios
                        )
                        .select("*")
                        .eq("id", usuarioId)
                        .maybeSingle();

                if (error) {

                    console.error(
                        "Erro ao carregar dados do usuário:",
                        error
                    );

                    this.estado.usuario =
                        null;

                    return;
                }

                this.estado.usuario =
                    data || null;

                console.log(
                    "Usuário carregado:",
                    this.estado.usuario
                );

            } catch (erro) {

                console.error(
                    "Erro ao carregar usuário:",
                    erro
                );

                this.estado.usuario =
                    null;
            }
        },


        /* =====================================================
           NORMALIZAR TIPO DE ARTISTA
           ===================================================== */

        normalizarTipoArtista(tipo) {

            const valor =
                String(tipo || "")
                    .trim()
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    );

            if (
                valor === "cantor" ||
                valor === "cantora" ||
                valor === "cantor(a)"
            ) {

                return "cantor(a)";
            }

            if (
                valor === "musico" ||
                valor === "musica" ||
                valor === "musico(a)"
            ) {

                return "musico(a)";
            }

            if (
                valor === "banda"
            ) {

                return "banda";
            }

            if (
                valor === "dupla" ||
                valor === "dupla musical"
            ) {

                return "dupla musical";
            }

            if (
                valor === "dj"
            ) {

                return "dj";
            }

            if (
                valor === "dancarino" ||
                valor === "dancarina" ||
                valor === "dancarino(a)"
            ) {

                return "dancarino(a)";
            }

            if (
                valor === "grupo de danca"
            ) {

                return "grupo de danca";
            }

            if (
                valor === "mc"
            ) {

                return "mc";
            }

            if (
                valor === "compositor" ||
                valor === "compositora" ||
                valor === "compositor(a)"
            ) {

                return "compositor(a)";
            }

            if (
                valor === "produtor musical" ||
                valor === "produtora musical" ||
                valor === "produtor(a) musical"
            ) {

                return "produtor(a) musical";
            }

            return "";
        },


        /* =====================================================
           VERIFICAR PERFIL DO CANTOR
           ===================================================== */

        async verificarPerfilCantor(usuarioId) {

            const supabase =
                this.obterClienteSupabase();

            if (!supabase) {
                return false;
            }

            try {

                const {
                    data: perfis,
                    error
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas.perfis
                        )
                        .select(`
                            *,
                            tipos_perfil (
                                id,
                                nome
                            )
                        `)
                        .eq(
                            "usuario_id",
                            usuarioId
                        );

                if (error) {
                    throw error;
                }

                if (
                    !Array.isArray(perfis) ||
                    perfis.length === 0
                ) {

                    console.warn(
                        "Nenhum perfil encontrado para o usuário."
                    );

                    return false;
                }

                const perfilArtista =
                    perfis.find(
                        perfil =>
                            String(
                                perfil?.tipos_perfil?.nome ||
                                ""
                            )
                                .trim()
                                .toLowerCase() ===
                            this.CONFIG
                                .tipoPerfilEsperado
                                .toLowerCase()
                    );

                if (!perfilArtista) {

                    console.warn(
                        "Perfil do tipo artista não encontrado."
                    );

                    return false;
                }

                this.estado.perfil =
                    perfilArtista;

                this.estado.perfilId =
                    perfilArtista.id;

                const {
                    data: perfilArtistaDados,
                    error: erroArtista
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas
                                .perfisArtistas
                        )
                        .select("*")
                        .eq(
                            "perfil_id",
                            perfilArtista.id
                        )
                        .maybeSingle();

                if (erroArtista) {
                    throw erroArtista;
                }

                if (!perfilArtistaDados) {

                    console.warn(
                        "Registro em perfis_artistas não encontrado."
                    );

                    return false;
                }

                this.estado.perfilArtista =
                    perfilArtistaDados;

                const tipoArtistaOriginal =
                    String(
                        perfilArtistaDados.tipo_artista ||
                        ""
                    ).trim();

                const tipoArtista =
                    this.normalizarTipoArtista(
                        tipoArtistaOriginal
                    );

                console.log(
                    "Tipo de artista encontrado:",
                    tipoArtistaOriginal
                );

                console.log(
                    "Tipo de artista normalizado:",
                    tipoArtista
                );

                if (
                    tipoArtista &&
                    tipoArtista !== "cantor(a)"
                ) {

                    console.warn(
                        "O perfil encontrado não é do tipo Cantor."
                    );

                    return false;
                }

                /*
                 * Caso o campo esteja vazio, mantemos
                 * a compatibilidade com perfis antigos.
                 */

                if (!tipoArtista) {

                    console.warn(
                        "O perfil não possui um tipo de artista válido."
                    );

                    return false;
                }

                return true;

            } catch (erro) {

                console.error(
                    "Erro ao verificar perfil do cantor:",
                    erro
                );

                return false;
            }
        },


        /* =====================================================
           CARREGAR DADOS DO SUPABASE
           ===================================================== */

        async carregarDoSupabase() {

            const supabase =
                this.obterClienteSupabase();

            if (
                !supabase ||
                !this.estado.perfilId
            ) {
                return;
            }

            const perfilId =
                this.estado.perfilId;


            /* -------------------------------------------------
               PORTFÓLIO
               ------------------------------------------------- */

            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas.portfolio
                        )
                        .select("*")
                        .eq(
                            "perfil_id",
                            perfilId
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

                if (error) {

                    console.error(
                        "Erro ao carregar portfólio:",
                        error
                    );

                    this.estado.portfolio =
                        [];

                } else {

                    this.estado.portfolio =
                        Array.isArray(data)
                            ? data
                            : [];
                }

            } catch (erro) {

                console.error(
                    "Erro no portfólio:",
                    erro
                );

                this.estado.portfolio =
                    [];
            }


            /* -------------------------------------------------
               AGENDA
               ------------------------------------------------- */

            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas.agenda
                        )
                        .select("*")
                        .eq(
                            "perfil_id",
                            perfilId
                        )
                        .order(
                            "data_inicio",
                            {
                                ascending: true
                            }
                        );

                if (error) {

                    console.error(
                        "Erro ao carregar agenda:",
                        error
                    );

                    this.estado.agenda =
                        [];

                } else {

                    this.estado.agenda =
                        Array.isArray(data)
                            ? data
                            : [];
                }

            } catch (erro) {

                console.error(
                    "Erro na agenda:",
                    erro
                );

                this.estado.agenda =
                    [];
            }


            /* -------------------------------------------------
               AVALIAÇÕES
               ------------------------------------------------- */

            try {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas.avaliacoes
                        )
                        .select("*")
                        .eq(
                            "perfil_id",
                            perfilId
                        )
                        .order(
                            "created_at",
                            {
                                ascending: false
                            }
                        );

                if (error) {

                    console.error(
                        "Erro ao carregar avaliações:",
                        error
                    );

                    this.estado.avaliacoes =
                        [];

                } else {

                    this.estado.avaliacoes =
                        Array.isArray(data)
                            ? data
                            : [];
                }

            } catch (erro) {

                console.error(
                    "Erro nas avaliações:",
                    erro
                );

                this.estado.avaliacoes =
                    [];
            }


            /* -------------------------------------------------
               CACHE LOCAL
               ------------------------------------------------- */

            try {

                localStorage.setItem(
                    this.CONFIG.storage.perfil,
                    JSON.stringify({
                        usuario:
                            this.estado.usuario,

                        perfil:
                            this.estado.perfil,

                        perfilArtista:
                            this.estado.perfilArtista
                    })
                );

            } catch (erro) {

                console.warn(
                    "Não foi possível salvar cache local:",
                    erro
                );
            }
        },


        /* =====================================================
           CARTEIRA
           ===================================================== */

        async carregarCarteiraReal() {

            const supabase =
                this.obterClienteSupabase();

            if (
                !supabase ||
                !this.estado.perfilId
            ) {
                return;
            }

            try {

                const {
                    data: carteira,
                    error
                } =
                    await supabase
                        .from(
                            this.CONFIG.tabelas.carteira
                        )
                        .select("*")
                        .eq(
                            "perfil_id",
                            this.estado.perfilId
                        )
                        .maybeSingle();

                if (error) {

                    console.error(
                        "Erro ao carregar carteira:",
                        error
                    );

                    this.estado.carteira =
                        null;

                } else {

                    this.estado.carteira =
                        carteira || null;
                }


                if (
                    this.estado.carteira?.id
                ) {

                    const {
                        data: transacoes,
                        error: erroTransacoes
                    } =
                        await supabase
                            .from(
                                this.CONFIG.tabelas
                                    .transacoes
                            )
                            .select("*")
                            .eq(
                                "carteira_id",
                                this.estado
                                    .carteira
                                    .id
                            )
                            .order(
                                "created_at",
                                {
                                    ascending: false
                                }
                            );

                    if (erroTransacoes) {

                        console.error(
                            "Erro ao carregar transações:",
                            erroTransacoes
                        );

                        this.estado.transacoes =
                            [];

                    } else {

                        this.estado.transacoes =
                            Array.isArray(
                                transacoes
                            )
                                ? transacoes
                                : [];
                    }

                } else {

                    this.estado.transacoes =
                        [];
                }


                try {

                    localStorage.setItem(
                        this.CONFIG.storage.carteira,
                        JSON.stringify({
                            carteira:
                                this.estado.carteira,

                            transacoes:
                                this.estado.transacoes
                        })
                    );

                } catch (erro) {

                    console.warn(
                        "Erro ao salvar carteira local:",
                        erro
                    );
                }


                this.renderizarCarteira();

            } catch (erro) {

                console.error(
                    "Erro geral ao carregar carteira:",
                    erro
                );
            }
        },


        /* =====================================================
           PREENCHER PERFIL
           ===================================================== */

        preencherPerfil() {

            const usuario =
                this.estado.usuario || {};

            const perfil =
                this.estado.perfil || {};

            const artista =
                this.estado.perfilArtista || {};


            /* -------------------------------------------------
               NOME
               ------------------------------------------------- */

            const nome =
                usuario.nome ||
                usuario.nome_completo ||
                usuario.nome_artistico ||
                perfil.nome ||
                perfil.nome_completo ||
                perfil.nome_artistico ||
                "Cantor";

            console.log(
                "Nome utilizado no perfil:",
                nome
            );


            this.definirTexto(
                "profileName",
                nome
            );


            /* -------------------------------------------------
               CATEGORIA
               ------------------------------------------------- */

            this.definirTexto(
                "profileCategory",
                artista.tipo_artista ||
                "Cantor(a)"
            );


            /* -------------------------------------------------
               LOCALIZAÇÃO
               ------------------------------------------------- */

            this.definirLocalizacao(
                artista.localizacao
            );


            /* -------------------------------------------------
               BIO
               ------------------------------------------------- */

            const bio =
                perfil.bio ||
                perfil.descricao ||
                perfil.apresentacao ||
                artista.apresentacao ||
                "Nenhuma apresentação cadastrada.";

            this.definirTexto(
                "profileBio",
                bio
            );


            /* -------------------------------------------------
               EXPERIÊNCIA
               ------------------------------------------------- */

            this.definirTexto(
                "profileExperience",
                artista.experiencia ||
                "Não informado"
            );


            /* -------------------------------------------------
               ÁREA DE ATENDIMENTO
               ------------------------------------------------- */

            this.definirTexto(
                "profileArea",
                artista.area_atendimento ||
                "Não informado"
            );


            /* -------------------------------------------------
               TIPO
               ------------------------------------------------- */

            this.definirTexto(
                "profileType",
                artista.tipo_artista ||
                "Cantor(a)"
            );


            /* -------------------------------------------------
               DISPONIBILIDADE
               ------------------------------------------------- */

            this.definirDisponibilidade(
                artista.disponivel
            );


            /* -------------------------------------------------
               FOTO
               ------------------------------------------------- */

            this.definirAvatar(
                artista.foto_url,
                nome
            );


            /* -------------------------------------------------
               GÊNEROS
               ------------------------------------------------- */

            this.renderizarGeneros(
                artista.estilos
            );


            /* -------------------------------------------------
               SERVIÇOS
               ------------------------------------------------- */

            this.renderizarServicos(
                artista.servicos
            );


            /* -------------------------------------------------
               PORTFÓLIO
               ------------------------------------------------- */

            this.renderizarPortfolio();


            /* -------------------------------------------------
               AGENDA
               ------------------------------------------------- */

            this.renderizarAgenda();


            /* -------------------------------------------------
               AVALIAÇÕES
               ------------------------------------------------- */

            this.renderizarAvaliacoes();


            /* -------------------------------------------------
               CARTEIRA
               ------------------------------------------------- */

            this.renderizarCarteira();


            /* -------------------------------------------------
               LINK DO PERFIL
               ------------------------------------------------- */

            this.atualizarLinkPerfil();


            /* -------------------------------------------------
               RATING
               ------------------------------------------------- */

            this.atualizarRating();
        },


        /* =====================================================
           TEXTO
           ===================================================== */

        definirTexto(id, texto) {

            const elemento =
                document.getElementById(id);

            if (!elemento) {
                return;
            }

            elemento.textContent =
                texto === null ||
                texto === undefined ||
                texto === ""
                    ? "Não informado"
                    : String(texto);
        },


        /* =====================================================
           LOCALIZAÇÃO
           ===================================================== */

        definirLocalizacao(localizacao) {

            const elemento =
                document.getElementById(
                    "profileLocation"
                );

            if (!elemento) {
                return;
            }

            const span =
                elemento.querySelector("span");

            if (!span) {
                return;
            }

            span.textContent =
                localizacao ||
                "Localização não informada";
        },


        /* =====================================================
           DISPONIBILIDADE
           ===================================================== */

        definirDisponibilidade(disponivel) {

            const elemento =
                document.getElementById(
                    "profileStatus"
                );

            if (!elemento) {
                return;
            }

            const texto =
                elemento.querySelector(
                    ".status-text"
                );

            const estaDisponivel =
                disponivel === true ||
                disponivel === "true" ||
                disponivel === 1;

            elemento.classList.toggle(
                "available",
                estaDisponivel
            );

            elemento.classList.toggle(
                "unavailable",
                !estaDisponivel
            );

            if (texto) {

                texto.textContent =
                    estaDisponivel
                        ? "Disponível"
                        : "Indisponível";
            }

            this.definirTexto(
                "profileAvailability",
                estaDisponivel
                    ? "Disponível"
                    : "Indisponível"
            );
        },


        /* =====================================================
           AVATAR
           ===================================================== */

        definirAvatar(url, nome) {

            const avatar =
                document.getElementById(
                    "profileAvatar"
                );

            if (!avatar) {
                return;
            }

            avatar.innerHTML = "";


            if (url) {

                const img =
                    document.createElement("img");

                img.src =
                    url;

                img.alt =
                    `Foto de ${nome || "Cantor"}`;

                img.addEventListener(
                    "error",
                    () => {

                        avatar.innerHTML =
                            "";

                        const span =
                            document.createElement(
                                "span"
                            );

                        span.id =
                            "profileInitials";

                        span.textContent =
                            this.obterIniciais(
                                nome
                            );

                        avatar.appendChild(
                            span
                        );
                    }
                );

                avatar.appendChild(
                    img
                );

                return;
            }


            const span =
                document.createElement(
                    "span"
                );

            span.id =
                "profileInitials";

            span.textContent =
                this.obterIniciais(
                    nome
                );

            avatar.appendChild(
                span
            );
        },


        obterIniciais(nome) {

            if (!nome) {
                return "C";
            }

            const partes =
                String(nome)
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean);

            if (
                partes.length === 1
            ) {

                return partes[0]
                    .substring(0, 2)
                    .toUpperCase();
            }

            return (
                partes[0][0] +
                partes[partes.length - 1][0]
            ).toUpperCase();
        },


        /* =====================================================
           RATING
           ===================================================== */

        atualizarRating() {

            const avaliacoes =
                this.estado.avaliacoes || [];

            let media = 0;

            if (
                avaliacoes.length > 0
            ) {

                const valores =
                    avaliacoes
                        .map(avaliacao =>
                            Number(
                                avaliacao.nota ??
                                avaliacao.rating ??
                                avaliacao.estrelas ??
                                0
                            )
                        )
                        .filter(valor =>
                            Number.isFinite(valor)
                        );

                if (
                    valores.length > 0
                ) {

                    media =
                        valores.reduce(
                            (
                                total,
                                valor
                            ) =>
                                total + valor,
                            0
                        ) /
                        valores.length;
                }
            }

            const ratingValue =
                document.getElementById(
                    "ratingValue"
                );

            const ratingReviews =
                document.getElementById(
                    "ratingReviews"
                );

            if (ratingValue) {

                ratingValue.textContent =
                    media
                        .toFixed(1)
                        .replace(
                            ".",
                            ","
                        );
            }

            if (ratingReviews) {

                ratingReviews.textContent =
                    `(${avaliacoes.length} ${
                        avaliacoes.length === 1
                            ? "avaliação"
                            : "avaliações"
                    })`;
            }
        },


        /* =====================================================
           GÊNEROS
           ===================================================== */

        renderizarGeneros(estilos) {

            const container =
                document.getElementById(
                    "genreList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            const lista =
                this.normalizarArray(
                    estilos
                );

            if (
                lista.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "span"
                    );

                vazio.className =
                    "empty-inline";

                vazio.textContent =
                    "Nenhum estilo cadastrado.";

                container.appendChild(
                    vazio
                );

                return;
            }

            lista.forEach(
                estilo => {

                    const tag =
                        document.createElement(
                            "span"
                        );

                    tag.className =
                        "genre-tag";

                    tag.textContent =
                        estilo;

                    container.appendChild(
                        tag
                    );
                }
            );
        },


        /* =====================================================
           SERVIÇOS
           ===================================================== */

        renderizarServicos(servicos) {

            const container =
                document.getElementById(
                    "servicesList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            const lista =
                this.normalizarArray(
                    servicos
                );

            if (
                lista.length === 0
            ) {

                const vazio =
                    document.createElement(
                        "div"
                    );

                vazio.className =
                    "empty-state";

                vazio.innerHTML = `
                    <i data-lucide="music-2"></i>
                    <p>Nenhum serviço cadastrado.</p>
                `;

                container.appendChild(
                    vazio
                );

                this.renderizarIcones();

                return;
            }

            lista.forEach(
                servico => {

                    const tag =
                        document.createElement(
                            "span"
                        );

                    tag.className =
                        "service-tag";

                    tag.textContent =
                        servico;

                    container.appendChild(
                        tag
                    );
                }
            );
        },


        /* =====================================================
           PORTFÓLIO
           ===================================================== */

        renderizarPortfolio() {

            const portfolio =
                this.estado.portfolio || [];

            const imagens =
                portfolio.filter(
                    item =>
                        String(
                            item.tipo || ""
                        ).toLowerCase() ===
                        "imagem"
                );

            const videos =
                portfolio.filter(
                    item =>
                        String(
                            item.tipo || ""
                        ).toLowerCase() ===
                        "video"
                );

            const audios =
                portfolio.filter(
                    item =>
                        String(
                            item.tipo || ""
                        ).toLowerCase() ===
                        "audio"
                );

            this.renderizarImagens(
                imagens
            );

            this.renderizarVideos(
                videos
            );

            this.renderizarAudios(
                audios
            );
        },


        /* =====================================================
           IMAGENS
           ===================================================== */

        renderizarImagens(imagens) {

            const container =
                document.getElementById(
                    "portfolioGrid"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            if (!imagens.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="image"></i>
                        <p>Nenhuma imagem adicionada ao portfólio.</p>
                    </div>
                `;

                this.renderizarIcones();

                return;
            }

            imagens.forEach(
                item => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "portfolio-card";

                    const url =
                        item.url ||
                        item.arquivo_url ||
                        item.media_url ||
                        item.foto_url;

                    const titulo =
                        item.titulo ||
                        item.nome ||
                        "Imagem do portfólio";

                    const descricao =
                        item.descricao ||
                        "";

                    card.innerHTML = `
                        <div class="portfolio-image">
                            ${
                                url
                                    ? `<img src="${this.escaparHtml(url)}" alt="${this.escaparHtml(titulo)}">`
                                    : `<div class="empty-state"><i data-lucide="image"></i></div>`
                            }
                        </div>

                        <div class="portfolio-info">

                            <div class="portfolio-title">
                                ${this.escaparHtml(titulo)}
                            </div>

                            ${
                                descricao
                                    ? `<div class="portfolio-description">${this.escaparHtml(descricao)}</div>`
                                    : ""
                            }

                        </div>
                    `;

                    container.appendChild(
                        card
                    );
                }
            );

            this.renderizarIcones();
        },


        /* =====================================================
           VÍDEOS
           ===================================================== */

        renderizarVideos(videos) {

            const container =
                document.getElementById(
                    "videoList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            if (!videos.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="video"></i>
                        <p>Nenhum vídeo adicionado.</p>
                    </div>
                `;

                this.renderizarIcones();

                return;
            }

            videos.forEach(
                item => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "video-card";

                    const url =
                        item.url ||
                        item.arquivo_url ||
                        item.media_url;

                    const titulo =
                        item.titulo ||
                        item.nome ||
                        "Vídeo";

                    if (url) {

                        const video =
                            document.createElement(
                                "video"
                            );

                        video.src =
                            url;

                        video.controls =
                            true;

                        video.preload =
                            "metadata";

                        video.playsInline =
                            true;

                        card.appendChild(
                            video
                        );

                    } else {

                        const vazio =
                            document.createElement(
                                "div"
                            );

                        vazio.className =
                            "empty-state";

                        vazio.innerHTML = `
                            <i data-lucide="video"></i>
                            <p>Vídeo indisponível.</p>
                        `;

                        card.appendChild(
                            vazio
                        );
                    }

                    const tituloElemento =
                        document.createElement(
                            "div"
                        );

                    tituloElemento.className =
                        "video-title";

                    tituloElemento.textContent =
                        titulo;

                    card.appendChild(
                        tituloElemento
                    );

                    container.appendChild(
                        card
                    );
                }
            );

            this.renderizarIcones();
        },


        /* =====================================================
           ÁUDIOS
           ===================================================== */

        renderizarAudios(audios) {

            const container =
                document.getElementById(
                    "audioList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            if (!audios.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="headphones"></i>
                        <p>Nenhum áudio adicionado.</p>
                    </div>
                `;

                this.renderizarIcones();

                return;
            }

            audios.forEach(
                item => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "audio-card";

                    const url =
                        item.url ||
                        item.arquivo_url ||
                        item.media_url;

                    const titulo =
                        item.titulo ||
                        item.nome ||
                        "Áudio";

                    card.innerHTML = `
                        <div class="audio-icon">
                            <i data-lucide="headphones"></i>
                        </div>

                        <div class="audio-content">

                            <div class="audio-title">
                                ${this.escaparHtml(titulo)}
                            </div>

                            ${
                                url
                                    ? `<audio controls preload="metadata" src="${this.escaparHtml(url)}"></audio>`
                                    : `<div class="audio-unavailable">Áudio indisponível.</div>`
                            }

                        </div>
                    `;

                    container.appendChild(
                        card
                    );
                }
            );

            this.renderizarIcones();
        },


        /* =====================================================
           AGENDA
           ===================================================== */

        renderizarAgenda() {

            const container =
                document.getElementById(
                    "agendaList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            const calendario =
                document.createElement(
                    "div"
                );

            calendario.className =
                "calendar";

            calendario.innerHTML = `
                <div class="calendar-header">

                    <div
                        id="calendarTitle"
                        class="calendar-title">
                    </div>

                    <div class="calendar-navigation">

                        <button
                            id="btnMesAnterior"
                            type="button"
                            aria-label="Mês anterior">

                            <i data-lucide="chevron-left"></i>

                        </button>

                        <button
                            id="btnMesProximo"
                            type="button"
                            aria-label="Próximo mês">

                            <i data-lucide="chevron-right"></i>

                        </button>

                    </div>

                </div>

                <div class="calendar-weekdays">

                    <span>Dom</span>
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sáb</span>

                </div>

                <div
                    id="calendarDays"
                    class="calendar-days">
                </div>
            `;

            const legenda =
                document.createElement(
                    "div"
                );

            legenda.className =
                "agenda-legend";

            legenda.innerHTML = `
                <div class="agenda-legend-item">
                    <span class="agenda-legend-dot available"></span>
                    Disponível
                </div>

                <div class="agenda-legend-item">
                    <span class="agenda-legend-dot unavailable"></span>
                    Indisponível
                </div>

                <div class="agenda-legend-item">
                    <span class="agenda-legend-dot today"></span>
                    Hoje
                </div>
            `;

            container.appendChild(
                calendario
            );

            container.appendChild(
                legenda
            );

            this.configurarCalendario();

            this.renderizarCalendario();

            this.renderizarIcones();
        },


        configurarCalendario() {

            const anterior =
                document.getElementById(
                    "btnMesAnterior"
                );

            const proximo =
                document.getElementById(
                    "btnMesProximo"
                );

            if (anterior) {

                anterior.onclick =
                    () => {

                        this.estado.mesAtual =
                            new Date(
                                this.estado.mesAtual
                                    .getFullYear(),
                                this.estado.mesAtual
                                    .getMonth() - 1,
                                1
                            );

                        this.renderizarCalendario();
                    };
            }

            if (proximo) {

                proximo.onclick =
                    () => {

                        this.estado.mesAtual =
                            new Date(
                                this.estado.mesAtual
                                    .getFullYear(),
                                this.estado.mesAtual
                                    .getMonth() + 1,
                                1
                            );

                        this.renderizarCalendario();
                    };
            }
        },


        renderizarCalendario() {

            const daysContainer =
                document.getElementById(
                    "calendarDays"
                );

            const title =
                document.getElementById(
                    "calendarTitle"
                );

            if (
                !daysContainer ||
                !title
            ) {
                return;
            }

            const ano =
                this.estado.mesAtual
                    .getFullYear();

            const mes =
                this.estado.mesAtual
                    .getMonth();

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

            title.textContent =
                `${nomesMeses[mes]} ${ano}`;

            daysContainer.innerHTML =
                "";

            const primeiroDia =
                new Date(
                    ano,
                    mes,
                    1
                ).getDay();

            const quantidadeDias =
                new Date(
                    ano,
                    mes + 1,
                    0
                ).getDate();

            const quantidadeDiasMesAnterior =
                new Date(
                    ano,
                    mes,
                    0
                ).getDate();


            for (
                let i = primeiroDia - 1;
                i >= 0;
                i--
            ) {

                const dia =
                    quantidadeDiasMesAnterior -
                    i;

                const elemento =
                    document.createElement(
                        "div"
                    );

                elemento.className =
                    "calendar-day other-month";

                elemento.textContent =
                    dia;

                daysContainer.appendChild(
                    elemento
                );
            }


            for (
                let dia = 1;
                dia <= quantidadeDias;
                dia++
            ) {

                const elemento =
                    document.createElement(
                        "div"
                    );

                elemento.className =
                    "calendar-day";

                elemento.textContent =
                    dia;

                const dataAtual =
                    new Date(
                        ano,
                        mes,
                        dia
                    );

                if (
                    this.ehHoje(
                        dataAtual
                    )
                ) {

                    elemento.classList.add(
                        "today"
                    );
                }

                const status =
                    this.obterStatusAgenda(
                        dataAtual
                    );

                if (
                    status === "available"
                ) {

                    elemento.classList.add(
                        "available"
                    );

                } else if (
                    status === "unavailable"
                ) {

                    elemento.classList.add(
                        "unavailable"
                    );
                }

                daysContainer.appendChild(
                    elemento
                );
            }


            const totalCelulas =
                primeiroDia +
                quantidadeDias;

            const restantes =
                totalCelulas % 7 === 0
                    ? 0
                    : 7 -
                      (
                          totalCelulas % 7
                      );

            for (
                let dia = 1;
                dia <= restantes;
                dia++
            ) {

                const elemento =
                    document.createElement(
                        "div"
                    );

                elemento.className =
                    "calendar-day other-month";

                elemento.textContent =
                    dia;

                daysContainer.appendChild(
                    elemento
                );
            }
        },


        obterStatusAgenda(data) {

            const agenda =
                this.estado.agenda || [];

            const chave =
                this.formatarDataISO(
                    data
                );

            const item =
                agenda.find(
                    registro => {

                        const dataRegistro =
                            registro.data_inicio ||
                            registro.data_evento ||
                            registro.data_agenda;

                        if (!dataRegistro) {
                            return false;
                        }

                        return String(
                            dataRegistro
                        ).substring(
                            0,
                            10
                        ) === chave;
                    }
                );

            if (!item) {
                return null;
            }

            const disponivel =
                item.disponivel ??
                item.disponibilidade;

            if (
                disponivel === true ||
                disponivel === "true" ||
                disponivel === 1
            ) {

                return "available";
            }

            return "unavailable";
        },


        formatarDataISO(data) {

            const ano =
                data.getFullYear();

            const mes =
                String(
                    data.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );

            const dia =
                String(
                    data.getDate()
                ).padStart(
                    2,
                    "0"
                );

            return `${ano}-${mes}-${dia}`;
        },


        ehHoje(data) {

            const hoje =
                new Date();

            return (
                data.getDate() ===
                    hoje.getDate() &&
                data.getMonth() ===
                    hoje.getMonth() &&
                data.getFullYear() ===
                    hoje.getFullYear()
            );
        },


        /* =====================================================
           AVALIAÇÕES
           ===================================================== */

        renderizarAvaliacoes() {

            const container =
                document.getElementById(
                    "reviewsList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            const avaliacoes =
                this.estado.avaliacoes || [];

            if (!avaliacoes.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="star"></i>
                        <p>Você ainda não possui avaliações.</p>
                    </div>
                `;

                this.renderizarIcones();

                return;
            }

            avaliacoes.forEach(
                avaliacao => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "review-card";

                    const nome =
                        avaliacao.nome_cliente ||
                        avaliacao.nome_usuario ||
                        avaliacao.usuario_nome ||
                        "Cliente";

                    const comentario =
                        avaliacao.comentario ||
                        avaliacao.comentarios ||
                        avaliacao.descricao ||
                        "Sem comentário.";

                    const nota =
                        Number(
                            avaliacao.nota ??
                            avaliacao.rating ??
                            avaliacao.estrelas ??
                            0
                        );

                    const data =
                        avaliacao.created_at ||
                        avaliacao.data ||
                        null;

                    const iniciais =
                        this.obterIniciais(
                            nome
                        );

                    card.innerHTML = `
                        <div class="review-header">

                            <div class="review-avatar">
                                ${this.escaparHtml(iniciais)}
                            </div>

                            <div class="review-user">

                                <div class="review-user-name">
                                    ${this.escaparHtml(nome)}
                                </div>

                                ${
                                    data
                                        ? `<div class="review-date">${this.formatarData(data)}</div>`
                                        : ""
                                }

                            </div>

                            <div class="review-stars">
                                ${this.criarEstrelas(nota)}
                            </div>

                        </div>

                        <div class="review-comment">
                            ${this.escaparHtml(comentario)}
                        </div>
                    `;

                    container.appendChild(
                        card
                    );
                }
            );

            this.renderizarIcones();
        },


        criarEstrelas(nota) {

            let html =
                "";

            const valor =
                Math.max(
                    0,
                    Math.min(
                        5,
                        Math.round(
                            Number(nota) || 0
                        )
                    )
                );

            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                html += `
                    <i
                        data-lucide="star"
                        ${
                            i <= valor
                                ? 'fill="currentColor"'
                                : ""
                        }>
                    </i>
                `;
            }

            return html;
        },


        /* =====================================================
           CARTEIRA
           ===================================================== */

        renderizarCarteira() {

            const carteira =
                this.estado.carteira || {};

            const total =
                this.obterValorMonetario(
                    carteira.saldo_total ??
                    carteira.total ??
                    carteira.saldo
                );

            const disponivel =
                this.obterValorMonetario(
                    carteira.saldo_disponivel ??
                    carteira.disponivel ??
                    carteira.saldo
                );

            const pendente =
                this.obterValorMonetario(
                    carteira.saldo_pendente ??
                    carteira.pendente
                );

            this.definirTexto(
                "walletTotal",
                this.formatarMoeda(
                    total
                )
            );

            this.definirTexto(
                "walletAvailable",
                this.formatarMoeda(
                    disponivel
                )
            );

            this.definirTexto(
                "walletPending",
                this.formatarMoeda(
                    pendente
                )
            );

            this.renderizarTransacoes();
        },


        renderizarTransacoes() {

            const container =
                document.getElementById(
                    "transactionList"
                );

            if (!container) {
                return;
            }

            container.innerHTML =
                "";

            const transacoes =
                this.estado.transacoes || [];

            if (!transacoes.length) {

                container.innerHTML = `
                    <div class="empty-state">
                        <i data-lucide="receipt"></i>
                        <p>Nenhuma transação encontrada.</p>
                    </div>
                `;

                this.renderizarIcones();

                return;
            }

            transacoes.forEach(
                transacao => {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.className =
                        "transaction-item";

                    const valor =
                        this.obterValorMonetario(
                            transacao.valor ??
                            transacao.valor_transacao ??
                            transacao.amount
                        );

                    const tipo =
                        String(
                            transacao.tipo ||
                            transacao.tipo_transacao ||
                            ""
                        ).toLowerCase();

                    const negativo =
                        tipo.includes("saque") ||
                        tipo.includes("debito") ||
                        tipo.includes("débito") ||
                        tipo.includes("pagamento") ||
                        valor < 0;

                    const valorFinal =
                        negativo
                            ? -Math.abs(valor)
                            : Math.abs(valor);

                    const titulo =
                        transacao.descricao ||
                        transacao.titulo ||
                        transacao.tipo ||
                        "Transação";

                    const data =
                        transacao.created_at ||
                        transacao.data ||
                        null;

                    item.innerHTML = `
                        <div class="transaction-icon">
                            <i data-lucide="${
                                negativo
                                    ? "arrow-down-left"
                                    : "arrow-up-right"
                            }"></i>
                        </div>

                        <div class="transaction-content">

                            <div class="transaction-title">
                                ${this.escaparHtml(titulo)}
                            </div>

                            ${
                                data
                                    ? `<div class="transaction-date">${this.formatarData(data)}</div>`
                                    : ""
                            }

                        </div>

                        <div class="transaction-value ${
                            negativo
                                ? "negative"
                                : "positive"
                        }">
                            ${
                                negativo
                                    ? "-"
                                    : "+"
                            }
                            ${this.formatarMoeda(
                                Math.abs(
                                    valorFinal
                                )
                            )}
                        </div>
                    `;

                    container.appendChild(
                        item
                    );
                }
            );

            this.renderizarIcones();
        },


        /* =====================================================
           BOTÕES / EVENTOS
           ===================================================== */

        configurarEventos() {

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


            /* -------------------------------------------------
               VISUALIZAR PERFIL
               ------------------------------------------------- */

            const btnVisualizarPerfil =
                document.getElementById(
                    "btnVisualizarPerfil"
                );

            if (btnVisualizarPerfil) {

                btnVisualizarPerfil.addEventListener(
                    "click",
                    () => {

                        if (
                            !this.estado.perfilId
                        ) {
                            return;
                        }

                        window.location.href =
                            `apresentar-perfil-cantor.html?id=${encodeURIComponent(
                                this.estado.perfilId
                            )}`;
                    }
                );
            }


            /* -------------------------------------------------
               EDITAR PERFIL
               ------------------------------------------------- */

            const btnEditarPerfil =
                document.getElementById(
                    "btnEditarPerfil"
                );

            if (btnEditarPerfil) {

                btnEditarPerfil.addEventListener(
                    "click",
                    () => {

                        /*
                         * O perfil de cantor possui uma
                         * página de edição própria.
                         *
                         * Como Cantor, Cantora e Cantor(a)
                         * são tratados como o mesmo tipo,
                         * sempre enviamos para:
                         *
                         * editar-perfil-cantor.html
                         */

                        const tipoAtual =
                            this.normalizarTipoArtista(
                                this.estado
                                    .perfilArtista
                                    ?.tipo_artista
                            );

                        if (
                            tipoAtual ===
                            "cantor(a)"
                        ) {

                            window.location.href =
                                "editar-perfil-cantor.html";

                            return;
                        }

                        /*
                         * Fallback para perfis antigos
                         * onde o tipo ainda não esteja
                         * carregado corretamente.
                         */

                        if (
                            !tipoAtual
                        ) {

                            window.location.href =
                                "editar-perfil-cantor.html";

                            return;
                        }

                        /*
                         * Se o perfil mudou para outro tipo
                         * de artista, direciona para a página
                         * correspondente.
                         */

                        const paginasEdicao = {

                            "musico(a)":
                                "editar-perfil-musico.html",

                            "banda":
                                "editar-perfil-banda.html",

                            "dupla musical":
                                "editar-perfil-dupla-musical.html",

                            "dj":
                                "editar-perfil-dj.html",

                            "dancarino(a)":
                                "editar-perfil-dancarino.html",

                            "grupo de danca":
                                "editar-perfil-grupo-danca.html",

                            "mc":
                                "editar-perfil-mc.html",

                            "compositor(a)":
                                "editar-perfil-compositor.html",

                            "produtor(a) musical":
                                "editar-perfil-produtor-musical.html"
                        };

                        const pagina =
                            paginasEdicao[
                                tipoAtual
                            ];

                        if (pagina) {

                            window.location.href =
                                pagina;

                            return;
                        }

                        window.location.href =
                            "editar-perfil-cantor.html";
                    }
                );
            }


            /* -------------------------------------------------
               WHATSAPP
               ------------------------------------------------- */

            const btnWhatsApp =
                document.getElementById(
                    "btnWhatsApp"
                );

            if (btnWhatsApp) {

                btnWhatsApp.addEventListener(
                    "click",
                    () => {

                        this.compartilharWhatsApp();
                    }
                );
            }


            /* -------------------------------------------------
               QR CODE
               ------------------------------------------------- */

            const btnQRCode =
                document.getElementById(
                    "btnQRCode"
                );

            if (btnQRCode) {

                btnQRCode.addEventListener(
                    "click",
                    () => {

                        this.abrirQRCode();
                    }
                );
            }


            const btnFecharQR =
                document.getElementById(
                    "btnFecharQR"
                );

            if (btnFecharQR) {

                btnFecharQR.addEventListener(
                    "click",
                    () => {

                        this.fecharQRCode();
                    }
                );
            }


            const qrOverlay =
                document.getElementById(
                    "qrOverlay"
                );

            if (qrOverlay) {

                qrOverlay.addEventListener(
                    "click",
                    evento => {

                        if (
                            evento.target ===
                            qrOverlay
                        ) {

                            this.fecharQRCode();
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
                    () => {

                        this.compartilharPerfil();
                    }
                );
            }


            const btnSacar =
                document.getElementById(
                    "btnSacar"
                );

            if (btnSacar) {

                btnSacar.addEventListener(
                    "click",
                    () => {

                        this.solicitarSaque();
                    }
                );
            }


            document.addEventListener(
                "keydown",
                evento => {

                    if (
                        evento.key ===
                        "Escape"
                    ) {

                        this.fecharQRCode();
                    }
                }
            );
        },


        /* =====================================================
           ABAS
           ===================================================== */

        inicializarAbas() {

            const tabs =
                document.querySelectorAll(
                    ".tab-button"
                );

            const contents =
                document.querySelectorAll(
                    ".tab-content"
                );

            if (!tabs.length) {
                return;
            }

            tabs.forEach(
                tab => {

                    tab.addEventListener(
                        "click",
                        () => {

                            const nome =
                                tab.dataset.tab;

                            tabs.forEach(
                                outraTab => {

                                    outraTab.classList.toggle(
                                        "active",
                                        outraTab ===
                                        tab
                                    );
                                }
                            );

                            contents.forEach(
                                content => {

                                    content.classList.toggle(
                                        "active",
                                        content.id ===
                                        `tab-${nome}`
                                    );
                                }
                            );

                            this.renderizarIcones();
                        }
                    );
                }
            );
        },


        /* =====================================================
           WHATSAPP
           ===================================================== */

        compartilharWhatsApp() {

            const url =
                this.obterUrlPerfil();

            const usuario =
                this.estado.usuario || {};

            const perfil =
                this.estado.perfil || {};

            const nome =
                usuario.nome ||
                usuario.nome_completo ||
                usuario.nome_artistico ||
                perfil.nome ||
                perfil.nome_completo ||
                perfil.nome_artistico ||
                "Cantor";

            const mensagem =
                `Confira o perfil de ${nome} no MusicalWorld: ${url}`;

            const whatsapp =
                `https://wa.me/?text=${encodeURIComponent(
                    mensagem
                )}`;

            window.open(
                whatsapp,
                "_blank",
                "noopener,noreferrer"
            );
        },


        /* =====================================================
           QR CODE
           ===================================================== */

        abrirQRCode() {

            const overlay =
                document.getElementById(
                    "qrOverlay"
                );

            const imagem =
                document.getElementById(
                    "qrImage"
                );

            if (
                !overlay ||
                !imagem
            ) {
                return;
            }

            const url =
                this.obterUrlPerfil();

            imagem.src =
                `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                    url
                )}`;

            this.atualizarLinkPerfil();

            overlay.classList.add(
                "active"
            );

            overlay.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.style.overflow =
                "hidden";
        },


        fecharQRCode() {

            const overlay =
                document.getElementById(
                    "qrOverlay"
                );

            if (!overlay) {
                return;
            }

            overlay.classList.remove(
                "active"
            );

            overlay.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.style.overflow =
                "";
        },


        atualizarLinkPerfil() {

            const elemento =
                document.getElementById(
                    "profileLink"
                );

            if (!elemento) {
                return;
            }

            elemento.textContent =
                this.obterUrlPerfil();
        },


        obterUrlPerfil() {

            const id =
                this.estado.perfilId;

            const base =
                window.location.origin &&
                window.location.origin !==
                    "null"
                    ? window.location.origin
                    : "";

            if (base) {

                return `${base}/apresentar-perfil-cantor.html?id=${encodeURIComponent(
                    id || ""
                )}`;
            }

            return `apresentar-perfil-cantor.html?id=${encodeURIComponent(
                id || ""
            )}`;
        },


        async compartilharPerfil() {

            const url =
                this.obterUrlPerfil();

            const usuario =
                this.estado.usuario || {};

            const perfil =
                this.estado.perfil || {};

            const nome =
                usuario.nome ||
                usuario.nome_completo ||
                usuario.nome_artistico ||
                perfil.nome ||
                perfil.nome_completo ||
                perfil.nome_artistico ||
                "Cantor";

            const dados = {
                title:
                    `${nome} | MusicalWorld`,

                text:
                    `Confira o perfil de ${nome} no MusicalWorld.`,

                url
            };

            try {

                if (
                    navigator.share
                ) {

                    await navigator.share(
                        dados
                    );

                    return;
                }

                if (
                    navigator.clipboard
                ) {

                    await navigator.clipboard.writeText(
                        url
                    );

                    this.mostrarToast(
                        "Link copiado."
                    );

                    return;
                }

                this.mostrarToast(
                    "Não foi possível compartilhar o perfil."
                );

            } catch (erro) {

                if (
                    erro?.name !==
                    "AbortError"
                ) {

                    console.error(
                        "Erro ao compartilhar:",
                        erro
                    );
                }
            }
        },


        /* =====================================================
           SAQUE
           ===================================================== */

        solicitarSaque() {

            const disponivel =
                this.obterValorMonetario(
                    this.estado
                        .carteira
                        ?.saldo_disponivel ??
                    this.estado
                        .carteira
                        ?.disponivel ??
                    this.estado
                        .carteira
                        ?.saldo
                );

            if (
                disponivel <= 0
            ) {

                this.mostrarToast(
                    "Você não possui saldo disponível para saque."
                );

                return;
            }

            this.mostrarToast(
                "A solicitação de saque será disponibilizada em breve."
            );
        },


        /* =====================================================
           UTILITÁRIOS
           ===================================================== */

        normalizarArray(valor) {

            if (
                Array.isArray(valor)
            ) {

                return valor
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

                const texto =
                    valor.trim();

                if (!texto) {
                    return [];
                }

                try {

                    const parsed =
                        JSON.parse(
                            texto
                        );

                    if (
                        Array.isArray(
                            parsed
                        )
                    ) {

                        return parsed
                            .map(
                                item =>
                                    String(
                                        item
                                    ).trim()
                            )
                            .filter(Boolean);
                    }

                } catch (erro) {
                    // Não é JSON.
                }

                return texto
                    .split(",")
                    .map(
                        item =>
                            item.trim()
                    )
                    .filter(Boolean);
            }

            return [];
        },


        obterValorMonetario(valor) {

            if (
                valor === null ||
                valor === undefined ||
                valor === ""
            ) {
                return 0;
            }

            if (
                typeof valor ===
                "number"
            ) {

                return Number.isFinite(
                    valor
                )
                    ? valor
                    : 0;
            }

            const numero =
                Number(
                    String(valor)
                        .replace(
                            "R$",
                            ""
                        )
                        .replace(
                            /\./g,
                            ""
                        )
                        .replace(
                            ",",
                            "."
                        )
                        .trim()
                );

            return Number.isFinite(
                numero
            )
                ? numero
                : 0;
        },


        formatarMoeda(valor) {

            return new Intl.NumberFormat(
                "pt-BR",
                {
                    style:
                        "currency",

                    currency:
                        "BRL"
                }
            ).format(
                Number(valor) || 0
            );
        },


        formatarData(data) {

            try {

                const objeto =
                    new Date(
                        data
                    );

                if (
                    Number.isNaN(
                        objeto.getTime()
                    )
                ) {
                    return "";
                }

                return objeto.toLocaleDateString(
                    "pt-BR"
                );

            } catch (erro) {

                return "";
            }
        },


        escaparHtml(valor) {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent =
                valor === null ||
                valor === undefined
                    ? ""
                    : String(valor);

            return div.innerHTML;
        },


        renderizarIcones() {

            if (
                window.lucide &&
                typeof window.lucide
                    .createIcons ===
                    "function"
            ) {

                requestAnimationFrame(
                    () => {

                        window.lucide.createIcons();
                    }
                );
            }
        },


        mostrarToast(mensagem) {

            const toast =
                document.getElementById(
                    "toast"
                );

            const mensagemElemento =
                document.getElementById(
                    "toastMessage"
                );

            if (!toast) {
                return;
            }

            if (
                mensagemElemento
            ) {

                mensagemElemento.textContent =
                    mensagem;
            }

            toast.classList.add(
                "show"
            );

            clearTimeout(
                this._toastTimeout
            );

            this._toastTimeout =
                setTimeout(
                    () => {

                        toast.classList.remove(
                            "show"
                        );

                    },
                    3000
                );
        },


        redirecionarLogin() {

            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                800
            );
        }
    };


    /* =========================================================
       EXPOR API GLOBAL
       ========================================================= */

    window.MusicalWorldMeuPerfilCantor =
        MusicalWorldMeuPerfilCantor;


    /* =========================================================
       INICIAR
       ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            MusicalWorldMeuPerfilCantor
                .inicializar();

        }
    );

})();