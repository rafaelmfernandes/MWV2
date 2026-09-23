
(function (window) {


"use strict";


/* =========================================================
   MUSICALWORLD — APRESENTAÇÃO DE PERFIL — RENDERIZAÇÃO

   Arquivo:
   js/apresentar-perfil-teste/ApresentarPerfilRender.js

   Responsabilidades:

   - Receber os dados carregados pelo módulo de dados.
   - Identificar nome, tipo e localização.
   - Renderizar avatar e iniciais.
   - Renderizar identidade na nova topbar.
   - Manter funções de avaliação, gêneros, descrição e
     informações profissionais disponíveis para uso futuro.
   - Atualizar somente a interface do perfil.

   IMPORTANTE:

   A região imediatamente abaixo da mídia do portfólio
   NÃO é mais utilizada para exibir:

   - tipo de artista;
   - avaliação;
   - quantidade de avaliações;
   - gêneros/estilos;
   - biografia;
   - experiência;
   - área de atuação;
   - disponibilidade.

   Essa região agora é controlada pelo:

   js/apresentar-perfil-teste/ApresentarPerfilPortfolio.js

   que exibe somente:

   - título do item atual do portfólio;
   - descrição do item atual do portfólio.

   Este arquivo NÃO é responsável por:

   - Consultar o Supabase.
   - Buscar portfólio.
   - Buscar serviços.
   - Controlar contratação.
   - Controlar curtidas, comentários ou compartilhamentos.

   O acesso aos dados é responsabilidade de:
   ApresentarPerfilDadosTeste.js
   ========================================================= */


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function valorValido(valor) {

    return (
        valor !== null &&
        valor !== undefined &&
        String(valor).trim() !== ""
    );

}


function texto(valor, fallback) {

    if (valorValido(valor)) {

        return String(valor).trim();

    }

    return fallback || "";

}


function numero(valor, fallback) {

    const resultado = Number(valor);

    if (Number.isFinite(resultado)) {

        return resultado;

    }

    return fallback || 0;

}


function arraySeguro(valor) {

    if (Array.isArray(valor)) {

        return valor

            .map(function (item) {

                return String(item).trim();

            })

            .filter(Boolean);

    }


    if (!valorValido(valor)) {

        return [];

    }


    /*
     * PostgreSQL pode retornar arrays no formato:
     *
     * {Sertanejo,MPB,Pop}
     */

    if (
        typeof valor === "string" &&
        valor.startsWith("{") &&
        valor.endsWith("}")
    ) {

        return valor

            .slice(1, -1)

            .split(",")

            .map(function (item) {

                return item

                    .replace(/^"(.*)"$/, "$1")

                    .trim();

            })

            .filter(Boolean);

    }


    /*
     * Também aceitamos JSON:
     *
     * ["Sertanejo","MPB","Pop"]
     */

    if (
        typeof valor === "string" &&
        valor.trim().startsWith("[")
    ) {

        try {

            const convertido =
                JSON.parse(valor);


            if (Array.isArray(convertido)) {

                return convertido

                    .map(function (item) {

                        return String(item).trim();

                    })

                    .filter(Boolean);

            }

        } catch (erro) {

            /*
             * Se não for JSON válido,
             * continuamos para o formato separado
             * por vírgulas.
             */

        }

    }


    /*
     * Formato simples:
     *
     * Sertanejo, MPB, Pop
     */

    if (typeof valor === "string") {

        return valor

            .split(",")

            .map(function (item) {

                return item.trim();

            })

            .filter(Boolean);

    }


    return [];

}


function primeiroValor() {

    const valores =
        Array.prototype.slice.call(
            arguments
        );


    for (
        let i = 0;
        i < valores.length;
        i++
    ) {

        if (
            valorValido(
                valores[i]
            )
        ) {

            return valores[i];

        }

    }


    return null;

}


/* =========================================================
   OBTENÇÃO DOS DADOS
   ========================================================= */

function obterDados() {

    if (
        window.ApresentarPerfilDadosTeste &&
        typeof window
            .ApresentarPerfilDadosTeste
            .obterDados === "function"
    ) {

        try {

            return window
                .ApresentarPerfilDadosTeste
                .obterDados() || {};

        } catch (erro) {

            console.error(
                "ApresentarPerfilRenderTeste: erro ao obter dados:",
                erro
            );

        }

    }


    return {};

}


function obterUsuario() {

    const dados =
        obterDados();


    return dados.usuario || {};

}


function obterPerfil() {

    const dados =
        obterDados();


    return dados.perfil || {};

}


function obterPerfilArtista() {

    const dados =
        obterDados();


    return dados.perfilArtista || {};

}


function obterTipoPerfil() {

    const dados =
        obterDados();


    return dados.tipoPerfil || {};

}


function obterAvaliacoes() {

    const dados =
        obterDados();


    return Array.isArray(
        dados.avaliacoes
    )
        ? dados.avaliacoes
        : [];

}


/* =========================================================
   NOME DO ARTISTA
   ========================================================= */

function obterNomePerfil() {

    const usuario =
        obterUsuario();

    const perfil =
        obterPerfil();

    const perfilArtista =
        obterPerfilArtista();


    return texto(

        primeiroValor(

            perfilArtista.nome_artistico,

            perfilArtista.nome_artista,

            perfilArtista.nome_publico,

            perfil.nome_exibicao,

            perfil.nome_artistico,

            perfil.nome_artista,

            usuario.nome,

            usuario.nome_completo

        ),

        "Artista"

    );

}


/* =========================================================
   TIPO DO PERFIL
   ========================================================= */

function obterNomeTipo() {

    const tipo =
        obterTipoPerfil();

    const perfil =
        obterPerfil();

    const perfilArtista =
        obterPerfilArtista();


    return texto(

        primeiroValor(

            tipo.nome,

            perfilArtista.tipo_artista,

            perfil.tipo_perfil_nome,

            perfil.tipo_perfil

        ),

        "Artista"

    );

}


/* =========================================================
   LOCALIZAÇÃO
   ========================================================= */

function obterLocalizacao() {

    const perfilArtista =
        obterPerfilArtista();


    const cidade =
        primeiroValor(
            perfilArtista.cidade,
            perfilArtista.municipio
        );


    const uf =
        primeiroValor(
            perfilArtista.uf,
            perfilArtista.estado,
            perfilArtista.estado_sigla
        );


    let cidadeUf =
        null;


    if (
        valorValido(cidade) &&
        valorValido(uf)
    ) {

        cidadeUf =
            `${cidade} - ${uf}`;

    } else if (
        valorValido(cidade)
    ) {

        cidadeUf =
            cidade;

    } else if (
        valorValido(uf)
    ) {

        cidadeUf =
            uf;

    }


    return texto(

        primeiroValor(

            perfilArtista.localizacao,

            cidadeUf

        ),

        "Localização não informada"

    );

}


/* =========================================================
   FOTO DO PERFIL
   ========================================================= */

function obterFotoPerfil() {

    const usuario =
        obterUsuario();

    const perfil =
        obterPerfil();

    const perfilArtista =
        obterPerfilArtista();


    return primeiroValor(

        perfilArtista.foto_url,

        perfilArtista.avatar_url,

        perfilArtista.foto,

        perfilArtista.imagem_url,

        perfil.foto_url,

        perfil.avatar_url,

        perfil.foto,

        perfil.imagem_url,

        usuario.foto_url,

        usuario.avatar_url,

        usuario.foto,

        usuario.imagem_url

    );

}


/* =========================================================
   INICIAIS DO NOME
   ========================================================= */

function obterIniciais(nome) {

    const valor =
        texto(
            nome,
            "A"
        );


    const partes =
        valor

            .split(/\s+/)

            .filter(Boolean);


    if (!partes.length) {

        return "A";

    }


    if (partes.length === 1) {

        return partes[0]

            .substring(0, 2)

            .toUpperCase();

    }


    return (

        partes[0].charAt(0) +

        partes[partes.length - 1]
            .charAt(0)

    ).toUpperCase();

}


/* =========================================================
   DESCRIÇÃO

   Mantida para compatibilidade e para eventual utilização
   em outras áreas da página.

   NÃO é chamada pelo renderizar() principal.
   ========================================================= */

function obterBiografia() {

    const perfil =
        obterPerfil();

    const perfilArtista =
        obterPerfilArtista();


    return texto(

        primeiroValor(

            perfil.descricao,

            perfil.bio,

            perfil.biografia,

            perfilArtista.descricao,

            perfilArtista.bio,

            perfilArtista.biografia

        ),

        "Este artista ainda não adicionou uma descrição."

    );

}


/* =========================================================
   EXPERIÊNCIA
   ========================================================= */

function obterExperiencia() {

    const perfilArtista =
        obterPerfilArtista();


    return texto(

        perfilArtista.experiencia,

        "Não informado"

    );

}


/* =========================================================
   ÁREA DE ATUAÇÃO
   ========================================================= */

function obterAreaAtuacao() {

    const perfilArtista =
        obterPerfilArtista();


    return texto(

        primeiroValor(

            perfilArtista.area_atendimento,

            perfilArtista.area_atuacao,

            perfilArtista.areaAtuacao

        ),

        "Não informado"

    );

}


/* =========================================================
   DISPONIBILIDADE
   ========================================================= */

function obterDisponibilidade() {

    const perfilArtista =
        obterPerfilArtista();


    const valor =
        perfilArtista.disponivel;


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


    return "Não informado";

}


/* =========================================================
   GÊNEROS / ESTILOS
   ========================================================= */

function obterGeneros() {

    const perfilArtista =
        obterPerfilArtista();


    return arraySeguro(

        primeiroValor(

            perfilArtista.estilos,

            perfilArtista.generos,

            perfilArtista.generos_musicais

        )

    );

}


/* =========================================================
   INSTRUMENTOS
   ========================================================= */

function obterInstrumentos() {

    const perfilArtista =
        obterPerfilArtista();


    return arraySeguro(

        primeiroValor(

            perfilArtista.instrumentos,

            perfilArtista.instrumento

        )

    );

}


/* =========================================================
   AVALIAÇÃO

   Mantida para a seção de avaliações e compatibilidade.

   NÃO é renderizada na região abaixo da mídia.
   ========================================================= */

function obterAvaliacao() {

    const perfil =
        obterPerfil();

    const perfilArtista =
        obterPerfilArtista();

    const avaliacoes =
        obterAvaliacoes();


    /*
     * Primeiro verificamos se o próprio perfil
     * já possui uma média calculada.
     */

    const mediaDireta =
        primeiroValor(

            perfilArtista.avaliacao_media,

            perfilArtista.nota_media,

            perfilArtista.media_avaliacao,

            perfil.avaliacao_media,

            perfil.nota_media,

            perfil.media_avaliacao

        );


    if (
        valorValido(mediaDireta)
    ) {

        return {

            media:
                numero(
                    mediaDireta,
                    0
                ),

            total:
                avaliacoes.length

        };

    }


    /*
     * Caso não exista média pronta,
     * calculamos a partir das avaliações.
     */

    if (!avaliacoes.length) {

        return {

            media: 0,

            total: 0

        };

    }


    const notas =
        avaliacoes

            .map(function (avaliacao) {

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

            .filter(function (nota) {

                return nota > 0;

            });


    if (!notas.length) {

        return {

            media: 0,

            total: 0

        };

    }


    const soma =
        notas.reduce(

            function (total, nota) {

                return total + nota;

            },

            0

        );


    const media =
        soma / notas.length;


    return {

        media,

        total:
            notas.length

    };

}


/* =========================================================
   ELEMENTOS DO DOM
   ========================================================= */

function obterElemento(id) {

    return document.getElementById(id);

}


/* =========================================================
   RENDERIZAR NOME
   =========================================================

   O nome aparece na nova topbar e também nos elementos
   internos mantidos para compatibilidade com o módulo
   de renderização atual.
   ========================================================= */

function renderizarNome() {

    const nome =
        obterNomePerfil();


    const elementos = [

        obterElemento(
            "profileName"
        ),

        obterElemento(
            "profileNameMedia"
        ),

        obterElemento(
            "profileTopbarName"
        )

    ];


    elementos.forEach(
        function (elemento) {

            if (!elemento) {
                return;
            }


            elemento.textContent =
                nome;

        }
    );

}


/* =========================================================
   RENDERIZAR TIPO

   O tipo continua sendo renderizado na TOPBAR.

   Ele não é mais renderizado na área de conteúdo abaixo
   da mídia.
   ========================================================= */

function renderizarTipo() {

    const tipo =
        obterNomeTipo();


    const elementos = [

        obterElemento(
            "profileType"
        ),

        obterElemento(
            "profileTypeMedia"
        ),

        obterElemento(
            "profileArtistType"
        ),

        obterElemento(
            "profileTopbarType"
        )

    ];


    elementos.forEach(
        function (elemento) {

            if (!elemento) {
                return;
            }


            elemento.textContent =
                tipo;

        }
    );

}


/* =========================================================
   RENDERIZAR LOCALIZAÇÃO
   ========================================================= */

function renderizarLocalizacao() {

    const localizacao =
        obterLocalizacao();


    const elementos = [

        obterElemento(
            "profileLocation"
        ),

        obterElemento(
            "profileLocationMedia"
        ),

        obterElemento(
            "profileTopbarLocation"
        )

    ];


    elementos.forEach(
        function (elemento) {

            if (!elemento) {
                return;
            }


            /*
             * A localização da topbar possui um ícone
             * próprio. Por isso usamos textContent somente
             * no elemento interno correspondente quando
             * necessário.
             */

            if (
                elemento.id ===
                "profileTopbarLocation"
            ) {

                const textoLocalizacao =
                    elemento.querySelector(
                        ".topbar-location-text"
                    );


                if (textoLocalizacao) {

                    textoLocalizacao.textContent =
                        localizacao;

                } else {

                    /*
                     * O HTML atual ainda possui o ícone
                     * diretamente dentro do elemento.
                     * Mantemos o texto sem remover o SVG.
                     */

                    const nosTexto =
                        Array.from(
                            elemento.childNodes
                        ).filter(
                            function (no) {

                                return (
                                    no.nodeType ===
                                    Node.TEXT_NODE
                                );

                            }
                        );


                    if (nosTexto.length) {

                        nosTexto[
                            nosTexto.length - 1
                        ].textContent =
                            ` ${localizacao}`;

                    } else {

                        elemento.appendChild(
                            document.createTextNode(
                                localizacao
                            )
                        );

                    }

                }

                return;

            }


            elemento.textContent =
                localizacao;

        }
    );

}


/* =========================================================
   CONFIGURAR IMAGEM DE AVATAR
   ========================================================= */

function configurarImagemAvatar(
    imagem,
    iniciais,
    nome,
    foto
) {

    if (!imagem) {

        if (iniciais) {

            iniciais.textContent =
                obterIniciais(nome);

        }

        return;
    }


    /*
     * Sempre definimos as iniciais antes de tentar
     * carregar a imagem.
     */

    if (iniciais) {

        iniciais.textContent =
            obterIniciais(nome);

    }


    /*
     * Sem foto:
     * mostramos as iniciais.
     */

    if (!valorValido(foto)) {

        imagem.removeAttribute(
            "src"
        );


        imagem.style.display =
            "none";


        if (iniciais) {

            iniciais.style.display =
                "flex";

        }


        return;
    }


    /*
     * Foto disponível.
     */

    imagem.alt =
        `Foto de ${nome}`;


    imagem.style.display =
        "block";


    if (iniciais) {

        iniciais.style.display =
            "none";

    }


    /*
     * Se a URL da foto estiver inválida,
     * retornamos automaticamente para as iniciais.
     */

    imagem.onerror =
        function () {

            imagem.style.display =
                "none";


            if (iniciais) {

                iniciais.style.display =
                    "flex";

            }

        };


    imagem.src =
        String(foto);

}


/* =========================================================
   RENDERIZAR AVATAR
   =========================================================

   Atualiza os avatares internos e o novo avatar da topbar.

   Internos:
   #profileAvatar
   #profileInitials
   #profileAvatarMedia
   #profileInitialsMedia

   Topbar:
   #profileTopbarAvatar
   #profileTopbarInitials
   ========================================================= */

function renderizarAvatar() {

    const nome =
        obterNomePerfil();

    const foto =
        obterFotoPerfil();


    configurarImagemAvatar(

        obterElemento(
            "profileAvatar"
        ),

        obterElemento(
            "profileInitials"
        ),

        nome,

        foto

    );


    configurarImagemAvatar(

        obterElemento(
            "profileAvatarMedia"
        ),

        obterElemento(
            "profileInitialsMedia"
        ),

        nome,

        foto

    );


    configurarImagemAvatar(

        obterElemento(
            "profileTopbarAvatar"
        ),

        obterElemento(
            "profileTopbarInitials"
        ),

        nome,

        foto

    );

}


/* =========================================================
   RENDERIZAR DESCRIÇÃO

   Mantida para compatibilidade.

   NÃO é chamada no renderizar() principal.

   A descrição exibida imediatamente abaixo da mídia agora
   pertence ao item atual do portfólio e é controlada por:

   ApresentarPerfilPortfolioTeste
   ========================================================= */

function renderizarDescricao() {

    const elemento =
        obterElemento(
            "profileBio"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        obterBiografia();

}


/* =========================================================
   RENDERIZAR GÊNEROS

   Mantida para compatibilidade.

   NÃO é chamada no renderizar() principal.
   ========================================================= */

function renderizarGeneros() {

    const container =
        obterElemento(
            "genreList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const generos =
        obterGeneros();


    generos.forEach(
        function (genero) {

            const elemento =
                document.createElement(
                    "span"
                );


            elemento.className =
                "profile-genre";


            elemento.textContent =
                genero;


            container.appendChild(
                elemento
            );

        }
    );


    container.style.display =
        generos.length
            ? ""
            : "none";

}


/* =========================================================
   RENDERIZAR AVALIAÇÃO

   Mantida para compatibilidade.

   NÃO é chamada no renderizar() principal.

   A seção completa de avaliações continua sendo tratada
   separadamente pela página.
   ========================================================= */

function renderizarAvaliacao() {

    const rating =
        obterAvaliacao();


    const valor =
        obterElemento(
            "ratingValue"
        );


    const quantidade =
        obterElemento(
            "ratingReviews"
        );


    const container =
        obterElemento(
            "profileRating"
        );


    if (valor) {

        valor.textContent =
            rating.media > 0

                ? rating.media.toFixed(1)

                : "—";

    }


    if (quantidade) {

        quantidade.textContent =
            rating.total > 0

                ? `(${rating.total})`

                : "(sem avaliações)";

    }


    if (container) {

        container.style.display =
            "";

    }

}


/* =========================================================
   RENDERIZAR EXPERIÊNCIA
   ========================================================= */

function renderizarExperiencia() {

    const elemento =
        obterElemento(
            "profileExperience"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        obterExperiencia();

}


/* =========================================================
   RENDERIZAR ÁREA
   ========================================================= */

function renderizarArea() {

    const elemento =
        obterElemento(
            "profileArea"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        obterAreaAtuacao();

}


/* =========================================================
   RENDERIZAR DISPONIBILIDADE
   ========================================================= */

function renderizarDisponibilidade() {

    const elemento =
        obterElemento(
            "profileAvailability"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        obterDisponibilidade();

}


/* =========================================================
   RENDERIZAR TUDO
   ========================================================= */

function renderizar() {

    /*
     * =====================================================
     * IDENTIDADE
     * =====================================================
     *
     * A identidade continua sendo necessária para a topbar:
     *
     * - nome;
     * - tipo;
     * - localização;
     * - avatar.
     */

    renderizarNome();

    renderizarTipo();

    renderizarLocalizacao();

    renderizarAvatar();


    /*
     * =====================================================
     * CONTEÚDO ABAIXO DA MÍDIA
     * =====================================================
     *
     * IMPORTANTE:
     *
     * Não chamamos mais aqui:
     *
     * - renderizarDescricao();
     * - renderizarGeneros();
     * - renderizarAvaliacao();
     * - renderizarExperiencia();
     * - renderizarArea();
     * - renderizarDisponibilidade();
     *
     * Dessa forma, o conteúdo abaixo da mídia não recebe
     * mais os dados gerais do perfil.
     *
     * O conteúdo dessa região agora pertence exclusivamente
     * ao item ativo do portfólio.
     *
     * O responsável por atualizar essa região é:
     *
     * ApresentarPerfilPortfolioTeste
     *
     * usando:
     *
     * #portfolioContent
     * #portfolioItemTitle
     * #portfolioItemDescription
     * =====================================================
     */


    /*
     * =====================================================
     * LUCIDE
     * =====================================================
     *
     * Atualiza os ícones da página caso existam.
     */

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }


    console.log(
        "ApresentarPerfilRenderTeste: perfil renderizado."
    );

}


/* =========================================================
   API PÚBLICA
   ========================================================= */

window.ApresentarPerfilRenderTeste = {

    renderizar,

    renderizarNome,

    renderizarTipo,

    renderizarLocalizacao,

    renderizarAvatar,

    renderizarDescricao,

    renderizarGeneros,

    renderizarAvaliacao,

    renderizarExperiencia,

    renderizarArea,

    renderizarDisponibilidade,

    obterNomePerfil,

    obterNomeTipo,

    obterLocalizacao,

    obterFotoPerfil,

    obterBiografia,

    obterExperiencia,

    obterAreaAtuacao,

    obterDisponibilidade,

    obterGeneros,

    obterInstrumentos,

    obterAvaliacao,

    obterIniciais

};


/* =========================================================
   DIAGNÓSTICO
   ========================================================= */

console.log(
    "ApresentarPerfilRenderTeste carregado."
);


})(window);

