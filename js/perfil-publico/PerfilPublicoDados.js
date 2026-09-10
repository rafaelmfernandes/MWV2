/* =========================================================
MUSICALWORLD — PERFIL PÚBLICO
Arquivo: PerfilPublicoDados.js

Responsabilidade:

* Obter o usuário atual.
* Carregar o perfil principal.
* Carregar os dados artísticos.
* Carregar serviços.
* Carregar portfólio.
* Carregar agenda.
* Carregar avaliações.
* Carregar carteira.
* Carregar transações.

IMPORTANTE:
Este módulo NÃO é específico de Cantor ou Músico.

Ele trabalha com a estrutura geral do perfil e pode
ser utilizado pelos diferentes tipos de artistas.

Regras específicas de cada tipo devem ficar em:

js/perfis/

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
            "avaliacoes_musicos",

        carteiras:
            "carteiras_musicos",

        transacoes:
            "transacoes_carteira"

    }

};


/* =====================================================
   ESTADO INTERNO
   ===================================================== */

const estado = {

    clienteSupabase:
        null,

    usuarioId:
        null,

    usuario:
        null,

    perfil:
        null,

    perfilArtista:
        null,

    perfilId:
        null,

    servicos:
        [],

    portfolio:
        [],

    agenda:
        [],

    avaliacoes:
        [],

    carteira:
        null,

    transacoes:
        [],

    carregado:
        false

};


/* =====================================================
   OBTER CLIENTE SUPABASE
   ===================================================== */

function obterClienteSupabase() {

    if (
        estado.clienteSupabase
    ) {

        return estado.clienteSupabase;

    }


    if (
        window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
    ) {

        estado.clienteSupabase =
            window.supabaseClient;

        return estado.clienteSupabase;

    }


    if (
        window._supabase &&
        typeof window._supabase.from === "function"
    ) {

        estado.clienteSupabase =
            window._supabase;

        return estado.clienteSupabase;

    }


    if (
        window.supabase &&
        typeof window.supabase.from === "function"
    ) {

        estado.clienteSupabase =
            window.supabase;

        return estado.clienteSupabase;

    }


    console.error(
        "PerfilPublicoDados: cliente Supabase não encontrado."
    );


    return null;

}


/* =====================================================
   OBTER USUÁRIO ATUAL
   ===================================================== */

async function obterUsuarioId() {

    if (
        window.UsuarioAtual &&
        typeof window.UsuarioAtual.obterId === "function"
    ) {

        try {

            const id =
                await window.UsuarioAtual.obterId();


            if (id) {

                estado.usuarioId =
                    id;

                return id;

            }

        } catch (erro) {

            console.warn(
                "PerfilPublicoDados: erro ao obter ID através de UsuarioAtual.",
                erro
            );

        }

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        return null;

    }


    try {

        const resultado =
            await supabase.auth.getUser();


        if (
            resultado.error
        ) {

            console.error(
                "PerfilPublicoDados: erro ao obter usuário autenticado.",
                resultado.error
            );

            return null;

        }


        const usuario =
            resultado.data?.user;


        if (!usuario) {

            return null;

        }


        estado.usuarioId =
            usuario.id;


        return usuario.id;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: erro inesperado ao obter usuário.",
            erro
        );


        return null;

    }

}


/* =====================================================
   CARREGAR USUÁRIO
   ===================================================== */

async function carregarUsuario(
    usuarioId = null
) {

    const id =
        usuarioId ||
        estado.usuarioId ||
        await obterUsuarioId();


    if (!id) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

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
                id
            )
            .maybeSingle();


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar usuário.",
                error
            );

            throw error;

        }


        estado.usuario =
            data || null;


        return estado.usuario;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar usuário.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR PERFIS DO USUÁRIO
   ===================================================== */

async function carregarPerfis(
    usuarioId = null
) {

    const id =
        usuarioId ||
        estado.usuarioId ||
        await obterUsuarioId();


    if (!id) {

        throw new Error(
            "ID do usuário não encontrado."
        );

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelas.perfis
            )
            .select(`
                *,
                ${CONFIG.tabelas.tiposPerfil} (
                    id,
                    nome
                )
            `)
            .eq(
                "usuario_id",
                id
            );


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar perfis.",
                error
            );

            throw error;

        }


        return Array.isArray(data)
            ? data
            : [];

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar perfis.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   IDENTIFICAR PERFIL PRINCIPAL
   ===================================================== */

