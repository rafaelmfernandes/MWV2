/* =========================================================
   DETALHES DO ANÚNCIO
   MusicalWorld / ArtistaShow
========================================================= */


/* =========================================================
   IDENTIFICAÇÃO DO ARTISTA
========================================================= */

const params = new URLSearchParams(window.location.search);

const artistaId = params.get("id") || "rafael-melo";


/* =========================================================
   DADOS DOS ARTISTAS
========================================================= */

const artistas = {

  "rafael-melo": {
    nome: "Rafael Melo",
    iniciais: "RM",
    categoria: "Cantor e violonista",
    estilos: "MPB, pop, sertanejo",
    localizacao: "Goiânia, GO",
    avaliacao: "4.9",
    avaliacoes: "128"
  },

  "gabriel-tatu": {
    nome: "Gabriel Tatu",
    iniciais: "GT",
    categoria: "Músico e guitarrista",
    estilos: "Rock, pop, blues",
    localizacao: "Goiânia, GO",
    avaliacao: "4.8",
    avaliacoes: "96"
  },

  "marcos-lima": {
    nome: "Marcos Lima",
    iniciais: "ML",
    categoria: "Compositor",
    estilos: "MPB, sertanejo, acústico",
    localizacao: "Goiânia, GO",
    avaliacao: "4.9",
    avaliacoes: "74"
  },

  "carlos-silva": {
    nome: "Carlos Silva",
    iniciais: "CS",
    categoria: "Artista e produtor",
    estilos: "Pop, eletrônico, eventos",
    localizacao: "Goiânia, GO",
    avaliacao: "4.7",
    avaliacoes: "61"
  }

};


/* =========================================================
   SERVIÇOS
========================================================= */

const servicos = {

  "rafael-melo": [
    {
      nome: "Voz e violão",
      preco: 800,
      descricao: "Apresentação acústica",
      duracao: "Até 2 horas"
    },
    {
      nome: "Show completo",
      preco: 1500,
      descricao: "Repertório completo para seu evento",
      duracao: "Até 3 horas"
    },
    {
      nome: "Banda completa",
      preco: 2400,
      descricao: "Formação completa para eventos",
      duracao: "Até 4 horas"
    }
  ],

  "gabriel-tatu": [
    {
      nome: "Guitarra e voz",
      preco: 700,
      descricao: "Apresentação acústica",
      duracao: "Até 2 horas"
    },
    {
      nome: "Show completo",
      preco: 1400,
      descricao: "Show para eventos",
      duracao: "Até 3 horas"
    },
    {
      nome: "Banda completa",
      preco: 2200,
      descricao: "Formação completa",
      duracao: "Até 4 horas"
    }
  ],

  "marcos-lima": [
    {
      nome: "Composição ao vivo",
      preco: 600,
      descricao: "Apresentação autoral",
      duracao: "Até 2 horas"
    },
    {
      nome: "Show acústico",
      preco: 1000,
      descricao: "Repertório acústico",
      duracao: "Até 3 horas"
    }
  ],

  "carlos-silva": [
    {
      nome: "Apresentação solo",
      preco: 900,
      descricao: "Apresentação individual",
      duracao: "Até 2 horas"
    },
    {
      nome: "Show completo",
      preco: 1800,
      descricao: "Show para eventos",
      duracao: "Até 3 horas"
    }
  ]

};


/* =========================================================
   SERVIÇO SELECIONADO
========================================================= */

let servicoSelecionado = {
  nome: "Voz e violão",
  preco: 800
};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  carregarArtista();

  carregarServicoDaURL();

  atualizarServicoInicial();

  atualizarBotaoContratar();

});


/* =========================================================
   CARREGAR ARTISTA
========================================================= */

