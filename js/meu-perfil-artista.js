const MusicalWorldMeuPerfil = (() => {


const CONFIG = {

    usarSupabase: true,

    tabelaUsuarios: "usuarios",
    tabelaPerfis: "perfis",
    tabelaTiposPerfil: "tipos_perfil",

    storageKey: "musicalworld_perfil_artista",
    carteiraStorageKey: "musicalworld_carteira_artista"

};


const carteiraDemo = {

    saldoDisponivel: 0,

    saldoReceber: 0,

    totalRecebido: 0,

    transacoes: []

};


let usuarioAtual = null;
let perfilAtual = null;
let dadosPerfil = null;


/*
 * =========================================================
 * INICIALIZAÇÃO
 * =========================================================
 */

async function inicializar() {

    try {

        console.log("🎤 Inicializando Meu Perfil de Artista...");


        /*
         * Primeiro garantimos que o usuário esteja autenticado.
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


        const usuarioSessao =
            await ControleSessao.iniciar({
                exigirLogin: true,
                redirecionarPara: "login.html"
            });


        if (!usuarioSessao) {

            console.warn(
                "🔒 Usuário não autenticado."
            );

            return;

        }


        /*
         * Agora verificamos o perfil.
         */

        const autorizado =
            await verificarAcessoArtista();


        if (!autorizado) {

            return;

        }


        /*
         * Carrega os dados reais do Supabase.
         */

        if (CONFIG.usarSupabase) {

            const dados =
                await carregarDoSupabase();

            if (dados) {

                dadosPerfil = dados;

                preencherPerfil(
                    dados.perfil
                );

            }

        }


        /*
         * Carteira continua zerada até criarmos
         * a estrutura financeira real.
         */

        preencherCarteira();


        inicializarTabs();

        inicializarBotoes();

        atualizarIcones();


        console.log(
            "✅ Meu Perfil de Artista carregado."
        );


    } catch (error) {

        console.error(
            "❌ Erro ao inicializar Meu Perfil:",
            error
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
 *
 * Somente usuários cujo tipo de perfil seja "artista"
 * podem acessar esta página.
 */

async function verificarAcessoArtista() {

    try {

        const dados =
            await carregarDadosUsuario();


        if (!dados) {

            console.error(
                "❌ Não foi possível identificar o usuário."
            );

            redirecionarLogin();

            return false;

        }


        usuarioAtual =
            dados.usuario;


        perfilAtual =
            dados.perfil;


        const tipoPerfil =
            dados.tipoPerfil;


        console.log(
            "👤 Usuário:",
            usuarioAtual
        );


        console.log(
            "🎭 Tipo de perfil:",
            tipoPerfil
        );


        /*
         * Se não houver perfil, não permitimos acesso.
         */

        if (!perfilAtual) {

            console.warn(
                "⚠️ Usuário não possui perfil cadastrado."
            );

            mostrarToast(
                "Seu perfil ainda não foi configurado."
            );


            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);


            return false;

        }


        /*
         * Identifica o nome do tipo.
         */

        const nomeTipo =
            String(
                tipoPerfil?.nome || ""
            )
            .trim()
            .toLowerCase();


        /*
         * SOMENTE ARTISTA.
         */

        if (
            nomeTipo !== "artista"
        ) {

            console.warn(
                "🚫 Acesso negado. Tipo de perfil:",
                nomeTipo
            );


            mostrarToast(
                "Esta área é exclusiva para artistas."
            );


            setTimeout(() => {

                /*
                 * Por enquanto voltamos para a página
                 * inicial. Futuramente teremos páginas
                 * específicas para cada tipo de usuário.
                 */

                window.location.href =
                    "index.html";

            }, 1600);


            return false;

        }


        console.log(
            "✅ Acesso autorizado para artista."
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Erro ao verificar acesso:",
            error
        );


        redirecionarLogin();

        return false;

    }

}


/*
 * =========================================================
 * CARREGAR DADOS DO USUÁRIO
 * =========================================================
 */

async function carregarDadosUsuario() {

    if (
        typeof supabaseClient === "undefined"
    ) {

        console.error(
            "❌ supabaseClient não está disponível."
        );

        return null;

    }


    /*
     * Obtém o usuário autenticado diretamente
     * da sessão do Supabase.
     */

    const {
        data: {
            user
        },
        error: erroSessao
    } =
        await supabaseClient.auth.getUser();


    if (erroSessao) {

        console.error(
            "❌ Erro ao obter usuário autenticado:",
            erroSessao
        );

        return null;

    }


    if (!user) {

        return null;

    }


    /*
     * Busca os dados públicos do usuário.
     */

    const {
        data: usuario,
        error: erroUsuario
    } =
        await supabaseClient
            .from(CONFIG.tabelaUsuarios)
            .select("*")
            .eq("id", user.id)
            .maybeSingle();


    if (erroUsuario) {

        console.error(
            "❌ Erro ao carregar usuarios:",
            erroUsuario
        );

        throw erroUsuario;

    }


    if (!usuario) {

        console.error(
            "❌ Registro do usuário não encontrado em usuarios."
        );

        return null;

    }


    /*
     * Busca o perfil do usuário.
     *
     * O relacionamento com tipos_perfil permite descobrir
     * se este usuário é artista.
     */

    const {
        data: perfil,
        error: erroPerfil
    } =
        await supabaseClient
            .from(CONFIG.tabelaPerfis)
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
            .eq("usuario_id", user.id)
            .eq("ativo", true)
            .maybeSingle();


    if (erroPerfil) {

        console.error(
            "❌ Erro ao carregar perfil:",
            erroPerfil
        );

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
 * CARREGAR PERFIL DO SUPABASE
 * =========================================================
 */

async function carregarDoSupabase() {

    const dados =
        await carregarDadosUsuario();


    if (!dados) {

        return null;

    }


    usuarioAtual =
        dados.usuario;


    perfilAtual =
        dados.perfil;


    const usuario =
        dados.usuario || {};


    const perfil =
        dados.perfil || {};


    const tipoPerfil =
        dados.tipoPerfil || {};


    /*
     * Montamos aqui um objeto intermediário.
     *
     * Ele representa o que a página precisa hoje,
     * sem obrigar o banco a possuir todas as futuras
     * tabelas de artista.
     */

    const nome =
        perfil.nome_exibicao ||
        usuario.nome ||
        "Artista";


    const descricao =
        perfil.descricao ||
        "Adicione uma descrição ao seu perfil.";


    const dadosFormatados = {

        id:
            perfil.id || null,

        usuarioId:
            usuario.id || null,

        nome,

        iniciais:
            gerarIniciais(nome),

        categoria:
            "Artista musical",

        tipoPerfil:
            tipoPerfil.nome || "artista",

        localizacao:
            "Localização não informada",

        fotoUrl:
            usuario.foto_url || "",

        avaliacao:
            0,

        avaliacoes:
            0,

        verificado:
            false,

        disponivel:
            true,

        generos: [],

        bio:
            descricao,

        experiencia:
            "Não informada",

        areaAtendimento:
            "Não informada",

        servicos: []

    };


    /*
     * Salvamos somente uma cópia local para recursos
     * que ainda serão implementados.
     */

    salvarPerfilLocal(
        dadosFormatados
    );


    return {

        usuario,

        perfil: dadosFormatados,

        tipoPerfil

    };

}


/*
 * =========================================================
 * PERFIL LOCAL
 * =========================================================
 */

function obterPerfilLocal() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.storageKey
            );


        if (!dados) {

            return {

                id:
                    perfilAtual?.id || null,

                usuarioId:
                    usuarioAtual?.id || null,

                nome:
                    perfilAtual?.nome_exibicao ||
                    usuarioAtual?.nome ||
                    "Artista",

                iniciais:
                    gerarIniciais(
                        perfilAtual?.nome_exibicao ||
                        usuarioAtual?.nome ||
                        "Artista"
                    ),

                categoria:
                    "Artista musical",

                localizacao:
                    "Localização não informada",

                avaliacao: 0,

                avaliacoes: 0,

                verificado: false,

                disponivel: true,

                generos: [],

                bio:
                    perfilAtual?.descricao ||
                    "Adicione uma descrição ao seu perfil.",

                experiencia:
                    "Não informada",

                areaAtendimento:
                    "Não informada",

                servicos: []

            };

        }


        return JSON.parse(dados);


    } catch (error) {

        console.warn(
            "⚠️ Não foi possível carregar perfil local.",
            error
        );


        return {

            nome:
                usuarioAtual?.nome ||
                "Artista",

            iniciais:
                gerarIniciais(
                    usuarioAtual?.nome ||
                    "Artista"
                ),

            categoria:
                "Artista musical",

            localizacao:
                "Localização não informada",

            avaliacao: 0,

            avaliacoes: 0,

            verificado: false,

            disponivel: true,

            generos: [],

            bio:
                "Adicione uma descrição ao seu perfil.",

            servicos: []

        };

    }

}


function salvarPerfilLocal(perfil) {

    try {

        localStorage.setItem(
            CONFIG.storageKey,
            JSON.stringify(perfil)
        );

    } catch (error) {

        console.error(
            "❌ Erro ao salvar perfil local.",
            error
        );

    }

}


/*
 * =========================================================
 * CARTEIRA
 * =========================================================
 *
 * Ainda não conectamos a carteira ao sistema financeiro.
 * Por segurança, não vamos inventar saldo.
 */

function obterCarteiraLocal() {

    try {

        const dados =
            localStorage.getItem(
                CONFIG.carteiraStorageKey
            );


        if (!dados) {

            return {
                ...carteiraDemo
            };

        }


        return {

            ...carteiraDemo,

            ...JSON.parse(dados)

        };


    } catch (error) {

        console.warn(
            "⚠️ Não foi possível carregar carteira.",
            error
        );


        return {
            ...carteiraDemo
        };

    }

}


function preencherCarteira() {

    const carteira =
        obterCarteiraLocal();


    const saldo =
        document.getElementById(
            "saldoDisponivel"
        );


    const receber =
        document.getElementById(
            "saldoReceber"
        );


    const total =
        document.getElementById(
            "totalRecebido"
        );


    if (saldo) {

        saldo.textContent =
            formatarMoeda(
                carteira.saldoDisponivel
            );

    }


    if (receber) {

        receber.textContent =
            formatarMoeda(
                carteira.saldoReceber
            );

    }


    if (total) {

        total.textContent =
            formatarMoeda(
                carteira.totalRecebido
            );

    }


    preencherTransacoes(
        carteira.transacoes
    );

}


function preencherTransacoes(transacoes) {

    const container =
        document.getElementById(
            "transactionList"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(transacoes) ||
        transacoes.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-transactions">

                <i data-lucide="receipt"></i>

                <strong>
                    Nenhuma movimentação ainda
                </strong>

                <span>
                    Quando você receber pagamentos pelos
                    seus serviços, eles aparecerão aqui.
                </span>

            </div>

        `;


        atualizarIcones();


        return;

    }


    container.innerHTML = "";


    transacoes.forEach(
        transacao => {

            const card =
                document.createElement(
                    "div"
                );


            const tipo =
                transacao.tipo ||
                "recebimento";


            card.className =
                `transaction-card ${
                    tipo === "saque"
                        ? "withdrawal"
                        : "received"
                }`;


            const valor =
                Number(
                    transacao.valor
                ) || 0;


            const negativo =
                tipo === "saque";


            card.innerHTML = `

                <div class="transaction-icon">

                    <i data-lucide="${
                        negativo
                            ? "arrow-up-right"
                            : "arrow-down-left"
                    }"></i>

                </div>

                <div class="transaction-info">

                    <strong>
                        ${escaparHtml(
                            transacao.descricao ||
                            (
                                negativo
                                    ? "Saque"
                                    : "Pagamento recebido"
                            )
                        )}
                    </strong>

                    <span>
                        ${escaparHtml(
                            transacao.data || ""
                        )}
                    </span>

                </div>

                <div class="transaction-value ${
                    negativo
                        ? "negative"
                        : "positive"
                }">

                    ${negativo ? "-" : "+"}
                    ${formatarMoeda(valor)}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    atualizarIcones();

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
            "artistName"
        );


    const iniciais =
        document.getElementById(
            "profileInitials"
        );


    const categoria =
        document.getElementById(
            "artistCategory"
        );


    const localizacao =
        document.getElementById(
            "artistLocation"
        );


    const rating =
        document.getElementById(
            "artistRating"
        );


    const reviews =
        document.getElementById(
            "artistReviews"
        );


    const bio =
        document.getElementById(
            "artistBio"
        );


    const genreList =
        document.getElementById(
            "genreList"
        );


    const avatar =
        document.getElementById(
            "profileAvatar"
        );


    const verifiedBadge =
        document.getElementById(
            "verifiedBadge"
        );


    if (nome) {

        nome.textContent =
            perfil.nome ||
            "Artista";

    }


    if (iniciais) {

        iniciais.textContent =
            perfil.iniciais ||
            gerarIniciais(
                perfil.nome
            );

    }


    if (categoria) {

        categoria.textContent =
            perfil.categoria ||
            "Artista musical";

    }


    if (localizacao) {

        localizacao.textContent =
            perfil.localizacao ||
            "Localização não informada";

    }


    if (rating) {

        rating.textContent =
            Number(
                perfil.avaliacao || 0
            ).toFixed(1);

    }


    if (reviews) {

        reviews.textContent =
            `${perfil.avaliacoes || 0} avaliações`;

    }


    if (bio) {

        bio.textContent =
            perfil.bio ||
            "Adicione uma descrição ao seu perfil.";

    }


    /*
     * Foto do usuário.
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
     * Badge de verificação.
     *
     * Por enquanto permanece oculto porque ainda não
     * temos o sistema de verificação implementado.
     */

    if (verifiedBadge) {

        verifiedBadge.style.display =
            perfil.verificado
                ? "flex"
                : "none";

    }


    /*
     * Gêneros.
     */

    if (genreList) {

        genreList.innerHTML = "";


        const generos =
            Array.isArray(
                perfil.generos
            )
                ? perfil.generos
                : [];


        if (
            generos.length === 0
        ) {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "genre-tag";


            tag.textContent =
                "Gêneros não informados";


            genreList.appendChild(
                tag
            );


        } else {

            generos.forEach(
                genero => {

                    const tag =
                        document.createElement(
                            "span"
                        );


                    tag.className =
                        "genre-tag";


                    tag.textContent =
                        genero;


                    genreList.appendChild(
                        tag
                    );

                }
            );

        }

    }


    preencherServicos(
        perfil.servicos
    );


    atualizarIcones();

}


/*
 * =========================================================
 * SERVIÇOS
 * =========================================================
 */

function preencherServicos(servicos) {

    const container =
        document.getElementById(
            "servicesList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !Array.isArray(servicos) ||
        servicos.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-transactions">

                <i data-lucide="music-2"></i>

                <strong>
                    Nenhum serviço cadastrado
                </strong>

                <span>
                    Adicione seus serviços no seu perfil.
                </span>

            </div>

        `;


        atualizarIcones();


        return;

    }


    servicos.forEach(
        (servico, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "service-card";


            card.innerHTML = `

                <div class="service-icon">

                    <i data-lucide="${
                        index % 2 === 0
                            ? "guitar"
                            : "users"
                    }"></i>

                </div>

                <div class="service-info">

                    <strong>
                        ${escaparHtml(
                            servico.nome
                        )}
                    </strong>

                    <span>
                        ${escaparHtml(
                            servico.duracao || ""
                        )}
                    </span>

                    <small>
                        ${escaparHtml(
                            servico.descricao || ""
                        )}
                    </small>

                </div>

                <div class="service-price">
                    ${formatarMoeda(
                        servico.preco
                    )}
                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    atualizarIcones();

}


/*
 * =========================================================
 * ABAS
 * =========================================================
 */

function inicializarTabs() {

    const botoes =
        document.querySelectorAll(
            ".tab-button"
        );


    const abas =
        document.querySelectorAll(
            ".tab-content"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    const tab =
                        botao.dataset.tab;


                    botoes.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    abas.forEach(
                        aba => {

                            aba.classList.remove(
                                "active"
                            );

                        }
                    );


                    botao.classList.add(
                        "active"
                    );


                    const destino =
                        document.getElementById(
                            `tab-${tab}`
                        );


                    if (destino) {

                        destino.classList.add(
                            "active"
                        );

                    }


                    if (
                        tab === "carteira"
                    ) {

                        preencherCarteira();

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

                const id =
                    perfilAtual?.id ||
                    "";


                if (!id) {

                    mostrarToast(
                        "Seu perfil ainda não possui um ID válido."
                    );


                    return;

                }


                window.location.href =
                    `editar-perfil-artista.html?id=${encodeURIComponent(id)}`;

            }
        );

    }


    const qr =
        document.getElementById(
            "btnQrCode"
        );


    if (qr) {

        qr.addEventListener(
            "click",
            abrirQrCode
        );

    }


    const fecharQr =
        document.getElementById(
            "btnFecharQr"
        );


    if (fecharQr) {

        fecharQr.addEventListener(
            "click",
            fecharQrCode
        );

    }


    const overlay =
        document.getElementById(
            "qrOverlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            fecharQrCode
        );

    }


    const whatsapp =
        document.getElementById(
            "btnWhatsApp"
        );


    if (whatsapp) {

        whatsapp.addEventListener(
            "click",
            compartilharWhatsApp
        );

    }


    const sacar =
        document.getElementById(
            "btnSacar"
        );


    if (sacar) {

        sacar.addEventListener(
            "click",
            solicitarSaque
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                fecharQrCode();

            }

        }
    );

}


