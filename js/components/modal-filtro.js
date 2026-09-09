/* =========================================================
MUSICALWORLD — MODAL DE FILTRO
========================================================= */

window.ModalFiltro = {


inicializado: false,
modalCriado: false,
animacaoEmAndamento: false,
carregandoCidades: false,


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

iniciar() {

    if (this.inicializado) {
        return;
    }

    this.criarModal();
    this.configurarEventos();
    this.inicializarEstados();

    this.inicializado = true;

    console.log(
        "🔎 Modal Filtro inicializado corretamente"
    );

},


/* =====================================================
   CRIAR MODAL
===================================================== */

criarModal() {

    if (
        document.getElementById("modal-filtro")
    ) {

        this.modalCriado = true;

        return;

    }

    const container =
        document.getElementById(
            "modal-filtro-container"
        );

    if (!container) {

        console.warn(
            "⚠️ Container #modal-filtro-container não encontrado."
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


                <div class="modal-filter-content">


                    <!-- ESTADO -->

                    <div class="filter-group">

                        <label for="filtro-estado">
                            Estado
                        </label>

                        <select id="filtro-estado">

                            <option value="">
                                Todos os estados
                            </option>

                        </select>

                    </div>


                    <!-- CIDADE -->

                    <div class="filter-group">

                        <label for="filtro-cidade">
                            Cidade
                        </label>

                        <select
                            id="filtro-cidade"
                            disabled
                        >

                            <option value="">
                                Selecione um estado primeiro
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
                                Cantores / Duplas
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

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }

},


/* =====================================================
   INICIALIZAR ESTADOS
===================================================== */

inicializarEstados() {

    const selectEstado =
        document.getElementById(
            "filtro-estado"
        );

    if (!selectEstado) {
        return;
    }

    if (
        !window.MunicipiosBrasil ||
        typeof window.MunicipiosBrasil.obterEstados !== "function"
    ) {

        console.error(
            "❌ MunicipiosBrasil não foi carregado."
        );

        return;

    }

    const estados =
        window.MunicipiosBrasil.obterEstados();

    selectEstado.innerHTML = `

        <option value="">
            Todos os estados
        </option>

    `;

    estados.forEach(
        estado => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                estado.sigla;

            option.textContent =
                estado.nome;

            selectEstado.appendChild(
                option
            );

        }
    );

},


/* =====================================================
   CONFIGURAR EVENTOS
===================================================== */

configurarEventos() {

    const modal =
        document.getElementById(
            "modal-filtro"
        );

    if (!modal) {
        return;
    }

    const sheet =
        modal.querySelector(
            ".modal-filtro-sheet"
        );

    const fechar =
        document.getElementById(
            "modal-filtro-fechar"
        );

    const estado =
        document.getElementById(
            "filtro-estado"
        );

    const categoria =
        document.getElementById(
            "filtro-categoria"
        );

    const limpar =
        document.getElementById(
            "modal-filtro-limpar"
        );

    const aplicar =
        document.getElementById(
            "modal-filtro-aplicar"
        );


    if (
        modal.dataset.eventosConfigurados === "true"
    ) {

        return;

    }

    modal.dataset.eventosConfigurados = "true";


    /* =================================================
       CLIQUE FORA
    ================================================= */

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                this.fechar();

            }

        }
    );


    /* =================================================
       CLIQUE DENTRO
    ================================================= */

    if (sheet) {

        sheet.addEventListener(
            "click",
            event => {

                event.stopPropagation();

            }
        );

    }


    /* =================================================
       FECHAR
    ================================================= */

    if (fechar) {

        fechar.addEventListener(
            "click",
            () => {

                this.fechar();

            }
        );

    }


    /* =================================================
       ESTADO
    ================================================= */

    if (estado) {

        estado.addEventListener(
            "change",
            () => {

                this.tratarMudancaEstado();

            }
        );

    }


    /* =================================================
       CATEGORIA
    ================================================= */

    if (categoria) {

        categoria.addEventListener(
            "change",
            () => {

                this.tratarMudancaCategoria();

            }
        );

    }


    /* =================================================
       LIMPAR
    ================================================= */

    if (limpar) {

        limpar.addEventListener(
            "click",
            () => {

                this.limpar();

            }
        );

    }


    /* =================================================
       APLICAR
    ================================================= */

    if (aplicar) {

        aplicar.addEventListener(
            "click",
            () => {

                this.aplicar();

            }
        );

    }

},


/* =====================================================
   MUDANÇA DE ESTADO
===================================================== */

