"use strict";

/* =========================================================
   MUSICALWORLD / ARTISTASHOW
   Arquivo: ApresentarPerfil.js

   Responsabilidade:
   - Controlar o carregamento do perfil público
   - Obter o ID do perfil pela URL
   - Carregar os dados através de ApresentarPerfilDados
   - Identificar o tipo específico do perfil
   - Configurar os módulos de renderização
   - Renderizar o perfil
   - Configurar ações
   - Configurar seções
   - Preparar a página para diferentes tipos de perfil

   IMPORTANTE:
   O tipo específico do artista vem de:

   perfis_artistas.tipo_artista

   O valor:

   perfis.tipo.nome = "artista"

   é apenas a categoria geral e NÃO deve ser usado
   para determinar o tipo artístico específico.
========================================================= */


/* =========================================================
   ESTADO
========================================================= */

const estado = {
    carregado: false,

    perfilId: null,

    dados: null,

    tipo: null,
    tipoChave: null,
    tipoNome: null,

    categoria: null,

    recursos: null
};


/* =========================================================
   UTILITÁRIOS
========================================================= */

function obterModulo(nome) {

    if (!nome) {
        return null;
    }

    return window[nome] || null;
}


function obterDadosDosModulos() {

    const moduloDados =
        obterModulo("ApresentarPerfilDados");

    if (
        !moduloDados ||
        typeof moduloDados.obterEstado !== "function"
    ) {
        return null;
    }

    try {

        return moduloDados.obterEstado();

    } catch (erro) {

        console.error(
            "Erro ao obter estado dos dados do perfil:",
            erro
        );

        return null;
    }
}


function obterDadosPerfil() {

    const estadoDados =
        estado.dados || {};

    return (
        estadoDados.dados ||
        estadoDados
    );
}


/* =========================================================
   MÓDULO DE TIPOS
========================================================= */

function obterTipoModule() {

    return (
        window.ApresentarPerfilTipo ||
        null
    );
}


/* =========================================================
   IDENTIFICAÇÃO DO TIPO
========================================================= */

function tentarObterTipo(modulo, valor) {

    if (
        !modulo ||
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return null;
    }


    /* -----------------------------------------------------
       1. TENTA OBTER DIRETAMENTE
    ----------------------------------------------------- */

    if (
        typeof modulo.obterTipo === "function"
    ) {

        try {

            const tipoDireto =
                modulo.obterTipo(valor);

            if (
                tipoDireto &&
                typeof tipoDireto === "object" &&
                tipoDireto.chave
            ) {

                return tipoDireto;
            }

        } catch (erro) {

            console.warn(
                "Falha ao obter tipo diretamente:",
                valor,
                erro
            );
        }
    }


    /* -----------------------------------------------------
       2. NORMALIZA A CHAVE
    ----------------------------------------------------- */

    if (
        typeof modulo.normalizarChave === "function"
    ) {

        try {

            const chave =
                modulo.normalizarChave(valor);


            if (chave) {

                if (
                    typeof modulo.obterTipo === "function"
                ) {

                    const tipoNormalizado =
                        modulo.obterTipo(chave);


                    if (
                        tipoNormalizado &&
                        typeof tipoNormalizado === "object" &&
                        tipoNormalizado.chave
                    ) {

                        console.log(
                            "Tipo identificado após normalização:",
                            valor,
                            "→",
                            chave
                        );

                        return tipoNormalizado;
                    }
                }
            }

        } catch (erro) {

            console.warn(
                "Falha ao normalizar tipo de perfil:",
                valor,
                erro
            );
        }
    }


    /* -----------------------------------------------------
       NÃO IDENTIFICADO
    ----------------------------------------------------- */

    console.warn(
        "Não foi possível interpretar o tipo:",
        valor
    );

    return null;
}


