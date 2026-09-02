function mudarAbaLogin(tipo, index) {
    const container = document.getElementById('authTabs');
    if (!container) return;

    const botoes = container.querySelectorAll('.tab-btn');
    botoes.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('ativo');
        } else {
            btn.classList.remove('ativo');
        }
    });

    const slider = container.querySelector('.slider-bg-duas');
    if (slider) {
        slider.style.transform = `translateX(${index * 100}%)`;
    }

    const loginTitle = document.getElementById('loginTitle');
    const loginSubtitle = document.getElementById('loginSubtitle');
    const googleText = document.getElementById('googleBtnText');
    const appleText = document.getElementById('appleBtnText');
    const submitBtn = document.getElementById('submitBtn');
    const nomeFieldWrapper = document.getElementById('nomeFieldWrapper');

    if (tipo === 'cadastrar') {
        if (loginTitle) loginTitle.innerText = 'Criar sua conta';
        if (loginSubtitle) loginSubtitle.innerText = 'Cadastre-se para começar a usar a plataforma.';
        if (googleText) googleText.innerText = 'Cadastrar com o Google';
        if (appleText) appleText.innerText = 'Cadastrar com a Apple';
        if (submitBtn) submitBtn.innerText = 'Cadastrar';
        if (nomeFieldWrapper) nomeFieldWrapper.style.display = 'block';
    } else {
        if (loginTitle) loginTitle.innerText = 'Bem-vindo de volta!';
        if (loginSubtitle) loginSubtitle.innerText = 'Acesse sua conta para gerenciar seus agendamentos.';
        if (googleText) googleText.innerText = 'Continuar com o Google';
        if (appleText) appleText.innerText = 'Continuar com a Apple';
        if (submitBtn) submitBtn.innerText = 'Entrar';
        if (nomeFieldWrapper) nomeFieldWrapper.style.display = 'none';
    }
}

function fazerLoginSocial(provedor) {
    alert(`Autenticando com ${provedor}... Redirecionando para o ArtistaShow.`);
    window.location.href = 'index.html';
}