function carregarArtista() {

  const artista = artistas[artistaId];

  if (!artista) {

    console.warn(
      "Artista não encontrado:",
      artistaId
    );

    return;
  }


  const avatar =
    document.querySelector(".artist-avatar");

  const nome =
    document.querySelector(".artist-name-line h1");

  const categoria =
    document.querySelector(".artist-category");

  const rating =
    document.querySelector(".rating-value");

  const avaliacoes =
    document.querySelector(".rating-count");

  const localizacao =
    document.querySelector(".location-text");


  if (avatar) {

    avatar.textContent =
      artista.iniciais;

  }


  if (nome) {

    nome.textContent =
      artista.nome;

  }


  if (categoria) {

    categoria.textContent =
      artista.categoria;

  }


  if (rating) {

    rating.textContent =
      artista.avaliacao;

  }


  if (avaliacoes) {

    avaliacoes.textContent =
      `(${artista.avaliacoes} avaliações)`;

  }


  if (localizacao) {

    localizacao.textContent =
      artista.localizacao;

  }


  /*
   * Atualiza também elementos que possam
   * utilizar IDs no HTML.
   */

  const artistName =
    document.getElementById("artistName");

  const artistCategory =
    document.getElementById("artistCategory");

  const artistLocation =
    document.getElementById("artistLocation");

  const artistRating =
    document.getElementById("artistRating");


  if (artistName) {

    artistName.textContent =
      artista.nome;

  }


  if (artistCategory) {

    artistCategory.textContent =
      artista.categoria;

  }


  if (artistLocation) {

    artistLocation.textContent =
      artista.localizacao;

  }


  if (artistRating) {

    artistRating.textContent =
      artista.avaliacao;

  }

}


/* =========================================================
   LER SERVIÇO DA URL
========================================================= */

function carregarServicoDaURL() {

  const servicoURL =
    params.get("servico");

  const precoURL =
    params.get("preco");


  if (
    servicoURL &&
    precoURL
  ) {

    servicoSelecionado = {

      nome: servicoURL,

      preco: Number(precoURL)

    };

  }

}


/* =========================================================
   ATUALIZAR SERVIÇO INICIAL
========================================================= */

function atualizarServicoInicial() {

  const servicosArtista =
    servicos[artistaId];


  if (!servicosArtista) {
    return;
  }


  /*
   * Procura o serviço enviado pela URL.
   */

  const servicoEncontrado =
    servicosArtista.find(function (servico) {

      return (
        servico.nome ===
        servicoSelecionado.nome
      );

    });


  if (servicoEncontrado) {

    servicoSelecionado = {

      nome: servicoEncontrado.nome,

      preco: servicoEncontrado.preco

    };

  }


  atualizarInterfaceServico();

}


/* =========================================================
   ATUALIZAR INTERFACE DO SERVIÇO
========================================================= */

function atualizarInterfaceServico() {

  const selectedService =
    document.getElementById(
      "selectedService"
    );


  const selectedPrice =
    document.getElementById(
      "selectedPrice"
    );


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


  /*
   * Procura cards de serviço
   * caso existam na página.
   */

  const cards =
    document.querySelectorAll(
      ".service-card, .service-option-card"
    );


  cards.forEach(function (card) {

    const nome =
      card.dataset.service ||
      card.dataset.nome;


    const preco =
      Number(
        card.dataset.price ||
        card.dataset.preco ||
        0
      );


    if (
      nome === servicoSelecionado.nome ||
      preco === servicoSelecionado.preco
    ) {

      card.classList.add(
        "selecionado"
      );

    } else {

      card.classList.remove(
        "selecionado"
      );

    }

  });

}


/* =========================================================
   SELECIONAR SERVIÇO
========================================================= */

