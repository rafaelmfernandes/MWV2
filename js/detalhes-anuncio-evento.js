"use strict";

/*
MUSICALWORLD
DETALHES DO ANÚNCIO DE EVENTO

Funcionamento atual:

Carrega anúncio pelo ID da URL.
Busca primeiro no localStorage.
Preparado para futura integração com Supabase.
Compatível com diferentes formatos de objeto do anúncio.
Favoritos são armazenados localmente.

URL esperada:

detalhes-anuncio-evento.html?id=EVENTO_ID

=========================================================
*/

document.addEventListener(
"DOMContentLoaded",
iniciarPagina
);

/* ======================================================
CONFIGURAÇÕES
====================================================== */

const CONFIG = {

STORAGE_KEY:
    "anuncios_eventos_musicalworld",

TABELA_SUPABASE:
    "anuncios_eventos",

USAR_SUPABASE:
    false

};

/* ======================================================
ESTADO
====================================================== */

let anuncioAtual = null;

let anuncioId = null;

/* ======================================================
INICIALIZAÇÃO
====================================================== */

async function iniciarPagina() {

anuncioId =
    obterIdDaUrl();


configurarEventos();


anuncioAtual =
    await carregarAnuncio();


if (!anuncioAtual) {

    mostrarErro(
        "Não foi possível encontrar este evento."
    );

    return;

}


renderizarEvento(
    anuncioAtual
);


configurarFavorito(
    anuncioAtual
);

}

/* ======================================================
EVENTOS
====================================================== */

function configurarEventos() {

const voltar =
    document.getElementById(
        "btn-voltar"
    );


if (voltar) {

    voltar.addEventListener(
        "click",
        voltarPagina
    );

}


const favorito =
    document.getElementById(
        "favoriteButton"
    );


if (favorito) {

    favorito.addEventListener(
        "click",
        alternarFavorito
    );

}


const acao =
    document.getElementById(
        "primaryAction"
    );


if (acao) {

    acao.addEventListener(
        "click",
        demonstrarInteresse
    );

}


const ingresso =
    document.getElementById(
        "ticketButton"
    );


if (ingresso) {

    ingresso.addEventListener(
        "click",
        abrirLinkIngresso
    );

}


const mapa =
    document.getElementById(
        "mapButton"
    );


if (mapa) {

    mapa.addEventListener(
        "click",
        abrirLocalizacao
    );

}


const perfil =
    document.getElementById(
        "publisherButton"
    );


if (perfil) {

    perfil.addEventListener(
        "click",
        abrirPerfilPublicador
    );

}

}

/* ======================================================
ID DA URL
====================================================== */

function obterIdDaUrl() {

const parametros =
    new URLSearchParams(
        window.location.search
    );


return parametros.get("id");

}

/* ======================================================
CARREGAR ANÚNCIO
====================================================== */

async function carregarAnuncio() {

/*
------------------------------------------------------
FUTURO SUPABASE
------------------------------------------------------

Quando o banco estiver pronto:

const { data, error } =
    await supabaseClient
        .from(CONFIG.TABELA_SUPABASE)
        .select("*")
        .eq("id", anuncioId)
        .single();

------------------------------------------------------
*/


const anuncios =
    obterAnunciosLocais();


if (!anuncios.length) {

    return null;

}


if (anuncioId) {

    const encontrado =
        anuncios.find(
            function(anuncio) {

                return String(
                    anuncio.id
                ) === String(
                    anuncioId
                );

            }
        );


    if (encontrado) {

        return encontrado;

    }

}


/*
------------------------------------------------------
Se não houver ID, usamos o último anúncio.
Isso facilita o teste da página durante o desenvolvimento.
------------------------------------------------------
*/

if (!anuncioId) {

    return anuncios[
        anuncios.length - 1
    ];

}


return null;

}

/* ======================================================
LOCALSTORAGE
====================================================== */

