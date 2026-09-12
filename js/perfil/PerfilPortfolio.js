(function (window) {


"use strict";


/* ============================================================
   PERFIL PORTFÓLIO — MUSICALWORLD
   ============================================================

   Módulo UNIVERSAL de portfólio.

   O formulário do portfólio é permanente e já existe no HTML.

   Este módulo NÃO cria o formulário dinamicamente.

   Responsabilidades:

   - seleção de imagem, vídeo ou áudio;
   - upload para Supabase Storage;
   - cadastro;
   - edição;
   - exclusão lógica;
   - destaque;
   - carregamento;
   - renderização dos itens;
   - integração com PerfilEditor.

   O tipo artístico do perfil NÃO determina este módulo.

   O vínculo do portfólio é feito através de:

       perfil_id

   Já:

       imagem
       vídeo
       áudio

   representam o tipo da mídia do item.
*/


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

const CONFIG = {

    tabela:
        "portfolio_musicos",

    bucket:
        "portfolio-musicos",

    limiteArquivoMB:
        50,

    tiposMedia: {

        imagem: {

            label:
                "Imagem",

            extensoes: [
                "jpg",
                "jpeg",
                "png",
                "webp",
                "gif"
            ],

            accept:
                "image/*"

        },

        video: {

            label:
                "Vídeo",

            extensoes: [
                "mp4",
                "webm",
                "mov",
                "avi"
            ],

            accept:
                "video/*"

        },

        audio: {

            label:
                "Áudio",

            extensoes: [
                "mp3",
                "wav",
                "ogg",
                "m4a",
                "aac"
            ],

            accept:
                "audio/*"

        }

    }

};


/* ============================================================
   CONTEXTO
   ============================================================ */

let contexto = null;


/* ============================================================
   ESTADO
   ============================================================ */

const estado = {

    lista:
        [],

    tipoMedia:
        "imagem",

    editandoId:
        null,

    inicializado:
        false

};


/* ============================================================
   ELEMENTOS
   ============================================================ */

function obterElemento(id) {

    if (
        contexto?.utils &&
        typeof contexto.utils.el === "function"
    ) {

        return contexto.utils.el(id);

    }

    return document.getElementById(id);

}


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function escaparHtml(valor) {

    if (
        contexto?.utils &&
        typeof contexto.utils.escaparHtml === "function"
    ) {

        return contexto.utils.escaparHtml(valor);

    }

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function mostrarToast(
    mensagem,
    tipo = "sucesso"
) {

    if (
        contexto?.utils &&
        typeof contexto.utils.mostrarToast === "function"
    ) {

        contexto.utils.mostrarToast(
            mensagem,
            tipo
        );

        return;

    }

    alert(mensagem);

}


function atualizarIcones() {

    if (
        contexto?.utils &&
        typeof contexto.utils.atualizarIcones === "function"
    ) {

        contexto.utils.atualizarIcones();

        return;

    }

    if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
    ) {

        window.lucide.createIcons();

    }

}


function mostrarLoading(
    texto = "Carregando..."
) {

    if (
        contexto?.utils &&
        typeof contexto.utils.mostrarLoading === "function"
    ) {

        contexto.utils.mostrarLoading(
            texto
        );

    }

}


function esconderLoading() {

    if (
        contexto?.utils &&
        typeof contexto.utils.esconderLoading === "function"
    ) {

        contexto.utils.esconderLoading();

    }

}


/* ============================================================
   CONTEXTO DO PERFIL
   ============================================================ */

function obterPerfilId() {

    return (
        contexto?.estado?.perfil?.id ||
        null
    );

}


function obterUsuarioId() {

    return (
        contexto?.estado?.usuarioAuth?.id ||
        null
    );

}


function obterTipoPerfilAtual() {

    return (
        contexto?.estado?.perfilArtista?.tipo_artista ||
        ""
    );

}


/* ============================================================
   NORMALIZAÇÃO DE TIPO DE MÍDIA
   ============================================================ */

function normalizarTipo(tipo) {

    const valor =
        String(tipo || "")
            .trim()
            .toLowerCase();


    if (
        valor === "imagem" ||
        valor === "image"
    ) {

        return "imagem";

    }


    if (
        valor === "video" ||
        valor === "vídeo"
    ) {

        return "video";

    }


    if (
        valor === "audio" ||
        valor === "áudio"
    ) {

        return "audio";

    }


    return "imagem";

}


function obterTipoBotao(botao) {

    if (!botao) {

        return "imagem";

    }


    const tipo =
        botao.dataset.mediaType ||
        botao.dataset.tipo ||
        botao.getAttribute(
            "data-media-type"
        ) ||
        botao.getAttribute(
            "data-tipo"
        ) ||
        "";


    return normalizarTipo(
        tipo
    );

}


function obterIconeTipo(tipo) {

    switch (
        normalizarTipo(tipo)
    ) {

        case "video":
            return "video";

        case "audio":
            return "music-2";

        case "imagem":
        default:
            return "image";

    }

}


function obterLabelTipo(tipo) {

    const tipoNormalizado =
        normalizarTipo(tipo);


    return (
        CONFIG
            .tiposMedia[
                tipoNormalizado
            ]?.label ||
        "Mídia"
    );

}


/* ============================================================
   BOTÕES DE TIPO
   ============================================================ */

function atualizarBotoesTipo() {

    document
        .querySelectorAll(
            ".portfolio-tipo"
        )
        .forEach(
            botao => {

                const tipoBotao =
                    obterTipoBotao(
                        botao
                    );


                botao.classList.toggle(
                    "ativo",
                    tipoBotao ===
                    estado.tipoMedia
                );

            }
        );

}


function selecionarTipo(tipo) {

    estado.tipoMedia =
        normalizarTipo(
            tipo
        );


    if (
        contexto?.estado
    ) {

        contexto.estado.tipoMedia =
            estado.tipoMedia;

    }


    atualizarBotoesTipo();


    const arquivoInput =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    if (arquivoInput) {

        arquivoInput.value =
            "";

    }


    atualizarCampoArquivo();

    atualizarIcones();

}


/* ============================================================
   ARQUIVO
   ============================================================ */

function obterExtensao(
    nomeArquivo
) {

    const nome =
        String(
            nomeArquivo || ""
        );


    const partes =
        nome.split(".");


    if (
        partes.length < 2
    ) {

        return "";

    }


    return partes
        .pop()
        .toLowerCase()
        .trim();

}


function obterNomeArquivoSeguro(
    nomeArquivo
) {

    const nome =
        String(
            nomeArquivo || ""
        )
            .trim()
            .replace(
                /[^\w.-]+/g,
                "-"
            )
            .replace(
                /-+/g,
                "-"
            );


    return (
        nome ||
        "arquivo"
    );

}


function validarArquivo(
    arquivo,
    tipo
) {

    if (!arquivo) {

        throw new Error(
            "Selecione um arquivo."
        );

    }


    const tamanhoMB =
        arquivo.size /
        (1024 * 1024);


    if (
        tamanhoMB >
        CONFIG.limiteArquivoMB
    ) {

        throw new Error(
            `O arquivo não pode ultrapassar ${CONFIG.limiteArquivoMB} MB.`
        );

    }


    const tipoNormalizado =
        normalizarTipo(
            tipo
        );


    const configuracao =
        CONFIG.tiposMedia[
            tipoNormalizado
        ];


    if (!configuracao) {

        throw new Error(
            "Tipo de mídia inválido."
        );

    }


    const extensao =
        obterExtensao(
            arquivo.name
        );


    if (
        configuracao.extensoes.length &&
        !configuracao.extensoes.includes(
            extensao
        )
    ) {

        throw new Error(
            `Formato de arquivo não permitido para ${configuracao.label.toLowerCase()}.`
        );

    }


    return true;

}


function atualizarCampoArquivo() {

    const arquivoInput =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    const ajuda =
        obterElemento(
            contexto?.ids?.portfolioAjuda ||
            "portfolioAjuda"
        );


    if (!arquivoInput) {

        return;

    }


    const configuracao =
        CONFIG.tiposMedia[
            estado.tipoMedia
        ];


    if (configuracao) {

        arquivoInput.accept =
            configuracao.accept;

    }


    if (ajuda) {

        if (
            estado.tipoMedia ===
            "imagem"
        ) {

            ajuda.textContent =
                "JPG, PNG, WEBP ou GIF. Máximo de 50 MB.";

        } else if (
            estado.tipoMedia ===
            "video"
        ) {

            ajuda.textContent =
                "MP4, WEBM, MOV ou AVI. Máximo de 50 MB.";

        } else {

            ajuda.textContent =
                "MP3, WAV, OGG, M4A ou AAC. Máximo de 50 MB.";

        }

    }

}


function arquivoSelecionado() {

    const arquivoInput =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    if (!arquivoInput) {

        return null;

    }


    const arquivo =
        arquivoInput.files?.[0];


    if (!arquivo) {

        return null;

    }


    try {

        validarArquivo(
            arquivo,
            estado.tipoMedia
        );


        return arquivo;

    } catch (erro) {

        arquivoInput.value =
            "";


        mostrarToast(
            erro.message,
            "erro"
        );


        return null;

    }

}


/* ============================================================
   UPLOAD
   ============================================================ */

async function fazerUpload(
    arquivo
) {

    validarArquivo(
        arquivo,
        estado.tipoMedia
    );


    const usuarioId =
        obterUsuarioId();


    if (!usuarioId) {

        throw new Error(
            "Usuário não autenticado."
        );

    }


    const extensao =
        obterExtensao(
            arquivo.name
        );


    const nomeOriginal =
        obterNomeArquivoSeguro(
            arquivo.name
        );


    const timestamp =
        Date.now();


    const aleatorio =
        Math.random()
            .toString(36)
            .substring(
                2,
                8
            );


    const nomeArquivo =
        `${timestamp}-${aleatorio}-${nomeOriginal}`;


    const caminho =
        `${usuarioId}/${nomeArquivo}`;


    const {
        error
    } =
        await contexto.supabase.storage
            .from(
                CONFIG.bucket
            )
            .upload(
                caminho,
                arquivo,
                {
                    upsert:
                        false,

                    cacheControl:
                        "3600",

                    contentType:
                        arquivo.type ||
                        undefined
                }
            );


    if (error) {

        throw error;

    }


    const {
        data
    } =
        contexto.supabase.storage
            .from(
                CONFIG.bucket
            )
            .getPublicUrl(
                caminho
            );


    if (
        !data?.publicUrl
    ) {

        throw new Error(
            "Não foi possível obter a URL pública do arquivo."
        );

    }


    return {

        url:
            data.publicUrl,

        caminho,

        extensao

    };

}


/* ============================================================
   FORMULÁRIO PERMANENTE
   ============================================================ */

function obterDadosFormulario() {

    const titulo =
        obterElemento(
            contexto?.ids?.portfolioTitulo ||
            "portfolioTitulo"
        );


    const descricao =
        obterElemento(
            contexto?.ids?.portfolioDescricao ||
            "portfolioDescricao"
        );


    const arquivo =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    const url =
        obterElemento(
            contexto?.ids?.portfolioUrl ||
            "portfolioUrl"
        );


    return {

        titulo:
            String(
                titulo?.value || ""
            ).trim(),

        descricao:
            String(
                descricao?.value || ""
            ).trim() ||
            null,

        arquivo:
            arquivo?.files?.[0] ||
            null,

        url:
            String(
                url?.value || ""
            ).trim() ||
            null,

        tipo:
            normalizarTipo(
                estado.tipoMedia
            )

    };

}


function obterProximaOrdem() {

    if (
        !estado.lista.length
    ) {

        return 0;

    }


    const ordens =
        estado.lista
            .map(
                item =>
                    Number(
                        item.ordem
                    )
            )
            .filter(
                numero =>
                    Number.isFinite(
                        numero
                    )
            );


    if (
        !ordens.length
    ) {

        return estado.lista.length;

    }


    return (
        Math.max(
            ...ordens
        ) + 1
    );

}


function atualizarEstadoBotaoFormulario() {

    const botao =
        obterElemento(
            contexto?.ids?.btnAdicionarPortfolio ||
            "btnAdicionarPortfolio"
        );


    const cancelar =
        obterElemento(
            "btnCancelarEdicaoPortfolio"
        );


    if (botao) {

        if (estado.editandoId) {

            botao.innerHTML =
                '<i data-lucide="save"></i><span>Atualizar portfólio</span>';

        } else {

            botao.innerHTML =
                '<i data-lucide="plus"></i><span>Adicionar ao portfólio</span>';

        }

    }


    if (cancelar) {

        cancelar.style.display =
            estado.editandoId
                ? "inline-flex"
                : "none";

    }


    atualizarIcones();

}


/* ============================================================
   SALVAR / ADICIONAR
   ============================================================ */

async function adicionar() {

    try {

        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            throw new Error(
                "Perfil artístico não encontrado."
            );

        }


        const dados =
            obterDadosFormulario();


        if (!dados.titulo) {

            throw new Error(
                "Informe um título para o item do portfólio."
            );

        }


        let arquivoUrl =
            dados.url ||
            null;


        if (
            dados.arquivo
        ) {

            const upload =
                await fazerUpload(
                    dados.arquivo
                );


            arquivoUrl =
                upload.url;

        }


        if (
            !arquivoUrl &&
            estado.editandoId
        ) {

            const itemAtual =
                estado.lista.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            estado.editandoId
                        )
                );


            arquivoUrl =
                itemAtual?.arquivo_url ||
                null;

        }


        if (!arquivoUrl) {

            throw new Error(
                "Selecione um arquivo ou informe uma URL."
            );

        }


        const tipo =
            normalizarTipo(
                dados.tipo
            );


        mostrarLoading(
            estado.editandoId
                ? "Atualizando portfólio..."
                : "Salvando portfólio..."
        );


        const agora =
            new Date()
                .toISOString();


        /* ----------------------------------------------------
           EDIÇÃO
        ---------------------------------------------------- */

        if (
            estado.editandoId
        ) {

            const dadosAtualizacao = {

                tipo,

                titulo:
                    dados.titulo,

                descricao:
                    dados.descricao,

                arquivo_url:
                    arquivoUrl,

                updated_at:
                    agora

            };


            const {
                error
            } =
                await contexto.supabase
                    .from(
                        CONFIG.tabela
                    )
                    .update(
                        dadosAtualizacao
                    )
                    .eq(
                        "id",
                        estado.editandoId
                    )
                    .eq(
                        "perfil_id",
                        perfilId
                    );


            if (error) {

                throw error;

            }


            mostrarToast(
                "Item do portfólio atualizado com sucesso.",
                "sucesso"
            );


        } else {

            /* ------------------------------------------------
               NOVO ITEM
            ------------------------------------------------ */

            const dadosInsercao = {

                perfil_id:
                    perfilId,

                tipo,

                titulo:
                    dados.titulo,

                descricao:
                    dados.descricao,

                arquivo_url:
                    arquivoUrl,

                ativo:
                    true,

                destaque_catalogo:
                    false,

                ordem:
                    obterProximaOrdem()

            };


            const {
                error
            } =
                await contexto.supabase
                    .from(
                        CONFIG.tabela
                    )
                    .insert(
                        dadosInsercao
                    );


            if (error) {

                throw error;

            }


            mostrarToast(
                "Item adicionado ao portfólio.",
                "sucesso"
            );

        }


        limparFormulario();

        await carregar();

    } catch (erro) {

        console.error(
            "PerfilPortfolio: erro ao salvar:",
            erro
        );


        mostrarToast(
            erro?.message ||
            "Não foi possível salvar o item do portfólio.",
            "erro"
        );

    } finally {

        esconderLoading();

        atualizarIcones();

    }

}


