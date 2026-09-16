/* =========================================================
MUSICALWORLD — PÁGINA DE NOTIFICAÇÕES

Arquivo:
js/notificacoes.js

Responsabilidade:

* Carregar o histórico de notificações do usuário.
* Exibir as notificações da mais recente para a mais antiga.
* Destacar notificações não lidas.
* Identificar visualmente quem originou a notificação.
* Exibir a foto do remetente quando existir.
* Exibir a identidade do MusicalWorld para notificações do sistema.
* Exibir o ícone do tipo de notificação no lado direito.
* Marcar uma notificação individual como lida.
* Marcar todas as notificações como lidas.
* Atualizar a lista em tempo real através do Supabase Realtime.
* Encaminhar o usuário para a página correspondente.

Este arquivo NÃO controla a notificação flutuante.

A notificação flutuante utiliza:

js/components/modal-notificacao.js
========================================================= */

(function (window) {


"use strict";


/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {

    tabela: "notificacoes",

    tabelaUsuarios: "usuarios",

    limiteInicial: 100,

    paginaAnterior: "index.html",

    /*
     * Caminho da imagem padrão do sistema.
     *
     * Caso o projeto utilize outro arquivo para a identidade
     * visual do MusicalWorld, basta alterar este caminho.
     */
    imagemSistema: "img/logo-musicalworld.svg"

};


/* =========================================================
   ESTADO INTERNO DO MÓDULO
   ========================================================= */

const estado = {

    inicializado: false,

    usuarioId: null,

    notificacoes: [],

    remetentes: new Map(),

    canalRealtime: null,

    carregando: false

};


/* =========================================================
   REFERÊNCIAS DOS ELEMENTOS
   ========================================================= */

const elementos = {

    btnVoltar: null,

    btnMarcarTodas: null,

    btnTentarNovamente: null,

    contador: null,

    lista: null,

    estadoCarregando: null,

    estadoVazio: null,

    estadoErro: null,

    mensagemErro: null

};


/* =========================================================
   OBTÉM O CLIENTE SUPABASE
   ========================================================= */

function obterSupabase() {

    if (
        window.supabaseClient
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


    return null;

}


/* =========================================================
   CAPTURA DOS ELEMENTOS DO DOM
   ========================================================= */

function capturarElementos() {

    elementos.btnVoltar =
        document.getElementById("btnVoltar");


    elementos.btnMarcarTodas =
        document.getElementById("btnMarcarTodas");


    elementos.btnTentarNovamente =
        document.getElementById("btnTentarNovamente");


    elementos.contador =
        document.getElementById("contadorNotificacoes");


    elementos.lista =
        document.getElementById("listaNotificacoes");


    elementos.estadoCarregando =
        document.getElementById("estadoCarregando");


    elementos.estadoVazio =
        document.getElementById("estadoVazio");


    elementos.estadoErro =
        document.getElementById("estadoErro");


    elementos.mensagemErro =
        document.getElementById("mensagemErro");

}


/* =========================================================
   CONFIGURAÇÃO DOS EVENTOS
   ========================================================= */

function configurarEventos() {

    if (
        elementos.btnVoltar
    ) {

        elementos.btnVoltar.addEventListener(
            "click",
            voltar
        );

    }


    if (
        elementos.btnMarcarTodas
    ) {

        elementos.btnMarcarTodas.addEventListener(
            "click",
            marcarTodasComoLidas
        );

    }


    if (
        elementos.btnTentarNovamente
    ) {

        elementos.btnTentarNovamente.addEventListener(
            "click",
            tentarNovamente
        );

    }

}


/* =========================================================
   OBTÉM USUÁRIO AUTENTICADO
   ========================================================= */

async function obterUsuarioAtual() {

    if (
        window.Sessao &&
        typeof window.Sessao.usuarioAtual === "function"
    ) {

        const usuario =
            await window.Sessao.usuarioAtual();


        if (
            usuario &&
            usuario.id
        ) {

            estado.usuarioId =
                usuario.id;


            console.log(
                "Notificacoes: usuário autenticado.",
                estado.usuarioId
            );


            return usuario;

        }

    }


    const supabase =
        obterSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    const resultado =
        await supabase.auth.getUser();


    if (
        resultado.error
    ) {

        throw resultado.error;

    }


    if (
        !resultado.data ||
        !resultado.data.user
    ) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    estado.usuarioId =
        resultado.data.user.id;


    console.log(
        "Notificacoes: usuário autenticado.",
        estado.usuarioId
    );


    return resultado.data.user;

}


/* =========================================================
   CARREGA NOTIFICAÇÕES
   ========================================================= */

async function carregarNotificacoes() {

    const supabase =
        obterSupabase();


    if (!supabase) {

        mostrarErro(
            "O serviço de notificações não está disponível."
        );

        return;

    }


    if (!estado.usuarioId) {

        mostrarErro(
            "Não foi possível identificar o usuário."
        );

        return;

    }


    estado.carregando = true;


    mostrarCarregando();


    try {

        const resultado =
            await supabase
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


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        estado.notificacoes =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        await carregarRemetentes();


        console.log(
            "Notificacoes: notificações carregadas:",
            estado.notificacoes.length
        );


        renderizar();

    } catch (erro) {

        console.error(
            "Notificacoes: erro ao carregar:",
            erro
        );


        estado.notificacoes = [];


        mostrarErro(
            obterMensagemErro(erro)
        );

    } finally {

        estado.carregando = false;

    }

}


/* =========================================================
   CARREGA DADOS DOS REMETENTES

   As notificações guardam somente o remetente_id.

   Os dados visuais do remetente são carregados aqui:

   - id
   - nome
   - foto_url

   Notificações sem remetente_id são tratadas como
   notificações do sistema.
   ========================================================= */

async function carregarRemetentes() {

    estado.remetentes.clear();


    const ids =
        estado.notificacoes
            .map(
                function (notificacao) {

                    return notificacao.remetente_id;

                }
            )
            .filter(
                function (id) {

                    return Boolean(id);

                }
            );


    const idsUnicos =
        Array.from(
            new Set(ids)
        );


    if (
        !idsUnicos.length
    ) {

        return;

    }


    const supabase =
        obterSupabase();


    if (!supabase) {

        return;

    }


    try {

        const resultado =
            await supabase
                .from(CONFIG.tabelaUsuarios)
                .select(
                    "id,nome,foto_url"
                )
                .in(
                    "id",
                    idsUnicos
                );


        if (
            resultado.error
        ) {

            console.error(
                "Notificacoes: erro ao carregar remetentes:",
                resultado.error
            );

            return;

        }


        if (
            !Array.isArray(resultado.data)
        ) {

            return;

        }


        resultado.data.forEach(
            function (usuario) {

                if (
                    usuario &&
                    usuario.id
                ) {

                    estado.remetentes.set(
                        usuario.id,
                        usuario
                    );

                }

            }
        );

    } catch (erro) {

        console.error(
            "Notificacoes: erro inesperado ao carregar remetentes:",
            erro
        );

    }

}


/* =========================================================
   RENDERIZA A LISTA
   ========================================================= */

function renderizar() {

    ocultarCarregando();

    ocultarErro();

    ocultarVazio();


    if (!elementos.lista) {

        return;

    }


    elementos.lista.innerHTML = "";


    atualizarContador();

    atualizarBotaoMarcarTodas();


    if (
        !estado.notificacoes.length
    ) {

        mostrarVazio();

        return;

    }


    estado.notificacoes.forEach(
        function (notificacao) {

            const elemento =
                criarNotificacao(
                    notificacao
                );


            elementos.lista.appendChild(
                elemento
            );

        }
    );


    atualizarIcones();

}


/* =========================================================
   CRIA ITEM DE NOTIFICAÇÃO
   ========================================================= */

function criarNotificacao(
    notificacao
) {

    const elemento =
        document.createElement(
            "article"
        );


    elemento.className =
        "notificacao-item";


    if (
        notificacao.lida !== true
    ) {

        elemento.classList.add(
            "nao-lida"
        );

    }


    elemento.tabIndex = 0;


    elemento.setAttribute(
        "role",
        "button"
    );


    elemento.setAttribute(
        "aria-label",
        obterAriaLabel(notificacao)
    );


    const titulo =
        escaparHtml(
            notificacao.titulo ||
            obterTituloPadrao(
                notificacao.tipo
            )
        );


    const mensagem =
        escaparHtml(
            notificacao.mensagem ||
            ""
        );


    const data =
        formatarData(
            notificacao.created_at
        );


    const remetente =
        obterDadosRemetente(
            notificacao
        );


    const nomeRemetente =
        escaparHtml(
            remetente.nome
        );


    const avatar =
        criarAvatarRemetente(
            remetente
        );


    const icone =
        obterIcone(
            notificacao.tipo
        );


    elemento.innerHTML = `

        <div
            class="notificacao-avatar"
            aria-hidden="true"
        >
            ${avatar}
        </div>


        <div class="notificacao-conteudo">

            <div class="notificacao-linha-superior">

                <div class="notificacao-identidade">

                    <strong class="notificacao-remetente-nome">
                        ${nomeRemetente}
                    </strong>

                    <span class="notificacao-tipo-texto">
                        ${titulo}
                    </span>

                </div>


                <time
                    class="notificacao-data"
                    datetime="${escaparHtml(
                        notificacao.created_at || ""
                    )}"
                >
                    ${data}
                </time>

            </div>


            ${
                mensagem
                    ? `
                        <p class="notificacao-mensagem">
                            ${mensagem}
                        </p>
                      `
                    : ""
            }

        </div>


        <div
            class="notificacao-icone"
            aria-hidden="true"
        >
            ${icone}
        </div>


        <span
            class="notificacao-indicador"
            aria-hidden="true"
        ></span>

    `;


    elemento.addEventListener(
        "click",
        function () {

            abrirNotificacao(
                notificacao
            );

        }
    );


    elemento.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {

                evento.preventDefault();


                abrirNotificacao(
                    notificacao
                );

            }

        }
    );


    return elemento;

}


/* =========================================================
   OBTÉM DADOS DO REMETENTE
   ========================================================= */

function obterDadosRemetente(
    notificacao
) {

    /*
     * Sem remetente_id significa que a origem é o
     * próprio MusicalWorld.
     */

    if (
        !notificacao ||
        !notificacao.remetente_id
    ) {

        return {

            nome: "MusicalWorld",

            fotoUrl:
                CONFIG.imagemSistema,

            sistema: true

        };

    }


    const usuario =
        estado.remetentes.get(
            notificacao.remetente_id
        );


    if (
        usuario
    ) {

        return {

            nome:
                usuario.nome ||
                "Usuário",

            fotoUrl:
                usuario.foto_url ||
                "",

            sistema: false

        };

    }


    return {

        nome: "Usuário",

        fotoUrl: "",

        sistema: false

    };

}


/* =========================================================
   CRIA AVATAR DO REMETENTE
   ========================================================= */

function criarAvatarRemetente(
    remetente
) {

    const nome =
        remetente &&
        remetente.nome
            ? remetente.nome
            : "Usuário";


    const fotoUrl =
        remetente &&
        remetente.fotoUrl
            ? remetente.fotoUrl
            : "";


    if (
        fotoUrl
    ) {

        return `

            <img
                class="notificacao-avatar-imagem"
                src="${escaparHtml(fotoUrl)}"
                alt=""
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <span
                class="notificacao-avatar-iniciais"
                style="display:none;"
            >
                ${escaparHtml(
                    obterIniciais(nome)
                )}
            </span>

        `;

    }


    return `

        <span
            class="notificacao-avatar-iniciais"
        >
            ${escaparHtml(
                remetente && remetente.sistema
                    ? "M"
                    : obterIniciais(nome)
            )}
        </span>

    `;

}


/* =========================================================
   OBTÉM INICIAIS
   ========================================================= */

function obterIniciais(
    nome
) {

    const texto =
        String(
            nome || ""
        )
            .trim();


    if (!texto) {

        return "U";

    }


    const partes =
        texto
            .split(/\s+/)
            .filter(Boolean);


    if (
        partes.length === 1
    ) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();

}


/* =========================================================
   ABRE UMA NOTIFICAÇÃO
   ========================================================= */

async function abrirNotificacao(
    notificacao
) {

    if (!notificacao) {

        return;

    }


    if (
        notificacao.lida !== true
    ) {

        await marcarComoLida(
            notificacao.id
        );

    }


    const url =
        obterUrlNotificacao(
            notificacao
        );


    if (url) {

        window.location.href =
            url;

    }

}


/* =========================================================
   MARCA UMA NOTIFICAÇÃO COMO LIDA
   ========================================================= */

async function marcarComoLida(
    notificacaoId
) {

    if (
        !notificacaoId ||
        !estado.usuarioId
    ) {

        return false;

    }


    const supabase =
        obterSupabase();


    if (!supabase) {

        return false;

    }


    try {

        const resultado =
            await supabase
                .from(CONFIG.tabela)
                .update({
                    lida: true
                })
                .eq(
                    "id",
                    notificacaoId
                )
                .eq(
                    "usuario_id",
                    estado.usuarioId
                );


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        const notificacao =
            estado.notificacoes.find(
                function (item) {

                    return (
                        item.id ===
                        notificacaoId
                    );

                }
            );


        if (notificacao) {

            notificacao.lida = true;

        }


        renderizar();


        return true;

    } catch (erro) {

        console.error(
            "Notificacoes: erro ao marcar como lida:",
            erro
        );


        return false;

    }

}


/* =========================================================
   MARCA TODAS COMO LIDAS
   ========================================================= */

async function marcarTodasComoLidas() {

    if (
        !estado.usuarioId
    ) {

        return;

    }


    const existemNaoLidas =
        estado.notificacoes.some(
            function (notificacao) {

                return (
                    notificacao.lida !== true
                );

            }
        );


    if (!existemNaoLidas) {

        return;

    }


    const supabase =
        obterSupabase();


    if (!supabase) {

        return;

    }


    if (
        elementos.btnMarcarTodas
    ) {

        elementos.btnMarcarTodas.disabled =
            true;

    }


    try {

        const resultado =
            await supabase
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


        if (
            resultado.error
        ) {

            throw resultado.error;

        }


        estado.notificacoes.forEach(
            function (notificacao) {

                notificacao.lida = true;

            }
        );


        renderizar();

    } catch (erro) {

        console.error(
            "Notificacoes: erro ao marcar todas como lidas:",
            erro
        );


        mostrarErro(
            "Não foi possível marcar todas as notificações como lidas."
        );

    } finally {

        if (
            elementos.btnMarcarTodas
        ) {

            elementos.btnMarcarTodas.disabled =
                false;

        }

    }

}


/* =========================================================
   INICIA REALTIME
   ========================================================= */

function iniciarRealtime() {

    const supabase =
        obterSupabase();


    if (
        !supabase ||
        !estado.usuarioId
    ) {

        return;

    }


    destruirRealtime();


    console.log(
        "Notificacoes: iniciando Realtime."
    );


    estado.canalRealtime =
        supabase
            .channel(
                "notificacoes-pagina"
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
                async function (payload) {

                    await prepararNotificacaoRealtime(
                        payload.new
                    );

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
                async function (payload) {

                    await prepararNotificacaoRealtime(
                        payload.new
                    );

                }
            )
            .subscribe(
                function (status) {

                    console.log(
                        "Notificacoes: status Realtime:",
                        status
                    );

                }
            );

}


/* =========================================================
   PREPARA NOTIFICAÇÃO RECEBIDA PELO REALTIME
   ========================================================= */

async function prepararNotificacaoRealtime(
    notificacao
) {

    if (
        !notificacao ||
        notificacao.usuario_id !==
            estado.usuarioId
    ) {

        return;

    }


    await carregarRemetenteRealtime(
        notificacao
    );


    if (
        estado.notificacoes.some(
            function (item) {

                return (
                    item.id ===
                    notificacao.id
                );

            }
        )
    ) {

        atualizarNotificacaoRealtime(
            notificacao
        );

        return;

    }


    adicionarNotificacaoRealtime(
        notificacao
    );

}


/* =========================================================
   CARREGA REMETENTE DE UMA NOTIFICAÇÃO REALTIME
   ========================================================= */

async function carregarRemetenteRealtime(
    notificacao
) {

    if (
        !notificacao ||
        !notificacao.remetente_id
    ) {

        return;

    }


    if (
        estado.remetentes.has(
            notificacao.remetente_id
        )
    ) {

        return;

    }


    const supabase =
        obterSupabase();


    if (!supabase) {

        return;

    }


    try {

        const resultado =
            await supabase
                .from(CONFIG.tabelaUsuarios)
                .select(
                    "id,nome,foto_url"
                )
                .eq(
                    "id",
                    notificacao.remetente_id
                )
                .maybeSingle();


        if (
            resultado.error
        ) {

            console.error(
                "Notificacoes: erro ao carregar remetente realtime:",
                resultado.error
            );

            return;

        }


        if (
            resultado.data
        ) {

            estado.remetentes.set(
                resultado.data.id,
                resultado.data
            );

        }

    } catch (erro) {

        console.error(
            "Notificacoes: erro ao obter remetente realtime:",
            erro
        );

    }

}


/* =========================================================
   ADICIONA NOTIFICAÇÃO RECEBIDA PELO REALTIME
   ========================================================= */

function adicionarNotificacaoRealtime(
    notificacao
) {

    if (
        !notificacao ||
        notificacao.usuario_id !==
            estado.usuarioId
    ) {

        return;

    }


    const existente =
        estado.notificacoes.find(
            function (item) {

                return (
                    item.id ===
                    notificacao.id
                );

            }
        );


    if (existente) {

        return;

    }


    estado.notificacoes.unshift(
        notificacao
    );


    if (
        estado.notificacoes.length >
        CONFIG.limiteInicial
    ) {

        estado.notificacoes =
            estado.notificacoes.slice(
                0,
                CONFIG.limiteInicial
            );

    }


    renderizar();

}


/* =========================================================
   ATUALIZA NOTIFICAÇÃO RECEBIDA PELO REALTIME
   ========================================================= */

function atualizarNotificacaoRealtime(
    notificacao
) {

    if (
        !notificacao ||
        notificacao.usuario_id !==
            estado.usuarioId
    ) {

        return;

    }


    const indice =
        estado.notificacoes.findIndex(
            function (item) {

                return (
                    item.id ===
                    notificacao.id
                );

            }
        );


    if (
        indice === -1
    ) {

        adicionarNotificacaoRealtime(
            notificacao
        );

        return;

    }


    estado.notificacoes[indice] =
        Object.assign(
            {},
            estado.notificacoes[indice],
            notificacao
        );


    estado.notificacoes.sort(
        function (a, b) {

            return (
                new Date(
                    b.created_at
                ) -
                new Date(
                    a.created_at
                )
            );

        }
    );


    renderizar();

}


/* =========================================================
   DESTRÓI O CANAL REALTIME
   ========================================================= */

function destruirRealtime() {

    if (
        !estado.canalRealtime
    ) {

        return;

    }


    const supabase =
        obterSupabase();


    if (supabase) {

        supabase.removeChannel(
            estado.canalRealtime
        );

    }


    estado.canalRealtime =
        null;

}


/* =========================================================
   OBTÉM URL DA NOTIFICAÇÃO
   ========================================================= */

function obterUrlNotificacao(
    notificacao
) {

    const tipo =
        String(
            notificacao.tipo || ""
        ).toLowerCase();


    const referenciaId =
        notificacao.referencia_id;


    if (
        !referenciaId
    ) {

        return null;

    }


    if (
        tipo === "mensagem" ||
        tipo === "nova_mensagem"
    ) {

        return (
            "chat.html?id=" +
            encodeURIComponent(
                referenciaId
            )
        );

    }


    if (
        tipo === "contratacao" ||
        tipo === "nova_contratacao" ||
        tipo === "solicitacao_contratacao"
    ) {

        return (
            "contratacao.html?id=" +
            encodeURIComponent(
                referenciaId
            )
        );

    }


    return null;

}


/* =========================================================
   OBTÉM ÍCONE DA NOTIFICAÇÃO

   O ícone é exibido no lado direito do item.
   ========================================================= */

function obterIcone(
    tipo
) {

    const tipoNormalizado =
        String(
            tipo || ""
        ).toLowerCase();


    if (
        tipoNormalizado === "mensagem" ||
        tipoNormalizado === "nova_mensagem"
    ) {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
                ></path>
            </svg>
        `;

    }


    if (
        tipoNormalizado === "contratacao" ||
        tipoNormalizado === "nova_contratacao" ||
        tipoNormalizado === "solicitacao_contratacao"
    ) {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <rect
                    x="3"
                    y="4"
                    width="18"
                    height="18"
                    rx="2"
                ></rect>

                <path
                    d="M16 2v4"
                ></path>

                <path
                    d="M8 2v4"
                ></path>

                <path
                    d="M3 10h18"
                ></path>

                <path
                    d="M8 14h3"
                ></path>

                <path
                    d="M8 18h6"
                ></path>
            </svg>
        `;

    }


    if (
        tipoNormalizado === "avaliacao"
    ) {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"
                ></path>
            </svg>
        `;

    }


    if (
        tipoNormalizado === "pagamento"
    ) {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="2"
                ></rect>

                <path
                    d="M2 10h20"
                ></path>

                <path
                    d="M6 15h3"
                ></path>
            </svg>
        `;

    }


    return `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
            ></path>

            <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
            ></path>
        </svg>
    `;

}


/* =========================================================
   TÍTULO PADRÃO
   ========================================================= */

function obterTituloPadrao(
    tipo
) {

    const tipoNormalizado =
        String(
            tipo || ""
        ).toLowerCase();


    if (
        tipoNormalizado === "mensagem" ||
        tipoNormalizado === "nova_mensagem"
    ) {

        return "Nova mensagem";

    }


    if (
        tipoNormalizado === "contratacao" ||
        tipoNormalizado === "nova_contratacao" ||
        tipoNormalizado === "solicitacao_contratacao"
    ) {

        return "Nova solicitação";

    }


    if (
        tipoNormalizado === "avaliacao"
    ) {

        return "Nova avaliação";

    }


    if (
        tipoNormalizado === "pagamento"
    ) {

        return "Atualização de pagamento";

    }


    return "Nova notificação";

}


/* =========================================================
   LABEL DE ACESSIBILIDADE
   ========================================================= */

function obterAriaLabel(
    notificacao
) {

    const remetente =
        obterDadosRemetente(
            notificacao
        );


    const titulo =
        notificacao.titulo ||
        obterTituloPadrao(
            notificacao.tipo
        );


    const mensagem =
        notificacao.mensagem ||
        "";


    return (
        remetente.nome +
        ". " +
        titulo +
        (
            mensagem
                ? ". " + mensagem
                : ""
        )
    );

}


/* =========================================================
   FORMATA DATA E HORA
   ========================================================= */

function formatarData(
    valor
) {

    if (!valor) {

        return "";

    }


    const data =
        new Date(
            valor
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "";

    }


    const agora =
        new Date();


    const hoje =
        new Date(
            agora.getFullYear(),
            agora.getMonth(),
            agora.getDate()
        );


    const diaNotificacao =
        new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate()
        );


    const diferencaDias =
        Math.round(
            (
                hoje.getTime() -
                diaNotificacao.getTime()
            ) /
            86400000
        );


    const hora =
        data.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    if (
        diferencaDias === 0
    ) {

        return (
            "Hoje, " +
            hora
        );

    }


    if (
        diferencaDias === 1
    ) {

        return (
            "Ontem, " +
            hora
        );

    }


    return (
        data.toLocaleDateString(
            "pt-BR"
        ) +
        ", " +
        hora
    );

}


/* =========================================================
   ATUALIZA CONTADOR
   ========================================================= */

function atualizarContador() {

    if (
        !elementos.contador
    ) {

        return;

    }


    const quantidade =
        estado.notificacoes.filter(
            function (notificacao) {

                return (
                    notificacao.lida !== true
                );

            }
        ).length;


    elementos.contador.textContent =
        String(
            quantidade
        );


    elementos.contador.setAttribute(
        "aria-label",
        quantidade === 1
            ? "1 notificação não lida"
            : `${quantidade} notificações não lidas`
    );

}


/* =========================================================
   ATUALIZA BOTÃO "MARCAR TODAS"
   ========================================================= */

function atualizarBotaoMarcarTodas() {

    if (
        !elementos.btnMarcarTodas
    ) {

        return;

    }


    const existemNaoLidas =
        estado.notificacoes.some(
            function (notificacao) {

                return (
                    notificacao.lida !== true
                );

            }
        );


    elementos.btnMarcarTodas.disabled =
        !existemNaoLidas;

}


/* =========================================================
   ESTADO DE CARREGAMENTO
   ========================================================= */

function mostrarCarregando() {

    if (
        elementos.estadoCarregando
    ) {

        elementos.estadoCarregando.hidden =
            false;

    }


    if (
        elementos.estadoVazio
    ) {

        elementos.estadoVazio.hidden =
            true;

    }


    if (
        elementos.estadoErro
    ) {

        elementos.estadoErro.hidden =
            true;

    }


    if (
        elementos.lista
    ) {

        elementos.lista.innerHTML =
            "";

    }

}


function ocultarCarregando() {

    if (
        elementos.estadoCarregando
    ) {

        elementos.estadoCarregando.hidden =
            true;

    }

}


/* =========================================================
   ESTADO VAZIO
   ========================================================= */

function mostrarVazio() {

    ocultarCarregando();

    ocultarErro();


    if (
        elementos.estadoVazio
    ) {

        elementos.estadoVazio.hidden =
            false;

    }

}


function ocultarVazio() {

    if (
        elementos.estadoVazio
    ) {

        elementos.estadoVazio.hidden =
            true;

    }

}


/* =========================================================
   ESTADO DE ERRO
   ========================================================= */

function mostrarErro(
    mensagem
) {

    ocultarCarregando();

    ocultarVazio();


    if (
        elementos.mensagemErro
    ) {

        elementos.mensagemErro.textContent =
            mensagem ||
            "Ocorreu um problema ao carregar suas notificações.";

    }


    if (
        elementos.estadoErro
    ) {

        elementos.estadoErro.hidden =
            false;

    }

}


function ocultarErro() {

    if (
        elementos.estadoErro
    ) {

        elementos.estadoErro.hidden =
            true;

    }

}


/* =========================================================
   TENTA CARREGAR NOVAMENTE
   ========================================================= */

async function tentarNovamente() {

    ocultarErro();

    await carregarNotificacoes();

}


/* =========================================================
   VOLTAR
   ========================================================= */

function voltar() {

    if (
        document.referrer &&
        document.referrer.includes(
            window.location.origin
        )
    ) {

        window.history.back();

        return;

    }


    window.location.href =
        CONFIG.paginaAnterior;

}


/* =========================================================
   ATUALIZA ÍCONES LUCIDE
   ========================================================= */

function atualizarIcones() {

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }

}


