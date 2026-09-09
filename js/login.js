function alternarAba(tipo) {
const toggleContainer = document.querySelector('.auth-toggle-container');
const tabLogin = document.getElementById('tab-login');
const tabCadastro = document.getElementById('tab-cadastro');
const containerConteudo = document.getElementById('auth-content-container');


if (!toggleContainer || !tabLogin || !tabCadastro || !containerConteudo) {
    console.error('❌ Elementos da autenticação não encontrados.');
    return;
}

if (tipo === 'login') {

    toggleContainer.classList.remove('right');

    tabLogin.classList.add('active');
    tabCadastro.classList.remove('active');

    containerConteudo.innerHTML = `
        <form class="auth-form-pane" onsubmit="realizarLogin(event)">

            <div class="form-group">
                <label>E-mail</label>

                <input
                    type="email"
                    name="email"
                    class="input-custom"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    required>
            </div>

            <div class="form-group">
                <label>Senha</label>

                <input
                    type="password"
                    name="senha"
                    class="input-custom"
                    placeholder="Sua senha"
                    autocomplete="current-password"
                    required>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: -4px;">
                <a
                    href="#"
                    onclick="esqueciSenha(event)"
                    class="link-esqueci-senha">
                    Esqueceu a senha?
                </a>
            </div>

            <button
                type="submit"
                class="btn-continuar-proximo"
                style="margin-top: 4px;">
                Entrar na Conta
            </button>

            <div class="auth-divider">
                <span>ou entre com</span>
            </div>

            <div class="social-buttons-container">

                <button
                    type="button"
                    class="btn-social"
                    onclick="loginSocial('Google')">

                    <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"/>
                    </svg>

                    Google
                </button>

                <button
                    type="button"
                    class="btn-social"
                    onclick="loginSocial('Apple')">

                    <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                        <path
                            fill="#0f172a"
                            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8c-.59.61-.75 1.51-.7 1.55.53.04 1.34-.33 1.81-.72z"/>
                    </svg>

                    Apple
                </button>

            </div>

        </form>
    `;

} else {

    toggleContainer.classList.add('right');

    tabCadastro.classList.add('active');
    tabLogin.classList.remove('active');

    containerConteudo.innerHTML = `
        <form
            class="auth-form-pane"
            onsubmit="realizarCadastro(event)"
            style="margin-top: 14px;">

            <div class="form-group">
                <label>Nome Completo</label>

                <input
                    type="text"
                    name="nome"
                    class="input-custom"
                    placeholder="Seu nome"
                    autocomplete="name"
                    required>
            </div>

            <div class="form-group">
                <label>E-mail</label>

                <input
                    type="email"
                    name="email"
                    class="input-custom"
                    placeholder="seu@email.com"
                    autocomplete="email"
                    required>
            </div>

            <div class="form-group">
                <label>Criar Senha</label>

                <input
                    type="password"
                    name="senha"
                    class="input-custom"
                    placeholder="Mínimo 6 caracteres"
                    autocomplete="new-password"
                    minlength="6"
                    required>
            </div>

            <!-- ==========================================
                 OPÇÃO DE ARTISTA
            =========================================== -->

            <div class="cadastro-artista-opcao">

                <label
                    for="sou-artista"
                    class="cadastro-artista-label">

                    <input
                        type="checkbox"
                        id="sou-artista"
                        name="souArtista"
                        onchange="alternarTipoArtista()">

                    <span>
                        Sou artista
                    </span>

                </label>

                <p class="cadastro-artista-descricao">
                    Quero criar um perfil para divulgar meu trabalho
                    e receber oportunidades.
                </p>

            </div>

            <!-- ==========================================
                 TIPO DE ARTISTA
            =========================================== -->

            <div
                id="tipo-artista-container"
                class="form-group cadastro-tipo-artista"
                style="display: none;">

                <label for="tipo-artista">
                    Tipo de artista
                </label>

                <select
                    id="tipo-artista"
                    name="tipoArtista"
                    class="input-custom">

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
                    ">
                    Você poderá completar seu perfil artístico depois.
                </small>

            </div>

            <button
                type="submit"
                class="btn-continuar-proximo"
                style="margin-top: 4px;">
                Criar Conta
            </button>

            <div class="auth-divider">
                <span>ou cadastre-se com</span>
            </div>

            <div class="social-buttons-container">

                <button
                    type="button"
                    class="btn-social"
                    onclick="loginSocial('Google')">

                    <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"/>
                    </svg>

                    Google
                </button>

                <button
                    type="button"
                    class="btn-social"
                    onclick="loginSocial('Apple')">

                    <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                        <path
                            fill="#0f172a"
                            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8-.75 1.51-.7 1.55c.53.04 1.34-.33 1.81-.72z"/>
                    </svg>

                    Apple
                </button>

            </div>

        </form>
    `;
}


}

