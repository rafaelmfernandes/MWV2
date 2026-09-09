/* =========================================================
MUSICALWORLD — FUNÇÕES PRINCIPAIS DA PÁGINA INICIAL
========================================================= */

/* =========================================================
CONTROLE DE ABAS DE CATEGORIAS
========================================================= */

function mudarCategoria(categoriaId, elementoBtn) {


const abas = document.querySelectorAll('.cat-tab');

abas.forEach(tab => {
    tab.classList.remove('ativo');
});

if (elementoBtn) {
    elementoBtn.classList.add('ativo');
}

const conteudos = document.querySelectorAll('.cat-content');

conteudos.forEach(content => {
    content.classList.remove('ativo');
});

const conteudoAtivo = document.getElementById(`cat-${categoriaId}`);

if (conteudoAtivo) {
    conteudoAtivo.classList.add('ativo');
}


}

/* =========================================================
NORMALIZAÇÃO DE TEXTO
========================================================= */

function normalizarTexto(valor) {


return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();


}

/* =========================================================
OBTER ARTISTA DO PERFIL
========================================================= */

function obterArtistaPerfil(perfil) {


if (!perfil || !perfil.perfis_artistas) {
    return null;
}

if (Array.isArray(perfil.perfis_artistas)) {
    return perfil.perfis_artistas[0] || null;
}

return perfil.perfis_artistas;


}

/* =========================================================
NORMALIZAR LISTA DE DADOS
========================================================= */

function normalizarLista(valor) {


if (Array.isArray(valor)) {
    return valor
        .map(item => String(item || '').trim())
        .filter(Boolean);
}

if (typeof valor === 'string') {
    return valor
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
}

return [];


}

/* =========================================================
CARREGAR PROFISSIONAIS PUBLICADOS
========================================================= */

