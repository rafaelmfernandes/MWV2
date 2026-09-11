(function (window) {


"use strict";

/* =========================================================
   MUSICALWORLD — AÇÕES DO PERFIL PÚBLICO

   Arquivo:
   ApresentarPerfilAcoes.js

   Responsabilidade:

   - Voltar
   - Compartilhar perfil
   - Copiar link
   - Entrar em contato
   - Contratar perfil
   - Mostrar mensagens/toasts
   - Navegação relacionada às ações

   Este módulo NÃO:

   - consulta o Supabase
   - carrega dados
   - renderiza HTML de conteúdo
   - controla seções
   - identifica tipos de perfil

   Ele apenas executa ações sobre o estado já carregado.
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
        dupla: "contratar-musico.html",
        dj: "contratar-musico.html",
        dancarino: "contratar-musico.html",
        grupo_danca: "contratar-musico.html",
        mc: "contratar-musico.html",
        compositor: "contratar-musico.html",
        produtor_musical: "contratar-musico.html"
    }
};


let estadoAtual = null;


/* =========================================================
   ELEMENTOS
   ========================================================= */

function obterElemento(id) {

    if (!id) {
        return null;
    }

    return document.getElementById(id);
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarTexto(valor) {

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor).trim();
}


function normalizarTipo(tipo) {

    return normalizarTexto(tipo)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}


/* =========================================================
   EXTRAÇÃO DE DADOS
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

    if (estadoAtual && estadoAtual.perfilId) {
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


function obterTipoPerfil() {

    if (estadoAtual && estadoAtual.tipoPerfil) {
        return normalizarTipo(estadoAtual.tipoPerfil);
    }

    const perfil = obterPerfil();

    if (perfil.tipo_perfil) {

        if (typeof perfil.tipo_perfil === "object") {

            return normalizarTipo(
                perfil.tipo_perfil.nome ||
                perfil.tipo_perfil.tipo ||
                perfil.tipo_perfil.slug ||
                ""
            );
        }

        return normalizarTipo(perfil.tipo_perfil);
    }

    if (perfil.tipo) {

        if (typeof perfil.tipo === "object") {

            return normalizarTipo(
                perfil.tipo.nome ||
                perfil.tipo.tipo ||
                perfil.tipo.slug ||
                ""
            );
        }

        return normalizarTipo(perfil.tipo);
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
   TELEFONE
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

    const toast = obterElemento(CONFIG.elementos.toast);

    if (!toast) {
        console.log(mensagem);
        return;
    }

    toast.textContent = mensagem;

    toast.classList.add("show");

    clearTimeout(toast._timeout);

    toast._timeout = setTimeout(function () {

        toast.classList.remove("show");

    }, 3000);
}


/* =========================================================
   VOLTAR
   ========================================================= */

function voltar() {

    if (window.history.length > 1) {

        window.history.back();

        return;
    }

    window.location.href = "index.html";
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

    try {

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText === "function"
        ) {

            await navigator.clipboard.writeText(link);

            mostrarToast("Link do perfil copiado.");

            return true;
        }

    } catch (erro) {

        console.warn(
            "Não foi possível usar a área de transferência:",
            erro
        );
    }


    try {

        const textarea = document.createElement("textarea");

        textarea.value = link;

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const sucesso = document.execCommand("copy");

        textarea.remove();

        if (sucesso) {

            mostrarToast("Link do perfil copiado.");

            return true;
        }

    } catch (erro) {

        console.error(
            "Erro ao copiar link:",
            erro
        );
    }

    mostrarToast("Não foi possível copiar o link.");

    return false;
}


/* =========================================================
   COMPARTILHAR
   ========================================================= */

async function compartilharPerfil() {

    const nome = obterNomePerfil();
    const link = obterLinkPerfil();

    if (navigator.share) {

        try {

            await navigator.share({

                title: nome,
                text: "Confira o perfil de " + nome + " no MusicalWorld.",
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

    const telefone = obterTelefone();

    if (!telefone) {

        mostrarToast(
            "Este perfil ainda não possui um contato disponível."
        );

        return false;
    }


    const numero = normalizarTelefone(telefone);

    if (!numero) {

        mostrarToast(
            "O número de contato deste perfil não é válido."
        );

        return false;
    }


    let numeroWhatsApp = numero;


    /*
     * Se o número já vier com DDI, mantém.
     * Caso contrário, adiciona o código do Brasil.
     */

    if (!numeroWhatsApp.startsWith("55")) {

        numeroWhatsApp = "55" + numeroWhatsApp;
    }


    const mensagem =
        "Olá! Vi seu perfil no MusicalWorld e gostaria de conversar sobre um possível serviço.";


    const url =
        "https://wa.me/" +
        numeroWhatsApp +
        "?text=" +
        encodeURIComponent(mensagem);


    window.open(url, "_blank");

    return true;
}


/* =========================================================
   CONTRATAÇÃO
   ========================================================= */

function contratarPerfil() {

    const tipo = obterTipoPerfil();

    const pagina =
        CONFIG.paginasContratacao[tipo];


    if (!pagina) {

        mostrarToast(
            "A contratação deste tipo de perfil ainda não está disponível."
        );

        return false;
    }


    const perfilId = obterPerfilId();


    const parametros = new URLSearchParams();


    if (perfilId) {

        parametros.set(
            "perfil_id",
            perfilId
        );
    }


    if (tipo) {

        parametros.set(
            "tipo",
            tipo
        );
    }


    const query = parametros.toString();

    const destino =
        query
            ? pagina + "?" + query
            : pagina;


    window.location.href = destino;

    return true;
}


/* =========================================================
   CONFIGURAÇÃO DOS BOTÕES
   ========================================================= */

function configurarBotoes() {

    const btnVoltar =
        obterElemento(CONFIG.elementos.voltar);

    const btnCompartilhar =
        obterElemento(CONFIG.elementos.compartilhar);

    const btnContato =
        obterElemento(CONFIG.elementos.contato);

    const btnContratar =
        obterElemento(CONFIG.elementos.contratar);


    if (btnVoltar) {

        btnVoltar.onclick = voltar;
    }


    if (btnCompartilhar) {

        btnCompartilhar.onclick = function (evento) {

            if (evento) {
                evento.preventDefault();
            }

            compartilharPerfil();
        };
    }


    if (btnContato) {

        btnContato.onclick = function (evento) {

            if (evento) {
                evento.preventDefault();
            }

            abrirContato();
        };
    }


    if (btnContratar) {

        btnContratar.onclick = function (evento) {

            if (evento) {
                evento.preventDefault();
            }

            contratarPerfil();
        };
    }
}


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

function configurar(estado) {

    estadoAtual = estado || null;

    configurarBotoes();
}


/* =========================================================
   ATUALIZAR ESTADO
   ========================================================= */

function atualizarEstado(estado) {

    estadoAtual = estado || null;
}


/* =========================================================
   LIMPAR
   ========================================================= */

function limpar() {

    estadoAtual = null;


    const elementos = [
        CONFIG.elementos.voltar,
        CONFIG.elementos.compartilhar,
        CONFIG.elementos.contato,
        CONFIG.elementos.contratar
    ];


    elementos.forEach(function (id) {

        const elemento = obterElemento(id);

        if (!elemento) {
            return;
        }

        elemento.onclick = null;
    });
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
