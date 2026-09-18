/* =========================================================
MUSICALWORLD — ONBOARDING

Arquivo:
js/components/onboarding.js

Responsabilidade:

* Controlar as orientações do primeiro acesso.
* Identificar o botão Perfil no menu inferior.
* Criar e posicionar o balão de orientação.
* Criar a camada escura de destaque.
* Destacar o botão Perfil.
* Posicionar a seta exatamente sobre o elemento indicado.
* Controlar o encerramento da primeira orientação.
* Preparar a estrutura para futuras etapas do onboarding.

IMPORTANTE:

Nesta primeira versão, o controle do primeiro acesso
utiliza sessionStorage.

Isso é proposital para permitir testar o comportamento
visual sem alterar ainda o banco de dados.

Depois que o visual for aprovado, podemos substituir
essa parte pelo controle real no Supabase.
========================================================= */

const MusicalWorldOnboarding = {


/* =====================================================
   CONTROLE
===================================================== */

inicializado: false,

tooltip: null,

backdrop: null,

elementoAlvo: null,

observadorMenu: null,

redimensionamentoConfigurado: false,

chaveTeste:
    'musicalworld_onboarding_index_perfil',


/* =====================================================
   INICIALIZAR
===================================================== */

async iniciar() {

    if (this.inicializado) {

        return;

    }


    this.inicializado = true;


    /*
     * Carrega o CSS do componente.
     */

    this.carregarCss();


    /*
     * Nesta primeira etapa estamos usando
     * sessionStorage apenas para teste.
     */

    if (
        sessionStorage.getItem(
            this.chaveTeste
        ) === 'concluido'
    ) {

        console.log(
            'MusicalWorld Onboarding: orientação do Index já concluída nesta sessão.'
        );

        return;

    }


    /*
     * O menu inferior é criado dinamicamente.
     *
     * Por isso aguardamos o botão Perfil
     * caso ele ainda não exista.
     */

    const elementoPerfil =
        await this.aguardarElemento(
            '#nav-item-perfil',
            5000
        );


    if (!elementoPerfil) {

        console.warn(
            'MusicalWorld Onboarding: botão Perfil não encontrado.'
        );

        return;

    }


    /*
     * Guarda o elemento que receberá o destaque.
     */

    this.elementoAlvo =
        elementoPerfil;


    /*
     * Cria a camada escura.
     */

    this.criarBackdrop();


    /*
     * Cria o balão.
     */

    this.criarTooltip();


    /*
     * Posiciona o balão e calcula
     * a posição exata da seta.
     */

    this.posicionarTooltip();


    /*
     * Adiciona o destaque ao botão Perfil.
     */

    this.elementoAlvo.classList.add(
        'musicalworld-onboarding-target'
    );


    /*
     * Configura eventos de posicionamento.
     */

    this.configurarRedimensionamento();


    /*
     * Exibe a camada e o balão depois que
     * tudo estiver pronto.
     */

    requestAnimationFrame(
        () => {

            if (this.backdrop) {

                this.backdrop.classList.add(
                    'is-visible'
                );

            }


            if (this.tooltip) {

                this.tooltip.classList.add(
                    'is-visible'
                );

            }

        }
    );


    console.log(
        'MusicalWorld Onboarding: primeira orientação exibida.'
    );

},


/* =====================================================
   CARREGAR CSS
===================================================== */

carregarCss() {

    const existente =
        document.querySelector(
            'link[data-musicalworld-onboarding-css="true"]'
        );


    if (existente) {

        return;

    }


    const link =
        document.createElement('link');


    link.rel =
        'stylesheet';


    link.href =
        'css/components/onboarding.css';


    link.dataset.musicalworldOnboardingCss =
        'true';


    document.head.appendChild(
        link
    );

},


/* =====================================================
   AGUARDAR ELEMENTO
===================================================== */

aguardarElemento(
    seletor,
    tempoMaximo = 5000
) {

    return new Promise(
        resolve => {

            const elementoInicial =
                document.querySelector(
                    seletor
                );


            if (elementoInicial) {

                resolve(
                    elementoInicial
                );

                return;

            }


            const inicio =
                Date.now();


            const verificar =
                () => {

                    const elemento =
                        document.querySelector(
                            seletor
                        );


                    if (elemento) {

                        resolve(
                            elemento
                        );

                        return;

                    }


                    if (
                        Date.now() -
                        inicio >=
                        tempoMaximo
                    ) {

                        resolve(
                            null
                        );

                        return;

                    }


                    requestAnimationFrame(
                        verificar
                    );

                };


            verificar();

        }
    );

},


/* =====================================================
   CRIAR BACKDROP
===================================================== */

criarBackdrop() {

    /*
     * Remove uma camada anterior, caso exista.
     */

    const existente =
        document.querySelector(
            '.musicalworld-onboarding-backdrop'
        );


    if (existente) {

        existente.remove();

    }


    /*
     * Cria a camada escura.
     */

    const backdrop =
        document.createElement('div');


    backdrop.className =
        'musicalworld-onboarding-backdrop';


    backdrop.setAttribute(
        'aria-hidden',
        'true'
    );


    /*
     * Adiciona diretamente ao body para que
     * ocupe toda a viewport.
     */

    document.body.appendChild(
        backdrop
    );


    this.backdrop =
        backdrop;

},


/* =====================================================
   CRIAR BALÃO
===================================================== */

criarTooltip() {

    /*
     * Remove qualquer balão anterior deste componente.
     */

    const existente =
        document.querySelector(
            '.musicalworld-onboarding-tooltip'
        );


    if (existente) {

        existente.remove();

    }


    /*
     * Cria o elemento principal.
     */

    const tooltip =
        document.createElement('div');


    tooltip.className =
        'musicalworld-onboarding-tooltip';


    tooltip.setAttribute(
        'role',
        'dialog'
    );


    tooltip.setAttribute(
        'aria-label',
        'Orientação para completar o cadastro'
    );


    /*
     * Conteúdo do balão.
     */

    tooltip.innerHTML = `

        <button
            type="button"
            class="musicalworld-onboarding-close"
            aria-label="Fechar orientação"
            title="Fechar orientação"
        >

            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >

                <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />

                <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />

            </svg>

        </button>


        <strong
            class="musicalworld-onboarding-tooltip-title"
        >
            Complete seu cadastro
        </strong>


        <span
            class="musicalworld-onboarding-tooltip-text"
        >
            Complete seu perfil para que ele possa aparecer
            no MusicalWorld e ser encontrado por outras pessoas.
            Clique em <strong>Perfil</strong> para começar.
        </span>

    `;


    /*
     * Adiciona o balão ao body.
     */

    document.body.appendChild(
        tooltip
    );


    /*
     * Configura o botão de fechar.
     */

    const botaoFechar =
        tooltip.querySelector(
            '.musicalworld-onboarding-close'
        );


    if (botaoFechar) {

        botaoFechar.addEventListener(
            'click',
            event => {

                event.preventDefault();

                event.stopPropagation();

                this.encerrar();

            }
        );

    }


    /*
     * Quando o usuário clicar no Perfil,
     * a orientação também é encerrada.
     *
     * O evento é adicionado em captura para garantir
     * que seja executado antes da navegação.
     */

    if (this.elementoAlvo) {

        this.elementoAlvo.addEventListener(
            'click',
            () => {

                this.encerrar();

            },
            {
                once: true,
                capture: true
            }
        );

    }


    this.tooltip =
        tooltip;

},


/* =====================================================
   POSICIONAR BALÃO
===================================================== */

posicionarTooltip() {

    if (
        !this.tooltip ||
        !this.elementoAlvo
    ) {

        return;

    }


    /*
     * Obtém a posição real do botão Perfil
     * dentro da viewport.
     */

    const alvo =
        this.elementoAlvo.getBoundingClientRect();


    const larguraTooltip =
        this.tooltip.offsetWidth;


    const alturaTooltip =
        this.tooltip.offsetHeight;


    if (
        !larguraTooltip ||
        !alturaTooltip
    ) {

        return;

    }


    /*
     * Distância entre o balão e o elemento indicado.
     */

    const distancia =
        16;


    /*
     * Margem mínima entre o balão e as laterais
     * da tela.
     */

    const margem =
        12;


    /*
     * -------------------------------------------------
     * POSIÇÃO HORIZONTAL
     * -------------------------------------------------
     */

    const centroAlvo =
        alvo.left +
        (alvo.width / 2);


    let esquerda =
        centroAlvo -
        (larguraTooltip / 2);


    /*
     * Mantém o balão dentro da viewport.
     */

    if (
        esquerda <
        margem
    ) {

        esquerda =
            margem;

    }


    if (
        esquerda +
        larguraTooltip >
        window.innerWidth -
        margem
    ) {

        esquerda =
            window.innerWidth -
            larguraTooltip -
            margem;

    }


    /*
     * -------------------------------------------------
     * POSIÇÃO VERTICAL
     * -------------------------------------------------
     */

    let topo =
        alvo.top -
        alturaTooltip -
        distancia;


    /*
     * -------------------------------------------------
     * POSIÇÃO DA SETA
     * -------------------------------------------------
     *
     * Calculamos a posição do centro real do Perfil
     * dentro do balão.
     */

    let posicaoSeta =
        centroAlvo -
        esquerda;


    const margemSeta =
        18;


    posicaoSeta =
        Math.max(
            margemSeta,
            Math.min(
                larguraTooltip -
                margemSeta,
                posicaoSeta
            )
        );


    const percentualSeta =
        (
            posicaoSeta /
            larguraTooltip
        ) *
        100;


    this.tooltip.style.setProperty(
        '--onboarding-arrow-left',
        `${percentualSeta}%`
    );


    /*
     * -------------------------------------------------
     * BALÃO ABAIXO DO ELEMENTO
     * -------------------------------------------------
     */

    if (
        topo <
        margem
    ) {

        topo =
            alvo.bottom +
            distancia;


        this.tooltip.classList.add(
            'tooltip-abaixo'
        );

    }

    else {

        this.tooltip.classList.remove(
            'tooltip-abaixo'
        );

    }


    /*
     * Aplica a posição final.

     */

    this.tooltip.style.left =
        `${esquerda}px`;


    this.tooltip.style.top =
        `${topo}px`;

},


/* =====================================================
   CONFIGURAR REDIMENSIONAMENTO
===================================================== */

configurarRedimensionamento() {

    if (
        this.redimensionamentoConfigurado
    ) {

        return;

    }


    this.redimensionamentoConfigurado =
        true;


    const reposicionar =
        () => {

            requestAnimationFrame(
                () => {

                    this.posicionarTooltip();

                }
            );

        };


    window.addEventListener(
        'resize',
        reposicionar,
        {
            passive: true
        }
    );


    window.addEventListener(
        'orientationchange',
        reposicionar,
        {
            passive: true
        }
    );

},


/* =====================================================
   ENCERRAR
===================================================== */

encerrar() {

    /*
     * Salva que esta etapa foi concluída.
     */

    sessionStorage.setItem(
        this.chaveTeste,
        'concluido'
    );


    /*
     * Remove o destaque do botão Perfil.

     */

    if (this.elementoAlvo) {

        this.elementoAlvo.classList.remove(
            'musicalworld-onboarding-target'
        );

    }


    /*
     * Remove a camada escura.

     */

    if (this.backdrop) {

        this.backdrop.classList.remove(
            'is-visible'
        );

    }


    /*
     * Remove o balão.

     */

    if (this.tooltip) {

        this.tooltip.classList.remove(
            'is-visible'
        );


        const tooltipAtual =
            this.tooltip;


        const backdropAtual =
            this.backdrop;


        setTimeout(
            () => {

                if (
                    tooltipAtual &&
                    tooltipAtual.parentNode
                ) {

                    tooltipAtual.remove();

                }


                if (
                    backdropAtual &&
                    backdropAtual.parentNode
                ) {

                    backdropAtual.remove();

                }

            },
            180
        );


        this.tooltip =
            null;

        this.backdrop =
            null;

    }

    else if (this.backdrop) {

        this.backdrop.remove();

        this.backdrop =
            null;

    }


    console.log(
        'MusicalWorld Onboarding: orientação encerrada.'
    );

},


/* =====================================================
   RESETAR TESTE
===================================================== */

resetarTeste() {

    sessionStorage.removeItem(
        this.chaveTeste
    );


    /*
     * Remove o balão.

     */

    if (this.tooltip) {

        this.tooltip.remove();

        this.tooltip =
            null;

    }


    /*
     * Remove a camada escura.
     */

    if (this.backdrop) {

        this.backdrop.remove();

        this.backdrop =
            null;

    }


    /*
     * Remove o destaque do alvo.

     */

    if (this.elementoAlvo) {

        this.elementoAlvo.classList.remove(
            'musicalworld-onboarding-target'
        );

    }


    /*
     * Permite iniciar novamente na mesma página,
     * caso seja necessário durante os testes.
     */

    this.inicializado =
        false;


    console.log(
        'MusicalWorld Onboarding: teste resetado. Recarregue a página ou execute iniciar() novamente.'
    );

}


};

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.MusicalWorldOnboarding =
MusicalWorldOnboarding;

/* =========================================================
INICIALIZAÇÃO AUTOMÁTICA
========================================================= */

document.addEventListener(
'DOMContentLoaded',
() => {


    MusicalWorldOnboarding.iniciar();

}


);
