/* =========================================================
MUSICALWORLD — APRESENTAR PERFIL
Arquivo: ApresentarPerfilDados.js

Responsabilidade:

* Carregar um perfil público pelo ID informado na URL.
* Buscar os dados do usuário proprietário.
* Identificar o tipo do perfil.
* Buscar dados artísticos.
* Buscar serviços.
* Buscar portfólio.
* Buscar agenda.
* Buscar avaliações.
* Entregar os dados para os módulos de apresentação.

IMPORTANTE:

* Este arquivo NÃO depende do usuário logado.
* Este arquivo NÃO carrega carteira.
* Este arquivo NÃO carrega transações.
* Este arquivo NÃO contém regras específicas de
  apresentação visual.
* O perfil é identificado através de ?id= na URL.
* O ID do perfil é tratado como UUID/string.
  ========================================================= */

(function (window) {


"use strict";


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    tabelas: {

        usuarios: "usuarios",

        perfis: "perfis",

        tiposPerfil: "tipos_perfil",

        perfisArtistas: "perfis_artistas",

        servicos: "servicos_artistas",

        portfolio: "portfolio_musicos",

        agenda: "agenda_musicos",

        avaliacoes: "avaliacoes_musicos"

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
   OBTER CLIENTE SUPABASE
   ===================================================== */

function obterClienteSupabase() {

    if (window.supabaseClient) {
        return window.supabaseClient;
    }

    if (window._supabase) {
        return window._supabase;
    }

    if (window.supabase) {
        return window.supabase;
    }

    return null;

}


/* =====================================================
   CONFIGURAR CLIENTE
   ===================================================== */

function configurarCliente() {

    clienteSupabase =
        obterClienteSupabase();


    if (!clienteSupabase) {

        console.error(
            "ApresentarPerfilDados: cliente Supabase não encontrado."
        );

        return false;

    }


    return true;

}


/* =====================================================
   OBTER ID DO PERFIL PELA URL
   ===================================================== */

function obterPerfilIdDaUrl() {

    /*
     * Primeiro utiliza o módulo de utilidades,
     * caso ele esteja disponível.
     */

    if (
        window.ApresentarPerfilUtils &&
        typeof window.ApresentarPerfilUtils
            .obterPerfilIdUrl === "function"
    ) {

        const id =
            window.ApresentarPerfilUtils
                .obterPerfilIdUrl();

        if (id) {
            return String(id).trim();
        }

    }


    /*
     * Fallback direto pela URL.
     *
     * IMPORTANTE:
     * O ID pode ser UUID.
     * Portanto NÃO utilizamos Number().
     */

    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const valor =
            parametros.get("id");


        if (!valor) {
            return null;
        }


        const id =
            String(valor).trim();


        if (!id) {
            return null;
        }


        return id;

    } catch (erro) {

        console.error(
            "Erro ao obter ID do perfil pela URL:",
            erro
        );


        return null;

    }

}


/* =====================================================
   NORMALIZAR TIPO
   ===================================================== */

function normalizarTipo(tipo) {

    if (!tipo) {
        return null;
    }


    if (
        window.ApresentarPerfilTipo &&
        typeof window.ApresentarPerfilTipo
            .obterTipo === "function"
    ) {

        return window.ApresentarPerfilTipo
            .obterTipo(tipo);

    }


    return tipo;

}


/* =====================================================
   BUSCAR PERFIL
   ===================================================== */

async function carregarPerfil() {

    if (!clienteSupabase) {

        throw new Error(
            "Cliente Supabase não configurado."
        );

    }


    if (!perfilId) {

        throw new Error(
            "ID do perfil não informado na URL."
        );

    }


    const {
        data,
        error
    } = await clienteSupabase

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
            "Erro ao carregar perfil:",
            error
        );


        throw error;

    }


    if (!data) {

        throw new Error(
            "Perfil não encontrado."
        );

    }


    perfil =
        data;


    /*
     * O relacionamento pode chegar como objeto
     * ou como array dependendo da configuração
     * do relacionamento no Supabase.
     */

    let tipo =
        data.tipo;


    if (Array.isArray(tipo)) {
        tipo = tipo[0] || null;
    }


    /*
     * Primeiro tenta obter o tipo através do
     * relacionamento com tipos_perfil.
     */

    tipoPerfil =
        normalizarTipo(
            tipo
                ? (
                    tipo.nome ||
                    tipo.tipo ||
                    tipo
                )
                : ""
        );


    /*
     * Fallback caso o relacionamento não tenha
     * sido retornado.
     */

    if (!tipoPerfil && data.tipo_perfil) {

        tipoPerfil =
            normalizarTipo(
                data.tipo_perfil
            );

    }


    /*
     * Guarda também o objeto bruto do relacionamento.
     */

    perfil.tipo =
        tipo;


    return perfil;

}


