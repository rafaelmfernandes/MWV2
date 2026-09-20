/* =========================================================
   MUSICALWORLD — PERFIS SALVOS E CURTIDOS

   Arquivo:
   js/salvos-curtidos.js

   Responsabilidades:

   * Identificar o usuário autenticado.
   * Buscar os perfis salvos pelo usuário.
   * Buscar os perfis curtidos pelo usuário.
   * Utilizar exatamente as mesmas tabelas utilizadas
     pelo componente InteracoesPerfil.
   * Carregar os dados públicos dos perfis.
   * Exibir os cartões das duas listas.
   * Selecionar automaticamente a primeira aba
     que possuir conteúdo.
   * Permitir alternar entre Salvos e Curtidos.
   * Abrir apresentar-perfil.html?id=...
   * Permitir remover um favorito ou uma curtida.
   * Atualizar os contadores da página.

   Tabelas utilizadas:

   favoritos_perfis:
   - perfil_id
   - usuario_id
   - created_at

   curtidas_perfis:
   - perfil_id
   - usuario_id
   - created_at

   O perfil_id representa:

   - perfis.id

   Observação:

   Os IDs de perfil são tratados como valores
   genéricos/string durante o JavaScript para
   evitar conversões desnecessárias.

========================================================= */

(function (window, document) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        tabelaFavoritos:
            "favoritos_perfis",

        tabelaCurtidas:
            "curtidas_perfis",

        tabelaPerfis:
            "perfis",

        tabelaUsuarios:
            "usuarios",

        tabelaArtistas:
            "perfis_artistas",

        paginaPerfil:
            "apresentar-perfil.html",

        paginaExplorar:
            "index.html"
    };


    /* =====================================================
       ESTADO
    ===================================================== */

    const estado = {

        usuario: null,

        abaAtual: "salvos",

        salvos: [],

        curtidos: [],

        carregando: false
    };


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const elementos = {};


    /* =====================================================
       INICIALIZAÇÃO
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        iniciar
    );


    async function iniciar() {

        mapearElementos();

        configurarEventos();

        atualizarAbas();

        mostrarCarregando(true);


        try {

            const supabase =
                obterSupabase();


            if (!supabase) {

                throw new Error(
                    "Cliente Supabase não encontrado."
                );
            }


            const usuario =
                await obterUsuarioAtual(
                    supabase
                );


            if (!usuario) {

                redirecionarParaLogin();

                return;
            }


            estado.usuario =
                usuario;


            console.log(
                "MusicalWorld — usuário autenticado:",
                usuario.id
            );


            await carregarTodasAsListas();


            /*
             * Depois que as duas listas foram carregadas,
             * escolhemos automaticamente a primeira aba
             * que possuir conteúdo.
             *
             * Exemplo:
             *
             * Salvos = 0
             * Curtidos = 1
             *
             * Resultado:
             *
             * abaAtual = "curtidos"
             */

            definirAbaInicial();


            atualizarAbas();

            renderizarAbaAtual();


        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao carregar perfis salvos e curtidos:",
                erro
            );


            mostrarErro(
                obterMensagemErro(erro)
            );

        } finally {

            estado.carregando =
                false;

            mostrarCarregando(false);
        }
    }


    /* =====================================================
       MAPEAR ELEMENTOS
    ===================================================== */

    function mapearElementos() {

        elementos.btnVoltar =
            document.getElementById(
                "btnVoltar"
            );


        elementos.abas =
            Array.from(
                document.querySelectorAll(
                    ".salvos-curtidos-aba"
                )
            );


        elementos.listaPerfis =
            document.getElementById(
                "listaPerfis"
            );


        elementos.estadoCarregando =
            document.getElementById(
                "estadoCarregando"
            );


        elementos.estadoErro =
            document.getElementById(
                "estadoErro"
            );


        elementos.estadoVazio =
            document.getElementById(
                "estadoVazio"
            );


        elementos.mensagemErro =
            document.getElementById(
                "mensagemErro"
            );


        elementos.btnTentarNovamente =
            document.getElementById(
                "btnTentarNovamente"
            );


        elementos.btnExplorar =
            document.getElementById(
                "btnExplorar"
            );


        elementos.contadorSalvos =
            document.getElementById(
                "contadorSalvos"
            );


        elementos.contadorCurtidos =
            document.getElementById(
                "contadorCurtidos"
            );


        elementos.tituloEstadoVazio =
            document.getElementById(
                "tituloEstadoVazio"
            );


        elementos.mensagemEstadoVazio =
            document.getElementById(
                "mensagemEstadoVazio"
            );


        elementos.iconeEstadoVazio =
            document.getElementById(
                "iconeEstadoVazio"
            );
    }


    /* =====================================================
       EVENTOS
    ===================================================== */

    function configurarEventos() {

        if (elementos.btnVoltar) {

            elementos.btnVoltar.addEventListener(
                "click",
                voltar
            );
        }


        elementos.abas.forEach(
            function (aba) {

                aba.addEventListener(
                    "click",
                    function () {

                        selecionarAba(
                            aba.dataset.aba
                        );
                    }
                );
            }
        );


        if (elementos.btnTentarNovamente) {

            elementos.btnTentarNovamente.addEventListener(
                "click",
                iniciar
            );
        }


        if (elementos.btnExplorar) {

            elementos.btnExplorar.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginaExplorar;
                }
            );
        }


        if (elementos.listaPerfis) {

            elementos.listaPerfis.addEventListener(
                "click",
                tratarCliqueLista
            );
        }
    }


    /* =====================================================
       SUPABASE
    ===================================================== */

    function obterSupabase() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from ===
                "function"
        ) {

            return window.supabaseClient;
        }


        if (
            window.supabase &&
            typeof window.supabase.from ===
                "function"
        ) {

            return window.supabase;
        }


        return null;
    }


    /* =====================================================
       USUÁRIO ATUAL
    ===================================================== */

    async function obterUsuarioAtual(
        supabase
    ) {

        const resultado =
            await supabase.auth.getUser();


        if (resultado.error) {

            throw resultado.error;
        }


        return resultado.data &&
            resultado.data.user
            ? resultado.data.user
            : null;
    }


    /* =====================================================
       CARREGAR TODAS AS LISTAS
    ===================================================== */

    async function carregarTodasAsListas() {

        if (!estado.usuario) {

            throw new Error(
                "Usuário autenticado não identificado."
            );
        }


        estado.carregando =
            true;


        const [
            salvos,
            curtidos
        ] = await Promise.all([

            carregarRelacionamentos(
                CONFIG.tabelaFavoritos
            ),

            carregarRelacionamentos(
                CONFIG.tabelaCurtidas
            )

        ]);


        estado.salvos =
            salvos;


        estado.curtidos =
            curtidos;


        console.log(
            "MusicalWorld — perfis salvos:",
            estado.salvos.length
        );


        console.log(
            "MusicalWorld — perfis curtidos:",
            estado.curtidos.length
        );


        atualizarContadores();


        estado.carregando =
            false;
    }


    /* =====================================================
       DEFINIR ABA INICIAL

       Regra:

       1. Se existir pelo menos um perfil salvo,
          abre "Salvos".

       2. Se não houver salvos, mas houver curtidos,
          abre "Curtidos".

       3. Se ambas estiverem vazias,
          permanece em "Salvos".

    ===================================================== */

    function definirAbaInicial() {

        if (
            estado.salvos.length > 0
        ) {

            estado.abaAtual =
                "salvos";

            console.log(
                "MusicalWorld — aba inicial: Salvos"
            );

            return;
        }


        if (
            estado.curtidos.length > 0
        ) {

            estado.abaAtual =
                "curtidos";

            console.log(
                "MusicalWorld — aba inicial: Curtidos"
            );

            return;
        }


        estado.abaAtual =
            "salvos";


        console.log(
            "MusicalWorld — nenhuma interação encontrada. Aba inicial: Salvos"
        );
    }


    /* =====================================================
       CARREGAR RELACIONAMENTOS

       Busca exatamente os registros criados pelo
       InteracoesPerfil.

       Não utiliza Number() nos IDs.
    ===================================================== */

    async function carregarRelacionamentos(
        tabela
    ) {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );
        }


        if (!estado.usuario?.id) {

            throw new Error(
                "Usuário autenticado não identificado."
            );
        }


        const resultado =
            await supabase
                .from(tabela)
                .select(
                    "perfil_id, usuario_id, created_at"
                )
                .eq(
                    "usuario_id",
                    estado.usuario.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (resultado.error) {

            throw resultado.error;
        }


        const relacionamentos =
            resultado.data || [];


        if (!relacionamentos.length) {

            return [];
        }


        const idsPerfis =
            relacionamentos
                .map(
                    item =>
                        item.perfil_id
                )
                .filter(
                    id =>
                        id !== null &&
                        id !== undefined &&
                        String(id).trim() !== ""
                );


        if (!idsPerfis.length) {

            return [];
        }


        const perfis =
            await carregarPerfis(
                idsPerfis
            );


        const mapaPerfis =
            new Map();


        perfis.forEach(
            function (perfil) {

                mapaPerfis.set(
                    String(perfil.id),
                    perfil
                );
            }
        );


        return relacionamentos
            .map(
                function (relacionamento) {

                    const perfil =
                        mapaPerfis.get(
                            String(
                                relacionamento.perfil_id
                            )
                        );


                    if (!perfil) {

                        console.warn(
                            "MusicalWorld — relacionamento encontrado, mas perfil não localizado:",
                            relacionamento.perfil_id
                        );

                        return null;
                    }


                    return {

                        perfil,

                        relacionamento
                    };
                }
            )
            .filter(Boolean);
    }


    /* =====================================================
       CARREGAR PERFIS
    ===================================================== */

    async function carregarPerfis(
        idsPerfis
    ) {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );
        }


        const resultado =
            await supabase
                .from(
                    CONFIG.tabelaPerfis
                )
                .select(
                    [
                        "id",
                        "usuario_id",
                        "nome_exibicao",
                        "descricao",
                        "ativo",
                        "perfil_publicado",
                        "created_at",
                        "updated_at"
                    ].join(",")
                )
                .in(
                    "id",
                    idsPerfis
                );


        if (resultado.error) {

            throw resultado.error;
        }


        const perfis =
            resultado.data || [];


        if (!perfis.length) {

            return [];
        }


        const idsUsuarios =
            perfis
                .map(
                    perfil =>
                        perfil.usuario_id
                )
                .filter(Boolean);


        const idsPerfilArtista =
            perfis
                .map(
                    perfil =>
                        perfil.id
                )
                .filter(Boolean);


        const [
            usuarios,
            artistas
        ] = await Promise.all([

            carregarUsuarios(
                idsUsuarios
            ),

            carregarPerfisArtistas(
                idsPerfilArtista
            )

        ]);


        const mapaUsuarios =
            new Map();


        usuarios.forEach(
            function (usuario) {

                mapaUsuarios.set(
                    String(usuario.id),
                    usuario
                );
            }
        );


        const mapaArtistas =
            new Map();


        artistas.forEach(
            function (artista) {

                mapaArtistas.set(
                    String(
                        artista.perfil_id
                    ),
                    artista
                );
            }
        );


        return perfis.map(
            function (perfil) {

                return {

                    ...perfil,

                    usuario:
                        mapaUsuarios.get(
                            String(
                                perfil.usuario_id
                            )
                        ) || null,

                    artista:
                        mapaArtistas.get(
                            String(
                                perfil.id
                            )
                        ) || null
                };
            }
        );
    }


    /* =====================================================
       CARREGAR USUÁRIOS
    ===================================================== */

    async function carregarUsuarios(
        idsUsuarios
    ) {

        if (!idsUsuarios.length) {

            return [];
        }


        const supabase =
            obterSupabase();


        const resultado =
            await supabase
                .from(
                    CONFIG.tabelaUsuarios
                )
                .select(
                    "id, nome, foto_url"
                )
                .in(
                    "id",
                    idsUsuarios
                );


        if (resultado.error) {

            throw resultado.error;
        }


        return resultado.data || [];
    }


    /* =====================================================
       CARREGAR PERFIS DE ARTISTAS
    ===================================================== */

    async function carregarPerfisArtistas(
        idsPerfis
    ) {

        if (!idsPerfis.length) {

            return [];
        }


        const supabase =
            obterSupabase();


        const resultado =
            await supabase
                .from(
                    CONFIG.tabelaArtistas
                )
                .select(
                    [
                        "perfil_id",
                        "tipo_artista",
                        "localizacao",
                        "estilos",
                        "foto_url",
                        "disponivel"
                    ].join(",")
                )
                .in(
                    "perfil_id",
                    idsPerfis
                );


        if (resultado.error) {

            throw resultado.error;
        }


        return resultado.data || [];
    }


    /* =====================================================
       ABAS
    ===================================================== */

    function selecionarAba(
        nomeAba
    ) {

        if (
            nomeAba !== "salvos" &&
            nomeAba !== "curtidos"
        ) {

            return;
        }


        estado.abaAtual =
            nomeAba;


        atualizarAbas();

        renderizarAbaAtual();
    }


    function atualizarAbas() {

        elementos.abas.forEach(
            function (aba) {

                const ativa =
                    aba.dataset.aba ===
                    estado.abaAtual;


                aba.classList.toggle(
                    "ativa",
                    ativa
                );


                aba.setAttribute(
                    "aria-selected",
                    String(ativa)
                );
            }
        );
    }


    /* =====================================================
       CONTADORES
    ===================================================== */

    function atualizarContadores() {

        if (elementos.contadorSalvos) {

            elementos.contadorSalvos.textContent =
                String(
                    estado.salvos.length
                );
        }


        if (elementos.contadorCurtidos) {

            elementos.contadorCurtidos.textContent =
                String(
                    estado.curtidos.length
                );
        }
    }


    /* =====================================================
       RENDERIZAÇÃO
    ===================================================== */

    function renderizarAbaAtual() {

        esconderTodosOsEstados();


        const lista =
            estado.abaAtual === "salvos"
                ? estado.salvos
                : estado.curtidos;


        console.log(
            "MusicalWorld — renderizando aba:",
            estado.abaAtual,
            "| Perfis:",
            lista.length
        );


        if (!lista.length) {

            mostrarVazio();

            return;
        }


        if (!elementos.listaPerfis) {

            console.error(
                "MusicalWorld — elemento #listaPerfis não encontrado."
            );

            return;
        }


        elementos.listaPerfis.hidden =
            false;


        elementos.listaPerfis.innerHTML =
            lista
                .map(
                    item =>
                        criarCardPerfil(
                            item.perfil
                        )
                )
                .join("");


        console.log(
            "MusicalWorld — cards renderizados:",
            lista.length
        );
    }


    /* =====================================================
       CRIAR CARD
    ===================================================== */

    function criarCardPerfil(
        perfil
    ) {

        const usuario =
            perfil.usuario || {};


        const artista =
            perfil.artista || {};


        const nome =
            obterNomePerfil(
                perfil,
                usuario
            );


        const tipo =
            artista.tipo_artista ||
            "Artista";


        const localizacao =
            artista.localizacao ||
            "Localização não informada";


        const avatar =
            obterAvatar(
                perfil,
                artista,
                usuario
            );


        const iniciais =
            obterIniciais(nome);


        const relacionamento =
            estado.abaAtual === "salvos"
                ? "salvo"
                : "curtido";


        const acaoRemover =
            relacionamento === "salvo"
                ? "Remover dos salvos"
                : "Remover das curtidas";


        const iconeStatus =
            relacionamento === "salvo"
                ? iconeBookmark()
                : iconeCoracao();


        return `
            <article
                class="salvos-curtidos-card"
                data-perfil-id="${escaparHtml(
                    String(perfil.id)
                )}"
            >

                <button
                    type="button"
                    class="salvos-curtidos-card-conteudo"
                    data-acao="abrir-perfil"
                    aria-label="Abrir perfil de ${escaparHtml(
                        nome
                    )}"
                >

                    <div class="salvos-curtidos-avatar">

                        ${
                            avatar
                                ? `
                                    <img
                                        src="${escaparHtml(
                                            avatar
                                        )}"
                                        alt=""
                                        loading="lazy"
                                    >
                                  `
                                : escaparHtml(
                                    iniciais
                                )
                        }

                    </div>


                    <div class="salvos-curtidos-card-info">

                        <div class="salvos-curtidos-card-nome">
                            ${escaparHtml(nome)}
                        </div>


                        <div class="salvos-curtidos-card-tipo">
                            ${escaparHtml(tipo)}
                        </div>


                        <div class="salvos-curtidos-card-localizacao">
                            ${escaparHtml(
                                localizacao
                            )}
                        </div>

                    </div>

                </button>


                <div class="salvos-curtidos-card-acoes">

                    <span class="salvos-curtidos-card-status">

                        ${iconeStatus}

                        <span>
                            ${
                                relacionamento === "salvo"
                                    ? "Perfil salvo"
                                    : "Perfil curtido"
                            }
                        </span>

                    </span>


                    <button
                        type="button"
                        class="salvos-curtidos-remover"
                        data-acao="remover"
                        data-perfil-id="${escaparHtml(
                            String(perfil.id)
                        )}"
                        aria-label="${escaparHtml(
                            acaoRemover
                        )}"
                        title="${escaparHtml(
                            acaoRemover
                        )}"
                    >

                        ${iconeLixeira()}

                        <span>
                            Remover
                        </span>

                    </button>

                </div>

            </article>
        `;
    }


    /* =====================================================
       CLIQUES DA LISTA
    ===================================================== */

    async function tratarCliqueLista(
        evento
    ) {

        const alvo =
            evento.target instanceof Element
                ? evento.target
                : null;


        if (!alvo) {

            return;
        }


        const botaoRemover =
            alvo.closest(
                '[data-acao="remover"]'
            );


        if (botaoRemover) {

            evento.preventDefault();

            evento.stopPropagation();


            const perfilId =
                botaoRemover.dataset.perfilId;


            await removerRelacionamento(
                perfilId,
                botaoRemover
            );


            return;
        }


        const botaoPerfil =
            alvo.closest(
                '[data-acao="abrir-perfil"]'
            );


        if (botaoPerfil) {

            evento.preventDefault();


            const card =
                botaoPerfil.closest(
                    ".salvos-curtidos-card"
                );


            if (!card) {

                return;
            }


            const perfilId =
                card.dataset.perfilId;


            if (!perfilId) {

                return;
            }


            abrirPerfil(
                perfilId
            );
        }
    }


    /* =====================================================
       REMOVER RELACIONAMENTO
    ===================================================== */

    async function removerRelacionamento(
        perfilId,
        botao
    ) {

        if (!perfilId) {

            return;
        }


        if (!estado.usuario?.id) {

            return;
        }


        const confirmado =
            window.confirm(
                estado.abaAtual === "salvos"
                    ? "Remover este perfil dos salvos?"
                    : "Remover a curtida deste perfil?"
            );


        if (!confirmado) {

            return;
        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return;
        }


        const tabela =
            estado.abaAtual === "salvos"
                ? CONFIG.tabelaFavoritos
                : CONFIG.tabelaCurtidas;


        if (botao) {

            botao.disabled =
                true;
        }


        try {

            const resultado =
                await supabase
                    .from(tabela)
                    .delete()
                    .eq(
                        "perfil_id",
                        perfilId
                    )
                    .eq(
                        "usuario_id",
                        estado.usuario.id
                    );


            if (resultado.error) {

                throw resultado.error;
            }


            if (
                estado.abaAtual ===
                "salvos"
            ) {

                estado.salvos =
                    estado.salvos.filter(
                        item =>
                            String(
                                item.perfil.id
                            ) !==
                            String(perfilId)
                    );

            } else {

                estado.curtidos =
                    estado.curtidos.filter(
                        item =>
                            String(
                                item.perfil.id
                            ) !==
                            String(perfilId)
                    );
            }


            atualizarContadores();

            renderizarAbaAtual();

        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao remover relacionamento:",
                erro
            );


            if (botao) {

                botao.disabled =
                    false;
            }


            window.alert(
                "Não foi possível remover este perfil. Tente novamente."
            );
        }
    }


    /* =====================================================
       ABRIR PERFIL
    ===================================================== */

    function abrirPerfil(
        perfilId
    ) {

        if (
            perfilId === null ||
            perfilId === undefined ||
            String(perfilId).trim() === ""
        ) {

            return;
        }


        const id =
            encodeURIComponent(
                String(perfilId)
            );


        window.location.href =
            `${CONFIG.paginaPerfil}?id=${id}`;
    }


    /* =====================================================
       VOLTAR
    ===================================================== */

    function voltar() {

        if (
            window.history.length > 1
        ) {

            window.history.back();

            return;
        }


        window.location.href =
            CONFIG.paginaExplorar;
    }


    /* =====================================================
       ESTADOS
    ===================================================== */

    function esconderTodosOsEstados() {

        if (elementos.listaPerfis) {

            elementos.listaPerfis.hidden =
                true;
        }


        if (elementos.estadoCarregando) {

            elementos.estadoCarregando.hidden =
                true;
        }


        if (elementos.estadoErro) {

            elementos.estadoErro.hidden =
                true;
        }


        if (elementos.estadoVazio) {

            elementos.estadoVazio.hidden =
                true;
        }
    }


    function mostrarCarregando(
        ativo
    ) {

        if (!elementos.estadoCarregando) {

            return;
        }


        elementos.estadoCarregando.hidden =
            !ativo;


        if (ativo) {

            if (elementos.listaPerfis) {

                elementos.listaPerfis.hidden =
                    true;
            }


            if (elementos.estadoErro) {

                elementos.estadoErro.hidden =
                    true;
            }


            if (elementos.estadoVazio) {

                elementos.estadoVazio.hidden =
                    true;
            }
        }
    }


    function mostrarErro(
        mensagem
    ) {

        esconderTodosOsEstados();


        if (elementos.estadoErro) {

            elementos.estadoErro.hidden =
                false;
        }


        if (elementos.mensagemErro) {

            elementos.mensagemErro.textContent =
                mensagem ||
                "Tente novamente.";
        }
    }


    function mostrarVazio() {

        esconderTodosOsEstados();


        const salvos =
            estado.abaAtual ===
            "salvos";


        if (elementos.tituloEstadoVazio) {

            elementos.tituloEstadoVazio.textContent =
                salvos
                    ? "Nenhum perfil salvo"
                    : "Nenhum perfil curtido";
        }


        if (elementos.mensagemEstadoVazio) {

            elementos.mensagemEstadoVazio.textContent =
                salvos
                    ? "Quando você salvar um perfil, ele aparecerá aqui."
                    : "Quando você curtir um perfil, ele aparecerá aqui.";
        }


        if (elementos.iconeEstadoVazio) {

            elementos.iconeEstadoVazio.innerHTML =
                salvos
                    ? `
                        <path
                            d="M6 4.5h12v16l-6-3.5-6 3.5z"
                        ></path>
                      `
                    : `
                        <path
                            d="M20.8 8.8c0-2.7-2-4.8-4.7-4.8-1.6 0-3 .8-4.1 2.1C10.9 4.8 9.5 4 7.9 4 5.2 4 3.2 6.1 3.2 8.8c0 5.1 5.4 8.7 8.8 11.2 3.4-2.5 8.8-6.1 8.8-11.2Z"
                        ></path>
                      `;
        }


        if (elementos.estadoVazio) {

            elementos.estadoVazio.hidden =
                false;
        }
    }


    /* =====================================================
       AVATAR
    ===================================================== */

    function obterAvatar(
        perfil,
        artista,
        usuario
    ) {

        return (
            artista?.foto_url ||
            usuario?.foto_url ||
            perfil?.foto_url ||
            ""
        );
    }


    /* =====================================================
       NOME
    ===================================================== */

    function obterNomePerfil(
        perfil,
        usuario
    ) {

        return (
            perfil?.nome_exibicao ||
            usuario?.nome ||
            "Usuário"
        );
    }


    /* =====================================================
       INICIAIS
    ===================================================== */

    function obterIniciais(
        nome
    ) {

        const texto =
            String(
                nome || ""
            ).trim();


        if (!texto) {

            return "MW";
        }


        const partes =
            texto
                .split(/\s+/)
                .filter(Boolean);


        if (
            partes.length === 1
        ) {

            return partes[0]
                .slice(0, 2)
                .toUpperCase();
        }


        return (
            partes[0].charAt(0) +
            partes[
                partes.length - 1
            ].charAt(0)
        ).toUpperCase();
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

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


    /* =====================================================
       ÍCONES
    ===================================================== */

    function iconeBookmark() {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M6 4.5h12v16l-6-3.5-6 3.5z"
                ></path>
            </svg>
        `;
    }


    function iconeCoracao() {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path
                    d="M20.8 8.8c0-2.7-2-4.8-4.7-4.8-1.6 0-3 .8-4.1 2.1C10.9 4.8 9.5 4 7.9 4 5.2 4 3.2 6.1 3.2 8.8c0 5.1 5.4 8.7 8.8 11.2 3.4-2.5 8.8-6.1 8.8-11.2Z"
                ></path>
            </svg>
        `;
    }


    function iconeLixeira() {

        return `
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M4 7h16"></path>
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M6 7l1 13h10l1-13"></path>
                <path d="M9 7V4h6v3"></path>
            </svg>
        `;
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    function redirecionarParaLogin() {

        window.location.href =
            "login.html";
    }


    /* =====================================================
       MENSAGEM DE ERRO
    ===================================================== */

    function obterMensagemErro(
        erro
    ) {

        if (!erro) {

            return "Tente novamente.";
        }


        if (
            erro.message &&
            typeof erro.message ===
                "string"
        ) {

            return erro.message;
        }


        return "Tente novamente.";
    }


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    window.MusicalWorldSalvosCurtidos = {

        iniciar,

        selecionarAba,

        carregarTodasAsListas,

        abrirPerfil
    };


})(window, document);