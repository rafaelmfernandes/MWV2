 /*

MUSICALWORLD — CAIXA DE MENSAGENS

Arquivo:
JS/mensagens.js

Responsabilidade deste arquivo:

1. Carregar as conversas do usuário autenticado.
2. Exibir a lista de conversas.
3. Buscar e filtrar conversas.
4. Mostrar última mensagem, horário e contador de não lidas.
5. Atualizar a lista em tempo real através do Supabase Realtime.
6. Abrir uma conversa individual através de:
   chat.html?id=CONVERSA_ID

IMPORTANTE:

Este arquivo NÃO controla mais o chat individual.

A conversa individual é responsabilidade de:
JS/Chat/chat.js

A página:
mensagens.html

# é exclusivamente a caixa de entrada.

*/

(function (window) {


"use strict";

/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const CONFIG = {
    paginaChat: "chat.html"
};


/* =====================================================
   ESTADO DO MÓDULO
===================================================== */

const estado = {
    usuarioAtual: null,
    dadosUsuario: null,

    conversas: [],
    conversasFiltradas: [],

    filtroAtual: "todas",
    termoBusca: "",

    canalMensagens: null,
    canalConversas: null,

    inicializado: false
};


/* =====================================================
   REFERÊNCIAS DO DOM
===================================================== */

const elementos = {};


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function inicializar() {

    if (estado.inicializado) {
        return;
    }

    console.log("=========================================");
    console.log("MUSICALWORLD — MENSAGENS");
    console.log("Inicializando caixa de mensagens...");
    console.log("=========================================");

    try {

        obterElementos();

        if (!window.supabaseClient) {
            console.error(
                "Mensagens: supabaseClient não encontrado."
            );
            renderizarErro(
                "Não foi possível conectar ao sistema de mensagens."
            );
            return;
        }

        if (!window.Sessao) {
            console.error(
                "Mensagens: módulo Sessao não encontrado."
            );
            renderizarErro(
                "Não foi possível verificar sua sessão."
            );
            return;
        }


        /* ---------------------------------------------
           USUÁRIO AUTENTICADO
        --------------------------------------------- */

        estado.usuarioAtual = await Sessao.usuarioAtual();

        if (!estado.usuarioAtual) {

            console.warn(
                "Mensagens: usuário não autenticado."
            );

            renderizarEstadoVazio(
                "Faça login para visualizar suas mensagens."
            );

            return;
        }

        console.log(
            "Mensagens: usuário autenticado:",
            estado.usuarioAtual.id
        );


        /* ---------------------------------------------
           DADOS DO USUÁRIO
        --------------------------------------------- */

        await carregarDadosUsuario();


        /* ---------------------------------------------
           CONVERSAS
        --------------------------------------------- */

        await carregarConversas();


        /* ---------------------------------------------
           EVENTOS
        --------------------------------------------- */

        configurarEventos();


        /* ---------------------------------------------
           REALTIME
        --------------------------------------------- */

        configurarRealtime();


        estado.inicializado = true;

        console.log(
            "Mensagens: caixa de mensagens inicializada."
        );

    } catch (erro) {

        console.error(
            "Mensagens: erro durante inicialização:",
            erro
        );

        renderizarErro(
            "Não foi possível carregar suas mensagens."
        );
    }
}


/* =====================================================
   DOM
===================================================== */

function obterElementos() {

    elementos.lista =
        document.getElementById("conversationsList");

    elementos.busca =
        document.getElementById("searchInput");

    elementos.limparBusca =
        document.getElementById("clearSearch");

    elementos.filtros =
        document.querySelectorAll(
            ".filter-tab, .filter-btn, [data-filtro]"
        );

    if (!elementos.lista) {
        console.warn(
            "Mensagens: #conversationsList não encontrado."
        );
    }
}


/* =====================================================
   DADOS DO USUÁRIO
===================================================== */

async function carregarDadosUsuario() {

    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("id", estado.usuarioAtual.id)
        .maybeSingle();

    if (error) {

        console.error(
            "Mensagens: erro ao carregar usuário:",
            error
        );

        return;
    }

    estado.dadosUsuario = data;

    console.log(
        "Mensagens: dados do usuário carregados:",
        data
    );
}


/* =====================================================
   CARREGAR CONVERSAS
===================================================== */

async function carregarConversas() {

    console.log(
        "Mensagens: carregando conversas..."
    );

    const { data, error } = await supabaseClient
        .from("conversas")
        .select("*")
        .or(
            `contratante_id.eq.${estado.usuarioAtual.id},contratado_id.eq.${estado.usuarioAtual.id}`
        )
        .order("updated_at", {
            ascending: false
        });

    if (error) {

        console.error(
            "Mensagens: erro ao carregar conversas:",
            error
        );

        renderizarErro(
            "Não foi possível carregar suas conversas."
        );

        return;
    }

    estado.conversas = [];

    if (!data || data.length === 0) {

        console.log(
            "Mensagens: nenhuma conversa encontrada."
        );

        aplicarFiltros();

        return;
    }


    /* ---------------------------------------------
       MONTAR DADOS COMPLETOS DE CADA CONVERSA
    --------------------------------------------- */

    for (const conversa of data) {

        try {

            const conversaCompleta =
                await montarDadosConversa(conversa);

            if (conversaCompleta) {
                estado.conversas.push(
                    conversaCompleta
                );
            }

        } catch (erro) {

            console.error(
                "Mensagens: erro ao processar conversa:",
                conversa.id,
                erro
            );
        }
    }


    /* ---------------------------------------------
       GARANTIR ORDEM MAIS RECENTE PRIMEIRO
    --------------------------------------------- */

    estado.conversas.sort(function (a, b) {

        const dataA =
            new Date(
                a.updated_at || a.created_at || 0
            ).getTime();

        const dataB =
            new Date(
                b.updated_at || b.created_at || 0
            ).getTime();

        return dataB - dataA;
    });


    aplicarFiltros();

    console.log(
        "Mensagens: conversas carregadas:",
        estado.conversas.length
    );
}


/* =====================================================
   MONTAR DADOS DA CONVERSA
===================================================== */

async function montarDadosConversa(conversa) {

    const meuId = estado.usuarioAtual.id;

    const outroUsuarioId =
        conversa.contratante_id === meuId
            ? conversa.contratado_id
            : conversa.contratante_id;


    /* ---------------------------------------------
       OUTRO USUÁRIO
    --------------------------------------------- */

    const { data: outroUsuario, error: erroUsuario } =
        await supabaseClient
            .from("usuarios")
            .select("*")
            .eq("id", outroUsuarioId)
            .maybeSingle();

    if (erroUsuario) {

        console.error(
            "Mensagens: erro ao buscar participante:",
            erroUsuario
        );

        return null;
    }


    /* ---------------------------------------------
       ÚLTIMA MENSAGEM
    --------------------------------------------- */

    const { data: ultimaMensagem, error: erroMensagem } =
        await supabaseClient
            .from("mensagens")
            .select("*")
            .eq("conversa_id", conversa.id)
            .order("created_at", {
                ascending: false
            })
            .limit(1)
            .maybeSingle();

    if (erroMensagem) {

        console.error(
            "Mensagens: erro ao buscar última mensagem:",
            erroMensagem
        );
    }


    /* ---------------------------------------------
       CONTADOR DE NÃO LIDAS

       Somente mensagens recebidas são consideradas
       não lidas.
    --------------------------------------------- */

    const { count: naoLidas, error: erroNaoLidas } =
        await supabaseClient
            .from("mensagens")
            .select("id", {
                count: "exact",
                head: true
            })
            .eq("conversa_id", conversa.id)
            .eq("lida", false)
            .neq("remetente_id", meuId);

    if (erroNaoLidas) {

        console.error(
            "Mensagens: erro ao contar não lidas:",
            erroNaoLidas
        );
    }


    /* ---------------------------------------------
       SERVIÇO
    --------------------------------------------- */

    let servico = null;

    if (conversa.servico_id) {

        const resultadoServico =
            await supabaseClient
                .from("servicos_artistas")
                .select("*")
                .eq("id", conversa.servico_id)
                .maybeSingle();

        if (!resultadoServico.error) {
            servico = resultadoServico.data;
        }
    }


    /* ---------------------------------------------
       RETORNO
    --------------------------------------------- */

    return {

        ...conversa,

        outroUsuario: outroUsuario || null,

        ultimaMensagem:
            ultimaMensagem || null,

        naoLidas:
            naoLidas || 0,

        servico:
            servico || null
    };
}


/* =====================================================
   FILTROS
===================================================== */

function aplicarFiltros() {

    let resultado = [
        ...estado.conversas
    ];


    /* ---------------------------------------------
       FILTRO POR TIPO
    --------------------------------------------- */

    if (estado.filtroAtual === "contratados") {

        resultado = resultado.filter(function (conversa) {

            return conversa.contratado_id ===
                estado.usuarioAtual.id;
        });
    }

    if (estado.filtroAtual === "servicos") {

        resultado = resultado.filter(function (conversa) {

            return !!(
                conversa.servico_id ||
                conversa.contratacao_id
            );
        });
    }


    /* ---------------------------------------------
       BUSCA
    --------------------------------------------- */

    const termo =
        estado.termoBusca
            .trim()
            .toLowerCase();

    if (termo) {

        resultado = resultado.filter(function (conversa) {

            const nome =
                conversa.outroUsuario?.nome ||
                "";

            const email =
                conversa.outroUsuario?.email ||
                "";

            const ultimaMensagem =
                conversa.ultimaMensagem?.conteudo ||
                "";

            const nomeServico =
                conversa.servico?.nome ||
                conversa.servico?.titulo ||
                "";

            const textoPesquisa = [
                nome,
                email,
                ultimaMensagem,
                nomeServico
            ]
                .join(" ")
                .toLowerCase();

            return textoPesquisa.includes(termo);
        });
    }


    estado.conversasFiltradas =
        resultado;


    renderizarConversas();
}


/* =====================================================
   RENDERIZAR LISTA
===================================================== */

function renderizarConversas() {

    if (!elementos.lista) {
        return;
    }

    elementos.lista.innerHTML = "";


    /* ---------------------------------------------
       NENHUMA CONVERSA
    --------------------------------------------- */

    if (estado.conversasFiltradas.length === 0) {

        if (
            estado.termoBusca.trim() ||
            estado.filtroAtual !== "todas"
        ) {

            renderizarEstadoVazio(
                "Nenhuma conversa encontrada."
            );

        } else {

            renderizarEstadoVazio(
                "Você ainda não possui conversas."
            );
        }

        return;
    }


    /* ---------------------------------------------
       LISTA
    --------------------------------------------- */

    estado.conversasFiltradas.forEach(function (conversa) {

        const item =
            criarItemConversa(conversa);

        elementos.lista.appendChild(item);
    });
}


/* =====================================================
   CRIAR ITEM DE CONVERSA
===================================================== */

function criarItemConversa(conversa) {

    const item =
        document.createElement("article");

    item.className =
        "conversation-item";

    if (conversa.naoLidas > 0) {
        item.classList.add("has-unread");
    }

    item.setAttribute(
        "data-conversa-id",
        conversa.id
    );

    item.setAttribute(
        "role",
        "button"
    );

    item.setAttribute(
        "tabindex",
        "0"
    );


    /* ---------------------------------------------
       AVATAR
    --------------------------------------------- */

    const avatar =
        criarAvatar(conversa.outroUsuario);


    /* ---------------------------------------------
       INFORMAÇÕES
    --------------------------------------------- */

    const informacoes =
        document.createElement("div");

    informacoes.className =
        "conversation-info";


    /* ---------------------------------------------
       LINHA SUPERIOR
    --------------------------------------------- */

    const linhaSuperior =
        document.createElement("div");

    linhaSuperior.className =
        "conversation-top";


    const nome =
        document.createElement("div");

    nome.className =
        "conversation-name";

    nome.textContent =
        conversa.outroUsuario?.nome ||
        "Usuário";


    const horario =
        document.createElement("time");

    horario.className =
        "conversation-time";

    horario.dateTime =
        conversa.ultimaMensagem?.created_at ||
        conversa.updated_at ||
        conversa.created_at ||
        "";

    horario.textContent =
        formatarHorario(
            conversa.ultimaMensagem?.created_at ||
            conversa.updated_at ||
            conversa.created_at
        );


    linhaSuperior.appendChild(nome);
    linhaSuperior.appendChild(horario);


    /* ---------------------------------------------
       LINHA DA MENSAGEM
    --------------------------------------------- */

    const linhaMensagem =
        document.createElement("div");

    linhaMensagem.className =
        "conversation-bottom";


    const preview =
        document.createElement("div");

    preview.className =
        "conversation-preview";

    preview.textContent =
        gerarPreviewMensagem(conversa);


    linhaMensagem.appendChild(preview);


    /* ---------------------------------------------
       CONTADOR
    --------------------------------------------- */

    if (conversa.naoLidas > 0) {

        const contador =
            document.createElement("span");

        contador.className =
            "conversation-unread";

        contador.textContent =
            conversa.naoLidas > 99
                ? "99+"
                : String(conversa.naoLidas);

        contador.setAttribute(
            "aria-label",
            `${conversa.naoLidas} mensagens não lidas`
        );

        linhaMensagem.appendChild(contador);
    }


    /* ---------------------------------------------
       CONTEXTO
    --------------------------------------------- */

    const contexto =
        criarContextoConversa(conversa);


    /* ---------------------------------------------
       MONTAR
    --------------------------------------------- */

    informacoes.appendChild(linhaSuperior);
    informacoes.appendChild(linhaMensagem);

    if (contexto) {
        informacoes.appendChild(contexto);
    }


    item.appendChild(avatar);
    item.appendChild(informacoes);


    /* ---------------------------------------------
       EVENTOS
    --------------------------------------------- */

    item.addEventListener(
        "click",
        function () {

            abrirConversa(
                conversa.id
            );
        }
    );

    item.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {

                evento.preventDefault();

                abrirConversa(
                    conversa.id
                );
            }
        }
    );


    return item;
}


