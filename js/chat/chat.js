(function (window) {

"use strict";

/* =========================================================
   MUSICALWORLD — CHAT
   Arquivo: js/chat/chat.js

   Responsabilidade:

   - Identificar a conversa pela URL
   - Validar o usuário autenticado
   - Carregar participantes
   - Carregar mensagens
   - Renderizar mensagens de texto
   - Renderizar imagens
   - Renderizar vídeos
   - Renderizar documentos
   - Selecionar arquivos
   - Validar arquivos
   - Criar pré-visualização
   - Enviar arquivos para o Supabase Storage
   - Registrar anexos na tabela mensagens
   - Gerar URLs assinadas para arquivos privados
   - Enviar mensagens de texto
   - Marcar mensagens recebidas como lidas
   - Atualizar updated_at da conversa
   - Escutar novas mensagens via Realtime
   - Controlar o campo de texto
   - Voltar para mensagens.html

   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const CONFIG = {

    /*
     * Bucket privado utilizado exclusivamente
     * pelos anexos das conversas.
     *
     * IMPORTANTE:
     * Este nome precisa ser exatamente igual
     * ao bucket existente no Supabase Storage.
     */
    bucketAnexos: "chat-arquivos",

    /*
     * Tempo de validade das URLs assinadas.
     *
     * 1 hora.
     */
    validadeUrlAssinada:
        60 * 60,

    /*
     * Limite para imagens e documentos:
     *
     * 25 MB
     */
    tamanhoMaximoArquivo:
        25 * 1024 * 1024,

    /*
     * Limite para vídeos:
     *
     * 100 MB
     */
    tamanhoMaximoVideo:
        100 * 1024 * 1024,

    /*
     * Tipos MIME permitidos.
     */
    tiposPermitidos: {

        imagem: [

            "image/jpeg",
            "image/png",
            "image/webp"

        ],

        video: [

            "video/mp4",
            "video/webm",
            "video/quicktime"

        ],

        arquivo: [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

            "application/vnd.ms-excel",

            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            "application/vnd.ms-powerpoint",

            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

            "text/plain"

        ]

    },

    /*
     * Extensões explicitamente bloqueadas.
     *
     * Mesmo que o navegador informe um MIME
     * incorreto, esses formatos nunca serão aceitos.
     */
    extensoesBloqueadas: [

        "exe",
        "msi",
        "bat",
        "cmd",
        "com",
        "scr",
        "pif",
        "vbs",
        "vbe",
        "js",
        "jse",
        "ws",
        "wsf",
        "wsc",
        "wsh",
        "ps1",
        "psm1",
        "sh",
        "bash",
        "apk",
        "ipa",
        "app",
        "dmg",
        "pkg",
        "deb",
        "rpm",
        "jar",
        "class",
        "html",
        "htm",
        "svg",
        "php",
        "asp",
        "aspx",
        "jsp",
        "dll",
        "sys",
        "iso"

    ]

};


/* =========================================================
   ESTADO
   ========================================================= */

const estado = {

    conversaId: null,

    usuarioAtualId: null,

    outroUsuarioId: null,

    conversa: null,

    usuarioAtual: null,

    outroUsuario: null,

    mensagens: [],

    canalRealtime: null,

    carregando: false,

    enviando: false,

    inicializado: false,

    arquivoSelecionado: null,

    arquivoPreviewUrl: null,

    enviandoArquivo: false

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

let elementos = {};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);


async function iniciar() {

    if (estado.inicializado) {
        return;
    }

    estado.inicializado = true;

    console.log("=========================================");
    console.log("MUSICALWORLD — CHAT");
    console.log("Inicializando conversa...");
    console.log("=========================================");

    try {

        capturarElementos();

        inicializarIcones();

        configurarEventosInput();

        configurarEventoArquivo();

        const conversaId =
            obterConversaIdURL();

        if (!conversaId) {

            mostrarErro(
                "Não foi possível identificar esta conversa."
            );

            return;

        }

        estado.conversaId =
            conversaId;

        const autenticado =
            await carregarUsuarioAtual();

        if (!autenticado) {
            return;
        }

        const conversaCarregada =
            await carregarConversa();

        if (!conversaCarregada) {
            return;
        }

        await carregarMensagens();

        await marcarMensagensComoLidas();

        configurarRealtime();

        rolarParaFinal(false);

        console.log(
            "Chat inicializado:",
            estado.conversaId
        );

    } catch (erro) {

        console.error(
            "Chat: erro durante inicialização:",
            erro
        );

        mostrarErro(
            "Não foi possível carregar esta conversa."
        );

    }

}


/* =========================================================
   ELEMENTOS DOM
   ========================================================= */

function capturarElementos() {

    elementos = {

        messages:
            document.getElementById(
                "chatMessages"
            ),

        loading:
            document.getElementById(
                "chatLoading"
            ),

        userAvatar:
            document.getElementById(
                "chatUserAvatar"
            ),

        userAvatarFallback:
            document.getElementById(
                "chatUserAvatarFallback"
            ),

        userInitials:
            document.getElementById(
                "chatUserInitials"
            ),

        userName:
            document.getElementById(
                "chatUserName"
            ),

        userContext:
            document.getElementById(
                "chatUserContext"
            ),

        input:
            document.getElementById(
                "chatMessageInput"
            ),

        sendButton:
            document.getElementById(
                "chatSendButton"
            ),

        attachmentButton:
            document.querySelector(
                ".chat-attachment-button"
            ),

        fileInput:
            document.getElementById(
                "chatFileInput"
            ),

        attachmentPreview:
            document.getElementById(
                "chatAttachmentPreview"
            ),

        attachmentPreviewIcon:
            document.getElementById(
                "chatAttachmentPreviewIcon"
            ),

        attachmentPreviewName:
            document.getElementById(
                "chatAttachmentPreviewName"
            ),

        attachmentPreviewSize:
            document.getElementById(
                "chatAttachmentPreviewSize"
            ),

        attachmentPreviewStatus:
            document.getElementById(
                "chatAttachmentPreviewStatus"
            ),

        attachmentImagePreview:
            document.getElementById(
                "chatAttachmentImagePreview"
            ),

        attachmentImage:
            document.getElementById(
                "chatAttachmentImage"
            ),

        attachmentVideoPreview:
            document.getElementById(
                "chatAttachmentVideoPreview"
            ),

        attachmentVideo:
            document.getElementById(
                "chatAttachmentVideo"
            ),

        attachmentRemove:
            document.getElementById(
                "chatAttachmentRemove"
            )

    };

}


/* =========================================================
   ÍCONES
   ========================================================= */

function inicializarIcones() {

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }

}


