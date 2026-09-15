/*
=========================================================
MUSICALWORLD — CONTRATAÇÃO

Arquivo:
contratacao-detalhes-evento.js

Responsabilidade:

- Controlar a Etapa 4 da contratação.
- Gerenciar o tipo de evento.
- Gerenciar quantidade de pessoas.
- Gerenciar nome do evento.
- Gerenciar estrutura disponível.
- Gerenciar observações.
- Validar os dados antes de avançar.
- Navegar entre as etapas.
- Não realizar gravação definitiva no Supabase neste momento.

A persistência definitiva será integrada posteriormente
ao fluxo principal de contratação.
=========================================================
*/

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        paginas: {

            anterior:
                "contratacao-local.html",

            proxima:
                "contratacao-revisao.html",

            cancelar:
                "contratacao.html"

        },

        seletores: {

            btnVoltar:
                "btnVoltar",

            btnAvancar:
                "btnAvancar",

            btnCancelar:
                "btnCancelarContratacao",

            opcoesEvento:
                ".opcao-evento",

            quantidadePessoas:
                "quantidadePessoas",

            nomeEvento:
                "nomeEvento",

            observacoes:
                "observacoes",

            contadorObservacoes:
                "contadorObservacoes",

            estruturas:
                'input[name="estrutura"]'

        }

    };


    /* =====================================================
       ESTADO DA ETAPA
       ===================================================== */

    const estado = {

        tipoEvento: null,

        quantidadePessoas: null,

        nomeEvento: "",

        estrutura: [],

        observacoes: ""

    };


    /* =====================================================
       UTILITÁRIO — BUSCAR ELEMENTO
       ===================================================== */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       UTILITÁRIO — OBTER VALOR
       ===================================================== */

    function obterValor(id) {

        const elemento =
            obterElemento(id);

        if (!elemento) {

            return "";

        }

        return String(
            elemento.value || ""
        ).trim();

    }


    /* =====================================================
       SELEÇÃO DO TIPO DE EVENTO
       ===================================================== */

    function configurarOpcoesEvento() {

        const opcoes =
            document.querySelectorAll(
                CONFIG.seletores.opcoesEvento
            );

        if (!opcoes.length) {

            return;

        }


        opcoes.forEach(function (opcao) {

            opcao.addEventListener(
                "click",
                function () {

                    const valor =
                        opcao.dataset.valor || null;


                    estado.tipoEvento =
                        valor;


                    opcoes.forEach(
                        function (item) {

                            const selecionado =
                                item === opcao;


                            item.setAttribute(
                                "aria-pressed",
                                selecionado
                                    ? "true"
                                    : "false"
                            );

                        }
                    );

                }
            );

        });

    }


    /* =====================================================
       CONTADOR DE OBSERVAÇÕES
       ===================================================== */

    function atualizarContadorObservacoes() {

        const campo =
            obterElemento(
                CONFIG.seletores.observacoes
            );

        const contador =
            obterElemento(
                CONFIG.seletores.contadorObservacoes
            );


        if (!campo || !contador) {

            return;

        }


        contador.textContent =
            String(
                campo.value.length
            );

    }


    /* =====================================================
       CONFIGURAR OBSERVAÇÕES
       ===================================================== */

    function configurarObservacoes() {

        const campo =
            obterElemento(
                CONFIG.seletores.observacoes
            );

        if (!campo) {

            return;

        }


        campo.addEventListener(
            "input",
            atualizarContadorObservacoes
        );


        atualizarContadorObservacoes();

    }


    /* =====================================================
       ESTRUTURA
       ===================================================== */

    function configurarEstrutura() {

        const campos =
            document.querySelectorAll(
                CONFIG.seletores.estruturas
            );

        if (!campos.length) {

            return;

        }


        campos.forEach(function (campo) {

            campo.addEventListener(
                "change",
                function () {

                    /*
                    -------------------------------------------------
                    Se "Nenhuma / não sei informar" for selecionado,
                    as outras opções são desmarcadas.
                    -------------------------------------------------
                    */

                    if (
                        campo.value === "nenhuma" &&
                        campo.checked
                    ) {

                        campos.forEach(
                            function (item) {

                                if (
                                    item !== campo
                                ) {

                                    item.checked =
                                        false;

                                }

                            }
                        );

                        return;

                    }


                    /*
                    -------------------------------------------------
                    Se qualquer outra opção for selecionada,
                    "Nenhuma / não sei informar" é desmarcada.
                    -------------------------------------------------
                    */

                    if (
                        campo.value !== "nenhuma" &&
                        campo.checked
                    ) {

                        campos.forEach(
                            function (item) {

                                if (
                                    item.value ===
                                    "nenhuma"
                                ) {

                                    item.checked =
                                        false;

                                }

                            }
                        );

                    }

                }
            );

        });

    }


    /* =====================================================
       COLETAR ESTRUTURA
       ===================================================== */

    function obterEstruturaSelecionada() {

        const campos =
            document.querySelectorAll(
                CONFIG.seletores.estruturas
            );


        const selecionados = [];


        campos.forEach(function (campo) {

            if (campo.checked) {

                selecionados.push(
                    campo.value
                );

            }

        });


        return selecionados;

    }


    /* =====================================================
       COLETAR DADOS
       ===================================================== */

    function coletarDados() {

        const quantidade =
            obterValor(
                CONFIG.seletores.quantidadePessoas
            );


        estado.quantidadePessoas =
            quantidade
                ? Number(quantidade)
                : null;


        estado.nomeEvento =
            obterValor(
                CONFIG.seletores.nomeEvento
            );


        estado.observacoes =
            obterValor(
                CONFIG.seletores.observacoes
            );


        estado.estrutura =
            obterEstruturaSelecionada();


        return estado;

    }


    /* =====================================================
       VALIDAÇÃO
       ===================================================== */

    function validarDados() {

        coletarDados();


        /*
        -----------------------------------------------------
        O tipo do evento é a única informação obrigatória
        nesta etapa.
        -----------------------------------------------------
        */

        if (!estado.tipoEvento) {

            alert(
                "Selecione o tipo de evento."
            );

            return false;

        }


        /*
        -----------------------------------------------------
        Quantidade de pessoas é recomendada, mas não precisa
        impedir a contratação caso o usuário não saiba.
        -----------------------------------------------------
        */

        if (
            estado.quantidadePessoas !== null &&
            (
                estado.quantidadePessoas < 1 ||
                estado.quantidadePessoas > 100000
            )
        ) {

            alert(
                "Informe uma quantidade válida de pessoas."
            );

            return false;

        }


        return true;

    }


    /* =====================================================
       VOLTAR
       ===================================================== */

    function voltar() {

        window.location.href =
            CONFIG.paginas.anterior;

    }


    /* =====================================================
       AVANÇAR
       ===================================================== */

    function avancar() {

        if (!validarDados()) {

            return;

        }


        console.log(
            "MusicalWorld — Dados da Etapa 4:",
            estado
        );


        window.location.href =
            CONFIG.paginas.proxima;

    }


    /* =====================================================
       CANCELAR
       ===================================================== */

    function cancelar() {

        const confirmar =
            window.confirm(
                "Deseja cancelar esta contratação?"
            );


        if (!confirmar) {

            return;

        }


        window.location.href =
            CONFIG.paginas.cancelar;

    }


    /* =====================================================
       CONFIGURAR EVENTOS
       ===================================================== */

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

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function inicializar() {

        configurarOpcoesEvento();

        configurarObservacoes();

        configurarEstrutura();

        configurarEventos();


        console.log(
            "MusicalWorld — Etapa 4 da contratação inicializada."
        );

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoDetalhesEvento = {

        inicializar:
            inicializar,

        voltar:
            voltar,

        avancar:
            avancar,

        cancelar:
            cancelar,

        obterEstado:
            function () {

                coletarDados();

                return estado;

            }

    };


    /* =====================================================
       EXECUÇÃO
       ===================================================== */

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