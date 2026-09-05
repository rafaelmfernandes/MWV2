/* =========================================================
MUSICALWORLD — MODAL DE FILTRO
========================================================= */

window.ModalFiltro = {

inicializado: false,
modalCriado: false,
animacaoEmAndamento: false,

/* =======================================================
INICIALIZAÇÃO
======================================================= */

iniciar() {


if (this.inicializado) {
  return;
}

this.criarModal();

this.configurarEventos();

this.inicializado = true;

console.log(
  '🔎 Modal Filtro inicializado corretamente'
);


},

/* =======================================================
CRIAR MODAL
======================================================= */

criarModal() {


if (
  document.getElementById('modal-filtro')
) {

  this.modalCriado = true;

  return;

}


const container =
  document.getElementById(
    'modal-filtro-container'
  );


if (!container) {

  console.warn(
    '⚠️ Container #modal-filtro-container não encontrado.'
  );

  return;

}


container.innerHTML = `

  <div
    id="modal-filtro"
    class="modal-overlay modal-filtro-overlay"
    aria-hidden="true"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-filtro-titulo"
  >

    <div
      class="modal-sheet modal-filtro-sheet"
      role="document"
    >

      <div class="modal-handle"></div>


      <!-- CABEÇALHO -->

      <div class="modal-header">

        <div>

          <h2 id="modal-filtro-titulo">
            Filtrar Anúncios
          </h2>

          <p>
            Encontre exatamente o que você procura
          </p>

        </div>


        <button
          type="button"
          class="modal-close-btn"
          id="modal-filtro-fechar"
          aria-label="Fechar filtros"
        >

          <i data-lucide="x"></i>

        </button>

      </div>


      <!-- CONTEÚDO -->

      <div class="modal-filter-content">


        <!-- ESTADO -->

        <div class="filter-group">

          <label for="filtro-estado">
            Estado
          </label>

          <select id="filtro-estado">

            <option value="GO" selected>
              Goiás
            </option>

            <option value="SP">
              São Paulo
            </option>

            <option value="MG">
              Minas Gerais
            </option>

            <option value="DF">
              Distrito Federal
            </option>

            <option value="BA">
              Bahia
            </option>

          </select>

        </div>


        <!-- CIDADE -->

        <div class="filter-group">

          <label for="filtro-cidade">
            Cidade
          </label>

          <select id="filtro-cidade">

            <option value="goiania" selected>
              Goiânia
            </option>

            <option value="aparecida">
              Aparecida de Goiânia
            </option>

            <option value="anapolis">
              Anápolis
            </option>

            <option value="trindade">
              Trindade
            </option>

          </select>

        </div>


        <!-- CATEGORIA -->

        <div class="filter-group">

          <label for="filtro-categoria">
            Categoria
          </label>

          <select id="filtro-categoria">

            <option value="">
              Todas as categorias
            </option>

            <option value="cantores">
              Cantores
            </option>

            <option value="musicos">
              Músicos / Instrumentistas
            </option>

            <option value="composicoes">
              Composições Inéditas
            </option>

            <option value="eventos">
              Shows / Eventos
            </option>

          </select>

        </div>


        <!-- INSTRUMENTO -->

        <div
          class="filter-group"
          id="wrapper-instrumento"
          style="display: none;"
        >

          <label for="filtro-instrumento">
            Instrumento
          </label>

          <select id="filtro-instrumento">

            <option value="">
              Todos os instrumentos
            </option>

            <option value="violao">
              Violão
            </option>

            <option value="guitarra">
              Guitarra
            </option>

            <option value="baixo">
              Baixo
            </option>

            <option value="teclado">
              Teclado
            </option>

            <option value="bateria">
              Bateria
            </option>

            <option value="saxofone">
              Saxofone
            </option>

            <option value="outros">
              Outros
            </option>

          </select>

        </div>


        <!-- ESTILO MUSICAL -->

        <div class="filter-group">

          <label for="filtro-estilo">
            Estilo musical
          </label>

          <select id="filtro-estilo">

            <option value="">
              Todos os estilos
            </option>

            <option value="sertanejo">
              Sertanejo
            </option>

            <option value="pagode">
              Pagode
            </option>

            <option value="rock">
              Rock
            </option>

            <option value="pop">
              Pop
            </option>

            <option value="mpb">
              MPB
            </option>

            <option value="gospel">
              Gospel
            </option>

            <option value="forro">
              Forró
            </option>

            <option value="eletronica">
              Eletrônica
            </option>

          </select>

        </div>


        <!-- FAIXA DE VALOR -->

        <div class="filter-group">

          <label>
            Faixa de valor
          </label>


          <div class="filter-price-row">

            <input
              type="number"
              id="filtro-valor-min"
              placeholder="Valor mínimo"
              min="0"
            >


            <span>
              até
            </span>


            <input
              type="number"
              id="filtro-valor-max"
              placeholder="Valor máximo"
              min="0"
            >

          </div>

        </div>


      </div>


      <!-- BOTÕES -->

      <div class="modal-filter-actions">

        <button
          type="button"
          class="btn-filter-clear"
          id="modal-filtro-limpar"
        >
          Limpar
        </button>


        <button
          type="button"
          class="btn-filter-apply"
          id="modal-filtro-aplicar"
        >
          Aplicar filtros
        </button>

      </div>

    </div>

  </div>

`;


this.modalCriado = true;


/* Cria os ícones Lucide */

if (
  window.lucide &&
  typeof window.lucide.createIcons === 'function'
) {

  window.lucide.createIcons();

}


},

/* =======================================================
CONFIGURAR EVENTOS
======================================================= */

configurarEventos() {


const modal =
  document.getElementById(
    'modal-filtro'
  );


if (!modal) {
  return;
}


const sheet =
  modal.querySelector(
    '.modal-filtro-sheet'
  );


const fechar =
  document.getElementById(
    'modal-filtro-fechar'
  );


const categoria =
  document.getElementById(
    'filtro-categoria'
  );


const limpar =
  document.getElementById(
    'modal-filtro-limpar'
  );


const aplicar =
  document.getElementById(
    'modal-filtro-aplicar'
  );


/* =====================================================
   CLIQUE FORA
===================================================== */

modal.addEventListener(
  'click',
  (event) => {

    if (
      event.target === modal
    ) {

      this.fechar();

    }

  }
);


/* =====================================================
   CLIQUE DENTRO
===================================================== */

if (sheet) {

  sheet.addEventListener(
    'click',
    (event) => {

      event.stopPropagation();

    }
  );

}


/* =====================================================
   BOTÃO FECHAR
===================================================== */

if (fechar) {

  fechar.addEventListener(
    'click',
    () => {

      this.fechar();

    }
  );

}


/* =====================================================
   CATEGORIA
===================================================== */

if (categoria) {

  categoria.addEventListener(
    'change',
    () => {

      this.tratarMudancaCategoria();

    }
  );

}


/* =====================================================
   LIMPAR
===================================================== */

if (limpar) {

  limpar.addEventListener(
    'click',
    () => {

      this.limpar();

    }
  );

}


/* =====================================================
   APLICAR
===================================================== */

if (aplicar) {

  aplicar.addEventListener(
    'click',
    () => {

      this.aplicar();

    }
  );

}


},

/* =======================================================
ABRIR
======================================================= */

abrir() {


const modal =
  document.getElementById(
    'modal-filtro'
  );


if (!modal) {

  console.warn(
    '⚠️ ModalFiltro ainda não foi criado.'
  );

  return;

}


if (
  this.animacaoEmAndamento
) {

  return;

}


this.animacaoEmAndamento = true;


/*
  Remove qualquer estado
  anterior de fechamento.
*/

modal.classList.remove(
  'fechando'
);


/*
  Torna o modal acessível.
*/

modal.setAttribute(
  'aria-hidden',
  'false'
);


/*
  Bloqueia o scroll da página.
*/

document.body.classList.add(
  'modal-filtro-aberto'
);


/*
  Força o navegador a registrar
  o estado inicial do painel.
*/

void modal.offsetHeight;


/*
  Inicia a animação.
*/

requestAnimationFrame(
  () => {

    modal.classList.add(
      'ativo'
    );

  }
);


/*
  Libera novas ações depois
  do tempo da animação.
*/

setTimeout(
  () => {

    this.animacaoEmAndamento = false;

  },
  400
);


},

/* =======================================================
FECHAR
======================================================= */

fechar() {


const modal =
  document.getElementById(
    'modal-filtro'
  );


if (!modal) {
  return;
}


if (
  this.animacaoEmAndamento
) {

  return;

}


this.animacaoEmAndamento = true;


/*
  IMPORTANTE:

  Retira o foco do elemento que estiver
  dentro do modal antes de colocar
  aria-hidden="true".

  Isso evita o aviso do navegador
  relacionado ao foco dentro de
  elementos aria-hidden.
*/

const elementoFocado =
  document.activeElement;


if (
  elementoFocado &&
  modal.contains(elementoFocado) &&
  typeof elementoFocado.blur === 'function'
) {

  elementoFocado.blur();

}


/*
  Inicia o fechamento.

  O CSS fará o painel deslizar
  de cima para baixo.
*/

modal.classList.remove(
  'ativo'
);


modal.classList.add(
  'fechando'
);


/*
  Agora podemos esconder o modal
  da tecnologia assistiva.
*/

modal.setAttribute(
  'aria-hidden',
  'true'
);


/*
  Mantém o modal no DOM durante
  toda a animação.
*/

setTimeout(
  () => {

    modal.classList.remove(
      'fechando'
    );


    document.body.classList.remove(
      'modal-filtro-aberto'
    );


    this.animacaoEmAndamento = false;

  },
  400
);


},

/* =======================================================
FECHAR CLICANDO FORA
======================================================= */

fecharFora(event) {


const modal =
  document.getElementById(
    'modal-filtro'
  );


if (
  modal &&
  event.target === modal
) {

  this.fechar();

}


},

/* =======================================================
MUDAR CATEGORIA
======================================================= */

tratarMudancaCategoria() {


const categoria =
  document.getElementById(
    'filtro-categoria'
  );


const wrapper =
  document.getElementById(
    'wrapper-instrumento'
  );


if (
  !categoria ||
  !wrapper
) {

  return;

}


if (
  categoria.value === 'musicos'
) {

  wrapper.style.display = 'flex';

} else {

  wrapper.style.display = 'none';

}


},

/* =======================================================
LIMPAR FILTROS
======================================================= */

limpar() {


const estado =
  document.getElementById(
    'filtro-estado'
  );


const cidade =
  document.getElementById(
    'filtro-cidade'
  );


const categoria =
  document.getElementById(
    'filtro-categoria'
  );


const instrumento =
  document.getElementById(
    'filtro-instrumento'
  );


const estilo =
  document.getElementById(
    'filtro-estilo'
  );


const valorMin =
  document.getElementById(
    'filtro-valor-min'
  );


const valorMax =
  document.getElementById(
    'filtro-valor-max'
  );


const wrapper =
  document.getElementById(
    'wrapper-instrumento'
  );


if (estado) {

  estado.value = 'GO';

}


if (cidade) {

  cidade.value = 'goiania';

}


if (categoria) {

  categoria.value = '';

}


if (instrumento) {

  instrumento.value = '';

}


if (estilo) {

  estilo.value = '';

}


if (valorMin) {

  valorMin.value = '';

}


if (valorMax) {

  valorMax.value = '';

}


if (wrapper) {

  wrapper.style.display = 'none';

}


},

/* =======================================================
APLICAR FILTROS
======================================================= */

aplicar() {


const filtros = {

  estado:
    document.getElementById(
      'filtro-estado'
    )?.value || '',


  cidade:
    document.getElementById(
      'filtro-cidade'
    )?.value || '',


  categoria:
    document.getElementById(
      'filtro-categoria'
    )?.value || '',


  instrumento:
    document.getElementById(
      'filtro-instrumento'
    )?.value || '',


  estilo:
    document.getElementById(
      'filtro-estilo'
    )?.value || '',


  valorMin:
    document.getElementById(
      'filtro-valor-min'
    )?.value || '',


  valorMax:
    document.getElementById(
      'filtro-valor-max'
    )?.value || ''

};


console.log(
  '🔎 Filtros aplicados:',
  filtros
);


/*
  FUTURO:

  Aqui vamos conectar os filtros
  diretamente às consultas do Supabase.
*/

alert(
  'Filtros aplicados com sucesso!'
);


this.fechar();


}

};