async function carregarProfissionaisIndex(tipo) {


const tipoNormalizado = normalizarTexto(tipo);

const containerId = tipoNormalizado === 'cantor'
    ? 'cat-cantores'
    : 'cat-musicos';

const container = document.getElementById(containerId);

if (!container) {

    console.warn(
        `⚠️ Container ${containerId} não encontrado.`
    );

    return;
}

container.innerHTML = `
    <div class="carregando-profissionais">
        Carregando profissionais...
    </div>
`;

try {

    if (!window.supabaseClient) {

        console.error(
            '❌ SupabaseClient não encontrado.'
        );

        container.innerHTML = `
            <div class="estado-vazio">
                Não foi possível conectar ao banco de dados.
            </div>
        `;

        return;
    }

    console.log(
        `🔎 Buscando perfis publicados do tipo: ${tipo}`
    );

    const { data, error } = await window.supabaseClient
        .from('perfis')
        .select(`
            id,
            usuario_id,
            tipo_perfil_id,
            nome_exibicao,
            descricao,
            ativo,
            perfil_publicado,
            perfis_artistas (
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
                foto_url
            )
        `)
        .eq('ativo', true)
        .eq('perfil_publicado', true);

    if (error) {

        console.error(
            '❌ Erro ao carregar profissionais:',
            error
        );

        container.innerHTML = `
            <div class="estado-vazio">
                Não foi possível carregar os profissionais.
            </div>
        `;

        return;
    }

    console.log(
        `📦 Perfis publicados encontrados: ${(data || []).length}`
    );

    const profissionais = (data || []).filter(perfil => {

        const artista = obterArtistaPerfil(perfil);

        if (!artista) {
            return false;
        }

        const tipoBanco = normalizarTexto(
            artista.tipo_artista
        );

        console.log(
            `👤 Perfil ${perfil.id}: ${perfil.nome_exibicao} | tipo=${artista.tipo_artista}`
        );

        return tipoBanco === tipoNormalizado;
    });

    console.log(
        `🎵 ${tipo}: ${profissionais.length} perfil(is) encontrado(s).`
    );

    if (profissionais.length === 0) {

        const nomeTipo = tipoNormalizado === 'musico'
            ? 'músicos'
            : 'cantores';

        container.innerHTML = `
            <div class="estado-vazio">
                <strong>
                    Nenhum ${nomeTipo} encontrado.
                </strong>

                <p>
                    Novos profissionais aparecerão aqui
                    quando completarem e publicarem seus perfis.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = '';

    profissionais.forEach(perfil => {

        const artista = obterArtistaPerfil(perfil);

        if (!artista) {
            return;
        }

        const card = criarCardProfissional(
            perfil,
            artista
        );

        container.appendChild(card);
    });

} catch (erro) {

    console.error(
        '❌ Erro inesperado ao carregar profissionais:',
        erro
    );

    container.innerHTML = `
        <div class="estado-vazio">
            Ocorreu um erro ao carregar os profissionais.
        </div>
    `;
}


}

/* =========================================================
CRIAR CARD DO PROFISSIONAL
========================================================= */

function criarCardProfissional(perfil, artista) {


const tipoArtista = normalizarTexto(
    artista.tipo_artista
);

const paginaPerfil = tipoArtista === 'musico'
    ? 'apresentar-perfil-musico.html'
    : 'apresentar-perfil-cantor.html';

const link = document.createElement('a');

link.href =
    `${paginaPerfil}?id=${encodeURIComponent(perfil.id)}`;

link.className = 'profissional-card-link';

const card = document.createElement('div');

card.className = 'ad-card-novo';

/* =====================================================
   DADOS DO PERFIL
===================================================== */

const nome =
    String(perfil.nome_exibicao || '').trim() ||
    'Profissional';

const descricao =
    String(perfil.descricao || '').trim() ||
    'Perfil profissional do MusicalWorld.';

const localizacao =
    String(artista.localizacao || '').trim() ||
    'Localização não informada';

const tipo =
    String(artista.tipo_artista || '').trim() ||
    'Profissional';

const estilosLista =
    normalizarLista(artista.estilos);

const estilosTexto =
    estilosLista.length > 0
        ? estilosLista.join(' / ')
        : 'Estilos musicais não informados';

const fotoUrl =
    String(artista.foto_url || '').trim();

const iniciais =
    gerarIniciais(nome);

/* =====================================================
   AVATAR
===================================================== */

const avatarHtml = fotoUrl
    ? `
        <img
            src="${escaparHtml(fotoUrl)}"
            alt="${escaparHtml(nome)}"
            class="ad-avatar-img"
            onerror="
                this.style.display='none';
                this.nextElementSibling.style.display='flex';
            "
        >

        <div
            class="ad-avatar-user"
            style="display:none;"
        >
            ${escaparHtml(iniciais)}
        </div>
    `
    : `
        <div class="ad-avatar-user">
            ${escaparHtml(iniciais)}
        </div>
    `;

/* =====================================================
   CONTEÚDO DO CARD
===================================================== */

card.innerHTML = `

    <div class="ad-header">

        ${avatarHtml}

        <div class="ad-user-info">

            <h4>
                ${escaparHtml(nome)}
            </h4>

            <div class="ad-meta-row">

                <span class="ad-estilo">
                    ${escaparHtml(estilosTexto)}
                </span>

            </div>

        </div>

    </div>

    <div class="ad-media-box">

        ${
            fotoUrl
                ? `
                    <img
                        src="${escaparHtml(fotoUrl)}"
                        alt="Foto de ${escaparHtml(nome)}"
                        class="ad-media-img"
                        loading="lazy"
                        onerror="
                            this.style.display='none';
                            this.parentElement.classList.add('photo-bg');
                        "
                    >
                `
                : `
                    <div class="ad-media-sem-foto">
                        <span>
                            ${escaparHtml(iniciais)}
                        </span>
                    </div>
                `
        }

    </div>

    <div class="ad-descricao">

        <strong>
            ${escaparHtml(tipo)}
        </strong>

        <p>
            ${escaparHtml(descricao)}
        </p>

    </div>

    <div class="ad-footer">

        <span class="ad-localizacao">
            📍 ${escaparHtml(localizacao)}
        </span>

        <button
            class="btn-detalhes"
            type="button"
        >
            Ver perfil
        </button>

    </div>
`;

/* =====================================================
   BOTÃO VER PERFIL
===================================================== */

const botaoDetalhes =
    card.querySelector('.btn-detalhes');

if (botaoDetalhes) {

    botaoDetalhes.addEventListener(
        'click',
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            window.location.href =
                `${paginaPerfil}?id=${encodeURIComponent(perfil.id)}`;
        }
    );
}

/* =====================================================
   ERRO DA FOTO PRINCIPAL
===================================================== */

const imagemMedia =
    card.querySelector('.ad-media-img');

if (imagemMedia) {

    imagemMedia.addEventListener(
        'error',
        function() {

            this.style.display = 'none';

            const mediaBox =
                this.parentElement;

            if (mediaBox) {

                mediaBox.classList.add(
                    'photo-bg'
                );

                if (
                    !mediaBox.querySelector(
                        '.ad-media-fallback'
                    )
                ) {

                    const fallback =
                        document.createElement('div');

                    fallback.className =
                        'ad-media-fallback';

                    fallback.textContent =
                        iniciais;

                    mediaBox.appendChild(
                        fallback
                    );
                }
            }
        }
    );
}

link.appendChild(card);

return link;


}

/* =========================================================
GERAR INICIAIS
========================================================= */

function gerarIniciais(nome) {


const partes = String(nome || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

if (partes.length === 0) {
    return 'U';
}

if (partes.length === 1) {

    return partes[0]
        .substring(0, 2)
        .toUpperCase();
}

return (
    partes[0].charAt(0) +
    partes[partes.length - 1].charAt(0)
).toUpperCase();


}

/* =========================================================
ESCAPAR HTML
========================================================= */

function escaparHtml(valor) {


return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');


}

/* =========================================================
CARREGAR CANTORES E MÚSICOS
========================================================= */

async function carregarProfissionaisInicio() {


console.log(
    '🎵 Carregando profissionais publicados...'
);

await Promise.all([
    carregarProfissionaisIndex('Cantor'),
    carregarProfissionaisIndex('Músico')
]);


}

/* =========================================================
COMPATIBILIDADE COM O BOTÃO DE FILTRO
========================================================= */

window.abrirModalFiltro = function () {


if (
    window.ModalFiltro &&
    typeof window.ModalFiltro.abrir === 'function'
) {

    window.ModalFiltro.abrir();

    return;
}

console.warn(
    '⚠️ ModalFiltro ainda não foi carregado.'
);


};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

document.addEventListener(
'DOMContentLoaded',
function() {


    carregarProfissionaisInicio();

}


);
