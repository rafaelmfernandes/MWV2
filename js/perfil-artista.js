function mudarAba(abaId, elementoBtn) {
  // Remove a classe 'ativo' de todos os botões de aba
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('ativo');
  });
  
  // Adiciona a classe 'ativo' apenas no botão clicado
  if (elementoBtn) {
    elementoBtn.classList.add('ativo');
  }

  // Esconde todos os conteúdos de aba
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('ativo');
  });

  // Mostra o conteúdo correspondente à aba clicada
  const alvo = document.getElementById(`aba-${abaId}`);
  if (alvo) {
    alvo.classList.add('ativo');
  }
}

function selecionarServico(nome, preco) {
  alert(`Serviço selecionado: ${nome} - ${preco}`);
}