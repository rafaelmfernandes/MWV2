
/* =========================================================
MUSICALWORLD — FLUXO DE VISUALIZAÇÃO DA PROPOSTA

Arquivo:
js/proposta/proposta-visualizacao-fluxo.js

Responsabilidade:

* Controlar as ações de aceitar e recusar uma proposta.
* Validar se o usuário atual é o destinatário da proposta
  antes de permitir qualquer resposta.
* Permitir que o remetente visualize a proposta sem
  permitir que ele aceite ou recuse.
* Garantir que somente propostas pendentes possam ser respondidas.
* Atualizar o status da contratação no Supabase.
* Manter o mesmo registro de contratação após a resposta.
* Encaminhar uma proposta aceita para o acompanhamento da contratação.
* Não carregar dados da proposta para a renderização inicial.
* Não controlar diretamente a renderização da página.

Fluxo:

PROPOSTA ENVIADA PELO ARTISTA
↓
solicitacao_enviada
↓
visualização somente leitura

PROPOSTA RECEBIDA PELO ESTABELECIMENTO
↓
solicitacao_enviada
↓
┌───────────────┐
↓               ↓
ACEITAR         RECUSAR
↓               ↓
confirmada       recusada
↓
acompanhamento

Observação:

* A proposta não cria uma segunda contratação.
* O mesmo registro da tabela "contratacoes" é atualizado.
  ========================================================= */


/* =========================================================
NAMESPACE INTERNO
========================================================= */

window.MusicalWorldPropostaVisualizacaoFluxo =
window.MusicalWorldPropostaVisualizacaoFluxo || {};


/* =========================================================
REFERÊNCIAS DOS MÓDULOS
========================================================= */

const propostaFluxoDados =
window.MusicalWorldPropostaVisualizacaoInterno;

const propostaFluxoRender =
window.MusicalWorldPropostaVisualizacaoRender;


/* =========================================================
CONFIGURAÇÕES
========================================================= */

const PROPOSTA_FLUXO_CONFIG = {

    tabelaContratacoes: "contratacoes",

    statusPendente: "solicitacao_enviada",

    statusAceita: "confirmada",

    statusRecusada: "recusada",

    paginaAcompanhamento:
        "contratacao-acompanhamento.html",

    paginaContratacoes:
        "contratacoes.html"

};


/* =========================================================
ESTADO INTERNO
========================================================= */

const propostaFluxoEstado = {

    processando: false,

    acaoAtual: null

};


/* =========================================================
OBTER SUPABASE
========================================================= */

function obterSupabaseFluxo() {

    if (
        propostaFluxoDados &&
        typeof propostaFluxoDados.obterSupabase === "function"
    ) {

        const supabase =
            propostaFluxoDados.obterSupabase();

        if (supabase) {

            return supabase;

        }

    }

    if (
        window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
    ) {

        return window.supabaseClient;

    }

    throw new Error(
        "Cliente Supabase não encontrado."
    );

}


/* =========================================================
OBTER ID DA PROPOSTA
========================================================= */

function obterIdDaPropostaFluxo() {

    if (
        propostaFluxoDados &&
        typeof propostaFluxoDados.obterIdDaProposta === "function"
    ) {

        return propostaFluxoDados.obterIdDaProposta();

    }

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const id =
        parametros.get("id");

    if (!id) {

        throw new Error(
            "ID da proposta não informado."
        );

    }

    return String(id).trim();

}


/* =========================================================
OBTER USUÁRIO ATUAL

Prioridade:

1. Utilizar o usuário já identificado pelo módulo
   proposta-visualizacao-dados.js.

2. Utilizar carregarUsuarioAtual() como fallback.

3. Utilizar Supabase Auth como último recurso.

Isso evita realizar uma segunda identificação
desnecessária do usuário quando o módulo de dados
já carregou corretamente o estado da página.
========================================================= */

