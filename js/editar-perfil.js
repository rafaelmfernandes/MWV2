/* =========================================================
MUSICALWORLD
EDITAR PERFIL
========================================================= */

const CONFIG = {

usarSupabase: false,

tabelaPerfis: "perfis_artistas",

STORAGE_KEY: "musicalworld_perfil_artista",

STORAGE_FOTO_KEY: "musicalworld_perfil_foto",

LIMITE_BIOGRAFIA: 1000

};

/* =========================================================
ESTADO
========================================================= */

let perfilAtual = null;

let servicos = [];

let portfolio = [];

let audios = [];

let fotoPerfil = null;

/* =========================================================
DADOS DEMONSTRAÇÃO
========================================================= */

const PERFIL_DEMO = {

id: null,

nome: "Rafael Melo",

categoria: "Cantor e músico",

descricaoProfissional: "Cantor e violonista",

generos: [
"MPB",
"Pop",
"Sertanejo"
],

cidade: "Goiânia",

estado: "GO",

areaAtendimento:
"Goiânia e região metropolitana",

biografia:
"10 anos de estrada, repertório autoral e covers. Toco em casamentos, aniversários, bares, restaurantes e eventos corporativos, sozinho ou com banda.",

experiencia: "Mais de 10 anos",

tempoAtuacao: "10 anos de estrada",

receberSolicitacoes: true,

horarioAtendimento:
"Segunda a sexta, das 9h às 18h",

instagram: "rafaelmelo",

youtube: "",

spotify: "",

site: "",

visibilidade: "publico",

avatarUrl: "",

servicos: [


{
  id: "servico_1",
  nome: "Voz e violão",
  duracao: "2 horas",
  preco: "R$ 800",
  descricao:
    "Ideal para cerimônias e recepções."
},

{
  id: "servico_2",
  nome: "Banda completa",
  duracao: "4 horas",
  preco: "R$ 2.400",
  descricao:
    "4 músicos, som e iluminação inclusos."
}


],

portfolio: [


{
  id: "portfolio_1",
  titulo: "Show ao vivo",
  tipo: "video",
  url: ""
},

{
  id: "portfolio_2",
  titulo: "Casamento",
  tipo: "video",
  url: ""
}


],

audios: [


{
  id: "audio_1",
  titulo: "Caminho de volta",
  descricao: "Composição própria",
  url: "",
  duracao: "3:45"
},

{
  id: "audio_2",
  titulo: "Manhã de domingo",
  descricao: "Cover acústico",
  url: "",
  duracao: "2:58"
}


]

};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

carregarPerfil();

configurarEventos();

renderizarPerfil();

atualizarContadorBiografia();

});

/* =========================================================
CARREGAR PERFIL
========================================================= */

function carregarPerfil() {

try {


const salvo =
  localStorage.getItem(CONFIG.STORAGE_KEY);

if (salvo) {

  perfilAtual = JSON.parse(salvo);

} else {

  perfilAtual = structuredClone
    ? structuredClone(PERFIL_DEMO)
    : JSON.parse(JSON.stringify(PERFIL_DEMO));

}


} catch (erro) {


console.error(
  "Erro ao carregar perfil:",
  erro
);

perfilAtual =
  JSON.parse(JSON.stringify(PERFIL_DEMO));


}

servicos =
Array.isArray(perfilAtual.servicos)
? [...perfilAtual.servicos]
: [];

portfolio =
Array.isArray(perfilAtual.portfolio)
? [...perfilAtual.portfolio]
: [];

audios =
Array.isArray(perfilAtual.audios)
? [...perfilAtual.audios]
: [];

fotoPerfil =
perfilAtual.avatarUrl || null;

}

/* =========================================================
RENDERIZAR PERFIL
========================================================= */