/* =========================================================
   URL
   ========================================================= */

function obterConversaIdURL() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const id =
        parametros.get("id");

    if (!id) {
        return null;
    }

    return id.trim();

}


/* =========================================================
   SUPABASE
   ========================================================= */

function obterSupabase() {

    if (
        !window.supabaseClient ||
        typeof window.supabaseClient.from !== "function"
    ) {

        console.error(
            "Chat: supabaseClient não encontrado."
        );

        mostrarErro(
            "Não foi possível conectar ao sistema."
        );

        return null;

    }

    return window.supabaseClient;

}


/* =========================================================
   USUÁRIO AUTENTICADO
   ========================================================= */

async function carregarUsuarioAtual() {

    if (
        !window.Sessao ||
        typeof window.Sessao.usuarioAtual !== "function"
    ) {

        console.error(
            "Chat: Sessao.js não está disponível."
        );

        mostrarErro(
            "Sistema de sessão não disponível."
        );

        return false;

    }

    const usuarioAuth =
        await window.Sessao.usuarioAtual();

    if (!usuarioAuth) {

        mostrarErro(
            "Você precisa estar conectado para acessar esta conversa."
        );

        return false;

    }

    estado.usuarioAtualId =
        usuarioAuth.id;

    console.log(
        "Chat: usuário autenticado:",
        estado.usuarioAtualId
    );

    const supabase =
        obterSupabase();

    if (!supabase) {
        return false;
    }

    const {
        data,
        error
    } = await supabase
        .from("usuarios")
        .select("*")
        .eq(
            "id",
            usuarioAuth.id
        )
        .maybeSingle();

    if (error) {

        console.error(
            "Chat: erro ao carregar usuário:",
            error
        );

        return false;

    }

    estado.usuarioAtual =
        data || {

            id:
                usuarioAuth.id,

            email:
                usuarioAuth.email || ""

        };

    return true;

}


/* =========================================================
   CARREGAR CONVERSA
   ========================================================= */

async function carregarConversa() {

    const supabase =
        obterSupabase();

    if (!supabase) {
        return false;
    }

    const {
        data,
        error
    } = await supabase
        .from("conversas")
        .select("*")
        .eq(
            "id",
            estado.conversaId
        )
        .maybeSingle();

    if (error) {

        console.error(
            "Chat: erro ao carregar conversa:",
            error
        );

        mostrarErro(
            "Não foi possível carregar esta conversa."
        );

        return false;

    }

    if (!data) {

        mostrarErro(
            "Conversa não encontrada ou você não tem acesso a ela."
        );

        return false;

    }

    estado.conversa =
        data;

    const participa =
        data.contratante_id ===
            estado.usuarioAtualId ||

        data.contratado_id ===
            estado.usuarioAtualId;

    if (!participa) {

        console.error(
            "Chat: usuário não participa desta conversa."
        );

        mostrarErro(
            "Você não participa desta conversa."
        );

        return false;

    }

    if (
        data.contratante_id ===
        estado.usuarioAtualId
    ) {

        estado.outroUsuarioId =
            data.contratado_id;

    } else {

        estado.outroUsuarioId =
            data.contratante_id;

    }

    await carregarOutroUsuario();

    return true;

}


/* =========================================================
   CARREGAR OUTRO USUÁRIO
   ========================================================= */

async function carregarOutroUsuario() {

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    const {
        data,
        error
    } = await supabase
        .from("usuarios")
        .select("*")
        .eq(
            "id",
            estado.outroUsuarioId
        )
        .maybeSingle();

    if (error) {

        console.error(
            "Chat: erro ao carregar outro usuário:",
            error
        );

        return;

    }

    estado.outroUsuario =
        data;

    renderizarCabecalho();

}


/* =========================================================
   CABEÇALHO
   ========================================================= */

function renderizarCabecalho() {

    const usuario =
        estado.outroUsuario;

    if (!usuario) {
        return;
    }

    const nome =
        usuario.nome ||
        usuario.email ||
        "Usuário";

    elementos.userName.textContent =
        nome;

    elementos.userInitials.textContent =
        obterIniciais(nome);

    const foto =
        usuario.foto_url ||
        usuario.avatar_url ||
        usuario.foto ||
        "";

    const wrapper =
        elementos.userAvatar
            ?.closest(
                ".chat-user-avatar-wrapper"
            );

    if (foto) {

        elementos.userAvatar.src =
            foto;

        elementos.userAvatar.onload =
            function () {

                wrapper?.classList.add(
                    "has-image"
                );

            };

        elementos.userAvatar.onerror =
            function () {

                wrapper?.classList.remove(
                    "has-image"
                );

            };

    } else {

        wrapper?.classList.remove(
            "has-image"
        );

    }

    elementos.userContext.textContent =
        obterContextoConversa();

}


/* =========================================================
   CONTEXTO
   ========================================================= */

function obterContextoConversa() {

    if (!estado.conversa) {
        return "Conversa";
    }

    if (estado.conversa.servico_id) {
        return "Serviço";
    }

    if (estado.conversa.contratacao_id) {
        return "Contratação";
    }

    return "Conversa";

}


/* =========================================================
   CARREGAR MENSAGENS
   ========================================================= */

async function carregarMensagens() {

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    estado.carregando =
        true;

    const {
        data,
        error
    } = await supabase
        .from("mensagens")
        .select("*")
        .eq(
            "conversa_id",
            estado.conversaId
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );

    estado.carregando =
        false;

    if (error) {

        console.error(
            "Chat: erro ao carregar mensagens:",
            error
        );

        mostrarErro(
            "Não foi possível carregar as mensagens."
        );

        return;

    }

    estado.mensagens =
        Array.isArray(data)
            ? data
            : [];

    await renderizarMensagens();

}