async function obterUsuarioAtualFluxo() {

    /*
     * Primeiro utiliza o estado compartilhado pelo
     * módulo de dados da proposta.
     *
     * O arquivo proposta-visualizacao-dados.js já
     * identifica o usuário e armazena o ID em:
     *
     * propostaFluxoDados.estado.usuarioId
     */

    if (
        propostaFluxoDados &&
        propostaFluxoDados.estado &&
        propostaFluxoDados.estado.usuarioId
    ) {

        const usuarioId =
            String(
                propostaFluxoDados.estado.usuarioId
            ).trim();


        if (usuarioId) {

            console.log(
                "👤 Usuário atual reutilizado do módulo de dados:",
                usuarioId
            );


            return {

                id:
                    usuarioId

            };

        }

    }


    /*
     * Caso o estado compartilhado ainda não esteja
     * disponível, utiliza o método existente do
     * módulo de dados.
     */

    if (
        propostaFluxoDados &&
        typeof propostaFluxoDados.carregarUsuarioAtual === "function"
    ) {

        const usuario =
            await propostaFluxoDados.carregarUsuarioAtual();


        if (usuario) {

            const usuarioId =
                obterIdDoUsuarioFluxo(
                    usuario
                );


            if (usuarioId) {

                console.log(
                    "👤 Usuário atual identificado pelo módulo de dados:",
                    usuarioId
                );


                return {

                    ...usuario,

                    id:
                        usuarioId

                };

            }

        }

    }


    /*
     * Último fallback:
     * Supabase Auth.
     */

    const supabase =
        obterSupabaseFluxo();


    const {
        data,
        error
    } = await supabase.auth.getUser();


    if (error) {

        console.error(
            "❌ Erro ao identificar usuário pelo Supabase Auth:",
            error
        );


        throw new Error(
            "Não foi possível identificar o usuário atual."
        );

    }


    if (
        !data ||
        !data.user ||
        !data.user.id
    ) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    console.log(
        "👤 Usuário atual identificado pelo Supabase Auth:",
        data.user.id
    );


    return {

        id:
            data.user.id,

        email:
            data.user.email || null,

        authUser:
            data.user

    };

}


/* =========================================================
NORMALIZAR ID DO USUÁRIO
========================================================= */

function obterIdDoUsuarioFluxo(
    usuario
) {

    if (!usuario) {

        return null;

    }

    if (usuario.id) {

        return String(
            usuario.id
        ).trim();

    }

    if (usuario.usuarioId) {

        return String(
            usuario.usuarioId
        ).trim();

    }

    if (usuario.userId) {

        return String(
            usuario.userId
        ).trim();

    }

    if (
        usuario.authUser &&
        usuario.authUser.id
    ) {

        return String(
            usuario.authUser.id
        ).trim();

    }

    return null;

}


/* =========================================================
CARREGAR PROPOSTA ATUAL
========================================================= */

async function carregarPropostaParaAcao() {

    const id =
        obterIdDaPropostaFluxo();

    const supabase =
        obterSupabaseFluxo();

    const {
        data,
        error
    } = await supabase
        .from(
            PROPOSTA_FLUXO_CONFIG.tabelaContratacoes
        )
        .select("*")
        .eq(
            "id",
            id
        )
        .maybeSingle();

    if (error) {

        console.error(
            "MusicalWorldPropostaVisualizacaoFluxo: erro ao carregar proposta",
            error
        );

        throw new Error(
            "Não foi possível carregar a proposta."
        );

    }

    if (!data) {

        throw new Error(
            "Proposta não encontrada."
        );

    }

    return data;

}


/* =========================================================
VALIDAR DESTINATÁRIO

Esta validação continua sendo obrigatória para
qualquer ação de aceitar ou recusar.

O remetente pode visualizar a proposta, mas não
possui permissão para responder.
========================================================= */

