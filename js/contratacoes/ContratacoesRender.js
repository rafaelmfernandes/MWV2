
/* =========================================================
   MUSICALWORLD — RENDERIZAÇÃO DA CENTRAL DE CONTRATAÇÕES

   Arquivo:
   js/contratacoes/ContratacoesRender.js

   Responsabilidade:

   - Renderizar resumo.
   - Renderizar origem.
   - Renderizar status.
   - Renderizar cards.
   - Renderizar oportunidade para estabelecimento.
   - Renderizar lista.
   - Atualizar contador.
   - Atualizar filtros visuais.
   - Atualizar navegação visual.
   - Rolar automaticamente para a última oportunidade
     selecionada pelo artista.

   Este módulo NÃO busca dados no Supabase.

   Ele recebe o estado da Central através do controlador.
========================================================= */

(function (window) {

    "use strict";


    const Dados =
        window.MusicalWorldContratacoesDados;


    if (!Dados) {

        console.error(
            "MusicalWorld — ContratacoesDados.js não foi carregado."
        );

        return;

    }


    const CONFIG =
        Dados.CONFIG;


    function obterElemento(id) {

        return document.getElementById(id);

    }


    /* =====================================================
       STATUS DA INTERFACE
    ====================================================== */

    function obterStatusConfig(
        status,
        direcao,
        propostaEnviada,
        estado
    ) {

        const configuracoes = {

            aguardando_artista: {

                texto:
                    propostaEnviada
                        ? "Aguardando resposta do estabelecimento"
                        : direcao === "recebida"
                            ? "Aguardando sua resposta"
                            : estado?.usuarioEhEstabelecimento
                                ? "Aguardando confirmação"
                                : "Aguardando resposta",

                classe:
                    "status-aguardando"

            },


            confirmada: {

                texto:
                    "Confirmada",

                classe:
                    "status-confirmada"

            },


            andamento: {

                texto:
                    "Em andamento",

                classe:
                    "status-andamento"

            },


            concluida: {

                texto:
                    "Concluída",

                classe:
                    "status-concluida"

            },


            cancelada: {

                texto:
                    "Cancelada",

                classe:
                    "status-cancelada"

            },


            recusada: {

                texto:
                    direcao === "recebida"
                        ? "Recusada por você"
                        : "Recusada",

                classe:
                    "status-recusada"

            },


            rascunho: {

                texto:
                    "Rascunho",

                classe:
                    "status-aguardando"

            }

        };


        return (
            configuracoes[status] ||
            configuracoes.aguardando_artista
        );

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo(
        contratacoes
    ) {

        const aguardando =
            contratacoes.filter(
                function (item) {

                    return (
                        item.status ===
                        "aguardando_artista"
                    );

                }
            ).length;


        const proximas =
            contratacoes.filter(
                function (item) {

                    return (
                        item.status ===
                            "confirmada" ||
                        item.status ===
                            "aguardando_artista"
                    );

                }
            ).length;


        const andamento =
            contratacoes.filter(
                function (item) {

                    return (
                        item.status ===
                        "andamento"
                    );

                }
            ).length;


        const historico =
            contratacoes.filter(
                function (item) {

                    return (
                        item.status ===
                            "concluida" ||
                        item.status ===
                            "cancelada" ||
                        item.status ===
                            "recusada"
                    );

                }
            ).length;


        const elementoAguardando =
            obterElemento(
                CONFIG.seletores
                    .resumoAguardando
            );


        const elementoProximas =
            obterElemento(
                CONFIG.seletores
                    .resumoProximas
            );


        const elementoAndamento =
            obterElemento(
                CONFIG.seletores
                    .resumoAndamento
            );


        const elementoHistorico =
            obterElemento(
                CONFIG.seletores
                    .resumoHistorico
            );


        if (elementoAguardando) {

            elementoAguardando.textContent =
                aguardando;

        }


        if (elementoProximas) {

            elementoProximas.textContent =
                proximas;

        }


        if (elementoAndamento) {

            elementoAndamento.textContent =
                andamento;

        }


        if (elementoHistorico) {

            elementoHistorico.textContent =
                historico;

        }

    }


    /* =====================================================
       ORIGEM
    ====================================================== */

    function obterDadosOrigem(
        contratacao
    ) {

        if (
            contratacao.origem ===
            "oportunidade"
        ) {

            return {

                classe:
                    "origem-oportunidade",

                icone:
                    "target",

                rotulo:
                    "Selecionado em oportunidade"

            };

        }


        if (
            contratacao.origem ===
            "solicitacao_recebida"
        ) {

            return {

                classe:
                    "origem-solicitacao",

                icone:
                    "inbox",

                rotulo:
                    "Solicitação recebida"

            };

        }


        if (
            contratacao.origem ===
            "contratacao_realizada"
        ) {

            return {

                classe:
                    "origem-realizada",

                icone:
                    "user-round-check",

                rotulo:
                    "Contratação realizada"

            };

        }


        return {

            classe:
                "origem-padrao",

            icone:
                "file-text",

            rotulo:
                "Contratação"

        };

    }


    /* =====================================================
       HORÁRIO
    ====================================================== */

    function montarTextoHorario(
        horarioInicio,
        horarioFim
    ) {

        const inicio =
            Dados.normalizarHorario(
                horarioInicio
            );


        const fim =
            Dados.normalizarHorario(
                horarioFim
            );


        if (
            inicio &&
            fim
        ) {

            return `${inicio} às ${fim}`;

        }


        if (
            inicio
        ) {

            return `${inicio} — término a definir`;

        }


        if (
            fim
        ) {

            return `Início a definir — ${fim}`;

        }


        return "A definir";

    }


    /* =====================================================
       AVATAR
    ====================================================== */

    function montarAvatar(
        pessoa
    ) {

        let html = `

            <span>
                ${Dados.escaparHtml(
                    pessoa?.iniciais ||
                    Dados.obterIniciais(
                        pessoa?.nome
                    )
                )}
            </span>

        `;


        if (
            pessoa?.fotoUrl
        ) {

            html = `

                <img
                    src="${Dados.escaparHtml(
                        pessoa.fotoUrl
                    )}"
                    alt=""
                    loading="lazy"
                >

            `;

        }


        return html;

    }


    /* =====================================================
       CARD DE OPORTUNIDADE — ESTABELECIMENTO
    ====================================================== */

    function renderizarCardOportunidadeEstabelecimento(
        contratacao,
        estado
    ) {

        const oportunidade =
            contratacao.oportunidade || {};


        const evento =
            contratacao.evento || {};


        const servico =
            contratacao.servico || {};


        const artistaSelecionado =
            contratacao.contratado || {};


        const status =
            obterStatusConfig(
                contratacao.status,
                contratacao.direcao,
                contratacao.propostaEnviada,
                estado
            );


        const tituloOportunidade =
            oportunidade.titulo ||
            "Oportunidade";


        const tipoBuscado =
            oportunidade.tipoArtista ||
            evento.tipo ||
            "Tipo de artista não informado";


        const nomeArtista =
            artistaSelecionado.nome ||
            "Artista não informado";


        /*
         * A localização do artista vem primeiro do perfil
         * artístico. Se não existir, usamos a cidade do evento.
         */

        const localizacaoArtista =
            artistaSelecionado.localizacao ||
            evento.cidade ||
            "";


        const avatar =
            montarAvatar(
                artistaSelecionado
            );


        const textoHorario =
            montarTextoHorario(
                evento.horarioInicio,
                evento.horarioFim
            );


        const textoAcao =
            contratacao.propostaRecebida ||
            contratacao.propostaEnviada
                ? "Ver proposta"
                : "Ver contratação";


        return `

            <article
                class="contratacao-card ${Dados.escaparHtml(
                    "origem-oportunidade"
                )} contratacao-card-oportunidade-estabelecimento"
                data-id="${Dados.escaparHtml(
                    contratacao.id
                )}"
                data-origem="${Dados.escaparHtml(
                    contratacao.origem
                )}"
                tabindex="0"
                role="button"
                aria-label="${Dados.escaparHtml(
                    `Oportunidade: ${tituloOportunidade}. Artista selecionado: ${nomeArtista}`
                )}"
            >

                <div class="contratacao-card-top oportunidade-estabelecimento-top">

                    <div class="oportunidade-estabelecimento-titulo">

                        <span class="oportunidade-titulo">

                            ${Dados.escaparHtml(
                                tituloOportunidade
                            )}

                        </span>

                    </div>


                    <span
                        class="status-badge ${status.classe}"
                    >

                        ${Dados.escaparHtml(
                            status.texto
                        )}

                    </span>

                </div>


                <div class="contratacao-conteudo">

                    <div class="contratacao-artista oportunidade-estabelecimento-artista">

                        <span class="info-label oportunidade-estabelecimento-artista-label">

                            Artista selecionado

                        </span>


                        <div class="artista-principal">

                            <div class="artista-avatar">

                                ${avatar}

                            </div>


                            <div class="artista-info">

                                <span class="artista-nome">

                                    ${Dados.escaparHtml(
                                        nomeArtista
                                    )}

                                </span>


                                ${
                                    localizacaoArtista
                                        ? `
                                            <span class="artista-tipo">

                                                ${Dados.escaparHtml(
                                                    localizacaoArtista
                                                )}

                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        </div>


                        <span class="contratacao-servico oportunidade-estabelecimento-buscando">

                            <span class="oportunidade-estabelecimento-buscando-label">

                                Buscando:

                            </span>

                            ${Dados.escaparHtml(
                                tipoBuscado
                            )}

                        </span>

                    </div>


                    <div class="contratacao-info">

                        <span class="info-label">

                            Data e horário

                        </span>


                        <span class="info-valor">

                            ${Dados.escaparHtml(
                                Dados.formatarData(
                                    evento.data
                                )
                            )}

                        </span>


                        <span class="info-secundario">

                            ${Dados.escaparHtml(
                                textoHorario
                            )}

                        </span>

                    </div>


                    <div class="contratacao-local">

                        <span class="info-label">

                            Local

                        </span>


                        <span class="info-valor">

                            ${Dados.escaparHtml(
                                evento.local ||
                                "Local não informado"
                            )}

                        </span>


                        <span class="info-secundario">

                            ${Dados.escaparHtml(
                                evento.cidade ||
                                ""
                            )}

                        </span>

                    </div>


                    <div class="contratacao-valor">

                        <span class="info-label">

                            Valor

                        </span>


                        <span class="valor-principal">

                            ${Dados.escaparHtml(
                                Dados.formatarMoeda(
                                    servico.valor
                                )
                            )}

                        </span>


                        <span class="valor-pagamento">

                            ${Dados.escaparHtml(
                                servico.duracao ||
                                ""
                            )}

                        </span>

                    </div>


                    <div class="contratacao-acao">

                        <button
                            type="button"
                            class="btn-ver-contratacao"
                            data-contratacao-id="${Dados.escaparHtml(
                                contratacao.id
                            )}"
                        >

                            <span>

                                ${Dados.escaparHtml(
                                    textoAcao
                                )}

                            </span>


                            <i
                                data-lucide="arrow-right"
                            ></i>

                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    /* =====================================================
       CARD NORMAL
    ====================================================== */

    function renderizarCardNormal(
        contratacao
    ) {

        const status =
            obterStatusConfig(
                contratacao.status,
                contratacao.direcao,
                contratacao.propostaEnviada
            );


        const pessoa =
            contratacao.pessoa || {};


        const servico =
            contratacao.servico || {};


        const evento =
            contratacao.evento || {};


        const oportunidade =
            contratacao.oportunidade || {};


        const origem =
            obterDadosOrigem(
                contratacao
            );


        const recebida =
            contratacao.direcao ===
            "recebida";


        const propostaRecebida =
            contratacao.propostaRecebida ===
            true;


        const propostaEnviada =
            contratacao.propostaEnviada ===
            true;


        const veioDeOportunidade =
            contratacao.origem ===
            "oportunidade";


        const pessoaPrincipal =
            veioDeOportunidade
                ? contratacao.contratante
                : pessoa;


        const avatarHtml =
            montarAvatar(
                pessoaPrincipal
            );


        let rotuloPessoa;


        if (
            veioDeOportunidade
        ) {

            rotuloPessoa =
                "Contratante";

        } else if (
            propostaRecebida
        ) {

            rotuloPessoa =
                "Proposta de";

        } else if (
            propostaEnviada
        ) {

            rotuloPessoa =
                "Estabelecimento";

        } else if (
            recebida
        ) {

            rotuloPessoa =
                "Contratante";

        } else {

            rotuloPessoa =
                "Artista";

        }


        const nomePessoa =
            pessoaPrincipal?.nome ||
            "Usuário";


        const nomePrincipal =
            veioDeOportunidade
                ? (
                    oportunidade.titulo ||
                    "Oportunidade"
                )
                : (
                    pessoa.nome ||
                    "Usuário"
                );


        const subtituloPrincipal =
            veioDeOportunidade
                ? (
                    contratacao.contratante?.nome ||
                    "Contratante"
                )
                : (
                    pessoa.tipo ||
                    "Usuário"
                );


        const textoHorario =
            montarTextoHorario(
                evento.horarioInicio,
                evento.horarioFim
            );


        const textoAcao =
            propostaRecebida ||
            propostaEnviada
                ? "Ver proposta"
                : "Ver contratação";


        const textoServico =
            veioDeOportunidade
                ? (
                    evento.tipo ||
                    oportunidade.tipoArtista ||
                    "Oportunidade"
                )
                : (
                    servico.nome ||
                    "Serviço"
                );


        return `

            <article
                class="contratacao-card ${Dados.escaparHtml(
                    origem.classe
                )}"
                data-id="${Dados.escaparHtml(
                    contratacao.id
                )}"
                data-origem="${Dados.escaparHtml(
                    contratacao.origem
                )}"
                tabindex="0"
                role="button"
                aria-label="${Dados.escaparHtml(
                    `${origem.rotulo}: ${nomePrincipal}`
                )}"
            >

                <div class="contratacao-card-top">

                    <div class="contratacao-origem ${Dados.escaparHtml(
                        origem.classe
                    )}">

                        <i
                            data-lucide="${Dados.escaparHtml(
                                origem.icone
                            )}"
                        ></i>

                        <span>
                            ${Dados.escaparHtml(
                                origem.rotulo
                            )}
                        </span>

                    </div>


                    <span
                        class="status-badge ${status.classe}"
                    >

                        ${Dados.escaparHtml(
                            status.texto
                        )}

                    </span>

                </div>


                <div class="contratacao-conteudo">

                    <div class="contratacao-artista">

                        <div class="artista-principal">

                            <div class="artista-avatar">

                                ${avatarHtml}

                            </div>


                            <div class="artista-info">

                                <span class="artista-nome">

                                    ${Dados.escaparHtml(
                                        nomePrincipal
                                    )}

                                </span>


                                <span class="artista-tipo">

                                    ${Dados.escaparHtml(
                                        subtituloPrincipal
                                    )}

                                </span>

                            </div>

                        </div>


                        <span class="contratacao-servico">

                            ${Dados.escaparHtml(
                                textoServico
                            )}

                        </span>

                    </div>


                    <div class="contratacao-info">

                        <span class="info-label">

                            ${Dados.escaparHtml(
                                rotuloPessoa
                            )}

                        </span>


                        <span class="info-valor">

                            ${Dados.escaparHtml(
                                nomePessoa
                            )}

                        </span>


                        <span class="info-secundario">

                            ${Dados.escaparHtml(
                                Dados.formatarData(
                                    evento.data
                                )
                            )}

                            <span class="info-separador">

                                •

                            </span>

                            ${Dados.escaparHtml(
                                textoHorario
                            )}

                        </span>

                    </div>


                    <div class="contratacao-local">

                        <span class="info-label">

                            Local

                        </span>


                        <span class="info-valor">

                            ${Dados.escaparHtml(
                                evento.local ||
                                "Local não informado"
                            )}

                        </span>


                        <span class="info-secundario">

                            ${Dados.escaparHtml(
                                evento.cidade ||
                                ""
                            )}

                        </span>

                    </div>


                    <div class="contratacao-valor">

                        <span class="info-label">

                            Valor

                        </span>


                        <span class="valor-principal">

                            ${Dados.escaparHtml(
                                Dados.formatarMoeda(
                                    servico.valor
                                )
                            )}

                        </span>


                        <span class="valor-pagamento">

                            ${Dados.escaparHtml(
                                servico.duracao ||
                                ""
                            )}

                        </span>

                    </div>


                    <div class="contratacao-acao">

                        <button
                            type="button"
                            class="btn-ver-contratacao"
                            data-contratacao-id="${Dados.escaparHtml(
                                contratacao.id
                            )}"
                        >

                            <span>

                                ${Dados.escaparHtml(
                                    textoAcao
                                )}

                            </span>


                            <i
                                data-lucide="arrow-right"
                            ></i>

                        </button>

                    </div>

                </div>

            </article>

        `;

    }


    /* =====================================================
       CARD PRINCIPAL
    ====================================================== */

    function renderizarCard(
        contratacao,
        estado
    ) {

        const veioDeOportunidade =
            contratacao.origem ===
            "oportunidade";


        if (
            veioDeOportunidade &&
            estado.usuarioEhEstabelecimento
        ) {

            return renderizarCardOportunidadeEstabelecimento(
                contratacao,
                estado
            );

        }


        return renderizarCardNormal(
            contratacao
        );

    }


    /* =====================================================
       CONTADOR
    ====================================================== */

    function atualizarContador(
        total
    ) {

        const elemento =
            obterElemento(
                CONFIG.seletores.contador
            );


        if (!elemento) {

            return;

        }


        elemento.textContent =
            total === 1
                ? "1 contratação"
                : `${total} contratações`;

    }


    /* =====================================================
       SCROLL PARA A ÚLTIMA OPORTUNIDADE
       
       Quando o artista abre "Fui selecionado", a lista
       já está filtrada somente pelas oportunidades em que
       ele foi selecionado.

       O último card renderizado é o destino do scroll.

       O comportamento é limitado a artistas para que a
       área "Minhas oportunidades" do estabelecimento
       permaneça exatamente como está.
    ====================================================== */

    function rolarParaUltimaOportunidadeSelecionada(
        estado
    ) {

        if (
            !estado ||
            estado.usuarioEhEstabelecimento ||
            estado.filtroAtual !== "oportunidades"
        ) {

            return;

        }


        const lista =
            obterElemento(
                CONFIG.seletores.lista
            );


        if (
            !lista ||
            lista.hidden
        ) {

            return;

        }


        const ultimaOportunidade =
            lista.lastElementChild;


        if (
            !ultimaOportunidade
        ) {

            return;

        }


        /*
         * requestAnimationFrame garante que o navegador
         * tenha concluído a atualização do DOM antes de
         * executar o movimento da página.
         */

        window.requestAnimationFrame(
            function () {

                ultimaOportunidade.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"

                });

            }
        );

    }


    /* =====================================================
       LISTA
    ====================================================== */

    function renderizarLista(
        estado
    ) {

        const lista =
            obterElemento(
                CONFIG.seletores.lista
            );


        const estadoVazio =
            obterElemento(
                CONFIG.seletores.estadoVazio
            );


        if (
            !lista ||
            !estadoVazio
        ) {

            return;

        }


        lista.innerHTML = "";


        const filtradas =
            estado.contratacoes

                .filter(
                    function (contratacao) {

                        return Dados.pertenceAoFiltro(
                            contratacao,
                            estado.filtroAtual
                        );

                    }
                )

                .filter(
                    function (contratacao) {

                        return Dados.correspondeBusca(
                            contratacao,
                            estado.buscaAtual
                        );

                    }
                );


        estado.contratacoesFiltradas =
            Dados.ordenarContratacoes(
                filtradas,
                estado.ordenacao
            );


        if (
            estado.contratacoesFiltradas.length ===
            0
        ) {

            lista.hidden = true;

            estadoVazio.hidden = false;


            const mensagem =
                obterElemento(
                    CONFIG.seletores
                        .estadoVazioMensagem
                );


            if (mensagem) {

                if (
                    estado.buscaAtual
                ) {

                    mensagem.textContent =
                        "Nenhuma contratação corresponde à sua busca.";

                } else if (
                    estado.filtroAtual ===
                    "oportunidades"
                ) {

                    mensagem.textContent =
                        "Você ainda não foi selecionado em nenhuma oportunidade.";

                } else if (
                    estado.filtroAtual ===
                    "recebidas"
                ) {

                    mensagem.textContent =
                        "Você ainda não possui solicitações recebidas.";

                } else if (
                    estado.filtroAtual ===
                    "enviadas"
                ) {

                    mensagem.textContent =
                        "Você ainda não possui solicitações enviadas.";

                } else {

                    mensagem.textContent =
                        "Você ainda não possui contratações ou solicitações recebidas.";

                }

            }


            atualizarContador(0);

            return;

        }


        lista.hidden = false;

        estadoVazio.hidden = true;


        lista.innerHTML =
            estado.contratacoesFiltradas

                .map(
                    function (contratacao) {

                        return renderizarCard(
                            contratacao,
                            estado
                        );

                    }
                )

                .join("");


        atualizarContador(
            estado.contratacoesFiltradas.length
        );


        if (
            window.lucide
        ) {

            window.lucide.createIcons();

        }


        /*
         * Depois que a lista de oportunidades foi criada,
         * posiciona o artista automaticamente no último
         * card selecionado.
         *
         * Não executa para estabelecimentos.
         */

        rolarParaUltimaOportunidadeSelecionada(
            estado
        );

    }


    /* =====================================================
       FILTRO VISUAL
    ====================================================== */

    function atualizarFiltroVisual(
        filtroAtual
    ) {

        const botoes =
            document.querySelectorAll(
                CONFIG.seletores.filtros
            );


        botoes.forEach(
            function (botao) {

                const ativo =
                    botao.dataset.filtro ===
                    filtroAtual;


                botao.classList.toggle(
                    "ativo",
                    ativo
                );

            }
        );

    }


    /* =====================================================
       CENTRAL VISUAL
    ====================================================== */

    function atualizarCentralVisual(
        centralArea
    ) {

        const botaoContratacoes =
            obterElemento(
                CONFIG.seletores
                    .btnCentralContratacoes
            );


        const botaoOportunidades =
            obterElemento(
                CONFIG.seletores
                    .btnCentralOportunidades
            );


        if (
            botaoContratacoes
        ) {

            const ativo =
                centralArea ===
                "contratacoes";


            botaoContratacoes.classList.toggle(
                "ativo",
                ativo
            );


            if (ativo) {

                botaoContratacoes.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                botaoContratacoes.removeAttribute(
                    "aria-current"
                );

            }

        }


        if (
            botaoOportunidades
        ) {

            const ativo =
                centralArea ===
                "oportunidades";


            botaoOportunidades.classList.toggle(
                "ativo",
                ativo
            );


            if (ativo) {

                botaoOportunidades.setAttribute(
                    "aria-current",
                    "page"
                );

            } else {

                botaoOportunidades.removeAttribute(
                    "aria-current"
                );

            }

        }

    }


    /* =====================================================
       API
    ====================================================== */

    window.MusicalWorldContratacoesRender = {

        obterStatusConfig,

        atualizarResumo,

        obterDadosOrigem,

        renderizarCard,

        renderizarLista,

        atualizarContador,

        atualizarFiltroVisual,

        atualizarCentralVisual,

        rolarParaUltimaOportunidadeSelecionada

    };

})(window);