function renderizarPerfil() {

definirValor("nome", perfilAtual.nome);

definirValor(
"categoria",
perfilAtual.categoria
);

definirValor(
"nome-profissional",
perfilAtual.descricaoProfissional
);

definirValor(
"cidade",
perfilAtual.cidade
);

definirValor(
"estado",
perfilAtual.estado
);

definirValor(
"area-atendimento",
perfilAtual.areaAtendimento
);

definirValor(
"biografia",
perfilAtual.biografia
);

definirValor(
"experiencia",
perfilAtual.experiencia
);

definirValor(
"tempo-atuacao",
perfilAtual.tempoAtuacao
);

definirValor(
"horario-atendimento",
perfilAtual.horarioAtendimento
);

definirValor(
"instagram",
perfilAtual.instagram
);

definirValor(
"youtube",
perfilAtual.youtube
);

definirValor(
"spotify",
perfilAtual.spotify
);

definirValor(
"site",
perfilAtual.site
);

const receberSolicitacoes =
document.getElementById(
"receber-solicitacoes"
);

if (receberSolicitacoes) {


receberSolicitacoes.checked =
  perfilAtual.receberSolicitacoes !== false;


}

const radio =
document.querySelector(
`input[name="visibilidade"][value="${perfilAtual.visibilidade || "publico"}"]`
);

if (radio) {
radio.checked = true;
}

selecionarGeneros(
perfilAtual.generos || []
);

atualizarAvatar();

renderizarServicos();

renderizarPortfolio();

renderizarAudios();

}

/* =========================================================
VALORES
========================================================= */

function definirValor(id, valor) {

const elemento =
document.getElementById(id);

if (!elemento) {
return;
}

elemento.value =
valor ?? "";

}

/* =========================================================
EVENTOS
========================================================= */

function configurarEventos() {

const btnVoltar =
document.getElementById("btn-voltar");

if (btnVoltar) {


btnVoltar.addEventListener(
  "click",
  voltar
);


}

document
.getElementById("btn-salvar")
?.addEventListener(
"click",
salvarPerfil
);

document
.getElementById("btn-salvar-topo")
?.addEventListener(
"click",
salvarPerfil
);

document
.getElementById("btn-salvar-mobile")
?.addEventListener(
"click",
salvarPerfil
);

document
.getElementById("btn-cancelar")
?.addEventListener(
"click",
cancelar
);

document
.getElementById("btn-cancelar-mobile")
?.addEventListener(
"click",
cancelar
);

document
.getElementById("foto-perfil")
?.addEventListener(
"change",
processarFoto
);

document
.getElementById("btn-remover-foto")
?.addEventListener(
"click",
removerFoto
);

document
.getElementById("biografia")
?.addEventListener(
"input",
atualizarContadorBiografia
);

document
.querySelectorAll(".genre-option")
.forEach(botao => {


  botao.addEventListener(
    "click",
    () => {

      botao.classList.toggle(
        "selected"
      );

    }
  );

});


document
.getElementById("btn-adicionar-servico")
?.addEventListener(
"click",
() => abrirModal("service-modal")
);

document
.getElementById("btn-adicionar-portfolio")
?.addEventListener(
"click",
() => abrirModal("portfolio-modal")
);

document
.getElementById("btn-adicionar-audio")
?.addEventListener(
"click",
() => abrirModal("audio-modal")
);

document
.getElementById("btn-confirmar-servico")
?.addEventListener(
"click",
adicionarServico
);

document
.getElementById("btn-confirmar-portfolio")
?.addEventListener(
"click",
adicionarPortfolio
);

document
.getElementById("btn-confirmar-audio")
?.addEventListener(
"click",
adicionarAudio
);

document
.querySelectorAll("[data-close-modal]")
.forEach(botao => {


  botao.addEventListener(
    "click",
    () => {

      fecharModal(
        botao.dataset.closeModal
      );

    }
  );

});


document
.querySelectorAll(".modal-overlay")
.forEach(modal => {


  modal.addEventListener(
    "click",
    evento => {

      if (
        evento.target === modal
      ) {

        fecharModal(
          modal.id
        );

      }

    }
  );

});


window.addEventListener(
"beforeunload",
protegerSaida
);

}

/* =========================================================
FOTO
========================================================= */

function processarFoto(evento) {

const arquivo =
evento.target.files?.[0];

if (!arquivo) {
return;
}

if (!arquivo.type.startsWith("image/")) {


mostrarToast(
  "Arquivo inválido",
  "Selecione uma imagem.",
  true
);

return;


}

if (arquivo.size > 5 * 1024 * 1024) {


mostrarToast(
  "Imagem muito grande",
  "Escolha uma imagem de até 5 MB.",
  true
);

return;


}

const leitor =
new FileReader();

leitor.onload = eventoLeitura => {


fotoPerfil =
  eventoLeitura.target.result;

atualizarAvatar();


};

leitor.readAsDataURL(arquivo);

}

