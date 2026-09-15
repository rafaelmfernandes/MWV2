/* =========================================================
   MUSICALWORLD — SOLICITAÇÃO ENVIADA
   Arquivo: contratacao-sucesso.js

   Responsabilidade:
   - Recuperar os dados da contratação.
   - Exibir o resumo da solicitação.
   - Exibir o método de pagamento utilizado.
   - Diferenciar pagamento real de pagamento simulado.
   - Preparar as ações da tela de sucesso.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        armazenamento: {
            chave: "musicalworld_contratacao"
        },

        paginas: {
            inicio: "index.html",
            acompanhamento: "contratacao-acompanhamento.html"
        },

        seletores: {

            artistaAvatar: "artistaAvatar",
            artistaNome: "artistaNome",
            artistaTipo: "artistaTipo",

            servicoNome: "servicoNome",

            dataEvento: "dataEvento",
            horarioEvento: "horarioEvento",

            localEvento: "localEvento",

            valorTotal: "valorTotal",

            metodoPagamento: "metodoPagamento",

            tituloPagamento: "tituloPagamento",
            mensagemPagamento: "mensagemPagamento",

            btnVerContratacao: "btnVerContratacao",
            btnVoltarInicio: "btnVoltarInicio",
            btnVoltarInicioTopo: "btnVoltarInicioTopo"
        }
    };


    /* =====================================================
       ESTADO
       ===================================================== */

    const estado = {

        dados: null,

        inicializado: false

    };


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    function obterElemento(nome) {

        const id = CONFIG.seletores[nome];

        if (!id) {
            return null;
        }

        return document.getElementById(id);
    }


    /* =====================================================
       FORMATAÇÃO DE MOEDA
       ===================================================== */

    function formatarMoeda(valor) {

        const numero = Number(valor);

        if (!Number.isFinite(numero)) {
            return "R$ 0,00";
        }

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    /* =====================================================
       FORMATAÇÃO DE DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {
            return "Data a definir";
        }

        const partes = String(data).split("-");

        if (partes.length !== 3) {
            return String(data);
        }

        const ano = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);

        if (
            !ano ||
            !mes ||
            !dia
        ) {
            return String(data);
        }

        const dataFormatada = new Date(
            ano,
            mes - 1,
            dia
        );

        return dataFormatada.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       FORMATAÇÃO DE HORÁRIO
       ===================================================== */

    function formatarHorario(
        horarioInicio,
        horarioFim,
        horarioChegada
    ) {

        if (
            !horarioInicio &&
            !horarioFim
        ) {

            if (horarioChegada) {

                return (
                    "Chegada: " +
                    horarioChegada
                );
            }

            return "Horário ainda não informado";
        }


        let resultado = "";


        if (horarioInicio) {
            resultado = horarioInicio;
        }


        if (horarioFim) {

            resultado +=
                " às " +
                horarioFim;
        }


        if (horarioChegada) {

            resultado +=
                " · Chegada " +
                horarioChegada;
        }


        return resultado;
    }


    /* =====================================================
       FORMATAÇÃO DO MÉTODO DE PAGAMENTO
       ===================================================== */

    function formatarMetodoPagamento(metodo) {

        if (!metodo) {
            return "Não informado";
        }


        const valor = String(metodo)
            .toLowerCase();


        if (valor === "pix") {
            return "Pix";
        }


        if (
            valor === "cartao" ||
            valor === "cartão" ||
            valor === "credito" ||
            valor === "crédito"
        ) {

            return "Cartão";
        }


        return metodo;
    }


    /* =====================================================
       RECUPERAR DADOS DA CONTRATAÇÃO
       ===================================================== */

    function carregarDados() {

        let dadosSalvos = null;


        try {

            const bruto =
                sessionStorage.getItem(
                    CONFIG.armazenamento.chave
                );


            if (bruto) {

                dadosSalvos =
                    JSON.parse(bruto);
            }

        } catch (erro) {

            console.error(
                "MusicalWorldContratacaoSucesso: erro ao ler sessionStorage.",
                erro
            );
        }


        /*
         * Dados demonstrativos utilizados somente
         * quando alguma informação ainda não existe.
         */
        const dadosDemonstracao = {

            artista: {
                nome: "Rafael Melo",
                tipo: "Cantor(a)",
                localizacao: "Goiânia, GO",
                iniciais: "RM",
                fotoUrl: null
            },

            servico: {
                nome: "Show acústico",
                valor: 800,
                descricao:
                    "Apresentação acústica com voz e violão.",
                duracao: "2 horas",
                localizacao:
                    "Goiânia e região"
            },

            data: null,
            horarioInicio: null,
            horarioFim: null,
            horarioChegada: null,

            local: null,

            tipoEvento: null,
            quantidadePessoas: null,
            nomeEvento: null,
            estrutura: [],
            observacoes: null,

            pagamento: {

                status:
                    "aprovado_simulacao",

                metodo:
                    "pix",

                confirmado:
                    true
            }
        };


        const dados = {

            ...dadosDemonstracao,

            ...(dadosSalvos || {}),

            artista: {
                ...dadosDemonstracao.artista,
                ...(
                    dadosSalvos &&
                    dadosSalvos.artista
                        ? dadosSalvos.artista
                        : {}
                )
            },

            servico: {
                ...dadosDemonstracao.servico,
                ...(
                    dadosSalvos &&
                    dadosSalvos.servico
                        ? dadosSalvos.servico
                        : {}
                )
            },

            pagamento: {
                ...dadosDemonstracao.pagamento,
                ...(
                    dadosSalvos &&
                    dadosSalvos.pagamento
                        ? dadosSalvos.pagamento
                        : {}
                )
            }
        };


        estado.dados = dados;


        return dados;
    }


    /* =====================================================
       RENDERIZAR AVATAR
       ===================================================== */

    function renderizarAvatar(artista) {

        const elemento =
            obterElemento("artistaAvatar");


        if (!elemento) {
            return;
        }


        elemento.innerHTML = "";


        if (artista.fotoUrl) {

            const imagem =
                document.createElement("img");


            imagem.src =
                artista.fotoUrl;


            imagem.alt =
                artista.nome || "Artista";


            imagem.onerror =
                function () {

                    elemento.innerHTML =
                        "";

                    elemento.textContent =
                        artista.iniciais ||
                        obterIniciais(
                            artista.nome
                        );
                };


            elemento.appendChild(
                imagem
            );

            return;
        }


        elemento.textContent =
            artista.iniciais ||
            obterIniciais(
                artista.nome
            );
    }


    /* =====================================================
       GERAR INICIAIS
       ===================================================== */

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


    /* =====================================================
       RENDERIZAR RESUMO
       ===================================================== */

    function renderizarResumo(dados) {

        const artista =
            dados.artista || {};

        const servico =
            dados.servico || {};

        const pagamento =
            dados.pagamento || {};


        renderizarAvatar(
            artista
        );


        const artistaNome =
            obterElemento("artistaNome");


        if (artistaNome) {

            artistaNome.textContent =
                artista.nome ||
                "Artista";
        }


        const artistaTipo =
            obterElemento("artistaTipo");


        if (artistaTipo) {

            artistaTipo.textContent =
                artista.tipo ||
                "Artista";
        }


        const servicoNome =
            obterElemento("servicoNome");


        if (servicoNome) {

            servicoNome.textContent =
                servico.nome ||
                "Serviço";
        }


        const dataEvento =
            obterElemento("dataEvento");


        if (dataEvento) {

            dataEvento.textContent =
                formatarData(
                    dados.data
                );
        }


        const horarioEvento =
            obterElemento("horarioEvento");


        if (horarioEvento) {

            horarioEvento.textContent =
                formatarHorario(
                    dados.horarioInicio,
                    dados.horarioFim,
                    dados.horarioChegada
                );
        }


        const localEvento =
            obterElemento("localEvento");


        if (localEvento) {

            localEvento.textContent =
                obterTextoLocal(
                    dados.local
                );
        }


        const valorTotal =
            obterElemento("valorTotal");


        if (valorTotal) {

            valorTotal.textContent =
                formatarMoeda(
                    servico.valor
                );
        }


        const metodoPagamento =
            obterElemento(
                "metodoPagamento"
            );


        if (metodoPagamento) {

            metodoPagamento.textContent =
                formatarMetodoPagamento(
                    pagamento.metodo
                );
        }
    }


    /* =====================================================
       OBTER TEXTO DO LOCAL
       ===================================================== */

    function obterTextoLocal(local) {

        if (!local) {
            return "Local a definir";
        }


        if (typeof local === "string") {

            return local;
        }


        if (
            local.enderecoCompleto
        ) {

            return local.enderecoCompleto;
        }


        const partes = [

            local.rua,
            local.numero,
            local.bairro,
            local.cidade,
            local.estado

        ].filter(Boolean);


        if (partes.length) {

            return partes.join(", ");
        }


        if (local.tipoLocal) {

            return local.tipoLocal;
        }


        return "Local a definir";
    }


    /* =====================================================
       RENDERIZAR AVISO DE PAGAMENTO
       ===================================================== */

    function renderizarPagamento(dados) {

        const pagamento =
            dados.pagamento || {};


        const titulo =
            obterElemento(
                "tituloPagamento"
            );


        const mensagem =
            obterElemento(
                "mensagemPagamento"
            );


        const status =
            String(
                pagamento.status || ""
            ).toLowerCase();


        const ehSimulacao =
            status.includes(
                "simulacao"
            );


        if (ehSimulacao) {

            if (titulo) {

                titulo.textContent =
                    "Pagamento simulado";
            }


            if (mensagem) {

                mensagem.textContent =
                    "O pagamento foi simulado apenas para teste do fluxo. A solicitação foi registrada e enviada ao artista.";
            }

            return;
        }


        if (titulo) {

            titulo.textContent =
                "Pagamento processado";
        }


        if (mensagem) {

            mensagem.textContent =
                "O pagamento foi registrado e a solicitação foi enviada ao artista.";
        }
    }


    /* =====================================================
       IR PARA O ACOMPANHAMENTO
       ===================================================== */

    function abrirAcompanhamento() {

        /*
         * A página de acompanhamento será criada na
         * próxima etapa do desenvolvimento.
         *
         * Enquanto ela ainda não existir, evitamos
         * direcionar o usuário para uma página inexistente.
         */

        const destino =
            CONFIG.paginas.acompanhamento;


        /*
         * Se futuramente a página for criada,
         * basta manter o caminho acima.
         */
        if (destino) {

            window.location.href =
                destino;
        }
    }


    /* =====================================================
       VOLTAR PARA O INÍCIO
       ===================================================== */

    function voltarParaInicio() {

        window.location.href =
            CONFIG.paginas.inicio;
    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        const btnVerContratacao =
            obterElemento(
                "btnVerContratacao"
            );


        if (btnVerContratacao) {

            btnVerContratacao.addEventListener(
                "click",
                abrirAcompanhamento
            );
        }


        const btnVoltarInicio =
            obterElemento(
                "btnVoltarInicio"
            );


        if (btnVoltarInicio) {

            btnVoltarInicio.addEventListener(
                "click",
                voltarParaInicio
            );
        }


        const btnVoltarInicioTopo =
            obterElemento(
                "btnVoltarInicioTopo"
            );


        if (btnVoltarInicioTopo) {

            btnVoltarInicioTopo.addEventListener(
                "click",
                voltarParaInicio
            );
        }
    }


    /* =====================================================
       ATUALIZAR ÍCONES
       ===================================================== */

    function atualizarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();
        }
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function inicializar() {

        if (estado.inicializado) {
            return;
        }


        const dados =
            carregarDados();


        renderizarResumo(
            dados
        );


        renderizarPagamento(
            dados
        );


        configurarEventos();


        atualizarIcones();


        estado.inicializado =
            true;


        console.log(
            "MusicalWorldContratacaoSucesso: módulo inicializado.",
            estado
        );
    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoSucesso = {

        inicializar,

        obterEstado: function () {

            return estado;
        }
    };


    /* =====================================================
       INICIALIZAR QUANDO O DOM ESTIVER PRONTO
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inicializar
        );

    } else {

        inicializar();
    }


})(window);