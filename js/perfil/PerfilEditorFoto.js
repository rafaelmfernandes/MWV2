const PerfilEditorFoto = (() => {
"use strict";


/* ============================================================
   MUSICALWORLD — PERFIL EDITOR — FOTO

   Arquivo:
   js/perfil/PerfilEditorFoto.js

   Responsabilidades:
   - Selecionar a foto do perfil.
   - Validar formato e tamanho.
   - Exibir preview da foto selecionada.
   - Armazenar temporariamente o arquivo no estado do editor.
   - Fazer upload para o Supabase Storage.
   - Gerar nome único para o arquivo.
   - Obter a URL pública da foto.
   - Identificar a foto anterior no Storage.
   - Remover a foto anterior após o salvamento do banco.
   - Limpar o estado relacionado à foto.

   Este módulo não contém regras específicas de:
   - cantor;
   - músico;
   - banda;
   - DJ;
   - ou qualquer outro tipo de artista.

   O bucket é definido pela configuração central do PerfilEditor.
   ============================================================ */


/* ============================================================
   ESTADO INTERNO DO MÓDULO
   ============================================================ */

const estado = {
    contexto: null,
    inicializado: false
};


/* ============================================================
   CONFIGURAÇÃO
   ============================================================ */

const CONFIG = {
    tamanhoMaximo: 5 * 1024 * 1024,

    tiposPermitidos: [
        "image/jpeg",
        "image/png",
        "image/webp"
    ],

    /* --------------------------------------------------------
       IDs reais utilizados pelo editar-perfil.html
       -------------------------------------------------------- */

    ids: {
        fotoPreview: "fotoPreview",
        fotoPlaceholder: "fotoPlaceholder",
        fotoInput: "inputFoto",
        btnRemoverFoto: "btnRemoverFoto"
    }
};


/* ============================================================
   AUXILIAR — ELEMENTO DOM
   ============================================================ */

function el(id) {
    return document.getElementById(id);
}


/* ============================================================
   CONTEXTO
   ============================================================ */

function configurar(contexto) {
    estado.contexto = contexto || null;
    estado.inicializado = false;
}


function obterContexto() {
    if (!estado.contexto) {
        throw new Error(
            "PerfilEditorFoto: contexto não configurado."
        );
    }

    return estado.contexto;
}


/* ============================================================
   SUPABASE
   ============================================================ */

function obterSupabase() {
    const contexto = obterContexto();

    const supabase = contexto.supabase;

    if (!supabase) {
        throw new Error(
            "PerfilEditorFoto: Supabase não disponível."
        );
    }

    return supabase;
}


/* ============================================================
   ESTADO DO EDITOR
   ============================================================ */

function obterEstado() {
    return obterContexto().estado;
}


/* ============================================================
   IDs

   Permite que o PerfilEditor sobrescreva os IDs,
   mantendo os valores atuais como padrão.
   ============================================================ */

function obterIds() {
    return {
        ...CONFIG.ids,
        ...(obterContexto().ids || {})
    };
}


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function obterUtils() {
    return (
        obterContexto().utils ||
        window.PerfilUtils ||
        null
    );
}


/* ============================================================
   BUCKET

   O bucket continua sendo responsabilidade da configuração
   central do PerfilEditor.
   ============================================================ */

function obterBucket() {
    const contexto = obterContexto();

    const bucket =
        contexto?.CONFIG?.buckets?.foto;

    if (!bucket) {
        throw new Error(
            "PerfilEditorFoto: bucket de fotos não configurado."
        );
    }

    return bucket;
}


/* ============================================================
   TOAST
   ============================================================ */

function mostrarToast(
    mensagem,
    tipo = "erro"
) {
    const utils = obterUtils();

    if (
        utils &&
        typeof utils.mostrarToast === "function"
    ) {
        utils.mostrarToast(
            mensagem,
            tipo
        );

        return;
    }

    if (tipo === "erro") {
        console.error(mensagem);
    } else {
        console.log(mensagem);
    }
}


/* ============================================================
   VALIDAÇÃO DO ARQUIVO
   ============================================================ */

function validarArquivo(arquivo) {
    if (!arquivo) {
        return {
            valido: false,
            mensagem: "Nenhuma imagem selecionada."
        };
    }

    if (
        !CONFIG.tiposPermitidos.includes(
            arquivo.type
        )
    ) {
        return {
            valido: false,
            mensagem:
                "Selecione uma imagem JPG, PNG ou WEBP."
        };
    }

    if (
        arquivo.size >
        CONFIG.tamanhoMaximo
    ) {
        return {
            valido: false,
            mensagem:
                "A imagem deve ter no máximo 5 MB."
        };
    }

    return {
        valido: true,
        mensagem: ""
    };
}


/* ============================================================
   EXTENSÃO DO ARQUIVO
   ============================================================ */

function obterExtensao(arquivo) {
    const nome = String(
        arquivo?.name || ""
    );

    const partes = nome.split(".");

    if (partes.length < 2) {
        if (
            arquivo?.type ===
            "image/png"
        ) {
            return "png";
        }

        if (
            arquivo?.type ===
            "image/webp"
        ) {
            return "webp";
        }

        return "jpg";
    }

    const extensao =
        String(
            partes.pop()
        )
            .trim()
            .toLowerCase();

    /* --------------------------------------------------------
       Garante uma extensão compatível mesmo quando o nome
       original do arquivo possui uma extensão inesperada.
       -------------------------------------------------------- */

    if (
        !["jpg", "jpeg", "png", "webp"].includes(
            extensao
        )
    ) {
        if (
            arquivo?.type ===
            "image/png"
        ) {
            return "png";
        }

        if (
            arquivo?.type ===
            "image/webp"
        ) {
            return "webp";
        }

        return "jpg";
    }

    return extensao === "jpeg"
        ? "jpg"
        : extensao;
}


/* ============================================================
   NOME DO ARQUIVO

   Cada nova foto recebe um nome diferente para evitar
   problemas de cache e sobrescrita acidental.
   ============================================================ */

function gerarNomeArquivo(arquivo) {
    const extensao =
        obterExtensao(arquivo);

    const identificador =
        Date.now().toString(36);

    const aleatorio =
        Math.random()
            .toString(36)
            .substring(2, 8);

    return (
        `f${identificador}${aleatorio}.${extensao}`
    );
}


/* ============================================================
   CAMINHO DO STORAGE
   ============================================================ */

function gerarCaminho(
    usuarioId,
    nomeArquivo
) {
    if (!usuarioId) {
        throw new Error(
            "Usuário não identificado para upload da foto."
        );
    }

    return (
        `${usuarioId}/${nomeArquivo}`
    );
}


/* ============================================================
   IDENTIFICAR CAMINHO DA FOTO ANTERIOR

   Converte uma URL pública do Supabase Storage em um caminho
   relativo ao bucket.

   Exemplo:

   URL:
   .../storage/v1/object/public/perfil-musico/UUID/foto.jpg

   Resultado:
   UUID/foto.jpg
   ============================================================ */

function obterCaminhoStorageFoto(
    url,
    usuarioId
) {
    if (
        !url ||
        !usuarioId
    ) {
        return null;
    }

    try {
        const urlFoto =
            new URL(url);

        const marcador =
            `/storage/v1/object/public/${obterBucket()}/`;

        const indice =
            urlFoto.pathname.indexOf(
                marcador
            );

        if (indice === -1) {
            return null;
        }

        const caminho =
            decodeURIComponent(
                urlFoto.pathname.substring(
                    indice +
                    marcador.length
                )
            );

        if (
            !caminho.startsWith(
                `${usuarioId}/`
            )
        ) {
            return null;
        }

        return caminho;

    } catch (erro) {
        console.warn(
            "PerfilEditorFoto: não foi possível identificar o caminho da foto anterior.",
            erro
        );

        return null;
    }
}


/* ============================================================
   FOTO ATUAL
   ============================================================ */

function obterFotoAtual() {
    const estadoEditor =
        obterEstado();

    return (
        estadoEditor.perfilArtista?.foto_url ||
        estadoEditor.usuario?.foto_url ||
        null
    );
}


/* ============================================================
   PREVIEW DA FOTO

   Usa os elementos reais do editar-perfil.html:

   #fotoPreview
   #fotoPlaceholder
   ============================================================ */

function mostrarPreview(arquivo) {
    const ids =
        obterIds();

    const imagem =
        el(
            ids.fotoPreview
        );

    const placeholder =
        el(
            ids.fotoPlaceholder
        );

    if (!imagem) {
        console.warn(
            "PerfilEditorFoto: elemento #fotoPreview não encontrado."
        );

        return;
    }

    const leitor =
        new FileReader();

    leitor.onload =
        (evento) => {
            imagem.src =
                evento.target.result;

            imagem.style.display =
                "block";

            if (placeholder) {
                placeholder.style.display =
                    "none";
            }
        };

    leitor.onerror =
        () => {
            mostrarToast(
                "Não foi possível visualizar a imagem selecionada.",
                "erro"
            );
        };

    leitor.readAsDataURL(
        arquivo
    );
}


/* ============================================================
   SELEÇÃO DA FOTO
   ============================================================ */

function selecionarFoto(arquivo) {
    const resultado =
        validarArquivo(
            arquivo
        );

    if (!resultado.valido) {
        mostrarToast(
            resultado.mensagem,
            "erro"
        );

        return false;
    }

    const estadoEditor =
        obterEstado();

    /* --------------------------------------------------------
       Guarda o arquivo para que o processo de salvamento
       possa fazer o upload posteriormente.
       -------------------------------------------------------- */

    estadoEditor.fotoArquivo =
        arquivo;

    /* --------------------------------------------------------
       Atualiza imediatamente o preview.
       -------------------------------------------------------- */

    mostrarPreview(
        arquivo
    );

    return true;
}


/* ============================================================
   UPLOAD
   ============================================================ */

async function fazerUpload() {
    const estadoEditor =
        obterEstado();

    /* --------------------------------------------------------
       Se nenhuma nova foto foi selecionada, mantém a atual.
       -------------------------------------------------------- */

    if (
        !estadoEditor.fotoArquivo
    ) {
        return {
            url:
                obterFotoAtual(),

            caminhoNovo:
                null,

            caminhoAnterior:
                null
        };
    }

    const supabase =
        obterSupabase();

    const arquivo =
        estadoEditor.fotoArquivo;

    const usuarioId =
        estadoEditor.usuarioAuth?.id;

    if (!usuarioId) {
        throw new Error(
            "Usuário não identificado para enviar a foto."
        );
    }

    const nomeArquivo =
        gerarNomeArquivo(
            arquivo
        );

    const caminhoNovo =
        gerarCaminho(
            usuarioId,
            nomeArquivo
        );

    const fotoAnterior =
        obterFotoAtual();

    const caminhoAnterior =
        obterCaminhoStorageFoto(
            fotoAnterior,
            usuarioId
        );

    const {
        error: erroUpload
    } =
        await supabase
            .storage
            .from(
                obterBucket()
            )
            .upload(
                caminhoNovo,
                arquivo,
                {
                    upsert: false,

                    cacheControl:
                        "31536000",

                    contentType:
                        arquivo.type
                }
            );

    if (erroUpload) {
        throw erroUpload;
    }

    const {
        data
    } =
        supabase
            .storage
            .from(
                obterBucket()
            )
            .getPublicUrl(
                caminhoNovo
            );

    const url =
        data?.publicUrl ||
        null;

    if (!url) {
        throw new Error(
            "Não foi possível obter a URL pública da nova foto."
        );
    }

    return {
        url,

        caminhoNovo,

        caminhoAnterior
    };
}


/* ============================================================
   EXCLUIR FOTO ANTERIOR
   ============================================================ */

async function excluirFotoAnterior(
    caminho
) {
    if (!caminho) {
        return;
    }

    const supabase =
        obterSupabase();

    const {
        error
    } =
        await supabase
            .storage
            .from(
                obterBucket()
            )
            .remove([
                caminho
            ]);

    if (error) {
        console.warn(
            "A nova foto foi salva, mas a foto anterior não pôde ser removida:",
            error
        );
    }
}


/* ============================================================
   FINALIZAR FOTO

   Deve ser chamado somente depois que o registro do perfil
   tiver sido atualizado com sucesso.

   Primeiro o banco recebe a nova URL.
   Depois removemos a foto antiga.
   ============================================================ */

async function finalizarFoto(
    resultado
) {
    if (!resultado) {
        return;
    }

    const {
        caminhoNovo,
        caminhoAnterior
    } = resultado;

    if (
        !caminhoNovo ||
        !caminhoAnterior
    ) {
        return;
    }

    if (
        caminhoNovo ===
        caminhoAnterior
    ) {
        return;
    }

    await excluirFotoAnterior(
        caminhoAnterior
    );
}


/* ============================================================
   LIMPAR ESTADO
   ============================================================ */

function limpar() {
    const estadoEditor =
        obterEstado();

    estadoEditor.fotoArquivo =
        null;

    const ids =
        obterIds();

    const input =
        el(
            ids.fotoInput
        );

    if (input) {
        input.value = "";
    }
}


/* ============================================================
   RESTAURAR PLACEHOLDER
   ============================================================ */

function mostrarPlaceholder() {
    const ids =
        obterIds();

    const imagem =
        el(
            ids.fotoPreview
        );

    const placeholder =
        el(
            ids.fotoPlaceholder
        );

    if (imagem) {
        imagem.src = "";
        imagem.style.display =
            "none";
    }

    if (placeholder) {
        placeholder.style.display =
            "flex";
    }
}


/* ============================================================
   REMOVER FOTO SELECIONADA

   Importante:
   - Não remove imediatamente a foto do Storage.
   - Apenas limpa a seleção local.
   - A remoção definitiva da foto antiga continua sendo
     responsabilidade do fluxo de salvamento.
   ============================================================ */

function removerFotoSelecionada() {
    const estadoEditor =
        obterEstado();

    estadoEditor.fotoArquivo =
        null;

    mostrarPlaceholder();

    const ids =
        obterIds();

    const input =
        el(
            ids.fotoInput
        );

    if (input) {
        input.value = "";
    }
}


/* ============================================================
   INICIALIZAÇÃO

   O HTML atual usa:

   <label for="inputFoto">

   Portanto não precisamos transformar o label em um
   botão JavaScript.

   O próprio navegador já abre o input ao clicar no label.

   O JavaScript precisa apenas escutar o evento "change".
   ============================================================ */

function inicializar() {
    if (
        estado.inicializado
    ) {
        return;
    }

    const ids =
        obterIds();

    const input =
        el(
            ids.fotoInput
        );

    const botaoRemover =
        el(
            ids.btnRemoverFoto
        );

    if (!input) {
        console.warn(
            "PerfilEditorFoto: #inputFoto não encontrado."
        );

        return;
    }

    /* --------------------------------------------------------
       Seleção de uma nova imagem.
       -------------------------------------------------------- */

    input.addEventListener(
        "change",
        (evento) => {
            const arquivo =
                evento.target.files?.[0];

            if (!arquivo) {
                return;
            }

            selecionarFoto(
                arquivo
            );
        }
    );

    /* --------------------------------------------------------
       Botão Remover.
       -------------------------------------------------------- */

    if (botaoRemover) {
        botaoRemover.addEventListener(
            "click",
            (evento) => {
                evento.preventDefault();

                removerFotoSelecionada();
            }
        );
    }

    estado.inicializado =
        true;
}


/* ============================================================
   API PÚBLICA
   ============================================================ */

return {
    CONFIG,

    configurar,

    inicializar,

    validarArquivo,

    selecionarFoto,

    mostrarPreview,

    mostrarPlaceholder,

    gerarNomeArquivo,

    gerarCaminho,

    obterCaminhoStorageFoto,

    obterFotoAtual,

    fazerUpload,

    excluirFotoAnterior,

    finalizarFoto,

    removerFotoSelecionada,

    limpar
};


})();

/* ================================================================
EXPOSIÇÃO GLOBAL
================================================================ */

window.PerfilEditorFoto =
PerfilEditorFoto;
