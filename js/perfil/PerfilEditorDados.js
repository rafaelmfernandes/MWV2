/* ============================================================
   MUSICALWORLD — PERFIL EDITOR DADOS
   Arquivo: PerfilEditorDados.js
   ============================================================

   RESPONSABILIDADE:

   Este módulo é responsável exclusivamente pela comunicação
   entre o editor de perfil e o Supabase.

   Ele cuida de:

   - carregar o usuário;
   - carregar o perfil;
   - localizar o perfil artístico;
   - carregar os dados de perfis_artistas;
   - salvar usuarios;
   - salvar perfis;
   - salvar perfis_artistas;
   - confirmar os dados retornados pelo Supabase;
   - atualizar o estado local após o salvamento.

   ESTE MÓDULO NÃO É RESPONSÁVEL POR:

   - manipular diretamente a interface;
   - controlar eventos de botões;
   - preencher campos HTML;
   - alterar visualmente o avatar;
   - controlar abas;
   - fazer upload de fotos.

   A interface fica no PerfilEditorUI.js.

   O PerfilEditor.js coordena este módulo.

   IMPORTANTE:

   perfil_publicado é controlado diretamente pelo checkbox
   da interface.

   Este módulo NÃO deve criar regras automáticas que alterem
   o valor de perfil_publicado.

   ============================================================ */

