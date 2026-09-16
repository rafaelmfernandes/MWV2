/* =========================================================
MUSICALWORLD — ESTADO CENTRAL DA CONTRATAÇÃO
Arquivo: ContratacaoEstado.js

## Responsabilidade:

Este arquivo centraliza todos os dados preenchidos durante
o fluxo de contratação.

Todas as páginas da contratação utilizam este mesmo estado:


   1. contratacao.html
   2. contratacao-data-horario.html
   3. contratacao-local.html
   4. contratacao-detalhes-evento.html
   5. resumo
   6. pagamento


Os dados ficam armazenados no sessionStorage enquanto o
usuário estiver realizando a contratação.

Isso permite:


   - avançar entre etapas;
   - voltar para etapas anteriores;
   - manter os campos preenchidos;
   - evitar passar dezenas de parâmetros pela URL;
   - compartilhar o mesmo estado entre todos os arquivos JS.


## IMPORTANTE:

Não limpar este estado ao simplesmente voltar de etapa.

O estado deve ser limpo somente quando:
- uma nova contratação for iniciada;
- o usuário cancelar o fluxo;
- a contratação for concluída;
- ou alguma rotina explicitamente chamar limpar().

========================================================= */

(function (window) {


"use strict";

/* =====================================================
   CONFIGURAÇÃO
   ===================================================== */

const CONFIG = {

    // Chave utilizada no sessionStorage.
    chaveStorage: "musicalworld_contratacao_estado",

    // Versão da estrutura do estado.
    // Pode ser incrementada futuramente caso a estrutura
    // precise sofrer alterações.
    versao: 1

};


/* =====================================================
   ESTADO PADRÃO
   ===================================================== */

/*
 * Este é o formato central de dados utilizado durante
 * todo o processo de contratação.
 *
 * Cada etapa preenche apenas aquilo que é responsabilidade
 * dela.
 *
 * As outras informações permanecem intactas.
 */

function criarEstadoPadrao() {

    return {

        versao: CONFIG.versao,

        criadoEm: null,

        atualizadoEm: null,


        /* =============================================
           IDENTIFICAÇÃO DA CONTRATAÇÃO
           ============================================= */

        perfilId: null,

        tipo: null,

        tipoPerfil: null,


        /* =============================================
           ARTISTA
           ============================================= */

        artista: {

            perfilId: null,

            usuarioId: null,

            nome: "",

            nomeExibicao: "",

            fotoUrl: "",

            tipoArtista: "",

            localizacao: ""

        },


        /* =============================================
           SERVIÇO
           ============================================= */

        servico: {

            id: null,

            nome: "",

            descricao: "",

            valor: null,

            valorMinimo: null,

            valorMaximo: null,

            formaCobranca: "",

            duracao: null,

            unidadeDuracao: "",

            localizacao: "",

            ativo: true

        },


        /* =============================================
           DATA E HORÁRIO
           ============================================= */

        dataEvento: "",

        horarioInicio: "",

        horarioFim: "",


        /* =============================================
           MONTAGEM / PREPARAÇÃO
           ============================================= */

        precisaMontagem: null,

        horarioChegada: "",


        /* =============================================
           LOCAL DO EVENTO
           ============================================= */

        local: {

            tipoLocal: "",

            nomeLocal: "",

            cep: "",

            estado: "",

            cidade: "",

            bairro: "",

            endereco: "",

            numero: "",

            complemento: "",

            referencia: "",

            semNumero: false,

            localAindaNaoDefinido: false

        },


        /* =============================================
           DETALHES DO EVENTO
           ============================================= */

        evento: {

            tipoEvento: "",

            nomeEvento: "",

            quantidadeConvidados: null,

            descricao: "",

            observacoes: "",

            informacoesAdicionais: ""

        },


        /* =============================================
           CONTRATANTE
           ============================================= */

        contratante: {

            perfilId: null,

            usuarioId: null,

            nome: "",

            email: "",

            telefone: ""

        },


        /* =============================================
           PAGAMENTO
           ============================================= */

        pagamento: {

            metodo: "",

            valor: null,

            status: "",

            idTransacao: null

        },


        /* =============================================
           CONTROLE DO FLUXO
           ============================================= */

        etapaAtual: 1,

        totalEtapas: 6,

        fluxoAtivo: true

    };

}


/* =====================================================
   UTILITÁRIOS
   ===================================================== */

function obterTimestamp() {

    return new Date().toISOString();

}


function clonar(objeto) {

    return JSON.parse(JSON.stringify(objeto));

}


/*
 * Faz uma mesclagem profunda.
 *
 * Exemplo:
 *
 * estado.local.cidade = "Goiânia"
 *
 * depois:
 *
 * salvar({
 *     local: {
 *         bairro: "Centro"
 *     }
 * })
 *
 * O resultado será:
 *
 * cidade: "Goiânia"
 * bairro: "Centro"
 *
 * sem apagar os outros campos.
 */

function mesclarProfundo(destino, origem) {

    if (!origem || typeof origem !== "object") {

        return destino;

    }

    Object.keys(origem).forEach(function (chave) {

        const valor = origem[chave];

        if (
            valor &&
            typeof valor === "object" &&
            !Array.isArray(valor)
        ) {

            if (
                !destino[chave] ||
                typeof destino[chave] !== "object" ||
                Array.isArray(destino[chave])
            ) {

                destino[chave] = {};

            }

            mesclarProfundo(destino[chave], valor);

        } else {

            destino[chave] = valor;

        }

    });

    return destino;

}


/* =====================================================
   STORAGE
   ===================================================== */

function salvarStorage(estado) {

    try {

        sessionStorage.setItem(
            CONFIG.chaveStorage,
            JSON.stringify(estado)
        );

        return true;

    } catch (erro) {

        console.error(
            "MusicalWorldContratacaoEstado: erro ao salvar estado.",
            erro
        );

        return false;

    }

}


function carregarStorage() {

    try {

        const dados = sessionStorage.getItem(
            CONFIG.chaveStorage
        );

        if (!dados) {

            return null;

        }

        const estado = JSON.parse(dados);

        if (!estado || typeof estado !== "object") {

            return null;

        }

        return estado;

    } catch (erro) {

        console.error(
            "MusicalWorldContratacaoEstado: erro ao carregar estado.",
            erro
        );

        return null;

    }

}


/* =====================================================
   NORMALIZAÇÃO DO ESTADO
   ===================================================== */

/*
 * Garante que estados antigos ou incompletos continuem
 * funcionando mesmo que novos campos sejam adicionados
 * futuramente.
 */

function normalizarEstado(estado) {

    const padrao = criarEstadoPadrao();

    if (!estado || typeof estado !== "object") {

        return padrao;

    }

    const resultado = mesclarProfundo(
        padrao,
        estado
    );

    resultado.versao = CONFIG.versao;

    return resultado;

}


/* =====================================================
   ESTADO EM MEMÓRIA
   ===================================================== */

let estadoAtual = null;


/* =====================================================
   INICIALIZAR
   ===================================================== */

function inicializar() {

    const estadoSalvo = carregarStorage();

    if (estadoSalvo) {

        estadoAtual = normalizarEstado(
            estadoSalvo
        );

    } else {

        estadoAtual = criarEstadoPadrao();

    }

    return obter();

}


/* =====================================================
   OBTER ESTADO COMPLETO
   ===================================================== */

function obter() {

    if (!estadoAtual) {

        inicializar();

    }

    return clonar(estadoAtual);

}


/* =====================================================
   OBTER CAMPO
   ===================================================== */

/*
 * Permite acessar campos simples:
 *
 * obterCampo("perfilId")
 *
 * ou campos internos:
 *
 * obterCampo("local")
 * obterCampo("evento")
 * obterCampo("servico")
 */

function obterCampo(campo) {

    if (!estadoAtual) {

        inicializar();

    }

    if (!campo) {

        return null;

    }

    const partes = String(campo).split(".");

    let valor = estadoAtual;

    for (let i = 0; i < partes.length; i++) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return null;

        }

        valor = valor[partes[i]];

    }

    return clonar(valor);

}


