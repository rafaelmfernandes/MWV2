const EditarPerfilMusico = (() => {

const estado = {
usuarioAuth: null,
usuario: null,
perfil: null,
perfilArtista: null,
fotoArquivo: null,
salvando: false,

abaAtual: "sobre",

portfolio: [],
agenda: [],

tipoMedia: "imagem",

editandoPortfolioId: null,
editandoAgendaId: null,
servicosValores: [],
editandoServicoId: null,

};

const ids = {

nome: "nome",
nomeExibicao: "nomeExibicao",
telefone: "telefone",
localizacao: "localizacao",
descricao: "descricao",
experiencia: "experiencia",
areaAtendimento: "areaAtendimento",
tipoArtista: "tipoArtista",
disponivel: "disponivel",

emailConta: "emailConta",

avatarImage: "avatarImage",
avatarInitials: "avatarInitials",
fotoInput: "fotoInput",
btnFoto: "btnFoto",

form: "formEditarPerfil",

btnSalvar: "btnSalvar",
btnSalvarTopo: "btnSalvarTopo",

btnVoltar: "btnVoltar",
btnCancelar: "btnCancelar",

contadorDescricao: "contadorDescricao",

portfolioTitulo: "portfolioTitulo",
portfolioDescricao: "portfolioDescricao",
portfolioArquivo: "portfolioArquivo",
portfolioUrl: "portfolioUrl",
portfolioAjuda: "portfolioAjuda",
btnAdicionarPortfolio: "btnAdicionarPortfolio",
portfolioEditList: "portfolioEditList",

agendaTitulo: "agendaTitulo",
agendaTipo: "agendaTipo",
agendaInicio: "agendaInicio",
agendaFim: "agendaFim",
agendaLocalizacao: "agendaLocalizacao",
agendaDescricao: "agendaDescricao",
agendaStatus: "agendaStatus",
btnAdicionarAgenda: "btnAdicionarAgenda",
agendaEditList: "agendaEditList",

toast: "toast",
toastMessage: "toastMessage",

loadingOverlay: "loadingOverlay",
loadingText: "loadingText",

servicoNome: "servicoNome",
servicoDescricao: "servicoDescricao",
servicoDuracao: "servicoDuracao",
servicoTipoPreco: "servicoTipoPreco",
servicoValor: "servicoValor",
servicoAtivo: "servicoAtivo",
campoValorServico: "campoValorServico",
btnAdicionarServico: "btnAdicionarServico",
btnCancelarServico: "btnCancelarServico",
servicosList: "servicosList",

};

const BUCKET_FOTOS = "perfil-musico";
const BUCKET_PORTFOLIO = "portfolio-musicos";

/*

=====================================================
TIPOS DE ARTISTA
=====================================================
*/

const PAGINAS_TIPOS_ARTISTA = {
"Cantor(a)": "editar-perfil-cantor.html",
"Músico(a)": "editar-perfil-musico.html",
"Banda": "editar-perfil-banda.html",
"Dupla musical": "editar-perfil-dupla-musical.html",
"DJ": "editar-perfil-dj.html",
"Dançarino(a)": "editar-perfil-dancarino.html",
"Grupo de dança": "editar-perfil-grupo-danca.html",
"MC": "editar-perfil-mc.html",
"Compositor(a)": "editar-perfil-compositor.html",
"Produtor(a) musical": "editar-perfil-produtor-musical.html"
};

function el(id) {
return document.getElementById(id);
}

function normalizarArray(valor) {

if (Array.isArray(valor)) {

    return valor
        .filter(Boolean)
        .map(item => String(item).trim())
        .filter(Boolean);

}

if (typeof valor === "string") {

    return valor
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

}

return [];

}

function obterIniciais(nome) {

const partes = String(nome || "Usuário")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

if (!partes.length) {
    return "U";
}

if (partes.length === 1) {

    return partes[0]
        .slice(0, 2)
        .toUpperCase();

}

return (
    partes[0][0] +
    partes[partes.length - 1][0]
).toUpperCase();

}

function escaparHtml(valor) {

return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function removerAcentos(valor) {

return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}

function normalizarTipoArtista(valor) {

const original =
    String(valor || "").trim();

if (!original) {
    return "";
}


const comparacao =
    removerAcentos(original)
        .toLowerCase();


const equivalencias = {

    "cantor": "Cantor(a)",
    "cantor(a)": "Cantor(a)",

    "musico": "Músico(a)",
    "musico(a)": "Músico(a)",

    "banda": "Banda",

    "dupla": "Dupla musical",
    "dupla musical": "Dupla musical",

    "dj": "DJ",

    "dancarino": "Dançarino(a)",
    "dancarino(a)": "Dançarino(a)",

    "grupo de danca": "Grupo de dança",

    "mc": "MC",

    "compositor": "Compositor(a)",
    "compositor(a)": "Compositor(a)",

    "produtor musical": "Produtor(a) musical",
    "produtor(a) musical": "Produtor(a) musical"
};


return equivalencias[comparacao] || original;

}

function obterPaginaPorTipoArtista(tipoArtista) {

const tipoNormalizado =
    normalizarTipoArtista(tipoArtista);

return PAGINAS_TIPOS_ARTISTA[
    tipoNormalizado
] || null;

}

function mostrarLoading(texto = "Carregando...") {

const overlay = el(ids.loadingOverlay);
const textoEl = el(ids.loadingText);

if (textoEl) {
    textoEl.textContent = texto;
}

if (overlay) {
    overlay.style.display = "grid";
}

}

function esconderLoading() {

const overlay = el(ids.loadingOverlay);

if (overlay) {
    overlay.style.display = "none";
}

}

function mostrarToast(mensagem, erro = false) {

const toast = el(ids.toast);
const texto = el(ids.toastMessage);

if (!toast || !texto) {
    return;
}

texto.textContent = mensagem;

toast.classList.toggle("erro", erro);

toast.classList.add("visivel");

clearTimeout(mostrarToast.timer);

mostrarToast.timer = setTimeout(() => {

    toast.classList.remove("visivel");

}, 3500);

}

function marcarChips(containerId, valores) {

const container = el(containerId);

if (!container) {
    return;
}

const selecionados = new Set(
    normalizarArray(valores)
        .map(valor => valor.toLowerCase())
);

container
    .querySelectorAll(".chip")
    .forEach(chip => {

        const valor =
            chip.dataset.value || "";

        chip.classList.toggle(
            "ativo",
            selecionados.has(
                valor.toLowerCase()
            )
        );

    });

}

function obterChipsSelecionados(containerId) {

const container = el(containerId);

if (!container) {
    return [];
}

return [
    ...container.querySelectorAll(".chip.ativo")
]
    .map(chip => chip.dataset.value)
    .filter(Boolean);

}

function inicializarChips() {

document
    .querySelectorAll(".chips .chip")
    .forEach(chip => {

        chip.addEventListener(
            "click",
            () => {

                chip.classList.toggle("ativo");

            }
        );

    });

}

function preencherFormulario() {

const usuario =
    estado.usuario || {};

const perfil =
    estado.perfil || {};

const artista =
    estado.perfilArtista || {};


const campoNome = el(ids.nome);
const campoNomeExibicao = el(ids.nomeExibicao);
const campoTelefone = el(ids.telefone);
const campoLocalizacao = el(ids.localizacao);
const campoDescricao = el(ids.descricao);
const campoExperiencia = el(ids.experiencia);
const campoArea = el(ids.areaAtendimento);
const campoTipo = el(ids.tipoArtista);
const campoDisponivel = el(ids.disponivel);
const campoEmail = el(ids.emailConta);


if (campoNome) {
    campoNome.value = usuario.nome || "";
}

if (campoNomeExibicao) {

    campoNomeExibicao.value =
        perfil.nome_exibicao ||
        usuario.nome ||
        "";

}

if (campoTelefone) {
    campoTelefone.value = usuario.telefone || "";
}

if (campoLocalizacao) {
    campoLocalizacao.value =
        artista.localizacao || "";
}

if (campoDescricao) {
    campoDescricao.value =
        perfil.descricao || "";
}

if (campoExperiencia) {
    campoExperiencia.value =
        artista.experiencia || "";
}

if (campoArea) {
    campoArea.value =
        artista.area_atendimento || "";
}

if (campoTipo) {
    campoTipo.value =
        artista.tipo_artista || "";
}

if (campoDisponivel) {

    campoDisponivel.checked =
        artista.disponivel !== false;

}

if (campoEmail) {

    campoEmail.textContent =
        estado.usuarioAuth?.email ||
        usuario.email ||
        "Não informado";

}


marcarChips(
    "instrumentos",
    artista.instrumentos
);

marcarChips(
    "estilos",
    artista.estilos
);

marcarChips(
    "servicos",
    artista.servicos
);


atualizarContador();
preencherAvatar();

}

function preencherAvatar() {

const usuario =
    estado.usuario || {};

const perfil =
    estado.perfil || {};

const artista =
    estado.perfilArtista || {};


const foto =
    artista.foto_url ||
    usuario.foto_url ||
    "";


const img =
    el(ids.avatarImage);

const initials =
    el(ids.avatarInitials);


if (foto && img) {

    img.src = foto;
    img.style.display = "block";

    if (initials) {
        initials.style.display = "none";
    }

    return;
}


if (img) {

    img.removeAttribute("src");
    img.style.display = "none";

}


if (initials) {

    initials.textContent =
        obterIniciais(
            perfil.nome_exibicao ||
            usuario.nome ||
            "Usuário"
        );

    initials.style.display =
        "block";
}

}

function atualizarContador() {

const campo =
    el(ids.descricao);

const contador =
    el(ids.contadorDescricao);

if (campo && contador) {

    contador.textContent =
        String(campo.value.length);

}

}

async function carregarDados() {

estado.usuarioAuth =
    await Sessao.usuarioAtual();


if (!estado.usuarioAuth) {

    sessionStorage.setItem(
        "musicalworld_destino_login",
        "editar-perfil-musico.html"
    );

    window.location.href =
        "login.html";

    return false;
}


const resultadoUsuario =
    await supabaseClient
        .from("usuarios")
        .select(`
            id,
            nome,
            email,
            telefone,
            foto_url,
            ativo
        `)
        .eq(
            "id",
            estado.usuarioAuth.id
        )
        .single();


if (resultadoUsuario.error) {
    throw resultadoUsuario.error;
}


estado.usuario =
    resultadoUsuario.data;


const resultadoPerfil =
    await supabaseClient
        .from("perfis")
        .select(`
            id,
            usuario_id,
            tipo_perfil_id,
            nome_exibicao,
            descricao,
            ativo,
            tipos_perfil (
                id,
                nome,
                descricao
            )
        `)
        .eq(
            "usuario_id",
            estado.usuarioAuth.id
        )
        .eq(
            "ativo",
            true
        );


if (resultadoPerfil.error) {
    throw resultadoPerfil.error;
}


const perfilArtista =
    (resultadoPerfil.data || [])
        .find(item =>
            String(
                item.tipos_perfil?.nome || ""
            ).toLowerCase() === "artista"
        );


if (!perfilArtista) {

    mostrarToast(
        "Perfil de artista não encontrado.",
        true
    );

    setTimeout(() => {

        window.location.href =
            "index.html";

    }, 1200);

    return false;
}


estado.perfil =
    perfilArtista;


const resultadoArtista =
    await supabaseClient
        .from("perfis_artistas")
        .select(`
            id,
            perfil_id,
            tipo_artista,
            localizacao,
            experiencia,
            area_atendimento,
            disponivel,
            instrumentos,
            estilos,
            servicos,
            foto_url,
            created_at,
            updated_at
        `)
        .eq(
            "perfil_id",
            perfilArtista.id
        )
        .maybeSingle();


if (resultadoArtista.error) {
    throw resultadoArtista.error;
}


estado.perfilArtista =
    resultadoArtista.data || {
        perfil_id: perfilArtista.id,
        tipo_artista: "",
        localizacao: "",
        experiencia: "",
        area_atendimento: "",
        disponivel: true,
        instrumentos: [],
        estilos: [],
        servicos: [],
        foto_url: null
    };


preencherFormulario();

await Promise.all([
    carregarPortfolio(),
    carregarAgenda(),
    carregarServicosValores()
]);


return true;

}

async function fazerUploadFoto() {

if (!estado.fotoArquivo) {

    return (
        estado.perfilArtista?.foto_url ||
        estado.usuario?.foto_url ||
        null
    );

}


const arquivo =
    estado.fotoArquivo;


const usuarioId =
    estado.usuarioAuth.id;


const extensao =
    arquivo.name
        .split(".")
        .pop()
        .toLowerCase();


const caminho =
    `${usuarioId}/perfil.${extensao}`;


const upload =
    await supabaseClient
        .storage
        .from(BUCKET_FOTOS)
        .upload(
            caminho,
            arquivo,
            {
                cacheControl: "3600",
                upsert: true,
                contentType: arquivo.type
            }
        );


if (upload.error) {
    throw upload.error;
}


const urlResultado =
    supabaseClient
        .storage
        .from(BUCKET_FOTOS)
        .getPublicUrl(caminho);


return (
    urlResultado?.data?.publicUrl ||
    null
);

}

async function salvarSobre() {

if (estado.salvando) {
    return;
}


const campoNome =
    el(ids.nome);

const campoNomeExibicao =
    el(ids.nomeExibicao);

const campoDescricao =
    el(ids.descricao);

const campoExperiencia =
    el(ids.experiencia);

const campoArea =
    el(ids.areaAtendimento);

const campoTipo =
    el(ids.tipoArtista);

const campoTelefone =
    el(ids.telefone);

const campoLocalizacao =
    el(ids.localizacao);

const campoDisponivel =
    el(ids.disponivel);


const nome =
    campoNome?.value.trim() || "";

const nomeExibicao =
    campoNomeExibicao?.value.trim() || "";

const descricao =
    campoDescricao?.value.trim() || "";

const experiencia =
    campoExperiencia?.value.trim() || "";

const areaAtendimento =
    campoArea?.value.trim() || "";

const tipoArtistaSelecionado =
    campoTipo?.value || "";

const tipoArtistaAtual =
    estado.perfilArtista?.tipo_artista || "";

const tipoArtistaNovo =
    normalizarTipoArtista(
        tipoArtistaSelecionado
    );

const tipoArtistaAnterior =
    normalizarTipoArtista(
        tipoArtistaAtual
    );


const telefone =
    campoTelefone?.value.trim() || "";

const localizacao =
    campoLocalizacao?.value.trim() || "";

const disponivel =
    campoDisponivel?.checked === true;


if (!nome) {

    mostrarToast(
        "Informe seu nome completo.",
        true
    );

    campoNome?.focus();

    return;
}


if (!nomeExibicao) {

    mostrarToast(
        "Informe seu nome artístico ou nome de exibição.",
        true
    );

    campoNomeExibicao?.focus();

    return;
}


if (descricao.length > 1000) {

    mostrarToast(
        "A descrição pode ter no máximo 1000 caracteres.",
        true
    );

    campoDescricao?.focus();

    return;
}


if (!tipoArtistaNovo) {

    mostrarToast(
        "Selecione um tipo de artista.",
        true
    );

    campoTipo?.focus();

    return;
}


const paginaNovoTipo =
    obterPaginaPorTipoArtista(
        tipoArtistaNovo
    );


if (!paginaNovoTipo) {

    mostrarToast(
        "Esse tipo de artista não está disponível.",
        true
    );

    campoTipo?.focus();

    return;
}


const tipoFoiAlterado =
    tipoArtistaAnterior !==
    tipoArtistaNovo;


if (tipoFoiAlterado) {

    const confirmar =
        window.confirm(
            `Seu tipo de artista será alterado para ${tipoArtistaNovo}. Algumas informações do seu perfil podem precisar ser preenchidas novamente.\n\nDeseja continuar?`
        );


    if (!confirmar) {
        return;
    }

}


estado.salvando = true;


const botaoSalvar =
    el(ids.btnSalvar);

const botaoTopo =
    el(ids.btnSalvarTopo);


if (botaoSalvar) {

    botaoSalvar.disabled = true;
    botaoSalvar.textContent =
        "Salvando...";

}


if (botaoTopo) {
    botaoTopo.disabled = true;
}


try {

    mostrarLoading(
        tipoFoiAlterado
            ? "Alterando tipo de artista..."
            : "Salvando perfil..."
    );


    const instrumentos =
        obterChipsSelecionados(
            "instrumentos"
        );

    const estilos =
        obterChipsSelecionados(
            "estilos"
        );

    const servicos =
        obterChipsSelecionados(
            "servicos"
        );


    let fotoUrl =
        estado.perfilArtista?.foto_url ||
        estado.usuario?.foto_url ||
        null;


    if (estado.fotoArquivo) {

        fotoUrl =
            await fazerUploadFoto();

    }


    const resultadoUsuario =
        await supabaseClient
            .from("usuarios")
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


    if (resultadoUsuario.error) {
        throw resultadoUsuario.error;
    }


    const resultadoPerfil =
        await supabaseClient
            .from("perfis")
            .update({
                nome_exibicao:
                    nomeExibicao,
                descricao:
                    descricao || null,
                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "id",
                estado.perfil.id
            )
            .eq(
                "usuario_id",
                estado.usuarioAuth.id
            );


    if (resultadoPerfil.error) {
        throw resultadoPerfil.error;
    }


    const dadosArtista = {

        tipo_artista:
            tipoFoiAlterado
                ? tipoArtistaNovo
                : tipoArtistaAtual,

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
            new Date().toISOString()

    };


    let resultadoArtista;


    if (estado.perfilArtista?.id) {

        resultadoArtista =
            await supabaseClient
                .from("perfis_artistas")
                .update(dadosArtista)
                .eq(
                    "id",
                    estado.perfilArtista.id
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                );

    } else {

        resultadoArtista =
            await supabaseClient
                .from("perfis_artistas")
                .insert({
                    perfil_id:
                        estado.perfil.id,
                    ...dadosArtista
                });

    }


    if (resultadoArtista.error) {
        throw resultadoArtista.error;
    }


    estado.usuario = {
        ...estado.usuario,
        nome,
        telefone,
        foto_url: fotoUrl
    };


    estado.perfil = {
        ...estado.perfil,
        nome_exibicao: nomeExibicao,
        descricao
    };


    estado.perfilArtista = {
        ...estado.perfilArtista,
        ...dadosArtista
    };


    estado.fotoArquivo = null;


    esconderLoading();


    if (tipoFoiAlterado) {

        window.location.href =
            paginaNovoTipo;

        return;
    }


    mostrarToast(
        "Perfil atualizado com sucesso!"
    );


} catch (erro) {

    console.error(
        "Erro ao salvar perfil:",
        erro
    );

    esconderLoading();

    mostrarToast(
        erro?.message ||
        "Não foi possível salvar as alterações.",
        true
    );

} finally {

    estado.salvando = false;

    if (botaoSalvar) {

        botaoSalvar.disabled = false;

        botaoSalvar.innerHTML =
            '<i data-lucide="check"></i> Salvar alterações';

    }

    if (botaoTopo) {
        botaoTopo.disabled = false;
    }

    atualizarIcones();
}

}

/* =====================================================
ABAS
====================================================== */

function trocarAba(nome) {

const abas =
    document.querySelectorAll(
        ".editor-tab"
    );

const paineis =
    document.querySelectorAll(
        ".editor-panel"
    );


abas.forEach(aba => {

    aba.classList.toggle(
        "ativo",
        aba.dataset.editorTab === nome
    );

});


paineis.forEach(painel => {

    painel.classList.toggle(
        "ativo",
        painel.dataset.editorPanel === nome
    );

});


estado.abaAtual = nome;


window.scrollTo({
    top: 0,
    behavior: "smooth"
});


atualizarIcones();

}

function inicializarAbas() {

document
    .querySelectorAll(".editor-tab")
    .forEach(aba => {

        aba.addEventListener(
            "click",
            () => {

                trocarAba(
                    aba.dataset.editorTab
                );

            }
        );

    });

}

/* =====================================================
PORTFÓLIO
====================================================== */

async function carregarPortfolio() {

if (!estado.perfil?.id) {
    return;
}


const resultado =
    await supabaseClient
        .from("portfolio_musicos")
        .select(`
            id,
            perfil_id,
            tipo,
            titulo,
            descricao,
            arquivo_url,
            thumbnail_url,
            ordem,
            ativo,
            destaque_catalogo,
            created_at,
            updated_at
        `)
        .eq(
            "perfil_id",
            estado.perfil.id
        )
        .eq(
            "ativo",
            true
        )
        .order(
            "ordem",
            {
                ascending: true
            }
        )
        .order(
            "created_at",
            {
                ascending: false
            });


if (resultado.error) {

    console.error(
        "Erro ao carregar portfólio:",
        resultado.error
    );

    return;
}


estado.portfolio =
    resultado.data || [];


renderizarPortfolio();

}

/*

Somente imagens e vídeos podem aparecer
como destaque no catálogo.
Áudios continuam disponíveis no portfólio,
mas não podem ser usados como destaque.
*/

function tipoPodeSerDestaque(tipo) {

return (
    tipo === "imagem" ||
    tipo === "video"
);

}

function limparFormularioPortfolio() {

const titulo =
    el(ids.portfolioTitulo);

const descricao =
    el(ids.portfolioDescricao);

const arquivo =
    el(ids.portfolioArquivo);

const url =
    el(ids.portfolioUrl);


if (titulo) {
    titulo.value = "";
}

if (descricao) {
    descricao.value = "";
}

if (arquivo) {
    arquivo.value = "";
}

if (url) {
    url.value = "";
}


estado.editandoPortfolioId =
    null;


const botao =
    el(ids.btnAdicionarPortfolio);

if (botao) {

    botao.innerHTML =
        '<i data-lucide="plus"></i> Adicionar ao portfólio';

}


atualizarIcones();

}

function obterTipoMedia() {

return estado.tipoMedia;

}

function atualizarTipoMedia() {

document
    .querySelectorAll(
        ".portfolio-tipo"
    )
    .forEach(botao => {

        botao.classList.toggle(
            "ativo",
            botao.dataset.mediaType ===
            estado.tipoMedia
        );

    });


const arquivo =
    el(ids.portfolioArquivo);

const ajuda =
    el(ids.portfolioAjuda);


if (!arquivo || !ajuda) {
    return;
}


arquivo.value = "";


if (estado.tipoMedia === "imagem") {

    arquivo.accept =
        "image/png,image/jpeg,image/webp";

    ajuda.textContent =
        "JPG, PNG ou WEBP.";

}


if (estado.tipoMedia === "video") {

    arquivo.accept =
        "video/mp4,video/webm,video/quicktime";

    ajuda.textContent =
        "MP4, WEBM ou MOV.";

}


if (estado.tipoMedia === "audio") {

    arquivo.accept =
        "audio/mpeg,audio/mp3,audio/wav,audio/ogg";

    ajuda.textContent =
        "MP3, WAV ou OGG.";

}

}

function inicializarTiposPortfolio() {

document
    .querySelectorAll(
        ".portfolio-tipo"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                estado.tipoMedia =
                    botao.dataset.mediaType;

                atualizarTipoMedia();

            }
        );

    });


atualizarTipoMedia();

}

async function fazerUploadPortfolio(arquivo) {

if (!arquivo) {
    return null;
}


const extensao =
    arquivo.name
        .split(".")
        .pop()
        .toLowerCase();


const nomeSeguro =
    `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${extensao}`;


const caminho =
    `${estado.usuarioAuth.id}/${nomeSeguro}`;


const resultado =
    await supabaseClient
        .storage
        .from(BUCKET_PORTFOLIO)
        .upload(
            caminho,
            arquivo,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: arquivo.type
            }
        );


if (resultado.error) {
    throw resultado.error;
}


const url =
    supabaseClient
        .storage
        .from(BUCKET_PORTFOLIO)
        .getPublicUrl(caminho);


return url?.data?.publicUrl || null;

}

