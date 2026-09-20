/* =========================================================
   MUSICALWORLD — RENDERIZAÇÃO DO MEU PERFIL

   Arquivo:
   js/perfil-publico/PerfilPublicoRender.js

   Responsabilidade:

   - Renderizar os dados do perfil na interface.
   - Controlar a apresentação visual de artista e contratante.
   - Preencher nome, localização, avaliação e avatar.
   - Preencher informações profissionais do artista.
   - Renderizar gêneros, instrumentos e serviços.
   - Esconder informações exclusivas de artista quando
     o perfil pertence a um contratante.
   - Limpar informações de artista quando necessário.

   IMPORTANTE:

   Este arquivo NÃO consulta Supabase.

   O carregamento dos dados pertence ao:
   js/perfil-publico/PerfilPublicoDados.js

   O controle do fluxo pertence ao:
   js/perfil-publico/PerfilPublico.js

   Fluxo:

   PerfilPublicoDados
          ↓
   PerfilPublico.js
          ↓
   PerfilPublicoRender
          ↓
       DOM
   ========================================================= */


(function (window) {

    "use strict";


    /* =====================================================
       DEPENDÊNCIAS
       ===================================================== */

    const Utils =
        window.PerfilPublicoUtils;


    const Dados =
        window.PerfilPublicoDados;


    const Servicos =
        window.PerfilPublicoServicos;


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        elementos: {

            nome:
                "profileName",

            categoria:
                "profileCategory",

            topbarSubtitle:
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
                "servicesList"

        }

    };


    /* =====================================================
       LOG
       ===================================================== */

    function log(...mensagens) {

        console.log(
            "[PerfilPublicoRender]",
            ...mensagens
        );

    }


    function aviso(...mensagens) {

        console.warn(
            "[PerfilPublicoRender]",
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


        return document.getElementById(
            id
        );

    }


    /* =====================================================
       TEXTO
       ===================================================== */

    function definirTexto(
        id,
        valor,
        padrao = ""
    ) {

        const elemento =
            obterElemento(
                id
            );


        if (!elemento) {
            return;
        }


        const texto =
            valor !== null &&
            valor !== undefined &&
            String(
                valor
            ).trim() !== ""
                ? String(
                    valor
                )
                : padrao;


        elemento.textContent =
            texto;

    }


    /* =====================================================
       PRIMEIRO VALOR
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
                String(
                    valor
                ).trim() !== ""
            ) {

                return valor;

            }

        }


        return "";

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


    /* =====================================================
       ÍCONES
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
       VISIBILIDADE
       ===================================================== */

    function definirVisibilidade(
        elemento,
        visivel
    ) {

        if (!elemento) {
            return;
        }


        elemento.hidden =
            !visivel;


        elemento.style.display =
            visivel
                ? ""
                : "none";

    }


    function definirVisibilidadeSecao(
        id,
        visivel
    ) {

        const elemento =
            obterElemento(
                id
            );


        if (!elemento) {
            return;
        }


        definirVisibilidade(
            elemento,
            visivel
        );


        /*
         * Quando o elemento representa apenas um campo
         * dentro de uma estrutura maior, também tentamos
         * controlar seu container.
         */

        if (!visivel) {

            const container =
                elemento.closest(
                    ".profile-info-item, .info-item, .profile-field, .field-group, .detail-item"
                );


            if (
                container &&
                container !== elemento
            ) {

                container.hidden =
                    true;

                container.style.display =
                    "none";

            }

        }

    }


    function restaurarContainer(
        id
    ) {

        const elemento =
            obterElemento(
                id
            );


        if (!elemento) {
            return;
        }


        const container =
            elemento.closest(
                ".profile-info-item, .info-item, .profile-field, .field-group, .detail-item"
            );


        if (
            container &&
            container !== elemento
        ) {

            container.hidden =
                false;

            container.style.display =
                "";

        }

    }


    /* =====================================================
       NORMALIZAÇÃO DE LISTA
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


            return Array.isArray(
                resultado
            )
                ? resultado
                : [];

        }


        if (
            Array.isArray(
                valor
            )
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
                        String(
                            item
                        ).trim() !== ""
                );

        }


        if (
            typeof valor === "string"
        ) {

            const texto =
                valor.trim();


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
       TIPO DE PERFIL
       ===================================================== */

    function normalizarTipoPerfil(
        valor
    ) {

        if (
            Dados &&
            typeof Dados.normalizarTipoPerfil === "function"
        ) {

            return Dados.normalizarTipoPerfil(
                valor
            );

        }


        const texto =
            String(
                valor || ""
            )
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .trim()
                .toLowerCase();


        if (
            texto === "artista" ||
            texto === "artistas"
        ) {

            return "artista";

        }


        if (
            texto === "contratante" ||
            texto === "contratantes" ||
            texto === "cliente" ||
            texto === "clientes"
        ) {

            return "contratante";

        }


        return "";

    }


    function obterTipoPerfil(
        estado
    ) {

        if (
            Dados &&
            typeof Dados.obterTipoPerfil === "function"
        ) {

            const tipo =
                Dados.obterTipoPerfil();


            const normalizado =
                normalizarTipoPerfil(
                    tipo
                );


            if (normalizado) {
                return normalizado;
            }

        }


        const perfil =
            estado?.perfil || {};


        const relacionamento =
            perfil.tipos_perfil;


        let tipo =
            relacionamento;


        if (
            Array.isArray(
                relacionamento
            )
        ) {

            tipo =
                relacionamento[0];

        }


        if (
            tipo &&
            typeof tipo === "object"
        ) {

            tipo =
                obterPrimeiroValor(
                    tipo.nome,
                    tipo.tipo,
                    tipo.valor
                );

        }


        return normalizarTipoPerfil(

            tipo ||

            perfil.tipoPerfil ||

            perfil.tipo_perfil ||

            perfil.tipo

        );

    }


    function ehArtista(
        estado
    ) {

        if (
            Dados &&
            typeof Dados.ehArtista === "function"
        ) {

            return Dados.ehArtista();

        }


        return (
            obterTipoPerfil(
                estado
            ) ===
            "artista"
        );

    }


    function ehContratante(
        estado
    ) {

        if (
            Dados &&
            typeof Dados.ehContratante === "function"
        ) {

            return Dados.ehContratante();

        }


        return (
            obterTipoPerfil(
                estado
            ) ===
            "contratante"
        );

    }


    /* =====================================================
       TIPO DO ARTISTA
       ===================================================== */

    function normalizarTipoArtista(
        valor
    ) {

        if (!valor) {
            return "";
        }


        const texto =
            String(
                valor
            )
                .trim();


        const mapa = {

            "cantor":
                "Cantor(a)",

            "cantora":
                "Cantor(a)",

            "cantor(a)":
                "Cantor(a)",

            "musico":
                "Músico(a)",

            "musica":
                "Músico(a)",

            "músico":
                "Músico(a)",

            "música":
                "Músico(a)",

            "musico(a)":
                "Músico(a)",

            "músico(a)":
                "Músico(a)",

            "banda":
                "Banda",

            "dupla":
                "Dupla musical",

            "dupla musical":
                "Dupla musical",

            "dj":
                "DJ",

            "dancarino":
                "Dançarino(a)",

            "dançarino":
                "Dançarino(a)",

            "dançarina":
                "Dançarino(a)",

            "dançarino(a)":
                "Dançarino(a)",

            "grupo de danca":
                "Grupo de dança",

            "grupo de dança":
                "Grupo de dança",

            "mc":
                "MC",

            "compositor":
                "Compositor(a)",

            "compositora":
                "Compositor(a)",

            "compositor(a)":
                "Compositor(a)",

            "produtor":
                "Produtor(a) musical",

            "produtora":
                "Produtor(a) musical",

            "produtor musical":
                "Produtor(a) musical",

            "produtora musical":
                "Produtor(a) musical"

        };


        const chave =
            texto
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase();


        return mapa[chave] ||
            texto;

    }


    function obterTipoArtista(
        estado
    ) {

        if (
            !ehArtista(
                estado
            )
        ) {

            return "";

        }


        const artista =
            estado?.perfilArtista ||
            {};


        return normalizarTipoArtista(

            obterPrimeiroValor(

                artista.tipo_artista,

                artista.tipoArtista,

                artista.tipo

            )

        );

    }


    /* =====================================================
       NOME
       ===================================================== */

    function obterNome(
        estado
    ) {

        const usuario =
            estado?.usuario || {};


        const perfil =
            estado?.perfil || {};


        const artista =
            estado?.perfilArtista || {};


        return obterPrimeiroValor(

            perfil.nome_exibicao,

            artista.nome_artistico,

            artista.nomeArtistico,

            artista.nome,

            perfil.nome_artistico,

            perfil.nome,

            usuario.nome,

            usuario.nome_completo,

            "Usuário"

        );

    }


    /* =====================================================
       LOCALIZAÇÃO
       ===================================================== */

    function obterLocalizacao(
        estado
    ) {

        const perfil =
            estado?.perfil || {};


        const artista =
            estado?.perfilArtista || {};


        const usuario =
            estado?.usuario || {};


        return obterPrimeiroValor(

            artista.localizacao,

            artista.localizacao_texto,

            artista.cidade,

            perfil.localizacao,

            perfil.cidade,

            usuario.cidade

        );

    }


    /* =====================================================
       PREENCHER NOME E CATEGORIA
       ===================================================== */

    function preencherNome(
        estado
    ) {

        const nome =
            obterNome(
                estado
            );


        definirTexto(
            CONFIG.elementos.nome,
            nome,
            "Usuário"
        );


        const artista =
            ehArtista(
                estado
            );


        const tipoArtista =
            obterTipoArtista(
                estado
            );


        const categoria =
            obterElemento(
                CONFIG.elementos.categoria
            );


        if (categoria) {

            if (artista) {

                categoria.textContent =
                    tipoArtista ||
                    "Artista";


                definirVisibilidade(
                    categoria,
                    true
                );


                restaurarContainer(
                    CONFIG.elementos.categoria
                );

            } else {

                categoria.textContent =
                    "";


                definirVisibilidade(
                    categoria,
                    false
                );

            }

        }


        const subtitulo =
            obterElemento(
                CONFIG.elementos.topbarSubtitle
            );


        if (subtitulo) {

            subtitulo.textContent =
                artista
                    ? (
                        tipoArtista ||
                        "Artista"
                    )
                    : "Contratante";


            definirVisibilidade(
                subtitulo,
                true
            );

        }

    }


    /* =====================================================
       LOCALIZAÇÃO
       ===================================================== */

    function preencherLocalizacao(
        estado
    ) {

        const localizacao =
            obterLocalizacao(
                estado
            );


        definirTexto(
            CONFIG.elementos.localizacao,
            localizacao,
            "Localização não informada"
        );


        definirVisibilidadeSecao(

            CONFIG.elementos.localizacao,

            Boolean(
                localizacao
            )

        );


        if (localizacao) {

            restaurarContainer(
                CONFIG.elementos.localizacao
            );

        }

    }


    /* =====================================================
       SOBRE / BIO
       ===================================================== */

    function preencherBio(
        estado
    ) {

        const perfil =
            estado?.perfil || {};


        const artista =
            estado?.perfilArtista || {};


        const bio =
            obterPrimeiroValor(

                perfil.descricao,

                artista.descricao,

                artista.biografia,

                artista.bio,

                perfil.biografia,

                perfil.bio

            );


        definirTexto(
            CONFIG.elementos.bio,
            bio,
            "Nenhuma informação cadastrada."
        );


        restaurarContainer(
            CONFIG.elementos.bio
        );

    }


    /* =====================================================
       EXPERIÊNCIA
       ===================================================== */

    function preencherExperiencia(
        estado
    ) {

        if (
            !ehArtista(
                estado
            )
        ) {

            definirTexto(
                CONFIG.elementos.experiencia,
                ""
            );


            definirVisibilidadeSecao(
                CONFIG.elementos.experiencia,
                false
            );


            return;

        }


        const artista =
            estado?.perfilArtista || {};


        const perfil =
            estado?.perfil || {};


        const experiencia =
            obterPrimeiroValor(

                artista.experiencia,

                artista.tempo_experiencia,

                artista.anos_experiencia,

                perfil.experiencia

            );


        definirTexto(
            CONFIG.elementos.experiencia,
            experiencia,
            "Não informado"
        );


        restaurarContainer(
            CONFIG.elementos.experiencia
        );


        definirVisibilidadeSecao(
            CONFIG.elementos.experiencia,
            Boolean(
                experiencia
            )
        );

    }


    /* =====================================================
       ÁREA DE ATENDIMENTO
       ===================================================== */

    function preencherArea(
        estado
    ) {

        if (
            !ehArtista(
                estado
            )
        ) {

            definirTexto(
                CONFIG.elementos.area,
                ""
            );


            definirVisibilidadeSecao(
                CONFIG.elementos.area,
                false
            );


            return;

        }


        const artista =
            estado?.perfilArtista || {};


        const area =
            obterPrimeiroValor(

                artista.area_atendimento,

                artista.areaAtendimento,

                artista.area_atuacao,

                artista.areaAtuacao,

                artista.area

            );


        definirTexto(
            CONFIG.elementos.area,
            area,
            "Não informado"
        );


        restaurarContainer(
            CONFIG.elementos.area
        );


        definirVisibilidadeSecao(
            CONFIG.elementos.area,
            Boolean(
                area
            )
        );

    }


    /* =====================================================
       TIPO DE ARTISTA
       ===================================================== */

    function preencherTipoArtista(
        estado
    ) {

        if (
            !ehArtista(
                estado
            )
        ) {

            definirTexto(
                CONFIG.elementos.tipo,
                ""
            );


            definirVisibilidadeSecao(
                CONFIG.elementos.tipo,
                false
            );


            return;

        }


        const tipo =
            obterTipoArtista(
                estado
            );


        definirTexto(
            CONFIG.elementos.tipo,
            tipo,
            "Artista"
        );


        restaurarContainer(
            CONFIG.elementos.tipo
        );


        definirVisibilidadeSecao(
            CONFIG.elementos.tipo,
            Boolean(
                tipo
            )
        );

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


    function preencherStatus(
        estado
    ) {

        if (
            !ehArtista(
                estado
            )
        ) {

            definirTexto(
                CONFIG.elementos.status,
                ""
            );


            definirTexto(
                CONFIG.elementos.disponibilidade,
                ""
            );


            definirVisibilidadeSecao(
                CONFIG.elementos.status,
                false
            );


            definirVisibilidadeSecao(
                CONFIG.elementos.disponibilidade,
                false
            );


            return;

        }


        const artista =
            estado?.perfilArtista || {};


        const disponivel =
            obterPrimeiroValor(

                artista.disponivel,

                artista.disponibilidade,

                artista.status_disponibilidade

            );


        const texto =
            obterTextoDisponibilidade(
                disponivel
            );


        definirTexto(
            CONFIG.elementos.disponibilidade,
            texto,
            "Não informado"
        );


        definirTexto(
            CONFIG.elementos.status,
            texto,
            "Não informado"
        );


        restaurarContainer(
            CONFIG.elementos.disponibilidade
        );


        restaurarContainer(
            CONFIG.elementos.status
        );


        definirVisibilidadeSecao(
            CONFIG.elementos.disponibilidade,
            true
        );


        definirVisibilidadeSecao(
            CONFIG.elementos.status,
            true
        );

    }


    /* =====================================================
       AVATAR
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
            String(
                nome || ""
            )
                .trim()
                .split(
                    /\s+/
                )
                .filter(Boolean);


        if (!partes.length) {
            return "U";
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
            partes[0].charAt(0) +
            partes[
                partes.length - 1
            ].charAt(0)
        ).toUpperCase();

    }


    /*
     * Obtém a URL da foto respeitando a diferença
     * entre artista e contratante.
     *
     * Artista:
     *   1. perfis_artistas
     *   2. perfis
     *   3. usuarios
     *
     * Contratante:
     *   1. perfis
     *   2. usuarios
     */
    function obterUrlAvatar(
        estado
    ) {

        const artista =
            estado?.perfilArtista || {};


        const perfil =
            estado?.perfil || {};


        const usuario =
            estado?.usuario || {};


        if (
            ehArtista(
                estado
            )
        ) {

            return obterPrimeiroValor(

                artista.foto_url,

                artista.avatar_url,

                artista.foto,

                perfil.foto_url,

                perfil.avatar_url,

                perfil.foto,

                usuario.foto_url,

                usuario.avatar_url,

                usuario.foto

            );

        }


        return obterPrimeiroValor(

            perfil.foto_url,

            perfil.avatar_url,

            perfil.foto,

            usuario.foto_url,

            usuario.avatar_url,

            usuario.foto

        );

    }


    function limparAvatar(
        avatar,
        iniciais,
        nome
    ) {

        if (avatar) {

            avatar.style.backgroundImage =
                "none";


            avatar.style.backgroundSize =
                "";


            avatar.style.backgroundPosition =
                "";


            avatar.style.backgroundRepeat =
                "";


            avatar.removeAttribute(
                "data-photo"
            );


            avatar.classList.remove(
                "has-photo"
            );


            avatar.classList.add(
                "has-initials"
            );

        }


        if (iniciais) {

            iniciais.textContent =
                obterIniciais(
                    nome
                );


            iniciais.hidden =
                false;


            iniciais.style.display =
                "";

        }

    }


    function aplicarAvatar(
        avatar,
        iniciais,
        url,
        nome
    ) {

        if (!avatar) {
            return;
        }


        const urlNormalizada =
            String(
                url || ""
            ).trim();


        if (!urlNormalizada) {

            limparAvatar(
                avatar,
                iniciais,
                nome
            );

            return;

        }


        /*
         * O elemento #profileAvatar é uma DIV.
         *
         * Portanto a foto não pode ser aplicada com:
         *
         * avatar.src = ...
         *
         * A imagem é aplicada como background.
         */

        avatar.style.backgroundImage =
            `url("${urlNormalizada.replace(
                /"/g,
                '\\"'
            )}")`;


        avatar.style.backgroundSize =
            "cover";


        avatar.style.backgroundPosition =
            "center";


        avatar.style.backgroundRepeat =
            "no-repeat";


        avatar.setAttribute(
            "data-photo",
            urlNormalizada
        );


        avatar.setAttribute(
            "aria-label",
            `Foto de ${nome}`
        );


        avatar.classList.remove(
            "has-initials"
        );


        avatar.classList.add(
            "has-photo"
        );


        /*
         * Testa a URL antes de esconder as iniciais.
         *
         * Se o arquivo não existir ou a URL estiver
         * inválida, voltamos automaticamente para as
         * iniciais.
         */

        const imagemTeste =
            new Image();


        imagemTeste.onload =
            function () {

                if (iniciais) {

                    iniciais.hidden =
                        true;

                    iniciais.style.display =
                        "none";

                }

            };


        imagemTeste.onerror =
            function () {

                aviso(
                    "Não foi possível carregar a foto do perfil.",
                    urlNormalizada
                );


                limparAvatar(
                    avatar,
                    iniciais,
                    nome
                );

            };


        imagemTeste.src =
            urlNormalizada;

    }


    function preencherAvatar(
        estado
    ) {

        const avatar =
            obterElemento(
                CONFIG.elementos.avatar
            );


        const iniciais =
            obterElemento(
                CONFIG.elementos.iniciais
            );


        if (
            !avatar &&
            !iniciais
        ) {

            return;

        }


        const nome =
            obterNome(
                estado
            );


        /*
         * Inicialização das iniciais.
         */

        if (iniciais) {

            iniciais.textContent =
                obterIniciais(
                    nome
                );

        }


        /*
         * Obtém a URL correta conforme o tipo
         * do perfil.
         */

        const foto =
            obterUrlAvatar(
                estado
            );


        log(
            "Avatar:",
            {
                nome,
                tipoPerfil:
                    obterTipoPerfil(
                        estado
                    ),
                foto:
                    foto || null
            }
        );


        /*
         * Caso não exista uma foto,
         * usamos as iniciais.
         */

        if (!foto) {

            limparAvatar(
                avatar,
                iniciais,
                nome
            );


            return;

        }


        /*
         * Aplica a foto na DIV do avatar.
         */

        aplicarAvatar(
            avatar,
            iniciais,
            foto,
            nome
        );

    }


    /* =====================================================
       AVALIAÇÃO
       ===================================================== */

    function preencherAvaliacao(
        estado
    ) {

        const avaliacoes =
            Array.isArray(
                estado?.avaliacoes
            )
                ? estado.avaliacoes
                : [];


        const notas =
            avaliacoes
                .map(
                    avaliacao => {

                        const valor =
                            obterPrimeiroValor(

                                avaliacao?.nota,

                                avaliacao?.rating,

                                avaliacao?.avaliacao,

                                avaliacao?.estrelas

                            );


                        const numero =
                            Number(
                                valor
                            );


                        return (
                            Number.isFinite(
                                numero
                            ) &&
                            numero >= 1 &&
                            numero <= 5
                        )
                            ? numero
                            : null;

                    }
                )
                .filter(
                    valor =>
                        valor !== null
                );


        let media =
            0;


        if (notas.length) {

            media =
                notas.reduce(
                    (
                        total,
                        nota
                    ) =>
                        total + nota,
                    0
                ) /
                notas.length;

        } else {

            const perfil =
                estado?.perfil || {};


            const artista =
                estado?.perfilArtista || {};


            const mediaPerfil =
                Number(
                    obterPrimeiroValor(

                        artista.avaliacao_media,

                        artista.media_avaliacao,

                        artista.avaliacaoMedia,

                        perfil.avaliacao_media,

                        perfil.media_avaliacao,

                        perfil.avaliacaoMedia,

                        0

                    )
                );


            if (
                Number.isFinite(
                    mediaPerfil
                ) &&
                mediaPerfil > 0
            ) {

                media =
                    mediaPerfil;

            }

        }


        const quantidade =
            avaliacoes.length ||
            Number(
                obterPrimeiroValor(

                    estado?.perfilArtista?.quantidade_avaliacoes,

                    estado?.perfilArtista?.total_avaliacoes,

                    estado?.perfil?.quantidade_avaliacoes,

                    estado?.perfil?.total_avaliacoes,

                    0

                )
            );


        const notaFormatada =
            media > 0
                ? media.toFixed(
                    1
                ).replace(
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


        const avaliacao =
            obterElemento(
                CONFIG.elementos.avaliacao
            );


        if (avaliacao) {

            avaliacao.setAttribute(
                "aria-label",
                media > 0
                    ? `Avaliação ${notaFormatada} de 5`
                    : "Sem avaliações"
            );

        }

    }


    /* =====================================================
       GÊNEROS
       ===================================================== */

    function limparGeneros() {

        const container =
            obterElemento(
                CONFIG.elementos.generos
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        definirVisibilidadeSecao(
            CONFIG.elementos.generos,
            false
        );

    }


    function preencherGeneros(
        estado
    ) {

        const container =
            obterElemento(
                CONFIG.elementos.generos
            );


        if (!container) {
            return;
        }


        if (
            !ehArtista(
                estado
            )
        ) {

            limparGeneros();

            return;

        }


        const artista =
            estado?.perfilArtista || {};


        const perfil =
            estado?.perfil || {};


        const generos =
            obterPrimeiroValor(

                artista.generos,

                artista.generos_musicais,

                artista.estilos,

                artista.estilos_musicais,

                artista.especialidades,

                artista.areas_atuacao,

                perfil.generos,

                perfil.estilos,

                perfil.especialidades

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


            restaurarContainer(
                CONFIG.elementos.generos
            );


            definirVisibilidadeSecao(
                CONFIG.elementos.generos,
                true
            );


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


        restaurarContainer(
            CONFIG.elementos.generos
        );


        definirVisibilidadeSecao(
            CONFIG.elementos.generos,
            true
        );


        renderizarIcones();

    }


    /* =====================================================
       INSTRUMENTOS
       ===================================================== */

    function limparInstrumentos() {

        const container =
            obterElemento(
                CONFIG.elementos.instrumentos
            );


        const section =
            obterElemento(
                CONFIG.elementos.instrumentosSection
            );


        if (container) {

            container.innerHTML =
                "";

        }


        if (section) {

            section.style.display =
                "none";

            section.hidden =
                true;

        }

    }


    function preencherInstrumentos(
        estado
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


        if (
            !ehArtista(
                estado
            )
        ) {

            limparInstrumentos();

            return;

        }


        const artista =
            estado?.perfilArtista || {};


        let instrumentos =
            artista.instrumentos;


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


        const instrumentosUnicos =
            [
                ...new Set(

                    lista
                        .map(
                            item =>
                                String(
                                    item
                                ).trim()
                        )
                        .filter(Boolean)

                )
            ];


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

    function limparServicos() {

        const container =
            obterElemento(
                CONFIG.elementos.servicos
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        definirVisibilidadeSecao(
            CONFIG.elementos.servicos,
            false
        );

    }


    function preencherServicos(
        estado
    ) {

        if (
            !ehArtista(
                estado
            )
        ) {

            limparServicos();

            return;

        }


        const servicos =
            Array.isArray(
                estado?.servicos
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
       APLICAR REGRAS DE PERFIL
       ===================================================== */

    function aplicarRegrasDePerfil(
        estado
    ) {

        const artista =
            ehArtista(
                estado
            );


        const contratante =
            ehContratante(
                estado
            );


        /*
         * Elementos exclusivos do artista.
         */

        const elementosArtista = [

            CONFIG.elementos.status,

            CONFIG.elementos.experiencia,

            CONFIG.elementos.area,

            CONFIG.elementos.tipo,

            CONFIG.elementos.disponibilidade,

            CONFIG.elementos.generos,

            CONFIG.elementos.instrumentosSection,

            CONFIG.elementos.servicos

        ];


        elementosArtista.forEach(
            id => {

                definirVisibilidadeSecao(
                    id,
                    artista
                );

            }
        );


        /*
         * Categoria:
         *
         * Artista → tipo do artista.
         * Contratante → oculto.
         */

        const categoria =
            obterElemento(
                CONFIG.elementos.categoria
            );


        if (categoria) {

            definirVisibilidade(
                categoria,
                artista
            );

        }


        /*
         * Contratante não deve manter nenhum
         * conteúdo específico de artista.
         */

        if (
            contratante ||
            !artista
        ) {

            limparGeneros();

            limparInstrumentos();

            limparServicos();


            definirTexto(
                CONFIG.elementos.status,
                ""
            );


            definirTexto(
                CONFIG.elementos.experiencia,
                ""
            );


            definirTexto(
                CONFIG.elementos.area,
                ""
            );


            definirTexto(
                CONFIG.elementos.tipo,
                ""
            );


            definirTexto(
                CONFIG.elementos.disponibilidade,
                ""
            );

        }


        /*
         * Artista:
         *
         * Os containers são restaurados para que
         * os dados preenchidos possam controlar
         * a visibilidade individualmente.
         */

        if (artista) {

            elementosArtista.forEach(
                id => {

                    restaurarContainer(
                        id
                    );

                }
            );

        }


        log(
            "Regras visuais aplicadas:",
            {
                tipoPerfil:
                    obterTipoPerfil(
                        estado
                    ),

                artista,

                contratante
            }
        );

    }


    /* =====================================================
       PREENCHER TODAS AS INFORMAÇÕES
       ===================================================== */

    function preencherInformacoes(
        estado
    ) {

        preencherNome(
            estado
        );


        preencherLocalizacao(
            estado
        );


        preencherBio(
            estado
        );


        preencherExperiencia(
            estado
        );


        preencherArea(
            estado
        );


        preencherTipoArtista(
            estado
        );


        preencherStatus(
            estado
        );


        preencherAvatar(
            estado
        );


        preencherAvaliacao(
            estado
        );


        preencherGeneros(
            estado
        );


        preencherInstrumentos(
            estado
        );


        preencherServicos(
            estado
        );


        aplicarRegrasDePerfil(
            estado
        );


        renderizarIcones();

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    const PerfilPublicoRender = {

        CONFIG,

        preencherInformacoes,

        preencherNome,

        preencherLocalizacao,

        preencherBio,

        preencherExperiencia,

        preencherArea,

        preencherTipoArtista,

        preencherStatus,

        preencherAvatar,

        preencherAvaliacao,

        preencherGeneros,

        preencherInstrumentos,

        preencherServicos,

        limparGeneros,

        limparInstrumentos,

        limparServicos,

        aplicarRegrasDePerfil,

        normalizarLista,

        normalizarTipoPerfil,

        normalizarTipoArtista,

        obterTipoPerfil,

        obterTipoArtista,

        ehArtista,

        ehContratante,

        renderizarIcones

    };


    /* =====================================================
       DISPONIBILIZAR GLOBALMENTE
       ===================================================== */

    window.PerfilPublicoRender =
        PerfilPublicoRender;


    console.log(
        "PerfilPublicoRender.js — renderizador universal carregado."
    );


})(window);