/* =====================================================
   SALVAR DADOS
   ===================================================== */

/*
 * Adiciona ou atualiza somente os dados enviados.
 *
 * Isso é importante porque uma etapa nunca deve apagar
 * informações preenchidas por outra etapa.
 */

function salvar(dados) {

    if (!dados || typeof dados !== "object") {

        console.warn(
            "MusicalWorldContratacaoEstado: nenhum dado válido foi enviado para salvar()."
        );

        return obter();

    }

    if (!estadoAtual) {

        inicializar();

    }

    mesclarProfundo(
        estadoAtual,
        dados
    );

    estadoAtual.atualizadoEm = obterTimestamp();

    salvarStorage(estadoAtual);

    return obter();

}


/* =====================================================
   DEFINIR CAMPO INDIVIDUAL
   ===================================================== */

/*
 * Permite alterar um único campo:
 *
 * definir("perfilId", 5)
 *
 * definir("local.cidade", "Goiânia")
 */

function definir(campo, valor) {

    if (!campo) {

        return obter();

    }

    if (!estadoAtual) {

        inicializar();

    }

    const partes = String(campo).split(".");

    let objeto = estadoAtual;

    for (
        let i = 0;
        i < partes.length - 1;
        i++
    ) {

        const parte = partes[i];

        if (
            !objeto[parte] ||
            typeof objeto[parte] !== "object"
        ) {

            objeto[parte] = {};

        }

        objeto = objeto[parte];

    }

    objeto[partes[partes.length - 1]] = valor;

    estadoAtual.atualizadoEm = obterTimestamp();

    salvarStorage(estadoAtual);

    return obter();

}


