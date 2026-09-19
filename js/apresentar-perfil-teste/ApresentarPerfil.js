"use strict";

/* =========================================================
   MUSICALWORLD
   Arquivo:
   js/apresentar-perfil-teste/ApresentarPerfil.js

   Responsabilidade:
   - Controlar o carregamento da nova página de apresentação
     de perfil.
   - Obter o ID do perfil pela URL.
   - Coordenar o módulo de dados.
   - Coordenar o módulo de renderização.
   - Coordenar o módulo de portfólio.
   - Coordenar o módulo de serviços.
   - Coordenar o módulo de ações.
   - Controlar o estado geral da página.

   IMPORTANTE:
   Este arquivo pertence exclusivamente à nova página
   "apresentar-perfil-teste.html".

   Ele NÃO utiliza os módulos da página antiga:

       ApresentarPerfilDados
       ApresentarPerfilRender
       ApresentarPerfilPortfolio
       ApresentarPerfilServicos
       ApresentarPerfilAcoes

   A nova página utiliza:

       ApresentarPerfilDadosTeste
       ApresentarPerfilRenderTeste
       ApresentarPerfilPortfolioTeste
       ApresentarPerfilServicosTeste
       ApresentarPerfilAcoesTeste

   Dessa forma podemos testar a nova estrutura sem
   interferir na página original que já está funcionando.
========================================================= */


/* =========================================================
   ESTADO PRINCIPAL
========================================================= */

const estado = {

    carregando: false,

    carregado: false,

    erro: null,

    perfilId: null,

    dados: null

};


/* =========================================================
   UTILITÁRIOS
========================================================= */

/*
 * Obtém um módulo global pelo nome.
 *
 * Isso evita acessar diretamente window[...] em vários
 * pontos do controlador.
 */
function obterModulo(nome) {

    if (!nome) {
        return null;
    }

    return window[nome] || null;
}


/*
 * Obtém o ID do perfil informado na URL.
 *
 * Formato esperado:
 *
 * apresentar-perfil-teste.html?id=UUID
 */
function obterPerfilId() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );


    const id =
        parametros.get("id") ||
        parametros.get("perfil_id") ||
        parametros.get("perfilId");


    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {

        return null;
    }


    return String(id).trim();
}


/*
 * Obtém o estado atual do módulo de dados.
 */
function obterEstadoDados() {

    const modulo =
        obterModulo(
            "ApresentarPerfilDadosTeste"
        );


    if (
        !modulo ||
        typeof modulo.obterEstado !== "function"
    ) {

        return null;
    }


    try {

        return modulo.obterEstado();

    } catch (erro) {

        console.error(
            "ApresentarPerfilTeste: erro ao obter estado dos dados:",
            erro
        );

        return null;
    }
}


/*
 * Atualiza o estado local com os dados carregados
 * pelo módulo ApresentarPerfilDadosTeste.
 */
function atualizarEstadoDados() {

    const estadoDados =
        obterEstadoDados();


    if (!estadoDados) {
        return null;
    }


    estado.dados =
        estadoDados;


    return estadoDados;
}


/* =========================================================
   EXIBIR / OCULTAR ERRO
========================================================= */

function exibirErro(erro) {

    estado.erro =
        erro || null;


    const elementoErro =
        document.getElementById(
            "profileError"
        );


    const elementoMensagem =
        document.getElementById(
            "profileErrorMessage"
        );


    const mensagem =
        erro &&
        erro.message
            ? erro.message
            : "Não foi possível carregar este perfil.";


    if (elementoMensagem) {

        elementoMensagem.textContent =
            mensagem;
    }


    if (elementoErro) {

        elementoErro.hidden =
            false;
    }


    /*
     * Esconde o conteúdo principal quando existe
     * um erro de carregamento.
     */
    const perfilPost =
        document.getElementById(
            "profilePost"
        );


    if (perfilPost) {

        perfilPost.hidden =
            true;
    }


    console.error(
        "ApresentarPerfilTeste:",
        mensagem,
        erro
    );
}


/*
 * Esconde o estado de erro.
 */
