/* =========================================================
   MUSICALWORLD — CARD DE OPORTUNIDADE DO FEED

   Arquivo:
   js/index/anuncio-oportunidade.js

   Responsabilidades:

   - Criar o card visual de uma oportunidade.
   - Exibir título, foto e nome de quem publicou.
   - Exibir tipo de artista procurado.
   - Exibir data, horário e localização.
   - Exibir estilos musicais.
   - Exibir instrumentos.
   - Exibir valor da oportunidade.
   - Criar a área de interesse da oportunidade.
   - Exibir quantidade de interessados.
   - Exibir os avatares dos interessados.
   - Exibir quantidade de visualizações.
   - Permitir que o card seja identificado pelo main.js
     como um item do tipo "oportunidade".
   - Manter toda a estrutura visual da oportunidade
     separada dos cards de artistas e estabelecimentos.
   - Impedir que o criador da oportunidade demonstre
     interesse na própria oportunidade.

   Este arquivo NÃO é responsável por:

   - Consultar o Supabase.
   - Buscar oportunidades.
   - Buscar interessados.
   - Buscar visualizações.
   - Controlar a paginação.
   - Controlar a ordem dos itens do feed.
   - Controlar filtros.
   - Criar o feed.
   - Registrar interesse no Supabase.
   - Registrar visualizações no Supabase.

   O main.js será responsável por fornecer os dados
   necessários para este módulo.
========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const CONFIG = {

        classeCard:
            "feed-oportunidade-card",

        classeAvatar:
            "feed-oportunidade-avatar",

        limiteAvatares:
            3

    };


    /* =====================================================
       UTILITÁRIOS
    ===================================================== */

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


    function obterTexto(valor, fallback = "") {

        if (
            valor === null ||
            valor === undefined
        ) {

            return fallback;

        }


        const texto =
            String(valor).trim();


        return texto || fallback;

    }


    /* =====================================================
       NORMALIZAR LOCALIZAÇÃO

       A localização pode chegar ao renderer como:

       - texto simples;
       - objeto JSON;
       - objeto com endereço;
       - objeto com cidade/estado;
       - objeto com logradouro/bairro/cidade/estado.

       Esta função impede que objetos sejam convertidos
       diretamente para "[object Object]".
    ===================================================== */

    function obterLocalizacaoTexto(
        localizacao
    ) {

        if (
            localizacao === null ||
            localizacao === undefined
        ) {

            return "";

        }


        /*
         * Quando a localização já é texto,
         * não precisamos fazer nenhuma conversão.
         */
        if (
            typeof localizacao === "string" ||
            typeof localizacao === "number"
        ) {

            return String(
                localizacao
            ).trim();

        }


        /*
         * Quando o Supabase entrega a localização
         * como objeto, procuramos primeiro um campo
         * que já contenha o endereço completo.
         */
        if (
            typeof localizacao === "object"
        ) {

            const camposTextoCompleto = [

                "endereco",

                "endereço",

                "localizacao",

                "localização",

                "descricao",

                "descrição",

                "nome",

                "label",

                "texto",

                "address",

                "formatted_address",

                "formattedAddress"

            ];


            for (
                const campo
                of camposTextoCompleto
            ) {

                const valor =
                    localizacao[campo];


                if (
                    valor !== null &&
                    valor !== undefined &&
                    typeof valor !== "object"
                ) {

                    const texto =
                        String(valor).trim();


                    if (texto) {

                        return texto;

                    }

                }

            }


            /*
             * Caso não exista um campo de endereço
             * completo, montamos a localização a partir
             * dos campos disponíveis.
             */
            const partes = [];


            const logradouro =
                localizacao.logradouro ||
                localizacao.rua ||
                localizacao.street ||
                localizacao.address_line_1;


            const numero =
                localizacao.numero ||
                localizacao.number;


            const complemento =
                localizacao.complemento ||
                localizacao.complement ||
                localizacao.address_line_2;


            const bairro =
                localizacao.bairro ||
                localizacao.district ||
                localizacao.neighborhood;


            const cidade =
                localizacao.cidade ||
                localizacao.city ||
                localizacao.municipio ||
                localizacao.município;


            const estado =
                localizacao.estado ||
                localizacao.state ||
                localizacao.uf;


            const cep =
                localizacao.cep ||
                localizacao.zipcode ||
                localizacao.zip_code ||
                localizacao.postalCode;


            if (logradouro) {

                let textoLogradouro =
                    String(
                        logradouro
                    ).trim();


                if (numero) {

                    textoLogradouro +=
                        `, ${String(numero).trim()}`;

                }


                partes.push(
                    textoLogradouro
                );

            }


            if (complemento) {

                partes.push(
                    String(
                        complemento
                    ).trim()
                );

            }


            if (bairro) {

                partes.push(
                    String(
                        bairro
                    ).trim()
                );

            }


            if (cidade && estado) {

                partes.push(
                    `${String(cidade).trim()} - ${String(estado).trim()}`
                );

            } else if (cidade) {

                partes.push(
                    String(cidade).trim()
                );

            } else if (estado) {

                partes.push(
                    String(estado).trim()
                );

            }


            if (cep) {

                partes.push(
                    String(cep).trim()
                );

            }


            if (partes.length) {

                return partes.join(", ");

            }


            return "";

        }


        return "";

    }


    /* =====================================================
       FORMATAR DATA
    ===================================================== */

    function formatarData(data) {

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


        return dataObj.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short"
            }
        )
        .replace(".", "")
        .toUpperCase();

    }


    /* =====================================================
       FORMATAR HORÁRIO
    ===================================================== */

    function formatarHorario(
        horaInicio,
        horaFim
    ) {

        const inicio =
            obterTexto(horaInicio);


        const fim =
            obterTexto(horaFim);


        if (
            !inicio &&
            !fim
        ) {

            return "";

        }


        if (
            inicio &&
            fim
        ) {

            return `${inicio} — ${fim}`;

        }


        return inicio || fim;

    }


    /* =====================================================
       FORMATAR VALOR
    ===================================================== */

    function formatarValor(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {

            return "";

        }


        const numero =
            Number(valor);


        if (
            Number.isNaN(numero)
        ) {

            return escaparHTML(
                valor
            );

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
       CRIAR ÍCONE SVG

       Mantemos os ícones em SVG para seguir o padrão
       visual atual do MusicalWorld, sem emojis.
    ===================================================== */

    function criarIcone(
        tipo
    ) {

        const icones = {

            calendario: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <rect
                        x="3"
                        y="4"
                        width="18"
                        height="17"
                        rx="2"
                    ></rect>

                    <path
                        d="M16 2v4M8 2v4M3 10h18"
                    ></path>
                </svg>
            `,


            localizacao: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
                    ></path>

                    <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                    ></circle>
                </svg>
            `,


            valor: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                    ></circle>

                    <path
                        d="M14.5 8.5c-.7-.6-1.5-.9-2.5-.9-1.4 0-2.4.7-2.4 1.8 0 2.8 5.4 1.1 5.4 4.1 0 1.1-1 1.9-2.5 1.9-1 0-2-.3-2.8-1"
                    ></path>

                    <path
                        d="M12 6.5v11"
                    ></path>
                </svg>
            `,


            interesse: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
                    ></path>
                </svg>
            `,


            interesseAtivo: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="m5 12 4 4L19 6"
                    ></path>
                </svg>
            `,


            visualizacoes: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                    ></path>

                    <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                    ></circle>
                </svg>
            `,


            oportunidade: `
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        d="M4 7h16v13H4z"
                    ></path>

                    <path
                        d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>

                    <path
                        d="M4 12h16"
                    ></path>

                    <path
                        d="M10 12v2h4v-2"
                    ></path>
                </svg>
            `

        };


        return icones[tipo] || "";

    }


    /* =====================================================
       OBTER INICIAIS
    ===================================================== */

    function obterIniciais(
        nome
    ) {

        const partes =
            obterTexto(nome)
                .split(/\s+/)
                .filter(Boolean);


        if (!partes.length) {

            return "U";

        }


        if (
            partes.length === 1
        ) {

            return partes[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            partes[0][0] +
            partes[partes.length - 1][0]
        )
        .toUpperCase();

    }


    /* =====================================================
       CRIAR AVATAR DO PUBLICADOR
    ===================================================== */

    function criarAvatarPublicador(
        oportunidade
    ) {

        const nome =
            obterTexto(
                oportunidade.publicadorNome,
                oportunidade.estabelecimentoNome ||
                "Usuário"
            );


        const foto =
            obterTexto(
                oportunidade.publicadorFotoUrl
            );


        const iniciais =
            obterIniciais(nome);


        if (foto) {

            return `
                <span
                    class="feed-oportunidade-publicador-avatar"
                >
                    <img
                        src="${escaparHTML(foto)}"
                        alt="${escaparHTML(nome)}"
                        loading="lazy"
                    >
                </span>
            `;

        }


        return `
            <span
                class="feed-oportunidade-publicador-avatar feed-oportunidade-publicador-avatar-inicial"
                aria-hidden="true"
            >
                ${escaparHTML(iniciais)}
            </span>
        `;

    }


    /* =====================================================
       CRIAR AVATAR DE INTERESSADO
    ===================================================== */

    function criarAvatar(
        interessado
    ) {

        if (!interessado) {

            return "";

        }


        const nome =
            obterTexto(
                interessado.nome,
                "Usuário"
            );


        const foto =
            obterTexto(
                interessado.foto_url
            );


        const iniciais =
            obterIniciais(nome);


        if (foto) {

            return `
                <span
                    class="${CONFIG.classeAvatar}"
                    title="${escaparHTML(nome)}"
                >
                    <img
                        src="${escaparHTML(foto)}"
                        alt="${escaparHTML(nome)}"
                        loading="lazy"
                    >
                </span>
            `;

        }


        return `
            <span
                class="${CONFIG.classeAvatar} feed-oportunidade-avatar-inicial"
                title="${escaparHTML(nome)}"
            >
                ${escaparHTML(iniciais)}
            </span>
        `;

    }


    /* =====================================================
       CRIAR TAGS
    ===================================================== */

    function criarTags(
        valores,
        classe
    ) {

        if (
            !Array.isArray(valores) ||
            !valores.length
        ) {

            return "";

        }


        return valores

            .filter(Boolean)

            .map(valor => {

                return `
                    <span class="${classe}">
                        ${escaparHTML(valor)}
                    </span>
                `;

            })

            .join("");

    }


    /* =====================================================
       CRIAR BLOCO DE TAGS
    ===================================================== */

    function criarBlocoTags(
        titulo,
        valores
    ) {

        if (
            !Array.isArray(valores) ||
            !valores.length
        ) {

            return "";

        }


        const tags =
            criarTags(
                valores,
                "feed-oportunidade-tag"
            );


        if (!tags) {

            return "";

        }


        return `
            <div
                class="feed-oportunidade-tags-grupo"
            >

                <span
                    class="feed-oportunidade-tags-titulo"
                >
                    ${escaparHTML(titulo)}
                </span>

                <div
                    class="feed-oportunidade-tags"
                >
                    ${tags}
                </div>

            </div>
        `;

    }


    /* =====================================================
       CRIAR ÁREA DE INTERESSADOS
    ===================================================== */

    function criarAreaInteressados(
        oportunidade
    ) {

        const interessados =
            Array.isArray(
                oportunidade.interessados
            )
                ? oportunidade.interessados
                : [];


        const quantidade =
            Number(
                oportunidade.quantidadeInteressados
            ) ||
            interessados.length ||
            0;


        const avatares =
            interessados
                .slice(
                    0,
                    CONFIG.limiteAvatares
                )
                .map(criarAvatar)
                .join("");


        return `
            <div
                class="feed-oportunidade-interessados"
                data-interessados-container
            >

                <div
                    class="feed-oportunidade-interessados-info"
                >

                    <div
                        class="feed-oportunidade-avatares"
                    >
                        ${avatares}
                    </div>

                    <span
                        class="feed-oportunidade-contador"
                        data-interessados-contador
                    >
                        ${quantidade}
                    </span>

                    <span
                        class="feed-oportunidade-contador-label"
                    >
                        ${
                            quantidade === 1
                                ? "interessado"
                                : "interessados"
                        }
                    </span>

                </div>

            </div>
        `;

    }


    /* =====================================================
       CRIAR ÁREA DE VISUALIZAÇÕES
    ===================================================== */

    function criarAreaVisualizacoes(
        oportunidade
    ) {

        const quantidade =
            Number(
                oportunidade.quantidadeVisualizacoes
            ) || 0;


        return `
            <div
                class="feed-oportunidade-visualizacoes"
                data-visualizacoes-container
                aria-label="${quantidade} ${
                    quantidade === 1
                        ? "pessoa visualizou"
                        : "pessoas visualizaram"
                } esta oportunidade"
            >

                <span
                    class="feed-oportunidade-visualizacoes-icon"
                    aria-hidden="true"
                >
                    ${criarIcone(
                        "visualizacoes"
                    )}
                </span>

                <span
                    class="feed-oportunidade-visualizacoes-contador"
                    data-visualizacoes-contador
                >
                    ${quantidade}
                </span>

            </div>
        `;

    }


    /* =====================================================
       ATUALIZAR CONTADOR DE VISUALIZAÇÕES
    ===================================================== */

    function atualizarContadorVisualizacoes(
        card,
        quantidade
    ) {

        if (!card) {

            return;

        }


        const contador =
            card.querySelector(
                "[data-visualizacoes-contador]"
            );


        if (!contador) {

            return;

        }


        const valor =
            Number(
                quantidade
            ) || 0;


        contador.textContent =
            String(valor);


        const container =
            card.querySelector(
                "[data-visualizacoes-container]"
            );


        if (container) {

            container.setAttribute(
                "aria-label",
                `${valor} ${
                    valor === 1
                        ? "pessoa visualizou"
                        : "pessoas visualizaram"
                } esta oportunidade`
            );

        }

    }


    /* =====================================================
       ATUALIZAR ESTADO VISUAL DO BOTÃO DE INTERESSE
    ===================================================== */

    function atualizarEstadoInteresse(
        card,
        interessado
    ) {

        if (!card) {

            return;

        }


        const botao =
            card.querySelector(
                "[data-acao-interesse]"
            );


        if (!botao) {

            return;

        }


        const icone =
            botao.querySelector(
                ".feed-oportunidade-interesse-icon"
            );


        const texto =
            botao.querySelector(
                "[data-interesse-texto]"
            );


        if (interessado) {

            card.classList.add(
                "interesse-ativo"
            );


            botao.setAttribute(
                "aria-pressed",
                "true"
            );


            botao.setAttribute(
                "aria-label",
                "Você já demonstrou interesse nesta oportunidade"
            );


            botao.dataset.interesseRegistrado =
                "true";


            if (icone) {

                icone.innerHTML =
                    criarIcone(
                        "interesseAtivo"
                    );

            }


            if (texto) {

                texto.textContent =
                    "Interesse enviado";

            }

        } else {

            card.classList.remove(
                "interesse-ativo"
            );


            botao.setAttribute(
                "aria-pressed",
                "false"
            );


            botao.setAttribute(
                "aria-label",
                "Tenho interesse nesta oportunidade"
            );


            delete botao.dataset.interesseRegistrado;


            if (icone) {

                icone.innerHTML =
                    criarIcone(
                        "interesse"
                    );

            }


            if (texto) {

                texto.textContent =
                    "Tenho interesse";

            }

        }

    }


    /* =====================================================
       ATUALIZAR CONTADOR DE INTERESSADOS
    ===================================================== */

    function atualizarContadorInteressados(
        card,
        quantidade
    ) {

        if (!card) {

            return;

        }


        const contador =
            card.querySelector(
                "[data-interessados-contador]"
            );


        if (!contador) {

            return;

        }


        const valor =
            Math.max(
                0,
                Number(quantidade) || 0
            );


        contador.textContent =
            String(valor);


        const label =
            card.querySelector(
                ".feed-oportunidade-contador-label"
            );


        if (label) {

            label.textContent =
                valor === 1
                    ? "interessado"
                    : "interessados";

        }

    }


    /* =====================================================
       CRIAR CARD DE OPORTUNIDADE
    ===================================================== */

    function criar(
        oportunidade = {}
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            CONFIG.classeCard;


        /* =================================================
           IDENTIFICAÇÃO DO ITEM
        ================================================= */

        card.dataset.tipoItem =
            "oportunidade";


        if (
            oportunidade.id !== undefined &&
            oportunidade.id !== null
        ) {

            card.dataset.oportunidadeId =
                String(
                    oportunidade.id
                );

        }


        /* =================================================
           DADOS PRINCIPAIS
        ================================================= */

        const titulo =
            obterTexto(
                oportunidade.titulo,
                "Oportunidade musical"
            );


        const publicadorNome =
            obterTexto(
                oportunidade.publicadorNome,
                oportunidade.estabelecimentoNome
            );


        const tipoArtista =
            obterTexto(
                oportunidade.tipoArtista
            );


        const local =
            obterLocalizacaoTexto(
                oportunidade.local
            );


        const data =
            formatarData(
                oportunidade.dataEvento
            );


        const horario =
            formatarHorario(
                oportunidade.horaInicio,
                oportunidade.horaFim
            );


        const valor =
            formatarValor(
                oportunidade.valor
            );


        const ehProprietario =
            oportunidade._ehProprietario === true;


        const ehInteressado =
            oportunidade._ehInteressado === true;


        /* =================================================
           BLOCOS DE ESTILOS E INSTRUMENTOS
        ================================================= */

        const blocoEstilos =
            criarBlocoTags(
                "Estilos",
                oportunidade.estilos
            );


        const blocoInstrumentos =
            criarBlocoTags(
                "Instrumentos",
                oportunidade.instrumentos
            );


        /* =================================================
           CONTEÚDO DO CARD
        ================================================= */

        card.innerHTML = `

            <div
                class="feed-oportunidade-header"
            >

                <div
                    class="feed-oportunidade-publicador"
                >

                    ${criarAvatarPublicador(
                        oportunidade
                    )}

                    <div
                        class="feed-oportunidade-publicador-dados"
                    >

                        ${
                            publicadorNome
                                ? `
                                    <span
                                        class="feed-oportunidade-publicador-nome"
                                    >
                                        ${escaparHTML(
                                            publicadorNome
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        <span
                            class="feed-oportunidade-label"
                        >
                            OPORTUNIDADE
                        </span>

                    </div>

                </div>


                <span
                    class="feed-oportunidade-icon"
                    aria-hidden="true"
                >
                    ${criarIcone("oportunidade")}
                </span>

            </div>


            <div
                class="feed-oportunidade-content"
            >

                <h2
                    class="feed-oportunidade-titulo"
                >
                    ${escaparHTML(titulo)}
                </h2>


                ${
                    tipoArtista
                        ? `
                            <div
                                class="feed-oportunidade-tipo"
                            >

                                <span
                                    class="feed-oportunidade-tipo-label"
                                >
                                    Procurando
                                </span>

                                <strong
                                    class="feed-oportunidade-tipo-artista"
                                >
                                    ${escaparHTML(
                                        tipoArtista
                                    )}
                                </strong>

                            </div>
                        `
                        : ""
                }


                <div
                    class="feed-oportunidade-informacoes"
                >

                    ${
                        data || horario
                            ? `
                                <div
                                    class="feed-oportunidade-informacao"
                                >

                                    <span
                                        class="feed-oportunidade-informacao-icon"
                                        aria-hidden="true"
                                    >
                                        ${criarIcone(
                                            "calendario"
                                        )}
                                    </span>

                                    <span>
                                        ${
                                            data
                                                ? escaparHTML(data)
                                                : ""
                                        }

                                        ${
                                            data && horario
                                                ? " · "
                                                : ""
                                        }

                                        ${
                                            horario
                                                ? escaparHTML(
                                                    horario
                                                )
                                                : ""
                                        }
                                    </span>

                                </div>
                            `
                            : ""
                    }


                    ${
                        local
                            ? `
                                <div
                                    class="feed-oportunidade-informacao"
                                >

                                    <span
                                        class="feed-oportunidade-informacao-icon"
                                        aria-hidden="true"
                                    >
                                        ${criarIcone(
                                            "localizacao"
                                        )}
                                    </span>

                                    <span>
                                        ${escaparHTML(
                                            local
                                        )}
                                    </span>

                                </div>
                            `
                            : ""
                    }


                    ${
                        valor
                            ? `
                                <div
                                    class="feed-oportunidade-informacao feed-oportunidade-valor"
                                >

                                    <span
                                        class="feed-oportunidade-informacao-icon"
                                        aria-hidden="true"
                                    >
                                        ${criarIcone(
                                            "valor"
                                        )}
                                    </span>

                                    <span>
                                        Cachê
                                        <strong>
                                            ${escaparHTML(
                                                valor
                                            )}
                                        </strong>

                                    </span>

                                </div>
                            `
                            : ""
                    }

                </div>


                ${
                    blocoEstilos ||
                    blocoInstrumentos
                        ? `
                            <div
                                class="feed-oportunidade-preferencias"
                            >

                                ${blocoEstilos}

                                ${blocoInstrumentos}

                            </div>
                        `
                        : ""
                }

            </div>


            <div
                class="feed-oportunidade-footer"
            >

                <button
                    type="button"
                    class="feed-oportunidade-interesse"
                    data-acao-interesse
                    aria-pressed="${
                        ehInteressado
                            ? "true"
                            : "false"
                    }"
                    aria-label="${
                        ehInteressado
                            ? "Você já demonstrou interesse nesta oportunidade"
                            : "Tenho interesse nesta oportunidade"
                    }"
                    ${
                        ehProprietario
                            ? `
                                disabled
                                aria-disabled="true"
                                title="Você publicou esta oportunidade"
                            `
                            : ""
                    }
                >

                    <span
                        class="feed-oportunidade-interesse-icon"
                        aria-hidden="true"
                    >
                        ${criarIcone(
                            ehInteressado
                                ? "interesseAtivo"
                                : "interesse"
                        )}
                    </span>

                    <span
                        data-interesse-texto
                    >
                        ${
                            ehInteressado
                                ? "Interesse enviado"
                                : "Tenho interesse"
                        }
                    </span>

                </button>


                ${criarAreaInteressados(
                    oportunidade
                )}


                ${criarAreaVisualizacoes(
                    oportunidade
                )}

            </div>

        `;


        /* =================================================
           GUARDAR DADOS NO CARD
        ================================================= */

        card.__musicalWorldOportunidade =
            oportunidade;


        /* =================================================
           EVENTO — TENHO INTERESSE

           O main.js decide se deve inserir ou remover
           o interesse no Supabase.
        ================================================= */

        const botaoInteresse =
            card.querySelector(
                "[data-acao-interesse]"
            );


        if (
            botaoInteresse &&
            !ehProprietario
        ) {

            botaoInteresse.addEventListener(
                "click",
                function (evento) {

                    if (
                        oportunidade._ehProprietario ===
                        true
                    ) {

                        evento.preventDefault();

                        evento.stopPropagation();

                        return;

                    }


                    evento.preventDefault();

                    evento.stopPropagation();


                    const eventoInteresse =
                        new CustomEvent(
                            "musicalworld:interesse-oportunidade",
                            {
                                bubbles: true,

                                detail: {

                                    oportunidade,

                                    card

                                }

                            }
                        );


                    card.dispatchEvent(
                        eventoInteresse
                    );

                }
            );

        }


        /* =================================================
           FALLBACK DA FOTO DO PUBLICADOR
        ================================================= */

        const avatarPublicador =
            card.querySelector(
                ".feed-oportunidade-publicador-avatar"
            );


        const imagemPublicador =
            avatarPublicador
                ? avatarPublicador.querySelector("img")
                : null;


        if (
            avatarPublicador &&
            imagemPublicador
        ) {

            imagemPublicador.addEventListener(
                "error",
                function () {

                    const nome =
                        obterTexto(
                            oportunidade.publicadorNome,
                            oportunidade.estabelecimentoNome ||
                            "Usuário"
                        );


                    avatarPublicador.innerHTML =
                        escaparHTML(
                            obterIniciais(nome)
                        );


                    avatarPublicador.classList.add(
                        "feed-oportunidade-publicador-avatar-inicial"
                    );

                },
                {
                    once: true
                }
            );

        }


        /* =================================================
           NAVEGAÇÃO DO CARD

           O card inteiro abre a oportunidade.

           O botão "Tenho interesse" fica fora dessa ação.

           A página correta do módulo de oportunidades é:
           oportunidades.html
        ================================================= */

        card.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target.closest(
                        "[data-acao-interesse]"
                    )
                ) {

                    return;

                }


                const oportunidadeId =
                    oportunidade.id;


                if (
                    oportunidadeId === undefined ||
                    oportunidadeId === null
                ) {

                    return;

                }


                window.location.href =
                    `oportunidades.html?id=${encodeURIComponent(
                        oportunidadeId
                    )}`;

            }
        );


        return card;

    }


    /* =====================================================
       API PÚBLICA
    ===================================================== */

    window.MusicalWorldAnuncioOportunidade = {

        criar,

        formatarData,

        formatarHorario,

        formatarValor,

        atualizarContadorVisualizacoes,

        atualizarEstadoInteresse,

        atualizarContadorInteressados

    };


})(window);