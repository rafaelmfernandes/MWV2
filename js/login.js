/* ============================================================
   MUSICALWORLD — CONTROLADOR DA PÁGINA DE AUTENTICAÇÃO

   Arquivo:
   js/login.js

   Responsabilidades:

   - Controlar a interface da página de autenticação.
   - Alternar entre Login e Cadastro.
   - Montar os formulários.
   - Validar visualmente os campos.
   - Chamar o módulo Login.
   - Chamar o módulo Cadastro.
   - Exibir mensagens de erro na interface.
   - Controlar o estado visual dos botões.
   - Processar o retorno da autenticação social.
   - Verificar se o usuário social já possui perfil.
   - Direcionar usuários sociais para:
       index.html
       ou
       configurar-conta.html

   Regras de negócio de autenticação ficam em:
   js/auth/Login.js

   Regras de negócio de cadastro ficam em:
   js/auth/Cadastro.js

   Este arquivo é responsável pelo controle da interface
   e pelo fluxo de navegação da página de autenticação.
============================================================ */


/* ============================================================
   CONTROLE INTERNO DO FLUXO DE AUTENTICAÇÃO
============================================================ */

/*
   Evita que INITIAL_SESSION e SIGNED_IN processem o mesmo
   usuário simultaneamente e provoquem dois redirecionamentos.
*/
let redirecionandoAposAutenticacao = false;


/*
   Identifica se a página está processando o retorno de um
   fluxo OAuth.

   O Supabase retorna para login.html depois do Google/Apple.
   A presença de uma sessão já existente durante a inicialização
   é suficiente para verificarmos o perfil.
*/
let processandoRetornoOAuth = false;


/* ============================================================
   CONTROLE VISUAL DOS ERROS
============================================================ */

/**
 * Cria ou recupera a mensagem de erro de um campo.
 */
function obterElementoErroCampo(campo) {

    if (!campo) {
        return null;
    }

    const grupo =
        campo.closest('.form-group');

    if (!grupo) {
        return null;
    }

    let mensagem =
        grupo.querySelector('.auth-field-error');

    if (!mensagem) {

        mensagem =
            document.createElement('div');

        mensagem.className =
            'auth-field-error';

        grupo.appendChild(mensagem);
    }

    return mensagem;
}


/**
 * Exibe erro visual em um campo.
 */
function mostrarErroCampo(campo, mensagem) {

    if (!campo) {
        return;
    }

    campo.classList.add('input-error');

    campo.setAttribute(
        'aria-invalid',
        'true'
    );

    const elementoErro =
        obterElementoErroCampo(campo);

    if (elementoErro) {

        elementoErro.textContent =
            mensagem;

        elementoErro.classList.add(
            'visible'
        );

        elementoErro.setAttribute(
            'role',
            'alert'
        );
    }
}


/**
 * Remove erro visual de um campo.
 */
function limparErroCampo(campo) {

    if (!campo) {
        return;
    }

    campo.classList.remove(
        'input-error'
    );

    campo.removeAttribute(
        'aria-invalid'
    );

    const grupo =
        campo.closest('.form-group');

    if (!grupo) {
        return;
    }

    const elementoErro =
        grupo.querySelector(
            '.auth-field-error'
        );

    if (elementoErro) {

        elementoErro.textContent =
            '';

        elementoErro.classList.remove(
            'visible'
        );

        elementoErro.removeAttribute(
            'role'
        );
    }
}


/**
 * Limpa todos os erros do formulário.
 */
function limparErrosFormulario(formulario) {

    if (!formulario) {
        return;
    }

    formulario
        .querySelectorAll('.input-error')
        .forEach(campo => {

            limparErroCampo(campo);

        });
}


/**
 * Dá foco ao campo com erro.
 */
function focarCampoComErro(campo) {

    if (!campo) {
        return;
    }

    setTimeout(() => {

        campo.focus();

        if (
            typeof campo.select === 'function' &&
            campo.type !== 'password'
        ) {

            campo.select();
        }

    }, 50);
}


