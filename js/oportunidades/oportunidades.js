
/* =========================================================
   MUSICALWORLD — VISUALIZAÇÃO DE OPORTUNIDADE

   Arquivo:
   js/oportunidades/oportunidades.js

   Responsabilidades:
   - Ler o ID da oportunidade.
   - Carregar os dados do Supabase.
   - Carregar o estabelecimento.
   - Exibir foto e nome do publicador.
   - Identificar o usuário atual.
   - Verificar interesse existente.
   - Registrar novo interesse.
   - Liberar a gestão somente para o responsável.
   - Renderizar valor/cachê e demais informações.
   ========================================================= */


(() => {

    "use strict";


    const estadoCarregamento =
        document.getElementById(
            "estadoCarregamento"
        );

    const estadoErro =
        document.getElementById(
            "estadoErro"
        );

    const mensagemErro =
        document.getElementById(
            "mensagemErro"
        );

    const oportunidadeElement =
        document.getElementById(
            "oportunidade"
        );


    const titulo =
        document.getElementById(
            "titulo"
        );

    const estabelecimento =
        document.getElementById(
            "estabelecimento"
        );

    const status =
        document.getElementById(
            "status"
        );

    const descricao =
        document.getElementById(
            "descricao"
        );

    const tipoArtista =
        document.getElementById(
            "tipoArtista"
        );

    const dataEvento =
        document.getElementById(
            "dataEvento"
        );

    const horario =
        document.getElementById(
            "horario"
        );

    const local =
        document.getElementById(
            "local"
        );

    const prazo =
        document.getElementById(
            "prazo"
        );

    const estilos =
        document.getElementById(
            "estilos"
        );

    const instrumentos =
        document.getElementById(
            "instrumentos"
        );

    const valor =
        document.getElementById(
            "valor"
        );

    const btnInteresse =
        document.getElementById(
            "btnInteresse"
        );

    const mensagemInteresse =
        document.getElementById(
            "mensagemInteresse"
        );

    const feedback =
        document.getElementById(
            "feedback"
        );

    const jaInteressado =
        document.getElementById(
            "jaInteressado"
        );


    const areaGerenciamento =
        document.getElementById(
            "areaGerenciamento"
        );

    const btnGerenciar =
        document.getElementById(
            "btnGerenciar"
        );


    let oportunidadeAtual = null;
    let usuarioAtual = null;


    /* =====================================================
       CLIENTE SUPABASE
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
       ESCAPAR HTML
       ===================================================== */

    function escaparHtml(valor) {

        return String(valor ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    /* =====================================================
       ID DA URL
       ===================================================== */

    function obterIdOportunidade() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return (
            params.get("id") ||
            params.get("oportunidade_id") ||
            params.get("oportunidadeId") ||
            ""
        ).trim();
    }


    /* =====================================================
       DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {
            return "Não informada";
        }


        const partes =
            String(data).split("-");


        if (partes.length !== 3) {
            return data;
        }


        return new Intl.DateTimeFormat(
            "pt-BR"
        ).format(
            new Date(
                Number(partes[0]),
                Number(partes[1]) - 1,
                Number(partes[2])
            )
        );
    }


    /* =====================================================
       HORÁRIO
       ===================================================== */

    function formatarHorario(
        inicio,
        fim
    ) {

        if (!inicio && !fim) {
            return "A definir";
        }


        if (inicio && fim) {

            return `${inicio.slice(0, 5)} às ${fim.slice(0, 5)}`;
        }


        if (inicio) {
            return inicio.slice(0, 5);
        }


        return "A definir";
    }


    /* =====================================================
       VALOR / CACHÊ
       ===================================================== */

    function formatarValor(valorRecebido) {

        if (
            valorRecebido === null ||
            valorRecebido === undefined ||
            valorRecebido === ""
        ) {

            return "A combinar";
        }


        const numero =
            Number(valorRecebido);


        if (!Number.isFinite(numero)) {
            return "A combinar";
        }


        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(numero);
    }


    /* =====================================================
       ARRAY
       ===================================================== */

    function normalizarArray(valorRecebido) {

        if (Array.isArray(valorRecebido)) {
            return valorRecebido.filter(Boolean);
        }


        return [];
    }


    /* =====================================================
       LOCAL
       ===================================================== */

    function formatarLocal(localRecebido) {

        if (!localRecebido) {
            return "Local não informado";
        }


        if (
            typeof localRecebido === "string"
        ) {

            return localRecebido;
        }


        const endereco =
            [
                localRecebido.endereco,
                localRecebido.numero
            ]
                .filter(Boolean)
                .join(", ");


        const cidadeEstado =
            [
                localRecebido.cidade,
                localRecebido.estado
            ]
                .filter(Boolean)
                .join("/");


        const partes = [];


        if (endereco) {
            partes.push(endereco);
        }


        if (localRecebido.bairro) {
            partes.push(
                localRecebido.bairro
            );
        }


        if (cidadeEstado) {
            partes.push(
                cidadeEstado
            );
        }


        if (localRecebido.cep) {
            partes.push(
                `CEP ${localRecebido.cep}`
            );
        }


        return (
            partes.join(" — ") ||
            localRecebido.nomeLocal ||
            "Local não informado"
        );
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


        usuarioAtual =
            data?.user || null;
    }


    /* =====================================================
       CARREGAR OPORTUNIDADE
       ===================================================== */

    async function carregarOportunidade(
        id
    ) {

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
                status,
                created_at
            `)
            .eq(
                "id",
                id
            )
            .maybeSingle();


        if (error) {
            throw error;
        }


        if (!data) {

            throw new Error(
                "A oportunidade não foi encontrada."
            );
        }


        oportunidadeAtual =
            data;
    }


    /* =====================================================
       CARREGAR ESTABELECIMENTO

       O nome vem de perfis.

       A foto vem de usuarios.foto_url.

       As duas consultas são independentes para que um
       problema no carregamento da foto não impeça a
       oportunidade de carregar, incluindo cachê,
       interesse e demais informações.
       ===================================================== */

    async function carregarEstabelecimento() {

        const supabase =
            obterClienteSupabase();


        let nome =
            oportunidadeAtual.local?.nomeLocal ||
            "Estabelecimento";


        let fotoUrl =
            "";


        /* =================================================
           CARREGAR NOME DO PERFIL
           ================================================= */

        const {
            data: perfilData,
            error: perfilError
        } = await supabase
            .from("perfis")
            .select(`
                usuario_id,
                nome_exibicao
            `)
            .eq(
                "usuario_id",
                oportunidadeAtual.contratante_id
            )
            .maybeSingle();


        if (perfilError) {

            console.warn(
                "MusicalWorld — erro ao carregar perfil do publicador:",
                perfilError
            );

        } else if (perfilData?.nome_exibicao) {

            nome =
                perfilData.nome_exibicao;
        }


        /* =================================================
           CARREGAR FOTO DO USUÁRIO
           ================================================= */

        const {
            data: usuarioData,
            error: usuarioError
        } = await supabase
            .from("usuarios")
            .select(`
                foto_url
            `)
            .eq(
                "id",
                oportunidadeAtual.contratante_id
            )
            .maybeSingle();


        if (usuarioError) {

            console.warn(
                "MusicalWorld — erro ao carregar foto do publicador:",
                usuarioError
            );

        } else {

            fotoUrl =
                usuarioData?.foto_url ||
                "";
        }


        /* =================================================
           AVATAR
           ================================================= */

        const inicial =
            nome
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "E";


        const avatar =
            fotoUrl
                ? `
                    <span class="mw-publisher-avatar">
                        <img
                            src="${escaparHtml(fotoUrl)}"
                            alt="${escaparHtml(nome)}"
                        >
                    </span>
                `
                : `
                    <span
                        class="mw-publisher-avatar mw-publisher-avatar-initial"
                        aria-hidden="true"
                    >
                        ${escaparHtml(inicial)}
                    </span>
                `;


        estabelecimento.innerHTML = `
            <span class="mw-publisher">
                ${avatar}

                <span class="mw-publisher-name">
                    ${escaparHtml(nome)}
                </span>
            </span>
        `;
    }


    /* =====================================================
       CONFIGURAR GESTÃO

       O botão de gestão é exibido somente quando o
       usuário autenticado é o responsável pela oportunidade.
       ===================================================== */

    function configurarGerenciamento() {

        if (
            !usuarioAtual ||
            !oportunidadeAtual
        ) {

            return;
        }


        const ehResponsavel =
            String(
                usuarioAtual.id
            ) ===
            String(
                oportunidadeAtual.contratante_id
            );


        if (!ehResponsavel) {

            areaGerenciamento
                .classList
                .remove(
                    "is-visible"
                );

            return;
        }


        btnGerenciar.href =
            `oportunidade-interessados.html?id=${encodeURIComponent(
                oportunidadeAtual.id
            )}`;


        areaGerenciamento
            .classList
            .add(
                "is-visible"
            );
    }


    /* =====================================================
       RENDERIZAR
       ===================================================== */

    function renderizar() {

        titulo.textContent =
            oportunidadeAtual.titulo ||
            "Oportunidade";


        status.textContent =
            oportunidadeAtual.status === "aberta"
                ? "Aberta"
                : oportunidadeAtual.status;


        tipoArtista.textContent =
            oportunidadeAtual.tipo_artista ||
            "Não informado";


        dataEvento.textContent =
            formatarData(
                oportunidadeAtual.data_evento
            );


        horario.textContent =
            formatarHorario(
                oportunidadeAtual.hora_inicio,
                oportunidadeAtual.hora_fim
            );


        local.textContent =
            formatarLocal(
                oportunidadeAtual.local
            );


        prazo.textContent =
            oportunidadeAtual.prazo_interesse
                ? formatarData(
                    oportunidadeAtual.prazo_interesse
                )
                : "Até preencher a oportunidade";


        /* =================================================
           CACHÊ / ORÇAMENTO
           ================================================= */

        valor.textContent =
            formatarValor(
                oportunidadeAtual.valor
            );


        if (
            oportunidadeAtual.descricao
        ) {

            descricao.textContent =
                oportunidadeAtual.descricao;

        } else {

            descricao.textContent =
                "O estabelecimento não adicionou uma descrição para esta oportunidade.";
        }


        renderizarTags(
            estilos,
            oportunidadeAtual.estilos,
            "Nenhum estilo informado."
        );


        renderizarTags(
            instrumentos,
            oportunidadeAtual.instrumentos,
            "Nenhum instrumento informado."
        );
    }


    /* =====================================================
       TAGS
       ===================================================== */

    function renderizarTags(
        container,
        valores,
        mensagem
    ) {

        const lista =
            normalizarArray(
                valores
            );


        if (!lista.length) {

            container.innerHTML = `

                <span class="mw-empty">
                    ${mensagem}
                </span>

            `;

            return;
        }


        container.innerHTML =
            lista
                .map(
                    item => `
                        <span class="mw-tag">
                            ${escaparHtml(item)}
                        </span>
                    `
                )
                .join("");
    }


    /* =====================================================
       VERIFICAR INTERESSE EXISTENTE
       ===================================================== */

    async function verificarInteresse() {

        if (!usuarioAtual) {
            return;
        }


        if (
            String(
                usuarioAtual.id
            ) === String(
                oportunidadeAtual.contratante_id
            )
        ) {

            areaInteresseDesabilitada(
                "Você é o responsável por esta oportunidade."
            );

            return;
        }


        const supabase =
            obterClienteSupabase();


        const {
            data,
            error
        } = await supabase
            .from("oportunidades_interessados")
            .select(`
                id,
                status
            `)
            .eq(
                "oportunidade_id",
                oportunidadeAtual.id
            )
            .eq(
                "artista_id",
                usuarioAtual.id
            )
            .maybeSingle();


        if (error) {

            console.warn(
                "MusicalWorld — erro ao verificar interesse:",
                error
            );

            return;
        }


        if (data) {

            jaInteressado.classList.add(
                "is-visible"
            );


            btnInteresse.disabled =
                true;


            mensagemInteresse.disabled =
                true;

        }
    }


    /* =====================================================
       DESABILITAR ÁREA DO RESPONSÁVEL
       ===================================================== */

    function areaInteresseDesabilitada(
        mensagem
    ) {

        btnInteresse.disabled =
            true;


        mensagemInteresse.disabled =
            true;


        mensagemInteresse.style.display =
            "none";


        btnInteresse.style.display =
            "none";


        const texto =
            document.querySelector(
                "#areaInteresse > p"
            );


        if (texto) {

            texto.textContent =
                mensagem;
        }
    }


    /* =====================================================
       FEEDBACK
       ===================================================== */

    function mostrarFeedback(
        mensagem,
        tipo
    ) {

        feedback.textContent =
            mensagem;

        feedback.className =
            `mw-feedback is-visible ${tipo}`;
    }


    /* =====================================================
       DEMONSTRAR INTERESSE
       ===================================================== */

    async function demonstrarInteresse() {

        if (!usuarioAtual) {

            mostrarFeedback(
                "Faça login para demonstrar interesse.",
                "error"
            );

            return;
        }


        if (!oportunidadeAtual) {

            mostrarFeedback(
                "A oportunidade ainda não foi carregada.",
                "error"
            );

            return;
        }


        if (
            String(
                usuarioAtual.id
            ) === String(
                oportunidadeAtual.contratante_id
            )
        ) {

            mostrarFeedback(
                "Você não pode demonstrar interesse na própria oportunidade.",
                "error"
            );

            return;
        }


        if (
            oportunidadeAtual.status !== "aberta"
        ) {

            mostrarFeedback(
                "Esta oportunidade não está mais aberta.",
                "error"
            );

            return;
        }


        if (
            oportunidadeAtual.prazo_interesse &&
            oportunidadeAtual.prazo_interesse <
            obterDataHoje()
        ) {

            mostrarFeedback(
                "O prazo para demonstrar interesse já terminou.",
                "error"
            );

            return;
        }


        try {

            btnInteresse.disabled =
                true;

            btnInteresse.textContent =
                "Enviando...";


            const supabase =
                obterClienteSupabase();


            const mensagem =
                mensagemInteresse.value.trim();


            const registro = {

                oportunidade_id:
                    oportunidadeAtual.id,

                artista_id:
                    usuarioAtual.id,

                mensagem:
                    mensagem || null,

                status:
                    "interessado"

            };


            const {
                error
            } = await supabase
                .from(
                    "oportunidades_interessados"
                )
                .insert(
                    registro
                );


            if (error) {
                throw error;
            }


            mostrarFeedback(
                "Seu interesse foi enviado com sucesso.",
                "success"
            );


            jaInteressado.classList.add(
                "is-visible"
            );


            mensagemInteresse.disabled =
                true;


            btnInteresse.textContent =
                "Interesse enviado";


        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao demonstrar interesse:",
                erro
            );


            if (
                erro?.code === "23505"
            ) {

                jaInteressado.classList.add(
                    "is-visible"
                );


                btnInteresse.disabled =
                    true;


                mensagemInteresse.disabled =
                    true;


                btnInteresse.textContent =
                    "Interesse enviado";


                return;
            }


            mostrarFeedback(
                erro?.message ||
                "Não foi possível enviar seu interesse.",
                "error"
            );


            btnInteresse.disabled =
                false;

            btnInteresse.textContent =
                "Tenho interesse";
        }
    }


    /* =====================================================
       DATA DE HOJE
       ===================================================== */

    function obterDataHoje() {

        const agora =
            new Date();


        const ano =
            agora.getFullYear();


        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;
    }


    /* =====================================================
       EXIBIR ERRO
       ===================================================== */

    function mostrarErro(
        mensagem
    ) {

        estadoCarregamento.hidden =
            true;


        oportunidadeElement
            .classList
            .remove(
                "is-visible"
            );


        mensagemErro.textContent =
            mensagem ||
            "Não foi possível carregar esta oportunidade.";


        estadoErro.hidden =
            false;
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    async function inicializar() {

        try {

            const id =
                obterIdOportunidade();


            if (!id) {

                throw new Error(
                    "O ID da oportunidade não foi informado."
                );
            }


            await carregarUsuario();

            await carregarOportunidade(
                id
            );

            /*
             * O publicador é carregado separadamente.
             * Mesmo que exista algum problema com a foto,
             * os dados principais da oportunidade continuam.
             */
            await carregarEstabelecimento();

            renderizar();

            configurarGerenciamento();

            await verificarInteresse();


            estadoCarregamento.hidden =
                true;


            oportunidadeElement
                .classList
                .add(
                    "is-visible"
                );


        } catch (erro) {

            console.error(
                "MusicalWorld — erro ao carregar oportunidade:",
                erro
            );


            mostrarErro(
                erro?.message
            );
        }
    }


    /* =====================================================
       EVENTO
       ===================================================== */

    btnInteresse.addEventListener(
        "click",
        demonstrarInteresse
    );


    /* =====================================================
       INICIAR
       ===================================================== */

    inicializar();

})();

