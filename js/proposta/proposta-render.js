/* =========================================================
   MUSICALWORLD — RENDERIZAÇÃO DA PROPOSTA

   Arquivo:
   js/proposta/proposta-render.js

   Responsabilidade:

   - Criar a interface da proposta.
   - Exibir os dados do estabelecimento destinatário.
   - Exibir os serviços publicados pelo artista.
   - Permitir que o artista escolha o serviço oferecido.
   - Permitir que o artista informe os dados do evento.
   - Permitir que o artista informe um valor personalizado.
   - Usar o valor cadastrado do serviço quando o artista
     não informar um valor personalizado.
   - Permitir informar a data do evento.
   - Permitir informar opcionalmente os horários.
   - Exibir automaticamente o local do estabelecimento.
   - Exibir a revisão da proposta.
   - Exibir mensagens de validação e erro.
   - Não realizar operações diretamente no Supabase.
   - Não controlar o fluxo principal da proposta.

   Fluxo:

   ARTISTA
      ↓
   ENVIA PROPOSTA
      ↓
   ESTABELECIMENTO

   Regras:

   - Serviço é opcional.
   - Valor personalizado é opcional quando existe
     um serviço com valor cadastrado.
   - Se o valor ficar vazio, o valor do serviço será usado.
   - Data do evento é obrigatória.
   - Horários são opcionais.
   - Se nenhum horário for informado, o estabelecimento
     poderá definir o horário posteriormente.
   - Se apenas um horário for informado, a validação
     deverá solicitar os dois horários.
   - Tipo de evento não faz parte desta proposta.
   - Local não é informado pelo artista porque o destino
     da proposta é o próprio estabelecimento.

   O controle de abertura, avanço, retorno e envio ficará em:
   js/proposta/proposta-fluxo.js

   A coordenação geral ficará em:
   js/proposta/proposta.js

   Os dados serão carregados por:
   js/proposta/proposta-dados.js

   ========================================================= */


/* =========================================================
   1. OBJETO PRINCIPAL
   ========================================================= */

