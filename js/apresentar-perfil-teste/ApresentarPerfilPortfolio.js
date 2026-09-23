/* =========================================================
MUSICALWORLD — APRESENTAÇÃO DE PERFIL — PORTFÓLIO

Arquivo:
js/apresentar-perfil-teste/ApresentarPerfilPortfolio.js

Responsabilidades:

* Carregar o portfólio do perfil atual.
* Trabalhar exclusivamente com a tabela portfolio_musicos.
* Considerar somente itens ativos.
* Ignorar arquivos de áudio.
* Respeitar a ordem definida no banco.
* Priorizar o item marcado como destaque_catalogo.
* Identificar automaticamente imagem ou vídeo.
* Renderizar a mídia principal do perfil.
* Exibir o estado com mídia ou sem mídia.
* Criar e controlar o carrossel do portfólio.
* Exibir bolinhas para indicar a quantidade de mídias.
* Permitir navegação por swipe/arraste.
* Controlar a expansão da mídia.
* Não criar botões de anterior/próximo.
* Atualizar título e descrição do item atual.
* Não carregar dados de usuário, perfil ou serviços.

Regra importante:

* Arquivos de áudio nunca são exibidos nesta página.
* Áudios também não podem assumir a posição de destaque.

Dependências:

* window.ApresentarPerfilDadosTeste
* window.supabaseClient / window._supabase / window.supabase
* Estrutura HTML de apresentar-perfil-teste.html
  ========================================================= */

(function (window) {


"use strict";


/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    tabela: "portfolio_musicos",

    elementos: {

        post: "profilePost",

        media: "profileMedia",

        mediaOverlay: "profileMediaOverlay",

        expandir: "btnExpandMedia",

        headerSemMidia: "profileHeaderNoMedia",

        /*
         * Elementos antigos relacionados à identidade
         * da mídia foram mantidos na configuração para
         * preservar compatibilidade com versões anteriores.
         */

        nomeMedia: "profileNameMedia",

        tipoMedia: "profileTypeMedia",

        localizacaoMedia: "profileLocationMedia",

        avatarMedia: "profileAvatarMedia",

        iniciaisMedia: "profileInitialsMedia",

        indicadores: "profilePortfolioIndicators",

        /*
         * Elementos do conteúdo do portfólio.
         *
         * Estes elementos representam exclusivamente
         * o item atualmente selecionado.
         *
         * O título e a descrição são atualizados
         * sempre que a mídia atual é alterada.
         */

        portfolioContent:
            "profilePortfolioContent",

        portfolioItemTitle:
            "profilePortfolioTitle",

        portfolioItemDescription:
            "profilePortfolioDescription"

    },

    swipe: {

        distanciaMinima: 50

    }

};


/* =====================================================
   ESTADO INTERNO
   ===================================================== */

const estado = {

    carregando: false,

    carregado: false,

    erro: null,

    perfilId: null,

    itens: [],

    indiceAtual: 0,

    itemAtual: null,

    /*
     * Identifica a versão atual da reprodução.
     *
     * Toda vez que o usuário muda de mídia este valor
     * aumenta.
     *
     * Isso impede que eventos atrasados de um vídeo
     * anterior executem play() novamente.
     */

    reproducaoId: 0

};


/* =====================================================
   OBTÉM CLIENTE SUPABASE
   ===================================================== */

function obterClienteSupabase() {

    if (
        window.supabaseClient &&
        typeof window.supabaseClient.from === "function"
    ) {
        return window.supabaseClient;
    }


    if (
        window._supabase &&
        typeof window._supabase.from === "function"
    ) {
        return window._supabase;
    }


    if (
        window.supabase &&
        typeof window.supabase.from === "function"
    ) {
        return window.supabase;
    }


    return null;
}


/* =====================================================
   OBTÉM ID DO PERFIL
   ===================================================== */

function obterPerfilId() {

    if (
        window.ApresentarPerfilDadosTeste &&
        typeof window.ApresentarPerfilDadosTeste.obterPerfilId ===
            "function"
    ) {

        const id =
            window.ApresentarPerfilDadosTeste.obterPerfilId();


        if (id) {
            return id;
        }

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    return (
        params.get("id") ||
        params.get("perfil_id") ||
        params.get("perfilId") ||
        null
    );

}


/* =====================================================
   NORMALIZA ID
   ===================================================== */

function normalizarId(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return null;
    }


    return String(valor).trim() || null;

}


/* =====================================================
   OBTÉM ELEMENTO
   ===================================================== */

function obterElemento(id) {

    if (!id) {
        return null;
    }


    return document.getElementById(id);

}


/* =====================================================
   VALOR VÁLIDO
   ===================================================== */

function valorValido(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return false;
    }


    if (typeof valor === "string") {

        return valor.trim().length > 0;

    }


    return true;
}


