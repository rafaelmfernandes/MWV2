// ==========================================
// CONTROLE DE ABAS SUPERIORES (Conteúdo)
// ==========================================
function mudarCategoria(categoriaId, elementoBtn) {
  // Remove classe ativa de todas as abas
  const abas = document.querySelectorAll('.cat-tab');
  abas.forEach(tab => tab.classList.remove('ativo'));
  
  // Adiciona classe ativa na aba clicada
  elementoBtn.classList.add('ativo');

  // Oculta todos os conteúdos
  const conteudos = document.querySelectorAll('.cat-content');
  conteudos.forEach(content => content.classList.remove('ativo'));

  // Exibe o conteúdo correspondente
  const conteudoAtivo = document.getElementById(`cat-${categoriaId}`);
  if (conteudoAtivo) {
    conteudoAtivo.classList.add('ativo');
  }
}

// ==========================================
// CONTROLE DO MENU INFERIOR
// ==========================================
function mudarAbaInferior(abaName, elementoBtn) {
  if (abaName === 'anunciar') {
    abrirModalAnuncio();
    return; // Não altera o botão ativo inferior se for pra abrir modal
  }

  const itens = document.querySelectorAll('.bottom-nav-item');
  itens.forEach(item => item.classList.remove('ativo'));
  elementoBtn.classList.add('ativo');

  if (abaName === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================
// MODAL DE CRIAR ANÚNCIO
// ==========================================
function abrirModalAnuncio() {
  const modal = document.getElementById('modal-anunciar');
  modal.classList.add('ativo');
}

function fecharModalAnuncio() {
  const modal = document.getElementById('modal-anunciar');
  modal.classList.remove('ativo');
}

function fecharModalAnuncioFora(event) {
  const modal = document.getElementById('modal-anunciar');
  if (event.target === modal) {
    fecharModalAnuncio();
  }
}

function selecionarTipoAnuncio(tipo) {
  fecharModalAnuncio();
  alert(`Redirecionando para o fluxo de cadastro de anúncio: ${tipo.toUpperCase()}`);
}

// ==========================================
// MODAL DE FILTROS (Novo)
// ==========================================
function abrirModalFiltro() {
  const modal = document.getElementById('modal-filtro');
  modal.classList.add('ativo');
}

function fecharModalFiltro() {
  const modal = document.getElementById('modal-filtro');
  modal.classList.remove('ativo');
}

function fecharModalFiltroFora(event) {
  const modal = document.getElementById('modal-filtro');
  if (event.target === modal) {
    fecharModalFiltro();
  }
}

// Controla a exibição do seletor de instrumentos caso escolha "Músicos"
function tratarMudancaCategoriaFiltro() {
  const categoriaSelect = document.getElementById('filtro-categoria');
  const wrapperInstrumento = document.getElementById('wrapper-instrumento');

  if (categoriaSelect.value === 'musicos') {
    wrapperInstrumento.style.display = 'flex';
  } else {
    wrapperInstrumento.style.display = 'none';
    document.getElementById('filtro-instrumento').value = ''; // Reseta campo
  }
}

function limparFiltros() {
  document.getElementById('filtro-estado').value = '';
  document.getElementById('filtro-cidade').value = '';
  document.getElementById('filtro-categoria').value = '';
  document.getElementById('filtro-instrumento').value = '';
  document.getElementById('filtro-estilo').value = '';
  document.getElementById('filtro-valor-min').value = '';
  document.getElementById('filtro-valor-max').value = '';
  tratarMudancaCategoriaFiltro();
}

function aplicarFiltros() {
  const estado = document.getElementById('filtro-estado').value;
  const cidade = document.getElementById('filtro-cidade').value;
  const categoria = document.getElementById('filtro-categoria').value;
  const instrumento = document.getElementById('filtro-instrumento').value;
  const estilo = document.getElementById('filtro-estilo').value;
  const vMin = document.getElementById('filtro-valor-min').value;
  const vMax = document.getElementById('filtro-valor-max').value;

  // Lógica de feedback ou requisição de listagem filtrada
  console.log('Filtros aplicados:', { estado, cidade, categoria, instrumento, estilo, vMin, vMax });
  
  fecharModalFiltro();
  alert('Filtros aplicados com sucesso! Atualizando resultados...');
}