/* =========================================================
   MUSICALWORLD — RENDERIZAÇÃO DA VISUALIZAÇÃO DE PROPOSTA

   Arquivo:
   js/proposta/proposta-visualizacao-render.js

   Responsabilidade:

   - Renderizar os dados da proposta na interface.
   - Identificar se o usuário atual é remetente ou destinatário.
   - Exibir o artista quando o estabelecimento visualiza.
   - Exibir o estabelecimento quando o artista visualiza.
   - Alterar os textos da interface conforme o papel do usuário.
   - Exibir a foto correta do participante.
   - Exibir serviço, data, horário, local e valor.
   - Exibir observações quando existirem.
   - Controlar a apresentação das ações de aceitar/recusar.
   - Exibir estados de carregamento, processamento, erro e resultado.

   Regras:

   REMETENTE — ARTISTA
   - Proposta enviada.
   - Detalhes do estabelecimento.
   - Exibe o estabelecimento.
   - Não pode aceitar ou recusar.

   DESTINATÁRIO — ESTABELECIMENTO
   - Proposta recebida.
   - Detalhes do profissional.
   - Exibe o artista.
   - Pode aceitar ou recusar.

   IMPORTANTE:

   - Este arquivo NÃO consulta o Supabase.
   - Este arquivo NÃO altera dados.
   - Este arquivo NÃO contém regras de negócio.
   - O papel do usuário é definido pelo módulo de dados.
   - O fluxo de aceitar/recusar pertence ao módulo:
     proposta-visualizacao-fluxo.js

   Integração esperada pelo controlador:

   window.MusicalWorldPropostaVisualizacaoRender

   Função principal:

   propostaVisualizacaoRender.renderizar(dados)
   ========================================================= */


/* =========================================================
   NAMESPACE PRINCIPAL DO MÓDULO
   ========================================================= */

