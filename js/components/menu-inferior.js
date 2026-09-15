/* =========================================================
MUSICALWORLD — MENU INFERIOR

Arquivo: menu-inferior.js

Responsabilidade:
Controlar a navegação principal inferior do aplicativo.

Funções:

* Inicializar o menu inferior.
* Carregar o painel de pesquisa.
* Carregar o modal de criação de anúncio.
* Identificar automaticamente a página atual.
* Controlar o item ativo.
* Animar o indicador de seleção.
* Abrir Home.
* Abrir Pesquisa.
* Abrir o modal de Anunciar.
* Abrir Contratações.
* Abrir Meu Perfil.

IMPORTANTE:
O menu utiliza apenas ícones visualmente.
Os atributos aria-label e title permanecem para
acessibilidade.

A página atual nunca deve ser definida manualmente.
O menu identifica automaticamente o arquivo aberto
através de window.location.pathname.
========================================================= */

const MenuInferior = {


/* =====================================================
   CONTROLE DE ESTADO
===================================================== */

inicializado: false,

pesquisaCarregada: false,

modalAnunciarCarregado: false,

indicadorAnimando: false,


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async iniciar() {

    if (this.inicializado) {
        return;
    }


    /*
     * Primeiro verificamos se o container do menu
     * existe na página atual.
     *
     * Isso evita carregar recursos desnecessários
     * em páginas que não utilizam o menu.
     */

    const container = document.getElementById(
        'menu-inferior-container'
    );


    if (!container) {

        console.warn(
            'Container do menu inferior não encontrado.'
        );

        return;
    }


    /*
     * Carrega os recursos utilizados pelos botões
     * de pesquisa e anúncio.
     */

    await this.carregarRecursosPesquisa();

    await this.carregarRecursosAnunciar();


    /*
     * Marca o módulo como inicializado antes de
     * criar os eventos.
     */

    this.inicializado = true;


    /*
     * Cria o HTML do menu.
     */

    this.criarMenu(container);


    /*
     * Identifica qual página está aberta e marca
     * automaticamente o item correspondente.
     */

    this.definirPaginaAtual();


    /*
     * Configura os eventos dos cinco itens.
     */

    this.configurarEventos();


    console.log(
        'Menu inferior inicializado corretamente.'
    );
},


/* =====================================================
   CARREGAR RECURSOS DA PESQUISA
===================================================== */

async carregarRecursosPesquisa() {

    this.carregarCssPesquisa();


    if (
        window.PainelPesquisa &&
        typeof window.PainelPesquisa.iniciar === 'function'
    ) {

        this.pesquisaCarregada = true;

        window.PainelPesquisa.iniciar();

        return;
    }


    const scriptExistente = document.querySelector(
        'script[data-painel-pesquisa-js="true"]'
    );


    if (scriptExistente) {

        await this.aguardarPainelPesquisa();

        return;
    }


    const script = document.createElement('script');

    script.src =
        'js/components/painel-pesquisa.js';

    script.dataset.painelPesquisaJs = 'true';


    script.onload = () => {

        console.log(
            'JavaScript do painel de pesquisa carregado automaticamente.'
        );


        this.pesquisaCarregada = true;


        if (
            window.PainelPesquisa &&
            typeof window.PainelPesquisa.iniciar === 'function'
        ) {

            window.PainelPesquisa.iniciar();

        }

    };


    script.onerror = () => {

        console.error(
            'Não foi possível carregar js/components/painel-pesquisa.js'
        );

    };


    document.body.appendChild(script);


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
                typeof window.PainelPesquisa.iniciar === 'function'
            ) {

                this.pesquisaCarregada = true;


                window.PainelPesquisa.iniciar();


                resolve();

                return;
            }


            tentativas++;


            if (tentativas >= 50) {

                console.warn(
                    'Painel de pesquisa não ficou disponível a tempo.'
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

    const cssExistente = document.querySelector(
        'link[data-painel-pesquisa-css="true"]'
    );


    if (cssExistente) {
        return;
    }


    const link = document.createElement('link');

    link.rel = 'stylesheet';

    link.href =
        'css/painel-pesquisa.css';

    link.dataset.painelPesquisaCss =
        'true';


    document.head.appendChild(link);

},


/* =====================================================
   CARREGAR RECURSOS DO MODAL ANUNCIAR
===================================================== */

async carregarRecursosAnunciar() {

    this.carregarCssAnunciar();


    if (
        window.ModalAnunciar &&
        typeof window.ModalAnunciar.iniciar === 'function'
    ) {

        this.modalAnunciarCarregado = true;

        window.ModalAnunciar.iniciar();

        return;
    }


    const scriptExistente = document.querySelector(
        'script[data-modal-anunciar-js="true"]'
    );


    if (scriptExistente) {

        await this.aguardarModalAnunciar();

        return;
    }


    const script = document.createElement('script');

    script.src =
        'js/components/modal-anunciar.js';

    script.dataset.modalAnunciarJs =
        'true';


    script.onload = () => {

        console.log(
            'JavaScript do Modal Anunciar carregado automaticamente.'
        );


        this.modalAnunciarCarregado = true;


        if (
            window.ModalAnunciar &&
            typeof window.ModalAnunciar.iniciar === 'function'
        ) {

            window.ModalAnunciar.iniciar();

        }

    };


    script.onerror = () => {

        console.error(
            'Não foi possível carregar js/components/modal-anunciar.js'
        );

    };


    document.body.appendChild(script);


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
                typeof window.ModalAnunciar.iniciar === 'function'
            ) {

                this.modalAnunciarCarregado = true;


                window.ModalAnunciar.iniciar();


                resolve();

                return;
            }


            tentativas++;


            if (tentativas >= 50) {

                console.warn(
                    'Modal Anunciar não ficou disponível a tempo.'
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

    const cssExistente = document.querySelector(
        'link[data-modal-anunciar-css="true"]'
    );


    if (cssExistente) {
        return;
    }


    const link = document.createElement('link');

    link.rel = 'stylesheet';

    link.href =
        'css/modal-anunciar.css';

    link.dataset.modalAnunciarCss =
        'true';


    document.head.appendChild(link);

},


/* =====================================================
   CRIAR MENU
===================================================== */

criarMenu(container) {

    /*
     * Nenhum item recebe "ativo" diretamente.
     *
     * O item ativo será definido por definirPaginaAtual().
     *
     * O indicador também é criado aqui e permanece
     * como um único elemento dentro do menu.
     */

    container.innerHTML = `

        <nav
            id="menu-inferior"
            class="bottom-nav"
            aria-label="Navegação principal"
        >

            <!-- Indicador deslizante da seleção -->

            <span
                class="nav-active-indicator"
                aria-hidden="true"
            ></span>


            <!-- =====================================
                 INÍCIO
                 ===================================== -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-home"
                data-aba="home"
                aria-label="Início"
                title="Início"
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

            </button>


            <!-- =====================================
                 PESQUISA
                 ===================================== -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-pesquisar"
                data-aba="pesquisar"
                aria-label="Pesquisar"
                title="Pesquisar"
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

                        <path
                            d="m20 20-4-4"
                        ></path>

                    </svg>

                </span>

            </button>


            <!-- =====================================
                 ANUNCIAR
                 ===================================== -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-anunciar"
                data-aba="anunciar"
                aria-label="Anunciar"
                title="Anunciar"
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

            </button>


            <!-- =====================================
                 CONTRATAÇÕES
                 ===================================== -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-contratacoes"
                data-aba="contratacoes"
                aria-label="Contratações"
                title="Contratações"
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

                        <rect
                            x="3"
                            y="7"
                            width="18"
                            height="13"
                            rx="2"
                        ></rect>

                        <path
                            d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>

                        <path
                            d="M3 12h18"
                        ></path>

                        <path
                            d="M10 12v2"
                        ></path>

                        <path
                            d="M14 12v2"
                        ></path>

                    </svg>

                </span>

            </button>


            <!-- =====================================
                 PERFIL
                 ===================================== -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-perfil"
                data-aba="perfil"
                aria-label="Perfil"
                title="Perfil"
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

            </button>

        </nav>

    `;
},


/* =====================================================
   IDENTIFICAR PÁGINA ATUAL
===================================================== */

definirPaginaAtual() {

    /*
     * Obtém somente o nome do arquivo atual.
     */

    const caminhoAtual =
        window.location.pathname;


    const arquivoAtual =
        caminhoAtual
            .split('/')
            .pop()
            .toLowerCase();


    /*
     * Por padrão consideramos Home.
     */

    let abaAtual = 'home';


    /*
     * HOME
     */

    if (
        arquivoAtual === '' ||
        arquivoAtual === 'index.html'
    ) {

        abaAtual = 'home';

    }


    /*
     * CONTRATAÇÕES
     */

    else if (
        arquivoAtual === 'contratacoes.html'
    ) {

        abaAtual = 'contratacoes';

    }


    /*
     * MEU PERFIL
     */

    else if (
        arquivoAtual === 'meu-perfil.html'
    ) {

        abaAtual = 'perfil';

    }


    /*
     * PESQUISA
     */

    else if (
        arquivoAtual === 'pesquisa.html' ||
        arquivoAtual === 'pesquisar.html'
    ) {

        abaAtual = 'pesquisar';

    }


    /*
     * Localiza o botão correspondente.
     */

    const elemento =
        document.querySelector(
            `#menu-inferior .bottom-nav-item[data-aba="${abaAtual}"]`
        );


    /*
     * Aplica o estado ativo.
     *
     * A função também posiciona o indicador
     * sem executar a animação inicial.
     */

    this.definirAtivo(
        elemento,
        false
    );


    console.log(
        `Menu inferior: página atual identificada como "${abaAtual}".`
    );
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
        `${itens.length} itens do menu configurados.`
    );
},


/* =====================================================
   MUDAR ABA
===================================================== */

mudarAba(aba, elemento) {

    /* ================================================
       HOME
       ================================================ */

    if (aba === 'home') {

        this.definirAtivo(
            elemento,
            true
        );

        this.fecharPesquisa();


        window.location.href =
            'index.html';


        return;
    }


    /* ================================================
       PESQUISA
       ================================================ */

    if (aba === 'pesquisar') {

        this.definirAtivo(
            elemento,
            true
        );


        if (
            window.PainelPesquisa &&
            typeof window.PainelPesquisa.abrir === 'function'
        ) {

            window.PainelPesquisa.abrir();

        }

        else if (
            typeof window.abrirPesquisa === 'function'
        ) {

            window.abrirPesquisa();

        }

        else {

            console.warn(
                'Painel de pesquisa não está disponível.'
            );

        }


        return;
    }


    /* ================================================
       ANUNCIAR
       ================================================ */

    if (aba === 'anunciar') {

        /*
         * Anunciar é uma ação e não uma página.
         *
         * O indicador permanece na página atualmente
         * selecionada enquanto o modal é aberto.
         */

        if (
            window.ModalAnunciar &&
            typeof window.ModalAnunciar.abrir === 'function'
        ) {

            window.ModalAnunciar.abrir();

        }

        else if (
            typeof window.abrirModalAnuncio === 'function'
        ) {

            window.abrirModalAnuncio();

        }

        else {

            console.warn(
                'A função abrirModalAnuncio() não está disponível.'
            );

        }


        return;
    }


    /* ================================================
       CONTRATAÇÕES
       ================================================ */

    if (aba === 'contratacoes') {

        this.definirAtivo(
            elemento,
            true
        );

        this.fecharPesquisa();


        window.location.href =
            'contratacoes.html';


        return;
    }


    /* ================================================
       PERFIL
       ================================================ */

    if (aba === 'perfil') {

        this.definirAtivo(
            elemento,
            true
        );

        this.abrirMeuPerfil();

        return;
    }

},


/* =====================================================
   DEFINIR ITEM ATIVO
===================================================== */

definirAtivo(elemento, animar = true) {

    const menu =
        document.getElementById(
            'menu-inferior'
        );


    if (!menu) {
        return;
    }


    const itens =
        menu.querySelectorAll(
            '.bottom-nav-item'
        );


    /*
     * Remove o estado ativo dos demais itens.
     */

    itens.forEach(item => {

        item.classList.remove(
            'ativo'
        );

    });


    if (!elemento) {
        return;
    }


    /*
     * Define o novo item ativo.
     */

    elemento.classList.add(
        'ativo'
    );


    /*
     * Localiza o indicador único.
     */

    const indicador =
        menu.querySelector(
            '.nav-active-indicator'
        );


    if (!indicador) {
        return;
    }


    /*
     * Calcula a posição do botão dentro da barra.
     */

    const menuRect =
        menu.getBoundingClientRect();


    const elementoRect =
        elemento.getBoundingClientRect();


    const centro =
        elementoRect.left +
        (elementoRect.width / 2) -
        menuRect.left;


    /*
     * Calcula a posição do indicador.
     *
     * O indicador tem largura controlada pelo CSS.
     * Usamos transform para permitir uma animação
     * suave e independente do layout.
     */

    const largura =
        indicador.offsetWidth;


    const posicao =
        centro -
        (largura / 2);


    /*
     * Na primeira definição da página, o indicador
     * é posicionado imediatamente.
     *
     * Nos cliques seguintes, o CSS faz a transição.
     */

    if (!animar) {

        indicador.style.transition =
            'none';

    }


    indicador.style.transform =
        `translate3d(${posicao}px, -50%, 0)`;


    if (!animar) {

        /*
         * Força o navegador a aplicar a posição
         * imediatamente antes de restaurar a animação.
         */

        indicador.offsetHeight;


        indicador.style.transition =
            '';

    }

},


/* =====================================================
   FECHAR PESQUISA
===================================================== */

fecharPesquisa() {

    if (
        window.PainelPesquisa &&
        typeof window.PainelPesquisa.fechar === 'function'
    ) {

        window.PainelPesquisa.fechar();

        return;
    }


    if (
        typeof window.fecharPesquisa === 'function'
    ) {

        window.fecharPesquisa();

    }

},


/* =====================================================
   ABRIR MEU PERFIL
===================================================== */

async abrirMeuPerfil() {

    console.log(
        'Abrindo meu perfil...'
    );


    /* ================================================
       VERIFICAR MÓDULO DE SESSÃO
       ================================================ */

    if (
        typeof window.Sessao === 'undefined'
    ) {

        console.error(
            'Sessao.js não está disponível.'
        );


        window.location.href =
            'login.html';


        return;
    }


    /* ================================================
       VERIFICAR SESSÃO ATIVA
       ================================================ */

    const sessao =
        await Sessao.obter();


    if (!sessao) {

        console.warn(
            'Nenhuma sessão ativa. Redirecionando para login.'
        );


        sessionStorage.setItem(
            'musicalworld_destino_login',
            'meu-perfil.html'
        );


        window.location.href =
            'login.html';


        return;
    }


    /* ================================================
       SESSÃO ENCONTRADA
       ================================================ */

    console.log(
        'Sessão encontrada:',
        sessao.user?.id
    );


    /* ================================================
       PERFIL UNIVERSAL
       ================================================ */

    window.location.href =
        'meu-perfil.html';
}


};

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.MenuInferior =
MenuInferior;

/* =========================================================
INICIALIZAÇÃO AUTOMÁTICA
========================================================= */

document.addEventListener(
'DOMContentLoaded',
() => {


    MenuInferior.iniciar();

}


);
