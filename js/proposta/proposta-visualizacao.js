/* =========================================================
   MUSICALWORLD — CONTROLADOR DA VISUALIZAÇÃO DE PROPOSTA

   Arquivo:
   js/proposta/proposta-visualizacao.js

   Responsabilidade:

   * Inicializar a página de visualização da proposta.
   * Coordenar o módulo de dados.
   * Coordenar o módulo de renderização.
   * Coordenar o módulo de fluxo.
   * Carregar a proposta ao abrir a página.
   * Enviar os dados carregados para o renderizador.
   * Controlar o estado inicial da interface.

   Este arquivo NÃO deve:

   * Conter consultas Supabase diretamente.
   * Conter regras de negócio de aceitar/recusar.
   * Renderizar elementos individualmente.
   * Criar registros de contratação.

   Essas responsabilidades pertencem aos módulos específicos.

   Ordem esperada no HTML:

   1. proposta-visualizacao-dados.js
   2. proposta-visualizacao-render.js
   3. proposta-visualizacao-fluxo.js
   4. proposta-visualizacao.js
   ========================================================= */

/* =========================================================
REFERÊNCIAS DOS MÓDULOS
========================================================= */

const propostaVisualizacaoDados =
window.MusicalWorldPropostaVisualizacaoInterno;

const propostaVisualizacaoRender =
window.MusicalWorldPropostaVisualizacaoRender;

const propostaVisualizacaoFluxo =
window.MusicalWorldPropostaVisualizacaoFluxo;

/* =========================================================
ESTADO DO CONTROLADOR
========================================================= */

const propostaVisualizacaoEstado = {

    inicializado: false,

    carregando: false,

    dados: null

};

/* =========================================================
VALIDAR MÓDULOS
========================================================= */

function validarModulosVisualizacao() {

    console.log(
        "🔎 Validando módulos da visualização da proposta..."
    );

    if (!propostaVisualizacaoDados) {

        throw new Error(
            "Módulo de dados da proposta não foi carregado."
        );

    }

    console.log(
        "✅ Módulo de dados encontrado."
    );

    if (!propostaVisualizacaoRender) {

        throw new Error(
            "Módulo de renderização da proposta não foi carregado."
        );

    }

    console.log(
        "✅ Módulo de renderização encontrado."
    );

    if (!propostaVisualizacaoFluxo) {

        throw new Error(
            "Módulo de fluxo da proposta não foi carregado."
        );

    }

    console.log(
        "✅ Módulo de fluxo encontrado."
    );

    console.log(
        "🎯 Todos os módulos da visualização foram encontrados."
    );

}

/* =========================================================
MOSTRAR ERRO INICIAL
========================================================= */

function mostrarErroInicialVisualizacao(
    erro
) {

    console.error(
        "❌ MusicalWorldPropostaVisualizacao:",
        erro
    );

    const mensagem =
        erro &&
        erro.message
            ? erro.message
            : "Não foi possível carregar a proposta.";

    if (
        propostaVisualizacaoRender &&
        typeof propostaVisualizacaoRender.mostrarErro === "function"
    ) {

        console.log(
            "⚠️ Exibindo erro através do renderizador:",
            mensagem
        );

        propostaVisualizacaoRender.mostrarErro(
            mensagem
        );

        return;

    }

    /*
     * Fallback caso o módulo de renderização
     * não esteja disponível.
     */

    const loading =
        document.getElementById(
            "propostaLoading"
        );

    const erroContainer =
        document.getElementById(
            "propostaErro"
        );

    const erroMensagem =
        document.getElementById(
            "propostaErroMensagem"
        );

    if (loading) {

        loading.hidden =
            true;

    }

    if (erroContainer) {

        erroContainer.hidden =
            false;

    }

    if (erroMensagem) {

        erroMensagem.textContent =
            mensagem;

    }

}

/* =========================================================
CARREGAR PROPOSTA
========================================================= */

