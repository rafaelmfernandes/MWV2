/* =========================================================
MUSICALWORLD — APRESENTAR PERFIL
Arquivo: ApresentarPerfilDados.js

Responsabilidade:

• Carregar os dados públicos de um perfil.
• Buscar usuário, perfil artístico, serviços, portfólio,
agenda e avaliações.
• Trabalhar com o perfil informado pela URL.
• NÃO depender do usuário atualmente logado para carregar
o perfil visualizado.

IMPORTANTE:

Este módulo é responsável pela comunicação com o Supabase
referente aos dados públicos do perfil.

O diagnóstico dos serviços foi mantido neste arquivo para
identificar se o problema está na consulta ao Supabase,
nas políticas RLS ou no módulo de renderização.

========================================================= */

(function (window) {


"use strict";


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const CONFIG = {

    tabelas: {

        usuarios:
            "usuarios",

        perfis:
            "perfis",

        tiposPerfil:
            "tipos_perfil",

        perfisArtistas:
            "perfis_artistas",

        servicos:
            "servicos_artistas",

        portfolio:
            "portfolio_musicos",

        agenda:
            "agenda_musicos",

        avaliacoes:
            "avaliacoes_musicos"

    }

};


/* =====================================================
   ESTADO INTERNO
===================================================== */

let clienteSupabase = null;

let perfilId = null;

let usuario = null;

let perfil = null;

let perfilArtista = null;

let tipoPerfil = null;

let servicos = [];

let portfolio = [];

let agenda = [];

let avaliacoes = [];

let carregado = false;


/* =====================================================
   UTILITÁRIOS
===================================================== */

function obterClienteSupabase() {

    if (clienteSupabase) {

        return clienteSupabase;

    }


    if (
        window.supabaseClient &&
        typeof window.supabaseClient
            .from === "function"
    ) {

        clienteSupabase =
            window.supabaseClient;

        return clienteSupabase;

    }


    if (
        window._supabase &&
        typeof window._supabase
            .from === "function"
    ) {

        clienteSupabase =
            window._supabase;

        return clienteSupabase;

    }


    if (
        window.supabase &&
        typeof window.supabase
            .from === "function"
    ) {

        clienteSupabase =
            window.supabase;

        return clienteSupabase;

    }


    console.error(
        "ApresentarPerfilDados: cliente Supabase não encontrado."
    );


    return null;

}


function obterPerfilIdDaUrl() {

    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        return (
            parametros.get("id") ||
            parametros.get("perfil_id") ||
            parametros.get("perfilId") ||
            null
        );

    } catch (erro) {

        console.error(
            "ApresentarPerfilDados: erro ao obter ID da URL.",
            erro
        );


        return null;

    }

}


function normalizarId(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return null;

    }


    const texto =
        String(valor).trim();


    return texto || null;

}


function obterTipoPerfilDoObjeto(
    dados
) {

    if (!dados) {

        return null;

    }


    if (
        typeof dados.tipo === "object" &&
        dados.tipo
    ) {

        return (
            dados.tipo.nome ||
            dados.tipo.tipo ||
            dados.tipo.chave ||
            null
        );

    }


    return (
        dados.tipo ||
        dados.tipo_perfil ||
        dados.tipoPerfil ||
        null
    );

}


/* =====================================================
   CARREGAR PERFIL
===================================================== */

async function carregarPerfil() {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    if (!perfilId) {

        throw new Error(
            "ID do perfil não informado."
        );

    }


    console.log(
        "ApresentarPerfilDados: carregando perfil:",
        perfilId
    );


    const {
        data,
        error
    } = await supabase
        .from(
            CONFIG.tabelas.perfis
        )
        .select(`
            *,
            tipo:tipos_perfil (
                id,
                nome
            )
        `)
        .eq(
            "id",
            perfilId
        )
        .maybeSingle();


    if (error) {

        console.error(
            "ApresentarPerfilDados: erro ao carregar perfil.",
            error
        );


        throw error;

    }


    perfil =
        data || null;


    tipoPerfil =
        obterTipoPerfilDoObjeto(
            perfil
        );


    console.log(
        "ApresentarPerfilDados: perfil carregado:",
        perfil
    );


    console.log(
        "ApresentarPerfilDados: tipo do perfil:",
        tipoPerfil
    );


    return perfil;

}


