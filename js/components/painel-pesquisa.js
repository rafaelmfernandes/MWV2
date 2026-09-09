/* =========================================================
PAINEL DE PESQUISA — MUSICALWORLD
Pesquisa global de profissionais
========================================================= */

const PainelPesquisa = {


inicializado: false,
pesquisando: false,
ultimoTermo: '',
timeoutPesquisa: null,

/* =====================================================
   INICIALIZAÇÃO
   ===================================================== */

iniciar() {

    if (this.inicializado) {
        return;
    }

    this.criarPainel();
    this.configurarEventos();

    this.inicializado = true;

    console.log(
        '🔎 Painel de pesquisa inicializado corretamente.'
    );
},


/* =====================================================
   CRIA / LOCALIZA O PAINEL
   ===================================================== */

criarPainel() {


let painel =
    document.getElementById('painel-pesquisa');

/*
 * Se o painel já existir, reutiliza.
 */
if (painel) {
    return painel;
}

/*
 * Cria o painel diretamente no BODY.
 *
 * NÃO criamos:
 * #painel-pesquisa-container
 *
 * Isso elimina o box externo.
 */

painel =
    document.createElement('div');

painel.id =
    'painel-pesquisa';

painel.className =
    'search-overlay';


painel.innerHTML = `

    <div class="search-overlay-header">

        <div class="search-overlay-input-wrapper">

            <svg
                class="search-overlay-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <circle
                    cx="11"
                    cy="11"
                    r="8"
                ></circle>

                <line
                    x1="21"
                    y1="21"
                    x2="16.65"
                    y2="16.65"
                ></line>
            </svg>


            <input
                type="text"
                id="campo-pesquisa"
                class="search-overlay-input"
                placeholder="Buscar artistas, estilos, eventos..."
                autocomplete="off"
            >

        </div>


        <button
            type="button"
            class="search-overlay-cancelar"
            id="btn-fechar-pesquisa"
        >
            Cancelar
        </button>

    </div>


    <div
        id="resultados-pesquisa"
        class="search-results"
    >

        <p class="search-estado-vazio">
            Digite algo para buscar em todas as categorias.
        </p>

    </div>

`;


/*
 * DIRETAMENTE NO BODY.
 */
document.body.appendChild(
    painel
);


console.log(
    '🔎 Painel de pesquisa criado diretamente no body.'
);


return painel;


},



/* =====================================================
   EVENTOS
   ===================================================== */

configurarEventos() {

    const campo =
        document.getElementById(
            'campo-pesquisa'
        );


    const botaoFechar =
        document.getElementById(
            'btn-fechar-pesquisa'
        );


    if (campo) {

        /*
         * Remove listener anterior caso o método seja
         * chamado novamente.
         */

        campo.oninput = evento => {

            const termo =
                evento.target.value.trim();

            this.filtrar(
                termo
            );
        };


        campo.onkeydown = evento => {

            if (
                evento.key === 'Escape'
            ) {

                evento.preventDefault();

                this.fechar();
            }
        };
    }


    if (botaoFechar) {

        botaoFechar.onclick = () => {

            this.fechar();

        };
    }


    /*
     * ESC global
     */

    if (!this._eventoEscapeRegistrado) {

        document.addEventListener(
            'keydown',
            evento => {

                if (
                    evento.key !== 'Escape'
                ) {
                    return;
                }


                const painel =
                    document.getElementById(
                        'painel-pesquisa'
                    );


                if (
                    painel &&
                    painel.classList.contains('ativo')
                ) {

                    this.fechar();
                }

            }
        );


        this._eventoEscapeRegistrado =
            true;
    }
},


/* =====================================================
   ABRIR
   ===================================================== */

abrir() {

    /*
     * Garante que o objeto esteja inicializado.
     */

    if (!this.inicializado) {

        this.iniciar();
    }


    /*
     * Procura novamente o painel.
     */

    let painel =
        document.getElementById(
            'painel-pesquisa'
        );


    /*
     * Se por algum motivo não existir,
     * cria agora.
     */

    if (!painel) {

        painel =
            this.criarPainel();

        /*
         * Os eventos também precisam ser ligados
         * caso o painel tenha sido criado agora.
         */

        this.configurarEventos();
    }


    if (!painel) {

        console.error(
            '❌ Não foi possível criar o painel de pesquisa.'
        );

        return;
    }


    /*
     * Abre o painel.
     */

    painel.classList.add(
        'ativo'
    );


    this.ultimoTermo =
        '';


    const campo =
        document.getElementById(
            'campo-pesquisa'
        );


    if (campo) {

        campo.value = '';


        setTimeout(() => {

            campo.focus();

        }, 200);
    }


    this.mostrarEstadoInicial();
},


/* =====================================================
   FECHAR
   ===================================================== */

fechar() {

    const painel =
        document.getElementById(
            'painel-pesquisa'
        );


    if (!painel) {
        return;
    }


    painel.classList.remove(
        'ativo'
    );


    this.ultimoTermo =
        '';


    this.pesquisando =
        false;


    if (this.timeoutPesquisa) {

        clearTimeout(
            this.timeoutPesquisa
        );

        this.timeoutPesquisa =
            null;
    }


    const campo =
        document.getElementById(
            'campo-pesquisa'
        );


    if (campo) {

        campo.value = '';
    }


    this.mostrarEstadoInicial();
},


/* =====================================================
   ESTADO INICIAL
   ===================================================== */

mostrarEstadoInicial() {

    const resultados =
        document.getElementById(
            'resultados-pesquisa'
        );


    if (!resultados) {
        return;
    }


    resultados.innerHTML = `

        <p class="search-estado-vazio">
            Digite algo para buscar em todas as categorias.
        </p>

    `;
},


/* =====================================================
   NORMALIZAR TEXTO
   ===================================================== */

normalizarTexto(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return '';
    }


    return String(valor)

        .normalize('NFD')

        .replace(
            /[\u0300-\u036f]/g,
            ''
        )

        .toLowerCase()

        .trim();
},


