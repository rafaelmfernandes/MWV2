/* =========================================================
   MUSICALWORLD — MENU PRINCIPAL

   Arquivo:
   js/components/menu-inferior.js

   Responsabilidade:

   - Inicializar o menu principal.
   - Carregar o painel de pesquisa.
   - Carregar automaticamente os recursos da animação
     do item Financeiro.
   - Identificar automaticamente a página atual.
   - Controlar o item ativo.
   - Animar o indicador de seleção.
   - Abrir Home.
   - Abrir Pesquisa.
   - Abrir Financeiro.
   - Abrir Contratações.
   - Abrir Meu Perfil.
   - Identificar o usuário autenticado.
   - Exibir a foto do usuário logado no item Perfil.

   IMPORTANTE:

   O menu possui cinco áreas principais:

   1. Home
   2. Pesquisa
   3. Financeiro
   4. Contratações
   5. Perfil

   RESPONSIVIDADE:

   - Mobile:
     Menu horizontal fixado na parte inferior.

   - Desktop:
     Menu vertical fixado no lado esquerdo da tela,
     centralizado verticalmente.

   O menu desktop utiliza position: fixed para não
   participar do fluxo do feed.

   Dessa forma, o feed continua centralizado
   independentemente da presença do menu.

   O indicador de seleção também possui comportamento
   responsivo:

   - Mobile: movimentação horizontal.
   - Desktop: movimentação vertical.

   O acesso para criação de anúncios não faz mais parte
   deste menu.

   RECURSOS DO MENU:

   O menu é responsável por carregar os recursos que
   pertencem exclusivamente a ele.

   Portanto, as páginas não precisam carregar diretamente:

   - animacao-financeiro.js
   - animacao-financeiro.css
========================================================= */


