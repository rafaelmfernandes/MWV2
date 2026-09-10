const PerfilPortfolio = (() => {
"use strict";


const CONFIG = {
    tabela: "portfolio_musicos",
    bucket: "portfolio-musicos",
    limiteArquivoMB: 50,

    tiposMedia: {
        imagem: {
            label: "Imagem",
            extensoes: ["jpg", "jpeg", "png", "webp", "gif"],
            accept: "image/*"
        },

        video: {
            label: "Vídeo",
            extensoes: ["mp4", "webm", "mov", "avi"],
            accept: "video/*"
        },

        audio: {
            label: "Áudio",
            extensoes: ["mp3", "wav", "ogg", "m4a", "aac"],
            accept: "audio/*"
        }
    }
};

let contexto = null;

const estado = {
    lista: [],
    tipoMedia: "imagem",
    editandoId: null
};

function obterElemento(id) {
    if (
        contexto?.utils &&
        typeof contexto.utils.el === "function"
    ) {
        return contexto.utils.el(id);
    }

    return document.getElementById(id);
}

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

function mostrarToast(mensagem, tipo = "sucesso") {
    if (
        contexto?.utils &&
        typeof contexto.utils.mostrarToast === "function"
    ) {
        contexto.utils.mostrarToast(mensagem, tipo);
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

function mostrarLoading(texto = "Carregando...") {
    if (
        contexto?.utils &&
        typeof contexto.utils.mostrarLoading === "function"
    ) {
        contexto.utils.mostrarLoading(texto);
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

function obterPerfilId() {
    return contexto?.estado?.perfil?.id || null;
}

function obterUsuarioId() {
    return contexto?.estado?.usuarioAuth?.id || null;
}

function normalizarTipo(tipo) {
    const valor = String(tipo || "")
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

    if (valor === "audio") {
        return "audio";
    }

    return "imagem";
}

function obterIconeTipo(tipo) {
    switch (normalizarTipo(tipo)) {
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
        CONFIG.tiposMedia[tipoNormalizado]?.label ||
        "Mídia"
    );
}

function obterExtensao(nomeArquivo) {
    const nome = String(nomeArquivo || "");

    const partes = nome.split(".");

    if (partes.length < 2) {
        return "";
    }

    return partes
        .pop()
        .toLowerCase()
        .trim();
}

function obterNomeArquivoSeguro(nomeArquivo) {
    const nome = String(nomeArquivo || "")
        .trim()
        .replace(/[^\w.\-]+/g, "-")
        .replace(/-+/g, "-");

    return nome || "arquivo";
}

function validarArquivo(arquivo, tipo) {
    if (!arquivo) {
        throw new Error(
            "Selecione um arquivo."
        );
    }

    const tamanhoMB =
        arquivo.size / (1024 * 1024);

    if (
        tamanhoMB >
        CONFIG.limiteArquivoMB
    ) {
        throw new Error(
            `O arquivo não pode ultrapassar ${CONFIG.limiteArquivoMB} MB.`
        );
    }

    const tipoNormalizado =
        normalizarTipo(tipo);

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
        obterExtensao(arquivo.name);

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

function configurar(novoContexto) {
    contexto = novoContexto;

    if (!contexto?.estado) {
        console.error(
            "PerfilPortfolio: contexto inválido."
        );

        return;
    }

    estado.tipoMedia =
        contexto.estado.tipoMedia ||
        "imagem";

    estado.editandoId =
        contexto.estado.editandoPortfolioId ||
        null;

    contexto.estado.portfolio =
        estado.lista;
}

async function carregar() {
    try {
        const perfilId =
            obterPerfilId();

        if (!perfilId) {
            console.warn(
                "PerfilPortfolio: perfil ainda não disponível."
            );

            return [];
        }

        if (!contexto?.supabase) {
            throw new Error(
                "Supabase não está disponível para o portfólio."
            );
        }

        const {
            data,
            error
        } = await contexto.supabase
            .from(CONFIG.tabela)
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
                    ascending: true
                }
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

        if (error) {
            throw error;
        }

        estado.lista =
            Array.isArray(data)
                ? data
                : [];

        contexto.estado.portfolio =
            estado.lista;

        renderizar();

        return estado.lista;
    } catch (erro) {
        console.error(
            "Erro ao carregar portfólio:",
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

function selecionarTipo(tipo) {
    const tipoNormalizado =
        normalizarTipo(tipo);

    estado.tipoMedia =
        tipoNormalizado;

    if (contexto?.estado) {
        contexto.estado.tipoMedia =
            tipoNormalizado;
    }

    atualizarCampoArquivo();

    atualizarIcones();
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
        if (estado.tipoMedia === "imagem") {
            ajuda.textContent =
                "JPG, PNG, WEBP ou GIF. Máximo de 50 MB.";
        } else if (
            estado.tipoMedia === "video"
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
        arquivoInput.value = "";

        mostrarToast(
            erro.message,
            "erro"
        );

        return null;
    }
}

async function fazerUpload(arquivo) {
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
        obterExtensao(arquivo.name);

    const nomeOriginal =
        obterNomeArquivoSeguro(
            arquivo.name
        );

    const timestamp =
        Date.now();

    const aleatorio =
        Math.random()
            .toString(36)
            .substring(2, 8);

    const nomeArquivo =
        `${timestamp}-${aleatorio}-${nomeOriginal}`;

    const caminho =
        `${usuarioId}/${nomeArquivo}`;

    const {
        error
    } = await contexto.supabase.storage
        .from(CONFIG.bucket)
        .upload(
            caminho,
            arquivo,
            {
                upsert: false,
                cacheControl: "3600",
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
    } = contexto.supabase.storage
        .from(CONFIG.bucket)
        .getPublicUrl(
            caminho
        );

    if (!data?.publicUrl) {
        throw new Error(
            "Não foi possível obter a URL pública do arquivo."
        );
    }

    return {
        url: data.publicUrl,
        caminho,
        extensao
    };
}

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
            titulo?.value.trim() || "",

        descricao:
            descricao?.value.trim() || null,

        arquivo:
            arquivo?.files?.[0] || null,

        url:
            url?.value.trim() || null,

        tipo:
            normalizarTipo(
                estado.tipoMedia
            )
    };
}

function obterProximaOrdem() {
    if (!estado.lista.length) {
        return 0;
    }

    const ordens =
        estado.lista
            .map(item =>
                Number(item.ordem)
            )
            .filter(numero =>
                Number.isFinite(numero)
            );

    if (!ordens.length) {
        return estado.lista.length;
    }

    return Math.max(...ordens) + 1;
}

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
            dados.url || null;

        if (dados.arquivo) {
            const upload =
                await fazerUpload(
                    dados.arquivo
                );

            arquivoUrl =
                upload.url;
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

        const podeDestacar =
            tipo === "imagem" ||
            tipo === "video";

        const destaque =
            podeDestacar
                ? false
                : false;

        mostrarLoading(
            estado.editandoId
                ? "Atualizando portfólio..."
                : "Salvando portfólio..."
        );

        const agora =
            new Date().toISOString();

        if (estado.editandoId) {
            const dadosAtualizacao = {
                tipo,
                titulo: dados.titulo,
                descricao: dados.descricao,
                arquivo_url: arquivoUrl,
                updated_at: agora
            };

            const {
                error
            } = await contexto.supabase
                .from(CONFIG.tabela)
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
            const dadosInsercao = {
                perfil_id: perfilId,
                tipo,
                titulo: dados.titulo,
                descricao: dados.descricao,
                arquivo_url: arquivoUrl,
                ativo: true,
                destaque_catalogo: destaque,
                ordem: obterProximaOrdem()
            };

            const {
                error
            } = await contexto.supabase
                .from(CONFIG.tabela)
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
            "Erro ao salvar portfólio:",
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

async function editar(id) {
    const item =
        estado.lista.find(
            registro =>
                String(registro.id) ===
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

    if (contexto?.estado) {
        contexto.estado.editandoPortfolioId =
            item.id;
    }

    estado.tipoMedia =
        normalizarTipo(
            item.tipo
        );

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
            item.titulo || "";
    }

    if (descricao) {
        descricao.value =
            item.descricao || "";
    }

    if (url) {
        url.value =
            item.arquivo_url || "";
    }

    if (arquivo) {
        arquivo.value = "";
    }

    document
        .querySelectorAll(
            ".portfolio-tipo"
        )
        .forEach(botao => {
            botao.classList.toggle(
                "ativo",
                normalizarTipo(
                    botao.dataset.tipo
                ) === estado.tipoMedia
            );
        });

    atualizarCampoArquivo();

    const botao =
        obterElemento(
            contexto?.ids?.btnAdicionarPortfolio ||
            "btnAdicionarPortfolio"
        );

    if (botao) {
        botao.innerHTML =
            '<i data-lucide="save"></i><span>Atualizar portfólio</span>';
    }

    atualizarIcones();

    const formulario =
        obterElemento(
            contexto?.ids?.portfolioTitulo ||
            "portfolioTitulo"
        );

    if (formulario) {
        formulario.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        formulario.focus();
    }
}

async function excluir(id) {
    const item =
        estado.lista.find(
            registro =>
                String(registro.id) ===
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

        mostrarLoading(
            "Excluindo item..."
        );

        const agora =
            new Date().toISOString();

        const {
            error
        } = await contexto.supabase
            .from(CONFIG.tabela)
            .update({
                ativo: false,
                destaque_catalogo: false,
                updated_at: agora
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
            String(estado.editandoId) ===
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
            "Erro ao excluir portfólio:",
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

async function alternarDestaque(id) {
    const item =
        estado.lista.find(
            registro =>
                String(registro.id) ===
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

        mostrarLoading(
            "Atualizando destaque..."
        );

        const agora =
            new Date().toISOString();

        const {
            error: erroLimpar
        } = await contexto.supabase
            .from(CONFIG.tabela)
            .update({
                destaque_catalogo: false,
                updated_at: agora
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
        } = await contexto.supabase
            .from(CONFIG.tabela)
            .update({
                destaque_catalogo: true,
                updated_at: agora
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
            "Erro ao destacar portfólio:",
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

function limparFormulario() {
    estado.editandoId =
        null;

    if (contexto?.estado) {
        contexto.estado.editandoPortfolioId =
            null;
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
        titulo.value = "";
    }

    if (descricao) {
        descricao.value = "";
    }

    if (arquivo) {
        arquivo.value = "";
    }

    if (url) {
        url.value = "";
    }

    const botao =
        obterElemento(
            contexto?.ids?.btnAdicionarPortfolio ||
            "btnAdicionarPortfolio"
        );

    if (botao) {
        botao.innerHTML =
            '<i data-lucide="plus"></i><span>Adicionar ao portfólio</span>';
    }

    atualizarIcones();
}

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

    if (tipo === "imagem") {
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

    if (tipo === "video") {
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

    if (tipo === "audio") {
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

function renderizar() {
    const lista =
        obterElemento(
            contexto?.ids?.portfolioEditList ||
            "portfolioEditList"
        );

    if (!lista) {
        return;
    }

    if (!estado.lista.length) {
        lista.innerHTML = `
            <div class="empty-state">
                <i data-lucide="images"></i>
                <strong>Nenhum item no portfólio</strong>
                <span>Adicione fotos, vídeos ou áudios para apresentar seu trabalho.</span>
            </div>
        `;

        atualizarIcones();

        return;
    }

    lista.innerHTML =
        estado.lista
            .map(item => {
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
                                <i data-lucide="${obterIconeTipo(tipo)}"></i>
                                <span>${escaparHtml(obterLabelTipo(tipo))}</span>
                            </div>

                            <h3>
                                ${escaparHtml(item.titulo || "Sem título")}
                            </h3>

                            ${
                                item.descricao
                                    ? `
                                        <p>
                                            ${escaparHtml(item.descricao)}
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
            })
            .join("");

    lista
        .querySelectorAll(
            "[data-editar-portfolio]"
        )
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => {
                    editar(
                        botao.dataset.editarPortfolio
                    );
                }
            );
        });

    lista
        .querySelectorAll(
            "[data-excluir-portfolio]"
        )
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => {
                    excluir(
                        botao.dataset.excluirPortfolio
                    );
                }
            );
        });

    lista
        .querySelectorAll(
            "[data-destaque-portfolio]"
        )
        .forEach(botao => {
            botao.addEventListener(
                "click",
                () => {
                    alternarDestaque(
                        botao.dataset.destaquePortfolio
                    );
                }
            );
        });

    atualizarIcones();
}

function inicializar() {
    atualizarCampoArquivo();

    const arquivoInput =
        obterElemento(
            contexto?.ids?.portfolioArquivo ||
            "portfolioArquivo"
        );

    if (arquivoInput) {
        arquivoInput.addEventListener(
            "change",
            arquivoSelecionado
        );
    }

    document
    .querySelectorAll(
        ".portfolio-tipo"
    )
    .forEach(botao => {
        botao.addEventListener(
            "click",
            () => {

                selecionarTipo(
                    botao.dataset.mediaType
                );

                document
                    .querySelectorAll(
                        ".portfolio-tipo"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "ativo",
                            item === botao
                        );

                    });

            }
        );
    });
    const botaoAdicionar =
        obterElemento(
            contexto?.ids?.btnAdicionarPortfolio ||
            "btnAdicionarPortfolio"
        );

    if (
        botaoAdicionar &&
        !botaoAdicionar.dataset.portfolioInicializado
    ) {
        botaoAdicionar.dataset.portfolioInicializado =
            "true";

        botaoAdicionar.addEventListener(
            "click",
            event => {
                event.preventDefault();

                adicionar();
            }
        );
    }

    atualizarIcones();
}

return {
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
    editar,
    excluir,
    alternarDestaque,

    limparFormulario
};


})();

window.PerfilPortfolio = PerfilPortfolio;
