"use strict";

/*
MUSICALWORLD
CRIAR ANÚNCIO DE MÚSICO

O JS está dividido em três partes:

Interface e validação
Organização dos dados
Preparação para futuro banco de dados

Neste momento os dados são armazenados no localStorage
apenas para testes.

Futuramente:

FORMULÁRIO
↓
VALIDAÇÃO
↓
UPLOAD DA MÍDIA
↓
SUPABASE STORAGE
↓
BANCO DE DADOS
↓
ANÚNCIO PUBLICADO

*/

const CONFIG = {

STORAGE_KEY: "anuncios_musicos_musicalworld",

TIPO_ANUNCIO: "musico",

STATUS_INICIAL: "pendente",

TAMANHO_MAXIMO_MIDIA:
    20 * 1024 * 1024

};

let formulario;

let inputMidia;

let mediaDropzone;

let mediaTitle;

let mediaDescription;

let mediaPreview;

let imagePreview;

let videoPreview;

let btnRemoverMedia;

let descricao;

let descricaoCount;

let arquivoMidiaSelecionado = null;

let urlMidiaTemporaria = null;

/* =====================================================
INICIALIZAÇÃO
===================================================== */

document.addEventListener(
"DOMContentLoaded",
iniciar
);

function iniciar() {

formulario =
    document.getElementById(
        "form-anuncio-musico"
    );


inputMidia =
    document.getElementById(
        "input-midia"
    );


mediaDropzone =
    document.getElementById(
        "media-dropzone"
    );


mediaTitle =
    document.getElementById(
        "media-title"
    );


mediaDescription =
    document.getElementById(
        "media-description"
    );


mediaPreview =
    document.getElementById(
        "media-preview"
    );


imagePreview =
    document.getElementById(
        "image-preview"
    );


videoPreview =
    document.getElementById(
        "video-preview"
    );


btnRemoverMedia =
    document.getElementById(
        "btn-remover-media"
    );


descricao =
    document.getElementById(
        "descricao"
    );


descricaoCount =
    document.getElementById(
        "descricao-count"
    );


configurarEventos();

atualizarContadorDescricao();

}

/* =====================================================
EVENTOS
===================================================== */

function configurarEventos() {

if (formulario) {

    formulario.addEventListener(
        "submit",
        publicarAnuncio
    );

}


if (inputMidia) {

    inputMidia.addEventListener(
        "change",
        processarMidia
    );

}


if (btnRemoverMedia) {

    btnRemoverMedia.addEventListener(
        "click",
        removerMidia
    );

}


if (descricao) {

    descricao.addEventListener(
        "input",
        atualizarContadorDescricao
    );

}


const checkboxConsulta =
    document.querySelector(
        'input[name="projeto-consulta"]'
    );


if (checkboxConsulta) {

    checkboxConsulta.addEventListener(
        "change",
        controlarProjetoConsulta
    );

}

}

/* =====================================================
MÍDIA
===================================================== */

function processarMidia(event) {

const arquivo =
    event.target.files[0];


if (!arquivo) {

    return;

}


if (
    arquivo.size >
    CONFIG.TAMANHO_MAXIMO_MIDIA
) {

    mostrarMensagem(
        "A mídia deve ter no máximo 20 MB.",
        "erro"
    );

    inputMidia.value = "";

    return;

}


const tiposPermitidos = [

    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4"

];


if (
    !tiposPermitidos.includes(
        arquivo.type
    )
) {

    mostrarMensagem(
        "Formato não permitido. Use JPG, PNG, WEBP ou MP4.",
        "erro"
    );

    inputMidia.value = "";

    return;

}


arquivoMidiaSelecionado =
    arquivo;


criarPreviaMidia(
    arquivo
);

}

/* =====================================================
PRÉVIA DA MÍDIA
===================================================== */

function criarPreviaMidia(arquivo) {

limparUrlTemporaria();


urlMidiaTemporaria =
    URL.createObjectURL(
        arquivo
    );


if (arquivo.type.startsWith("image/")) {

    imagePreview.src =
        urlMidiaTemporaria;

    imagePreview.hidden =
        false;

    videoPreview.hidden =
        true;

} else {

    videoPreview.src =
        urlMidiaTemporaria;

    videoPreview.hidden =
        false;

    imagePreview.hidden =
        true;

}


mediaPreview.hidden =
    false;


mediaDropzone.classList.add(
    "has-file"
);


mediaTitle.textContent =
    arquivo.name;


mediaDescription.textContent =
    formatarTamanho(
        arquivo.size
    );

}

