const MusicalWorldDetalhesCantor = (function () {

"use strict";


/* =====================================================
   CONFIGURAÇÃO
====================================================== */

const CONFIG = {

    tipoAnuncio: "cantor",

    paginaContratacao:
        "selecao-servico.html",

    paginaPerfil:
        "perfil-artista.html",

    chaveFavorito:
        "musicalworld_favorito_cantor_",

    chaveCache:
        "musicalworld_anuncio_cantor_",

    chaveEvento:
        "evento_artista_atual"

};


/* =====================================================
   PARÂMETROS DA URL
====================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


const anuncioId =
    params.get("id") ||
    params.get("anuncioId") ||
    "rafael-melo";


/* =====================================================
   DADOS TEMPORÁRIOS
   
   ESTA ESTRUTURA SERÁ SUBSTITUÍDA FUTURAMENTE
   PELA CONSULTA AO SUPABASE.
====================================================== */

const anuncios = {

    "rafael-melo": {

        id: "rafael-melo",

        tipo_anuncio: "cantor",

        usuario_id: null,

        nome: "Rafael Melo",

        nome_artistico: "Rafael Melo",

        iniciais: "RM",

        categoria: "Cantor e violonista",

        localizacao: "Goiânia, GO",

        cidade: "Goiânia",

        estado: "GO",

        avaliacao: 4.9,

        quantidade_avaliacoes: 128,

        verificado: true,

        descricao:
            "Cantor e violonista com repertório de MPB, pop e sertanejo. Ideal para casamentos, aniversários, bares, restaurantes, eventos corporativos e celebrações especiais.",

        estilos: [
            "MPB",
            "Pop",
            "Sertanejo",
            "Acústico"
        ],

        imagem_url: "",

        video_url: "",

        equipamento:
            "Possui equipamento próprio para apresentações.",

        atendimento:
            "Goiânia e cidades próximas.",

        resposta:
            "Normalmente responde em poucas horas.",

        servicos: [

            {
                id: "voz-violao",

                nome: "Voz e violão",

                descricao:
                    "Apresentação acústica",

                duracao:
                    "Até 2 horas",

                preco: 800
            },

            {
                id: "show-completo",

                nome: "Show completo",

                descricao:
                    "Repertório completo para seu evento",

                duracao:
                    "Até 3 horas",

                preco: 1500
            },

            {
                id: "banda-completa",

                nome: "Banda completa",

                descricao:
                    "Formação completa para eventos",

                duracao:
                    "Até 4 horas",

                preco: 2400
            }

        ],

        status: "ativo",

        criado_em:
            "2026-09-01T12:00:00",

        atualizado_em:
            "2026-09-01T12:00:00"

    },


    "gabriel-tatu": {

        id: "gabriel-tatu",

        tipo_anuncio: "cantor",

        usuario_id: null,

        nome: "Gabriel Tatu",

        nome_artistico: "Gabriel Tatu",

        iniciais: "GT",

        categoria: "Cantor e guitarrista",

        localizacao: "Goiânia, GO",

        cidade: "Goiânia",

        estado: "GO",

        avaliacao: 4.8,

        quantidade_avaliacoes: 96,

        verificado: true,

        descricao:
            "Cantor e guitarrista com repertório voltado para rock, pop e blues. Apresentações para bares, restaurantes, eventos particulares e corporativos.",

        estilos: [
            "Rock",
            "Pop",
            "Blues",
            "Acústico"
        ],

        imagem_url: "",

        video_url: "",

        equipamento:
            "Equipamento próprio para apresentações de pequeno e médio porte.",

        atendimento:
            "Goiânia e região.",

        resposta:
            "Normalmente responde no mesmo dia.",

        servicos: [

            {
                id: "guitarra-voz",

                nome: "Guitarra e voz",

                descricao:
                    "Apresentação acústica",

                duracao:
                    "Até 2 horas",

                preco: 700
            },

            {
                id: "show-completo",

                nome: "Show completo",

                descricao:
                    "Show para eventos",

                duracao:
                    "Até 3 horas",

                preco: 1400
            },

            {
                id: "banda-completa",

                nome: "Banda completa",

                descricao:
                    "Formação completa",

                duracao:
                    "Até 4 horas",

                preco: 2200
            }

        ],

        status: "ativo",

        criado_em:
            "2026-09-01T12:00:00",

        atualizado_em:
            "2026-09-01T12:00:00"

    },


    "marcos-lima": {

        id: "marcos-lima",

        tipo_anuncio: "cantor",

        usuario_id: null,

        nome: "Marcos Lima",

        nome_artistico: "Marcos Lima",

        iniciais: "ML",

        categoria: "Cantor e compositor",

        localizacao: "Goiânia, GO",

        cidade: "Goiânia",

        estado: "GO",

        avaliacao: 4.9,

        quantidade_avaliacoes: 74,

        verificado: true,

        descricao:
            "Cantor e compositor com repertório autoral e versões acústicas de MPB e sertanejo.",

        estilos: [
            "MPB",
            "Sertanejo",
            "Acústico",
            "Autoral"
        ],

        imagem_url: "",

        video_url: "",

        equipamento:
            "Equipamentos disponíveis conforme o formato contratado.",

        atendimento:
            "Goiânia e cidades próximas.",

        resposta:
            "Normalmente responde em poucas horas.",

        servicos: [

            {
                id: "show-acustico",

                nome: "Show acústico",

                descricao:
                    "Repertório acústico",

                duracao:
                    "Até 2 horas",

                preco: 1000
            },

            {
                id: "show-completo",

                nome: "Show completo",

                descricao:
                    "Show para eventos",

                duracao:
                    "Até 3 horas",

                preco: 1600
            }

        ],

        status: "ativo"

    },


    "carlos-silva": {

        id: "carlos-silva",

        tipo_anuncio: "cantor",

        usuario_id: null,

        nome: "Carlos Silva",

        nome_artistico: "Carlos Silva",

        iniciais: "CS",

        categoria: "Cantor e produtor",

        localizacao: "Goiânia, GO",

        cidade: "Goiânia",

        estado: "GO",

        avaliacao: 4.7,

        quantidade_avaliacoes: 61,

        verificado: false,

        descricao:
            "Cantor e produtor musical para apresentações em eventos, bares, restaurantes e projetos personalizados.",

        estilos: [
            "Pop",
            "Eletrônico",
            "Eventos"
        ],

        imagem_url: "",

        video_url: "",

        equipamento:
            "Equipamento disponível conforme a necessidade do evento.",

        atendimento:
            "Goiânia e região.",

        resposta:
            "Responde normalmente no mesmo dia.",

        servicos: [

            {
                id: "apresentacao-solo",

                nome: "Apresentação solo",

                descricao:
                    "Apresentação individual",

                duracao:
                    "Até 2 horas",

                preco: 900
            },

            {
                id: "show-completo",

                nome: "Show completo",

                descricao:
                    "Show para eventos",

                duracao:
                    "Até 3 horas",

                preco: 1800
            }

        ],

        status: "ativo"

    }

};


/* =====================================================
   ESTADO DA PÁGINA
====================================================== */

let anuncioAtual = null;

let servicoSelecionado = null;


/* =====================================================
   INICIALIZAÇÃO
====================================================== */

function iniciar() {

    carregarAnuncio();

    if (!anuncioAtual) {

        mostrarErro();

        return;
    }


    montarPagina();

    configurarEventos();

    carregarFavorito();

    salvarCacheLocal();

}


/* =====================================================
   CARREGAR ANÚNCIO
====================================================== */

function carregarAnuncio() {

    /*
     * PRIMEIRO:
     * procura na estrutura temporária local.
     *
     * FUTURO:
     * substituir por:
     *
     * const { data, error } =
     * await supabase
     * .from("anuncios")
     * .select("*")
     * .eq("id", anuncioId)
     * .single();
     */

    anuncioAtual =
        anuncios[anuncioId];


    /*
     * FALLBACK:
     * tenta recuperar cache.
     */

    if (!anuncioAtual) {

        anuncioAtual =
            carregarCacheLocal();

    }


    if (!anuncioAtual) {

        console.warn(
            "Anúncio de cantor não encontrado:",
            anuncioId
        );

        return;
    }


    if (
        !Array.isArray(
            anuncioAtual.servicos
        )
    ) {

        anuncioAtual.servicos = [];

    }


    if (
        !Array.isArray(
            anuncioAtual.estilos
        )
    ) {

        anuncioAtual.estilos = [];

    }


    /*
     * Seleciona automaticamente
     * o primeiro serviço.
     */

    if (
        anuncioAtual.servicos.length > 0
    ) {

        servicoSelecionado =
            anuncioAtual.servicos[0];

    }

}


/* =====================================================
   MONTAR PÁGINA
====================================================== */

function montarPagina() {

    atualizarIdentificacao();

    atualizarMidia();

    atualizarDescricao();

    atualizarEstilos();

    atualizarServicos();

    atualizarInformacoes();

    atualizarPerfil();

    atualizarBarraContratacao();

}


/* =====================================================
   IDENTIFICAÇÃO
====================================================== */

function atualizarIdentificacao() {

    const avatar =
        document.getElementById(
            "artistAvatar"
        );

    const nome =
        document.getElementById(
            "artistName"
        );

    const categoria =
        document.getElementById(
            "artistCategory"
        );

    const rating =
        document.getElementById(
            "artistRating"
        );

    const reviews =
        document.getElementById(
            "artistReviews"
        );

    const location =
        document.getElementById(
            "artistLocation"
        );

    const badge =
        document.getElementById(
            "verifiedBadge"
        );


    if (avatar) {

        avatar.textContent =
            anuncioAtual.iniciais ||
            obterIniciais(
                anuncioAtual.nome
            );

    }


    if (nome) {

        nome.textContent =
            anuncioAtual.nome_artistico ||
            anuncioAtual.nome ||
            "Cantor";

    }


    if (categoria) {

        categoria.textContent =
            anuncioAtual.categoria ||
            "Cantor";

    }


    if (rating) {

        rating.textContent =
            formatarRating(
                anuncioAtual.avaliacao
            );

    }


    if (reviews) {

        reviews.textContent =
            `(${Number(
                anuncioAtual.quantidade_avaliacoes || 0
            ).toLocaleString("pt-BR")} avaliações)`;

    }


    if (location) {

        location.textContent =
            anuncioAtual.localizacao ||
            "Localização não informada";

    }


    if (badge) {

        badge.hidden =
            anuncioAtual.verificado === false;

    }

}


/* =====================================================
   MÍDIA
====================================================== */

function atualizarMidia() {

    const image =
        document.getElementById(
            "artistImage"
        );

    const video =
        document.getElementById(
            "artistVideo"
        );

    const placeholder =
        document.getElementById(
            "mediaPlaceholder"
        );

    const playButton =
        document.getElementById(
            "playVideoButton"
        );


    const imagemURL =
        anuncioAtual.imagem_url ||
        "";

    const videoURL =
        anuncioAtual.video_url ||
        "";


    if (imagemURL && image) {

        image.src =
            imagemURL;

        image.alt =
            `Imagem de ${anuncioAtual.nome_artistico || anuncioAtual.nome}`;

        image.hidden =
            false;

        if (placeholder) {

            placeholder.hidden =
                true;

        }

    }


    if (videoURL && video) {

        video.src =
            videoURL;

        video.hidden =
            false;

        if (placeholder) {

            placeholder.hidden =
                true;

        }

        if (playButton) {

            playButton.hidden =
                false;

        }

    }


    /*
     * Quando o banco tiver URL real,
     * a mídia aparecerá automaticamente.
     */

}


/* =====================================================
   DESCRIÇÃO
====================================================== */

function atualizarDescricao() {

    const description =
        document.getElementById(
            "artistDescription"
        );


    if (!description) {
        return;
    }


    description.textContent =
        anuncioAtual.descricao ||
        "Este cantor ainda não adicionou uma descrição.";

}


/* =====================================================
   ESTILOS
====================================================== */

function atualizarEstilos() {

    const container =
        document.getElementById(
            "genreList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    anuncioAtual.estilos.forEach(
        function (estilo) {

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

}


/* =====================================================
   SERVIÇOS
====================================================== */

function atualizarServicos() {

    const container =
        document.getElementById(
            "servicesList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        !anuncioAtual.servicos.length
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "service-card";

        empty.innerHTML =
            `
            <div class="service-content">
                <strong>
                    Consulte o cantor
                </strong>
                <span>
                    Entre em contato para solicitar um orçamento.
                </span>
            </div>
            `;

        container.appendChild(
            empty
        );

        return;
    }


    anuncioAtual.servicos.forEach(
        function (servico, index) {

            const card =
                document.createElement(
                    "button"
                );

            card.type =
                "button";

            card.className =
                "service-card";


            if (
                servicoSelecionado &&
                servico.id ===
                    servicoSelecionado.id
            ) {

                card.classList.add(
                    "selected"
                );

            }


            card.dataset.serviceId =
                servico.id || index;


            card.innerHTML =
                `
                <div class="service-icon">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >

                        <path
                            d="M9 18V5L21 3V16"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />

                        <circle
                            cx="6"
                            cy="18"
                            r="3"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                        />

                        <circle
                            cx="18"
                            cy="16"
                            r="3"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                        />

                    </svg>

                </div>


                <div class="service-content">

                    <strong>
                        ${escaparHTML(servico.nome)}
                    </strong>

                    <span>
                        ${escaparHTML(servico.descricao || "")}
                        ${servico.duracao ? " • " + escaparHTML(servico.duracao) : ""}
                    </span>

                </div>


                <div class="service-price">
                    ${formatarPreco(servico.preco)}
                </div>
                `;


            card.addEventListener(
                "click",
                function () {

                    selecionarServico(
                        servico.id
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   SELECIONAR SERVIÇO
====================================================== */

function selecionarServico(
    serviceId
) {

    const encontrado =
        anuncioAtual.servicos.find(
            function (servico) {

                return (
                    String(servico.id) ===
                    String(serviceId)
                );

            }
        );


    if (!encontrado) {
        return;
    }


    servicoSelecionado =
        encontrado;


    document
        .querySelectorAll(
            ".service-card"
        )
        .forEach(
            function (card) {

                card.classList.toggle(
                    "selected",
                    String(
                        card.dataset.serviceId
                    ) ===
                    String(serviceId)
                );

            }
        );


    atualizarBarraContratacao();

}


/* =====================================================
   BARRA DE CONTRATAÇÃO
====================================================== */

function atualizarBarraContratacao() {

    const nome =
        document.getElementById(
            "selectedService"
        );

    const preco =
        document.getElementById(
            "selectedServicePrice"
        );


    if (!servicoSelecionado) {

        if (nome) {

            nome.textContent =
                "Consultar disponibilidade";

        }

        if (preco) {

            preco.textContent =
                "";

        }

        return;
    }


    if (nome) {

        nome.textContent =
            servicoSelecionado.nome;

    }


    if (preco) {

        preco.textContent =
            formatarPreco(
                servicoSelecionado.preco
            );

    }

}


/* =====================================================
   INFORMAÇÕES
====================================================== */

function atualizarInformacoes() {

    const container =
        document.getElementById(
            "informationList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    adicionarInformacao(
        container,
        "Equipamentos",
        anuncioAtual.equipamento,
        `
        <svg viewBox="0 0 24 24" aria-hidden="true">

            <rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
            />

            <path
                d="M8 9H16M8 13H14"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
            />

        </svg>
        `
    );


    adicionarInformacao(
        container,
        "Área de atendimento",
        anuncioAtual.atendimento,
        `
        <svg viewBox="0 0 24 24" aria-hidden="true">

            <path
                d="M12 21C12 21 19 15.2 19 9C19 5.13 15.87 2 12 2C8.13 2 5 5.13 5 9C5 15.2 12 21 12 21Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
            />

            <circle
                cx="12"
                cy="9"
                r="2.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
            />

        </svg>
        `
    );


    adicionarInformacao(
        container,
        "Resposta",
        anuncioAtual.resposta,
        `
        <svg viewBox="0 0 24 24" aria-hidden="true">

            <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
            />

            <path
                d="M12 7V12L15 14"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

        </svg>
        `
    );

}


/* =====================================================
   CRIAR INFORMAÇÃO
====================================================== */

function adicionarInformacao(
    container,
    titulo,
    texto,
    icone
) {

    if (!texto) {
        return;
    }


    const item =
        document.createElement(
            "div"
        );

    item.className =
        "information-item";


    item.innerHTML =
        `
        <div class="information-icon">
            ${icone}
        </div>

        <div class="information-content">

            <strong>
                ${escaparHTML(titulo)}
            </strong>

            <span>
                ${escaparHTML(texto)}
            </span>

        </div>
        `;


    container.appendChild(
        item
    );

}


/* =====================================================
   PERFIL
====================================================== */

function atualizarPerfil() {

    const button =
        document.getElementById(
            "profileButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        abrirPerfil
    );

}


function abrirPerfil() {

    const id =
        encodeURIComponent(
            anuncioAtual.id
        );


    window.location.href =
        `${CONFIG.paginaPerfil}?id=${id}`;

}


/* =====================================================
   CONTRATAÇÃO
====================================================== */

function iniciarContratacao() {

    if (
        !anuncioAtual ||
        !servicoSelecionado
    ) {

        mostrarMensagem(
            "Selecione um serviço para continuar."
        );

        return;
    }


    /*
     * Guarda uma estrutura temporária.
     *
     * As próximas páginas podem utilizar
     * esses dados caso necessário.
     */

    const eventoAtual = {

        id:
            gerarId(),

        artistaId:
            anuncioAtual.id,

        artista:
            anuncioAtual.nome_artistico ||
            anuncioAtual.nome,

        servico:
            servicoSelecionado.nome,

        preco:
            Number(
                servicoSelecionado.preco
            ),

        status:
            "Pendente de Confirmação",

        criadoEm:
            new Date().toISOString()

    };


    localStorage.setItem(
        CONFIG.chaveEvento,
        JSON.stringify(
            eventoAtual
        )
    );


    /*
     * Mantém exatamente o fluxo
     * que já construímos.
     */

    const query =
        new URLSearchParams({

            id:
                anuncioAtual.id,

            artista:
                anuncioAtual.nome_artistico ||
                anuncioAtual.nome,

            servico:
                servicoSelecionado.nome,

            preco:
                String(
                    servicoSelecionado.preco
                )

        });


    window.location.href =
        `${CONFIG.paginaContratacao}?${query.toString()}`;

}


/* =====================================================
   FAVORITO
====================================================== */

function alternarFavorito() {

    const chave =
        CONFIG.chaveFavorito +
        anuncioAtual.id;


    const atual =
        localStorage.getItem(
            chave
        ) === "true";


    const novoEstado =
        !atual;


    localStorage.setItem(
        chave,
        String(
            novoEstado
        )
    );


    atualizarVisualFavorito(
        novoEstado
    );

}


function carregarFavorito() {

    if (!anuncioAtual) {
        return;
    }


    const chave =
        CONFIG.chaveFavorito +
        anuncioAtual.id;


    const favorito =
        localStorage.getItem(
            chave
        ) === "true";


    atualizarVisualFavorito(
        favorito
    );

}


function atualizarVisualFavorito(
    favorito
) {

    const button =
        document.getElementById(
            "favoriteButton"
        );


    if (!button) {
        return;
    }


    button.classList.toggle(
        "favorited",
        favorito
    );


    button.setAttribute(
        "aria-pressed",
        String(
            favorito
        )
    );


    button.setAttribute(
        "aria-label",
        favorito
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
    );

}


/* =====================================================
   VÍDEO
====================================================== */

function reproduzirVideo() {

    const video =
        document.getElementById(
            "artistVideo"
        );


    if (!video) {
        return;
    }


    video.play().catch(
        function (erro) {

            console.warn(
                "Não foi possível reproduzir o vídeo:",
                erro
            );

        }
    );

}


/* =====================================================
   EVENTOS
====================================================== */

function configurarEventos() {

    const backButton =
        document.getElementById(
            "backButton"
        );


    const favoriteButton =
        document.getElementById(
            "favoriteButton"
        );


    const contractButton =
        document.getElementById(
            "contractButton"
        );


    const playButton =
        document.getElementById(
            "playVideoButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            voltarPagina
        );

    }


    if (favoriteButton) {

        favoriteButton.addEventListener(
            "click",
            alternarFavorito
        );

    }


    if (contractButton) {

        contractButton.addEventListener(
            "click",
            iniciarContratacao
        );

    }


    if (playButton) {

        playButton.addEventListener(
            "click",
            reproduzirVideo
        );

    }

}


/* =====================================================
   VOLTAR
====================================================== */

function voltarPagina() {

    if (
        document.referrer &&
        document.referrer !==
            window.location.href
    ) {

        window.history.back();

        return;

    }


    window.location.href =
        "index.html";

}


/* =====================================================
   CACHE LOCAL
====================================================== */

function salvarCacheLocal() {

    if (!anuncioAtual) {
        return;
    }


    try {

        localStorage.setItem(
            CONFIG.chaveCache +
            anuncioAtual.id,

            JSON.stringify(
                anuncioAtual
            )
        );

    } catch (erro) {

        console.warn(
            "Não foi possível salvar o cache:",
            erro
        );

    }

}


function carregarCacheLocal() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.chaveCache +
                anuncioId
            );


        if (!dados) {
            return null;
        }


        return JSON.parse(
            dados
        );

    } catch (erro) {

        console.warn(
            "Erro ao ler cache do anúncio:",
            erro
        );

        return null;

    }

}


/* =====================================================
   FUTURO BANCO DE DADOS
====================================================== */

async function buscarAnuncioNoBanco(
    id
) {

    /*
     * FUTURO SUPABASE
     *
     * Aqui ficará a consulta real.
     *
     * Exemplo de estrutura:
     *
     * const { data, error } =
     * await supabaseClient
     *     .from("anuncios_cantores")
     *     .select(`
     *         *,
     *         servicos_anuncios_cantores(*)
     *     `)
     *     .eq("id", id)
     *     .eq("status", "ativo")
     *     .single();
     *
     * if (error) {
     *     throw error;
     * }
     *
     * return data;
     */


    return null;

}


/* =====================================================
   ESTRUTURA PARA PUBLICAÇÃO FUTURA
====================================================== */

async function salvarAnuncioNoBanco(
    dados
) {

    /*
     * Esta função será utilizada futuramente
     * pelo painel de criação de anúncios.
     *
     * A página de detalhes NÃO deve criar
     * ou alterar o anúncio.
     *
     * Ela apenas consulta e exibe.
     */

    if (!dados) {

        throw new Error(
            "Dados do anúncio não informados."
        );

    }


    /*
     * FUTURO:
     *
     * await supabaseClient
     *     .from("anuncios_cantores")
     *     .insert(dados);
     */


    return {

        sucesso: true,

        modo:
            "local",

        dados

    };

}


/* =====================================================
   UTILITÁRIOS
====================================================== */

function formatarPreco(
    valor
) {

    const numero =
        Number(valor) || 0;


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function formatarRating(
    valor
) {

    const numero =
        Number(valor);


    if (
        Number.isNaN(numero)
    ) {

        return "0,0";

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }
    );

}


function obterIniciais(
    nome
) {

    if (!nome) {
        return "MW";
    }


    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            function (parte) {

                return parte
                    .charAt(0)
                    .toUpperCase();

            }
        )
        .join("");

}


function gerarId() {

    return (
        "mw-" +
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function escaparHTML(
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


function mostrarMensagem(
    mensagem
) {

    const error =
        document.getElementById(
            "errorMessage"
        );


    if (!error) {

        alert(
            mensagem
        );

        return;

    }


    const texto =
        error.querySelector(
            "span"
        );


    if (texto) {

        texto.textContent =
            mensagem;

    }


    error.hidden =
        false;


    setTimeout(
        function () {

            error.hidden =
                true;

        },
        3500
    );

}


function mostrarErro() {

    const card =
        document.getElementById(
            "adDetailsCard"
        );


    if (card) {

        card.innerHTML =
            `
            <div style="
                padding:40px 24px;
                text-align:center;
            ">

                <strong style="
                    display:block;
                    color:#172033;
                    font-size:17px;
                    margin-bottom:8px;
                ">
                    Anúncio não encontrado
                </strong>

                <span style="
                    color:#64748b;
                    font-size:13px;
                    line-height:1.5;
                ">
                    Este anúncio pode ter sido removido
                    ou não está mais disponível.
                </span>

            </div>
            `;

    }


    const button =
        document.getElementById(
            "contractButton"
        );


    if (button) {

        button.disabled =
            true;

    }

}


/* =====================================================
   API PÚBLICA
====================================================== */

return {

    iniciar,

    selecionarServico,

    iniciarContratacao,

    alternarFavorito,

    buscarAnuncioNoBanco,

    salvarAnuncioNoBanco

};

})();

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
function () {

    MusicalWorldDetalhesCantor.iniciar();

}

);