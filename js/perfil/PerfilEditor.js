const PerfilEditor = (() => {


"use strict";


/* ============================================================
   PERFIL EDITOR — MUSICALWORLD
   ============================================================

   Motor universal do editor de perfil.

   Responsabilidades:

   - sessão;
   - carregamento do usuário;
   - carregamento do perfil;
   - carregamento do perfil artístico;
   - identificação do tipo através do PerfilEditorTipo;
   - preenchimento do formulário;
   - integração do módulo de foto;
   - salvamento do perfil;
   - integração dos módulos;
   - eventos gerais da página;
   - navegação universal.

   IMPORTANTE:

   Este editor é UNIVERSAL.

   Todos os tipos artísticos utilizam:

       editar-perfil.html

   O tipo artístico NÃO determina mais qual arquivo HTML
   deve ser aberto.

   O tipo serve apenas para configurar os recursos
   disponíveis no editor.
*/


/* ============================================================
   NAVEGAÇÃO UNIVERSAL
   ============================================================ */

const PAGINA_EDITOR =
    "editar-perfil.html";

const PAGINA_PERFIL =
    "meu-perfil.html";


function obterPaginaAtual() {

    const caminho =
        window.location.pathname || "";

    return caminho
        .split("/")
        .pop()
        .toLowerCase()
        .trim();

}


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

const CONFIG = {

    paginaAtual:
        obterPaginaAtual(),

    paginaEditor:
        PAGINA_EDITOR,

    paginaPerfil:
        PAGINA_PERFIL,

    buckets: {

        foto:
            "perfil-musico",

        portfolio:
            "portfolio-musicos"

    },

    tabelas: {

        usuarios:
            "usuarios",

        perfis:
            "perfis",

        tiposPerfil:
            "tipos_perfil",

        perfisArtistas:
            "perfis_artistas"

    }

};


/* ============================================================
   ESTADO
   ============================================================ */

const estado = {

    usuarioAuth:
        null,

    usuario:
        null,

    perfil:
        null,

    perfilArtista:
        null,

    fotoArquivo:
        null,

    salvando:
        false,

    abaAtual:
        "sobre",

    portfolio:
        [],

    agenda:
        [],

    tipoMedia:
        "imagem",

    editandoPortfolioId:
        null,

    editandoAgendaId:
        null,

    servicosValores:
        [],

    editandoServicoId:
        null

};


/* ============================================================
   IDS DOS ELEMENTOS
   ============================================================ */

const ids = {

    nome:
        "nome",

    nomeExibicao:
        "nomeExibicao",

    telefone:
        "telefone",

    localizacao:
        "localizacao",

    descricao:
        "descricao",

    experiencia:
        "experiencia",

    areaAtendimento:
        "areaAtendimento",

    tipoArtista:
        "tipoArtista",

    disponivel:
        "disponivel",

    emailConta:
        "emailConta",

    avatarImage:
        "avatarImage",

    avatarInitials:
        "avatarInitials",

    fotoPreview:
        "fotoPreview",

    fotoPlaceholder:
        "fotoPlaceholder",

    fotoInput:
        "inputFoto",

    btnFoto:
        "btnAlterarFoto",

    form:
        "formEditarPerfil",

    btnSalvar:
        "btnSalvar",

    btnSalvarTopo:
        "btnSalvarTopo",

    btnVoltar:
        "btnVoltar",

    btnCancelar:
        "btnCancelar",

    contadorDescricao:
        "contadorDescricao",

    portfolioTitulo:
        "portfolioTitulo",

    portfolioDescricao:
        "portfolioDescricao",

    portfolioArquivo:
        "portfolioArquivo",

    portfolioUrl:
        "portfolioUrl",

    portfolioAjuda:
        "portfolioAjuda",

    btnAdicionarPortfolio:
        "btnAdicionarPortfolio",

    portfolioEditList:
        "portfolioEditList",

    agendaTitulo:
        "agendaTitulo",

    agendaTipo:
        "agendaTipo",

    agendaInicio:
        "agendaInicio",

    agendaFim:
        "agendaFim",

    agendaLocalizacao:
        "agendaLocalizacao",

    agendaDescricao:
        "agendaDescricao",

    agendaStatus:
        "agendaStatus",

    btnAdicionarAgenda:
        "btnAdicionarAgenda",

    agendaEditList:
        "agendaEditList",

    servicoNome:
        "servicoNome",

    servicoDescricao:
        "servicoDescricao",

    servicoDuracao:
        "servicoDuracao",

    servicoTipoPreco:
        "servicoTipoPreco",

    servicoValor:
        "servicoValor",

    servicoAtivo:
        "servicoAtivo",

    campoValorServico:
        "campoValorServico",

    btnAdicionarServico:
        "btnAdicionarServico",

    btnCancelarServico:
        "btnCancelarServico",

    servicosList:
        "servicosEditList",

    toast:
        "toast",

    toastMessage:
        "toastMessage",

    loadingOverlay:
        "loadingOverlay",

    loadingText:
        "loadingText"

};


/* ============================================================
   CONTEXTO DOS MÓDULOS
   ============================================================ */

const contexto = {

    CONFIG,

    estado,

    ids,

    get supabase() {

        return window.supabaseClient;

    },

    get el() {

        return window.PerfilUtils &&
            typeof window.PerfilUtils.el === "function"

            ? window.PerfilUtils.el

            : el;

    },

    get utils() {

        return window.PerfilUtils;

    }

};


/* ============================================================
   ELEMENTOS
   ============================================================ */

function el(id) {

    return document.getElementById(id);

}


/* ============================================================
   CONFIGURAÇÃO DOS MÓDULOS
   ============================================================ */

function configurarModulos() {

    if (
        window.PerfilEditorTipo &&
        typeof window.PerfilEditorTipo.CONFIG === "object"
    ) {

        contexto.PerfilEditorTipo =
            window.PerfilEditorTipo;

    }


    if (
        window.PerfilEditorFoto &&
        typeof window.PerfilEditorFoto.configurar === "function"
    ) {

        window.PerfilEditorFoto.configurar(
            contexto
        );

    }


    if (
        window.PerfilAbas &&
        typeof window.PerfilAbas.configurar === "function"
    ) {

        window.PerfilAbas.configurar(
            contexto
        );

    }


    if (
        window.PerfilPortfolio &&
        typeof window.PerfilPortfolio.configurar === "function"
    ) {

        window.PerfilPortfolio.configurar(
            contexto
        );

    }


    if (
        window.PerfilAgenda &&
        typeof window.PerfilAgenda.configurar === "function"
    ) {

        window.PerfilAgenda.configurar(
            contexto
        );

    }


    if (
        window.PerfilServicos &&
        typeof window.PerfilServicos.configurar === "function"
    ) {

        window.PerfilServicos.configurar(
            contexto
        );

    }


    if (
        window.PerfilInstrumentos &&
        typeof window.PerfilInstrumentos.configurar === "function"
    ) {

        window.PerfilInstrumentos.configurar(
            contexto
        );

    }

}


/* ============================================================
   NORMALIZAÇÃO DO TIPO ARTÍSTICO
   ============================================================ */

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
        "PerfilEditor: não foi possível localizar o tipo artístico no select:",
        tipoSalvo
    );

}


