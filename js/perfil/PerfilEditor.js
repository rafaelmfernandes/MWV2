const PerfilEditor = (() => {
    "use strict";


    /*
     * ============================================================
     * PERFIL EDITOR
     * ============================================================
     *
     * Motor universal do editor de perfil.
     *
     * Responsabilidades:
     * - sessão;
     * - carregamento do usuário;
     * - carregamento do perfil;
     * - carregamento do perfil artístico;
     * - preenchimento do formulário;
     * - upload da foto;
     * - salvamento de Sobre;
     * - integração dos módulos;
     * - eventos gerais da página;
     * - navegação;
     *
     * Não contém regras específicas de serviços,
     * portfólio ou agenda.
     */


    const CONFIG = {
        paginaAtual: "editar-perfil-cantor-v2.html",

        paginaPerfil: "meu-perfil-cantor.html",

        buckets: {
            foto: "perfil-musico",
            portfolio: "portfolio-musicos"
        },

        tabelas: {
            usuarios: "usuarios",
            perfis: "perfis",
            tiposPerfil: "tipos_perfil",
            perfisArtistas: "perfis_artistas"
        }
    };


    const estado = {
        usuarioAuth: null,

        usuario: null,

        perfil: null,

        perfilArtista: null,

        fotoArquivo: null,

        salvando: false,

        abaAtual: "sobre",

        portfolio: [],

        agenda: [],

        tipoMedia: "imagem",

        editandoPortfolioId: null,

        editandoAgendaId: null,

        servicosValores: [],

        editandoServicoId: null
    };


    const ids = {
        nome: "nome",
        nomeExibicao: "nomeExibicao",
        telefone: "telefone",
        localizacao: "localizacao",
        descricao: "descricao",
        experiencia: "experiencia",
        areaAtendimento: "areaAtendimento",
        tipoArtista: "tipoArtista",
        disponivel: "disponivel",
        emailConta: "emailConta",

        avatarImage: "avatarImage",
        avatarInitials: "avatarInitials",
        fotoInput: "fotoInput",
        btnFoto: "btnFoto",

        form: "formEditarPerfil",
        btnSalvar: "btnSalvar",
        btnSalvarTopo: "btnSalvarTopo",
        btnVoltar: "btnVoltar",
        btnCancelar: "btnCancelar",

        contadorDescricao: "contadorDescricao",

        portfolioTitulo: "portfolioTitulo",
        portfolioDescricao: "portfolioDescricao",
        portfolioArquivo: "portfolioArquivo",
        portfolioUrl: "portfolioUrl",
        portfolioAjuda: "portfolioAjuda",
        btnAdicionarPortfolio: "btnAdicionarPortfolio",
        portfolioEditList: "portfolioEditList",

        agendaTitulo: "agendaTitulo",
        agendaTipo: "agendaTipo",
        agendaInicio: "agendaInicio",
        agendaFim: "agendaFim",
        agendaLocalizacao: "agendaLocalizacao",
        agendaDescricao: "agendaDescricao",
        agendaStatus: "agendaStatus",
        btnAdicionarAgenda: "btnAdicionarAgenda",
        agendaEditList: "agendaEditList",

        servicoNome: "servicoNome",
        servicoDescricao: "servicoDescricao",
        servicoDuracao: "servicoDuracao",
        servicoTipoPreco: "servicoTipoPreco",
        servicoValor: "servicoValor",
        servicoAtivo: "servicoAtivo",
        campoValorServico: "campoValorServico",
        btnAdicionarServico: "btnAdicionarServico",
        btnCancelarServico: "btnCancelarServico",
        servicosList: "servicosList",

        toast: "toast",
        toastMessage: "toastMessage",

        loadingOverlay: "loadingOverlay",
        loadingText: "loadingText"
    };


    const contexto = {
        CONFIG,

        estado,

        ids,

        get supabase() {
            return window.supabaseClient;
        },

        get el() {
            return window.PerfilUtils.el;
        },

        get utils() {
            return window.PerfilUtils;
        }
    };


    /*
     * ============================================================
     * ELEMENTOS
     * ============================================================
     */

    function el(id) {
        return document.getElementById(id);
    }


    /*
     * ============================================================
     * CONFIGURAÇÃO DOS MÓDULOS
     * ============================================================
     */

    function configurarModulos() {

        if (
            window.PerfilAbas &&
            typeof window.PerfilAbas.configurar === "function"
        ) {
            window.PerfilAbas.configurar(contexto);
        }


        if (
            window.PerfilPortfolio &&
            typeof window.PerfilPortfolio.configurar === "function"
        ) {
            window.PerfilPortfolio.configurar(contexto);
        }


        if (
            window.PerfilAgenda &&
            typeof window.PerfilAgenda.configurar === "function"
        ) {
            window.PerfilAgenda.configurar(contexto);
        }


        if (
            window.PerfilServicos &&
            typeof window.PerfilServicos.configurar === "function"
        ) {
            window.PerfilServicos.configurar(contexto);
        }


        if (
            window.PerfilInstrumentos &&
            typeof window.PerfilInstrumentos.configurar === "function"
        ) {
            window.PerfilInstrumentos.configurar(contexto);
        }
    }


    /*
     * ============================================================
     * NORMALIZAÇÃO DO TIPO ARTÍSTICO
     * ============================================================
     *
     * Localiza corretamente o tipo salvo no banco dentro
     * das opções existentes no <select>.
     *
     * Não altera o valor do banco.
     */

    function preencherTipoArtista(campoTipo, tipoBanco) {

        if (!campoTipo) {
            return;
        }


        const tipoSalvo =
            String(tipoBanco || "").trim();


        if (!tipoSalvo) {
            return;
        }


        /*
         * Primeiro tenta igualdade exata.
         */

        const opcaoExata =
            Array.from(campoTipo.options || []).find(
                (opcao) =>
                    String(opcao.value || "").trim() === tipoSalvo
            );


        if (opcaoExata) {
            campoTipo.value =
                opcaoExata.value;

            return;
        }


        /*
         * Depois tenta comparação normalizada.
         */

        let tipoNormalizado =
            tipoSalvo;


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.normalizarTipoArtista === "function"
        ) {
            tipoNormalizado =
                window.PerfilUtils.normalizarTipoArtista(
                    tipoSalvo
                );
        }


        const opcaoNormalizada =
            Array.from(campoTipo.options || []).find(
                (opcao) => {

                    const valorOpcao =
                        String(
                            opcao.value || ""
                        ).trim();


                    const textoOpcao =
                        String(
                            opcao.textContent || ""
                        ).trim();


                    let valorNormalizado =
                        valorOpcao;


                    let textoNormalizado =
                        textoOpcao;


                    if (
                        window.PerfilUtils &&
                        typeof window.PerfilUtils.normalizarTipoArtista === "function"
                    ) {
                        valorNormalizado =
                            window.PerfilUtils.normalizarTipoArtista(
                                valorOpcao
                            );

                        textoNormalizado =
                            window.PerfilUtils.normalizarTipoArtista(
                                textoOpcao
                            );
                    }


                    return (
                        valorNormalizado === tipoNormalizado ||
                        textoNormalizado === tipoNormalizado
                    );
                }
            );


        if (opcaoNormalizada) {
            campoTipo.value =
                opcaoNormalizada.value;

            return;
        }


        /*
         * Última tentativa:
         * comparação sem acentos, espaços e caixa.
         */

        const limpar =
            (valor) =>
                String(valor || "")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, "")
                    .toLowerCase();


        const tipoLimpo =
            limpar(tipoSalvo);


        const opcaoFlexivel =
            Array.from(campoTipo.options || []).find(
                (opcao) =>
                    limpar(opcao.value) === tipoLimpo ||
                    limpar(opcao.textContent) === tipoLimpo
            );


        if (opcaoFlexivel) {
            campoTipo.value =
                opcaoFlexivel.value;

            return;
        }


        console.warn(
            "Não foi possível localizar o tipo artístico no select:",
            tipoSalvo
        );
    }


    /*
     * ============================================================
     * CARREGAMENTO DO PERFIL
     * ============================================================
     */

    async function carregarDados() {

        try {

            if (!window.Sessao) {
                throw new Error(
                    "Módulo Sessao não carregado."
                );
            }


            estado.usuarioAuth =
                await window.Sessao.usuarioAtual();


            if (!estado.usuarioAuth) {

                sessionStorage.setItem(
                    "musicalworld_destino_login",
                    CONFIG.paginaAtual
                );


                window.location.href =
                    "login.html";


                return;
            }


            if (!contexto.supabase) {
                throw new Error(
                    "SupabaseClient não foi carregado."
                );
            }


            /*
             * ----------------------------------------------------
             * USUÁRIO
             * ----------------------------------------------------
             */

            const {
                data: usuario,
                error: erroUsuario
            } = await contexto.supabase
                .from(CONFIG.tabelas.usuarios)
                .select(
                    "id,nome,email,telefone,foto_url,ativo"
                )
                .eq(
                    "id",
                    estado.usuarioAuth.id
                )
                .maybeSingle();


            if (erroUsuario) {
                throw erroUsuario;
            }


            estado.usuario =
                usuario || {

                    id:
                        estado.usuarioAuth.id,

                    nome:
                        estado.usuarioAuth.user_metadata?.nome ||
                        estado.usuarioAuth.email ||
                        "Usuário",

                    email: estado.usuarioAuth?.email || estado.usuarioAuth?.user?.email || "",

                    telefone:
                        null,

                    foto_url:
                        null,

                    ativo:
                        true
                };


            /*
             * ----------------------------------------------------
             * PERFIL
             * ----------------------------------------------------
             */

            const {
                data: perfis,
                error: erroPerfil
            } = await contexto.supabase
                .from(CONFIG.tabelas.perfis)
                .select(
                    "id,usuario_id,tipo_perfil_id,nome_exibicao,descricao,ativo,tipos_perfil(id,nome,descricao)"
                )
                .eq(
                    "usuario_id",
                    estado.usuarioAuth.id
                )
                .eq(
                    "ativo",
                    true
                );


            if (erroPerfil) {
                throw erroPerfil;
            }


            const perfilArtistaTipo =
                (perfis || []).find(
                    (perfil) => {

                        const nomeTipo =
                            perfil?.tipos_perfil?.nome ||
                            "";


                        return (
                            String(nomeTipo)
                                .trim()
                                .toLowerCase() ===
                            "artista"
                        );
                    }
                );


            if (!perfilArtistaTipo) {
                throw new Error(
                    "Perfil artístico não encontrado."
                );
            }


            estado.perfil =
                perfilArtistaTipo;


            /*
             * ----------------------------------------------------
             * PERFIL ARTÍSTICO
             * ----------------------------------------------------
             */

            const {
                data: perfilArtista,
                error: erroPerfilArtista
            } = await contexto.supabase
                .from(CONFIG.tabelas.perfisArtistas)
                .select(
                    "id,perfil_id,tipo_artista,localizacao,experiencia,area_atendimento,disponivel,instrumentos,estilos,servicos,foto_url,created_at,updated_at"
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                )
                .maybeSingle();


            if (erroPerfilArtista) {
                throw erroPerfilArtista;
            }


            estado.perfilArtista =
                perfilArtista || {

                    id:
                        null,

                    perfil_id:
                        estado.perfil.id,

                    tipo_artista:
                        window.PerfilCantor?.tipo ||
                        "Cantor(a)",

                    localizacao:
                        null,

                    experiencia:
                        null,

                    area_atendimento:
                        null,

                    disponivel:
                        true,

                    instrumentos:
                        [],

                    estilos:
                        [],

                    servicos:
                        [],

                    foto_url:
                        null
                };


            /*
             * ----------------------------------------------------
             * TIPO ARTÍSTICO ATUAL
             * ----------------------------------------------------
             */

            const tipoAtual =
                window.PerfilUtils &&
                typeof window.PerfilUtils.normalizarTipoArtista === "function"
                    ? window.PerfilUtils.normalizarTipoArtista(
                        estado.perfilArtista.tipo_artista
                    )
                    : String(
                        estado.perfilArtista.tipo_artista ||
                        "Cantor(a)"
                    ).trim();


            /*
             * Guarda explicitamente o tipo que veio do banco.
             *
             * Isso é importante para que o botão Salvar possa
             * usar o tipo existente mesmo que o select não tenha
             * conseguido encontrar visualmente a opção.
             */

            estado.perfilArtista.tipo_artista =
                estado.perfilArtista.tipo_artista ||
                tipoAtual;


            /*
             * ----------------------------------------------------
             * VERIFICAÇÃO DO TIPO
             * ----------------------------------------------------
             */

            if (
                window.PerfilCantor &&
                typeof window.PerfilCantor.tipoValido === "function" &&
                !window.PerfilCantor.tipoValido(tipoAtual)
            ) {

                console.warn(
                    "Tipo artístico não reconhecido:",
                    tipoAtual
                );
            }


            if (
                window.PerfilCantor &&
                tipoAtual !== window.PerfilCantor.tipo
            ) {

                const pagina =
                    window.PerfilCantor.obterPaginaPorTipoArtista(
                        tipoAtual
                    );


                if (
                    pagina &&
                    pagina !== CONFIG.paginaAtual
                ) {

                    window.location.href =
                        pagina;

                    return;
                }
            }


            /*
             * ----------------------------------------------------
             * PREENCHIMENTO
             * ----------------------------------------------------
             */

            preencherFormulario();


            /*
             * ----------------------------------------------------
             * MÓDULOS
             * ----------------------------------------------------
             */

            if (
                window.PerfilPortfolio &&
                typeof window.PerfilPortfolio.carregar === "function"
            ) {
                await window.PerfilPortfolio.carregar();
            }


            if (
                window.PerfilAgenda &&
                typeof window.PerfilAgenda.carregar === "function"
            ) {
                await window.PerfilAgenda.carregar();
            }


            if (
                window.PerfilServicos &&
                typeof window.PerfilServicos.carregar === "function"
            ) {
                await window.PerfilServicos.carregar();
            }

        } catch (erro) {

            console.error(
                "Erro ao carregar perfil:",
                erro
            );


            const mensagem =
                erro?.message ||
                "Não foi possível carregar seu perfil.";


            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.mostrarToast === "function"
            ) {

                window.PerfilUtils.mostrarToast(
                    mensagem,
                    "erro"
                );

            } else {

                alert(mensagem);
            }
        }
    }


    /*
     * ============================================================
     * PREENCHER FORMULÁRIO
     * ============================================================
     */

    function preencherFormulario() {

        const usuario =
            estado.usuario || {};


        const perfil =
            estado.perfil || {};


        const artista =
            estado.perfilArtista || {};


        const campoNome =
            el(ids.nome);


        const campoNomeExibicao =
            el(ids.nomeExibicao);


        const campoTelefone =
            el(ids.telefone);


        const campoLocalizacao =
            el(ids.localizacao);


        const campoDescricao =
            el(ids.descricao);


        const campoExperiencia =
            el(ids.experiencia);


        const campoArea =
            el(ids.areaAtendimento);


        const campoTipo =
            el(ids.tipoArtista);


        const campoDisponivel =
            el(ids.disponivel);


        const campoEmail =
            el(ids.emailConta);


        /*
         * --------------------------------------------------------
         * NOME
         * --------------------------------------------------------
         */

        if (campoNome) {

            campoNome.value =
                usuario.nome || "";
        }


        /*
         * --------------------------------------------------------
         * NOME DE EXIBIÇÃO
         * --------------------------------------------------------
         */

        if (campoNomeExibicao) {

            campoNomeExibicao.value =
                perfil.nome_exibicao ||
                usuario.nome ||
                "";
        }


        /*
         * --------------------------------------------------------
         * TELEFONE
         * --------------------------------------------------------
         */

        if (campoTelefone) {

            campoTelefone.value =
                usuario.telefone || "";
        }


        /*
         * --------------------------------------------------------
         * LOCALIZAÇÃO
         * --------------------------------------------------------
         */

        if (campoLocalizacao) {

            campoLocalizacao.value =
                artista.localizacao || "";
        }


        /*
         * --------------------------------------------------------
         * DESCRIÇÃO
         * --------------------------------------------------------
         */

        if (campoDescricao) {

            campoDescricao.value =
                perfil.descricao || "";
        }


        /*
         * --------------------------------------------------------
         * EXPERIÊNCIA
         * --------------------------------------------------------
         */

        if (campoExperiencia) {

            campoExperiencia.value =
                artista.experiencia || "";
        }


        /*
         * --------------------------------------------------------
         * ÁREA DE ATENDIMENTO
         * --------------------------------------------------------
         */

        if (campoArea) {

            campoArea.value =
                artista.area_atendimento || "";
        }


        /*
         * --------------------------------------------------------
         * TIPO DE ARTISTA
         * --------------------------------------------------------
         *
         * Agora o valor existente no banco é usado como fonte
         * principal.
         */

        if (campoTipo) {

            const tipoBanco =
                String(
                    artista.tipo_artista || ""
                ).trim();


            const tipoPadrao =
                window.PerfilCantor?.tipo ||
                "Cantor(a)";


            const tipoParaExibir =
                tipoBanco ||
                tipoPadrao;


            preencherTipoArtista(
                campoTipo,
                tipoParaExibir
            );


            /*
             * Se não houver nenhuma opção correspondente,
             * tentamos diretamente o valor salvo.
             */

            if (!campoTipo.value && tipoParaExibir) {

                campoTipo.value =
                    tipoParaExibir;
            }


            /*
             * Guarda o tipo que realmente está sendo utilizado
             * pelo perfil.
             */

            if (
                !estado.perfilArtista.tipo_artista
            ) {

                estado.perfilArtista.tipo_artista =
                    tipoParaExibir;
            }
        }


        /*
         * --------------------------------------------------------
         * DISPONIBILIDADE
         * --------------------------------------------------------
         */

        if (campoDisponivel) {

            campoDisponivel.checked =
                artista.disponivel !== false;
        }


        /*
         * --------------------------------------------------------
         * EMAIL
         * --------------------------------------------------------
         */

     

        if (campoEmail) {

            const emailAuth =
                estado.usuarioAuth?.email ||
                estado.usuarioAuth?.user?.email ||
                "";

            const emailBanco =
                estado.usuario?.email ||
                "";

            const email =
                emailAuth ||
                emailBanco ||
                "";

            campoEmail.textContent =
                email || "Não informado";
        }


        /*
         * --------------------------------------------------------
         * CHIPS
         * --------------------------------------------------------
         */

        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.marcarChips === "function"
        ) {

            window.PerfilUtils.marcarChips(
                "estilos",
                artista.estilos || []
            );


            window.PerfilUtils.marcarChips(
                "servicos",
                artista.servicos || []
            );


            window.PerfilUtils.marcarChips(
                "instrumentos",
                artista.instrumentos || []
            );
        }


        atualizarContador();

        preencherAvatar();
    }


    /*
     * ============================================================
     * AVATAR
     * ============================================================
     */

    function preencherAvatar() {

        const imagem =
            el(ids.avatarImage);


        const iniciais =
            el(ids.avatarInitials);


        const foto =
            estado.perfilArtista?.foto_url ||
            estado.usuario?.foto_url ||
            "";


        if (foto) {

            if (imagem) {

                imagem.src =
                    foto;

                imagem.style.display =
                    "block";
            }


            if (iniciais) {

                iniciais.style.display =
                    "none";
            }


            return;
        }


        const nome =
            estado.perfil?.nome_exibicao ||
            estado.usuario?.nome ||
            "";


        const textoIniciais =
            window.PerfilUtils &&
            typeof window.PerfilUtils.obterIniciais === "function"

                ? window.PerfilUtils.obterIniciais(nome)

                : "MW";


        if (imagem) {

            imagem.removeAttribute("src");

            imagem.style.display =
                "none";
        }


        if (iniciais) {

            iniciais.textContent =
                textoIniciais;

            iniciais.style.display =
                "flex";
        }
    }


    /*
     * ============================================================
     * UPLOAD DA FOTO
     * ============================================================
     */

    async function fazerUploadFoto() {

        if (!estado.fotoArquivo) {

            return (
                estado.perfilArtista?.foto_url ||
                estado.usuario?.foto_url ||
                null
            );
        }


        const arquivo =
            estado.fotoArquivo;


        const extensao =
            arquivo.name
                .split(".")
                .pop()
                .toLowerCase();


        const caminho =
            `${estado.usuarioAuth.id}/perfil.${extensao}`;


        const {
            error: erroUpload
        } = await contexto.supabase
            .storage
            .from(CONFIG.buckets.foto)
            .upload(
                caminho,
                arquivo,
                {
                    upsert: true,

                    cacheControl: "3600",

                    contentType:
                        arquivo.type
                }
            );


        if (erroUpload) {
            throw erroUpload;
        }


        const {
            data
        } = contexto.supabase
            .storage
            .from(CONFIG.buckets.foto)
            .getPublicUrl(
                caminho
            );


        return (
            data?.publicUrl ||
            null
        );
    }


    /*
     * ============================================================
     * SALVAR SOBRE
     * ============================================================
     */

    async function salvarSobre() {

        if (estado.salvando) {
            return;
        }


        const nome =
            String(
                el(ids.nome)?.value || ""
            ).trim();


        const nomeExibicao =
            String(
                el(ids.nomeExibicao)?.value || ""
            ).trim();


        const telefone =
            String(
                el(ids.telefone)?.value || ""
            ).trim();


        const localizacao =
            String(
                el(ids.localizacao)?.value || ""
            ).trim();


        const descricao =
            String(
                el(ids.descricao)?.value || ""
            ).trim();


        const experiencia =
            String(
                el(ids.experiencia)?.value || ""
            ).trim();


        const areaAtendimento =
            String(
                el(ids.areaAtendimento)?.value || ""
            ).trim();


        /*
         * --------------------------------------------------------
         * TIPO SELECIONADO
         * --------------------------------------------------------
         *
         * Primeiro tenta pegar o select.
         * Se estiver vazio, usa o tipo que já existe no banco.
         */

        const tipoSelecionadoCampo =
            String(
                el(ids.tipoArtista)?.value || ""
            ).trim();


        const tipoCadastrado =
            String(
                estado.perfilArtista?.tipo_artista || ""
            ).trim();


        const tipoSelecionado =
            tipoSelecionadoCampo ||
            tipoCadastrado ||
            window.PerfilCantor?.tipo ||
            "Cantor(a)";


        const disponivel =
            Boolean(
                el(ids.disponivel)?.checked
            );


        /*
         * --------------------------------------------------------
         * VALIDAÇÕES
         * --------------------------------------------------------
         */

        if (!nome) {

            window.PerfilUtils.mostrarToast(
                "Informe seu nome.",
                "erro"
            );


            el(ids.nome)?.focus();

            return;
        }


        if (!nomeExibicao) {

            window.PerfilUtils.mostrarToast(
                "Informe o nome que será exibido no perfil.",
                "erro"
            );


            el(ids.nomeExibicao)?.focus();

            return;
        }


        if (descricao.length > 1000) {

            window.PerfilUtils.mostrarToast(
                "A descrição deve ter no máximo 1000 caracteres.",
                "erro"
            );


            el(ids.descricao)?.focus();

            return;
        }


        if (
            !window.PerfilUtils ||
            typeof window.PerfilUtils.normalizarTipoArtista !== "function"
        ) {

            throw new Error(
                "PerfilUtils não está disponível."
            );
        }


        /*
         * Normaliza o tipo efetivo.
         */

        const novoTipo =
            window.PerfilUtils.normalizarTipoArtista(
                tipoSelecionado
            );


        /*
         * --------------------------------------------------------
         * IMPORTANTE
         * --------------------------------------------------------
         *
         * Não exigimos mais que o usuário selecione o tipo
         * manualmente se ele já possui um tipo cadastrado.
         *
         * Só haverá erro se realmente não existir nenhum tipo
         * disponível.
         */

        if (!novoTipo) {

            window.PerfilUtils.mostrarToast(
                "Selecione seu tipo de perfil.",
                "erro"
            );


            el(ids.tipoArtista)?.focus();

            return;
        }


        /*
         * --------------------------------------------------------
         * VALIDADE DO TIPO
         * --------------------------------------------------------
         */

        if (
            window.PerfilCantor &&
            typeof window.PerfilCantor.tipoValido === "function" &&
            !window.PerfilCantor.tipoValido(novoTipo)
        ) {

            window.PerfilUtils.mostrarToast(
                "O tipo de perfil selecionado não é válido.",
                "erro"
            );

            return;
        }


        /*
         * --------------------------------------------------------
         * TIPO ATUAL CADASTRADO
         * --------------------------------------------------------
         */

        const tipoAtual =
            window.PerfilUtils.normalizarTipoArtista(
                estado.perfilArtista?.tipo_artista ||
                novoTipo ||
                "Cantor(a)"
            );


        const tipoAlterado =
            novoTipo !== tipoAtual;


        /*
         * --------------------------------------------------------
         * CONFIRMAÇÃO DE ALTERAÇÃO DE TIPO
         * --------------------------------------------------------
         */

        if (tipoAlterado) {

            const confirmar =
                window.confirm(
                    `Você está alterando seu tipo de perfil de "${tipoAtual}" para "${novoTipo}". Deseja continuar?`
                );


            if (!confirmar) {
                return;
            }
        }


        estado.salvando =
            true;


        const botoesSalvar = [
            el(ids.btnSalvar),
            el(ids.btnSalvarTopo)
        ].filter(Boolean);


        botoesSalvar.forEach(
            (botao) => {
                botao.disabled =
                    true;
            }
        );


        if (
            window.PerfilUtils &&
            typeof window.PerfilUtils.mostrarLoading === "function"
        ) {

            window.PerfilUtils.mostrarLoading(
                "Salvando perfil..."
            );
        }


        try {

            /*
             * ----------------------------------------------------
             * CHIPS
             * ----------------------------------------------------
             */

            const instrumentos =
                typeof window.PerfilUtils.obterChipsSelecionados === "function"

                    ? window.PerfilUtils.obterChipsSelecionados(
                        "instrumentos"
                    )

                    : [];


            const estilos =
                typeof window.PerfilUtils.obterChipsSelecionados === "function"

                    ? window.PerfilUtils.obterChipsSelecionados(
                        "estilos"
                    )

                    : [];


            const servicos =
                typeof window.PerfilUtils.obterChipsSelecionados === "function"

                    ? window.PerfilUtils.obterChipsSelecionados(
                        "servicos"
                    )

                    : [];


            /*
             * ----------------------------------------------------
             * FOTO
             * ----------------------------------------------------
             */

            const fotoUrl =
                await fazerUploadFoto();


            const agora =
                new Date().toISOString();


            /*
             * ----------------------------------------------------
             * USUARIOS
             * ----------------------------------------------------
             */

            const {
                error: erroUsuario
            } = await contexto.supabase
                .from(CONFIG.tabelas.usuarios)
                .update({

                    nome,

                    telefone:
                        telefone || null,

                    foto_url:
                        fotoUrl
                })
                .eq(
                    "id",
                    estado.usuarioAuth.id
                );


            if (erroUsuario) {
                throw erroUsuario;
            }


            /*
             * ----------------------------------------------------
             * PERFIS
             * ----------------------------------------------------
             */

            const {
                error: erroPerfil
            } = await contexto.supabase
                .from(CONFIG.tabelas.perfis)
                .update({

                    nome_exibicao:
                        nomeExibicao,

                    descricao:
                        descricao || null,

                    updated_at:
                        agora
                })
                .eq(
                    "id",
                    estado.perfil.id
                )
                .eq(
                    "usuario_id",
                    estado.usuarioAuth.id
                );


            if (erroPerfil) {
                throw erroPerfil;
            }


            /*
             * ----------------------------------------------------
             * PERFIS_ARTISTAS
             * ----------------------------------------------------
             */

            const dadosArtista = {

                tipo_artista:
                    tipoAlterado
                        ? novoTipo
                        : tipoAtual,

                localizacao:
                    localizacao || null,

                experiencia:
                    experiencia || null,

                area_atendimento:
                    areaAtendimento || null,

                disponivel,

                instrumentos,

                estilos,

                servicos,

                foto_url:
                    fotoUrl,

                updated_at:
                    agora
            };


            if (estado.perfilArtista?.id) {

                const {
                    error: erroAtualizacaoArtista
                } = await contexto.supabase
                    .from(
                        CONFIG.tabelas.perfisArtistas
                    )
                    .update(
                        dadosArtista
                    )
                    .eq(
                        "id",
                        estado.perfilArtista.id
                    )
                    .eq(
                        "perfil_id",
                        estado.perfil.id
                    );


                if (erroAtualizacaoArtista) {
                    throw erroAtualizacaoArtista;
                }

            } else {

                const {
                    error: erroInsercaoArtista
                } = await contexto.supabase
                    .from(
                        CONFIG.tabelas.perfisArtistas
                    )
                    .insert({

                        perfil_id:
                            estado.perfil.id,

                        ...dadosArtista
                    });


                if (erroInsercaoArtista) {
                    throw erroInsercaoArtista;
                }
            }


            /*
             * ----------------------------------------------------
             * ATUALIZA ESTADO LOCAL
             * ----------------------------------------------------
             */

            estado.usuario = {
                ...estado.usuario,

                nome,

                telefone:
                    telefone || null,

                foto_url:
                    fotoUrl
            };


            estado.perfil = {
                ...estado.perfil,

                nome_exibicao:
                    nomeExibicao,

                descricao:
                    descricao || null
            };


            estado.perfilArtista = {
                ...estado.perfilArtista,

                ...dadosArtista,

                perfil_id:
                    estado.perfil.id
            };


            estado.fotoArquivo =
                null;


            /*
             * Garante que o select fique atualizado após o
             * salvamento.
             */

            const campoTipo =
                el(ids.tipoArtista);


            if (campoTipo) {

                preencherTipoArtista(
                    campoTipo,
                    dadosArtista.tipo_artista
                );
            }


            preencherAvatar();


            /*
             * ----------------------------------------------------
             * ALTERAÇÃO DE TIPO
             * ----------------------------------------------------
             */

            if (tipoAlterado) {

                const pagina =
                    window.PerfilCantor &&
                    typeof window.PerfilCantor.obterPaginaPorTipoArtista === "function"

                        ? window.PerfilCantor.obterPaginaPorTipoArtista(
                            novoTipo
                        )

                        : null;


                if (
                    pagina &&
                    pagina !== CONFIG.paginaAtual
                ) {

                    window.location.href =
                        pagina;

                    return;
                }
            }


            window.PerfilUtils.mostrarToast(
                "Perfil salvo com sucesso.",
                "sucesso"
            );

        } catch (erro) {

            console.error(
                "Erro ao salvar perfil:",
                erro
            );


            window.PerfilUtils.mostrarToast(
                erro?.message ||
                "Não foi possível salvar o perfil.",
                "erro"
            );

        } finally {

            estado.salvando =
                false;


            botoesSalvar.forEach(
                (botao) => {
                    botao.disabled =
                        false;
                }
            );


            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.esconderLoading === "function"
            ) {

                window.PerfilUtils.esconderLoading();
            }


            window.PerfilUtils.atualizarIcones();
        }
    }


    /*
     * ============================================================
     * FOTO
     * ============================================================
     */

    function inicializarFoto() {

        const input =
            el(ids.fotoInput);


        const botao =
            el(ids.btnFoto);


        if (!input || !botao) {
            return;
        }


        if (
            botao.dataset.perfilEditorInicializado === "true"
        ) {
            return;
        }


        botao.dataset.perfilEditorInicializado =
            "true";


        botao.addEventListener(
            "click",
            () => {
                input.click();
            }
        );


        input.addEventListener(
            "change",
            (evento) => {

                const arquivo =
                    evento.target.files?.[0];


                if (!arquivo) {
                    return;
                }


                if (
                    !arquivo.type.startsWith("image/")
                ) {

                    window.PerfilUtils.mostrarToast(
                        "Selecione uma imagem válida.",
                        "erro"
                    );


                    input.value =
                        "";

                    return;
                }


                estado.fotoArquivo =
                    arquivo;


                const leitor =
                    new FileReader();


                leitor.onload =
                    (e) => {

                        const imagem =
                            el(ids.avatarImage);


                        const iniciais =
                            el(ids.avatarInitials);


                        if (imagem) {

                            imagem.src =
                                e.target.result;

                            imagem.style.display =
                                "block";
                        }


                        if (iniciais) {

                            iniciais.style.display =
                                "none";
                        }
                    };


                leitor.readAsDataURL(
                    arquivo
                );
            }
        );
    }


    /*
     * ============================================================
     * CONTADOR DE DESCRIÇÃO
     * ============================================================
     */

    function atualizarContador() {

        const campo =
            el(ids.descricao);


        const contador =
            el(ids.contadorDescricao);


        if (!campo || !contador) {
            return;
        }


        const quantidade =
            campo.value.length;


        contador.textContent =
            `${quantidade}/1000`;
    }


    /*
     * ============================================================
     * EVENTOS GERAIS
     * ============================================================
     */

    function inicializarEventos() {

        const formulario =
            el(ids.form);


        if (
            formulario &&
            formulario.dataset.perfilEditorInicializado !== "true"
        ) {

            formulario.dataset.perfilEditorInicializado =
                "true";


            formulario.addEventListener(
                "submit",
                async (evento) => {

                    evento.preventDefault();

                    await salvarSobre();
                }
            );
        }
        /*
        * --------------------------------------------------------
        * BOTÃO SALVAR ALTERAÇÕES
        * --------------------------------------------------------
        */

        const btnSalvar =
            el(ids.btnSalvar);


        if (
            btnSalvar &&
            btnSalvar.dataset.perfilEditorInicializado !== "true"
        ) {

            btnSalvar.dataset.perfilEditorInicializado =
                "true";


            btnSalvar.addEventListener(
                "click",
                async (evento) => {

                    evento.preventDefault();

                    await salvarSobre();
                }
            );
        }


        const descricao =
            el(ids.descricao);


        if (
            descricao &&
            descricao.dataset.perfilEditorInicializado !== "true"
        ) {

            descricao.dataset.perfilEditorInicializado =
                "true";


            descricao.addEventListener(
                "input",
                atualizarContador
            );
        }


        /*
         * --------------------------------------------------------
         * SALVAR NO TOPO
         * --------------------------------------------------------
         */

        const btnSalvarTopo =
            el(ids.btnSalvarTopo);


        if (
            btnSalvarTopo &&
            btnSalvarTopo.dataset.perfilEditorInicializado !== "true"
        ) {

            btnSalvarTopo.dataset.perfilEditorInicializado =
                "true";


            btnSalvarTopo.addEventListener(
                "click",
                async () => {

                    const aba =
                        estado.abaAtual;


                    if (
                        aba === "sobre"
                    ) {

                        await salvarSobre();

                        return;
                    }


                    if (
                        aba === "portfolio" &&
                        window.PerfilPortfolio &&
                        typeof window.PerfilPortfolio.salvar === "function"
                    ) {

                        await window.PerfilPortfolio.salvar();

                        return;
                    }


                    if (
                        aba === "agenda" &&
                        window.PerfilAgenda &&
                        typeof window.PerfilAgenda.salvar === "function"
                    ) {

                        await window.PerfilAgenda.salvar();

                        return;
                    }


                    if (
                        aba === "servicos" &&
                        window.PerfilServicos &&
                        typeof window.PerfilServicos.salvar === "function"
                    ) {

                        await window.PerfilServicos.salvar();

                        return;
                    }
                }
            );
        }


        /*
         * --------------------------------------------------------
         * BOTÃO CANCELAR
         * --------------------------------------------------------
         */

        const btnCancelar =
            el(ids.btnCancelar);


        if (
            btnCancelar &&
            btnCancelar.dataset.perfilEditorInicializado !== "true"
        ) {

            btnCancelar.dataset.perfilEditorInicializado =
                "true";


            btnCancelar.addEventListener(
                "click",
                () => {

                    window.location.href =
                        CONFIG.paginaPerfil;
                }
            );
        }


        /*
         * --------------------------------------------------------
         * BOTÃO VOLTAR
         * --------------------------------------------------------
         */

        const btnVoltar =
            el(ids.btnVoltar);


        if (
            btnVoltar &&
            btnVoltar.dataset.perfilEditorInicializado !== "true"
        ) {

            btnVoltar.dataset.perfilEditorInicializado =
                "true";


            btnVoltar.addEventListener(
                "click",
                voltarPerfil
            );
        }
    }


    /*
     * ============================================================
     * VOLTAR PARA PERFIL
     * ============================================================
     */

    function voltarPerfil() {

        window.location.href =
            CONFIG.paginaPerfil;
    }


    /*
     * ============================================================
     * INICIALIZAÇÃO
     * ============================================================
 */

    async function iniciar() {

        try {

            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.mostrarLoading === "function"
            ) {

                window.PerfilUtils.mostrarLoading(
                    "Carregando perfil..."
                );
            }


            configurarModulos();


            /*
             * As abas são inicializadas uma única vez
             * pelo módulo universal.
             */

            if (
                window.PerfilAbas &&
                typeof window.PerfilAbas.inicializar === "function"
            ) {

                window.PerfilAbas.inicializar();
            }


            /*
             * Módulos de conteúdo também são inicializados
             * uma única vez.
             */

            if (
                window.PerfilPortfolio &&
                typeof window.PerfilPortfolio.inicializar === "function"
            ) {

                window.PerfilPortfolio.inicializar();
            }


            if (
                window.PerfilAgenda &&
                typeof window.PerfilAgenda.inicializar === "function"
            ) {

                window.PerfilAgenda.inicializar();
            }


            if (
                window.PerfilServicos &&
                typeof window.PerfilServicos.inicializar === "function"
            ) {

                window.PerfilServicos.inicializar();
            }


            if (
                window.PerfilInstrumentos &&
                typeof window.PerfilInstrumentos.inicializar === "function"
            ) {

                window.PerfilInstrumentos.inicializar();
            }


            inicializarEventos();

            inicializarFoto();

            await carregarDados();


            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.atualizarIcones === "function"
            ) {

                window.PerfilUtils.atualizarIcones();
            }

        } catch (erro) {

            console.error(
                "Erro ao iniciar editor:",
                erro
            );


            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.mostrarToast === "function"
            ) {

                window.PerfilUtils.mostrarToast(
                    erro?.message ||
                    "Não foi possível iniciar o editor.",
                    "erro"
                );
            }

        } finally {

            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.esconderLoading === "function"
            ) {

                window.PerfilUtils.esconderLoading();
            }
        }
    }


    /*
     * ============================================================
     * API PÚBLICA
     * ============================================================
     */

    return {

        CONFIG,

        estado,

        ids,

        contexto,

        iniciar,

        carregarDados,

        preencherFormulario,

        preencherAvatar,

        fazerUploadFoto,

        salvarSobre,

        inicializarFoto,

        inicializarEventos,

        atualizarContador,

        voltarPerfil,

        preencherTipoArtista
    };

})();


window.PerfilEditor =
    PerfilEditor;


/*
 * ================================================================
 * AUTO START
 * ================================================================
 */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {
            PerfilEditor.iniciar();
        },
        {
            once: true
        }
    );

} else {

    PerfilEditor.iniciar();
}