/* =====================================================
REMOVER MÍDIA
===================================================== */

function removerMidia(event) {

if (event) {

    event.preventDefault();

    event.stopPropagation();

}


arquivoMidiaSelecionado =
    null;


limparUrlTemporaria();


inputMidia.value = "";


imagePreview.src = "";

videoPreview.src = "";


imagePreview.hidden =
    true;

videoPreview.hidden =
    true;


mediaPreview.hidden =
    true;


mediaDropzone.classList.remove(
    "has-file"
);


mediaTitle.textContent =
    "Adicionar foto ou vídeo";


mediaDescription.textContent =
    "Clique para selecionar uma mídia em destaque";

}

/* =====================================================
URL TEMPORÁRIA
===================================================== */

function limparUrlTemporaria() {

if (urlMidiaTemporaria) {

    URL.revokeObjectURL(
        urlMidiaTemporaria
    );

    urlMidiaTemporaria =
        null;

}

}

/* =====================================================
CONTADOR
===================================================== */

function atualizarContadorDescricao() {

if (!descricao || !descricaoCount) {

    return;

}


descricaoCount.textContent =
    descricao.value.length +
    "/1200";

}

/* =====================================================
PROJETO PERSONALIZADO
===================================================== */

function controlarProjetoConsulta() {

const checkbox =
    document.querySelector(
        'input[name="projeto-consulta"]'
    );


if (!checkbox) {

    return;

}


/*
Futuramente podemos permitir que o
usuário coloque um valor personalizado.

Por enquanto o checkbox representa:

true  = Sob consulta
false = negociação necessária
*/

}

/* =====================================================
PUBLICAR ANÚNCIO
===================================================== */

function publicarAnuncio(event) {

event.preventDefault();


const validacao =
    validarFormulario();


if (!validacao.valido) {

    mostrarMensagem(
        validacao.mensagem,
        "erro"
    );


    if (validacao.campo) {

        validacao.campo.focus();

    }


    return;

}


const dadosFormulario =
    coletarDadosFormulario();


const anuncio =
    criarEstruturaAnuncio(
        dadosFormulario
    );


/*
=====================================================
FUTURO SUPABASE

Aqui teremos:

1. Criar ID do anúncio
2. Fazer upload da foto/vídeo
3. Receber URL do Storage
4. Salvar dados na tabela
=====================================================
*/


salvarAnuncioLocal(
    anuncio
);


console.log(
    "ANÚNCIO DE MÚSICO:",
    anuncio
);


console.log(
    "FORMATO PARA BANCO:",
    prepararDadosParaBanco(
        anuncio
    )
);


mostrarMensagem(
    "Anúncio de músico criado com sucesso!",
    "sucesso"
);


/*
Futuramente podemos redirecionar:

window.location.href =
    "meus-anuncios.html";
*/

}

/* =====================================================
VALIDAÇÃO
===================================================== */

function validarFormulario() {

const nome =
    document.getElementById(
        "nome-artista"
    );


const instrumento =
    document.getElementById(
        "instrumento"
    );


const localizacao =
    document.getElementById(
        "localizacao"
    );


const descricao =
    document.getElementById(
        "descricao"
    );


const confirmacao =
    document.getElementById(
        "confirmacao-anuncio"
    );


if (
    !nome ||
    !nome.value.trim()
) {

    return {

        valido: false,

        mensagem:
            "Informe seu nome ou nome artístico.",

        campo: nome

    };

}


if (
    !instrumento ||
    !instrumento.value
) {

    return {

        valido: false,

        mensagem:
            "Selecione seu instrumento ou função.",

        campo: instrumento

    };

}


if (
    !localizacao ||
    !localizacao.value.trim()
) {

    return {

        valido: false,

        mensagem:
            "Informe sua localização.",

        campo: localizacao

    };

}


if (
    !descricao ||
    !descricao.value.trim()
) {

    return {

        valido: false,

        mensagem:
            "Descreva sua experiência profissional.",

        campo: descricao

    };

}


if (
    !confirmacao ||
    !confirmacao.checked
) {

    return {

        valido: false,

        mensagem:
            "Confirme as informações antes de publicar.",

        campo: confirmacao

    };

}


return {

    valido: true

};

}

/* =====================================================
COLETAR FORMULÁRIO
===================================================== */

