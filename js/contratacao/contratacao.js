/*
============================================================

MUSICALWORLD — CONTRATAÇÃO

Arquivo:
js/contratacao/contratacao.js

Responsabilidade:

- Controlar a Etapa 1 da contratação.
- Inicializar ou recuperar o estado central.
- Ler o perfil inicial recebido pela URL somente
  quando uma NOVA contratação for iniciada.
- Carregar os dados reais do artista.
- Carregar os serviços disponíveis no Supabase.
- Exibir os serviços disponíveis.
- Permitir a seleção de um único serviço.
- Restaurar automaticamente o serviço salvo no
  ContratacaoEstado.js.
- Controlar visualmente o serviço selecionado.
- Habilitar/desabilitar o botão Continuar.
- Salvar alterações no estado central.
- Persistir os dados do artista no estado central.
- Encaminhar o usuário para a Etapa 2.

============================================================

ARQUITETURA DO FLUXO

A partir desta versão, as páginas NÃO devem transportar
os dados acumulados da contratação através da URL.

O arquivo:

    ContratacaoEstado.js

é a fonte central da contratação.

Fluxo:

    Etapa 1
       ↓
    Etapa 2
       ↓
    Etapa 3
       ↓
    Etapa 4
       ↓
    Resumo
       ↓
    Pagamento

O usuário pode voltar:

    Etapa 3
       ↓
    Etapa 2
       ↓
    Etapa 1
       ↓
    Etapa 2

sem perder os dados.

============================================================

REGRA IMPORTANTE

A URL somente inicia uma NOVA contratação.

Exemplo:

    contratacao.html?perfil_id=123&tipo=Cantor&novo=1

Depois que ContratacaoEstado.iniciarNovo() é executado,
as próximas páginas devem utilizar exclusivamente:

    ContratacaoEstado.obter()
    ContratacaoEstado.salvar()
    ContratacaoEstado.obterCampo()
    ContratacaoEstado.definir()

============================================================

CORREÇÃO IMPORTANTE DESTA VERSÃO

A Etapa 1 já carregava os dados reais do artista através
das tabelas:

    perfis
    usuarios
    perfis_artistas

Porém esses dados ficavam somente no estado LOCAL desta
página.

Consequentemente, quando o usuário avançava para a Etapa 5,
o resumo não encontrava:

    estado.artista.nome
    estado.artista.tipoArtista
    estado.artista.localizacao
    estado.artista.fotoUrl

e acabava exibindo "não informado".

Agora, depois de montar os dados reais do artista, eles
também são persistidos no:

    ContratacaoEstado.js

Assim todas as etapas posteriores podem utilizar os mesmos
dados sem realizar novas consultas desnecessárias.

============================================================
*/

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        totalEtapas: 6,

        etapaInicial: 1,

        paginas: {

            proximaEtapa:
                "contratacao-data-horario.html"

        },

        tabelas: {

            usuarios:
                "usuarios",

            perfis:
                "perfis",

            tiposPerfil:
                "tipos_perfil",

            perfisArtistas:
                "perfis_artistas",

            servicos:
                "servicos_artistas"

        },

        seletores: {

            etapaLabel:
                "etapaLabel",

            etapaNumero:
                "etapaNumero",

            etapaProgresso:
                "etapaProgresso",

            tituloEtapa:
                "tituloEtapa",

            descricaoEtapa:
                "descricaoEtapa",

            artistaAvatar:
                "artistaAvatar",

            artistaNome:
                "artistaNome",

            artistaTipo:
                "artistaTipo",

            servicosSelecao:
                "servicosSelecao",

            servicosLista:
                "servicosLista",

            servicosLoading:
                "servicosLoading",

            btnAvancar:
                "btnAvancar",

            btnCancelar:
                "btnCancelarContratacao"

        }

    };


    /* =====================================================
       ESTADO LOCAL DA ETAPA
       ===================================================== */

    /*
     * ATENÇÃO:
     *
     * Este objeto NÃO representa toda a contratação.
     *
     * Ele contém somente os dados necessários para a
     * Etapa 1 funcionar.
     *
     * O estado verdadeiro da contratação fica em:
     *
     *     ContratacaoEstado.js
     */

    const estado = {

        carregando:
            false,

        carregado:
            false,

        erro:
            null,

        perfilId:
            null,

        tipo:
            null,

        etapaAtual:
            CONFIG.etapaInicial,

        artista:
            null,

        perfil:
            null,

        usuario:
            null,

        perfilArtista:
            null,

        servicos:
            [],

        servico:
            null

    };


    /* =====================================================
       OBTENÇÃO DO GERENCIADOR CENTRAL
       ===================================================== */

    function obterGerenciadorEstado() {

        if (
            window.MusicalWorldContratacaoEstado
        ) {

            return window.MusicalWorldContratacaoEstado;

        }


        if (
            window.ContratacaoEstado
        ) {

            return window.ContratacaoEstado;

        }


        console.error(
            "MusicalWorldContratacao: ContratacaoEstado.js não foi carregado."
        );


        return null;

    }


    /* =====================================================
       OBTENÇÃO DE ELEMENTOS
       ===================================================== */

    function obterElemento(id) {

        if (!id) {

            return null;

        }


        return document.getElementById(id);

    }


    /* =====================================================
       FORMATAÇÃO
       ===================================================== */

    function formatarMoeda(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "—";

        }


        const numero =
            Number(valor);


        if (Number.isNaN(numero)) {

            return "—";

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function normalizarTexto(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(valor).trim();

    }


    /* =====================================================
       URL — SOMENTE PARA ENTRADA INICIAL
       ===================================================== */

    function obterParametrosUrl() {

        return new URLSearchParams(
            window.location.search
        );

    }


    function obterPerfilIdDaUrl() {

        const parametros =
            obterParametrosUrl();


        return normalizarTexto(

            parametros.get("perfil_id") ||

            parametros.get("perfilId") ||

            parametros.get("id") ||

            ""

        );

    }


    function obterTipoDaUrl() {

        const parametros =
            obterParametrosUrl();


        return normalizarTexto(
            parametros.get("tipo") || ""
        );

    }


    function ehNovaContratacao() {

        const parametros =
            obterParametrosUrl();


        const novo =
            normalizarTexto(
                parametros.get("novo") || ""
            )
                .toLowerCase();


        return (

            novo === "1" ||

            novo === "true" ||

            novo === "sim"

        );

    }


    /* =====================================================
       INICIALIZAR ESTADO CENTRAL
       ===================================================== */

    /*
     * Existem dois cenários:
     *
     * -----------------------------------------------------
     * CENÁRIO 1 — NOVA CONTRATAÇÃO
     * -----------------------------------------------------
     *
     * O usuário veio do perfil e clicou em "Contratar".
     *
     * Exemplo:
     *
     * contratacao.html?perfil_id=123&tipo=Cantor&novo=1
     *
     * Nesse caso criamos um estado completamente novo.
     *
     *
     * -----------------------------------------------------
     * CENÁRIO 2 — RETORNO
     * -----------------------------------------------------
     *
     * O usuário voltou de outra etapa.
     *
     * Nesse caso NÃO podemos chamar iniciarNovo().
     *
     * Devemos preservar:
     *
     * - perfil
     * - artista
     * - serviço
     * - data
     * - horário
     * - local
     * - evento
     * - demais informações
     *
     * e alterar somente a etapa atual.
     */

    function inicializarEstadoCentral() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            throw new Error(
                "Gerenciador central da contratação não encontrado."
            );

        }


        /*
         * Garante que o módulo central esteja inicializado.
         */

        gerenciador.inicializar();


        const novaContratacao =
            ehNovaContratacao();


        /* =================================================
           NOVA CONTRATAÇÃO
           ================================================= */

        if (novaContratacao) {

            const perfilId =
                obterPerfilIdDaUrl();


            const tipo =
                obterTipoDaUrl();


            if (!perfilId) {

                throw new Error(
                    "O perfil da contratação não foi informado."
                );

            }


            /*
             * IMPORTANTE:
             *
             * iniciarNovo() só é chamado aqui.
             *
             * Nunca será chamado simplesmente porque
             * o usuário voltou para esta página.
             */

            gerenciador.iniciarNovo({

                perfilId:
                    perfilId,

                tipo:
                    tipo || null,

                etapaAtual:
                    CONFIG.etapaInicial,

                totalEtapas:
                    CONFIG.totalEtapas

            });


            console.log(
                "MusicalWorldContratacao: nova contratação iniciada.",
                {
                    perfilId,
                    tipo
                }
            );

        }


        /* =================================================
           RECUPERAR ESTADO EXISTENTE
           ================================================= */

        let dados =
            gerenciador.obter();


        /*
         * Compatibilidade:
         *
         * Se alguém acessar esta página diretamente com
         * perfil_id, mas sem novo=1 e não houver estado,
         * aproveitamos o perfil para não quebrar a entrada.
         *
         * Isso NÃO substitui o fluxo normal.
         */

        if (
            !novaContratacao &&
            !dados.perfilId
        ) {

            const perfilIdUrl =
                obterPerfilIdDaUrl();


            const tipoUrl =
                obterTipoDaUrl();


            if (perfilIdUrl) {

                gerenciador.salvar({

                    perfilId:
                        perfilIdUrl,

                    tipo:
                        tipoUrl || null

                });


                dados =
                    gerenciador.obter();

            }

        }


        /* =================================================
           VALIDAR PERFIL
           ================================================= */

        estado.perfilId =
            dados.perfilId;


        estado.tipo =
            dados.tipo;


        if (!estado.perfilId) {

            throw new Error(
                "Nenhum perfil de contratação foi encontrado."
            );

        }


        /* =================================================
           IMPORTANTE:
           ESTA PÁGINA É A ETAPA 1
           ================================================= */

        /*
         * Antes havia um problema aqui:
         *
         * a página recuperava a etapa anterior do estado.
         *
         * Exemplo:
         *
         * Etapa 2 → voltar → Etapa 1
         *
         * O estado continuava:
         *
         * etapaAtual = 2
         *
         * Agora a página registra explicitamente que
         * estamos novamente na Etapa 1.
         *
         * Isso NÃO apaga nenhum outro dado.
         */

        estado.etapaAtual =
            CONFIG.etapaInicial;


        gerenciador.salvar({

            etapaAtual:
                CONFIG.etapaInicial,

            totalEtapas:
                CONFIG.totalEtapas

        });


        /*
         * Recuperamos novamente o estado depois do save
         * para garantir que estado.servico etc. estejam
         * disponíveis.
         */

        dados =
            gerenciador.obter();


        console.log(
            "MusicalWorldContratacao: estado central recuperado para a Etapa 1:",
            dados
        );


        return dados;

    }


    /* =====================================================
       SUPABASE
       ===================================================== */

    function obterSupabase() {

        if (window.supabaseClient) {

            return window.supabaseClient;

        }


        if (
            window.MusicalWorldSupabase &&
            window.MusicalWorldSupabase.client
        ) {

            return window.MusicalWorldSupabase.client;

        }


        if (
            window.MusicalWorld &&
            window.MusicalWorld.supabase
        ) {

            return window.MusicalWorld.supabase;

        }


        return null;

    }


    /* =====================================================
       CARREGAR PERFIL
       ===================================================== */

    async function carregarPerfil() {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );

        }


        if (!estado.perfilId) {

            throw new Error(
                "perfil_id não encontrado."
            );

        }


        console.log(
            "MusicalWorldContratacao: carregando perfil:",
            estado.perfilId
        );


        const resultado =
            await supabase
                .from(
                    CONFIG.tabelas.perfis
                )
                .select(`
                    *,
                    tipo_perfil:tipos_perfil(
                        id,
                        nome
                    )
                `)
                .eq(
                    "id",
                    estado.perfilId
                )
                .single();


        if (resultado.error) {

            console.error(
                "MusicalWorldContratacao: erro ao carregar perfil:",
                resultado.error
            );


            throw resultado.error;

        }


        estado.perfil =
            resultado.data;


        return estado.perfil;

    }


    /* =====================================================
       CARREGAR USUÁRIO
       ===================================================== */

    async function carregarUsuario() {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );

        }


        if (!estado.perfil) {

            return null;

        }


        const usuarioId =
            estado.perfil.usuario_id;


        if (!usuarioId) {

            console.warn(
                "MusicalWorldContratacao: perfil não possui usuario_id."
            );


            return null;

        }


        const resultado =
            await supabase
                .from(
                    CONFIG.tabelas.usuarios
                )
                .select("*")
                .eq(
                    "id",
                    usuarioId
                )
                .single();


        if (resultado.error) {

            console.error(
                "MusicalWorldContratacao: erro ao carregar usuário:",
                resultado.error
            );


            throw resultado.error;

        }


        estado.usuario =
            resultado.data;


        return estado.usuario;

    }


    /* =====================================================
       CARREGAR PERFIL ARTISTA
       ===================================================== */

    async function carregarPerfilArtista() {

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
                    CONFIG.tabelas.perfisArtistas
                )
                .select("*")
                .eq(
                    "perfil_id",
                    estado.perfilId
                )
                .maybeSingle();


        if (resultado.error) {

            console.error(
                "MusicalWorldContratacao: erro ao carregar perfil artístico:",
                resultado.error
            );


            throw resultado.error;

        }


        estado.perfilArtista =
            resultado.data || null;


        return estado.perfilArtista;

    }


    /* =====================================================
       CARREGAR SERVIÇOS
       ===================================================== */

    async function carregarServicos() {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );

        }


        if (!estado.perfilId) {

            throw new Error(
                "Não é possível carregar serviços sem perfil_id."
            );

        }


        console.log(
            "MusicalWorldContratacao: carregando serviços do perfil:",
            estado.perfilId
        );


        let resultado =
            await supabase
                .from(
                    CONFIG.tabelas.servicos
                )
                .select("*")
                .eq(
                    "perfil_id",
                    estado.perfilId
                )
                .eq(
                    "ativo",
                    true
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        /*
         * Compatibilidade caso created_at não exista.
         */

        if (
            resultado.error &&
            String(
                resultado.error.message || ""
            )
                .toLowerCase()
                .includes(
                    "created_at"
                )
        ) {

            console.warn(
                "MusicalWorldContratacao: created_at não disponível. Tentando novamente sem ordenação."
            );


            resultado =
                await supabase
                    .from(
                        CONFIG.tabelas.servicos
                    )
                    .select("*")
                    .eq(
                        "perfil_id",
                        estado.perfilId
                    )
                    .eq(
                        "ativo",
                        true
                    );

        }


        /*
         * Compatibilidade caso ativo não exista.
         */

        if (
            resultado.error &&
            String(
                resultado.error.message || ""
            )
                .toLowerCase()
                .includes(
                    "ativo"
                )
        ) {

            console.warn(
                "MusicalWorldContratacao: campo ativo não disponível. Carregando serviços sem esse filtro."
            );


            resultado =
                await supabase
                    .from(
                        CONFIG.tabelas.servicos
                    )
                    .select("*")
                    .eq(
                        "perfil_id",
                        estado.perfilId
                    );

        }


        if (resultado.error) {

            console.error(
                "MusicalWorldContratacao: erro ao carregar serviços:",
                resultado.error
            );


            throw resultado.error;

        }


        const registros =
            Array.isArray(resultado.data)
                ? resultado.data
                : [];


        estado.servicos =
            registros.filter(
                function (servico) {

                    if (
                        servico.ativo === undefined ||
                        servico.ativo === null
                    ) {

                        return true;

                    }


                    return servico.ativo === true;

                }
            );


        console.log(
            "MusicalWorldContratacao: serviços encontrados:",
            estado.servicos
        );


        return estado.servicos;

    }


    /* =====================================================
       MONTAR DADOS DO ARTISTA
       ===================================================== */

    function montarDadosArtista() {

        const perfil =
            estado.perfil || {};


        const usuario =
            estado.usuario || {};


        const perfilArtista =
            estado.perfilArtista || {};


        /*
         * Nome do artista.
         *
         * A ordem de prioridade permite utilizar primeiro
         * o nome artístico, quando existir, e depois os
         * campos de identificação disponíveis.
         */

        const nome =
            normalizarTexto(

                perfilArtista.nome_artistico ||

                perfilArtista.nome_artistico_publico ||

                perfil.nome_artistico ||

                perfil.nome ||

                usuario.nome ||

                usuario.nome_completo ||

                "Artista"

            );


        /* =================================================
           TIPO DO ARTISTA
           ================================================= */

        let tipoPerfil =
            "";


        if (
            perfil.tipo_perfil &&
            typeof perfil.tipo_perfil === "object"
        ) {

            tipoPerfil =
                perfil.tipo_perfil.nome || "";

        } else {

            tipoPerfil =
                perfil.tipo_perfil || "";

        }


        const tipo =
            normalizarTexto(

                perfilArtista.tipo_artista ||

                tipoPerfil ||

                estado.tipo ||

                "Artista"

            );


        /* =================================================
           LOCALIZAÇÃO
           ================================================= */

        const localizacao =
            normalizarTexto(

                perfilArtista.localizacao ||

                perfilArtista.cidade ||

                perfil.localizacao ||

                ""

            );


        /* =================================================
           FOTO
           ================================================= */

        const fotoUrl =
            normalizarTexto(

                perfilArtista.foto_url ||

                perfilArtista.avatar_url ||

                perfilArtista.foto ||

                perfil.foto_url ||

                perfil.avatar_url ||

                usuario.foto_url ||

                usuario.avatar_url ||

                ""

            );


        /* =================================================
           ESTADO LOCAL DA ETAPA 1
           ================================================= */

        estado.artista = {

            nome,

            tipo,

            localizacao,

            fotoUrl,

            iniciais:
                gerarIniciais(nome)

        };


        /* =================================================
           CORREÇÃO PRINCIPAL
           ================================================= */

        /*
         * Os dados acima não devem permanecer somente no
         * estado local da Etapa 1.
         *
         * Eles fazem parte da contratação e precisam
         * acompanhar o usuário durante todo o fluxo.
         *
         * Portanto, persistimos agora no estado central.
         *
         * IMPORTANTE:
         *
         * gerenciador.salvar() faz merge com o estado
         * existente. Portanto, salvar "artista" NÃO apaga:
         *
         * - serviço
         * - data
         * - horário
         * - local
         * - evento
         * - contratante
         * - pagamento
         * - etc.
         */

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            console.error(
                "MusicalWorldContratacao: não foi possível persistir os dados do artista porque o estado central não está disponível."
            );

            return estado.artista;

        }


        const usuarioId =
            estado.perfil
                ? (
                    estado.perfil.usuario_id ||
                    null
                )
                : null;


        gerenciador.salvar({

            artista: {

                perfilId:
                    estado.perfilId,

                usuarioId:
                    usuarioId,

                nome:
                    nome,

                nomeExibicao:
                    nome,

                fotoUrl:
                    fotoUrl,

                tipoArtista:
                    tipo,

                localizacao:
                    localizacao

            }

        });


        console.log(
            "MusicalWorldContratacao: dados do artista persistidos no estado central:",
            {
                perfilId:
                    estado.perfilId,

                usuarioId:
                    usuarioId,

                nome:
                    nome,

                nomeExibicao:
                    nome,

                fotoUrl:
                    fotoUrl,

                tipoArtista:
                    tipo,

                localizacao:
                    localizacao
            }
        );


        return estado.artista;

    }


    /* =====================================================
       GERAR INICIAIS
       ===================================================== */

    function gerarIniciais(nome) {

        const texto =
            normalizarTexto(nome);


        if (!texto) {

            return "MW";

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


    /* =====================================================
       NORMALIZAR SERVIÇO
       ===================================================== */

    function normalizarServico(servico) {

        if (!servico) {

            return null;

        }


        return {

            id:
                servico.id ||
                null,

            nome:
                normalizarTexto(

                    servico.nome ||

                    servico.titulo ||

                    servico.nome_servico ||

                    "Serviço"

                ),

            valor:
                servico.valor ??
                servico.preco ??
                servico.valor_servico ??
                servico.cache ??
                null,

            valorMinimo:
                servico.valor_minimo ??
                servico.valorMinimo ??
                null,

            valorMaximo:
                servico.valor_maximo ??
                servico.valorMaximo ??
                null,

            tipoCobranca:
                normalizarTexto(

                    servico.tipo_cobranca ||

                    servico.tipoCobranca ||

                    servico.forma_cobranca ||

                    ""

                ),

            descricao:
                normalizarTexto(

                    servico.descricao ||

                    servico.descricao_servico ||

                    ""

                ),

            duracao:
                normalizarTexto(

                    servico.duracao ||

                    servico.tempo_duracao ||

                    servico.duracao_servico ||

                    ""

                ),

            localizacao:
                normalizarTexto(

                    servico.localizacao ||

                    servico.area_atendimento ||

                    servico.local ||

                    (
                        estado.artista
                            ? estado.artista.localizacao
                            : ""
                    ) ||

                    ""

                ),

            ativo:
                servico.ativo !== false

        };

    }


    /* =====================================================
       RENDERIZAR ARTISTA
       ===================================================== */

    function renderizarArtista() {

        if (!estado.artista) {

            return;

        }


        const nome =
            obterElemento(
                CONFIG.seletores.artistaNome
            );


        const tipo =
            obterElemento(
                CONFIG.seletores.artistaTipo
            );


        const avatar =
            obterElemento(
                CONFIG.seletores.artistaAvatar
            );


        if (nome) {

            nome.textContent =
                estado.artista.nome;

        }


        if (tipo) {

            const tipoTexto =
                estado.artista.tipo;


            const localizacao =
                estado.artista.localizacao;


            tipo.textContent =
                localizacao
                    ? tipoTexto + " · " + localizacao
                    : tipoTexto;

        }


        if (avatar) {

            avatar.innerHTML = "";


            if (
                estado.artista.fotoUrl
            ) {

                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    estado.artista.fotoUrl;


                imagem.alt =
                    estado.artista.nome;


                imagem.loading =
                    "lazy";


                imagem.onerror =
                    function () {

                        imagem.remove();


                        avatar.textContent =
                            estado.artista.iniciais ||
                            "MW";

                    };


                avatar.appendChild(
                    imagem
                );

            } else {

                avatar.textContent =
                    estado.artista.iniciais ||
                    "MW";

            }

        }

    }


    /* =====================================================
       CRIAR DETALHE DO SERVIÇO
       ===================================================== */

    function criarDetalheServico(
        icone,
        valor
    ) {

        const detalhe =
            document.createElement(
                "div"
            );


        detalhe.className =
            "servico-opcao-detalhe";


        const svg =
            document.createElement(
                "span"
            );


        svg.className =
            "servico-opcao-detalhe-icone";


        svg.innerHTML =
            icone;


        const conteudo =
            document.createElement(
                "span"
            );


        conteudo.className =
            "servico-opcao-detalhe-conteudo";


        conteudo.textContent =
            valor;


        detalhe.appendChild(
            svg
        );


        detalhe.appendChild(
            conteudo
        );


        return detalhe;

    }


    /* =====================================================
       CRIAR CARD DE SERVIÇO
       ===================================================== */

    function criarCardServico(
        servico,
        indice
    ) {

        const card =
            document.createElement(
                "button"
            );


        card.type =
            "button";


        card.className =
            "servico-opcao";


        card.dataset.serviceId =
            String(
                servico.id
            );


        card.dataset.serviceIndex =
            String(
                indice
            );


        card.setAttribute(
            "aria-pressed",
            "false"
        );


        const conteudo =
            document.createElement(
                "div"
            );


        conteudo.className =
            "servico-opcao-conteudo";


        const cabecalho =
            document.createElement(
                "div"
            );


        cabecalho.className =
            "servico-opcao-header";


        const nome =
            document.createElement(
                "h3"
            );


        nome.className =
            "servico-opcao-nome";


        nome.textContent =
            servico.nome;


        const valor =
            document.createElement(
                "strong"
            );


        valor.className =
            "servico-opcao-valor";


        if (
            servico.valorMinimo !== null &&
            servico.valorMaximo !== null &&
            Number(
                servico.valorMinimo
            ) !==
            Number(
                servico.valorMaximo
            )
        ) {

            valor.textContent =
                formatarMoeda(
                    servico.valorMinimo
                ) +
                " – " +
                formatarMoeda(
                    servico.valorMaximo
                );

        } else {

            valor.textContent =
                formatarMoeda(
                    servico.valor
                );

        }


        cabecalho.appendChild(
            nome
        );


        cabecalho.appendChild(
            valor
        );


        const descricao =
            document.createElement(
                "p"
            );


        descricao.className =
            "servico-opcao-descricao";


        descricao.textContent =
            servico.descricao ||
            "Serviço disponível para contratação.";


        const detalhes =
            document.createElement(
                "div"
            );


        detalhes.className =
            "servico-opcao-detalhes";


        if (servico.duracao) {

            detalhes.appendChild(

                criarDetalheServico(

                    `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        ></circle>

                        <polyline
                            points="12 7 12 12 15 14"
                        ></polyline>
                    </svg>
                    `,

                    servico.duracao

                )

            );

        }


        if (servico.localizacao) {

            detalhes.appendChild(

                criarDetalheServico(

                    `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path
                            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                        ></path>

                        <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                        ></circle>
                    </svg>
                    `,

                    servico.localizacao

                )

            );

        }


        if (servico.tipoCobranca) {

            detalhes.appendChild(

                criarDetalheServico(

                    `
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        ></circle>

                        <path
                            d="M12 7v10"
                        ></path>

                        <path
                            d="M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2 1.3 2 3 2 3 2 3 2-1.3 2-3 2-3-.9-3-2"
                        ></path>
                    </svg>
                    `,

                    servico.tipoCobranca

                )

            );

        }


        conteudo.appendChild(
            cabecalho
        );


        conteudo.appendChild(
            descricao
        );


        if (
            detalhes.children.length > 0
        ) {

            conteudo.appendChild(
                detalhes
            );

        }


        const selecao =
            document.createElement(
                "span"
            );


        selecao.className =
            "servico-opcao-selecao";


        selecao.setAttribute(
            "aria-hidden",
            "true"
        );


        selecao.innerHTML = `

            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path
                    d="m5 12 4 4L19 6"
                ></path>
            </svg>

        `;


        card.appendChild(
            conteudo
        );


        card.appendChild(
            selecao
        );


        card.addEventListener(
            "click",
            function () {

                selecionarServico(
                    servico
                );

            }
        );


        return card;

    }


    /* =====================================================
       RENDERIZAR LISTA DE SERVIÇOS
       ===================================================== */

    function renderizarServicos() {

        const lista =
            obterElemento(
                CONFIG.seletores.servicosLista
            );


        if (!lista) {

            console.error(
                "MusicalWorldContratacao: elemento #servicosLista não encontrado."
            );


            return;

        }


        lista.innerHTML =
            "";


        if (
            !Array.isArray(
                estado.servicos
            ) ||
            estado.servicos.length === 0
        ) {

            const vazio =
                document.createElement(
                    "div"
                );


            vazio.className =
                "servicos-vazio";


            vazio.innerHTML = `

                <div class="servicos-vazio-icone">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        ></circle>

                        <path
                            d="M8 12h8"
                        ></path>

                    </svg>

                </div>

                <strong class="servicos-vazio-titulo">
                    Nenhum serviço disponível
                </strong>

                <p class="servicos-vazio-texto">
                    Este perfil ainda não possui serviços disponíveis para contratação.
                </p>

            `;


            lista.appendChild(
                vazio
            );


            atualizarEstadoBotaoAvancar();


            return;

        }


        let quantidadeCards =
            0;


        estado.servicos.forEach(
            function (
                registro,
                indice
            ) {

                const servico =
                    normalizarServico(
                        registro
                    );


                if (
                    !servico ||
                    !servico.id
                ) {

                    return;

                }


                quantidadeCards += 1;


                const card =
                    criarCardServico(
                        servico,
                        indice
                    );


                lista.appendChild(
                    card
                );


                /*
                 * IMPORTANTE:
                 *
                 * Se já existe um serviço salvo no estado,
                 * marcamos visualmente o card correspondente.
                 *
                 * Isso evita que o usuário volte para a Etapa 1
                 * e veja todos os cards como se nada tivesse
                 * sido selecionado.
                 */

                if (
                    estado.servico &&
                    String(
                        estado.servico.id
                    ) ===
                    String(
                        servico.id
                    )
                ) {

                    marcarServicoSelecionado(
                        card
                    );

                }

            }
        );


        if (
            quantidadeCards === 0
        ) {

            estado.servico =
                null;


            const vazio =
                document.createElement(
                    "div"
                );


            vazio.className =
                "servicos-vazio";


            vazio.innerHTML = `

                <strong class="servicos-vazio-titulo">
                    Nenhum serviço disponível
                </strong>

                <p class="servicos-vazio-texto">
                    Não foi possível identificar os serviços deste perfil.
                </p>

            `;


            lista.appendChild(
                vazio
            );

        }


        atualizarEstadoBotaoAvancar();

    }


    /* =====================================================
       MARCAR SERVIÇO SELECIONADO
       ===================================================== */

    function marcarServicoSelecionado(
        cardSelecionado
    ) {

        const lista =
            obterElemento(
                CONFIG.seletores.servicosLista
            );


        if (!lista) {

            return;

        }


        const cards =
            lista.querySelectorAll(
                ".servico-opcao"
            );


        cards.forEach(
            function (card) {

                const selecionado =
                    card ===
                    cardSelecionado;


                card.classList.toggle(
                    "selecionado",
                    selecionado
                );


                card.setAttribute(
                    "aria-pressed",
                    selecionado
                        ? "true"
                        : "false"
                );

            }
        );

    }


    /* =====================================================
       SELECIONAR SERVIÇO
       ===================================================== */

    function selecionarServico(
        servico
    ) {

        const normalizado =
            normalizarServico(
                servico
            );


        if (!normalizado) {

            console.warn(
                "MusicalWorldContratacao: serviço inválido."
            );


            return false;

        }


        if (!normalizado.id) {

            console.warn(
                "MusicalWorldContratacao: serviço sem ID."
            );


            return false;

        }


        estado.servico =
            normalizado;


        console.log(
            "MusicalWorldContratacao: serviço selecionado:",
            estado.servico
        );


        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            console.error(
                "MusicalWorldContratacao: não foi possível salvar o serviço no estado central."
            );


            return false;

        }


        /*
         * Salva imediatamente.
         *
         * IMPORTANTE:
         *
         * salvamos somente os dados pertencentes ao serviço.
         *
         * O restante da contratação permanece intacto
         * dentro do estado central.
         */

        gerenciador.salvar({

            servico: {

                id:
                    normalizado.id,

                nome:
                    normalizado.nome,

                descricao:
                    normalizado.descricao,

                valor:
                    normalizado.valor,

                valorMinimo:
                    normalizado.valorMinimo,

                valorMaximo:
                    normalizado.valorMaximo,

                tipoCobranca:
                    normalizado.tipoCobranca,

                duracao:
                    normalizado.duracao,

                unidadeDuracao:
                    normalizado.unidadeDuracao || "",

                localizacao:
                    normalizado.localizacao,

                ativo:
                    normalizado.ativo

            }

        });


        /*
         * Atualiza visualmente todos os cards.
         */

        const lista =
            obterElemento(
                CONFIG.seletores.servicosLista
            );


        if (lista) {

            const cards =
                lista.querySelectorAll(
                    ".servico-opcao"
                );


            cards.forEach(
                function (card) {

                    const cardId =
                        String(
                            card.dataset.serviceId || ""
                        );


                    const selecionado =
                        cardId ===
                        String(
                            normalizado.id
                        );


                    card.classList.toggle(
                        "selecionado",
                        selecionado
                    );


                    card.setAttribute(
                        "aria-pressed",
                        selecionado
                            ? "true"
                            : "false"
                    );

                }
            );

        }


        atualizarEstadoBotaoAvancar();


        return true;

    }


    /* =====================================================
       RESTAURAR SERVIÇO DO ESTADO CENTRAL
       ===================================================== */

    function restaurarServicoDoEstado() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            return false;

        }


        const dados =
            gerenciador.obter();


        /*
         * O serviço salvo é a fonte da verdade.
         */

        if (
            !dados.servico ||
            !dados.servico.id
        ) {

            console.log(
                "MusicalWorldContratacao: nenhum serviço anterior salvo no estado."
            );


            return false;

        }


        const servicoId =
            String(
                dados.servico.id
            );


        console.log(
            "MusicalWorldContratacao: tentando restaurar serviço:",
            servicoId
        );


        const servicoEncontrado =
            estado.servicos.find(
                function (servico) {

                    if (!servico) {

                        return false;

                    }


                    return String(
                        servico.id
                    ) ===
                    servicoId;

                }
            );


        if (!servicoEncontrado) {

            console.warn(
                "MusicalWorldContratacao: serviço salvo não está mais disponível.",
                {
                    servicoId,
                    servicosDisponiveis:
                        estado.servicos
                }
            );


            return false;

        }


        const restaurado =
            selecionarServico(
                servicoEncontrado
            );


        if (restaurado) {

            console.log(
                "MusicalWorldContratacao: serviço restaurado com sucesso:",
                dados.servico
            );

        }


        return restaurado;

    }


    /* =====================================================
       SELEÇÃO INICIAL
       ===================================================== */

    function selecionarServicoInicial() {

        /*
         * Primeiro normalizamos todos os serviços.
         */

        if (
            !Array.isArray(
                estado.servicos
            ) ||
            estado.servicos.length === 0
        ) {

            estado.servico =
                null;


            atualizarEstadoBotaoAvancar();


            return;

        }


        const servicosValidos =
            estado.servicos
                .map(
                    function (servico) {

                        return normalizarServico(
                            servico
                        );

                    }
                )
                .filter(
                    function (servico) {

                        return Boolean(
                            servico &&
                            servico.id
                        );

                    }
                );


        estado.servicos =
            servicosValidos;


        /*
         * PRIORIDADE 1:
         *
         * Restaurar exatamente o serviço salvo
         * no estado central.
         */

        const restaurado =
            restaurarServicoDoEstado();


        if (restaurado) {

            return;

        }


        /*
         * PRIORIDADE 2:
         *
         * Se existe somente um serviço,
         * selecionar automaticamente.
         */

        if (
            estado.servicos.length === 1
        ) {

            selecionarServico(
                estado.servicos[0]
            );


            return;

        }


        /*
         * PRIORIDADE 3:
         *
         * Nenhum serviço selecionado.
         */

        estado.servico =
            null;


        atualizarEstadoBotaoAvancar();

    }


    /* =====================================================
       RENDERIZAR SERVIÇO
       ===================================================== */

    function renderizarServico() {

        atualizarEstadoBotaoAvancar();

    }


    /* =====================================================
       ATUALIZAR BOTÃO CONTINUAR
       ===================================================== */

    function atualizarEstadoBotaoAvancar() {

        const btnAvancar =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        if (!btnAvancar) {

            return;

        }


        const podeAvancar =
            Boolean(

                estado.carregado &&

                estado.perfilId &&

                estado.servico &&

                estado.servico.id

            );


        btnAvancar.disabled =
            !podeAvancar;


        console.log(
            "MusicalWorldContratacao: estado do botão Continuar:",
            {
                carregado:
                    estado.carregado,

                perfilId:
                    estado.perfilId,

                servicoId:
                    estado.servico
                        ? estado.servico.id
                        : null,

                habilitado:
                    podeAvancar

            }
        );

    }


    /* =====================================================
       ATUALIZAR INDICADOR DE ETAPA
       ===================================================== */

    function atualizarIndicadorEtapa() {

        const numero =
            obterElemento(
                CONFIG.seletores.etapaNumero
            );


        const progresso =
            obterElemento(
                CONFIG.seletores.etapaProgresso
            );


        if (numero) {

            numero.textContent =
                `Etapa ${estado.etapaAtual} de ${CONFIG.totalEtapas}`;

        }


        if (progresso) {

            const percentual =
                (
                    estado.etapaAtual /
                    CONFIG.totalEtapas
                ) * 100;


            progresso.style.width =
                `${percentual}%`;

        }

    }


    /* =====================================================
       ATUALIZAR ETAPA
       ===================================================== */

    function atualizarEtapa() {

        atualizarIndicadorEtapa();


        const titulo =
            obterElemento(
                CONFIG.seletores.tituloEtapa
            );


        const descricao =
            obterElemento(
                CONFIG.seletores.descricaoEtapa
            );


        if (
            titulo
        ) {

            titulo.textContent =
                "Escolha o serviço";

        }


        if (
            descricao
        ) {

            descricao.textContent =
                "Selecione o serviço que você deseja contratar para este artista.";

        }

    }


    /* =====================================================
       VALIDAR ETAPA
       ===================================================== */

    function validarEtapaAtual() {

        if (!estado.perfilId) {

            console.error(
                "MusicalWorldContratacao: perfil_id ausente."
            );


            return false;

        }


        if (
            !estado.servico ||
            !estado.servico.id
        ) {

            mostrarMensagem(
                "Selecione um serviço para continuar."
            );


            return false;

        }


        return true;

    }


    /* =====================================================
       MENSAGEM
       ===================================================== */

    function mostrarMensagem(
        mensagem
    ) {

        console.warn(
            "MusicalWorldContratacao:",
            mensagem
        );


        const toast =
            document.getElementById(
                "toast"
            );


        if (!toast) {

            return;

        }


        toast.textContent =
            mensagem;


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timeout
        );


        toast._timeout =
            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                3500
            );

    }


    /* =====================================================
       AVANÇAR
       ===================================================== */

    function avancar() {

        if (
            !validarEtapaAtual()
        ) {

            return false;

        }


        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            mostrarMensagem(
                "Não foi possível recuperar os dados da contratação."
            );


            return false;

        }


        /*
         * Antes de sair da Etapa 1, garantimos que
         * o serviço esteja salvo no estado central.
         *
         * Também garantimos novamente que os dados do
         * artista estejam preservados.
         *
         * Isso funciona como uma segunda camada de
         * segurança caso algum dado tenha sido atualizado
         * durante o carregamento.
         */

        const artistaCentral =
            estado.artista
                ? {

                    perfilId:
                        estado.perfilId,

                    usuarioId:
                        estado.perfil
                            ? (
                                estado.perfil.usuario_id ||
                                null
                            )
                            : null,

                    nome:
                        estado.artista.nome || "",

                    nomeExibicao:
                        estado.artista.nome || "",

                    fotoUrl:
                        estado.artista.fotoUrl || "",

                    tipoArtista:
                        estado.artista.tipo || "",

                    localizacao:
                        estado.artista.localizacao || ""

                }
                : undefined;


        const dadosParaSalvar = {

            perfilId:
                estado.perfilId,

            tipo:
                estado.tipo || null,

            servico:
                estado.servico,

            etapaAtual:
                2,

            totalEtapas:
                CONFIG.totalEtapas

        };


        /*
         * Só adicionamos artista se ele realmente estiver
         * disponível.
         *
         * Assim não substituímos um artista já salvo por
         * valores vazios.
         */

        if (artistaCentral) {

            dadosParaSalvar.artista =
                artistaCentral;

        }


        gerenciador.salvar(
            dadosParaSalvar
        );


        const dados =
            gerenciador.obter();


        console.log(
            "MusicalWorldContratacao: avançando para a Etapa 2.",
            dados
        );


        /*
         * IMPORTANTE:
         *
         * Nenhum parâmetro de contratação é enviado
         * pela URL.
         *
         * A Etapa 2 recuperará tudo através do:
         *
         *     ContratacaoEstado.js
         */

        window.location.href =
            CONFIG.paginas.proximaEtapa;


        return true;

    }


    /* =====================================================
       CANCELAR
       ===================================================== */

        /* =====================================================
       CANCELAR
       ===================================================== */

    function cancelar() {

        const confirmou =
            window.confirm(
                "Deseja cancelar esta contratação?"
            );


        if (!confirmou) {

            return;

        }


        const gerenciador =
            obterGerenciadorEstado();


        /*
         * IMPORTANTE:
         *
         * O perfilId precisa ser capturado ANTES de
         * limpar o estado central.
         *
         * O método limpar() remove toda a contratação,
         * inclusive o perfilId.
         */

        let perfilId =
            null;


        if (
            gerenciador &&
            typeof gerenciador.obter === "function"
        ) {

            const dados =
                gerenciador.obter();


            if (
                dados &&
                dados.perfilId
            ) {

                perfilId =
                    dados.perfilId;

            }

        }


        /*
         * Caso o estado central não possua o ID por algum
         * motivo, ainda temos o ID carregado no estado local
         * desta Etapa 1.
         */

        if (
            !perfilId &&
            estado.perfilId
        ) {

            perfilId =
                estado.perfilId;

        }


        /*
         * Agora sim apagamos todos os dados temporários
         * da contratação.
         */

        if (gerenciador) {

            gerenciador.limpar();

        }


        /*
         * Retorna diretamente para o perfil que iniciou
         * a contratação.
         *
         * ApresentarPerfil.js utiliza:
         *
         *     parametros.get("id")
         *
         * Portanto o parâmetro precisa ser exatamente:
         *
         *     ?id=...
         */

        if (perfilId) {

            window.location.href =
                "apresentar-perfil.html?id=" +
                encodeURIComponent(
                    perfilId
                );

            return;

        }


        /*
         * Fallback de segurança.
         *
         * Se, por algum motivo, não conseguirmos recuperar
         * o ID do perfil, ainda retornamos para a página
         * pública sem inventar nenhum identificador.
         */

        window.location.href =
            "apresentar-perfil.html";

    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        const btnAvancar =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        const btnCancelar =
            obterElemento(
                CONFIG.seletores.btnCancelar
            );


        if (btnAvancar) {

            btnAvancar.onclick =
                function (evento) {

                    if (evento) {

                        evento.preventDefault();

                    }


                    avancar();

                };

        }


        if (btnCancelar) {

            btnCancelar.onclick =
                function (evento) {

                    if (evento) {

                        evento.preventDefault();

                    }


                    cancelar();

                };

        }

    }


    /* =====================================================
       CARREGAR DADOS
       ===================================================== */

    async function carregarDados() {

        estado.carregando =
            true;


        estado.carregado =
            false;


        estado.erro =
            null;


        try {

            /*
             * 1.
             *
             * Recupera o estado central.
             *
             * Se for nova contratação, cria.
             *
             * Se for retorno, preserva.
             */

            inicializarEstadoCentral();


            const gerenciador =
                obterGerenciadorEstado();


            console.log(
                "MusicalWorldContratacao: iniciando carregamento.",
                {
                    perfilId:
                        estado.perfilId,

                    tipo:
                        estado.tipo,

                    estadoContratacao:
                        gerenciador
                            ? gerenciador.obter()
                            : null

                }
            );


            /*
             * 2.
             *
             * Carrega perfil.
             */

            await carregarPerfil();


            /*
             * 3.
             *
             * Usuário e perfil artístico.
             */

            await Promise.all([

                carregarUsuario(),

                carregarPerfilArtista()

            ]);


            /*
             * 4.
             *
             * Carrega serviços.
             */

            await carregarServicos();


            /*
             * 5.
             *
             * Monta informações do artista.
             *
             * IMPORTANTE:
             *
             * Além de preparar os dados para a tela,
             * esta função agora também salva o artista
             * no ContratacaoEstado.js.
             */

            montarDadosArtista();


            /*
             * 6.
             *
             * Restaura o serviço salvo.
             *
             * ESTE PASSO É FUNDAMENTAL PARA O RETORNO
             * DA ETAPA 2 PARA A ETAPA 1.
             */

            selecionarServicoInicial();


            /*
             * 7.
             *
             * Agora a página está realmente carregada.
             */

            estado.carregado =
                true;


            console.log(
                "MusicalWorldContratacao: dados reais carregados com sucesso."
            );


            /*
             * Recalcula o botão depois que carregado=true.
             */

            atualizarEstadoBotaoAvancar();


            return true;

        } catch (erro) {

            estado.erro =
                erro;


            console.error(
                "MusicalWorldContratacao: erro ao carregar contratação:",
                erro
            );


            return false;

        } finally {

            estado.carregando =
                false;

        }

    }


    /* =====================================================
       RENDERIZAÇÃO INICIAL
       ===================================================== */

    function renderizar() {

        /*
         * Artista.
         */

        renderizarArtista();


        /*
         * Lista de serviços.
         *
         * Aqui também fazemos a confirmação visual
         * do serviço restaurado.
         */

        renderizarServicos();


        /*
         * Atualiza informações do serviço.
         */

        renderizarServico();


        /*
         * Etapa 1.
         */

        atualizarEtapa();


        /*
         * Estado final do botão.
         */

        atualizarEstadoBotaoAvancar();

    }


    /* =====================================================
       ESTADO DE ERRO
       ===================================================== */

    function renderizarErro() {

        const titulo =
            obterElemento(
                CONFIG.seletores.tituloEtapa
            );


        const descricao =
            obterElemento(
                CONFIG.seletores.descricaoEtapa
            );


        if (titulo) {

            titulo.textContent =
                "Não foi possível iniciar a contratação";

        }


        if (descricao) {

            descricao.textContent =
                "Não conseguimos carregar os dados deste perfil. Volte e tente novamente.";

        }


        const btnAvancar =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        if (btnAvancar) {

            btnAvancar.disabled =
                true;

        }


        renderizarArtista();


        const lista =
            obterElemento(
                CONFIG.seletores.servicosLista
            );


        if (lista) {

            lista.innerHTML = `

                <div class="servicos-vazio">

                    <strong class="servicos-vazio-titulo">
                        Não foi possível carregar os serviços
                    </strong>

                    <p class="servicos-vazio-texto">
                        Verifique sua conexão e tente novamente.
                    </p>

                </div>

            `;

        }

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        console.log(
            "MusicalWorld — inicializando Etapa 1 da contratação."
        );


        /*
         * Começa desabilitado.
         *
         * Somente será habilitado depois que:
         *
         * - perfil existir
         * - serviços forem carregados
         * - serviço estiver restaurado/selecionado
         */

        const btnAvancar =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        if (btnAvancar) {

            btnAvancar.disabled =
                true;

        }


        configurarEventos();


        const sucesso =
            await carregarDados();


        if (!sucesso) {

            renderizarErro();


            return;

        }


        renderizar();


        atualizarEstadoBotaoAvancar();


        console.log(
            "MusicalWorld — Etapa 1 da contratação inicializada.",
            {
                perfilId:
                    estado.perfilId,

                artista:
                    estado.artista,

                servicoSelecionado:
                    estado.servico
                        ? estado.servico.id
                        : null,

                estadoCentral:
                    obterGerenciadorEstado()
                        ? obterGerenciadorEstado().obter()
                        : null

            }
        );

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacao = {

        inicializar,

        avancar,

        cancelar,

        carregarDados,

        selecionarServico,

        obterEstado:
            function () {

                return estado;

            }

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();

    }


})(window);