/* =========================================================
MUSICALWORLD — FUNÇÕES PRINCIPAIS DA PÁGINA INICIAL
========================================================= */

/* =========================================================
CONTROLE DE ABAS DE CATEGORIAS
========================================================= */

function mudarCategoria(categoriaId, elementoBtn) {

const abas =
document.querySelectorAll('.cat-tab');

abas.forEach(tab => {


tab.classList.remove('ativo');


});

if (elementoBtn) {


elementoBtn.classList.add('ativo');


}

const conteudos =
document.querySelectorAll('.cat-content');

conteudos.forEach(content => {


content.classList.remove('ativo');


});

const conteudoAtivo =
document.getElementById(
`cat-${categoriaId}`
);

if (conteudoAtivo) {


conteudoAtivo.classList.add('ativo');


}

}

/* =========================================================
COMPATIBILIDADE COM O BOTÃO DE FILTRO DO INDEX
========================================================= */

/*
O botão do index.html ainda utiliza:

onclick="abrirModalFiltro()"

O funcionamento real do modal está em:

js/components/modal-filtro.js

Esta função apenas encaminha a chamada
para o componente.
*/

window.abrirModalFiltro = function () {

if (
window.ModalFiltro &&
typeof window.ModalFiltro.abrir === 'function'
) {


window.ModalFiltro.abrir();

return;


}

console.warn(
'⚠️ ModalFiltro ainda não foi carregado.'
);

};
