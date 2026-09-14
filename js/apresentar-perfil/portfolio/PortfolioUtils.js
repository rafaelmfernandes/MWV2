(function (window) {

    "use strict";

    /*
     * =========================================================
     * MUSICALWORLD — UTILITÁRIOS DO PORTFÓLIO
     *
     * Arquivo:
     * PortfolioUtils.js
     *
     * Responsabilidade:
     *
     * - Funções auxiliares.
     * - Normalização dos dados.
     * - Identificação dos tipos de mídia.
     * - Tratamento de URLs/títulos/descrições.
     * - Funções do fundo dinâmico.
     * - Extração das cores das mídias.
     * - Controle do contraste dinâmico da topbar.
     *
     * Este arquivo não controla o deck nem renderiza a galeria.
     * =========================================================
     */


    const modulo =
        window.MusicalWorldPortfolio;

    if (!modulo) {

        console.error(
            "PortfolioUtils.js: PortfolioConfig.js precisa ser carregado antes."
        );

        return;

    }


    const CONFIG =
        modulo.CONFIG;

    const estado =
        modulo.estado;


    /* =========================================================
       01. UTILITÁRIOS GERAIS
       ========================================================= */

    function obterUtils() {

        if (window.PerfilUtils) {

            return window.PerfilUtils;

        }

        return null;

    }


    function obterElemento(id) {

        if (!id) {

            return null;

        }

        return document.getElementById(id);

    }


    function escaparHtml(valor) {

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


    function renderizarIcones(container) {

        if (!container) {

            return;

        }

        try {

            if (
                window.lucide &&
                typeof window.lucide.createIcons ===
                "function"
            ) {

                window.lucide.createIcons({

                    attrs: {

                        "stroke-width": 1.8

                    }

                });

            }

        } catch (erro) {

            console.warn(
                "PortfolioUtils: não foi possível atualizar ícones.",
                erro
            );

        }

    }


    function obterBody() {

        return document.body || null;

    }


    /* =========================================================
       01.1. CONTRASTE DINÂMICO DA TOPBAR
       =========================================================

       Analisa as mesmas cores utilizadas pelo fundo dinâmico
       do portfólio e informa à topbar se ela deve utilizar
       conteúdo claro ou escuro.

       A primeira cor possui maior peso porque é a cor que
       aparece com maior intensidade na parte superior do
       gradiente, justamente onde a topbar está posicionada.

       O CSS da topbar utiliza as variáveis:

           --perfil-topbar-texto
           --perfil-topbar-subtexto
           --perfil-topbar-botao-fundo
           --perfil-topbar-botao-borda
           --perfil-topbar-botao-cor
           --perfil-topbar-botao-sombra

       ========================================================= */

    function calcularLuminosidadeCor(cor) {

        const rgb =
            converterCssParaRgb(cor);


        if (!rgb) {

            return null;

        }


        /*
         * Converte cada canal RGB para luminância perceptual.
         *
         * O cálculo considera que o olho humano percebe
         * determinadas cores com intensidades diferentes.
         */

        function converterCanal(valor) {

            const canal =
                valor / 255;


            if (
                canal <= 0.03928
            ) {

                return canal / 12.92;

            }


            return Math.pow(

                (
                    canal + 0.055
                ) / 1.055,

                2.4

            );

        }


        const r =
            converterCanal(rgb.r);

        const g =
            converterCanal(rgb.g);

        const b =
            converterCanal(rgb.b);


        return (

            (
                0.2126 *
                r
            ) +

            (
                0.7152 *
                g
            ) +

            (
                0.0722 *
                b
            )

        );

    }


    function atualizarContrasteTopbar(cores) {

        const topbar =
            document.querySelector(
                ".topbar"
            );


        if (
            !topbar ||
            !Array.isArray(cores) ||
            cores.length < 3
        ) {

            return;

        }


        const luminosidade1 =
            calcularLuminosidadeCor(
                cores[0]
            );


        const luminosidade2 =
            calcularLuminosidadeCor(
                cores[1]
            );


        const luminosidade3 =
            calcularLuminosidadeCor(
                cores[2]
            );


        /*
         * Se alguma cor não puder ser interpretada,
         * não alteramos o estado atual da topbar.
         */

        if (
            luminosidade1 === null &&
            luminosidade2 === null &&
            luminosidade3 === null
        ) {

            return;

        }


        const cor1 =
            luminosidade1 !== null
                ? luminosidade1
                : 0.5;


        const cor2 =
            luminosidade2 !== null
                ? luminosidade2
                : cor1;


        const cor3 =
            luminosidade3 !== null
                ? luminosidade3
                : cor2;


        /*
         * A primeira cor recebe o maior peso porque corresponde
         * à parte superior do gradiente.
         */

        const luminosidadeMedia =

            (
                (cor1 * 0.60) +
                (cor2 * 0.25) +
                (cor3 * 0.15)
            );


        /*
         * Abaixo deste limite consideramos o fundo escuro.
         *
         * O valor 0.52 deixa uma margem de segurança para que
         * textos brancos não sejam utilizados sobre fundos que
         * ainda estejam claros demais.
         */

        const fundoEscuro =
            luminosidadeMedia < 0.52;


        /*
         * =====================================================
         * FUNDO ESCURO
         * =====================================================
         */

        if (fundoEscuro) {

            topbar.style.setProperty(
                "--perfil-topbar-texto",
                "#ffffff"
            );

            topbar.style.setProperty(
                "--perfil-topbar-subtexto",
                "rgba(255, 255, 255, 0.78)"
            );

            topbar.style.setProperty(
                "--perfil-topbar-botao-fundo",
                "rgba(15, 23, 42, 0.30)"
            );

            topbar.style.setProperty(
                "--perfil-topbar-botao-borda",
                "rgba(255, 255, 255, 0.24)"
            );

            topbar.style.setProperty(
                "--perfil-topbar-botao-cor",
                "#ffffff"
            );

            topbar.style.setProperty(
                "--perfil-topbar-botao-sombra",
                "0 2px 8px rgba(0, 0, 0, 0.20)"
            );


            topbar.classList.add(
                "topbar-fundo-escuro"
            );

            topbar.classList.remove(
                "topbar-fundo-claro"
            );


            return;

        }


        /*
         * =====================================================
         * FUNDO CLARO
         * =====================================================
         */

        topbar.style.setProperty(
            "--perfil-topbar-texto",
            "#172033"
        );

        topbar.style.setProperty(
            "--perfil-topbar-subtexto",
            "#667085"
        );

        topbar.style.setProperty(
            "--perfil-topbar-botao-fundo",
            "rgba(255, 255, 255, 0.72)"
        );

        topbar.style.setProperty(
            "--perfil-topbar-botao-borda",
            "rgba(255, 255, 255, 0.85)"
        );

        topbar.style.setProperty(
            "--perfil-topbar-botao-cor",
            "#475467"
        );

        topbar.style.setProperty(
            "--perfil-topbar-botao-sombra",
            "0 2px 8px rgba(15, 23, 42, 0.08)"
        );


        topbar.classList.add(
            "topbar-fundo-claro"
        );

        topbar.classList.remove(
            "topbar-fundo-escuro"
        );

    }


    function resetarContrasteTopbar() {

        const topbar =
            document.querySelector(
                ".topbar"
            );


        if (!topbar) {

            return;

        }


        /*
         * Remove os estados dinâmicos.
         */

        topbar.classList.remove(
            "topbar-fundo-escuro",
            "topbar-fundo-claro"
        );


        /*
         * Volta aos valores padrão do estado normal.
         */

        topbar.style.removeProperty(
            "--perfil-topbar-texto"
        );

        topbar.style.removeProperty(
            "--perfil-topbar-subtexto"
        );

        topbar.style.removeProperty(
            "--perfil-topbar-botao-fundo"
        );

        topbar.style.removeProperty(
            "--perfil-topbar-botao-borda"
        );

        topbar.style.removeProperty(
            "--perfil-topbar-botao-cor"
        );

        topbar.style.removeProperty(
            "--perfil-topbar-botao-sombra"
        );

    }


    /* =========================================================
       02. NORMALIZAÇÃO DOS DADOS
       ========================================================= */

    function normalizarTipoMidia(item) {

        if (!item) {

            return "imagem";

        }

        const tipoOriginal =

            String(

                item.tipo_midia ||

                item.tipoMidia ||

                item.tipo ||

                item.media_type ||

                item.mediaType ||

                ""

            )

                .toLowerCase()
                .trim();


        const url =

            String(

                item.url ||

                item.arquivo_url ||

                item.arquivoUrl ||

                item.media_url ||

                item.mediaUrl ||

                item.caminho ||

                item.src ||

                ""

            )

                .toLowerCase();


        if (

            tipoOriginal.includes("video") ||

            tipoOriginal.includes("vídeo") ||

            tipoOriginal === "mp4" ||

            tipoOriginal === "webm" ||

            tipoOriginal === "mov" ||

            url.endsWith(".mp4") ||

            url.endsWith(".webm") ||

            url.endsWith(".mov")

        ) {

            return "video";

        }


        if (

            tipoOriginal.includes("audio") ||

            tipoOriginal.includes("áudio") ||

            tipoOriginal === "mp3" ||

            tipoOriginal === "wav" ||

            tipoOriginal === "ogg" ||

            url.endsWith(".mp3") ||

            url.endsWith(".wav") ||

            url.endsWith(".ogg")

        ) {

            return "audio";

        }


        return "imagem";

    }


    function obterUrlMidia(item) {

        if (!item) {

            return "";

        }

        return (

            item.url ||

            item.arquivo_url ||

            item.arquivoUrl ||

            item.media_url ||

            item.mediaUrl ||

            item.caminho ||

            item.src ||

            item.public_url ||

            item.publicUrl ||

            ""

        );

    }


    function obterTitulo(item) {

        if (!item) {

            return "";

        }

        return (

            item.titulo ||

            item.nome ||

            item.nome_arquivo ||

            item.nomeArquivo ||

            item.title ||

            ""

        );

    }


    function obterDescricao(item) {

        if (!item) {

            return "";

        }

        return (

            item.descricao ||

            item.description ||

            item.texto ||

            item.legenda ||

            ""

        );

    }


    function normalizarItem(item, indice) {

        if (!item) {

            return null;

        }

        const url =
            obterUrlMidia(item);

        if (!url) {

            return null;

        }

        return {

            ...item,

            _indice: indice,

            _tipo:
                normalizarTipoMidia(item),

            _url:
                url,

            _titulo:
                obterTitulo(item),

            _descricao:
                obterDescricao(item)

        };

    }


    function normalizarPortfolio(lista) {

        if (!Array.isArray(lista)) {

            return [];

        }

        return lista

            .map(function (
                item,
                indice
            ) {

                return normalizarItem(
                    item,
                    indice
                );

            })

            .filter(Boolean);

    }


    function obterPorTipo(tipo) {

        return estado.portfolio.filter(

            function (item) {

                return (

                    item &&

                    item._tipo === tipo

                );

            }

        );

    }


    /* =========================================================
       03. FUNDO DINÂMICO
       ========================================================= */

    function obterCoresFallbackDinamica() {

        return [

            CONFIG.fundoDinamico.corFallback1,

            CONFIG.fundoDinamico.corFallback2,

            CONFIG.fundoDinamico.corFallback3

        ];

    }


    function converterCssParaRgb(cor) {

        if (!cor) {

            return null;

        }

        const texto =
            String(cor).trim();

        const correspondencia =
            texto.match(
                /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
            );

        if (!correspondencia) {

            return null;

        }

        return {

            r:
                Number(
                    correspondencia[1]
                ),

            g:
                Number(
                    correspondencia[2]
                ),

            b:
                Number(
                    correspondencia[3]
                ),

            a:
                correspondencia[4] !== undefined

                    ? Number(
                        correspondencia[4]
                    )

                    : 1

        };

    }


    function interpolarCor(
        corInicial,
        corFinal,
        progresso
    ) {

        const inicial =
            converterCssParaRgb(
                corInicial
            );

        const final =
            converterCssParaRgb(
                corFinal
            );

        if (
            !inicial ||
            !final
        ) {

            return corFinal;

        }

        const r =

            inicial.r +
            (
                (final.r - inicial.r) *
                progresso
            );

        const g =

            inicial.g +
            (
                (final.g - inicial.g) *
                progresso
            );

        const b =

            inicial.b +
            (
                (final.b - inicial.b) *
                progresso
            );

        const a =

            inicial.a +
            (
                (final.a - inicial.a) *
                progresso
            );

        return converterRgbParaCss(
            r,
            g,
            b,
            a
        );

    }


    function aplicarEasingSuave(progresso) {

        return (

            progresso < 0.5

                ? 2 *
                    progresso *
                    progresso

                : 1 -
                    (
                        Math.pow(
                            -2 *
                            progresso +
                            2,
                            2
                        ) /
                        2
                    )

        );

    }


    function cancelarTransicaoCores() {

        if (
            estado.fundoDinamico.animacaoId !== null
        ) {

            cancelAnimationFrame(
                estado.fundoDinamico.animacaoId
            );

            estado.fundoDinamico.animacaoId =
                null;

        }

    }


    function aplicarCoresFundoImediatamente(cores) {

        const body =
            obterBody();

        if (
            !body ||
            !Array.isArray(cores) ||
            cores.length < 3
        ) {

            return;

        }

        body.style.setProperty(
            "--perfil-fundo-cor-1",
            cores[0]
        );

        body.style.setProperty(
            "--perfil-fundo-cor-2",
            cores[1]
        );

        body.style.setProperty(
            "--perfil-fundo-cor-3",
            cores[2]
        );

        estado.fundoDinamico.coresAtuais = [

            cores[0],

            cores[1],

            cores[2]

        ];


        /*
         * Atualiza imediatamente o contraste da topbar
         * para a nova mídia.
         */

        atualizarContrasteTopbar(
            cores
        );


    }


    function animarCoresFundo(novasCores) {

        const body =
            obterBody();

        if (
            !body ||
            !Array.isArray(novasCores) ||
            novasCores.length < 3
        ) {

            return;

        }

        const destino = [

            novasCores[0],

            novasCores[1],

            novasCores[2]

        ];


        if (
            !Array.isArray(
                estado.fundoDinamico.coresAtuais
            ) ||
            estado.fundoDinamico.coresAtuais.length < 3
        ) {

            cancelarTransicaoCores();

            aplicarCoresFundoImediatamente(
                destino
            );

            return;

        }


        if (

            estado.fundoDinamico.coresAtuais[0] ===
                destino[0] &&

            estado.fundoDinamico.coresAtuais[1] ===
                destino[1] &&

            estado.fundoDinamico.coresAtuais[2] ===
                destino[2]

        ) {

            /*
             * Mesmo que as cores sejam iguais, garantimos
             * que a topbar esteja sincronizada.
             */

            atualizarContrasteTopbar(
                destino
            );

            return;

        }


        cancelarTransicaoCores();


        /*
         * Atualizamos o contraste para o destino logo no
         * início da transição.
         *
         * Isso evita deixar texto escuro sobre um vídeo que
         * acabou de assumir um fundo escuro.
         */

        atualizarContrasteTopbar(
            destino
        );


        const origem = [

            estado.fundoDinamico.coresAtuais[0],

            estado.fundoDinamico.coresAtuais[1],

            estado.fundoDinamico.coresAtuais[2]

        ];


        const inicio =
            performance.now();

        const duracao =
            estado.fundoDinamico.duracaoTransicao;


        function animar(agora) {

            const tempoDecorrido =
                agora - inicio;

            let progresso =

                Math.min(

                    1,

                    tempoDecorrido /
                    duracao

                );


            progresso =
                aplicarEasingSuave(
                    progresso
                );


            const coresInterpoladas = [

                interpolarCor(
                    origem[0],
                    destino[0],
                    progresso
                ),

                interpolarCor(
                    origem[1],
                    destino[1],
                    progresso
                ),

                interpolarCor(
                    origem[2],
                    destino[2],
                    progresso
                )

            ];


            body.style.setProperty(
                "--perfil-fundo-cor-1",
                coresInterpoladas[0]
            );

            body.style.setProperty(
                "--perfil-fundo-cor-2",
                coresInterpoladas[1]
            );

            body.style.setProperty(
                "--perfil-fundo-cor-3",
                coresInterpoladas[2]
            );


            estado.fundoDinamico.coresAtuais =
                coresInterpoladas;


            if (
                progresso < 1
            ) {

                estado.fundoDinamico.animacaoId =

                    requestAnimationFrame(
                        animar
                    );

                return;

            }


            estado.fundoDinamico.coresAtuais = [

                destino[0],

                destino[1],

                destino[2]

            ];


            body.style.setProperty(
                "--perfil-fundo-cor-1",
                destino[0]
            );

            body.style.setProperty(
                "--perfil-fundo-cor-2",
                destino[1]
            );

            body.style.setProperty(
                "--perfil-fundo-cor-3",
                destino[2]
            );


            /*
             * Garante o estado final correto da topbar.
             */

            atualizarContrasteTopbar(
                destino
            );


            estado.fundoDinamico.animacaoId =
                null;

        }


        estado.fundoDinamico.animacaoId =
            requestAnimationFrame(
                animar
            );

    }


    function aplicarCoresFundoFallback() {

        animarCoresFundo(
            obterCoresFallbackDinamica()
        );

    }


    function aplicarCoresFundoDinamico(cores) {

        if (
            !Array.isArray(cores) ||
            cores.length < 3
        ) {

            aplicarCoresFundoFallback();

            return;

        }

        animarCoresFundo(
            cores
        );

    }


    function calcularSaturacao(
        r,
        g,
        b
    ) {

        const maior =
            Math.max(
                r,
                g,
                b
            );

        const menor =
            Math.min(
                r,
                g,
                b
            );

        if (
            maior === 0
        ) {

            return 0;

        }

        return (
            maior -
            menor
        ) / maior;

    }


    function calcularDistanciaCores(
        corA,
        corB
    ) {

        const diferencaR =
            corA.r -
            corB.r;

        const diferencaG =
            corA.g -
            corB.g;

        const diferencaB =
            corA.b -
            corB.b;

        return Math.sqrt(

            (
                diferencaR *
                diferencaR
            ) +

            (
                diferencaG *
                diferencaG
            ) +

            (
                diferencaB *
                diferencaB
            )

        );

    }


    /*
     * =========================================================
     * ORDENAÇÃO DAS CORES DO FUNDO DINÂMICO
     * =========================================================
     *
     * Mantém a seleção original das cores da mídia, mas altera
     * somente a ordem em que elas serão utilizadas pelo
     * gradiente.
     *
     * Ordem desejada:
     *
     * 1. Cor mais escura
     * 2. Cor intermediária
     * 3. Cor mais clara
     *
     * Dessa forma, a parte superior do fundo dinâmico sempre
     * começa com a cor mais escura disponível entre as três
     * cores que já foram selecionadas pela análise da mídia.
     *
     * Importante:
     *
     * - Não altera a forma como as cores são encontradas.
     * - Não remove cores.
     * - Não muda os filtros existentes.
     * - Não inclui pixels pretos que já foram descartados.
     * ========================================================= */

    function ordenarCoresPorLuminosidade(cores) {

        if (
            !Array.isArray(cores) ||
            cores.length < 3
        ) {

            return cores;

        }


        return cores

            .map(function (
                cor,
                indice
            ) {

                const luminosidade =
                    calcularLuminosidadeCor(
                        cor
                    );


                return {

                    cor: cor,

                    indice: indice,

                    luminosidade:
                        luminosidade

                };

            })

            .sort(function (
                a,
                b
            ) {

                /*
                 * Quando a luminosidade não puder ser calculada,
                 * colocamos a cor no final da ordenação.
                 */

                const luminosidadeA =

                    a.luminosidade !== null

                        ? a.luminosidade

                        : 1;


                const luminosidadeB =

                    b.luminosidade !== null

                        ? b.luminosidade

                        : 1;


                /*
                 * Menor luminosidade = cor mais escura.
                 *
                 * Portanto, a menor luminosidade vem primeiro.
                 */

                return (
                    luminosidadeA -
                    luminosidadeB
                );

            })

            .map(function (item) {

                return item.cor;

            });

    }


    function converterRgbParaCss(
        r,
        g,
        b,
        a
    ) {

        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

    }


    function extrairCoresDoCanvas(contexto) {

        if (!contexto) {

            return null;

        }

        try {

            const dados =
                contexto.getImageData(

                    0,
                    0,

                    CONFIG.fundoDinamico.larguraCanvas,
                    CONFIG.fundoDinamico.alturaCanvas

                ).data;


            const agrupamentos =
                new Map();


            const passo =

                Math.max(

                    1,

                    CONFIG.fundoDinamico
                        .passoAmostragem

                );


            for (
                let y = 0;
                y < CONFIG.fundoDinamico.alturaCanvas;
                y += passo
            ) {

                for (
                    let x = 0;
                    x < CONFIG.fundoDinamico.larguraCanvas;
                    x += passo
                ) {

                    const posicao =

                        (
                            (
                                y *
                                CONFIG.fundoDinamico.larguraCanvas
                            ) +
                            x
                        ) *
                        4;


                    const r =
                        dados[posicao];

                    const g =
                        dados[posicao + 1];

                    const b =
                        dados[posicao + 2];

                    const a =
                        dados[posicao + 3];


                    if (
                        a < 180
                    ) {

                        continue;

                    }


                    if (
                        r +
                        g +
                        b >
                        720
                    ) {

                        continue;

                    }


                    if (
                        r +
                        g +
                        b <
                        35
                    ) {

                        continue;

                    }


                    const tamanhoGrupo =
                        24;


                    const qr =

                        Math.min(

                            255,

                            Math.round(
                                r /
                                tamanhoGrupo
                            ) *
                            tamanhoGrupo

                        );


                    const qg =

                        Math.min(

                            255,

                            Math.round(
                                g /
                                tamanhoGrupo
                            ) *
                            tamanhoGrupo

                        );


                    const qb =

                        Math.min(

                            255,

                            Math.round(
                                b /
                                tamanhoGrupo
                            ) *
                            tamanhoGrupo

                        );


                    const chave =
                        `${qr},${qg},${qb}`;


                    const saturacao =

                        calcularSaturacao(
                            r,
                            g,
                            b
                        );


                    const peso =

                        1 +
                        (
                            saturacao *
                            0.75
                        );


                    if (
                        agrupamentos.has(
                            chave
                        )
                    ) {

                        const grupo =

                            agrupamentos.get(
                                chave
                            );

                        grupo.peso +=
                            peso;

                        grupo.quantidade +=
                            1;

                    } else {

                        agrupamentos.set(

                            chave,

                            {

                                r: qr,

                                g: qg,

                                b: qb,

                                peso: peso,

                                quantidade: 1

                            }

                        );

                    }

                }

            }


            const grupos =

                Array.from(
                    agrupamentos.values()
                );


            if (!grupos.length) {

                return null;

            }


            grupos.sort(

                function (
                    a,
                    b
                ) {

                    return (
                        b.peso -
                        a.peso
                    );

                }

            );


            const selecionadas = [];


            for (
                let indice = 0;
                indice < grupos.length;
                indice++
            ) {

                const candidata =
                    grupos[indice];

                let muitoParecida =
                    false;


                for (
                    let j = 0;
                    j < selecionadas.length;
                    j++
                ) {

                    const distancia =

                        calcularDistanciaCores(

                            candidata,

                            selecionadas[j]

                        );


                    if (
                        distancia <
                        CONFIG.fundoDinamico
                            .distanciaMinimaCores
                    ) {

                        muitoParecida =
                            true;

                        break;

                    }

                }


                if (
                    muitoParecida
                ) {

                    continue;

                }


                selecionadas.push(
                    candidata
                );


                if (
                    selecionadas.length >= 3
                ) {

                    break;

                }

            }


            if (
                selecionadas.length < 3
            ) {

                for (
                    let indice = 0;
                    indice < grupos.length;
                    indice++
                ) {

                    if (
                        selecionadas.indexOf(
                            grupos[indice]
                        ) !== -1
                    ) {

                        continue;

                    }

                    selecionadas.push(
                        grupos[indice]
                    );


                    if (
                        selecionadas.length >= 3
                    ) {

                        break;

                    }

                }

            }


            if (
                !selecionadas.length
            ) {

                return null;

            }


            const primeira =
                selecionadas[0];

            const segunda =
                selecionadas[1] ||
                primeira;

            const terceira =
                selecionadas[2] ||
                segunda ||
                primeira;


            /*
             * Mantemos exatamente as três cores selecionadas
             * pelo algoritmo original.
             *
             * A única mudança é ordenar essas três cores pela
             * luminosidade antes de entregá-las ao gradiente.
             */

            const coresExtraidas = [

                converterRgbParaCss(
                    primeira.r,
                    primeira.g,
                    primeira.b,
                    1
                ),

                converterRgbParaCss(
                    segunda.r,
                    segunda.g,
                    segunda.b,
                    1
                ),

                converterRgbParaCss(
                    terceira.r,
                    terceira.g,
                    terceira.b,
                    1
                )

            ];


            /*
             * A cor mais escura passa a ocupar a primeira posição,
             * portanto será utilizada no topo do gradiente.
             */

            return ordenarCoresPorLuminosidade(
                coresExtraidas
            );

        } catch (erro) {

            console.warn(
                "PortfolioUtils: não foi possível analisar os pixels da mídia.",
                erro
            );

            return null;

        }

    }


    function extrairCoresImagem(url) {

        return new Promise(

            function (resolver) {

                if (!url) {

                    resolver(null);

                    return;

                }


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    CONFIG.fundoDinamico.larguraCanvas;

                canvas.height =
                    CONFIG.fundoDinamico.alturaCanvas;


                const contexto =

                    canvas.getContext(
                        "2d",
                        {
                            willReadFrequently: true
                        }
                    );


                if (!contexto) {

                    resolver(null);

                    return;

                }


                const imagem =
                    new Image();


                imagem.crossOrigin =
                    "anonymous";


                imagem.onload =
                    function () {

                        try {

                            contexto.clearRect(

                                0,
                                0,
                                canvas.width,
                                canvas.height

                            );


                            contexto.drawImage(

                                imagem,

                                0,
                                0,

                                canvas.width,
                                canvas.height

                            );


                            resolver(
                                extrairCoresDoCanvas(
                                    contexto
                                )
                            );

                        } catch (erro) {

                            console.warn(
                                "PortfolioUtils: não foi possível analisar as cores da imagem.",
                                erro
                            );

                            resolver(null);

                        }

                    };


                imagem.onerror =
                    function () {

                        resolver(null);

                    };


                imagem.src =
                    url;

            }

        );

    }


    function extrairCoresVideo(video) {

        return new Promise(

            function (resolver) {

                if (!video) {

                    resolver(null);

                    return;

                }


                const largura =
                    video.videoWidth;

                const altura =
                    video.videoHeight;


                if (
                    !largura ||
                    !altura
                ) {

                    const tentarNovamente =
                        function () {

                            extrairCoresVideo(
                                video
                            ).then(
                                resolver
                            );

                        };


                    video.addEventListener(
                        "loadeddata",
                        tentarNovamente,
                        {
                            once: true
                        }
                    );


                    video.addEventListener(
                        "loadedmetadata",
                        tentarNovamente,
                        {
                            once: true
                        }
                    );

                    return;

                }


                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    CONFIG.fundoDinamico.larguraCanvas;

                canvas.height =
                    CONFIG.fundoDinamico.alturaCanvas;


                const contexto =

                    canvas.getContext(
                        "2d",
                        {
                            willReadFrequently: true
                        }
                    );


                if (!contexto) {

                    resolver(null);

                    return;

                }


                try {

                    contexto.clearRect(

                        0,
                        0,

                        canvas.width,
                        canvas.height

                    );


                    const proporcaoVideo =
                        largura / altura;

                    const proporcaoCanvas =
                        canvas.width /
                        canvas.height;


                    let larguraDesenho =
                        canvas.width;

                    let alturaDesenho =
                        canvas.height;

                    let deslocamentoX = 0;

                    let deslocamentoY = 0;


                    if (
                        proporcaoVideo >
                        proporcaoCanvas
                    ) {

                        alturaDesenho =
                            canvas.height;

                        larguraDesenho =
                            alturaDesenho *
                            proporcaoVideo;

                        deslocamentoX =
                            (
                                canvas.width -
                                larguraDesenho
                            ) / 2;

                    } else {

                        larguraDesenho =
                            canvas.width;

                        alturaDesenho =
                            larguraDesenho /
                            proporcaoVideo;

                        deslocamentoY =
                            (
                                canvas.height -
                                alturaDesenho
                            ) / 2;

                    }


                    contexto.drawImage(

                        video,

                        deslocamentoX,
                        deslocamentoY,

                        larguraDesenho,
                        alturaDesenho

                    );


                    resolver(
                        extrairCoresDoCanvas(
                            contexto
                        )
                    );

                } catch (erro) {

                    console.warn(
                        "PortfolioUtils: não foi possível analisar o frame do vídeo.",
                        erro
                    );

                    resolver(null);

                }

            }

        );

    }


    /* =========================================================
       04. FUNDO DINÂMICO — VISIBILIDADE
       ========================================================= */

    function atualizarIntensidadeFundo() {

        const body =
            obterBody();

        const app =
            document.querySelector(".app");

        const portfolioSection =
            document.querySelector(
                ".profile-media-highlight"
            );


        /*
         * =========================================================
         * VALIDAÇÃO
         * =========================================================
         *
         * Sem os elementos principais, mantemos o fundo original.
         */

        if (
            !body ||
            !app ||
            !portfolioSection
        ) {

            if (body) {

                body.style.setProperty(
                    "--perfil-fundo-opacidade",
                    "0"
                );

                body.classList.remove(
                    "perfil-fundo-dinamico-visivel"
                );

            }

            if (app) {

                app.style.setProperty(
                    "--perfil-fundo-altura",
                    "0px"
                );

            }

            return;

        }


        const appRect =
            app.getBoundingClientRect();

        const portfolioRect =
            portfolioSection.getBoundingClientRect();


        const viewportHeight =
            window.innerHeight ||
            document.documentElement.clientHeight;


        /*
         * =========================================================
         * ALTURA DA REGIÃO DINÂMICA
         * =========================================================
         *
         * O fundo começa no topo do .app.
         *
         * Ele termina exatamente no final da área do portfólio.
         *
         * Dessa forma, a identidade do artista que vem depois
         * não recebe mais a cor dinâmica.
         */

        const alturaRegiaoDinamica =

            Math.max(
                0,
                portfolioRect.bottom -
                appRect.top
            );


        app.style.setProperty(
            "--perfil-fundo-altura",
            `${alturaRegiaoDinamica}px`
        );


        /*
         * =========================================================
         * REGIÃO VISÍVEL
         * =========================================================
         *
         * A região dinâmica existe entre:
         *
         * início:
         * topo do .app
         *
         * fim:
         * final do .profile-media-highlight
         *
         * Se o usuário estiver abaixo dessa região,
         * o fundo dinâmico desaparece completamente.
         */

        const regiaoTopo =
            appRect.top;

        const regiaoFundo =
            portfolioRect.bottom;


        const topoVisivel =
            Math.max(
                regiaoTopo,
                0
            );


        const fundoVisivel =
            Math.min(
                regiaoFundo,
                viewportHeight
            );


        const alturaVisivel =
            Math.max(
                0,
                fundoVisivel -
                topoVisivel
            );


        /*
         * =========================================================
         * FUNDO FORA DA REGIÃO
         * =========================================================
         *
         * Quando a tela já passou completamente da área do
         * portfólio, removemos o fundo dinâmico.
         */

        if (
            alturaVisivel <= 0
        ) {

            body.style.setProperty(
                "--perfil-fundo-opacidade",
                "0"
            );

            body.classList.remove(
                "perfil-fundo-dinamico-visivel"
            );

            return;

        }


        /*
         * =========================================================
         * OPACIDADE
         * =========================================================
         *
         * A transição vertical propriamente dita é feita pelo CSS
         * através do gradiente.
         *
         * Aqui apenas informamos se a região dinâmica está ativa
         * ou não.
         */

        const intensidade =
            0.85;


        body.style.setProperty(
            "--perfil-fundo-opacidade",
            intensidade.toFixed(3)
        );


        body.classList.add(
            "perfil-fundo-dinamico-visivel"
        );

    }


    function configurarControleVisibilidadeFundo() {

        if (
            estado.fundoDinamico.scrollRegistrado
        ) {

            atualizarIntensidadeFundo();

            return;

        }


        window.addEventListener(
            "scroll",
            atualizarIntensidadeFundo,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            atualizarIntensidadeFundo
        );


        estado.fundoDinamico.scrollRegistrado =
            true;


        atualizarIntensidadeFundo();

    }


    /* =========================================================
       05. ATUALIZAÇÃO DO FUNDO
       ========================================================= */

    function atualizarFundoDinamico() {

        if (
            !CONFIG.fundoDinamico.ativado
        ) {

            return;

        }


        const body =
            obterBody();


        if (!body) {

            return;

        }


        const deckModule =
            window.MusicalWorldPortfolioDeck;


        if (!deckModule) {

            return;

        }


        const item =
            estado.galeria.itens[
                estado.galeria.indiceAtual
            ];


        if (!item) {

            estado.fundoDinamico.chaveAtual =
                "";

            aplicarCoresFundoFallback();

            atualizarIntensidadeFundo();

            return;

        }


        const chave =
            `${item._tipo}|${item._url}`;


        if (
            chave ===
            estado.fundoDinamico.chaveAtual
        ) {

            atualizarIntensidadeFundo();

            return;

        }


        estado.fundoDinamico.chaveAtual =
            chave;


        const processamentoAtual =

            ++estado.fundoDinamico.processamento;


        /*
         * =====================================================
         * VÍDEO
         * =====================================================
         */

        if (
            item._tipo === "video"
        ) {

            const video =
                deckModule.obterVideoAtivo();


            if (!video) {

                aplicarCoresFundoFallback();

                atualizarIntensidadeFundo();

                return;

            }


            const iniciarAnaliseVideo =
                function () {

                    if (
                        processamentoAtual !==
                        estado.fundoDinamico.processamento
                    ) {

                        return;

                    }


                    extrairCoresVideo(
                        video
                    )

                        .then(

                            function (cores) {

                                if (
                                    processamentoAtual !==
                                    estado.fundoDinamico.processamento
                                ) {

                                    return;

                                }


                                if (
                                    Array.isArray(cores) &&
                                    cores.length >= 3
                                ) {

                                    aplicarCoresFundoDinamico(
                                        cores
                                    );

                                } else {

                                    aplicarCoresFundoFallback();

                                }


                                atualizarIntensidadeFundo();

                            }

                        )

                        .catch(

                            function (erro) {

                                if (
                                    processamentoAtual !==
                                    estado.fundoDinamico.processamento
                                ) {

                                    return;

                                }


                                console.warn(
                                    "PortfolioUtils: erro ao calcular fundo dinâmico do vídeo.",
                                    erro
                                );


                                aplicarCoresFundoFallback();

                                atualizarIntensidadeFundo();

                            }

                        );

                };


            if (
                video.readyState >= 2
            ) {

                iniciarAnaliseVideo();

            } else {

                video.addEventListener(
                    "loadeddata",
                    iniciarAnaliseVideo,
                    {
                        once: true
                    }
                );

            }

            return;

        }


        /*
         * =====================================================
         * ÁUDIO / OUTROS
         * =====================================================
         */

        if (
            item._tipo !== "imagem"
        ) {

            aplicarCoresFundoFallback();

            atualizarIntensidadeFundo();

            return;

        }


        /*
         * =====================================================
         * IMAGEM
         * =====================================================
         */

        extrairCoresImagem(
            item._url
        )

            .then(

                function (cores) {

                    if (
                        processamentoAtual !==
                        estado.fundoDinamico.processamento
                    ) {

                        return;

                    }


                    if (
                        Array.isArray(cores) &&
                        cores.length >= 3
                    ) {

                        aplicarCoresFundoDinamico(
                            cores
                        );

                    } else {

                        aplicarCoresFundoFallback();

                    }


                    atualizarIntensidadeFundo();

                }

            )

            .catch(

                function (erro) {

                    if (
                        processamentoAtual !==
                        estado.fundoDinamico.processamento
                    ) {

                        return;

                    }


                    console.warn(
                        "PortfolioUtils: erro ao calcular fundo dinâmico.",
                        erro
                    );


                    aplicarCoresFundoFallback();

                    atualizarIntensidadeFundo();

                }

            );

    }


    function resetarFundoDinamico() {

        const body =
            obterBody();


        cancelarTransicaoCores();


        estado.fundoDinamico.chaveAtual =
            "";


        estado.fundoDinamico.processamento++;


        estado.fundoDinamico.coresAtuais =
            null;


        /*
         * Retorna a topbar ao estado padrão antes de
         * aplicar novamente as cores de fallback.
         */

        resetarContrasteTopbar();


        if (body) {

            const cores =
                obterCoresFallbackDinamica();


            aplicarCoresFundoImediatamente(
                cores
            );


            body.style.setProperty(
                "--perfil-fundo-opacidade",
                "0"
            );


            body.classList.remove(
                "perfil-fundo-dinamico-visivel"
            );

        }

    }


    /* =========================================================
       API INTERNA
       ========================================================= */

    window.MusicalWorldPortfolioUtils = {

        obterUtils,

        obterElemento,

        escaparHtml,

        renderizarIcones,

        obterBody,

        normalizarTipoMidia,

        obterUrlMidia,

        obterTitulo,

        obterDescricao,

        normalizarItem,

        normalizarPortfolio,

        obterPorTipo,

        obterCoresFallbackDinamica,

        converterCssParaRgb,

        interpolarCor,

        aplicarEasingSuave,

        cancelarTransicaoCores,

        aplicarCoresFundoImediatamente,

        animarCoresFundo,

        aplicarCoresFundoFallback,

        aplicarCoresFundoDinamico,

        calcularSaturacao,

        calcularDistanciaCores,

        ordenarCoresPorLuminosidade,

        converterRgbParaCss,

        extrairCoresDoCanvas,

        extrairCoresImagem,

        extrairCoresVideo,

        atualizarIntensidadeFundo,

        configurarControleVisibilidadeFundo,

        atualizarFundoDinamico,

        resetarFundoDinamico,

        atualizarContrasteTopbar,

        resetarContrasteTopbar

    };


})(window);