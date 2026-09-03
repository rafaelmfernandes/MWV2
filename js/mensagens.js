const urlParams = new URLSearchParams(window.location.search);

/* =========================================================
DADOS RECEBIDOS DA URL
========================================================= */

const artistaIdURL =
urlParams.get("id") || "";

const artistaURL =
urlParams.get("artista") || "";

const servicoURL =
urlParams.get("servico") || "";

const precoURL =
urlParams.get("preco") || "";

/* =========================================================
ESTADO
========================================================= */

let conversaAtivaId = null;

let filtroAtual = "todas";

let termoBusca = "";

/* =========================================================
DADOS DE EXEMPLO
========================================================= */

const conversasDados = {

"rafael-melo": {

    id: "rafael-melo",

    nome: "Rafael Melo",

    sigla: "RM",

    contexto: "Voz e violão",

    status: "Online",

    categoriaFiltro: "contratado",

    mensagens: [

        {
            remetente: "outro",
            texto: "Olá! Tudo bem? Podemos conversar sobre o seu evento.",
            hora: "14:10"
        },

        {
            remetente: "eu",
            texto: "Claro. Gostaria de confirmar os detalhes da apresentação.",
            hora: "14:15"
        },

        {
            remetente: "outro",
            texto: "Combinado então! Chego às 18h no local para passagem de som.",
            hora: "14:32"
        }

    ]

},


"carlos-silva": {

    id: "carlos-silva",

    nome: "Carlos Silva",

    sigla: "CS",

    contexto: "Aniversário no Setor Bueno",

    status: "Há 10 min",

    categoriaFiltro: "servico-feito",

    mensagens: [

        {
            remetente: "outro",
            texto: "O cachê foi liberado pela plataforma. Muito obrigado pelo show!",
            hora: "Ontem"
        }

    ]

},


"marcos-lima": {

    id: "marcos-lima",

    nome: "Marcos Lima",

    sigla: "ML",

    contexto: "Parceria de composição",

    status: "Offline",

    categoriaFiltro: "contratado",

    mensagens: [

        {
            remetente: "outro",
            texto: "Enviei o áudio-guia da nova composição. Dá uma olhada quando puder.",
            hora: "Seg"
        }

    ]

}

};

/* =========================================================
ESCAPAR HTML
========================================================= */

function escaparHTML(texto) {

return String(texto)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}

/* =========================================================
ÍCONE DE MÚSICA
========================================================= */

function obterIconeMusica() {

return `
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
    </svg>
`;

}

/* =========================================================
FILTRAR CONVERSAS
========================================================= */

function filtrarConversas(tipo, elementoBtn) {

filtroAtual = tipo;


document
    .querySelectorAll(".cat-tab")
    .forEach(botao => {

        botao.classList.remove("ativo");

    });


if (elementoBtn) {

    elementoBtn.classList.add("ativo");

}


renderizarListaConversas();

}

/* =========================================================
RENDERIZAR LISTA
========================================================= */

function renderizarListaConversas() {

const container =
    document.getElementById("conversationsList");


if (!container) {
    return;
}


let html = "";


Object.values(conversasDados).forEach(conversa => {

    if (
        filtroAtual === "contratados" &&
        conversa.categoriaFiltro !== "contratado"
    ) {

        return;

    }


    if (
        filtroAtual === "servicos" &&
        conversa.categoriaFiltro !== "servico-feito"
    ) {

        return;

    }


    const textoPesquisa =
        `${conversa.nome} ${conversa.contexto} ${obterUltimaMensagem(conversa)}`
            .toLowerCase();


    if (
        termoBusca &&
        !textoPesquisa.includes(
            termoBusca.toLowerCase()
        )
    ) {

        return;

    }


    const ultimaMensagem =
        obterUltimaMensagem(conversa);


    const ultimaHora =
        obterHoraUltimaMensagem(conversa);


    const naoLida =
        conversa.naoLida === true;


    const ativo =
        conversa.id === conversaAtivaId;


    html += `

        <article
            class="conv-item ${naoLida ? "unread" : ""}"
            data-id="${escaparHTML(conversa.id)}"
            onclick="abrirChat('${escaparHTML(conversa.id)}')"
        >

            <div class="conv-avatar">
                ${escaparHTML(conversa.sigla)}
            </div>


            <div class="conv-info">

                <div class="conv-header-row">

                    <span class="conv-name">
                        ${escaparHTML(conversa.nome)}
                    </span>

                    <span class="conv-time">
                        ${escaparHTML(ultimaHora)}
                    </span>

                </div>


                <div class="conv-sub">

                    ${obterIconeMusica()}

                    <span>
                        ${escaparHTML(conversa.contexto)}
                    </span>

                </div>


                <p class="conv-last-msg">
                    ${escaparHTML(ultimaMensagem)}
                </p>

            </div>


            ${
                naoLida
                    ? `<span class="unread-dot"></span>`
                    : ""
            }

        </article>

    `;

});


if (!html) {

    html = `

        <div class="empty-state">

            <div class="empty-state-icon">

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 8.7 3.9a8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>

            </div>

            <strong>
                Nenhuma conversa encontrada
            </strong>

            <span>
                Tente outro termo ou categoria.
            </span>

        </div>

    `;

}


container.innerHTML = html;

}

