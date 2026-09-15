const Cabecalho = {


/*
=========================================================
MUSICALWORLD — CABEÇALHO PRINCIPAL

Responsabilidade deste módulo:

- Controlar o estado visual do cabeçalho.
- Exibir o logo do MusicalWorld.
- Identificar o usuário autenticado.
- Exibir o avatar do usuário.
- Controlar o menu da conta.
- Controlar logout e troca de conta.
- Manter compatibilidade com ControleSessao.js.

O logo permanece sempre visível no lado esquerdo.
A área direita é responsável pelas ações da conta.
=========================================================
*/


inicializado: false,
menuUsuarioAberto: false,


/*
=========================================================
INICIALIZAÇÃO
=========================================================
*/

async iniciar() {

    if (this.inicializado) {
        return;
    }

    console.log('Inicializando cabeçalho...');

    this.inicializado = true;

    this.mostrarCarregando();

    try {

        const usuario = await ControleSessao.iniciar({
            exigirLogin: false
        });

        if (usuario) {

            console.log(
                'Cabeçalho: usuário autenticado.'
            );

            this.mostrarUsuario(usuario);

        } else {

            console.log(
                'Cabeçalho: usuário não autenticado.'
            );

            this.mostrarDeslogado();

        }

        ControleSessao.observar();

    } catch (erro) {

        console.error(
            'Erro ao inicializar cabeçalho:',
            erro
        );

        this.mostrarDeslogado();

    }

},


/*
=========================================================
ESTADO DE CARREGAMENTO

O logo permanece visível enquanto os dados do usuário
estão sendo carregados.
=========================================================
*/

mostrarCarregando() {

    const logo =
        document.getElementById('cabecalho-logo');

    const carregando =
        document.getElementById('cabecalho-carregando');

    const deslogado =
        document.getElementById('cabecalho-deslogado');

    const logado =
        document.getElementById('cabecalho-logado');


    /*
    -----------------------------------------------------
    LOGO

    O logo não é mais ocultado durante o carregamento.
    -----------------------------------------------------
    */

    if (logo) {
        logo.style.display = 'block';
    }


    /*
    -----------------------------------------------------
    ESTADOS DO USUÁRIO
    -----------------------------------------------------
    */

    if (carregando) {
        carregando.style.display = 'flex';
    }

    if (deslogado) {
        deslogado.style.display = 'none';
    }

    if (logado) {
        logado.style.display = 'none';
    }

},


/*
=========================================================
USUÁRIO DESLOGADO
=========================================================
*/

mostrarDeslogado() {

    const logo =
        document.getElementById('cabecalho-logo');

    const carregando =
        document.getElementById('cabecalho-carregando');

    const deslogado =
        document.getElementById('cabecalho-deslogado');

    const logado =
        document.getElementById('cabecalho-logado');


    this.fecharMenuUsuario();


    /*
    -----------------------------------------------------
    LOGO

    O logo permanece sempre visível.
    -----------------------------------------------------
    */

    if (logo) {
        logo.style.display = 'block';
    }


    /*
    -----------------------------------------------------
    ESTADOS DO USUÁRIO
    -----------------------------------------------------
    */

    if (carregando) {
        carregando.style.display = 'none';
    }

    if (deslogado) {
        deslogado.style.display = 'flex';
    }

    if (logado) {
        logado.style.display = 'none';
    }

},


/*
=========================================================
USUÁRIO LOGADO
=========================================================
*/

mostrarUsuario(dados) {

    const logo =
        document.getElementById('cabecalho-logo');

    const carregando =
        document.getElementById('cabecalho-carregando');

    const deslogado =
        document.getElementById('cabecalho-deslogado');

    const logado =
        document.getElementById('cabecalho-logado');


    const usuario = dados?.usuario;

    const tipoPerfil = dados?.tipoPerfil;


    /*
    -----------------------------------------------------
    PROTEÇÃO
    -----------------------------------------------------
    */

    if (!usuario) {

        this.mostrarDeslogado();

        return;

    }


    /*
    -----------------------------------------------------
    LOGO

    Antes o logo era escondido aqui.

    Isso criava o espaço vazio no lado esquerdo
    quando o usuário estava autenticado.

    Agora ele permanece sempre visível.
    -----------------------------------------------------
    */

    if (logo) {
        logo.style.display = 'block';
    }


    /*
    -----------------------------------------------------
    ESTADOS DO USUÁRIO
    -----------------------------------------------------
    */

    if (carregando) {
        carregando.style.display = 'none';
    }

    if (deslogado) {
        deslogado.style.display = 'none';
    }

    if (logado) {
        logado.style.display = 'flex';
    }


    /*
    -----------------------------------------------------
    DADOS DO USUÁRIO
    -----------------------------------------------------
    */

    const nome =
        usuario.nome || 'Usuário';

    const tipo =
        tipoPerfil?.nome || 'Perfil';


    const nomeElemento =
        document.getElementById('cabecalho-nome');

    const tipoElemento =
        document.getElementById('cabecalho-tipo');

    const avatar =
        document.getElementById('cabecalho-avatar');

    const letras =
        document.getElementById('cabecalho-avatar-letras');


    /*
    -----------------------------------------------------
    NOME
    -----------------------------------------------------
    */

    if (nomeElemento) {

        nomeElemento.textContent = nome;

    }


    /*
    -----------------------------------------------------
    TIPO DE PERFIL
    -----------------------------------------------------
    */

    if (tipoElemento) {

        tipoElemento.textContent =
            this.formatarTipoPerfil(tipo);

    }


    /*
    -----------------------------------------------------
    AVATAR

    Se existir foto, utiliza a imagem.

    Caso contrário, utiliza as iniciais do nome.
    -----------------------------------------------------
    */

    if (usuario.foto_url) {

        if (avatar) {

            avatar.style.backgroundImage =
                `url("${usuario.foto_url}")`;

            avatar.style.backgroundSize =
                'cover';

            avatar.style.backgroundPosition =
                'center';

            avatar.style.backgroundRepeat =
                'no-repeat';

        }


        if (letras) {

            letras.style.display =
                'none';

        }

    } else {

        if (avatar) {

            avatar.style.backgroundImage =
                '';

        }


        if (letras) {

            letras.textContent =
                this.obterIniciais(nome);

            letras.style.display =
                'flex';

        }

    }


    /*
    -----------------------------------------------------
    GARANTE QUE O MENU ESTEJA FECHADO
    -----------------------------------------------------
    */

    this.fecharMenuUsuario();

},


/*
=========================================================
ABRIR / FECHAR MENU DO USUÁRIO
=========================================================
*/

alternarMenuUsuario() {

    const menu =
        document.getElementById(
            'cabecalho-menu-usuario'
        );

    const botao =
        document.querySelector(
            '.cabecalho-usuario-btn'
        );


    if (!menu) {
        return;
    }


    this.menuUsuarioAberto =
        !this.menuUsuarioAberto;


    if (this.menuUsuarioAberto) {

        menu.style.display = 'block';


        if (botao) {

            botao.setAttribute(
                'aria-expanded',
                'true'
            );

        }

    } else {

        this.fecharMenuUsuario();

    }

},


/*
=========================================================
FECHAR MENU DO USUÁRIO
=========================================================
*/

fecharMenuUsuario() {

    const menu =
        document.getElementById(
            'cabecalho-menu-usuario'
        );

    const botao =
        document.querySelector(
            '.cabecalho-usuario-btn'
        );


    this.menuUsuarioAberto = false;


    if (menu) {

        menu.style.display =
            'none';

    }


    if (botao) {

        botao.setAttribute(
            'aria-expanded',
            'false'
        );

    }

},


/*
=========================================================
TROCAR DE CONTA
=========================================================
*/

trocarConta() {

    console.log(
        'Usuário solicitou troca de conta.'
    );


    this.fecharMenuUsuario();


    const confirmou = confirm(
        'Para trocar de conta, sua sessão atual será encerrada. Deseja continuar?'
    );


    if (!confirmou) {
        return;
    }


    ControleSessao.sair(
        'login.html'
    );

},


/*
=========================================================
SAIR DA CONTA
=========================================================
*/

async sair() {

    console.log(
        'Usuário solicitou logout pelo cabeçalho.'
    );


    this.fecharMenuUsuario();


    const confirmou = confirm(
        'Deseja realmente sair da sua conta?'
    );


    if (!confirmou) {
        return;
    }


    const sucesso =
        await ControleSessao.sair(
            'login.html'
        );


    if (!sucesso) {

        alert(
            'Não foi possível encerrar a sessão. Tente novamente.'
        );

    }

},


/*
=========================================================
OBTER INICIAIS DO USUÁRIO
=========================================================
*/

obterIniciais(nome) {

    const partes =
        nome
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

},


/*
=========================================================
FORMATAR TIPO DE PERFIL
=========================================================
*/

formatarTipoPerfil(tipo) {

    const tipos = {

        artista:
            'Artista',

        contratante:
            'Contratante',

        organizador_eventos:
            'Organizador de eventos',

        casa_shows:
            'Casa de shows',

        empresa_agencia:
            'Empresa / Agência'

    };


    return tipos[tipo] || tipo;

}


};

/*

# DISPONIBILIZA O MÓDULO GLOBALMENTE

*/

window.Cabecalho = Cabecalho;

/*

# FECHAR MENU AO CLICAR FORA

*/

document.addEventListener(
'click',
function (evento) {


    const areaUsuario =
        document.getElementById(
            'cabecalho-logado'
        );


    if (!areaUsuario) {
        return;
    }


    if (!areaUsuario.contains(evento.target)) {

        Cabecalho.fecharMenuUsuario();

    }

}


);