/* ============================================================
   IDENTIFICAÇÃO UNIVERSAL DO TIPO
   ============================================================ */

function obterTipoConfigurado(
    valor
) {

    if (
        window.PerfilEditorTipo &&
        typeof window.PerfilEditorTipo.identificar === "function"
    ) {

        return window.PerfilEditorTipo.identificar(
            valor
        );

    }

    return null;

}


function resolverTipo(
    valor
) {

    if (
        window.PerfilEditorTipo &&
        typeof window.PerfilEditorTipo.resolver === "function"
    ) {

        return window.PerfilEditorTipo.resolver(
            valor
        );

    }

    return null;

}


/* ============================================================
   RECURSOS DO TIPO ATUAL
   ============================================================ */

function tipoPossuiRecurso(
    recurso,
    tipo
) {

    const tipoAtual =
        tipo ||
        estado.perfilArtista?.tipo_artista;


    if (
        !tipoAtual ||
        !window.PerfilEditorTipo
    ) {

        return false;

    }


    if (
        typeof window.PerfilEditorTipo.possuiRecurso === "function"
    ) {

        return window.PerfilEditorTipo.possuiRecurso(
            tipoAtual,
            recurso
        );

    }


    return false;

}


function tipoPossuiInstrumentos(
    tipo
) {

    const tipoAtual =
        tipo ||
        estado.perfilArtista?.tipo_artista;


    if (
        !tipoAtual ||
        !window.PerfilEditorTipo
    ) {

        return false;

    }


    if (
        typeof window.PerfilEditorTipo.possuiInstrumentos === "function"
    ) {

        return window.PerfilEditorTipo.possuiInstrumentos(
            tipoAtual
        );

    }


    return false;

}


/* ============================================================
   CONFIGURAÇÃO DOS INSTRUMENTOS POR TIPO
   ============================================================ */

function configurarInstrumentosPorTipo() {

    if (!window.PerfilInstrumentos) {

        return;

    }


    const possuiInstrumentos =
        tipoPossuiInstrumentos();


    const campoInstrumentos =
        el("campoInstrumentos");


    if (possuiInstrumentos) {

        if (campoInstrumentos) {

            campoInstrumentos.style.display =
                "";

        }


        if (
            typeof window.PerfilInstrumentos.inicializar === "function"
        ) {

            window.PerfilInstrumentos.inicializar();

        }


        if (
            typeof window.PerfilInstrumentos.carregar === "function"
        ) {

            window.PerfilInstrumentos.carregar(
                estado.perfilArtista?.instrumentos || []
            );

        }


        return;

    }


    if (campoInstrumentos) {

        campoInstrumentos.style.display =
            "none";

    }


    if (
        typeof window.PerfilInstrumentos.destruir === "function"
    ) {

        window.PerfilInstrumentos.destruir();

    }

}