/* =========================================================
   RENDERIZAR MENSAGENS
   ========================================================= */

async function renderizarMensagens() {

    const container =
        elementos.messages;

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    if (!estado.mensagens.length) {

        renderizarEstadoVazio();

        return;

    }

    let ultimaData =
        null;

    for (
        const mensagem
        of estado.mensagens
    ) {

        const dataMensagem =
            obterDataMensagem(
                mensagem.created_at
            );

        const chaveData =
            obterChaveData(
                dataMensagem
            );

        if (
            chaveData !==
            ultimaData
        ) {

            container.appendChild(
                criarSeparadorData(
                    dataMensagem
                )
            );

            ultimaData =
                chaveData;

        }

        const elementoMensagem =
            await criarElementoMensagem(
                mensagem
            );

        if (elementoMensagem) {

            container.appendChild(
                elementoMensagem
            );

        }

    }

    inicializarIcones();

}


/* =========================================================
   ESTADO VAZIO
   ========================================================= */

function renderizarEstadoVazio() {

    const estadoVazio =
        document.createElement(
            "div"
        );

    estadoVazio.className =
        "chat-state";

    const texto =
        document.createElement(
            "p"
        );

    texto.textContent =
        "Esta conversa ainda não possui mensagens.";

    estadoVazio.appendChild(
        texto
    );

    elementos.messages.appendChild(
        estadoVazio
    );

}


/* =========================================================
   CRIAR ELEMENTO DE MENSAGEM
   ========================================================= */

async function criarElementoMensagem(
    mensagem
) {

    const enviada =
        mensagem.remetente_id ===
        estado.usuarioAtualId;

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        enviada
            ? "chat-message chat-message--sent"
            : "chat-message chat-message--received";

    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "chat-message-bubble";

    const tipo =
        mensagem.tipo ||
        "texto";

    if (tipo === "imagem") {

        await criarConteudoImagem(
            bubble,
            mensagem
        );

    } else if (tipo === "video") {

        await criarConteudoVideo(
            bubble,
            mensagem
        );

    } else if (tipo === "arquivo") {

        await criarConteudoArquivo(
            bubble,
            mensagem
        );

    } else {

        const texto =
            document.createElement(
                "div"
            );

        texto.className =
            "chat-message-text";

        texto.textContent =
            mensagem.conteudo || "";

        bubble.appendChild(
            texto
        );

    }

    /*
     * Caso exista um texto associado ao anexo,
     * mostramos abaixo do conteúdo.
     *
     * Para as mensagens automáticas atuais
     * ("Imagem enviada", "Vídeo enviado",
     * "Arquivo enviado"), não exibimos esse
     * texto novamente.
     */

    const textoAnexo =
        mensagem.conteudo || "";

    const textoAutomatico = [

        "Imagem enviada",
        "Vídeo enviado",
        "Arquivo enviado"

    ];

    if (
        (
            tipo === "imagem" ||
            tipo === "video" ||
            tipo === "arquivo"
        ) &&
        textoAnexo &&
        !textoAutomatico.includes(
            textoAnexo
        )
    ) {

        const legenda =
            document.createElement(
                "div"
            );

        legenda.className =
            "chat-message-text chat-message-attachment-caption";

        legenda.textContent =
            textoAnexo;

        bubble.appendChild(
            legenda
        );

    }

    const meta =
        document.createElement(
            "div"
        );

    meta.className =
        "chat-message-meta";

    const hora =
        document.createElement(
            "span"
        );

    hora.className =
        "chat-message-time";

    hora.textContent =
        formatarHora(
            mensagem.created_at
        );

    meta.appendChild(
        hora
    );

    if (enviada) {

        const status =
            document.createElement(
                "span"
            );

        status.className =
            "chat-message-status";

        status.innerHTML =
            mensagem.lida
                ? `<i data-lucide="check-check"></i>`
                : `<i data-lucide="check"></i>`;

        meta.appendChild(
            status
        );

    }

    bubble.appendChild(
        meta
    );

    wrapper.appendChild(
        bubble
    );

    return wrapper;

}


/* =========================================================
   IMAGEM
   ========================================================= */

async function criarConteudoImagem(
    bubble,
    mensagem
) {

    const imagem =
        document.createElement(
            "img"
        );

    imagem.className =
        "chat-media-image";

    imagem.alt =
        mensagem.arquivo_nome ||
        "Imagem enviada";

    imagem.loading =
        "lazy";

    imagem.style.opacity =
        "0.5";

    imagem.src =
        "";

    bubble.appendChild(
        imagem
    );

    const url =
        await obterURLAnexo(
            mensagem
        );

    if (!url) {

        imagem.alt =
            "Imagem indisponível";

        imagem.style.opacity =
            "0.5";

        return;

    }

    imagem.src =
        url;

    imagem.style.opacity =
        "1";

    imagem.addEventListener(
        "click",
        function () {

            abrirAnexo(
                mensagem,
                url
            );

        }
    );

}


/* =========================================================
   VÍDEO
   ========================================================= */

async function criarConteudoVideo(
    bubble,
    mensagem
) {

    const video =
        document.createElement(
            "video"
        );

    video.className =
        "chat-media-video";

    video.controls =
        true;

    video.preload =
        "metadata";

    video.playsInline =
        true;

    video.setAttribute(
        "controlsList",
        "nodownload"
    );

    bubble.appendChild(
        video
    );

    const url =
        await obterURLAnexo(
            mensagem
        );

    if (!url) {

        const erro =
            document.createElement(
                "div"
            );

        erro.className =
            "chat-attachment-error";

        erro.textContent =
            "Não foi possível carregar este vídeo.";

        bubble.insertBefore(
            erro,
            video
        );

        video.remove();

        return;

    }

    video.src =
        url;

}


/* =========================================================
   ARQUIVO
   ========================================================= */