/* =========================================================
ÚLTIMA MENSAGEM
========================================================= */

function obterUltimaMensagem(conversa) {

if (
    !conversa.mensagens ||
    conversa.mensagens.length === 0
) {

    return "Nenhuma mensagem";

}


return conversa
    .mensagens[
        conversa.mensagens.length - 1
    ]
    .texto;

}

/* =========================================================
HORÁRIO DA ÚLTIMA MENSAGEM
========================================================= */

function obterHoraUltimaMensagem(conversa) {

if (
    !conversa.mensagens ||
    conversa.mensagens.length === 0
) {

    return "";

}


return conversa
    .mensagens[
        conversa.mensagens.length - 1
    ]
    .hora;

}

/* =========================================================
ABRIR CHAT
========================================================= */

function abrirChat(id) {

const conversa =
    conversasDados[id];


if (!conversa) {
    return;
}


conversaAtivaId = id;


preencherCabecalhoChat(conversa);

renderizarMensagens(conversa);


const modal =
    document.getElementById("chat-modal");


if (!modal) {
    return;
}


modal.classList.add("ativo");

modal.setAttribute(
    "aria-hidden",
    "false"
);


conversa.naoLida = false;


renderizarListaConversas();


setTimeout(() => {

    const input =
        document.getElementById("msg-input");


    if (input) {

        input.focus();

    }

}, 250);

}

/* =========================================================
CABEÇALHO CHAT
========================================================= */

function preencherCabecalhoChat(conversa) {

const avatar =
    document.getElementById(
        "chat-active-avatar"
    );


const nome =
    document.getElementById(
        "chat-active-name"
    );


const contexto =
    document.getElementById(
        "chat-active-context"
    );


const status =
    document.getElementById(
        "chat-online-status"
    );


if (avatar) {

    avatar.textContent =
        conversa.sigla;

}


if (nome) {

    nome.textContent =
        conversa.nome;

}


if (contexto) {

    contexto.textContent =
        conversa.contexto;

}


if (status) {

    status.textContent =
        conversa.status;

    status.style.color =
        conversa.status === "Online"
            ? "#16a34a"
            : "#94a3b8";

}

}

/* =========================================================
RENDERIZAR MENSAGENS
========================================================= */

function renderizarMensagens(conversa) {

const container =
    document.getElementById("chat-body");


if (!container) {
    return;
}


let html = `

    <div class="chat-date-divider">

        <span>Hoje</span>

    </div>

`;


conversa.mensagens.forEach(mensagem => {

    const classe =
        mensagem.remetente === "eu"
            ? "sent"
            : "received";


    html += `

        <div class="msg ${classe}">

            <span class="msg-text">
                ${escaparHTML(mensagem.texto)}
            </span>

            <span class="msg-time">
                ${escaparHTML(mensagem.hora)}
            </span>

        </div>

    `;

});


container.innerHTML = html;


rolarChatParaBaixo();

}

/* =========================================================
ROLAR CHAT
========================================================= */

function rolarChatParaBaixo() {

const container =
    document.getElementById("chat-body");


if (!container) {
    return;
}


setTimeout(() => {

    container.scrollTop =
        container.scrollHeight;

}, 50);

}

/* =========================================================
FECHAR CHAT
========================================================= */

function fecharChat() {

const modal =
    document.getElementById("chat-modal");


if (!modal) {
    return;
}


modal.classList.remove("ativo");

modal.setAttribute(
    "aria-hidden",
    "true"
);

}

/* =========================================================
ENVIAR MENSAGEM
========================================================= */

function enviarMensagem() {

if (!conversaAtivaId) {
    return;
}


const input =
    document.getElementById("msg-input");


if (!input) {
    return;
}


const texto =
    input.value.trim();


if (!texto) {
    return;
}


const conversa =
    conversasDados[
        conversaAtivaId
    ];


if (!conversa) {
    return;
}


const agora =
    new Date();


const hora =
    agora.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );


conversa.mensagens.push({

    remetente: "eu",

    texto: texto,

    hora: hora

});


input.value = "";


renderizarMensagens(conversa);

renderizarListaConversas();


salvarConversasLocalmente();

}

/* =========================================================
ENTER
========================================================= */

function verificarEnter(event) {

if (
    event.key === "Enter" &&
    !event.shiftKey
) {

    event.preventDefault();

    enviarMensagem();

}

}

/* =========================================================
BUSCA
========================================================= */

function configurarBusca() {

const input =
    document.getElementById(
        "searchInput"
    );


const botaoLimpar =
    document.getElementById(
        "clearSearch"
    );


if (!input) {
    return;
}


input.addEventListener(
    "input",
    () => {

        termoBusca =
            input.value.trim();


        if (botaoLimpar) {

            botaoLimpar.classList.toggle(
                "visivel",
                termoBusca.length > 0
            );

        }


        renderizarListaConversas();

    }
);

}