/* =====================================================
   TEXTO
   ===================================================== */

function texto(valor) {

    if (!valorValido(valor)) {
        return "";
    }


    return String(valor).trim();

}


/* =====================================================
   ARRAY SEGURO
   ===================================================== */

function arraySeguro(valor) {

    if (Array.isArray(valor)) {

        return valor
            .filter(valorValido);

    }


    if (
        valor === null ||
        valor === undefined
    ) {
        return [];
    }


    if (typeof valor !== "string") {
        return [];
    }


    const textoValor =
        valor.trim();


    if (!textoValor) {
        return [];
    }


    if (
        textoValor.startsWith("{") &&
        textoValor.endsWith("}")
    ) {

        return textoValor
            .slice(1, -1)
            .split(",")
            .map(
                item => item.trim()
            )
            .filter(Boolean);

    }


    if (
        textoValor.startsWith("[") &&
        textoValor.endsWith("]")
    ) {

        try {

            const convertido =
                JSON.parse(
                    textoValor
                );


            if (Array.isArray(convertido)) {

                return convertido
                    .filter(valorValido)
                    .map(
                        item =>
                            String(item).trim()
                    );

            }

        } catch (erro) {

            /*
             * Mantém o tratamento abaixo.
             */

        }

    }


    if (textoValor.includes(",")) {

        return textoValor
            .split(",")
            .map(
                item => item.trim()
            )
            .filter(Boolean);

    }


    return [textoValor];

}


/* =====================================================
   IDENTIFICA URL
   ===================================================== */

function pareceUrl(valor) {

    if (!valorValido(valor)) {
        return false;
    }


    const valorTexto =
        String(valor).trim();


    return (
        valorTexto.startsWith("http://") ||
        valorTexto.startsWith("https://") ||
        valorTexto.startsWith("blob:") ||
        valorTexto.startsWith("data:image/") ||
        valorTexto.startsWith("data:video/") ||
        valorTexto.startsWith("data:audio/")
    );

}


/* =====================================================
   OBTÉM VALOR DE POSSÍVEIS CAMPOS
   ===================================================== */

function primeiroCampo(objeto, campos) {

    if (
        !objeto ||
        typeof objeto !== "object"
    ) {
        return "";
    }


    for (const campo of campos) {

        if (
            Object.prototype.hasOwnProperty.call(
                objeto,
                campo
            )
        ) {

            const valor =
                objeto[campo];


            if (valorValido(valor)) {

                return valor;

            }

        }

    }


    return "";
}


/* =====================================================
   DETECTA URL DA MÍDIA
   ===================================================== */

function obterUrlMidia(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return "";
    }


    const camposPrioritarios = [

        "url",

        "media_url",

        "arquivo_url",

        "arquivo",

        "url_midia",

        "midia_url",

        "foto_url",

        "imagem_url",

        "video_url",

        "audio_url",

        "thumbnail_url",

        "capa_url",

        "src"

    ];


    const valorDireto =
        primeiroCampo(
            item,
            camposPrioritarios
        );


    if (pareceUrl(valorDireto)) {

        return String(
            valorDireto
        ).trim();

    }


    const objetosPossiveis = [

        item.midia,

        item.media,

        item.arquivo,

        item.imagem,

        item.video,

        item.audio

    ];


    for (
        const objeto
        of objetosPossiveis
    ) {

        if (
            objeto &&
            typeof objeto === "object"
        ) {

            const url =
                primeiroCampo(
                    objeto,
                    [
                        "url",
                        "publicUrl",
                        "public_url",
                        "src",
                        "path"
                    ]
                );


            if (pareceUrl(url)) {

                return String(
                    url
                ).trim();

            }

        }

    }


    for (
        const chave
        of Object.keys(item)
    ) {

        const valor =
            item[chave];


        if (
            typeof valor === "string" &&
            pareceUrl(valor)
        ) {

            return valor.trim();

        }

    }


    return "";

}


/* =====================================================
   OBTÉM EXTENSÃO
   ===================================================== */

function obterExtensaoArquivo(url) {

    if (!valorValido(url)) {
        return "";
    }


    try {

        const semQuery =
            String(url)
                .split("?")[0]
                .split("#")[0];


        const partes =
            semQuery.split(".");


        if (partes.length < 2) {
            return "";
        }


        return partes
            .pop()
            .toLowerCase()
            .trim();

    } catch (erro) {

        return "";

    }

}


