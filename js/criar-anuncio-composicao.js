"use strict";

/*
=========================================================
MUSICALWORLD
CRIAR ANÚNCIO DE COMPOSIÇÃO
=========================================================

Este arquivo foi estruturado para funcionar atualmente
com localStorage e, futuramente, com um banco de dados.

Fluxo futuro:

FORMULÁRIO
   ↓
VALIDAÇÃO
   ↓
ORGANIZAÇÃO DOS DADOS
   ↓
UPLOAD DOS ARQUIVOS
   ↓
BANCO DE DADOS
   ↓
ANÚNCIO PUBLICADO
=========================================================
*/


document.addEventListener("DOMContentLoaded", iniciarPagina);


/* ======================================================
   CONFIGURAÇÕES
====================================================== */

const CONFIG = {

    STORAGE_KEY: "anuncios_composicoes_musicalworld",

    STATUS_INICIAL: "pendente",

    TIPO_ANUNCIO: "composicao",

    VERSAO_ESTRUTURA: 1

};


/* ======================================================
   ELEMENTOS
====================================================== */

let formulario = null;
let inputAudio = null;
let inputLetra = null;
let inputCifra = null;

let audioPreview = null;
let audioName = null;
let audioSize = null;
let removeAudioButton = null;

let descricaoInput = null;
let descricaoCount = null;

let previewTitle = null;
let previewGenre = null;
let previewDuration = null;


/* ======================================================
   ARQUIVOS TEMPORÁRIOS
====================================================== */

let arquivoAudioSelecionado = null;
let arquivoLetraSelecionado = null;
let arquivoCifraSelecionado = null;


/* ======================================================
   INICIALIZAÇÃO
====================================================== */

function iniciarPagina() {

    formulario = document.getElementById("form-composicao");

    inputAudio = document.getElementById("audio");
    inputLetra = document.getElementById("letra");
    inputCifra = document.getElementById("cifra");

    audioPreview = document.getElementById("audio-preview");
    audioName = document.getElementById("audio-name");
    audioSize = document.getElementById("audio-size");
    removeAudioButton = document.getElementById("remove-audio");

    descricaoInput = document.getElementById("descricao");
    descricaoCount = document.getElementById("descricao-count");

    previewTitle = document.getElementById("preview-title");
    previewGenre = document.getElementById("preview-genre");
    previewDuration = document.getElementById("preview-duration");


    configurarEventos();

    atualizarPrevia();

}


/* ======================================================
   EVENTOS
====================================================== */

function configurarEventos() {

    if (formulario) {

        formulario.addEventListener(
            "submit",
            publicarComposicao
        );

    }


    if (inputAudio) {

        inputAudio.addEventListener(
            "change",
            selecionarAudio
        );

    }


    if (inputLetra) {

        inputLetra.addEventListener(
            "change",
            selecionarLetra
        );

    }


    if (inputCifra) {

        inputCifra.addEventListener(
            "change",
            selecionarCifra
        );

    }


    if (removeAudioButton) {

        removeAudioButton.addEventListener(
            "click",
            removerAudio
        );

    }


    if (descricaoInput) {

        descricaoInput.addEventListener(
            "input",
            atualizarContadorDescricao
        );

    }


    const camposPrevia = [

        "titulo",
        "genero",
        "subgenero",
        "duracao"

    ];


    camposPrevia.forEach(function(id) {

        const campo = document.getElementById(id);

        if (campo) {

            campo.addEventListener(
                "input",
                atualizarPrevia
            );

            campo.addEventListener(
                "change",
                atualizarPrevia
            );

        }

    });

}


/* ======================================================
   ÁUDIO
====================================================== */

function selecionarAudio(event) {

    const arquivo = event.target.files[0];

    if (!arquivo) {

        return;

    }


    const extensoesPermitidas = [

        "audio/mpeg",
        "audio/wav",
        "audio/x-wav",
        "audio/mp4",
        "audio/x-m4a",
        "audio/m4a"

    ];


    if (
        arquivo.type &&
        !extensoesPermitidas.includes(arquivo.type)
    ) {

        mostrarMensagem(
            "Formato de áudio não permitido. Use MP3, WAV ou M4A.",
            "erro"
        );

        inputAudio.value = "";

        return;

    }


    const tamanhoMaximo = 50 * 1024 * 1024;


    if (arquivo.size > tamanhoMaximo) {

        mostrarMensagem(
            "O áudio deve ter no máximo 50 MB.",
            "erro"
        );

        inputAudio.value = "";

        return;

    }


    arquivoAudioSelecionado = arquivo;


    if (audioName) {

        audioName.textContent = arquivo.name;

    }


    if (audioSize) {

        audioSize.textContent =
            formatarTamanhoArquivo(arquivo.size);

    }


    if (audioPreview) {

        audioPreview.classList.remove("hidden");

    }

}