/* ============================================================
   SALVAR
   ============================================================ */

async function salvar() {

    return await adicionar();

}


/* ============================================================
   EDITAR
   ============================================================ */

async function editar(id) {

    const item =
        estado.lista.find(
            registro =>
                String(
                    registro.id
                ) ===
                String(id)
        );


    if (!item) {

        mostrarToast(
            "Item do portfólio não encontrado.",
            "erro"
        );

        return;

    }


    estado.editandoId =
        item.id;


    if (
        contexto?.estado
    ) {

        contexto.estado.editandoPortfolioId =
            item.id;

    }


    estado.tipoMedia =
        normalizarTipo(
            item.tipo
        );


    if (
        contexto?.estado
    ) {

        contexto.estado.tipoMedia =
            estado.tipoMedia;

    }


    const titulo =
        obterElemento(
            contexto?.ids?.portfolioTitulo ||
            "portfolioTitulo"
        );


    const descricao =
        obterElemento(
            contexto?.ids?.portfolioDescricao ||
            "portfolioDescricao"
        );


    const url =
        obterElemento(
            contexto?.ids?.portfolioUrl ||
            "portfolioUrl"
        );


    const arquivo =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    if (titulo) {

        titulo.value =
            item.titulo ||
            "";

    }


    if (descricao) {

        descricao.value =
            item.descricao ||
            "";

    }


    if (url) {

        url.value =
            item.arquivo_url ||
            "";

    }


    if (arquivo) {

        arquivo.value =
            "";

    }


    atualizarBotoesTipo();

    atualizarCampoArquivo();

    atualizarEstadoBotaoFormulario();


    const formulario =
        obterElemento(
            "portfolioForm"
        );


    if (formulario) {

        formulario.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });

    }


    if (titulo) {

        setTimeout(
            () => {

                titulo.focus();

            },
            350
        );

    }

}