/**
 * Remove o erro quando o usuário começa a corrigir o campo.
 */
function prepararLimpezaErroCampo(campo) {

    if (
        !campo ||
        campo.dataset.erroPreparado === 'true'
    ) {
        return;
    }

    campo.dataset.erroPreparado =
        'true';

    campo.addEventListener(
        'input',
        () => {

            if (
                campo.classList.contains(
                    'input-error'
                )
            ) {

                limparErroCampo(campo);
            }

        }
    );
}


/* ============================================================
   REDIRECIONAMENTO APÓS AUTENTICAÇÃO
============================================================ */

/**
 * Decide para onde um usuário autenticado deve ir.
 *
 * Fluxo:
 *
 * Usuário autenticado
 *        ↓
 * Login.verificarPerfilUsuario()
 *        ↓
 * ┌─────────────────────┐
 * │                     │
 * possui perfil     sem perfil
 * │                     │
 * ↓                     ↓
 * index.html       configurar-conta.html
 *
 * Este método não cria perfil e não altera dados.
 */
async function processarUsuarioAutenticado(usuario) {

    if (!usuario?.id) {

        console.warn(
            '⚠️ Não foi possível processar usuário autenticado.'
        );

        return;
    }

    if (redirecionandoAposAutenticacao) {

        console.log(
            '⏭️ Redirecionamento já está sendo processado.'
        );

        return;
    }

    redirecionandoAposAutenticacao =
        true;

    console.log(
        '======================================'
    );

    console.log(
        '🔐 PROCESSANDO USUÁRIO AUTENTICADO'
    );

    console.log(
        '======================================'
    );

    console.log(
        '👤 ID:',
        usuario.id
    );

    console.log(
        '📧 E-mail:',
        usuario.email
    );

    try {

        /* ====================================================
           VERIFICAR PERFIL
        ==================================================== */

        const resultadoPerfil =
            await Login.verificarPerfilUsuario(
                usuario.id
            );

        if (!resultadoPerfil?.sucesso) {

            console.error(
                '❌ Não foi possível verificar o perfil:',
                resultadoPerfil?.mensagem
            );

            /*
               A consulta falhou.

               Não redirecionamos para configurar-conta.html
               porque isso poderia fazer um usuário que já possui
               perfil criar um fluxo incorreto.

               Liberamos o controle para uma nova tentativa.
            */
            redirecionandoAposAutenticacao =
                false;

            return;
        }

        /* ====================================================
           USUÁRIO JÁ POSSUI PERFIL
        ==================================================== */

        if (resultadoPerfil.possuiPerfil) {

            console.log(
                '✅ Usuário já possui perfil.'
            );

            console.log(
                '👤 Perfil:',
                resultadoPerfil.perfil
            );

            console.log(
                '➡️ Redirecionando para index.html...'
            );

            window.location.href =
                'index.html';

            return;
        }

        /* ====================================================
           USUÁRIO AINDA NÃO POSSUI PERFIL
        ==================================================== */

        console.log(
            '🆕 Usuário autenticado sem perfil.'
        );

        console.log(
            '➡️ Redirecionando para configurar-conta.html...'
        );

        window.location.href =
            'configurar-conta.html';

    } catch (erro) {

        console.error(
            '❌ Erro ao processar usuário autenticado:',
            erro
        );

        /*
           Permite uma nova tentativa caso ocorra uma falha
           inesperada durante a verificação.
        */
        redirecionandoAposAutenticacao =
            false;
    }
}


/* ============================================================
   ALTERNAR LOGIN / CADASTRO
============================================================ */