/* ======================================================
   REMOVER ÁUDIO
====================================================== */

function removerAudio() {

    arquivoAudioSelecionado = null;

    if (inputAudio) {

        inputAudio.value = "";

    }


    if (audioPreview) {

        audioPreview.classList.add("hidden");

    }

}


/* ======================================================
   LETRA
====================================================== */

function selecionarLetra(event) {

    const arquivo = event.target.files[0];

    if (!arquivo) {

        arquivoLetraSelecionado = null;

        return;

    }


    const extensoesPermitidas = [

        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ];


    if (
        arquivo.type &&
        !extensoesPermitidas.includes(arquivo.type)
    ) {

        mostrarMensagem(
            "Formato de letra não permitido.",
            "erro"
        );

        inputLetra.value = "";

        arquivoLetraSelecionado = null;

        return;

    }


    arquivoLetraSelecionado = arquivo;

}


/* ======================================================
   CIFRA
====================================================== */

function selecionarCifra(event) {

    const arquivo = event.target.files[0];

    if (!arquivo) {

        arquivoCifraSelecionado = null;

        return;

    }


    const extensoesPermitidas = [

        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ];


    if (
        arquivo.type &&
        !extensoesPermitidas.includes(arquivo.type)
    ) {

        mostrarMensagem(
            "Formato de cifra não permitido.",
            "erro"
        );

        inputCifra.value = "";

        arquivoCifraSelecionado = null;

        return;

    }


    arquivoCifraSelecionado = arquivo;

}


/* ======================================================
   CONTADOR DE DESCRIÇÃO
====================================================== */

function atualizarContadorDescricao() {

    if (!descricaoInput || !descricaoCount) {

        return;

    }


    const quantidade = descricaoInput.value.length;

    descricaoCount.textContent =
        quantidade + "/1000";

}


/* ======================================================
   PRÉVIA DO ANÚNCIO
====================================================== */

function atualizarPrevia() {

    const titulo =
        obterValor("titulo") ||
        "Nome da composição";


    const genero =
        obterValor("genero") ||
        "Gênero musical";


    const duracao =
        obterValor("duracao") ||
        "00:00";


    if (previewTitle) {

        previewTitle.textContent = titulo;

    }


    if (previewGenre) {

        previewGenre.textContent = genero;

    }


    if (previewDuration) {

        previewDuration.textContent = duracao;

    }

}


/* ======================================================
   PUBLICAR
====================================================== */

async function publicarComposicao(event) {

    event.preventDefault();


    const validacao = validarFormulario();


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


    const dados = coletarDadosFormulario();


    const anuncio = criarEstruturaAnuncio(dados);


    /*
    ------------------------------------------------------
    FUTURO BANCO DE DADOS

    Aqui futuramente teremos algo como:

    await enviarArquivos(anuncio);
    await salvarNoBanco(anuncio);

    Por enquanto utilizamos localStorage.
    ------------------------------------------------------
    */


    salvarAnuncioLocal(anuncio);


    console.log(
        "ANÚNCIO DE COMPOSIÇÃO CRIADO:",
        anuncio
    );


    mostrarMensagem(
        "Sua composição foi preparada para publicação.",
        "sucesso"
    );


    /*
    ------------------------------------------------------
    FUTURAMENTE:

    window.location.href =
        "meus-anuncios.html";

    ------------------------------------------------------
    */

}


/* ======================================================
   VALIDAR FORMULÁRIO
====================================================== */

function validarFormulario() {

    const titulo =
        document.getElementById("titulo");


    const genero =
        document.getElementById("genero");


    const descricao =
        document.getElementById("descricao");


    const negociacao =
        document.querySelector(
            'input[name="negociacao"]:checked'
        );


    const direitos =
        document.getElementById("direitos");


    if (!titulo || !titulo.value.trim()) {

        return {

            valido: false,

            mensagem:
                "Informe o título da composição.",

            campo: titulo

        };

    }


    if (!genero || !genero.value) {

        return {

            valido: false,

            mensagem:
                "Selecione o gênero musical.",

            campo: genero

        };

    }


    if (
        !descricao ||
        !descricao.value.trim()
    ) {

        return {

            valido: false,

            mensagem:
                "Descreva sua composição.",

            campo: descricao

        };

    }


    if (!negociacao) {

        return {

            valido: false,

            mensagem:
                "Selecione como deseja disponibilizar sua composição."

        };

    }


    if (
        !direitos ||
        !direitos.checked
    ) {

        return {

            valido: false,

            mensagem:
                "Confirme que você possui os direitos necessários para divulgar a composição.",

            campo: direitos

        };

    }


    return {

        valido: true

    };

}