/* =====================================================
   INICIAR NOVA CONTRATAÇÃO
   ===================================================== */

/*
 * Esta função deve ser utilizada somente quando o usuário
 * realmente iniciar uma nova contratação.
 *
 * Ela NÃO deve ser chamada ao voltar entre etapas.
 */

function iniciarNovo(dadosIniciais) {

    estadoAtual = criarEstadoPadrao();

    estadoAtual.criadoEm = obterTimestamp();

    estadoAtual.atualizadoEm = estadoAtual.criadoEm;

    estadoAtual.fluxoAtivo = true;

    if (
        dadosIniciais &&
        typeof dadosIniciais === "object"
    ) {

        mesclarProfundo(
            estadoAtual,
            dadosIniciais
        );

    }

    salvarStorage(estadoAtual);

    console.log(
        "MusicalWorldContratacaoEstado: nova contratação iniciada.",
        obter()
    );

    return obter();

}


/* =====================================================
   LIMPAR CONTRATAÇÃO
   ===================================================== */

/*
 * Remove completamente o estado atual.
 *
 * Deve ser utilizado quando:
 *
 * - usuário cancela contratação;
 * - contratação é concluída;
 * - usuário inicia deliberadamente outra contratação.
 */

function limpar() {

    try {

        sessionStorage.removeItem(
            CONFIG.chaveStorage
        );

    } catch (erro) {

        console.error(
            "MusicalWorldContratacaoEstado: erro ao limpar estado.",
            erro
        );

    }

    estadoAtual = criarEstadoPadrao();

    console.log(
        "MusicalWorldContratacaoEstado: estado da contratação limpo."
    );

    return obter();

}


/* =====================================================
   VERIFICAR EXISTÊNCIA
   ===================================================== */

function possui() {

    try {

        return !!sessionStorage.getItem(
            CONFIG.chaveStorage
        );

    } catch (erro) {

        return false;

    }

}


/* =====================================================
   VERIFICAR SE EXISTE FLUXO ATIVO
   ===================================================== */