/* =====================================================
   BUSCAR USUÁRIO
   ===================================================== */

async function carregarUsuario() {

    if (!clienteSupabase) {
        return null;
    }


    if (!perfil) {
        return null;
    }


    const usuarioId =
        perfil.usuario_id;


    if (!usuarioId) {

        console.warn(
            "Perfil público sem usuario_id."
        );

        return null;

    }


    const {
        data,
        error
    } = await clienteSupabase

        .from(
            CONFIG.tabelas.usuarios
        )

        .select("*")

        .eq(
            "id",
            usuarioId
        )

        .maybeSingle();


    if (error) {

        console.error(
            "Erro ao carregar usuário do perfil:",
            error
        );


        throw error;

    }


    usuario =
        data || null;


    return usuario;

}


/* =====================================================
   BUSCAR PERFIL ARTÍSTICO
   ===================================================== */

async function carregarPerfilArtista() {

    if (!clienteSupabase) {
        return null;
    }


    if (!perfilId) {
        return null;
    }


    /*
     * perfis_artistas é utilizado pelos perfis
     * artísticos.
     *
     * Contratantes podem não possuir registro
     * nessa tabela.
     */

    const {
        data,
        error
    } = await clienteSupabase

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

        /*
         * Ausência de perfil artístico não deve
         * impedir a apresentação de um contratante.
         */

        if (
            error.code === "PGRST116" ||
            error.message
                ?.toLowerCase()
                .includes("multiple")
        ) {

            console.warn(
                "Não foi possível obter perfil artístico:",
                error
            );

        } else {

            console.error(
                "Erro ao carregar perfil artístico:",
                error
            );

            throw error;

        }

    }


    perfilArtista =
        data || null;


    return perfilArtista;

}


/* =====================================================
   BUSCAR SERVIÇOS
   ===================================================== */

async function carregarServicos() {

    if (!clienteSupabase) {
        return [];
    }


    if (!perfilId) {
        return [];
    }


    /*
     * Nem todo perfil possui serviços.
     */

    if (
        window.ApresentarPerfilTipo &&
        tipoPerfil &&
        typeof window.ApresentarPerfilTipo
            .possuiServicos === "function" &&
        !window.ApresentarPerfilTipo
            .possuiServicos(tipoPerfil)
    ) {

        servicos = [];

        return servicos;

    }


    const {
        data,
        error
    } = await clienteSupabase

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


    if (error) {

        /*
         * Algumas versões da tabela podem não
         * possuir created_at.
         */

        const resultadoAlternativo =
            await clienteSupabase

                .from(
                    CONFIG.tabelas.servicos
                )

                .select("*")

                .eq(
                    "perfil_id",
                    perfilId
                );


        if (
            resultadoAlternativo.error
        ) {

            console.error(
                "Erro ao carregar serviços:",
                error
            );


            throw error;

        }


        servicos =
            resultadoAlternativo.data || [];


        return servicos;

    }


    servicos =
        data || [];


    return servicos;

}


/* =====================================================
   BUSCAR PORTFÓLIO
   ===================================================== */