/* =====================================================
   IDENTIFICA SE É ÁUDIO
   ===================================================== */

function ehArquivoAudio(item, url = "") {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return false;
    }


    const tipoInformado =
        primeiroCampo(
            item,
            [
                "tipo",
                "tipo_midia",
                "tipoMidia",
                "media_type",
                "mediaType",
                "mime_type",
                "mimeType",
                "mime"
            ]
        );


    if (valorValido(tipoInformado)) {

        const tipo =
            String(tipoInformado)
                .toLowerCase()
                .trim();


        if (
            tipo.startsWith("audio/")
        ) {

            return true;

        }


        if (
            tipo === "audio" ||
            tipo === "áudio" ||
            tipo === "sound" ||
            tipo === "music" ||
            tipo === "mp3" ||
            tipo === "wav" ||
            tipo === "m4a" ||
            tipo === "aac" ||
            tipo === "flac" ||
            tipo === "opus" ||
            tipo === "oga"
        ) {

            return true;

        }

    }


    const mimeInformado =
        primeiroCampo(
            item,
            [
                "mime_type",
                "mimeType",
                "mime"
            ]
        );


    if (valorValido(mimeInformado)) {

        const mime =
            String(mimeInformado)
                .toLowerCase()
                .trim();


        if (
            mime.startsWith("audio/")
        ) {

            return true;

        }

    }


    const extensao =
        obterExtensaoArquivo(
            url ||
            obterUrlMidia(item)
        );


    return [
        "mp3",
        "wav",
        "m4a",
        "aac",
        "flac",
        "opus",
        "oga",
        "weba"
    ].includes(extensao);

}


/* =====================================================
   DETECTA TIPO DE MÍDIA
   ===================================================== */

function obterTipoMidia(item, url) {

    if (!item) {
        return "imagem";
    }


    if (
        ehArquivoAudio(
            item,
            url
        )
    ) {

        return "audio";

    }


    const tipoInformado =
        primeiroCampo(
            item,
            [
                "tipo",
                "tipo_midia",
                "media_type",
                "mime_type",
                "mime"
            ]
        );


    if (valorValido(tipoInformado)) {

        const tipo =
            String(tipoInformado)
                .toLowerCase()
                .trim();


        if (
            tipo.includes("video") ||
            tipo === "mp4" ||
            tipo === "webm" ||
            tipo === "mov" ||
            tipo === "m4v"
        ) {

            return "video";

        }


        if (
            tipo.includes("image") ||
            tipo === "imagem" ||
            tipo === "foto" ||
            tipo === "jpg" ||
            tipo === "jpeg" ||
            tipo === "png" ||
            tipo === "webp"
        ) {

            return "imagem";

        }

    }


    const extensao =
        obterExtensaoArquivo(
            url
        );


    if (
        [
            "mp4",
            "webm",
            "mov",
            "m4v",
            "ogg"
        ].includes(extensao)
    ) {

        return "video";

    }


    return "imagem";

}


/* =====================================================
   NORMALIZA ITEM
   ===================================================== */

function normalizarItem(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return null;
    }


    const url =
        obterUrlMidia(item);


    if (!url) {
        return null;
    }


    if (
        ehArquivoAudio(
            item,
            url
        )
    ) {

        console.info(
            "MusicalWorld — arquivo de áudio ignorado no portfólio:",
            item.id || url
        );


        return null;

    }


    const tipo =
        obterTipoMidia(
            item,
            url
        );


    if (
        tipo === "audio"
    ) {

        return null;

    }


    return {

        original: item,

        id:
            item.id || null,

        perfilId:
            item.perfil_id || null,

        url,

        tipo,

        titulo:
            texto(
                primeiroCampo(
                    item,
                    [
                        "titulo",
                        "title",
                        "nome"
                    ]
                )
            ),

        descricao:
            texto(
                primeiroCampo(
                    item,
                    [
                        "descricao",
                        "description",
                        "texto"
                    ]
                )
            ),

        destaque:
            Boolean(
                item.destaque_catalogo
            ),

        ordem:
            Number.isFinite(
                Number(item.ordem)
            )
                ? Number(item.ordem)
                : 999999

    };

}


/* =====================================================
   ORDENA PORTFÓLIO
   ===================================================== */

function ordenarPortfolio(itens) {

    const lista =
        Array.isArray(itens)
            ? [...itens]
            : [];


    lista.sort(
        (a, b) => {

            if (
                a.destaque &&
                !b.destaque
            ) {

                return -1;

            }


            if (
                !a.destaque &&
                b.destaque
            ) {

                return 1;

            }


            return (
                a.ordem -
                b.ordem
            );

        }
    );


    return lista;

}


