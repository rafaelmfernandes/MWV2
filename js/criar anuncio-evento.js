(function () {

"use strict";

/* ========================================================= /
/ CONFIGURAÇÃO /
/ ========================================================= */

const STORAGE_ANUNCIOS =
"anuncios_eventos_musicalworld";

const STORAGE_DRAFT =
"rascunho_anuncio_evento";

const TIPO_ANUNCIO =
"evento";

/* ========================================================= /
/ VARIÁVEIS /
/ ========================================================= */

let form;

let inputMidia;

let mediaPreview;

let mediaName;

let mediaSub;

let btnRemover;

let btnPublicar;

let formError;

let successToast;

let contadorDescricao;

let possuiIngresso;

let ticketFields;

let tipoIngresso;

let ticketPriceGroup;

let arquivoMidiaAtual = null;

let urlMidiaAtual = null;

/* ========================================================= /
/ INICIALIZAÇÃO /
/ ========================================================= */

document.addEventListener(
"DOMContentLoaded",
iniciar
);

function iniciar() {

form =
  document.getElementById(
    "form-criar-anuncio-evento"
  );


inputMidia =
  document.getElementById(
    "input-midia-unica"
  );


mediaPreview =
  document.getElementById(
    "media-preview"
  );


mediaName =
  document.getElementById(
    "media-name-display"
  );


mediaSub =
  document.getElementById(
    "media-sub-display"
  );


btnRemover =
  document.getElementById(
    "btn-remover"
  );


btnPublicar =
  document.getElementById(
    "btn-publicar"
  );


formError =
  document.getElementById(
    "form-error"
  );


successToast =
  document.getElementById(
    "success-toast"
  );


contadorDescricao =
  document.getElementById(
    "contador-descricao"
  );


possuiIngresso =
  document.getElementById(
    "possui-ingresso"
  );


ticketFields =
  document.getElementById(
    "ticket-fields"
  );


tipoIngresso =
  document.getElementById(
    "tipo-ingresso"
  );


ticketPriceGroup =
  document.getElementById(
    "ticket-price-group"
  );


if (!form) {

  console.error(
    "Formulário de evento não encontrado."
  );

  return;

}


configurarFormulario();

configurarDescricao();

configurarIngressos();

configurarPreco();

configurarCEP();

configurarMidia();

carregarRascunho();

}

/* ========================================================= /
/ FORMULÁRIO /
/ ========================================================= */

function configurarFormulario() {

form.addEventListener(
  "submit",
  publicarEvento
);


form.addEventListener(
  "input",
  function () {

    esconderErro();

    salvarRascunho();

  }
);


form.addEventListener(
  "change",
  function () {

    esconderErro();

    salvarRascunho();

  }
);

}

/* ========================================================= /
/ DESCRIÇÃO /
/ ========================================================= */

function configurarDescricao() {

const campo =
  document.getElementById(
    "descricao-evento"
  );


if (!campo || !contadorDescricao) {
  return;
}


function atualizar() {

  contadorDescricao.textContent =
    campo.value.length;

}


campo.addEventListener(
  "input",
  atualizar
);


atualizar();

}

/* ========================================================= /
/ INGRESSOS /
/ ========================================================= */

function configurarIngressos() {

if (!possuiIngresso) {
  return;
}


possuiIngresso.addEventListener(
  "change",
  function () {

    atualizarCamposIngresso();

    salvarRascunho();

  }
);


if (tipoIngresso) {

  tipoIngresso.addEventListener(
    "change",
    function () {

      atualizarTipoIngresso();

      salvarRascunho();

    }
  );

}


atualizarCamposIngresso();

}

function atualizarCamposIngresso() {

if (!ticketFields) {
  return;
}


if (possuiIngresso.checked) {

  ticketFields.classList.add(
    "active"
  );

}

else {

  ticketFields.classList.remove(
    "active"
  );

}


atualizarTipoIngresso();

}

function atualizarTipoIngresso() {

if (!tipoIngresso || !ticketPriceGroup) {
  return;
}


const tipo =
  tipoIngresso.value;


if (
  tipo === "pago"
) {

  ticketPriceGroup.style.display =
    "flex";

}

else {

  ticketPriceGroup.style.display =
    "none";

}

}

/* ========================================================= /
/ PREÇO /
/ ========================================================= */

function configurarPreco() {

const campo =
  document.getElementById(
    "preco-ingresso"
  );


if (!campo) {
  return;
}


campo.addEventListener(
  "input",
  function () {

    campo.value =
      formatarMoeda(
        campo.value
      );

    salvarRascunho();

  }
);

}

function formatarMoeda(valor) {

let numero =
  String(valor || "")
    .replace(/\D/g, "");


if (!numero) {
  return "";
}


numero =
  parseInt(numero, 10) / 100;


return numero.toLocaleString(
  "pt-BR",
  {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
);

}

function converterParaNumero(valor) {

if (!valor) {
  return null;
}


const numero =
  Number(
    String(valor)
      .replace(/\./g, "")
      .replace(",", ".")
  );


return Number.isFinite(numero)
  ? numero
  : null;

}

/* ========================================================= /
/ CEP /
/ ========================================================= */

function configurarCEP() {

const campo =
  document.getElementById(
    "cep-evento"
  );


if (!campo) {
  return;
}


campo.addEventListener(
  "input",
  function () {

    let valor =
      campo.value.replace(
        /\D/g,
        ""
      );


    if (valor.length > 8) {
      valor =
        valor.substring(0, 8);
    }


    if (valor.length > 5) {

      valor =
        valor.substring(0, 5) +
        "-" +
        valor.substring(5);

    }


    campo.value = valor;

  }
);


campo.addEventListener(
  "blur",
  function () {

    buscarCEP(
      campo.value
    );

  }
);

}

async function buscarCEP(cep) {

const numero =
  String(cep || "")
    .replace(/\D/g, "");


if (numero.length !== 8) {
  return;
}


try {

  const resposta =
    await fetch(
      "https://viacep.com.br/ws/" +
      numero +
      "/json/"
    );


  if (!resposta.ok) {
    return;
  }


  const dados =
    await resposta.json();


  if (dados.erro) {
    return;
  }


  const endereco =
    document.getElementById(
      "endereco-evento"
    );


  const cidade =
    document.getElementById(
      "cidade-evento"
    );


  const estado =
    document.getElementById(
      "estado-evento"
    );


  if (
    endereco &&
    !endereco.value
  ) {

    endereco.value =
      montarEndereco(
        dados
      );

  }


  if (
    cidade &&
    dados.localidade
  ) {

    cidade.value =
      dados.localidade;

  }


  if (
    estado &&
    dados.uf
  ) {

    estado.value =
      dados.uf;

  }


  salvarRascunho();

}

catch (erro) {

  console.warn(
    "Não foi possível consultar o CEP.",
    erro
  );

}

}

function montarEndereco(dados) {

const partes = [];


if (dados.logradouro) {
  partes.push(
    dados.logradouro
  );
}


if (dados.bairro) {
  partes.push(
    dados.bairro
  );
}


return partes.join(
  ", "
);

}

/* ========================================================= /
/ MÍDIA /
/ ========================================================= */

function configurarMidia() {

if (!inputMidia) {
  return;
}


inputMidia.addEventListener(
  "change",
  function () {

    processarMidiaUnica(
      this
    );

  }
);


const dropzone =
  document.getElementById(
    "dropzone-box"
  );


if (dropzone) {

  dropzone.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        acionarSeletorMidia();

      }

    }
  );

}

}