/* ============================================================
   EXCLUIR
   ============================================================ */

async function excluir(id) {

    const item =
        estado.lista.find(
            registro =>
                String(
                    registro.id
                ) ===
                String(id)
        );


    if (!item) {

        mostrarToast(
            "Item do portfólio não encontrado.",
            "erro"
        );

        return;

    }


    const confirmar =
        window.confirm(
            `Deseja excluir "${item.titulo || "este item"}" do portfólio?`
        );


    if (!confirmar) {

        return;

    }


    try {

        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            throw new Error(
                "Perfil artístico não encontrado."
            );

        }


        mostrarLoading(
            "Excluindo item..."
        );


        const agora =
            new Date()
                .toISOString();


        const {
            error
        } =
            await contexto.supabase
                .from(
                    CONFIG.tabela
                )
                .update({

                    ativo:
                        false,

                    destaque_catalogo:
                        false,

                    updated_at:
                        agora

                })
                .eq(
                    "id",
                    id
                )
                .eq(
                    "perfil_id",
                    perfilId
                );


        if (error) {

            throw error;

        }


        if (
            String(
                estado.editandoId
            ) ===
            String(id)
        ) {

            limparFormulario();

        }


        mostrarToast(
            "Item removido do portfólio.",
            "sucesso"
        );


        await carregar();

    } catch (erro) {

        console.error(
            "PerfilPortfolio: erro ao excluir:",
            erro
        );


        mostrarToast(
            erro?.message ||
            "Não foi possível excluir o item.",
            "erro"
        );

    } finally {

        esconderLoading();

        atualizarIcones();

    }

}