/* =====================================================
   AVATAR
===================================================== */

function criarAvatar(usuario) {

    const container =
        document.createElement("div");

    container.className =
        "conversation-avatar";


    const foto =
        usuario?.foto_url ||
        usuario?.avatar_url ||
        usuario?.foto ||
        null;


    if (foto) {

        const imagem =
            document.createElement("img");

        imagem.src = foto;

        imagem.alt =
            usuario?.nome ||
            "Usuário";

        imagem.loading = "lazy";

        imagem.onerror = function () {

            imagem.remove();

            container.appendChild(
                criarIniciais(
                    usuario?.nome
                )
            );
        };

        container.appendChild(imagem);

    } else {

        container.appendChild(
            criarIniciais(
                usuario?.nome
            )
        );
    }


    return container;
}


/* =====================================================
   INICIAIS DO AVATAR
===================================================== */

function criarIniciais(nome) {

    const iniciais =
        document.createElement("span");

    iniciais.className =
        "conversation-avatar-initials";

    iniciais.textContent =
        obterIniciais(nome);

    return iniciais;
}


function obterIniciais(nome) {

    if (!nome) {
        return "U";
    }

    const partes =
        nome
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return (
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();
}


/* =====================================================
   PREVIEW DA ÚLTIMA MENSAGEM
===================================================== */

function gerarPreviewMensagem(conversa) {

    const mensagem =
        conversa.ultimaMensagem;

    if (!mensagem) {
        return "Nenhuma mensagem ainda.";
    }


    let prefixo = "";

    if (
        mensagem.remetente_id ===
        estado.usuarioAtual.id
    ) {
        prefixo = "Você: ";
    }


    if (mensagem.tipo === "imagem") {
        return prefixo + "Imagem";
    }

    if (mensagem.tipo === "arquivo") {
        return prefixo + "Arquivo";
    }


    return prefixo +
        (
            mensagem.conteudo ||
            "Mensagem"
        );
}


/* =====================================================
   CONTEXTO DA CONVERSA
===================================================== */

function criarContextoConversa(conversa) {

    const textos = [];


    if (conversa.servico) {

        const nomeServico =
            conversa.servico.nome ||
            conversa.servico.titulo;

        if (nomeServico) {
            textos.push(nomeServico);
        }
    }


    if (conversa.contratacao_id) {
        textos.push("Contratação");
    }


    if (textos.length === 0) {
        return null;
    }


    const contexto =
        document.createElement("div");

    contexto.className =
        "conversation-context";

    contexto.textContent =
        textos.join(" · ");

    return contexto;
}


/* =====================================================
   ABRIR CONVERSA
===================================================== */

function abrirConversa(conversaId) {

    if (!conversaId) {

        console.error(
            "Mensagens: ID da conversa não informado."
        );

        return;
    }


    const url =
        new URL(
            CONFIG.paginaChat,
            window.location.href
        );

    url.searchParams.set(
        "id",
        conversaId
    );


    window.location.assign(
        url.toString()
    );
}


/* =====================================================
   BUSCA
===================================================== */

function configurarBusca() {

    if (!elementos.busca) {
        return;
    }


    elementos.busca.addEventListener(
        "input",
        function (evento) {

            estado.termoBusca =
                evento.target.value || "";

            atualizarBotaoLimparBusca();

            aplicarFiltros();
        }
    );
}


function atualizarBotaoLimparBusca() {

    if (!elementos.limparBusca) {
        return;
    }

    const possuiTexto =
        !!estado.termoBusca.trim();

    elementos.limparBusca.hidden =
        !possuiTexto;
}


function limparBusca() {

    if (elementos.busca) {
        elementos.busca.value = "";
    }

    estado.termoBusca = "";

    atualizarBotaoLimparBusca();

    aplicarFiltros();
}


/* =====================================================
   FILTROS
===================================================== */

function configurarFiltros() {

    if (!elementos.filtros) {
        return;
    }

    elementos.filtros.forEach(function (botao) {

        botao.addEventListener(
            "click",
            function () {

                const filtro =
                    botao.dataset.filtro ||
                    obterFiltroDoBotao(botao);

                if (!filtro) {
                    return;
                }

                definirFiltro(
                    filtro,
                    botao
                );
            }
        );
    });
}


function obterFiltroDoBotao(botao) {

    const texto =
        (
            botao.textContent ||
            ""
        )
            .trim()
            .toLowerCase();


    if (
        texto.includes("contrat")
    ) {
        return "contratados";
    }

    if (
        texto.includes("serviço") ||
        texto.includes("servico")
    ) {
        return "servicos";
    }

    return "todas";
}


function definirFiltro(filtro, botaoAtivo) {

    const filtrosValidos = [
        "todas",
        "contratados",
        "servicos"
    ];

    if (
        !filtrosValidos.includes(filtro)
    ) {
        filtro = "todas";
    }


    estado.filtroAtual =
        filtro;


    /* ---------------------------------------------
       ATUALIZAR VISUAL DOS BOTÕES
    --------------------------------------------- */

    if (elementos.filtros) {

        elementos.filtros.forEach(
            function (botao) {

                botao.classList.remove(
                    "active",
                    "ativo",
                    "selected"
                );

                botao.setAttribute(
                    "aria-selected",
                    "false"
                );
            }
        );
    }


    if (botaoAtivo) {

        botaoAtivo.classList.add(
            "active"
        );

        botaoAtivo.setAttribute(
            "aria-selected",
            "true"
        );
    }


    aplicarFiltros();
}


/* =====================================================
   EVENTOS DA PÁGINA
===================================================== */

function configurarEventos() {

    configurarBusca();
    configurarFiltros();

    atualizarBotaoLimparBusca();


    /* ---------------------------------------------
       FILTRO INICIAL
    --------------------------------------------- */

    const filtroInicial =
        document.querySelector(
            '[data-filtro="todas"]'
        );

    if (filtroInicial) {

        definirFiltro(
            "todas",
            filtroInicial
        );

    } else {

        aplicarFiltros();
    }
}


/* =====================================================
   REALTIME — MENSAGENS
===================================================== */

function configurarRealtime() {

    /* ---------------------------------------------
       EVITAR INSCRIÇÕES DUPLICADAS
    --------------------------------------------- */

    removerRealtime();


    /* ---------------------------------------------
       NOVAS MENSAGENS
    --------------------------------------------- */

    estado.canalMensagens =
        supabaseClient
            .channel(
                "mensagens-inbox-" +
                estado.usuarioAtual.id
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "mensagens"
                },
                function (payload) {

                    processarNovaMensagem(
                        payload.new
                    );
                }
            )
            .subscribe(function (status) {

                console.log(
                    "Mensagens Realtime:",
                    status
                );
            });


    /* ---------------------------------------------
       ALTERAÇÕES NAS CONVERSAS
    --------------------------------------------- */

    estado.canalConversas =
        supabaseClient
            .channel(
                "conversas-inbox-" +
                estado.usuarioAtual.id
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "conversas"
                },
                function (payload) {

                    processarAlteracaoConversa(
                        payload
                    );
                }
            )
            .subscribe(function (status) {

                console.log(
                    "Conversas Realtime:",
                    status
                );
            });
}


