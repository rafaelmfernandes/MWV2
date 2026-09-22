/* =========================================================
   MUSICALWORLD — MODAL DE NOVA SENHA

   Arquivo:
   js/components/modal-nova-senha.js

   Responsabilidade:
   - Criar o modal de alteração de senha.
   - Receber a nova senha.
   - Confirmar a nova senha.
   - Chamar Login.alterarSenha().
   - Exibir estados de erro, carregamento e sucesso.
   - Controlar mostrar/ocultar senha.
   - Fechar o modal.
   - Não controla o envio do e-mail de recuperação.
   ========================================================= */

(function (window) {

    "use strict";


    const ModalNovaSenha = {


        container: null,

        modal: null,

        inputSenha: null,

        inputConfirmacao: null,

        mensagem: null,

        botaoAlterar: null,

        botaoCancelar: null,

        botaoFechar: null,

        focoAnterior: null,

        inicializado: false,


        /* =================================================
           INICIALIZAR
           ================================================= */

        iniciar() {

            if (this.inicializado) {

                return;

            }


            this.criarEstrutura();

            this.inicializado = true;


            console.log(
                "Modal de nova senha inicializado."
            );

        },


        /* =================================================
           CRIAR ESTRUTURA
           ================================================= */

        criarEstrutura() {

            let container =
                document.getElementById(
                    "modal-nova-senha-container"
                );


            if (!container) {

                container =
                    document.createElement("div");

                container.id =
                    "modal-nova-senha-container";

                document.body.appendChild(
                    container
                );

            }


            this.container =
                container;


            container.className =
                "mw-nova-senha-modal-container";


            container.innerHTML = `

                <section
                    class="mw-nova-senha-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mw-nova-senha-titulo"
                >

                    <!-- =================================
                         BOTÃO FECHAR
                    ================================== -->

                    <button
                        type="button"
                        class="mw-nova-senha-fechar"
                        aria-label="Fechar"
                        title="Fechar"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <line
                                x1="18"
                                y1="6"
                                x2="6"
                                y2="18"
                            ></line>

                            <line
                                x1="6"
                                y1="6"
                                x2="18"
                                y2="18"
                            ></line>
                        </svg>

                    </button>


                    <!-- =================================
                         CONTEÚDO
                    ================================== -->

                    <div
                        class="mw-nova-senha-conteudo"
                    >

                        <div
                            class="mw-nova-senha-icone"
                            aria-hidden="true"
                        >

                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect
                                    x="3"
                                    y="11"
                                    width="18"
                                    height="10"
                                    rx="2"
                                ></rect>

                                <path
                                    d="M7 11V7a5 5 0 0 1 10 0v4"
                                ></path>

                            </svg>

                        </div>


                        <h2
                            id="mw-nova-senha-titulo"
                            class="mw-nova-senha-titulo"
                        >
                            Criar nova senha
                        </h2>


                        <p
                            class="mw-nova-senha-descricao"
                        >
                            Digite sua nova senha abaixo.
                            Ela será usada para acessar sua
                            conta no MusicalWorld.
                        </p>


                        <!-- =========================
                             FORMULÁRIO
                        ========================== -->

                        <form
                            class="mw-nova-senha-form"
                            novalidate
                        >

                            <!-- =====================
                                 NOVA SENHA
                            ====================== -->

                            <div
                                class="mw-nova-senha-grupo"
                            >

                                <label
                                    for="mw-nova-senha"
                                    class="mw-nova-senha-label"
                                >
                                    Nova senha
                                </label>


                                <div
                                    class="mw-nova-senha-input-wrapper"
                                >

                                    <input
                                        id="mw-nova-senha"
                                        class="mw-nova-senha-input"
                                        type="password"
                                        autocomplete="new-password"
                                        placeholder="Digite sua nova senha"
                                        minlength="6"
                                        required
                                    >


                                    <button
                                        type="button"
                                        class="mw-nova-senha-toggle"
                                        data-target="mw-nova-senha"
                                        aria-label="Mostrar senha"
                                        title="Mostrar senha"
                                    ></button>

                                </div>


                                <div
                                    class="mw-nova-senha-regras"
                                >
                                    A senha deve ter pelo menos
                                    6 caracteres.
                                </div>

                            </div>


                            <!-- =====================
                                 CONFIRMAÇÃO
                            ====================== -->

                            <div
                                class="mw-nova-senha-grupo"
                            >

                                <label
                                    for="mw-confirmar-nova-senha"
                                    class="mw-nova-senha-label"
                                >
                                    Confirmar nova senha
                                </label>


                                <div
                                    class="mw-nova-senha-input-wrapper"
                                >

                                    <input
                                        id="mw-confirmar-nova-senha"
                                        class="mw-nova-senha-input"
                                        type="password"
                                        autocomplete="new-password"
                                        placeholder="Digite a senha novamente"
                                        minlength="6"
                                        required
                                    >


                                    <button
                                        type="button"
                                        class="mw-nova-senha-toggle"
                                        data-target="mw-confirmar-nova-senha"
                                        aria-label="Mostrar senha"
                                        title="Mostrar senha"
                                    ></button>

                                </div>

                            </div>


                            <!-- =====================
                                 MENSAGEM
                            ====================== -->

                            <div
                                class="mw-nova-senha-mensagem"
                                role="alert"
                                aria-live="polite"
                            ></div>


                            <!-- =====================
                                 AÇÕES
                            ====================== -->

                            <div
                                class="mw-nova-senha-acoes"
                            >

                                <button
                                    type="button"
                                    class="mw-nova-senha-btn mw-nova-senha-btn-cancelar"
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    class="mw-nova-senha-btn mw-nova-senha-btn-alterar"
                                >
                                    Alterar senha
                                </button>

                            </div>

                        </form>

                    </div>

                </section>

            `;


            this.modal =
                container.querySelector(
                    ".mw-nova-senha-modal"
                );


            this.inputSenha =
                container.querySelector(
                    "#mw-nova-senha"
                );


            this.inputConfirmacao =
                container.querySelector(
                    "#mw-confirmar-nova-senha"
                );


            this.mensagem =
                container.querySelector(
                    ".mw-nova-senha-mensagem"
                );


            this.botaoAlterar =
                container.querySelector(
                    ".mw-nova-senha-btn-alterar"
                );


            this.botaoCancelar =
                container.querySelector(
                    ".mw-nova-senha-btn-cancelar"
                );


            this.botaoFechar =
                container.querySelector(
                    ".mw-nova-senha-fechar"
                );


            this.configurarEventos();

        },


        /* =================================================
           EVENTOS
           ================================================= */

        configurarEventos() {

            if (!this.container) {

                return;

            }


            /* ---------------------------------------------
               FORMULÁRIO
            --------------------------------------------- */

            const formulario =
                this.container.querySelector(
                    ".mw-nova-senha-form"
                );


            formulario?.addEventListener(
                "submit",
                (evento) => {

                    evento.preventDefault();

                    this.enviar();

                }
            );


            /* ---------------------------------------------
               CANCELAR
            --------------------------------------------- */

            this.botaoCancelar?.addEventListener(
                "click",
                () => {

                    this.fechar();

                }
            );


            /* ---------------------------------------------
               FECHAR
            --------------------------------------------- */

            this.botaoFechar?.addEventListener(
                "click",
                () => {

                    this.fechar();

                }
            );


            /* ---------------------------------------------
               CLIQUE NO FUNDO
            --------------------------------------------- */

            this.container.addEventListener(
                "click",
                (evento) => {

                    if (
                        evento.target ===
                        this.container
                    ) {

                        this.fechar();

                    }

                }
            );


            /* ---------------------------------------------
               ESC
            --------------------------------------------- */

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


            /* ---------------------------------------------
               MOSTRAR / OCULTAR SENHA
            --------------------------------------------- */

            const botoes =
                this.container.querySelectorAll(
                    ".mw-nova-senha-toggle"
                );


            botoes.forEach(
                (botao) => {

                    botao.addEventListener(
                        "click",
                        () => {

                            this.alternarSenha(
                                botao
                            );

                        }
                    );

                    this.atualizarIconeSenha(
                        botao,
                        false
                    );

                }
            );

        },


        /* =================================================
           ABRIR
           ================================================= */

        abrir() {

            if (!this.inicializado) {

                this.iniciar();

            }


            this.focoAnterior =
                document.activeElement;


            this.limparFormulario();


            this.container.classList.add(
                "mw-modal-aberto"
            );


            document.body.dataset
                .mwModalNovaSenhaAberto =
                "true";


            document.body.style.overflow =
                "hidden";


            setTimeout(
                () => {

                    this.inputSenha?.focus();

                },
                80
            );


            console.log(
                "🔐 Modal de nova senha aberto."
            );

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


            delete document.body.dataset
                .mwModalNovaSenhaAberto;


            document.body.style.overflow =
                "";


            if (
                this.focoAnterior &&
                typeof this.focoAnterior.focus ===
                    "function"
            ) {

                try {

                    this.focoAnterior.focus();

                } catch {

                    // Não interromper fechamento.

                }

            }


            console.log(
                "Modal de nova senha fechado."
            );

        },


        /* =================================================
           ESTADO
           ================================================= */

        estaAberto() {

            return (
                !!this.container &&
                this.container.classList.contains(
                    "mw-modal-aberto"
                )
            );

        },


        /* =================================================
           LIMPAR
           ================================================= */

        limparFormulario() {

            if (this.inputSenha) {

                this.inputSenha.value = "";

                this.inputSenha.type =
                    "password";

            }


            if (this.inputConfirmacao) {

                this.inputConfirmacao.value = "";

                this.inputConfirmacao.type =
                    "password";

            }


            this.limparMensagem();


            const botoes =
                this.container.querySelectorAll(
                    ".mw-nova-senha-toggle"
                );


            botoes.forEach(
                (botao) => {

                    this.atualizarIconeSenha(
                        botao,
                        false
                    );

                }
            );


            if (this.botaoAlterar) {

                this.botaoAlterar.disabled =
                    false;

                this.botaoAlterar.textContent =
                    "Alterar senha";

            }


            if (this.botaoCancelar) {

                this.botaoCancelar.disabled =
                    false;

            }

        },


        /* =================================================
           ENVIAR
           ================================================= */

        async enviar() {

            const senha =
                this.inputSenha?.value || "";


            const confirmacao =
                this.inputConfirmacao?.value || "";


            this.limparMensagem();


            /* ---------------------------------------------
               VALIDAÇÃO
            --------------------------------------------- */

            if (!senha) {

                this.mostrarErro(
                    "Informe sua nova senha."
                );

                this.inputSenha?.focus();

                return;

            }


            if (senha.length < 6) {

                this.mostrarErro(
                    "A nova senha deve ter pelo menos 6 caracteres."
                );

                this.inputSenha?.focus();

                return;

            }


            if (!confirmacao) {

                this.mostrarErro(
                    "Confirme sua nova senha."
                );

                this.inputConfirmacao?.focus();

                return;

            }


            if (senha !== confirmacao) {

                this.mostrarErro(
                    "As senhas não coincidem."
                );

                this.inputConfirmacao?.focus();

                return;

            }


            if (
                !window.Login ||
                typeof window.Login.alterarSenha !==
                    "function"
            ) {

                this.mostrarErro(
                    "O serviço de alteração de senha não está disponível."
                );

                return;

            }


            /* ---------------------------------------------
               CARREGAMENTO
            --------------------------------------------- */

            this.definirCarregando(
                true
            );


            try {

                console.log(
                    "🔐 Alterando senha do usuário..."
                );


                const resultado =
                    await window.Login.alterarSenha(
                        senha
                    );


                if (!resultado?.sucesso) {

                    this.mostrarErro(
                        resultado?.mensagem ||
                        "Não foi possível alterar sua senha."
                    );

                    return;

                }


                console.log(
                    "✅ Senha alterada com sucesso."
                );


                this.mostrarSucesso();

            } catch (erro) {

                console.error(
                    "Erro ao alterar senha:",
                    erro
                );


                this.mostrarErro(
                    "Ocorreu um erro ao alterar sua senha."
                );

            } finally {

                this.definirCarregando(
                    false
                );

            }

        },


        /* =================================================
           CARREGANDO
           ================================================= */

        definirCarregando(ativo) {

            if (this.botaoAlterar) {

                this.botaoAlterar.disabled =
                    ativo;


                this.botaoAlterar.textContent =
                    ativo
                        ? "Salvando..."
                        : "Alterar senha";

            }


            if (this.botaoCancelar) {

                this.botaoCancelar.disabled =
                    ativo;

            }


            if (this.botaoFechar) {

                this.botaoFechar.disabled =
                    ativo;

            }

        },


        /* =================================================
           ERRO
           ================================================= */

        mostrarErro(mensagem) {

            if (!this.mensagem) {

                return;

            }


            this.mensagem.textContent =
                mensagem;


            this.mensagem.className =
                "mw-nova-senha-mensagem " +
                "mw-mensagem-visivel " +
                "mw-mensagem-erro";

        },


        /* =================================================
           SUCESSO
           ================================================= */

        mostrarSucesso() {

            if (!this.modal) {

                return;

            }


            this.modal.innerHTML = `

                <div
                    class="mw-nova-senha-sucesso"
                >

                    <div
                        class="mw-nova-senha-icone"
                        aria-hidden="true"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >

                            <path
                                d="M20 6L9 17l-5-5"
                            ></path>

                        </svg>

                    </div>


                    <h2
                        class="mw-nova-senha-titulo"
                    >
                        Senha alterada
                    </h2>


                    <p
                        class="mw-nova-senha-descricao"
                    >
                        Sua senha foi alterada com sucesso.
                        Agora você já pode entrar no MusicalWorld
                        usando sua nova senha.
                    </p>


                    <div
                        class="mw-nova-senha-acoes"
                    >

                        <button
                            type="button"
                            class="
                                mw-nova-senha-btn
                                mw-nova-senha-btn-alterar
                            "
                            id="mw-btn-ir-login"
                        >
                            Ir para o login
                        </button>

                    </div>

                </div>

            `;


            const botaoLogin =
                this.modal.querySelector(
                    "#mw-btn-ir-login"
                );


            botaoLogin?.addEventListener(
                "click",
                () => {

                    this.finalizarRecuperacao();

                }
            );


            botaoLogin?.focus();

        },


        /* =================================================
           FINALIZAR RECUPERAÇÃO
           ================================================= */

        async finalizarRecuperacao() {

            const supabase =
                window.supabaseClient ||
                window.supabase;


            try {

                if (
                    supabase?.auth
                ) {

                    await supabase.auth.signOut();

                }

            } catch (erro) {

                console.warn(
                    "Não foi possível encerrar a sessão de recuperação:",
                    erro
                );

            }


            window.location.href =
                "login.html";

        },


        /* =================================================
           MOSTRAR / OCULTAR SENHA
           ================================================= */

        alternarSenha(botao) {

            const id =
                botao?.dataset?.target;


            if (!id) {

                return;

            }


            const input =
                document.getElementById(id);


            if (!input) {

                return;

            }


            const visivel =
                input.type === "text";


            input.type =
                visivel
                    ? "password"
                    : "text";


            this.atualizarIconeSenha(
                botao,
                !visivel
            );


            input.focus();

        },


        /* =================================================
           ÍCONE
           ================================================= */

        atualizarIconeSenha(
            botao,
            visivel
        ) {

            if (!botao) {

                return;

            }


            if (visivel) {

                botao.innerHTML = `

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <path
                            d="M2 12s3.5-7 10-7
                               10 7 10 7
                               -3.5 7-10 7
                               -10-7-10-7z"
                        ></path>

                        <circle
                            cx="12"
                            cy="12"
                            r="3"
                        ></circle>

                    </svg>

                `;


                botao.setAttribute(
                    "aria-label",
                    "Ocultar senha"
                );


                botao.setAttribute(
                    "title",
                    "Ocultar senha"
                );

            } else {

                botao.innerHTML = `

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <path
                            d="M3 3l18 18"
                        ></path>

                        <path
                            d="M10.6 10.6
                               a2 2 0 0 0
                               2.8 2.8"
                        ></path>

                        <path
                            d="M9.9 4.2
                               A10.6 10.6 0 0 1
                               12 4
                               c6.5 0
                               10 8
                               10 8
                               a18.3 18.3 0 0 1
                               -3.2 4.4"
                        ></path>

                        <path
                            d="M6.6 6.6
                               C4.2 8.4 2 12
                               2 12
                               s3.5 8 10 8
                               c1.5 0 2.8-.3 4-.9"
                        ></path>

                    </svg>

                `;


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

    };


    /* =====================================================
       EXPOR COMPONENTE
       ===================================================== */

    window.MusicalWorldModalNovaSenha =
        ModalNovaSenha;


})(window);