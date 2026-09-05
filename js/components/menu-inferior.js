/* =========================================================
MENU INFERIOR — MUSICALWORLD
Componente reutilizável
========================================================= */

const MenuInferior = {


inicializado: false,
pesquisaCarregada: false,
modalAnunciarCarregado: false,


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

async iniciar() {

    if (this.inicializado) {
        return;
    }

    /*
     * Carrega automaticamente os componentes globais.
     */
    await this.carregarRecursosPesquisa();

    await this.carregarRecursosAnunciar();


    const container =
        document.getElementById(
            'menu-inferior-container'
        );


    if (!container) {

        console.warn(
            '⚠️ Container do menu inferior não encontrado.'
        );

        return;
    }


    this.inicializado = true;


    this.criarMenu(container);


    this.configurarEventos();


    console.log(
        '✅ Menu inferior inicializado corretamente.'
    );
},


/* =====================================================
   CARREGAR RECURSOS DA PESQUISA
   ===================================================== */

async carregarRecursosPesquisa() {

    /*
     * 1. Carrega o CSS
     */

    this.carregarCssPesquisa();


    /*
     * 2. Verifica se o JavaScript já foi carregado
     */

    if (
        window.PainelPesquisa &&
        typeof window.PainelPesquisa.iniciar ===
        'function'
    ) {

        this.pesquisaCarregada = true;

        /*
         * Garante a inicialização do componente.
         */

        window.PainelPesquisa.iniciar();

        return;
    }


    /*
     * 3. Verifica se já existe uma tag script
     */

    const scriptExistente =
        document.querySelector(
            'script[data-painel-pesquisa-js="true"]'
        );


    if (scriptExistente) {

        await this.aguardarPainelPesquisa();

        return;
    }


    /*
     * 4. Cria o script automaticamente
     */

    const script =
        document.createElement('script');


    script.src =
        'js/components/painel-pesquisa.js';


    script.dataset.painelPesquisaJs =
        'true';


    script.onload = async () => {

        console.log(
            '🔎 JavaScript do painel de pesquisa carregado automaticamente.'
        );


        this.pesquisaCarregada = true;


        /*
         * Inicializa o componente imediatamente.
         */

        if (
            window.PainelPesquisa &&
            typeof window.PainelPesquisa.iniciar ===
            'function'
        ) {

            window.PainelPesquisa.iniciar();

        }

    };


    script.onerror = () => {

        console.error(
            '❌ Não foi possível carregar js/components/painel-pesquisa.js'
        );

    };


    document.body.appendChild(script);


    /*
     * Aguarda o script terminar de carregar.
     */

    await this.aguardarPainelPesquisa();
},


/* =====================================================
   AGUARDAR PAINEL DE PESQUISA
   ===================================================== */

aguardarPainelPesquisa() {

    return new Promise(resolve => {

        let tentativas = 0;


        const verificar = () => {

            if (
                window.PainelPesquisa &&
                typeof window.PainelPesquisa.iniciar ===
                'function'
            ) {

                this.pesquisaCarregada = true;


                /*
                 * Garante que o componente esteja inicializado.
                 */

                window.PainelPesquisa.iniciar();


                resolve();

                return;
            }


            tentativas++;


            /*
             * Evita ficar aguardando indefinidamente.
             */

            if (tentativas >= 50) {

                console.warn(
                    '⚠️ Painel de pesquisa não ficou disponível a tempo.'
                );


                resolve();

                return;
            }


            setTimeout(
                verificar,
                50
            );

        };


        verificar();

    });
},


/* =====================================================
   CARREGAR CSS DA PESQUISA
   ===================================================== */

carregarCssPesquisa() {

    /*
     * Verifica se o CSS já foi carregado.
     */

    const cssExistente =
        document.querySelector(
            'link[data-painel-pesquisa-css="true"]'
        );


    if (cssExistente) {
        return;
    }


    const link =
        document.createElement('link');


    link.rel =
        'stylesheet';


    link.href =
        'css/painel-pesquisa.css';


    link.dataset.painelPesquisaCss =
        'true';


    document.head.appendChild(link);


    console.log(
        '🎨 CSS do painel de pesquisa carregado automaticamente.'
    );
},


/* =====================================================
   CARREGAR RECURSOS DO MODAL ANUNCIAR
   ===================================================== */

async carregarRecursosAnunciar() {

    /*
     * 1. Carrega o CSS automaticamente.
     */

    this.carregarCssAnunciar();


    /*
     * 2. Verifica se o componente já existe.
     */

    if (
        window.ModalAnunciar &&
        typeof window.ModalAnunciar.iniciar ===
        'function'
    ) {

        this.modalAnunciarCarregado = true;


        /*
         * Garante que o modal esteja criado.
         */

        window.ModalAnunciar.iniciar();


        return;
    }


    /*
     * 3. Verifica se o script já está sendo carregado.
     */

    const scriptExistente =
        document.querySelector(
            'script[data-modal-anunciar-js="true"]'
        );


    if (scriptExistente) {

        await this.aguardarModalAnunciar();

        return;
    }


    /*
     * 4. Cria o script automaticamente.
     */

    const script =
        document.createElement('script');


    script.src =
        'js/components/modal-anunciar.js';


    script.dataset.modalAnunciarJs =
        'true';


    script.onload = () => {

        console.log(
            '📢 JavaScript do Modal Anunciar carregado automaticamente.'
        );


        this.modalAnunciarCarregado = true;


        /*
         * Inicializa imediatamente.
         */

        if (
            window.ModalAnunciar &&
            typeof window.ModalAnunciar.iniciar ===
            'function'
        ) {

            window.ModalAnunciar.iniciar();

        }

    };


    script.onerror = () => {

        console.error(
            '❌ Não foi possível carregar js/components/modal-anunciar.js'
        );

    };


    document.body.appendChild(script);


    /*
     * Aguarda o componente ficar disponível.
     */

    await this.aguardarModalAnunciar();
},


/* =====================================================
   AGUARDAR MODAL ANUNCIAR
   ===================================================== */

aguardarModalAnunciar() {

    return new Promise(resolve => {

        let tentativas = 0;


        const verificar = () => {

            if (
                window.ModalAnunciar &&
                typeof window.ModalAnunciar.iniciar ===
                'function'
            ) {

                this.modalAnunciarCarregado = true;


                /*
                 * Garante que o modal seja criado.
                 */

                window.ModalAnunciar.iniciar();


                resolve();

                return;
            }


            tentativas++;


            /*
             * Evita espera infinita.
             */

            if (tentativas >= 50) {

                console.warn(
                    '⚠️ Modal Anunciar não ficou disponível a tempo.'
                );


                resolve();

                return;
            }


            setTimeout(
                verificar,
                50
            );

        };


        verificar();

    });
},


/* =====================================================
   CARREGAR CSS DO MODAL ANUNCIAR
   ===================================================== */

carregarCssAnunciar() {

    /*
     * Verifica se o CSS já foi carregado.
     */

    const cssExistente =
        document.querySelector(
            'link[data-modal-anunciar-css="true"]'
        );


    if (cssExistente) {
        return;
    }


    const link =
        document.createElement('link');


    link.rel =
        'stylesheet';


    link.href =
        'css/modal-anunciar.css';


    link.dataset.modalAnunciarCss =
        'true';


    document.head.appendChild(link);


    console.log(
        '🎨 CSS do Modal Anunciar carregado automaticamente.'
    );
},


/* =====================================================
   CRIAR MENU
   ===================================================== */

criarMenu(container) {

    container.innerHTML = `

        <nav
            id="menu-inferior"
            class="bottom-nav"
            aria-label="Navegação principal"
        >

            <!-- INÍCIO -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-home"
                data-aba="home"
                aria-label="Início"
            >

                <span class="nav-icon-wrapper">

                    <svg
                        class="nav-icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <path
                            d="M3 10.5L12 3l9 7.5"
                        ></path>

                        <path
                            d="M5 9.5V21h14V9.5"
                        ></path>

                        <path
                            d="M9 21v-6h6v6"
                        ></path>

                    </svg>

                </span>

                <span class="nav-label">
                    Início
                </span>

            </button>


            <!-- PESQUISAR -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-pesquisar"
                data-aba="pesquisar"
                aria-label="Pesquisar"
            >

                <span class="nav-icon-wrapper">

                    <svg
                        class="nav-icon-svg"
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
                            r="7"
                        ></circle>

                        <line
                            x1="16.65"
                            y1="16.65"
                            x2="21"
                            y2="21"
                        ></line>

                    </svg>

                </span>

                <span class="nav-label">
                    Pesquisar
                </span>

            </button>


            <!-- ANUNCIAR -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-anunciar"
                data-aba="anunciar"
                aria-label="Anunciar"
            >

                <span class="nav-icon-wrapper">

                    <svg
                        class="nav-icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        ></circle>

                        <line
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="16"
                        ></line>

                        <line
                            x1="8"
                            y1="12"
                            x2="16"
                            y2="12"
                        ></line>

                    </svg>

                </span>

                <span class="nav-label">
                    Anunciar
                </span>

            </button>


            <!-- PERFIL -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-perfil"
                data-aba="perfil"
                aria-label="Perfil"
            >

                <span
                    class="nav-icon-wrapper profile-icon-wrapper"
                >

                    <svg
                        class="nav-icon-svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <circle
                            cx="12"
                            cy="8"
                            r="4"
                        ></circle>

                        <path
                            d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"
                        ></path>

                    </svg>

                    <span
                        class="profile-dot"
                        aria-hidden="true"
                    ></span>

                </span>

                <span class="nav-label">
                    Perfil
                </span>

            </button>

        </nav>

    `;
},


/* =====================================================
   CONFIGURAR EVENTOS
   ===================================================== */

configurarEventos() {

    const itens =
        document.querySelectorAll(
            '#menu-inferior .bottom-nav-item'
        );


    itens.forEach(item => {

        item.addEventListener(
            'click',
            () => {

                const aba =
                    item.dataset.aba;


                this.mudarAba(
                    aba,
                    item
                );

            }
        );

    });


    console.log(
        `✅ ${itens.length} itens do menu configurados.`
    );
},


/* =====================================================
   MUDAR ABA
   ===================================================== */

mudarAba(aba, elemento) {

    /* INÍCIO */

    if (aba === 'home') {

        this.definirAtivo(elemento);

        this.fecharPesquisa();


        window.location.href =
            'index.html';


        return;
    }


    /* PESQUISAR */

    if (aba === 'pesquisar') {

        this.definirAtivo(elemento);


        if (
            window.PainelPesquisa &&
            typeof window.PainelPesquisa.abrir ===
            'function'
        ) {

            window.PainelPesquisa.abrir();

        } else if (
            typeof window.abrirPesquisa ===
            'function'
        ) {

            window.abrirPesquisa();

        } else {

            console.warn(
                '⚠️ Painel de pesquisa não está disponível.'
            );

        }


        return;
    }


    /* ANUNCIAR */

    if (aba === 'anunciar') {

        this.definirAtivo(elemento);


        if (
            window.ModalAnunciar &&
            typeof window.ModalAnunciar.abrir ===
            'function'
        ) {

            window.ModalAnunciar.abrir();

        } else if (
            typeof window.abrirModalAnuncio ===
            'function'
        ) {

            window.abrirModalAnuncio();

        } else {

            console.warn(
                '⚠️ A função abrirModalAnuncio() não está disponível.'
            );

        }


        return;
    }


    /* PERFIL */

    if (aba === 'perfil') {

        this.definirAtivo(elemento);

        this.abrirMeuPerfil();

        return;
    }

},


/* =====================================================
   DEFINIR ITEM ATIVO
   ===================================================== */

definirAtivo(elemento) {

    const itens =
        document.querySelectorAll(
            '#menu-inferior .bottom-nav-item'
        );


    itens.forEach(item => {

        item.classList.remove(
            'ativo'
        );

    });


    if (elemento) {

        elemento.classList.add(
            'ativo'
        );

    }
},


/* =====================================================
   FECHAR PESQUISA
   ===================================================== */

fecharPesquisa() {

    if (
        window.PainelPesquisa &&
        typeof window.PainelPesquisa.fechar ===
        'function'
    ) {

        window.PainelPesquisa.fechar();

        return;
    }


    if (
        typeof window.fecharPesquisa ===
        'function'
    ) {

        window.fecharPesquisa();

    }
},


/* =====================================================
   ABRIR MEU PERFIL
   ===================================================== */

async abrirMeuPerfil() {

    if (
        typeof window.ControleSessao ===
        'undefined'
    ) {

        console.warn(
            '⚠️ ControleSessao não está disponível.'
        );


        window.location.href =
            'login.html';


        return;
    }


    const usuario =
        await ControleSessao.protegerPagina({

            redirecionarPara:
                'login.html',

            salvarDestino:
                true

        });


    if (!usuario) {
        return;
    }


    let dados = null;


    if (
        typeof window.UsuarioAtual !==
        'undefined'
    ) {

        dados =
            await UsuarioAtual.obter();

    }


    if (!dados) {

        console.warn(
            '⚠️ Não foi possível obter os dados do usuário.'
        );

        return;
    }


    const tipoPerfil =
        dados.tipoPerfil?.nome ||
        dados.perfil?.tipo_perfil?.nome ||
        '';


    if (tipoPerfil === 'artista') {

        window.location.href =
            'meu-perfil-artista.html';

        return;
    }


    if (tipoPerfil === 'contratante') {

        window.location.href =
            'meu-perfil-contratante.html';

        return;
    }


    if (
        tipoPerfil ===
        'organizador_eventos'
    ) {

        alert(
            'O perfil de Organizador de Eventos está em desenvolvimento.'
        );

        return;
    }


    if (
        tipoPerfil ===
        'casa_shows'
    ) {

        alert(
            'O perfil de Casa de Shows está em desenvolvimento.'
        );

        return;
    }


    if (
        tipoPerfil ===
        'empresa_agencia'
    ) {

        alert(
            'O perfil de Empresa / Agência está em desenvolvimento.'
        );

        return;
    }


    console.warn(
        '⚠️ Tipo de perfil não reconhecido:',
        tipoPerfil
    );


    window.location.href =
        'index.html';
}


};

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.MenuInferior =
MenuInferior;

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
'DOMContentLoaded',
() => {


    MenuInferior.iniciar();

}


);
