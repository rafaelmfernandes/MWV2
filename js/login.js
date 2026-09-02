function alternarAba(tipo) {
  const toggleContainer = document.querySelector('.auth-toggle-container');
  const tabLogin = document.getElementById('tab-login');
  const tabCadastro = document.getElementById('tab-cadastro');
  const containerConteudo = document.getElementById('auth-content-container');

  // Se o usuário clicou em 'login'
  if (tipo === 'login') {
    toggleContainer.classList.remove('right');
    tabLogin.classList.add('active');
    tabCadastro.classList.remove('active');
    
    containerConteudo.innerHTML = `
      <form class="auth-form-pane" onsubmit="realizarLogin(event)">
        <div class="form-group">
          <label>E-mail</label>
          <input type="email" class="input-custom" placeholder="seu@email.com" required>
        </div>
        <div class="form-group">
          <label>Senha</label>
          <input type="password" class="input-custom" placeholder="Sua senha" required>
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-top: -4px;">
          <a href="#" onclick="esqueciSenha(event)" style="font-size: 11px; color: #3b82f6; text-decoration: none;">Esqueceu a senha?</a>
        </div>

        <button type="submit" class="btn-continuar-proximo" style="margin-top: 4px;">Entrar na Conta</button>

        <div class="auth-divider">
          <span>ou entre com</span>
        </div>

        <div class="social-buttons-container">
          <button type="button" class="btn-social" onclick="loginSocial('Google')">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path fill="#4285F4" d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"/></svg>
            Google
          </button>
          <button type="button" class="btn-social" onclick="loginSocial('Apple')">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path fill="#fff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8c-.59.61-.75 1.51-.7 1.55.53.04 1.34-.33 1.81-.72z"/></svg>
            Apple
          </button>
        </div>
      </form>
    `;
  } else {
    // Se o usuário clicou em 'cadastrar' ou trocou entre as sub-categorias
    toggleContainer.classList.add('right');
    tabCadastro.classList.add('active');
    tabLogin.classList.remove('active');

    // Define 'cliente' como padrão se nenhum subtipo foi passado
    const subTipo = (tipo === 'cantor' || tipo === 'musico') ? tipo : 'cliente';

    containerConteudo.innerHTML = `
      <div class="cadastro-tipo-container">
        <div class="cadastro-tipo-slider ${subTipo}"></div>
        <button type="button" class="tipo-btn ${subTipo === 'cliente' ? 'active' : ''}" onclick="alternarAba('cliente')">Cliente</button>
        <button type="button" class="tipo-btn ${subTipo === 'cantor' ? 'active' : ''}" onclick="alternarAba('cantor')">Cantor</button>
        <button type="button" class="tipo-btn ${subTipo === 'musico' ? 'active' : ''}" onclick="alternarAba('musico')">Músico</button>
      </div>

      <form class="auth-form-pane" onsubmit="realizarCadastro(event, '${subTipo}')" style="margin-top: 14px;">
        <div class="form-group">
          <label>Nome Completo</label>
          <input type="text" class="input-custom" placeholder="${subTipo === 'cliente' ? 'Seu nome' : 'Nome artístico / Banda'}" required>
        </div>
        <div class="form-group">
          <label>E-mail</label>
          <input type="email" class="input-custom" placeholder="seu@email.com" required>
        </div>
        <div class="form-group">
          <label>Criar Senha</label>
          <input type="password" class="input-custom" placeholder="Mínimo 6 caracteres" required>
        </div>
        
        ${subTipo !== 'cliente' ? `
        <div class="form-group">
          <label>Estilo Principal</label>
          <input type="text" class="input-custom" placeholder="Ex: Sertanejo, Rock, MPB" required>
        </div>` : ''}

        <button type="submit" class="btn-continuar-proximo" style="margin-top: 4px;">Criar Conta de ${subTipo.charAt(0).toUpperCase() + subTipo.slice(1)}</button>

        <div class="auth-divider">
          <span>ou cadastre-se com</span>
        </div>

        <div class="social-buttons-container">
          <button type="button" class="btn-social" onclick="loginSocial('Google')">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path fill="#4285F4" d="M23.745 12.27c-.07-.84-.63-1.56-1.42-1.87H12v4.74h6.58c-.3 1.54-1.67 2.69-3.28 2.69-1.99 0-3.6-1.61-3.6-3.6s1.61-3.6 3.6-3.6c.92 0 1.76.35 2.4 1l3.54-3.54c-1.39-1.3-3.22-2.1-5.94-2.1-4.97 0-9 4.03-9 9s4.03 9 9 9c4.97 0 9-4.03 9-9 0-.25-.03-.5-.05-.73z"/></svg>
            Google
          </button>
          <button type="button" class="btn-social" onclick="loginSocial('Apple')">
            <svg viewBox="0 0 24 24" style="width: 16px; height: 16px;"><path fill="#fff" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.56c.57-.69 0-1.63 0-1.63s-1.01.12-1.67.8c-.59.61-.75 1.51-.7 1.55.53.04 1.34-.33 1.81-.72z"/></svg>
            Apple
          </button>
        </div>
      </form>
    `;
  }
}

function realizarLogin(e) {
  e.preventDefault();
  window.location.href = 'index.html';
}

function realizarCadastro(e, tipo) {
  e.preventDefault();
  alert(`Conta de ${tipo} criada com sucesso!`);
  window.location.href = 'index.html';
}

function loginSocial(provedor) {
  alert(`Autenticando com ${provedor}...`);
  window.location.href = 'index.html';
}

function esqueciSenha(e) {
  e.preventDefault();
  const email = prompt('Digite seu e-mail cadastrado para recuperar a senha:');
  if (email) {
    alert(`Instruções de recuperação enviadas para: ${email}`);
  }
}

window.onload = function() {
  alternarAba('login');
};