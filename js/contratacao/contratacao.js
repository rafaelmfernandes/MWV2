/*
=========================================================
MUSICALWORLD — CONTRATAÇÃO

Arquivo:
contratacao.js

Responsabilidade:
- Controlar o fluxo de contratação.
- Controlar a etapa atual.
- Carregar os dados do artista e do serviço.
- Atualizar a interface de cada etapa.
- Preparar a comunicação futura com o Supabase.
- Preparar os dados que serão enviados para o pagamento.

Importante:
Este arquivo começa com dados de demonstração.
Posteriormente esses dados serão substituídos pelos
dados reais recebidos do MusicalWorld/Supabase.
=========================================================
*/

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÃO
       ========================================================= */

    const CONFIG = {

        totalEtapas: 6,

        etapaInicial: 1,

        seletores: {

            etapaLabel: "etapaLabel",

            etapaNumero: "etapaNumero",

            etapaProgresso: "etapaProgresso",

            tituloEtapa: "tituloEtapa",

            descricaoEtapa: "descricaoEtapa",

            artistaAvatar: "artistaAvatar",

            artistaNome: "artistaNome",

            artistaTipo: "artistaTipo",

            servicoNome: "servicoNome",

            servicoValor: "servicoValor",

            servicoDescricao: "servicoDescricao",

            servicoDuracao: "servicoDuracao",

            servicoLocalizacao: "servicoLocalizacao",

            btnAvancar: "btnAvancar",

            btnCancelar: "btnCancelarContratacao"

        }

    };


    /* =========================================================
       ESTADO DA CONTRATAÇÃO
       ========================================================= */

    const estado = {

        etapaAtual: CONFIG.etapaInicial,

        artista: null,

        servico: null,

        dados: {

            data: null,

            horarioInicio: null,

            horarioFim: null,

            local: null,

            tipoEvento: null,

            quantidadePessoas: null,

            observacoes: null,

            contratante: null,

            pagamento: null

        }

    };


    /* =========================================================
       DADOS DE DEMONSTRAÇÃO

       Estes dados serão substituídos posteriormente pelos
       dados reais recebidos através do Supabase.
       ========================================================= */

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
                "Apresentação acústica com voz e violão para eventos, festas e confraternizações.",

            duracao: "2 horas",

            localizacao: "Goiânia e região"

        }

    };


    /* =========================================================
       FUNÇÕES AUXILIARES
       ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    function formatarMoeda(valor) {

        if (
            typeof valor !== "number" ||
            Number.isNaN(valor)
        ) {

            return "—";

        }


        return valor.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =========================================================
       CARREGAR DADOS INICIAIS
       ========================================================= */

    function carregarDadosDemonstracao() {

        estado.artista = dadosDemonstracao.artista;

        estado.servico = dadosDemonstracao.servico;

    }


    /* =========================================================
       RENDERIZAR ARTISTA
       ========================================================= */

    function renderizarArtista() {

        if (!estado.artista) {
            return;
        }


        const nome = obterElemento(
            CONFIG.seletores.artistaNome
        );

        const tipo = obterElemento(
            CONFIG.seletores.artistaTipo
        );

        const avatar = obterElemento(
            CONFIG.seletores.artistaAvatar
        );


        if (nome) {

            nome.textContent =
                estado.artista.nome;

        }


        if (tipo) {

            tipo.textContent =
                estado.artista.tipo +
                " · " +
                estado.artista.localizacao;

        }


        if (avatar) {

            if (estado.artista.fotoUrl) {

                avatar.innerHTML = `
                    <img
                        src="${estado.artista.fotoUrl}"
                        alt="${estado.artista.nome}"
                    >
                `;

            } else {

                avatar.textContent =
                    estado.artista.iniciais || "MW";

            }

        }

    }


    /* =========================================================
       RENDERIZAR SERVIÇO
       ========================================================= */

    function renderizarServico() {

        if (!estado.servico) {
            return;
        }


        const nome = obterElemento(
            CONFIG.seletores.servicoNome
        );

        const valor = obterElemento(
            CONFIG.seletores.servicoValor
        );

        const descricao = obterElemento(
            CONFIG.seletores.servicoDescricao
        );

        const duracao = obterElemento(
            CONFIG.seletores.servicoDuracao
        );

        const localizacao = obterElemento(
            CONFIG.seletores.servicoLocalizacao
        );


        if (nome) {

            nome.textContent =
                estado.servico.nome;

        }


        if (valor) {

            valor.textContent =
                formatarMoeda(
                    estado.servico.valor
                );

        }


        if (descricao) {

            descricao.textContent =
                estado.servico.descricao;

        }


        if (duracao) {

            duracao.textContent =
                estado.servico.duracao;

        }


        if (localizacao) {

            localizacao.textContent =
                estado.servico.localizacao;

        }

    }


    /* =========================================================
       ATUALIZAR INDICADOR DE ETAPA
       ========================================================= */

    function atualizarIndicadorEtapa() {

        const numero = obterElemento(
            CONFIG.seletores.etapaNumero
        );

        const progresso = obterElemento(
            CONFIG.seletores.etapaProgresso
        );


        if (numero) {

            numero.textContent =
                `Etapa ${estado.etapaAtual} de ${CONFIG.totalEtapas}`;

        }


        if (progresso) {

            const percentual =
                (
                    estado.etapaAtual /
                    CONFIG.totalEtapas
                ) * 100;


            progresso.style.width =
                `${percentual}%`;

        }

    }


    /* =========================================================
       ATUALIZAR ETAPA
       ========================================================= */

    function atualizarEtapa() {

        atualizarIndicadorEtapa();

    }


    /* =========================================================
       AVANÇAR
       ========================================================= */

    function avancar() {

        if (
            estado.etapaAtual >=
            CONFIG.totalEtapas
        ) {

            return;

        }


        estado.etapaAtual += 1;


        atualizarEtapa();


        console.log(
            "MusicalWorld — avançando para etapa:",
            estado.etapaAtual
        );

    }


    /* =========================================================
       CANCELAR
       ========================================================= */

    function cancelar() {

        const confirmou =
            window.confirm(
                "Deseja cancelar esta contratação?"
            );


        if (!confirmou) {
            return;
        }


        window.history.back();

    }


    /* =========================================================
       CONFIGURAR EVENTOS
       ========================================================= */

    function configurarEventos() {

        const btnAvancar =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );

        const btnCancelar =
            obterElemento(
                CONFIG.seletores.btnCancelar
            );


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

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function inicializar() {

        carregarDadosDemonstracao();

        renderizarArtista();

        renderizarServico();

        atualizarEtapa();

        configurarEventos();


        console.log(
            "MusicalWorld — fluxo de contratação inicializado."
        );

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.MusicalWorldContratacao = {

        inicializar,

        avancar,

        cancelar,

        obterEstado: function () {

            return estado;

        }

    };


    /* =========================================================
       INICIALIZAÇÃO AUTOMÁTICA
       ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        inicializar
    );


})(window);