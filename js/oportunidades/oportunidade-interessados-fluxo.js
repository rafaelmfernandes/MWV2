/* =========================================================
   MUSICALWORLD — FLUXO DA GESTÃO DE INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados-fluxo.js

   Responsabilidade:

   - Controlar as ações da interface.
   - Abrir confirmação de seleção.
   - Executar seleção.
   - Atualizar a interface após seleção.
   - Encaminhar o usuário para o perfil do artista.
   - Manter o fluxo de contratação separado desta etapa.

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

            return;

        }


        if (
            interessado.status !==
            "interessado"
        ) {

            return;

        }


        window.MusicalWorldOportunidadeInteressadosRender
            .abrirModalSelecao(
                interessado
            );

    }


    /* =====================================================
       CONFIRMAR SELEÇÃO
       ===================================================== */

    async function confirmarSelecao() {

        const interessado =
            window.MusicalWorldOportunidadeInteressadosRender
                .obterInteressadoDoModal();


        if (!interessado) {

            return;

        }


        const oportunidadeId =
            estado?.oportunidade?.id;


        if (!oportunidadeId) {

            return;

        }


        const botao =
            elemento("btnConfirmarSelecao");


        if (botao) {

            botao.disabled =
                true;

            botao.textContent =
                "Selecionando...";

        }


        try {

            const atualizado =
                await window
                    .MusicalWorldOportunidadeInteressadosDados
                    .selecionarArtista(
                        oportunidadeId,
                        interessado.id
                    );


            window
                .MusicalWorldOportunidadeInteressadosRender
                .atualizarInteressado(
                    atualizado
                );


            window
                .MusicalWorldOportunidadeInteressadosRender
                .fecharModalSelecao();


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
                    "Selecionar artista";

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
            document.getElementById(
                "feedbackOportunidadeInteressados"
            );


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


        window.setTimeout(() => {

            elementoFeedback.hidden =
                true;

        }, 4500);

    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    function registrarEventos() {

        const lista =
            elemento("interessadosLista");


        if (lista) {

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


                    solicitarSelecao(
                        botao.dataset.interessadoId
                    );

                }
            );

        }


        document
            .querySelectorAll(".filtro-interessados")
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        window
                            .MusicalWorldOportunidadeInteressadosRender
                            .definirFiltro(
                                botao.dataset.filtro
                            );

                    }
                );

            });


        const confirmar =
            elemento("btnConfirmarSelecao");


        if (confirmar) {

            confirmar.addEventListener(
                "click",
                confirmarSelecao
            );

        }


        const cancelar =
            elemento("btnCancelarSelecao");


        if (cancelar) {

            cancelar.addEventListener(
                "click",
                () => {

                    window
                        .MusicalWorldOportunidadeInteressadosRender
                        .fecharModalSelecao();

                }
            );

        }


        const fechar =
            elemento("btnFecharModalSelecao");


        if (fechar) {

            fechar.addEventListener(
                "click",
                () => {

                    window
                        .MusicalWorldOportunidadeInteressadosRender
                        .fecharModalSelecao();

                }
            );

        }


        document
            .querySelectorAll("[data-modal-fechar]")
            .forEach(elementoModal => {

                elementoModal.addEventListener(
                    "click",
                    () => {

                        window
                            .MusicalWorldOportunidadeInteressadosRender
                            .fecharModalSelecao();

                    }
                );

            });


        document.addEventListener(
            "keydown",
            evento => {

                if (
                    evento.key !== "Escape"
                ) {

                    return;

                }


                window
                    .MusicalWorldOportunidadeInteressadosRender
                    .fecharModalSelecao();

            }
        );

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