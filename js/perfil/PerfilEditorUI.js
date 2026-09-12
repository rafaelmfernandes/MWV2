/* ============================================================
   MUSICALWORLD — PERFIL EDITOR UI
   Arquivo: PerfilEditorUI.js
   ============================================================

   RESPONSABILIDADE:

   Este módulo é responsável exclusivamente pela INTERFACE
   do editor universal de perfil.

   Ele cuida de:

   - preencher os campos do formulário;
   - preencher o tipo artístico no select;
   - preencher e atualizar o avatar;
   - controlar o checkbox de publicação;
   - atualizar o contador da descrição;
   - atualizar visualmente informações do perfil.

   ESTE MÓDULO NÃO É RESPONSÁVEL POR:

   - consultar o Supabase;
   - salvar dados no banco;
   - controlar autenticação;
   - decidir regras de negócio;
   - fazer upload de arquivos.

   O módulo recebe o contexto do PerfilEditor.js e trabalha
   somente com os dados que já foram carregados.

   ============================================================ */

const PerfilEditorUI = (() => {

    "use strict";


    let contexto = null;


    /* ========================================================
       CONFIGURAÇÃO
       ======================================================== */

    function configurar(novoContexto) {

        contexto =
            novoContexto || null;

    }


    /* ========================================================
       ELEMENTO
       ======================================================== */

    function el(id) {

        if (
            contexto &&
            typeof contexto.el === "function"
        ) {

            return contexto.el(id);

        }


        return document.getElementById(id);

    }


    /* ========================================================
       PREENCHER TIPO ARTÍSTICO
       ======================================================== */

    function preencherTipoArtista(
        campoTipo,
        tipoBanco
    ) {

        if (!campoTipo) {

            return;

        }


        const tipoSalvo =
            String(
                tipoBanco || ""
            ).trim();


        if (!tipoSalvo) {

            return;

        }


        if (
            window.PerfilEditorTipo &&
            typeof window.PerfilEditorTipo.identificar === "function"
        ) {

            const tipo =
                window.PerfilEditorTipo.identificar(
                    tipoSalvo
                );


            if (tipo) {

                const opcoes =
                    Array.from(
                        campoTipo.options || []
                    );


                const opcao =
                    opcoes.find(
                        (opcaoAtual) => {

                            const valor =
                                String(
                                    opcaoAtual.value || ""
                                ).trim();


                            const texto =
                                String(
                                    opcaoAtual.textContent || ""
                                ).trim();


                            return (

                                valor === tipo.id ||

                                valor === tipo.slug ||

                                valor === tipo.nome ||

                                texto === tipo.nome ||

                                texto === tipo.slug

                            );

                        }
                    );


                if (opcao) {

                    campoTipo.value =
                        opcao.value;

                    return;

                }

            }

        }


        const opcaoExata =
            Array.from(
                campoTipo.options || []
            ).find(
                (opcao) =>

                    String(
                        opcao.value || ""
                    ).trim() === tipoSalvo
            );


        if (opcaoExata) {

            campoTipo.value =
                opcaoExata.value;

            return;

        }


        let tipoNormalizado =
            tipoSalvo;


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.normalizarTipoArtista === "function"
        ) {

            tipoNormalizado =
                window.PerfilUtils.normalizarTipoArtista(
                    tipoSalvo
                );

        }


        const opcaoNormalizada =
            Array.from(
                campoTipo.options || []
            ).find(
                (opcao) => {

                    const valorOpcao =
                        String(
                            opcao.value || ""
                        ).trim();


                    const textoOpcao =
                        String(
                            opcao.textContent || ""
                        ).trim();


                    let valorNormalizado =
                        valorOpcao;


                    let textoNormalizado =
                        textoOpcao;


                    if (
                        window.PerfilUtils &&
                        typeof window.PerfilUtils.normalizarTipoArtista === "function"
                    ) {

                        valorNormalizado =
                            window.PerfilUtils.normalizarTipoArtista(
                                valorOpcao
                            );


                        textoNormalizado =
                            window.PerfilUtils.normalizarTipoArtista(
                                textoOpcao
                            );

                    }


                    return (

                        valorNormalizado ===
                        tipoNormalizado ||

                        textoNormalizado ===
                        tipoNormalizado

                    );

                }
            );


        if (opcaoNormalizada) {

            campoTipo.value =
                opcaoNormalizada.value;

            return;

        }


        const limpar =
            (valor) =>

                String(
                    valor || ""
                )
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .replace(
                        /\s+/g,
                        ""
                    )
                    .toLowerCase();


        const tipoLimpo =
            limpar(
                tipoSalvo
            );


        const opcaoFlexivel =
            Array.from(
                campoTipo.options || []
            ).find(
                (opcao) =>

                    limpar(
                        opcao.value
                    ) === tipoLimpo ||

                    limpar(
                        opcao.textContent
                    ) === tipoLimpo
            );


        if (opcaoFlexivel) {

            campoTipo.value =
                opcaoFlexivel.value;

            return;

        }


        console.warn(
            "PerfilEditorUI: não foi possível localizar o tipo artístico no select:",
            tipoSalvo
        );

    }


    /* ========================================================
       PREENCHER FORMULÁRIO
       ======================================================== */

    function preencherFormulario() {

        if (!contexto) {

            console.error(
                "PerfilEditorUI: contexto não configurado."
            );

            return;

        }


        const estado =
            contexto.estado || {};


        const ids =
            contexto.ids || {};


        const usuario =
            estado.usuario || {};


        const perfil =
            estado.perfil || {};


        const artista =
            estado.perfilArtista || {};


        const campoNome =
            el(ids.nome);


        const campoNomeExibicao =
            el(ids.nomeExibicao);


        const campoTelefone =
            el(ids.telefone);


        const campoLocalizacao =
            el(ids.localizacao);


        const campoDescricao =
            el(ids.descricao);


        const campoExperiencia =
            el(ids.experiencia);


        const campoArea =
            el(ids.areaAtendimento);


        const campoTipo =
            el(ids.tipoArtista);


        const campoDisponivel =
            el(ids.disponivel);


        const campoEmail =
            el(ids.emailConta);


        if (campoNome) {

            campoNome.value =
                usuario.nome || "";

        }


        if (campoNomeExibicao) {

            campoNomeExibicao.value =
                perfil.nome_exibicao ||
                usuario.nome ||
                "";

        }


        if (campoTelefone) {

            campoTelefone.value =
                usuario.telefone || "";

        }


        if (campoLocalizacao) {

            campoLocalizacao.value =
                artista.localizacao || "";

        }


        if (campoDescricao) {

            campoDescricao.value =
                perfil.descricao || "";

        }


        if (campoExperiencia) {

            campoExperiencia.value =
                artista.experiencia || "";

        }


        if (campoArea) {

            campoArea.value =
                artista.area_atendimento || "";

        }


        if (campoTipo) {

            const tipoBanco =
                String(
                    artista.tipo_artista || ""
                ).trim();


            let tipoParaExibir =
                tipoBanco;


            if (!tipoParaExibir) {

                const tipoDaPagina =
                    window.PerfilEditorTipo &&
                    typeof window.PerfilEditorTipo.obterTipoDaPaginaAtual === "function"

                        ? window.PerfilEditorTipo.obterTipoDaPaginaAtual()

                        : null;


                tipoParaExibir =
                    tipoDaPagina?.nome ||
                    "Artista";

            }


            preencherTipoArtista(
                campoTipo,
                tipoParaExibir
            );


            if (
                !campoTipo.value &&
                tipoParaExibir
            ) {

                campoTipo.value =
                    tipoParaExibir;

            }


            if (
                !estado.perfilArtista.tipo_artista
            ) {

                estado.perfilArtista.tipo_artista =
                    tipoParaExibir;

            }

        }


        if (campoDisponivel) {

            campoDisponivel.checked =
                artista.disponivel !== false;

        }


        if (campoEmail) {

            const emailAuth =
                estado.usuarioAuth?.email ||
                estado.usuarioAuth?.user?.email ||
                "";


            const emailBanco =
                estado.usuario?.email ||
                "";


            const email =
                emailAuth ||
                emailBanco ||
                "";


            if (
                "value" in campoEmail
            ) {

                campoEmail.value =
                    email;

            } else {

                campoEmail.textContent =
                    email ||
                    "Não informado";

            }

        }


        /* ====================================================
           PUBLICAÇÃO DO PERFIL
           ====================================================

           O checkbox representa diretamente o valor salvo
           no banco.

           true  = publicado
           false = não publicado

           NÃO usamos !== false.
        */

        const campoPerfilPublicado =
            el("perfilPublicado");


        if (campoPerfilPublicado) {

            campoPerfilPublicado.checked =
                perfil.perfil_publicado === true;


            console.log(
                "PerfilEditorUI: publicação carregada do banco:",
                {
                    perfilId:
                        perfil.id,

                    perfilPublicadoBanco:
                        perfil.perfil_publicado,

                    checkboxMarcado:
                        campoPerfilPublicado.checked
                }
            );

        }


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.marcarChips === "function"
        ) {

            window.PerfilUtils.marcarChips(
                "estilos",
                artista.estilos || []
            );


            window.PerfilUtils.marcarChips(
                "servicos",
                artista.servicos || []
            );

        }


        atualizarContador();

        preencherAvatar();

    }


    /* ========================================================
       AVATAR
       ======================================================== */

    function preencherAvatar() {

        if (!contexto) {

            return;

        }


        const estado =
            contexto.estado || {};


        const ids =
            contexto.ids || {};


        const imagem =
            el(ids.avatarImage) ||
            el(ids.fotoPreview);


        const iniciais =
            el(ids.avatarInitials) ||
            el(ids.fotoPlaceholder);


        const foto =
            estado.perfilArtista?.foto_url ||
            estado.usuario?.foto_url ||
            "";


        if (foto) {

            if (imagem) {

                imagem.src =
                    foto;

                imagem.style.display =
                    "block";

            }


            if (iniciais) {

                iniciais.style.display =
                    "none";

            }


            return;

        }


        const nome =
            estado.perfil?.nome_exibicao ||
            estado.usuario?.nome ||
            "";


        const textoIniciais =
            window.PerfilUtils &&
            typeof window.PerfilUtils.obterIniciais === "function"

                ? window.PerfilUtils.obterIniciais(
                    nome
                )

                : "MW";


        if (imagem) {

            imagem.removeAttribute(
                "src"
            );

            imagem.style.display =
                "none";

        }


        if (iniciais) {

            if (
                iniciais.classList.contains(
                    "foto-placeholder"
                )
            ) {

                iniciais.style.display =
                    "flex";

            } else {

                iniciais.textContent =
                    textoIniciais;

                iniciais.style.display =
                    "flex";

            }

        }

    }


    /* ========================================================
       CONTADOR DA DESCRIÇÃO
       ======================================================== */

    function atualizarContador() {

        if (!contexto) {

            return;

        }


        const ids =
            contexto.ids || {};


        const campo =
            el(ids.descricao);


        const contador =
            el(ids.contadorDescricao);


        if (!campo || !contador) {

            return;

        }


        const quantidade =
            campo.value.length;


        contador.textContent =
            quantidade;

    }


    /* ========================================================
       ATUALIZAR CHECKBOX DE PUBLICAÇÃO
       ======================================================== */

    function atualizarPublicacaoConfirmada(
        valor
    ) {

        const checkbox =
            el("perfilPublicado");


        if (!checkbox) {

            return;

        }


        checkbox.checked =
            valor === true;

    }


    /* ========================================================
       ATUALIZAR SELECT DE TIPO
       ======================================================== */

    function atualizarTipo(
        tipo
    ) {

        if (!contexto) {

            return;

        }


        const campoTipo =
            el(
                contexto.ids?.tipoArtista
            );


        if (!campoTipo) {

            return;

        }


        preencherTipoArtista(
            campoTipo,
            tipo
        );

    }


    /* ========================================================
       API PÚBLICA
       ======================================================== */

    return {

        configurar,

        preencherFormulario,

        preencherAvatar,

        atualizarContador,

        preencherTipoArtista,

        atualizarPublicacaoConfirmada,

        atualizarTipo

    };

})();


window.PerfilEditorUI =
    PerfilEditorUI;