const MenuInferior = {


/* =====================================================
   CONTROLE DE ESTADO
===================================================== */

inicializado: false,

pesquisaCarregada: false,

indicadorAnimando: false,

fotoPerfilCarregada: false,

animacaoFinanceiroCarregada: false,


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async iniciar() {

    if (this.inicializado) {
        return;
    }


    /*
     * Verifica se o container do menu existe na página.
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
     * Carrega os recursos utilizados pela pesquisa.
     */

    await this.carregarRecursosPesquisa();


    /*
     * Marca o módulo como inicializado antes
     * de criar os eventos.
     */

    this.inicializado = true;


    /*
     * Cria o HTML do menu.
     */

    this.criarMenu(container);


    /*
     * Carrega os recursos específicos da animação
     * do item Financeiro.
     */

    await this.carregarRecursosAnimacaoFinanceiro();


    /*
     * Verifica se existe usuário autenticado
     * e carrega sua foto no item Perfil.
     */

    await this.carregarFotoPerfilUsuario();


    /*
     * Identifica automaticamente a página atual.
     */

    this.definirPaginaAtual();


    /*
     * Configura os eventos dos cinco itens.
     */

    this.configurarEventos();


    /*
     * Recalcula o indicador caso o navegador termine
     * de ajustar layout, fontes ou dimensões.
     */

    requestAnimationFrame(() => {

        const itemAtivo =
            document.querySelector(
                '#menu-inferior .bottom-nav-item.ativo'
            );

        if (itemAtivo) {

            this.definirAtivo(
                itemAtivo,
                false
            );

        }

    });


    /*
     * Recalcula o indicador quando a janela muda
     * de tamanho ou orientação.
     */

    window.addEventListener(
        'resize',
        () => {

            const itemAtivo =
                document.querySelector(
                    '#menu-inferior .bottom-nav-item.ativo'
                );

            if (itemAtivo) {

                this.definirAtivo(
                    itemAtivo,
                    false
                );

            }

        }
    );


    console.log(
        'Menu inferior inicializado corretamente.'
    );
},


/* =====================================================
   CARREGAR RECURSOS DA ANIMAÇÃO FINANCEIRA
===================================================== */

async carregarRecursosAnimacaoFinanceiro() {

    /*
     * Primeiro carregamos o CSS.
     */

    this.carregarCssAnimacaoFinanceiro();


    /*
     * Se o objeto global já estiver disponível,
     * significa que o JavaScript já foi carregado.
     */

    if (
        window.MusicalWorldAnimacaoFinanceiro &&
        typeof window.MusicalWorldAnimacaoFinanceiro.inicializar === 'function'
    ) {

        this.animacaoFinanceiroCarregada = true;

        window.MusicalWorldAnimacaoFinanceiro.inicializar();

        return;
    }


    /*
     * Verifica se outro carregamento do mesmo arquivo
     * já foi iniciado.
     */

    const scriptExistente =
        document.querySelector(
            'script[data-animacao-financeiro-js="true"]'
        );


    if (scriptExistente) {

        await this.aguardarAnimacaoFinanceiro();

        return;
    }


    /*
     * Cria dinamicamente o elemento <script>.
     */

    const script =
        document.createElement('script');


    script.src =
        'js/components/animacao-financeiro.js';


    script.dataset.animacaoFinanceiroJs =
        'true';


    /*
     * Quando o JavaScript terminar de carregar,
     * inicializa a animação.
     */

    script.onload = () => {

        console.log(
            'JavaScript da animação financeira carregado automaticamente.'
        );


        this.animacaoFinanceiroCarregada =
            true;


        if (
            window.MusicalWorldAnimacaoFinanceiro &&
            typeof window.MusicalWorldAnimacaoFinanceiro.inicializar === 'function'
        ) {

            window.MusicalWorldAnimacaoFinanceiro.inicializar();

        }

    };


    /*
     * Caso o arquivo não seja encontrado,
     * o restante do menu continua funcionando normalmente.
     */

    script.onerror = () => {

        console.error(
            'Não foi possível carregar js/components/animacao-financeiro.js'
        );

    };


    /*
     * Adiciona o script ao documento.
     */

    document.body.appendChild(script);


    /*
     * Aguarda o objeto global ficar disponível.
     */

    await this.aguardarAnimacaoFinanceiro();

},


/* =====================================================
   AGUARDAR ANIMAÇÃO FINANCEIRA
===================================================== */

aguardarAnimacaoFinanceiro() {

    return new Promise(resolve => {

        let tentativas = 0;


        const verificar = () => {

            /*
             * Verifica se o módulo da animação já foi
             * disponibilizado globalmente.
             */

            if (
                window.MusicalWorldAnimacaoFinanceiro &&
                typeof window.MusicalWorldAnimacaoFinanceiro.inicializar === 'function'
            ) {

                this.animacaoFinanceiroCarregada =
                    true;


                window.MusicalWorldAnimacaoFinanceiro.inicializar();


                resolve();

                return;
            }


            tentativas++;


            /*
             * Evita ficar aguardando indefinidamente
             * caso o arquivo tenha algum problema.
             */

            if (tentativas >= 50) {

                console.warn(
                    'Animação financeira não ficou disponível a tempo.'
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
   CARREGAR CSS DA ANIMAÇÃO FINANCEIRA
===================================================== */

carregarCssAnimacaoFinanceiro() {

    /*
     * Verifica se o CSS já foi carregado.
     *
     * Isso impede que páginas ou inicializações múltiplas
     * criem várias tags <link> para o mesmo arquivo.
     */

    const cssExistente =
        document.querySelector(
            'link[data-animacao-financeiro-css="true"]'
        );


    if (cssExistente) {
        return;
    }


    /*
     * Cria o elemento <link>.
     */

    const link =
        document.createElement('link');


    link.rel =
        'stylesheet';


    link.href =
        'css/components/animacao-financeiro.css';


    link.dataset.animacaoFinanceiroCss =
        'true';


    /*
     * Adiciona o CSS ao <head>.
     */

    document.head.appendChild(link);


    console.log(
        'CSS da animação financeira carregado automaticamente.'
    );

},


/* =====================================================
   CARREGAR FOTO DO PERFIL DO USUÁRIO LOGADO
===================================================== */

async carregarFotoPerfilUsuario() {

    /*
     * Se o módulo de sessão não estiver disponível,
     * o menu continua funcionando com o ícone padrão.
     */

    if (
        typeof window.Sessao === 'undefined' ||
        typeof window.Sessao.obter !== 'function'
    ) {

        console.warn(
            'Sessao.js não está disponível para carregar a foto do perfil.'
        );

        return;
    }


    try {

        /*
         * Obtém a sessão atual.
         */

        const sessao =
            await window.Sessao.obter();


        /*
         * Sem sessão:
         * mantém o ícone padrão.
         */

        if (
            !sessao ||
            !sessao.user ||
            !sessao.user.id
        ) {

            return;
        }


        const usuarioId =
            sessao.user.id;


        /*
         * Obtém o cliente Supabase.
         */

        const supabase =
            window.supabaseClient ||
            (
                window.SupabaseClient &&
                typeof window.SupabaseClient.getClient === 'function'
                    ? window.SupabaseClient.getClient()
                    : null
            );


        if (!supabase) {

            console.warn(
                'Cliente Supabase não está disponível para carregar a foto do perfil.'
            );

            return;
        }


        /*
         * Busca somente a foto do usuário autenticado.
         */

        const {
            data,
            error
        } = await supabase
            .from('usuarios')
            .select('foto_url')
            .eq('id', usuarioId)
            .maybeSingle();


        if (error) {

            console.error(
                'Erro ao carregar foto do usuário no menu inferior:',
                error
            );

            return;
        }


        /*
         * Sem foto cadastrada:
         * mantém o ícone padrão.
         */

        const fotoUrl =
            data &&
            typeof data.foto_url === 'string'
                ? data.foto_url.trim()
                : '';


        if (!fotoUrl) {

            return;
        }


        /*
         * Localiza o botão de perfil.
         */

        const itemPerfil =
            document.getElementById(
                'nav-item-perfil'
            );


        if (!itemPerfil) {
            return;
        }


        const wrapper =
            itemPerfil.querySelector(
                '.profile-icon-wrapper'
            );


        if (!wrapper) {
            return;
        }


        /*
         * Cria a imagem do perfil.
         */

        const imagem =
            document.createElement('img');


        imagem.className =
            'nav-profile-image';


        imagem.src =
            fotoUrl;


        imagem.alt =
            'Meu perfil';


        imagem.loading =
            'lazy';


        imagem.decoding =
            'async';


        /*
         * Fallback caso a imagem não possa ser carregada.
         */

        imagem.addEventListener(
            'error',
            () => {

                imagem.remove();

                wrapper.classList.remove(
                    'has-profile-image'
                );

                this.fotoPerfilCarregada =
                    false;

            },
            {
                once: true
            }
        );


        /*
         * Quando a imagem estiver disponível,
         * ocultamos o ícone padrão e o indicador.
         */

        imagem.addEventListener(
            'load',
            () => {

                wrapper.classList.add(
                    'has-profile-image'
                );

                this.fotoPerfilCarregada =
                    true;


                itemPerfil.setAttribute(
                    'aria-label',
                    'Meu perfil'
                );


                itemPerfil.setAttribute(
                    'title',
                    'Meu perfil'
                );

            },
            {
                once: true
            }
        );


        wrapper.appendChild(
            imagem
        );

    }

    catch (erro) {

        console.error(
            'Erro inesperado ao carregar foto do perfil no menu inferior:',
            erro
        );

    }

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


    script.dataset.painelPesquisaJs =
        'true';


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
   CRIAR MENU
===================================================== */

criarMenu(container) {

    /*
     * Nenhum item recebe "ativo" diretamente.
     *
     * O item ativo será definido por definirPaginaAtual().
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
                 FINANCEIRO
                 ===================================== -->

            <button
                type="button"
                class="bottom-nav-item"
                id="nav-item-financeiro"
                data-aba="financeiro"
                aria-label="Financeiro"
                title="Financeiro"
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
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                        ></rect>

                        <path
                            d="M3 10h18"
                        ></path>

                        <path
                            d="M16 15h2"
                        ></path>

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

                    <!-- Ícone padrão -->

                    <svg
                        class="nav-icon-svg profile-default-icon"
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


                    <!--
                     * A foto do usuário autenticado
                     * é adicionada dinamicamente.
                     -->

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
     * FINANCEIRO
     */

    else if (
        arquivoAtual === 'financeiro.html'
    ) {

        abaAtual = 'financeiro';

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
       FINANCEIRO
       ================================================ */

    if (aba === 'financeiro') {

        this.definirAtivo(
            elemento,
            true
        );


        window.location.href =
            'financeiro.html';


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

/*
 * Esta função agora entende os dois layouts:
 *
 * MOBILE
 * - Indicador se move horizontalmente.
 *
 * DESKTOP
 * - Indicador se move verticalmente.
 *
 * O CSS continua responsável pelo tamanho,
 * aparência e posição inicial do indicador.
 *
 * O JavaScript apenas calcula a coordenada
 * necessária para centralizá-lo no item ativo.
 */

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


    const menuRect =
        menu.getBoundingClientRect();


    const elementoRect =
        elemento.getBoundingClientRect();


    /*
     * Detecta se estamos utilizando o layout desktop.
     *
     * O mesmo breakpoint utilizado no CSS é aplicado aqui.
     */

    const layoutDesktop =
        window.matchMedia(
            '(min-width: 768px)'
        ).matches;


    /*
     * Desliga temporariamente a animação quando
     * estamos apenas posicionando o indicador
     * inicialmente ou após redimensionamento.
     */

    if (!animar) {

        indicador.style.transition =
            'none';

    }


    /* =================================================
       DESKTOP
       ================================================= */

    if (layoutDesktop) {

        /*
         * No desktop o menu é vertical.
         *
         * Portanto calculamos a posição pelo eixo Y.
         */

        const centroVertical =
            elementoRect.top +
            (elementoRect.height / 2) -
            menuRect.top;


        const altura =
            indicador.offsetHeight;


        const posicaoVertical =
            centroVertical -
            (altura / 2);


        indicador.style.transform =
            `translate3d(-50%, ${posicaoVertical}px, 0)`;

    }


    /* =================================================
       MOBILE
       ================================================= */

    else {

        /*
         * No mobile o menu continua horizontal.
         *
         * Portanto calculamos a posição pelo eixo X.
         */

        const centroHorizontal =
            elementoRect.left +
            (elementoRect.width / 2) -
            menuRect.left;


        const largura =
            indicador.offsetWidth;


        const posicaoHorizontal =
            centroHorizontal -
            (largura / 2);


        indicador.style.transform =
            `translate3d(${posicaoHorizontal}px, -50%, 0)`;

    }


    /*
     * Restaura a transição depois do posicionamento inicial.
     */

    if (!animar) {

        indicador.offsetHeight;


        indicador.style.transition =
            '';

    }

},


/* =====================================================
   ABRIR MEU PERFIL
===================================================== */

async abrirMeuPerfil() {

    console.log(
        'Abrindo meu perfil...'
    );


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


    console.log(
        'Sessão encontrada:',
        sessao.user?.id
    );


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