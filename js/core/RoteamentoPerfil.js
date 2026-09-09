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

    cantor:
        'meu-perfil-cantor.html',

    musico:
        'meu-perfil-musico.html',

    banda:
        'meu-perfil-banda.html',

    dupla_musical:
        'meu-perfil-dupla-musical.html',

    dj:
        'meu-perfil-dj.html',

    dancarino:
        'meu-perfil-dancarino.html',

    grupo_danca:
        'meu-perfil-grupo-danca.html',

    mc:
        'meu-perfil-mc.html',

    compositor:
        'meu-perfil-compositor.html',

    produtor_musical:
        'meu-perfil-produtor-musical.html'
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
NORMALIZAR TIPO DE ARTISTA
===================================================== */

normalizarTipoArtista(tipoArtista) {


const artista =
    this.normalizar(tipoArtista);


if (!artista) {
    return '';
}


/* =============================================
   CANTOR
   ============================================= */

if (
    artista === 'cantor' ||
    artista === 'cantora' ||
    artista === 'cantor(a)'
) {

    return 'cantor';
}


/* =============================================
   MÚSICO
   ============================================= */

if (
    artista === 'musico' ||
    artista === 'musica' ||
    artista === 'musico(a)'
) {

    return 'musico';
}


/* =============================================
   BANDA
   ============================================= */

if (
    artista === 'banda'
) {

    return 'banda';
}


/* =============================================
   DUPLA MUSICAL
   ============================================= */

if (
    artista === 'dupla' ||
    artista === 'dupla musical'
) {

    return 'dupla_musical';
}


/* =============================================
   DJ
   ============================================= */

if (
    artista === 'dj'
) {

    return 'dj';
}


/* =============================================
   DANÇARINO
   ============================================= */

if (
    artista === 'dancarino' ||
    artista === 'dancarina' ||
    artista === 'dancarino(a)'
) {

    return 'dancarino';
}


/* =============================================
   GRUPO DE DANÇA
   ============================================= */

if (
    artista === 'grupo de danca'
) {

    return 'grupo_danca';
}


/* =============================================
   MC
   ============================================= */

if (
    artista === 'mc'
) {

    return 'mc';
}


/* =============================================
   COMPOSITOR
   ============================================= */

if (
    artista === 'compositor' ||
    artista === 'compositora' ||
    artista === 'compositor(a)'
) {

    return 'compositor';
}


/* =============================================
   PRODUTOR MUSICAL
   ============================================= */

if (
    artista === 'produtor musical' ||
    artista === 'produtora musical' ||
    artista === 'produtor(a) musical'
) {

    return 'produtor_musical';
}


return '';


},

/* =====================================================
OBTER PÁGINA PELO TIPO E SUBTIPO
===================================================== */

obterPagina(tipoPerfil, tipoArtista) {


const tipo =
    this.normalizar(tipoPerfil);


/* =============================================
   ARTISTA
   ============================================= */

if (tipo === 'artista') {

    const artista =
        this.normalizarTipoArtista(tipoArtista);


    const pagina =
        this.paginas.artista[artista];


    if (pagina) {

        return pagina;
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
