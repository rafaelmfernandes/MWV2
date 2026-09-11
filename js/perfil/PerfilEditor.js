const PerfilEditor = (() => {
"use strict";

/*

* ============================================================
* PERFIL EDITOR
* ============================================================
*
* Motor universal do editor de perfil.
*
* Responsabilidades:
* * sessão;
* * carregamento do usuário;
* * carregamento do perfil;
* * carregamento do perfil artístico;
* * identificação do tipo através do PerfilEditorTipo;
* * preenchimento do formulário;
* * integração do módulo de foto;
* * salvamento de Sobre;
* * integração dos módulos;
* * eventos gerais da página;
* * navegação;
*
* Não contém regras específicas de serviços,
* portfólio, agenda ou upload da foto.
  */

/*

* ============================================================
* NAVEGAÇÃO UNIVERSAL
* ============================================================
  */

const PAGINAS_EDITOR = {


"editar-perfil-cantor.html":
    "meu-perfil-cantor.html",

"editar-perfil-cantor-v2.html":
    "meu-perfil-cantor.html",

"editar-perfil-musico.html":
    "meu-perfil-musico.html",

"editar-perfil-banda.html":
    "meu-perfil-banda.html",

"editar-perfil-dupla.html":
    "meu-perfil-dupla.html",

"editar-perfil-dj.html":
    "meu-perfil-dj.html",

"editar-perfil-dancarino.html":
    "meu-perfil-dancarino.html",

"editar-perfil-grupo-danca.html":
    "meu-perfil-grupo-danca.html",

"editar-perfil-mc.html":
    "meu-perfil-mc.html",

"editar-perfil-compositor.html":
    "meu-perfil-compositor.html",

"editar-perfil-produtor-musical.html":
    "meu-perfil-produtor-musical.html",

"editar-perfil-contratante.html":
    "meu-perfil-contratante.html"


};

function obterPaginaAtual() {


const caminho =
    window.location.pathname || "";

const pagina =
    caminho
        .split("/")
        .pop()
        .toLowerCase()
        .trim();

return pagina;


}

function obterPaginaPerfil() {


const paginaAtual =
    obterPaginaAtual();

return (
    PAGINAS_EDITOR[paginaAtual] ||
    "meu-perfil-cantor.html"
);


}

const PAGINA_ATUAL =
obterPaginaAtual();

const PAGINA_PERFIL =
obterPaginaPerfil();

const CONFIG = {


paginaAtual:
    PAGINA_ATUAL,

paginaPerfil:
    PAGINA_PERFIL,

buckets: {

    foto:
        "perfil-musico",

    portfolio:
        "portfolio-musicos"

},

tabelas: {

    usuarios:
        "usuarios",

    perfis:
        "perfis",

    tiposPerfil:
        "tipos_perfil",

    perfisArtistas:
        "perfis_artistas"

}


};

const estado = {


usuarioAuth:
    null,

usuario:
    null,

perfil:
    null,

perfilArtista:
    null,

fotoArquivo:
    null,

salvando:
    false,

abaAtual:
    "sobre",

portfolio:
    [],

agenda:
    [],

tipoMedia:
    "imagem",

editandoPortfolioId:
    null,

editandoAgendaId:
    null,

servicosValores:
    [],

editandoServicoId:
    null


};

const ids = {


nome:
    "nome",

nomeExibicao:
    "nomeExibicao",

telefone:
    "telefone",

localizacao:
    "localizacao",

descricao:
    "descricao",

experiencia:
    "experiencia",

areaAtendimento:
    "areaAtendimento",

tipoArtista:
    "tipoArtista",

disponivel:
    "disponivel",

emailConta:
    "emailConta",

avatarImage:
    "avatarImage",

avatarInitials:
    "avatarInitials",

fotoInput:
    "fotoInput",

btnFoto:
    "btnFoto",

form:
    "formEditarPerfil",

btnSalvar:
    "btnSalvar",

btnSalvarTopo:
    "btnSalvarTopo",

btnVoltar:
    "btnVoltar",

btnCancelar:
    "btnCancelar",

contadorDescricao:
    "contadorDescricao",

portfolioTitulo:
    "portfolioTitulo",

portfolioDescricao:
    "portfolioDescricao",

portfolioArquivo:
    "portfolioArquivo",

portfolioUrl:
    "portfolioUrl",

portfolioAjuda:
    "portfolioAjuda",

btnAdicionarPortfolio:
    "btnAdicionarPortfolio",

portfolioEditList:
    "portfolioEditList",

agendaTitulo:
    "agendaTitulo",

agendaTipo:
    "agendaTipo",

agendaInicio:
    "agendaInicio",

agendaFim:
    "agendaFim",

agendaLocalizacao:
    "agendaLocalizacao",

agendaDescricao:
    "agendaDescricao",

agendaStatus:
    "agendaStatus",

btnAdicionarAgenda:
    "btnAdicionarAgenda",

agendaEditList:
    "agendaEditList",

servicoNome:
    "servicoNome",

servicoDescricao:
    "servicoDescricao",

servicoDuracao:
    "servicoDuracao",

servicoTipoPreco:
    "servicoTipoPreco",

servicoValor:
    "servicoValor",

servicoAtivo:
    "servicoAtivo",

campoValorServico:
    "campoValorServico",

btnAdicionarServico:
    "btnAdicionarServico",

btnCancelarServico:
    "btnCancelarServico",

servicosList:
    "servicosList",

toast:
    "toast",

toastMessage:
    "toastMessage",

loadingOverlay:
    "loadingOverlay",

loadingText:
    "loadingText"


};

const contexto = {


CONFIG,

estado,

ids,

get supabase() {

    return window.supabaseClient;

},

get el() {

    return window.PerfilUtils.el;

},

get utils() {

    return window.PerfilUtils;

}


};

/*

* ============================================================
* ELEMENTOS
* ============================================================
  */

function el(id) {


return document.getElementById(id);


}

/*

* ============================================================
* CONFIGURAÇÃO DOS MÓDULOS
* ============================================================
  */

function configurarModulos() {


/*
 * ---
 * TIPO
 * ---
 */

if (
    window.PerfilEditorTipo &&
    typeof window.PerfilEditorTipo.CONFIG === "object"
) {

    contexto.PerfilEditorTipo =
        window.PerfilEditorTipo;

}

/*
 * ---
 * FOTO
 * ---
 */

if (
    window.PerfilEditorFoto &&
    typeof window.PerfilEditorFoto.configurar === "function"
) {

    window.PerfilEditorFoto.configurar(
        contexto
    );

}

/*
 * ---
 * ABAS
 * ---
 */

if (
    window.PerfilAbas &&
    typeof window.PerfilAbas.configurar === "function"
) {

    window.PerfilAbas.configurar(
        contexto
    );

}

/*
 * ---
 * PORTFÓLIO
 * ---
 *
 * Apenas configuramos o contexto aqui.
 *
 * A inicialização e o carregamento dependem
 * do tipo artístico e acontecem posteriormente.
 */

if (
    window.PerfilPortfolio &&
    typeof window.PerfilPortfolio.configurar === "function"
) {

    window.PerfilPortfolio.configurar(
        contexto
    );

}

/*
 * ---
 * AGENDA
 * ---
 */

if (
    window.PerfilAgenda &&
    typeof window.PerfilAgenda.configurar === "function"
) {

    window.PerfilAgenda.configurar(
        contexto
    );

}

/*
 * ---
 * SERVIÇOS
 * ---
 */

if (
    window.PerfilServicos &&
    typeof window.PerfilServicos.configurar === "function"
) {

    window.PerfilServicos.configurar(
        contexto
    );

}

/*
 * ---
 * INSTRUMENTOS
 * ---
 */

if (
    window.PerfilInstrumentos &&
    typeof window.PerfilInstrumentos.configurar === "function"
) {

    window.PerfilInstrumentos.configurar(
        contexto
    );

}


}

/*

* ============================================================
* NORMALIZAÇÃO DO TIPO ARTÍSTICO
* ============================================================
  */

function preencherTipoArtista(
campoTipo,
tipoBanco
) {


if (!campoTipo) {

    return;

}

const tipoSalvo =
    String(
        tipoBanco || ""
    ).trim();

if (!tipoSalvo) {

    return;

}

/*
 * ---
 * TENTA PRIMEIRO O PERFIL EDITOR TIPO
 * ---
 */

if (
    window.PerfilEditorTipo &&
    typeof window.PerfilEditorTipo.identificar === "function"
) {

    const tipo =
        window.PerfilEditorTipo.identificar(
            tipoSalvo
        );

    if (tipo) {

        const opcoes =
            Array.from(
                campoTipo.options || []
            );

        const opcao =
            opcoes.find(
                (opcaoAtual) => {

                    const valor =
                        String(
                            opcaoAtual.value || ""
                        ).trim();

                    const texto =
                        String(
                            opcaoAtual.textContent || ""
                        ).trim();

                    return (
                        valor === tipo.id ||
                        valor === tipo.slug ||
                        valor === tipo.nome ||
                        texto === tipo.nome ||
                        texto === tipo.slug
                    );

                }
            );

        if (opcao) {

            campoTipo.value =
                opcao.value;

            return;

        }

    }

}

/*
 * ---
 * IGUALDADE EXATA
 * ---
 */

const opcaoExata =
    Array.from(
        campoTipo.options || []
    ).find(
        (opcao) =>
            String(
                opcao.value || ""
            ).trim() === tipoSalvo
    );

if (opcaoExata) {

    campoTipo.value =
        opcaoExata.value;

    return;

}

/*
 * ---
 * COMPARAÇÃO NORMALIZADA
 * ---
 */

let tipoNormalizado =
    tipoSalvo;

if (
    window.PerfilUtils &&
    typeof window.PerfilUtils.normalizarTipoArtista === "function"
) {

    tipoNormalizado =
        window.PerfilUtils.normalizarTipoArtista(
            tipoSalvo
        );

}

const opcaoNormalizada =
    Array.from(
        campoTipo.options || []
    ).find(
        (opcao) => {

            const valorOpcao =
                String(
                    opcao.value || ""
                ).trim();

            const textoOpcao =
                String(
                    opcao.textContent || ""
                ).trim();

            let valorNormalizado =
                valorOpcao;

            let textoNormalizado =
                textoOpcao;

            if (
                window.PerfilUtils &&
                typeof window.PerfilUtils.normalizarTipoArtista === "function"
            ) {

                valorNormalizado =
                    window.PerfilUtils.normalizarTipoArtista(
                        valorOpcao
                    );

                textoNormalizado =
                    window.PerfilUtils.normalizarTipoArtista(
                        textoOpcao
                    );

            }

            return (
                valorNormalizado === tipoNormalizado ||
                textoNormalizado === tipoNormalizado
            );

        }
    );

if (opcaoNormalizada) {

    campoTipo.value =
        opcaoNormalizada.value;

    return;

}

/*
 * ---
 * COMPARAÇÃO FLEXÍVEL
 * ---
 */

const limpar =
    (valor) =>
        String(
            valor || ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /\s+/g,
                ""
            )
            .toLowerCase();

const tipoLimpo =
    limpar(tipoSalvo);

const opcaoFlexivel =
    Array.from(
        campoTipo.options || []
    ).find(
        (opcao) =>
            limpar(
                opcao.value
            ) === tipoLimpo ||
            limpar(
                opcao.textContent
            ) === tipoLimpo
    );

if (opcaoFlexivel) {

    campoTipo.value =
        opcaoFlexivel.value;

    return;

}

console.warn(
    "Não foi possível localizar o tipo artístico no select:",
    tipoSalvo
);


}

/*

* ============================================================
* IDENTIFICAÇÃO UNIVERSAL DO TIPO
* ============================================================
  */

function obterTipoConfigurado(
valor
) {


if (
    window.PerfilEditorTipo &&
    typeof window.PerfilEditorTipo.identificar === "function"
) {

    return window.PerfilEditorTipo.identificar(
        valor
    );

}

return null;


}

function resolverTipo(
valor
) {


if (
    window.PerfilEditorTipo &&
    typeof window.PerfilEditorTipo.resolver === "function"
) {

    return window.PerfilEditorTipo.resolver(
        valor
    );

}

return null;


}

/*

* ============================================================
* RECURSOS DO TIPO ATUAL
* ============================================================
  */

function tipoPossuiRecurso(
recurso,
tipo
) {


const tipoAtual =
    tipo ||
    estado.perfilArtista?.tipo_artista;

if (
    !tipoAtual ||
    !window.PerfilEditorTipo
) {

    return false;

}

if (
    typeof window.PerfilEditorTipo.possuiRecurso === "function"
) {

    return window.PerfilEditorTipo.possuiRecurso(
        tipoAtual,
        recurso
    );

}

return false;


}

function tipoPossuiInstrumentos(
tipo
) {


const tipoAtual =
    tipo ||
    estado.perfilArtista?.tipo_artista;

if (
    !tipoAtual ||
    !window.PerfilEditorTipo
) {

    return false;

}

if (
    typeof window.PerfilEditorTipo.possuiInstrumentos === "function"
) {

    return window.PerfilEditorTipo.possuiInstrumentos(
        tipoAtual
    );

}

return false;


}

/*

* ============================================================
* CONFIGURAÇÃO DOS INSTRUMENTOS POR TIPO
* ============================================================
*
* IMPORTANTE:
*
* O módulo PerfilInstrumentos NÃO deve ser inicializado
* antes de sabermos qual é o tipo artístico.
*
* O tipo é carregado do banco em carregarDados().
*
* Somente depois disso esta função é executada.
  */

function configurarInstrumentosPorTipo() {


if (!window.PerfilInstrumentos) {

    return;

}

const possuiInstrumentos =
    tipoPossuiInstrumentos();

if (possuiInstrumentos) {

    /*
     * ----------------------------------------------------
     * TIPOS QUE POSSUEM INSTRUMENTOS
     * ----------------------------------------------------
     */

    if (
        typeof window.PerfilInstrumentos.inicializar === "function"
    ) {

        window.PerfilInstrumentos.inicializar();

    }

    if (
        typeof window.PerfilInstrumentos.carregar === "function"
    ) {

        window.PerfilInstrumentos.carregar(
            estado.perfilArtista?.instrumentos || []
        );

    }

    return;

}

/*
 * ---
 * TIPOS QUE NÃO POSSUEM INSTRUMENTOS
 * ---
 */

if (
    typeof window.PerfilInstrumentos.destruir === "function"
) {

    window.PerfilInstrumentos.destruir();

}


}

/*

* ============================================================
* CONFIGURAÇÃO DO PORTFÓLIO POR TIPO
* ============================================================
*
* IMPORTANTE:
*
* O módulo PerfilPortfolio pode existir em várias páginas,
* porém só deve ser inicializado e carregado quando o tipo
* atual possuir o recurso "portfolio".
*
* O PerfilEditorTipo é a única fonte de verdade para essa
* decisão.
  */

function configurarPortfolioPorTipo() {


if (!window.PerfilPortfolio) {

    return;

}

const possuiPortfolio =
    tipoPossuiRecurso(
        "portfolio"
    );

if (!possuiPortfolio) {

    return;

}

/*
 * ----------------------------------------------------
 * INICIALIZA O PORTFÓLIO SOMENTE APÓS O TIPO
 * TER SIDO IDENTIFICADO
 * ----------------------------------------------------
 */

if (
    typeof window.PerfilPortfolio.inicializar === "function"
) {

    window.PerfilPortfolio.inicializar();

}

/*
 * ----------------------------------------------------
 * CARREGA OS ITENS DO PORTFÓLIO
 * ----------------------------------------------------
 */

if (
    typeof window.PerfilPortfolio.carregar === "function"
) {

    return window.PerfilPortfolio.carregar();

}


}

/*

* ============================================================
* CARREGAMENTO DO PERFIL
* ============================================================
  */

async function carregarDados() {


try {

    if (!window.Sessao) {

        throw new Error(
            "Módulo Sessao não carregado."
        );

    }

    estado.usuarioAuth =
        await window.Sessao.usuarioAtual();

    if (!estado.usuarioAuth) {

        sessionStorage.setItem(
            "musicalworld_destino_login",
            CONFIG.paginaAtual
        );

        window.location.href =
            "login.html";

        return;

    }

    if (!contexto.supabase) {

        throw new Error(
            "SupabaseClient não foi carregado."
        );

    }

    /*
     * ----------------------------------------------------
     * USUÁRIO
     * ----------------------------------------------------
     */

    const {
        data: usuario,
        error: erroUsuario
    } = await contexto.supabase
        .from(
            CONFIG.tabelas.usuarios
        )
        .select(
            "id,nome,email,telefone,foto_url,ativo"
        )
        .eq(
            "id",
            estado.usuarioAuth.id
        )
        .maybeSingle();

    if (erroUsuario) {

        throw erroUsuario;

    }

    estado.usuario =
        usuario || {

            id:
                estado.usuarioAuth.id,

            nome:
                estado.usuarioAuth.user_metadata?.nome ||
                estado.usuarioAuth.email ||
                "Usuário",

            email:
                estado.usuarioAuth?.email ||
                estado.usuarioAuth?.user?.email ||
                "",

            telefone:
                null,

            foto_url:
                null,

            ativo:
                true

        };

    /*
     * ----------------------------------------------------
     * PERFIL
     * ----------------------------------------------------
     */

    const {
        data: perfis,
        error: erroPerfil
    } = await contexto.supabase
        .from(
            CONFIG.tabelas.perfis
        )
        .select(
            "id,usuario_id,tipo_perfil_id,nome_exibicao,descricao,ativo,tipos_perfil(id,nome,descricao)"
        )
        .eq(
            "usuario_id",
            estado.usuarioAuth.id
        )
        .eq(
            "ativo",
            true
        );

    if (erroPerfil) {

        throw erroPerfil;

    }

    /*
     * ----------------------------------------------------
     * LOCALIZA PERFIL ARTÍSTICO
     * ----------------------------------------------------
     */

    const perfilArtistaTipo =
        (perfis || []).find(
            (perfil) => {

                const nomeTipo =
                    perfil?.tipos_perfil?.nome ||
                    "";

                return (
                    String(
                        nomeTipo
                    )
                        .trim()
                        .toLowerCase() ===
                    "artista"
                );

            }
        );

    /*
     * ----------------------------------------------------
     * LOCALIZA PERFIL CONTRATANTE
     * ----------------------------------------------------
     */

    const perfilContratanteTipo =
        (perfis || []).find(
            (perfil) => {

                const nomeTipo =
                    perfil?.tipos_perfil?.nome ||
                    "";

                return (
                    String(
                        nomeTipo
                    )
                        .trim()
                        .toLowerCase() ===
                    "contratante"
                );

            }
        );

    if (!perfilArtistaTipo) {

        if (perfilContratanteTipo) {

            throw new Error(
                "Este é um perfil de Contratante. O editor artístico não deve ser utilizado para este perfil."
            );

        }

        throw new Error(
            "Perfil artístico não encontrado."
        );

    }

    estado.perfil =
        perfilArtistaTipo;

    /*
     * ----------------------------------------------------
     * PERFIL ARTÍSTICO
     * ----------------------------------------------------
     */

    const {
        data: perfilArtista,
        error: erroPerfilArtista
    } = await contexto.supabase
        .from(
            CONFIG.tabelas.perfisArtistas
        )
        .select(
            "id,perfil_id,tipo_artista,localizacao,experiencia,area_atendimento,disponivel,instrumentos,estilos,servicos,foto_url,created_at,updated_at"
        )
        .eq(
            "perfil_id",
            estado.perfil.id
        )
        .maybeSingle();

    if (erroPerfilArtista) {

        throw erroPerfilArtista;

    }

    estado.perfilArtista =
        perfilArtista || {

            id:
                null,

            perfil_id:
                estado.perfil.id,

            tipo_artista:
                null,

            localizacao:
                null,

            experiencia:
                null,

            area_atendimento:
                null,

            disponivel:
                true,

            instrumentos:
                [],

            estilos:
                [],

            servicos:
                [],

            foto_url:
                null

        };

    /*
     * ----------------------------------------------------
     * TIPO ARTÍSTICO ATUAL
     * ----------------------------------------------------
     */

    const tipoInformado =
        estado.perfilArtista.tipo_artista;

    const tipoConfigurado =
        resolverTipo(
            tipoInformado
        );

    if (!tipoConfigurado) {

        console.warn(
            "PerfilEditor: tipo artístico não reconhecido:",
            tipoInformado
        );

    } else {

        estado.perfilArtista.tipo_artista =
            tipoInformado ||
            tipoConfigurado.nome;

    }

    /*
     * ----------------------------------------------------
     * VERIFICAÇÃO DO TIPO
     * ----------------------------------------------------
     */

    if (
        tipoInformado &&
        !tipoConfigurado
    ) {

        console.warn(
            "PerfilEditor: tipo não possui configuração no PerfilEditorTipo:",
            tipoInformado
        );

    }

    /*
     * ----------------------------------------------------
     * REDIRECIONAMENTO
     * ----------------------------------------------------
     */

    if (tipoConfigurado) {

        const paginaEdicao =
            tipoConfigurado.editar;

        if (
            paginaEdicao &&
            paginaEdicao !== CONFIG.paginaAtual
        ) {

            window.location.href =
                paginaEdicao;

            return;

        }

    }

    /*
     * ----------------------------------------------------
     * PREENCHIMENTO
     * ----------------------------------------------------
     */

    preencherFormulario();

    /*
     * ----------------------------------------------------
     * INSTRUMENTOS
     * ----------------------------------------------------
     *
     * AGORA o tipo já foi carregado e validado.
     */

    configurarInstrumentosPorTipo();

    /*
     * ----------------------------------------------------
     * PORTFÓLIO
     * ----------------------------------------------------
     *
     * AGORA o tipo também já foi carregado.
     *
     * Portanto somente neste ponto decidimos se o
     * módulo PerfilPortfolio deve ser inicializado.
     */

    await configurarPortfolioPorTipo();

    /*
     * ----------------------------------------------------
     * AGENDA
     * ----------------------------------------------------
     */

    if (
        window.PerfilAgenda &&
        typeof window.PerfilAgenda.carregar === "function"
    ) {

        await window.PerfilAgenda.carregar();

    }

    /*
     * ----------------------------------------------------
     * SERVIÇOS
     * ----------------------------------------------------
     */

    if (
        window.PerfilServicos &&
        typeof window.PerfilServicos.carregar === "function"
    ) {

        await window.PerfilServicos.carregar();

    }

} catch (erro) {

    console.error(
        "Erro ao carregar perfil:",
        erro
    );

    const mensagem =
        erro?.message ||
        "Não foi possível carregar seu perfil.";

    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.mostrarToast === "function"
    ) {

        window.PerfilUtils.mostrarToast(
            mensagem,
            "erro"
        );

    } else {

        alert(mensagem);

    }

}


}

/*

* ============================================================
* PREENCHER FORMULÁRIO
* ============================================================
  */

function preencherFormulario() {


const usuario =
    estado.usuario || {};

const perfil =
    estado.perfil || {};

const artista =
    estado.perfilArtista || {};

const campoNome =
    el(ids.nome);

const campoNomeExibicao =
    el(ids.nomeExibicao);

const campoTelefone =
    el(ids.telefone);

const campoLocalizacao =
    el(ids.localizacao);

const campoDescricao =
    el(ids.descricao);

const campoExperiencia =
    el(ids.experiencia);

const campoArea =
    el(ids.areaAtendimento);

const campoTipo =
    el(ids.tipoArtista);

const campoDisponivel =
    el(ids.disponivel);

const campoEmail =
    el(ids.emailConta);

/*
 * ---
 * NOME
 * ---
 */

if (campoNome) {

    campoNome.value =
        usuario.nome || "";

}

/*
 * ---
 * NOME DE EXIBIÇÃO
 * ---
 */

if (campoNomeExibicao) {

    campoNomeExibicao.value =
        perfil.nome_exibicao ||
        usuario.nome ||
        "";

}

/*
 * ---
 * TELEFONE
 * ---
 */

if (campoTelefone) {

    campoTelefone.value =
        usuario.telefone || "";

}

/*
 * ---
 * LOCALIZAÇÃO
 * ---
 */

if (campoLocalizacao) {

    campoLocalizacao.value =
        artista.localizacao || "";

}

/*
 * ---
 * DESCRIÇÃO
 * ---
 */

if (campoDescricao) {

    campoDescricao.value =
        perfil.descricao || "";

}

/*
 * ---
 * EXPERIÊNCIA
 * ---
 */

if (campoExperiencia) {

    campoExperiencia.value =
        artista.experiencia || "";

}

/*
 * ---
 * ÁREA DE ATENDIMENTO
 * ---
 */

if (campoArea) {

    campoArea.value =
        artista.area_atendimento || "";

}

/*
 * ---
 * TIPO DE ARTISTA
 * ---
 */

if (campoTipo) {

    const tipoBanco =
        String(
            artista.tipo_artista || ""
        ).trim();

    let tipoParaExibir =
        tipoBanco;

    /*
     * Se não houver tipo salvo, utiliza o tipo
     * definido para a página atual.
     */

    if (!tipoParaExibir) {

        const tipoDaPagina =
            window.PerfilEditorTipo &&
            typeof window.PerfilEditorTipo.obterTipoDaPaginaAtual === "function"

                ? window.PerfilEditorTipo.obterTipoDaPaginaAtual()

                : null;

        tipoParaExibir =
            tipoDaPagina?.nome ||
            "Cantor(a)";

    }

    preencherTipoArtista(
        campoTipo,
        tipoParaExibir
    );

    if (
        !campoTipo.value &&
        tipoParaExibir
    ) {

        campoTipo.value =
            tipoParaExibir;

    }

    if (
        !estado.perfilArtista.tipo_artista
    ) {

        estado.perfilArtista.tipo_artista =
            tipoParaExibir;

    }

}

/*
 * ---
 * DISPONIBILIDADE
 * ---
 */

if (campoDisponivel) {

    campoDisponivel.checked =
        artista.disponivel !== false;

}

/*
 * ---
 * EMAIL
 * ---
 */

if (campoEmail) {

    const emailAuth =
        estado.usuarioAuth?.email ||
        estado.usuarioAuth?.user?.email ||
        "";

    const emailBanco =
        estado.usuario?.email ||
        "";

    const email =
        emailAuth ||
        emailBanco ||
        "";

    campoEmail.textContent =
        email ||
        "Não informado";

}

/*
 * ---
 * CHIPS
 * ---
 */

if (
    window.PerfilUtils &&
    typeof window.PerfilUtils.marcarChips === "function"
) {

    window.PerfilUtils.marcarChips(
        "estilos",
        artista.estilos || []
    );

    window.PerfilUtils.marcarChips(
        "servicos",
        artista.servicos || []
    );

    /*
     * Os instrumentos agora são controlados pelo
     * PerfilInstrumentos depois que o tipo é conhecido.
     */

}

atualizarContador();

preencherAvatar();


}

/*

* ============================================================
* AVATAR
* ============================================================
  */

function preencherAvatar() {


const imagem =
    el(ids.avatarImage);

const iniciais =
    el(ids.avatarInitials);

const foto =
    estado.perfilArtista?.foto_url ||
    estado.usuario?.foto_url ||
    "";

if (foto) {

    if (imagem) {

        imagem.src =
            foto;

        imagem.style.display =
            "block";

    }

    if (iniciais) {

        iniciais.style.display =
            "none";

    }

    return;

}

const nome =
    estado.perfil?.nome_exibicao ||
    estado.usuario?.nome ||
    "";

const textoIniciais =
    window.PerfilUtils &&
    typeof window.PerfilUtils.obterIniciais === "function"

        ? window.PerfilUtils.obterIniciais(nome)

        : "MW";

if (imagem) {

    imagem.removeAttribute("src");

    imagem.style.display =
        "none";

}

if (iniciais) {

    iniciais.textContent =
        textoIniciais;

    iniciais.style.display =
        "flex";

}


}

/*

* ============================================================
* SALVAR SOBRE
* ============================================================
  */

async function salvarSobre() {


if (estado.salvando) {

    return;

}

const nome =
    String(
        el(ids.nome)?.value ||
        ""
    ).trim();

const nomeExibicao =
    String(
        el(ids.nomeExibicao)?.value ||
        ""
    ).trim();

const telefone =
    String(
        el(ids.telefone)?.value ||
        ""
    ).trim();

const localizacao =
    String(
        el(ids.localizacao)?.value ||
        ""
    ).trim();

const descricao =
    String(
        el(ids.descricao)?.value ||
        ""
    ).trim();

const experiencia =
    String(
        el(ids.experiencia)?.value ||
        ""
    ).trim();

const areaAtendimento =
    String(
        el(ids.areaAtendimento)?.value ||
        ""
    ).trim();

/*
 * ---
 * TIPO SELECIONADO
 * ---
 */

const tipoSelecionadoCampo =
    String(
        el(ids.tipoArtista)?.value ||
        ""
    ).trim();

const tipoCadastrado =
    String(
        estado.perfilArtista?.tipo_artista ||
        ""
    ).trim();

const tipoSelecionado =
    tipoSelecionadoCampo ||
    tipoCadastrado;

const tipoConfigurado =
    resolverTipo(
        tipoSelecionado
    );

const disponivel =
    Boolean(
        el(ids.disponivel)?.checked
    );

/*
 * ---
 * VALIDAÇÕES
 * ---
 */

if (!nome) {

    window.PerfilUtils.mostrarToast(
        "Informe seu nome.",
        "erro"
    );

    el(ids.nome)?.focus();

    return;

}

if (!nomeExibicao) {

    window.PerfilUtils.mostrarToast(
        "Informe o nome que será exibido no perfil.",
        "erro"
    );

    el(ids.nomeExibicao)?.focus();

    return;

}

if (descricao.length > 1000) {

    window.PerfilUtils.mostrarToast(
        "A descrição deve ter no máximo 1000 caracteres.",
        "erro"
    );

    el(ids.descricao)?.focus();

    return;

}

if (
    !window.PerfilUtils ||
    typeof window.PerfilUtils.normalizarTipoArtista !== "function"
) {

    throw new Error(
        "PerfilUtils não está disponível."
    );

}

/*
 * ---
 * NORMALIZAÇÃO COMPATÍVEL COM O SISTEMA ATUAL
 * ---
 */

const novoTipo =
    window.PerfilUtils.normalizarTipoArtista(
        tipoSelecionado
    );

if (!novoTipo) {

    window.PerfilUtils.mostrarToast(
        "Selecione seu tipo de perfil.",
        "erro"
    );

    el(ids.tipoArtista)?.focus();

    return;

}

/*
 * ---
 * VALIDADE DO TIPO
 * ---
 */

const tipoValidado =
    obterTipoConfigurado(
        novoTipo
    ) ||
    obterTipoConfigurado(
        tipoSelecionado
    );

if (!tipoValidado) {

    window.PerfilUtils.mostrarToast(
        "O tipo de perfil selecionado não é válido.",
        "erro"
    );

    el(ids.tipoArtista)?.focus();

    return;

}

/*
 * ---
 * TIPO ATUAL CADASTRADO
 * ---
 */

const tipoAtualOriginal =
    String(
        estado.perfilArtista?.tipo_artista ||
        ""
    ).trim();

const tipoAtualConfigurado =
    obterTipoConfigurado(
        tipoAtualOriginal
    );

const tipoAtual =
    tipoAtualConfigurado
        ? tipoAtualConfigurado.slug
        : window.PerfilUtils.normalizarTipoArtista(
            tipoAtualOriginal
        );

const tipoNovoSlug =
    tipoValidado.slug;

const tipoAlterado =
    tipoNovoSlug !== tipoAtual;

/*
 * ---
 * CONFIRMAÇÃO DE ALTERAÇÃO DE TIPO
 * ---
 */

if (tipoAlterado) {

    const nomeTipoAtual =
        tipoAtualConfigurado?.nome ||
        tipoAtualOriginal ||
        "tipo atual";

    const nomeNovoTipo =
        tipoValidado.nome;

    const confirmar =
        window.confirm(
            `Você está alterando seu tipo de perfil de "${nomeTipoAtual}" para "${nomeNovoTipo}". Deseja continuar?`
        );

    if (!confirmar) {

        return;

    }

}

estado.salvando =
    true;

const botoesSalvar = [

    el(ids.btnSalvar),

    el(ids.btnSalvarTopo)

].filter(Boolean);

botoesSalvar.forEach(
    (botao) => {

        botao.disabled =
            true;

    }
);

if (
    window.PerfilUtils &&
    typeof window.PerfilUtils.mostrarLoading === "function"
) {

    window.PerfilUtils.mostrarLoading(
        "Salvando perfil..."
    );

}

try {

    /*
     * ----------------------------------------------------
     * CHIPS
     * ----------------------------------------------------
     */

    /*
     * IMPORTANTE:
     *
     * A decisão dos instrumentos deve usar o TIPO QUE
     * ESTÁ SENDO SALVO.
     */

    const tipoNovoPossuiInstrumentos =
        tipoPossuiInstrumentos(
            tipoValidado.slug
        );

    const instrumentos =
        tipoNovoPossuiInstrumentos &&
        typeof window.PerfilUtils.obterChipsSelecionados === "function"

            ? window.PerfilUtils.obterChipsSelecionados(
                "instrumentos"
            )

            : [];

    const estilos =
        typeof window.PerfilUtils.obterChipsSelecionados === "function"

            ? window.PerfilUtils.obterChipsSelecionados(
                "estilos"
            )

            : [];

    const servicos =
        typeof window.PerfilUtils.obterChipsSelecionados === "function"

            ? window.PerfilUtils.obterChipsSelecionados(
                "servicos"
            )

            : [];

    /*
     * ----------------------------------------------------
     * FOTO
     * ----------------------------------------------------
     */

    let resultadoFoto = {

        url:
            estado.perfilArtista?.foto_url ||
            estado.usuario?.foto_url ||
            null,

        caminhoNovo:
            null,

        caminhoAnterior:
            null

    };

    if (
        window.PerfilEditorFoto &&
        typeof window.PerfilEditorFoto.fazerUpload === "function"
    ) {

        resultadoFoto =
            await window.PerfilEditorFoto.fazerUpload();

    }

    const fotoUrl =
        resultadoFoto?.url ||
        null;

    const agora =
        new Date().toISOString();

    /*
     * ----------------------------------------------------
     * USUARIOS
     * ----------------------------------------------------
     */

    const {
        error: erroUsuario
    } = await contexto.supabase
        .from(
            CONFIG.tabelas.usuarios
        )
        .update({

            nome,

            telefone:
                telefone || null,

            foto_url:
                fotoUrl

        })
        .eq(
            "id",
            estado.usuarioAuth.id
        );

    if (erroUsuario) {

        throw erroUsuario;

    }

    /*
     * ----------------------------------------------------
     * PERFIS
     * ----------------------------------------------------
     */

    const {
        error: erroPerfil
    } = await contexto.supabase
        .from(
            CONFIG.tabelas.perfis
        )
        .update({

            nome_exibicao:
                nomeExibicao,

            descricao:
                descricao || null,

            updated_at:
                agora

        })
        .eq(
            "id",
            estado.perfil.id
        )
        .eq(
            "usuario_id",
            estado.usuarioAuth.id
        );

    if (erroPerfil) {

        throw erroPerfil;

    }

    /*
     * ----------------------------------------------------
     * PERFIS_ARTISTAS
     * ----------------------------------------------------
     */

    const dadosArtista = {

        tipo_artista:
            novoTipo,

        localizacao:
            localizacao || null,

        experiencia:
            experiencia || null,

        area_atendimento:
            areaAtendimento || null,

        disponivel,

        instrumentos,

        estilos,

        servicos,

        foto_url:
            fotoUrl,

        updated_at:
            agora

    };

    if (estado.perfilArtista?.id) {

        const {
            error: erroAtualizacaoArtista
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.perfisArtistas
            )
            .update(
                dadosArtista
            )
            .eq(
                "id",
                estado.perfilArtista.id
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            );

        if (erroAtualizacaoArtista) {

            throw erroAtualizacaoArtista;

        }

    } else {

        const {
            data: novoPerfilArtista,
            error: erroInsercaoArtista
        } = await contexto.supabase
            .from(
                CONFIG.tabelas.perfisArtistas
            )
            .insert({

                perfil_id:
                    estado.perfil.id,

                ...dadosArtista

            })
            .select()
            .maybeSingle();

        if (erroInsercaoArtista) {

            throw erroInsercaoArtista;

        }

        if (novoPerfilArtista) {

            estado.perfilArtista = {

                ...estado.perfilArtista,

                ...novoPerfilArtista

            };

        }

    }

    /*
     * ----------------------------------------------------
     * FOTO ANTIGA
     * ----------------------------------------------------
     */

    if (
        window.PerfilEditorFoto &&
        typeof window.PerfilEditorFoto.finalizarFoto === "function"
    ) {

        await window.PerfilEditorFoto.finalizarFoto(
            resultadoFoto
        );

    }

    /*
     * ----------------------------------------------------
     * ATUALIZA ESTADO LOCAL
     * ----------------------------------------------------
     */

    estado.usuario = {

        ...estado.usuario,

        nome,

        telefone:
            telefone || null,

        foto_url:
            fotoUrl

    };

    estado.perfil = {

        ...estado.perfil,

        nome_exibicao:
            nomeExibicao,

        descricao:
            descricao || null

    };

    estado.perfilArtista = {

        ...estado.perfilArtista,

        ...dadosArtista,

        perfil_id:
            estado.perfil.id

    };

    /*
     * ----------------------------------------------------
     * LIMPA O ARQUIVO SELECIONADO
     * ----------------------------------------------------
     */

    if (
        window.PerfilEditorFoto &&
        typeof window.PerfilEditorFoto.limpar === "function"
    ) {

        window.PerfilEditorFoto.limpar();

    }

    /*
     * ----------------------------------------------------
     * ATUALIZA SELECT
     * ----------------------------------------------------
     */

    const campoTipo =
        el(ids.tipoArtista);

    if (campoTipo) {

        preencherTipoArtista(
            campoTipo,
            dadosArtista.tipo_artista
        );

    }

    preencherAvatar();

    /*
     * ----------------------------------------------------
     * ALTERAÇÃO DE TIPO
     * ----------------------------------------------------
     */

    if (tipoAlterado) {

        const pagina =
            tipoValidado?.editar ||
            null;

        if (
            pagina &&
            pagina !== CONFIG.paginaAtual
        ) {

            window.location.href =
                pagina;

            return;

        }

    }

    window.PerfilUtils.mostrarToast(
        "Perfil salvo com sucesso.",
        "sucesso"
    );

} catch (erro) {

    console.error(
        "Erro ao salvar perfil:",
        erro
    );

    window.PerfilUtils.mostrarToast(
        erro?.message ||
        "Não foi possível salvar o perfil.",
        "erro"
    );

} finally {

    estado.salvando =
        false;

    botoesSalvar.forEach(
        (botao) => {

            botao.disabled =
                false;

        }
    );

    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.esconderLoading === "function"
    ) {

        window.PerfilUtils.esconderLoading();

    }

    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.atualizarIcones === "function"
    ) {

        window.PerfilUtils.atualizarIcones();

    }

}


}

