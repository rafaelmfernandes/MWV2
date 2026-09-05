/* =========================================================
ROTEAMENTO DE PERFIS — MUSICALWORLD
Responsável por definir qual página pertence a cada
tipo de perfil do usuário.
========================================================= */

const RoteamentoPerfil = {


/* =====================================================
   MAPA DE PERFIS
   ===================================================== */

paginas: {

    artista:
        'meu-perfil-musico.html',

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
   OBTER PÁGINA PELO TIPO DE PERFIL
   ===================================================== */

obterPagina(tipoPerfil) {

    if (!tipoPerfil) {

        console.warn(
            '⚠️ Tipo de perfil não informado.'
        );

        return null;
    }


    const tipo =
        String(tipoPerfil)
            .trim()
            .toLowerCase();


    const pagina =
        this.paginas[tipo];


    if (!pagina) {

        console.warn(
            '⚠️ Nenhuma página cadastrada para o tipo de perfil:',
            tipo
        );

        return null;
    }


    return pagina;
},


/* =====================================================
   VERIFICAR SE O TIPO DE PERFIL EXISTE
   ===================================================== */

existe(tipoPerfil) {

    return !!this.obterPagina(tipoPerfil);

},


/* =====================================================
   ABRIR PERFIL
   ===================================================== */

abrir(tipoPerfil) {

    const pagina =
        this.obterPagina(tipoPerfil);


    if (!pagina) {

        console.warn(
            '⚠️ Não foi possível abrir o perfil:',
            tipoPerfil
        );

        return false;
    }


    console.log(
        '👤 Abrindo perfil:',
        tipoPerfil
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
        return '';
    }


    return (
        dados.tipoPerfil?.nome ||
        dados.perfil?.tipo_perfil?.nome ||
        ''
    );
},


/* =====================================================
   ABRIR PERFIL A PARTIR DOS DADOS DO USUÁRIO
   ===================================================== */

abrirDadosUsuario(dados) {

    const tipoPerfil =
        this.obterTipo(dados);


    if (!tipoPerfil) {

        console.warn(
            '⚠️ Não foi possível identificar o tipo de perfil do usuário.'
        );

        return false;
    }


    return this.abrir(tipoPerfil);
}


};

/* =========================================================
DISPONIBILIZAR GLOBALMENTE
========================================================= */

window.RoteamentoPerfil =
RoteamentoPerfil;
