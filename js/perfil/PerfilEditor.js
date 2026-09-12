/* ============================================================
MUSICALWORLD — PERFIL EDITOR
Arquivo: PerfilEditor.js

RESPONSABILIDADE:

Este módulo é o ORQUESTRADOR do editor universal de perfil.

Ele é responsável por:

* manter o estado central do editor;
* configurar os módulos relacionados ao editor;
* coordenar PerfilEditorUI e PerfilEditorDados;
* coordenar PerfilEditorTipo;
* coordenar PerfilEditorFoto;
* coordenar PerfilAbas;
* coordenar PerfilPortfolio;
* coordenar PerfilAgenda;
* coordenar PerfilServicos;
* coordenar PerfilInstrumentos;
* coordenar PerfilEstilos;
* controlar eventos gerais do editor;
* decidir qual módulo deve executar cada ação;
* controlar a navegação do editor.

ESTE MÓDULO NÃO É RESPONSÁVEL POR:

* fazer consultas diretamente ao Supabase;
* montar queries de banco;
* preencher diretamente os campos HTML;
* implementar a lógica visual do avatar;
* implementar a lógica visual do formulário;
* fazer upload diretamente;
* implementar o CRUD do portfólio;
* implementar o CRUD da agenda;
* implementar o CRUD de serviços;
* implementar diretamente a seleção visual dos estilos.

Essas responsabilidades ficam nos módulos especializados:

PerfilEditorDados.js
→ banco de dados e estado vindo do Supabase.

PerfilEditorUI.js
→ interface, formulário, avatar e publicação.

PerfilEditorTipo.js
→ tipos artísticos e recursos por tipo.

PerfilEditorFoto.js
→ seleção e upload da foto.

PerfilAbas.js
→ controle das abas.

PerfilPortfolio.js
→ portfólio.

PerfilAgenda.js
→ agenda.

PerfilServicos.js
→ serviços e valores.

PerfilInstrumentos.js
→ instrumentos.

PerfilEstilos.js
→ estilos musicais e seleção dos chips.

IMPORTANTE SOBRE PUBLICAÇÃO:

perfil_publicado NÃO é calculado neste arquivo.

O valor deve ser definido pelo checkbox #perfilPublicado
e salvo diretamente pelo PerfilEditorDados.js.

Este arquivo não possui nenhuma regra que publique ou
despublique automaticamente.

IMPORTANTE SOBRE SERVIÇOS:

Os serviços cadastrados com seus respectivos valores
pertencem à tabela servicos_artistas.

O CRUD e a renderização dos serviços pertencem exclusivamente
ao PerfilServicos.js.

O PerfilEditor.js apenas configura o módulo e solicita
o carregamento dos serviços.

Não utilizar os chips de "servicos" do perfil para substituir
os serviços cadastrados na tabela servicos_artistas.

============================================================ */

const PerfilEditor = (() => {


"use strict";


/* ========================================================
   CONTROLE DE INICIALIZAÇÃO
   ======================================================== */

let inicializado = false;

let iniciando = false;


/* ========================================================
   PÁGINAS
   ======================================================== */

const PAGINA_EDITOR =
    "editar-perfil.html";


const PAGINA_PERFIL =
    "meu-perfil.html";


/* ========================================================
   UTILITÁRIO — PÁGINA ATUAL
   ======================================================== */

function obterPaginaAtual() {

    return (
        window.location.pathname
            .split("/")
            .pop() ||
        PAGINA_EDITOR
    );

}


/* ========================================================
   CONFIGURAÇÃO CENTRAL
   ======================================================== */

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


/* ========================================================
   ESTADO CENTRAL
   ========================================================

   O estado pertence ao orquestrador.

   Os módulos UI e Dados recebem uma referência para este
   mesmo objeto através do contexto.

   Assim evitamos duplicação de estado entre arquivos.

   Os módulos especializados também podem atualizar
   partes específicas deste estado através do contexto.
   ======================================================== */

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


/* ========================================================
   IDs DOS ELEMENTOS DA INTERFACE
   ======================================================== */

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
        "fotoInput",

    btnFoto:
        "btnFoto",


    form:
        "formPerfil",

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


    /* ====================================================
       PORTFÓLIO
       ==================================================== */

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


    /* ====================================================
       AGENDA
       ==================================================== */

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


    /* ====================================================
       SERVIÇOS
       ==================================================== */

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
        "servicosList",


    /* ====================================================
       INTERFACE GERAL
       ==================================================== */

    toast:
        "toast",

    toastMessage:
        "toastMessage",


    loadingOverlay:
        "loadingOverlay",

    loadingText:
        "loadingText"

};


/* ========================================================
   CONTEXTO COMPARTILHADO
   ========================================================

   Todos os módulos recebem o mesmo contexto.

   Isso evita dependências circulares e permite que:

   PerfilEditorUI
   PerfilEditorDados
   PerfilEditorFoto
   PerfilAbas
   PerfilPortfolio
   PerfilAgenda
   PerfilServicos
   PerfilInstrumentos
   PerfilEstilos

   trabalhem sobre o mesmo estado.
   ======================================================== */

const contexto = {

    CONFIG,

    estado,

    ids,


    get supabase() {

        return window.supabaseClient;

    },


    get el() {

        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.el === "function"
        ) {

            return window.PerfilUtils.el;

        }


        return el;

    },


    get utils() {

        return window.PerfilUtils || null;

    }

};


