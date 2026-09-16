(function (window) {


"use strict";


/* =========================================================
   MUSICALWORLD — AÇÕES DO PERFIL PÚBLICO

   Arquivo:
   ApresentarPerfilAcoes.js

   Responsabilidade:

   - Voltar para a página anterior
   - Compartilhar o perfil
   - Copiar o link do perfil
   - Abrir contato via WhatsApp
   - Iniciar conversa interna do MusicalWorld
   - Iniciar contratação do perfil
   - Exibir mensagens/toasts
   - Controlar as ações dos botões do perfil público

   Este módulo utiliza o estado fornecido pelo
   ApresentarPerfil.js.


   FLUXO DE MENSAGEM:

   perfil público
          ↓
   usuário clica em "Mensagem"
          ↓
   identifica usuário logado
          ↓
   identifica dono do perfil
          ↓
   verifica conversa existente
          ↓
      ┌───────────────┐
      │ existe?       │
      └───────┬───────┘
              │
       SIM    │    NÃO
        ↓     │     ↓
     localizar│   criar
     conversa │   conversa
        ↓     │     ↓
        └─────┴──────┘
              ↓
      chat.html?id=...
              ↓
         abre o Chat


   IMPORTANTE:

   - Este módulo consulta o Supabase apenas para
     localizar/criar a conversa.
   - As mensagens são carregadas pelo chat.js.
   - A lista de conversas é responsabilidade de
     mensagens.js.
   - ApresentarPerfilUtils.js continua sem regras
     específicas do Supabase.
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    elementos: {

        voltar: "btnVoltar",

        compartilhar: "btnCompartilhar",

        /*
         * Botão principal de mensagem.
         *
         * O HTML atual utiliza btnMandarMensagem.
         *
         * Mantemos btnContato como fallback para
         * compatibilidade com versões anteriores.
         */
        contato: "btnMandarMensagem",

        contatoFallback: "btnContato",

        contratar: "btnContratar",

        toast: "toast"

    },


    /*
     * Página da conversa individual.
     *
     * A lista de conversas permanece em
     * mensagens.html.
     */
    paginaChat: "chat.html",


    /*
     * Página da caixa de entrada.
     *
     * Utilizada pelo Chat quando o usuário
     * clicar no botão voltar.
     */
    paginaMensagens: "mensagens.html",


    /*
     * O MusicalWorld utiliza um único fluxo
     * de contratação para todos os tipos
     * de perfil artístico.
     */
    paginaContratacao: "contratacao.html"

};


/* =========================================================
   ESTADO INTERNO
   ========================================================= */

let estadoAtual = null;

let eventosConfigurados = false;

let eventoDelegadoConfigurado = false;

let abrindoConversa = false;


/* =========================================================
   OBTENÇÃO DE ELEMENTOS
   ========================================================= */

function obterElemento(id) {

    if (!id) {

        return null;

    }


    return document.getElementById(id);

}


/* =========================================================
   NORMALIZAÇÃO DE TEXTO
   ========================================================= */

function normalizarTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor).trim();

}


/* =========================================================
   NORMALIZAÇÃO DE TIPO DE PERFIL
   ========================================================= */

function normalizarTipo(tipo) {

    return normalizarTexto(tipo)

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /[^a-z0-9]+/g,
            "_"
        )

        .replace(
            /^_+|_+$/g,
            ""
        );

}


/* =========================================================
   OBTENÇÃO DOS DADOS DO ESTADO
   ========================================================= */

function obterUsuario() {

    return (

        estadoAtual &&
        estadoAtual.dados &&
        estadoAtual.dados.usuario

    )

        ? estadoAtual.dados.usuario

        : {};

}


function obterPerfil() {

    return (

        estadoAtual &&
        estadoAtual.dados &&
        estadoAtual.dados.perfil

    )

        ? estadoAtual.dados.perfil

        : {};

}


function obterPerfilArtista() {

    return (

        estadoAtual &&
        estadoAtual.dados &&
        estadoAtual.dados.perfilArtista

    )

        ? estadoAtual.dados.perfilArtista

        : {};

}