async function criarConteudoArquivo(
    bubble,
    mensagem
) {

    const link =
        document.createElement(
            "a"
        );

    link.className =
        "chat-file-card";

    link.href =
        "#";

    link.setAttribute(
        "aria-label",
        `Abrir ${mensagem.arquivo_nome || "arquivo"}`
    );

    const icone =
        document.createElement(
            "div"
        );

    icone.className =
        "chat-file-icon";

    icone.innerHTML =
        `<i data-lucide="${obterIconeArquivo(
            mensagem.arquivo_nome
        )}"></i>`;

    const informacoes =
        document.createElement(
            "div"
        );

    informacoes.className =
        "chat-file-info";

    const nome =
        document.createElement(
            "strong"
        );

    nome.textContent =
        mensagem.arquivo_nome ||
        "Arquivo";

    const tamanho =
        document.createElement(
            "span"
        );

    tamanho.textContent =
        formatarTamanhoArquivo(
            mensagem.arquivo_tamanho
        );

    informacoes.appendChild(
        nome
    );

    informacoes.appendChild(
        tamanho
    );

    const abrir =
        document.createElement(
            "div"
        );

    abrir.className =
        "chat-file-open";

    abrir.innerHTML =
        `<i data-lucide="external-link"></i>`;

    link.appendChild(
        icone
    );

    link.appendChild(
        informacoes
    );

    link.appendChild(
        abrir
    );

    link.addEventListener(
        "click",
        async function (evento) {

            evento.preventDefault();

            const url =
                await obterURLAnexo(
                    mensagem
                );

            if (!url) {

                mostrarErroTemporario(
                    "Não foi possível abrir este arquivo."
                );

                return;

            }

            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );

    bubble.appendChild(
        link
    );

    inicializarIcones();

}


/* =========================================================
   URL PRIVADA DO ANEXO
   =========================================================

   O bucket chat-arquivos é privado.

   Portanto NÃO usamos getPublicUrl().

   Criamos uma URL assinada temporária,
   permitindo que somente usuários autorizados
   consigam visualizar o arquivo.

   ========================================================= */

async function obterURLAnexo(
    mensagem
) {

    if (
        mensagem.arquivo_url
    ) {

        return mensagem.arquivo_url;

    }

    if (
        !mensagem.arquivo_path
    ) {

        return "";

    }

    const supabase =
        obterSupabase();

    if (!supabase) {
        return "";
    }

    try {

        const {
            data,
            error
        } = await supabase
            .storage
            .from(
                CONFIG.bucketAnexos
            )
            .createSignedUrl(
                mensagem.arquivo_path,
                CONFIG.validadeUrlAssinada
            );

        if (error) {

            console.error(
                "Chat: erro ao gerar URL assinada:",
                error
            );

            return "";

        }

        return data?.signedUrl || "";

    } catch (erro) {

        console.error(
            "Chat: erro ao obter URL do anexo:",
            erro
        );

        return "";

    }

}


/* =========================================================
   ABRIR ANEXO
   ========================================================= */

async function abrirAnexo(
    mensagem,
    urlExistente = null
) {

    const url =
        urlExistente ||
        await obterURLAnexo(
            mensagem
        );

    if (!url) {

        mostrarErroTemporario(
            "Não foi possível abrir este arquivo."
        );

        return;

    }

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   SEPARADOR DE DATA
   ========================================================= */

function criarSeparadorData(
    data
) {

    const elemento =
        document.createElement(
            "div"
        );

    elemento.className =
        "chat-date-divider";

    const span =
        document.createElement(
            "span"
        );

    span.textContent =
        formatarDataCompleta(
            data
        );

    elemento.appendChild(
        span
    );

    return elemento;

}


/* =========================================================
   ENVIAR MENSAGEM
   ========================================================= */

async function enviarMensagem() {

    if (
        estado.enviando ||
        estado.enviandoArquivo
    ) {
        return;
    }

    /*
     * Se existe arquivo selecionado,
     * o botão envia o anexo.
     */
    if (
        estado.arquivoSelecionado
    ) {

        await enviarAnexo();

        return;

    }

    const input =
        elementos.input;

    if (!input) {
        return;
    }

    const conteudo =
        input.value.trim();

    if (!conteudo) {
        return;
    }

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    estado.enviando =
        true;

    definirEstadoEnvio(
        true
    );

    try {

        const {
            data,
            error
        } = await supabase
            .from("mensagens")
            .insert({

                conversa_id:
                    estado.conversaId,

                remetente_id:
                    estado.usuarioAtualId,

                conteudo:
                    conteudo,

                tipo:
                    "texto",

                lida:
                    false

            })
            .select()
            .single();

        if (error) {

            console.error(
                "Chat: erro ao enviar mensagem:",
                error
            );

            mostrarErroTemporario(
                "Não foi possível enviar a mensagem."
            );

            return;

        }

        input.value =
            "";

        ajustarAlturaInput();

        adicionarMensagemLocal(
            data
        );

        await atualizarConversa();

        rolarParaFinal(
            true
        );

    } finally {

        estado.enviando =
            false;

        definirEstadoEnvio(
            false
        );

    }

}


/* =========================================================
   CONFIGURAR INPUT DE ARQUIVO
   ========================================================= */

function configurarEventoArquivo() {

    const input =
        elementos.fileInput;

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        async function () {

            const arquivo =
                input.files?.[0];

            if (!arquivo) {
                return;
            }

            await selecionarArquivo(
                arquivo
            );

        }
    );

}


/* =========================================================
   ABRIR SELETOR
   ========================================================= */

function anexarArquivo() {

    if (
        estado.enviando ||
        estado.enviandoArquivo
    ) {
        return;
    }

    if (!elementos.fileInput) {
        return;
    }

    elementos.fileInput.value =
        "";

    elementos.fileInput.click();

}


/* =========================================================
   SELECIONAR ARQUIVO
   ========================================================= */

async function selecionarArquivo(
    arquivo
) {

    const validacao =
        validarArquivo(
            arquivo
        );

    if (!validacao.valido) {

        mostrarErroTemporario(
            validacao.mensagem
        );

        if (elementos.fileInput) {

            elementos.fileInput.value =
                "";

        }

        return;

    }

    limparPreviewArquivo();

    estado.arquivoSelecionado =
        arquivo;

    criarPreviewArquivo(
        arquivo
    );

    console.log(
        "Chat: arquivo selecionado:",
        arquivo.name,
        arquivo.type,
        arquivo.size
    );

}


/* =========================================================
   VALIDAR ARQUIVO
   ========================================================= */

function validarArquivo(
    arquivo
) {

    if (!arquivo) {

        return {

            valido: false,

            mensagem:
                "Nenhum arquivo foi selecionado."

        };

    }

    const nome =
        arquivo.name || "";

    const extensao =
        obterExtensao(
            nome
        );

    if (
        CONFIG.extensoesBloqueadas
            .includes(
                extensao
            )
    ) {

        return {

            valido: false,

            mensagem:
                "Este tipo de arquivo não é permitido por segurança."

        };

    }

    const mime =
        (
            arquivo.type ||
            ""
        ).toLowerCase();

    const tipo =
        identificarTipoArquivo(
            mime,
            extensao
        );

    if (!tipo) {

        return {

            valido: false,

            mensagem:
                "Este formato de arquivo não é permitido."

        };

    }

    const limite =
        tipo === "video"
            ? CONFIG.tamanhoMaximoVideo
            : CONFIG.tamanhoMaximoArquivo;

    if (
        arquivo.size >
        limite
    ) {

        return {

            valido: false,

            mensagem:
                tipo === "video"
                    ? "O vídeo não pode ultrapassar 100 MB."
                    : "O arquivo não pode ultrapassar 25 MB."

        };

    }

    if (
        arquivo.size <= 0
    ) {

        return {

            valido: false,

            mensagem:
                "O arquivo selecionado está vazio."

        };

    }

    return {

        valido: true,

        tipo

    };

}


/* =========================================================
   IDENTIFICAR TIPO
   ========================================================= */

function identificarTipoArquivo(
    mime,
    extensao
) {

    const tipos =
        CONFIG.tiposPermitidos;

    if (
        tipos.imagem.includes(
            mime
        )
    ) {

        return "imagem";

    }

    if (
        tipos.video.includes(
            mime
        )
    ) {

        return "video";

    }

    if (
        tipos.arquivo.includes(
            mime
        )
    ) {

        return "arquivo";

    }

    /*
     * Alguns navegadores podem informar
     * MIME vazio.
     *
     * Para formatos conhecidos,
     * usamos a extensão como fallback.
     */

    const extensoesImagem = [

        "jpg",
        "jpeg",
        "png",
        "webp"

    ];

    const extensoesVideo = [

        "mp4",
        "webm",
        "mov"

    ];

    const extensoesArquivo = [

        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt"

    ];

    if (
        extensoesImagem.includes(
            extensao
        )
    ) {

        return "imagem";

    }

    if (
        extensoesVideo.includes(
            extensao
        )
    ) {

        return "video";

    }

    if (
        extensoesArquivo.includes(
            extensao
        )
    ) {

        return "arquivo";

    }

    return null;

}


/* =========================================================
   CRIAR PREVIEW
   ========================================================= */

function criarPreviewArquivo(
    arquivo
) {

    if (
        !elementos.attachmentPreview
    ) {
        return;
    }

    const validacao =
        validarArquivo(
            arquivo
        );

    if (!validacao.valido) {
        return;
    }

    const tipo =
        validacao.tipo;

    if (
        elementos.attachmentPreviewName
    ) {

        elementos.attachmentPreviewName.textContent =
            arquivo.name;

    }

    if (
        elementos.attachmentPreviewSize
    ) {

        elementos.attachmentPreviewSize.textContent =
            formatarTamanhoArquivo(
                arquivo.size
            );

    }

    if (
        elementos.attachmentPreviewStatus
    ) {

        elementos.attachmentPreviewStatus.textContent =
            "Pronto para enviar";

    }

    elementos.attachmentPreview.hidden =
        false;

    if (
        elementos.attachmentImagePreview
    ) {

        elementos.attachmentImagePreview.hidden =
            true;

    }

    if (
        elementos.attachmentVideoPreview
    ) {

        elementos.attachmentVideoPreview.hidden =
            true;

    }

    if (estado.arquivoPreviewUrl) {

        URL.revokeObjectURL(
            estado.arquivoPreviewUrl
        );

        estado.arquivoPreviewUrl =
            null;

    }

    if (
        tipo === "imagem" &&
        elementos.attachmentImage
    ) {

        estado.arquivoPreviewUrl =
            URL.createObjectURL(
                arquivo
            );

        elementos.attachmentImage.src =
            estado.arquivoPreviewUrl;

        if (
            elementos.attachmentImagePreview
        ) {

            elementos.attachmentImagePreview.hidden =
                false;

        }

        definirIconePreview(
            "image"
        );

    } else if (
        tipo === "video" &&
        elementos.attachmentVideo
    ) {

        estado.arquivoPreviewUrl =
            URL.createObjectURL(
                arquivo
            );

        elementos.attachmentVideo.src =
            estado.arquivoPreviewUrl;

        if (
            elementos.attachmentVideoPreview
        ) {

            elementos.attachmentVideoPreview.hidden =
                false;

        }

        definirIconePreview(
            "video"
        );

    } else {

        definirIconePreview(
            obterIconeArquivo(
                arquivo.name
            )
        );

    }

    inicializarIcones();

}


/* =========================================================
   ÍCONE DO PREVIEW
   ========================================================= */

function definirIconePreview(
    icone
) {

    if (
        !elementos.attachmentPreviewIcon
    ) {
        return;
    }

    elementos.attachmentPreviewIcon.innerHTML =
        `<i data-lucide="${icone}"></i>`;

    inicializarIcones();

}


/* =========================================================
   ÍCONE DO ARQUIVO
   ========================================================= */

function obterIconeArquivo(
    nome
) {

    const extensao =
        obterExtensao(
            nome
        );

    switch (extensao) {

        case "pdf":

            return "file-text";

        case "doc":
        case "docx":

            return "file-text";

        case "xls":
        case "xlsx":

            return "table-2";

        case "ppt":
        case "pptx":

            return "presentation";

        case "txt":

            return "file-text";

        default:

            return "file";

    }

}


/* =========================================================
   REMOVER ANEXO
   ========================================================= */

function removerAnexoSelecionado() {

    limparPreviewArquivo();

}


/* =========================================================
   LIMPAR PREVIEW
   ========================================================= */

function limparPreviewArquivo() {

    estado.arquivoSelecionado =
        null;

    if (estado.arquivoPreviewUrl) {

        URL.revokeObjectURL(
            estado.arquivoPreviewUrl
        );

        estado.arquivoPreviewUrl =
            null;

    }

    if (
        elementos.attachmentPreview
    ) {

        elementos.attachmentPreview.hidden =
            true;

    }

    if (
        elementos.attachmentImage
    ) {

        elementos.attachmentImage.src =
            "";

    }

    if (
        elementos.attachmentVideo
    ) {

        elementos.attachmentVideo.pause();

        elementos.attachmentVideo.removeAttribute(
            "src"
        );

        elementos.attachmentVideo.load();

    }

    if (
        elementos.fileInput
    ) {

        elementos.fileInput.value =
            "";

    }

}


/* =========================================================
   ENVIAR ANEXO
   ========================================================= */

async function enviarAnexo() {

    if (
        estado.enviandoArquivo ||
        !estado.arquivoSelecionado
    ) {
        return;
    }

    const arquivo =
        estado.arquivoSelecionado;

    const validacao =
        validarArquivo(
            arquivo
        );

    if (!validacao.valido) {

        mostrarErroTemporario(
            validacao.mensagem
        );

        limparPreviewArquivo();

        return;

    }

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    estado.enviandoArquivo =
        true;

    definirEstadoEnvio(
        true
    );

    if (
        elementos.attachmentPreviewStatus
    ) {

        elementos.attachmentPreviewStatus.textContent =
            "Enviando arquivo...";

    }

    let caminho =
        null;

    try {

        const extensao =
            obterExtensao(
                arquivo.name
            );

        const nomeSeguro =
            criarNomeArquivoSeguro(
                arquivo.name
            );

        caminho =
            [

                estado.conversaId,

                estado.usuarioAtualId,

                `${Date.now()}-${nomeSeguro}`

            ].join("/");

        const mime =
            arquivo.type ||
            obterMimePorExtensao(
                extensao
            );

        console.log(
            "Chat: iniciando upload:",
            caminho
        );

        /*
         * Upload para o bucket privado.
         */
        const {
            error: erroUpload
        } = await supabase
            .storage
            .from(
                CONFIG.bucketAnexos
            )
            .upload(
                caminho,
                arquivo,
                {

                    cacheControl:
                        "3600",

                    contentType:
                        mime,

                    upsert:
                        false

                }
            );

        if (erroUpload) {

            console.error(
                "Chat: erro no upload:",
                erroUpload
            );

            throw new Error(
                "Não foi possível enviar o arquivo."
            );

        }

        if (
            elementos.attachmentPreviewStatus
        ) {

            elementos.attachmentPreviewStatus.textContent =
                "Registrando mensagem...";

        }

        /*
         * IMPORTANTE:
         *
         * A coluna correta do banco é
         * arquivo_mime.
         *
         * Não usamos arquivo_tipo.
         */
        const {
            data,
            error
        } = await supabase
            .from("mensagens")
            .insert({

                conversa_id:
                    estado.conversaId,

                remetente_id:
                    estado.usuarioAtualId,

                conteudo:
                    obterTextoAnexo(
                        arquivo,
                        validacao.tipo
                    ),

                tipo:
                    validacao.tipo,

                lida:
                    false,

                arquivo_nome:
                    arquivo.name,

                arquivo_path:
                    caminho,

                arquivo_mime:
                    mime,

                arquivo_tamanho:
                    arquivo.size

            })
            .select()
            .single();

        if (error) {

            console.error(
                "Chat: erro ao registrar anexo:",
                error
            );

            /*
             * Se o registro da mensagem falhar,
             * removemos o arquivo do Storage para
             * evitar arquivos órfãos.
             */
            try {

                await supabase
                    .storage
                    .from(
                        CONFIG.bucketAnexos
                    )
                    .remove([
                        caminho
                    ]);

            } catch (erroRemocao) {

                console.warn(
                    "Chat: não foi possível remover o arquivo órfão:",
                    erroRemocao
                );

            }

            throw new Error(
                "Não foi possível registrar o arquivo."
            );

        }

        adicionarMensagemLocal(
            data
        );

        await atualizarConversa();

        limparPreviewArquivo();

        rolarParaFinal(
            true
        );

    } catch (erro) {

        console.error(
            "Chat: erro ao enviar anexo:",
            erro
        );

        if (
            elementos.attachmentPreviewStatus
        ) {

            elementos.attachmentPreviewStatus.textContent =
                "Não foi possível enviar.";

        }

        mostrarErroTemporario(
            erro.message ||
            "Não foi possível enviar o arquivo."
        );

    } finally {

        estado.enviandoArquivo =
            false;

        definirEstadoEnvio(
            false
        );

    }

}


/* =========================================================
   TEXTO DO ANEXO
   ========================================================= */

function obterTextoAnexo(
    arquivo,
    tipo
) {

    if (tipo === "imagem") {

        return "Imagem enviada";

    }

    if (tipo === "video") {

        return "Vídeo enviado";

    }

    return "Arquivo enviado";

}


/* =========================================================
   NOME SEGURO
   ========================================================= */

function criarNomeArquivoSeguro(
    nome
) {

    const original =
        String(
            nome || ""
        );

    let semAcentos =
        original;

    try {

        semAcentos =
            original
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

    } catch (erro) {

        console.warn(
            "Chat: não foi possível normalizar nome do arquivo:",
            erro
        );

    }

    const seguro =
        semAcentos
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            )
            .replace(
                /_+/g,
                "_"
            );

    return (
        seguro ||
        "arquivo"
    ).substring(
        0,
        180
    );

}


