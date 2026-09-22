/* =========================================================
   MUSICALWORLD — MODAL DE RECUPERAÇÃO DE SENHA

   Arquivo:
   js/components/modal-recuperar-senha.js

   Responsabilidade:
   - Criar o modal de recuperação de senha.
   - Abrir e fechar o modal.
   - Capturar o e-mail informado pelo usuário.
   - Chamar Login.recuperarSenha(email).
   - Exibir mensagens de sucesso ou erro dentro do modal.
   - Nunca utilizar alert() ou prompt().
   - Manter a lógica de autenticação em js/auth/Login.js.
   ========================================================= */

(function (window, document) {

    "use strict";


    /* =====================================================
       NAMESPACE
       ===================================================== */

    const MusicalWorldModalRecuperarSenha = {

        container: null,

        modal: null,

        inputEmail: null,

        mensagem: null,

        botaoEnviar: null,

        botaoCancelar: null,

        botaoFechar: null,

        inicializado: false,


        /* =================================================
           INICIALIZAÇÃO
           ================================================= */

        iniciar() {

            if (this.inicializado) {
                return;
            }

            this.inicializado = true;

            this.criar();

        },


        /* =================================================
           CRIAÇÃO DO MODAL
           ================================================= */

        criar() {

            if (document.getElementById("mw-recuperacao-modal-container")) {

                this.obterElementos();

                return;
            }


            const container = document.createElement("div");

            container.id = "mw-recuperacao-modal-container";

            container.className =
                "mw-recuperacao-modal-container";


            container.innerHTML = `

                <div
                    class="mw-recuperacao-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mw-recuperacao-titulo"
                >

                    <button
                        type="button"
                        class="mw-recuperacao-fechar"
                        id="mw-recuperacao-fechar"
                        aria-label="Fechar"
                        title="Fechar"
                    >

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                        </svg>

                    </button>


                    <div class="mw-recuperacao-conteudo">

                        <div class="mw-recuperacao-icone">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <rect
                                    width="18"
                                    height="11"
                                    x="3"
                                    y="11"
                                    rx="2"
                                    ry="2"
                                ></rect>

                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>

                            </svg>

                        </div>


                        <h2
                            class="mw-recuperacao-titulo"
                            id="mw-recuperacao-titulo"
                        >
                            Redefinir senha
                        </h2>


                        <p class="mw-recuperacao-descricao">

                            Informe o e-mail associado à sua conta.
                            Enviaremos um link para você criar uma
                            nova senha.

                        </p>


                        <form
                            class="mw-recuperacao-form"
                            id="mw-recuperacao-form"
                            novalidate
                        >

                            <div>

                                <label
                                    class="mw-recuperacao-label"
                                    for="mw-recuperacao-email"
                                >
                                    E-mail
                                </label>


                                <input
                                    type="email"
                                    id="mw-recuperacao-email"
                                    class="mw-recuperacao-input"
                                    name="email"
                                    autocomplete="email"
                                    inputmode="email"
                                    placeholder="Digite seu e-mail"
                                    maxlength="254"
                                    required
                                >

                            </div>


                            <div
                                id="mw-recuperacao-mensagem"
                                class="mw-recuperacao-mensagem"
                                role="status"
                                aria-live="polite"
                            ></div>


                            <div class="mw-recuperacao-acoes">

                                <button
                                    type="button"
                                    class="mw-recuperacao-btn-cancelar"
                                    id="mw-recuperacao-cancelar"
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    class="mw-recuperacao-btn-enviar"
                                    id="mw-recuperacao-enviar"
                                >
                                    Enviar link
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            `;


            document.body.appendChild(container);


            this.obterElementos();

            this.configurarEventos();

        },


        /* =================================================
           OBTÉM ELEMENTOS
           ================================================= */

        obterElementos() {

            this.container = document.getElementById(
                "mw-recuperacao-modal-container"
            );

            if (!this.container) {
                return;
            }


            this.modal =
                this.container.querySelector(
                    ".mw-recuperacao-modal"
                );


            this.inputEmail =
                document.getElementById(
                    "mw-recuperacao-email"
                );


            this.mensagem =
                document.getElementById(
                    "mw-recuperacao-mensagem"
                );


            this.botaoEnviar =
                document.getElementById(
                    "mw-recuperacao-enviar"
                );


            this.botaoCancelar =
                document.getElementById(
                    "mw-recuperacao-cancelar"
                );


            this.botaoFechar =
                document.getElementById(
                    "mw-recuperacao-fechar"
                );
        },


        /* =================================================
           EVENTOS
           ================================================= */

        configurarEventos() {

            if (!this.container) {
                return;
            }


            const formulario =
                document.getElementById(
                    "mw-recuperacao-form"
                );


            if (formulario) {

                formulario.addEventListener(
                    "submit",
                    (evento) => {

                        evento.preventDefault();

                        this.enviar();

                    }
                );

            }


            if (this.botaoCancelar) {

                this.botaoCancelar.addEventListener(
                    "click",
                    () => {

                        this.fechar();

                    }
                );

            }


            if (this.botaoFechar) {

                this.botaoFechar.addEventListener(
                    "click",
                    () => {

                        this.fechar();

                    }
                );

            }


            this.container.addEventListener(
                "click",
                (evento) => {

                    if (evento.target === this.container) {

                        this.fechar();

                    }

                }
            );


            document.addEventListener(
                "keydown",
                (evento) => {

                    if (
                        evento.key === "Escape" &&
                        this.estaAberto()
                    ) {

                        this.fechar();

                    }

                }
            );
        },


        /* =================================================
           ABRIR
           ================================================= */

        abrir(emailInicial = "") {

            this.iniciar();


            this.limparMensagem();


            if (this.inputEmail) {

                this.inputEmail.value =
                    (emailInicial || "").trim();

            }


            if (this.botaoEnviar) {

                this.botaoEnviar.disabled = false;

                this.botaoEnviar.textContent =
                    "Enviar link";

            }


            if (this.botaoCancelar) {

                this.botaoCancelar.disabled = false;

            }


            this.container.classList.add(
                "mw-modal-aberto"
            );


            document.body.style.overflow = "hidden";


            window.setTimeout(() => {

                if (this.inputEmail) {

                    this.inputEmail.focus();

                }

            }, 50);

        },


        /* =================================================
           FECHAR
           ================================================= */

        fechar() {

            if (!this.container) {
                return;
            }


            this.container.classList.remove(
                "mw-modal-aberto"
            );


            document.body.style.overflow = "";


            this.limparMensagem();

        },


        /* =================================================
           VERIFICA SE ESTÁ ABERTO
           ================================================= */

        estaAberto() {

            return !!(
                this.container &&
                this.container.classList.contains(
                    "mw-modal-aberto"
                )
            );

        },


        /* =================================================
           ENVIO
           ================================================= */

        async enviar() {

            if (!this.inputEmail) {
                return;
            }


            const email =
                this.inputEmail.value
                    .trim()
                    .toLowerCase();


            if (!email) {

                this.mostrarMensagem(
                    "Informe seu e-mail.",
                    "erro"
                );

                this.inputEmail.focus();

                return;
            }


            if (!this.validarEmail(email)) {

                this.mostrarMensagem(
                    "Informe um endereço de e-mail válido.",
                    "erro"
                );

                this.inputEmail.focus();

                return;
            }


            if (
                !window.Login ||
                typeof window.Login.recuperarSenha !==
                    "function"
            ) {

                this.mostrarMensagem(
                    "Não foi possível iniciar a recuperação da senha. Recarregue a página e tente novamente.",
                    "erro"
                );

                return;
            }


            this.definirCarregando(true);


            this.limparMensagem();


            try {

                const resultado =
                    await window.Login.recuperarSenha(
                        email
                    );


                if (
                    resultado &&
                    resultado.sucesso
                ) {

                    this.mostrarSucesso(
                        resultado.mensagem ||
                        "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
                    );

                    return;
                }


                this.mostrarMensagem(
                    (
                        resultado &&
                        resultado.mensagem
                    ) ||
                    "Não foi possível solicitar a recuperação da senha.",
                    "erro"
                );

            } catch (erro) {

                console.error(
                    "MusicalWorld — erro ao recuperar senha:",
                    erro
                );


                this.mostrarMensagem(
                    "Ocorreu um erro ao solicitar a recuperação da senha. Tente novamente.",
                    "erro"
                );

            } finally {

                this.definirCarregando(false);

            }
        },


        /* =================================================
           VALIDAÇÃO BÁSICA DE E-MAIL
           ================================================= */

        validarEmail(email) {

            const expressao =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return expressao.test(email);

        },


        /* =================================================
           ESTADO DE CARREGAMENTO
           ================================================= */

        definirCarregando(carregando) {

            if (this.botaoEnviar) {

                this.botaoEnviar.disabled =
                    carregando;

                this.botaoEnviar.textContent =
                    carregando
                        ? "Enviando..."
                        : "Enviar link";

            }


            if (this.botaoCancelar) {

                this.botaoCancelar.disabled =
                    carregando;

            }


            if (this.botaoFechar) {

                this.botaoFechar.disabled =
                    carregando;

            }
        },


        /* =================================================
           MENSAGEM
           ================================================= */

        mostrarMensagem(texto, tipo = "erro") {

            if (!this.mensagem) {
                return;
            }


            this.mensagem.textContent = texto;


            this.mensagem.className =
                "mw-recuperacao-mensagem " +
                "mw-mensagem-visivel " +
                (
                    tipo === "sucesso"
                        ? "mw-mensagem-sucesso"
                        : "mw-mensagem-erro"
                );

        },


        /* =================================================
           LIMPA MENSAGEM
           ================================================= */

        limparMensagem() {

            if (!this.mensagem) {
                return;
            }


            this.mensagem.textContent = "";


            this.mensagem.className =
                "mw-recuperacao-mensagem";

        },


        /* =================================================
           SUCESSO
           ================================================= */

        mostrarSucesso(texto) {

            if (!this.modal) {
                return;
            }


            this.modal.innerHTML = `

                <button
                    type="button"
                    class="mw-recuperacao-fechar"
                    id="mw-recuperacao-fechar"
                    aria-label="Fechar"
                    title="Fechar"
                >

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>

                </button>


                <div
                    class="mw-recuperacao-conteudo mw-recuperacao-sucesso"
                >

                    <div class="mw-recuperacao-icone">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20 6 9 17l-5-5"></path>
                        </svg>

                    </div>


                    <h2
                        class="mw-recuperacao-titulo"
                        id="mw-recuperacao-titulo"
                    >
                        Verifique seu e-mail
                    </h2>


                    <p class="mw-recuperacao-descricao">
                        ${this.escaparHtml(texto)}
                    </p>


                    <button
                        type="button"
                        class="mw-recuperacao-btn-enviar"
                        id="mw-recuperacao-finalizar"
                    >
                        Entendi
                    </button>

                </div>
            `;


            this.botaoFechar =
                document.getElementById(
                    "mw-recuperacao-fechar"
                );


            const botaoFinalizar =
                document.getElementById(
                    "mw-recuperacao-finalizar"
                );


            if (this.botaoFechar) {

                this.botaoFechar.addEventListener(
                    "click",
                    () => this.fechar()
                );

            }


            if (botaoFinalizar) {

                botaoFinalizar.addEventListener(
                    "click",
                    () => this.fechar()
                );

            }


            this.obterElementos();


            if (botaoFinalizar) {

                window.setTimeout(() => {

                    botaoFinalizar.focus();

                }, 50);

            }

        },


        /* =================================================
           ESCAPA HTML
           ================================================= */

        escaparHtml(valor) {

            const elemento =
                document.createElement("div");

            elemento.textContent =
                String(valor || "");

            return elemento.innerHTML;

        }

    };


    /* =====================================================
       EXPORTAÇÃO
       ===================================================== */

    window.MusicalWorldModalRecuperarSenha =
        MusicalWorldModalRecuperarSenha;


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                MusicalWorldModalRecuperarSenha.iniciar();

            }
        );

    } else {

        MusicalWorldModalRecuperarSenha.iniciar();

    }


})(window, document);