function selecionarServico(
  elemento,
  nome,
  preco
) {

  /*
   * Compatibilidade com:
   *
   * selecionarServico(this, "Voz e violão", "800")
   *
   * e também:
   *
   * selecionarServico(this)
   */

  if (
    !nome &&
    elemento
  ) {

    nome =
      elemento.dataset.service ||
      elemento.dataset.nome;

  }


  if (
    !preco &&
    elemento
  ) {

    preco =
      elemento.dataset.price ||
      elemento.dataset.preco;

  }


  if (!nome) {
    return;
  }


  servicoSelecionado = {

    nome: nome,

    preco: Number(preco) || 0

  };


  /*
   * Remove seleção dos outros cards.
   */

  const cards =
    document.querySelectorAll(
      ".service-card, .service-option-card"
    );


  cards.forEach(function (card) {

    card.classList.remove(
      "selecionado"
    );

  });


  /*
   * Marca o card selecionado.
   */

  if (elemento) {

    elemento.classList.add(
      "selecionado"
    );

  }


  atualizarInterfaceServico();

  atualizarBotaoContratar();

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
   BOTÃO CONTRATAR
========================================================= */

function atualizarBotaoContratar() {

  const botao =
    document.querySelector(
      ".primary-action"
    );


  if (!botao) {
    return;
  }


  /*
   * Mantém o texto do botão.
   */

  const textoExistente =
    botao.querySelector(".button-text");


  if (textoExistente) {

    textoExistente.textContent =
      "Contratar";

  }

}


/* =========================================================
   INICIAR CONTRATAÇÃO
========================================================= */

function iniciarContratacao() {

  /*
   * Confirma se existe serviço.
   */

  if (
    !servicoSelecionado ||
    !servicoSelecionado.nome
  ) {

    alert(
      "Selecione um serviço para continuar."
    );

    return;
  }


  /*
   * Codifica os dados para evitar
   * problemas com espaços e caracteres especiais.
   */

  const id =
    encodeURIComponent(
      artistaId
    );


  const artista =
    encodeURIComponent(
      obterNomeArtista()
    );


  const servico =
    encodeURIComponent(
      servicoSelecionado.nome
    );


  const preco =
    encodeURIComponent(
      servicoSelecionado.preco
    );


  /*
   * Envia para a página de seleção
   * de serviço.
   */

  const url =
    `selecionao-servico.html` +
    `?id=${id}` +
    `&artista=${artista}` +
    `&servico=${servico}` +
    `&preco=${preco}`;


  window.location.href =
    url;

}


/* =========================================================
   OBTER NOME DO ARTISTA
========================================================= */

function obterNomeArtista() {

  const artista =
    artistas[artistaId];


  if (artista) {

    return artista.nome;

  }


  const nomeNaPagina =
    document.querySelector(
      ".artist-name-line h1"
    );


  if (nomeNaPagina) {

    return nomeNaPagina.textContent.trim();

  }


  return "Artista";

}


/* =========================================================
   BOTÃO VOLTAR
========================================================= */

function voltarPagina() {

  if (
    document.referrer &&
    document.referrer !==
      window.location.href
  ) {

    window.history.back();

    return;

  }


  window.location.href =
    "index.html";

}


/* =========================================================
   FAVORITOS
========================================================= */

function alternarFavorito() {

  const chave =
    `musicalworld_favorito_${artistaId}`;


  const favoritoAtual =
    localStorage.getItem(
      chave
    ) === "true";


  const novoEstado =
    !favoritoAtual;


  localStorage.setItem(
    chave,
    novoEstado
  );


  atualizarIconeFavorito(
    novoEstado
  );

}


/* =========================================================
   ATUALIZAR ÍCONE DO FAVORITO
========================================================= */

function atualizarIconeFavorito(
  favorito
) {

  const botao =
    document.querySelector(
      ".favorite-btn"
    );


  if (!botao) {
    return;
  }


  const svg =
    botao.querySelector("svg");


  if (!svg) {
    return;
  }


  if (favorito) {

    svg.setAttribute(
      "fill",
      "currentColor"
    );

  } else {

    svg.setAttribute(
      "fill",
      "none"
    );

  }

}


/* =========================================================
   CARREGAR FAVORITO
========================================================= */

function carregarFavorito() {

  const chave =
    `musicalworld_favorito_${artistaId}`;


  const favorito =
    localStorage.getItem(
      chave
    ) === "true";


  atualizarIconeFavorito(
    favorito
  );

}


/* =========================================================
   REPRODUZIR VÍDEO
========================================================= */

function reproduzirVideo() {

  /*
   * Por enquanto o vídeo ainda não
   * possui uma URL real.
   *
   * Quando adicionarmos o vídeo do artista,
   * essa função poderá abrir o player.
   */

  const video =
    document.querySelector(
      ".presentation-video video"
    );


  if (video) {

    video.play().catch(
      function (erro) {

        console.warn(
          "Não foi possível reproduzir o vídeo:",
          erro
        );

      }
    );

    return;

  }


  console.log(
    "Vídeo de apresentação ainda não configurado."
  );

}


/* =========================================================
   ABRIR PERFIL DO ARTISTA
========================================================= */

function abrirPerfilArtista() {

  const id =
    encodeURIComponent(
      artistaId
    );


  window.location.href =
    `perfil-artista.html?id=${id}`;

}


/* =========================================================
   NAVEGAÇÃO PARA INÍCIO
========================================================= */

function irParaInicio() {

  window.location.href =
    "index.html";

}


/* =========================================================
   NAVEGAÇÃO PARA MENSAGENS
========================================================= */

function irParaMensagens() {

  window.location.href =
    "mensagens.html";

}


/* =========================================================
   NAVEGAÇÃO PARA ANUNCIAR
========================================================= */

function irParaAnunciar() {

  window.location.href =
    "anunciar.html";

}


/* =========================================================
   NAVEGAÇÃO PARA PERFIL
========================================================= */

function irParaPerfil() {

  window.location.href =
    `perfil-artista.html?id=${encodeURIComponent(artistaId)}`;

}


/* =========================================================
   INICIALIZAÇÃO DO FAVORITO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    carregarFavorito();

  }
);