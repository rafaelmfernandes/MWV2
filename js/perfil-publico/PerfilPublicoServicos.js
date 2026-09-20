/* =========================================================
   MUSICALWORLD — PERFIL PÚBLICO
   Arquivo: js/perfil-publico/PerfilPublicoServicos.js

   Responsabilidade:

   - Renderizar os serviços fornecidos pelo
     PerfilPublicoDados.js.
   - Não executar consultas diretamente no Supabase.
   - Não buscar serviços dentro de perfis_artistas.
   - Trabalhar com diferentes formatos de dados.
   - Normalizar os serviços antes da renderização.
   - Exibir estado vazio quando não houver serviços.
   - Funcionar como módulo exclusivamente visual.

   REGRA DE ARQUITETURA:

   PerfilPublicoDados.js
           ↓
   servicos_artistas
           ↓
   PerfilPublicoServicos.js
           ↓
   renderização

   Este arquivo NÃO deve descobrir ou buscar serviços
   diretamente no banco.

   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       DEPENDÊNCIAS
       ===================================================== */

    const Utils =
        window.PerfilPublicoUtils || null;


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        elementos: {

            listaServicos:
                "servicesList"

        }

    };


    /* =====================================================
       ESTADO
       ===================================================== */

    const estado = {

        servicos: [],

        inicializado: false

    };


    /* =====================================================
       LOG
       ===================================================== */

    function log(...mensagens) {

        console.log(
            "[PerfilPublicoServicos]",
            ...mensagens
        );

    }


    function aviso(...mensagens) {

        console.warn(
            "[PerfilPublicoServicos]",
            ...mensagens
        );

    }


    function erro(...mensagens) {

        console.error(
            "[PerfilPublicoServicos]",
            ...mensagens
        );

    }


    /* =====================================================
       OBTER ELEMENTO
       ===================================================== */

    function obterElemento(id) {

        if (
            Utils &&
            typeof Utils.obterElemento === "function"
        ) {

            return Utils.obterElemento(
                id
            );

        }


        return document.getElementById(
            id
        );

    }


    /* =====================================================
       INICIALIZAR
       ===================================================== */

    function inicializar(servicos = null) {

        log(
            "Inicializando módulo de serviços..."
        );


        /*
         * Se o controlador principal fornecer os serviços,
         * utilizamos exatamente esses dados.
         *
         * Este módulo não faz nenhuma consulta.
         */

        if (
            servicos !== null &&
            servicos !== undefined
        ) {

            estado.servicos =
                normalizarServicos(
                    servicos
                );

        } else {

            /*
             * Sem dados fornecidos, o módulo começa vazio.
             *
             * Não buscamos dados em nenhum outro módulo.
             */

            estado.servicos =
                [];

        }


        renderizar();


        estado.inicializado =
            true;


        log(
            "Serviços inicializados:",
            estado.servicos.length
        );


        return obterServicos();

    }


    /* =====================================================
       NORMALIZAR SERVIÇOS
       ===================================================== */

    function normalizarServicos(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return [];

        }


        /*
         * Caso o banco ou o módulo de dados tenha
         * entregue JSON como texto.
         */

        if (
            typeof valor === "string"
        ) {

            const texto =
                valor.trim();


            if (!texto) {

                return [];

            }


            /*
             * Tenta interpretar arrays e objetos JSON.
             */

            if (
                (
                    texto.startsWith("[") &&
                    texto.endsWith("]")
                ) ||
                (
                    texto.startsWith("{") &&
                    texto.endsWith("}")
                )
            ) {

                try {

                    const convertido =
                        JSON.parse(
                            texto
                        );


                    return normalizarServicos(
                        convertido
                    );


                } catch (error) {

                    aviso(
                        "Não foi possível interpretar os serviços como JSON.",
                        error
                    );

                }

            }


            /*
             * Caso seja uma lista simples separada
             * por vírgulas.
             */

            return texto
                .split(",")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean)
                .map(
                    item => ({
                        nome:
                            item,

                        descricao:
                            "",

                        valor:
                            null,

                        valorMinimo:
                            null,

                        valorMaximo:
                            null,

                        tipoCobranca:
                            "",

                        duracao:
                            "",

                        ativo:
                            true
                    })
                );

        }


        /*
         * Caso seja um único objeto.
         */

        if (
            typeof valor === "object" &&
            !Array.isArray(valor)
        ) {

            /*
             * Alguns formatos podem envolver a lista
             * dentro de uma propriedade.
             */

            const listaInterna =
                obterPrimeiroValor(

                    valor.servicos,

                    valor.items,

                    valor.lista,

                    valor.data

                );


            if (
                listaInterna &&
                listaInterna !== valor
            ) {

                return normalizarServicos(
                    listaInterna
                );

            }


            const servico =
                normalizarServico(
                    valor
                );


            return servico
                ? [servico]
                : [];

        }


        /*
         * Array de serviços.
         */

        if (
            Array.isArray(valor)
        ) {

            return valor
                .map(
                    item =>
                        normalizarServico(
                            item
                        )
                )
                .filter(Boolean);

        }


        return [];

    }


    /* =====================================================
       NORMALIZAR UM SERVIÇO
       ===================================================== */

    function normalizarServico(servico) {

        /*
         * Serviço representado somente por texto.
         */

        if (
            typeof servico === "string"
        ) {

            const nome =
                servico.trim();


            if (!nome) {

                return null;

            }


            return {

                original:
                    servico,

                id:
                    "",

                nome,

                descricao:
                    "",

                valor:
                    null,

                valorMinimo:
                    null,

                valorMaximo:
                    null,

                tipoCobranca:
                    "",

                duracao:
                    "",

                ativo:
                    true

            };

        }


        /*
         * Ignora valores inválidos.
         */

        if (
            !servico ||
            typeof servico !== "object"
        ) {

            return null;

        }


        /* =================================================
           NOME
           ================================================= */

        const nome =
            obterPrimeiroValor(

                servico.nome,

                servico.titulo,

                servico.nome_servico,

                servico.nomeServico,

                servico.servico,

                servico.servico_nome,

                servico.nome_do_servico,

                servico.tipo

            );


        /* =================================================
           DESCRIÇÃO
           ================================================= */

        const descricao =
            obterPrimeiroValor(

                servico.descricao,

                servico.descricao_servico,

                servico.descricaoServico,

                servico.detalhes,

                servico.observacao,

                servico.observacoes,

                servico.info

            );


        /*
         * Se não existe identificação alguma,
         * o registro não será renderizado.
         */

        if (
            !nome &&
            !descricao
        ) {

            return null;

        }


        /* =================================================
           VALOR
           ================================================= */

        const valor =
            obterPrimeiroValor(

                servico.valor,

                servico.preco,

                servico.preco_servico,

                servico.precoServico,

                servico.valor_servico,

                servico.valorServico,

                servico.valor_por_servico,

                servico.price

            );


        /* =================================================
           VALOR MÍNIMO
           ================================================= */

        const valorMinimo =
            obterPrimeiroValor(

                servico.valor_minimo,

                servico.valorMinimo,

                servico.preco_minimo,

                servico.precoMinimo,

                servico.minimo

            );


        /* =================================================
           VALOR MÁXIMO
           ================================================= */

        const valorMaximo =
            obterPrimeiroValor(

                servico.valor_maximo,

                servico.valorMaximo,

                servico.preco_maximo,

                servico.precoMaximo,

                servico.maximo

            );


        /* =================================================
           TIPO DE COBRANÇA
           ================================================= */

        const tipoCobranca =
            obterPrimeiroValor(

                servico.tipo_cobranca,

                servico.tipoCobranca,

                servico.forma_cobranca,

                servico.formaCobranca,

                servico.unidade,

                servico.cobranca

            );


        /* =================================================
           DURAÇÃO
           ================================================= */

        const duracao =
            obterPrimeiroValor(

                servico.duracao,

                servico.duracao_servico,

                servico.duracaoServico,

                servico.tempo,

                servico.tempo_duracao,

                servico.tempoDuracao

            );


        /* =================================================
           STATUS
           ================================================= */

        const ativo =
            obterPrimeiroValor(

                servico.ativo,

                servico.disponivel,

                servico.disponibilidade,

                servico.status

            );


        /* =================================================
           OBJETO NORMALIZADO
           ================================================= */

        return {

            original:
                servico,

            id:
                obterPrimeiroValor(
                    servico.id
                ),

            nome:
                nome ||
                "Serviço",

            descricao:
                descricao || "",

            valor:
                valor !== ""
                    ? valor
                    : null,

            valorMinimo:
                valorMinimo !== ""
                    ? valorMinimo
                    : null,

            valorMaximo:
                valorMaximo !== ""
                    ? valorMaximo
                    : null,

            tipoCobranca:
                tipoCobranca || "",

            duracao:
                duracao || "",

            ativo:
                ativo

        };

    }


    /* =====================================================
       RENDERIZAR
       ===================================================== */

    function renderizar(servicos = null) {

        /*
         * Quando novos dados são fornecidos,
         * atualizamos o estado.
         */

        if (
            servicos !== null &&
            servicos !== undefined
        ) {

            estado.servicos =
                normalizarServicos(
                    servicos
                );

        }


        const container =
            obterElemento(
                CONFIG.elementos.listaServicos
            );


        if (!container) {

            aviso(
                `Elemento #${CONFIG.elementos.listaServicos} não encontrado.`
            );


            return;

        }


        /*
         * Nenhum serviço.
         */

        if (
            !estado.servicos.length
        ) {

            renderizarVazio(
                container
            );


            return;

        }


        /*
         * Renderiza todos os serviços.
         */

        container.innerHTML =
            estado.servicos
                .map(
                    (
                        servico,
                        indice
                    ) =>
                        renderizarServico(
                            servico,
                            indice
                        )
                )
                .join("");


        renderizarIcones();


        log(
            "Serviços renderizados:",
            estado.servicos.length
        );

    }


    /* =====================================================
       RENDERIZAR SERVIÇO
       ===================================================== */

    function renderizarServico(
        servico,
        indice
    ) {

        const nome =
            escaparHtml(
                servico.nome ||
                `Serviço ${indice + 1}`
            );


        const descricao =
            servico.descricao
                ? escaparHtml(
                    servico.descricao
                )
                : "";


        const preco =
            renderizarPreco(
                servico
            );


        const meta =
            renderizarMeta(
                servico
            );


        const status =
            renderizarStatus(
                servico
            );


        return `

            <article
                class="service-card"
                data-service-index="${indice}"
            >

                <div class="service-icon">

                    <i
                        data-lucide="briefcase-business"
                        aria-hidden="true"
                    ></i>

                </div>


                <div class="service-info">

                    <h4 class="service-name">
                        ${nome}
                    </h4>


                    ${
                        descricao
                            ? `
                                <p class="service-description">
                                    ${descricao}
                                </p>
                            `
                            : ""
                    }


                    ${
                        meta
                            ? `
                                <div class="service-meta">
                                    ${meta}
                                </div>
                            `
                            : ""
                    }

                </div>


                ${
                    preco || status
                        ? `
                            <div class="service-side">

                                ${
                                    preco
                                        ? `
                                            <div class="service-price">
                                                ${preco}
                                            </div>
                                        `
                                        : ""
                                }


                                ${
                                    status
                                        ? `
                                            <div class="service-status">
                                                ${status}
                                            </div>
                                        `
                                        : ""
                                }

                            </div>
                        `
                        : ""
                }

            </article>

        `;

    }


    /* =====================================================
       RENDERIZAR PREÇO
       ===================================================== */

    function renderizarPreco(
        servico
    ) {

        const valor =
            converterParaNumero(
                servico.valor
            );


        const minimo =
            converterParaNumero(
                servico.valorMinimo
            );


        const maximo =
            converterParaNumero(
                servico.valorMaximo
            );


        /*
         * Valor único.
         */

        if (
            valor !== null &&
            valor > 0
        ) {

            return `

                A partir de

                <strong>
                    ${formatarMoeda(valor)}
                </strong>

            `;

        }


        /*
         * Faixa de valores.
         */

        if (
            minimo !== null &&
            minimo > 0 &&
            maximo !== null &&
            maximo > 0
        ) {

            if (
                minimo === maximo
            ) {

                return `

                    <strong>
                        ${formatarMoeda(minimo)}
                    </strong>

                `;

            }


            return `

                <strong>
                    ${formatarMoeda(minimo)}
                    -
                    ${formatarMoeda(maximo)}
                </strong>

            `;

        }


        /*
         * Somente valor mínimo.
         */

        if (
            minimo !== null &&
            minimo > 0
        ) {

            return `

                A partir de

                <strong>
                    ${formatarMoeda(minimo)}
                </strong>

            `;

        }


        /*
         * Somente valor máximo.
         */

        if (
            maximo !== null &&
            maximo > 0
        ) {

            return `

                Até

                <strong>
                    ${formatarMoeda(maximo)}
                </strong>

            `;

        }


        return "";

    }


    /* =====================================================
       RENDERIZAR META
       ===================================================== */

    function renderizarMeta(
        servico
    ) {

        const partes =
            [];


        if (
            servico.tipoCobranca
        ) {

            partes.push(

                `<span>${escaparHtml(
                    formatarTipoCobranca(
                        servico.tipoCobranca
                    )
                )}</span>`

            );

        }


        if (
            servico.duracao
        ) {

            partes.push(

                `<span>${escaparHtml(
                    String(
                        servico.duracao
                    )
                )}</span>`

            );

        }


        if (!partes.length) {

            return "";

        }


        return partes.join(

            `<span class="service-meta-separator">•</span>`

        );

    }


    /* =====================================================
       FORMATAR TIPO DE COBRANÇA
       ===================================================== */

    function formatarTipoCobranca(
        valor
    ) {

        const texto =
            String(
                valor || ""
            )
            .trim()
            .toLowerCase();


        const mapa = {

            "hora":
                "por hora",

            "horas":
                "por hora",

            "hora(s)":
                "por hora",

            "evento":
                "por evento",

            "eventos":
                "por evento",

            "show":
                "por show",

            "shows":
                "por show",

            "diaria":
                "por diária",

            "diária":
                "por diária",

            "diaria(s)":
                "por diária",

            "mensal":
                "mensal",

            "mensalidade":
                "mensal"

        };


        return mapa[texto] ||
            valor;

    }


    /* =====================================================
       RENDERIZAR STATUS
       ===================================================== */

    function renderizarStatus(
        servico
    ) {

        /*
         * Sem status explícito,
         * não exibimos indicador.
         */

        if (
            servico.ativo === "" ||
            servico.ativo === null ||
            servico.ativo === undefined
        ) {

            return "";

        }


        const ativo =
            converterParaBooleano(
                servico.ativo
            );


        if (ativo) {

            return `

                <span class="service-status-active">

                    <i
                        data-lucide="check-circle-2"
                        aria-hidden="true"
                    ></i>

                    Disponível

                </span>

            `;

        }


        return `

            <span class="service-status-inactive">
                Indisponível
            </span>

        `;

    }


    /* =====================================================
       ESTADO VAZIO
       ===================================================== */

    function renderizarVazio(
        container
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i
                    data-lucide="briefcase-business"
                    aria-hidden="true"
                ></i>

                <h4>
                    Nenhum serviço cadastrado
                </h4>

                <p>
                    Nenhum serviço foi cadastrado neste perfil.
                </p>

            </div>

        `;


        renderizarIcones();

    }


    /* =====================================================
       CONVERTER PARA NÚMERO
       ===================================================== */

    function converterParaNumero(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return null;

        }


        if (
            typeof valor === "number"
        ) {

            return Number.isFinite(
                valor
            )
                ? valor
                : null;

        }


        let texto =
            String(
                valor
            )
            .trim();


        if (!texto) {

            return null;

        }


        /*
         * Remove moeda e espaços.
         */

        texto =
            texto
                .replace(
                    /R\$/gi,
                    ""
                )
                .replace(
                    /\s/g,
                    ""
                );


        /*
         * Formato brasileiro:
         *
         * 1.500,00
         */

        if (
            texto.includes(",") &&
            texto.includes(".")
        ) {

            texto =
                texto
                    .replace(
                        /\./g,
                        ""
                    )
                    .replace(
                        ",",
                        "."
                    );

        } else if (
            texto.includes(",")
        ) {

            texto =
                texto.replace(
                    ",",
                    "."
                );

        }


        texto =
            texto.replace(
                /[^0-9.-]/g,
                ""
            );


        const numero =
            Number(
                texto
            );


        return Number.isFinite(
            numero
        )
            ? numero
            : null;

    }


    /* =====================================================
       FORMATAR MOEDA
       ===================================================== */

    function formatarMoeda(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.formatarMoeda === "function"
        ) {

            return Utils.formatarMoeda(
                valor
            );

        }


        const numero =
            converterParaNumero(
                valor
            );


        if (
            numero === null
        ) {

            return "R$ 0,00";

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );

    }


    /* =====================================================
       CONVERTER BOOLEANO
       ===================================================== */

    function converterParaBooleano(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.converterParaBooleano === "function"
        ) {

            return Utils.converterParaBooleano(
                valor
            );

        }


        if (
            typeof valor === "boolean"
        ) {

            return valor;

        }


        const texto =
            String(
                valor || ""
            )
            .trim()
            .toLowerCase();


        return [

            "true",

            "1",

            "sim",

            "ativo",

            "disponivel",

            "disponível"

        ].includes(
            texto
        );

    }


    /* =====================================================
       OBTER PRIMEIRO VALOR
       ===================================================== */

    function obterPrimeiroValor(
        ...valores
    ) {

        if (
            Utils &&
            typeof Utils.obterPrimeiroValor === "function"
        ) {

            return Utils.obterPrimeiroValor(
                ...valores
            );

        }


        for (
            const valor of valores
        ) {

            if (
                valor !== null &&
                valor !== undefined &&
                String(
                    valor
                ).trim() !== ""
            ) {

                return valor;

            }

        }


        return "";

    }


    /* =====================================================
       ESCAPAR HTML
       ===================================================== */

    function escaparHtml(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.escaparHtml === "function"
        ) {

            return Utils.escaparHtml(
                valor
            );

        }


        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(
            valor
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       RENDERIZAR ÍCONES
       ===================================================== */

    function renderizarIcones() {

        if (
            Utils &&
            typeof Utils.renderizarIcones === "function"
        ) {

            Utils.renderizarIcones();

            return;

        }


        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* =====================================================
       ATUALIZAR
       ===================================================== */

    function atualizar(
        servicos
    ) {

        estado.servicos =
            normalizarServicos(
                servicos
            );


        renderizar();


        return obterServicos();

    }


    /* =====================================================
       OBTER SERVIÇOS
       ===================================================== */

    function obterServicos() {

        return [
            ...estado.servicos
        ];

    }


    /* =====================================================
       LIMPAR
       ===================================================== */

    function limpar() {

        estado.servicos =
            [];

        estado.inicializado =
            false;


        const container =
            obterElemento(
                CONFIG.elementos.listaServicos
            );


        if (container) {

            container.innerHTML =
                "";

        }

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    const PerfilPublicoServicos = {

        CONFIG,

        estado,

        inicializar,

        renderizar,

        atualizar,

        obterServicos,

        limpar,

        normalizarServicos,

        normalizarServico

    };


    /* =====================================================
       DISPONIBILIZAR GLOBALMENTE
       ===================================================== */

    window.PerfilPublicoServicos =
        PerfilPublicoServicos;


    /* =====================================================
       CONFIRMAÇÃO
       ===================================================== */

    console.log(
        "PerfilPublicoServicos.js carregado."
    );


})(window);