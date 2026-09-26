/* =========================================================
   MUSICALWORLD — DADOS DA VISUALIZAÇÃO DE PROPOSTA

   Arquivo:
   js/proposta/proposta-visualizacao-dados.js

   Responsabilidades:
   - Configurar a página de visualização da proposta.
   - Recuperar o ID da contratação pela URL.
   - Recuperar o usuário autenticado.
   - Buscar a contratação no Supabase.
   - Garantir que o usuário atual seja um dos participantes
     da proposta.
   - Identificar se o usuário atual é o contratante ou
     o artista contratado.
   - Identificar corretamente remetente e destinatário.
   - Buscar os dados do artista.
   - Buscar os dados do estabelecimento.
   - Buscar os dados da oportunidade, quando existir.
   - Buscar o serviço associado, quando existir.
   - Normalizar os dados para os demais módulos.

   Regra atual do fluxo:

   - contratante_id = estabelecimento/contratante
   - contratado_id = artista
   - O estabelecimento envia a proposta.
   - O artista recebe a proposta.
   - O artista pode aceitar ou recusar quando
     status = solicitacao_enviada.

   Este arquivo NÃO:
   - Renderiza a interface.
   - Aceita a proposta.
   - Recusa a proposta.
   - Redireciona para o acompanhamento.

   Dependências:
   - SupabaseClient.js
   - Sessao.js
   - UsuarioAtual.js
   - ControleSessao.js
   - RoteamentoPerfil.js

   Cliente Supabase esperado:
   - window.supabaseClient
   ========================================================= */