/* ============================================================
   CONFIGURAÇÃO DO PORTFÓLIO
   ============================================================ */

async function configurarPortfolioPorTipo() {

    if (!window.PerfilPortfolio) {

        console.warn(
            "PerfilEditor: PerfilPortfolio não foi carregado."
        );

        return;

    }


    if (
        typeof window.PerfilPortfolio.inicializar === "function"
    ) {

        window.PerfilPortfolio.inicializar();

    }


    if (
        typeof window.PerfilPortfolio.carregar === "function"
    ) {

        return await window.PerfilPortfolio.carregar();

    }


    return [];

}


/* ============================================================
   CARREGAMENTO DO PERFIL
   ============================================================ */

async function carregarDados() {

    try {

        if (!window.Sessao) {

            throw new Error(
                "Módulo Sessao não carregado."
            );

        }


        estado.usuarioAuth =
            await window.Sessao.usuarioAtual();


        if (!estado.usuarioAuth) {

            sessionStorage.setItem(
                "musicalworld_destino_login",
                CONFIG.paginaAtual
            );


            window.location.href =
                "login.html";


            return;

        }


        if (!contexto.supabase) {

            throw new Error(
                "SupabaseClient não foi carregado."
            );

        }


        const {
            data: usuario,
            error: erroUsuario
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.usuarios
            )
            .select(
                "id,nome,email,telefone,foto_url,ativo"
            )
            .eq(
                "id",
                estado.usuarioAuth.id
            )
            .maybeSingle();


        if (erroUsuario) {

            throw erroUsuario;

        }


        estado.usuario =
            usuario || {

                id:
                    estado.usuarioAuth.id,

                nome:
                    estado.usuarioAuth.user_metadata?.nome ||
                    estado.usuarioAuth.email ||
                    "Usuário",

                email:
                    estado.usuarioAuth?.email ||
                    estado.usuarioAuth?.user?.email ||
                    "",

                telefone:
                    null,

                foto_url:
                    null,

                ativo:
                    true

            };


        const {
            data: perfis,
            error: erroPerfil
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.perfis
            )
            .select(
                "id,usuario_id,tipo_perfil_id,nome_exibicao,descricao,ativo,perfil_publicado,tipos_perfil(id,nome,descricao)"
            )
            .eq(
                "usuario_id",
                estado.usuarioAuth.id
            )
            .eq(
                "ativo",
                true
            );


        if (erroPerfil) {

            throw erroPerfil;

        }


        const perfilArtistaTipo =
            (perfis || []).find(
                (perfil) => {

                    const nomeTipo =
                        perfil?.tipos_perfil?.nome ||
                        "";


                    return (
                        String(
                            nomeTipo
                        )
                            .trim()
                            .toLowerCase() ===
                        "artista"
                    );

                }
            );


        const perfilContratanteTipo =
            (perfis || []).find(
                (perfil) => {

                    const nomeTipo =
                        perfil?.tipos_perfil?.nome ||
                        "";


                    return (
                        String(
                            nomeTipo
                        )
                            .trim()
                            .toLowerCase() ===
                        "contratante"
                    );

                }
            );


        if (!perfilArtistaTipo) {

            if (perfilContratanteTipo) {

                throw new Error(
                    "Este é um perfil de Contratante. O editor artístico não deve ser utilizado para este perfil."
                );

            }


            throw new Error(
                "Perfil artístico não encontrado."
            );

        }


        estado.perfil =
            perfilArtistaTipo;


        const {
            data: perfilArtista,
            error: erroPerfilArtista
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.perfisArtistas
            )
            .select(
                "id,perfil_id,tipo_artista,localizacao,experiencia,area_atendimento,disponivel,instrumentos,estilos,servicos,foto_url,created_at,updated_at"
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            )
            .maybeSingle();


        if (erroPerfilArtista) {

            throw erroPerfilArtista;

        }


        estado.perfilArtista =
            perfilArtista || {

                id:
                    null,

                perfil_id:
                    estado.perfil.id,

                tipo_artista:
                    null,

                localizacao:
                    null,

                experiencia:
                    null,

                area_atendimento:
                    null,

                disponivel:
                    true,

                instrumentos:
                    [],

                estilos:
                    [],

                servicos:
                    [],

                foto_url:
                    null

            };


        const tipoInformado =
            estado.perfilArtista.tipo_artista;


        const tipoConfigurado =
            resolverTipo(
                tipoInformado
            );


        if (!tipoConfigurado) {

            console.warn(
                "PerfilEditor: tipo artístico não reconhecido:",
                tipoInformado
            );

        } else {

            estado.perfilArtista.tipo_artista =
                tipoInformado ||
                tipoConfigurado.nome;

        }


        preencherFormulario();

        configurarInstrumentosPorTipo();

        await configurarPortfolioPorTipo();


        if (
            window.PerfilAgenda &&
            typeof window.PerfilAgenda.carregar === "function"
        ) {

            await window.PerfilAgenda.carregar();

        }


        if (
            window.PerfilServicos &&
            typeof window.PerfilServicos.carregar === "function"
        ) {

            await window.PerfilServicos.carregar();

        }


    } catch (erro) {

        console.error(
            "PerfilEditor: erro ao carregar perfil:",
            erro
        );


        const mensagem =
            erro?.message ||
            "Não foi possível carregar seu perfil.";


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.mostrarToast === "function"
        ) {

            window.PerfilUtils.mostrarToast(
                mensagem,
                "erro"
            );

        } else {

            alert(mensagem);

        }

    }

}


