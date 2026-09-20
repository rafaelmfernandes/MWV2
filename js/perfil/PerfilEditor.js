/* ============================================================
MUSICALWORLD — PERFIL EDITOR

Arquivo:
js/perfil/PerfilEditor.js

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

SUPORTE AOS TIPOS DE PERFIL:

ARTISTA:

* Foto
* Nome
* Nome de exibição
* Telefone
* E-mail
* Localização
* Sobre você
* Tipo de artista
* Área de atendimento
* Experiência
* Estilos
* Instrumentos
* Disponibilidade
* Conta
* Publicação
* Portfólio
* Agenda
* Serviços

CONTRATANTE:

* Foto
* Nome
* Nome de exibição
* Telefone
* E-mail
* Localização
* Sobre você
* Conta
* Publicação
* Portfólio
* Agenda

O contratante NÃO utiliza:

* Tipo de artista
* Área de atendimento
* Experiência
* Estilos
* Instrumentos
* Disponibilidade
* Serviços

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

Essas responsabilidades ficam nos módulos especializados.

IMPORTANTE SOBRE PUBLICAÇÃO:

perfil_publicado NÃO é calculado neste arquivo.

O valor deve ser definido pelo checkbox #perfilPublicado
e salvo diretamente pelo PerfilEditorDados.js.

IMPORTANTE SOBRE SERVIÇOS:

Serviços pertencem exclusivamente ao perfil de artista.

O PerfilEditor.js somente configura e solicita o
carregamento do PerfilServicos quando o perfil atual
for um artista.

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

    tipoPerfil:
        null,

    isArtista:
        false,

    isContratante:
        false,


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


    /* ====================================================
       FOTO DO PERFIL
       ==================================================== */

    fotoPreview:
        "fotoPreview",

    fotoPlaceholder:
        "fotoPlaceholder",

    fotoInput:
        "inputFoto",

    btnRemoverFoto:
        "btnRemoverFoto",


    /* ====================================================
       COMPATIBILIDADE COM OUTROS MÓDULOS
       ==================================================== */

    avatarImage:
        "avatarImage",

    avatarInitials:
        "avatarInitials",


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
   TIPO DE PERFIL
   ======================================================== */

function obterTipoPerfil() {

    const tipo =
        String(
            estado.tipoPerfil || ""
        )
            .trim()
            .toLowerCase();


    if (
        tipo === "artista" ||
        tipo === "contratante"
    ) {

        return tipo;

    }


    if (estado.isArtista === true) {

        return "artista";

    }


    if (estado.isContratante === true) {

        return "contratante";

    }


    return "";

}


/* ========================================================
   VERIFICAR ARTISTA
   ======================================================== */

function ehArtista() {

    return obterTipoPerfil() === "artista";

}


/* ========================================================
   VERIFICAR CONTRATANTE
   ======================================================== */

function ehContratante() {

    return obterTipoPerfil() === "contratante";

}


/* ========================================================
   ATUALIZAR ESTADO DO TIPO DE PERFIL
   ======================================================== */

function atualizarEstadoTipoPerfil(
    resultado
) {

    if (!resultado) {

        return;

    }


    if (
        resultado.tipoPerfil
    ) {

        estado.tipoPerfil =
            String(
                resultado.tipoPerfil
            )
                .trim()
                .toLowerCase();

    }


    if (
        typeof resultado.isArtista === "boolean"
    ) {

        estado.isArtista =
            resultado.isArtista;

    }


    if (
        typeof resultado.isContratante === "boolean"
    ) {

        estado.isContratante =
            resultado.isContratante;

    }


    if (
        estado.tipoPerfil === "artista"
    ) {

        estado.isArtista =
            true;

        estado.isContratante =
            false;

    }


    if (
        estado.tipoPerfil === "contratante"
    ) {

        estado.isArtista =
            false;

        estado.isContratante =
            true;

    }

}


/* ========================================================
   TIPO ARTÍSTICO
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
   ========================================================

   Somente artistas possuem instrumentos.

   Para contratante:

   - não inicializa PerfilInstrumentos;
   - não carrega instrumentos;
   - oculta o campo;
   - não acessa perfilArtista.

   ======================================================== */