function validarDestinatarioDaProposta(
    proposta,
    usuarioAtual
) {

    const usuarioId =
        obterIdDoUsuarioFluxo(
            usuarioAtual
        );

    if (!usuarioId) {

        throw new Error(
            "Não foi possível identificar o usuário atual."
        );

    }

    const contratadoId =
        proposta &&
        proposta.contratado_id
            ? String(
                proposta.contratado_id
            ).trim()
            : null;

    if (!contratadoId) {

        throw new Error(
            "A proposta não possui um destinatário válido."
        );

    }

    if (
        contratadoId !==
        usuarioId
    ) {

        throw new Error(
            "Você não tem permissão para responder esta proposta."
        );

    }

    return true;

}


/* =========================================================
IDENTIFICAR PAPEL DO USUÁRIO NA PROPOSTA

Possíveis papéis:

destinatario
    Usuário que recebeu a proposta.

remetente
    Usuário que enviou a proposta.

Apenas o destinatário pode responder.
========================================================= */

function obterPapelDoUsuarioNaProposta(
    proposta,
    usuarioAtual
) {

    const usuarioId =
        obterIdDoUsuarioFluxo(
            usuarioAtual
        );

    if (!usuarioId) {

        throw new Error(
            "Não foi possível identificar o usuário atual."
        );

    }

    const contratanteId =
        proposta &&
        proposta.contratante_id
            ? String(
                proposta.contratante_id
            ).trim()
            : null;

    const contratadoId =
        proposta &&
        proposta.contratado_id
            ? String(
                proposta.contratado_id
            ).trim()
            : null;

    if (
        usuarioId ===
        contratadoId
    ) {

        return "destinatario";

    }

    if (
        usuarioId ===
        contratanteId
    ) {

        return "remetente";

    }

    throw new Error(
        "Você não participa desta proposta."
    );

}


/* =========================================================
VALIDAR STATUS DA PROPOSTA
========================================================= */

function validarStatusDaProposta(
    proposta
) {

    const statusAtual =
        proposta &&
        proposta.status
            ? String(
                proposta.status
            ).trim()
            : null;

    if (
        statusAtual !==
        PROPOSTA_FLUXO_CONFIG.statusPendente
    ) {

        throw new Error(
            "Esta proposta não está mais aguardando resposta."
        );

    }

    return true;

}


/* =========================================================
ATUALIZAR STATUS DA PROPOSTA
========================================================= */

async function atualizarStatusDaProposta(
    proposta,
    novoStatus
) {

    const supabase =
        obterSupabaseFluxo();

    const propostaId =
        proposta &&
        proposta.id
            ? String(
                proposta.id
            ).trim()
            : null;

    if (!propostaId) {

        throw new Error(
            "ID da proposta não encontrado."
        );

    }

    const {
        data,
        error
    } = await supabase
        .from(
            PROPOSTA_FLUXO_CONFIG.tabelaContratacoes
        )
        .update({

            status:
                novoStatus

        })
        .eq(
            "id",
            propostaId
        )
        .eq(
            "contratado_id",
            proposta.contratado_id
        )
        .eq(
            "status",
            PROPOSTA_FLUXO_CONFIG.statusPendente
        )
        .select("*")
        .maybeSingle();

    if (error) {

        console.error(
            "MusicalWorldPropostaVisualizacaoFluxo: erro ao atualizar status",
            error
        );

        throw new Error(
            "Não foi possível atualizar a proposta."
        );

    }

    if (!data) {

        throw new Error(
            "A proposta já foi respondida ou não está mais disponível."
        );

    }

    return data;

}


/* =========================================================
MOSTRAR PROCESSAMENTO
========================================================= */

function mostrarProcessandoFluxo(
    acao
) {

    if (
        propostaFluxoRender &&
        typeof propostaFluxoRender.mostrarProcessando === "function"
    ) {

        propostaFluxoRender.mostrarProcessando(
            acao === "aceitar"
                ? "Aceitando proposta..."
                : "Recusando proposta..."
        );

    }

    propostaFluxoEstado.processando =
        true;

    propostaFluxoEstado.acaoAtual =
        acao;

}