/* =========================================================
FUNÇÕES GLOBAIS DE COMPATIBILIDADE
========================================================= */

/*
O botão do index.html utiliza:

onclick="abrirModalFiltro()"

Por isso mantemos esta função global.

O funcionamento real continua
dentro de ModalFiltro.
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

window.fecharModalFiltro = function () {

if (
window.ModalFiltro &&
typeof window.ModalFiltro.fechar === 'function'
) {


window.ModalFiltro.fechar();


}

};

window.fecharModalFiltroFora = function (
event
) {

if (
window.ModalFiltro &&
typeof window.ModalFiltro.fecharFora === 'function'
) {


window.ModalFiltro.fecharFora(
  event
);


}

};

window.tratarMudancaCategoriaFiltro = function () {

if (
window.ModalFiltro &&
typeof window.ModalFiltro.tratarMudancaCategoria === 'function'
) {


window.ModalFiltro.tratarMudancaCategoria();


}

};

window.limparFiltros = function () {

if (
window.ModalFiltro &&
typeof window.ModalFiltro.limpar === 'function'
) {


window.ModalFiltro.limpar();


}

};

window.aplicarFiltros = function () {

if (
window.ModalFiltro &&
typeof window.ModalFiltro.aplicar === 'function'
) {


window.ModalFiltro.aplicar();


}

};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

if (
document.readyState === 'loading'
) {

document.addEventListener(
'DOMContentLoaded',
() => {


  ModalFiltro.iniciar();

}


);

} else {

ModalFiltro.iniciar();

}