/* =====================================================
   PROCESSAR NOVA MENSAGEM
===================================================== */

async function processarNovaMensagem(mensagem) {

    if (!mensagem) {
        return;
    }


    /* ---------------------------------------------
       IGNORAR MENSAGENS DE OUTRAS CONVERSAS
       QUE NÃO ENVOLVEM O USUÁRIO.

       O RLS já protege os dados, mas a verificação
       evita processamento desnecessário.
    --------------------------------------------- */

    const conversaExistente =
        estado.conversas.find(function (conversa) {

            return conversa.id ===
                mensagem.conversa_id;
        });


    if (!conversaExistente) {

        await recarregarConversasSilenciosamente();

        return;
    }


    /* ---------------------------------------------
       ATUALIZAR A CONVERSA EXISTENTE
    --------------------------------------------- */

    conversaExistente.ultimaMensagem =
        mensagem;


    if (
        mensagem.remetente_id !==
        estado.usuarioAtual.id &&
        mensagem.lida === false
    ) {

        conversaExistente.naoLidas =
            Number(
                conversaExistente.naoLidas || 0
            ) + 1;
    }


    conversaExistente.updated_at =
        mensagem.created_at;


    /* ---------------------------------------------
       REORDENAR
    --------------------------------------------- */

    estado.conversas.sort(
        ordenarConversas
    );


    aplicarFiltros();
}