/* =========================================================
ESCONDER PROCESSAMENTO
========================================================= */

function esconderProcessandoFluxo() {

    if (
        propostaFluxoRender &&
        typeof propostaFluxoRender.esconderProcessando === "function"
    ) {

        propostaFluxoRender.esconderProcessando();

    }

    propostaFluxoEstado.processando =
        false;

    propostaFluxoEstado.acaoAtual =
        null;

}


/* =========================================================
MOSTRAR RESULTADO

O renderizador recebe UM objeto de configuração:

{
    tipo,
    titulo,
    mensagem
}

Isso mantém o contrato entre os módulos consistente.
========================================================= */

function mostrarResultadoFluxo(
    tipo,
    titulo,
    mensagem
) {

    if (
        propostaFluxoRender &&
        typeof propostaFluxoRender.mostrarResultado === "function"
    ) {

        propostaFluxoRender.mostrarResultado({

            tipo:
                tipo,

            titulo:
                titulo,

            mensagem:
                mensagem

        });

    }

}


/* =========================================================
ACEITAR PROPOSTA
========================================================= */

async function aceitarProposta() {

    if (
        propostaFluxoEstado.processando
    ) {

        return;

    }

    try {

        mostrarProcessandoFluxo(
            "aceitar"
        );

        const usuarioAtual =
            await obterUsuarioAtualFluxo();

        const proposta =
            await carregarPropostaParaAcao();

        /*
         * Identifica o papel do usuário.
         *
         * O remetente pode visualizar a proposta,
         * mas somente o destinatário pode responder.
         */

        const papelUsuario =
            obterPapelDoUsuarioNaProposta(
                proposta,
                usuarioAtual
            );

        if (
            papelUsuario !==
            "destinatario"
        ) {

            throw new Error(
                "Você não tem permissão para aceitar esta proposta."
            );

        }

        validarDestinatarioDaProposta(

            proposta,

            usuarioAtual

        );

        validarStatusDaProposta(
            proposta
        );

        const propostaAtualizada =
            await atualizarStatusDaProposta(

                proposta,

                PROPOSTA_FLUXO_CONFIG.statusAceita

            );

        esconderProcessandoFluxo();

        mostrarResultadoFluxo(

            "sucesso",

            "Proposta aceita",

            "A proposta foi aceita com sucesso. Você será direcionado para o acompanhamento da contratação."

        );

        /*
         * Mantém uma referência da contratação aceita
         * para que a página de acompanhamento possa
         * continuar o fluxo normalmente.
         */

        try {

            sessionStorage.setItem(

                "musicalworld_contratacao",

                JSON.stringify(
                    propostaAtualizada
                )

            );

        } catch (
            erroStorage
        ) {

            console.warn(

                "MusicalWorldPropostaVisualizacaoFluxo: não foi possível salvar a contratação no sessionStorage.",

                erroStorage

            );

        }

        /*
         * Pequeno intervalo para permitir que a mensagem
         * de sucesso seja apresentada antes da navegação.
         */

        window.setTimeout(

            function () {

                const id =
                    propostaAtualizada &&
                    propostaAtualizada.id
                        ? String(
                            propostaAtualizada.id
                        )
                        : obterIdDaPropostaFluxo();

                window.location.href =
                    PROPOSTA_FLUXO_CONFIG.paginaAcompanhamento +
                    "?id=" +
                    encodeURIComponent(
                        id
                    );

            },

            900

        );

    } catch (
        erro
    ) {

        console.error(

            "MusicalWorldPropostaVisualizacaoFluxo: erro ao aceitar proposta",

            erro

        );

        esconderProcessandoFluxo();

        mostrarResultadoFluxo(

            "erro",

            "Não foi possível aceitar",

            erro &&
            erro.message

                ? erro.message

                : "Ocorreu um erro ao aceitar a proposta."

        );

    }

}


/* =========================================================
RECUSAR PROPOSTA
========================================================= */

