(function (window) {

    "use strict";


    /* =========================================================
       MUSICALWORLD — APRESENTAÇÃO DE PERFIL
       RENDERIZAÇÃO

       Arquivo:
       js/apresentar-perfil-teste/ApresentarPerfilRender.js

       Responsabilidades:

       - Receber os dados carregados pelo módulo de dados.
       - Identificar nome, tipo e localização.
       - Renderizar avatar e iniciais.
       - Renderizar identidade na nova topbar.
       - Permitir acesso ao perfil público da pessoa através
         da foto, das iniciais ou do nome exibido na topbar.
       - Identificar perfis de artistas e estabelecimentos.
       - Renderizar informações específicas de estabelecimentos.
       - Renderizar localização completa de estabelecimentos.
       - Renderizar contatos de estabelecimentos.
       - Renderizar agenda e eventos públicos do perfil.
       - Renderizar atração contratada em eventos vinculados
         a uma contratação confirmada.
       - Manter funções de avaliação, gêneros, descrição e
         informações profissionais disponíveis para uso futuro.
       - Atualizar somente a interface do perfil.

       IMPORTANTE:

       A região imediatamente abaixo da mídia do portfólio
       NÃO é mais utilizada para exibir:

       - tipo de artista;
       - avaliação;
       - quantidade de avaliações;
       - gêneros/estilos;
       - biografia;
       - experiência;
       - área de atuação;
       - disponibilidade.

       Essa região agora é controlada pelo:

       js/apresentar-perfil-teste/ApresentarPerfilPortfolio.js

       que exibe somente:

       - título do item atual do portfólio;
       - descrição do item atual do portfólio.

       A Agenda/Eventos é uma seção independente da área
       do portfólio.

       Este arquivo NÃO é responsável por:

       - Consultar o Supabase.
       - Buscar portfólio.
       - Buscar serviços.
       - Controlar contratação.
       - Controlar curtidas, comentários ou compartilhamentos.

       O acesso aos dados é responsabilidade de:
       ApresentarPerfilDadosTeste.js
       ========================================================= */


    /* =========================================================
       UTILITÁRIOS
       ========================================================= */

    function valorValido(valor) {

        return (
            valor !== null &&
            valor !== undefined &&
            String(valor).trim() !== ""
        );

    }


    function texto(valor, fallback) {

        if (valorValido(valor)) {

            return String(valor).trim();

        }

        return fallback || "";

    }


    function numero(valor, fallback) {

        const resultado = Number(valor);

        if (Number.isFinite(resultado)) {

            return resultado;

        }

        return fallback || 0;

    }


    function arraySeguro(valor) {

        if (Array.isArray(valor)) {

            return valor

                .map(function (item) {

                    return String(item).trim();

                })

                .filter(Boolean);

        }


        if (!valorValido(valor)) {

            return [];

        }


        /*
         * PostgreSQL pode retornar arrays no formato:
         *
         * {Sertanejo,MPB,Pop}
         */

        if (
            typeof valor === "string" &&
            valor.startsWith("{") &&
            valor.endsWith("}")
        ) {

            return valor

                .slice(1, -1)

                .split(",")

                .map(function (item) {

                    return item

                        .replace(/^"(.*)"$/, "$1")

                        .trim();

                })

                .filter(Boolean);

        }


        /*
         * Também aceitamos JSON:
         *
         * ["Sertanejo","MPB","Pop"]
         */

        if (
            typeof valor === "string" &&
            valor.trim().startsWith("[")
        ) {

            try {

                const convertido =
                    JSON.parse(valor);


                if (Array.isArray(convertido)) {

                    return convertido

                        .map(function (item) {

                            return String(item).trim();

                        })

                        .filter(Boolean);

                }

            } catch (erro) {

                /*
                 * Se não for JSON válido,
                 * continuamos para o formato separado
                 * por vírgulas.
                 */

            }

        }


        /*
         * Formato simples:
         *
         * Sertanejo, MPB, Pop
         */

        if (typeof valor === "string") {

            return valor

                .split(",")

                .map(function (item) {

                    return item.trim();

                })

                .filter(Boolean);

        }


        return [];

    }


    function primeiroValor() {

        const valores =
            Array.prototype.slice.call(
                arguments
            );


        for (
            let i = 0;
            i < valores.length;
            i++
        ) {

            if (
                valorValido(
                    valores[i]
                )
            ) {

                return valores[i];

            }

        }


        return null;

    }


    /* =========================================================
       OBTENÇÃO DOS DADOS
       ========================================================= */

    function obterDados() {

        if (
            window.ApresentarPerfilDadosTeste &&
            typeof window
                .ApresentarPerfilDadosTeste
                .obterDados === "function"
        ) {

            try {

                return window
                    .ApresentarPerfilDadosTeste
                    .obterDados() || {};

            } catch (erro) {

                console.error(
                    "ApresentarPerfilRenderTeste: erro ao obter dados:",
                    erro
                );

            }

        }


        return {};

    }


    function obterUsuario() {

        const dados =
            obterDados();


        return dados.usuario || {};

    }


    function obterPerfil() {

        const dados =
            obterDados();


        return dados.perfil || {};

    }


    function obterPerfilArtista() {

        const dados =
            obterDados();


        return dados.perfilArtista || {};

    }


    /* =========================================================
       PERFIL DO ESTABELECIMENTO
       ========================================================= */

    function obterPerfilEstabelecimento() {

        const dados =
            obterDados();


        return dados.perfilEstabelecimento || {};

    }


    /* =========================================================
       IDENTIFICAÇÃO DO TIPO DE PERFIL
       ========================================================= */

    function perfilEhEstabelecimento() {

        const estabelecimento =
            obterPerfilEstabelecimento();


        return (
            !!estabelecimento &&
            valorValido(
                estabelecimento.perfil_id
            )
        );

    }


    function obterTipoPerfil() {

        const dados =
            obterDados();


        return dados.tipoPerfil || {};

    }


    /* =========================================================
       AVALIAÇÕES
       ========================================================= */

    function obterAvaliacoes() {

        const dados =
            obterDados();


        return Array.isArray(
            dados.avaliacoes
        )
            ? dados.avaliacoes
            : [];

    }


    /* =========================================================
       AGENDA / EVENTOS
       ========================================================= */

    function obterAgenda() {

        const dados =
            obterDados();


        return Array.isArray(
            dados.agenda
        )
            ? dados.agenda
            : [];

    }


    /* =========================================================
       NORMALIZAÇÃO DE DATA DA AGENDA
       ========================================================= */

    function obterDataAgenda(valor) {

        if (!valorValido(valor)) {

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


        return data;

    }


    /* =========================================================
       VERIFICAR SE O EVENTO AINDA É PÚBLICO

       Regras:

       - Evento futuro: exibir.
       - Evento acontecendo agora: exibir.
       - Evento encerrado: esconder.

       Quando data_fim não existir, usamos data_inicio
       como referência para eventos futuros.
       ========================================================= */

    function eventoAindaRelevante(evento, agora) {

        const inicio =
            obterDataAgenda(
                evento.data_inicio
            );


        const fim =
            obterDataAgenda(
                evento.data_fim
            );


        if (!inicio) {

            return false;

        }


        /*
         * Evento ainda não começou.
         */

        if (
            inicio.getTime() >=
            agora.getTime()
        ) {

            return true;

        }


        /*
         * Evento já começou, mas ainda está
         * acontecendo.
         */

        if (
            fim &&
            fim.getTime() >=
            agora.getTime()
        ) {

            return true;

        }


        /*
         * Evento já terminou.
         */

        return false;

    }


    /* =========================================================
       FILTRAR E ORDENAR AGENDA
       ========================================================= */

    function obterEventosPublicos() {

        const agenda =
            obterAgenda();


        if (!agenda.length) {

            return [];

        }


        const agora =
            new Date();


        return agenda

            .filter(function (evento) {

                if (!evento) {

                    return false;

                }


                /*
                 * A consulta de dados já restringe os status
                 * para agendado e confirmado.
                 *
                 * Mantemos a verificação aqui também para
                 * proteger a camada de renderização.
                 */

                const status =
                    texto(
                        evento.status
                    ).toLowerCase();


                if (
                    status !== "agendado" &&
                    status !== "confirmado"
                ) {

                    return false;

                }


                return eventoAindaRelevante(
                    evento,
                    agora
                );

            })

            .sort(function (a, b) {

                const dataA =
                    obterDataAgenda(
                        a.data_inicio
                    );

                const dataB =
                    obterDataAgenda(
                        b.data_inicio
                    );


                if (!dataA && !dataB) {

                    return 0;

                }


                if (!dataA) {

                    return 1;

                }


                if (!dataB) {

                    return -1;

                }


                return (
                    dataA.getTime() -
                    dataB.getTime()
                );

            });

    }


    /* =========================================================
       IDENTIFICAR ATRAÇÃO DA CONTRATAÇÃO

       Quando o evento foi criado a partir de uma contratação,
       tentamos localizar os dados do artista em diferentes
       estruturas possíveis entregues pelo módulo de dados.

       Isso permite que a camada de renderização permaneça
       independente da forma exata como a contratação foi
       anexada ao objeto da agenda.
       ========================================================= */

    function obterAtracaoEvento(evento) {

        if (!evento) {

            return null;

        }


        /*
         * Estruturas diretas no evento.
         */

        const candidatos = [

            evento.artista,

            evento.perfilArtista,

            evento.perfil_artista,

            evento.artista_perfil,

            evento.contratado,

            evento.profissional,

            evento.usuario_artista,

            evento.usuarioArtista,

            evento.contratacao &&
                evento.contratacao.artista,

            evento.contratacao &&
                evento.contratacao.perfilArtista,

            evento.contratacao &&
                evento.contratacao.perfil_artista,

            evento.contratacao &&
                evento.contratacao.contratado,

            evento.contratacao &&
                evento.contratacao.profissional,

            evento.contratacao &&
                evento.contratacao.usuario_artista,

            evento.contratacao &&
                evento.contratacao.usuarioArtista

        ];


        for (
            let i = 0;
            i < candidatos.length;
            i++
        ) {

            const candidato =
                candidatos[i];


            if (
                candidato &&
                typeof candidato === "object"
            ) {

                return candidato;

            }

        }


        /*
         * Alguns retornos podem trazer os dados
         * diretamente dentro da contratação.
         */

        if (
            evento.contratacao &&
            typeof evento.contratacao === "object"
        ) {

            const contratacao =
                evento.contratacao;


            if (
                valorValido(
                    primeiroValor(
                        contratacao.nome_artista,
                        contratacao.nome_artistico,
                        contratacao.nome_contratado,
                        contratacao.artista_nome,
                        contratacao.profissional_nome
                    )
                ) ||
                valorValido(
                    primeiroValor(
                        contratacao.foto_url,
                        contratacao.artista_foto_url,
                        contratacao.foto_artista
                    )
                )
            ) {

                return contratacao;

            }

        }


        /*
         * Caso não exista um objeto aninhado, tentamos
         * montar uma atração usando os campos diretos
         * do evento.
         */

        const nomeDireto =
            primeiroValor(

                evento.nome_artista,

                evento.nome_artistico,

                evento.nome_contratado,

                evento.artista_nome,

                evento.profissional_nome,

                evento.nome_profissional

            );


        const fotoDireta =
            primeiroValor(

                evento.foto_url,

                evento.foto_artista_url,

                evento.artista_foto_url,

                evento.foto_artista,

                evento.profissional_foto_url

            );


        if (
            valorValido(nomeDireto) ||
            valorValido(fotoDireta)
        ) {

            return {

                nome:
                    nomeDireto,

                foto_url:
                    fotoDireta,

                tipo_artista:
                    primeiroValor(
                        evento.tipo_artista,
                        evento.artista_tipo
                    ),

                estilos:
                    primeiroValor(
                        evento.estilos,
                        evento.estilos_musicais,
                        evento.artista_estilos
                    ),

                instrumentos:
                    primeiroValor(
                        evento.instrumentos,
                        evento.artista_instrumentos
                    )

            };

        }


        return null;

    }


    /* =========================================================
       VERIFICAR SE O EVENTO É UMA CONTRATAÇÃO
       ========================================================= */

    function eventoEhContratacao(evento) {

        if (!evento) {

            return false;

        }


        return valorValido(
            primeiroValor(

                evento.contratacao_id,

                evento.contratacaoId,

                evento.id_contratacao,

                evento.contratacao &&
                    evento.contratacao.id

            )
        );

    }


    /* =========================================================
       NOME DA ATRAÇÃO
       ========================================================= */

    function obterNomeAtracaoEvento(evento) {

        const atracao =
            obterAtracaoEvento(
                evento
            );


        if (!atracao) {

            return "";

        }


        return texto(

            primeiroValor(

                atracao.nome_exibicao,

                atracao.nome_artistico,

                atracao.nome_artista,

                atracao.nome_publico,

                atracao.nome,

                atracao.nome_completo,

                atracao.usuario_nome,

                atracao.artista_nome,

                atracao.nome_contratado,

                atracao.profissional_nome

            )

        );

    }


    /* =========================================================
       FOTO DA ATRAÇÃO
       ========================================================= */

    function obterFotoAtracaoEvento(evento) {

        const atracao =
            obterAtracaoEvento(
                evento
            );


        if (!atracao) {

            return "";

        }


        return texto(

            primeiroValor(

                atracao.foto_url,

                atracao.avatar_url,

                atracao.foto,

                atracao.imagem_url,

                atracao.foto_artista_url,

                atracao.artista_foto_url,

                atracao.usuario_foto_url,

                atracao.profissional_foto_url

            )

        );

    }


    /* =========================================================
       TIPO DA ATRAÇÃO
       ========================================================= */

    function obterTipoAtracaoEvento(evento) {

        const atracao =
            obterAtracaoEvento(
                evento
            );


        if (!atracao) {

            return "";

        }


        return texto(

            primeiroValor(

                atracao.tipo_artista,

                atracao.tipo_perfil,

                atracao.tipo_perfil_nome,

                atracao.categoria,

                atracao.tipo

            )

        );

    }


    /* =========================================================
       INFORMAÇÕES COMPLEMENTARES DA ATRAÇÃO
       ========================================================= */

    function obterInformacoesAtracaoEvento(evento) {

        const atracao =
            obterAtracaoEvento(
                evento
            );


        if (!atracao) {

            return [];

        }


        const informacoes = [];


        const tipo =
            obterTipoAtracaoEvento(
                evento
            );


        if (valorValido(tipo)) {

            informacoes.push(
                formatarNomeTipo(tipo)
            );

        }


        const estilos =
            arraySeguro(

                primeiroValor(

                    atracao.estilos,

                    atracao.generos,

                    atracao.estilos_musicais,

                    atracao.generos_musicais

                )

            );


        if (estilos.length) {

            informacoes.push(
                estilos.join(", ")
            );

        }


        const instrumentos =
            arraySeguro(

                primeiroValor(

                    atracao.instrumentos,

                    atracao.instrumento

                )

            );


        if (instrumentos.length) {

            informacoes.push(
                instrumentos.join(", ")
            );

        }


        return informacoes;

    }


    /* =========================================================
       FORMATAR TIPO DO EVENTO
       ========================================================= */

    function formatarTipoAgenda(valor) {

        const tipo =
            texto(
                valor
            ).toLowerCase();


        if (tipo === "show") {

            return "Show";

        }


        if (tipo === "evento") {

            return "Evento";

        }


        if (!valorValido(tipo)) {

            return "Evento";

        }


        return formatarNomeTipo(
            tipo
        );

    }


    /* =========================================================
       FORMATAR STATUS DO EVENTO
       ========================================================= */

    function formatarStatusAgenda(valor) {

        const status =
            texto(
                valor
            ).toLowerCase();


        if (status === "confirmado") {

            return "Confirmado";

        }


        if (status === "agendado") {

            return "Agendado";

        }


        if (!valorValido(status)) {

            return "";

        }


        return formatarNomeTipo(
            status
        );

    }


    /* =========================================================
       CLASSE DO STATUS
       ========================================================= */

    function obterClasseStatusAgenda(valor) {

        const status =
            texto(
                valor
            ).toLowerCase();


        if (status === "confirmado") {

            return "agenda-status agenda-status--confirmado";

        }


        return "agenda-status agenda-status--agendado";

    }


    /* =========================================================
       FORMATAR DATA COMPLETA DO EVENTO
       ========================================================= */

    function formatarDataAgenda(valor) {

        const data =
            obterDataAgenda(
                valor
            );


        if (!data) {

            return "";

        }


        try {

            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            ).format(data);

        } catch (erro) {

            return data.toLocaleDateString(
                "pt-BR"
            );

        }

    }


    /* =========================================================
       FORMATAR NÚMERO DO DIA

       Usado na coluna visual da agenda.
       ========================================================= */

    function formatarNumeroDiaAgenda(valor) {

        const data =
            obterDataAgenda(
                valor
            );


        if (!data) {

            return "";

        }


        try {

            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    day: "2-digit"
                }
            ).format(data);

        } catch (erro) {

            return String(
                data.getDate()
            ).padStart(
                2,
                "0"
            );

        }

    }


    /* =========================================================
       FORMATAR MÊS DA AGENDA
       ========================================================= */

    function formatarMesAgenda(valor) {

        const data =
            obterDataAgenda(
                valor
            );


        if (!data) {

            return "";

        }


        try {

            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    month: "short"
                }
            )
                .format(data)
                .replace(".", "")
                .toUpperCase();

        } catch (erro) {

            return "";

        }

    }


    /* =========================================================
       FORMATAR DIA DA SEMANA DA AGENDA
       ========================================================= */

    function formatarDiaSemanaAgenda(valor) {

        const data =
            obterDataAgenda(
                valor
            );


        if (!data) {

            return "";

        }


        try {

            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    weekday: "short"
                }
            )
                .format(data)
                .replace(".", "");

        } catch (erro) {

            return "";

        }

    }


    /* =========================================================
       FORMATAR HORÁRIO DO EVENTO
       ========================================================= */

    function formatarHorarioAgenda(
        inicioValor,
        fimValor
    ) {

        const inicio =
            obterDataAgenda(
                inicioValor
            );


        const fim =
            obterDataAgenda(
                fimValor
            );


        if (!inicio) {

            return "";

        }


        const opcoesHorario = {

            hour: "2-digit",

            minute: "2-digit"

        };


        try {

            const horarioInicio =
                new Intl.DateTimeFormat(
                    "pt-BR",
                    opcoesHorario
                ).format(inicio);


            if (!fim) {

                return horarioInicio;

            }


            const horarioFim =
                new Intl.DateTimeFormat(
                    "pt-BR",
                    opcoesHorario
                ).format(fim);


            return (
                `${horarioInicio} às ${horarioFim}`
            );

        } catch (erro) {

            return "";

        }

    }


    /* =========================================================
       CRIAR ÍCONE SVG DA AGENDA
       ========================================================= */

    function criarIconeAgenda(
        tipo
    ) {

        const svg =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );


        svg.setAttribute(
            "viewBox",
            "0 0 24 24"
        );


        svg.setAttribute(
            "fill",
            "none"
        );


        svg.setAttribute(
            "stroke",
            "currentColor"
        );


        svg.setAttribute(
            "stroke-width",
            "2"
        );


        svg.setAttribute(
            "stroke-linecap",
            "round"
        );


        svg.setAttribute(
            "stroke-linejoin",
            "round"
        );


        svg.setAttribute(
            "aria-hidden",
            "true"
        );


        if (tipo === "localizacao") {

            const path =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );


            path.setAttribute(
                "d",
                "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
            );


            svg.appendChild(
                path
            );


            const circle =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );


            circle.setAttribute(
                "cx",
                "12"
            );


            circle.setAttribute(
                "cy",
                "10"
            );


            circle.setAttribute(
                "r",
                "2.5"
            );


            svg.appendChild(
                circle
            );


            return svg;

        }


        if (tipo === "horario") {

            const circle =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "circle"
                );


            circle.setAttribute(
                "cx",
                "12"
            );


            circle.setAttribute(
                "cy",
                "12"
            );


            circle.setAttribute(
                "r",
                "9"
            );


            svg.appendChild(
                circle
            );


            const path =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );


            path.setAttribute(
                "d",
                "M12 7v5l3 2"
            );


            svg.appendChild(
                path
            );


            return svg;

        }


        /*
         * Ícone padrão de calendário.
         */

        const rect =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "rect"
            );


        rect.setAttribute(
            "x",
            "3"
        );


        rect.setAttribute(
            "y",
            "4"
        );


        rect.setAttribute(
            "width",
            "18"
        );


        rect.setAttribute(
            "height",
            "18"
        );


        rect.setAttribute(
            "rx",
            "2"
        );


        svg.appendChild(
            rect
        );


        const linha =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


        linha.setAttribute(
            "x1",
            "3"
        );


        linha.setAttribute(
            "y1",
            "10"
        );


        linha.setAttribute(
            "x2",
            "21"
        );


        linha.setAttribute(
            "y2",
            "10"
        );


        svg.appendChild(
            linha
        );


        return svg;

    }


    /* =========================================================
       CRIAR COLUNA VISUAL DA DATA

       Estrutura:

       .agenda-item-date

       ├── .agenda-date-day
       │      número grande
       │
       ├── .agenda-date-month
       │      mês
       │
       └── .agenda-date-weekday
              dia da semana

       Essa coluna ficará à esquerda do conteúdo
       principal do evento.
       ========================================================= */

    function criarBlocoDataAgenda(
        valor
    ) {

        const data =
            obterDataAgenda(
                valor
            );


        if (!data) {

            return null;

        }


        const bloco =
            document.createElement(
                "div"
            );


        bloco.className =
            "agenda-item-date";


        bloco.setAttribute(
            "aria-label",
            formatarDataAgenda(
                valor
            )
        );


        const numeroDia =
            document.createElement(
                "span"
            );


        numeroDia.className =
            "agenda-date-day";


        numeroDia.textContent =
            formatarNumeroDiaAgenda(
                valor
            );


        bloco.appendChild(
            numeroDia
        );


        const mes =
            document.createElement(
                "span"
            );


        mes.className =
            "agenda-date-month";


        mes.textContent =
            formatarMesAgenda(
                valor
            );


        bloco.appendChild(
            mes
        );


        const diaSemana =
            document.createElement(
                "span"
            );


        diaSemana.className =
            "agenda-date-weekday";


        diaSemana.textContent =
            formatarDiaSemanaAgenda(
                valor
            );


        bloco.appendChild(
            diaSemana
        );


        return bloco;

    }


    /* =========================================================
       CRIAR FOTO DA ATRAÇÃO
       ========================================================= */

    function criarFotoAtracaoEvento(
        evento,
        nome
    ) {

        const foto =
            obterFotoAtracaoEvento(
                evento
            );


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "agenda-attraction-photo";


        const iniciais =
            document.createElement(
                "span"
            );


        iniciais.className =
            "agenda-attraction-initials";


        iniciais.textContent =
            obterIniciais(
                nome || "A"
            );


        wrapper.appendChild(
            iniciais
        );


        if (!valorValido(foto)) {

            return wrapper;

        }


        const imagem =
            document.createElement(
                "img"
            );


        imagem.className =
            "agenda-attraction-image";


        imagem.alt =
            `Foto de ${nome || "atração"}`;


        imagem.loading =
            "lazy";


        imagem.src =
            foto;


        imagem.onerror =
            function () {

                imagem.remove();

                iniciais.style.display =
                    "flex";

            };


        iniciais.style.display =
            "none";


        wrapper.appendChild(
            imagem
        );


        return wrapper;

    }


    /* =========================================================
       CRIAR BLOCO DA ATRAÇÃO CONFIRMADA

       Estrutura:

       Atração confirmada

       [foto] Nome do artista
              Tipo / estilos / instrumentos

       Esse bloco somente é utilizado quando o evento
       possui vínculo com uma contratação.
       ========================================================= */

    function criarBlocoAtracaoConfirmada(
        evento
    ) {

        if (
            !eventoEhContratacao(
                evento
            )
        ) {

            return null;

        }


        const nome =
            obterNomeAtracaoEvento(
                evento
            );


        /*
         * Se a contratação existe, mas o módulo de dados
         * ainda não entregou os dados da atração, não
         * inventamos um nome.
         *
         * O evento continuará podendo ser exibido pelo
         * título original como fallback.
         */

        if (!valorValido(nome)) {

            return null;

        }


        const bloco =
            document.createElement(
                "div"
            );


        bloco.className =
            "agenda-attraction";


        const rotulo =
            document.createElement(
                "span"
            );


        rotulo.className =
            "agenda-attraction-label";


        rotulo.textContent =
            "Atração confirmada";


        bloco.appendChild(
            rotulo
        );


        const linha =
            document.createElement(
                "div"
            );


        linha.className =
            "agenda-attraction-main";


        linha.appendChild(
            criarFotoAtracaoEvento(
                evento,
                nome
            )
        );


        const informacoes =
            document.createElement(
                "div"
            );


        informacoes.className =
            "agenda-attraction-info";


        const nomeElemento =
            document.createElement(
                "strong"
            );


        nomeElemento.className =
            "agenda-attraction-name";


        nomeElemento.textContent =
            nome;


        informacoes.appendChild(
            nomeElemento
        );


        const complementos =
            obterInformacoesAtracaoEvento(
                evento
            );


        if (complementos.length) {

            const detalhes =
                document.createElement(
                    "span"
                );


            detalhes.className =
                "agenda-attraction-details";


            detalhes.textContent =
                complementos.join(" · ");


            informacoes.appendChild(
                detalhes
            );

        }


        linha.appendChild(
            informacoes
        );


        bloco.appendChild(
            linha
        );


        return bloco;

    }


    /* =========================================================
       RENDERIZAR AGENDA / EVENTOS
       ========================================================= */

    function renderizarAgenda() {

        const secao =
            obterElemento(
                "profileAgenda"
            );


        const lista =
            obterElemento(
                "agendaList"
            );


        if (!secao || !lista) {

            return;

        }


        /*
         * Limpa o conteúdo anterior para impedir
         * duplicação caso renderizarAgenda() seja chamada
         * novamente.
         */

        lista.innerHTML =
            "";


        const eventos =
            obterEventosPublicos();


            console.log(
    "MusicalWorld — EVENTOS DA AGENDA:",
    eventos
);

eventos.forEach(function (evento, indice) {

    console.log(
        `MusicalWorld — EVENTO ${indice + 1}:`,
        {
            id: evento.id,
            titulo: evento.titulo,
            contratacao_id: evento.contratacao_id,
            contratacao: evento.contratacao,
            artista: evento.artista,
            nomeAtracao: obterNomeAtracaoEvento(evento),
            ehContratacao: eventoEhContratacao(evento)
        }
    );

});

        /*
         * Caso não existam eventos futuros ou em andamento,
         * a seção inteira permanece escondida.
         */

        if (!eventos.length) {

            secao.hidden =
                true;

            return;

        }


        eventos.forEach(
            function (evento) {

                const item =
                    document.createElement(
                        "article"
                    );


                item.className =
                    "agenda-item";


                /*
                 * =================================================
                 * ESTRUTURA PRINCIPAL DO CARD
                 *
                 * A data fica à esquerda.
                 *
                 * O conteúdo do evento fica à direita.
                 * =================================================
                 */

                const blocoData =
                    criarBlocoDataAgenda(
                        evento.data_inicio
                    );


                const conteudo =
                    document.createElement(
                        "div"
                    );


                conteudo.className =
                    "agenda-item-content";


                /*
                 * =================================================
                 * CABEÇALHO DO EVENTO
                 * =================================================
                 */

                const cabecalho =
                    document.createElement(
                        "div"
                    );


                cabecalho.className =
                    "agenda-item-header";


                const tipo =
                    document.createElement(
                        "span"
                    );


                tipo.className =
                    "agenda-item-type";


                tipo.textContent =
                    formatarTipoAgenda(
                        evento.tipo
                    );


                const status =
                    document.createElement(
                        "span"
                    );


                status.className =
                    obterClasseStatusAgenda(
                        evento.status
                    );


                status.textContent =
                    formatarStatusAgenda(
                        evento.status
                    );


                cabecalho.appendChild(
                    tipo
                );


                if (
                    valorValido(
                        evento.status
                    )
                ) {

                    cabecalho.appendChild(
                        status
                    );

                }


                conteudo.appendChild(
                    cabecalho
                );


                /*
                 * =================================================
                 * ATRAÇÃO CONFIRMADA
                 *
                 * Quando existe uma contratação vinculada
                 * ao evento, substituímos o título genérico:
                 *
                 * "Compromisso com Fulano"
                 *
                 * pelo bloco:
                 *
                 * Atração confirmada
                 * [foto] Fulano
                 * =================================================
                 */

                const blocoAtracao =
                    criarBlocoAtracaoConfirmada(
                        evento
                    );


                if (blocoAtracao) {

                    conteudo.appendChild(
                        blocoAtracao
                    );

                } else {

                    /*
                     * =================================================
                     * TÍTULO NORMAL
                     *
                     * Mantido para eventos que não são
                     * provenientes de contratação.
                     * =================================================
                     */

                    const titulo =
                        document.createElement(
                            "h3"
                        );


                    titulo.className =
                        "agenda-item-title";


                    titulo.textContent =
                        texto(
                            evento.titulo,
                            "Evento"
                        );


                    conteudo.appendChild(
                        titulo
                    );

                }


                /*
                 * =================================================
                 * DATA E HORÁRIO
                 *
                 * A data completa deixa de ocupar uma linha.
                 *
                 * O número/mês/dia ficam na coluna esquerda.
                 *
                 * Aqui mantemos somente o horário.
                 * =================================================
                 */

                const horario =
                    formatarHorarioAgenda(

                        evento.data_inicio,

                        evento.data_fim

                    );


                if (horario) {

                    const informacoesHorario =
                        document.createElement(
                            "div"
                        );


                    informacoesHorario.className =
                        "agenda-item-datetime";


                    const linhaHorario =
                        document.createElement(
                            "div"
                        );


                    linhaHorario.className =
                        "agenda-item-detail";


                    linhaHorario.appendChild(
                        criarIconeAgenda(
                            "horario"
                        )
                    );


                    const textoHorario =
                        document.createElement(
                            "span"
                        );


                    textoHorario.textContent =
                        horario;


                    linhaHorario.appendChild(
                        textoHorario
                    );


                    informacoesHorario.appendChild(
                        linhaHorario
                    );


                    conteudo.appendChild(
                        informacoesHorario
                    );

                }


                /*
                 * =================================================
                 * LOCALIZAÇÃO
                 * =================================================
                 */

                const localizacao =
                    texto(
                        evento.localizacao
                    );


                if (localizacao) {

                    const linhaLocalizacao =
                        document.createElement(
                            "div"
                        );


                    linhaLocalizacao.className =
                        "agenda-item-detail agenda-item-location";


                    linhaLocalizacao.appendChild(
                        criarIconeAgenda(
                            "localizacao"
                        )
                    );


                    const textoLocalizacao =
                        document.createElement(
                            "span"
                        );


                    textoLocalizacao.textContent =
                        localizacao;


                    linhaLocalizacao.appendChild(
                        textoLocalizacao
                    );


                    conteudo.appendChild(
                        linhaLocalizacao
                    );

                }


                /*
                 * =================================================
                 * DESCRIÇÃO
                 * =================================================
                 */

                const descricao =
                    texto(
                        evento.descricao
                    );


                if (descricao) {

                    const elementoDescricao =
                        document.createElement(
                            "p"
                        );


                    elementoDescricao.className =
                        "agenda-item-description";


                    elementoDescricao.textContent =
                        descricao;


                    conteudo.appendChild(
                        elementoDescricao
                    );

                }


                /*
                 * =================================================
                 * MONTA O CARD
                 *
                 * Data:
                 * esquerda
                 *
                 * Conteúdo:
                 * direita
                 * =================================================
                 */

                if (blocoData) {

                    item.appendChild(
                        blocoData
                    );

                }


                item.appendChild(
                    conteudo
                );


                lista.appendChild(
                    item
                );

            }
        );


        /*
         * Mostra a seção somente depois que todos
         * os eventos foram renderizados.
         */

        secao.hidden =
            false;


        console.log(
            "MusicalWorld — Eventos públicos renderizados:",
            eventos.length
        );

        

    }


    /* =========================================================
       NOME DO PERFIL
       ========================================================= */

    function obterNomePerfil() {

        const usuario =
            obterUsuario();

        const perfil =
            obterPerfil();

        const perfilArtista =
            obterPerfilArtista();


        return texto(

            primeiroValor(

                perfil.nome_exibicao,

                perfil.nome_artistico,

                perfil.nome_artista,

                perfilArtista.nome_artistico,

                perfilArtista.nome_artista,

                perfilArtista.nome_publico,

                usuario.nome,

                usuario.nome_completo

            ),

            perfilEhEstabelecimento()
                ? "Estabelecimento"
                : "Artista"

        );

    }


    /* =========================================================
       FORMATAÇÃO DO NOME DO TIPO
       ========================================================= */

    function formatarNomeTipo(valor) {

        if (!valorValido(valor)) {

            return "";

        }


        const textoTipo =
            String(valor)
                .trim()
                .replace(/_/g, " ");


        return textoTipo
            .split(/\s+/)
            .map(function (palavra) {

                if (!palavra) {

                    return "";

                }


                return (
                    palavra.charAt(0).toUpperCase() +
                    palavra.slice(1).toLowerCase()
                );

            })
            .join(" ");

    }


    /* =========================================================
       TIPO DO PERFIL
       ========================================================= */

    function obterNomeTipo() {

        const tipo =
            obterTipoPerfil();

        const perfil =
            obterPerfil();

        const perfilArtista =
            obterPerfilArtista();

        const estabelecimento =
            obterPerfilEstabelecimento();


        if (perfilEhEstabelecimento()) {

            return texto(

                formatarNomeTipo(

                    primeiroValor(

                        tipo.nome,

                        estabelecimento.tipo_perfil,

                        perfil.tipo_perfil_nome,

                        perfil.tipo_perfil

                    )

                ),

                "Estabelecimento"

            );

        }


        return texto(

            primeiroValor(

                tipo.nome,

                perfilArtista.tipo_artista,

                perfil.tipo_perfil_nome,

                perfil.tipo_perfil

            ),

            "Artista"

        );

    }


    /* =========================================================
       LOCALIZAÇÃO RESUMIDA
       ========================================================= */

    function obterLocalizacao() {

        const perfilArtista =
            obterPerfilArtista();

        const estabelecimento =
            obterPerfilEstabelecimento();


        /*
         * =====================================================
         * ESTABELECIMENTO
         * =====================================================
         */

        if (perfilEhEstabelecimento()) {

            const cidade =
                primeiroValor(
                    estabelecimento.cidade,
                    estabelecimento.municipio
                );


            const uf =
                primeiroValor(
                    estabelecimento.estado,
                    estabelecimento.uf,
                    estabelecimento.estado_sigla
                );


            let cidadeUf =
                null;


            if (
                valorValido(cidade) &&
                valorValido(uf)
            ) {

                cidadeUf =
                    `${cidade} - ${uf}`;

            } else if (
                valorValido(cidade)
            ) {

                cidadeUf =
                    cidade;

            } else if (
                valorValido(uf)
            ) {

                cidadeUf =
                    uf;

            }


            return texto(

                primeiroValor(

                    cidadeUf,

                    estabelecimento.localizacao,

                    estabelecimento.endereco,

                    estabelecimento.bairro

                ),

                "Localização não informada"

            );

        }


        /*
         * =====================================================
         * ARTISTA
         * =====================================================
         */

        const cidade =
            primeiroValor(
                perfilArtista.cidade,
                perfilArtista.municipio
            );


        const uf =
            primeiroValor(
                perfilArtista.uf,
                perfilArtista.estado,
                perfilArtista.estado_sigla
            );


        let cidadeUf =
            null;


        if (
            valorValido(cidade) &&
            valorValido(uf)
        ) {

            cidadeUf =
                `${cidade} - ${uf}`;

        } else if (
            valorValido(cidade)
        ) {

            cidadeUf =
                cidade;

        } else if (
            valorValido(uf)
        ) {

            cidadeUf =
                uf;

        }


        return texto(

            primeiroValor(

                perfilArtista.localizacao,

                cidadeUf

            ),

            "Localização não informada"

        );

    }


    /* =========================================================
       FOTO DO PERFIL
       ========================================================= */

    function obterFotoPerfil() {

        const usuario =
            obterUsuario();

        const perfil =
            obterPerfil();

        const perfilArtista =
            obterPerfilArtista();


        return primeiroValor(

            perfilArtista.foto_url,

            perfilArtista.avatar_url,

            perfilArtista.foto,

            perfilArtista.imagem_url,

            perfil.foto_url,

            perfil.avatar_url,

            perfil.foto,

            perfil.imagem_url,

            usuario.foto_url,

            usuario.avatar_url,

            usuario.foto,

            usuario.imagem_url

        );

    }


    /* =========================================================
       INICIAIS DO NOME
       ========================================================= */

    function obterIniciais(nome) {

        const valor =
            texto(
                nome,
                "A"
            );


        const partes =
            valor

                .split(/\s+/)

                .filter(Boolean);


        if (!partes.length) {

            return "A";

        }


        if (partes.length === 1) {

            return partes[0]

                .substring(0, 2)

                .toUpperCase();

        }


        return (

            partes[0].charAt(0) +

            partes[partes.length - 1]
                .charAt(0)

        ).toUpperCase();

    }


    /* =========================================================
       DESCRIÇÃO
       ========================================================= */

    function obterBiografia() {

        const perfil =
            obterPerfil();

        const perfilArtista =
            obterPerfilArtista();


        if (perfilEhEstabelecimento()) {

            return texto(

                primeiroValor(

                    perfil.descricao,

                    perfil.bio,

                    perfil.biografia

                ),

                "Este estabelecimento ainda não adicionou uma descrição."

            );

        }


        return texto(

            primeiroValor(

                perfil.descricao,

                perfil.bio,

                perfil.biografia,

                perfilArtista.descricao,

                perfilArtista.bio,

                perfilArtista.biografia

            ),

            "Este artista ainda não adicionou uma descrição."

        );

    }


    /* =========================================================
       EXPERIÊNCIA
       ========================================================= */

    function obterExperiencia() {

        const perfilArtista =
            obterPerfilArtista();


        return texto(

            perfilArtista.experiencia,

            "Não informado"

        );

    }


    /* =========================================================
       ÁREA DE ATUAÇÃO
       ========================================================= */

    function obterAreaAtuacao() {

        const perfilArtista =
            obterPerfilArtista();


        return texto(

            primeiroValor(

                perfilArtista.area_atendimento,

                perfilArtista.area_atuacao,

                perfilArtista.areaAtuacao

            ),

            "Não informado"

        );

    }


    /* =========================================================
       DISPONIBILIDADE
       ========================================================= */

    function obterDisponibilidade() {

        const perfilArtista =
            obterPerfilArtista();


        const valor =
            perfilArtista.disponivel;


        if (
            valor === true ||
            valor === "true" ||
            valor === 1 ||
            valor === "1"
        ) {

            return "Disponível";

        }


        if (
            valor === false ||
            valor === "false" ||
            valor === 0 ||
            valor === "0"
        ) {

            return "Indisponível";

        }


        return "Não informado";

    }


    /* =========================================================
       GÊNEROS / ESTILOS
       ========================================================= */

    function obterGeneros() {

        const perfilArtista =
            obterPerfilArtista();

        const estabelecimento =
            obterPerfilEstabelecimento();


        if (perfilEhEstabelecimento()) {

            return arraySeguro(

                primeiroValor(

                    estabelecimento.estilos_musicais,

                    estabelecimento.estilos,

                    estabelecimento.generos_musicais,

                    estabelecimento.generos

                )

            );

        }


        return arraySeguro(

            primeiroValor(

                perfilArtista.estilos,

                perfilArtista.generos,

                perfilArtista.generos_musicais

            )

        );

    }


    /* =========================================================
       INSTRUMENTOS
       ========================================================= */

    function obterInstrumentos() {

        const perfilArtista =
            obterPerfilArtista();


        return arraySeguro(

            primeiroValor(

                perfilArtista.instrumentos,

                perfilArtista.instrumento

            )

        );

    }


    /* =========================================================
       AVALIAÇÃO
       ========================================================= */

    function obterAvaliacao() {

        const perfil =
            obterPerfil();

        const perfilArtista =
            obterPerfilArtista();

        const avaliacoes =
            obterAvaliacoes();


        const mediaDireta =
            primeiroValor(

                perfilArtista.avaliacao_media,

                perfilArtista.nota_media,

                perfilArtista.media_avaliacao,

                perfil.avaliacao_media,

                perfil.nota_media,

                perfil.media_avaliacao

            );


        if (
            valorValido(mediaDireta)
        ) {

            return {

                media:
                    numero(
                        mediaDireta,
                        0
                    ),

                total:
                    avaliacoes.length

            };

        }


        if (!avaliacoes.length) {

            return {

                media: 0,

                total: 0

            };

        }


        const notas =
            avaliacoes

                .map(function (avaliacao) {

                    return numero(

                        primeiroValor(

                            avaliacao.nota,

                            avaliacao.avaliacao,

                            avaliacao.estrelas,

                            avaliacao.nota_avaliacao

                        ),

                        0

                    );

                })

                .filter(function (nota) {

                    return nota > 0;

                });


        if (!notas.length) {

            return {

                media: 0,

                total: 0

            };

        }


        const soma =
            notas.reduce(

                function (total, nota) {

                    return total + nota;

                },

                0

            );


        const media =
            soma / notas.length;


        return {

            media,

            total:
                notas.length

        };

    }


    /* =========================================================
       ELEMENTOS DO DOM
       ========================================================= */

    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =========================================================
       RENDERIZAR NOME
       ========================================================= */

    function renderizarNome() {

        const nome =
            obterNomePerfil();


        const elementos = [

            obterElemento(
                "profileName"
            ),

            obterElemento(
                "profileNameMedia"
            ),

            obterElemento(
                "profileTopbarName"
            )

        ];


        elementos.forEach(
            function (elemento) {

                if (!elemento) {
                    return;
                }


                elemento.textContent =
                    nome;

            }
        );

    }


    /* =========================================================
       RENDERIZAR TIPO
       ========================================================= */

    function renderizarTipo() {

        const tipo =
            obterNomeTipo();


        const elementos = [

            obterElemento(
                "profileType"
            ),

            obterElemento(
                "profileTypeMedia"
            ),

            obterElemento(
                "profileArtistType"
            ),

            obterElemento(
                "profileTopbarType"
            )

        ];


        elementos.forEach(
            function (elemento) {

                if (!elemento) {
                    return;
                }


                elemento.textContent =
                    tipo;

            }
        );

    }


    /* =========================================================
       RENDERIZAR LOCALIZAÇÃO RESUMIDA
       ========================================================= */

    function renderizarLocalizacao() {

        const localizacao =
            obterLocalizacao();


        const elementos = [

            obterElemento(
                "profileLocation"
            ),

            obterElemento(
                "profileLocationMedia"
            ),

            obterElemento(
                "profileTopbarLocation"
            )

        ];


        elementos.forEach(
            function (elemento) {

                if (!elemento) {
                    return;
                }


                if (
                    elemento.id ===
                    "profileTopbarLocation"
                ) {

                    const textoLocalizacao =
                        elemento.querySelector(
                            ".topbar-location-text"
                        );


                    if (textoLocalizacao) {

                        textoLocalizacao.textContent =
                            localizacao;

                    } else {

                        const nosTexto =
                            Array.from(
                                elemento.childNodes
                            ).filter(
                                function (no) {

                                    return (
                                        no.nodeType ===
                                        Node.TEXT_NODE
                                    );

                                }
                            );


                        if (nosTexto.length) {

                            nosTexto[
                                nosTexto.length - 1
                            ].textContent =
                                ` ${localizacao}`;

                        } else {

                            elemento.appendChild(
                                document.createTextNode(
                                    localizacao
                                )
                            );

                        }

                    }

                    return;

                }


                elemento.textContent =
                    localizacao;

            }
        );

    }


    /* =========================================================
       RENDERIZAR AVATAR
       ========================================================= */

    function configurarImagemAvatar(
        imagem,
        iniciais,
        nome,
        foto
    ) {

        if (!imagem) {

            if (iniciais) {

                iniciais.textContent =
                    obterIniciais(nome);

            }

            return;

        }


        if (iniciais) {

            iniciais.textContent =
                obterIniciais(nome);

        }


        if (!valorValido(foto)) {

            imagem.removeAttribute(
                "src"
            );


            imagem.style.display =
                "none";


            if (iniciais) {

                iniciais.style.display =
                    "flex";

            }


            return;

        }


        imagem.alt =
            `Foto de ${nome}`;


        imagem.style.display =
            "block";


        if (iniciais) {

            iniciais.style.display =
                "none";

        }


        imagem.onerror =
            function () {

                imagem.style.display =
                    "none";


                if (iniciais) {

                    iniciais.style.display =
                        "flex";

                }

            };


        imagem.src =
            String(foto);

    }


    function renderizarAvatar() {

        const nome =
            obterNomePerfil();

        const foto =
            obterFotoPerfil();


        configurarImagemAvatar(

            obterElemento(
                "profileAvatar"
            ),

            obterElemento(
                "profileInitials"
            ),

            nome,

            foto

        );


        configurarImagemAvatar(

            obterElemento(
                "profileAvatarMedia"
            ),

            obterElemento(
                "profileInitialsMedia"
            ),

            nome,

            foto

        );


        configurarImagemAvatar(

            obterElemento(
                "profileTopbarAvatar"
            ),

            obterElemento(
                "profileTopbarInitials"
            ),

            nome,

            foto

        );

    }


    /* =========================================================
       RENDERIZAR INFORMAÇÕES DO ESPAÇO
       ========================================================= */

    function renderizarInformacoesEspaco() {

        const secao =
            obterElemento(
                "profileSpaceInfo"
            );


        if (!secao) {

            return;

        }


        if (!perfilEhEstabelecimento()) {

            secao.hidden =
                true;

            return;

        }


        const estabelecimento =
            obterPerfilEstabelecimento();


        const capacidadeItem =
            obterElemento(
                "spaceCapacityItem"
            );

        const capacidade =
            obterElemento(
                "spaceCapacity"
            );

        const musicaAoVivoItem =
            obterElemento(
                "spaceLiveMusicItem"
            );

        const musicaAoVivo =
            obterElemento(
                "spaceLiveMusic"
            );

        const estruturaItem =
            obterElemento(
                "spaceStructureItem"
            );

        const estrutura =
            obterElemento(
                "spaceStructure"
            );

        const estilosItem =
            obterElemento(
                "spaceMusicStylesItem"
            );

        const estilos =
            obterElemento(
                "spaceMusicStyles"
            );


        let possuiInformacao =
            false;


        const capacidadeNumerica =
            numero(
                estabelecimento.capacidade,
                0
            );


        if (
            capacidadeNumerica > 0 &&
            capacidade
        ) {

            capacidade.textContent =
                capacidadeNumerica === 1
                    ? "1 pessoa"
                    : `${capacidadeNumerica} pessoas`;


            if (capacidadeItem) {

                capacidadeItem.hidden =
                    false;

            }


            possuiInformacao =
                true;

        } else if (capacidadeItem) {

            capacidadeItem.hidden =
                true;

        }


        const valorMusicaAoVivo =
            estabelecimento.aceita_musica_ao_vivo;


        const possuiValorMusica =
            valorMusicaAoVivo === true ||
            valorMusicaAoVivo === false ||
            valorMusicaAoVivo === "true" ||
            valorMusicaAoVivo === "false" ||
            valorMusicaAoVivo === 1 ||
            valorMusicaAoVivo === 0 ||
            valorMusicaAoVivo === "1" ||
            valorMusicaAoVivo === "0";


        if (
            possuiValorMusica &&
            musicaAoVivo
        ) {

            const aceita =
                valorMusicaAoVivo === true ||
                valorMusicaAoVivo === "true" ||
                valorMusicaAoVivo === 1 ||
                valorMusicaAoVivo === "1";


            musicaAoVivo.textContent =
                aceita
                    ? "Sim"
                    : "Não";


            if (musicaAoVivoItem) {

                musicaAoVivoItem.hidden =
                    false;

            }


            possuiInformacao =
                true;

        } else if (musicaAoVivoItem) {

            musicaAoVivoItem.hidden =
                true;

        }


        const itensEstrutura =
            arraySeguro(
                estabelecimento.estrutura
            );


        if (
            estrutura &&
            itensEstrutura.length
        ) {

            estrutura.innerHTML =
                "";


            itensEstrutura.forEach(
                function (item) {

                    const tag =
                        document.createElement(
                            "span"
                        );


                    tag.className =
                        "space-info-tag";


                    tag.textContent =
                        item;


                    estrutura.appendChild(
                        tag
                    );

                }
            );


            if (estruturaItem) {

                estruturaItem.hidden =
                    false;

            }


            possuiInformacao =
                true;

        } else {

            if (estrutura) {

                estrutura.innerHTML =
                    "";

            }


            if (estruturaItem) {

                estruturaItem.hidden =
                    true;

            }

        }


        const itensEstilos =
            obterGeneros();


        if (
            estilos &&
            itensEstilos.length
        ) {

            estilos.innerHTML =
                "";


            itensEstilos.forEach(
                function (item) {

                    const tag =
                        document.createElement(
                            "span"
                        );


                    tag.className =
                        "space-info-tag";


                    tag.textContent =
                        item;


                    estilos.appendChild(
                        tag
                    );

                }
            );


            if (estilosItem) {

                estilosItem.hidden =
                    false;

            }


            possuiInformacao =
                true;

        } else {

            if (estilos) {

                estilos.innerHTML =
                    "";

            }


            if (estilosItem) {

                estilosItem.hidden =
                    true;

            }

        }


        secao.hidden =
            !possuiInformacao;

    }


    /* =========================================================
       RENDERIZAR LOCALIZAÇÃO COMPLETA DO ESTABELECIMENTO
       ========================================================= */

    function renderizarLocalizacaoEstabelecimento() {

        const secao =
            obterElemento(
                "profileEstablishmentLocation"
            );


        if (!secao) {

            return;

        }


        if (!perfilEhEstabelecimento()) {

            secao.hidden =
                true;

            return;

        }


        const estabelecimento =
            obterPerfilEstabelecimento();


        const endereco =
            primeiroValor(
                estabelecimento.endereco
            );


        const numeroEndereco =
            primeiroValor(
                estabelecimento.numero
            );


        const bairro =
            primeiroValor(
                estabelecimento.bairro
            );


        const cidade =
            primeiroValor(
                estabelecimento.cidade,
                estabelecimento.municipio
            );


        const estado =
            primeiroValor(
                estabelecimento.estado,
                estabelecimento.uf,
                estabelecimento.estado_sigla
            );


        const cep =
            primeiroValor(
                estabelecimento.cep
            );


        const elementoEndereco =
            obterElemento(
                "establishmentLocationAddress"
            );


        const elementoBairro =
            obterElemento(
                "establishmentLocationNeighborhood"
            );


        const elementoCidade =
            obterElemento(
                "establishmentLocationCity"
            );


        const elementoCep =
            obterElemento(
                "establishmentLocationCep"
            );


        let possuiInformacao =
            false;


        if (
            elementoEndereco &&
            valorValido(endereco)
        ) {

            elementoEndereco.textContent =
                valorValido(numeroEndereco)
                    ? `${endereco}, ${numeroEndereco}`
                    : endereco;


            elementoEndereco.hidden =
                false;


            possuiInformacao =
                true;

        } else if (elementoEndereco) {

            elementoEndereco.textContent =
                "";

            elementoEndereco.hidden =
                true;

        }


        if (
            elementoBairro &&
            valorValido(bairro)
        ) {

            elementoBairro.textContent =
                bairro;


            elementoBairro.hidden =
                false;


            possuiInformacao =
                true;

        } else if (elementoBairro) {

            elementoBairro.textContent =
                "";

            elementoBairro.hidden =
                true;

        }


        if (
            elementoCidade &&
            (
                valorValido(cidade) ||
                valorValido(estado)
            )
        ) {

            if (
                valorValido(cidade) &&
                valorValido(estado)
            ) {

                elementoCidade.textContent =
                    `${cidade} - ${estado}`;

            } else {

                elementoCidade.textContent =
                    primeiroValor(
                        cidade,
                        estado
                    ) || "";

            }


            elementoCidade.hidden =
                false;


            possuiInformacao =
                true;

        } else if (elementoCidade) {

            elementoCidade.textContent =
                "";

            elementoCidade.hidden =
                true;

        }


        if (
            elementoCep &&
            valorValido(cep)
        ) {

            elementoCep.textContent =
                `CEP ${cep}`;


            elementoCep.hidden =
                false;


            possuiInformacao =
                true;

        } else if (elementoCep) {

            elementoCep.textContent =
                "";

            elementoCep.hidden =
                true;

        }


        secao.hidden =
            !possuiInformacao;

    }


    /* =========================================================
       RENDERIZAR CONTATOS DO ESTABELECIMENTO
       ========================================================= */

    function renderizarContatosEstabelecimento() {

        const secao =
            obterElemento(
                "profileEstablishmentContacts"
            );


        if (!secao) {

            return;

        }


        if (!perfilEhEstabelecimento()) {

            secao.hidden =
                true;

            return;

        }


        const estabelecimento =
            obterPerfilEstabelecimento();


        const telefone =
            primeiroValor(
                estabelecimento.telefone_comercial
            );


        const instagram =
            primeiroValor(
                estabelecimento.instagram
            );


        const site =
            primeiroValor(
                estabelecimento.site
            );


        const elementoTelefone =
            obterElemento(
                "establishmentContactPhone"
            );


        const elementoInstagram =
            obterElemento(
                "establishmentContactInstagram"
            );


        const elementoSite =
            obterElemento(
                "establishmentContactSite"
            );


        let possuiContato =
            false;


        if (
            elementoTelefone &&
            valorValido(telefone)
        ) {

            elementoTelefone.href =
                `tel:${String(telefone).trim()}`;


            const textoTelefone =
                elementoTelefone.querySelector(
                    ".establishment-contact-value"
                );


            if (textoTelefone) {

                textoTelefone.textContent =
                    telefone;

            } else {

                elementoTelefone.textContent =
                    telefone;

            }


            elementoTelefone.hidden =
                false;


            possuiContato =
                true;

        } else if (elementoTelefone) {

            elementoTelefone.hidden =
                true;

            elementoTelefone.removeAttribute(
                "href"
            );

        }


        if (
            elementoInstagram &&
            valorValido(instagram)
        ) {

            let usuarioInstagram =
                String(instagram).trim();


            if (
                usuarioInstagram.startsWith(
                    "http://"
                ) ||
                usuarioInstagram.startsWith(
                    "https://"
                )
            ) {

                elementoInstagram.href =
                    usuarioInstagram;

            } else {

                usuarioInstagram =
                    usuarioInstagram.replace(
                        /^@/,
                        ""
                    );


                elementoInstagram.href =
                    `https://www.instagram.com/${encodeURIComponent(
                        usuarioInstagram
                    )}`;

            }


            const textoInstagram =
                elementoInstagram.querySelector(
                    ".establishment-contact-value"
                );


            if (textoInstagram) {

                textoInstagram.textContent =
                    instagram;

            } else {

                elementoInstagram.textContent =
                    instagram;

            }


            elementoInstagram.target =
                "_blank";


            elementoInstagram.rel =
                "noopener noreferrer";


            elementoInstagram.hidden =
                false;


            possuiContato =
                true;

        } else if (elementoInstagram) {

            elementoInstagram.hidden =
                true;

            elementoInstagram.removeAttribute(
                "href"
            );

        }


        if (
            elementoSite &&
            valorValido(site)
        ) {

            let urlSite =
                String(site).trim();


            if (
                !urlSite.startsWith(
                    "http://"
                ) &&
                !urlSite.startsWith(
                    "https://"
                )
            ) {

                urlSite =
                    `https://${urlSite}`;

            }


            elementoSite.href =
                urlSite;


            const textoSite =
                elementoSite.querySelector(
                    ".establishment-contact-value"
                );


            if (textoSite) {

                textoSite.textContent =
                    site;

            } else {

                elementoSite.textContent =
                    site;

            }


            elementoSite.target =
                "_blank";


            elementoSite.rel =
                "noopener noreferrer";


            elementoSite.hidden =
                false;


            possuiContato =
                true;

        } else if (elementoSite) {

            elementoSite.hidden =
                true;

            elementoSite.removeAttribute(
                "href"
            );

        }


        secao.hidden =
            !possuiContato;

    }


    /* =========================================================
       NAVEGAÇÃO PARA O PERFIL
       ========================================================= */

    function configurarNavegacaoPerfil() {

        const dados =
            window.ApresentarPerfilDadosTeste;


        if (
            !dados ||
            typeof dados.obterPerfilId !== "function"
        ) {

            console.warn(
                "ApresentarPerfilRenderTeste: ID do perfil não disponível para navegação."
            );


            return;

        }


        const perfilId =
            dados.obterPerfilId();


        if (!valorValido(perfilId)) {

            console.warn(
                "ApresentarPerfilRenderTeste: perfilId inválido para navegação."
            );


            return;

        }


        const urlPerfil =
            `meu-perfil.html?id=${encodeURIComponent(
                String(perfilId).trim()
            )}`;


        const elementos = [

            obterElemento(
                "profileTopbarAvatar"
            ),

            obterElemento(
                "profileTopbarInitials"
            ),

            obterElemento(
                "profileTopbarName"
            )

        ];


        elementos.forEach(
            function (elemento) {

                if (!elemento) {

                    return;

                }


                if (
                    elemento.dataset.perfilNavegacaoConfigurada ===
                    "true"
                ) {

                    return;

                }


                elemento.dataset.perfilNavegacaoConfigurada =
                    "true";


                elemento.style.cursor =
                    "pointer";


                elemento.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            urlPerfil;

                    }
                );


                if (
                    elemento.tagName !== "A" &&
                    elemento.tagName !== "BUTTON"
                ) {

                    elemento.setAttribute(
                        "role",
                        "link"
                    );


                    elemento.setAttribute(
                        "tabindex",
                        "0"
                    );


                    elemento.addEventListener(
                        "keydown",
                        function (evento) {

                            if (
                                evento.key === "Enter" ||
                                evento.key === " "
                            ) {

                                evento.preventDefault();


                                window.location.href =
                                    urlPerfil;

                            }

                        }
                    );

                }

            }
        );

    }


    /* =========================================================
       RENDERIZAR DESCRIÇÃO
       ========================================================= */

    function renderizarDescricao() {

        const elemento =
            obterElemento(
                "profileBio"
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =
            obterBiografia();

    }


    /* =========================================================
       RENDERIZAR GÊNEROS
       ========================================================= */

    function renderizarGeneros() {

        const container =
            obterElemento(
                "genreList"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        const generos =
            obterGeneros();


        generos.forEach(
            function (genero) {

                const elemento =
                    document.createElement(
                        "span"
                    );


                elemento.className =
                    "profile-genre";


                elemento.textContent =
                    genero;


                container.appendChild(
                    elemento
                );

            }
        );


        container.style.display =
            generos.length
                ? ""
                : "none";

    }


    /* =========================================================
       RENDERIZAR AVALIAÇÃO
       ========================================================= */

    function renderizarAvaliacao() {

        const rating =
            obterAvaliacao();


        const valor =
            obterElemento(
                "ratingValue"
            );


        const quantidade =
            obterElemento(
                "ratingReviews"
            );


        const container =
            obterElemento(
                "profileRating"
            );


        if (valor) {

            valor.textContent =
                rating.media > 0
                    ? rating.media.toFixed(1)
                    : "—";

        }


        if (quantidade) {

            quantidade.textContent =
                rating.total > 0
                    ? `(${rating.total})`
                    : "(sem avaliações)";

        }


        if (container) {

            container.style.display =
                "";

        }

    }


    /* =========================================================
       RENDERIZAR EXPERIÊNCIA
       ========================================================= */

    function renderizarExperiencia() {

        const elemento =
            obterElemento(
                "profileExperience"
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =
            obterExperiencia();

    }


    /* =========================================================
       RENDERIZAR ÁREA
       ========================================================= */

    function renderizarArea() {

        const elemento =
            obterElemento(
                "profileArea"
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =
            obterAreaAtuacao();

    }


    /* =========================================================
       RENDERIZAR DISPONIBILIDADE
       ========================================================= */

    function renderizarDisponibilidade() {

        const elemento =
            obterElemento(
                "profileAvailability"
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =
            obterDisponibilidade();

    }


    /* =========================================================
       RENDERIZAR TUDO
       ========================================================= */

    function renderizar() {

        /*
         * =====================================================
         * IDENTIDADE
         * =====================================================
         */

        renderizarNome();

        renderizarTipo();

        renderizarLocalizacao();

        renderizarAvatar();


        /*
         * =====================================================
         * INFORMAÇÕES ESPECÍFICAS DO ESTABELECIMENTO
         * =====================================================
         */

        renderizarInformacoesEspaco();

        renderizarLocalizacaoEstabelecimento();

        renderizarContatosEstabelecimento();


        /*
         * =====================================================
         * AGENDA / EVENTOS
         * =====================================================
         */

        renderizarAgenda();


        /*
         * =====================================================
         * NAVEGAÇÃO DO PERFIL
         * =====================================================
         */

        configurarNavegacaoPerfil();


        /*
         * =====================================================
         * CONTEÚDO ABAIXO DA MÍDIA
         * =====================================================
         *
         * Não chamamos:
         *
         * - renderizarDescricao();
         * - renderizarGeneros();
         * - renderizarAvaliacao();
         * - renderizarExperiencia();
         * - renderizarArea();
         * - renderizarDisponibilidade();
         *
         * Essa região continua sendo controlada pelo portfólio.
         */


        /*
         * =====================================================
         * LUCIDE
         * =====================================================
         */

        if (
            window.lucide &&
            typeof window.lucide.createIcons === "function"
        ) {

            window.lucide.createIcons();

        }


        console.log(
            "ApresentarPerfilRenderTeste: perfil renderizado."
        );

    }


    /* =========================================================
       API PÚBLICA
       ========================================================= */

    window.ApresentarPerfilRenderTeste = {

        renderizar,

        renderizarNome,

        renderizarTipo,

        renderizarLocalizacao,

        renderizarAvatar,

        renderizarInformacoesEspaco,

        renderizarLocalizacaoEstabelecimento,

        renderizarContatosEstabelecimento,

        renderizarAgenda,

        configurarNavegacaoPerfil,

        renderizarDescricao,

        renderizarGeneros,

        renderizarAvaliacao,

        renderizarExperiencia,

        renderizarArea,

        renderizarDisponibilidade,

        obterNomePerfil,

        obterNomeTipo,

        obterLocalizacao,

        obterFotoPerfil,

        obterBiografia,

        obterExperiencia,

        obterAreaAtuacao,

        obterDisponibilidade,

        obterGeneros,

        obterInstrumentos,

        obterAvaliacao,

        obterAgenda,

        obterEventosPublicos,

        obterIniciais,

        obterPerfilEstabelecimento,

        perfilEhEstabelecimento

    };


    /* =========================================================
       DIAGNÓSTICO
       ========================================================= */

    console.log(
        "ApresentarPerfilRenderTeste carregado."
    );


})(window);