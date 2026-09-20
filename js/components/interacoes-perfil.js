/* =========================================================
   MUSICALWORLD — INTERAÇÕES DE PERFIL

   Arquivo:
   js/components/interacoes-perfil.js

   Responsabilidades:

   - Controlar curtidas de perfis.
   - Controlar favoritos de perfis.
   - Controlar comentários de perfis.
   - Carregar os contadores das interações.
   - Identificar o usuário autenticado.
   - Trabalhar com os botões existentes nos cards.
   - Funcionar também com cards criados dinamicamente.
   - Abrir o modal de comentários.
   - Exibir o campo de comentário no topo do modal.
   - Exibir os comentários existentes abaixo do campo.
   - Publicar novos comentários.
   - Impedir que as interações acionem a navegação do card.

   Tabelas utilizadas:

   - curtidas_perfis
   - favoritos_perfis
   - comentarios_perfis

   Todas as interações utilizam:

   - perfis.id

   Cliente Supabase:

   - window.supabaseClient
========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        seletorCard: ".ad-card-novo",

        seletorContainer: ".interacoes-perfil",

        seletorBotao:
            ".ad-card-acoes .ad-social-btn",

        tabelaCurtidas:
            "curtidas_perfis",

        tabelaFavoritos:
            "favoritos_perfis",

        tabelaComentarios:
            "comentarios_perfis",

        limiteComentarios: 20

    };


    /* =====================================================
       ESTADO DOS CARDS
    ===================================================== */

    const estado = new WeakMap();


    /* =====================================================
       ESTADO DO MODAL
    ===================================================== */

    let modalComentariosAtual = null;

    let containerComentariosAtual = null;

    let overflowBodyAnterior = "";


    /* =====================================================
       SUPABASE
    ===================================================== */

    function obterSupabase() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {
            return window.supabaseClient;
        }

        console.error(
            "MusicalWorld Interações: cliente Supabase não encontrado."
        );

        return null;
    }


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

    function escaparHtml(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function obterIniciais(nome) {

        const texto =
            String(nome || "Usuário").trim();

        if (!texto) {
            return "U";
        }

        const partes =
            texto
                .split(/\s+/)
                .filter(Boolean);

        if (partes.length === 1) {

            return partes[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            partes[0].charAt(0) +
            partes[partes.length - 1].charAt(0)
        ).toUpperCase();
    }


    function formatarData(data) {

        if (!data) {
            return "";
        }

        const dataObj =
            new Date(data);

        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {
            return "";
        }

        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       IDENTIFICAR CARD
    ===================================================== */

    function obterCard(elemento) {

        if (!elemento) {
            return null;
        }

        if (
            elemento.matches &&
            elemento.matches(CONFIG.seletorCard)
        ) {
            return elemento;
        }

        return elemento.closest(
            CONFIG.seletorCard
        );
    }


    /* =====================================================
       IDENTIFICAR CONTAINER
    ===================================================== */

    function obterContainer(elemento) {

        if (!elemento) {
            return null;
        }

        if (
            elemento.matches &&
            elemento.matches(
                CONFIG.seletorContainer
            )
        ) {
            return elemento;
        }


        const container =
            elemento.closest(
                CONFIG.seletorContainer
            );


        if (container) {
            return container;
        }


        /*
         * O Index atual pode estar usando o próprio
         * card como container lógico das interações.
         */

        const card =
            obterCard(elemento);

        if (card) {
            return card;
        }


        return null;
    }


    /* =====================================================
       OBTER PERFIL ID
    ===================================================== */

    function obterPerfilId(container) {

        if (!container) {
            return null;
        }


        const card =
            obterCard(container);


        const elemento =
            card || container;


        const valor =
            elemento.dataset?.perfilId ||
            container.dataset?.perfilId;


        if (!valor) {
            return null;
        }


        const perfilId =
            Number(valor);


        if (
            !Number.isFinite(perfilId) ||
            perfilId <= 0
        ) {
            return null;
        }


        return perfilId;
    }


    /* =====================================================
       LOCALIZAÇÃO DOS BOTÕES
    ===================================================== */

    function localizarBotao(
        container,
        tipo
    ) {

        const card =
            obterCard(container);


        if (!card) {
            return null;
        }


        /*
         * Primeiro procura pelo atributo
         * data-interacao.
         */

        const botaoDireto =
            card.querySelector(
                `[data-interacao="${tipo}"]`
            );


        if (botaoDireto) {
            return botaoDireto;
        }


        /*
         * Depois procura pelo data-acao usado
         * pelo Index.
         */

        const botaoAcao =
            card.querySelector(
                `[data-acao="${tipo}"]`
            );


        if (botaoAcao) {
            return botaoAcao;
        }


        /*
         * Compatibilidade com a ordem atual
         * dos botões do card.
         */

        const botoes =
            Array.from(
                card.querySelectorAll(
                    CONFIG.seletorBotao
                )
            );


        const indices = {

            comentar: 0,

            curtir: 1,

            compartilhar: 2,

            salvar: 3

        };


        const indice =
            indices[tipo];


        if (
            typeof indice === "number" &&
            botoes[indice]
        ) {
            return botoes[indice];
        }


        return null;
    }


    function localizarBotaoCurtir(container) {

        return localizarBotao(
            container,
            "curtir"
        );
    }


    function localizarBotaoComentar(container) {

        return localizarBotao(
            container,
            "comentar"
        );
    }


    function localizarBotaoSalvar(container) {

        return localizarBotao(
            container,
            "salvar"
        );
    }


    /* =====================================================
       USUÁRIO ATUAL
    ===================================================== */

    async function obterUsuarioAtual() {

        const supabase =
            obterSupabase();


        if (!supabase) {
            return null;
        }


        try {

            const resultado =
                await supabase.auth.getUser();


            if (
                resultado.error ||
                !resultado.data ||
                !resultado.data.user
            ) {
                return null;
            }


            return resultado.data.user;

        } catch (erro) {

            console.error(
                "MusicalWorld Interações: erro ao obter usuário atual.",
                erro
            );

            return null;
        }
    }


    /* =====================================================
       CONTAGEM
    ===================================================== */

    async function obterContagem(
        supabase,
        tabela,
        perfilId
    ) {

        const resultado =
            await supabase
                .from(tabela)
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "perfil_id",
                    perfilId
                );


        if (resultado.error) {
            throw resultado.error;
        }


        return resultado.count || 0;
    }


    /* =====================================================
       CARREGAR ESTADO
    ===================================================== */

    async function carregarEstado(container) {

        const supabase =
            obterSupabase();


        if (!supabase) {
            return;
        }


        const perfilId =
            obterPerfilId(container);


        if (!perfilId) {

            console.warn(
                "MusicalWorld Interações: perfil_id inválido.",
                container
            );

            return;
        }


        const usuario =
            await obterUsuarioAtual();


        const usuarioId =
            usuario?.id || null;


        try {

            const [
                curtidas,
                favoritos,
                comentarios
            ] = await Promise.all([

                obterContagem(
                    supabase,
                    CONFIG.tabelaCurtidas,
                    perfilId
                ),

                obterContagem(
                    supabase,
                    CONFIG.tabelaFavoritos,
                    perfilId
                ),

                obterContagem(
                    supabase,
                    CONFIG.tabelaComentarios,
                    perfilId
                )

            ]);


            let usuarioCurtiu = false;

            let usuarioSalvou = false;


            if (usuarioId) {

                const [
                    curtidaUsuario,
                    favoritoUsuario
                ] = await Promise.all([

                    supabase
                        .from(
                            CONFIG.tabelaCurtidas
                        )
                        .select("id")
                        .eq(
                            "perfil_id",
                            perfilId
                        )
                        .eq(
                            "usuario_id",
                            usuarioId
                        )
                        .maybeSingle(),

                    supabase
                        .from(
                            CONFIG.tabelaFavoritos
                        )
                        .select("id")
                        .eq(
                            "perfil_id",
                            perfilId
                        )
                        .eq(
                            "usuario_id",
                            usuarioId
                        )
                        .maybeSingle()

                ]);


                if (curtidaUsuario.error) {
                    throw curtidaUsuario.error;
                }


                if (favoritoUsuario.error) {
                    throw favoritoUsuario.error;
                }


                usuarioCurtiu =
                    Boolean(
                        curtidaUsuario.data
                    );


                usuarioSalvou =
                    Boolean(
                        favoritoUsuario.data
                    );
            }


            const dados = {

                perfilId,

                usuarioId,

                usuario,

                curtidas,

                favoritos,

                comentarios,

                usuarioCurtiu,

                usuarioSalvou

            };


            estado.set(
                container,
                dados
            );


            atualizarInterface(
                container
            );

        } catch (erro) {

            console.error(
                "MusicalWorld Interações: erro ao carregar interações.",
                erro
            );
        }
    }


    /* =====================================================
       CONTADOR
    ===================================================== */

    function atualizarContador(
        botao,
        valor
    ) {

        if (!botao) {
            return;
        }


        const quantidade =
            Math.max(
                0,
                Number(valor) || 0
            );


        const contador =
            botao.querySelector(
                ".interacoes-contador"
            );


        if (contador) {

            contador.textContent =
                String(quantidade);
        }


        botao.dataset.contagem =
            String(quantidade);
    }


    /* =====================================================
       ATUALIZAR INTERFACE
    ===================================================== */

    function atualizarInterface(container) {

        const dados =
            estado.get(container);


        if (!dados) {
            return;
        }


        const botaoCurtir =
            localizarBotaoCurtir(
                container
            );


        const botaoComentar =
            localizarBotaoComentar(
                container
            );


        const botaoSalvar =
            localizarBotaoSalvar(
                container
            );


        if (botaoCurtir) {

            botaoCurtir.classList.toggle(
                "ativo",
                Boolean(
                    dados.usuarioCurtiu
                )
            );


            botaoCurtir.setAttribute(
                "aria-pressed",
                String(
                    Boolean(
                        dados.usuarioCurtiu
                    )
                )
            );


            botaoCurtir.dataset.interacao =
                "curtir";


            atualizarContador(
                botaoCurtir,
                dados.curtidas
            );
        }


        if (botaoComentar) {

            botaoComentar.dataset.interacao =
                "comentar";


            atualizarContador(
                botaoComentar,
                dados.comentarios
            );
        }


        if (botaoSalvar) {

            botaoSalvar.classList.toggle(
                "ativo",
                Boolean(
                    dados.usuarioSalvou
                )
            );


            botaoSalvar.setAttribute(
                "aria-pressed",
                String(
                    Boolean(
                        dados.usuarioSalvou
                    )
                )
            );


            botaoSalvar.dataset.interacao =
                "salvar";


            atualizarContador(
                botaoSalvar,
                dados.favoritos
            );
        }
    }


    /* =====================================================
       CURTIR
    ===================================================== */

    async function alternarCurtida(container) {

        const supabase =
            obterSupabase();


        if (!supabase) {
            return;
        }


        let dados =
            estado.get(container);


        if (!dados) {

            await carregarEstado(
                container
            );

            dados =
                estado.get(container);
        }


        if (!dados) {
            return;
        }


        const usuario =
            dados.usuario ||
            await obterUsuarioAtual();


        if (!usuario) {

            alert(
                "Você precisa estar conectado para curtir este perfil."
            );

            return;
        }


        const botao =
            localizarBotaoCurtir(
                container
            );


        if (botao) {
            botao.disabled = true;
        }


        try {

            if (dados.usuarioCurtiu) {

                const resultado =
                    await supabase
                        .from(
                            CONFIG.tabelaCurtidas
                        )
                        .delete()
                        .eq(
                            "perfil_id",
                            dados.perfilId
                        )
                        .eq(
                            "usuario_id",
                            usuario.id
                        );


                if (resultado.error) {
                    throw resultado.error;
                }


                dados.usuarioCurtiu =
                    false;


                dados.curtidas =
                    Math.max(
                        0,
                        dados.curtidas - 1
                    );

            } else {

                const resultado =
                    await supabase
                        .from(
                            CONFIG.tabelaCurtidas
                        )
                        .insert({

                            perfil_id:
                                dados.perfilId,

                            usuario_id:
                                usuario.id

                        });


                if (resultado.error) {
                    throw resultado.error;
                }


                dados.usuarioCurtiu =
                    true;


                dados.curtidas += 1;
            }


            dados.usuario =
                usuario;


            dados.usuarioId =
                usuario.id;


            estado.set(
                container,
                dados
            );


            atualizarInterface(
                container
            );

        } catch (erro) {

            console.error(
                "MusicalWorld Interações: erro ao alternar curtida.",
                erro
            );


            await carregarEstado(
                container
            );


            alert(
                "Não foi possível atualizar a curtida."
            );

        } finally {

            if (botao) {
                botao.disabled = false;
            }
        }
    }


    /* =====================================================
       FAVORITO
    ===================================================== */

    async function alternarFavorito(container) {

        const supabase =
            obterSupabase();


        if (!supabase) {
            return;
        }


        let dados =
            estado.get(container);


        if (!dados) {

            await carregarEstado(
                container
            );

            dados =
                estado.get(container);
        }


        if (!dados) {
            return;
        }


        const usuario =
            dados.usuario ||
            await obterUsuarioAtual();


        if (!usuario) {

            alert(
                "Você precisa estar conectado para salvar este perfil."
            );

            return;
        }


        const botao =
            localizarBotaoSalvar(
                container
            );


        if (botao) {
            botao.disabled = true;
        }


        try {

            if (dados.usuarioSalvou) {

                const resultado =
                    await supabase
                        .from(
                            CONFIG.tabelaFavoritos
                        )
                        .delete()
                        .eq(
                            "perfil_id",
                            dados.perfilId
                        )
                        .eq(
                            "usuario_id",
                            usuario.id
                        );


                if (resultado.error) {
                    throw resultado.error;
                }


                dados.usuarioSalvou =
                    false;


                dados.favoritos =
                    Math.max(
                        0,
                        dados.favoritos - 1
                    );

            } else {

                const resultado =
                    await supabase
                        .from(
                            CONFIG.tabelaFavoritos
                        )
                        .insert({

                            perfil_id:
                                dados.perfilId,

                            usuario_id:
                                usuario.id

                        });


                if (resultado.error) {
                    throw resultado.error;
                }


                dados.usuarioSalvou =
                    true;


                dados.favoritos += 1;
            }


            dados.usuario =
                usuario;


            dados.usuarioId =
                usuario.id;


            estado.set(
                container,
                dados
            );


            atualizarInterface(
                container
            );

        } catch (erro) {

            console.error(
                "MusicalWorld Interações: erro ao alternar favorito.",
                erro
            );


            await carregarEstado(
                container
            );


            alert(
                "Não foi possível atualizar o perfil salvo."
            );

        } finally {

            if (botao) {
                botao.disabled = false;
            }
        }
    }


    /* =====================================================
       CRIAR MODAL
    ===================================================== */

    function criarModalComentarios(container) {

        if (
            modalComentariosAtual &&
            containerComentariosAtual === container
        ) {
            return modalComentariosAtual;
        }


        const modalAnterior =
            document.querySelector(
                ".interacoes-modal-comentarios"
            );


        if (modalAnterior) {
            modalAnterior.remove();
        }


        const modal =
            document.createElement("div");


        modal.className =
            "interacoes-modal-comentarios";


        modal.setAttribute(
            "role",
            "dialog"
        );


        modal.setAttribute(
            "aria-modal",
            "true"
        );


        modal.setAttribute(
            "aria-label",
            "Comentários"
        );


        modal.innerHTML = `

            <div
                class="interacoes-modal-comentarios-overlay"
            ></div>

            <div
                class="interacoes-modal-comentarios-conteudo"
            >

                <header
                    class="interacoes-modal-comentarios-cabecalho"
                >

                    <h2>
                        Comentários
                    </h2>

                    <button
                        type="button"
                        class="interacoes-modal-comentarios-fechar"
                        aria-label="Fechar comentários"
                        title="Fechar"
                    >

                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >

                            <path d="M6 6l12 12"></path>

                            <path d="M18 6L6 18"></path>

                        </svg>

                    </button>

                </header>


                <div
                    class="interacoes-modal-comentarios-corpo"
                >

                    <section
                        class="interacoes-comentario-novo"
                    >

                        <textarea
                            class="interacoes-comentario-input"
                            rows="3"
                            maxlength="1000"
                            placeholder="Escreva um comentário..."
                            aria-label="Escreva um comentário"
                        ></textarea>


                        <div
                            class="interacoes-comentario-novo-acoes"
                        >

                            <span
                                class="interacoes-comentario-ajuda"
                            >
                                Compartilhe sua opinião
                            </span>


                            <button
                                type="button"
                                class="interacoes-comentario-enviar"
                            >
                                Publicar
                            </button>

                        </div>

                    </section>


                    <section
                        class="interacoes-comentarios-lista"
                        aria-label="Comentários existentes"
                    >

                        <div
                            class="interacoes-comentarios-carregando"
                        >
                            Carregando comentários...
                        </div>

                    </section>

                </div>

            </div>
        `;


        document.body.appendChild(
            modal
        );


        modalComentariosAtual =
            modal;


        containerComentariosAtual =
            container;


        configurarEventosModal(
            modal,
            container
        );


        return modal;
    }


    /* =====================================================
       EVENTOS DO MODAL
    ===================================================== */

    function configurarEventosModal(
        modal,
        container
    ) {

        const botaoFechar =
            modal.querySelector(
                ".interacoes-modal-comentarios-fechar"
            );


        const overlay =
            modal.querySelector(
                ".interacoes-modal-comentarios-overlay"
            );


        const botaoEnviar =
            modal.querySelector(
                ".interacoes-comentario-enviar"
            );


        const campo =
            modal.querySelector(
                ".interacoes-comentario-input"
            );


        if (botaoFechar) {

            botaoFechar.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    evento.stopPropagation();

                    fecharModalComentarios();

                }
            );
        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    evento.stopPropagation();

                    fecharModalComentarios();

                }
            );
        }


        if (botaoEnviar) {

            botaoEnviar.addEventListener(
                "click",
                async evento => {

                    evento.preventDefault();

                    evento.stopPropagation();

                    await enviarComentario(
                        container
                    );

                }
            );
        }


        if (campo) {

            campo.addEventListener(
                "keydown",
                async evento => {

                    if (
                        evento.key === "Enter" &&
                        (evento.ctrlKey ||
                         evento.metaKey)
                    ) {

                        evento.preventDefault();

                        await enviarComentario(
                            container
                        );
                    }
                }
            );
        }


        const conteudo =
            modal.querySelector(
                ".interacoes-modal-comentarios-conteudo"
            );


        if (conteudo) {

            conteudo.addEventListener(
                "click",
                evento => {

                    evento.stopPropagation();

                }
            );
        }
    }


    /* =====================================================
       ABRIR MODAL
    ===================================================== */

    async function abrirModalComentarios(container) {

        if (!container) {
            return;
        }


        let dados =
            estado.get(container);


        /*
         * Se o card ainda não tiver sido inicializado,
         * carregamos o estado agora.
         */

        if (!dados) {

            await carregarEstado(
                container
            );

            dados =
                estado.get(container);
        }


        if (!dados) {

            console.error(
                "MusicalWorld Interações: não foi possível obter o estado do perfil."
            );

            return;
        }


        const usuario =
            dados.usuario ||
            await obterUsuarioAtual();


        const modal =
            criarModalComentarios(
                container
            );


        if (!modal) {
            return;
        }


        overflowBodyAnterior =
            document.body.style.overflow;


        document.body.style.overflow =
            "hidden";


        modal.classList.add(
            "aberto"
        );


        document.body.classList.add(
            "interacoes-modal-aberto"
        );


        const campo =
            modal.querySelector(
                ".interacoes-comentario-input"
            );


        if (campo) {

            if (!usuario) {

                campo.placeholder =
                    "Entre na sua conta para comentar.";

            } else {

                campo.placeholder =
                    "Escreva um comentário...";
            }
        }


        await carregarComentarios(
            container
        );


        if (campo) {

            setTimeout(
                () => {

                    if (
                        modal.classList.contains(
                            "aberto"
                        )
                    ) {

                        campo.focus();
                    }

                },
                80
            );
        }
    }


    /* =====================================================
       FECHAR MODAL
    ===================================================== */

    function fecharModalComentarios() {

        const modal =
            modalComentariosAtual ||
            document.querySelector(
                ".interacoes-modal-comentarios"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "aberto"
        );


        document.body.classList.remove(
            "interacoes-modal-aberto"
        );


        document.body.style.overflow =
            overflowBodyAnterior;


        setTimeout(
            () => {

                if (
                    modal.parentNode
                ) {

                    modal.remove();
                }


                if (
                    modalComentariosAtual ===
                    modal
                ) {

                    modalComentariosAtual =
                        null;

                    containerComentariosAtual =
                        null;
                }

            },
            180
        );
    }


    /* =====================================================
       CARREGAR COMENTÁRIOS
    ===================================================== */

    async function carregarComentarios(container) {

        const supabase =
            obterSupabase();


        if (!supabase) {
            return;
        }


        const dados =
            estado.get(container);


        if (!dados) {
            return;
        }


        const modal =
            modalComentariosAtual ||
            document.querySelector(
                ".interacoes-modal-comentarios"
            );


        if (
            !modal ||
            containerComentariosAtual !== container
        ) {
            return;
        }


        const lista =
            modal.querySelector(
                ".interacoes-comentarios-lista"
            );


        if (!lista) {
            return;
        }


        lista.innerHTML = `

            <div
                class="interacoes-comentarios-carregando"
            >
                Carregando comentários...
            </div>

        `;


        try {

            const resultado =
                await supabase
                    .from(
                        CONFIG.tabelaComentarios
                    )
                    .select(`
                        id,
                        comentario,
                        created_at,
                        usuario_id,
                        usuarios (
                            id,
                            nome,
                            foto_url
                        )
                    `)
                    .eq(
                        "perfil_id",
                        dados.perfilId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(
                        CONFIG.limiteComentarios
                    );


            if (resultado.error) {
                throw resultado.error;
            }


            renderizarComentarios(
                container,
                resultado.data || []
            );

        } catch (erro) {

            console.error(
                "MusicalWorld Interações: erro ao carregar comentários.",
                erro
            );


            lista.innerHTML = `

                <div
                    class="interacoes-comentarios-vazio"
                >
                    Não foi possível carregar os comentários.
                </div>

            `;
        }
    }


    /* =====================================================
       RENDERIZAR COMENTÁRIOS
    ===================================================== */

    function renderizarComentarios(
        container,
        comentarios
    ) {

        const modal =
            modalComentariosAtual;


        if (
            !modal ||
            containerComentariosAtual !== container
        ) {
            return;
        }


        const lista =
            modal.querySelector(
                ".interacoes-comentarios-lista"
            );


        if (!lista) {
            return;
        }


        if (!comentarios.length) {

            lista.innerHTML = `

                <div
                    class="interacoes-comentarios-vazio"
                >
                    Ainda não há comentários.
                </div>

            `;

            return;
        }


        lista.innerHTML =
            comentarios
                .map(
                    comentario => {

                        const usuario =
                            comentario.usuarios ||
                            {};


                        const nome =
                            usuario.nome ||
                            "Usuário";


                        const foto =
                            usuario.foto_url ||
                            "";


                        const iniciais =
                            obterIniciais(
                                nome
                            );


                        const avatar =
                            foto
                                ? `

                                    <img
                                        src="${escaparHtml(
                                            foto
                                        )}"
                                        alt=""
                                        class="interacoes-comentario-avatar"
                                    >

                                `
                                : `

                                    <span
                                        class="
                                            interacoes-comentario-avatar
                                            interacoes-comentario-avatar-iniciais
                                        "
                                    >
                                        ${escaparHtml(
                                            iniciais
                                        )}
                                    </span>

                                `;


                        return `

                            <article
                                class="interacoes-comentario"
                                data-comentario-id="${escaparHtml(
                                    comentario.id
                                )}"
                            >

                                <div
                                    class="interacoes-comentario-avatar-wrapper"
                                >
                                    ${avatar}
                                </div>


                                <div
                                    class="interacoes-comentario-conteudo"
                                >

                                    <div
                                        class="interacoes-comentario-cabecalho"
                                    >

                                        <strong>
                                            ${escaparHtml(
                                                nome
                                            )}
                                        </strong>


                                        <time>
                                            ${escaparHtml(
                                                formatarData(
                                                    comentario.created_at
                                                )
                                            )}
                                        </time>

                                    </div>


                                    <p>
                                        ${escaparHtml(
                                            comentario.comentario
                                        )}
                                    </p>

                                </div>

                            </article>

                        `;
                    }
                )
                .join("");


        lista
            .querySelectorAll(
                "img.interacoes-comentario-avatar"
            )
            .forEach(
                imagem => {

                    imagem.addEventListener(
                        "error",
                        () => {

                            const artigo =
                                imagem.closest(
                                    ".interacoes-comentario"
                                );


                            const nome =
                                artigo
                                    ?.querySelector(
                                        "strong"
                                    )
                                    ?.textContent ||
                                    "Usuário";


                            const fallback =
                                document.createElement(
                                    "span"
                                );


                            fallback.className =
                                "interacoes-comentario-avatar interacoes-comentario-avatar-iniciais";


                            fallback.textContent =
                                obterIniciais(
                                    nome
                                );


                            imagem.replaceWith(
                                fallback
                            );

                        },
                        {
                            once: true
                        }
                    );
                }
            );
    }


    /* =====================================================
       ENVIAR COMENTÁRIO
    ===================================================== */

    async function enviarComentario(container) {

        const supabase =
            obterSupabase();


        if (!supabase) {
            return;
        }


        let dados =
            estado.get(container);


        if (!dados) {

            await carregarEstado(
                container
            );

            dados =
                estado.get(container);
        }


        if (!dados) {
            return;
        }


        const usuario =
            dados.usuario ||
            await obterUsuarioAtual();


        if (!usuario) {

            alert(
                "Você precisa estar conectado para comentar."
            );

            return;
        }


        const modal =
            modalComentariosAtual;


        if (
            !modal ||
            containerComentariosAtual !== container
        ) {
            return;
        }


        const campo =
            modal.querySelector(
                ".interacoes-comentario-input"
            );


        const botao =
            modal.querySelector(
                ".interacoes-comentario-enviar"
            );


        if (!campo) {
            return;
        }


        const comentario =
            String(
                campo.value || ""
            ).trim();


        if (!comentario) {

            campo.focus();

            return;
        }


        if (botao) {

            botao.disabled =
                true;

            botao.textContent =
                "Publicando...";
        }


        try {

            const resultado =
                await supabase
                    .from(
                        CONFIG.tabelaComentarios
                    )
                    .insert({

                        perfil_id:
                            dados.perfilId,

                        usuario_id:
                            usuario.id,

                        comentario

                    });


            if (resultado.error) {
                throw resultado.error;
            }


            campo.value = "";


            dados.comentarios += 1;


            dados.usuario =
                usuario;


            dados.usuarioId =
                usuario.id;


            estado.set(
                container,
                dados
            );


            atualizarInterface(
                container
            );


            await carregarComentarios(
                container
            );

        } catch (erro) {

            console.error(
                "MusicalWorld Interações: erro ao publicar comentário.",
                erro
            );


            alert(
                "Não foi possível publicar o comentário."
            );

        } finally {

            if (botao) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Publicar";
            }
        }
    }


    /* =====================================================
       ALTERNAR COMENTÁRIOS
    ===================================================== */

    async function alternarComentarios(container) {

        await abrirModalComentarios(
            container
        );
    }


    /* =====================================================
       INICIALIZAR CARD
    ===================================================== */

    async function inicializarElemento(container) {

        if (!container) {
            return;
        }


        const perfilId =
            obterPerfilId(container);


        if (!perfilId) {

            console.warn(
                "MusicalWorld Interações: elemento sem data-perfil-id.",
                container
            );

            return;
        }


        /*
         * Apenas garante que o estado inicial
         * seja carregado.
         *
         * O clique agora é controlado por delegação
         * global, portanto não depende deste método.
         */

        await carregarEstado(
            container
        );
    }


    /* =====================================================
       INICIALIZAR TODOS OS CARDS
    ===================================================== */

    async function inicializar() {

        const cards =
            document.querySelectorAll(
                CONFIG.seletorCard
            );


        if (!cards.length) {
            return;
        }


        await Promise.all(
            Array.from(cards).map(
                card =>
                    inicializarElemento(
                        card
                    )
            )
        );
    }


    /* =====================================================
       DELEGAÇÃO GLOBAL DE CLIQUES
       
       IMPORTANTE:

       Os cards do Index são criados dinamicamente.

       Por isso não dependemos exclusivamente de
       addEventListener diretamente no botão.

       O document captura o clique e identifica
       qual interação foi acionada.
    ===================================================== */

    document.addEventListener(
        "click",
        async evento => {

            const alvo =
                evento.target instanceof Element
                    ? evento.target
                    : null;


            if (!alvo) {
                return;
            }


            const botao =
                alvo.closest(
                    CONFIG.seletorBotao
                );


            if (!botao) {
                return;
            }


            const card =
                botao.closest(
                    CONFIG.seletorCard
                );


            if (!card) {
                return;
            }


            /*
             * Primeiro verifica explicitamente
             * data-acao.
             */

            let tipo =
                botao.dataset.acao ||
                botao.dataset.interacao;


            /*
             * Se não houver atributo, identifica
             * pela posição dos botões.
             */

            if (!tipo) {

                const botoes =
                    Array.from(
                        card.querySelectorAll(
                            CONFIG.seletorBotao
                        )
                    );


                const indice =
                    botoes.indexOf(
                        botao
                    );


                const tipos = [

                    "comentar",

                    "curtir",

                    "compartilhar",

                    "salvar"

                ];


                tipo =
                    tipos[indice];
            }


            /*
             * Compartilhar continua sendo tratado
             * pelo sistema próprio do Index.
             */

            if (
                tipo === "compartilhar"
            ) {
                return;
            }


            if (
                tipo !== "comentar" &&
                tipo !== "curtir" &&
                tipo !== "salvar"
            ) {
                return;
            }


            evento.preventDefault();

            evento.stopPropagation();


            const container =
                obterContainer(card);


            if (!container) {

                console.error(
                    "MusicalWorld Interações: não foi possível identificar o container do perfil."
                );

                return;
            }


            const perfilId =
                obterPerfilId(container);


            if (!perfilId) {

                console.error(
                    "MusicalWorld Interações: botão acionado sem perfil_id.",
                    card
                );

                return;
            }


            /*
             * Garante que o estado exista antes
             * de executar a ação.
             */

            if (!estado.has(container)) {

                await carregarEstado(
                    container
                );
            }


            if (
                tipo === "comentar"
            ) {

                await alternarComentarios(
                    container
                );

                return;
            }


            if (
                tipo === "curtir"
            ) {

                await alternarCurtida(
                    container
                );

                return;
            }


            if (
                tipo === "salvar"
            ) {

                await alternarFavorito(
                    container
                );
            }

        },
        true
    );


    /* =====================================================
       ESC FECHA O MODAL
    ===================================================== */

    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key !== "Escape"
            ) {
                return;
            }


            if (
                !modalComentariosAtual
            ) {
                return;
            }


            fecharModalComentarios();

        }
    );


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    window.InteracoesPerfil = {

        inicializar,

        inicializarElemento,

        carregarEstado,

        carregarComentarios,

        alternarCurtida,

        alternarFavorito,

        enviarComentario,

        alternarComentarios,

        abrirModalComentarios,

        fecharModalComentarios

    };


})(window);