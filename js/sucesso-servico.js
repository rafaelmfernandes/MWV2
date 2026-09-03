(function () {

"use strict";

let dadosEvento = {};

document.addEventListener("DOMContentLoaded", function () {

carregarDados();

});

function carregarDados() {

const params = new URLSearchParams(window.location.search);

let dadosStorage = {};

try {

  dadosStorage = JSON.parse(
    localStorage.getItem("evento_artista_atual") || "{}"
  );

} catch (erro) {

  console.error(
    "Erro ao ler evento_artista_atual:",
    erro
  );

  dadosStorage = {};

}


/*
 * Primeiro usamos os dados que vieram pela URL.
 * Caso algum campo não exista, usamos o localStorage.
 *
 * Isso mantém a comunicação entre:
 *
 * data-local.html
 * ↓
 * pagamento-servico.html
 * ↓
 * resumo-servico.html
 * ↓
 * confirmacao/sucesso
 */

dadosEvento = {

  id:
    params.get("id") ||
    params.get("artistaId") ||
    dadosStorage.id ||
    dadosStorage.artistaId ||
    "",

  artista:
    params.get("artista") ||
    dadosStorage.artista ||
    "",

  servico:
    params.get("servico") ||
    dadosStorage.servico ||
    "",

  preco:
    params.get("preco") ||
    dadosStorage.preco ||
    "",

  data:
    params.get("data") ||
    dadosStorage.dataDoEvento ||
    "",

  horario:
    params.get("horario") ||
    params.get("hora") ||
    dadosStorage.horarioDoEvento ||
    "",

  local:
    params.get("local") ||
    dadosStorage.nomeLocal ||
    "",

  endereco:
    params.get("endereco") ||
    dadosStorage.localDoEvento ||
    "",

  cep:
    params.get("cep") ||
    dadosStorage.cep ||
    "",

  pagamento:
    params.get("pagamento") ||
    params.get("formaPagamento") ||
    dadosStorage.pagamento ||
    ""

};


preencherTela();

}

function preencherTela() {

const artista =
  dadosEvento.artista ||
  "Artista não informado";

const servico =
  dadosEvento.servico ||
  "Serviço não informado";

const local =
  dadosEvento.local ||
  "Local não informado";

const endereco =
  dadosEvento.endereco ||
  "";

const data =
  formatarData(dadosEvento.data);

const horario =
  formatarHorario(dadosEvento.horario);

const pagamento =
  formatarPagamento(dadosEvento.pagamento);

const preco =
  formatarPreco(dadosEvento.preco);


const elementoArtista =
  document.getElementById("resumo-artista");

const elementoServico =
  document.getElementById("resumo-servico");

const elementoLocal =
  document.getElementById("resumo-local");

const elementoEndereco =
  document.getElementById("resumo-endereco");

const elementoData =
  document.getElementById("resumo-data");

const elementoHorario =
  document.getElementById("resumo-horario");

const elementoPagamento =
  document.getElementById("resumo-pagamento");

const elementoPreco =
  document.getElementById("resumo-preco");


if (elementoArtista) {
  elementoArtista.textContent = artista;
}

if (elementoServico) {
  elementoServico.textContent = servico;
}

if (elementoLocal) {
  elementoLocal.textContent = local;
}

if (elementoEndereco) {

  if (endereco && dadosEvento.cep) {

    elementoEndereco.textContent =
      endereco + " • CEP " + dadosEvento.cep;

  } else if (endereco) {

    elementoEndereco.textContent =
      endereco;

  } else if (dadosEvento.cep) {

    elementoEndereco.textContent =
      "CEP " + dadosEvento.cep;

  } else {

    elementoEndereco.textContent =
      "Endereço não informado";

  }

}

if (elementoData) {
  elementoData.textContent = data;
}

if (elementoHorario) {
  elementoHorario.textContent = horario;
}

if (elementoPagamento) {
  elementoPagamento.textContent = pagamento;
}

if (elementoPreco) {
  elementoPreco.textContent = preco;
}


/*
 * Mantemos os dados consolidados no localStorage.
 * Isso permite que a próxima página também consiga
 * recuperar as informações.
 */

salvarDadosConsolidados();

}

function salvarDadosConsolidados() {

try {

  const dadosAtuais = {

    ...JSON.parse(
      localStorage.getItem("evento_artista_atual") || "{}"
    ),

    artista: dadosEvento.artista,
    servico: dadosEvento.servico,
    preco: dadosEvento.preco,
    dataDoEvento: dadosEvento.data,
    horarioDoEvento: dadosEvento.horario,
    nomeLocal: dadosEvento.local,
    localDoEvento: dadosEvento.endereco,
    cep: dadosEvento.cep,
    pagamento: dadosEvento.pagamento,
    status: "Pendente de Confirmação"

  };


  localStorage.setItem(
    "evento_artista_atual",
    JSON.stringify(dadosAtuais)
  );

} catch (erro) {

  console.error(
    "Não foi possível atualizar os dados da contratação:",
    erro
  );

}

}

function formatarData(dataString) {

if (!dataString) {
  return "Data não informada";
}


/*
 * Esperado:
 * AAAA-MM-DD
 */

const partes =
  dataString.split("-");


if (partes.length === 3) {

  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];


  return `${dia}/${mes}/${ano}`;

}


return dataString;

}

function formatarHorario(horario) {

if (!horario) {
  return "Horário não informado";
}


return horario;

}

function formatarPagamento(pagamento) {

if (!pagamento) {
  return "Não informado";
}


const valor =
  pagamento.toString().toLowerCase().trim();


if (valor === "pix") {
  return "PIX";
}


if (
  valor === "cartao" ||
  valor === "cartão" ||
  valor === "credito" ||
  valor === "crédito"
) {

  return "Cartão";

}


if (valor === "debito" || valor === "débito") {
  return "Cartão de débito";
}


return pagamento;

}

function formatarPreco(preco) {

if (
  preco === null ||
  preco === undefined ||
  preco === ""
) {

  return "Sob consulta";

}


const numero =
  Number(
    preco
      .toString()
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );


if (isNaN(numero)) {
  return preco;
}


return numero.toLocaleString(
  "pt-BR",
  {
    style: "currency",
    currency: "BRL"
  }
);

}
/*

Voltar ao início
*/

window.voltarInicio = function () {

window.location.href =
  "index.html";

};

})();