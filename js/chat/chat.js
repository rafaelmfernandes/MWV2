(function (window) {


"use strict";

/* =========================================================
   MUSICALWORLD — CHAT
   Arquivo: js/Chat/chat.js

   Responsabilidade:

   - Identificar a conversa pela URL
   - Validar o usuário autenticado
   - Carregar os participantes
   - Carregar as mensagens
   - Renderizar mensagens
   - Enviar novas mensagens
   - Marcar mensagens recebidas como lidas
   - Atualizar updated_at da conversa
   - Escutar novas mensagens via Realtime
   - Controlar o campo de texto
   - Voltar para mensagens.html

   URL esperada:

   chat.html?id=UUID_DA_CONVERSA
   ========================================================= */


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

    inicializado: false
};


/* =========================================================
   ELEMENTOS
   ========================================================= */

let elementos = {};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", iniciar);


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

        const conversaId = obterConversaIdURL();

        if (!conversaId) {

            mostrarErro(
                "Não foi possível identificar esta conversa."
            );

            return;
        }

        estado.conversaId = conversaId;

        const autenticado = await carregarUsuarioAtual();

        if (!autenticado) {
            return;
        }

        const conversaCarregada = await carregarConversa();

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
        messages: document.getElementById("chatMessages"),

        loading: document.getElementById("chatLoading"),

        userAvatar: document.getElementById("chatUserAvatar"),

        userAvatarFallback:
            document.getElementById("chatUserAvatarFallback"),

        userInitials:
            document.getElementById("chatUserInitials"),

        userName:
            document.getElementById("chatUserName"),

        userContext:
            document.getElementById("chatUserContext"),

        input:
            document.getElementById("chatMessageInput"),

        sendButton:
            document.getElementById("chatSendButton"),

        fileInput:
            document.getElementById("chatFileInput")
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

    const parametros = new URLSearchParams(
        window.location.search
    );

    const id = parametros.get("id");

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

    estado.usuarioAtualId = usuarioAuth.id;

    console.log(
        "Chat: usuário autenticado:",
        estado.usuarioAtualId
    );

    const supabase = obterSupabase();

    if (!supabase) {
        return false;
    }

    const {
        data,
        error
    } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", usuarioAuth.id)
        .maybeSingle();

    if (error) {

        console.error(
            "Chat: erro ao carregar usuário:",
            error
        );

        return false;
    }

    estado.usuarioAtual = data || {
        id: usuarioAuth.id,
        email: usuarioAuth.email || ""
    };

    return true;
}


/* =========================================================
   CARREGAR CONVERSA
   ========================================================= */

async function carregarConversa() {

    const supabase = obterSupabase();

    if (!supabase) {
        return false;
    }

    const {
        data,
        error
    } = await supabase
        .from("conversas")
        .select("*")
        .eq("id", estado.conversaId)
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

    estado.conversa = data;

    const participa =
        data.contratante_id === estado.usuarioAtualId ||
        data.contratado_id === estado.usuarioAtualId;

    if (!participa) {

        console.error(
            "Chat: usuário não participa desta conversa."
        );

        mostrarErro(
            "Você não participa desta conversa."
        );

        return false;
    }

    if (data.contratante_id === estado.usuarioAtualId) {

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

    const supabase = obterSupabase();

    if (!supabase) {
        return;
    }

    const {
        data,
        error
    } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", estado.outroUsuarioId)
        .maybeSingle();

    if (error) {

        console.error(
            "Chat: erro ao carregar outro usuário:",
            error
        );

        return;
    }

    estado.outroUsuario = data;

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

    elementos.userName.textContent = nome;

    elementos.userInitials.textContent =
        obterIniciais(nome);

    const foto =
        usuario.foto_url ||
        usuario.avatar_url ||
        usuario.foto ||
        "";

    if (foto) {

        elementos.userAvatar.src = foto;

        elementos.userAvatar.onload = function () {

            elementos.userAvatar
                .closest(".chat-user-avatar-wrapper")
                ?.classList.add("has-image");

        };

        elementos.userAvatar.onerror = function () {

            elementos.userAvatar
                .closest(".chat-user-avatar-wrapper")
                ?.classList.remove("has-image");

        };

    } else {

        elementos.userAvatar
            .closest(".chat-user-avatar-wrapper")
            ?.classList.remove("has-image");
    }

    const contexto =
        obterContextoConversa();

    elementos.userContext.textContent =
        contexto;
}


/* =========================================================
   CONTEXTO DA CONVERSA
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
   MENSAGENS
   ========================================================= */

async function carregarMensagens() {

    const supabase = obterSupabase();

    if (!supabase) {
        return;
    }

    estado.carregando = true;

    const {
        data,
        error
    } = await supabase
        .from("mensagens")
        .select("*")
        .eq("conversa_id", estado.conversaId)
        .order("created_at", {
            ascending: true
        });

    estado.carregando = false;

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

    renderizarMensagens();
}


/* =========================================================
   RENDERIZAÇÃO DAS MENSAGENS
   ========================================================= */

function renderizarMensagens() {

    const container =
        elementos.messages;

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!estado.mensagens.length) {

        renderizarEstadoVazio();

        return;
    }

    let ultimaData = null;

    estado.mensagens.forEach(mensagem => {

        const dataMensagem =
            obterDataMensagem(mensagem.created_at);

        const chaveData =
            obterChaveData(dataMensagem);

        if (chaveData !== ultimaData) {

            container.appendChild(
                criarSeparadorData(dataMensagem)
            );

            ultimaData = chaveData;
        }

        container.appendChild(
            criarElementoMensagem(mensagem)
        );
    });

    inicializarIcones();
}