/* =====================================================
   NORMALIZAR LISTAS
   ===================================================== */

normalizarLista(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return [];
    }


    if (
        Array.isArray(valor)
    ) {

        return valor

            .filter(
                item =>
                    item !== null &&
                    item !== undefined &&
                    String(item).trim() !== ''
            )

            .map(
                item =>
                    String(item).trim()
            );
    }


    if (
        typeof valor === 'string'
    ) {

        return valor

            .split(',')

            .map(
                item =>
                    item.trim()
            )

            .filter(
                item =>
                    item !== ''
            );
    }


    return [
        String(valor)
    ];
},


/* =====================================================
   OBTER PERFIL DO ARTISTA
   ===================================================== */

obterArtistaPerfil(perfil) {

    if (!perfil) {
        return null;
    }


    if (
        Array.isArray(
            perfil.perfis_artistas
        )
    ) {

        return (
            perfil.perfis_artistas[0] ||
            null
        );
    }


    if (
        perfil.perfis_artistas
    ) {

        return perfil.perfis_artistas;
    }


    if (
        perfil.perfil_artista
    ) {

        return perfil.perfil_artista;
    }


    return null;
},


/* =====================================================
   INICIAIS
   ===================================================== */

gerarIniciais(nome) {

    const texto =
        String(
            nome || 'Artista'
        ).trim();


    if (!texto) {
        return 'A';
    }


    const partes =
        texto
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
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();
},


/* =====================================================
   ESCAPAR HTML
   ===================================================== */

escaparHtml(valor) {

    return String(
        valor ?? ''
    )

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );
},


/* =====================================================
   DEFINIR PÁGINA DO PERFIL
   ===================================================== */

obterPaginaPerfil(tipoArtista) {

    const tipo =
        this.normalizarTexto(
            tipoArtista
        );


    if (
        tipo === 'musico' ||
        tipo === 'musica' ||
        tipo === 'instrumentista'
    ) {

        return 'apresentar-perfil-musico.html';
    }


    if (
        tipo === 'cantor' ||
        tipo === 'cantora'
    ) {

        return 'apresentar-perfil-cantor.html';
    }


    return 'apresentar-perfil-profissional.html';
},


/* =====================================================
   BUSCAR NO SUPABASE
   ===================================================== */