/* =====================================================
   PROCESSAR ALTERAÇÃO DE CONVERSA
===================================================== */

async function processarAlteracaoConversa(payload) {

    if (!payload) {
        return;
    }


    const conversaAtualizada =
        payload.new;


    if (!conversaAtualizada?.id) {
        return;
    }


    const pertenceAoUsuario =
        conversaAtualizada.contratante_id ===
            estado.usuarioAtual.id ||
        conversaAtualizada.contratado_id ===
            estado.usuarioAtual.id;


    if (!pertenceAoUsuario) {
        return;
    }


    const indice =
        estado.conversas.findIndex(
            function (conversa) {

                return conversa.id ===
                    conversaAtualizada.id;
            }
        );


    /* ---------------------------------------------
       CONVERSA NOVA
    --------------------------------------------- */

    if (indice === -1) {

        await recarregarConversasSilenciosamente();

        return;
    }


    /* ---------------------------------------------
       ATUALIZAR CAMPOS
    --------------------------------------------- */

    estado.conversas[indice] = {
        ...estado.conversas[indice],
        ...conversaAtualizada
    };


    estado.conversas.sort(
        ordenarConversas
    );


    aplicarFiltros();
}


/* =====================================================
   RECARREGAR SILENCIOSAMENTE
===================================================== */

