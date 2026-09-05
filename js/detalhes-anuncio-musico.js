"use strict";

 /*

MUSICALWORLD
DETALHES DO ANÚNCIO DE MÚSICO
=============================

Esta página utiliza EXATAMENTE a estrutura criada pelo
criar-anuncio-musico.js.

Estrutura esperada:

anuncio
├── id
├── tipo
├── versaoEstrutura
├── autor
├── profissional
│   ├── nome
│   ├── instrumento
│   ├── localizacao
│   ├── especialidades
│   └── estilos
├── descricao
├── midia
│   ├── nomeArquivo
│   ├── tipo
│   ├── tamanho
│   ├── url
│   └── caminhoStorage
├── servicos
│   ├── show
│   ├── estudio
│   ├── acompanhamento
│   └── projetoPersonalizado
├── disponibilidade
│   ├── formatos
│   └── regiao
├── publicacao
│   ├── status
│   └── visibilidade
├── metricas
├── criadoEm
├── atualizadoEm
└── publicadoEm

Neste momento:

localStorage

Futuramente:

Supabase
+
Supabase Storage
+
sistema de contratação
+
pagamento
=========

*/

const CONFIG = {


STORAGE_KEY:
    "anuncios_musicos_musicalworld",

FUTURO_SUPABASE:
    false


};

let anuncioAtual = null;

let servicoSelecionado = null;

/* =====================================================
INICIALIZAÇÃO
===================================================== */

document.addEventListener(
"DOMContentLoaded",
iniciarPagina
);

function iniciarPagina() {


configurarEventos();

const id =
    obterIdAnuncio();

if (!id) {

    mostrarMensagem(
        "Não foi possível identificar o anúncio."
    );

    return;

}


const anuncio =
    buscarAnuncioLocal(id);


if (!anuncio) {

    mostrarMensagem(
        "O anúncio de músico não foi encontrado."
    );

    return;

}


anuncioAtual =
    anuncio;


renderizarAnuncio(
    anuncio
);


}

/* =====================================================
EVENTOS
===================================================== */

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
        solicitarContratacao
    );

}


const viewProfileButton =
    document.getElementById(
        "viewProfileButton"
    );


if (viewProfileButton) {

    viewProfileButton.addEventListener(
        "click",
        abrirPerfil
    );

}


const playButton =
    document.getElementById(
        "playButton"
    );


if (playButton) {

    playButton.addEventListener(
        "click",
        reproduzirVideo
    );

}


}

/* =====================================================
ID DO ANÚNCIO
===================================================== */

function obterIdAnuncio() {


const params =
    new URLSearchParams(
        window.location.search
    );


return params.get(
    "id"
);


}

/* =====================================================
BUSCAR ANÚNCIO
===================================================== */

function buscarAnuncioLocal(id) {


try {

    const dados =
        localStorage.getItem(
            CONFIG.STORAGE_KEY
        );


    if (!dados) {

        return null;

    }


    const anuncios =
        JSON.parse(
            dados
        );


    if (
        !Array.isArray(
            anuncios
        )
    ) {

        return null;

    }


    return (
        anuncios.find(
            function(anuncio) {

                return (
                    String(anuncio.id) ===
                    String(id)
                );

            }
        ) || null
    );

} catch (erro) {

    console.error(
        "Erro ao carregar anúncio:",
        erro
    );

    return null;

}


}

/* =====================================================
RENDERIZAÇÃO PRINCIPAL
===================================================== */

function renderizarAnuncio(
anuncio
) {


const profissional =
    anuncio.profissional || {};


renderizarIdentificacao(
    profissional
);


renderizarDescricao(
    anuncio
);


renderizarEspecialidades(
    profissional
);


renderizarEstilos(
    profissional
);


renderizarMidia(
    anuncio.midia
);


renderizarServicos(
    anuncio.servicos
);


renderizarDisponibilidade(
    anuncio.disponibilidade
);


renderizarInformacoes(
    anuncio
);


atualizarFavorito();


}

