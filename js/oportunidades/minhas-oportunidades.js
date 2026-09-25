
/* =========================================================
   MUSICALWORLD — MINHAS OPORTUNIDADES

   Arquivo:
   js/oportunidades/minhas-oportunidades.js

   Responsabilidades:

   - Identificar o usuário autenticado.
   - Buscar as oportunidades criadas pelo usuário.
   - Buscar a quantidade de interessados de cada oportunidade.
   - Renderizar os cards.
   - Permitir abrir o gerenciamento de uma oportunidade.
   - Controlar os estados de carregamento, erro e vazio.

   Esta página NÃO cria oportunidades.

   A criação continua sendo responsabilidade de:
   criar-oportunidades.html
   ========================================================= */


/* =========================================================
   ESTADO DA PÁGINA
   ========================================================= */

let clienteSupabase = null;

let usuarioAtual = null;

let oportunidades = [];


/* =========================================================
   ELEMENTOS DA INTERFACE
   ========================================================= */

let estadoCarregando = null;

let estadoErro = null;

let mensagemErro = null;

let btnTentarNovamente = null;

let estadoVazio = null;

let listaOportunidades = null;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);


/* =========================================================
   INICIAR PÁGINA
   ========================================================= */

async function iniciar() {

    obterElementos();

    btnTentarNovamente?.addEventListener(
        "click",
        carregarPagina
    );

    await carregarPagina();

}


/* =========================================================
   OBTER ELEMENTOS
   ========================================================= */

function obterElementos() {

    estadoCarregando =
        document.getElementById(
            "estadoCarregando"
        );

    estadoErro =
        document.getElementById(
            "estadoErro"
        );

    mensagemErro =
        document.getElementById(
            "mensagemErro"
        );

    btnTentarNovamente =
        document.getElementById(
            "btnTentarNovamente"
        );

    estadoVazio =
        document.getElementById(
            "estadoVazio"
        );

    listaOportunidades =
        document.getElementById(
            "listaOportunidades"
        );

}


/* =========================================================
   OBTER CLIENTE SUPABASE
   ========================================================= */

function obterClienteSupabase() {

    /*
     * O SDK do Supabase já utiliza o identificador
     * global "supabase".
     *
     * Por isso, nesta página utilizamos o cliente
     * armazenado em "window.supabaseClient", criado
     * pelo arquivo js/core/SupabaseClient.js.
     */

    if (
        window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
    ) {

        return window.supabaseClient;

    }


    if (
        window.MusicalWorldSupabase &&
        typeof window.MusicalWorldSupabase.from === "function"
    ) {

        return window.MusicalWorldSupabase;

    }


    if (
        window.musicalWorldSupabase &&
        typeof window.musicalWorldSupabase.from === "function"
    ) {

        return window.musicalWorldSupabase;

    }


    throw new Error(
        "Cliente Supabase não encontrado."
    );

}


/* =========================================================
   CARREGAR PÁGINA
   ========================================================= */

async function carregarPagina() {

    mostrarCarregando();

    try {

        clienteSupabase =
            obterClienteSupabase();

        await carregarUsuario();

        await carregarOportunidades();

        await carregarQuantidadeInteressados();

        renderizarOportunidades();

    } catch (erro) {

        console.error(
            "MusicalWorld — erro ao carregar minhas oportunidades:",
            erro
        );

        mostrarErro(
            obterMensagemErro(erro)
        );

    }

}


/* =========================================================
   CARREGAR USUÁRIO AUTENTICADO
   ========================================================= */

async function carregarUsuario() {

    const {
        data,
        error
    } = await clienteSupabase.auth.getUser();


    if (error) {

        throw error;

    }


    if (!data?.user) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    usuarioAtual =
        data.user;

}


/* =========================================================
   CARREGAR OPORTUNIDADES
   ========================================================= */

async function carregarOportunidades() {

    const {
        data,
        error
    } = await clienteSupabase
        .from("oportunidades")
        .select(`
            id,
            contratante_id,
            titulo,
            descricao,
            tipo_artista,
            data_evento,
            hora_inicio,
            hora_fim,
            estilos,
            instrumentos,
            valor,
            local,
            prazo_interesse,
            status,
            created_at,
            updated_at
        `)
        .eq(
            "contratante_id",
            usuarioAtual.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        throw error;

    }


    oportunidades =
        Array.isArray(data)
            ? data
            : [];

}