/* =====================================================
   CARREGA PORTFÓLIO
   ===================================================== */

async function carregarPortfolio(
    perfilId = null
) {

    const supabase =
        obterClienteSupabase();


    if (!supabase) {

        throw new Error(
            "Cliente Supabase não encontrado."
        );

    }


    const id =
        normalizarId(
            perfilId ||
            obterPerfilId()
        );


    if (!id) {

        throw new Error(
            "ID do perfil não informado."
        );

    }


    estado.carregando = true;

    estado.erro = null;

    estado.perfilId = id;


    try {

        let consulta =
            await supabase
                .from(CONFIG.tabela)
                .select("*")
                .eq("perfil_id", id)
                .eq("ativo", true)
                .order(
                    "ordem",
                    {
                        ascending: true
                    }
                );


        if (
            consulta.error &&
            String(
                consulta.error.message || ""
            )
                .toLowerCase()
                .includes("ordem")
        ) {

            consulta =
                await supabase
                    .from(CONFIG.tabela)
                    .select("*")
                    .eq("perfil_id", id)
                    .eq("ativo", true);

        }


        if (consulta.error) {

            throw consulta.error;

        }


        const registros =
            Array.isArray(
                consulta.data
            )
                ? consulta.data
                : [];


        const itens =
            registros
                .map(normalizarItem)
                .filter(Boolean);


        estado.itens =
            ordenarPortfolio(
                itens
            );


        estado.indiceAtual = 0;

        estado.itemAtual =
            estado.itens[0] ||
            null;

        estado.carregado = true;


        console.info(
            "MusicalWorld — portfólio carregado:",
            {
                totalRegistros:
                    registros.length,

                totalMidiasVisuais:
                    estado.itens.length,

                audiosIgnorados:
                    registros.length -
                    estado.itens.length
            }
        );


        return estado.itens;

    } catch (erro) {

        console.error(
            "MusicalWorld — erro ao carregar portfólio:",
            erro
        );


        estado.erro =
            erro;


        estado.itens = [];

        estado.indiceAtual = 0;

        estado.itemAtual = null;


        throw erro;

    } finally {

        estado.carregando = false;

    }

}


/* =====================================================
   PAUSA TODOS OS VÍDEOS DO PORTFÓLIO
   ===================================================== */

function pausarVideosPortfolio() {

    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (!container) {
        return;
    }


    const videos =
        container.querySelectorAll(
            "video.profile-media-video"
        );


    videos.forEach(
        video => {

            try {

                video.pause();

            } catch (erro) {

                /*
                 * Ignora falha ao pausar.
                 */

            }

        }
    );

}


/* =====================================================
   VERIFICA SE O VÍDEO AINDA É O VÍDEO ATIVO
   ===================================================== */

function videoAindaEhAtivo(
    video,
    item,
    reproducaoId
) {

    if (!video) {
        return false;
    }


    if (
        reproducaoId !==
        estado.reproducaoId
    ) {

        return false;

    }


    if (
        item &&
        estado.itemAtual !== item
    ) {

        return false;

    }


    if (!video.isConnected) {
        return false;
    }


    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (!container) {
        return false;
    }


    if (
        !container.contains(video)
    ) {

        return false;

    }


    return true;

}


/* =====================================================
   LIMPA MÍDIA EXISTENTE
   ===================================================== */

function limparMidia() {

    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (!container) {
        return;
    }


    pausarVideosPortfolio();


    const elementos =
        container.querySelectorAll(
            ".profile-media-image, .profile-media-video"
        );


    elementos.forEach(
        elemento => {

            if (
                elemento.tagName === "VIDEO"
            ) {

                try {

                    elemento.pause();

                } catch (erro) {

                    /*
                     * Ignora falha ao pausar.
                     */

                }

            }


            elemento.remove();

        }
    );

}


/* =====================================================
   CRIA INDICADORES
   ===================================================== */