/* =====================================================
IDENTIFICAÇÃO
===================================================== */

function renderizarIdentificacao(
profissional
) {


const nome =
    profissional.nome ||
    "Músico";


const instrumento =
    formatarInstrumento(
        profissional.instrumento
    );


const localizacao =
    profissional.localizacao ||
    "Localização não informada";


const artistName =
    document.getElementById(
        "artistName"
    );


const artistInstrument =
    document.getElementById(
        "artistInstrument"
    );


const artistLocation =
    document.getElementById(
        "artistLocation"
    );


const artistInitials =
    document.getElementById(
        "artistInitials"
    );


const informationInstrument =
    document.getElementById(
        "informationInstrument"
    );


const informationLocation =
    document.getElementById(
        "informationLocation"
    );


if (artistName) {

    artistName.textContent =
        nome;

}


if (artistInstrument) {

    artistInstrument.textContent =
        instrumento;

}


if (artistLocation) {

    artistLocation.textContent =
        localizacao;

}


if (artistInitials) {

    artistInitials.textContent =
        gerarIniciais(
            nome
        );

}


if (informationInstrument) {

    informationInstrument.textContent =
        instrumento;

}


if (informationLocation) {

    informationLocation.textContent =
        localizacao;

}


}

/* =====================================================
DESCRIÇÃO
===================================================== */

function renderizarDescricao(
anuncio
) {


const elemento =
    document.getElementById(
        "artistDescription"
    );


if (!elemento) {

    return;

}


elemento.textContent =
    anuncio.descricao ||
    "Este músico ainda não adicionou uma descrição.";


}

/* =====================================================
ESPECIALIDADES
===================================================== */

function renderizarEspecialidades(
profissional
) {


const section =
    document.getElementById(
        "specialtiesSection"
    );


const elemento =
    document.getElementById(
        "artistSpecialties"
    );


if (!section || !elemento) {

    return;

}


const especialidades =
    profissional.especialidades
    ? profissional.especialidades.trim()
    : "";


if (!especialidades) {

    section.hidden =
        true;

    return;

}


elemento.textContent =
    especialidades;


section.hidden =
    false;


}

/* =====================================================
ESTILOS MUSICAIS
===================================================== */

function renderizarEstilos(
profissional
) {


const section =
    document.getElementById(
        "genresSection"
    );


const lista =
    document.getElementById(
        "genreList"
    );


if (!section || !lista) {

    return;

}


lista.innerHTML = "";


const estilos =
    Array.isArray(
        profissional.estilos
    )
        ? profissional.estilos
        : [];


if (!estilos.length) {

    section.hidden =
        true;

    return;

}


estilos.forEach(
    function(estilo) {

        const tag =
            document.createElement(
                "span"
            );


        tag.className =
            "genre-tag";


        tag.textContent =
            formatarEstilo(
                estilo
            );


        lista.appendChild(
            tag
        );

    }
);


section.hidden =
    false;


}

/* =====================================================
MÍDIA
===================================================== */

function renderizarMidia(
midia
) {


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
        "playButton"
    );


if (!image || !video || !placeholder) {

    return;

}


image.hidden =
    true;

video.hidden =
    true;

placeholder.hidden =
    false;


if (playButton) {

    playButton.hidden =
        true;

}


if (!midia) {

    return;

}


/*
Quando o Supabase Storage estiver funcionando,
o campo midia.url será utilizado.

No localStorage atual o URL fica null,
pois o arquivo físico não é armazenado no objeto.
*/


const url =
    midia.url;


if (!url) {

    return;

}


const tipo =
    String(
        midia.tipo || ""
    ).toLowerCase();


if (
    tipo.startsWith(
        "image/"
    )
) {

    image.src =
        url;

    image.hidden =
        false;

    placeholder.hidden =
        true;

    return;

}


