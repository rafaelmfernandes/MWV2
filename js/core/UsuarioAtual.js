const UsuarioAtual = {


dados: null,
carregado: false,

async carregar() {
    try {
        console.log('👤 Carregando usuário atual...');

        const usuario = await Sessao.usuarioAtual();

        if (!usuario) {
            console.log('ℹ️ Nenhum usuário autenticado.');
            this.dados = null;
            this.carregado = true;
            return null;
        }

        console.log('✅ Usuário autenticado:', usuario.id);

        const resultadoUsuario = await supabaseClient
            .from('usuarios')
            .select(`
                id,
                nome,
                email,
                telefone,
                foto_url,
                ativo
            `)
            .eq('id', usuario.id)
            .single();

        if (resultadoUsuario.error) {
            console.error('❌ Erro ao carregar dados do usuário:', resultadoUsuario.error);
            this.dados = null;
            this.carregado = true;
            return null;
        }

        const dadosUsuario = resultadoUsuario.data;

        const resultadoPerfil = await supabaseClient
            .from('perfis')
            .select(`
                id,
                usuario_id,
                nome_exibicao,
                descricao,
                ativo,
                tipo_perfil_id,
                tipos_perfil (
                    id,
                    nome,
                    descricao
                )
            `)
            .eq('usuario_id', usuario.id)
            .eq('ativo', true)
            .maybeSingle();

        if (resultadoPerfil.error) {
            console.error('❌ Erro ao carregar perfil:', resultadoPerfil.error);
            this.dados = null;
            this.carregado = true;
            return null;
        }

        const perfil = resultadoPerfil.data;

        this.dados = {
            auth: usuario,

            usuario: dadosUsuario,

            perfil: perfil,

            tipoPerfil: perfil?.tipos_perfil || null
        };

        this.carregado = true;

        console.log('🎉 Usuário atual carregado:', this.dados);

        return this.dados;

    } catch (erro) {

        console.error('❌ Erro inesperado ao carregar usuário atual:', erro);

        this.dados = null;
        this.carregado = true;

        return null;
    }
},

async obter() {

    if (this.carregado) {
        return this.dados;
    }

    return await this.carregar();
},

async estaLogado() {

    const usuario = await this.obter();

    return !!usuario;
},

async perfil() {

    const usuario = await this.obter();

    return usuario?.perfil || null;
},

async tipoPerfil() {

    const usuario = await this.obter();

    return usuario?.tipoPerfil || null;
},

async sair() {

    const sucesso = await Sessao.sair();

    if (sucesso) {

        this.dados = null;
        this.carregado = false;

        localStorage.removeItem('musicalworld_usuario_id');
        localStorage.removeItem('musicalworld_usuario_email');

        console.log('👋 Dados do usuário atualizados após logout.');
    }

    return sucesso;
}


};

window.UsuarioAtual = UsuarioAtual;
