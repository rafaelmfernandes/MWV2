/* =========================================================
   MUSICALWORLD — CONTROLADOR DA PÁGINA DE LOGIN

   Arquivo:
   js/login.js

   Responsabilidade:
   - Controlar a interface Entrar / Cadastrar.
   - Realizar login.
   - Realizar cadastro.
   - Controlar login social.
   - Abrir modal de recuperação de senha.
   - Detectar sessão PASSWORD_RECOVERY.
   - Abrir modal de nova senha.
   - Manter integração com Supabase.

   IMPORTANTE:
   - O listener de autenticação é registrado imediatamente,
     antes do evento "load".
   - PASSWORD_RECOVERY é tratado separadamente.
   - SIGNED_IN normal continua o fluxo para index.html.
   - access_token NÃO é utilizado para identificar
     recuperação de senha, pois login social também possui
     access_token.
   ========================================================= */


/* =========================================================
   ESTADO DO FLUXO DE RECUPERAÇÃO
   ========================================================= */

let musicalWorldFluxoRecuperacaoSenha =
    false;


/* =========================================================
   DETECTAR RECUPERAÇÃO PELA URL
   ========================================================= */

function ehFluxoDeRecuperacao() {

    const hash =
        window.location.hash || "";


    const pesquisa =
        window.location.search || "";


    const parametrosHash =
        new URLSearchParams(
            hash.replace(
                /^#/,
                ""
            )
        );


    const parametrosPesquisa =
        new URLSearchParams(
            pesquisa
        );


    const tipoHash =
        parametrosHash.get(
            "type"
        );


    const tipoPesquisa =
        parametrosPesquisa.get(
            "type"
        );


    return (
        tipoHash === "recovery" ||
        tipoPesquisa === "recovery"
    );

}


/* =========================================================
   ABRIR MODAL DE NOVA SENHA
   ========================================================= */

function abrirModalNovaSenha() {

    musicalWorldFluxoRecuperacaoSenha =
        true;


    if (
        !window.MusicalWorldModalNovaSenha
    ) {

        console.error(
            "Modal de nova senha não encontrado."
        );

        return;

    }


    if (
        typeof window.MusicalWorldModalNovaSenha.iniciar ===
            "function"
    ) {

        window.MusicalWorldModalNovaSenha.iniciar();

    }


    if (
        typeof window.MusicalWorldModalNovaSenha.abrir ===
            "function"
    ) {

        window.MusicalWorldModalNovaSenha.abrir();

        console.log(
            "🔐 Modal Nova Senha aberto pelo fluxo de recuperação."
        );

    }

}


/* =========================================================
   OBSERVAR AUTENTICAÇÃO / PASSWORD_RECOVERY

   Responsabilidade:
   - Observar os eventos de autenticação do Supabase.
   - Abrir o modal de nova senha quando o evento for
     PASSWORD_RECOVERY.
   - Redirecionar para index.html quando ocorrer um
     SIGNED_IN normal.
   - NÃO tratar access_token como recuperação.

   IMPORTANTE:
   O login Google também produz SIGNED_IN e access_token.
   Portanto, access_token NÃO deve ser usado para identificar
   recuperação de senha.
   ========================================================= */