/* =========================================================
   MIME POR EXTENSÃO
   ========================================================= */

function obterMimePorExtensao(
    extensao
) {

    const mapa = {

        jpg:
            "image/jpeg",

        jpeg:
            "image/jpeg",

        png:
            "image/png",

        webp:
            "image/webp",

        mp4:
            "video/mp4",

        webm:
            "video/webm",

        mov:
            "video/quicktime",

        pdf:
            "application/pdf",

        doc:
            "application/msword",

        docx:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        xls:
            "application/vnd.ms-excel",

        xlsx:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        ppt:
            "application/vnd.ms-powerpoint",

        pptx:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

        txt:
            "text/plain"

    };

    return (
        mapa[
            extensao
        ] ||
        "application/octet-stream"
    );

}


/* =========================================================
   ADICIONAR LOCALMENTE
   ========================================================= */

function adicionarMensagemLocal(
    mensagem
) {

    if (!mensagem) {
        return;
    }

    const jaExiste =
        estado.mensagens.some(
            item =>
                item.id ===
                mensagem.id
        );

    if (jaExiste) {
        return;
    }

    estado.mensagens.push(
        mensagem
    );

    estado.mensagens.sort(
        (
            a,
            b
        ) =>
            new Date(
                a.created_at
            ) -
            new Date(
                b.created_at
            )
    );

    renderizarMensagens();

}


