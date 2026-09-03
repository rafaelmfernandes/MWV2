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
  if (abaName === 'perfil') {
    window.location='perfil-artista.html';
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

// ==========================================
// PAINEL DE BUSCA (desliza do topo)
// ==========================================
let cardsPesquisaveis = null; // cache dos cards, montado na primeira busca
let itemNavPesquisaAtivo = null; // guarda o botão do menu pra remover o "ativo" ao fechar

function abrirPesquisa(elementoBtn) {
  itemNavPesquisaAtivo = elementoBtn;

  const itens = document.querySelectorAll('.bottom-nav-item');
  itens.forEach(item => item.classList.remove('ativo'));
  elementoBtn.classList.add('ativo');

  const painel = document.getElementById('painel-pesquisa');
  const campo = document.getElementById('campo-pesquisa');

  painel.classList.add('ativo');
  campo.value = '';
  filtrarPesquisa('');

  setTimeout(() => campo.focus(), 300);
}

function fecharPesquisa() {
  const painel = document.getElementById('painel-pesquisa');
  painel.classList.remove('ativo');

  if (itemNavPesquisaAtivo) {
    itemNavPesquisaAtivo.classList.remove('ativo');
  }

  // devolve o destaque pro item Início, já que fechar a busca volta pra Home
  const itemHome = document.getElementById('nav-item-home');
  if (itemHome) itemHome.classList.add('ativo');
}

// Junta todos os cards de anúncio (de todas as categorias, mesmo as escondidas)
// com o texto neles pra poder comparar com o que a pessoa digitar.
function coletarCardsPesquisaveis() {
  const cards = document.querySelectorAll('.cat-content .ad-card-novo');
  const lista = [];

  cards.forEach(card => {
    const linkPai = card.closest('a');
    const nome = card.querySelector('.ad-user-info h4');
    const estilo = card.querySelector('.ad-estilo');
    const tituloDesc = card.querySelector('.ad-descricao strong');
    const textoDesc = card.querySelector('.ad-descricao p');

    const textoBusca = [
      nome ? nome.textContent : '',
      estilo ? estilo.textContent : '',
      tituloDesc ? tituloDesc.textContent : '',
      textoDesc ? textoDesc.textContent : ''
    ].join(' ').toLowerCase();

    lista.push({
      href: linkPai ? linkPai.getAttribute('href') : '#',
      html: card.outerHTML,
      textoBusca
    });
  });

  return lista;
}

function filtrarPesquisa(termo) {
  if (!cardsPesquisaveis) {
    cardsPesquisaveis = coletarCardsPesquisaveis();
  }

  const container = document.getElementById('resultados-pesquisa');
  const termoLimpo = termo.trim().toLowerCase();

  if (termoLimpo === '') {
    container.innerHTML = '<p class="search-estado-vazio">Digite algo para buscar em todas as categorias.</p>';
    return;
  }

  const encontrados = cardsPesquisaveis.filter(item => item.textoBusca.indexOf(termoLimpo) !== -1);

  if (encontrados.length === 0) {
    container.innerHTML = `<p class="search-estado-vazio">Nenhum resultado para "${termo}".</p>`;
    return;
  }

  container.innerHTML = encontrados
    .map(item => `<a href="${item.href}" style="text-decoration:none;color:inherit;display:block;">${item.html}</a>`)
    .join('');
}

// Fecha o painel de busca com a tecla Esc
document.addEventListener('keydown', (evento) => {
  const painel = document.getElementById('painel-pesquisa');
  if (evento.key === 'Escape' && painel && painel.classList.contains('ativo')) {
    fecharPesquisa();
  }
});