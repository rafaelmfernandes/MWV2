let map;
let marker;

window.onload = function() {
  // Carrega nome e preço salvos
  const nome = localStorage.getItem('servico_contratado') || 'Serviço Personalizado';
  const preco = localStorage.getItem('preco_contratado') || 'Sob Consulta';

  document.getElementById('resumo-servico-nome').innerText = nome;
  document.getElementById('resumo-servico-preco').innerText = preco;

  // Inicializa o mapa centralizado em Goiânia, GO (coordenadas padrão)
  initMap(-16.6869, -49.2643);
};

function initMap(lat, lng) {
  // Se o mapa já existir, remove para recriar
  if (map) {
    map.remove();
  }

  // Cria o mapa na div 'map'
  map = L.map('map').setView([lat, lng], 14);

  // Adiciona a camada de mapa do OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Cria um marcador arrastable (draggable)
  marker = L.marker([lat, lng], { draggable: true }).addTo(map);

  // Evento acionado quando o usuário solta o pino em outro lugar do mapa
  marker.on('dragend', function(event) {
    const position = marker.getLatLng();
    gerarEnderecoPorCoordenadas(position.lat, position.lng);
  });
}

// Busca endereço pelo CEP usando a API gratuita ViaCEP
function buscarCep() {
  let cep = document.getElementById('input-cep').value.replace(/\D/g, '');
  
  if (cep.length !== 8) return;

  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (!data.erro) {
        const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
        document.getElementById('input-local').value = enderecoCompleto;

        // Geocodifica a cidade/bairro para centralizar o mapa automaticamente
        buscarCoordenadasPorEndereco(enderecoCompleto);
      } else {
        alert('CEP não encontrado.');
      }
    })
    .catch(error => console.error('Erro ao buscar CEP:', error));
}

// Converte texto de endereço em coordenadas para mover o mapa
function buscarCoordenadasPorEndereco(endereco) {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        map.setView([lat, lon], 16);
        marker.setLatLng([lat, lon]);
      }
    })
    .catch(error => console.error('Erro ao buscar coordenadas:', error));
}

// Converte coordenadas geográficas (quando arrasta o pino) em texto legível
function gerarEnderecoPorCoordenadas(lat, lng) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    .then(response => response.json())
    .then(data => {
      if (data && data.display_name) {
        document.getElementById('input-local').value = data.display_name;
      }
    })
    .catch(error => console.error('Erro ao buscar endereço reverso:', error));
}

function salvarInformacoesArtista() {
  const tituloLocal = document.getElementById('input-titulo-local').value;
  const local = document.getElementById('input-local').value;
  const cep = document.getElementById('input-cep').value;
  const data = document.getElementById('input-data').value;
  const horario = document.getElementById('input-horario').value;
  const pinLatLng = marker ? marker.getLatLng() : null;

  if (!local || !data || !horario) {
    alert('Por favor, preencha o endereço, a data e o horário do evento.');
    return;
  }

  const dadosContratacao = {
    servico: localStorage.getItem('servico_contratado'),
    preco: localStorage.getItem('preco_contratado'),
    nomeLocal: tituloLocal || 'Local Particular',
    cep: cep,
    localDoEvento: local,
    coordenadasMapa: pinLatLng ? { lat: pinLatLng.lat, lng: pinLatLng.lng } : null,
    dataDoEvento: data,
    horarioDoEvento: horario,
    status: 'Pendente de Confirmação'
  };

  localStorage.setItem('evento_artista_atual', JSON.stringify(dadosContratacao));

  // Redireciona para a tela de pagamento recém criada
  window.location.href = 'pagamento-servico.html';
}