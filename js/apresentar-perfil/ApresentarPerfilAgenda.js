/* =========================================================
MUSICALWORLD — APRESENTAR PERFIL
Arquivo: ApresentarPerfilAgenda.js

Responsabilidade:

* Renderizar a agenda do perfil visualizado.
* Normalizar diferentes formatos de eventos.
* Organizar os eventos por data.
* Exibir data, horário, local, descrição e status.
* Trabalhar independentemente do usuário logado.

IMPORTANTE:
Este arquivo não consulta o Supabase diretamente.
Os dados são fornecidos pelo ApresentarPerfilDados.js.
========================================================= */

(function (window) {


"use strict";


/* =====================================================
   ESTADO
   ===================================================== */

let agenda = [];

let inicializado = false;


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    elementos: {

        agendaList: "agendaList"

    }

};


/* =====================================================
   UTILITÁRIOS
   ===================================================== */

function obterUtils() {

    return window.ApresentarPerfilUtils || {};

}


function obterElemento(id) {

    const utils =
        obterUtils();


    if (
        typeof utils.obterElemento === "function"
    ) {

        return utils.obterElemento(id);

    }


    return document.getElementById(id);

}


function escaparHtml(valor) {

    const utils =
        obterUtils();


    if (
        typeof utils.escaparHtml === "function"
    ) {

        return utils.escaparHtml(valor);

    }


    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function converterParaBooleano(valor) {

    const utils =
        obterUtils();


    if (
        typeof utils.converterParaBooleano === "function"
    ) {

        return utils.converterParaBooleano(valor);

    }


    if (
        valor === true ||
        valor === 1 ||
        valor === "1" ||
        valor === "true" ||
        valor === "ativo" ||
        valor === "active"
    ) {

        return true;

    }


    return false;

}


function renderizarIcones() {

    const utils =
        obterUtils();


    if (
        typeof utils.renderizarIcones === "function"
    ) {

        utils.renderizarIcones();

    }

}


/* =====================================================
   NORMALIZAR LISTA
   ===================================================== */

function normalizarLista(
    dados
) {

    let lista =
        dados;


    /*
     * Aceita:
     *
     * array
     * { agenda: [] }
     * { eventos: [] }
     * { lista: [] }
     * { itens: [] }
     * JSON em string
     */

    if (
        typeof lista === "string"
    ) {

        const texto =
            lista.trim();


        if (!texto) {

            return [];

        }


        try {

            const convertido =
                JSON.parse(texto);


            if (
                Array.isArray(convertido)
            ) {

                lista =
                    convertido;

            } else if (
                convertido &&
                typeof convertido === "object"
            ) {

                lista =
                    convertido.agenda ||
                    convertido.eventos ||
                    convertido.lista ||
                    convertido.itens ||
                    [];

            }

        } catch (erro) {

            return [];

        }

    }


    if (
        lista &&
        !Array.isArray(lista) &&
        typeof lista === "object"
    ) {

        lista =
            lista.agenda ||
            lista.eventos ||
            lista.lista ||
            lista.itens ||
            lista.items ||
            [];

    }


    if (!Array.isArray(lista)) {

        lista = [];

    }


    return lista;

}


/* =====================================================
   OBTER PRIMEIRO VALOR
   ===================================================== */

function obterPrimeiroValor(
    objeto,
    campos
) {

    if (
        !objeto ||
        typeof objeto !== "object"
    ) {

        return "";

    }


    for (
        const campo of campos
    ) {

        const valor =
            objeto[campo];


        if (
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
        ) {

            return valor;

        }

    }


    return "";

}


/* =====================================================
   NORMALIZAR DATA
   ===================================================== */

function converterData(
    valor
) {

    if (!valor) {
        return null;
    }


    /*
     * Datas no formato YYYY-MM-DD
     * devem ser tratadas como data local,
     * evitando deslocamento causado pelo UTC.
     */

    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            valor.trim()
        )
    ) {

        const partes =
            valor
                .trim()
                .split("-")
                .map(Number);


        return new Date(
            partes[0],
            partes[1] - 1,
            partes[2]
        );

    }


    const data =
        valor instanceof Date
            ? new Date(valor.getTime())
            : new Date(valor);


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
   DATA ISO
   ===================================================== */

function obterDataISO(
    valor
) {

    if (!valor) {
        return "";
    }


    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            valor.trim()
        )
    ) {

        return valor.trim();

    }


    const data =
        converterData(
            valor
        );


    if (!data) {
        return "";
    }


    const ano =
        data.getFullYear();


    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


