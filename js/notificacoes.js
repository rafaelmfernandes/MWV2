(function () {

"use strict";

/*

=========================================================
MUSICALWORLD
CENTRAL DE SOLICITAÇÕES
Esta página trabalha com:
Solicitações recebidas de outros usuários
Contratações criadas pelo fluxo do aplicativo
Dados salvos no localStorage
Posteriormente, quando o Supabase estiver conectado,
esta mesma estrutura poderá ser alimentada pelo banco.
=========================================================
*/

let solicitacoes = [];

let filtroAtual = "todas";

/*

=========================================================
INICIALIZAÇÃO
=========================================================
*/

document.addEventListener("DOMContentLoaded", function () {

carregarSolicitacoes();

renderizarSolicitacoes();

});

/*

=========================================================
CARREGAR SOLICITAÇÕES
=========================================================
*/

function carregarSolicitacoes() {

solicitacoes = [];


/*
 * ---------------------------------------------------------
 * 1. RECUPERA SOLICITAÇÕES SALVAS
 * ---------------------------------------------------------
 */

try {

  const salvas =
    JSON.parse(
      localStorage.getItem("solicitacoes_musicalworld") || "[]"
    );


  if (Array.isArray(salvas)) {

    solicitacoes.push(...salvas);

  }

} catch (erro) {

  console.error(
    "Erro ao carregar solicitações:",
    erro
  );

}


/*
 * ---------------------------------------------------------
 * 2. RECUPERA A CONTRATAÇÃO MAIS RECENTE
 *
 * A página sucesso-servico.js mantém os dados em:
 *
 * evento_artista_atual
 * ---------------------------------------------------------
 */

try {

  const evento =
    JSON.parse(
      localStorage.getItem("evento_artista_atual") || "null"
    );


  if (
    evento &&
    evento.servico
  ) {

    const idEvento =
      evento.id ||
      evento.idContratacao ||
      gerarIdLocal();


    /*
     * Evita duplicar a mesma contratação.
     */

    const jaExiste =
      solicitacoes.some(function (item) {

        return (
          item.id === idEvento ||
          item.idContratacao === idEvento
        );

      });


    if (!jaExiste) {

      const novaSolicitacao = {

        id: idEvento,

        tipo: "contratacao",

        contratante:
          evento.contratante ||
          "Nova contratação",

        artista:
          evento.artista ||
          "",

        servico:
          evento.servico ||
          "Serviço personalizado",

        preco:
          evento.preco ||
          "",

        data:
          evento.dataDoEvento ||
          "",

        horario:
          evento.horarioDoEvento ||
          "",

        local:
          evento.nomeLocal ||
          "Local não informado",

        endereco:
          evento.localDoEvento ||
          "",

        cep:
          evento.cep ||
          "",

        pagamento:
          evento.pagamento ||
          "",

        observacao:
          evento.observacao ||
          "",

        status:
          normalizarStatus(
            evento.status
          ) || "pendente",

        criadaEm:
          evento.criadaEm ||
          new Date().toISOString()

      };


      solicitacoes.unshift(
        novaSolicitacao
      );


      salvarSolicitacoes();

    }

  }

} catch (erro) {

  console.error(
    "Erro ao carregar contratação atual:",
    erro
  );

}


/*
 * ---------------------------------------------------------
 * 3. SE NÃO EXISTIR NENHUMA SOLICITAÇÃO
 *
 * Mantemos exemplos somente para desenvolvimento.
 *
 * Eles serão removidos automaticamente quando houver
 * dados reais.
 * ---------------------------------------------------------
 */

if (solicitacoes.length === 0) {

  solicitacoes = obterDadosDemonstracao();

}

}

/*

=========================================================
DADOS DE DEMONSTRAÇÃO
=========================================================
*/

function obterDadosDemonstracao() {

return [

  {

    id: "demo-carlos",

    tipo: "proposta",

    contratante: "Carlos Silva",

    servico:
      "Show Acústico (Voz e Violão)",

    preco: "1200",

    data: "2026-09-18",

    horario: "20:00",

    local:
      "Setor Bueno, Goiânia - GO",

    endereco:
      "Setor Bueno, Goiânia - GO",

    pagamento:
      "PIX",

    observacao:
      "Aniversário de 40 anos para cerca de 80 pessoas. Precisamos de um repertório bem animado de sertanejo universitário.",

    status: "pendente"

  },


  {

    id: "demo-amanda",

    tipo: "proposta",

    contratante:
      "Amanda Lima (Produção Eventos)",

    servico:
      "Banda Completa (Diária)",

    preco: "2800",

    data: "2026-09-25",

    horario: "22:00",

    local:
      "Anápolis - GO",

    endereco:
      "Anápolis - GO",

    pagamento:
      "PIX",

    observacao:
      "",

    status: "aceito"

  }

];

}

/*

=========================================================
RENDERIZAR
=========================================================
*/

function renderizarSolicitacoes() {

const container =
  document.getElementById(
    "notifications-list"
  );

const emptyState =
  document.getElementById(
    "empty-state"
  );


if (!container) {
  return;
}


container.innerHTML = "";


const filtradas =
  solicitacoes.filter(function (item) {

    if (filtroAtual === "todas") {
      return true;
    }

    return normalizarStatus(item.status) === filtroAtual;

  });


if (filtradas.length === 0) {

  container.style.display = "none";

  if (emptyState) {
    emptyState.style.display = "block";
  }

  return;

}


container.style.display = "flex";

if (emptyState) {
  emptyState.style.display = "none";
}


filtradas.forEach(function (solicitacao) {

  container.appendChild(
    criarCardSolicitacao(
      solicitacao
    )
  );

});

}

/*

=========================================================
CRIAR CARD
=========================================================
*/

function criarCardSolicitacao(
solicitacao
) {

const card =
  document.createElement("div");


const status =
  normalizarStatus(
    solicitacao.status
  );


card.className =
  "notification-card " +
  obterClasseStatus(status);


const nome =
  solicitacao.contratante ||
  solicitacao.cliente ||
  "Contratante";


const iniciais =
  gerarIniciais(nome);


const cor =
  gerarCorAvatar(nome);


const badge =
  obterTextoStatus(status);


const data =
  formatarData(
    solicitacao.data
  );


const horario =
  solicitacao.horario ||
  "--:--";


const preco =
  formatarPreco(
    solicitacao.preco
  );


const local =
  solicitacao.local ||
  "Local não informado";


const endereco =
  solicitacao.endereco ||
  "";


const observacao =
  solicitacao.observacao ||
  "";


card.innerHTML = `

  <div class="notif-card-top">

    <div
      class="notif-avatar"
      style="background-color: ${cor};"
    >
      ${iniciais}
    </div>


    <div class="notif-user-details">

      <div class="notif-name-row">

        <h4>
          ${escaparHTML(nome)}
        </h4>

        <span class="badge-status ${status}">
          ${badge}
        </span>

      </div>


      <span class="notif-location">
        ${escaparHTML(local)}
      </span>

    </div>

  </div>


  <div class="notif-details-box">

    <div class="notif-info-row">

      <span class="label">
        Serviço
      </span>

      <span class="value">
        ${escaparHTML(
          solicitacao.servico ||
          "Serviço não informado"
        )}
      </span>

    </div>


    <div class="notif-info-row">

      <span class="label">
        Data
      </span>

      <span class="value">
        ${data}
        ${horario !== "--:--" ? " às " + escaparHTML(horario) : ""}
      </span>

    </div>


    <div class="notif-info-row">

      <span class="label">
        ${status === "aceito"
          ? "Valor acordado"
          : "Valor oferecido"}
      </span>

      <span class="value cash">
        ${preco}
      </span>

    </div>


    ${
      endereco
        ? `
          <div class="notif-info-row">

            <span class="label">
              Endereço
            </span>

            <span class="value">
              ${escaparHTML(endereco)}
            </span>

          </div>
        `
        : ""
    }


    ${
      solicitacao.pagamento
        ? `
          <div class="notif-info-row">

            <span class="label">
              Pagamento
            </span>

            <span class="value">
              ${escaparHTML(
                formatarPagamento(
                  solicitacao.pagamento
                )
              )}
            </span>

          </div>
        `
        : ""
    }


    ${
      observacao
        ? `
          <p class="notif-obs">
            "${escaparHTML(observacao)}"
          </p>
        `
        : ""
    }

  </div>


  <div class="notif-actions">

    ${criarBotoesAcao(
      solicitacao,
      status
    )}

  </div>

`;


return card;

}

/*

=========================================================
BOTÕES
=========================================================
*/

function criarBotoesAcao(
solicitacao,
status
) {

if (status === "pendente") {

  return `

    <button
      class="btn-recusar"
      onclick="responderProposta('${solicitacao.id}', 'recusada')"
    >
      Recusar
    </button>


    <button
      class="btn-aceitar"
      onclick="responderProposta('${solicitacao.id}', 'aceita')"
    >
      Aceitar proposta
    </button>

  `;

}


if (status === "aceito") {

  return `

    <button
      class="btn-chat"
      onclick="abrirMensagens('${solicitacao.id}')"
    >
      Conversar com contratante
    </button>

  `;

}


return `

  <button
    class="btn-chat"
    onclick="verDetalhes('${solicitacao.id}')"
  >
    Ver detalhes
  </button>

`;

}

/*

=========================================================
ACEITAR / RECUSAR
=========================================================
*/

window.responderProposta =
function (id, resposta) {

  const solicitacao =
    solicitacoes.find(function (item) {

      return (
        item.id === id ||
        item.idContratacao === id
      );

    });


  if (!solicitacao) {

    console.warn(
      "Solicitação não encontrada:",
      id
    );

    return;

  }


  if (resposta === "aceita") {

    solicitacao.status =
      "aceito";

  } else {

    solicitacao.status =
      "recusado";

  }


  solicitacao.atualizadaEm =
    new Date().toISOString();


  salvarSolicitacoes();


  /*
   * Mantém o evento atual sincronizado.
   */

  sincronizarEventoAtual(
    solicitacao
  );


  renderizarSolicitacoes();

};

/*

=========================================================
SINCRONIZAR EVENTO ATUAL
=========================================================
*/

function sincronizarEventoAtual(
solicitacao
) {

try {

  const evento =
    JSON.parse(
      localStorage.getItem(
        "evento_artista_atual"
      ) || "null"
    );


  if (!evento) {
    return;
  }


  const idEvento =
    evento.id ||
    evento.idContratacao;


  if (
    idEvento === solicitacao.id
  ) {

    evento.status =
      solicitacao.status;

    evento.atualizadaEm =
      solicitacao.atualizadaEm;


    localStorage.setItem(
      "evento_artista_atual",
      JSON.stringify(evento)
    );

  }

} catch (erro) {

  console.error(
    "Erro ao sincronizar evento:",
    erro
  );

}

}

/*

=========================================================
FILTROS
=========================================================
*/

window.filtrarSolicitacoes =
function (filtro) {

  filtroAtual = filtro;


  document
    .querySelectorAll(".filter-tab")
    .forEach(function (botao) {

      botao.classList.toggle(
        "ativo",
        botao.dataset.filtro === filtro
      );

    });


  renderizarSolicitacoes();

};

/*

=========================================================
ABRIR MENSAGENS
=========================================================
*/

window.abrirMensagens =
function (id) {

  const solicitacao =
    solicitacoes.find(function (item) {

      return item.id === id;

    });


  const params =
    new URLSearchParams();


  if (solicitacao) {

    params.set(
      "id",
      solicitacao.id
    );

    params.set(
      "contratante",
      solicitacao.contratante || ""
    );

    params.set(
      "artista",
      solicitacao.artista || ""
    );

  }


  window.location.href =
    "mensagens.html?" +
    params.toString();

};

/*

=========================================================
DETALHES
=========================================================
*/

window.verDetalhes =
function (id) {

  const solicitacao =
    solicitacoes.find(function (item) {

      return item.id === id;

    });


  if (!solicitacao) {
    return;
  }


  const params =
    new URLSearchParams();


  Object.keys(solicitacao)
    .forEach(function (chave) {

      if (
        solicitacao[chave] !== undefined &&
        solicitacao[chave] !== null
      ) {

        params.set(
          chave,
          solicitacao[chave]
        );

      }

    });


  window.location.href =
    "resumo-servico.html?" +
    params.toString();

};

/*

=========================================================
SALVAR
=========================================================
*/

function salvarSolicitacoes() {

try {

  localStorage.setItem(
    "solicitacoes_musicalworld",
    JSON.stringify(
      solicitacoes
    )
  );

} catch (erro) {

  console.error(
    "Erro ao salvar solicitações:",
    erro
  );

}

}

/*

=========================================================
FORMATADORES
=========================================================
*/

function formatarData(
data
) {

if (!data) {
  return "Data não informada";
}


const partes =
  data.split("-");


if (
  partes.length === 3 &&
  partes[0].length === 4
) {

  return (
    partes[2] +
    "/" +
    partes[1] +
    "/" +
    partes[0]
  );

}


return data;

}

function formatarPreco(
preco
) {

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

function formatarPagamento(
pagamento
) {

const valor =
  String(
    pagamento || ""
  )
  .toLowerCase()
  .trim();


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


return pagamento;

}

/*

=========================================================
STATUS
=========================================================
*/

function normalizarStatus(
status
) {

const valor =
  String(
    status || ""
  )
  .toLowerCase()
  .trim();


if (
  valor === "aceita" ||
  valor === "aceito" ||
  valor === "confirmado"
) {

  return "aceito";

}


if (
  valor === "recusada" ||
  valor === "recusado"
) {

  return "recusado";

}


return "pendente";

}

function obterClasseStatus(
status
) {

if (status === "aceito") {
  return "accepted";
}


if (status === "recusado") {
  return "rejected";
}


return "pending";

}

function obterTextoStatus(
status
) {

if (status === "aceito") {
  return "Aceito";
}


if (status === "recusado") {
  return "Recusado";
}


return "Pendente";

}

/*

=========================================================
INICIAIS
=========================================================
*/

function gerarIniciais(
nome
) {

const palavras =
  String(nome || "MW")
    .trim()
    .split(/\s+/)
    .filter(Boolean);


if (palavras.length === 1) {

  return palavras[0]
    .substring(0, 2)
    .toUpperCase();

}


return (
  palavras[0][0] +
  palavras[
    palavras.length - 1
  ][0]
).toUpperCase();

}

/*

=========================================================
COR DO AVATAR
=========================================================
*/

function gerarCorAvatar(
nome
) {

const cores = [
  "#1677d2",
  "#7c5ce0",
  "#0891b2",
  "#159a67",
  "#d97706",
  "#db4b6b"
];


let total = 0;


for (
  let i = 0;
  i < nome.length;
  i++
) {

  total +=
    nome.charCodeAt(i);

}


return cores[
  total % cores.length
];

}

/*

=========================================================
SEGURANÇA HTML
=========================================================
*/

function escaparHTML(
texto
) {

return String(
  texto ?? ""
)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#039;");

}

/*

=========================================================
ID LOCAL
=========================================================
*/

function gerarIdLocal() {

return (
  "contratacao-" +
  Date.now() +
  "-" +
  Math.random()
    .toString(36)
    .substring(2, 8)
);

}

/*

=========================================================
VOLTAR AO INÍCIO
=========================================================
*/

window.voltarInicio =
function () {

  window.location.href =
    "index.html";

};

})();