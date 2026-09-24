/* =========================================================
   MUSICALWORLD — CENTRAL DE CONTRATAÇÕES

   Arquivo:
   js/contratacoes.js

   Responsabilidade:

   - Carregar as contratações realizadas pelo usuário logado.
   - Carregar as solicitações de contratação recebidas pelo
     usuário logado.
   - Buscar os dados reais no Supabase.
   - Utilizar a arquitetura central do MusicalWorld.
   - Permitir que qualquer usuário faça contratações,
     inclusive um artista contratando outro artista.
   - Identificar se cada contratação foi feita pelo usuário
     ou recebida pelo usuário.
   - Identificar propostas recebidas por estabelecimentos.
   - Filtrar por status.
   - Pesquisar por pessoa, serviço ou evento.
   - Ordenar as contratações.
   - Atualizar os indicadores.
   - Renderizar os cards.
   - Abrir uma contratação individual.

   IMPORTANTE:

   A tabela principal utilizada é:

   public.contratacoes

   Relacionamentos:

   contratante_id → usuarios.id
   contratado_id  → usuarios.id
   servico_id     → servicos_artistas.id

   A página trabalha com os dois lados da contratação:

   1. CONTRATAÇÕES REALIZADAS
      contratante_id = usuário logado

   2. SOLICITAÇÕES RECEBIDAS
      contratado_id = usuário logado

   Uma solicitação recebida pode representar:

   - uma contratação tradicional;
   - uma proposta enviada por um artista;
   - uma proposta enviada por outro usuário.

   Arquitetura utilizada:

   SupabaseClient.js
   ↓
   supabaseClient
   ↓
   Sessao.js
   ↓
   UsuarioAtual.js
   ↓
   contratacoes.js
========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const CONFIG = {

        armazenamento: {

            chaveContratacao:
                "musicalworld_contratacao",

            chaveLista:
                "musicalworld_contratacoes"

        },


        paginas: {

            inicio:
                "index.html",

            novaContratacao:
                "contratacao.html",

            acompanhamento:
                "contratacao-acompanhamento.html",

            perfil:
                "meu-perfil.html"

        },


        tabelas: {

            contratacoes:
                "contratacoes",

            usuarios:
                "usuarios",

            perfis:
                "perfis",

            perfisArtistas:
                "perfis_artistas",

            servicos:
                "servicos_artistas"

        },


        seletores: {

            lista:
                "contratacoesLista",

            estadoVazio:
                "estadoVazio",

            estadoVazioMensagem:
                "estadoVazioMensagem",

            campoBusca:
                "campoBusca",

            btnLimparBusca:
                "btnLimparBusca",

            btnLimparFiltros:
                "btnLimparFiltros",

            contador:
                "contadorContratacoes",

            resumoAguardando:
                "resumoAguardando",

            resumoProximas:
                "resumoProximas",

            resumoAndamento:
                "resumoAndamento",

            resumoHistorico:
                "resumoHistorico",

            btnVoltar:
                "btnVoltar",

            btnInicio:
                "btnInicio",

            btnPerfil:
                "btnPerfil",

            btnNovaContratacao:
                "btnNovaContratacao",

            btnOrdenacao:
                "btnOrdenacao",

            filtros:
                ".filtro-btn",

            cardsResumo:
                ".resumo-card"

        }

    };


    /* =====================================================
       ESTADO
    ====================================================== */

    const estado = {

        /*
         * Todas as contratações relacionadas ao usuário.
         *
         * Pode conter:
         *
         * - contratações realizadas;
         * - solicitações recebidas;
         * - propostas recebidas.
         */

        contratacoes: [],


        contratacoesFiltradas: [],


        filtroAtual:
            "todas",


        buscaAtual:
            "",


        ordenacao:
            "recentes",


        usuarioId:
            null,


        carregando:
            false,


        erro:
            null,


        inicializado:
            false

    };


    /* =====================================================
       UTILITÁRIOS
    ====================================================== */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    function escaparHtml(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(valor)

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


    function formatarMoeda(valor) {

        const numero =
            Number(valor) || 0;


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function formatarData(data) {

        if (!data) {

            return "Data não informada";

        }


        const dataObj =
            new Date(
                `${data}T12:00:00`
            );


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return data;

        }


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short"
            }
        );

    }


    function formatarDataCompleta(data) {

        if (!data) {

            return "Data não informada";

        }


        const dataObj =
            new Date(
                `${data}T12:00:00`
            );


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return data;

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


    function normalizarTexto(valor) {

        return String(
            valor || ""
        )

            .normalize("NFD")

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .toLowerCase()

            .trim();

    }


    function obterIniciais(nome) {

        const texto =
            String(nome || "")
                .trim();


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
                .substring(0, 2)
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
       CABEÇALHO DINÂMICO
    ====================================================== */

    /*
     * A página continua podendo mostrar tanto:
     *
     * - contratações realizadas;
     * - solicitações recebidas;
     * - propostas recebidas.
     *
     * Por isso o título e o texto introdutório são mantidos
     * neutros.
     */

    function atualizarCabecalho() {

        const titulo =
            document.querySelector(
                ".page-header h1"
            );


        const descricao =
            document.querySelector(
                ".page-header p"
            );


        if (titulo) {

            titulo.textContent =
                "Contratações";

        }


        if (descricao) {

            descricao.textContent =
                "Acompanhe suas contratações e as solicitações recebidas em um só lugar.";

        }


        const campoBusca =
            obterElemento(
                CONFIG.seletores.campoBusca
            );


        if (campoBusca) {

            campoBusca.placeholder =
                "Buscar pessoa, evento ou serviço...";

        }

    }


    /* =====================================================
       STATUS DO BANCO → STATUS DA INTERFACE
    ====================================================== */

    function normalizarStatus(status) {

        const mapa = {

            rascunho:
                "rascunho",

            solicitacao_enviada:
                "aguardando_artista",

            aguardando_confirmacao:
                "aguardando_artista",

            confirmada:
                "confirmada",

            em_andamento:
                "andamento",

            concluida:
                "concluida",

            cancelada:
                "cancelada",

            recusada:
                "recusada"

        };


        return (
            mapa[status] ||
            status ||
            "aguardando_artista"
        );

    }


    function obterStatusConfig(
        status,
        direcao
    ) {

        const configuracoes = {

            aguardando_artista: {

                texto:
                    direcao === "recebida"
                        ? "Aguardando sua resposta"
                        : "Aguardando resposta",

                classe:
                    "status-aguardando"

            },


            confirmada: {

                texto:
                    "Confirmada",

                classe:
                    "status-confirmada"

            },


            andamento: {

                texto:
                    "Em andamento",

                classe:
                    "status-andamento"

            },


            concluida: {

                texto:
                    "Concluída",

                classe:
                    "status-concluida"

            },


            cancelada: {

                texto:
                    "Cancelada",

                classe:
                    "status-cancelada"

            },


            recusada: {

                texto:
                    direcao === "recebida"
                        ? "Recusada por você"
                        : "Recusada",

                classe:
                    "status-recusada"

            },


            rascunho: {

                texto:
                    "Rascunho",

                classe:
                    "status-aguardando"

            }

        };


        return (
            configuracoes[status] ||
            configuracoes.aguardando_artista
        );

    }


    /* =====================================================
       LOCALIZAÇÃO DO EVENTO
    ====================================================== */

    function extrairDadosLocal(local) {

        if (!local) {

            return {

                nome:
                    "Local não informado",

                cidade:
                    ""

            };

        }


        /*
         * A coluna "local" é JSONB.
         *
         * Aceitamos tanto objeto quanto string JSON.
         */

        if (
            typeof local === "string"
        ) {

            try {

                const convertido =
                    JSON.parse(local);


                if (
                    convertido &&
                    typeof convertido === "object"
                ) {

                    local =
                        convertido;

                } else {

                    return {

                        nome:
                            local,

                        cidade:
                            ""

                    };

                }

            } catch (erro) {

                return {

                    nome:
                        local,

                    cidade:
                        ""

                };

            }

        }


        /*
         * Para propostas enviadas a estabelecimentos,
         * o local é normalmente o endereço cadastrado
         * pelo estabelecimento.
         *
         * Priorizamos nomeLocal quando disponível,
         * mantendo os demais formatos existentes.
         */

        const nome =
            local.nomeLocal ||
            local.nome ||
            local.endereco ||
            local.local ||
            local.logradouro ||
            "Local não informado";


        const cidade =
            local.cidade ||
            local.municipio ||
            local.city ||
            "";


        return {

            nome,

            cidade

        };

    }


    /* =====================================================
       BUSCAR DADOS DE UMA PESSOA
    ====================================================== */

    /*
     * Esta função substitui a ideia de carregar apenas
     * "artista".
     *
     * Uma contratação possui duas pessoas:
     *
     * - contratante;
     * - contratado.
     *
     * Cada lado pode ser artista, contratante,
     * estabelecimento ou ambos.
     */

    async function carregarDadosPessoa(
        supabase,
        usuarioId
    ) {

        if (!usuarioId) {

            return {

                id:
                    null,

                nome:
                    "Usuário",

                tipo:
                    "Usuário",

                iniciais:
                    "MW",

                fotoUrl:
                    null,

                localizacao:
                    ""

            };

        }


        let usuario =
            null;


        let perfil =
            null;


        let perfilArtista =
            null;


        /* -------------------------------------------------
           USUÁRIO
        ------------------------------------------------- */

        const respostaUsuario =
            await supabase

                .from(
                    CONFIG.tabelas.usuarios
                )

                .select(`
                    id,
                    nome,
                    email,
                    telefone,
                    foto_url,
                    ativo
                `)

                .eq(
                    "id",
                    usuarioId
                )

                .maybeSingle();


        if (
            respostaUsuario.error
        ) {

            console.warn(
                "MusicalWorld — erro ao carregar usuário:",
                respostaUsuario.error
            );

        } else {

            usuario =
                respostaUsuario.data;

        }


        /* -------------------------------------------------
           PERFIL
        ------------------------------------------------- */

        const respostaPerfil =
            await supabase

                .from(
                    CONFIG.tabelas.perfis
                )

                .select(`
                    id,
                    usuario_id,
                    nome_exibicao,
                    descricao,
                    ativo,
                    tipo_perfil_id,
                    tipos_perfil (
                        id,
                        nome,
                        descricao
                    )
                `)

                .eq(
                    "usuario_id",
                    usuarioId
                )

                .eq(
                    "ativo",
                    true
                )

                .maybeSingle();


        if (
            respostaPerfil.error
        ) {

            console.warn(
                "MusicalWorld — erro ao carregar perfil:",
                respostaPerfil.error
            );

        } else {

            perfil =
                respostaPerfil.data;

        }


        /* -------------------------------------------------
           PERFIL ARTÍSTICO
        ------------------------------------------------- */

        if (
            perfil?.id
        ) {

            const respostaPerfilArtista =
                await supabase

                    .from(
                        CONFIG.tabelas
                            .perfisArtistas
                    )

                    .select("*")

                    .eq(
                        "perfil_id",
                        perfil.id
                    )

                    .maybeSingle();


            if (
                respostaPerfilArtista.error
            ) {

                console.warn(
                    "MusicalWorld — erro ao carregar perfil artístico:",
                    respostaPerfilArtista.error
                );

            } else {

                perfilArtista =
                    respostaPerfilArtista.data;

            }

        }


        const nome =
            perfil?.nome_exibicao ||
            usuario?.nome ||
            "Usuário";


        const tipo =
            perfilArtista?.tipo_artista ||
            perfil?.tipos_perfil?.nome ||
            "Usuário";


        const fotoUrl =
            perfilArtista?.foto_url ||
            perfilArtista?.avatar_url ||
            usuario?.foto_url ||
            null;


        const localizacao =
            perfilArtista?.localizacao ||
            "";


        return {

            id:
                usuarioId,

            nome,

            tipo,

            iniciais:
                obterIniciais(nome),

            fotoUrl,

            localizacao

        };

    }


    /* =====================================================
       COMPATIBILIDADE — BUSCAR ARTISTA
    ====================================================== */

    /*
     * Mantemos esta função para preservar compatibilidade
     * com qualquer parte do projeto que eventualmente
     * utilize o nome antigo.
     */

    async function carregarDadosArtista(
        supabase,
        usuarioId
    ) {

        return carregarDadosPessoa(
            supabase,
            usuarioId
        );

    }


    /* =====================================================
       BUSCAR SERVIÇO
    ====================================================== */

    async function carregarDadosServico(
        supabase,
        servicoId
    ) {

        if (!servicoId) {

            return {

                id:
                    null,

                nome:
                    "Serviço",

                valor:
                    0,

                duracao:
                    ""

            };

        }


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelas.servicos
                )

                .select("*")

                .eq(
                    "id",
                    servicoId
                )

                .maybeSingle();


        if (
            resposta.error
        ) {

            console.warn(
                "MusicalWorld — erro ao carregar serviço:",
                resposta.error
            );


            return {

                id:
                    servicoId,

                nome:
                    "Serviço",

                valor:
                    0,

                duracao:
                    ""

            };

        }


        const servico =
            resposta.data || {};


        return {

            id:
                servico.id ||
                servicoId,

            nome:
                servico.nome ||
                servico.titulo ||
                servico.nome_servico ||
                "Serviço",

            valor:
                servico.valor ??
                servico.preco ??
                servico.preco_base ??
                0,

            duracao:
                servico.duracao ||
                servico.duracao_servico ||
                ""

        };

    }


    /* =====================================================
       CONVERTER REGISTRO DO SUPABASE
    ====================================================== */

    async function transformarContratacao(
        supabase,
        registro,
        usuarioId
    ) {

        const direcao =
            String(
                registro.contratado_id
            ) ===
            String(usuarioId)

                ? "recebida"

                : "realizada";


        /*
         * Pessoa do outro lado da contratação.
         *
         * Se foi uma contratação realizada:
         *
         * contratante = usuário atual
         * contratado  = artista / profissional
         *
         * Se foi uma solicitação recebida:
         *
         * contratante = pessoa que iniciou
         * contratado  = usuário atual
         */

        const pessoaId =
            direcao === "recebida"

                ? registro.contratante_id

                : registro.contratado_id;


        const pessoa =
            await carregarDadosPessoa(
                supabase,
                pessoaId
            );


        const contratante =
            await carregarDadosPessoa(
                supabase,
                registro.contratante_id
            );


        const contratado =
            await carregarDadosPessoa(
                supabase,
                registro.contratado_id
            );


        const servico =
            await carregarDadosServico(
                supabase,
                registro.servico_id
            );


        const dadosLocal =
            extrairDadosLocal(
                registro.local
            );


        /*
         * Uma solicitação enviada pelo artista para um
         * estabelecimento possui o status:
         *
         * solicitacao_enviada
         *
         * O status normalizado continua sendo
         * aguardando_artista para preservar o sistema
         * existente de filtros e indicadores.
         *
         * A direção "recebida" permite que a interface
         * apresente o texto correto:
         *
         * "Aguardando sua resposta"
         */

        const statusNormalizado =
            normalizarStatus(
                registro.status
            );


        const propostaRecebida =
            direcao === "recebida" &&
            registro.status ===
                "solicitacao_enviada";


        return {

            id:
                registro.id,


            contratanteId:
                registro.contratante_id,


            contratadoId:
                registro.contratado_id,


            servicoId:
                registro.servico_id,


            /*
             * Indica de qual lado esta contratação
             * está sendo visualizada.
             *
             * "realizada" = usuário contratou alguém.
             * "recebida"  = alguém contratou o usuário.
             */

            direcao,


            /*
             * Identifica especificamente a nova proposta
             * recebida pelo usuário.
             */

            propostaRecebida,


            pessoa,


            contratante,


            contratado,


            /*
             * Mantemos "artista" para compatibilidade com
             * código anterior.
             *
             * Nas contratações realizadas, é o contratado.
             * Nas recebidas, continua sendo o contratado,
             * mesmo que seja o próprio usuário.
             */

            artista:
                contratado,


            servico: {

                ...servico,


                /*
                 * O valor oficial pertence à contratação.
                 *
                 * Isso garante que, caso o artista tenha
                 * enviado uma proposta de R$ 600,00, o card
                 * mostre R$ 600,00 mesmo que o serviço tenha
                 * outro valor cadastrado posteriormente.
                 */

                valor:
                    registro.valor ??
                    servico.valor ??
                    0

            },


            evento: {

                /*
                 * O tipo do evento pode ser nulo nas novas
                 * propostas.
                 *
                 * Mantemos "Evento" para compatibilidade
                 * com a estrutura existente.
                 */

                nome:
                    registro.tipo_evento ||
                    "Evento",


                tipo:
                    registro.tipo_evento ||
                    "Evento",


                data:
                    registro.data_evento,


                horarioInicio:
                    registro.horario_inicio,


                horarioFim:
                    registro.horario_fim,


                local:
                    dadosLocal.nome,


                cidade:
                    dadosLocal.cidade,


                observacoes:
                    registro.observacoes ||
                    ""

            },


            status:
                statusNormalizado,


            statusBanco:
                registro.status,


            pagamento: {

                metodo:
                    registro.metodo_pagamento,

                status:
                    registro.status_pagamento

            },


            observacoes:
                registro.observacoes ||
                "",


            createdAt:
                registro.created_at,


            updatedAt:
                registro.updated_at

        };

    }


    /* =====================================================
       CLASSIFICAÇÃO
    ====================================================== */

    function pertenceAoFiltro(
        contratacao,
        filtro
    ) {

        if (
            filtro === "todas"
        ) {

            return true;

        }


        if (
            filtro === "aguardando"
        ) {

            return (
                contratacao.status ===
                "aguardando_artista"
            );

        }


        if (
            filtro === "confirmadas"
        ) {

            return (
                contratacao.status ===
                "confirmada"
            );

        }


        if (
            filtro === "concluidas"
        ) {

            return (
                contratacao.status ===
                "concluida"
            );

        }


        if (
            filtro === "canceladas"
        ) {

            return (
                contratacao.status ===
                    "cancelada" ||

                contratacao.status ===
                    "recusada"
            );

        }


        if (
            filtro === "proximas"
        ) {

            return (
                contratacao.status ===
                    "confirmada" ||

                contratacao.status ===
                    "aguardando_artista"
            );

        }


        if (
            filtro === "andamento"
        ) {

            return (
                contratacao.status ===
                "andamento"
            );

        }


        if (
            filtro === "historico"
        ) {

            return (
                contratacao.status ===
                    "concluida" ||

                contratacao.status ===
                    "cancelada" ||

                contratacao.status ===
                    "recusada"
            );

        }


        return true;

    }


    /* =====================================================
       BUSCA
    ====================================================== */

    function correspondeBusca(
        contratacao,
        busca
    ) {

        if (!busca) {

            return true;

        }


        const pessoa =
            contratacao.pessoa || {};


        const termos = [

            pessoa.nome,

            pessoa.tipo,

            pessoa.localizacao,

            contratacao.contratante?.nome,

            contratacao.contratado?.nome,

            contratacao.artista?.nome,

            contratacao.artista?.tipo,

            contratacao.servico?.nome,

            contratacao.evento?.nome,

            contratacao.evento?.tipo,

            contratacao.evento?.local,

            contratacao.evento?.cidade

        ];


        const textoCompleto =
            termos

                .map(
                    normalizarTexto
                )

                .join(" ");


        return textoCompleto.includes(
            normalizarTexto(busca)
        );

    }


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    function ordenarContratacoes(
        lista
    ) {

        const copia =
            [...lista];


        if (
            estado.ordenacao ===
            "antigas"
        ) {

            return copia.sort(
                function (a, b) {

                    return (

                        new Date(
                            a.createdAt
                        ) -

                        new Date(
                            b.createdAt
                        )

                    );

                }
            );

        }


        if (
            estado.ordenacao ===
            "valor_maior"
        ) {

            return copia.sort(
                function (a, b) {

                    return (

                        Number(
                            b.servico?.valor ||
                            0
                        ) -

                        Number(
                            a.servico?.valor ||
                            0
                        )

                    );

                }
            );

        }


        if (
            estado.ordenacao ===
            "valor_menor"
        ) {

            return copia.sort(
                function (a, b) {

                    return (

                        Number(
                            a.servico?.valor ||
                            0
                        ) -

                        Number(
                            b.servico?.valor ||
                            0
                        )

                    );

                }
            );

        }


        return copia.sort(
            function (a, b) {

                return (

                    new Date(
                        b.createdAt
                    ) -

                    new Date(
                        a.createdAt
                    )

                );

            }
        );

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const aguardando =
            estado.contratacoes.filter(
                function (item) {

                    return (
                        item.status ===
                        "aguardando_artista"
                    );

                }
            ).length;


        const proximas =
            estado.contratacoes.filter(
                function (item) {

                    return (

                        item.status ===
                            "confirmada" ||

                        item.status ===
                            "aguardando_artista"

                    );

                }
            ).length;


        const andamento =
            estado.contratacoes.filter(
                function (item) {

                    return (
                        item.status ===
                        "andamento"
                    );

                }
            ).length;


        const historico =
            estado.contratacoes.filter(
                function (item) {

                    return (

                        item.status ===
                            "concluida" ||

                        item.status ===
                            "cancelada" ||

                        item.status ===
                            "recusada"

                    );

                }
            ).length;


        const elementoAguardando =
            obterElemento(
                CONFIG.seletores
                    .resumoAguardando
            );


        const elementoProximas =
            obterElemento(
                CONFIG.seletores
                    .resumoProximas
            );


        const elementoAndamento =
            obterElemento(
                CONFIG.seletores
                    .resumoAndamento
            );


        const elementoHistorico =
            obterElemento(
                CONFIG.seletores
                    .resumoHistorico
            );


        if (
            elementoAguardando
        ) {

            elementoAguardando.textContent =
                aguardando;

        }


        if (
            elementoProximas
        ) {

            elementoProximas.textContent =
                proximas;

        }


        if (
            elementoAndamento
        ) {

            elementoAndamento.textContent =
                andamento;

        }


        if (
            elementoHistorico
        ) {

            elementoHistorico.textContent =
                historico;

        }

    }


    /* =====================================================
       RENDERIZAÇÃO DO CARD
    ====================================================== */

    function renderizarCard(
        contratacao
    ) {

        const status =
            obterStatusConfig(
                contratacao.status,
                contratacao.direcao
            );


        const pessoa =
            contratacao.pessoa || {};


        const servico =
            contratacao.servico || {};


        const evento =
            contratacao.evento || {};


        const recebida =
            contratacao.direcao ===
            "recebida";


        const propostaRecebida =
            contratacao.propostaRecebida ===
            true;


        let avatarHtml = `

            <span>
                ${escaparHtml(
                    pessoa.iniciais ||
                    "MW"
                )}
            </span>

        `;


        if (
            pessoa.fotoUrl
        ) {

            avatarHtml = `

                <img
                    src="${escaparHtml(
                        pessoa.fotoUrl
                    )}"
                    alt=""
                    loading="lazy"
                >

            `;

        }


        /*
         * O texto principal do card muda conforme o lado
         * da contratação.
         *
         * Para uma proposta recebida pelo estabelecimento,
         * a pessoa exibida é quem enviou a proposta.
         */

        let rotuloPessoa;


        if (
            propostaRecebida
        ) {

            rotuloPessoa =
                "Proposta de";

        } else if (
            recebida
        ) {

            rotuloPessoa =
                "Contratante";

        } else {

            rotuloPessoa =
                "Artista";

        }


        let rotuloDirecao;


        if (
            propostaRecebida
        ) {

            rotuloDirecao =
                "Nova proposta";

        } else if (
            recebida
        ) {

            rotuloDirecao =
                "Solicitação recebida";

        } else {

            rotuloDirecao =
                "Contratação realizada";

        }


        /*
         * Quando os dois horários estão vazios, isso não
         * significa que existe um horário inválido.
         *
         * Nas novas propostas o horário pode ser definido
         * posteriormente pelo estabelecimento.
         */

        const horarioInicio =
            normalizarHorario(
                evento.horarioInicio
            );


        const horarioFim =
            normalizarHorario(
                evento.horarioFim
            );


        let textoHorario;


        if (
            horarioInicio &&
            horarioFim
        ) {

            textoHorario =
                `${horarioInicio} às ${horarioFim}`;

        } else if (
            horarioInicio
        ) {

            textoHorario =
                `${horarioInicio} — término a definir`;

        } else if (
            horarioFim
        ) {

            textoHorario =
                `Início a definir — ${horarioFim}`;

        } else {

            textoHorario =
                "A definir";

        }


        return `

            <article
                class="contratacao-card"
                data-id="${escaparHtml(
                    contratacao.id
                )}"
            >


                <div class="contratacao-status">

                    <span
                        class="status-badge ${status.classe}"
                    >
                        ${escaparHtml(
                            status.texto
                        )}
                    </span>


                    <span class="contratacao-direcao">
                        ${escaparHtml(
                            rotuloDirecao
                        )}
                    </span>

                </div>


                <div class="contratacao-artista">


                    <div class="artista-principal">

                        <div class="artista-avatar">
                            ${avatarHtml}
                        </div>


                        <div class="artista-info">

                            <span class="artista-nome">

                                ${escaparHtml(
                                    pessoa.nome ||
                                    "Usuário"
                                )}

                            </span>


                            <span class="artista-tipo">

                                ${escaparHtml(
                                    pessoa.tipo ||
                                    "Usuário"
                                )}

                            </span>

                        </div>

                    </div>


                    <span class="contratacao-servico">

                        ${escaparHtml(
                            servico.nome ||
                            "Serviço"
                        )}

                    </span>

                </div>


                <div class="contratacao-info">

                    <span class="info-label">

                        ${escaparHtml(
                            rotuloPessoa
                        )}

                    </span>


                    <span class="info-valor">

                        ${escaparHtml(
                            pessoa.nome ||
                            "Usuário"
                        )}

                    </span>


                    <span class="info-secundario">

                        ${escaparHtml(
                            formatarData(
                                evento.data
                            )
                        )}

                        •

                        ${escaparHtml(
                            textoHorario
                        )}

                    </span>

                </div>


                <div class="contratacao-valor">


                    <div>

                        <span class="info-label">
                            Local
                        </span>


                        <span class="info-valor">

                            ${escaparHtml(
                                evento.local ||
                                "Local não informado"
                            )}

                        </span>


                        <span class="info-secundario">

                            ${escaparHtml(
                                evento.cidade ||
                                ""
                            )}

                        </span>

                    </div>


                    <div>

                        <span class="info-label">
                            Valor
                        </span>


                        <span class="valor-principal">

                            ${escaparHtml(
                                formatarMoeda(
                                    servico.valor
                                )
                            )}

                        </span>


                        <span class="valor-pagamento">

                            ${escaparHtml(
                                servico.duracao ||
                                ""
                            )}

                        </span>

                    </div>

                </div>


                <div class="contratacao-acao">

                    <button
                        type="button"
                        class="btn-ver-contratacao"
                        data-contratacao-id="${escaparHtml(
                            contratacao.id
                        )}"
                    >

                        <span>

                            ${
                                propostaRecebida
                                    ? "Ver proposta"
                                    : "Ver contratação"
                            }

                        </span>


                        <i
                            data-lucide="arrow-right"
                        ></i>

                    </button>

                </div>


            </article>

        `;

    }


    /* =====================================================
       NORMALIZAR HORÁRIO
    ====================================================== */

    function normalizarHorario(
        horario
    ) {

        if (!horario) {

            return "";

        }


        const texto =
            String(horario)
                .trim();


        /*
         * PostgreSQL pode retornar:
         *
         * 13:51:00
         *
         * A interface utiliza:
         *
         * 13:51
         */

        const match =
            texto.match(
                /^(\d{2}:\d{2})(?::\d{2})?$/
            );


        if (
            match
        ) {

            return match[1];

        }


        return texto;

    }


    /* =====================================================
       RENDERIZAR LISTA
    ====================================================== */

    function renderizarLista() {

        const lista =
            obterElemento(
                CONFIG.seletores.lista
            );


        const estadoVazio =
            obterElemento(
                CONFIG.seletores.estadoVazio
            );


        if (
            !lista ||
            !estadoVazio
        ) {

            return;

        }


        lista.innerHTML = "";


        const filtradas =
            estado.contratacoes

                .filter(
                    function (contratacao) {

                        return pertenceAoFiltro(
                            contratacao,
                            estado.filtroAtual
                        );

                    }
                )

                .filter(
                    function (contratacao) {

                        return correspondeBusca(
                            contratacao,
                            estado.buscaAtual
                        );

                    }
                );


        estado.contratacoesFiltradas =
            ordenarContratacoes(
                filtradas
            );


        if (
            estado.contratacoesFiltradas.length ===
            0
        ) {

            lista.hidden = true;

            estadoVazio.hidden = false;


            const mensagem =
                obterElemento(
                    CONFIG.seletores
                        .estadoVazioMensagem
                );


            if (
                mensagem
            ) {

                if (
                    estado.buscaAtual
                ) {

                    mensagem.textContent =
                        "Nenhuma contratação corresponde à sua busca.";

                } else {

                    mensagem.textContent =
                        "Você ainda não possui contratações ou solicitações recebidas.";

                }

            }


            atualizarContador(0);

            return;

        }


        lista.hidden = false;

        estadoVazio.hidden = true;


        lista.innerHTML =
            estado.contratacoesFiltradas

                .map(
                    renderizarCard
                )

                .join("");


        atualizarContador(
            estado.contratacoesFiltradas.length
        );


        if (
            window.lucide
        ) {

            window.lucide.createIcons();

        }

    }


    /* =====================================================
       CONTADOR
    ====================================================== */

    function atualizarContador(
        total
    ) {

        const elemento =
            obterElemento(
                CONFIG.seletores.contador
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =

            total === 1

                ? "1 contratação"

                : `${total} contratações`;

    }


    /* =====================================================
       FILTROS
    ====================================================== */

    function atualizarFiltroVisual() {

        const botoes =
            document.querySelectorAll(
                CONFIG.seletores.filtros
            );


        botoes.forEach(
            function (botao) {

                const ativo =
                    botao.dataset.filtro ===
                    estado.filtroAtual;


                botao.classList.toggle(
                    "ativo",
                    ativo
                );

            }
        );

    }


    function definirFiltro(
        filtro
    ) {

        estado.filtroAtual =
            filtro || "todas";


        atualizarFiltroVisual();

        renderizarLista();

    }


    /* =====================================================
       BUSCA
    ====================================================== */

    function atualizarBusca(
        valor
    ) {

        estado.buscaAtual =
            String(
                valor || ""
            ).trim();


        const botaoLimpar =
            obterElemento(
                CONFIG.seletores
                    .btnLimparBusca
            );


        if (
            botaoLimpar
        ) {

            botaoLimpar.hidden =
                !estado.buscaAtual;

        }


        renderizarLista();

    }


    function limparBusca() {

        const campo =
            obterElemento(
                CONFIG.seletores
                    .campoBusca
            );


        if (
            campo
        ) {

            campo.value = "";

        }


        atualizarBusca("");

    }


    function limparFiltros() {

        estado.filtroAtual =
            "todas";


        estado.buscaAtual =
            "";


        const campo =
            obterElemento(
                CONFIG.seletores
                    .campoBusca
            );


        if (
            campo
        ) {

            campo.value = "";

        }


        const botaoLimpar =
            obterElemento(
                CONFIG.seletores
                    .btnLimparBusca
            );


        if (
            botaoLimpar
        ) {

            botaoLimpar.hidden =
                true;

        }


        atualizarFiltroVisual();

        renderizarLista();

    }


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    function alternarOrdenacao() {

        const opcoes = [

            {
                chave:
                    "recentes",

                texto:
                    "Mais recentes"
            },

            {
                chave:
                    "antigas",

                texto:
                    "Mais antigas"
            },

            {
                chave:
                    "valor_maior",

                texto:
                    "Maior valor"
            },

            {
                chave:
                    "valor_menor",

                texto:
                    "Menor valor"
            }

        ];


        const indiceAtual =
            opcoes.findIndex(
                function (opcao) {

                    return (
                        opcao.chave ===
                        estado.ordenacao
                    );

                }
            );


        const proximoIndice =
            (
                indiceAtual + 1
            ) %
            opcoes.length;


        const proximaOpcao =
            opcoes[
                proximoIndice
            ];


        estado.ordenacao =
            proximaOpcao.chave;


        const botao =
            obterElemento(
                CONFIG.seletores
                    .btnOrdenacao
            );


        if (
            botao
        ) {

            const texto =
                botao.querySelector(
                    "span"
                );


            if (
                texto
            ) {

                texto.textContent =
                    proximaOpcao.texto;

            }

        }


        renderizarLista();

    }


    /* =====================================================
       ABRIR CONTRATAÇÃO
    ====================================================== */

    function abrirContratacao(
        id
    ) {

        const contratacao =
            estado.contratacoes.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(id)
                    );

                }
            );


        if (
            !contratacao
        ) {

            console.warn(
                "MusicalWorld — contratação não encontrada:",
                id
            );

            return;

        }


        /*
         * O Supabase continua sendo a fonte oficial.
         *
         * O sessionStorage serve apenas como apoio
         * para a tela seguinte.
         *
         * A mesma tela de acompanhamento será utilizada
         * tanto para contratações tradicionais quanto
         * para propostas recebidas.
         */

        try {

            sessionStorage.setItem(

                CONFIG.armazenamento
                    .chaveContratacao,

                JSON.stringify(
                    contratacao
                )

            );

        } catch (erro) {

            console.warn(
                "MusicalWorld — não foi possível salvar a contratação selecionada.",
                erro
            );

        }


        window.location.href =
            `${CONFIG.paginas.acompanhamento}?id=${encodeURIComponent(
                contratacao.id
            )}`;

    }


    /* =====================================================
       CARREGAR CONTRATAÇÕES DO SUPABASE
    ====================================================== */

    async function carregarContratacoes() {

        /*
         * Utilizamos o cliente central.
         */

        if (
            !window.supabaseClient ||
            typeof window.supabaseClient.from !==
                "function"
        ) {

            estado.erro =
                "Cliente Supabase não encontrado.";


            estado.contratacoes =
                [];


            atualizarResumo();

            renderizarLista();


            console.error(
                "MusicalWorld — window.supabaseClient não encontrado."
            );


            return;

        }


        estado.carregando =
            true;


        estado.erro =
            null;


        try {

            /* ---------------------------------------------
               USUÁRIO ATUAL
            ---------------------------------------------- */

            const dadosUsuario =
                await UsuarioAtual.obter();


            if (
                !dadosUsuario
            ) {

                console.warn(
                    "MusicalWorld — nenhum usuário autenticado."
                );


                estado.usuarioId =
                    null;


                estado.contratacoes =
                    [];


                atualizarResumo();

                renderizarLista();


                return;

            }


            estado.usuarioId =
                dadosUsuario.auth.id;


            /* ---------------------------------------------
               BUSCAR OS DOIS LADOS
            ---------------------------------------------- */

            /*
             * 1. Contratações realizadas:
             *
             * contratante_id = usuário atual
             *
             * 2. Solicitações recebidas:
             *
             * contratado_id = usuário atual
             *
             * Fazemos duas consultas separadas para manter
             * a lógica clara e evitar depender de uma expressão
             * OR específica do Supabase.
             */

            const [

                respostaRealizadas,

                respostaRecebidas

            ] = await Promise.all([

                supabaseClient

                    .from(
                        CONFIG.tabelas
                            .contratacoes
                    )

                    .select("*")

                    .eq(
                        "contratante_id",
                        estado.usuarioId
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    ),


                supabaseClient

                    .from(
                        CONFIG.tabelas
                            .contratacoes
                    )

                    .select("*")

                    .eq(
                        "contratado_id",
                        estado.usuarioId
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    )

            ]);


            if (
                respostaRealizadas.error
            ) {

                throw respostaRealizadas.error;

            }


            if (
                respostaRecebidas.error
            ) {

                throw respostaRecebidas.error;

            }


            const registrosRealizados =
                respostaRealizadas.data ||
                [];


            const registrosRecebidos =
                respostaRecebidas.data ||
                [];


            /*
             * Como um usuário pode contratar a si mesmo
             * em algum cenário futuro, ou uma mesma linha
             * aparecer nas duas consultas, fazemos uma
             * deduplicação pelo ID da contratação.
             */

            const registrosMap =
                new Map();


            registrosRealizados.forEach(
                function (registro) {

                    registrosMap.set(
                        String(registro.id),
                        registro
                    );

                }
            );


            registrosRecebidos.forEach(
                function (registro) {

                    registrosMap.set(
                        String(registro.id),
                        registro
                    );

                }
            );


            const registros =
                Array.from(
                    registrosMap.values()
                );


            /*
             * Transformamos cada contratação.
             */

            const contratosConvertidos =
                await Promise.all(

                    registros.map(
                        function (registro) {

                            return transformarContratacao(

                                supabaseClient,

                                registro,

                                estado.usuarioId

                            );

                        }
                    )

                );


            /*
             * Mais recentes primeiro antes da renderização.
             */

            contratosConvertidos.sort(
                function (a, b) {

                    return (

                        new Date(
                            b.createdAt
                        ) -

                        new Date(
                            a.createdAt
                        )

                    );

                }
            );


            estado.contratacoes =
                contratosConvertidos;


            /* ---------------------------------------------
               ARMAZENAMENTO LOCAL DE APOIO
            ---------------------------------------------- */

            try {

                sessionStorage.setItem(

                    CONFIG.armazenamento
                        .chaveLista,

                    JSON.stringify(
                        estado.contratacoes
                    )

                );

            } catch (erro) {

                console.warn(
                    "MusicalWorld — não foi possível armazenar a lista localmente.",
                    erro
                );

            }


            atualizarResumo();

            renderizarLista();


        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao carregar contratações:",
                erro
            );


            estado.erro =
                erro;


            estado.contratacoes =
                [];


            atualizarResumo();

            renderizarLista();


        } finally {

            estado.carregando =
                false;

        }

    }


    /* =====================================================
       EVENTOS
    ====================================================== */

    function configurarEventos() {

        /* -----------------------------------------------
           FILTROS
        ------------------------------------------------ */

        document

            .querySelectorAll(
                CONFIG.seletores.filtros
            )

            .forEach(
                function (botao) {

                    botao.addEventListener(
                        "click",
                        function () {

                            definirFiltro(
                                botao.dataset.filtro
                            );

                        }
                    );

                }
            );


        /* -----------------------------------------------
           CARDS DE RESUMO
        ------------------------------------------------ */

        document

            .querySelectorAll(
                CONFIG.seletores.cardsResumo
            )

            .forEach(
                function (card) {

                    card.addEventListener(
                        "click",
                        function () {

                            definirFiltro(
                                card.dataset.filtro
                            );

                        }
                    );

                }
            );


        /* -----------------------------------------------
           BUSCA
        ------------------------------------------------ */

        const campoBusca =
            obterElemento(
                CONFIG.seletores
                    .campoBusca
            );


        if (
            campoBusca
        ) {

            campoBusca.addEventListener(
                "input",
                function () {

                    atualizarBusca(
                        campoBusca.value
                    );

                }
            );

        }


        /* -----------------------------------------------
           LIMPAR BUSCA
        ------------------------------------------------ */

        const btnLimparBusca =
            obterElemento(
                CONFIG.seletores
                    .btnLimparBusca
            );


        if (
            btnLimparBusca
        ) {

            btnLimparBusca.addEventListener(
                "click",
                limparBusca
            );

        }


        /* -----------------------------------------------
           LIMPAR FILTROS
        ------------------------------------------------ */

        const btnLimparFiltros =
            obterElemento(
                CONFIG.seletores
                    .btnLimparFiltros
            );


        if (
            btnLimparFiltros
        ) {

            btnLimparFiltros.addEventListener(
                "click",
                limparFiltros
            );

        }


        /* -----------------------------------------------
           ORDENAÇÃO
        ------------------------------------------------ */

        const btnOrdenacao =
            obterElemento(
                CONFIG.seletores
                    .btnOrdenacao
            );


        if (
            btnOrdenacao
        ) {

            btnOrdenacao.addEventListener(
                "click",
                alternarOrdenacao
            );

        }


        /* -----------------------------------------------
           VER CONTRATAÇÃO / PROPOSTA
        ------------------------------------------------ */

        const lista =
            obterElemento(
                CONFIG.seletores.lista
            );


        if (
            lista
        ) {

            lista.addEventListener(
                "click",
                function (evento) {

                    const botao =
                        evento.target.closest(
                            "[data-contratacao-id]"
                        );


                    if (
                        !botao
                    ) {

                        return;

                    }


                    abrirContratacao(
                        botao.dataset
                            .contratacaoId
                    );

                }
            );

        }


        /* -----------------------------------------------
           VOLTAR
        ------------------------------------------------ */

        const btnVoltar =
            obterElemento(
                CONFIG.seletores.btnVoltar
            );


        if (
            btnVoltar
        ) {

            btnVoltar.addEventListener(
                "click",
                function () {

                    if (
                        window.history.length > 1
                    ) {

                        window.history.back();

                    } else {

                        window.location.href =
                            CONFIG.paginas.inicio;

                    }

                }
            );

        }


        /* -----------------------------------------------
           INÍCIO
        ------------------------------------------------ */

        const btnInicio =
            obterElemento(
                CONFIG.seletores.btnInicio
            );


        if (
            btnInicio
        ) {

            btnInicio.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.inicio;

                }
            );

        }


        /* -----------------------------------------------
           PERFIL
        ------------------------------------------------ */

        const btnPerfil =
            obterElemento(
                CONFIG.seletores.btnPerfil
            );


        if (
            btnPerfil
        ) {

            btnPerfil.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.perfil;

                }
            );

        }


        /* -----------------------------------------------
           NOVA CONTRATAÇÃO
        ------------------------------------------------ */

        const btnNovaContratacao =
            obterElemento(
                CONFIG.seletores
                    .btnNovaContratacao
            );


        if (
            btnNovaContratacao
        ) {

            btnNovaContratacao.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas
                            .novaContratacao;

                }
            );

        }

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    async function inicializar() {

        if (
            estado.inicializado
        ) {

            return;

        }


        estado.inicializado =
            true;


        configurarEventos();

        atualizarCabecalho();

        atualizarFiltroVisual();


        await carregarContratacoes();


        if (
            window.lucide
        ) {

            window.lucide.createIcons();

        }


        console.log(
            "MusicalWorld — Central de Contratações inicializada com contratações realizadas, solicitações recebidas e propostas."
        );

    }


    /* =====================================================
       API PÚBLICA
    ====================================================== */

    window.MusicalWorldContratacoes = {

        inicializar,

        carregarContratacoes,

        definirFiltro,

        atualizarBusca,

        limparFiltros,

        abrirContratacao,


        obterEstado:
            function () {

                return estado;

            },


        obterContratacoes:
            function () {

                return estado.contratacoes;

            }

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                inicializar();

            }
        );

    } else {

        inicializar();

    }


})(window);