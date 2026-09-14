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
   - Controlar ações dos botões do perfil público

   Este módulo NÃO:

   - consulta o Supabase
   - carrega dados do perfil
   - renderiza conteúdo do perfil
   - controla abas/seções
   - identifica os dados principais do perfil

   Ele trabalha somente com o estado já carregado
   pelo módulo principal ApresentarPerfil.js.
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    elementos: {
        voltar: "btnVoltar",
        compartilhar: "btnCompartilhar",
        contato: "btnContato",
        contratar: "btnContratar",
        toast: "toast"
    },

    paginasContratacao: {
        cantor: "contratar-musico.html",
        musico: "contratar-musico.html",
        banda: "contratar-musico.html",
        dupla_musical: "contratar-musico.html",
        dj: "contratar-musico.html",
        dancarino: "contratar-musico.html",
        grupo_de_danca: "contratar-musico.html",
        mc: "contratar-musico.html",
        compositor: "contratar-musico.html",
        produtor_musical: "contratar-musico.html"
    }
};


/* =========================================================
   ESTADO INTERNO
   ========================================================= */

let estadoAtual = null;


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

    if (valor === null || valor === undefined) {
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
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}


/* =========================================================
   OBTENÇÃO DOS DADOS DO ESTADO
   ========================================================= */

function obterUsuario() {

    return estadoAtual &&
           estadoAtual.dados &&
           estadoAtual.dados.usuario
        ? estadoAtual.dados.usuario
        : {};
}


function obterPerfil() {

    return estadoAtual &&
           estadoAtual.dados &&
           estadoAtual.dados.perfil
        ? estadoAtual.dados.perfil
        : {};
}


function obterPerfilArtista() {

    return estadoAtual &&
           estadoAtual.dados &&
           estadoAtual.dados.perfilArtista
        ? estadoAtual.dados.perfilArtista
        : {};
}


function obterPerfilId() {

    if (
        estadoAtual &&
        estadoAtual.perfilId
    ) {
        return estadoAtual.perfilId;
    }


    if (
        estadoAtual &&
        estadoAtual.dados &&
        estadoAtual.dados.perfilId
    ) {
        return estadoAtual.dados.perfilId;
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


    const perfil = obterPerfil();


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


    return "";
}


/* =========================================================
   NOME DO PERFIL
   ========================================================= */

function obterNomePerfil() {

    const usuario = obterUsuario();
    const perfil = obterPerfil();
    const perfilArtista = obterPerfilArtista();


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

    const usuario = obterUsuario();
    const perfil = obterPerfil();
    const perfilArtista = obterPerfilArtista();


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

    const toast = obterElemento(
        CONFIG.elementos.toast
    );


    if (!toast) {

        console.log(mensagem);

        return;
    }


    toast.textContent = mensagem;

    toast.classList.add("show");


    clearTimeout(
        toast._timeout
    );


    toast._timeout = setTimeout(
        function () {

            toast.classList.remove("show");

        },
        3000
    );
}


/* =========================================================
   VOLTAR
   ========================================================= */

/* =========================================================
   VOLTAR
   ========================================================= */

function voltar() {

    console.log(
        "ApresentarPerfilAcoes: botão voltar acionado."
    );

    /*
     * Guarda informações para diagnóstico.
     */

    console.log(
        "ApresentarPerfilAcoes: history.length =",
        window.history.length
    );

    console.log(
        "ApresentarPerfilAcoes: document.referrer =",
        document.referrer
    );


    /*
     * Primeiro tenta utilizar o histórico do navegador/WebView.
     */

    if (
        window.history &&
        window.history.length > 1
    ) {

        console.log(
            "ApresentarPerfilAcoes: tentando retornar pelo histórico."
        );


        window.history.back();


        /*
         * Em alguns ambientes WebView/Capacitor,
         * o history.back() pode não produzir navegação.
         *
         * Por isso temos um fallback.
         */

        setTimeout(function () {

            /*
             * Se ainda estivermos na mesma página,
             * significa que o histórico não conseguiu
             * realizar a navegação.
             */

            console.warn(
                "ApresentarPerfilAcoes: histórico não realizou a navegação. Usando fallback."
            );


            window.location.href =
                "index.html";

        }, 500);


        return;
    }


    /*
     * Se não existe histórico suficiente,
     * retorna diretamente para a página inicial.
     */

    console.log(
        "ApresentarPerfilAcoes: nenhum histórico disponível. Indo para index.html."
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

    const link = obterLinkPerfil();


    /*
     * Primeiro tenta utilizar a API moderna
     * da área de transferência.
     */

    try {

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {

            await navigator.clipboard.writeText(link);

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


    /*
     * Fallback para ambientes onde
     * navigator.clipboard não está disponível.
     */

    try {

        const textarea =
            document.createElement("textarea");


        textarea.value = link;

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();
        textarea.select();


        const sucesso =
            document.execCommand("copy");


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


    /*
     * Em dispositivos que possuem
     * Web Share API, abre o compartilhamento nativo.
     */

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

            /*
             * O usuário pode simplesmente ter
             * fechado/cancelado o compartilhamento.
             */

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


    /*
     * Se o compartilhamento nativo não estiver
     * disponível, copia o link automaticamente.
     */

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


    /*
     * Caso o telefone não possua
     * código internacional, assume Brasil.
     */

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
   ========================================================= */

function contratarPerfil() {

    const tipo =
        obterTipoPerfil();


    const pagina =
        CONFIG.paginasContratacao[tipo];


    if (!pagina) {

        mostrarToast(
            "A contratação deste tipo de perfil ainda não está disponível."
        );

        return false;
    }


    const perfilId =
        obterPerfilId();


    const parametros =
        new URLSearchParams();


    /*
     * Envia o ID do perfil para a página
     * de contratação.
     */

    if (perfilId) {

        parametros.set(
            "perfil_id",
            perfilId
        );
    }


    /*
     * Envia também o tipo do perfil.
     */

    if (tipo) {

        parametros.set(
            "tipo",
            tipo
        );
    }


    const query =
        parametros.toString();


    const destino =
        query
            ? pagina + "?" + query
            : pagina;


    window.location.href =
        destino;


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
        );


    const btnContratar =
        obterElemento(
            CONFIG.elementos.contratar
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
       BOTÃO CONTATO
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
       ----------------------------------------------------- */

    if (btnContratar) {

        btnContratar.onclick =
            function (evento) {

                if (evento) {
                    evento.preventDefault();
                }

                contratarPerfil();
            };
    }
}


/* =========================================================
   CONFIGURAÇÃO DO MÓDULO
   ========================================================= */

function configurar(estado) {

    estadoAtual =
        estado || null;


    configurarBotoes();
}


/* =========================================================
   ATUALIZAÇÃO DO ESTADO
   ========================================================= */

function atualizarEstado(estado) {

    estadoAtual =
        estado || null;
}


/* =========================================================
   LIMPEZA DO MÓDULO
   ========================================================= */

function limpar() {

    estadoAtual = null;


    const elementos = [

        CONFIG.elementos.voltar,
        CONFIG.elementos.compartilhar,
        CONFIG.elementos.contato,
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
