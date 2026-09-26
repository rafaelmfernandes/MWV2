/* =========================================================
   MUSICALWORLD — ACOMPANHAMENTO DA CONTRATAÇÃO — RENDER

   Arquivo:
   js/contratacao/acompanhamento/contratacao-acompanhamento-render.js

   Responsabilidades:
   - Atualizar a interface.
   - Renderizar relação.
   - Renderizar participante.
   - Renderizar serviço.
   - Renderizar evento.
   - Renderizar status.
   - Atualizar timeline.
   - Renderizar pagamento.
   - Renderizar ações.
   - Renderizar estado de erro.

   Este arquivo não altera diretamente a contratação
   no Supabase.
   ========================================================= */

(function (window) {

    "use strict";


    const modulo =
        window.MusicalWorldContratacaoAcompanhamentoInterno;


    if (!modulo) {

        console.error(
            "MusicalWorldContratacaoAcompanhamento: módulo de dados não carregado."
        );

        return;
    }


    const {
        estado,
        obterElemento,
        obterIniciais,
        extrairCidade,
        formatarMoeda,
        formatarData,
        formatarHorario,
        formatarLocal,
        pagamentoJaFoiLiberado
    } = modulo;


    /* =====================================================
       ATUALIZAR ÍCONES
       ===================================================== */

    function atualizarIcones() {

        if (
            window.lucide &&
            typeof window.lucide.createIcons ===
                "function"
        ) {

            window.lucide.createIcons();
        }
    }


    /* =====================================================
       IDENTIFICAR CONTRATAÇÃO DE OPORTUNIDADE
       ===================================================== */

    function ehContratacaoDeOportunidade(
        dados
    ) {

        return Boolean(
            dados &&
            dados.oportunidadeId
        );
    }


    /* =====================================================
       IDENTIFICAR PROPOSTA ACEITA AGUARDANDO PAGAMENTO
       ===================================================== */

    function ehPropostaAceitaAguardandoPagamento(
        dados
    ) {

        if (!dados) {

            return false;
        }


        return (
            ehContratacaoDeOportunidade(
                dados
            ) &&

            dados.status ===
                "confirmada" &&

            String(
                dados.pagamento?.status ||
                ""
            )
                .toLowerCase()
                .trim() ===
                "pendente"
        );
    }


    /* =====================================================
       ATUALIZAR ÍCONE DE PAGAMENTO
       ===================================================== */

    function atualizarIconePagamento(
        icone
    ) {

        if (!icone) {

            return;
        }


        icone.setAttribute(
            "data-lucide",
            "wallet"
        );


        atualizarIcones();
    }


    /* =====================================================
       RENDERIZAR RELAÇÃO
       ===================================================== */

    function renderizarRelacao(dados) {

        const titulo =
            obterElemento("relacaoTitulo");

        const descricao =
            obterElemento("relacaoDescricao");

        const paginaTitulo =
            obterElemento("paginaTitulo");

        const paginaDescricao =
            obterElemento("paginaDescricao");

        const participanteEyebrow =
            obterElemento("participanteEyebrow");

        const participanteTitulo =
            obterElemento("participanteTitulo");

        const timelineTitulo =
            obterElemento("timelineArtistaTitulo");

        const timelineDescricao =
            obterElemento("timelineArtistaDescricao");


        const propostaAguardandoPagamento =
            ehPropostaAceitaAguardandoPagamento(
                dados
            );


        if (
            dados.direcao ===
            "recebida"
        ) {

            if (titulo) {

                if (
                    propostaAguardandoPagamento
                ) {

                    titulo.textContent =
                        "Proposta aceita";

                } else {

                    titulo.textContent =
                        "Solicitação recebida";
                }
            }


            if (descricao) {

                if (
                    propostaAguardandoPagamento
                ) {

                    descricao.textContent =
                        "Você aceitou a proposta da oportunidade. O contratante precisa realizar o pagamento para continuar a contratação.";

                } else if (
                    dados.status === "concluida" ||
                    dados.status === "pagamento"
                ) {

                    descricao.textContent =
                        "A contratação foi concluída e o pagamento foi liberado.";

                } else if (
                    dados.status === "em_andamento"
                ) {

                    descricao.textContent =
                        "O evento está em andamento conforme o combinado.";

                } else {

                    descricao.textContent =
                        "Você recebeu uma solicitação de contratação e precisa analisar os detalhes do evento.";
                }
            }


            if (paginaTitulo) {

                paginaTitulo.textContent =
                    "Solicitação de contratação";
            }


            if (paginaDescricao) {

                paginaDescricao.textContent =
                    "Confira os detalhes do evento e acompanhe o andamento da solicitação.";
            }


            if (participanteEyebrow) {

                participanteEyebrow.textContent =
                    "Contratante";
            }


            if (participanteTitulo) {

                participanteTitulo.textContent =
                    "Pessoa que solicitou o serviço";
            }


            if (timelineTitulo) {

                if (
                    propostaAguardandoPagamento
                ) {

                    timelineTitulo.textContent =
                        "Proposta aceita";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "Você aceitou a proposta. O contratante precisa realizar o pagamento para continuar a contratação.";
                    }

                } else if (
                    dados.status === "concluida" ||
                    dados.status === "pagamento"
                ) {

                    timelineTitulo.textContent =
                        "Contratação concluída";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "O serviço foi realizado e o pagamento foi liberado.";
                    }

                } else if (
                    dados.status === "em_andamento"
                ) {

                    timelineTitulo.textContent =
                        "Evento em andamento";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "A contratação está sendo realizada conforme o combinado.";
                    }

                } else if (
                    dados.status === "confirmada"
                ) {

                    timelineTitulo.textContent =
                        "Contratação confirmada";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "Você aceitou a contratação e o evento está agendado.";
                    }

                } else {

                    timelineTitulo.textContent =
                        "Aguardando sua resposta";

                    if (timelineDescricao) {

                        timelineDescricao.textContent =
                            "Analise a solicitação e confirme ou recuse a contratação.";
                    }
                }
            }


            return;
        }


        if (titulo) {

            if (
                propostaAguardandoPagamento
            ) {

                titulo.textContent =
                    "Proposta aceita";

            } else if (
                dados.status === "concluida" ||
                dados.status === "pagamento"
            ) {

                titulo.textContent =
                    "Contratação concluída";

            } else if (
                dados.status === "em_andamento"
            ) {

                titulo.textContent =
                    "Evento em andamento";

            } else {

                titulo.textContent =
                    "Contratação enviada";
            }
        }


        if (descricao) {

            if (
                propostaAguardandoPagamento
            ) {

                descricao.textContent =
                    "O artista aceitou sua proposta. Agora realize o pagamento para continuar com a contratação.";

            } else if (
                dados.status === "concluida" ||
                dados.status === "pagamento"
            ) {

                descricao.textContent =
                    "O serviço foi realizado e o pagamento foi liberado ao profissional.";

            } else if (
                dados.status === "em_andamento"
            ) {

                descricao.textContent =
                    "O evento está em andamento conforme o combinado.";

            } else if (
                dados.status === "confirmada"
            ) {

                descricao.textContent =
                    "O artista aceitou sua solicitação e o evento está agendado.";

            } else {

                descricao.textContent =
                    "Você enviou esta solicitação para o profissional.";
            }
        }


        if (paginaTitulo) {

            paginaTitulo.textContent =
                "Sua contratação";
        }


        if (paginaDescricao) {

            paginaDescricao.textContent =
                "Acompanhe cada etapa até a realização do evento.";
        }


        if (participanteEyebrow) {

            participanteEyebrow.textContent =
                "Artista";
        }


        if (participanteTitulo) {

            participanteTitulo.textContent =
                "Profissional contratado";
        }


        if (timelineTitulo) {

            if (
                propostaAguardandoPagamento
            ) {

                timelineTitulo.textContent =
                    "Proposta aceita pelo artista";

                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O artista aceitou a proposta da oportunidade. Realize o pagamento para continuar com a contratação.";
                }

            } else if (
                dados.status === "em_andamento"
            ) {

                timelineTitulo.textContent =
                    "Evento em andamento";

                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O evento está sendo realizado conforme o combinado.";
                }

            } else if (
                dados.status === "concluida" ||
                dados.status === "pagamento"
            ) {

                timelineTitulo.textContent =
                    "Contratação concluída";

                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O serviço foi confirmado como realizado e o pagamento foi liberado.";
                }

            } else if (
                dados.status === "confirmada"
            ) {

                timelineTitulo.textContent =
                    "Contratação confirmada";

                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O artista aceitou sua solicitação e a contratação está confirmada.";
                }

            } else {

                timelineTitulo.textContent =
                    "Aguardando o artista";

                if (timelineDescricao) {

                    timelineDescricao.textContent =
                        "O artista está analisando a solicitação.";
                }
            }
        }
    }


    /* =====================================================
       RENDERIZAR PARTICIPANTE
       ===================================================== */

    function renderizarParticipante(dados) {

        const pessoa =
            dados.direcao === "recebida"
                ? dados.contratante
                : dados.contratado;


        if (!pessoa) {

            return;
        }


        const urlPerfil =
            pessoa.perfilId
                ? `meu-perfil.html?id=${encodeURIComponent(
                    pessoa.perfilId
                )}`
                : null;


        function abrirPerfil() {

            if (!urlPerfil) {

                return;
            }


            window.location.href =
                urlPerfil;
        }


        const avatar =
            obterElemento("artistaAvatar");


        if (avatar) {

            avatar.innerHTML =
                "";


            if (pessoa.fotoUrl) {

                const imagem =
                    document.createElement(
                        "img"
                    );


                imagem.src =
                    pessoa.fotoUrl;


                imagem.alt =
                    pessoa.nome ||
                    "Usuário";


                imagem.loading =
                    "lazy";


                imagem.decoding =
                    "async";


                imagem.onerror =
                    function () {

                        avatar.innerHTML =
                            "";


                        avatar.textContent =
                            pessoa.iniciais ||
                            obterIniciais(
                                pessoa.nome
                            );
                    };


                avatar.appendChild(
                    imagem
                );

            } else {

                avatar.textContent =
                    pessoa.iniciais ||
                    obterIniciais(
                        pessoa.nome
                    );
            }


            if (urlPerfil) {

                avatar.style.cursor =
                    "pointer";


                avatar.setAttribute(
                    "role",
                    "link"
                );


                avatar.setAttribute(
                    "tabindex",
                    "0"
                );


                avatar.setAttribute(
                    "aria-label",
                    `Abrir perfil de ${
                        pessoa.nome ||
                        "usuário"
                    }`
                );


                avatar.onclick =
                    function () {

                        abrirPerfil();
                    };


                avatar.onkeydown =
                    function (evento) {

                        if (
                            evento.key === "Enter" ||
                            evento.key === " "
                        ) {

                            evento.preventDefault();

                            abrirPerfil();
                        }
                    };
            }
        }


        const nome =
            obterElemento("artistaNome");


        if (nome) {

            nome.textContent =
                pessoa.nome ||
                "Usuário";


            if (urlPerfil) {

                nome.style.cursor =
                    "pointer";


                nome.setAttribute(
                    "role",
                    "link"
                );


                nome.setAttribute(
                    "tabindex",
                    "0"
                );


                nome.setAttribute(
                    "aria-label",
                    `Abrir perfil de ${
                        pessoa.nome ||
                        "usuário"
                    }`
                );


                nome.onclick =
                    function () {

                        abrirPerfil();
                    };


                nome.onkeydown =
                    function (evento) {

                        if (
                            evento.key === "Enter" ||
                            evento.key === " "
                        ) {

                            evento.preventDefault();

                            abrirPerfil();
                        }
                    };
            }
        }


        const tipo =
            obterElemento("artistaTipo");


        if (tipo) {

            tipo.textContent =
                pessoa.tipo ||
                "Usuário";
        }


        const localizacao =
            obterElemento("artistaLocalizacao");


        if (localizacao) {

            if (
                typeof pessoa.localizacao ===
                "string"
            ) {

                localizacao.textContent =
                    pessoa.localizacao ||
                    "Localização não informada";

            } else {

                localizacao.textContent =
                    extrairCidade(
                        pessoa.localizacao
                    ) ||
                    "Localização não informada";
            }
        }
    }


    /* =====================================================
       RENDERIZAR SERVIÇO
       ===================================================== */

    function renderizarServico(servico) {

        const nome =
            obterElemento("servicoNome");

        const valor =
            obterElemento("servicoValor");

        const duracao =
            obterElemento("servicoDuracao");

        const localizacao =
            obterElemento("servicoLocalizacao");


        if (!servico) {

            if (nome) {

                nome.textContent =
                    "Serviço contratado";
            }


            if (valor) {

                valor.textContent =
                    "R$ 0,00";
            }


            if (duracao) {

                duracao.textContent =
                    "Não informado";
            }


            if (localizacao) {

                localizacao.textContent =
                    "Não informado";
            }


            return;
        }


        if (nome) {

            nome.textContent =
                servico.nome ||
                "Serviço";
        }


        if (valor) {

            valor.textContent =
                formatarMoeda(
                    servico.valor
                );
        }


        if (duracao) {

            duracao.textContent =
                servico.duracao ||
                "Não informado";
        }


        if (localizacao) {

            localizacao.textContent =
                servico.localizacao ||
                "Não informado";
        }
    }


    /* =====================================================
       RENDERIZAR EVENTO
       ===================================================== */

    function renderizarEvento(dados) {

        const data =
            obterElemento("dataEvento");


        if (data) {

            data.textContent =
                formatarData(
                    dados.data
                );
        }


        const horario =
            obterElemento("horarioEvento");


        if (horario) {

            horario.textContent =
                formatarHorario(
                    dados
                );
        }


        const local =
            obterElemento("localEvento");


        if (local) {

            local.textContent =
                formatarLocal(
                    dados.local
                );
        }


        const tipo =
            obterElemento("tipoEvento");


        if (tipo) {

            tipo.textContent =
                dados.tipoEvento ||
                "Não informado";
        }


        const quantidade =
            obterElemento("quantidadePessoas");

        const quantidadeContainer =
            obterElemento(
                "quantidadePessoasContainer"
            );


        if (quantidade) {

            if (
                dados.quantidadePessoas
            ) {

                quantidade.textContent =
                    Number(
                        dados.quantidadePessoas
                    ).toLocaleString(
                        "pt-BR"
                    ) +
                    " pessoas";


                if (quantidadeContainer) {

                    quantidadeContainer.hidden =
                        false;
                }

            } else {

                if (quantidadeContainer) {

                    quantidadeContainer.hidden =
                        true;
                }
            }
        }


        const observacoes =
            obterElemento("observacoesEvento");


        if (observacoes) {

            observacoes.textContent =
                dados.observacoes ||
                "Nenhuma observação adicionada.";
        }
    }


    /* =====================================================
       RENDERIZAR STATUS PRINCIPAL
       ===================================================== */

    function renderizarStatusPrincipal(status) {

        const elementoStatus =
            obterElemento("statusAtual");

        const elementoDescricao =
            obterElemento("statusDescricao");

        const elementoIcone =
            obterElemento("statusPrincipalIcon");


        const recebida =
            estado.direcao === "recebida";


        const dados =
            estado.dados;


        const propostaAguardandoPagamento =
            ehPropostaAceitaAguardandoPagamento(
                dados
            );


        const configuracoes = {

            rascunho: {

                titulo:
                    "Rascunho",

                descricao:
                    "A contratação ainda não foi enviada.",

                icone:
                    "file-edit"
            },


            aguardando_artista: {

                titulo:
                    recebida
                        ? "Aguardando sua resposta"
                        : "Aguardando confirmação do artista",

                descricao:
                    recebida
                        ? "Você recebeu esta solicitação e precisa analisar os detalhes antes de aceitar ou recusar."
                        : "O artista precisa analisar sua solicitação antes de confirmar a contratação.",

                icone:
                    "clock-3"
            },


            confirmada: {

                titulo:
                    propostaAguardandoPagamento
                        ? "Proposta aceita — aguardando pagamento"
                        : "Contratação confirmada",

                descricao:
                    propostaAguardandoPagamento
                        ? (
                            recebida
                                ? "Você aceitou a proposta. O contratante precisa realizar o pagamento para continuar a contratação."
                                : "O artista aceitou sua proposta. Agora realize o pagamento para continuar com a contratação."
                        )
                        : (
                            recebida
                                ? "Você confirmou a contratação e o evento está agendado."
                                : "O artista aceitou sua solicitação e a contratação está confirmada."
                        ),

                icone:
                    propostaAguardandoPagamento
                        ? "wallet"
                        : "circle-check"
            },


            em_andamento: {

                titulo:
                    "Evento em andamento",

                descricao:
                    recebida
                        ? "O evento está sendo realizado conforme o combinado."
                        : "O evento está em andamento. Após a confirmação do serviço, a contratação será concluída.",

                icone:
                    "calendar-check"
            },


            concluida: {

                titulo:
                    "Contratação concluída",

                descricao:
                    "O serviço foi confirmado como realizado e o pagamento foi liberado ao profissional.",

                icone:
                    "check-check"
            },


            pagamento: {

                titulo:
                    "Pagamento liberado",

                descricao:
                    recebida
                        ? "O contratante liberou o pagamento. O valor agora está disponível no seu financeiro."
                        : "O pagamento foi liberado ao profissional.",

                icone:
                    "badge-check"
            },


            cancelada: {

                titulo:
                    "Contratação cancelada",

                descricao:
                    "Esta contratação foi cancelada.",

                icone:
                    "circle-x"
            },


            recusada: {

                titulo:
                    "Solicitação recusada",

                descricao:
                    recebida
                        ? "Você recusou esta solicitação de contratação."
                        : "O profissional recusou esta solicitação.",

                icone:
                    "circle-x"
            }
        };


        const configuracao =
            configuracoes[status] ||
            configuracoes.aguardando_artista;


        if (elementoStatus) {

            elementoStatus.textContent =
                configuracao.titulo;
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                configuracao.descricao;
        }


        if (elementoIcone) {

            elementoIcone.setAttribute(
                "data-lucide",
                configuracao.icone
            );
        }


        atualizarIcones();
    }


    /* =====================================================
       ATUALIZAR TIMELINE
       ===================================================== */

    function atualizarTimeline(status) {

        const itens =
            document.querySelectorAll(
                ".timeline-item"
            );


        if (!itens.length) {

            return;
        }


        let indiceAtual =
            1;


        switch (status) {

            case "rascunho":

                indiceAtual =
                    0;

                break;


            case "aguardando_artista":

                indiceAtual =
                    1;

                break;


            case "confirmada":

                indiceAtual =
                    2;

                break;


            case "em_andamento":

                indiceAtual =
                    3;

                break;


            case "concluida":

                indiceAtual =
                    5;

                break;


            case "pagamento":

                indiceAtual =
                    5;

                break;


            case "cancelada":
            case "recusada":

                indiceAtual =
                    1;

                break;


            default:

                indiceAtual =
                    1;

                break;
        }


        itens.forEach(
            function (item, indice) {

                item.classList.remove(
                    "concluido"
                );


                item.classList.remove(
                    "ativo"
                );


                const marker =
                    item.querySelector(
                        ".timeline-marker"
                    );


                if (!marker) {

                    return;
                }


                if (
                    status === "cancelada" ||
                    status === "recusada"
                ) {

                    if (
                        indice === 0
                    ) {

                        item.classList.add(
                            "concluido"
                        );


                        marker.innerHTML =
                            '<i data-lucide="check"></i>';

                    } else if (
                        indice === 1
                    ) {

                        item.classList.add(
                            "ativo"
                        );


                        marker.innerHTML =
                            '<i data-lucide="circle-x"></i>';

                    } else {

                        marker.innerHTML =
                            '<i data-lucide="circle"></i>';
                    }


                    return;
                }


                if (
                    indice <=
                    indiceAtual
                ) {

                    item.classList.add(
                        "concluido"
                    );


                    marker.innerHTML =
                        '<i data-lucide="check"></i>';


                    return;
                }


                marker.innerHTML =
                    '<i data-lucide="circle"></i>';
            }
        );


        /*
         * Em uma oportunidade confirmada e ainda pendente
         * de pagamento, a etapa de confirmação já aconteceu,
         * mas o próximo passo é financeiro.
         *
         * O índice da timeline continua em "confirmada",
         * evitando apresentar o evento como se já estivesse
         * pronto para realização.
         */

        if (
            status === "confirmada" &&
            ehPropostaAceitaAguardandoPagamento(
                estado.dados
            )
        ) {

            const itemConfirmada =
                document.querySelector(
                    '.timeline-item[data-status="confirmada"]'
                );


            if (itemConfirmada) {

                const titulo =
                    itemConfirmada.querySelector(
                        "#timelineConfirmadaTitulo"
                    );


                const descricao =
                    itemConfirmada.querySelector(
                        "#timelineConfirmadaDescricao"
                    );


                if (titulo) {

                    titulo.textContent =
                        "Proposta aceita";
                }


                if (descricao) {

                    descricao.textContent =
                        estado.direcao === "enviada"
                            ? "O artista aceitou a proposta. Realize o pagamento para continuar com a contratação."
                            : "A proposta foi aceita. O contratante precisa realizar o pagamento para continuar.";
                }
            }
        }


        atualizarIcones();
    }


    /* =====================================================
       RENDERIZAR PAGAMENTO
       ===================================================== */

    function renderizarPagamento(pagamento) {

        const elementoStatus =
            obterElemento("pagamentoStatus");

        const elementoDescricao =
            obterElemento("pagamentoDescricao");

        const elementoIcone =
            document.querySelector(
                "#pagamentoCard .pagamento-icon i"
            );


        const status =
            String(
                pagamento?.status ||
                ""
            )
                .toLowerCase()
                .trim();


        const metodo =
            String(
                pagamento?.metodo ||
                ""
            )
                .toLowerCase()
                .trim();


        if (
            estado.statusAtual === "confirmada" &&
            ehPropostaAceitaAguardandoPagamento(
                estado.dados
            )
        ) {

            if (elementoStatus) {

                elementoStatus.textContent =
                    "Pagamento pendente";
            }


            if (elementoDescricao) {

                if (
                    estado.direcao === "enviada"
                ) {

                    elementoDescricao.textContent =
                        "O artista aceitou sua proposta. Agora realize o pagamento para confirmar a contratação e continuar o fluxo.";

                } else {

                    elementoDescricao.textContent =
                        "O contratante ainda precisa realizar o pagamento para que a contratação possa continuar.";
                }
            }


            atualizarIconePagamento(
                elementoIcone
            );


            return;
        }


        if (
            estado.statusAtual === "concluida" ||
            estado.statusAtual === "pagamento" ||
            pagamentoJaFoiLiberado()
        ) {

            if (elementoStatus) {

                elementoStatus.textContent =
                    "Pagamento liberado";
            }


            if (elementoDescricao) {

                if (
                    estado.direcao === "recebida"
                ) {

                    elementoDescricao.textContent =
                        "O contratante confirmou a realização do serviço. O valor foi liberado e está disponível no seu financeiro.";

                } else {

                    elementoDescricao.textContent =
                        "O serviço foi confirmado como realizado e o pagamento foi liberado ao profissional.";
                }
            }


            return;
        }


        if (
            status.includes("pago") ||
            status.includes("aprovado") ||
            status.includes("simulacao") ||
            status.includes("simulação")
        ) {

            if (elementoStatus) {

                elementoStatus.textContent =
                    (
                        status.includes("simulacao") ||
                        status.includes("simulação")
                    )
                        ? "Pagamento simulado"
                        : "Pagamento processado";
            }


            if (elementoDescricao) {

                if (
                    estado.direcao === "recebida"
                ) {

                    elementoDescricao.textContent =
                        "O pagamento foi realizado pelo contratante e permanece aguardando a conclusão do serviço.";

                } else if (
                    metodo === "pix"
                ) {

                    elementoDescricao.textContent =
                        "O pagamento via Pix foi associado à contratação e será liberado após a confirmação da realização do serviço.";

                } else {

                    elementoDescricao.textContent =
                        "O pagamento está associado à contratação e será liberado após a confirmação da realização do serviço.";
                }
            }


            return;
        }


        if (elementoStatus) {

            elementoStatus.textContent =
                "Pagamento aguardando atualização";
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                "As informações de pagamento serão atualizadas conforme o andamento da contratação.";
        }
    }


    /* =====================================================
       ATUALIZAR TEXTO DO BLOCO DE CONCLUSÃO
       ===================================================== */

    function atualizarTextoAcaoConclusao(
        container,
        titulo,
        descricao
    ) {

        if (!container) {

            return;
        }


        const elementosTexto =
            container.querySelectorAll(
                "h2, h3, h4, strong, p"
            );


        if (!elementosTexto.length) {

            return;
        }


        let tituloEncontrado =
            false;


        elementosTexto.forEach(
            function (elemento) {

                const tag =
                    elemento.tagName.toLowerCase();


                if (
                    (
                        tag === "h2" ||
                        tag === "h3" ||
                        tag === "h4" ||
                        tag === "strong"
                    ) &&
                    !tituloEncontrado
                ) {

                    elemento.textContent =
                        titulo;

                    tituloEncontrado =
                        true;

                    return;
                }


                if (
                    tag === "p"
                ) {

                    elemento.textContent =
                        descricao;
                }
            }
        );
    }


    /* =====================================================
       RENDERIZAR AÇÃO DE PAGAMENTO DA OPORTUNIDADE

       Utilizamos a estrutura pagamentoAcao que já existe
       no HTML para não criar uma segunda área de pagamento.
       ===================================================== */

    function renderizarAcaoPagamento(
        dados
    ) {

        const container =
            obterElemento("pagamentoAcao");

        const botao =
            obterElemento(
                "btnLiberarPagamento"
            );

        const status =
            obterElemento(
                "pagamentoAcaoStatus"
            );


        if (!container) {

            return;
        }


        const deveExibir =
            ehPropostaAceitaAguardandoPagamento(
                dados
            ) &&
            dados.direcao ===
                "enviada";


        container.hidden =
            !deveExibir;


        if (!deveExibir) {

            if (botao) {

                botao.disabled =
                    true;

                botao.dataset.acao =
                    "";
            }


            return;
        }


        if (status) {

            status.textContent =
                "O artista aceitou sua proposta. Realize o pagamento para continuar com a contratação.";
        }


        const titulo =
            container.querySelector(
                "h2"
            );


        if (titulo) {

            titulo.textContent =
                "Pagamento necessário";
        }


        if (botao) {

            botao.disabled =
                false;


            botao.dataset.acao =
                "realizar-pagamento";


            botao.innerHTML =
                `
                <span>
                    Realizar pagamento
                </span>

                <i data-lucide="wallet"></i>
                `;
        }


        atualizarIcones();
    }


    /* =====================================================
       RENDERIZAR AÇÕES DE CONCLUSÃO
       ===================================================== */

    function renderizarAcoesConclusao(dados) {

        const container =
            obterElemento("acoesConclusao");

        const botao =
            obterElemento(
                "btnConcluirContratacao"
            );


        if (!container) {

            return;
        }


        const ehContratante =
            dados &&
            dados.direcao === "enviada";


        const pagamentoPendente =
            ehPropostaAceitaAguardandoPagamento(
                dados
            );


        const podeSimularEvento =
            ehContratante &&
            dados.status === "confirmada" &&
            !pagamentoPendente &&
            !estado.simulandoEvento;


        const podeConcluir =
            ehContratante &&
            dados.status === "em_andamento" &&
            !estado.concluindoContratacao;


        const deveExibir =
            podeSimularEvento ||
            podeConcluir;


        container.hidden =
            !deveExibir;


        if (!botao) {

            return;
        }


        botao.disabled =
            !deveExibir;


        if (podeSimularEvento) {

            atualizarTextoAcaoConclusao(
                container,
                "O evento já aconteceu?",
                "Como estamos em modo de simulação, registre o evento como realizado para continuar."
            );


            botao.innerHTML =
                `
                <i data-lucide="calendar-check"></i>
                Simular evento realizado
                `;


            botao.dataset.acao =
                "simular-evento";

        } else if (podeConcluir) {

            atualizarTextoAcaoConclusao(
                container,
                "O serviço foi realizado?",
                "Confirme a realização do serviço para concluir a contratação e liberar o pagamento ao profissional."
            );


            botao.innerHTML =
                `
                <i data-lucide="circle-check"></i>
                Confirmar serviço realizado
                `;


            botao.dataset.acao =
                "concluir-contratacao";

        } else {

            botao.dataset.acao =
                "";
        }


        atualizarIcones();
    }


    /* =====================================================
       RENDERIZAR AÇÕES
       ===================================================== */

    function renderizarAcoes(dados) {

        const container =
            obterElemento("acoesSolicitacao");


        if (container) {

            const deveExibir =
                dados &&
                dados.direcao === "recebida" &&
                dados.status === "aguardando_artista";


            container.hidden =
                !deveExibir;
        }


        renderizarAcoesConclusao(
            dados
        );


        renderizarAcaoPagamento(
            dados
        );
    }


    /* =====================================================
       OCULTAR LIBERAÇÃO LEGADA

       Mantemos a função pública para compatibilidade com
       o restante do acompanhamento.

       Agora ela também atualiza a ação específica de
       pagamento de oportunidade.
       ===================================================== */

    function renderizarAcaoLiberacaoPagamento(
        dados
    ) {

        renderizarAcaoPagamento(
            dados
        );
    }


    /* =====================================================
       RENDERIZAR ERRO
       ===================================================== */

    function renderizarErro(
        titulo,
        descricao
    ) {

        const status =
            obterElemento("statusAtual");

        const elementoDescricao =
            obterElemento("statusDescricao");


        if (status) {

            status.textContent =
                titulo;
        }


        if (elementoDescricao) {

            elementoDescricao.textContent =
                descricao;
        }


        const card =
            obterElemento("relacaoCard");


        if (card) {

            card.hidden =
                true;
        }


        const acoes =
            obterElemento("acoesSolicitacao");


        if (acoes) {

            acoes.hidden =
                true;
        }


        const acoesConclusao =
            obterElemento("acoesConclusao");


        if (acoesConclusao) {

            acoesConclusao.hidden =
                true;
        }


        const pagamentoAcao =
            obterElemento("pagamentoAcao");


        if (pagamentoAcao) {

            pagamentoAcao.hidden =
                true;
        }
    }


    /* =====================================================
       EXPOR API DE RENDERIZAÇÃO
       ===================================================== */

    modulo.render = {

        atualizarIcones,

        renderizarRelacao,

        renderizarParticipante,

        renderizarServico,

        renderizarEvento,

        renderizarStatusPrincipal,

        atualizarTimeline,

        renderizarPagamento,

        renderizarAcoesConclusao,

        renderizarAcoes,

        renderizarAcaoLiberacaoPagamento,

        renderizarErro

    };


})(window);