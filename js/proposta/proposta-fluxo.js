/* =========================================================
   MUSICALWORLD — FLUXO DA PROPOSTA

   Arquivo:
   js/proposta/proposta-fluxo.js

   Responsabilidade:

   - Controlar o fluxo da proposta.
   - Controlar abertura e fechamento.
   - Capturar ações dos botões.
   - Capturar os dados atuais do formulário.
   - Validar os dados antes da revisão.
   - Avançar para a etapa de revisão.
   - Voltar para a edição.
   - Enviar a proposta.
   - Delegar dados para:
       MusicalWorldPropostaDados
   - Delegar interface para:
       MusicalWorldPropostaRender

   Contexto deste fluxo:

   ARTISTA
       ↓
   PERFIL DO ESTABELECIMENTO
       ↓
   ENVIAR PROPOSTA
       ↓
   PREENCHER DADOS
       ↓
   REVISAR
       ↓
   CONFIRMAR ENVIO
       ↓
   criarProposta()
       ↓
   solicitacao_enviada

   REGRAS:

   - O usuário logado é o artista.
   - O perfil aberto é o estabelecimento.
   - O serviço é opcional.
   - O valor pode vir automaticamente do serviço.
   - A data é obrigatória.
   - Os horários são opcionais.
   - Se nenhum horário for informado, o estabelecimento
     poderá definir posteriormente.
   - Se apenas um horário for informado, a proposta
     não poderá ser enviada.
   - Tipo de evento não é solicitado neste fluxo.
   - O local é automaticamente o endereço do estabelecimento.
   - O artista não escolhe outro endereço.

   Não é responsabilidade deste arquivo:

   - Criar HTML da interface.
   - Fazer consultas Supabase diretamente.
   - Renderizar componentes visuais complexos.

   ========================================================= */


/* =========================================================
   1. OBJETO PRINCIPAL
   ========================================================= */