window.MusicalWorldPropostaRender = {


    /* =====================================================
       2. ESTADO INTERNO DA RENDERIZAÇÃO
       ===================================================== */

    estado: {

        contexto: null,

        dados: {

            servicoId: "",

            dataEvento: "",

            horarioInicio: "",

            horarioFim: "",

            valor: "",

            observacoes: ""

        }

    },


    /* =====================================================
       3. INICIALIZAR
       ===================================================== */

    inicializar(
        contexto = null
    ) {

        this.estado.contexto =
            contexto || null;


        this.criarEstrutura();


        if (
            contexto
        ) {

            this.renderizarContexto(
                contexto
            );

        }


        console.log(
            "MusicalWorldPropostaRender inicializado."
        );

    },


    /* =====================================================
       4. LOCALIZAR CONTAINER
       ===================================================== */

    obterContainer() {

        return (
            document.querySelector(
                "#propostaContainer"
            ) ||

            document.querySelector(
                "[data-proposta-container]"
            ) ||

            document.querySelector(
                ".proposta-container"
            )
        );

    },


    /* =====================================================
       5. CRIAR ESTRUTURA PRINCIPAL
       ===================================================== */

    criarEstrutura() {

        const container =
            this.obterContainer();


        if (!container) {

            console.warn(
                "MusicalWorldPropostaRender: container da proposta não encontrado."
            );

            return;

        }


        container.innerHTML = `

            <div
                class="proposta-modal"
                data-proposta-modal
            >

                <div
                    class="proposta-modal-conteudo"
                >

                    <header
                        class="proposta-cabecalho"
                    >

                        <button
                            type="button"
                            class="proposta-botao-fechar"
                            data-proposta-fechar
                            aria-label="Fechar proposta"
                        >
                            ×
                        </button>


                        <div
                            class="proposta-cabecalho-texto"
                        >

                            <span
                                class="proposta-etapa-indicador"
                                data-proposta-etapa
                            >
                                Etapa 1 de 2
                            </span>


                            <h2>
                                Enviar proposta
                            </h2>


                            <p>
                                Apresente sua proposta para este estabelecimento.
                            </p>

                        </div>

                    </header>


                    <main
                        class="proposta-conteudo"
                        data-proposta-conteudo
                    >

                        <section
                            class="proposta-etapa proposta-etapa-dados"
                            data-proposta-etapa-conteudo="dados"
                        >


                            <!-- =================================================
                                 ESTABELECIMENTO DESTINATÁRIO
                                 ================================================= -->

                            <div
                                class="proposta-profissional"
                                data-proposta-profissional
                            >
                            </div>


                            <!-- =================================================
                                 SERVIÇO OFERECIDO PELO ARTISTA
                                 ================================================= -->

                            <div
                                class="proposta-servico"
                                data-proposta-servico
                            >
                            </div>


                            <!-- =================================================
                                 LOCAL DO ESTABELECIMENTO

                                 O artista não informa o local.
                                 O endereço é obtido automaticamente do
                                 estabelecimento destinatário.
                                 ================================================= -->

                            <div
                                class="proposta-local"
                                data-proposta-local
                            >
                            </div>


                            <form
                                class="proposta-formulario"
                                data-proposta-formulario
                                novalidate
                            >


                                <!-- =============================================
                                     DATA DO EVENTO
                                     ============================================= -->

                                <div
                                    class="proposta-campo"
                                >

                                    <label
                                        for="propostaDataEvento"
                                    >
                                        Data do evento
                                    </label>


                                    <input
                                        type="date"
                                        id="propostaDataEvento"
                                        name="dataEvento"
                                        data-proposta-data
                                        required
                                    >

                                </div>


                                <!-- =============================================
                                     HORÁRIOS

                                     Os dois campos são opcionais.

                                     Se os dois ficarem vazios:
                                     o estabelecimento poderá definir
                                     o horário posteriormente.

                                     Se apenas um for preenchido:
                                     a validação deverá solicitar os dois.
                                     ============================================= -->

                                <div
                                    class="proposta-grid-horarios"
                                >

                                    <div
                                        class="proposta-campo"
                                    >

                                        <label
                                            for="propostaHorarioInicio"
                                        >
                                            Horário de início
                                        </label>


                                        <input
                                            type="time"
                                            id="propostaHorarioInicio"
                                            name="horarioInicio"
                                            data-proposta-horario-inicio
                                        >

                                    </div>


                                    <div
                                        class="proposta-campo"
                                    >

                                        <label
                                            for="propostaHorarioFim"
                                        >
                                            Horário de término
                                        </label>


                                        <input
                                            type="time"
                                            id="propostaHorarioFim"
                                            name="horarioFim"
                                            data-proposta-horario-fim
                                        >

                                    </div>

                                </div>


                                <small
                                    class="proposta-campo-ajuda"
                                >
                                    Se os horários ainda não estiverem definidos,
                                    deixe os dois campos em branco.
                                    O estabelecimento poderá informar o horário posteriormente.
                                </small>


                                <!-- =============================================
                                     VALOR DA PROPOSTA

                                     Se o artista selecionar um serviço e deixar
                                     este campo vazio, o valor cadastrado no
                                     serviço será utilizado automaticamente.

                                     Se o artista informar um valor, esse valor
                                     personalizado será utilizado.
                                     ============================================= -->

                                <div
                                    class="proposta-campo"
                                >

                                    <label
                                        for="propostaValor"
                                    >
                                        Valor da proposta
                                    </label>


                                    <div
                                        class="proposta-input-valor"
                                    >

                                        <span>
                                            R$
                                        </span>


                                        <input
                                            type="number"
                                            id="propostaValor"
                                            name="valor"
                                            data-proposta-valor
                                            min="0.01"
                                            step="0.01"
                                            placeholder="Valor do serviço"
                                        >

                                    </div>


                                    <small
                                        class="proposta-campo-ajuda"
                                    >
                                        Ao selecionar um serviço,
                                        o valor cadastrado será usado automaticamente.
                                        Você pode alterá-lo se quiser enviar outro valor.
                                    </small>

                                </div>


                                <!-- =============================================
                                     OBSERVAÇÕES
                                     ============================================= -->

                                <div
                                    class="proposta-campo"
                                >

                                    <label
                                        for="propostaObservacoes"
                                    >
                                        Observações
                                    </label>


                                    <textarea
                                        id="propostaObservacoes"
                                        name="observacoes"
                                        data-proposta-observacoes
                                        rows="4"
                                        maxlength="2000"
                                        placeholder="Adicione informações importantes sobre sua proposta."
                                    ></textarea>

                                </div>


                                <!-- =============================================
                                     MENSAGEM
                                     ============================================= -->

                                <div
                                    class="proposta-mensagem"
                                    data-proposta-mensagem
                                    aria-live="polite"
                                >
                                </div>


                                <!-- =============================================
                                     AÇÕES
                                     ============================================= -->

                                <div
                                    class="proposta-acoes"
                                >

                                    <button
                                        type="button"
                                        class="proposta-botao-secundario"
                                        data-proposta-cancelar
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        type="submit"
                                        class="proposta-botao-principal"
                                        data-proposta-continuar
                                    >
                                        Revisar proposta
                                    </button>

                                </div>

                            </form>

                        </section>


                        <!-- =====================================================
                             ETAPA 2 — REVISÃO
                             ===================================================== -->

                        <section
                            class="proposta-etapa proposta-etapa-revisao"
                            data-proposta-etapa-conteudo="revisao"
                            hidden
                        >

                            <div
                                class="proposta-revisao"
                                data-proposta-revisao
                            >
                            </div>


                            <div
                                class="proposta-mensagem"
                                data-proposta-mensagem-revisao
                                aria-live="polite"
                            >
                            </div>


                            <div
                                class="proposta-acoes"
                            >

                                <button
                                    type="button"
                                    class="proposta-botao-secundario"
                                    data-proposta-voltar
                                >
                                    Voltar
                                </button>


                                <button
                                    type="button"
                                    class="proposta-botao-principal"
                                    data-proposta-enviar
                                >
                                    Enviar proposta
                                </button>

                            </div>

                        </section>

                    </main>

                </div>

            </div>

        `;


        this.renderizarLocalEstabelecimento();

    },


    /* =========================================================
       6. RENDERIZAR CONTEXTO
       ========================================================= */

    renderizarContexto(
        contexto
    ) {

        if (!contexto) {

            return;

        }


        this.estado.contexto =
            contexto;


        this.renderizarProfissional(
            contexto
        );


        this.renderizarServicos(
            contexto.servicos || []
        );


        this.renderizarLocalEstabelecimento();

    },


    /* =========================================================
       7. RENDERIZAR ESTABELECIMENTO
       ========================================================= */

    renderizarProfissional(
        contexto
    ) {

        const elemento =
            document.querySelector(
                "[data-proposta-profissional]"
            );


        if (!elemento) {

            return;

        }


        const perfil =
            contexto.perfil || {};


        const estabelecimento =
            contexto.estabelecimento || {};


        const nome =
            estabelecimento.nome_exibicao ||
            estabelecimento.nome ||
            perfil.nome_exibicao ||
            perfil.nome ||
            "Estabelecimento";


        const tipo =
            estabelecimento.tipo_perfil ||
            perfil.tipo_perfil_nome ||
            perfil.tipo_perfil ||
            "Estabelecimento";


        const foto =
            estabelecimento.foto_url ||
            perfil.foto_url ||
            (
                perfil.usuario
                    ? perfil.usuario.foto_url
                    : ""
            ) ||
            "";


        let localizacao = "";


        if (
            estabelecimento.cidade ||
            estabelecimento.estado
        ) {

            localizacao =
                this.formatarLocalizacao(
                    {
                        cidade:
                            estabelecimento.cidade,

                        estado:
                            estabelecimento.estado
                    }
                );

        } else {

            localizacao =
                this.formatarLocalizacao(
                    estabelecimento.localizacao ||
                    perfil.localizacao
                );

        }


        const descricao =
            estabelecimento.descricao ||
            perfil.descricao ||
            "";


        elemento.innerHTML = `

            <div
                class="proposta-profissional-foto"
            >

                ${
                    foto
                        ? `
                            <img
                                src="${this.escaparAtributo(foto)}"
                                alt="${this.escaparTexto(nome)}"
                            >
                        `
                        : `
                            <div
                                class="proposta-profissional-placeholder"
                            >
                                ${this.obterInicial(nome)}
                            </div>
                        `
                }

            </div>


            <div
                class="proposta-profissional-info"
            >

                <strong>
                    ${this.escaparTexto(nome)}
                </strong>


                ${
                    tipo
                        ? `
                            <span>
                                ${this.escaparTexto(tipo)}
                            </span>
                        `
                        : ""
                }


                ${
                    localizacao
                        ? `
                            <small>
                                ${this.escaparTexto(
                                    localizacao
                                )}
                            </small>
                        `
                        : ""
                }


                ${
                    descricao
                        ? `
                            <p>
                                ${this.escaparTexto(
                                    descricao
                                )}
                            </p>
                        `
                        : ""
                }

            </div>

        `;

    },


    /* =========================================================
       8. RENDERIZAR SERVIÇOS DO ARTISTA
       ========================================================= */

    renderizarServicos(
        servicos = []
    ) {

        const elemento =
            document.querySelector(
                "[data-proposta-servico]"
            );


        if (!elemento) {

            return;

        }


        const lista =
            Array.isArray(servicos)
                ? servicos
                : [];


        if (
            lista.length === 0
        ) {

            elemento.innerHTML = `

                <div
                    class="proposta-servico-sem-opcoes"
                >

                    <strong>
                        Serviço oferecido
                    </strong>


                    <span>
                        Você ainda não possui serviços publicados.
                        A proposta poderá ser enviada informando
                        o valor diretamente.
                    </span>

                </div>

            `;


            return;

        }


        elemento.innerHTML = `

            <div
                class="proposta-servico-titulo"
            >

                <strong>
                    Serviço oferecido
                </strong>


                <span>
                    Selecione um serviço ou envie uma proposta
                    personalizada informando o valor.
                </span>

            </div>


            <div
                class="proposta-servicos-lista"
            >

                ${lista
                    .map(
                        (
                            servico,
                            indice
                        ) =>
                            this.renderizarOpcaoServico(
                                servico,
                                indice
                            )
                    )
                    .join("")
                }

            </div>

        `;


        if (
            this.estado.dados.servicoId
        ) {

            const radio =
                elemento.querySelector(
                    `[data-proposta-servico-id][value="${this.escaparSeletor(
                        this.estado.dados.servicoId
                    )}"]`
                );


            if (radio) {

                radio.checked = true;

            }

        }

    },


    /* =========================================================
       9. RENDERIZAR UMA OPÇÃO DE SERVIÇO
       ========================================================= */

    renderizarOpcaoServico(
        servico,
        indice = 0
    ) {

        const id =
            servico?.id ||
            "";


        const nome =
            servico?.nome_servico ||
            "Serviço";


        const descricao =
            servico?.descricao ||
            "";


        const valor =
            servico?.valor;


        const duracao =
            servico?.duracao ||
            "";


        const tipoPreco =
            servico?.tipo_preco ||
            "";


        const informacaoValor =
            this.formatarServicoValor(
                valor,
                tipoPreco
            );


        const informacaoDuracao =
            duracao
                ? `Duração: ${duracao}`
                : "";


        return `

            <label
                class="proposta-servico-opcao"
            >

                <input
                    type="radio"
                    name="propostaServico"
                    value="${this.escaparAtributo(id)}"
                    data-proposta-servico-id
                >


                <span
                    class="proposta-servico-opcao-conteudo"
                >

                    <strong>
                        ${this.escaparTexto(nome)}
                    </strong>


                    ${
                        descricao
                            ? `
                                <span>
                                    ${this.escaparTexto(
                                        descricao
                                    )}
                                </span>
                            `
                            : ""
                    }


                    ${
                        informacaoValor ||
                        informacaoDuracao
                            ? `
                                <small>

                                    ${
                                        informacaoValor
                                            ? `
                                                ${this.escaparTexto(
                                                    informacaoValor
                                                )}
                                            `
                                            : ""
                                    }

                                    ${
                                        informacaoValor &&
                                        informacaoDuracao
                                            ? `
                                                <span>
                                                    •
                                                </span>
                                            `
                                            : ""
                                    }

                                    ${
                                        informacaoDuracao
                                            ? `
                                                ${this.escaparTexto(
                                                    informacaoDuracao
                                                )}
                                            `
                                            : ""
                                    }

                                </small>
                            `
                            : ""
                    }

                </span>

            </label>

        `;

    },


    /* =========================================================
       10. FORMATAR VALOR DO SERVIÇO
       ========================================================= */

    formatarServicoValor(
        valor,
        tipoPreco = ""
    ) {

        const numero =
            Number(
                valor
            );


        if (
            !Number.isFinite(numero) ||
            numero <= 0
        ) {

            return "";

        }


        const valorFormatado =
            numero.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );


        if (
            tipoPreco
        ) {

            const tipo =
                String(
                    tipoPreco
                )
                    .toLowerCase()
                    .trim();


            if (
                tipo === "a partir de" ||
                tipo === "partir_de"
            ) {

                return `A partir de ${valorFormatado}`;

            }


            if (
                tipo === "hora" ||
                tipo === "por_hora"
            ) {

                return `${valorFormatado} / hora`;

            }


            if (
                tipo === "diaria" ||
                tipo === "por_dia"
            ) {

                return `${valorFormatado} / diária`;

            }

        }


        return valorFormatado;

    },


    /* =========================================================
       11. OBTER VALOR PADRÃO DO SERVIÇO

       Regra:

       - Se o artista informou um valor, usa o valor informado.
       - Se deixou vazio e selecionou um serviço com valor,
         usa o valor cadastrado no serviço.
       - Se não há serviço ou o serviço não possui valor,
         retorna vazio para que a validação trate o caso.
       ========================================================= */

    obterValorPadraoServico(
        servicoId
    ) {

        if (!servicoId) {

            return "";

        }


        const servico =
            this.obterServicoSelecionado(
                servicoId
            );


        if (!servico) {

            return "";

        }


        const numero =
            Number(
                servico.valor
            );


        if (
            !Number.isFinite(numero) ||
            numero <= 0
        ) {

            return "";

        }


        return String(
            numero
        );

    },


    /* =========================================================
       12. CAPTURAR DADOS DO FORMULÁRIO
       ========================================================= */

    obterDadosFormulario() {

        const dataEvento =
            document.querySelector(
                "[data-proposta-data]"
            );


        const horarioInicio =
            document.querySelector(
                "[data-proposta-horario-inicio]"
            );


        const horarioFim =
            document.querySelector(
                "[data-proposta-horario-fim]"
            );


        const valor =
            document.querySelector(
                "[data-proposta-valor]"
            );


        const observacoes =
            document.querySelector(
                "[data-proposta-observacoes]"
            );


        const servico =
            document.querySelector(
                "[data-proposta-servico-id]:checked"
            );


        const servicoId =
            servico
                ? String(
                    servico.value
                ).trim()
                : "";


        const valorInformado =
            valor
                ? String(
                    valor.value
                ).trim()
                : "";


        const valorFinal =
            valorInformado ||
            this.obterValorPadraoServico(
                servicoId
            );


        return {

            servicoId,

            dataEvento:
                dataEvento
                    ? String(
                        dataEvento.value
                    ).trim()
                    : "",

            horarioInicio:
                horarioInicio
                    ? String(
                        horarioInicio.value
                    ).trim()
                    : "",

            horarioFim:
                horarioFim
                    ? String(
                        horarioFim.value
                    ).trim()
                    : "",

            valor:
                valorFinal,

            observacoes:
                observacoes
                    ? String(
                        observacoes.value
                    ).trim()
                    : "",

            local:
                this.obterLocalEstabelecimento()

        };

    },


    /* =========================================================
       13. SALVAR DADOS NO ESTADO
       ========================================================= */

    salvarDadosFormulario() {

        const dados =
            this.obterDadosFormulario();


        this.estado.dados = {

            ...this.estado.dados,

            ...dados

        };


        return this.estado.dados;

    },


    /* =========================================================
       14. OBTER DADOS ATUAIS
       ========================================================= */

    obterDados() {

        return {

            ...this.estado.dados

        };

    },


    /* =========================================================
       15. RENDERIZAR REVISÃO
       ========================================================= */

    renderizarRevisao(
        dados = null
    ) {

        const elemento =
            document.querySelector(
                "[data-proposta-revisao]"
            );


        if (!elemento) {

            return;

        }


        const proposta =
            dados ||
            this.estado.dados;


        const contexto =
            this.estado.contexto || {};


        const perfil =
            contexto.perfil || {};


        const estabelecimento =
            contexto.estabelecimento || {};


        const nomeEstabelecimento =
            estabelecimento.nome_exibicao ||
            estabelecimento.nome ||
            perfil.nome_exibicao ||
            perfil.nome ||
            "Estabelecimento";


        const servicoSelecionado =
            this.obterServicoSelecionado(
                proposta.servicoId
            );


        const horario =
            this.formatarHorarioProposta(
                proposta.horarioInicio,
                proposta.horarioFim
            );


        const valorProposta =
            this.formatarValor(
                proposta.valor
            );


        const local =
            proposta.local ||
            this.obterLocalEstabelecimento();


        elemento.innerHTML = `

            <div
                class="proposta-revisao-cabecalho"
            >

                <span>
                    Confira os dados antes de enviar
                </span>


                <h3>
                    Proposta para ${this.escaparTexto(
                        nomeEstabelecimento
                    )}
                </h3>

            </div>


            <div
                class="proposta-revisao-lista"
            >

                ${
                    servicoSelecionado
                        ? this.renderizarItemRevisao(
                            "Serviço",
                            servicoSelecionado.nome_servico ||
                            "Serviço"
                        )
                        : this.renderizarItemRevisao(
                            "Serviço",
                            "Proposta personalizada"
                        )
                }


                ${this.renderizarItemRevisao(
                    "Data",
                    this.formatarData(
                        proposta.dataEvento
                    )
                )}


                ${this.renderizarItemRevisao(
                    "Horário",
                    horario
                )}


                ${this.renderizarItemRevisao(
                    "Valor da proposta",
                    valorProposta
                )}


                ${this.renderizarItemRevisao(
                    "Local",
                    this.formatarLocalCompleto(
                        local
                    )
                )}


                ${this.renderizarItemRevisao(
                    "Observações",
                    proposta.observacoes ||
                    "Nenhuma observação"
                )}

            </div>

        `;

    },


    /* =========================================================
       16. OBTER SERVIÇO SELECIONADO
       ========================================================= */

    obterServicoSelecionado(
        servicoId
    ) {

        if (
            !servicoId
        ) {

            return null;

        }


        const contexto =
            this.estado.contexto || {};


        const servicos =
            Array.isArray(
                contexto.servicos
            )
                ? contexto.servicos
                : [];


        return (
            servicos.find(
                servico =>
                    String(
                        servico?.id
                    ) ===
                    String(
                        servicoId
                    )
            ) ||
            null
        );

    },


    /* =========================================================
       17. OBTER LOCAL DO ESTABELECIMENTO

       O artista não escolhe o local.

       O local da proposta é sempre o endereço cadastrado
       pelo estabelecimento destinatário.
       ========================================================= */

    obterLocalEstabelecimento() {

        const contexto =
            this.estado.contexto || {};


        const estabelecimento =
            contexto.estabelecimento || {};


        const perfil =
            contexto.perfil || {};


        const localExistente =
            estabelecimento.local ||
            estabelecimento.local_estabelecimento ||
            null;


        if (
            localExistente &&
            typeof localExistente === "object"
        ) {

            return {

                ...localExistente,

                nomeLocal:
                    localExistente.nomeLocal ||
                    localExistente.nome_local ||
                    estabelecimento.nome_exibicao ||
                    estabelecimento.nome ||
                    perfil.nome_exibicao ||
                    perfil.nome ||
                    "Estabelecimento"

            };

        }


        return {

            nomeLocal:
                estabelecimento.nomeLocal ||
                estabelecimento.nome_local ||
                estabelecimento.nome_exibicao ||
                estabelecimento.nome ||
                perfil.nome_exibicao ||
                perfil.nome ||
                "Estabelecimento",

            endereco:
                estabelecimento.endereco ||
                "",

            numero:
                estabelecimento.numero ||
                "",

            bairro:
                estabelecimento.bairro ||
                "",

            cidade:
                estabelecimento.cidade ||
                "",

            estado:
                estabelecimento.estado ||
                "",

            cep:
                estabelecimento.cep ||
                "",

            semNumero:
                Boolean(
                    estabelecimento.semNumero ||
                    estabelecimento.sem_numero
                ),

            complemento:
                estabelecimento.complemento ||
                "",

            referencia:
                estabelecimento.referencia ||
                ""

        };

    },


    /* =========================================================
       18. RENDERIZAR LOCAL DO ESTABELECIMENTO
       ========================================================= */

    renderizarLocalEstabelecimento() {

        const elemento =
            document.querySelector(
                "[data-proposta-local]"
            );


        if (!elemento) {

            return;

        }


        const local =
            this.obterLocalEstabelecimento();


        const nomeLocal =
            local.nomeLocal ||
            "Estabelecimento";


        const endereco =
            this.formatarEndereco(
                local
            );


        const cidadeEstado =
            this.formatarLocalizacao(
                local
            );


        elemento.innerHTML = `

            <div
                class="proposta-local-conteudo"
            >

                <strong>
                    Local do evento
                </strong>


                <span>
                    ${this.escaparTexto(
                        nomeLocal
                    )}
                </span>


                ${
                    endereco
                        ? `
                            <small>
                                ${this.escaparTexto(
                                    endereco
                                )}
                            </small>
                        `
                        : ""
                }


                ${
                    cidadeEstado
                        ? `
                            <small>
                                ${this.escaparTexto(
                                    cidadeEstado
                                )}
                            </small>
                        `
                        : ""
                }

            </div>

        `;

    },


    /* =========================================================
       19. FORMATAR ENDEREÇO
       ========================================================= */

    formatarEndereco(
        local
    ) {

        if (
            !local ||
            typeof local !== "object"
        ) {

            return "";

        }


        const partes = [];


        if (
            local.endereco
        ) {

            let endereco =
                String(
                    local.endereco
                ).trim();


            const semNumero =
                Boolean(
                    local.semNumero ||
                    local.sem_numero
                );


            if (
                local.numero &&
                !semNumero
            ) {

                endereco +=
                    `, ${String(
                        local.numero
                    ).trim()}`;

            }


            partes.push(
                endereco
            );

        } else if (
            local.numero &&
            !Boolean(
                local.semNumero ||
                local.sem_numero
            )
        ) {

            partes.push(
                String(
                    local.numero
                ).trim()
            );

        }


        if (
            local.bairro
        ) {

            partes.push(
                String(
                    local.bairro
                ).trim()
            );

        }


        if (
            local.complemento
        ) {

            partes.push(
                String(
                    local.complemento
                ).trim()
            );

        }


        return partes.join(
            " • "
        );

    },


    /* =========================================================
       20. FORMATAR LOCAL COMPLETO PARA REVISÃO
       ========================================================= */

    formatarLocalCompleto(
        local
    ) {

        if (
            !local ||
            typeof local !== "object"
        ) {

            return "Endereço do estabelecimento";

        }


        const partes = [];


        const endereco =
            this.formatarEndereco(
                local
            );


        if (
            endereco
        ) {

            partes.push(
                endereco
            );

        }


        const cidadeEstado =
            this.formatarLocalizacao(
                local
            );


        if (
            cidadeEstado
        ) {

            partes.push(
                cidadeEstado
            );

        }


        if (
            local.cep
        ) {

            partes.push(
                `CEP ${String(
                    local.cep
                ).trim()}`
            );

        }


        if (
            local.referencia
        ) {

            partes.push(
                `Referência: ${String(
                    local.referencia
                ).trim()}`
            );

        }


        return partes.length
            ? partes.join(
                " • "
            )
            : (
                local.nomeLocal ||
                "Endereço do estabelecimento"
            );

    },


    /* =========================================================
       21. FORMATAR HORÁRIO DA PROPOSTA
       ========================================================= */

    formatarHorarioProposta(
        horarioInicio,
        horarioFim
    ) {

        const inicio =
            this.formatarHorario(
                horarioInicio
            );


        const fim =
            this.formatarHorario(
                horarioFim
            );


        if (
            !horarioInicio &&
            !horarioFim
        ) {

            return "A definir pelo estabelecimento";

        }


        if (
            horarioInicio &&
            horarioFim
        ) {

            return `${inicio} às ${fim}`;

        }


        if (
            horarioInicio
        ) {

            return `A partir de ${inicio}`;

        }


        if (
            horarioFim
        ) {

            return `Até ${fim}`;

        }


        return "A definir pelo estabelecimento";

    },


    /* =========================================================
       22. ITEM DA REVISÃO
       ========================================================= */

    renderizarItemRevisao(
        titulo,
        valor
    ) {

        return `

            <div
                class="proposta-revisao-item"
            >

                <span>
                    ${this.escaparTexto(
                        titulo
                    )}
                </span>


                <strong>
                    ${this.escaparTexto(
                        valor ||
                        "-"
                    )}
                </strong>

            </div>

        `;

    },


    /* =========================================================
       23. ATUALIZAR INDICADOR DA ETAPA
       ========================================================= */

    definirEtapa(
        etapa
    ) {

        const indicador =
            document.querySelector(
                "[data-proposta-etapa]"
            );


        const etapaDados =
            document.querySelector(
                '[data-proposta-etapa-conteudo="dados"]'
            );


        const etapaRevisao =
            document.querySelector(
                '[data-proposta-etapa-conteudo="revisao"]'
            );


        if (
            etapa === "revisao"
        ) {

            if (etapaDados) {

                etapaDados.hidden = true;

            }


            if (etapaRevisao) {

                etapaRevisao.hidden = false;

            }


            if (indicador) {

                indicador.textContent =
                    "Etapa 2 de 2";

            }


            return;

        }


        if (etapaDados) {

            etapaDados.hidden = false;

        }


        if (etapaRevisao) {

            etapaRevisao.hidden = true;

        }


        if (indicador) {

            indicador.textContent =
                "Etapa 1 de 2";

        }

    },


    /* =========================================================
       24. MENSAGEM
       ========================================================= */

    mostrarMensagem(
        mensagem,
        tipo = "erro",
        revisao = false
    ) {

        const seletor =
            revisao
                ? "[data-proposta-mensagem-revisao]"
                : "[data-proposta-mensagem]";


        const elemento =
            document.querySelector(
                seletor
            );


        if (!elemento) {

            return;

        }


        if (!mensagem) {

            elemento.innerHTML = "";


            elemento.className =
                "proposta-mensagem";


            return;

        }


        elemento.className =
            `proposta-mensagem proposta-mensagem-${tipo}`;


        elemento.textContent =
            mensagem;

    },


    /* =========================================================
       25. LIMPAR MENSAGENS
       ========================================================= */

    limparMensagens() {

        this.mostrarMensagem(
            ""
        );


        this.mostrarMensagem(
            "",
            "erro",
            true
        );

    },


    /* =========================================================
       26. ESTADO DE CARREGAMENTO
       ========================================================= */

    definirCarregando(
        carregando
    ) {

        const botao =
            document.querySelector(
                "[data-proposta-enviar]"
            );


        if (!botao) {

            return;

        }


        botao.disabled =
            Boolean(
                carregando
            );


        botao.textContent =
            carregando
                ? "Enviando..."
                : "Enviar proposta";

    },


    /* =========================================================
       27. FECHAR INTERFACE
       ========================================================= */

    fechar() {

        const container =
            this.obterContainer();


        if (!container) {

            return;

        }


        container.innerHTML = "";


        container.hidden = true;

    },


    /* =========================================================
       28. ABRIR INTERFACE
       ========================================================= */

    abrir() {

        const container =
            this.obterContainer();


        if (!container) {

            return;

        }


        container.hidden = false;

    },


    /* =========================================================
       29. FORMATAR VALOR
       ========================================================= */

    formatarValor(
        valor
    ) {

        const numero =
            Number(
                String(
                    valor ?? ""
                ).replace(
                    ",",
                    "."
                )
            );


        if (
            !Number.isFinite(numero) ||
            numero <= 0
        ) {

            return "-";

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    },


    /* =========================================================
       30. FORMATAR DATA
       ========================================================= */

    formatarData(
        data
    ) {

        if (!data) {

            return "-";

        }


        const partes =
            String(data).split(
                "-"
            );


        if (
            partes.length !== 3
        ) {

            return data;

        }


        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    },


    /* =========================================================
       31. FORMATAR HORÁRIO
       ========================================================= */

    formatarHorario(
        horario
    ) {

        if (!horario) {

            return "-";

        }


        return String(
            horario
        ).substring(
            0,
            5
        );

    },


    /* =========================================================
       32. FORMATAR LOCALIZAÇÃO
       ========================================================= */

    formatarLocalizacao(
        localizacao
    ) {

        if (
            typeof localizacao === "string"
        ) {

            return localizacao;

        }


        if (
            !localizacao ||
            typeof localizacao !== "object"
        ) {

            return "";

        }


        const partes = [];


        if (
            localizacao.cidade
        ) {

            partes.push(
                String(
                    localizacao.cidade
                ).trim()
            );

        }


        if (
            localizacao.estado
        ) {

            partes.push(
                String(
                    localizacao.estado
                ).trim()
            );

        }


        return partes.join(
            " - "
        );

    },


    /* =========================================================
       33. OBTER INICIAL
       ========================================================= */

    obterInicial(
        nome
    ) {

        if (!nome) {

            return "M";

        }


        return String(
            nome
        )
            .trim()
            .charAt(0)
            .toUpperCase();

    },


    /* =========================================================
       34. ESCAPAR TEXTO
       ========================================================= */

    escaparTexto(
        valor
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            valor == null
                ? ""
                : String(valor);


        return div.innerHTML;

    },


    /* =========================================================
       35. ESCAPAR ATRIBUTO
       ========================================================= */

    escaparAtributo(
        valor
    ) {

        return this
            .escaparTexto(
                valor
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    },


    /* =========================================================
       36. ESCAPAR SELETOR CSS
       ========================================================= */

    escaparSeletor(
        valor
    ) {

        const texto =
            String(
                valor ?? ""
            );


        if (
            window.CSS &&
            typeof window.CSS.escape === "function"
        ) {

            return window.CSS.escape(
                texto
            );

        }


        return texto.replace(
            /([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g,
            "\\$1"
        );

    }

};


/* =========================================================
   37. CONFIRMAÇÃO DO MÓDULO
   ========================================================= */

console.log(
    "MusicalWorldPropostaRender carregado."
);