/* ======================================================
   COLETAR DADOS DO FORMULÁRIO
====================================================== */

function coletarDadosFormulario() {


    const publico = Array.from(
        document.querySelectorAll(
            'input[name="publico"]:checked'
        )
    ).map(function(item) {

        return item.value;

    });


    const tiposNegociacao = Array.from(
        document.querySelectorAll(
            'input[name="tipo-negociacao"]:checked'
        )
    ).map(function(item) {

        return item.value;

    });


    const negociacaoSelecionada =
        document.querySelector(
            'input[name="negociacao"]:checked'
        );


    const registroSelecionado =
        document.querySelector(
            'input[name="registro"]:checked'
        );


    const duracaoAnuncioSelecionada =
        document.querySelector(
            'input[name="duracao-anuncio"]:checked'
        );


    return {

        /* ----------------------------------------------
           INFORMAÇÕES PRINCIPAIS
        ---------------------------------------------- */

        titulo:
            obterValor("titulo"),

        genero:
            obterValor("genero"),

        subgenero:
            obterValor("subgenero"),

        idioma:
            obterValor("idioma"),

        duracao:
            obterValor("duracao"),

        tipoObra:
            obterValor("tipo-obra"),


        /* ----------------------------------------------
           DESCRIÇÃO
        ---------------------------------------------- */

        descricao:
            obterValor("descricao"),

        tema:
            obterValor("tema"),

        publicoAlvo:
            publico,


        /* ----------------------------------------------
           DEMONSTRAÇÃO
        ---------------------------------------------- */

        tipoDemonstracao:
            obterRadioSelecionado("demo"),


        audio: {

            nomeArquivo:
                arquivoAudioSelecionado
                    ? arquivoAudioSelecionado.name
                    : null,

            tamanho:
                arquivoAudioSelecionado
                    ? arquivoAudioSelecionado.size
                    : null,

            tipo:
                arquivoAudioSelecionado
                    ? arquivoAudioSelecionado.type
                    : null,

            /*
            Futuramente:

            url:
                "https://...supabase.../audio.mp3"

            */

            url: null,

            caminhoStorage: null

        },


        /* ----------------------------------------------
           MATERIAL COMPLEMENTAR
        ---------------------------------------------- */

        letra: {

            nomeArquivo:
                arquivoLetraSelecionado
                    ? arquivoLetraSelecionado.name
                    : null,

            tamanho:
                arquivoLetraSelecionado
                    ? arquivoLetraSelecionado.size
                    : null,

            tipo:
                arquivoLetraSelecionado
                    ? arquivoLetraSelecionado.type
                    : null,

            url: null,

            caminhoStorage: null

        },


        cifra: {

            nomeArquivo:
                arquivoCifraSelecionado
                    ? arquivoCifraSelecionado.name
                    : null,

            tamanho:
                arquivoCifraSelecionado
                    ? arquivoCifraSelecionado.size
                    : null,

            tipo:
                arquivoCifraSelecionado
                    ? arquivoCifraSelecionado.type
                    : null,

            url: null,

            caminhoStorage: null

        },


        /* ----------------------------------------------
           NEGOCIAÇÃO
        ---------------------------------------------- */

        negociacao: {

            objetivo:
                negociacaoSelecionada
                    ? negociacaoSelecionada.value
                    : null,

            valor:
                obterValorNumerico("valor"),

            negociavel:
                obterCheckbox("negociavel"),

            tipos:
                tiposNegociacao

        },


        /* ----------------------------------------------
           DIREITOS
        ---------------------------------------------- */

        direitos: {

            registro:
                registroSelecionado
                    ? registroSelecionado.value
                    : null,

            confirmado:
                obterCheckbox("direitos")

        },


        /* ----------------------------------------------
           PUBLICAÇÃO
        ---------------------------------------------- */

        publicacao: {

            duracao:
                duracaoAnuncioSelecionada
                    ? duracaoAnuncioSelecionada.value
                    : "30",

            status:
                CONFIG.STATUS_INICIAL

        }

    };

}


/* ======================================================
   CRIAR ESTRUTURA DO ANÚNCIO
====================================================== */