/* =====================================================
   CARREGAR USUÁRIO
===================================================== */

async function carregarUsuario() {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        return null;

    }


    if (
        !perfil ||
        !perfil.usuario_id
    ) {

        console.warn(
            "ApresentarPerfilDados: perfil não possui usuario_id."
        );


        usuario = null;

        return null;

    }


    const {
        data,
        error
    } = await supabase
        .from(
            CONFIG.tabelas.usuarios
        )
        .select("*")
        .eq(
            "id",
            perfil.usuario_id
        )
        .maybeSingle();


    if (error) {

        console.warn(
            "ApresentarPerfilDados: erro ao carregar usuário.",
            error
        );


        usuario = null;

        return null;

    }


    usuario =
        data || null;


    return usuario;

}


/* =====================================================
   CARREGAR PERFIL ARTÍSTICO
===================================================== */

async function carregarPerfilArtista() {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        return null;

    }


    const {
        data,
        error
    } = await supabase
        .from(
            CONFIG.tabelas.perfisArtistas
        )
        .select("*")
        .eq(
            "perfil_id",
            perfilId
        )
        .maybeSingle();


    if (error) {

        console.warn(
            "ApresentarPerfilDados: erro ao carregar perfil artístico.",
            error
        );


        perfilArtista = null;

        return null;

    }


    perfilArtista =
        data || null;


    if (
        perfilArtista &&
        perfilArtista.tipo_artista
    ) {

        tipoPerfil =
            perfilArtista.tipo_artista;

    }


    console.log(
        "ApresentarPerfilDados: perfil artístico:",
        perfilArtista
    );


    console.log(
        "ApresentarPerfilDados: tipo artístico final:",
        tipoPerfil
    );


    return perfilArtista;

}


/* =====================================================
   CARREGAR SERVIÇOS
===================================================== */

