/* =========================================================
   MUSICALWORLD — FLUXO DE CONTRATAÇÃO

   Arquivo:
   js/contratacao/contratacao-data-horario.js

   Responsabilidade:

   * Controlar a Etapa 2 da contratação.
   * Ler o estado central da contratação.
   * Recuperar o serviço selecionado na Etapa 1.
   * Exibir a duração real do serviço.
   * Permitir selecionar data e horário.
   * Controlar a necessidade de montagem/preparação.
   * Restaurar os dados quando o usuário retornar à etapa.
   * Salvar os dados desta etapa no estado central.
   * Validar os horários informados.
   * Preparar os dados para a próxima etapa.

   Arquitetura:

   * ContratacaoEstado.js é a fonte única de verdade.
   * A URL NÃO transporta mais os dados da contratação.
   * Cada etapa lê e grava somente no estado central.
   * Voltar NÃO apaga dados.
   * Avançar NÃO cria um novo estado.
   * Esta etapa é responsável pelos dados:

       - dataEvento
       - horarioInicio
       - horarioFim
       - precisaMontagem
       - horarioChegada

   Importante:

   * Este arquivo NÃO cria a contratação no banco.
   * Este arquivo NÃO realiza pagamento.
   * Este arquivo NÃO cria uma nova contratação.
   * Este arquivo NÃO limpa o estado central.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const CONFIG = {

        /*
         * Esta página representa sempre a Etapa 2.
         */
        etapaAtual: 2,

        totalEtapas: 6,

        paginas: {

            anterior: "contratacao.html",

            proximaEtapa: "contratacao-local.html"

        },

        tabelas: {

            servicosArtistas: "servicos_artistas"

        },

        seletores: {

            dataEvento: "dataEvento",

            horarioInicio: "horarioInicio",

            horarioFim: "horarioFim",

            horarioChegada: "horarioChegada",

            campoChegada: "campoChegada",

            duracaoServico: "duracaoServico",

            btnVoltar: "btnVoltar",

            btnAvancar: "btnAvancar",

            btnCancelarContratacao: "btnCancelarContratacao",

            opcoesMontagem: ".opcao-montagem"

        }

    };


    /* =====================================================
       ESTADO LOCAL DA PÁGINA
       =====================================================

       Este objeto representa somente o que a interface
       desta página precisa para funcionar.

       A fonte oficial dos dados continua sendo:

       MusicalWorldContratacaoEstado
       ===================================================== */

    const estado = {

        carregando: false,

        carregado: false,

        erro: null,

        perfilId: null,

        servicoId: null,

        tipo: null,

        servico: null,

        dataEvento: "",

        horarioInicio: "",

        horarioFim: "",

        precisaMontagem: null,

        horarioChegada: "",

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
            "MusicalWorldContratacaoDataHorario: " +
            "ContratacaoEstado.js não foi encontrado."
        );


        return null;

    }


    /* =====================================================
       DOM
       ===================================================== */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    function obterElementosMontagem() {

        return document.querySelectorAll(
            CONFIG.seletores.opcoesMontagem
        );

    }


    /* =====================================================
       SUPABASE
       ===================================================== */

    function obterSupabase() {

        if (
            window.MusicalWorldSupabase &&
            window.MusicalWorldSupabase.client
        ) {

            return window.MusicalWorldSupabase.client;

        }


        if (
            window.supabaseClient
        ) {

            return window.supabaseClient;

        }


        if (
            window.MusicalWorld &&
            window.MusicalWorld.supabase
        ) {

            return window.MusicalWorld.supabase;

        }


        return null;

    }


    /* =====================================================
       ENTRADA DO ESTADO CENTRAL
       =====================================================

       A Etapa 2 não cria uma nova contratação.

       Ela simplesmente recupera o que a Etapa 1 já
       armazenou no estado central.

       Isso permite:

       Etapa 1
           ↓
       Estado Central
           ↓
       Etapa 2
           ↓
       Estado Central

       E também:

       Etapa 2
           ↓ Voltar
       Etapa 1
           ↓ Avançar
       Etapa 2

       sem perder o serviço selecionado.
       ===================================================== */

    function carregarEstadoCentral() {

        const gerenciador =
            obterGerenciadorEstado();


        if (!gerenciador) {

            throw new Error(
                "O estado central da contratação não está disponível."
            );

        }


        /*
         * Inicializa/recarrega o estado persistido.
         */
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


        /*
         * A Etapa 2 precisa obrigatoriamente de um
         * perfil de artista.
         */
        if (!dados.perfilId) {

            throw new Error(
                "O perfil do artista não foi informado no estado da contratação."
            );

        }


        /*
         * O serviço precisa ter sido selecionado
         * na Etapa 1.
         */
        if (
            !dados.servico ||
            !dados.servico.id
        ) {

            throw new Error(
                "Nenhum serviço foi selecionado na Etapa 1."
            );

        }


        /*
         * Dados principais.
         */
        estado.perfilId =
            dados.perfilId || null;


        estado.tipo =
            dados.tipo || null;


        /*
         * Serviço selecionado na Etapa 1.
         */
        estado.servicoId =
            dados.servico.id || null;


        /*
         * Serviço armazenado no estado central.
         *
         * Ele será usado inicialmente para exibir
         * os dados enquanto confirmamos os dados
         * atuais no Supabase.
         */
        estado.servico =
            dados.servico
                ? normalizarServico(dados.servico)
                : null;


        /* -------------------------------------------------
           DADOS DA ETAPA 2
           ------------------------------------------------- */

        estado.dataEvento =
            dados.dataEvento || "";


        estado.horarioInicio =
            dados.horarioInicio || "";


        estado.horarioFim =
            dados.horarioFim || "";


        /*
         * Importante:
         *
         * precisaMontagem pode ser:
         *
         * true
         * false
         * null
         *
         * Não usamos || aqui porque false é um
         * valor válido.
         */
        if (
            dados.precisaMontagem === true
        ) {

            estado.precisaMontagem = true;

        } else if (
            dados.precisaMontagem === false
        ) {

            estado.precisaMontagem = false;

        } else {

            estado.precisaMontagem = null;

        }


        estado.horarioChegada =
            dados.horarioChegada || "";


        /*
         * Esta página está sendo aberta.
         *
         * Portanto, o indicador da etapa deve ser 2.
         *
         * Isso NÃO altera os demais dados.
         */
        sincronizarEtapaDaPagina();


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "estado central recuperado.",
            {
                perfilId: estado.perfilId,
                tipo: estado.tipo,
                servicoId: estado.servicoId,
                servico: estado.servico,
                dataEvento: estado.dataEvento,
                horarioInicio: estado.horarioInicio,
                horarioFim: estado.horarioFim,
                precisaMontagem: estado.precisaMontagem,
                horarioChegada: estado.horarioChegada
            }
        );


        return dados;

    }


    /* =====================================================
       SINCRONIZAR ETAPA ATUAL
       =====================================================

       Cada página declara qual etapa representa.

       Entrar na Etapa 2 significa:

           etapaAtual = 2

       Isso não apaga nenhum outro dado.
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


        /*
         * Mantém o estado local sincronizado.
         */
        estado.etapaAtual =
            CONFIG.etapaAtual;

    }


    /* =====================================================
       FORMATAÇÃO DE DURAÇÃO
       ===================================================== */

    function formatarDuracao(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "";

        }


        const numero =
            Number(valor);


        if (
            !Number.isFinite(numero)
        ) {

            return String(valor);

        }


        if (
            numero === 1
        ) {

            return "1 hora";

        }


        if (
            Number.isInteger(numero)
        ) {

            return `${numero} horas`;

        }


        return `${numero} horas`;

    }


    /* =====================================================
       NORMALIZAÇÃO DO SERVIÇO
       ===================================================== */

    function normalizarServico(servico) {

        if (!servico) {

            return null;

        }


        return {

            id:
                servico.id || null,

            nome:
                servico.nome ||
                servico.titulo ||
                servico.nome_servico ||
                "Serviço",

            descricao:
                servico.descricao ||
                "",

            valor:
                servico.valor ??
                servico.preco ??
                servico.valor_servico ??
                null,

            valorMinimo:
                servico.valorMinimo ??
                servico.valor_minimo ??
                null,

            valorMaximo:
                servico.valorMaximo ??
                servico.valor_maximo ??
                null,

            duracao:
                servico.duracao ??
                servico.duracao_horas ??
                servico.tempo_duracao ??
                null,

            tipoCobranca:
                servico.tipoCobranca ||
                servico.tipo_cobranca ||
                servico.forma_cobranca ||
                null,

            local:
                servico.local ||
                servico.tipo_local ||
                servico.localizacao ||
                null

        };

    }


    /* =====================================================
       CARREGAR SERVIÇO
       =====================================================

       O ID vem do estado central.

       A consulta ao Supabase serve para garantir que
       estamos exibindo os dados atuais do serviço.
       ===================================================== */

    async function carregarServico() {

        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );

        }


        if (!estado.servicoId) {

            throw new Error(
                "Serviço não informado no estado da contratação."
            );

        }


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "carregando serviço pelo estado central.",
            estado.servicoId
        );


        const {
            data,
            error
        } = await supabase

            .from(
                CONFIG.tabelas.servicosArtistas
            )

            .select("*")

            .eq(
                "id",
                estado.servicoId
            )

            .maybeSingle();


        if (error) {

            console.error(
                "Erro ao carregar serviço:",
                error
            );

            throw error;

        }


        if (!data) {

            /*
             * Se o serviço não estiver mais disponível
             * no banco, não apagamos o estado central.
             *
             * Isso é importante para não destruir a
             * contratação enquanto o usuário navega.
             */
            throw new Error(
                "O serviço selecionado não foi encontrado."
            );

        }


        estado.servico =
            normalizarServico(data);


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "serviço carregado.",
            estado.servico
        );

    }


    /* =====================================================
       RENDERIZAR SERVIÇO
       ===================================================== */

    function renderizarServico() {

        const elemento =
            obterElemento(
                CONFIG.seletores.duracaoServico
            );


        if (!elemento) {

            return;

        }


        if (
            !estado.servico ||
            estado.servico.duracao === null ||
            estado.servico.duracao === undefined
        ) {

            elemento.textContent =
                "Duração a definir";

            return;

        }


        elemento.textContent =
            formatarDuracao(
                estado.servico.duracao
            );

    }


    /* =====================================================
       DATA MÍNIMA
       ===================================================== */

    function configurarDataMinima() {

        const campo =
            obterElemento(
                CONFIG.seletores.dataEvento
            );


        if (!campo) {

            return;

        }


        const agora =
            new Date();


        const ano =
            agora.getFullYear();


        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                agora.getDate()
            ).padStart(
                2,
                "0"
            );


        const hoje =
            `${ano}-${mes}-${dia}`;


        campo.min =
            hoje;

    }


    /* =====================================================
       RESTAURAR FORMULÁRIO
       =====================================================

       Os valores vêm do estado central.

       Não existe mais restauração por URL.
       ===================================================== */

    function restaurarFormulario() {

        const data =
            obterElemento(
                CONFIG.seletores.dataEvento
            );


        const inicio =
            obterElemento(
                CONFIG.seletores.horarioInicio
            );


        const fim =
            obterElemento(
                CONFIG.seletores.horarioFim
            );


        const chegada =
            obterElemento(
                CONFIG.seletores.horarioChegada
            );


        /* -------------------------------------------------
           Data
           ------------------------------------------------- */

        if (data) {

            data.value =
                estado.dataEvento || "";

        }


        /* -------------------------------------------------
           Horário inicial
           ------------------------------------------------- */

        if (inicio) {

            inicio.value =
                estado.horarioInicio || "";

        }


        /* -------------------------------------------------
           Horário final
           ------------------------------------------------- */

        if (fim) {

            fim.value =
                estado.horarioFim || "";

        }


        /* -------------------------------------------------
           Montagem / preparação
           ------------------------------------------------- */

        if (
            estado.precisaMontagem === true
        ) {

            selecionarMontagem(
                "sim",
                false
            );

        } else if (
            estado.precisaMontagem === false
        ) {

            selecionarMontagem(
                "nao",
                false
            );

        } else {

            /*
             * Nenhuma opção escolhida ainda.
             */
            atualizarVisualMontagem();

        }


        /* -------------------------------------------------
           Horário de chegada
           ------------------------------------------------- */

        if (chegada) {

            chegada.value =
                estado.horarioChegada || "";

        }


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "formulário restaurado do estado central.",
            {
                dataEvento: estado.dataEvento,
                horarioInicio: estado.horarioInicio,
                horarioFim: estado.horarioFim,
                precisaMontagem: estado.precisaMontagem,
                horarioChegada: estado.horarioChegada
            }
        );

    }


    /* =====================================================
       ATUALIZAR VISUAL DA MONTAGEM
       ===================================================== */

    function atualizarVisualMontagem() {

        const opcoes =
            obterElementosMontagem();


        opcoes.forEach(
            (opcao) => {

                const valor =
                    opcao.dataset.valor;


                let selecionada = false;


                if (
                    estado.precisaMontagem === true &&
                    valor === "sim"
                ) {

                    selecionada = true;

                }


                if (
                    estado.precisaMontagem === false &&
                    valor === "nao"
                ) {

                    selecionada = true;

                }


                opcao.classList.toggle(
                    "selecionado",
                    selecionada
                );


                opcao.setAttribute(
                    "aria-pressed",
                    selecionada
                        ? "true"
                        : "false"
                );

            }
        );


        const campoChegada =
            obterElemento(
                CONFIG.seletores.campoChegada
            );


        if (campoChegada) {

            campoChegada.hidden =
                estado.precisaMontagem !== true;

        }

    }


    /* =====================================================
       MONTAGEM / PREPARAÇÃO
       ===================================================== */

    function selecionarMontagem(
        valor,
        atualizarEstadoCentral = true
    ) {

        if (
            valor !== "sim" &&
            valor !== "nao"
        ) {

            return;

        }


        estado.precisaMontagem =
            valor === "sim";


        atualizarVisualMontagem();


        const campoChegada =
            obterElemento(
                CONFIG.seletores.campoChegada
            );


        if (
            estado.precisaMontagem
        ) {

            if (campoChegada) {

                campoChegada.hidden =
                    false;

            }

        } else {

            if (campoChegada) {

                campoChegada.hidden =
                    true;

            }


            estado.horarioChegada =
                "";


            const campo =
                obterElemento(
                    CONFIG.seletores.horarioChegada
                );


            if (campo) {

                campo.value =
                    "";

            }

        }


        /*
         * Quando estamos restaurando o formulário,
         * não precisamos salvar novamente.

         * Quando o usuário clica na opção,
         * salvamos normalmente.
         */
        if (
            atualizarEstadoCentral
        ) {

            salvarDadosEtapa();

        }


        atualizarEstadoBotao();

    }


    /* =====================================================
       HORÁRIO
       ===================================================== */

    function converterHorarioParaMinutos(
        horario
    ) {

        if (!horario) {

            return null;

        }


        const partes =
            horario.split(":");


        if (
            partes.length < 2
        ) {

            return null;

        }


        const horas =
            Number(
                partes[0]
            );


        const minutos =
            Number(
                partes[1]
            );


        if (
            !Number.isFinite(horas) ||
            !Number.isFinite(minutos)
        ) {

            return null;

        }


        return (
            horas * 60
        ) + minutos;

    }


    function validarHorarios() {

        const inicio =
            converterHorarioParaMinutos(
                estado.horarioInicio
            );


        const fim =
            converterHorarioParaMinutos(
                estado.horarioFim
            );


        if (
            inicio === null ||
            fim === null
        ) {

            return false;

        }


        if (
            fim <= inicio
        ) {

            return false;

        }


        if (
            estado.precisaMontagem
        ) {

            const chegada =
                converterHorarioParaMinutos(
                    estado.horarioChegada
                );


            if (
                chegada === null
            ) {

                return false;

            }


            if (
                chegada > inicio
            ) {

                return false;

            }

        }


        return true;

    }


    /* =====================================================
       VALIDAÇÃO DA DATA
       ===================================================== */

    function validarData() {

        if (
            !estado.dataEvento
        ) {

            return false;

        }


        const campo =
            obterElemento(
                CONFIG.seletores.dataEvento
            );


        if (
            campo &&
            campo.min &&
            estado.dataEvento < campo.min
        ) {

            return false;

        }


        return true;

    }


    /* =====================================================
       VALIDAÇÃO DA ETAPA
       ===================================================== */

    function validarEtapa() {

        if (!estado.perfilId) {

            return false;

        }


        if (!estado.servicoId) {

            return false;

        }


        if (!estado.servico) {

            return false;

        }


        if (!validarData()) {

            return false;

        }


        if (!estado.horarioInicio) {

            return false;

        }


        if (!estado.horarioFim) {

            return false;

        }


        if (!validarHorarios()) {

            return false;

        }


        return true;

    }


    /* =====================================================
       BOTÃO CONTINUAR
       ===================================================== */

    function atualizarEstadoBotao() {

        const botao =
            obterElemento(
                CONFIG.seletores.btnAvancar
            );


        if (!botao) {

            return;

        }


        estado.valido =
            validarEtapa();


        botao.disabled =
            !estado.valido;


        botao.setAttribute(
            "aria-disabled",
            estado.valido
                ? "false"
                : "true"
        );

    }


    /* =====================================================
       LER CAMPOS DO FORMULÁRIO
       ===================================================== */

    function atualizarEstadoFormulario() {

        const data =
            obterElemento(
                CONFIG.seletores.dataEvento
            );


        const inicio =
            obterElemento(
                CONFIG.seletores.horarioInicio
            );


        const fim =
            obterElemento(
                CONFIG.seletores.horarioFim
            );


        const chegada =
            obterElemento(
                CONFIG.seletores.horarioChegada
            );


        if (data) {

            estado.dataEvento =
                data.value || "";

        }


        if (inicio) {

            estado.horarioInicio =
                inicio.value || "";

        }


        if (fim) {

            estado.horarioFim =
                fim.value || "";

        }


        /*
         * O horário de chegada só existe quando
         * montagem/preparação está habilitada.
         */
        if (chegada) {

            estado.horarioChegada =
                estado.precisaMontagem
                    ? chegada.value || ""
                    : "";

        }


        atualizarEstadoBotao();

    }


    /* =====================================================
       SALVAR DADOS DA ETAPA 2
       =====================================================

       Esta é uma das partes mais importantes da nova
       arquitetura.

       A Etapa 2 NÃO substitui o estado inteiro.

       Ela envia somente os campos que pertencem a ela.

       O ContratacaoEstado faz o merge e preserva:

       * perfil
       * artista
       * serviço
       * contratante
       * pagamento
       * local
       * evento
       * demais informações

       que possam existir nas próximas etapas.
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
                "MusicalWorldContratacaoDataHorario: " +
                "método salvar() não disponível."
            );

            return false;

        }


        const sucesso =
            gerenciador.salvar({

                /*
                 * Mantemos os dados principais.
                 */
                perfilId:
                    estado.perfilId,

                tipo:
                    estado.tipo,

                /*
                 * Mantemos explicitamente o serviço
                 * escolhido na Etapa 1.
                 */
                servico:
                    estado.servico
                        ? {

                            ...estado.servico

                        }
                        : null,

                /*
                 * Dados pertencentes à Etapa 2.
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
                    estado.precisaMontagem
                        ? estado.horarioChegada
                        : "",

                /*
                 * Marcador da etapa atual.
                 */
                etapaAtual:
                    CONFIG.etapaAtual

            });


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "dados da Etapa 2 salvos no estado central.",
            {
                sucesso,
                dataEvento: estado.dataEvento,
                horarioInicio: estado.horarioInicio,
                horarioFim: estado.horarioFim,
                precisaMontagem: estado.precisaMontagem,
                horarioChegada: estado.horarioChegada
            }
        );


        return sucesso !== false;

    }


    /* =====================================================
       MENSAGENS DE VALIDAÇÃO
       ===================================================== */

    function mostrarErroCampo(
        campo,
        mensagem
    ) {

        if (!campo) {

            return;

        }


        campo.setCustomValidity(
            mensagem || ""
        );

    }


    function validarCampoHorario() {

        const inicio =
            obterElemento(
                CONFIG.seletores.horarioInicio
            );


        const fim =
            obterElemento(
                CONFIG.seletores.horarioFim
            );


        if (
            !inicio ||
            !fim
        ) {

            return;

        }


        if (
            inicio.value &&
            fim.value
        ) {

            const inicioMinutos =
                converterHorarioParaMinutos(
                    inicio.value
                );


            const fimMinutos =
                converterHorarioParaMinutos(
                    fim.value
                );


            if (
                fimMinutos <=
                inicioMinutos
            ) {

                mostrarErroCampo(
                    fim,
                    "O horário de término deve ser posterior ao início."
                );

            } else {

                mostrarErroCampo(
                    fim,
                    ""
                );

            }

        } else {

            mostrarErroCampo(
                fim,
                ""
            );

        }

    }


    function validarCampoChegada() {

        const chegada =
            obterElemento(
                CONFIG.seletores.horarioChegada
            );


        const inicio =
            obterElemento(
                CONFIG.seletores.horarioInicio
            );


        if (
            !chegada ||
            !inicio
        ) {

            return;

        }


        if (
            !estado.precisaMontagem
        ) {

            mostrarErroCampo(
                chegada,
                ""
            );

            return;

        }


        if (
            chegada.value &&
            inicio.value
        ) {

            const chegadaMinutos =
                converterHorarioParaMinutos(
                    chegada.value
                );


            const inicioMinutos =
                converterHorarioParaMinutos(
                    inicio.value
                );


            if (
                chegadaMinutos >
                inicioMinutos
            ) {

                mostrarErroCampo(
                    chegada,
                    "O horário de chegada deve ser igual ou anterior ao início."
                );

            } else {

                mostrarErroCampo(
                    chegada,
                    ""
                );

            }

        } else {

            mostrarErroCampo(
                chegada,
                ""
            );

        }

    }


    /* =====================================================
       NAVEGAÇÃO — VOLTAR
       =====================================================

       IMPORTANTE:

       Não usamos mais URL para transportar os dados.

       Antes de voltar:

           1. Lemos os campos.
           2. Salvamos no estado central.
           3. Voltamos para a Etapa 1.

       A Etapa 1 irá recuperar o serviço diretamente
       do estado central.
       ===================================================== */

    function voltar() {

        /*
         * Captura os dados atualmente visíveis.
         */
        atualizarEstadoFormulario();


        /*
         * Salva o que o usuário já preencheu.
         *
         * Mesmo que a etapa ainda esteja incompleta,
         * os dados são preservados.
         */
        salvarDadosEtapa();


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "voltando para Etapa 1.",
            {
                perfilId: estado.perfilId,
                servicoId: estado.servicoId,
                dataEvento: estado.dataEvento,
                horarioInicio: estado.horarioInicio,
                horarioFim: estado.horarioFim,
                precisaMontagem: estado.precisaMontagem,
                horarioChegada: estado.horarioChegada
            }
        );


        window.location.assign(
            CONFIG.paginas.anterior
        );

    }


    /* =====================================================
       NAVEGAÇÃO — AVANÇAR
       ===================================================== */

    function avancar() {

        /*
         * Primeiro capturamos o que está na tela.
         */
        atualizarEstadoFormulario();


        /*
         * Validações visuais.
         */
        validarCampoHorario();

        validarCampoChegada();


        /*
         * Validação completa da etapa.
         */
        if (
            !validarEtapa()
        ) {

            console.warn(
                "MusicalWorldContratacaoDataHorario: " +
                "etapa inválida."
            );


            atualizarEstadoBotao();


            return;

        }


        /*
         * Salva definitivamente os dados da Etapa 2
         * no estado central antes de avançar.
         */
        const salvo =
            salvarDadosEtapa();


        if (!salvo) {

            console.error(
                "MusicalWorldContratacaoDataHorario: " +
                "não foi possível salvar o estado central."
            );


            return;

        }


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "avançando para Etapa 3.",
            {
                destino:
                    CONFIG.paginas.proximaEtapa,

                dados: {

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

                    precisaMontagem:
                        estado.precisaMontagem,

                    horarioChegada:
                        estado.horarioChegada

                }

            }
        );


        /*
         * A próxima etapa não precisa receber dados
         * pela URL.

         * Ela irá consultar ContratacaoEstado.js.
         */
        window.location.assign(
            CONFIG.paginas.proximaEtapa
        );

    }


    /* =====================================================
       CANCELAR
       =====================================================

       Cancelar é diferente de voltar.

       Voltar:
           preserva os dados.

       Cancelar:
           encerra o fluxo e limpa o estado.

       A limpeza é feita pelo estado central.
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
       EVENTOS
       ===================================================== */

    function configurarEventos() {

        const data =
            obterElemento(
                CONFIG.seletores.dataEvento
            );


        const inicio =
            obterElemento(
                CONFIG.seletores.horarioInicio
            );


        const fim =
            obterElemento(
                CONFIG.seletores.horarioFim
            );


        const chegada =
            obterElemento(
                CONFIG.seletores.horarioChegada
            );


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
                CONFIG.seletores.btnCancelarContratacao
            );


        /* -------------------------------------------------
           DATA
           ------------------------------------------------- */

        if (data) {

            data.addEventListener(
                "change",
                () => {

                    atualizarEstadoFormulario();

                    salvarDadosEtapa();

                }
            );

        }


        /* -------------------------------------------------
           HORÁRIO INICIAL
           ------------------------------------------------- */

        if (inicio) {

            inicio.addEventListener(
                "change",
                () => {

                    atualizarEstadoFormulario();

                    validarCampoHorario();

                    validarCampoChegada();

                    salvarDadosEtapa();

                }
            );

        }


        /* -------------------------------------------------
           HORÁRIO FINAL
           ------------------------------------------------- */

        if (fim) {

            fim.addEventListener(
                "change",
                () => {

                    atualizarEstadoFormulario();

                    validarCampoHorario();

                    salvarDadosEtapa();

                }
            );

        }


        /* -------------------------------------------------
           HORÁRIO DE CHEGADA
           ------------------------------------------------- */

        if (chegada) {

            chegada.addEventListener(
                "change",
                () => {

                    atualizarEstadoFormulario();

                    validarCampoChegada();

                    salvarDadosEtapa();

                }
            );

        }


        /* -------------------------------------------------
           OPÇÕES DE MONTAGEM
           ------------------------------------------------- */

        const opcoesMontagem =
            obterElementosMontagem();


        opcoesMontagem.forEach(
            (opcao) => {

                opcao.addEventListener(
                    "click",
                    () => {

                        selecionarMontagem(
                            opcao.dataset.valor,
                            true
                        );

                    }
                );

            }
        );


        /* -------------------------------------------------
           VOLTAR
           ------------------------------------------------- */

        if (btnVoltar) {

            btnVoltar.addEventListener(
                "click",
                voltar
            );

        }


        /* -------------------------------------------------
           AVANÇAR
           ------------------------------------------------- */

        if (btnAvancar) {

            btnAvancar.addEventListener(
                "click",
                avancar
            );

        }


        /* -------------------------------------------------
           CANCELAR
           ------------------------------------------------- */

        if (btnCancelar) {

            btnCancelar.addEventListener(
                "click",
                cancelar
            );

        }

    }


    /* =====================================================
       CARREGAMENTO
       ===================================================== */

    async function carregarDados() {

        estado.carregando = true;

        estado.carregado = false;

        estado.erro = null;


        try {

            /*
             * Primeiro recuperamos o estado central.
             *
             * Não usamos mais a URL como fonte de dados.
             */
            carregarEstadoCentral();


            /*
             * Carregamos o serviço atual no banco.
             */
            await carregarServico();


            estado.carregado = true;


            console.log(
                "MusicalWorldContratacaoDataHorario: " +
                "carregamento concluído.",
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
                "MusicalWorldContratacaoDataHorario: " +
                "erro ao carregar dados:",
                erro
            );

        } finally {

            estado.carregando = false;

        }

    }


    /* =====================================================
       RENDERIZAÇÃO
       ===================================================== */

    function renderizar() {

        /*
         * Exibe a duração real do serviço.
         */
        renderizarServico();


        /*
         * Define a data mínima permitida.
         */
        configurarDataMinima();


        /*
         * Restaura os dados salvos anteriormente.
         */
        restaurarFormulario();


        /*
         * Sincroniza os campos visíveis.
         */
        atualizarEstadoFormulario();


        /*
         * Executa as validações visuais.
         */
        validarCampoHorario();

        validarCampoChegada();


        /*
         * Atualiza o botão.
         */
        atualizarEstadoBotao();

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "inicializando Etapa 2."
        );


        /*
         * Configura os eventos antes do carregamento.
         */
        configurarEventos();


        /*
         * Recupera o estado e carrega o serviço.
         */
        await carregarDados();


        if (estado.erro) {

            const botao =
                obterElemento(
                    CONFIG.seletores.btnAvancar
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.setAttribute(
                    "aria-disabled",
                    "true"
                );

            }


            const duracao =
                obterElemento(
                    CONFIG.seletores.duracaoServico
                );


            if (duracao) {

                duracao.textContent =
                    "Não foi possível carregar o serviço.";

            }


            return;

        }


        /*
         * Renderiza a etapa já com os dados restaurados.
         */
        renderizar();


        console.log(
            "MusicalWorldContratacaoDataHorario: " +
            "Etapa 2 pronta."
        );

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    window.MusicalWorldContratacaoDataHorario = {

        estado,

        inicializar,

        avancar,

        voltar,

        cancelar,

        selecionarMontagem,

        salvarDadosEtapa

    };


    /* =====================================================
       INICIALIZAÇÃO AUTOMÁTICA
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