function criarEstruturaAnuncio(dados) {

    const agora = new Date();


    return {

        /* ----------------------------------------------
           IDENTIFICAÇÃO
        ---------------------------------------------- */

        id:
            gerarIdAnuncio(),


        tipo:
            CONFIG.TIPO_ANUNCIO,


        versaoEstrutura:
            CONFIG.VERSAO_ESTRUTURA,


        /* ----------------------------------------------
           AUTOR
        ---------------------------------------------- */

        autor: {

            id: null,

            nome: null,

            email: null,

            avatarUrl: null

        },


        /*
        No futuro esses dados virão do usuário logado.

        Exemplo:

        autor: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            avatarUrl: usuario.avatar_url
        }
        */


        /* ----------------------------------------------
           COMPOSIÇÃO
        ---------------------------------------------- */

        composicao: {

            titulo:
                dados.titulo,

            genero:
                dados.genero,

            subgenero:
                dados.subgenero,

            idioma:
                dados.idioma,

            duracao:
                dados.duracao,

            tipoObra:
                dados.tipoObra,

            descricao:
                dados.descricao,

            tema:
                dados.tema,

            publicoAlvo:
                dados.publicoAlvo,

            tipoDemonstracao:
                dados.tipoDemonstracao

        },


        /* ----------------------------------------------
           ARQUIVOS
        ---------------------------------------------- */

        arquivos: {

            audio:
                dados.audio,

            letra:
                dados.letra,

            cifra:
                dados.cifra

        },


        /* ----------------------------------------------
           NEGOCIAÇÃO
        ---------------------------------------------- */

        negociacao:
            dados.negociacao,


        /* ----------------------------------------------
           DIREITOS
        ---------------------------------------------- */

        direitos:
            dados.direitos,


        /* ----------------------------------------------
           PUBLICAÇÃO
        ---------------------------------------------- */

        publicacao:
            dados.publicacao,


        /* ----------------------------------------------
           DATAS
        ---------------------------------------------- */

        criadoEm:
            agora.toISOString(),

        atualizadoEm:
            agora.toISOString(),

        publicadoEm:
            null,


        /* ----------------------------------------------
           MÉTRICAS
        ---------------------------------------------- */

        metricas: {

            visualizacoes: 0,

            reproducoes: 0,

            favoritos: 0,

            propostas: 0

        }

    };

}


/* ======================================================
   PREPARAR PARA FUTURO BANCO
====================================================== */

function prepararDadosParaBanco(anuncio) {

    /*
    Esta função transforma o objeto completo em uma
    estrutura que poderá ser enviada ao Supabase.

    NÃO estamos conectando ao Supabase ainda.

    Quando o banco estiver pronto, podemos substituir
    esta função pela estrutura real das tabelas.
    */


    return {

        id:
            anuncio.id,

        tipo:
            anuncio.tipo,

        autor_id:
            anuncio.autor.id,

        titulo:
            anuncio.composicao.titulo,

        genero:
            anuncio.composicao.genero,

        subgenero:
            anuncio.composicao.subgenero,

        idioma:
            anuncio.composicao.idioma,

        duracao:
            anuncio.composicao.duracao,

        tipo_obra:
            anuncio.composicao.tipoObra,

        descricao:
            anuncio.composicao.descricao,

        tema:
            anuncio.composicao.tema,

        publico_alvo:
            anuncio.composicao.publicoAlvo,

        tipo_demonstracao:
            anuncio.composicao.tipoDemonstracao,

        audio_url:
            anuncio.arquivos.audio.url,

        audio_storage_path:
            anuncio.arquivos.audio.caminhoStorage,

        letra_url:
            anuncio.arquivos.letra.url,

        letra_storage_path:
            anuncio.arquivos.letra.caminhoStorage,

        cifra_url:
            anuncio.arquivos.cifra.url,

        cifra_storage_path:
            anuncio.arquivos.cifra.caminhoStorage,

        objetivo_negociacao:
            anuncio.negociacao.objetivo,

        valor:
            anuncio.negociacao.valor,

        negociavel:
            anuncio.negociacao.negociavel,

        tipos_negociacao:
            anuncio.negociacao.tipos,

        registro:
            anuncio.direitos.registro,

        status:
            anuncio.publicacao.status,

        duracao_anuncio:
            anuncio.publicacao.duracao,

        criado_em:
            anuncio.criadoEm,

        atualizado_em:
            anuncio.atualizadoEm

    };

}


/* ======================================================
   SALVAR LOCALMENTE
====================================================== */

