/* =========================================================
   MUSICALWORLD — AUTENTICAÇÃO

   Arquivo:
   js/auth/Login.js

   Responsabilidade:
   - Centralizar operações de autenticação.
   - Realizar login com e-mail e senha.
   - Solicitar recuperação de senha.
   - Alterar senha durante uma sessão de recuperação.
   - Realizar login social.
   - Verificar perfil do usuário.
   - Verificar sessão inicial.
   - Observar mudanças de autenticação.

   IMPORTANTE:
   - Este arquivo não controla HTML.
   - Este arquivo não cria modais.
   - A interface continua sendo responsabilidade de js/login.js
     e dos componentes visuais.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       OBTENER CLIENTE SUPABASE
       ===================================================== */

    function obterSupabase() {

        if (
            window.supabaseClient &&
            window.supabaseClient.auth
        ) {
            return window.supabaseClient;
        }


        if (
            window.supabase &&
            window.supabase.auth
        ) {
            return window.supabase;
        }


        if (
            window.MusicalWorldSupabase &&
            window.MusicalWorldSupabase.cliente &&
            window.MusicalWorldSupabase.cliente.auth
        ) {
            return window.MusicalWorldSupabase.cliente;
        }


        return null;
    }


    /* =====================================================
       MÓDULO
       ===================================================== */

    const Login = {


        /* =================================================
           CLIENTE
           ================================================= */

        obterCliente() {

            return obterSupabase();

        },


        /* =================================================
           URL DO PROJETO
           ================================================= */

        obterUrlProjeto() {

            const origem =
                window.location.origin;

            let caminho =
                window.location.pathname || "";


            /*
             * Remove o arquivo atual.
             */

            caminho =
                caminho.substring(
                    0,
                    caminho.lastIndexOf("/") + 1
                );


            /*
             * Mantém o caminho do projeto.
             *
             * Exemplo:
             *
             * http://localhost/MWV2/
             *
             * ou:
             *
             * https://usuario.github.io/MWV2/
             */

            return (
                origem +
                caminho
            );

        },


        /* =================================================
           URL DO LOGIN
           ================================================= */

        obterUrlLogin() {

            return (
                this.obterUrlProjeto() +
                "login.html"
            );

        },


        /* =================================================
           LOGIN
           ================================================= */

        async entrar({
            email,
            senha
        }) {

            const supabase =
                this.obterCliente();


            if (!supabase) {

                return {
                    sucesso: false,
                    mensagem:
                        "Cliente Supabase não disponível."
                };

            }


            email =
                (email || "")
                    .trim()
                    .toLowerCase();


            senha =
                senha || "";


            if (!email) {

                return {
                    sucesso: false,
                    mensagem:
                        "Informe seu e-mail."
                };

            }


            if (!senha) {

                return {
                    sucesso: false,
                    mensagem:
                        "Informe sua senha."
                };

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabase.auth.signInWithPassword({

                        email,

                        password: senha

                    });


                if (error) {

                    return {
                        sucesso: false,
                        mensagem:
                            this.traduzirErroLogin(
                                error
                            ),
                        erro: error
                    };

                }


                if (
                    !data ||
                    !data.session ||
                    !data.user
                ) {

                    return {
                        sucesso: false,
                        mensagem:
                            "Não foi possível criar a sessão."
                    };

                }


                return {

                    sucesso: true,

                    mensagem:
                        "Login realizado com sucesso.",

                    sessao:
                        data.session,

                    usuario:
                        data.user

                };

            } catch (erro) {

                console.error(
                    "Erro inesperado no login:",
                    erro
                );


                return {
                    sucesso: false,
                    mensagem:
                        "Ocorreu um erro ao entrar na conta.",
                    erro
                };

            }

        },


        /* =================================================
           TRADUZIR ERROS DE LOGIN
           ================================================= */

        traduzirErroLogin(error) {

            const mensagem =
                (
                    error?.message ||
                    ""
                ).toLowerCase();


            if (
                mensagem.includes(
                    "email not confirmed"
                )
            ) {

                return (
                    "Seu e-mail ainda não foi confirmado."
                );

            }


            if (
                mensagem.includes(
                    "invalid login credentials"
                ) ||
                mensagem.includes(
                    "invalid credentials"
                )
            ) {

                return (
                    "E-mail ou senha incorretos."
                );

            }


            if (
                mensagem.includes(
                    "rate limit"
                )
            ) {

                return (
                    "Muitas tentativas foram realizadas. Aguarde alguns instantes e tente novamente."
                );

            }


            return (
                "Não foi possível entrar na conta."
            );

        },


        /* =================================================
           RECUPERAÇÃO DE SENHA

           Envia o e-mail do Supabase.

           O link retornará para login.html.

           Depois que o Supabase detectar a sessão
           de recuperação, js/login.js abrirá o modal
           para criação da nova senha.
           ================================================= */

        async recuperarSenha(email) {

            const supabase =
                this.obterCliente();


            if (!supabase) {

                return {
                    sucesso: false,
                    mensagem:
                        "Cliente Supabase não disponível."
                };

            }


            email =
                (email || "")
                    .trim()
                    .toLowerCase();


            if (!email) {

                return {
                    sucesso: false,
                    mensagem:
                        "Informe seu e-mail."
                };

            }


            try {

                const redirectTo =
                    this.obterUrlLogin();


                console.log(
                    "🔑 Solicitando recuperação de senha."
                );


                console.log(
                    "↩️ Redirecionamento:",
                    redirectTo
                );


                const {
                    error
                } =
                    await supabase.auth.resetPasswordForEmail(

                        email,

                        {
                            redirectTo
                        }

                    );


                if (error) {

                    console.error(
                        "Erro ao solicitar recuperação:",
                        error
                    );


                    return {

                        sucesso: false,

                        mensagem:
                            "Não foi possível solicitar a recuperação da senha.",

                        erro: error

                    };

                }


                return {

                    sucesso: true,

                    mensagem:
                        "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."

                };

            } catch (erro) {

                console.error(
                    "Erro inesperado na recuperação:",
                    erro
                );


                return {

                    sucesso: false,

                    mensagem:
                        "Ocorreu um erro ao solicitar a recuperação da senha.",

                    erro

                };

            }

        },


        /* =================================================
           ALTERAR SENHA

           Executado depois que o usuário abriu o link
           enviado pelo Supabase.

           Nesse momento existe uma sessão temporária
           de recuperação.
           ================================================= */

        async alterarSenha(novaSenha) {

            const supabase =
                this.obterCliente();


            if (!supabase) {

                return {

                    sucesso: false,

                    mensagem:
                        "Cliente Supabase não disponível."

                };

            }


            novaSenha =
                novaSenha || "";


            if (!novaSenha) {

                return {

                    sucesso: false,

                    mensagem:
                        "Informe uma nova senha."

                };

            }


            if (novaSenha.length < 6) {

                return {

                    sucesso: false,

                    mensagem:
                        "A nova senha deve ter pelo menos 6 caracteres."

                };

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabase.auth.updateUser({

                        password:
                            novaSenha

                    });


                if (error) {

                    console.error(
                        "Erro ao alterar senha:",
                        error
                    );


                    return {

                        sucesso: false,

                        mensagem:
                            this.traduzirErroAlteracaoSenha(
                                error
                            ),

                        erro: error

                    };

                }


                return {

                    sucesso: true,

                    mensagem:
                        "Sua senha foi alterada com sucesso.",

                    usuario:
                        data?.user || null

                };

            } catch (erro) {

                console.error(
                    "Erro inesperado ao alterar senha:",
                    erro
                );


                return {

                    sucesso: false,

                    mensagem:
                        "Não foi possível alterar sua senha.",

                    erro

                };

            }

        },


        /* =================================================
           TRADUZIR ERROS DA NOVA SENHA
           ================================================= */

        traduzirErroAlteracaoSenha(error) {

            const mensagem =
                (
                    error?.message ||
                    ""
                ).toLowerCase();


            if (
                mensagem.includes(
                    "password should be at least"
                )
            ) {

                return (
                    "A senha deve ter pelo menos 6 caracteres."
                );

            }


            if (
                mensagem.includes(
                    "same password"
                )
            ) {

                return (
                    "A nova senha precisa ser diferente da senha anterior."
                );

            }


            return (
                "Não foi possível alterar sua senha."
            );

        },


        /* =================================================
           LOGIN SOCIAL
           ================================================= */

        async social(provedor) {

            const supabase =
                this.obterCliente();


            if (!supabase) {

                return {

                    sucesso: false,

                    mensagem:
                        "Cliente Supabase não disponível."

                };

            }


            const provedoresPermitidos =
                [
                    "Google",
                    "Apple"
                ];


            if (
                !provedoresPermitidos.includes(
                    provedor
                )
            ) {

                return {

                    sucesso: false,

                    mensagem:
                        "Provedor de autenticação não suportado."

                };

            }


            try {

                const nomeProvedor =
                    provedor.toLowerCase();


                const {
                    data,
                    error
                } =
                    await supabase.auth.signInWithOAuth({

                        provider:
                            nomeProvedor,

                        options: {

                            redirectTo:
                                this.obterUrlLogin()

                        }

                    });


                if (error) {

                    return {

                        sucesso: false,

                        mensagem:
                            "Não foi possível iniciar a autenticação social.",

                        erro: error

                    };

                }


                return {

                    sucesso: true,

                    data

                };

            } catch (erro) {

                console.error(
                    "Erro no login social:",
                    erro
                );


                return {

                    sucesso: false,

                    mensagem:
                        "Ocorreu um erro ao iniciar a autenticação social.",

                    erro

                };

            }

        },


        /* =================================================
           VERIFICAR PERFIL DO USUÁRIO
           ================================================= */

        async verificarPerfilUsuario(usuarioId) {

            const supabase =
                this.obterCliente();


            if (
                !supabase ||
                !usuarioId
            ) {

                return {

                    sucesso: false,

                    possuiPerfil: false,

                    perfil: null

                };

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabase

                        .from("perfis")

                        .select(`
                            id,
                            usuario_id,
                            tipo_perfil,
                            perfil_publicado,
                            tipos_perfil (
                                id,
                                nome
                            )
                        `)

                        .eq(
                            "usuario_id",
                            usuarioId
                        )

                        .maybeSingle();


                if (error) {

                    console.error(
                        "Erro ao verificar perfil:",
                        error
                    );


                    return {

                        sucesso: false,

                        possuiPerfil: false,

                        perfil: null,

                        erro: error

                    };

                }


                return {

                    sucesso: true,

                    possuiPerfil:
                        !!data,

                    perfil:
                        data || null

                };

            } catch (erro) {

                console.error(
                    "Erro inesperado ao verificar perfil:",
                    erro
                );


                return {

                    sucesso: false,

                    possuiPerfil: false,

                    perfil: null,

                    erro

                };

            }

        },


        /* =================================================
           VERIFICAR SESSÃO INICIAL
           ================================================= */

        async verificarSessaoInicial() {

            const supabase =
                this.obterCliente();


            if (!supabase) {

                return {

                    sucesso: false,

                    sessao: null,

                    usuario: null

                };

            }


            try {

                const {
                    data,
                    error
                } =
                    await supabase.auth.getSession();


                if (error) {

                    console.error(
                        "Erro ao verificar sessão:",
                        error
                    );


                    return {

                        sucesso: false,

                        sessao: null,

                        usuario: null,

                        erro

                    };

                }


                return {

                    sucesso: true,

                    sessao:
                        data?.session || null,

                    usuario:
                        data?.session?.user || null

                };

            } catch (erro) {

                console.error(
                    "Erro inesperado ao verificar sessão:",
                    erro
                );


                return {

                    sucesso: false,

                    sessao: null,

                    usuario: null,

                    erro

                };

            }

        },


        /* =================================================
           OBSERVAR AUTENTICAÇÃO
           ================================================= */

        observarAutenticacao(callback) {

            const supabase =
                this.obterCliente();


            if (!supabase) {

                console.error(
                    "Cliente Supabase não disponível."
                );

                return null;

            }


            return supabase.auth.onAuthStateChange(
                callback
            );

        }

    };


    /* =====================================================
       EXPOR MÓDULO
       ===================================================== */

    window.Login = Login;


})(window);