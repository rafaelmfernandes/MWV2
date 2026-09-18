/* ============================================================
   MUSICALWORLD — MÓDULO DE AUTENTICAÇÃO

   Arquivo:
   js/auth/Login.js

   Responsabilidades:

   - Realizar login através do Supabase Auth.
   - Validar credenciais de autenticação.
   - Traduzir erros de autenticação.
   - Recuperar senha.
   - Iniciar autenticação social com Google.
   - Iniciar autenticação social com Apple.
   - Verificar se o usuário já possui perfil.
   - Verificar sessão existente.
   - Monitorar alterações no estado de autenticação.
   - Retornar resultados para o controlador visual da página.

   Este arquivo NÃO controla HTML.
   Este arquivo NÃO altera elementos visuais.
   Este arquivo NÃO decide visualmente qual tela exibir.

   A interface é responsabilidade de:
   js/login.js
============================================================ */

(function (window) {

    'use strict';

    const Login = {

        /* ========================================================
           REALIZAR LOGIN
        ======================================================== */

        async entrar({ email, senha }) {

            email = (email || '')
                .trim()
                .toLowerCase();

            senha = senha || '';

            if (!email) {

                return {
                    sucesso: false,
                    tipo: 'email',
                    mensagem: 'Informe seu e-mail.'
                };

            }

            if (!senha) {

                return {
                    sucesso: false,
                    tipo: 'senha',
                    mensagem: 'Informe sua senha.'
                };

            }

            console.log('======================================');
            console.log('🔐 INICIANDO LOGIN');
            console.log('======================================');
            console.log('📧 E-mail:', email);

            try {

                const {
                    data,
                    error
                } = await supabaseClient.auth.signInWithPassword({

                    email: email,

                    password: senha

                });

                /* ====================================================
                   ERRO DO SUPABASE
                ==================================================== */

                if (error) {

                    console.error(
                        '❌ Erro no login:',
                        error
                    );

                    return {
                        sucesso: false,
                        tipo: this.identificarTipoErro(error),
                        mensagem: this.traduzirErro(error)
                    };

                }

                /* ====================================================
                   GARANTIR SESSÃO
                ==================================================== */

                if (
                    !data?.session ||
                    !data?.user
                ) {

                    console.error(
                        '❌ Login retornou sem sessão ou usuário:',
                        data
                    );

                    return {
                        sucesso: false,
                        tipo: 'senha',
                        mensagem:
                            'Não foi possível criar sua sessão. Tente novamente.'
                    };

                }

                console.log(
                    '======================================'
                );

                console.log(
                    '✅ LOGIN REALIZADO COM SUCESSO'
                );

                console.log(
                    '======================================'
                );

                console.log(
                    '👤 Usuário:',
                    data.user
                );

                console.log(
                    '🆔 ID:',
                    data.user.id
                );

                console.log(
                    '📧 E-mail:',
                    data.user.email
                );

                console.log(
                    '🔐 Sessão criada:',
                    !!data.session
                );

                /* ====================================================
                   SALVAR DADOS AUXILIARES
                ==================================================== */

                try {

                    localStorage.setItem(
                        'musicalworld_usuario_id',
                        data.user.id
                    );

                    localStorage.setItem(
                        'musicalworld_usuario_email',
                        data.user.email || email
                    );

                } catch (erroStorage) {

                    console.warn(
                        '⚠️ Não foi possível salvar dados auxiliares:',
                        erroStorage
                    );

                }

                /* ====================================================
                   CONFIRMAR SESSÃO PELO MÓDULO Sessao
                ==================================================== */

                if (window.Sessao) {

                    try {

                        const sessaoAtual =
                            await Sessao.obter();

                        if (sessaoAtual) {

                            console.log(
                                '🔐 Sessão confirmada pelo módulo Sessao.'
                            );

                        } else {

                            console.warn(
                                '⚠️ Sessao.obter() não retornou sessão.'
                            );

                        }

                    } catch (erroSessao) {

                        console.warn(
                            '⚠️ Não foi possível confirmar a sessão pelo módulo Sessao:',
                            erroSessao
                        );

                    }

                } else {

                    console.warn(
                        '⚠️ Módulo Sessao não encontrado.'
                    );

                }

                return {
                    sucesso: true,
                    usuario: data.user,
                    sessao: data.session,
                    mensagem: 'Login realizado com sucesso.'
                };

            } catch (erro) {

                console.error(
                    '❌ Erro inesperado no login:',
                    erro
                );

                return {
                    sucesso: false,
                    tipo: 'senha',
                    mensagem:
                        'Ocorreu um erro ao entrar. Tente novamente.'
                };

            }

        },


        /* ========================================================
           IDENTIFICAR TIPO DO ERRO

           O Supabase normalmente não diferencia de forma segura
           "e-mail inexistente" de "senha incorreta".

           Por isso, credenciais inválidas são tratadas como
           erro de credenciais e a interface poderá destacar
           o campo de senha sem revelar existência de conta.
        ======================================================== */

        identificarTipoErro(error) {

            const mensagem =
                (error?.message || '').toLowerCase();

            if (
                mensagem.includes('email not confirmed') ||
                mensagem.includes('email_not_confirmed')
            ) {

                return 'email';

            }

            if (
                mensagem.includes('invalid login credentials') ||
                mensagem.includes('invalid credentials')
            ) {

                return 'credenciais';

            }

            return 'geral';

        },


        /* ========================================================
           TRADUZIR ERROS DO SUPABASE
        ======================================================== */

        traduzirErro(error) {

            const mensagem =
                (error?.message || '').toLowerCase();

            if (
                mensagem.includes('invalid login credentials') ||
                mensagem.includes('invalid credentials')
            ) {

                return 'E-mail ou senha incorretos.';

            }

            if (
                mensagem.includes('email not confirmed') ||
                mensagem.includes('email_not_confirmed')
            ) {

                return 'Seu e-mail ainda não foi confirmado.';

            }

            if (
                mensagem.includes('too many requests') ||
                mensagem.includes('rate limit')
            ) {

                return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';

            }

            return (
                error?.message ||
                'Não foi possível entrar. Tente novamente.'
            );

        },


        /* ========================================================
           RECUPERAÇÃO DE SENHA
        ======================================================== */

        async recuperarSenha(email) {

            email = (email || '')
                .trim()
                .toLowerCase();

            if (!email) {

                return {
                    sucesso: false,
                    mensagem: 'Informe seu e-mail.'
                };

            }

            try {

                console.log(
                    '🔑 Solicitação de recuperação de senha:',
                    email
                );

                const {
                    error
                } =
                    await supabaseClient.auth.resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                `${window.location.origin}/login.html`
                        }
                    );

                if (error) {

                    console.error(
                        '❌ Erro ao solicitar recuperação:',
                        error
                    );

                    return {
                        sucesso: false,
                        mensagem:
                            'Não foi possível solicitar a recuperação da senha.'
                    };

                }

                return {
                    sucesso: true,
                    mensagem:
                        'Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.'
                };

            } catch (erro) {

                console.error(
                    '❌ Erro inesperado na recuperação:',
                    erro
                );

                return {
                    sucesso: false,
                    mensagem:
                        'Ocorreu um erro ao solicitar a recuperação da senha.'
                };

            }

        },


        /* ========================================================
           AUTENTICAÇÃO SOCIAL

           Suporta:
           - Google
           - Apple

           O Supabase inicia o fluxo OAuth.

           Após a autenticação, o provedor retorna o usuário
           para login.html.

           O controlador visual deverá então verificar se esse
           usuário já possui perfil.

           Se possuir:
               index.html

           Se não possuir:
               configurar-conta.html
        ======================================================== */

        async social(provedor) {

            const provedores = {

                Google: 'google',

                Apple: 'apple'

            };

            const provider =
                provedores[provedor];

            /* ====================================================
               VALIDAR PROVEDOR
            ==================================================== */

            if (!provider) {

                console.error(
                    '❌ Provedor de autenticação não suportado:',
                    provedor
                );

                return {
                    sucesso: false,
                    mensagem:
                        'Provedor de autenticação não suportado.'
                };

            }

            /* ====================================================
               GARANTIR CLIENTE SUPABASE
            ==================================================== */

            if (
                typeof supabaseClient === 'undefined' ||
                !supabaseClient?.auth
            ) {

                console.error(
                    '❌ Cliente Supabase não disponível.'
                );

                return {
                    sucesso: false,
                    mensagem:
                        'Não foi possível iniciar a autenticação.'
                };

            }

            console.log(
                '======================================'
            );

            console.log(
                `🔐 INICIANDO LOGIN SOCIAL: ${provedor}`
            );

            console.log(
                '======================================'
            );

            try {

                /* ====================================================
                   PÁGINA DE RETORNO

                   O usuário volta para login.html depois do OAuth.

                   O js/login.js será responsável por verificar
                   se existe perfil e decidir o destino final.
                ==================================================== */

                const redirectTo =
                    `${window.location.origin}/login.html`;

                console.log(
                    '🔗 URL de retorno OAuth:',
                    redirectTo
                );

                /* ====================================================
                   INICIAR OAUTH
                ==================================================== */

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithOAuth({

                        provider: provider,

                        options: {

                            redirectTo: redirectTo

                        }

                    });

                /* ====================================================
                   ERRO AO INICIAR OAUTH
                ==================================================== */

                if (error) {

                    console.error(
                        `❌ Erro no login com ${provedor}:`,
                        error
                    );

                    return {
                        sucesso: false,
                        provedor: provedor,
                        provider: provider,
                        mensagem:
                            `Não foi possível entrar com ${provedor}. Tente novamente.`
                    };

                }

                /* ====================================================
                   O SUPABASE NORMALMENTE REDIRECIONA AUTOMATICAMENTE

                   Portanto, neste ponto não devemos tentar criar
                   sessão manualmente.
                ==================================================== */

                console.log(
                    `✅ Fluxo OAuth ${provedor} iniciado.`
                );

                console.log(
                    '🌐 URL OAuth:',
                    data?.url || 'não informada'
                );

                return {
                    sucesso: true,
                    provedor: provedor,
                    provider: provider,
                    url: data?.url || null,
                    redirecionamento: true,
                    mensagem:
                        `Redirecionando para ${provedor}...`
                };

            } catch (erro) {

                console.error(
                    `❌ Erro inesperado no login com ${provedor}:`,
                    erro
                );

                return {
                    sucesso: false,
                    provedor: provedor,
                    provider: provider,
                    mensagem:
                        `Ocorreu um erro ao entrar com ${provedor}. Tente novamente.`
                };

            }

        },


        /* ========================================================
           VERIFICAR PERFIL DO USUÁRIO

           Responsabilidades:
           - Verificar se o usuário autenticado possui perfil.
           - Retornar o perfil encontrado.
           - Não criar perfil.
           - Não alterar dados.
           - Não redirecionar páginas.

           O controlador visual utiliza esse resultado para
           decidir entre:

               index.html

           ou:

               configurar-conta.html
        ======================================================== */

        async verificarPerfilUsuario(usuarioId) {

            if (!usuarioId) {

                console.error(
                    '❌ ID do usuário não informado.'
                );

                return {
                    sucesso: false,
                    possuiPerfil: false,
                    perfil: null,
                    mensagem:
                        'Usuário não identificado.'
                };

            }

            if (
                typeof supabaseClient === 'undefined' ||
                !supabaseClient
            ) {

                console.error(
                    '❌ Cliente Supabase não disponível.'
                );

                return {
                    sucesso: false,
                    possuiPerfil: false,
                    perfil: null,
                    mensagem:
                        'Cliente Supabase não disponível.'
                };

            }

            try {

                console.log(
                    '🔎 Verificando perfil do usuário:',
                    usuarioId
                );

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from('perfis')
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
                        .eq('usuario_id', usuarioId)
                        .limit(1);

                /* ====================================================
                   ERRO NA CONSULTA
                ==================================================== */

                if (error) {

                    console.error(
                        '❌ Erro ao verificar perfil:',
                        error
                    );

                    return {
                        sucesso: false,
                        possuiPerfil: false,
                        perfil: null,
                        mensagem:
                            'Não foi possível verificar o perfil da conta.'
                    };

                }

                /* ====================================================
                   USUÁRIO SEM PERFIL
                ==================================================== */

                const perfil =
                    Array.isArray(data)
                        ? data[0] || null
                        : null;

                if (!perfil) {

                    console.log(
                        '🆕 Usuário autenticado ainda não possui perfil.'
                    );

                    return {
                        sucesso: true,
                        possuiPerfil: false,
                        perfil: null,
                        mensagem:
                            'Conta autenticada sem perfil configurado.'
                    };

                }

                /* ====================================================
                   PERFIL ENCONTRADO
                ==================================================== */

                console.log(
                    '👤 Perfil encontrado:',
                    perfil
                );

                console.log(
                    '📋 Tipo de perfil:',
                    perfil?.tipos_perfil?.nome || 'Não identificado'
                );

                return {
                    sucesso: true,
                    possuiPerfil: true,
                    perfil: perfil,
                    mensagem:
                        'Perfil já configurado.'
                };

            } catch (erro) {

                console.error(
                    '❌ Erro inesperado ao verificar perfil:',
                    erro
                );

                return {
                    sucesso: false,
                    possuiPerfil: false,
                    perfil: null,
                    mensagem:
                        'Ocorreu um erro ao verificar o perfil.'
                };

            }

        },


        /* ========================================================
           VERIFICAR SESSÃO INICIAL
        ======================================================== */

        async verificarSessaoInicial() {

            try {

                console.log(
                    '🔎 Verificando sessão existente...'
                );

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.getSession();

                if (error) {

                    console.error(
                        '❌ Erro ao verificar sessão:',
                        error
                    );

                    return null;

                }

                if (data?.session) {

                    console.log(
                        '🔐 Já existe uma sessão ativa.'
                    );

                    console.log(
                        '👤 Usuário:',
                        data.session.user
                    );

                    return data.session;

                }

                console.log(
                    '🔓 Nenhuma sessão ativa.'
                );

                return null;

            } catch (erro) {

                console.error(
                    '❌ Erro ao verificar sessão inicial:',
                    erro
                );

                return null;

            }

        },


        /* ========================================================
           MONITORAR AUTENTICAÇÃO

           Este método apenas observa o Supabase.

           Ele NÃO redireciona páginas e NÃO altera HTML.
        ======================================================== */

        observarAutenticacao() {

            if (
                typeof supabaseClient === 'undefined' ||
                !supabaseClient?.auth
            ) {

                console.error(
                    '❌ Cliente Supabase não disponível.'
                );

                return null;

            }

            return supabaseClient.auth.onAuthStateChange(
                (evento, sessao) => {

                    console.log(
                        '🔄 Estado da autenticação:',
                        evento
                    );

                    if (sessao?.user) {

                        console.log(
                            '👤 Usuário autenticado:',
                            sessao.user.id
                        );

                    } else {

                        console.log(
                            '🔓 Nenhum usuário autenticado.'
                        );

                    }

                }
            );

        }

    };


    /* ============================================================
       DISPONIBILIZAR MÓDULO GLOBALMENTE
    ============================================================ */

    window.Login = Login;


})(window);