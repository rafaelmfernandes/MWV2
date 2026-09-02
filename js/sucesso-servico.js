window.onload = function() {
  // Pega os dados consolidados do evento armazenados no localStorage
  const dadosEvento = JSON.parse(localStorage.getItem('evento_artista_atual') || '{}');

  document.getElementById('resumo-servico').innerText = dadosEvento.servico || 'Serviço Personalizado';
  
  // Exibe o nome do local personalizado ou endereço
  const nomeLocal = dadosEvento.nomeLocal || 'Local Particular';
  document.getElementById('resumo-local').innerText = nomeLocal;

  // Formata a data e horário
  const dataFormatada = dadosEvento.dataDoEvento ? formatarData(dadosEvento.dataDoEvento) : '--/--/----';
  const horario = dadosEvento.horarioDoEvento || '--:--';
  document.getElementById('resumo-data').innerText = `${dataFormatada} às ${horario}`;

  document.getElementById('resumo-preco').innerText = dadosEvento.preco || 'Sob Consulta';
};

// Função auxiliar para converter a data do formato AAAA-MM-DD para DD/MM/AAAA
function formatarData(dataString) {
  if (!dataString) return '--/--/----';
  const partes = dataString.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataString;
}