/* =========================================================
   ESTADO VAZIO
   ========================================================= */

function renderizarEstadoVazio() {

    const estadoVazio =
        document.createElement("div");

    estadoVazio.className =
        "chat-state";

    estadoVazio.innerHTML = `
        <p>Esta conversa ainda não possui mensagens.</p>
    `;

    elementos.messages.appendChild(
        estadoVazio
    );
}


/* =========================================================
   CRIAR MENSAGEM
   ========================================================= */

function criarElementoMensagem(mensagem) {

    const enviada =
        mensagem.remetente_id ===
        estado.usuarioAtualId;

    const wrapper =
        document.createElement("div");

    wrapper.className =
        enviada
            ? "chat-message chat-message--sent"
            : "chat-message chat-message--received";

    const bubble =
        document.createElement("div");

    bubble.className =
        "chat-message-bubble";

    const texto =
        document.createElement("div");

    texto.className =
        "chat-message-text";

    texto.textContent =
        mensagem.conteudo || "";

    const meta =
        document.createElement("div");

    meta.className =
        "chat-message-meta";

    const hora =
        document.createElement("span");

    hora.className =
        "chat-message-time";

    hora.textContent =
        formatarHora(mensagem.created_at);

    meta.appendChild(hora);

    if (enviada) {

        const status =
            document.createElement("span");

        status.className =
            "chat-message-status";

        status.innerHTML =
            mensagem.lida
                ? `
                    <i data-lucide="check-check"></i>
                `
                : `
                    <i data-lucide="check"></i>
                `;

        meta.appendChild(status);
    }

    bubble.appendChild(texto);
    bubble.appendChild(meta);

    wrapper.appendChild(bubble);

    return wrapper;
}


/* =========================================================
   SEPARADOR DE DATA
   ========================================================= */

function criarSeparadorData(data) {

    const elemento =
        document.createElement("div");

    elemento.className =
        "chat-date-divider";

    const span =
        document.createElement("span");

    span.textContent =
        formatarDataCompleta(data);

    elemento.appendChild(span);

    return elemento;
}


/* =========================================================
   ENVIAR MENSAGEM
   ========================================================= */

async function enviarMensagem() {

    if (estado.enviando) {
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

    estado.enviando = true;

    if (elementos.sendButton) {
        elementos.sendButton.disabled = true;
    }

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

        input.value = "";

        ajustarAlturaInput();

        adicionarMensagemLocal(data);

        await atualizarConversa();

        rolarParaFinal(true);

    } finally {

        estado.enviando = false;

        if (elementos.sendButton) {
            elementos.sendButton.disabled = false;
        }
    }
}


/* =========================================================
   ADICIONAR MENSAGEM LOCALMENTE
   ========================================================= */

