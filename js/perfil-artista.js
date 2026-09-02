// Controle de Abas do Perfil
function mudarAba(abaNome, elementoBtn) {
  // Remove a classe ativo de todos os botões de abas
  const botoes = document.querySelectorAll('.profile-tab');
  botoes.forEach(btn => btn.classList.remove('ativo'));

  // Adiciona a classe ativo no botão clicado
  if (elementoBtn) {
    elementoBtn.classList.add('ativo');
  }

  // Esconde todas as seções de conteúdo
  const conteudos = document.querySelectorAll('.tab-content');
  conteudos.forEach(content => content.classList.remove('ativo'));

  // Mostra a seção correspondente
  const alvo = document.getElementById(`aba-${abaNome}`);
  if (alvo) {
    alvo.classList.add('ativo');
  }
}

function selecionarServico(nome, preco) {
  alert(`Serviço selecionado: ${nome} (${preco}). Prosseguindo para contratação...`);
}

function acaoContratar() {
  alert("Iniciando processo de contratação direta com Rafael Melo.");
}

function solicitarData() {
  alert("Solicitação de data enviada com sucesso para o artista!");
}