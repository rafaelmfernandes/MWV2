
/* =========================================================
   MUSICALWORLD — FLUXO DA GESTÃO DE INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados-fluxo.js

   Responsabilidade:

   - Controlar as ações da interface.
   - Controlar os filtros.
   - Abrir confirmação de seleção.
   - Executar seleção.
   - Atualizar a interface após seleção.
   - Encaminhar o usuário para o perfil do artista.
   - Fechar o modal de seleção.
   - Manter o fluxo de contratação separado desta etapa.

   Observação:

   Este módulo não acessa diretamente o Supabase.
   As operações de dados são realizadas pelo módulo:

   js/oportunidades/oportunidade-interessados-dados.js

   ========================================================= */

window.MusicalWorldOportunidadeInteressadosFluxo = (() => {

    let estado = null;



    /* =====================================================
       ELEMENTO
       ===================================================== */

    function elemento(id) {

        return document.getElementById(id);

    }



    /* =====================================================
       INICIALIZAR
       ===================================================== */

    function inicializar(
        estadoInicial
    ) {

        estado =
            estadoInicial;

    }



    /* =====================================================
       OBTER INTERESSADO
       ===================================================== */

    function obterInteressado(
        interessadoId
    ) {

        return estado?.interessados?.find(
            item =>
                String(item.id) ===
                String(interessadoId)
        ) || null;

    }



    /* =====================================================
       SOLICITAR SELEÇÃO
       ===================================================== */

    function solicitarSelecao(
        interessadoId
    ) {

        const interessado =
            obterInteressado(
                interessadoId
            );


        if (!interessado) {

            console.warn(
                "MusicalWorld — interessado não encontrado:",
                interessadoId
            );

            return;

        }


        /*
         * Somente artistas com status "interessado"
         * podem ser selecionados.
         */

        if (
            interessado.status !==
            "interessado"
        ) {

            return;

        }


        const render =
            window.MusicalWorldOportunidadeInteressadosRender;


        if (
            !render ||
            typeof render.abrirModalSelecao !==
            "function"
        ) {

            console.error(
                "MusicalWorld — módulo de renderização não encontrado."
            );

            return;

        }


        render.abrirModalSelecao(
            interessado
        );

    }



    /* =====================================================
       CONFIRMAR SELEÇÃO
       ===================================================== */

    async function confirmarSelecao() {

        const render =
            window.MusicalWorldOportunidadeInteressadosRender;


        if (!render) {

            return;

        }


        const interessado =
            render.obterInteressadoDoModal();


        if (!interessado) {

            return;

        }


        const oportunidadeId =
            estado?.oportunidade?.id;


        if (!oportunidadeId) {

            mostrarFeedback(
                "Oportunidade não encontrada.",
                true
            );

            return;

        }


        const botao =
            elemento(
                "btnConfirmarSelecao"
            );


        if (botao) {

            botao.disabled =
                true;

            botao.textContent =
                "Selecionando...";

        }


        try {

            const dados =
                window.MusicalWorldOportunidadeInteressadosDados;


            if (
                !dados ||
                typeof dados.selecionarArtista !==
                "function"
            ) {

                throw new Error(
                    "Módulo de dados dos interessados não encontrado."
                );

            }


            const atualizado =
                await dados.selecionarArtista(
                    oportunidadeId,
                    interessado.id
                );


            /*
             * O módulo de dados retorna um objeto contendo:
             *
             * {
             *     interessado,
             *     contratacao
             * }
             *
             * O módulo de renderização precisa receber
             * somente o interessado atualizado, pois é esse
             * registro que deve ser atualizado na lista.
             */

            render.atualizarInteressado(
                atualizado.interessado
            );


            render.fecharModalSelecao();


            mostrarFeedback(
                "Artista selecionado com sucesso."
            );

        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao selecionar artista:",
                erro
            );


            mostrarFeedback(
                erro?.message ||
                "Não foi possível selecionar o artista.",
                true
            );

        } finally {

            if (botao) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Confirmar seleção";

            }

        }

    }



    /* =====================================================
       FEEDBACK
       ===================================================== */

    function mostrarFeedback(
        mensagem,
        erro = false
    ) {

        const elementoFeedback =
            elemento(
                "feedbackOportunidadeInteressados"
            );


        /*
         * O HTML atual ainda não possui um elemento
         * específico para feedback.
         *
         * Enquanto ele não existir, registramos
         * a mensagem no console.
         */

        if (!elementoFeedback) {

            if (erro) {

                console.error(
                    mensagem
                );

            } else {

                console.log(
                    mensagem
                );

            }

            return;

        }


        elementoFeedback.textContent =
            mensagem;


        elementoFeedback.classList.toggle(
            "erro",
            erro
        );


        elementoFeedback.hidden =
            false;


        window.setTimeout(
            () => {

                elementoFeedback.hidden =
                    true;

            },
            4500
        );

    }



    /* =====================================================
       OBTER FILTRO PELO BOTÃO
       ===================================================== */

    function obterFiltroDoBotao(
        botao
    ) {

        if (!botao) {

            return "todos";

        }


        const mapa = {

            filtroTodos:
                "todos",

            filtroInteressados:
                "interessados",

            filtroSelecionado:
                "selecionado"

        };


        return mapa[botao.id] ||
            "todos";

    }



    /* =====================================================
       EVENTO DOS FILTROS
       ===================================================== */

    function registrarEventosFiltros() {

        document
            .querySelectorAll(".oi-filtro")
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        const filtro =
                            obterFiltroDoBotao(
                                botao
                            );


                        const render =
                            window
                                .MusicalWorldOportunidadeInteressadosRender;


                        if (
                            !render ||
                            typeof render.definirFiltro !==
                            "function"
                        ) {

                            return;

                        }


                        render.definirFiltro(
                            filtro
                        );

                    }
                );

            });

    }



    /* =====================================================
       EVENTO DA LISTA
       ===================================================== */

    function registrarEventoLista() {

        const lista =
            elemento(
                "interessadosLista"
            );


        if (!lista) {

            return;

        }


        /*
         * Delegação de eventos.
         *
         * A lista é renderizada dinamicamente,
         * então o evento fica no elemento pai.
         */

        lista.addEventListener(
            "click",
            evento => {

                const botao =
                    evento.target.closest(
                        ".btn-selecionar-artista"
                    );


                if (!botao) {

                    return;

                }


                const interessadoId =
                    botao.dataset.interessadoId;


                solicitarSelecao(
                    interessadoId
                );

            }
        );

    }



    /* =====================================================
       BOTÃO CONFIRMAR
       ===================================================== */

    function registrarEventoConfirmar() {

        const confirmar =
            elemento(
                "btnConfirmarSelecao"
            );


        if (!confirmar) {

            return;

        }


        confirmar.addEventListener(
            "click",
            confirmarSelecao
        );

    }



    /* =====================================================
       BOTÃO CANCELAR
       ===================================================== */

    function registrarEventoCancelar() {

        const cancelar =
            elemento(
                "btnCancelarSelecao"
            );


        if (!cancelar) {

            return;

        }


        cancelar.addEventListener(
            "click",
            () => {

                const render =
                    window
                        .MusicalWorldOportunidadeInteressadosRender;


                if (render) {

                    render.fecharModalSelecao();

                }

            }
        );

    }



    /* =====================================================
       BOTÃO FECHAR MODAL
       ===================================================== */

    function registrarEventoFecharModal() {

        const fechar =
            elemento(
                "btnFecharModalSelecao"
            );


        if (!fechar) {

            return;

        }


        fechar.addEventListener(
            "click",
            () => {

                const render =
                    window
                        .MusicalWorldOportunidadeInteressadosRender;


                if (render) {

                    render.fecharModalSelecao();

                }

            }
        );

    }



    /* =====================================================
       FECHAR CLICANDO NO OVERLAY
       ===================================================== */

    function registrarEventoOverlay() {

        const overlay =
            document.querySelector(
                "#modalSelecao .oi-modal-overlay"
            );


        if (!overlay) {

            return;

        }


        overlay.addEventListener(
            "click",
            () => {

                const render =
                    window
                        .MusicalWorldOportunidadeInteressadosRender;


                if (render) {

                    render.fecharModalSelecao();

                }

            }
        );

    }



    /* =====================================================
       FECHAR COM ESC
       ===================================================== */

    function registrarEventoEscape() {

        document.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key !==
                    "Escape"
                ) {

                    return;

                }


                const modal =
                    elemento(
                        "modalSelecao"
                    );


                if (
                    !modal ||
                    modal.hidden
                ) {

                    return;

                }


                const render =
                    window
                        .MusicalWorldOportunidadeInteressadosRender;


                if (render) {

                    render.fecharModalSelecao();

                }

            }
        );

    }



    /* =====================================================
       REGISTRAR TODOS OS EVENTOS
       ===================================================== */

    function registrarEventos() {

        registrarEventoLista();

        registrarEventosFiltros();

        registrarEventoConfirmar();

        registrarEventoCancelar();

        registrarEventoFecharModal();

        registrarEventoOverlay();

        registrarEventoEscape();

    }



    /* =====================================================
       EXPORTAÇÃO
       ===================================================== */

    return {

        inicializar,

        registrarEventos,

        solicitarSelecao,

        confirmarSelecao

    };

})();

