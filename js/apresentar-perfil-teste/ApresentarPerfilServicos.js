"use strict";

/* =========================================================
   MUSICALWORLD — APRESENTAR PERFIL TESTE

   Arquivo:
   js/apresentar-perfil-teste/ApresentarPerfilServicos.js

   Responsabilidades:
   - Receber os serviços carregados pelo módulo de dados.
   - Normalizar diferentes formatos de serviço.
   - Filtrar serviços ativos.
   - Renderizar os cards de serviços.
   - Exibir nome, descrição, preço, cobrança e duração.
   - Controlar a visibilidade da seção de serviços.
   - Disponibilizar os serviços para outros módulos.

   IMPORTANTE:
   - Este módulo pertence exclusivamente à nova página
     de apresentação de perfil.
   - NÃO acessa o Supabase diretamente.
   - NÃO cria consultas ao banco.
   - NÃO depende do ApresentarPerfilServicos.js antigo.
   - Os dados devem ser fornecidos por:
       window.ApresentarPerfilDadosTeste
   - Os ícones são SVG inline para manter o módulo
     independente de bibliotecas externas.

   Arquivo responsável pelo banco:
       js/apresentar-perfil-teste/ApresentarPerfilDados.js
========================================================= */


/* =========================================================
   ESTADO
========================================================= */

const estado = {

    servicos: [],

    carregando: false,

    carregado: false,

    erro: null

};


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CONFIG = {

    elementos: {

        secao:
            "profileServices",

        lista:
            "servicesList"

    }

};


/* =========================================================
   UTILITÁRIOS DOM
========================================================= */

function obterElemento(id) {

    if (!id) {
        return null;
    }

    return document.getElementById(id);
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

/*
 * Protege os dados vindos do banco antes de inseri-los
 * através de innerHTML.
 */
function escaparHtml(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";
    }


    return String(valor)

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


/* =========================================================
   CONVERSÃO NUMÉRICA
========================================================= */

function converterParaNumero(valor) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return null;
    }


    if (
        typeof valor === "number" &&
        Number.isFinite(valor)
    ) {

        return valor;
    }


    let texto =
        String(valor)
            .trim();


    if (!texto) {
        return null;
    }


    /*
     * Remove símbolos de moeda e outros caracteres.
     */
    texto =
        texto.replace(
            /[^\d,.-]/g,
            ""
        );


    /*
     * Trata valores no formato brasileiro:
     *
     * 1.500,50
     */
    if (
        texto.includes(",") &&
        texto.includes(".")
    ) {

        texto =
            texto.replace(
                /\./g,
                ""
            );

        texto =
            texto.replace(
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


    const numero =
        Number(texto);


    return Number.isFinite(numero)
        ? numero
        : null;
}


/* =========================================================
   FORMATAÇÃO DE MOEDA
========================================================= */

function formatarMoeda(valor) {

    const numero =
        converterParaNumero(
            valor
        );


    if (numero === null) {

        return null;
    }


    try {

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    } catch (erro) {

        return `R$ ${numero.toFixed(2)}`;
    }
}


/* =========================================================
   NORMALIZAÇÃO DE LISTA
========================================================= */

function normalizarLista(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return [];
    }


    if (Array.isArray(valor)) {

        return valor;
    }


    if (
        typeof valor === "object"
    ) {

        const propriedades = [

            "servicos",
            "services",
            "lista",
            "itens",
            "items"

        ];


        for (
            let i = 0;
            i < propriedades.length;
            i++
        ) {

            const propriedade =
                propriedades[i];


            if (
                Array.isArray(
                    valor[propriedade]
                )
            ) {

                return valor[propriedade];
            }
        }


        return [
            valor
        ];
    }


    if (
        typeof valor === "string"
    ) {

        const texto =
            valor.trim();


        if (!texto) {

            return [];
        }


        /*
         * Tenta interpretar como JSON.
         */
        try {

            const json =
                JSON.parse(
                    texto
                );


            if (
                Array.isArray(
                    json
                )
            ) {

                return json;
            }


            if (
                json &&
                typeof json === "object"
            ) {

                return normalizarLista(
                    json
                );
            }

        } catch (erro) {

            /*
             * Não é JSON.
             * Continua como texto separado por vírgulas.
             */
        }


        return texto

            .split(",")

            .map(function (item) {

                return item.trim();

            })

            .filter(Boolean);
    }


    return [];
}


