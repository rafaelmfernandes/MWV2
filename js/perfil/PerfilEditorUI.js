/* ============================================================
   MUSICALWORLD — PERFIL EDITOR UI

   Arquivo:
   js/perfil/PerfilEditorUI.js

   Responsabilidade:

   Este módulo é responsável exclusivamente pela INTERFACE
   do editor universal de perfil.

   Ele cuida de:

   * preencher os campos do formulário;
   * identificar visualmente o tipo de perfil;
   * preencher o tipo artístico no select;
   * preencher dados específicos de estabelecimento;
   * preencher e atualizar o avatar;
   * controlar o checkbox de publicação;
   * atualizar o contador da descrição;
   * mostrar ou ocultar campos específicos por tipo;
   * atualizar visualmente informações do perfil.

   TIPOS DE PERFIL SUPORTADOS:

   * artista
   * contratante
   * estabelecimento

   REGRAS:

   ARTISTA:

   * possui campos artísticos;
   * possui tipo de artista;
   * possui área de atendimento;
   * possui experiência;
   * possui estilos;
   * possui instrumentos;
   * possui disponibilidade;
   * possui serviços.

   CONTRATANTE:

   * possui apenas os dados comuns;
   * NÃO utiliza dados de perfis_artistas;
   * NÃO exibe campos artísticos;
   * NÃO exibe Serviços.

   ESTABELECIMENTO:

   * possui os dados comuns;
   * possui dados específicos em perfis_estabelecimentos;
   * NÃO utiliza dados de perfis_artistas;
   * NÃO exibe campos exclusivos de artista;
   * NÃO exibe Serviços de artista;
   * pode utilizar campos específicos de endereço,
     contato comercial e estrutura.

   ESTE MÓDULO NÃO É RESPONSÁVEL POR:

   * consultar o Supabase;
   * salvar dados no banco;
   * controlar autenticação;
   * decidir regras de negócio;
   * fazer upload de arquivos.

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
   IDENTIFICAR TIPO DO PERFIL
   ========================================================

   Retorna:

   "artista"
   "contratante"
   "estabelecimento"

   A prioridade é dada ao valor já calculado pelo
   PerfilEditorDados.js.

   ======================================================== */

function obterTipoPerfil() {

    if (!contexto) {

        return "";

    }


    const estado =
        contexto.estado || {};


    const tipo =
        String(
            estado.tipoPerfil || ""
        )
            .trim()
            .toLowerCase();


    if (
        tipo === "artista" ||
        tipo === "contratante" ||
        tipo === "estabelecimento"
    ) {

        return tipo;

    }


    if (estado.isArtista === true) {

        return "artista";

    }


    if (estado.isEstabelecimento === true) {

        return "estabelecimento";

    }


    if (estado.isContratante === true) {

        return "contratante";

    }


    return "";

}


/* ========================================================
   VERIFICAR SE É ARTISTA
   ======================================================== */

function ehArtista() {

    return obterTipoPerfil() === "artista";

}


/* ========================================================
   VERIFICAR SE É CONTRATANTE
   ======================================================== */

function ehContratante() {

    return obterTipoPerfil() === "contratante";

}


/* ========================================================
   VERIFICAR SE É ESTABELECIMENTO
   ======================================================== */

function ehEstabelecimento() {

    return obterTipoPerfil() === "estabelecimento";

}


/* ========================================================
   CONTROLAR CAMPOS POR TIPO DE PERFIL
   ========================================================

   Elementos do HTML podem utilizar:

   data-perfil-somente="artista"
   data-perfil-somente="contratante"
   data-perfil-somente="estabelecimento"

   Exemplo:

   <div data-perfil-somente="estabelecimento">

   Também funciona em:

   - campo;
   - seção;
   - card;
   - aba;
   - painel.

   O elemento inteiro será ocultado quando não
   corresponder ao tipo atual.

   ======================================================== */