function criarIndicadores() {

    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (!container) {
        return;
    }


    let indicadores =
        obterElemento(
            CONFIG.elementos.indicadores
        );


    if (!indicadores) {

        indicadores =
            document.createElement(
                "div"
            );


        indicadores.id =
            CONFIG.elementos.indicadores;


        indicadores.className =
            "profile-portfolio-indicators";


        indicadores.setAttribute(
            "aria-label",
            "Navegação do portfólio"
        );


        container.appendChild(
            indicadores
        );

    }


    indicadores.innerHTML = "";


    if (
        estado.itens.length <= 1
    ) {

        indicadores.hidden = true;

        return;

    }


    indicadores.hidden = false;


    estado.itens.forEach(
        (item, indice) => {

            const indicador =
                document.createElement(
                    "button"
                );


            indicador.type =
                "button";


            indicador.className =
                "profile-portfolio-indicator";


            indicador.dataset.index =
                String(indice);


            indicador.setAttribute(
                "aria-label",
                `Ver item ${indice + 1} do portfólio`
            );


            indicador.setAttribute(
                "aria-current",
                indice ===
                estado.indiceAtual
                    ? "true"
                    : "false"
            );


            indicador.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();


                    irParaMidia(
                        indice
                    );

                }
            );


            indicadores.appendChild(
                indicador
            );

        }
    );


    atualizarIndicadores();

}


/* =====================================================
   ATUALIZA INDICADORES
   ===================================================== */

function atualizarIndicadores() {

    const indicadores =
        obterElemento(
            CONFIG.elementos.indicadores
        );


    if (!indicadores) {
        return;
    }


    const botoes =
        indicadores.querySelectorAll(
            ".profile-portfolio-indicator"
        );


    botoes.forEach(
        (botao, indice) => {

            const ativo =
                indice ===
                estado.indiceAtual;


            botao.classList.toggle(
                "is-active",
                ativo
            );


            botao.setAttribute(
                "aria-current",
                ativo
                    ? "true"
                    : "false"
            );

        }
    );

}


/* =====================================================
   CRIA IMAGEM
   ===================================================== */

function criarImagem(item) {

    const imagem =
        document.createElement(
            "img"
        );


    imagem.className =
        "profile-media-image";


    imagem.src =
        item.url;


    imagem.alt =
        item.titulo ||
        "Conteúdo do portfólio";


    imagem.loading =
        "eager";


    imagem.decoding =
        "async";


    imagem.addEventListener(
        "error",
        () => {

            console.warn(
                "MusicalWorld — não foi possível carregar a imagem do portfólio:",
                item.url
            );

        }
    );


    return imagem;

}


/* =====================================================
   INICIA REPRODUÇÃO DO VÍDEO
   ===================================================== */

function iniciarReproducaoVideo(
    video,
    item,
    reproducaoId
) {

    if (!video) {
        return;
    }


    if (
        !videoAindaEhAtivo(
            video,
            item,
            reproducaoId
        )
    ) {

        return;

    }


    video.autoplay = true;

    video.loop = true;

    video.playsInline = true;


    pausarVideosPortfolio();


    if (
        !videoAindaEhAtivo(
            video,
            item,
            reproducaoId
        )
    ) {

        return;

    }


    const promessa =
        video.play();


    if (
        promessa &&
        typeof promessa.then === "function"
    ) {

        promessa.then(
            function () {

                /*
                 * O usuário pode ter mudado de mídia
                 * enquanto play() estava sendo resolvido.
                 *
                 * Nesse caso, o vídeo antigo é pausado
                 * imediatamente.
                 */

                if (
                    !videoAindaEhAtivo(
                        video,
                        item,
                        reproducaoId
                    )
                ) {

                    try {

                        video.pause();

                    } catch (erro) {

                        /*
                         * Ignora falha ao pausar.
                         */

                    }

                }

            }
        ).catch(
            erro => {

                if (
                    videoAindaEhAtivo(
                        video,
                        item,
                        reproducaoId
                    )
                ) {

                    console.info(
                        "MusicalWorld — autoplay com áudio bloqueado pelo navegador. O usuário poderá iniciar o vídeo manualmente.",
                        erro
                    );

                }

            }
        );

    }

}


/* =====================================================
   CRIA VÍDEO
   ===================================================== */

function criarVideo(
    item,
    reproducaoId
) {

    const video =
        document.createElement(
            "video"
        );


    video.className =
        "profile-media-video";


    video.src =
        item.url;


    video.setAttribute(
        "playsinline",
        ""
    );


    video.setAttribute(
        "autoplay",
        ""
    );


    video.autoplay = true;


    video.setAttribute(
        "preload",
        "auto"
    );


    video.controls = true;


    video.loop = true;


    video.addEventListener(
        "loadeddata",
        function () {

            iniciarReproducaoVideo(
                video,
                item,
                reproducaoId
            );

        },
        {
            once: true
        }
    );


    video.addEventListener(
        "loadedmetadata",
        function () {

            iniciarReproducaoVideo(
                video,
                item,
                reproducaoId
            );

        },
        {
            once: true
        }
    );


    video.addEventListener(
        "error",
        () => {

            console.warn(
                "MusicalWorld — não foi possível carregar o vídeo do portfólio:",
                item.url
            );

        }
    );


    return video;

}