/* =====================================================
   FORMATAR DATA
   ===================================================== */

function formatarData(
    valor
) {

    if (!valor) {
        return "";
    }


    const utils =
        obterUtils();


    if (
        typeof utils.formatarData === "function"
    ) {

        return utils.formatarData(
            valor
        );

    }


    const data =
        converterData(
            valor
        );


    if (!data) {
        return "";
    }


    return data.toLocaleDateString(
        "pt-BR"
    );

}


/* =====================================================
   FORMATAR DATA EXTENSA
   ===================================================== */

function formatarDataExtenso(
    valor
) {

    if (!valor) {
        return "";
    }


    const utils =
        obterUtils();


    if (
        typeof utils.formatarDataExtenso === "function"
    ) {

        return utils.formatarDataExtenso(
            valor
        );

    }


    const data =
        converterData(
            valor
        );


    if (!data) {
        return "";
    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =====================================================
   FORMATAR HORÁRIO
   ===================================================== */

function formatarHorario(
    horario
) {

    if (!horario) {
        return "";
    }


    const texto =
        String(horario)
            .trim();


    /*
     * HH:MM:SS
     */

    const match =
        texto.match(
            /^(\d{1,2}):(\d{2})(?::\d{2})?$/
        );


    if (match) {

        return (
            String(
                match[1]
            ).padStart(2, "0") +
            ":" +
            match[2]
        );

    }


    return texto;

}


/* =====================================================
   NORMALIZAR STATUS
   ===================================================== */

function normalizarStatus(
    item,
    dataInicio
) {

    const valor =
        obterPrimeiroValor(
            item,
            [
                "status",
                "situacao",
                "situação",
                "estado",
                "status_evento",
                "statusEvento"
            ]
        );


    if (valor) {

        const texto =
            String(valor)
                .trim()
                .toLowerCase();


        if (
            [
                "cancelado",
                "cancelada",
                "cancelled",
                "canceled"
            ].includes(texto)
        ) {

            return "cancelado";

        }


        if (
            [
                "concluido",
                "concluida",
                "concluído",
                "concluída",
                "finalizado",
                "finalizada",
                "realizado",
                "realizada",
                "completed",
                "done"
            ].includes(texto)
        ) {

            return "concluido";

        }


        if (
            [
                "confirmado",
                "confirmada",
                "confirmed"
            ].includes(texto)
        ) {

            return "confirmado";

        }


        if (
            [
                "pendente",
                "pending"
            ].includes(texto)
        ) {

            return "pendente";

        }


        return String(valor);

    }


    /*
     * Se não houver status cadastrado,
     * calcula pelo dia do evento.
     */

    const data =
        converterData(
            dataInicio
        );


    if (!data) {

        return "agendado";

    }


    const agora =
        new Date();


    const hoje =
        new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate()
        );


    const dataEvento =
        new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );


    if (
        dataEvento < hoje
    ) {

        return "concluido";

    }


    if (
        dataEvento.getTime() ===
        hoje.getTime()
    ) {

        return "hoje";

    }


    return "agendado";

}


/* =====================================================
   NORMALIZAR EVENTO
   ===================================================== */

