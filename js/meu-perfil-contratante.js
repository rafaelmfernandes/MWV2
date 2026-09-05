const MusicalWorldMeuPerfilContratante = (() => {


const CONFIG = {

    tabelaUsuarios: "usuarios",

    tabelaPerfis: "perfis",

    tabelaTiposPerfil: "tipos_perfil",

    storageKey:
        "musicalworld_perfil_contratante"

};


let usuarioAtual = null;

let perfilAtual = null;

let tipoPerfilAtual = null;



/*
 * =========================================================
 * INICIALIZAÇÃO
 * =========================================================
 */

async function inicializar() {

    try {

        console.log(
            "👤 Inicializando Meu Perfil de Contratante..."
        );


        /*
         * Verifica login.
         */

        if (
            typeof ControleSessao === "undefined"
        ) {

            console.error(
                "❌ ControleSessao não está disponível."
            );

            redirecionarLogin();

            return;

        }


        const sessao =
            await ControleSessao.iniciar({

                exigirLogin: true,

                redirecionarPara:
                    "login.html"

            });


        if (!sessao) {

            return;

        }


        /*
         * Verifica se o usuário realmente é
         * CONTRATANTE.
         */

        const autorizado =
            await verificarAcessoContratante();


        if (!autorizado) {

            return;

        }


        /*
         * Carrega os dados reais.
         */

        const dados =
            await carregarPerfilSupabase();


        if (dados) {

            preencherPerfil(
                dados
            );

        }


        inicializarAbas();

        inicializarBotoes();

        carregarResumoFinanceiro();

        atualizarIcones();


        console.log(
            "✅ Meu Perfil de Contratante carregado."
        );


    } catch (erro) {

        console.error(
            "❌ Erro ao carregar perfil do contratante:",
            erro
        );


        mostrarToast(
            "Não foi possível carregar seu perfil."
        );

    }

}



/*
 * =========================================================
 * VERIFICAÇÃO DE ACESSO
 * =========================================================
 */

async function verificarAcessoContratante() {

    try {

        const dados =
            await carregarDadosUsuario();


        if (!dados) {

            redirecionarLogin();

            return false;

        }


        usuarioAtual =
            dados.usuario;


        perfilAtual =
            dados.perfil;


        tipoPerfilAtual =
            dados.tipoPerfil;


        if (!perfilAtual) {

            mostrarToast(
                "Seu perfil ainda não foi configurado."
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


            return false;

        }


        const tipo =
            String(
                tipoPerfilAtual?.nome || ""
            )
            .trim()
            .toLowerCase();


        /*
         * SOMENTE CONTRATANTE.
         */

        if (
            tipo !== "contratante"
        ) {

            console.warn(
                "🚫 Acesso negado. Tipo:",
                tipo
            );


            mostrarToast(
                "Esta área é exclusiva para contratantes."
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1600);


            return false;

        }


        console.log(
            "✅ Acesso autorizado para contratante."
        );


        return true;


    } catch (erro) {

        console.error(
            "❌ Erro na verificação:",
            erro
        );


        redirecionarLogin();

        return false;

    }

}



/*
 * =========================================================
 * CARREGAR USUÁRIO + PERFIL
 * =========================================================
 */

async function carregarDadosUsuario() {

    if (
        typeof supabaseClient === "undefined"
    ) {

        throw new Error(
            "supabaseClient não está disponível."
        );

    }


    const {

        data: {
            user

        },

        error: erroAuth

    } =
        await supabaseClient.auth.getUser();


    if (erroAuth) {

        throw erroAuth;

    }


    if (!user) {

        return null;

    }


    /*
     * Dados básicos do usuário.
     */

    const {

        data: usuario,

        error: erroUsuario

    } =
        await supabaseClient

            .from(
                CONFIG.tabelaUsuarios
            )

            .select("*")

            .eq(
                "id",
                user.id
            )

            .maybeSingle();


    if (erroUsuario) {

        throw erroUsuario;

    }


    if (!usuario) {

        return null;

    }


    /*
     * Perfil do contratante.
     */

    const {

        data: perfil,

        error: erroPerfil

    } =
        await supabaseClient

            .from(
                CONFIG.tabelaPerfis
            )

            .select(`
                id,
                usuario_id,
                tipo_perfil_id,
                nome_exibicao,
                descricao,
                ativo,
                created_at,
                updated_at,
                tipos_perfil (
                    id,
                    nome,
                    descricao,
                    ativo
                )
            `)

            .eq(
                "usuario_id",
                user.id
            )

            .eq(
                "ativo",
                true
            )

            .maybeSingle();


    if (erroPerfil) {

        throw erroPerfil;

    }


    if (!perfil) {

        return {

            usuario,

            perfil: null,

            tipoPerfil: null

        };

    }


    return {

        usuario,

        perfil,

        tipoPerfil:
            perfil.tipos_perfil || null

    };

}



/*
 * =========================================================
 * SUPABASE
 * =========================================================
 */

async function carregarPerfilSupabase() {

    const dados =
        await carregarDadosUsuario();


    if (!dados) {

        return null;

    }


    usuarioAtual =
        dados.usuario;


    perfilAtual =
        dados.perfil;


    tipoPerfilAtual =
        dados.tipoPerfil;


    if (!perfilAtual) {

        return null;

    }


    const nome =
        perfilAtual.nome_exibicao ||
        usuarioAtual.nome ||
        "Contratante";


    const perfilFormatado = {

        id:
            perfilAtual.id,

        usuarioId:
            usuarioAtual.id,

        nome,

        iniciais:
            gerarIniciais(nome),

        tipo:
            "Contratante",

        localizacao:
            "Localização não informada",

        telefone:
            usuarioAtual.telefone ||
            "Não informado",

        email:
            usuarioAtual.email ||
            "Não informado",

        fotoUrl:
            usuarioAtual.foto_url ||
            "",

        descricao:
            perfilAtual.descricao ||
            "Adicione uma descrição sobre você, sua empresa ou sobre os eventos que costuma realizar.",

        ativo:
            perfilAtual.ativo,

        criadoEm:
            usuarioAtual.created_at ||
            perfilAtual.created_at ||
            null

    };


    salvarPerfilLocal(
        perfilFormatado
    );


    return perfilFormatado;

}



/*
 * =========================================================
 * PREENCHER PERFIL
 * =========================================================
 */

function preencherPerfil(perfil) {

    if (!perfil) {

        return;

    }


    const nome =
        document.getElementById(
            "contractorName"
        );


    const iniciais =
        document.getElementById(
            "profileInitials"
        );


    const tipo =
        document.getElementById(
            "contractorType"
        );


    const categoria =
        document.getElementById(
            "contractorCategory"
        );


    const localizacao =
        document.getElementById(
            "contractorLocation"
        );


    const telefone =
        document.getElementById(
            "contractorPhone"
        );


    const email =
        document.getElementById(
            "contractorEmail"
        );


    const bio =
        document.getElementById(
            "contractorBio"
        );


    const desde =
        document.getElementById(
            "contractorSince"
        );


    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    const status =
        document.getElementById(
            "profileStatus"
        );


    if (nome) {

        nome.textContent =
            perfil.nome;

    }


    if (iniciais) {

        iniciais.textContent =
            perfil.iniciais;

    }


    if (tipo) {

        tipo.textContent =
            perfil.tipo;

    }


    if (categoria) {

        categoria.textContent =
            perfil.tipo;

    }


    if (localizacao) {

        localizacao.textContent =
            perfil.localizacao;

    }


    if (telefone) {

        telefone.textContent =
            perfil.telefone;

    }


    if (email) {

        email.textContent =
            perfil.email;

    }


    if (bio) {

        bio.textContent =
            perfil.descricao;

    }


    if (desde) {

        desde.textContent =
            formatarData(
                perfil.criadoEm
            );

    }


    /*
     * Foto.
     */

    if (avatar) {

        if (perfil.fotoUrl) {

            avatar.style.backgroundImage =
                `url("${perfil.fotoUrl}")`;

            avatar.style.backgroundSize =
                "cover";

            avatar.style.backgroundPosition =
                "center";

            avatar.style.backgroundRepeat =
                "no-repeat";


            if (iniciais) {

                iniciais.style.display =
                    "none";

            }

        } else {

            avatar.style.backgroundImage =
                "";

            if (iniciais) {

                iniciais.style.display =
                    "flex";

            }

        }

    }


    /*
     * Status.
     */

    if (status) {

        if (perfil.ativo) {

            status.innerHTML = `

                <span class="status-dot"></span>

                Perfil ativo

            `;

            status.classList.add(
                "available"
            );

        } else {

            status.innerHTML = `

                <span class="status-dot"></span>

                Perfil inativo

            `;

        }

    }


    atualizarIcones();

}



/*
 * =========================================================
 * LOCAL STORAGE
 * =========================================================
 */

function salvarPerfilLocal(perfil) {

    try {

        localStorage.setItem(

            CONFIG.storageKey,

            JSON.stringify(perfil)

        );

    } catch (erro) {

        console.warn(
            "⚠️ Não foi possível salvar perfil local.",
            erro
        );

    }

}


function obterPerfilLocal() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.storageKey
            );


        return dados
            ? JSON.parse(dados)
            : null;


    } catch (erro) {

        return null;

    }

}