/* ============================================================
   DESTAQUE
   ============================================================ */

async function alternarDestaque(id) {

    const item =
        estado.lista.find(
            registro =>
                String(
                    registro.id
                ) ===
                String(id)
        );


    if (!item) {

        return;

    }


    const tipo =
        normalizarTipo(
            item.tipo
        );


    if (
        tipo !== "imagem" &&
        tipo !== "video"
    ) {

        mostrarToast(
            "Apenas imagens e vídeos podem ser destacados.",
            "erro"
        );

        return;

    }


    try {

        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            throw new Error(
                "Perfil artístico não encontrado."
            );

        }


        mostrarLoading(
            "Atualizando destaque..."
        );


        const agora =
            new Date()
                .toISOString();


        const {
            error: erroLimpar
        } =
            await contexto.supabase
                .from(
                    CONFIG.tabela
                )
                .update({

                    destaque_catalogo:
                        false,

                    updated_at:
                        agora

                })
                .eq(
                    "perfil_id",
                    perfilId
                )
                .eq(
                    "ativo",
                    true
                );


        if (erroLimpar) {

            throw erroLimpar;

        }


        const {
            error: erroDestacar
        } =
            await contexto.supabase
                .from(
                    CONFIG.tabela
                )
                .update({

                    destaque_catalogo:
                        true,

                    updated_at:
                        agora

                })
                .eq(
                    "id",
                    id
                )
                .eq(
                    "perfil_id",
                    perfilId
                );


        if (erroDestacar) {

            throw erroDestacar;

        }


        mostrarToast(
            "Destaque do portfólio atualizado.",
            "sucesso"
        );


        await carregar();

    } catch (erro) {

        console.error(
            "PerfilPortfolio: erro ao destacar:",
            erro
        );


        mostrarToast(
            erro?.message ||
            "Não foi possível atualizar o destaque.",
            "erro"
        );

    } finally {

        esconderLoading();

        atualizarIcones();

    }

}


