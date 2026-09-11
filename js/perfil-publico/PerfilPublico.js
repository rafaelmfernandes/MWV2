(function (window) {


"use strict";


/* =========================================================
   MUSICALWORLD — PERFIL PÚBLICO
   Arquivo: PerfilPublico.js

   Responsabilidade:

   - Controlar a página "Meu Perfil".
   - Controlar as abas.
   - Carregar os dados.
   - Acionar os módulos responsáveis por cada seção.
   - Preencher informações básicas do perfil.
   - Controlar ações da página.
   - Controlar a carteira e as transações.

   Estrutura:

   PerfilPublicoUtils.js
   ↓
   PerfilPublicoDados.js
   ↓
   PerfilPublicoPortfolio.js
   PerfilPublicoServicos.js
   PerfilPublicoAgenda.js
   PerfilPublicoAvaliacoes.js
   ↓
   PerfilPublico.js

   IMPORTANTE:

   - Não criar PerfilPublicoRender.js.
   - Não criar PerfilPublicoCarteira.js.
   - Avaliações ainda não possuem tabela no banco.
   - O módulo de avaliações fica preparado para o futuro.
   ========================================================= */


/* =====================================================
   DEPENDÊNCIAS
   ===================================================== */

const Utils =
    window.PerfilPublicoUtils;

const Dados =
    window.PerfilPublicoDados;

const Portfolio =
    window.PerfilPublicoPortfolio;

const Servicos =
    window.PerfilPublicoServicos;

const Agenda =
    window.PerfilPublicoAgenda;

const Avaliacoes =
    window.PerfilPublicoAvaliacoes;


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    pagina: {

        tipoArtista:
            "Cantor(a)"

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

    return document.getElementById(
        id
    );

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
   INICIALIZAR
   ===================================================== */

async function inicializar() {

    if (
        estado.carregando
    ) {

        aviso(
            "A página já está sendo inicializada."
        );

        return;

    }

    estado.carregando =
        true;

    try {

        log(
            "Inicializando perfil público..."
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
            "Perfil público inicializado com sucesso."
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


    log(
        "Dados carregados:",
        {

            usuarioId:
                estado.usuarioId,

            perfilId:
                estado.perfilId,

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


    return Array.isArray(
        valor
    )
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
     * -----------------------------------------------------
     * NOME
     * -----------------------------------------------------
     *
     * Para o perfil público usamos primeiro o nome de
     * exibição salvo em public.perfis.
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
     * -----------------------------------------------------
     * TIPO
     * -----------------------------------------------------
     */

    const tipo =
        obterPrimeiroValor(

            artista.tipo_artista,

            artista.tipoArtista,

            artista.tipo,

            perfil.tipo_artista,

            CONFIG.pagina.tipoArtista

        );


    /*
     * -----------------------------------------------------
     * LOCALIZAÇÃO
     * -----------------------------------------------------
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
     * -----------------------------------------------------
     * SOBRE MIM
     * -----------------------------------------------------
     *
     * ATENÇÃO:
     *
     * O PerfilEditor confirma que o campo "Sobre mim"
     * é salvo em:
     *
     * public.perfis.descricao
     *
     * Portanto esta é a fonte principal.
     *
     * Os demais campos ficam apenas como fallback para
     * compatibilidade futura.
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
     * -----------------------------------------------------
     * EXPERIÊNCIA
     * -----------------------------------------------------
     *
     * O PerfilEditor confirma:
     *
     * public.perfis_artistas.experiencia
     */

    const experiencia =
        obterPrimeiroValor(

            artista.experiencia,

            artista.tempo_experiencia,

            artista.anos_experiencia,

            perfil.experiencia

        );


    /*
     * -----------------------------------------------------
     * ÁREA DE INTERESSE / ATENDIMENTO
     * -----------------------------------------------------
     *
     * O PerfilEditor confirma que o campo é salvo em:
     *
     * public.perfis_artistas.area_atendimento
     *
     * Portanto este é o primeiro campo consultado.
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
     * -----------------------------------------------------
     * DISPONIBILIDADE
     * -----------------------------------------------------
     */

    const disponibilidade =
        obterPrimeiroValor(

            artista.disponivel,

            artista.disponibilidade,

            perfil.disponibilidade

        );


    /*
     * -----------------------------------------------------
     * RENDERIZAÇÃO
     * -----------------------------------------------------
     */

    definirTexto(
        CONFIG.elementos.nome,
        nome,
        "Artista"
    );


    definirTexto(
        CONFIG.elementos.categoria,
        tipo,
        CONFIG.pagina.tipoArtista
    );


    definirTexto(
        CONFIG.elementos.localizacao,
        localizacao,
        "Localização não informada"
    );


    definirTexto(
        CONFIG.elementos.bio,
        bio,
        "Nenhuma biografia informada."
    );


    definirTexto(
        CONFIG.elementos.experiencia,
        experiencia,
        "Não informado"
    );


    definirTexto(
        CONFIG.elementos.area,
        area,
        "Não informado"
    );


    definirTexto(
        CONFIG.elementos.tipo,
        tipo,
        CONFIG.pagina.tipoArtista
    );


    definirTexto(
        CONFIG.elementos.disponibilidade,
        obterTextoDisponibilidade(
            disponibilidade
        ),
        "Não informado"
    );


    /*
     * Logs específicos para facilitar o teste.
     */

    log(
        "Sobre mim encontrado:",
        bio
    );


    log(
        "Área de interesse/atendimento encontrada:",
        area
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
   AVATAR
   ===================================================== */

function preencherAvatar(artista, perfil, nome) {

const container =
    obterElemento(CONFIG.elementos.avatar);

const iniciais =
    obterElemento(CONFIG.elementos.iniciais);


if (!container) {

    aviso(
        "Elemento #profileAvatar não encontrado."
    );

    return;

}


/* =====================================================
   LOCALIZAR OU CRIAR A IMAGEM
   ===================================================== */

let imagem =
    container.querySelector(
        "img.profile-avatar-image"
    );


if (!imagem) {

    imagem =
        document.createElement("img");

    imagem.className =
        "profile-avatar-image";

    imagem.alt =
        `Foto de perfil de ${nome || "artista"}`;

    container.appendChild(
        imagem
    );

}


/* =====================================================
   OBTER URL DA FOTO
   ===================================================== */

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


/* =====================================================
   CONFIGURAR INICIAIS
   ===================================================== */

if (iniciais) {

    iniciais.textContent =
        obterIniciais(nome);

    iniciais.style.display =
        "none";

    iniciais.hidden =
        true;

}


/* =====================================================
   SEM FOTO
   ===================================================== */

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
            obterIniciais(nome);

        iniciais.style.display =
            "flex";

        iniciais.hidden =
            false;

    }


    log(
        "Avatar: nenhuma foto encontrada. Exibindo iniciais."
    );

    return;

}


/* =====================================================
   CONFIGURAR CONTAINER
   ===================================================== */

container.hidden =
    false;

container.style.display =
    "";


/* =====================================================
   CONFIGURAR IMAGEM
   ===================================================== */

imagem.hidden =
    false;

imagem.style.display =
    "block";


/* =====================================================
   EVENTO — FOTO CARREGADA
   ===================================================== */

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


        log(
            "Avatar carregado com sucesso:",
            imagem.src
        );

    };


/* =====================================================
   EVENTO — ERRO AO CARREGAR
   ===================================================== */

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
                obterIniciais(nome);

            iniciais.style.display =
                "flex";

            iniciais.hidden =
                false;

        }

    };


/* =====================================================
   DEFINIR FOTO
   ===================================================== */

imagem.src =
    String(url);


log(
    "Avatar encontrado:",
    url
);


/* =====================================================
   VERIFICAR CACHE
   ===================================================== */

if (imagem.complete) {

    if (
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


        log(
            "Avatar carregado do cache:",
            imagem.src
        );

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
        String(
            nome || ""
        )
        .trim()
        .split(
            /\s+/
        )
        .filter(
            Boolean
        );


    if (
        !partes.length
    ) {

        return "A";

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
                        Number.isFinite(
                            numero
                        ) &&
                        numero > 0
                );


        if (
            notas.length
        ) {

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
            Number.isFinite(
                numero
            ) &&
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
            Number.isFinite(
                numero
            ) &&
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
        CONFIG.elementos.avaliacao,
        notaFormatada,
        "0,0"
    );


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
   GÊNEROS
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

            estado.perfil?.generos,

            estado.perfil?.estilos

        );


    const lista =
        normalizarLista(
            generos
        );


    if (
        !lista.length
    ) {

        container.innerHTML = `

            <span class="empty-inline">
                Nenhum gênero informado.
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

function preencherInstrumentos(artista) {

    const container =
        obterElemento(
            CONFIG.elementos.instrumentos
        );

    const section =
        obterElemento(
            CONFIG.elementos.instrumentosSection
        );


    if (!container) {

        aviso(
            "Elemento #instrumentList não encontrado."
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * OBTER INSTRUMENTOS
     * -----------------------------------------------------
     *
     * A fonte principal é:
     *
     * public.perfis_artistas.instrumentos
     */

    let instrumentos =
        artista?.instrumentos;


    /*
     * -----------------------------------------------------
     * INTERPRETAR JSON
     * -----------------------------------------------------
     *
     * Caso o Supabase retorne o conteúdo como texto:
     *
     * ["Violão","Guitarra","Piano"]
     */

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


    /*
     * -----------------------------------------------------
     * NORMALIZAR
     * -----------------------------------------------------
     */

    const lista =
        normalizarLista(
            instrumentos
        );


    /*
     * -----------------------------------------------------
     * LIMPAR E REMOVER DUPLICADOS
     * -----------------------------------------------------
     */

    const instrumentosUnicos = [
        ...new Set(

            lista
                .map(
                    item =>
                        String(
                            item
                        ).trim()
                )
                .filter(
                    Boolean
                )

        )
    ];


    /*
     * -----------------------------------------------------
     * NENHUM INSTRUMENTO
     * -----------------------------------------------------
     *
     * A seção fica completamente escondida.
     */

    if (
        !instrumentosUnicos.length
    ) {

        container.innerHTML =
            "";

        if (section) {

            section.style.display =
                "none";

        }

        log(
            "Nenhum instrumento cadastrado."
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * EXIBIR SEÇÃO
     * -----------------------------------------------------
     */

    if (section) {

        section.style.display =
            "";

    }


    /*
     * -----------------------------------------------------
     * RENDERIZAR
     * -----------------------------------------------------
     *
     * Usamos a mesma classe visual dos gêneros:
     *
     * .genre-tag
     *
     * Dessa forma não precisamos criar CSS novo.
     */

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


    /*
     * -----------------------------------------------------
     * LOG
     * -----------------------------------------------------
     */

    log(
        "Instrumentos renderizados:",
        instrumentosUnicos
    );


    /*
     * -----------------------------------------------------
     * ÍCONES
     * -----------------------------------------------------
     */

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


    log(
        "Renderizando serviços:",
        servicos
    );


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


    if (
        !servicos.length
    ) {

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

        return Utils.normalizarArray(
            valor
        );

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
                Boolean
            );

    }


    if (
        typeof valor === "string"
    ) {

        return valor
            .split(",")
            .map(
                item =>
                    item.trim()
            )
            .filter(
                Boolean
            );

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


    if (
        !botoes.length
    ) {

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


    if (
        atualizarHash
    ) {

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


    log(
        "Carregando aba:",
        nomeAba
    );


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


        log(
            "Aba carregada:",
            nomeAba
        );


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

    } else {

        if (
            !estado.servicos.length
        ) {

            await carregarServicos();

        }

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

    } else {

        aviso(
            "PerfilPublicoPortfolio não possui renderizar() ou inicializar()."
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

    } else {

        aviso(
            "PerfilPublicoAgenda não possui renderizar() ou inicializar()."
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
        formatarMoeda(
            total
        ),
        "R$ 0,00"
    );


    definirTexto(
        CONFIG.elementos.walletAvailable,
        formatarMoeda(
            disponivel
        ),
        "R$ 0,00"
    );


    definirTexto(
        CONFIG.elementos.walletPending,
        formatarMoeda(
            pendente
        ),
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


    const numero =
        Number(
            String(
                valor || 0
            )
            .replace(
                ",",
                "."
            )
        );


    if (
        !Number.isFinite(
            numero
        )
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


    window.location.href =
        url;

}


/* =====================================================
   EDITAR PERFIL
   ===================================================== */

function editarPerfil() {

    const tipo =
        normalizarTipoArtista(

            obterPrimeiroValor(

                estado.perfilArtista?.tipo_artista,

                estado.perfilArtista?.tipoArtista,

                estado.perfilArtista?.tipo,

                CONFIG.pagina.tipoArtista

            )

        );


    const paginas = {

        "Cantor(a)":
            "editar-perfil-cantor.html",

        "Músico(a)":
            "editar-perfil-musico.html",

        "Banda":
            "editar-perfil-banda.html",

        "Dupla musical":
            "editar-perfil-dupla.html",

        "DJ":
            "editar-perfil-dj.html",

        "Dançarino(a)":
            "editar-perfil-dancarino.html",

        "Grupo de dança":
            "editar-perfil-grupo-danca.html",

        "MC":
            "editar-perfil-mc.html",

        "Compositor(a)":
            "editar-perfil-compositor.html",

        "Produtor(a) musical":
            "editar-perfil-produtor-musical.html"

    };


    const pagina =
        paginas[tipo] ||
        "editar-perfil-cantor.html";


    window.location.href =
        pagina;

}


/* =====================================================
   NORMALIZAR TIPO ARTISTA
   ===================================================== */

function normalizarTipoArtista(
    valor
) {

    const texto =
        String(
            valor || ""
        )
        .trim()
        .toLowerCase();


    const mapa = {

        "cantor":
            "Cantor(a)",

        "cantora":
            "Cantor(a)",

        "cantor(a)":
            "Cantor(a)",

        "musico":
            "Músico(a)",

        "músico":
            "Músico(a)",

        "musica":
            "Músico(a)",

        "música":
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

        "grupo de dança":
            "Grupo de dança",

        "grupo dança":
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
            "Produtor(a) musical",

        "produtor(a) musical":
            "Produtor(a) musical"

    };


    return mapa[texto] ||
        valor ||
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

            estado.usuario?.nome,

            "artista"

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


    if (
        !numero
    ) {

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


    document.body.classList.add(
        "modal-open"
    );


    renderizarIcones();

}


/* =====================================================
   CONSTRUIR LINK DO PERFIL
   ===================================================== */

function construirLinkPerfil() {

    const id =
        estado.perfilId ||
        "";


    const diretorio =
        window.location.pathname.replace(
            /[^/]*$/,
            ""
        );


    return (
        `${window.location.origin}` +
        `${diretorio}` +
        `perfil-publico.html?id=${encodeURIComponent(
            id
        )}`
    );

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

    preencherServicos

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


/* =====================================================
   CONFIRMAÇÃO
   ===================================================== */

console.log(
    "PerfilPublico.js carregado."
);


})(window);