async function carregarPerfil(
    usuarioId = null
) {

    const perfis =
        await carregarPerfis(
            usuarioId
        );


    if (!perfis.length) {

        estado.perfil =
            null;

        estado.perfilId =
            null;

        return null;

    }


    let perfilEncontrado =
        perfis.find(
            perfil => {

                return (
                    perfil.ativo === true ||
                    perfil.status === "ativo"
                );

            }
        );


    if (!perfilEncontrado) {

        perfilEncontrado =
            perfis[0];

    }


    estado.perfil =
        perfilEncontrado;


    estado.perfilId =
        perfilEncontrado?.id ||
        null;


    return estado.perfil;

}


/* =====================================================
   CARREGAR PERFIL ARTÍSTICO
   ===================================================== */

async function carregarPerfilArtista(
    perfilId = null
) {

    const id =
        perfilId ||
        estado.perfilId;


    if (!id) {

        estado.perfilArtista =
            null;

        return null;

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

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
                id
            )
            .maybeSingle();


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar perfil artístico.",
                error
            );

            throw error;

        }


        estado.perfilArtista =
            data || null;


        return estado.perfilArtista;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar perfil artístico.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR SERVIÇOS
   ===================================================== */

async function carregarServicos(
    perfilId = null
) {

    const id =
        perfilId ||
        estado.perfilId;


    if (!id) {

        estado.servicos =
            [];

        return [];

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

        console.log(
            "PerfilPublicoDados: carregando serviços do perfil:",
            id
        );


        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelas.servicos
            )
            .select("*")
            .eq(
                "perfil_id",
                id
            );


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar serviços.",
                error
            );

            throw error;

        }


        estado.servicos =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "PerfilPublicoDados: serviços encontrados:",
            estado.servicos.length,
            estado.servicos
        );


        return estado.servicos;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar serviços.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR PORTFÓLIO
   ===================================================== */