/* ========================================================
   ELEMENTO HTML
   ======================================================== */

function el(id) {

    if (!id) {

        return null;

    }


    return document.getElementById(id);

}


/* ========================================================
   TIPO ARTÍSTICO
   ========================================================

   Estas funções ficam aqui porque representam operações
   de coordenação utilizadas por outros módulos.

   A definição dos tipos continua pertencendo ao
   PerfilEditorTipo.js.
   ======================================================== */

function preencherTipoArtista(
    campoTipo,
    tipoBanco
) {

    if (!campoTipo) {

        return;

    }


    if (
        window.PerfilEditorUI &&
        typeof window.PerfilEditorUI.preencherTipoArtista === "function"
    ) {

        window.PerfilEditorUI.preencherTipoArtista(
            campoTipo,
            tipoBanco
        );

        return;

    }


    console.warn(
        "PerfilEditor: PerfilEditorUI.preencherTipoArtista não está disponível."
    );

}


function obterTipoConfigurado(valor) {

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


function resolverTipo(valor) {

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


function tipoPossuiRecurso(
    recurso,
    tipo
) {

    if (
        window.PerfilEditorTipo &&
        typeof window.PerfilEditorTipo.possuiRecurso === "function"
    ) {

        return window.PerfilEditorTipo.possuiRecurso(
            recurso,
            tipo
        );

    }


    return false;

}


function tipoPossuiInstrumentos(
    tipo
) {

    if (
        window.PerfilEditorTipo &&
        typeof window.PerfilEditorTipo.possuiInstrumentos === "function"
    ) {

        return window.PerfilEditorTipo.possuiInstrumentos(
            tipo
        );

    }


    return false;

}


/* ========================================================
   CONFIGURAR INSTRUMENTOS POR TIPO
   ======================================================== */

function configurarInstrumentosPorTipo() {

    const tipoAtual =
        estado.perfilArtista?.tipo_artista;


    const tipoConfigurado =
        resolverTipo(
            tipoAtual
        );


    const campoInstrumentos =
        el("campoInstrumentos");


    const possuiInstrumentos =
        tipoPossuiInstrumentos(
            tipoConfigurado ||
            tipoAtual
        );


    if (!possuiInstrumentos) {

        if (
            window.PerfilInstrumentos &&
            typeof window.PerfilInstrumentos.destruir === "function"
        ) {

            window.PerfilInstrumentos.destruir();

        }


        if (campoInstrumentos) {

            campoInstrumentos.style.display =
                "none";

        }


        return;

    }


    if (campoInstrumentos) {

        campoInstrumentos.style.display =
            "";

    }


    if (
        window.PerfilInstrumentos &&
        typeof window.PerfilInstrumentos.inicializar === "function"
    ) {

        window.PerfilInstrumentos.inicializar();

    }


    if (
        window.PerfilInstrumentos &&
        typeof window.PerfilInstrumentos.carregar === "function"
    ) {

        window.PerfilInstrumentos.carregar(
            estado.perfilArtista?.instrumentos || []
        );

    }

}


/* ========================================================
   CONFIGURAR ESTILOS MUSICAIS
   ========================================================

   O PerfilEstilos é responsável por:

   * criar os chips de estilos;
   * controlar seleção múltipla;
   * carregar estilos já existentes;
   * manter o estado dos estilos.

   O PerfilEditor somente coordena o módulo.

   O salvamento no Supabase continua pertencendo ao
   PerfilEditorDados.js.
   ======================================================== */

function configurarEstilos() {

    if (!window.PerfilEstilos) {

        console.warn(
            "PerfilEditor: PerfilEstilos não está disponível."
        );

        return;

    }


    if (
        typeof window.PerfilEstilos.configurar === "function"
    ) {

        window.PerfilEstilos.configurar(
            contexto
        );

    }


    if (
        typeof window.PerfilEstilos.inicializar === "function"
    ) {

        window.PerfilEstilos.inicializar();

    }

}


/* ========================================================
   CARREGAR ESTILOS MUSICAIS
   ======================================================== */

function carregarEstilos() {

    if (!window.PerfilEstilos) {

        return;

    }


    if (
        typeof window.PerfilEstilos.carregar !== "function"
    ) {

        return;

    }


    window.PerfilEstilos.carregar(
        estado.perfilArtista?.estilos || []
    );

}


/* ========================================================
   CONFIGURAR PORTFÓLIO
   ======================================================== */

async function configurarPortfolioPorTipo() {

    if (!window.PerfilPortfolio) {

        console.warn(
            "PerfilEditor: PerfilPortfolio não está disponível."
        );

        return [];

    }


    if (
        typeof window.PerfilPortfolio.configurar === "function"
    ) {

        window.PerfilPortfolio.configurar(
            contexto
        );

    }


    if (
        typeof window.PerfilPortfolio.carregar === "function"
    ) {

        const resultado =
            await window.PerfilPortfolio.carregar();


        if (Array.isArray(resultado)) {

            estado.portfolio =
                resultado;

        }


        return resultado || [];

    }


    return [];

}


/* ========================================================
   CONFIGURAÇÃO DOS MÓDULOS
   ======================================================== */

function configurarModulos() {

    /*
     * Disponibilizamos os módulos no contexto central.
     */

    contexto.PerfilEditorUI =
        window.PerfilEditorUI || null;


    contexto.PerfilEditorDados =
        window.PerfilEditorDados || null;


    contexto.PerfilEditorTipo =
        window.PerfilEditorTipo || null;


    contexto.PerfilEditorFoto =
        window.PerfilEditorFoto || null;


    contexto.PerfilAbas =
        window.PerfilAbas || null;


    contexto.PerfilPortfolio =
        window.PerfilPortfolio || null;


    contexto.PerfilAgenda =
        window.PerfilAgenda || null;


    contexto.PerfilServicos =
        window.PerfilServicos || null;


    contexto.PerfilInstrumentos =
        window.PerfilInstrumentos || null;


    contexto.PerfilEstilos =
        window.PerfilEstilos || null;


    /*
     * Funções de coordenação disponíveis para os módulos.
     */

    contexto.preencherTipoArtista =
        preencherTipoArtista;


    contexto.obterTipoConfigurado =
        obterTipoConfigurado;


    contexto.resolverTipo =
        resolverTipo;


    contexto.tipoPossuiRecurso =
        tipoPossuiRecurso;


    contexto.tipoPossuiInstrumentos =
        tipoPossuiInstrumentos;


    contexto.configurarInstrumentosPorTipo =
        configurarInstrumentosPorTipo;


    contexto.configurarEstilos =
        configurarEstilos;


    contexto.carregarEstilos =
        carregarEstilos;


    contexto.configurarPortfolioPorTipo =
        configurarPortfolioPorTipo;


    /* ====================================================
       UI
       ==================================================== */

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.configurar === "function"
    ) {

        contexto.PerfilEditorUI.configurar(
            contexto
        );

    } else {

        console.warn(
            "PerfilEditor: PerfilEditorUI não está disponível."
        );

    }


    /* ====================================================
       DADOS
       ==================================================== */

    if (
        contexto.PerfilEditorDados &&
        typeof contexto.PerfilEditorDados.configurar === "function"
    ) {

        contexto.PerfilEditorDados.configurar(
            contexto
        );

    } else {

        console.warn(
            "PerfilEditor: PerfilEditorDados não está disponível."
        );

    }


    /* ====================================================
       FOTO
       ==================================================== */

    if (
        contexto.PerfilEditorFoto &&
        typeof contexto.PerfilEditorFoto.configurar === "function"
    ) {

        contexto.PerfilEditorFoto.configurar(
            contexto
        );

    }


    /* ====================================================
       ABAS
       ==================================================== */

    if (
        contexto.PerfilAbas &&
        typeof contexto.PerfilAbas.configurar === "function"
    ) {

        contexto.PerfilAbas.configurar(
            contexto
        );

    }


    /* ====================================================
       PORTFÓLIO
       ==================================================== */

    if (
        contexto.PerfilPortfolio &&
        typeof contexto.PerfilPortfolio.configurar === "function"
    ) {

        contexto.PerfilPortfolio.configurar(
            contexto
        );

    }


    /* ====================================================
       AGENDA
       ==================================================== */

    if (
        contexto.PerfilAgenda &&
        typeof contexto.PerfilAgenda.configurar === "function"
    ) {

        contexto.PerfilAgenda.configurar(
            contexto
        );

    }


    /* ====================================================
       SERVIÇOS
       ====================================================

       O PerfilServicos é responsável pelo próprio estado,
       carregamento, renderização e CRUD.

       O Editor somente fornece o contexto.
       ==================================================== */

    if (
        contexto.PerfilServicos &&
        typeof contexto.PerfilServicos.configurar === "function"
    ) {

        contexto.PerfilServicos.configurar(
            contexto
        );

    }


    /* ====================================================
       INSTRUMENTOS
       ==================================================== */

    if (
        contexto.PerfilInstrumentos &&
        typeof contexto.PerfilInstrumentos.configurar === "function"
    ) {

        contexto.PerfilInstrumentos.configurar(
            contexto
        );

    }


    /* ====================================================
       ESTILOS MUSICAIS
       ==================================================== */

    if (
        contexto.PerfilEstilos &&
        typeof contexto.PerfilEstilos.configurar === "function"
    ) {

        contexto.PerfilEstilos.configurar(
            contexto
        );

    }

}


/* ========================================================
   CARREGAR DADOS
   ========================================================

   Primeiro carregamos o perfil principal.

   Depois que PerfilEditorDados termina, os módulos que
   possuem dados próprios são carregados.

   Cada módulo continua responsável por sua própria
   consulta e renderização.
   ======================================================== */

async function carregarDados() {

    if (
        !contexto.PerfilEditorDados ||
        typeof contexto.PerfilEditorDados.carregarDados !== "function"
    ) {

        throw new Error(
            "PerfilEditorDados não está disponível."
        );

    }


    const resultado =
        await contexto.PerfilEditorDados.carregarDados();


    if (!resultado) {

        return null;

    }


    /* ====================================================
       ESTILOS MUSICAIS
       ====================================================

       Inicializamos/carregamos os estilos antes do
       preenchimento visual do formulário.

       Assim, quando PerfilEditorUI tentar marcar os
       estilos existentes, os chips já estarão disponíveis.
       ==================================================== */

    configurarEstilos();


    /* ====================================================
       PREENCHIMENTO DA INTERFACE PRINCIPAL
       ==================================================== */

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.preencherFormulario === "function"
    ) {

        contexto.PerfilEditorUI.preencherFormulario();

    }


    /*
     * Garantimos novamente o carregamento dos estilos
     * depois do preenchimento do formulário.

     * Isso mantém o módulo como fonte oficial da seleção
     * dos estilos e também garante que os valores vindos
     * do banco permaneçam sincronizados.
     */

    carregarEstilos();


    /* ====================================================
       INSTRUMENTOS
       ==================================================== */

    configurarInstrumentosPorTipo();


    /* ====================================================
       PORTFÓLIO
       ==================================================== */

    try {

        await configurarPortfolioPorTipo();

    } catch (erroPortfolio) {

        console.error(
            "PerfilEditor: erro ao carregar portfólio:",
            erroPortfolio
        );

    }


    /* ====================================================
       SERVIÇOS
       ====================================================

       IMPORTANTE:

       O PerfilServicos.carregar() já:

       * consulta servicos_artistas;
       * atualiza PerfilServicos.estado.lista;
       * atualiza estado.servicosValores;
       * renderiza servicosList.

       Portanto, não copiamos novamente o retorno para o
       estado aqui.

       Isso evita que o Editor sobrescreva ou interfira
       no estado próprio do módulo de serviços.

       Os valores dos serviços também permanecem intactos.
       ==================================================== */

    if (
        contexto.PerfilServicos &&
        typeof contexto.PerfilServicos.carregar === "function"
    ) {

        try {

            await contexto.PerfilServicos.carregar();

        } catch (erroServicos) {

            console.error(
                "PerfilEditor: erro ao carregar serviços:",
                erroServicos
            );

        }

    }


    /* ====================================================
       AGENDA
       ==================================================== */

    if (
        contexto.PerfilAgenda &&
        typeof contexto.PerfilAgenda.carregar === "function"
    ) {

        try {

            const agenda =
                await contexto.PerfilAgenda.carregar();


            if (Array.isArray(agenda)) {

                estado.agenda =
                    agenda;

            }

        } catch (erroAgenda) {

            console.error(
                "PerfilEditor: erro ao carregar agenda:",
                erroAgenda
            );

        }

    }


    return resultado;

}