/* ============================================================
   PREENCHER FORMULÁRIO
   ============================================================ */

function preencherFormulario() {

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


    /* ========================================================
       PUBLICAÇÃO DO PERFIL
       ========================================================

       O valor inicial vem EXCLUSIVAMENTE do banco.

       true  = publicado
       false = não publicado

       Não usamos "!== false" aqui porque isso transforma
       valores nulos/indefinidos em true automaticamente.

       O estado real do banco deve ser respeitado.
    */

    const campoPerfilPublicado =
        el("perfilPublicado");


    if (campoPerfilPublicado) {

        campoPerfilPublicado.checked =
            perfil.perfil_publicado === true;


        console.log(
            "PerfilEditor: publicação carregada do banco:",
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


/* ============================================================
   AVATAR
   ============================================================ */

function preencherAvatar() {

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


/* ============================================================
   SALVAR PERFIL
   ============================================================ */

async function salvarSobre() {

    if (estado.salvando) {

        return;

    }


    const nome =
        String(
            el(ids.nome)?.value ||
            ""
        ).trim();


    const nomeExibicao =
        String(
            el(ids.nomeExibicao)?.value ||
            ""
        ).trim();


    const telefone =
        String(
            el(ids.telefone)?.value ||
            ""
        ).trim();


    const localizacao =
        String(
            el(ids.localizacao)?.value ||
            ""
        ).trim();


    const descricao =
        String(
            el(ids.descricao)?.value ||
            ""
        ).trim();


    const experiencia =
        String(
            el(ids.experiencia)?.value ||
            ""
        ).trim();


    const areaAtendimento =
        String(
            el(ids.areaAtendimento)?.value ||
            ""
        ).trim();


    const tipoSelecionadoCampo =
        String(
            el(ids.tipoArtista)?.value ||
            ""
        ).trim();


    const tipoCadastrado =
        String(
            estado.perfilArtista?.tipo_artista ||
            ""
        ).trim();


    const tipoSelecionado =
        tipoSelecionadoCampo ||
        tipoCadastrado;


    const campoDisponivel =
        el(ids.disponivel);


    const disponivel =
        campoDisponivel
            ? Boolean(
                campoDisponivel.checked
            )
            : estado.perfilArtista?.disponivel !== false;


    /* ========================================================
       PUBLICAÇÃO DO PERFIL
       ========================================================

       Este é o valor que será efetivamente enviado ao banco.

       Se o checkbox existir, usamos exatamente o estado dele.

       Se não existir, preservamos o valor que já estava
       carregado no banco.

       NÃO usamos "!== false" para o checkbox existente.
    */

    const perfilPublicadoElemento =
        el("perfilPublicado");


    const perfilPublicado =
        perfilPublicadoElemento
            ? Boolean(
                perfilPublicadoElemento.checked
            )
            : estado.perfil?.perfil_publicado === true;


    console.log(
        "PerfilEditor: valor de publicação antes de salvar:",
        {
            perfilId:
                estado.perfil?.id,

            valorAtualNoEstado:
                estado.perfil?.perfil_publicado,

            checkboxExiste:
                Boolean(perfilPublicadoElemento),

            checkboxMarcado:
                perfilPublicadoElemento
                    ? perfilPublicadoElemento.checked
                    : null,

            valorQueSeraEnviado:
                perfilPublicado
        }
    );


    /* --------------------------------------------------------
       VALIDAÇÕES
    -------------------------------------------------------- */

    if (!nome) {

        window.PerfilUtils.mostrarToast(
            "Informe seu nome.",
            "erro"
        );


        el(ids.nome)?.focus();


        return;

    }


    if (!nomeExibicao) {

        window.PerfilUtils.mostrarToast(
            "Informe o nome que será exibido no perfil.",
            "erro"
        );


        el(ids.nomeExibicao)?.focus();


        return;

    }


    if (descricao.length > 1000) {

        window.PerfilUtils.mostrarToast(
            "A descrição deve ter no máximo 1000 caracteres.",
            "erro"
        );


        el(ids.descricao)?.focus();


        return;

    }


    if (
        !window.PerfilUtils ||
        typeof window.PerfilUtils.normalizarTipoArtista !== "function"
    ) {

        throw new Error(
            "PerfilUtils não está disponível."
        );

    }


    const novoTipo =
        window.PerfilUtils.normalizarTipoArtista(
            tipoSelecionado
        );


    if (!novoTipo) {

        window.PerfilUtils.mostrarToast(
            "Selecione seu tipo de perfil.",
            "erro"
        );


        el(ids.tipoArtista)?.focus();


        return;

    }


    const tipoValidado =
        obterTipoConfigurado(
            novoTipo
        ) ||
        obterTipoConfigurado(
            tipoSelecionado
        );


    if (!tipoValidado) {

        window.PerfilUtils.mostrarToast(
            "O tipo de perfil selecionado não é válido.",
            "erro"
        );


        el(ids.tipoArtista)?.focus();


        return;

    }


    const tipoAtualOriginal =
        String(
            estado.perfilArtista?.tipo_artista ||
            ""
        ).trim();


    const tipoAtualConfigurado =
        obterTipoConfigurado(
            tipoAtualOriginal
        );


    const tipoAtual =
        tipoAtualConfigurado

            ? tipoAtualConfigurado.slug

            : window.PerfilUtils.normalizarTipoArtista(
                tipoAtualOriginal
            );


    const tipoNovoSlug =
        tipoValidado.slug;


    const tipoAlterado =
        tipoNovoSlug !== tipoAtual;


    if (
        tipoAlterado &&
        tipoAtual
    ) {

        const nomeTipoAtual =
            tipoAtualConfigurado?.nome ||
            tipoAtualOriginal ||
            "tipo atual";


        const nomeNovoTipo =
            tipoValidado.nome;


        const confirmar =
            window.confirm(
                `Você está alterando seu tipo de perfil de "${nomeTipoAtual}" para "${nomeNovoTipo}". Deseja continuar?`
            );


        if (!confirmar) {

            return;

        }

    }


    estado.salvando =
        true;


    const botoesSalvar = [

        el(ids.btnSalvar),

        el(ids.btnSalvarTopo)

    ].filter(Boolean);


    botoesSalvar.forEach(
        (botao) => {

            botao.disabled =
                true;

        }
    );


    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.mostrarLoading === "function"
    ) {

        window.PerfilUtils.mostrarLoading(
            "Salvando perfil..."
        );

    }


    try {

        /* ----------------------------------------------------
           CHIPS
        ---------------------------------------------------- */

        const tipoNovoPossuiInstrumentos =
            tipoPossuiInstrumentos(
                tipoValidado.slug
            );


        const instrumentos =
            tipoNovoPossuiInstrumentos &&

            typeof window.PerfilUtils.obterChipsSelecionados === "function"

                ? window.PerfilUtils.obterChipsSelecionados(
                    "instrumentos"
                )

                : [];


        const estilos =
            typeof window.PerfilUtils.obterChipsSelecionados === "function"

                ? window.PerfilUtils.obterChipsSelecionados(
                    "estilos"
                )

                : [];


        const servicos =
            typeof window.PerfilUtils.obterChipsSelecionados === "function"

                ? window.PerfilUtils.obterChipsSelecionados(
                    "servicos"
                )

                : [];


        /* ----------------------------------------------------
           FOTO
        ---------------------------------------------------- */

        const fotoAtual =
            estado.perfilArtista?.foto_url ||
            estado.usuario?.foto_url ||
            null;


        let resultadoFoto = {

            url:
                fotoAtual,

            caminhoNovo:
                null,

            caminhoAnterior:
                null

        };


        if (
            window.PerfilEditorFoto &&
            typeof window.PerfilEditorFoto.fazerUpload === "function"
        ) {

            const resultadoUpload =
                await window.PerfilEditorFoto.fazerUpload();


            if (
                resultadoUpload &&
                resultadoUpload.url
            ) {

                resultadoFoto = {

                    ...resultadoFoto,

                    ...resultadoUpload,

                    url:
                        resultadoUpload.url

                };

            }

        }


        const fotoUrl =
            resultadoFoto?.url ||
            fotoAtual ||
            null;


        const agora =
            new Date().toISOString();


        /* ----------------------------------------------------
           USUARIOS
        ---------------------------------------------------- */

        const dadosUsuario = {

            nome,

            telefone:
                telefone || null,

            foto_url:
                fotoUrl

        };


        const {
            error: erroUsuario
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.usuarios
            )
            .update(
                dadosUsuario
            )
            .eq(
                "id",
                estado.usuarioAuth.id
            );


        if (erroUsuario) {

            throw erroUsuario;

        }


        /* ----------------------------------------------------
           PERFIS
        ---------------------------------------------------- */

        const dadosPerfil = {

            nome_exibicao:
                nomeExibicao,

            descricao:
                descricao || null,

            ativo:
                true,

            /*
             * ESTE É O VALOR REAL DO CHECKBOX.
             *
             * Marcado    -> true
             * Desmarcado -> false
             */

            perfil_publicado:
                perfilPublicado,

            updated_at:
                agora

        };


        console.log(
            "PerfilEditor: salvando PERFIS:",
            {
                perfilId:
                    estado.perfil.id,

                usuarioId:
                    estado.usuarioAuth.id,

                checkbox:
                    perfilPublicadoElemento?.checked,

                perfilPublicado:

                    perfilPublicado,

                dados:
                    dadosPerfil
            }
        );


        /* ====================================================
           ATUALIZA PERFIL E PEDE O REGISTRO DE VOLTA
           ====================================================

           Isso é importante.

           Não vamos simplesmente assumir que o UPDATE foi
           realizado.

           O Supabase deverá devolver o registro atualizado.

           Assim conseguimos confirmar se:

               perfil_publicado = true

           realmente chegou ao banco.
        */

        const {
            data: perfilAtualizado,
            error: erroPerfil
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.perfis
            )
            .update(
                dadosPerfil
            )
            .eq(
                "id",
                estado.perfil.id
            )
            .eq(
                "usuario_id",
                estado.usuarioAuth.id
            )
            .select(
                "id,usuario_id,tipo_perfil_id,nome_exibicao,descricao,ativo,perfil_publicado,updated_at,tipos_perfil(id,nome,descricao)"
            )
            .maybeSingle();


        if (erroPerfil) {

            console.error(
                "PerfilEditor: erro ao atualizar PERFIS:",
                erroPerfil
            );


            throw erroPerfil;

        }


        /*
         * Se não recebemos o registro atualizado, não podemos
         * considerar que o salvamento foi confirmado.
         *
         * Isso ajuda a detectar problemas de RLS ou UPDATE
         * que não afetou nenhuma linha.
         */

        if (!perfilAtualizado) {

            throw new Error(
                "O perfil não foi atualizado no banco. Verifique as políticas de acesso da tabela perfis."
            );

        }


        console.log(
            "PerfilEditor: PERFIL confirmado pelo Supabase:",
            {
                id:
                    perfilAtualizado.id,

                perfilPublicadoEnviado:
                    perfilPublicado,

                perfilPublicadoRecebido:
                    perfilAtualizado.perfil_publicado,

                ativoRecebido:
                    perfilAtualizado.ativo
            }
        );


        /*
         * CONFIRMAÇÃO CRÍTICA:
         *
         * Se enviamos true e o banco devolveu false,
         * o salvamento não aconteceu como esperado.
         */

        if (
            Boolean(
                perfilAtualizado.perfil_publicado
            ) !==
            Boolean(
                perfilPublicado
            )
        ) {

            throw new Error(
                `O banco não confirmou a publicação do perfil. Enviado: ${perfilPublicado ? "true" : "false"} | Recebido: ${perfilAtualizado.perfil_publicado ? "true" : "false"}`
            );

        }


        /* ----------------------------------------------------
           PERFIS_ARTISTAS
        ---------------------------------------------------- */

        const dadosArtista = {

            tipo_artista:
                tipoValidado.nome,

            localizacao:
                localizacao || null,

            experiencia:
                experiencia || null,

            area_atendimento:
                areaAtendimento || null,

            disponivel,

            instrumentos,

            estilos,

            servicos,

            foto_url:
                fotoUrl,

            updated_at:
                agora

        };


        console.log(
            "PerfilEditor: salvando PERFIS_ARTISTAS:",
            {
                perfilId:
                    estado.perfil.id,

                dados:
                    dadosArtista
            }
        );


        if (estado.perfilArtista?.id) {

            const {
                error: erroAtualizacaoArtista
            } = await contexto.supabase
                .from(
                    CONFIG.tabelas.perfisArtistas
                )
                .update(
                    dadosArtista
                )
                .eq(
                    "id",
                    estado.perfilArtista.id
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                );


            if (erroAtualizacaoArtista) {

                throw erroAtualizacaoArtista;

            }

        } else {

            const {
                data: novoPerfilArtista,
                error: erroInsercaoArtista
            } = await contexto.supabase
                .from(
                    CONFIG.tabelas.perfisArtistas
                )
                .insert({

                    perfil_id:
                        estado.perfil.id,

                    ...dadosArtista

                })
                .select()
                .maybeSingle();


            if (erroInsercaoArtista) {

                throw erroInsercaoArtista;

            }


            if (novoPerfilArtista) {

                estado.perfilArtista = {

                    ...estado.perfilArtista,

                    ...novoPerfilArtista

                };

            }

        }


        /* ----------------------------------------------------
           FOTO ANTIGA
        ---------------------------------------------------- */

        if (
            window.PerfilEditorFoto &&
            typeof window.PerfilEditorFoto.finalizarFoto === "function"
        ) {

            await window.PerfilEditorFoto.finalizarFoto(
                resultadoFoto
            );

        }


        /* ----------------------------------------------------
           ATUALIZA ESTADO LOCAL
        ---------------------------------------------------- */

        estado.usuario = {

            ...estado.usuario,

            nome,

            telefone:
                telefone || null,

            foto_url:
                fotoUrl

        };


        /*
         * IMPORTANTE:
         *
         * Não usamos simplesmente "perfilPublicado" aqui.
         *
         * Usamos o valor CONFIRMADO pelo Supabase.
         */

        estado.perfil = {

            ...estado.perfil,

            ...perfilAtualizado,

            nome_exibicao:
                perfilAtualizado.nome_exibicao,

            descricao:
                perfilAtualizado.descricao,

            ativo:
                perfilAtualizado.ativo,

            perfil_publicado:
                perfilAtualizado.perfil_publicado

        };


        estado.perfilArtista = {

            ...estado.perfilArtista,

            ...dadosArtista,

            perfil_id:
                estado.perfil.id

        };


        /* ----------------------------------------------------
           ATUALIZA CHECKBOX COM O VALOR CONFIRMADO
        ---------------------------------------------------- */

        const campoPerfilPublicado =
            el("perfilPublicado");


        if (campoPerfilPublicado) {

            campoPerfilPublicado.checked =
                estado.perfil.perfil_publicado === true;

        }


        /* ----------------------------------------------------
           LIMPA ARQUIVO SELECIONADO
        ---------------------------------------------------- */

        if (
            window.PerfilEditorFoto &&
            typeof window.PerfilEditorFoto.limpar === "function"
        ) {

            window.PerfilEditorFoto.limpar();

        }


        /* ----------------------------------------------------
           ATUALIZA SELECT
        ---------------------------------------------------- */

        const campoTipo =
            el(ids.tipoArtista);


        if (campoTipo) {

            preencherTipoArtista(
                campoTipo,
                dadosArtista.tipo_artista
            );

        }


        /* ----------------------------------------------------
           ATUALIZA INSTRUMENTOS
        ---------------------------------------------------- */

        configurarInstrumentosPorTipo();


        /* ----------------------------------------------------
           ATUALIZA AVATAR
        ---------------------------------------------------- */

        preencherAvatar();


        /* ----------------------------------------------------
           LOG FINAL
        ---------------------------------------------------- */

        console.log(
            "PerfilEditor: perfil salvo e confirmado:",
            {
                perfilId:
                    estado.perfil.id,

                ativo:
                    estado.perfil.ativo,

                perfilPublicado:
                    estado.perfil.perfil_publicado,

                checkbox:
                    campoPerfilPublicado?.checked,

                fotoUrl:
                    estado.perfilArtista.foto_url,

                tipo:
                    estado.perfilArtista.tipo_artista
            }
        );


        window.PerfilUtils.mostrarToast(
            "Perfil salvo com sucesso.",
            "sucesso"
        );


    } catch (erro) {

        console.error(
            "PerfilEditor: erro ao salvar perfil:",
            erro
        );


        window.PerfilUtils.mostrarToast(
            erro?.message ||
            "Não foi possível salvar o perfil.",
            "erro"
        );


    } finally {

        estado.salvando =
            false;


        botoesSalvar.forEach(
            (botao) => {

                botao.disabled =
                    false;

            }
        );


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.esconderLoading === "function"
        ) {

            window.PerfilUtils.esconderLoading();

        }


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.atualizarIcones === "function"
        ) {

            window.PerfilUtils.atualizarIcones();

        }

    }

}


/* ============================================================
   CONTADOR DE DESCRIÇÃO
   ============================================================ */

function atualizarContador() {

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


/* ============================================================
   EVENTOS GERAIS
   ============================================================ */

function inicializarEventos() {

    const formulario =
        el(ids.form);


    if (
        formulario &&
        formulario.dataset.perfilEditorInicializado !== "true"
    ) {

        formulario.dataset.perfilEditorInicializado =
            "true";


        formulario.addEventListener(
            "submit",
            async (evento) => {

                evento.preventDefault();

                await salvarSobre();

            }
        );

    }


    const btnSalvar =
        el(ids.btnSalvar);


    if (
        btnSalvar &&
        btnSalvar.dataset.perfilEditorInicializado !== "true"
    ) {

        btnSalvar.dataset.perfilEditorInicializado =
            "true";


        btnSalvar.addEventListener(
            "click",
            async (evento) => {

                evento.preventDefault();

                await salvarSobre();

            }
        );

    }


    const descricao =
        el(ids.descricao);


    if (
        descricao &&
        descricao.dataset.perfilEditorInicializado !== "true"
    ) {

        descricao.dataset.perfilEditorInicializado =
            "true";


        descricao.addEventListener(
            "input",
            atualizarContador
        );

    }


    const btnSalvarTopo =
        el(ids.btnSalvarTopo);


    if (
        btnSalvarTopo &&
        btnSalvarTopo.dataset.perfilEditorInicializado !== "true"
    ) {

        btnSalvarTopo.dataset.perfilEditorInicializado =
            "true";


        btnSalvarTopo.addEventListener(
            "click",
            async (evento) => {

                evento.preventDefault();


                const aba =
                    estado.abaAtual;


                if (
                    aba === "sobre"
                ) {

                    await salvarSobre();

                    return;

                }


                if (
                    aba === "portfolio" &&
                    window.PerfilPortfolio &&
                    typeof window.PerfilPortfolio.salvar === "function"
                ) {

                    await window.PerfilPortfolio.salvar();

                    return;

                }


                if (
                    aba === "agenda" &&
                    window.PerfilAgenda &&
                    typeof window.PerfilAgenda.salvar === "function"
                ) {

                    await window.PerfilAgenda.salvar();

                    return;

                }


                if (
                    aba === "servicos" &&
                    window.PerfilServicos &&
                    typeof window.PerfilServicos.salvar === "function"
                ) {

                    await window.PerfilServicos.salvar();

                    return;

                }

            }
        );

    }


    const btnCancelar =
        el(ids.btnCancelar);


    if (
        btnCancelar &&
        btnCancelar.dataset.perfilEditorInicializado !== "true"
    ) {

        btnCancelar.dataset.perfilEditorInicializado =
            "true";


        btnCancelar.addEventListener(
            "click",
            () => {

                window.location.href =
                    CONFIG.paginaPerfil;

            }
        );

    }


    const btnVoltar =
        el(ids.btnVoltar);


    if (
        btnVoltar &&
        btnVoltar.dataset.perfilEditorInicializado !== "true"
    ) {

        btnVoltar.dataset.perfilEditorInicializado =
            "true";


        btnVoltar.addEventListener(
            "click",
            voltarPerfil
        );

    }

}


/* ============================================================
   VOLTAR PARA PERFIL
   ============================================================ */

function voltarPerfil() {

    window.location.href =
        CONFIG.paginaPerfil;

}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function iniciar() {

    try {

        if (
            !window.PerfilEditorTipo
        ) {

            console.error(
                "PerfilEditor: PerfilEditorTipo não foi carregado."
            );

        }


        configurarModulos();


        if (
            window.PerfilAbas &&
            typeof window.PerfilAbas.inicializar === "function"
        ) {

            window.PerfilAbas.inicializar();

        }


        inicializarEventos();


        if (
            window.PerfilEditorFoto &&
            typeof window.PerfilEditorFoto.inicializar === "function"
        ) {

            window.PerfilEditorFoto.inicializar();

        } else {

            console.error(
                "PerfilEditor: PerfilEditorFoto não foi carregado."
            );

        }


        if (
            window.PerfilAgenda &&
            typeof window.PerfilAgenda.inicializar === "function"
        ) {

            window.PerfilAgenda.inicializar();

        } else {

            console.error(
                "PerfilEditor: PerfilAgenda não foi carregado."
            );

        }


        if (
            window.PerfilServicos &&
            typeof window.PerfilServicos.inicializar === "function"
        ) {

            window.PerfilServicos.inicializar();

        }


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.inicializarChips === "function"
        ) {

            window.PerfilUtils.inicializarChips();

        }


        carregarDados();

    } catch (erro) {

        console.error(
            "PerfilEditor: erro ao iniciar:",
            erro
        );


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.mostrarToast === "function"
        ) {

            window.PerfilUtils.mostrarToast(
                "Não foi possível iniciar o editor.",
                "erro"
            );

        } else {

            console.error(
                "PerfilUtils não está disponível."
            );

        }

    }

}


/* ============================================================
   API PÚBLICA
   ============================================================ */

return {

    CONFIG,

    estado,

    ids,

    contexto,

    iniciar,

    carregarDados,

    preencherFormulario,

    preencherAvatar,

    salvarSobre,

    inicializarEventos,

    atualizarContador,

    voltarPerfil,

    preencherTipoArtista,

    obterPaginaAtual,

    obterTipoConfigurado,

    resolverTipo,

    tipoPossuiRecurso,

    tipoPossuiInstrumentos,

    configurarInstrumentosPorTipo,

    configurarPortfolioPorTipo

};


})();


/* ============================================================
   DISPONIBILIZAR GLOBALMENTE
   ============================================================ */

window.PerfilEditor =
PerfilEditor;


/* ============================================================
   AUTO START
   ============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            PerfilEditor.iniciar();

        },
        {
            once: true
        }
    );


} else {

    PerfilEditor.iniciar();

}