/* =========================================================
   OBTENÇÃO DO ID DO USUÁRIO DO PERFIL

   O perfil público normalmente possui:

   perfis.usuario_id

   e o usuário correspondente fica em:

   usuarios.id

   Este é o ID que realmente precisamos para
   criar/localizar a conversa.

   Ordem de prioridade:

   1. usuario.id
   2. perfil.usuario_id
   3. perfilArtista.usuario_id
   4. perfil.user_id
   5. perfilArtista.user_id
   ========================================================= */

function obterUsuarioIdPerfil() {

    const usuario =
        obterUsuario();


    const perfil =
        obterPerfil();


    const perfilArtista =
        obterPerfilArtista();


    const candidatos = [

        usuario.id,

        perfil.usuario_id,

        perfilArtista.usuario_id,

        perfil.user_id,

        perfilArtista.user_id

    ];


    for (const candidato of candidatos) {

        const valor =
            normalizarTexto(
                candidato
            );


        if (valor) {

            return valor;

        }

    }


    return "";

}


/* =========================================================
   OBTENÇÃO DO ID DO PERFIL

   Ordem de prioridade:

   1. estadoAtual.perfilId
   2. estadoAtual.dados.perfilId
   3. perfil.id
   4. perfilArtista.perfil_id
   5. parâmetro perfil_id da URL
   6. parâmetro perfilId da URL
   7. parâmetro id da URL

   O ID pode ser UUID do Supabase.

   Portanto NÃO convertemos o valor para Number.
   ========================================================= */

function obterPerfilId() {

    if (
        estadoAtual &&
        estadoAtual.perfilId
    ) {

        return normalizarTexto(
            estadoAtual.perfilId
        );

    }


    if (
        estadoAtual &&
        estadoAtual.dados &&
        estadoAtual.dados.perfilId
    ) {

        return normalizarTexto(
            estadoAtual.dados.perfilId
        );

    }


    const perfil =
        obterPerfil();


    const perfilArtista =
        obterPerfilArtista();


    if (perfil.id) {

        return normalizarTexto(
            perfil.id
        );

    }


    if (perfilArtista.perfil_id) {

        return normalizarTexto(
            perfilArtista.perfil_id
        );

    }


    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const perfilIdUrl =
            parametros.get("perfil_id") ||
            parametros.get("perfilId") ||
            parametros.get("id");


        if (perfilIdUrl) {

            return normalizarTexto(
                perfilIdUrl
            );

        }

    } catch (erro) {

        console.warn(
            "ApresentarPerfilAcoes: não foi possível ler os parâmetros da URL.",
            erro
        );

    }


    return "";

}


/* =========================================================
   OBTENÇÃO DO TIPO DE PERFIL
   ========================================================= */

function obterTipoPerfil() {

    if (
        estadoAtual &&
        estadoAtual.tipoPerfil
    ) {

        return normalizarTipo(
            estadoAtual.tipoPerfil
        );

    }


    if (
        estadoAtual &&
        estadoAtual.tipo
    ) {

        if (
            typeof estadoAtual.tipo === "object"
        ) {

            return normalizarTipo(

                estadoAtual.tipo.nome ||
                estadoAtual.tipo.tipo ||
                estadoAtual.tipo.slug ||
                ""

            );

        }


        return normalizarTipo(
            estadoAtual.tipo
        );

    }


    if (
        estadoAtual &&
        estadoAtual.tipoChave
    ) {

        return normalizarTipo(
            estadoAtual.tipoChave
        );

    }


    if (
        estadoAtual &&
        estadoAtual.tipoNome
    ) {

        return normalizarTipo(
            estadoAtual.tipoNome
        );

    }


    const perfil =
        obterPerfil();


    if (perfil.tipo_perfil) {

        if (
            typeof perfil.tipo_perfil === "object"
        ) {

            return normalizarTipo(

                perfil.tipo_perfil.nome ||
                perfil.tipo_perfil.tipo ||
                perfil.tipo_perfil.slug ||
                ""

            );

        }


        return normalizarTipo(
            perfil.tipo_perfil
        );

    }


    if (perfil.tipo) {

        if (
            typeof perfil.tipo === "object"
        ) {

            return normalizarTipo(

                perfil.tipo.nome ||
                perfil.tipo.tipo ||
                perfil.tipo.slug ||
                ""

            );

        }


        return normalizarTipo(
            perfil.tipo
        );

    }


    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const tipoUrl =
            parametros.get("tipo");


        if (tipoUrl) {

            return normalizarTipo(
                tipoUrl
            );

        }

    } catch (erro) {

        console.warn(
            "ApresentarPerfilAcoes: não foi possível obter o tipo da URL.",
            erro
        );

    }


    return "";

}


