const PerfilServicos = (() => {
"use strict";


const CONFIG = {
    tabela: "servicos_artistas"
};

let contexto = null;

const estado = {
    lista: [],
    editandoId: null
};

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

function mostrarToast(mensagem, tipo = "sucesso") {
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

function mostrarLoading(texto = "Carregando...") {
    if (
        contexto?.utils &&
        typeof contexto.utils.mostrarLoading === "function"
    ) {
        contexto.utils.mostrarLoading(texto);
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

function escaparHtml(valor) {
    if (
        contexto?.utils &&
        typeof contexto.utils.escaparHtml === "function"
    ) {
        return contexto.utils.escaparHtml(valor);
    }

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

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

    let texto = String(valor)
        .trim();

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

    if (texto.includes(",")) {
        texto = texto
            .replace(/\./g, "")
            .replace(",", ".");
    }

    texto = texto.replace(
        /[^\d.-]/g,
        ""
    );

    const numero =
        Number(texto);

    if (!Number.isFinite(numero)) {
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

function configurar(novoContexto) {
    contexto = novoContexto;

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
        } = await contexto.supabase
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

function validarDados(dados) {
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
        tipo === "sob_consulta"
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

    const cancelar =
        obterElemento(
            contexto?.ids?.btnCancelarServico ||
            "btnCancelarServico"
        );

    const botao =
        obterElemento(
            contexto?.ids?.btnAdicionarServico ||
            "btnAdicionarServico"
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
        ativo.checked = true;
    }

    if (botao) {
        botao.innerHTML =
            '<i data-lucide="plus"></i><span>Adicionar serviço</span>';
    }

    if (cancelar) {
        cancelar.style.display =
            "none";
    }

    atualizarCampoValorServico();
    atualizarIcones();
}

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

    const cancelar =
        obterElemento(
            contexto?.ids?.btnCancelarServico ||
            "btnCancelarServico"
        );

    const botao =
        obterElemento(
            contexto?.ids?.btnAdicionarServico ||
            "btnAdicionarServico"
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

    if (cancelar) {
        cancelar.style.display =
            "";
    }

    atualizarCampoValorServico();
    atualizarIcones();

    if (nome) {
        nome.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        nome.focus();
    }
}

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

        validarDados(dados);

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
            } = await contexto.supabase
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
            } = await contexto.supabase
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

        /*
         * Mantido exatamente como no
         * código antigo:
         *
         * exclusão física do registro.
         */
        const {
            error
        } = await contexto.supabase
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

function renderizar() {
    const lista =
        obterElemento(
            contexto?.ids?.servicosList ||
            "servicosList"
        );

    if (!lista) {
        return;
    }

    if (!estado.lista.length) {
        lista.innerHTML = `
            <div class="empty-state">
                <i data-lucide="briefcase-business"></i>
                <strong>Nenhum serviço cadastrado</strong>
                <span>Adicione os serviços que você oferece para seus clientes.</span>
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

                return `
                    <article
                        class="servico-edit-card"
                        data-servico-id="${escaparHtml(servico.id)}"
                    >
                        <div class="servico-edit-icone">
                            <i data-lucide="briefcase-business"></i>
                        </div>

                        <div class="servico-edit-info">
                            <h3>
                                ${escaparHtml(
                                    servico.nome_servico ||
                                    "Serviço sem nome"
                                )}
                            </h3>

                            ${
                                servico.descricao
                                    ? `
                                        <p>
                                            ${escaparHtml(
                                                servico.descricao
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            <div class="servico-edit-meta">
                                ${
                                    servico.duracao
                                        ? `
                                            <span>
                                                <i data-lucide="clock-3"></i>
                                                ${escaparHtml(
                                                    servico.duracao
                                                )}
                                            </span>
                                        `
                                        : ""
                                }

                                <span>
                                    <i data-lucide="tag"></i>
                                    ${escaparHtml(
                                        tipoPreco
                                    )}
                                </span>
                            </div>
                        </div>

                        <div class="servico-edit-preco">
                            <strong>
                                ${escaparHtml(
                                    preco
                                )}
                            </strong>

                            <span class="servico-status ${
                                ativo
                                    ? "ativo"
                                    : "inativo"
                            }">
                                ${
                                    ativo
                                        ? "Ativo"
                                        : "Inativo"
                                }
                            </span>
                        </div>

                        <div class="media-edit-actions">
                            <button
                                type="button"
                                class="btn-editar-servico"
                                data-editar-servico="${escaparHtml(servico.id)}"
                                title="Editar serviço"
                            >
                                <i data-lucide="pencil"></i>
                            </button>

                            <button
                                type="button"
                                class="btn-excluir"
                                data-excluir-servico="${escaparHtml(servico.id)}"
                                title="Excluir serviço"
                            >
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                    </article>
                `;
            })
            .join("");

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

function inicializar() {
    const tipoPreco =
        obterElemento(
            contexto?.ids?.servicoTipoPreco ||
            "servicoTipoPreco"
        );

    if (tipoPreco) {
        tipoPreco.addEventListener(
            "change",
            atualizarCampoValorServico
        );
    }

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

                salvar();
            }
        );
    }

    const botaoCancelar =
        obterElemento(
            contexto?.ids?.btnCancelarServico ||
            "btnCancelarServico"
        );

    if (
        botaoCancelar &&
        !botaoCancelar.dataset.servicosInicializado
    ) {
        botaoCancelar.dataset.servicosInicializado =
            "true";

        botaoCancelar.addEventListener(
            "click",
            event => {
                event.preventDefault();

                limparFormulario();
            }
        );
    }

    atualizarCampoValorServico();
    atualizarIcones();
}

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
    atualizarCampoValorServico,

    formatarValorServico,
    converterValorServico,
    obterTextoTipoPreco,
    obterPrecoServico
};


})();

window.PerfilServicos = PerfilServicos;
