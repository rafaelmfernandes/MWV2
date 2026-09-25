/* =========================================================
   MUSICALWORLD — RENDERIZAÇÃO DOS INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados-render.js

   Responsabilidade:

   - Renderizar a oportunidade.
   - Renderizar o estabelecimento.
   - Renderizar os contadores.
   - Renderizar os cards dos artistas.
   - Controlar estados visuais.
   - Não executar operações diretamente no Supabase.

   ========================================================= */

window.MusicalWorldOportunidadeInteressadosRender = (() => {

    let estadoAtual = null;

    let filtroAtual = "todos";


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    function elemento(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       TEXTO SEGURO
       ===================================================== */

    function escaparHtml(valor) {

        return String(valor ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       FORMATAÇÃO DE DATA
       ===================================================== */

    function formatarData(data) {

        if (!data) {

            return "A definir";

        }


        const partes =
            String(data).split("-");


        if (partes.length !== 3) {

            return data;

        }


        const [
            ano,
            mes,
            dia
        ] = partes;


        return `${dia}/${mes}/${ano}`;

    }


    /* =====================================================
       FORMATAÇÃO DE HORÁRIO
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

            return `${inicio.slice(0, 5)}`;

        }


        return "A definir";

    }


    /* =====================================================
       FORMATAÇÃO DE VALOR
       ===================================================== */

    function formatarValor(valor) {

        const numero =
            Number(valor);


        if (!Number.isFinite(numero)) {

            return "A combinar";

        }


        if (numero <= 0) {

            return "A combinar";

        }


        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =====================================================
       INICIAL DO NOME
       ===================================================== */

    function obterInicial(nome) {

        const texto =
            String(nome || "").trim();


        if (!texto) {

            return "M";

        }


        return texto
            .charAt(0)
            .toUpperCase();

    }


    /* =====================================================
       LOCALIZAÇÃO
       ===================================================== */

    function obterLocalizacao(
        oportunidade,
        perfilArtista
    ) {

        if (perfilArtista?.localizacao) {

            return perfilArtista.localizacao;

        }


        const local =
            oportunidade?.local || {};


        if (
            local.cidade &&
            local.estado
        ) {

            return `${local.cidade}/${local.estado}`;

        }


        return "Localização não informada";

    }


    /* =====================================================
       ESTILOS
       ===================================================== */

    function obterTags(
        interessado
    ) {

        const perfilArtista =
            interessado?.perfilArtista;


        const estilos =
            Array.isArray(
                perfilArtista?.estilos
            )
                ? perfilArtista.estilos
                : [];


        const instrumentos =
            Array.isArray(
                perfilArtista?.instrumentos
            )
                ? perfilArtista.instrumentos
                : [];


        return [
            ...estilos,
            ...instrumentos
        ]
            .filter(Boolean)
            .slice(0, 6);

    }


    /* =====================================================
       RENDERIZAR ESTADO
       ===================================================== */

    function mostrarEstado(
        tipo
    ) {

        const carregando =
            elemento("estadoCarregando");

        const erro =
            elemento("estadoErro");

        const conteudo =
            elemento("conteudoOportunidade");


        carregando.hidden =
            tipo !== "carregando";

        erro.hidden =
            tipo !== "erro";

        conteudo.hidden =
            tipo !== "conteudo";

    }


    /* =====================================================
       RENDERIZAR ERRO
       ===================================================== */

    function mostrarErro(
        mensagem
    ) {

        mostrarEstado("erro");


        const elementoMensagem =
            elemento("estadoErroMensagem");


        if (elementoMensagem) {

            elementoMensagem.textContent =
                mensagem ||
                "Ocorreu um erro ao carregar esta oportunidade.";

        }

    }


    /* =====================================================
       RENDERIZAR OPORTUNIDADE
       ===================================================== */

    function renderizarOportunidade(
        oportunidade,
        estabelecimento
    ) {

        elemento("oportunidadeTitulo").textContent =
            oportunidade.titulo ||
            "Oportunidade de contratação";


        elemento("oportunidadeDescricao").textContent =
            oportunidade.descricao ||
            "Gerencie os artistas que demonstraram interesse.";


        const perfil =
            estabelecimento || {};


        const nome =
            perfil.nome_exibicao ||
            "Estabelecimento";


        elemento("estabelecimentoNome").textContent =
            nome;


        elemento("estabelecimentoTipo").textContent =
            perfil?.tipos_perfil?.nome ||
            "Estabelecimento";


        const local =
            oportunidade.local || {};


        const localizacao =
            local.cidade && local.estado
                ? `${local.cidade}/${local.estado}`
                : "Localização não informada";


        elemento("estabelecimentoLocalizacao").textContent =
            localizacao;


        elemento("resumoData").textContent =
            formatarData(
                oportunidade.data_evento
            );


        elemento("resumoHorario").textContent =
            formatarHorario(
                oportunidade.hora_inicio,
                oportunidade.hora_fim
            );


        elemento("resumoValor").textContent =
            formatarValor(
                oportunidade.valor
            );


        elemento("estabelecimentoAvatarInicial").textContent =
            obterInicial(nome);


        const btn =
            elemento("btnVerOportunidade");


        if (btn) {

            btn.href =
                `oportunidade.html?id=${encodeURIComponent(oportunidade.id)}`;

        }

    }


    /* =====================================================
       RENDERIZAR CONTADORES
       ===================================================== */

    function renderizarContadores(
        interessados
    ) {

        const todos =
            interessados.length;


        const interessadosCount =
            interessados.filter(
                item =>
                    item.status === "interessado"
            ).length;


        const selecionados =
            interessados.filter(
                item =>
                    item.status === "selecionado"
            ).length;


        elemento("resumoInteressados").textContent =
            todos;


        elemento("contadorTodos").textContent =
            todos;


        elemento("contadorInteressados").textContent =
            interessadosCount;


        elemento("contadorSelecionado").textContent =
            selecionados;

    }


    /* =====================================================
       FILTRAR
       ===================================================== */

    function aplicarFiltro(
        interessados
    ) {

        if (filtroAtual === "todos") {

            return interessados;

        }


        return interessados.filter(
            item =>
                item.status === filtroAtual
        );

    }


    /* =====================================================
       CARD DO ARTISTA
       ===================================================== */

    function renderizarCard(
        interessado,
        oportunidade
    ) {

        const usuario =
            interessado.usuario || {};


        const perfil =
            interessado.perfil || {};


        const perfilArtista =
            interessado.perfilArtista || {};


        const nome =
            perfil.nome_exibicao ||
            usuario.nome ||
            "Artista";


        const tipo =
            perfilArtista.tipo_artista ||
            perfil?.tipos_perfil?.nome ||
            "Artista";


        const localizacao =
            obterLocalizacao(
                oportunidade,
                perfilArtista
            );


        const tags =
            obterTags(interessado);


        const mensagem =
            interessado.mensagem;


        const status =
            interessado.status ||
            "interessado";


        const foto =
            perfilArtista.foto_url;


        const avatarHtml =
            foto
                ? `
                    <div class="interessado-avatar">
                        <img
                            src="${escaparHtml(foto)}"
                            alt="Foto de ${escaparHtml(nome)}"
                        >
                    </div>
                `
                : `
                    <div class="interessado-avatar">
                        ${escaparHtml(obterInicial(nome))}
                    </div>
                `;


        const statusTexto = {

            interessado:
                "Interessado",

            selecionado:
                "Selecionado",

            recusado:
                "Recusado",

            retirado:
                "Retirado"

        }[status] || "Interessado";


        const statusClasse =
            status;


        const tagsHtml =
            tags.length
                ? `
                    <div class="interessado-tags">
                        ${tags.map(tag => `
                            <span class="interessado-tag">
                                ${escaparHtml(tag)}
                            </span>
                        `).join("")}
                    </div>
                `
                : "";


        const mensagemHtml =
            mensagem
                ? `
                    <p class="interessado-mensagem">
                        ${escaparHtml(mensagem)}
                    </p>
                `
                : `
                    <p class="interessado-mensagem interessado-sem-mensagem">
                        O artista não enviou uma mensagem.
                    </p>
                `;


        const perfilId =
            perfil.id || "";


        const podeSelecionar =
            status === "interessado";


        const acaoSelecao =
            podeSelecionar
                ? `
                    <button
                        type="button"
                        class="btn-principal btn-selecionar-artista"
                        data-interessado-id="${escaparHtml(interessado.id)}"
                    >
                        Selecionar
                    </button>
                `
                : status === "selecionado"
                    ? `
                        <button
                            type="button"
                            class="btn-principal btn-selecionado"
                            disabled
                        >
                            Selecionado
                        </button>
                    `
                    : "";


        return `
            <article
                class="interessado-card"
                data-interessado-id="${escaparHtml(interessado.id)}"
                data-status="${escaparHtml(status)}"
            >

                <div class="interessado-card-topo">

                    <div class="interessado-identidade">

                        ${avatarHtml}

                        <div class="interessado-identidade-texto">

                            <strong>
                                ${escaparHtml(nome)}
                            </strong>

                            <span>
                                ${escaparHtml(tipo)}
                            </span>

                        </div>

                    </div>


                    <span
                        class="interessado-status ${escaparHtml(statusClasse)}"
                    >
                        ${escaparHtml(statusTexto)}
                    </span>

                </div>


                <div class="interessado-localizacao">

                    <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z"
                        />

                        <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                        />
                    </svg>

                    <span>
                        ${escaparHtml(localizacao)}
                    </span>

                </div>


                ${tagsHtml}


                ${mensagemHtml}


                <div class="interessado-acoes">

                    <a
                        href="apresentar-perfil.html?id=${encodeURIComponent(perfilId)}"
                        class="btn-secundario"
                    >
                        Ver perfil
                    </a>

                    ${acaoSelecao}

                </div>

            </article>
        `;

    }


    /* =====================================================
       RENDERIZAR LISTA
       ===================================================== */

    function renderizarLista() {

        const lista =
            elemento("interessadosLista");


        const estadoSemInteressados =
            elemento("estadoSemInteressados");


        const estadoFiltroVazio =
            elemento("estadoFiltroVazio");


        const interessados =
            estadoAtual?.interessados || [];


        const filtrados =
            aplicarFiltro(interessados);


        renderizarContadores(
            interessados
        );


        if (!interessados.length) {

            lista.innerHTML = "";

            estadoSemInteressados.hidden =
                false;

            estadoFiltroVazio.hidden =
                true;

            return;

        }


        if (!filtrados.length) {

            lista.innerHTML = "";

            estadoSemInteressados.hidden =
                true;

            estadoFiltroVazio.hidden =
                false;

            return;

        }


        estadoSemInteressados.hidden =
            true;

        estadoFiltroVazio.hidden =
            true;


        lista.innerHTML =
            filtrados
                .map(
                    interessado =>
                        renderizarCard(
                            interessado,
                            estadoAtual.oportunidade
                        )
                )
                .join("");

    }


    /* =====================================================
       ATUALIZAR FILTRO VISUAL
       ===================================================== */

    function atualizarFiltroVisual() {

        document
            .querySelectorAll(".filtro-interessados")
            .forEach(botao => {

                const ativo =
                    botao.dataset.filtro === filtroAtual;


                botao.classList.toggle(
                    "ativo",
                    ativo
                );


                botao.setAttribute(
                    "aria-selected",
                    String(ativo)
                );

            });

    }


    /* =====================================================
       DEFINIR FILTRO
       ===================================================== */

    function definirFiltro(
        filtro
    ) {

        filtroAtual =
            filtro || "todos";


        atualizarFiltroVisual();

        renderizarLista();

    }


    /* =====================================================
       DEFINIR ESTADO
       ===================================================== */

    function definirEstado(
        novoEstado
    ) {

        estadoAtual =
            novoEstado;

    }


    /* =====================================================
       ATUALIZAR INTERESSADO
       ===================================================== */

    function atualizarInteressado(
        interessadoAtualizado
    ) {

        if (!estadoAtual) {

            return;

        }


        const indice =
            estadoAtual.interessados.findIndex(
                item =>
                    String(item.id) ===
                    String(interessadoAtualizado.id)
            );


        if (indice === -1) {

            return;

        }


        estadoAtual.interessados[indice] = {

            ...estadoAtual.interessados[indice],

            ...interessadoAtualizado

        };


        renderizarLista();

    }


    /* =====================================================
       MODAL
       ===================================================== */

    function abrirModalSelecao(
        interessado
    ) {

        const modal =
            elemento("modalSelecao");


        if (!modal) {

            return;

        }


        const nome =
            interessado?.perfil?.nome_exibicao ||
            interessado?.usuario?.nome ||
            "Artista";


        const tipo =
            interessado?.perfilArtista?.tipo_artista ||
            interessado?.perfil?.tipos_perfil?.nome ||
            "Artista";


        elemento("modalArtistaNome").textContent =
            nome;


        elemento("modalArtistaTipo").textContent =
            tipo;


        modal.hidden =
            false;


        modal.dataset.interessadoId =
            interessado.id;

    }


    function fecharModalSelecao() {

        const modal =
            elemento("modalSelecao");


        if (!modal) {

            return;

        }


        modal.hidden =
            true;


        delete modal.dataset.interessadoId;

    }


    function obterInteressadoDoModal() {

        const modal =
            elemento("modalSelecao");


        const id =
            modal?.dataset?.interessadoId;


        if (!id || !estadoAtual) {

            return null;

        }


        return estadoAtual.interessados.find(
            item =>
                String(item.id) ===
                String(id)
        ) || null;

    }


    /* =====================================================
       EXPORTAÇÃO
       ===================================================== */

    return {

        mostrarEstado,

        mostrarErro,

        renderizarOportunidade,

        renderizarLista,

        definirEstado,

        definirFiltro,

        atualizarInteressado,

        abrirModalSelecao,

        fecharModalSelecao,

        obterInteressadoDoModal

    };

})();