function atualizarAvatar() {

const avatar =
document.getElementById(
"avatar-preview"
);

const imagem =
document.getElementById(
"avatar-image"
);

const iniciais =
document.getElementById(
"avatar-initials"
);

if (!avatar || !imagem || !iniciais) {
return;
}

if (fotoPerfil) {


imagem.src =
  fotoPerfil;

avatar.classList.add(
  "has-image"
);


} else {


imagem.removeAttribute("src");

avatar.classList.remove(
  "has-image"
);

iniciais.textContent =
  gerarIniciais(
    obterValor("nome") ||
    perfilAtual.nome
  );


}

}

function removerFoto() {

fotoPerfil = null;

const input =
document.getElementById(
"foto-perfil"
);

if (input) {
input.value = "";
}

atualizarAvatar();

}

/* =========================================================
GÊNEROS
========================================================= */

function selecionarGeneros(generos) {

document
.querySelectorAll(".genre-option")
.forEach(botao => {


  const genero =
    botao.dataset.genre;

  botao.classList.toggle(
    "selected",
    generos.includes(genero)
  );

});


}

function obterGenerosSelecionados() {

return Array
.from(
document.querySelectorAll(
".genre-option.selected"
)
)
.map(
botao => botao.dataset.genre
);

}

/* =========================================================
BIOGRAFIA
========================================================= */

function atualizarContadorBiografia() {

const textarea =
document.getElementById(
"biografia"
);

const contador =
document.getElementById(
"contador-biografia"
);

if (!textarea || !contador) {
return;
}

contador.textContent =
`${textarea.value.length}/${CONFIG.LIMITE_BIOGRAFIA}`;

}

/* =========================================================
SERVIÇOS
========================================================= */

function renderizarServicos() {

const container =
document.getElementById(
"services-editor"
);

const empty =
document.getElementById(
"services-empty"
);

if (!container || !empty) {
return;
}

container.innerHTML = "";

if (!servicos.length) {


empty.style.display =
  "flex";

return;


}

empty.style.display =
"none";

servicos.forEach(servico => {


const item =
  document.createElement("div");

item.className =
  "editor-item";

item.innerHTML = `

  <div class="editor-item-icon">

    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="1.8">

      <path d="M9 18V5l12-2v13"></path>

      <circle
        cx="6"
        cy="18"
        r="3"></circle>

      <circle
        cx="18"
        cy="16"
        r="3"></circle>

    </svg>

  </div>

  <div class="editor-item-info">

    <strong>
      ${escaparHTML(servico.nome)}
    </strong>

    <span>
      ${escaparHTML(servico.duracao)}
      ${servico.descricao ? " • " + escaparHTML(servico.descricao) : ""}
    </span>

  </div>

  <div class="editor-item-price">
    ${escaparHTML(servico.preco)}
  </div>

  <button
    type="button"
    class="remove-item"
    data-service-id="${escaparHTML(servico.id)}"
    aria-label="Remover serviço">

    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2">

      <path d="M3 6h18"></path>
      <path d="M8 6V4h8v2"></path>
      <path d="M19 6l-1 14H6L5 6"></path>
      <path d="M10 11v5"></path>
      <path d="M14 11v5"></path>

    </svg>

  </button>

`;

container.appendChild(item);


});

container
.querySelectorAll(".remove-item")
.forEach(botao => {


  botao.addEventListener(
    "click",
    () => {

      removerServico(
        botao.dataset.serviceId
      );

    }
  );

});


}

function adicionarServico() {

const nome =
obterValor("service-name").trim();

const duracao =
obterValor("service-duration").trim();

const preco =
obterValor("service-price").trim();

const descricao =
obterValor("service-description").trim();

if (!nome) {


mostrarToast(
  "Informe o serviço",
  "Digite o nome do serviço.",
  true
);

return;


}

servicos.push({


id:
  gerarId("servico"),

nome,

duracao:
  duracao || "Duração não informada",

preco:
  preco || "A combinar",

descricao


});

renderizarServicos();

limparCamposServico();

fecharModal("service-modal");

marcarAlteracoes();

}