async buscarNoBanco(termo) {

    const supabase =
        window.supabaseClient ||
        window._supabase ||
        window.supabase;


    if (!supabase) {

        console.error(
            '❌ Cliente Supabase não encontrado.'
        );

        return [];
    }


    const { data, error } =
        await supabase

            .from('perfis')

            .select(`
                id,
                usuario_id,
                tipo_perfil_id,
                nome_exibicao,
                descricao,
                ativo,
                perfil_publicado,
                created_at,

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
                ),

                portfolio_musicos (
                    id,
                    perfil_id,
                    tipo,
                    titulo,
                    descricao,
                    arquivo_url,
                    thumbnail_url,
                    ordem,
                    ativo,
                    destaque_catalogo
                )
            `)

            .eq(
                'ativo',
                true
            )

            .eq(
                'perfil_publicado',
                true
            )

            .order(
                'created_at',
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            '❌ Erro ao buscar profissionais:',
            error
        );

        return [];
    }


    if (!data) {
        return [];
    }


    const termoNormalizado =
        this.normalizarTexto(
            termo
        );


    if (!termoNormalizado) {
        return [];
    }


    const resultados =
        data.filter(
            perfil => {

                const artista =
                    this.obterArtistaPerfil(
                        perfil
                    );


                if (!artista) {
                    return false;
                }


                const estilos =
                    this.normalizarLista(
                        artista.estilos
                    );


                const instrumentos =
                    this.normalizarLista(
                        artista.instrumentos
                    );


                const servicos =
                    this.normalizarLista(
                        artista.servicos
                    );


                const portfolio =
                    Array.isArray(
                        perfil.portfolio_musicos
                    )
                        ? perfil.portfolio_musicos
                        : [];


                const textos = [

                    perfil.nome_exibicao,

                    perfil.descricao,

                    artista.tipo_artista,

                    artista.localizacao,

                    artista.experiencia,

                    artista.area_atendimento,

                    ...estilos,

                    ...instrumentos,

                    ...servicos,

                    ...portfolio.map(
                        item =>
                            item.titulo
                    ),

                    ...portfolio.map(
                        item =>
                            item.descricao
                    )

                ];


                const textoCompleto =
                    textos

                        .filter(
                            valor =>
                                valor !== null &&
                                valor !== undefined
                        )

                        .map(
                            valor =>
                                this.normalizarTexto(
                                    valor
                                )
                        )

                        .join(' ');


                return textoCompleto.includes(
                    termoNormalizado
                );
            }
        );


    return resultados;
},


/* =====================================================
   CRIAR RESULTADO
   ===================================================== */

criarResultado(perfil) {

    const artista =
        this.obterArtistaPerfil(
            perfil
        );


    if (!artista) {
        return '';
    }


    const nome =
        perfil.nome_exibicao ||
        'Artista';


    const localizacao =
        artista.localizacao ||
        'Localização não informada';


    const estilos =
        this.normalizarLista(
            artista.estilos
        );


    let generoMusical =
        estilos
            .slice(0, 2)
            .join(' • ');


    if (!generoMusical) {

        generoMusical =
            artista.tipo_artista ||
            'Gênero não informado';
    }


    const foto =
        artista.foto_url ||
        '';


    const iniciais =
        this.gerarIniciais(
            nome
        );


    const paginaPerfil =
        this.obterPaginaPerfil(
            artista.tipo_artista
        );


    const href =
        `${paginaPerfil}?id=${encodeURIComponent(perfil.id)}`;


    let fotoHtml = '';


    if (foto) {

        fotoHtml = `

            <img
                class="search-result-avatar"
                src="${this.escaparHtml(foto)}"
                alt="${this.escaparHtml(nome)}"
                loading="lazy"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <span
                class="search-result-avatar-fallback"
                style="display:none;"
            >
                ${this.escaparHtml(iniciais)}
            </span>

        `;

    } else {

        fotoHtml = `

            <span
                class="search-result-avatar-fallback"
            >
                ${this.escaparHtml(iniciais)}
            </span>

        `;
    }


    return `

        <a
            href="${this.escaparHtml(href)}"
            class="search-result-item"
            aria-label="Abrir perfil de ${this.escaparHtml(nome)}"
        >

            <div
                class="search-result-avatar-wrapper"
            >
                ${fotoHtml}
            </div>


            <div
                class="search-result-info"
            >

                <h4
                    class="search-result-name"
                >
                    ${this.escaparHtml(nome)}
                </h4>


                <div
                    class="search-result-location"
                >

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <path
                            d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"
                        ></path>

                        <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                        ></circle>

                    </svg>


                    <span>
                        ${this.escaparHtml(localizacao)}
                    </span>

                </div>


                <div
                    class="search-result-genre"
                >

                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                    >

                        <path
                            d="M9 18V5l12-2v13"
                        ></path>

                        <circle
                            cx="6"
                            cy="18"
                            r="3"
                        ></circle>

                        <circle
                            cx="18"
                            cy="16"
                            r="3"
                        ></circle>

                    </svg>


                    <span>
                        ${this.escaparHtml(generoMusical)}
                    </span>

                </div>

            </div>


            <svg
                class="search-result-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >

                <path
                    d="m9 18 6-6-6-6"
                ></path>

            </svg>

        </a>

    `;
},