/* =========================================================
   NOME DO PERFIL
   ========================================================= */

function obterNomePerfil() {

    const usuario =
        obterUsuario();


    const perfil =
        obterPerfil();


    const perfilArtista =
        obterPerfilArtista();


    return normalizarTexto(

        perfilArtista.nome_artistico ||
        perfilArtista.nome_artistico_publico ||
        perfil.nome_artistico ||
        perfil.nome ||
        usuario.nome ||
        usuario.nome_completo ||
        "Perfil"

    );

}


/* =========================================================
   OBTENÇÃO DO TELEFONE
   ========================================================= */

function obterTelefone() {

    const usuario =
        obterUsuario();


    const perfil =
        obterPerfil();


    const perfilArtista =
        obterPerfilArtista();


    return normalizarTexto(

        perfilArtista.telefone ||
        perfilArtista.whatsapp ||
        perfilArtista.celular ||
        perfil.telefone ||
        perfil.whatsapp ||
        perfil.celular ||
        usuario.telefone ||
        usuario.whatsapp ||
        usuario.celular ||
        ""

    );

}


function normalizarTelefone(telefone) {

    return normalizarTexto(telefone)
        .replace(/\D/g, "");

}


/* =========================================================
   TOAST
   ========================================================= */

function mostrarToast(mensagem) {

    const toast =
        obterElemento(
            CONFIG.elementos.toast
        );


    if (!toast) {

        console.log(
            mensagem
        );

        return;

    }


    toast.textContent =
        mensagem;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(

            function () {

                toast.classList.remove(
                    "show"
                );

            },

            3000

        );

}


/* =========================================================
   VOLTAR

   O botão Voltar do perfil público sempre retorna
   para a página inicial do MusicalWorld.

   Não utilizamos window.history.back().
   ========================================================= */

