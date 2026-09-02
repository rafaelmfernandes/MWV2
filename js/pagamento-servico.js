window.onload = function() {
  // Carrega os dados do evento armazenados no passo anterior
  const dadosEvento = JSON.parse(localStorage.getItem('evento_artista_atual') || '{}');
  
  document.getElementById('resumo-servico-nome').innerText = dadosEvento.servico || 'Serviço';
  document.getElementById('resumo-servico-preco').innerText = dadosEvento.preco || 'R$ 0,00';
  document.getElementById('resumo-local-data').innerText = `${dadosEvento.nomeLocal} • ${dadosEvento.dataDoEvento || ''}`;

  carregarCartoesSalvos();
};

function mudarMetodoPagamento(metodo) {
  const secaoCartoes = document.getElementById('secao-cartoes');
  if (metodo === 'cartao') {
    secaoCartoes.style.display = 'flex';
  } else {
    secaoCartoes.style.display = 'none';
  }
}

function carregarCartoesSalvos() {
  const container = document.getElementById('lista-cartoes-salvos');
  container.innerHTML = '';

  // Simula cartões salvos do usuário (ou puxa do localStorage)
  let cartoes = JSON.parse(localStorage.getItem('usuario_cartoes_salvos')) || [
    { id: '1', bandeira: 'Mastercard', final: '4892', principal: true },
    { id: '2', bandeira: 'Visa', final: '1023', principal: false }
  ];

  if (cartoes.length === 0) {
    container.innerHTML = '<span style="font-size: 12px; color: #71717a;">Nenhum cartão cadastrado.</span>';
    return;
  }

  cartoes.forEach((cartao, index) => {
    container.innerHTML += `
      <label class="payment-option" style="padding: 10px 14px;">
        <input type="radio" name="cartao_selecionado" value="${cartao.id}" ${index === 0 ? 'checked' : ''}>
        <div class="payment-info">
          <strong>${cartao.bandeira} •••• ${cartao.final}</strong>
          <span>${cartao.principal ? 'Cartão Principal' : 'Salvo na conta'}</span>
        </div>
      </label>
    `;
  });
}

function abrirModalNovoCartao() {
  document.getElementById('modal-cartao').style.display = 'flex';
}

function fecharModalNovoCartao() {
  document.getElementById('modal-cartao').style.display = 'none';
}

function salvarNovoCartao() {
  const numero = document.getElementById('novo-num-cartao').value;
  if (!numero || numero.length < 4) {
    alert('Insira um número de cartão válido.');
    return;
  }

  const finalCartao = numero.slice(-4);
  
  let cartoes = JSON.parse(localStorage.getItem('usuario_cartoes_salvos')) || [];
  
  const novoCartao = {
    id: Date.now().toString(),
    bandeira: 'Cartão',
    final: finalCartao,
    principal: cartoes.length === 0
  };

  cartoes.push(novoCartao);
  localStorage.setItem('usuario_cartoes_salvos', JSON.stringify(cartoes));

  fecharModalNovoCartao();
  carregarCartoesSalvos();
  alert('Cartão cadastrado com sucesso!');
}

function finalizarContratacao() {
  const metodoEscolhido = document.querySelector('input[name="forma_pagamento"]:checked').value;
  
  let dadosEvento = JSON.parse(localStorage.getItem('evento_artista_atual') || '{}');
  dadosEvento.formaPagamento = metodoEscolhido;
  
  if (metodoEscolhido === 'cartao') {
    const cartaoInput = document.querySelector('input[name="cartao_selecionado"]:checked');
    dadosEvento.cartaoId = cartaoInput ? cartaoInput.value : 'Novo Cartão';
  }

  localStorage.setItem('evento_artista_atual', JSON.stringify(dadosEvento));

  alert('Contratação realizada com sucesso! O artista já pode visualizar o evento e o status do pagamento.');
  // Redirecionar para a tela de pedidos/sucesso do usuário
}