function coletarDadosFormulario() {

const estilos =
    Array.from(
        document.querySelectorAll(
            'input[name="estilos"]:checked'
        )
    ).map(
        function(item) {

            return item.value;

        }
    );


const formatos =
    Array.from(
        document.querySelectorAll(
            'input[name="formato"]:checked'
        )
    ).map(
        function(item) {

            return item.value;

        }
    );


const projetoConsulta =
    document.querySelector(
        'input[name="projeto-consulta"]'
    );


return {

    profissional: {

        nome:
            obterValor(
                "nome-artista"
            ),

        instrumento:
            obterValor(
                "instrumento"
            ),

        localizacao:
            obterValor(
                "localizacao"
            ),

        especialidades:
            obterValor(
                "especialidades"
            ),

        estilos:
            estilos

    },


    descricao:
        obterValor(
            "descricao"
        ),


    midia: {

        nomeArquivo:
            arquivoMidiaSelecionado
                ? arquivoMidiaSelecionado.name
                : null,

        tipo:
            arquivoMidiaSelecionado
                ? arquivoMidiaSelecionado.type
                : null,

        tamanho:
            arquivoMidiaSelecionado
                ? arquivoMidiaSelecionado.size
                : null,

        url:
            null,

        caminhoStorage:
            null

    },


    servicos: {

        show:
            obterNumero(
                'input[name="preco-show"]'
            ),

        estudio:
            obterNumero(
                'input[name="preco-estudio"]'
            ),

        acompanhamento:
            obterNumero(
                'input[name="preco-acompanhamento"]'
            ),

        projetoPersonalizado:
            projetoConsulta
                ? projetoConsulta.checked
                : true

    },


    disponibilidade: {

        formatos:
            formatos,

        regiao:
            obterValor(
                "raio-atendimento"
            )

    }

};

}

/* =====================================================
CRIAR OBJETO PRINCIPAL
===================================================== */

function criarEstruturaAnuncio(
dados
) {

const agora =
    new Date();


return {

    id:
        gerarId(),


    tipo:
        CONFIG.TIPO_ANUNCIO,


    versaoEstrutura:
        1,


    autor: {

        id:
            null,

        nome:
            dados.profissional.nome,

        email:
            null,

        avatarUrl:
            null

    },


    profissional: {

        nome:
            dados.profissional.nome,

        instrumento:
            dados.profissional.instrumento,

        localizacao:
            dados.profissional.localizacao,

        especialidades:
            dados.profissional.especialidades,

        estilos:
            dados.profissional.estilos

    },


    descricao:
        dados.descricao,


    midia: {

        nomeArquivo:
            dados.midia.nomeArquivo,

        tipo:
            dados.midia.tipo,

        tamanho:
            dados.midia.tamanho,

        url:
            null,

        caminhoStorage:
            null

    },


    servicos: {

        show:
            dados.servicos.show,

        estudio:
            dados.servicos.estudio,

        acompanhamento:
            dados.servicos.acompanhamento,

        projetoPersonalizado:
            dados.servicos.projetoPersonalizado

    },


    disponibilidade: {

        formatos:
            dados.disponibilidade.formatos,

        regiao:
            dados.disponibilidade.regiao

    },


    publicacao: {

        status:
            CONFIG.STATUS_INICIAL,

        visibilidade:
            "publico"

    },


    metricas: {

        visualizacoes:
            0,

        contatos:
            0,

        favoritos:
            0

    },


    criadoEm:
        agora.toISOString(),


    atualizadoEm:
        agora.toISOString(),


    publicadoEm:
        null

};

}

/* =====================================================
FORMATO PARA FUTURO BANCO
===================================================== */

function prepararDadosParaBanco(
anuncio
) {

return {

    id:
        anuncio.id,

    tipo:
        anuncio.tipo,

    autor_id:
        anuncio.autor.id,

    nome:
        anuncio.profissional.nome,

    instrumento:
        anuncio.profissional.instrumento,

    localizacao:
        anuncio.profissional.localizacao,

    especialidades:
        anuncio.profissional.especialidades,

    estilos:
        anuncio.profissional.estilos,

    descricao:
        anuncio.descricao,

    midia_url:
        anuncio.midia.url,

    midia_storage_path:
        anuncio.midia.caminhoStorage,

    midia_tipo:
        anuncio.midia.tipo,

    preco_show:
        anuncio.servicos.show,

    preco_estudio:
        anuncio.servicos.estudio,

    preco_acompanhamento:
        anuncio.servicos.acompanhamento,

    projeto_personalizado:
        anuncio.servicos.projetoPersonalizado,

    formatos_trabalho:
        anuncio.disponibilidade.formatos,

    regiao_atendimento:
        anuncio.disponibilidade.regiao,

    status:
        anuncio.publicacao.status,

    visibilidade:
        anuncio.publicacao.visibilidade,

    criado_em:
        anuncio.criadoEm,

    atualizado_em:
        anuncio.atualizadoEm

};

}