function voltar() {

    console.log(
        "ApresentarPerfilAcoes: botão voltar acionado."
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   LINK DO PERFIL
   ========================================================= */

function obterLinkPerfil() {

    return window.location.href;

}


/* =========================================================
   COPIAR LINK
   ========================================================= */

async function copiarLink() {

    const link =
        obterLinkPerfil();


    try {

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {

            await navigator.clipboard.writeText(
                link
            );


            mostrarToast(
                "Link do perfil copiado."
            );


            return true;

        }

    } catch (erro) {

        console.warn(
            "Não foi possível usar a área de transferência:",
            erro
        );

    }


    try {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            link;


        textarea.style.position =
            "fixed";


        textarea.style.left =
            "-9999px";


        textarea.style.top =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const sucesso =
            document.execCommand(
                "copy"
            );


        textarea.remove();


        if (sucesso) {

            mostrarToast(
                "Link do perfil copiado."
            );


            return true;

        }

    } catch (erro) {

        console.error(
            "Erro ao copiar link:",
            erro
        );

    }


    mostrarToast(
        "Não foi possível copiar o link."
    );


    return false;

}


/* =========================================================
   COMPARTILHAR PERFIL
   ========================================================= */

async function compartilharPerfil() {

    const nome =
        obterNomePerfil();


    const link =
        obterLinkPerfil();


    if (navigator.share) {

        try {

            await navigator.share({

                title: nome,

                text:
                    "Confira o perfil de " +
                    nome +
                    " no MusicalWorld.",

                url: link

            });


            return true;

        } catch (erro) {

            if (
                erro &&
                erro.name === "AbortError"
            ) {

                return false;

            }


            console.warn(
                "Compartilhamento cancelado ou indisponível:",
                erro
            );

        }

    }


    return copiarLink();

}


/* =========================================================
   CONTATO VIA WHATSAPP

   Esta função continua separada da mensagem interna
   do MusicalWorld.

   O botão principal de mensagem utiliza agora
   abrirMensagens().
   ========================================================= */

function abrirContato() {

    const telefone =
        obterTelefone();


    if (!telefone) {

        mostrarToast(
            "Este perfil ainda não possui um contato disponível."
        );


        return false;

    }


    const numero =
        normalizarTelefone(
            telefone
        );


    if (!numero) {

        mostrarToast(
            "O número de contato deste perfil não é válido."
        );


        return false;

    }


    let numeroWhatsApp =
        numero;


    if (
        !numeroWhatsApp.startsWith("55")
    ) {

        numeroWhatsApp =
            "55" +
            numeroWhatsApp;

    }


    const mensagem =
        "Olá! Vi seu perfil no MusicalWorld e gostaria de conversar sobre um possível serviço.";


    const url =
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(
            mensagem
        );


    window.open(
        url,
        "_blank"
    );


    return true;

}


/* =========================================================
   OBTER CLIENTE SUPABASE
   ========================================================= */

function obterSupabase() {

    if (
        window.supabaseClient
    ) {

        return window.supabaseClient;

    }


    console.error(
        "ApresentarPerfilAcoes: supabaseClient não está disponível."
    );


    return null;

}


/* =========================================================
   OBTER USUÁRIO AUTENTICADO

   Utilizamos o Sessao.js já existente no projeto.

   Não criamos outra lógica de autenticação.
   ========================================================= */

async function obterUsuarioAutenticado() {

    if (
        window.Sessao &&
        typeof window.Sessao.usuarioAtual === "function"
    ) {

        return await window.Sessao.usuarioAtual();

    }


    const supabase =
        obterSupabase();


    if (!supabase) {

        return null;

    }


    const resultado =
        await supabase.auth.getUser();


    if (resultado.error) {

        console.error(
            "ApresentarPerfilAcoes: erro ao obter usuário autenticado:",
            resultado.error
        );


        return null;

    }


    return resultado.data?.user || null;

}


/* =========================================================
   LOCALIZAR CONVERSA EXISTENTE

   Procuramos nos dois sentidos:

   1. usuário logado → perfil visualizado
   2. perfil visualizado → usuário logado

   Isso evita criar duas conversas diferentes
   simplesmente porque a ordem dos participantes
   mudou.
   ========================================================= */

async function localizarConversa(
    usuarioAtualId,
    usuarioPerfilId
) {

    const supabase =
        obterSupabase();


    if (!supabase) {

        return null;

    }


    console.log(
        "ApresentarPerfilAcoes: procurando conversa entre:",
        {
            usuarioAtualId,
            usuarioPerfilId
        }
    );


    /*
     * --------------------------------------------------
     * PRIMEIRA POSSIBILIDADE
     *
     * usuário logado = contratante
     * perfil = contratado
     * --------------------------------------------------
     */

    const resultadoDireto =
        await supabase
            .from("conversas")
            .select(
                "id, contratante_id, contratado_id, contratacao_id, servico_id, created_at, updated_at"
            )
            .eq(
                "contratante_id",
                usuarioAtualId
            )
            .eq(
                "contratado_id",
                usuarioPerfilId
            )
            .order(
                "updated_at",
                {
                    ascending: false
                }
            )
            .limit(1);


    if (resultadoDireto.error) {

        console.error(
            "ApresentarPerfilAcoes: erro ao procurar conversa direta:",
            resultadoDireto.error
        );


        throw resultadoDireto.error;

    }


    if (
        resultadoDireto.data &&
        resultadoDireto.data.length > 0
    ) {

        console.log(
            "ApresentarPerfilAcoes: conversa encontrada:",
            resultadoDireto.data[0]
        );


        return resultadoDireto.data[0];

    }


    /*
     * --------------------------------------------------
     * SEGUNDA POSSIBILIDADE
     *
     * perfil = contratante
     * usuário logado = contratado
     * --------------------------------------------------
     */

    const resultadoInverso =
        await supabase
            .from("conversas")
            .select(
                "id, contratante_id, contratado_id, contratacao_id, servico_id, created_at, updated_at"
            )
            .eq(
                "contratante_id",
                usuarioPerfilId
            )
            .eq(
                "contratado_id",
                usuarioAtualId
            )
            .order(
                "updated_at",
                {
                    ascending: false
                }
            )
            .limit(1);


    if (resultadoInverso.error) {

        console.error(
            "ApresentarPerfilAcoes: erro ao procurar conversa inversa:",
            resultadoInverso.error
        );


        throw resultadoInverso.error;

    }


    if (
        resultadoInverso.data &&
        resultadoInverso.data.length > 0
    ) {

        console.log(
            "ApresentarPerfilAcoes: conversa inversa encontrada:",
            resultadoInverso.data[0]
        );


        return resultadoInverso.data[0];

    }


    return null;

}


/* =========================================================
   CRIAR CONVERSA

   Quando ainda não existe uma conversa entre os dois
   usuários, criamos uma nova.

   Para o fluxo iniciado pelo botão "Mensagem":

   contratante_id = usuário logado
   contratado_id  = usuário do perfil

   Nenhuma mensagem é criada automaticamente.

   A conversa fica pronta para o usuário escrever.
   ========================================================= */

async function criarConversa(
    usuarioAtualId,
    usuarioPerfilId
) {

    const supabase =
        obterSupabase();


    if (!supabase) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    console.log(
        "ApresentarPerfilAcoes: criando nova conversa..."
    );


    const resultado =
        await supabase
            .from("conversas")
            .insert({

                contratante_id:
                    usuarioAtualId,

                contratado_id:
                    usuarioPerfilId

            })
            .select(
                "id, contratante_id, contratado_id, contratacao_id, servico_id, created_at, updated_at"
            )
            .single();


    if (resultado.error) {

        console.error(
            "ApresentarPerfilAcoes: erro ao criar conversa:",
            resultado.error
        );


        throw resultado.error;

    }


    console.log(
        "ApresentarPerfilAcoes: nova conversa criada:",
        resultado.data
    );


    return resultado.data;

}


/* =========================================================
   ABRIR MENSAGENS / CHAT

   Fluxo completo:

   1. Verifica autenticação.
   2. Identifica usuário do perfil.
   3. Impede conversa consigo mesmo.
   4. Procura conversa existente.
   5. Cria conversa se necessário.
   6. Abre DIRETAMENTE o chat.html.

   A página mensagens.html NÃO é aberta neste momento.

   Depois que o usuário estiver no Chat e clicar
   em "Voltar", o chat.js enviará o usuário para:

   mensagens.html

   Assim a conversa já estará disponível na caixa
   de entrada.
   ========================================================= */

async function abrirMensagens() {

    if (abrindoConversa) {

        console.log(
            "ApresentarPerfilAcoes: abertura de conversa já está em andamento."
        );


        return false;

    }


    abrindoConversa =
        true;


    const btnContato =
        obterElemento(
            CONFIG.elementos.contato
        ) ||
        obterElemento(
            CONFIG.elementos.contatoFallback
        );


    try {

        console.log(
            "ApresentarPerfilAcoes: botão Mensagem acionado."
        );


        /* -------------------------------------------------
           1. Obter usuário autenticado
           ------------------------------------------------- */

        const usuarioAutenticado =
            await obterUsuarioAutenticado();


        if (!usuarioAutenticado) {

            console.warn(
                "ApresentarPerfilAcoes: usuário não está autenticado."
            );


            mostrarToast(
                "Faça login para enviar uma mensagem."
            );


            return false;

        }


        const usuarioAtualId =
            normalizarTexto(
                usuarioAutenticado.id
            );


        if (!usuarioAtualId) {

            console.error(
                "ApresentarPerfilAcoes: ID do usuário autenticado não encontrado."
            );


            mostrarToast(
                "Não foi possível identificar sua conta."
            );


            return false;

        }


        /* -------------------------------------------------
           2. Obter usuário dono do perfil
           ------------------------------------------------- */

        const usuarioPerfilId =
            obterUsuarioIdPerfil();


        console.log(
            "ApresentarPerfilAcoes: usuários envolvidos:",
            {
                usuarioAtualId,
                usuarioPerfilId
            }
        );


        if (!usuarioPerfilId) {

            console.error(
                "ApresentarPerfilAcoes: não foi possível identificar o usuário dono do perfil.",
                {
                    estadoAtual,
                    perfil: obterPerfil(),
                    perfilArtista: obterPerfilArtista()
                }
            );


            mostrarToast(
                "Não foi possível identificar o usuário deste perfil."
            );


            return false;

        }


        /* -------------------------------------------------
           3. Impedir conversa consigo mesmo
           ------------------------------------------------- */

        if (
            usuarioAtualId ===
            usuarioPerfilId
        ) {

            console.log(
                "ApresentarPerfilAcoes: usuário tentou abrir conversa com o próprio perfil."
            );


            mostrarToast(
                "Você não pode iniciar uma conversa com seu próprio perfil."
            );


            return false;

        }


        /* -------------------------------------------------
           4. Desabilitar temporariamente o botão
           ------------------------------------------------- */

        if (btnContato) {

            btnContato.disabled =
                true;


            btnContato.setAttribute(
                "aria-busy",
                "true"
            );

        }


        /* -------------------------------------------------
           5. Procurar conversa existente
           ------------------------------------------------- */

        let conversa =
            await localizarConversa(
                usuarioAtualId,
                usuarioPerfilId
            );


        /* -------------------------------------------------
           6. Criar conversa caso ainda não exista
           ------------------------------------------------- */

        if (!conversa) {

            conversa =
                await criarConversa(
                    usuarioAtualId,
                    usuarioPerfilId
                );

        }


        if (
            !conversa ||
            !conversa.id
        ) {

            throw new Error(
                "A conversa foi localizada/criada, mas não possui ID válido."
            );

        }


        /* -------------------------------------------------
           7. Montar URL DIRETA do Chat
           ------------------------------------------------- */

        const parametros =
            new URLSearchParams();


        parametros.set(
            "id",
            conversa.id
        );


        /*
         * Enviamos também o nome como parâmetro
         * auxiliar.
         *
         * O chat.js não depende dele para funcionar,
         * pois consulta o usuário diretamente no banco.
         */

        const nomePerfil =
            obterNomePerfil();


        if (nomePerfil) {

            parametros.set(
                "nome",
                nomePerfil
            );

        }


        const destino =
            CONFIG.paginaChat +
            "?" +
            parametros.toString();


        console.log(
            "ApresentarPerfilAcoes: abrindo Chat diretamente:",
            {
                conversaId: conversa.id,
                destino
            }
        );


        /* -------------------------------------------------
           8. Abrir o Chat
           ------------------------------------------------- */

        window.location.assign(
            destino
        );


        return true;

    } catch (erro) {

        console.error(
            "ApresentarPerfilAcoes: erro ao abrir conversa:",
            erro
        );


        /*
         * Trata especificamente problemas comuns
         * de permissão/RLS.
         */

        if (
            erro &&
            (
                erro.code === "42501" ||
                erro.code === "PGRST301" ||
                String(erro.message || "")
                    .toLowerCase()
                    .includes("row-level security")
            )
        ) {

            mostrarToast(
                "Não foi possível acessar a conversa. Verifique as permissões da sua conta."
            );

        } else {

            mostrarToast(
                "Não foi possível abrir a conversa. Tente novamente."
            );

        }


        return false;

    } finally {

        abrindoConversa =
            false;


        if (btnContato) {

            btnContato.disabled =
                false;


            btnContato.removeAttribute(
                "aria-busy"
            );

        }

    }

}


/* =========================================================
   CONTRATAÇÃO

   Responsabilidade:

   - Validar o perfil atual
   - Obter o perfil_id
   - Obter o tipo do perfil
   - Montar a URL da contratação
   - Redirecionar para contratacao.html

   Nenhum registro de contratação é criado aqui.
   ========================================================= */

function contratarPerfil() {

    console.log(
        "ApresentarPerfilAcoes: botão Contratar acionado."
    );


    const perfilId =
        obterPerfilId();


    const tipo =
        obterTipoPerfil();


    console.log(
        "ApresentarPerfilAcoes: dados para contratação:",
        {
            perfilId,
            tipo,
            estadoAtual
        }
    );


    if (!perfilId) {

        console.error(
            "ApresentarPerfilAcoes: perfil_id não encontrado."
        );


        mostrarToast(
            "Não foi possível identificar este perfil."
        );


        return false;

    }


    const parametros =
        new URLSearchParams();


    parametros.set(
        "perfil_id",
        perfilId
    );


    if (tipo) {

        parametros.set(
            "tipo",
            tipo
        );

    }


    const destino =
        CONFIG.paginaContratacao +
        "?" +
        parametros.toString();


    console.log(
        "ApresentarPerfilAcoes: redirecionando para:",
        destino
    );


    const btnContratar =
        obterElemento(
            CONFIG.elementos.contratar
        );


    if (btnContratar) {

        btnContratar.disabled =
            true;


        btnContratar.setAttribute(
            "aria-busy",
            "true"
        );

    }


    window.location.assign(
        destino
    );


    return true;

}


/* =========================================================
   CONFIGURAÇÃO DOS BOTÕES
   ========================================================= */

function configurarBotoes() {

    const btnVoltar =
        obterElemento(
            CONFIG.elementos.voltar
        );


    const btnCompartilhar =
        obterElemento(
            CONFIG.elementos.compartilhar
        );


    const btnContato =
        obterElemento(
            CONFIG.elementos.contato
        ) ||
        obterElemento(
            CONFIG.elementos.contatoFallback
        );


    const btnContratar =
        obterElemento(
            CONFIG.elementos.contratar
        );


    console.log(
        "ApresentarPerfilAcoes: procurando botões...",
        {
            btnVoltar: !!btnVoltar,
            btnCompartilhar: !!btnCompartilhar,
            btnContato: !!btnContato,
            btnContratar: !!btnContratar
        }
    );


    /* -----------------------------------------------------
       BOTÃO VOLTAR
       ----------------------------------------------------- */

    if (btnVoltar) {

        btnVoltar.onclick =
            voltar;

    }


    /* -----------------------------------------------------
       BOTÃO COMPARTILHAR
       ----------------------------------------------------- */

    if (btnCompartilhar) {

        btnCompartilhar.onclick =
            function (evento) {

                if (evento) {

                    evento.preventDefault();

                }


                compartilharPerfil();

            };

    }


    /* -----------------------------------------------------
       BOTÃO MENSAGEM

       O botão utiliza o sistema interno
       de mensagens do MusicalWorld.

       Fluxo:

       perfil
          ↓
       localizar/criar conversa
          ↓
       chat.html?id=...
          ↓
       conversa aberta
       ----------------------------------------------------- */

    if (btnContato) {

        btnContato.onclick =
            function (evento) {

                if (evento) {

                    evento.preventDefault();

                }


                abrirMensagens();

            };

    }


    /* -----------------------------------------------------
       BOTÃO CONTRATAR
       ----------------------------------------------------- */

    if (btnContratar) {

        btnContratar.onclick =
            function (evento) {

                if (evento) {

                    evento.preventDefault();

                }


                console.log(
                    "ApresentarPerfilAcoes: clique recebido diretamente em btnContratar."
                );


                contratarPerfil();

            };

    }


    if (
        btnVoltar ||
        btnCompartilhar ||
        btnContato ||
        btnContratar
    ) {

        eventosConfigurados =
            true;

    }


    console.log(
        "ApresentarPerfilAcoes: configuração dos botões concluída."
    );

}


/* =========================================================
   DELEGAÇÃO GLOBAL DO BOTÃO CONTRATAR

   Esta proteção mantém o botão funcionando mesmo
   se outro módulo substituir/recriar o elemento.
   ========================================================= */

function configurarDelegacaoContratacao() {

    if (eventoDelegadoConfigurado) {

        return;

    }


    document.addEventListener(

        "click",

        function (evento) {

            const alvo =
                evento.target;


            if (!alvo) {

                return;

            }


            const botaoContratar =
                alvo.closest &&
                alvo.closest(
                    "#btnContratar"
                );


            if (!botaoContratar) {

                return;

            }


            if (
                botaoContratar.disabled
            ) {

                return;

            }


            console.log(
                "ApresentarPerfilAcoes: clique global detectado em #btnContratar."
            );


            if (evento) {

                evento.preventDefault();

            }


            contratarPerfil();

        },

        true

    );


    eventoDelegadoConfigurado =
        true;


    console.log(
        "ApresentarPerfilAcoes: delegação global de #btnContratar configurada."
    );

}


/* =========================================================
   CONFIGURAÇÃO DO MÓDULO
   ========================================================= */

function configurar(estado) {

    estadoAtual =
        estado || null;


    console.log(
        "ApresentarPerfilAcoes: estado recebido.",
        estadoAtual
    );


    configurarDelegacaoContratacao();


    if (
        document.readyState === "loading"
    ) {

        eventosConfigurados =
            false;


        return;

    }


    configurarBotoes();

}


/* =========================================================
   ATUALIZAÇÃO DO ESTADO
   ========================================================= */

function atualizarEstado(estado) {

    estadoAtual =
        estado || null;


    console.log(
        "ApresentarPerfilAcoes: estado atualizado.",
        estadoAtual
    );


    configurarDelegacaoContratacao();


    configurarBotoes();

}


/* =========================================================
   LIMPEZA DO MÓDULO
   ========================================================= */

function limpar() {

    estadoAtual =
        null;


    eventosConfigurados =
        false;


    abrindoConversa =
        false;


    const elementos = [

        CONFIG.elementos.voltar,

        CONFIG.elementos.compartilhar,

        CONFIG.elementos.contato,

        CONFIG.elementos.contatoFallback,

        CONFIG.elementos.contratar

    ];


    elementos.forEach(

        function (id) {

            const elemento =
                obterElemento(id);


            if (!elemento) {

                return;

            }


            elemento.onclick =
                null;

        }

    );

}


/* =========================================================
   DOM READY
   ========================================================= */

function inicializarQuandoDOMPronto() {

    configurarDelegacaoContratacao();


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            function () {

                console.log(
                    "ApresentarPerfilAcoes: DOM pronto. Configurando botões."
                );


                configurarBotoes();

            },

            {
                once: true
            }

        );


        return;

    }


    configurarBotoes();

}


/* =========================================================
   INICIALIZAÇÃO DO MÓDULO
   ========================================================= */

inicializarQuandoDOMPronto();


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.ApresentarPerfilAcoes = {

    configurar,

    atualizarEstado,

    limpar,

    voltar,

    compartilharPerfil,

    copiarLink,

    abrirContato,

    abrirMensagens,

    contratarPerfil,

    mostrarToast,

    obterLinkPerfil,

    obterTelefone,

    obterNomePerfil,

    obterTipoPerfil,

    obterPerfilId,

    obterUsuarioIdPerfil

};


})(window);