function observarRecuperacaoSenha() {

    const supabase =
        window.supabaseClient ||
        window.supabase;


    if (
        !supabase?.auth
    ) {

        console.error(
            "Cliente Supabase não disponível para observar autenticação."
        );

        return false;

    }


    /*
     * Evita registrar o mesmo listener mais de uma vez.
     */

    if (
        window.musicalWorldListenerRecuperacaoRegistrado
    ) {

        return true;

    }


    window.musicalWorldListenerRecuperacaoRegistrado =
        true;


    supabase.auth.onAuthStateChange(
        (evento, sessao) => {

            console.log(
                "🔄 Estado da autenticação:",
                evento
            );


            /* =============================================
               RECUPERAÇÃO DE SENHA
               ============================================= */

            if (
                evento ===
                "PASSWORD_RECOVERY"
            ) {

                console.log(
                    "🔐 PASSWORD_RECOVERY detectado."
                );


                musicalWorldFluxoRecuperacaoSenha =
                    true;


                /*
                 * Esperamos um ciclo do navegador para
                 * garantir que o componente do modal já
                 * esteja disponível.
                 */

                setTimeout(
                    () => {

                        abrirModalNovaSenha();

                    },
                    0
                );


                return;

            }


            /* =============================================
               OUTROS ESTADOS
               ============================================= */

            if (
                sessao?.user
            ) {

                console.log(
                    "Usuário autenticado:",
                    sessao.user.id
                );

            } else {

                console.log(
                    "Nenhum usuário autenticado."
                );

            }


            /* =============================================
               LOGIN NORMAL CONCLUÍDO
               =============================================

               SIGNED_IN pode ocorrer em:

               - Login com e-mail e senha.
               - Login com Google.
               - Login com Apple.

               Não devemos tratar access_token como
               recuperação.

               A recuperação já foi tratada acima através
               do evento PASSWORD_RECOVERY ou da URL.
               ============================================= */

            if (
                evento ===
                "SIGNED_IN"
            ) {

                /*
                 * Durante recuperação, o usuário precisa
                 * permanecer no login.html para alterar
                 * a senha.
                 */

                if (
                    musicalWorldFluxoRecuperacaoSenha ||
                    ehFluxoDeRecuperacao()
                ) {

                    console.log(
                        "🔐 SIGNED_IN ignorado porque o fluxo de recuperação está ativo."
                    );

                    return;

                }


                console.log(
                    "✅ Login normal concluído. Redirecionando para o MusicalWorld..."
                );


                /*
                 * Pequeno atraso para garantir que a sessão
                 * esteja persistida antes do redirecionamento.
                 */

                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    100
                );

            }

        }
    );


    console.log(
        "👁️ Listener PASSWORD_RECOVERY registrado."
    );


    return true;

}


/* =========================================================
   ALTERNAR ABA
   ========================================================= */