// ============================================================
// ALTERNAR TIPO DE ARTISTA
// ============================================================

function alternarTipoArtista() {


const checkbox =
    document.getElementById('sou-artista');

const container =
    document.getElementById('tipo-artista-container');

const select =
    document.getElementById('tipo-artista');

if (!checkbox || !container || !select) {
    console.error(
        '❌ Elementos do tipo de artista não encontrados.'
    );

    return;
}

if (checkbox.checked) {

    container.style.display = 'block';

    select.required = true;

} else {

    container.style.display = 'none';

    select.required = false;

    select.value = '';
}


}

// ============================================================
// LOGIN
// ============================================================

async function realizarLogin(e) {


e.preventDefault();

const formulario = e.target;
const botao = formulario.querySelector('button[type="submit"]');

const email =
    formulario.querySelector('input[name="email"]')?.value
        .trim()
        .toLowerCase() || '';

const senha =
    formulario.querySelector('input[name="senha"]')?.value || '';

if (!email || !senha) {
    alert('Informe seu e-mail e sua senha.');
    return;
}

if (botao) {
    botao.disabled = true;
    botao.textContent = 'Entrando...';
}

try {

    console.log('======================================');
    console.log('🔐 INICIANDO LOGIN');
    console.log('======================================');
    console.log('📧 E-mail:', email);

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {

        console.error('❌ Erro no login:', error);

        const mensagem =
            (error.message || '').toLowerCase();

        if (
            mensagem.includes('invalid login credentials') ||
            mensagem.includes('invalid credentials')
        ) {

            alert('E-mail ou senha incorretos.');

        } else if (
            mensagem.includes('email not confirmed')
        ) {

            alert('Seu e-mail ainda não foi confirmado.');

        } else {

            alert(
                'Não foi possível entrar na conta.\n\n' +
                (error.message || 'Tente novamente.')
            );
        }

        return;
    }

    if (!data?.session || !data?.user) {

        console.error(
            '❌ Login retornou sem sessão ou usuário:',
            data
        );

        alert(
            'O login foi processado, mas não foi possível criar a sessão.'
        );

        return;
    }

    console.log('======================================');
    console.log('✅ LOGIN REALIZADO COM SUCESSO');
    console.log('======================================');

    console.log('👤 Usuário:', data.user);
    console.log('🆔 ID:', data.user.id);
    console.log('📧 E-mail:', data.user.email);
    console.log('🔐 Sessão criada:', !!data.session);

    // ========================================================
    // SALVAR DADOS BÁSICOS DA SESSÃO LOCALMENTE
    // ========================================================

    try {

        localStorage.setItem(
            'musicalworld_usuario_id',
            data.user.id
        );

        localStorage.setItem(
            'musicalworld_usuario_email',
            data.user.email || email
        );

    } catch (erroStorage) {

        console.warn(
            '⚠️ Não foi possível salvar dados auxiliares no localStorage:',
            erroStorage
        );
    }

    // ========================================================
    // CONFIRMAR SESSÃO ATRAVÉS DO MÓDULO Sessao
    // ========================================================

    if (window.Sessao) {

        const sessaoAtual =
            await Sessao.obter();

        if (sessaoAtual) {

            console.log(
                '🔐 Sessão confirmada pelo módulo Sessao.'
            );

            console.log(
                '👤 Usuário da sessão:',
                sessaoAtual.user
            );

        } else {

            console.warn(
                '⚠️ Login realizado, mas Sessao.obter() não retornou sessão.'
            );
        }

    } else {

        console.warn(
            '⚠️ Módulo Sessao não encontrado. Verifique Sessao.js.'
        );
    }

    // ========================================================
    // REDIRECIONAMENTO
    // ========================================================

    console.log(
        '➡️ Redirecionando para index.html...'
    );

    const destinoSalvo = null;

    if (destinoSalvo) {

        console.log(
            '📍 Destino encontrado após login:',
            destinoSalvo
        );

        sessionStorage.removeItem(
            'musicalworld_destino_login'
        );

        window.location.href =
            destinoSalvo;

    } else {

        console.log(
            '🏠 Nenhum destino salvo. Indo para o início.'
        );

        window.location.href =
            'index.html';
    }

} catch (erro) {

    console.error(
        '❌ Erro inesperado no login:',
        erro
    );

    alert(
        'Ocorreu um erro inesperado ao entrar na conta.'
    );

} finally {

    if (botao) {

        botao.disabled = false;
        botao.textContent = 'Entrar na Conta';

    }
}


}