async function recarregarConversasSilenciosamente() {

    try {

        await carregarConversas();

    } catch (erro) {

        console.error(
            "Mensagens: erro ao atualizar conversas:",
            erro
        );
    }
}


/* =====================================================
   ORDENAR CONVERSAS
===================================================== */

function ordenarConversas(a, b) {

    const dataA =
        new Date(
            a.updated_at ||
            a.created_at ||
            0
        ).getTime();

    const dataB =
        new Date(
            b.updated_at ||
            b.created_at ||
            0
        ).getTime();

    return dataB - dataA;
}


/* =====================================================
   REMOVER REALTIME
===================================================== */

function removerRealtime() {

    if (estado.canalMensagens) {

        supabaseClient.removeChannel(
            estado.canalMensagens
        );

        estado.canalMensagens = null;
    }


    if (estado.canalConversas) {

        supabaseClient.removeChannel(
            estado.canalConversas
        );

        estado.canalConversas = null;
    }
}


/* =====================================================
   FORMATAÇÃO DE HORÁRIO
===================================================== */

function formatarHorario(dataString) {

    if (!dataString) {
        return "";
    }


    const data =
        new Date(dataString);


    if (Number.isNaN(data.getTime())) {
        return "";
    }


    const agora =
        new Date();


    const mesmoDia =
        data.toDateString() ===
        agora.toDateString();


    if (mesmoDia) {

        return data.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    const diferenca =
        agora.getTime() -
        data.getTime();


    const seteDias =
        7 * 24 * 60 * 60 * 1000;


    if (
        diferenca >= 0 &&
        diferenca < seteDias
    ) {

        return data.toLocaleDateString(
            "pt-BR",
            {
                weekday: "short"
            }
        );
    }


    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit"
        }
    );
}


