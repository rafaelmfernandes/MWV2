// Funções da Página de Mensagens / Chat - ArtistaShow

// Banco de dados simulado de conversas com categorias ('contratado' ou 'servico-feito')
const conversasDados = {
  "1": {
    nome: "Rafael Melo",
    sigla: "RM",
    estilo: "Show Acústico - Casamento",
    status: "Online",
    categoriaFiltro: "contratado",
    mensagens: [
      { remetente: "outro", texto: "Combinado então! Chego às 18h no local para passagem de som.", hora: "14:22" }
    ]
  },
  "2": {
    nome: "Carlos Silva",
    sigla: "Aniversário no Setor Bueno",
    status: "Há 10 min",
    categoriaFiltro: "servico-feito",
    mensagens: [
      { remetente: "outro", texto: "O cachê foi liberado pela plataforma. Muito obrigado pelo show!", hora: "Ontem" }
    ]
  },
  "3": {
    nome: "Marcos Lima",
    sigla: "Parceria Composição",
    status: "Offline",
    categoriaFiltro: "contratado",
    mensagens: [
      { remetente: "outro", texto: "Enviei o áudio-guia da nova moda. Dá uma olhada aí.", hora: "Seg" }
    ]
  }
};

let urlParams = new URLSearchParams(window.location.search);
let conversaAtivaId = urlParams.get('id') || "1";
let filtroAtual = "todas"; // 'todas', 'contratados', 'servicos-feutos'

function filtrarConversas(tipo, elementoBtn) {
  filtroAtual = tipo;

  // Atualiza visual dos botões de filtro
  const botoes = document.querySelectorAll('.filter-tab, .chat-filter-btn, .cat-tab');
  botoes.forEach(btn => btn.classList.remove('ativo'));
  if (elementoBtn) {
    elementoBtn.classList.add('ativo');
  }

  renderizarListaConversas();
}

function renderizarListaConversas() {
  const listaContainer = document.getElementById('lista-conversas');
  if (!listaContainer) return;

  let html = '';
  for (const id in conversasDados) {
    const conv = conversasDados[id];

    // Aplica o filtro selecionado
    if (filtroAtual === 'contratados' && conv.categoriaFiltro !== 'contratado') continue;
    if (filtroAtual === 'servicos-feutos' && conv.categoriaFiltro !== 'servico-feito') continue;

    const ultimaMsg = conv.mensagens[conv.mensagens.length - 1];
    const isAtivo = id === conversaAtivaId ? 'ativo' : '';

    html += `
      <div class="chat-item ${isAtivo}" onclick="trocarConversa('${id}')">
        <div class="chat-avatar">${conv.sigla.substring(0,2).toUpperCase()}</div>
        <div class="chat-info">
          <div class="chat-top-row">
            <span class="chat-nome">${conv.nome}</span>
            <span class="chat-hora">${ultimaMsg ? ultimaMsg.hora : ''}</span>
          </div>
          <span class="chat-preview">${ultimaMsg ? ultimaMsg.texto : 'Nenhuma mensagem'}</span>
        </div>
      </div>
    `;
  }

  if (html === '') {
    html = `<div style="padding: 24px; text-align: center; color: #71717a; font-size: 13px;">Nenhuma conversa encontrada nesta categoria.</div>`;
  }

  listaContainer.innerHTML = html;
}

function trocarConversa(id) {
  conversaAtivaId = id;
  renderizarListaConversas();
}

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  renderizarListaConversas();
});