async function carregarServicos() {

    const supabase =
        obterClienteSupabase();


    servicos = [];


    if (!supabase) {

        console.error(
            "ApresentarPerfilDados: não foi possível carregar serviços porque o Supabase não está disponível."
        );


        return [];

    }


    if (!perfilId) {

        console.error(
            "ApresentarPerfilDados: não foi possível carregar serviços porque o perfilId está vazio."
        );


        return [];

    }


    console.group(
        "ApresentarPerfilDados — DIAGNÓSTICO DE SERVIÇOS"
    );


    console.log(
        "Perfil visualizado:",
        perfilId
    );


    console.log(
        "Tipo do perfil:",
        tipoPerfil
    );


    console.log(
        "Perfil completo:",
        perfil
    );


    console.log(
        "Perfil artístico:",
        perfilArtista
    );


    /*
     * Verifica se o tipo de perfil permite serviços.
     *
     * Todos os tipos artísticos atuais do MusicalWorld
     * possuem serviços habilitados.
     */

    if (
        window.ApresentarPerfilTipo &&
        tipoPerfil &&
        typeof window.ApresentarPerfilTipo
            .possuiServicos === "function" &&
        !window.ApresentarPerfilTipo
            .possuiServicos(tipoPerfil)
    ) {

        console.warn(
            "ApresentarPerfilDados: o tipo deste perfil não possui serviços habilitados:",
            tipoPerfil
        );


        console.groupEnd();


        servicos = [];


        return [];

    }


    console.log(
        "Executando consulta:",
        `from("${CONFIG.tabelas.servicos}")`
    );


    console.log(
        "Filtro utilizado:",
        {
            perfil_id: perfilId
        }
    );


    /*
     * CONSULTA PRINCIPAL
     *
     * IMPORTANTE:
     * A consulta utiliza o perfil visualizado.
     *
     * Não utiliza o usuário logado.
     */

    let resultado =
        await supabase
            .from(
                CONFIG.tabelas.servicos
            )
            .select("*")
            .eq(
                "perfil_id",
                perfilId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    console.log(
        "Resultado bruto da consulta de serviços:",
        resultado
    );


    /*
     * Alguns ambientes podem não possuir created_at.
     *
     * Nesse caso repetimos a consulta sem ordenar
     * por created_at.
     */

    if (
        resultado.error &&
        String(
            resultado.error.message || ""
        )
            .toLowerCase()
            .includes("created_at")
    ) {

        console.warn(
            "ApresentarPerfilDados: coluna created_at não encontrada. Repetindo consulta sem order."
        );


        resultado =
            await supabase
                .from(
                    CONFIG.tabelas.servicos
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilId
                );


        console.log(
            "Resultado da consulta alternativa:",
            resultado
        );

    }


    const {
        data,
        error
    } = resultado;


    /* =================================================
       DIAGNÓSTICO DE ERRO
    ================================================= */

    if (error) {

        console.error(
            "ApresentarPerfilDados: ERRO AO BUSCAR SERVIÇOS.",
            error
        );


        console.error(
            "Código do erro:",
            error.code
        );


        console.error(
            "Mensagem:",
            error.message
        );


        console.error(
            "Detalhes:",
            error.details
        );


        console.error(
            "Hint:",
            error.hint
        );


        console.error(
            "Perfil que estava sendo consultado:",
            perfilId
        );


        console.error(
            "Se funciona no próprio perfil mas falha em outro perfil, verifique especialmente as políticas RLS da tabela servicos_artistas."
        );


        console.groupEnd();


        servicos = [];


        return [];

    }


    /* =================================================
       DADOS RECEBIDOS
    ================================================= */

    servicos =
        Array.isArray(data)
            ? data
            : [];


    console.log(
        "Quantidade de serviços encontrados:",
        servicos.length
    );


    console.log(
        "Serviços encontrados:",
        servicos
    );


    if (!servicos.length) {

        console.warn(
            "ApresentarPerfilDados: a consulta retornou ZERO serviços para este perfil."
        );


        console.warn(
            "Isso pode significar que não existem serviços cadastrados para este perfil ou que o Supabase/RLS não está permitindo visualizar os registros."
        );

    } else {

        console.log(
            "ApresentarPerfilDados: serviços encontrados com sucesso."
        );

    }


    console.groupEnd();


    return servicos;

}


/* =====================================================
   CARREGAR PORTFÓLIO
===================================================== */

/* =====================================================
   CARREGAR PORTFÓLIO

   Responsabilidade:

   • Buscar os itens públicos do portfólio.
   • Considerar somente itens ativos.
   • Preservar a ordem cadastrada.
   • Colocar o item marcado como destaque
     como primeiro item do portfólio público.
   • Manter os demais itens na ordem original.
===================================================== */

async function carregarPortfolio() {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        return [];

    }


    let resultado =
        await supabase
            .from(
                CONFIG.tabelas.portfolio
            )
            .select("*")
            .eq(
                "perfil_id",
                perfilId
            )
            .eq(
                "ativo",
                true
            )
            .order(
                "ordem",
                {
                    ascending: true
                }
            );


    /*
     * Fallback caso a coluna ordem
     * não exista.
     */

    if (
        resultado.error &&
        String(
            resultado.error.message || ""
        )
            .toLowerCase()
            .includes("ordem")
    ) {

        resultado =
            await supabase
                .from(
                    CONFIG.tabelas.portfolio
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilId
                )
                .eq(
                    "ativo",
                    true
                );

    }


    if (resultado.error) {

        console.warn(
            "ApresentarPerfilDados: erro ao carregar portfólio.",
            resultado.error
        );


        portfolio = [];


        return [];

    }


    const itens =
        Array.isArray(resultado.data)
            ? resultado.data
            : [];


    /*
     * =====================================================
     * ORGANIZAÇÃO DO PORTFÓLIO
     *
     * O campo destaque_catalogo é utilizado pelo editor
     * de perfil para indicar qual item deve aparecer
     * primeiro no perfil público.
     *
     * Não alteramos a ordem dos demais itens.
     * =====================================================
     */

    const itemDestaque =
        itens.find(
            item =>
                item &&
                (
                    item.destaque_catalogo === true ||
                    item.destaque_catalogo === "true" ||
                    item.destaque_catalogo === 1 ||
                    item.destaque_catalogo === "1"
                )
        );


    if (itemDestaque) {

        const demaisItens =
            itens.filter(
                item =>
                    item !== itemDestaque
            );


        portfolio = [
            itemDestaque,
            ...demaisItens
        ];


        console.log(
            "ApresentarPerfilDados: item de destaque encontrado e colocado como primeiro item do portfólio.",
            itemDestaque
        );

    } else {

        /*
         * Nenhum destaque foi definido.
         *
         * Nesse caso preservamos exatamente a ordem
         * retornada pelo Supabase.
         */

        portfolio = [
            ...itens
        ];


        console.log(
            "ApresentarPerfilDados: nenhum item de destaque definido. Ordem original preservada."
        );

    }


    console.log(
        "ApresentarPerfilDados: portfólio carregado:",
        portfolio
    );


    return portfolio;

}

