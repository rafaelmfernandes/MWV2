/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO
   Arquivo: contratacao-acompanhamento.js

   Responsabilidade:
   - Recuperar a contratação salva.
   - Exibir artista, serviço e evento.
   - Exibir o status atual.
   - Controlar a timeline da contratação.
   - Preparar a página para futura integração com Supabase.
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
            inicio: "index.html"
        },

        seletores: {

            btnVoltar: "btnVoltar",
            btnVoltarInicio: "btnVoltarInicio",

            artistaAvatar: "artistaAvatar",
            artistaNome: "artistaNome",
            artistaTipo: "artistaTipo",
            artistaLocalizacao: "artistaLocalizacao",

            servicoNome: "servicoNome",
            servicoValor: "servicoValor",
            servicoDuracao: "servicoDuracao",
            servicoLocalizacao: "servicoLocalizacao",

            dataEvento: "dataEvento",
            horarioEvento: "horarioEvento",
            localEvento: "localEvento",
            tipoEvento: "tipoEvento",
            quantidadePessoas: "quantidadePessoas",

            statusAtual: "statusAtual",
            statusDescricao: "statusDescricao",

            pagamentoStatus: "pagamentoStatus",
            pagamentoDescricao: "pagamentoDescricao",

            observacoesEvento: "observacoesEvento"
        }
    };


    /* =====================================================
       ESTADO
       ===================================================== */

    const estado = {

        dados: null,

        statusAtual:
            "aguardando_artista",

        inicializado: false
    };


    /* =====================================================
       DADOS DE DEMONSTRAÇÃO
       ===================================================== */

    const dadosDemonstracao = {

        artista: {

            nome: "Rafael Melo",

            tipo: "Cantor(a)",

            localizacao:
                "Goiânia, GO",

            iniciais:
                "RM",

            fotoUrl:
                null
        },


        servico: {

            nome:
                "Show acústico",

            valor:
                800,

            duracao:
                "2 horas",

            localizacao:
                "Goiânia e região"
        },


        data:
            null,

        horarioInicio:
            null,

        horarioFim:
            null,

        horarioChegada:
            null,

        local:
            null,

        tipoEvento:
            null,

        quantidadePessoas:
            null,

        observacoes:
            null,


        pagamento: {

            status:
                "aprovado_simulacao",

            metodo:
                "pix",

            confirmado:
                true
        }
    };


    /* =====================================================
       OBTER ELEMENTO
       ===================================================== */

    function obterElemento(nome) {

        const id =
            CONFIG.seletores[nome];


        if (!id) {
            return null;
        }


        return document.getElementById(id);
    }


    /* =====================================================
       FORMATAR MOEDA
       ===================================================== */

    function formatarMoeda(valor) {

        const numero =
            Number(valor);


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
       FORMATAR DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {

            return "A definir";
        }


        const partes =
            String(data).split("-");


        if (partes.length !== 3) {

            return String(data);
        }


        const ano =
            Number(partes[0]);

        const mes =
            Number(partes[1]);

        const dia =
            Number(partes[2]);


        if (
            !ano ||
            !mes ||
            !dia
        ) {

            return String(data);
        }


        const dataObjeto =
            new Date(
                ano,
                mes - 1,
                dia
            );


        return dataObjeto.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );
    }


    /* =====================================================
       FORMATAR HORÁRIO
       ===================================================== */

    function formatarHorario(dados) {

        const inicio =
            dados.horarioInicio;

        const fim =
            dados.horarioFim;

        const chegada =
            dados.horarioChegada;


        if (
            !inicio &&
            !fim &&
            !chegada
        ) {

            return "A definir";
        }


        let resultado = "";


        if (inicio) {

            resultado =
                inicio;
        }


        if (fim) {

            resultado +=
                " às " +
                fim;
        }


        if (chegada) {

            resultado +=
                " · Chegada " +
                chegada;
        }


        return resultado;
    }


    /* =====================================================
       FORMATAR LOCAL
       ===================================================== */

    function formatarLocal(local) {

        if (!local) {

            return "A definir";
        }


        if (
            typeof local ===
            "string"
        ) {

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


        return "A definir";
    }


    /* =====================================================
       OBTER INICIAIS
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

            partes[
                partes.length - 1
            ].charAt(0)

        ).toUpperCase();
    }


    /* =====================================================
       CARREGAR CONTRATAÇÃO
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
                "MusicalWorldContratacaoAcompanhamento: erro ao ler sessionStorage.",
                erro
            );
        }


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


        estado.dados =
            dados;


        return dados;
    }


    /* =====================================================
       DEFINIR STATUS ATUAL
       ===================================================== */

    function determinarStatus(dados) {

        /*
         * Por enquanto o fluxo ainda está em modo
         * demonstrativo.
         *
         * Futuramente esta informação virá do
         * registro da contratação no Supabase.
         */


        if (
            dados.status
        ) {

            return normalizarStatus(
                dados.status
            );
        }


        return "aguardando_artista";
    }


    /* =====================================================
       NORMALIZAR STATUS
       ===================================================== */

    function normalizarStatus(status) {

        if (!status) {

            return "aguardando_artista";
        }


        const valor =
            String(status)
                .toLowerCase()
                .trim();


        const mapa = {

            "rascunho":
                "rascunho",

            "solicitacao_enviada":
                "aguardando_artista",

            "solicitação_enviada":
                "aguardando_artista",

            "aguardando_confirmacao":
                "aguardando_artista",

            "aguardando_confirmação":
                "aguardando_artista",

            "aguardando_artista":
                "aguardando_artista",

            "confirmada":
                "confirmada",

            "em_andamento":
                "evento",

            "concluida":
                "concluida",

            "concluída":
                "concluida",

            "pagamento_liberado":
                "pagamento"
        };


        return (
            mapa[valor] ||
            "aguardando_artista"
        );
    }


    /* =====================================================
       RENDERIZAR ARTISTA
       ===================================================== */

    function renderizarArtista(artista) {

        const avatar =
            obterElemento(
                "artistaAvatar"
            );


        if (avatar) {

            avatar.innerHTML =
                "";


            if (artista.fotoUrl) {

                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    artista.fotoUrl;


                imagem.alt =
                    artista.nome ||
                    "Artista";


                imagem.onerror =
                    function () {

                        avatar.innerHTML =
                            "";

                        avatar.textContent =
                            artista.iniciais ||
                            obterIniciais(
                                artista.nome
                            );
                    };


                avatar.appendChild(
                    imagem
                );

            } else {

                avatar.textContent =
                    artista.iniciais ||
                    obterIniciais(
                        artista.nome
                    );
            }
        }


        const nome =
            obterElemento(
                "artistaNome"
            );


        if (nome) {

            nome.textContent =
                artista.nome ||
                "Artista";
        }


        const tipo =
            obterElemento(
                "artistaTipo"
            );


        if (tipo) {

            tipo.textContent =
                artista.tipo ||
                "Artista";
        }


        const localizacao =
            obterElemento(
                "artistaLocalizacao"
            );


        if (localizacao) {

            localizacao.textContent =
                artista.localizacao ||
                "Localização não informada";
        }
    }


    /* =====================================================
       RENDERIZAR SERVIÇO
       ===================================================== */

    function renderizarServico(servico) {

        const nome =
            obterElemento(
                "servicoNome"
            );


        if (nome) {

            nome.textContent =
                servico.nome ||
                "Serviço";
        }


        const valor =
            obterElemento(
                "servicoValor"
            );


        if (valor) {

            valor.textContent =
                formatarMoeda(
                    servico.valor
                );
        }


        const duracao =
            obterElemento(
                "servicoDuracao"
            );


        if (duracao) {

            duracao.textContent =
                servico.duracao ||
                "Não informado";
        }


        const localizacao =
            obterElemento(
                "servicoLocalizacao"
            );


        if (localizacao) {

            localizacao.textContent =
                servico.localizacao ||
                "Não informado";
        }
    }


    /* =====================================================
       RENDERIZAR EVENTO
       ===================================================== */

    function renderizarEvento(dados) {

        const data =
            obterElemento(
                "dataEvento"
            );


        if (data) {

            data.textContent =
                formatarData(
                    dados.data
                );
        }


        const horario =
            obterElemento(
                "horarioEvento"
            );


        if (horario) {

            horario.textContent =
                formatarHorario(
                    dados
                );
        }


        const local =
            obterElemento(
                "localEvento"
            );


        if (local) {

            local.textContent =
                formatarLocal(
                    dados.local
                );
        }


        const tipo =
            obterElemento(
                "tipoEvento"
            );


        if (tipo) {

            tipo.textContent =
                dados.tipoEvento ||
                "Não informado";
        }


        const quantidade =
            obterElemento(
                "quantidadePessoas"
            );


        if (quantidade) {

            if (
                dados.quantidadePessoas
            ) {

                quantidade.textContent =
                    Number(
                        dados.quantidadePessoas
                    ).toLocaleString(
                        "pt-BR"
                    ) +
                    " pessoas";

            } else {

                quantidade.textContent =
                    "Não informado";
            }
        }


        const observacoes =
            obterElemento(
                "observacoesEvento"
            );


        if (observacoes) {

            observacoes.textContent =
                dados.observacoes ||
                "Nenhuma observação adicionada.";
        }
    }


    /* =====================================================
       RENDERIZAR STATUS PRINCIPAL
       ===================================================== */

    function renderizarStatusPrincipal(
        status
    ) {

        const elementoStatus =
            obterElemento(
                "statusAtual"
            );


        const elementoDescricao =
            obterElemento(
                "statusDescricao"
            );


        const configuracoes = {

            rascunho: {

                titulo:
                    "Rascunho",

                descricao:
                    "A contratação ainda não foi enviada."
            },


            aguardando_artista: {

                titulo:
                    "Aguardando confirmação do artista",

                descricao:
                    "O artista precisa analisar sua solicitação antes de confirmar a contratação."
            },


            confirmada: {

                titulo:
                    "Contratação confirmada",

                descricao:
                    "O artista aceitou sua solicitação e a contratação está confirmada."
            },


            evento: {

                titulo:
                    "Evento em andamento",

                descricao:
                    "A contratação está em andamento conforme o combinado."
            },


            concluida: {

                titulo:
                    "Contratação concluída",

                descricao:
                    "O evento foi realizado e a contratação foi concluída."
            },


            pagamento: {

                titulo:
                    "Pagamento liberado",

                descricao:
                    "O fluxo foi concluído e o pagamento foi liberado ao artista."
            }
        };


        const configuracao =
            configuracoes[status] ||
            configuracoes.aguardando_artista;


        if (elementoStatus) {

            elementoStatus.textContent =
                configuracao.titulo;
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                configuracao.descricao;
        }
    }


    /* =====================================================
       ATUALIZAR TIMELINE
       ===================================================== */

    function atualizarTimeline(status) {

        const itens =
            document.querySelectorAll(
                ".timeline-item"
            );


        if (!itens.length) {
            return;
        }


        const ordem = [

            "solicitacao",

            "artista",

            "confirmada",

            "evento",

            "concluida",

            "pagamento"

        ];


        let indiceAtual = 1;


        switch (status) {

            case "rascunho":

                indiceAtual = 0;

                break;


            case "aguardando_artista":

                indiceAtual = 1;

                break;


            case "confirmada":

                indiceAtual = 2;

                break;


            case "evento":

                indiceAtual = 3;

                break;


            case "concluida":

                indiceAtual = 4;

                break;


            case "pagamento":

                indiceAtual = 5;

                break;
        }


        itens.forEach(
            function (item, indice) {

                item.classList.remove(
                    "concluido"
                );

                item.classList.remove(
                    "ativo"
                );


                const marker =
                    item.querySelector(
                        ".timeline-marker"
                    );


                if (!marker) {
                    return;
                }


                if (indice < indiceAtual) {

                    item.classList.add(
                        "concluido"
                    );


                    marker.innerHTML =
                        '<i data-lucide="check"></i>';


                } else if (
                    indice === indiceAtual
                ) {

                    item.classList.add(
                        "ativo"
                    );


                    marker.innerHTML =
                        '<i data-lucide="clock-3"></i>';


                } else {

                    marker.innerHTML =
                        '<i data-lucide="circle"></i>';
                }
            }
        );


        atualizarIcones();
    }


    /* =====================================================
       RENDERIZAR PAGAMENTO
       ===================================================== */

    function renderizarPagamento(
        pagamento
    ) {

        const status =
            String(
                pagamento.status || ""
            ).toLowerCase();


        const elementoStatus =
            obterElemento(
                "pagamentoStatus"
            );


        const elementoDescricao =
            obterElemento(
                "pagamentoDescricao"
            );


        if (
            status.includes(
                "simulacao"
            )
        ) {

            if (elementoStatus) {

                elementoStatus.textContent =
                    "Pagamento simulado";
            }


            if (elementoDescricao) {

                elementoDescricao.textContent =
                    "O pagamento está em modo de simulação enquanto a integração real com o Mercado Pago ainda não foi conectada.";
            }


            return;
        }


        if (elementoStatus) {

            elementoStatus.textContent =
                "Pagamento processado";
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                "O pagamento está associado à contratação.";
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
       CONFIGURAR EVENTOS
       ===================================================== */

    function configurarEventos() {

        const btnVoltar =
            obterElemento(
                "btnVoltar"
            );


        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                function () {

                    window.history.back();
                }
            );
        }


        const btnVoltarInicio =
            obterElemento(
                "btnVoltarInicio"
            );


        if (btnVoltarInicio) {

            btnVoltarInicio.addEventListener(
                "click",
                function () {

                    window.location.href =
                        CONFIG.paginas.inicio;
                }
            );
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


        const status =
            determinarStatus(
                dados
            );


        estado.statusAtual =
            status;


        renderizarArtista(
            dados.artista
        );


        renderizarServico(
            dados.servico
        );


        renderizarEvento(
            dados
        );


        renderizarStatusPrincipal(
            status
        );


        atualizarTimeline(
            status
        );


        renderizarPagamento(
            dados.pagamento
        );


        configurarEventos();


        atualizarIcones();


        estado.inicializado =
            true;


        console.log(
            "MusicalWorldContratacaoAcompanhamento: módulo inicializado.",
            estado
        );
    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoAcompanhamento = {

        inicializar,

        obterEstado: function () {

            return estado;
        },

        atualizarStatus: function (
            novoStatus
        ) {

            const status =
                normalizarStatus(
                    novoStatus
                );


            estado.statusAtual =
                status;


            renderizarStatusPrincipal(
                status
            );


            atualizarTimeline(
                status
            );
        }
    };


    /* =====================================================
       INICIALIZAÇÃO DOM
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