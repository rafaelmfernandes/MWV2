
/* =========================================================
   MUSICALWORLD — SOLICITAÇÃO ENVIADA
   Arquivo: contratacao-sucesso.js

   Responsabilidade:
   - Recuperar o ID real da contratação criada no pagamento.
   - Consultar a contratação no Supabase.
   - Consultar o serviço contratado.
   - Consultar os dados públicos do artista.
   - Exibir o resumo real da solicitação.
   - Exibir o status real do pagamento.
   - Preparar as ações da tela de sucesso.

   Fonte principal dos dados:
   - MusicalWorldContratacaoEstado
   - Supabase / tabela public.contratacoes

   Observações:
   - Não utiliza dados demonstrativos.
   - O estado central é a principal fonte de
     compatibilidade entre as etapas.
   - O Supabase é a fonte oficial dos dados da
     contratação já criada.
   - O sessionStorage antigo é mantido somente
     como fallback de compatibilidade.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        armazenamento: {

            /*
             * Chave atual utilizada pelo estado central.
             */
            chaveEstado:
                "musicalworld_contratacao_estado",

            /*
             * Chave antiga mantida como fallback.
             */
            chaveLegada:
                "musicalworld_contratacao"
        },

        tabelas: {

            contratacoes:
                "contratacoes",

            servicos:
                "servicos_artistas",

            usuarios:
                "usuarios",

            perfis:
                "perfis",

            perfisArtistas:
                "perfis_artistas"
        },

        paginas: {

            inicio:
                "index.html",

            acompanhamento:
                "contratacao-acompanhamento.html"
        },

        seletores: {

            artistaAvatar:
                "artistaAvatar",

            artistaNome:
                "artistaNome",

            artistaTipo:
                "artistaTipo",

            servicoNome:
                "servicoNome",

            dataEvento:
                "dataEvento",

            horarioEvento:
                "horarioEvento",

            localEvento:
                "localEvento",

            valorTotal:
                "valorTotal",

            metodoPagamento:
                "metodoPagamento",

            tituloPagamento:
                "tituloPagamento",

            mensagemPagamento:
                "mensagemPagamento",

            btnVerContratacao:
                "btnVerContratacao",

            btnVoltarInicio:
                "btnVoltarInicio",

            btnVoltarInicioTopo:
                "btnVoltarInicioTopo"
        }
    };


    /* =====================================================
       ESTADO DO MÓDULO
       ===================================================== */

    const estado = {

        dados: null,

        contratacaoId: null,

        carregando: false,

        erro: null,

        inicializado: false
    };


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    function obterElemento(nome) {

        const id =
            CONFIG.seletores[nome];

        if (!id) {

            return null;
        }

        return document.getElementById(id);
    }


    /* =====================================================
       OBTER CLIENTE SUPABASE
       ===================================================== */

    function obterSupabaseClient() {

        /*
         * O projeto MusicalWorld possui um cliente
         * Supabase centralizado em window.supabaseClient.
         */

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from ===
                "function"
        ) {

            return window.supabaseClient;
        }


        /*
         * Compatibilidade com o objeto
         * SupabaseClient utilizado por módulos antigos.
         */

        if (
            window.SupabaseClient &&
            typeof window.SupabaseClient.getClient ===
                "function"
        ) {

            try {

                const cliente =
                    window.SupabaseClient.getClient();


                if (
                    cliente &&
                    typeof cliente.from ===
                        "function"
                ) {

                    return cliente;
                }

            } catch (erro) {

                console.error(
                    "MusicalWorldContratacaoSucesso: " +
                    "erro ao obter cliente Supabase.",
                    erro
                );
            }
        }


        /*
         * Compatibilidade adicional.
         */

        if (
            window.SupabaseClient &&
            window.SupabaseClient.client &&
            typeof window.SupabaseClient.client.from ===
                "function"
        ) {

            return window.SupabaseClient.client;
        }


        console.error(
            "MusicalWorldContratacaoSucesso: " +
            "cliente Supabase não encontrado."
        );


        return null;
    }


    /* =====================================================
       OBTER GERENCIADOR DO ESTADO DA CONTRATAÇÃO
       ===================================================== */

    function obterGerenciadorEstado() {

        return (
            window.MusicalWorldContratacaoEstado ||
            window.ContratacaoEstado ||
            null
        );
    }


    /* =====================================================
       OBTER ESTADO CENTRAL
       ===================================================== */

    function obterEstadoCentral() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            console.warn(
                "MusicalWorldContratacaoSucesso: " +
                "gerenciador central da contratação " +
                "não encontrado."
            );

            return null;
        }


        try {

            if (
                typeof gerenciador.inicializar ===
                    "function"
            ) {

                gerenciador.inicializar();
            }


            if (
                typeof gerenciador.obter ===
                    "function"
            ) {

                return gerenciador.obter();
            }

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoSucesso: " +
                "erro ao obter estado central.",
                erro
            );
        }


        return null;
    }


    /* =====================================================
       RECUPERAR DADOS DO SESSION STORAGE
       ===================================================== */

    function obterDadosSessionStorage() {

        /*
         * Primeiro tentamos a chave atual do
         * ContratacaoEstado.js.
         */

        try {

            const brutoAtual =
                sessionStorage.getItem(
                    CONFIG.armazenamento.chaveEstado
                );


            if (brutoAtual) {

                const dados =
                    JSON.parse(brutoAtual);


                if (
                    dados &&
                    typeof dados === "object"
                ) {

                    return dados;
                }
            }

        } catch (erro) {

            console.warn(
                "MusicalWorldContratacaoSucesso: " +
                "erro ao ler estado central do sessionStorage.",
                erro
            );
        }


        /*
         * Depois tentamos a chave antiga.
         */

        try {

            const brutoLegado =
                sessionStorage.getItem(
                    CONFIG.armazenamento.chaveLegada
                );


            if (brutoLegado) {

                const dados =
                    JSON.parse(brutoLegado);


                if (
                    dados &&
                    typeof dados === "object"
                ) {

                    return dados;
                }
            }

        } catch (erro) {

            console.warn(
                "MusicalWorldContratacaoSucesso: " +
                "erro ao ler sessionStorage legado.",
                erro
            );
        }


        return null;
    }


    /* =====================================================
       OBTER ID DA CONTRATAÇÃO
       ===================================================== */

    function obterContratacaoId() {

        const estadoCentral =
            obterEstadoCentral();


        /*
         * O pagamento salva os dois nomes por compatibilidade:
         *
         * contratacaoId
         * contratacao_id
         */

        if (estadoCentral) {

            const id =
                estadoCentral.contratacaoId ||
                estadoCentral.contratacao_id;


            if (id) {

                return id;
            }
        }


        /*
         * Fallback para o sessionStorage.
         */

        const dadosSessao =
            obterDadosSessionStorage();


        if (dadosSessao) {

            const id =
                dadosSessao.contratacaoId ||
                dadosSessao.contratacao_id;


            if (id) {

                return id;
            }
        }


        return null;
    }


    /* =====================================================
       FORMATAÇÃO DE MOEDA
       ===================================================== */

    function formatarMoeda(valor) {

        const numero =
            Number(valor);


        if (!Number.isFinite(numero)) {

            return "R$ 0,00";
        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    /* =====================================================
       FORMATAÇÃO DE DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {

            return "Data a definir";
        }


        const texto =
            String(data)
                .trim();


        /*
         * O banco retorna normalmente:
         *
         * 2026-09-17
         *
         * Mantemos a conversão sem usar
         * new Date("2026-09-17") para evitar
         * deslocamento de timezone.
         */

        const partes =
            texto.split("-");


        if (partes.length !== 3) {

            return texto;
        }


        const ano =
            Number(partes[0]);


        const mes =
            Number(partes[1]);


        const dia =
            Number(partes[2]);


        if (
            !ano ||
            !mes ||
            !dia
        ) {

            return texto;
        }


        const dataFormatada =
            new Date(
                ano,
                mes - 1,
                dia
            );


        return dataFormatada.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       NORMALIZAR HORÁRIO
       ===================================================== */

    function normalizarHorario(horario) {

        if (
            horario === null ||
            horario === undefined
        ) {

            return "";
        }


        let texto =
            String(horario)
                .trim();


        if (!texto) {

            return "";
        }


        /*
         * PostgreSQL normalmente retorna campos TIME
         * como:
         *
         * 13:51:00
         *
         * A interface não precisa exibir os segundos.
         */

        const partes =
            texto.split(":");


        if (partes.length >= 2) {

            const horas =
                partes[0].padStart(2, "0");


            const minutos =
                partes[1].padStart(2, "0");


            return (
                horas +
                ":" +
                minutos
            );
        }


        return texto;
    }


    /* =====================================================
       FORMATAÇÃO DE HORÁRIO
       ===================================================== */

    function formatarHorario(
        horarioInicio,
        horarioFim
    ) {

        const inicio =
            normalizarHorario(
                horarioInicio
            );


        const fim =
            normalizarHorario(
                horarioFim
            );


        if (
            !inicio &&
            !fim
        ) {

            return "Horário ainda não informado";
        }


        if (
            inicio &&
            fim
        ) {

            return (
                inicio +
                " às " +
                fim
            );
        }


        if (inicio) {

            return inicio;
        }


        return fim;
    }


    /* =====================================================
       FORMATAÇÃO DO MÉTODO DE PAGAMENTO
       ===================================================== */

    function formatarMetodoPagamento(metodo) {

        if (!metodo) {

            return "Não informado";
        }


        const valor =
            String(metodo)
                .toLowerCase()
                .trim();


        if (valor === "pix") {

            return "Pix";
        }


        if (
            valor === "cartao" ||
            valor === "cartão" ||
            valor === "credito" ||
            valor === "crédito" ||
            valor === "cartao_credito" ||
            valor === "cartão_credito"
        ) {

            return "Cartão";
        }


        if (valor === "dinheiro") {

            return "Dinheiro";
        }


        return metodo;
    }


    /* =====================================================
       OBTER TEXTO DO LOCAL
       ===================================================== */

    function obterTextoLocal(local) {

        if (!local) {

            return "Local a definir";
        }


        /*
         * Caso o banco tenha retornado
         * diretamente uma string.
         */

        if (typeof local === "string") {

            return local;
        }


        /*
         * Caso o campo seja JSONB.
         */

        if (local.enderecoCompleto) {

            return local.enderecoCompleto;
        }


        /*
         * Compatibilidade com diferentes nomes
         * de endereço.
         */

        const partes = [

            local.endereco,
            local.numero,
            local.bairro,
            local.cidade,
            local.estado

        ].filter(Boolean);


        if (partes.length) {

            return partes.join(", ");
        }


        /*
         * Compatibilidade com estrutura antiga.
         */

        const partesAntigas = [

            local.rua,
            local.numero,
            local.bairro,
            local.cidade,
            local.estado

        ].filter(Boolean);


        if (partesAntigas.length) {

            return partesAntigas.join(", ");
        }


        if (local.tipoLocal) {

            return local.tipoLocal;
        }


        if (local.nomeLocal) {

            return local.nomeLocal;
        }


        return "Local a definir";
    }


    /* =====================================================
       GERAR INICIAIS
       ===================================================== */

    function obterIniciais(nome) {

        if (!nome) {

            return "MW";
        }


        const partes =
            String(nome)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {

            return "MW";
        }


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


    /* =====================================================
       BUSCAR CONTRATAÇÃO NO SUPABASE
       ===================================================== */

    async function buscarContratacao(
        contratacaoId
    ) {

        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );
        }


        if (!contratacaoId) {

            throw new Error(
                "ID da contratação não encontrado."
            );
        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.contratacoes
                )
                .select(
                    [
                        "id",
                        "contratante_id",
                        "contratado_id",
                        "servico_id",
                        "data_evento",
                        "horario_inicio",
                        "horario_fim",
                        "valor",
                        "status",
                        "metodo_pagamento",
                        "status_pagamento",
                        "tipo_evento",
                        "local",
                        "observacoes",
                        "created_at",
                        "updated_at"
                    ].join(",")
                )
                .eq(
                    "id",
                    contratacaoId
                )
                .single();


        if (resposta.error) {

            throw resposta.error;
        }


        if (!resposta.data) {

            throw new Error(
                "Contratação não encontrada."
            );
        }


        return resposta.data;
    }


    /* =====================================================
       BUSCAR SERVIÇO NO SUPABASE
       ===================================================== */

    async function buscarServico(
        servicoId
    ) {

        if (!servicoId) {

            return null;
        }


        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );
        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.servicos
                )
                .select(
                    [
                        "id",
                        "perfil_id",
                        "nome_servico",
                        "descricao",
                        "duracao",
                        "tipo_preco",
                        "valor",
                        "ativo"
                    ].join(",")
                )
                .eq(
                    "id",
                    servicoId
                )
                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;
        }


        return resposta.data || null;
    }


    /* =====================================================
       BUSCAR USUÁRIO DO ARTISTA
       ===================================================== */

    async function buscarUsuarioArtista(
        usuarioId
    ) {

        if (!usuarioId) {

            return null;
        }


        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );
        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select(
                    "id,nome,email"
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (resposta.error) {

            throw resposta.error;
        }


        return resposta.data || null;
    }


    /* =====================================================
       BUSCAR PERFIL DO ARTISTA
       ===================================================== */

    async function buscarPerfilArtista(
        usuarioId
    ) {

        if (!usuarioId) {

            return null;
        }


        const supabase =
            obterSupabaseClient();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não está disponível."
            );
        }


        /*
         * Primeiro buscamos o perfil pelo usuario_id.
         */

        const respostaPerfil =
            await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(
                    [
                        "id",
                        "usuario_id",
                        "tipo_perfil_id",
                        "nome_exibicao",
                        "descricao",
                        "ativo",
                        "perfil_publicado"
                    ].join(",")
                )
                .eq(
                    "usuario_id",
                    usuarioId
                )
                .maybeSingle();


        if (respostaPerfil.error) {

            throw respostaPerfil.error;
        }


        if (!respostaPerfil.data) {

            return null;
        }


        const perfil =
            respostaPerfil.data;


        /*
         * Depois buscamos os dados específicos
         * do perfil artístico.
         */

        const respostaArtista =
            await supabase
                .from(
                    CONFIG.tabelas.perfisArtistas
                )
                .select(
                    [
                        "id",
                        "perfil_id",
                        "tipo_artista",
                        "localizacao",
                        "experiencia",
                        "area_atendimento",
                        "disponivel",
                        "instrumentos",
                        "estilos",
                        "servicos",
                        "foto_url"
                    ].join(",")
                )
                .eq(
                    "perfil_id",
                    perfil.id
                )
                .maybeSingle();


        if (respostaArtista.error) {

            throw respostaArtista.error;
        }


        return {

            perfil:
                perfil,

            artista:
                respostaArtista.data || null
        };
    }


    /* =====================================================
       RESOLVER DADOS DE DATA E HORÁRIO
       ===================================================== */

    function resolverDataHorario(
        contratacao,
        estadoCentral
    ) {

        /*
         * A contratação no Supabase é a fonte principal.
         *
         * O estado central é utilizado como fallback.
         *
         * Isso é especialmente útil durante a transição
         * das etapas antigas para o estado central.
         */

        const dataBanco =
            contratacao &&
            contratacao.data_evento
                ? contratacao.data_evento
                : null;


        const inicioBanco =
            contratacao &&
            contratacao.horario_inicio
                ? contratacao.horario_inicio
                : null;


        const fimBanco =
            contratacao &&
            contratacao.horario_fim
                ? contratacao.horario_fim
                : null;


        const dataEstado =
            estadoCentral &&
            estadoCentral.dataEvento
                ? estadoCentral.dataEvento
                : null;


        const inicioEstado =
            estadoCentral &&
            estadoCentral.horarioInicio
                ? estadoCentral.horarioInicio
                : null;


        const fimEstado =
            estadoCentral &&
            estadoCentral.horarioFim
                ? estadoCentral.horarioFim
                : null;


        return {

            data:
                dataBanco ||
                dataEstado ||
                null,

            horarioInicio:
                inicioBanco ||
                inicioEstado ||
                null,

            horarioFim:
                fimBanco ||
                fimEstado ||
                null
        };
    }


    /* =====================================================
       MONTAR DADOS DA TELA
       ===================================================== */

    async function montarDadosTela(
        contratacao
    ) {

        /*
         * Recuperamos o estado central para permitir
         * fallback dos campos durante a migração.
         */

        const estadoCentral =
            obterEstadoCentral();


        /*
         * Serviço contratado.
         */

        const servico =
            await buscarServico(
                contratacao.servico_id
            );


        /*
         * Usuário contratado.
         */

        const usuario =
            await buscarUsuarioArtista(
                contratacao.contratado_id
            );


        /*
         * Perfil artístico.
         */

        const dadosPerfil =
            await buscarPerfilArtista(
                contratacao.contratado_id
            );


        const perfil =
            dadosPerfil &&
            dadosPerfil.perfil
                ? dadosPerfil.perfil
                : null;


        const perfilArtista =
            dadosPerfil &&
            dadosPerfil.artista
                ? dadosPerfil.artista
                : null;


        /*
         * Nome do artista.
         */

        const nomeArtista =
            (
                perfil &&
                perfil.nome_exibicao
            ) ||
            (
                usuario &&
                usuario.nome
            ) ||
            "Artista";


        /*
         * Foto do artista.
         */

        const fotoUrl =
            perfilArtista &&
            perfilArtista.foto_url
                ? perfilArtista.foto_url
                : null;


        /*
         * Tipo artístico.
         */

        const tipoArtista =
            perfilArtista &&
            perfilArtista.tipo_artista
                ? perfilArtista.tipo_artista
                : "Artista";


        /*
         * Data e horário.
         */

        const dataHorario =
            resolverDataHorario(
                contratacao,
                estadoCentral
            );


        /*
         * Log específico para facilitar a
         * identificação de qualquer problema futuro.
         */

        console.log(
            "MusicalWorldContratacaoSucesso: " +
            "data e horário resolvidos.",
            {
                data:
                    dataHorario.data,

                horarioInicio:
                    dataHorario.horarioInicio,

                horarioFim:
                    dataHorario.horarioFim
            }
        );


        return {

            contratacao:
                contratacao,

            contratacaoId:
                contratacao.id,


            artista: {

                id:
                    contratacao.contratado_id,

                nome:
                    nomeArtista,

                tipo:
                    tipoArtista,

                fotoUrl:
                    fotoUrl,

                iniciais:
                    obterIniciais(
                        nomeArtista
                    ),

                localizacao:
                    perfilArtista
                        ? perfilArtista.localizacao
                        : null
            },


            servico: {

                id:
                    servico
                        ? servico.id
                        : contratacao.servico_id,

                nome:
                    servico
                        ? servico.nome_servico
                        : "Serviço",

                valor:
                    Number(
                        contratacao.valor ??
                        (
                            servico
                                ? servico.valor
                                : 0
                        )
                    ),

                descricao:
                    servico
                        ? servico.descricao
                        : null,

                duracao:
                    servico
                        ? servico.duracao
                        : null,

                tipoPreco:
                    servico
                        ? servico.tipo_preco
                        : null
            },


            /*
             * IMPORTANTE:
             * Estes três campos são agora sempre
             * normalizados a partir do banco ou,
             * se necessário, do estado central.
             */

            data:
                dataHorario.data,

            horarioInicio:
                dataHorario.horarioInicio,

            horarioFim:
                dataHorario.horarioFim,


            local:
                contratacao.local,

            tipoEvento:
                contratacao.tipo_evento,

            observacoes:
                contratacao.observacoes,


            pagamento: {

                status:
                    contratacao.status_pagamento,

                metodo:
                    contratacao.metodo_pagamento,

                confirmado:
                    String(
                        contratacao.status_pagamento ||
                        ""
                    )
                        .toLowerCase() ===
                        "pago"
            },


            statusContratacao:
                contratacao.status
        };
    }


    /* =====================================================
       CARREGAR DADOS
       ===================================================== */

    async function carregarDados() {

        estado.carregando =
            true;

        estado.erro =
            null;


        try {

            /*
             * Recuperamos o ID criado pelo pagamento.
             */

            const contratacaoId =
                obterContratacaoId();


            if (!contratacaoId) {

                throw new Error(
                    "Não foi possível identificar a contratação criada."
                );
            }


            estado.contratacaoId =
                contratacaoId;


            console.log(
                "MusicalWorldContratacaoSucesso: " +
                "buscando contratação.",
                contratacaoId
            );


            /*
             * Busca oficial no banco.
             */

            const contratacao =
                await buscarContratacao(
                    contratacaoId
                );


            /*
             * Montamos os dados relacionados.
             */

            const dados =
                await montarDadosTela(
                    contratacao
                );


            estado.dados =
                dados;


            console.log(
                "MusicalWorldContratacaoSucesso: " +
                "dados reais carregados.",
                dados
            );


            return dados;

        } catch (erro) {

            estado.erro =
                erro;


            console.error(
                "MusicalWorldContratacaoSucesso: " +
                "erro ao carregar contratação.",
                erro
            );


            /*
             * O fallback utiliza somente dados reais
             * previamente armazenados.
             *
             * Nunca cria dados demonstrativos.
             */

            const dadosSessao =
                obterDadosSessionStorage();


            if (
                dadosSessao &&
                (
                    dadosSessao.dataEvento ||
                    dadosSessao.horarioInicio ||
                    dadosSessao.horarioFim
                )
            ) {

                console.warn(
                    "MusicalWorldContratacaoSucesso: " +
                    "usando estado real do sessionStorage como fallback."
                );


                /*
                 * Caso o banco esteja temporariamente
                 * indisponível, convertemos o estado
                 * central para o formato esperado pela
                 * tela.
                 */

                const dadosFallback = {

                    ...dadosSessao,

                    data:
                        dadosSessao.dataEvento,

                    horarioInicio:
                        dadosSessao.horarioInicio,

                    horarioFim:
                        dadosSessao.horarioFim
                };


                estado.dados =
                    dadosFallback;


                return dadosFallback;
            }


            throw erro;

        } finally {

            estado.carregando =
                false;
        }
    }


    /* =====================================================
       RENDERIZAR AVATAR
       ===================================================== */

    function renderizarAvatar(
        artista
    ) {

        const elemento =
            obterElemento(
                "artistaAvatar"
            );


        if (!elemento) {

            return;
        }


        elemento.innerHTML =
            "";


        if (
            artista &&
            artista.fotoUrl
        ) {

            const imagem =
                document.createElement(
                    "img"
                );


            imagem.src =
                artista.fotoUrl;


            imagem.alt =
                artista.nome ||
                "Artista";


            imagem.onerror =
                function () {

                    elemento.innerHTML =
                        "";


                    elemento.textContent =
                        artista.iniciais ||
                        obterIniciais(
                            artista.nome
                        );
                };


            elemento.appendChild(
                imagem
            );


            return;
        }


        elemento.textContent =
            (
                artista &&
                artista.iniciais
            ) ||
            obterIniciais(
                artista
                    ? artista.nome
                    : null
            );
    }


    /* =====================================================
       RENDERIZAR RESUMO
       ===================================================== */

    function renderizarResumo(
        dados
    ) {

        if (!dados) {

            return;
        }


        const artista =
            dados.artista || {};


        const servico =
            dados.servico || {};


        const pagamento =
            dados.pagamento || {};


        /*
         * Avatar.
         */

        renderizarAvatar(
            artista
        );


        /*
         * Nome do artista.
         */

        const artistaNome =
            obterElemento(
                "artistaNome"
            );


        if (artistaNome) {

            artistaNome.textContent =
                artista.nome ||
                "Artista";
        }


        /*
         * Tipo do artista.
         */

        const artistaTipo =
            obterElemento(
                "artistaTipo"
            );


        if (artistaTipo) {

            artistaTipo.textContent =
                artista.tipo ||
                "Artista";
        }


        /*
         * Serviço contratado.
         */

        const servicoNome =
            obterElemento(
                "servicoNome"
            );


        if (servicoNome) {

            servicoNome.textContent =
                servico.nome ||
                "Serviço";
        }


        /*
         * Data.
         */

        const dataEvento =
            obterElemento(
                "dataEvento"
            );


        if (dataEvento) {

            dataEvento.textContent =
                formatarData(
                    dados.data
                );
        }


        /*
         * Horário.
         */

        const horarioEvento =
            obterElemento(
                "horarioEvento"
            );


        if (horarioEvento) {

            horarioEvento.textContent =
                formatarHorario(
                    dados.horarioInicio,
                    dados.horarioFim
                );
        }


        /*
         * Local.
         */

        const localEvento =
            obterElemento(
                "localEvento"
            );


        if (localEvento) {

            localEvento.textContent =
                obterTextoLocal(
                    dados.local
                );
        }


        /*
         * Valor.
         */

        const valorTotal =
            obterElemento(
                "valorTotal"
            );


        if (valorTotal) {

            valorTotal.textContent =
                formatarMoeda(
                    servico.valor
                );
        }


        /*
         * Método de pagamento.
         */

        const metodoPagamento =
            obterElemento(
                "metodoPagamento"
            );


        if (metodoPagamento) {

            metodoPagamento.textContent =
                formatarMetodoPagamento(
                    pagamento.metodo
                );
        }
    }


    /* =====================================================
       RENDERIZAR AVISO DE PAGAMENTO
       ===================================================== */

    function renderizarPagamento(
        dados
    ) {

        if (!dados) {

            return;
        }


        const pagamento =
            dados.pagamento || {};


        const titulo =
            obterElemento(
                "tituloPagamento"
            );


        const mensagem =
            obterElemento(
                "mensagemPagamento"
            );


        const status =
            String(
                pagamento.status || ""
            )
                .toLowerCase()
                .trim();


        const ehSimulacao =
            status.includes(
                "simulacao"
            );


        if (ehSimulacao) {

            if (titulo) {

                titulo.textContent =
                    "Pagamento simulado";
            }


            if (mensagem) {

                mensagem.textContent =
                    "O pagamento foi simulado apenas para teste do fluxo. A solicitação foi registrada e enviada ao artista.";
            }


            return;
        }


        if (
            status === "pago" ||
            status === "aprovado" ||
            status === "approved"
        ) {

            if (titulo) {

                titulo.textContent =
                    "Pagamento processado";
            }


            if (mensagem) {

                mensagem.textContent =
                    "O pagamento foi registrado e a solicitação foi enviada ao artista.";
            }


            return;
        }


        if (titulo) {

            titulo.textContent =
                "Pagamento registrado";
        }


        if (mensagem) {

            mensagem.textContent =
                "O pagamento foi registrado junto à solicitação.";
        }
    }


    /* =====================================================
       IR PARA O ACOMPANHAMENTO
       ===================================================== */

    function abrirAcompanhamento() {

        const contratacaoId =
            estado.contratacaoId ||
            obterContratacaoId();


        const destino =
            CONFIG.paginas.acompanhamento;


        if (!destino) {

            return;
        }


        if (contratacaoId) {

            window.location.href =
                destino +
                "?id=" +
                encodeURIComponent(
                    contratacaoId
                );

            return;
        }


        window.location.href =
            destino;
    }


    /* =====================================================
       VOLTAR PARA O INÍCIO
       ===================================================== */

    function voltarParaInicio() {

        window.location.href =
            CONFIG.paginas.inicio;
    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        const btnVerContratacao =
            obterElemento(
                "btnVerContratacao"
            );


        if (btnVerContratacao) {

            btnVerContratacao.addEventListener(
                "click",
                abrirAcompanhamento
            );
        }


        const btnVoltarInicio =
            obterElemento(
                "btnVoltarInicio"
            );


        if (btnVoltarInicio) {

            btnVoltarInicio.addEventListener(
                "click",
                voltarParaInicio
            );
        }


        const btnVoltarInicioTopo =
            obterElemento(
                "btnVoltarInicioTopo"
            );


        if (btnVoltarInicioTopo) {

            btnVoltarInicioTopo.addEventListener(
                "click",
                voltarParaInicio
            );
        }
    }


    /* =====================================================
       ATUALIZAR ÍCONES
       ===================================================== */

    function atualizarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();
        }
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        if (estado.inicializado) {

            return;
        }


        /*
         * Eventos são configurados antes da consulta.
         */

        configurarEventos();


        atualizarIcones();


        try {

            const dados =
                await carregarDados();


            renderizarResumo(
                dados
            );


            renderizarPagamento(
                dados
            );


            atualizarIcones();


            estado.inicializado =
                true;


            console.log(
                "MusicalWorldContratacaoSucesso: " +
                "módulo inicializado com dados reais.",
                estado
            );

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoSucesso: " +
                "não foi possível carregar os dados " +
                "da contratação.",
                erro
            );


            estado.inicializado =
                true;
        }
    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoSucesso = {

        inicializar,

        obterEstado: function () {

            return estado;
        },

        /*
         * Retorna somente os dados reais atualmente
         * carregados para a tela.
         */

        obterDados: function () {

            return estado.dados;
        },

        obterContratacaoId: function () {

            return (
                estado.contratacaoId ||
                obterContratacaoId()
            );
        }
    };


    /* =====================================================
       INICIALIZAR QUANDO O DOM ESTIVER PRONTO
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


})(window);