/* ========================================================
   PREENCHER FORMULÁRIO
   ======================================================== */

function preencherFormulario() {

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.preencherFormulario === "function"
    ) {

        return contexto.PerfilEditorUI.preencherFormulario();

    }


    console.warn(
        "PerfilEditor: PerfilEditorUI.preencherFormulario não está disponível."
    );

}


/* ========================================================
   PREENCHER AVATAR
   ======================================================== */

function preencherAvatar() {

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.preencherAvatar === "function"
    ) {

        return contexto.PerfilEditorUI.preencherAvatar();

    }


    console.warn(
        "PerfilEditor: PerfilEditorUI.preencherAvatar não está disponível."
    );

}


/* ========================================================
   ATUALIZAR CONTADOR
   ======================================================== */

function atualizarContador() {

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.atualizarContador === "function"
    ) {

        return contexto.PerfilEditorUI.atualizarContador();

    }

}


/* ========================================================
   SALVAR ABA SOBRE
   ========================================================

   A validação e o preparo dos dados pertencem ao fluxo
   do editor.

   A persistência fica no PerfilEditorDados.

   O CRUD de serviços continua fora deste método.
   ======================================================== */

async function salvarSobre() {

    if (estado.salvando) {

        return;

    }


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


    const campoPerfilPublicado =
        el("perfilPublicado");


    const nome =
        String(
            campoNome?.value || ""
        ).trim();


    const nomeExibicao =
        String(
            campoNomeExibicao?.value || ""
        ).trim();


    const telefone =
        String(
            campoTelefone?.value || ""
        ).trim();


    const localizacao =
        String(
            campoLocalizacao?.value || ""
        ).trim();


    const descricao =
        String(
            campoDescricao?.value || ""
        ).trim();


    const experiencia =
        String(
            campoExperiencia?.value || ""
        ).trim();


    const areaAtendimento =
        String(
            campoArea?.value || ""
        ).trim();


    const tipoSelecionado =
        String(
            campoTipo?.value || ""
        ).trim();


    const disponivel =
        campoDisponivel
            ? Boolean(
                campoDisponivel.checked
            )
            : true;


    /*
     * PUBLICAÇÃO
     *
     * O valor vem exclusivamente do checkbox.
     *
     * Não existe regra de completude neste módulo.
     */

    const perfilPublicado =
        campoPerfilPublicado
            ? Boolean(
                campoPerfilPublicado.checked
            )
            : estado.perfil?.perfil_publicado === true;


    /* ====================================================
       VALIDAÇÕES BÁSICAS
       ==================================================== */

    if (!nome) {

        mostrarToast(
            "Informe seu nome.",
            "erro"
        );

        campoNome?.focus();

        return;

    }


    if (!nomeExibicao) {

        mostrarToast(
            "Informe o nome de exibição.",
            "erro"
        );

        campoNomeExibicao?.focus();

        return;

    }


    if (
        descricao.length >
        1000
    ) {

        mostrarToast(
            "A descrição pode ter no máximo 1000 caracteres.",
            "erro"
        );

        campoDescricao?.focus();

        return;

    }


    /* ====================================================
       TIPO ARTÍSTICO
       ==================================================== */

    let tipoValidado =
        resolverTipo(
            tipoSelecionado
        );


    if (!tipoValidado) {

        const tipoDaPagina =
            contexto.PerfilEditorTipo &&
            typeof contexto.PerfilEditorTipo.obterTipoDaPaginaAtual === "function"

                ? contexto.PerfilEditorTipo.obterTipoDaPaginaAtual()

                : null;


        tipoValidado =
            tipoDaPagina ||
            null;

    }


    if (!tipoValidado) {

        mostrarToast(
            "Selecione um tipo artístico válido.",
            "erro"
        );

        campoTipo?.focus();

        return;

    }


    /* ====================================================
       VERIFICAR ALTERAÇÃO DO TIPO
       ==================================================== */

    const tipoAnterior =
        resolverTipo(
            estado.perfilArtista?.tipo_artista
        );


    const tipoMudou =
        Boolean(
            tipoAnterior?.nome &&
            tipoValidado?.nome &&
            tipoAnterior.nome !== tipoValidado.nome
        );


    if (tipoMudou) {

        const confirmar =
            window.confirm(
                `O tipo artístico será alterado de "${tipoAnterior.nome}" para "${tipoValidado.nome}". Deseja continuar?`
            );


        if (!confirmar) {

            return;

        }

    }


    /* ====================================================
       INSTRUMENTOS
       ==================================================== */

    let instrumentos = [];


    if (
        tipoPossuiInstrumentos(
            tipoValidado
        )
    ) {

        if (
            contexto.PerfilInstrumentos &&
            typeof contexto.PerfilInstrumentos.obterSelecionados === "function"
        ) {

            instrumentos =
                contexto.PerfilInstrumentos.obterSelecionados();

        } else if (
            contexto.PerfilInstrumentos &&
            typeof contexto.PerfilInstrumentos.obterValores === "function"
        ) {

            instrumentos =
                contexto.PerfilInstrumentos.obterValores();

        } else {

            instrumentos =
                Array.isArray(
                    estado.perfilArtista?.instrumentos
                )
                    ? estado.perfilArtista.instrumentos
                    : [];

        }

    }


    /* ====================================================
       ESTILOS MUSICAIS
       ====================================================

       Os estilos agora são controlados exclusivamente pelo
       PerfilEstilos.js.

       O módulo mantém o estado da seleção e entrega os
       valores para o PerfilEditorDados.js.

       O fallback para PerfilUtils permanece apenas como
       compatibilidade caso o módulo ainda não esteja
       disponível por algum motivo.
       ==================================================== */

    let estilos = [];


    if (
        contexto.PerfilEstilos &&
        typeof contexto.PerfilEstilos.obterSelecionados === "function"
    ) {

        estilos =
            contexto.PerfilEstilos.obterSelecionados() || [];

    } else if (
        window.PerfilEstilos &&
        typeof window.PerfilEstilos.obterSelecionados === "function"
    ) {

        estilos =
            window.PerfilEstilos.obterSelecionados() || [];

    } else if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.obterChipsSelecionados === "function"
    ) {

        estilos =
            window.PerfilUtils.obterChipsSelecionados(
                "estilos"
            ) || [];

    } else if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.obterValoresChips === "function"
    ) {

        estilos =
            window.PerfilUtils.obterValoresChips(
                "estilos"
            ) || [];

    } else {

        estilos =
            Array.isArray(
                estado.perfilArtista?.estilos
            )
                ? estado.perfilArtista.estilos
                : [];

    }


    /* ====================================================
       CHIPS DE SERVIÇOS DO PERFIL
       ====================================================

       Estes valores pertencem ao perfil artístico.

       Eles NÃO substituem os serviços cadastrados na
       tabela servicos_artistas.

       PerfilServicos continua responsável pelos serviços
       com nome, descrição, duração e preço.
       ==================================================== */

    let servicos = [];


    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.obterChipsSelecionados === "function"
    ) {

        servicos =
            window.PerfilUtils.obterChipsSelecionados(
                "servicos"
            ) || [];

    } else if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.obterValoresChips === "function"
    ) {

        servicos =
            window.PerfilUtils.obterValoresChips(
                "servicos"
            ) || [];

    } else {

        servicos =
            Array.isArray(
                estado.perfilArtista?.servicos
            )
                ? estado.perfilArtista.servicos
                : [];

    }


    /* ====================================================
       INICIAR SALVAMENTO
       ==================================================== */

    estado.salvando =
        true;


    bloquearBotoesSalvar(
        true
    );


    mostrarLoading(
        true,
        "Salvando perfil..."
    );


    try {

        /* =================================================
           FOTO
           ================================================= */

        let fotoUrl =
            estado.perfilArtista?.foto_url ||
            estado.usuario?.foto_url ||
            null;


        if (
            contexto.PerfilEditorFoto &&
            typeof contexto.PerfilEditorFoto.fazerUpload === "function"
        ) {

            const resultadoFoto =
                await contexto.PerfilEditorFoto.fazerUpload();


            if (
                resultadoFoto &&
                typeof resultadoFoto === "string"
            ) {

                fotoUrl =
                    resultadoFoto;

            } else if (
                resultadoFoto?.url
            ) {

                fotoUrl =
                    resultadoFoto.url;

            }

        }


        /* =================================================
           DADOS PARA O MÓDULO DE PERSISTÊNCIA
           ================================================= */

        const dadosSalvar = {

            nome,

            nomeExibicao,

            telefone,

            localizacao,

            descricao,

            experiencia,

            areaAtendimento,

            tipoValidado,

            disponivel,

            instrumentos,

            estilos,

            servicos,

            fotoUrl,

            perfilPublicado

        };


        if (
            !contexto.PerfilEditorDados ||
            typeof contexto.PerfilEditorDados.salvarPerfil !== "function"
        ) {

            throw new Error(
                "PerfilEditorDados.salvarPerfil não está disponível."
            );

        }


        const resultado =
            await contexto.PerfilEditorDados.salvarPerfil(
                dadosSalvar
            );


        /* =================================================
           REFLETIR PUBLICAÇÃO CONFIRMADA PELO BANCO
           ================================================= */

        if (
            resultado?.perfilPublicado !== undefined
        ) {

            if (
                contexto.PerfilEditorUI &&
                typeof contexto.PerfilEditorUI.atualizarPublicacaoConfirmada === "function"
            ) {

                contexto.PerfilEditorUI.atualizarPublicacaoConfirmada(
                    resultado.perfilPublicado
                );

            }

        }


        /* =================================================
           ATUALIZAR TIPO LOCAL
           ================================================= */

        if (
            resultado?.perfilArtista?.tipo_artista
        ) {

            estado.perfilArtista.tipo_artista =
                resultado.perfilArtista.tipo_artista;

        }


        /*
         * Mantemos os estilos salvos também no estado central.
         *
         * Isso evita que uma próxima operação local perca
         * a seleção que acabou de ser persistida.
         */

        if (
            Array.isArray(
                resultado?.perfilArtista?.estilos
            )
        ) {

            estado.perfilArtista.estilos =
                [
                    ...resultado.perfilArtista.estilos
                ];

        } else {

            estado.perfilArtista.estilos =
                [
                    ...estilos
                ];

        }


        if (
            contexto.PerfilEditorUI &&
            typeof contexto.PerfilEditorUI.atualizarTipo === "function"
        ) {

            contexto.PerfilEditorUI.atualizarTipo(
                estado.perfilArtista?.tipo_artista
            );

        }


        /* =================================================
           ATUALIZAR INSTRUMENTOS
           ================================================= */

        configurarInstrumentosPorTipo();


        /* =================================================
           AVATAR
           ================================================= */

        preencherAvatar();


        estado.fotoArquivo =
            null;


        mostrarLoading(
            false
        );


        mostrarToast(
            "Perfil salvo com sucesso.",
            "sucesso"
        );


        return resultado;

    } catch (erro) {

        console.error(
            "PerfilEditor: erro ao salvar perfil:",
            erro
        );


        mostrarLoading(
            false
        );


        mostrarToast(
            erro?.message ||
            "Não foi possível salvar o perfil.",
            "erro"
        );


        return null;

    } finally {

        estado.salvando =
            false;


        bloquearBotoesSalvar(
            false
        );

    }

}


