/* =========================================================
   MUSICALWORLD — DADOS DA CENTRAL DE CONTRATAÇÕES

   Arquivo:
   js/contratacoes/ContratacoesDados.js

   Responsabilidade:

   - Manter configurações de tabelas e páginas.
   - Utilitários de dados.
   - Identificar estabelecimento.
   - Normalizar status.
   - Carregar usuários, perfis, artistas e serviços.
   - Carregar oportunidades.
   - Transformar registros de contratacoes.
   - Identificar origem e direção.
   - Aplicar filtros.
   - Pesquisar dados.
   - Ordenar contratações.

   Este módulo NÃO controla a interface da página.

   Arquitetura:

   SupabaseClient.js
   ↓
   UsuarioAtual.js
   ↓
   ContratacoesDados.js
   ↓
   ContratacoesRender.js
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

            proposta:
                "proposta.html",

            perfil:
                "meu-perfil.html",

            minhasOportunidades:
                "minhas-oportunidades.html"

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
                "servicos_artistas",

            oportunidades:
                "oportunidades"

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
                ".resumo-card",

            btnCentralContratacoes:
                "btnCentralContratacoes",

            btnCentralOportunidades:
                "btnCentralOportunidades",

            centralOportunidadesTitulo:
                "centralOportunidadesTitulo",

            centralOportunidadesDescricao:
                "centralOportunidadesDescricao",

            centralOportunidadesIcone:
                "centralOportunidadesIcone"

        }

    };


    /* =====================================================
       UTILITÁRIOS
    ====================================================== */

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


    function normalizarHorario(
        horario
    ) {

        if (!horario) {

            return "";

        }


        const texto =
            String(horario)
                .trim();


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
       IDENTIFICAÇÃO DE ESTABELECIMENTO
    ====================================================== */

    function ehEstabelecimento(pessoa) {

        if (
            window.Cabecalho &&
            typeof window.Cabecalho.ehEstabelecimento ===
                "function"
        ) {

            if (
                pessoa?.tipoPerfil
            ) {

                return window.Cabecalho
                    .ehEstabelecimento(
                        pessoa.tipoPerfil
                    );

            }


            if (
                pessoa?.tipo
            ) {

                return window.Cabecalho
                    .ehEstabelecimento({
                        nome:
                            pessoa.tipo
                    });

            }


            return window.Cabecalho
                .ehEstabelecimento();

        }


        if (!pessoa) {

            return false;

        }


        const tipo =
            normalizarTexto(
                pessoa.tipo
            );


        if (!tipo) {

            return false;

        }


        const tiposEstabelecimento = [

            "casa_shows",
            "casa shows",
            "casa de shows",
            "casa de show",
            "estabelecimento",
            "bar",
            "boate",
            "restaurante",
            "pub",
            "clube",
            "hotel",
            "pousada",
            "organizador eventos",
            "empresa agencia",
            "espaco para eventos",
            "espaco de eventos",
            "espaco para evento",
            "espaco de evento"

        ];


        return tiposEstabelecimento.includes(
            tipo
        );

    }


    /* =====================================================
       STATUS
    ====================================================== */

    function normalizarStatus(status) {

        const mapa = {

            rascunho:
                "rascunho",

            solicitacao_enviada:
                "aguardando_artista",

            aguardando_confirmacao:
                "aguardando_artista",

            aguardando_artista:
                "aguardando_artista",

            confirmada:
                "confirmada",

            em_andamento:
                "andamento",

            andamento:
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


    function extrairDadosLocal(local) {

        if (!local) {

            return {

                nome:
                    "Local não informado",

                cidade:
                    ""

            };

        }


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
       CARREGAR PESSOA
    ====================================================== */

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

                tipoPerfil:
                    null,

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


        const tipoPerfil =
            perfil?.tipos_perfil ||
            null;


        const tipo =
            perfilArtista?.tipo_artista ||
            tipoPerfil?.nome ||
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

            tipoPerfil,

            iniciais:
                obterIniciais(nome),

            fotoUrl,

            localizacao

        };

    }


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
       CARREGAR SERVIÇO
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
       CARREGAR OPORTUNIDADE
    ====================================================== */

    async function carregarDadosOportunidade(
        supabase,
        oportunidadeId
    ) {

        if (!oportunidadeId) {

            return null;

        }


        const resposta =
            await supabase

                .from(
                    CONFIG.tabelas.oportunidades
                )

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
                    "id",
                    oportunidadeId
                )

                .maybeSingle();


        if (
            resposta.error
        ) {

            console.warn(
                "MusicalWorld — erro ao carregar oportunidade:",
                resposta.error
            );


            return {

                id:
                    oportunidadeId,

                titulo:
                    "Oportunidade"

            };

        }


        const oportunidade =
            resposta.data;


        if (!oportunidade) {

            return {

                id:
                    oportunidadeId,

                titulo:
                    "Oportunidade"

            };

        }


        return {

            id:
                oportunidade.id,

            contratanteId:
                oportunidade.contratante_id,

            titulo:
                oportunidade.titulo ||
                "Oportunidade",

            descricao:
                oportunidade.descricao ||
                "",

            tipoArtista:
                oportunidade.tipo_artista ||
                "",

            dataEvento:
                oportunidade.data_evento ||
                null,

            horaInicio:
                oportunidade.hora_inicio ||
                null,

            horaFim:
                oportunidade.hora_fim ||
                null,

            estilos:
                oportunidade.estilos ||
                [],

            instrumentos:
                oportunidade.instrumentos ||
                [],

            valor:
                oportunidade.valor ??
                null,

            local:
                oportunidade.local ||
                null,

            prazoInteresse:
                oportunidade.prazo_interesse ||
                null,

            status:
                oportunidade.status ||
                null,

            createdAt:
                oportunidade.created_at,

            updatedAt:
                oportunidade.updated_at

        };

    }


    /* =====================================================
       ORIGEM
    ====================================================== */

    function identificarOrigemContratacao(
        registro,
        usuarioId,
        usuarioEhContratante,
        usuarioEhContratado
    ) {

        if (
            registro.oportunidade_id
        ) {

            return "oportunidade";

        }


        if (
            usuarioEhContratado
        ) {

            return "solicitacao_recebida";

        }


        if (
            usuarioEhContratante
        ) {

            return "contratacao_realizada";

        }


        return "desconhecida";

    }


    /* =====================================================
       TRANSFORMAR CONTRATAÇÃO
    ====================================================== */

    async function transformarContratacao(
        supabase,
        registro,
        usuarioId
    ) {

        const usuarioEhContratante =
            String(
                registro.contratante_id
            ) ===
            String(usuarioId);


        const usuarioEhContratado =
            String(
                registro.contratado_id
            ) ===
            String(usuarioId);


        const direcao =
            usuarioEhContratado
                ? "recebida"
                : usuarioEhContratante
                    ? "realizada"
                    : "desconhecida";


        const origem =
            identificarOrigemContratacao(
                registro,
                usuarioId,
                usuarioEhContratante,
                usuarioEhContratado
            );


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


        const oportunidade =
            await carregarDadosOportunidade(
                supabase,
                registro.oportunidade_id
            );


        const dadosLocal =
            extrairDadosLocal(
                registro.local
            );


        const localOportunidade =
            extrairDadosLocal(
                oportunidade?.local
            );


        const statusNormalizado =
            normalizarStatus(
                registro.status
            );


        const propostaRecebida =
            direcao === "recebida" &&
            registro.status ===
                "solicitacao_enviada";


        const propostaEnviada =
            direcao === "realizada" &&
            registro.status ===
                "solicitacao_enviada" &&
            ehEstabelecimento(
                contratado
            );


        let nomeOportunidade =
            oportunidade?.titulo ||
            "";


        if (
            origem === "oportunidade" &&
            !nomeOportunidade
        ) {

            nomeOportunidade =
                "Oportunidade";

        }


        return {

            id:
                registro.id,

            contratanteId:
                registro.contratante_id,

            contratadoId:
                registro.contratado_id,

            oportunidadeId:
                registro.oportunidade_id ||
                null,

            servicoId:
                registro.servico_id,

            direcao,

            origem,

            propostaRecebida,

            propostaEnviada,

            pessoa,

            contratante,

            contratado,

            artista:
                contratado,

            oportunidade: {

                ...(oportunidade || {}),

                titulo:
                    nomeOportunidade

            },

            servico: {

                ...servico,

                valor:
                    registro.valor ??
                    servico.valor ??
                    oportunidade?.valor ??
                    0

            },

            evento: {

                nome:
                    registro.tipo_evento ||
                    oportunidade?.titulo ||
                    "Evento",

                tipo:
                    registro.tipo_evento ||
                    oportunidade?.tipoArtista ||
                    "Evento",

                data:
                    registro.data_evento ||
                    oportunidade?.dataEvento ||
                    null,

                horarioInicio:
                    registro.horario_inicio ||
                    oportunidade?.horaInicio ||
                    null,

                horarioFim:
                    registro.horario_fim ||
                    oportunidade?.horaFim ||
                    null,

                local:
                    dadosLocal.nome !==
                        "Local não informado"
                        ? dadosLocal.nome
                        : localOportunidade.nome,

                cidade:
                    dadosLocal.cidade ||
                    localOportunidade.cidade,

                observacoes:
                    registro.observacoes ||
                    oportunidade?.descricao ||
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
                oportunidade?.descricao ||
                "",

            createdAt:
                registro.created_at,

            updatedAt:
                registro.updated_at

        };

    }


    /* =====================================================
       FILTROS
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
            filtro === "recebidas"
        ) {

            return (
                contratacao.direcao ===
                "recebida"
            );

        }


        if (
            filtro === "enviadas"
        ) {

            return (
                contratacao.direcao ===
                "realizada"
            );

        }


        if (
            filtro === "oportunidades"
        ) {

            return (
                contratacao.origem ===
                "oportunidade"
            );

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
            contratacao.evento?.cidade,

            contratacao.oportunidade?.titulo,
            contratacao.oportunidade?.tipoArtista

        ];


        const textoCompleto =
            termos
                .map(normalizarTexto)
                .join(" ");


        return textoCompleto.includes(
            normalizarTexto(busca)
        );

    }


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    function ordenarContratacoes(
        lista,
        ordenacao
    ) {

        const copia =
            [...lista];


        if (
            ordenacao ===
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
            ordenacao ===
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
            ordenacao ===
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
       API DO MÓDULO
    ====================================================== */

    window.MusicalWorldContratacoesDados = {

        CONFIG,

        escaparHtml,

        formatarMoeda,

        formatarData,

        formatarDataCompleta,

        normalizarTexto,

        obterIniciais,

        normalizarHorario,

        ehEstabelecimento,

        normalizarStatus,

        extrairDadosLocal,

        carregarDadosPessoa,

        carregarDadosArtista,

        carregarDadosServico,

        carregarDadosOportunidade,

        identificarOrigemContratacao,

        transformarContratacao,

        pertenceAoFiltro,

        correspondeBusca,

        ordenarContratacoes

    };

})(window);