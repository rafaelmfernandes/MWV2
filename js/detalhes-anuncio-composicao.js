"use strict";

/*

MUSICALWORLD
DETALHES DO ANÚNCIO DE COMPOSIÇÃO

Fluxo atual:

criar-anuncio-composicao
↓
localStorage
↓
detalhes-anuncio-composicao.html?id=...
↓
carrega anúncio
↓
exibe composição

Fluxo futuro:

criar anúncio
↓
Supabase Storage
↓
Supabase Database
↓
detalhes-anuncio-composicao
↓
interesse / negociação

*/

document.addEventListener(
"DOMContentLoaded",
iniciarPagina
);

/* ======================================================
CONFIGURAÇÃO
====================================================== */

const CONFIG = {

STORAGE_KEY:
    "anuncios_composicoes_musicalworld",

USAR_SUPABASE:
    false,

TABELA_ANUNCIOS:
    "anuncios_composicoes",

PAGINA_INTERESSE:
    "interesse-composicao.html",

PAGINA_PERFIL:
    "perfil-compositor.html"

};

/* ======================================================
ESTADO
====================================================== */

let anuncioAtual = null;

let audioElement = null;

let audioPlayButton = null;

let audioProgress = null;

let audioProgressFill = null;

let audioCurrentTime = null;

let audioDuration = null;

let audioFileName = null;

/* ======================================================
INICIALIZAÇÃO
====================================================== */

async function iniciarPagina() {

configurarElementos();

configurarEventos();

const id =
    obterIdDaUrl();


if (!id) {

    mostrarMensagem(
        "Não foi possível identificar esta composição."
    );

    return;

}


try {

    if (CONFIG.USAR_SUPABASE) {

        anuncioAtual =
            await carregarAnuncioSupabase(id);

    } else {

        anuncioAtual =
            carregarAnuncioLocal(id);

    }


    if (!anuncioAtual) {

        mostrarMensagem(
            "Composição não encontrada."
        );

        return;

    }


    renderizarAnuncio(anuncioAtual);

} catch (erro) {

    console.error(
        "Erro ao carregar composição:",
        erro
    );

    mostrarMensagem(
        "Não foi possível carregar os detalhes da composição."
    );

}

}

/* ======================================================
ELEMENTOS
====================================================== */

function configurarElementos() {

audioElement =
    document.getElementById(
        "compositionAudio"
    );


audioPlayButton =
    document.getElementById(
        "audioPlayButton"
    );


audioProgress =
    document.getElementById(
        "audioProgress"
    );


audioProgressFill =
    document.getElementById(
        "audioProgressFill"
    );


audioCurrentTime =
    document.getElementById(
        "audioCurrentTime"
    );


audioDuration =
    document.getElementById(
        "audioDuration"
    );


audioFileName =
    document.getElementById(
        "audioFileName"
    );

}

/* ======================================================
EVENTOS
====================================================== */