function alternarAba(tipo) {

    const toggleContainer =
        document.querySelector(
            ".auth-toggle-container"
        );


    const tabLogin =
        document.getElementById(
            "tab-login"
        );


    const tabCadastro =
        document.getElementById(
            "tab-cadastro"
        );


    const containerConteudo =
        document.getElementById(
            "auth-content-container"
        );


    if (
        !toggleContainer ||
        !tabLogin ||
        !tabCadastro ||
        !containerConteudo
    ) {

        console.error(
            "Elementos da autenticação não encontrados."
        );

        return;

    }


    /* =====================================================
       LOGIN
       ===================================================== */

    if (tipo === "login") {

        toggleContainer.classList.remove(
            "right"
        );


        tabLogin.classList.add(
            "active"
        );


        tabCadastro.classList.remove(
            "active"
        );


        containerConteudo.innerHTML = `

            <form
                class="auth-form-pane"
                onsubmit="realizarLogin(event)"
            >

                <div class="form-group">

                    <label>
                        E-mail
                    </label>

                    <input
                        type="email"
                        name="email"
                        class="input-custom"
                        placeholder="seu@email.com"
                        autocomplete="email"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>
                        Senha
                    </label>

                    <input
                        type="password"
                        name="senha"
                        class="input-custom"
                        placeholder="Sua senha"
                        autocomplete="current-password"
                        required
                    >

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:flex-end;
                        margin-top:-4px;
                    "
                >

                    <a
                        href="#"
                        onclick="esqueciSenha(event)"
                        class="link-esqueci-senha"
                    >
                        Esqueceu a senha?
                    </a>

                </div>


                <button
                    type="submit"
                    class="btn-continuar-proximo"
                    style="margin-top:4px;"
                >
                    Entrar na Conta
                </button>


                <div class="auth-divider">

                    <span>
                        ou entre com
                    </span>

                </div>


                <div
                    class="social-buttons-container"
                >

                    <button
                        type="button"
                        class="btn-social"
                        onclick="loginSocial('Google')"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            style="
                                width:16px;
                                height:16px;
                            "
                        >

                            <path
                                fill="#4285F4"
                                d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"
                            ></path>

                        </svg>

                        Google

                    </button>


                    <button
                        type="button"
                        class="btn-social"
                        onclick="loginSocial('Apple')"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            style="
                                width:16px;
                                height:16px;
                            "
                        >

                            <path
                                fill="#0f172a"
                                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8-.75 1.51-.7 1.55c.53.04 1.34-.33 1.81-.72z"
                            ></path>

                        </svg>

                        Apple

                    </button>

                </div>

            </form>

        `;


        return;

    }


    /* =====================================================
       CADASTRO
       ===================================================== */

    toggleContainer.classList.add(
        "right"
    );


    tabCadastro.classList.add(
        "active"
    );


    tabLogin.classList.remove(
        "active"
    );


    containerConteudo.innerHTML = `

        <form
            class="auth-form-pane"
            onsubmit="realizarCadastro(event)"
            style="margin-top:14px;"
        >

            <div class="form-group">

                <label>
                    Nome Completo
                </label>

                <input
                    type="text"
                    name="nome"
                    class="input-custom"
                    placeholder="Seu nome"
                    autocomplete="name"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    E-mail
                </label>

                <input
                    type="email"
                    name="email"
                    class="input-custom"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    Criar Senha
                </label>

                <input
                    type="password"
                    name="senha"
                    class="input-custom"
                    placeholder="Mínimo 6 caracteres"
                    autocomplete="new-password"
                    minlength="6"
                    required
                >

            </div>


            <div class="cadastro-artista-opcao">

                <label
                    for="sou-artista"
                    class="cadastro-artista-label"
                >

                    <input
                        type="checkbox"
                        id="sou-artista"
                        name="souArtista"
                        onchange="alternarTipoArtista()"
                    >

                    <span>
                        Sou artista
                    </span>

                </label>


                <p
                    class="cadastro-artista-descricao"
                >
                    Quero criar um perfil para divulgar meu trabalho
                    e receber oportunidades.
                </p>

            </div>


            <div
                id="tipo-artista-container"
                class="
                    form-group
                    cadastro-tipo-artista
                "
                style="display:none;"
            >

                <label for="tipo-artista">
                    Tipo de artista
                </label>


                <select
                    id="tipo-artista"
                    name="tipoArtista"
                    class="input-custom"
                >

                    <option value="">
                        Selecione seu tipo de artista
                    </option>

                    <option value="Cantor(a)">
                        Cantor(a)
                    </option>

                    <option value="Músico(a)">
                        Músico(a)
                    </option>

                    <option value="Banda">
                        Banda
                    </option>

                    <option value="Dupla musical">
                        Dupla musical
                    </option>

                    <option value="DJ">
                        DJ
                    </option>

                    <option value="Dançarino(a)">
                        Dançarino(a)
                    </option>

                    <option value="Grupo de dança">
                        Grupo de dança
                    </option>

                    <option value="MC">
                        MC
                    </option>

                    <option value="Compositor(a)">
                        Compositor(a)
                    </option>

                    <option value="Produtor(a) musical">
                        Produtor(a) musical
                    </option>

                </select>


                <small
                    style="
                        display:block;
                        margin-top:6px;
                        color:#64748b;
                        font-size:12px;
                    "
                >
                    Você poderá completar seu perfil artístico depois.
                </small>

            </div>


            <button
                type="submit"
                class="btn-continuar-proximo"
                style="margin-top:4px;"
            >
                Criar Conta
            </button>


            <div class="auth-divider">

                <span>
                    ou cadastre-se com
                </span>

            </div>


            <div
                class="social-buttons-container"
            >

                <button
                    type="button"
                    class="btn-social"
                    onclick="loginSocial('Google')"
                >
                    Google
                </button>


                <button
                    type="button"
                    class="btn-social"
                    onclick="loginSocial('Apple')"
                >
                    Apple
                </button>

            </div>

        </form>

    `;

}


