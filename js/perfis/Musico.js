const PerfilMusico = (() => {
"use strict";


/*
 * Configuração específica do perfil Músico(a).
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
 *
 * A função deste arquivo é informar ao sistema
 * quais recursos, campos e regras pertencem ao
 * perfil de Músico(a).
 */


const CONFIG = {

    /*
     * Identificação do perfil
     */

    tipo:
        "Músico(a)",

    codigo:
        "musico",


    /*
     * Páginas específicas deste perfil
     */

    paginaEdicao:
        "editar-perfil-musico.html",

    paginaPerfil:
        "meu-perfil-musico.html",


    /*
     * Recursos disponíveis para o músico
     */

    recursos: {

        sobre:
            true,

        portfolio:
            true,

        agenda:
            true,

        servicos:
            true,

        instrumentos:
            true

    },


    /*
     * Campos disponíveis para o músico
     */

    campos: {

        nome:
            true,

        nomeExibicao:
            true,

        telefone:
            true,

        localizacao:
            true,

        descricao:
            true,

        experiencia:
            true,

        areaAtendimento:
            true,

        disponibilidade:
            true,

        estilos:
            true,

        servicos:
            true,

        instrumentos:
            true

    },


    /*
     * Regras específicas do perfil
     */

    regras: {

        descricaoMaxima:
            1000,

        podeAlterarTipoPerfil:
            true,

        exigeNome:
            true,

        exigeNomeExibicao:
            true,

        exigeDescricao:
            false,

        exigeLocalizacao:
            false,

        exigeExperiencia:
            false,

        exigeAreaAtendimento:
            false

    },


    /*
     * Páginas de edição correspondentes
     * aos 10 tipos de perfil artístico
     * definidos no MusicalWorld.
     */

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
 * Verifica se o tipo informado pertence
 * aos 10 tipos de perfil artístico definidos
 * no projeto.
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
 * Neste momento, as páginas públicas já
 * existentes são Cantor(a) e Músico(a).
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
 * Retorna se determinado recurso está
 * disponível para o perfil de músico.
 */

function possuiRecurso(nome) {

    return (
        CONFIG.recursos[
            nome
        ] === true
    );

}


/*
 * Retorna se determinado campo está
 * disponível para o perfil de músico.
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
 * na página correspondente ao tipo Músico(a).
 */

function estaNaPaginaDoMusico() {

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
 *
 * Faz cópias dos objetos internos para evitar
 * alterações acidentais na configuração original.
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


/*
 * API pública do módulo
 */

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

    estaNaPaginaDoMusico,

    obterConfiguracao

};


})();

/*

* Disponibiliza o módulo globalmente para
* os demais módulos do editor.
  */

window.PerfilMusico = PerfilMusico;