async function adicionarPortfolio() {

if (!estado.perfil?.id) {

    mostrarToast(
        "Perfil não carregado.",
        true
    );

    return;
}


const titulo =
    el(ids.portfolioTitulo)
        ?.value.trim() || "";


const descricao =
    el(ids.portfolioDescricao)
        ?.value.trim() || "";


const arquivo =
    el(ids.portfolioArquivo)
        ?.files?.[0] || null;


const urlInformada =
    el(ids.portfolioUrl)
        ?.value.trim() || "";


if (!titulo) {

    mostrarToast(
        "Informe um título para o item.",
        true
    );

    el(ids.portfolioTitulo)?.focus();

    return;
}


if (!arquivo && !urlInformada) {

    mostrarToast(
        "Selecione um arquivo ou informe uma URL.",
        true
    );

    return;
}


try {

    mostrarLoading(
        estado.editandoPortfolioId
            ? "Atualizando portfólio..."
            : "Adicionando ao portfólio..."
    );


    let arquivoUrl =
        urlInformada || null;


    if (arquivo) {

        arquivoUrl =
            await fazerUploadPortfolio(
                arquivo
            );

    }


    /*
     * Quando estamos editando um item,
     * preservamos o destaque que já existe.
     *
     * Quando é um item novo, ele começa
     * sem destaque.
     *
     * Se o item for áudio, garantimos que
     * ele nunca fique destacado.
     */

    const itemExistente =
        estado.portfolio.find(item =>
            String(item.id) ===
            String(estado.editandoPortfolioId)
        );


    let destaqueCatalogo =
        itemExistente?.destaque_catalogo === true;


    if (
        !tipoPodeSerDestaque(
            obterTipoMedia()
        )
    ) {

        destaqueCatalogo = false;

    }


    const dados = {

        tipo:
            obterTipoMedia(),

        titulo,

        descricao:
            descricao || null,

        arquivo_url:
            arquivoUrl,

        ativo: true,

        destaque_catalogo:
            destaqueCatalogo,

        updated_at:
            new Date().toISOString()

    };


    let resultado;


    if (estado.editandoPortfolioId) {

        resultado =
            await supabaseClient
                .from("portfolio_musicos")
                .update(dados)
                .eq(
                    "id",
                    estado.editandoPortfolioId
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                );

    } else {

        resultado =
            await supabaseClient
                .from("portfolio_musicos")
                .insert({
                    perfil_id:
                        estado.perfil.id,

                    ...dados,

                    ordem:
                        estado.portfolio.length
                });

    }


    if (resultado.error) {
        throw resultado.error;
    }


    esconderLoading();


    mostrarToast(
        estado.editandoPortfolioId
            ? "Item atualizado com sucesso!"
            : "Item adicionado ao portfólio!"
    );


    limparFormularioPortfolio();

    await carregarPortfolio();


} catch (erro) {

    console.error(
        "Erro ao salvar portfólio:",
        erro
    );

    esconderLoading();

    mostrarToast(
        erro?.message ||
        "Não foi possível salvar o item.",
        true
    );

}

}

