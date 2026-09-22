(function (window) {

    "use strict";


    /* =========================================================
       MUSICALWORLD — PÁGINA DE NOTIFICAÇÕES

       Arquivo:
       js/notificacoes.js

       Responsabilidades:

       - Carregar notificações do usuário.
       - Filtrar notificações.
       - Agrupar notificações por período.
       - Agrupar notificações da mesma pessoa no mesmo dia.
       - Permitir expandir/recolher grupos.
       - Exibir remetente, foto ou iniciais.
       - Marcar notificações como lidas.
       - Marcar todas como lidas.
       - Ocultar notificações somente localmente.
       - Manter as exclusões no navegador.
       - Receber novas notificações via Supabase Realtime.
       - Controlar os estados da interface.
       - Encaminhar o usuário para a página correta.

       IMPORTANTE:

       A exclusão visual NÃO executa DELETE no Supabase.

       O ID é salvo no localStorage, vinculado ao usuário
       autenticado neste navegador/dispositivo.
       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
    ========================================================= */

    const CONFIG = {

        tabela: "notificacoes",

        tabelaUsuarios: "usuarios",

        limiteInicial: 100,

        paginaAnterior: "index.html",

        imagemSistema:
            "img/logo-musicalworld.svg",

        chaveExclusao:
            "musicalworld_notificacoes_excluidas",

        chaveGruposExpandidos:
            "musicalworld_notificacoes_grupos_expandidos",

        diasSemana:
            7

    };


    /* =========================================================
       ESTADO
    ========================================================= */

    const estado = {

        inicializado: false,

        usuarioId: null,

        notificacoes: [],

        remetentes: new Map(),

        canalRealtime: null,

        carregando: false,

        filtro: "todas",

        excluidas: new Set(),

        gruposExpandidos: new Set()

    };


    /* =========================================================
       SUPABASE
    ========================================================= */

    function obterSupabase() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            return window.supabaseClient;

        }


        if (
            window.SupabaseClient &&
            typeof window.SupabaseClient.getClient === "function"
        ) {

            return window.SupabaseClient.getClient();

        }


        if (
            window.SupabaseClient &&
            window.SupabaseClient.client
        ) {

            return window.SupabaseClient.client;

        }


        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    /* =========================================================
       ELEMENTOS
    ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    function obterContainer() {

        return (
            obterElemento("listaNotificacoes") ||
            document.querySelector(".lista-notificacoes") ||
            document.querySelector("[data-lista-notificacoes]")
        );

    }


    /* =========================================================
       USUÁRIO ATUAL

       A ordem de tentativa é:

       1. Sessao.usuarioAtual()
       2. Supabase getSession()
       3. Supabase getUser()

       Isso reduz os problemas causados pela restauração
       assíncrona da sessão.
    ========================================================= */

    async function obterUsuarioAtual() {

        if (
            window.Sessao &&
            typeof window.Sessao.usuarioAtual === "function"
        ) {

            try {

                const usuario =
                    await window.Sessao.usuarioAtual();

                if (usuario?.id) {

                    return usuario;

                }

            } catch (erro) {

                console.warn(
                    "MusicalWorldNotificacoes: Sessao.usuarioAtual falhou.",
                    erro
                );

            }

        }


        const supabase =
            obterSupabase();


        try {

            const {
                data,
                error
            } = await supabase.auth.getSession();


            if (
                !error &&
                data?.session?.user?.id
            ) {

                return data.session.user;

            }

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: getSession falhou.",
                erro
            );

        }


        try {

            const {
                data,
                error
            } = await supabase.auth.getUser();


            if (
                !error &&
                data?.user?.id
            ) {

                return data.user;

            }

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: getUser falhou.",
                erro
            );

        }


        return null;

    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escaparHtml(valor) {

        const div =
            document.createElement("div");


        div.textContent =
            valor === null ||
            valor === undefined
                ? ""
                : String(valor);


        return div.innerHTML;

    }


    /* =========================================================
       EXCLUSÕES LOCAIS
    ========================================================= */

    function obterChaveExclusao() {

        if (!estado.usuarioId) {

            return null;

        }


        return (
            `${CONFIG.chaveExclusao}_${estado.usuarioId}`
        );

    }


    function carregarExclusoesLocais() {

        estado.excluidas =
            new Set();


        const chave =
            obterChaveExclusao();


        if (!chave) {

            return;

        }


        try {

            const armazenadas =
                localStorage.getItem(chave);


            if (!armazenadas) {

                return;

            }


            const lista =
                JSON.parse(armazenadas);


            if (Array.isArray(lista)) {

                lista.forEach(id => {

                    if (
                        id !== null &&
                        id !== undefined
                    ) {

                        estado.excluidas.add(
                            String(id)
                        );

                    }

                });

            }

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: erro ao carregar exclusões locais.",
                erro
            );

        }

    }


    function salvarExclusoesLocais() {

        const chave =
            obterChaveExclusao();


        if (!chave) {

            return;

        }


        try {

            localStorage.setItem(
                chave,
                JSON.stringify([
                    ...estado.excluidas
                ])
            );

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: erro ao salvar exclusões locais.",
                erro
            );

        }

    }


    function notificacaoFoiExcluida(notificacao) {

        if (!notificacao?.id) {

            return false;

        }


        return estado.excluidas.has(
            String(notificacao.id)
        );

    }


    function excluirNotificacaoLocal(notificationId) {

        if (
            notificationId === null ||
            notificationId === undefined ||
            notificationId === ""
        ) {

            return;

        }


        estado.excluidas.add(
            String(notificationId)
        );


        salvarExclusoesLocais();


        renderizarNotificacoes();

    }


    /* =========================================================
       GRUPOS EXPANDIDOS

       O estado de expansão também fica somente no navegador.

       Isso não altera o banco.

       A chave é vinculada ao usuário para evitar que a interface
       de um usuário interfira na de outro.
    ========================================================= */

    function obterChaveGruposExpandidos() {

        if (!estado.usuarioId) {

            return null;

        }


        return (
            `${CONFIG.chaveGruposExpandidos}_${estado.usuarioId}`
        );

    }


    function carregarGruposExpandidos() {

        estado.gruposExpandidos =
            new Set();


        const chave =
            obterChaveGruposExpandidos();


        if (!chave) {

            return;

        }


        try {

            const armazenados =
                localStorage.getItem(chave);


            if (!armazenados) {

                return;

            }


            const lista =
                JSON.parse(armazenados);


            if (Array.isArray(lista)) {

                lista.forEach(chaveGrupo => {

                    if (
                        chaveGrupo !== null &&
                        chaveGrupo !== undefined
                    ) {

                        estado.gruposExpandidos.add(
                            String(chaveGrupo)
                        );

                    }

                });

            }

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: erro ao carregar grupos expandidos.",
                erro
            );

        }

    }


    function salvarGruposExpandidos() {

        const chave =
            obterChaveGruposExpandidos();


        if (!chave) {

            return;

        }


        try {

            localStorage.setItem(
                chave,
                JSON.stringify([
                    ...estado.gruposExpandidos
                ])
            );

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: erro ao salvar grupos expandidos.",
                erro
            );

        }

    }


    function grupoEstaExpandido(chave) {

        return estado.gruposExpandidos.has(
            String(chave)
        );

    }


    function alternarGrupo(chave) {

        const chaveString =
            String(chave);


        if (
            grupoEstaExpandido(
                chaveString
            )
        ) {

            estado.gruposExpandidos.delete(
                chaveString
            );

        } else {

            estado.gruposExpandidos.add(
                chaveString
            );

        }


        salvarGruposExpandidos();


        renderizarNotificacoes();

    }


    /* =========================================================
       ESTADOS DA INTERFACE
    ========================================================= */

    function ocultarTodosEstados() {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");


        if (carregando) {

            carregando.hidden = true;

        }


        if (vazio) {

            vazio.hidden = true;

        }


        if (erro) {

            erro.hidden = true;

        }

    }


    function mostrarEstadoCarregando() {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");


        if (carregando) {

            carregando.hidden = false;

        }


        if (vazio) {

            vazio.hidden = true;

        }


        if (erro) {

            erro.hidden = true;

        }

    }


    function mostrarEstadoVazio() {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");


        if (carregando) {

            carregando.hidden = true;

        }


        if (vazio) {

            vazio.hidden = false;

        }


        if (erro) {

            erro.hidden = true;

        }

    }


    function mostrarEstadoErro(mensagem) {

        const carregando =
            obterElemento("estadoCarregando");

        const vazio =
            obterElemento("estadoVazio");

        const erro =
            obterElemento("estadoErro");

        const mensagemErro =
            obterElemento("mensagemErro");


        if (carregando) {

            carregando.hidden = true;

        }


        if (vazio) {

            vazio.hidden = true;

        }


        if (erro) {

            erro.hidden = false;

        }


        if (mensagemErro) {

            mensagemErro.textContent =
                mensagem ||
                "Ocorreu um problema ao carregar suas notificações.";

        }

    }


    /* =========================================================
       FILTROS
    ========================================================= */

    function criarFiltros() {

        const container =
            obterContainer();


        if (!container) {

            return;

        }


        let filtros =
            obterElemento("filtrosNotificacoes");


        if (!filtros) {

            filtros =
                document.createElement("div");


            filtros.id =
                "filtrosNotificacoes";


            filtros.className =
                "filtros-notificacoes";


            filtros.setAttribute(
                "role",
                "toolbar"
            );


            filtros.setAttribute(
                "aria-label",
                "Filtrar notificações"
            );


            filtros.innerHTML = `

                <button
                    type="button"
                    class="filtro-notificacao ativo"
                    data-filtro-notificacao="todas"
                    aria-pressed="true"
                >
                    Todas
                </button>

                <button
                    type="button"
                    class="filtro-notificacao"
                    data-filtro-notificacao="nao-lidas"
                    aria-pressed="false"
                >
                    Não lidas
                </button>

                <button
                    type="button"
                    class="filtro-notificacao"
                    data-filtro-notificacao="lidas"
                    aria-pressed="false"
                >
                    Lidas
                </button>

            `;


            container.parentNode.insertBefore(
                filtros,
                container
            );

        }


        filtros
            .querySelectorAll(
                "[data-filtro-notificacao]"
            )
            .forEach(botao => {

                if (
                    botao.dataset
                        .notificacoesConfigurado ===
                    "true"
                ) {

                    return;

                }


                botao.dataset
                    .notificacoesConfigurado =
                    "true";


                botao.addEventListener(
                    "click",
                    function () {

                        const filtro =
                            botao.dataset
                                .filtroNotificacao;


                        if (
                            ![
                                "todas",
                                "nao-lidas",
                                "lidas"
                            ].includes(filtro)
                        ) {

                            return;

                        }


                        estado.filtro =
                            filtro;


                        atualizarVisualFiltros();


                        renderizarNotificacoes();

                    }
                );

            });

    }


    function atualizarVisualFiltros() {

        document
            .querySelectorAll(
                "[data-filtro-notificacao]"
            )
            .forEach(botao => {

                const ativo =
                    botao.dataset
                        .filtroNotificacao ===
                    estado.filtro;


                botao.classList.toggle(
                    "ativo",
                    ativo
                );


                botao.setAttribute(
                    "aria-pressed",
                    ativo
                        ? "true"
                        : "false"
                );

            });

    }


    function obterNotificacoesVisiveis() {

        return estado.notificacoes.filter(
            notificacao => {

                if (
                    notificacaoFoiExcluida(
                        notificacao
                    )
                ) {

                    return false;

                }


                if (
                    estado.filtro ===
                    "nao-lidas"
                ) {

                    return !notificacao.lida;

                }


                if (
                    estado.filtro ===
                    "lidas"
                ) {

                    return !!notificacao.lida;

                }


                return true;

            }
        );

    }


    /* =========================================================
       CARREGAR NOTIFICAÇÕES
    ========================================================= */

    async function carregarNotificacoes() {

        const supabase =
            obterSupabase();


        if (!estado.usuarioId) {

            return;

        }


        const {
            data,
            error
        } = await supabase
            .from(CONFIG.tabela)
            .select(
                [
                    "id",
                    "usuario_id",
                    "remetente_id",
                    "tipo",
                    "titulo",
                    "mensagem",
                    "referencia_id",
                    "referencia_tipo",
                    "lida",
                    "created_at"
                ].join(",")
            )
            .eq(
                "usuario_id",
                estado.usuarioId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(
                CONFIG.limiteInicial
            );


        if (error) {

            throw error;

        }


        estado.notificacoes =
            Array.isArray(data)
                ? data
                : [];


        estado.notificacoes.sort(
            (a, b) => {

                const dataA =
                    new Date(
                        a.created_at || 0
                    ).getTime();


                const dataB =
                    new Date(
                        b.created_at || 0
                    ).getTime();


                return dataB - dataA;

            }
        );


        await carregarRemetentes();


        limparGruposExpandidosInvalidos();


        renderizarNotificacoes();

    }


    /* =========================================================
       REMETENTES
    ========================================================= */

    async function carregarRemetentes() {

        const ids = [
            ...new Set(
                estado.notificacoes
                    .map(
                        notificacao =>
                            notificacao.remetente_id
                    )
                    .filter(Boolean)
            )
        ];


        if (!ids.length) {

            return;

        }


        const supabase =
            obterSupabase();


        const {
            data,
            error
        } = await supabase
            .from(
                CONFIG.tabelaUsuarios
            )
            .select(
                "id,nome,foto_url"
            )
            .in(
                "id",
                ids
            );


        if (error) {

            console.warn(
                "MusicalWorldNotificacoes: não foi possível carregar remetentes.",
                error
            );

            return;

        }


        (data || []).forEach(
            usuario => {

                if (usuario?.id) {

                    estado.remetentes.set(
                        usuario.id,
                        usuario
                    );

                }

            }
        );

    }


    /* =========================================================
       DATAS
    ========================================================= */

    function obterDataValida(data) {

        if (!data) {

            return null;

        }


        const valor =
            new Date(data);


        if (
            Number.isNaN(
                valor.getTime()
            )
        ) {

            return null;

        }


        return valor;

    }


    function inicioDoDia(data) {

        const valor =
            obterDataValida(data);


        if (!valor) {

            return null;

        }


        valor.setHours(
            0,
            0,
            0,
            0
        );


        return valor;

    }


    function mesmaData(primeiro, segundo) {

        if (
            !primeiro ||
            !segundo
        ) {

            return false;

        }


        return (
            primeiro.getFullYear() ===
                segundo.getFullYear() &&

            primeiro.getMonth() ===
                segundo.getMonth() &&

            primeiro.getDate() ===
                segundo.getDate()
        );

    }


    function formatarHorario(data) {

        const valor =
            obterDataValida(data);


        if (!valor) {

            return "";

        }


        return valor.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function formatarDataCompleta(data) {

        const valor =
            obterDataValida(data);


        if (!valor) {

            return "";

        }


        return valor.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    function formatarData(data) {

        const valor =
            obterDataValida(data);


        if (!valor) {

            return "";

        }


        const hoje =
            new Date();


        const ontem =
            new Date();


        ontem.setDate(
            ontem.getDate() - 1
        );


        if (
            mesmaData(
                valor,
                hoje
            )
        ) {

            return (
                `Hoje, ${formatarHorario(data)}`
            );

        }


        if (
            mesmaData(
                valor,
                ontem
            )
        ) {

            return (
                `Ontem, ${formatarHorario(data)}`
            );

        }


        return (
            `${formatarDataCompleta(data)}, ${formatarHorario(data)}`
        );

    }


    function diferencaEmDias(primeira, segunda) {

        const inicioPrimeira =
            inicioDoDia(primeira);

        const inicioSegunda =
            inicioDoDia(segunda);


        if (
            !inicioPrimeira ||
            !inicioSegunda
        ) {

            return null;

        }


        const msPorDia =
            1000 *
            60 *
            60 *
            24;


        return Math.floor(
            (
                inicioPrimeira.getTime() -
                inicioSegunda.getTime()
            ) /
            msPorDia
        );

    }


    function obterSegundaFeira(data) {

        const valor =
            inicioDoDia(data);


        if (!valor) {

            return null;

        }


        const diaSemana =
            valor.getDay();


        const distancia =
            diaSemana === 0
                ? 6
                : diaSemana - 1;


        valor.setDate(
            valor.getDate() -
            distancia
        );


        return valor;

    }


    function formatarGrupoSemana(data) {

        const inicio =
            obterSegundaFeira(data);


        if (!inicio) {

            return "Semana anterior";

        }


        const fim =
            new Date(inicio);


        fim.setDate(
            fim.getDate() + 6
        );


        const inicioTexto =
            inicio.toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit"
                }
            );


        const fimTexto =
            fim.toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );


        return (
            `Semana de ${inicioTexto} a ${fimTexto}`
        );

    }


    function obterGrupoData(data) {

        const valor =
            obterDataValida(data);


        if (!valor) {

            return {

                chave: "sem-data",

                titulo: "Sem data"

            };

        }


        const hoje =
            new Date();


        const ontem =
            new Date();


        ontem.setDate(
            ontem.getDate() - 1
        );


        if (
            mesmaData(
                valor,
                hoje
            )
        ) {

            return {

                chave: "hoje",

                titulo: "Hoje"

            };

        }


        if (
            mesmaData(
                valor,
                ontem
            )
        ) {

            return {

                chave: "ontem",

                titulo: "Ontem"

            };

        }


        const dias =
            diferencaEmDias(
                hoje,
                valor
            );


        if (
            dias !== null &&
            dias >= 0 &&
            dias < CONFIG.diasSemana
        ) {

            return {

                chave: "esta-semana",

                titulo: "Esta semana"

            };

        }


        const segunda =
            obterSegundaFeira(valor);


        if (!segunda) {

            return {

                chave: "sem-data",

                titulo: "Sem data"

            };

        }


        return {

            chave:
                `semana-${segunda.getFullYear()}-${segunda.getMonth()}-${segunda.getDate()}`,

            titulo:
                formatarGrupoSemana(valor)

        };

    }


    /* =========================================================
       CHAVE DA DATA

       Usada para diferenciar notificações da mesma pessoa
       em dias diferentes.

       Exemplo:

       5_2026-09-22
       5_2026-09-21

       São dois grupos diferentes.
    ========================================================= */

    function obterChaveDataNotificacao(data) {

        const valor =
            obterDataValida(data);


        if (!valor) {

            return "sem-data";

        }


        const ano =
            valor.getFullYear();


        const mes =
            String(
                valor.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                valor.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            `${ano}-${mes}-${dia}`
        );

    }


    /* =========================================================
       AGRUPAMENTO POR DATA
    ========================================================= */

    function agruparNotificacoesPorData(notificacoes) {

        const grupos =
            new Map();


        notificacoes.forEach(
            notificacao => {

                const grupo =
                    obterGrupoData(
                        notificacao.created_at
                    );


                if (
                    !grupos.has(
                        grupo.chave
                    )
                ) {

                    grupos.set(
                        grupo.chave,
                        {
                            chave:
                                grupo.chave,

                            titulo:
                                grupo.titulo,

                            notificacoes:
                                []
                        }
                    );

                }


                grupos
                    .get(grupo.chave)
                    .notificacoes
                    .push(
                        notificacao
                    );

            }
        );


        return [
            ...grupos.values()
        ];

    }


    /* =========================================================
       AGRUPAMENTO POR REMETENTE + DIA

       IMPORTANTE:

       O agrupamento acontece SOMENTE dentro do grupo de
       período correspondente.

       A chave também contém:

       - remetente
       - data do calendário

       Portanto:

       João + hoje
       João + ontem

       nunca serão o mesmo grupo.
    ========================================================= */

    function agruparPorRemetenteEData(notificacoes) {

        const grupos =
            new Map();


        notificacoes.forEach(
            notificacao => {

                const remetenteId =
                    notificacao.remetente_id
                        ? String(
                            notificacao.remetente_id
                        )
                        : "sistema";


                const data =
                    obterChaveDataNotificacao(
                        notificacao.created_at
                    );


                const chave =
                    `${remetenteId}_${data}`;


                if (
                    !grupos.has(chave)
                ) {

                    grupos.set(
                        chave,
                        {
                            chave,

                            remetenteId,

                            data,

                            notificacoes:
                                []
                        }
                    );

                }


                grupos
                    .get(chave)
                    .notificacoes
                    .push(
                        notificacao
                    );

            }
        );


        return [
            ...grupos.values()
        ];

    }


    /* =========================================================
       LIMPAR GRUPOS EXPANDIDOS INVÁLIDOS

       Quando uma notificação é excluída ou quando os dados
       são recarregados, alguns grupos podem deixar de existir.

       Removemos essas chaves para não acumular lixo no
       localStorage.
    ========================================================= */

    function limparGruposExpandidosInvalidos() {

        const notificacoes =
            obterNotificacoesVisiveis();


        const gruposData =
            agruparNotificacoesPorData(
                notificacoes
            );


        const chavesValidas =
            new Set();


        gruposData.forEach(
            grupoData => {

                const subgrupos =
                    agruparPorRemetenteEData(
                        grupoData.notificacoes
                    );


                subgrupos.forEach(
                    subgrupo => {

                        if (
                            subgrupo.notificacoes.length > 1
                        ) {

                            chavesValidas.add(
                                subgrupo.chave
                            );

                        }

                    }
                );

            }
        );


        estado.gruposExpandidos =
            new Set(
                [
                    ...estado.gruposExpandidos
                ].filter(
                    chave =>
                        chavesValidas.has(
                            chave
                        )
                )
            );


        salvarGruposExpandidos();

    }


    /* =========================================================
       ÍCONES
    ========================================================= */

    function obterIcone(tipo) {

        switch (tipo) {

            case "mensagem":

            case "nova_mensagem":

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <path
                            d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.7 9.7 0 0 1-4-.8L3 21l1.8-4.2A8.4 8.4 0 0 1 3 11.5a8.38 8.38 0 0 1 9-8.5 8.38 8.38 0 0 1 9 8.5Z"
                        ></path>

                    </svg>

                `;


            case "contratacao":

            case "nova_contratacao":

            case "solicitacao_contratacao":

            case "contratacao_aceita":

            case "contratacao_recusada":

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="17"
                            rx="2"
                        ></rect>

                        <path d="M16 2v4"></path>

                        <path d="M8 2v4"></path>

                        <path d="M3 10h18"></path>

                    </svg>

                `;


            case "pagamento":

            case "pagamento_liberado":

            case "pagamento_confirmado":

            case "pagamento_aprovado":

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <rect
                            x="2.5"
                            y="5"
                            width="19"
                            height="14"
                            rx="2"
                        ></rect>

                        <path d="M2.5 10h19"></path>

                        <path d="M7 15h4"></path>

                    </svg>

                `;


            default:

                return `

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                    >

                        <path
                            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                        ></path>

                        <path
                            d="M10 21h4"
                        ></path>

                    </svg>

                `;

        }

    }


    /* =========================================================
       TÍTULO
    ========================================================= */

    function obterTituloPadrao(notificacao) {

        if (
            notificacao?.titulo &&
            String(
                notificacao.titulo
            ).trim()
        ) {

            return String(
                notificacao.titulo
            ).trim();

        }


        switch (
            notificacao?.tipo
        ) {

            case "mensagem":

            case "nova_mensagem":

                return "Nova mensagem";


            case "contratacao":

            case "nova_contratacao":

            case "solicitacao_contratacao":

                return "Nova solicitação";


            case "contratacao_aceita":

                return "Contratação aceita";


            case "contratacao_recusada":

                return "Contratação recusada";


            case "pagamento_liberado":

                return "Pagamento liberado";


            case "pagamento_confirmado":

                return "Pagamento confirmado";


            case "pagamento_aprovado":

                return "Pagamento aprovado";


            case "pagamento":

                return "Atualização de pagamento";


            default:

                return "Nova notificação";

        }

    }


    /* =========================================================
       URL
    ========================================================= */

    function obterUrlNotificacao(notificacao) {

        if (
            !notificacao?.referencia_id
        ) {

            return null;

        }


        const tipo =
            notificacao.tipo;


        if (
            tipo === "mensagem" ||
            tipo === "nova_mensagem"
        ) {

            return (
                `chat.html?id=${encodeURIComponent(
                    notificacao.referencia_id
                )}`
            );

        }


        if (
            tipo === "contratacao" ||
            tipo === "nova_contratacao" ||
            tipo === "solicitacao_contratacao" ||
            tipo === "contratacao_aceita" ||
            tipo === "contratacao_recusada"
        ) {

            return (
                `contratacoes.html?id=${encodeURIComponent(
                    notificacao.referencia_id
                )}`
            );

        }


        return null;

    }


    /* =========================================================
       REMETENTE
    ========================================================= */

    function obterRemetente(notificacao) {

        if (
            !notificacao?.remetente_id
        ) {

            return {

                nome: "MusicalWorld",

                foto:
                    CONFIG.imagemSistema,

                sistema: true

            };

        }


        const remetente =
            estado.remetentes.get(
                notificacao.remetente_id
            );


        if (!remetente) {

            return {

                nome: "Usuário",

                foto: "",

                sistema: false

            };

        }


        return {

            nome:
                remetente.nome ||
                "Usuário",

            foto:
                remetente.foto_url ||
                "",

            sistema: false

        };

    }


    /* =========================================================
       INICIAIS
    ========================================================= */

    function obterIniciais(nome) {

        if (
            !nome ||
            typeof nome !== "string"
        ) {

            return "?";

        }


        const palavras =
            nome
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!palavras.length) {

            return "?";

        }


        if (
            palavras.length === 1
        ) {

            return palavras[0]
                .charAt(0)
                .toUpperCase();

        }


        const ignoradas =
            new Set([
                "da",
                "das",
                "de",
                "do",
                "dos",
                "e"
            ]);


        const validas =
            palavras.filter(
                palavra =>
                    !ignoradas.has(
                        palavra.toLowerCase()
                    )
            );


        const base =
            validas.length
                ? validas
                : palavras;


        return (
            base[0]
                .charAt(0)
                .toUpperCase() +

            base[base.length - 1]
                .charAt(0)
                .toUpperCase()
        );

    }


    /* =========================================================
       AVATAR DA NOTIFICAÇÃO
    ========================================================= */

    function renderizarAvatar(remetente) {

        if (remetente?.sistema) {

            return `

                <div
                    class="notificacao-avatar
                           notificacao-avatar-fallback
                           notificacao-avatar-sistema"
                    aria-label="MusicalWorld"
                >

                    ${obterIcone("sistema")}

                </div>

            `;

        }


        const nome =
            remetente?.nome ||
            "Usuário";


        const foto =
            typeof remetente?.foto === "string"
                ? remetente.foto.trim()
                : "";


        const iniciais =
            obterIniciais(nome);


        if (!foto) {

            return `

                <div
                    class="notificacao-avatar
                           notificacao-avatar-fallback
                           notificacao-avatar-iniciais"
                    aria-label="${escaparHtml(nome)}"
                >

                    ${escaparHtml(iniciais)}

                </div>

            `;

        }


        return `

            <div
                class="notificacao-avatar-container"
                aria-label="${escaparHtml(nome)}"
            >

                <img
                    class="notificacao-avatar notificacao-avatar-foto"
                    src="${escaparHtml(foto)}"
                    alt="${escaparHtml(nome)}"
                    loading="lazy"
                    decoding="async"
                    onerror="
                        this.hidden = true;
                        const fallback = this.parentElement.querySelector('.notificacao-avatar-iniciais');
                        if (fallback) {
                            fallback.hidden = false;
                        }
                    "
                >

                <div
                    class="notificacao-avatar
                           notificacao-avatar-fallback
                           notificacao-avatar-iniciais"
                    aria-label="${escaparHtml(nome)}"
                    hidden
                >

                    ${escaparHtml(iniciais)}

                </div>

            </div>

        `;

    }


    /* =========================================================
       HTML DE UMA NOTIFICAÇÃO
    ========================================================= */

    function criarHtmlNotificacao(notificacao) {

        const remetente =
            obterRemetente(
                notificacao
            );


        const url =
            obterUrlNotificacao(
                notificacao
            );


        const titulo =
            obterTituloPadrao(
                notificacao
            );


        const mensagem =
            notificacao?.mensagem || "";


        const data =
            formatarData(
                notificacao?.created_at
            );


        const classes = [
            "notificacao-item"
        ];


        if (
            !notificacao.lida
        ) {

            classes.push(
                "nao-lida"
            );

        }


        if (url) {

            classes.push(
                "clicavel"
            );

        }


        const id =
            String(
                notificacao.id
            );


        const atributoUrl =
            url
                ? `data-url="${escaparHtml(url)}"`
                : "";


        return `

            <article
                class="${classes.join(" ")}"
                data-notificacao-id="${escaparHtml(id)}"
                ${atributoUrl}
                role="${url ? "button" : "article"}"
                tabindex="${url ? "0" : "-1"}"
            >

                <div class="notificacao-avatar-wrapper">

                    ${renderizarAvatar(remetente)}

                </div>


                <div class="notificacao-conteudo">

                    <div class="notificacao-cabecalho">

                        <strong class="notificacao-titulo">
                            ${escaparHtml(titulo)}
                        </strong>

                        <time
                            class="notificacao-data"
                            datetime="${escaparHtml(
                                notificacao.created_at || ""
                            )}"
                        >
                            ${escaparHtml(data)}
                        </time>

                    </div>


                    <p class="notificacao-mensagem">

                        ${escaparHtml(mensagem)}

                    </p>


                    ${
                        !notificacao.lida
                            ? `

                                <span
                                    class="notificacao-indicador"
                                    aria-label="Não lida"
                                ></span>

                            `
                            : ""
                    }

                </div>


                <div class="notificacao-acoes">

                    <div
                        class="notificacao-icone-tipo"
                        aria-hidden="true"
                    >

                        ${obterIcone(notificacao.tipo)}

                    </div>


                    <button
                        type="button"
                        class="btn-excluir-notificacao"
                        data-excluir-notificacao="${escaparHtml(id)}"
                        aria-label="Excluir notificação"
                        title="Excluir notificação"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            focusable="false"
                        >

                            <path d="M3 6h18"></path>

                            <path d="M8 6V4h8v2"></path>

                            <path d="M19 6l-1 14H6L5 6"></path>

                            <path d="M10 11v5"></path>

                            <path d="M14 11v5"></path>

                        </svg>

                    </button>

                </div>

            </article>

        `;

    }


    /* =========================================================
       NOME DO GRUPO
    ========================================================= */

    function obterNomeGrupoRemetente(grupo) {

        const primeira =
            grupo?.notificacoes?.[0];


        if (!primeira) {

            return "Usuário";

        }


        const remetente =
            obterRemetente(
                primeira
            );


        return (
            remetente.nome ||
            "Usuário"
        );

    }


    /* =========================================================
       HTML DO GRUPO DE REMETENTE

       Somente grupos com 2 ou mais notificações chegam aqui.

       Grupos com apenas uma notificação são renderizados
       diretamente como card normal.
    ========================================================= */

    function criarHtmlGrupoRemetente(grupo) {

        const quantidade =
            grupo.notificacoes.length;


        const expandido =
            grupoEstaExpandido(
                grupo.chave
            );


        const nome =
            obterNomeGrupoRemetente(
                grupo
            );


        const naoLidas =
            grupo.notificacoes.filter(
                notificacao =>
                    !notificacao.lida
            ).length;


        const classeGrupo =
            expandido
                ? "notificacao-grupo-remetente expandido"
                : "notificacao-grupo-remetente";


        const textoQuantidade =
            quantidade === 1
                ? "1 notificação"
                : `${quantidade} notificações`;


        const textoData =
            formatarData(
                grupo.notificacoes[0]?.created_at
            );


        const textoNaoLidas =
            naoLidas > 0
                ? `
                    <span
                        class="notificacao-grupo-nao-lidas"
                    >
                        ${naoLidas} não lida${naoLidas === 1 ? "" : "s"}
                    </span>
                `
                : "";


        return `

            <section
                class="${classeGrupo}"
                data-grupo-remetente="${escaparHtml(
                    grupo.chave
                )}"
            >

                <button
                    type="button"
                    class="notificacao-grupo-remetente-cabecalho"
                    data-alternar-grupo="${escaparHtml(
                        grupo.chave
                    )}"
                    aria-expanded="${expandido ? "true" : "false"}"
                    aria-label="${
                        expandido
                            ? `Recolher notificações de ${escaparHtml(nome)}`
                            : `Expandir notificações de ${escaparHtml(nome)}`
                    }"
                >

                    <div class="notificacao-grupo-remetente-avatar">

                        ${renderizarAvatar(
                            obterRemetente(
                                grupo.notificacoes[0]
                            )
                        )}

                    </div>


                    <div class="notificacao-grupo-remetente-conteudo">

                        <strong>
                            ${escaparHtml(nome)}
                        </strong>


                        <span>

                            ${escaparHtml(textoQuantidade)}

                            ${textoNaoLidas}

                        </span>

                    </div>


                    <div class="notificacao-grupo-remetente-meta">

                        <time>

                            ${escaparHtml(textoData)}

                        </time>


                        <span
                            class="notificacao-grupo-remetente-seta"
                            aria-hidden="true"
                        >

                            <svg
                                viewBox="0 0 24 24"
                            >

                                <path
                                    d="m6 9 6 6 6-6"
                                ></path>

                            </svg>

                        </span>

                    </div>

                </button>


                <div
                    class="notificacao-grupo-remetente-lista"
                    ${
                        expandido
                            ? ""
                            : "hidden"
                    }
                >

                    ${grupo.notificacoes
                        .map(
                            criarHtmlNotificacao
                        )
                        .join("")}

                </div>

            </section>

        `;

    }


    /* =========================================================
       HTML DO GRUPO DE DATA
    ========================================================= */

    function criarHtmlGrupo(grupo) {

        const subgrupos =
            agruparPorRemetenteEData(
                grupo.notificacoes
            );


        return `

            <section
                class="notificacoes-grupo"
                data-grupo-notificacoes="${escaparHtml(
                    grupo.chave
                )}"
            >

                <div class="notificacoes-grupo-titulo">

                    <h2>
                        ${escaparHtml(grupo.titulo)}
                    </h2>

                </div>


                <div class="notificacoes-grupo-lista">

                    ${subgrupos
                        .map(
                            subgrupo => {

                                /*
                                 * Uma única notificação não
                                 * precisa de um cabeçalho de
                                 * agrupamento.
                                 */

                                if (
                                    subgrupo.notificacoes.length === 1
                                ) {

                                    return criarHtmlNotificacao(
                                        subgrupo.notificacoes[0]
                                    );

                                }


                                /*
                                 * Duas ou mais notificações
                                 * da mesma pessoa no mesmo
                                 * dia formam um grupo.
                                 */

                                return criarHtmlGrupoRemetente(
                                    subgrupo
                                );

                            }
                        )
                        .join("")}

                </div>

            </section>

        `;

    }


    /* =========================================================
       CONTADOR
    ========================================================= */

    function atualizarContadorNaoLidas() {

        const quantidade =
            estado.notificacoes.filter(
                notificacao =>
                    !notificacao.lida &&
                    !notificacaoFoiExcluida(
                        notificacao
                    )
            ).length;


        document
            .querySelectorAll(
                "[data-notificacoes-nao-lidas]"
            )
            .forEach(elemento => {

                elemento.textContent =
                    quantidade > 0
                        ? String(quantidade)
                        : "";


                elemento.hidden =
                    quantidade === 0;

            });


        const contador =
            obterElemento(
                "contadorNotificacoes"
            );


        if (contador) {

            contador.textContent =
                String(quantidade);


            contador.hidden =
                false;

        }

    }


    /* =========================================================
       RENDERIZAÇÃO
    ========================================================= */

    function renderizarNotificacoes() {

        const container =
            obterContainer();


        if (!container) {

            console.warn(
                "MusicalWorldNotificacoes: lista não encontrada."
            );

            return;

        }


        ocultarTodosEstados();


        const notificacoes =
            obterNotificacoesVisiveis();


        if (!notificacoes.length) {

            container.innerHTML = "";


            const titulo =
                obterElemento(
                    "estadoVazio"
                )?.querySelector("h2");


            const mensagem =
                obterElemento(
                    "estadoVazio"
                )?.querySelector("p");


            if (
                estado.filtro ===
                "nao-lidas"
            ) {

                if (titulo) {

                    titulo.textContent =
                        "Nenhuma notificação não lida";

                }


                if (mensagem) {

                    mensagem.textContent =
                        "Você não possui notificações pendentes.";

                }

            } else if (
                estado.filtro ===
                "lidas"
            ) {

                if (titulo) {

                    titulo.textContent =
                        "Nenhuma notificação lida";

                }


                if (mensagem) {

                    mensagem.textContent =
                        "As notificações que você ler aparecerão aqui.";

                }

            } else {

                if (titulo) {

                    titulo.textContent =
                        "Nenhuma notificação";

                }


                if (mensagem) {

                    mensagem.textContent =
                        "Quando houver alguma novidade, ela aparecerá aqui.";

                }

            }


            mostrarEstadoVazio();


            atualizarContadorNaoLidas();


            return;

        }


        const grupos =
            agruparNotificacoesPorData(
                notificacoes
            );


        container.innerHTML =
            grupos
                .map(
                    criarHtmlGrupo
                )
                .join("");


        configurarEventosItens();


        configurarEventosGrupos();


        atualizarContadorNaoLidas();

    }


    /* =========================================================
       EVENTOS DOS GRUPOS
    ========================================================= */

    function configurarEventosGrupos() {

        document
            .querySelectorAll(
                "[data-alternar-grupo]"
            )
            .forEach(botao => {

                if (
                    botao.dataset
                        .notificacoesGrupoConfigurado ===
                    "true"
                ) {

                    return;

                }


                botao.dataset
                    .notificacoesGrupoConfigurado =
                    "true";


                botao.addEventListener(
                    "click",
                    evento => {

                        evento.preventDefault();

                        evento.stopPropagation();


                        const chave =
                            botao.dataset
                                .alternarGrupo;


                        if (!chave) {

                            return;

                        }


                        alternarGrupo(
                            chave
                        );

                    }
                );

            });

    }


    /* =========================================================
       MARCAR UMA COMO LIDA
    ========================================================= */

    async function marcarComoLida(notificationId) {

        if (
            notificationId === null ||
            notificationId === undefined ||
            notificationId === ""
        ) {

            return;

        }


        if (!estado.usuarioId) {

            return;

        }


        const notificacao =
            estado.notificacoes.find(
                item =>
                    String(item.id) ===
                    String(notificationId)
            );


        if (!notificacao) {

            return;

        }


        if (notificacao.lida) {

            return;

        }


        const supabase =
            obterSupabase();


        const {
            error
        } = await supabase
            .from(CONFIG.tabela)
            .update({
                lida: true
            })
            .eq(
                "id",
                notificationId
            )
            .eq(
                "usuario_id",
                estado.usuarioId
            );


        if (error) {

            throw error;

        }


        notificacao.lida =
            true;


        atualizarContadorNaoLidas();


        const elemento =
            document.querySelector(
                `.notificacao-item[data-notificacao-id="${String(
                    notificationId
                )}"]`
            );


        if (!elemento) {

            return;

        }


        elemento.classList.remove(
            "nao-lida"
        );


        const indicador =
            elemento.querySelector(
                ".notificacao-indicador"
            );


        if (indicador) {

            indicador.remove();

        }

    }


    /* =========================================================
       MARCAR TODAS COMO LIDAS
    ========================================================= */

    async function marcarTodasComoLidas() {

        if (!estado.usuarioId) {

            return;

        }


        const existemNaoLidas =
            estado.notificacoes.some(
                notificacao =>
                    !notificacao.lida
            );


        if (!existemNaoLidas) {

            return;

        }


        const supabase =
            obterSupabase();


        const {
            error
        } = await supabase
            .from(CONFIG.tabela)
            .update({
                lida: true
            })
            .eq(
                "usuario_id",
                estado.usuarioId
            )
            .eq(
                "lida",
                false
            );


        if (error) {

            throw error;

        }


        estado.notificacoes =
            estado.notificacoes.map(
                notificacao => ({

                    ...notificacao,

                    lida: true

                })
            );


        renderizarNotificacoes();

    }


    /* =========================================================
       EVENTOS DOS CARDS
    ========================================================= */

    function configurarEventosItens() {

        document
            .querySelectorAll(
                ".notificacao-item"
            )
            .forEach(item => {

                const id =
                    item.dataset
                        .notificacaoId;


                const url =
                    item.dataset.url ||
                    null;


                const botaoExcluir =
                    item.querySelector(
                        "[data-excluir-notificacao]"
                    );


                if (botaoExcluir) {

                    botaoExcluir.addEventListener(
                        "click",
                        evento => {

                            evento.preventDefault();

                            evento.stopPropagation();


                            excluirNotificacaoLocal(
                                id
                            );

                        }
                    );

                }


                item.addEventListener(
                    "click",
                    async evento => {

                        if (
                            evento.target.closest(
                                "[data-excluir-notificacao]"
                            )
                        ) {

                            return;

                        }


                        try {

                            await marcarComoLida(
                                id
                            );

                        } catch (erro) {

                            console.error(
                                "MusicalWorldNotificacoes: erro ao marcar notificação como lida.",
                                erro
                            );

                        }


                        if (url) {

                            window.location.href =
                                url;

                        }

                    }
                );


                item.addEventListener(
                    "keydown",
                    evento => {

                        if (
                            evento.key !== "Enter" &&
                            evento.key !== " "
                        ) {

                            return;

                        }


                        if (
                            evento.target.closest(
                                "[data-excluir-notificacao]"
                            )
                        ) {

                            return;

                        }


                        evento.preventDefault();


                        item.click();

                    }
                );

            });

    }


    /* =========================================================
       BOTÃO MARCAR TODAS
    ========================================================= */

    function configurarBotaoMarcarTodas() {

        document
            .querySelectorAll(
                "#btnMarcarTodas, #marcarTodasLidas, [data-marcar-todas-lidas]"
            )
            .forEach(botao => {

                if (
                    botao.dataset
                        .notificacoesConfigurado ===
                    "true"
                ) {

                    return;

                }


                botao.dataset
                    .notificacoesConfigurado =
                    "true";


                botao.addEventListener(
                    "click",
                    async () => {

                        try {

                            botao.disabled =
                                true;


                            await marcarTodasComoLidas();

                        } catch (erro) {

                            console.error(
                                "MusicalWorldNotificacoes: erro ao marcar todas como lidas.",
                                erro
                            );

                        } finally {

                            botao.disabled =
                                false;

                        }

                    }
                );

            });

    }


    /* =========================================================
       REALTIME
    ========================================================= */

    function encerrarRealtime() {

        if (
            !estado.canalRealtime
        ) {

            return;

        }


        try {

            const supabase =
                obterSupabase();


            supabase.removeChannel(
                estado.canalRealtime
            );

        } catch (erro) {

            console.warn(
                "MusicalWorldNotificacoes: erro ao encerrar Realtime.",
                erro
            );

        }


        estado.canalRealtime =
            null;

    }


    function iniciarRealtime() {

        const supabase =
            obterSupabase();


        encerrarRealtime();


        if (!estado.usuarioId) {

            return;

        }


        const canal =
            supabase
                .channel(
                    `notificacoes-pagina-${estado.usuarioId}`
                )


                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: CONFIG.tabela,
                        filter:
                            `usuario_id=eq.${estado.usuarioId}`
                    },
                    async payload => {

                        const nova =
                            payload?.new;


                        if (!nova?.id) {

                            return;

                        }


                        const jaExiste =
                            estado.notificacoes.some(
                                notificacao =>
                                    String(
                                        notificacao.id
                                    ) ===
                                    String(
                                        nova.id
                                    )
                            );


                        if (jaExiste) {

                            return;

                        }


                        estado.notificacoes.unshift(
                            nova
                        );


                        estado.notificacoes.sort(
                            (a, b) =>
                                new Date(
                                    b.created_at || 0
                                ).getTime() -
                                new Date(
                                    a.created_at || 0
                                ).getTime()
                        );


                        if (
                            nova.remetente_id
                        ) {

                            await carregarRemetentes();

                        }


                        renderizarNotificacoes();

                    }
                )


                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: CONFIG.tabela,
                        filter:
                            `usuario_id=eq.${estado.usuarioId}`
                    },
                    async payload => {

                        const atualizada =
                            payload?.new;


                        if (!atualizada?.id) {

                            return;

                        }


                        const indice =
                            estado.notificacoes.findIndex(
                                notificacao =>
                                    String(
                                        notificacao.id
                                    ) ===
                                    String(
                                        atualizada.id
                                    )
                            );


                        if (
                            indice === -1
                        ) {

                            return;

                        }


                        estado.notificacoes[
                            indice
                        ] =
                            atualizada;


                        if (
                            atualizada.remetente_id
                        ) {

                            await carregarRemetentes();

                        }


                        estado.notificacoes.sort(
                            (a, b) =>
                                new Date(
                                    b.created_at || 0
                                ).getTime() -
                                new Date(
                                    a.created_at || 0
                                ).getTime()
                        );


                        renderizarNotificacoes();

                    }
                )


                .subscribe(
                    status => {

                        console.info(
                            "MusicalWorldNotificacoes: Realtime:",
                            status
                        );

                    }
                );


        estado.canalRealtime =
            canal;

    }


    /* =========================================================
       BOTÃO VOLTAR
    ========================================================= */

    function configurarBotaoVoltar() {

        document
            .querySelectorAll(
                "#btnVoltar, [data-voltar-notificacoes]"
            )
            .forEach(botao => {

                if (
                    botao.dataset
                        .notificacoesConfigurado ===
                    "true"
                ) {

                    return;

                }


                botao.dataset
                    .notificacoesConfigurado =
                    "true";


                botao.addEventListener(
                    "click",
                    () => {

                        window.location.href =
                            CONFIG.paginaAnterior;

                    }
                );

            });

    }


    /* =========================================================
       TENTAR NOVAMENTE
    ========================================================= */

    function configurarBotaoTentarNovamente() {

        const botao =
            obterElemento(
                "btnTentarNovamente"
            );


        if (!botao) {

            return;

        }


        if (
            botao.dataset
                .notificacoesConfigurado ===
            "true"
        ) {

            return;

        }


        botao.dataset
            .notificacoesConfigurado =
            "true";


        botao.addEventListener(
            "click",
            async () => {

                try {

                    botao.disabled =
                        true;


                    mostrarEstadoCarregando();


                    const usuario =
                        await obterUsuarioAtual();


                    if (
                        !usuario?.id
                    ) {

                        throw new Error(
                            "Usuário não autenticado."
                        );

                    }


                    estado.usuarioId =
                        usuario.id;


                    carregarExclusoesLocais();


                    carregarGruposExpandidos();


                    await carregarNotificacoes();


                    iniciarRealtime();

                } catch (erro) {

                    console.error(
                        "MusicalWorldNotificacoes: erro ao tentar novamente.",
                        erro
                    );


                    mostrarEstadoErro(
                        "Ocorreu um problema ao carregar suas notificações."
                    );

                } finally {

                    botao.disabled =
                        false;

                }

            }
        );

    }


    /* =========================================================
       INICIALIZAÇÃO
    ========================================================= */

    async function inicializar() {

        if (
            estado.inicializado ||
            estado.carregando
        ) {

            return;

        }


        estado.carregando =
            true;


        mostrarEstadoCarregando();


        try {

            const usuario =
                await obterUsuarioAtual();


            if (
                !usuario?.id
            ) {

                throw new Error(
                    "Usuário não autenticado."
                );

            }


            estado.usuarioId =
                usuario.id;


            carregarExclusoesLocais();


            carregarGruposExpandidos();


            criarFiltros();


            atualizarVisualFiltros();


            await carregarNotificacoes();


            iniciarRealtime();


            configurarBotaoMarcarTodas();


            configurarBotaoVoltar();


            configurarBotaoTentarNovamente();


            estado.inicializado =
                true;


            console.info(
                "MusicalWorldNotificacoes: módulo inicializado."
            );

        } catch (erro) {

            console.error(
                "MusicalWorldNotificacoes: erro ao inicializar.",
                erro
            );


            const container =
                obterContainer();


            if (container) {

                container.innerHTML =
                    "";

            }


            mostrarEstadoErro(
                "Ocorreu um problema ao carregar suas notificações."
            );

        } finally {

            const carregando =
                obterElemento(
                    "estadoCarregando"
                );


            if (carregando) {

                carregando.hidden =
                    true;

            }


            estado.carregando =
                false;

        }

    }


    /* =========================================================
       DESTRUIR
    ========================================================= */

    function destruir() {

        encerrarRealtime();


        estado.inicializado =
            false;


        estado.usuarioId =
            null;


        estado.notificacoes =
            [];


        estado.remetentes.clear();


        estado.excluidas.clear();


        estado.gruposExpandidos.clear();


        estado.carregando =
            false;

    }


    /* =========================================================
       API PÚBLICA
    ========================================================= */

    window.MusicalWorldNotificacoes = {

        inicializar,

        carregarNotificacoes,

        marcarComoLida,

        marcarTodasComoLidas,

        excluirNotificacaoLocal,

        iniciarRealtime,

        destruir,

        obterFiltroAtual:
            () => estado.filtro,

        definirFiltro:
            filtro => {

                const filtrosValidos = [
                    "todas",
                    "nao-lidas",
                    "lidas"
                ];


                if (
                    !filtrosValidos.includes(
                        filtro
                    )
                ) {

                    return;

                }


                estado.filtro =
                    filtro;


                atualizarVisualFiltros();


                limparGruposExpandidosInvalidos();


                renderizarNotificacoes();

            }

    };


    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            {
                once: true
            }
        );

    } else {

        inicializar();

    }


})(window);