/* ========================================================
   BLOQUEAR BOTÕES DE SALVAMENTO
   ======================================================== */

function bloquearBotoesSalvar(
    bloquear
) {

    const botoes = [

        el(ids.btnSalvar),

        el(ids.btnSalvarTopo)

    ];


    botoes.forEach(
        (botao) => {

            if (!botao) {

                return;

            }


            botao.disabled =
                Boolean(
                    bloquear
                );


            botao.setAttribute(
                "aria-busy",
                bloquear
                    ? "true"
                    : "false"
            );

        }
    );

}


/* ========================================================
   LOADING
   ======================================================== */

function mostrarLoading(
mostrar,
texto
) {


const overlay =
    el(ids.loadingOverlay);


const loadingText =
    el(ids.loadingText);


if (!overlay) {

    return;

}


if (loadingText && texto) {

    loadingText.textContent =
        texto;

}


overlay.style.display =
    mostrar
        ? "grid"
        : "none";


}



/* ========================================================
   TOAST
   ======================================================== */

function mostrarToast(
    mensagem,
    tipo
) {

    const toast =
        el(ids.toast);


    const toastMessage =
        el(ids.toastMessage);


    if (toastMessage) {

        toastMessage.textContent =
            mensagem || "";

    }


    if (toast) {

        toast.dataset.tipo =
            tipo || "info";


        toast.classList.add(
            "show"
        );


        window.clearTimeout(
            toast._perfilEditorTimeout
        );


        toast._perfilEditorTimeout =
            window.setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                3500
            );

    } else {

        /*
         * Fallback apenas quando não existe componente
         * de toast na página.
         */

        if (
            tipo === "erro"
        ) {

            console.error(
                mensagem
            );

        }

    }

}