/*

* ============================================================
* CONTADOR DE DESCRIÇÃO
* ============================================================
  */

function atualizarContador() {


const campo =
    el(ids.descricao);

const contador =
    el(ids.contadorDescricao);

if (!campo || !contador) {

    return;

}

const quantidade =
    campo.value.length;

contador.textContent =
    `${quantidade}/1000`;


}

/*

* ============================================================
* EVENTOS GERAIS
* ============================================================
  */

function inicializarEventos() {


const formulario =
    el(ids.form);

if (
    formulario &&
    formulario.dataset.perfilEditorInicializado !== "true"
) {

    formulario.dataset.perfilEditorInicializado =
        "true";

    formulario.addEventListener(
        "submit",
        async (evento) => {

            evento.preventDefault();

            await salvarSobre();

        }
    );

}

/*
 * ---
 * BOTÃO SALVAR ALTERAÇÕES
 * ---
 */

const btnSalvar =
    el(ids.btnSalvar);

if (
    btnSalvar &&
    btnSalvar.dataset.perfilEditorInicializado !== "true"
) {

    btnSalvar.dataset.perfilEditorInicializado =
        "true";

    btnSalvar.addEventListener(
        "click",
        async (evento) => {

            evento.preventDefault();

            await salvarSobre();

        }
    );

}

/*
 * ---
 * CONTADOR DA DESCRIÇÃO
 * ---
 */

const descricao =
    el(ids.descricao);

if (
    descricao &&
    descricao.dataset.perfilEditorInicializado !== "true"
) {

    descricao.dataset.perfilEditorInicializado =
        "true";

    descricao.addEventListener(
        "input",
        atualizarContador
    );

}

/*
 * ---
 * SALVAR NO TOPO
 * ---
 */

const btnSalvarTopo =
    el(ids.btnSalvarTopo);

if (
    btnSalvarTopo &&
    btnSalvarTopo.dataset.perfilEditorInicializado !== "true"
) {

    btnSalvarTopo.dataset.perfilEditorInicializado =
        "true";

    btnSalvarTopo.addEventListener(
        "click",
        async () => {

            const aba =
                estado.abaAtual;

            if (
                aba === "sobre"
            ) {

                await salvarSobre();

                return;

            }

            if (
                aba === "portfolio" &&
                window.PerfilPortfolio &&
                typeof window.PerfilPortfolio.salvar === "function"
            ) {

                await window.PerfilPortfolio.salvar();

                return;

            }

            if (
                aba === "agenda" &&
                window.PerfilAgenda &&
                typeof window.PerfilAgenda.salvar === "function"
            ) {

                await window.PerfilAgenda.salvar();

                return;

            }

            if (
                aba === "servicos" &&
                window.PerfilServicos &&
                typeof window.PerfilServicos.salvar === "function"
            ) {

                await window.PerfilServicos.salvar();

                return;

            }

        }
    );

}

/*
 * ---
 * BOTÃO CANCELAR
 * ---
 */

const btnCancelar =
    el(ids.btnCancelar);

if (
    btnCancelar &&
    btnCancelar.dataset.perfilEditorInicializado !== "true"
) {

    btnCancelar.dataset.perfilEditorInicializado =
        "true";

    btnCancelar.addEventListener(
        "click",
        () => {

            window.location.href =
                CONFIG.paginaPerfil;

        }
    );

}

/*
 * ---
 * BOTÃO VOLTAR
 * ---
 */

const btnVoltar =
    el(ids.btnVoltar);

if (
    btnVoltar &&
    btnVoltar.dataset.perfilEditorInicializado !== "true"
) {

    btnVoltar.dataset.perfilEditorInicializado =
        "true";

    btnVoltar.addEventListener(
        "click",
        voltarPerfil
    );

}


}

