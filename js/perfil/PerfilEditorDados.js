
/* ============================================================
   MUSICALWORLD — PERFIL EDITOR DADOS

   Arquivo:
   js/perfil/PerfilEditorDados.js

   RESPONSABILIDADE:

   Este módulo é responsável exclusivamente pela comunicação
   entre o editor de perfil e o Supabase.

   Tipos de perfil suportados:

   * ARTISTA
   * CONTRATANTE
   * ESTABELECIMENTO

   ARTISTA:

   * usuarios
   * perfis
   * perfis_artistas

   CONTRATANTE:

   * usuarios
   * perfis

   ESTABELECIMENTO:

   * usuarios
   * perfis
   * perfis_estabelecimentos

   O contratante NÃO utiliza:
   * perfis_artistas
   * perfis_estabelecimentos

   O artista NÃO utiliza:
   * perfis_estabelecimentos

   O estabelecimento NÃO utiliza:
   * perfis_artistas

   Este módulo cuida de:

   * carregar o usuário autenticado;
   * carregar os dados de usuarios;
   * localizar o perfil correto;
   * identificar o tipo do perfil;
   * identificar a categoria do tipo;
   * carregar perfis_artistas somente para artistas;
   * carregar perfis_estabelecimentos somente para estabelecimentos;
   * salvar usuarios;
   * salvar perfis;
   * salvar perfis_artistas somente para artistas;
   * salvar perfis_estabelecimentos somente para estabelecimentos;
   * confirmar os dados retornados pelo Supabase;
   * atualizar o estado local após o salvamento.

   ESTE MÓDULO NÃO É RESPONSÁVEL POR:

   * manipular diretamente a interface;
   * controlar eventos de botões;
   * preencher campos HTML;
   * alterar visualmente o avatar;
   * controlar abas;
   * fazer upload de fotos.

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
   IDENTIFICAR TIPO DE PERFIL
   ======================================================== */

function normalizarTipoPerfil(valor) {

    return String(
        valor || ""
    )
        .trim()
        .toLowerCase();

}


/*
 * Resolve a configuração centralizada do tipo de perfil.
 *
 * A identificação de estabelecimento não depende de uma lista
 * duplicada de nomes aqui. O PerfilEditorTipo.js é a fonte
 * central das categorias e tipos existentes no sistema.
 */

function resolverConfiguracaoTipo(perfil) {

    const nomeTipo =
        perfil?.tipos_perfil?.nome || "";


    if (
        window.PerfilEditorTipo &&
        typeof window.PerfilEditorTipo.resolver === "function"
    ) {

        return window.PerfilEditorTipo.resolver(
            nomeTipo
        );

    }


    return null;

}