/* ============================================================
   LIMPAR FORMULÁRIO
   ============================================================ */

function limparFormulario() {

    estado.editandoId =
        null;


    estado.tipoMedia =
        "imagem";


    if (
        contexto?.estado
    ) {

        contexto.estado.editandoPortfolioId =
            null;

        contexto.estado.tipoMedia =
            "imagem";

    }


    const titulo =
        obterElemento(
            contexto?.ids?.portfolioTitulo ||
            "portfolioTitulo"
        );


    const descricao =
        obterElemento(
            contexto?.ids?.portfolioDescricao ||
            "portfolioDescricao"
        );


    const arquivo =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    const url =
        obterElemento(
            contexto?.ids?.portfolioUrl ||
            "portfolioUrl"
        );


    if (titulo) {

        titulo.value =
            "";

    }


    if (descricao) {

        descricao.value =
            "";

    }


    if (arquivo) {

        arquivo.value =
            "";

    }


    if (url) {

        url.value =
            "";

    }


    atualizarBotoesTipo();

    atualizarCampoArquivo();

    atualizarEstadoBotaoFormulario();

}


/* ============================================================
   PREVIEW
   ============================================================ */

function obterPreview(item) {

    const tipo =
        normalizarTipo(
            item.tipo
        );


    const url =
        item.arquivo_url ||
        "";


    if (!url) {

        return `
            <div class="media-edit-preview media-edit-preview-vazio">
                <i data-lucide="file-question"></i>
            </div>
        `;

    }


    if (
        tipo === "imagem"
    ) {

        return `
            <div class="media-edit-preview">
                <img
                    src="${escaparHtml(url)}"
                    alt="${escaparHtml(item.titulo || "Imagem do portfólio")}"
                    loading="lazy"
                >
            </div>
        `;

    }


    if (
        tipo === "video"
    ) {

        return `
            <div class="media-edit-preview">
                <video
                    src="${escaparHtml(url)}"
                    controls
                    preload="metadata"
                ></video>
            </div>
        `;

    }


    if (
        tipo === "audio"
    ) {

        return `
            <div class="media-edit-preview media-edit-preview-audio">

                <i data-lucide="music-2"></i>

                <audio
                    src="${escaparHtml(url)}"
                    controls
                    preload="metadata"
                ></audio>

            </div>
        `;

    }


    return `
        <div class="media-edit-preview media-edit-preview-vazio">
            <i data-lucide="file"></i>
        </div>
    `;

}