function fluxoAtivo() {

    if (!estadoAtual) {

        inicializar();

    }

    return estadoAtual.fluxoAtivo === true;

}


/* =====================================================
   ATUALIZAR ETAPA
   ===================================================== */

function definirEtapa(etapa) {

    const numero = Number(etapa);

    if (
        !Number.isFinite(numero) ||
        numero < 1
    ) {

        return obter();

    }

    return salvar({

        etapaAtual: numero

    });

}


/* =====================================================
   OBTER ETAPA ATUAL
   ===================================================== */

function obterEtapa() {

    if (!estadoAtual) {

        inicializar();

    }

    return Number(
        estadoAtual.etapaAtual || 1
    );

}


/* =====================================================
   IMPORTAR DADOS DA URL
   ===================================================== */

/*
 * Compatibilidade com o fluxo atual.
 *
 * Enquanto estamos migrando as páginas antigas para o
 * estado central, esta função permite que parâmetros
 * existentes na URL sejam incorporados ao estado.
 *
 * Depois que todas as páginas estiverem utilizando o
 * ContratacaoEstado corretamente, a URL deixará de ser
 * responsável pelo transporte dos dados.
 */

function importarParametrosURL(url) {

    try {

        const endereco = url ||
            window.location.href;

        const parametros =
            new URL(endereco).searchParams;

        const dados = {};

        const perfilId =
            parametros.get("perfil_id");

        const servicoId =
            parametros.get("servico_id");

        const tipo =
            parametros.get("tipo");

        const dataEvento =
            parametros.get("data_evento");

        const horarioInicio =
            parametros.get("horario_inicio");

        const horarioFim =
            parametros.get("horario_fim");

        const precisaMontagem =
            parametros.get("precisa_montagem");

        const horarioChegada =
            parametros.get("horario_chegada");

        const tipoLocal =
            parametros.get("tipo_local");

        const nomeLocal =
            parametros.get("nome_local");

        const cep =
            parametros.get("cep");

        const estado =
            parametros.get("estado");

        const cidade =
            parametros.get("cidade");

        const bairro =
            parametros.get("bairro");

        const enderecoLocal =
            parametros.get("endereco");

        const numero =
            parametros.get("numero");

        const complemento =
            parametros.get("complemento");

        const referencia =
            parametros.get("referencia");

        const semNumero =
            parametros.get("sem_numero");

        const localAindaNaoDefinido =
            parametros.get("local_ainda_nao_definido");

        const tipoEvento =
            parametros.get("tipo_evento");

        const nomeEvento =
            parametros.get("nome_evento");

        const quantidadeConvidados =
            parametros.get("quantidade_convidados");

        const descricao =
            parametros.get("descricao");

        const observacoes =
            parametros.get("observacoes");


        if (perfilId !== null) {

            dados.perfilId = perfilId;

        }


        if (servicoId !== null) {

            dados.servico = {

                id: servicoId

            };

        }


        if (tipo !== null) {

            dados.tipo = tipo;

        }


        if (dataEvento !== null) {

            dados.dataEvento = dataEvento;

        }


        if (horarioInicio !== null) {

            dados.horarioInicio = horarioInicio;

        }


        if (horarioFim !== null) {

            dados.horarioFim = horarioFim;

        }


        if (precisaMontagem !== null) {

            dados.precisaMontagem =
                normalizarBooleano(
                    precisaMontagem
                );

        }


        if (horarioChegada !== null) {

            dados.horarioChegada =
                horarioChegada;

        }


        if (
            tipoLocal !== null ||
            nomeLocal !== null ||
            cep !== null ||
            estado !== null ||
            cidade !== null ||
            bairro !== null ||
            enderecoLocal !== null ||
            numero !== null ||
            complemento !== null ||
            referencia !== null
        ) {

            dados.local = {};

            if (tipoLocal !== null) {
                dados.local.tipoLocal = tipoLocal;
            }

            if (nomeLocal !== null) {
                dados.local.nomeLocal = nomeLocal;
            }

            if (cep !== null) {
                dados.local.cep = cep;
            }

            if (estado !== null) {
                dados.local.estado = estado;
            }

            if (cidade !== null) {
                dados.local.cidade = cidade;
            }

            if (bairro !== null) {
                dados.local.bairro = bairro;
            }

            if (enderecoLocal !== null) {
                dados.local.endereco = enderecoLocal;
            }

            if (numero !== null) {
                dados.local.numero = numero;
            }

            if (complemento !== null) {
                dados.local.complemento =
                    complemento;
            }

            if (referencia !== null) {
                dados.local.referencia =
                    referencia;
            }

        }


        if (semNumero !== null) {

            if (!dados.local) {

                dados.local = {};

            }

            dados.local.semNumero =
                normalizarBooleano(
                    semNumero
                );

        }


        if (
            localAindaNaoDefinido !== null
        ) {

            if (!dados.local) {

                dados.local = {};

            }

            dados.local.localAindaNaoDefinido =
                normalizarBooleano(
                    localAindaNaoDefinido
                );

        }


        if (
            tipoEvento !== null ||
            nomeEvento !== null ||
            quantidadeConvidados !== null ||
            descricao !== null ||
            observacoes !== null
        ) {

            dados.evento = {};

            if (tipoEvento !== null) {

                dados.evento.tipoEvento =
                    tipoEvento;

            }

            if (nomeEvento !== null) {

                dados.evento.nomeEvento =
                    nomeEvento;

            }

            if (
                quantidadeConvidados !== null
            ) {

                dados.evento.quantidadeConvidados =
                    quantidadeConvidados === ""
                        ? null
                        : Number(
                            quantidadeConvidados
                        );

            }

            if (descricao !== null) {

                dados.evento.descricao =
                    descricao;

            }

            if (observacoes !== null) {

                dados.evento.observacoes =
                    observacoes;

            }

        }


        if (
            Object.keys(dados).length > 0
        ) {

            salvar(dados);

        }

        return obter();

    } catch (erro) {

        console.error(
            "MusicalWorldContratacaoEstado: erro ao importar parâmetros da URL.",
            erro
        );

        return obter();

    }

}