/*

Define ou remove o destaque do catálogo.
Apenas um item pode ficar destacado
por perfil.
*/

async function definirDestaqueCatalogo(id) {

if (!id || !estado.perfil?.id) {
    return;
}


const item =
    estado.portfolio.find(
        registro =>
            String(registro.id) ===
            String(id)
    );


if (!item) {

    mostrarToast(
        "Item do portfólio não encontrado.",
        true
    );

    return;
}


if (
    !tipoPodeSerDestaque(
        item.tipo
    )
) {

    mostrarToast(
        "Áudios não podem ser usados como destaque.",
        true
    );

    return;
}


try {

    mostrarLoading(
        item.destaque_catalogo === true
            ? "Removendo destaque..."
            : "Definindo destaque..."
    );


    /*
     * Se o item já está destacado,
     * apenas removemos o destaque dele.
     */

    if (item.destaque_catalogo === true) {

        const resultado =
            await supabaseClient
                .from("portfolio_musicos")
                .update({
                    destaque_catalogo: false,
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    item.id
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                );


        if (resultado.error) {
            throw resultado.error;
        }


        esconderLoading();

        mostrarToast(
            "Destaque removido."
        );


        await carregarPortfolio();

        return;
    }


    /*
     * Primeiro retiramos o destaque de
     * qualquer outro item do mesmo perfil.
     */

    const limparDestaques =
        await supabaseClient
            .from("portfolio_musicos")
            .update({
                destaque_catalogo: false,
                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "perfil_id",
                estado.perfil.id
            )
            .eq(
                "ativo",
                true
            )
            .eq(
                "destaque_catalogo",
                true
            );


    if (limparDestaques.error) {
        throw limparDestaques.error;
    }


    /*
     * Agora marcamos somente o item
     * escolhido como destaque.
     */

    const destacar =
        await supabaseClient
            .from("portfolio_musicos")
            .update({
                destaque_catalogo: true,
                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "id",
                item.id
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            )
            .eq(
                "ativo",
                true
            );


    if (destacar.error) {
        throw destacar.error;
    }


    esconderLoading();


    mostrarToast(
        "Item definido como destaque!"
    );


    await carregarPortfolio();


} catch (erro) {

    console.error(
        "Erro ao definir destaque do portfólio:",
        erro
    );

    esconderLoading();

    mostrarToast(
        erro?.message ||
        "Não foi possível definir o destaque.",
        true
    );

}

}

function renderizarPortfolio() {

const container =
    el(ids.portfolioEditList);


if (!container) {
    return;
}


if (!estado.portfolio.length) {

    container.innerHTML = `
        <div class="empty-editor">
            <i data-lucide="images"></i>
            <strong>Nenhum item cadastrado</strong>
            <span>
                Adicione imagens, vídeos ou áudios ao seu portfólio.
            </span>
        </div>
    `;

    atualizarIcones();

    return;
}


container.innerHTML =
    estado.portfolio
        .map(item => {

            let preview = `
                <i data-lucide="file"></i>
            `;


            if (
                item.tipo === "imagem" &&
                item.arquivo_url
            ) {

                preview = `
                    <img
                        src="${escaparHtml(item.arquivo_url)}"
                        alt="${escaparHtml(item.titulo || "Portfólio")}"
                        loading="lazy">
                `;

            }


            if (item.tipo === "video") {

                preview = `
                    <video
                        src="${escaparHtml(item.arquivo_url)}"
                        muted
                        preload="metadata">
                    </video>
                `;

            }


            if (item.tipo === "audio") {

                preview = `
                    <i data-lucide="music"></i>
                `;

            }


            const podeDestacar =
                tipoPodeSerDestaque(
                    item.tipo
                );


            const estaDestacado =
                item.destaque_catalogo === true;


            return `
                <article
                    class="media-edit-card ${
                        estaDestacado
                            ? "portfolio-card-destaque"
                            : ""
                    }">

                    <div class="media-preview">
                        ${preview}
                    </div>

                    <div class="media-edit-info">

                        <strong>
                            ${escaparHtml(
                                item.titulo ||
                                "Sem título"
                            )}
                        </strong>

                        <span>
                            ${escaparHtml(
                                item.descricao ||
                                item.tipo
                            )}
                        </span>

                        <span>
                            ${escaparHtml(
                                item.tipo
                            )}
                        </span>

                        ${
                            estaDestacado
                                ? `
                                    <span class="portfolio-destaque-label">
                                        <i data-lucide="star"></i>
                                        Destaque no catálogo
                                    </span>
                                `
                                : ""
                        }

                    </div>

                    <div class="media-edit-actions">

                        ${
                            podeDestacar
                                ? `
                                    <button
                                        type="button"
                                        class="btn-destaque ${
                                            estaDestacado
                                                ? "ativo"
                                                : ""
                                        }"
                                        title="${
                                            estaDestacado
                                                ? "Remover destaque"
                                                : "Usar como destaque"
                                        }"
                                        data-destaque-portfolio="${item.id}">

                                        <i data-lucide="star"></i>

                                        <span>
                                            ${
                                                estaDestacado
                                                    ? "Destaque"
                                                    : "Usar como destaque"
                                            }
                                        </span>

                                    </button>
                                `
                                : ""
                        }

                        <button
                            type="button"
                            class="btn-excluir"
                            title="Excluir"
                            data-excluir-portfolio="${item.id}">

                            <i data-lucide="trash-2"></i>

                        </button>

                    </div>

                </article>
            `;

        })
        .join("");


container
    .querySelectorAll(
        "[data-destaque-portfolio]"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                definirDestaqueCatalogo(
                    botao.dataset.destaquePortfolio
                );

            }
        );

    });


