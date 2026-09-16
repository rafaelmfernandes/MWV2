/* =========================================================
   MUSICALWORLD — FLUXO DE CONTRATAÇÃO

   Arquivo:
   js/contratacao/contratacao-local.js

   Responsabilidade:

   * Controlar a Etapa 3 da contratação.
   * Ler os dados do estado central da contratação.
   * Preservar os dados das etapas anteriores.
   * Gerenciar a seleção do tipo de local.
   * Gerenciar os campos de endereço.
   * Consultar endereço automaticamente pelo CEP.
   * Permitir informar que o local ainda não foi definido.
   * Permitir informar que o endereço não possui número.
   * Restaurar os dados quando o usuário retornar à etapa.
   * Validar os dados antes de avançar.
   * Salvar os dados desta etapa no estado central.
   * Navegar para a etapa anterior e seguinte.

   Arquitetura:

   * ContratacaoEstado.js é a fonte única de verdade.
   * A URL não transporta mais os dados da contratação.
   * A Etapa 3 lê os dados acumulados anteriormente.
   * A Etapa 3 grava somente os dados pertencentes ao local.
   * Voltar preserva os dados.
   * Avançar preserva os dados.
   * Cancelar encerra o fluxo e limpa o estado central.

   Importante:

   * Este arquivo NÃO cria a contratação no banco.
   * Este arquivo NÃO realiza pagamento.
   * Este arquivo NÃO realiza gravação definitiva.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        /*
         * Esta página representa sempre a Etapa 3.
         */
        etapaAtual: 3,

        totalEtapas: 6,

        paginas: {

            anterior:
                "contratacao-data-horario.html",

            proxima:
                "contratacao-detalhes-evento.html"

        },

        seletores: {

            btnVoltar:
                "btnVoltar",

            btnAvancar:
                "btnAvancar",

            btnCancelar:
                "btnCancelarContratacao",

            opcoesLocal:
                ".opcao-local",

            cep:
                "cep",

            rua:
                "rua",

            numero:
                "numero",

            semNumero:
                "semNumero",

            complemento:
                "complemento",

            bairro:
                "bairro",

            cidade:
                "cidade",

            estado:
                "estado",

            localAindaNaoDefinido:
                "localAindaNaoDefinido"

        }

    };


    /* =====================================================
       ESTADO LOCAL DA PÁGINA
       =====================================================

       Este objeto representa somente o que a interface
       desta página precisa para funcionar.

       O estado oficial permanece em:

       MusicalWorldContratacaoEstado
       ===================================================== */

    const estado = {

        carregando: false,

        carregado: false,

        erro: null,

        perfilId: null,

        servicoId: null,

        tipo: null,

        dataEvento: "",

        horarioInicio: "",

        horarioFim: "",

        precisaMontagem: null,

        horarioChegada: "",

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

        semNumero: false,

        localAindaNaoDefinido: false,

        valido: false

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
            "MusicalWorldContratacaoLocal: " +
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
       UTILITÁRIO — LER VALOR
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

       Esta é a entrada oficial da Etapa 3.

       Não usamos mais parâmetros da URL.

       Recuperamos:

       Etapa 1:
           perfil
           tipo
           serviço

       Etapa 2:
           data
           horários
           montagem

       Etapa 3:
           local, quando já tiver sido preenchido
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
                "Não foi possível recuperar o estado da contratação."
            );

        }


        /* -------------------------------------------------
           DADOS DAS ETAPAS ANTERIORES
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


        estado.dataEvento =
            dados.dataEvento || "";


        estado.horarioInicio =
            dados.horarioInicio || "";


        estado.horarioFim =
            dados.horarioFim || "";


        /*
         * Booleano real.

         * Não usamos || porque false é um valor válido.
         */
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
           LOCAL
           -------------------------------------------------

           A Etapa 3 trabalha com o objeto:

           local: {
               tipoLocal,
               nomeLocal,
               cep,
               estado,
               cidade,
               bairro,
               endereco,
               numero,
               complemento,
               referencia,
               semNumero,
               localAindaNaoDefinido
           }
           ------------------------------------------------- */

        const local =
            dados.local || {};


        estado.tipoLocal =
            local.tipoLocal ||
            null;


        estado.endereco = {

            cep:
                local.cep || "",

            rua:
                local.endereco || "",

            numero:
                local.numero || "",

            complemento:
                local.complemento || "",

            bairro:
                local.bairro || "",

            cidade:
                local.cidade || "",

            estado:
                local.estado || ""

        };


        estado.semNumero =
            local.semNumero === true;


        estado.localAindaNaoDefinido =
            local.localAindaNaoDefinido === true;


        /*
         * Esta página está aberta.
         *
         * Portanto, o marcador da etapa precisa ser 3.
         *
         * Isso não apaga nenhum outro dado.
         */
        sincronizarEtapaDaPagina();


        console.log(
            "MusicalWorldContratacaoLocal: " +
            "estado central recuperado.",
            {

                perfilId:
                    estado.perfilId,

                servicoId:
                    estado.servicoId,

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

                tipoLocal:
                    estado.tipoLocal,

                endereco:
                    estado.endereco,

                semNumero:
                    estado.semNumero,

                localAindaNaoDefinido:
                    estado.localAindaNaoDefinido

            }
        );


        return dados;

    }


    /* =====================================================
       SINCRONIZAR ETAPA ATUAL
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
       FORMATAR CEP
       ===================================================== */

    function formatarCep(valor) {

        const numeros =
            String(valor || "")
                .replace(/\D/g, "")
                .slice(0, 8);


        if (
            numeros.length <= 5
        ) {

            return numeros;

        }


        return (
            numeros.substring(0, 5) +
            "-" +
            numeros.substring(5)
        );

    }


    /* =====================================================
       SALVAR DADOS DA ETAPA 3
       =====================================================

       A Etapa 3 grava somente o objeto "local".

       Os dados das etapas anteriores permanecem
       intactos porque o estado central faz merge.
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
                "MusicalWorldContratacaoLocal: " +
                "método salvar() não disponível."
            );


            return false;

        }


        const sucesso =
            gerenciador.salvar({

                /*
                 * Mantemos as referências principais
                 * para garantir continuidade do fluxo.
                 */
                perfilId:
                    estado.perfilId,

                tipo:
                    estado.tipo,

                /*
                 * O serviço já veio da Etapa 1.
                 *
                 * Não precisamos reconstruí-lo aqui.
                 */
                servico:
                    estado.servicoId
                        ? {
                            id:
                                estado.servicoId
                        }
                        : null,

                /*
                 * Dados da Etapa 2 permanecem preservados.
                 */
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
                 * Dados pertencentes à Etapa 3.
                 */
                local: {

                    tipoLocal:
                        estado.tipoLocal || "",

                    nomeLocal:
                        "",

                    cep:
                        estado.endereco.cep || "",

                    estado:
                        estado.endereco.estado || "",

                    cidade:
                        estado.endereco.cidade || "",

                    bairro:
                        estado.endereco.bairro || "",

                    endereco:
                        estado.endereco.rua || "",

                    numero:
                        estado.semNumero
                            ? ""
                            : estado.endereco.numero || "",

                    complemento:
                        estado.endereco.complemento || "",

                    referencia:
                        "",

                    semNumero:
                        estado.semNumero,

                    localAindaNaoDefinido:
                        estado.localAindaNaoDefinido

                },

                /*
                 * Marcador da etapa atual.
                 */
                etapaAtual:
                    CONFIG.etapaAtual

            });


        console.log(
            "MusicalWorldContratacaoLocal: " +
            "dados da Etapa 3 salvos no estado central.",
            {

                sucesso,

                local: {

                    tipoLocal:
                        estado.tipoLocal,

                    cep:
                        estado.endereco.cep,

                    rua:
                        estado.endereco.rua,

                    numero:
                        estado.endereco.numero,

                    complemento:
                        estado.endereco.complemento,

                    bairro:
                        estado.endereco.bairro,

                    cidade:
                        estado.endereco.cidade,

                    estado:
                        estado.endereco.estado,

                    semNumero:
                        estado.semNumero,

                    localAindaNaoDefinido:
                        estado.localAindaNaoDefinido

                }

            }
        );


        return sucesso !== false;

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


        opcoes.forEach(
            function (opcao) {

                opcao.addEventListener(
                    "click",
                    function () {

                        if (
                            opcao.disabled
                        ) {

                            return;

                        }


                        const valor =
                            opcao.dataset.valor ||
                            null;


                        estado.tipoLocal =
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
       BUSCA DE ENDEREÇO PELO CEP
       ===================================================== */

    function configurarCep() {

        const campoCep =
            obterElemento(
                CONFIG.seletores.cep
            );


        if (!campoCep) {

            return;

        }


        let consultaEmAndamento =
            false;


        campoCep.addEventListener(
            "input",
            function () {

                campoCep.value =
                    formatarCep(
                        campoCep.value
                    );


                estado.endereco.cep =
                    campoCep.value;


                salvarDadosEtapa();


                const cepNumeros =
                    campoCep.value.replace(
                        /\D/g,
                        ""
                    );


                if (
                    cepNumeros.length !== 8 ||
                    consultaEmAndamento
                ) {

                    return;

                }


                buscarEnderecoPorCep(
                    cepNumeros
                );

            }
        );


        campoCep.addEventListener(
            "keydown",
            function (evento) {

                if (
                    evento.key !== "Enter"
                ) {

                    return;

                }


                evento.preventDefault();


                const cepNumeros =
                    campoCep.value.replace(
                        /\D/g,
                        ""
                    );


                if (
                    cepNumeros.length !== 8 ||
                    consultaEmAndamento
                ) {

                    return;

                }


                buscarEnderecoPorCep(
                    cepNumeros
                );

            }
        );


        async function buscarEnderecoPorCep(
            cep
        ) {

            consultaEmAndamento =
                true;


            if (
                /^(\d)\1{7}$/.test(cep)
            ) {

                consultaEmAndamento =
                    false;


                alert(
                    "Informe um CEP válido."
                );


                return;

            }


            const camposEndereco = {

                rua:
                    obterElemento(
                        CONFIG.seletores.rua
                    ),

                bairro:
                    obterElemento(
                        CONFIG.seletores.bairro
                    ),

                cidade:
                    obterElemento(
                        CONFIG.seletores.cidade
                    ),

                estado:
                    obterElemento(
                        CONFIG.seletores.estado
                    )

            };


            campoCep.classList.add(
                "campo-carregando"
            );


            campoCep.setAttribute(
                "aria-busy",
                "true"
            );


            try {

                const resposta =
                    await fetch(
                        "https://viacep.com.br/ws/" +
                        cep +
                        "/json/"
                    );


                if (!resposta.ok) {

                    throw new Error(
                        "Não foi possível consultar o CEP."
                    );

                }


                const dados =
                    await resposta.json();


                if (dados.erro) {

                    alert(
                        "CEP não encontrado. Verifique o número informado."
                    );


                    return;

                }


                if (
                    camposEndereco.rua
                ) {

                    camposEndereco.rua.value =
                        dados.logradouro || "";

                }


                if (
                    camposEndereco.bairro
                ) {

                    camposEndereco.bairro.value =
                        dados.bairro || "";

                }


                if (
                    camposEndereco.cidade
                ) {

                    camposEndereco.cidade.value =
                        dados.localidade || "";

                }


                if (
                    camposEndereco.estado
                ) {

                    camposEndereco.estado.value =
                        dados.uf || "";

                }


                /*
                 * Atualiza o estado local imediatamente
                 * depois da consulta.
                 */
                estado.endereco.cep =
                    formatarCep(cep);


                estado.endereco.rua =
                    dados.logradouro || "";


                estado.endereco.bairro =
                    dados.bairro || "";


                estado.endereco.cidade =
                    dados.localidade || "";


                estado.endereco.estado =
                    dados.uf || "";


                /*
                 * Persiste o resultado no estado central.
                 */
                salvarDadosEtapa();


                console.log(
                    "MusicalWorldContratacaoLocal: " +
                    "endereço localizado pelo CEP.",
                    dados
                );


                const campoNumero =
                    obterElemento(
                        CONFIG.seletores.numero
                    );


                if (
                    campoNumero &&
                    !estado.semNumero &&
                    !estado.localAindaNaoDefinido
                ) {

                    campoNumero.focus();

                }


                atualizarEstadoBotao();

            } catch (erro) {

                console.error(
                    "MusicalWorldContratacaoLocal: " +
                    "erro ao consultar CEP:",
                    erro
                );


                alert(
                    "Não foi possível consultar o CEP. " +
                    "Verifique sua conexão e tente novamente."
                );

            } finally {

                consultaEmAndamento =
                    false;


                campoCep.classList.remove(
                    "campo-carregando"
                );


                campoCep.removeAttribute(
                    "aria-busy"
                );

            }

        }

    }


    /* =====================================================
       CONFIGURAR OPÇÃO "SEM NÚMERO"
       ===================================================== */

    function configurarSemNumero() {

        const checkbox =
            obterElemento(
                CONFIG.seletores.semNumero
            );


        const campoNumero =
            obterElemento(
                CONFIG.seletores.numero
            );


        if (
            !checkbox ||
            !campoNumero
        ) {

            return;

        }


        checkbox.addEventListener(
            "change",
            function () {

                atualizarEstadoNumero();

                coletarDados();

                salvarDadosEtapa();

                atualizarEstadoBotao();

            }
        );


        atualizarEstadoNumero();

    }


    /* =====================================================
       ATUALIZAR ESTADO DO NÚMERO
       ===================================================== */

    function atualizarEstadoNumero() {

        const checkbox =
            obterElemento(
                CONFIG.seletores.semNumero
            );


        const campoNumero =
            obterElemento(
                CONFIG.seletores.numero
            );


        if (
            !checkbox ||
            !campoNumero
        ) {

            return;

        }


        estado.semNumero =
            checkbox.checked;


        campoNumero.disabled =
            estado.semNumero ||
            estado.localAindaNaoDefinido;


        campoNumero.required =
            !estado.semNumero &&
            !estado.localAindaNaoDefinido;


        if (
            estado.semNumero
        ) {

            campoNumero.value =
                "";

            campoNumero.setCustomValidity(
                ""
            );

            campoNumero.classList.remove(
                "campo-invalido"
            );

        }

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


        if (
            !checkbox ||
            !enderecoCard
        ) {

            return;

        }


        estado.localAindaNaoDefinido =
            checkbox.checked;


        const campos =
            enderecoCard.querySelectorAll(
                ".campo-input"
            );


        campos.forEach(
            function (campo) {

                campo.disabled =
                    checkbox.checked;

            }
        );


        enderecoCard.classList.toggle(
            "local-indefinido",
            checkbox.checked
        );


        const opcoesLocal =
            document.querySelectorAll(
                CONFIG.seletores.opcoesLocal
            );


        opcoesLocal.forEach(
            function (opcao) {

                opcao.disabled =
                    checkbox.checked;

            }
        );


        if (
            checkbox.checked
        ) {

            estado.tipoLocal =
                null;


            opcoesLocal.forEach(
                function (opcao) {

                    opcao.setAttribute(
                        "aria-pressed",
                        "false"
                    );


                    opcao.classList.remove(
                        "selecionado"
                    );


                    opcao.classList.remove(
                        "active"
                    );

                }
            );

        }


        atualizarEstadoNumero();

        atualizarEstadoBotao();

    }


    /* =====================================================
       CONFIGURAR CHECKBOX "LOCAL AINDA NÃO DEFINIDO"
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

                coletarDados();

                salvarDadosEtapa();

                atualizarEstadoBotao();

            }
        );


        atualizarEstadoEndereco();

    }


    /* =====================================================
       COLETAR DADOS DO ENDEREÇO
       ===================================================== */

    function coletarDados() {

        const checkbox =
            obterElemento(
                CONFIG.seletores.localAindaNaoDefinido
            );


        const checkboxSemNumero =
            obterElemento(
                CONFIG.seletores.semNumero
            );


        estado.localAindaNaoDefinido =
            Boolean(
                checkbox &&
                checkbox.checked
            );


        estado.semNumero =
            Boolean(
                checkboxSemNumero &&
                checkboxSemNumero.checked
            );


        /*
         * Quando o local ainda não foi definido,
         * não devemos considerar endereço digitado
         * como um endereço válido da contratação.
         *
         * Porém não apagamos visualmente os dados.
         * Eles poderão continuar disponíveis caso
         * o usuário desmarque essa opção.
         */
        estado.endereco = {

            cep:
                obterValor(
                    CONFIG.seletores.cep
                ),

            rua:
                obterValor(
                    CONFIG.seletores.rua
                ),

            numero:
                estado.semNumero
                    ? ""
                    : obterValor(
                        CONFIG.seletores.numero
                    ),

            complemento:
                obterValor(
                    CONFIG.seletores.complemento
                ),

            bairro:
                obterValor(
                    CONFIG.seletores.bairro
                ),

            cidade:
                obterValor(
                    CONFIG.seletores.cidade
                ),

            estado:
                obterValor(
                    CONFIG.seletores.estado
                )

        };


        return estado;

    }


    /* =====================================================
       VALIDAÇÃO
       ===================================================== */

    function validarDados() {

        coletarDados();


        /* -------------------------------------------------
           ETAPAS ANTERIORES
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
           LOCAL AINDA NÃO DEFINIDO
           -------------------------------------------------

           Nesse caso o endereço não precisa ser
           informado nesta etapa.
           ------------------------------------------------- */

        if (
            estado.localAindaNaoDefinido
        ) {

            return true;

        }


        /* -------------------------------------------------
           TIPO DE LOCAL
           ------------------------------------------------- */

        if (
            !estado.tipoLocal
        ) {

            alert(
                "Selecione o tipo do local do evento."
            );


            return false;

        }


        /* -------------------------------------------------
           CEP

           O CEP é opcional.

           Porém, se informado, precisa conter
           exatamente oito números.
           ------------------------------------------------- */

        const cepNumeros =
            estado.endereco.cep.replace(
                /\D/g,
                ""
            );


        if (
            cepNumeros.length > 0 &&
            cepNumeros.length !== 8
        ) {

            alert(
                "Informe um CEP válido."
            );


            return false;

        }


        /* -------------------------------------------------
           RUA
           ------------------------------------------------- */

        if (
            !estado.endereco.rua
        ) {

            alert(
                "Informe a rua ou avenida do evento."
            );


            return false;

        }


        /* -------------------------------------------------
           NÚMERO
           ------------------------------------------------- */

        if (
            !estado.semNumero &&
            !estado.endereco.numero
        ) {

            alert(
                'Informe o número do local ou marque a opção "Sem número".'
            );


            return false;

        }


        /* -------------------------------------------------
           BAIRRO
           ------------------------------------------------- */

        if (
            !estado.endereco.bairro
        ) {

            alert(
                "Informe o bairro do evento."
            );


            return false;

        }


        /* -------------------------------------------------
           CIDADE
           ------------------------------------------------- */

        if (
            !estado.endereco.cidade
        ) {

            alert(
                "Informe a cidade do evento."
            );


            return false;

        }


        /* -------------------------------------------------
           ESTADO
           ------------------------------------------------- */

        if (
            !estado.endereco.estado
        ) {

            alert(
                "Selecione o estado do evento."
            );


            return false;

        }


        return true;

    }


    /* =====================================================
       ATUALIZAR BOTÃO AVANÇAR
       ===================================================== */

    function atualizarEstadoBotao() {

        const botao =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        if (!botao) {

            return;

        }


        /*
         * Não desabilitamos permanentemente o botão
         * nesta etapa porque a validação completa é
         * feita no clique.
         *
         * Entretanto, podemos indicar o estado atual.
         */
        estado.valido =
            verificarValidadeSilenciosa();


        botao.setAttribute(
            "aria-disabled",
            estado.valido
                ? "false"
                : "true"
        );

    }


    /* =====================================================
       VALIDAÇÃO SILENCIOSA
       =====================================================

       Usada apenas para atualizar o estado visual
       do botão sem abrir vários alerts enquanto
       o usuário está preenchendo o formulário.
       ===================================================== */

    function verificarValidadeSilenciosa() {

        /*
         * Dados das etapas anteriores.
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
         * Se o local ainda não foi definido,
         * a etapa está válida quanto ao endereço.
         */
        if (
            estado.localAindaNaoDefinido
        ) {

            return true;

        }


        if (
            !estado.tipoLocal
        ) {

            return false;

        }


        const cepNumeros =
            String(
                estado.endereco.cep || ""
            ).replace(
                /\D/g,
                ""
            );


        if (
            cepNumeros.length > 0 &&
            cepNumeros.length !== 8
        ) {

            return false;

        }


        if (
            !estado.endereco.rua
        ) {

            return false;

        }


        if (
            !estado.semNumero &&
            !estado.endereco.numero
        ) {

            return false;

        }


        if (
            !estado.endereco.bairro
        ) {

            return false;

        }


        if (
            !estado.endereco.cidade
        ) {

            return false;

        }


        if (
            !estado.endereco.estado
        ) {

            return false;

        }


        return true;

    }


    /* =====================================================
       RESTAURAR DADOS
       ===================================================== */

    function restaurarDados() {

        const campoCep =
            obterElemento(
                CONFIG.seletores.cep
            );


        const campoRua =
            obterElemento(
                CONFIG.seletores.rua
            );


        const campoNumero =
            obterElemento(
                CONFIG.seletores.numero
            );


        const campoComplemento =
            obterElemento(
                CONFIG.seletores.complemento
            );


        const campoBairro =
            obterElemento(
                CONFIG.seletores.bairro
            );


        const campoCidade =
            obterElemento(
                CONFIG.seletores.cidade
            );


        const campoEstado =
            obterElemento(
                CONFIG.seletores.estado
            );


        const checkboxSemNumero =
            obterElemento(
                CONFIG.seletores.semNumero
            );


        /* -------------------------------------------------
           ENDEREÇO
           ------------------------------------------------- */

        if (campoCep) {

            campoCep.value =
                formatarCep(
                    estado.endereco.cep
                );

        }


        if (campoRua) {

            campoRua.value =
                estado.endereco.rua;

        }


        if (campoNumero) {

            campoNumero.value =
                estado.endereco.numero;

        }


        if (campoComplemento) {

            campoComplemento.value =
                estado.endereco.complemento;

        }


        if (campoBairro) {

            campoBairro.value =
                estado.endereco.bairro;

        }


        if (campoCidade) {

            campoCidade.value =
                estado.endereco.cidade;

        }


        if (campoEstado) {

            campoEstado.value =
                estado.endereco.estado;

        }


        if (checkboxSemNumero) {

            checkboxSemNumero.checked =
                estado.semNumero;

        }


        /* -------------------------------------------------
           RESTAURAR TIPO DE LOCAL
           ------------------------------------------------- */

        if (
            estado.tipoLocal
        ) {

            const opcao =
                document.querySelector(
                    CONFIG.seletores.opcoesLocal +
                    '[data-valor="' +
                    estado.tipoLocal +
                    '"]'
                );


            if (opcao) {

                opcao.setAttribute(
                    "aria-pressed",
                    "true"
                );


                opcao.classList.add(
                    "selecionado"
                );


                opcao.classList.add(
                    "active"
                );

            }

        }


        /* -------------------------------------------------
           RESTAURAR LOCAL NÃO DEFINIDO
           ------------------------------------------------- */

        const checkbox =
            obterElemento(
                CONFIG.seletores.localAindaNaoDefinido
            );


        if (checkbox) {

            checkbox.checked =
                estado.localAindaNaoDefinido;

        }


        /*
         * Primeiro restaura os valores.
         *
         * Depois aplica o comportamento visual e
         * de habilitação dos campos.
         */
        atualizarEstadoEndereco();

        atualizarEstadoNumero();


        /*
         * Após restaurar os campos, sincronizamos
         * novamente o estado local.
         */
        coletarDados();


        console.log(
            "MusicalWorldContratacaoLocal: " +
            "dados restaurados do estado central.",
            {

                tipoLocal:
                    estado.tipoLocal,

                endereco:
                    estado.endereco,

                semNumero:
                    estado.semNumero,

                localAindaNaoDefinido:
                    estado.localAindaNaoDefinido

            }
        );

    }


    /* =====================================================
       EVENTOS DOS CAMPOS
       ===================================================== */

    function configurarEventosCampos() {

        const idsCampos = [

            CONFIG.seletores.rua,

            CONFIG.seletores.numero,

            CONFIG.seletores.complemento,

            CONFIG.seletores.bairro,

            CONFIG.seletores.cidade,

            CONFIG.seletores.estado

        ];


        idsCampos.forEach(
            function (id) {

                const campo =
                    obterElemento(id);


                if (!campo) {

                    return;

                }


                campo.addEventListener(
                    "input",
                    function () {

                        coletarDados();

                        salvarDadosEtapa();

                        atualizarEstadoBotao();

                    }
                );


                campo.addEventListener(
                    "change",
                    function () {

                        coletarDados();

                        salvarDadosEtapa();

                        atualizarEstadoBotao();

                    }
                );

            }
        );

    }


    /* =====================================================
       VOLTAR
       =====================================================

       Voltar preserva tudo.

       Não usamos URL.

       A Etapa 2 irá recuperar os dados dela
       diretamente do estado central.
       ===================================================== */

    function voltar() {

        /*
         * Captura tudo que está atualmente na tela.
         */
        coletarDados();


        /*
         * Salva mesmo que a etapa ainda esteja
         * incompleta.
         */
        salvarDadosEtapa();


        console.log(
            "MusicalWorldContratacaoLocal: " +
            "voltando para Etapa 2.",
            {

                dataEvento:
                    estado.dataEvento,

                horarioInicio:
                    estado.horarioInicio,

                horarioFim:
                    estado.horarioFim,

                precisaMontagem:
                    estado.precisaMontagem,

                local:
                    {

                        tipoLocal:
                            estado.tipoLocal,

                        endereco:
                            estado.endereco,

                        semNumero:
                            estado.semNumero,

                        localAindaNaoDefinido:
                            estado.localAindaNaoDefinido

                    }

            }
        );


        window.location.assign(
            CONFIG.paginas.anterior
        );

    }


    /* =====================================================
       AVANÇAR
       ===================================================== */

    function avancar() {

        /*
         * Primeiro sincroniza a interface.
         */
        coletarDados();


        /*
         * Validação.
         */
        if (
            !validarDados()
        ) {

            return;

        }


        /*
         * Salva definitivamente os dados desta etapa
         * no estado central antes de avançar.
         */
        const salvo =
            salvarDadosEtapa();


        if (!salvo) {

            console.error(
                "MusicalWorldContratacaoLocal: " +
                "não foi possível salvar os dados da Etapa 3."
            );


            return;

        }


        console.log(
            "MusicalWorldContratacaoLocal: " +
            "avançando para Etapa 4.",
            {

                destino:
                    CONFIG.paginas.proxima,

                local:
                    {

                        tipoLocal:
                            estado.tipoLocal,

                        endereco:
                            estado.endereco,

                        semNumero:
                            estado.semNumero,

                        localAindaNaoDefinido:
                            estado.localAindaNaoDefinido

                    }

            }
        );


        /*
         * A próxima etapa consulta diretamente
         * ContratacaoEstado.js.
         */
        window.location.assign(
            CONFIG.paginas.proxima
        );

    }


    /* =====================================================
       CANCELAR CONTRATAÇÃO
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

        estado.carregando =
            true;


        estado.erro =
            null;


        try {

            /*
             * Recupera toda a contratação do estado central.
             */
            carregarEstadoCentral();


            /*
             * Configura os comportamentos da interface.
             */
            configurarOpcoesLocal();

            configurarCep();

            configurarSemNumero();

            configurarLocalNaoDefinido();

            configurarEventosCampos();

            configurarEventos();


            /*
             * Restaura os dados da Etapa 3.
             */
            restaurarDados();


            /*
             * Atualiza o estado visual final.
             */
            atualizarEstadoBotao();


            estado.carregado =
                true;


            console.log(
                "MusicalWorldContratacaoLocal: " +
                "Etapa 3 inicializada.",
                {

                    perfilId:
                        estado.perfilId,

                    servicoId:
                        estado.servicoId,

                    tipo:
                        estado.tipo,

                    etapaAtual:
                        CONFIG.etapaAtual

                }
            );

        } catch (erro) {

            estado.erro =
                erro;


            console.error(
                "MusicalWorldContratacaoLocal: " +
                "erro ao inicializar Etapa 3:",
                erro
            );

        } finally {

            estado.carregando =
                false;

        }

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoLocal = {

        inicializar,

        voltar,

        avancar,

        cancelar,

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