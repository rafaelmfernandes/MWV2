const ControleSessao = {


inicializado: false,
observadorIniciado: false,
usuario: null,
carregando: false,

async iniciar(opcoes = {}) {

    const {
        exigirLogin = false,
        redirecionarPara = 'login.html'
    } = opcoes;

    console.log('🔐 Iniciando controle global de sessão...');

    try {

        const sessao = await Sessao.obter();

        if (!sessao) {

            console.log('ℹ️ Nenhuma sessão ativa.');

            this.usuario = null;
            this.inicializado = true;

            if (exigirLogin) {

                console.log('🚪 Página protegida sem sessão.');
                window.location.href = redirecionarPara;
                return null;
            }

            return null;
        }

        console.log('✅ Sessão ativa encontrada.');

        const dadosUsuario = await this.carregarUsuario();

        if (!dadosUsuario) {

            console.warn('⚠️ Sessão encontrada, mas não foi possível carregar o usuário.');

            this.usuario = null;
            this.inicializado = true;

            if (exigirLogin) {
                window.location.href = redirecionarPara;
                return null;
            }

            return null;
        }

        this.usuario = dadosUsuario;
        this.inicializado = true;

        console.log('✅ Controle global inicializado.');

        return this.usuario;

    } catch (erro) {

        console.error('❌ Erro ao iniciar controle de sessão:', erro);

        this.usuario = null;
        this.inicializado = true;

        if (exigirLogin) {
            window.location.href = redirecionarPara;
        }

        return null;
    }
},


async carregarUsuario() {

    if (this.carregando) {
        return this.usuario;
    }

    this.carregando = true;

    try {

        const dadosUsuario = await UsuarioAtual.carregar();

        if (!dadosUsuario) {
            return null;
        }

        this.usuario = dadosUsuario;

        console.log('👤 Usuário carregado pelo controle global.');
        console.log('🆔 ID:', dadosUsuario.usuario.id);
        console.log('📧 E-mail:', dadosUsuario.usuario.email);
        console.log('🎯 Tipo:', dadosUsuario.tipoPerfil?.nome);

        return dadosUsuario;

    } catch (erro) {

        console.error('❌ Erro ao carregar usuário:', erro);

        this.usuario = null;

        return null;

    } finally {

        this.carregando = false;
    }
},


obter() {

    return this.usuario;
},


estaLogado() {

    return !!this.usuario;
},


async perfil() {

    const usuario = this.usuario || await this.carregarUsuario();

    return usuario?.perfil || null;
},


async tipoPerfil() {

    const usuario = this.usuario || await this.carregarUsuario();

    return usuario?.tipoPerfil || null;
},


async sair(redirecionarPara = 'login.html') {

    console.log('🚪 Encerrando sessão...');

    const sucesso = await Sessao.sair();

    if (!sucesso) {

        console.error('❌ Não foi possível encerrar a sessão.');

        return false;
    }

    this.usuario = null;
    this.inicializado = false;
    this.carregando = false;

    localStorage.removeItem('musicalworld_usuario_id');
    localStorage.removeItem('musicalworld_usuario_email');

    console.log('✅ Sessão encerrada.');

    if (redirecionarPara) {
        window.location.href = redirecionarPara;
    }

    return true;
},

async protegerPagina(opcoes = {}) {


const {
    redirecionarPara = 'login.html',
    salvarDestino = true
} = opcoes;

console.log('🛡️ Verificando acesso à página...');

const usuario = await this.iniciar({
    exigirLogin: false
});

if (usuario) {

    console.log('✅ Acesso autorizado.');
    console.log('👤 Usuário:', usuario.usuario.nome);
    console.log('🎯 Tipo:', usuario.tipoPerfil?.nome);

    this.observar();

    return true;
}

console.log('🚫 Acesso negado. Usuário não autenticado.');

if (salvarDestino) {

    const paginaAtual =
        window.location.pathname.split('/').pop() ||
        'index.html';

    const parametros = window.location.search;

    const destino = paginaAtual + parametros;

    sessionStorage.setItem(
        'musicalworld_destino_login',
        destino
    );

    console.log('📍 Destino salvo:', destino);
}

window.location.href = redirecionarPara;

return false;


},


observar() {

    if (this.observadorIniciado) {

        console.log('👀 Observador de autenticação já está ativo.');

        return;
    }

    this.observadorIniciado = true;

    console.log('👀 Controle global observando autenticação...');

    supabaseClient.auth.onAuthStateChange(async (evento, sessao) => {

        console.log('🔄 Alteração de autenticação:', evento);

        if (evento === 'SIGNED_OUT') {

            this.usuario = null;
            this.inicializado = false;

            console.log('🚪 Usuário saiu da conta.');

            return;
        }

        if (!sessao) {

            this.usuario = null;

            console.log('ℹ️ Nenhuma sessão disponível.');

            return;
        }

        /*
         * INITIAL_SESSION:
         * A sessão já foi carregada quando a página iniciou.
         * Não precisamos buscar tudo novamente se o usuário
         * já foi carregado pelo iniciar().
         */
        if (evento === 'INITIAL_SESSION' && this.usuario) {

            console.log('ℹ️ Sessão inicial já carregada.');

            return;
        }

        /*
         * SIGNED_IN:
         * Se o usuário já está carregado, não fazemos outra
         * consulta desnecessária.
         */
        if (evento === 'SIGNED_IN' && this.usuario) {

            console.log('ℹ️ Usuário já carregado. Nenhuma consulta adicional necessária.');

            return;
        }

        /*
         * TOKEN_REFRESHED:
         * O Supabase renovou o token. Não precisamos consultar
         * novamente usuarios/perfis.
         */
        if (evento === 'TOKEN_REFRESHED') {

            console.log('🔄 Token de sessão renovado.');

            return;
        }

        /*
         * Outros eventos de autenticação podem exigir que
         * os dados sejam carregados novamente.
         */
        await this.carregarUsuario();

    });

}


};

window.ControleSessao = ControleSessao;