async function carregarPortfolio() {

    if (!clienteSupabase) {
        return [];
    }


    if (!perfilId) {
        return [];
    }


    if (
        window.ApresentarPerfilTipo &&
        tipoPerfil &&
        typeof window.ApresentarPerfilTipo
            .possuiPortfolio === "function" &&
        !window.ApresentarPerfilTipo
            .possuiPortfolio(tipoPerfil)
    ) {

        portfolio = [];

        return portfolio;

    }


    /*
     * Primeira tentativa:
     * somente itens ativos.
     */

    let resultado =
        await clienteSupabase

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
                "created_at",
                {
                    ascending: false
                }
            );


    /*
     * Algumas instalações podem não possuir
     * a coluna ativo.
     */

    if (resultado.error) {

        resultado =
            await clienteSupabase

                .from(
                    CONFIG.tabelas.portfolio
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

    }


    /*
     * Último fallback sem created_at.
     */

    if (resultado.error) {

        resultado =
            await clienteSupabase

                .from(
                    CONFIG.tabelas.portfolio
                )

                .select("*"
                )

                .eq(
                    "perfil_id",
                    perfilId
                );

    }


    if (resultado.error) {

        console.error(
            "Erro ao carregar portfólio:",
            resultado.error
        );


        throw resultado.error;

    }


    portfolio =
        resultado.data || [];


    return portfolio;

}


/* =====================================================
   BUSCAR AGENDA
   ===================================================== */

async function carregarAgenda() {

    if (!clienteSupabase) {
        return [];
    }


    if (!perfilId) {
        return [];
    }


    if (
        window.ApresentarPerfilTipo &&
        tipoPerfil &&
        typeof window.ApresentarPerfilTipo
            .possuiAgenda === "function" &&
        !window.ApresentarPerfilTipo
            .possuiAgenda(tipoPerfil)
    ) {

        agenda = [];

        return agenda;

    }


    let resultado =
        await clienteSupabase

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


    /*
     * Fallback caso a tabela não possua
     * data_inicio.
     */

    if (resultado.error) {

        resultado =
            await clienteSupabase

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

        console.error(
            "Erro ao carregar agenda:",
            resultado.error
        );


        throw resultado.error;

    }


    agenda =
        resultado.data || [];


    return agenda;

}


/* =====================================================
   BUSCAR AVALIAÇÕES
   ===================================================== */

async function carregarAvaliacoes() {

    if (!clienteSupabase) {
        return [];
    }


    if (!perfilId) {
        return [];
    }


    if (
        window.ApresentarPerfilTipo &&
        tipoPerfil &&
        typeof window.ApresentarPerfilTipo
            .possuiAvaliacoes === "function" &&
        !window.ApresentarPerfilTipo
            .possuiAvaliacoes(tipoPerfil)
    ) {

        avaliacoes = [];

        return avaliacoes;

    }


    let resultado =
        await clienteSupabase

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


    /*
     * Caso a tabela ainda esteja em desenvolvimento
     * ou não possua created_at, tenta novamente.
     */

    if (resultado.error) {

        resultado =
            await clienteSupabase

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

        /*
         * As avaliações são um módulo independente.
         * Se a tabela ainda não estiver pronta, não
         * devemos impedir que o perfil público abra.
         */

        console.warn(
            "Não foi possível carregar avaliações:",
            resultado.error
        );


        avaliacoes = [];

        return avaliacoes;

    }


    avaliacoes =
        resultado.data || [];


    return avaliacoes;

}


/* =====================================================
   CARREGAR TUDO
   ===================================================== */