function alternarAba(tipo) {

    const toggleContainer =
        document.querySelector(
            '.auth-toggle-container'
        );

    const tabLogin =
        document.getElementById(
            'tab-login'
        );

    const tabCadastro =
        document.getElementById(
            'tab-cadastro'
        );

    const containerConteudo =
        document.getElementById(
            'auth-content-container'
        );

    if (
        !toggleContainer ||
        !tabLogin ||
        !tabCadastro ||
        !containerConteudo
    ) {

        console.error(
            '❌ Elementos da autenticação não encontrados.'
        );

        return;
    }


    /* ========================================================
       LOGIN
    ======================================================== */

    if (tipo === 'login') {

        toggleContainer.classList.remove(
            'right'
        );

        tabLogin.classList.add(
            'active'
        );

        tabCadastro.classList.remove(
            'active'
        );

        containerConteudo.innerHTML = `

            <form
                class="auth-form-pane"
                onsubmit="realizarLogin(event)"
                novalidate
            >

                <div class="form-group">

                    <label for="login-email">
                        E-mail
                    </label>

                    <input
                        type="email"
                        id="login-email"
                        name="email"
                        class="input-custom"
                        placeholder="seu@email.com"
                        autocomplete="email"
                        required
                    >

                </div>

                <div class="form-group">

                    <label for="login-senha">
                        Senha
                    </label>

                    <input
                        type="password"
                        id="login-senha"
                        name="senha"
                        class="input-custom"
                        placeholder="Sua senha"
                        autocomplete="current-password"
                        required
                    >

                </div>

                <div
                    style="
                        display: flex;
                        justify-content: flex-end;
                        margin-top: -4px;
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
                    style="margin-top: 4px;"
                >
                    Entrar na Conta
                </button>

                <div class="auth-divider">

                    <span>
                        ou entre com
                    </span>

                </div>

                <div class="social-buttons-container">

                    <button
                        type="button"
                        class="btn-social"
                        onclick="loginSocial('Google')"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            style="
                                width: 16px;
                                height: 16px;
                            "
                        >

                            <path
                                fill="#4285F4"
                                d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"
                            />

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
                                width: 16px;
                                height: 16px;
                            "
                        >

                            <path
                                fill="#0f172a"
                                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51.78 0 2.26-1.07 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8-.75 1.51-.7 1.55c.53.04 1.34-.33 1.81-.72z"
                            />

                        </svg>

                        Apple

                    </button>

                </div>

            </form>
        `;

        const email =
            document.querySelector(
                '#login-email'
            );

        const senha =
            document.querySelector(
                '#login-senha'
            );

        prepararLimpezaErroCampo(email);
        prepararLimpezaErroCampo(senha);

        return;
    }


    /* ========================================================
       CADASTRO
    ======================================================== */

    toggleContainer.classList.add(
        'right'
    );

    tabCadastro.classList.add(
        'active'
    );

    tabLogin.classList.remove(
        'active'
    );

    containerConteudo.innerHTML = `

        <form
            class="auth-form-pane"
            onsubmit="realizarCadastro(event)"
            style="margin-top: 14px;"
            novalidate
        >

            <div class="form-group">

                <label for="cadastro-nome">
                    Nome Completo
                </label>

                <input
                    type="text"
                    id="cadastro-nome"
                    name="nome"
                    class="input-custom"
                    placeholder="Seu nome"
                    autocomplete="name"
                    required
                >

            </div>

            <div class="form-group">

                <label for="cadastro-email">
                    E-mail
                </label>

                <input
                    type="email"
                    id="cadastro-email"
                    name="email"
                    class="input-custom"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    required
                >

            </div>

            <div class="form-group">

                <label for="cadastro-senha">
                    Criar Senha
                </label>

                <input
                    type="password"
                    id="cadastro-senha"
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

                <p class="cadastro-artista-descricao">
                    Quero criar um perfil para divulgar meu trabalho
                    e receber oportunidades.
                </p>

            </div>

            <div
                id="tipo-artista-container"
                class="form-group cadastro-tipo-artista"
                style="display: none;"
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
                        display: block;
                        margin-top: 6px;
                        color: #64748b;
                        font-size: 12px;
                    "
                >
                    Você poderá completar seu perfil artístico depois.
                </small>

            </div>

            <button
                type="submit"
                class="btn-continuar-proximo"
                style="margin-top: 4px;"
            >
                Criar Conta
            </button>

            <div class="auth-divider">

                <span>
                    ou cadastre-se com
                </span>

            </div>

            <div class="social-buttons-container">

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


/* ============================================================
   TIPO DE ARTISTA
============================================================ */

function alternarTipoArtista() {

    const checkbox =
        document.getElementById(
            'sou-artista'
        );

    const container =
        document.getElementById(
            'tipo-artista-container'
        );

    const select =
        document.getElementById(
            'tipo-artista'
        );

    if (
        !checkbox ||
        !container ||
        !select
    ) {

        console.error(
            '❌ Elementos do tipo de artista não encontrados.'
        );

        return;
    }

    if (checkbox.checked) {

        container.style.display =
            'block';

        select.required =
            true;

    } else {

        container.style.display =
            'none';

        select.required =
            false;

        select.value =
            '';
    }
}


/* ============================================================
   REALIZAR LOGIN
============================================================ */

async function realizarLogin(e) {

    e.preventDefault();

    const formulario =
        e.target;

    const botao =
        formulario.querySelector(
            'button[type="submit"]'
        );

    const campoEmail =
        formulario.querySelector(
            'input[name="email"]'
        );

    const campoSenha =
        formulario.querySelector(
            'input[name="senha"]'
        );

    prepararLimpezaErroCampo(
        campoEmail
    );

    prepararLimpezaErroCampo(
        campoSenha
    );

    limparErrosFormulario(
        formulario
    );

    const email =
        campoEmail?.value
            .trim()
            .toLowerCase() || '';

    const senha =
        campoSenha?.value || '';


    /* ========================================================
       VALIDAÇÃO LOCAL
    ======================================================== */

    if (!email) {

        mostrarErroCampo(
            campoEmail,
            'Informe seu e-mail.'
        );

        focarCampoComErro(
            campoEmail
        );

        return;
    }

    if (!campoEmail.checkValidity()) {

        mostrarErroCampo(
            campoEmail,
            'Informe um e-mail válido.'
        );

        focarCampoComErro(
            campoEmail
        );

        return;
    }

    if (!senha) {

        mostrarErroCampo(
            campoSenha,
            'Informe sua senha.'
        );

        focarCampoComErro(
            campoSenha
        );

        return;
    }


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            'Entrando...';
    }


    try {

        const resultado =
            await Login.entrar({
                email,
                senha
            });

        if (!resultado?.sucesso) {

            if (
                resultado?.tipo === 'email'
            ) {

                mostrarErroCampo(
                    campoEmail,
                    resultado.mensagem
                );

                focarCampoComErro(
                    campoEmail
                );

            } else {

                mostrarErroCampo(
                    campoSenha,
                    resultado?.mensagem ||
                    'E-mail ou senha incorretos.'
                );

                focarCampoComErro(
                    campoSenha
                );
            }

            return;
        }


        /* ====================================================
           LOGIN TRADICIONAL REALIZADO

           O login tradicional já possui perfil porque o
           Cadastro.criar() cria o perfil antes.

           Portanto preservamos o comportamento existente:
           destino salvo ou index.html.
        ==================================================== */

        console.log(
            '➡️ Login tradicional realizado com sucesso.'
        );

        const destinoSalvo =
            sessionStorage.getItem(
                'musicalworld_destino_login'
            );

        if (destinoSalvo) {

            console.log(
                '📍 Destino encontrado:',
                destinoSalvo
            );

            sessionStorage.removeItem(
                'musicalworld_destino_login'
            );

            window.location.href =
                destinoSalvo;

        } else {

            window.location.href =
                'index.html';
        }

    } catch (erro) {

        console.error(
            '❌ Erro inesperado ao processar login:',
            erro
        );

        mostrarErroCampo(
            campoSenha,
            'Ocorreu um erro ao entrar. Tente novamente.'
        );

        focarCampoComErro(
            campoSenha
        );

    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                'Entrar na Conta';
        }
    }
}


/* ============================================================
   REALIZAR CADASTRO
============================================================ */

async function realizarCadastro(e) {

    e.preventDefault();

    const formulario =
        e.target;

    const botao =
        formulario.querySelector(
            'button[type="submit"]'
        );

    const campoNome =
        formulario.querySelector(
            'input[name="nome"]'
        );

    const campoEmail =
        formulario.querySelector(
            'input[name="email"]'
        );

    const campoSenha =
        formulario.querySelector(
            'input[name="senha"]'
        );

    const campoArtista =
        formulario.querySelector(
            'input[name="souArtista"]'
        );

    const campoTipoArtista =
        formulario.querySelector(
            'select[name="tipoArtista"]'
        );

    limparErrosFormulario(
        formulario
    );

    const nome =
        campoNome?.value
            .trim() || '';

    const email =
        campoEmail?.value
            .trim()
            .toLowerCase() || '';

    const senha =
        campoSenha?.value || '';

    const souArtista =
        campoArtista?.checked === true;

    const tipoArtista =
        campoTipoArtista?.value
            .trim() || '';

    const tipoPerfil =
        souArtista
            ? 'artista'
            : 'contratante';


    /* ========================================================
       VALIDAÇÕES VISUAIS
    ======================================================== */

    if (!nome) {

        mostrarErroCampo(
            campoNome,
            'Informe seu nome.'
        );

        focarCampoComErro(
            campoNome
        );

        return;
    }

    if (!email) {

        mostrarErroCampo(
            campoEmail,
            'Informe seu e-mail.'
        );

        focarCampoComErro(
            campoEmail
        );

        return;
    }

    if (!campoEmail.checkValidity()) {

        mostrarErroCampo(
            campoEmail,
            'Informe um e-mail válido.'
        );

        focarCampoComErro(
            campoEmail
        );

        return;
    }

    if (!senha || senha.length < 6) {

        mostrarErroCampo(
            campoSenha,
            'A senha deve ter pelo menos 6 caracteres.'
        );

        focarCampoComErro(
            campoSenha
        );

        return;
    }

    if (
        souArtista &&
        !tipoArtista
    ) {

        mostrarErroCampo(
            campoTipoArtista,
            'Selecione seu tipo de artista.'
        );

        focarCampoComErro(
            campoTipoArtista
        );

        return;
    }


    if (botao) {

        botao.disabled =
            true;

        botao.textContent =
            'Criando conta...';
    }


    try {

        const resultado =
            await Cadastro.criar({

                nome,

                email,

                senha,

                tipoPerfil,

                tipoArtista:
                    souArtista
                        ? tipoArtista
                        : null

            });


        if (!resultado?.sucesso) {

            let campoErro;

            if (
                resultado.campo === 'nome'
            ) {

                campoErro =
                    campoNome;

            } else if (
                resultado.campo === 'email'
            ) {

                campoErro =
                    campoEmail;

            } else if (
                resultado.campo === 'senha'
            ) {

                campoErro =
                    campoSenha;

            } else if (
                resultado.campo === 'tipoArtista'
            ) {

                campoErro =
                    campoTipoArtista;
            }


            if (campoErro) {

                mostrarErroCampo(
                    campoErro,
                    resultado.mensagem
                );

                focarCampoComErro(
                    campoErro
                );

            } else {

                alert(
                    resultado.mensagem ||
                    'Não foi possível concluir o cadastro.'
                );
            }

            return;
        }


        if (souArtista) {

            alert(
                'Conta criada com sucesso!\n\n' +
                'Seu perfil artístico foi criado.\n\n' +
                'Agora você poderá completar as informações do seu perfil.'
            );

        } else {

            alert(
                'Conta criada com sucesso!\n\n' +
                'Seu perfil já foi criado e sua conta está pronta para uso.'
            );
        }


        alternarAba(
            'login'
        );

    } catch (erro) {

        console.error(
            '❌ Erro inesperado ao processar cadastro:',
            erro
        );

        alert(
            'Não foi possível concluir o cadastro. Tente novamente.'
        );

    } finally {

        if (botao) {

            botao.disabled =
                false;

            botao.textContent =
                'Criar Conta';
        }
    }
}


/* ============================================================
   LOGIN SOCIAL
============================================================ */

async function loginSocial(provedor) {

    console.log(
        '🔐 Solicitando autenticação social:',
        provedor
    );

    const resultado =
        await Login.social(
            provedor
        );

    if (
        !resultado?.sucesso
    ) {

        alert(
            resultado?.mensagem ||
            'Não foi possível realizar a autenticação.'
        );

        return;
    }

    /*
       O Supabase redireciona automaticamente para o provedor.

       Quando o provedor retornar para login.html,
       a inicialização da página detectará a sessão e chamará:

           processarUsuarioAutenticado()

       Não fazemos redirecionamento aqui.
    */

    console.log(
        `🌐 Autenticação ${provedor} iniciada.`
    );
}


/* ============================================================
   RECUPERAÇÃO DE SENHA
============================================================ */

async function esqueciSenha(e) {

    e.preventDefault();

    const email =
        prompt(
            'Digite seu e-mail cadastrado para recuperar a senha:'
        );

    if (!email) {
        return;
    }

    const emailNormalizado =
        email
            .trim()
            .toLowerCase();

    if (!emailNormalizado) {

        alert(
            'Informe um e-mail válido.'
        );

        return;
    }


    const resultado =
        await Login.recuperarSenha(
            emailNormalizado
        );


    if (!resultado?.sucesso) {

        alert(
            resultado?.mensagem ||
            'Não foi possível solicitar a recuperação da senha.'
        );

        return;
    }


    alert(
        resultado.mensagem
    );
}


/* ============================================================
   PROCESSAR SESSÃO EXISTENTE
============================================================ */

/**
 * Verifica se existe uma sessão quando login.html é aberta.
 *
 * Isso é especialmente importante para OAuth.
 *
 * Depois que o Google autentica:
 *
 * Google
 *   ↓
 * Supabase
 *   ↓
 * login.html
 *
 * Ao carregar novamente esta página, o Supabase já possui
 * uma sessão. Aqui verificamos o perfil e escolhemos o destino.
 */
async function processarSessaoInicial() {

    console.log(
        '🔎 Verificando sessão existente...'
    );

    try {

        const sessao =
            await Login.verificarSessaoInicial();

        if (!sessao?.user) {

            console.log(
                '🔓 Nenhuma sessão existente.'
            );

            return;
        }


        console.log(
            '🔐 Sessão encontrada.'
        );

        console.log(
            '👤 Usuário:',
            sessao.user
        );


        /*
           Se a URL contém parâmetros relacionados ao OAuth,
           marcamos o fluxo apenas para fins de diagnóstico.
        */
        const urlAtual =
            new URL(
                window.location.href
            );

        const possuiOAuthNaURL =
            urlAtual.searchParams.has('code') ||
            urlAtual.hash.includes('access_token') ||
            urlAtual.hash.includes('refresh_token');

        if (possuiOAuthNaURL) {

            processandoRetornoOAuth =
                true;

            console.log(
                '🔗 Retorno de autenticação OAuth detectado.'
            );
        }


        /*
           O usuário possui uma sessão.
           Agora precisamos verificar se ele já possui perfil.
        */
        await processarUsuarioAutenticado(
            sessao.user
        );

    } catch (erro) {

        console.error(
            '❌ Erro ao processar sessão inicial:',
            erro
        );
    }
}


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

window.onload = function () {

    console.log(
        '🚀 Inicializando autenticação do MusicalWorld...'
    );


    /*
       Monta a aba inicial.
    */
    alternarAba(
        'login'
    );


    /*
       Primeiro verificamos a sessão existente.

       Isso cobre principalmente o retorno do Google/Apple.
    */
    processarSessaoInicial();


    /*
       Mantemos o observador de autenticação para diagnóstico
       e para acompanhar mudanças futuras de sessão.

       O redirecionamento principal é feito por
       processarSessaoInicial(), evitando chamadas duplicadas.
    */
    Login.observarAutenticacao();

};