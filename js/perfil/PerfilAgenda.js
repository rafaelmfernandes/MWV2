const PerfilAgenda = (() => {

    "use strict";


    let contexto = null;


    const CONFIG = {
        tabela: "agenda_musicos"
    };


    let inicializado = false;


    /*
    =====================================================
    CONFIGURAÇÃO
    =====================================================
    */

    function configurar(novoContexto) {

        contexto = novoContexto;

    }


    /*
    =====================================================
    UTILITÁRIOS
    =====================================================
    */

    function el(id) {

        return contexto?.utils?.el
            ? contexto.utils.el(id)
            : document.getElementById(id);

    }


    function mostrarToast(mensagem, tipo = "sucesso") {

        if (
            contexto?.utils &&
            typeof contexto.utils.mostrarToast === "function"
        ) {

            contexto.utils.mostrarToast(
                mensagem,
                tipo
            );

        } else {

            console.log(
                mensagem
            );

        }

    }


    function mostrarLoading(
        texto = "Carregando..."
    ) {

        if (
            contexto?.utils &&
            typeof contexto.utils.mostrarLoading === "function"
        ) {

            contexto.utils.mostrarLoading(
                texto
            );

        }

    }


    function esconderLoading() {

        if (
            contexto?.utils &&
            typeof contexto.utils.esconderLoading === "function"
        ) {

            contexto.utils.esconderLoading();

        }

    }


    function atualizarIcones() {

        if (
            contexto?.utils &&
            typeof contexto.utils.atualizarIcones === "function"
        ) {

            contexto.utils.atualizarIcones();

        }

    }


    function escaparHtml(valor) {

        if (
            contexto?.utils &&
            typeof contexto.utils.escaparHtml === "function"
        ) {

            return contexto.utils.escaparHtml(
                valor
            );

        }


        return String(valor ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function obterSupabase() {

        if (
            contexto?.supabase
        ) {

            return contexto.supabase;

        }


        return window.supabaseClient;

    }


    function obterPerfilId() {

        return contexto?.estado?.perfil?.id ||
            null;

    }


    /*
    =====================================================
    FORMATAÇÃO DE DATAS
    =====================================================
    */

    function formatarDataAgenda(data) {

        if (!data) {

            return {
                dia: "--",
                mes: "---"
            };

        }


        const dataObj =
            new Date(data);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return {
                dia: "--",
                mes: "---"
            };

        }


        const meses = [

            "jan",
            "fev",
            "mar",
            "abr",
            "mai",
            "jun",
            "jul",
            "ago",
            "set",
            "out",
            "nov",
            "dez"

        ];


        return {

            dia:
                String(
                    dataObj.getDate()
                ).padStart(
                    2,
                    "0"
                ),

            mes:
                meses[
                    dataObj.getMonth()
                ]

        };

    }


    function formatarDataHora(data) {

        if (!data) {
            return "";
        }


        const dataObj =
            new Date(data);


        if (
            Number.isNaN(
                dataObj.getTime()
            )
        ) {

            return "";
        }


        return dataObj.toLocaleString(
            "pt-BR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    }


    function converterDatetimeLocalParaISO(valor) {

        if (!valor) {
            return null;
        }


        const data =
            new Date(valor);


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return null;
        }


        return data.toISOString();

    }


    function converterISOParaDatetimeLocal(valor) {

        if (!valor) {
            return "";
        }


        const data =
            new Date(valor);


        if (
            Number.isNaN(
                data.getTime()
            )
        ) {

            return "";
        }


        const ano =
            data.getFullYear();


        const mes =
            String(
                data.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                data.getDate()
            ).padStart(
                2,
                "0"
            );


        const hora =
            String(
                data.getHours()
            ).padStart(
                2,
                "0"
            );


        const minuto =
            String(
                data.getMinutes()
            ).padStart(
                2,
                "0"
            );


        return `${ano}-${mes}-${dia}T${hora}:${minuto}`;

    }


    /*
    =====================================================
    CARREGAR AGENDA
    =====================================================
    */

    async function carregar() {

        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            console.warn(
                "PerfilAgenda: perfil ainda não carregado."
            );

            return;

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            console.error(
                "PerfilAgenda: Supabase não encontrado."
            );

            return;

        }


        try {

            const resultado =
                await supabase
                    .from(CONFIG.tabela)
                    .select(`
                        id,
                        perfil_id,
                        titulo,
                        descricao,
                        tipo,
                        data_inicio,
                        data_fim,
                        localizacao,
                        status,
                        created_at,
                        updated_at
                    `)
                    .eq(
                        "perfil_id",
                        perfilId
                    )
                    .order(
                        "data_inicio",
                        {
                            ascending: true
                        }
                    );


            if (resultado.error) {

                throw resultado.error;

            }


            contexto.estado.agenda =
                resultado.data || [];


            renderizar();

        } catch (erro) {

            console.error(
                "Erro ao carregar agenda:",
                erro
            );


            contexto.estado.agenda =
                [];


            renderizar();


            mostrarToast(
                erro?.message ||
                "Não foi possível carregar a agenda.",
                "erro"
            );

        }

    }


    /*
    =====================================================
    LIMPAR FORMULÁRIO
    =====================================================
    */

    function limparFormulario() {

        const campos = [

            "agendaTitulo",
            "agendaInicio",
            "agendaFim",
            "agendaLocalizacao",
            "agendaDescricao"

        ];


        campos.forEach(
            id => {

                const campo =
                    el(id);


                if (campo) {

                    campo.value =
                        "";

                }

            }
        );


        const tipo =
            el("agendaTipo");


        const status =
            el("agendaStatus");


        if (tipo) {

            tipo.value =
                "evento";

        }


        if (status) {

            status.value =
                "agendado";

        }


        if (contexto?.estado) {

            contexto.estado.editandoAgendaId =
                null;

        }


        const botao =
            el("btnAdicionarAgenda");


        if (botao) {

            botao.innerHTML =
                '<i data-lucide="calendar-plus"></i> Adicionar à agenda';

        }


        atualizarIcones();

    }


    /*
    =====================================================
    ADICIONAR / ATUALIZAR
    =====================================================
    */

    async function adicionar() {

        console.log(
            "PerfilAgenda: função adicionar() executada."
        );


        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            mostrarToast(
                "Perfil não carregado.",
                "erro"
            );


            return;

        }


        const campoTitulo =
            el("agendaTitulo");


        const campoTipo =
            el("agendaTipo");


        const campoInicio =
            el("agendaInicio");


        const campoFim =
            el("agendaFim");


        const campoLocalizacao =
            el("agendaLocalizacao");


        const campoDescricao =
            el("agendaDescricao");


        const campoStatus =
            el("agendaStatus");


        const titulo =
            String(
                campoTitulo?.value || ""
            ).trim();


        const tipo =
            campoTipo?.value ||
            "evento";


        const inicio =
            campoInicio?.value ||
            "";


        const fim =
            campoFim?.value ||
            "";


        const localizacao =
            String(
                campoLocalizacao?.value || ""
            ).trim();


        const descricao =
            String(
                campoDescricao?.value || ""
            ).trim();


        const status =
            campoStatus?.value ||
            "agendado";


        /*
        -----------------------------------------------------
        VALIDAÇÃO DO TÍTULO
        -----------------------------------------------------
        */

        if (!titulo) {

            mostrarToast(
                "Informe o título do compromisso.",
                "erro"
            );


            campoTitulo?.focus();

            return;

        }


        /*
        -----------------------------------------------------
        VALIDAÇÃO DA DATA
        -----------------------------------------------------
        */

        if (!inicio) {

            mostrarToast(
                "Informe a data e o horário.",
                "erro"
            );


            campoInicio?.focus();

            return;

        }


        const dataInicio =
            converterDatetimeLocalParaISO(
                inicio
            );


        const dataFim =
            converterDatetimeLocalParaISO(
                fim
            );


        if (!dataInicio) {

            mostrarToast(
                "Informe uma data válida.",
                "erro"
            );


            campoInicio?.focus();

            return;

        }


        /*
        -----------------------------------------------------
        VALIDAÇÃO DO TÉRMINO
        -----------------------------------------------------
        */

        if (
            dataFim &&
            new Date(dataFim) <
            new Date(dataInicio)
        ) {

            mostrarToast(
                "O término não pode ser anterior ao início.",
                "erro"
            );


            campoFim?.focus();

            return;

        }


        /*
        -----------------------------------------------------
        SUPABASE
        -----------------------------------------------------
        */

        const supabase =
            obterSupabase();


        if (!supabase) {

            mostrarToast(
                "Conexão com o banco não encontrada.",
                "erro"
            );


            return;

        }


        const editandoId =
            contexto?.estado?.editandoAgendaId ||
            null;


        try {

            mostrarLoading(
                editandoId
                    ? "Atualizando agenda..."
                    : "Adicionando compromisso..."
            );


            const dados = {

                titulo,

                descricao:
                    descricao ||
                    null,

                tipo,

                data_inicio:
                    dataInicio,

                data_fim:
                    dataFim,

                localizacao:
                    localizacao ||
                    null,

                status,

                updated_at:
                    new Date().toISOString()

            };


            let resultado;


            /*
            -------------------------------------------------
            ATUALIZAR
            -------------------------------------------------
            */

            if (editandoId) {

                resultado =
                    await supabase
                        .from(CONFIG.tabela)
                        .update(
                            dados
                        )
                        .eq(
                            "id",
                            editandoId
                        )
                        .eq(
                            "perfil_id",
                            perfilId
                        );

            }

            /*
            -------------------------------------------------
            INSERIR
            -------------------------------------------------
            */

            else {

                resultado =
                    await supabase
                        .from(CONFIG.tabela)
                        .insert({

                            perfil_id:
                                perfilId,

                            ...dados

                        });

            }


            if (resultado.error) {

                throw resultado.error;

            }


            esconderLoading();


            mostrarToast(
                editandoId
                    ? "Compromisso atualizado!"
                    : "Compromisso adicionado!",
                "sucesso"
            );


            limparFormulario();


            await carregar();

        } catch (erro) {

            console.error(
                "Erro ao salvar agenda:",
                erro
            );


            esconderLoading();


            mostrarToast(
                erro?.message ||
                "Não foi possível salvar o compromisso.",
                "erro"
            );

        }

    }


    /*
    =====================================================
    SALVAR
    =====================================================
    *
    * O PerfilEditor usa PerfilAgenda.salvar()
    * quando o botão superior estiver na aba Agenda.
    *
    */

    async function salvar() {

        await adicionar();

    }


    /*
    =====================================================
    EDITAR
    =====================================================
    */

    function editar(id) {

        const agenda =
            contexto?.estado?.agenda?.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!agenda) {

            console.warn(
                "Compromisso não encontrado:",
                id
            );

            return;

        }


        const titulo =
            el("agendaTitulo");


        const tipo =
            el("agendaTipo");


        const inicio =
            el("agendaInicio");


        const fim =
            el("agendaFim");


        const localizacao =
            el("agendaLocalizacao");


        const descricao =
            el("agendaDescricao");


        const status =
            el("agendaStatus");


        if (titulo) {

            titulo.value =
                agenda.titulo ||
                "";

        }


        if (tipo) {

            tipo.value =
                agenda.tipo ||
                "evento";

        }


        if (inicio) {

            inicio.value =
                converterISOParaDatetimeLocal(
                    agenda.data_inicio
                );

        }


        if (fim) {

            fim.value =
                converterISOParaDatetimeLocal(
                    agenda.data_fim
                );

        }


        if (localizacao) {

            localizacao.value =
                agenda.localizacao ||
                "";

        }


        if (descricao) {

            descricao.value =
                agenda.descricao ||
                "";

        }


        if (status) {

            status.value =
                agenda.status ||
                "agendado";

        }


        contexto.estado.editandoAgendaId =
            agenda.id;


        const botao =
            el("btnAdicionarAgenda");


        if (botao) {

            botao.innerHTML =
                '<i data-lucide="check"></i> Atualizar compromisso';

        }


        const painel =
            el("editorAgenda");


        if (painel) {

            painel.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }


        atualizarIcones();

    }


    /*
    =====================================================
    RENDERIZAR AGENDA
    =====================================================
    */

    function renderizar() {

        const container =
            el("agendaEditList");


        if (!container) {

            return;

        }


        const agenda =
            contexto?.estado?.agenda ||
            [];


        if (!agenda.length) {

            container.innerHTML = `

                <div class="empty-editor">

                    <i data-lucide="calendar-days"></i>

                    <strong>
                        Nenhum compromisso cadastrado
                    </strong>

                    <span>
                        Adicione um evento para começar a organizar sua agenda.
                    </span>

                </div>

            `;


            atualizarIcones();

            return;

        }


        container.innerHTML =
            agenda
                .map(
                    item => {

                        const data =
                            formatarDataAgenda(
                                item.data_inicio
                            );


                        return `

                            <article class="agenda-edit-card">

                                <div class="agenda-data">

                                    <strong>
                                        ${escaparHtml(
                                            data.dia
                                        )}
                                    </strong>

                                    <span>
                                        ${escaparHtml(
                                            data.mes
                                        )}
                                    </span>

                                </div>


                                <div class="agenda-edit-info">

                                    <strong>
                                        ${escaparHtml(
                                            item.titulo ||
                                            "Sem título"
                                        )}
                                    </strong>


                                    <span>
                                        ${escaparHtml(
                                            formatarDataHora(
                                                item.data_inicio
                                            )
                                        )}
                                    </span>


                                    ${
                                        item.data_fim
                                            ? `
                                                <span>
                                                    Até ${escaparHtml(
                                                        formatarDataHora(
                                                            item.data_fim
                                                        )
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }


                                    ${
                                        item.localizacao
                                            ? `
                                                <span>
                                                    ${escaparHtml(
                                                        item.localizacao
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }


                                    <span class="agenda-status">

                                        ${escaparHtml(
                                            item.status ||
                                            "agendado"
                                        )}

                                    </span>

                                </div>


                                <div class="media-edit-actions">

                                    <button
                                        type="button"
                                        class="btn-agenda-editar"
                                        title="Editar compromisso"
                                        data-editar-agenda="${escaparHtml(
                                            item.id
                                        )}"
                                    >

                                        <i data-lucide="pencil"></i>

                                    </button>


                                    <button
                                        type="button"
                                        class="btn-agenda-excluir"
                                        title="Excluir compromisso"
                                        data-excluir-agenda="${escaparHtml(
                                            item.id
                                        )}"
                                    >

                                        <i data-lucide="trash-2"></i>

                                    </button>

                                </div>

                            </article>

                        `;

                    }
                )
                .join("");


        /*
        -----------------------------------------------------
        BOTÕES EDITAR
        -----------------------------------------------------
        */

        container
            .querySelectorAll(
                "[data-editar-agenda]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        evento => {

                            evento.preventDefault();

                            editar(
                                botao.dataset.editarAgenda
                            );

                        }
                    );

                }
            );


        /*
        -----------------------------------------------------
        BOTÕES EXCLUIR
        -----------------------------------------------------
        */

        container
            .querySelectorAll(
                "[data-excluir-agenda]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        evento => {

                            evento.preventDefault();

                            excluir(
                                botao.dataset.excluirAgenda
                            );

                        }
                    );

                }
            );


        atualizarIcones();

    }


    /*
    =====================================================
    EXCLUIR
    =====================================================
    */

    async function excluir(id) {

        if (!id) {
            return;
        }


        const agenda =
            contexto?.estado?.agenda?.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        const titulo =
            agenda?.titulo ||
            "este compromisso";


        const confirmar =
            window.confirm(
                `Deseja realmente excluir "${titulo}"?`
            );


        if (!confirmar) {
            return;
        }


        const perfilId =
            obterPerfilId();


        if (!perfilId) {

            mostrarToast(
                "Perfil não carregado.",
                "erro"
            );


            return;

        }


        const supabase =
            obterSupabase();


        if (!supabase) {

            mostrarToast(
                "Conexão com o banco não encontrada.",
                "erro"
            );


            return;

        }


        try {

            mostrarLoading(
                "Excluindo compromisso..."
            );


            const resultado =
                await supabase
                    .from(CONFIG.tabela)
                    .delete()
                    .eq(
                        "id",
                        id
                    )
                    .eq(
                        "perfil_id",
                        perfilId
                    );


            if (resultado.error) {

                throw resultado.error;

            }


            esconderLoading();


            mostrarToast(
                "Compromisso removido.",
                "sucesso"
            );


            if (
                String(
                    contexto?.estado?.editandoAgendaId
                ) ===
                String(id)
            ) {

                limparFormulario();

            }


            await carregar();

        } catch (erro) {

            console.error(
                "Erro ao excluir agenda:",
                erro
            );


            esconderLoading();


            mostrarToast(
                erro?.message ||
                "Não foi possível excluir o compromisso.",
                "erro"
            );

        }

    }


    /*
    =====================================================
    INICIALIZAÇÃO
    =====================================================
    */

    function inicializar() {

        if (inicializado) {

            return;

        }


        inicializado =
            true;


        console.log(
            "PerfilAgenda: módulo inicializado."
        );


        /*
        -----------------------------------------------------
        BOTÃO ADICIONAR / ATUALIZAR
        -----------------------------------------------------
        *
        * Usamos delegação de evento para garantir que o
        * botão funcione mesmo que o conteúdo seja recriado.
        *
        */

        document.addEventListener(
            "click",
            evento => {

                const botao =
                    evento.target.closest(
                        "#btnAdicionarAgenda"
                    );


                if (!botao) {

                    return;

                }


                evento.preventDefault();


                console.log(
                    "PerfilAgenda: clique em #btnAdicionarAgenda."
                );


                adicionar();

            }
        );


        /*
        -----------------------------------------------------
        STATUS PADRÃO
        -----------------------------------------------------
        */

        const status =
            el("agendaStatus");


        if (
            status &&
            !status.value
        ) {

            status.value =
                "agendado";

        }

    }


    /*
    =====================================================
    API PÚBLICA
    =====================================================
    */

    return {

        configurar,

        inicializar,

        carregar,

        renderizar,

        adicionar,

        salvar,

        editar,

        excluir,

        limparFormulario,

        formatarDataAgenda,

        formatarDataHora,

        converterDatetimeLocalParaISO

    };


})();


window.PerfilAgenda =
    PerfilAgenda;