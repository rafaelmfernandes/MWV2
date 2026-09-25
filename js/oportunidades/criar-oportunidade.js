/* =========================================================
   MUSICALWORLD — CRIAR / EDITAR OPORTUNIDADE

   Arquivo:
   js/oportunidades/criar-oportunidade.js

   Responsabilidades:

   - Identificar o usuário autenticado.
   - Identificar se a página está em modo criação ou edição.
   - Validar o perfil de estabelecimento.
   - Carregar endereço cadastrado.
   - Carregar os dados da oportunidade em modo edição.
   - Preencher o formulário existente.
   - Validar formulário.
   - Criar registro em public.oportunidades.
   - Atualizar registro existente em public.oportunidades.
   - Controlar cancelamento.
   - Deixar a RLS do Supabase validar a autorização final.

   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       REFERÊNCIAS DO DOM
       ===================================================== */

    const form =
        document.getElementById(
            "formOportunidade"
        );


    const feedback =
        document.getElementById(
            "feedback"
        );


    const btnPublicar =
        document.getElementById(
            "btnPublicar"
        );


    const btnCancelar =
        document.getElementById(
            "btnCancelar"
        );


    const localContainer =
        document.getElementById(
            "localContainer"
        );


    const dataEvento =
        document.getElementById(
            "dataEvento"
        );


    const prazoInteresse =
        document.getElementById(
            "prazoInteresse"
        );


    const horaInicio =
        document.getElementById(
            "horaInicio"
        );


    const horaFim =
        document.getElementById(
            "horaFim"
        );


    const paginaEyebrow =
        document.getElementById(
            "paginaEyebrow"
        );


    const paginaTitulo =
        document.getElementById(
            "paginaTitulo"
        );


    const paginaDescricao =
        document.getElementById(
            "paginaDescricao"
        );


    /* =====================================================
       ESTADO DA PÁGINA
       ===================================================== */

    let usuarioAtual = null;

    let perfilEstabelecimento = null;

    let localEstabelecimento = null;

    let oportunidadeAtual = null;


    const parametrosUrl =
        new URLSearchParams(
            window.location.search
        );


    const modoEdicao =
        parametrosUrl.get(
            "modo"
        ) === "editar";


    const oportunidadeId =
        parametrosUrl.get(
            "id"
        );


    /* =====================================================
       SUPABASE
       ===================================================== */

    function obterClienteSupabase() {

        const cliente =
            window.supabaseClient ||
            window.MusicalWorldSupabase ||
            window.musicalWorldSupabase;


        if (!cliente) {

            throw new Error(
                "Cliente Supabase não encontrado."
            );

        }


        return cliente;
    }


    /* =====================================================
       CONFIGURAR INTERFACE
       ===================================================== */

    function configurarModoPagina() {

        if (!modoEdicao) {

            return;

        }


        paginaEyebrow.textContent =
            "Oportunidade de contratação";


        paginaTitulo.textContent =
            "Editar oportunidade";


        paginaDescricao.textContent =
            "Atualize os dados da oportunidade publicada e salve as alterações.";


        btnPublicar.textContent =
            "Salvar alterações";


        document.title =
            "Editar oportunidade | MusicalWorld";
    }


    /* =====================================================
       FEEDBACK
       ===================================================== */

    function mostrarFeedback(
        mensagem,
        tipo = "error"
    ) {

        feedback.textContent =
            mensagem;


        feedback.className =
            `mw-feedback is-visible ${tipo}`;
    }


    function limparFeedback() {

        feedback.textContent =
            "";


        feedback.className =
            "mw-feedback";
    }


    /* =====================================================
       DATA ATUAL
       ===================================================== */

    function obterDataHoje() {

        const agora =
            new Date();


        const ano =
            agora.getFullYear();


        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                agora.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${ano}-${mes}-${dia}`;
    }


    /* =====================================================
       DATA MÍNIMA
       ===================================================== */

    function configurarDatas() {

        const hoje =
            obterDataHoje();


        dataEvento.min =
            hoje;


        prazoInteresse.min =
            hoje;
    }


    /* =====================================================
       CARREGAR USUÁRIO
       ===================================================== */

    async function carregarUsuario() {

        const supabase =
            obterClienteSupabase();


        const {
            data,
            error
        } = await supabase.auth.getUser();


        if (error) {

            throw error;

        }


        if (!data?.user) {

            throw new Error(
                "Você precisa estar conectado para criar uma oportunidade."
            );

        }


        usuarioAtual =
            data.user;
    }


    /* =====================================================
       CARREGAR PERFIL DO ESTABELECIMENTO
       ===================================================== */

    async function carregarPerfilEstabelecimento() {

        const supabase =
            obterClienteSupabase();


        const {
            data,
            error
        } = await supabase
            .from("perfis")
            .select(`
                id,
                usuario_id,
                tipo_perfil_id,
                nome_exibicao,
                ativo,
                perfil_publicado,
                tipos_perfil (
                    id,
                    nome
                )
            `)
            .eq(
                "usuario_id",
                usuarioAtual.id
            )
            .in(
                "tipo_perfil_id",
                [4, 6, 7, 8, 9, 10, 11]
            )
            .eq(
                "ativo",
                true
            )
            .eq(
                "perfil_publicado",
                true
            )
            .maybeSingle();


        if (error) {

            throw error;

        }


        if (!data) {

            throw new Error(
                "Seu usuário não possui um perfil de estabelecimento ativo e publicado."
            );

        }


        perfilEstabelecimento =
            data;
    }


    /* =====================================================
       CARREGAR ENDEREÇO DO ESTABELECIMENTO
       ===================================================== */

    async function carregarLocalEstabelecimento() {

        const supabase =
            obterClienteSupabase();


        const {
            data,
            error
        } = await supabase
            .from("perfis_estabelecimentos")
            .select(`
                id,
                perfil_id,
                endereco,
                numero,
                bairro,
                cidade,
                estado,
                cep
            `)
            .eq(
                "perfil_id",
                perfilEstabelecimento.id
            )
            .maybeSingle();


        if (error) {

            throw error;

        }


        if (!data) {

            throw new Error(
                "O endereço do estabelecimento não foi encontrado."
            );

        }


        localEstabelecimento =
            data;


        renderizarLocal();
    }


    /* =====================================================
       RENDERIZAR LOCAL
       ===================================================== */

    function renderizarLocal() {

        const local =
            localEstabelecimento;


        const nomeLocal =
            perfilEstabelecimento.nome_exibicao ||
            "Estabelecimento";


        const enderecoPartes = [

            local.endereco,
            local.numero,
            local.complemento,
            local.bairro

        ].filter(Boolean);


        const cidadeEstado = [

            local.cidade,
            local.estado

        ]
            .filter(Boolean)
            .join("/");


        if (cidadeEstado) {

            enderecoPartes.push(
                cidadeEstado
            );

        }


        if (local.cep) {

            enderecoPartes.push(
                `CEP ${local.cep}`
            );

        }


        localContainer.innerHTML = `

            <div class="mw-local-card">

                <div class="mw-local-label">
                    Local cadastrado
                </div>

                <p class="mw-local-nome">
                    ${escaparHtml(nomeLocal)}
                </p>

                <p class="mw-local-endereco">
                    ${escaparHtml(
                        enderecoPartes.join(", ")
                    )}
                </p>

            </div>

        `;
    }


    /* =====================================================
       ESCAPAR HTML
       ===================================================== */

    function escaparHtml(valor) {

        return String(
            valor ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }


    /* =====================================================
       OBTER CHECKBOXES SELECIONADOS
       ===================================================== */

    function obterSelecionados(
        containerId
    ) {

        return [

            ...document.querySelectorAll(
                `#${containerId} input[type="checkbox"]:checked`
            )

        ].map(
            checkbox =>
                checkbox.value
        );
    }


    /* =====================================================
       MARCAR CHECKBOXES
       ===================================================== */

    function marcarSelecionados(
        containerId,
        valores
    ) {

        const lista =
            Array.isArray(valores)
                ? valores
                : [];


        const valoresNormalizados =
            new Set(
                lista.map(
                    valor =>
                        String(valor)
                            .trim()
                )
            );


        document
            .querySelectorAll(
                `#${containerId} input[type="checkbox"]`
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        valoresNormalizados.has(
                            checkbox.value
                        );

                }
            );
    }


    /* =====================================================
       CARREGAR OPORTUNIDADE PARA EDIÇÃO
       ===================================================== */

    async function carregarOportunidadeEdicao() {

        if (!modoEdicao) {

            return;

        }


        if (!oportunidadeId) {

            throw new Error(
                "O ID da oportunidade não foi informado para edição."
            );

        }


        const supabase =
            obterClienteSupabase();


        const {
            data,
            error
        } = await supabase
            .from("oportunidades")
            .select(`
                id,
                contratante_id,
                titulo,
                descricao,
                tipo_artista,
                data_evento,
                hora_inicio,
                hora_fim,
                estilos,
                instrumentos,
                valor,
                local,
                prazo_interesse,
                status
            `)
            .eq(
                "id",
                oportunidadeId
            )
            .eq(
                "contratante_id",
                usuarioAtual.id
            )
            .maybeSingle();


        if (error) {

            throw error;

        }


        if (!data) {

            throw new Error(
                "A oportunidade não foi encontrada ou não pertence ao seu usuário."
            );

        }


        oportunidadeAtual =
            data;


        preencherFormulario(
            oportunidadeAtual
        );
    }


    /* =====================================================
       PREENCHER FORMULÁRIO
       ===================================================== */

    function preencherFormulario(
        oportunidade
    ) {

        document.getElementById(
            "titulo"
        ).value =
            oportunidade.titulo || "";


        document.getElementById(
            "descricao"
        ).value =
            oportunidade.descricao || "";


        document.getElementById(
            "tipoArtista"
        ).value =
            oportunidade.tipo_artista || "";


        dataEvento.value =
            oportunidade.data_evento || "";


        horaInicio.value =
            oportunidade.hora_inicio || "";


        horaFim.value =
            oportunidade.hora_fim || "";


        prazoInteresse.value =
            oportunidade.prazo_interesse || "";


        document.getElementById(
            "valor"
        ).value =
            oportunidade.valor ?? "";


        marcarSelecionados(
            "estilosGrid",
            oportunidade.estilos
        );


        marcarSelecionados(
            "instrumentosGrid",
            oportunidade.instrumentos
        );
    }


    /* =====================================================
       VALIDAR HORÁRIOS
       ===================================================== */

    function validarHorarios() {

        const inicio =
            horaInicio.value.trim();


        const fim =
            horaFim.value.trim();


        if (!inicio && !fim) {

            return {

                valido: true,

                inicio: null,

                fim: null

            };

        }


        if (
            (inicio && !fim) ||
            (!inicio && fim)
        ) {

            return {

                valido: false,

                mensagem:
                    "Informe o horário inicial e final ou deixe os dois em branco."

            };

        }


        if (fim <= inicio) {

            return {

                valido: false,

                mensagem:
                    "O horário final deve ser posterior ao horário inicial."

            };

        }


        return {

            valido: true,

            inicio,

            fim

        };
    }


    /* =====================================================
       VALIDAR FORMULÁRIO
       ===================================================== */

    function validarFormulario() {

        const titulo =
            document
                .getElementById(
                    "titulo"
                )
                .value
                .trim();


        const tipoArtista =
            document
                .getElementById(
                    "tipoArtista"
                )
                .value
                .trim();


        const data =
            dataEvento.value;


        const valorTexto =
            document
                .getElementById(
                    "valor"
                )
                .value
                .trim();


        const valor =
            Number(valorTexto);


        if (!titulo) {

            return {

                valido: false,

                mensagem:
                    "Informe o título da oportunidade."

            };

        }


        if (!tipoArtista) {

            return {

                valido: false,

                mensagem:
                    "Selecione o tipo de artista."

            };

        }


        if (!data) {

            return {

                valido: false,

                mensagem:
                    "Informe a data do evento."

            };

        }


        /*
         * Em edição, a data já existente pode ser anterior
         * ao dia atual. Nesse caso permitimos que o formulário
         * seja carregado e validado normalmente.
         *
         * Em criação, uma nova oportunidade não pode
         * utilizar uma data passada.
         */

        if (
            !modoEdicao &&
            data < obterDataHoje()
        ) {

            return {

                valido: false,

                mensagem:
                    "A data do evento não pode estar no passado."

            };

        }


        if (
            !Number.isFinite(valor) ||
            valor < 0
        ) {

            return {

                valido: false,

                mensagem:
                    "Informe um valor válido."

            };

        }


        if (
            prazoInteresse.value &&
            prazoInteresse.value > data
        ) {

            return {

                valido: false,

                mensagem:
                    "O prazo para interesse não pode ser posterior à data do evento."

            };

        }


        const horarios =
            validarHorarios();


        if (!horarios.valido) {

            return horarios;

        }


        return {

            valido: true,

            titulo,

            tipoArtista,

            data,

            valor,

            horarios

        };
    }


    /* =====================================================
       MONTAR REGISTRO
       ===================================================== */

    function montarRegistro(
        validacao
    ) {

        const descricao =
            document
                .getElementById(
                    "descricao"
                )
                .value
                .trim();


        const estilos =
            obterSelecionados(
                "estilosGrid"
            );


        const instrumentos =
            obterSelecionados(
                "instrumentosGrid"
            );


        const local = {

            nomeLocal:
                perfilEstabelecimento.nome_exibicao ||
                "Estabelecimento",

            endereco:
                localEstabelecimento.endereco || "",

            numero:
                localEstabelecimento.numero || "",

            bairro:
                localEstabelecimento.bairro || "",

            cidade:
                localEstabelecimento.cidade || "",

            estado:
                localEstabelecimento.estado || "",

            cep:
                localEstabelecimento.cep || ""

        };


        return {

            contratante_id:
                usuarioAtual.id,

            titulo:
                validacao.titulo,

            descricao:
                descricao || null,

            tipo_artista:
                validacao.tipoArtista,

            data_evento:
                validacao.data,

            hora_inicio:
                validacao.horarios.inicio,

            hora_fim:
                validacao.horarios.fim,

            estilos,

            instrumentos,

            valor:
                validacao.valor,

            local,

            prazo_interesse:
                prazoInteresse.value || null,

            status:
                oportunidadeAtual?.status ||
                "aberta"

        };
    }


    /* =====================================================
       CRIAR OPORTUNIDADE
       ===================================================== */

    async function criarOportunidade() {

        const supabase =
            obterClienteSupabase();


        const validacao =
            validarFormulario();


        if (!validacao.valido) {

            mostrarFeedback(
                validacao.mensagem
            );

            return;

        }


        const registro =
            montarRegistro(
                validacao
            );


        const {
            data,
            error
        } = await supabase
            .from("oportunidades")
            .insert(
                registro
            )
            .select(
                "id"
            )
            .single();


        if (error) {

            throw error;

        }


        mostrarFeedback(
            "Oportunidade publicada com sucesso.",
            "success"
        );


        form.reset();


        configurarDatas();


        if (data?.id) {

            setTimeout(
                () => {

                    window.location.href =
                        `oportunidades.html?id=${encodeURIComponent(data.id)}`;

                },
                900
            );

        }
    }


    /* =====================================================
       ATUALIZAR OPORTUNIDADE
       ===================================================== */

    async function atualizarOportunidade() {

        if (!oportunidadeId) {

            throw new Error(
                "O ID da oportunidade não foi informado."
            );

        }


        const supabase =
            obterClienteSupabase();


        const validacao =
            validarFormulario();


        if (!validacao.valido) {

            mostrarFeedback(
                validacao.mensagem
            );

            return;

        }


        const registro =
            montarRegistro(
                validacao
            );


        /*
         * O contratante_id não será alterado durante
         * a edição.
         *
         * O registro será localizado pelo ID da
         * oportunidade e pelo usuário autenticado.
         */

        delete registro.contratante_id;


        const {
            data,
            error
        } = await supabase
            .from("oportunidades")
            .update(
                registro
            )
            .eq(
                "id",
                oportunidadeId
            )
            .eq(
                "contratante_id",
                usuarioAtual.id
            )
            .select(
                "id"
            )
            .single();


        if (error) {

            throw error;

        }


        if (!data?.id) {

            throw new Error(
                "A oportunidade não foi atualizada."
            );

        }


        mostrarFeedback(
            "Oportunidade atualizada com sucesso.",
            "success"
        );


        setTimeout(
            () => {

                window.location.href =
                    `oportunidade-interessados.html?id=${encodeURIComponent(data.id)}`;

            },
            900
        );
    }


    /* =====================================================
       SUBMIT DO FORMULÁRIO
       ===================================================== */

    async function salvarFormulario(
        evento
    ) {

        evento.preventDefault();


        limparFeedback();


        btnPublicar.disabled =
            true;


        btnPublicar.textContent =
            modoEdicao
                ? "Salvando..."
                : "Publicando...";


        try {

            if (modoEdicao) {

                await atualizarOportunidade();

            } else {

                await criarOportunidade();

            }

        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao salvar oportunidade:",
                erro
            );


            mostrarFeedback(
                erro?.message ||
                "Não foi possível salvar a oportunidade."
            );

        } finally {

            btnPublicar.disabled =
                false;


            btnPublicar.textContent =
                modoEdicao
                    ? "Salvar alterações"
                    : "Publicar oportunidade";
        }
    }


    /* =====================================================
       CANCELAR
       ===================================================== */

    function cancelar() {

        if (
            modoEdicao &&
            oportunidadeId
        ) {

            window.location.href =
                `oportunidade-interessados.html?id=${encodeURIComponent(oportunidadeId)}`;

            return;
        }


        window.history.back();
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        try {

            configurarModoPagina();

            configurarDatas();

            await carregarUsuario();

            await carregarPerfilEstabelecimento();

            await carregarLocalEstabelecimento();

            await carregarOportunidadeEdicao();

        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao inicializar criação/edição de oportunidade:",
                erro
            );


            localContainer.innerHTML =
                "";


            mostrarFeedback(
                erro?.message ||
                "Não foi possível carregar os dados da oportunidade."
            );


            btnPublicar.disabled =
                true;
        }
    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    form.addEventListener(
        "submit",
        salvarFormulario
    );


    btnCancelar.addEventListener(
        "click",
        cancelar
    );


    /* =====================================================
       INICIAR
       ===================================================== */

    inicializar();

})();