function normalizarEvento(
    item,
    indice
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;

    }


    const titulo =
        obterPrimeiroValor(
            item,
            [
                "titulo",
                "nome_evento",
                "nomeEvento",
                "evento",
                "nome",
                "descricao_evento",
                "descricaoEvento"
            ]
        );


    const descricao =
        obterPrimeiroValor(
            item,
            [
                "descricao",
                "descricao_evento",
                "descricaoEvento",
                "detalhes",
                "observacao",
                "observações",
                "observacoes"
            ]
        );


    const dataInicio =
        obterPrimeiroValor(
            item,
            [
                "data",
                "data_evento",
                "dataEvento",
                "data_inicio",
                "dataInicio",
                "inicio",
                "start_date",
                "startDate"
            ]
        );


    const dataFim =
        obterPrimeiroValor(
            item,
            [
                "data_fim",
                "dataFim",
                "data_final",
                "dataFinal",
                "fim",
                "end_date",
                "endDate"
            ]
        );


    const horario =
        obterPrimeiroValor(
            item,
            [
                "horario",
                "hora",
                "horario_inicio",
                "horarioInicio",
                "hora_inicio",
                "horaInicio",
                "inicio_hora",
                "start_time",
                "startTime"
            ]
        );


    const horarioFim =
        obterPrimeiroValor(
            item,
            [
                "horario_fim",
                "horarioFim",
                "hora_fim",
                "horaFim",
                "horario_final",
                "end_time",
                "endTime"
            ]
        );


    const local =
        obterPrimeiroValor(
            item,
            [
                "local",
                "local_evento",
                "localEvento",
                "nome_local",
                "nomeLocal",
                "localizacao",
                "localização",
                "endereco",
                "endereço",
                "endereco_evento",
                "enderecoEvento"
            ]
        );


    const cidade =
        obterPrimeiroValor(
            item,
            [
                "cidade",
                "city"
            ]
        );


    const estado =
        obterPrimeiroValor(
            item,
            [
                "estado",
                "uf",
                "state"
            ]
        );


    const tipo =
        obterPrimeiroValor(
            item,
            [
                "tipo",
                "tipo_evento",
                "tipoEvento",
                "categoria",
                "categoria_evento",
                "categoriaEvento"
            ]
        );


    const url =
        obterPrimeiroValor(
            item,
            [
                "url",
                "link",
                "url_evento",
                "urlEvento",
                "link_evento",
                "linkEvento"
            ]
        );


    const dataReferencia =
        dataInicio ||
        dataFim;


    return {

        id:
            item.id ||
            `evento-${indice}`,

        titulo:
            String(
                titulo ||
                "Evento"
            ).trim(),

        descricao:
            String(
                descricao || ""
            ).trim(),

        dataInicio:
            dataInicio,

        dataFim:
            dataFim,

        dataISO:
            obterDataISO(
                dataReferencia
            ),

        horario:
            formatarHorario(
                horario
            ),

        horarioFim:
            formatarHorario(
                horarioFim
            ),

        local:
            String(
                local || ""
            ).trim(),

        cidade:
            String(
                cidade || ""
            ).trim(),

        estado:
            String(
                estado || ""
            ).trim(),

        tipo:
            String(
                tipo || ""
            ).trim(),

        url:
            String(
                url || ""
            ).trim(),

        status:
            normalizarStatus(
                item,
                dataReferencia
            ),

        original:
            item

    };

}


function normalizarAgenda(
    dados
) {

    const lista =
        normalizarLista(
            dados
        );


    return lista
        .map(
            (item, indice) =>
                normalizarEvento(
                    item,
                    indice
                )
        )
        .filter(Boolean)
        .sort(
            compararEventos
        );

}


/* =====================================================
   ORDENAR EVENTOS
   ===================================================== */

function compararEventos(
    a,
    b
) {

    const dataA =
        converterData(
            a?.dataInicio
        );


    const dataB =
        converterData(
            b?.dataInicio
        );


    if (!dataA && !dataB) {
        return 0;
    }


    if (!dataA) {
        return 1;
    }


    if (!dataB) {
        return -1;
    }


    const diferenca =
        dataA.getTime() -
        dataB.getTime();


    if (diferenca !== 0) {

        return diferenca;

    }


    return String(
        a.horario || ""
    ).localeCompare(
        String(
            b.horario || ""
        )
    );

}


/* =====================================================
   TEXTO DE STATUS
   ===================================================== */

function obterTextoStatus(
    status
) {

    const texto =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    const mapa = {

        agendado: "Agendado",

        confirmado: "Confirmado",

        hoje: "Hoje",

        concluido: "Concluído",

        cancelado: "Cancelado",

        pendente: "Pendente"

    };


    return mapa[texto] ||
        status ||
        "Agendado";

}


/* =====================================================
   CLASSE DE STATUS
   ===================================================== */