function removerServico(id) {

servicos =
servicos.filter(
servico =>
servico.id !== id
);

renderizarServicos();

marcarAlteracoes();

}

/* =========================================================
PORTFÓLIO
========================================================= */

function renderizarPortfolio() {

const container =
document.getElementById(
"portfolio-editor"
);

const empty =
document.getElementById(
"portfolio-empty"
);

if (!container || !empty) {
return;
}

container.innerHTML = "";

if (!portfolio.length) {


empty.style.display =
  "flex";

return;


}

empty.style.display =
"none";

portfolio.forEach(item => {


const elemento =
  document.createElement("div");

elemento.className =
  "editor-item";


const icone =
  item.tipo === "foto"
    ? `
      <svg viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           stroke-width="2">

        <rect x="3" y="3"
              width="18"
              height="18"
              rx="3"></rect>

        <path d="M8 14l2.5-3 2 2 2.5-3 3 4"></path>

      </svg>
    `
    : `
      <svg viewBox="0 0 24 24"
           fill="currentColor">

        <path d="M8 5v14l11-7z"></path>

      </svg>
    `;


elemento.innerHTML = `

  <div class="editor-item-icon">

    ${icone}

  </div>

  <div class="editor-item-info">

    <strong>
      ${escaparHTML(item.titulo)}
    </strong>

    <span>
      ${escaparHTML(
        traduzirTipoPortfolio(item.tipo)
      )}
      ${item.url ? " • Conteúdo vinculado" : ""}
    </span>

  </div>

  <button
    type="button"
    class="remove-item"
    data-portfolio-id="${escaparHTML(item.id)}"
    aria-label="Remover item">

    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2">

      <path d="M6 6l12 12"></path>
      <path d="M18 6L6 18"></path>

    </svg>

  </button>

`;


container.appendChild(
  elemento
);


});

container
.querySelectorAll(".remove-item")
.forEach(botao => {


  botao.addEventListener(
    "click",
    () => {

      portfolio =
        portfolio.filter(
          item =>
            item.id !==
            botao.dataset.portfolioId
        );

      renderizarPortfolio();

      marcarAlteracoes();

    }
  );

});


}

function adicionarPortfolio() {

const titulo =
obterValor("portfolio-title").trim();

const tipo =
obterValor("portfolio-type");

const url =
obterValor("portfolio-url").trim();

if (!titulo) {


mostrarToast(
  "Informe o título",
  "Digite um título para o trabalho.",
  true
);

return;


}

portfolio.push({


id:
  gerarId("portfolio"),

titulo,

tipo,

url


});

renderizarPortfolio();

limparCamposPortfolio();

fecharModal("portfolio-modal");

marcarAlteracoes();

}

/* =========================================================
ÁUDIO
========================================================= */

function renderizarAudios() {

const container =
document.getElementById(
"audio-editor"
);

const empty =
document.getElementById(
"audio-empty"
);

if (!container || !empty) {
return;
}

container.innerHTML = "";

if (!audios.length) {


empty.style.display =
  "flex";

return;


}

empty.style.display =
"none";

audios.forEach(audio => {


const item =
  document.createElement("div");

item.className =
  "editor-item";


item.innerHTML = `

  <div class="editor-item-icon">

    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2">

      <path d="M9 18V5l12-2v13"></path>

      <circle
        cx="6"
        cy="18"
        r="3"></circle>

      <circle
        cx="18"
        cy="16"
        r="3"></circle>

    </svg>

  </div>

  <div class="editor-item-info">

    <strong>
      ${escaparHTML(audio.titulo)}
    </strong>

    <span>
      ${escaparHTML(audio.descricao || "Áudio")}
      ${audio.duracao ? " • " + escaparHTML(audio.duracao) : ""}
    </span>

  </div>

  <button
    type="button"
    class="remove-item"
    data-audio-id="${escaparHTML(audio.id)}"
    aria-label="Remover áudio">

    <svg viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2">

      <path d="M6 6l12 12"></path>
      <path d="M18 6L6 18"></path>

    </svg>

  </button>

`;


container.appendChild(item);


});

container
.querySelectorAll(".remove-item")
.forEach(botao => {


  botao.addEventListener(
    "click",
    () => {

      audios =
        audios.filter(
          audio =>
            audio.id !==
            botao.dataset.audioId
        );

      renderizarAudios();

      marcarAlteracoes();

    }
  );

});


}