function limparBusca() {

const input =
    document.getElementById(
        "searchInput"
    );


const botaoLimpar =
    document.getElementById(
        "clearSearch"
    );


if (input) {

    input.value = "";

}


termoBusca = "";


if (botaoLimpar) {

    botaoLimpar.classList.remove(
        "visivel"
    );

}


renderizarListaConversas();

}

/* =========================================================
NOVA MENSAGEM
========================================================= */

function novaMensagem() {

const primeiroId =
    Object.keys(conversasDados)[0];


if (primeiroId) {

    abrirChat(primeiroId);

}

}

/* =========================================================
ANEXO
========================================================= */

function anexarArquivo() {

alert(
    "O envio de arquivos será conectado ao armazenamento do MusicalWorld."
);

}

/* =========================================================
OPÇÕES DO CHAT
========================================================= */

function abrirOpcoesChat() {

alert(
    "As opções da conversa serão adicionadas nesta área."
);

}

/* =========================================================
NAVEGAÇÃO
========================================================= */

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

function irParaInicio() {

window.location.href =
    "index.html";

}

function irParaMensagens() {

window.location.href =
    "mensagens.html";

}

function irParaAnunciar() {

window.location.href =
    "anunciar.html";

}

function irParaPerfil() {

window.location.href =
    "perfil.html";

}

/* =========================================================
ABRIR CONVERSA VINDO DO DETALHES-ANUNCIO
========================================================= */

function abrirConversaRecebida() {

if (!artistaIdURL) {
    return;
}


let idConversa =
    artistaIdURL;


/*
 * Se ainda não existir uma conversa
 * com esse artista, criamos uma
 * conversa inicial.
 */

if (!conversasDados[idConversa]) {

    const nome =
        artistaURL ||
        "Artista";


    const servico =
        servicoURL ||
        "Serviço";


    const preco =
        precoURL
            ? `R$ ${Number(precoURL).toLocaleString("pt-BR")}`
            : "";


    conversasDados[idConversa] = {

        id: idConversa,

        nome: nome,

        sigla:
            gerarSigla(nome),

        contexto:
            preco
                ? `${servico} • ${preco}`
                : servico,

        status: "Online",

        categoriaFiltro: "contratado",

        mensagens: [

            {
                remetente: "outro",

                texto:
                    `Olá! Recebi seu interesse em contratar ${servico}. Vamos combinar os detalhes?`,

                hora:
                    obterHoraAtual()

            }

        ]

    };

} else {

    /*
     * Atualiza o contexto caso a página
     * tenha vindo de um serviço específico.
     */

    if (servicoURL) {

        const preco =
            precoURL
                ? ` • R$ ${Number(precoURL).toLocaleString("pt-BR")}`
                : "";


        conversasDados[idConversa].contexto =
            `${servicoURL}${preco}`;

    }

}


abrirChat(idConversa);

}

/* =========================================================
GERAR SIGLA
========================================================= */

function gerarSigla(nome) {

const palavras =
    nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);


if (palavras.length === 1) {

    return palavras[0]
        .substring(0, 2)
        .toUpperCase();

}


return (
    palavras[0][0] +
    palavras[palavras.length - 1][0]
).toUpperCase();

}

/* =========================================================
HORA ATUAL
========================================================= */

function obterHoraAtual() {

return new Date().toLocaleTimeString(
    "pt-BR",
    {
        hour: "2-digit",
        minute: "2-digit"
    }
);

}

/* =========================================================
LOCAL STORAGE
========================================================= */

function salvarConversasLocalmente() {

try {

    localStorage.setItem(
        "musicalworld_conversas",
        JSON.stringify(conversasDados)
    );

} catch (erro) {

    console.warn(
        "Não foi possível salvar as conversas.",
        erro
    );

}

}

function carregarConversasLocalmente() {

try {

    const dados =
        localStorage.getItem(
            "musicalworld_conversas"
        );


    if (!dados) {
        return;
    }


    const conversasSalvas =
        JSON.parse(dados);


    Object.keys(conversasSalvas)
        .forEach(id => {

            conversasDados[id] =
                conversasSalvas[id];

        });

} catch (erro) {

    console.warn(
        "Não foi possível carregar as conversas.",
        erro
    );

}

}

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

    carregarConversasLocalmente();

    configurarBusca();

    renderizarListaConversas();


    /*
     * Se chegou aqui através de:
     *
     * detalhes-anuncio.html?id=rafael-melo
     * &artista=Rafael%20Melo
     * &servico=Voz%20e%20violão
     * &preco=800
     *
     * o chat correspondente é aberto automaticamente.
     */

    if (artistaIdURL) {

        abrirConversaRecebida();

    }

}

);

/* =========================================================
EVENTO ENTER NO INPUT
========================================================= */

document.addEventListener(
"keydown",
event => {

    const input =
        document.getElementById(
            "msg-input"
        );


    if (
        input &&
        document.activeElement === input &&
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        enviarMensagem();

    }

}

);