if (
    tipo.startsWith(
        "video/"
    )
) {

    video.src =
        url;

    video.hidden =
        false;

    placeholder.hidden =
        true;


    if (playButton) {

        playButton.hidden =
            false;

    }

}


}

/* =====================================================
SERVIÇOS
===================================================== */

function renderizarServicos(
servicos
) {


const lista =
    document.getElementById(
        "servicesList"
    );


if (!lista) {

    return;

}


lista.innerHTML = "";


if (!servicos) {

    return;

}


const servicosDisponiveis = [];


if (
    servicos.show !== null &&
    servicos.show !== undefined
) {

    servicosDisponiveis.push({

        id:
            "show",

        titulo:
            "Freelancer / Show",

        descricao:
            "Participação em apresentações e eventos",

        preco:
            servicos.show,

        icone:
            "music"

    });

}


if (
    servicos.estudio !== null &&
    servicos.estudio !== undefined
) {

    servicosDisponiveis.push({

        id:
            "estudio",

        titulo:
            "Gravação em estúdio",

        descricao:
            "Participação em gravações musicais",

        preco:
            servicos.estudio,

        icone:
            "studio"

    });

}


if (
    servicos.acompanhamento !== null &&
    servicos.acompanhamento !== undefined
) {

    servicosDisponiveis.push({

        id:
            "acompanhamento",

        titulo:
            "Acompanhamento de artistas",

        descricao:
            "Shows, turnês e apresentações",

        preco:
            servicos.acompanhamento,

        icone:
            "artists"

    });

}


if (
    servicos.projetoPersonalizado === true
) {

    servicosDisponiveis.push({

        id:
            "projetoPersonalizado",

        titulo:
            "Projeto personalizado",

        descricao:
            "Serviços que dependem do projeto",

        preco:
            null,

        consulta:
            true,

        icone:
            "custom"

    });

}


if (!servicosDisponiveis.length) {

    const vazio =
        document.createElement(
            "p"
        );


    vazio.className =
        "description";


    vazio.textContent =
        "Nenhum serviço informado.";


    lista.appendChild(
        vazio
    );


    return;

}


servicosDisponiveis.forEach(
    function(servico) {

        const card =
            criarCardServico(
                servico
            );


        lista.appendChild(
            card
        );

    }
);


}

/* =====================================================
CARD DE SERVIÇO
===================================================== */

function criarCardServico(
servico
) {


const card =
    document.createElement(
        "button"
    );


card.type =
    "button";


card.className =
    "service-card";


card.dataset.serviceId =
    servico.id;


const preco =
    servico.consulta
        ? "Sob consulta"
        : formatarPreco(
            servico.preco
        );


card.innerHTML = `

    <div class="service-info">

        <div class="service-icon">

            ${obterIconeServico(servico.icone)}

        </div>

        <div class="service-content">

            <strong>
                ${escaparHtml(servico.titulo)}
            </strong>

            <span>
                ${escaparHtml(servico.descricao)}
            </span>

        </div>

    </div>

    <div class="service-price">
        ${escaparHtml(preco)}
    </div>

`;


card.addEventListener(
    "click",
    function() {

        selecionarServico(
            servico,
            card
        );

    }
);


return card;


}

/* =====================================================
SELECIONAR SERVIÇO
===================================================== */

function selecionarServico(
servico,
card
) {


document
    .querySelectorAll(
        ".service-card.selected"
    )
    .forEach(
        function(item) {

            item.classList.remove(
                "selected"
            );

        }
    );


card.classList.add(
    "selected"
);


servicoSelecionado =
    servico;


const nome =
    document.getElementById(
        "selectedServiceName"
    );


const preco =
    document.getElementById(
        "selectedServicePrice"
    );


const action =
    document.getElementById(
        "primaryAction"
    );


if (nome) {

    nome.textContent =
        servico.titulo;

}


if (preco) {

    preco.textContent =
        servico.consulta
            ? "Sob consulta"
            : formatarPreco(
                servico.preco
            );

}


if (action) {

    action.disabled =
        false;

}


}