/*
 * =========================================================
 * ABAS
 * =========================================================
 */

function inicializarAbas() {

    const botoes =
        document.querySelectorAll(
            ".tab-button"
        );


    const conteudos =
        document.querySelectorAll(
            ".tab-content"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const nomeAba =
                        botao.dataset.tab;


                    botoes.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    conteudos.forEach(
                        conteudo => {

                            conteudo.classList.remove(
                                "active"
                            );

                        }
                    );


                    botao.classList.add(
                        "active"
                    );


                    const destino =
                        document.getElementById(
                            `tab-${nomeAba}`
                        );


                    if (destino) {

                        destino.classList.add(
                            "active"
                        );

                    }


                    if (
                        nomeAba ===
                        "carteira"
                    ) {

                        carregarResumoFinanceiro();

                    }

                }
            );

        }
    );

}



/*
 * =========================================================
 * BOTÕES
 * =========================================================
 */

function inicializarBotoes() {

    const voltar =
        document.getElementById(
            "btnVoltar"
        );


    if (voltar) {

        voltar.addEventListener(
            "click",
            voltarPagina
        );

    }


    const editar =
        document.getElementById(
            "btnEditarPerfil"
        );


    if (editar) {

        editar.addEventListener(
            "click",
            () => {

                if (
                    !perfilAtual?.id
                ) {

                    mostrarToast(
                        "Seu perfil ainda não está disponível para edição."
                    );

                    return;

                }


                window.location.href =
                    `editar-perfil-contratante.html?id=${encodeURIComponent(
                        perfilAtual.id
                    )}`;

            }
        );

    }


    const compartilhar =
        document.getElementById(
            "btnCompartilhar"
        );


    if (compartilhar) {

        compartilhar.addEventListener(
            "click",
            compartilharPerfil
        );

    }

}



