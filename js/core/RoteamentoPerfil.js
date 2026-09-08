/* =========================================================
ROTEAMENTO DE PERFIS — MUSICALWORLD
Responsável por definir qual página pertence a cada
tipo e subtipo de perfil do usuário.
========================================================= */

const RoteamentoPerfil = {


/* =====================================================
   MAPA DE PERFIS
   ===================================================== */

paginas: {

    artista: {
        cantor: 'meu-perfil-cantor.html',
        músico: 'meu-perfil-musico.html',
        musico: 'meu-perfil-musico.html'
    },

    contratante:
        'meu-perfil-contratante.html',

    organizador_eventos:
        'meu-perfil-organizador.html',

    casa_shows:
        'meu-perfil-casa-shows.html',

    empresa_agencia:
        'meu-perfil-empresa.html'
},


/* =====================================================
   NORMALIZAR TEXTO
   ===================================================== */

normalizar(valor) {

    if (!valor) {
        return '';
    }

    return String(valor)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
},


/* =====================================================
   OBTER PÁGINA PELO TIPO E SUBTIPO
   ===================================================== */

obterPagina(tipoPerfil, tipoArtista) {

    const tipo =
        this.normalizar(tipoPerfil);

    const artista =
        this.normalizar(tipoArtista);


    /* =============================================
       ARTISTA
       ============================================= */

    if (tipo === 'artista') {

        if (artista === 'cantor') {

            return this.paginas.artista.cantor;
        }


        if (
            artista === 'musico' ||
            artista === 'músico'
        ) {

            return this.paginas.artista.musico;
        }


        console.warn(
            '⚠️ Tipo de artista não reconhecido:',
            tipoArtista
        );

        return null;
    }


    /* =============================================
       OUTROS TIPOS DE PERFIL
       ============================================= */

    const pagina =
        this.paginas[tipo];


    if (!pagina) {

        console.warn(
            '⚠️ Nenhuma página cadastrada para o tipo:',
            tipoPerfil
        );

        return null;
    }


    return pagina;
},


/* =====================================================
   VERIFICAR SE O TIPO EXISTE
   ===================================================== */

existe(tipoPerfil, tipoArtista) {

    return !!this.obterPagina(
        tipoPerfil,
        tipoArtista
    );
},


/* =====================================================
   ABRIR PERFIL
   ===================================================== */

abrir(tipoPerfil, tipoArtista) {

    const pagina =
        this.obterPagina(
            tipoPerfil,
            tipoArtista
        );


    if (!pagina) {

        console.warn(
            '⚠️ Não foi possível abrir o perfil:',
            {
                tipoPerfil,
                tipoArtista
            }
        );

        return false;
    }


    console.log(
        '👤 Abrindo perfil:',
        tipoPerfil,
        tipoArtista
    );


    console.log(
        '📄 Página:',
        pagina
    );


    window.location.href =
        pagina;


    return true;
},


/* =====================================================
   OBTER TIPO DE PERFIL A PARTIR DOS DADOS DO USUÁRIO
   ===================================================== */

obterTipo(dados) {

    if (!dados) {
        return {
            tipoPerfil: '',
            tipoArtista: ''
        };
    }


    const tipoPerfil =
        dados.tipoPerfil?.nome ||
        dados.perfil?.tipo_perfil?.nome ||
        '';


    const tipoArtista =
        dados.tipoArtista ||
        dados.perfilArtista?.tipo_artista ||
        dados.perfil_artista?.tipo_artista ||
        dados.perfil?.tipo_artista ||
        '';


    return {
        tipoPerfil,
        tipoArtista
    };
},


/* =====================================================
   ABRIR PERFIL A PARTIR DOS DADOS DO USUÁRIO
   ===================================================== */

abrirDadosUsuario(dados) {

    const tipos =
        this.obterTipo(dados);


    if (!tipos.tipoPerfil) {

        console.warn(
            '⚠️ Não foi possível identificar o tipo de perfil do usuário.'
        );

        return false;
    }


    return this.abrir(
        tipos.tipoPerfil,
        tipos.tipoArtista
    );
}


};

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.RoteamentoPerfil =
RoteamentoPerfil;