/*

* ============================================================
* VOLTAR PARA PERFIL
* ============================================================
  */

function voltarPerfil() {


const pagina =
    obterPaginaPerfil();

window.location.href =
    pagina;


}

/*

* ============================================================
* INICIALIZAÇÃO
* ============================================================
  */

function iniciar() {


try {

    /*
     * ----------------------------------------------------
     * VERIFICAÇÃO DO PERFIL EDITOR TIPO
     * ----------------------------------------------------
     */

    if (
        !window.PerfilEditorTipo
    ) {

        console.error(
            "PerfilEditor: PerfilEditorTipo não foi carregado."
        );

    }

    /*
     * ----------------------------------------------------
     * CONFIGURA MÓDULOS
     * ----------------------------------------------------
     */

    configurarModulos();

    /*
     * ----------------------------------------------------
     * ABAS
     * ----------------------------------------------------
     */

    if (
        window.PerfilAbas &&
        typeof window.PerfilAbas.inicializar === "function"
    ) {

        window.PerfilAbas.inicializar();

    }

    /*
     * ----------------------------------------------------
     * EVENTOS GERAIS
     * ----------------------------------------------------
     */

    inicializarEventos();

    /*
     * ----------------------------------------------------
     * FOTO
     * ----------------------------------------------------
     */

    if (
        window.PerfilEditorFoto &&
        typeof window.PerfilEditorFoto.inicializar === "function"
    ) {

        window.PerfilEditorFoto.inicializar();

    } else {

        console.error(
            "PerfilEditor: PerfilEditorFoto não foi carregado."
        );

    }

    /*
     * ----------------------------------------------------
     * PORTFÓLIO
     * ----------------------------------------------------
     *
     * NÃO inicializamos aqui.
     *
     * O tipo artístico ainda não foi carregado do banco.
     *
     * A inicialização correta acontece dentro de
     * carregarDados(), depois que estado.perfilArtista
     * estiver preenchido.
     */

    /*
     * ----------------------------------------------------
     * INSTRUMENTOS
     * ----------------------------------------------------
     *
     * NÃO inicializamos aqui.
     *
     * O tipo artístico ainda não foi carregado do banco.
     *
     * A inicialização correta acontece dentro de
     * carregarDados(), depois que estado.perfilArtista
     * estiver preenchido.
     */

    /*
    * ----------------------------------------------------
    * AGENDA
    * ----------------------------------------------------
    *
    * A Agenda não depende do tipo artístico para
    * inicializar seus eventos.
    *
    * Ela precisa ser inicializada aqui para registrar
    * o clique do botão #btnAdicionarAgenda.
    *
    * O carregamento dos dados continua acontecendo
    * posteriormente em carregarDados().
    */

    if (
        window.PerfilAgenda &&
        typeof window.PerfilAgenda.inicializar === "function"
    ) {

        window.PerfilAgenda.inicializar();

    } else {

        console.error(
            "PerfilEditor: PerfilAgenda não foi carregado."
        );

    }

    /*
     * ----------------------------------------------------
     * SERVIÇOS
     * ----------------------------------------------------
     */

    if (
        window.PerfilServicos &&
        typeof window.PerfilServicos.inicializar === "function"
    ) {

        window.PerfilServicos.inicializar();

    }

    /*
     * ----------------------------------------------------
     * CHIPS
     * ----------------------------------------------------
     */

    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.inicializarChips === "function"
    ) {

        window.PerfilUtils.inicializarChips();

    }

    /*
     * ----------------------------------------------------
     * CARREGAMENTO
     * ----------------------------------------------------
     */

    carregarDados();

} catch (erro) {

    console.error(
        "PerfilEditor: erro ao iniciar:",
        erro
    );

    if (
        window.PerfilUtils &&
        typeof window.PerfilUtils.mostrarToast === "function"
    ) {

        window.PerfilUtils.mostrarToast(
            "Não foi possível iniciar o editor.",
            "erro"
        );

    } else {

        console.error(
            "PerfilUtils não está disponível."
        );

    }

}


}

/*

* ============================================================
* API PÚBLICA
* ============================================================
  */

return {


CONFIG,

estado,

ids,

contexto,

iniciar,

carregarDados,

preencherFormulario,

preencherAvatar,

salvarSobre,

inicializarEventos,

atualizarContador,

voltarPerfil,

preencherTipoArtista,

obterPaginaPerfil,

obterTipoConfigurado,

resolverTipo,

tipoPossuiRecurso,

tipoPossuiInstrumentos,

configurarInstrumentosPorTipo,

configurarPortfolioPorTipo


};

})();

window.PerfilEditor =
PerfilEditor;

/*

* ================================================================
* AUTO START
* ================================================================
  */

if (
document.readyState === "loading"
) {


document.addEventListener(
    "DOMContentLoaded",
    () => {

        PerfilEditor.iniciar();

    },
    {
        once: true
    }
);


} else {


PerfilEditor.iniciar();


}