/* =====================================================
   ATUALIZA INFORMAÇÕES DO ITEM DO PORTFÓLIO

   Esta função atualiza exclusivamente os dados
   pertencentes ao item atualmente selecionado.

   Não exibe mais:
   - tipo do perfil;
   - avaliação;
   - estilos;
   - biografia;
   - informações profissionais.

   Os dados exibidos são:

   - título do item atual;
   - descrição do item atual.

   Quando o usuário muda de mídia, esta função é
   executada novamente para atualizar o conteúdo.
   ===================================================== */

function atualizarInformacoesMidia() {

    const item =
        estado.itemAtual;


    const container =
        obterElemento(
            CONFIG.elementos.portfolioContent
        );


    const titulo =
        obterElemento(
            CONFIG.elementos.portfolioItemTitle
        );


    const descricao =
        obterElemento(
            CONFIG.elementos.portfolioItemDescription
        );


    /*
     * Sem item de portfólio:
     *
     * toda a área de informações permanece oculta.
     */

    if (!item) {

        if (container) {
            container.hidden = true;
        }

        if (titulo) {
            titulo.textContent = "";
            titulo.hidden = true;
        }

        if (descricao) {
            descricao.textContent = "";
            descricao.hidden = true;
        }

        return;

    }


    /*
     * Título do item atual.
     */

    const possuiTitulo =
        Boolean(
            item.titulo &&
            item.titulo.trim()
        );


    if (titulo) {

        titulo.textContent =
            possuiTitulo
                ? item.titulo
                : "";

        titulo.hidden =
            !possuiTitulo;

    }


    /*
     * Descrição do item atual.
     */

    const possuiDescricao =
        Boolean(
            item.descricao &&
            item.descricao.trim()
        );


    if (descricao) {

        descricao.textContent =
            possuiDescricao
                ? item.descricao
                : "";

        descricao.hidden =
            !possuiDescricao;

    }


    /*
     * O bloco inteiro somente aparece quando
     * o item atual possui título ou descrição.
     */

    if (container) {

        container.hidden =
            !possuiTitulo &&
            !possuiDescricao;

    }

}


/* =====================================================
   RENDERIZA MÍDIA
   ===================================================== */

function renderizarMidia(
    item = null
) {

    /*
     * Cada renderização representa uma nova mídia.
     *
     * Incrementamos ANTES de limpar a mídia anterior.
     */

    estado.reproducaoId += 1;


    const reproducaoIdAtual =
        estado.reproducaoId;


    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    const headerSemMidia =
        obterElemento(
            CONFIG.elementos.headerSemMidia
        );


    if (!container) {
        return;
    }


    pausarVideosPortfolio();


    limparMidia();


    /*
     * Sem mídia:
     *
     * também escondemos o conteúdo do portfólio.
     */

    if (!item) {

        estado.itemAtual = null;


        container.hidden = true;


        if (headerSemMidia) {

            headerSemMidia.hidden =
                false;

        }


        const indicadores =
            obterElemento(
                CONFIG.elementos.indicadores
            );


        if (indicadores) {
            indicadores.hidden = true;
        }


        atualizarInformacoesMidia();


        return;

    }


    if (
        item.tipo === "audio" ||
        ehArquivoAudio(
            item.original || item,
            item.url
        )
    ) {

        estado.itemAtual = null;


        container.hidden = true;


        if (headerSemMidia) {

            headerSemMidia.hidden =
                false;

        }


        const indicadores =
            obterElemento(
                CONFIG.elementos.indicadores
            );


        if (indicadores) {
            indicadores.hidden = true;
        }


        atualizarInformacoesMidia();


        return;

    }


    container.hidden = false;


    if (headerSemMidia) {

        headerSemMidia.hidden =
            true;

    }


    /*
     * O item atual é definido antes da criação
     * do vídeo para que a validação consiga
     * identificar corretamente a mídia ativa.
     */

    estado.itemAtual =
        item;


    let elementoMidia;


    if (
        item.tipo === "video"
    ) {

        elementoMidia =
            criarVideo(
                item,
                reproducaoIdAtual
            );

    } else {

        elementoMidia =
            criarImagem(item);

    }


    const overlay =
        obterElemento(
            CONFIG.elementos.mediaOverlay
        );


    if (overlay) {

        container.insertBefore(
            elementoMidia,
            overlay
        );

    } else {

        container.appendChild(
            elementoMidia
        );

    }


    if (
        elementoMidia.tagName === "VIDEO"
    ) {

        iniciarReproducaoVideo(
            elementoMidia,
            item,
            reproducaoIdAtual
        );

    }


    /*
     * Atualiza título e descrição do item atual.
     */

    atualizarInformacoesMidia();


    /*
     * Atualiza os indicadores do carrossel.
     */

    criarIndicadores();

}


