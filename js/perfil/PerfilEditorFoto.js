const PerfilEditorFoto = (() => {
"use strict";

/*

* ============================================================
* PERFIL EDITOR — FOTO
* ============================================================
*
* Módulo universal responsável exclusivamente pela foto
* do perfil.
*
* Responsabilidades:
* * seleção da imagem;
* * validação;
* * preview;
* * upload;
* * geração de nome curto;
* * obtenção da URL pública;
* * identificação da foto anterior;
* * remoção da foto anterior;
* * integração com o estado do PerfilEditor.
*
* Não contém regras específicas de:
* * cantor;
* * músico;
* * banda;
* * DJ;
* * etc.
*
* O bucket NÃO é definido aqui.
* Ele vem da configuração central do PerfilEditor.
  */

const estado = {


contexto:
    null,

inicializado:
    false


};

/*

* ============================================================
* CONFIGURAÇÃO
* ============================================================
  */

const CONFIG = {


tamanhoMaximo:
    5 * 1024 * 1024,

tiposPermitidos: [

    "image/jpeg",

    "image/png",

    "image/webp"
],

ids: {

    avatarImage:
        "avatarImage",

    avatarInitials:
        "avatarInitials",

    fotoInput:
        "fotoInput",

    btnFoto:
        "btnFoto"
}


};

/*

* ============================================================
* ELEMENTOS
* ============================================================
  */

function el(id) {


return document.getElementById(
    id
);


}

/*

* ============================================================
* CONTEXTO
* ============================================================
  */

function configurar(contexto) {


estado.contexto =
    contexto || null;

estado.inicializado =
    false;


}

function obterContexto() {


if (!estado.contexto) {

    throw new Error(
        "PerfilEditorFoto: contexto não configurado."
    );
}

return estado.contexto;


}

function obterSupabase() {


const contexto =
    obterContexto();


const supabase =
    contexto.supabase;


if (!supabase) {

    throw new Error(
        "PerfilEditorFoto: Supabase não disponível."
    );
}


return supabase;


}

function obterEstado() {


return obterContexto().estado;


}

function obterIds() {


return (
    obterContexto().ids ||
    CONFIG.ids
);


}

function obterUtils() {


return (
    obterContexto().utils ||
    window.PerfilUtils ||
    null
);


}

/*

* ============================================================
* BUCKET
* ============================================================
*
* O bucket pertence à configuração central do editor.
*
* PerfilEditor:
*
* CONFIG.buckets.foto
*
* Assim este módulo não precisa saber se está trabalhando
* com cantor, músico, banda, DJ etc.
  */

function obterBucket() {


const contexto =
    obterContexto();


const bucket =
    contexto?.CONFIG?.buckets?.foto;


if (!bucket) {

    throw new Error(
        "PerfilEditorFoto: bucket de fotos não configurado."
    );
}


return bucket;


}

/*

* ============================================================
* TOAST
* ============================================================
  */

function mostrarToast(
mensagem,
tipo = "erro"
) {


const utils =
    obterUtils();


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


console.error(
    mensagem
);


}

/*

* ============================================================
* VALIDAÇÃO
* ============================================================
  */

function validarArquivo(
arquivo
) {


if (!arquivo) {

    return {

        valido:
            false,

        mensagem:
            "Nenhuma imagem selecionada."
    };
}


if (
    !CONFIG.tiposPermitidos.includes(
        arquivo.type
    )
) {

    return {

        valido:
            false,

        mensagem:
            "Selecione uma imagem JPG, PNG ou WEBP."
    };
}


if (
    arquivo.size >
    CONFIG.tamanhoMaximo
) {

    return {

        valido:
            false,

        mensagem:
            "A imagem deve ter no máximo 5 MB."
    };
}


return {

    valido:
        true,

    mensagem:
        ""
};


}

/*

* ============================================================
* EXTENSÃO
* ============================================================
  */

function obterExtensao(
arquivo
) {


const nome =
    String(
        arquivo?.name || ""
    );


const partes =
    nome.split(".");


if (
    partes.length < 2
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


return String(
    partes.pop()
)
    .trim()
    .toLowerCase();


}

/*

* ============================================================
* NOME DO ARQUIVO
* ============================================================
*
* Cada nova foto recebe um nome diferente.
*
* Exemplo:
*
* fme9x8abc.jpg
*
* Isso evita reutilizar:
*
* perfil.jpg
*
* e reduz problemas de cache.
  */

function gerarNomeArquivo(
arquivo
) {


const extensao =
    obterExtensao(
        arquivo
    );


const identificador =
    Date.now().toString(
        36
    );


return (
    `f${identificador}.${extensao}`
);


}

/*

* ============================================================
* CAMINHO DA FOTO
* ============================================================
  */

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

/*

* ============================================================
* IDENTIFICAR CAMINHO DA FOTO ANTIGA
* ============================================================
  */

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
        new URL(
            url
        );


    const marcador =
        `/storage/v1/object/public/${obterBucket()}/`;


    const indice =
        urlFoto.pathname.indexOf(
            marcador
        );


    if (
        indice === -1
    ) {

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
        "Não foi possível identificar o caminho da foto anterior:",
        erro
    );


    return null;
}


}

/*

* ============================================================
* FOTO ATUAL
* ============================================================
  */

function obterFotoAtual() {


const estadoEditor =
    obterEstado();


return (
    estadoEditor.perfilArtista?.foto_url ||
    estadoEditor.usuario?.foto_url ||
    null
);


}

/*

* ============================================================
* PREVIEW
* ============================================================
  */

function mostrarPreview(
arquivo
) {


const ids =
    obterIds();


const imagem =
    el(
        ids.avatarImage
    );


const iniciais =
    el(
        ids.avatarInitials
    );


if (!imagem) {

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


        if (iniciais) {

            iniciais.style.display =
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

/*

* ============================================================
* SELEÇÃO DA FOTO
* ============================================================
  */

function selecionarFoto(
arquivo
) {


const resultado =
    validarArquivo(
        arquivo
    );


if (
    !resultado.valido
) {

    mostrarToast(
        resultado.mensagem,
        "erro"
    );


    return false;
}


const estadoEditor =
    obterEstado();


estadoEditor.fotoArquivo =
    arquivo;


mostrarPreview(
    arquivo
);


return true;


}

/*

* ============================================================
* UPLOAD
* ============================================================
  */

async function fazerUpload() {


const estadoEditor =
    obterEstado();


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

                upsert:
                    false,

                cacheControl:
                    "31536000",

                contentType:
                    arquivo.type
            }
        );


if (
    erroUpload
) {

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

/*

* ============================================================
* EXCLUIR FOTO ANTERIOR
* ============================================================
  */

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

/*

* ============================================================
* FINALIZAR FOTO
* ============================================================
*
* Chamado somente depois que o banco foi atualizado
* com sucesso.
  */

async function finalizarFoto(
resultado
) {


if (
    !resultado
) {

    return;
}


const {
    caminhoNovo,
    caminhoAnterior
} =
    resultado;


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

/*

* ============================================================
* LIMPAR ESTADO
* ============================================================
  */

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

    input.value =
        "";
}


}

/*

* ============================================================
* INICIALIZAÇÃO
* ============================================================
  */

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


const botao =
    el(
        ids.btnFoto
    );


if (
    !input ||
    !botao
) {

    return;
}


botao.addEventListener(
    "click",
    (evento) => {

        evento.preventDefault();

        input.click();
    }
);


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


estado.inicializado =
    true;


}

/*

* ============================================================
* API PÚBLICA
* ============================================================
  */

return {


CONFIG,

configurar,

inicializar,

validarArquivo,

selecionarFoto,

mostrarPreview,

gerarNomeArquivo,

gerarCaminho,

obterCaminhoStorageFoto,

obterFotoAtual,

fazerUpload,

excluirFotoAnterior,

finalizarFoto,

limpar


};

})();

window.PerfilEditorFoto =
PerfilEditorFoto;