/* ============================================================
   RENDERIZAR ITENS
   ============================================================ */

function renderizar() {

    const lista =
        obterElemento(
            contexto?.ids?.portfolioEditList ||
            "portfolioEditList"
        );


    if (!lista) {

        console.warn(
            "PerfilPortfolio: #portfolioEditList não encontrado."
        );

        return;

    }


    if (
        !estado.lista.length
    ) {

        lista.innerHTML = `

            <div class="portfolio-list-empty">

                <div class="empty-state">

                    <i data-lucide="images"></i>

                    <strong>
                        Nenhum item no portfólio
                    </strong>

                    <span>
                        Adicione fotos, vídeos ou áudios para apresentar seu trabalho.
                    </span>

                </div>

            </div>

        `;

    } else {

        lista.innerHTML = `

            <div class="portfolio-items">

                ${estado.lista
                    .map(
                        item => {

                            const tipo =
                                normalizarTipo(
                                    item.tipo
                                );


                            const destaque =
                                item.destaque_catalogo === true;


                            const tipoPermitidoDestaque =
                                tipo === "imagem" ||
                                tipo === "video";


                            return `

                                <article
                                    class="media-edit-card"
                                    data-portfolio-id="${escaparHtml(item.id)}"
                                >

                                    ${obterPreview(item)}


                                    <div class="media-edit-info">

                                        <div class="media-edit-type">

                                            <i
                                                data-lucide="${obterIconeTipo(tipo)}"
                                            ></i>

                                            <span>
                                                ${escaparHtml(
                                                    obterLabelTipo(tipo)
                                                )}
                                            </span>

                                        </div>


                                        <h3>
                                            ${escaparHtml(
                                                item.titulo ||
                                                "Sem título"
                                            )}
                                        </h3>


                                        ${
                                            item.descricao
                                                ? `
                                                    <p>
                                                        ${escaparHtml(
                                                            item.descricao
                                                        )}
                                                    </p>
                                                `
                                                : ""
                                        }


                                        ${
                                            destaque
                                                ? `
                                                    <span class="media-edit-destaque">

                                                        <i data-lucide="star"></i>

                                                        Destaque

                                                    </span>
                                                `
                                                : ""
                                        }

                                    </div>


                                    <div class="media-edit-actions">

                                        ${
                                            tipoPermitidoDestaque
                                                ? `
                                                    <button
                                                        type="button"
                                                        class="btn-destaque ${
                                                            destaque
                                                                ? "ativo"
                                                                : ""
                                                        }"
                                                        data-destaque-portfolio="${escaparHtml(item.id)}"
                                                        title="${
                                                            destaque
                                                                ? "Remover destaque"
                                                                : "Definir como destaque"
                                                        }"
                                                    >

                                                        <i data-lucide="star"></i>

                                                    </button>
                                                `
                                                : ""
                                        }


                                        <button
                                            type="button"
                                            class="btn-editar-portfolio"
                                            data-editar-portfolio="${escaparHtml(item.id)}"
                                            title="Editar item"
                                        >

                                            <i data-lucide="pencil"></i>

                                        </button>


                                        <button
                                            type="button"
                                            class="btn-excluir"
                                            data-excluir-portfolio="${escaparHtml(item.id)}"
                                            title="Excluir item"
                                        >

                                            <i data-lucide="trash-2"></i>

                                        </button>

                                    </div>

                                </article>

                            `;

                        }
                    )
                    .join("")}

            </div>

        `;

    }


    inicializarEventosLista();

    atualizarIcones();

}