container
    .querySelectorAll(
        "[data-excluir-portfolio]"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                excluirPortfolio(
                    botao.dataset.excluirPortfolio
                );

            }
        );

    });


atualizarIcones();

}

async function excluirPortfolio(id) {

if (!id) {
    return;
}


const confirmar =
    window.confirm(
        "Deseja realmente excluir este item do portfólio?"
    );


if (!confirmar) {
    return;
}


try {

    mostrarLoading(
        "Excluindo item..."
    );


    const resultado =
        await supabaseClient
            .from("portfolio_musicos")
            .update({
                ativo: false,
                destaque_catalogo: false,
                updated_at:
                    new Date().toISOString()
            })
            .eq(
                "id",
                id
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            );


    if (resultado.error) {
        throw resultado.error;
    }


    esconderLoading();

    mostrarToast(
        "Item removido do portfólio."
    );


    await carregarPortfolio();


} catch (erro) {

    console.error(
        "Erro ao excluir portfólio:",
        erro
    );

    esconderLoading();

    mostrarToast(
        erro?.message ||
        "Não foi possível excluir o item.",
        true
    );

}

}

/* =====================================================
AGENDA
====================================================== */

async function carregarAgenda() {

if (!estado.perfil?.id) {
    return;
}


const resultado =
    await supabaseClient
        .from("agenda_musicos")
        .select(`
            id,
            perfil_id,
            titulo,
            descricao,
            tipo,
            data_inicio,
            data_fim,
            localizacao,
            status,
            created_at,
            updated_at
        `)
        .eq(
            "perfil_id",
            estado.perfil.id
        )
        .order(
            "data_inicio",
            {
                ascending: true
            }
        );


if (resultado.error) {

    console.error(
        "Erro ao carregar agenda:",
        resultado.error
    );

    return;
}


estado.agenda =
    resultado.data || [];


renderizarAgenda();

}

