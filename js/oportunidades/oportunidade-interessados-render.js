
/* =========================================================
   MUSICALWORLD — RENDERIZAÇÃO DOS INTERESSADOS

   Arquivo:
   js/oportunidades/oportunidade-interessados-render.js

   Responsabilidade:

   - Renderizar os dados da oportunidade.
   - Renderizar o estabelecimento.
   - Renderizar a foto do estabelecimento ou sua inicial.
   - Renderizar os contadores.
   - Renderizar os cards dos artistas.
   - Controlar os filtros visuais.
   - Controlar o modal de seleção.
   - Atualizar um interessado após seleção.
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


        const texto =
            String(data);


        const dataSomente =
            texto.includes("T")
                ? texto.split("T")[0]
                : texto;


        const partes =
            dataSomente.split("-");


        if (partes.length !== 3) {

            return texto;

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

            return `${String(inicio).slice(0, 5)} às ${String(fim).slice(0, 5)}`;

        }


        if (inicio) {

            return String(inicio).slice(0, 5);

        }


        return "A definir";

    }



    /* =====================================================
       FORMATAÇÃO DE VALOR
       ===================================================== */

    function formatarValor(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "A combinar";

        }


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
       FORMATAÇÃO DO LOCAL
       ===================================================== */

    function formatarLocal(local) {

        if (!local) {

            return "Localização não informada";

        }


        let valor =
            local;


        /*
         * O campo local pode chegar do Supabase como:
         *
         * - objeto JSON
         * - string contendo JSON
         * - string simples
         */

        if (typeof valor === "string") {

            try {

                valor =
                    JSON.parse(valor);

            } catch {

                return valor;

            }

        }


        if (typeof valor !== "object") {

            return String(valor);

        }


        const nome =
            valor.nome ||
            valor.local ||
            valor.estabelecimento ||
            "";


        const endereco =
            valor.endereco ||
            "";


        const numero =
            valor.numero ||
            "";


        const complemento =
            valor.complemento ||
            "";


        const bairro =
            valor.bairro ||
            "";


        const cidade =
            valor.cidade ||
            "";


        const estado =
            valor.estado ||
            valor.uf ||
            "";


        const cidadeEstado =
            cidade && estado
                ? `${cidade}/${estado}`
                : cidade || estado;


        const partes = [
            nome,
            endereco,
            numero,
            complemento,
            bairro,
            cidadeEstado
        ]
            .filter(Boolean);


        if (!partes.length) {

            return "Localização não informada";

        }


        return partes.join(" • ");

    }



    /* =====================================================
       LOCALIZAÇÃO RESUMIDA
       ===================================================== */

    function formatarLocalizacaoResumo(local) {

        if (!local) {

            return "Localização não informada";

        }


        let valor =
            local;


        if (typeof valor === "string") {

            try {

                valor =
                    JSON.parse(valor);

            } catch {

                return valor;

            }

        }


        if (typeof valor !== "object") {

            return String(valor);

        }


        const cidade =
            valor.cidade ||
            "";


        const estado =
            valor.estado ||
            valor.uf ||
            "";


        if (cidade && estado) {

            return `${cidade}/${estado}`;

        }


        return cidade ||
            estado ||
            valor.nome ||
            "Localização não informada";

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
       LOCALIZAÇÃO DO ARTISTA
       ===================================================== */

    function obterLocalizacao(
        oportunidade,
        perfilArtista
    ) {

        if (perfilArtista?.localizacao) {

            return perfilArtista.localizacao;

        }


        const local =
            oportunidade?.local;


        if (typeof local === "string") {

            try {

                const localObjeto =
                    JSON.parse(local);


                if (
                    localObjeto?.cidade &&
                    localObjeto?.estado
                ) {

                    return `${localObjeto.cidade}/${localObjeto.estado}`;

                }


                return formatarLocalizacaoResumo(
                    localObjeto
                );

            } catch {

                return local;

            }

        }


        if (
            local?.cidade &&
            local?.estado
        ) {

            return `${local.cidade}/${local.estado}`;

        }


        return "Localização não informada";

    }



    /* =====================================================
       OBTER TAGS
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
       NORMALIZAR STATUS
       ===================================================== */

    function obterStatus(
        interessado
    ) {

        return interessado?.status ||
            "interessado";

    }



    /* =====================================================
       TEXTO DO STATUS
       ===================================================== */

    function obterTextoStatus(
        status
    ) {

        const textos = {

            interessado:
                "Interessado",

            selecionado:
                "Selecionado",

            recusado:
                "Recusado",

            retirado:
                "Retirado"

        };


        return textos[status] ||
            "Interessado";

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


        /*
         * Esses elementos podem não existir nesta versão
         * da página. Por isso, cada alteração é protegida.
         */

        if (carregando) {

            carregando.hidden =
                tipo !== "carregando";

        }


        if (erro) {

            erro.hidden =
                tipo !== "erro";

        }


        if (conteudo) {

            conteudo.hidden =
                tipo !== "conteudo";

        }

    }



    /* =====================================================
       RENDERIZAR ERRO
       ===================================================== */

    function mostrarErro(
        mensagem
    ) {

        const elementoMensagem =
            elemento("estadoErroMensagem");


        if (elementoMensagem) {

            elementoMensagem.textContent =
                mensagem ||
                "Ocorreu um erro ao carregar esta oportunidade.";

        }


        const conteudo =
            document.querySelector(".oi-conteudo");


        if (
            conteudo &&
            !elementoMensagem
        ) {

            console.error(
                mensagem ||
                "Ocorreu um erro ao carregar esta oportunidade."
            );

        }


        mostrarEstado("erro");

    }



    /* =====================================================
       RENDERIZAR OPORTUNIDADE
       ===================================================== */

    function renderizarOportunidade(
        oportunidade,
        estabelecimento
    ) {

        if (!oportunidade) {

            console.warn(
                "Nenhuma oportunidade foi recebida para renderização."
            );

            return;

        }


        /* =================================================
           DADOS PRINCIPAIS
           ================================================= */

        const titulo =
            oportunidade.titulo ||
            "Oportunidade de contratação";


        const descricao =
            oportunidade.descricao ||
            "Gerencie os artistas que demonstraram interesse.";



        /* =================================================
           TÍTULO PRINCIPAL
           ================================================= */

        const tituloPrincipal =
            elemento("oportunidadeTitulo");


        if (tituloPrincipal) {

            tituloPrincipal.textContent =
                titulo;

        }



        /* =================================================
           DESCRIÇÃO PRINCIPAL
           ================================================= */

        const descricaoElemento =
            elemento("oportunidadeDescricao");


        if (descricaoElemento) {

            descricaoElemento.textContent =
                descricao;

        }



        /* =================================================
           TÍTULO DO CARD DA OPORTUNIDADE
           ================================================= */

        const tituloCard =
            elemento("oportunidadeTituloCard");


        if (tituloCard) {

            tituloCard.textContent =
                titulo;

        }



        /* =================================================
           DATA
           ================================================= */

        const data =
            elemento("resumoData");


        if (data) {

            data.textContent =
                formatarData(
                    oportunidade.data_evento
                );

        }



        /* =================================================
           HORÁRIO
           ================================================= */

        const horario =
            elemento("resumoHorario");


        if (horario) {

            horario.textContent =
                formatarHorario(
                    oportunidade.hora_inicio,
                    oportunidade.hora_fim
                );

        }



        /* =================================================
           LOCAL
           ================================================= */

        const local =
            elemento("resumoLocal");


        if (local) {

            local.textContent =
                formatarLocal(
                    oportunidade.local
                );

        }



        /* =================================================
           VALOR
           ================================================= */

        const valor =
            elemento("resumoValor");


        if (valor) {

            valor.textContent =
                formatarValor(
                    oportunidade.valor
                );

        }



        /* =================================================
           ESTABELECIMENTO
           ================================================= */

        const perfil =
            estabelecimento || {};


        const nome =
            perfil.nome_exibicao ||
            "Estabelecimento";


        const tipo =
            perfil?.tipos_perfil?.nome ||
            "Estabelecimento";


        /*
         * A foto do estabelecimento pertence à tabela
         * usuarios e foi carregada através do relacionamento:
         *
         * perfis.usuario_id → usuarios.id
         *
         * Portanto, a URL correta está em:
         *
         * estabelecimento.usuarios.foto_url
         */

        const foto =
            String(
                perfil?.usuarios?.foto_url ||
                ""
            ).trim();


        const nomeElemento =
            elemento("estabelecimentoNome");


        if (nomeElemento) {

            nomeElemento.textContent =
                nome;

        }


        const tipoElemento =
            elemento("estabelecimentoTipo");


        if (tipoElemento) {

            tipoElemento.textContent =
                tipo;

        }



        /* =================================================
           LOCALIZAÇÃO DO ESTABELECIMENTO
           ================================================= */

        const localEstabelecimento =
            elemento("estabelecimentoLocalizacao");


        if (localEstabelecimento) {

            localEstabelecimento.textContent =
                formatarLocalizacaoResumo(
                    oportunidade.local
                );

        }



        /* =================================================
           AVATAR DO ESTABELECIMENTO
           ================================================= */

        const inicial =
            elemento("estabelecimentoAvatarInicial");


        const avatar =
            elemento("estabelecimentoAvatar");


        if (inicial) {

            inicial.textContent =
                obterInicial(nome);

        }


        /*
         * Quando existe foto, o elemento <img> recebe a URL
         * e passa a ser exibido.
         *
         * Quando não existe foto, a imagem permanece oculta
         * e a inicial continua visível.
         */

        if (avatar) {

            const imagem =
                avatar.querySelector("img");


            if (imagem && foto) {

                imagem.alt =
                    `Foto de ${nome}`;


                imagem.src =
                    foto;


                imagem.style.display =
                    "block";


                if (inicial) {

                    inicial.style.display =
                        "none";

                }


                /*
                 * Caso a URL exista no banco, mas a imagem não
                 * possa ser carregada, voltamos automaticamente
                 * para a inicial do estabelecimento.
                 */

                imagem.onerror = () => {

                    imagem.style.display =
                        "none";


                    imagem.removeAttribute(
                        "src"
                    );


                    if (inicial) {

                        inicial.style.display =
                            "flex";

                    }

                };

            } else {

                if (imagem) {

                    imagem.style.display =
                        "none";


                    imagem.removeAttribute(
                        "src"
                    );

                }


                if (inicial) {

                    inicial.style.display =
                        "flex";

                }

            }


            avatar.hidden =
                false;

        }



        /* =================================================
           BOTÃO — VER OPORTUNIDADE
           ================================================= */

        const btn =
            elemento("btnVerOportunidade");


        if (btn && oportunidade.id) {

            const oportunidadeId =
                String(oportunidade.id);


            btn.dataset.oportunidadeId =
                oportunidadeId;


            /*
             * A página atual utiliza um botão.
             *
             * Guardamos o ID no elemento para que o módulo
             * de fluxo possa utilizá-lo sem precisar buscar
             * novamente a oportunidade.
             */

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
                    obterStatus(item) ===
                    "interessado"
            ).length;


        const selecionados =
            interessados.filter(
                item =>
                    obterStatus(item) ===
                    "selecionado"
            ).length;


        const resumo =
            elemento("resumoInteressados");


        if (resumo) {

            resumo.textContent =
                todos;

        }


        const contadorTodos =
            elemento("contadorTodos");


        if (contadorTodos) {

            contadorTodos.textContent =
                todos;

        }


        const contadorInteressados =
            elemento("contadorInteressados");


        if (contadorInteressados) {

            contadorInteressados.textContent =
                interessadosCount;

        }


        const contadorSelecionado =
            elemento("contadorSelecionado");


        if (contadorSelecionado) {

            contadorSelecionado.textContent =
                selecionados;

        }

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
                obterStatus(item) ===
                filtroAtual
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
            interessado?.usuario || {};


        const perfil =
            interessado?.perfil || {};


        const perfilArtista =
            interessado?.perfilArtista || {};


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
            obterTags(
                interessado
            );


        const mensagem =
            interessado?.mensagem;


        const status =
            obterStatus(
                interessado
            );


        const foto =
            perfilArtista?.foto_url ||
            "";



        /* =================================================
           AVATAR
           ================================================= */

        const avatarHtml =
            foto
                ? `
                    <div class="oi-artista-avatar oi-artista-avatar-foto">
                        <img
                            src="${escaparHtml(foto)}"
                            alt="Foto de ${escaparHtml(nome)}"
                        >
                    </div>
                `
                : `
                    <div class="oi-artista-avatar">
                        <span>
                            ${escaparHtml(obterInicial(nome))}
                        </span>
                    </div>
                `;



        /* =================================================
           STATUS
           ================================================= */

        let classeStatus =
            "oi-status-interessado";


        if (status === "selecionado") {

            classeStatus =
                "oi-status-selecionado";

        }


        const statusTexto =
            obterTextoStatus(
                status
            );



        /* =================================================
           TAGS
           ================================================= */

        const tagsHtml =
            tags.length
                ? `
                    <div class="oi-artista-tags">
                        ${tags.map(tag => `
                            <span class="oi-artista-tag">
                                ${escaparHtml(tag)}
                            </span>
                        `).join("")}
                    </div>
                `
                : "";



        /* =================================================
           MENSAGEM
           ================================================= */

        const mensagemHtml =
            mensagem
                ? `
                    <p class="oi-artista-mensagem">
                        ${escaparHtml(mensagem)}
                    </p>
                `
                : "";



        /* =================================================
           PERFIL
           ================================================= */

        const perfilId =
            perfil?.id ||
            "";


        const urlPerfil =
            perfilId
                ? `apresentar-perfil.html?id=${encodeURIComponent(perfilId)}`
                : "#";



        /* =================================================
           AÇÃO DE SELEÇÃO
           ================================================= */

        let acaoSelecao =
            "";


        if (status === "interessado") {

            acaoSelecao = `
                <button
                    type="button"
                    class="oi-btn oi-btn-primary btn-selecionar-artista"
                    data-interessado-id="${escaparHtml(interessado.id)}"
                >
                    Selecionar artista
                </button>
            `;

        }


        if (status === "selecionado") {

            acaoSelecao = `
                <button
                    type="button"
                    class="oi-btn oi-btn-primary oi-btn-selecionado"
                    disabled
                >
                    Selecionado
                </button>
            `;

        }



        /* =================================================
           CARD
           ================================================= */

        return `
            <article
                class="oi-artista-card ${status === "selecionado" ? "oi-artista-selecionado" : ""}"
                data-interessado-id="${escaparHtml(interessado.id)}"
                data-status="${escaparHtml(status)}"
            >

                <div class="oi-artista-avatar-wrapper">

                    ${avatarHtml}

                </div>


                <div class="oi-artista-info">

                    <strong>
                        ${escaparHtml(nome)}
                    </strong>


                    <span>
                        ${escaparHtml(tipo)}
                    </span>


                    <small>
                        ${escaparHtml(localizacao)}
                    </small>


                    ${tagsHtml}


                    ${mensagemHtml}

                </div>


                <div class="oi-artista-status">

                    <span
                        class="oi-status ${classeStatus}"
                    >
                        ${escaparHtml(statusTexto)}
                    </span>

                </div>


                <div class="oi-artista-acoes">

                    <a
                        href="${escaparHtml(urlPerfil)}"
                        class="oi-btn oi-btn-secondary"
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


        if (!lista) {

            return;

        }


        const estadoSemInteressados =
            elemento("estadoSemInteressados");


        const estadoFiltroVazio =
            elemento("estadoFiltroVazio");


        const interessados =
            estadoAtual?.interessados ||
            [];


        const filtrados =
            aplicarFiltro(
                interessados
            );


        renderizarContadores(
            interessados
        );



        /* =================================================
           NENHUM INTERESSADO
           ================================================= */

        if (!interessados.length) {

            lista.innerHTML =
                "";


            if (estadoSemInteressados) {

                estadoSemInteressados.hidden =
                    false;

            }


            if (estadoFiltroVazio) {

                estadoFiltroVazio.hidden =
                    true;

            }


            return;

        }



        /* =================================================
           FILTRO SEM RESULTADO
           ================================================= */

        if (!filtrados.length) {

            lista.innerHTML =
                "";


            if (estadoSemInteressados) {

                estadoSemInteressados.hidden =
                    true;

            }


            if (estadoFiltroVazio) {

                estadoFiltroVazio.hidden =
                    false;

            }


            return;

        }



        /* =================================================
           COM RESULTADOS
           ================================================= */

        if (estadoSemInteressados) {

            estadoSemInteressados.hidden =
                true;

        }


        if (estadoFiltroVazio) {

            estadoFiltroVazio.hidden =
                true;

        }


        lista.innerHTML =
            filtrados
                .map(
                    interessado =>
                        renderizarCard(
                            interessado,
                            estadoAtual?.oportunidade
                        )
                )
                .join("");

    }



    /* =====================================================
       ATUALIZAR FILTRO VISUAL
       ===================================================== */

    function atualizarFiltroVisual() {

        document
            .querySelectorAll(".oi-filtro")
            .forEach(botao => {

                const ativo =
                    botao.id ===
                    obterIdFiltroAtivo();


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
       OBTER ID DO FILTRO ATIVO
       ===================================================== */

    function obterIdFiltroAtivo() {

        const ids = {

            todos:
                "filtroTodos",

            interessados:
                "filtroInteressados",

            selecionado:
                "filtroSelecionado"

        };


        return ids[filtroAtual] ||
            "filtroTodos";

    }



    /* =====================================================
       DEFINIR FILTRO
       ===================================================== */

    function definirFiltro(
        filtro
    ) {

        const filtrosPermitidos = [
            "todos",
            "interessados",
            "selecionado"
        ];


        filtroAtual =
            filtrosPermitidos.includes(filtro)
                ? filtro
                : "todos";


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


        filtroAtual =
            "todos";


        atualizarFiltroVisual();

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
                    String(interessadoAtualizado?.id)
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
       MODAL — ABRIR
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


        const nomeElemento =
            elemento("modalArtistaNome");


        if (nomeElemento) {

            nomeElemento.textContent =
                nome;

        }


        const tipoElemento =
            elemento("modalArtistaTipo");


        if (tipoElemento) {

            tipoElemento.textContent =
                tipo;

        }


        modal.dataset.interessadoId =
            interessado.id;


        modal.hidden =
            false;

    }



    /* =====================================================
       MODAL — FECHAR
       ===================================================== */

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



    /* =====================================================
       OBTER INTERESSADO DO MODAL
       ===================================================== */

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
       RENDERIZAR TUDO
       ===================================================== */

    function renderizarTudo(
        estado
    ) {

        definirEstado(
            estado
        );


        renderizarOportunidade(
            estado?.oportunidade,
            estado?.estabelecimento
        );


        renderizarLista();


        mostrarEstado(
            "conteudo"
        );

    }



    /* =====================================================
       EXPORTAÇÃO
       ===================================================== */

    return {

        mostrarEstado,

        mostrarErro,

        renderizarOportunidade,

        renderizarLista,

        renderizarContadores,

        definirEstado,

        definirFiltro,

        atualizarInteressado,

        abrirModalSelecao,

        fecharModalSelecao,

        obterInteressadoDoModal,

        renderizarTudo

    };

})();

