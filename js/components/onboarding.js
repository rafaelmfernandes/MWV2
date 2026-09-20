
/* =========================================================
   MUSICALWORLD — ONBOARDING DO INDEX

   Arquivo:
   js/components/onboarding.js

   Responsabilidades:
   - Exibir o onboarding de primeiro acesso no Index.
   - Identificar o usuário autenticado pelo Supabase.
   - Consultar o status do onboarding no banco de dados.
   - Exibir o onboarding somente quando necessário.
   - Registrar no banco quando o onboarding for concluído.
   - Impedir que o clique em Perfil seja perdido durante a gravação.
   - Garantir que o onboarding seja executado apenas uma vez.
   - Posicionar o balão corretamente em relação ao menu inferior.

   Regra principal:
   - onboarding_index_concluido = true
     → NÃO exibir o onboarding.
   - onboarding_index_concluido = false
     → exibir o onboarding.
   - usuário inexistente ou erro de consulta
     → NÃO exibir o onboarding.

   Observação:
   O estado é salvo no banco de dados e não em
   sessionStorage/localStorage, permitindo que a conclusão
   seja reconhecida em outros navegadores e dispositivos.
   ========================================================= */

(function (window) {
    "use strict";

    /* =========================================================
       PROTEÇÃO CONTRA DUPLA INICIALIZAÇÃO

       Evita que o componente seja executado duas vezes caso
       o arquivo JavaScript seja incluído acidentalmente mais
       de uma vez no HTML.
       ========================================================= */

    if (window.__MusicalWorldOnboardingInicializado) {
        return;
    }

    window.__MusicalWorldOnboardingInicializado = true;

    /* =========================================================
       OBJETO PRINCIPAL
       ========================================================= */

    const MusicalWorldOnboarding = {

        inicializado: false,

        tooltip: null,

        backdrop: null,

        elementoAlvo: null,

        observadorMenu: null,

        redimensionamentoConfigurado: false,

        navegacaoEmAndamento: false,

        /* =====================================================
           INICIALIZAÇÃO
           ===================================================== */

        async iniciar() {

            if (this.inicializado) {
                return;
            }

            this.inicializado = true;

            try {

                /* ---------------------------------------------
                   Carrega o CSS do onboarding.
                   --------------------------------------------- */

                this.carregarCss();

                /* ---------------------------------------------
                   Aguarda o botão Perfil existir no DOM.
                   --------------------------------------------- */

                const elementoPerfil = await this.aguardarElemento(
                    "#nav-item-perfil",
                    10000
                );

                if (!elementoPerfil) {
                    console.warn(
                        "MusicalWorldOnboarding: botão Perfil não encontrado."
                    );

                    return;
                }

                this.elementoAlvo = elementoPerfil;

                /* ---------------------------------------------
                   Verifica se o onboarding realmente deve aparecer.
                   --------------------------------------------- */

                const deveExibir = await this.deveExibirOnboarding();

                if (!deveExibir) {

                    console.log(
                        "MusicalWorldOnboarding: onboarding não será exibido."
                    );

                    return;
                }

                /* ---------------------------------------------
                   Cria a estrutura visual.
                   --------------------------------------------- */

                this.criarBackdrop();

                this.criarTooltip();

                /* ---------------------------------------------
                   Posiciona o tooltip.
                   --------------------------------------------- */

                this.posicionarTooltip();

                /* ---------------------------------------------
                   Destaca o botão Perfil.
                   --------------------------------------------- */

                this.elementoAlvo.classList.add(
                    "musicalworld-onboarding-target"
                );

                /* ---------------------------------------------
                   Configura atualização de posição.
                   --------------------------------------------- */

                this.configurarRedimensionamento();

                /* ---------------------------------------------
                   Exibe após o navegador concluir o layout.
                   --------------------------------------------- */

                requestAnimationFrame(() => {

                    requestAnimationFrame(() => {

                        if (this.tooltip) {
                            this.tooltip.classList.add("is-visible");
                        }

                        if (this.backdrop) {
                            this.backdrop.classList.add("is-visible");
                        }

                    });

                });

            } catch (erro) {

                console.error(
                    "MusicalWorldOnboarding: erro ao iniciar onboarding.",
                    erro
                );

            }
        },

        /* =====================================================
           CLIENTE SUPABASE
           ===================================================== */

        obterSupabaseClient() {

            try {

                if (
                    window.SupabaseClient &&
                    typeof window.SupabaseClient.getClient === "function"
                ) {

                    const client =
                        window.SupabaseClient.getClient();

                    if (client) {
                        return client;
                    }
                }

                if (
                    window.SupabaseClient &&
                    window.SupabaseClient.client
                ) {

                    return window.SupabaseClient.client;
                }

                if (window.supabaseClient) {
                    return window.supabaseClient;
                }

            } catch (erro) {

                console.error(
                    "MusicalWorldOnboarding: erro ao obter cliente Supabase.",
                    erro
                );

            }

            return null;
        },

        /* =====================================================
           USUÁRIO AUTENTICADO
           ===================================================== */

        async obterUsuarioAutenticado() {

            const supabase = this.obterSupabaseClient();

            if (!supabase) {

                console.error(
                    "MusicalWorldOnboarding: cliente Supabase não encontrado."
                );

                return null;
            }

            try {

                const resultado =
                    await supabase.auth.getUser();

                if (resultado.error) {

                    console.error(
                        "MusicalWorldOnboarding: erro ao obter usuário.",
                        resultado.error
                    );

                    return null;
                }

                return resultado.data?.user || null;

            } catch (erro) {

                console.error(
                    "MusicalWorldOnboarding: erro inesperado ao obter usuário.",
                    erro
                );

                return null;
            }
        },

        /* =====================================================
           VERIFICAÇÃO DO ONBOARDING

           IMPORTANTE:

           Qualquer situação diferente de explicitamente
           false no banco deve impedir a exibição.

           Isso evita que um erro temporário de consulta,
           ausência de registro ou valor inesperado faça
           o onboarding aparecer para usuários antigos.
           ===================================================== */

        async deveExibirOnboarding() {

            const usuario =
                await this.obterUsuarioAutenticado();

            /* ---------------------------------------------
               Sem usuário autenticado:
               não exibir.
               --------------------------------------------- */

            if (!usuario || !usuario.id) {

                console.log(
                    "MusicalWorldOnboarding: nenhum usuário autenticado."
                );

                return false;
            }

            const supabase =
                this.obterSupabaseClient();

            if (!supabase) {
                return false;
            }

            try {

                const resultado = await supabase
                    .from("usuarios")
                    .select("onboarding_index_concluido")
                    .eq("id", usuario.id)
                    .maybeSingle();

                /* -----------------------------------------
                   Se houve erro na consulta, NÃO exibir.
                   ----------------------------------------- */

                if (resultado.error) {

                    console.error(
                        "MusicalWorldOnboarding: erro ao consultar status.",
                        resultado.error
                    );

                    return false;
                }

                const dados = resultado.data;

                /* -----------------------------------------
                   Sem registro:
                   NÃO exibir.

                   Usuários antigos não devem receber
                   onboarding por causa de ausência de dados.
                   ----------------------------------------- */

                if (!dados) {

                    console.warn(
                        "MusicalWorldOnboarding: registro do usuário não encontrado."
                    );

                    return false;
                }

                const valor =
                    dados.onboarding_index_concluido;

                /* -----------------------------------------
                   Normalização defensiva.

                   O Supabase normalmente retorna boolean,
                   mas também aceitamos "true" como texto
                   para evitar interpretações incorretas.
                   ----------------------------------------- */

                const concluido =
                    valor === true ||
                    valor === "true";

                /* -----------------------------------------
                   REGRA DEFINITIVA:

                   Se já foi concluído, nunca exibir.
                   ----------------------------------------- */

                if (concluido) {

                    console.log(
                        "MusicalWorldOnboarding: onboarding já concluído para este usuário."
                    );

                    return false;
                }

                /* -----------------------------------------
                   Somente o valor explicitamente falso
                   permite exibir o onboarding.
                   ----------------------------------------- */

                if (
                    valor === false ||
                    valor === "false"
                ) {

                    console.log(
                        "MusicalWorldOnboarding: onboarding ainda não concluído."
                    );

                    return true;
                }

                /* -----------------------------------------
                   Qualquer outro valor:
                   por segurança, não exibir.
                   ----------------------------------------- */

                console.warn(
                    "MusicalWorldOnboarding: valor inesperado para onboarding_index_concluido:",
                    valor
                );

                return false;

            } catch (erro) {

                console.error(
                    "MusicalWorldOnboarding: erro ao verificar onboarding.",
                    erro
                );

                return false;
            }
        },

        /* =====================================================
           MARCAR COMO CONCLUÍDO
           ===================================================== */

        async marcarComoConcluido() {

            const usuario =
                await this.obterUsuarioAutenticado();

            if (!usuario || !usuario.id) {

                console.warn(
                    "MusicalWorldOnboarding: usuário não encontrado ao concluir."
                );

                return false;
            }

            const supabase =
                this.obterSupabaseClient();

            if (!supabase) {
                return false;
            }

            try {

                const resultado = await supabase
                    .from("usuarios")
                    .update({
                        onboarding_index_concluido: true
                    })
                    .eq("id", usuario.id);

                if (resultado.error) {

                    console.error(
                        "MusicalWorldOnboarding: erro ao salvar conclusão.",
                        resultado.error
                    );

                    return false;
                }

                console.log(
                    "MusicalWorldOnboarding: onboarding marcado como concluído."
                );

                return true;

            } catch (erro) {

                console.error(
                    "MusicalWorldOnboarding: erro inesperado ao salvar conclusão.",
                    erro
                );

                return false;
            }
        },

        /* =====================================================
           CARREGAMENTO DO CSS
           ===================================================== */

        carregarCss() {

            const idCss =
                "musicalworld-onboarding-css";

            if (document.getElementById(idCss)) {
                return;
            }

            const link =
                document.createElement("link");

            link.id = idCss;

            link.rel = "stylesheet";

            link.href =
                "css/components/onboarding.css";

            document.head.appendChild(link);
        },

        /* =====================================================
           AGUARDAR ELEMENTO
           ===================================================== */

        aguardarElemento(seletor, tempoMaximo = 10000) {

            return new Promise((resolve) => {

                const elementoExistente =
                    document.querySelector(seletor);

                if (elementoExistente) {
                    resolve(elementoExistente);
                    return;
                }

                const inicio =
                    Date.now();

                const intervalo =
                    setInterval(() => {

                        const elemento =
                            document.querySelector(seletor);

                        if (elemento) {

                            clearInterval(intervalo);

                            resolve(elemento);

                            return;
                        }

                        if (
                            Date.now() - inicio >=
                            tempoMaximo
                        ) {

                            clearInterval(intervalo);

                            resolve(null);
                        }

                    }, 100);

            });
        },

        /* =====================================================
           CRIAR BACKDROP
           ===================================================== */

        criarBackdrop() {

            if (this.backdrop) {
                return;
            }

            this.backdrop =
                document.createElement("div");

            this.backdrop.className =
                "musicalworld-onboarding-backdrop";

            this.backdrop.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.appendChild(
                this.backdrop
            );
        },

        /* =====================================================
           CRIAR TOOLTIP
           ===================================================== */

        criarTooltip() {

            if (this.tooltip) {
                return;
            }

            this.tooltip =
                document.createElement("div");

            this.tooltip.className =
                "musicalworld-onboarding-tooltip";

            this.tooltip.setAttribute(
                "role",
                "dialog"
            );

            this.tooltip.setAttribute(
                "aria-label",
                "Orientação para completar o cadastro"
            );

            this.tooltip.innerHTML = `
                <button
                    type="button"
                    class="musicalworld-onboarding-close"
                    aria-label="Fechar orientação"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div class="musicalworld-onboarding-content">

                    <div class="musicalworld-onboarding-title">
                        Complete seu cadastro
                    </div>

                    <div class="musicalworld-onboarding-text">
                        Complete seu perfil para que ele possa aparecer no MusicalWorld e ser encontrado por outras pessoas. Clique em Perfil para começar.
                    </div>

                </div>
            `;

            document.body.appendChild(
                this.tooltip
            );

            /* ---------------------------------------------
               Botão fechar
               --------------------------------------------- */

            const botaoFechar =
                this.tooltip.querySelector(
                    ".musicalworld-onboarding-close"
                );

            if (botaoFechar) {

                botaoFechar.addEventListener(
                    "click",
                    async (evento) => {

                        evento.preventDefault();

                        evento.stopPropagation();

                        const salvo =
                            await this.marcarComoConcluido();

                        if (salvo) {

                            this.encerrar();

                        } else {

                            console.warn(
                                "MusicalWorldOnboarding: não foi possível confirmar a conclusão no banco."
                            );

                            /*
                             * Mesmo que o usuário feche a
                             * orientação, não mantemos o overlay
                             * preso na tela.
                             */

                            this.encerrar();
                        }

                    }
                );
            }

            /* ---------------------------------------------
               Clique no Perfil
               --------------------------------------------- */

            if (this.elementoAlvo) {

                this.elementoAlvo.addEventListener(
                    "click",
                    async (evento) => {

                        /*
                         * Impede que o menu inferior navegue
                         * imediatamente.

                         * Isso é essencial porque uma navegação
                         * instantânea pode cancelar a requisição
                         * Supabase antes que o UPDATE termine.
                         */

                        evento.preventDefault();

                        evento.stopPropagation();

                        evento.stopImmediatePropagation();

                        if (this.navegacaoEmAndamento) {
                            return;
                        }

                        this.navegacaoEmAndamento = true;

                        /*
                         * Primeiro salva no banco.
                         */

                        await this.marcarComoConcluido();

                        /*
                         * Depois encerra visualmente.
                         */

                        this.encerrar();

                        /*
                         * Aguarda um pequeno intervalo para garantir
                         * que a requisição seja finalizada antes
                         * da troca de página.
                         */

                        await new Promise((resolve) => {
                            setTimeout(resolve, 100);
                        });

                        /*
                         * Navegação definitiva para o perfil.
                         *
                         * Mantemos o destino explícito para que
                         * nenhum outro handler seja necessário.
                         */

                        window.location.href =
                            "meu-perfil.html";
                    },
                    {
                        capture: true,
                        once: true
                    }
                );
            }
        },

        /* =====================================================
           POSICIONAR TOOLTIP
           ===================================================== */

        posicionarTooltip() {

            if (
                !this.tooltip ||
                !this.elementoAlvo
            ) {
                return;
            }

            const alvo =
                this.elementoAlvo.getBoundingClientRect();

            const tooltip =
                this.tooltip.getBoundingClientRect();

            const margem =
                16;

            const distancia =
                18;

            let esquerda =
                alvo.left +
                alvo.width / 2 -
                tooltip.width / 2;

            let topo =
                alvo.top -
                tooltip.height -
                distancia;

            let abaixo =
                false;

            /* ---------------------------------------------
               Limites laterais
               --------------------------------------------- */

            const limiteEsquerdo =
                margem;

            const limiteDireito =
                window.innerWidth -
                tooltip.width -
                margem;

            esquerda =
                Math.max(
                    limiteEsquerdo,
                    Math.min(
                        esquerda,
                        limiteDireito
                    )
                );

            /* ---------------------------------------------
               Se não houver espaço acima, posiciona abaixo.
               --------------------------------------------- */

            if (
                topo <
                margem
            ) {

                topo =
                    alvo.bottom +
                    distancia;

                abaixo = true;
            }

            /* ---------------------------------------------
               Limite inferior.
               --------------------------------------------- */

            const limiteInferior =
                window.innerHeight -
                tooltip.height -
                margem;

            topo =
                Math.max(
                    margem,
                    Math.min(
                        topo,
                        limiteInferior
                    )
                );

            /* ---------------------------------------------
               Posição da seta.
               --------------------------------------------- */

            const centroAlvo =
                alvo.left +
                alvo.width / 2;

            let seta =
                centroAlvo -
                esquerda;

            const limiteSeta =
                tooltip.width -
                24;

            seta =
                Math.max(
                    24,
                    Math.min(
                        seta,
                        limiteSeta
                    )
                );

            this.tooltip.style.left =
                `${esquerda}px`;

            this.tooltip.style.top =
                `${topo}px`;

            this.tooltip.style.setProperty(
                "--onboarding-arrow-left",
                `${seta}px`
            );

            this.tooltip.classList.toggle(
                "tooltip-abaixo",
                abaixo
            );
        },

        /* =====================================================
           REDIMENSIONAMENTO
           ===================================================== */

        configurarRedimensionamento() {

            if (this.redimensionamentoConfigurado) {
                return;
            }

            this.redimensionamentoConfigurado =
                true;

            const atualizar =
                () => {

                    if (
                        !this.tooltip ||
                        !this.elementoAlvo
                    ) {
                        return;
                    }

                    this.posicionarTooltip();
                };

            window.addEventListener(
                "resize",
                atualizar
            );

            window.addEventListener(
                "orientationchange",
                atualizar
            );

            /*
             * ResizeObserver acompanha alterações no menu
             * inferior caso sua altura ou posição seja alterada.
             */

            if (
                typeof ResizeObserver !==
                "undefined"
            ) {

                this.observadorMenu =
                    new ResizeObserver(() => {
                        atualizar();
                    });

                this.observadorMenu.observe(
                    this.elementoAlvo
                );
            }
        },

        /* =====================================================
           ENCERRAR
           ===================================================== */

        encerrar() {

            if (
                this.elementoAlvo
            ) {

                this.elementoAlvo.classList.remove(
                    "musicalworld-onboarding-target"
                );
            }

            if (this.tooltip) {

                this.tooltip.classList.remove(
                    "is-visible"
                );
            }

            if (this.backdrop) {

                this.backdrop.classList.remove(
                    "is-visible"
                );
            }

            setTimeout(() => {

                if (this.tooltip) {

                    this.tooltip.remove();

                    this.tooltip =
                        null;
                }

                if (this.backdrop) {

                    this.backdrop.remove();

                    this.backdrop =
                        null;
                }

            }, 200);
        },

        /* =====================================================
           FUNÇÃO DE TESTE

           Permite reativar manualmente o onboarding para
           o usuário atualmente autenticado.

           Uso no console:

           MusicalWorldOnboarding.resetarTeste()
           ===================================================== */

        async resetarTeste() {

            const usuario =
                await this.obterUsuarioAutenticado();

            if (
                !usuario ||
                !usuario.id
            ) {

                console.warn(
                    "MusicalWorldOnboarding: usuário não autenticado."
                );

                return false;
            }

            const supabase =
                this.obterSupabaseClient();

            if (!supabase) {
                return false;
            }

            try {

                const resultado =
                    await supabase
                        .from("usuarios")
                        .update({
                            onboarding_index_concluido: false
                        })
                        .eq("id", usuario.id);

                if (resultado.error) {

                    console.error(
                        "MusicalWorldOnboarding: erro ao resetar teste.",
                        resultado.error
                    );

                    return false;
                }

                console.log(
                    "MusicalWorldOnboarding: teste resetado."
                );

                return true;

            } catch (erro) {

                console.error(
                    "MusicalWorldOnboarding: erro ao resetar teste.",
                    erro
                );

                return false;
            }
        }
    };

    /* =========================================================
       DISPONIBILIZA GLOBALMENTE
       ========================================================= */

    window.MusicalWorldOnboarding =
        MusicalWorldOnboarding;

    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                MusicalWorldOnboarding.iniciar();

            },
            {
                once: true
            }
        );

    } else {

        MusicalWorldOnboarding.iniciar();
    }

})(window);