function identificarTipoPerfil(perfis) {

    const lista =
        Array.isArray(perfis)
            ? perfis
            : [];


    let perfilArtista =
        null;


    let perfilEstabelecimento =
        null;


    let perfilContratante =
        null;


    lista.forEach(
        (perfil) => {

            const configuracao =
                resolverConfiguracaoTipo(
                    perfil
                );


            const categoria =
                normalizarTipoPerfil(
                    configuracao?.categoria
                );


            const nomeTipo =
                normalizarTipoPerfil(
                    perfil?.tipos_perfil?.nome
                );


            /*
             * ARTISTA
             *
             * Mantemos também a verificação pelo nome
             * "artista" para preservar o comportamento atual.
             */

            if (
                nomeTipo === "artista" ||
                categoria === "artista"
            ) {

                if (!perfilArtista) {

                    perfilArtista =
                        perfil;

                }

                return;

            }


            /*
             * ESTABELECIMENTO
             *
             * A categoria vem do PerfilEditorTipo.js.
             *
             * Isso permite reconhecer:
             *
             * organizador_eventos
             * casa_shows
             * empresa_agencia
             * restaurante
             * hotel
             * clube
             * boate
             * pousada
             * bar
             */

            if (
                categoria === "estabelecimento"
            ) {

                if (!perfilEstabelecimento) {

                    perfilEstabelecimento =
                        perfil;

                }

                return;

            }


            /*
             * CONTRATANTE
             *
             * Continua sendo identificado pelo tipo
             * "contratante".
             */

            if (
                nomeTipo === "contratante" ||
                categoria === "contratante"
            ) {

                if (!perfilContratante) {

                    perfilContratante =
                        perfil;

                }

            }

        }
    );


    /*
     * ARTISTA continua tendo prioridade.
     *
     * Isso preserva o comportamento anterior do editor.
     */

    if (perfilArtista) {

        return {

            tipoPerfil:
                "artista",

            perfil:
                perfilArtista

        };

    }


    /*
     * Caso não exista artista, trabalhamos com
     * o perfil de estabelecimento.
     */

    if (perfilEstabelecimento) {

        return {

            tipoPerfil:
                "estabelecimento",

            perfil:
                perfilEstabelecimento

        };

    }


    /*
     * Caso não exista artista nem estabelecimento,
     * mantemos o comportamento do contratante.
     */

    if (perfilContratante) {

        return {

            tipoPerfil:
                "contratante",

            perfil:
                perfilContratante

        };

    }


    return {

        tipoPerfil:
            null,

        perfil:
            null

    };

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


    /* ====================================================
       SESSÃO
       ==================================================== */

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


    const emailAuth =
        estado.usuarioAuth?.email ||
        estado.usuarioAuth?.user?.email ||
        "";


    const nomeAuth =
        estado.usuarioAuth?.user_metadata?.nome ||
        emailAuth ||
        "Usuário";


    estado.usuario =
        usuario || {

            id:
                estado.usuarioAuth.id,

            nome:
                nomeAuth,

            email:
                emailAuth,

            telefone:
                null,

            foto_url:
                null,

            ativo:
                true

        };


    /*
     * O e-mail de autenticação é a fonte mais confiável
     * para o endereço de acesso.
     *
     * Se usuarios.email estiver vazio, usamos o e-mail
     * da sessão apenas para disponibilizá-lo ao editor.
     *
     * Não alteramos o e-mail automaticamente no banco.
     */

    if (
        !estado.usuario.email &&
        emailAuth
    ) {

        estado.usuario.email =
            emailAuth;

    }


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


    const resultadoTipo =
        identificarTipoPerfil(
            perfis
        );


    if (!resultadoTipo.perfil) {

        throw new Error(
            "Nenhum perfil ativo de Artista, Contratante ou Estabelecimento foi encontrado para este usuário."
        );

    }


    estado.tipoPerfil =
        resultadoTipo.tipoPerfil;


    estado.perfil =
        resultadoTipo.perfil;


    /*
     * Mantemos propriedades booleanas simples para
     * facilitar verificações nos outros módulos.
     */

    estado.isArtista =
        estado.tipoPerfil === "artista";


    estado.isContratante =
        estado.tipoPerfil === "contratante";


    estado.isEstabelecimento =
        estado.tipoPerfil === "estabelecimento";


    console.log(
        "PerfilEditorDados: tipo de perfil identificado:",
        estado.tipoPerfil
    );


    /* ====================================================
       PERFIL ARTÍSTICO
       ==================================================== */

    if (
        estado.isArtista
    ) {

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


        /*
         * Artistas não possuem dados de estabelecimento.
         */

        estado.perfilEstabelecimento =
            null;


        /* ================================================
           TIPO ARTÍSTICO
           ================================================ */

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

    } else {

        /*
         * Não artistas não possuem perfil artístico.
         */

        estado.perfilArtista =
            null;

    }


    /* ====================================================
       PERFIL DO ESTABELECIMENTO
       ==================================================== */

    if (
        estado.isEstabelecimento
    ) {

        /*
         * O nome da tabela é obtido da configuração quando
         * disponível.
         *
         * O fallback mantém este módulo compatível com a
         * configuração atual enquanto o PerfilEditor.js ainda
         * não recebeu a nova constante.
         */

        const tabelaEstabelecimentos =
            CONFIG?.tabelas?.perfisEstabelecimentos ||
            "perfis_estabelecimentos";


        const {
            data: perfilEstabelecimento,
            error: erroPerfilEstabelecimento
        } = await supabase
            .from(
                tabelaEstabelecimentos
            )
            .select(
                "id,perfil_id,endereco,numero,bairro,cidade,estado,cep,telefone_comercial,instagram,site,capacidade,estrutura,estilos_musicais,aceita_musica_ao_vivo,created_at,updated_at"
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            )
            .maybeSingle();


        if (erroPerfilEstabelecimento) {

            throw erroPerfilEstabelecimento;

        }


        estado.perfilEstabelecimento =
            perfilEstabelecimento || {

                id:
                    null,

                perfil_id:
                    estado.perfil.id,

                endereco:
                    null,

                numero:
                    null,

                bairro:
                    null,

                cidade:
                    null,

                estado:
                    null,

                cep:
                    null,

                telefone_comercial:
                    null,

                instagram:
                    null,

                site:
                    null,

                capacidade:
                    null,

                estrutura:
                    null,

                estilos_musicais:
                    null,

                aceita_musica_ao_vivo:
                    false,

                created_at:
                    null,

                updated_at:
                    null

            };


        /*
         * Estabelecimentos não possuem perfil artístico.
         */

        estado.perfilArtista =
            null;

    } else {

        /*
         * Apenas estabelecimentos utilizam
         * perfis_estabelecimentos.
         */

        estado.perfilEstabelecimento =
            null;

    }


    /* ====================================================
       RESULTADO
       ==================================================== */

    return {

        usuario:
            estado.usuario,

        perfil:
            estado.perfil,

        perfilArtista:
            estado.perfilArtista,

        perfilEstabelecimento:
            estado.perfilEstabelecimento,

        tipoPerfil:
            estado.tipoPerfil,

        isArtista:
            estado.isArtista,

        isContratante:
            estado.isContratante,

        isEstabelecimento:
            estado.isEstabelecimento

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


    if (
        !estado.perfil ||
        !estado.tipoPerfil
    ) {

        throw new Error(
            "O tipo do perfil não foi identificado antes do salvamento."
        );

    }


    const agora =
        new Date().toISOString();


    /* ====================================================
       DADOS COMUNS
       ==================================================== */

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


    /*
     * Para o contratante e estabelecimento, o local principal
     * da foto continua sendo usuarios.foto_url.
     *
     * Para artista, mantemos também o comportamento atual.
     */

    const fotoUrl =
        dados?.fotoUrl !== undefined
            ? (
                dados.fotoUrl ||
                null
            )
            : (
                estado.usuario?.foto_url ||
                null
            );


    /* ====================================================
       DADOS DO ESTABELECIMENTO
       ==================================================== */

    /*
     * Estes campos ficam preparados nesta etapa para que
     * o PerfilEditor.js possa fornecê-los posteriormente.
     *
     * Não interferem em artistas ou contratantes.
     */

    const endereco =
        String(
            dados?.endereco || ""
        ).trim();


    const numero =
        String(
            dados?.numero || ""
        ).trim();


    const bairro =
        String(
            dados?.bairro || ""
        ).trim();


    const cidade =
        String(
            dados?.cidade || ""
        ).trim();


    const estadoEstabelecimento =
        String(
            dados?.estado || ""
        ).trim();


    const cep =
        String(
            dados?.cep || ""
        ).trim();


    const telefoneComercial =
        String(
            dados?.telefoneComercial || ""
        ).trim();


    const instagram =
        String(
            dados?.instagram || ""
        ).trim();


    const site =
        String(
            dados?.site || ""
        ).trim();


    const capacidade =
        dados?.capacidade !== undefined &&
        dados?.capacidade !== null &&
        dados?.capacidade !== ""
            ? Number(
                dados.capacidade
            )
            : null;


    const estrutura =
        String(
            dados?.estrutura || ""
        ).trim();


    const estilosMusicais =
        String(
            dados?.estilosMusicais || ""
        ).trim();


    const aceitaMusicaAoVivo =
        Boolean(
            dados?.aceitaMusicaAoVivo
        );


    /* ====================================================
       PUBLICAÇÃO
       ==================================================== */

    /*
     * O valor vem diretamente do checkbox.
     *
     * Não existe aqui nenhuma regra de "perfil completo".
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
        data: usuarioAtualizado,
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
        )
        .select(
            "id,nome,email,telefone,foto_url,ativo"
        )
        .maybeSingle();


    if (erroUsuario) {

        throw erroUsuario;

    }


    if (usuarioAtualizado) {

        estado.usuario =
            usuarioAtualizado;

    } else {

        estado.usuario = {

            ...estado.usuario,

            ...dadosUsuario

        };

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

            tipoPerfil:
                estado.tipoPerfil,

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

            tipoPerfil:
                estado.tipoPerfil,

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
       SOMENTE PARA ARTISTAS
       ==================================================== */

    let perfilArtistaAtualizado =
        null;


    let dadosArtista =
        null;


    if (
        estado.isArtista
    ) {

        /*
         * Segurança adicional:
         *
         * Um artista precisa ter um tipo artístico válido
         * antes de gravarmos perfis_artistas.
         */

        if (
            !tipoValidado ||
            !tipoValidado.nome
        ) {

            throw new Error(
                "O tipo artístico não foi definido corretamente."
            );

        }


        dadosArtista = {

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


        estado.perfilArtista = {

            ...estado.perfilArtista,

            ...dadosArtista,

            ...(perfilArtistaAtualizado || {}),

            perfil_id:
                estado.perfil.id

        };

    } else {

        /*
         * CONTRATANTE E ESTABELECIMENTO:
         *
         * Nunca criamos, atualizamos ou removemos registros
         * em perfis_artistas.
         */

        estado.perfilArtista =
            null;

    }


    /* ====================================================
       PERFIS_ESTABELECIMENTOS
       SOMENTE PARA ESTABELECIMENTOS
       ==================================================== */

    let perfilEstabelecimentoAtualizado =
        null;


    let dadosEstabelecimento =
        null;


    if (
        estado.isEstabelecimento
    ) {

        const tabelaEstabelecimentos =
            CONFIG?.tabelas?.perfisEstabelecimentos ||
            "perfis_estabelecimentos";


        dadosEstabelecimento = {

            endereco:
                endereco || null,

            numero:
                numero || null,

            bairro:
                bairro || null,

            cidade:
                cidade || null,

            estado:
                estadoEstabelecimento || null,

            cep:
                cep || null,

            telefone_comercial:
                telefoneComercial || null,

            instagram:
                instagram || null,

            site:
                site || null,

            capacidade:
                Number.isFinite(
                    capacidade
                )
                    ? capacidade
                    : null,

            estrutura:
                estrutura || null,

            estilos_musicais:
                estilosMusicais || null,

            aceita_musica_ao_vivo:
                aceitaMusicaAoVivo,

            updated_at:
                agora

        };


        console.log(
            "PerfilEditorDados: salvando PERFIS_ESTABELECIMENTOS:",
            {
                perfilId:
                    estado.perfil.id,

                dados:
                    dadosEstabelecimento
            }
        );


        if (
            estado.perfilEstabelecimento?.id
        ) {

            const {
                data: estabelecimentoAtualizado,
                error: erroAtualizacaoEstabelecimento
            } = await supabase
                .from(
                    tabelaEstabelecimentos
                )
                .update(
                    dadosEstabelecimento
                )
                .eq(
                    "id",
                    estado.perfilEstabelecimento.id
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                )
                .select()
                .maybeSingle();


            if (erroAtualizacaoEstabelecimento) {

                throw erroAtualizacaoEstabelecimento;

            }


            perfilEstabelecimentoAtualizado =
                estabelecimentoAtualizado ||
                null;

        } else {

            const {
                data: novoPerfilEstabelecimento,
                error: erroInsercaoEstabelecimento
            } = await supabase
                .from(
                    tabelaEstabelecimentos
                )
                .insert({

                    perfil_id:
                        estado.perfil.id,

                    ...dadosEstabelecimento

                })
                .select()
                .maybeSingle();


            if (erroInsercaoEstabelecimento) {

                throw erroInsercaoEstabelecimento;

            }


            perfilEstabelecimentoAtualizado =
                novoPerfilEstabelecimento ||
                null;

        }


        estado.perfilEstabelecimento = {

            ...estado.perfilEstabelecimento,

            ...dadosEstabelecimento,

            ...(perfilEstabelecimentoAtualizado || {}),

            perfil_id:
                estado.perfil.id

        };

    } else {

        /*
         * ARTISTA E CONTRATANTE:
         *
         * Nunca criamos ou atualizamos registros
         * em perfis_estabelecimentos.
         */

        estado.perfilEstabelecimento =
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


    /* ====================================================
       RESULTADO
       ==================================================== */

    return {

        usuario:
            estado.usuario,

        perfil:
            perfilAtualizado,

        perfilArtista:
            estado.perfilArtista,

        perfilEstabelecimento:
            estado.perfilEstabelecimento,

        tipoPerfil:
            estado.tipoPerfil,

        isArtista:
            estado.isArtista,

        isContratante:
            estado.isContratante,

        isEstabelecimento:
            estado.isEstabelecimento,

        perfilPublicado:
            perfilAtualizado.perfil_publicado,

        fotoUrl,

        dadosArtista,

        dadosEstabelecimento

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