/*
 * =========================================================
 * COMPARTILHAR
 * =========================================================
 */

async function compartilharPerfil() {

    const nome =
        document.getElementById(
            "contractorName"
        )?.textContent ||
        "Meu perfil";


    const texto =
        `Confira o perfil de ${nome} no MusicalWorld.`;


    const dadosCompartilhamento = {

        title:
            `${nome} - MusicalWorld`,

        text:
            texto,

        url:
            window.location.href

    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                dadosCompartilhamento
            );

            return;

        }


        await navigator.clipboard.writeText(
            window.location.href
        );


        mostrarToast(
            "Link do perfil copiado."
        );


    } catch (erro) {

        console.log(
            "Compartilhamento cancelado."
        );

    }

}



/*
 * =========================================================
 * RESUMO FINANCEIRO
 * =========================================================
 *
 * Os valores permanecem zerados até conectarmos
 * o sistema real de pagamentos/contratações.
 */

function carregarResumoFinanceiro() {

    const total =
        document.getElementById(
            "totalContratado"
        );


    const pendente =
        document.getElementById(
            "pagamentosPendentes"
        );


    const pago =
        document.getElementById(
            "totalPago"
        );


    if (total) {

        total.textContent =
            formatarMoeda(0);

    }


    if (pendente) {

        pendente.textContent =
            formatarMoeda(0);

    }


    if (pago) {

        pago.textContent =
            formatarMoeda(0);

    }

}



/*
 * =========================================================
 * UTILITÁRIOS
 * =========================================================
 */

function gerarIniciais(nome) {

    if (!nome) {

        return "U";

    }


    const partes =
        String(nome)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        partes.length === 1
    ) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0].charAt(0) +
        partes[
            partes.length - 1
        ].charAt(0)
    ).toUpperCase();

}



function formatarMoeda(valor) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(valor) || 0
    );

}



function formatarData(data) {

    if (!data) {

        return "—";

    }


    const dataObj =
        new Date(data);


    if (
        Number.isNaN(
            dataObj.getTime()
        )
    ) {

        return "—";

    }


    return dataObj.toLocaleDateString(
        "pt-BR",
        {
            month: "long",
            year: "numeric"
        }
    );

}



function atualizarIcones() {

    if (
        window.lucide &&
        typeof lucide.createIcons ===
            "function"
    ) {

        lucide.createIcons();

    }

}



function mostrarToast(mensagem) {

    const toast =
        document.getElementById(
            "toast"
        );


    const texto =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !texto
    ) {

        return;

    }


    texto.textContent =
        mensagem;


    toast.classList.add(
        "active"
    );


    clearTimeout(
        mostrarToast.timeout
    );


    mostrarToast.timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "active"
                );

            },
            3500
        );

}



function redirecionarLogin() {

    const pagina =
        window.location.pathname
            .split("/")
            .pop();


    const query =
        window.location.search || "";


    sessionStorage.setItem(
        "musicalworld_destino_login",
        `${pagina}${query}`
    );


    window.location.href =
        "login.html";

}



function voltarPagina() {

    if (
        window.history.length > 1
    ) {

        window.history.back();

    } else {

        window.location.href =
            "index.html";

    }

}



return {

    inicializar,

    verificarAcessoContratante,

    carregarPerfilSupabase,

    obterPerfilLocal,

    compartilharPerfil

};


})();

document.addEventListener(
"DOMContentLoaded",
() => {


    MusicalWorldMeuPerfilContratante.inicializar();

}


);