(function (window) {

    "use strict";


    /* =====================================================
       CONTEXTO INTERNO
       ===================================================== */

    const ctx =
        window.MusicalWorldPropostaVisualizacaoInterno =
            window.MusicalWorldPropostaVisualizacaoInterno || {};



    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        parametros: {

            id:
                "id"

        },

        paginas: {

            inicio:
                "contratacoes.html",

            acompanhamento:
                "contratacao-acompanhamento.html"

        },

        tabelas: {

            contratacoes:
                "contratacoes",

            oportunidades:
                "oportunidades",

            usuarios:
                "usuarios",

            perfis:
                "perfis",

            perfisArtistas:
                "perfis_artistas",

            perfisEstabelecimentos:
                "perfis_estabelecimentos",

            servicos:
                "servicos_artistas"

        }

    };



    /* =====================================================
       ESTADO DA PÁGINA
       ===================================================== */

    const estado = {

        dados:
            null,

        usuarioId:
            null,

        propostaId:
            null,

        carregando:
            false,

        inicializado:
            false

    };


    ctx.CONFIG =
        CONFIG;


    ctx.estado =
        estado;



    /* =====================================================
       OBTER CLIENTE SUPABASE
       ===================================================== */

    function obterSupabase() {

        console.log(
            "🔌 Verificando cliente Supabase..."
        );


        if (
            window.supabaseClient
        ) {

            console.log(
                "✅ Cliente Supabase encontrado."
            );


            return window.supabaseClient;

        }


        console.error(
            "❌ MusicalWorldPropostaVisualizacao: cliente Supabase não encontrado."
        );


        return null;

    }



    /* =====================================================
       OBTER ID DA PROPOSTA
       ===================================================== */

    function obterIdDaProposta() {

        console.log(
            "🔎 Identificando ID da proposta pela URL..."
        );


        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const id =
            parametros.get(
                CONFIG.parametros.id
            );


        console.log(
            "🔎 ID encontrado na URL:",
            id
        );


        if (!id) {

            return null;

        }


        const valor =
            String(id).trim();


        return valor || null;

    }



    /* =====================================================
       OBTER USUÁRIO AUTENTICADO
       ===================================================== */

    async function carregarUsuarioAtual() {

        console.log(
            "👤 Carregando usuário atual..."
        );


        try {

            if (
                window.UsuarioAtual &&
                typeof window.UsuarioAtual.obter ===
                    "function"
            ) {

                const dados =
                    await window.UsuarioAtual.obter();


                console.log(
                    "👤 Resultado UsuarioAtual.obter():",
                    dados
                );


                if (
                    dados &&
                    dados.auth &&
                    dados.auth.id
                ) {

                    console.log(
                        "✅ ID do usuário obtido pelo auth:",
                        dados.auth.id
                    );


                    return dados.auth.id;

                }


                if (
                    dados &&
                    dados.id
                ) {

                    console.log(
                        "✅ ID do usuário obtido diretamente:",
                        dados.id
                    );


                    return dados.id;

                }


                if (
                    dados &&
                    dados.usuario &&
                    dados.usuario.id
                ) {

                    console.log(
                        "✅ ID do usuário obtido pelo objeto usuario:",
                        dados.usuario.id
                    );


                    return dados.usuario.id;

                }

            }

        } catch (erro) {

            console.warn(
                "⚠️ MusicalWorldPropostaVisualizacao: não foi possível obter o usuário pelo módulo UsuarioAtual.",
                erro
            );

        }


        console.log(
            "🔄 Utilizando fallback Supabase Auth..."
        );


        const supabase =
            obterSupabase();


        if (!supabase) {

            return null;

        }


        try {

            const resposta =
                await supabase.auth.getUser();


            console.log(
                "🔐 Resultado supabase.auth.getUser():",
                resposta
            );


            if (
                resposta &&
                resposta.data &&
                resposta.data.user
            ) {

                console.log(
                    "✅ ID do usuário obtido pelo Supabase Auth:",
                    resposta.data.user.id
                );


                return resposta.data.user.id;

            }

        } catch (erro) {

            console.error(
                "❌ MusicalWorldPropostaVisualizacao: erro ao obter usuário autenticado.",
                erro
            );

        }


        return null;

    }



    /* =====================================================
       FORMATAR MOEDA
       ===================================================== */

    function formatarMoeda(valor) {

        const numero =
            Number(valor);


        if (
            !Number.isFinite(numero)
        ) {

            return "R$ 0,00";

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );

    }



    /* =====================================================
       FORMATAR DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {

            return "A definir";

        }


        const valor =
            String(data)
                .substring(0, 10);


        const partes =
            valor.split("-");


        if (
            partes.length !== 3
        ) {

            return String(data);

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

            return String(data);

        }


        return new Date(
            ano,
            mes - 1,
            dia
        ).toLocaleDateString(
            "pt-BR",
            {
                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        );

    }



    /* =====================================================
       NORMALIZAR HORÁRIO
       ===================================================== */

    function normalizarHorario(valor) {

        if (!valor) {

            return "";

        }


        const texto =
            String(valor)
                .trim();


        const correspondencia =
            texto.match(
                /^(\d{2}:\d{2})(?::\d{2})?$/
            );


        if (correspondencia) {

            return correspondencia[1];

        }


        return texto;

    }



    /* =====================================================
       FORMATAR HORÁRIO DA PROPOSTA
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

            return "A definir";

        }


        if (
            inicio &&
            fim
        ) {

            return `${inicio} às ${fim}`;

        }


        if (inicio) {

            return `${inicio} — término a definir`;

        }


        return `Início a definir — ${fim}`;

    }



    /* =====================================================
       NORMALIZAR LOCAL
       ===================================================== */

    function normalizarLocal(local) {

        if (!local) {

            return null;

        }


        if (
            typeof local === "string"
        ) {

            try {

                return JSON.parse(local);

            } catch (erro) {

                return {

                    endereco:
                        local

                };

            }

        }


        if (
            typeof local === "object"
        ) {

            return {
                ...local
            };

        }


        return null;

    }



    /* =====================================================
       FORMATAR ENDEREÇO DO LOCAL
       ===================================================== */

    function formatarEnderecoLocal(local) {

        const dados =
            normalizarLocal(local);


        if (!dados) {

            return "A definir";

        }


        if (
            dados.enderecoCompleto
        ) {

            return String(
                dados.enderecoCompleto
            );

        }


        const endereco =
            dados.endereco ||
            dados.rua ||
            "";


        const numero =
            dados.numero || "";


        const complemento =
            dados.complemento || "";


        const bairro =
            dados.bairro || "";


        const cidade =
            dados.cidade || "";


        const estadoLocal =
            dados.estado || "";


        const cep =
            dados.cep || "";


        const partes = [];


        if (endereco) {

            partes.push(
                endereco
            );

        }


        if (numero) {

            partes.push(
                numero
            );

        }


        if (complemento) {

            partes.push(
                complemento
            );

        }


        if (bairro) {

            partes.push(
                bairro
            );

        }


        if (cidade) {

            partes.push(
                cidade
            );

        }


        if (estadoLocal) {

            partes.push(
                estadoLocal
            );

        }


        if (cep) {

            partes.push(
                cep
            );

        }


        if (partes.length) {

            return partes.join(
                ", "
            );

        }


        if (
            dados.nomeLocal
        ) {

            return String(
                dados.nomeLocal
            );

        }


        if (
            dados.nome
        ) {

            return String(
                dados.nome
            );

        }


        return "A definir";

    }



    /* =====================================================
       OBTER NOME DO LOCAL
       ===================================================== */

    function obterNomeLocal(local) {

        const dados =
            normalizarLocal(local);


        if (!dados) {

            return "Local do evento";

        }


        return (
            dados.nomeLocal ||
            dados.nome ||
            "Local do evento"
        );

    }



    /* =====================================================
       OBTER LOCALIZAÇÃO DO ARTISTA
       ===================================================== */

    function formatarLocalizacaoArtista(
        localizacao
    ) {

        if (!localizacao) {

            return "";

        }


        if (
            typeof localizacao === "string"
        ) {

            return localizacao.trim();

        }


        if (
            typeof localizacao !== "object"
        ) {

            return String(
                localizacao
            );

        }


        const partes = [

            localizacao.cidade,

            localizacao.estado

        ].filter(Boolean);


        if (partes.length) {

            return partes.join(
                " - "
            );

        }


        return (

            localizacao.endereco ||
            localizacao.nome ||
            ""

        );

    }



    /* =====================================================
       OBTER INICIAIS
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
       BUSCAR DADOS DO ARTISTA
       ===================================================== */

    async function carregarArtista(
        supabase,
        usuarioId
    ) {

        console.log(
            "🎤 Carregando dados do artista:",
            usuarioId
        );


        if (!usuarioId) {

            return null;

        }


        const respostaUsuario =
            await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select(
                    "id,nome,email,foto_url"
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (
            respostaUsuario.error
        ) {

            console.error(
                "❌ Erro ao carregar usuário do artista:",
                respostaUsuario.error
            );


            throw respostaUsuario.error;

        }


        const usuario =
            respostaUsuario.data;


        console.log(
            "✅ Usuário do artista:",
            usuario
        );


        const respostaPerfil =
            await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(
                    `
                    id,
                    usuario_id,
                    tipo_perfil_id,
                    nome_exibicao,
                    descricao,
                    ativo,
                    perfil_publicado,
                    tipos_perfil (
                        id,
                        nome,
                        descricao
                    )
                    `
                )
                .eq(
                    "usuario_id",
                    usuarioId
                )
                .maybeSingle();


        if (
            respostaPerfil.error
        ) {

            console.error(
                "❌ Erro ao carregar perfil do artista:",
                respostaPerfil.error
            );


            throw respostaPerfil.error;

        }


        const perfil =
            respostaPerfil.data;


        console.log(
            "✅ Perfil do artista:",
            perfil
        );


        let perfilArtista =
            null;


        if (
            perfil &&
            perfil.id
        ) {

            const respostaArtista =
                await supabase
                    .from(
                        CONFIG.tabelas.perfisArtistas
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "perfil_id",
                        perfil.id
                    )
                    .maybeSingle();


            if (
                respostaArtista.error
            ) {

                console.error(
                    "❌ Erro ao carregar perfil específico do artista:",
                    respostaArtista.error
                );


                throw respostaArtista.error;

            }


            perfilArtista =
                respostaArtista.data;


            console.log(
                "✅ Dados específicos do artista:",
                perfilArtista
            );

        }


        const nome =

            perfil?.nome_exibicao ||

            usuario?.nome ||

            "Artista";


        const tipo =

            perfilArtista?.tipo_artista ||

            perfil?.tipos_perfil?.nome ||

            "Artista";


        const fotoUrl =

            perfilArtista?.foto_url ||

            usuario?.foto_url ||

            null;


        const localizacao =

            perfilArtista?.localizacao ||

            null;


        const resultado = {

            id:
                usuarioId,

            nome:
                nome,

            tipo:
                tipo,

            email:
                usuario?.email ||
                null,

            fotoUrl:
                fotoUrl,

            iniciais:
                obterIniciais(
                    nome
                ),

            localizacao:
                formatarLocalizacaoArtista(
                    localizacao
                ),

            descricao:
                perfil?.descricao ||
                null,

            perfilId:
                perfil?.id ||
                null

        };


        console.log(
            "✅ Artista final:",
            resultado
        );


        return resultado;

    }



    /* =====================================================
       BUSCAR DADOS DO ESTABELECIMENTO
       ===================================================== */

    async function carregarEstabelecimento(
        supabase,
        usuarioId
    ) {

        console.log(
            "🏢 Carregando dados do estabelecimento:",
            usuarioId
        );


        if (!usuarioId) {

            return null;

        }


        const respostaUsuario =
            await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select(
                    "id,nome,email,foto_url"
                )
                .eq(
                    "id",
                    usuarioId
                )
                .maybeSingle();


        if (
            respostaUsuario.error
        ) {

            console.error(
                "❌ Erro ao carregar usuário do estabelecimento:",
                respostaUsuario.error
            );


            throw respostaUsuario.error;

        }


        const usuario =
            respostaUsuario.data;


        console.log(
            "✅ Usuário do estabelecimento:",
            usuario
        );


        const respostaPerfil =
            await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(
                    `
                    id,
                    usuario_id,
                    tipo_perfil_id,
                    nome_exibicao,
                    descricao,
                    ativo,
                    perfil_publicado,
                    tipos_perfil (
                        id,
                        nome,
                        descricao
                    )
                    `
                )
                .eq(
                    "usuario_id",
                    usuarioId
                )
                .maybeSingle();


        if (
            respostaPerfil.error
        ) {

            console.error(
                "❌ Erro ao carregar perfil do estabelecimento:",
                respostaPerfil.error
            );


            throw respostaPerfil.error;

        }


        const perfil =
            respostaPerfil.data;


        console.log(
            "✅ Perfil do estabelecimento:",
            perfil
        );


        let perfilEstabelecimento =
            null;


        if (
            perfil &&
            perfil.id
        ) {

            const respostaEstabelecimento =
                await supabase
                    .from(
                        CONFIG.tabelas.perfisEstabelecimentos
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "perfil_id",
                        perfil.id
                    )
                    .maybeSingle();


            if (
                respostaEstabelecimento.error
            ) {

                console.error(
                    "❌ Erro ao carregar dados do estabelecimento:",
                    respostaEstabelecimento.error
                );


                throw respostaEstabelecimento.error;

            }


            perfilEstabelecimento =
                respostaEstabelecimento.data;


            console.log(
                "✅ Dados específicos do estabelecimento:",
                perfilEstabelecimento
            );

        }


        const nome =

            perfil?.nome_exibicao ||

            usuario?.nome ||

            "Estabelecimento";


        const tipo =

            perfil?.tipos_perfil?.nome ||

            "Estabelecimento";


        const localizacao = {

            endereco:
                perfilEstabelecimento?.endereco ||
                "",

            numero:
                perfilEstabelecimento?.numero ||
                "",

            bairro:
                perfilEstabelecimento?.bairro ||
                "",

            cidade:
                perfilEstabelecimento?.cidade ||
                "",

            estado:
                perfilEstabelecimento?.estado ||
                "",

            cep:
                perfilEstabelecimento?.cep ||
                ""

        };


        const resultado = {

            id:
                usuarioId,

            nome:
                nome,

            tipo:
                tipo,

            email:
                usuario?.email ||
                null,

            fotoUrl:
                usuario?.foto_url ||
                null,

            iniciais:
                obterIniciais(
                    nome
                ),

            localizacao:
                formatarEnderecoLocal(
                    localizacao
                ),

            descricao:
                perfil?.descricao ||
                null,

            perfilId:
                perfil?.id ||
                null,

            estabelecimento:
                perfilEstabelecimento

        };


        console.log(
            "✅ Estabelecimento final:",
            resultado
        );


        return resultado;

    }



    /* =====================================================
       BUSCAR DADOS DA OPORTUNIDADE
       ===================================================== */

    async function carregarOportunidade(
        supabase,
        oportunidadeId
    ) {

        console.log(
            "📌 Carregando oportunidade:",
            oportunidadeId
        );


        if (!oportunidadeId) {

            console.log(
                "ℹ️ Esta contratação não possui oportunidade vinculada."
            );


            return null;

        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.oportunidades
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    oportunidadeId
                )
                .maybeSingle();


        if (
            resposta.error
        ) {

            console.error(
                "❌ Erro ao carregar oportunidade:",
                resposta.error
            );


            throw resposta.error;

        }


        const oportunidade =
            resposta.data;


        console.log(
            "✅ Oportunidade encontrada:",
            oportunidade
        );


        if (!oportunidade) {

            return null;

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
                null,

            tipoArtista:
                oportunidade.tipo_artista ||
                null,

            dataEvento:
                oportunidade.data_evento ||
                null,

            dataEventoFormatada:
                formatarData(
                    oportunidade.data_evento
                ),

            horaInicio:
                oportunidade.hora_inicio ||
                null,

            horaFim:
                oportunidade.hora_fim ||
                null,

            estilos:
                oportunidade.estilos ||
                null,

            instrumentos:
                oportunidade.instrumentos ||
                null,

            valor:
                oportunidade.valor ??
                null,

            local:
                normalizarLocal(
                    oportunidade.local
                ),

            prazoInteresse:
                oportunidade.prazo_interesse ||
                null,

            status:
                oportunidade.status ||
                null,

            createdAt:
                oportunidade.created_at ||
                null,

            updatedAt:
                oportunidade.updated_at ||
                null

        };

    }



    /* =====================================================
       BUSCAR PESSOA
       ===================================================== */

    async function carregarPessoa(
        supabase,
        usuarioId,
        tipoPessoa
    ) {

        if (
            tipoPessoa ===
            "estabelecimento"
        ) {

            return carregarEstabelecimento(
                supabase,
                usuarioId
            );

        }


        return carregarArtista(
            supabase,
            usuarioId
        );

    }



    /* =====================================================
       BUSCAR SERVIÇO
       ===================================================== */

    async function carregarServico(
        supabase,
        servicoId
    ) {

        console.log(
            "🎵 Carregando serviço:",
            servicoId
        );


        if (!servicoId) {

            console.log(
                "ℹ️ Nenhum serviço associado à proposta."
            );


            return null;

        }


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.servicos
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    servicoId
                )
                .maybeSingle();


        if (
            resposta.error
        ) {

            console.error(
                "❌ Erro ao carregar serviço:",
                resposta.error
            );


            throw resposta.error;

        }


        const servico =
            resposta.data;


        console.log(
            "✅ Serviço encontrado:",
            servico
        );


        if (!servico) {

            return null;

        }


        return {

            id:
                servico.id,

            nome:
                servico.nome_servico ||

                servico.nome ||

                servico.titulo ||

                "Serviço",

            descricao:
                servico.descricao ||

                null,

            valor:
                servico.valor ??
                null,

            duracao:
                servico.duracao ||

                null,

            tipoPreco:
                servico.tipo_preco ||

                null,

            ativo:
                servico.ativo

        };

    }



    /* =====================================================
       BUSCAR PROPOSTA
       ===================================================== */

    async function carregarProposta() {

        console.log(
            "📄 Iniciando carregamento da proposta..."
        );


        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );

        }


        const propostaId =
            obterIdDaProposta();


        if (!propostaId) {

            throw new Error(
                "ID da proposta não informado."
            );

        }


        estado.propostaId =
            propostaId;


        console.log(
            "📄 ID da proposta:",
            propostaId
        );


        console.log(
            "🔎 Buscando contratação no Supabase..."
        );


        const resposta =
            await supabase
                .from(
                    CONFIG.tabelas.contratacoes
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    propostaId
                )
                .maybeSingle();


        if (
            resposta.error
        ) {

            console.error(
                "❌ Erro ao buscar proposta:",
                resposta.error
            );


            throw resposta.error;

        }


        const registro =
            resposta.data;


        console.log(
            "📄 Registro da proposta:",
            registro
        );


        if (!registro) {

            throw new Error(
                "Proposta não encontrada."
            );

        }


        /* =================================================
           IDENTIFICAR PARTICIPAÇÃO DO USUÁRIO

           Na estrutura atual:

           contratante_id = estabelecimento/contratante
           contratado_id = artista

           Portanto:

           - O contratante é quem envia a proposta.
           - O contratado é o artista que recebe.
           - O artista é o destinatário.
           - O artista pode aceitar ou recusar.
           ================================================= */

        const usuarioEhContratante =

            String(
                registro.contratante_id
            ) ===
            String(
                estado.usuarioId
            );


        const usuarioEhContratado =

            String(
                registro.contratado_id
            ) ===
            String(
                estado.usuarioId
            );


        console.log(
            "👤 Participação do usuário atual:",
            {
                usuarioAtual:
                    estado.usuarioId,

                contratante:
                    registro.contratante_id,

                contratado:
                    registro.contratado_id,

                usuarioEhContratante:
                    usuarioEhContratante,

                usuarioEhContratado:
                    usuarioEhContratado
            }
        );


        if (
            !usuarioEhContratante &&
            !usuarioEhContratado
        ) {

            console.error(
                "❌ Usuário atual não participa desta proposta.",
                {
                    usuarioAtual:
                        estado.usuarioId,

                    contratante:
                        registro.contratante_id,

                    contratado:
                        registro.contratado_id
                }
            );


            throw new Error(
                "Esta proposta não pertence ao usuário atual."
            );

        }


        console.log(
            "✅ Usuário atual participa da proposta."
        );


        /*
         * O contratante é o estabelecimento que enviou
         * a proposta.
         *
         * O contratado é o artista que recebeu
         * a proposta.
         */

        const papelUsuario =

            usuarioEhContratante

                ? "remetente"

                : "destinatario";


        /*
         * Somente o artista contratado pode decidir
         * sobre a proposta.
         */

        const podeDecidir =

            usuarioEhContratado;


        console.log(
            "🎯 Papel do usuário na proposta:",
            papelUsuario
        );


        console.log(
            "🔐 Usuário atual pode aceitar/recusar:",
            podeDecidir
        );


        const status =
            String(
                registro.status || ""
            )
            .trim()
            .toLowerCase();


        console.log(
            "📌 Status da proposta:",
            status
        );


        if (
            status !==
            "solicitacao_enviada"
        ) {

            console.warn(
                "⚠️ Proposta não está no status solicitacao_enviada:",
                status
            );

        }


        console.log(
            "🔄 Carregando artista, estabelecimento, oportunidade e serviço..."
        );


        /*
         * Fluxo de oportunidade:
         *
         * contratante_id -> estabelecimento
         * contratado_id  -> artista
         *
         * A oportunidade fica vinculada diretamente
         * através de contratacoes.oportunidade_id.
         */

        const [

            estabelecimento,

            artista,

            oportunidade,

            servico

        ] = await Promise.all([

            carregarEstabelecimento(
                supabase,
                registro.contratante_id
            ),

            carregarArtista(
                supabase,
                registro.contratado_id
            ),

            carregarOportunidade(
                supabase,
                registro.oportunidade_id
            ),

            carregarServico(
                supabase,
                registro.servico_id
            )

        ]);


        console.log(
            "✅ Participantes, oportunidade e serviço carregados."
        );


        const local =
            normalizarLocal(
                registro.local
            );


        console.log(
            "📍 Local normalizado:",
            local
        );


        const valor =

            registro.valor ??

            servico?.valor ??

            oportunidade?.valor ??

            null;


        console.log(
            "💰 Valor final da proposta:",
            valor
        );


        const dados = {

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

            /*
             * Identificação de quem está visualizando
             * a proposta neste momento.
             */

            usuarioAtualId:
                estado.usuarioId,

            usuarioEhContratante:
                usuarioEhContratante,

            usuarioEhContratado:
                usuarioEhContratado,

            papelUsuario:
                papelUsuario,

            podeDecidir:
                podeDecidir,

            /*
             * Na estrutura atual:
             *
             * estabelecimento = remetente
             * artista = destinatário
             */

            artista:
                artista,

            estabelecimento:
                estabelecimento,

            oportunidade:
                oportunidade,

            servico:
                servico
                    ? {

                        ...servico,

                        valor:
                            valor

                    }
                    : null,

            dataEvento:
                registro.data_evento,

            dataEventoFormatada:
                formatarData(
                    registro.data_evento
                ),

            horarioInicio:
                registro.horario_inicio ||
                null,

            horarioFim:
                registro.horario_fim ||
                null,

            horario:
                formatarHorario(

                    registro.horario_inicio,

                    registro.horario_fim

                ),

            local:
                local,

            localNome:
                obterNomeLocal(
                    local
                ),

            localEndereco:
                formatarEnderecoLocal(
                    local
                ),

            tipoEvento:
                registro.tipo_evento ||
                null,

            valor:
                valor,

            valorFormatado:
                valor !== null &&
                valor !== undefined

                    ? formatarMoeda(
                        valor
                    )

                    : "A definir",

            observacoes:
                registro.observacoes ||
                null,

            status:
                registro.status ||
                null,

            statusNormalizado:
                String(
                    registro.status ||
                    ""
                )
                .trim()
                .toLowerCase(),

            statusPagamento:
                registro.status_pagamento ||
                null,

            statusFinanceiro:
                registro.status_financeiro ||
                null,

            createdAt:
                registro.created_at ||
                null,

            updatedAt:
                registro.updated_at ||
                null

        };


        estado.dados =
            dados;


        console.log(
            "✅ Dados finais da proposta montados:",
            dados
        );


        return dados;

    }



    /* =====================================================
       INICIALIZAR DADOS
       ===================================================== */

    async function inicializar() {

        console.log(
            "🚀 Inicializando módulo de dados da proposta..."
        );


        if (
            estado.inicializado
        ) {

            console.log(
                "ℹ️ Módulo já inicializado. Retornando dados existentes."
            );


            return estado.dados;

        }


        if (
            estado.carregando
        ) {

            console.warn(
                "⚠️ Módulo já está carregando."
            );


            return null;

        }


        estado.carregando =
            true;


        try {

            console.log(
                "👤 Obtendo usuário autenticado..."
            );


            const usuarioId =
                await carregarUsuarioAtual();


            console.log(
                "👤 Usuário retornado:",
                usuarioId
            );


            if (!usuarioId) {

                throw new Error(
                    "Usuário não autenticado."
                );

            }


            estado.usuarioId =
                usuarioId;


            console.log(
                "📄 Carregando proposta..."
            );


            const dados =
                await carregarProposta();


            console.log(
                "📦 Resultado de carregarProposta():",
                dados
            );


            if (!dados) {

                throw new Error(
                    "Não foi possível carregar a proposta."
                );

            }


            estado.inicializado =
                true;


            console.log(
                "🎉 Módulo de dados inicializado com sucesso."
            );


            return dados;

        } catch (erro) {

            console.error(
                "❌ Erro no módulo de dados da proposta:",
                erro
            );


            throw erro;

        } finally {

            estado.carregando =
                false;

        }

    }



    /* =====================================================
       EXPORTAR FUNÇÕES
       ===================================================== */

    Object.assign(

        ctx,

        {

            obterSupabase,

            obterIdDaProposta,

            carregarUsuarioAtual,

            carregarPessoa,

            carregarArtista,

            carregarEstabelecimento,

            carregarOportunidade,

            carregarServico,

            carregarProposta,

            inicializar,

            formatarMoeda,

            formatarData,

            normalizarHorario,

            formatarHorario,

            normalizarLocal,

            formatarEnderecoLocal,

            obterNomeLocal,

            formatarLocalizacaoArtista,

            obterIniciais

        }

    );


})(window);