function salvarAnuncioLocal(anuncio) {

    let anuncios = [];


    try {

        const dadosSalvos =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );


        if (dadosSalvos) {

            const dadosConvertidos =
                JSON.parse(dadosSalvos);


            if (Array.isArray(dadosConvertidos)) {

                anuncios =
                    dadosConvertidos;

            }

        }

    } catch (erro) {

        console.error(
            "Erro ao ler anúncios:",
            erro
        );

    }


    anuncios.push(anuncio);


    try {

        localStorage.setItem(

            CONFIG.STORAGE_KEY,

            JSON.stringify(anuncios)

        );

    } catch (erro) {

        console.error(
            "Erro ao salvar anúncio:",
            erro
        );

    }

}


/* ======================================================
   OBTER ANÚNCIOS
====================================================== */

function obterAnunciosLocais() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.STORAGE_KEY
            );


        if (!dados) {

            return [];

        }


        const anuncios =
            JSON.parse(dados);


        return Array.isArray(anuncios)
            ? anuncios
            : [];


    } catch (erro) {

        console.error(
            "Erro ao carregar anúncios:",
            erro
        );


        return [];

    }

}


/* ======================================================
   GERAR ID
====================================================== */

function gerarIdAnuncio() {

    const data =
        Date.now().toString(36);


    const aleatorio =
        Math.random()
            .toString(36)
            .substring(2, 8);


    return "comp_" + data + "_" + aleatorio;

}


/* ======================================================
   HELPERS
====================================================== */

function obterValor(id) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {

        return "";

    }


    return elemento.value.trim();

}


function obterValorNumerico(id) {

    const valor =
        obterValor(id);


    if (!valor) {

        return null;

    }


    const numero =
        Number(
            valor.replace(",", ".")
        );


    return Number.isFinite(numero)
        ? numero
        : null;

}


function obterCheckbox(id) {

    const elemento =
        document.getElementById(id);


    return !!(
        elemento &&
        elemento.checked
    );

}


function obterRadioSelecionado(name) {

    const elemento =
        document.querySelector(
            'input[name="' + name + '"]:checked'
        );


    return elemento
        ? elemento.value
        : null;

}


function formatarTamanhoArquivo(bytes) {

    if (!bytes) {

        return "0 KB";

    }


    const mb =
        bytes / (1024 * 1024);


    if (mb >= 1) {

        return mb.toFixed(2) + " MB";

    }


    const kb =
        bytes / 1024;


    return kb.toFixed(0) + " KB";

}


/* ======================================================
   MENSAGEM
====================================================== */

function mostrarMensagem(texto, tipo) {

    /*
    Por enquanto usamos alert.

    Depois podemos substituir por um Toast/Modal
    visual seguindo exatamente o design do MusicalWorld.
    */

    if (tipo === "erro") {

        alert(texto);

        return;

    }


    alert(texto);

}


/* ======================================================
   FUNÇÕES FUTURAS
====================================================== */

/*
---------------------------------------------------------
UPLOAD DO ÁUDIO
---------------------------------------------------------

async function enviarAudioParaStorage(arquivo, anuncioId) {

    // Futuramente:
    //
    // const caminho =
    //     `composicoes/${anuncioId}/audio/${arquivo.name}`;
    //
    // Supabase Storage
    //
    // return URL do arquivo;

}
*/


/*
---------------------------------------------------------
UPLOAD DA LETRA
---------------------------------------------------------

async function enviarLetraParaStorage(arquivo, anuncioId) {

    // Futuramente enviaremos para:
    //
    // composicoes/{anuncioId}/letra/

}
*/


/*
---------------------------------------------------------
UPLOAD DA CIFRA
---------------------------------------------------------

async function enviarCifraParaStorage(arquivo, anuncioId) {

    // Futuramente enviaremos para:
    //
    // composicoes/{anuncioId}/cifra/

}
*/


/*
---------------------------------------------------------
SALVAR NO BANCO
---------------------------------------------------------

async function salvarNoBanco(anuncio) {

    // Futuramente:

    // const dadosBanco =
    //     prepararDadosParaBanco(anuncio);

    // const { data, error } =
    //     await supabaseClient
    //         .from("anuncios_composicoes")
    //         .insert(dadosBanco);

}
*/


/* ======================================================
   DISPONIBILIZAR FUNÇÕES
   PARA OUTROS ARQUIVOS
====================================================== */

window.MusicalWorldComposicao = {

    obterAnuncios:
        obterAnunciosLocais,

    prepararDadosParaBanco:
        prepararDadosParaBanco,

    coletarDadosFormulario:
        coletarDadosFormulario,

    criarEstruturaAnuncio:
        criarEstruturaAnuncio

};