function adicionarAudio() {

const titulo =
obterValor("audio-title").trim();

const descricao =
obterValor("audio-description").trim();

const url =
obterValor("audio-url").trim();

if (!titulo) {


mostrarToast(
  "Informe a música",
  "Digite o nome da música.",
  true
);

return;


}

audios.push({


id:
  gerarId("audio"),

titulo,

descricao,

url,

duracao: ""


});

renderizarAudios();

limparCamposAudio();

fecharModal("audio-modal");

marcarAlteracoes();

}

/* =========================================================
MODAIS
========================================================= */

function abrirModal(id) {

const modal =
document.getElementById(id);

if (!modal) {
return;
}

modal.classList.add("open");

document.body.style.overflow =
"hidden";

}

function fecharModal(id) {

const modal =
document.getElementById(id);

if (!modal) {
return;
}

modal.classList.remove("open");

document.body.style.overflow =
"";

}

/* =========================================================
LIMPAR MODAIS
========================================================= */

function limparCamposServico() {

definirValor(
"service-name",
""
);

definirValor(
"service-duration",
""
);

definirValor(
"service-price",
""
);

definirValor(
"service-description",
""
);

}

function limparCamposPortfolio() {

definirValor(
"portfolio-title",
""
);

definirValor(
"portfolio-type",
"video"
);

definirValor(
"portfolio-url",
""
);

}

function limparCamposAudio() {

definirValor(
"audio-title",
""
);

definirValor(
"audio-description",
""
);

definirValor(
"audio-url",
""
);

}

/* =========================================================
SALVAR
========================================================= */

function salvarPerfil() {

const dados =
coletarDadosFormulario();

if (!dados.nome) {


mostrarToast(
  "Nome obrigatório",
  "Informe seu nome artístico.",
  true
);

document
  .getElementById("nome")
  ?.focus();

return;


}

if (!dados.categoria) {


mostrarToast(
  "Categoria obrigatória",
  "Selecione sua categoria principal.",
  true
);

document
  .getElementById("categoria")
  ?.focus();

return;


}

perfilAtual = {


...perfilAtual,

...dados,

servicos: [...servicos],

portfolio: [...portfolio],

audios: [...audios],

avatarUrl:
  fotoPerfil || null,

atualizadoEm:
  new Date().toISOString()


};

try {


localStorage.setItem(
  CONFIG.STORAGE_KEY,
  JSON.stringify(perfilAtual)
);


} catch (erro) {


console.error(
  "Erro ao salvar perfil:",
  erro
);

mostrarToast(
  "Erro ao salvar",
  "Não foi possível salvar as alterações.",
  true
);

return;


}

/*
FUTURO SUPABASE


Quando o banco estiver conectado,
esta etapa poderá substituir ou complementar
o armazenamento local.

await salvarPerfilSupabase(perfilAtual);


*/

window.removeEventListener(
"beforeunload",
protegerSaida
);

mostrarToast(
"Perfil atualizado",
"Suas alterações foram salvas."
);

setTimeout(() => {


const paginaAnterior =
  document.referrer;

if (
  paginaAnterior &&
  paginaAnterior.includes(
    "perfil-artista"
  )
) {

  window.location.href =
    paginaAnterior;

} else {

  window.history.back();

}


}, 900);

}

/* =========================================================
COLETAR DADOS
========================================================= */