/* =====================================================
DISPONIBILIDADE
===================================================== */

function renderizarDisponibilidade(
disponibilidade
) {


const lista =
    document.getElementById(
        "availabilityList"
    );


const area =
    document.getElementById(
        "serviceArea"
    );


if (!lista || !area) {

    return;

}


lista.innerHTML = "";


const formatos =
    disponibilidade &&
    Array.isArray(
        disponibilidade.formatos
    )
        ? disponibilidade.formatos
        : [];


const nomesFormatos = {

    presencial:
        "Presencial",

    estudio:
        "Estúdio",

    remoto:
        "Remoto"

};


formatos.forEach(
    function(formato) {

        const tag =
            document.createElement(
                "span"
            );


        tag.className =
            "availability-tag";


        tag.innerHTML = `

            ${obterIconeDisponibilidade(formato)}

            <span>
                ${escaparHtml(
                    nomesFormatos[formato] ||
                    formato
                )}
            </span>

        `;


        lista.appendChild(
            tag
        );

    }
);


if (!formatos.length) {

    const tag =
        document.createElement(
            "span"
        );


    tag.className =
        "availability-tag";


    tag.textContent =
        "Disponibilidade não informada";


    lista.appendChild(
        tag
    );

}


const regiao =
    disponibilidade &&
    disponibilidade.regiao
        ? disponibilidade.regiao
        : "cidade";


const textoRegiao =
    obterTextoRegiao(
        regiao
    );


area.innerHTML = `

    <strong>
        Região de atendimento:
    </strong>

    ${escaparHtml(textoRegiao)}

`;


}

/* =====================================================
INFORMAÇÕES
===================================================== */

function renderizarInformacoes(
anuncio
) {


const profissional =
    anuncio.profissional || {};


const disponibilidade =
    anuncio.disponibilidade || {};


const instrumento =
    document.getElementById(
        "informationInstrument"
    );


const location =
    document.getElementById(
        "informationLocation"
    );


const region =
    document.getElementById(
        "informationRegion"
    );


const status =
    document.getElementById(
        "informationStatus"
    );


if (instrumento) {

    instrumento.textContent =
        formatarInstrumento(
            profissional.instrumento
        );

}


if (location) {

    location.textContent =
        profissional.localizacao ||
        "Não informado";

}


if (region) {

    region.textContent =
        obterTextoRegiao(
            disponibilidade.regiao
        );

}


if (status) {

    status.textContent =
        anuncio.publicacao &&
        anuncio.publicacao.visibilidade ===
        "publico"
            ? "Anúncio público"
            : "Anúncio privado";

}


}

/* =====================================================
FAVORITO
===================================================== */

function obterChaveFavorito() {


if (!anuncioAtual) {

    return null;

}


return (
    "musicalworld_favorito_musico_" +
    anuncioAtual.id
);


}

function verificarFavorito() {


const chave =
    obterChaveFavorito();


if (!chave) {

    return false;

}


return (
    localStorage.getItem(
        chave
    ) === "true"
);


}

function atualizarFavorito() {


const button =
    document.getElementById(
        "favoriteButton"
    );


if (!button) {

    return;

}


const favorito =
    verificarFavorito();


button.classList.toggle(
    "is-favorite",
    favorito
);


button.setAttribute(
    "aria-pressed",
    String(favorito)
);


}

function alternarFavorito() {


const chave =
    obterChaveFavorito();


if (!chave) {

    return;

}


const novoEstado =
    !verificarFavorito();


localStorage.setItem(
    chave,
    String(novoEstado)
);


atualizarFavorito();


mostrarMensagem(
    novoEstado
        ? "Anúncio adicionado aos favoritos."
        : "Anúncio removido dos favoritos."
);


}