function identificarTipo() {

    const modulo =
        obterTipoModule();


    if (!modulo) {

        console.error(
            "ApresentarPerfilTipo não está disponível."
        );

        return null;
    }


    const estadoDados =
        estado.dados || {};


    const dados =
        estadoDados.dados ||
        estadoDados;


    const perfil =
        dados.perfil ||
        estadoDados.perfil ||
        estado.perfil ||
        {};


    const artista =
        dados.perfilArtista ||
        estadoDados.perfilArtista ||
        estado.perfilArtista ||
        {};


    /* =====================================================
       DIAGNÓSTICO
    ===================================================== */

    console.log(
        "DEBUG — identificação do perfil:",
        {
            perfilId: estado.perfilId,

            tipoArtista:
                artista.tipo_artista,

            tipoArtistaCamelCase:
                artista.tipoArtista,

            tipoPerfil:
                dados.tipoPerfil,

            tipo:
                dados.tipo,

            perfilTipo:
                perfil.tipo,

            moduloDisponivel:
                !!modulo,

            obterTipoDisponivel:
                typeof modulo.obterTipo === "function",

            normalizarChaveDisponivel:
                typeof modulo.normalizarChave === "function"
        }
    );


    /* =====================================================
       PRIORIDADE 1
       TIPO ESPECÍFICO DO ARTISTA
    ===================================================== */

    const valoresPrioridadeArtista = [

        artista.tipo_artista,

        artista.tipoArtista

    ];


    for (
        let i = 0;
        i < valoresPrioridadeArtista.length;
        i++
    ) {

        const valor =
            valoresPrioridadeArtista[i];


        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            continue;
        }


        console.log(
            "TESTE PRIORIDADE 1:",
            valor
        );


        const tipo =
            tentarObterTipo(
                modulo,
                valor
            );


        if (tipo) {

            console.log(
                "Tipo encontrado em perfis_artistas:",
                tipo
            );

            return tipo;
        }
    }


    /* =====================================================
       PRIORIDADE 2
       OUTROS CAMPOS POSSÍVEIS DO PERFIL ARTÍSTICO
    ===================================================== */

    const valoresAlternativosArtista = [

        artista.tipo,

        artista.tipo_perfil,

        artista.tipoPerfil,

        perfil.tipo_artista,

        perfil.tipoArtista,

        perfil.tipo_perfil_artista,

        perfil.tipoPerfilArtista,

        dados.tipoArtista,

        dados.tipo_artista

    ];


    for (
        let i = 0;
        i < valoresAlternativosArtista.length;
        i++
    ) {

        const valor =
            valoresAlternativosArtista[i];


        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            continue;
        }


        const tipo =
            tentarObterTipo(
                modulo,
                valor
            );


        if (tipo) {

            console.log(
                "Tipo encontrado em campo alternativo:",
                valor,
                tipo
            );

            return tipo;
        }
    }


    /* =====================================================
       PRIORIDADE 3
       TIPO DO ESTADO
    ===================================================== */

    const valoresEstado = [

        dados.tipoPerfil,

        dados.tipo,

        dados.tipo_perfil

    ];


    for (
        let i = 0;
        i < valoresEstado.length;
        i++
    ) {

        const valor =
            valoresEstado[i];


        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            continue;
        }


        const tipoTexto =
            String(valor)
                .trim()
                .toLowerCase();


        if (
            tipoTexto === "artista" ||
            tipoTexto === "contratante"
        ) {
            continue;
        }


        const tipo =
            tentarObterTipo(
                modulo,
                valor
            );


        if (tipo) {

            console.log(
                "Tipo encontrado no estado:",
                valor,
                tipo
            );

            return tipo;
        }
    }


    /* =====================================================
       PRIORIDADE 4
       RELACIONAMENTO perfis.tipo
    ===================================================== */

    let perfilTipo =
        perfil.tipo;


    if (
        perfilTipo &&
        typeof perfilTipo === "object"
    ) {

        perfilTipo =
            perfilTipo.nome ||
            perfilTipo.tipo ||
            perfilTipo.chave;
    }


    if (
        perfilTipo !== null &&
        perfilTipo !== undefined &&
        perfilTipo !== ""
    ) {

        const tipoTexto =
            String(perfilTipo)
                .trim()
                .toLowerCase();


        if (
            tipoTexto !== "artista" &&
            tipoTexto !== "contratante"
        ) {

            const tipo =
                tentarObterTipo(
                    modulo,
                    perfilTipo
                );


            if (tipo) {

                console.log(
                    "Tipo encontrado no relacionamento do perfil:",
                    perfilTipo,
                    tipo
                );

                return tipo;
            }
        }
    }


    /* =====================================================
       ERRO DE IDENTIFICAÇÃO
    ===================================================== */

    console.error(
        "Não foi possível identificar o tipo do perfil.",
        {
            perfil,
            artista,
            dados
        }
    );


    return null;
}


/* =========================================================
   CONFIGURAR TIPO
========================================================= */