function coletarDadosFormulario() {

const visibilidade =
document.querySelector(
'input[name="visibilidade"]:checked'
);

return {


nome:
  obterValor("nome").trim(),

categoria:
  obterValor("categoria"),

descricaoProfissional:
  obterValor(
    "nome-profissional"
  ).trim(),

generos:
  obterGenerosSelecionados(),

cidade:
  obterValor("cidade").trim(),

estado:
  obterValor("estado"),

areaAtendimento:
  obterValor(
    "area-atendimento"
  ).trim(),

biografia:
  obterValor("biografia").trim(),

experiencia:
  obterValor("experiencia"),

tempoAtuacao:
  obterValor(
    "tempo-atuacao"
  ).trim(),

receberSolicitacoes:
  document.getElementById(
    "receber-solicitacoes"
  )?.checked !== false,

horarioAtendimento:
  obterValor(
    "horario-atendimento"
  ).trim(),

instagram:
  obterValor("instagram").trim(),

youtube:
  obterValor("youtube").trim(),

spotify:
  obterValor("spotify").trim(),

site:
  obterValor("site").trim(),

visibilidade:
  visibilidade
    ? visibilidade.value
    : "publico"


};

}

/* =========================================================
FUTURO SUPABASE
========================================================= */

async function salvarPerfilSupabase(dados) {

if (!CONFIG.usarSupabase) {
return null;
}

/*
Futuramente:


const usuario =
  await obterUsuarioLogado();

const { data, error } =
  await supabaseClient
    .from(CONFIG.tabelaPerfis)
    .upsert({
      id: usuario.id,
      nome: dados.nome,
      categoria: dados.categoria,
      ...
    });

if (error) {
  throw error;
}

return data;


*/

}

/* =========================================================
CANCELAR
========================================================= */

function cancelar() {

const confirmou =
confirm(
"Deseja sair sem salvar as alterações?"
);

if (!confirmou) {
return;
}

window.removeEventListener(
"beforeunload",
protegerSaida
);

voltar();

}

function voltar() {

if (window.history.length > 1) {


window.history.back();


} else {


window.location.href =
  "index.html";


}

}

/* =========================================================
PROTEÇÃO CONTRA SAÍDA
========================================================= */

let formularioAlterado = false;

function marcarAlteracoes() {

formularioAlterado = true;

}

function protegerSaida(evento) {

if (!formularioAlterado) {
return;
}

evento.preventDefault();

evento.returnValue = "";

}

/* =========================================================
TOAST
========================================================= */

let toastTimeout = null;

function mostrarToast(
titulo,
mensagem,
erro = false
) {

const toast =
document.getElementById(
"toast"
);

const tituloElemento =
document.getElementById(
"toast-title"
);

const mensagemElemento =
document.getElementById(
"toast-message"
);

if (
!toast ||
!tituloElemento ||
!mensagemElemento
) {


return;


}

tituloElemento.textContent =
titulo;

mensagemElemento.textContent =
mensagem;

const icon =
toast.querySelector(
".toast-icon"
);

if (icon) {


icon.style.background =
  erro
    ? "#fef2f2"
    : "#ecfdf5";

icon.style.color =
  erro
    ? "#dc2626"
    : "#059669";


}

toast.classList.add("show");

clearTimeout(
toastTimeout
);

toastTimeout =
setTimeout(() => {


  toast.classList.remove(
    "show"
  );

}, 3500);


}

/* =========================================================
UTILITÁRIOS
========================================================= */

function obterValor(id) {

const elemento =
document.getElementById(id);

return elemento
? elemento.value
: "";

}

function gerarId(prefixo) {

return `${prefixo}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

}

function gerarIniciais(nome) {

if (!nome) {
return "MW";
}

const partes =
nome
.trim()
.split(/\s+/)
.filter(Boolean);

if (partes.length === 1) {


return partes[0]
  .slice(0, 2)
  .toUpperCase();


}

return (
partes[0][0] +
partes[partes.length - 1][0]
).toUpperCase();

}

function traduzirTipoPortfolio(tipo) {

const tipos = {


video: "Vídeo",

foto: "Foto",

apresentacao:
  "Apresentação"


};

return tipos[tipo] || "Trabalho";

}

function escaparHTML(valor) {

return String(
valor ?? ""
)
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");

}

/* =========================================================
EXPORTAÇÃO PARA FUTURAS PÁGINAS
========================================================= */

window.MusicalWorldEditarPerfil = {

carregarPerfil,

coletarDadosFormulario,

salvarPerfil,

renderizarPerfil

};
