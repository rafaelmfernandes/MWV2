
/* =========================================================
   MUSICALWORLD — MOSTRAR / OCULTAR SENHA

   Arquivo:
   js/auth/MostrarSenha.js

   Responsabilidade:
   - Detectar campos de senha criados dinamicamente.
   - Adicionar o botão de visualização da senha.
   - Manter a senha oculta por padrão.
   - Alternar entre senha oculta e visível.
   - Funcionar no Login e no Cadastro.
   - Funcionar quando os formulários forem recriados.
   - Não alterar a lógica de autenticação.
   ========================================================= */

(function (window, document) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        seletorSenha:
            'input[type="password"]',

        classeContainer:
            "mw-password-field",

        classeBotao:
            "mw-password-toggle"

    };


    /* =====================================================
       ÍCONE — OLHO NORMAL

       Este ícone aparece quando a senha ESTÁ VISÍVEL.

       Ao clicar:
       → a senha será ocultada.
    ===================================================== */

    function obterIconeOlho() {

        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >

                <path
                    d="M2.5 12C2.5 12 6 5.5 12 5.5C18 5.5 21.5 12 21.5 12C21.5 12 18 18.5 12 18.5C6 18.5 2.5 12 2.5 12Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <circle
                    cx="12"
                    cy="12"
                    r="2.8"
                    stroke="currentColor"
                    stroke-width="1.8"
                />

            </svg>
        `;

    }


    /* =====================================================
       ÍCONE — OLHO COM RISCO

       Este ícone aparece quando a senha ESTÁ OCULTA.

       Ao clicar:
       → a senha será mostrada.
    ===================================================== */

    function obterIconeOlhoFechado() {

        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >

                <!-- Risco diagonal -->

                <path
                    d="M3 3L21 21"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />

                <!-- Parte superior do olho -->

                <path
                    d="M10.6 5.75C11.05 5.58 11.52 5.5 12 5.5C18 5.5 21.5 12 21.5 12C21.5 12 20.2 14.42 18.05 16.25"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <!-- Parte inferior do olho -->

                <path
                    d="M6.05 7.65C3.8 9.6 2.5 12 2.5 12C2.5 12 6 18.5 12 18.5C13.15 18.5 14.22 18.25 15.2 17.82"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <!-- Parte interna -->

                <path
                    d="M9.65 9.65C9.08 10.22 8.75 10.98 8.75 12C8.75 13.8 10.2 15.25 12 15.25C13.02 15.25 13.78 14.92 14.35 14.35"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />

            </svg>
        `;

    }


    /* =====================================================
       ATUALIZAR ÍCONE

       REGRA VISUAL DO MUSICALWORLD:

       senha oculta:
       → olho COM RISCO
       → clicar para MOSTRAR

       senha visível:
       → olho NORMAL
       → clicar para OCULTAR
    ===================================================== */

    function atualizarIcone(botao, visivel) {

        if (!botao) {
            return;
        }


        /* =================================================
           SENHA VISÍVEL
        ================================================= */

        if (visivel) {

            /*
             * A senha está aparecendo.
             *
             * Mostramos o olho normal.
             */

            botao.innerHTML =
                obterIconeOlho();


            botao.setAttribute(
                "aria-label",
                "Ocultar senha"
            );


            botao.setAttribute(
                "title",
                "Ocultar senha"
            );

        }


        /* =================================================
           SENHA OCULTA
        ================================================= */

        else {

            /*
             * A senha está escondida.
             *
             * Mostramos o olho com risco.
             */

            botao.innerHTML =
                obterIconeOlhoFechado();


            botao.setAttribute(
                "aria-label",
                "Mostrar senha"
            );


            botao.setAttribute(
                "title",
                "Mostrar senha"
            );

        }

    }


    /* =====================================================
       PREPARAR CAMPO DE SENHA
    ===================================================== */

    function prepararCampo(input) {

        if (!input) {
            return;
        }


        /* =================================================
           EVITA DUPLICAÇÃO
        ================================================= */

        if (
            input.dataset.musicalworldSenhaPreparada === "true"
        ) {

            return;

        }


        /* =================================================
           LOCALIZA O ELEMENTO PAI
        ================================================= */

        const pai =
            input.parentElement;


        if (!pai) {
            return;
        }


        /* =================================================
           CRIA O CONTAINER
        ================================================= */

        const container =
            document.createElement("div");


        container.className =
            CONFIG.classeContainer;


        /*
         * Coloca o container exatamente no lugar
         * onde estava o campo de senha.
         */

        pai.insertBefore(
            container,
            input
        );


        /*
         * Move o input para dentro do container.
         */

        container.appendChild(
            input
        );


        /* =================================================
           CRIA O BOTÃO
        ================================================= */

        const botao =
            document.createElement("button");


        botao.type =
            "button";


        botao.className =
            CONFIG.classeBotao;


        /* =================================================
           ESTADO INICIAL

           A senha começa SEMPRE OCULTA.
        ================================================= */

        let visivel = false;


        /* =================================================
           ÍCONE INICIAL

           Como a senha está oculta:
           → mostra olho com risco.
        ================================================= */

        atualizarIcone(
            botao,
            visivel
        );


        /* =================================================
           EVENTO DE CLIQUE
        ================================================= */

        botao.addEventListener(
            "click",
            function () {

                /*
                 * Inverte o estado da senha.
                 */

                visivel =
                    !visivel;


                /* =========================================
                   ALTERA O TIPO DO CAMPO
                ========================================= */

                if (visivel) {

                    input.type =
                        "text";

                } else {

                    input.type =
                        "password";

                }


                /* =========================================
                   ATUALIZA CLASSE VISUAL
                ========================================= */

                container.classList.toggle(
                    "mw-password-visible",
                    visivel
                );


                /* =========================================
                   ATUALIZA O ÍCONE
                ========================================= */

                atualizarIcone(
                    botao,
                    visivel
                );


                /* =========================================
                   MANTÉM O FOCO NO CAMPO
                ========================================= */

                input.focus();


                /* =========================================
                   COLOCA O CURSOR NO FINAL DA SENHA
                ========================================= */

                try {

                    const tamanho =
                        input.value.length;


                    input.setSelectionRange(
                        tamanho,
                        tamanho
                    );

                } catch (erro) {

                    /*
                     * Alguns navegadores podem não permitir
                     * setSelectionRange em determinadas
                     * situações.
                     */

                }

            }
        );


        /* =================================================
           ADICIONA O BOTÃO
        ================================================= */

        container.appendChild(
            botao
        );


        /* =================================================
           MARCA O CAMPO COMO PREPARADO
        ================================================= */

        input.dataset.musicalworldSenhaPreparada =
            "true";

    }


    /* =====================================================
       PROCURAR CAMPOS DE SENHA
    ===================================================== */

    function prepararCamposExistentes() {

        const campos =
            document.querySelectorAll(
                CONFIG.seletorSenha
            );


        campos.forEach(
            function (campo) {

                prepararCampo(
                    campo
                );

            }
        );

    }


    /* =====================================================
       OBSERVAR FORMULÁRIOS DINÂMICOS

       Login.js e Cadastro.js inserem e removem os
       formulários dentro de #auth-content-container.

       O MutationObserver garante que qualquer novo campo
       de senha também receba o controle.
    ===================================================== */

    function observarNovosCampos() {

        const observer =
            new MutationObserver(
                function (mutations) {

                    let verificar =
                        false;


                    mutations.forEach(
                        function (mutation) {

                            if (
                                mutation.addedNodes &&
                                mutation.addedNodes.length > 0
                            ) {

                                verificar =
                                    true;

                            }

                        }
                    );


                    if (verificar) {

                        prepararCamposExistentes();

                    }

                }
            );


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    function inicializar() {

        /*
         * Procura campos que já existem.
         */

        prepararCamposExistentes();


        /*
         * Começa a observar novos campos.
         */

        observarNovosCampos();


        console.log(
            "MusicalWorld: controle de mostrar/ocultar senha inicializado."
        );

    }


    /* =====================================================
       AGUARDAR DOM
    ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            {
                once: true
            }
        );

    } else {

        inicializar();

    }


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    window.MusicalWorldMostrarSenha = {

        inicializar,

        prepararCampos:
            prepararCamposExistentes

    };


})(window, document);