async function carregarTudo(
    opcoes = {}
) {

    if (
        carregado &&
        !opcoes.forcar
    ) {

        return obterEstado();

    }


    /*
     * Configura o cliente Supabase.
     */

    if (!configurarCliente()) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    /*
     * Obtém o ID informado na URL.
     *
     * Pode ser UUID.
     */

    perfilId =
        opcoes.perfilId ||
        obterPerfilIdDaUrl();


    if (
        perfilId === null ||
        perfilId === undefined ||
        String(perfilId).trim() === ""
    ) {

        throw new Error(
            "Nenhum ID de perfil foi informado."
        );

    }


    /*
     * Sempre trabalha com o ID como string.
     * Isso preserva UUIDs sem alteração.
     */

    perfilId =
        String(perfilId).trim();


    /*
     * Carrega primeiro perfil, usuário e perfil
     * artístico porque os demais módulos dependem
     * do perfilId e do tipo identificado.
     */

    await carregarPerfil();

    await carregarUsuario();

    await carregarPerfilArtista();


    /*
     * Os módulos complementares podem ser carregados
     * em paralelo.
     */

    const tarefas = [];


    if (opcoes.portfolio !== false) {

        tarefas.push(
            carregarPortfolio()
        );

    }


    if (opcoes.servicos !== false) {

        tarefas.push(
            carregarServicos()
        );

    }


    if (opcoes.agenda !== false) {

        tarefas.push(
            carregarAgenda()
        );

    }


    if (opcoes.avaliacoes !== false) {

        tarefas.push(
            carregarAvaliacoes()
        );

    }


    await Promise.all(
        tarefas
    );


    carregado = true;


    return obterEstado();

}


/* =====================================================
   OBTER ESTADO COMPLETO
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
        ]

    };

}


/* =====================================================
   GETTERS
   ===================================================== */

function obterPerfilId() {

    return perfilId;

}


function obterUsuario() {

    return usuario;

}


function obterPerfil() {

    return perfil;

}


function obterPerfilArtista() {

    return perfilArtista;

}


function obterTipoPerfil() {

    return tipoPerfil;

}


function obterServicos() {

    return [
        ...servicos
    ];

}


function obterPortfolio() {

    return [
        ...portfolio
    ];

}


function obterAgenda() {

    return [
        ...agenda
    ];

}


function obterAvaliacoes() {

    return [
        ...avaliacoes
    ];

}


/* =====================================================
   CARREGAMENTOS INDIVIDUAIS
   ===================================================== */

async function carregarSomentePerfil(
    id
) {

    if (!configurarCliente()) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    perfilId =
        id ||
        obterPerfilIdDaUrl();


    if (!perfilId) {

        throw new Error(
            "Nenhum ID de perfil foi informado."
        );

    }


    perfilId =
        String(perfilId).trim();


    await carregarPerfil();


    return {

        perfil,

        tipoPerfil,

        perfilId

    };

}


async function carregarSomenteServicos() {

    if (!configurarCliente()) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    return carregarServicos();

}


async function carregarSomentePortfolio() {

    if (!configurarCliente()) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    return carregarPortfolio();

}


async function carregarSomenteAgenda() {

    if (!configurarCliente()) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    return carregarAgenda();

}


async function carregarSomenteAvaliacoes() {

    if (!configurarCliente()) {

        throw new Error(
            "Supabase não está disponível."
        );

    }


    return carregarAvaliacoes();

}


/* =====================================================
   LIMPAR ESTADO
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

    configurarCliente,

    obterPerfilIdDaUrl,

    carregarPerfil,

    carregarUsuario,

    carregarPerfilArtista,

    carregarServicos,

    carregarPortfolio,

    carregarAgenda,

    carregarAvaliacoes,

    carregarTudo,

    carregarSomentePerfil,

    carregarSomenteServicos,

    carregarSomentePortfolio,

    carregarSomenteAgenda,

    carregarSomenteAvaliacoes,

    obterEstado,

    obterPerfilId,

    obterUsuario,

    obterPerfil,

    obterPerfilArtista,

    obterTipoPerfil,

    obterServicos,

    obterPortfolio,

    obterAgenda,

    obterAvaliacoes,

    limpar

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.ApresentarPerfilDados =
    ApresentarPerfilDados;


/* =====================================================
   CONFIRMAÇÃO DE CARREGAMENTO
   ===================================================== */

console.log(
    "ApresentarPerfilDados.js carregado."
);


})(window);