/* =========================================================
   CARREGAR QUANTIDADE DE INTERESSADOS
   ========================================================= */

async function carregarQuantidadeInteressados() {

    if (!oportunidades.length) {

        return;

    }


    const ids =
        oportunidades.map(
            oportunidade =>
                oportunidade.id
        );


    const {
        data,
        error
    } = await clienteSupabase
        .from("oportunidades_interessados")
        .select(
            "oportunidade_id, status"
        )
        .in(
            "oportunidade_id",
            ids
        );


    if (error) {

        throw error;

    }


    const quantidadePorOportunidade =
        {};


    ids.forEach(id => {

        quantidadePorOportunidade[
            String(id)
        ] = 0;

    });


    (data || []).forEach(
        interessado => {

            const oportunidadeId =
                String(
                    interessado.oportunidade_id
                );


            /*
             * Apenas interessados ativos entram
             * na contagem apresentada no card.
             *
             * Registros retirados ou recusados
             * não aparecem como interessados ativos.
             */

            const status =
                normalizarTexto(
                    interessado.status
                );


            if (
                status === "retirado" ||
                status === "recusado"
            ) {

                return;

            }


            if (
                quantidadePorOportunidade[
                    oportunidadeId
                ] !== undefined
            ) {

                quantidadePorOportunidade[
                    oportunidadeId
                ]++;

            }

        }
    );


    oportunidades =
        oportunidades.map(
            oportunidade => ({

                ...oportunidade,

                quantidadeInteressados:
                    quantidadePorOportunidade[
                        String(
                            oportunidade.id
                        )
                    ] || 0

            })
        );

}


/* =========================================================
   RENDERIZAR OPORTUNIDADES
   ========================================================= */

function renderizarOportunidades() {

    esconderTodosOsEstados();


    if (!oportunidades.length) {

        estadoVazio.hidden = false;

        return;

    }


    listaOportunidades.innerHTML =
        oportunidades
            .map(
                oportunidade =>
                    criarCardOportunidade(
                        oportunidade
                    )
            )
            .join("");


    listaOportunidades.hidden = false;

}


/* =========================================================
   CRIAR CARD
   ========================================================= */

function criarCardOportunidade(
    oportunidade
) {

    const titulo =
        escaparHtml(
            oportunidade.titulo ||
            "Oportunidade sem título"
        );


    const tipoArtista =
        escaparHtml(
            oportunidade.tipo_artista ||
            "Artista"
        );


    const dataEvento =
        formatarData(
            oportunidade.data_evento
        );


    const horario =
        formatarHorario(
            oportunidade.hora_inicio,
            oportunidade.hora_fim
        );


    const dataPublicacao =
        formatarDataHoraPublicacao(
            oportunidade.created_at
        );


    const local =
        obterNomeLocal(
            oportunidade.local
        );


    const valor =
        formatarValor(
            oportunidade.valor
        );


    const prazo =
        formatarData(
            oportunidade.prazo_interesse
        );


    const status =
        formatarStatus(
            oportunidade.status
        );


    const quantidade =
        Number(
            oportunidade.quantidadeInteressados || 0
        );


    const textoInteressados =
        quantidade === 1
            ? "1 interessado"
            : `${quantidade} interessados`;


    const url =
        `oportunidade-interessados.html?id=${
            encodeURIComponent(
                oportunidade.id
            )
        }`;


    return `
        <article class="mw-opportunity-card">

            <a
                href="${url}"
                class="mw-card-link"
                aria-label="Gerenciar oportunidade ${titulo}"
            >

                <div class="mw-card-top">

                    <div class="mw-card-title">

                        <h2>
                            ${titulo}
                        </h2>

                        <span class="mw-card-type">
                            ${tipoArtista}
                        </span>

                    </div>

                    <span
                        class="mw-card-status ${status.classe}"
                    >
                        ${status.texto}
                    </span>

                </div>


                <div class="mw-card-info">

                    <div class="mw-info-item">

                        <span class="mw-info-label">
                            Evento
                        </span>

                        <span class="mw-info-value">
                            ${dataEvento}
                        </span>

                    </div>


                    <div class="mw-info-item">

                        <span class="mw-info-label">
                            Horário
                        </span>

                        <span class="mw-info-value">
                            ${horario}
                        </span>

                    </div>


                    <div class="mw-info-item">

                        <span class="mw-info-label">
                            Local
                        </span>

                        <span class="mw-info-value">
                            ${local}
                        </span>

                    </div>


                    <div class="mw-info-item">

                        <span class="mw-info-label">
                            Valor
                        </span>

                        <span class="mw-info-value">
                            ${valor}
                        </span>

                    </div>


                    <div class="mw-info-item">

                        <span class="mw-info-label">
                            Prazo para interesse
                        </span>

                        <span class="mw-info-value">
                            ${prazo}
                        </span>

                    </div>

                </div>


                <!--
                    Informações discretas adicionais.

                    A data de publicação vem de created_at.
                    A quantidade vem da contagem calculada
                    em carregarQuantidadeInteressados().
                -->

                <div class="mw-card-meta">

                    <span class="mw-publication-date">
                        Publicada em ${dataPublicacao}
                    </span>

                    <span class="mw-mobile-interested">
                        ${textoInteressados}
                    </span>

                </div>


                <div class="mw-card-footer">

                    <div class="mw-interested">

                        <span class="mw-interested-count">
                            ${quantidade}
                        </span>

                        <span>
                            ${
                                quantidade === 1
                                    ? "interessado"
                                    : "interessados"
                            }
                        </span>

                    </div>


                    <span class="mw-manage">
                        Gerenciar oportunidade →
                    </span>

                </div>

            </a>

        </article>
    `;

}