// ============================================================
// CADASTRO
// ============================================================

async function realizarCadastro(e) {


e.preventDefault();

const formulario = e.target;
const botao = formulario.querySelector('button[type="submit"]');

const nome =
    formulario.querySelector('input[name="nome"]')?.value
        .trim() || '';

const email =
    formulario.querySelector('input[name="email"]')?.value
        .trim()
        .toLowerCase() || '';

const senha =
    formulario.querySelector('input[name="senha"]')?.value || '';

const souArtista =
    formulario.querySelector(
        'input[name="souArtista"]'
    )?.checked === true;

const tipoArtista =
    formulario.querySelector(
        'select[name="tipoArtista"]'
    )?.value
        .trim() || '';

// ========================================================
// VALIDAÇÕES
// ========================================================

if (!nome) {

    alert('Informe seu nome.');
    return;
}

if (!email) {

    alert('Informe seu e-mail.');
    return;
}

if (!senha || senha.length < 6) {

    alert(
        'A senha deve ter pelo menos 6 caracteres.'
    );

    return;
}

if (souArtista && !tipoArtista) {

    alert(
        'Selecione seu tipo de artista.'
    );

    formulario
        .querySelector('select[name="tipoArtista"]')
        ?.focus();

    return;
}

// ========================================================
// DEFINIR TIPO DE PERFIL
// ========================================================

const tipoPerfil =
    souArtista
        ? 'artista'
        : 'contratante';

console.log('📝 Iniciando cadastro oficial do MusicalWorld...');
console.log('👤 Nome:', nome);
console.log('📧 E-mail:', email);
console.log('🎭 Tipo de perfil:', tipoPerfil);
console.log(
    '🎤 Tipo de artista:',
    souArtista
        ? tipoArtista
        : 'Não é artista'
);

// ========================================================
// DADOS ENVIADOS PARA A EDGE FUNCTION
// ========================================================

const dadosCadastro = {
    nome,
    email,
    senha,
    tipoPerfil,
    tipoArtista: souArtista
        ? tipoArtista
        : null
};

console.log(
    '📦 Dados preparados para criar-conta:',
    {
        nome: dadosCadastro.nome,
        email: dadosCadastro.email,
        tipoPerfil: dadosCadastro.tipoPerfil,
        tipoArtista: dadosCadastro.tipoArtista
    }
);

if (botao) {

    botao.disabled = true;
    botao.textContent = 'Criando conta...';
}

try {

    // =====================================================
    // CHAMADA DA EDGE FUNCTION OFICIAL
    // =====================================================

    const resposta = await fetch(
        `${SUPABASE_URL}/functions/v1/criar-conta`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization':
                    `Bearer ${SUPABASE_ANON_KEY}`
            },

            body: JSON.stringify(dadosCadastro)
        }
    );

    let resultado;

    try {

        resultado =
            await resposta.json();

    } catch {

        resultado = null;
    }

    console.log(
        '📨 Resposta da criar-conta:',
        resultado
    );

    // =====================================================
    // ERRO NO CADASTRO
    // =====================================================

    if (
        !resposta.ok ||
        !resultado?.sucesso
    ) {

        console.error(
            '❌ A Edge Function recusou o cadastro:',
            resultado
        );

        if (resposta.status === 409) {

            alert(
                resultado?.mensagem ||
                'Este e-mail já está cadastrado.'
            );

        } else if (resposta.status === 400) {

            alert(
                resultado?.mensagem ||
                'Os dados informados não são válidos.'
            );

        } else {

            alert(
                resultado?.mensagem ||
                'Não foi possível concluir o cadastro.'
            );
        }

        return;
    }

    // =====================================================
    // SUCESSO
    // =====================================================

    console.log(
        '✅ Conta criada pela Edge Function:',
        resultado
    );

    if (resultado.usuario?.id) {

        try {

            localStorage.setItem(
                'musicalworld_usuario_id',
                resultado.usuario.id
            );

            localStorage.setItem(
                'musicalworld_usuario_email',
                resultado.usuario.email || email
            );

        } catch (erroStorage) {

            console.warn(
                '⚠️ Não foi possível salvar os dados locais:',
                erroStorage
            );
        }
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

    // =====================================================
    // VOLTAR PARA LOGIN
    // =====================================================

    alternarAba('login');

} catch (erro) {

    console.error(
        '❌ Erro inesperado ao chamar criar-conta:',
        erro
    );

    alert(
        'Não foi possível conectar ao serviço de cadastro.\n\n' +
        'Verifique sua conexão e tente novamente.'
    );

} finally {

    if (botao) {

        botao.disabled = false;
        botao.textContent = 'Criar Conta';
    }
}


}