window.acionarSeletorMidia =
function () {

  if (inputMidia) {
    inputMidia.click();
  }

};

window.processarMidiaUnica =
function (input) {

  if (
    !input ||
    !input.files ||
    !input.files.length
  ) {

    return;

  }


  const arquivo =
    input.files[0];


  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm"
  ];


  if (
    !tiposPermitidos.includes(
      arquivo.type
    )
  ) {

    mostrarErro(
      "Formato de mídia não permitido. Escolha JPG, PNG, WEBP, MP4 ou WEBM."
    );

    input.value = "";

    return;

  }


  const limite =
    50 * 1024 * 1024;


  if (arquivo.size > limite) {

    mostrarErro(
      "O arquivo é muito grande. Escolha uma mídia de até 50 MB."
    );

    input.value = "";

    return;

  }


  limparUrlMidia();


  arquivoMidiaAtual =
    arquivo;


  urlMidiaAtual =
    URL.createObjectURL(
      arquivo
    );


  mostrarPreviewMidia(
    arquivo
  );


  salvarRascunho();

};

function mostrarPreviewMidia(
arquivo
) {

if (!mediaPreview) {
  return;
}


mediaPreview.innerHTML =
  "";


if (
  arquivo.type.startsWith(
    "image/"
  )
) {

  const img =
    document.createElement(
      "img"
    );


  img.src =
    urlMidiaAtual;


  img.alt =
    "Prévia do evento";


  mediaPreview.appendChild(
    img
  );

}


else if (
  arquivo.type.startsWith(
    "video/"
  )
) {

  const video =
    document.createElement(
      "video"
    );


  video.src =
    urlMidiaAtual;


  video.muted =
    true;


  video.playsInline =
    true;


  video.preload =
    "metadata";


  mediaPreview.appendChild(
    video
  );

}


if (mediaName) {

  mediaName.textContent =
    arquivo.name;

}


if (mediaSub) {

  const tamanho =
    formatarTamanhoArquivo(
      arquivo.size
    );


  const tipo =
    arquivo.type.startsWith(
      "image/"
    )
      ? "Imagem"
      : "Vídeo";


  mediaSub.textContent =
    tipo +
    " • " +
    tamanho;

}


if (btnRemover) {

  btnRemover.style.display =
    "flex";

}

}

