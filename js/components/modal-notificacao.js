/* =========================================================
   MUSICALWORLD — MODAL DE PRÉ-VISUALIZAÇÃO DE NOTIFICAÇÃO

   Arquivo:
   js/components/modal-notificacao.js

   Responsabilidade:

   * Criar e controlar o pequeno aviso de notificação no topo.
   * Exibir avatar, nome, título e prévia da notificação.
   * Animar a entrada e a saída do aviso.
   * Exibir uma barra de progresso indicando o tempo restante.
   * Fechar automaticamente após alguns segundos.
   * Permitir fechamento manual pelo botão "×".
   * Evitar que a mesma notificação seja exibida novamente.
   * Ser reutilizável para mensagens, contratações e outros eventos.

   Importante:

   * Este componente NÃO marca mensagens como lidas no banco.
   * O controle de "já exibida" é independente do controle de
     mensagens não lidas do sistema.
   ========================================================= */

(function (window) {

    "use strict";


    /* =========================================================
       CONFIGURAÇÕES
       ========================================================= */

    const CONFIG = {

        containerId: "modal-notificacao-container",

        /*
         * Tempo total que a notificação permanece aberta.
         *
         * A barra de progresso utiliza exatamente este mesmo
         * valor para chegar a 0% no momento do fechamento.
         */
        tempoExibicao: 6500,

        /*
         * Tempo utilizado para a animação de saída.
         */
        tempoAnimacao: 320,

        /*
         * Chave utilizada no localStorage para controlar
         * quais notificações já foram apresentadas.
         */
        chaveStorage: "musicalworld_notificacoes_exibidas",

        /*
         * Limite máximo de notificações armazenadas.
         */
        limiteStorage: 200
    };


    /* =========================================================
       ESTADO INTERNO
       ========================================================= */

    let modalAtual = null;

    let timeoutFechamento = null;

    let timeoutRemocao = null;


    /* =========================================================
       GARANTE O CONTAINER DO COMPONENTE
       ========================================================= */

    function obterContainer() {

        let container = document.getElementById(
            CONFIG.containerId
        );

        if (container) {
            return container;
        }

        container = document.createElement("div");

        container.id = CONFIG.containerId;

        document.body.appendChild(container);

        return container;
    }


    /* =========================================================
       STORAGE — NOTIFICAÇÕES JÁ EXIBIDAS
       ========================================================= */

    function obterNotificacoesExibidas() {

        try {

            const dados = localStorage.getItem(
                CONFIG.chaveStorage
            );

            if (!dados) {
                return [];
            }

            const lista = JSON.parse(dados);

            if (!Array.isArray(lista)) {
                return [];
            }

            return lista;

        } catch (erro) {

            console.warn(
                "ModalNotificacao: não foi possível ler o histórico de notificações exibidas.",
                erro
            );

            return [];
        }
    }


    function salvarNotificacoesExibidas(lista) {

        try {

            const listaLimitada = lista.slice(
                -CONFIG.limiteStorage
            );

            localStorage.setItem(
                CONFIG.chaveStorage,
                JSON.stringify(listaLimitada)
            );

        } catch (erro) {

            console.warn(
                "ModalNotificacao: não foi possível salvar o histórico de notificações.",
                erro
            );
        }
    }


    function gerarChaveNotificacao(dados) {

        if (!dados) {
            return null;
        }

        /*
         * A propriedade "id" é a identificação principal.
         *
         * Caso não seja enviada, usamos uma combinação de tipo
         * e identificador da origem.
         */

        if (
            dados.id !== undefined &&
            dados.id !== null
        ) {

            return String(dados.id);
        }

        if (
            dados.tipo &&
            dados.origemId !== undefined &&
            dados.origemId !== null
        ) {

            return `${dados.tipo}:${dados.origemId}`;
        }

        return null;
    }


    function notificacaoJaExibida(chave) {

        if (!chave) {
            return false;
        }

        const lista = obterNotificacoesExibidas();

        return lista.includes(chave);
    }


    function registrarNotificacaoExibida(chave) {

        if (!chave) {
            return;
        }

        let lista = obterNotificacoesExibidas();

        if (lista.includes(chave)) {
            return;
        }

        lista.push(chave);

        salvarNotificacoesExibidas(lista);
    }


    /* =========================================================
       LIMPEZA DOS TIMEOUTS
       ========================================================= */

    function limparTimeouts() {

        if (timeoutFechamento) {

            clearTimeout(timeoutFechamento);

            timeoutFechamento = null;
        }

        if (timeoutRemocao) {

            clearTimeout(timeoutRemocao);

            timeoutRemocao = null;
        }
    }


    /* =========================================================
       ESCAPE DE HTML
       ========================================================= */

    function escaparHTML(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";
        }

        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================================
       PRIMEIRA LETRA DO NOME
       ========================================================= */

    function obterIniciais(nome) {

        if (!nome) {
            return "?";
        }

        const texto = String(nome).trim();

        if (!texto) {
            return "?";
        }

        const partes = texto
            .split(/\s+/)
            .filter(Boolean);

        if (partes.length === 1) {

            return partes[0]
                .substring(0, 1)
                .toUpperCase();
        }

        return (
            partes[0].substring(0, 1) +
            partes[partes.length - 1].substring(0, 1)
        ).toUpperCase();
    }


    /* =========================================================
       ÍCONE PADRÃO DA NOTIFICAÇÃO
       ========================================================= */

    function obterIconeTipo(tipo) {

        const tipoNormalizado = String(
            tipo || ""
        ).toLowerCase();


        /*
         * MENSAGEM
         */

        if (
            tipoNormalizado === "mensagem" ||
            tipoNormalizado === "mensagens"
        ) {

            return `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
                    <path d="M8 9h8"></path>
                    <path d="M8 13h5"></path>
                </svg>
            `;
        }


        /*
         * SOLICITAÇÃO DE CONTRATO
         */

        if (
            tipoNormalizado === "solicitacao_contrato" ||
            tipoNormalizado === "solicitacao-contrato" ||
            tipoNormalizado === "contratacao"
        ) {

            return `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z"></path>
                    <path d="M16 3v5h5"></path>
                    <path d="M8 13h8"></path>
                    <path d="M8 17h5"></path>
                    <path d="M8 9h2"></path>
                </svg>
            `;
        }


        /*
         * AVALIAÇÃO
         */

        if (
            tipoNormalizado === "avaliacao" ||
            tipoNormalizado === "avaliacao_recebida"
        ) {

            return `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path d="m12 3 2.78 5.63 6.22.9-4.5 4.39 1.06 6.2L12 17.2l-5.56 2.92 1.06-6.2L3 9.53l6.22-.9L12 3z"></path>
                </svg>
            `;
        }


        /*
         * PAGAMENTO
         */

        if (
            tipoNormalizado === "pagamento" ||
            tipoNormalizado === "pagamento_recebido"
        ) {

            return `
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v10"></path>
                    <path d="M15 9.5c0-1.1-1.2-2-3-2s-3 .9-3 2 1.2 2 3 2 3 .9 3 2-1.2 2-3 2-3-.9-3-2"></path>
                </svg>
            `;
        }


        /*
         * ÍCONE GENÉRICO
         */

        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
                <path d="M10 21h4"></path>
            </svg>
        `;
    }


    /* =========================================================
       TEXTO PADRÃO DO TIPO
       ========================================================= */

    function obterTituloPadrao(tipo) {

        const tipoNormalizado = String(
            tipo || ""
        ).toLowerCase();


        if (
            tipoNormalizado === "mensagem" ||
            tipoNormalizado === "mensagens"
        ) {

            return "Nova mensagem";
        }


        if (
            tipoNormalizado === "solicitacao_contrato" ||
            tipoNormalizado === "solicitacao-contrato" ||
            tipoNormalizado === "contratacao"
        ) {

            return "Nova solicitação";
        }


        if (
            tipoNormalizado === "avaliacao" ||
            tipoNormalizado === "avaliacao_recebida"
        ) {

            return "Nova avaliação";
        }


        if (
            tipoNormalizado === "pagamento" ||
            tipoNormalizado === "pagamento_recebido"
        ) {

            return "Novo pagamento";
        }


        return "Nova notificação";
    }


    /* =========================================================
       CRIAÇÃO DO HTML
       ========================================================= */

    function criarModal(dados) {

        const container = obterContainer();

        const nome =
            dados.nome ||
            dados.remetenteNome ||
            "Usuário";


        const titulo =
            dados.titulo ||
            obterTituloPadrao(dados.tipo);


        const preview =
            dados.preview ||
            dados.mensagem ||
            dados.conteudo ||
            "";


        const avatarUrl =
            dados.avatarUrl ||
            dados.avatar ||
            dados.fotoUrl ||
            dados.foto ||
            "";


        const iniciais = obterIniciais(nome);

        const possuiAvatar = Boolean(avatarUrl);


        const classeAvatar = possuiAvatar
            ? "modal-notificacao-avatar possui-imagem"
            : "modal-notificacao-avatar sem-imagem";


        const avatarHTML = possuiAvatar

            ? `
                <img
                    class="${classeAvatar}"
                    src="${escaparHTML(avatarUrl)}"
                    alt=""
                    loading="eager"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                >

                <span
                    class="modal-notificacao-avatar-iniciais"
                    style="display: none;"
                    aria-hidden="true"
                >
                    ${escaparHTML(iniciais)}
                </span>
            `

            : `
                <span
                    class="${classeAvatar}"
                    aria-hidden="true"
                >
                    ${escaparHTML(iniciais)}
                </span>
            `;


        const icone = obterIconeTipo(
            dados.tipo
        );


        const modal = document.createElement(
            "div"
        );


        modal.className =
            "modal-notificacao";


        modal.setAttribute(
            "role",
            "status"
        );


        modal.setAttribute(
            "aria-live",
            "polite"
        );


        modal.innerHTML = `

            <div class="modal-notificacao-conteudo">

                <div class="modal-notificacao-avatar-wrapper">
                    ${avatarHTML}
                </div>


                <div class="modal-notificacao-texto">

                    <div class="modal-notificacao-cabecalho">

                        <span class="modal-notificacao-nome">
                            ${escaparHTML(nome)}
                        </span>


                        <span class="modal-notificacao-tipo-icon">
                            ${icone}
                        </span>

                    </div>


                    <div class="modal-notificacao-titulo">
                        ${escaparHTML(titulo)}
                    </div>


                    ${
                        preview
                            ? `
                                <div class="modal-notificacao-preview">
                                    ${escaparHTML(preview)}
                                </div>
                            `
                            : ""
                    }

                </div>


                <button
                    type="button"
                    class="modal-notificacao-fechar"
                    aria-label="Fechar notificação"
                    title="Fechar"
                >

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                    </svg>

                </button>


                <!--
                    Barra visual que representa o tempo restante
                    da notificação.
                -->

                <div
                    class="modal-notificacao-progresso"
                    aria-hidden="true"
                >

                    <div
                        class="modal-notificacao-progresso-barra"
                    ></div>

                </div>

            </div>

        `;


        /*
         * Se existir uma URL de destino, todo o aviso pode ser
         * clicado para abrir a página correspondente.
         */

        if (dados.acaoUrl) {

            modal.classList.add(
                "tem-acao"
            );


            modal.setAttribute(
                "tabindex",
                "0"
            );


            modal.addEventListener(
                "click",
                function (evento) {

                    if (
                        evento.target.closest(
                            ".modal-notificacao-fechar"
                        )
                    ) {

                        return;
                    }


                    window.location.href =
                        dados.acaoUrl;
                }
            );


            modal.addEventListener(
                "keydown",
                function (evento) {

                    if (
                        evento.key === "Enter" ||
                        evento.key === " "
                    ) {

                        evento.preventDefault();

                        window.location.href =
                            dados.acaoUrl;
                    }
                }
            );
        }


        /*
         * Botão de fechamento manual.
         */

        const botaoFechar =
            modal.querySelector(
                ".modal-notificacao-fechar"
            );


        if (botaoFechar) {

            botaoFechar.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    evento.stopPropagation();

                    fechar();
                }
            );
        }


        return modal;
    }


    /* =========================================================
       INICIAR BARRA DE PROGRESSO
       ========================================================= */

    function iniciarBarraProgresso(modal) {

        if (!modal) {
            return;
        }


        const barra =
            modal.querySelector(
                ".modal-notificacao-progresso-barra"
            );


        if (!barra) {
            return;
        }


        /*
         * Começamos explicitamente em 100%.
         */

        barra.style.transition = "none";

        barra.style.width = "100%";


        /*
         * Forçamos o navegador a reconhecer o estado inicial
         * antes de iniciar a animação.
         */

        void barra.offsetWidth;


        /*
         * A duração é sempre baseada na configuração atual
         * do componente.
         */

        barra.style.transition =
            `width ${CONFIG.tempoExibicao}ms linear`;


        /*
         * O requestAnimationFrame garante que a transição
         * comece depois que o estado inicial foi renderizado.
         */

        requestAnimationFrame(function () {

            if (modalAtual !== modal) {
                return;
            }

            barra.style.width = "0%";
        });
    }


    /* =========================================================
       EXIBIR
       ========================================================= */

    function mostrar(dados = {}) {

        /*
         * Uma notificação precisa ter uma identificação para
         * que possamos saber se ela já foi exibida anteriormente.
         */

        const chave =
            gerarChaveNotificacao(dados);


        if (!chave) {

            console.warn(
                "ModalNotificacao: a notificação precisa possuir um id ou origemId."
            );

            return false;
        }


        /*
         * Não exibe novamente uma notificação que já apareceu.
         */

        if (
            notificacaoJaExibida(chave)
        ) {

            return false;
        }


        /*
         * Se houver outra notificação aberta,
         * ela é encerrada antes da nova ser apresentada.
         */

        if (modalAtual) {

            fechar(true);
        }


        limparTimeouts();


        const container =
            obterContainer();


        const modal =
            criarModal(dados);


        modal.dataset.notificacaoId =
            chave;


        container.appendChild(modal);


        modalAtual = modal;


        /*
         * Força a primeira renderização antes de adicionar
         * a classe responsável pela animação de entrada.
         */

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                if (modalAtual !== modal) {
                    return;
                }

                modal.classList.add(
                    "visivel"
                );


                /*
                 * Inicia a contagem visual somente depois que
                 * o modal começa a aparecer.
                 */

                iniciarBarraProgresso(
                    modal
                );
            });
        });


        /*
         * Registramos a notificação como exibida imediatamente.
         *
         * Dessa forma, mesmo que o usuário feche rapidamente
         * ou saia da página, ela não volta a aparecer ao retornar.
         */

        registrarNotificacaoExibida(
            chave
        );


        /*
         * Fecha automaticamente depois do tempo configurado.
         */

        timeoutFechamento =
            setTimeout(function () {

                fechar();

            }, CONFIG.tempoExibicao);


        return true;
    }


    /* =========================================================
       FECHAR
       ========================================================= */

    function fechar(imediato = false) {

        limparTimeouts();


        if (!modalAtual) {
            return;
        }


        const modal =
            modalAtual;


        modalAtual = null;


        /*
         * Quando o fechamento é imediato, removemos o elemento
         * sem executar a animação.
         */

        if (imediato) {

            modal.remove();

            return;
        }


        /*
         * Executa a animação de saída.
         */

        modal.classList.remove(
            "visivel"
        );


        modal.classList.add(
            "saindo"
        );


        /*
         * Aguarda a animação terminar antes de remover
         * o elemento do DOM.
         */

        timeoutRemocao =
            setTimeout(function () {

                if (
                    modal &&
                    modal.parentNode
                ) {

                    modal.remove();
                }


                timeoutRemocao = null;

            }, CONFIG.tempoAnimacao);
    }


    /* =========================================================
       VERIFICAR SE ESTÁ ABERTO
       ========================================================= */

    function estaAberto() {

        return Boolean(
            modalAtual
        );
    }


    /* =========================================================
       LIMPAR HISTÓRICO
       ========================================================= */

    function limparHistorico() {

        try {

            localStorage.removeItem(
                CONFIG.chaveStorage
            );

        } catch (erro) {

            console.warn(
                "ModalNotificacao: não foi possível limpar o histórico.",
                erro
            );
        }
    }


    /* =========================================================
       VERIFICAR NOTIFICAÇÃO
       ========================================================= */

    function jaFoiExibida(
        dadosOuId
    ) {

        let chave = null;


        if (
            typeof dadosOuId === "string" ||
            typeof dadosOuId === "number"
        ) {

            chave =
                String(dadosOuId);

        } else {

            chave =
                gerarChaveNotificacao(
                    dadosOuId
                );
        }


        return notificacaoJaExibida(
            chave
        );
    }


    /* =========================================================
       CONFIGURAÇÕES PÚBLICAS
       ========================================================= */

    function definirTempoExibicao(
        tempo
    ) {

        const numero =
            Number(tempo);


        if (
            Number.isFinite(numero) &&
            numero > 0
        ) {

            CONFIG.tempoExibicao =
                numero;
        }
    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ModalNotificacao = {

        mostrar,

        fechar,

        estaAberto,

        jaFoiExibida,

        limparHistorico,

        definirTempoExibicao
    };


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    console.log(
        "ModalNotificacao: componente carregado."
    );


})(window);