/* =====================================================
   RENDERIZA ESTADO COMPLETO
   ===================================================== */

function renderizar() {

    const itens =
        Array.isArray(
            estado.itens
        )
            ? estado.itens
            : [];


    if (!itens.length) {

        estado.itemAtual =
            null;


        renderizarMidia(
            null
        );


        return;

    }


    const indiceSeguro =
        Math.max(
            0,
            Math.min(
                estado.indiceAtual,
                itens.length - 1
            )
        );


    estado.indiceAtual =
        indiceSeguro;


    estado.itemAtual =
        itens[indiceSeguro];


    renderizarMidia(
        estado.itemAtual
    );

}


/* =====================================================
   VAI PARA UMA MÍDIA ESPECÍFICA
   ===================================================== */

function irParaMidia(indice) {

    if (
        !Array.isArray(
            estado.itens
        ) ||
        !estado.itens.length
    ) {
        return;
    }


    const novoIndice =
        Number(indice);


    if (
        !Number.isInteger(
            novoIndice
        )
    ) {
        return;
    }


    if (
        novoIndice < 0 ||
        novoIndice >=
            estado.itens.length
    ) {
        return;
    }


    pausarVideosPortfolio();


    estado.indiceAtual =
        novoIndice;


    estado.itemAtual =
        estado.itens[
            novoIndice
        ];


    renderizarMidia(
        estado.itemAtual
    );

}


/* =====================================================
   MOSTRA PRÓXIMA MÍDIA
   ===================================================== */

function proximaMidia() {

    if (
        estado.itens.length <= 1
    ) {
        return;
    }


    const proximoIndice =
        (
            estado.indiceAtual + 1
        ) %
        estado.itens.length;


    irParaMidia(
        proximoIndice
    );

}


/* =====================================================
   MOSTRA MÍDIA ANTERIOR
   ===================================================== */

function midiaAnterior() {

    if (
        estado.itens.length <= 1
    ) {
        return;
    }


    const indiceAnterior =
        (
            estado.indiceAtual -
            1 +
            estado.itens.length
        ) %
        estado.itens.length;


    irParaMidia(
        indiceAnterior
    );

}


/* =====================================================
   EXPANDIR MÍDIA
   ===================================================== */

function expandirMidia() {

    const item =
        estado.itemAtual;


    if (!item) {
        return;
    }


    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (
        container &&
        typeof container.requestFullscreen ===
            "function"
    ) {

        container
            .requestFullscreen()
            .catch(
                () => {

                    abrirMidiaEmNovaAba(
                        item
                    );

                }
            );


        return;

    }


    abrirMidiaEmNovaAba(
        item
    );

}


/* =====================================================
   ABRE MÍDIA EM NOVA ABA
   ===================================================== */

function abrirMidiaEmNovaAba(item) {

    if (
        !item ||
        !item.url
    ) {
        return;
    }


    window.open(
        item.url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =====================================================
   CONFIGURA BOTÃO DE EXPANSÃO
   ===================================================== */

function configurarBotaoExpandir() {

    const botao =
        obterElemento(
            CONFIG.elementos.expandir
        );


    if (!botao) {
        return;
    }


    if (
        botao.dataset.portfolioConfigurado ===
        "true"
    ) {
        return;
    }


    botao.dataset.portfolioConfigurado =
        "true";


    botao.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();

            evento.stopPropagation();


            expandirMidia();

        }
    );

}


/* =====================================================
   CONFIGURA NAVEGAÇÃO POR TECLADO
   ===================================================== */

function configurarTeclado() {

    if (
        document.body.dataset.portfolioTeclado ===
        "true"
    ) {
        return;
    }


    document.body.dataset.portfolioTeclado =
        "true";


    document.addEventListener(
        "keydown",
        function (evento) {

            const elemento =
                document.activeElement;


            if (
                elemento &&
                (
                    elemento.tagName === "INPUT" ||
                    elemento.tagName === "TEXTAREA" ||
                    elemento.tagName === "SELECT"
                )
            ) {

                return;

            }


            if (
                evento.key === "ArrowRight"
            ) {

                proximaMidia();

            }


            if (
                evento.key === "ArrowLeft"
            ) {

                midiaAnterior();

            }


            if (
                evento.key === "Escape"
            ) {

                const container =
                    obterElemento(
                        CONFIG.elementos.media
                    );


                if (
                    document.fullscreenElement &&
                    document.exitFullscreen
                ) {

                    document
                        .exitFullscreen()
                        .catch(
                            () => {}
                        );

                }


                if (
                    container &&
                    container.classList.contains(
                        "is-expanded"
                    )
                ) {

                    container.classList.remove(
                        "is-expanded"
                    );

                }

            }

        }
    );

}