function configurarTipo() {

    const tipo =
        identificarTipo();


    if (!tipo) {

        console.error(
            "Falha ao configurar o tipo do perfil."
        );

        return false;
    }


    estado.tipo =
        tipo;

    estado.tipoChave =
        tipo.chave || null;

    estado.tipoNome =
        tipo.nome || null;

    estado.categoria =
        tipo.categoria || null;

    estado.recursos =
        tipo.recursos || null;


    console.log(
        "Tipo de perfil configurado:",
        {
            chave: estado.tipoChave,
            nome: estado.tipoNome,
            categoria: estado.categoria,
            recursos: estado.recursos
        }
    );


    return true;
}


/* =========================================================
   ATUALIZAR DADOS
========================================================= */

function atualizarDadosDosModulos() {

    const dados =
        obterDadosDosModulos();


    if (!dados) {
        return;
    }


    estado.dados =
        dados;


    console.log(
        "Dados do perfil atualizados:",
        estado.dados
    );
}


/* =========================================================
   OBTER ID DO PERFIL
========================================================= */

function obterPerfilId() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get("id");


    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {

        console.error(
            "ID do perfil não encontrado na URL."
        );

        return null;
    }


    return id;
}


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

    const moduloDados =
        obterModulo(
            "ApresentarPerfilDados"
        );


    if (
        !moduloDados ||
        typeof moduloDados.carregarTudo !== "function"
    ) {

        throw new Error(
            "O módulo ApresentarPerfilDados não está disponível."
        );
    }


    console.log(
        "Carregando perfil:",
        estado.perfilId
    );


    await moduloDados.carregarTudo(
        estado.perfilId
    );


    atualizarDadosDosModulos();


    if (!estado.dados) {

        throw new Error(
            "Nenhum dado foi retornado para este perfil."
        );
    }


    console.log(
        "Dados carregados com sucesso:",
        estado.dados
    );
}


/* =========================================================
   RENDERIZAÇÃO PRINCIPAL
========================================================= */

async function renderizar() {

    const moduloRender =
        obterModulo(
            "ApresentarPerfilRender"
        );


    if (!moduloRender) {

        console.warn(
            "ApresentarPerfilRender não está disponível."
        );

        return;
    }


    try {

        if (
            typeof moduloRender.renderizar === "function"
        ) {

            await moduloRender.renderizar(
                estado
            );

            return;
        }


        if (
            typeof moduloRender.renderizarPerfil === "function"
        ) {

            await moduloRender.renderizarPerfil(
                estado
            );

            return;
        }


        console.warn(
            "Nenhuma função de renderização encontrada em ApresentarPerfilRender."
        );

    } catch (erro) {

        console.error(
            "Erro ao renderizar perfil:",
            erro
        );

        throw erro;
    }
}


/* =========================================================
   PORTFÓLIO
========================================================= */

async function renderizarPortfolio() {

    const modulo =
        obterModulo(
            "ApresentarPerfilPortfolio"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilPortfolio não está disponível."
        );

        return;
    }


    const dados =
        obterDadosPerfil();


    const portfolio =
        Array.isArray(dados.portfolio)
            ? dados.portfolio
            : [];


    console.log(
        "Renderizando portfólio:",
        portfolio
    );


    try {

        /*
         * O módulo ApresentarPerfilPortfolio.js
         * espera receber diretamente o array
         * do portfólio.
         */

        if (
            typeof modulo.renderizar === "function"
        ) {

            await modulo.renderizar(
                portfolio
            );

            return;
        }


        if (
            typeof modulo.atualizar === "function"
        ) {

            await modulo.atualizar(
                portfolio
            );

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            await modulo.inicializar(
                portfolio
            );

            return;
        }


        console.warn(
            "Nenhuma função de renderização encontrada em ApresentarPerfilPortfolio."
        );

    } catch (erro) {

        console.error(
            "Erro ao renderizar portfólio:",
            erro
        );
    }
}


/* =========================================================
   SERVIÇOS
========================================================= */

async function renderizarServicos() {

    const modulo =
        obterModulo(
            "ApresentarPerfilServicos"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilServicos não está disponível."
        );

        return;
    }


    const dados =
        obterDadosPerfil();


    const servicos =
        Array.isArray(dados.servicos)
            ? dados.servicos
            : [];


    console.log(
        "Renderizando serviços:",
        servicos
    );


    try {

        if (
            typeof modulo.renderizar === "function"
        ) {

            await modulo.renderizar(
                servicos
            );

            return;
        }


        if (
            typeof modulo.renderizarServicos === "function"
        ) {

            await modulo.renderizarServicos(
                servicos
            );

            return;
        }


        if (
            typeof modulo.atualizar === "function"
        ) {

            await modulo.atualizar(
                servicos
            );

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            await modulo.inicializar(
                servicos
            );

            return;
        }


        console.warn(
            "Nenhuma função de renderização encontrada em ApresentarPerfilServicos."
        );

    } catch (erro) {

        console.error(
            "Erro ao renderizar serviços:",
            erro
        );
    }
}