async function recusarProposta() {

    if (
        propostaFluxoEstado.processando
    ) {

        return;

    }

    try {

        mostrarProcessandoFluxo(
            "recusar"
        );

        const usuarioAtual =
            await obterUsuarioAtualFluxo();

        const proposta =
            await carregarPropostaParaAcao();

        /*
         * Identifica o papel do usuário.
         *
         * O remetente pode visualizar a proposta,
         * mas somente o destinatário pode responder.
         */

        const papelUsuario =
            obterPapelDoUsuarioNaProposta(
                proposta,
                usuarioAtual
            );

        if (
            papelUsuario !==
            "destinatario"
        ) {

            throw new Error(
                "Você não tem permissão para recusar esta proposta."
            );

        }

        validarDestinatarioDaProposta(

            proposta,

            usuarioAtual

        );

        validarStatusDaProposta(
            proposta
        );

        await atualizarStatusDaProposta(

            proposta,

            PROPOSTA_FLUXO_CONFIG.statusRecusada

        );

        esconderProcessandoFluxo();

        mostrarResultadoFluxo(

            "sucesso",

            "Proposta recusada",

            "A proposta foi recusada. O profissional será informado sobre a resposta."

        );

        /*
         * Depois da recusa, não existe acompanhamento
         * de contratação a iniciar.
         *
         * A página permanece aberta para apresentar
         * o resultado da ação.
         */

    } catch (
        erro
    ) {

        console.error(

            "MusicalWorldPropostaVisualizacaoFluxo: erro ao recusar proposta",

            erro

        );

        esconderProcessandoFluxo();

        mostrarResultadoFluxo(

            "erro",

            "Não foi possível recusar",

            erro &&
            erro.message

                ? erro.message

                : "Ocorreu um erro ao recusar a proposta."

        );

    }

}


/* =========================================================
VOLTAR
========================================================= */

function voltarDaProposta() {

    if (
        propostaFluxoEstado.processando
    ) {

        return;

    }

    window.location.href =
        PROPOSTA_FLUXO_CONFIG.paginaContratacoes;

}


/* =========================================================
CONFIGURAR BOTÕES
========================================================= */

function configurarBotoesFluxo() {

    const btnAceitar =
        document.getElementById(
            "btnAceitarProposta"
        );

    const btnRecusar =
        document.getElementById(
            "btnRecusarProposta"
        );

    const btnVoltar =
        document.getElementById(
            "btnVoltar"
        );

    const btnVoltarErro =
        document.getElementById(
            "btnVoltarErro"
        );

    if (btnAceitar) {

        btnAceitar.addEventListener(

            "click",

            aceitarProposta

        );

    }

    if (btnRecusar) {

        btnRecusar.addEventListener(

            "click",

            recusarProposta

        );

    }

    if (btnVoltar) {

        btnVoltar.addEventListener(

            "click",

            voltarDaProposta

        );

    }

    if (btnVoltarErro) {

        btnVoltarErro.addEventListener(

            "click",

            voltarDaProposta

        );

    }

}


/* =========================================================
INICIALIZAÇÃO DO FLUXO
========================================================= */

function inicializarFluxoProposta() {

    configurarBotoesFluxo();

}


/* =========================================================
API PÚBLICA
========================================================= */

window.MusicalWorldPropostaVisualizacaoFluxo = {

    aceitarProposta,

    recusarProposta,

    voltarDaProposta,

    inicializar:
        inicializarFluxoProposta,

    obterIdDaProposta:
        obterIdDaPropostaFluxo,

    carregarProposta:
        carregarPropostaParaAcao,

    validarDestinatario:
        validarDestinatarioDaProposta,

    validarStatus:
        validarStatusDaProposta,

    obterPapelDoUsuario:
        obterPapelDoUsuarioNaProposta

};


/* =========================================================
INICIALIZAÇÃO

O arquivo principal proposta-visualizacao.js será
responsável por iniciar o fluxo da página.
========================================================= */