/* =====================================================
   CONFIGURA SWIPE NO CELULAR
   ===================================================== */

function configurarSwipe() {

    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (!container) {
        return;
    }


    if (
        container.dataset.swipeConfigurado ===
        "true"
    ) {
        return;
    }


    container.dataset.swipeConfigurado =
        "true";


    let inicioX = 0;

    let inicioY = 0;


    container.addEventListener(
        "touchstart",
        function (evento) {

            if (
                !evento.touches ||
                !evento.touches.length
            ) {
                return;
            }


            inicioX =
                evento.touches[0].clientX;


            inicioY =
                evento.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    container.addEventListener(
        "touchend",
        function (evento) {

            if (
                !evento.changedTouches ||
                !evento.changedTouches.length
            ) {
                return;
            }


            const finalX =
                evento.changedTouches[0].clientX;


            const finalY =
                evento.changedTouches[0].clientY;


            const distanciaX =
                finalX - inicioX;


            const distanciaY =
                finalY - inicioY;


            if (
                Math.abs(distanciaX) <
                CONFIG.swipe.distanciaMinima
            ) {
                return;
            }


            if (
                Math.abs(distanciaX) <=
                Math.abs(distanciaY)
            ) {
                return;
            }


            if (
                distanciaX < 0
            ) {

                proximaMidia();

            } else {

                midiaAnterior();

            }

        },
        {
            passive: true
        }
    );

}


/* =====================================================
   CONFIGURA ARRASTE COM MOUSE
   ===================================================== */

function configurarArrasteMouse() {

    const container =
        obterElemento(
            CONFIG.elementos.media
        );


    if (!container) {
        return;
    }


    if (
        container.dataset.mouseDragConfigurado ===
        "true"
    ) {
        return;
    }


    container.dataset.mouseDragConfigurado =
        "true";


    let pressionado = false;

    let inicioX = 0;


    container.addEventListener(
        "mousedown",
        function (evento) {

            if (
                evento.button !== 0
            ) {
                return;
            }


            pressionado = true;

            inicioX =
                evento.clientX;


            container.classList.add(
                "is-dragging"
            );

        }
    );


    container.addEventListener(
        "mouseup",
        function (evento) {

            if (!pressionado) {
                return;
            }


            pressionado = false;


            container.classList.remove(
                "is-dragging"
            );


            const distanciaX =
                evento.clientX -
                inicioX;


            if (
                Math.abs(distanciaX) <
                CONFIG.swipe.distanciaMinima
            ) {
                return;
            }


            if (
                distanciaX < 0
            ) {

                proximaMidia();

            } else {

                midiaAnterior();

            }

        }
    );


    container.addEventListener(
        "mouseleave",
        function () {

            if (!pressionado) {
                return;
            }


            pressionado = false;


            container.classList.remove(
                "is-dragging"
            );

        }
    );

}


/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

async function inicializar() {

    configurarBotaoExpandir();

    configurarTeclado();

    configurarSwipe();

    configurarArrasteMouse();


    try {

        const itens =
            await carregarPortfolio();


        if (
            Array.isArray(itens) &&
            itens.length > 0
        ) {

            renderizar();

        } else {

            renderizarMidia(null);

        }

    } catch (erro) {

        console.error(
            "MusicalWorld — erro ao inicializar portfólio:",
            erro
        );


        estado.erro =
            erro;

        estado.itens = [];

        estado.itemAtual = null;

        renderizarMidia(null);

    }

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

window.ApresentarPerfilPortfolioTeste = {

    estado,

    carregarPortfolio,

    renderizar,

    renderizarMidia,

    proximaMidia,

    midiaAnterior,

    irParaMidia,

    expandirMidia,

    obterItens: function () {

        return [
            ...estado.itens
        ];

    },

    obterItemAtual: function () {

        return estado.itemAtual;

    },

    obterIndiceAtual: function () {

        return estado.indiceAtual;

    },

    ehArquivoAudio,

    inicializar

};


/* =====================================================
   INICIALIZAÇÃO SEGURA
   ===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializar,
        {
            once: true
        }
    );

} else {

    inicializar();

}


})(window);
