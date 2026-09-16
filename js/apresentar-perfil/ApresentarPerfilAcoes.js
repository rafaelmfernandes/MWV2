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
   - Iniciar contratação do perfil
   - Exibir mensagens/toasts
   - Controlar as ações dos botões do perfil público

   Este módulo NÃO:

   - consulta diretamente o Supabase
   - carrega dados do perfil
   - renderiza o conteúdo do perfil
   - controla abas/seções

   O módulo utiliza o estado fornecido pelo
   ApresentarPerfil.js.

   Fluxo de contratação:

   apresentar perfil
          ↓
   clicar em "Contratar"
          ↓
   contratacao.html?perfil_id=UUID
          ↓
   contratacao.js
          ↓
   escolha do serviço
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    elementos: {

        voltar: "btnVoltar",

        compartilhar: "btnCompartilhar",

        /*
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

    /* -----------------------------------------------------
       1. ID diretamente no estado principal
       ----------------------------------------------------- */

    if (
        estadoAtual &&
        estadoAtual.perfilId
    ) {

        return normalizarTexto(
            estadoAtual.perfilId
        );

    }


    /* -----------------------------------------------------
       2. ID dentro de estadoAtual.dados
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       3. ID da tabela perfis
       ----------------------------------------------------- */

    if (perfil.id) {

        return normalizarTexto(
            perfil.id
        );

    }


    /* -----------------------------------------------------
       4. ID do perfil artístico
       ----------------------------------------------------- */

    if (perfilArtista.perfil_id) {

        return normalizarTexto(
            perfilArtista.perfil_id
        );

    }


    /* -----------------------------------------------------
       5, 6 e 7. Fallback pela URL
       ----------------------------------------------------- */

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


    /*
     * O ApresentarPerfil.js também trabalha
     * com propriedades como tipo, tipoChave
     * e tipoNome.
     *
     * Por isso verificamos essas propriedades
     * antes de consultar os dados.
     */

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


    /*
     * Fallback adicional pela URL.
     */

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

   IMPORTANTE:
   ---------------------------------------------------------
   Não utilizamos window.history.back() aqui.

   Isso evita que, após cancelar uma contratação,
   o usuário seja levado novamente para uma das etapas
   antigas da contratação.

   Exemplo:

   contratação
        ↓
   cancelar
        ↓
   apresentar-perfil.html?id=...
        ↓
   botão Voltar
        ↓
   index.html

   Assim o histórico da contratação não interfere
   no comportamento do botão do perfil.
   ========================================================= */

function voltar() {

    console.log(
        "ApresentarPerfilAcoes: botão voltar acionado."
    );


    /*
     * O botão Voltar do perfil público sempre
     * retorna para a página inicial.
     */

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
   CONTATO
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


    /*
     * Sem perfil_id não é possível iniciar
     * corretamente a contratação.
     */

    if (!perfilId) {

        console.error(
            "ApresentarPerfilAcoes: perfil_id não encontrado."
        );


        mostrarToast(
            "Não foi possível identificar este perfil."
        );


        return false;

    }


    /*
     * Cria os parâmetros da próxima página.
     */

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


    /*
     * Bloqueia visualmente o botão para
     * impedir múltiplos cliques.
     */

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


    /*
     * Redirecionamento principal.
     */

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
       BOTÃO CONTATO / MENSAGEM
       ----------------------------------------------------- */

    if (btnContato) {

        btnContato.onclick =
            function (evento) {

                if (evento) {

                    evento.preventDefault();

                }


                abrirContato();

            };

    }


    /* -----------------------------------------------------
       BOTÃO CONTRATAR

       Mantemos o onclick tradicional como primeira
       camada de segurança.

       A delegação global abaixo também será
       configurada para garantir que o clique
       continue funcionando caso outro módulo
       substitua o elemento no DOM.
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

   Esta é a principal proteção desta versão.

   Em vez de depender exclusivamente do onclick
   instalado diretamente no botão, observamos os
   cliques no document.

   Assim, mesmo que algum módulo posteriormente
   substitua ou recrie #btnContratar, o clique
   continuará sendo capturado.

   O listener é registrado apenas uma vez.
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


            /*
             * closest() permite que o clique
             * seja feito no ícone, no span ou
             * diretamente no botão.
             */

            const botaoContratar =
                alvo.closest &&
                alvo.closest(
                    "#btnContratar"
                );


            if (!botaoContratar) {

                return;

            }


            /*
             * Se o botão já estiver desabilitado,
             * não executamos novamente.
             */

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


            /*
             * Executa a mesma função usada
             * pelo onclick tradicional.
             */

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


    /*
     * A delegação pode ser configurada
     * independentemente do momento em que
     * o botão aparece no DOM.
     */

    configurarDelegacaoContratacao();


    /*
     * Se o DOM ainda estiver carregando,
     * aguardamos o DOMContentLoaded.
     */

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


    /*
     * Não removemos a delegação global.

     * Ela pertence ao ciclo de vida da página
     * e não depende de um elemento específico.
     *
     * Isso evita que o sistema perca a capacidade
     * de detectar #btnContratar caso o botão
     * seja recriado posteriormente.
     */

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

   O módulo pode ser carregado antes de todos
   os elementos do HTML estarem disponíveis.

   Por isso fazemos uma nova tentativa quando
   o DOM estiver completamente pronto.
   ========================================================= */

function inicializarQuandoDOMPronto() {

    /*
     * A delegação é configurada imediatamente,
     * pois ela funciona mesmo antes do botão
     * existir no DOM.
     */

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

    contratarPerfil,

    mostrarToast,

    obterLinkPerfil,

    obterTelefone,

    obterNomePerfil,

    obterTipoPerfil,

    obterPerfilId

};


})(window);