/* ============================================================
   EVENTOS DA LISTA
   ============================================================ */

function inicializarEventosLista() {

    document
        .querySelectorAll(
            "[data-editar-portfolio]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        editar(
                            botao.dataset.editarPortfolio
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-excluir-portfolio]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        excluir(
                            botao.dataset.excluirPortfolio
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-destaque-portfolio]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        alternarDestaque(
                            botao.dataset.destaquePortfolio
                        );

                    }
                );

            }
        );

}


/* ============================================================
   EVENTOS DO FORMULÁRIO PERMANENTE
   ============================================================ */

function inicializarFormulario() {

    const arquivoInput =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );


    if (
        arquivoInput &&
        !arquivoInput.dataset.portfolioEvento
    ) {

        arquivoInput.addEventListener(
            "change",
            arquivoSelecionado
        );


        arquivoInput.dataset.portfolioEvento =
            "true";

    }


    document
        .querySelectorAll(
            ".portfolio-tipo"
        )
        .forEach(
            botao => {

                if (
                    botao.dataset.portfolioEvento
                ) {

                    return;

                }


                botao.addEventListener(
                    "click",
                    evento => {

                        evento.preventDefault();

                        selecionarTipo(
                            obterTipoBotao(
                                botao
                            )
                        );

                    }
                );


                botao.dataset.portfolioEvento =
                    "true";

            }
        );


    const botaoAdicionar =
        obterElemento(
            contexto?.ids?.btnAdicionarPortfolio ||
            "btnAdicionarPortfolio"
        );


    if (
        botaoAdicionar &&
        !botaoAdicionar.dataset.portfolioEvento
    ) {

        botaoAdicionar.addEventListener(
            "click",
            evento => {

                evento.preventDefault();

                adicionar();

            }
        );


        botaoAdicionar.dataset.portfolioEvento =
            "true";

    }


    const botaoCancelar =
        obterElemento(
            "btnCancelarEdicaoPortfolio"
        );


    if (
        botaoCancelar &&
        !botaoCancelar.dataset.portfolioEvento
    ) {

        botaoCancelar.addEventListener(
            "click",
            evento => {

                evento.preventDefault();

                limparFormulario();

            }
        );


        botaoCancelar.dataset.portfolioEvento =
            "true";

    }


    atualizarEstadoBotaoFormulario();

    atualizarBotoesTipo();

    atualizarCampoArquivo();

}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

