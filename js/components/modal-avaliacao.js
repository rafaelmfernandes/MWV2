/* =========================================================
   MUSICALWORLD — MODAL DE AVALIAÇÃO
   Arquivo: js/components/modal-avaliacao.js

   Responsabilidade:
   - Detectar contratações concluídas ainda não avaliadas.
   - Exibir automaticamente o modal ao retornar ao Index.
   - Permitir avaliação de 1 a 5 estrelas.
   - Permitir comentário opcional.
   - Vincular a avaliação à contratação concluída.
   - Impedir avaliações duplicadas da mesma contratação.
   - Remover da fila somente após o envio bem-sucedido.
   - Trabalhar com todos os tipos de perfil artístico.
   ========================================================= */

(function (window, document) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÕES
       ========================================================= */

    const CONFIG = {

        tabelaContratacoes: "contratacoes",

        tabelaAvaliacoes: "avaliacoes_musicos",

        tabelaUsuarios: "usuarios",

        tabelaPerfis: "perfis",

        tabelaPerfisArtistas: "perfis_artistas",

        tabelaServicos: "servicos_artistas",

        atrasoInicial: 900,

        limiteComentario: 1000,

        notas: {
            1: "Muito ruim",
            2: "Ruim",
            3: "Regular",
            4: "Muito bom",
            5: "Excelente"
        }

    };


    /* =========================================================
       ESTADO INTERNO
       ========================================================= */

    const estado = {

        inicializado: false,

        carregando: false,

        enviando: false,

        aberto: false,

        pendencias: [],

        indiceAtual: 0,

        notaSelecionada: 0,

        usuarioId: null

    };


    /* =========================================================
       UTILITÁRIOS
       ========================================================= */

    function obterSupabase() {

        /*
         * =====================================================
         * CLIENTE SUPABASE
         * =====================================================
         *
         * O projeto atualmente disponibiliza o cliente através
         * de window.supabaseClient e também de window.supabase.
         *
         * Mantemos compatibilidade com uma possível estrutura
         * anterior chamada MusicalWorldSupabase.cliente.
         * =====================================================
         */

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            return window.supabaseClient;

        }


        if (
            window.supabase &&
            typeof window.supabase.from === "function"
        ) {

            return window.supabase;

        }


        if (
            window.MusicalWorldSupabase &&
            window.MusicalWorldSupabase.cliente &&
            typeof window.MusicalWorldSupabase.cliente.from === "function"
        ) {

            return window.MusicalWorldSupabase.cliente;

        }


        console.error(
            "MusicalWorldAvaliacao: cliente Supabase não encontrado."
        );


        return null;

    }


    function obterContainer() {

        let container =
            document.getElementById(
                "modal-avaliacao-container"
            );


        if (!container) {

            container =
                document.createElement("div");


            container.id =
                "modal-avaliacao-container";


            document.body.appendChild(
                container
            );

        }


        return container;

    }


    function escaparHtml(valor) {

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


    function formatarData(data) {

        if (!data) {

            return "Data não informada";

        }


        const dataObj =
            new Date(data);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return "Data não informada";

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


    function formatarHorario(horario) {

        if (!horario) {

            return "";

        }


        return String(horario)
            .slice(0, 5);

    }


    function formatarValor(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return null;

        }


        const numero =
            Number(valor);


        if (
            Number.isNaN(numero)
        ) {

            return null;

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function obterIniciais(nome) {

        const texto =
            String(
                nome || "Usuário"
            ).trim();


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


    function limparMensagem() {

        const container =
            obterContainer();


        const mensagem =
            container.querySelector(
                "[data-avaliacao-mensagem]"
            );


        if (!mensagem) {

            return;

        }


        mensagem.textContent =
            "";


        mensagem.className =
            "mw-avaliacao-mensagem";


        mensagem.hidden =
            true;

    }


    function mostrarMensagem(
        texto,
        tipo = "erro"
    ) {

        const container =
            obterContainer();


        const mensagem =
            container.querySelector(
                "[data-avaliacao-mensagem]"
            );


        if (!mensagem) {

            return;

        }


        mensagem.textContent =
            texto;


        mensagem.className =
            `mw-avaliacao-mensagem ${tipo}`;


        mensagem.hidden =
            false;

    }


    /* =========================================================
       CARREGAMENTO DAS PENDÊNCIAS
       ========================================================= */

    async function carregarPendencias() {

        if (estado.carregando) {

            return;

        }


        estado.carregando =
            true;


        try {

            const supabase =
                obterSupabase();


            if (!supabase) {

                return;

            }


            /* -------------------------------------------------
               CONFIRMA A SESSÃO ATUAL
               ------------------------------------------------- */

            const {
                data: sessaoData,
                error: sessaoError
            } =
                await supabase.auth.getSession();


            if (sessaoError) {

                console.warn(
                    "MusicalWorldAvaliacao: erro ao obter sessão.",
                    sessaoError
                );

                return;

            }


            const sessao =
                sessaoData?.session;


            if (!sessao?.user?.id) {

                console.log(
                    "MusicalWorldAvaliacao: usuário não autenticado."
                );

                return;

            }


            estado.usuarioId =
                sessao.user.id;


            console.log(
                "MusicalWorldAvaliacao: usuário atual:",
                estado.usuarioId
            );


            /* -------------------------------------------------
               BUSCA CONTRATAÇÕES CONCLUÍDAS
               ------------------------------------------------- */

            const {
                data: contratacoes,
                error: contratacoesError
            } =
                await supabase
                    .from(
                        CONFIG.tabelaContratacoes
                    )
                    .select(`
                        id,
                        contratante_id,
                        contratado_id,
                        servico_id,
                        data_evento,
                        horario_inicio,
                        horario_fim,
                        valor,
                        tipo_evento,
                        local,
                        observacoes,
                        status,
                        status_pagamento,
                        created_at,
                        updated_at
                    `)
                    .eq(
                        "contratante_id",
                        estado.usuarioId
                    )
                    .eq(
                        "status",
                        "concluida"
                    )
                    .order(
                        "data_evento",
                        {
                            ascending: false
                        }
                    );


            if (contratacoesError) {

                console.error(
                    "MusicalWorldAvaliacao: erro ao carregar contratações concluídas.",
                    contratacoesError
                );

                return;

            }


            console.log(
                "MusicalWorldAvaliacao: contratações concluídas encontradas:",
                contratacoes?.length || 0
            );


            if (
                !contratacoes ||
                contratacoes.length === 0
            ) {

                estado.pendencias =
                    [];

                return;

            }


            /* -------------------------------------------------
               BUSCA AVALIAÇÕES JÁ EXISTENTES
               ------------------------------------------------- */

            const idsContratacoes =
                contratacoes
                    .map(
                        contratacao =>
                            contratacao.id
                    )
                    .filter(Boolean);


            const {
                data: avaliacoes,
                error: avaliacoesError
            } =
                await supabase
                    .from(
                        CONFIG.tabelaAvaliacoes
                    )
                    .select(`
                        id,
                        contratacao_id,
                        perfil_id,
                        usuario_avaliador_id,
                        nota,
                        comentario,
                        ativo,
                        created_at
                    `)
                    .in(
                        "contratacao_id",
                        idsContratacoes
                    );


            if (avaliacoesError) {

                console.error(
                    "MusicalWorldAvaliacao: erro ao verificar avaliações existentes.",
                    avaliacoesError
                );

                return;

            }


            console.log(
                "MusicalWorldAvaliacao: avaliações existentes encontradas:",
                avaliacoes?.length || 0
            );


            /* -------------------------------------------------
               MAPA DE CONTRATAÇÕES JÁ AVALIADAS
               ------------------------------------------------- */

            const avaliadas =
                new Set(
                    (avaliacoes || [])
                        .map(
                            avaliacao =>
                                avaliacao.contratacao_id
                        )
                        .filter(Boolean)
                );


            /* -------------------------------------------------
               FILTRA SOMENTE CONTRATAÇÕES PENDENTES
               ------------------------------------------------- */

            const pendentes =
                contratacoes.filter(
                    contratacao =>
                        !avaliadas.has(
                            contratacao.id
                        )
                );


            console.log(
                "MusicalWorldAvaliacao: avaliações pendentes:",
                pendentes.length
            );


            if (
                pendentes.length === 0
            ) {

                estado.pendencias =
                    [];

                return;

            }


            /* -------------------------------------------------
               IDS NECESSÁRIOS
               ------------------------------------------------- */

            const idsUsuarios =
                [
                    ...new Set(
                        pendentes.map(
                            contratacao =>
                                contratacao.contratado_id
                        )
                    )
                ].filter(Boolean);


            const idsServicos =
                [
                    ...new Set(
                        pendentes.map(
                            contratacao =>
                                contratacao.servico_id
                        )
                    )
                ].filter(Boolean);


            /* -------------------------------------------------
               BUSCA USUÁRIOS, PERFIS E SERVIÇOS
               ------------------------------------------------- */

            const [
                usuariosResult,
                perfisResult,
                servicosResult
            ] =
                await Promise.all([

                    supabase
                        .from(
                            CONFIG.tabelaUsuarios
                        )
                        .select(`
                            id,
                            nome,
                            email
                        `)
                        .in(
                            "id",
                            idsUsuarios
                        ),

                    supabase
                        .from(
                            CONFIG.tabelaPerfis
                        )
                        .select(`
                            id,
                            usuario_id,
                            tipo_perfil_id,
                            nome_exibicao,
                            descricao,
                            ativo,
                            perfil_publicado
                        `)
                        .in(
                            "usuario_id",
                            idsUsuarios
                        )
                        .eq(
                            "ativo",
                            true
                        ),

                    idsServicos.length > 0

                        ? supabase
                            .from(
                                CONFIG.tabelaServicos
                            )
                            .select(`
                                id,
                                perfil_id,
                                nome_servico,
                                descricao,
                                duracao,
                                tipo_preco,
                                valor,
                                ativo
                            `)
                            .in(
                                "id",
                                idsServicos
                            )

                        : Promise.resolve({
                            data: [],
                            error: null
                        })

                ]);


            if (usuariosResult.error) {

                console.error(
                    "MusicalWorldAvaliacao: erro ao carregar usuários.",
                    usuariosResult.error
                );

                return;

            }


            if (perfisResult.error) {

                console.error(
                    "MusicalWorldAvaliacao: erro ao carregar perfis.",
                    perfisResult.error
                );

                return;

            }


            if (servicosResult.error) {

                console.error(
                    "MusicalWorldAvaliacao: erro ao carregar serviços.",
                    servicosResult.error
                );

                return;

            }


            const usuarios =
                usuariosResult.data || [];


            const perfis =
                perfisResult.data || [];


            const servicos =
                servicosResult.data || [];


            console.log(
                "MusicalWorldAvaliacao: dados complementares:",
                {
                    usuarios: usuarios.length,
                    perfis: perfis.length,
                    servicos: servicos.length
                }
            );


            /* -------------------------------------------------
               MAPA DE USUÁRIOS
               ------------------------------------------------- */

            const mapaUsuarios =
                new Map(
                    usuarios.map(
                        usuario => [
                            usuario.id,
                            usuario
                        ]
                    )
                );


            /* -------------------------------------------------
               MAPA DE PERFIS POR USUÁRIO
               ------------------------------------------------- */

            const mapaPerfisUsuario =
                new Map();


            perfis.forEach(
                perfil => {

                    if (
                        !mapaPerfisUsuario.has(
                            perfil.usuario_id
                        )
                    ) {

                        mapaPerfisUsuario.set(
                            perfil.usuario_id,
                            perfil
                        );

                    }

                }
            );


            /* -------------------------------------------------
               MAPA DE SERVIÇOS
               ------------------------------------------------- */

            const mapaServicos =
                new Map(
                    servicos.map(
                        servico => [
                            servico.id,
                            servico
                        ]
                    )
                );


            /* -------------------------------------------------
               BUSCA DADOS ARTÍSTICOS
               ------------------------------------------------- */

            const idsPerfis =
                perfis
                    .map(
                        perfil =>
                            perfil.id
                    )
                    .filter(Boolean);


            let perfisArtistas =
                [];


            if (
                idsPerfis.length > 0
            ) {

                const {
                    data,
                    error
                } =
                    await supabase
                        .from(
                            CONFIG.tabelaPerfisArtistas
                        )
                        .select(`
                            perfil_id,
                            tipo_artista,
                            localizacao,
                            experiencia,
                            area_atendimento,
                            disponivel,
                            instrumentos,
                            estilos,
                            servicos,
                            foto_url
                        `)
                        .in(
                            "perfil_id",
                            idsPerfis
                        );


                if (error) {

                    console.error(
                        "MusicalWorldAvaliacao: erro ao carregar dados artísticos.",
                        error
                    );

                    return;

                }


                perfisArtistas =
                    data || [];

            }


            const mapaArtistas =
                new Map(
                    perfisArtistas.map(
                        artista => [
                            artista.perfil_id,
                            artista
                        ]
                    )
                );


            /* -------------------------------------------------
               MONTA OBJETOS DAS PENDÊNCIAS
               ------------------------------------------------- */

            const listaPendencias =
                pendentes
                    .map(
                        contratacao => {

                            const usuario =
                                mapaUsuarios.get(
                                    contratacao.contratado_id
                                );


                            const perfil =
                                mapaPerfisUsuario.get(
                                    contratacao.contratado_id
                                );


                            const servico =
                                mapaServicos.get(
                                    contratacao.servico_id
                                );


                            const artista =
                                perfil
                                    ? mapaArtistas.get(
                                        perfil.id
                                    )
                                    : null;


                            /*
                             * A avaliação precisa apontar para um
                             * perfil existente.
                             */

                            if (!perfil) {

                                console.warn(
                                    "MusicalWorldAvaliacao: contratação sem perfil válido.",
                                    {
                                        contratacaoId:
                                            contratacao.id,

                                        contratadoId:
                                            contratacao.contratado_id
                                    }
                                );

                                return null;

                            }


                            return {

                                contratacao,

                                usuario,

                                perfil,

                                artista,

                                servico

                            };

                        }
                    )
                    .filter(Boolean);


            estado.pendencias =
                listaPendencias;


            estado.indiceAtual =
                0;


            estado.notaSelecionada =
                0;


            console.log(
                "MusicalWorldAvaliacao: pendências prontas para exibição:",
                estado.pendencias.length
            );


        } catch (erro) {

            console.error(
                "MusicalWorldAvaliacao: erro inesperado ao carregar pendências.",
                erro
            );

        } finally {

            estado.carregando =
                false;

        }

    }


    /* =========================================================
       ÍCONE DE ESTRELA
       ========================================================= */

    function criarEstrelaSvg() {

        return `
            <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="M12 3.8l2.53 5.13 5.66.82-4.09 3.99.97 5.64L12 16.72l-5.07 2.66.97-5.64-4.09-3.99 5.66-.82L12 3.8z"
                    fill="currentColor"
                ></path>
            </svg>
        `;

    }


    /* =========================================================
       RENDERIZAÇÃO DO MODAL
       ========================================================= */

    function renderizarModal() {

        const container =
            obterContainer();


        const pendencias =
            estado.pendencias;


        if (
            !pendencias.length ||
            estado.indiceAtual >= pendencias.length
        ) {

            fecharModal();

            return;

        }


        const item =
            pendencias[
                estado.indiceAtual
            ];


        const contratacao =
            item.contratacao;


        const usuario =
            item.usuario;


        const perfil =
            item.perfil;


        const artista =
            item.artista;


        const servico =
            item.servico;


        const nomeArtista =
            perfil?.nome_exibicao ||
            usuario?.nome ||
            "Profissional";


        const tipoArtista =
            artista?.tipo_artista ||
            "Artista";


        const foto =
            artista?.foto_url ||
            "";


        const iniciais =
            obterIniciais(
                nomeArtista
            );


        const valor =
            formatarValor(
                contratacao.valor
            );


        const horarioInicio =
            formatarHorario(
                contratacao.horario_inicio
            );


        const horarioFim =
            formatarHorario(
                contratacao.horario_fim
            );


        const horario =
            horarioInicio
                ? (
                    horarioFim
                        ? `${horarioInicio} - ${horarioFim}`
                        : horarioInicio
                )
                : "";


        const localTexto =
            typeof contratacao.local === "string"
                ? contratacao.local
                : "";


        const descricaoServico =
            servico?.descricao ||
            "";


        const nomeServico =
            servico?.nome_servico ||
            "Serviço contratado";


        const fotoHtml =
            foto

                ? `
                    <img
                        class="mw-avaliacao-artista-foto"
                        src="${escaparHtml(foto)}"
                        alt="Foto de ${escaparHtml(nomeArtista)}"
                    >
                `

                : `
                    <span
                        class="mw-avaliacao-artista-iniciais"
                        aria-hidden="true"
                    >
                        ${escaparHtml(iniciais)}
                    </span>
                `;


        const estrelasHtml =
            [1, 2, 3, 4, 5]
                .map(
                    nota => `
                        <button
                            type="button"
                            class="mw-avaliacao-estrela"
                            data-nota="${nota}"
                            aria-label="${nota} estrela${nota > 1 ? "s" : ""}"
                            aria-pressed="false"
                        >
                            ${criarEstrelaSvg()}
                        </button>
                    `
                )
                .join("");


        container.innerHTML = `

            <div
                class="mw-avaliacao-overlay"
                data-modal-avaliacao
                role="presentation"
            >

                <section
                    class="mw-avaliacao-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mw-avaliacao-titulo"
                >

                    <button
                        type="button"
                        class="mw-avaliacao-fechar"
                        data-acao="fechar"
                        aria-label="Fechar"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            aria-hidden="true"
                        >
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                            ></path>
                        </svg>
                    </button>


                    <div class="mw-avaliacao-cabecalho">

                        <span class="mw-avaliacao-etiqueta">
                            Serviço concluído
                        </span>

                        <h2
                            id="mw-avaliacao-titulo"
                            class="mw-avaliacao-titulo"
                        >
                            Como foi sua experiência?
                        </h2>

                        <p class="mw-avaliacao-subtitulo">
                            Avalie o profissional que realizou
                            este serviço para você.
                        </p>

                    </div>


                    <div class="mw-avaliacao-artista">

                        <div class="mw-avaliacao-artista-avatar">
                            ${fotoHtml}
                        </div>


                        <div class="mw-avaliacao-artista-dados">

                            <strong>
                                ${escaparHtml(nomeArtista)}
                            </strong>

                            <span>
                                ${escaparHtml(tipoArtista)}
                            </span>

                        </div>

                    </div>


                    <div class="mw-avaliacao-servico">

                        <div class="mw-avaliacao-servico-cabecalho">

                            <div>

                                <span class="mw-avaliacao-label">
                                    Serviço
                                </span>

                                <strong>
                                    ${escaparHtml(nomeServico)}
                                </strong>

                            </div>

                        </div>


                        <div class="mw-avaliacao-servico-info">

                            <span>
                                ${formatarData(
                                    contratacao.data_evento
                                )}
                            </span>


                            ${
                                horario
                                    ? `
                                        <span>
                                            ${escaparHtml(horario)}
                                        </span>
                                    `
                                    : ""
                            }


                            ${
                                contratacao.tipo_evento
                                    ? `
                                        <span>
                                            ${escaparHtml(
                                                contratacao.tipo_evento
                                            )}
                                        </span>
                                    `
                                    : ""
                            }


                            ${
                                localTexto
                                    ? `
                                        <span>
                                            ${escaparHtml(
                                                localTexto
                                            )}
                                        </span>
                                    `
                                    : ""
                            }


                            ${
                                valor
                                    ? `
                                        <span>
                                            ${escaparHtml(valor)}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>


                        ${
                            descricaoServico
                                ? `
                                    <p class="mw-avaliacao-servico-descricao">
                                        ${escaparHtml(
                                            descricaoServico
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>


                    <div class="mw-avaliacao-pergunta">

                        <span class="mw-avaliacao-label">
                            Sua avaliação
                        </span>


                        <div
                            class="mw-avaliacao-estrelas"
                            role="group"
                            aria-label="Escolha uma nota de 1 a 5 estrelas"
                        >
                            ${estrelasHtml}
                        </div>


                        <p
                            class="mw-avaliacao-nota-descricao"
                            data-nota-descricao
                        >
                            Selecione uma nota
                        </p>

                    </div>


                    <div class="mw-avaliacao-comentario">

                        <label
                            for="mw-avaliacao-textarea"
                            class="mw-avaliacao-label"
                        >
                            Comentário
                            <span>opcional</span>
                        </label>


                        <textarea
                            id="mw-avaliacao-textarea"
                            data-comentario
                            maxlength="${CONFIG.limiteComentario}"
                            placeholder="Conte como foi sua experiência"
                        ></textarea>


                        <div class="mw-avaliacao-contador">

                            <span data-contador-comentario>
                                0/${CONFIG.limiteComentario}
                            </span>

                        </div>

                    </div>


                    <div
                        class="mw-avaliacao-mensagem"
                        data-avaliacao-mensagem
                        hidden
                    ></div>


                    <div class="mw-avaliacao-acoes">

                        <button
                            type="button"
                            class="mw-avaliacao-botao secundario"
                            data-acao="agora-nao"
                        >
                            Agora não
                        </button>


                        <button
                            type="button"
                            class="mw-avaliacao-botao primario"
                            data-acao="enviar"
                            disabled
                        >
                            Enviar avaliação
                        </button>

                    </div>


                    <div class="mw-avaliacao-pendencias">

                        <span>
                            ${pendencias.length}
                            avaliação${pendencias.length > 1 ? "ões" : ""}
                            pendente${pendencias.length > 1 ? "s" : ""}
                        </span>

                    </div>

                </section>

            </div>

        `;


        aplicarEstadoVisualEstrelas();


        configurarEventosModal();

    }


    /* =========================================================
       APLICA ESTADO VISUAL DAS ESTRELAS
       ========================================================= */

    function aplicarEstadoVisualEstrelas() {

        const container =
            obterContainer();


        const nota =
            estado.notaSelecionada;


        container
            .querySelectorAll(
                ".mw-avaliacao-estrela"
            )
            .forEach(
                estrela => {

                    const valor =
                        Number(
                            estrela.dataset.nota
                        );


                    const selecionada =
                        valor <= nota;


                    estrela.classList.toggle(
                        "selecionada",
                        selecionada
                    );


                    estrela.setAttribute(
                        "aria-pressed",
                        selecionada
                            ? "true"
                            : "false"
                    );

                }
            );


        const descricao =
            container.querySelector(
                "[data-nota-descricao]"
            );


        if (descricao) {

            descricao.textContent =
                CONFIG.notas[nota] ||
                "Selecione uma nota";

        }


        const botao =
            container.querySelector(
                '[data-acao="enviar"]'
            );


        if (botao) {

            botao.disabled =
                estado.notaSelecionada < 1;

        }

    }


    /* =========================================================
       SELECIONAR NOTA
       ========================================================= */

    function selecionarNota(nota) {

        if (
            !Number.isInteger(nota) ||
            nota < 1 ||
            nota > 5
        ) {

            return;

        }


        estado.notaSelecionada =
            nota;


        const container =
            obterContainer();


        container
            .querySelectorAll(
                ".mw-avaliacao-estrela"
            )
            .forEach(
                estrela => {

                    const valor =
                        Number(
                            estrela.dataset.nota
                        );


                    const selecionada =
                        valor <= nota;


                    estrela.classList.toggle(
                        "selecionada",
                        selecionada
                    );


                    estrela.setAttribute(
                        "aria-pressed",
                        selecionada
                            ? "true"
                            : "false"
                    );

                }
            );


        const descricao =
            container.querySelector(
                "[data-nota-descricao]"
            );


        if (descricao) {

            descricao.textContent =
                CONFIG.notas[nota];

        }


        const botao =
            container.querySelector(
                '[data-acao="enviar"]'
            );


        if (botao) {

            botao.disabled =
                false;

        }


        limparMensagem();

    }


    /* =========================================================
       CONTADOR DO COMENTÁRIO
       ========================================================= */

    function atualizarContadorComentario() {

        const container =
            obterContainer();


        const textarea =
            container.querySelector(
                "[data-comentario]"
            );


        const contador =
            container.querySelector(
                "[data-contador-comentario]"
            );


        if (
            !textarea ||
            !contador
        ) {

            return;

        }


        contador.textContent =
            `${textarea.value.length}/${CONFIG.limiteComentario}`;

    }


    /* =========================================================
       CONFIGURAÇÃO DOS EVENTOS DO MODAL
       ========================================================= */

    function configurarEventosModal() {

        const container =
            obterContainer();


        /* -----------------------------------------------------
           FECHAR
           ----------------------------------------------------- */

        const botoesFechar =
            container.querySelectorAll(
                '[data-acao="fechar"], [data-acao="agora-nao"]'
            );


        botoesFechar.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    fecharModal
                );

            }
        );


        /* -----------------------------------------------------
           CLIQUE NO OVERLAY
           ----------------------------------------------------- */

        const overlay =
            container.querySelector(
                ".mw-avaliacao-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                evento => {

                    if (
                        evento.target === overlay
                    ) {

                        fecharModal();

                    }

                }
            );

        }


        /* -----------------------------------------------------
           ESTRELAS
           ----------------------------------------------------- */

        container
            .querySelectorAll(
                ".mw-avaliacao-estrela"
            )
            .forEach(
                estrela => {

                    estrela.addEventListener(
                        "click",
                        () => {

                            selecionarNota(
                                Number(
                                    estrela.dataset.nota
                                )
                            );

                        }
                    );

                }
            );


        /* -----------------------------------------------------
           COMENTÁRIO
           ----------------------------------------------------- */

        const textarea =
            container.querySelector(
                "[data-comentario]"
            );


        if (textarea) {

            textarea.addEventListener(
                "input",
                atualizarContadorComentario
            );

        }


        /* -----------------------------------------------------
           ENVIO
           ----------------------------------------------------- */

        const botaoEnviar =
            container.querySelector(
                '[data-acao="enviar"]'
            );


        if (botaoEnviar) {

            botaoEnviar.addEventListener(
                "click",
                enviarAvaliacao
            );

        }

    }


    /* =========================================================
       ENVIAR AVALIAÇÃO
       ========================================================= */

    async function enviarAvaliacao() {

        if (estado.enviando) {

            return;

        }


        const item =
            estado.pendencias[
                estado.indiceAtual
            ];


        if (!item) {

            return;

        }


        /* -----------------------------------------------------
           VALIDA NOTA
           ----------------------------------------------------- */

        const nota =
            Number(
                estado.notaSelecionada
            );


        if (
            !Number.isInteger(nota) ||
            nota < 1 ||
            nota > 5
        ) {

            mostrarMensagem(
                "Selecione uma nota de 1 a 5 estrelas."
            );

            return;

        }


        const container =
            obterContainer();


        const textarea =
            container.querySelector(
                "[data-comentario]"
            );


        const comentario =
            textarea
                ? textarea.value.trim()
                : "";


        if (
            comentario.length >
            CONFIG.limiteComentario
        ) {

            mostrarMensagem(
                `O comentário pode ter no máximo ${CONFIG.limiteComentario} caracteres.`
            );

            return;

        }


        estado.enviando =
            true;


        limparMensagem();


        const botaoEnviar =
            container.querySelector(
                '[data-acao="enviar"]'
            );


        if (botaoEnviar) {

            botaoEnviar.disabled =
                true;


            botaoEnviar.textContent =
                "Enviando...";

        }


        try {

            const supabase =
                obterSupabase();


            if (!supabase) {

                throw new Error(
                    "Cliente Supabase não encontrado."
                );

            }


            /* -------------------------------------------------
               CONFIRMA NOVAMENTE A SESSÃO
               ------------------------------------------------- */

            const {
                data: sessaoData,
                error: sessaoError
            } =
                await supabase.auth.getSession();


            if (
                sessaoError ||
                !sessaoData?.session?.user?.id
            ) {

                throw new Error(
                    "Sua sessão não está disponível. Faça login novamente."
                );

            }


            const usuarioId =
                sessaoData.session.user.id;


            /* -------------------------------------------------
               REVALIDA A CONTRATAÇÃO
               ------------------------------------------------- */

            const {
                data: contratacaoAtual,
                error: contratacaoError
            } =
                await supabase
                    .from(
                        CONFIG.tabelaContratacoes
                    )
                    .select(`
                        id,
                        contratante_id,
                        contratado_id,
                        status
                    `)
                    .eq(
                        "id",
                        item.contratacao.id
                    )
                    .eq(
                        "contratante_id",
                        usuarioId
                    )
                    .eq(
                        "status",
                        "concluida"
                    )
                    .maybeSingle();


            if (contratacaoError) {

                throw contratacaoError;

            }


            if (!contratacaoAtual) {

                throw new Error(
                    "Essa contratação não está mais disponível para avaliação."
                );

            }


            /* -------------------------------------------------
               CONFIRMA O ARTISTA
               ------------------------------------------------- */

            if (
                contratacaoAtual.contratado_id !==
                item.contratacao.contratado_id
            ) {

                throw new Error(
                    "O profissional desta contratação foi alterado."
                );

            }


            /* -------------------------------------------------
               INSERE A AVALIAÇÃO
               ------------------------------------------------- */

            const {
                error: inserirError
            } =
                await supabase
                    .from(
                        CONFIG.tabelaAvaliacoes
                    )
                    .insert({

                        perfil_id:
                            item.perfil.id,

                        usuario_avaliador_id:
                            usuarioId,

                        nota,

                        comentario:
                            comentario || null,

                        contratacao_id:
                            item.contratacao.id,

                        ativo:
                            true

                    });


            /* -------------------------------------------------
               TRATA DUPLICIDADE
               ------------------------------------------------- */

            if (inserirError) {

                /*
                 * 23505 = índice UNIQUE.
                 *
                 * A contratação já recebeu uma avaliação.
                 */

                if (
                    inserirError.code ===
                    "23505"
                ) {

                    estado.pendencias.splice(
                        estado.indiceAtual,
                        1
                    );


                    estado.notaSelecionada =
                        0;


                    if (
                        estado.pendencias.length === 0
                    ) {

                        fecharModal();

                    } else {

                        if (
                            estado.indiceAtual >=
                            estado.pendencias.length
                        ) {

                            estado.indiceAtual =
                                estado.pendencias.length - 1;

                        }


                        renderizarModal();

                    }


                    return;

                }


                throw inserirError;

            }


            /* -------------------------------------------------
               SUCESSO
               ------------------------------------------------- */

            console.log(
                "MusicalWorldAvaliacao: avaliação enviada com sucesso.",
                item.contratacao.id
            );


            estado.pendencias.splice(
                estado.indiceAtual,
                1
            );


            estado.notaSelecionada =
                0;


            /*
             * O mesmo índice será usado para mostrar o próximo
             * item da fila.
             */

            if (
                estado.indiceAtual >=
                estado.pendencias.length
            ) {

                estado.indiceAtual =
                    estado.pendencias.length - 1;

            }


            /* -------------------------------------------------
               NÃO EXISTEM MAIS AVALIAÇÕES
               ------------------------------------------------- */

            if (
                estado.pendencias.length === 0
            ) {

                fecharModal();

                return;

            }


            /* -------------------------------------------------
               MOSTRA A PRÓXIMA AVALIAÇÃO
               ------------------------------------------------- */

            renderizarModal();


        } catch (erro) {

            console.error(
                "MusicalWorldAvaliacao: erro ao enviar avaliação.",
                erro
            );


            mostrarMensagem(
                erro?.message ||
                "Não foi possível enviar sua avaliação. Tente novamente."
            );


            if (botaoEnviar) {

                botaoEnviar.disabled =
                    estado.notaSelecionada < 1;


                botaoEnviar.textContent =
                    "Enviar avaliação";

            }


        } finally {

            estado.enviando =
                false;

        }

    }


    /* =========================================================
       ABRIR MODAL
       ========================================================= */

    async function abrirModal() {

        if (estado.aberto) {

            return;

        }


        await carregarPendencias();


        if (
            !estado.pendencias.length
        ) {

            console.log(
                "MusicalWorldAvaliacao: nenhuma avaliação pendente para este usuário."
            );

            return;

        }


        estado.aberto =
            true;


        estado.indiceAtual =
            0;


        estado.notaSelecionada =
            0;


        renderizarModal();


        document.body.classList.add(
            "mw-avaliacao-modal-aberto"
        );


        /* -----------------------------------------------------
           FOCO INICIAL
           ----------------------------------------------------- */

        setTimeout(
            () => {

                const container =
                    obterContainer();


                const botaoFechar =
                    container.querySelector(
                        '[data-acao="fechar"]'
                    );


                if (botaoFechar) {

                    botaoFechar.focus();

                }

            },
            50
        );

    }


    /* =========================================================
       FECHAR MODAL
       ========================================================= */

    function fecharModal() {

        estado.aberto =
            false;


        estado.enviando =
            false;


        estado.notaSelecionada =
            0;


        document.body.classList.remove(
            "mw-avaliacao-modal-aberto"
        );


        const container =
            obterContainer();


        container.innerHTML =
            "";

    }


    /* =========================================================
       TECLA ESC
       ========================================================= */

    function tratarTeclaEsc(evento) {

        if (
            evento.key === "Escape" &&
            estado.aberto
        ) {

            fecharModal();

        }

    }


    document.addEventListener(
        "keydown",
        tratarTeclaEsc
    );


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    async function iniciar() {

        if (estado.inicializado) {

            return;

        }


        estado.inicializado =
            true;


        /*
         * Pequeno atraso para permitir que:
         *
         * 1. O cliente Supabase seja carregado.
         * 2. A sessão seja restaurada.
         * 3. Os componentes principais do Index sejam
         *    inicializados.
         */

        setTimeout(
            async () => {

                try {

                    await abrirModal();

                } catch (erro) {

                    console.error(
                        "MusicalWorldAvaliacao: erro ao inicializar.",
                        erro
                    );

                }

            },
            CONFIG.atrasoInicial
        );

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.MusicalWorldModalAvaliacao = {

        iniciar,

        abrir: abrirModal,

        fechar: fecharModal,

        recarregar: carregarPendencias

    };


})(window, document);