/* =====================================================
   RENDERIZAR RESULTADOS
   ===================================================== */

renderizarResultados(resultados) {

    const container =
        document.getElementById(
            'resultados-pesquisa'
        );


    if (!container) {

        console.warn(
            '⚠️ Container de resultados não encontrado.'
        );

        return;
    }


    if (
        !resultados ||
        resultados.length === 0
    ) {

        container.innerHTML = `

            <div
                class="search-estado-sem-resultados"
            >

                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >

                    <circle
                        cx="11"
                        cy="11"
                        r="8"
                    ></circle>

                    <line
                        x1="21"
                        y1="21"
                        x2="16.65"
                        y2="16.65"
                    ></line>

                </svg>


                <p>
                    Nenhum profissional encontrado.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        resultados

            .map(
                perfil =>
                    this.criarResultado(
                        perfil
                    )
            )

            .join('');
},


/* =====================================================
   CARREGANDO
   ===================================================== */

mostrarCarregando() {

    const container =
        document.getElementById(
            'resultados-pesquisa'
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div
            class="search-estado-carregando"
        >

            <div
                class="search-loading-spinner"
                aria-hidden="true"
            ></div>


            <p>
                Buscando...
            </p>

        </div>

    `;
},


/* =====================================================
   PESQUISAR
   ===================================================== */

async filtrar(termo) {

    const termoLimpo =
        String(
            termo || ''
        ).trim();


    this.ultimoTermo =
        termoLimpo;


    /*
     * Cancela pesquisa anterior agendada.
     */

    if (this.timeoutPesquisa) {

        clearTimeout(
            this.timeoutPesquisa
        );

        this.timeoutPesquisa =
            null;
    }


    /*
     * Campo vazio.
     */

    if (!termoLimpo) {

        this.pesquisando =
            false;

        this.mostrarEstadoInicial();

        return;
    }


    /*
     * Evita pesquisa para apenas uma letra.
     */

    if (
        termoLimpo.length < 2
    ) {

        const container =
            document.getElementById(
                'resultados-pesquisa'
            );


        if (container) {

            container.innerHTML = `

                <p
                    class="search-estado-vazio"
                >
                    Digite pelo menos 2 caracteres.
                </p>

            `;
        }

        return;
    }


    /*
     * Pequeno debounce para não consultar o banco
     * a cada tecla imediatamente.
     */

    this.timeoutPesquisa =
        setTimeout(
            async () => {

                const termoPesquisa =
                    this.ultimoTermo;


                this.pesquisando =
                    true;


                this.mostrarCarregando();


                try {

                    const resultados =
                        await this.buscarNoBanco(
                            termoPesquisa
                        );


                    /*
                     * Se o usuário já digitou outra
                     * coisa enquanto a consulta estava
                     * acontecendo, ignora o resultado.
                     */

                    if (
                        this.ultimoTermo !==
                        termoPesquisa
                    ) {

                        return;
                    }


                    this.renderizarResultados(
                        resultados
                    );


                } catch (erro) {

                    console.error(
                        '❌ Erro durante a pesquisa:',
                        erro
                    );


                    if (
                        this.ultimoTermo ===
                        termoPesquisa
                    ) {

                        const container =
                            document.getElementById(
                                'resultados-pesquisa'
                            );


                        if (container) {

                            container.innerHTML = `

                                <div
                                    class="search-estado-erro"
                                >

                                    <p>
                                        Não foi possível realizar a pesquisa.
                                    </p>

                                </div>

                            `;
                        }
                    }

                } finally {

                    if (
                        this.ultimoTermo ===
                        termoPesquisa
                    ) {

                        this.pesquisando =
                            false;
                    }
                }

            },
            300
        );
}


};

/* =========================================================
EXPORTAÇÕES GLOBAIS
========================================================= */

window.PainelPesquisa =
PainelPesquisa;

window.abrirPesquisa =
() => {


    PainelPesquisa.abrir();

};


window.fecharPesquisa =
() => {


    PainelPesquisa.fechar();

};


window.filtrarPesquisa =
termo => {


    PainelPesquisa.filtrar(
        termo
    );

};


/* =========================================================
DOM READY
========================================================= */

document.addEventListener(
'DOMContentLoaded',
() => {


    PainelPesquisa.iniciar();

}


);