/* =====================================================
   CARREGAR AGENDA
===================================================== */

async function carregarAgenda() {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        return [];

    }


    let resultado =
        await supabase
            .from(
                CONFIG.tabelas.agenda
            )
            .select("*")
            .eq(
                "perfil_id",
                perfilId
            )
            .order(
                "data_inicio",
                {
                    ascending: true
                }
            );


    if (
        resultado.error &&
        String(
            resultado.error.message || ""
        )
            .toLowerCase()
            .includes("data_inicio")
    ) {

        resultado =
            await supabase
                .from(
                    CONFIG.tabelas.agenda
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilId
                );

    }


    if (resultado.error) {

        console.warn(
            "ApresentarPerfilDados: erro ao carregar agenda.",
            resultado.error
        );


        agenda = [];


        return [];

    }


    agenda =
        Array.isArray(resultado.data)
            ? resultado.data
            : [];


    return agenda;

}


/* =====================================================
   CARREGAR AVALIAÇÕES
===================================================== */

async function carregarAvaliacoes() {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        return [];

    }


    let resultado =
        await supabase
            .from(
                CONFIG.tabelas.avaliacoes
            )
            .select("*")
            .eq(
                "perfil_id",
                perfilId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (
        resultado.error &&
        String(
            resultado.error.message || ""
        )
            .toLowerCase()
            .includes("created_at")
    ) {

        resultado =
            await supabase
                .from(
                    CONFIG.tabelas.avaliacoes
                )
                .select("*")
                .eq(
                    "perfil_id",
                    perfilId
                );

    }


    if (resultado.error) {

        console.warn(
            "ApresentarPerfilDados: erro ao carregar avaliações.",
            resultado.error
        );


        avaliacoes = [];


        return [];

    }


    avaliacoes =
        Array.isArray(resultado.data)
            ? resultado.data
            : [];


    return avaliacoes;

}


/* =====================================================
   CARREGAR TUDO
===================================================== */

