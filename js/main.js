/* =========================================================
CONTROLE DE ABAS SUPERIORES — CONTEÚDO
========================================================= */

function mudarCategoria(categoriaId, elementoBtn) {
const abas = document.querySelectorAll('.cat-tab');

abas.forEach(tab => {
tab.classList.remove('ativo');
});

if (elementoBtn) {
elementoBtn.classList.add('ativo');
}

const conteudos = document.querySelectorAll('.cat-content');

conteudos.forEach(content => {
content.classList.remove('ativo');
});

const conteudoAtivo = document.getElementById(`cat-${categoriaId}`);

if (conteudoAtivo) {
conteudoAtivo.classList.add('ativo');
}
}

/* =========================================================
MODAL — FILTROS
========================================================= */

function abrirModalFiltro() {
const modal = document.getElementById('modal-filtro');

if (!modal) {
console.warn('⚠️ Modal de filtros não encontrado.');
return;
}

modal.classList.add('ativo');
}

function fecharModalFiltro() {
const modal = document.getElementById('modal-filtro');

if (!modal) {
return;
}

modal.classList.remove('ativo');
}

function fecharModalFiltroFora(event) {
const modal = document.getElementById('modal-filtro');

if (!modal) {
return;
}

if (event.target === modal) {
fecharModalFiltro();
}
}

/* =========================================================
FILTROS — CONTROLE DE INSTRUMENTOS
========================================================= */

function tratarMudancaCategoriaFiltro() {
const categoriaSelect =
document.getElementById('filtro-categoria');

const wrapperInstrumento =
document.getElementById('wrapper-instrumento');

const instrumentoSelect =
document.getElementById('filtro-instrumento');

if (!categoriaSelect || !wrapperInstrumento) {
return;
}

if (categoriaSelect.value === 'musicos') {
wrapperInstrumento.style.display = 'flex';
} else {
wrapperInstrumento.style.display = 'none';

if (instrumentoSelect) {
instrumentoSelect.value = '';
}

}
}

/* =========================================================
FILTROS — LIMPAR
========================================================= */

function limparFiltros() {
const campos = [
'filtro-estado',
'filtro-cidade',
'filtro-categoria',
'filtro-instrumento',
'filtro-estilo',
'filtro-valor-min',
'filtro-valor-max'
];

campos.forEach(id => {
const campo = document.getElementById(id);

if (campo) {
campo.value = '';
}

});

tratarMudancaCategoriaFiltro();
}

/* =========================================================
FILTROS — APLICAR
========================================================= */

function aplicarFiltros() {
const estado =
document.getElementById('filtro-estado')?.value || '';

const cidade =
document.getElementById('filtro-cidade')?.value || '';

const categoria =
document.getElementById('filtro-categoria')?.value || '';

const instrumento =
document.getElementById('filtro-instrumento')?.value || '';

const estilo =
document.getElementById('filtro-estilo')?.value || '';

const vMin =
document.getElementById('filtro-valor-min')?.value || '';

const vMax =
document.getElementById('filtro-valor-max')?.value || '';

console.log('🔎 Filtros aplicados:', {
estado,
cidade,
categoria,
instrumento,
estilo,
vMin,
vMax
});

fecharModalFiltro();

alert(
'Filtros aplicados com sucesso! Atualizando resultados...'
);
}

/* =========================================================
PAINEL DE PESQUISA
========================================================= */

let cardsPesquisaveis = null;

/*

* Abre o painel de pesquisa.
*
* A ativação do botão do menu inferior agora pertence
* ao componente menu-inferior.js.
  */

function abrirPesquisa() {
const painel =
document.getElementById('painel-pesquisa');

const campo =
document.getElementById('campo-pesquisa');

if (!painel || !campo) {
console.warn(
'⚠️ Elementos do painel de pesquisa não encontrados.'
);

return;
}

painel.classList.add('ativo');

campo.value = '';

filtrarPesquisa('');

setTimeout(() => {
campo.focus();
}, 300);
}

/*

* Fecha o painel de pesquisa.
*
* O controle visual do menu inferior pertence
* ao menu-inferior.js.
  */

function fecharPesquisa() {
const painel =
document.getElementById('painel-pesquisa');

if (!painel) {
return;
}

painel.classList.remove('ativo');
}

/* =========================================================
PESQUISA — COLETAR CARDS
========================================================= */

function coletarCardsPesquisaveis() {
const cards =
document.querySelectorAll(
'.cat-content .ad-card-novo'
);

const lista = [];

cards.forEach(card => {
const linkPai =
card.closest('a');

const nome =
card.querySelector('.ad-user-info h4');

const estilo =
card.querySelector('.ad-estilo');

const tituloDesc =
card.querySelector(
'.ad-descricao strong'
);

const textoDesc =
card.querySelector(
'.ad-descricao p'
);

const textoBusca = [
nome?.textContent || '',
estilo?.textContent || '',
tituloDesc?.textContent || '',
textoDesc?.textContent || ''
]
.join(' ')
.toLowerCase();

lista.push({
href: linkPai
? linkPai.getAttribute('href')
: '#',

html: card.outerHTML,

textoBusca
});

});

return lista;
}

/* =========================================================
PESQUISA — FILTRAR
========================================================= */

function filtrarPesquisa(termo) {
if (!cardsPesquisaveis) {
cardsPesquisaveis =
coletarCardsPesquisaveis();
}

const container =
document.getElementById(
'resultados-pesquisa'
);

if (!container) {
return;
}

const termoLimpo =
String(termo || '')
.trim()
.toLowerCase();

if (termoLimpo === '') {
container.innerHTML =
'<p class="search-estado-vazio">Digite algo para buscar em todas as categorias.</p>';

return;
}

const encontrados =
cardsPesquisaveis.filter(item =>
item.textoBusca.includes(
termoLimpo
)
);

if (encontrados.length === 0) {
container.innerHTML =
`<p class="search-estado-vazio">Nenhum resultado para "${termo}".</p>`;

return;
}

container.innerHTML =
encontrados
.map(item => `         <a
          href="${item.href}"
          style="text-decoration:none;color:inherit;display:block;"         >
          ${item.html}         </a>
      `)
.join('');
}

/* =========================================================
TECLA ESC — FECHAR PESQUISA
========================================================= */

document.addEventListener(
'keydown',
evento => {
if (evento.key !== 'Escape') {
return;
}

const painel =
document.getElementById(
'painel-pesquisa'
);

if (
painel &&
painel.classList.contains('ativo')
) {
fecharPesquisa();
}

}
);