function formatarTamanhoArquivo(
bytes
) {

if (bytes < 1024) {

  return bytes + " B";

}


if (
  bytes <
  1024 * 1024
) {

  return (
    (bytes / 1024).toFixed(1) +
    " KB"
  );

}


return (
  (
    bytes /
    (1024 * 1024)
  ).toFixed(1) +
  " MB"
);

}

window.limparMidia =
function () {

  limparUrlMidia();


  arquivoMidiaAtual =
    null;


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

    mediaName.textContent =
      "Adicionar foto ou vídeo";

  }


  if (mediaSub) {

    mediaSub.textContent =
      "JPG, PNG, WEBP, MP4 ou WEBM";

  }


  if (btnRemover) {

    btnRemover.style.display =
      "none";

  }


  salvarRascunho();

};

function limparUrlMidia() {

if (urlMidiaAtual) {

  URL.revokeObjectURL(
    urlMidiaAtual
  );

  urlMidiaAtual =
    null;

}

}

/* ========================================================= /
/ COLETAR DADOS /
/ ========================================================= */

function coletarDadosFormulario() {

const possuiIngressoValor =
  !!(
    document.getElementById(
      "possui-ingresso"
    )?.checked
  );


const dadosIngresso = {

  possui_ingresso:
    possuiIngressoValor,

  tipo:
    possuiIngressoValor
      ? obterValor(
          "tipo-ingresso"
        )
      : null,

  preco:
    possuiIngressoValor
      ? converterParaNumero(
          obterValor(
            "preco-ingresso"
          )
        )
      : null,

  link:
    possuiIngressoValor
      ? obterValor(
          "link-ingresso"
        )
      : null,

  venda_musicalworld:
    false

};


const anuncio = {

  id:
    gerarId(),

  usuario_id:
    obterUsuarioId(),

  tipo_anuncio:
    TIPO_ANUNCIO,


  titulo:
    obterValor(
      "titulo-evento"
    ),


  tipo_evento:
    obterValor(
      "tipo-evento"
    ),


  classificacao:
    obterValor(
      "classificacao"
    ),


  descricao:
    obterValor(
      "descricao-evento"
    ),


  artistas:
    obterValor(
      "artistas-evento"
    ),


  data_evento:
    obterValor(
      "data-evento"
    ),


  horario_inicio:
    obterValor(
      "horario-inicio"
    ),


  horario_fim:
    obterValor(
      "horario-fim"
    ),


  local: {

    nome:
      obterValor(
        "nome-local"
      ),

    cidade:
      obterValor(
        "cidade-evento"
      ),

    estado:
      obterValor(
        "estado-evento"
      ),

    endereco:
      obterValor(
        "endereco-evento"
      ),

    cep:
      obterValor(
        "cep-evento"
      ),

    complemento:
      obterValor(
        "complemento-evento"
      )

  },


  ingressos:
    dadosIngresso,


  midia: {

    possui_midia:
      !!arquivoMidiaAtual,

    tipo:
      arquivoMidiaAtual
        ? obterTipoMidia(
            arquivoMidiaAtual
          )
        : null,

    nome_arquivo:
      arquivoMidiaAtual
        ? arquivoMidiaAtual.name
        : null,

    tamanho:
      arquivoMidiaAtual
        ? arquivoMidiaAtual.size
        : null,

    url:
      null

  },


  /*
   * Esse campo permitirá no futuro
   * controlar se o anúncio aparece
   * no carrossel de Conteúdo em destaque.
   */

  destaque:
    true,


  status:
    "ativo",


  criado_em:
    new Date().toISOString(),


  atualizado_em:
    new Date().toISOString()

};


return anuncio;

}

