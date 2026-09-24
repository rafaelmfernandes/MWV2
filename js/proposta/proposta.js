 /* =========================================================
   MUSICALWORLD — CONTROLADOR PRINCIPAL DA PROPOSTA

   Arquivo:
   js/proposta/proposta.js

   Responsabilidade:
   - Inicializar o módulo de proposta.
   - Carregar o contexto do perfil contratado.
   - Inicializar o renderizador.
   - Inicializar o fluxo.
   - Expor métodos públicos para abertura da proposta.
   - Integrar o botão "Enviar proposta" do perfil público.
   - Centralizar a comunicação entre os módulos.

   Módulos utilizados:

   - proposta-dados.js
   - proposta-render.js
   - proposta-fluxo.js

   Fluxo:

   Perfil público
        ↓
   ApresentarPerfilBotoes
        ↓
   MusicalWorldProposta.abrir()
        ↓
   PropostaDados
        ↓
   PropostaRender
        ↓
   PropostaFluxo

   ========================================================= */


/* =========================================================
   1. OBJETO PRINCIPAL
   ========================================================= */

window.MusicalWorldProposta = {


    /* =====================================================
       2. ESTADO
       ===================================================== */

    estado: {

        inicializado: false,

        carregando: false,

        contexto: null,

        perfilId: null

    },


    /* =====================================================
       3. INICIALIZAR
       ===================================================== */

    async inicializar(
        perfilId = null
    ) {

        if (
            this.estado.inicializado
        ) {

            if (
                perfilId &&
                perfilId !== this.estado.perfilId
            ) {

                await this.carregarContexto(
                    perfilId
                );

            }

            return;

        }


        this.estado.perfilId =
            perfilId ||
            this.obterPerfilId();


        this.estado.inicializado =
            true;


        console.log(
            "MusicalWorldProposta inicializando..."
        );


        /*
         * O fluxo é inicializado antes da abertura.
         *
         * Dessa forma, os eventos dos botões já ficam
         * preparados quando a interface for criada.
         */

        this.inicializarFluxo();


        /*
         * O contexto só é carregado quando necessário.
         *
         * Isso evita consultas desnecessárias caso o botão
         * "Enviar proposta" nunca seja utilizado.
         */


        console.log(
            "MusicalWorldProposta inicializado."
        );

    },


    /* =====================================================
       4. INICIALIZAR FLUXO
       ===================================================== */

    inicializarFluxo() {

        const fluxo =
            this.obterFluxo();


        if (!fluxo) {

            console.error(
                "MusicalWorldProposta: módulo de fluxo não encontrado."
            );

            return;

        }


        fluxo.inicializar();

    },


    /* =====================================================
       5. ABRIR PROPOSTA
       ===================================================== */

    async abrir(
        perfilId = null
    ) {

        try {

            this.estado.carregando =
                true;


            const id =
                perfilId ||
                this.estado.perfilId ||
                this.obterPerfilId();


            if (!id) {

                throw new Error(
                    "Não foi possível identificar o perfil contratado."
                );

            }


            this.estado.perfilId =
                id;


            const contexto =
                await this.carregarContexto(
                    id
                );


            if (!contexto) {

                throw new Error(
                    "Não foi possível carregar os dados do profissional."
                );

            }


            const fluxo =
                this.obterFluxo();


            if (!fluxo) {

                throw new Error(
                    "Módulo de fluxo da proposta não encontrado."
                );

            }


            fluxo.definirContexto(
                contexto
            );


            await fluxo.abrir(
                contexto
            );


        } catch (
            erro
        ) {

            console.error(
                "MusicalWorldProposta: erro ao abrir proposta:",
                erro
            );


            this.mostrarErro(
                erro.message ||
                "Não foi possível abrir a proposta."
            );


        } finally {

            this.estado.carregando =
                false;

        }

    },


    /* =====================================================
       6. CARREGAR CONTEXTO
       ===================================================== */

    async carregarContexto(
        perfilId
    ) {

        const dados =
            this.obterDados();


        if (!dados) {

            throw new Error(
                "Módulo de dados da proposta não encontrado."
            );

        }


        const id =
            perfilId ||
            this.estado.perfilId ||
            this.obterPerfilId();


        if (!id) {

            throw new Error(
                "Perfil contratado não identificado."
            );

        }


        const contexto =
            await dados.inicializarContexto(
                id
            );


        this.estado.contexto =
            contexto;


        return contexto;

    },


    /* =====================================================
       7. OBTER ID DO PERFIL
       ===================================================== */

    obterPerfilId() {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        return (
            parametros.get("id") ||
            parametros.get("perfil_id") ||
            parametros.get("perfilId") ||
            null
        );

    },


    /* =====================================================
       8. CONECTAR BOTÃO EXTERNO
       =====================================================

       O botão do perfil público pode utilizar:

       data-acao="enviar-proposta"

       ou:

       data-enviar-proposta

       ou chamar diretamente:

       MusicalWorldProposta.abrir()
       ===================================================== */

    conectarBotaoExterno() {

        document.addEventListener(
            "click",
            event => {

                const botao =
                    event.target.closest(
                        "[data-acao='enviar-proposta'], [data-enviar-proposta]"
                    );


                if (!botao) {

                    return;

                }


                event.preventDefault();


                /*
                 * Primeiro tenta utilizar o ID explicitamente
                 * fornecido no botão.
                 */

                const perfilId =
                    botao.dataset.perfilId ||
                    botao.dataset.id ||
                    this.estado.perfilId ||
                    this.obterPerfilId();


                this.abrir(
                    perfilId
                );

            }
        );

    },


    /* =====================================================
       9. OBTENER DADOS
       ===================================================== */

    obterDados() {

        if (
            window.MusicalWorldPropostaDados
        ) {

            return window.MusicalWorldPropostaDados;

        }


        console.error(
            "MusicalWorldProposta: MusicalWorldPropostaDados não encontrado."
        );


        return null;

    },


    /* =====================================================
       10. OBTER RENDER
       ===================================================== */

    obterRender() {

        if (
            window.MusicalWorldPropostaRender
        ) {

            return window.MusicalWorldPropostaRender;

        }


        console.error(
            "MusicalWorldProposta: MusicalWorldPropostaRender não encontrado."
        );


        return null;

    },


    /* =====================================================
       11. OBTER FLUXO
       ===================================================== */

    obterFluxo() {

        if (
            window.MusicalWorldPropostaFluxo
        ) {

            return window.MusicalWorldPropostaFluxo;

        }


        console.error(
            "MusicalWorldProposta: MusicalWorldPropostaFluxo não encontrado."
        );


        return null;

    },


    /* =====================================================
       12. FECHAR PROPOSTA
       ===================================================== */

    fechar() {

        const fluxo =
            this.obterFluxo();


        if (!fluxo) {

            return;

        }


        fluxo.fechar();

    },


    /* =====================================================
       13. OBTER CONTEXTO
       ===================================================== */

    obterContexto() {

        return this.estado.contexto;

    },


    /* =====================================================
       14. MOSTRAR ERRO
       ===================================================== */

    mostrarErro(
        mensagem
    ) {

        const render =
            this.obterRender();


        if (
            render &&
            typeof render.mostrarMensagem === "function"
        ) {

            render.mostrarMensagem(
                mensagem,
                "erro"
            );

            return;

        }


        console.error(
            "MusicalWorldProposta:",
            mensagem
        );

    },


    /* =====================================================
       15. REINICIAR
       ===================================================== */

    reiniciar() {

        const fluxo =
            this.obterFluxo();


        if (fluxo) {

            fluxo.limparEstado();

        }


        const render =
            this.obterRender();


        if (render) {

            render.estado.dados = {

                servicoId: "",

                dataEvento: "",

                horarioInicio: "",

                horarioFim: "",

                valor: "",

                tipoEvento: "",

                local: null,

                observacoes: ""

            };

        }

    }

};


/* =========================================================
   16. INICIALIZAÇÃO AUTOMÁTICA
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            await window
                .MusicalWorldProposta
                .inicializar();


            window
                .MusicalWorldProposta
                .conectarBotaoExterno();


        } catch (
            erro
        ) {

            console.error(
                "MusicalWorldProposta: erro na inicialização automática:",
                erro
            );

        }

    }
);


/* =========================================================
   17. CONFIRMAÇÃO DO MÓDULO
   ========================================================= */

console.log(
    "MusicalWorldProposta carregado."
);