/* =========================================================
   AGENDA
========================================================= */

async function renderizarAgenda() {

    const modulo =
        obterModulo(
            "ApresentarPerfilAgenda"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilAgenda não está disponível."
        );

        return;
    }


    const dados =
        obterDadosPerfil();


    const agenda =
        Array.isArray(dados.agenda)
            ? dados.agenda
            : [];


    console.log(
        "Renderizando agenda:",
        agenda
    );


    try {

        /*
         * A Agenda recebe diretamente o array
         * agenda carregado pelo ApresentarPerfilDados.
         */

        if (
            typeof modulo.renderizar === "function"
        ) {

            await modulo.renderizar(
                agenda
            );

            return;
        }


        if (
            typeof modulo.renderizarAgenda === "function"
        ) {

            await modulo.renderizarAgenda(
                agenda
            );

            return;
        }


        if (
            typeof modulo.atualizar === "function"
        ) {

            await modulo.atualizar(
                agenda
            );

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            await modulo.inicializar(
                agenda
            );

            return;
        }


        console.warn(
            "Nenhuma função de renderização encontrada em ApresentarPerfilAgenda."
        );

    } catch (erro) {

        console.error(
            "Erro ao renderizar agenda:",
            erro
        );
    }
}


/* =========================================================
   AVALIAÇÕES
========================================================= */

async function renderizarAvaliacoes() {

    const modulo =
        obterModulo(
            "ApresentarPerfilAvaliacoes"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilAvaliacoes não está disponível."
        );

        return;
    }


    const dados =
        obterDadosPerfil();


    const avaliacoes =
        Array.isArray(dados.avaliacoes)
            ? dados.avaliacoes
            : [];


    console.log(
        "Renderizando avaliações:",
        avaliacoes
    );


    try {

        if (
            typeof modulo.renderizar === "function"
        ) {

            await modulo.renderizar(
                avaliacoes
            );

            return;
        }


        if (
            typeof modulo.renderizarAvaliacoes === "function"
        ) {

            await modulo.renderizarAvaliacoes(
                avaliacoes
            );

            return;
        }


        if (
            typeof modulo.atualizar === "function"
        ) {

            await modulo.atualizar(
                avaliacoes
            );

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            await modulo.inicializar(
                avaliacoes
            );

            return;
        }


        console.warn(
            "Nenhuma função de renderização encontrada em ApresentarPerfilAvaliacoes."
        );

    } catch (erro) {

        console.error(
            "Erro ao renderizar avaliações:",
            erro
        );
    }
}


/* =========================================================
   AÇÕES
========================================================= */

function configurarAcoes() {

    const modulo =
        obterModulo(
            "ApresentarPerfilAcoes"
        );


    if (!modulo) {
        return;
    }


    try {

        if (
            typeof modulo.configurar === "function"
        ) {

            modulo.configurar(
                estado
            );

        } else if (
            typeof modulo.inicializar === "function"
        ) {

            modulo.inicializar(
                estado
            );
        }

    } catch (erro) {

        console.error(
            "Erro ao configurar ações do perfil:",
            erro
        );
    }
}


/* =========================================================
   SEÇÕES
========================================================= */

function configurarSecoes() {

    const modulo =
        obterModulo(
            "ApresentarPerfilSecoes"
        );


    if (!modulo) {
        return;
    }


    try {

        if (
            typeof modulo.configurar === "function"
        ) {

            modulo.configurar(
                estado
            );

        } else if (
            typeof modulo.inicializar === "function"
        ) {

            modulo.inicializar(
                estado
            );
        }

    } catch (erro) {

        console.error(
            "Erro ao configurar seções do perfil:",
            erro
        );
    }
}


/* =========================================================
   LIMPEZA DE CARREGAMENTO
========================================================= */

function removerEstadoCarregando() {

    document.documentElement.classList.remove(
        "profile-loading"
    );

    document.body.classList.remove(
        "profile-loading"
    );


    const loading =
        document.querySelector(
            "[data-profile-loading]"
        );


    if (loading) {

        loading.remove();
    }
}


/* =========================================================
   EXIBIR ERRO
========================================================= */

