const params = new URLSearchParams(window.location.search);

let artistaId = params.get("id") || "rafael-melo";
let artistaNome = params.get("artista") || "Rafael Melo";
let servicoInicial = params.get("servico") || "Voz e violão";
let precoInicial = Number(params.get("preco")) || 800;

let servicoSelecionado = {
nome: servicoInicial,
preco: precoInicial
};

/* =========================================================
DADOS DOS ARTISTAS
========================================================= */

const artistas = {

"rafael-melo": {
nome: "Rafael Melo",
iniciais: "RM",
categoria: "Cantor e violonista",
localizacao: "Goiânia, GO",
avaliacao: "4.9"
},

"gabriel-tatu": {
nome: "Gabriel Tatu",
iniciais: "GT",
categoria: "Músico e guitarrista",
localizacao: "Goiânia, GO",
avaliacao: "4.8"
},

"marcos-lima": {
nome: "Marcos Lima",
iniciais: "ML",
categoria: "Compositor",
localizacao: "Goiânia, GO",
avaliacao: "4.9"
},

"carlos-silva": {
nome: "Carlos Silva",
iniciais: "CS",
categoria: "Artista e produtor",
localizacao: "Goiânia, GO",
avaliacao: "4.7"
}

};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

carregarArtista();

prepararServicos();

selecionarServicoInicial();

});

/* =========================================================
CARREGAR ARTISTA
========================================================= */

function carregarArtista() {

const artista = artistas[artistaId];

if (!artista) {
return;
}

const nome = document.getElementById("artistName");
const avatar = document.getElementById("artistAvatar");
const categoria = document.getElementById("artistCategory");
const localizacao = document.getElementById("artistLocation");
const avaliacao = document.getElementById("artistRating");

if (nome) {
nome.textContent = artista.nome;
}

if (avatar) {
avatar.textContent = artista.iniciais;
}

if (categoria) {
categoria.textContent = artista.categoria;
}

if (localizacao) {
localizacao.textContent = artista.localizacao;
}

if (avaliacao) {
avaliacao.textContent = artista.avaliacao;
}

artistaNome = artista.nome;

}

/* =========================================================
PREPARAR SERVIÇOS
========================================================= */

function prepararServicos() {

const cards = document.querySelectorAll(
".service-option-card"
);

cards.forEach(function (card) {

card.addEventListener("click", function () {

  selecionarServico(card);

});

});

}

/* =========================================================
SELECIONAR SERVIÇO
========================================================= */

function selecionarServico(card) {

if (!card) {
return;
}

const cards = document.querySelectorAll(
".service-option-card"
);

cards.forEach(function (item) {

item.classList.remove("selecionado");

});

card.classList.add("selecionado");

const nome =
card.dataset.service ||
card.dataset.servico ||
"";

const preco =
Number(
card.dataset.price ||
card.dataset.preco ||
0
);

servicoSelecionado = {
nome: nome,
preco: preco
};

atualizarResumo();

}

/* =========================================================
SELECIONAR SERVIÇO INICIAL
========================================================= */

function selecionarServicoInicial() {

const cards = document.querySelectorAll(
".service-option-card"
);

if (!cards.length) {
return;
}

let cardEncontrado = null;

cards.forEach(function (card) {

const nome =
  card.dataset.service ||
  card.dataset.servico ||
  "";

const preco =
  Number(
    card.dataset.price ||
    card.dataset.preco ||
    0
  );

if (
  nome === servicoInicial ||
  preco === precoInicial
) {

  cardEncontrado = card;

}

});

if (!cardEncontrado) {

cardEncontrado = cards[0];

}

if (cardEncontrado) {

selecionarServico(cardEncontrado);

}

}

/* =========================================================
ATUALIZAR RESUMO INFERIOR
========================================================= */

function atualizarResumo() {

const selectedService =
document.getElementById("selectedService");

const selectedPrice =
document.getElementById("selectedPrice");

if (selectedService) {

selectedService.textContent =
  servicoSelecionado.nome;

}

if (selectedPrice) {

selectedPrice.textContent =
  formatarPreco(
    servicoSelecionado.preco
  );

}

}

/* =========================================================
FORMATAR PREÇO
========================================================= */

function formatarPreco(valor) {

return Number(valor).toLocaleString(
"pt-BR",
{
style: "currency",
currency: "BRL"
}
);

}

/* =========================================================
CONTINUAR CONTRATAÇÃO
========================================================= */

function continuarContratacao() {

if (
!servicoSelecionado ||
!servicoSelecionado.nome
) {

alert("Selecione um serviço para continuar.");

return;

}

/*

Cria os parâmetros que serão enviados
para a página data-local.html
*/

const parametros =
new URLSearchParams();

parametros.set(
"id",
artistaId
);

parametros.set(
"artista",
artistaNome
);

parametros.set(
"servico",
servicoSelecionado.nome
);

parametros.set(
"preco",
servicoSelecionado.preco
);

/*

PRÓXIMA ETAPA:
selecao-servico.html
     ↓
data-local.html
*/

const url =
"data-local.html?" +
parametros.toString();

console.log(
"Avançando para data-local.html:",
url
);

window.location.href = url;

}

/* =========================================================
VOLTAR PARA DETALHES DO ANÚNCIO
========================================================= */

function voltarPagina() {

const parametros =
new URLSearchParams();

parametros.set(
"id",
artistaId
);

parametros.set(
"artista",
artistaNome
);

parametros.set(
"servico",
servicoSelecionado.nome
);

parametros.set(
"preco",
servicoSelecionado.preco
);

const url =
"detalhes-anuncio.html?" +
parametros.toString();

window.location.href = url;

}

/* =========================================================
CANCELAR CONTRATAÇÃO
========================================================= */

function cancelarContratacao() {

localStorage.removeItem(
"evento_artista_atual"
);

window.location.href =
"index.html";

}

/* =========================================================
NAVEGAÇÃO — MENU INFERIOR
========================================================= */

function irParaInicio() {

window.location.href =
"index.html";

}

function irParaAnunciar() {

window.location.href =
"anunciar.html";

}

function irParaPerfil() {

window.location.href =
"perfil-artista.html?id=" +
encodeURIComponent(artistaId);

}

/* =========================================================
DISPONIBILIZAR FUNÇÕES GLOBALMENTE
========================================================= */

window.selecionarServico =
selecionarServico;

window.continuarContratacao =
continuarContratacao;

window.voltarPagina =
voltarPagina;

window.cancelarContratacao =
cancelarContratacao;

window.irParaInicio =
irParaInicio;

window.irParaAnunciar =
irParaAnunciar;

window.irParaPerfil =
irParaPerfil;