// ============================================================
// LOGIN SOCIAL
// ============================================================

async function loginSocial(provedor) {


console.log(
    `🔐 Tentativa de autenticação social: ${provedor}`
);

if (
    provedor !== 'Google' &&
    provedor !== 'Apple'
) {

    alert(
        'Provedor de autenticação não suportado.'
    );

    return;
}

alert(
    `Autenticação com ${provedor} será configurada em uma próxima etapa.`
);


}

// ============================================================
// RECUPERAÇÃO DE SENHA
// ============================================================

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
    email.trim().toLowerCase();

if (!emailNormalizado) {
    alert('Informe um e-mail válido.');
    return;
}

try {

    console.log(
        '🔑 Solicitação de recuperação de senha:',
        emailNormalizado
    );

    const {
        error
    } =
        await supabaseClient.auth.resetPasswordForEmail(
            emailNormalizado,
            {
                redirectTo:
                    `${window.location.origin}/login.html`
            }
        );

    if (error) {

        console.error(
            '❌ Erro ao solicitar recuperação:',
            error
        );

        alert(
            'Não foi possível solicitar a recuperação da senha.\n\n' +
            (error.message || 'Tente novamente.')
        );

        return;
    }

    alert(
        'Se esse e-mail estiver cadastrado, ' +
        'você receberá as instruções para redefinir sua senha.'
    );

} catch (erro) {

    console.error(
        '❌ Erro inesperado na recuperação:',
        erro
    );

    alert(
        'Ocorreu um erro ao solicitar a recuperação da senha.'
    );
}


}

// ============================================================
// VERIFICAR SESSÃO AO CARREGAR LOGIN
// ============================================================

async function verificarSessaoInicial() {


try {

    console.log(
        '🔎 Verificando sessão existente...'
    );

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();

    if (error) {

        console.error(
            '❌ Erro ao verificar sessão:',
            error
        );

        return;
    }

    if (data?.session) {

        console.log(
            '🔐 Já existe uma sessão ativa.'
        );

        console.log(
            '👤 Usuário:',
            data.session.user
        );

        /*
         * Por enquanto não vamos redirecionar
         * automaticamente.
         *
         * Isso evita problemas durante nossos testes.
         * Depois criaremos um controlador central
         * de autenticação para todas as páginas.
         */

    } else {

        console.log(
            '🔓 Nenhuma sessão ativa.'
        );
    }

} catch (erro) {

    console.error(
        '❌ Erro ao verificar sessão inicial:',
        erro
    );
}


}

// ============================================================
// MONITORAR MUDANÇAS DE AUTENTICAÇÃO
// ============================================================

function observarAutenticacao() {


if (!supabaseClient?.auth) {

    console.error(
        '❌ Cliente Supabase não disponível.'
    );

    return;
}

supabaseClient.auth.onAuthStateChange(
    (evento, sessao) => {

        console.log(
            '🔄 Estado da autenticação:',
            evento
        );

        if (sessao?.user) {

            console.log(
                '👤 Usuário autenticado:',
                sessao.user.id
            );

        } else {

            console.log(
                '🔓 Nenhum usuário autenticado.'
            );
        }
    }
);


}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

window.onload = function() {


console.log(
    '🚀 Inicializando autenticação do MusicalWorld...'
);

alternarAba('login');

verificarSessaoInicial();

observarAutenticacao();


};