/* =========================================================
   NORMALIZAÇÃO DE SERVIÇO
========================================================= */

function normalizarServico(item) {

    /*
     * Permite que um serviço seja representado apenas
     * pelo nome.
     */
    if (
        typeof item === "string"
    ) {

        const nome =
            item.trim();


        if (!nome) {

            return null;
        }


        return {

            id: null,

            nome,

            descricao: "",

            valor: null,

            valorMinimo: null,

            valorMaximo: null,

            tipoCobranca: "",

            duracao: "",

            ativo: true

        };
    }


    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;
    }


    /*
     * Nome do serviço.
     */
    const nome =

        item.nome ??
        item.titulo ??
        item.nome_servico ??
        item.nomeServico ??
        item.servico ??
        item.servico_nome ??
        item.servicoNome ??
        item.tipo_servico ??
        item.tipoServico ??
        "";


    /*
     * Descrição.
     */
    const descricao =

        item.descricao ??
        item.descricao_servico ??
        item.descricaoServico ??
        item.detalhes ??
        item.observacao ??
        item.observacoes ??
        "";


    /*
     * Valor único.
     */
    const valor =

        item.valor ??
        item.preco ??
        item.preço ??
        item.valor_servico ??
        item.valorServico ??
        item.preco_servico ??
        item.precoServico ??
        item.cache ??
        item.cachê ??
        null;


    /*
     * Valor mínimo.
     */
    const valorMinimo =

        item.valor_minimo ??
        item.valorMinimo ??
        item.preco_minimo ??
        item.precoMinimo ??
        item.minimo ??
        item.min ??
        null;


    /*
     * Valor máximo.
     */
    const valorMaximo =

        item.valor_maximo ??
        item.valorMaximo ??
        item.preco_maximo ??
        item.precoMaximo ??
        item.maximo ??
        item.max ??
        null;


    /*
     * Forma de cobrança.
     */
    const tipoCobranca =

        item.tipo_cobranca ??
        item.tipoCobranca ??
        item.forma_cobranca ??
        item.formaCobranca ??
        item.unidade_cobranca ??
        item.unidadeCobranca ??
        item.periodo ??
        item.unidade ??
        "";


    /*
     * Duração.
     */
    const duracao =

        item.duracao ??
        item.duração ??
        item.duracao_servico ??
        item.duracaoServico ??
        item.tempo ??
        item.tempo_duracao ??
        item.tempoDuracao ??
        "";


    /*
     * Status.
     */
    const ativo =

        item.ativo ??
        item.disponivel ??
        item.disponibilidade ??
        item.status_ativo ??
        item.statusAtivo ??
        true;


    return {

        id:

            item.id ??
            item.servico_id ??
            item.servicoId ??
            null,

        nome:

            String(
                nome || ""
            ).trim(),

        descricao:

            String(
                descricao || ""
            ).trim(),

        valor,

        valorMinimo,

        valorMaximo,

        tipoCobranca:

            String(
                tipoCobranca || ""
            ).trim(),

        duracao:

            String(
                duracao || ""
            ).trim(),

        ativo:

            ativo !== false &&
            ativo !== "false" &&
            ativo !== 0

    };
}


/* =========================================================
   NORMALIZAR SERVIÇOS
========================================================= */

function normalizarServicos(valor) {

    return normalizarLista(
        valor
    )

        .map(function (item) {

            return normalizarServico(
                item
            );

        })

        .filter(function (servico) {

            return (
                servico &&
                servico.nome
            );

        });
}


/* =========================================================
   TIPO DE COBRANÇA
========================================================= */