function formatarDataAgenda(data) {

if (!data) {
    return {
        dia: "--",
        mes: "---"
    };
}


const dataObj =
    new Date(data);


if (Number.isNaN(dataObj.getTime())) {

    return {
        dia: "--",
        mes: "---"
    };

}


const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez"
];


return {
    dia:
        String(
            dataObj.getDate()
        ).padStart(2, "0"),

    mes:
        meses[
            dataObj.getMonth()
        ]
};

}

function formatarDataHora(data) {

if (!data) {
    return "";
}


const dataObj =
    new Date(data);


if (Number.isNaN(dataObj.getTime())) {
    return "";
}


return dataObj.toLocaleString(
    "pt-BR",
    {
        dateStyle: "short",
        timeStyle: "short"
    }
);

}

function converterDatetimeLocalParaISO(valor) {

if (!valor) {
    return null;
}


const data =
    new Date(valor);


if (Number.isNaN(data.getTime())) {
    return null;
}


return data.toISOString();

}

function limparFormularioAgenda() {

const campos = [
    ids.agendaTitulo,
    ids.agendaInicio,
    ids.agendaFim,
    ids.agendaLocalizacao,
    ids.agendaDescricao
];


campos.forEach(id => {

    const campo = el(id);

    if (campo) {
        campo.value = "";
    }

});


const tipo =
    el(ids.agendaTipo);

const status =
    el(ids.agendaStatus);


if (tipo) {
    tipo.value = "evento";
}

if (status) {
    status.value = "agendado";
}


estado.editandoAgendaId = null;


const botao =
    el(ids.btnAdicionarAgenda);


if (botao) {

    botao.innerHTML =
        '<i data-lucide="calendar-plus"></i> Adicionar à agenda';

}


atualizarIcones();

}

