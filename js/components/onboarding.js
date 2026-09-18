/* =========================================================
MUSICALWORLD — ONBOARDING DO INDEX

Arquivo:
js/components/onboarding.js

Responsabilidades:

* Exibir o onboarding inicial do Index.
* Identificar o usuário autenticado pelo Supabase.
* Verificar no banco se o usuário já concluiu
  o onboarding do Index.
* Exibir a orientação somente para usuários que
  ainda não concluíram essa etapa.
* Destacar o botão Perfil no menu inferior.
* Exibir o fundo escurecido durante a orientação.
* Marcar o onboarding como concluído quando o usuário
  clicar em Perfil.
* Manter uma função de teste para desenvolvimento.

Regra principal:

* O controle NÃO utiliza sessionStorage para decidir
  se o usuário já viu o onboarding.
* O estado pertence à conta do usuário no Supabase.

Campo utilizado:
public.usuarios.onboarding_index_concluido

========================================================= */

(function (window) {


"use strict";


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

    /* -----------------------------------------------------
       Chave utilizada somente para testes locais.

       IMPORTANTE:
       Essa chave NÃO controla mais o onboarding real.
       O controle real está no Supabase.
       ----------------------------------------------------- */

    chaveTeste: "musicalworld_onboarding_index_perfil",


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async iniciar() {

        if (this.inicializado) {
            return;
        }

        this.inicializado = true;

        this.carregarCss();

        try {

            /* -------------------------------------------------
               Aguarda o menu inferior criar o botão Perfil.
               ------------------------------------------------- */

            const elementoPerfil = await this.aguardarElemento(
                "#nav-item-perfil",
                5000
            );

            if (!elementoPerfil) {

                console.warn(
                    "MusicalWorldOnboarding: botão Perfil não encontrado."
                );

                this.inicializado = false;

                return;
            }

            this.elementoAlvo = elementoPerfil;


            /* -------------------------------------------------
               Verifica o estado REAL do onboarding no Supabase.
               ------------------------------------------------- */

            const deveExibir = await this.deveExibirOnboarding();

            if (!deveExibir) {

                console.log(
                    "MusicalWorldOnboarding: onboarding já concluído para este usuário."
                );

                return;
            }


            /* -------------------------------------------------
               Cria os elementos visuais.
               ------------------------------------------------- */

            this.criarBackdrop();

            this.criarTooltip();

            this.posicionarTooltip();

            this.elementoAlvo.classList.add(
                "musicalworld-onboarding-target"
            );

            this.configurarRedimensionamento();


            /* -------------------------------------------------
               Exibe somente depois que tudo estiver posicionado.
               ------------------------------------------------- */

            window.requestAnimationFrame(() => {

                if (this.backdrop) {
                    this.backdrop.classList.add("is-visible");
                }

                if (this.tooltip) {
                    this.tooltip.classList.add("is-visible");
                }

            });

        } catch (erro) {

            console.error(
                "MusicalWorldOnboarding: erro ao iniciar onboarding.",
                erro
            );

            this.inicializado = false;
        }
    },


    /* =====================================================
       OBTER CLIENTE SUPABASE
       ===================================================== */

    obterSupabaseClient() {

        try {

            if (
                window.SupabaseClient &&
                typeof window.SupabaseClient.getClient === "function"
            ) {
                return window.SupabaseClient.getClient();
            }

            if (
                window.SupabaseClient &&
                window.SupabaseClient.client
            ) {
                return window.SupabaseClient.client;
            }

            if (
                window.supabaseClient &&
                typeof window.supabaseClient.from === "function"
            ) {
                return window.supabaseClient;
            }

            return null;

        } catch (erro) {

            console.error(
                "MusicalWorldOnboarding: erro ao obter cliente Supabase.",
                erro
            );

            return null;
        }
    },


    /* =====================================================
       OBTER USUÁRIO AUTENTICADO
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

            const {
                data,
                error
            } = await supabase.auth.getUser();

            if (error) {

                console.error(
                    "MusicalWorldOnboarding: erro ao obter usuário autenticado.",
                    error
                );

                return null;
            }

            return data?.user || null;

        } catch (erro) {

            console.error(
                "MusicalWorldOnboarding: falha ao consultar usuário autenticado.",
                erro
            );

            return null;
        }
    },


    /* =====================================================
       VERIFICAR SE DEVE EXIBIR
       ===================================================== */

    async deveExibirOnboarding() {

        const supabase = this.obterSupabaseClient();

        if (!supabase) {

            console.warn(
                "MusicalWorldOnboarding: Supabase indisponível. Onboarding não será exibido."
            );

            return false;
        }


        const usuario = await this.obterUsuarioAutenticado();

        if (!usuario) {

            console.log(
                "MusicalWorldOnboarding: nenhum usuário autenticado."
            );

            return false;
        }


        try {

            const {
                data,
                error
            } = await supabase
                .from("usuarios")
                .select("onboarding_index_concluido")
                .eq("id", usuario.id)
                .maybeSingle();


            /* ---------------------------------------------
               Caso exista erro na consulta.
               --------------------------------------------- */

            if (error) {

                console.error(
                    "MusicalWorldOnboarding: erro ao consultar estado do onboarding.",
                    error
                );

                return false;
            }


            /* ---------------------------------------------
               Segurança:

               Se o registro do usuário ainda não existir,
               não exibimos automaticamente.

               O trigger de criação do usuário normalmente
               deverá criar esse registro.
               --------------------------------------------- */

            if (!data) {

                console.warn(
                    "MusicalWorldOnboarding: registro do usuário não encontrado."
                );

                return false;
            }


            /* ---------------------------------------------
               TRUE:
               usuário já concluiu.
               --------------------------------------------- */

            if (data.onboarding_index_concluido === true) {

                return false;
            }


            /* ---------------------------------------------
               FALSE ou NULL:
               usuário ainda não concluiu.
               --------------------------------------------- */

            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldOnboarding: erro ao verificar onboarding.",
                erro
            );

            return false;
        }
    },


    /* =====================================================
       MARCAR ONBOARDING COMO CONCLUÍDO
       ===================================================== */

    async marcarComoConcluido() {

        const supabase = this.obterSupabaseClient();

        if (!supabase) {

            console.error(
                "MusicalWorldOnboarding: cliente Supabase não encontrado ao concluir onboarding."
            );

            return false;
        }


        const usuario = await this.obterUsuarioAutenticado();

        if (!usuario) {

            console.warn(
                "MusicalWorldOnboarding: usuário não autenticado ao concluir onboarding."
            );

            return false;
        }


        try {

            const {
                error
            } = await supabase
                .from("usuarios")
                .update({
                    onboarding_index_concluido: true
                })
                .eq("id", usuario.id);


            if (error) {

                console.error(
                    "MusicalWorldOnboarding: erro ao salvar conclusão.",
                    error
                );

                return false;
            }


            console.log(
                "MusicalWorldOnboarding: onboarding marcado como concluído."
            );

            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldOnboarding: falha ao salvar conclusão.",
                erro
            );

            return false;
        }
    },


    /* =====================================================
       CARREGAR CSS
       ===================================================== */

    carregarCss() {

        const href = "css/components/onboarding.css";

        const cssExistente = Array.from(
            document.querySelectorAll('link[rel="stylesheet"]')
        ).find(link => link.href.includes(href));

        if (cssExistente) {
            return;
        }

        const link = document.createElement("link");

        link.rel = "stylesheet";
        link.href = href;

        document.head.appendChild(link);
    },


    /* =====================================================
       AGUARDAR ELEMENTO
       ===================================================== */

    aguardarElemento(seletor, timeout = 5000) {

        return new Promise(resolve => {

            const inicio = Date.now();

            const verificar = () => {

                const elemento = document.querySelector(seletor);

                if (elemento) {

                    resolve(elemento);

                    return;
                }


                if (Date.now() - inicio >= timeout) {

                    resolve(null);

                    return;
                }


                window.requestAnimationFrame(verificar);
            };

            verificar();
        });
    },


    /* =====================================================
       CRIAR BACKDROP
       ===================================================== */

    criarBackdrop() {

        if (this.backdrop) {
            return;
        }

        const existente = document.querySelector(
            ".musicalworld-onboarding-backdrop"
        );

        if (existente) {

            this.backdrop = existente;

            return;
        }


        const backdrop = document.createElement("div");

        backdrop.className =
            "musicalworld-onboarding-backdrop";


        document.body.appendChild(backdrop);

        this.backdrop = backdrop;
    },


    /* =====================================================
       CRIAR TOOLTIP
       ===================================================== */

    criarTooltip() {

        if (this.tooltip) {
            return;
        }

        const existente = document.querySelector(
            ".musicalworld-onboarding-tooltip"
        );

        if (existente) {

            this.tooltip = existente;

            return;
        }


        const tooltip = document.createElement("div");

        tooltip.className =
            "musicalworld-onboarding-tooltip";

        tooltip.setAttribute(
            "role",
            "dialog"
        );

        tooltip.setAttribute(
            "aria-label",
            "Orientação para completar o cadastro"
        );


        tooltip.innerHTML = `
            <button
                type="button"
                class="musicalworld-onboarding-close"
                aria-label="Fechar orientação"
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
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
                    Complete seu perfil para que ele possa aparecer
                    no MusicalWorld e ser encontrado por outras pessoas.
                    Clique em Perfil para começar.
                </div>

            </div>
        `;


        document.body.appendChild(tooltip);

        this.tooltip = tooltip;


        /* -------------------------------------------------
           Botão fechar.

           Fechar a orientação também é considerado uma
           conclusão da etapa, para que ela não volte.
           ------------------------------------------------- */

        const botaoFechar = tooltip.querySelector(
            ".musicalworld-onboarding-close"
        );

        if (botaoFechar) {

            botaoFechar.addEventListener(
                "click",
                async evento => {

                    evento.preventDefault();
                    evento.stopPropagation();

                    await this.marcarComoConcluido();

                    this.encerrar();
                }
            );
        }


        /* -------------------------------------------------
           Clique no Perfil.

           Primeiro salva a conclusão e depois permite
           que o menu inferior execute sua navegação.
           ------------------------------------------------- */

        if (this.elementoAlvo) {

            this.elementoAlvo.addEventListener(
                "click",
                async evento => {

                    /*
                     * Não usamos preventDefault aqui porque
                     * o próprio menu inferior já possui sua
                     * lógica de navegação.
                     */

                    await this.marcarComoConcluido();

                    this.encerrar();

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

        if (!this.tooltip || !this.elementoAlvo) {
            return;
        }


        const alvo = this.elementoAlvo.getBoundingClientRect();

        const larguraTooltip =
            this.tooltip.offsetWidth;

        const alturaTooltip =
            this.tooltip.offsetHeight;

        const margem = 12;

        const espaco = 16;


        /* -------------------------------------------------
           Centro horizontal do botão Perfil.
           ------------------------------------------------- */

        const centroAlvo =
            alvo.left + (alvo.width / 2);


        /* -------------------------------------------------
           Centraliza inicialmente o tooltip sobre o alvo.
           ------------------------------------------------- */

        let esquerda =
            centroAlvo - (larguraTooltip / 2);


        /* -------------------------------------------------
           Mantém dentro da tela.
           ------------------------------------------------- */

        esquerda = Math.max(
            margem,
            Math.min(
                esquerda,
                window.innerWidth -
                larguraTooltip -
                margem
            )
        );


        /* -------------------------------------------------
           Tenta posicionar acima do botão.
           ------------------------------------------------- */

        let topo =
            alvo.top -
            alturaTooltip -
            espaco;


        let tooltipAbaixo = false;


        /* -------------------------------------------------
           Se não houver espaço acima, coloca abaixo.
           ------------------------------------------------- */

        if (topo < margem) {

            topo =
                alvo.bottom +
                espaco;

            tooltipAbaixo = true;
        }


        /* -------------------------------------------------
           Limita verticalmente.
           ------------------------------------------------- */

        topo = Math.max(
            margem,
            Math.min(
                topo,
                window.innerHeight -
                alturaTooltip -
                margem
            )
        );


        this.tooltip.style.left =
            `${esquerda}px`;

        this.tooltip.style.top =
            `${topo}px`;


        /* -------------------------------------------------
           Calcula a posição EXATA da seta.

           Isso garante que a seta aponte para o botão
           Perfil mesmo quando o tooltip precisa ser
           deslocado para não sair da tela.
           ------------------------------------------------- */

        const seta =
            centroAlvo - esquerda;


        const setaMinima = 18;

        const setaMaxima =
            larguraTooltip - 18;


        const setaCorrigida =
            Math.max(
                setaMinima,
                Math.min(
                    seta,
                    setaMaxima
                )
            );


        this.tooltip.style.setProperty(
            "--onboarding-arrow-left",
            `${setaCorrigida}px`
        );


        this.tooltip.classList.toggle(
            "tooltip-abaixo",
            tooltipAbaixo
        );
    },


    /* =====================================================
       REDIMENSIONAMENTO
       ===================================================== */

    configurarRedimensionamento() {

        if (this.redimensionamentoConfigurado) {
            return;
        }

        this.redimensionamentoConfigurado = true;


        const atualizar = () => {

            if (!this.tooltip) {
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
    },


    /* =====================================================
       ENCERRAR
       ===================================================== */

    encerrar() {

        if (
            this.elementoAlvo &&
            this.elementoAlvo.classList
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


        window.setTimeout(() => {

            if (this.tooltip) {

                this.tooltip.remove();

                this.tooltip = null;
            }


            if (this.backdrop) {

                this.backdrop.remove();

                this.backdrop = null;
            }

        }, 180);
    },


    /* =====================================================
       TESTE — RESETAR PARA O USUÁRIO ATUAL
       =====================================================

       Esta função é diferente da lógica real.

       Como agora o estado está no banco, apagar
       sessionStorage NÃO é suficiente.

       Para testar novamente com a mesma conta,
       esta função altera temporariamente o banco para
       false.

       Depois disso, basta chamar:

       MusicalWorldOnboarding.iniciar();

       ===================================================== */

    async resetarTeste() {

        const supabase = this.obterSupabaseClient();

        if (!supabase) {

            console.error(
                "MusicalWorldOnboarding: cliente Supabase não encontrado."
            );

            return false;
        }


        const usuario = await this.obterUsuarioAutenticado();

        if (!usuario) {

            console.error(
                "MusicalWorldOnboarding: nenhum usuário autenticado."
            );

            return false;
        }


        try {

            const {
                error
            } = await supabase
                .from("usuarios")
                .update({
                    onboarding_index_concluido: false
                })
                .eq("id", usuario.id);


            if (error) {

                console.error(
                    "MusicalWorldOnboarding: erro ao resetar teste.",
                    error
                );

                return false;
            }


            console.log(
                "MusicalWorldOnboarding: teste resetado. Recarregue o Index."
            );

            return true;

        } catch (erro) {

            console.error(
                "MusicalWorldOnboarding: falha ao resetar teste.",
                erro
            );

            return false;
        }
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

if (document.readyState === "loading") {

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
