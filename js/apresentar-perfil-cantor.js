/* =========================================================
   MUSICALWORLD
   PERFIL PÚBLICO DO CANTOR
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const CONFIG = {

        tabelas: {

            usuarios: "usuarios",

            perfis: "perfis",

            tiposPerfil: "tipos_perfil",

            perfisArtistas: "perfis_artistas",

            portfolio: "portfolio_musicos",

            agenda: "agenda_musicos",

            avaliacoes: "avaliacoes_musicos"

        }

    };


    /* =====================================================
       ESTADO
    ====================================================== */

    let supabase = null;

    let perfilId = null;

    let dadosPerfil = null;

    let agendaDados = [];

    let mesAgendaAtual = new Date();


    /* =====================================================
       SUPABASE
    ====================================================== */

    function obterSupabase() {

        if (supabase) {
            return supabase;
        }

        supabase =
            window.supabaseClient ||
            window._supabase ||
            window.supabase ||
            null;

        if (!supabase) {

            console.error(
                "MusicalWorld: cliente Supabase não encontrado."
            );

            throw new Error(
                "Cliente Supabase não encontrado."
            );
        }

        return supabase;
    }


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const $ = (id) => document.getElementById(id);


    /* =====================================================
       TOAST
    ====================================================== */

    let toastTimer = null;

    function mostrarToast(mensagem) {

        const toast = $("toast");
        const toastMessage = $("toastMessage");

        if (!toast || !toastMessage) {
            return;
        }

        toastMessage.textContent = mensagem;

        toast.classList.add("visivel");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {

            toast.classList.remove("visivel");

        }, 2800);
    }


    /* =====================================================
       URL
    ====================================================== */

    function obterPerfilIdDaURL() {

        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("id");

        if (!id) {
            return null;
        }

        const numero = Number(id);

        if (!Number.isInteger(numero) || numero <= 0) {
            return null;
        }

        return numero;
    }


    /* =====================================================
       UTILITÁRIOS
    ====================================================== */

    function valorOuPadrao(valor, padrao = "Não informado") {

        if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ""
        ) {
            return padrao;
        }

        return valor;
    }


    function arraySeguro(valor) {

        if (Array.isArray(valor)) {
            return valor.filter(
                item =>
                    item !== null &&
                    item !== undefined &&
                    String(item).trim() !== ""
            );
        }

        if (typeof valor === "string" && valor.trim()) {

            return valor
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);

        }

        return [];
    }


    function escaparHTML(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function obterIniciais(nome) {

        const texto = String(nome || "Cantor")
            .trim();

        if (!texto) {
            return "C";
        }

        const partes = texto
            .split(/\s+/)
            .filter(Boolean);

        if (partes.length === 1) {
            return partes[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            partes[0][0] +
            partes[partes.length - 1][0]
        ).toUpperCase();
    }


    function formatarData(data) {

        if (!data) {
            return "";
        }

        const dataObj = new Date(data);

        if (Number.isNaN(dataObj.getTime())) {
            return "";
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


    function nomeMes(data) {

        return data.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        ).replace(
            /^./,
            letra => letra.toUpperCase()
        );
    }


    /* =====================================================
       CARREGAR PERFIL
    ====================================================== */

    async function carregarPerfil() {

        const client = obterSupabase();

        console.log(
            "MusicalWorld: carregando perfil de cantor:",
            perfilId
        );


        /* -------------------------------------------------
           PERFIL
        -------------------------------------------------- */

        const {
            data: perfil,
            error: erroPerfil
        } = await client
            .from(CONFIG.tabelas.perfis)
            .select(`
                *,
                tipos_perfil (
                    id,
                    nome
                )
            `)
            .eq("id", perfilId)
            .maybeSingle();


        if (erroPerfil) {

            console.error(
                "Erro ao buscar perfil:",
                erroPerfil
            );

            throw erroPerfil;
        }


        if (!perfil) {

            throw new Error(
                "Perfil não encontrado."
            );
        }


        /* -------------------------------------------------
           TIPO DO PERFIL
        -------------------------------------------------- */

        const tipoPerfil =
            perfil.tipos_perfil ||
            perfil.tipo_perfil ||
            null;


        if (
            tipoPerfil &&
            tipoPerfil.nome &&
            tipoPerfil.nome.toLowerCase() !== "artista"
        ) {

            throw new Error(
                "Este perfil não é um perfil artístico."
            );
        }


        /* -------------------------------------------------
           PERFIL ARTISTA
        -------------------------------------------------- */

        const {
            data: artista,
            error: erroArtista
        } = await client
            .from(CONFIG.tabelas.perfisArtistas)
            .select("*")
            .eq("perfil_id", perfilId)
            .maybeSingle();


        if (erroArtista) {

            console.error(
                "Erro ao buscar perfil artístico:",
                erroArtista
            );

            throw erroArtista;
        }


        if (!artista) {

            throw new Error(
                "Dados artísticos do cantor não encontrados."
            );
        }


        /* -------------------------------------------------
           GARANTIR QUE É CANTOR
        -------------------------------------------------- */

        const tipoArtista =
            String(
                artista.tipo_artista || ""
            ).trim().toLowerCase();


        if (
            tipoArtista &&
            tipoArtista !== "cantor"
        ) {

            throw new Error(
                "Este perfil não é de cantor."
            );
        }


        /* -------------------------------------------------
           USUÁRIO
        -------------------------------------------------- */

        let usuario = null;


        if (perfil.usuario_id) {

            const {
                data: usuarioData,
                error: erroUsuario
            } = await client
                .from(CONFIG.tabelas.usuarios)
                .select("*")
                .eq("id", perfil.usuario_id)
                .maybeSingle();


            if (!erroUsuario) {
                usuario = usuarioData;
            }

        }


        /* -------------------------------------------------
           PORTFÓLIO
        -------------------------------------------------- */

        let portfolio = [];

        const {
            data: portfolioData,
            error: erroPortfolio
        } = await client
            .from(CONFIG.tabelas.portfolio)
            .select("*")
            .eq("perfil_id", perfilId)
            .eq("ativo", true)
            .order("ordem", {
                ascending: true,
                nullsFirst: false
            })
            .order("created_at", {
                ascending: false
            });


        if (!erroPortfolio) {
            portfolio = portfolioData || [];
        }


        /* -------------------------------------------------
           AGENDA
        -------------------------------------------------- */

        let agenda = [];

        const {
            data: agendaData,
            error: erroAgenda
        } = await client
            .from(CONFIG.tabelas.agenda)
            .select("*")
            .eq("perfil_id", perfilId);


        if (!erroAgenda) {
            agenda = agendaData || [];
        }


        /* -------------------------------------------------
           AVALIAÇÕES
        -------------------------------------------------- */

        let avaliacoes = [];

        const {
            data: avaliacoesData,
            error: erroAvaliacoes
        } = await client
            .from(CONFIG.tabelas.avaliacoes)
            .select("*")
            .eq("perfil_id", perfilId)
            .order("created_at", {
                ascending: false
            });


        if (!erroAvaliacoes) {
            avaliacoes = avaliacoesData || [];
        }


        /* -------------------------------------------------
           MONTAR OBJETO
        -------------------------------------------------- */

        dadosPerfil = {

            perfil,

            artista,

            usuario,

            portfolio,

            agenda,

            avaliacoes,

            avaliacao: {

                media: 0,

                total: avaliacoes.length

            }

        };


        console.log(
            "MusicalWorld: perfil carregado:",
            dadosPerfil
        );


        return dadosPerfil;
    }


    /* =====================================================
       PREENCHER PERFIL
    ====================================================== */

    function preencherPerfil() {

        if (!dadosPerfil) {
            return;
        }

        const {
            perfil,
            artista,
            usuario
        } = dadosPerfil;


        const nome =
            perfil.nome ||
            usuario?.nome ||
            usuario?.nome_completo ||
            "Cantor";


        /* -------------------------------------------------
           NOME
        -------------------------------------------------- */

        const profileName = $("profileName");

        if (profileName) {
            profileName.textContent = nome;
        }


        document.title =
            `${nome} - MusicalWorld`;


        /* -------------------------------------------------
           CATEGORIA
        -------------------------------------------------- */

        const categoria =
            artista.tipo_artista ||
            "Cantor";


        const profileCategory =
            $("profileCategory");

        if (profileCategory) {
            profileCategory.textContent = categoria;
        }


        const profileType =
            $("profileType");

        if (profileType) {
            profileType.textContent = categoria;
        }


        /* -------------------------------------------------
           LOCALIZAÇÃO
        -------------------------------------------------- */

        const location =
            valorOuPadrao(
                artista.localizacao,
                "Localização não informada"
            );


        const profileLocation =
            $("profileLocation");

        if (profileLocation) {
            profileLocation.textContent = location;
        }


        /* -------------------------------------------------
           APRESENTAÇÃO
        -------------------------------------------------- */

        const bio =
            perfil.bio ||
            perfil.descricao ||
            perfil.apresentacao ||
            perfil.sobre ||
            artista.experiencia ||
            "";


        const profileBio =
            $("profileBio");


        if (profileBio) {

            if (bio) {

                profileBio.textContent = bio;

            } else {

                profileBio.textContent =
                    "Este cantor ainda não adicionou uma apresentação.";

            }

        }


        /* -------------------------------------------------
           EXPERIÊNCIA
        -------------------------------------------------- */

        const experience =
            valorOuPadrao(
                artista.experiencia
            );


        if ($("profileExperience")) {

            $("profileExperience").textContent =
                experience;

        }


        /* -------------------------------------------------
           ÁREA
        -------------------------------------------------- */

        const area =
            valorOuPadrao(
                artista.area_atendimento
            );


        if ($("profileArea")) {

            $("profileArea").textContent =
                area;

        }


        /* -------------------------------------------------
           DISPONIBILIDADE
        ------------------------------------------------- */

        atualizarDisponibilidade(
            Boolean(artista.disponivel)
        );


        /* -------------------------------------------------
           AVALIAÇÃO
        ------------------------------------------------- */

        atualizarAvaliacao();


        /* -------------------------------------------------
           FOTO
        ------------------------------------------------- */

        atualizarAvatar(
            nome,
            artista.foto_url
        );


        /* -------------------------------------------------
           GÊNEROS
        ------------------------------------------------- */

        renderizarGeneros(
            artista.estilos
        );


        /* -------------------------------------------------
           SERVIÇOS
        ------------------------------------------------- */

        renderizarServicos(
            artista.servicos
        );


        /* -------------------------------------------------
           PORTFÓLIO
        ------------------------------------------------- */

        renderizarPortfolio(
            dadosPerfil.portfolio
        );


        /* -------------------------------------------------
           AGENDA
        ------------------------------------------------- */

        agendaDados =
            dadosPerfil.agenda || [];

        renderizarAgenda();


        /* -------------------------------------------------
           AVALIAÇÕES
        ------------------------------------------------- */

        renderizarAvaliacoes(
            dadosPerfil.avaliacoes
        );


        atualizarIcones();
    }


    /* =====================================================
       AVATAR
    ====================================================== */

    function atualizarAvatar(nome, fotoUrl) {

        const avatar =
            $("profileAvatar");

        const initials =
            $("profileInitials");


        if (!avatar) {
            return;
        }


        if (fotoUrl && String(fotoUrl).trim()) {

            avatar.innerHTML = "";

            const img =
                document.createElement("img");

            img.src = fotoUrl;

            img.alt =
                `Foto de ${nome}`;

            img.loading = "eager";

            img.onerror = () => {

                avatar.innerHTML =
                    `<span id="profileInitials">${escaparHTML(
                        obterIniciais(nome)
                    )}</span>`;

            };


            avatar.appendChild(img);

        } else {

            if (initials) {

                initials.textContent =
                    obterIniciais(nome);

            }

        }

    }


    /* =====================================================
       DISPONIBILIDADE
    ====================================================== */

    function atualizarDisponibilidade(disponivel) {

        const status =
            $("profileStatus");

        const texto =
            status?.querySelector(".status-text");

        const availability =
            $("profileAvailability");


        if (!status) {
            return;
        }


        if (disponivel) {

            status.classList.remove(
                "indisponivel"
            );

            if (texto) {
                texto.textContent =
                    "Disponível para contratação";
            }

            if (availability) {
                availability.textContent =
                    "Disponível";
            }

        } else {

            status.classList.add(
                "indisponivel"
            );

            if (texto) {
                texto.textContent =
                    "Indisponível no momento";
            }

            if (availability) {
                availability.textContent =
                    "Indisponível";
            }

        }

    }


    /* =====================================================
       AVALIAÇÃO
    ====================================================== */

    function atualizarAvaliacao() {

        const avaliacao =
            dadosPerfil?.avaliacao || {
                media: 0,
                total: 0
            };


        const media =
            Number(avaliacao.media || 0);


        const total =
            Number(avaliacao.total || 0);


        if ($("ratingValue")) {

            $("ratingValue").textContent =
                media.toFixed(1).replace(".", ",");

        }


        if ($("ratingReviews")) {

            $("ratingReviews").textContent =
                `(${total} ${
                    total === 1
                        ? "avaliação"
                        : "avaliações"
                })`;

        }


        const estrelas =
            document.querySelectorAll(
                "#profileRating svg"
            );


        estrelas.forEach(
            (estrela, index) => {

                estrela.style.fill =
                    index < Math.round(media)
                        ? "#f5b942"
                        : "none";

                estrela.style.color =
                    index < Math.round(media)
                        ? "#f5b942"
                        : "#c8ced8";

            }
        );

    }


    /* =====================================================
       GÊNEROS
    ====================================================== */

    function renderizarGeneros(estilos) {

        const container =
            $("genreList");

        if (!container) {
            return;
        }


        const lista =
            arraySeguro(estilos);


        if (!lista.length) {

            container.innerHTML =
                `<span class="empty-inline">
                    Nenhum gênero informado.
                </span>`;

            return;
        }


        container.innerHTML =
            lista.map(estilo => `
                <span class="genre-tag">
                    ${escaparHTML(estilo)}
                </span>
            `).join("");

    }


    /* =====================================================
       SERVIÇOS
    ====================================================== */

    function renderizarServicos(servicos) {

        const container =
            $("servicesList");

        if (!container) {
            return;
        }


        const lista =
            arraySeguro(servicos);


        if (!lista.length) {

            container.innerHTML =
                `<span class="empty-inline">
                    Nenhum serviço informado.
                </span>`;

            return;
        }


        container.innerHTML =
            lista.map(servico => `

                <div class="service-card">

                    <i
                        data-lucide="music-2"
                        class="service-icon"
                    ></i>

                    <div class="service-info">

                        <strong>
                            ${escaparHTML(servico)}
                        </strong>

                    </div>

                </div>

            `).join("");


        atualizarIcones();
    }


    /* =====================================================
       PORTFÓLIO
    ====================================================== */

    function renderizarPortfolio(portfolio) {

        const grid =
            $("portfolioGrid");

        const videoList =
            $("videoList");

        const audioList =
            $("audioList");


        if (!grid || !videoList || !audioList) {
            return;
        }


        const itens =
            Array.isArray(portfolio)
                ? portfolio
                : [];


        const imagens =
            itens.filter(item => {

                const tipo =
                    String(
                        item.tipo || ""
                    ).toLowerCase();

                return (
                    tipo === "imagem" ||
                    tipo === "foto" ||
                    tipo === "image"
                );

            });


        const videos =
            itens.filter(item => {

                const tipo =
                    String(
                        item.tipo || ""
                    ).toLowerCase();

                return (
                    tipo === "video" ||
                    tipo === "vídeo"
                );

            });


        const audios =
            itens.filter(item => {

                const tipo =
                    String(
                        item.tipo || ""
                    ).toLowerCase();

                return (
                    tipo === "audio" ||
                    tipo === "áudio"
                );

            });


        /* -------------------------------------------------
           IMAGENS
        -------------------------------------------------- */

        if (!imagens.length) {

            grid.innerHTML =
                criarEstadoVazio(
                    "images",
                    "Nenhuma foto no portfólio.",
                    "O cantor ainda não adicionou fotos."
                );

        } else {

            grid.innerHTML =
                imagens.map(item => {

                    const url =
                        item.url ||
                        item.arquivo_url ||
                        item.media_url ||
                        item.foto_url ||
                        "";

                    const titulo =
                        item.titulo ||
                        item.nome ||
                        "Apresentação";


                    const descricao =
                        item.descricao ||
                        "";


                    return `

                        <div class="portfolio-card">

                            ${
                                url
                                    ? `
                                        <img
                                            src="${escaparHTML(url)}"
                                            alt="${escaparHTML(titulo)}"
                                            loading="lazy"
                                        >
                                    `
                                    : ""
                            }

                            <div class="portfolio-overlay">

                                <strong>
                                    ${escaparHTML(titulo)}
                                </strong>

                                ${
                                    descricao
                                        ? `
                                            <span>
                                                ${escaparHTML(descricao)}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        </div>

                    `;

                }).join("");

        }


        /* -------------------------------------------------
           VÍDEOS
        -------------------------------------------------- */

        if (!videos.length) {

            videoList.innerHTML =
                criarEstadoVazio(
                    "video",
                    "Nenhum vídeo disponível.",
                    "O cantor ainda não adicionou vídeos."
                );

        } else {

            videoList.innerHTML =
                videos.map(item => {

                    const url =
                        item.url ||
                        item.arquivo_url ||
                        item.media_url ||
                        "";


                    if (!url) {
                        return "";
                    }


                    return `

                        <div class="video-item">

                            <video
                                controls
                                preload="metadata"
                                playsinline
                            >
                                <source
                                    src="${escaparHTML(url)}"
                                >

                                Seu navegador não suporta vídeo.
                            </video>

                        </div>

                    `;

                }).join("");

        }


        /* -------------------------------------------------
           ÁUDIOS
        -------------------------------------------------- */

        if (!audios.length) {

            audioList.innerHTML =
                criarEstadoVazio(
                    "music",
                    "Nenhum áudio disponível.",
                    "O cantor ainda não adicionou gravações."
                );

        } else {

            audioList.innerHTML =
                audios.map(item => {

                    const url =
                        item.url ||
                        item.arquivo_url ||
                        item.media_url ||
                        "";


                    const titulo =
                        item.titulo ||
                        item.nome ||
                        "Áudio";


                    const descricao =
                        item.descricao ||
                        "Gravação musical";


                    if (!url) {
                        return "";
                    }


                    return `

                        <div class="audio-card">

                            <div class="audio-header">

                                <div class="audio-icon">

                                    <i
                                        data-lucide="music"
                                    ></i>

                                </div>

                                <div class="audio-info">

                                    <strong>
                                        ${escaparHTML(titulo)}
                                    </strong>

                                    <span>
                                        ${escaparHTML(descricao)}
                                    </span>

                                </div>

                            </div>

                            <audio
                                class="audio-player"
                                controls
                                preload="metadata"
                            >
                                <source
                                    src="${escaparHTML(url)}"
                                >

                                Seu navegador não suporta áudio.
                            </audio>

                        </div>

                    `;

                }).join("");

        }


        atualizarIcones();
    }


    /* =====================================================
       ESTADO VAZIO
    ====================================================== */

    function criarEstadoVazio(
        icone,
        titulo,
        descricao
    ) {

        return `

            <div class="empty-state">

                <i data-lucide="${icone}"></i>

                <strong>
                    ${escaparHTML(titulo)}
                </strong>

                <span>
                    ${escaparHTML(descricao)}
                </span>

            </div>

        `;

    }


    /* =====================================================
       AGENDA
    ====================================================== */

    function renderizarAgenda() {

        const container =
            $("agendaList");

        if (!container) {
            return;
        }


        const ano =
            mesAgendaAtual.getFullYear();

        const mes =
            mesAgendaAtual.getMonth();


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


        const diasNoMes =
            ultimoDia.getDate();


        let inicioSemana =
            primeiroDia.getDay();


        inicioSemana =
            inicioSemana === 0
                ? 6
                : inicioSemana - 1;


        const totalCelulas =
            Math.ceil(
                (inicioSemana + diasNoMes) / 7
            ) * 7;


        let html = `

            <div class="agenda-calendar">

                <div class="agenda-calendar-header">

                    <button
                        type="button"
                        class="agenda-month-button"
                        id="agendaAnterior"
                        aria-label="Mês anterior"
                    >
                        <i data-lucide="chevron-left"></i>
                    </button>

                    <div class="agenda-month-title">
                        ${escaparHTML(
                            nomeMes(mesAgendaAtual)
                        )}
                    </div>

                    <button
                        type="button"
                        class="agenda-month-button"
                        id="agendaProximo"
                        aria-label="Próximo mês"
                    >
                        <i data-lucide="chevron-right"></i>
                    </button>

                </div>

                <div class="agenda-weekdays">

                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sáb</span>
                    <span>Dom</span>

                </div>

                <div class="agenda-calendar-grid">
        `;


        for (
            let indice = 0;
            indice < totalCelulas;
            indice++
        ) {

            const diaMes =
                indice - inicioSemana + 1;


            if (
                diaMes < 1 ||
                diaMes > diasNoMes
            ) {

                html += `
                    <div class="agenda-day outro-mes"></div>
                `;

                continue;
            }


            const data =
                new Date(
                    ano,
                    mes,
                    diaMes
                );


            const dataString =
                `${ano}-${String(mes + 1).padStart(2, "0")}-${String(diaMes).padStart(2, "0")}`;


            const estado =
                obterEstadoAgenda(
                    dataString,
                    data
                );


            const hoje =
                ehHoje(data)
                    ? " hoje"
                    : "";


            html += `

                <div
                    class="agenda-day ${estado.classe}${hoje}"
                    title="${escaparHTML(estado.titulo)}"
                >

                    <span class="agenda-day-number">
                        ${diaMes}
                    </span>

                    <span class="agenda-day-status"></span>

                </div>

            `;

        }


        html += `

                </div>

                <div class="agenda-legend">

                    <span class="agenda-legend-item">

                        <span
                            class="agenda-legend-dot disponivel"
                        ></span>

                        Disponível

                    </span>

                    <span class="agenda-legend-item">

                        <span
                            class="agenda-legend-dot agendado"
                        ></span>

                        Agendado

                    </span>

                    <span class="agenda-legend-item">

                        <span
                            class="agenda-legend-dot indisponivel"
                        ></span>

                        Indisponível

                    </span>

                </div>

            </div>

        `;


        container.innerHTML = html;


        $("agendaAnterior")?.addEventListener(
            "click",
            () => {

                mesAgendaAtual.setMonth(
                    mesAgendaAtual.getMonth() - 1
                );

                renderizarAgenda();

            }
        );


        $("agendaProximo")?.addEventListener(
            "click",
            () => {

                mesAgendaAtual.setMonth(
                    mesAgendaAtual.getMonth() + 1
                );

                renderizarAgenda();

            }
        );


        atualizarIcones();
    }


    /* =====================================================
       ESTADO DA AGENDA
    ====================================================== */

    function obterEstadoAgenda(
        dataString,
        data
    ) {

        const hoje =
            new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        if (data < hoje) {

            return {

                classe: "passado",

                titulo: "Data passada"

            };

        }


        const registro =
            agendaDados.find(item => {

                const dataItem =
                    item.data_inicio ||
                    item.data_agenda ||
                    item.data_evento ||
                    item.inicio;


                if (!dataItem) {
                    return false;
                }


                const itemDate =
                    new Date(dataItem);


                if (Number.isNaN(
                    itemDate.getTime()
                )) {

                    return false;

                }


                return (
                    itemDate
                        .toISOString()
                        .slice(0, 10) ===
                    dataString
                );

            });


        if (!registro) {

            return {

                classe: "disponivel",

                titulo: "Disponível"

            };

        }


        const status =
            String(
                registro.status || ""
            ).toLowerCase();


        if (
            status.includes("agend") ||
            status.includes("confirm")
        ) {

            return {

                classe: "agendado",

                titulo: "Agendado"

            };

        }


        if (
            status.includes("indispon") ||
            status.includes("bloque")
        ) {

            return {

                classe: "indisponivel",

                titulo: "Indisponível"

            };

        }


        return {

            classe: "disponivel",

            titulo: "Disponível"

        };

    }


    function ehHoje(data) {

        const hoje =
            new Date();

        return (
            data.getFullYear() ===
                hoje.getFullYear() &&

            data.getMonth() ===
                hoje.getMonth() &&

            data.getDate() ===
                hoje.getDate()
        );

    }


    /* =====================================================
       AVALIAÇÕES
    ====================================================== */

    function renderizarAvaliacoes(avaliacoes) {

        const container =
            $("reviewsList");

        if (!container) {
            return;
        }


        const lista =
            Array.isArray(avaliacoes)
                ? avaliacoes
                : [];


        if (!lista.length) {

            container.innerHTML =
                criarEstadoVazio(
                    "star",
                    "Nenhuma avaliação ainda.",
                    "As avaliações aparecerão aqui após as contratações."
                );

            atualizarIcones();

            return;
        }


        container.innerHTML =
            lista.map(avaliacao => {

                const nome =
                    avaliacao.nome_usuario ||
                    avaliacao.usuario_nome ||
                    avaliacao.nome ||
                    "Usuário";


                const nota =
                    Number(
                        avaliacao.nota ||
                        avaliacao.avaliacao ||
                        avaliacao.rating ||
                        0
                    );


                const comentario =
                    avaliacao.comentario ||
                    avaliacao.comentarios ||
                    avaliacao.texto ||
                    "";


                const data =
                    formatarData(
                        avaliacao.created_at
                    );


                const estrelas =
                    Array.from(
                        { length: 5 },
                        (_, index) => `

                            <i
                                data-lucide="star"
                                style="
                                    fill: ${
                                        index < Math.round(nota)
                                            ? "#f5b942"
                                            : "none"
                                    };
                                    color: ${
                                        index < Math.round(nota)
                                            ? "#f5b942"
                                            : "#c8ced8"
                                    };
                                "
                            ></i>

                        `
                    ).join("");


                return `

                    <article class="review-card">

                        <div class="review-header">

                            <div class="review-user">

                                <div class="review-avatar">

                                    ${escaparHTML(
                                        obterIniciais(nome)
                                    )}

                                </div>

                                <div>

                                    <strong>
                                        ${escaparHTML(nome)}
                                    </strong>

                                    <span>
                                        ${escaparHTML(data)}
                                    </span>

                                </div>

                            </div>

                            <div class="review-stars">
                                ${estrelas}
                            </div>

                        </div>

                        ${
                            comentario
                                ? `
                                    <p class="review-text">
                                        ${escaparHTML(comentario)}
                                    </p>
                                `
                                : ""
                        }

                    </article>

                `;

            }).join("");


        atualizarIcones();
    }


    /* =====================================================
       WHATSAPP
    ====================================================== */

    function abrirWhatsApp() {

        const telefone =
            dadosPerfil?.usuario?.telefone ||
            dadosPerfil?.usuario?.celular ||
            dadosPerfil?.perfil?.telefone ||
            "";


        if (!telefone) {

            mostrarToast(
                "Este cantor ainda não informou um telefone."
            );

            return;
        }


        const telefoneLimpo =
            String(telefone)
                .replace(/\D/g, "");


        if (!telefoneLimpo) {

            mostrarToast(
                "Telefone inválido."
            );

            return;
        }


        const nome =
            dadosPerfil?.perfil?.nome ||
            dadosPerfil?.usuario?.nome ||
            "cantor";


        const mensagem =
            `Olá ${nome}! Encontrei seu perfil no MusicalWorld e gostaria de saber mais sobre seus serviços.`;


        const url =
            `https://wa.me/${telefoneLimpo}?text=${encodeURIComponent(
                mensagem
            )}`;


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    }


    /* =====================================================
       CONTRATAR
    ====================================================== */

    function contratar() {

        if (!dadosPerfil) {
            return;
        }


        const perfil =
            dadosPerfil.perfil;


        const id =
            perfil.id;


        /*
         * Futuramente este botão poderá levar
         * para o fluxo completo de contratação.
         *
         * Por enquanto deixamos a navegação
         * preparada.
         */

        const url =
            `contratar-musico.html?perfil_id=${encodeURIComponent(
                id
            )}`;


        /*
         * Caso a página ainda não exista,
         * não quebramos a experiência.
         */

        mostrarToast(
            "Fluxo de contratação será disponibilizado em breve."
        );


        console.log(
            "MusicalWorld: contratação:",
            url
        );

    }


    /* =====================================================
       QR CODE
    ====================================================== */

    function obterURLPerfil() {

        return window.location.href;

    }


    function abrirQRCode() {

        const overlay =
            $("qrOverlay");

        const qrImage =
            $("qrImage");

        const profileLink =
            $("profileLink");


        if (!overlay || !qrImage) {
            return;
        }


        const url =
            obterURLPerfil();


        const qrUrl =
            `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
                url
            )}`;


        qrImage.src = qrUrl;


        if (profileLink) {
            profileLink.textContent = url;
        }


        overlay.classList.add("active");

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        atualizarIcones();
    }


    function fecharQRCode() {

        const overlay =
            $("qrOverlay");


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

    }


    async function compartilharQR() {

        const url =
            obterURLPerfil();


        const nome =
            dadosPerfil?.perfil?.nome ||
            "Perfil de cantor";


        if (
            navigator.share
        ) {

            try {

                await navigator.share({

                    title:
                        `${nome} - MusicalWorld`,

                    text:
                        `Confira o perfil de ${nome} no MusicalWorld.`,

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
                "Link copiado para a área de transferência."
            );

        } catch (erro) {

            mostrarToast(
                "Não foi possível copiar o link."
            );

        }

    }


    /* =====================================================
       TABS
    ====================================================== */

    function inicializarTabs() {

        const tabs =
            document.querySelectorAll(
                ".profile-tab"
            );


        const conteudos =
            document.querySelectorAll(
                ".tab-content"
            );


        tabs.forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const nome =
                        tab.dataset.tab;


                    tabs.forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                    conteudos.forEach(
                        conteudo => {

                            conteudo.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    const alvo =
                        document.getElementById(
                            `tab-${nome}`
                        );


                    if (alvo) {

                        alvo.classList.add(
                            "active"
                        );

                    }


                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });

                }
            );

        });

    }


    /* =====================================================
       BOTÃO VOLTAR
    ====================================================== */

    function inicializarBotaoVoltar() {

        const botao =
            $("btnVoltar");


        if (!botao) {
            return;
        }


        botao.addEventListener(
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


    /* =====================================================
       BOTÕES
    ====================================================== */

    function inicializarBotoes() {

        $("btnWhatsApp")?.addEventListener(
            "click",
            abrirWhatsApp
        );


        $("btnContratar")?.addEventListener(
            "click",
            contratar
        );


        $("btnQRCode")?.addEventListener(
            "click",
            abrirQRCode
        );


        $("btnFecharQR")?.addEventListener(
            "click",
            fecharQRCode
        );


        $("btnCompartilharQR")?.addEventListener(
            "click",
            compartilharQR
        );


        $("qrOverlay")?.addEventListener(
            "click",
            evento => {

                if (
                    evento.target ===
                    $("qrOverlay")
                ) {

                    fecharQRCode();

                }

            }
        );


        document.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key === "Escape"
                ) {

                    fecharQRCode();

                }

            }
        );

    }


    /* =====================================================
       ÍCONES
    ====================================================== */

    function atualizarIcones() {

        if (
            window.lucide &&
            typeof lucide.createIcons ===
                "function"
        ) {

            lucide.createIcons();

        }

    }


    /* =====================================================
       ERRO
    ====================================================== */

    function mostrarErro(mensagem) {

        const nome =
            $("profileName");

        if (nome) {

            nome.textContent =
                "Perfil não encontrado.";

        }


        const bio =
            $("profileBio");

        if (bio) {

            bio.textContent =
                mensagem;

        }


        const genreList =
            $("genreList");

        if (genreList) {

            genreList.innerHTML =
                "";

        }


        const servicesList =
            $("servicesList");

        if (servicesList) {

            servicesList.innerHTML =
                "";

        }


        const portfolioGrid =
            $("portfolioGrid");

        if (portfolioGrid) {

            portfolioGrid.innerHTML =
                criarEstadoVazio(
                    "user-x",
                    "Perfil indisponível.",
                    mensagem
                );

        }


        const videoList =
            $("videoList");

        if (videoList) {
            videoList.innerHTML = "";
        }


        const audioList =
            $("audioList");

        if (audioList) {
            audioList.innerHTML = "";
        }


        const agendaList =
            $("agendaList");

        if (agendaList) {
            agendaList.innerHTML = "";
        }


        const reviewsList =
            $("reviewsList");

        if (reviewsList) {
            reviewsList.innerHTML = "";
        }


        atualizarIcones();
    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    async function inicializar() {

        try {

            perfilId =
                obterPerfilIdDaURL();


            if (!perfilId) {

                throw new Error(
                    "Nenhum perfil foi informado na URL."
                );

            }


            await carregarPerfil();


            preencherPerfil();


            inicializarTabs();

            inicializarBotaoVoltar();

            inicializarBotoes();

            atualizarIcones();


            console.log(
                "MusicalWorld: perfil público de cantor inicializado."
            );


        } catch (erro) {

            console.error(
                "MusicalWorld: erro ao inicializar perfil público:",
                erro
            );


            mostrarErro(
                erro?.message ||
                "Não foi possível carregar este perfil."
            );

        }

    }


    /* =====================================================
       DOM READY
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();

    }


})();