/* =====================================================
   NORMALIZAR BOOLEANO
   ===================================================== */

function normalizarBooleano(valor) {

    if (
        valor === true ||
        valor === false
    ) {

        return valor;

    }

    if (valor === null || valor === undefined) {

        return null;

    }

    const texto =
        String(valor)
            .trim()
            .toLowerCase();

    if (
        texto === "true" ||
        texto === "1" ||
        texto === "sim" ||
        texto === "yes"
    ) {

        return true;

    }

    if (
        texto === "false" ||
        texto === "0" ||
        texto === "nao" ||
        texto === "não" ||
        texto === "no"
    ) {

        return false;

    }

    return null;

}


/* =====================================================
   EXPORTAR ESTADO PARA URL
   ===================================================== */

/*
 * Mantemos esta função apenas como recurso de
 * compatibilidade durante a migração.
 *
 * A ideia futura é NÃO precisar mais transportar todos
 * os dados pela URL.
 */

function exportarParametrosURL() {

    if (!estadoAtual) {

        inicializar();

    }

    const parametros =
        new URLSearchParams();

    if (estadoAtual.perfilId !== null) {

        parametros.set(
            "perfil_id",
            estadoAtual.perfilId
        );

    }

    if (estadoAtual.tipo) {

        parametros.set(
            "tipo",
            estadoAtual.tipo
        );

    }

    if (
        estadoAtual.servico &&
        estadoAtual.servico.id !== null
    ) {

        parametros.set(
            "servico_id",
            estadoAtual.servico.id
        );

    }

    if (estadoAtual.dataEvento) {

        parametros.set(
            "data_evento",
            estadoAtual.dataEvento
        );

    }

    if (estadoAtual.horarioInicio) {

        parametros.set(
            "horario_inicio",
            estadoAtual.horarioInicio
        );

    }

    if (estadoAtual.horarioFim) {

        parametros.set(
            "horario_fim",
            estadoAtual.horarioFim
        );

    }

    if (
        estadoAtual.precisaMontagem !== null
    ) {

        parametros.set(
            "precisa_montagem",
            estadoAtual.precisaMontagem
                ? "sim"
                : "nao"
        );

    }

    if (estadoAtual.horarioChegada) {

        parametros.set(
            "horario_chegada",
            estadoAtual.horarioChegada
        );

    }


    /* =============================================
       LOCAL
       ============================================= */

    const local =
        estadoAtual.local || {};

    const mapaLocal = {

        tipo_local: local.tipoLocal,

        nome_local: local.nomeLocal,

        cep: local.cep,

        estado: local.estado,

        cidade: local.cidade,

        bairro: local.bairro,

        endereco: local.endereco,

        numero: local.numero,

        complemento: local.complemento,

        referencia: local.referencia

    };

    Object.keys(mapaLocal).forEach(function (chave) {

        const valor = mapaLocal[chave];

        if (
            valor !== null &&
            valor !== undefined &&
            valor !== ""
        ) {

            parametros.set(
                chave,
                valor
            );

        }

    });


    if (local.semNumero) {

        parametros.set(
            "sem_numero",
            "true"
        );

    }

    if (local.localAindaNaoDefinido) {

        parametros.set(
            "local_ainda_nao_definido",
            "true"
        );

    }


    /* =============================================
       EVENTO
       ============================================= */

    const evento =
        estadoAtual.evento || {};

    const mapaEvento = {

        tipo_evento: evento.tipoEvento,

        nome_evento: evento.nomeEvento,

        quantidade_convidados:
            evento.quantidadeConvidados,

        descricao: evento.descricao,

        observacoes: evento.observacoes

    };

    Object.keys(mapaEvento).forEach(function (chave) {

        const valor = mapaEvento[chave];

        if (
            valor !== null &&
            valor !== undefined &&
            valor !== ""
        ) {

            parametros.set(
                chave,
                valor
            );

        }

    });


    return parametros;

}