async function adicionarAgenda() {

if (!estado.perfil?.id) {

    mostrarToast(
        "Perfil não carregado.",
        true
    );

    return;
}


const titulo =
    el(ids.agendaTitulo)
        ?.value.trim() || "";


const tipo =
    el(ids.agendaTipo)
        ?.value || "evento";


const inicio =
    el(ids.agendaInicio)
        ?.value || "";


const fim =
    el(ids.agendaFim)
        ?.value || "";


const localizacao =
    el(ids.agendaLocalizacao)
        ?.value.trim() || "";


const descricao =
    el(ids.agendaDescricao)
        ?.value.trim() || "";


const status =
    el(ids.agendaStatus)
        ?.value || "agendado";


if (!titulo) {

    mostrarToast(
        "Informe o título do compromisso.",
        true
    );

    el(ids.agendaTitulo)?.focus();

    return;
}


if (!inicio) {

    mostrarToast(
        "Informe a data e o horário.",
        true
    );

    el(ids.agendaInicio)?.focus();

    return;
}


const dataInicio =
    converterDatetimeLocalParaISO(
        inicio
    );


const dataFim =
    converterDatetimeLocalParaISO(
        fim
    );


if (!dataInicio) {

    mostrarToast(
        "Informe uma data válida.",
        true
    );

    return;
}


if (
    dataFim &&
    new Date(dataFim) <
    new Date(dataInicio)
) {

    mostrarToast(
        "O término não pode ser anterior ao início.",
        true
    );

    return;
}


try {

    mostrarLoading(
        estado.editandoAgendaId
            ? "Atualizando agenda..."
            : "Adicionando compromisso..."
    );


    const dados = {

        titulo,

        descricao:
            descricao || null,

        tipo,

        data_inicio:
            dataInicio,

        data_fim:
            dataFim,

        localizacao:
            localizacao || null,

        status,

        updated_at:
            new Date().toISOString()

    };


    let resultado;


    if (estado.editandoAgendaId) {

        resultado =
            await supabaseClient
                .from("agenda_musicos")
                .update(dados)
                .eq(
                    "id",
                    estado.editandoAgendaId
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                );

    } else {

        resultado =
            await supabaseClient
                .from("agenda_musicos")
                .insert({
                    perfil_id:
                        estado.perfil.id,

                    ...dados
                });

    }


    if (resultado.error) {
        throw resultado.error;
    }


    esconderLoading();


    mostrarToast(
        estado.editandoAgendaId
            ? "Compromisso atualizado!"
            : "Compromisso adicionado!"
    );


    limparFormularioAgenda();

    await carregarAgenda();


} catch (erro) {

    console.error(
        "Erro ao salvar agenda:",
        erro
    );

    esconderLoading();

    mostrarToast(
        erro?.message ||
        "Não foi possível salvar o compromisso.",
        true
    );

}

}

