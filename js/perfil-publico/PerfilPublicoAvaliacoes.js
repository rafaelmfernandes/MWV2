/* =========================================================
   MUSICALWORLD — PERFIL PÚBLICO
   Arquivo: js/perfil-publico/PerfilPublicoAvaliacoes.js

   Responsabilidade:

   - Carregar avaliações públicas diretamente do Supabase.
   - Buscar avaliações ativas da tabela avaliacoes_musicos.
   - Relacionar cada avaliação ao contratante.
   - Buscar dados básicos do avaliador.
   - Renderizar média e quantidade de avaliações.
   - Renderizar distribuição das notas.
   - Renderizar lista de avaliações.
   - Identificar avaliações vinculadas a uma contratação.
   - Considerar avaliações vinculadas a contratação como
     avaliações verificadas.
   - Atualizar o resumo principal do perfil.
   - Trabalhar com todos os tipos de perfil artístico.
   - Manter estado vazio quando não existirem avaliações.

   Observação:

   A tabela atualmente utilizada pelo MusicalWorld é:

       public.avaliacoes_musicos

   Apesar do nome histórico conter "musicos", ela representa
   avaliações de todos os perfis artísticos.

   Estrutura principal utilizada:

       id
       perfil_id
       usuario_avaliador_id
       nota
       comentario
       ativo
       created_at
       updated_at
       contratacao_id

   ========================================================= */