window.MusicalWorldPropostaFluxo = {


    /* =====================================================
       2. ESTADO
       ===================================================== */

    estado: {

        inicializado: false,

        enviando: false,

        etapaAtual: "dados",

        contexto: null,

        handlers: {}

    },


    /* =====================================================
       3. INICIALIZAR
       ===================================================== */

    inicializar(
        contexto = null
    ) {

        if (
            contexto
        ) {

            this.estado.contexto =
                contexto;

        }


        if (
            this.estado.inicializado
        ) {

            return;

        }


        this.estado.inicializado =
            true;


        this.registrarEventos();


        console.log(
            "MusicalWorldPropostaFluxo inicializado."
        );

    },


    /* =====================================================
       4. ATUALIZAR CONTEXTO
       ===================================================== */

    definirContexto(
        contexto
    ) {

        this.estado.contexto =
            contexto || null;

    },


    /* =====================================================
       5. REGISTRAR EVENTOS
       =====================================================

       Os eventos são registrados no document porque o
       conteúdo interno do modal pode ser recriado pelo
       renderizador.

       A delegação garante que os elementos continuem
       funcionando mesmo após a recriação do HTML.

       ===================================================== */

    registrarEventos() {

        this.removerEventos();


        /* =================================================
           CLIQUES
           ================================================= */

        this.estado.handlers.clique =
            event => {

                const alvo =
                    event.target;


                if (!alvo) {

                    return;

                }


                /* =========================================
                   1. BOTÃO FECHAR
                   ========================================= */

                const botaoFechar =
                    alvo.closest(
                        "[data-proposta-fechar]"
                    );


                if (
                    botaoFechar
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    this.fechar();

                    return;

                }


                /* =========================================
                   2. FUNDO DO MODAL
                   =========================================

                   Só fecha quando o clique acontece
                   exatamente no elemento de fundo.

                   Cliques dentro do conteúdo não fecham.
                   ========================================= */

                if (
                    alvo.matches(
                        "[data-proposta-modal]"
                    )
                ) {

                    event.preventDefault();

                    this.fechar();

                    return;

                }


                /* =========================================
                   3. CANCELAR
                   ========================================= */

                const botaoCancelar =
                    alvo.closest(
                        "[data-proposta-cancelar]"
                    );


                if (
                    botaoCancelar
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    this.fechar();

                    return;

                }


                /* =========================================
                   4. VOLTAR
                   ========================================= */

                const botaoVoltar =
                    alvo.closest(
                        "[data-proposta-voltar]"
                    );


                if (
                    botaoVoltar
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    this.voltarParaDados();

                    return;

                }


                /* =========================================
                   5. ENVIAR PROPOSTA
                   ========================================= */

                const botaoEnviar =
                    alvo.closest(
                        "[data-proposta-enviar]"
                    );


                if (
                    botaoEnviar
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    this.enviar();

                    return;

                }

            };


        /* =================================================
           SUBMIT DO FORMULÁRIO
           ================================================= */

        this.estado.handlers.formulario =
            event => {

                const formulario =
                    event.target;


                if (
                    !formulario ||
                    !formulario.matches(
                        "[data-proposta-formulario]"
                    )
                ) {

                    return;

                }


                event.preventDefault();


                this.irParaRevisao();

            };


        document.addEventListener(
            "click",
            this.estado.handlers.clique
        );


        document.addEventListener(
            "submit",
            this.estado.handlers.formulario
        );

    },


    /* =====================================================
       6. REMOVER EVENTOS
       ===================================================== */

    removerEventos() {

        const handlers =
            this.estado.handlers;


        if (!handlers) {

            return;

        }


        if (
            handlers.clique
        ) {

            document.removeEventListener(
                "click",
                handlers.clique
            );

        }


        if (
            handlers.formulario
        ) {

            document.removeEventListener(
                "submit",
                handlers.formulario
            );

        }


        this.estado.handlers = {};

    },


    /* =====================================================
       7. ABRIR
       ===================================================== */

    async abrir(
        contexto = null
    ) {

        try {

            this.limparEstado();


            if (
                contexto
            ) {

                this.estado.contexto =
                    contexto;

            }


            let dadosContexto =
                this.estado.contexto;


            /*
             * Se o contexto já foi carregado pelo módulo
             * principal, utilizamos diretamente.
             *
             * Caso contrário, tentamos carregar através
             * do módulo de dados.
             */

            if (
                !dadosContexto
            ) {

                dadosContexto =
                    await this.carregarContexto();

            }


            if (!dadosContexto) {

                throw new Error(
                    "Não foi possível carregar os dados do estabelecimento."
                );

            }


            this.estado.contexto =
                dadosContexto;


            const render =
                this.obterRender();


            if (!render) {

                throw new Error(
                    "Módulo de renderização da proposta não encontrado."
                );

            }


            render.inicializar(
                dadosContexto
            );


            render.abrir();


            this.estado.etapaAtual =
                "dados";


            render.definirEtapa(
                "dados"
            );


            /*
             * Garante que os eventos estejam registrados
             * somente uma vez.
             */

            this.registrarEventos();


        } catch (
            erro
        ) {

            console.error(
                "MusicalWorldPropostaFluxo: erro ao abrir proposta:",
                erro
            );


            this.mostrarErro(
                erro.message ||
                "Não foi possível abrir a proposta."
            );

        }

    },


    /* =====================================================
       8. CARREGAR CONTEXTO
       ===================================================== */

    async carregarContexto(
        perfilId = null
    ) {

        const dados =
            this.obterDados();


        if (!dados) {

            throw new Error(
                "Módulo de dados da proposta não encontrado."
            );

        }


        /*
         * Primeiro tentamos utilizar o perfil recebido.
         *
         * Depois verificamos se existe um perfil armazenado
         * no estado do módulo de dados.
         */

        const id =
            perfilId ||
            dados.obterEstado?.().perfilId;


        if (!id) {

            throw new Error(
                "Perfil do estabelecimento não identificado."
            );

        }


        return await dados.inicializarContexto(
            id
        );

    },


    /* =====================================================
       9. OBTER LOCAL DO ESTABELECIMENTO
       =====================================================

       O artista não escolhe o local.

       A proposta é enviada para o estabelecimento que
       está sendo visualizado.

       Portanto, o endereço usado na proposta é o endereço
       cadastrado no perfil desse estabelecimento.

       ===================================================== */

    obterLocalEstabelecimento() {

        const contexto =
            this.estado.contexto || {};


        const estabelecimento =
            contexto.estabelecimento || {};


        /*
         * O proposta-dados.js já normaliza o endereço
         * em estabelecimento.local.
         */

        if (
            estabelecimento.local &&
            typeof estabelecimento.local === "object"
        ) {

            return {
                ...estabelecimento.local
            };

        }


        if (
            estabelecimento.local_estabelecimento &&
            typeof estabelecimento.local_estabelecimento === "object"
        ) {

            return {
                ...estabelecimento.local_estabelecimento
            };

        }


        /*
         * Fallback para os campos originais.
         */

        return {

            nomeLocal:
                estabelecimento.nome_exibicao ||
                estabelecimento.nome ||
                "Estabelecimento",

            endereco:
                estabelecimento.endereco ||
                "",

            numero:
                estabelecimento.numero ||
                "",

            bairro:
                estabelecimento.bairro ||
                "",

            cidade:
                estabelecimento.cidade ||
                "",

            estado:
                estabelecimento.estado ||
                "",

            cep:
                estabelecimento.cep ||
                "",

            semNumero:
                !estabelecimento.numero,

            complemento:
                estabelecimento.complemento ||
                "",

            referencia:
                estabelecimento.referencia ||
                ""

        };

    },


    /* =====================================================
       10. OBTER DADOS ATUAIS DO FORMULÁRIO
       =====================================================

       Sempre que possível, capturamos os valores diretamente
       do formulário.

       Isso evita o problema de validar um estado antigo
       enquanto o usuário acabou de preencher os campos.

       ===================================================== */

    obterDadosFormulario() {

        const render =
            this.obterRender();


        if (!render) {

            throw new Error(
                "Módulo de renderização da proposta não encontrado."
            );

        }


        /*
         * O render possui um método específico para capturar
         * os campos atuais do formulário.
         */

        if (
            typeof render.obterDadosFormulario ===
            "function"
        ) {

            return render.obterDadosFormulario();

        }


        /*
         * Fallback para versões anteriores do renderizador.
         */

        return render.obterDados();

    },


    /* =====================================================
       11. MONTAR DADOS COMPLETOS
       ===================================================== */

    montarDadosCompletos(
        dadosFormulario
    ) {

        const contexto =
            this.estado.contexto;


        if (!contexto) {

            throw new Error(
                "Os dados do estabelecimento não foram carregados."
            );

        }


        const usuario =
            contexto.usuario;


        const perfil =
            contexto.perfil;


        if (
            !usuario ||
            !usuario.id
        ) {

            throw new Error(
                "Artista não identificado."
            );

        }


        if (
            !perfil ||
            !perfil.usuario_id
        ) {

            throw new Error(
                "O usuário responsável pelo estabelecimento não foi identificado."
            );

        }


        /*
         * O usuário logado é o artista.
         */

        const artistaId =
            String(
                usuario.id
            ).trim();


        /*
         * O usuário responsável pelo estabelecimento
         * é o destinatário da proposta.
         */

        const estabelecimentoId =
            String(
                perfil.usuario_id
            ).trim();


        if (!artistaId) {

            throw new Error(
                "Artista não identificado."
            );

        }


        if (!estabelecimentoId) {

            throw new Error(
                "Estabelecimento de destino não identificado."
            );

        }


        /*
         * O local é automaticamente o endereço
         * do estabelecimento.
         */

        const local =
            this.obterLocalEstabelecimento();


        return {

            ...(dadosFormulario || {}),


            /*
             * Identificação do artista.
             */

            usuarioId:
                artistaId,

            artistaId:
                artistaId,


            /*
             * Identificação do estabelecimento.
             */

            estabelecimentoId:
                estabelecimentoId,


            /*
             * Compatibilidade com contratacoes.
             *
             * Neste fluxo:
             *
             * contratante = artista
             * contratado  = responsável pelo estabelecimento
             */

            contratanteId:
                artistaId,

            contratadoId:
                estabelecimentoId,


            /*
             * Local automático.
             */

            local

        };

    },


    /* =====================================================
       12. VALIDAR RESULTADO
       =====================================================

       O proposta-dados.js atual retorna:

           true

       quando tudo está correto,

       e lança Error quando existe problema.

       Portanto não devemos procurar:

           validacao.valido

       nem:

           validacao.erros

       neste fluxo.

       ===================================================== */

    validarDados(
        dados
    ) {

        const dadosModulo =
            this.obterDados();


        if (!dadosModulo) {

            throw new Error(
                "Módulo de dados da proposta não encontrado."
            );

        }


        const resultado =
            dadosModulo.validarProposta(
                dados
            );


        /*
         * A versão atual retorna true.
         */

        if (
            resultado !== true
        ) {

            throw new Error(
                "Os dados da proposta não são válidos."
            );

        }


        return true;

    },


    /* =====================================================
       13. IR PARA REVISÃO
       ===================================================== */

    irParaRevisao() {

        if (
            this.estado.enviando
        ) {

            return;

        }


        const render =
            this.obterRender();


        if (!render) {

            this.mostrarErro(
                "Módulo de renderização da proposta não encontrado."
            );

            return;

        }


        try {

            /*
             * Captura os dados que estão realmente nos campos
             * neste momento.
             */

            const dadosFormulario =
                this.obterDadosFormulario();


            /*
             * Monta os identificadores e o local automaticamente.
             */

            const dadosCompletos =
                this.montarDadosCompletos(
                    dadosFormulario
                );


            /*
             * Validação.
             *
             * O método lança Error caso exista problema.
             */

            this.validarDados(
                dadosCompletos
            );


            /*
             * Mantemos os dados completos no estado do render
             * para que a revisão utilize exatamente os valores
             * que foram validados.
             */

            render.estado.dados = {

                ...render.estado.dados,

                ...dadosCompletos

            };


            render.limparMensagens();


            render.renderizarRevisao(
                dadosCompletos
            );


            render.definirEtapa(
                "revisao"
            );


            this.estado.etapaAtual =
                "revisao";


        } catch (
            erro
        ) {

            console.error(
                "MusicalWorldPropostaFluxo: erro ao avançar para revisão:",
                erro
            );


            this.mostrarErro(
                erro.message ||
                "Não foi possível revisar a proposta."
            );

        }

    },


    /* =====================================================
       14. VOLTAR PARA DADOS
       ===================================================== */

    voltarParaDados() {

        if (
            this.estado.enviando
        ) {

            return;

        }


        const render =
            this.obterRender();


        if (!render) {

            return;

        }


        render.limparMensagens();


        render.definirEtapa(
            "dados"
        );


        this.estado.etapaAtual =
            "dados";

    },


    /* =====================================================
       15. ENVIAR PROPOSTA
       ===================================================== */

    async enviar() {

        if (
            this.estado.enviando
        ) {

            return;

        }


        if (
            this.estado.etapaAtual !==
            "revisao"
        ) {

            return;

        }


        const render =
            this.obterRender();


        const dadosModulo =
            this.obterDados();


        if (
            !render ||
            !dadosModulo
        ) {

            this.mostrarErroRevisao(
                "Os módulos da proposta não foram encontrados."
            );

            return;

        }


        this.estado.enviando =
            true;


        render.definirCarregando(
            true
        );


        render.limparMensagens();


        try {

            const contexto =
                this.estado.contexto;


            if (!contexto) {

                throw new Error(
                    "Dados do estabelecimento não encontrados."
                );

            }


            /*
             * Capturamos novamente o formulário para garantir
             * que os dados utilizados no envio sejam os atuais.
             *
             * Isso também permite que o valor automático
             * do serviço seja resolvido pelo renderizador
             * caso o campo tenha sido deixado vazio.
             */

            const dadosFormulario =
                this.obterDadosFormulario();


            const dadosProposta =
                this.montarDadosCompletos(
                    dadosFormulario
                );


            /*
             * Validação final antes da gravação.

             * O validarProposta() atual lança Error em caso
             * de problema e retorna true quando tudo está correto.
             */

            this.validarDados(
                dadosProposta
            );


            console.log(
                "MusicalWorldPropostaFluxo — Dados finais da proposta:",
                dadosProposta
            );


            /*
             * Criar proposta.
             */

            const resultado =
                await dadosModulo.criarProposta(
                    dadosProposta
                );


            console.log(
                "MusicalWorldPropostaFluxo: proposta enviada:",
                resultado
            );


            await this.processarPosEnvio(
                resultado
            );


        } catch (
            erro
        ) {

            console.error(
                "MusicalWorldPropostaFluxo: erro ao enviar proposta:",
                erro
            );


            render.definirCarregando(
                false
            );


            this.estado.enviando =
                false;


            this.mostrarErroRevisao(
                erro.message ||
                "Não foi possível enviar a proposta."
            );

        }

    },


    /* =====================================================
       16. PROCESSAR APÓS ENVIO
       ===================================================== */

    async processarPosEnvio(
        contratacao
    ) {

        const render =
            this.obterRender();


        if (!contratacao) {

            throw new Error(
                "A proposta foi processada, mas nenhum resultado foi retornado."
            );

        }


        if (render) {

            render.definirCarregando(
                false
            );

        }


        this.estado.enviando =
            false;


        this.estado.etapaAtual =
            "enviado";


        this.mostrarSucessoEnvio(
            contratacao
        );


        /*
         * Mantemos o fechamento automático atual.
         *
         * Posteriormente podemos substituir por:
         *
         * - redirecionamento;
         * - acompanhamento da proposta;
         * - histórico de propostas.
         */

        setTimeout(
            () => {

                this.fechar();

            },
            1800
        );

    },


    /* =====================================================
       17. MENSAGEM DE SUCESSO
       ===================================================== */

    mostrarSucessoEnvio(
        contratacao
    ) {

        const render =
            this.obterRender();


        if (!render) {

            return;

        }


        const mensagem =
            "Proposta enviada com sucesso.";


        render.mostrarMensagem(
            mensagem,
            "sucesso",
            true
        );


        const elemento =
            document.querySelector(
                "[data-proposta-revisao]"
            );


        if (!elemento) {

            return;

        }


        elemento.innerHTML = `

            <div
                class="proposta-envio-sucesso"
            >

                <div
                    class="proposta-envio-sucesso-icone"
                    aria-hidden="true"
                >
                    ✓
                </div>


                <h3>
                    Proposta enviada
                </h3>


                <p>
                    Sua proposta foi enviada para o estabelecimento.
                </p>


                <span>
                    Aguarde a resposta do estabelecimento para continuar.
                </span>

            </div>

        `;

    },


    /* =====================================================
       18. FECHAR
       ===================================================== */

    fechar() {

        if (
            this.estado.enviando
        ) {

            return;

        }


        const render =
            this.obterRender();


        if (render) {

            render.fechar();

        }


        this.limparEstado();

    },


    /* =====================================================
       19. LIMPAR ESTADO
       ===================================================== */

    limparEstado() {

        this.estado.enviando =
            false;


        this.estado.etapaAtual =
            "dados";

    },


    /* =====================================================
       20. OBTER MÓDULO DE DADOS
       ===================================================== */

    obterDados() {

        if (
            window.MusicalWorldPropostaDados
        ) {

            return window.MusicalWorldPropostaDados;

        }


        console.error(
            "MusicalWorldPropostaFluxo: MusicalWorldPropostaDados não encontrado."
        );


        return null;

    },


    /* =====================================================
       21. OBTER MÓDULO DE RENDERIZAÇÃO
       ===================================================== */

    obterRender() {

        if (
            window.MusicalWorldPropostaRender
        ) {

            return window.MusicalWorldPropostaRender;

        }


        console.error(
            "MusicalWorldPropostaFluxo: MusicalWorldPropostaRender não encontrado."
        );


        return null;

    },


    /* =====================================================
       22. MOSTRAR ERRO
       ===================================================== */

    mostrarErro(
        mensagem
    ) {

        const render =
            this.obterRender();


        if (!render) {

            console.error(
                mensagem
            );

            return;

        }


        render.mostrarMensagem(
            mensagem,
            "erro",
            false
        );

    },


    /* =====================================================
       23. MOSTRAR ERRO NA REVISÃO
       ===================================================== */

    mostrarErroRevisao(
        mensagem
    ) {

        const render =
            this.obterRender();


        if (!render) {

            console.error(
                mensagem
            );

            return;

        }


        render.mostrarMensagem(
            mensagem,
            "erro",
            true
        );

    }

};


/* =========================================================
   24. CONFIRMAÇÃO DO MÓDULO
   ========================================================= */

console.log(
    "MusicalWorldPropostaFluxo carregado."
);