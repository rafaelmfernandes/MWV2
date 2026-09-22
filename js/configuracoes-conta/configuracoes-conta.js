/* =========================================================
   MUSICALWORLD — CONFIGURAÇÕES DA CONTA

   Arquivo:
   js/configuracoes-conta/configuracoes-conta.js

   Responsabilidade:
   - Inicializar a página.
   - Identificar o usuário autenticado.
   - Carregar nome, foto e tipo de perfil.
   - Controlar a navegação de retorno.
   - Controlar o logout.
   - Inicializar os ícones Lucide.
   ========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        rotas: {

            perfil: "apresentar-perfil.html",

            login: "login.html"

        }

    };


    /* =========================================================
       ESTADO
       ========================================================= */

    const estado = {

        usuario: null,

        perfil: null,

        tipoPerfil: null

    };


    /* =========================================================
       ELEMENTOS
       ========================================================= */

    const elementos = {

        btnVoltar:
            document.getElementById("btnVoltar"),

        btnSair:
            document.getElementById("btnSair"),

        usuarioFoto:
            document.getElementById("usuarioFoto"),

        usuarioFotoPlaceholder:
            document.getElementById("usuarioFotoPlaceholder"),

        usuarioNome:
            document.getElementById("usuarioNome"),

        usuarioTipo:
            document.getElementById("usuarioTipo"),

        linkEditarPerfil:
            document.getElementById("linkEditarPerfil")

    };


    /* =========================================================
       CLIENTE SUPABASE
       ========================================================= */

    function obterClienteSupabase() {

        /*
         * O projeto MusicalWorld possui um cliente Supabase
         * compartilhado.
         *
         * Tentamos primeiro os nomes normalmente utilizados
         * pelo projeto para evitar criar uma segunda instância.
         */

        if (
            window.MusicalWorldSupabase &&
            typeof window.MusicalWorldSupabase.auth === "object"
        ) {
            return window.MusicalWorldSupabase;
        }


        if (
            window.supabaseClient &&
            typeof window.supabaseClient.auth === "object"
        ) {
            return window.supabaseClient;
        }


        if (
            window.MusicalWorld &&
            window.MusicalWorld.supabase &&
            typeof window.MusicalWorld.supabase.auth === "object"
        ) {
            return window.MusicalWorld.supabase;
        }


        return null;
    }


    /* =========================================================
       NORMALIZAÇÃO
       ========================================================= */

    function normalizarTexto(valor, fallback) {

        if (
            valor === null ||
            valor === undefined ||
            String(valor).trim() === ""
        ) {
            return fallback;
        }

        return String(valor).trim();
    }


    /* =========================================================
       FOTO
       ========================================================= */

    function exibirFoto(url) {

        const foto = normalizarTexto(url, "");


        if (!foto) {

            elementos.usuarioFoto.style.display = "none";

            elementos.usuarioFotoPlaceholder.style.display = "flex";

            return;
        }


        elementos.usuarioFoto.src = foto;

        elementos.usuarioFoto.alt =
            `Foto de ${normalizarTexto(
                elementos.usuarioNome.textContent,
                "usuário"
            )}`;


        elementos.usuarioFoto.style.display = "block";

        elementos.usuarioFotoPlaceholder.style.display = "none";
    }


    /* =========================================================
       FALLBACK DE FOTO
       ========================================================= */

    function configurarFallbackFoto() {

        elementos.usuarioFoto.addEventListener(
            "error",
            function () {

                elementos.usuarioFoto.style.display = "none";

                elementos.usuarioFotoPlaceholder.style.display = "flex";

            }
        );
    }


    /* =========================================================
       CARREGAR DADOS DO USUÁRIO
       ========================================================= */

    async function carregarUsuario() {

        const supabase = obterClienteSupabase();


        if (!supabase) {

            console.error(
                "MusicalWorldConfigConta: cliente Supabase não encontrado."
            );

            exibirDadosFallback();

            return;
        }


        try {

            const {
                data: authData,
                error: authError
            } = await supabase.auth.getUser();


            if (authError) {
                throw authError;
            }


            const usuario = authData?.user;


            if (!usuario) {

                window.location.href = CONFIG.rotas.login;

                return;
            }


            estado.usuario = usuario;


            await carregarPerfil(
                supabase,
                usuario.id
            );


        } catch (erro) {

            console.error(
                "MusicalWorldConfigConta: erro ao carregar usuário:",
                erro
            );

            exibirDadosFallback();

        }

    }


    /* =========================================================
       CARREGAR PERFIL
       ========================================================= */

    async function carregarPerfil(
        supabase,
        usuarioId
    ) {

        try {

            /*
             * Primeiro buscamos o perfil principal.
             */

            const {
                data: perfil,
                error: perfilError
            } = await supabase
                .from("perfis")
                .select(`
                    id,
                    usuario_id,
                    tipo_perfil,
                    descricao,
                    perfil_publicado
                `)
                .eq("usuario_id", usuarioId)
                .maybeSingle();


            if (perfilError) {
                throw perfilError;
            }


            estado.perfil = perfil;


            /*
             * Dados básicos do usuário.
             */

            const {
                data: usuarioData,
                error: usuarioError
            } = await supabase
                .from("usuarios")
                .select(`
                    id,
                    nome,
                    email
                `)
                .eq("id", usuarioId)
                .maybeSingle();


            if (usuarioError) {
                throw usuarioError;
            }


            /*
             * Perfil artístico.
             */

            let perfilArtista = null;


            if (perfil?.id) {

                const {
                    data: artistaData,
                    error: artistaError
                } = await supabase
                    .from("perfis_artistas")
                    .select(`
                        tipo_artista,
                        foto_url
                    `)
                    .eq("perfil_id", perfil.id)
                    .maybeSingle();


                /*
                 * Nem todo usuário precisa possuir perfil artístico.
                 * Por isso não interrompemos a página se não existir.
                 */

                if (artistaError) {

                    console.warn(
                        "MusicalWorldConfigConta: perfil artístico não encontrado:",
                        artistaError
                    );

                } else {

                    perfilArtista = artistaData;

                }

            }


            /*
             * Tipo de perfil.
             */

            let tipoPerfil = null;


            if (perfil?.tipo_perfil) {

                const {
                    data: tipoData,
                    error: tipoError
                } = await supabase
                    .from("tipos_perfil")
                    .select(`
                        nome
                    `)
                    .eq("id", perfil.tipo_perfil)
                    .maybeSingle();


                if (!tipoError) {

                    tipoPerfil = tipoData;

                }

            }


            estado.tipoPerfil = tipoPerfil;


            atualizarInterface({
                usuario: usuarioData,
                perfil: perfil,
                artista: perfilArtista,
                tipo: tipoPerfil
            });


        } catch (erro) {

            console.error(
                "MusicalWorldConfigConta: erro ao carregar perfil:",
                erro
            );

            /*
             * Mesmo que alguma informação complementar
             * falhe, tentamos mostrar os dados disponíveis
             * da sessão.
             */

            atualizarInterface({
                usuario: null,
                perfil: estado.perfil,
                artista: null,
                tipo: null
            });

        }

    }


    /* =========================================================
       ATUALIZAR INTERFACE
       ========================================================= */

    function atualizarInterface(dados) {

        const usuario = dados.usuario || {};

        const perfil = dados.perfil || {};

        const artista = dados.artista || {};

        const tipo = dados.tipo || {};


        /*
         * Nome.
         */

        const nome = normalizarTexto(
            usuario.nome,
            estado.usuario?.user_metadata?.nome ||
            estado.usuario?.user_metadata?.name ||
            "Usuário"
        );


        elementos.usuarioNome.textContent = nome;


        /*
         * Tipo do perfil.
         */

        let nomeTipo =
            normalizarTexto(
                artista.tipo_artista,
                ""
            );


        if (!nomeTipo) {

            nomeTipo =
                normalizarTexto(
                    tipo.nome,
                    ""
                );

        }


        if (!nomeTipo) {

            nomeTipo =
                normalizarTexto(
                    perfil.tipo_perfil,
                    "Conta MusicalWorld"
                );

        }


        elementos.usuarioTipo.textContent = nomeTipo;


        /*
         * Foto.
         */

        const fotoUrl =
            normalizarTexto(
                artista.foto_url,
                estado.usuario?.user_metadata?.avatar_url ||
                estado.usuario?.user_metadata?.picture ||
                ""
            );


        exibirFoto(fotoUrl);


        /*
         * Link do perfil.
         *
         * A página pública utiliza o ID do perfil.
         */

        if (perfil.id) {

            elementos.linkEditarPerfil.href =
                `${CONFIG.rotas.perfil}?id=${encodeURIComponent(
                    perfil.id
                )}`;

        } else {

            elementos.linkEditarPerfil.href =
                "perfil.html";

        }

    }


    /* =========================================================
       FALLBACK
       ========================================================= */

    function exibirDadosFallback() {

        const usuario = estado.usuario;


        const nome =
            usuario?.user_metadata?.nome ||
            usuario?.user_metadata?.name ||
            "Usuário";


        elementos.usuarioNome.textContent =
            nome;


        elementos.usuarioTipo.textContent =
            "Conta MusicalWorld";


        exibirFoto(
            usuario?.user_metadata?.avatar_url ||
            usuario?.user_metadata?.picture ||
            ""
        );

    }


    /* =========================================================
       VOLTAR
       ========================================================= */

    function voltar() {

        /*
         * Se existe histórico de navegação,
         * retornamos para a página anterior.
         */

        if (window.history.length > 1) {

            window.history.back();

            return;
        }


        /*
         * Fallback para o index.
         */

        window.location.href =
            "index.html";

    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    async function sair() {

        const confirmar =
            window.confirm(
                "Deseja realmente sair da sua conta?"
            );


        if (!confirmar) {
            return;
        }


        const supabase =
            obterClienteSupabase();


        if (!supabase) {

            console.error(
                "MusicalWorldConfigConta: cliente Supabase não encontrado para logout."
            );

            return;
        }


        try {

            elementos.btnSair.disabled = true;


            const {
                error
            } = await supabase.auth.signOut();


            if (error) {
                throw error;
            }


            window.location.href =
                CONFIG.rotas.login;


        } catch (erro) {

            console.error(
                "MusicalWorldConfigConta: erro ao sair:",
                erro
            );


            elementos.btnSair.disabled = false;


            window.alert(
                "Não foi possível encerrar a sessão. Tente novamente."
            );

        }

    }


    /* =========================================================
       ÍCONES
       ========================================================= */

    function inicializarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* =========================================================
       EVENTOS
       ========================================================= */

    function configurarEventos() {

        elementos.btnVoltar.addEventListener(
            "click",
            voltar
        );


        elementos.btnSair.addEventListener(
            "click",
            sair
        );


        configurarFallbackFoto();

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    async function iniciar() {

        inicializarIcones();

        configurarEventos();

        await carregarUsuario();

        /*
         * Alguns ícones podem ser recriados depois
         * da atualização da interface.
         */

        inicializarIcones();

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.MusicalWorldConfiguracoesConta = {

        iniciar,

        carregarUsuario

    };


    /* =========================================================
       DOM READY
       ========================================================= */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            iniciar
        );

    } else {

        iniciar();

    }

})(window);