function ocultarErro() {

    const elementoErro =
        document.getElementById(
            "profileError"
        );


    if (elementoErro) {

        elementoErro.hidden =
            true;
    }


    const perfilPost =
        document.getElementById(
            "profilePost"
        );


    if (perfilPost) {

        perfilPost.hidden =
            false;
    }
}


/* =========================================================
   CARREGAMENTO DOS DADOS
========================================================= */

async function carregarDados() {

    const modulo =
        obterModulo(
            "ApresentarPerfilDadosTeste"
        );


    if (
        !modulo ||
        typeof modulo.carregarTudo !== "function"
    ) {

        throw new Error(
            "O módulo ApresentarPerfilDadosTeste não está disponível."
        );
    }


    console.log(
        "ApresentarPerfilTeste: carregando perfil:",
        estado.perfilId
    );


    await modulo.carregarTudo(
        estado.perfilId
    );


    const estadoDados =
        atualizarEstadoDados();


    if (!estadoDados) {

        throw new Error(
            "Nenhum estado de dados foi retornado."
        );
    }


    if (
        estadoDados.erro
    ) {

        throw new Error(
            estadoDados.erro.message ||
            "Erro ao carregar os dados do perfil."
        );
    }


    console.log(
        "ApresentarPerfilTeste: dados carregados:",
        estadoDados
    );


    return estadoDados;
}


/* =========================================================
   RENDERIZAÇÃO DO PERFIL
========================================================= */

async function renderizarPerfil() {

    const modulo =
        obterModulo(
            "ApresentarPerfilRenderTeste"
        );


    if (
        !modulo ||
        typeof modulo.renderizar !== "function"
    ) {

        throw new Error(
            "O módulo ApresentarPerfilRenderTeste não está disponível."
        );
    }


    console.log(
        "ApresentarPerfilTeste: renderizando dados gerais."
    );


    await modulo.renderizar(
        estado
    );
}


/* =========================================================
   PORTFÓLIO
========================================================= */

async function carregarPortfolio() {

    const modulo =
        obterModulo(
            "ApresentarPerfilPortfolioTeste"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilTeste: módulo de portfólio não encontrado."
        );

        return;
    }


    /*
     * O novo módulo de portfólio é responsável por
     * consultar a tabela portfolio_musicos.
     *
     * Portanto não precisamos duplicar a consulta aqui.
     */
    try {

        if (
            typeof modulo.carregar === "function"
        ) {

            await modulo.carregar();

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            await modulo.inicializar();

            return;
        }


        if (
            typeof modulo.renderizar === "function"
        ) {

            await modulo.renderizar();

            return;
        }


        console.warn(
            "ApresentarPerfilTeste: nenhuma função de inicialização encontrada no módulo de portfólio."
        );

    } catch (erro) {

        console.error(
            "ApresentarPerfilTeste: erro no portfólio:",
            erro
        );
    }
}


/* =========================================================
   SERVIÇOS
========================================================= */

async function carregarServicos() {

    const modulo =
        obterModulo(
            "ApresentarPerfilServicosTeste"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilTeste: módulo de serviços não encontrado."
        );

        return;
    }


    /*
     * Os serviços devem ser carregados pelo próprio
     * módulo de serviços.
     *
     * Isso mantém a responsabilidade de cada módulo
     * separada.
     */
    try {

        if (
            typeof modulo.carregar === "function"
        ) {

            await modulo.carregar();

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            await modulo.inicializar();

            return;
        }


        if (
            typeof modulo.renderizar === "function"
        ) {

            await modulo.renderizar();

            return;
        }


        console.warn(
            "ApresentarPerfilTeste: nenhuma função de inicialização encontrada no módulo de serviços."
        );

    } catch (erro) {

        console.error(
            "ApresentarPerfilTeste: erro nos serviços:",
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
            "ApresentarPerfilAcoesTeste"
        );


    if (!modulo) {

        console.warn(
            "ApresentarPerfilTeste: módulo de ações não encontrado."
        );

        return;
    }


    try {

        if (
            typeof modulo.configurar === "function"
        ) {

            modulo.configurar(
                estado
            );

            return;
        }


        if (
            typeof modulo.inicializar === "function"
        ) {

            modulo.inicializar(
                estado
            );

            return;
        }


        console.warn(
            "ApresentarPerfilTeste: nenhuma função de configuração encontrada no módulo de ações."
        );

    } catch (erro) {

        console.error(
            "ApresentarPerfilTeste: erro ao configurar ações:",
            erro
        );
    }
}