/* =========================================================
   OBTER NOME DO LOCAL
   ========================================================= */

function obterNomeLocal(
    local
) {

    if (!local) {

        return "Local não informado";

    }


    /*
     * O campo "local" da oportunidade atualmente
     * está armazenado como JSON.
     *
     * Exemplo:
     *
     * {
     *     "cep": "...",
     *     "bairro": "Setor Marista",
     *     "cidade": "Goiânia",
     *     "estado": "GO",
     *     "numero": "1200",
     *     "endereco": "Avenida Ricardo Paranhos",
     *     "nomeLocal": "@bahrem"
     * }
     *
     * Para o card, damos prioridade ao nome do local.
     */

    let dados = local;


    if (
        typeof local === "string"
    ) {

        try {

            dados =
                JSON.parse(local);

        } catch {

            return escaparHtml(
                local
            );

        }

    }


    if (
        dados &&
        typeof dados === "object"
    ) {

        const nomeLocal =
            dados.nomeLocal ||
            dados.nome ||
            "";


        const cidade =
            dados.cidade ||
            "";


        const estado =
            dados.estado ||
            "";


        if (nomeLocal && cidade && estado) {

            return escaparHtml(
                `${nomeLocal} — ${cidade}/${estado}`
            );

        }


        if (nomeLocal) {

            return escaparHtml(
                nomeLocal
            );

        }


        if (cidade && estado) {

            return escaparHtml(
                `${cidade}/${estado}`
            );

        }


        if (cidade) {

            return escaparHtml(
                cidade
            );

        }

    }


    return "Local não informado";

}


/* =========================================================
   FORMATAR STATUS
   ========================================================= */

function formatarStatus(status) {

    const valor =
        normalizarTexto(
            status
        );


    const mapa = {

        aberta: {
            texto: "Aberta",
            classe: "mw-status-aberta"
        },

        fechada: {
            texto: "Fechada",
            classe: "mw-status-fechada"
        },

        encerrada: {
            texto: "Encerrada",
            classe: "mw-status-encerrada"
        },

        cancelada: {
            texto: "Cancelada",
            classe: "mw-status-cancelada"
        }

    };


    if (mapa[valor]) {

        return mapa[valor];

    }


    return {

        texto:
            status ||
            "Sem status",

        classe:
            "mw-status-default"

    };

}


/* =========================================================
   FORMATAR DATA
   ========================================================= */

