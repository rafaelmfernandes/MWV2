/* =========================================================
PERFIL DO ARTISTA - MUSICALWORLD
========================================================= */

/* =========================================================
CONTROLE DAS ABAS
========================================================= */

function mudarAba(abaId, elementoBtn) {

const botoes = document.querySelectorAll('.tab-btn');
const conteudos = document.querySelectorAll('.tab-content');

botoes.forEach(btn => {
btn.classList.remove('ativo');
});

conteudos.forEach(content => {
content.classList.remove('ativo');
});

if (elementoBtn) {
elementoBtn.classList.add('ativo');
}

const alvo = document.getElementById(`aba-${abaId}`);

if (alvo) {
alvo.classList.add('ativo');
}

window.scrollTo({
top: 0,
behavior: 'smooth'
});
}

/* =========================================================
FAVORITAR ARTISTA
========================================================= */

function favoritarArtista(botao) {

const favorito = botao.classList.toggle('favoritado');

if (favorito) {


botao.innerHTML = `
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.62-8.84a5.5 5.5 0 0 0 .22-7.78z"></path>
  </svg>
`;


} else {


botao.innerHTML = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.62-8.84a5.5 5.5 0 0 0 .22-7.78z"></path>
  </svg>
`;


}
}

/* =========================================================
CONTRATAÇÃO
========================================================= */

function iniciarContratacao() {

const mensagem = `
Deseja contratar Rafael Melo?

Você poderá escolher:
• Serviço
• Data
• Horário
• Local do evento
• Forma de pagamento
`;

const confirmar = confirm(mensagem);

if (confirmar) {


alert(
  'Vamos iniciar sua solicitação de contratação.'
);

// Futuramente:
// window.location.href = 'contratacao.html';


}
}

/* =========================================================
SELEÇÃO DE SERVIÇO
========================================================= */

function selecionarServico(nome, preco) {

const confirmar = confirm(
`Serviço selecionado:\n\n${nome}\n${preco}\n\nDeseja continuar com esta opção?`
);

if (confirmar) {


alert(
  `Ótimo! O serviço "${nome}" foi selecionado.`
);

// Futuramente:
// abrir tela de contratação


}
}

/* =========================================================
SOLICITAR DATA
========================================================= */

function solicitarData() {

alert(
'Selecione uma data livre no calendário para enviar sua solicitação.'
);

}

/* =========================================================
NAVEGAÇÃO DO MÊS
========================================================= */

let mesAtual = 8;
let anoAtual = 2026;

const nomesMeses = [
'Janeiro',
'Fevereiro',
'Março',
'Abril',
'Maio',
'Junho',
'Julho',
'Agosto',
'Setembro',
'Outubro',
'Novembro',
'Dezembro'
];

function mudarMes(direcao) {

mesAtual += direcao;

if (mesAtual > 11) {
mesAtual = 0;
anoAtual++;
}

if (mesAtual < 0) {
mesAtual = 11;
anoAtual--;
}

const titulo = document.getElementById('mes-atual');

if (titulo) {


titulo.textContent =
  `${nomesMeses[mesAtual]} ${anoAtual}`;


}

}

/* =========================================================
SELEÇÃO DE DIA
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

const dias = document.querySelectorAll(
'.agenda-grid-calendario .dia'
);

dias.forEach(dia => {


dia.addEventListener('click', () => {

  if (dia.classList.contains('ocupado')) {

    alert(
      'Esta data já está ocupada pelo artista.'
    );

    return;
  }

  if (dia.classList.contains('livre')) {

    dias.forEach(item => {
      item.classList.remove('selecionado');
    });

    dia.classList.add('selecionado');

    const numero = dia.textContent.trim();

    alert(
      `Data selecionada: ${numero} de ${nomesMeses[mesAtual]} de ${anoAtual}.`
    );

  }

});


});

});

/* =========================================================
BOTÕES DE ÁUDIO
========================================================= */

document.querySelectorAll('.audio-play').forEach(botao => {

botao.addEventListener('click', () => {


const tocando =
  botao.classList.toggle('tocando');

botao.textContent =
  tocando ? '❚❚' : '▶';


});

});

/* =========================================================
ANIMAÇÃO SUAVE AO CARREGAR
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

document.body.classList.add('pagina-carregada');

});
