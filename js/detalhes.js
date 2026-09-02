const perfisDados = {
  "rafael-melo": {
    nome: "Rafael Melo",
    sigla: "RM",
    estilo: "MPB / Sertanejo",
    rating: "⭐ 4.9 (128)",
    local: "Goiânia, GO",
    tipoAnuncio: "cantor",
    descricaoGeral: "10 anos de estrada, repertório autoral e covers para casamentos, aniversários e eventos corporativos.",
    servicos: [
      { id: "s1", nome: "Show Acústico", desc: "Voz e Violão (Duração aprox. 2h)", preco: "R$ 800,00" },
      { id: "s2", nome: "Show Completo com Banda", desc: "Banda completa para festas e grandes eventos", preco: "R$ 2.500,00" },
      { id: "s3", nome: "Participação Especial", desc: "Até 3 músicas surpresa no seu evento", preco: "R$ 450,00" }
    ]
  },
  "gabriel-tatu": {
    nome: "Gabriel Tatu",
    sigla: "GT",
    estilo: "Sanfoneiro",
    rating: "⭐ 5.0 (42)",
    local: "Goiânia, GO",
    tipoAnuncio: "musico",
    descricaoGeral: "Sanfoneiro profissional com alta versatilidade para forró, sertanejo universitário e piseiro.",
    servicos: [
      { id: "m1", nome: "Freelancer (Show / Diária)", desc: "Acompanhamento em shows de artistas e bandas", preco: "R$ 1.200,00" },
      { id: "m2", nome: "Gravação em Estúdio", desc: "Captação de sanfona para faixas e álbuns", preco: "R$ 400,00" },
      { id: "m3", nome: "Acompanhar Artista em Turnê", desc: "Disponibilidade para viagens e agendas completas", preco: "R$ 3.500,00" },
      { id: "m4", nome: "Projeto Personalizado", desc: "Arranjos exclusivos para produções sob medida", preco: "Sob Consulta" }
    ]
  },
  "marcos-lima": {
    nome: "Marcos Lima",
    sigla: "ML",
    estilo: "Compositor / Modão",
    rating: "⭐ 4.9 (56)",
    local: "Goiânia, GO",
    tipoAnuncio: "composicao",
    descricaoGeral: "Letra e Melodia sertaneja romântica disponíveis para gravação inédita.",
    servicos: [
      { id: "c1", nome: "Cessão de Direitos (Inédita)", desc: "Exclusividade total da letra e áudio guia", preco: "R$ 1.500,00" }
    ]
  },
  "carlos-silva": {
    nome: "Carlos Silva",
    sigla: "CS",
    estilo: "Contratante",
    rating: "⭐ 5.0 (12)",
    local: "Goiânia, GO",
    tipoAnuncio: "evento",
    descricaoGeral: "Preciso de dupla sertaneja para tocar 3h em festa particular para 80 pessoas no Setor Bueno.",
    servicos: [
      { id: "e1", nome: "Candidatar-se à Vaga", desc: "Enviar proposta e orçamento para o evento", preco: "Negociável" }
    ]
  }
};

const urlParams = new URLSearchParams(window.location.search);
const artistaId = urlParams.get('id');

// Seleciona o perfil correto com base no ID da URL, ou usa o Rafael Melo como padrão
const dados = perfisDados[artistaId] || perfisDados['rafael-melo'];

let servicoSelecionadoId = dados.servicos[0].id;

function renderizarPagina() {
  const container = document.getElementById('detalhes-container');
  if (!container) return;
  
  let htmlServicos = '';
  dados.servicos.forEach((srv) => {
    const isSelected = srv.id === servicoSelecionadoId ? 'selecionado' : '';
    htmlServicos += `
      <div class="service-option-card ${isSelected}" onclick="selecionarServico('${srv.id}')">
        <div class="service-info-left">
          <span class="service-name">${srv.nome}</span>
          <span class="service-desc">${srv.desc}</span>
        </div>
        <div class="service-price-right">${srv.preco}</div>
      </div>
    `;
  });

  let textoBotaoContratar = dados.tipoAnuncio === 'evento' ? 'Enviar Proposta' : 'Avançar para Contratação';

  let corAvatar = '#0284c7';
  if (dados.tipoAnuncio === 'musico') corAvatar = '#047857';
  if (dados.tipoAnuncio === 'composicao') corAvatar = '#7c2d12';

  container.innerHTML = `
    <div class="profile-header-card">
      <div class="profile-top-row">
        <div class="profile-avatar-large" style="background-color: ${corAvatar};">${dados.sigla}</div>
        <div class="profile-title-info">
          <h2>${dados.nome}</h2>
          <div class="ad-meta-row">
            <span class="ad-estilo">${dados.estilo}</span>
            <span class="rating">${dados.rating}</span>
          </div>
        </div>
      </div>
      <div class="ad-descricao">
        <strong>Sobre o profissional</strong>
        <p>${dados.descricaoGeral}</p>
      </div>
      <div class="ad-footer">
        <span>📍 ${dados.local}</span>
      </div>
    </div>

    <div class="profile-options-section">
      <h3>Selecione o tipo de serviço</h3>
      ${htmlServicos}
    </div>

    <div class="contratar-action-box">
      <button class="btn-full-primary" onclick="avancarContratacao()">${textoBotaoContratar}</button>
    </div>
  `;
}

function selecionarServico(id) {
  servicoSelecionadoId = id;
  renderizarPagina();
}

function avancarContratacao() {
  const servicoEscolhido = dados.servicos.find(s => s.id === servicoSelecionadoId);
  alert(`Serviço selecionado: "${servicoEscolhido.nome}" (${servicoEscolhido.preco}) com ${dados.nome}. Redirecionando para checkout/confirmação.`);
}

renderizarPagina();