function obterTipoMidia(
arquivo
) {

if (!arquivo) {
  return null;
}


if (
  arquivo.type.startsWith(
    "image/"
  )
) {

  return "imagem";

}


if (
  arquivo.type.startsWith(
    "video/"
  )
) {

  return "video";

}


return null;

}

function obterValor(id) {

const elemento =
  document.getElementById(
    id
  );


if (!elemento) {
  return "";
}


return elemento.value.trim();

}

/* ========================================================= /
/ VALIDAÇÃO /
/ ========================================================= */

function validarFormulario() {

const titulo =
  obterValor(
    "titulo-evento"
  );


const tipo =
  obterValor(
    "tipo-evento"
  );


const descricao =
  obterValor(
    "descricao-evento"
  );


const data =
  obterValor(
    "data-evento"
  );


const inicio =
  obterValor(
    "horario-inicio"
  );


const local =
  obterValor(
    "nome-local"
  );


const cidade =
  obterValor(
    "cidade-evento"
  );


const estado =
  obterValor(
    "estado-evento"
  );


const endereco =
  obterValor(
    "endereco-evento"
  );


if (!titulo) {

  mostrarErro(
    "Informe o nome do evento."
  );

  focarElemento(
    "titulo-evento"
  );

  return false;

}


if (titulo.length < 3) {

  mostrarErro(
    "O nome do evento precisa ter pelo menos 3 caracteres."
  );

  focarElemento(
    "titulo-evento"
  );

  return false;

}


if (!tipo) {

  mostrarErro(
    "Selecione o tipo de evento."
  );

  focarElemento(
    "tipo-evento"
  );

  return false;

}


if (!descricao) {

  mostrarErro(
    "Informe uma descrição para o evento."
  );

  focarElemento(
    "descricao-evento"
  );

  return false;

}


if (descricao.length < 30) {

  mostrarErro(
    "A descrição precisa ter pelo menos 30 caracteres."
  );

  focarElemento(
    "descricao-evento"
  );

  return false;

}


if (!data) {

  mostrarErro(
    "Informe a data do evento."
  );

  focarElemento(
    "data-evento"
  );

  return false;

}


if (!inicio) {

  mostrarErro(
    "Informe o horário de início."
  );

  focarElemento(
    "horario-inicio"
  );

  return false;

}


if (!local) {

  mostrarErro(
    "Informe o nome do local."
  );

  focarElemento(
    "nome-local"
  );

  return false;

}


if (!cidade) {

  mostrarErro(
    "Informe a cidade do evento."
  );

  focarElemento(
    "cidade-evento"
  );

  return false;

}


if (!estado) {

  mostrarErro(
    "Informe o estado do evento."
  );

  focarElemento(
    "estado-evento"
  );

  return false;

}


if (!endereco) {

  mostrarErro(
    "Informe o endereço do evento."
  );

  focarElemento(
    "endereco-evento"
  );

  return false;

}


const possuiIngresso =
  document.getElementById(
    "possui-ingresso"
  )?.checked;


if (possuiIngresso) {

  const tipoIngressoValor =
    obterValor(
      "tipo-ingresso"
    );


  if (!tipoIngressoValor) {

    mostrarErro(
      "Selecione o tipo de ingresso."
    );

    focarElemento(
      "tipo-ingresso"
    );

    return false;

  }


  if (
    tipoIngressoValor === "pago"
  ) {

    const preco =
      converterParaNumero(
        obterValor(
          "preco-ingresso"
        )
      );


    if (
      !preco ||
      preco <= 0
    ) {

      mostrarErro(
        "Informe um preço válido para o ingresso."
      );

      focarElemento(
        "preco-ingresso"
      );

      return false;

    }

  }

}


return true;

}