/* =========================================================
   TIPO DE ARTISTA
   ========================================================= */

function alternarTipoArtista() {

    const checkbox =
        document.getElementById(
            "sou-artista"
        );


    const container =
        document.getElementById(
            "tipo-artista-container"
        );


    const select =
        document.getElementById(
            "tipo-artista"
        );


    if (
        !checkbox ||
        !container ||
        !select
    ) {

        console.error(
            "Elementos do tipo de artista não encontrados."
        );

        return;

    }


    if (checkbox.checked) {

        container.style.display =
            "block";

        select.required =
            true;

    } else {

        container.style.display =
            "none";

        select.required =
            false;

        select.value =
            "";

    }

}


/* =========================================================
   LOGIN
   ========================================================= */

async function realizarLogin(e) {

    e.preventDefault();


    const formulario =
        e.target;


    const botao =
        formulario.querySelector(
            'button[type="submit"]'
        );


    const email =
        formulario
            .querySelector(
                'input[name="email"]'
            )
            ?.value
            .trim()
            .toLowerCase() || "";


    const senha =
        formulario
            .querySelector(
                'input[name="senha"]'
            )
            ?.value || "";


    if (!email || !senha) {

        alert(
            "Informe seu e-mail e sua senha."
        );

        return;

    }


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            "Entrando...";

    }


    try {

        const resultado =
            await Login.entrar({
                email,
                senha
            });


        if (!resultado?.sucesso) {

            alert(
                resultado?.mensagem ||
                "Não foi possível entrar na conta."
            );

            return;

        }


        try {

            localStorage.setItem(
                "musicalworld_usuario_id",
                resultado.usuario.id
            );


            localStorage.setItem(
                "musicalworld_usuario_email",
                resultado.usuario.email ||
                email
            );

        } catch (erroStorage) {

            console.warn(
                "Não foi possível salvar dados locais:",
                erroStorage
            );

        }


        if (window.Sessao) {

            try {

                await Sessao.obter();

            } catch (erroSessao) {

                console.warn(
                    "Sessão não pôde ser confirmada pelo módulo Sessao:",
                    erroSessao
                );

            }

        }


        console.log(
            "Login realizado com sucesso."
        );


        window.location.href =
            "index.html";


    } catch (erro) {

        console.error(
            "Erro inesperado no login:",
            erro
        );


        alert(
            "Ocorreu um erro inesperado ao entrar na conta."
        );

    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "Entrar na Conta";

        }

    }

}


/* =========================================================
   CADASTRO
   ========================================================= */