function atualizarInterfacePorTipoPerfil() {

    if (!contexto) {

        return;

    }


    const tipo =
        obterTipoPerfil();


    if (!tipo) {

        return;

    }


    const elementos =
        document.querySelectorAll(
            "[data-perfil-somente]"
        );


    elementos.forEach(
        (elemento) => {

            const somente =
                String(
                    elemento.dataset.perfilSomente || ""
                )
                    .trim()
                    .toLowerCase();


            const deveExibir =
                somente === tipo;


            elemento.hidden =
                !deveExibir;


            elemento.style.display =
                deveExibir
                    ? ""
                    : "none";

        }
    );


    /* ====================================================
       CONTROLE ESPECÍFICO DA ABA DE SERVIÇOS
       ====================================================

       Serviços continuam sendo exclusivos de artistas.

       Caso o HTML ainda não tenha recebido
       data-perfil-somente="artista" na aba/painel,
       fazemos uma proteção adicional pelos IDs.

       ==================================================== */

    if (
        ehContratante() ||
        ehEstabelecimento()
    ) {

        const idsServicos = [

            "abaServicos",
            "tabServicos",
            "servicosTab",
            "painelServicos",
            "servicosPanel",
            "aba-servicos",
            "painel-servicos"

        ];


        idsServicos.forEach(
            (id) => {

                const elemento =
                    document.getElementById(id);


                if (!elemento) {

                    return;

                }


                elemento.hidden =
                    true;

                elemento.style.display =
                    "none";

            }
        );

    }

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
   PREENCHER DADOS DO ESTABELECIMENTO
   ========================================================

   Os dados são provenientes de:

   estado.perfilEstabelecimento

   Tabela:

   public.perfis_estabelecimentos

   Os campos são preenchidos somente quando os respectivos
   elementos existem no HTML.

   Isso permite adaptar primeiro o JavaScript e adicionar
   os campos visuais posteriormente sem gerar erros.

   ======================================================== */

function preencherDadosEstabelecimento() {

    if (!contexto) {

        return;

    }


    if (!ehEstabelecimento()) {

        return;

    }


    const estado =
        contexto.estado || {};


    const estabelecimento =
        estado.perfilEstabelecimento || {};


    const ids =
        contexto.ids || {};


    const campos = {

        endereco:
            ids.enderecoEstabelecimento ||
            ids.endereco,

        numero:
            ids.numeroEstabelecimento ||
            ids.numero,

        bairro:
            ids.bairroEstabelecimento ||
            ids.bairro,

        cidade:
            ids.cidadeEstabelecimento ||
            ids.cidade,

        estado:
            ids.estadoEstabelecimento ||
            ids.estado,

        cep:
            ids.cepEstabelecimento ||
            ids.cep,

        telefoneComercial:
            ids.telefoneComercial ||
            ids.telefoneEstabelecimento,

        instagram:
            ids.instagramEstabelecimento ||
            ids.instagram,

        site:
            ids.siteEstabelecimento ||
            ids.site,

        capacidade:
            ids.capacidadeEstabelecimento ||
            ids.capacidade,

        estrutura:
            ids.estruturaEstabelecimento ||
            ids.estrutura,

        estilosMusicais:
            ids.estilosMusicais ||
            ids.estilosMusicaisEstabelecimento,

        aceitaMusicaAoVivo:
            ids.aceitaMusicaAoVivo ||
            ids.aceitaMusicaAoVivoEstabelecimento

    };


    /* ====================================================
       ENDEREÇO
       ==================================================== */

    const campoEndereco =
        el(campos.endereco);


    if (campoEndereco) {

        campoEndereco.value =
            estabelecimento.endereco || "";

    }


    /* ====================================================
       NÚMERO
       ==================================================== */

    const campoNumero =
        el(campos.numero);


    if (campoNumero) {

        campoNumero.value =
            estabelecimento.numero || "";

    }


    /* ====================================================
       BAIRRO
       ==================================================== */

    const campoBairro =
        el(campos.bairro);


    if (campoBairro) {

        campoBairro.value =
            estabelecimento.bairro || "";

    }


    /* ====================================================
       CIDADE
       ==================================================== */

    const campoCidade =
        el(campos.cidade);


    if (campoCidade) {

        campoCidade.value =
            estabelecimento.cidade || "";

    }


    /* ====================================================
       ESTADO
       ==================================================== */

    const campoEstado =
        el(campos.estado);


    if (campoEstado) {

        campoEstado.value =
            estabelecimento.estado || "";

    }


    /* ====================================================
       CEP
       ==================================================== */

    const campoCep =
        el(campos.cep);


    if (campoCep) {

        campoCep.value =
            estabelecimento.cep || "";

    }


    /* ====================================================
       TELEFONE COMERCIAL
       ==================================================== */

    const campoTelefoneComercial =
        el(campos.telefoneComercial);


    if (campoTelefoneComercial) {

        campoTelefoneComercial.value =
            estabelecimento.telefone_comercial || "";

    }


    /* ====================================================
       INSTAGRAM
       ==================================================== */

    const campoInstagram =
        el(campos.instagram);


    if (campoInstagram) {

        campoInstagram.value =
            estabelecimento.instagram || "";

    }


    /* ====================================================
       SITE
       ==================================================== */

    const campoSite =
        el(campos.site);


    if (campoSite) {

        campoSite.value =
            estabelecimento.site || "";

    }


    /* ====================================================
       CAPACIDADE
       ==================================================== */

    const campoCapacidade =
        el(campos.capacidade);


    if (campoCapacidade) {

        campoCapacidade.value =
            estabelecimento.capacidade ??
            "";

    }


    /* ====================================================
       ESTRUTURA
       ==================================================== */

    const campoEstrutura =
        el(campos.estrutura);


    if (campoEstrutura) {

        campoEstrutura.value =
            estabelecimento.estrutura || "";

    }


    /* ====================================================
       ESTILOS MUSICAIS
       ==================================================== */

    const campoEstilosMusicais =
        el(campos.estilosMusicais);


    if (campoEstilosMusicais) {

        campoEstilosMusicais.value =
            estabelecimento.estilos_musicais || "";

    }


    /* ====================================================
       ACEITA MÚSICA AO VIVO
       ==================================================== */

    const campoAceitaMusicaAoVivo =
        el(campos.aceitaMusicaAoVivo);


    if (campoAceitaMusicaAoVivo) {

        campoAceitaMusicaAoVivo.checked =
            estabelecimento.aceita_musica_ao_vivo === true;

    }

}


/* ========================================================
   LIMPAR CAMPOS DE ESTABELECIMENTO
   ======================================================== */

function limparDadosEstabelecimento() {

    if (!contexto) {

        return;

    }


    const ids =
        contexto.ids || {};


    const campos = [

        ids.enderecoEstabelecimento ||
        ids.endereco,

        ids.numeroEstabelecimento ||
        ids.numero,

        ids.bairroEstabelecimento ||
        ids.bairro,

        ids.cidadeEstabelecimento ||
        ids.cidade,

        ids.estadoEstabelecimento ||
        ids.estado,

        ids.cepEstabelecimento ||
        ids.cep,

        ids.telefoneComercial ||
        ids.telefoneEstabelecimento,

        ids.instagramEstabelecimento ||
        ids.instagram,

        ids.siteEstabelecimento ||
        ids.site,

        ids.capacidadeEstabelecimento ||
        ids.capacidade,

        ids.estruturaEstabelecimento ||
        ids.estrutura,

        ids.estilosMusicais ||
        ids.estilosMusicaisEstabelecimento

    ];


    campos.forEach(
        (id) => {

            const campo =
                el(id);


            if (!campo) {

                return;

            }


            campo.value =
                "";

        }
    );


    const campoAceitaMusicaAoVivo =
        el(
            ids.aceitaMusicaAoVivo ||
            ids.aceitaMusicaAoVivoEstabelecimento
        );


    if (campoAceitaMusicaAoVivo) {

        campoAceitaMusicaAoVivo.checked =
            false;

    }

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


    const tipoPerfil =
        obterTipoPerfil();


    /* ====================================================
       CAMPOS COMUNS
       ==================================================== */

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


    /* ====================================================
       LOCALIZAÇÃO
       ====================================================

       Para artista:

       perfilArtista.localizacao

       Para contratante:

       perfil.localizacao

       Para estabelecimento:

       perfil.localizacao continua sendo a localização
       comum do perfil.

       O endereço detalhado é tratado separadamente
       por preencherDadosEstabelecimento().

       ==================================================== */

    if (campoLocalizacao) {

        campoLocalizacao.value =
            tipoPerfil === "artista"

                ? (
                    artista.localizacao ||
                    perfil.localizacao ||
                    ""
                )

                : (
                    perfil.localizacao ||
                    usuario.localizacao ||
                    ""
                );

    }


    if (campoDescricao) {

        campoDescricao.value =
            perfil.descricao || "";

    }


    /* ====================================================
       E-MAIL
       ====================================================

       A prioridade é:

       1. sessão/auth;
       2. tabela usuarios.

       Isso evita que o campo fique vazio quando
       usuarios.email não estiver preenchido, mas o
       usuário estiver autenticado normalmente.

       ==================================================== */

    if (campoEmail) {

        const emailAuth =
            estado.usuarioAuth?.email ||
            estado.usuarioAuth?.user?.email ||
            "";


        const emailBanco =
            usuario.email ||
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
       CAMPOS EXCLUSIVOS DE ARTISTA
       ==================================================== */

    const campoExperiencia =
        el(ids.experiencia);


    const campoArea =
        el(ids.areaAtendimento);


    const campoTipo =
        el(ids.tipoArtista);


    const campoDisponivel =
        el(ids.disponivel);


    if (tipoPerfil === "artista") {

        /* ================================================
           EXPERIÊNCIA
           ================================================ */

        if (campoExperiencia) {

            campoExperiencia.value =
                artista.experiencia || "";

        }


        /* ================================================
           ÁREA DE ATENDIMENTO
           ================================================ */

        if (campoArea) {

            campoArea.value =
                artista.area_atendimento || "";

        }


        /* ================================================
           TIPO ARTÍSTICO
           ================================================ */

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
                !estado.perfilArtista
            ) {

                estado.perfilArtista =
                    {};

            }


            if (
                !estado.perfilArtista.tipo_artista
            ) {

                estado.perfilArtista.tipo_artista =
                    tipoParaExibir;

            }

        }


        /* ================================================
           DISPONIBILIDADE
           ================================================ */

        if (campoDisponivel) {

            campoDisponivel.checked =
                artista.disponivel !== false;

        }

    } else {

        /* =================================================
           CONTRATANTE / ESTABELECIMENTO

           Limpa os campos artísticos caso o HTML tenha
           sido carregado anteriormente com valores.

           Isso impede que dados antigos permaneçam
           visualmente no formulário.

           ================================================= */

        if (campoExperiencia) {

            campoExperiencia.value =
                "";

        }


        if (campoArea) {

            campoArea.value =
                "";

        }


        if (campoTipo) {

            campoTipo.value =
                "";

        }


        if (campoDisponivel) {

            campoDisponivel.checked =
                false;

        }

    }


    /* ====================================================
       DADOS ESPECÍFICOS DE ESTABELECIMENTO
       ==================================================== */

    if (ehEstabelecimento()) {

        preencherDadosEstabelecimento();

    } else {

        limparDadosEstabelecimento();

    }


    /* ====================================================
       PUBLICAÇÃO DO PERFIL
       ====================================================

       O checkbox representa diretamente o valor salvo
       no banco.

       true  = publicado
       false = não publicado

       NÃO usamos !== false.

       ==================================================== */

    const campoPerfilPublicado =
        el("perfilPublicado");


    if (campoPerfilPublicado) {

        campoPerfilPublicado.checked =
            perfil.perfil_publicado === true;


        console.log(
            "PerfilEditorUI: publicação carregada do banco:",
            {
                tipoPerfil,

                perfilId:
                    perfil.id,

                perfilPublicadoBanco:
                    perfil.perfil_publicado,

                checkboxMarcado:
                    campoPerfilPublicado.checked
            }
        );

    }


    /* ====================================================
       CHIPS DE ARTISTA
       ====================================================

       Somente artistas possuem os chips de estilos e
       serviços controlados por PerfilUtils.

       Contratantes e estabelecimentos não devem receber
       marcações vindas de perfis_artistas.

       ==================================================== */

    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.marcarChips === "function"
    ) {

        window.PerfilUtils.marcarChips(
            "estilos",
            tipoPerfil === "artista"
                ? artista.estilos || []
                : []
        );


        window.PerfilUtils.marcarChips(
            "servicos",
            tipoPerfil === "artista"
                ? artista.servicos || []
                : []
        );

    }


    /* ====================================================
       INTERFACE POR TIPO DE PERFIL
       ==================================================== */

    atualizarInterfacePorTipoPerfil();


    atualizarContador();

    preencherAvatar();

}


/* ========================================================
   AVATAR
   ========================================================

   ARTISTA:

   1. foto de perfis_artistas;
   2. foto de usuarios.

   CONTRATANTE:

   1. foto de usuarios.

   ESTABELECIMENTO:

   1. foto de usuarios.

   O estabelecimento atualmente não possui foto própria
   em perfis_estabelecimentos. Portanto, a foto comum da
   conta continua sendo utilizada.

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


    const tipoPerfil =
        obterTipoPerfil();


    let foto =
        "";


    if (tipoPerfil === "artista") {

        foto =
            estado.perfilArtista?.foto_url ||
            estado.usuario?.foto_url ||
            "";

    } else {

        foto =
            estado.usuario?.foto_url ||
            estado.perfil?.foto_url ||
            "";

    }


    foto =
        String(
            foto || ""
        ).trim();


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


    if (!ehArtista()) {

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

    preencherDadosEstabelecimento,

    limparDadosEstabelecimento,

    atualizarPublicacaoConfirmada,

    atualizarTipo,

    atualizarInterfacePorTipoPerfil,

    obterTipoPerfil,

    ehArtista,

    ehContratante,

    ehEstabelecimento

};


})();


window.PerfilEditorUI =
PerfilEditorUI;