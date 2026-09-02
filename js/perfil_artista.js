function mudarAba(abaId, elementoBotao) {
  // Remove a classe ativo de todas as abas de conteúdo
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('ativo');
  });

  // Remove a classe ativo de todos os botões de abas
  document.querySelectorAll('.tab-item').forEach(btn => {
    btn.classList.remove('ativo');
  });

  // Adiciona a classe ativo na aba selecionada
  const abaAlvo = document.getElementById('aba-' + abaId);
  if (abaAlvo) {
    abaAlvo.classList.add('ativo');
  }
  
  // Adiciona a classe ativo no botão clicado
  if (elementoBotao) {
    elementoBotao.classList.add('ativo');
  }
}