function obterAnunciosLocais() {

try {

    const dados =
        localStorage.getItem(
            CONFIG.STORAGE_KEY
        );


    if (!dados) {

        return [];

    }


    const convertidos =
        JSON.parse(dados);


    return Array.isArray(
        convertidos
    )
        ? convertidos
        : [];

} catch (erro) {

    console.error(
        "Erro ao carregar eventos:",
        erro
    );

    return [];

}

}

/* ======================================================
RENDERIZAÇÃO
====================================================== */

function renderizarEvento(
anuncio
) {

const evento =
    obterObjetoEvento(
        anuncio
    );


renderizarInformacoesPrincipais(
    evento
);


renderizarData(
    evento
);


renderizarDescricao(
    evento
);


renderizarAtrações(
    evento
);


renderizarLocalizacao(
    evento
);


renderizarIngressos(
    evento
);


renderizarInformacoes(
    evento
);


renderizarPublicador(
    anuncio,
    evento
);


renderizarMidia(
    anuncio,
    evento
);

}

/* ======================================================
OBJETO DO EVENTO
====================================================== */

function obterObjetoEvento(
anuncio
) {

/*
Aceita:

anuncio.evento

ou

anuncio diretamente

Isso deixa a página mais flexível para
futuras alterações no banco.
*/

if (
    anuncio &&
    anuncio.evento &&
    typeof anuncio.evento === "object"
) {

    return anuncio.evento;

}


return anuncio || {};

}

/* ======================================================
INFORMAÇÕES PRINCIPAIS
====================================================== */

function renderizarInformacoesPrincipais(
evento
) {

const titulo =
    primeiroValor(
        evento.titulo,
        evento.nome,
        evento.nomeEvento
    ) ||
    "Evento Musical";


const tipo =
    primeiroValor(
        evento.tipo,
        evento.tipoEvento
    );


const classificacao =
    primeiroValor(
        evento.classificacao
    );


definirTexto(
    "eventTitle",
    titulo
);


definirTexto(
    "eventType",
    tipo
        ? formatarTipoEvento(tipo)
        : "Evento"
);


definirTexto(
    "eventClassification",
    classificacao
        ? "Classificação " +
          formatarClassificacao(
              classificacao
          )
        : "Classificação não informada"
);

}

/* ======================================================
DATA
====================================================== */

function renderizarData(
evento
) {

const data =
    primeiroValor(
        evento.data,
        evento.dataEvento
    );


const inicio =
    primeiroValor(
        evento.horarioInicio,
        evento.inicio,
        evento.horaInicio
    );


const fim =
    primeiroValor(
        evento.horarioFim,
        evento.fim,
        evento.horaFim
    );


const dataFormatada =
    formatarData(
        data
    );


const dia =
    obterDia(
        data
    );


const mes =
    obterMesCurto(
        data
    );


definirTexto(
    "eventDay",
    dia || "--"
);


definirTexto(
    "eventMonth",
    mes || "---"
);


definirTexto(
    "eventDate",
    dataFormatada ||
    "Data não informada"
);


let horario =
    "Horário não informado";


if (inicio) {

    horario =
        "A partir das " +
        inicio;

    if (fim) {

        horario +=
            " até " +
            fim;

    }

}


definirTexto(
    "eventTime",
    horario
);


definirTexto(
    "infoDate",
    dataFormatada ||
    "Não informada"
);


definirTexto(
    "infoTime",
    inicio
        ? (
            fim
                ? inicio + " às " + fim
                : inicio
          )
        : "Não informado"
);

}

/* ======================================================
DESCRIÇÃO
====================================================== */

function renderizarDescricao(
evento
) {

definirTexto(
    "eventDescription",
    primeiroValor(
        evento.descricao,
        evento.sobre,
        evento.descricaoEvento
    ) ||
    "Nenhuma descrição foi informada."
);

}

/* ======================================================
ATRAÇÕES
====================================================== */