async tratarMudancaEstado() {

    const estado =
        document.getElementById(
            "filtro-estado"
        );

    const cidade =
        document.getElementById(
            "filtro-cidade"
        );

    if (!estado || !cidade) {
        return;
    }

    const sigla =
        estado.value;

    cidade.innerHTML = "";

    cidade.value = "";

    if (!sigla) {

        cidade.disabled = true;

        cidade.innerHTML = `

            <option value="">
                Selecione um estado primeiro
            </option>

        `;

        return;

    }

    cidade.disabled = true;

    cidade.innerHTML = `

        <option value="">
            Carregando cidades...
        </option>

    `;

    this.carregandoCidades = true;

    try {

        const municipios =
            await window.MunicipiosBrasil.carregarMunicipios(
                sigla
            );

        cidade.innerHTML = "";

        const primeiraOpcao =
            document.createElement(
                "option"
            );

        primeiraOpcao.value = "";

        primeiraOpcao.textContent =
            "Todas as cidades";

        cidade.appendChild(
            primeiraOpcao
        );


        municipios.forEach(
            municipio => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    municipio.valor;

                option.textContent =
                    municipio.nome;

                cidade.appendChild(
                    option
                );

            }
        );

        cidade.disabled =
            municipios.length === 0;

        if (
            municipios.length === 0
        ) {

            cidade.innerHTML = `

                <option value="">
                    Nenhuma cidade encontrada
                </option>

            `;

        }

        console.log(
            `📍 ${municipios.length} cidades carregadas para ${sigla}.`
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar cidades:",
            erro
        );

        cidade.innerHTML = `

            <option value="">
                Não foi possível carregar as cidades
            </option>

        `;

        cidade.disabled = true;

    } finally {

        this.carregandoCidades = false;

    }

},


/* =====================================================
   ABRIR
===================================================== */

abrir() {

    if (!this.modalCriado) {

        this.criarModal();
        this.configurarEventos();
        this.inicializarEstados();

    }

    const modal =
        document.getElementById(
            "modal-filtro"
        );

    if (!modal) {

        console.warn(
            "⚠️ ModalFiltro não foi criado."
        );

        return;

    }

    if (this.animacaoEmAndamento) {
        return;
    }

    this.animacaoEmAndamento = true;

    modal.classList.remove(
        "fechando"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-filtro-aberto"
    );

    void modal.offsetHeight;

    requestAnimationFrame(
        () => {

            modal.classList.add(
                "ativo"
            );

        }
    );

    setTimeout(
        () => {

            this.animacaoEmAndamento = false;

        },
        400
    );

},


/* =====================================================
   FECHAR
===================================================== */