/* =====================================================
CONTRATAÇÃO
===================================================== */

function solicitarContratacao() {


if (!anuncioAtual) {

    return;

}


if (!servicoSelecionado) {

    mostrarMensagem(
        "Selecione um serviço antes de continuar."
    );

    return;

}


/*
FUTURO:

Aqui será criada a solicitação de contratação.

Exemplo:

contratar-musico.html
?id=ID_ANUNCIO
&servico=ID_SERVICO

*/


const url =
    "contratar-musico.html" +
    "?id=" +
    encodeURIComponent(
        anuncioAtual.id
    ) +
    "&servico=" +
    encodeURIComponent(
        servicoSelecionado.id
    );


console.log(
    "FUTURA CONTRATAÇÃO:",
    url
);


mostrarMensagem(
    "A etapa de contratação será disponibilizada em breve."
);


}

/* =====================================================
PERFIL
===================================================== */

function abrirPerfil() {


if (!anuncioAtual) {

    return;

}


/*
FUTURO:

Se o perfil do autor estiver disponível:

perfil-musico.html?id=autor_id

*/


console.log(
    "FUTURO PERFIL:",
    anuncioAtual.autor
);


mostrarMensagem(
    "O perfil completo do músico será disponibilizado em breve."
);


}

/* =====================================================
VÍDEO
===================================================== */

function reproduzirVideo() {


const video =
    document.getElementById(
        "artistVideo"
    );


const button =
    document.getElementById(
        "playButton"
    );


if (!video) {

    return;

}


video.play()
    .then(
        function() {

            if (button) {

                button.hidden =
                    true;

            }

        }
    )
    .catch(
        function(erro) {

            console.warn(
                "Não foi possível reproduzir o vídeo:",
                erro
            );

        }
    );


}

/* =====================================================
FORMATAÇÕES
===================================================== */

function formatarInstrumento(
instrumento
) {


const nomes = {

    sanfoneiro:
        "Sanfoneiro",

    guitarrista:
        "Guitarrista",

    violonista:
        "Violinista / Violonista",

    baterista:
        "Baterista",

    baixista:
        "Baixista",

    tecladista:
        "Tecladista",

    percussionista:
        "Percussionista",

    violinista:
        "Violinista",

    trompetista:
        "Trompetista",

    saxofonista:
        "Saxofonista",

    flautista:
        "Flautista",

    outro:
        "Outro"

};


return (
    nomes[instrumento] ||
    instrumento ||
    "Músico"
);


}

function formatarEstilo(
estilo
) {


const nomes = {

    sertanejo:
        "Sertanejo",

    forro:
        "Forró",

    pop:
        "Pop",

    mpb:
        "MPB",

    rock:
        "Rock",

    gospel:
        "Gospel",

    pagode:
        "Pagode",

    outros:
        "Outros"

};


return (
    nomes[estilo] ||
    estilo
);


}

function formatarPreco(
valor
) {


if (
    valor === null ||
    valor === undefined ||
    valor === ""
) {

    return "Não informado";

}


const numero =
    Number(
        valor
    );


if (
    !Number.isFinite(
        numero
    )
) {

    return "Não informado";

}


return numero.toLocaleString(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);


}

function obterTextoRegiao(
regiao
) {


const nomes = {

    cidade:
        "Apenas minha cidade",

    estado:
        "Todo o meu estado",

    regional:
        "Região próxima",

    brasil:
        "Todo o Brasil"

};


return (
    nomes[regiao] ||
    regiao ||
    "Não informado"
);


}

/* =====================================================
ÍCONES
===================================================== */