function formatarTipoCobranca(valor) {

    if (!valor) {

        return "";
    }


    const texto =
        String(valor)
            .trim()
            .toLowerCase();


    const mapa = {

        hora:
            "por hora",

        horas:
            "por hora",

        hourly:
            "por hora",

        dia:
            "por dia",

        diaria:
            "por dia",

        diário:
            "por dia",

        diario:
            "por dia",

        day:
            "por dia",

        evento:
            "por evento",

        event:
            "por evento",

        show:
            "por show",

        apresentação:
            "por apresentação",

        apresentacao:
            "por apresentação",

        serviço:
            "por serviço",

        servico:
            "por serviço",

        mes:
            "por mês",

        mês:
            "por mês",

        month:
            "por mês",

        semana:
            "por semana",

        week:
            "por semana",

        projeto:
            "por projeto",

        project:
            "por projeto"

    };


    return (

        mapa[texto] ||

        String(valor).trim()

    );
}


/* =========================================================
   FORMATAÇÃO DE PREÇO
========================================================= */

function formatarPreco(servico) {

    if (!servico) {

        return {

            principal:
                "Consultar valor",

            secundario:
                ""

        };
    }


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
        valor !== null
    ) {

        return {

            principal:
                formatarMoeda(
                    valor
                ),

            secundario:
                formatarTipoCobranca(
                    servico.tipoCobranca
                )

        };
    }


    /*
     * Faixa de preço.
     */
    if (
        minimo !== null &&
        maximo !== null
    ) {

        return {

            principal:
                `${formatarMoeda(minimo)} – ${formatarMoeda(maximo)}`,

            secundario:
                formatarTipoCobranca(
                    servico.tipoCobranca
                )

        };
    }


    /*
     * Apenas valor mínimo.
     */
    if (
        minimo !== null
    ) {

        return {

            principal:
                `A partir de ${formatarMoeda(minimo)}`,

            secundario:
                formatarTipoCobranca(
                    servico.tipoCobranca
                )

        };
    }


    /*
     * Apenas valor máximo.
     */
    if (
        maximo !== null
    ) {

        return {

            principal:
                `Até ${formatarMoeda(maximo)}`,

            secundario:
                formatarTipoCobranca(
                    servico.tipoCobranca
                )

        };
    }


    return {

        principal:
            "Consultar valor",

        secundario:
            formatarTipoCobranca(
                servico.tipoCobranca
            )

    };
}


/* =========================================================
   ÍCONES SVG
========================================================= */

function obterIconeSvg(tipo) {

    const icones = {

        briefcase: `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <rect
                    x="3"
                    y="7"
                    width="18"
                    height="13"
                    rx="2"
                ></rect>

                <path
                    d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>

                <path
                    d="M3 12h18"
                ></path>
            </svg>
        `,

        guitar: `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path
                    d="M14.5 6.5l3-3"
                ></path>

                <path
                    d="M17.5 3.5l3 3"
                ></path>

                <path
                    d="M20.5 6.5l-3 3"
                ></path>

                <path
                    d="M17.5 9.5l-6.8 6.8"
                ></path>

                <ellipse
                    cx="8.2"
                    cy="17.2"
                    rx="4.2"
                    ry="3.8"
                    transform="rotate(-45 8.2 17.2)"
                ></ellipse>

                <circle
                    cx="8.2"
                    cy="17.2"
                    r="1"
                ></circle>
            </svg>
        `,

        receipt: `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path
                    d="M4 3h16v18l-3-2-3 2-3-2-3 2-4-2V3z"
                ></path>

                <path
                    d="M8 8h8"
                ></path>

                <path
                    d="M8 12h8"
                ></path>

                <path
                    d="M8 16h4"
                ></path>
            </svg>
        `,

        clock: `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <circle
                    cx="12"
                    cy="12"
                    r="9"
                ></circle>

                <path
                    d="M12 7v5l3 2"
                ></path>
            </svg>
        `

    };


    return (
        icones[tipo] ||
        ""
    );
}


/* =========================================================
   METADADOS DO SERVIÇO
========================================================= */

