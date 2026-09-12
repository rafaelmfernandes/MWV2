(function (window) {

    "use strict";


    /* =========================================================
       MUSICALWORLD — PERFIL PÚBLICO
       Arquivo: ApresentarPerfilRender.js

       Responsabilidade:
       - Renderizar os dados do perfil público
       - Trabalhar com estado.dados
       - Utilizar os nomes reais das colunas do banco
       - Adaptar a apresentação para os tipos de perfil
       - Controlar a exibição das informações profissionais
       ========================================================= */


    const MODULO = "ApresentarPerfilRender";

    let estadoAtual = null;


    /* =========================================================
       UTILITÁRIOS
       ========================================================= */

    function valorValido(valor) {

        return valor !== null &&
               valor !== undefined &&
               String(valor).trim() !== "";

    }


    function texto(valor, fallback = "") {

        return valorValido(valor)
            ? String(valor).trim()
            : fallback;

    }


    function numero(valor, fallback = 0) {

        const n = Number(valor);

        return Number.isFinite(n)
            ? n
            : fallback;

    }


    /* =========================================================
       ARRAY SEGURO
       ========================================================= */

    function arraySeguro(valor) {

        /*
         * Supabase normalmente retorna colunas
         * PostgreSQL do tipo array diretamente como Array.
         */

        if (Array.isArray(valor)) {

            return valor
                .flat(Infinity)
                .map(item => String(item).trim())
                .filter(Boolean);

        }


        if (valor === null || valor === undefined) {
            return [];
        }


        if (typeof valor === "string") {

            const textoArray = valor.trim();


            if (!textoArray) {
                return [];
            }


            /*
             * JSON:
             *
             * ["Sertanejo","Gospel"]
             */

            if (
                textoArray.startsWith("[") &&
                textoArray.endsWith("]")
            ) {

                try {

                    const convertido = JSON.parse(
                        textoArray
                    );

                    if (Array.isArray(convertido)) {

                        return convertido
                            .flat(Infinity)
                            .map(item => String(item).trim())
                            .filter(Boolean);

                    }

                } catch (erro) {

                    console.warn(
                        `[${MODULO}] Não foi possível interpretar o array JSON:`,
                        erro
                    );

                }

            }


            /*
             * PostgreSQL:
             *
             * {Sertanejo,Gospel}
             */

            if (
                textoArray.startsWith("{") &&
                textoArray.endsWith("}")
            ) {

                const conteudo = textoArray
                    .slice(1, -1)
                    .trim();


                if (!conteudo) {
                    return [];
                }


                return conteudo
                    .split(",")
                    .map(item =>
                        item
                            .trim()
                            .replace(/^"(.*)"$/, "$1")
                            .replace(/\\"/g, '"')
                    )
                    .filter(Boolean);

            }


            /*
             * Texto simples:
             *
             * Sertanejo,Gospel
             */

            return textoArray
                .split(",")
                .map(item => item.trim())
                .filter(Boolean);

        }


        /*
         * Compatibilidade com objetos.
         */

        if (typeof valor === "object") {

            return Object.values(valor)
                .flat(Infinity)
                .map(item => String(item).trim())
                .filter(Boolean);

        }


        return [
            String(valor).trim()
        ].filter(Boolean);

    }


    function primeiroValor(...valores) {

        for (const valor of valores) {

            if (valorValido(valor)) {
                return valor;
            }

        }

        return "";

    }


    /* =========================================================
       ESTADO / DADOS
       ========================================================= */

    function obterDados(estado) {

        if (!estado) {
            return {};
        }


        /*
         * O estado pode vir neste formato:
         *
         * {
         *     dados: {
         *         usuario,
         *         perfil,
         *         perfilArtista,
         *         ...
         *     }
         * }
         *
         * ou diretamente:
         *
         * {
         *     usuario,
         *     perfil,
         *     perfilArtista,
         *     ...
         * }
         */

        if (
            estado.dados &&
            typeof estado.dados === "object"
        ) {

            return estado.dados;

        }


        return estado;

    }


    function obterUsuario(estado) {

        const dados = obterDados(estado);

        return dados.usuario ||
               dados.usuarios ||
               estado?.usuario ||
               estado?.usuarios ||
               {};

    }


    function obterPerfil(estado) {

        const dados = obterDados(estado);

        return dados.perfil ||
               estado?.perfil ||
               {};

    }


    function obterPerfilArtista(estado) {

        const dados = obterDados(estado);

        return dados.perfilArtista ||
               dados.perfil_artista ||
               estado?.perfilArtista ||
               estado?.perfil_artista ||
               {};

    }


    /* =========================================================
       TIPO DO PERFIL
       ========================================================= */

    function obterTipoPerfil(estado) {

        const dados = obterDados(estado);
        const perfil = obterPerfil(estado);
        const perfilArtista = obterPerfilArtista(estado);


        let tipo = primeiroValor(

            dados.tipoPerfil,
            dados.tipo_perfil,

            perfil.tipo_perfil_nome,
            perfil.tipo_perfil,

            perfilArtista.tipo_artista,

            estado?.tipoPerfil,
            estado?.tipo_perfil

        );


        if (
            tipo &&
            typeof tipo === "object"
        ) {

            tipo = primeiroValor(

                tipo.nome,
                tipo.tipo,
                tipo.descricao,
                tipo.slug

            );

        }


        return texto(
            tipo,
            ""
        );

    }


    function obterNomeTipo(estado) {

        const tipo = obterTipoPerfil(estado);


        if (
            window.ApresentarPerfilTipo &&
            typeof window.ApresentarPerfilTipo.obterNome === "function"
        ) {

            return window.ApresentarPerfilTipo.obterNome(
                tipo
            );

        }


        return texto(
            tipo,
            "Perfil"
        );

    }


    function obterCategoriaPerfil(estado) {

        const dados = obterDados(estado);
        const perfil = obterPerfil(estado);
        const perfilArtista = obterPerfilArtista(estado);


        const categoria = primeiroValor(

            dados.categoria,
            dados.categoriaPerfil,

            perfil.categoria,
            perfil.categoria_perfil,

            perfilArtista.categoria,

            estado?.categoria,
            estado?.categoriaPerfil

        );


        if (valorValido(categoria)) {

            return texto(categoria);

        }


        if (
            window.ApresentarPerfilTipo &&
            typeof window.ApresentarPerfilTipo.obterCategoria === "function"
        ) {

            return window.ApresentarPerfilTipo.obterCategoria(
                obterTipoPerfil(estado)
            );

        }


        return "Artista";

    }


    /* =========================================================
       ELEMENTOS DOM
       ========================================================= */

    function obterElemento(...ids) {

        for (const id of ids) {

            if (!id) {
                continue;
            }


            const elemento =
                document.getElementById(id);


            if (elemento) {
                return elemento;
            }

        }


        return null;

    }


    function definirDisplay(elemento, mostrar) {

        if (!elemento) {
            return;
        }


        elemento.style.display = mostrar
            ? ""
            : "none";

    }


    /* =========================================================
       NOME
       ========================================================= */

    function obterNomePerfil(estado) {

        const usuario = obterUsuario(estado);
        const perfil = obterPerfil(estado);
        const perfilArtista = obterPerfilArtista(estado);


        return texto(

            primeiroValor(

                perfil.nome_exibicao,

                perfilArtista.nome_artistico,
                perfilArtista.nome_artista,
                perfilArtista.nome_publico,
                perfilArtista.nome_exibicao,

                perfil.nome_publico,
                perfil.nome_completo,
                perfil.nome,

                usuario.nome,
                usuario.nome_completo,
                usuario.nome_exibicao,
                usuario.nome_publico

            ),

            "Perfil"

        );

    }


    function renderizarNome(estado) {

        const nome =
            obterNomePerfil(estado);


        const elementos = [

            obterElemento("profileName"),
            obterElemento("perfilNome"),
            obterElemento("nomePerfil"),
            obterElemento("profileTitle")

        ].filter(Boolean);


        elementos.forEach(elemento => {

            elemento.textContent =
                nome;

        });


        const topbar =
            obterElemento(
                "topbarProfileTitle"
            );


        if (topbar) {

            topbar.textContent =
                nome;

        }


        document.title =
            `${nome} | MusicalWorld`;

    }


    /* =========================================================
       FOTO
       ========================================================= */

    function obterFotoPerfil(estado) {

        const usuario = obterUsuario(estado);
        const perfil = obterPerfil(estado);
        const perfilArtista = obterPerfilArtista(estado);


        return texto(

            primeiroValor(

                perfilArtista.foto_url,
                perfil.foto_url,
                usuario.foto_url,

                perfilArtista.foto,
                perfil.foto,
                usuario.foto,

                perfilArtista.imagem_url,
                perfil.imagem_url,
                usuario.imagem_url,

                perfilArtista.avatar_url,
                perfil.avatar_url,
                usuario.avatar_url

            ),

            ""

        );

    }


    function renderizarFoto(estado) {

        const url =
            obterFotoPerfil(estado);


        const avatar =
            obterElemento(

                "profileAvatar",
                "perfilAvatar",
                "avatarPerfil",
                "avatar",
                "fotoPerfil"

            );


        if (!avatar) {
            return;
        }


        let imagem = null;


        if (
            avatar.tagName &&
            avatar.tagName.toLowerCase() === "img"
        ) {

            imagem = avatar;

        } else {

            imagem =
                avatar.querySelector("img");

        }


        if (!url) {

            if (imagem) {

                imagem.removeAttribute("src");

                imagem.style.display =
                    "none";

            }


            avatar.classList.add(
                "sem-foto"
            );


            return;

        }


        if (!imagem) {

            imagem =
                document.createElement("img");


            imagem.alt =
                obterNomePerfil(estado);


            imagem.loading =
                "eager";


            avatar.appendChild(
                imagem
            );

        }


        imagem.src =
            url;


        imagem.alt =
            obterNomePerfil(estado);


        imagem.style.display =
            "";


        avatar.classList.remove(
            "sem-foto"
        );


        imagem.onerror =
            function () {

                console.warn(
                    `[${MODULO}] Não foi possível carregar a foto:`,
                    url
                );


                imagem.style.display =
                    "none";


                avatar.classList.add(
                    "sem-foto"
                );

            };

    }


    /* =========================================================
       LOCALIZAÇÃO
       ========================================================= */

    function obterLocalizacao(estado) {

        const usuario = obterUsuario(estado);
        const perfil = obterPerfil(estado);
        const perfilArtista = obterPerfilArtista(estado);


        /*
         * Campo REAL:
         * perfis_artistas.localizacao
         */

        const localizacao =
            primeiroValor(

                perfilArtista.localizacao,
                perfil.localizacao,
                usuario.localizacao

            );


        if (valorValido(localizacao)) {

            return texto(
                localizacao
            );

        }


        const cidade =
            primeiroValor(

                perfilArtista.cidade,
                perfil.cidade,
                usuario.cidade

            );


        const uf =
            primeiroValor(

                perfilArtista.uf,
                perfilArtista.estado,
                perfil.uf,
                perfil.estado,
                usuario.uf,
                usuario.estado

            );


        if (
            valorValido(cidade) &&
            valorValido(uf)
        ) {

            return `${cidade} - ${uf}`;

        }


        return texto(

            primeiroValor(
                cidade,
                uf
            ),

            ""

        );

    }


    function renderizarLocalizacao(estado) {

        const localizacao =
            obterLocalizacao(estado);


        const elemento =
            obterElemento(

                "profileLocation",
                "perfilLocalizacao",
                "localizacaoPerfil"

            );


        if (!elemento) {
            return;
        }


        /*
         * O elemento contém o ícone do Lucide
         * e um <span> no HTML.
         *
         * Por isso atualizamos somente o span
         * quando ele existir.
         */

        const span =
            elemento.querySelector("span");


        if (localizacao) {

            if (span) {

                span.textContent =
                    localizacao;

            } else {

                elemento.textContent =
                    localizacao;

            }


            definirDisplay(
                elemento,
                true
            );

        } else {

            if (span) {

                span.textContent =
                    "";

            } else {

                elemento.textContent =
                    "";

            }


            definirDisplay(
                elemento,
                false
            );

        }

    }


    /* =========================================================
       BIOGRAFIA / DESCRIÇÃO
       ========================================================= */

    function obterBiografia(estado) {

        const usuario = obterUsuario(estado);
        const perfil = obterPerfil(estado);
        const perfilArtista = obterPerfilArtista(estado);


        /*
         * Campo REAL:
         * perfis.descricao
         */

        return texto(

            primeiroValor(

                perfil.descricao,

                perfilArtista.biografia,
                perfilArtista.bio,
                perfilArtista.descricao,
                perfilArtista.sobre,
                perfilArtista.apresentacao,

                perfil.biografia,
                perfil.bio,
                perfil.sobre,
                perfil.apresentacao,

                usuario.biografia,
                usuario.bio,
                usuario.descricao

            ),

            ""

        );

    }


    function renderizarBiografia(estado) {

        const biografia =
            obterBiografia(estado);


        const elemento =
            obterElemento(

                "profileBio",
                "perfilBio",
                "profileDescription",
                "perfilDescricao",
                "descricaoPerfil"

            );


        if (!elemento) {
            return;
        }


        if (biografia) {

            elemento.textContent =
                biografia;


            definirDisplay(
                elemento,
                true
            );

        } else {

            elemento.textContent =
                "";


            definirDisplay(
                elemento,
                false
            );

        }

    }


    /* =========================================================
       EXPERIÊNCIA
       ========================================================= */

    function obterExperiencia(estado) {

        const perfilArtista =
            obterPerfilArtista(estado);

        const perfil =
            obterPerfil(estado);


        /*
         * Campo REAL:
         * perfis_artistas.experiencia
         */

        return texto(

            primeiroValor(

                perfilArtista.experiencia,
                perfil.experiencia

            ),

            ""

        );

    }


    /* =========================================================
       ÁREA DE ATUAÇÃO
       ========================================================= */

    function obterAreaAtuacao(estado) {

        const perfilArtista =
            obterPerfilArtista(estado);

        const perfil =
            obterPerfil(estado);


        /*
         * Campo REAL:
         * perfis_artistas.area_atendimento
         */

        return texto(

            primeiroValor(

                perfilArtista.area_atendimento,
                perfil.area_atendimento,

                /*
                 * Compatibilidade com possíveis
                 * dados antigos.
                 */

                perfilArtista.area_atuacao,
                perfil.area_atuacao,

                perfilArtista.area,
                perfil.area

            ),

            ""

        );

    }


    /* =========================================================
       DISPONIBILIDADE
       ========================================================= */

    function obterDisponibilidade(estado) {

        const perfilArtista =
            obterPerfilArtista(estado);

        const perfil =
            obterPerfil(estado);


        /*
         * Campo REAL:
         * perfis_artistas.disponivel
         */

        const valor =
            primeiroValor(

                perfilArtista.disponivel,
                perfil.disponivel

            );


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


        return texto(
            valor,
            ""
        );

    }


    /* =========================================================
       GÊNEROS MUSICAIS / ESTILOS
       ========================================================= */

    function obterGeneros(estado) {

        const perfilArtista =
            obterPerfilArtista(estado);

        const perfil =
            obterPerfil(estado);


        /*
         * Campo REAL:
         * perfis_artistas.estilos
         */

        const valor =
            primeiroValor(

                perfilArtista.estilos,
                perfil.estilos,

                perfilArtista.estilos_musicais,
                perfilArtista.generos,
                perfilArtista.generos_musicais,

                perfil.estilos_musicais,
                perfil.generos,
                perfil.generos_musicais

            );


        const generos =
            arraySeguro(valor);


        console.log(
            `[${MODULO}] Gêneros musicais:`,
            generos
        );


        return generos;

    }


    /* =========================================================
       INSTRUMENTOS
       ========================================================= */

    function obterInstrumentos(estado) {

        const perfilArtista =
            obterPerfilArtista(estado);

        const perfil =
            obterPerfil(estado);


        /*
         * Campo REAL:
         * perfis_artistas.instrumentos
         */

        return arraySeguro(

            primeiroValor(

                perfilArtista.instrumentos,
                perfil.instrumentos

            )

        );

    }


    /* =========================================================
       STATUS
       ========================================================= */

    function obterStatus(estado) {

        const perfilArtista =
            obterPerfilArtista(estado);

        const perfil =
            obterPerfil(estado);


        /*
         * A disponibilidade oficial da tabela é
         * perfis_artistas.disponivel.
         *
         * O status continua separado para preservar
         * compatibilidade com páginas que já utilizem
         * status.
         */

        return texto(

            primeiroValor(

                perfilArtista.status,
                perfil.status

            ),

            ""

        );

    }


    /* =========================================================
       RENDERIZAR INFORMAÇÕES PROFISSIONAIS
       ========================================================= */

    function renderizarInformacoesProfissionais(estado) {

        /*
         * Esta função controla somente a seção:
         *
         * Experiência profissional
         *
         * Cada informação possui seu próprio card.
         *
         * Quando um campo não possui informação,
         * seu card é ocultado.
         *
         * Se nenhum campo possuir informação,
         * a seção inteira também é ocultada.
         */

        const experiencia =
            obterExperiencia(estado);


        const areaAtuacao =
            obterAreaAtuacao(estado);


        const disponibilidade =
            obterDisponibilidade(estado);


        const nomeTipo =
            obterNomeTipo(estado);


        /*
         * Localização não pertence mais à seção
         * profissional.
         *
         * Ela continua sendo renderizada normalmente
         * no cabeçalho do perfil através de
         * renderizarLocalizacao().
         */


        const campos = [

            {
                valor: experiencia,

                cardId:
                    "professionalExperienceCard",

                ids: [
                    "profileExperience",
                    "perfilExperiencia",
                    "experienciaPerfil"
                ]
            },

            {
                valor: areaAtuacao,

                cardId:
                    "professionalAreaCard",

                ids: [
                    "profileArea",
                    "perfilArea",
                    "areaAtuacao",
                    "profileAreaAtuacao"
                ]
            },

            {
                valor: nomeTipo,

                cardId:
                    "professionalTypeCard",

                ids: [
                    "profileType",
                    "perfilTipo",
                    "tipoPerfil"
                ]
            },

            {
                valor: disponibilidade,

                cardId:
                    "professionalAvailabilityCard",

                ids: [
                    "profileAvailability",
                    "perfilDisponibilidade",
                    "disponibilidadePerfil"
                ]
            }

        ];


        let quantidadeVisivel =
            0;


        campos.forEach(campo => {

            const elemento =
                obterElemento(...campo.ids);


            const card =
                obterElemento(campo.cardId);


            const possuiValor =
                valorValido(campo.valor);


            /*
             * O card é a unidade visual que deve
             * desaparecer quando não houver dados.
             */

            if (card) {

                definirDisplay(
                    card,
                    possuiValor
                );

            }


            if (possuiValor) {

                quantidadeVisivel++;

            }


            /*
             * Atualiza o conteúdo somente quando
             * o elemento existir.
             */

            if (!elemento) {
                return;
            }


            elemento.textContent =
                possuiValor
                    ? campo.valor
                    : "";


            /*
             * Quando existe um card específico,
             * o próprio card controla a visibilidade.
             *
             * Quando não existe card, mantemos a
             * compatibilidade com o comportamento antigo.
             */

            if (!card) {

                definirDisplay(
                    elemento,
                    possuiValor
                );

            }

        });


        /*
         * Controla a seção inteira.
         *
         * Se pelo menos uma informação existir,
         * a seção permanece visível.
         *
         * Se nenhuma informação existir,
         * a seção inteira desaparece.
         */

        const secao =
            document.querySelector(
                ".profile-professional-section"
            );


        if (secao) {

            definirDisplay(
                secao,
                quantidadeVisivel > 0
            );

        }


        console.log(
            `[${MODULO}] Informações profissionais:`,
            {
                experiencia,
                areaAtuacao,
                nomeTipo,
                disponibilidade,
                quantidadeVisivel
            }
        );

    }


    /* =========================================================
       GÊNEROS
       ========================================================= */

    function renderizarGeneros(estado) {

        const generos =
            obterGeneros(estado);


        const container =
            obterElemento(

                "genreList",

                "profileGenres",
                "perfilGeneros",
                "generosPerfil",
                "genresList",
                "estilosMusicais"

            );


        if (!container) {

            console.warn(
                `[${MODULO}] Container de gêneros não encontrado.`
            );

            return;

        }


        container.innerHTML =
            "";


        if (!generos.length) {

            const vazio =
                document.createElement(
                    "span"
                );


            vazio.className =
                "empty-inline";


            vazio.textContent =
                "Nenhum gênero cadastrado.";


            container.appendChild(
                vazio
            );


            definirDisplay(
                container,
                true
            );


            return;

        }


        generos.forEach(genero => {

            const item =
                document.createElement(
                    "span"
                );


            item.className =
                "profile-tag";


            item.textContent =
                genero;


            container.appendChild(
                item
            );

        });


        definirDisplay(
            container,
            true
        );


        /*
         * Atualiza os ícones Lucide,
         * caso necessário.
         */

        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /* =========================================================
       INSTRUMENTOS
       ========================================================= */

    function renderizarInstrumentos(estado) {

        const instrumentos =
            obterInstrumentos(estado);


        const container =
            obterElemento(

                "profileInstruments",
                "perfilInstrumentos",
                "instrumentosPerfil",
                "instrumentsList"

            );


        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        if (!instrumentos.length) {

            definirDisplay(
                container,
                false
            );

            return;

        }


        instrumentos.forEach(instrumento => {

            const item =
                document.createElement(
                    "span"
                );


            item.className =
                "profile-tag";


            item.textContent =
                instrumento;


            container.appendChild(
                item
            );

        });


        definirDisplay(
            container,
            true
        );

    }


    /* =========================================================
       STATUS
       ========================================================= */

    function renderizarStatus(estado) {

        const status =
            obterStatus(estado);


        const elemento =
            obterElemento(

                "profileStatus",
                "perfilStatus",
                "statusPerfil"

            );


        if (!elemento) {
            return;
        }


        if (!status) {

            definirDisplay(
                elemento,
                false
            );

            return;

        }


        elemento.textContent =
            status;


        elemento.classList.remove(

            "status-ativo",
            "status-inativo",
            "ativo",
            "inativo"

        );


        const normalizado =
            status
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );


        if (
            normalizado.includes("ativo") ||
            normalizado.includes("disponivel")
        ) {

            elemento.classList.add(
                "status-ativo"
            );

        }


        if (
            normalizado.includes("inativo") ||
            normalizado.includes("indisponivel")
        ) {

            elemento.classList.add(
                "status-inativo"
            );

        }


        definirDisplay(
            elemento,
            true
        );

    }


    /* =========================================================
       AVALIAÇÕES
       ========================================================= */

    function obterAvaliacoes(estado) {

        const dados =
            obterDados(estado);


        if (
            Array.isArray(
                dados.avaliacoes
            )
        ) {

            return dados.avaliacoes;

        }


        if (
            Array.isArray(
                estado?.avaliacoes
            )
        ) {

            return estado.avaliacoes;

        }


        return [];

    }


    function obterNotaMedia(estado) {

        const perfil =
            obterPerfil(estado);


        const perfilArtista =
            obterPerfilArtista(estado);


        const avaliacoes =
            obterAvaliacoes(estado);


        const notaDireta =
            primeiroValor(

                perfilArtista.avaliacao_media,
                perfilArtista.nota_media,
                perfilArtista.media_avaliacao,

                perfil.avaliacao_media,
                perfil.nota_media,
                perfil.media_avaliacao

            );


        if (valorValido(notaDireta)) {

            return numero(
                notaDireta,
                0
            );

        }


        if (!avaliacoes.length) {
            return 0;
        }


        const notas =
            avaliacoes

                .map(avaliacao => {

                    return numero(

                        primeiroValor(

                            avaliacao.nota,
                            avaliacao.avaliacao,
                            avaliacao.estrelas,
                            avaliacao.nota_avaliacao

                        ),

                        0

                    );

                })

                .filter(
                    nota => nota > 0
                );


        if (!notas.length) {
            return 0;
        }


        return notas.reduce(

            (total, nota) =>
                total + nota,

            0

        ) / notas.length;

    }


    function renderizarAvaliacao(estado) {

        const nota =
            obterNotaMedia(estado);


        const elementoNota =
            obterElemento(

                "profileRating",
                "ratingValue",
                "avaliacaoNota",
                "notaAvaliacao"

            );


        if (!elementoNota) {
            return;
        }


        /*
         * Quando o ID profileRating aponta para
         * o container completo da avaliação,
         * devemos atualizar somente ratingValue.
         */

        const valorElemento =
            obterElemento(
                "ratingValue"
            );


        if (
            elementoNota.id === "profileRating" &&
            valorElemento
        ) {

            valorElemento.textContent =
                nota > 0
                    ? nota.toFixed(1).replace(".", ",")
                    : "0,0";


            return;

        }


        elementoNota.textContent =
            nota > 0
                ? nota.toFixed(1).replace(".", ",")
                : "0,0";

    }


    /* =========================================================
       RENDERIZAÇÃO PRINCIPAL
       ========================================================= */

    function renderizar(estado) {

        if (!estado) {

            console.warn(
                `[${MODULO}] Nenhum estado recebido para renderização.`
            );

            return false;

        }


        estadoAtual =
            estado;


        const dados =
            obterDados(estado);


        const usuario =
            obterUsuario(estado);


        const perfil =
            obterPerfil(estado);


        const perfilArtista =
            obterPerfilArtista(estado);


        console.log(
            `[${MODULO}] Estado recebido:`,
            estado
        );


        console.log(
            `[${MODULO}] Dados utilizados:`,
            dados
        );


        console.log(
            `[${MODULO}] Usuário:`,
            usuario
        );


        console.log(
            `[${MODULO}] Perfil:`,
            perfil
        );


        console.log(
            `[${MODULO}] Perfil artístico:`,
            perfilArtista
        );


        /*
         * Renderização da identidade.
         */

        renderizarNome(estado);

        renderizarTipo(estado);

        renderizarFoto(estado);


        /*
         * Informações gerais.
         */

        renderizarLocalizacao(estado);

        renderizarBiografia(estado);


        /*
         * Informações profissionais.
         */

        renderizarInformacoesProfissionais(
            estado
        );


        /*
         * Conteúdos específicos.
         */

        renderizarGeneros(estado);

        renderizarInstrumentos(estado);


        /*
         * Status e avaliações.
         */

        renderizarStatus(estado);

        renderizarAvaliacao(estado);


        return true;

    }


    /* =========================================================
       RENDERIZAR TIPO
       ========================================================= */

    function renderizarTipo(estado) {

        const nomeTipo =
            obterNomeTipo(estado);


        const categoria =
            obterCategoriaPerfil(estado);


        const tipoElemento =
            obterElemento(

                "profileType",
                "perfilTipo",
                "tipoPerfil"

            );


        if (tipoElemento) {

            tipoElemento.textContent =
                nomeTipo;


            definirDisplay(

                tipoElemento,

                Boolean(nomeTipo)

            );

        }


        const categoriaElemento =
            obterElemento(

                "profileCategory",
                "perfilCategoria",
                "categoriaPerfil"

            );


        if (categoriaElemento) {

            categoriaElemento.textContent =
                categoria;


            definirDisplay(

                categoriaElemento,

                Boolean(categoria)

            );

        }

    }


    /* =========================================================
       LIMPAR
       ========================================================= */

    function limpar() {

        estadoAtual =
            null;

    }


    /* =========================================================
       DADOS PÚBLICOS
       ========================================================= */

    function obterDadosPublicos() {

        if (!estadoAtual) {
            return {};
        }


        return {

            usuario:
                obterUsuario(
                    estadoAtual
                ),


            perfil:
                obterPerfil(
                    estadoAtual
                ),


            perfilArtista:
                obterPerfilArtista(
                    estadoAtual
                ),


            tipoPerfil:
                obterTipoPerfil(
                    estadoAtual
                ),


            nome:
                obterNomePerfil(
                    estadoAtual
                ),


            foto:
                obterFotoPerfil(
                    estadoAtual
                ),


            localizacao:
                obterLocalizacao(
                    estadoAtual
                ),


            biografia:
                obterBiografia(
                    estadoAtual
                ),


            experiencia:
                obterExperiencia(
                    estadoAtual
                ),


            areaAtuacao:
                obterAreaAtuacao(
                    estadoAtual
                ),


            disponibilidade:
                obterDisponibilidade(
                    estadoAtual
                ),


            instrumentos:
                obterInstrumentos(
                    estadoAtual
                ),


            generos:
                obterGeneros(
                    estadoAtual
                ),


            status:
                obterStatus(
                    estadoAtual
                ),


            notaMedia:
                obterNotaMedia(
                    estadoAtual
                ),


            avaliacoes:
                obterAvaliacoes(
                    estadoAtual
                )

        };

    }


    /* =========================================================
       GETTERS
       ========================================================= */

    function obterEstado() {

        return estadoAtual;

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ApresentarPerfilRender = {

        renderizar,

        limpar,

        obterEstado,

        obterDadosPublicos,

        obterDados,

        obterUsuario,

        obterPerfil,

        obterPerfilArtista,

        obterTipoPerfil,

        obterNomeTipo,

        obterCategoriaPerfil,

        obterNomePerfil,

        obterFotoPerfil,

        obterLocalizacao,

        obterBiografia,

        obterExperiencia,

        obterAreaAtuacao,

        obterDisponibilidade,

        obterGeneros,

        obterInstrumentos,

        obterStatus,

        obterAvaliacoes,

        obterNotaMedia

    };


    console.log(
        `${MODULO}.js carregado.`
    );


})(window);