/*
 * =========================================================
 * VOLTAR
 * =========================================================
 */

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


/*
 * =========================================================
 * QR CODE
 * =========================================================
 */

function obterIdArtista() {

    return (
        perfilAtual?.id ||
        dadosPerfil?.perfil?.id ||
        ""
    );

}


function obterUrlPublicaPerfil() {

    const id =
        obterIdArtista();


    if (!id) {

        return "";

    }


    return (
        `${window.location.origin}` +
        `${window.location.pathname
            .split("/")
            .slice(0, -1)
            .join("/")}` +
        `/perfil-artista.html?id=${encodeURIComponent(id)}`
    );

}


function abrirQrCode() {

    const modal =
        document.getElementById(
            "qrModal"
        );


    const qrImage =
        document.getElementById(
            "qrImage"
        );


    const profileLink =
        document.getElementById(
            "profileLink"
        );


    if (
        !modal ||
        !qrImage
    ) {

        return;

    }


    const url =
        obterUrlPublicaPerfil();


    if (!url) {

        mostrarToast(
            "Não foi possível gerar o link do perfil."
        );


        return;

    }


    const qrUrl =
        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;


    qrImage.src =
        qrUrl;


    if (profileLink) {

        profileLink.textContent =
            url;

    }


    modal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


function fecharQrCode() {

    const modal =
        document.getElementById(
            "qrModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


/*
 * =========================================================
 * WHATSAPP
 * =========================================================
 */

function compartilharWhatsApp() {

    const perfil =
        dadosPerfil?.perfil ||
        obterPerfilLocal();


    const url =
        obterUrlPublicaPerfil();


    if (!url) {

        mostrarToast(
            "Não foi possível obter o link do perfil."
        );


        return;

    }


    const mensagem =
        `Olá! Confira meu perfil de artista no MusicalWorld:\n\n` +
        `${perfil.nome || "Artista"}\n` +
        `${perfil.categoria || "Artista musical"}\n\n` +
        `${url}`;


    const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(
            mensagem
        )}`;


    window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
    );

}


/*
 * =========================================================
 * SAQUE
 * =========================================================
 */

function solicitarSaque() {

    const carteira =
        obterCarteiraLocal();


    if (
        Number(
            carteira.saldoDisponivel
        ) <= 0
    ) {

        mostrarToast(
            "Você ainda não possui saldo disponível para saque."
        );


        return;

    }


    mostrarToast(
        "A área de saques será conectada ao sistema financeiro."
    );

}


/*
 * =========================================================
 * TOAST
 * =========================================================
 */

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


/*
 * =========================================================
 * UTILITÁRIOS
 * =========================================================
 */

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


function gerarIniciais(nome) {

    if (!nome) {

        return "MW";

    }


    return String(nome)
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(
            palavra =>
                palavra
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


function escaparHtml(valor) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
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


function redirecionarLogin() {

    const paginaAtual =
        window.location.pathname
            .split("/")
            .pop();


    const query =
        window.location.search || "";


    sessionStorage.setItem(
        "musicalworld_destino_login",
        `${paginaAtual}${query}`
    );


    window.location.href =
        "login.html";

}


/*
 * =========================================================
 * DOM
 * =========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    inicializar
);


/*
 * =========================================================
 * API PÚBLICA
 * =========================================================
 */

return {

    obterPerfilLocal,

    obterCarteiraLocal,

    preencherPerfil,

    preencherCarteira,

    abrirQrCode,

    fecharQrCode,

    verificarAcessoArtista,

    carregarDoSupabase

};


})();