/* ========================================================
   EVENTOS
   ======================================================== */

function inicializarEventos() {

    const formulario =
        el(ids.form);


    if (
        formulario &&
        !formulario.dataset.perfilEditorInicializado
    ) {

        formulario.dataset.perfilEditorInicializado =
            "true";


        formulario.addEventListener(
            "submit",
            (evento) => {

                evento.preventDefault();

                salvarSobre();

            }
        );

    }


    const botaoSalvar =
        el(ids.btnSalvar);


    if (
        botaoSalvar &&
        !botaoSalvar.dataset.perfilEditorInicializado
    ) {

        botaoSalvar.dataset.perfilEditorInicializado =
            "true";


        botaoSalvar.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();

                salvarSobre();

            }
        );

    }


    const campoDescricao =
        el(ids.descricao);


    if (
        campoDescricao &&
        !campoDescricao.dataset.perfilEditorInicializado
    ) {

        campoDescricao.dataset.perfilEditorInicializado =
            "true";


        campoDescricao.addEventListener(
            "input",
            atualizarContador
        );

    }


    const botaoSalvarTopo =
        el(ids.btnSalvarTopo);


    if (
        botaoSalvarTopo &&
        !botaoSalvarTopo.dataset.perfilEditorInicializado
    ) {

        botaoSalvarTopo.dataset.perfilEditorInicializado =
            "true";


        botaoSalvarTopo.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();


                switch (
                    estado.abaAtual
                ) {

                    case "portfolio":

                        if (
                            contexto.PerfilPortfolio &&
                            typeof contexto.PerfilPortfolio.salvar === "function"
                        ) {

                            contexto.PerfilPortfolio.salvar();

                        }

                        break;


                    case "agenda":

                        if (
                            contexto.PerfilAgenda &&
                            typeof contexto.PerfilAgenda.salvar === "function"
                        ) {

                            contexto.PerfilAgenda.salvar();

                        }

                        break;


                    case "servicos":

                        if (
                            contexto.PerfilServicos &&
                            typeof contexto.PerfilServicos.salvar === "function"
                        ) {

                            contexto.PerfilServicos.salvar();

                        }

                        break;


                    case "sobre":

                    default:

                        salvarSobre();

                        break;

                }

            }
        );

    }


    const botaoVoltar =
        el(ids.btnVoltar);


    if (
        botaoVoltar &&
        !botaoVoltar.dataset.perfilEditorInicializado
    ) {

        botaoVoltar.dataset.perfilEditorInicializado =
            "true";


        botaoVoltar.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();

                voltarPerfil();

            }
        );

    }


    const botaoCancelar =
        el(ids.btnCancelar);


    if (
        botaoCancelar &&
        !botaoCancelar.dataset.perfilEditorInicializado
    ) {

        botaoCancelar.dataset.perfilEditorInicializado =
            "true";


        botaoCancelar.addEventListener(
            "click",
            (evento) => {

                evento.preventDefault();

                voltarPerfil();

            }
        );

    }

}