function renderizarAtrações(
evento
) {

const section =
    document.getElementById(
        "artistsSection"
    );


const container =
    document.getElementById(
        "artistsList"
    );


if (!section || !container) {

    return;

}


let artistas =
    primeiroValor(
        evento.artistas,
        evento.artistasEvento,
        evento.atracoes,
        evento.atrações
    );


if (Array.isArray(artistas)) {

    artistas =
        artistas
            .map(
                function(item) {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        return item.trim();

                    }

                    if (
                        item &&
                        typeof item ===
                        "object"
                    ) {

                        return primeiroValor(
                            item.nome,
                            item.nomeArtistico,
                            item.titulo
                        );

                    }

                    return "";

                }
            )
            .filter(Boolean);

} else if (
    typeof artistas ===
    "string"
) {

    artistas =
        artistas
            .split(
                /[,;\n]+/
            )
            .map(
                function(item) {

                    return item.trim();

                }
            )
            .filter(Boolean);

} else {

    artistas = [];

}


if (!artistas.length) {

    section.hidden = true;

    return;

}


section.hidden = false;

container.innerHTML = "";


artistas.forEach(
    function(nome) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "artist-item";


        item.innerHTML = `

            <div class="artist-item-icon">

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round">

                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>

                </svg>

            </div>

            <span></span>

        `;


        const texto =
            item.querySelector(
                "span"
            );


        texto.textContent =
            nome;


        container.appendChild(
            item
        );

    }
);

}

/* ======================================================
LOCALIZAÇÃO
====================================================== */

function renderizarLocalizacao(
evento
) {

const local =
    primeiroValor(
        evento.nomeLocal,
        evento.local,
        evento.nomeLocalEvento,
        evento.venue
    ) ||
    "Local do evento";


const endereco =
    primeiroValor(
        evento.endereco,
        evento.enderecoEvento
    );


const cidade =
    primeiroValor(
        evento.cidade
    );


const estado =
    primeiroValor(
        evento.estado,
        evento.uf
    );


const cep =
    primeiroValor(
        evento.cep
    );


const complemento =
    primeiroValor(
        evento.complemento
    );


definirTexto(
    "eventVenue",
    local
);


let enderecoCompleto =
    endereco ||
    "Endereço não informado";


if (complemento) {

    enderecoCompleto +=
        " - " +
        complemento;

}


if (cep) {

    enderecoCompleto +=
        " - CEP " +
        cep;

}


definirTexto(
    "eventAddress",
    enderecoCompleto
);


let cidadeCompleta =
    cidade ||
    "";


if (estado) {

    cidadeCompleta +=
        cidadeCompleta
            ? " - " + estado
            : estado;

}


definirTexto(
    "eventCity",
    cidadeCompleta ||
    "Localização não informada"
);

}

/* ======================================================
INGRESSOS
====================================================== */

function renderizarIngressos(
evento
) {

const section =
    document.getElementById(
        "ticketsSection"
    );


const tipo =
    primeiroValor(
        evento.tipoIngresso,
        evento.tipo_ingresso,
        evento.ingressoTipo
    );


const preco =
    primeiroValor(
        evento.precoIngresso,
        evento.preco_ingresso,
        evento.preco
    );


const possuiIngresso =
    obterBooleano(
        evento.possuiIngresso,
        evento.possui_ingresso
    );


const link =
    primeiroValor(
        evento.linkIngresso,
        evento.link_ingresso
    );


/*
Se o objeto não possui nenhuma informação
relacionada a ingressos, ainda mostramos
a seção informando que não foi configurado.
*/

if (!section) {

    return;

}


const ticketType =
    document.getElementById(
        "ticketType"
    );


const ticketPrice =
    document.getElementById(
        "ticketPrice"
    );


const ticketButton =
    document.getElementById(
        "ticketButton"
    );


if (!possuiIngresso) {

    definirTexto(
        "ticketType",
        "Entrada gratuita ou sem venda configurada"
    );


    definirTexto(
        "ticketPrice",
        "Consulte as informações do organizador."
    );


    if (ticketButton) {

        ticketButton.hidden = true;

    }

    return;

}


definirTexto(
    "ticketType",
    formatarTipoIngresso(
        tipo
    )
);


if (
    String(tipo).toLowerCase() ===
    "pago" &&
    preco
) {

    definirTexto(
        "ticketPrice",
        "A partir de " +
        formatarMoeda(
            preco
        )
    );

} else {

    definirTexto(
        "ticketPrice",
        obterDescricaoIngresso(
            tipo
        )
    );

}


if (
    ticketButton &&
    link
) {

    ticketButton.hidden =
        false;

    ticketButton.dataset.url =
        link;

}

}

