const PerfilCantor = (() => {
"use strict";


/*
 * Configuração específica do perfil Cantor(a).
 *
 * Este arquivo NÃO contém:
 * - lógica de Supabase;
 * - carregamento de usuário;
 * - abas;
 * - portfólio;
 * - agenda;
 * - serviços;
 * - upload;
 * - salvamento.
 *
 * Essas responsabilidades pertencem aos módulos
 * universais da pasta js/perfil/.
 */

const CONFIG = {
    tipo: "Cantor(a)",

    codigo: "cantor",

    paginaEdicao:
        "editar-perfil-cantor.html",

    paginaPerfil:
        "meu-perfil-cantor.html",

    recursos: {
        sobre: true,

        portfolio: true,

        agenda: true,

        servicos: true,

        instrumentos: false
    },

    campos: {
        nome: true,

        nomeExibicao: true,

        telefone: true,

        localizacao: true,

        descricao: true,

        experiencia: true,

        areaAtendimento: true,

        disponibilidade: true,

        estilos: true,

        servicos: true,

        instrumentos: false
    },

    regras: {
        descricaoMaxima: 1000,

        podeAlterarTipoPerfil: true,

        exigeNome: true,

        exigeNomeExibicao: true,

        exigeDescricao: false,

        exigeLocalizacao: false,

        exigeExperiencia: false,

        exigeAreaAtendimento: false
    },

    paginaPorTipo: {
        "Cantor(a)":
            "editar-perfil-cantor.html",

        "Músico(a)":
            "editar-perfil-musico.html",

        "Banda":
            "editar-perfil-banda.html",

        "Dupla musical":
            "editar-perfil-dupla-musical.html",

        "DJ":
            "editar-perfil-dj.html",

        "Dançarino(a)":
            "editar-perfil-dancarino.html",

        "Grupo de dança":
            "editar-perfil-grupo-danca.html",

        "MC":
            "editar-perfil-mc.html",

        "Compositor(a)":
            "editar-perfil-compositor.html",

        "Produtor(a) musical":
            "editar-perfil-produtor-musical.html"
    }
};

/*
 * Normaliza o nome do tipo recebido do banco,
 * formulário ou metadados da sessão.
 */
function normalizarTipo(tipo) {
    const valor =
        String(tipo || "")
            .trim()
            .toLowerCase();

    const equivalencias = {
        "cantor":
            "Cantor(a)",

        "cantora":
            "Cantor(a)",

        "cantor(a)":
            "Cantor(a)",

        "musico":
            "Músico(a)",

        "músico":
            "Músico(a)",

        "musica":
            "Músico(a)",

        "música":
            "Músico(a)",

        "musico(a)":
            "Músico(a)",

        "músico(a)":
            "Músico(a)",

        "banda":
            "Banda",

        "dupla":
            "Dupla musical",

        "dupla musical":
            "Dupla musical",

        "dj":
            "DJ",

        "dancarino":
            "Dançarino(a)",

        "dançarino":
            "Dançarino(a)",

        "dancarino(a)":
            "Dançarino(a)",

        "dançarino(a)":
            "Dançarino(a)",

        "grupo de danca":
            "Grupo de dança",

        "grupo de dança":
            "Grupo de dança",

        "mc":
            "MC",

        "compositor":
            "Compositor(a)",

        "compositor(a)":
            "Compositor(a)",

        "produtor musical":
            "Produtor(a) musical",

        "produtor(a) musical":
            "Produtor(a) musical"
    };

    return (
        equivalencias[valor] ||
        tipo ||
        ""
    );
}

/*
 * Verifica se o tipo informado pertence aos
 * 10 tipos de perfil artístico definidos no projeto.
 */
function tipoValido(tipo) {
    const tipoNormalizado =
        normalizarTipo(tipo);

    return Object.prototype.hasOwnProperty.call(
        CONFIG.paginaPorTipo,
        tipoNormalizado
    );
}

/*
 * Retorna a página de edição correspondente
 * ao tipo artístico.
 */
function obterPaginaPorTipoArtista(tipo) {
    const tipoNormalizado =
        normalizarTipo(tipo);

    return (
        CONFIG.paginaPorTipo[
            tipoNormalizado
        ] ||
        CONFIG.paginaEdicao
    );
}

/*
 * Retorna a página de perfil correspondente
 * ao tipo artístico.
 *
 * Mantemos a página do cantor como padrão nesta
 * primeira etapa. As demais páginas de perfil
 * poderão ser adicionadas posteriormente.
 */
function obterPaginaPerfilPorTipoArtista(tipo) {
    const tipoNormalizado =
        normalizarTipo(tipo);

    const paginas = {
        "Cantor(a)":
            "meu-perfil-cantor.html",

        "Músico(a)":
            "meu-perfil-musico.html"
    };

    return (
        paginas[tipoNormalizado] ||
        CONFIG.paginaPerfil
    );
}

/*
 * Retorna se determinado recurso está disponível
 * para o perfil de cantor.
 */
function possuiRecurso(nome) {
    return (
        CONFIG.recursos[
            nome
        ] === true
    );
}

/*
 * Retorna se determinado campo está disponível
 * para o perfil de cantor.
 */
function possuiCampo(nome) {
    return (
        CONFIG.campos[
            nome
        ] === true
    );
}

/*
 * Retorna uma regra específica do perfil.
 */
function obterRegra(nome) {
    return CONFIG.regras[
        nome
    ];
}

/*
 * Verifica se o perfil está sendo editado
 * na página correspondente ao tipo Cantor(a).
 */
function estaNaPaginaDoCantor() {
    const paginaAtual =
        window.location.pathname
            .split("/")
            .pop();

    return (
        paginaAtual ===
        CONFIG.paginaEdicao
    );
}

/*
 * Retorna uma configuração segura para ser
 * utilizada pelo PerfilEditor.
 */
function obterConfiguracao() {
    return {
        ...CONFIG,

        recursos: {
            ...CONFIG.recursos
        },

        campos: {
            ...CONFIG.campos
        },

        regras: {
            ...CONFIG.regras
        },

        paginaPorTipo: {
            ...CONFIG.paginaPorTipo
        }
    };
}

return {
    CONFIG,

    tipo:
        CONFIG.tipo,

    codigo:
        CONFIG.codigo,

    paginaEdicao:
        CONFIG.paginaEdicao,

    paginaPerfil:
        CONFIG.paginaPerfil,

    recursos:
        CONFIG.recursos,

    campos:
        CONFIG.campos,

    regras:
        CONFIG.regras,

    paginaPorTipo:
        CONFIG.paginaPorTipo,

    normalizarTipo,

    tipoValido,

    obterPaginaPorTipoArtista,

    obterPaginaPerfilPorTipoArtista,

    possuiRecurso,

    possuiCampo,

    obterRegra,

    estaNaPaginaDoCantor,

    obterConfiguracao
};


})();

window.PerfilCantor = PerfilCantor;