/* =========================================================
   ESCAPA HTML
   ========================================================= */

function escaparHtml(
    valor
) {

    const texto =
        String(
            valor ?? ""
        );


    return texto
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
   OBTÉM MENSAGEM DE ERRO AMIGÁVEL
   ========================================================= */

function obterMensagemErro(
    erro
) {

    if (!erro) {

        return (
            "Ocorreu um problema ao carregar suas notificações."
        );

    }


    const codigo =
        erro.code ||
        "";


    if (
        codigo === "PGRST205"
    ) {

        return (
            "A tabela de notificações não foi encontrada no banco de dados."
        );

    }


    if (
        codigo === "42501"
    ) {

        return (
            "Você não possui permissão para acessar estas notificações."
        );

    }


    if (
        erro.message
    ) {

        return (
            "Não foi possível carregar suas notificações."
        );

    }


    return (
        "Ocorreu um problema ao carregar suas notificações."
    );

}


/* =========================================================
   DESTRUIÇÃO DO MÓDULO
   ========================================================= */

function destruir() {

    destruirRealtime();


    estado.inicializado =
        false;


    estado.usuarioId =
        null;


    estado.notificacoes =
        [];


    estado.remetentes.clear();

}


/* =========================================================
   INICIALIZAÇÃO PRINCIPAL
   ========================================================= */

async function iniciar() {

    if (
        estado.inicializado
    ) {

        return;

    }


    console.log(
        "Notificacoes: inicializando página."
    );


    capturarElementos();

    configurarEventos();


    estado.inicializado =
        true;


    try {

        await obterUsuarioAtual();

        await carregarNotificacoes();

        iniciarRealtime();

    } catch (erro) {

        console.error(
            "Notificacoes: erro na inicialização:",
            erro
        );


        mostrarErro(
            obterMensagemErro(
                erro
            )
        );

    }

}


/* =========================================================
   EXPOSIÇÃO GLOBAL
   ========================================================= */

window.Notificacoes = {

    iniciar,

    carregar: carregarNotificacoes,

    marcarComoLida,

    marcarTodasComoLidas,

    destruir,

    renderizar

};


/* =========================================================
   INICIALIZAÇÃO AUTOMÁTICA
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            iniciar();

        },
        {
            once: true
        }
    );

} else {

    iniciar();

}


console.log(
    "Notificacoes: módulo carregado."
);


})(window);
