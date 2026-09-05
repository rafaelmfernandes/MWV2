const MusicalWorldMeuPerfil = (() => {

    const CONFIG = {

        usarSupabase: false,

        tabelaPerfil: "perfis_artistas",
        tabelaServicos: "servicos_artistas",
        tabelaPortfolio: "portfolio_artistas",
        tabelaAgenda: "agenda_artistas",
        tabelaCarteira: "carteiras",
        tabelaTransacoes: "transacoes_financeiras",
        tabelaSaques: "saques",

        storageKey: "musicalworld_perfil_artista",
        carteiraStorageKey: "musicalworld_carteira_artista"

    };


    const perfilDemo = {

        id: "artista_demo_001",

        nome: "Rafael Melo",

        iniciais: "RM",

        categoria: "Cantor e violonista",

        localizacao: "Goiânia, GO",

        avaliacao: 4.9,

        avaliacoes: 128,

        verificado: true,

        disponivel: true,

        generos: [
            "MPB",
            "Pop",
            "Sertanejo"
        ],

        bio:
            "10 anos de estrada, repertório autoral e covers. " +
            "Toco em casamentos, aniversários, bares, restaurantes " +
            "e eventos corporativos, sozinho ou com banda.",

        experiencia: "10 anos",

        areaAtendimento: "Goiânia e região",

        servicos: [

            {
                id: "servico_001",
                nome: "Voz e violão",
                duracao: "2 horas",
                descricao: "Ideal para cerimônias e recepções",
                preco: 800
            },

            {
                id: "servico_002",
                nome: "Banda completa",
                duracao: "4 horas",
                descricao: "4 músicos, som e iluminação inclusos",
                preco: 2400
            }

        ]

    };


    const carteiraDemo = {

        saldoDisponivel: 0,

        saldoReceber: 0,

        totalRecebido: 0,

        transacoes: []

    };


    function obterIdArtista() {

        const params = new URLSearchParams(window.location.search);

        return (
            params.get("id") ||
            perfilDemo.id
        );

    }


    function obterPerfilLocal() {

        try {

            const dados =
                localStorage.getItem(CONFIG.storageKey);

            if (!dados) {

                return perfilDemo;

            }

            const perfil =
                JSON.parse(dados);

            return {
                ...perfilDemo,
                ...perfil
            };

        } catch (error) {

            console.warn(
                "Não foi possível carregar o perfil local.",
                error
            );

            return perfilDemo;

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
                "Erro ao salvar perfil.",
                error
            );

        }

    }


    function obterCarteiraLocal() {

        try {

            const dados =
                localStorage.getItem(
                    CONFIG.carteiraStorageKey
                );

            if (!dados) {

                return carteiraDemo;

            }

            return {
                ...carteiraDemo,
                ...JSON.parse(dados)
            };

        } catch (error) {

            console.warn(
                "Não foi possível carregar carteira.",
                error
            );

            return carteiraDemo;

        }

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


    function preencherPerfil(perfil) {

        const nome =
            document.getElementById("artistName");

        const iniciais =
            document.getElementById("profileInitials");

        const categoria =
            document.getElementById("artistCategory");

        const localizacao =
            document.getElementById("artistLocation");

        const rating =
            document.getElementById("artistRating");

        const reviews =
            document.getElementById("artistReviews");

        const bio =
            document.getElementById("artistBio");

        const genreList =
            document.getElementById("genreList");


        if (nome) {
            nome.textContent =
                perfil.nome || "Artista";
        }


        if (iniciais) {
            iniciais.textContent =
                perfil.iniciais ||
                gerarIniciais(perfil.nome);
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
                Number(perfil.avaliacao || 0)
                    .toFixed(1);
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


        if (genreList) {

            genreList.innerHTML = "";

            const generos =
                Array.isArray(perfil.generos)
                    ? perfil.generos
                    : [];

            generos.forEach(genero => {

                const tag =
                    document.createElement("span");

                tag.className =
                    "genre-tag";

                tag.textContent =
                    genero;

                genreList.appendChild(tag);

            });

        }


        preencherServicos(perfil.servicos);

    }


    function gerarIniciais(nome) {

        if (!nome) {
            return "MW";
        }

        return nome
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(
                palavra =>
                    palavra.charAt(0).toUpperCase()
            )
            .join("");

    }


    function preencherServicos(servicos) {

        const container =
            document.getElementById("servicesList");

        if (!container) {
            return;
        }

        container.innerHTML = "";


        if (!Array.isArray(servicos) ||
            servicos.length === 0) {

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


        servicos.forEach((servico, index) => {

            const card =
                document.createElement("article");

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
                        ${escaparHtml(servico.nome)}
                    </strong>

                    <span>
                        ${escaparHtml(servico.duracao || "")}
                    </span>

                    <small>
                        ${escaparHtml(servico.descricao || "")}
                    </small>

                </div>

                <div class="service-price">
                    ${formatarMoeda(servico.preco)}
                </div>

            `;

            container.appendChild(card);

        });


        atualizarIcones();

    }


    function preencherCarteira() {

        const carteira =
            obterCarteiraLocal();


        const saldo =
            document.getElementById("saldoDisponivel");

        const receber =
            document.getElementById("saldoReceber");

        const total =
            document.getElementById("totalRecebido");


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


        if (!Array.isArray(transacoes) ||
            transacoes.length === 0) {

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


        transacoes.forEach(transacao => {

            const card =
                document.createElement("div");

            const tipo =
                transacao.tipo || "recebimento";

            card.className =
                `transaction-card ${
                    tipo === "saque"
                        ? "withdrawal"
                        : "received"
                }`;


            const valor =
                Number(transacao.valor) || 0;


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
                            (negativo
                                ? "Saque"
                                : "Pagamento recebido")
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

            container.appendChild(card);

        });


        atualizarIcones();

    }


    function inicializarTabs() {

        const botoes =
            document.querySelectorAll(
                ".tab-button"
            );

        const abas =
            document.querySelectorAll(
                ".tab-content"
            );


        botoes.forEach(botao => {

            botao.addEventListener(
                "click",
                () => {

                    const tab =
                        botao.dataset.tab;


                    botoes.forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                    abas.forEach(aba => {

                        aba.classList.remove(
                            "active"
                        );

                    });


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


                    if (tab === "carteira") {

                        preencherCarteira();

                    }

                }
            );

        });

    }


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
                        obterIdArtista();

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


    function obterUrlPublicaPerfil() {

        const id =
            obterIdArtista();

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


        if (!modal || !qrImage) {
            return;
        }


        const url =
            obterUrlPublicaPerfil();


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


    function compartilharWhatsApp() {

        const perfil =
            obterPerfilLocal();

        const url =
            obterUrlPublicaPerfil();


        const mensagem =
            `Olá! Confira meu perfil de artista no MusicalWorld:\n\n` +
            `${perfil.nome}\n` +
            `${perfil.categoria}\n\n` +
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


    function solicitarSaque() {

        const carteira =
            obterCarteiraLocal();


        if (
            Number(carteira.saldoDisponivel) <= 0
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


    function mostrarToast(mensagem) {

        const toast =
            document.getElementById(
                "toast"
            );

        const texto =
            document.getElementById(
                "toastMessage"
            );


        if (!toast || !texto) {
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


    function escaparHtml(valor) {

        return String(valor ?? "")
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
            typeof lucide.createIcons === "function"
        ) {

            lucide.createIcons();

        }

    }


    async function carregarDoSupabase() {

        /*
            FUTURO SUPABASE

            Aqui será implementada a consulta:

            1. perfil do artista
            2. serviços
            3. portfólio
            4. agenda
            5. carteira
            6. transações
            7. saques

            Exemplo futuro:

            const { data, error } =
                await supabaseClient
                    .from(CONFIG.tabelaPerfil)
                    .select("*")
                    .eq("id", obterIdArtista())
                    .single();

        */

        return null;

    }


    async function inicializar() {

        const perfil =
            obterPerfilLocal();


        preencherPerfil(
            perfil
        );


        preencherCarteira();


        inicializarTabs();


        inicializarBotoes();


        atualizarIcones();


        if (CONFIG.usarSupabase) {

            try {

                const dados =
                    await carregarDoSupabase();

                if (dados) {

                    preencherPerfil(
                        dados.perfil
                    );

                    preencherCarteira();

                }

            } catch (error) {

                console.error(
                    "Erro ao carregar dados do Supabase:",
                    error
                );

            }

        }

    }


    document.addEventListener(
        "DOMContentLoaded",
        inicializar
    );


    return {

        obterPerfilLocal,

        obterCarteiraLocal,

        preencherPerfil,

        preencherCarteira,

        abrirQrCode,

        fecharQrCode

    };

})();