function exibirErro(erro) {

    console.error(
        "Erro ao carregar perfil público:",
        erro
    );


    const mensagem =
        erro &&
        erro.message
            ? erro.message
            : "Não foi possível carregar este perfil.";


    const elementosErro = [

        document.getElementById(
            "profileBio"
        ),

        document.getElementById(
            "profileName"
        )

    ];


    let exibiu = false;


    for (
        let i = 0;
        i < elementosErro.length;
        i++
    ) {

        const elemento =
            elementosErro[i];


        if (!elemento) {
            continue;
        }


        elemento.textContent =
            mensagem;


        exibiu = true;

        break;
    }


    if (!exibiu) {

        console.error(
            mensagem
        );
    }
}


/* =========================================================
   CARREGAMENTO PRINCIPAL
========================================================= */

async function carregar() {

    try {

        console.log(
            "=========================================="
        );

        console.log(
            "INICIANDO PERFIL PÚBLICO"
        );

        console.log(
            "=========================================="
        );


        /* -------------------------------------------------
           ID DO PERFIL
        ------------------------------------------------- */

        estado.perfilId =
            obterPerfilId();


        if (!estado.perfilId) {

            throw new Error(
                "ID do perfil não informado."
            );
        }


        console.log(
            "ID do perfil:",
            estado.perfilId
        );


        /* -------------------------------------------------
           CARREGAR DADOS
        ------------------------------------------------- */

        await carregarDados();


        /* -------------------------------------------------
           ATUALIZAR ESTADO
        ------------------------------------------------- */

        atualizarDadosDosModulos();


        /* -------------------------------------------------
           IDENTIFICAR TIPO
        ------------------------------------------------- */

        const tipoConfigurado =
            configurarTipo();


        if (!tipoConfigurado) {

            throw new Error(
                "Não foi possível identificar o tipo deste perfil."
            );
        }


        /* -------------------------------------------------
           RENDERIZAÇÃO PRINCIPAL
        ------------------------------------------------- */

        await renderizar();


        /* -------------------------------------------------
           MÓDULOS ESPECÍFICOS
        ------------------------------------------------- */

        await renderizarPortfolio();

        await renderizarServicos();

        await renderizarAgenda();

        await renderizarAvaliacoes();


        /* -------------------------------------------------
           AÇÕES
        ------------------------------------------------- */

        configurarAcoes();


        /* -------------------------------------------------
           SEÇÕES
        ------------------------------------------------- */

        configurarSecoes();


        /* -------------------------------------------------
           FINALIZAÇÃO
        ------------------------------------------------- */

        estado.carregado =
            true;


        removerEstadoCarregando();


        console.log(
            "=========================================="
        );

        console.log(
            "PERFIL PÚBLICO CARREGADO"
        );

        console.log(
            "Tipo:",
            estado.tipoNome
        );

        console.log(
            "Chave:",
            estado.tipoChave
        );

        console.log(
            "Portfólio:",
            Array.isArray(
                obterDadosPerfil().portfolio
            )
                ? obterDadosPerfil().portfolio.length
                : 0
        );

        console.log(
            "Agenda:",
            Array.isArray(
                obterDadosPerfil().agenda
            )
                ? obterDadosPerfil().agenda.length
                : 0
        );

        console.log(
            "=========================================="
        );


        return estado;


    } catch (erro) {

        estado.carregado =
            false;


        removerEstadoCarregando();

        exibirErro(
            erro
        );


        console.error(
            "Falha no carregamento do perfil:",
            erro
        );


        throw erro;
    }
}


/* =========================================================
   API PÚBLICA
========================================================= */

const API = {

    carregar,

    obterEstado: function () {

        return {
            ...estado
        };
    },

    obterTipo: function () {

        return estado.tipo;
    },

    obterTipoChave: function () {

        return estado.tipoChave;
    },

    obterTipoNome: function () {

        return estado.tipoNome;
    },

    obterPerfilId: function () {

        return estado.perfilId;
    },

    recarregar: async function () {

        estado.carregado =
            false;


        await carregar();

        return estado;
    }

};


/* =========================================================
   EXPOR GLOBALMENTE
========================================================= */

window.ApresentarPerfil =
    API;


/* =========================================================
   INICIALIZAÇÃO AUTOMÁTICA
========================================================= */

function iniciar() {

    carregar()
        .catch(function (erro) {

            console.error(
                "Erro durante a inicialização do perfil público:",
                erro
            );

        });
}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciar,
        {
            once: true
        }
    );

} else {

    iniciar();
}