async function carregarPropostaVisualizacao() {

    console.log(
        "🚀 Iniciando carregamento da visualização da proposta..."
    );

    if (
        propostaVisualizacaoEstado.carregando
    ) {

        console.log(
            "⏳ Carregamento já está em andamento. Ignorando nova chamada."
        );

        return;

    }

    propostaVisualizacaoEstado.carregando =
        true;

    console.log(
        "🔄 Estado carregando = true."
    );

    try {

        /*
         * Garante que o estado de carregamento
         * seja apresentado antes da consulta.
         */

        console.log(
            "⏳ Exibindo estado de carregamento..."
        );

        if (
            propostaVisualizacaoRender &&
            typeof propostaVisualizacaoRender.mostrarCarregamento === "function"
        ) {

            propostaVisualizacaoRender.mostrarCarregamento();

            console.log(
                "✅ Estado de carregamento exibido."
            );

        } else {

            console.warn(
                "⚠️ mostrarCarregamento() não está disponível."
            );

        }

        /*
         * O módulo de dados é responsável por:
         *
         * - identificar o ID da proposta;
         * - identificar o usuário atual;
         * - carregar a contratação;
         * - verificar se o usuário participa da proposta;
         * - identificar se o usuário é remetente ou destinatário;
         * - carregar artista;
         * - carregar estabelecimento;
         * - carregar serviço;
         * - preparar o objeto final dos dados.
         */

        console.log(
            "📦 Chamando propostaVisualizacaoDados.inicializar()..."
        );

        const dados =
            await propostaVisualizacaoDados.inicializar();

        console.log(
            "📦 propostaVisualizacaoDados.inicializar() terminou."
        );

        if (!dados) {

            throw new Error(
                "Nenhum dado de proposta foi retornado."
            );

        }

        console.log(
            "✅ Dados da proposta recebidos pelo controlador:",
            dados
        );

        propostaVisualizacaoEstado.dados =
            dados;

        console.log(
            "💾 Dados armazenados no estado do controlador."
        );

        /*
         * Envia o objeto completo para o módulo
         * responsável exclusivamente pela interface.
         */

        console.log(
            "🎨 Chamando propostaVisualizacaoRender.renderizar()..."
        );

        if (
            !propostaVisualizacaoRender ||
            typeof propostaVisualizacaoRender.renderizar !== "function"
        ) {

            throw new Error(
                "A função renderizar() do módulo de visualização não está disponível."
            );

        }

        propostaVisualizacaoRender.renderizar(
            dados
        );

        console.log(
            "✅ propostaVisualizacaoRender.renderizar() terminou."
        );

        /*
         * Depois que a proposta foi carregada,
         * o módulo de fluxo pode configurar os
         * botões de aceitar, recusar e voltar.
         *
         * A própria renderização já determina se
         * o usuário pode responder à proposta.
         *
         * O módulo de fluxo também mantém a validação
         * de segurança no momento da ação.
         */

        console.log(
            "🔘 Preparando inicialização do módulo de fluxo..."
        );

        if (
            propostaVisualizacaoFluxo &&
            typeof propostaVisualizacaoFluxo.inicializar === "function"
        ) {

            console.log(
                "🔘 Chamando propostaVisualizacaoFluxo.inicializar()..."
            );

            propostaVisualizacaoFluxo.inicializar();

            console.log(
                "✅ propostaVisualizacaoFluxo.inicializar() terminou."
            );

        } else {

            console.warn(
                "⚠️ inicializar() do módulo de fluxo não está disponível."
            );

        }

        propostaVisualizacaoEstado.inicializado =
            true;

        console.log(
            "🎉 Visualização da proposta inicializada com sucesso."
        );

        console.log(
            "📊 Estado final do controlador:",
            propostaVisualizacaoEstado
        );

    } catch (
        erro
    ) {

        console.error(
            "❌ Erro durante o carregamento da visualização da proposta:",
            erro
        );

        mostrarErroInicialVisualizacao(
            erro
        );

    } finally {

        propostaVisualizacaoEstado.carregando =
            false;

        console.log(
            "🏁 Estado carregando = false."
        );

    }

}

/* =========================================================
INICIALIZAR PÁGINA
========================================================= */

async function inicializarPropostaVisualizacao() {

    console.log(
        "🚀 Inicializando controlador da visualização da proposta..."
    );

    if (
        propostaVisualizacaoEstado.inicializado
    ) {

        console.log(
            "ℹ️ Controlador já foi inicializado. Ignorando nova inicialização."
        );

        return;

    }

    try {

        validarModulosVisualizacao();

        console.log(
            "📄 Iniciando carregamento da proposta..."
        );

        await carregarPropostaVisualizacao();

        console.log(
            "🏁 inicializarPropostaVisualizacao() terminou."
        );

    } catch (
        erro
    ) {

        console.error(
            "❌ Erro na inicialização da página:",
            erro
        );

        mostrarErroInicialVisualizacao(
            erro
        );

    }

}

/* =========================================================
API PÚBLICA
========================================================= */

window.MusicalWorldPropostaVisualizacao = {

    inicializar:
        inicializarPropostaVisualizacao,

    carregar:
        carregarPropostaVisualizacao,

    obterEstado:
        function () {

            return {

                inicializado:
                    propostaVisualizacaoEstado.inicializado,

                carregando:
                    propostaVisualizacaoEstado.carregando,

                dados:
                    propostaVisualizacaoEstado.dados

            };

        }

};

/* =========================================================
INICIALIZAÇÃO DA PÁGINA

O arquivo é carregado no final do documento, portanto
o DOM já está disponível neste momento.
========================================================= */

console.log(
    "📌 proposta-visualizacao.js carregado."
);

if (
    document.readyState === "loading"
) {

    console.log(
        "⏳ DOM ainda carregando. Aguardando DOMContentLoaded..."
    );

    document.addEventListener(

        "DOMContentLoaded",

        inicializarPropostaVisualizacao,

        {
            once: true
        }

    );

} else {

    console.log(
        "✅ DOM já disponível. Inicializando imediatamente..."
    );

    inicializarPropostaVisualizacao();

}