/* ======================================================
INFORMAÇÕES
====================================================== */

function renderizarInformacoes(
evento
) {

const classificacao =
    primeiroValor(
        evento.classificacao
    );


definirTexto(
    "infoClassification",
    classificacao
        ? formatarClassificacao(
            classificacao
        )
        : "Não informada"
);

}

/* ======================================================
PUBLICADOR
====================================================== */

function renderizarPublicador(
anuncio,
evento
) {

const autor =
    anuncio.autor ||
    anuncio.publicador ||
    {};


const nome =
    primeiroValor(
        autor.nome,
        anuncio.autorNome,
        anuncio.publicadorNome,
        evento.organizador,
        evento.organizadorNome
    ) ||
    "MusicalWorld";


const avatar =
    primeiroValor(
        autor.avatarUrl,
        autor.avatar_url,
        anuncio.autorAvatarUrl,
        anuncio.avatarUrl
    );


definirTexto(
    "publisherName",
    nome
);


const iniciais =
    gerarIniciais(
        nome
    );


definirTexto(
    "publisherInitials",
    iniciais
);


const avatarImagem =
    document.getElementById(
        "publisherAvatarImage"
    );


if (
    avatarImagem &&
    avatar
) {

    avatarImagem.src =
        avatar;

    avatarImagem.alt =
        "Foto de " + nome;

    avatarImagem.hidden =
        false;

}


const tipoPublicador =
    primeiroValor(
        autor.tipo,
        anuncio.tipoAutor
    );


definirTexto(
    "publisherType",
    tipoPublicador ||
    "Organizador do evento"
);

}

/* ======================================================
MÍDIA
====================================================== */

function renderizarMidia(
anuncio,
evento
) {

const imagem =
    primeiroValor(
        evento.imagemUrl,
        evento.imagem_url,
        evento.fotoUrl,
        evento.foto_url,
        anuncio.imagemUrl,
        anuncio.imagem_url
    );


const video =
    primeiroValor(
        evento.videoUrl,
        evento.video_url,
        anuncio.videoUrl,
        anuncio.video_url
    );


const imagemElemento =
    document.getElementById(
        "eventImage"
    );


const videoElemento =
    document.getElementById(
        "eventVideo"
    );


const placeholder =
    document.getElementById(
        "mediaPlaceholder"
    );


if (
    video &&
    videoElemento
) {

    videoElemento.src =
        video;

    videoElemento.hidden =
        false;


    if (imagemElemento) {

        imagemElemento.hidden =
            true;

    }


    if (placeholder) {

        placeholder.hidden =
            true;

    }


    return;

}


if (
    imagem &&
    imagemElemento
) {

    imagemElemento.src =
        imagem;

    imagemElemento.hidden =
        false;


    if (videoElemento) {

        videoElemento.hidden =
            true;

    }


    if (placeholder) {

        placeholder.hidden =
            true;

    }


    return;

}


if (placeholder) {

    placeholder.hidden =
        false;

}

}

/* ======================================================
FAVORITO
====================================================== */

function obterChaveFavorito() {

return (
    "musicalworld_favorito_evento_" +
    String(
        anuncioId || "sem-id"
    )
);

}

function configurarFavorito() {

const botao =
    document.getElementById(
        "favoriteButton"
    );


if (!botao) {

    return;

}


const salvo =
    localStorage.getItem(
        obterChaveFavorito()
    );


if (salvo === "true") {

    botao.classList.add(
        "active"
    );

    botao.setAttribute(
        "aria-label",
        "Remover evento dos favoritos"
    );

}

}