/* =====================================================
   LOG DO ESTADO
   ===================================================== */

function diagnostico() {

    console.group(
        "MusicalWorldContratacaoEstado"
    );

    console.log(
        "Storage:",
        CONFIG.chaveStorage
    );

    console.log(
        "Versão:",
        CONFIG.versao
    );

    console.log(
        "Fluxo ativo:",
        fluxoAtivo()
    );

    console.log(
        "Etapa atual:",
        obterEtapa()
    );

    console.log(
        "Estado:",
        obter()
    );

    console.groupEnd();

    return obter();

}


/* =====================================================
   API PÚBLICA
   ===================================================== */

const API = {

    inicializar: inicializar,

    obter: obter,

    obterCampo: obterCampo,

    salvar: salvar,

    definir: definir,

    iniciarNovo: iniciarNovo,

    limpar: limpar,

    possui: possui,

    fluxoAtivo: fluxoAtivo,

    definirEtapa: definirEtapa,

    obterEtapa: obterEtapa,

    importarParametrosURL:
        importarParametrosURL,

    exportarParametrosURL:
        exportarParametrosURL,

    diagnostico: diagnostico

};


/* =====================================================
   DISPONIBILIZAR GLOBALMENTE
   ===================================================== */

window.MusicalWorldContratacaoEstado =
    API;

/*
 * Alias curto para facilitar a utilização dentro
 * dos arquivos das etapas.
 */

window.ContratacaoEstado = API;


/* =====================================================
   INICIALIZAÇÃO AUTOMÁTICA
   ===================================================== */

inicializar();


console.log(
    "MusicalWorldContratacaoEstado: módulo carregado."
);


})(window);
