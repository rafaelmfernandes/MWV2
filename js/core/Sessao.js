const Sessao = {

async obter() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Erro ao obter sessão:', error);
        return null;
    }

    return data.session;
},

async usuarioAtual() {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
    }

    return data.user;
},

async estaLogado() {
    const sessao = await this.obter();
    return !!sessao;
},

async sair() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Erro ao sair:', error);
        return false;
    }

    console.log('✅ Usuário saiu da conta.');
    return true;
},

observar(callback) {
    return supabaseClient.auth.onAuthStateChange((evento, sessao) => {
        console.log('Estado da autenticação:', evento);
        callback(evento, sessao);
    });
}

};

window.Sessao = Sessao;


