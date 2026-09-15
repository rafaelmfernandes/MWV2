/*
=========================================================
MUSICALWORLD — CONTRATAÇÃO

Arquivo:
contratacao-local.js

Responsabilidade:

- Controlar a Etapa 3 da contratação.
- Gerenciar a seleção do tipo de local.
- Gerenciar os campos de endereço.
- Permitir informar que o local ainda não foi definido.
- Validar os dados antes de avançar.
- Navegar para a etapa anterior e seguinte.
- Não realizar gravação definitiva no Supabase neste momento.

A persistência definitiva dos dados será integrada
posteriormente ao fluxo principal de contratação.
=========================================================
*/

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        paginas: {
            anterior: "contratacao-data-horario.html",
            proxima: "contratacao-detalhes-evento.html",
            cancelar: "contratacao.html"
        },

        seletores: {
            btnVoltar: "btnVoltar",
            btnAvancar: "btnAvancar",
            btnCancelar: "btnCancelarContratacao",

            opcoesLocal: ".opcao-local",

            cep: "cep",
            rua: "rua",
            numero: "numero",
            complemento: "complemento",
            bairro: "bairro",
            cidade: "cidade",
            estado: "estado",

            localAindaNaoDefinido: "localAindaNaoDefinido"
        }

    };


    /* =====================================================
       ESTADO DA ETAPA
       ===================================================== */

    const estado = {

        tipoLocal: null,

        endereco: {

            cep: "",
            rua: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: ""

        },

        localAindaNaoDefinido: false

    };


    /* =====================================================
       UTILITÁRIO — BUSCAR ELEMENTO
       ===================================================== */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       UTILITÁRIO — FORMATAR CEP
       ===================================================== */

    function formatarCep(valor) {

        const numeros = String(valor || "")
            .replace(/\D/g, "")
            .slice(0, 8);

        if (numeros.length <= 5) {

            return numeros;

        }

        return (
            numeros.substring(0, 5) +
            "-" +
            numeros.substring(5)
        );

    }


    /* =====================================================
       UTILITÁRIO — LER VALOR
       ===================================================== */

    function obterValor(id) {

        const elemento = obterElemento(id);

        if (!elemento) {

            return "";

        }

        return String(elemento.value || "").trim();

    }


    /* =====================================================
       SELEÇÃO DO TIPO DE LOCAL
       ===================================================== */

    function configurarOpcoesLocal() {

        const opcoes =
            document.querySelectorAll(
                CONFIG.seletores.opcoesLocal
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

                    estado.tipoLocal = valor;


                    opcoes.forEach(function (item) {

                        const selecionado =
                            item === opcao;

                        item.setAttribute(
                            "aria-pressed",
                            selecionado
                                ? "true"
                                : "false"
                        );

                    });

                }
            );

        });

    }


    /* =====================================================
       FORMATAÇÃO DO CEP
       ===================================================== */

    function configurarCep() {

        const campoCep =
            obterElemento(
                CONFIG.seletores.cep
            );

        if (!campoCep) {

            return;

        }


        campoCep.addEventListener(
            "input",
            function () {

                campoCep.value =
                    formatarCep(
                        campoCep.value
                    );

            }
        );

    }


    /* =====================================================
       HABILITAR / DESABILITAR ENDEREÇO
       ===================================================== */

    function atualizarEstadoEndereco() {

        const checkbox =
            obterElemento(
                CONFIG.seletores.localAindaNaoDefinido
            );

        const enderecoCard =
            document.querySelector(
                ".endereco-card"
            );

        if (!checkbox || !enderecoCard) {

            return;

        }


        estado.localAindaNaoDefinido =
            checkbox.checked;


        const campos =
            enderecoCard.querySelectorAll(
                ".campo-input"
            );


        campos.forEach(function (campo) {

            campo.disabled =
                checkbox.checked;

        });


        enderecoCard.classList.toggle(
            "local-indefinido",
            checkbox.checked
        );

    }


    /* =====================================================
       CONFIGURAR CHECKBOX
       ===================================================== */

    function configurarLocalNaoDefinido() {

        const checkbox =
            obterElemento(
                CONFIG.seletores.localAindaNaoDefinido
            );

        if (!checkbox) {

            return;

        }


        checkbox.addEventListener(
            "change",
            function () {

                atualizarEstadoEndereco();

            }
        );


        atualizarEstadoEndereco();

    }


    /* =====================================================
       COLETAR DADOS
       ===================================================== */

    function coletarDados() {

        estado.endereco = {

            cep: obterValor("cep"),

            rua: obterValor("rua"),

            numero: obterValor("numero"),

            complemento:
                obterValor("complemento"),

            bairro:
                obterValor("bairro"),

            cidade:
                obterValor("cidade"),

            estado:
                obterValor("estado")

        };


        estado.localAindaNaoDefinido =
            Boolean(
                obterElemento(
                    CONFIG.seletores.localAindaNaoDefinido
                )?.checked
            );


        return estado;

    }


    /* =====================================================
       VALIDAÇÃO
       ===================================================== */

    function validarDados() {

        coletarDados();


        /*
        -----------------------------------------------------
        Caso o usuário ainda não tenha definido o local,
        permitimos avançar.
        -----------------------------------------------------
        */

        if (estado.localAindaNaoDefinido) {

            return true;

        }


        /*
        -----------------------------------------------------
        O tipo do local é necessário quando o endereço
        já foi definido.
        -----------------------------------------------------
        */

        if (!estado.tipoLocal) {

            alert(
                "Selecione o tipo do local do evento."
            );

            return false;

        }


        /*
        -----------------------------------------------------
        Campos essenciais do endereço.
        -----------------------------------------------------
        */

        if (!estado.endereco.rua) {

            alert(
                "Informe a rua ou avenida do evento."
            );

            return false;

        }


        if (!estado.endereco.numero) {

            alert(
                "Informe o número do local."
            );

            return false;

        }


        if (!estado.endereco.bairro) {

            alert(
                "Informe o bairro do evento."
            );

            return false;

        }


        if (!estado.endereco.cidade) {

            alert(
                "Informe a cidade do evento."
            );

            return false;

        }


        if (!estado.endereco.estado) {

            alert(
                "Selecione o estado do evento."
            );

            return false;

        }


        return true;

    }


    /* =====================================================
       NAVEGAR PARA A ETAPA ANTERIOR
       ===================================================== */

    function voltar() {

        window.location.href =
            CONFIG.paginas.anterior;

    }


    /* =====================================================
       AVANÇAR PARA A PRÓXIMA ETAPA
       ===================================================== */

    function avancar() {

        if (!validarDados()) {

            return;

        }


        /*
        -----------------------------------------------------
        Neste momento os dados ficam disponíveis no estado
        da página.

        Na integração definitiva, esses dados passarão para
        o estado global da contratação.
        -----------------------------------------------------
        */

        console.log(
            "MusicalWorld — Dados da Etapa 3:",
            estado
        );


        window.location.href =
            CONFIG.paginas.proxima;

    }


    /* =====================================================
       CANCELAR CONTRATAÇÃO
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

        configurarOpcoesLocal();

        configurarCep();

        configurarLocalNaoDefinido();

        configurarEventos();


        console.log(
            "MusicalWorld — Etapa 3 da contratação inicializada."
        );

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoLocal = {

        inicializar: inicializar,

        voltar: voltar,

        avancar: avancar,

        cancelar: cancelar,

        obterEstado: function () {

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