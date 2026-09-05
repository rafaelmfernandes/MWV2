(function () {

"use strict";

/* ========================================================= /
/ CONFIGURAÇÃO /
/ ========================================================= */

const STORAGE_ANUNCIOS = "anuncios_musicalworld";
const STORAGE_DRAFT = "rascunho_anuncio_cantor";

const TIPO_ANUNCIO = "artista";

/* ========================================================= /
/ ELEMENTOS /
/ ========================================================= */

let form;
let inputMidia;
let dropzone;
let mediaPreview;
let mediaName;
let mediaSub;
let btnRemover;
let btnPublicar;
let formError;
let successToast;
let contadorDescricao;

let arquivoMidiaAtual = null;
let urlMidiaAtual = null;

/* ========================================================= /
/ INICIALIZAÇÃO /
/ ========================================================= */

document.addEventListener("DOMContentLoaded", iniciar);

function iniciar() {

form = document.getElementById("form-criar-anuncio-cantor");

inputMidia = document.getElementById("input-midia-unica");

dropzone = document.getElementById("dropzone-box");

mediaPreview = document.getElementById("media-preview");

mediaName = document.getElementById("media-name-display");

mediaSub = document.getElementById("media-sub-display");

btnRemover = document.getElementById("btn-remover");

btnPublicar = document.getElementById("btn-publicar");

formError = document.getElementById("form-error");

successToast = document.getElementById("success-toast");

contadorDescricao = document.getElementById("contador-descricao");


if (!form) {
  console.error("Formulário de criação de anúncio não encontrado.");
  return;
}


configurarFormulario();

configurarPrecos();

configurarDescricao();

configurarMidia();

carregarRascunho();

}

/* ========================================================= /
/ CONFIGURAÇÃO DO FORMULÁRIO /
/ ========================================================= */

function configurarFormulario() {

form.addEventListener("submit", publicarAnuncio);


form.addEventListener("input", function () {

  esconderErro();

  salvarRascunho();

});


form.addEventListener("change", function () {

  esconderErro();

  salvarRascunho();

});

}

/* ========================================================= /
/ DESCRIÇÃO /
/ ========================================================= */

function configurarDescricao() {

const descricao = document.getElementById("descricao");

if (!descricao || !contadorDescricao) {
  return;
}


function atualizarContador() {

  contadorDescricao.textContent = descricao.value.length;

}


descricao.addEventListener("input", atualizarContador);

atualizarContador();

}

/* ========================================================= /
/ PREÇOS /
/ ========================================================= */

function configurarPrecos() {

const campos = document.querySelectorAll(".form-input-price");


campos.forEach(function (campo) {

  campo.addEventListener("input", function () {

    campo.value = formatarMoeda(campo.value);

    salvarRascunho();

  });


  campo.addEventListener("blur", function () {

    if (campo.value.trim() === "") {
      return;
    }

    campo.value = formatarMoeda(campo.value);

  });

});

}

function formatarMoeda(valor) {

let numero = String(valor || "");

numero = numero.replace(/\D/g, "");

if (!numero) {
  return "";
}


numero = parseInt(numero, 10) / 100;


return numero.toLocaleString("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

}

function converterParaNumero(valor) {

if (!valor) {
  return null;
}


const texto = String(valor)
  .replace(/\./g, "")
  .replace(",", ".");


const numero = Number(texto);


if (!Number.isFinite(numero)) {
  return null;
}


return numero;

}

/* ========================================================= /
/ MÍDIA /
/ ========================================================= */

function configurarMidia() {

if (!inputMidia) {
  return;
}


inputMidia.addEventListener("change", function () {

  processarMidiaUnica(this);

});


if (dropzone) {

  dropzone.addEventListener("keydown", function (event) {

    if (event.key === "Enter" || event.key === " ") {

      event.preventDefault();

      acionarSeletorMidia();

    }

  });

}

}

window.acionarSeletorMidia = function () {

if (!inputMidia) {
  return;
}


inputMidia.click();

};

window.processarMidiaUnica = function (input) {

if (!input || !input.files || !input.files.length) {
  return;
}


const arquivo = input.files[0];


const tiposPermitidos = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm"
];


if (!tiposPermitidos.includes(arquivo.type)) {

  mostrarErro(
    "Formato de mídia não permitido. Escolha JPG, PNG, WEBP, MP4 ou WEBM."
  );

  input.value = "";

  return;

}


const limite = 50 * 1024 * 1024;


if (arquivo.size > limite) {

  mostrarErro(
    "O arquivo é muito grande. Escolha uma mídia de até 50 MB."
  );

  input.value = "";

  return;

}


limparUrlMidia();


arquivoMidiaAtual = arquivo;

urlMidiaAtual = URL.createObjectURL(arquivo);


mostrarPreviewMidia(arquivo);

salvarRascunho();

};

function mostrarPreviewMidia(arquivo) {

if (!mediaPreview) {
  return;
}


mediaPreview.innerHTML = "";


if (arquivo.type.startsWith("image/")) {

  const img = document.createElement("img");

  img.src = urlMidiaAtual;

  img.alt = "Prévia da mídia do anúncio";


  mediaPreview.appendChild(img);

}


else if (arquivo.type.startsWith("video/")) {

  const video = document.createElement("video");

  video.src = urlMidiaAtual;

  video.muted = true;

  video.playsInline = true;

  video.preload = "metadata";


  mediaPreview.appendChild(video);

}


if (mediaName) {
  mediaName.textContent = arquivo.name;
}


if (mediaSub) {

  const tamanho = formatarTamanhoArquivo(arquivo.size);

  const tipo = arquivo.type.startsWith("image/")
    ? "Imagem"
    : "Vídeo";


  mediaSub.textContent = tipo + " • " + tamanho;

}


if (btnRemover) {
  btnRemover.style.display = "flex";
}

}

function formatarTamanhoArquivo(bytes) {

if (bytes < 1024) {
  return bytes + " B";
}


if (bytes < 1024 * 1024) {

  return (
    (bytes / 1024).toFixed(1) +
    " KB"
  );

}


return (
  (bytes / (1024 * 1024)).toFixed(1) +
  " MB"
);

}

window.limparMidia = function () {

limparUrlMidia();


arquivoMidiaAtual = null;


if (inputMidia) {
  inputMidia.value = "";
}


if (mediaPreview) {

  mediaPreview.innerHTML = `
    <div class="media-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">

        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>

      </svg>
    </div>
  `;

}


if (mediaName) {
  mediaName.textContent = "Adicionar foto ou vídeo";
}


if (mediaSub) {
  mediaSub.textContent = "JPG, PNG, WEBP ou MP4";
}


if (btnRemover) {
  btnRemover.style.display = "none";
}


salvarRascunho();

};

function limparUrlMidia() {

if (urlMidiaAtual) {

  URL.revokeObjectURL(urlMidiaAtual);

  urlMidiaAtual = null;

}

}

/* ========================================================= /
/ MONTAGEM DO ANÚNCIO /
/ ========================================================= */

function coletarDadosFormulario() {

const nomeArtistico =
  obterValor("nome-artistico");

const estiloMusical =
  obterValor("estilo-musical");

const cidade =
  obterValor("cidade");

const estado =
  obterValor("estado");

const descricao =
  obterValor("descricao");

const experiencia =
  obterValor("experiencia");

const disponibilidade =
  obterValor("disponibilidade");


const anuncio = {

  id: gerarId(),

  usuario_id: obterUsuarioId(),

  tipo_anuncio: TIPO_ANUNCIO,

  titulo: nomeArtistico,

  nome_artistico: nomeArtistico,

  estilo_musical: estiloMusical,

  cidade: cidade,

  estado: estado,

  localizacao: cidade + ", " + estado,

  descricao: descricao,

  experiencia: experiencia,

  disponibilidade: disponibilidade,


  servicos: {

    acustico: {
      nome: "Acústico",
      descricao: "Voz e violão",
      preco: converterParaNumero(
        obterValor("preco-acustico")
      )
    },

    banda_completa: {
      nome: "Banda completa",
      descricao: "Show com banda",
      preco: converterParaNumero(
        obterValor("preco-banda")
      )
    },

    participacao_especial: {
      nome: "Participação especial",
      descricao: "Participações em eventos",
      preco: converterParaNumero(
        obterValor("preco-participacao")
      )
    },

    personalizado: {
      nome: "Personalizado",
      descricao: "Projeto sob demanda",
      preco: null,
      sob_consulta: true
    }

  },


  midia: {

    possui_midia: !!arquivoMidiaAtual,

    tipo: arquivoMidiaAtual
      ? obterTipoMidia(arquivoMidiaAtual)
      : null,

    nome_arquivo: arquivoMidiaAtual
      ? arquivoMidiaAtual.name
      : null,

    tamanho: arquivoMidiaAtual
      ? arquivoMidiaAtual.size
      : null,

    url: null

  },


  status: "ativo",

  destaque: false,

  criado_em: new Date().toISOString(),

  atualizado_em: new Date().toISOString()

};


return anuncio;

}

function obterTipoMidia(arquivo) {

if (!arquivo) {
  return null;
}


if (arquivo.type.startsWith("image/")) {
  return "imagem";
}


if (arquivo.type.startsWith("video/")) {
  return "video";
}


return null;

}

function obterValor(id) {

const elemento = document.getElementById(id);

if (!elemento) {
  return "";
}


return elemento.value.trim();

}

/* ========================================================= /
/ VALIDAÇÃO /
/ ========================================================= */

function validarFormulario() {

const nome =
  obterValor("nome-artistico");

const estilo =
  obterValor("estilo-musical");

const cidade =
  obterValor("cidade");

const estado =
  obterValor("estado");

const descricao =
  obterValor("descricao");


if (!nome) {

  mostrarErro(
    "Informe o nome artístico."
  );

  focarElemento("nome-artistico");

  return false;

}


if (nome.length < 2) {

  mostrarErro(
    "O nome artístico precisa ter pelo menos 2 caracteres."
  );

  focarElemento("nome-artistico");

  return false;

}


if (!estilo) {

  mostrarErro(
    "Selecione seu estilo musical principal."
  );

  focarElemento("estilo-musical");

  return false;

}


if (!cidade) {

  mostrarErro(
    "Informe sua cidade."
  );

  focarElemento("cidade");

  return false;

}


if (!estado) {

  mostrarErro(
    "Selecione seu estado."
  );

  focarElemento("estado");

  return false;

}


if (!descricao) {

  mostrarErro(
    "Escreva uma descrição sobre seu trabalho."
  );

  focarElemento("descricao");

  return false;

}


if (descricao.length < 30) {

  mostrarErro(
    "A descrição precisa ter pelo menos 30 caracteres."
  );

  focarElemento("descricao");

  return false;

}


const precoAcustico =
  obterValor("preco-acustico");

const precoBanda =
  obterValor("preco-banda");

const precoParticipacao =
  obterValor("preco-participacao");


if (
  !precoAcustico &&
  !precoBanda &&
  !precoParticipacao
) {

  mostrarErro(
    "Informe pelo menos um valor de serviço."
  );

  focarElemento("preco-acustico");

  return false;

}


return true;

}

function focarElemento(id) {

const elemento =
  document.getElementById(id);


if (elemento) {

  elemento.focus();

  elemento.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}

}

/* ========================================================= /
/ PUBLICAR /
/ ========================================================= */

async function publicarAnuncio(event) {

event.preventDefault();


esconderErro();


if (!validarFormulario()) {
  return;
}


alterarEstadoBotao(true);


try {

  const anuncio =
    coletarDadosFormulario();


  /*
   * ======================================================
   * FUTURA INTEGRAÇÃO COM SUPABASE
   * ======================================================
   *
   * Quando a tabela e o Storage estiverem configurados,
   * esta função poderá enviar o anúncio diretamente para
   * o banco.
   */

  const resultado =
    await SALVAR_ANUNCIO(anuncio);


  if (!resultado.sucesso) {

    throw new Error(
      resultado.mensagem ||
      "Não foi possível salvar o anúncio."
    );

  }


  removerRascunho();


  mostrarSucesso();


  console.log(
    "Anúncio MusicalWorld:",
    resultado.anuncio
  );


}

catch (erro) {

  console.error(
    "Erro ao publicar anúncio:",
    erro
  );


  mostrarErro(
    erro.message ||
    "Ocorreu um erro ao publicar o anúncio."
  );

}

finally {

  alterarEstadoBotao(false);

}

}

/* ========================================================= /
/ SALVAR ANÚNCIO /
/ ========================================================= */

async function SALVAR_ANUNCIO(anuncio) {

/*
 * ------------------------------------------------------
 * MODO ATUAL: LOCAL
 * ------------------------------------------------------
 *
 * Isso permite testar todo o fluxo da página antes de
 * conectar o Supabase.
 */


const anuncios =
  obterAnunciosSalvos();


anuncios.push(anuncio);


localStorage.setItem(
  STORAGE_ANUNCIOS,
  JSON.stringify(anuncios)
);


/*
 * ------------------------------------------------------
 * FUTURO SUPABASE
 * ------------------------------------------------------
 *
 * Aqui futuramente teremos algo semelhante a:
 *
 * const { data, error } = await supabaseClient
 *   .from("anuncios")
 *   .insert([anuncio])
 *   .select()
 *   .single();
 *
 * E a mídia será enviada separadamente para o
 * Supabase Storage.
 */


return {
  sucesso: true,
  anuncio: anuncio
};

}

/* ========================================================= /
/ LOCAL STORAGE /
/ ========================================================= */

function obterAnunciosSalvos() {

try {

  const dados =
    localStorage.getItem(STORAGE_ANUNCIOS);


  if (!dados) {
    return [];
  }


  const anuncios =
    JSON.parse(dados);


  return Array.isArray(anuncios)
    ? anuncios
    : [];

}

catch (erro) {

  console.error(
    "Erro ao ler anúncios:",
    erro
  );

  return [];

}

}

function salvarRascunho() {

if (!form) {
  return;
}


try {

  const dados = {

    nome_artistico:
      obterValor("nome-artistico"),

    estilo_musical:
      obterValor("estilo-musical"),

    cidade:
      obterValor("cidade"),

    estado:
      obterValor("estado"),

    descricao:
      obterValor("descricao"),

    experiencia:
      obterValor("experiencia"),

    disponibilidade:
      obterValor("disponibilidade"),

    preco_acustico:
      obterValor("preco-acustico"),

    preco_banda:
      obterValor("preco-banda"),

    preco_participacao:
      obterValor("preco-participacao")

  };


  localStorage.setItem(
    STORAGE_DRAFT,
    JSON.stringify(dados)
  );

}

catch (erro) {

  console.warn(
    "Não foi possível salvar o rascunho.",
    erro
  );

}

}

function carregarRascunho() {

try {

  const dados =
    localStorage.getItem(STORAGE_DRAFT);


  if (!dados) {
    return;
  }


  const rascunho =
    JSON.parse(dados);


  if (!rascunho) {
    return;
  }


  preencherCampo(
    "nome-artistico",
    rascunho.nome_artistico
  );


  preencherCampo(
    "estilo-musical",
    rascunho.estilo_musical
  );


  preencherCampo(
    "cidade",
    rascunho.cidade
  );


  preencherCampo(
    "estado",
    rascunho.estado
  );


  preencherCampo(
    "descricao",
    rascunho.descricao
  );


  preencherCampo(
    "experiencia",
    rascunho.experiencia
  );


  preencherCampo(
    "disponibilidade",
    rascunho.disponibilidade
  );


  preencherCampo(
    "preco-acustico",
    rascunho.preco_acustico
  );


  preencherCampo(
    "preco-banda",
    rascunho.preco_banda
  );


  preencherCampo(
    "preco-participacao",
    rascunho.preco_participacao
  );


  if (contadorDescricao) {

    contadorDescricao.textContent =
      (rascunho.descricao || "").length;

  }

}

catch (erro) {

  console.warn(
    "Não foi possível carregar o rascunho.",
    erro
  );

}

}

function preencherCampo(id, valor) {

const elemento =
  document.getElementById(id);


if (
  elemento &&
  valor !== undefined &&
  valor !== null
) {

  elemento.value = valor;

}

}

function removerRascunho() {

localStorage.removeItem(
  STORAGE_DRAFT
);

}

/* ========================================================= /
/ USUÁRIO /
/ ========================================================= */

function obterUsuarioId() {

/*
 * Futuramente podemos pegar diretamente:
 *
 * supabase.auth.getUser()
 *
 * Por enquanto verificamos algumas possibilidades
 * utilizadas pelo projeto.
 */


const possibilidades = [
  "usuario_id",
  "user_id",
  "musicalworld_usuario_id"
];


for (const chave of possibilidades) {

  const valor =
    localStorage.getItem(chave);


  if (valor) {
    return valor;
  }

}


return null;

}

/* ========================================================= /
/ ID /
/ ========================================================= */

function gerarId() {

return (
  "art_" +
  Date.now().toString(36) +
  "_" +
  Math.random()
    .toString(36)
    .substring(2, 8)
);

}

/* ========================================================= /
/ BOTÃO /
/ ========================================================= */

function alterarEstadoBotao(carregando) {

if (!btnPublicar) {
  return;
}


const normal =
  btnPublicar.querySelector(
    ".btn-submit-content"
  );


const loading =
  btnPublicar.querySelector(
    ".btn-loading-content"
  );


if (carregando) {

  btnPublicar.disabled = true;


  if (normal) {
    normal.style.display = "none";
  }


  if (loading) {
    loading.style.display = "flex";
  }

}

else {

  btnPublicar.disabled = false;


  if (normal) {
    normal.style.display = "flex";
  }


  if (loading) {
    loading.style.display = "none";
  }

}

}

/* ========================================================= /
/ ERROS /
/ ========================================================= */

function mostrarErro(mensagem) {

if (!formError) {
  return;
}


formError.textContent = mensagem;

formError.style.display = "block";


formError.scrollIntoView({
  behavior: "smooth",
  block: "center"
});

}

function esconderErro() {

if (!formError) {
  return;
}


formError.textContent = "";

formError.style.display = "none";

}

/* ========================================================= /
/ SUCESSO /
/ ========================================================= */

function mostrarSucesso() {

if (!successToast) {
  return;
}


successToast.classList.add("show");


setTimeout(function () {

  successToast.classList.remove("show");

}, 4000);

}

/* ========================================================= /
/ VOLTAR /
/ ========================================================= */

window.voltarPagina = function () {

if (document.referrer) {

  window.history.back();

}

else {

  window.location.href =
    "index.html";

}

};

/* ========================================================= /
/ FUNÇÕES PÚBLICAS /
/ ========================================================= */

window.formatarMoeda =
formatarMoeda;

window.converterParaNumero =
converterParaNumero;

})();