/* ========================================================
   VOLTAR PARA O PERFIL
   ======================================================== */

function voltarPerfil() {

    window.location.href =
        CONFIG.paginaPerfil;

}


/* ========================================================
   INICIALIZAÇÃO
   ======================================================== */

async function iniciar() {

    if (
        inicializado ||
        iniciando
    ) {

        return;

    }


    iniciando =
        true;


    try {

        if (!window.PerfilEditorTipo) {

            console.warn(
                "PerfilEditor: PerfilEditorTipo não foi carregado."
            );

        }


        configurarModulos();


        /* =================================================
           ABAS
           ================================================= */

        if (
            contexto.PerfilAbas &&
            typeof contexto.PerfilAbas.inicializar === "function"
        ) {

            contexto.PerfilAbas.inicializar();

        }


        /* =================================================
           EVENTOS GERAIS
           ================================================= */

        inicializarEventos();


        /* =================================================
           FOTO
           ================================================= */

        if (
            contexto.PerfilEditorFoto &&
            typeof contexto.PerfilEditorFoto.inicializar === "function"
        ) {

            contexto.PerfilEditorFoto.inicializar();

        }


        /* =================================================
           AGENDA
           ================================================= */

        if (
            contexto.PerfilAgenda &&
            typeof contexto.PerfilAgenda.inicializar === "function"
        ) {

            contexto.PerfilAgenda.inicializar();

        }


        /* =================================================
           SERVIÇOS
           =================================================

           O módulo é inicializado antes do carregamento
           dos dados porque ele precisa registrar seus
           eventos dos campos de serviço.

           O carregamento real acontece depois que o
           PerfilEditorDados disponibiliza o perfil_id.
           ================================================= */

        if (
            contexto.PerfilServicos &&
            typeof contexto.PerfilServicos.inicializar === "function"
        ) {

            contexto.PerfilServicos.inicializar();

        }


        /* =================================================
           ESTILOS MUSICAIS
           =================================================

           O módulo é inicializado antes do carregamento
           dos dados para que os chips já existam quando
           o PerfilEditorUI preencher o formulário.
           ================================================= */

        if (
            contexto.PerfilEstilos &&
            typeof contexto.PerfilEstilos.inicializar === "function"
        ) {

            contexto.PerfilEstilos.inicializar();

        }


        /* =================================================
           CHIPS
           ================================================= */

        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.inicializarChips === "function"
        ) {

            window.PerfilUtils.inicializarChips();

        }


        /* =================================================
           CARREGAR DADOS
           ================================================= */

        await carregarDados();


        inicializado =
            true;

    } catch (erro) {

        console.error(
            "PerfilEditor: erro durante inicialização:",
            erro
        );


        mostrarToast(
            erro?.message ||
            "Não foi possível carregar o editor de perfil.",
            "erro"
        );

    } finally {

        iniciando =
            false;

    }

}


/* ========================================================
   API PÚBLICA
   ======================================================== */

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


    configurarEstilos,


    carregarEstilos,


    configurarPortfolioPorTipo

};


})();

/* ============================================================
EXPOSIÇÃO GLOBAL
============================================================ */

window.PerfilEditor =
PerfilEditor;

/* ============================================================
INICIALIZAÇÃO AUTOMÁTICA
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