/* =====================================================
   ESTADOS VISUAIS
===================================================== */

function renderizarEstadoVazio(mensagem) {

    if (!elementos.lista) {
        return;
    }

    elementos.lista.innerHTML = "";


    const estadoVazio =
        document.createElement("div");

    estadoVazio.className =
        "conversations-empty";


    const titulo =
        document.createElement("strong");

    titulo.textContent =
        mensagem;


    estadoVazio.appendChild(
        titulo
    );


    elementos.lista.appendChild(
        estadoVazio
    );
}


function renderizarErro(mensagem) {

    if (!elementos.lista) {
        return;
    }

    elementos.lista.innerHTML = "";


    const erro =
        document.createElement("div");

    erro.className =
        "conversations-error";


    const texto =
        document.createElement("p");

    texto.textContent =
        mensagem;


    const botao =
        document.createElement("button");

    botao.type =
        "button";

    botao.textContent =
        "Tentar novamente";


    botao.addEventListener(
        "click",
        function () {

            carregarConversas();
        }
    );


    erro.appendChild(texto);
    erro.appendChild(botao);

    elementos.lista.appendChild(
        erro
    );
}


/* =====================================================
   FUNÇÕES GLOBAIS USADAS PELO HTML
===================================================== */

window.limparBusca =
    limparBusca;


