/* =========================================================
   MUSICALWORLD — ETAPA 5
   Arquivo: contratacao-revisao.js

   Responsabilidade:

   - Controlar a quinta etapa da contratação.
   - Ler os dados armazenados pelo ContratacaoEstado.js.
   - Exibir os dados acumulados das etapas anteriores.
   - Permitir retornar diretamente para etapas anteriores.
   - Preparar a contratação para a etapa de pagamento.

   IMPORTANTE:

   Este arquivo NÃO possui mais um estado próprio.

   O estado oficial da contratação é mantido exclusivamente
   pelo:

       MusicalWorldContratacaoEstado

   Isso evita que diferentes etapas mantenham informações
   duplicadas ou conflitantes.
   ========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        etapaAtual: 5,

        totalEtapas: 6,

        paginas: {

            inicio: "contratacao.html",

            dataHorario: "contratacao-data-horario.html",

            local: "contratacao-local.html",

            evento: "contratacao-detalhes-evento.html",

            pagamento: "contratacao-pagamento.html"

        },

        seletores: {

            btnVoltar: "btnVoltar",

            btnAvancar: "btnAvancar",

            btnCancelar: "btnCancelarContratacao",

            editar: "[data-editar]",


            artistaAvatar: "artistaAvatar",

            artistaNome: "artistaNome",

            artistaTipo: "artistaTipo",

            artistaLocalizacao: "artistaLocalizacao",


            servicoNome: "servicoNome",

            servicoValor: "servicoValor",

            servicoDescricao: "servicoDescricao",

            servicoDuracao: "servicoDuracao",

            servicoLocalizacao: "servicoLocalizacao",


            dataEvento: "dataEvento",

            horarioEvento: "horarioEvento",

            horarioChegada: "horarioChegada",


            tipoLocal: "tipoLocal",

            enderecoEvento: "enderecoEvento",


            tipoEvento: "tipoEvento",

            quantidadePessoas: "quantidadePessoas",

            nomeEvento: "nomeEvento",

            estruturaEvento: "estruturaEvento",

            observacoesEvento: "observacoesEvento"

        }

    };


    /* =========================================================
       UTILITÁRIOS — DOM
       ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    function definirTexto(id, valor, fallback) {

        const elemento = obterElemento(id);

        if (!elemento) {
            return;
        }


        const possuiValor =
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== "";


        elemento.textContent =
            possuiValor
                ? String(valor)
                : fallback;

    }


    /* =========================================================
       UTILITÁRIOS — FORMATAÇÃO
       ========================================================= */

    function formatarMoeda(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return "Não informado";
        }


        const numero = Number(valor);


        if (Number.isNaN(numero)) {

            return String(valor);

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function obterIniciais(nome) {

        if (!nome) {
            return "MW";
        }


        const partes =
            String(nome)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {
            return "MW";
        }


        if (partes.length === 1) {

            return partes[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            partes[0].charAt(0) +
            partes[partes.length - 1].charAt(0)
        ).toUpperCase();

    }


    function formatarData(data) {

        if (!data) {
            return "Não informado";
        }


        const dataObj =
            new Date(`${data}T00:00:00`);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return data;

        }


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatarHorario(
        inicio,
        fim
    ) {

        if (!inicio && !fim) {
            return "Não informado";
        }


        if (inicio && fim) {

            return `${inicio} às ${fim}`;

        }


        if (inicio) {

            return `A partir das ${inicio}`;

        }


        if (fim) {

            return `Até ${fim}`;

        }


        return "Não informado";

    }


    /* =========================================================
       ESTADO CENTRAL
       ========================================================= */

    function obterGerenciadorEstado() {

        const gerenciador =
            window.MusicalWorldContratacaoEstado ||
            window.ContratacaoEstado;


        if (!gerenciador) {

            console.error(
                "MusicalWorldContratacaoRevisao: " +
                "ContratacaoEstado.js não foi encontrado."
            );


            return null;

        }


        return gerenciador;

    }


    function carregarEstadoCentral() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            throw new Error(
                "O estado central da contratação não está disponível."
            );

        }


        if (
            typeof gerenciador.inicializar === "function"
        ) {

            gerenciador.inicializar();

        }


        const dados =
            gerenciador.obter();


        if (!dados) {

            throw new Error(
                "Não foi possível obter o estado da contratação."
            );

        }


        /*
         * A Etapa 5 passa a ser a etapa atual.
         *
         * IMPORTANTE:
         * definirEtapa() altera apenas a etapa atual.
         * Os demais dados continuam preservados.
         */

        if (
            typeof gerenciador.definirEtapa === "function"
        ) {

            gerenciador.definirEtapa(
                CONFIG.etapaAtual
            );

        }


        return gerenciador.obter();

    }


    /* =========================================================
       RENDERIZAÇÃO — ARTISTA
       ========================================================= */

    function renderizarArtista(dados) {

        const artista =
            dados.artista || {};


        const nome =
            artista.nomeExibicao ||
            artista.nome ||
            "";


        definirTexto(
            CONFIG.seletores.artistaNome,
            nome,
            "Artista não informado"
        );


        definirTexto(
            CONFIG.seletores.artistaTipo,
            artista.tipoArtista ||
            dados.tipo ||
            dados.tipoPerfil ||
            "",
            "Tipo não informado"
        );


        definirTexto(
            CONFIG.seletores.artistaLocalizacao,
            artista.localizacao,
            "Localização não informada"
        );


        const avatar =
            obterElemento(
                CONFIG.seletores.artistaAvatar
            );


        if (!avatar) {
            return;
        }


        avatar.innerHTML = "";


        const fotoUrl =
            artista.fotoUrl ||
            artista.foto_url ||
            "";


        if (fotoUrl) {

            const imagem =
                document.createElement("img");


            imagem.src =
                fotoUrl;


            imagem.alt =
                nome
                    ? `Foto de ${nome}`
                    : "Foto do artista";


            imagem.addEventListener(
                "error",
                function () {

                    avatar.textContent =
                        obterIniciais(nome);

                }
            );


            avatar.appendChild(imagem);

            return;

        }


        avatar.textContent =
            obterIniciais(nome);

    }


    /* =========================================================
       RENDERIZAÇÃO — SERVIÇO
       ========================================================= */

    function renderizarServico(dados) {

        const servico =
            dados.servico || {};


        definirTexto(
            CONFIG.seletores.servicoNome,
            servico.nome,
            "Serviço não informado"
        );


        definirTexto(
            CONFIG.seletores.servicoValor,
            formatarMoeda(
                servico.valor
            ),
            "Não informado"
        );


        definirTexto(
            CONFIG.seletores.servicoDescricao,
            servico.descricao,
            "Descrição não informada."
        );


        /*
         * A duração pode vir de diferentes estruturas,
         * dependendo de como o serviço foi cadastrado.
         */

        let duracao = "";


        if (
            servico.duracao !== null &&
            servico.duracao !== undefined &&
            servico.duracao !== ""
        ) {

            duracao =
                String(
                    servico.duracao
                );

        }


        if (
            duracao &&
            servico.unidadeDuracao
        ) {

            duracao =
                `${duracao} ${servico.unidadeDuracao}`;

        }


        definirTexto(
            CONFIG.seletores.servicoDuracao,
            duracao,
            "Não informado"
        );


        definirTexto(
            CONFIG.seletores.servicoLocalizacao,
            servico.localizacao,
            "Não informado"
        );

    }


    /* =========================================================
       RENDERIZAÇÃO — DATA E HORÁRIO
       ========================================================= */

    function renderizarDataHorario(dados) {

        definirTexto(
            CONFIG.seletores.dataEvento,
            formatarData(
                dados.dataEvento
            ),
            "Não informado"
        );


        definirTexto(
            CONFIG.seletores.horarioEvento,
            formatarHorario(
                dados.horarioInicio,
                dados.horarioFim
            ),
            "Não informado"
        );


        definirTexto(
            CONFIG.seletores.horarioChegada,
            dados.horarioChegada,
            "Não informado"
        );

    }


    /* =========================================================
       RENDERIZAÇÃO — LOCAL
       ========================================================= */

    function renderizarLocal(dados) {

        const local =
            dados.local || {};


        if (
            local.localAindaNaoDefinido
        ) {

            definirTexto(
                CONFIG.seletores.tipoLocal,
                "Local ainda não definido",
                "Local ainda não definido"
            );


            definirTexto(
                CONFIG.seletores.enderecoEvento,
                "O endereço será informado posteriormente.",
                "O endereço será informado posteriormente."
            );


            return;

        }


        definirTexto(
            CONFIG.seletores.tipoLocal,
            local.tipoLocal,
            "Tipo de local não informado"
        );


        const partes = [];


        if (local.nomeLocal) {

            partes.push(
                local.nomeLocal
            );

        }


        if (local.endereco) {

            let endereco =
                local.endereco;


            if (local.numero) {

                endereco +=
                    `, ${local.numero}`;

            }


            partes.push(
                endereco
            );

        }


        if (local.complemento) {

            partes.push(
                local.complemento
            );

        }


        if (local.bairro) {

            partes.push(
                local.bairro
            );

        }


        const cidadeEstado = [

            local.cidade,

            local.estado

        ]
            .filter(Boolean)
            .join(" - ");


        if (cidadeEstado) {

            partes.push(
                cidadeEstado
            );

        }


        if (local.cep) {

            partes.push(
                `CEP ${local.cep}`
            );

        }


        if (local.referencia) {

            partes.push(
                `Referência: ${local.referencia}`
            );

        }


        definirTexto(
            CONFIG.seletores.enderecoEvento,
            partes.join(", "),
            "O endereço ainda não foi informado."
        );

    }


    /* =========================================================
       RENDERIZAÇÃO — EVENTO
       ========================================================= */

    function obterEstruturaDoEstado(dados) {

        /*
         * A Etapa 4 atualmente armazena a estrutura dentro
         * de evento.informacoesAdicionais em formato JSON.
         *
         * Esta função interpreta esse formato sem alterar
         * o estado central.
         */


        if (
            Array.isArray(
                dados.evento &&
                dados.evento.estrutura
            )
        ) {

            return dados.evento.estrutura;

        }


        const informacoes =
            dados.evento &&
            dados.evento.informacoesAdicionais;


        if (!informacoes) {

            return [];

        }


        if (
            typeof informacoes === "object" &&
            Array.isArray(
                informacoes.estrutura
            )
        ) {

            return informacoes.estrutura;

        }


        if (
            typeof informacoes !== "string"
        ) {

            return [];

        }


        try {

            const dadosExtras =
                JSON.parse(
                    informacoes
                );


            if (
                dadosExtras &&
                Array.isArray(
                    dadosExtras.estrutura
                )
            ) {

                return dadosExtras.estrutura;

            }

        } catch (erro) {

            /*
             * Não interrompemos a revisão caso o conteúdo
             * não esteja em JSON.
             */

            console.warn(
                "MusicalWorld Contratação: " +
                "não foi possível interpretar as informações adicionais.",
                erro
            );

        }


        return [];

    }


    function renderizarEvento(dados) {

        const evento =
            dados.evento || {};


        definirTexto(
            CONFIG.seletores.tipoEvento,
            evento.tipoEvento,
            "Não informado"
        );


        const quantidade =
            evento.quantidadeConvidados;


        definirTexto(
            CONFIG.seletores.quantidadePessoas,
            quantidade !== null &&
            quantidade !== undefined &&
            quantidade !== ""
                ? Number(
                    quantidade
                ).toLocaleString("pt-BR")
                : null,
            "Não informado"
        );


        definirTexto(
            CONFIG.seletores.nomeEvento,
            evento.nomeEvento,
            "Não informado"
        );


        const estruturas =
            obterEstruturaDoEstado(
                dados
            );


        const nomesEstrutura = {

            som: "Som",

            palco: "Palco",

            iluminacao: "Iluminação",

            microfone: "Microfone",

            nenhuma: "Nenhuma"

        };


        const estruturaFormatada =
            estruturas
                .map(function (item) {

                    return (
                        nomesEstrutura[item] ||
                        item
                    );

                })
                .filter(Boolean)
                .join(", ");


        definirTexto(
            CONFIG.seletores.estruturaEvento,
            estruturaFormatada,
            "Não informado"
        );


        definirTexto(
            CONFIG.seletores.observacoesEvento,
            evento.observacoes,
            "Nenhuma observação adicionada."
        );

    }


    /* =========================================================
       RENDERIZAÇÃO COMPLETA
       ========================================================= */

    function renderizar(dados) {

        renderizarArtista(
            dados
        );


        renderizarServico(
            dados
        );


        renderizarDataHorario(
            dados
        );


        renderizarLocal(
            dados
        );


        renderizarEvento(
            dados
        );

    }


    /* =========================================================
       NAVEGAÇÃO — EDIÇÃO
       ========================================================= */

    function editarSecao(secao) {

        const paginas = {

            /*
             * A Etapa 1 concentra a seleção do artista
             * e do serviço.
             */

            artista:
                CONFIG.paginas.inicio,


            servico:
                CONFIG.paginas.inicio,


            data:
                CONFIG.paginas.dataHorario,


            local:
                CONFIG.paginas.local,


            evento:
                CONFIG.paginas.evento

        };


        const pagina =
            paginas[secao];


        if (!pagina) {

            console.warn(
                "MusicalWorld Contratação: " +
                "seção de edição não encontrada.",
                secao
            );


            return;

        }


        window.location.href =
            pagina;

    }


    /* =========================================================
       NAVEGAÇÃO — VOLTAR
       ========================================================= */

    function voltar() {

        /*
         * A Etapa 4 continua responsável pelos dados do evento.
         *
         * O estado central NÃO é apagado.
         */

        window.location.href =
            CONFIG.paginas.evento;

    }


    /* =========================================================
       NAVEGAÇÃO — PAGAMENTO
       ========================================================= */

    function avancar() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {
            return;
        }


        /*
         * Mantém a Etapa 5 registrada no estado antes
         * de avançar para o pagamento.
         */

        if (
            typeof gerenciador.definirEtapa === "function"
        ) {

            gerenciador.definirEtapa(
                CONFIG.etapaAtual
            );

        }


        window.location.href =
            CONFIG.paginas.pagamento;

    }


    /* =========================================================
       CANCELAMENTO
       ========================================================= */

       /* =====================================================
       CANCELAR
       ===================================================== */

    function cancelar() {

        const confirmou =
            window.confirm(
                "Deseja cancelar esta contratação?"
            );


        if (!confirmou) {

            return;

        }


        const gerenciador =
            obterGerenciadorEstado();


        /*
         * IMPORTANTE:
         *
         * O perfilId precisa ser capturado ANTES de
         * limpar o estado central.
         *
         * O método limpar() remove toda a contratação,
         * inclusive o perfilId.
         */

        let perfilId =
            null;


        if (
            gerenciador &&
            typeof gerenciador.obter === "function"
        ) {

            const dados =
                gerenciador.obter();


            if (
                dados &&
                dados.perfilId
            ) {

                perfilId =
                    dados.perfilId;

            }

        }


        /*
         * Caso o estado central não possua o ID por algum
         * motivo, ainda temos o ID carregado no estado local
         * desta Etapa 1.
         */

        if (
            !perfilId &&
            estado.perfilId
        ) {

            perfilId =
                estado.perfilId;

        }


        /*
         * Agora sim apagamos todos os dados temporários
         * da contratação.
         */

        if (gerenciador) {

            gerenciador.limpar();

        }


        /*
         * Retorna diretamente para o perfil que iniciou
         * a contratação.
         *
         * ApresentarPerfil.js utiliza:
         *
         *     parametros.get("id")
         *
         * Portanto o parâmetro precisa ser exatamente:
         *
         *     ?id=...
         */

        if (perfilId) {

            window.location.href =
                "apresentar-perfil.html?id=" +
                encodeURIComponent(
                    perfilId
                );

            return;

        }


        /*
         * Fallback de segurança.
         *
         * Se, por algum motivo, não conseguirmos recuperar
         * o ID do perfil, ainda retornamos para a página
         * pública sem inventar nenhum identificador.
         */

        window.location.href =
            "apresentar-perfil.html";

    }


    /* =========================================================
       EVENTOS
       ========================================================= */

    function configurarEventos() {

        const btnVoltar =
            obterElemento(
                CONFIG.seletores.btnVoltar
            );


        const btnAvancar =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        const btnCancelar =
            obterElemento(
                CONFIG.seletores.btnCancelar
            );


        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                voltar
            );

        }


        if (btnAvancar) {

            btnAvancar.addEventListener(
                "click",
                avancar
            );

        }


        if (btnCancelar) {

            btnCancelar.addEventListener(
                "click",
                cancelar
            );

        }


        document
            .querySelectorAll(
                CONFIG.seletores.editar
            )
            .forEach(function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        const secao =
                            botao.dataset.editar;


                        editarSecao(
                            secao
                        );

                    }
                );

            });

    }


    /* =========================================================
       VALIDAÇÃO BÁSICA
       ========================================================= */

    function validarEstado(dados) {

        if (!dados) {

            console.error(
                "MusicalWorld Contratação: estado inexistente."
            );


            return false;

        }


        if (!dados.perfilId) {

            console.warn(
                "MusicalWorld Contratação: " +
                "perfil do artista não encontrado."
            );


            return false;

        }


        if (
            !dados.servico ||
            !dados.servico.id
        ) {

            console.warn(
                "MusicalWorld Contratação: " +
                "serviço não encontrado."
            );


            return false;

        }


        return true;

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function inicializar() {

        try {

            const dados =
                carregarEstadoCentral();


            if (
                !validarEstado(dados)
            ) {

                console.warn(
                    "MusicalWorld Contratação: " +
                    "estado incompleto para a Etapa 5."
                );

            }


            renderizar(
                dados
            );


            configurarEventos();


            console.log(
                "MusicalWorldContratacaoRevisao: " +
                "Etapa 5 inicializada.",
                dados
            );

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoRevisao: " +
                "erro ao inicializar Etapa 5:",
                erro
            );

        }

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.MusicalWorldContratacaoRevisao = {

        inicializar,

        voltar,

        avancar,

        editarSecao,

        obterEstado: function () {

            const gerenciador =
                obterGerenciadorEstado();


            if (!gerenciador) {
                return null;
            }


            return gerenciador.obter();

        }

    };


    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();

    }


})(window);