function obterClasseStatus(
    status
) {

    const texto =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        texto === "cancelado"
    ) {

        return "status-cancelado";

    }


    if (
        texto === "concluido"
    ) {

        return "status-concluido";

    }


    if (
        texto === "hoje"
    ) {

        return "status-hoje";

    }


    if (
        texto === "confirmado"
    ) {

        return "status-confirmado";

    }


    return "status-agendado";

}


/* =====================================================
   LOCAL COMPLETO
   ===================================================== */

function obterLocalCompleto(
    evento
) {

    const partes = [];


    if (evento.local) {

        partes.push(
            evento.local
        );

    }


    const cidadeEstado = [

        evento.cidade,

        evento.estado

    ]
        .filter(Boolean)
        .join(" - ");


    if (cidadeEstado) {

        partes.push(
            cidadeEstado
        );

    }


    return partes.join(
        " • "
    );

}


/* =====================================================
   ESTADO VAZIO
   ===================================================== */

function renderizarEstadoVazio(
    container
) {

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <i data-lucide="calendar-days"></i>

            <strong>
                Nenhum evento na agenda
            </strong>

            <span>
                Os próximos compromissos deste perfil aparecerão aqui.
            </span>

        </div>

    `;


    renderizarIcones();

}


/* =====================================================
   RENDERIZAR AGENDA
   ===================================================== */

function renderizar(
    dados
) {

    agenda =
        normalizarAgenda(
            dados
        );


    const container =
        obterElemento(
            CONFIG.elementos.agendaList
        );


    if (!container) {

        console.warn(
            "ApresentarPerfilAgenda: #agendaList não encontrado."
        );


        return agenda;

    }


    if (!agenda.length) {

        renderizarEstadoVazio(
            container
        );


        return agenda;

    }


    container.innerHTML =
        agenda
            .map(
                (
                    evento,
                    indice
                ) =>
                    criarCardEvento(
                        evento,
                        indice
                    )
            )
            .join("");


    renderizarIcones();


    return agenda;

}


/* =====================================================
   CRIAR CARD DE EVENTO
   ===================================================== */

function criarCardEvento(
    evento,
    indice
) {

    const data =
        converterData(
            evento.dataInicio
        );


    const dia =
        data
            ? String(
                data.getDate()
            ).padStart(2, "0")
            : "--";


    const mes =
        data
            ? data
                .toLocaleDateString(
                    "pt-BR",
                    {
                        month: "short"
                    }
                )
                .replace(".", "")
                .toUpperCase()
            : "---";


    const dataCompleta =
        evento.dataInicio
            ? formatarDataExtenso(
                evento.dataInicio
            )
            : "";


    const horario =
        evento.horario
            ? evento.horario +
                (
                    evento.horarioFim
                        ? ` – ${evento.horarioFim}`
                        : ""
                )
            : "";


    const local =
        obterLocalCompleto(
            evento
        );


    const statusTexto =
        obterTextoStatus(
            evento.status
        );


    const statusClasse =
        obterClasseStatus(
            evento.status
        );


    return `

        <article
            class="agenda-event-card"
            data-agenda-index="${indice}"
            data-event-id="${escaparHtml(evento.id)}"
        >

            <div class="agenda-event-date">

                <strong>
                    ${escaparHtml(dia)}
                </strong>

                <span>
                    ${escaparHtml(mes)}
                </span>

            </div>


            <div class="agenda-event-content">

                <div class="agenda-event-header">

                    <div>

                        <h3>
                            ${escaparHtml(evento.titulo)}
                        </h3>

                        ${
                            dataCompleta
                                ? `
                                    <span class="agenda-event-full-date">
                                        <i data-lucide="calendar-days"></i>
                                        ${escaparHtml(dataCompleta)}
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <span
                        class="agenda-event-status ${escaparHtml(statusClasse)}"
                    >
                        ${escaparHtml(statusTexto)}
                    </span>

                </div>


                ${
                    horario
                        ? `
                            <div class="agenda-event-info">

                                <i data-lucide="clock-3"></i>

                                <span>
                                    ${escaparHtml(horario)}
                                </span>

                            </div>
                          `
                        : ""
                }


                ${
                    local
                        ? `
                            <div class="agenda-event-info">

                                <i data-lucide="map-pin"></i>

                                <span>
                                    ${escaparHtml(local)}
                                </span>

                            </div>
                          `
                        : ""
                }


                ${
                    evento.tipo
                        ? `
                            <div class="agenda-event-info">

                                <i data-lucide="tag"></i>

                                <span>
                                    ${escaparHtml(evento.tipo)}
                                </span>

                            </div>
                          `
                        : ""
                }


                ${
                    evento.descricao
                        ? `
                            <p class="agenda-event-description">
                                ${escaparHtml(evento.descricao)}
                            </p>
                          `
                        : ""
                }


                ${
                    evento.url
                        ? `
                            <a
                                class="agenda-event-link"
                                href="${escaparHtml(evento.url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                            >

                                <i data-lucide="external-link"></i>

                                <span>
                                    Ver evento
                                </span>

                            </a>
                          `
                        : ""
                }

            </div>

        </article>

    `;

}


/* =====================================================
   INICIALIZAR
   ===================================================== */

function inicializar(
    dados = null
) {

    if (dados !== null) {

        renderizar(
            dados
        );

    } else if (
        window.ApresentarPerfilDados &&
        typeof window.ApresentarPerfilDados
            .obterAgenda === "function"
    ) {

        renderizar(
            window.ApresentarPerfilDados
                .obterAgenda()
        );

    } else {

        renderizar([]);

    }


    inicializado = true;


    return agenda;

}


/* =====================================================
   ATUALIZAR
   ===================================================== */

function atualizar(
    dados
) {

    return renderizar(
        dados
    );

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
   OBTER EVENTO POR ID
   ===================================================== */

function obterEventoPorId(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        return null;

    }


    return (
        agenda.find(
            evento =>
                String(evento.id) ===
                String(id)
        ) ||
        null
    );

}


/* =====================================================
   OBTER PRÓXIMOS EVENTOS
   ===================================================== */

function obterProximosEventos(
    quantidade = null
) {

    const agora =
        new Date();


    const eventos =
        agenda.filter(
            evento => {

                const data =
                    converterData(
                        evento.dataInicio
                    );


                if (!data) {
                    return false;
                }


                return (
                    data.getTime() >=
                    agora.getTime()
                );

            }
        );


    if (
        quantidade &&
        Number(quantidade) > 0
    ) {

        return eventos.slice(
            0,
            Number(quantidade)
        );

    }


    return eventos;

}


/* =====================================================
   OBTER EVENTOS POR MÊS
   ===================================================== */

function obterEventosPorMes(
    ano,
    mes
) {

    const numeroAno =
        Number(ano);


    const numeroMes =
        Number(mes);


    if (
        !Number.isFinite(numeroAno) ||
        !Number.isFinite(numeroMes)
    ) {

        return [];

    }


    return agenda.filter(
        evento => {

            const data =
                converterData(
                    evento.dataInicio
                );


            if (!data) {
                return false;
            }


            return (
                data.getFullYear() ===
                numeroAno &&
                data.getMonth() ===
                numeroMes
            );

        }
    );

}


/* =====================================================
   VERIFICAR INICIALIZAÇÃO
   ===================================================== */

function estaInicializado() {

    return inicializado;

}


/* =====================================================
   LIMPAR
   ===================================================== */

function limpar() {

    agenda = [];

    inicializado = false;


    const container =
        obterElemento(
            CONFIG.elementos.agendaList
        );


    if (container) {

        container.innerHTML = "";

    }

}


/* =====================================================
   OBJETO PÚBLICO
   ===================================================== */

const ApresentarPerfilAgenda = {

    inicializar,

    renderizar,

    atualizar,

    obterAgenda,

    obterEventoPorId,

    obterProximosEventos,

    obterEventosPorMes,

    estaInicializado,

    limpar,

    normalizarLista,

    normalizarEvento,

    normalizarAgenda,

    converterData,

    obterDataISO,

    formatarData,

    formatarDataExtenso,

    formatarHorario,

    obterTextoStatus,

    obterClasseStatus,

    obterLocalCompleto

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.ApresentarPerfilAgenda =
    ApresentarPerfilAgenda;


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "ApresentarPerfilAgenda.js carregado."
);


})(window);
