/* =========================================================
MUSICALWORLD — PERFIL PÚBLICO
Arquivo: PerfilPublicoAgenda.js

Responsabilidade:

* Renderizar a agenda do artista.
* Exibir eventos futuros e realizados.
* Exibir data, horário, local e informações do evento.
* Utilizar os dados fornecidos pelo PerfilPublicoDados.js.
* Não executar consultas diretamente no Supabase.

========================================================= */

(function (window) {


"use strict";


/* =====================================================
   DEPENDÊNCIAS
   ===================================================== */

const Utils =
    window.PerfilPublicoUtils;

const Dados =
    window.PerfilPublicoDados;


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    elementos: {

        listaAgenda:
            "agendaList"

    }

};


/* =====================================================
   ESTADO
   ===================================================== */

const estado = {

    agenda: [],

    inicializado: false

};


/* =====================================================
   LOG
   ===================================================== */

function log(...mensagens) {

    console.log(
        "[PerfilPublicoAgenda]",
        ...mensagens
    );

}


function aviso(...mensagens) {

    console.warn(
        "[PerfilPublicoAgenda]",
        ...mensagens
    );

}


function erro(...mensagens) {

    console.error(
        "[PerfilPublicoAgenda]",
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

function inicializar(agenda = null) {

    log(
        "Inicializando agenda..."
    );


    if (
        agenda !== null &&
        agenda !== undefined
    ) {

        estado.agenda =
            normalizarAgenda(
                agenda
            );

    } else {

        estado.agenda =
            obterAgendaDosDados();

    }


    renderizar();


    estado.inicializado =
        true;


    log(
        "Agenda inicializada:",
        estado.agenda.length,
        "evento(s)."
    );


    return estado.agenda;

}


/* =====================================================
   OBTER AGENDA DOS DADOS
   ===================================================== */

function obterAgendaDosDados() {

    if (!Dados) {

        aviso(
            "PerfilPublicoDados.js não está disponível."
        );


        return [];

    }


    if (
        typeof Dados.obterAgenda === "function"
    ) {

        const agenda =
            Dados.obterAgenda();


        if (
            Array.isArray(agenda)
        ) {

            return normalizarAgenda(
                agenda
            );

        }

    }


    return [];

}


/* =====================================================
   NORMALIZAR AGENDA
   ===================================================== */

function normalizarAgenda(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return [];

    }


    /*
     * Agenda recebida como JSON em texto.
     */

    if (
        typeof valor === "string"
    ) {

        const texto =
            valor.trim();


        if (!texto) {
            return [];
        }


        try {

            const convertido =
                JSON.parse(
                    texto
                );


            return normalizarAgenda(
                convertido
            );

        } catch (error) {

            aviso(
                "Não foi possível interpretar a agenda como JSON."
            );


            return [];

        }

    }


    /*
     * Um único objeto.
     */

    if (
        typeof valor === "object" &&
        !Array.isArray(valor)
    ) {

        /*
         * Alguns formatos podem possuir uma lista
         * interna de eventos.
         */

        const listaInterna =
            obterPrimeiroValor(

                valor.agenda,

                valor.eventos,

                valor.eventos_agenda,

                valor.items,

                valor.data

            );


        if (
            listaInterna &&
            listaInterna !== valor
        ) {

            return normalizarAgenda(
                listaInterna
            );

        }


        const evento =
            normalizarEvento(
                valor
            );


        return evento
            ? [evento]
            : [];

    }


    /*
     * Array de eventos.
     */

    if (
        Array.isArray(valor)
    ) {

        return valor
            .map(item =>
                normalizarEvento(
                    item
                )
            )
            .filter(Boolean);

    }


    return [];

}


/* =====================================================
   NORMALIZAR EVENTO
   ===================================================== */

function normalizarEvento(evento) {

    if (
        !evento ||
        typeof evento !== "object"
    ) {

        return null;

    }


    const titulo =
        obterPrimeiroValor(

            evento.titulo,

            evento.nome_evento,

            evento.nomeEvento,

            evento.evento,

            evento.nome,

            evento.descricao_evento,

            "Evento"

        );


    const descricao =
        obterPrimeiroValor(

            evento.descricao,

            evento.descricao_evento,

            evento.detalhes,

            evento.observacao,

            evento.observacoes

        );


    const data =
        obterPrimeiroValor(

            evento.data,

            evento.data_evento,

            evento.dataEvento,

            evento.data_inicio,

            evento.dataInicio,

            evento.inicio,

            evento.start_date,

            evento.startDate

        );


    const dataFim =
        obterPrimeiroValor(

            evento.data_fim,

            evento.dataFim,

            evento.data_final,

            evento.dataFinal,

            evento.fim,

            evento.end_date,

            evento.endDate

        );


    const horario =
        obterPrimeiroValor(

            evento.horario,

            evento.hora,

            evento.horario_inicio,

            evento.hora_inicio,

            evento.horaInicio,

            evento.inicio_hora,

            evento.start_time,

            evento.startTime

        );


    const horarioFim =
        obterPrimeiroValor(

            evento.horario_fim,

            evento.hora_fim,

            evento.horaFim,

            evento.horario_final,

            evento.end_time,

            evento.endTime

        );


    const local =
        obterPrimeiroValor(

            evento.local,

            evento.local_evento,

            evento.nome_local,

            evento.nomeLocal,

            evento.localizacao,

            evento.endereco,

            evento.endereco_evento

        );


    const cidade =
        obterPrimeiroValor(

            evento.cidade,

            evento.cidade_evento,

            evento.municipio

        );


    const estadoUF =
        obterPrimeiroValor(

            evento.estado,

            evento.uf,

            evento.estado_evento

        );


    const status =
        obterPrimeiroValor(

            evento.status,

            evento.situacao,

            evento.estado_evento_status

        );


    const tipo =
        obterPrimeiroValor(

            evento.tipo,

            evento.tipo_evento,

            evento.categoria

        );


    const url =
        obterPrimeiroValor(

            evento.url,

            evento.link,

            evento.link_evento,

            evento.url_evento

        );


    return {

        original:
            evento,

        id:
            obterPrimeiroValor(
                evento.id
            ),

        titulo:
            titulo,

        descricao:
            descricao || "",

        data:
            data || "",

        dataFim:
            dataFim || "",

        horario:
            horario || "",

        horarioFim:
            horarioFim || "",

        local:
            local || "",

        cidade:
            cidade || "",

        estado:
            estadoUF || "",

        status:
            status || "",

        tipo:
            tipo || "",

        url:
            url || ""

    };

}


/* =====================================================
   RENDERIZAR
   ===================================================== */

function renderizar(agenda = null) {

    if (
        agenda !== null &&
        agenda !== undefined
    ) {

        estado.agenda =
            normalizarAgenda(
                agenda
            );

    }


    const container =
        obterElemento(
            CONFIG.elementos.listaAgenda
        );


    if (!container) {

        aviso(
            `Elemento #${CONFIG.elementos.listaAgenda} não encontrado.`
        );


        return;

    }


    /*
     * Ordena os eventos por data.
     */

    const eventosOrdenados =
        ordenarAgenda(
            estado.agenda
        );


    if (
        !eventosOrdenados.length
    ) {

        renderizarVazio(
            container
        );


        return;

    }


    container.innerHTML =
        eventosOrdenados
            .map(
                (
                    evento,
                    indice
                ) =>
                    renderizarEvento(
                        evento,
                        indice
                    )
            )
            .join("");


    configurarEventos();


    renderizarIcones();


    log(
        "Agenda renderizada:",
        eventosOrdenados.length,
        "evento(s)."
    );

}


/* =====================================================
   ORDENAR AGENDA
   ===================================================== */

function ordenarAgenda(
    agenda
) {

    return [
        ...agenda
    ].sort(
        (
            primeiro,
            segundo
        ) => {

            const dataPrimeiro =
                converterData(
                    primeiro.data
                );


            const dataSegundo =
                converterData(
                    segundo.data
                );


            if (
                !dataPrimeiro &&
                !dataSegundo
            ) {

                return 0;

            }


            if (!dataPrimeiro) {
                return 1;
            }


            if (!dataSegundo) {
                return -1;
            }


            return (
                dataPrimeiro.getTime() -
                dataSegundo.getTime()
            );

        }
    );

}


/* =====================================================
   RENDERIZAR EVENTO
   ===================================================== */

function renderizarEvento(
    evento,
    indice
) {

    const data =
        converterData(
            evento.data
        );


    const dia =
        data
            ? data.getDate()
                .toString()
                .padStart(
                    2,
                    "0"
                )
            : "--";


    const mes =
        data
            ? obterMesAbreviado(
                data
            )
            : "---";


    const dataCompleta =
        formatarDataCompleta(
            data
        );


    const horario =
        formatarHorario(
            evento
        );


    const local =
        montarLocal(
            evento
        );


    const descricao =
        evento.descricao
            ? `
                <p class="agenda-description">
                    ${escaparHtml(
                        evento.descricao
                    )}
                </p>
            `
            : "";


    const tipo =
        evento.tipo
            ? `
                <span class="agenda-type">
                    ${escaparHtml(
                        evento.tipo
                    )}
                </span>
            `
            : "";


    const status =
        renderizarStatus(
            evento
        );


    const link =
        evento.url
            ? `
                <a
                    class="agenda-link"
                    href="${escaparAtributo(
                        evento.url
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i
                        data-lucide="external-link"
                        aria-hidden="true"
                    ></i>

                    Ver evento
                </a>
            `
            : "";


    return `

        <article
            class="agenda-item"
            data-agenda-index="${indice}"
        >

            <div class="agenda-date">

                <strong>
                    ${dia}
                </strong>

                <span>
                    ${mes}
                </span>

            </div>


            <div class="agenda-info">

                <div class="agenda-header">

                    <h4 class="agenda-title">
                        ${escaparHtml(
                            evento.titulo
                        )}
                    </h4>

                    ${tipo}

                </div>


                ${
                    dataCompleta
                        ? `
                            <div class="agenda-detail">

                                <i
                                    data-lucide="calendar-days"
                                    aria-hidden="true"
                                ></i>

                                <span>
                                    ${escaparHtml(
                                        dataCompleta
                                    )}
                                </span>

                            </div>
                        `
                        : ""
                }


                ${
                    horario
                        ? `
                            <div class="agenda-detail">

                                <i
                                    data-lucide="clock-3"
                                    aria-hidden="true"
                                ></i>

                                <span>
                                    ${escaparHtml(
                                        horario
                                    )}
                                </span>

                            </div>
                        `
                        : ""
                }


                ${
                    local
                        ? `
                            <div class="agenda-detail">

                                <i
                                    data-lucide="map-pin"
                                    aria-hidden="true"
                                ></i>

                                <span>
                                    ${escaparHtml(
                                        local
                                    )}
                                </span>

                            </div>
                        `
                        : ""
                }


                ${descricao}


                <div class="agenda-footer">

                    ${status}

                    ${link}

                </div>

            </div>

        </article>

    `;

}


/* =====================================================
   FORMATAR HORÁRIO
   ===================================================== */

function formatarHorario(
    evento
) {

    if (
        evento.horario &&
        evento.horarioFim
    ) {

        return (
            `${formatarHora(
                evento.horario
            )} às ${formatarHora(
                evento.horarioFim
            )}`
        );

    }


    if (
        evento.horario
    ) {

        return formatarHora(
            evento.horario
        );

    }


    /*
     * Se não veio horário separado,
     * tentamos obter da data.
     */

    if (
        evento.data &&
        String(
            evento.data
        ).includes("T")
    ) {

        const data =
            new Date(
                evento.data
            );


        if (
            !Number.isNaN(
                data.getTime()
            )
        ) {

            return data.toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        }

    }


    return "";

}


/* =====================================================
   FORMATAR HORA
   ===================================================== */

function formatarHora(
    valor
) {

    if (!valor) {
        return "";
    }


    const texto =
        String(
            valor
        ).trim();


    /*
     * HH:mm:ss
     */

    const correspondencia =
        texto.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?$/
        );


    if (
        correspondencia
    ) {

        return (
            `${correspondencia[1].padStart(
                2,
                "0"
            )}:${correspondencia[2]}`
        );

    }


    return texto;

}


/* =====================================================
   MONTAR LOCAL
   ===================================================== */

function montarLocal(
    evento
) {

    const partes = [];


    if (
        evento.local
    ) {

        partes.push(
            evento.local
        );

    }


    if (
        evento.cidade
    ) {

        partes.push(
            evento.cidade
        );

    }


    if (
        evento.estado
    ) {

        partes.push(
            evento.estado
        );

    }


    return partes.join(
        " — "
    );

}


/* =====================================================
   RENDERIZAR STATUS
   ===================================================== */

function renderizarStatus(
    evento
) {

    const status =
        String(
            evento.status || ""
        )
        .trim()
        .toLowerCase();


    /*
     * Sem status explícito.
     * Calculamos automaticamente pela data.
     */

    if (!status) {

        const data =
            converterData(
                evento.data
            );


        if (!data) {
            return "";
        }


        const hoje =
            inicioDoDia(
                new Date()
            );


        const dataEvento =
            inicioDoDia(
                data
            );


        if (
            dataEvento >= hoje
        ) {

            return `

                <span class="agenda-status upcoming">

                    <i
                        data-lucide="calendar-check-2"
                        aria-hidden="true"
                    ></i>

                    Próximo evento

                </span>

            `;

        }


        return `

            <span class="agenda-status completed">

                <i
                    data-lucide="check"
                    aria-hidden="true"
                ></i>

                Realizado

            </span>

        `;

    }


    const realizado =
        [
            "realizado",
            "concluido",
            "concluído",
            "finalizado",
            "encerrado",
            "feito"
        ].includes(
            status
        );


    if (realizado) {

        return `

            <span class="agenda-status completed">

                <i
                    data-lucide="check"
                    aria-hidden="true"
                ></i>

                Realizado

            </span>

        `;

    }


    const cancelado =
        [
            "cancelado",
            "cancelada",
            "cancel"
        ].includes(
            status
        );


    if (cancelado) {

        return `

            <span class="agenda-status cancelled">

                <i
                    data-lucide="x"
                    aria-hidden="true"
                ></i>

                Cancelado

            </span>

        `;

    }


    return `

        <span class="agenda-status upcoming">

            <i
                data-lucide="calendar-check-2"
                aria-hidden="true"
            ></i>

            ${escaparHtml(
                evento.status
            )}

        </span>

    `;

}


/* =====================================================
   DATA
   ===================================================== */

function converterData(
    valor
) {

    if (
        !valor
    ) {

        return null;

    }


    if (
        valor instanceof Date
    ) {

        return Number.isNaN(
            valor.getTime()
        )
            ? null
            : valor;

    }


    const texto =
        String(
            valor
        ).trim();


    if (!texto) {
        return null;
    }


    /*
     * YYYY-MM-DD
     *
     * Criamos a data no horário local para evitar
     * que o navegador volte um dia por causa do UTC.
     */

    const dataSomente =
        texto.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (
        dataSomente
    ) {

        const ano =
            Number(
                dataSomente[1]
            );


        const mes =
            Number(
                dataSomente[2]
            );


        const dia =
            Number(
                dataSomente[3]
            );


        const data =
            new Date(
                ano,
                mes - 1,
                dia
            );


        return Number.isNaN(
            data.getTime()
        )
            ? null
            : data;

    }


    const data =
        new Date(
            texto
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return null;

    }


    return data;

}


/* =====================================================
   FORMATAR DATA COMPLETA
   ===================================================== */

function formatarDataCompleta(
    data
) {

    if (!data) {
        return "";
    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =====================================================
   MÊS ABREVIADO
   ===================================================== */

function obterMesAbreviado(
    data
) {

    if (!data) {
        return "---";
    }


    return data
        .toLocaleDateString(
            "pt-BR",
            {
                month: "short"
            }
        )
        .replace(
            ".",
            ""
        )
        .toUpperCase();

}


/* =====================================================
   INÍCIO DO DIA
   ===================================================== */

function inicioDoDia(
    data
) {

    const resultado =
        new Date(
            data
        );


    resultado.setHours(
        0,
        0,
        0,
        0
    );


    return resultado;

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
                data-lucide="calendar-days"
                aria-hidden="true"
            ></i>

            <h4>
                Nenhum evento na agenda
            </h4>

            <p>
                Os próximos eventos do artista
                aparecerão aqui.
            </p>

        </div>

    `;


    renderizarIcones();

}


/* =====================================================
   CONFIGURAR EVENTOS
   ===================================================== */

function configurarEventos() {

    const links =
        document.querySelectorAll(
            ".agenda-link"
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                function (evento) {

                    evento.stopPropagation();

                }
            );

        }
    );

}


/* =====================================================
   ATUALIZAR
   ===================================================== */

function atualizar(
    agenda
) {

    estado.agenda =
        normalizarAgenda(
            agenda
        );


    renderizar();


    return estado.agenda;

}


/* =====================================================
   OBTER AGENDA
   ===================================================== */

function obterAgenda() {

    return [
        ...estado.agenda
    ];

}


/* =====================================================
   LIMPAR
   ===================================================== */

function limpar() {

    estado.agenda =
        [];

    estado.inicializado =
        false;


    const container =
        obterElemento(
            CONFIG.elementos.listaAgenda
        );


    if (container) {

        container.innerHTML =
            "";

    }

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
   ESCAPAR ATRIBUTO
   ===================================================== */

function escaparAtributo(
    valor
) {

    return escaparHtml(
        valor
    );

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const PerfilPublicoAgenda = {

    CONFIG,

    estado,

    inicializar,

    renderizar,

    atualizar,

    obterAgenda,

    limpar,

    normalizarAgenda,

    normalizarEvento,

    converterData

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.PerfilPublicoAgenda =
    PerfilPublicoAgenda;


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "PerfilPublicoAgenda.js carregado."
);


})(window);
