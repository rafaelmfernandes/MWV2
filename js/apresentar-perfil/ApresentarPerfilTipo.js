(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — APRESENTAR PERFIL
       Arquivo: ApresentarPerfilTipo.js

       Responsabilidade:

       - Identificar o tipo específico do perfil.
       - Normalizar nomes de tipos.
       - Definir recursos disponíveis.
       - Fornecer regras de apresentação.
       - Funcionar com todos os tipos de perfil.

       IMPORTANTE:

       "perfil.tipo.nome" pode retornar apenas:

       artista

       Esse valor representa a categoria geral.

       O tipo artístico específico deve vir de:

       perfilArtista.tipo_artista

       Exemplos:

       Músico(a)
       Cantor(a)
       DJ
       Banda
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO DOS TIPOS
       ========================================================= */

    const TIPOS = {

        cantor: {
            chave: "cantor",
            nome: "Cantor(a)",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        musico: {
            chave: "musico",
            nome: "Músico(a)",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: true,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        banda: {
            chave: "banda",
            nome: "Banda",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: true,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        dupla: {
            chave: "dupla",
            nome: "Dupla musical",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: true,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        dj: {
            chave: "dj",
            nome: "DJ",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        dancarino: {
            chave: "dancarino",
            nome: "Dançarino(a)",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        grupo_danca: {
            chave: "grupo_danca",
            nome: "Grupo de dança",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        mc: {
            chave: "mc",
            nome: "MC",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        compositor: {
            chave: "compositor",
            nome: "Compositor(a)",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        produtor_musical: {
            chave: "produtor_musical",
            nome: "Produtor(a) musical",
            categoria: "Artista",

            recursos: {
                foto: true,
                portfolio: true,
                agenda: true,
                servicos: true,
                instrumentos: false,
                estilos: true,
                avaliacoes: true,
                contato: true,
                contratacao: true
            }
        },


        contratante: {
            chave: "contratante",
            nome: "Contratante",
            categoria: "Contratante",

            recursos: {
                foto: true,
                portfolio: false,
                agenda: true,
                servicos: false,
                instrumentos: false,
                estilos: false,
                avaliacoes: true,
                contato: true,
                contratacao: false
            }
        }

    };


    /* =========================================================
       NORMALIZAÇÃO DE TEXTO
       ========================================================= */

    function normalizarTexto(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {
            return "";
        }

        if (
            typeof valor !== "string" &&
            typeof valor !== "number" &&
            typeof valor !== "boolean"
        ) {
            return "";
        }

        return String(valor)
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }


    /* =========================================================
       NORMALIZAÇÃO DA CHAVE
       ========================================================= */

function normalizarChave(valor) {
    const texto = normalizarTexto(valor);

    if (!texto) {
        return "";
    }

    /*
     * Remove indicações de gênero no formato:
     *
     * (a)
     * (o)
     *
     * Exemplos:
     *
     * musico(a)       -> musico
     * cantor(a)       -> cantor
     * dancarino(a)    -> dancarino
     * compositor(a)   -> compositor
     * produtor(a)     -> produtor
     */

    const textoSemGenero = texto
        .replace(/\((?:a|o)\)/g, "")
        .replace(/\s+/g, " ")
        .trim();


    /*
     * Normaliza separadores.
     */

    const textoNormalizado = textoSemGenero
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();


    /*
     * Converte para chave interna.
     */

    const chave = textoNormalizado
        .replace(/\s+/g, "_");


    /*
     * Aliases oficiais.
     */

    const mapa = {

        cantor: "cantor",
        cantora: "cantor",

        musico: "musico",
        musica: "musico",

        banda: "banda",

        dupla: "dupla",
        dupla_musical: "dupla",

        dj: "dj",

        dancarino: "dancarino",
        dancarina: "dancarino",

        grupo_de_danca: "grupo_danca",
        grupo_danca: "grupo_danca",

        mc: "mc",

        compositor: "compositor",
        compositora: "compositor",

        produtor_musical: "produtor_musical",
        produtora_musical: "produtor_musical",

        contratante: "contratante"
    };


    /*
     * Primeiro tenta pelos aliases.
     */

    if (mapa[chave]) {
        return mapa[chave];
    }


    /*
     * Depois tenta diretamente pela configuração.
     */

    if (TIPOS[chave]) {
        return chave;
    }


    return "";
}

    /* =========================================================
       IDENTIFICAÇÃO DE OBJETOS
       ========================================================= */

    function tentarIdentificar(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {
            return "";
        }


        /*
         * =====================================================
         * STRING / NUMBER / BOOLEAN
         * =====================================================
         */

        if (
            typeof valor === "string" ||
            typeof valor === "number" ||
            typeof valor === "boolean"
        ) {

            return normalizarChave(valor);
        }


        /*
         * =====================================================
         * ARRAY
         * =====================================================
         */

        if (Array.isArray(valor)) {

            for (const item of valor) {

                const chave = tentarIdentificar(item);

                if (chave) {
                    return chave;
                }
            }

            return "";
        }


        /*
         * =====================================================
         * OBJETO
         * =====================================================
         */

        if (typeof valor === "object") {

            /*
             * Ordem de prioridade.
             *
             * "tipo_artista" vem primeiro porque é o campo
             * oficial do perfil artístico.
             */

            const propriedadesPrioritarias = [

                "tipo_artista",
                "tipoArtista",

                "chave",

                "nome",

                "nome_tipo",
                "nomeTipo",

                "tipo_perfil",
                "tipoPerfil",

                "tipo"

            ];


            for (
                const propriedade
                of propriedadesPrioritarias
            ) {

                if (
                    !Object.prototype.hasOwnProperty.call(
                        valor,
                        propriedade
                    )
                ) {
                    continue;
                }


                const conteudo = valor[propriedade];


                /*
                 * Não interpretar "artista" como tipo específico.
                 */

                if (
                    typeof conteudo === "string" &&
                    normalizarTexto(conteudo) === "artista"
                ) {
                    continue;
                }


                const chave = tentarIdentificar(conteudo);

                if (chave) {
                    return chave;
                }
            }
        }


        return "";
    }


    /* =========================================================
       OBTÉM A CHAVE
       ========================================================= */

    function obterChave(valor) {

        return tentarIdentificar(valor);
    }


    /* =========================================================
       OBTÉM CONFIGURAÇÃO
       ========================================================= */

    function obterTipo(valor) {

        const chave = obterChave(valor);

        if (!chave) {
            return null;
        }

        return TIPOS[chave] || null;
    }


    /* =========================================================
       OBTÉM NOME
       ========================================================= */

    function obterNome(valor) {

        const tipo = obterTipo(valor);

        if (!tipo) {
            return "";
        }

        return tipo.nome;
    }


    /* =========================================================
       OBTÉM CATEGORIA
       ========================================================= */

    function obterCategoria(valor) {

        const tipo = obterTipo(valor);

        if (!tipo) {
            return "";
        }

        return tipo.categoria;
    }


    /* =========================================================
       OBTÉM RECURSOS
       ========================================================= */

    function obterRecursos(valor) {

        const tipo = obterTipo(valor);

        if (!tipo) {
            return {};
        }

        return {
            ...tipo.recursos
        };
    }


    /* =========================================================
       RECURSOS DA PÁGINA ATUAL
       ========================================================= */

    function obterRecursosDaPagina() {

        const parametro =
            new URLSearchParams(
                window.location.search
            ).get("tipo");


        if (parametro) {
            return obterRecursos(parametro);
        }


        const caminho =
            window.location.pathname
                .toLowerCase()
                .replace(/\\/g, "/");


        if (caminho.includes("contratante")) {
            return obterRecursos("contratante");
        }


        if (caminho.includes("cantor")) {
            return obterRecursos("cantor");
        }


        if (caminho.includes("musico")) {
            return obterRecursos("musico");
        }


        if (caminho.includes("banda")) {
            return obterRecursos("banda");
        }


        if (caminho.includes("dupla")) {
            return obterRecursos("dupla");
        }


        if (
            caminho.includes("dancarino") ||
            caminho.includes("dançarino")
        ) {
            return obterRecursos("dancarino");
        }


        if (
            caminho.includes("grupo-danca") ||
            caminho.includes("grupo_danca")
        ) {
            return obterRecursos("grupo_danca");
        }


        if (
            caminho.includes("produtor-musical") ||
            caminho.includes("produtor_musical")
        ) {
            return obterRecursos("produtor_musical");
        }


        if (caminho.includes("compositor")) {
            return obterRecursos("compositor");
        }


        if (caminho.includes("dj")) {
            return obterRecursos("dj");
        }


        if (caminho.includes("mc")) {
            return obterRecursos("mc");
        }


        return {};
    }


    /* =========================================================
       REGRAS COMPLETAS
       ========================================================= */

    function obterRegras(valor) {

        const tipo = obterTipo(valor);

        if (!tipo) {
            return null;
        }

        return {

            chave: tipo.chave,

            nome: tipo.nome,

            categoria: tipo.categoria,

            recursos: {
                ...tipo.recursos
            }

        };
    }


    /* =========================================================
       LISTA DE TIPOS
       ========================================================= */

    function obterTipos() {

        return Object.values(TIPOS).map(tipo => ({

            chave: tipo.chave,

            nome: tipo.nome,

            categoria: tipo.categoria,

            recursos: {
                ...tipo.recursos
            }

        }));
    }


    /* =========================================================
       VERIFICAÇÃO DE RECURSO
       ========================================================= */

    function possuiRecurso(valor, recurso) {

        const tipo = obterTipo(valor);

        if (!tipo || !recurso) {
            return false;
        }

        return tipo.recursos[recurso] === true;
    }


    /* =========================================================
       ATALHOS
       ========================================================= */

    function possuiFoto(valor) {
        return possuiRecurso(valor, "foto");
    }


    function possuiPortfolio(valor) {
        return possuiRecurso(valor, "portfolio");
    }


    function possuiAgenda(valor) {
        return possuiRecurso(valor, "agenda");
    }


    function possuiServicos(valor) {
        return possuiRecurso(valor, "servicos");
    }


    function possuiInstrumentos(valor) {
        return possuiRecurso(valor, "instrumentos");
    }


    function possuiEstilos(valor) {
        return possuiRecurso(valor, "estilos");
    }


    function possuiAvaliacoes(valor) {
        return possuiRecurso(valor, "avaliacoes");
    }


    function possuiContato(valor) {
        return possuiRecurso(valor, "contato");
    }


    function possuiContratacao(valor) {
        return possuiRecurso(valor, "contratacao");
    }


    /* =========================================================
       IDENTIFICAÇÃO DE CATEGORIA
       ========================================================= */

    function ehArtista(valor) {

        const tipo = obterTipo(valor);

        if (!tipo) {
            return false;
        }

        return tipo.categoria === "Artista";
    }


    function ehContratante(valor) {

        const tipo = obterTipo(valor);

        if (!tipo) {
            return false;
        }

        return tipo.categoria === "Contratante";
    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ApresentarPerfilTipo = {

        normalizarTexto,
        normalizarChave,

        obterChave,
        obterTipo,
        obterNome,
        obterCategoria,

        obterRecursos,
        obterRecursosDaPagina,

        obterRegras,
        obterTipos,

        possuiRecurso,

        possuiFoto,
        possuiPortfolio,
        possuiAgenda,
        possuiServicos,
        possuiInstrumentos,
        possuiEstilos,
        possuiAvaliacoes,
        possuiContato,
        possuiContratacao,

        ehArtista,
        ehContratante

    };


    console.log(
        "ApresentarPerfilTipo.js carregado."
    );


})(window);