/* ========================================================= /
/ PUBLICAR /
/ ========================================================= */

async function publicarEvento(
event
) {

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
   * ====================================================
   * PONTO DE INTEGRAÇÃO COM SUPABASE
   * ====================================================
   *
   * Quando o banco estiver configurado,
   * SALVAR_ANUNCIO() fará o INSERT na tabela
   * de anúncios.
   *
   * A mídia será enviada separadamente para
   * o Supabase Storage.
   */


  const resultado =
    await SALVAR_ANUNCIO(
      anuncio
    );


  if (
    !resultado.sucesso
  ) {

    throw new Error(
      resultado.mensagem ||
      "Não foi possível publicar o evento."
    );

  }


  removerRascunho();


  mostrarSucesso();


  console.log(
    "Evento MusicalWorld:",
    resultado.anuncio
  );


}

catch (erro) {

  console.error(
    "Erro ao publicar evento:",
    erro
  );


  mostrarErro(
    erro.message ||
    "Ocorreu um erro ao publicar o evento."
  );

}

finally {

  alterarEstadoBotao(
    false
  );

}

}

/* ========================================================= /
/ SALVAR ANÚNCIO /
/ ========================================================= */

async function SALVAR_ANUNCIO(
anuncio
) {

/*
 * MODO ATUAL
 *
 * Salva o anúncio localmente para
 * conseguirmos testar o funcionamento
 * da página antes da conexão com o banco.
 */


const anuncios =
  obterAnuncios();


anuncios.push(
  anuncio
);


localStorage.setItem(
  STORAGE_ANUNCIOS,
  JSON.stringify(
    anuncios
  )
);


/*
 * ====================================================
 * FUTURO SUPABASE
 * ====================================================
 *
 * Exemplo:
 *
 * const { data, error } =
 *   await supabaseClient
 *     .from("anuncios")
 *     .insert([anuncio])
 *     .select()
 *     .single();
 *
 * Depois:
 *
 * - Upload da imagem/vídeo no Storage
 * - Salvar a URL em anuncio.midia.url
 * - Relacionar usuario_id
 * - Retornar o registro criado
 */


return {

  sucesso: true,

  anuncio:
    anuncio

};

}

/* ========================================================= /
/ LOCAL STORAGE /
/ ========================================================= */

function obterAnuncios() {

try {

  const dados =
    localStorage.getItem(
      STORAGE_ANUNCIOS
    );


  if (!dados) {
    return [];
  }


  const anuncios =
    JSON.parse(
      dados
    );


  return Array.isArray(
    anuncios
  )
    ? anuncios
    : [];

}

catch (erro) {

  console.error(
    "Erro ao carregar anúncios:",
    erro
  );

  return [];

}

}

/* ========================================================= /
/ RASCUNHO /
/ ========================================================= */