function configurarEventos() {

const btnVoltar =
    document.getElementById(
        "btn-voltar"
    );


if (btnVoltar) {

    btnVoltar.addEventListener(
        "click",
        voltarPagina
    );

}


const favoriteButton =
    document.getElementById(
        "favoriteButton"
    );


if (favoriteButton) {

    favoriteButton.addEventListener(
        "click",
        alternarFavorito
    );

}


const primaryAction =
    document.getElementById(
        "primaryAction"
    );


if (primaryAction) {

    primaryAction.addEventListener(
        "click",
        demonstrarInteresse
    );

}


const profileButton =
    document.getElementById(
        "viewProfileButton"
    );


if (profileButton) {

    profileButton.addEventListener(
        "click",
        abrirPerfil
    );

}


if (audioPlayButton) {

    audioPlayButton.addEventListener(
        "click",
        alternarAudio
    );

}


if (audioElement) {

    audioElement.addEventListener(
        "loadedmetadata",
        atualizarDuracaoAudio
    );


    audioElement.addEventListener(
        "timeupdate",
        atualizarProgressoAudio
    );


    audioElement.addEventListener(
        "ended",
        finalizarAudio
    );

}


if (audioProgress) {

    audioProgress.addEventListener(
        "click",
        alterarPosicaoAudio
    );

}


const lyricsButton =
    document.getElementById(
        "lyricsButton"
    );


if (lyricsButton) {

    lyricsButton.addEventListener(
        "click",
        function() {

            abrirMaterial(
                anuncioAtual &&
                anuncioAtual.arquivos
                    ? anuncioAtual.arquivos.letra
                    : null
            );

        }
    );

}


const chordsButton =
    document.getElementById(
        "chordsButton"
    );


if (chordsButton) {

    chordsButton.addEventListener(
        "click",
        function() {

            abrirMaterial(
                anuncioAtual &&
                anuncioAtual.arquivos
                    ? anuncioAtual.arquivos.cifra
                    : null
            );

        }
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
LOCAL STORAGE
====================================================== */

function carregarAnuncioLocal(id) {

let anuncios = [];


try {

    const dados =
        localStorage.getItem(
            CONFIG.STORAGE_KEY
        );


    if (!dados) {

        return null;

    }


    const convertidos =
        JSON.parse(dados);


    if (Array.isArray(convertidos)) {

        anuncios =
            convertidos;

    }

} catch (erro) {

    console.error(
        "Erro ao ler anúncios locais:",
        erro
    );

    return null;

}


return anuncios.find(
    function(anuncio) {

        return String(anuncio.id) === String(id);

    }
) || null;

}

/* ======================================================
SUPABASE — FUTURO
====================================================== */

async function carregarAnuncioSupabase(id) {

/*
=====================================================
FUTURA INTEGRAÇÃO

Quando o Supabase estiver pronto:

const { data, error } =
    await supabaseClient
        .from(CONFIG.TABELA_ANUNCIOS)
        .select(`
            *,
            autor:usuarios(*)
        `)
        .eq("id", id)
        .single();

if (error) {
    throw error;
}

return data;

=====================================================
*/

console.warn(
    "Integração Supabase ainda não ativada."
);

return null;

}

/* ======================================================
RENDERIZAR
====================================================== */

function renderizarAnuncio(anuncio) {

const composicao =
    anuncio.composicao || anuncio;


const autor =
    anuncio.autor || {};


const arquivos =
    anuncio.arquivos || {};


const negociacao =
    anuncio.negociacao || {};


const direitos =
    anuncio.direitos || {};


const publicacao =
    anuncio.publicacao || {};


renderizarCabecalho(
    composicao,
    publicacao
);


renderizarDescricao(
    composicao
);


renderizarCaracteristicas(
    composicao
);


renderizarPublico(
    composicao.publicoAlvo
);


renderizarAudio(
    composicao,
    arquivos.audio
);


renderizarMateriais(
    arquivos
);


renderizarNegociacao(
    negociacao
);


renderizarDireitos(
    direitos
);


renderizarAutor(
    autor
);


configurarFavorito(
    anuncio.id
);

}

/* ======================================================
CABEÇALHO
====================================================== */

function renderizarCabecalho(
composicao,
publicacao
) {

definirTexto(
    "compositionTitle",
    composicao.titulo ||
    "Nome da composição"
);


definirTexto(
    "compositionGenre",
    composicao.genero ||
    "Gênero musical"
);


definirTexto(
    "compositionDuration",
    composicao.duracao ||
    "00:00"
);


definirTexto(
    "compositionType",
    composicao.tipoObra ||
    "Canção"
);


definirTexto(
    "compositionLanguage",
    composicao.idioma ||
    "Português"
);


definirTexto(
    "characteristicGenre",
    composicao.genero ||
    "Não informado"
);


definirTexto(
    "characteristicSubgenre",
    composicao.subgenero ||
    "Não informado"
);


definirTexto(
    "characteristicLanguage",
    composicao.idioma ||
    "Não informado"
);


definirTexto(
    "characteristicType",
    composicao.tipoObra ||
    "Não informado"
);


const statusBadge =
    document.getElementById(
        "statusBadge"
    );


if (statusBadge) {

    const status =
        publicacao.status ||
        "pendente";


    if (
        status === "pendente"
    ) {

        statusBadge.textContent =
            "Em análise";

        statusBadge.style.background =
            "#fff7ed";

        statusBadge.style.borderColor =
            "#fed7aa";

        statusBadge.style.color =
            "#c2410c";

    } else {

        statusBadge.textContent =
            "Disponível";

    }

}

}

/* ======================================================
DESCRIÇÃO
====================================================== */

function renderizarDescricao(
composicao
) {

definirTexto(
    "compositionDescription",
    composicao.descricao ||
    "O compositor ainda não adicionou uma descrição."
);


definirTexto(
    "compositionTheme",
    composicao.tema ||
    "Não informado"
);

}

/* ======================================================
PÚBLICO-ALVO
====================================================== */

function renderizarPublico(
publico
) {

const container =
    document.getElementById(
        "targetList"
    );


if (!container) {

    return;

}


container.innerHTML = "";


if (
    !Array.isArray(publico) ||
    publico.length === 0
) {

    const tag =
        criarTag(
            "Não informado",
            "target-tag"
        );


    container.appendChild(tag);

    return;

}


const nomes = {

    cantor:
        "Cantor",

    dupla:
        "Dupla",

    banda:
        "Banda",

    grupo:
        "Grupo",

    artista:
        "Artista solo"

};


publico.forEach(
    function(item) {

        const texto =
            nomes[item] ||
            item;


        container.appendChild(
            criarTag(
                texto,
                "target-tag"
            )
        );

    }
);

}

/* ======================================================
ÁUDIO
====================================================== */

function renderizarAudio(
composicao,
audio
) {

const player =
    document.getElementById(
        "audioPlayer"
    );


const unavailable =
    document.getElementById(
        "audioUnavailable"
    );


const url =
    audio &&
    audio.url
        ? audio.url
        : null;


if (!url) {

    if (player) {

        player.classList.add(
            "hidden"
        );

    }


    if (unavailable) {

        unavailable.classList.remove(
            "hidden"
        );

    }

    return;

}


if (unavailable) {

    unavailable.classList.add(
        "hidden"
    );

}


if (player) {

    player.classList.remove(
        "hidden"
    );

}


if (audioElement) {

    audioElement.src =
        url;

}


if (audioFileName) {

    audioFileName.textContent =
        audio.nomeArquivo ||
        composicao.titulo ||
        "Demonstração da composição";

}


definirTexto(
    "demoType",
    formatarTipoDemonstracao(
        composicao.tipoDemonstracao
    )
);

}

/* ======================================================
TIPO DE DEMONSTRAÇÃO
====================================================== */

function formatarTipoDemonstracao(
tipo
) {

const tipos = {

    voz:
        "Voz + instrumental",

    instrumental:
        "Instrumental"

};


return tipos[tipo] ||
    "Não informado";

}

/* ======================================================
MATERIAIS
====================================================== */

function renderizarMateriais(
arquivos
) {

const letra =
    arquivos.letra || {};


const cifra =
    arquivos.cifra || {};


configurarMaterial(
    "lyricsFileName",
    "lyricsButton",
    letra
);


configurarMaterial(
    "chordsFileName",
    "chordsButton",
    cifra
);

}

/* ======================================================
CONFIGURAR MATERIAL
====================================================== */

function configurarMaterial(
textId,
buttonId,
arquivo
) {

const texto =
    document.getElementById(
        textId
    );


const botao =
    document.getElementById(
        buttonId
    );


if (!arquivo) {

    return;

}


if (arquivo.nomeArquivo) {

    definirTexto(
        textId,
        arquivo.nomeArquivo
    );

}


if (
    botao &&
    arquivo.url
) {

    botao.disabled =
        false;

    botao.dataset.url =
        arquivo.url;

}

}

/* ======================================================
ABRIR MATERIAL
====================================================== */

function abrirMaterial(
arquivo
) {

if (
    !arquivo ||
    !arquivo.url
) {

    mostrarMensagem(
        "Este material ainda não está disponível."
    );

    return;

}


window.open(
    arquivo.url,
    "_blank",
    "noopener,noreferrer"
);

}

/* ======================================================
NEGOCIAÇÃO
====================================================== */

function renderizarNegociacao(
negociacao
) {

const objetivo =
    formatarObjetivoNegociacao(
        negociacao.objetivo
    );


const valor =
    formatarValor(
        negociacao.valor
    );


definirTexto(
    "negotiationObjective",
    objetivo
);


definirTexto(
    "negotiationValue",
    valor
);


definirTexto(
    "bottomObjective",
    objetivo
);


definirTexto(
    "bottomPrice",
    valor
);


const notice =
    document.getElementById(
        "negotiableNotice"
    );


if (notice) {

    if (
        negociacao.negociavel
    ) {

        notice.classList.remove(
            "hidden"
        );

    } else {

        notice.classList.add(
            "hidden"
        );

    }

}


renderizarTiposNegociacao(
    negociacao.tipos
);

}

/* ======================================================
OBJETIVO
====================================================== */

function formatarObjetivoNegociacao(
objetivo
) {

const objetivos = {

    venda:
        "Venda da composição",

    licenciamento:
        "Licenciamento",

    gravar:
        "Procuro artista para gravar",

    propostas:
        "Aceito propostas",

    divulgacao:
        "Apenas divulgação"

};


return objetivos[objetivo] ||
    "Não informado";

}

/* ======================================================
VALOR
====================================================== */

function formatarValor(
valor
) {

if (
    valor === null ||
    valor === undefined ||
    valor === "" ||
    Number.isNaN(Number(valor))
) {

    return "Sob consulta";

}


const numero =
    Number(valor);


if (numero <= 0) {

    return "Sob consulta";

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
TIPOS DE NEGOCIAÇÃO
====================================================== */

function renderizarTiposNegociacao(
tipos
) {

const container =
    document.getElementById(
        "negotiationTypes"
    );


if (!container) {

    return;

}


container.innerHTML = "";


if (
    !Array.isArray(tipos) ||
    tipos.length === 0
) {

    container.appendChild(
        criarTag(
            "A combinar",
            "type-tag"
        )
    );

    return;

}


const nomes = {

    definitiva:
        "Venda definitiva",

    exclusiva:
        "Exclusividade",

    "nao-exclusiva":
        "Não exclusiva"

};


tipos.forEach(
    function(item) {

        container.appendChild(
            criarTag(
                nomes[item] || item,
                "type-tag"
            )
        );

    }
);

}

/* ======================================================
DIREITOS
====================================================== */

function renderizarDireitos(
direitos
) {

const registro =
    formatarRegistro(
        direitos.registro
    );


definirTexto(
    "registrationStatus",
    registro
);

}

/* ======================================================
REGISTRO
====================================================== */

function formatarRegistro(
registro
) {

const registros = {

    registrada:
        "Registrada",

    processo:
        "Em processo",

    "nao-registrada":
        "Não registrada"

};


return registros[registro] ||
    "Não informado";

}

/* ======================================================
AUTOR
====================================================== */

function renderizarAutor(
autor
) {

const nome =
    autor.nome ||
    "Nome do compositor";


definirTexto(
    "authorName",
    nome
);


const avatar =
    document.getElementById(
        "authorAvatar"
    );


if (avatar) {

    if (autor.avatarUrl) {

        avatar.textContent = "";

        avatar.style.backgroundImage =
            "url('" +
            autor.avatarUrl +
            "')";

        avatar.style.backgroundSize =
            "cover";

        avatar.style.backgroundPosition =
            "center";

    } else {

        avatar.style.backgroundImage =
            "";

        avatar.textContent =
            gerarIniciais(nome);

    }

}


const profileButton =
    document.getElementById(
        "viewProfileButton"
    );


if (
    profileButton &&
    autor.id
) {

    profileButton.dataset.autorId =
        autor.id;

}

}

/* ======================================================
FAVORITO
====================================================== */

function configurarFavorito(
id
) {

const button =
    document.getElementById(
        "favoriteButton"
    );


if (!button) {

    return;

}


const chave =
    criarChaveFavorito(id);


const favorito =
    localStorage.getItem(
        chave
    ) === "true";


atualizarVisualFavorito(
    button,
    favorito
);

}

function alternarFavorito() {

if (
    !anuncioAtual ||
    !anuncioAtual.id
) {

    return;

}


const button =
    document.getElementById(
        "favoriteButton"
    );


if (!button) {

    return;

}


const chave =
    criarChaveFavorito(
        anuncioAtual.id
    );


const atual =
    localStorage.getItem(
        chave
    ) === "true";


const novoEstado =
    !atual;


localStorage.setItem(
    chave,
    String(novoEstado)
);


atualizarVisualFavorito(
    button,
    novoEstado
);


mostrarMensagem(
    novoEstado
        ? "Composição adicionada aos favoritos."
        : "Composição removida dos favoritos."
);

}

function atualizarVisualFavorito(
button,
favorito
) {

button.classList.toggle(
    "active",
    favorito
);


button.setAttribute(
    "aria-label",
    favorito
        ? "Remover dos favoritos"
        : "Favoritar composição"
);

}

function criarChaveFavorito(
id
) {

return (
    "musicalworld_favorito_composicao_" +
    id
);

}

/* ======================================================
INTERESSE
====================================================== */

function demonstrarInteresse() {

if (!anuncioAtual) {

    return;

}


const id =
    anuncioAtual.id;


/*
FUTURO:

window.location.href =
    CONFIG.PAGINA_INTERESSE +
    "?id=" +
    encodeURIComponent(id);

*/


mostrarMensagem(
    "A área de interesse e negociação será conectada ao sistema de contratação."
);


console.log(
    "INTERESSE NA COMPOSIÇÃO:",
    anuncioAtual
);

}

/* ======================================================
PERFIL
====================================================== */

function abrirPerfil() {

if (!anuncioAtual) {

    return;

}


const autor =
    anuncioAtual.autor ||
    {};


if (!autor.id) {

    mostrarMensagem(
        "O perfil do compositor ainda será conectado."
    );

    return;

}


window.location.href =
    CONFIG.PAGINA_PERFIL +
    "?id=" +
    encodeURIComponent(
        autor.id
    );

}

/* ======================================================
ÁUDIO — CONTROLES
====================================================== */

function alternarAudio() {

if (!audioElement) {

    return;

}


if (!audioElement.src) {

    mostrarMensagem(
        "Esta composição não possui áudio disponível."
    );

    return;

}


if (audioElement.paused) {

    audioElement.play()
        .then(
            function() {

                atualizarBotaoAudio(
                    true
                );

            }
        )
        .catch(
            function(erro) {

                console.error(
                    "Erro ao reproduzir áudio:",
                    erro
                );

                mostrarMensagem(
                    "Não foi possível reproduzir o áudio."
                );

            }
        );

} else {

    audioElement.pause();

    atualizarBotaoAudio(
        false
    );

}

}

function atualizarBotaoAudio(
reproduzindo
) {

if (!audioPlayButton) {

    return;

}


const playIcon =
    audioPlayButton.querySelector(
        ".play-icon"
    );


const pauseIcon =
    audioPlayButton.querySelector(
        ".pause-icon"
    );


if (playIcon) {

    playIcon.classList.toggle(
        "hidden",
        reproduzindo
    );

}


if (pauseIcon) {

    pauseIcon.classList.toggle(
        "hidden",
        !reproduzindo
    );

}

}

function atualizarDuracaoAudio() {

if (!audioElement) {

    return;

}


const duracao =
    audioElement.duration;


if (
    Number.isFinite(duracao)
) {

    const formatada =
        formatarTempo(
            duracao
        );


    if (audioDuration) {

        audioDuration.textContent =
            formatada;

    }

}

}

function atualizarProgressoAudio() {

if (!audioElement) {

    return;

}


const atual =
    audioElement.currentTime;


const duracao =
    audioElement.duration;


if (
    audioCurrentTime
) {

    audioCurrentTime.textContent =
        formatarTempo(
            atual
        );

}


if (
    audioProgressFill &&
    Number.isFinite(duracao) &&
    duracao > 0
) {

    const porcentagem =
        (
            atual /
            duracao
        ) * 100;


    audioProgressFill.style.width =
        porcentagem + "%";

}

}

function finalizarAudio() {

atualizarBotaoAudio(
    false
);

}

function alterarPosicaoAudio(
event
) {

if (
    !audioElement ||
    !audioElement.duration
) {

    return;

}


const rect =
    audioProgress.getBoundingClientRect();


const posicao =
    event.clientX -
    rect.left;


const porcentagem =
    Math.max(
        0,
        Math.min(
            1,
            posicao /
            rect.width
        )
    );


audioElement.currentTime =
    audioElement.duration *
    porcentagem;

}

/* ======================================================
VOLTAR
====================================================== */

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

/* ======================================================
HELPERS
====================================================== */

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
    texto !== undefined &&
    texto !== null &&
    texto !== ""
        ? texto
        : "—";

}

function criarTag(
texto,
classe
) {

const elemento =
    document.createElement(
        "span"
    );


elemento.className =
    classe;


elemento.textContent =
    texto;


return elemento;

}

function gerarIniciais(
nome
) {

if (!nome) {

    return "MW";

}


const partes =
    nome
        .trim()
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

function formatarTempo(
segundos
) {

if (
    !Number.isFinite(segundos)
) {

    return "00:00";

}


const total =
    Math.max(
        0,
        Math.floor(segundos)
    );


const minutos =
    Math.floor(
        total / 60
    );


const segundosRestantes =
    total % 60;


return (
    String(minutos).padStart(2, "0") +
    ":" +
    String(segundosRestantes).padStart(2, "0")
);

}

/* ======================================================
MENSAGEM
====================================================== */

let mensagemTimeout = null;

function mostrarMensagem(
texto
) {

const box =
    document.getElementById(
        "messageBox"
    );


const text =
    document.getElementById(
        "messageText"
    );


if (!box || !text) {

    return;

}


text.textContent =
    texto;


box.classList.remove(
    "hidden"
);


clearTimeout(
    mensagemTimeout
);


mensagemTimeout =
    setTimeout(
        function() {

            box.classList.add(
                "hidden"
            );

        },
        3500
    );

}

/* ======================================================
DISPONIBILIZAR PARA OUTROS ARQUIVOS
====================================================== */

window.MusicalWorldDetalhesComposicao = {

obterAnuncioAtual:
    function() {

        return anuncioAtual;

    },

carregarAnuncioLocal:
    carregarAnuncioLocal,

formatarValor:
    formatarValor,

formatarObjetivoNegociacao:
    formatarObjetivoNegociacao

};