fechar() {

    const modal =
        document.getElementById(
            "modal-filtro"
        );

    if (!modal) {
        return;
    }

    if (this.animacaoEmAndamento) {
        return;
    }

    this.animacaoEmAndamento = true;

    const elementoFocado =
        document.activeElement;

    if (
        elementoFocado &&
        modal.contains(elementoFocado) &&
        typeof elementoFocado.blur === "function"
    ) {

        elementoFocado.blur();

    }

    modal.classList.remove(
        "ativo"
    );

    modal.classList.add(
        "fechando"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    setTimeout(
        () => {

            modal.classList.remove(
                "fechando"
            );

            document.body.classList.remove(
                "modal-filtro-aberto"
            );

            this.animacaoEmAndamento = false;

        },
        400
    );

},


/* =====================================================
   FECHAR FORA
===================================================== */

fecharFora(event) {

    const modal =
        document.getElementById(
            "modal-filtro"
        );

    if (
        modal &&
        event.target === modal
    ) {

        this.fechar();

    }

},


/* =====================================================
   MUDANÇA DE CATEGORIA
===================================================== */

tratarMudancaCategoria() {

    const categoria =
        document.getElementById(
            "filtro-categoria"
        );

    const wrapper =
        document.getElementById(
            "wrapper-instrumento"
        );

    if (!categoria || !wrapper) {
        return;
    }

    const mostrar =
        categoria.value === "musicos";

    wrapper.style.display =
        mostrar
            ? "flex"
            : "none";

    if (!mostrar) {

        const instrumento =
            document.getElementById(
                "filtro-instrumento"
            );

        if (instrumento) {
            instrumento.value = "";
        }

    }

},


/* =====================================================
   OBTER FILTROS
===================================================== */

obterFiltros() {

    const valorMinElemento =
        document.getElementById(
            "filtro-valor-min"
        );

    const valorMaxElemento =
        document.getElementById(
            "filtro-valor-max"
        );

    const valorMin =
        valorMinElemento?.value !== ""
            ? Number(valorMinElemento.value)
            : null;

    const valorMax =
        valorMaxElemento?.value !== ""
            ? Number(valorMaxElemento.value)
            : null;


    return {

        estado:
            document.getElementById(
                "filtro-estado"
            )?.value || "",

        cidade:
            document.getElementById(
                "filtro-cidade"
            )?.value || "",

        categoria:
            document.getElementById(
                "filtro-categoria"
            )?.value || "",

        instrumento:
            document.getElementById(
                "filtro-instrumento"
            )?.value || "",

        estilo:
            document.getElementById(
                "filtro-estilo"
            )?.value || "",

        valorMin:
            Number.isFinite(valorMin)
                ? valorMin
                : null,

        valorMax:
            Number.isFinite(valorMax)
                ? valorMax
                : null

    };

},


/* =====================================================
   VALIDAR FILTROS
===================================================== */

validarFiltros(filtros) {

    if (
        filtros.valorMin !== null &&
        filtros.valorMin < 0
    ) {

        filtros.valorMin = 0;

    }

    if (
        filtros.valorMax !== null &&
        filtros.valorMax < 0
    ) {

        filtros.valorMax = 0;

    }

    if (
        filtros.valorMin !== null &&
        filtros.valorMax !== null &&
        filtros.valorMin > filtros.valorMax
    ) {

        const temporario =
            filtros.valorMin;

        filtros.valorMin =
            filtros.valorMax;

        filtros.valorMax =
            temporario;

    }

    return filtros;

},


/* =====================================================
   APLICAR FILTROS
===================================================== */

aplicar() {

    let filtros =
        this.obterFiltros();

    filtros =
        this.validarFiltros(
            filtros
        );


    const valorMin =
        document.getElementById(
            "filtro-valor-min"
        );

    const valorMax =
        document.getElementById(
            "filtro-valor-max"
        );


    if (valorMin) {

        valorMin.value =
            filtros.valorMin !== null
                ? filtros.valorMin
                : "";

    }

    if (valorMax) {

        valorMax.value =
            filtros.valorMax !== null
                ? filtros.valorMax
                : "";

    }


    console.log(
        "🔎 Filtros aplicados:",
        filtros
    );


    window.dispatchEvent(
        new CustomEvent(
            "musicalworld:filtros-aplicados",
            {
                detail: {
                    filtros
                }
            }
        )
    );


    this.fechar();

},


/* =====================================================
   LIMPAR FILTROS
===================================================== */

async limpar() {

    const estado =
        document.getElementById(
            "filtro-estado"
        );

    const cidade =
        document.getElementById(
            "filtro-cidade"
        );

    const categoria =
        document.getElementById(
            "filtro-categoria"
        );

    const instrumento =
        document.getElementById(
            "filtro-instrumento"
        );

    const estilo =
        document.getElementById(
            "filtro-estilo"
        );

    const valorMin =
        document.getElementById(
            "filtro-valor-min"
        );

    const valorMax =
        document.getElementById(
            "filtro-valor-max"
        );

    const wrapper =
        document.getElementById(
            "wrapper-instrumento"
        );


    if (estado) {
        estado.value = "";
    }

    if (cidade) {

        cidade.innerHTML = `

            <option value="">
                Selecione um estado primeiro
            </option>

        `;

        cidade.value = "";

        cidade.disabled = true;

    }

    if (categoria) {
        categoria.value = "";
    }

    if (instrumento) {
        instrumento.value = "";
    }

    if (estilo) {
        estilo.value = "";
    }

    if (valorMin) {
        valorMin.value = "";
    }

    if (valorMax) {
        valorMax.value = "";
    }

    if (wrapper) {
        wrapper.style.display = "none";
    }


    const filtros = {

        estado: "",
        cidade: "",
        categoria: "",
        instrumento: "",
        estilo: "",
        valorMin: null,
        valorMax: null

    };


    console.log(
        "🧹 Filtros limpos."
    );


    window.dispatchEvent(
        new CustomEvent(
            "musicalworld:filtros-aplicados",
            {
                detail: {
                    filtros
                }
            }
        )
    );

}


};

/* =========================================================
FUNÇÕES GLOBAIS DE COMPATIBILIDADE
========================================================= */

window.abrirModalFiltro = function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.abrir === "function"
) {

    window.ModalFiltro.abrir();

    return;

}

console.warn(
    "⚠️ ModalFiltro ainda não foi carregado."
);


};

window.fecharModalFiltro = function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.fechar === "function"
) {

    window.ModalFiltro.fechar();

}


};

window.fecharModalFiltroFora = function (
event
) {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.fecharFora === "function"
) {

    window.ModalFiltro.fecharFora(
        event
    );

}


};

window.tratarMudancaCategoriaFiltro = function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.tratarMudancaCategoria === "function"
) {

    window.ModalFiltro.tratarMudancaCategoria();

}


};

window.limparFiltros = function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.limpar === "function"
) {

    window.ModalFiltro.limpar();

}


};

window.aplicarFiltros = function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.aplicar === "function"
) {

    window.ModalFiltro.aplicar();

}


};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

if (
document.readyState === "loading"
) {


document.addEventListener(
    "DOMContentLoaded",
    () => {

        ModalFiltro.iniciar();

    }
);


} else {


ModalFiltro.iniciar();


}