/* =========================================================
   ATUALIZAR CONVERSA
   ========================================================= */

async function atualizarConversa() {

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    const {
        error
    } = await supabase
        .from("conversas")
        .update({

            updated_at:
                new Date().toISOString()

        })
        .eq(
            "id",
            estado.conversaId
        );

    if (error) {

        console.warn(
            "Chat: não foi possível atualizar updated_at:",
            error
        );

    }

}


/* =========================================================
   MARCAR TODAS COMO LIDAS
   ========================================================= */

async function marcarMensagensComoLidas() {

    if (!estado.outroUsuarioId) {
        return;
    }

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    const {
        error
    } = await supabase
        .from("mensagens")
        .update({

            lida:
                true

        })
        .eq(
            "conversa_id",
            estado.conversaId
        )
        .eq(
            "remetente_id",
            estado.outroUsuarioId
        )
        .eq(
            "lida",
            false
        );

    if (error) {

        console.warn(
            "Chat: erro ao marcar mensagens como lidas:",
            error
        );

    }

    estado.mensagens =
        estado.mensagens.map(
            mensagem => {

                if (
                    mensagem.remetente_id ===
                    estado.outroUsuarioId
                ) {

                    return {

                        ...mensagem,

                        lida:
                            true

                    };

                }

                return mensagem;

            }
        );

    await renderizarMensagens();

}