window.filtrarConversas =
    function (filtro, elemento) {

        definirFiltro(
            filtro,
            elemento
        );
    };


window.abrirConversa =
    abrirConversa;


/* =====================================================
   NAVEGAÇÃO
===================================================== */

window.voltarPagina =
    function () {

        if (
            window.history.length > 1
        ) {

            window.history.back();

        } else {

            window.location.href =
                "index.html";
        }
    };


window.novaMensagem =
    function () {

        console.log(
            "Mensagens: nova conversa ainda será implementada."
        );

        /*
         * A criação de conversa normalmente acontece
         * ao clicar em "Mensagem" no perfil público.
         *
         * Uma tela de busca de usuários pode ser adicionada
         * posteriormente sem misturar essa responsabilidade
         * com o chat individual.
         */
    };


/* =====================================================
   NAVEGAÇÃO DO MENU INFERIOR
===================================================== */

window.irParaInicio =
    function () {

        window.location.href =
            "index.html";
    };


window.irParaAnunciar =
    function () {

        window.location.href =
            "criar-anuncio.html";
    };


window.irParaMensagens =
    function () {

        window.location.href =
            "mensagens.html";
    };


window.irParaPerfil =
    function () {

        window.location.href =
            "perfil.html";
    };


/* =====================================================
   LIMPEZA AO SAIR DA PÁGINA
===================================================== */

window.addEventListener(
    "beforeunload",
    function () {

        removerRealtime();
    }
);


/* =====================================================
   INICIALIZAR
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializar
    );

} else {

    inicializar();
}


/* =====================================================
   EXPOR MÓDULO
===================================================== */

window.MusicalWorldMensagens = {

    inicializar,

    carregarConversas,

    abrirConversa,

    aplicarFiltros,

    limparBusca

};


})(window);
