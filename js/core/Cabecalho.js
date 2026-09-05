const Cabecalho = {


inicializado: false,

async iniciar() {

    if (this.inicializado) {
        return;
    }

    console.log('🧭 Inicializando cabeçalho...');

    this.inicializado = true;

    this.mostrarCarregando();

    try {

        const usuario = await ControleSessao.iniciar({
            exigirLogin: false
        });

        if (usuario) {

            console.log('👤 Cabeçalho: usuário autenticado.');

            this.mostrarUsuario(usuario);

        } else {

            console.log('🔓 Cabeçalho: usuário não autenticado.');

            this.mostrarDeslogado();

        }

        ControleSessao.observar();

    } catch (erro) {

        console.error('❌ Erro ao inicializar cabeçalho:', erro);

        this.mostrarDeslogado();

    }

},

mostrarCarregando() {

    const carregando = document.getElementById('cabecalho-carregando');
    const deslogado = document.getElementById('cabecalho-deslogado');
    const logado = document.getElementById('cabecalho-logado');

    if (carregando) carregando.style.display = 'flex';
    if (deslogado) deslogado.style.display = 'none';
    if (logado) logado.style.display = 'none';

},

mostrarDeslogado() {

    const carregando = document.getElementById('cabecalho-carregando');
    const deslogado = document.getElementById('cabecalho-deslogado');
    const logado = document.getElementById('cabecalho-logado');

    if (carregando) carregando.style.display = 'none';
    if (deslogado) deslogado.style.display = 'flex';
    if (logado) logado.style.display = 'none';

},

mostrarUsuario(dados) {

    const carregando = document.getElementById('cabecalho-carregando');
    const deslogado = document.getElementById('cabecalho-deslogado');
    const logado = document.getElementById('cabecalho-logado');

    if (carregando) carregando.style.display = 'none';
    if (deslogado) deslogado.style.display = 'none';
    if (logado) logado.style.display = 'flex';

    const usuario = dados?.usuario;

    const tipoPerfil = dados?.tipoPerfil;

    if (!usuario) {
        this.mostrarDeslogado();
        return;
    }

    const nome = usuario.nome || 'Usuário';

    const tipo = tipoPerfil?.nome || 'Perfil';

    const nomeElemento = document.getElementById('cabecalho-nome');
    const tipoElemento = document.getElementById('cabecalho-tipo');
    const avatar = document.getElementById('cabecalho-avatar');
    const letras = document.getElementById('cabecalho-avatar-letras');

    if (nomeElemento) {
        nomeElemento.textContent = nome;
    }

    if (tipoElemento) {
        tipoElemento.textContent = this.formatarTipoPerfil(tipo);
    }

    if (usuario.foto_url) {

        if (avatar) {
            avatar.style.backgroundImage = `url("${usuario.foto_url}")`;
            avatar.style.backgroundSize = 'cover';
            avatar.style.backgroundPosition = 'center';
        }

        if (letras) {
            letras.style.display = 'none';
        }

    } else {

        if (avatar) {
            avatar.style.backgroundImage = '';
        }

        if (letras) {
            letras.textContent = this.obterIniciais(nome);
            letras.style.display = 'flex';
        }

    }

},

obterIniciais(nome) {

    const partes = nome
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) {
        return 'U';
    }

    if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
    }

    return (
        partes[0].charAt(0) +
        partes[partes.length - 1].charAt(0)
    ).toUpperCase();

},

formatarTipoPerfil(tipo) {

    const tipos = {

        artista: 'Artista',

        contratante: 'Contratante',

        organizador_eventos: 'Organizador de eventos',

        casa_shows: 'Casa de shows',

        empresa_agencia: 'Empresa / Agência'

    };

    return tipos[tipo] || tipo;

},

async sair() {

    console.log('🚪 Usuário solicitou logout pelo cabeçalho.');

    const confirmou = confirm(
        'Deseja realmente sair da sua conta?'
    );

    if (!confirmou) {
        return;
    }

    const sucesso = await ControleSessao.sair('login.html');

    if (!sucesso) {

        alert(
            'Não foi possível encerrar a sessão. Tente novamente.'
        );

    }

}


};

window.Cabecalho = Cabecalho;
