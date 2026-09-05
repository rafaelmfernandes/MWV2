function alternarAba(tipo) {
const toggleContainer = document.querySelector('.auth-toggle-container');
const tabLogin = document.getElementById('tab-login');
const tabCadastro = document.getElementById('tab-cadastro');
const containerConteudo = document.getElementById('auth-content-container');

if (tipo === 'login') {
toggleContainer.classList.remove('right');
tabLogin.classList.add('active');
tabCadastro.classList.remove('active');


containerConteudo.innerHTML = `
  <form class="auth-form-pane" onsubmit="realizarLogin(event)">
    <div class="form-group">
      <label>E-mail</label>
      <input type="email" name="email" class="input-custom" placeholder="seu@email.com" required>
    </div>

    <div class="form-group">
      <label>Senha</label>
      <input type="password" name="senha" class="input-custom" placeholder="Sua senha" required>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: -4px;">
      <a href="#" onclick="esqueciSenha(event)" class="link-esqueci-senha">
        Esqueceu a senha?
      </a>
    </div>

    <button type="submit" class="btn-continuar-proximo" style="margin-top: 4px;">
      Entrar na Conta
    </button>

    <div class="auth-divider">
      <span>ou entre com</span>
    </div>

    <div class="social-buttons-container">

      <button type="button" class="btn-social" onclick="loginSocial('Google')">
        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
          <path fill="#4285F4" d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"/>
        </svg>
        Google
      </button>

      <button type="button" class="btn-social" onclick="loginSocial('Apple')">
        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
          <path fill="#0f172a" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8c-.59.61-.75 1.51-.7 1.55.53.04 1.34-.33 1.81-.72z"/>
        </svg>
        Apple
      </button>

    </div>
  </form>
`;


}

else {
toggleContainer.classList.add('right');
tabCadastro.classList.add('active');
tabLogin.classList.remove('active');


const subTipo = (tipo === 'cantor' || tipo === 'musico') ? tipo : 'cliente';

containerConteudo.innerHTML = `
  <div class="cadastro-tipo-container">

    <div class="cadastro-tipo-slider ${subTipo}"></div>

    <button
      type="button"
      class="tipo-btn ${subTipo === 'cliente' ? 'active' : ''}"
      onclick="alternarAba('cliente')">
      Cliente
    </button>

    <button
      type="button"
      class="tipo-btn ${subTipo === 'cantor' ? 'active' : ''}"
      onclick="alternarAba('cantor')">
      Cantor
    </button>

    <button
      type="button"
      class="tipo-btn ${subTipo === 'musico' ? 'active' : ''}"
      onclick="alternarAba('musico')">
      Músico
    </button>

  </div>

  <form
    class="auth-form-pane"
    onsubmit="realizarCadastro(event, '${subTipo}')"
    style="margin-top: 14px;">

    <div class="form-group">
      <label>Nome Completo</label>

      <input
        type="text"
        name="nome"
        class="input-custom"
        placeholder="${subTipo === 'cliente' ? 'Seu nome' : 'Nome artístico / Banda'}"
        required>
    </div>

    <div class="form-group">
      <label>E-mail</label>

      <input
        type="email"
        name="email"
        class="input-custom"
        placeholder="seu@email.com"
        required>
    </div>

    <div class="form-group">
      <label>Criar Senha</label>

      <input
        type="password"
        name="senha"
        class="input-custom"
        placeholder="Mínimo 6 caracteres"
        minlength="6"
        required>
    </div>

    ${
      subTipo === 'cantor'
        ? `
          <div class="form-group">
            <label>Estilo Musical Principal</label>

            <input
              type="text"
              class="input-custom"
              placeholder="Ex: Sertanejo, Rock, MPB"
              required>
          </div>
        `
        : ''
    }

    ${
      subTipo === 'musico'
        ? `
          <div class="form-group">
            <label>Instrumento Principal</label>

            <input
              type="text"
              class="input-custom"
              placeholder="Ex: Guitarrista, Violonista, Baterista"
              required>
          </div>

          <div class="form-group">
            <label>Estilo Musical</label>

            <input
              type="text"
              class="input-custom"
              placeholder="Ex: Jazz, Samba, Rock"
              required>
          </div>
        `
        : ''
    }

    <button
      type="submit"
      class="btn-continuar-proximo"
      style="margin-top: 4px;">
      Criar Conta de ${subTipo.charAt(0).toUpperCase() + subTipo.slice(1)}
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
          <path fill="#4285F4" d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"/>
        </svg>

        Google
      </button>

      <button
        type="button"
        class="btn-social"
        onclick="loginSocial('Apple')">

        <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;">
          <path fill="#0f172a" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8c-.59.61-.75 1.51-.7 1.55.53.04 1.34-.33 1.81-.72z"/>
        </svg>

        Apple
      </button>

    </div>

  </form>
`;


}
}

