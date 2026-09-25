/* =========================================================
   MUSICALWORLD — FEED PRINCIPAL

   Arquivo:
   js/index/main.js

   Responsabilidades:

   - Inicializar o feed principal.
   - Controlar os filtros aplicados ao feed.
   - Consultar os profissionais no Supabase.
   - Consultar as oportunidades abertas.
   - Consultar os interessados das oportunidades.
   - Consultar as visualizações das oportunidades.
   - Registrar visualizações únicas por usuário.
   - Montar uma timeline única.
   - Ordenar profissionais e oportunidades por data.
   - Entregar cada tipo de conteúdo ao seu renderer.
   - Atualizar os elementos gerais da interface do feed.
   - Coordenar anuncio.js e anuncio-oportunidade.js.
   - Coordenar o módulo de paginação.
   - Impedir que o criador de uma oportunidade registre
     interesse na própria oportunidade.
   - Contabilizar somente uma visualização por usuário
     para cada oportunidade.

   Renderizadores utilizados:

   - MusicalWorldAnuncio
   - MusicalWorldAnuncioOportunidade

   Paginação:

   - MusicalWorldPaginacao

   Núcleo:

   - MusicalWorldSupabase
   - supabaseClient
   - supabase

   Este arquivo NÃO é responsável por:

   - Criar HTML interno dos cards profissionais.
   - Criar HTML interno dos cards de oportunidade.
   - Controlar vídeos diretamente.
   - Controlar o menu dos anúncios.
   - Controlar a identidade visual dos cards.
   - Controlar filtros.
   - Criar o feed.
   - Controlar a paginação internamente.
========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO GERAL DO FEED
    ===================================================== */

    const FEED_CONFIG = {

        filtros: {

            estado: "",
            cidade: "",
            categoria: "",
            instrumento: "",
            estilo: "",

            valorMin: null,
            valorMax: null

        },

        /*
         * O RPC atual dos profissionais foi criado para
         * receber paginação.
         *
         * Para uma timeline realmente cronológica,
         * precisamos conhecer os profissionais que podem
         * ocupar cada posição junto das oportunidades.
         *
         * O limite de 1000 mantém essa primeira versão
         * compatível com o limite padrão do Supabase.
         */
        limiteFonteProfissionais: 1000,

        /*
         * Quantidade visual de itens por página.
         *
         * Continua compatível com o paginacao.js atual.
         */
        limitePorPagina: 12,

        inicializado: false

    };


    /* =====================================================
       REFERÊNCIAS DO DOM
    ===================================================== */

    let feedContainer = null;
    let loadingElement = null;
    let endElement = null;
    let emptyElement = null;
    let sentinelElement = null;
    let counterElement = null;


    /* =====================================================
       CACHE DA TIMELINE

       Estes dados representam a fonte atual do feed.
    ===================================================== */

    let timelineCache = [];

    let profissionaisCache = [];

    let oportunidadesCache = [];

    let fonteCarregada = false;


    /* =====================================================
       CONTROLE DO ESTADO DA PAGINAÇÃO
    ===================================================== */

    let itensTimelineRenderizados = 0;


    /* =====================================================
       CONTROLE DAS VISUALIZAÇÕES

       O Set guarda as combinações:

       oportunidadeId + usuarioId

       que já foram conhecidas como visualizadas pelo
       usuário atual.

       Dessa forma, uma mesma pessoa não gera uma nova
       visualização quando volta ao feed posteriormente.
    ===================================================== */

    const visualizacoesRegistradas =
        new Set();


    /*
     * IntersectionObserver utilizado para identificar
     * quando um card de oportunidade realmente entra
     * na área visível do feed.
     */
    let observadorVisualizacoes =
        null;


    /* =====================================================
       OBTER MÓDULO DE ANÚNCIOS PROFISSIONAIS
    ===================================================== */

    function obterModuloAnuncio() {

        return window.MusicalWorldAnuncio || null;

    }


    /* =====================================================
       OBTER MÓDULO DE ANÚNCIOS DE OPORTUNIDADE
    ===================================================== */

    function obterModuloAnuncioOportunidade() {

        return (
            window.MusicalWorldAnuncioOportunidade ||
            null
        );

    }


    /* =====================================================
       OBTER MÓDULO DE PAGINAÇÃO
    ===================================================== */

    function obterModuloPaginacao() {

        return window.MusicalWorldPaginacao || null;

    }


    /* =====================================================
       NORMALIZAR FILTROS
    ===================================================== */

    function normalizarFiltros(filtros = {}) {

        const valorMin =
            filtros.valorMin !== null &&
            filtros.valorMin !== undefined &&
            filtros.valorMin !== ""
                ? Number(filtros.valorMin)
                : null;


        const valorMax =
            filtros.valorMax !== null &&
            filtros.valorMax !== undefined &&
            filtros.valorMax !== ""
                ? Number(filtros.valorMax)
                : null;


        return {

            estado:
                filtros.estado || "",

            cidade:
                filtros.cidade || "",

            categoria:
                filtros.categoria || "",

            instrumento:
                filtros.instrumento || "",

            estilo:
                filtros.estilo || "",

            valorMin:
                Number.isFinite(valorMin)
                    ? valorMin
                    : null,

            valorMax:
                Number.isFinite(valorMax)
                    ? valorMax
                    : null

        };

    }


    /* =====================================================
       VERIFICAR FILTROS ATIVOS
    ===================================================== */

    function existemFiltrosAtivos() {

        return Object.values(
            FEED_CONFIG.filtros
        ).some(valor => {

            if (
                valor !== null &&
                typeof valor === "number"
            ) {

                return true;

            }


            return String(
                valor || ""
            ).trim() !== "";

        });

    }


    /* =====================================================
       OBTER CLIENTE SUPABASE
    ===================================================== */

    function obterSupabase() {

        return (

            window.MusicalWorldSupabase?.getClient?.() ||

            window.supabaseClient ||

            window.supabase ||

            null

        );

    }


    /* =====================================================
       NORMALIZAR DATA DO ITEM
    ===================================================== */

    function obterDataCriacao(item = {}) {

        const data =

            item.created_at ||

            item.createdAt ||

            item.data_criacao ||

            item.dataCriacao ||

            item.updated_at ||

            item.updatedAt ||

            null;


        if (!data) {

            return 0;

        }


        const timestamp =
            new Date(data).getTime();


        return Number.isFinite(timestamp)
            ? timestamp
            : 0;

    }


    /* =====================================================
       NORMALIZAR ARRAYS
    ===================================================== */

    function normalizarLista(valor) {

        if (Array.isArray(valor)) {

            return valor
                .map(item =>
                    String(item || "").trim()
                )
                .filter(Boolean);

        }


        if (
            valor === null ||
            valor === undefined
        ) {

            return [];

        }


        if (typeof valor === "string") {

            const texto =
                valor.trim();


            if (!texto) {

                return [];

            }


            if (
                texto.startsWith("[") &&
                texto.endsWith("]")
            ) {

                try {

                    const convertido =
                        JSON.parse(texto);


                    if (
                        Array.isArray(
                            convertido
                        )
                    ) {

                        return convertido
                            .map(item =>
                                String(
                                    item || ""
                                ).trim()
                            )
                            .filter(Boolean);

                    }

                } catch (erro) {

                    /*
                     * Se não for JSON válido,
                     * continua usando o texto normal.
                     */

                }

            }


            return texto
                .split(/[,\|;]+/)
                .map(item =>
                    item.trim()
                )
                .filter(Boolean);

        }


        return [];

    }


    /* =====================================================
       NORMALIZAR LOCALIZAÇÃO DA OPORTUNIDADE

       A coluna "local" pode chegar como texto ou como
       objeto JSON.

       O card precisa receber uma string já preparada
       para exibição.

       Prioridade visual:

       Rua, número · Cidade/UF

       Caso não exista endereço:

       Cidade/UF

       Caso não exista cidade/estado:

       endereço disponível.
    ===================================================== */

    function normalizarLocalizacao(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        /* =============================================
           LOCAL JÁ EM TEXTO
        ============================================= */

        if (
            typeof valor === "string" ||
            typeof valor === "number"
        ) {

            return String(valor).trim();

        }


        if (
            typeof valor !== "object"
        ) {

            return "";

        }


        /* =============================================
           FUNÇÃO AUXILIAR PARA ENCONTRAR UM CAMPO
        ============================================= */

        function obterCampo(
            objeto,
            campos
        ) {

            for (
                const campo of campos
            ) {

                const valorCampo =
                    objeto?.[campo];


                if (
                    valorCampo !== null &&
                    valorCampo !== undefined &&
                    String(
                        valorCampo
                    ).trim() !== ""
                ) {

                    return String(
                        valorCampo
                    ).trim();

                }

            }


            return "";

        }


        /* =============================================
           CIDADE
        ============================================= */

        const cidade =
            obterCampo(
                valor,
                [
                    "cidade",
                    "city",
                    "municipio",
                    "município"
                ]
            );


        /* =============================================
           ESTADO / UF
        ============================================= */

        const estado =
            obterCampo(
                valor,
                [
                    "estado",
                    "state",
                    "uf"
                ]
            );


        /* =============================================
           ENDEREÇO
        ============================================= */

        const enderecoCompleto =
            obterCampo(
                valor,
                [
                    "endereco",
                    "endereço",
                    "logradouroCompleto",
                    "logradouro_completo",
                    "address",
                    "formatted_address",
                    "formattedAddress"
                ]
            );


        const rua =
            obterCampo(
                valor,
                [
                    "logradouro",
                    "rua",
                    "street"
                ]
            );


        const numero =
            obterCampo(
                valor,
                [
                    "numero",
                    "número",
                    "number"
                ]
            );


        const complemento =
            obterCampo(
                valor,
                [
                    "complemento",
                    "complement",
                    "address_line_2"
                ]
            );


        const bairro =
            obterCampo(
                valor,
                [
                    "bairro",
                    "neighborhood",
                    "district"
                ]
            );


        /* =============================================
           MONTAR PARTE DA CIDADE
        ============================================= */

        let cidadeEstado = "";


        if (
            cidade &&
            estado
        ) {

            cidadeEstado =
                `${cidade}/${estado}`;

        } else if (cidade) {

            cidadeEstado =
                cidade;

        } else if (estado) {

            cidadeEstado =
                estado;

        }


        /* =============================================
           MONTAR ENDEREÇO
        ============================================= */

        let endereco = "";


        if (enderecoCompleto) {

            endereco =
                enderecoCompleto;

        } else if (rua) {

            endereco =
                rua;

            if (numero) {

                endereco +=
                    `, ${numero}`;

            }

            if (complemento) {

                endereco +=
                    `, ${complemento}`;

            }

        }


        /*
         * O bairro não será colocado automaticamente no
         * card quando já temos cidade/estado.
         *
         * A intenção é manter a localização compacta e
         * fácil de identificar rapidamente no feed.
         */


        /* =============================================
           RESULTADO PRINCIPAL

           Exemplo:

           Rua 10, 245 · Goiânia/GO
        ============================================= */

        if (
            endereco &&
            cidadeEstado
        ) {

            return (
                `${endereco} · ${cidadeEstado}`
            );

        }


        if (cidadeEstado) {

            return cidadeEstado;

        }


        if (endereco) {

            return endereco;

        }


        /*
         * Última tentativa para estruturas de localização
         * que possam ter um campo textual não previsto.
         */
        const texto =
            obterCampo(
                valor,
                [
                    "localizacao",
                    "localização",
                    "descricao",
                    "descrição",
                    "nome",
                    "label",
                    "texto"
                ]
            );


        return texto;

    }


    /* =====================================================
       CARREGAR PROFISSIONAIS
    ===================================================== */

    async function carregarProfissionaisFonte(
        supabase
    ) {

        const filtros =
            normalizarFiltros(
                FEED_CONFIG.filtros
            );


        const {

            data,
            error

        } = await supabase.rpc(
            "buscar_profissionais_filtrados",
            {

                p_estado:
                    filtros.estado || null,

                p_cidade:
                    filtros.cidade || null,

                p_categoria:
                    filtros.categoria || null,

                p_instrumento:
                    filtros.instrumento || null,

                p_estilo:
                    filtros.estilo || null,

                p_valor_min:
                    filtros.valorMin,

                p_valor_max:
                    filtros.valorMax,

                p_limite:
                    FEED_CONFIG.limiteFonteProfissionais,

                p_offset:
                    0

            }
        );


        if (error) {

            throw error;

        }


        return Array.isArray(data)
            ? data
            : [];

    }


    /* =====================================================
       CARREGAR VISUALIZAÇÕES DAS OPORTUNIDADES

       Esta consulta busca todas as visualizações das
       oportunidades que aparecem no feed.

       Como existe uma restrição UNIQUE em:

       oportunidade_id + usuario_id

       cada usuário representa somente uma visualização
       daquela oportunidade.
    ===================================================== */

    async function carregarVisualizacoesFonte(
        supabase,
        idsOportunidades,
        usuarioAtualId
    ) {

        if (
            !Array.isArray(idsOportunidades) ||
            !idsOportunidades.length
        ) {

            return {

                contadores: new Map()

            };

        }


        let visualizacoes = [];


        const {

            data,
            error

        } = await supabase
            .from(
                "oportunidades_visualizacoes"
            )
            .select(`
                oportunidade_id,
                usuario_id
            `)
            .in(
                "oportunidade_id",
                idsOportunidades
            );


        if (error) {

            console.warn(
                "MusicalWorld Feed: não foi possível carregar visualizações das oportunidades.",
                error
            );

            return {

                contadores: new Map()

            };

        }


        visualizacoes =
            Array.isArray(data)
                ? data
                : [];


        const contadores =
            new Map();


        visualizacoes.forEach(
            visualizacao => {

                if (
                    !visualizacao?.oportunidade_id
                ) {

                    return;

                }


                const oportunidadeId =
                    String(
                        visualizacao
                            .oportunidade_id
                    );


                const quantidadeAtual =
                    Number(
                        contadores.get(
                            oportunidadeId
                        )
                    ) || 0;


                contadores.set(
                    oportunidadeId,
                    quantidadeAtual + 1
                );


                /*
                 * Se a visualização pertence ao usuário
                 * atualmente autenticado, guardamos a
                 * combinação para impedir uma nova tentativa
                 * desnecessária de registro.
                 */
                if (
                    usuarioAtualId &&
                    visualizacao.usuario_id &&
                    String(
                        visualizacao.usuario_id
                    ) ===
                    String(
                        usuarioAtualId
                    )
                ) {

                    visualizacoesRegistradas.add(
                        `${oportunidadeId}:${String(usuarioAtualId)}`
                    );

                }

            }
        );


        return {

            contadores

        };

    }


    /* =====================================================
       CARREGAR OPORTUNIDADES ABERTAS

       A relação confirmada é:

       oportunidades.contratante_id
                  ↓
       perfis.usuario_id

       A foto do estabelecimento vem de:

       oportunidades.contratante_id
                  ↓
       usuarios.id
                  ↓
       usuarios.foto_url

       Também identificamos aqui o usuário autenticado
       para informar ao renderer quais oportunidades
       pertencem ao próprio usuário.
    ===================================================== */

    async function carregarOportunidadesFonte(
        supabase
    ) {

        /* =============================================
           IDENTIFICAR USUÁRIO AUTENTICADO
        ============================================= */

        let usuarioAtualId = null;


        try {

            const {

                data: dadosUsuario,
                error: erroUsuario

            } = await supabase.auth.getUser();


            if (erroUsuario) {

                console.warn(
                    "MusicalWorld Feed: não foi possível identificar o usuário autenticado para as oportunidades.",
                    erroUsuario
                );

            } else {

                usuarioAtualId =
                    dadosUsuario?.user?.id ||
                    null;

            }

        } catch (erro) {

            console.warn(
                "MusicalWorld Feed: erro ao identificar usuário autenticado.",
                erro
            );

        }


        const {

            data: oportunidades,
            error

        } = await supabase
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
                "status",
                "aberta"
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


        const lista =
            Array.isArray(
                oportunidades
            )
                ? oportunidades
                : [];


        if (!lista.length) {

            return [];

        }


        /* =============================================
           BUSCAR PERFIS DOS CONTRATANTES
        ============================================= */

        const idsContratantes =
            [
                ...new Set(
                    lista
                        .map(
                            oportunidade =>
                                oportunidade
                                    .contratante_id
                        )
                        .filter(Boolean)
                )
            ];


        let perfisContratantes = [];


        if (idsContratantes.length) {

            const {

                data: perfis,
                error: erroPerfis

            } = await supabase
                .from("perfis")
                .select(`
                    id,
                    usuario_id,
                    nome_exibicao,
                    tipo_perfil_id,
                    ativo,
                    perfil_publicado
                `)
                .in(
                    "usuario_id",
                    idsContratantes
                );


            if (erroPerfis) {

                console.warn(
                    "MusicalWorld Feed: não foi possível carregar os perfis dos contratantes.",
                    erroPerfis
                );

            } else {

                perfisContratantes =
                    Array.isArray(perfis)
                        ? perfis
                        : [];

            }

        }


        /* =============================================
           BUSCAR USUÁRIOS DOS CONTRATANTES
        ============================================= */

        let usuariosContratantes = [];


        if (idsContratantes.length) {

            const {

                data,
                error: erroUsuariosContratantes

            } = await supabase
                .from("usuarios")
                .select(`
                    id,
                    nome,
                    foto_url
                `)
                .in(
                    "id",
                    idsContratantes
                );


            if (erroUsuariosContratantes) {

                console.warn(
                    "MusicalWorld Feed: não foi possível carregar usuários dos contratantes.",
                    erroUsuariosContratantes
                );

            } else {

                usuariosContratantes =
                    Array.isArray(data)
                        ? data
                        : [];

            }

        }


        /* =============================================
           MAPEAR PERFIS POR USUÁRIO
        ============================================= */

        const mapaPerfis =
            new Map();


        perfisContratantes.forEach(
            perfil => {

                if (
                    perfil &&
                    perfil.usuario_id
                ) {

                    mapaPerfis.set(
                        String(
                            perfil.usuario_id
                        ),
                        perfil
                    );

                }

            }
        );


        /* =============================================
           MAPEAR USUÁRIOS DOS CONTRATANTES
        ============================================= */

        const mapaUsuariosContratantes =
            new Map();


        usuariosContratantes.forEach(
            usuario => {

                if (
                    usuario &&
                    usuario.id
                ) {

                    mapaUsuariosContratantes.set(
                        String(
                            usuario.id
                        ),
                        usuario
                    );

                }

            }
        );


        /* =============================================
           CARREGAR INTERESSADOS
        ============================================= */

        const idsOportunidades =
            lista
                .map(
                    oportunidade =>
                        oportunidade.id
                )
                .filter(Boolean);


        let interessados =
            [];


        if (idsOportunidades.length) {

            const {

                data,
                error: erroInteressados

            } = await supabase
                .from(
                    "oportunidades_interessados"
                )
                .select(`
                    id,
                    oportunidade_id,
                    artista_id,
                    mensagem,
                    status,
                    created_at,
                    updated_at
                `)
                .in(
                    "oportunidade_id",
                    idsOportunidades
                );


            if (erroInteressados) {

                console.warn(
                    "MusicalWorld Feed: não foi possível carregar interessados das oportunidades.",
                    erroInteressados
                );

            } else {

                interessados =
                    Array.isArray(data)
                        ? data
                        : [];

            }

        }


        /* =============================================
           CARREGAR VISUALIZAÇÕES
        ============================================= */

        const {

            contadores:
                contadoresVisualizacoes

        } = await carregarVisualizacoesFonte(
            supabase,
            idsOportunidades,
            usuarioAtualId
        );


        /* =============================================
           BUSCAR PERFIS DOS ARTISTAS INTERESSADOS
        ============================================= */

        const idsArtistas =
            [
                ...new Set(
                    interessados
                        .map(
                            interessado =>
                                interessado
                                    .artista_id
                        )
                        .filter(Boolean)
                )
            ];


        let perfisArtistas = [];


        if (idsArtistas.length) {

            const {

                data: perfis,
                error: erroPerfisArtistas

            } = await supabase
                .from("perfis")
                .select(`
                    id,
                    usuario_id,
                    nome_exibicao
                `)
                .in(
                    "usuario_id",
                    idsArtistas
                );


            if (erroPerfisArtistas) {

                console.warn(
                    "MusicalWorld Feed: não foi possível carregar perfis dos artistas interessados.",
                    erroPerfisArtistas
                );

            } else {

                perfisArtistas =
                    Array.isArray(perfis)
                        ? perfis
                        : [];

            }

        }


        /* =============================================
           BUSCAR USUÁRIOS PARA AVATARES
        ============================================= */

        let usuarios = [];


        if (idsArtistas.length) {

            const {

                data,
                error: erroUsuarios

            } = await supabase
                .from("usuarios")
                .select(`
                    id,
                    nome,
                    foto_url
                `)
                .in(
                    "id",
                    idsArtistas
                );


            if (erroUsuarios) {

                console.warn(
                    "MusicalWorld Feed: não foi possível carregar usuários dos interessados.",
                    erroUsuarios
                );

            } else {

                usuarios =
                    Array.isArray(data)
                        ? data
                        : [];

            }

        }


        /* =============================================
           MAPAS AUXILIARES
        ============================================= */

        const mapaPerfisArtistas =
            new Map();


        perfisArtistas.forEach(
            perfil => {

                if (
                    perfil &&
                    perfil.usuario_id
                ) {

                    mapaPerfisArtistas.set(
                        String(
                            perfil.usuario_id
                        ),
                        perfil
                    );

                }

            }
        );


        const mapaUsuarios =
            new Map();


        usuarios.forEach(
            usuario => {

                if (
                    usuario &&
                    usuario.id
                ) {

                    mapaUsuarios.set(
                        String(
                            usuario.id
                        ),
                        usuario
                    );

                }

            }
        );


        /* =============================================
           AGRUPAR INTERESSADOS POR OPORTUNIDADE
        ============================================= */

        const mapaInteressados =
            new Map();


        interessados.forEach(
            interessado => {

                const oportunidadeId =
                    String(
                        interessado
                            .oportunidade_id
                    );


                if (
                    !mapaInteressados.has(
                        oportunidadeId
                    )
                ) {

                    mapaInteressados.set(
                        oportunidadeId,
                        []
                    );

                }


                const artistaId =
                    String(
                        interessado
                            .artista_id
                    );


                const perfilArtista =
                    mapaPerfisArtistas.get(
                        artistaId
                    ) || null;


                const usuario =
                    mapaUsuarios.get(
                        artistaId
                    ) || null;


                const nome =
                    perfilArtista
                        ?.nome_exibicao ||

                    usuario
                        ?.nome ||

                    "Artista";


                const fotoUrl =
                    usuario
                        ?.foto_url ||

                    perfilArtista
                        ?.foto_url ||

                    null;


                mapaInteressados
                    .get(
                        oportunidadeId
                    )
                    .push({

                        id:
                            interessado.id,

                        artista_id:
                            interessado.artista_id,

                        nome,

                        foto_url:
                            fotoUrl,

                        mensagem:
                            interessado.mensagem,

                        status:
                            interessado.status,

                        created_at:
                            interessado.created_at

                    });

            }
        );


        /* =============================================
           NORMALIZAR OPORTUNIDADES
        ============================================= */

        return lista.map(
            oportunidade => {

                const contratanteId =
                    String(
                        oportunidade
                            .contratante_id
                    );


                const perfilContratante =
                    mapaPerfis.get(
                        contratanteId
                    ) || null;


                const usuarioContratante =
                    mapaUsuariosContratantes.get(
                        contratanteId
                    ) || null;


                const interessadosDaOportunidade =
                    mapaInteressados.get(
                        String(
                            oportunidade.id
                        )
                    ) || [];


                const estilos =
                    normalizarLista(
                        oportunidade.estilos
                    );


                const instrumentos =
                    normalizarLista(
                        oportunidade.instrumentos
                    );


                const publicadorNome =
                    perfilContratante
                        ?.nome_exibicao ||

                    usuarioContratante
                        ?.nome ||

                    "Estabelecimento";


                const publicadorFotoUrl =
                    usuarioContratante
                        ?.foto_url ||

                    null;


                const ehProprietario =
                    Boolean(
                        usuarioAtualId &&
                        oportunidade.contratante_id &&
                        String(
                            oportunidade.contratante_id
                        ) ===
                        String(
                            usuarioAtualId
                        )
                    );


                const quantidadeVisualizacoes =
                    Number(
                        contadoresVisualizacoes.get(
                            String(
                                oportunidade.id
                            )
                        )
                    ) || 0;


                /*
                 * Normalizamos a localização aqui para que
                 * o renderer receba uma string pronta.
                 *
                 * Exemplo:
                 *
                 * Rua 10, 245 · Goiânia/GO
                 */
                const localizacao =
                    normalizarLocalizacao(
                        oportunidade.local
                    );


                return {

                    ...oportunidade,

                    _tipoFeed:
                        "oportunidade",

                    _timestampFeed:
                        obterDataCriacao(
                            oportunidade
                        ),

                    _ehProprietario:
                        ehProprietario,

                    publicadorNome,

                    publicadorFotoUrl,

                    estabelecimentoNome:
                        publicadorNome,

                    estabelecimentoFotoUrl:
                        publicadorFotoUrl,

                    estabelecimentoPerfilId:
                        perfilContratante
                            ?.id ||

                        null,

                    tipoArtista:
                        oportunidade
                            .tipo_artista ||

                        "",

                    /*
                     * O card recebe a localização já
                     * formatada para leitura rápida.
                     */
                    local:
                        localizacao,

                    estilos,

                    instrumentos,

                    interessados:
                        interessadosDaOportunidade,

                    quantidadeInteressados:
                        interessadosDaOportunidade
                            .length,

                    quantidadeVisualizacoes

                };

            }
        );

    }


    /* =====================================================
       TRANSFORMAR PROFISSIONAIS EM ITENS DA TIMELINE
    ===================================================== */

    function transformarProfissionais(
        profissionais = []
    ) {

        return profissionais.map(
            perfil => ({

                _tipoFeed:
                    "profissional",

                _timestampFeed:
                    obterDataCriacao(
                        perfil
                    ),

                _perfilOriginal:
                    perfil

            })
        );

    }


    /* =====================================================
       MONTAR TIMELINE
    ===================================================== */

    function montarTimeline(
        profissionais = [],
        oportunidades = []
    ) {

        const profissionaisTimeline =
            transformarProfissionais(
                profissionais
            );


        const oportunidadesTimeline =
            Array.isArray(
                oportunidades
            )
                ? oportunidades
                : [];


        const timeline = [

            ...profissionaisTimeline,

            ...oportunidadesTimeline

        ];


        timeline.sort(
            (
                primeiro,
                segundo
            ) => {

                const dataPrimeiro =
                    Number(
                        primeiro
                            ._timestampFeed
                    ) || 0;


                const dataSegundo =
                    Number(
                        segundo
                            ._timestampFeed
                    ) || 0;


                if (
                    dataSegundo !==
                    dataPrimeiro
                ) {

                    return (
                        dataSegundo -
                        dataPrimeiro
                    );

                }


                if (
                    primeiro._tipoFeed ===
                    segundo._tipoFeed
                ) {

                    return 0;

                }


                return primeiro._tipoFeed ===
                    "oportunidade"
                    ? -1
                    : 1;

            }
        );


        return timeline;

    }


    /* =====================================================
       CARREGAR A FONTE COMPLETA DO FEED
    ===================================================== */

    async function carregarFonteFeed(
        supabase
    ) {

        const [

            profissionais,
            oportunidades

        ] = await Promise.all([

            carregarProfissionaisFonte(
                supabase
            ),

            carregarOportunidadesFonte(
                supabase
            )

        ]);


        profissionaisCache =
            profissionais;


        oportunidadesCache =
            oportunidades;


        timelineCache =
            montarTimeline(
                profissionaisCache,
                oportunidadesCache
            );


        fonteCarregada = true;


        return timelineCache;

    }


    /* =====================================================
       CRIAR CARD DE PROFISSIONAL
    ===================================================== */

    function criarCardProfissional(
        item
    ) {

        const anuncio =
            obterModuloAnuncio();


        if (!anuncio) {

            return null;

        }


        const perfil =
            item._perfilOriginal;


        if (!perfil) {

            return null;

        }


        const artista =
            anuncio.obterArtista(
                perfil
            );


        const destaque =
            anuncio.obterDestaque(
                perfil
            );


        return anuncio.criar(
            perfil,
            artista,
            destaque
        );

    }


    /* =====================================================
       CRIAR CARD DE OPORTUNIDADE
    ===================================================== */

    function criarCardOportunidade(
        oportunidade
    ) {

        const anuncioOportunidade =
            obterModuloAnuncioOportunidade();


        if (!anuncioOportunidade) {

            console.error(
                "MusicalWorld Feed: módulo anuncio-oportunidade.js não encontrado."
            );

            return null;

        }


        if (
            typeof anuncioOportunidade.criar !==
            "function"
        ) {

            console.error(
                "MusicalWorld Feed: função criar() do anúncio de oportunidade não encontrada."
            );

            return null;

        }


        return anuncioOportunidade.criar(
            oportunidade
        );

    }


    /* =====================================================
       ATUALIZAR CONTADOR DE VISUALIZAÇÕES NO CARD
    ===================================================== */

    function atualizarVisualizacoesCard(
        card,
        quantidade
    ) {

        if (!card) {

            return;

        }


        const anuncioOportunidade =
            obterModuloAnuncioOportunidade();


        if (
            anuncioOportunidade &&
            typeof anuncioOportunidade
                .atualizarContadorVisualizacoes ===
            "function"
        ) {

            anuncioOportunidade
                .atualizarContadorVisualizacoes(
                    card,
                    quantidade
                );

            return;

        }


        /*
         * Fallback caso o renderer ainda não esteja
         * disponível no momento da atualização.
         */
        const contador =
            card.querySelector(
                "[data-visualizacoes-contador]"
            );


        if (contador) {

            contador.textContent =
                String(
                    Number(
                        quantidade
                    ) || 0
                );

        }

    }


    /* =====================================================
       REGISTRAR VISUALIZAÇÃO DA OPORTUNIDADE

       A visualização só é registrada uma vez por:

       oportunidade + usuário

       A tabela possui UNIQUE(opotunidade_id, usuario_id),
       portanto o banco também protege contra duplicidade.
    ===================================================== */

    async function registrarVisualizacaoOportunidade(
        card
    ) {

        if (!card) {

            return;

        }


        const oportunidade =
            card.__musicalWorldOportunidade;


        if (!oportunidade?.id) {

            return;

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            return;

        }


        try {

            /* =============================================
               IDENTIFICAR USUÁRIO
            ============================================= */

            const {

                data: dadosUsuario,
                error: erroUsuario

            } = await supabase.auth.getUser();


            if (erroUsuario) {

                return;

            }


            const usuario =
                dadosUsuario?.user;


            /*
             * Usuários não autenticados não entram
             * na contagem.
             */
            if (!usuario?.id) {

                return;

            }


            const chave =
                `${String(oportunidade.id)}:${String(usuario.id)}`;


            /*
             * Se já conhecemos esta visualização,
             * não consultamos nem inserimos novamente.
             */
            if (
                visualizacoesRegistradas.has(
                    chave
                )
            ) {

                return;

            }


            /*
             * Marcamos antes da inserção para evitar
             * chamadas duplicadas enquanto o usuário
             * continua com o card visível.
             */
            visualizacoesRegistradas.add(
                chave
            );


            const {

                error: erroInsercao

            } = await supabase
                .from(
                    "oportunidades_visualizacoes"
                )
                .insert({

                    oportunidade_id:
                        oportunidade.id,

                    usuario_id:
                        usuario.id

                });


            /*
             * Se o registro já existir no banco, a
             * restrição UNIQUE protege os dados.
             *
             * Nesse caso não incrementamos o contador,
             * pois esta pessoa já havia sido contabilizada.
             */
            if (
                erroInsercao
            ) {

                /*
                 * Código PostgreSQL 23505 =
                 * unique_violation.
                 */
                if (
                    erroInsercao.code ===
                    "23505"
                ) {

                    return;

                }


                /*
                 * Se ocorreu outro erro, permitimos que
                 * uma nova tentativa seja feita futuramente.
                 */
                visualizacoesRegistradas.delete(
                    chave
                );


                console.warn(
                    "MusicalWorld Feed: não foi possível registrar visualização da oportunidade.",
                    erroInsercao
                );


                return;

            }


            /* =============================================
               ATUALIZAR CACHE LOCAL
            ============================================= */

            const oportunidadeCache =
                oportunidadesCache.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            oportunidade.id
                        )
                );


            if (
                oportunidadeCache
            ) {

                oportunidadeCache
                    .quantidadeVisualizacoes =
                    (
                        Number(
                            oportunidadeCache
                                .quantidadeVisualizacoes
                        ) || 0
                    ) + 1;

            }


            /*
             * Também atualizamos o objeto armazenado
             * diretamente no card.
             */
            oportunidade
                .quantidadeVisualizacoes =
                (
                    Number(
                        oportunidade
                            .quantidadeVisualizacoes
                    ) || 0
                ) + 1;


            atualizarVisualizacoesCard(
                card,
                oportunidade
                    .quantidadeVisualizacoes
            );


        } catch (erro) {

            console.warn(
                "MusicalWorld Feed: erro ao registrar visualização da oportunidade.",
                erro
            );

        }

    }


    /* =====================================================
       CONFIGURAR OBSERVADOR DE VISUALIZAÇÕES

       O card precisa estar realmente visível para que
       a visualização seja registrada.

       Utilizamos 50% de visibilidade como referência.
    ===================================================== */

    function configurarObservadorVisualizacoes() {

        if (
            observadorVisualizacoes
        ) {

            observadorVisualizacoes.disconnect();

        }


        if (
            typeof IntersectionObserver !==
            "function"
        ) {

            return;

        }


        observadorVisualizacoes =
            new IntersectionObserver(
                entradas => {

                    entradas.forEach(
                        entrada => {

                            if (
                                !entrada.isIntersecting
                            ) {

                                return;

                            }


                            const card =
                                entrada.target;


                            if (
                                card.dataset
                                    .visualizacaoProcessada ===
                                "true"
                            ) {

                                return;

                            }


                            card.dataset
                                .visualizacaoProcessada =
                                "true";


                            /*
                             * Uma vez que o card foi
                             * identificado como visível,
                             * não precisamos observá-lo
                             * novamente.
                             */
                            observadorVisualizacoes.unobserve(
                                card
                            );


                            registrarVisualizacaoOportunidade(
                                card
                            );

                        }
                    );

                },
                {
                    threshold: 0.5
                }
            );


        document
            .querySelectorAll(
                '.feed-oportunidade-card[data-oportunidade-id]'
            )
            .forEach(
                card => {

                    observadorVisualizacoes.observe(
                        card
                    );

                }
            );

    }


    /* =====================================================
       RENDERIZAR ITEM DA TIMELINE
    ===================================================== */

    function renderizarItemTimeline(
        item
    ) {

        if (!item) {

            return null;

        }


        if (
            item._tipoFeed ===
            "oportunidade"
        ) {

            return criarCardOportunidade(
                item
            );

        }


        if (
            item._tipoFeed ===
            "profissional"
        ) {

            return criarCardProfissional(
                item
            );

        }


        return null;

    }


    /* =====================================================
       RENDERIZAR PÁGINA DA TIMELINE
    ===================================================== */

    function renderizarPagina(
        pagina,
        limite
    ) {

        const inicio =
            Number(pagina) *
            Number(limite);


        const fim =
            inicio +
            Number(limite);


        const itens =
            timelineCache.slice(
                inicio,
                fim
            );


        itens.forEach(
            item => {

                const card =
                    renderizarItemTimeline(
                        item
                    );


                if (card) {

                    feedContainer.appendChild(
                        card
                    );

                }

            }
        );


        itensTimelineRenderizados =
            Math.min(
                fim,
                timelineCache.length
            );


        /*
         * Depois de inserir os novos cards no DOM,
         * conectamos os cards de oportunidade ao
         * observador de visualizações.
         */
        configurarObservadorVisualizacoes();


        return {

            itens,

            quantidade:
                itens.length,

            acabou:
                fim >=
                timelineCache.length

        };

    }


    /* =====================================================
       ATUALIZAR CONTADOR
    ===================================================== */

    function atualizarContador() {

        if (!counterElement) {

            return;

        }


        const quantidade =
            feedContainer
                ? feedContainer.children.length
                : 0;


        if (!quantidade) {

            counterElement.textContent = "";

            return;

        }


        counterElement.textContent =
            `${quantidade} item${
                quantidade === 1
                    ? ""
                    : "s"
            }`;

    }


    /* =====================================================
       ATUALIZAR VÍDEOS
    ===================================================== */

    function atualizarVideos(
        anuncio
    ) {

        if (
            !anuncio
        ) {

            return;

        }


        if (
            typeof anuncio.observarVideos ===
            "function"
        ) {

            anuncio.observarVideos();

        }

    }


    /* =====================================================
       MOSTRAR ELEMENTO
    ===================================================== */

    function mostrarElemento(
        elemento
    ) {

        if (!elemento) {

            return;

        }


        elemento.hidden = false;

        elemento.style.display = "";

    }


    /* =====================================================
       ESCONDER ELEMENTO
    ===================================================== */

    function esconderElemento(
        elemento
    ) {

        if (!elemento) {

            return;

        }


        elemento.hidden = true;

        elemento.style.display = "none";

    }


    /* =====================================================
       CARREGAR UMA PÁGINA DA TIMELINE
    ===================================================== */

    async function carregarPaginaFeed(
        dadosPaginacao = {}
    ) {

        if (!feedContainer) {

            return {

                quantidade: 0,

                acabou: true

            };

        }


        const anuncio =
            obterModuloAnuncio();


        if (!anuncio) {

            console.error(
                "MusicalWorld Feed: módulo anuncio.js não encontrado."
            );

            return {

                quantidade: 0,

                acabou: true

            };

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            console.error(
                "MusicalWorld Feed: cliente Supabase não encontrado."
            );

            return {

                quantidade: 0,

                acabou: true

            };

        }


        const pagina =
            Number(
                dadosPaginacao.pagina
            ) || 0;


        const limite =
            Number(
                dadosPaginacao.limite
            ) ||
            FEED_CONFIG.limitePorPagina;


        mostrarElemento(
            loadingElement
        );


        try {

            if (!fonteCarregada) {

                await carregarFonteFeed(
                    supabase
                );

            }


            const resultado =
                renderizarPagina(
                    pagina,
                    limite
                );


            atualizarContador();


            atualizarVideos(
                anuncio
            );


            if (
                !feedContainer.children.length &&
                resultado.acabou
            ) {

                mostrarElemento(
                    emptyElement
                );

            } else {

                esconderElemento(
                    emptyElement
                );

            }


            if (
                resultado.acabou
            ) {

                mostrarElemento(
                    endElement
                );

            } else {

                esconderElemento(
                    endElement
                );

            }


            return {

                quantidade:
                    resultado.quantidade,

                acabou:
                    resultado.acabou

            };


        } catch (erro) {

            console.error(
                "MusicalWorld Feed: erro ao carregar timeline.",
                erro
            );


            return {

                quantidade: 0,

                acabou: true

            };

        } finally {

            esconderElemento(
                loadingElement
            );

        }

    }


    /* =====================================================
       REINICIAR CACHE DA TIMELINE
    ===================================================== */

    function limparCacheTimeline() {

        timelineCache = [];

        profissionaisCache = [];

        oportunidadesCache = [];

        fonteCarregada = false;

        itensTimelineRenderizados = 0;


        /*
         * As visualizações são relacionadas ao usuário
         * atual. Ao recarregar o feed, limpamos o Set para
         * que ele seja reconstruído com os dados atuais
         * vindos do Supabase.
         */
        visualizacoesRegistradas.clear();


        if (
            observadorVisualizacoes
        ) {

            observadorVisualizacoes.disconnect();

            observadorVisualizacoes =
                null;

        }

    }


    /* =====================================================
       RECARREGAR FEED DESDE A PRIMEIRA PÁGINA
    ===================================================== */

    async function carregarFeedInicio() {

        const paginacao =
            obterModuloPaginacao();


        if (!paginacao) {

            console.error(
                "MusicalWorld Feed: módulo paginacao.js não encontrado."
            );

            return;

        }


        if (!feedContainer) {

            return;

        }


        feedContainer.innerHTML = "";


        esconderElemento(
            endElement
        );


        esconderElemento(
            emptyElement
        );


        limparCacheTimeline();


        paginacao.reiniciar();


        await paginacao.carregarProximaPagina();

    }


    /* =====================================================
       REGISTRAR INTERESSE EM OPORTUNIDADE

       O renderer dispara:

       musicalworld:interesse-oportunidade

       Este módulo realiza a persistência.

       REGRA:

       O criador da oportunidade não pode registrar
       interesse na própria oportunidade.
    ===================================================== */

    async function registrarInteresseOportunidade(
        evento
    ) {

        const oportunidade =
            evento?.detail?.oportunidade;


        const card =
            evento?.detail?.card;


        if (!oportunidade?.id) {

            return;

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            console.error(
                "MusicalWorld Feed: cliente Supabase não encontrado para registrar interesse."
            );

            return;

        }


        try {

            const {

                data: dadosUsuario,
                error: erroUsuario

            } = await supabase.auth.getUser();


            if (erroUsuario) {

                throw erroUsuario;

            }


            const usuario =
                dadosUsuario?.user;


            if (!usuario?.id) {

                console.warn(
                    "MusicalWorld Feed: usuário não autenticado para demonstrar interesse."
                );

                return;

            }


            /* =============================================
               BLOQUEAR INTERESSE DO PRÓPRIO CRIADOR
            ============================================= */

            if (
                oportunidade.contratante_id &&
                String(
                    oportunidade.contratante_id
                ) ===
                String(
                    usuario.id
                )
            ) {

                console.warn(
                    "MusicalWorld Feed: o criador não pode demonstrar interesse na própria oportunidade."
                );

                return;

            }


            /* =============================================
               VERIFICAR SE JÁ EXISTE INTERESSE
            ============================================= */

            const {

                data: interesseExistente,
                error: erroConsulta

            } = await supabase
                .from(
                    "oportunidades_interessados"
                )
                .select("id")
                .eq(
                    "oportunidade_id",
                    oportunidade.id
                )
                .eq(
                    "artista_id",
                    usuario.id
                )
                .maybeSingle();


            if (erroConsulta) {

                throw erroConsulta;

            }


            if (interesseExistente) {

                marcarCardComoInteressado(
                    card
                );

                return;

            }


            /* =============================================
               REGISTRAR INTERESSE
            ============================================= */

            const {

                error: erroInsercao

            } = await supabase
                .from(
                    "oportunidades_interessados"
                )
                .insert({

                    oportunidade_id:
                        oportunidade.id,

                    artista_id:
                        usuario.id,

                    status:
                        "interessado"

                });


            if (erroInsercao) {

                throw erroInsercao;

            }


            /* =============================================
               ATUALIZAR CACHE
            ============================================= */

            const oportunidadeCache =
                oportunidadesCache.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            oportunidade.id
                        )
                );


            if (
                oportunidadeCache
            ) {

                const interessados =
                    Array.isArray(
                        oportunidadeCache
                            .interessados
                    )
                        ? oportunidadeCache
                            .interessados
                        : [];


                const jaExiste =
                    interessados.some(
                        interessado =>
                            String(
                                interessado
                                    .artista_id
                            ) ===
                            String(
                                usuario.id
                            )
                    );


                if (!jaExiste) {

                    interessados.push({

                        id:
                            null,

                        artista_id:
                            usuario.id,

                        nome:
                            "Você",

                        foto_url:
                            usuario
                                .user_metadata
                                ?.foto_url ||
                            null,

                        status:
                            "interessado"

                    });


                    oportunidadeCache
                        .interessados =
                        interessados;


                    oportunidadeCache
                        .quantidadeInteressados =
                        interessados.length;

                }

            }


            /* =============================================
               ATUALIZAR CARD VISUAL
            ============================================= */

            marcarCardComoInteressado(
                card
            );


        } catch (erro) {

            console.error(
                "MusicalWorld Feed: erro ao registrar interesse na oportunidade.",
                erro
            );

        }

    }


    /* =====================================================
       MARCAR CARD COMO INTERESSADO
    ===================================================== */

    function marcarCardComoInteressado(
        card
    ) {

        if (!card) {

            return;

        }


        card.classList.add(
            "interesse-ativo"
        );


        const botao =
            card.querySelector(
                "[data-acao-interesse]"
            );


        if (!botao) {

            return;

        }


        botao.setAttribute(
            "aria-pressed",
            "true"
        );


        botao.dataset.interesseRegistrado =
            "true";

    }


    /* =====================================================
       CONFIGURAR EVENTO DE INTERESSE
    ===================================================== */

    function configurarInteresseOportunidade() {

        document.addEventListener(
            "musicalworld:interesse-oportunidade",
            registrarInteresseOportunidade
        );

    }


    /* =====================================================
       INICIALIZAR FEED
    ===================================================== */

    async function inicializarFeed() {

        if (
            FEED_CONFIG.inicializado
        ) {

            return;

        }


        FEED_CONFIG.inicializado =
            true;


        /* =============================================
           ELEMENTOS DO DOM
        ============================================= */

        feedContainer =
            document.querySelector(
                "#feed-profissionais"
            );


        loadingElement =
            document.querySelector(
                "#feed-loading"
            );


        endElement =
            document.querySelector(
                "#feed-fim"
            );


        emptyElement =
            document.querySelector(
                "#feed-vazio"
            );


        sentinelElement =
            document.querySelector(
                "#feed-sentinela"
            ) ||

            document.querySelector(
                "#feed-sentinel"
            );


        counterElement =
            document.querySelector(
                "#contador-profissionais"
            ) ||

            document.querySelector(
                "#feed-contador"
            );


        if (!feedContainer) {

            console.warn(
                "MusicalWorld Feed: container #feed-profissionais não encontrado."
            );

            return;

        }


        /* =============================================
           VERIFICAR ANUNCIO.JS
        ============================================= */

        const anuncio =
            obterModuloAnuncio();


        if (!anuncio) {

            console.error(
                "MusicalWorld Feed: anuncio.js não foi carregado antes de main.js."
            );

            return;

        }


        /* =============================================
           VERIFICAR ANUNCIO-OPORTUNIDADE.JS
        ============================================= */

        const anuncioOportunidade =
            obterModuloAnuncioOportunidade();


        if (
            !anuncioOportunidade
        ) {

            console.error(
                "MusicalWorld Feed: anuncio-oportunidade.js não foi carregado antes de main.js."
            );

            return;

        }


        /* =============================================
           VERIFICAR PAGINAÇÃO
        ============================================= */

        const paginacao =
            obterModuloPaginacao();


        if (!paginacao) {

            console.error(
                "MusicalWorld Feed: paginacao.js não foi carregado antes de main.js."
            );

            return;

        }


        /* =============================================
           ESTADO INICIAL
        ============================================= */

        esconderElemento(
            endElement
        );


        esconderElemento(
            emptyElement
        );


        /* =============================================
           INICIALIZAR VÍDEOS
        ============================================= */

        if (
            typeof anuncio.inicializarVideos ===
            "function"
        ) {

            anuncio.inicializarVideos();

        }


        if (
            typeof anuncio.configurarVisibilidadeVideos ===
            "function"
        ) {

            anuncio.configurarVisibilidadeVideos();

        }


        if (
            typeof anuncio.configurarScrollVideos ===
            "function"
        ) {

            anuncio.configurarScrollVideos();

        }


        /* =============================================
           EVENTO "TENHO INTERESSE"
        ============================================= */

        configurarInteresseOportunidade();


        /* =============================================
           INICIALIZAR PAGINAÇÃO
        ============================================= */

        paginacao.inicializar({

            sentinel:
                sentinelElement,

            limitePorPagina:
                FEED_CONFIG.limitePorPagina,

            callbackCarregar:
                carregarPaginaFeed

        });


        /* =============================================
           CARREGAR PRIMEIRA PÁGINA
        ============================================= */

        await carregarFeedInicio();

    }


    /* =====================================================
       API PÚBLICA DO FEED
    ===================================================== */

    window.MusicalWorldFeed = {

        inicializar:
            inicializarFeed,


        recarregar:
            carregarFeedInicio,


        carregarMais: () => {

            const paginacao =
                obterModuloPaginacao();


            if (
                paginacao &&
                typeof paginacao.carregarProximaPagina ===
                "function"
            ) {

                return paginacao
                    .carregarProximaPagina();

            }

        },


        definirFiltros:
            filtros => {

                FEED_CONFIG.filtros =
                    normalizarFiltros(
                        filtros
                    );


                console.log(
                    "MusicalWorldFeed — filtros recebidos:",
                    FEED_CONFIG.filtros
                );


                return carregarFeedInicio();

            },


        obterFiltros:
            () => {

                return {

                    ...FEED_CONFIG.filtros

                };

            },


        existemFiltrosAtivos:
            existemFiltrosAtivos,


        atualizarVideos:
            () => {

                const anuncio =
                    obterModuloAnuncio();


                if (
                    anuncio &&
                    typeof anuncio.atualizarVideos ===
                    "function"
                ) {

                    anuncio.atualizarVideos();

                }

            }

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializarFeed,
            {
                once: true
            }
        );

    } else {

        inicializarFeed();

    }


})(window);