function alternarFavorito() {

if (!anuncioAtual) {

    return;

}


const botao =
    document.getElementById(
        "favoriteButton"
    );


if (!botao) {

    return;

}


const ativo =
    botao.classList.toggle(
        "active"
    );


localStorage.setItem(
    obterChaveFavorito(),
    ativo
        ? "true"
        : "false"
);


botao.setAttribute(
    "aria-label",
    ativo
        ? "Remover evento dos favoritos"
        : "Favoritar evento"
);

}

/* ======================================================
INTERESSE
====================================================== */

function demonstrarInteresse() {

if (!anuncioAtual) {

    return;

}


const botao =
    document.getElementById(
        "primaryAction"
    );


const titulo =
    document.getElementById(
        "eventActionTitle"
    );


if (!botao) {

    return;

}


const ativo =
    botao.classList.toggle(
        "active"
    );


if (ativo) {

    botao.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path
                d="M20 6 9 17l-5-5"></path>

        </svg>

        Interesse registrado

    `;


    if (titulo) {

        titulo.textContent =
            "Você demonstrou interesse";

    }

} else {

    botao.innerHTML = `

        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round">

            <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"></path>

        </svg>

        Tenho interesse

    `;


    if (titulo) {

        titulo.textContent =
            "Demonstrar interesse";

    }

}

}

/* ======================================================
LINK DE INGRESSO
====================================================== */

function abrirLinkIngresso() {

const botao =
    document.getElementById(
        "ticketButton"
    );


if (!botao) {

    return;

}


const url =
    botao.dataset.url;


if (!url) {

    return;

}


try {

    window.open(
        url,
        "_blank"
    );

} catch (erro) {

    window.location.href =
        url;

}

}

/* ======================================================
LOCALIZAÇÃO
====================================================== */

function abrirLocalizacao() {

if (!anuncioAtual) {

    return;

}


const evento =
    obterObjetoEvento(
        anuncioAtual
    );


const endereco =
    primeiroValor(
        evento.endereco,
        evento.enderecoEvento
    );


const cidade =
    primeiroValor(
        evento.cidade
    );


const estado =
    primeiroValor(
        evento.estado,
        evento.uf
    );


const local =
    primeiroValor(
        evento.nomeLocal,
        evento.local
    );


const consulta = [

    local,

    endereco,

    cidade,

    estado

]
    .filter(Boolean)
    .join(", ");


if (!consulta) {

    mostrarErro(
        "A localização deste evento ainda não foi informada."
    );

    return;

}


const url =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(
        consulta
    );


window.open(
    url,
    "_blank"
);

}

/* ======================================================
PERFIL
====================================================== */

function abrirPerfilPublicador() {

if (!anuncioAtual) {

    return;

}


const autor =
    anuncioAtual.autor ||
    {};


const autorId =
    primeiroValor(
        autor.id,
        anuncioAtual.autorId,
        anuncioAtual.autor_id
    );


if (!autorId) {

    mostrarErro(
        "O perfil do organizador estará disponível em uma próxima versão."
    );

    return;

}


window.location.href =
    "perfil.html?id=" +
    encodeURIComponent(
        autorId
    );

}

/* ======================================================
VOLTAR
====================================================== */

function voltarPagina() {

if (
    window.history.length >
    1
) {

    window.history.back();

    return;

}


window.location.href =
    "index.html";

}

/* ======================================================
FORMATAÇÕES
====================================================== */

function formatarTipoEvento(
valor
) {

const mapa = {

    "show":
        "Show",

    "festa":
        "Festa",

    "festival":
        "Festival",

    "bar":
        "Evento em bar",

    "casa-de-shows":
        "Casa de shows",

    "evento-particular":
        "Evento particular",

    "outro":
        "Outro"

};


return mapa[
    String(
        valor
    ).toLowerCase()
] ||
valor;

}

function formatarClassificacao(
valor
) {

const mapa = {

    "livre":
        "Livre",

    "10":
        "10 anos",

    "12":
        "12 anos",

    "14":
        "14 anos",

    "16":
        "16 anos",

    "18":
        "18 anos"

};


return mapa[
    String(
        valor
    ).toLowerCase()
] ||
valor;

}

function formatarTipoIngresso(
valor
) {

const mapa = {

    "gratuito":
        "Entrada gratuita",

    "pago":
        "Ingresso pago",

    "doacao":
        "Entrada mediante doação",

    "lista":
        "Lista / Nome na portaria"

};


return mapa[
    String(
        valor
    ).toLowerCase()
] ||
"Informações de ingresso";

}

function obterDescricaoIngresso(
tipo
) {

const mapa = {

    "gratuito":
        "Entrada gratuita.",

    "doacao":
        "Entrada mediante doação.",

    "lista":
        "Nome na lista ou na portaria."

};


return mapa[
    String(
        tipo
    ).toLowerCase()
] ||
"Consulte as informações do evento.";

}

function formatarMoeda(
valor
) {

const numero =
    Number(
        String(
            valor
        )
            .replace(
                /\./g,
                ""
            )
            .replace(
                ",",
                "."
            )
    );


if (!Number.isFinite(numero)) {

    return "Consulte o organizador.";

}


return numero.toLocaleString(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);

}

/* ======================================================
DATAS
====================================================== */

function criarDataLocal(
valor
) {

if (!valor) {

    return null;

}


const texto =
    String(
        valor
    ).trim();


if (
    /^\d{4}-\d{2}-\d{2}$/.test(
        texto
    )
) {

    const partes =
        texto.split("-");


    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}


const data =
    new Date(
        texto
    );


return Number.isNaN(
    data.getTime()
)
    ? null
    : data;

}

function formatarData(
valor
) {

const data =
    criarDataLocal(
        valor
    );


if (!data) {

    return "";

}


return data.toLocaleDateString(
    "pt-BR",
    {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }
);

}

function obterDia(
valor
) {

const data =
    criarDataLocal(
        valor
    );


if (!data) {

    return "";

}


return String(
    data.getDate()
).padStart(
    2,
    "0"
);

}

function obterMesCurto(
valor
) {

const data =
    criarDataLocal(
        valor
    );


if (!data) {

    return "";

}


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
    )
    .toUpperCase();

}

/* ======================================================
HELPERS
====================================================== */

function primeiroValor(
...valores
) {

for (
    const valor of valores
) {

    if (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
    ) {

        return valor;

    }

}


return null;

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


/*
Alguns elementos possuem SVG.
Para eles, não substituímos o innerHTML.
*/

if (
    id === "eventType" ||
    id === "eventClassification"
) {

    const span =
        elemento.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            texto;

        return;

    }

}


elemento.textContent =
    texto;

}

function obterBooleano(
...valores
) {

for (
    const valor of valores
) {

    if (
        valor === true ||
        valor === false
    ) {

        return valor;

    }


    if (
        typeof valor ===
        "string"
    ) {

        if (
            valor.toLowerCase() ===
            "true"
        ) {

            return true;

        }

        if (
            valor.toLowerCase() ===
            "false"
        ) {

            return false;

        }

    }

}


return false;

}

function gerarIniciais(
nome
) {

if (!nome) {

    return "MW";

}


const palavras =
    String(
        nome
    )
        .trim()
        .split(/\s+/)
        .filter(Boolean);


if (!palavras.length) {

    return "MW";

}


if (
    palavras.length === 1
) {

    return palavras[0]
        .substring(0, 2)
        .toUpperCase();

}


return (
    palavras[0][0] +
    palavras[
        palavras.length - 1
    ][0]
).toUpperCase();

}

/* ======================================================
ERRO
====================================================== */

function mostrarErro(
mensagem
) {

const toast =
    document.getElementById(
        "errorMessage"
    );


const texto =
    document.getElementById(
        "errorText"
    );


if (!toast) {

    return;

}


if (texto) {

    texto.textContent =
        mensagem;

}


toast.classList.add(
    "show"
);


setTimeout(
    function() {

        toast.classList.remove(
            "show"
        );

    },
    3500
);

}