async function realizarLogin(e) {

e.preventDefault();

console.log('🔐 Login será conectado ao Supabase na próxima etapa.');

window.location.href = 'index.html';
}

async function realizarCadastro(e, tipo) {

e.preventDefault();

const formulario = e.target;
const botao = formulario.querySelector('button[type="submit"]');

const nome = formulario.querySelector('input[name="nome"]')?.value || '';
const email = formulario.querySelector('input[name="email"]')?.value || '';
const senha = formulario.querySelector('input[name="senha"]')?.value || '';

if (botao) {
botao.disabled = true;
botao.textContent = 'Criando conta...';
}

try {


console.log('📝 Enviando cadastro para Cadastro.js...');
console.log('👤 Tipo selecionado:', tipo);

// ==========================================
// 1. CRIAR CONTA NO SUPABASE AUTH
// ==========================================

const resultadoCadastro = await Cadastro.criar({
  nome: nome,
  email: email,
  senha: senha
});

if (!resultadoCadastro.sucesso) {

  alert(resultadoCadastro.mensagem);

  return;
}

console.log('✅ Conta criada:', resultadoCadastro);

// ==========================================
// 2. PEGAR O ID DO USUÁRIO CRIADO
// ==========================================

const usuarioId = resultadoCadastro.usuario?.id;

if (!usuarioId) {

  console.error(
    '❌ O Supabase criou a conta, mas não retornou o ID do usuário.'
  );

  alert(
    'A conta foi criada, mas não conseguimos identificar o usuário.'
  );

  return;
}

console.log('🆔 ID do usuário:', usuarioId);

// ==========================================
// 3. DEFINIR O TIPO DE PERFIL DO BANCO
// ==========================================

let tipoPerfil;

if (tipo === 'cantor' || tipo === 'musico') {

  tipoPerfil = 'artista';

} else {

  tipoPerfil = 'contratante';

}

console.log('🎭 Tipo de perfil no banco:', tipoPerfil);

// ==========================================
// 4. CRIAR O PERFIL
// ==========================================

const resultadoPerfil = await Perfil.criar({

  usuarioId: usuarioId,

  tipoPerfil: tipoPerfil,

  nomeExibicao: nome

});

if (!resultadoPerfil.sucesso) {

  console.error(
    '❌ Conta criada, mas o perfil não foi criado:',
    resultadoPerfil
  );

  alert(
    'Sua conta foi criada, mas ocorreu um problema ao criar seu perfil.\n\n' +
    resultadoPerfil.mensagem
  );

  return;
}

console.log('✅ Perfil criado:', resultadoPerfil);

// ==========================================
// 5. VERIFICAR CONFIRMAÇÃO DE E-MAIL
// ==========================================

if (!resultadoCadastro.sessao) {

  console.log(
    '📧 Cadastro aguardando confirmação de e-mail.'
  );

  alert(
    'Conta e perfil criados com sucesso!\n\n' +
    'Enviamos um link de confirmação para seu e-mail. ' +
    'Confirme seu e-mail antes de entrar na conta.'
  );

  alternarAba('login');

  return;
}

// ==========================================
// 6. USUÁRIO JÁ ESTÁ AUTENTICADO
// ==========================================

alert(
  'Conta e perfil criados com sucesso!'
);

window.location.href = 'index.html';


}

catch (erro) {


console.error(
  '❌ Erro inesperado no cadastro:',
  erro
);

alert(
  'Ocorreu um erro inesperado ao criar sua conta.'
);


}

finally {


if (botao) {

  botao.disabled = false;

  botao.textContent =
    `Criar Conta de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;

}


}

}



function loginSocial(provedor) {

alert(`Autenticando com ${provedor}...`);

window.location.href = 'index.html';
}

function esqueciSenha(e) {

e.preventDefault();

const email = prompt(
'Digite seu e-mail cadastrado para recuperar a senha:'
);

if (email) {


alert(
  `Instruções de recuperação enviadas para: ${email}`
);


}
}

window.onload = function() {

alternarAba('login');

};