function salvarRascunho() {

if (!form) {
  return;
}


try {

  const rascunho = {

    titulo_evento:
      obterValor(
        "titulo-evento"
      ),

    tipo_evento:
      obterValor(
        "tipo-evento"
      ),

    classificacao:
      obterValor(
        "classificacao"
      ),

    descricao_evento:
      obterValor(
        "descricao-evento"
      ),

    artistas_evento:
      obterValor(
        "artistas-evento"
      ),

    data_evento:
      obterValor(
        "data-evento"
      ),

    horario_inicio:
      obterValor(
        "horario-inicio"
      ),

    horario_fim:
      obterValor(
        "horario-fim"
      ),

    nome_local:
      obterValor(
        "nome-local"
      ),

    cidade:
      obterValor(
        "cidade-evento"
      ),

    estado:
      obterValor(
        "estado-evento"
      ),

    endereco:
      obterValor(
        "endereco-evento"
      ),

    cep:
      obterValor(
        "cep-evento"
      ),

    complemento:
      obterValor(
        "complemento-evento"
      ),

    possui_ingresso:
      !!(
        document.getElementById(
          "possui-ingresso"
        )?.checked
      ),

    tipo_ingresso:
      obterValor(
        "tipo-ingresso"
      ),

    preco_ingresso:
      obterValor(
        "preco-ingresso"
      ),

    link_ingresso:
      obterValor(
        "link-ingresso"
      )

  };


  localStorage.setItem(
    STORAGE_DRAFT,
    JSON.stringify(
      rascunho
    )
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
    localStorage.getItem(
      STORAGE_DRAFT
    );


  if (!dados) {
    return;
  }


  const rascunho =
    JSON.parse(
      dados
    );


  if (!rascunho) {
    return;
  }


  preencher(
    "titulo-evento",
    rascunho.titulo_evento
  );


  preencher(
    "tipo-evento",
    rascunho.tipo_evento
  );


  preencher(
    "classificacao",
    rascunho.classificacao
  );


  preencher(
    "descricao-evento",
    rascunho.descricao_evento
  );


  preencher(
    "artistas-evento",
    rascunho.artistas_evento
  );


  preencher(
    "data-evento",
    rascunho.data_evento
  );


  preencher(
    "horario-inicio",
    rascunho.horario_inicio
  );


  preencher(
    "horario-fim",
    rascunho.horario_fim
  );


  preencher(
    "nome-local",
    rascunho.nome_local
  );


  preencher(
    "cidade-evento",
    rascunho.cidade
  );


  preencher(
    "estado-evento",
    rascunho.estado
  );


  preencher(
    "endereco-evento",
    rascunho.endereco
  );


  preencher(
    "cep-evento",
    rascunho.cep
  );


  preencher(
    "complemento-evento",
    rascunho.complemento
  );


  preencher(
    "tipo-ingresso",
    rascunho.tipo_ingresso
  );


  preencher(
    "preco-ingresso",
    rascunho.preco_ingresso
  );


  preencher(
    "link-ingresso",
    rascunho.link_ingresso
  );


  const ingresso =
    document.getElementById(
      "possui-ingresso"
    );


  if (ingresso) {

    ingresso.checked =
      !!rascunho.possui_ingresso;

  }


  atualizarCamposIngresso();


  if (contadorDescricao) {

    contadorDescricao.textContent =
      (
        rascunho.descricao_evento ||
        ""
      ).length;

  }

}

catch (erro) {

  console.warn(
    "Não foi possível carregar o rascunho.",
    erro
  );

}

}

function preencher(
id,
valor
) {

const elemento =
  document.getElementById(
    id
  );


if (
  elemento &&
  valor !== undefined &&
  valor !== null
) {

  elemento.value =
    valor;

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

const possibilidades = [
  "usuario_id",
  "user_id",
  "musicalworld_usuario_id"
];


for (
  const chave of possibilidades
) {

  const valor =
    localStorage.getItem(
      chave
    );


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
  "evt_" +
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

function alterarEstadoBotao(
carregando
) {

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

  btnPublicar.disabled =
    true;


  if (normal) {
    normal.style.display =
      "none";
  }


  if (loading) {
    loading.style.display =
      "flex";
  }

}

else {

  btnPublicar.disabled =
    false;


  if (normal) {
    normal.style.display =
      "flex";
  }


  if (loading) {
    loading.style.display =
      "none";
  }

}

}

/* ========================================================= /
/ ERRO /
/ ========================================================= */

function mostrarErro(
mensagem
) {

if (!formError) {
  return;
}


formError.textContent =
  mensagem;


formError.style.display =
  "block";


formError.scrollIntoView({
  behavior: "smooth",
  block: "center"
});

}

function esconderErro() {

if (!formError) {
  return;
}


formError.textContent =
  "";


formError.style.display =
  "none";

}

/* ========================================================= /
/ SUCESSO /
/ ========================================================= */

function mostrarSucesso() {

if (!successToast) {
  return;
}


successToast.classList.add(
  "show"
);


setTimeout(
  function () {

    successToast.classList.remove(
      "show"
    );

  },
  4000
);

}

/* ========================================================= /
/ VOLTAR /
/ ========================================================= */

window.voltarPagina =
function () {

  if (
    document.referrer
  ) {

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