(function (window, document) {

    "use strict";


    /* =========================================================
       DEPENDÊNCIAS
       ========================================================= */

    const Utils =
        window.PerfilPublicoUtils || null;


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        tabelaAvaliacoes:
            "avaliacoes_musicos",

        tabelaUsuarios:
            "usuarios",

        elementos: {

            resumo:
                "reviewsSummary",

            lista:
                "reviewsList",

            mediaPrincipal:
                "ratingValue",

            quantidadePrincipal:
                "ratingReviews"

        },

        notaMinima:
            1,

        notaMaxima:
            5

    };


    /* =========================================================
       ESTADO
       ========================================================= */

    const estado = {

        media:
            0,

        quantidade:
            0,

        distribuicao: {

            cinco:
                0,

            quatro:
                0,

            tres:
                0,

            dois:
                0,

            um:
                0

        },

        avaliacoes:
            [],

        perfilId:
            null,

        carregando:
            false,

        inicializado:
            false

    };


    /* =========================================================
       LOG
       ========================================================= */

    function log(...mensagens) {

        console.log(
            "[PerfilPublicoAvaliacoes]",
            ...mensagens
        );

    }


    function aviso(...mensagens) {

        console.warn(
            "[PerfilPublicoAvaliacoes]",
            ...mensagens
        );

    }


    /* =========================================================
       OBTER SUPABASE
       ========================================================= */

    function obterSupabase() {

        /*
         * O projeto atualmente disponibiliza o cliente através
         * de window.supabaseClient.
         *
         * Também aceitamos window.supabase e a estrutura antiga
         * MusicalWorldSupabase.cliente para compatibilidade.
         */

        const candidatos = [

            {
                nome:
                    "window.supabaseClient",

                cliente:
                    window.supabaseClient
            },

            {
                nome:
                    "window.supabase",

                cliente:
                    window.supabase
            },

            {
                nome:
                    "window.MusicalWorldSupabase.cliente",

                cliente:
                    window.MusicalWorldSupabase?.cliente
            }

        ];


        for (
            const candidato of candidatos
        ) {

            const cliente =
                candidato.cliente;


            if (
                cliente &&
                typeof cliente.from === "function" &&
                cliente.auth &&
                typeof cliente.auth.getSession === "function"
            ) {

                log(
                    "Cliente Supabase selecionado:",
                    candidato.nome
                );


                return cliente;

            }

        }


        console.error(
            "[PerfilPublicoAvaliacoes] Cliente Supabase não encontrado."
        );


        return null;

    }


    /* =========================================================
       INICIALIZAR
       ========================================================= */

    async function inicializar(
        dados = null
    ) {

        log(
            "Inicializando módulo de avaliações..."
        );


        /*
         * Caso a página já tenha fornecido dados,
         * mantemos compatibilidade com versões anteriores.
         */

        if (
            dados &&
            typeof dados === "object"
        ) {

            definirDados(
                dados
            );

        }


        const perfilId =
            obterPerfilId(
                dados
            );


        if (
            perfilId
        ) {

            estado.perfilId =
                perfilId;


            await carregarAvaliacoes(
                perfilId
            );

        } else {

            /*
             * Se não conseguimos descobrir o perfil,
             * utilizamos os dados já existentes ou deixamos
             * o módulo vazio.
             */

            if (
                !dados
            ) {

                limparDados();

            }

        }


        renderizar();


        estado.inicializado =
            true;


        return obterDados();

    }


    /* =========================================================
       OBTER ID DO PERFIL
       ========================================================= */

    function obterPerfilId(
        dados = null
    ) {

        const candidatos = [

            dados?.perfilId,

            dados?.perfil_id,

            dados?.perfil?.id,

            dados?.dados?.perfilId,

            dados?.dados?.perfil_id,

            dados?.dados?.perfil?.id

        ];


        for (
            const valor of candidatos
        ) {

            if (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            ) {

                return valor;

            }

        }


        /*
         * Parâmetros utilizados pelo perfil público.
         */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const parametrosUrl = [

            params.get("id"),

            params.get("perfil_id"),

            params.get("perfilId")

        ];


        for (
            const valor of parametrosUrl
        ) {

            if (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            ) {

                return valor;

            }

        }


        /*
         * Compatibilidade com variáveis globais.
         */

        const globais = [

            window.perfilId,

            window.perfil_id,

            window.PerfilPublico?.perfilId,

            window.MusicalWorldPerfilPublico?.perfilId

        ];


        for (
            const valor of globais
        ) {

            if (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            ) {

                return valor;

            }

        }


        aviso(
            "Não foi possível identificar o perfil para carregar as avaliações."
        );


        return null;

    }


    /* =========================================================
       CARREGAR AVALIAÇÕES DO SUPABASE
       ========================================================= */

    async function carregarAvaliacoes(
        perfilId
    ) {

        if (
            !perfilId
        ) {

            limparDados();

            return;

        }


        if (
            estado.carregando
        ) {

            return;

        }


        estado.carregando =
            true;


        try {

            const supabase =
                obterSupabase();


            if (
                !supabase
            ) {

                limparDados();

                return;

            }


            log(
                "Carregando avaliações do perfil:",
                perfilId
            );


            /* -------------------------------------------------
               BUSCAR AVALIAÇÕES
               ------------------------------------------------- */

            const {
                data: avaliacoesBanco,
                error: avaliacoesError
            } =
                await supabase
                    .from(
                        CONFIG.tabelaAvaliacoes
                    )
                    .select(`
                        id,
                        perfil_id,
                        usuario_avaliador_id,
                        nota,
                        comentario,
                        ativo,
                        created_at,
                        updated_at,
                        contratacao_id
                    `)
                    .eq(
                        "perfil_id",
                        perfilId
                    )
                    .eq(
                        "ativo",
                        true
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (
                avaliacoesError
            ) {

                console.error(
                    "[PerfilPublicoAvaliacoes] Erro ao carregar avaliações:",
                    avaliacoesError
                );


                limparDados();

                return;

            }


            const avaliacoes =
                Array.isArray(
                    avaliacoesBanco
                )
                    ? avaliacoesBanco
                    : [];


            log(
                "Avaliações encontradas:",
                avaliacoes.length
            );


            /* -------------------------------------------------
               BUSCAR IDS DOS AVALIADORES
               ------------------------------------------------- */

            const idsUsuarios =
                [
                    ...new Set(
                        avaliacoes
                            .map(
                                avaliacao =>
                                    avaliacao.usuario_avaliador_id
                            )
                            .filter(
                                Boolean
                            )
                    )
                ];


            let usuarios =
                [];


            /* -------------------------------------------------
               BUSCAR DADOS DOS USUÁRIOS
               ------------------------------------------------- */

            if (
                idsUsuarios.length > 0
            ) {

                const {
                    data,
                    error
                } =
                    await supabase
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
                        );


                if (
                    error
                ) {

                    /*
                     * Se a busca dos usuários falhar,
                     * as avaliações continuam sendo exibidas.
                     *
                     * Nesse caso o nome será "Cliente".
                     */

                    console.error(
                        "[PerfilPublicoAvaliacoes] Erro ao carregar avaliadores:",
                        error
                    );

                } else {

                    usuarios =
                        Array.isArray(data)
                            ? data
                            : [];

                }

            }


            /* -------------------------------------------------
               MAPA DOS USUÁRIOS
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
               NORMALIZAR AVALIAÇÕES
               ------------------------------------------------- */

            estado.avaliacoes =
                avaliacoes
                    .map(
                        avaliacao => {

                            const usuario =
                                mapaUsuarios.get(
                                    avaliacao.usuario_avaliador_id
                                );


                            return normalizarAvaliacao({

                                ...avaliacao,

                                nome:
                                    usuario?.nome ||
                                    "Cliente"

                            });

                        }
                    )
                    .filter(
                        Boolean
                    );


            /* -------------------------------------------------
               CALCULAR RESUMO
               ------------------------------------------------- */

            estado.quantidade =
                estado.avaliacoes.length;


            estado.media =
                calcularMedia(
                    estado.avaliacoes
                );


            estado.distribuicao =
                calcularDistribuicao(
                    estado.avaliacoes
                );


            log(
                "Resumo carregado:",
                {

                    media:
                        estado.media,

                    quantidade:
                        estado.quantidade,

                    distribuicao:
                        estado.distribuicao

                }
            );


        } catch (erro) {

            console.error(
                "[PerfilPublicoAvaliacoes] Erro inesperado:",
                erro
            );


            limparDados();

        } finally {

            estado.carregando =
                false;

        }

    }


    /* =========================================================
       DEFINIR DADOS
       ========================================================= */

    function definirDados(
        dados
    ) {

        if (
            !dados ||
            typeof dados !== "object"
        ) {

            limparDados();

            return;

        }


        if (
            dados.perfilId ||
            dados.perfil_id
        ) {

            estado.perfilId =
                dados.perfilId ||
                dados.perfil_id;

        }


        estado.avaliacoes =
            normalizarAvaliacoes(
                dados.avaliacoes ||
                dados.reviews ||
                dados.lista ||
                []
            );


        estado.quantidade =
            converterNumero(
                dados.quantidade ??
                dados.total ??
                estado.avaliacoes.length
            );


        estado.media =
            normalizarNota(
                dados.media ??
                dados.mediaNota ??
                dados.notaMedia ??
                calcularMedia(
                    estado.avaliacoes
                )
            );


        estado.distribuicao =
            normalizarDistribuicao(
                dados.distribuicao ||
                calcularDistribuicao(
                    estado.avaliacoes
                )
            );


        if (
            !dados.quantidade &&
            !dados.total
        ) {

            estado.quantidade =
                estado.avaliacoes.length;

        }


        if (
            dados.media === undefined &&
            dados.mediaNota === undefined &&
            dados.notaMedia === undefined
        ) {

            estado.media =
                calcularMedia(
                    estado.avaliacoes
                );

        }

    }


    /* =========================================================
       NORMALIZAR LISTA DE AVALIAÇÕES
       ========================================================= */

    function normalizarAvaliacoes(
        avaliacoes
    ) {

        if (
            !Array.isArray(
                avaliacoes
            )
        ) {

            return [];

        }


        return avaliacoes
            .map(
                normalizarAvaliacao
            )
            .filter(
                Boolean
            );

    }


    /* =========================================================
       NORMALIZAR UMA AVALIAÇÃO
       ========================================================= */

    function normalizarAvaliacao(
        avaliacao
    ) {

        if (
            !avaliacao ||
            typeof avaliacao !== "object"
        ) {

            return null;

        }


        const nome =
            obterPrimeiroValor(

                avaliacao.nome,

                avaliacao.nome_usuario,

                avaliacao.nomeUsuario,

                avaliacao.avaliador_nome,

                avaliacao.avaliadorNome,

                avaliacao.contratante_nome,

                avaliacao.contratanteNome,

                "Cliente"

            );


        const comentario =
            obterPrimeiroValor(

                avaliacao.comentario,

                avaliacao.avaliacao,

                avaliacao.texto,

                avaliacao.mensagem,

                avaliacao.observacao,

                avaliacao.descricao,

                ""

            );


        const nota =
            normalizarNota(

                obterPrimeiroValor(

                    avaliacao.nota,

                    avaliacao.rating,

                    avaliacao.estrelas,

                    avaliacao.avaliacao_nota,

                    0

                )

            );


        const data =
            obterPrimeiroValor(

                avaliacao.data,

                avaliacao.data_avaliacao,

                avaliacao.dataAvaliacao,

                avaliacao.created_at,

                avaliacao.createdAt,

                avaliacao.criado_em,

                ""

            );


        const foto =
            obterPrimeiroValor(

                avaliacao.foto,

                avaliacao.avatar,

                avaliacao.foto_url,

                avaliacao.avatar_url,

                avaliacao.avatarUrl,

                ""

            );


        /*
         * Avaliações criadas pelo fluxo de contratação possuem
         * contratacao_id.
         *
         * Como o INSERT é protegido pelo RLS para exigir uma
         * contratação concluída, essa associação representa
         * uma avaliação verificada pelo sistema.
         */

        const verificada =
            Boolean(
                avaliacao.contratacao_id
            );


        const resposta =
            obterPrimeiroValor(

                avaliacao.resposta,

                avaliacao.resposta_artista,

                avaliacao.respostaArtista,

                avaliacao.resposta_contratado,

                ""

            );


        return {

            id:
                obterPrimeiroValor(
                    avaliacao.id
                ),

            perfilId:
                avaliacao.perfil_id ||
                null,

            nome:
                String(
                    nome ||
                    "Cliente"
                ),

            comentario:
                String(
                    comentario ||
                    ""
                ),

            nota,

            data:
                data ||
                "",

            foto:
                foto ||
                "",

            verificada,

            resposta:
                resposta ||
                "",

            contratacaoId:
                avaliacao.contratacao_id ||
                null,

            original:
                avaliacao

        };

    }


    /* =========================================================
       RENDERIZAR
       ========================================================= */

    function renderizar(
        dados = null
    ) {

        if (
            dados !== null &&
            dados !== undefined
        ) {

            definirDados(
                dados
            );

        }


        renderizarResumo();


        renderizarLista();


        atualizarResumoPrincipal();


        renderizarIcones();


        log(
            "Avaliações renderizadas:",
            estado.quantidade
        );

    }


    /* =========================================================
       ATUALIZAR RESUMO PRINCIPAL DO PERFIL
       ========================================================= */

    function atualizarResumoPrincipal() {

        const elementoMedia =
            obterElemento(
                CONFIG.elementos.mediaPrincipal
            );


        const elementoQuantidade =
            obterElemento(
                CONFIG.elementos.quantidadePrincipal
            );


        /*
         * Média principal.
         */

        if (
            elementoMedia
        ) {

            if (
                estado.quantidade > 0
            ) {

                elementoMedia.textContent =
                    estado.media
                        .toFixed(1)
                        .replace(
                            ".",
                            ","
                        );

            } else {

                elementoMedia.textContent =
                    "—";

            }

        }


        /*
         * Quantidade principal.
         */

        if (
            elementoQuantidade
        ) {

            elementoQuantidade.textContent =
                estado.quantidade === 0

                    ? "Nenhuma avaliação"

                    : estado.quantidade === 1

                        ? "1 avaliação"

                        : `${estado.quantidade.toLocaleString(
                            "pt-BR"
                        )} avaliações`;

        }

    }


    /* =========================================================
       RENDERIZAR RESUMO
       ========================================================= */

    function renderizarResumo() {

        const container =
            obterElemento(
                CONFIG.elementos.resumo
            );


        if (
            !container
        ) {

            aviso(
                `Elemento #${CONFIG.elementos.resumo} não encontrado.`
            );


            return;

        }


        /*
         * Quando não existem avaliações, o resumo interno
         * fica vazio.
         *
         * A mensagem de estado vazio aparece na lista.
         */

        if (
            estado.quantidade <= 0
        ) {

            container.innerHTML =
                "";

            return;

        }


        const mediaFormatada =
            estado.media
                .toFixed(1)
                .replace(
                    ".",
                    ","
                );


        container.innerHTML = `

            <div class="reviews-summary-content">

                <div class="reviews-score">

                    <strong class="reviews-average">
                        ${mediaFormatada}
                    </strong>

                    <div class="reviews-stars">

                        ${renderizarEstrelas(
                            estado.media
                        )}

                    </div>

                    <span class="reviews-count">
                        ${formatarQuantidade(
                            estado.quantidade
                        )}
                    </span>

                </div>


                <div class="reviews-distribution">

                    ${renderizarDistribuicao(
                        5,
                        estado.distribuicao.cinco
                    )}

                    ${renderizarDistribuicao(
                        4,
                        estado.distribuicao.quatro
                    )}

                    ${renderizarDistribuicao(
                        3,
                        estado.distribuicao.tres
                    )}

                    ${renderizarDistribuicao(
                        2,
                        estado.distribuicao.dois
                    )}

                    ${renderizarDistribuicao(
                        1,
                        estado.distribuicao.um
                    )}

                </div>

            </div>

        `;

    }


    /* =========================================================
       RENDERIZAR ESTRELAS
       ========================================================= */

    function renderizarEstrelas(
        nota
    ) {

        const notaNormalizada =
            normalizarNota(
                nota
            );


        let html =
            "";


        for (
            let i = 1;
            i <= CONFIG.notaMaxima;
            i++
        ) {

            const preenchida =
                notaNormalizada >= i;


            html += `

                <i
                    data-lucide="star"
                    class="${
                        preenchida
                            ? "star-filled"
                            : "star-empty"
                    }"
                    aria-hidden="true"
                ></i>

            `;

        }


        return html;

    }


    /* =========================================================
       RENDERIZAR DISTRIBUIÇÃO
       ========================================================= */

    function renderizarDistribuicao(
        estrelas,
        quantidade
    ) {

        const total =
            estado.quantidade;


        const percentual =
            total > 0
                ? Math.round(
                    (
                        quantidade /
                        total
                    ) * 100
                )
                : 0;


        return `

            <div
                class="review-distribution-row"
                data-rating="${estrelas}"
            >

                <span class="review-distribution-label">

                    ${estrelas}

                    <i
                        data-lucide="star"
                        aria-hidden="true"
                    ></i>

                </span>


                <div class="review-distribution-bar">

                    <div
                        class="review-distribution-fill"
                        style="width: ${percentual}%"
                    ></div>

                </div>


                <span class="review-distribution-count">
                    ${quantidade}
                </span>

            </div>

        `;

    }


    /* =========================================================
       RENDERIZAR LISTA
       ========================================================= */

    function renderizarLista() {

        const container =
            obterElemento(
                CONFIG.elementos.lista
            );


        if (
            !container
        ) {

            aviso(
                `Elemento #${CONFIG.elementos.lista} não encontrado.`
            );


            return;

        }


        /*
         * Nenhuma avaliação.
         */

        if (
            !estado.avaliacoes.length
        ) {

            container.innerHTML = `

                <div class="empty-state reviews-empty">

                    <i
                        data-lucide="message-square-text"
                        aria-hidden="true"
                    ></i>

                    <h4>
                        Nenhuma avaliação ainda
                    </h4>

                    <p>
                        Depois que os primeiros serviços
                        forem concluídos, as avaliações
                        dos contratantes aparecerão aqui.
                    </p>

                </div>

            `;


            return;

        }


        container.innerHTML =
            estado.avaliacoes
                .map(
                    (
                        avaliacao,
                        indice
                    ) =>
                        renderizarAvaliacao(
                            avaliacao,
                            indice
                        )
                )
                .join("");

    }


    /* =========================================================
       RENDERIZAR AVALIAÇÃO
       ========================================================= */

    function renderizarAvaliacao(
        avaliacao,
        indice
    ) {

        const iniciais =
            obterIniciais(
                avaliacao.nome
            );


        const data =
            formatarData(
                avaliacao.data
            );


        const estrelas =
            renderizarEstrelas(
                avaliacao.nota
            );


        const verificacao =
            avaliacao.verificada

                ? `

                    <span
                        class="review-verified"
                        title="Avaliação vinculada a uma contratação concluída"
                    >

                        <i
                            data-lucide="badge-check"
                            aria-hidden="true"
                        ></i>

                        Verificada

                    </span>

                `

                : "";


        const comentario =
            avaliacao.comentario

                ? `

                    <p class="review-comment">
                        ${escaparHtml(
                            avaliacao.comentario
                        )}
                    </p>

                `

                : "";


        /*
         * A resposta continua preparada para uma futura
         * implementação de resposta do artista.
         */

        const resposta =
            avaliacao.resposta

                ? `

                    <div class="review-response">

                        <div class="review-response-title">

                            <i
                                data-lucide="corner-down-right"
                                aria-hidden="true"
                            ></i>

                            Resposta do artista

                        </div>

                        <p>
                            ${escaparHtml(
                                avaliacao.resposta
                            )}
                        </p>

                    </div>

                `

                : "";


        const avatar =
            avaliacao.foto

                ? `

                    <img
                        src="${escaparAtributo(
                            avaliacao.foto
                        )}"
                        alt="${escaparAtributo(
                            avaliacao.nome
                        )}"
                        class="review-avatar"
                        data-review-avatar
                    >

                `

                : `

                    <div
                        class="review-avatar review-avatar-initials"
                        aria-hidden="true"
                    >

                        ${escaparHtml(
                            iniciais
                        )}

                    </div>

                `;


        return `

            <article
                class="review-item"
                data-review-index="${indice}"
                data-contratacao-id="${
                    escaparAtributo(
                        avaliacao.contratacaoId || ""
                    )
                }"
            >

                <div class="review-avatar-wrapper">

                    ${avatar}

                </div>


                <div class="review-content">

                    <div class="review-header">

                        <div class="review-author">

                            <strong>
                                ${escaparHtml(
                                    avaliacao.nome
                                )}
                            </strong>

                            ${verificacao}

                        </div>


                        ${
                            data

                                ? `

                                    <time
                                        class="review-date"
                                        datetime="${escaparAtributo(
                                            avaliacao.data
                                        )}"
                                    >
                                        ${escaparHtml(
                                            data
                                        )}
                                    </time>

                                `

                                : ""
                        }

                    </div>


                    <div class="review-rating">

                        <div class="review-stars">

                            ${estrelas}

                        </div>

                    </div>


                    ${comentario}


                    ${resposta}

                </div>

            </article>

        `;

    }


    /* =========================================================
       CALCULAR MÉDIA
       ========================================================= */

    function calcularMedia(
        avaliacoes
    ) {

        if (
            !Array.isArray(
                avaliacoes
            ) ||
            !avaliacoes.length
        ) {

            return 0;

        }


        const notas =
            avaliacoes
                .map(
                    avaliacao =>
                        normalizarNota(
                            avaliacao.nota
                        )
                )
                .filter(
                    nota =>
                        nota > 0
                );


        if (
            !notas.length
        ) {

            return 0;

        }


        const soma =
            notas.reduce(
                (
                    total,
                    nota
                ) =>
                    total + nota,
                0
            );


        return (
            soma /
            notas.length
        );

    }


    /* =========================================================
       CALCULAR DISTRIBUIÇÃO
       ========================================================= */

    function calcularDistribuicao(
        avaliacoes
    ) {

        const resultado = {

            cinco:
                0,

            quatro:
                0,

            tres:
                0,

            dois:
                0,

            um:
                0

        };


        if (
            !Array.isArray(
                avaliacoes
            )
        ) {

            return resultado;

        }


        avaliacoes.forEach(
            avaliacao => {

                const nota =
                    Math.round(
                        normalizarNota(
                            avaliacao.nota
                        )
                    );


                switch (
                    nota
                ) {

                    case 5:

                        resultado.cinco++;

                        break;


                    case 4:

                        resultado.quatro++;

                        break;


                    case 3:

                        resultado.tres++;

                        break;


                    case 2:

                        resultado.dois++;

                        break;


                    case 1:

                        resultado.um++;

                        break;

                }

            }
        );


        return resultado;

    }


    /* =========================================================
       NORMALIZAR DISTRIBUIÇÃO
       ========================================================= */

    function normalizarDistribuicao(
        distribuicao
    ) {

        if (
            !distribuicao ||
            typeof distribuicao !== "object"
        ) {

            return {

                cinco:
                    0,

                quatro:
                    0,

                tres:
                    0,

                dois:
                    0,

                um:
                    0

            };

        }


        return {

            cinco:
                converterNumero(
                    distribuicao.cinco ??
                    distribuicao[5] ??
                    distribuicao["5"] ??
                    0
                ),

            quatro:
                converterNumero(
                    distribuicao.quatro ??
                    distribuicao[4] ??
                    distribuicao["4"] ??
                    0
                ),

            tres:
                converterNumero(
                    distribuicao.tres ??
                    distribuicao[3] ??
                    distribuicao["3"] ??
                    0
                ),

            dois:
                converterNumero(
                    distribuicao.dois ??
                    distribuicao[2] ??
                    distribuicao["2"] ??
                    0
                ),

            um:
                converterNumero(
                    distribuicao.um ??
                    distribuicao[1] ??
                    distribuicao["1"] ??
                    0
                )

        };

    }


    /* =========================================================
       NORMALIZAR NOTA
       ========================================================= */

    function normalizarNota(
        valor
    ) {

        const numero =
            converterNumero(
                valor
            );


        if (
            numero <= 0
        ) {

            return 0;

        }


        return Math.min(
            CONFIG.notaMaxima,
            Math.max(
                CONFIG.notaMinima,
                numero
            )
        );

    }


    /* =========================================================
       FORMATAR QUANTIDADE
       ========================================================= */

    function formatarQuantidade(
        quantidade
    ) {

        const numero =
            converterNumero(
                quantidade
            );


        if (
            numero === 1
        ) {

            return "1 avaliação";

        }


        return (
            `${numero.toLocaleString(
                "pt-BR"
            )} avaliações`
        );

    }


    /* =========================================================
       FORMATAR DATA
       ========================================================= */

    function formatarData(
        valor
    ) {

        if (
            !valor
        ) {

            return "";

        }


        const data =
            valor instanceof Date
                ? valor
                : new Date(
                    valor
                );


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return String(
                valor
            );

        }


        return data.toLocaleDateString(
            "pt-BR",
            {

                day:
                    "2-digit",

                month:
                    "long",

                year:
                    "numeric"

            }
        );

    }


    /* =========================================================
       OBTER INICIAIS
       ========================================================= */

    function obterIniciais(
        nome
    ) {

        if (
            Utils &&
            typeof Utils.obterIniciais === "function"
        ) {

            return Utils.obterIniciais(
                nome
            );

        }


        const partes =
            String(
                nome || "C"
            )
                .trim()
                .split(
                    /\s+/
                )
                .filter(
                    Boolean
                );


        if (
            !partes.length
        ) {

            return "C";

        }


        if (
            partes.length === 1
        ) {

            return partes[0]
                .substring(
                    0,
                    2
                )
                .toUpperCase();

        }


        return (

            partes[0][0] +

            partes[
                partes.length - 1
            ][0]

        ).toUpperCase();

    }


    /* =========================================================
       CONVERTER NÚMERO
       ========================================================= */

    function converterNumero(
        valor
    ) {

        if (
            typeof valor === "number"
        ) {

            return Number.isFinite(
                valor
            )
                ? valor
                : 0;

        }


        if (
            valor === null ||
            valor === undefined
        ) {

            return 0;

        }


        let texto =
            String(
                valor
            )
                .trim();


        if (
            !texto
        ) {

            return 0;

        }


        /*
         * Trata números brasileiros.
         *
         * Exemplo:
         *
         * "4,5" -> 4.5
         */

        texto =
            texto.replace(
                ",",
                "."
            );


        const numero =
            Number(
                texto
            );


        return Number.isFinite(
            numero
        )
            ? numero
            : 0;

    }


    /* =========================================================
       OBTER PRIMEIRO VALOR
       ========================================================= */

    function obterPrimeiroValor(
        ...valores
    ) {

        if (
            Utils &&
            typeof Utils.obterPrimeiroValor === "function"
        ) {

            return Utils.obterPrimeiroValor(
                ...valores
            );

        }


        for (
            const valor of valores
        ) {

            if (
                valor !== null &&
                valor !== undefined &&
                String(
                    valor
                ).trim() !== ""
            ) {

                return valor;

            }

        }


        return "";

    }


    /* =========================================================
       ESCAPAR HTML
       ========================================================= */

    function escaparHtml(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.escaparHtml === "function"
        ) {

            return Utils.escaparHtml(
                valor
            );

        }


        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(
            valor
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
       ESCAPAR ATRIBUTO
       ========================================================= */

    function escaparAtributo(
        valor
    ) {

        return escaparHtml(
            valor
        );

    }


    /* =========================================================
       OBTER ELEMENTO
       ========================================================= */

    function obterElemento(
        id
    ) {

        if (
            Utils &&
            typeof Utils.obterElemento === "function"
        ) {

            return Utils.obterElemento(
                id
            );

        }


        return document.getElementById(
            id
        );

    }


    /* =========================================================
       RENDERIZAR ÍCONES
       ========================================================= */

    function renderizarIcones() {

        if (
            Utils &&
            typeof Utils.renderizarIcones === "function"
        ) {

            Utils.renderizarIcones();


            return;

        }


        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* =========================================================
       ATUALIZAR
       ========================================================= */

    async function atualizar(
        dados = null
    ) {

        const perfilId =
            obterPerfilId(
                dados
            ) ||
            estado.perfilId;


        if (
            perfilId
        ) {

            estado.perfilId =
                perfilId;


            await carregarAvaliacoes(
                perfilId
            );

        } else if (
            dados
        ) {

            definirDados(
                dados
            );

        } else {

            limparDados();

        }


        renderizar();


        return obterDados();

    }


    /* =========================================================
       OBTER DADOS
       ========================================================= */

    function obterDados() {

        return {

            perfilId:
                estado.perfilId,

            media:
                estado.media,

            quantidade:
                estado.quantidade,

            distribuicao:
                {
                    ...estado.distribuicao
                },

            avaliacoes:
                [
                    ...estado.avaliacoes
                ]

        };

    }


    /* =========================================================
       OBTER AVALIAÇÕES
       ========================================================= */

    function obterAvaliacoes() {

        return [
            ...estado.avaliacoes
        ];

    }


    /* =========================================================
       LIMPAR DADOS
       ========================================================= */

    function limparDados() {

        estado.media =
            0;


        estado.quantidade =
            0;


        estado.distribuicao = {

            cinco:
                0,

            quatro:
                0,

            tres:
                0,

            dois:
                0,

            um:
                0

        };


        estado.avaliacoes =
            [];

    }


    /* =========================================================
       LIMPAR
       ========================================================= */

    function limpar() {

        limparDados();


        estado.perfilId =
            null;


        estado.inicializado =
            false;


        const resumo =
            obterElemento(
                CONFIG.elementos.resumo
            );


        const lista =
            obterElemento(
                CONFIG.elementos.lista
            );


        if (
            resumo
        ) {

            resumo.innerHTML =
                "";

        }


        if (
            lista
        ) {

            lista.innerHTML =
                "";

        }


        atualizarResumoPrincipal();

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    const PerfilPublicoAvaliacoes = {

        CONFIG,

        estado,

        inicializar,

        renderizar,

        atualizar,

        carregarAvaliacoes,

        obterDados,

        obterAvaliacoes,

        limpar,

        limparDados,

        definirDados,

        normalizarAvaliacao,

        normalizarAvaliacoes,

        calcularMedia,

        calcularDistribuicao,

        normalizarNota

    };


    /* =========================================================
       DISPONIBILIZAR GLOBALMENTE
       ========================================================= */

    window.PerfilPublicoAvaliacoes =
        PerfilPublicoAvaliacoes;


    /* =========================================================
       CONFIRMAÇÃO
       ========================================================= */

    console.log(
        "PerfilPublicoAvaliacoes.js carregado."
    );


})(window, document);