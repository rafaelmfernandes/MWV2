(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — AÇÕES DO PERFIL PÚBLICO — TESTE

       Arquivo:
       js/apresentar-perfil-teste/ApresentarPerfilAcoes.js

       Responsabilidades:

       - Controlar voltar para o Index.
       - Compartilhar o perfil.
       - Copiar o link do perfil.
       - Iniciar conversa interna do MusicalWorld.
       - Localizar conversa existente.
       - Criar conversa quando necessário.
       - Abrir o Chat diretamente.
       - Executar a ação de contratação.
       - Inicializar as interações universais do perfil.
       - Controlar a topbar durante o scroll.
       - Abrir/fechar menu de ações.
       - Expandir mídia.
       - Entrar na conta.
       - Exibir mensagens/toasts.

       IMPORTANTE:

       A apresentação e os eventos dos botões principais do perfil
       são controlados exclusivamente por:

       js/apresentar-perfil-teste/ApresentarPerfilBotoes.js

       Este módulo continua fornecendo as ações:

       - abrirMensagens()
       - contratarPerfil()

       Curtidas e favoritos NÃO são armazenados neste módulo.

       Eles são controlados exclusivamente por:

       js/components/interacoes-perfil.js

       Isso garante que o estado seja compartilhado entre:

       - Index;
       - apresentação pública do perfil.

       ========================================================= */


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        elementos: {

            voltar: "btnVoltar",

            compartilhar: "btnCompartilhar",

            contratar: "btnContratar",

            mensagem: "btnMandarMensagem",

            mensagemFallback: "btnContato",

            curtir: "btnCurtir",

            comentar: "btnComentar",

            salvar: "btnSalvar",

            conta: "btnConta",

            menu: "btnMenu",

            menuContainer: "profileActionMenu",

            menuFechar: "btnFecharMenu",

            expandir: "btnExpandir",

            toast: "toast"

        },


        paginas: {

            index: "index.html",

            chat: "chat.html",

            mensagens: "mensagens.html",

            contratacao: "contratacao.html",

            login: "login.html",

            conta: "conta.html"

        }

    };


    /* =========================================================
       ESTADO INTERNO
       ========================================================= */

    let estadoAtual = null;

    let abrindoConversa = false;

    let configurado = false;


    /* =========================================================
       OBTENÇÃO DE ELEMENTOS
       ========================================================= */

    function obterElemento(id) {

        if (!id) {

            return null;

        }


        return document.getElementById(id);

    }


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


        return String(valor).trim();

    }


    /* =========================================================
       NORMALIZAÇÃO DE TIPO
       ========================================================= */

    function normalizarTipo(tipo) {

        return normalizarTexto(tipo)

            .toLowerCase()

            .normalize("NFD")

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .replace(
                /[^a-z0-9]+/g,
                "_"
            )

            .replace(
                /^_+|_+$/g,
                "");

    }


    /* =========================================================
       OBTENÇÃO DOS DADOS DO PERFIL
       ========================================================= */

    function obterDados() {

        if (
            window.ApresentarPerfilDadosTeste &&
            typeof window.ApresentarPerfilDadosTeste.obterDados === "function"
        ) {

            return (
                window.ApresentarPerfilDadosTeste.obterDados() || {}
            );

        }


        return (
            estadoAtual &&
            estadoAtual.dados
        ) || {};

    }


    function obterUsuario() {

        const dados =
            obterDados();


        return dados.usuario || {};

    }


    function obterPerfil() {

        const dados =
            obterDados();


        return dados.perfil || {};

    }


    function obterPerfilArtista() {

        const dados =
            obterDados();


        return dados.perfilArtista || {};

    }


    /* =========================================================
       OBTENÇÃO DO ID DO PERFIL
       ========================================================= */

    function obterPerfilId() {

        if (
            window.ApresentarPerfilDadosTeste &&
            typeof window.ApresentarPerfilDadosTeste.obterPerfilId === "function"
        ) {

            const id =
                window.ApresentarPerfilDadosTeste.obterPerfilId();


            if (id) {

                return normalizarTexto(id);

            }

        }


        if (
            estadoAtual &&
            estadoAtual.perfilId
        ) {

            return normalizarTexto(
                estadoAtual.perfilId
            );

        }


        const perfil =
            obterPerfil();


        const perfilArtista =
            obterPerfilArtista();


        if (perfil.id) {

            return normalizarTexto(
                perfil.id
            );

        }


        if (perfilArtista.perfil_id) {

            return normalizarTexto(
                perfilArtista.perfil_id
            );

        }


        try {

            const parametros =
                new URLSearchParams(
                    window.location.search
                );


            const id =
                parametros.get("perfil_id") ||
                parametros.get("perfilId") ||
                parametros.get("id");


            if (id) {

                return normalizarTexto(id);

            }

        } catch (erro) {

            console.warn(
                "ApresentarPerfilAcoesTeste: erro ao ler URL.",
                erro
            );

        }


        return "";

    }


    /* =========================================================
       OBTENÇÃO DO ID DO USUÁRIO DONO DO PERFIL
       ========================================================= */

    function obterUsuarioIdPerfil() {

        const usuario =
            obterUsuario();


        const perfil =
            obterPerfil();


        const perfilArtista =
            obterPerfilArtista();


        const candidatos = [

            usuario.id,

            perfil.usuario_id,

            perfilArtista.usuario_id,

            perfil.user_id,

            perfilArtista.user_id

        ];


        for (const candidato of candidatos) {

            const valor =
                normalizarTexto(
                    candidato
                );


            if (valor) {

                return valor;

            }

        }


        return "";

    }


    /* =========================================================
       OBTENÇÃO DO TIPO DE PERFIL
       ========================================================= */

    function obterTipoPerfil() {

        if (
            window.ApresentarPerfilDadosTeste &&
            typeof window.ApresentarPerfilDadosTeste.obterTipoPerfil === "function"
        ) {

            const tipoDados =
                window.ApresentarPerfilDadosTeste.obterTipoPerfil();


            if (tipoDados) {

                return normalizarTipo(
                    typeof tipoDados === "object"
                        ? (
                            tipoDados.nome ||
                            tipoDados.tipo ||
                            tipoDados.slug ||
                            ""
                        )
                        : tipoDados
                );

            }

        }


        const dados =
            obterDados();


        const tipoPerfil =
            dados.tipoPerfil;


        if (tipoPerfil) {

            if (
                typeof tipoPerfil === "object"
            ) {

                return normalizarTipo(

                    tipoPerfil.nome ||
                    tipoPerfil.tipo ||
                    tipoPerfil.slug ||
                    ""

                );

            }


            return normalizarTipo(
                tipoPerfil
            );

        }


        const perfil =
            obterPerfil();


        if (perfil.tipo_perfil) {

            if (
                typeof perfil.tipo_perfil === "object"
            ) {

                return normalizarTipo(

                    perfil.tipo_perfil.nome ||
                    perfil.tipo_perfil.tipo ||
                    perfil.tipo_perfil.slug ||
                    ""

                );

            }


            return normalizarTipo(
                perfil.tipo_perfil
            );

        }


        try {

            const parametros =
                new URLSearchParams(
                    window.location.search
                );


            const tipo =
                parametros.get("tipo");


            if (tipo) {

                return normalizarTipo(
                    tipo
                );

            }

        } catch (erro) {

            console.warn(
                "ApresentarPerfilAcoesTeste: não foi possível obter tipo da URL.",
                erro
            );

        }


        return "";

    }


    /* =========================================================
       NOME DO PERFIL
       ========================================================= */

    function obterNomePerfil() {

        const usuario =
            obterUsuario();


        const perfil =
            obterPerfil();


        const perfilArtista =
            obterPerfilArtista();


        return normalizarTexto(

            perfilArtista.nome_artistico ||
            perfilArtista.nome_artistico_publico ||
            perfil.nome_artistico ||
            perfil.nome ||
            usuario.nome ||
            usuario.nome_completo ||
            "Perfil"

        );

    }


    /* =========================================================
       TOAST
       ========================================================= */

    function mostrarToast(mensagem) {

        const texto =
            normalizarTexto(
                mensagem
            );


        if (!texto) {

            return;

        }


        const toast =
            obterElemento(
                CONFIG.elementos.toast
            );


        if (!toast) {

            console.log(
                "MusicalWorld:",
                texto
            );


            return;

        }


        toast.textContent =
            texto;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timeout
        );


        toast._timeout =
            setTimeout(

                function () {

                    toast.classList.remove(
                        "show"
                    );

                },

                3000

            );

    }


    /* =========================================================
       INICIALIZAR INTERAÇÕES UNIVERSAIS
       ========================================================= */

    async function inicializarInteracoesPerfil() {

        const perfilId =
            obterPerfilId();


        const btnCurtir =
            obterElemento(
                CONFIG.elementos.curtir
            );


        const btnSalvar =
            obterElemento(
                CONFIG.elementos.salvar
            );


        /*
         * A topbar é o container universal da página pública.
         *
         * O perfil_id é gravado diretamente no elemento para
         * que o módulo InteracoesPerfil consiga trabalhar sem
         * depender do módulo de dados.
         */

        const topbar =
            btnCurtir?.closest(".topbar") ||
            btnSalvar?.closest(".topbar") ||
            document.querySelector(".topbar");


        if (!topbar) {

            console.warn(
                "ApresentarPerfilAcoesTeste: topbar das interações não encontrada."
            );


            return;

        }


        if (!perfilId) {

            console.warn(
                "ApresentarPerfilAcoesTeste: perfil_id não encontrado para as interações."
            );


            return;

        }


        topbar.dataset.interacoesPerfil =
            "true";


        topbar.dataset.perfilId =
            perfilId;


        /*
         * Marca especificamente os botões que pertencem
         * ao sistema universal de interações.
         */

        if (btnCurtir) {

            btnCurtir.dataset.interacaoPerfilBotao =
                "true";

            btnCurtir.dataset.interacao =
                "curtir";

        }


        if (btnSalvar) {

            btnSalvar.dataset.interacaoPerfilBotao =
                "true";

            btnSalvar.dataset.interacao =
                "salvar";

        }


        /*
         * O módulo universal consulta o Supabase e atualiza
         * imediatamente o estado visual:
         *
         * - curtido;
         * - não curtido;
         * - salvo;
         * - não salvo.
         */

        if (
            window.InteracoesPerfil &&
            typeof window.InteracoesPerfil.inicializarElemento === "function"
        ) {

            await window
                .InteracoesPerfil
                .inicializarElemento(
                    topbar
                );


            console.log(
                "ApresentarPerfilAcoesTeste: interações universais inicializadas.",
                {
                    perfilId
                }
            );


            return;

        }


        console.warn(
            "ApresentarPerfilAcoesTeste: módulo InteracoesPerfil não foi carregado."
        );

    }


    /* =========================================================
       VOLTAR
       ========================================================= */

    function voltar() {

        console.log(
            "ApresentarPerfilAcoesTeste: voltando para o Index."
        );


        window.location.assign(
            CONFIG.paginas.index
        );

    }


    /* =========================================================
       LINK DO PERFIL
       ========================================================= */

    function obterLinkPerfil() {

        return window.location.href;

    }


    /* =========================================================
       COPIAR LINK
       ========================================================= */

    async function copiarLink() {

        const link =
            obterLinkPerfil();


        try {

            if (
                navigator.clipboard &&
                typeof navigator.clipboard.writeText === "function"
            ) {

                await navigator.clipboard.writeText(
                    link
                );


                mostrarToast(
                    "Link do perfil copiado."
                );


                return true;

            }

        } catch (erro) {

            console.warn(
                "ApresentarPerfilAcoesTeste: Clipboard API indisponível.",
                erro
            );

        }


        try {

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value =
                link;


            textarea.style.position =
                "fixed";


            textarea.style.left =
                "-9999px";


            textarea.style.top =
                "-9999px";


            document.body.appendChild(
                textarea
            );


            textarea.focus();

            textarea.select();


            const sucesso =
                document.execCommand(
                    "copy"
                );


            textarea.remove();


            if (sucesso) {

                mostrarToast(
                    "Link do perfil copiado."
                );


                return true;

            }

        } catch (erro) {

            console.error(
                "ApresentarPerfilAcoesTeste: erro ao copiar link.",
                erro
            );

        }


        mostrarToast(
            "Não foi possível copiar o link."
        );


        return false;

    }


    /* =========================================================
       COMPARTILHAR PERFIL
       ========================================================= */

    async function compartilharPerfil() {

        const nome =
            obterNomePerfil();


        const link =
            obterLinkPerfil();


        if (
            navigator.share
        ) {

            try {

                await navigator.share({

                    title:
                        nome,

                    text:
                        "Confira o perfil de " +
                        nome +
                        " no MusicalWorld.",

                    url:
                        link

                });


                return true;

            } catch (erro) {

                if (
                    erro &&
                    erro.name === "AbortError"
                ) {

                    return false;

                }


                console.warn(
                    "ApresentarPerfilAcoesTeste: erro ao compartilhar.",
                    erro
                );

            }

        }


        return copiarLink();

    }


    /* =========================================================
       SUPABASE
       ========================================================= */

    function obterSupabase() {

        if (
            window.supabaseClient
        ) {

            return window.supabaseClient;

        }


        if (
            window._supabase
        ) {

            return window._supabase;

        }


        if (
            window.supabase &&
            typeof window.supabase.from === "function"
        ) {

            return window.supabase;

        }


        console.error(
            "ApresentarPerfilAcoesTeste: cliente Supabase não encontrado."
        );


        return null;

    }


    /* =========================================================
       USUÁRIO AUTENTICADO
       ========================================================= */

    async function obterUsuarioAutenticado() {

        if (
            window.Sessao &&
            typeof window.Sessao.usuarioAtual === "function"
        ) {

            try {

                return await window.Sessao.usuarioAtual();

            } catch (erro) {

                console.warn(
                    "ApresentarPerfilAcoesTeste: Sessao.usuarioAtual falhou.",
                    erro
                );

            }

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return null;

        }


        try {

            const resultado =
                await supabase.auth.getUser();


            if (
                resultado.error
            ) {

                console.error(
                    "ApresentarPerfilAcoesTeste: erro ao obter usuário autenticado.",
                    resultado.error
                );


                return null;

            }


            return resultado.data?.user || null;

        } catch (erro) {

            console.error(
                "ApresentarPerfilAcoesTeste: erro inesperado ao obter usuário.",
                erro
            );


            return null;

        }

    }


    /* =========================================================
       LOCALIZAR CONVERSA EXISTENTE
       ========================================================= */

    async function localizarConversa(
        usuarioAtualId,
        usuarioPerfilId
    ) {

        const supabase =
            obterSupabase();


        if (!supabase) {

            return null;

        }


        console.log(
            "ApresentarPerfilAcoesTeste: procurando conversa.",
            {
                usuarioAtualId,
                usuarioPerfilId
            }
        );


        const resultadoDireto =
            await supabase
                .from("conversas")
                .select(
                    "id, contratante_id, contratado_id, contratacao_id, servico_id, created_at, updated_at"
                )
                .eq(
                    "contratante_id",
                    usuarioAtualId
                )
                .eq(
                    "contratado_id",
                    usuarioPerfilId
                )
                .order(
                    "updated_at",
                    {
                        ascending: false
                    }
                )
                .limit(1);


        if (
            resultadoDireto.error
        ) {

            console.error(
                "ApresentarPerfilAcoesTeste: erro na busca direta.",
                resultadoDireto.error
            );


            throw resultadoDireto.error;

        }


        if (
            resultadoDireto.data &&
            resultadoDireto.data.length > 0
        ) {

            return resultadoDireto.data[0];

        }


        const resultadoInverso =
            await supabase
                .from("conversas")
                .select(
                    "id, contratante_id, contratado_id, contratacao_id, servico_id, created_at, updated_at"
                )
                .eq(
                    "contratante_id",
                    usuarioPerfilId
                )
                .eq(
                    "contratado_id",
                    usuarioAtualId
                )
                .order(
                    "updated_at",
                    {
                        ascending: false
                    }
                )
                .limit(1);


        if (
            resultadoInverso.error
        ) {

            console.error(
                "ApresentarPerfilAcoesTeste: erro na busca inversa.",
                resultadoInverso.error
            );


            throw resultadoInverso.error;

        }


        if (
            resultadoInverso.data &&
            resultadoInverso.data.length > 0
        ) {

            return resultadoInverso.data[0];

        }


        return null;

    }


    /* =========================================================
       CRIAR CONVERSA
       ========================================================= */

    async function criarConversa(
        usuarioAtualId,
        usuarioPerfilId
    ) {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Supabase não está disponível."
            );

        }


        console.log(
            "ApresentarPerfilAcoesTeste: criando conversa."
        );


        const resultado =
            await supabase
                .from("conversas")
                .insert({

                    contratante_id:
                        usuarioAtualId,

                    contratado_id:
                        usuarioPerfilId

                })
                .select(
                    "id, contratante_id, contratado_id, contratacao_id, servico_id, created_at, updated_at"
                )
                .single();


        if (
            resultado.error
        ) {

            console.error(
                "ApresentarPerfilAcoesTeste: erro ao criar conversa.",
                resultado.error
            );


            throw resultado.error;

        }


        return resultado.data;

    }


    /* =========================================================
       ABRIR MENSAGENS
       ========================================================= */

    async function abrirMensagens() {

        if (
            abrindoConversa
        ) {

            return false;

        }


        abrindoConversa =
            true;


        const btnMensagem =
            obterElemento(
                CONFIG.elementos.mensagem
            ) ||
            obterElemento(
                CONFIG.elementos.mensagemFallback
            );


        try {

            console.log(
                "ApresentarPerfilAcoesTeste: iniciando mensagem."
            );


            const usuarioAutenticado =
                await obterUsuarioAutenticado();


            if (!usuarioAutenticado) {

                mostrarToast(
                    "Faça login para enviar uma mensagem."
                );


                return false;

            }


            const usuarioAtualId =
                normalizarTexto(
                    usuarioAutenticado.id
                );


            if (!usuarioAtualId) {

                mostrarToast(
                    "Não foi possível identificar sua conta."
                );


                return false;

            }


            const usuarioPerfilId =
                obterUsuarioIdPerfil();


            if (!usuarioPerfilId) {

                console.error(
                    "ApresentarPerfilAcoesTeste: usuário do perfil não encontrado.",
                    {
                        dados: obterDados()
                    }
                );


                mostrarToast(
                    "Não foi possível identificar o usuário deste perfil."
                );


                return false;

            }


            if (
                usuarioAtualId ===
                usuarioPerfilId
            ) {

                mostrarToast(
                    "Você não pode iniciar uma conversa com seu próprio perfil."
                );


                return false;

            }


            if (btnMensagem) {

                btnMensagem.disabled =
                    true;


                btnMensagem.setAttribute(
                    "aria-busy",
                    "true"
                );

            }


            let conversa =
                await localizarConversa(
                    usuarioAtualId,
                    usuarioPerfilId
                );


            if (!conversa) {

                conversa =
                    await criarConversa(
                        usuarioAtualId,
                        usuarioPerfilId
                    );

            }


            if (
                !conversa ||
                !conversa.id
            ) {

                throw new Error(
                    "A conversa não possui um ID válido."
                );

            }


            const parametros =
                new URLSearchParams();


            parametros.set(
                "id",
                conversa.id
            );


            const nomePerfil =
                obterNomePerfil();


            if (nomePerfil) {

                parametros.set(
                    "nome",
                    nomePerfil
                );

            }


            const destino =
                CONFIG.paginas.chat +
                "?" +
                parametros.toString();


            console.log(
                "ApresentarPerfilAcoesTeste: abrindo chat.",
                destino
            );


            window.location.assign(
                destino
            );


            return true;

        } catch (erro) {

            console.error(
                "ApresentarPerfilAcoesTeste: erro ao abrir conversa.",
                erro
            );


            const mensagemErro =
                String(
                    erro?.message || ""
                ).toLowerCase();


            if (
                erro?.code === "42501" ||
                erro?.code === "PGRST301" ||
                mensagemErro.includes(
                    "row-level security"
                )
            ) {

                mostrarToast(
                    "Não foi possível acessar a conversa. Verifique as permissões da sua conta."
                );

            } else {

                mostrarToast(
                    "Não foi possível abrir a conversa. Tente novamente."
                );

            }


            return false;

        } finally {

            abrindoConversa =
                false;


            if (btnMensagem) {

                btnMensagem.disabled =
                    false;


                btnMensagem.removeAttribute(
                    "aria-busy"
                );

            }

        }

    }


    /* =========================================================
       CONTRATAR
       ========================================================= */

    function contratarPerfil() {

        console.log(
            "ApresentarPerfilAcoesTeste: botão Contratar acionado."
        );


        const perfilId =
            obterPerfilId();


        const tipo =
            obterTipoPerfil();


        console.log(
            "ApresentarPerfilAcoesTeste: dados para contratação.",
            {
                perfilId,
                tipo
            }
        );


        if (!perfilId) {

            console.error(
                "ApresentarPerfilAcoesTeste: perfil_id não encontrado."
            );


            mostrarToast(
                "Não foi possível identificar este perfil."
            );


            return false;

        }


        const parametros =
            new URLSearchParams();


        parametros.set(
            "perfil_id",
            perfilId
        );


        if (tipo) {

            parametros.set(
                "tipo",
                tipo
            );

        }


        const destino =
            CONFIG.paginas.contratacao +
            "?" +
            parametros.toString();


        const btnContratar =
            obterElemento(
                CONFIG.elementos.contratar
            );


        if (btnContratar) {

            btnContratar.disabled =
                true;


            btnContratar.setAttribute(
                "aria-busy",
                "true"
            );

        }


        console.log(
            "ApresentarPerfilAcoesTeste: redirecionando para contratação.",
            destino
        );


        window.location.assign(
            destino
        );


        return true;

    }


    /* =========================================================
       CURTIR

       A persistência NÃO é feita aqui.

       O estado é controlado exclusivamente pelo:

       window.InteracoesPerfil

       Esta função permanece na API por compatibilidade
       com chamadas externas existentes.
       ========================================================= */

    async function curtirPerfil() {

        const btnCurtir =
            obterElemento(
                CONFIG.elementos.curtir
            );


        if (!btnCurtir) {

            return false;

        }


        const topbar =
            btnCurtir.closest(
                ".topbar"
            );


        if (!topbar) {

            return false;

        }


        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            mostrarToast(
                "Não foi possível identificar este perfil."
            );


            return false;

        }


        topbar.dataset.interacoesPerfil =
            "true";


        topbar.dataset.perfilId =
            perfilId;


        btnCurtir.dataset.interacaoPerfilBotao =
            "true";


        btnCurtir.dataset.interacao =
            "curtir";


        if (
            window.InteracoesPerfil &&
            typeof window.InteracoesPerfil.alternarCurtida === "function"
        ) {

            await window
                .InteracoesPerfil
                .alternarCurtida(
                    topbar
                );


            return true;

        }


        console.warn(
            "ApresentarPerfilAcoesTeste: InteracoesPerfil não disponível para Curtir."
        );


        return false;

    }


    /* =========================================================
       SALVAR

       Assim como a curtida, a persistência é feita pelo
       módulo universal.
       ========================================================= */

    async function salvarPerfil() {

        const btnSalvar =
            obterElemento(
                CONFIG.elementos.salvar
            );


        if (!btnSalvar) {

            return false;

        }


        const topbar =
            btnSalvar.closest(
                ".topbar"
            );


        if (!topbar) {

            return false;

        }


        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            mostrarToast(
                "Não foi possível identificar este perfil."
            );


            return false;

        }


        topbar.dataset.interacoesPerfil =
            "true";


        topbar.dataset.perfilId =
            perfilId;


        btnSalvar.dataset.interacaoPerfilBotao =
            "true";


        btnSalvar.dataset.interacao =
            "salvar";


        if (
            window.InteracoesPerfil &&
            typeof window.InteracoesPerfil.alternarFavorito === "function"
        ) {

            await window
                .InteracoesPerfil
                .alternarFavorito(
                    topbar
                );


            return true;

        }


        console.warn(
            "ApresentarPerfilAcoesTeste: InteracoesPerfil não disponível para Salvar."
        );


        return false;

    }


    /* =========================================================
       COMENTAR
       ========================================================= */

    function comentarPerfil() {

        console.log(
            "ApresentarPerfilAcoesTeste: Comentar acionado."
        );


        mostrarToast(
            "Comentários serão disponibilizados em breve."
        );


        return false;

    }


    /* =========================================================
       CONTA / LOGIN
       ========================================================= */

    async function entrarNaConta() {

        const usuario =
            await obterUsuarioAutenticado();


        if (usuario) {

            window.location.assign(
                CONFIG.paginas.conta
            );


            return true;

        }


        window.location.assign(
            CONFIG.paginas.login
        );


        return false;

    }


    /* =========================================================
       MENU DE AÇÕES
       ========================================================= */

    function obterMenu() {

        return obterElemento(
            CONFIG.elementos.menuContainer
        );

    }


    function abrirMenu() {

        const menu =
            obterMenu();


        if (!menu) {

            return;

        }


        menu.classList.add(
            "is-open"
        );


        menu.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function fecharMenu() {

        const menu =
            obterMenu();


        if (!menu) {

            return;

        }


        menu.classList.remove(
            "is-open"
        );


        menu.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function alternarMenu() {

        const menu =
            obterMenu();


        if (!menu) {

            return;

        }


        if (
            menu.classList.contains(
                "is-open"
            )
        ) {

            fecharMenu();

        } else {

            abrirMenu();

        }

    }


    /* =========================================================
       EXPANDIR MÍDIA
       ========================================================= */

    function expandirMidia() {

        if (
            window.ApresentarPerfilPortfolioTeste &&
            typeof window.ApresentarPerfilPortfolioTeste.expandirAtual === "function"
        ) {

            window
                .ApresentarPerfilPortfolioTeste
                .expandirAtual();


            return true;

        }


        const media =
            obterElemento(
                "profileMedia"
            );


        if (!media) {

            return false;

        }


        if (
            typeof media.requestFullscreen === "function"
        ) {

            media.requestFullscreen()
                .catch(
                    function (erro) {

                        console.warn(
                            "ApresentarPerfilAcoesTeste: não foi possível abrir fullscreen.",
                            erro
                        );

                    }
                );


            return true;

        }


        return false;

    }


    /* =========================================================
       CONTROLE DA TOPBAR DURANTE O SCROLL
       =========================================================

       Comportamento:

       - No topo da página:
         a topbar permanece sempre visível.

       - Ao rolar para baixo:
         a topbar desaparece.

       - Ao rolar para cima:
         a topbar reaparece.

       - Movimentos menores que 6px:
         são ignorados para evitar oscilações.

       A topbar continua sendo controlada somente nesta página.
       ========================================================= */

    function inicializarTopbarScroll() {

        const topbar =
            document.querySelector(
                ".topbar"
            );


        if (!topbar) {

            console.warn(
                "ApresentarPerfilAcoesTeste: topbar não encontrada para controle de scroll."
            );


            return;

        }


        let ultimaPosicao =
            window.scrollY;


        const tolerancia =
            6;


        topbar.style.transition =
            "transform 0.25s ease";


        topbar.style.willChange =
            "transform";


        function controlarScroll() {

            const posicaoAtual =
                window.scrollY;


            const diferenca =
                posicaoAtual -
                ultimaPosicao;


            /*
             * No topo da página a topbar permanece
             * sempre visível.
             */

            if (
                posicaoAtual <= 5
            ) {

                topbar.style.transform =
                    "translateY(0)";


                ultimaPosicao =
                    posicaoAtual;


                return;

            }


            /*
             * Ignora movimentos menores que a
             * tolerância definida.
             */

            if (
                Math.abs(diferenca) <
                tolerancia
            ) {

                return;

            }


            /*
             * Rolando para baixo:
             * esconde a topbar.
             */

            if (
                diferenca > 0
            ) {

                topbar.style.transform =
                    "translateY(-100%)";

            }


            /*
             * Rolando para cima:
             * mostra a topbar.
             */

            else {

                topbar.style.transform =
                    "translateY(0)";

            }


            ultimaPosicao =
                posicaoAtual;

        }


        window.addEventListener(
            "scroll",
            controlarScroll,
            {
                passive: true
            }
        );

    }


    /* =========================================================
       CONFIGURAÇÃO DOS EVENTOS
       ========================================================= */

    function configurarEventos() {

        if (
            configurado
        ) {

            return;

        }


        const btnVoltar =
            obterElemento(
                CONFIG.elementos.voltar
            );


        const btnCompartilhar =
            obterElemento(
                CONFIG.elementos.compartilhar
            );


        const btnConta =
            obterElemento(
                CONFIG.elementos.conta
            );


        const btnMenu =
            obterElemento(
                CONFIG.elementos.menu
            );


        const btnMenuFechar =
            obterElemento(
                CONFIG.elementos.menuFechar
            );


        const btnExpandir =
            obterElemento(
                CONFIG.elementos.expandir
            );


        /* -----------------------------------------------------
           VOLTAR
           ----------------------------------------------------- */

        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    voltar();

                }
            );

        }


        /* -----------------------------------------------------
           COMPARTILHAR
           ----------------------------------------------------- */

        if (btnCompartilhar) {

            btnCompartilhar.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    compartilharPerfil();

                }
            );

        }


        /*
         * -----------------------------------------------------
         * BOTÕES PRINCIPAIS DO PERFIL
         * -----------------------------------------------------
         *
         * Os botões:
         *
         * - Mensagem;
         * - Contratar;
         * - Enviar proposta;
         *
         * são controlados exclusivamente pelo:
         *
         * js/apresentar-perfil-teste/ApresentarPerfilBotoes.js
         *
         * As funções abrirMensagens() e contratarPerfil()
         * permanecem neste módulo como ações reutilizáveis.
         */


        /*
         * -----------------------------------------------------
         * CURTIR E SALVAR
         * -----------------------------------------------------
         *
         * Não adicionamos listeners diretamente aqui.
         *
         * O módulo InteracoesPerfil utiliza delegação global
         * para funcionar tanto com os cards dinâmicos do Index
         * quanto com a topbar desta página.
         */


        /* -----------------------------------------------------
           CONTA
           ----------------------------------------------------- */

        if (btnConta) {

            btnConta.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    entrarNaConta();

                }
            );

        }


        /* -----------------------------------------------------
           MENU
           ----------------------------------------------------- */

        if (btnMenu) {

            btnMenu.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();

                    alternarMenu();

                }
            );

        }


        if (btnMenuFechar) {

            btnMenuFechar.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    fecharMenu();

                }
            );

        }


        /* -----------------------------------------------------
           FECHAR MENU AO CLICAR FORA
           ----------------------------------------------------- */

        document.addEventListener(
            "click",
            function (evento) {

                const menu =
                    obterMenu();


                if (!menu) {

                    return;

                }


                if (
                    !menu.classList.contains(
                        "is-open"
                    )
                ) {

                    return;

                }


                if (
                    menu.contains(
                        evento.target
                    )
                ) {

                    return;

                }


                const botaoMenu =
                    obterElemento(
                        CONFIG.elementos.menu
                    );


                if (
                    botaoMenu &&
                    botaoMenu.contains(
                        evento.target
                    )
                ) {

                    return;

                }


                fecharMenu();

            }
        );


        /* -----------------------------------------------------
           EXPANDIR MÍDIA
           ----------------------------------------------------- */

        if (btnExpandir) {

            btnExpandir.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();

                    expandirMidia();

                }
            );

        }


        configurado =
            true;


        console.log(
            "ApresentarPerfilAcoesTeste: eventos configurados."
        );

    }


    /* =========================================================
       CONFIGURAR ESTADO
       ========================================================= */

    function configurar(estado) {

        estadoAtual =
            estado || null;


        configurarEventos();

    }


    /* =========================================================
       ATUALIZAR ESTADO
       ========================================================= */

    function atualizarEstado(estado) {

        estadoAtual =
            estado || null;

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    async function inicializar() {

        if (
            document.readyState === "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                async function () {

                    configurarEventos();

                    inicializarTopbarScroll();

                    await inicializarInteracoesPerfil();

                },
                {
                    once: true
                }
            );


            return;

        }


        configurarEventos();

        inicializarTopbarScroll();

        await inicializarInteracoesPerfil();

    }


    /* =========================================================
       LIMPEZA
       ========================================================= */

    function limpar() {

        estadoAtual =
            null;


        abrindoConversa =
            false;


        configurado =
            false;

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ApresentarPerfilAcoesTeste = {

        inicializar,

        configurar,

        atualizarEstado,

        limpar,

        voltar,

        compartilharPerfil,

        copiarLink,

        abrirMensagens,

        contratarPerfil,

        curtirPerfil,

        salvarPerfil,

        comentarPerfil,

        entrarNaConta,

        abrirMenu,

        fecharMenu,

        alternarMenu,

        expandirMidia,

        mostrarToast,

        obterLinkPerfil,

        obterNomePerfil,

        obterTipoPerfil,

        obterPerfilId,

        obterUsuarioIdPerfil,

        inicializarInteracoesPerfil

    };


    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ========================================================= */

    inicializar();


    console.log(
        "ApresentarPerfilAcoesTeste: módulo carregado."
    );


})(window);