function adicionarMensagemLocal(mensagem) {

    if (!mensagem) {
        return;
    }

    const jaExiste =
        estado.mensagens.some(
            item => item.id === mensagem.id
        );

    if (jaExiste) {
        return;
    }

    estado.mensagens.push(mensagem);

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
        .eq("id", estado.conversaId);

    if (error) {

        console.warn(
            "Chat: não foi possível atualizar updated_at:",
            error
        );
    }
}


/* =========================================================
   MARCAR COMO LIDAS
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
            lida: true
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
        estado.mensagens.map(mensagem => {

            if (
                mensagem.remetente_id ===
                estado.outroUsuarioId
            ) {
                return {
                    ...mensagem,
                    lida: true
                };
            }

            return mensagem;
        });

    renderizarMensagens();
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
                    event: "INSERT",
                    schema: "public",
                    table: "mensagens",
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

                    renderizarMensagens();

                    if (
                        mensagem.remetente_id !==
                        estado.usuarioAtualId
                    ) {

                        await marcarMensagemComoLida(
                            mensagem.id
                        );
                    }

                    rolarParaFinal(true);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "mensagens",
                    filter:
                        `conversa_id=eq.${estado.conversaId}`
                },
                payload => {

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

                    estado.mensagens[indice] =
                        atualizada;

                    renderizarMensagens();
                }
            )
            .subscribe(status => {

                console.log(
                    "Chat Realtime:",
                    status
                );
            });
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
            lida: true
        })
        .eq("id", mensagemId)
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
            item => item.id === mensagemId
        );

    if (mensagem) {
        mensagem.lida = true;
    }

    renderizarMensagens();
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
                evento.key === "Enter" &&
                !evento.shiftKey
            ) {

                evento.preventDefault();

                enviarMensagem();
            }
        }
    );
}


/* =========================================================
   ALTURA AUTOMÁTICA DO TEXTAREA
   ========================================================= */

function ajustarAlturaInput() {

    const input =
        elementos.input;

    if (!input) {
        return;
    }

    input.style.height = "auto";

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

function rolarParaFinal(suave = true) {

    const container =
        elementos.messages;

    if (!container) {
        return;
    }

    requestAnimationFrame(() => {

        container.scrollTo({
            top:
                container.scrollHeight,

            behavior:
                suave
                    ? "smooth"
                    : "auto"
        });
    });
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
            window.supabaseClient.removeChannel(
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
   ANEXOS
   ========================================================= */

function anexarArquivo() {

    if (!elementos.fileInput) {
        return;
    }

    elementos.fileInput.click();
}


/* =========================================================
   OPÇÕES
   ========================================================= */

function abrirOpcoesChat() {

    /*
     * O menu de opções ficará preparado para futuras
     * funcionalidades, como:
     *
     * - visualizar perfil
     * - silenciar conversa
     * - bloquear usuário
     * - denunciar
     * - apagar conversa
     *
     * Por enquanto não alteramos nenhuma informação.
     */

    console.log(
        "Chat: menu de opções solicitado."
    );
}


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function obterIniciais(nome) {

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
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();
}


function obterDataMensagem(data) {

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


function obterChaveData(data) {

    return [
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    ].join("-");
}


function formatarHora(data) {

    const valor =
        obterDataMensagem(data);

    return valor.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatarDataCompleta(data) {

    const agora =
        new Date();

    const hoje =
        new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate()
        );

    const ontem =
        new Date(hoje);

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
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================================
   ERROS
   ========================================================= */

function mostrarErro(mensagem) {

    const container =
        elementos.messages;

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const estadoErro =
        document.createElement("div");

    estadoErro.className =
        "chat-state";

    const texto =
        document.createElement("p");

    texto.textContent =
        mensagem;

    estadoErro.appendChild(texto);

    container.appendChild(
        estadoErro
    );
}


function mostrarErroTemporario(mensagem) {

    console.error(
        "Chat:",
        mensagem
    );

    /*
     * Mantemos o erro no console por enquanto.
     * Depois podemos integrar o mesmo sistema de
     * toast utilizado pelo restante do MusicalWorld.
     */
}


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


})(window);
