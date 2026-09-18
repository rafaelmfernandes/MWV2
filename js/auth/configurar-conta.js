 /*

MUSICALWORLD — CONFIGURAÇÃO INICIAL DA CONTA

Arquivo:
js/auth/configurar-conta.js

Responsabilidades:

* Verificar o usuário autenticado.
* Identificar se a conta já possui perfil configurado.
* Permitir escolher Contratante ou Artista.
* Permitir escolher o tipo de artista.
* Criar o perfil principal através de Perfil.js.
* Criar o registro em perfis_artistas quando necessário.
* Redirecionar para o Index após a conclusão.

Importante:

* Este arquivo controla somente o fluxo de configuração.
* A criação do perfil principal utiliza window.Perfil.criar().
* A criação de perfis_artistas é feita aqui porque a função
  criar_perfil_cadastro não cria esse registro automaticamente.
  =========================================================
  */

(function (window) {


"use strict";


const ConfigurarConta = {

    /* =====================================================
       ESTADO
    ====================================================== */

    etapaAtual: 1,

    tipoPerfil: null,

    tipoArtista: null,

    usuario: null,

    perfil: null,

    inicializado: false,

    processando: false,


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    async iniciar() {

        if (this.inicializado) {
            return;
        }

        this.inicializado = true;

        console.log(
            "MusicalWorld — iniciando configuração da conta."
        );

        this.configurarEventos();

        const usuarioValido =
            await this.verificarUsuario();

        if (!usuarioValido) {
            return;
        }

        const perfilExistente =
            await this.verificarPerfilExistente();

        if (perfilExistente) {
            return;
        }

        this.atualizarInterface();

    },


    /* =====================================================
       EVENTOS
    ====================================================== */

    configurarEventos() {

        const opcoesConta =
            document.querySelectorAll(".opcao-conta");

        opcoesConta.forEach((botao) => {

            botao.addEventListener(
                "click",
                () => {

                    const tipo =
                        botao.dataset.tipoPerfil;

                    this.selecionarTipoPerfil(tipo);

                }
            );

        });


        const selectTipoArtista =
            document.getElementById("tipo-artista");

        if (selectTipoArtista) {

            selectTipoArtista.addEventListener(
                "change",
                (evento) => {

                    this.tipoArtista =
                        evento.target.value || null;

                    this.limparErroTipoArtista();

                }
            );

        }


        const btnContinuar =
            document.getElementById(
                "btn-continuar-etapa-2"
            );

        if (btnContinuar) {

            btnContinuar.addEventListener(
                "click",
                () => this.validarEtapa2()
            );

        }


        const btnVoltarEtapa1 =
            document.getElementById(
                "btn-voltar-etapa-1"
            );

        if (btnVoltarEtapa1) {

            btnVoltarEtapa1.addEventListener(
                "click",
                () => this.irParaEtapa(1)
            );

        }


        const btnVoltarEtapa2 =
            document.getElementById(
                "btn-voltar-etapa-2"
            );

        if (btnVoltarEtapa2) {

            btnVoltarEtapa2.addEventListener(
                "click",
                () => this.irParaEtapa(2)
            );

        }


        const btnConcluir =
            document.getElementById(
                "btn-concluir"
            );

        if (btnConcluir) {

            btnConcluir.addEventListener(
                "click",
                () => this.concluir()
            );

        }

    },


    /* =====================================================
       VERIFICAR USUÁRIO
    ====================================================== */

    async verificarUsuario() {

        try {

            if (
                typeof supabaseClient === "undefined" ||
                !supabaseClient
            ) {

                console.error(
                    "MusicalWorld: cliente Supabase não encontrado."
                );

                this.mostrarErro(
                    "Não foi possível conectar ao sistema."
                );

                return false;
            }


            const {
                data,
                error
            } = await supabaseClient.auth.getUser();


            if (error) {

                console.error(
                    "MusicalWorld: erro ao obter usuário:",
                    error
                );

                this.irParaLogin();

                return false;
            }


            if (
                !data ||
                !data.user
            ) {

                console.warn(
                    "MusicalWorld: nenhum usuário autenticado."
                );

                this.irParaLogin();

                return false;
            }


            this.usuario = data.user;

            console.log(
                "MusicalWorld: usuário autenticado:",
                this.usuario.id
            );

            return true;

        } catch (erro) {

            console.error(
                "MusicalWorld: erro inesperado ao verificar usuário:",
                erro
            );

            this.irParaLogin();

            return false;

        }

    },


    /* =====================================================
       VERIFICAR PERFIL EXISTENTE
    ====================================================== */

    async verificarPerfilExistente() {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("perfis")
                .select(`
                    id,
                    usuario_id,
                    nome_exibicao,
                    tipo_perfil_id,
                    tipos_perfil (
                        id,
                        nome
                    )
                `)
                .eq(
                    "usuario_id",
                    this.usuario.id
                );


            if (error) {

                console.error(
                    "MusicalWorld: erro ao verificar perfil:",
                    error
                );

                /*
                 * Se a consulta falhar, não redirecionamos.
                 * Assim conseguimos visualizar o erro e testar
                 * o fluxo corretamente.
                 */

                this.mostrarErro(
                    "Não foi possível verificar seu perfil."
                );

                return true;
            }


            if (
                !data ||
                data.length === 0
            ) {

                console.log(
                    "MusicalWorld: nenhum perfil encontrado."
                );

                return false;
            }


            const perfil =
                data[0];

            const tipoPerfil =
                perfil.tipos_perfil
                    ? perfil.tipos_perfil.nome
                    : null;


            /*
             * Caso seja um perfil de artista,
             * precisamos verificar se o registro
             * correspondente em perfis_artistas existe.
             */

            if (
                tipoPerfil === "artista"
            ) {

                const {
                    data: perfilArtista,
                    error: erroArtista
                } = await supabaseClient
                    .from("perfis_artistas")
                    .select("id, tipo_artista")
                    .eq(
                        "perfil_id",
                        perfil.id
                    )
                    .maybeSingle();


                if (erroArtista) {

                    console.error(
                        "MusicalWorld: erro ao verificar perfil de artista:",
                        erroArtista
                    );

                    this.mostrarErro(
                        "Não foi possível verificar seu perfil de artista."
                    );

                    return true;
                }


                /*
                 * Se o perfil de artista já existe,
                 * consideramos a configuração concluída.
                 */

                if (perfilArtista) {

                    console.log(
                        "MusicalWorld: conta de artista já configurada."
                    );

                    window.location.href =
                        "index.html";

                    return true;
                }


                /*
                 * Existe o perfil principal, mas ainda
                 * não existe perfis_artistas.
                 *
                 * Nesse caso continuamos o onboarding
                 * para concluir a configuração.
                 */

                this.perfil = perfil;

                this.tipoPerfil = "artista";

                console.log(
                    "MusicalWorld: perfil principal encontrado, mas perfil de artista ainda não."
                );

                return false;
            }


            /*
             * Para contratante, a existência do perfil
             * principal já significa que a configuração
             * foi concluída.
             */

            if (
                tipoPerfil === "contratante"
            ) {

                console.log(
                    "MusicalWorld: conta de contratante já configurada."
                );

                window.location.href =
                    "index.html";

                return true;
            }


            return false;

        } catch (erro) {

            console.error(
                "MusicalWorld: erro inesperado ao verificar perfil:",
                erro
            );

            this.mostrarErro(
                "Não foi possível verificar sua configuração."
            );

            return true;

        }

    },


    /* =====================================================
       SELECIONAR TIPO DE PERFIL
    ====================================================== */

    selecionarTipoPerfil(tipo) {

        if (
            tipo !== "artista" &&
            tipo !== "contratante"
        ) {
            return;
        }


        this.tipoPerfil =
            tipo;


        const opcoes =
            document.querySelectorAll(".opcao-conta");


        opcoes.forEach((opcao) => {

            const selecionada =
                opcao.dataset.tipoPerfil === tipo;

            opcao.classList.toggle(
                "selecionada",
                selecionada
            );

        });


        this.limparErroEtapa1();


        /*
         * O usuário escolheu a conta.
         * Avançamos automaticamente para a etapa 2.
         */

        setTimeout(() => {

            this.irParaEtapa(2);

        }, 180);

    },


    /* =====================================================
       VALIDAR ETAPA 2
    ====================================================== */

    validarEtapa2() {

        if (!this.tipoPerfil) {

            this.irParaEtapa(1);

            this.mostrarErroEtapa1(
                "Selecione o tipo de conta para continuar."
            );

            return;
        }


        if (
            this.tipoPerfil === "artista"
        ) {

            const select =
                document.getElementById(
                    "tipo-artista"
                );


            const tipoArtista =
                select
                    ? select.value.trim()
                    : "";


            if (!tipoArtista) {

                this.tipoArtista = null;

                this.mostrarErroTipoArtista(
                    "Selecione seu tipo de atuação para continuar."
                );

                if (select) {
                    select.focus();
                }

                return;
            }


            this.tipoArtista =
                tipoArtista;

        }


        this.prepararConfirmacao();

        this.irParaEtapa(3);

    },


    /* =====================================================
       PREPARAR CONFIRMAÇÃO
    ====================================================== */

    prepararConfirmacao() {

        const nome =
            this.obterNomeExibicao();


        const email =
            this.usuario &&
            this.usuario.email
                ? this.usuario.email
                : "—";


        const campoNome =
            document.getElementById(
                "confirmacao-nome"
            );


        const campoEmail =
            document.getElementById(
                "confirmacao-email"
            );


        const campoTipo =
            document.getElementById(
                "confirmacao-tipo"
            );


        const campoTipoArtista =
            document.getElementById(
                "confirmacao-tipo-artista"
            );


        const containerTipoArtista =
            document.getElementById(
                "confirmacao-tipo-artista-container"
            );


        if (campoNome) {
            campoNome.textContent =
                nome;
        }


        if (campoEmail) {
            campoEmail.textContent =
                email;
        }


        if (campoTipo) {
            campoTipo.textContent =
                this.tipoPerfil === "artista"
                    ? "Artista"
                    : "Contratante";
        }


        if (
            this.tipoPerfil === "artista"
        ) {

            if (containerTipoArtista) {
                containerTipoArtista.style.display =
                    "flex";
            }

            if (campoTipoArtista) {
                campoTipoArtista.textContent =
                    this.tipoArtista || "—";
            }

        } else {

            if (containerTipoArtista) {
                containerTipoArtista.style.display =
                    "none";
            }

        }

    },


    /* =====================================================
       CONCLUIR CONFIGURAÇÃO
    ====================================================== */

    async concluir() {

        if (this.processando) {
            return;
        }


        if (!this.usuario) {

            this.irParaLogin();

            return;
        }


        if (!this.tipoPerfil) {

            this.irParaEtapa(1);

            this.mostrarErroEtapa1(
                "Selecione o tipo de conta."
            );

            return;
        }


        if (
            this.tipoPerfil === "artista" &&
            !this.tipoArtista
        ) {

            this.irParaEtapa(2);

            this.mostrarErroTipoArtista(
                "Selecione seu tipo de atuação."
            );

            return;
        }


        this.processando = true;

        this.mostrarCarregamento(true);

        this.limparMensagemConfiguracao();


        try {

            /*
             * Cria ou recupera o perfil principal.
             *
             * A função Perfil.criar utiliza a RPC
             * criar_perfil_cadastro.
             */

            if (
                !window.Perfil ||
                typeof window.Perfil.criar !== "function"
            ) {

                throw new Error(
                    "Módulo Perfil.js não está disponível."
                );
            }


            const resultadoPerfil =
                await window.Perfil.criar({

                    usuarioId:
                        this.usuario.id,

                    tipoPerfil:
                        this.tipoPerfil,

                    nomeExibicao:
                        this.obterNomeExibicao()

                });


            if (
                !resultadoPerfil ||
                !resultadoPerfil.sucesso
            ) {

                throw new Error(
                    resultadoPerfil &&
                    resultadoPerfil.mensagem
                        ? resultadoPerfil.mensagem
                        : "Não foi possível criar o perfil."
                );
            }


            this.perfil =
                resultadoPerfil.perfil;


            console.log(
                "MusicalWorld: perfil principal criado/recuperado:",
                this.perfil
            );


            /*
             * Se for artista, criamos também
             * o registro correspondente em perfis_artistas.
             */

            if (
                this.tipoPerfil === "artista"
            ) {

                const resultadoArtista =
                    await this.criarPerfilArtista(
                        this.perfil.id
                    );


                if (!resultadoArtista) {

                    throw new Error(
                        "Não foi possível criar o perfil de artista."
                    );
                }

            }


            /*
             * Configuração concluída.
             */

            console.log(
                "MusicalWorld: configuração concluída com sucesso."
            );


            this.mostrarMensagemConfiguracao(
                "Conta configurada com sucesso. Redirecionando...",
                "sucesso"
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 700);


        } catch (erro) {

            console.error(
                "MusicalWorld: erro ao concluir configuração:",
                erro
            );


            this.mostrarMensagemConfiguracao(
                erro && erro.message
                    ? erro.message
                    : "Não foi possível concluir a configuração.",
                "erro"
            );

        } finally {

            this.processando = false;

            this.mostrarCarregamento(false);

        }

    },


    /* =====================================================
       CRIAR PERFIL DE ARTISTA
    ====================================================== */

    async criarPerfilArtista(perfilId) {

        if (!perfilId) {

            console.error(
                "MusicalWorld: perfil_id não informado."
            );

            return false;
        }


        if (!this.tipoArtista) {

            console.error(
                "MusicalWorld: tipo de artista não informado."
            );

            return false;
        }


        try {

            /*
             * Primeiro verificamos se já existe.
             *
             * Isso torna o processo seguro caso a operação
             * seja executada novamente.
             */

            const {
                data: existente,
                error: erroBusca
            } = await supabaseClient
                .from("perfis_artistas")
                .select("id, tipo_artista")
                .eq(
                    "perfil_id",
                    perfilId
                )
                .maybeSingle();


            if (erroBusca) {

                console.error(
                    "MusicalWorld: erro ao verificar perfil_artistas:",
                    erroBusca
                );

                return false;
            }


            /*
             * Se já existe, apenas atualizamos o tipo.
             */

            if (existente) {

                const {
                    error: erroAtualizacao
                } = await supabaseClient
                    .from("perfis_artistas")
                    .update({
                        tipo_artista:
                            this.tipoArtista
                    })
                    .eq(
                        "id",
                        existente.id
                    );


                if (erroAtualizacao) {

                    console.error(
                        "MusicalWorld: erro ao atualizar perfil_artistas:",
                        erroAtualizacao
                    );

                    return false;
                }


                console.log(
                    "MusicalWorld: perfil de artista atualizado."
                );

                return true;
            }


            /*
             * Não existe ainda.
             *
             * Os arrays são enviados como [] porque
             * instrumentos, estilos e servicos são NOT NULL.
             *
             * disponivel também é NOT NULL.
             */

            const {
                data,
                error
            } = await supabaseClient
                .from("perfis_artistas")
                .insert({

                    perfil_id:
                        perfilId,

                    tipo_artista:
                        this.tipoArtista,

                    disponivel:
                        true,

                    instrumentos:
                        [],

                    estilos:
                        [],

                    servicos:
                        []

                })
                .select()
                .single();


            if (error) {

                console.error(
                    "MusicalWorld: erro ao criar perfil_artista:",
                    error
                );

                return false;
            }


            console.log(
                "MusicalWorld: perfil de artista criado:",
                data
            );


            return true;

        } catch (erro) {

            console.error(
                "MusicalWorld: erro inesperado ao criar perfil_artista:",
                erro
            );

            return false;

        }

    },


    /* =====================================================
       OBTER NOME DE EXIBIÇÃO
    ====================================================== */

    obterNomeExibicao() {

        if (
            this.usuario &&
            this.usuario.user_metadata
        ) {

            const metadata =
                this.usuario.user_metadata;


            const nomeMetadata =
                metadata.full_name ||
                metadata.name ||
                metadata.nome;


            if (
                nomeMetadata &&
                nomeMetadata.trim()
            ) {

                return nomeMetadata.trim();

            }

        }


        try {

            const nomeLocal =
                localStorage.getItem(
                    "musicalworld_nome"
                );


            if (
                nomeLocal &&
                nomeLocal.trim()
            ) {

                return nomeLocal.trim();

            }

        } catch (erro) {

            console.warn(
                "MusicalWorld: não foi possível ler nome do localStorage."
            );

        }


        if (
            this.usuario &&
            this.usuario.email
        ) {

            const parteEmail =
                this.usuario.email
                    .split("@")[0]
                    .trim();


            if (parteEmail) {
                return parteEmail;
            }

        }


        return "Usuário";

    },


    /* =====================================================
       NAVEGAÇÃO ENTRE ETAPAS
    ====================================================== */

    irParaEtapa(numero) {

        if (
            numero < 1 ||
            numero > 3
        ) {
            return;
        }


        this.etapaAtual =
            numero;


        document
            .querySelectorAll(".etapa")
            .forEach((etapa) => {

                const etapaNumero =
                    Number(
                        etapa.id.replace(
                            "etapa-",
                            ""
                        )
                    );


                etapa.classList.toggle(
                    "ativa",
                    etapaNumero === numero
                );

            });


        document
            .querySelectorAll(".progresso-etapa")
            .forEach((etapa) => {

                const progresso =
                    Number(
                        etapa.dataset.progresso
                    );


                etapa.classList.toggle(
                    "ativa",
                    progresso === numero
                );


                etapa.classList.toggle(
                    "concluida",
                    progresso < numero
                );

            });


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        this.atualizarInterface();

    },


    /* =====================================================
       INTERFACE
    ====================================================== */

    atualizarInterface() {

        const artista =
            this.tipoPerfil === "artista";


        const campoArtista =
            document.getElementById(
                "configuracao-artista"
            );


        const campoContratante =
            document.getElementById(
                "configuracao-contratante"
            );


        if (campoArtista) {

            campoArtista.style.display =
                artista
                    ? "block"
                    : "none";

        }


        if (campoContratante) {

            campoContratante.classList.toggle(
                "visivel",
                !artista
            );

        }

    },


    /* =====================================================
       CABEÇALHO DE PROGRESSO
    ====================================================== */

    atualizarCabecalho() {

        document
            .querySelectorAll(".progresso-etapa")
            .forEach((elemento) => {

                const numero =
                    Number(
                        elemento.dataset.progresso
                    );


                elemento.classList.toggle(
                    "ativa",
                    numero === this.etapaAtual
                );


                elemento.classList.toggle(
                    "concluida",
                    numero < this.etapaAtual
                );

            });

    },


    /* =====================================================
       CARREGAMENTO
    ====================================================== */

    mostrarCarregamento(exibir) {

        const elemento =
            document.getElementById(
                "estado-carregando"
            );


        if (!elemento) {
            return;
        }


        elemento.classList.toggle(
            "visivel",
            Boolean(exibir)
        );

    },


    /* =====================================================
       ERROS — ETAPA 1
    ====================================================== */

    mostrarErroEtapa1(mensagem) {

        const elemento =
            document.getElementById(
                "erro-etapa-1"
            );


        if (!elemento) {
            return;
        }


        elemento.textContent =
            mensagem || "";


        elemento.classList.toggle(
            "visivel",
            Boolean(mensagem)
        );

    },


    limparErroEtapa1() {

        this.mostrarErroEtapa1("");

    },


    /* =====================================================
       ERROS — TIPO DE ARTISTA
    ====================================================== */

    mostrarErroTipoArtista(mensagem) {

        const elemento =
            document.getElementById(
                "erro-tipo-artista"
            );


        const select =
            document.getElementById(
                "tipo-artista"
            );


        if (elemento) {

            elemento.textContent =
                mensagem || "";

            elemento.classList.toggle(
                "visivel",
                Boolean(mensagem)
            );

        }


        if (select) {

            select.classList.toggle(
                "erro",
                Boolean(mensagem)
            );

        }

    },


    limparErroTipoArtista() {

        this.mostrarErroTipoArtista("");

    },


    /* =====================================================
       MENSAGENS DE CONFIGURAÇÃO
    ====================================================== */

    mostrarMensagemConfiguracao(
        mensagem,
        tipo
    ) {

        const elemento =
            document.getElementById(
                "mensagem-configuracao"
            );


        if (!elemento) {
            return;
        }


        elemento.textContent =
            mensagem || "";


        elemento.classList.remove(
            "erro",
            "sucesso"
        );


        if (tipo) {

            elemento.classList.add(
                tipo
            );

        }


        elemento.classList.toggle(
            "visivel",
            Boolean(mensagem)
        );

    },


    limparMensagemConfiguracao() {

        this.mostrarMensagemConfiguracao(
            "",
            ""
        );

    },


    /* =====================================================
       REDIRECIONAR PARA LOGIN
    ====================================================== */

    irParaLogin() {

        window.location.href =
            "login.html";

    }

};


/* =========================================================
   DISPONIBILIZAR GLOBALMENTE
========================================================== */

window.ConfigurarConta =
    ConfigurarConta;


/* =========================================================
   INICIALIZAÇÃO
========================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => ConfigurarConta.iniciar()
    );

} else {

    ConfigurarConta.iniciar();

}


})(window);