function renderizarAgenda() {

const container =
    el(ids.agendaEditList);


if (!container) {
    return;
}


if (!estado.agenda.length) {

    container.innerHTML = `
        <div class="empty-editor">
            <i data-lucide="calendar-days"></i>
            <strong>Nenhum compromisso cadastrado</strong>
            <span>
                Adicione um evento para começar a organizar sua agenda.
            </span>
        </div>
    `;

    atualizarIcones();

    return;
}


container.innerHTML =
    estado.agenda
        .map(item => {

            const data =
                formatarDataAgenda(
                    item.data_inicio
                );


            return `
                <article class="agenda-edit-card">

                    <div class="agenda-data">

                        <strong>
                            ${escaparHtml(data.dia)}
                        </strong>

                        <span>
                            ${escaparHtml(data.mes)}
                        </span>

                    </div>


                    <div class="agenda-edit-info">

                        <strong>
                            ${escaparHtml(item.titulo)}
                        </strong>

                        <span>
                            ${escaparHtml(
                                formatarDataHora(
                                    item.data_inicio
                                )
                            )}
                        </span>

                        ${
                            item.localizacao
                                ? `
                                    <span>
                                        ${escaparHtml(
                                            item.localizacao
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        <span class="agenda-status">
                            ${escaparHtml(
                                item.status
                            )}
                        </span>

                    </div>


                    <div class="media-edit-actions">

                        <button
                            type="button"
                            class="btn-excluir"
                            title="Excluir"
                            data-excluir-agenda="${item.id}">

                            <i data-lucide="trash-2"></i>

                        </button>

                    </div>

                </article>
            `;

        })
        .join("");


container
    .querySelectorAll(
        "[data-excluir-agenda]"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                excluirAgenda(
                    botao.dataset.excluirAgenda
                );

            }
        );

    });


atualizarIcones();

}

async function excluirAgenda(id) {

if (!id) {
    return;
}


const confirmar =
    window.confirm(
        "Deseja realmente excluir este compromisso?"
    );


if (!confirmar) {
    return;
}


try {

    mostrarLoading(
        "Excluindo compromisso..."
    );


    const resultado =
        await supabaseClient
            .from("agenda_musicos")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            );


    if (resultado.error) {
        throw resultado.error;
    }


    esconderLoading();


    mostrarToast(
        "Compromisso removido."
    );


    await carregarAgenda();


} catch (erro) {

    console.error(
        "Erro ao excluir agenda:",
        erro
    );

    esconderLoading();

    mostrarToast(
        erro?.message ||
        "Não foi possível excluir o compromisso.",
        true
    );

}

}

/* =====================================================
SERVIÇOS E VALORES
====================================================== */

async function carregarServicosValores() {

if (!estado.perfil?.id) {
    return;
}


const resultado =
    await supabaseClient
        .from("servicos_artistas")
        .select(`
            id,
            perfil_id,
            nome_servico,
            descricao,
            duracao,
            tipo_preco,
            valor,
            ativo,
            created_at,
            updated_at
        `)
        .eq(
            "perfil_id",
            estado.perfil.id
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


if (resultado.error) {

    console.error(
        "Erro ao carregar serviços:",
        resultado.error
    );

    estado.servicosValores = [];

    renderizarServicosValores();

    return;
}


estado.servicosValores =
    resultado.data || [];


renderizarServicosValores();

}

function formatarValorServico(valor) {

if (
    valor === null ||
    valor === undefined ||
    valor === ""
) {
    return "";
}


const numero =
    Number(valor);


if (Number.isNaN(numero)) {
    return "";
}


return numero.toLocaleString(
    "pt-BR",
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
);

}

function obterTextoTipoPreco(tipoPreco) {

const tipos = {

    fixo: "Preço fixo",

    a_partir_de: "A partir de",

    sob_consulta: "Sob consulta"

};


return tipos[tipoPreco] ||
    "Preço não informado";

}

function obterPrecoServico(item) {

if (
    item.tipo_preco ===
    "sob_consulta"
) {

    return "Sob consulta";

}


const valor =
    formatarValorServico(
        item.valor
    );


if (!valor) {
    return "Valor não informado";
}


if (
    item.tipo_preco ===
    "a_partir_de"
) {

    return `A partir de R$ ${valor}`;

}


return `R$ ${valor}`;

}

function renderizarServicosValores() {

const container =
    el(ids.servicosList);


if (!container) {
    return;
}


if (!estado.servicosValores.length) {

    container.innerHTML = `
        <div class="empty-editor">

            <i data-lucide="briefcase-business"></i>

            <strong>
                Nenhum serviço cadastrado
            </strong>

            <span>
                Cadastre seus serviços e valores para facilitar suas contratações.
            </span>

        </div>
    `;


    atualizarIcones();

    return;
}


container.innerHTML =
    estado.servicosValores
        .map(item => {

            const status =
                item.ativo !== false
                    ? "Ativo"
                    : "Inativo";


            const classeStatus =
                item.ativo !== false
                    ? "ativo"
                    : "inativo";


            return `
                <article
                    class="servico-edit-card">

                    <div class="servico-edit-icon">

                        <i data-lucide="briefcase"></i>

                    </div>


                    <div class="servico-edit-info">

                        <strong>
                            ${escaparHtml(
                                item.nome_servico
                            )}
                        </strong>

                        ${
                            item.descricao
                                ? `
                                    <span>
                                        ${escaparHtml(
                                            item.descricao
                                        )}
                                    </span>
                                `
                                : ""
                        }

                        <div class="servico-edit-meta">

                            ${
                                item.duracao
                                    ? `
                                        <span>
                                            <i data-lucide="clock-3"></i>
                                            ${escaparHtml(
                                                item.duracao
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                            <span>
                                ${escaparHtml(
                                    obterTextoTipoPreco(
                                        item.tipo_preco
                                    )
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="servico-edit-preco">

                        <strong>
                            ${escaparHtml(
                                obterPrecoServico(item)
                            )}
                        </strong>

                        <span
                            class="servico-status ${classeStatus}">

                            ${status}

                        </span>

                    </div>


                    <div class="media-edit-actions">

                        <button
                            type="button"
                            class="btn-editar-servico"
                            title="Editar serviço"
                            data-editar-servico="${item.id}">

                            <i data-lucide="pencil"></i>

                        </button>


                        <button
                            type="button"
                            class="btn-excluir"
                            title="Excluir serviço"
                            data-excluir-servico="${item.id}">

                            <i data-lucide="trash-2"></i>

                        </button>

                    </div>

                </article>
            `;

        })
        .join("");


container
    .querySelectorAll(
        "[data-editar-servico]"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                editarServico(
                    botao.dataset.editarServico
                );

            }
        );

    });


container
    .querySelectorAll(
        "[data-excluir-servico]"
    )
    .forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                excluirServico(
                    botao.dataset.excluirServico
                );

            }
        );

    });


atualizarIcones();

}

function atualizarCampoValorServico() {

const tipo =
    el(ids.servicoTipoPreco)
        ?.value || "fixo";


const campo =
    el(ids.campoValorServico);


const input =
    el(ids.servicoValor);


if (!campo || !input) {
    return;
}


if (tipo === "sob_consulta") {

    campo.style.display = "none";

    input.value = "";

    return;
}


campo.style.display = "";


if (tipo === "a_partir_de") {

    input.placeholder =
        "Ex.: 500,00";

    return;
}


input.placeholder =
    "0,00";

}

function limparFormularioServico() {

const nome =
    el(ids.servicoNome);


const descricao =
    el(ids.servicoDescricao);


const duracao =
    el(ids.servicoDuracao);


const tipoPreco =
    el(ids.servicoTipoPreco);


const valor =
    el(ids.servicoValor);


const ativo =
    el(ids.servicoAtivo);


if (nome) {
    nome.value = "";
}


if (descricao) {
    descricao.value = "";
}


if (duracao) {
    duracao.value = "";
}


if (tipoPreco) {
    tipoPreco.value = "fixo";
}


if (valor) {
    valor.value = "";
}


if (ativo) {
    ativo.checked = true;
}


estado.editandoServicoId =
    null;


const botao =
    el(ids.btnAdicionarServico);


if (botao) {

    botao.innerHTML =
        '<i data-lucide="plus"></i> Adicionar serviço';

}


const cancelar =
    el(ids.btnCancelarServico);


if (cancelar) {
    cancelar.hidden = true;
}


atualizarCampoValorServico();

atualizarIcones();

}

function editarServico(id) {

const servico =
    estado.servicosValores
        .find(item =>
            String(item.id) ===
            String(id)
        );


if (!servico) {
    return;
}


const nome =
    el(ids.servicoNome);


const descricao =
    el(ids.servicoDescricao);


const duracao =
    el(ids.servicoDuracao);


const tipoPreco =
    el(ids.servicoTipoPreco);


const valor =
    el(ids.servicoValor);


const ativo =
    el(ids.servicoAtivo);


if (nome) {

    nome.value =
        servico.nome_servico || "";

}


if (descricao) {

    descricao.value =
        servico.descricao || "";

}


if (duracao) {

    duracao.value =
        servico.duracao || "";

}


if (tipoPreco) {

    tipoPreco.value =
        servico.tipo_preco || "fixo";

}


if (valor) {

    valor.value =
        servico.valor ?? "";

}


if (ativo) {

    ativo.checked =
        servico.ativo !== false;

}


estado.editandoServicoId =
    servico.id;


const botao =
    el(ids.btnAdicionarServico);


if (botao) {

    botao.innerHTML =
        '<i data-lucide="check"></i> Atualizar serviço';

}


const cancelar =
    el(ids.btnCancelarServico);


if (cancelar) {
    cancelar.hidden = false;
}


atualizarCampoValorServico();


el(ids.servicoNome)?.focus();


atualizarIcones();

}

