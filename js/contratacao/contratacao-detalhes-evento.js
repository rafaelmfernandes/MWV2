/* =========================================================
   MUSICALWORLD — FLUXO DE CONTRATAÇÃO

   Arquivo:
   js/contratacao/contratacao-detalhes-evento.js

   Responsabilidade:

   * Controlar a Etapa 4 da contratação.
   * Ler o estado central da contratação.
   * Preservar os dados das Etapas 1, 2 e 3.
   * Gerenciar o tipo de evento.
   * Gerenciar quantidade de pessoas.
   * Gerenciar nome do evento.
   * Gerenciar estrutura disponível.
   * Gerenciar observações.
   * Restaurar os dados quando o usuário retornar à etapa.
   * Validar os dados antes de avançar.
   * Salvar os dados da Etapa 4 no estado central.
   * Navegar para a Etapa 3 e Etapa 5.
   * Cancelar a contratação limpando o estado central.

   Arquitetura:

   * ContratacaoEstado.js é a fonte única de verdade.
   * A URL não transporta mais os dados da contratação.
   * A Etapa 4 trabalha somente com os dados de evento.
   * Os dados anteriores são preservados.
   * Voltar preserva os dados.
   * Avançar preserva os dados.
   * Cancelar encerra o fluxo.

   Importante:

   * Este arquivo NÃO grava a contratação definitivamente
     no Supabase.
   * Este arquivo NÃO realiza pagamento.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        /*
         * Esta página representa a Etapa 4.
         */
        etapaAtual: 4,

        totalEtapas: 6,

        paginas: {

            anterior:
                "contratacao-local.html",

            proxima:
                "contratacao-revisao.html"

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
       ESTADO LOCAL DA ETAPA
       =====================================================

       Este objeto representa os dados utilizados pela
       interface desta página.

       O estado oficial da contratação continua sendo:

       MusicalWorldContratacaoEstado
       ===================================================== */

    const estado = {

        etapaAtual:
            CONFIG.etapaAtual,

        perfilId:
            null,

        servicoId:
            null,

        tipo:
            null,

        dataEvento:
            "",

        horarioInicio:
            "",

        horarioFim:
            "",

        precisaMontagem:
            null,

        horarioChegada:
            "",

        tipoLocal:
            null,

        local:
            null,

        tipoEvento:
            null,

        quantidadePessoas:
            null,

        nomeEvento:
            "",

        estrutura:
            [],

        observacoes:
            "",

        valido:
            false,

        carregado:
            false,

        erro:
            null

    };


    /* =====================================================
       GERENCIADOR DO ESTADO CENTRAL
       ===================================================== */

    function obterGerenciadorEstado() {

        if (
            window.MusicalWorldContratacaoEstado
        ) {

            return window.MusicalWorldContratacaoEstado;

        }


        if (
            window.ContratacaoEstado
        ) {

            return window.ContratacaoEstado;

        }


        console.error(
            "MusicalWorldContratacaoDetalhesEvento: " +
            "ContratacaoEstado.js não foi encontrado."
        );


        return null;

    }


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
       CARREGAR ESTADO CENTRAL
       =====================================================

       Recupera tudo que já foi preenchido nas etapas
       anteriores e os dados existentes da Etapa 4.

       A página nunca deve começar uma nova contratação.

       Ela somente continua a contratação existente.
       ===================================================== */

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
            typeof gerenciador.obter === "function"
                ? gerenciador.obter()
                : null;


        if (!dados) {

            throw new Error(
                "Não foi possível recuperar a contratação."
            );

        }


        /* -------------------------------------------------
           VALIDAR ETAPAS ANTERIORES
           ------------------------------------------------- */

        if (!dados.perfilId) {

            throw new Error(
                "O perfil do artista não foi informado."
            );

        }


        if (
            !dados.servico ||
            !dados.servico.id
        ) {

            throw new Error(
                "O serviço selecionado não foi informado."
            );

        }


        estado.perfilId =
            dados.perfilId || null;


        estado.tipo =
            dados.tipo || null;


        estado.servicoId =
            dados.servico.id || null;


        /* -------------------------------------------------
           ETAPA 2
           ------------------------------------------------- */

        estado.dataEvento =
            dados.dataEvento || "";


        estado.horarioInicio =
            dados.horarioInicio || "";


        estado.horarioFim =
            dados.horarioFim || "";


        if (
            dados.precisaMontagem === true
        ) {

            estado.precisaMontagem =
                true;

        } else if (
            dados.precisaMontagem === false
        ) {

            estado.precisaMontagem =
                false;

        } else {

            estado.precisaMontagem =
                null;

        }


        estado.horarioChegada =
            dados.horarioChegada || "";


        /* -------------------------------------------------
           ETAPA 3
           ------------------------------------------------- */

        estado.local =
            dados.local || null;


        estado.tipoLocal =
            dados.local &&
            dados.local.tipoLocal
                ? dados.local.tipoLocal
                : null;


        /* -------------------------------------------------
           ETAPA 4
           ------------------------------------------------- */

        const evento =
            dados.evento || {};


        estado.tipoEvento =
            evento.tipoEvento ||
            "";


        estado.quantidadePessoas =
            evento.quantidadeConvidados !== null &&
            evento.quantidadeConvidados !== undefined
                ? Number(
                    evento.quantidadeConvidados
                )
                : null;


        estado.nomeEvento =
            evento.nomeEvento ||
            "";


        estado.observacoes =
            evento.observacoes ||
            "";


        /*
         * A estrutura será recuperada de
         * informacoesAdicionais.

         * Ela será armazenada como JSON para que
         * possamos manter múltiplas opções sem alterar
         * a estrutura atual do estado central.
         */
        estado.estrutura =
            recuperarEstrutura(
                evento.informacoesAdicionais
            );


        /* -------------------------------------------------
           MARCAR ETAPA ATUAL
           ------------------------------------------------- */

        sincronizarEtapaDaPagina();


        console.log(
            "MusicalWorldContratacaoDetalhesEvento: " +
            "estado central recuperado.",
            {

                perfilId:
                    estado.perfilId,

                servicoId:
                    estado.servicoId,

                dataEvento:
                    estado.dataEvento,

                horarioInicio:
                    estado.horarioInicio,

                horarioFim:
                    estado.horarioFim,

                tipoLocal:
                    estado.tipoLocal,

                tipoEvento:
                    estado.tipoEvento,

                quantidadePessoas:
                    estado.quantidadePessoas,

                nomeEvento:
                    estado.nomeEvento,

                estrutura:
                    estado.estrutura,

                observacoes:
                    estado.observacoes

            }
        );


        return dados;

    }


    /* =====================================================
       RECUPERAR ESTRUTURA
       ===================================================== */

    function recuperarEstrutura(valor) {

        if (!valor) {

            return [];

        }


        /*
         * Caso futuramente a estrutura já seja armazenada
         * como array, também aceitamos diretamente.
         */
        if (
            Array.isArray(valor)
        ) {

            return valor.slice();

        }


        if (
            typeof valor !== "string"
        ) {

            return [];

        }


        /*
         * Tentamos recuperar o JSON salvo.
         */
        try {

            const dados =
                JSON.parse(valor);


            if (
                Array.isArray(dados)
            ) {

                return dados;

            }


            /*
             * Caso o JSON tenha sido salvo como:
             *
             * { estrutura: [...] }
             */
            if (
                dados &&
                Array.isArray(
                    dados.estrutura
                )
            ) {

                return dados.estrutura;

            }

        } catch (erro) {

            /*
             * Não interrompemos a contratação caso o
             * conteúdo seja um texto antigo.
             *
             * O texto antigo simplesmente não será
             * convertido em estrutura.
             */
            console.warn(
                "MusicalWorldContratacaoDetalhesEvento: " +
                "não foi possível interpretar " +
                "informacoesAdicionais.",
                erro
            );

        }


        return [];

    }


    /* =====================================================
       SINCRONIZAR ETAPA
       ===================================================== */

    function sincronizarEtapaDaPagina() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            return;

        }


        if (
            typeof gerenciador.definirEtapa === "function"
        ) {

            gerenciador.definirEtapa(
                CONFIG.etapaAtual
            );

        } else if (
            typeof gerenciador.salvar === "function"
        ) {

            gerenciador.salvar({

                etapaAtual:
                    CONFIG.etapaAtual

            });

        }


        estado.etapaAtual =
            CONFIG.etapaAtual;

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


        opcoes.forEach(
            function (opcao) {

                opcao.addEventListener(
                    "click",
                    function () {

                        const valor =
                            opcao.dataset.valor ||
                            null;


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


                                item.classList.toggle(
                                    "selecionado",
                                    selecionado
                                );


                                item.classList.toggle(
                                    "active",
                                    selecionado
                                );

                            }
                        );


                        salvarDadosEtapa();

                        atualizarEstadoBotao();

                    }
                );

            }
        );

    }


    /* =====================================================
       RESTAURAR TIPO DE EVENTO
       ===================================================== */

    function restaurarTipoEvento() {

        if (
            !estado.tipoEvento
        ) {

            return;

        }


        const opcoes =
            document.querySelectorAll(
                CONFIG.seletores.opcoesEvento
            );


        opcoes.forEach(
            function (opcao) {

                const selecionado =
                    opcao.dataset.valor ===
                    estado.tipoEvento;


                opcao.setAttribute(
                    "aria-pressed",
                    selecionado
                        ? "true"
                        : "false"
                );


                opcao.classList.toggle(
                    "selecionado",
                    selecionado
                );


                opcao.classList.toggle(
                    "active",
                    selecionado
                );

            }
        );

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


        if (
            !campo ||
            !contador
        ) {

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
            function () {

                atualizarContadorObservacoes();

                estado.observacoes =
                    campo.value.trim();

                salvarDadosEtapa();

                atualizarEstadoBotao();

            }
        );


        atualizarContadorObservacoes();

    }


    /* =====================================================
       CONFIGURAR ESTRUTURA
       ===================================================== */

    function configurarEstrutura() {

        const campos =
            document.querySelectorAll(
                CONFIG.seletores.estruturas
            );


        if (!campos.length) {

            return;

        }


        campos.forEach(
            function (campo) {

                campo.addEventListener(
                    "change",
                    function () {

                        /*
                         * "Nenhuma / não sei informar"
                         * funciona como opção exclusiva.
                         */
                        if (
                            campo.value ===
                            "nenhuma" &&
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


                        } else if (
                            campo.value !==
                            "nenhuma" &&
                            campo.checked
                        ) {

                            /*
                             * Qualquer outra opção
                             * desmarca "nenhuma".
                             */
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


                        estado.estrutura =
                            obterEstruturaSelecionada();


                        salvarDadosEtapa();

                        atualizarEstadoBotao();

                    }
                );

            }
        );

    }


    /* =====================================================
       OBTER ESTRUTURA SELECIONADA
       ===================================================== */

    function obterEstruturaSelecionada() {

        const campos =
            document.querySelectorAll(
                CONFIG.seletores.estruturas
            );


        const selecionados =
            [];


        campos.forEach(
            function (campo) {

                if (
                    campo.checked
                ) {

                    selecionados.push(
                        campo.value
                    );

                }

            }
        );


        return selecionados;

    }


    /* =====================================================
       RESTAURAR ESTRUTURA
       ===================================================== */

    function restaurarEstrutura() {

        const campos =
            document.querySelectorAll(
                CONFIG.seletores.estruturas
            );


        if (
            !campos.length
        ) {

            return;

        }


        const estrutura =
            Array.isArray(
                estado.estrutura
            )
                ? estado.estrutura
                : [];


        campos.forEach(
            function (campo) {

                campo.checked =
                    estrutura.includes(
                        campo.value
                    );

            }
        );


        /*
         * Mantém a regra de exclusividade de
         * "nenhuma".
         */
        const campoNenhuma =
            Array.from(
                campos
            ).find(
                function (campo) {

                    return (
                        campo.value ===
                        "nenhuma"
                    );

                }
            );


        if (
            campoNenhuma &&
            campoNenhuma.checked
        ) {

            campos.forEach(
                function (campo) {

                    if (
                        campo !==
                        campoNenhuma
                    ) {

                        campo.checked =
                            false;

                    }

                }
            );

        }

    }


    /* =====================================================
       RESTAURAR CAMPOS DO FORMULÁRIO
       ===================================================== */

    function restaurarCampos() {

        const quantidade =
            obterElemento(
                CONFIG.seletores.quantidadePessoas
            );


        const nome =
            obterElemento(
                CONFIG.seletores.nomeEvento
            );


        const observacoes =
            obterElemento(
                CONFIG.seletores.observacoes
            );


        if (quantidade) {

            quantidade.value =
                estado.quantidadePessoas !== null
                    ? String(
                        estado.quantidadePessoas
                    )
                    : "";

        }


        if (nome) {

            nome.value =
                estado.nomeEvento || "";

        }


        if (observacoes) {

            observacoes.value =
                estado.observacoes || "";

        }


        restaurarTipoEvento();

        restaurarEstrutura();

        atualizarContadorObservacoes();


        console.log(
            "MusicalWorldContratacaoDetalhesEvento: " +
            "campos restaurados.",
            {

                tipoEvento:
                    estado.tipoEvento,

                quantidadePessoas:
                    estado.quantidadePessoas,

                nomeEvento:
                    estado.nomeEvento,

                estrutura:
                    estado.estrutura,

                observacoes:
                    estado.observacoes

            }
        );

    }


    /* =====================================================
       CONFIGURAR CAMPOS
       ===================================================== */

    function configurarCampos() {

        const quantidade =
            obterElemento(
                CONFIG.seletores.quantidadePessoas
            );


        const nome =
            obterElemento(
                CONFIG.seletores.nomeEvento
            );


        if (quantidade) {

            quantidade.addEventListener(
                "input",
                function () {

                    const valor =
                        quantidade.value.trim();


                    estado.quantidadePessoas =
                        valor
                            ? Number(valor)
                            : null;


                    salvarDadosEtapa();

                    atualizarEstadoBotao();

                }
            );

        }


        if (nome) {

            nome.addEventListener(
                "input",
                function () {

                    estado.nomeEvento =
                        nome.value.trim();


                    salvarDadosEtapa();

                    atualizarEstadoBotao();

                }
            );

        }

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
       MONTAR INFORMAÇÕES ADICIONAIS
       =====================================================

       O estado central possui:

       evento.informacoesAdicionais

       Como a interface atual possui "estrutura"
       separadamente, armazenamos essa informação
       como JSON dentro desse campo.

       Isso mantém compatibilidade com o estado atual
       sem criar outra estrutura central.
       ===================================================== */

    function criarInformacoesAdicionais() {

        return JSON.stringify({

            estrutura:
                Array.isArray(
                    estado.estrutura
                )
                    ? estado.estrutura
                    : []

        });

    }


    /* =====================================================
       SALVAR DADOS DA ETAPA 4
       ===================================================== */

    function salvarDadosEtapa() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            return false;

        }


        if (
            typeof gerenciador.salvar !== "function"
        ) {

            console.error(
                "MusicalWorldContratacaoDetalhesEvento: " +
                "método salvar() não está disponível."
            );


            return false;

        }


        /*
         * Antes de salvar, garantimos que o estado
         * local esteja sincronizado com os campos.
         */
        coletarDados();


        const sucesso =
            gerenciador.salvar({

                /*
                 * Dados principais preservados.
                 */
                perfilId:
                    estado.perfilId,

                tipo:
                    estado.tipo,

                dataEvento:
                    estado.dataEvento,

                horarioInicio:
                    estado.horarioInicio,

                horarioFim:
                    estado.horarioFim,

                precisaMontagem:
                    estado.precisaMontagem,

                horarioChegada:
                    estado.horarioChegada,

                /*
                 * O local já foi salvo pela Etapa 3.
                 *
                 * Não substituímos o objeto local aqui.
                 */
                evento: {

                    tipoEvento:
                        estado.tipoEvento || "",

                    nomeEvento:
                        estado.nomeEvento || "",

                    quantidadeConvidados:
                        estado.quantidadePessoas !== null
                            ? estado.quantidadePessoas
                            : null,

                    descricao:
                        "",

                    observacoes:
                        estado.observacoes || "",

                    informacoesAdicionais:
                        criarInformacoesAdicionais()

                },

                etapaAtual:
                    CONFIG.etapaAtual

            });


        console.log(
            "MusicalWorldContratacaoDetalhesEvento: " +
            "dados da Etapa 4 salvos.",
            {

                sucesso,

                evento: {

                    tipoEvento:
                        estado.tipoEvento,

                    nomeEvento:
                        estado.nomeEvento,

                    quantidadeConvidados:
                        estado.quantidadePessoas,

                    estrutura:
                        estado.estrutura,

                    observacoes:
                        estado.observacoes

                }

            }
        );


        return sucesso !== false;

    }


    /* =====================================================
       VALIDAÇÃO
       ===================================================== */

    function validarDados() {

        coletarDados();


        /* -------------------------------------------------
           GARANTIR CONTINUIDADE DAS ETAPAS ANTERIORES
           ------------------------------------------------- */

        if (
            !estado.perfilId
        ) {

            alert(
                "Não foi possível identificar o perfil do artista."
            );


            return false;

        }


        if (
            !estado.servicoId
        ) {

            alert(
                "Não foi possível identificar o serviço selecionado."
            );


            return false;

        }


        if (
            !estado.dataEvento
        ) {

            alert(
                "A data do evento não foi informada."
            );


            return false;

        }


        if (
            !estado.horarioInicio
        ) {

            alert(
                "O horário de início não foi informado."
            );


            return false;

        }


        if (
            !estado.horarioFim
        ) {

            alert(
                "O horário de término não foi informado."
            );


            return false;

        }


        /* -------------------------------------------------
           TIPO DE EVENTO
           ------------------------------------------------- */

        if (
            !estado.tipoEvento
        ) {

            alert(
                "Selecione o tipo de evento."
            );


            return false;

        }


        /* -------------------------------------------------
           QUANTIDADE DE PESSOAS
           -------------------------------------------------

           É opcional.

           Porém, se preenchida, deve estar entre
           1 e 100.000.
           ------------------------------------------------- */

        if (
            estado.quantidadePessoas !== null &&
            (
                !Number.isFinite(
                    estado.quantidadePessoas
                ) ||
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
       VALIDAÇÃO SILENCIOSA
       ===================================================== */

    function verificarValidadeSilenciosa() {

        /*
         * Dados anteriores.
         */
        if (
            !estado.perfilId ||
            !estado.servicoId ||
            !estado.dataEvento ||
            !estado.horarioInicio ||
            !estado.horarioFim
        ) {

            return false;

        }


        /*
         * Tipo de evento obrigatório.
         */
        if (
            !estado.tipoEvento
        ) {

            return false;

        }


        /*
         * Quantidade é opcional.
         */
        if (
            estado.quantidadePessoas !== null &&
            (
                !Number.isFinite(
                    estado.quantidadePessoas
                ) ||
                estado.quantidadePessoas < 1 ||
                estado.quantidadePessoas > 100000
            )
        ) {

            return false;

        }


        return true;

    }


    /* =====================================================
       ATUALIZAR ESTADO DO BOTÃO
       ===================================================== */

    function atualizarEstadoBotao() {

        const botao =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        estado.valido =
            verificarValidadeSilenciosa();


        if (!botao) {

            return;

        }


        botao.setAttribute(
            "aria-disabled",
            estado.valido
                ? "false"
                : "true"
        );

    }


    /* =====================================================
       VOLTAR
       =====================================================

       Salva o que está na tela antes de retornar.

       A Etapa 3 recuperará os dados diretamente
       do estado central.
       ===================================================== */

    function voltar() {

        coletarDados();


        salvarDadosEtapa();


        console.log(
            "MusicalWorldContratacaoDetalhesEvento: " +
            "voltando para Etapa 3."
        );


        window.location.assign(
            CONFIG.paginas.anterior
        );

    }


    /* =====================================================
       AVANÇAR
       ===================================================== */

    function avancar() {

        coletarDados();


        if (
            !validarDados()
        ) {

            return;

        }


        const salvo =
            salvarDadosEtapa();


        if (!salvo) {

            console.error(
                "MusicalWorldContratacaoDetalhesEvento: " +
                "não foi possível salvar os dados da Etapa 4."
            );


            return;

        }


        console.log(
            "MusicalWorldContratacaoDetalhesEvento: " +
            "avançando para Etapa 5.",
            {

                destino:
                    CONFIG.paginas.proxima,

                evento: {

                    tipoEvento:
                        estado.tipoEvento,

                    quantidadePessoas:
                        estado.quantidadePessoas,

                    nomeEvento:
                        estado.nomeEvento,

                    estrutura:
                        estado.estrutura,

                    observacoes:
                        estado.observacoes

                }

            }
        );


        window.location.assign(
            CONFIG.paginas.proxima
        );

    }


    /* =====================================================
       CANCELAR
       ===================================================== */

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


    /* =====================================================
       CONFIGURAR EVENTOS DOS BOTÕES
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

        estado.erro =
            null;


        try {

            /*
             * Primeiro recuperamos a contratação.
             */
            carregarEstadoCentral();


            /*
             * Depois configuramos a interface.
             */
            configurarOpcoesEvento();

            configurarObservacoes();

            configurarEstrutura();

            configurarCampos();

            configurarEventos();


            /*
             * Finalmente restauramos tudo que já
             * existia no estado central.
             */
            restaurarCampos();


            atualizarEstadoBotao();


            estado.carregado =
                true;


            console.log(
                "MusicalWorldContratacaoDetalhesEvento: " +
                "Etapa 4 inicializada.",
                {

                    etapaAtual:
                        CONFIG.etapaAtual,

                    perfilId:
                        estado.perfilId,

                    servicoId:
                        estado.servicoId,

                    tipoEvento:
                        estado.tipoEvento

                }
            );

        } catch (erro) {

            estado.erro =
                erro;


            console.error(
                "MusicalWorldContratacaoDetalhesEvento: " +
                "erro ao inicializar Etapa 4:",
                erro
            );

        }

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

        salvarDadosEtapa:
            salvarDadosEtapa,

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