/* =========================================================
   FINALIZAÇÃO
========================================================= */

function finalizarCarregamento() {

    estado.carregando =
        false;

    estado.carregado =
        true;

    estado.erro =
        null;


    ocultarErro();


    document.documentElement.classList.remove(
        "profile-loading"
    );


    document.body.classList.remove(
        "profile-loading"
    );


    console.log(
        "=========================================="
    );

    console.log(
        "MUSICALWORLD — PERFIL DE TESTE CARREGADO"
    );

    console.log(
        "Perfil:",
        estado.perfilId
    );

    console.log(
        "=========================================="
    );
}


/* =========================================================
   CARREGAMENTO PRINCIPAL
========================================================= */

async function carregar() {

    /*
     * Evita iniciar dois carregamentos simultâneos.
     */
    if (estado.carregando) {

        console.warn(
            "ApresentarPerfilTeste: carregamento já está em andamento."
        );

        return estado;
    }


    estado.carregando =
        true;

    estado.carregado =
        false;

    estado.erro =
        null;


    try {

        console.log(
            "=========================================="
        );

        console.log(
            "INICIANDO PERFIL DE TESTE"
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
                "ID do perfil não informado na URL."
            );
        }


        console.log(
            "ID do perfil:",
            estado.perfilId
        );


        /* -------------------------------------------------
           OCULTAR ERRO ANTERIOR
        ------------------------------------------------- */

        ocultarErro();


        /* -------------------------------------------------
           DADOS PRINCIPAIS
        ------------------------------------------------- */

        await carregarDados();


        /* -------------------------------------------------
           RENDERIZAÇÃO PRINCIPAL
        ------------------------------------------------- */

        await renderizarPerfil();


        /* -------------------------------------------------
           PORTFÓLIO
        ------------------------------------------------- */

        await carregarPortfolio();


        /* -------------------------------------------------
           SERVIÇOS
        ------------------------------------------------- */

        await carregarServicos();


        /* -------------------------------------------------
           AÇÕES
        ------------------------------------------------- */

        configurarAcoes();


        /* -------------------------------------------------
           FINALIZAÇÃO
        ------------------------------------------------- */

        finalizarCarregamento();


        return estado;


    } catch (erro) {

        estado.carregando =
            false;

        estado.carregado =
            false;

        estado.erro =
            erro;


        exibirErro(
            erro
        );


        throw erro;
    }
}


/* =========================================================
   RECARREGAR
========================================================= */

async function recarregar() {

    estado.carregado =
        false;

    estado.erro =
        null;


    return carregar();
}


/* =========================================================
   OBTER ESTADO
========================================================= */

function obterEstado() {

    return {
        ...estado
    };
}


/* =========================================================
   API PÚBLICA
========================================================= */

const API = {

    carregar,

    recarregar,

    obterEstado,

    obterPerfilId: function () {

        return estado.perfilId;
    },

    estaCarregando: function () {

        return estado.carregando;
    },

    estaCarregado: function () {

        return estado.carregado;
    },

    obterErro: function () {

        return estado.erro;
    }

};


/* =========================================================
   EXPOR GLOBALMENTE
========================================================= */

window.ApresentarPerfilTeste =
    API;


/* =========================================================
   INICIALIZAÇÃO AUTOMÁTICA
=========================================================

   A nova página também pode chamar:

       ApresentarPerfilTeste.carregar()

   manualmente.

   Para evitar carregamento duplicado, a inicialização
   automática abaixo verifica o estado do documento.
========================================================= */

function iniciar() {

    carregar()
        .catch(function (erro) {

            console.error(
                "ApresentarPerfilTeste: erro durante a inicialização:",
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