async function salvarServico() {

if (!estado.perfil?.id) {

    mostrarToast(
        "Perfil não carregado.",
        true
    );

    return;
}


const nome =
    el(ids.servicoNome)
        ?.value.trim() || "";


const descricao =
    el(ids.servicoDescricao)
        ?.value.trim() || "";


const duracao =
    el(ids.servicoDuracao)
        ?.value.trim() || "";


const tipoPreco =
    el(ids.servicoTipoPreco)
        ?.value || "fixo";


const valorTexto =
    el(ids.servicoValor)
        ?.value || "";


const ativo =
    el(ids.servicoAtivo)
        ?.checked === true;


if (!nome) {

    mostrarToast(
        "Informe o nome do serviço.",
        true
    );

    el(ids.servicoNome)?.focus();

    return;
}


if (
    tipoPreco !==
    "sob_consulta" &&
    !valorTexto
) {

    mostrarToast(
        "Informe o valor do serviço.",
        true
    );

    el(ids.servicoValor)?.focus();

    return;
}


let valor = null;


if (
    tipoPreco !==
    "sob_consulta"
) {

    valor =
        Number(
            String(valorTexto)
                .replace(",", ".")
        );


    if (
        !Number.isFinite(valor) ||
        valor < 0
    ) {

        mostrarToast(
            "Informe um valor válido.",
            true
        );

        el(ids.servicoValor)?.focus();

        return;
    }

}


const dados = {

    nome_servico:
        nome,

    descricao:
        descricao || null,

    duracao:
        duracao || null,

    tipo_preco:
        tipoPreco,

    valor,

    ativo,

    updated_at:
        new Date().toISOString()

};


try {

    mostrarLoading(
        estado.editandoServicoId
            ? "Atualizando serviço..."
            : "Salvando serviço..."
    );


    let resultado;


    if (
        estado.editandoServicoId
    ) {

        resultado =
            await supabaseClient
                .from("servicos_artistas")
                .update(dados)
                .eq(
                    "id",
                    estado.editandoServicoId
                )
                .eq(
                    "perfil_id",
                    estado.perfil.id
                );

    } else {

        resultado =
            await supabaseClient
                .from("servicos_artistas")
                .insert({

                    perfil_id:
                        estado.perfil.id,

                    ...dados

                });

    }


    if (resultado.error) {
        throw resultado.error;
    }


    esconderLoading();


    mostrarToast(
        estado.editandoServicoId
            ? "Serviço atualizado com sucesso!"
            : "Serviço adicionado com sucesso!"
    );


    limparFormularioServico();


    await carregarServicosValores();


} catch (erro) {

    console.error(
        "Erro ao salvar serviço:",
        erro
    );


    esconderLoading();


    mostrarToast(
        erro?.message ||
        "Não foi possível salvar o serviço.",
        true
    );

}

}

async function excluirServico(id) {

if (!id) {
    return;
}


const servico =
    estado.servicosValores
        .find(item =>
            String(item.id) ===
            String(id)
        );


const nome =
    servico?.nome_servico ||
    "este serviço";


const confirmar =
    window.confirm(
        `Deseja realmente excluir "${nome}"?`
    );


if (!confirmar) {
    return;
}


try {

    mostrarLoading(
        "Excluindo serviço..."
    );


    const resultado =
        await supabaseClient
            .from("servicos_artistas")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "perfil_id",
                estado.perfil.id
            );


    if (resultado.error) {
        throw resultado.error;
    }


    esconderLoading();


    mostrarToast(
        "Serviço removido."
    );


    await carregarServicosValores();


} catch (erro) {

    console.error(
        "Erro ao excluir serviço:",
        erro
    );


    esconderLoading();


    mostrarToast(
        erro?.message ||
        "Não foi possível excluir o serviço.",
        true
    );

}

}

/* =====================================================
FOTO
====================================================== */

function inicializarFoto() {

el(ids.btnFoto)
    ?.addEventListener(
        "click",
        () => {

            el(ids.fotoInput)?.click();

        }
    );


el(ids.fotoInput)
    ?.addEventListener(
        "change",
        evento => {

            const arquivo =
                evento.target.files?.[0];


            if (!arquivo) {
                return;
            }


            if (
                arquivo.size >
                5 * 1024 * 1024
            ) {

                mostrarToast(
                    "A foto deve ter no máximo 5 MB.",
                    true
                );

                evento.target.value = "";

                return;
            }


            if (
                !arquivo.type ||
                !arquivo.type.startsWith("image/")
            ) {

                mostrarToast(
                    "Selecione uma imagem válida.",
                    true
                );

                evento.target.value = "";

                return;
            }


            estado.fotoArquivo =
                arquivo;


            const leitor =
                new FileReader();


            leitor.onload = () => {

                const img =
                    el(ids.avatarImage);

                const initials =
                    el(ids.avatarInitials);


                if (img) {

                    img.src =
                        leitor.result;

                    img.style.display =
                        "block";

                }


                if (initials) {

                    initials.style.display =
                        "none";

                }

            };


            leitor.readAsDataURL(
                arquivo
            );

        }
    );

}

/* =====================================================
EVENTOS
====================================================== */

function inicializarEventos() {

el(ids.btnAdicionarServico)
    ?.addEventListener(
        "click",
        salvarServico
    );


el(ids.btnCancelarServico)
    ?.addEventListener(
        "click",
        limparFormularioServico
    );


el(ids.servicoTipoPreco)
    ?.addEventListener(
        "change",
        atualizarCampoValorServico
    );


el(ids.form)
    ?.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            salvarSobre();

        }
    );


el(ids.btnSalvarTopo)
    ?.addEventListener(
        "click",
        () => {

            if (
                estado.abaAtual ===
                "sobre"
            ) {

                salvarSobre();

                return;
            }


            if (
                estado.abaAtual ===
                "portfolio"
            ) {

                adicionarPortfolio();

                return;
            }


            if (
                estado.abaAtual ===
                "agenda"
            ) {

                adicionarAgenda();

            }

        }
    );


el(ids.btnVoltar)
    ?.addEventListener(
        "click",
        voltarPerfil
    );


el(ids.btnCancelar)
    ?.addEventListener(
        "click",
        voltarPerfil
    );


el(ids.descricao)
    ?.addEventListener(
        "input",
        atualizarContador
    );


el(ids.btnAdicionarPortfolio)
    ?.addEventListener(
        "click",
        adicionarPortfolio
    );


el(ids.btnAdicionarAgenda)
    ?.addEventListener(
        "click",
        adicionarAgenda
    );


el(ids.portfolioArquivo)
    ?.addEventListener(
        "change",
        evento => {

            const arquivo =
                evento.target.files?.[0];

            if (!arquivo) {
                return;
            }


            if (
                arquivo.size >
                50 * 1024 * 1024
            ) {

                mostrarToast(
                    "O arquivo deve ter no máximo 50 MB.",
                    true
                );

                evento.target.value = "";

            }

        }
    );

}

function voltarPerfil() {

window.location.href =
    "meu-perfil-musico.html";

}

function atualizarIcones() {

if (window.lucide) {
    lucide.createIcons();
}

}

async function iniciar() {

try {

    mostrarLoading(
        "Carregando perfil..."
    );


    inicializarAbas();
    inicializarChips();
    inicializarTiposPortfolio();
    inicializarEventos();
    inicializarFoto();


    const carregou =
        await carregarDados();


    if (!carregou) {
        return;
    }


    esconderLoading();

    atualizarIcones();


} catch (erro) {

    console.error(
        "Erro ao iniciar edição:",
        erro
    );


    esconderLoading();


    mostrarToast(
        erro?.message ||
        "Não foi possível carregar seu perfil.",
        true
    );
}

}

return {
iniciar,
salvar: salvarSobre
};

})();

document.addEventListener(
"DOMContentLoaded",
() => {

    EditarPerfilMusico.iniciar();

}

);