function obterIconeServico(
tipo
) {


if (tipo === "studio") {

    return `

        <svg viewBox="0 0 24 24">

            <circle
                cx="12"
                cy="12"
                r="9"
            ></circle>

            <path
                d="M9 9.5a3 3 0 0 1 6 0c0 1.5-1.2 2.5-3 2.5s-3 1-3 2.5a3 3 0 0 0 6 0"
            ></path>

        </svg>

    `;

}


if (tipo === "artists") {

    return `

        <svg viewBox="0 0 24 24">

            <circle
                cx="8"
                cy="8"
                r="3"
            ></circle>

            <circle
                cx="16"
                cy="16"
                r="3"
            ></circle>

            <path
                d="M13 5l6 6"
            ></path>

            <path
                d="M5 13l6 6"
            ></path>

        </svg>

    `;

}


if (tipo === "custom") {

    return `

        <svg viewBox="0 0 24 24">

            <path
                d="M12 3v18"
            ></path>

            <path
                d="M5 8h14"
            ></path>

            <path
                d="M7 8l-4 7h8z"
            ></path>

            <path
                d="M17 8l-4 7h8z"
            ></path>

        </svg>

    `;

}


return `

    <svg viewBox="0 0 24 24">

        <path
            d="M9 18V5l11-2v13"
        ></path>

        <circle
            cx="6"
            cy="18"
            r="3"
        ></circle>

        <circle
            cx="17"
            cy="16"
            r="3"
        ></circle>

    </svg>

`;


}

function obterIconeDisponibilidade(
formato
) {


if (formato === "estudio") {

    return `

        <svg viewBox="0 0 24 24">

            <circle
                cx="12"
                cy="12"
                r="9"
            ></circle>

            <path
                d="M9 9.5a3 3 0 0 1 6 0c0 1.5-1.2 2.5-3 2.5s-3 1-3 2.5a3 3 0 0 0 6 0"
            ></path>

        </svg>

    `;

}


if (formato === "remoto") {

    return `

        <svg viewBox="0 0 24 24">

            <rect
                x="4"
                y="5"
                width="16"
                height="11"
                rx="2"
            ></rect>

            <path
                d="M8 20h8"
            ></path>

            <path
                d="M12 16v4"
            ></path>

        </svg>

    `;

}


return `

    <svg viewBox="0 0 24 24">

        <path
            d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        ></path>

        <circle
            cx="12"
            cy="9"
            r="2.2"
        ></circle>

    </svg>

`;


}

/* =====================================================
INICIAIS
===================================================== */

function gerarIniciais(
nome
) {


if (!nome) {

    return "M";

}


const partes =
    nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);


if (!partes.length) {

    return "M";

}


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

/* =====================================================
ESCAPE HTML
===================================================== */

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

/* =====================================================
MENSAGEM
===================================================== */

function mostrarMensagem(
mensagem
) {


const elemento =
    document.getElementById(
        "errorMessage"
    );


const texto =
    document.getElementById(
        "errorText"
    );


if (!elemento || !texto) {

    alert(
        mensagem
    );

    return;

}


texto.textContent =
    mensagem;


elemento.hidden =
    false;


clearTimeout(
    mostrarMensagem.timeout
);


mostrarMensagem.timeout =
    setTimeout(
        function() {

            elemento.hidden =
                true;

        },
        3000
    );


}

/* =====================================================
NAVEGAÇÃO
===================================================== */

function voltarPagina() {


if (
    window.history.length > 1
) {

    window.history.back();

    return;

}


window.location.href =
    "index.html";


}

/* =====================================================
API EXTERNA
===================================================== */

window.MusicalWorldDetalhesMusico = {


obterAnuncio:
    function() {

        return anuncioAtual;

    },

obterServicoSelecionado:
    function() {

        return servicoSelecionado;

    },

recarregar:
    function() {

        const id =
            obterIdAnuncio();


        if (!id) {

            return;

        }


        const anuncio =
            buscarAnuncioLocal(
                id
            );


        if (anuncio) {

            anuncioAtual =
                anuncio;

            renderizarAnuncio(
                anuncio
            );

        }

    }


};