function criarMetadados(servico) {

    const metadados = [];


    const tipoCobranca =
        formatarTipoCobranca(
            servico.tipoCobranca
        );


    if (
        tipoCobranca
    ) {

        metadados.push({

            icone:
                obterIconeSvg(
                    "receipt"
                ),

            texto:
                tipoCobranca

        });
    }


    if (
        servico.duracao
    ) {

        metadados.push({

            icone:
                obterIconeSvg(
                    "clock"
                ),

            texto:
                servico.duracao

        });
    }


    return metadados;
}


/* =========================================================
   CRIAR CARD DE SERVIÇO
========================================================= */

function criarCardServico(servico) {

    const preco =
        formatarPreco(
            servico
        );


    const metadados =
        criarMetadados(
            servico
        );


    const metadadosHtml =

        metadados

            .map(function (item) {

                return `
                    <span class="service-meta-item">

                        ${item.icone}

                        <span>
                            ${escaparHtml(item.texto)}
                        </span>

                    </span>
                `;

            })

            .join("");


    const descricaoHtml =

        servico.descricao

            ? `
                <p class="service-description">
                    ${escaparHtml(
                        servico.descricao
                    )}
                </p>
            `

            : "";


    const precoSecundarioHtml =

        preco.secundario

            ? `
                <span class="service-price-unit">
                    ${escaparHtml(
                        preco.secundario
                    )}
                </span>
            `

            : "";


    return `

        <article
            class="service-card"
            data-service-id="${escaparHtml(
                servico.id || ""
            )}"
        >

            <div class="service-card-accent"></div>


            <div class="service-card-header">

                <div class="service-icon">
                    ${obterIconeSvg("guitar")}
                </div>


                <div class="service-card-title-area">

                    <h3 class="service-card-title">
                        ${escaparHtml(
                            servico.nome
                        )}
                    </h3>

                </div>

            </div>


            ${descricaoHtml}


            ${
                metadadosHtml

                    ? `
                        <div class="service-meta">
                            ${metadadosHtml}
                        </div>
                    `

                    : ""
            }


            <div class="service-card-footer">

                <div class="service-price">

                    <span class="service-price-label">
                        Valor
                    </span>


                    <strong>
                        ${escaparHtml(
                            preco.principal
                        )}
                    </strong>


                    ${precoSecundarioHtml}

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   ESTADO VAZIO
========================================================= */

function renderizarEstadoVazio(lista) {

    if (!lista) {

        return;
    }


    lista.innerHTML = `

        <div class="services-empty">

            <div class="services-empty-icon">
                ${obterIconeSvg("briefcase")}
            </div>


            <div>

                <h3>
                    Nenhum serviço cadastrado
                </h3>


                <p>
                    Este artista ainda não publicou serviços.
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   RENDERIZAÇÃO
========================================================= */

function renderizar(
    servicos = estado.servicos
) {

    const lista =
        obterElemento(
            CONFIG.elementos.lista
        );


    const secao =
        obterElemento(
            CONFIG.elementos.secao
        );


    if (!lista) {

        console.warn(
            "ApresentarPerfilServicosTeste: #servicesList não encontrado."
        );

        return;
    }


    const servicosNormalizados =
        normalizarServicos(
            servicos
        );


    const servicosAtivos =
        servicosNormalizados

            .filter(function (servico) {

                return servico.ativo;

            });


    estado.servicos =
        servicosAtivos;


    /*
     * Não existem serviços ativos.
     *
     * A seção inteira permanece invisível.
     */
    if (
        !servicosAtivos.length
    ) {

        lista.innerHTML =
            "";


        if (secao) {

            secao.hidden =
                true;
        }


        return;
    }


    /*
     * Existem serviços.
     *
     * A seção é exibida.
     */
    if (secao) {

        secao.hidden =
            false;
    }


    lista.innerHTML =

        servicosAtivos

            .map(function (servico) {

                return criarCardServico(
                    servico
                );

            })

            .join("");


    console.log(
        "ApresentarPerfilServicosTeste: serviços renderizados:",
        servicosAtivos.length
    );
}


/* =========================================================
   CARREGAR DADOS DOS SERVIÇOS
========================================================= */

/*
 * Este módulo não consulta o Supabase.
 *
 * Ele utiliza exclusivamente o módulo central de dados.
 */
async function carregar() {

    estado.carregando =
        true;

    estado.erro =
        null;


    try {

        const moduloDados =
            window.ApresentarPerfilDadosTeste;


        if (
            !moduloDados
        ) {

            throw new Error(
                "ApresentarPerfilDadosTeste não está disponível."
            );
        }


        /*
         * O módulo de dados disponibiliza os serviços
         * através de obterServicos().
         */
        if (
            typeof moduloDados.obterServicos !==
            "function"
        ) {

            console.warn(
                "ApresentarPerfilServicosTeste: obterServicos() ainda não está disponível no módulo de dados."
            );


            atualizar([]);

            return [];
        }


        const dados =
            await moduloDados.obterServicos();


        const servicos =
            normalizarServicos(
                dados
            );


        estado.servicos =
            servicos;


        renderizar(
            servicos
        );


        estado.carregado =
            true;


        return estado.servicos;


    } catch (erro) {

        estado.erro =
            erro;


        estado.carregado =
            false;


        estado.servicos =
            [];


        renderizar(
            []
        );


        console.error(
            "ApresentarPerfilServicosTeste: erro ao carregar serviços:",
            erro
        );


        /*
         * Falha nos serviços não deve impedir que o restante
         * do perfil seja exibido.
         */
        return [];


    } finally {

        estado.carregando =
            false;
    }
}


/* =========================================================
   INICIALIZAR
========================================================= */

async function inicializar(
    servicos = null
) {

    /*
     * Permite que o controlador envie os serviços
     * diretamente, evitando nova leitura.
     */
    if (
        servicos !== null &&
        servicos !== undefined
    ) {

        atualizar(
            servicos
        );

        return obterServicos();
    }


    return carregar();
}


/* =========================================================
   ATUALIZAR
========================================================= */

function atualizar(
    servicos
) {

    estado.servicos =
        normalizarServicos(
            servicos
        );


    renderizar(
        estado.servicos
    );


    estado.carregado =
        true;


    estado.erro =
        null;


    return [
        ...estado.servicos
    ];
}


/* =========================================================
   OBTER SERVIÇOS
========================================================= */

function obterServicos() {

    return [
        ...estado.servicos
    ];
}


/* =========================================================
   OBTER SERVIÇO POR ID
========================================================= */

function obterServicoPorId(id) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;
    }


    const idTexto =
        String(id);


    return (

        estado.servicos.find(
            function (servico) {

                return (
                    String(servico.id) ===
                    idTexto
                );

            }
        )

        ||

        null
    );
}


