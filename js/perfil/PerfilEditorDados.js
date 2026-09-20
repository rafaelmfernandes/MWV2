/* ============================================================
MUSICALWORLD — PERFIL EDITOR DADOS
Arquivo: js/perfil/PerfilEditorDados.js
=======================================

RESPONSABILIDADE:

Este módulo é responsável exclusivamente pela comunicação
entre o editor de perfil e o Supabase.

Ele suporta os dois tipos de perfil do MusicalWorld:

* ARTISTA
* CONTRATANTE

ARTISTA:

* usuarios
* perfis
* perfis_artistas

CONTRATANTE:

* usuarios
* perfis

O contratante NÃO utiliza a tabela perfis_artistas.

Este módulo cuida de:

* carregar o usuário autenticado;
* carregar os dados de usuarios;
* localizar o perfil correto;
* identificar o tipo do perfil;
* carregar perfis_artistas somente para artistas;
* salvar usuarios;
* salvar perfis;
* salvar perfis_artistas somente para artistas;
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


function identificarTipoPerfil(perfis) {

    const lista =
        Array.isArray(perfis)
            ? perfis
            : [];


    const perfilArtista =
        lista.find(
            (perfil) => {

                const nomeTipo =
                    perfil?.tipos_perfil?.nome || "";


                return (
                    normalizarTipoPerfil(
                        nomeTipo
                    ) === "artista"
                );

            }
        );


    const perfilContratante =
        lista.find(
            (perfil) => {

                const nomeTipo =
                    perfil?.tipos_perfil?.nome || "";


                return (
                    normalizarTipoPerfil(
                        nomeTipo
                    ) === "contratante"
                );

            }
        );


    /*
     * Se existir um perfil artístico, ele continua tendo
     * prioridade para preservar o comportamento atual do
     * editor utilizado pelos artistas.
     *
     * Caso não exista artista, mas exista contratante,
     * o editor trabalha como contratante.
     */

    if (perfilArtista) {

        return {

            tipoPerfil:
                "artista",

            perfil:
                perfilArtista

        };

    }


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
            "Nenhum perfil ativo de Artista ou Contratante foi encontrado para este usuário."
        );

    }


    estado.tipoPerfil =
        resultadoTipo.tipoPerfil;


    estado.perfil =
        resultadoTipo.perfil;


    /*
     * Mantemos também uma propriedade booleana simples
     * para facilitar verificações nos outros módulos.
     */

    estado.isArtista =
        estado.tipoPerfil === "artista";


    estado.isContratante =
        estado.tipoPerfil === "contratante";


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
         * Contratante não possui perfil artístico.
         *
         * Explicitamente mantemos null para impedir que
         * módulos posteriores tratem este usuário como artista.
         */

        estado.perfilArtista =
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

        tipoPerfil:
            estado.tipoPerfil,

        isArtista:
            estado.isArtista,

        isContratante:
            estado.isContratante

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
     * Para o contratante, o local principal da foto é
     * usuarios.foto_url.
     *
     * Para artista, mantemos o mesmo comportamento atual.
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
         * CONTRATANTE:
         *
         * Nunca criamos, atualizamos ou removemos registros
         * em perfis_artistas.
         */

        estado.perfilArtista =
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

        tipoPerfil:
            estado.tipoPerfil,

        isArtista:
            estado.isArtista,

        isContratante:
            estado.isContratante,

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
