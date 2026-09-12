const PerfilServicos = (() => {

    "use strict";

    /*
     * =========================================================
     * MUSICALWORLD — SERVIÇOS DO PERFIL
     * Arquivo: PerfilServicos.js
     *
     * Responsabilidade:
     * - Carregar os serviços do perfil artístico.
     * - Renderizar os serviços cadastrados.
     * - Abrir e controlar o modal de serviço.
     * - Adicionar novos serviços.
     * - Editar serviços existentes.
     * - Excluir serviços.
     * - Controlar tipo de preço e valor.
     *
     * Este módulo trabalha exclusivamente com os serviços.
     *
     * Não é responsabilidade deste arquivo:
     * - Salvar os dados gerais do perfil.
     * - Controlar autenticação.
     * - Controlar abas do editor.
     * - Controlar portfólio ou agenda.
     *
     * Tabela utilizada:
     * servicos_artistas
     *
     * Modal utilizado:
     * #modalServico
     * =========================================================
     */


    const CONFIG = {

        tabela: "servicos_artistas"

    };


    let contexto = null;


    const estado = {

        lista: [],

        editandoId: null

    };


    /*
     * =========================================================
     * ELEMENTOS
     * =========================================================
     */

    function obterElemento(id) {

        if (
            contexto?.utils &&
            typeof contexto.utils.el === "function"
        ) {

            return contexto.utils.el(id);

        }


        return document.getElementById(id);

    }


    function obterPerfilId() {

        return contexto?.estado?.perfil?.id || null;

    }


    /*
     * =========================================================
     * FEEDBACK
     * =========================================================
     */

    function mostrarToast(
        mensagem,
        tipo = "sucesso"
    ) {

        if (
            contexto?.utils &&
            typeof contexto.utils.mostrarToast === "function"
        ) {

            contexto.utils.mostrarToast(
                mensagem,
                tipo
            );

            return;

        }


        alert(mensagem);

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

            return;

        }


        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

        }

    }


    /*
     * =========================================================
     * SEGURANÇA HTML
     * =========================================================
     */

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
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /*
     * =========================================================
     * VALORES
     * =========================================================
     */

    function formatarValorServico(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "";

        }


        const numero = Number(valor);


        if (!Number.isFinite(numero)) {

            return "";

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function converterValorServico(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return null;

        }


        let texto =
            String(valor).trim();


        if (!texto) {

            return null;

        }


        /*
         * Aceita:
         *
         * 500
         * 500,00
         * 500.00
         * 1.500,00
         */

        if (
            texto.includes(",")
        ) {

            texto =
                texto
                    .replace(/\./g, "")
                    .replace(",", ".");

        }


        texto =
            texto.replace(
                /[^\d.-]/g,
                ""
            );


        const numero =
            Number(texto);


        if (
            !Number.isFinite(numero)
        ) {

            return null;

        }


        return numero;

    }


    function obterTextoTipoPreco(tipo) {

        switch (tipo) {

            case "fixo":

                return "Preço fixo";


            case "a_partir_de":

                return "A partir de";


            case "sob_consulta":

                return "Sob consulta";


            default:

                return "Preço";

        }

    }


    function obterPrecoServico(servico) {

        if (
            servico.tipo_preco ===
            "sob_consulta"
        ) {

            return "Sob consulta";

        }


        if (
            servico.valor === null ||
            servico.valor === undefined ||
            servico.valor === ""
        ) {

            return "Valor não informado";

        }


        const valor =
            formatarValorServico(
                servico.valor
            );


        if (!valor) {

            return "Valor não informado";

        }


        if (
            servico.tipo_preco ===
            "a_partir_de"
        ) {

            return `A partir de R$ ${valor}`;

        }


        return `R$ ${valor}`;

    }


    /*
     * =========================================================
     * MODAL
     * =========================================================
     */

    function abrirModal() {

        const modal =
            obterElemento(
                contexto?.ids?.modalServico ||
                "modalServico"
            );


        if (!modal) {

            console.error(
                "PerfilServicos: modalServico não encontrado."
            );

            return;

        }


        modal.style.display =
            "flex";

        modal.removeAttribute(
            "aria-hidden"
        );


        document.body.classList.add(
            "modal-aberto"
        );


        atualizarIcones();


        const nome =
            obterElemento(
                contexto?.ids?.servicoNome ||
                "servicoNome"
            );


        if (nome) {

            setTimeout(() => {

                nome.focus();

            }, 100);

        }

    }


    function fecharModal() {

        const modal =
            document.getElementById(
                "modalServico"
            );


        if (!modal) {

            console.warn(
                "PerfilServicos: modal #modalServico não encontrado."
            );

            return;

        }


        /*
         * Remove o foco de qualquer elemento
         * que esteja dentro do modal antes de
         * aplicar aria-hidden.
         */
        if (
            document.activeElement &&
            modal.contains(
                document.activeElement
            )
        ) {

            document.activeElement.blur();

        }


        modal.style.display =
            "none";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-aberto"
        );

    }


    /*
     * =========================================================
     * CONFIGURAÇÃO
     * =========================================================
     */

    function configurar(
        novoContexto
    ) {

        contexto =
            novoContexto;


        if (!contexto?.estado) {

            console.error(
                "PerfilServicos: contexto inválido."
            );

            return;

        }


        estado.lista =
            Array.isArray(
                contexto.estado.servicosValores
            )
                ? contexto.estado.servicosValores
                : [];


        estado.editandoId =
            contexto.estado.editandoServicoId ||
            null;

    }


    /*
     * =========================================================
     * CARREGAR
     * =========================================================
     */

    async function carregar() {

        try {

            const perfilId =
                obterPerfilId();


            if (!perfilId) {

                console.warn(
                    "PerfilServicos: perfil ainda não disponível."
                );

                return [];

            }


            if (!contexto?.supabase) {

                throw new Error(
                    "Supabase não está disponível para os serviços."
                );

            }


            const {
                data,
                error
            } =
                await contexto.supabase
                    .from(CONFIG.tabela)
                    .select(
                        "id,perfil_id,nome_servico,descricao,duracao,tipo_preco,valor,ativo,created_at,updated_at"
                    )
                    .eq(
                        "perfil_id",
                        perfilId
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                throw error;

            }


            estado.lista =
                Array.isArray(data)
                    ? data
                    : [];


            if (contexto.estado) {

                contexto.estado.servicosValores =
                    estado.lista;

            }


            console.log(
                "SERVIÇOS CARREGADOS:",
                estado.lista
            );


            renderizar();


            return estado.lista;

        } catch (erro) {

            console.error(
                "Erro ao carregar serviços:",
                erro
            );


            mostrarToast(
                erro?.message ||
                "Não foi possível carregar os serviços.",
                "erro"
            );


            return [];

        }

    }


    /*
     * =========================================================
     * FORMULÁRIO
     * =========================================================
     */

    function obterDadosFormulario() {

        const nome =
            obterElemento(
                contexto?.ids?.servicoNome ||
                "servicoNome"
            );


        const descricao =
            obterElemento(
                contexto?.ids?.servicoDescricao ||
                "servicoDescricao"
            );


        const duracao =
            obterElemento(
                contexto?.ids?.servicoDuracao ||
                "servicoDuracao"
            );


        const tipoPreco =
            obterElemento(
                contexto?.ids?.servicoTipoPreco ||
                "servicoTipoPreco"
            );


        const valor =
            obterElemento(
                contexto?.ids?.servicoValor ||
                "servicoValor"
            );


        const ativo =
            obterElemento(
                contexto?.ids?.servicoAtivo ||
                "servicoAtivo"
            );


        return {

            nome:
                nome?.value.trim() || "",

            descricao:
                descricao?.value.trim() || null,

            duracao:
                duracao?.value.trim() || null,

            tipoPreco:
                tipoPreco?.value ||
                "fixo",

            valor:
                valor?.value.trim() || "",

            ativo:
                ativo?.checked !== false

        };

    }


    function validarDados(
        dados
    ) {

        if (!dados.nome) {

            throw new Error(
                "Informe o nome do serviço."
            );

        }


        const tiposValidos = [

            "fixo",

            "a_partir_de",

            "sob_consulta"

        ];


        if (
            !tiposValidos.includes(
                dados.tipoPreco
            )
        ) {

            throw new Error(
                "Selecione um tipo de preço válido."
            );

        }


        if (
            dados.tipoPreco ===
            "sob_consulta"
        ) {

            return;

        }


        if (!dados.valor) {

            throw new Error(
                "Informe o valor do serviço."
            );

        }


        const valor =
            converterValorServico(
                dados.valor
            );


        if (
            valor === null ||
            !Number.isFinite(valor)
        ) {

            throw new Error(
                "Informe um valor válido para o serviço."
            );

        }


        if (valor < 0) {

            throw new Error(
                "O valor do serviço não pode ser negativo."
            );

        }

    }


    function atualizarCampoValorServico() {

        const tipoPreco =
            obterElemento(
                contexto?.ids?.servicoTipoPreco ||
                "servicoTipoPreco"
            );


        const campo =
            obterElemento(
                contexto?.ids?.campoValorServico ||
                "campoValorServico"
            );


        const valor =
            obterElemento(
                contexto?.ids?.servicoValor ||
                "servicoValor"
            );


        if (!tipoPreco) {

            return;

        }


        const tipo =
            tipoPreco.value;


        if (
            tipo ===
            "sob_consulta"
        ) {

            if (campo) {

                campo.style.display =
                    "none";

            }


            if (valor) {

                valor.value = "";

            }


            return;

        }


        if (campo) {

            campo.style.display =
                "";

        }


        if (valor) {

            if (
                tipo ===
                "a_partir_de"
            ) {

                valor.placeholder =
                    "Ex.: 500,00";

            } else {

                valor.placeholder =
                    "0,00";

            }

        }

    }


    /*
     * =========================================================
     * LIMPAR FORMULÁRIO
     * =========================================================
     */

    function limparFormulario() {

        estado.editandoId =
            null;


        if (contexto?.estado) {

            contexto.estado.editandoServicoId =
                null;

        }


        const nome =
            obterElemento(
                contexto?.ids?.servicoNome ||
                "servicoNome"
            );


        const descricao =
            obterElemento(
                contexto?.ids?.servicoDescricao ||
                "servicoDescricao"
            );


        const duracao =
            obterElemento(
                contexto?.ids?.servicoDuracao ||
                "servicoDuracao"
            );


        const tipoPreco =
            obterElemento(
                contexto?.ids?.servicoTipoPreco ||
                "servicoTipoPreco"
            );


        const valor =
            obterElemento(
                contexto?.ids?.servicoValor ||
                "servicoValor"
            );


        const ativo =
            obterElemento(
                contexto?.ids?.servicoAtivo ||
                "servicoAtivo"
            );


        const botao =
            obterElemento(
                contexto?.ids?.btnSalvarServico ||
                "btnSalvarServico"
            );


        if (nome) {

            nome.value = "";

        }


        if (descricao) {

            descricao.value = "";

        }


        if (duracao) {

            duracao.value = "";

        }


        if (tipoPreco) {

            tipoPreco.value =
                "fixo";

        }


        if (valor) {

            valor.value = "";

        }


        if (ativo) {

            ativo.checked =
                true;

        }


        if (botao) {

            botao.innerHTML =
                '<i data-lucide="check"></i><span>Salvar</span>';

        }


        atualizarCampoValorServico();

        atualizarIcones();

    }


    /*
     * =========================================================
     * NOVO SERVIÇO
     * =========================================================
     */

    function novoServico() {

        limparFormulario();

        abrirModal();

    }


    /*
     * =========================================================
     * EDITAR SERVIÇO
     * =========================================================
     */

    function editar(id) {

        const servico =
            estado.lista.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!servico) {

            mostrarToast(
                "Serviço não encontrado.",
                "erro"
            );

            return;

        }


        estado.editandoId =
            servico.id;


        if (contexto?.estado) {

            contexto.estado.editandoServicoId =
                servico.id;

        }


        const nome =
            obterElemento(
                contexto?.ids?.servicoNome ||
                "servicoNome"
            );


        const descricao =
            obterElemento(
                contexto?.ids?.servicoDescricao ||
                "servicoDescricao"
            );


        const duracao =
            obterElemento(
                contexto?.ids?.servicoDuracao ||
                "servicoDuracao"
            );


        const tipoPreco =
            obterElemento(
                contexto?.ids?.servicoTipoPreco ||
                "servicoTipoPreco"
            );


        const valor =
            obterElemento(
                contexto?.ids?.servicoValor ||
                "servicoValor"
            );


        const ativo =
            obterElemento(
                contexto?.ids?.servicoAtivo ||
                "servicoAtivo"
            );


        const botao =
            obterElemento(
                contexto?.ids?.btnSalvarServico ||
                "btnSalvarServico"
            );


        if (nome) {

            nome.value =
                servico.nome_servico ||
                "";

        }


        if (descricao) {

            descricao.value =
                servico.descricao ||
                "";

        }


        if (duracao) {

            duracao.value =
                servico.duracao ||
                "";

        }


        if (tipoPreco) {

            tipoPreco.value =
                servico.tipo_preco ||
                "fixo";

        }


        if (valor) {

            valor.value =
                servico.valor !== null &&
                servico.valor !== undefined
                    ? servico.valor
                    : "";

        }


        if (ativo) {

            ativo.checked =
                servico.ativo !== false;

        }


        if (botao) {

            botao.innerHTML =
                '<i data-lucide="save"></i><span>Atualizar serviço</span>';

        }


        atualizarCampoValorServico();

        abrirModal();

        atualizarIcones();

    }


    /*
     * =========================================================
     * SALVAR / ATUALIZAR
     * =========================================================
     */

    async function salvar() {

        try {

            const perfilId =
                obterPerfilId();


            if (!perfilId) {

                throw new Error(
                    "Perfil artístico não encontrado."
                );

            }


            if (!contexto?.supabase) {

                throw new Error(
                    "Supabase não está disponível."
                );

            }


            const dados =
                obterDadosFormulario();


            validarDados(
                dados
            );


            let valor = null;


            if (
                dados.tipoPreco !==
                "sob_consulta"
            ) {

                valor =
                    converterValorServico(
                        dados.valor
                    );


                if (
                    valor === null ||
                    !Number.isFinite(valor) ||
                    valor < 0
                ) {

                    throw new Error(
                        "Informe um valor válido para o serviço."
                    );

                }

            }


            mostrarLoading(
                estado.editandoId
                    ? "Atualizando serviço..."
                    : "Salvando serviço..."
            );


            const agora =
                new Date().toISOString();


            const dadosServico = {

                nome_servico:
                    dados.nome,

                descricao:
                    dados.descricao,

                duracao:
                    dados.duracao,

                tipo_preco:
                    dados.tipoPreco,

                valor,

                ativo:
                    dados.ativo,

                updated_at:
                    agora

            };


            if (estado.editandoId) {

                const {
                    error
                } =
                    await contexto.supabase
                        .from(CONFIG.tabela)
                        .update(
                            dadosServico
                        )
                        .eq(
                            "id",
                            estado.editandoId
                        )
                        .eq(
                            "perfil_id",
                            perfilId
                        );


                if (error) {

                    throw error;

                }


                mostrarToast(
                    "Serviço atualizado com sucesso.",
                    "sucesso"
                );

            } else {

                const {
                    error
                } =
                    await contexto.supabase
                        .from(CONFIG.tabela)
                        .insert({

                            perfil_id:
                                perfilId,

                            ...dadosServico

                        });


                if (error) {

                    throw error;

                }


                mostrarToast(
                    "Serviço adicionado com sucesso.",
                    "sucesso"
                );

            }


            limparFormulario();

            fecharModal();

            await carregar();

        } catch (erro) {

            console.error(
                "Erro ao salvar serviço:",
                erro
            );


            mostrarToast(
                erro?.message ||
                "Não foi possível salvar o serviço.",
                "erro"
            );

        } finally {

            esconderLoading();

            atualizarIcones();

        }

    }


    async function adicionar() {

        return salvar();

    }


    /*
     * =========================================================
     * EXCLUIR
     * =========================================================
     */

    async function excluir(id) {

        const servico =
            estado.lista.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!servico) {

            mostrarToast(
                "Serviço não encontrado.",
                "erro"
            );

            return;

        }


        const confirmar =
            window.confirm(
                `Deseja excluir o serviço "${servico.nome_servico || "este serviço"}"?`
            );


        if (!confirmar) {

            return;

        }


        try {

            const perfilId =
                obterPerfilId();


            if (!perfilId) {

                throw new Error(
                    "Perfil artístico não encontrado."
                );

            }


            mostrarLoading(
                "Excluindo serviço..."
            );


            const {
                error
            } =
                await contexto.supabase
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


            if (error) {

                throw error;

            }


            if (
                String(estado.editandoId) ===
                String(id)
            ) {

                limparFormulario();

            }


            mostrarToast(
                "Serviço excluído com sucesso.",
                "sucesso"
            );


            await carregar();

        } catch (erro) {

            console.error(
                "Erro ao excluir serviço:",
                erro
            );


            mostrarToast(
                erro?.message ||
                "Não foi possível excluir o serviço.",
                "erro"
            );

        } finally {

            esconderLoading();

            atualizarIcones();

        }

    }


    /*
     * =========================================================
     * RENDERIZAÇÃO DOS SERVIÇOS
     *
     * A estrutura abaixo foi refeita para o card.
     *
     * O card agora possui:
     *
     * 1. Ícone
     * 2. Conteúdo principal
     * 3. Preço/status
     * 4. Ações
     *
     * A informação é agrupada para evitar que
     * descrição, preço e botões fiquem desalinhados.
     * =========================================================
     */

    function renderizar() {

        const lista =
            obterElemento(
                contexto?.ids?.servicosList ||
                "servicosList"
            );


        if (!lista) {

            console.warn(
                "PerfilServicos: #servicosList não encontrado."
            );

            return;

        }


        if (!estado.lista.length) {

            lista.innerHTML = `

                <div class="empty-state">

                    <i data-lucide="briefcase-business"></i>

                    <strong>
                        Nenhum serviço cadastrado
                    </strong>

                    <span>
                        Adicione os serviços que você oferece para seus clientes.
                    </span>

                </div>

            `;


            atualizarIcones();

            return;

        }


        lista.innerHTML =
            estado.lista
                .map(servico => {

                    const ativo =
                        servico.ativo !== false;


                    const preco =
                        obterPrecoServico(
                            servico
                        );


                    const tipoPreco =
                        obterTextoTipoPreco(
                            servico.tipo_preco
                        );


                    const nome =
                        escaparHtml(
                            servico.nome_servico ||
                            "Serviço sem nome"
                        );


                    const descricao =
                        servico.descricao
                            ? escaparHtml(
                                servico.descricao
                            )
                            : "";


                    const duracao =
                        servico.duracao
                            ? escaparHtml(
                                servico.duracao
                            )
                            : "";


                    const id =
                        escaparHtml(
                            servico.id
                        );


                    return `

                        <article
                            class="servico-edit-card"
                            data-servico-id="${id}"
                        >

                            <!-- =================================
                                 ÍCONE
                            ================================== -->

                            <div class="servico-edit-icone">

                                <i data-lucide="briefcase-business"></i>

                            </div>


                            <!-- =================================
                                 CONTEÚDO PRINCIPAL
                            ================================== -->

                            <div class="servico-edit-info">

                                <div class="servico-edit-titulo">

                                    <h3>
                                        ${nome}
                                    </h3>

                                </div>


                                ${
                                    descricao
                                        ? `
                                            <p class="servico-edit-descricao">
                                                ${descricao}
                                            </p>
                                        `
                                        : `
                                            <p class="servico-edit-descricao servico-sem-descricao">
                                                Nenhuma descrição informada.
                                            </p>
                                        `
                                }


                                <div class="servico-edit-meta">


                                    ${
                                        duracao
                                            ? `
                                                <span>

                                                    <i data-lucide="clock-3"></i>

                                                    <span>
                                                        ${duracao}
                                                    </span>

                                                </span>
                                            `
                                            : ""
                                    }


                                    <span>

                                        <i data-lucide="tag"></i>

                                        <span>
                                            ${escaparHtml(tipoPreco)}
                                        </span>

                                    </span>

                                </div>

                            </div>


                            <!-- =================================
                                 PREÇO E STATUS
                            ================================== -->

                            <div class="servico-edit-preco">

                                <strong>
                                    ${escaparHtml(preco)}
                                </strong>


                                <span
                                    class="servico-status ${
                                        ativo
                                            ? "ativo"
                                            : "inativo"
                                    }"
                                >

                                    ${
                                        ativo
                                            ? "Ativo"
                                            : "Inativo"
                                    }

                                </span>

                            </div>


                            <!-- =================================
                                 AÇÕES
                            ================================== -->

                            <div class="media-edit-actions">


                                <button
                                    type="button"
                                    class="btn-editar-servico"
                                    data-editar-servico="${id}"
                                    title="Editar serviço"
                                    aria-label="Editar serviço"
                                >

                                    <i data-lucide="pencil"></i>

                                </button>


                                <button
                                    type="button"
                                    class="btn-excluir"
                                    data-excluir-servico="${id}"
                                    title="Excluir serviço"
                                    aria-label="Excluir serviço"
                                >

                                    <i data-lucide="trash-2"></i>

                                </button>


                            </div>

                        </article>

                    `;

                })
                .join("");


        /*
         * =============================================
         * EDITAR
         * =============================================
         */

        lista
            .querySelectorAll(
                "[data-editar-servico]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        editar(
                            botao.dataset.editarServico
                        );

                    }
                );

            });


        /*
         * =============================================
         * EXCLUIR
         * =============================================
         */

        lista
            .querySelectorAll(
                "[data-excluir-servico]"
            )
            .forEach(botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        excluir(
                            botao.dataset.excluirServico
                        );

                    }
                );

            });


        atualizarIcones();

    }


    /*
     * =========================================================
     * INICIALIZAÇÃO
     * =========================================================
     */

    function inicializar() {

        /*
         * Tipo de preço
         */

        const tipoPreco =
            obterElemento(
                contexto?.ids?.servicoTipoPreco ||
                "servicoTipoPreco"
            );


        if (
            tipoPreco &&
            !tipoPreco.dataset.servicosTipoInicializado
        ) {

            tipoPreco.dataset.servicosTipoInicializado =
                "true";


            tipoPreco.addEventListener(
                "change",
                atualizarCampoValorServico
            );

        }


        /*
         * Botão "Adicionar serviço"
         *
         * Este botão NÃO salva.
         * Ele apenas abre o modal.
         */

        const botaoAdicionar =
            obterElemento(
                contexto?.ids?.btnAdicionarServico ||
                "btnAdicionarServico"
            );


        if (
            botaoAdicionar &&
            !botaoAdicionar.dataset.servicosInicializado
        ) {

            botaoAdicionar.dataset.servicosInicializado =
                "true";


            botaoAdicionar.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    novoServico();

                }
            );

        }


        /*
         * Botão "Salvar" dentro do modal.
         */

        const botaoSalvar =
            obterElemento(
                contexto?.ids?.btnSalvarServico ||
                "btnSalvarServico"
            );


        if (
            botaoSalvar &&
            !botaoSalvar.dataset.servicosSalvarInicializado
        ) {

            botaoSalvar.dataset.servicosSalvarInicializado =
                "true";


            botaoSalvar.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    salvar();

                }
            );

        }


        /*
         * Botão "Cancelar" do modal.
         */

        const botaoCancelar =
            obterElemento(
                contexto?.ids?.btnCancelarServico ||
                "btnCancelarServico"
            );


        if (
            botaoCancelar &&
            !botaoCancelar.dataset.servicosCancelarInicializado
        ) {

            botaoCancelar.dataset.servicosCancelarInicializado =
                "true";


            botaoCancelar.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    limparFormulario();

                    fecharModal();

                }
            );

        }


        /*
         * Botão X do modal.
         */

        const botaoFechar =
            obterElemento(
                contexto?.ids?.btnFecharModalServico ||
                "btnFecharModalServico"
            );


        if (
            botaoFechar &&
            !botaoFechar.dataset.servicosFecharInicializado
        ) {

            botaoFechar.dataset.servicosFecharInicializado =
                "true";


            botaoFechar.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    limparFormulario();

                    fecharModal();

                }
            );

        }


        /*
         * Clique fora do conteúdo do modal.
         */

        const modal =
            obterElemento(
                contexto?.ids?.modalServico ||
                "modalServico"
            );


        if (
            modal &&
            !modal.dataset.servicosModalInicializado
        ) {

            modal.dataset.servicosModalInicializado =
                "true";


            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        limparFormulario();

                        fecharModal();

                    }

                }
            );

        }


        /*
         * ESC fecha o modal.
         */

        if (
            !document.body.dataset.servicosEscInicializado
        ) {

            document.body.dataset.servicosEscInicializado =
                "true";


            document.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key !==
                        "Escape"
                    ) {

                        return;

                    }


                    const modalAtual =
                        obterElemento(
                            contexto?.ids?.modalServico ||
                            "modalServico"
                        );


                    if (
                        modalAtual &&
                        modalAtual.style.display !==
                        "none"
                    ) {

                        limparFormulario();

                        fecharModal();

                    }

                }
            );

        }


        atualizarCampoValorServico();

        atualizarIcones();

    }


    /*
     * =========================================================
     * API PÚBLICA
     * =========================================================
     */

    return {

        CONFIG,

        estado,

        configurar,

        inicializar,

        carregar,

        renderizar,

        salvar,

        adicionar,

        editar,

        excluir,

        limparFormulario,

        novoServico,

        abrirModal,

        fecharModal,

        atualizarCampoValorServico,

        formatarValorServico,

        converterValorServico,

        obterTextoTipoPreco,

        obterPrecoServico

    };


})();


/*
 * =========================================================
 * DISPONIBILIZAÇÃO GLOBAL
 * =========================================================
 *
 * O PerfilEditor.js e os demais módulos acessam
 * o módulo através de window.PerfilServicos.
 * =========================================================
 */

window.PerfilServicos =
    PerfilServicos;