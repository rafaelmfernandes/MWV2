/* =========================================================
MUSICALWORLD — APRESENTAÇÃO DE PERFIL — TESTE

Arquivo:
js/apresentar-perfil-teste.js

Responsabilidades:

* Controlar as interações da página de teste.
* Abrir e fechar o menu de opções.
* Controlar o botão de voltar.
* Controlar a expansão da mídia.
* Manter toda a lógica independente do Supabase.

Nesta versão não existem ações de:

* Curtir
* Comentar
* Compartilhar
* Salvar

Essas ações serão adicionadas posteriormente no local
definido para o novo design.
========================================================= */

(function (window, document) {


"use strict";


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    seletores: {

        menu:
            "#actionMenu",

        botaoAcao:
            "[data-action]",

        botaoMenuAcao:
            "[data-menu-action]",

        backdropMenu:
            ".action-menu-backdrop"

    }

};


/* =====================================================
   ESTADO
   ===================================================== */

const estado = {

    perfilMenuAtual:
        null

};


/* =====================================================
   ELEMENTOS
   ===================================================== */

const elementos = {

    menu:
        document.querySelector(
            CONFIG.seletores.menu
        )

};


/* =====================================================
   UTILITÁRIO — OBTER PERFIL
   ===================================================== */

function obterPerfil(elemento) {

    const perfil =
        elemento.closest(
            ".profile-post"
        );

    if (!perfil) {

        return null;

    }

    return perfil;

}


/* =====================================================
   UTILITÁRIO — ID DO PERFIL
   ===================================================== */

function obterIdPerfil(perfil) {

    if (!perfil) {

        return null;

    }

    return perfil.dataset.profile || null;

}


/* =====================================================
   MENSAGEM DE TESTE
   ===================================================== */

function mostrarMensagem(mensagem) {

    /*
     * Temporariamente utilizamos alert para confirmar
     * as interações.
     *
     * Depois podemos substituir por um componente
     * visual próprio do MusicalWorld.
     */

    window.alert(
        mensagem
    );

}


/* =====================================================
   ABRIR MENU
   ===================================================== */

function abrirMenu(perfil) {

    if (!elementos.menu) {

        return;

    }


    estado.perfilMenuAtual =
        obterIdPerfil(perfil);


    elementos.menu.classList.add(
        "is-open"
    );


    elementos.menu.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   FECHAR MENU
   ===================================================== */

function fecharMenu() {

    if (!elementos.menu) {

        return;

    }


    elementos.menu.classList.remove(
        "is-open"
    );


    elementos.menu.setAttribute(
        "aria-hidden",
        "true"
    );


    estado.perfilMenuAtual =
        null;


    document.body.style.overflow =
        "";

}


/* =====================================================
   PROCESSAR AÇÃO DO MENU
   ===================================================== */

function processarMenuAcao(botao) {

    const acao =
        botao.dataset.menuAction;


    if (!acao) {

        return;

    }


    if (acao === "cancel") {

        fecharMenu();

        return;

    }


    if (acao === "report") {

        fecharMenu();


        mostrarMensagem(
            "A opção de denúncia será conectada ao sistema do MusicalWorld posteriormente."
        );


        return;

    }


    if (acao === "copy") {

        copiarLinkPerfil();

        return;

    }

}


/* =====================================================
   COPIAR LINK
   ===================================================== */

async function copiarLinkPerfil() {

    const id =
        estado.perfilMenuAtual;


    const url =
        `${window.location.origin}${window.location.pathname}?id=${id}`;


    try {

        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            await navigator.clipboard.writeText(
                url
            );

        }


        fecharMenu();


        mostrarMensagem(
            "Link do perfil copiado."
        );

    } catch (erro) {

        console.error(
            "Erro ao copiar link:",
            erro
        );


        fecharMenu();


        mostrarMensagem(
            "Não foi possível copiar o link."
        );

    }

}


/* =====================================================
   EXPANDIR MÍDIA
   ===================================================== */

function expandirMidia(botao) {

    const perfil =
        obterPerfil(botao);


    if (!perfil) {

        return;

    }


    const media =
        perfil.querySelector(
            ".profile-media"
        );


    if (!media) {

        return;

    }


    if (
        !document.fullscreenEnabled
    ) {

        mostrarMensagem(
            "Tela cheia não está disponível neste navegador."
        );

        return;

    }


    if (
        !document.fullscreenElement
    ) {

        media
            .requestFullscreen()
            .catch(function (erro) {

                console.error(
                    "Erro ao abrir tela cheia:",
                    erro
                );

            });


        return;

    }


    document
        .exitFullscreen()
        .catch(function (erro) {

            console.error(
                "Erro ao sair da tela cheia:",
                erro
            );

        });

}


/* =====================================================
   VOLTAR
   ===================================================== */

function voltar() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

        return;

    }


    mostrarMensagem(
        "Aqui retornaremos para a página anterior do MusicalWorld."
    );

}


/* =====================================================
   PROCESSAR AÇÃO
   ===================================================== */

function processarAcao(botao) {

    const acao =
        botao.dataset.action;


    const perfil =
        obterPerfil(botao);


    if (
        acao === "menu"
    ) {

        abrirMenu(
            perfil
        );

        return;

    }


    if (
        acao === "expand"
    ) {

        expandirMidia(
            botao
        );

        return;

    }


    if (
        acao === "back"
    ) {

        voltar();

    }

}


/* =====================================================
   CONFIGURAR EVENTOS
   ===================================================== */

function configurarEventos() {

    document.addEventListener(
        "click",
        function (evento) {


            const botaoAcao =
                evento.target.closest(
                    CONFIG.seletores.botaoAcao
                );


            if (botaoAcao) {

                processarAcao(
                    botaoAcao
                );

                return;

            }


            const botaoMenuAcao =
                evento.target.closest(
                    CONFIG.seletores.botaoMenuAcao
                );


            if (botaoMenuAcao) {

                processarMenuAcao(
                    botaoMenuAcao
                );

                return;

            }


            const backdrop =
                evento.target.closest(
                    CONFIG.seletores.backdropMenu
                );


            if (backdrop) {

                fecharMenu();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Escape"
            ) {

                fecharMenu();

            }

        }
    );

}


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

function inicializar() {

    configurarEventos();


    console.log(
        "MusicalWorld — apresentação de perfil de teste carregada."
    );

}


/* =====================================================
   EXECUÇÃO
   ===================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializar
    );

} else {

    inicializar();

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

window.MusicalWorldApresentarPerfilTeste = {

    abrirMenu,

    fecharMenu,

    expandirMidia

};


})(window, document);
