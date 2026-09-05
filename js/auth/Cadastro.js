const Cadastro = {

async criar({ nome, email, senha }) {

    nome = nome.trim();
    email = email.trim().toLowerCase();

    if (!nome) {
        return {
            sucesso: false,
            mensagem: 'Informe seu nome.'
        };
    }

    if (!email) {
        return {
            sucesso: false,
            mensagem: 'Informe seu e-mail.'
        };
    }

    if (!senha || senha.length < 6) {
        return {
            sucesso: false,
            mensagem: 'A senha deve ter pelo menos 6 caracteres.'
        };
    }

    console.log('🔐 Iniciando cadastro:', email);

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: senha,
        options: {
            data: {
                nome: nome
            }
        }
    });

    if (error) {
        console.error('❌ Erro no cadastro:', error);

        return {
            sucesso: false,
            mensagem: this.traduzirErro(error)
        };
    }

    console.log('✅ Cadastro realizado:', data);

    return {
        sucesso: true,
        usuario: data.user,
        sessao: data.session,
        mensagem: data.session
            ? 'Conta criada e usuário autenticado.'
            : 'Conta criada! Verifique seu e-mail para confirmar o cadastro.'
    };
},

traduzirErro(error) {

    const mensagem = (error.message || '').toLowerCase();

    if (mensagem.includes('already registered')) {
        return 'Este e-mail já está cadastrado.';
    }

    if (mensagem.includes('invalid email')) {
        return 'Digite um e-mail válido.';
    }

    if (mensagem.includes('password')) {
        return 'A senha não atende aos requisitos necessários.';
    }

    if (mensagem.includes('rate limit')) {
        return 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.';
    }

    return error.message || 'Não foi possível realizar o cadastro.';
}

};

window.Cadastro = Cadastro;