const PerfilEditorDados = (() => {

    "use strict";


    let contexto = null;


    /* ========================================================
       CONFIGURAÇÃO
       ======================================================== */

    function configurar(novoContexto) {

        contexto =
            novoContexto || null;

    }


    /* ========================================================
       SUPABASE
       ======================================================== */

    function obterSupabase() {

        if (
            contexto &&
            contexto.supabase
        ) {

            return contexto.supabase;

        }


        return window.supabaseClient;

    }


    /* ========================================================
       CARREGAR DADOS DO PERFIL
       ======================================================== */

    async function carregarDados() {

        if (!contexto) {

            throw new Error(
                "PerfilEditorDados: contexto não configurado."
            );

        }


        const estado =
            contexto.estado;


        const CONFIG =
            contexto.CONFIG;


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


            return null;

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "SupabaseClient não foi carregado."
            );

        }


        /* ====================================================
           USUÁRIO
           ==================================================== */

        const {
            data: usuario,
            error: erroUsuario
        } = await supabase
            .from(
                CONFIG.tabelas.usuarios
            )
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

                email:
                    estado.usuarioAuth?.email ||
                    estado.usuarioAuth?.user?.email ||
                    "",

                telefone:
                    null,

                foto_url:
                    null,

                ativo:
                    true

            };


        /* ====================================================
           PERFIS
           ==================================================== */

        const {
            data: perfis,
            error: erroPerfil
        } = await supabase
            .from(
                CONFIG.tabelas.perfis
            )
            .select(
                "id,usuario_id,tipo_perfil_id,nome_exibicao,descricao,ativo,perfil_publicado,tipos_perfil(id,nome,descricao)"
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
                        String(
                            nomeTipo
                        )
                            .trim()
                            .toLowerCase() ===
                        "artista"
                    );

                }
            );


        const perfilContratanteTipo =
            (perfis || []).find(
                (perfil) => {

                    const nomeTipo =
                        perfil?.tipos_perfil?.nome ||
                        "";


                    return (
                        String(
                            nomeTipo
                        )
                            .trim()
                            .toLowerCase() ===
                        "contratante"
                    );

                }
            );


        if (!perfilArtistaTipo) {

            if (perfilContratanteTipo) {

                throw new Error(
                    "Este é um perfil de Contratante. O editor artístico não deve ser utilizado para este perfil."
                );

            }


            throw new Error(
                "Perfil artístico não encontrado."
            );

        }


        estado.perfil =
            perfilArtistaTipo;


        /* ====================================================
           PERFIL ARTÍSTICO
           ==================================================== */

        const {
            data: perfilArtista,
            error: erroPerfilArtista
        } = await supabase
            .from(
                CONFIG.tabelas.perfisArtistas
            )
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
                    null,

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


        /* ====================================================
           TIPO ARTÍSTICO
           ==================================================== */

        const tipoInformado =
            estado.perfilArtista.tipo_artista;


        let tipoConfigurado =
            null;


        if (
            window.PerfilEditorTipo &&
            typeof window.PerfilEditorTipo.resolver === "function"
        ) {

            tipoConfigurado =
                window.PerfilEditorTipo.resolver(
                    tipoInformado
                );

        }


        if (!tipoConfigurado) {

            console.warn(
                "PerfilEditorDados: tipo artístico não reconhecido:",
                tipoInformado
            );

        } else {

            estado.perfilArtista.tipo_artista =
                tipoInformado ||
                tipoConfigurado.nome;

        }


        return {

            usuario:
                estado.usuario,

            perfil:
                estado.perfil,

            perfilArtista:
                estado.perfilArtista

        };

    }


    /* ========================================================
       OBTER VALOR DE PUBLICAÇÃO
       ======================================================== */

    function obterValorPublicacao() {

        const checkbox =
            document.getElementById(
                "perfilPublicado"
            );


        if (checkbox) {

            return Boolean(
                checkbox.checked
            );

        }


        return contexto?.estado?.perfil?.perfil_publicado === true;

    }


    /* ========================================================
       SALVAR PERFIL
       ======================================================== */

    async function salvarPerfil(
        dados
    ) {

        if (!contexto) {

            throw new Error(
                "PerfilEditorDados: contexto não configurado."
            );

        }


        const estado =
            contexto.estado;


        const CONFIG =
            contexto.CONFIG;


        const supabase =
            obterSupabase();


        if (!supabase) {

            throw new Error(
                "SupabaseClient não foi carregado."
            );

        }


        const agora =
            new Date().toISOString();


        const nome =
            String(
                dados?.nome || ""
            ).trim();


        const nomeExibicao =
            String(
                dados?.nomeExibicao || ""
            ).trim();


        const telefone =
            String(
                dados?.telefone || ""
            ).trim();


        const localizacao =
            String(
                dados?.localizacao || ""
            ).trim();


        const descricao =
            String(
                dados?.descricao || ""
            ).trim();


        const experiencia =
            String(
                dados?.experiencia || ""
            ).trim();


        const areaAtendimento =
            String(
                dados?.areaAtendimento || ""
            ).trim();


        const tipoValidado =
            dados?.tipoValidado;


        const disponivel =
            Boolean(
                dados?.disponivel
            );


        const instrumentos =
            Array.isArray(
                dados?.instrumentos
            )
                ? dados.instrumentos
                : [];


        const estilos =
            Array.isArray(
                dados?.estilos
            )
                ? dados.estilos
                : [];


        const servicos =
            Array.isArray(
                dados?.servicos
            )
                ? dados.servicos
                : [];


        const fotoUrl =
            dados?.fotoUrl ||
            null;


        /*
         * IMPORTANTE:
         *
         * O valor vem diretamente do checkbox.
         *
         * Não existe aqui nenhuma regra de "perfil completo".
         * O banco deve respeitar exatamente o que o usuário
         * marcou no editor.
         */

        const perfilPublicado =
            dados?.perfilPublicado !== undefined

                ? Boolean(
                    dados.perfilPublicado
                )

                : obterValorPublicacao();


        /* ====================================================
           USUARIOS
           ==================================================== */

        const dadosUsuario = {

            nome,

            telefone:
                telefone || null,

            foto_url:
                fotoUrl

        };


        const {
            error: erroUsuario
        } = await supabase
            .from(
                CONFIG.tabelas.usuarios
            )
            .update(
                dadosUsuario
            )
            .eq(
                "id",
                estado.usuarioAuth.id
            );


        if (erroUsuario) {

            throw erroUsuario;

        }


        /* ====================================================
           PERFIS
           ==================================================== */

        const dadosPerfil = {

            nome_exibicao:
                nomeExibicao,

            descricao:
                descricao || null,

            ativo:
                true,

            perfil_publicado:
                perfilPublicado,

            updated_at:
                agora

        };


        console.log(
            "PerfilEditorDados: salvando PERFIS:",
            {
                perfilId:
                    estado.perfil.id,

                usuarioId:
                    estado.usuarioAuth.id,

                perfilPublicado,

                dados:
                    dadosPerfil
            }
        );


        const {
            data: perfilAtualizado,
            error: erroPerfil
        } = await supabase
            .from(
                CONFIG.tabelas.perfis
            )
            .update(
                dadosPerfil
            )
            .eq(
                "id",
                estado.perfil.id
            )
            .eq(
                "usuario_id",
                estado.usuarioAuth.id
            )
            .select(
                "id,usuario_id,tipo_perfil_id,nome_exibicao,descricao,ativo,perfil_publicado,updated_at,tipos_perfil(id,nome,descricao)"
            )
            .maybeSingle();


        if (erroPerfil) {

            console.error(
                "PerfilEditorDados: erro ao atualizar PERFIS:",
                erroPerfil
            );


            throw erroPerfil;

        }


        if (!perfilAtualizado) {

            throw new Error(
                "O perfil não foi atualizado no banco. Verifique as políticas de acesso da tabela perfis."
            );

        }


        console.log(
            "PerfilEditorDados: PERFIL confirmado pelo Supabase:",
            {
                id:
                    perfilAtualizado.id,

                perfilPublicadoEnviado:
                    perfilPublicado,

                perfilPublicadoRecebido:
                    perfilAtualizado.perfil_publicado,

                ativoRecebido:
                    perfilAtualizado.ativo
            }
        );


        if (
            Boolean(
                perfilAtualizado.perfil_publicado
            ) !==
            Boolean(
                perfilPublicado
            )
        ) {

            throw new Error(
                `O banco não confirmou a publicação do perfil. Enviado: ${perfilPublicado ? "true" : "false"} | Recebido: ${perfilAtualizado.perfil_publicado ? "true" : "false"}`
            );

        }


        /* ====================================================
           PERFIS_ARTISTAS
           ==================================================== */

        const dadosArtista = {

            tipo_artista:
                tipoValidado.nome,

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


        console.log(
            "PerfilEditorDados: salvando PERFIS_ARTISTAS:",
            {
                perfilId:
                    estado.perfil.id,

                dados:
                    dadosArtista
            }
        );


        let perfilArtistaAtualizado =
            null;


        if (
            estado.perfilArtista?.id
        ) {

            const {
                data: artistaAtualizado,
                error: erroAtualizacaoArtista
            } = await supabase
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
                )
                .select()
                .maybeSingle();


            if (erroAtualizacaoArtista) {

                throw erroAtualizacaoArtista;

            }


            perfilArtistaAtualizado =
                artistaAtualizado ||
                null;

        } else {

            const {
                data: novoPerfilArtista,
                error: erroInsercaoArtista
            } = await supabase
                .from(
                    CONFIG.tabelas.perfisArtistas
                )
                .insert({

                    perfil_id:
                        estado.perfil.id,

                    ...dadosArtista

                })
                .select()
                .maybeSingle();


            if (erroInsercaoArtista) {

                throw erroInsercaoArtista;

            }


            perfilArtistaAtualizado =
                novoPerfilArtista ||
                null;

        }


        /* ====================================================
           ATUALIZA ESTADO LOCAL
           ==================================================== */

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

            ...perfilAtualizado,

            nome_exibicao:
                perfilAtualizado.nome_exibicao,

            descricao:
                perfilAtualizado.descricao,

            ativo:
                perfilAtualizado.ativo,

            perfil_publicado:
                perfilAtualizado.perfil_publicado

        };


        estado.perfilArtista = {

            ...estado.perfilArtista,

            ...dadosArtista,

            ...(perfilArtistaAtualizado || {}),

            perfil_id:
                estado.perfil.id

        };


        return {

            usuario:
                estado.usuario,

            perfil:
                perfilAtualizado,

            perfilArtista:
                estado.perfilArtista,

            perfilPublicado:
                perfilAtualizado.perfil_publicado,

            fotoUrl,

            dadosArtista

        };

    }


    /* ========================================================
       API PÚBLICA
       ======================================================== */

    return {

        configurar,

        carregarDados,

        salvarPerfil,

        obterValorPublicacao

    };

})();


window.PerfilEditorDados =
    PerfilEditorDados;