async function realizarCadastro(e) {

    e.preventDefault();


    const formulario =
        e.target;


    const botao =
        formulario.querySelector(
            'button[type="submit"]'
        );


    const nome =
        formulario
            .querySelector(
                'input[name="nome"]'
            )
            ?.value
            .trim() || "";


    const email =
        formulario
            .querySelector(
                'input[name="email"]'
            )
            ?.value
            .trim()
            .toLowerCase() || "";


    const senha =
        formulario
            .querySelector(
                'input[name="senha"]'
            )
            ?.value || "";


    const souArtista =
        formulario.querySelector(
            'input[name="souArtista"]'
        )?.checked === true;


    const tipoArtista =
        formulario
            .querySelector(
                'select[name="tipoArtista"]'
            )
            ?.value
            .trim() || "";


    if (!nome) {

        alert(
            "Informe seu nome."
        );

        return;

    }


    if (!email) {

        alert(
            "Informe seu e-mail."
        );

        return;

    }


    if (
        !senha ||
        senha.length < 6
    ) {

        alert(
            "A senha deve ter pelo menos 6 caracteres."
        );

        return;

    }


    if (
        souArtista &&
        !tipoArtista
    ) {

        alert(
            "Selecione seu tipo de artista."
        );


        formulario
            .querySelector(
                'select[name="tipoArtista"]'
            )
            ?.focus();


        return;

    }


    const tipoPerfil =
        souArtista
            ? "artista"
            : "contratante";


    const dadosCadastro = {

        nome,

        email,

        senha,

        tipoPerfil,

        tipoArtista:
            souArtista
                ? tipoArtista
                : null

    };


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            "Criando conta...";

    }


    try {

        const resposta =
            await fetch(
                `${SUPABASE_URL}/functions/v1/criar-conta`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_ANON_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_ANON_KEY}`

                    },

                    body:
                        JSON.stringify(
                            dadosCadastro
                        )

                }
            );


        let resultado =
            null;


        try {

            resultado =
                await resposta.json();

        } catch {

            resultado =
                null;

        }


        if (
            !resposta.ok ||
            !resultado?.sucesso
        ) {

            if (
                resposta.status === 409
            ) {

                alert(
                    resultado?.mensagem ||
                    "Este e-mail já está cadastrado."
                );

            } else {

                alert(
                    resultado?.mensagem ||
                    "Não foi possível concluir o cadastro."
                );

            }

            return;

        }


        try {

            if (
                resultado.usuario?.id
            ) {

                localStorage.setItem(
                    "musicalworld_usuario_id",
                    resultado.usuario.id
                );

            }


            localStorage.setItem(
                "musicalworld_usuario_email",
                resultado.usuario?.email ||
                email
            );

        } catch (erroStorage) {

            console.warn(
                "Não foi possível salvar dados locais:",
                erroStorage
            );

        }


        if (souArtista) {

            alert(
                "Conta criada com sucesso!\n\n" +
                "Seu perfil artístico foi criado.\n\n" +
                "Agora você poderá completar as informações do seu perfil."
            );

        } else {

            alert(
                "Conta criada com sucesso!\n\n" +
                "Seu perfil já foi criado e sua conta está pronta para uso."
            );

        }


        alternarAba(
            "login"
        );


    } catch (erro) {

        console.error(
            "Erro ao criar conta:",
            erro
        );


        alert(
            "Não foi possível conectar ao serviço de cadastro.\n\n" +
            "Verifique sua conexão e tente novamente."
        );

    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                "Criar Conta";

        }

    }

}


/* =========================================================
   LOGIN SOCIAL
   ========================================================= */

async function loginSocial(provedor) {

    if (
        provedor !== "Google" &&
        provedor !== "Apple"
    ) {

        alert(
            "Provedor de autenticação não suportado."
        );

        return;

    }


    try {

        const resultado =
            await Login.social(
                provedor
            );


        if (!resultado?.sucesso) {

            alert(
                resultado?.mensagem ||
                "Não foi possível iniciar a autenticação social."
            );

        }

    } catch (erro) {

        console.error(
            "Erro no login social:",
            erro
        );


        alert(
            "Ocorreu um erro ao iniciar a autenticação social."
        );

    }

}


/* =========================================================
   RECUPERAÇÃO DE SENHA
   ========================================================= */

function esqueciSenha(e) {

    e.preventDefault();


    if (
        window.MusicalWorldModalRecuperarSenha &&
        typeof window.MusicalWorldModalRecuperarSenha.abrir ===
            "function"
    ) {

        window.MusicalWorldModalRecuperarSenha.abrir();

        return;

    }


    console.error(
        "Modal de recuperação de senha não encontrado."
    );

}


/* =========================================================
   VERIFICAR FLUXO DE RECUPERAÇÃO
   ========================================================= */

async function verificarFluxoRecuperacaoSenha() {

    /*
     * Se o evento PASSWORD_RECOVERY já abriu o modal,
     * não precisamos executar novamente.
     */

    if (
        musicalWorldFluxoRecuperacaoSenha
    ) {

        return true;

    }


    if (
        !ehFluxoDeRecuperacao()
    ) {

        return false;

    }


    musicalWorldFluxoRecuperacaoSenha =
        true;


    console.log(
        "🔐 Fluxo de recuperação de senha detectado pela URL."
    );


    /*
     * O Supabase pode precisar de alguns instantes para
     * estabelecer a sessão temporária.
     *
     * Como o listener PASSWORD_RECOVERY já está registrado,
     * ele será o responsável pela abertura principal.
     *
     * Aqui fazemos apenas uma tentativa complementar.
     */

    setTimeout(
        async () => {

            try {

                const resultado =
                    await Login.verificarSessaoInicial();


                if (
                    resultado?.sessao
                ) {

                    console.log(
                        "🔐 Sessão de recuperação disponível."
                    );


                    abrirModalNovaSenha();

                }

            } catch (erro) {

                console.error(
                    "Erro ao verificar recuperação:",
                    erro
                );

            }

        },
        500
    );


    return true;

}


/* =========================================================
   VERIFICAR SESSÃO NORMAL
   ========================================================= */

async function verificarSessaoInicial() {

    /*
     * NUNCA executar a verificação normal durante
     * uma recuperação de senha.

     * Nesse momento o usuário possui uma sessão
     * temporária que deve permanecer no login.html
     * para permitir a alteração da senha.
     */

    if (
        musicalWorldFluxoRecuperacaoSenha ||
        ehFluxoDeRecuperacao()
    ) {

        console.log(
            "🔐 Recuperação de senha ativa. " +
            "Verificação normal de sessão ignorada."
        );

        return;

    }


    try {

        const resultado =
            await Login.verificarSessaoInicial();


        if (
            resultado?.sessao
        ) {

            console.log(
                "Sessão ativa encontrada."
            );

        } else {

            console.log(
                "Nenhuma sessão ativa."
            );

        }

    } catch (erro) {

        console.error(
            "Erro ao verificar sessão inicial:",
            erro
        );

    }

}


/* =========================================================
   INICIALIZAÇÃO DA PÁGINA
   ========================================================= */

(function inicializarLogin() {

    /*
     * PRIMEIRO PASSO:
     *
     * Registrar imediatamente o listener do Supabase.
     *
     * Não esperamos o evento "load".
     */

    observarRecuperacaoSenha();


    /*
     * SEGUNDO PASSO:
     *
     * Verificar imediatamente se a URL já indica
     * recuperação.
     */

    if (
        ehFluxoDeRecuperacao()
    ) {

        musicalWorldFluxoRecuperacaoSenha =
            true;

    }


    /*
     * TERCEIRO PASSO:
     *
     * Aguardar o carregamento da interface para
     * montar o formulário normalmente.
     */

    window.addEventListener(
        "load",
        async function () {

            console.log(
                "Inicializando autenticação do MusicalWorld..."
            );


            /*
             * Cria a tela normal de login.
             */

            alternarAba(
                "login"
            );


            /*
             * Inicializa o Modal Nova Senha.
             */

            if (
                window.MusicalWorldModalNovaSenha &&
                typeof window.MusicalWorldModalNovaSenha.iniciar ===
                    "function"
            ) {

                window.MusicalWorldModalNovaSenha.iniciar();

            }


            /*
             * Verifica se o retorno é recuperação.
             */

            const recuperacao =
                await verificarFluxoRecuperacaoSenha();


            /*
             * Se for recuperação, NÃO executamos
             * a verificação normal da sessão.
             */

            if (
                recuperacao ||
                musicalWorldFluxoRecuperacaoSenha
            ) {

                console.log(
                    "🔐 Página mantida no fluxo de recuperação."
                );

                return;

            }


            /*
             * Fluxo normal.
             */

            await verificarSessaoInicial();

        }
    );

})();