window.MusicalWorldPropostaVisualizacaoRender = (() => {


    /* =====================================================
       ELEMENTOS DA INTERFACE
       ===================================================== */

    const elementos = {

        /* -------------------------------------------------
           Estados principais
           ------------------------------------------------- */

        loading:
            document.getElementById(
                "propostaLoading"
            ),

        erro:
            document.getElementById(
                "propostaErro"
            ),

        erroMensagem:
            document.getElementById(
                "propostaErroMensagem"
            ),

        conteudo:
            document.getElementById(
                "propostaConteudo"
            ),


        /* -------------------------------------------------
           Cabeçalho superior
           ------------------------------------------------- */

        headerEyebrow:
            document.querySelector(
                ".proposta-header-eyebrow"
            ),

        headerTitulo:
            document.querySelector(
                ".proposta-header-titulo h1"
            ),

        headerDescricao:
            document.querySelector(
                ".proposta-header-titulo p"
            ),


        /* -------------------------------------------------
           Identificação da proposta
           ------------------------------------------------- */

        cardEyebrow:
            document.getElementById(
                "propostaCardEyebrow"
            ),

        cardTitulo:
            document.getElementById(
                "propostaCardTitulo"
            ),

        status:
            document.getElementById(
                "propostaStatus"
            ),


        /* -------------------------------------------------
           Participante
           ------------------------------------------------- */

        artistaFoto:
            document.getElementById(
                "propostaArtistaFoto"
            ),

        artistaFotoPlaceholder:
            document.getElementById(
                "propostaArtistaFotoPlaceholder"
            ),

        artistaNome:
            document.getElementById(
                "propostaArtistaNome"
            ),

        artistaTipo:
            document.getElementById(
                "propostaArtistaTipo"
            ),

        artistaLocalizacao:
            document.getElementById(
                "propostaArtistaLocalizacao"
            ),


        /* -------------------------------------------------
           Serviço
           ------------------------------------------------- */

        servicoContainer:
            document.getElementById(
                "propostaServicoContainer"
            ),

        servico:
            document.getElementById(
                "propostaServico"
            ),


        /* -------------------------------------------------
           Evento
           ------------------------------------------------- */

        data:
            document.getElementById(
                "propostaData"
            ),

        horario:
            document.getElementById(
                "propostaHorario"
            ),


        /* -------------------------------------------------
           Local
           ------------------------------------------------- */

        localNome:
            document.getElementById(
                "propostaLocalNome"
            ),

        localEndereco:
            document.getElementById(
                "propostaLocalEndereco"
            ),


        /* -------------------------------------------------
           Valor
           ------------------------------------------------- */

        valor:
            document.getElementById(
                "propostaValor"
            ),


        /* -------------------------------------------------
           Observações
           ------------------------------------------------- */

        observacoesContainer:
            document.getElementById(
                "propostaObservacoesContainer"
            ),

        observacoes:
            document.getElementById(
                "propostaObservacoes"
            ),


        /* -------------------------------------------------
           Ações
           ------------------------------------------------- */

        acoes:
            document.getElementById(
                "propostaAcoes"
            ),

        btnAceitar:
            document.getElementById(
                "btnAceitarProposta"
            ),

        btnRecusar:
            document.getElementById(
                "btnRecusarProposta"
            ),


        /* -------------------------------------------------
           Processamento
           ------------------------------------------------- */

        processando:
            document.getElementById(
                "propostaProcessando"
            ),


        /* -------------------------------------------------
           Resultado
           ------------------------------------------------- */

        resultado:
            document.getElementById(
                "propostaResultado"
            ),

        resultadoIcone:
            document.getElementById(
                "propostaResultadoIcone"
            ),

        resultadoTitulo:
            document.getElementById(
                "propostaResultadoTitulo"
            ),

        resultadoMensagem:
            document.getElementById(
                "propostaResultadoMensagem"
            )

    };


    /* =====================================================
       FUNÇÕES UTILITÁRIAS
       ===================================================== */


    /**
     * Define o texto de um elemento.
     *
     * @param {HTMLElement|null} elemento
     * @param {*} texto
     * @param {string} fallback
     */
    function definirTexto(
        elemento,
        texto,
        fallback = "—"
    ) {

        if (!elemento) {
            return;
        }

        if (
            texto === null ||
            texto === undefined ||
            String(texto).trim() === ""
        ) {

            elemento.textContent =
                fallback;

            return;
        }

        elemento.textContent =
            String(texto);
    }


    /**
     * Controla a visibilidade de um elemento.
     *
     * @param {HTMLElement|null} elemento
     * @param {boolean} exibir
     */
    function definirVisibilidade(
        elemento,
        exibir
    ) {

        if (!elemento) {
            return;
        }

        elemento.hidden =
            !exibir;
    }


    /**
     * Retorna um texto seguro.
     *
     * @param {*} valor
     * @param {string} fallback
     * @returns {string}
     */
    function textoSeguro(
        valor,
        fallback = "—"
    ) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return fallback;
        }

        const texto =
            String(valor).trim();

        return texto || fallback;
    }


    /**
     * Formata valor em Real brasileiro.
     *
     * @param {*} valor
     * @returns {string}
     */
    function formatarValor(
        valor
    ) {

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


    /**
     * Formata data sem conversão de fuso.
     *
     * @param {*} data
     * @returns {string}
     */
    function formatarData(
        data
    ) {

        if (!data) {
            return "—";
        }

        const valor =
            String(data).trim();

        const partes =
            valor.split("-");

        if (partes.length !== 3) {
            return valor;
        }

        const ano =
            Number(partes[0]);

        const mes =
            Number(partes[1]);

        const dia =
            Number(partes[2]);

        if (
            !Number.isInteger(ano) ||
            !Number.isInteger(mes) ||
            !Number.isInteger(dia)
        ) {

            return valor;
        }

        const dataLocal =
            new Date(
                ano,
                mes - 1,
                dia
            );

        if (
            Number.isNaN(
                dataLocal.getTime()
            )
        ) {

            return valor;
        }

        return dataLocal.toLocaleDateString(
            "pt-BR"
        );
    }


    /**
     * Formata horário.
     *
     * @param {*} horario
     * @returns {string}
     */
    function formatarHorario(
        horario
    ) {

        if (
            horario === null ||
            horario === undefined ||
            String(horario).trim() === ""
        ) {

            return "A definir";
        }

        const valor =
            String(horario).trim();

        const partes =
            valor.split(":");

        if (partes.length >= 2) {

            return (
                `${partes[0]}:${partes[1]}`
            );
        }

        return valor;
    }


    /**
     * Formata intervalo de horário.
     *
     * @param {*} inicio
     * @param {*} fim
     * @returns {string}
     */
    function formatarIntervaloHorario(
        inicio,
        fim
    ) {

        const temInicio =
            inicio !== null &&
            inicio !== undefined &&
            String(inicio).trim() !== "";

        const temFim =
            fim !== null &&
            fim !== undefined &&
            String(fim).trim() !== "";


        if (
            !temInicio &&
            !temFim
        ) {

            return "A definir";
        }


        if (
            temInicio &&
            temFim
        ) {

            return (
                `${formatarHorario(inicio)} às ${formatarHorario(fim)}`
            );
        }


        if (temInicio) {

            return formatarHorario(
                inicio
            );
        }


        return formatarHorario(
            fim
        );
    }


    /* =====================================================
       IDENTIFICAÇÃO DO PAPEL
       ===================================================== */


    /**
     * Verifica se o usuário atual é o remetente.
     *
     * No fluxo atual:
     *
     * remetente = artista
     * destinatário = estabelecimento
     *
     * @param {Object} dados
     * @returns {boolean}
     */
    function usuarioEhRemetente(
        dados
    ) {

        if (!dados) {
            return false;
        }

        return (
            dados.usuarioEhRemetente === true ||
            dados.papelUsuario === "remetente"
        );
    }


    /**
     * Verifica se o usuário atual é o destinatário.
     *
     * @param {Object} dados
     * @returns {boolean}
     */
    function usuarioEhDestinatario(
        dados
    ) {

        if (!dados) {
            return false;
        }

        return (
            dados.usuarioEhDestinatario === true ||
            dados.papelUsuario === "destinatario"
        );
    }


    /**
     * Retorna o participante que deve ser mostrado
     * no card principal.
     *
     * Se o artista estiver visualizando:
     * → mostrar estabelecimento.
     *
     * Se o estabelecimento estiver visualizando:
     * → mostrar artista.
     *
     * @param {Object} dados
     * @returns {Object|null}
     */
    function obterParticipanteExibido(
        dados
    ) {

        if (!dados) {
            return null;
        }


        if (
            usuarioEhRemetente(
                dados
            )
        ) {

            return (
                dados.estabelecimento ||
                null
            );
        }


        return (
            dados.artista ||
            null
        );
    }


    /* =====================================================
       CABEÇALHO DA PROPOSTA
       ===================================================== */


    /**
     * Renderiza os títulos conforme o papel.
     *
     * ARTISTA / REMETENTE:
     *
     * Proposta enviada
     * Detalhes do estabelecimento
     *
     * ESTABELECIMENTO / DESTINATÁRIO:
     *
     * Proposta recebida
     * Detalhes do profissional
     *
     * @param {Object} dados
     */
    function renderizarCabecalho(
        dados
    ) {

        const remetente =
            usuarioEhRemetente(
                dados
            );

        const destinatario =
            usuarioEhDestinatario(
                dados
            );


        /*
         * ARTISTA VISUALIZANDO
         */

        if (remetente) {

            definirTexto(
                elementos.cardEyebrow,
                "Proposta enviada"
            );

            definirTexto(
                elementos.cardTitulo,
                "Detalhes do estabelecimento"
            );

            definirTexto(
                elementos.headerEyebrow,
                "Contratação"
            );

            definirTexto(
                elementos.headerTitulo,
                "Proposta enviada"
            );

            definirTexto(
                elementos.headerDescricao,
                "Acompanhe os detalhes enviados ao estabelecimento."
            );

            return;
        }


        /*
         * ESTABELECIMENTO VISUALIZANDO
         */

        if (destinatario) {

            definirTexto(
                elementos.cardEyebrow,
                "Proposta recebida"
            );

            definirTexto(
                elementos.cardTitulo,
                "Detalhes do profissional"
            );

            definirTexto(
                elementos.headerEyebrow,
                "Contratação"
            );

            definirTexto(
                elementos.headerTitulo,
                "Nova proposta"
            );

            definirTexto(
                elementos.headerDescricao,
                "Analise os detalhes enviados pelo profissional."
            );

            return;
        }


        /*
         * Fallback.
         *
         * Normalmente não será utilizado porque
         * o módulo de dados já valida o participante.
         */

        definirTexto(
            elementos.cardEyebrow,
            "Proposta"
        );

        definirTexto(
            elementos.cardTitulo,
            "Detalhes da proposta"
        );

        definirTexto(
            elementos.headerEyebrow,
            "Contratação"
        );

        definirTexto(
            elementos.headerTitulo,
            "Proposta"
        );

        definirTexto(
            elementos.headerDescricao,
            "Analise os detalhes da proposta."
        );
    }


    /* =====================================================
       STATUS
       ===================================================== */


    /**
     * Limpa classes de status.
     */
    function limparClassesStatus() {

        if (!elementos.status) {
            return;
        }

        elementos.status.classList.remove(
            "status-aguardando",
            "status-confirmada",
            "status-recusada",
            "status-cancelada",
            "status-concluida",
            "status-andamento"
        );
    }


    /**
     * Renderiza o status da proposta.
     *
     * @param {Object} dados
     */
    function renderizarStatus(
        dados
    ) {

        if (!elementos.status) {
            return;
        }


        limparClassesStatus();


        const proposta =
            dados.proposta ||
            dados.contratacao ||
            dados;


        const status =
            proposta &&
            proposta.status
                ? String(
                    proposta.status
                ).trim().toLowerCase()
                : "";


        const remetente =
            usuarioEhRemetente(
                dados
            );


        let texto =
            "Nova proposta";

        let classe =
            "status-aguardando";


        /*
         * PROPOSTA ENVIADA / RECEBIDA
         */

        if (
            status === "solicitacao_enviada" ||
            status === "aguardando_confirmacao"
        ) {

            if (remetente) {

                texto =
                    "Proposta enviada";

            } else {

                texto =
                    "Nova proposta";
            }

            classe =
                "status-aguardando";
        }


        /*
         * CONFIRMADA
         */

        else if (
            status === "confirmada"
        ) {

            texto =
                "Proposta confirmada";

            classe =
                "status-confirmada";
        }


        /*
         * RECUSADA
         */

        else if (
            status === "recusada"
        ) {

            texto =
                "Proposta recusada";

            classe =
                "status-recusada";
        }


        /*
         * CANCELADA
         */

        else if (
            status === "cancelada"
        ) {

            texto =
                "Proposta cancelada";

            classe =
                "status-cancelada";
        }


        /*
         * EM ANDAMENTO
         */

        else if (
            status === "em_andamento"
        ) {

            texto =
                "Em andamento";

            classe =
                "status-andamento";
        }


        /*
         * CONCLUÍDA
         */

        else if (
            status === "concluida"
        ) {

            texto =
                "Concluída";

            classe =
                "status-concluida";
        }


        elementos.status.classList.add(
            classe
        );


        definirTexto(
            elementos.status,
            texto
        );
    }


    /* =====================================================
       PARTICIPANTE
       ===================================================== */


    /**
     * Renderiza o participante correto.
     *
     * @param {Object} dados
     */
    function renderizarParticipante(
        dados
    ) {

        const participante =
            obterParticipanteExibido(
                dados
            );


        /*
         * Nenhum participante.
         */

        if (!participante) {

            definirTexto(
                elementos.artistaNome,
                "—"
            );

            definirTexto(
                elementos.artistaTipo,
                "—"
            );

            definirTexto(
                elementos.artistaLocalizacao,
                "—"
            );

            renderizarFoto(
                null,
                dados
            );

            return;
        }


        /*
         * NOME
         */

        definirTexto(
            elementos.artistaNome,
            participante.nome ||
            participante.nomeExibicao ||
            participante.nome_exibicao ||
            "—"
        );


        /*
         * TIPO DE PERFIL
         */

        definirTexto(
            elementos.artistaTipo,
            participante.tipo ||
            participante.tipoPerfil ||
            participante.tipo_perfil ||
            "—"
        );


        /*
         * LOCALIZAÇÃO
         */

        definirTexto(
            elementos.artistaLocalizacao,
            obterLocalizacao(
                participante
            )
        );


        /*
         * FOTO
         */

        renderizarFoto(
            participante,
            dados
        );
    }


    /**
     * Obtém a localização do participante.
     *
     * @param {Object} participante
     * @returns {string}
     */
    function obterLocalizacao(
        participante
    ) {

        if (!participante) {
            return "—";
        }


        const localizacao =
            participante.localizacao;


        if (
            localizacao === null ||
            localizacao === undefined
        ) {

            return "—";
        }


        if (
            typeof localizacao === "string"
        ) {

            return textoSeguro(
                localizacao
            );
        }


        if (
            typeof localizacao === "object"
        ) {

            if (
                localizacao.formatado
            ) {

                return textoSeguro(
                    localizacao.formatado
                );
            }


            if (
                localizacao.endereco
            ) {

                return textoSeguro(
                    localizacao.endereco
                );
            }


            const partes = [
                localizacao.cidade,
                localizacao.estado
            ].filter(
                Boolean
            );


            if (
                partes.length > 0
            ) {

                return partes.join(
                    "/"
                );
            }
        }


        return "—";
    }


    /**
     * Obtém URL da foto do participante.
     *
     * @param {Object} participante
     * @returns {string|null}
     */
    function obterFotoUrl(
        participante
    ) {

        if (!participante) {
            return null;
        }


        const foto =
            participante.fotoUrl ||
            participante.foto_url ||
            participante.foto ||
            participante.avatarUrl ||
            participante.avatar_url ||
            null;


        if (
            foto === null ||
            foto === undefined
        ) {

            return null;
        }


        const url =
            String(foto).trim();


        return url || null;
    }


    /**
     * Renderiza foto do participante.
     *
     * @param {Object|null} participante
     * @param {Object} dados
     */
    function renderizarFoto(
        participante,
        dados
    ) {

        if (
            !elementos.artistaFoto ||
            !elementos.artistaFotoPlaceholder
        ) {

            return;
        }


        const fotoUrl =
            obterFotoUrl(
                participante
            );


        /*
         * Sem foto:
         * mostra placeholder.
         */

        if (!fotoUrl) {

            elementos.artistaFoto.removeAttribute(
                "src"
            );

            elementos.artistaFoto.hidden =
                true;

            elementos.artistaFotoPlaceholder.hidden =
                false;

            return;
        }


        /*
         * Com foto:
         * mostra imagem.
         */

        elementos.artistaFoto.src =
            fotoUrl;

        elementos.artistaFoto.hidden =
            false;

        elementos.artistaFotoPlaceholder.hidden =
            true;


        /*
         * Texto alternativo conforme
         * o participante que está sendo mostrado.
         */

        if (
            usuarioEhRemetente(
                dados
            )
        ) {

            elementos.artistaFoto.alt =
                "Foto do estabelecimento";

        } else {

            elementos.artistaFoto.alt =
                "Foto do profissional";
        }


        /*
         * Caso a URL não possa ser carregada,
         * voltamos para o placeholder.
         */

        elementos.artistaFoto.onerror =
            function () {

                elementos.artistaFoto.onerror =
                    null;

                elementos.artistaFoto.removeAttribute(
                    "src"
                );

                elementos.artistaFoto.hidden =
                    true;

                elementos.artistaFotoPlaceholder.hidden =
                    false;
            };
    }


    /* =====================================================
       SERVIÇO
       ===================================================== */


    /**
     * Renderiza o serviço.
     *
     * @param {Object} dados
     */
    function renderizarServico(
        dados
    ) {

        const servico =
            dados.servico;


        if (!servico) {

            definirVisibilidade(
                elementos.servicoContainer,
                false
            );

            return;
        }


        const nome =
            servico.nomeServico ||
            servico.nome_servico ||
            servico.nome ||
            null;


        if (!nome) {

            definirVisibilidade(
                elementos.servicoContainer,
                false
            );

            return;
        }


        definirTexto(
            elementos.servico,
            nome
        );


        definirVisibilidade(
            elementos.servicoContainer,
            true
        );
    }


    /* =====================================================
       DATA E HORÁRIO
       ===================================================== */


    /**
     * Renderiza data e horário.
     *
     * @param {Object} dados
     */
    function renderizarDataHorario(
        dados
    ) {

        const proposta =
            dados.proposta ||
            dados.contratacao ||
            dados;


        if (!proposta) {
            return;
        }


        const dataEvento =
            proposta.data_evento ||
            proposta.dataEvento ||
            null;


        definirTexto(
            elementos.data,
            formatarData(
                dataEvento
            )
        );


        const inicio =
            proposta.hora_inicio ||
            proposta.horaInicio ||
            proposta.horario_inicio ||
            proposta.horarioInicio ||
            null;


        const fim =
            proposta.hora_fim ||
            proposta.horaFim ||
            proposta.horario_fim ||
            proposta.horarioFim ||
            null;


        definirTexto(
            elementos.horario,
            formatarIntervaloHorario(
                inicio,
                fim
            )
        );
    }


    /* =====================================================
       LOCAL
       ===================================================== */


    /**
     * Renderiza o local.
     *
     * @param {Object} dados
     */
    function renderizarLocal(
        dados
    ) {

        const proposta =
            dados.proposta ||
            dados.contratacao ||
            dados;


        if (!proposta) {
            return;
        }


        let local =
            proposta.local ||
            null;


        if (!local) {

            definirTexto(
                elementos.localNome,
                "—"
            );

            definirTexto(
                elementos.localEndereco,
                "—"
            );

            return;
        }


        /*
         * Caso local venha como JSON em string,
         * tentamos converter.
         */

        if (
            typeof local === "string"
        ) {

            try {

                local =
                    JSON.parse(
                        local
                    );

            } catch (
                erro
            ) {

                /*
                 * Se não for JSON, utilizamos
                 * o conteúdo diretamente como nome.
                 */

                definirTexto(
                    elementos.localNome,
                    local
                );

                definirTexto(
                    elementos.localEndereco,
                    "—"
                );

                return;
            }
        }


        /*
         * Caso ainda não seja objeto,
         * exibimos como texto.
         */

        if (
            typeof local !== "object" ||
            local === null
        ) {

            definirTexto(
                elementos.localNome,
                local
            );

            definirTexto(
                elementos.localEndereco,
                "—"
            );

            return;
        }


        const nomeLocal =
            local.nomeLocal ||
            local.nome_local ||
            local.nome ||
            "—";


        const partesEndereco = [

            local.endereco,

            local.numero
                ? `nº ${local.numero}`
                : null,

            local.complemento,

            local.bairro,

            local.cidade,

            local.estado,

            local.cep
                ? `CEP ${local.cep}`
                : null

        ].filter(
            Boolean
        );


        definirTexto(
            elementos.localNome,
            nomeLocal
        );


        definirTexto(
            elementos.localEndereco,
            partesEndereco.length > 0
                ? partesEndereco.join(
                    ", "
                )
                : "—"
        );
    }


    /* =====================================================
       VALOR
       ===================================================== */


    /**
     * Renderiza valor da proposta.
     *
     * @param {Object} dados
     */
    function renderizarValor(
        dados
    ) {

        const proposta =
            dados.proposta ||
            dados.contratacao ||
            dados;


        if (!proposta) {
            return;
        }


        const valor =
            proposta.valor ||
            proposta.valor_total ||
            proposta.valorTotal ||
            0;


        definirTexto(
            elementos.valor,
            formatarValor(
                valor
            )
        );
    }


    /* =====================================================
       OBSERVAÇÕES
       ===================================================== */


    /**
     * Renderiza observações.
     *
     * @param {Object} dados
     */
    function renderizarObservacoes(
        dados
    ) {

        const proposta =
            dados.proposta ||
            dados.contratacao ||
            dados;


        if (!proposta) {
            return;
        }


        const observacoes =
            proposta.observacoes ||
            proposta.observacao ||
            "";


        if (
            !observacoes ||
            String(observacoes).trim() === ""
        ) {

            definirVisibilidade(
                elementos.observacoesContainer,
                false
            );

            return;
        }


        definirTexto(
            elementos.observacoes,
            observacoes
        );


        definirVisibilidade(
            elementos.observacoesContainer,
            true
        );
    }


    /* =====================================================
       AÇÕES
       ===================================================== */


    /**
     * Renderiza as ações disponíveis.
     *
     * Somente o estabelecimento,
     * que é o destinatário da proposta,
     * pode aceitar ou recusar.
     *
     * @param {Object} dados
     */
    function renderizarAcoes(
        dados
    ) {

        const podeDecidir =
            dados.podeDecidir === true ||
            usuarioEhDestinatario(
                dados
            );


        /*
         * ARTISTA / REMETENTE
         *
         * Não pode aceitar ou recusar.
         */

        if (!podeDecidir) {

            definirVisibilidade(
                elementos.acoes,
                false
            );

            return;
        }


        /*
         * ESTABELECIMENTO / DESTINATÁRIO
         */

        definirVisibilidade(
            elementos.acoes,
            true
        );


        if (elementos.btnAceitar) {

            elementos.btnAceitar.disabled =
                false;
        }


        if (elementos.btnRecusar) {

            elementos.btnRecusar.disabled =
                false;
        }
    }


    /* =====================================================
       ESTADO DE CARREGAMENTO
       ===================================================== */


    /**
     * Mostra carregamento.
     */
    function mostrarCarregamento() {

        definirVisibilidade(
            elementos.loading,
            true
        );

        definirVisibilidade(
            elementos.erro,
            false
        );

        definirVisibilidade(
            elementos.conteudo,
            false
        );
    }


    /**
     * Esconde carregamento.
     */
    function esconderCarregamento() {

        definirVisibilidade(
            elementos.loading,
            false
        );
    }


    /* =====================================================
       ESTADO DE ERRO
       ===================================================== */


    /**
     * Mostra erro.
     *
     * @param {string} mensagem
     */
    function mostrarErro(
        mensagem
    ) {

        definirVisibilidade(
            elementos.loading,
            false
        );

        definirVisibilidade(
            elementos.conteudo,
            false
        );

        definirVisibilidade(
            elementos.erro,
            true
        );


        definirTexto(
            elementos.erroMensagem,
            mensagem,
            "Não foi possível carregar a proposta."
        );
    }


    /* =====================================================
       RENDERIZAÇÃO PRINCIPAL
       ===================================================== */


    /**
     * Função principal esperada pelo controlador.
     *
     * O controlador chama:
     *
     * propostaVisualizacaoRender.renderizar(dados)
     *
     * @param {Object} dados
     */
    function renderizar(
        dados
    ) {

        console.log(
            "🎨 MusicalWorldPropostaVisualizacaoRender: iniciando renderização..."
        );


        if (!dados) {

            console.error(
                "❌ Nenhum dado foi recebido pelo renderizador."
            );

            mostrarErro(
                "Não foi possível obter os dados da proposta."
            );

            return;
        }


        /*
         * Registra no console o papel identificado
         * pelo módulo de dados.
         */

        console.log(
            "👤 Papel do usuário na proposta:",
            dados.papelUsuario
        );

        console.log(
            "📌 É remetente:",
            usuarioEhRemetente(
                dados
            )
        );

        console.log(
            "📌 É destinatário:",
            usuarioEhDestinatario(
                dados
            )
        );


        /*
         * Primeiro definimos o cabeçalho.
         */

        renderizarCabecalho(
            dados
        );


        /*
         * Depois o status.
         */

        renderizarStatus(
            dados
        );


        /*
         * Depois o participante correto.
         *
         * ARTISTA:
         * → estabelecimento
         *
         * ESTABELECIMENTO:
         * → artista
         */

        renderizarParticipante(
            dados
        );


        /*
         * Dados da proposta.
         */

        renderizarServico(
            dados
        );

        renderizarDataHorario(
            dados
        );

        renderizarLocal(
            dados
        );

        renderizarValor(
            dados
        );

        renderizarObservacoes(
            dados
        );


        /*
         * Ações.
         */

        renderizarAcoes(
            dados
        );


        /*
         * Remove carregamento.
         */

        esconderCarregamento();


        /*
         * Exibe o conteúdo somente depois
         * de todos os elementos terem sido
         * preparados.
         */

        definirVisibilidade(
            elementos.erro,
            false
        );

        definirVisibilidade(
            elementos.conteudo,
            true
        );


        console.log(
            "✅ MusicalWorldPropostaVisualizacaoRender: renderização concluída."
        );
    }


    /* =====================================================
       PROCESSAMENTO
       ===================================================== */


    /**
     * Mostra estado de processamento.
     *
     * @param {string} mensagem
     */
    function mostrarProcessando(
        mensagem = "Processando..."
    ) {

        if (
            elementos.processando
        ) {

            const texto =
                elementos.processando.querySelector(
                    "span"
                );

            definirTexto(
                texto,
                mensagem
            );
        }


        definirVisibilidade(
            elementos.processando,
            true
        );


        if (
            elementos.btnAceitar
        ) {

            elementos.btnAceitar.disabled =
                true;
        }


        if (
            elementos.btnRecusar
        ) {

            elementos.btnRecusar.disabled =
                true;
        }
    }


    /**
     * Esconde estado de processamento.
     */
    function esconderProcessando() {

        definirVisibilidade(
            elementos.processando,
            false
        );
    }


    /* =====================================================
       RESULTADO
       ===================================================== */


    /**
     * Mostra resultado de uma operação.
     *
     * @param {Object} config
     */
    function mostrarResultado(
        config = {}
    ) {

        esconderProcessando();


        const tipo =
            config.tipo ||
            "info";


        const titulo =
            config.titulo ||
            "";


        const mensagem =
            config.mensagem ||
            "";


        definirTexto(
            elementos.resultadoTitulo,
            titulo
        );


        definirTexto(
            elementos.resultadoMensagem,
            mensagem
        );


        if (
            elementos.resultado
        ) {

            elementos.resultado.classList.remove(
                "resultado-sucesso",
                "resultado-erro",
                "resultado-info"
            );


            elementos.resultado.classList.add(
                `resultado-${tipo}`
            );
        }


        if (
            elementos.resultadoIcone
        ) {

            if (
                tipo === "sucesso"
            ) {

                elementos.resultadoIcone.innerHTML = `
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;

            } else if (
                tipo === "erro"
            ) {

                elementos.resultadoIcone.innerHTML = `
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                        ></circle>

                        <line
                            x1="15"
                            y1="9"
                            x2="9"
                            y2="15"
                        ></line>

                        <line
                            x1="9"
                            y1="9"
                            x2="15"
                            y2="15"
                        ></line>
                    </svg>
                `;

            } else {

                elementos.resultadoIcone.innerHTML = `
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                        ></circle>

                        <line
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="12"
                        ></line>

                        <line
                            x1="12"
                            y1="16"
                            x2="12.01"
                            y2="16"
                        ></line>
                    </svg>
                `;
            }
        }


        definirVisibilidade(
            elementos.resultado,
            true
        );
    }


    /**
     * Esconde resultado.
     */
    function esconderResultado() {

        definirVisibilidade(
            elementos.resultado,
            false
        );
    }


    /* =====================================================
       RESET
       ===================================================== */


    /**
     * Restaura interface.
     */
    function resetar() {

        esconderProcessando();

        esconderResultado();


        if (
            elementos.btnAceitar
        ) {

            elementos.btnAceitar.disabled =
                false;
        }


        if (
            elementos.btnRecusar
        ) {

            elementos.btnRecusar.disabled =
                false;
        }


        if (
            elementos.artistaFoto
        ) {

            elementos.artistaFoto.removeAttribute(
                "src"
            );

            elementos.artistaFoto.hidden =
                true;
        }


        if (
            elementos.artistaFotoPlaceholder
        ) {

            elementos.artistaFotoPlaceholder.hidden =
                false;
        }


        definirVisibilidade(
            elementos.observacoesContainer,
            false
        );
    }


    /* =====================================================
       API PÚBLICA
       =====================================================

       IMPORTANTE:

       O controlador proposta-visualizacao.js
       espera exatamente estes nomes.

       Principal:
       - renderizar

       Estados:
       - mostrarCarregamento
       - esconderCarregamento
       - mostrarErro
       - mostrarProcessando
       - esconderProcessando
       - mostrarResultado
       - esconderResultado

       Renderizações específicas:
       - renderizarParticipante
       - renderizarStatus
       - renderizarAcoes

       Controle:
       - resetar
       ===================================================== */

    return {

        renderizar,

        mostrarCarregamento,

        esconderCarregamento,

        mostrarErro,

        mostrarProcessando,

        esconderProcessando,

        mostrarResultado,

        esconderResultado,

        renderizarParticipante,

        renderizarStatus,

        renderizarAcoes,

        resetar

    };


})();