/* =========================================================
   REALTIME
   ========================================================= */

function configurarRealtime() {

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    if (estado.canalRealtime) {
        return;
    }

    console.log(
        "Chat: configurando Realtime..."
    );

    estado.canalRealtime =
        supabase
            .channel(
                `chat-${estado.conversaId}`
            )

            .on(
                "postgres_changes",
                {

                    event:
                        "INSERT",

                    schema:
                        "public",

                    table:
                        "mensagens",

                    filter:
                        `conversa_id=eq.${estado.conversaId}`

                },

                async payload => {

                    console.log(
                        "Chat Realtime: nova mensagem:",
                        payload.new
                    );

                    const mensagem =
                        payload.new;

                    const jaExiste =
                        estado.mensagens.some(
                            item =>
                                item.id ===
                                mensagem.id
                        );

                    if (jaExiste) {
                        return;
                    }

                    estado.mensagens.push(
                        mensagem
                    );

                    estado.mensagens.sort(
                        (
                            a,
                            b
                        ) =>
                            new Date(
                                a.created_at
                            ) -
                            new Date(
                                b.created_at
                            )
                    );

                    await renderizarMensagens();

                    if (
                        mensagem.remetente_id !==
                        estado.usuarioAtualId
                    ) {

                        await marcarMensagemComoLida(
                            mensagem.id
                        );

                    }

                    rolarParaFinal(
                        true
                    );

                }

            )

            .on(
                "postgres_changes",
                {

                    event:
                        "UPDATE",

                    schema:
                        "public",

                    table:
                        "mensagens",

                    filter:
                        `conversa_id=eq.${estado.conversaId}`

                },

                async payload => {

                    const atualizada =
                        payload.new;

                    const indice =
                        estado.mensagens.findIndex(
                            mensagem =>
                                mensagem.id ===
                                atualizada.id
                        );

                    if (indice === -1) {
                        return;
                    }

                    estado.mensagens[
                        indice
                    ] =
                        atualizada;

                    await renderizarMensagens();

                }

            )

            .subscribe(
                status => {

                    console.log(
                        "Chat Realtime:",
                        status
                    );

                }
            );

}


/* =========================================================
   MARCAR UMA MENSAGEM COMO LIDA
   ========================================================= */

async function marcarMensagemComoLida(
    mensagemId
) {

    const supabase =
        obterSupabase();

    if (!supabase) {
        return;
    }

    const {
        error
    } = await supabase
        .from("mensagens")
        .update({

            lida:
                true

        })
        .eq(
            "id",
            mensagemId
        )
        .eq(
            "remetente_id",
            estado.outroUsuarioId
        );

    if (error) {

        console.warn(
            "Chat: erro ao marcar mensagem como lida:",
            error
        );

        return;

    }

    const mensagem =
        estado.mensagens.find(
            item =>
                item.id ===
                mensagemId
        );

    if (mensagem) {

        mensagem.lida =
            true;

    }

    await renderizarMensagens();

}


/* =========================================================
   ESTADO DO ENVIO
   ========================================================= */

function definirEstadoEnvio(
    ativo
) {

    if (elementos.sendButton) {

        elementos.sendButton.disabled =
            ativo;

    }

    if (elementos.attachmentButton) {

        elementos.attachmentButton.disabled =
            ativo;

    }

    if (
        elementos.sendButton
    ) {

        elementos.sendButton.innerHTML =
            ativo
                ? `<i data-lucide="loader-circle"></i>`
                : `<i data-lucide="send"></i>`;

        if (ativo) {

            elementos.sendButton
                .classList.add(
                    "is-loading"
                );

        } else {

            elementos.sendButton
                .classList.remove(
                    "is-loading"
                );

        }

        inicializarIcones();

    }

}


