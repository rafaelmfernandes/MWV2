/* =========================================================
PAINEL DE PESQUISA — MUSICALWORLD
Componente reutilizável
========================================================= */

const PainelPesquisa = {


inicializado: false,

iniciar() {

    if (this.inicializado) {
        return;
    }

    /*
     * O painel é criado automaticamente.
     * Assim nenhuma página precisa repetir o HTML.
     */
    this.criarPainel();

    const painel = document.getElementById('painel-pesquisa');
    const campo = document.getElementById('campo-pesquisa');
    const btnFechar = document.getElementById('btn-fechar-pesquisa');

    if (!painel || !campo) {
        console.warn(
            '⚠️ Painel de pesquisa: elementos não encontrados.'
        );

        return;
    }

    this.inicializado = true;

    campo.addEventListener('input', () => {
        this.filtrar(campo.value);
    });

    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            this.fechar();
        });
    }

    document.addEventListener('keydown', evento => {

        if (evento.key !== 'Escape') {
            return;
        }

        if (painel.classList.contains('ativo')) {
            this.fechar();
        }

    });

    console.log(
        '🔎 Painel de pesquisa inicializado corretamente.'
    );
},


/* =====================================================
   CRIAR PAINEL
   ===================================================== */

criarPainel() {

    /*
     * Se a página já possuir o painel, não cria outro.
     */
    if (document.getElementById('painel-pesquisa')) {
        return;
    }

    let container =
        document.getElementById('painel-pesquisa-container');

    /*
     * Se o container ainda não existir,
     * criamos automaticamente no final do body.
     */
    if (!container) {

        container = document.createElement('div');

        container.id =
            'painel-pesquisa-container';

        document.body.appendChild(container);
    }

    container.innerHTML = `

        <div
            id="painel-pesquisa"
            class="search-overlay"
        >

            <div class="search-overlay-header">

                <div class="search-overlay-input-wrapper">

                    <svg
                        class="search-overlay-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="8"
                        ></circle>

                        <line
                            x1="21"
                            y1="21"
                            x2="16.65"
                            y2="16.65"
                        ></line>

                    </svg>

                    <input
                        type="text"
                        id="campo-pesquisa"
                        class="search-overlay-input"
                        placeholder="Buscar artistas, estilos, eventos..."
                        autocomplete="off"
                    >

                </div>

                <button
                    type="button"
                    class="search-overlay-cancelar"
                    id="btn-fechar-pesquisa"
                >
                    Cancelar
                </button>

            </div>

            <div
                id="resultados-pesquisa"
                class="search-results"
            >
                <p class="search-estado-vazio">
                    Digite algo para buscar em todas as categorias.
                </p>
            </div>

        </div>

    `;

    console.log(
        '🔎 Estrutura do painel de pesquisa criada.'
    );
},


/* =====================================================
   ABRIR
   ===================================================== */

abrir() {

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

    this.filtrar('');

    setTimeout(() => {
        campo.focus();
    }, 300);
},


/* =====================================================
   FECHAR
   ===================================================== */

fechar() {

    const painel =
        document.getElementById('painel-pesquisa');

    if (!painel) {
        return;
    }

    painel.classList.remove('ativo');
},


/* =====================================================
   COLETAR CARDS
   ===================================================== */

coletarCards() {

    const cards =
        document.querySelectorAll(
            '.cat-content .ad-card-novo'
        );

    const lista = [];

    cards.forEach(card => {

        const linkPai =
            card.closest('a');

        const nome =
            card.querySelector(
                '.ad-user-info h4'
            );

        const estilo =
            card.querySelector(
                '.ad-estilo'
            );

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
},


/* =====================================================
   FILTRAR
   ===================================================== */

filtrar(termo) {

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


    /*
     * Nenhum termo digitado
     */
    if (termoLimpo === '') {

        container.innerHTML = `
            <p class="search-estado-vazio">
                Digite algo para buscar em todas as categorias.
            </p>
        `;

        return;
    }


    /*
     * Coleta os cards existentes na página
     */
    const cards =
        this.coletarCards();


    /*
     * Procura pelo termo
     */
    const encontrados =
        cards.filter(item =>
            item.textoBusca.includes(
                termoLimpo
            )
        );


    /*
     * Nenhum resultado
     */
    if (encontrados.length === 0) {

        container.innerHTML = `
            <p class="search-estado-vazio">
                Nenhum resultado para "${termo}".
            </p>
        `;

        return;
    }


    /*
     * Exibe resultados
     */
    container.innerHTML =
        encontrados
            .map(item => `
                <a
                    href="${item.href}"
                    style="
                        text-decoration:none;
                        color:inherit;
                        display:block;
                    "
                >
                    ${item.html}
                </a>
            `)
            .join('');
}


};

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.PainelPesquisa =
PainelPesquisa;

/* =========================================================
COMPATIBILIDADE COM O SISTEMA ATUAL
========================================================= */

window.abrirPesquisa = function () {


PainelPesquisa.abrir();


};

window.fecharPesquisa = function () {


PainelPesquisa.fechar();


};

window.filtrarPesquisa = function (termo) {


PainelPesquisa.filtrar(termo);


};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
'DOMContentLoaded',
() => {


    PainelPesquisa.iniciar();

}


);