function formatarData(data) {

    if (!data) {

        return "Não informada";

    }


    const partes =
        String(data)
            .split("-");


    if (partes.length !== 3) {

        return escaparHtml(
            String(data)
        );

    }


    const ano =
        partes[0];

    const mes =
        partes[1];

    const dia =
        partes[2];


    return `${dia}/${mes}/${ano}`;

}


/* =========================================================
   FORMATAR DATA DE PUBLICAÇÃO
   =========================================================

   O campo created_at do Supabase normalmente chega
   como timestamp ISO.

   Aqui utilizamos somente a data para manter a
   informação discreta no card.
   ========================================================= */

function formatarDataHoraPublicacao(
    data
) {

    if (!data) {

        return "Não informada";

    }


    const dataObjeto =
        new Date(
            data
        );


    if (
        Number.isNaN(
            dataObjeto.getTime()
        )
    ) {

        return escaparHtml(
            String(data)
        );

    }


    const dia =
        String(
            dataObjeto.getDate()
        )
            .padStart(
                2,
                "0"
            );


    const mes =
        String(
            dataObjeto.getMonth() + 1
        )
            .padStart(
                2,
                "0"
            );


    const ano =
        dataObjeto.getFullYear();


    return `${dia}/${mes}/${ano}`;

}


/* =========================================================
   FORMATAR HORÁRIO
   ========================================================= */

function formatarHorario(
    inicio,
    fim
) {

    const horaInicio =
        formatarHora(
            inicio
        );


    const horaFim =
        formatarHora(
            fim
        );


    if (
        horaInicio !== "Não informado" &&
        horaFim !== "Não informado"
    ) {

        return `${horaInicio} às ${horaFim}`;

    }


    if (
        horaInicio !== "Não informado"
    ) {

        return horaInicio;

    }


    if (
        horaFim !== "Não informado"
    ) {

        return horaFim;

    }


    return "Não informado";

}


/* =========================================================
   FORMATAR HORA
   ========================================================= */

function formatarHora(
    hora
) {

    if (!hora) {

        return "Não informado";

    }


    const texto =
        String(hora);


    const correspondencia =
        texto.match(
            /^(\d{2}):(\d{2})/
        );


    if (!correspondencia) {

        return escaparHtml(
            texto
        );

    }


    return `${correspondencia[1]}:${correspondencia[2]}`;

}


/* =========================================================
   FORMATAR VALOR
   ========================================================= */

function formatarValor(
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {

        return "A combinar";

    }


    const numero =
        Number(valor);


    if (
        Number.isNaN(numero)
    ) {

        return escaparHtml(
            String(valor)
        );

    }


    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* =========================================================
   NORMALIZAR TEXTO
   ========================================================= */

function normalizarTexto(
    valor
) {

    return String(
        valor || ""
    )
        .trim()
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escaparHtml(
    valor
) {

    return String(
        valor ?? ""
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


/* =========================================================
   ESTADO DE CARREGAMENTO
   ========================================================= */

function mostrarCarregando() {

    esconderTodosOsEstados();

    estadoCarregando.hidden = false;

}


/* =========================================================
   ESTADO DE ERRO
   ========================================================= */

function mostrarErro(
    mensagem
) {

    esconderTodosOsEstados();

    mensagemErro.textContent =
        mensagem ||
        "Ocorreu um erro ao carregar as oportunidades.";

    estadoErro.hidden = false;

}


/* =========================================================
   ESCONDER ESTADOS
   ========================================================= */

function esconderTodosOsEstados() {

    estadoCarregando.hidden = true;

    estadoErro.hidden = true;

    estadoVazio.hidden = true;

    listaOportunidades.hidden = true;

}


/* =========================================================
   MENSAGEM DE ERRO
   ========================================================= */

function obterMensagemErro(
    erro
) {

    if (!erro) {

        return "Ocorreu um erro inesperado.";

    }


    if (
        erro.message ===
        "Usuário não autenticado."
    ) {

        return "Sua sessão não está autenticada. Faça login novamente.";

    }


    if (
        erro.message ===
        "Cliente Supabase não encontrado."
    ) {

        return "Não foi possível conectar ao Supabase.";

    }


    return (
        erro.message ||
        "Não foi possível carregar suas oportunidades."
    );

}

