/* ============================================================
   MUSICALWORLD — MÓDULO DE CADASTRO

   Arquivo:
   js/auth/cadastro.js

   Responsabilidades:
   - Validar dados básicos do cadastro.
   - Criar a conta através da Edge Function oficial.
   - Informar se o usuário é artista ou contratante.
   - Enviar o tipo de artista quando aplicável.
   - Salvar dados auxiliares do usuário.
   - Retornar resultados para o controlador visual.

   Este arquivo NÃO exibe alertas.
   Este arquivo NÃO manipula HTML.

   A interface é responsabilidade de:
   js/login.js
   ============================================================ */

(function (window) {

    'use strict';

    const Cadastro = {

        /* ========================================================
           CRIAR CONTA
        ======================================================== */

        async criar({
            nome,
            email,
            senha,
            tipoPerfil,
            tipoArtista
        }) {

            nome = (nome || '').trim();

            email = (email || '')
                .trim()
                .toLowerCase();

            tipoPerfil =
                tipoPerfil === 'artista'
                    ? 'artista'
                    : 'contratante';

            tipoArtista =
                (tipoArtista || '').trim() || null;


            /* ====================================================
               VALIDAÇÕES
            ==================================================== */

            if (!nome) {

                return {
                    sucesso: false,
                    campo: 'nome',
                    mensagem: 'Preencha seu nome.'
                };

            }


            if (!email) {

                return {
                    sucesso: false,
                    campo: 'email',
                    mensagem: 'Preencha seu e-mail.'
                };

            }


            if (!senha) {

                return {
                    sucesso: false,
                    campo: 'senha',
                    mensagem: 'Preencha sua senha.'
                };

            }


            if (senha.length < 6) {

                return {
                    sucesso: false,
                    campo: 'senha',
                    mensagem:
                        'A senha deve ter pelo menos 6 caracteres.'
                };

            }


            if (
                tipoPerfil === 'artista' &&
                !tipoArtista
            ) {

                return {
                    sucesso: false,
                    campo: 'tipoArtista',
                    mensagem:
                        'Selecione seu tipo de artista.'
                };

            }


            console.log(
                '📝 Iniciando cadastro oficial do MusicalWorld...'
            );

            console.log(
                '👤 Nome:',
                nome
            );

            console.log(
                '📧 E-mail:',
                email
            );

            console.log(
                '🎭 Tipo de perfil:',
                tipoPerfil
            );

            console.log(
                '🎤 Tipo de artista:',
                tipoPerfil === 'artista'
                    ? tipoArtista
                    : 'Não é artista'
            );


            /* ====================================================
               DADOS PARA A EDGE FUNCTION
            ==================================================== */

            const dadosCadastro = {

                nome,

                email,

                senha,

                tipoPerfil,

                tipoArtista:
                    tipoPerfil === 'artista'
                        ? tipoArtista
                        : null

            };


            try {

                const resposta =
                    await fetch(
                        `${SUPABASE_URL}/functions/v1/criar-conta`,
                        {

                            method: 'POST',

                            headers: {

                                'Content-Type':
                                    'application/json',

                                'apikey':
                                    SUPABASE_ANON_KEY,

                                'Authorization':
                                    `Bearer ${SUPABASE_ANON_KEY}`

                            },

                            body:
                                JSON.stringify(
                                    dadosCadastro
                                )

                        }
                    );


                let resultado;


                try {

                    resultado =
                        await resposta.json();

                } catch {

                    resultado = null;

                }


                console.log(
                    '📨 Resposta da criar-conta:',
                    resultado
                );


                /* ====================================================
                   ERRO DA EDGE FUNCTION
                ==================================================== */

                if (
                    !resposta.ok ||
                    !resultado?.sucesso
                ) {

                    console.error(
                        '❌ A Edge Function recusou o cadastro:',
                        resultado
                    );


                    return {

                        sucesso: false,

                        campo:
                            this.identificarCampoErro(
                                resposta.status,
                                resultado
                            ),

                        status:
                            resposta.status,

                        mensagem:
                            resultado?.mensagem ||
                            this.traduzirErroStatus(
                                resposta.status
                            )

                    };

                }


                /* ====================================================
                   CADASTRO CONCLUÍDO
                ==================================================== */

                console.log(
                    '✅ Conta criada pela Edge Function:',
                    resultado
                );


                /* ====================================================
                   SALVAR DADOS AUXILIARES
                ==================================================== */

                if (
                    resultado.usuario?.id
                ) {

                    try {

                        localStorage.setItem(
                            'musicalworld_usuario_id',
                            resultado.usuario.id
                        );

                        localStorage.setItem(
                            'musicalworld_usuario_email',
                            resultado.usuario.email || email
                        );

                    } catch (erroStorage) {

                        console.warn(
                            '⚠️ Não foi possível salvar os dados locais:',
                            erroStorage
                        );

                    }

                }


                return {

                    sucesso: true,

                    usuario:
                        resultado.usuario || null,

                    sessao:
                        resultado.sessao || null,

                    tipoPerfil,

                    tipoArtista,

                    mensagem:
                        tipoPerfil === 'artista'
                            ? 'Cadastro realizado com sucesso! Seu perfil artístico foi criado.'
                            : 'Cadastro realizado com sucesso! Sua conta está pronta para uso.'

                };


            } catch (erro) {

                console.error(
                    '❌ Erro inesperado ao chamar criar-conta:',
                    erro
                );


                return {

                    sucesso: false,

                    campo: 'geral',

                    mensagem:
                        'Não foi possível conectar ao serviço de cadastro. Verifique sua conexão e tente novamente.'

                };

            }

        },


        /* ========================================================
           IDENTIFICAR CAMPO RELACIONADO AO ERRO
        ======================================================== */

        identificarCampoErro(
            status,
            resultado
        ) {

            const mensagem =
                (
                    resultado?.mensagem ||
                    ''
                ).toLowerCase();


            if (
                mensagem.includes('e-mail') ||
                mensagem.includes('email')
            ) {

                return 'email';

            }


            if (
                mensagem.includes('senha')
            ) {

                return 'senha';

            }


            if (
                mensagem.includes('nome')
            ) {

                return 'nome';

            }


            if (
                mensagem.includes('artista') ||
                mensagem.includes('tipo')
            ) {

                return 'tipoArtista';

            }


            if (status === 409) {

                return 'email';

            }


            return 'geral';

        },


        /* ========================================================
           TRADUZIR STATUS HTTP
        ======================================================== */

        traduzirErroStatus(status) {

            if (status === 409) {

                return 'Este e-mail já está cadastrado.';

            }


            if (status === 400) {

                return 'Confira os dados informados e tente novamente.';

            }


            return 'Não foi possível concluir o cadastro.';

        }

    };


    window.Cadastro =
        Cadastro;


})(window);