async function carregarPortfolio(
    perfilId = null
) {

    const id =
        perfilId ||
        estado.perfilId;


    if (!id) {

        estado.portfolio =
            [];

        return [];

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

        let consulta =
            supabase
                .from(
                    CONFIG.tabelas.portfolio
                )
                .select("*")
                .eq(
                    "perfil_id",
                    id
                );


        let resultado =
            await consulta
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


        if (
            resultado.error
        ) {

            console.warn(
                "PerfilPublicoDados: consulta de portfólio com campo ativo falhou. Tentando consulta simples."
            );


            resultado =
                await supabase
                    .from(
                        CONFIG.tabelas.portfolio
                    )
                    .select("*")
                    .eq(
                        "perfil_id",
                        id
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

        }


        if (
            resultado.error
        ) {

            console.error(
                "PerfilPublicoDados: erro ao carregar portfólio.",
                resultado.error
            );

            throw resultado.error;

        }


        estado.portfolio =
            Array.isArray(
                resultado.data
            )
                ? resultado.data
                : [];


        return estado.portfolio;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar portfólio.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR AGENDA
   ===================================================== */

async function carregarAgenda(
    perfilId = null
) {

    const id =
        perfilId ||
        estado.perfilId;


    if (!id) {

        estado.agenda =
            [];

        return [];

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelas.agenda
            )
            .select("*")
            .eq(
                "perfil_id",
                id
            )
            .order(
                "data_inicio",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar agenda.",
                error
            );

            throw error;

        }


        estado.agenda =
            Array.isArray(data)
                ? data
                : [];


        return estado.agenda;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar agenda.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR AVALIAÇÕES
   ===================================================== */

async function carregarAvaliacoes(
    perfilId = null
) {

    const id =
        perfilId ||
        estado.perfilId;


    if (!id) {

        estado.avaliacoes =
            [];

        return [];

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelas.avaliacoes
            )
            .select("*")
            .eq(
                "perfil_id",
                id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar avaliações.",
                error
            );

            throw error;

        }


        estado.avaliacoes =
            Array.isArray(data)
                ? data
                : [];


        return estado.avaliacoes;

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar avaliações.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR CARTEIRA
   ===================================================== */

async function carregarCarteira(
    perfilId = null
) {

    const id =
        perfilId ||
        estado.perfilId;


    if (!id) {

        estado.carteira =
            null;

        estado.transacoes =
            [];

        return {

            carteira:
                null,

            transacoes:
                []

        };

    }


    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não disponível."
        );

    }


    try {

        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelas.carteiras
            )
            .select("*")
            .eq(
                "perfil_id",
                id
            )
            .maybeSingle();


        if (error) {

            console.error(
                "PerfilPublicoDados: erro ao carregar carteira.",
                error
            );

            throw error;

        }


        estado.carteira =
            data || null;


        if (
            !estado.carteira?.id
        ) {

            estado.transacoes =
                [];


            return {

                carteira:
                    estado.carteira,

                transacoes:
                    estado.transacoes

            };

        }


        const resultadoTransacoes =
            await supabase
                .from(
                    CONFIG.tabelas.transacoes
                )
                .select("*")
                .eq(
                    "carteira_id",
                    estado.carteira.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (
            resultadoTransacoes.error
        ) {

            console.error(
                "PerfilPublicoDados: erro ao carregar transações.",
                resultadoTransacoes.error
            );

            throw resultadoTransacoes.error;

        }


        estado.transacoes =
            Array.isArray(
                resultadoTransacoes.data
            )
                ? resultadoTransacoes.data
                : [];


        return {

            carteira:
                estado.carteira,

            transacoes:
                estado.transacoes

        };

    } catch (erro) {

        console.error(
            "PerfilPublicoDados: falha ao carregar carteira.",
            erro
        );


        throw erro;

    }

}


/* =====================================================
   CARREGAR DADOS COMPLETOS
   ===================================================== */

async function carregarTudo(
    opcoes = {}
) {

    const {

        usuarioId = null,

        perfilId = null,

        incluirServicos = true,

        incluirPortfolio = true,

        incluirAgenda = true,

        incluirAvaliacoes = true,

        incluirCarteira = true

    } = opcoes;


    const idUsuario =
        usuarioId ||
        estado.usuarioId ||
        await obterUsuarioId();


    if (!idUsuario) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    estado.usuarioId =
        idUsuario;


    /* =================================================
       CARREGAR USUÁRIO
       ================================================= */

    await carregarUsuario(
        idUsuario
    );


    /* =================================================
       CARREGAR PERFIL
       ================================================= */

    if (perfilId) {

        estado.perfilId =
            perfilId;


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não disponível."
            );

        }


        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelas.perfis
            )
            .select(`
                *,
                ${CONFIG.tabelas.tiposPerfil} (
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

            throw error;

        }


        estado.perfil =
            data || null;

    } else {

        await carregarPerfil(
            idUsuario
        );

    }


    /* =================================================
       CARREGAR PERFIL ARTÍSTICO
       ================================================= */

    await carregarPerfilArtista(
        estado.perfilId
    );


    /* =================================================
       CARREGAR MÓDULOS
       ================================================= */

    const promessas = [];


    if (incluirServicos) {

        promessas.push(
            carregarServicos(
                estado.perfilId
            )
        );

    }


    if (incluirPortfolio) {

        promessas.push(
            carregarPortfolio(
                estado.perfilId
            )
        );

    }


    if (incluirAgenda) {

        promessas.push(
            carregarAgenda(
                estado.perfilId
            )
        );

    }


    if (incluirAvaliacoes) {

        promessas.push(
            carregarAvaliacoes(
                estado.perfilId
            )
        );

    }


    if (incluirCarteira) {

        promessas.push(
            carregarCarteira(
                estado.perfilId
            )
        );

    }


    await Promise.all(
        promessas
    );


    estado.carregado =
        true;


    return obterEstado();

}


/* =====================================================
   CARREGAR APENAS SERVIÇOS
   ===================================================== */

async function carregarSomenteServicos(
    perfilId = null
) {

    return carregarServicos(
        perfilId
    );

}


/* =====================================================
   CARREGAR APENAS PORTFÓLIO
   ===================================================== */

async function carregarSomentePortfolio(
    perfilId = null
) {

    return carregarPortfolio(
        perfilId
    );

}


/* =====================================================
   CARREGAR APENAS AGENDA
   ===================================================== */

async function carregarSomenteAgenda(
    perfilId = null
) {

    return carregarAgenda(
        perfilId
    );

}


/* =====================================================
   CARREGAR APENAS AVALIAÇÕES
   ===================================================== */

async function carregarSomenteAvaliacoes(
    perfilId = null
) {

    return carregarAvaliacoes(
        perfilId
    );

}


/* =====================================================
   CARREGAR APENAS CARTEIRA
   ===================================================== */

async function carregarSomenteCarteira(
    perfilId = null
) {

    return carregarCarteira(
        perfilId
    );

}


/* =====================================================
   OBTER ESTADO
   ===================================================== */

function obterEstado() {

    return {

        usuarioId:
            estado.usuarioId,

        usuario:
            estado.usuario,

        perfil:
            estado.perfil,

        perfilArtista:
            estado.perfilArtista,

        perfilId:
            estado.perfilId,

        servicos:
            Array.isArray(
                estado.servicos
            )
                ? [...estado.servicos]
                : [],

        portfolio:
            Array.isArray(
                estado.portfolio
            )
                ? [...estado.portfolio]
                : [],

        agenda:
            Array.isArray(
                estado.agenda
            )
                ? [...estado.agenda]
                : [],

        avaliacoes:
            Array.isArray(
                estado.avaliacoes
            )
                ? [...estado.avaliacoes]
                : [],

        carteira:
            estado.carteira,

        transacoes:
            Array.isArray(
                estado.transacoes
            )
                ? [...estado.transacoes]
                : [],

        carregado:
            estado.carregado

    };

}


/* =====================================================
   OBTER USUÁRIO
   ===================================================== */

function obterUsuario() {

    return estado.usuario;

}


/* =====================================================
   OBTER PERFIL
   ===================================================== */

function obterPerfil() {

    return estado.perfil;

}


/* =====================================================
   OBTER PERFIL ARTÍSTICO
   ===================================================== */

function obterPerfilArtista() {

    return estado.perfilArtista;

}


/* =====================================================
   OBTER ID DO PERFIL
   ===================================================== */

function obterPerfilId() {

    return estado.perfilId;

}


/* =====================================================
   OBTER SERVIÇOS
   ===================================================== */

function obterServicos() {

    return Array.isArray(
        estado.servicos
    )
        ? [...estado.servicos]
        : [];

}


/* =====================================================
   OBTER PORTFÓLIO
   ===================================================== */

function obterPortfolio() {

    return Array.isArray(
        estado.portfolio
    )
        ? [...estado.portfolio]
        : [];

}


/* =====================================================
   OBTER AGENDA
   ===================================================== */

function obterAgenda() {

    return Array.isArray(
        estado.agenda
    )
        ? [...estado.agenda]
        : [];

}


/* =====================================================
   OBTER AVALIAÇÕES
   ===================================================== */

function obterAvaliacoes() {

    return Array.isArray(
        estado.avaliacoes
    )
        ? [...estado.avaliacoes]
        : [];

}


/* =====================================================
   OBTER CARTEIRA
   ===================================================== */

function obterCarteira() {

    return estado.carteira;

}


/* =====================================================
   OBTER TRANSAÇÕES
   ===================================================== */

function obterTransacoes() {

    return Array.isArray(
        estado.transacoes
    )
        ? [...estado.transacoes]
        : [];

}


/* =====================================================
   LIMPAR ESTADO
   ===================================================== */

function limpar() {

    estado.usuarioId =
        null;

    estado.usuario =
        null;

    estado.perfil =
        null;

    estado.perfilArtista =
        null;

    estado.perfilId =
        null;

    estado.servicos =
        [];

    estado.portfolio =
        [];

    estado.agenda =
        [];

    estado.avaliacoes =
        [];

    estado.carteira =
        null;

    estado.transacoes =
        [];

    estado.carregado =
        false;

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const PerfilPublicoDados = {

    CONFIG,

    estado,

    obterClienteSupabase,

    obterUsuarioId,

    carregarUsuario,

    carregarPerfis,

    carregarPerfil,

    carregarPerfilArtista,

    carregarServicos,

    carregarPortfolio,

    carregarAgenda,

    carregarAvaliacoes,

    carregarCarteira,

    carregarTudo,

    carregarSomenteServicos,

    carregarSomentePortfolio,

    carregarSomenteAgenda,

    carregarSomenteAvaliacoes,

    carregarSomenteCarteira,

    obterEstado,

    obterUsuario,

    obterPerfil,

    obterPerfilArtista,

    obterPerfilId,

    obterServicos,

    obterPortfolio,

    obterAgenda,

    obterAvaliacoes,

    obterCarteira,

    obterTransacoes,

    limpar

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.PerfilPublicoDados =
    PerfilPublicoDados;


/* =====================================================
   CONFIRMAÇÃO DE CARREGAMENTO
   ===================================================== */

console.log(
    "PerfilPublicoDados.js carregado."
);


})(window);