/* =========================================================
   OBTER SERVIÇOS ATIVOS
========================================================= */

function obterServicosAtivos() {

    return estado.servicos.filter(
        function (servico) {

            return servico.ativo;

        }
    );
}


/* =========================================================
   LIMPAR
========================================================= */

function limpar() {

    estado.servicos =
        [];


    estado.carregando =
        false;


    estado.carregado =
        false;


    estado.erro =
        null;


    const lista =
        obterElemento(
            CONFIG.elementos.lista
        );


    const secao =
        obterElemento(
            CONFIG.elementos.secao
        );


    if (lista) {

        lista.innerHTML =
            "";
    }


    if (secao) {

        secao.hidden =
            true;
    }
}


/* =========================================================
   ESTADO
========================================================= */

function obterEstado() {

    return {

        carregando:
            estado.carregando,

        carregado:
            estado.carregado,

        erro:
            estado.erro,

        servicos: [
            ...estado.servicos
        ]

    };
}


/* =========================================================
   API PÚBLICA
========================================================= */

const API = {

    carregar,

    inicializar,

    renderizar,

    atualizar,

    obterServicos,

    obterServicoPorId,

    obterServicosAtivos,

    obterEstado,

    limpar,

    estaInicializado:
        function () {

            return estado.carregado;

        }

};


/* =========================================================
   EXPOR GLOBALMENTE
========================================================= */

window.ApresentarPerfilServicosTeste =
    API;


/* =========================================================
   DIAGNÓSTICO
========================================================= */

console.log(
    "ApresentarPerfilServicosTeste carregado."
);