async function carregarTudo(
    opcoes = {}
) {

    const idRecebido =
        opcoes.perfilId ||
        obterPerfilIdDaUrl();


    perfilId =
        normalizarId(
            idRecebido
        );


    if (!perfilId) {

        throw new Error(
            "Não foi possível identificar o perfil que deve ser carregado."
        );

    }


    console.log(
        "=============================================="
    );


    console.log(
        "ApresentarPerfilDados: INICIANDO CARREGAMENTO"
    );


    console.log(
        "Perfil ID:",
        perfilId
    );


    console.log(
        "URL:",
        window.location.href
    );


    console.log(
        "=============================================="
    );


    /*
     * Primeiro carregamos os dados principais.
     *
     * Isso é importante porque tipoPerfil e perfilArtista
     * podem ser necessários para determinar quais recursos
     * o perfil possui.
     */

    await carregarPerfil();


    await carregarUsuario();


    await carregarPerfilArtista();


    /*
     * Depois carregamos os recursos complementares
     * simultaneamente.
     */

    await Promise.all([

        carregarPortfolio(),

        carregarServicos(),

        carregarAgenda(),

        carregarAvaliacoes()

    ]);


    carregado = true;


    console.log(
        "ApresentarPerfilDados: carregamento concluído."
    );


    console.log(
        "Resumo dos dados:",
        {
            perfilId,
            tipoPerfil,
            usuario,
            perfil,
            perfilArtista,
            servicos,
            portfolio,
            agenda,
            avaliacoes
        }
    );


    return obterEstado();

}


/* =====================================================
   OBTER ESTADO
===================================================== */

function obterEstado() {

    return {

        perfilId,

        usuario,

        perfil,

        perfilArtista,

        tipoPerfil,

        servicos: [
            ...servicos
        ],

        portfolio: [
            ...portfolio
        ],

        agenda: [
            ...agenda
        ],

        avaliacoes: [
            ...avaliacoes
        ],

        carregado

    };

}


/* =====================================================
   OBTER PERFIL
===================================================== */

function obterPerfil() {

    return perfil;

}


/* =====================================================
   OBTER USUÁRIO
===================================================== */

function obterUsuario() {

    return usuario;

}


/* =====================================================
   OBTER PERFIL ARTÍSTICO
===================================================== */

function obterPerfilArtista() {

    return perfilArtista;

}


/* =====================================================
   OBTER TIPO
===================================================== */

function obterTipoPerfil() {

    return tipoPerfil;

}


/* =====================================================
   OBTER SERVIÇOS
===================================================== */

function obterServicos() {

    return [
        ...servicos
    ];

}


/* =====================================================
   OBTER PORTFÓLIO
===================================================== */

function obterPortfolio() {

    return [
        ...portfolio
    ];

}


/* =====================================================
   OBTER AGENDA
===================================================== */

function obterAgenda() {

    return [
        ...agenda
    ];

}


/* =====================================================
   OBTER AVALIAÇÕES
===================================================== */

function obterAvaliacoes() {

    return [
        ...avaliacoes
    ];

}


/* =====================================================
   OBTER ID DO PERFIL
===================================================== */

function obterPerfilId() {

    return perfilId;

}


/* =====================================================
   VERIFICAR CARREGAMENTO
===================================================== */

function estaCarregado() {

    return carregado;

}


/* =====================================================
   LIMPAR
===================================================== */

function limpar() {

    perfilId = null;

    usuario = null;

    perfil = null;

    perfilArtista = null;

    tipoPerfil = null;

    servicos = [];

    portfolio = [];

    agenda = [];

    avaliacoes = [];

    carregado = false;

}


/* =====================================================
   OBJETO PÚBLICO
===================================================== */

const ApresentarPerfilDados = {

    carregarTudo,

    carregarPerfil,

    carregarUsuario,

    carregarPerfilArtista,

    carregarServicos,

    carregarPortfolio,

    carregarAgenda,

    carregarAvaliacoes,

    obterEstado,

    obterPerfil,

    obterUsuario,

    obterPerfilArtista,

    obterTipoPerfil,

    obterServicos,

    obterPortfolio,

    obterAgenda,

    obterAvaliacoes,

    obterPerfilId,

    estaCarregado,

    limpar

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
===================================================== */

window.ApresentarPerfilDados =
    ApresentarPerfilDados;


/* =====================================================
   CONFIRMAÇÃO
===================================================== */

console.log(
    "ApresentarPerfilDados.js carregado."
);


})(window);
