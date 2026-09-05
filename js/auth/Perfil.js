const Perfil = {


async criar({ usuarioId, tipoPerfil, nomeExibicao }) {

    if (!usuarioId) {
        return {
            sucesso: false,
            mensagem: 'ID do usuário não informado.'
        };
    }

    if (!tipoPerfil) {
        return {
            sucesso: false,
            mensagem: 'Tipo de perfil não informado.'
        };
    }

    if (!nomeExibicao || !nomeExibicao.trim()) {
        return {
            sucesso: false,
            mensagem: 'Nome de exibição não informado.'
        };
    }

    try {

        console.log('👤 Criando perfil através da função segura...');
        console.log('🆔 Usuário:', usuarioId);
        console.log('🎭 Tipo:', tipoPerfil);
        console.log('🏷️ Nome:', nomeExibicao);

        const { data, error } = await supabaseClient.rpc(
            'criar_perfil_cadastro',
            {
                p_usuario_id: usuarioId,
                p_tipo_perfil_nome: tipoPerfil,
                p_nome_exibicao: nomeExibicao.trim()
            }
        );

        if (error) {

            console.error('❌ Erro ao criar perfil:', error);

            return {
                sucesso: false,
                mensagem: 'Não foi possível criar o perfil.'
            };
        }

        console.log('✅ Perfil criado com sucesso:', data);

        return {
            sucesso: true,
            perfil: data,
            existente: false,
            mensagem: 'Perfil criado com sucesso.'
        };

    } catch (erro) {

        console.error('❌ Erro inesperado ao criar perfil:', erro);

        return {
            sucesso: false,
            mensagem: 'Ocorreu um erro ao criar o perfil.'
        };
    }
}


};

window.Perfil = Perfil;
