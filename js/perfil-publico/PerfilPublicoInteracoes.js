/* =========================================================
   MUSICALWORLD — INTERAÇÕES DO PERFIL PÚBLICO

   Arquivo:
   js/perfil-publico/PerfilPublicoInteracoes.js

   Responsabilidade:

   - Controlar as ações disponíveis sobre o perfil.
   - Identificar ações exclusivas do proprietário.
   - Identificar ações disponíveis para visitantes.
   - Controlar Curtir.
   - Controlar Salvar.
   - Controlar Compartilhar via WhatsApp.
   - Controlar a visibilidade dos botões de interação.
   - Manter o controlador PerfilPublico.js mais enxuto.

   IMPORTANTE:

   Este módulo NÃO carrega dados do Supabase.

   Este módulo NÃO renderiza o conteúdo principal
   do perfil.

   Este módulo NÃO controla abas.

   Este módulo recebe o estado atual do PerfilPublico.js
   e trabalha somente com as interações da página.

   ========================================================= */

(function (window) {

"use strict";


/* =====================================================
   DEPENDÊNCIAS
   ===================================================== */

const Utils =
    window.PerfilPublicoUtils;


/* =====================================================
   ESTADO INTERNO
   ===================================================== */

const estado = {

    perfilPublico:
        null,

    /*
     * Estado recebido do controlador principal.
     *
     * Não copiamos o objeto inteiro para evitar
     * manter uma segunda fonte de verdade.
     */

    perfil:
        null,

    perfilArtista:
        null,

    usuario:
        null,

    usuarioPerfil:
        null,

    usuarioId:
        null,

    perfilId:
        null,

    tipoPerfil:
        null,

    ehMeuPerfil:
        false,


    /*
     * Estado visual das interações.
     *
     * A persistência real poderá ser ligada ao Supabase
     * posteriormente.
     */

    curtido:
        false,

    salvo:
        false,


    inicializado:
        false

};


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    botoes: {

        visualizar:
            "btnVisualizarPerfil",

        editar:
            "btnEditarPerfil",

        whatsapp:
            "btnWhatsApp",

        curtir:
            "btnCurtirPerfil",

        salvar:
            "btnSalvarPerfil"

    },


    toast: {

        elemento:
            "toast",

        mensagem:
            "toastMessage"

    }

};


/* =====================================================
   LOG
   ===================================================== */

function log(...mensagens) {

    console.log(
        "[PerfilPublicoInteracoes]",
        ...mensagens
    );

}


function aviso(...mensagens) {

    console.warn(
        "[PerfilPublicoInteracoes]",
        ...mensagens
    );

}


function erro(...mensagens) {

    console.error(
        "[PerfilPublicoInteracoes]",
        ...mensagens
    );

}


/* =====================================================
   ELEMENTOS
   ===================================================== */

function obterElemento(
    id
) {

    if (!id) {
        return null;
    }


    return document.getElementById(
        id
    );

}


/* =====================================================
   PRIMEIRO VALOR
   ===================================================== */

function obterPrimeiroValor(
    ...valores
) {

    if (
        Utils &&
        typeof Utils.obterPrimeiroValor === "function"
    ) {

        return Utils.obterPrimeiroValor(
            ...valores
        );

    }


    for (
        const valor of valores
    ) {

        if (
            valor !== null &&
            valor !== undefined &&
            String(
                valor
            ).trim() !== ""
        ) {

            return valor;

        }

    }


    return "";

}


/* =====================================================
   CONFIGURAR ESTADO
   ===================================================== */

function configurarEstado(
    novoEstado
) {

    if (!novoEstado) {
        return;
    }


    estado.perfilPublico =
        novoEstado;


    estado.perfil =
        novoEstado.perfil ||
        null;


    estado.perfilArtista =
        novoEstado.perfilArtista ||
        null;


    estado.usuario =
        novoEstado.usuario ||
        null;


    estado.usuarioPerfil =
        novoEstado.usuarioPerfil ||
        null;


    estado.usuarioId =
        novoEstado.usuarioId ||
        null;


    estado.perfilId =
        novoEstado.perfilId ||
        null;


    estado.tipoPerfil =
        novoEstado.tipoPerfil ||
        null;


    estado.ehMeuPerfil =
        Boolean(
            novoEstado.ehMeuPerfil
        );


}


/* =====================================================
   IDENTIFICAR ARTISTA
   ===================================================== */

function ehArtista() {

    const tipo =
        String(
            estado.tipoPerfil || ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim()
            .toLowerCase();


    return (
        tipo === "artista"
    );

}


/* =====================================================
   NOME DO PERFIL
   ===================================================== */

function obterNomePerfil() {

    const usuarioPerfil =
        estado.usuarioPerfil ||
        {};


    return obterPrimeiroValor(

        ehArtista()
            ? estado.perfilArtista?.nome_artistico
            : "",

        ehArtista()
            ? estado.perfilArtista?.nome
            : "",

        estado.perfil?.nome_exibicao,

        estado.perfil?.nome,

        usuarioPerfil.nome,

        usuarioPerfil.nome_completo,

        "usuário"

    );

}


/* =====================================================
   TELEFONE DO PERFIL
   ===================================================== */

function obterTelefonePerfil() {

    const usuarioPerfil =
        estado.usuarioPerfil ||
        {};


    return obterPrimeiroValor(

        ehArtista()
            ? estado.perfilArtista?.telefone
            : "",

        ehArtista()
            ? estado.perfilArtista?.whatsapp
            : "",

        estado.perfil?.telefone,

        estado.perfil?.whatsapp,

        usuarioPerfil.telefone,

        usuarioPerfil.whatsapp

    );

}


/* =====================================================
   REGRAS DE VISIBILIDADE
   ===================================================== */

function aplicarRegras() {

    const visualizar =
        obterElemento(
            CONFIG.botoes.visualizar
        );


    const editar =
        obterElemento(
            CONFIG.botoes.editar
        );


    const whatsapp =
        obterElemento(
            CONFIG.botoes.whatsapp
        );


    const curtir =
        obterElemento(
            CONFIG.botoes.curtir
        );


    const salvar =
        obterElemento(
            CONFIG.botoes.salvar
        );


    /*
     * -----------------------------------------------------
     * AÇÕES EXCLUSIVAS DO PROPRIETÁRIO
     * -----------------------------------------------------
     *
     * Visualizar perfil e Editar perfil só aparecem
     * quando o usuário está vendo o próprio perfil.
     */

    aplicarVisibilidade(
        visualizar,
        estado.ehMeuPerfil
    );


    aplicarVisibilidade(
        editar,
        estado.ehMeuPerfil
    );


    /*
     * -----------------------------------------------------
     * AÇÕES DO VISITANTE
     * -----------------------------------------------------
     *
     * Curtir e Salvar aparecem somente quando estamos
     * visualizando o perfil de outra pessoa.
     */

    aplicarVisibilidade(
        curtir,
        !estado.ehMeuPerfil
    );


    aplicarVisibilidade(
        salvar,
        !estado.ehMeuPerfil
    );


    /*
     * O WhatsApp também é uma ação sobre o perfil
     * de outra pessoa.
     *
     * Por isso, quando o botão existir, ele não será
     * exibido no próprio perfil.
     */

    aplicarVisibilidade(
        whatsapp,
        !estado.ehMeuPerfil
    );


    atualizarEstadoVisualCurtida();


    atualizarEstadoVisualSalvo();


    log(
        "Regras de interação aplicadas:",
        {

            ehMeuPerfil:
                estado.ehMeuPerfil,

            visualizar:
                Boolean(
                    visualizar &&
                    !visualizar.hidden
                ),

            editar:
                Boolean(
                    editar &&
                    !editar.hidden
                ),

            whatsapp:
                Boolean(
                    whatsapp &&
                    !whatsapp.hidden
                ),

            curtir:
                Boolean(
                    curtir &&
                    !curtir.hidden
                ),

            salvar:
                Boolean(
                    salvar &&
                    !salvar.hidden
                )

        }
    );

}


/* =====================================================
   APLICAR VISIBILIDADE
   ===================================================== */

function aplicarVisibilidade(
    elemento,
    visivel
) {

    if (!elemento) {
        return;
    }


    elemento.hidden =
        !visivel;


    elemento.style.display =
        visivel
            ? ""
            : "none";


    elemento.setAttribute(
        "aria-hidden",
        visivel
            ? "false"
            : "true"
    );

}


/* =====================================================
   CONFIGURAR EVENTOS
   ===================================================== */

function configurarEventos() {

    const visualizar =
        obterElemento(
            CONFIG.botoes.visualizar
        );


    const editar =
        obterElemento(
            CONFIG.botoes.editar
        );


    const whatsapp =
        obterElemento(
            CONFIG.botoes.whatsapp
        );


    const curtir =
        obterElemento(
            CONFIG.botoes.curtir
        );


    const salvar =
        obterElemento(
            CONFIG.botoes.salvar
        );


    /*
     * -----------------------------------------------------
     * VISUALIZAR
     * -----------------------------------------------------
     *
     * A navegação continua pertencendo ao PerfilPublico.js.
     *
     * Por isso este módulo não adiciona listener ao botão.
     */

    /*
     * -----------------------------------------------------
     * EDITAR
     * -----------------------------------------------------
     *
     * A navegação também continua pertencendo ao
     * PerfilPublico.js.
     */

    /*
     * -----------------------------------------------------
     * WHATSAPP
     * -----------------------------------------------------
     */

    if (whatsapp) {

        whatsapp.addEventListener(
            "click",
            compartilharWhatsApp
        );

    }


    /*
     * -----------------------------------------------------
     * CURTIR
     * -----------------------------------------------------
     */

    if (curtir) {

        curtir.addEventListener(
            "click",
            alternarCurtida
        );

    }


    /*
     * -----------------------------------------------------
     * SALVAR
     * -----------------------------------------------------
     */

    if (salvar) {

        salvar.addEventListener(
            "click",
            alternarSalvo
        );

    }


    log(
        "Eventos de interação configurados."
    );

}


/* =====================================================
   CURTIR PERFIL
   ===================================================== */

async function alternarCurtida() {

    if (
        estado.ehMeuPerfil
    ) {

        aviso(
            "O próprio perfil não pode ser curtido."
        );


        return;

    }


    if (!estado.perfilId) {

        mostrarToast(
            "Perfil ainda não identificado.",
            "erro"
        );


        return;

    }


    /*
     * A persistência no Supabase será adicionada quando
     * definirmos a tabela de curtidas.
     *
     * Por enquanto, mantemos somente o estado visual
     * desta sessão.
     */

    estado.curtido =
        !estado.curtido;


    atualizarEstadoVisualCurtida();


    mostrarToast(
        estado.curtido
            ? "Perfil curtido."
            : "Curtida removida.",
        "sucesso"
    );


    log(
        "Estado de curtida alterado:",
        {

            perfilId:
                estado.perfilId,

            curtido:
                estado.curtido

        }
    );

}


/* =====================================================
   SALVAR PERFIL
   ===================================================== */

async function alternarSalvo() {

    if (
        estado.ehMeuPerfil
    ) {

        aviso(
            "O próprio perfil não pode ser salvo."
        );


        return;

    }


    if (!estado.perfilId) {

        mostrarToast(
            "Perfil ainda não identificado.",
            "erro"
        );


        return;

    }


    /*
     * A persistência no Supabase será adicionada quando
     * definirmos a tabela de perfis salvos/favoritos.
     *
     * Por enquanto, mantemos somente o estado visual
     * desta sessão.
     */

    estado.salvo =
        !estado.salvo;


    atualizarEstadoVisualSalvo();


    mostrarToast(
        estado.salvo
            ? "Perfil salvo."
            : "Perfil removido dos salvos.",
        "sucesso"
    );


    log(
        "Estado de salvo alterado:",
        {

            perfilId:
                estado.perfilId,

            salvo:
                estado.salvo

        }
    );

}


/* =====================================================
   ATUALIZAR VISUAL DA CURTIDA
   ===================================================== */

function atualizarEstadoVisualCurtida() {

    const botao =
        obterElemento(
            CONFIG.botoes.curtir
        );


    if (!botao) {
        return;
    }


    botao.classList.toggle(
        "active",
        estado.curtido
    );


    botao.setAttribute(
        "aria-pressed",
        estado.curtido
            ? "true"
            : "false"
    );


    botao.setAttribute(
        "aria-label",
        estado.curtido
            ? "Descurtir perfil"
            : "Curtir perfil"
    );


    botao.setAttribute(
        "title",
        estado.curtido
            ? "Descurtir perfil"
            : "Curtir perfil"
    );

}


/* =====================================================
   ATUALIZAR VISUAL DO SALVO
   ===================================================== */

function atualizarEstadoVisualSalvo() {

    const botao =
        obterElemento(
            CONFIG.botoes.salvar
        );


    if (!botao) {
        return;
    }


    botao.classList.toggle(
        "active",
        estado.salvo
    );


    botao.setAttribute(
        "aria-pressed",
        estado.salvo
            ? "true"
            : "false"
    );


    botao.setAttribute(
        "aria-label",
        estado.salvo
            ? "Remover dos salvos"
            : "Salvar perfil"
    );


    botao.setAttribute(
        "title",
        estado.salvo
            ? "Remover dos salvos"
            : "Salvar perfil"
    );

}


/* =====================================================
   WHATSAPP
   ===================================================== */

function compartilharWhatsApp() {

    if (
        estado.ehMeuPerfil
    ) {

        aviso(
            "O WhatsApp não deve ser aberto através da ação do próprio perfil."
        );


        return;

    }


    const nome =
        obterNomePerfil();


    const mensagem =
        "Olá! Vi seu perfil no MusicalWorld e gostaria de conversar com você sobre um possível trabalho.";


    const telefone =
        obterTelefonePerfil();


    if (!telefone) {

        mostrarToast(
            `O WhatsApp de ${nome} não está informado.`,
            "erro"
        );


        return;

    }


    const numero =
        String(
            telefone
        ).replace(
            /\D/g,
            ""
        );


    if (!numero) {

        mostrarToast(
            "Número de WhatsApp inválido.",
            "erro"
        );


        return;

    }


    const url =
        `https://wa.me/${numero}?text=${encodeURIComponent(
            mensagem
        )}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );


    log(
        "WhatsApp aberto para o perfil:",
        {

            perfilId:
                estado.perfilId,

            nome,

            numero

        }
    );

}


/* =====================================================
   TOAST
   ===================================================== */

function mostrarToast(
    mensagem,
    tipo = "sucesso"
) {

    if (
        Utils &&
        typeof Utils.mostrarToast === "function"
    ) {

        Utils.mostrarToast(
            mensagem,
            tipo
        );


        return;

    }


    const toast =
        obterElemento(
            CONFIG.toast.elemento
        );


    const toastMessage =
        obterElemento(
            CONFIG.toast.mensagem
        );


    if (!toast) {
        return;
    }


    if (toastMessage) {

        toastMessage.textContent =
            mensagem;

    }


    toast.classList.remove(
        "show",
        "sucesso",
        "erro"
    );


    toast.classList.add(
        tipo,
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =====================================================
   INICIALIZAR
   ===================================================== */

function inicializar(
    novoEstado
) {

    configurarEstado(
        novoEstado
    );


    configurarEventos();


    aplicarRegras();


    estado.inicializado =
        true;


    log(
        "PerfilPublicoInteracoes inicializado.",
        {

            perfilId:
                estado.perfilId,

            ehMeuPerfil:
                estado.ehMeuPerfil

        }
    );

}


/* =====================================================
   ATUALIZAR
   ===================================================== */

function atualizar(
    novoEstado
) {

    configurarEstado(
        novoEstado
    );


    aplicarRegras();

}


/* =====================================================
   RESETAR ESTADO
   ===================================================== */

function resetar() {

    estado.curtido =
        false;


    estado.salvo =
        false;


    estado.inicializado =
        false;


    atualizarEstadoVisualCurtida();


    atualizarEstadoVisualSalvo();

}


/* =====================================================
   OBTER ESTADO
   ===================================================== */

function obterEstado() {

    return {

        perfilId:
            estado.perfilId,

        usuarioId:
            estado.usuarioId,

        ehMeuPerfil:
            estado.ehMeuPerfil,

        curtido:
            estado.curtido,

        salvo:
            estado.salvo,

        inicializado:
            estado.inicializado

    };

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const PerfilPublicoInteracoes = {

    CONFIG,

    estado,

    inicializar,

    atualizar,

    resetar,

    obterEstado,

    aplicarRegras,

    alternarCurtida,

    alternarSalvo,

    compartilharWhatsApp

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.PerfilPublicoInteracoes =
    PerfilPublicoInteracoes;


console.log(
    "PerfilPublicoInteracoes.js — módulo de interações carregado."
);


})(window);