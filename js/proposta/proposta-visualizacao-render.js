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
   - Exibir o contexto da oportunidade quando houver.
   - Controlar a apresentação das ações de aceitar/recusar.
   - Exibir estados de carregamento, processamento, erro e resultado.

   Regras atuais da contratação:

   REMETENTE — ESTABELECIMENTO
   - O estabelecimento criou/selecionou a contratação.
   - A proposta foi enviada ao artista.
   - Exibe o artista.
   - Não pode aceitar ou recusar esta proposta.

   DESTINATÁRIO — ARTISTA
   - O artista foi selecionado pelo estabelecimento.
   - A proposta foi recebida pelo artista.
   - Exibe o estabelecimento.
   - Pode aceitar ou recusar a proposta.
   - Visualiza o contexto da oportunidade.

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
           Contexto da oportunidade
           ------------------------------------------------- */

        oportunidadeContexto:
            document.getElementById(
                "propostaOportunidadeContexto"
            ),

        oportunidadeTitulo:
            document.getElementById(
                "propostaOportunidadeTitulo"
            ),


        servicoContainer:
            document.getElementById(
                "propostaServicoContainer"
            ),

        servico:
            document.getElementById(
                "propostaServico"
            ),


        data:
            document.getElementById(
                "propostaData"
            ),

        horario:
            document.getElementById(
                "propostaHorario"
            ),


        localNome:
            document.getElementById(
                "propostaLocalNome"
            ),

        localEndereco:
            document.getElementById(
                "propostaLocalEndereco"
            ),


        valor:
            document.getElementById(
                "propostaValor"
            ),


        observacoesContainer:
            document.getElementById(
                "propostaObservacoesContainer"
            ),

        observacoes:
            document.getElementById(
                "propostaObservacoes"
            ),


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


        processando:
            document.getElementById(
                "propostaProcessando"
            ),


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
     * Regra:
     *
     * contratante_id = estabelecimento
     * contratado_id  = artista
     *
     * Portanto:
     *
     * estabelecimento = remetente
     * artista = destinatário
     */

    function usuarioEhRemetente(
        dados
    ) {

        if (!dados) {
            return false;
        }


        /*
         * Primeiro utiliza o papel já calculado
         * pelo módulo de dados.
         */

        if (
            dados.papelUsuario ===
            "remetente"
        ) {

            return true;
        }


        if (
            dados.usuarioEhRemetente === true
        ) {

            return true;
        }


        /*
         * Fallback:
         *
         * Se o usuário atual for o contratante,
         * ele é o estabelecimento/remetente.
         */

        if (
            dados.usuarioAtualId &&
            dados.contratanteId
        ) {

            return (
                String(
                    dados.usuarioAtualId
                ) ===
                String(
                    dados.contratanteId
                )
            );
        }


        return false;
    }


    /**
     * Verifica se o usuário atual é o destinatário.
     *
     * Regra:
     *
     * contratado_id = artista selecionado
     *
     * Portanto o artista é o destinatário.
     */

    function usuarioEhDestinatario(
        dados
    ) {

        if (!dados) {
            return false;
        }


        /*
         * Primeiro utiliza o papel já calculado
         * pelo módulo de dados.
         */

        if (
            dados.papelUsuario ===
            "destinatario"
        ) {

            return true;
        }


        if (
            dados.usuarioEhDestinatario === true
        ) {

            return true;
        }


        /*
         * Fallback principal:
         *
         * Se o usuário atual for o contratado,
         * ele é o artista/destinatário.
         */

        if (
            dados.usuarioAtualId &&
            dados.contratadoId
        ) {

            return (
                String(
                    dados.usuarioAtualId
                ) ===
                String(
                    dados.contratadoId
                )
            );
        }


        return false;
    }


    /* =====================================================
       PARTICIPANTE EXIBIDO
       ===================================================== */

    function obterParticipanteExibido(
        dados
    ) {

        if (!dados) {
            return null;
        }


        /*
         * ARTISTA / DESTINATÁRIO
         *
         * O artista recebeu a proposta.
         *
         * Portanto ele deve visualizar
         * os dados do estabelecimento.
         */

        if (
            usuarioEhDestinatario(
                dados
            )
        ) {

            return (
                dados.estabelecimento ||
                null
            );
        }


        /*
         * ESTABELECIMENTO / REMETENTE
         *
         * O estabelecimento enviou a proposta.
         *
         * Portanto ele deve visualizar
         * os dados do artista.
         */

        if (
            usuarioEhRemetente(
                dados
            )
        ) {

            return (
                dados.artista ||
                null
            );
        }


        return null;
    }


    /* =====================================================
       CABEÇALHO DA PROPOSTA
       ===================================================== */

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
         * ARTISTA / DESTINATÁRIO
         */

        if (destinatario) {

            definirTexto(
                elementos.cardEyebrow,
                "Proposta recebida"
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
                "Nova proposta"
            );

            definirTexto(
                elementos.headerDescricao,
                "Você foi selecionado para uma oportunidade e recebeu uma proposta de contratação."
            );

            return;
        }


        /*
         * ESTABELECIMENTO / REMETENTE
         */

        if (remetente) {

            definirTexto(
                elementos.cardEyebrow,
                "Proposta enviada"
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
                "Proposta enviada"
            );

            definirTexto(
                elementos.headerDescricao,
                "Acompanhe os detalhes enviados ao profissional."
            );

            return;
        }


        /*
         * FALLBACK
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
       CONTEXTO DA OPORTUNIDADE
       ===================================================== */

    function renderizarOportunidade(
        dados
    ) {

        const contexto =
            elementos.oportunidadeContexto;

        const tituloElemento =
            elementos.oportunidadeTitulo;


        /*
         * Segurança:
         *
         * Se os elementos não existirem no HTML,
         * não interrompe a renderização da proposta.
         */

        if (
            !contexto ||
            !tituloElemento
        ) {

            return;
        }


        /*
         * Somente o ARTISTA selecionado,
         * que é o destinatário,
         * deve visualizar este contexto.
         */

        const destinatario =
            usuarioEhDestinatario(
                dados
            );


        if (!destinatario) {

            definirVisibilidade(
                contexto,
                false
            );

            definirTexto(
                tituloElemento,
                "—"
            );

            return;
        }


        const oportunidade =
            dados &&
            dados.oportunidade
                ? dados.oportunidade
                : null;


        /*
         * A oportunidade foi carregada pelo módulo
         * proposta-visualizacao-dados.js.
         */

        if (!oportunidade) {

            definirVisibilidade(
                contexto,
                false
            );

            definirTexto(
                tituloElemento,
                "—"
            );

            return;
        }


        const titulo =
            oportunidade.titulo ||
            oportunidade.nome ||
            oportunidade.nomeOportunidade ||
            null;


        if (
            !titulo ||
            String(titulo).trim() === ""
        ) {

            definirVisibilidade(
                contexto,
                false
            );

            definirTexto(
                tituloElemento,
                "—"
            );

            return;
        }


        /*
         * Insere somente o nome da oportunidade.
         *
         * O texto:
         *
         * "Você foi selecionado para a oportunidade"
         *
         * já está no HTML.
         */

        definirTexto(
            tituloElemento,
            titulo
        );


        /*
         * Libera o bloco para aparecer na tela.
         */

        definirVisibilidade(
            contexto,
            true
        );


        console.log(
            "Oportunidade exibida para o artista:",
            titulo
        );
    }


    /* =====================================================
       STATUS
       ===================================================== */

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


        const destinatario =
            usuarioEhDestinatario(
                dados
            );


        /*
         * O artista já visualiza "Nova proposta"
         * no cabeçalho principal.
         *
         * Portanto, quando ele é o destinatário,
         * não repetimos esse texto abaixo de
         * "Detalhes do estabelecimento".
         */

        if (
            destinatario &&
            (
                status === "solicitacao_enviada" ||
                status === "aguardando_confirmacao" ||
                status === ""
            )
        ) {

            definirVisibilidade(
                elementos.status,
                false
            );

            return;
        }


        let texto =
            destinatario
                ? "Nova proposta"
                : "Proposta enviada";

        let classe =
            "status-aguardando";


        if (
            status === "solicitacao_enviada" ||
            status === "aguardando_confirmacao"
        ) {

            texto =
                destinatario
                    ? "Nova proposta"
                    : "Proposta enviada";

            classe =
                "status-aguardando";
        }


        else if (
            status === "confirmada"
        ) {

            texto =
                "Proposta confirmada";

            classe =
                "status-confirmada";
        }


        else if (
            status === "recusada"
        ) {

            texto =
                "Proposta recusada";

            classe =
                "status-recusada";
        }


        else if (
            status === "cancelada"
        ) {

            texto =
                "Proposta cancelada";

            classe =
                "status-cancelada";
        }


        else if (
            status === "em_andamento"
        ) {

            texto =
                "Em andamento";

            classe =
                "status-andamento";
        }


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


        definirVisibilidade(
            elementos.status,
            true
        );
    }


    /* =====================================================
       PARTICIPANTE
       ===================================================== */

    function renderizarParticipante(
        dados
    ) {

        const participante =
            obterParticipanteExibido(
                dados
            );


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


        definirTexto(
            elementos.artistaNome,
            participante.nome ||
            participante.nomeExibicao ||
            participante.nome_exibicao ||
            "—"
        );


        definirTexto(
            elementos.artistaTipo,
            participante.tipo ||
            participante.tipoPerfil ||
            participante.tipo_perfil ||
            "—"
        );


        definirTexto(
            elementos.artistaLocalizacao,
            obterLocalizacao(
                participante
            )
        );


        renderizarFoto(
            participante,
            dados
        );
    }


    /* =====================================================
       LOCALIZAÇÃO DO PARTICIPANTE
       ===================================================== */

    function obterLocalizacao(
        participante
    ) {

        if (!participante) {
            return "—";
        }


        if (
            participante.localizacaoFormatada
        ) {

            return textoSeguro(
                participante.localizacaoFormatada
            );
        }


        const localizacao =
            participante.localizacao;


        if (
            typeof localizacao === "string"
        ) {

            return textoSeguro(
                localizacao
            );
        }


        if (
            localizacao &&
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


            const partesLocalizacao = [

                localizacao.cidade,

                localizacao.estado

            ].filter(
                Boolean
            );


            if (
                partesLocalizacao.length > 0
            ) {

                return partesLocalizacao.join(
                    " - "
                );
            }
        }


        const partes = [

            participante.cidade,

            participante.estado

        ].filter(
            Boolean
        );


        if (
            partes.length > 0
        ) {

            return partes.join(
                " - "
            );
        }


        return "—";
    }


    /* =====================================================
       FOTO
       ===================================================== */

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


        elementos.artistaFoto.src =
            fotoUrl;

        elementos.artistaFoto.hidden =
            false;

        elementos.artistaFotoPlaceholder.hidden =
            true;


        if (
            usuarioEhDestinatario(
                dados
            )
        ) {

            elementos.artistaFoto.alt =
                "Foto do estabelecimento";

        } else {

            elementos.artistaFoto.alt =
                "Foto do profissional";
        }


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
            proposta.valor ??
            proposta.valor_total ??
            proposta.valorTotal ??
            dados.oportunidade?.valor ??
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
            dados.oportunidade?.descricao ||
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

    function renderizarAcoes(
        dados
    ) {

        const podeDecidir =
            dados.podeDecidir === true ||
            usuarioEhDestinatario(
                dados
            );


        /*
         * Somente o artista selecionado,
         * que é o destinatário,
         * pode decidir sobre a proposta.
         */

        if (!podeDecidir) {

            definirVisibilidade(
                elementos.acoes,
                false
            );

            return;
        }


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


    function esconderCarregamento() {

        definirVisibilidade(
            elementos.loading,
            false
        );
    }


    /* =====================================================
       ESTADO DE ERRO
       ===================================================== */

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

    function renderizar(
        dados
    ) {

        console.log(
            "MusicalWorldPropostaVisualizacaoRender: iniciando renderização..."
        );


        if (!dados) {

            console.error(
                "Nenhum dado foi recebido pelo renderizador."
            );

            mostrarErro(
                "Não foi possível obter os dados da proposta."
            );

            return;
        }


        console.log(
            "Dados da oportunidade recebidos:",
            dados.oportunidade
        );


        console.log(
            "Título da oportunidade:",
            dados.oportunidade?.titulo
        );


        console.log(
            "Papel do usuário:",
            dados.papelUsuario
        );


        console.log(
            "Usuário atual:",
            dados.usuarioAtualId
        );


        console.log(
            "Contratante:",
            dados.contratanteId
        );


        console.log(
            "Contratado:",
            dados.contratadoId
        );


        console.log(
            "É remetente:",
            usuarioEhRemetente(
                dados
            )
        );


        console.log(
            "É destinatário:",
            usuarioEhDestinatario(
                dados
            )
        );


        /*
         * Cabeçalho.
         */

        renderizarCabecalho(
            dados
        );


        /*
         * Status.
         */

        renderizarStatus(
            dados
        );


        /*
         * Participante.
         */

        renderizarParticipante(
            dados
        );


        /*
         * CONTEXTO DA OPORTUNIDADE
         *
         * Esta chamada é obrigatória.
         *
         * O título vem de:
         *
         * dados.oportunidade.titulo
         *
         * e o bloco só aparece para o artista
         * selecionado.
         */

        renderizarOportunidade(
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


        esconderCarregamento();


        definirVisibilidade(
            elementos.erro,
            false
        );

        definirVisibilidade(
            elementos.conteudo,
            true
        );


        console.log(
            "MusicalWorldPropostaVisualizacaoRender: renderização concluída."
        );
    }


    /* =====================================================
       PROCESSAMENTO
       ===================================================== */

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


    function esconderProcessando() {

        definirVisibilidade(
            elementos.processando,
            false
        );
    }


    /* =====================================================
       RESULTADO
       ===================================================== */

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


    function esconderResultado() {

        definirVisibilidade(
            elementos.resultado,
            false
        );
    }


    /* =====================================================
       RESET
       ===================================================== */

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
            elementos.oportunidadeContexto,
            false
        );


        definirTexto(
            elementos.oportunidadeTitulo,
            "—"
        );


        definirVisibilidade(
            elementos.observacoesContainer,
            false
        );


        /*
         * O status pode ter sido ocultado para o artista.
         * No reset ele precisa voltar ao estado inicial,
         * para que uma nova renderização decida novamente
         * se deve exibi-lo ou ocultá-lo.
         */

        definirVisibilidade(
            elementos.status,
            true
        );
    }


    /* =====================================================
       API PÚBLICA
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

        renderizarOportunidade,

        resetar

    };


})();