/* =====================================================
LOCAL STORAGE
===================================================== */

function salvarAnuncioLocal(
anuncio
) {

let anuncios = [];


try {

    const dados =
        localStorage.getItem(
            CONFIG.STORAGE_KEY
        );


    if (dados) {

        const convertidos =
            JSON.parse(
                dados
            );


        if (
            Array.isArray(
                convertidos
            )
        ) {

            anuncios =
                convertidos;

        }

    }

} catch (erro) {

    console.error(
        "Erro ao carregar anúncios:",
        erro
    );

}


anuncios.push(
    anuncio
);


try {

    localStorage.setItem(

        CONFIG.STORAGE_KEY,

        JSON.stringify(
            anuncios
        )

    );

} catch (erro) {

    console.error(
        "Erro ao salvar anúncio:",
        erro
    );

}

}

/* =====================================================
GERAR ID
===================================================== */

function gerarId() {

return (

    "mus_" +

    Date.now().toString(36) +

    "_" +

    Math.random()
        .toString(36)
        .substring(2, 8)

);

}

/* =====================================================
HELPERS
===================================================== */

function obterValor(id) {

const elemento =
    document.getElementById(
        id
    );


if (!elemento) {

    return "";

}


return elemento.value.trim();

}

function obterNumero(selector) {

const elemento =
    document.querySelector(
        selector
    );


if (
    !elemento ||
    !elemento.value
) {

    return null;

}


const numero =
    Number(
        elemento.value
    );


return Number.isFinite(
    numero
)
    ? numero
    : null;

}

function formatarTamanho(bytes) {

if (bytes >= 1024 * 1024) {

    return (
        (bytes / (1024 * 1024))
            .toFixed(2)
        + " MB"
    );

}


return (

    (bytes / 1024)
        .toFixed(0)
    + " KB"

);

}

/* =====================================================
MENSAGEM
===================================================== */

function mostrarMensagem(
mensagem,
tipo
) {

if (tipo === "erro") {

    alert(
        mensagem
    );

    return;

}


alert(
    mensagem
);

}

/* =====================================================
NAVEGAÇÃO
===================================================== */

function voltarPagina() {

window.history.back();

}

function fecharPagina() {

window.location.href =
    "index.html";

}

/* =====================================================
ACESSO EXTERNO
===================================================== */

window.MusicalWorldMusico = {

coletarDados:
    coletarDadosFormulario,

criarAnuncio:
    criarEstruturaAnuncio,

prepararDadosBanco:
    prepararDadosParaBanco,

obterAnuncios:
    function() {

        try {

            const dados =
                localStorage.getItem(
                    CONFIG.STORAGE_KEY
                );


            return dados
                ? JSON.parse(dados)
                : [];

        } catch (erro) {

            return [];

        }

    }

};

/*


### O que já fica funcionando

Com esses três arquivos, o anúncio de músico já tem:

- **Nome/nome artístico**
- **Instrumento/função**
- **Localização**
- **Especialidades**
- **Descrição profissional**
- **Estilos musicais**
- **Foto ou vídeo**
- **Prévia da mídia**
- **Remoção da mídia**
- **Preço para show**
- **Preço para estúdio**
- **Preço para acompanhamento**
- **Projeto personalizado**
- **Disponibilidade presencial/estúdio/remoto**
- **Região de atendimento**
- **Confirmação antes da publicação**
- **Validação dos campos obrigatórios**
- **Geração de ID próprio do anúncio**
- **Data de criação e atualização**
- **Status inicial `pendente`**
- **Métricas iniciais**
- **Objeto estruturado para banco**
- **Função separada para futura integração com Supabase**
- **Estrutura preparada para Supabase Storage**

Uma diferença importante em relação ao código antigo é que agora o anúncio não é simplesmente um `alert()`. Ele já nasce com uma **estrutura de dados própria**, o que vai facilitar bastante quando formos criar as tabelas do MusicalWorld.

E mantive a mídia como **uma única mídia em destaque**, como estava no seu projeto anterior: o músico escolhe **foto OU vídeo**, não vários arquivos.

*/