/* =========================================================
MUSICALWORLD — ANIMAÇÃO DO ÍCONE FINANCEIRO

Arquivo:
js/components/animacao-financeiro.js

Responsabilidades:

* Controlar exclusivamente a animação visual do ícone
  Financeiro do menu inferior.
* Utilizar o próprio ícone de carteira já existente.
* Criar um efeito visual de pulsação.
* Criar feixes de luz ao redor da carteira.
* Controlar o contador visual de novidades financeiras.

IMPORTANTE:

* Este arquivo NÃO acessa o Supabase.
* Este arquivo NÃO consulta pagamentos.
* Este arquivo NÃO altera contratos.
* Este arquivo NÃO altera saldo.
* Este arquivo NÃO executa nenhuma lógica financeira.

API pública:

* inicializar()
* notificar(quantidade)
* definirQuantidade(quantidade)
* obterQuantidade()
* marcarComoVisualizado()
* possuiNovidades()
* testar()
  ========================================================= */

(function (window, document) {


"use strict";


/* =========================================================
   ESTADO INTERNO
   ========================================================= */

const estado = {

    inicializado: false,

    executando: false,

    quantidade: 0,

    botao: null,

    wrapper: null,

    carteira: null,

    luzes: null,

    badge: null

};


/* =========================================================
   UTILITÁRIO — ESPERA
   ========================================================= */

function esperar(tempo) {

    return new Promise(function (resolve) {

        window.setTimeout(resolve, tempo);

    });

}


/* =========================================================
   LOCALIZA O BOTÃO FINANCEIRO
   ========================================================= */

function localizarBotao() {

    return document.getElementById(
        "nav-item-financeiro"
    );

}


/* =========================================================
   PREPARA O WRAPPER
   ========================================================= */

function prepararWrapper() {

    const botao = localizarBotao();

    if (!botao) {

        return false;

    }

    estado.botao = botao;


    /*
     * O menu já possui o SVG da carteira.
     *
     * Nós apenas criamos um wrapper ao redor dele.
     * O SVG original continua sendo o mesmo.
     */
    let wrapper =
        botao.querySelector(
            ".financeiro-animation-wrapper"
        );


    if (!wrapper) {

        const carteira =
            botao.querySelector(
                ".nav-icon-svg"
            );

        if (!carteira) {

            return false;

        }

        wrapper =
            document.createElement("span");

        wrapper.className =
            "financeiro-animation-wrapper";

        carteira.parentNode.insertBefore(
            wrapper,
            carteira
        );

        wrapper.appendChild(carteira);

    }


    estado.wrapper = wrapper;

    estado.carteira =
        wrapper.querySelector(
            ".nav-icon-svg"
        );


    if (!estado.carteira) {

        return false;

    }


    /*
     * Cria a camada visual das luzes.
     *
     * Essa camada fica atrás da carteira.
     */
    criarLuzes();


    return true;

}


/* =========================================================
   CRIA OS FEIXES DE LUZ
   ========================================================= */

function criarLuzes() {

    if (!estado.wrapper) {

        return false;

    }


    let luzes =
        estado.wrapper.querySelector(
            ".financeiro-luzes"
        );


    if (!luzes) {

        luzes =
            document.createElement("span");

        luzes.className =
            "financeiro-luzes";

        luzes.setAttribute(
            "aria-hidden",
            "true"
        );


        /*
         * Cada span representa um feixe de luz.
         */
        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const feixe =
                document.createElement("span");

            feixe.className =
                "financeiro-feixe";

            feixe.style.setProperty(
                "--financeiro-feixe",
                i
            );

            luzes.appendChild(feixe);

        }


        /*
         * Coloca as luzes ANTES da carteira.
         *
         * Assim elas ficam atrás do ícone.
         */
        estado.wrapper.insertBefore(
            luzes,
            estado.carteira
        );

    }


    estado.luzes = luzes;

    return true;

}


/* =========================================================
   CRIA / LOCALIZA BADGE
   ========================================================= */

function prepararBadge() {

    if (!estado.botao) {

        return;

    }


    let badge =
        estado.botao.querySelector(
            ".financeiro-notificacao-badge"
        );


    if (!badge) {

        badge =
            document.createElement("span");

        badge.className =
            "financeiro-notificacao-badge";

        badge.setAttribute(
            "aria-hidden",
            "true"
        );

        estado.botao.appendChild(
            badge
        );

    }


    estado.badge = badge;

    atualizarBadge();

}


/* =========================================================
   ATUALIZA BADGE
   ========================================================= */

function atualizarBadge() {

    if (!estado.badge) {

        return;

    }


    if (estado.quantidade <= 0) {

        estado.badge.style.display =
            "none";

        estado.badge.textContent =
            "0";

        return;

    }


    estado.badge.textContent =
        estado.quantidade > 99
            ? "99+"
            : String(estado.quantidade);


    estado.badge.style.display =
        "flex";

}


/* =========================================================
   REINICIA ANIMAÇÃO VISUAL
   ========================================================= */

function reiniciarAnimacao() {

    if (!estado.wrapper) {

        return;

    }


    estado.wrapper.classList.remove(
        "financeiro-animando"
    );


    estado.wrapper.classList.remove(
        "financeiro-luzes-ativas"
    );


    /*
     * Força o navegador a reconstruir o ciclo
     * da animação CSS.
     */
    void estado.wrapper.offsetWidth;

}


/* =========================================================
   EXECUTA A ANIMAÇÃO
   ========================================================= */

async function executarAnimacao() {

    if (estado.executando) {

        return;

    }


    if (!estado.inicializado) {

        if (!inicializar()) {

            return;

        }

    }


    if (!estado.wrapper ||
        !estado.carteira ||
        !estado.luzes) {

        return;

    }


    estado.executando = true;


    try {

        /*
         * Garante que não existe animação anterior.
         */
        reiniciarAnimacao();


        /*
         * 1. Ativa a pulsação da carteira.
         */
        estado.wrapper.classList.add(
            "financeiro-animando"
        );


        /*
         * 2. Ativa os feixes de luz.
         */
        estado.wrapper.classList.add(
            "financeiro-luzes-ativas"
        );


        /*
         * A animação visual completa dura aproximadamente
         * 800ms.
         */
        await esperar(850);


        /*
         * Remove as classes para deixar o ícone
         * exatamente no estado original.
         */
        estado.wrapper.classList.remove(
            "financeiro-animando"
        );


        estado.wrapper.classList.remove(
            "financeiro-luzes-ativas"
        );


    } finally {

        estado.executando = false;

    }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function inicializar() {

    if (estado.inicializado) {

        return true;

    }


    if (!prepararWrapper()) {

        return false;

    }


    prepararBadge();


    estado.inicializado = true;


    return true;

}


/* =========================================================
   NOTIFICAR
   ========================================================= */

function notificar(quantidade) {

    if (!estado.inicializado) {

        if (!inicializar()) {

            return;

        }

    }


    const valor =
        Number.isFinite(
            Number(quantidade)
        )
            ? Number(quantidade)
            : 1;


    estado.quantidade +=
        Math.max(
            1,
            Math.floor(valor)
        );


    atualizarBadge();


    executarAnimacao();

}


/* =========================================================
   DEFINE QUANTIDADE
   ========================================================= */

function definirQuantidade(quantidade) {

    if (!estado.inicializado) {

        inicializar();

    }


    const valor =
        Number(quantidade);


    estado.quantidade =
        Number.isFinite(valor) &&
        valor > 0
            ? Math.floor(valor)
            : 0;


    atualizarBadge();

}


/* =========================================================
   OBTÉM QUANTIDADE
   ========================================================= */

function obterQuantidade() {

    return estado.quantidade;

}


/* =========================================================
   MARCA COMO VISUALIZADO
   ========================================================= */

function marcarComoVisualizado() {

    estado.quantidade = 0;

    atualizarBadge();

}


/* =========================================================
   VERIFICA SE EXISTEM NOVIDADES
   ========================================================= */

function possuiNovidades() {

    return estado.quantidade > 0;

}


/* =========================================================
   TESTE MANUAL
   ========================================================= */

function testar() {

    if (!inicializar()) {

        console.warn(
            "MusicalWorldAnimacaoFinanceiro: " +
            "ícone Financeiro não encontrado."
        );

        return;

    }


    notificar(1);

}


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.MusicalWorldAnimacaoFinanceiro = {

    inicializar:
        inicializar,

    notificar:
        notificar,

    definirQuantidade:
        definirQuantidade,

    obterQuantidade:
        obterQuantidade,

    marcarComoVisualizado:
        marcarComoVisualizado,

    possuiNovidades:
        possuiNovidades,

    testar:
        testar

};


/* =========================================================
   INICIALIZAÇÃO AUTOMÁTICA
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializar
    );

} else {

    inicializar();

}


})(window, document);
