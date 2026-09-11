const PerfilEditorTipo = (() => {
"use strict";


/* =========================================================
   MUSICALWORLD / ARTISTASHOW
   Módulo: PerfilEditorTipo.js

   Responsabilidade:

   - Centralizar os tipos de perfil
   - Identificar tipos por id, slug ou nome
   - Fornecer páginas de edição
   - Fornecer páginas de apresentação
   - Validar tipos
   - Centralizar regras específicas por tipo
   - Informar recursos disponíveis de cada tipo
   - Evitar regras espalhadas pelo PerfilEditor.js

   Tipos artísticos atuais:

   1. Cantor(a)
   2. Músico(a)
   3. Banda
   4. Dupla musical
   5. DJ
   6. Dançarino(a)
   7. Grupo de dança
   8. MC
   9. Compositor(a)
   10. Produtor(a) musical

   Tipo adicional:

   - Contratante
========================================================= */


const CONFIG = {

    tipoPadrao:
        "musico",


    tipos: {

        /*
         * =====================================================
         * CANTOR
         * =====================================================
         */

        cantor: {

            id:
                "cantor",

            slug:
                "cantor",

            nome:
                "Cantor(a)",

            categoria:
                "artista",

            editar:
                "editar-perfil-cantor.html",

            apresentar:
                "apresentar-perfil-cantor.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * MÚSICO
         * =====================================================
         */

        musico: {

            id:
                "musico",

            slug:
                "musico",

            nome:
                "Músico(a)",

            categoria:
                "artista",

            editar:
                "editar-perfil-musico.html",

            apresentar:
                "apresentar-perfil-musico.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    true,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * BANDA
         * =====================================================
         */

        banda: {

            id:
                "banda",

            slug:
                "banda",

            nome:
                "Banda",

            categoria:
                "artista",

            editar:
                "editar-perfil-banda.html",

            apresentar:
                "apresentar-perfil-banda.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    true,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * DUPLA MUSICAL
         * =====================================================
         */

        dupla: {

            id:
                "dupla",

            slug:
                "dupla",

            nome:
                "Dupla musical",

            categoria:
                "artista",

            editar:
                "editar-perfil-dupla.html",

            apresentar:
                "apresentar-perfil-dupla.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    true,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * DJ
         * =====================================================
         */

        dj: {

            id:
                "dj",

            slug:
                "dj",

            nome:
                "DJ",

            categoria:
                "artista",

            editar:
                "editar-perfil-dj.html",

            apresentar:
                "apresentar-perfil-dj.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * DANÇARINO
         * =====================================================
         */

        dancarino: {

            id:
                "dancarino",

            slug:
                "dancarino",

            nome:
                "Dançarino(a)",

            categoria:
                "artista",

            editar:
                "editar-perfil-dancarino.html",

            apresentar:
                "apresentar-perfil-dancarino.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * GRUPO DE DANÇA
         * =====================================================
         */

        grupo_danca: {

            id:
                "grupo_danca",

            slug:
                "grupo_danca",

            nome:
                "Grupo de dança",

            categoria:
                "artista",

            editar:
                "editar-perfil-grupo-danca.html",

            apresentar:
                "apresentar-perfil-grupo-danca.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * MC
         * =====================================================
         */

        mc: {

            id:
                "mc",

            slug:
                "mc",

            nome:
                "MC",

            categoria:
                "artista",

            editar:
                "editar-perfil-mc.html",

            apresentar:
                "apresentar-perfil-mc.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * COMPOSITOR
         * =====================================================
         */

        compositor: {

            id:
                "compositor",

            slug:
                "compositor",

            nome:
                "Compositor(a)",

            categoria:
                "artista",

            editar:
                "editar-perfil-compositor.html",

            apresentar:
                "apresentar-perfil-compositor.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * PRODUTOR MUSICAL
         * =====================================================
         */

        produtor_musical: {

            id:
                "produtor_musical",

            slug:
                "produtor_musical",

            nome:
                "Produtor(a) musical",

            categoria:
                "artista",

            editar:
                "editar-perfil-produtor-musical.html",

            apresentar:
                "apresentar-perfil-produtor-musical.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    true,

                agenda:
                    true,

                servicos:
                    true,

                instrumentos:
                    false,

                estilos:
                    true
            }
        },


        /*
         * =====================================================
         * CONTRATANTE
         * =====================================================
         */

        contratante: {

            id:
                "contratante",

            slug:
                "contratante",

            nome:
                "Contratante",

            categoria:
                "contratante",

            editar:
                "editar-perfil-contratante.html",

            apresentar:
                "apresentar-perfil-contratante.html",

            recursos: {

                foto:
                    true,

                portfolio:
                    false,

                agenda:
                    true,

                servicos:
                    false,

                instrumentos:
                    false,

                estilos:
                    false
            }
        }
    }
};


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizar(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }


    return String(valor)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[()]/g,
            ""
        )
        .replace(
            /[\s-]+/g,
            "_"
        )
        .replace(
            /[^a-z0-9_]/g,
            ""
        );
}


/* =========================================================
   OBTER TODOS OS TIPOS
========================================================= */

function obterTodos() {

    return Object.values(
        CONFIG.tipos
    ).map(
        tipo => ({
            ...tipo,

            recursos: {
                ...tipo.recursos
            }
        })
    );
}


/* =========================================================
   OBTER TIPOS ARTÍSTICOS
========================================================= */

function obterTiposArtisticos() {

    return obterTodos().filter(
        tipo =>
            tipo.categoria === "artista"
    );
}


/* =========================================================
   OBTER TIPO CONTRATANTE
========================================================= */

function obterTipoContratante() {

    return {
        ...CONFIG.tipos.contratante,

        recursos: {
            ...CONFIG.tipos.contratante.recursos
        }
    };
}


/* =========================================================
   OBTER POR SLUG
========================================================= */

function obterPorSlug(slug) {

    const slugNormalizado =
        normalizar(slug);


    if (!slugNormalizado) {

        return null;
    }


    const tipos =
        Object.values(CONFIG.tipos);


    const encontrado =
        tipos.find(
            tipo =>
                normalizar(
                    tipo.slug
                ) === slugNormalizado
        );


    return encontrado
        ? {
            ...encontrado,

            recursos: {
                ...encontrado.recursos
            }
        }
        : null;
}


/* =========================================================
   OBTER POR ID
========================================================= */

function obterPorId(id) {

    const idNormalizado =
        normalizar(id);


    if (!idNormalizado) {

        return null;
    }


    const tipos =
        Object.values(CONFIG.tipos);


    const encontrado =
        tipos.find(
            tipo =>
                normalizar(
                    tipo.id
                ) === idNormalizado
        );


    return encontrado
        ? {
            ...encontrado,

            recursos: {
                ...encontrado.recursos
            }
        }
        : null;
}


/* =========================================================
   OBTER POR NOME
========================================================= */

function obterPorNome(nome) {

    const nomeNormalizado =
        normalizar(nome);


    if (!nomeNormalizado) {

        return null;
    }


    const tipos =
        Object.values(CONFIG.tipos);


    const encontrado =
        tipos.find(
            tipo =>
                normalizar(
                    tipo.nome
                ) === nomeNormalizado
        );


    return encontrado
        ? {
            ...encontrado,

            recursos: {
                ...encontrado.recursos
            }
        }
        : null;
}


/* =========================================================
   IDENTIFICAR TIPO

   Aceita:

   - objeto do tipo
   - id
   - slug
   - nome
========================================================= */

function identificar(valor) {

    if (!valor) {

        return null;
    }


    if (
        typeof valor === "object"
    ) {

        if (valor.slug) {

            const porSlug =
                obterPorSlug(
                    valor.slug
                );


            if (porSlug) {

                return porSlug;
            }
        }


        if (valor.id) {

            const porId =
                obterPorId(
                    valor.id
                );


            if (porId) {

                return porId;
            }
        }


        if (valor.nome) {

            const porNome =
                obterPorNome(
                    valor.nome
                );


            if (porNome) {

                return porNome;
            }
        }


        return null;
    }


    return (
        obterPorSlug(valor) ||
        obterPorId(valor) ||
        obterPorNome(valor)
    );
}


/* =========================================================
   VALIDAR TIPO
========================================================= */

function validar(valor) {

    return identificar(valor) !== null;
}


/* =========================================================
   VALIDAR TIPO ARTÍSTICO
========================================================= */

function validarArtista(valor) {

    const tipo =
        identificar(valor);


    if (!tipo) {

        return false;
    }


    return (
        tipo.categoria ===
        "artista"
    );
}


/* =========================================================
   VALIDAR CONTRATANTE
========================================================= */

function validarContratante(valor) {

    const tipo =
        identificar(valor);


    if (!tipo) {

        return false;
    }


    return (
        tipo.categoria ===
        "contratante"
    );
}


/* =========================================================
   OBTER SLUG
========================================================= */

function obterSlug(valor) {

    const tipo =
        identificar(valor);


    return tipo?.slug || null;
}


/* =========================================================
   OBTER ID
========================================================= */

function obterId(valor) {

    const tipo =
        identificar(valor);


    return tipo?.id || null;
}


/* =========================================================
   OBTER NOME
========================================================= */

function obterNome(valor) {

    const tipo =
        identificar(valor);


    return tipo?.nome || null;
}


/* =========================================================
   OBTER PÁGINA DE EDIÇÃO
========================================================= */

function obterPaginaEdicao(valor) {

    const tipo =
        identificar(valor);


    return tipo?.editar || null;
}


/* =========================================================
   OBTER PÁGINA DE APRESENTAÇÃO
========================================================= */

function obterPaginaApresentacao(valor) {

    const tipo =
        identificar(valor);


    return tipo?.apresentar || null;
}


/* =========================================================
   OBTER CATEGORIA
========================================================= */

function obterCategoria(valor) {

    const tipo =
        identificar(valor);


    return tipo?.categoria || null;
}


/* =========================================================
   OBTER RECURSOS DO TIPO
========================================================= */

function obterRecursos(valor) {

    const tipo =
        identificar(valor);


    if (!tipo) {

        return null;
    }


    return {
        ...tipo.recursos
    };
}


/* =========================================================
   VERIFICAR RECURSO

   Exemplos:

   possuiRecurso("musico", "instrumentos")
   possuiRecurso("cantor", "agenda")
   possuiRecurso("contratante", "portfolio")
========================================================= */

function possuiRecurso(
    valor,
    recurso
) {

    const recursos =
        obterRecursos(valor);


    if (!recursos || !recurso) {

        return false;
    }


    return recursos[
        recurso
    ] === true;
}


/* =========================================================
   VERIFICAR SE POSSUI FOTO
========================================================= */

function possuiFoto(valor) {

    return possuiRecurso(
        valor,
        "foto"
    );
}


/* =========================================================
   VERIFICAR SE POSSUI PORTFÓLIO
========================================================= */

function possuiPortfolio(valor) {

    return possuiRecurso(
        valor,
        "portfolio"
    );
}


/* =========================================================
   VERIFICAR SE POSSUI AGENDA
========================================================= */

function possuiAgenda(valor) {

    return possuiRecurso(
        valor,
        "agenda"
    );
}


/* =========================================================
   VERIFICAR SE POSSUI SERVIÇOS
========================================================= */

function possuiServicos(valor) {

    return possuiRecurso(
        valor,
        "servicos"
    );
}


/* =========================================================
   VERIFICAR SE POSSUI INSTRUMENTOS
========================================================= */

function possuiInstrumentos(valor) {

    return possuiRecurso(
        valor,
        "instrumentos"
    );
}


/* =========================================================
   VERIFICAR SE POSSUI ESTILOS
========================================================= */

function possuiEstilos(valor) {

    return possuiRecurso(
        valor,
        "estilos"
    );
}


/* =========================================================
   VERIFICAR SE É O TIPO ATUAL
========================================================= */

function ehTipo(
    valor,
    tipoComparacao
) {

    const tipo =
        identificar(valor);


    const comparacao =
        identificar(
            tipoComparacao
        );


    if (
        !tipo ||
        !comparacao
    ) {

        return false;
    }


    return (
        tipo.id ===
        comparacao.id
    );
}


/* =========================================================
   VERIFICAR SE É UM DOS TIPOS ARTÍSTICOS
========================================================= */

function ehArtista(valor) {

    return validarArtista(
        valor
    );
}


/* =========================================================
   VERIFICAR SE É CONTRATANTE
========================================================= */

function ehContratante(valor) {

    return validarContratante(
        valor
    );
}


/* =========================================================
   OBTER TIPO PADRÃO
========================================================= */

function obterTipoPadrao() {

    return obterPorSlug(
        CONFIG.tipoPadrao
    );
}


/* =========================================================
   RESOLVER TIPO
========================================================= */

function resolver(valor) {

    return (
        identificar(valor) ||
        obterTipoPadrao()
    );
}


/* =========================================================
   OBTER CONFIGURAÇÃO DO TIPO
========================================================= */

function obterConfiguracao(valor) {

    const tipo =
        resolver(valor);


    if (!tipo) {

        return null;
    }


    return {
        ...tipo,

        recursos: {
            ...tipo.recursos
        }
    };
}


/* =========================================================
   REGRAS ESPECÍFICAS

   Este objeto passa a ser a principal fonte de regras
   utilizadas pelo editor.

   As regras ainda podem crescer futuramente sem que
   o PerfilEditor.js precise conhecer cada tipo.
========================================================= */

function obterRegras(valor) {

    const tipo =
        identificar(valor);


    if (!tipo) {

        return null;
    }


    return {

        id:
            tipo.id,

        slug:
            tipo.slug,

        nome:
            tipo.nome,

        categoria:
            tipo.categoria,

        paginaEdicao:
            tipo.editar,

        paginaApresentacao:
            tipo.apresentar,

        camposObrigatorios: [

            "nome"

        ],

        recursos: {

            ...tipo.recursos
        }
    };
}


/* =========================================================
   OBTER TIPOS PARA SELECT
========================================================= */

function obterOpcoesSelect(
    incluirContratante = true
) {

    const tipos =
        incluirContratante
            ? obterTodos()
            : obterTiposArtisticos();


    return tipos.map(
        tipo => ({

            value:
                tipo.slug,

            label:
                tipo.nome
        })
    );
}


/* =========================================================
   IDENTIFICAR PELA PÁGINA
========================================================= */

function identificarPelaPagina(
    pagina
) {

    if (!pagina) {

        return null;
    }


    const nomePagina =
        String(pagina)
            .split("/")
            .pop()
            .toLowerCase();


    const encontrado =
        Object.values(
            CONFIG.tipos
        ).find(
            tipo =>
                tipo.editar
                    .toLowerCase() ===
                    nomePagina ||

                tipo.apresentar
                    .toLowerCase() ===
                    nomePagina
        );


    return encontrado
        ? {
            ...encontrado,

            recursos: {
                ...encontrado.recursos
            }
        }
        : null;
}


/* =========================================================
   OBTER TIPO DA PÁGINA ATUAL
========================================================= */

function obterTipoDaPaginaAtual() {

    const pagina =
        window.location.pathname;


    return identificarPelaPagina(
        pagina
    );
}


/* =========================================================
   OBTER RECURSOS DA PÁGINA ATUAL
========================================================= */

function obterRecursosDaPaginaAtual() {

    const tipo =
        obterTipoDaPaginaAtual();


    if (!tipo) {

        return null;
    }


    return obterRecursos(
        tipo
    );
}


/* =========================================================
   REDIRECIONAR PARA EDIÇÃO
========================================================= */

function redirecionarParaEdicao(
    valor
) {

    const pagina =
        obterPaginaEdicao(
            valor
        );


    if (!pagina) {

        return false;
    }


    window.location.href =
        pagina;


    return true;
}


/* =========================================================
   REDIRECIONAR PARA APRESENTAÇÃO
========================================================= */

function redirecionarParaApresentacao(
    valor,
    id
) {

    const pagina =
        obterPaginaApresentacao(
            valor
        );


    if (!pagina) {

        return false;
    }


    let destino =
        pagina;


    if (id) {

        const separador =
            pagina.includes("?")
                ? "&"
                : "?";


        destino +=
            `${separador}id=${encodeURIComponent(id)}`;
    }


    window.location.href =
        destino;


    return true;
}


/* =========================================================
   API PÚBLICA
========================================================= */

return {

    CONFIG,

    normalizar,

    obterTodos,

    obterTiposArtisticos,

    obterTipoContratante,

    obterPorSlug,

    obterPorId,

    obterPorNome,

    identificar,

    validar,

    validarArtista,

    validarContratante,

    obterSlug,

    obterId,

    obterNome,

    obterPaginaEdicao,

    obterPaginaApresentacao,

    obterCategoria,

    obterRecursos,

    possuiRecurso,

    possuiFoto,

    possuiPortfolio,

    possuiAgenda,

    possuiServicos,

    possuiInstrumentos,

    possuiEstilos,

    ehTipo,

    ehArtista,

    ehContratante,

    obterTipoPadrao,

    resolver,

    obterConfiguracao,

    obterRegras,

    obterOpcoesSelect,

    identificarPelaPagina,

    obterTipoDaPaginaAtual,

    obterRecursosDaPaginaAtual,

    redirecionarParaEdicao,

    redirecionarParaApresentacao
};


})();

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.PerfilEditorTipo =
PerfilEditorTipo;