function configurarInstrumentosPorTipo() {

    if (!ehArtista()) {

        if (
            window.PerfilInstrumentos &&
            typeof window.PerfilInstrumentos.destruir === "function"
        ) {

            window.PerfilInstrumentos.destruir();

        }


        const campoInstrumentos =
            el("campoInstrumentos");


        if (campoInstrumentos) {

            campoInstrumentos.style.display =
                "none";

        }


        return;

    }


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

   Somente artistas possuem estilos.

   ======================================================== */

function configurarEstilos() {

    if (!ehArtista()) {

        return;

    }


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

    if (!ehArtista()) {

        return;

    }


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
   ========================================================

   Portfólio permanece disponível para:

   - artista;
   - contratante.

   Por isso não existe bloqueio por tipo aqui.

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


    contexto.ehArtista =
        ehArtista;


    contexto.ehContratante =
        ehContratante;


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

    } else {

        console.warn(
            "PerfilEditor: PerfilEditorFoto não está disponível."
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

       A configuração pode acontecer normalmente, mas o
       módulo só será inicializado/carregado para artista.

       Isso evita que o módulo de serviços execute lógica
       artística para contratantes.

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
       ATUALIZAR TIPO DE PERFIL
       ==================================================== */

    atualizarEstadoTipoPerfil(
        resultado
    );


    /* ====================================================
       ATUALIZAR UI POR TIPO
       ==================================================== */

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.atualizarInterfacePorTipoPerfil === "function"
    ) {

        contexto.PerfilEditorUI.atualizarInterfacePorTipoPerfil();

    }


    /* ====================================================
       CONFIGURAÇÕES EXCLUSIVAS DE ARTISTA
       ==================================================== */

    if (ehArtista()) {

        configurarEstilos();

    }


    /* ====================================================
       FORMULÁRIO
       ==================================================== */

    if (
        contexto.PerfilEditorUI &&
        typeof contexto.PerfilEditorUI.preencherFormulario === "function"
    ) {

        contexto.PerfilEditorUI.preencherFormulario();

    }


    /* ====================================================
       ESTILOS
       ==================================================== */

    if (ehArtista()) {

        carregarEstilos();

    }


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

       SOMENTE ARTISTA.

       ==================================================== */

    if (
        ehArtista() &&
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
       ====================================================

       Artista e contratante.

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
   ======================================================== */

async function salvarSobre() {

    if (estado.salvando) {

        return;

    }


    const artista =
        ehArtista();


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


    /* ====================================================
       CAMPOS EXCLUSIVOS DO ARTISTA
       ==================================================== */

    let experiencia =
        "";


    let areaAtendimento =
        "";


    let tipoSelecionado =
        "";


    let disponivel =
        true;


    if (artista) {

        experiencia =
            String(
                campoExperiencia?.value || ""
            ).trim();


        areaAtendimento =
            String(
                campoArea?.value || ""
            ).trim();


        tipoSelecionado =
            String(
                campoTipo?.value || ""
            ).trim();


        disponivel =
            campoDisponivel
                ? Boolean(
                    campoDisponivel.checked
                )
                : true;

    }


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
       DADOS ARTÍSTICOS
       ==================================================== */

    let tipoValidado =
        null;


    let instrumentos =
        [];


    let estilos =
        [];


    let servicos =
        [];


    if (artista) {

        /* ================================================
           TIPO ARTÍSTICO
           ================================================ */

        tipoValidado =
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


        /* ================================================
           VERIFICAR ALTERAÇÃO DO TIPO
           ================================================ */

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


        /* ================================================
           INSTRUMENTOS
           ================================================ */

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
                    contexto.PerfilInstrumentos.obterSelecionados() || [];

            } else if (
                contexto.PerfilInstrumentos &&
                typeof contexto.PerfilInstrumentos.obterValores === "function"
            ) {

                instrumentos =
                    contexto.PerfilInstrumentos.obterValores() || [];

            } else {

                instrumentos =
                    Array.isArray(
                        estado.perfilArtista?.instrumentos
                    )
                        ? estado.perfilArtista.instrumentos
                        : [];

            }

        }


        /* ================================================
           ESTILOS MUSICAIS
           ================================================ */

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


        /* ================================================
           CHIPS DE SERVIÇOS DO PERFIL
           ================================================ */

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
            artista

                ? (
                    estado.perfilArtista?.foto_url ||
                    estado.usuario?.foto_url ||
                    null
                )

                : (
                    estado.usuario?.foto_url ||
                    null
                );


        let resultadoFoto =
            null;


        if (
            contexto.PerfilEditorFoto &&
            typeof contexto.PerfilEditorFoto.fazerUpload === "function"
        ) {

            resultadoFoto =
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
           FINALIZAR FOTO
           ================================================= */

        if (
            resultadoFoto &&
            contexto.PerfilEditorFoto &&
            typeof contexto.PerfilEditorFoto.finalizarFoto === "function"
        ) {

            await contexto.PerfilEditorFoto.finalizarFoto(
                resultadoFoto
            );

        }


        /* =================================================
           REFLETIR PUBLICAÇÃO
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
           ATUALIZAR DADOS COMUNS LOCALMENTE
           ================================================= */

        if (estado.usuario) {

            estado.usuario.nome =
                nome;

            estado.usuario.telefone =
                telefone;

        }


        if (estado.perfil) {

            estado.perfil.nome_exibicao =
                nomeExibicao;

            estado.perfil.descricao =
                descricao;

            estado.perfil.perfil_publicado =
                perfilPublicado;

        }


        /* =================================================
           ATUALIZAR DADOS ARTÍSTICOS LOCALMENTE
           ================================================= */

        if (artista) {

            if (
                resultado?.perfilArtista
            ) {

                estado.perfilArtista =
                    {
                        ...estado.perfilArtista,
                        ...resultado.perfilArtista
                    };

            }


            if (
                !estado.perfilArtista
            ) {

                estado.perfilArtista =
                    {};

            }


            if (
                tipoValidado?.nome
            ) {

                estado.perfilArtista.tipo_artista =
                    tipoValidado.nome;

            }


            if (
                fotoUrl
            ) {

                estado.perfilArtista.foto_url =
                    fotoUrl;

            }


            estado.perfilArtista.experiencia =
                experiencia;


            estado.perfilArtista.area_atendimento =
                areaAtendimento;


            estado.perfilArtista.disponivel =
                disponivel;


            estado.perfilArtista.instrumentos =
                [
                    ...instrumentos
                ];


            estado.perfilArtista.estilos =
                [
                    ...estilos
                ];


            estado.perfilArtista.servicos =
                [
                    ...servicos
                ];

        }


        /* =================================================
           ATUALIZAR FOTO NO USUÁRIO
           ================================================= */

        if (
            fotoUrl &&
            estado.usuario
        ) {

            estado.usuario.foto_url =
                fotoUrl;

        }


        /* =================================================
           ATUALIZAR TIPO VISUAL
           ================================================= */

        if (
            artista &&
            resultado?.perfilArtista?.tipo_artista
        ) {

            if (
                contexto.PerfilEditorUI &&
                typeof contexto.PerfilEditorUI.atualizarTipo === "function"
            ) {

                contexto.PerfilEditorUI.atualizarTipo(
                    resultado.perfilArtista.tipo_artista
                );

            }

        }


        /* =================================================
           ATUALIZAR INSTRUMENTOS
           ================================================= */

        if (artista) {

            configurarInstrumentosPorTipo();

        }


        /* =================================================
           AVATAR / FOTO
           ================================================= */

        preencherAvatar();


        /* =================================================
           FINALIZAR ESTADO DA FOTO
           ================================================= */

        estado.fotoArquivo =
            null;


        if (
            contexto.PerfilEditorFoto &&
            typeof contexto.PerfilEditorFoto.limpar === "function"
        ) {

            contexto.PerfilEditorFoto.limpar();

        }


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


    if (
        loadingText &&
        texto
    ) {

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

    } else if (
        tipo === "erro"
    ) {

        console.error(
            mensagem
        );

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
                            ehArtista() &&
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
           PORTFÓLIO
           =================================================

           Disponível para artista e contratante.

           ================================================= */

        if (
            contexto.PerfilPortfolio &&
            typeof contexto.PerfilPortfolio.inicializar === "function"
        ) {

            contexto.PerfilPortfolio.inicializar();

        }


        /* =================================================
           AGENDA
           =================================================

           Disponível para artista e contratante.

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

           Não inicializar a lógica de serviços para
           contratante.

           ================================================= */

        /*

           A inicialização será feita depois que os dados
           forem carregados e o tipo de perfil for conhecido.

        */


        /* =================================================
           ESTILOS MUSICAIS
           =================================================

           Não inicializar antes de saber se o usuário é
           artista.

           ================================================= */

        /*

           A inicialização será feita em carregarDados().

        */


        /* =================================================
           CHIPS
           =================================================

           Os chips são inicializados somente quando
           aplicáveis ao perfil.

           ================================================= */

        /*

           PerfilEstilos poderá inicializar seus próprios
           chips quando o perfil for identificado como
           artista.

        */


        /* =================================================
           CARREGAR DADOS
           ================================================= */

        await carregarDados();


        /* =================================================
           SERVIÇOS — ARTISTA
           ================================================= */

        if (
            ehArtista() &&
            contexto.PerfilServicos &&
            typeof contexto.PerfilServicos.inicializar === "function"
        ) {

            contexto.PerfilServicos.inicializar();

        }


        /* =================================================
           ESTILOS — ARTISTA
           ================================================= */

        if (
            ehArtista() &&
            contexto.PerfilEstilos &&
            typeof contexto.PerfilEstilos.inicializar === "function"
        ) {

            contexto.PerfilEstilos.inicializar();

        }


        /* =================================================
           CHIPS
           ================================================= */

        if (
            ehArtista() &&
            window.PerfilUtils &&
            typeof window.PerfilUtils.inicializarChips === "function"
        ) {

            window.PerfilUtils.inicializarChips();

        }


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


    configurarPortfolioPorTipo,


    obterTipoPerfil,


    ehArtista,


    ehContratante

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
