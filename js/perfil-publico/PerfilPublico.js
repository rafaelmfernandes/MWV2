(function (window) {

    "use strict";

    /* =========================================================
       MUSICALWORLD — MEU PERFIL UNIVERSAL
       Arquivo: PerfilPublico.js

       Responsabilidade:

       - Controlar a página "Meu Perfil".
       - Funcionar para todos os tipos de perfil.
       - Controlar as abas.
       - Carregar os dados.
       - Acionar os módulos de cada seção.
       - Preencher informações básicas.
       - Controlar ações da página.
       - Controlar carteira e transações.
       - Abrir a apresentação pública universal.
       - Abrir o editor universal.

       PÁGINAS UNIVERSAIS:

       Meu Perfil:
       meu-perfil.html

       Editar Perfil:
       editar-perfil.html

       Apresentar Perfil:
       apresentar-perfil.html?id=ID_DO_PERFIL

       TIPOS SUPORTADOS:

       Cantor(a)
       Músico(a)
       Banda
       Dupla musical
       DJ
       Dançarino(a)
       Grupo de dança
       MC
       Compositor(a)
       Produtor(a) musical
       Contratante
       ========================================================= */


    /* =====================================================
       DEPENDÊNCIAS
       ===================================================== */

    const Utils =
        window.PerfilPublicoUtils || null;

    const Dados =
        window.PerfilPublicoDados || null;

    const Portfolio =
        window.PerfilPublicoPortfolio || null;

    const Servicos =
        window.PerfilPublicoServicos || null;

    const Agenda =
        window.PerfilPublicoAgenda || null;

    const Avaliacoes =
        window.PerfilPublicoAvaliacoes || null;


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        pagina: {

            /*
             * Fallback genérico.
             *
             * O tipo real sempre deve vir do banco.
             */

            tipoArtista:
                "Artista",

            /*
             * Página pública universal.
             */

            apresentacao:
                "apresentar-perfil.html",

            /*
             * Editor universal.
             */

            edicao:
                "editar-perfil.html"

        },


        abas: {

            sobre: {
                id:
                    "tab-sobre"
            },

            portfolio: {
                id:
                    "tab-portfolio"
            },

            agenda: {
                id:
                    "tab-agenda"
            },

            avaliacoes: {
                id:
                    "tab-avaliacoes"
            },

            carteira: {
                id:
                    "tab-carteira"
            }

        },


        elementos: {

            nome:
                "profileName",

            categoria:
                "profileCategory",

            /*
             * Subtítulo do topo.
             *
             * O tipo real do perfil será colocado aqui.
             */

            subtituloTipo:
                "topbarProfileSubtitle",

            localizacao:
                "profileLocation",

            avaliacao:
                "profileRating",

            avaliacaoValor:
                "ratingValue",

            avaliacaoAvaliacoes:
                "ratingReviews",

            status:
                "profileStatus",

            avatar:
                "profileAvatar",

            iniciais:
                "profileInitials",

            bio:
                "profileBio",

            experiencia:
                "profileExperience",

            area:
                "profileArea",

            tipo:
                "profileType",

            disponibilidade:
                "profileAvailability",

            generos:
                "genreList",

            instrumentos:
                "instrumentList",

            instrumentosSection:
                "instrumentosSection",

            servicos:
                "servicesList",

            linkPerfil:
                "profileLink",

            qrImagem:
                "qrImage",

            walletTotal:
                "walletTotal",

            walletAvailable:
                "walletAvailable",

            walletPending:
                "walletPending",

            transactionList:
                "transactionList"

        },


        botoes: {

            voltar:
                "btnVoltar",

            visualizar:
                "btnVisualizarPerfil",

            editar:
                "btnEditarPerfil",

            whatsapp:
                "btnWhatsApp",

            qrCode:
                "btnQRCode",

            fecharQR:
                "btnFecharQR",

            compartilharQR:
                "btnCompartilharQR",

            sacar:
                "btnSacar"

        },


        modais: {

            qr:
                "qrOverlay"

        },


        toast: {

            elemento:
                "toast",

            mensagem:
                "toastMessage"

        }

    };


    /* =====================================================
       ESTADO
       ===================================================== */

    const estado = {

        inicializado:
            false,

        carregando:
            false,

        abaAtual:
            "sobre",

        abasCarregadas: {

            sobre:
                false,

            portfolio:
                false,

            agenda:
                false,

            avaliacoes:
                false,

            carteira:
                false

        },

        perfil:
            null,

        perfilArtista:
            null,

        usuario:
            null,

        usuarioId:
            null,

        perfilId:
            null,

        portfolio:
            [],

        servicos:
            [],

        agenda:
            [],

        avaliacoes:
            [],

        carteira:
            null,

        transacoes:
            []

    };


    /* =====================================================
       LOG
       ===================================================== */

    function log(...mensagens) {

        console.log(
            "[PerfilPublico]",
            ...mensagens
        );

    }


    function aviso(...mensagens) {

        console.warn(
            "[PerfilPublico]",
            ...mensagens
        );

    }


    function erro(...mensagens) {

        console.error(
            "[PerfilPublico]",
            ...mensagens
        );

    }


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    function obterElemento(id) {

        if (!id) {
            return null;
        }

        return document.getElementById(id);

    }


    /* =====================================================
       DEFINIR TEXTO
       ===================================================== */

    function definirTexto(
        id,
        valor,
        padrao = ""
    ) {

        const elemento =
            obterElemento(id);

        if (!elemento) {
            return;
        }

        const texto =
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
                ? String(valor)
                : padrao;

        elemento.textContent =
            texto;

    }


    /* =====================================================
       DEFINIR LOCALIZAÇÃO
       ===================================================== */

    function definirLocalizacao(
        valor
    ) {

        const elemento =
            obterElemento(
                CONFIG.elementos.localizacao
            );

        if (!elemento) {
            return;
        }

        const texto =
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
                ? String(valor)
                : "Localização não informada";

        /*
         * O elemento #profileLocation possui
         * um ícone SVG/Lucide e um <span>.
         *
         * Alterar textContent diretamente no elemento
         * apagaria o ícone.
         */

        const span =
            elemento.querySelector("span");

        if (span) {

            span.textContent =
                texto;

        } else {

            elemento.textContent =
                texto;

        }

    }


    /* =====================================================
       OBTER PRIMEIRO VALOR
       ===================================================== */

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
                String(valor).trim() !== ""
            ) {

                return valor;

            }

        }

        return "";

    }


    /* =====================================================
       EXTRAIR VALOR DE TIPO
       ===================================================== */

    function extrairValorTipo(
        valor
    ) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        /*
         * Quando o Supabase retorna uma string,
         * podemos utilizá-la diretamente.
         */

        if (
            typeof valor !== "object"
        ) {

            return String(valor).trim();

        }


        /*
         * Quando o Supabase retorna um objeto,
         * nunca devemos convertê-lo diretamente para String,
         * pois isso resultaria em "[object Object]".
         */

        const valorExtraido =
            obterPrimeiroValor(

                valor.tipo_artista,

                valor.tipoArtista,

                valor.nome,

                valor.nome_exibicao,

                valor.tipo,

                valor.valor

            );


        /*
         * Se o campo "tipo" também for um objeto,
         * faz uma segunda extração.
         */

        if (
            valorExtraido &&
            typeof valorExtraido === "object"
        ) {

            return extrairValorTipo(
                valorExtraido
            );

        }


        return valorExtraido;

    }


    /* =====================================================
       OBTER TIPO BRUTO DO PERFIL
       ===================================================== */

    function obterTipoBrutoPerfil() {

        const candidatos = [

            /*
             * Prioridade máxima:
             * tipo específico do perfil artístico.
             */

            estado.perfilArtista?.tipo_artista,

            estado.perfilArtista?.tipoArtista,

            estado.perfilArtista?.tipo,

            estado.perfilArtista?.tipo_perfil,

            estado.perfilArtista?.tipoPerfil,

            /*
             * Possíveis campos diretamente em perfis.
             */

            estado.perfil?.tipo_artista,

            estado.perfil?.tipoArtista,

            estado.perfil?.tipo_perfil,

            estado.perfil?.tipoPerfil,

            estado.perfil?.tipo,

            /*
             * Possíveis campos no usuário.
             */

            estado.usuario?.tipo_artista,

            estado.usuario?.tipoArtista,

            estado.usuario?.tipo_perfil,

            estado.usuario?.tipoPerfil

        ];


        for (
            const candidato of candidatos
        ) {

            const valor =
                extrairValorTipo(
                    candidato
                );


            if (
                valor !== null &&
                valor !== undefined &&
                String(valor).trim() !== ""
            ) {

                return valor;

            }

        }


        return CONFIG.pagina.tipoArtista;

    }


    /* =====================================================
       INICIALIZAR
       ===================================================== */

    async function inicializar() {

        if (estado.carregando) {

            aviso(
                "A página já está sendo inicializada."
            );

            return;

        }

        estado.carregando =
            true;

        try {

            log(
                "Inicializando Meu Perfil universal..."
            );

            configurarEventos();

            configurarAbas();

            await carregarDados();

            preencherInformacoesPerfil();

            await carregarAba(
                "sobre"
            );

            ativarAba(
                "sobre",
                false
            );

            renderizarIcones();

            estado.inicializado =
                true;

            log(
                "Meu Perfil universal inicializado com sucesso."
            );

        } catch (error) {

            erro(
                "Erro ao inicializar perfil:",
                error
            );

            mostrarToast(
                "Não foi possível carregar o perfil.",
                "erro"
            );

        } finally {

            estado.carregando =
                false;

        }

    }


    /* =====================================================
       CARREGAR DADOS
       ===================================================== */

    async function carregarDados() {

        if (!Dados) {

            throw new Error(
                "PerfilPublicoDados.js não foi carregado."
            );

        }

        log(
            "Carregando dados do perfil..."
        );


        let resultado =
            null;


        if (
            typeof Dados.carregarTudo === "function"
        ) {

            resultado =
                await Dados.carregarTudo({

                    carregarPortfolio:
                        true,

                    incluirPortfolio:
                        true,

                    carregarServicos:
                        true,

                    incluirServicos:
                        true,

                    carregarAgenda:
                        true,

                    incluirAgenda:
                        true,

                    carregarAvaliacoes:
                        false,

                    incluirAvaliacoes:
                        false,

                    carregarCarteira:
                        true,

                    incluirCarteira:
                        true

                });

        } else {

            aviso(
                "carregarTudo() não encontrado. Tentando carregamento individual."
            );


            if (
                typeof Dados.carregarUsuario === "function"
            ) {

                await Dados.carregarUsuario();

            }


            if (
                typeof Dados.carregarPerfil === "function"
            ) {

                await Dados.carregarPerfil();

            }


            if (
                typeof Dados.carregarPerfilArtista === "function"
            ) {

                await Dados.carregarPerfilArtista();

            }


            if (
                typeof Dados.carregarPortfolio === "function"
            ) {

                await Dados.carregarPortfolio();

            }


            if (
                typeof Dados.carregarServicos === "function"
            ) {

                await Dados.carregarServicos();

            }


            if (
                typeof Dados.carregarAgenda === "function"
            ) {

                await Dados.carregarAgenda();

            }


            if (
                typeof Dados.carregarCarteira === "function"
            ) {

                await Dados.carregarCarteira();

            }

        }


        estado.usuario =
            obterEstadoDados(
                "obterUsuario",
                resultado?.usuario
            );


        estado.perfil =
            obterEstadoDados(
                "obterPerfil",
                resultado?.perfil
            );


        estado.perfilArtista =
            obterEstadoDados(
                "obterPerfilArtista",
                resultado?.perfilArtista
            );


        estado.usuarioId =
            obterEstadoDados(
                "obterUsuarioId",
                resultado?.usuarioId
            );


        estado.perfilId =
            obterEstadoDados(
                "obterPerfilId",
                resultado?.perfilId
            );


        estado.portfolio =
            obterEstadoArray(
                "obterPortfolio",
                resultado?.portfolio
            );


        estado.servicos =
            obterEstadoArray(
                "obterServicos",
                resultado?.servicos
            );


        estado.agenda =
            obterEstadoArray(
                "obterAgenda",
                resultado?.agenda
            );


        estado.avaliacoes =
            [];


        estado.carteira =
            obterEstadoDados(
                "obterCarteira",
                resultado?.carteira
            );


        estado.transacoes =
            obterEstadoArray(
                "obterTransacoes",
                resultado?.transacoes
            );


        /*
         * Caso algum módulo retorne um objeto contendo
         * o perfil dentro de "dados", tentamos recuperar
         * os valores sem quebrar o fluxo.
         */

        if (
            !estado.usuario &&
            resultado?.dados?.usuario
        ) {

            estado.usuario =
                resultado.dados.usuario;

        }


        if (
            !estado.perfil &&
            resultado?.dados?.perfil
        ) {

            estado.perfil =
                resultado.dados.perfil;

        }


        if (
            !estado.perfilArtista &&
            resultado?.dados?.perfilArtista
        ) {

            estado.perfilArtista =
                resultado.dados.perfilArtista;

        }


        if (
            !estado.usuarioId &&
            resultado?.dados?.usuarioId
        ) {

            estado.usuarioId =
                resultado.dados.usuarioId;

        }


        if (
            !estado.perfilId &&
            resultado?.dados?.perfilId
        ) {

            estado.perfilId =
                resultado.dados.perfilId;

        }


        log(
            "Dados carregados:",
            {

                usuarioId:
                    estado.usuarioId,

                perfilId:
                    estado.perfilId,

                tipoPerfil:
                    obterTipoPerfilAtual(),

                tipoBruto:
                    obterTipoBrutoPerfil(),

                portfolio:
                    estado.portfolio.length,

                servicos:
                    estado.servicos.length,

                agenda:
                    estado.agenda.length,

                avaliacoes:
                    estado.avaliacoes.length,

                transacoes:
                    estado.transacoes.length

            }
        );


        log(
            "Perfil carregado:",
            estado.perfil
        );


        log(
            "Perfil artístico carregado:",
            estado.perfilArtista
        );


        log(
            "Serviços encontrados:",
            estado.servicos
        );

    }


    /* =====================================================
       OBTER ESTADO DOS DADOS
       ===================================================== */

    function obterEstadoDados(
        metodo,
        fallback = null
    ) {

        if (
            Dados &&
            typeof Dados[metodo] === "function"
        ) {

            const valor =
                Dados[metodo]();


            if (
                valor !== undefined &&
                valor !== null
            ) {

                return valor;

            }

        }

        return fallback;

    }


    /* =====================================================
       OBTER ARRAY DO ESTADO
       ===================================================== */

    function obterEstadoArray(
        metodo,
        fallback = []
    ) {

        const valor =
            obterEstadoDados(
                metodo,
                fallback
            );


        return Array.isArray(valor)
            ? valor
            : [];

    }


    /* =====================================================
       PREENCHER PERFIL
       ===================================================== */

    function preencherInformacoesPerfil() {

        const usuario =
            estado.usuario || {};

        const perfil =
            estado.perfil || {};

        const artista =
            estado.perfilArtista || {};


        /*
         * O nome de exibição do perfil deve ter prioridade.
         */

        const nome =
            obterPrimeiroValor(

                perfil.nome_exibicao,

                artista.nome_artistico,

                artista.nomeArtistico,

                artista.nome,

                perfil.nome_artistico,

                perfil.nome,

                usuario.nome,

                usuario.nome_completo,

                "Artista"

            );


        /*
         * Obtém o tipo específico.
         */

        const tipo =
            obterTipoPerfilAtual();


        /*
         * Localização.
         */

        const localizacao =
            obterPrimeiroValor(

                artista.localizacao,

                artista.localizacao_texto,

                artista.cidade,

                perfil.localizacao,

                perfil.cidade,

                usuario.cidade

            );


        /*
         * Biografia.
         */

        const bio =
            obterPrimeiroValor(

                perfil.descricao,

                artista.descricao,

                artista.biografia,

                artista.bio,

                perfil.biografia,

                perfil.bio

            );


        /*
         * Experiência.
         */

        const experiencia =
            obterPrimeiroValor(

                artista.experiencia,

                artista.tempo_experiencia,

                artista.anos_experiencia,

                perfil.experiencia

            );


        /*
         * Área de atendimento/atuação.
         */

        const area =
            obterPrimeiroValor(

                artista.area_atendimento,

                artista.areaAtendimento,

                artista.area_atuacao,

                artista.areaAtuacao,

                artista.area,

                perfil.area_atendimento,

                perfil.areaAtendimento,

                perfil.area_atuacao

            );


        /*
         * Disponibilidade.
         */

        const disponibilidade =
            obterPrimeiroValor(

                artista.disponivel,

                artista.disponibilidade,

                perfil.disponibilidade

            );


        /*
         * Nome.
         */

        definirTexto(
            CONFIG.elementos.nome,
            nome,
            "Artista"
        );


        /*
         * Categoria.
         */

        definirTexto(
            CONFIG.elementos.categoria,
            tipo,
            "Artista"
        );


        /*
         * Subtítulo do topo.
         *
         * Só será preenchido se o elemento existir.
         */

        definirTexto(
            CONFIG.elementos.subtituloTipo,
            tipo,
            "Perfil"
        );


        /*
         * Localização.
         */

        definirLocalizacao(
            localizacao
        );


        /*
         * Biografia.
         */

        definirTexto(
            CONFIG.elementos.bio,
            bio,
            "Nenhuma biografia informada."
        );


        /*
         * Experiência.
         */

        definirTexto(
            CONFIG.elementos.experiencia,
            experiencia,
            "Não informado"
        );


        /*
         * Área.

         */

        definirTexto(
            CONFIG.elementos.area,
            area,
            "Não informado"
        );


        /*
         * Tipo.

         */

        definirTexto(
            CONFIG.elementos.tipo,
            tipo,
            "Artista"
        );


        /*
         * Disponibilidade.

         */

        definirTexto(
            CONFIG.elementos.disponibilidade,
            obterTextoDisponibilidade(
                disponibilidade
            ),
            "Não informado"
        );


        preencherStatus(
            disponibilidade
        );


        preencherAvatar(
            artista,
            perfil,
            nome
        );


        preencherAvaliacao();


        preencherGeneros(
            artista
        );


        preencherInstrumentos(
            artista
        );


        preencherServicos();


        preencherLinkPerfil();


        preencherCarteira();

    }


    /* =====================================================
       STATUS DO PERFIL
       ===================================================== */

    function preencherStatus(
        disponibilidade
    ) {

        const elemento =
            obterElemento(
                CONFIG.elementos.status
            );

        if (!elemento) {
            return;
        }


        const disponivel =
            disponibilidade === true ||
            disponibilidade === "true" ||
            disponibilidade === 1 ||
            disponibilidade === "1";


        elemento.classList.toggle(
            "available",
            disponivel
        );


        elemento.classList.toggle(
            "unavailable",
            !disponivel
        );


        const texto =
            disponivel
                ? "Disponível"
                : "Indisponível";


        const span =
            elemento.querySelector(
                ".status-text"
            ) ||
            elemento.querySelector(
                "span"
            );


        if (span) {

            span.textContent =
                texto;

        } else {

            elemento.textContent =
                texto;

        }

    }


    /* =====================================================
       AVATAR
       ===================================================== */

    function preencherAvatar(
        artista,
        perfil,
        nome
    ) {

        const container =
            obterElemento(
                CONFIG.elementos.avatar
            );


        const iniciais =
            obterElemento(
                CONFIG.elementos.iniciais
            );


        if (!container) {

            aviso(
                "Elemento #profileAvatar não encontrado."
            );

            return;

        }


        let imagem =
            container.querySelector(
                "img.profile-avatar-image"
            );


        if (!imagem) {

            imagem =
                document.createElement(
                    "img"
                );

            imagem.className =
                "profile-avatar-image";

            imagem.alt =
                `Foto de perfil de ${nome || "artista"}`;

            container.appendChild(
                imagem
            );

        } else {

            imagem.alt =
                `Foto de perfil de ${nome || "artista"}`;

        }


        const url =
            obterPrimeiroValor(

                artista?.foto_url,

                artista?.avatar_url,

                artista?.foto,

                artista?.avatar,

                perfil?.foto_url,

                perfil?.avatar_url,

                estado.usuario?.foto_url,

                estado.usuario?.avatar_url,

                estado.usuario?.foto,

                estado.usuario?.avatar

            );


        if (iniciais) {

            iniciais.textContent =
                obterIniciais(
                    nome
                );

            iniciais.style.display =
                "none";

            iniciais.hidden =
                true;

        }


        if (!url) {

            imagem.removeAttribute(
                "src"
            );

            imagem.style.display =
                "none";

            imagem.hidden =
                true;


            if (iniciais) {

                iniciais.textContent =
                    obterIniciais(
                        nome
                    );

                iniciais.style.display =
                    "flex";

                iniciais.hidden =
                    false;

            }


            return;

        }


        container.hidden =
            false;

        container.style.display =
            "";


        imagem.hidden =
            false;

        imagem.style.display =
            "block";


        imagem.onload =
            function () {

                imagem.hidden =
                    false;

                imagem.style.display =
                    "block";


                if (iniciais) {

                    iniciais.style.display =
                        "none";

                    iniciais.hidden =
                        true;

                }

            };


        imagem.onerror =
            function () {

                erro(
                    "Não foi possível carregar a imagem do avatar:",
                    imagem.src
                );


                imagem.style.display =
                    "none";

                imagem.hidden =
                    true;


                if (iniciais) {

                    iniciais.textContent =
                        obterIniciais(
                            nome
                        );

                    iniciais.style.display =
                        "flex";

                    iniciais.hidden =
                        false;

                }

            };


        imagem.src =
            String(url);


        if (
            imagem.complete &&
            imagem.naturalWidth > 0
        ) {

            imagem.hidden =
                false;

            imagem.style.display =
                "block";


            if (iniciais) {

                iniciais.style.display =
                    "none";

                iniciais.hidden =
                    true;

            }

        }

    }


    /* =====================================================
       FOTO DO USUÁRIO
       ===================================================== */

    function usuarioFoto() {

        return obterPrimeiroValor(

            estado.usuario?.foto_url,

            estado.usuario?.avatar_url,

            estado.usuario?.foto,

            estado.usuario?.avatar

        );

    }


    /* =====================================================
       INICIAIS
       ===================================================== */

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
            String(nome || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {

            return "A";

        }


        if (partes.length === 1) {

            return partes[0]
                .substring(
                    0,
                    2
                )
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
       AVALIAÇÃO DO CABEÇALHO
       ===================================================== */

    function preencherAvaliacao() {

        let nota =
            0;


        let quantidade =
            0;


        if (
            Array.isArray(
                estado.avaliacoes
            ) &&
            estado.avaliacoes.length
        ) {

            const notas =
                estado.avaliacoes
                    .map(
                        avaliacao =>
                            Number(
                                obterPrimeiroValor(

                                    avaliacao.nota,

                                    avaliacao.rating,

                                    avaliacao.avaliacao,

                                    0

                                )
                            )
                    )
                    .filter(
                        numero =>
                            Number.isFinite(numero) &&
                            numero > 0
                    );


            if (notas.length) {

                nota =
                    notas.reduce(
                        (
                            total,
                            valor
                        ) =>
                            total + valor,
                        0
                    ) /
                    notas.length;


                quantidade =
                    notas.length;

            }

        }


        const notaPerfil =
            obterPrimeiroValor(

                estado.perfilArtista?.avaliacao_media,

                estado.perfilArtista?.media_avaliacao,

                estado.perfil?.avaliacao_media,

                estado.perfil?.media_avaliacao

            );


        if (
            !nota &&
            notaPerfil !== ""
        ) {

            const numero =
                Number(
                    notaPerfil
                );


            if (
                Number.isFinite(numero) &&
                numero > 0
            ) {

                nota =
                    numero;

            }

        }


        const quantidadePerfil =
            obterPrimeiroValor(

                estado.perfilArtista?.quantidade_avaliacoes,

                estado.perfilArtista?.total_avaliacoes,

                estado.perfil?.quantidade_avaliacoes,

                estado.perfil?.total_avaliacoes

            );


        if (
            !quantidade &&
            quantidadePerfil !== ""
        ) {

            const numero =
                Number(
                    quantidadePerfil
                );


            if (
                Number.isFinite(numero) &&
                numero >= 0
            ) {

                quantidade =
                    numero;

            }

        }


        const notaFormatada =
            nota > 0
                ? nota
                    .toFixed(1)
                    .replace(
                        ".",
                        ","
                    )
                : "0,0";


        definirTexto(
            CONFIG.elementos.avaliacaoValor,
            notaFormatada,
            "0,0"
        );


        definirTexto(
            CONFIG.elementos.avaliacaoAvaliacoes,

            quantidade === 1
                ? "(1 avaliação)"
                : `(${quantidade} avaliações)`,

            "(0 avaliações)"

        );

    }


    /* =====================================================
       GÊNEROS / ESTILOS / ESPECIALIDADES
       ===================================================== */

    function preencherGeneros(
        artista
    ) {

        const container =
            obterElemento(
                CONFIG.elementos.generos
            );


        if (!container) {
            return;
        }


        const generos =
            obterPrimeiroValor(

                artista.generos,

                artista.generos_musicais,

                artista.estilos,

                artista.estilos_musicais,

                artista.especialidades,

                artista.areas_atuacao,

                estado.perfil?.generos,

                estado.perfil?.estilos,

                estado.perfil?.especialidades

            );


        const lista =
            normalizarLista(
                generos
            );


        if (!lista.length) {

            container.innerHTML = `

                <span class="empty-inline">
                    Nenhuma informação cadastrada.
                </span>

            `;


            return;

        }


        container.innerHTML =
            lista
                .map(
                    item => `

                        <span class="genre-tag">
                            ${escaparHtml(
                                item
                            )}
                        </span>

                    `
                )
                .join("");


        renderizarIcones();

    }


    /* =====================================================
       INSTRUMENTOS
       ===================================================== */

    function preencherInstrumentos(
        artista
    ) {

        const container =
            obterElemento(
                CONFIG.elementos.instrumentos
            );


        const section =
            obterElemento(
                CONFIG.elementos.instrumentosSection
            );


        if (!container) {

            return;

        }


        let instrumentos =
            artista?.instrumentos;


        if (
            typeof instrumentos === "string"
        ) {

            const texto =
                instrumentos.trim();


            if (
                texto.startsWith("[") &&
                texto.endsWith("]")
            ) {

                try {

                    instrumentos =
                        JSON.parse(
                            texto
                        );

                } catch (error) {

                    aviso(
                        "Não foi possível interpretar os instrumentos como JSON.",
                        error
                    );

                }

            }

        }


        const lista =
            normalizarLista(
                instrumentos
            );


        const instrumentosUnicos = [
            ...new Set(

                lista
                    .map(
                        item =>
                            String(item).trim()
                    )
                    .filter(Boolean)

            )
        ];


        /*
         * Sem instrumentos:
         * esconde completamente a seção.
         */

        if (!instrumentosUnicos.length) {

            container.innerHTML =
                "";


            if (section) {

                section.style.display =
                    "none";

                section.hidden =
                    true;

            }


            return;

        }


        /*
         * Com instrumentos:
         * mostra a seção.
         */

        if (section) {

            section.style.display =
                "";

            section.hidden =
                false;

        }


        container.innerHTML =
            instrumentosUnicos
                .map(
                    instrumento => `

                        <span class="genre-tag">
                            ${escaparHtml(
                                instrumento
                            )}
                        </span>

                    `
                )
                .join("");


        renderizarIcones();

    }


    /* =====================================================
       SERVIÇOS
       ===================================================== */

    function preencherServicos() {

        const servicos =
            Array.isArray(
                estado.servicos
            )
                ? estado.servicos
                : [];


        if (
            Servicos &&
            typeof Servicos.renderizar === "function"
        ) {

            Servicos.renderizar(
                servicos
            );


            return;

        }


        const container =
            obterElemento(
                CONFIG.elementos.servicos
            );


        if (!container) {
            return;
        }


        if (!servicos.length) {

            container.innerHTML = `

                <span class="empty-inline">
                    Nenhum serviço informado.
                </span>

            `;


            return;

        }


        container.innerHTML =
            servicos
                .map(
                    servico => {

                        const nome =
                            obterPrimeiroValor(

                                servico?.nome,

                                servico?.titulo,

                                servico?.nome_servico,

                                servico?.nomeServico,

                                servico?.servico,

                                "Serviço"

                            );


                        return `

                            <span class="service-tag">
                                ${escaparHtml(
                                    nome
                                )}
                            </span>

                        `;

                    }
                )
                .join("");


        renderizarIcones();

    }


    /* =====================================================
       CARREGAR SERVIÇOS
       ===================================================== */

    async function carregarServicos() {

        if (!Dados) {
            return;
        }


        if (
            typeof Dados.carregarSomenteServicos === "function"
        ) {

            await Dados.carregarSomenteServicos();

        } else if (
            typeof Dados.carregarServicos === "function"
        ) {

            await Dados.carregarServicos();

        }


        estado.servicos =
            obterEstadoArray(
                "obterServicos",
                estado.servicos
            );


        preencherServicos();


        renderizarIcones();

    }


    /* =====================================================
       NORMALIZAR LISTA
       ===================================================== */

    function normalizarLista(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.normalizarArray === "function"
        ) {

            const resultado =
                Utils.normalizarArray(
                    valor
                );


            return Array.isArray(resultado)
                ? resultado
                : [];

        }


        if (
            Array.isArray(valor)
        ) {

            return valor
                .map(
                    item => {

                        if (
                            item &&
                            typeof item === "object"
                        ) {

                            return obterPrimeiroValor(

                                item.nome,

                                item.titulo,

                                item.descricao,

                                item.valor

                            );

                        }


                        return item;

                    }
                )
                .filter(
                    item =>
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== ""
                );

        }


        if (
            typeof valor === "string"
        ) {

            const texto =
                valor.trim();


            /*
             * Tenta interpretar JSON quando
             * o banco retornar uma string JSON.
             */

            if (
                texto.startsWith("[") &&
                texto.endsWith("]")
            ) {

                try {

                    return normalizarLista(
                        JSON.parse(
                            texto
                        )
                    );

                } catch (error) {

                    aviso(
                        "Não foi possível interpretar lista JSON.",
                        error
                    );

                }

            }


            return texto
                .split(",")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);

        }


        return [];

    }


    /* =====================================================
       DISPONIBILIDADE
       ===================================================== */

    function obterTextoDisponibilidade(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.obterTextoDisponibilidade === "function"
        ) {

            return Utils.obterTextoDisponibilidade(
                valor
            );

        }


        if (
            valor === true ||
            valor === "true" ||
            valor === 1 ||
            valor === "1"
        ) {

            return "Disponível";

        }


        if (
            valor === false ||
            valor === "false" ||
            valor === 0 ||
            valor === "0"
        ) {

            return "Indisponível";

        }


        return valor ||
            "Não informado";

    }


    /* =====================================================
       LINK DO PERFIL
       ===================================================== */

    function preencherLinkPerfil() {

        const elemento =
            obterElemento(
                CONFIG.elementos.linkPerfil
            );


        if (!elemento) {
            return;
        }


        const url =
            construirLinkPerfil();


        if (!url) {

            elemento.textContent =
                "Perfil ainda não disponível.";

            elemento.removeAttribute(
                "data-url"
            );

            return;

        }


        elemento.textContent =
            url;


        elemento.dataset.url =
            url;

    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        const voltar =
            obterElemento(
                CONFIG.botoes.voltar
            );


        const visualizar =
            obterElemento(
                CONFIG.botoes.visualizar
            );


        const editar =
            obterElemento(
                CONFIG.botoes.editar
            );


        const whatsapp =
            obterElemento(
                CONFIG.botoes.whatsapp
            );


        const qrCode =
            obterElemento(
                CONFIG.botoes.qrCode
            );


        const fecharQR =
            obterElemento(
                CONFIG.botoes.fecharQR
            );


        const compartilharQR =
            obterElemento(
                CONFIG.botoes.compartilharQR
            );


        const sacar =
            obterElemento(
                CONFIG.botoes.sacar
            );


        if (voltar) {

            voltar.addEventListener(
                "click",
                voltarPagina
            );

        }


        if (visualizar) {

            visualizar.addEventListener(
                "click",
                visualizarPerfil
            );

        }


        if (editar) {

            editar.addEventListener(
                "click",
                editarPerfil
            );

        }


        if (whatsapp) {

            whatsapp.addEventListener(
                "click",
                compartilharWhatsApp
            );

        }


        if (qrCode) {

            qrCode.addEventListener(
                "click",
                abrirQR
            );

        }


        if (fecharQR) {

            fecharQR.addEventListener(
                "click",
                fecharQRModal
            );

        }


        if (compartilharQR) {

            compartilharQR.addEventListener(
                "click",
                compartilharQRPerfil
            );

        }


        if (sacar) {

            sacar.addEventListener(
                "click",
                solicitarSaque
            );

        }


        document.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key === "Escape"
                ) {

                    fecharQRModal();

                }

            }
        );


        const overlay =
            obterElemento(
                CONFIG.modais.qr
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target === overlay
                    ) {

                        fecharQRModal();

                    }

                }
            );

        }

    }


    /* =====================================================
       CONFIGURAR ABAS
       ===================================================== */

    function configurarAbas() {

        const botoes =
            document.querySelectorAll(
                ".tab-button"
            );


        if (!botoes.length) {

            aviso(
                "Nenhum .tab-button encontrado."
            );


            return;

        }


        botoes.forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    async function () {

                        const nomeAba =
                            botao.dataset.tab;


                        if (!nomeAba) {

                            aviso(
                                "Botão de aba sem data-tab:",
                                botao
                            );


                            return;

                        }


                        await carregarAba(
                            nomeAba
                        );


                        ativarAba(
                            nomeAba
                        );

                    }
                );

            }
        );


        log(
            `${botoes.length} abas configuradas.`
        );

    }


    /* =====================================================
       ATIVAR ABA
       ===================================================== */

    function ativarAba(
        nomeAba,
        atualizarHash = true
    ) {

        const botoes =
            document.querySelectorAll(
                ".tab-button"
            );


        const conteudos =
            document.querySelectorAll(
                ".tab-content"
            );


        botoes.forEach(
            botao => {

                const ativa =
                    botao.dataset.tab ===
                    nomeAba;


                botao.classList.toggle(
                    "active",
                    ativa
                );


                botao.setAttribute(
                    "aria-selected",
                    ativa
                        ? "true"
                        : "false"
                );

            }
        );


        conteudos.forEach(
            conteudo => {

                const ativa =
                    conteudo.id ===
                    obterIdAba(
                        nomeAba
                    );


                conteudo.classList.toggle(
                    "active",
                    ativa
                );


                conteudo.hidden =
                    !ativa;

            }
        );


        estado.abaAtual =
            nomeAba;


        if (atualizarHash) {

            try {

                history.replaceState(
                    null,
                    "",
                    `#${nomeAba}`
                );

            } catch (error) {

                aviso(
                    "Não foi possível atualizar o hash da aba."
                );

            }

        }


        renderizarIcones();

    }


    /* =====================================================
       OBTER ID DA ABA
       ===================================================== */

    function obterIdAba(
        nomeAba
    ) {

        return (

            CONFIG.abas[nomeAba]?.id ||

            `tab-${nomeAba}`

        );

    }


    /* =====================================================
       CARREGAR ABA
       ===================================================== */

    async function carregarAba(
        nomeAba
    ) {

        if (
            !CONFIG.abas[nomeAba]
        ) {

            aviso(
                "Aba desconhecida:",
                nomeAba
            );


            return;

        }


        try {

            switch (
                nomeAba
            ) {

                case "sobre":

                    await carregarAbaSobre();

                    break;


                case "portfolio":

                    await carregarAbaPortfolio();

                    break;


                case "agenda":

                    await carregarAbaAgenda();

                    break;


                case "avaliacoes":

                    await carregarAbaAvaliacoes();

                    break;


                case "carteira":

                    await carregarAbaCarteira();

                    break;


                default:

                    aviso(
                        "Nenhum carregador definido para:",
                        nomeAba
                    );

                    break;

            }


            estado.abasCarregadas[
                nomeAba
            ] =
                true;


        } catch (error) {

            erro(
                `Erro ao carregar aba "${nomeAba}":`,
                error
            );


            mostrarToast(
                `Não foi possível carregar a aba ${nomeAba}.`,
                "erro"
            );

        }

    }


    /* =====================================================
       ABA SOBRE
       ===================================================== */

    async function carregarAbaSobre() {

        preencherInformacoesPerfil();


        if (
            Servicos &&
            typeof Servicos.renderizar === "function"
        ) {

            Servicos.renderizar(
                estado.servicos
            );

        } else if (
            !estado.servicos.length
        ) {

            await carregarServicos();

        }


        renderizarIcones();

    }


    /* =====================================================
       ABA PORTFÓLIO
       ===================================================== */

    async function carregarAbaPortfolio() {

        if (!Portfolio) {

            aviso(
                "PerfilPublicoPortfolio.js não foi carregado."
            );


            return;

        }


        let portfolio =
            estado.portfolio;


        if (
            !portfolio.length &&
            Dados &&
            typeof Dados.carregarSomentePortfolio === "function"
        ) {

            await Dados.carregarSomentePortfolio();


            portfolio =
                obterEstadoArray(
                    "obterPortfolio",
                    []
                );


            estado.portfolio =
                portfolio;

        }


        if (
            typeof Portfolio.renderizar === "function"
        ) {

            Portfolio.renderizar(
                portfolio
            );

        } else if (
            typeof Portfolio.inicializar === "function"
        ) {

            Portfolio.inicializar(
                portfolio
            );

        }


        renderizarIcones();

    }


    /* =====================================================
       ABA AGENDA
       ===================================================== */

    async function carregarAbaAgenda() {

        if (!Agenda) {

            aviso(
                "PerfilPublicoAgenda.js não foi carregado."
            );


            return;

        }


        let agenda =
            estado.agenda;


        if (
            !agenda.length &&
            Dados &&
            typeof Dados.carregarSomenteAgenda === "function"
        ) {

            await Dados.carregarSomenteAgenda();


            agenda =
                obterEstadoArray(
                    "obterAgenda",
                    []
                );


            estado.agenda =
                agenda;

        }


        if (
            typeof Agenda.renderizar === "function"
        ) {

            Agenda.renderizar(
                agenda
            );

        } else if (
            typeof Agenda.inicializar === "function"
        ) {

            Agenda.inicializar(
                agenda
            );

        }


        renderizarIcones();

    }


    /* =====================================================
       ABA AVALIAÇÕES
       ===================================================== */

    async function carregarAbaAvaliacoes() {

        if (!Avaliacoes) {

            aviso(
                "PerfilPublicoAvaliacoes.js não foi carregado."
            );


            return;

        }


        estado.avaliacoes =
            [];


        const dadosAvaliacoes = {

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
                []

        };


        if (
            typeof Avaliacoes.renderizar === "function"
        ) {

            Avaliacoes.renderizar(
                dadosAvaliacoes
            );

        } else if (
            typeof Avaliacoes.inicializar === "function"
        ) {

            Avaliacoes.inicializar(
                dadosAvaliacoes
            );

        }


        preencherAvaliacao();


        renderizarIcones();

    }


    /* =====================================================
       ABA CARTEIRA
       ===================================================== */

    async function carregarAbaCarteira() {

        if (
            Dados &&
            typeof Dados.carregarSomenteCarteira === "function"
        ) {

            if (
                !estado.carteira &&
                !estado.transacoes.length
            ) {

                await Dados.carregarSomenteCarteira();

            }

        }


        estado.carteira =
            obterEstadoDados(
                "obterCarteira",
                estado.carteira
            );


        estado.transacoes =
            obterEstadoArray(
                "obterTransacoes",
                estado.transacoes
            );


        preencherCarteira();


        renderizarTransacoes();


        renderizarIcones();

    }


    /* =====================================================
       PREENCHER CARTEIRA
       ===================================================== */

    function preencherCarteira() {

        const carteira =
            estado.carteira || {};


        const total =
            obterPrimeiroValor(

                carteira.saldo_total,

                carteira.total,

                carteira.saldo,

                carteira.valor_total,

                0

            );


        const disponivel =
            obterPrimeiroValor(

                carteira.saldo_disponivel,

                carteira.disponivel,

                carteira.valor_disponivel,

                0

            );


        const pendente =
            obterPrimeiroValor(

                carteira.saldo_pendente,

                carteira.pendente,

                carteira.valor_pendente,

                0

            );


        definirTexto(
            CONFIG.elementos.walletTotal,
            formatarMoeda(total),
            "R$ 0,00"
        );


        definirTexto(
            CONFIG.elementos.walletAvailable,
            formatarMoeda(disponivel),
            "R$ 0,00"
        );


        definirTexto(
            CONFIG.elementos.walletPending,
            formatarMoeda(pendente),
            "R$ 0,00"
        );

    }


    /* =====================================================
       RENDERIZAR TRANSAÇÕES
       ===================================================== */

    function renderizarTransacoes() {

        const container =
            obterElemento(
                CONFIG.elementos.transactionList
            );


        if (!container) {
            return;
        }


        if (
            !estado.transacoes.length
        ) {

            container.innerHTML = `

                <div class="empty-state">

                    <i
                        data-lucide="wallet"
                    ></i>

                    <p>
                        Nenhuma movimentação encontrada.
                    </p>

                </div>

            `;


            renderizarIcones();


            return;

        }


        container.innerHTML =
            estado.transacoes
                .map(
                    (
                        transacao,
                        indice
                    ) => {

                        const descricao =
                            obterPrimeiroValor(

                                transacao.descricao,

                                transacao.titulo,

                                transacao.nome,

                                transacao.tipo,

                                `Movimentação ${indice + 1}`

                            );


                        const valor =
                            obterPrimeiroValor(

                                transacao.valor,

                                transacao.valor_transacao,

                                transacao.amount,

                                0

                            );


                        const data =
                            obterPrimeiroValor(

                                transacao.created_at,

                                transacao.data,

                                transacao.data_transacao

                            );


                        const tipo =
                            obterPrimeiroValor(

                                transacao.tipo,

                                transacao.status,

                                "movimentação"

                            );


                        return `

                            <article class="transaction-item">

                                <div class="transaction-icon">

                                    <i
                                        data-lucide="arrow-down-left"
                                    ></i>

                                </div>


                                <div class="transaction-info">

                                    <strong>
                                        ${escaparHtml(
                                            descricao
                                        )}
                                    </strong>

                                    <span>
                                        ${escaparHtml(
                                            formatarData(
                                                data
                                            )
                                        )}
                                    </span>

                                </div>


                                <div class="transaction-value">

                                    <strong>
                                        ${escaparHtml(
                                            formatarMoeda(
                                                valor
                                            )
                                        )}
                                    </strong>

                                    <span>
                                        ${escaparHtml(
                                            tipo
                                        )}
                                    </span>

                                </div>

                            </article>

                        `;

                    }
                )
                .join("");


        renderizarIcones();

    }


    /* =====================================================
       FORMATAR MOEDA
       ===================================================== */

    function formatarMoeda(
        valor
    ) {

        if (
            Utils &&
            typeof Utils.formatarMoeda === "function"
        ) {

            return Utils.formatarMoeda(
                valor
            );

        }


        let numero;


        if (
            typeof valor === "number"
        ) {

            numero =
                valor;

        } else {

            numero =
                Number(
                    String(valor || 0)
                        .replace(
                            /\./g,
                            ""
                        )
                        .replace(
                            ",",
                            "."
                        )
                );

        }


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

    function formatarData(
        valor
    ) {

        if (!valor) {

            return "Data não informada";

        }


        if (
            Utils &&
            typeof Utils.formatarData === "function"
        ) {

            return Utils.formatarData(
                valor
            );

        }


        const data =
            new Date(
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
            "pt-BR"
        );

    }


    /* =====================================================
       VOLTAR
       ===================================================== */

    function voltarPagina() {

        if (
            window.history.length > 1
        ) {

            window.history.back();

            return;

        }


        window.location.href =
            "index.html";

    }


    /* =====================================================
       VISUALIZAR PERFIL
       ===================================================== */

    function visualizarPerfil() {

        const id =
            estado.perfilId;


        if (!id) {

            mostrarToast(
                "Perfil ainda não identificado.",
                "erro"
            );

            return;

        }


        const url =
            construirLinkPerfil();


        if (!url) {

            mostrarToast(
                "Não foi possível construir o endereço do perfil.",
                "erro"
            );

            return;

        }


        log(
            "Visualizando perfil público universal:",
            {

                tipo:
                    obterTipoPerfilAtual(),

                perfilId:
                    id,

                url

            }
        );


        window.location.href =
            url;

    }


    /* =====================================================
       EDITAR PERFIL
       ===================================================== */

    function editarPerfil() {

        const id =
            estado.perfilId;


        if (!id) {

            mostrarToast(
                "Perfil ainda não identificado.",
                "erro"
            );

            return;

        }


        const pagina =
            CONFIG.pagina.edicao;


        if (!pagina) {

            mostrarToast(
                "A página de edição não está disponível.",
                "erro"
            );

            return;

        }


        const url =
            construirLinkPagina(
                pagina
            );


        log(
            "Abrindo editor universal:",
            {

                tipo:
                    obterTipoPerfilAtual(),

                perfilId:
                    id,

                url

            }
        );


        window.location.href =
            url;

    }


    /* =====================================================
       OBTER TIPO DO PERFIL ATUAL
       ===================================================== */

    function obterTipoPerfilAtual() {

        const tipo =
            obterTipoBrutoPerfil();


        return normalizarTipoArtista(
            tipo
        );

    }


    /* =====================================================
       NORMALIZAR TIPO ARTISTA / PERFIL
       ===================================================== */

    function normalizarTipoArtista(
        valor
    ) {

        const valorExtraido =
            extrairValorTipo(
                valor
            );


        const texto =
            String(
                valorExtraido || ""
            )
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );


        const mapa = {

            /*
             * Genérico
             */

            "artista":
                "Artista",

            "artista musical":
                "Artista",


            /*
             * Cantor
             */

            "cantor":
                "Cantor(a)",

            "cantora":
                "Cantor(a)",

            "cantor(a)":
                "Cantor(a)",


            /*
             * Músico
             */

            "musico":
                "Músico(a)",

            "musica":
                "Músico(a)",

            "musico(a)":
                "Músico(a)",


            /*
             * Banda
             */

            "banda":
                "Banda",


            /*
             * Dupla
             */

            "dupla":
                "Dupla musical",

            "dupla musical":
                "Dupla musical",


            /*
             * DJ
             */

            "dj":
                "DJ",


            /*
             * Dançarino
             */

            "dancarino":
                "Dançarino(a)",

            "dancarina":
                "Dançarino(a)",

            "dancarino(a)":
                "Dançarino(a)",


            /*
             * Grupo de dança
             */

            "grupo de danca":
                "Grupo de dança",

            "grupo danca":
                "Grupo de dança",

            "grupo de dança":
                "Grupo de dança",

            "grupo_de_danca":
                "Grupo de dança",


            /*
             * MC
             */

            "mc":
                "MC",


            /*
             * Compositor
             */

            "compositor":
                "Compositor(a)",

            "compositora":
                "Compositor(a)",

            "compositor(a)":
                "Compositor(a)",


            /*
             * Produtor musical
             */

            "produtor":
                "Produtor(a) musical",

            "produtora":
                "Produtor(a) musical",

            "produtor musical":
                "Produtor(a) musical",

            "produtora musical":
                "Produtor(a) musical",

            "produtor(a) musical":
                "Produtor(a) musical",

            "produtor_musical":
                "Produtor(a) musical",


            /*
             * Contratante
             */

            "contratante":
                "Contratante"

        };


        return mapa[texto] ||
            valorExtraido ||
            CONFIG.pagina.tipoArtista;

    }


    /* =====================================================
       WHATSAPP
       ===================================================== */

    function compartilharWhatsApp() {

        const nome =
            obterPrimeiroValor(

                estado.perfilArtista?.nome_artistico,

                estado.perfilArtista?.nome,

                estado.perfil?.nome_exibicao,

                estado.usuario?.nome,

                "usuário"

            );


        const mensagem =
            "Olá! Vi seu perfil no MusicalWorld e gostaria de conversar com você sobre um possível trabalho.";


        const telefone =
            obterPrimeiroValor(

                estado.perfilArtista?.telefone,

                estado.perfilArtista?.whatsapp,

                estado.usuario?.telefone,

                estado.usuario?.whatsapp

            );


        if (!telefone) {

            mostrarToast(
                `O WhatsApp de ${nome} não está informado.`,
                "erro"
            );


            return;

        }


        const numero =
            String(
                telefone
            ).replace(
                /\D/g,
                ""
            );


        if (!numero) {

            mostrarToast(
                "Número de WhatsApp inválido.",
                "erro"
            );


            return;

        }


        const url =
            `https://wa.me/${numero}?text=${encodeURIComponent(
                mensagem
            )}`;


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    }


    /* =====================================================
       QR CODE
       ===================================================== */

    function abrirQR() {

        const overlay =
            obterElemento(
                CONFIG.modais.qr
            );


        if (!overlay) {

            aviso(
                "Modal QR não encontrado."
            );


            return;

        }


        const link =
            construirLinkPerfil();


        if (!link) {

            mostrarToast(
                "Não foi possível gerar o link do perfil.",
                "erro"
            );

            return;

        }


        const imagem =
            obterElemento(
                CONFIG.elementos.qrImagem
            );


        if (imagem) {

            imagem.src =
                `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    link
                )}`;

        }


        const campoLink =
            obterElemento(
                CONFIG.elementos.linkPerfil
            );


        if (campoLink) {

            campoLink.textContent =
                link;


            campoLink.dataset.url =
                link;

        }


        overlay.classList.add(
            "active"
        );


        overlay.removeAttribute(
            "hidden"
        );


        overlay.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );


        renderizarIcones();

    }


    /* =====================================================
       OBTER PÁGINA DE APRESENTAÇÃO
       ===================================================== */

    function obterPaginaApresentacao() {

        return CONFIG.pagina.apresentacao || "";

    }


    /* =====================================================
       OBTER PÁGINA DE PERFIL PÚBLICO
       ===================================================== */

    function obterPaginaPerfilPublico() {

        return obterPaginaApresentacao();

    }


    /* =====================================================
       OBTER PÁGINA DE EDIÇÃO
       ===================================================== */

    function obterPaginaEdicao() {

        return CONFIG.pagina.edicao || "";

    }


    /* =====================================================
       CONSTRUIR LINK DA PÁGINA
       ===================================================== */

    function construirLinkPagina(
        pagina
    ) {

        if (!pagina) {

            return "";

        }


        /*
         * Mantém o comportamento correto tanto quando
         * a página é aberta no servidor local quanto
         * quando estiver hospedada.
         */

        const diretorio =
            window.location.pathname.replace(
                /[^/]*$/,
                ""
            );


        return (
            `${window.location.origin}` +
            `${diretorio}` +
            `${pagina}`
        );

    }


    /* =====================================================
       CONSTRUIR LINK DO PERFIL
       ===================================================== */

    function construirLinkPerfil() {

        const id =
            estado.perfilId || "";


        const pagina =
            obterPaginaApresentacao();


        if (!id) {

            aviso(
                "Não foi possível construir o link: perfil sem ID."
            );


            return "";

        }


        if (!pagina) {

            aviso(
                "Página pública universal não encontrada."
            );


            return "";

        }


        const base =
            construirLinkPagina(
                pagina
            );


        if (!base) {

            return "";

        }


        const separador =
            base.includes("?")
                ? "&"
                : "?";


        const url =
            `${base}${separador}id=${encodeURIComponent(
                id
            )}`;


        log(
            "Link de perfil público universal:",
            url
        );


        return url;

    }


    /* =====================================================
       FECHAR QR
       ===================================================== */

    function fecharQRModal() {

        const overlay =
            obterElemento(
                CONFIG.modais.qr
            );


        if (!overlay) {
            return;
        }


        overlay.classList.remove(
            "active"
        );


        overlay.setAttribute(
            "hidden",
            ""
        );


        overlay.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       COMPARTILHAR QR
       ===================================================== */

    async function compartilharQRPerfil() {

        const link =
            construirLinkPerfil();


        if (!link) {

            mostrarToast(
                "Não foi possível compartilhar o perfil.",
                "erro"
            );

            return;

        }


        try {

            if (
                navigator.share
            ) {

                await navigator.share({

                    title:
                        "Meu perfil no MusicalWorld",

                    text:
                        "Confira meu perfil no MusicalWorld.",

                    url:
                        link

                });


                return;

            }


            if (
                navigator.clipboard
            ) {

                await navigator.clipboard.writeText(
                    link
                );


                mostrarToast(
                    "Link do perfil copiado.",
                    "sucesso"
                );


                return;

            }


            mostrarToast(
                "Não foi possível compartilhar o link.",
                "erro"
            );


        } catch (error) {

            if (
                error?.name === "AbortError"
            ) {

                return;

            }


            erro(
                "Erro ao compartilhar QR:",
                error
            );

        }

    }


    /* =====================================================
       SOLICITAR SAQUE
       ===================================================== */

    function solicitarSaque() {

        mostrarToast(
            "A função de saque será disponibilizada em breve.",
            "sucesso"
        );

    }


    /* =====================================================
       TOAST
       ===================================================== */

    function mostrarToast(
        mensagem,
        tipo = "sucesso"
    ) {

        if (
            Utils &&
            typeof Utils.mostrarToast === "function"
        ) {

            Utils.mostrarToast(
                mensagem,
                tipo
            );


            return;

        }


        const toast =
            obterElemento(
                CONFIG.toast.elemento
            );


        const toastMessage =
            obterElemento(
                CONFIG.toast.mensagem
            );


        if (!toast) {
            return;
        }


        if (toastMessage) {

            toastMessage.textContent =
                mensagem;

        }


        toast.classList.remove(
            "show",
            "sucesso",
            "erro"
        );


        toast.classList.add(
            tipo,
            "show"
        );


        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

    }


    /* =====================================================
       ESCAPAR HTML
       ===================================================== */

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


    /* =====================================================
       RENDERIZAR ÍCONES
       ===================================================== */

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


    /* =====================================================
       OBTER ESTADO
       ===================================================== */

    function obterEstado() {

        return {

            ...estado,

            portfolio:
                [
                    ...estado.portfolio
                ],

            servicos:
                [
                    ...estado.servicos
                ],

            agenda:
                [
                    ...estado.agenda
                ],

            avaliacoes:
                [
                    ...estado.avaliacoes
                ],

            transacoes:
                [
                    ...estado.transacoes
                ]

        };

    }


    /* =====================================================
       RECARREGAR ABA ATUAL
       ===================================================== */

    async function recarregarAbaAtual() {

        estado.abasCarregadas[
            estado.abaAtual
        ] =
            false;


        await carregarAba(
            estado.abaAtual
        );


        ativarAba(
            estado.abaAtual,
            false
        );

    }


    /* =====================================================
       RECARREGAR TUDO
       ===================================================== */

    async function recarregar() {

        estado.abasCarregadas = {

            sobre:
                false,

            portfolio:
                false,

            agenda:
                false,

            avaliacoes:
                false,

            carteira:
                false

        };


        await carregarDados();


        preencherInformacoesPerfil();


        await carregarAba(
            estado.abaAtual
        );


        ativarAba(
            estado.abaAtual,
            false
        );


        renderizarIcones();

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    const PerfilPublico = {

        CONFIG,

        estado,

        inicializar,

        carregarDados,

        carregarAba,

        carregarServicos,

        ativarAba,

        recarregarAbaAtual,

        recarregar,

        obterEstado,

        preencherInformacoesPerfil,

        preencherAvaliacao,

        preencherCarteira,

        renderizarTransacoes,

        preencherServicos,

        preencherInstrumentos,

        obterTipoPerfilAtual,

        normalizarTipoArtista,

        obterPaginaApresentacao,

        obterPaginaPerfilPublico,

        obterPaginaEdicao,

        construirLinkPerfil,

        construirLinkPagina,

        visualizarPerfil,

        editarPerfil

    };


    /* =====================================================
       DISPONIBILIZAR GLOBALMENTE
       ===================================================== */

    window.PerfilPublico =
        PerfilPublico;


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ===================================================== */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar,
            {
                once:
                    true
            }
        );


    } else {

        inicializar();

    }


    console.log(
        "PerfilPublico.js — Meu Perfil universal carregado."
    );

})(window);