function inicializar() {

    estado.inicializado =
        true;


    inicializarFormulario();

    atualizarBotoesTipo();

    atualizarCampoArquivo();

    atualizarEstadoBotaoFormulario();

    atualizarIcones();

}


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

function configurar(
    novoContexto
) {

    contexto =
        novoContexto;


    if (
        !contexto?.estado
    ) {

        console.error(
            "PerfilPortfolio: contexto inválido."
        );

        return;

    }


    estado.tipoMedia =
        normalizarTipo(
            contexto.estado.tipoMedia ||
            "imagem"
        );


    estado.editandoId =
        contexto.estado.editandoPortfolioId ||
        null;


    contexto.estado.portfolio =
        estado.lista;

}


/* ============================================================
   CARREGAR
   ============================================================ */

async function carregar() {

    try {

        console.log(
            "PerfilPortfolio: iniciando carregamento..."
        );


        const perfilId =
            obterPerfilId();


        console.log(
            "PerfilPortfolio: perfilId:",
            perfilId
        );


        if (!perfilId) {

            console.warn(
                "PerfilPortfolio: perfil ainda não disponível."
            );

            return [];

        }


        if (!contexto?.supabase) {

            console.error(
                "PerfilPortfolio: contexto.supabase não disponível."
            );

            throw new Error(
                "Supabase não está disponível para o portfólio."
            );

        }


        console.log(
            "PerfilPortfolio: consultando tabela:",
            CONFIG.tabela
        );


        console.log(
            "PerfilPortfolio: buscando perfil_id:",
            perfilId
        );


        const resultado =
            await contexto.supabase
                .from(
                    CONFIG.tabela
                )
                .select(
                    "id,perfil_id,tipo,titulo,descricao,arquivo_url,thumbnail_url,ordem,ativo,destaque_catalogo,created_at,updated_at"
                )
                .eq(
                    "perfil_id",
                    perfilId
                )
                .eq(
                    "ativo",
                    true
                )
                .order(
                    "ordem",
                    {
                        ascending:
                            true
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        const data =
            resultado.data;


        const error =
            resultado.error;


        console.log(
            "PerfilPortfolio: resultado da consulta:",
            {
                data,
                error,
                quantidade:
                    Array.isArray(data)
                        ? data.length
                        : 0
            }
        );


        if (error) {

            console.error(
                "PerfilPortfolio: erro retornado pelo Supabase:",
                error
            );

            throw error;

        }


        estado.lista =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "PerfilPortfolio: itens carregados:",
            estado.lista.length
        );


        console.log(
            "PerfilPortfolio: lista:",
            estado.lista
        );


        if (contexto?.estado) {

            contexto.estado.portfolio =
                estado.lista;

        }


        const listaElemento =
            obterElemento(
                contexto?.ids?.portfolioEditList ||
                "portfolioEditList"
            );


        console.log(
            "PerfilPortfolio: elemento #portfolioEditList:",
            listaElemento
        );


        renderizar();


        console.log(
            "PerfilPortfolio: renderização concluída."
        );


        return estado.lista;

    } catch (erro) {

        console.error(
            "PerfilPortfolio: erro ao carregar:",
            erro
        );


        mostrarToast(
            erro?.message ||
            "Não foi possível carregar o portfólio.",
            "erro"
        );


        return [];

    }

}


/* ============================================================
   API PÚBLICA
   ============================================================ */

window.PerfilPortfolio = {

    CONFIG,

    estado,

    configurar,

    inicializar,

    carregar,

    renderizar,

    selecionarTipo,

    atualizarCampoArquivo,

    arquivoSelecionado,

    adicionar,

    salvar,

    editar,

    excluir,

    alternarDestaque,

    limparFormulario,

    atualizarEstadoBotaoFormulario,

    obterTipoPerfilAtual

};


})(window);