/* =========================================================
   INPUT
   ========================================================= */

function configurarEventosInput() {

    const input =
        elementos.input;

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        ajustarAlturaInput
    );

    input.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                    "Enter" &&
                !evento.shiftKey
            ) {

                evento.preventDefault();

                enviarMensagem();

            }

        }
    );

}


/* =========================================================
   ALTURA DO TEXTAREA
   ========================================================= */

function ajustarAlturaInput() {

    const input =
        elementos.input;

    if (!input) {
        return;
    }

    input.style.height =
        "auto";

    const altura =
        Math.min(
            input.scrollHeight,
            140
        );

    input.style.height =
        `${altura}px`;

}


/* =========================================================
   ROLAGEM
   ========================================================= */

function rolarParaFinal(
    suave = true
) {

    const container =
        elementos.messages;

    if (!container) {
        return;
    }

    requestAnimationFrame(
        () => {

            container.scrollTo({

                top:
                    container.scrollHeight,

                behavior:
                    suave
                        ? "smooth"
                        : "auto"

            });

        }
    );

}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function voltarMensagens() {

    if (
        estado.canalRealtime &&
        window.supabaseClient
    ) {

        try {

            window.supabaseClient
                .removeChannel(
                    estado.canalRealtime
                );

        } catch (erro) {

            console.warn(
                "Chat: erro ao remover canal Realtime:",
                erro
            );

        }

    }

    window.location.href =
        "mensagens.html";

}


/* =========================================================
   OPÇÕES
   ========================================================= */

function abrirOpcoesChat() {

    console.log(
        "Chat: menu de opções solicitado."
    );

}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function obterIniciais(
    nome
) {

    if (!nome) {
        return "?";
    }

    const partes =
        nome
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!partes.length) {
        return "?";
    }

    if (partes.length === 1) {

        return partes[0]
            .substring(
                0,
                2
            )
            .toUpperCase();

    }

    return (

        partes[0][0] +

        partes[
            partes.length - 1
        ][0]

    ).toUpperCase();

}


function obterExtensao(
    nome
) {

    const partes =
        String(
            nome || ""
        )
            .toLowerCase()
            .split(".");

    if (
        partes.length < 2
    ) {

        return "";

    }

    return partes.pop();

}


function obterDataMensagem(
    data
) {

    const resultado =
        new Date(data);

    if (
        Number.isNaN(
            resultado.getTime()
        )
    ) {

        return new Date();

    }

    return resultado;

}


function obterChaveData(
    data
) {

    return [

        data.getFullYear(),

        data.getMonth(),

        data.getDate()

    ].join("-");

}


function formatarHora(
    data
) {

    const valor =
        obterDataMensagem(
            data
        );

    return valor.toLocaleTimeString(
        "pt-BR",
        {

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


function formatarDataCompleta(
    data
) {

    const agora =
        new Date();

    const hoje =
        new Date(

            agora.getFullYear(),

            agora.getMonth(),

            agora.getDate()

        );

    const ontem =
        new Date(
            hoje
        );

    ontem.setDate(
        ontem.getDate() - 1
    );

    const dataSemHora =
        new Date(

            data.getFullYear(),

            data.getMonth(),

            data.getDate()

        );

    if (
        dataSemHora.getTime() ===
        hoje.getTime()
    ) {

        return "Hoje";

    }

    if (
        dataSemHora.getTime() ===
        ontem.getTime()
    ) {

        return "Ontem";

    }

    return data.toLocaleDateString(
        "pt-BR",
        {

            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric"

        }
    );

}


function formatarTamanhoArquivo(
    tamanho
) {

    const bytes =
        Number(
            tamanho || 0
        );

    if (bytes <= 0) {

        return "Tamanho desconhecido";

    }

    const unidades = [

        "B",
        "KB",
        "MB",
        "GB"

    ];

    const indice =
        Math.min(

            Math.floor(

                Math.log(bytes) /
                Math.log(1024)

            ),

            unidades.length - 1

        );

    const valor =
        bytes /
        Math.pow(
            1024,
            indice
        );

    return `${valor.toFixed(
        indice === 0
            ? 0
            : 1
    )} ${unidades[indice]}`;

}


/* =========================================================
   ERROS
   ========================================================= */

function mostrarErro(
    mensagem
) {

    const container =
        elementos.messages;

    if (!container) {
        return;
    }

    container.innerHTML =
        "";

    const estadoErro =
        document.createElement(
            "div"
        );

    estadoErro.className =
        "chat-state";

    const texto =
        document.createElement(
            "p"
        );

    texto.textContent =
        mensagem;

    estadoErro.appendChild(
        texto
    );

    container.appendChild(
        estadoErro
    );

}


function mostrarErroTemporario(
    mensagem
) {

    console.error(
        "Chat:",
        mensagem
    );

    /*
     * Mantemos o sistema sem toast
     * neste momento.
     *
     * O erro fica disponível no console
     * para diagnóstico.
     */

}


/* =========================================================
   LIMPEZA
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        if (
            estado.arquivoPreviewUrl
        ) {

            URL.revokeObjectURL(
                estado.arquivoPreviewUrl
            );

        }

        if (
            estado.canalRealtime &&
            window.supabaseClient
        ) {

            try {

                window.supabaseClient
                    .removeChannel(
                        estado.canalRealtime
                    );

            } catch (erro) {

                console.warn(
                    "Chat: erro ao limpar Realtime:",
                    erro
                );

            }

        }

    }
);


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.voltarMensagens =
    voltarMensagens;

window.enviarMensagem =
    enviarMensagem;

window.anexarArquivo =
    anexarArquivo;

window.abrirOpcoesChat =
    abrirOpcoesChat;

window.removerAnexoSelecionado =
    removerAnexoSelecionado;


/* =========================================================
   FINAL
   ========================================================= */

})(window);