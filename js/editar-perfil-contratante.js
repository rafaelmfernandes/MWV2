const EditarPerfilContratante = {


usuarioId: null,

perfilId: null,

fotoUrlAtual: null,

fotoUrlTemporaria: null,

inicializado: false,


async iniciar() {

    if (this.inicializado) {
        return;
    }

    this.inicializado = true;

    console.log(
        '✏️ Inicializando edição do perfil de contratante...'
    );


    try {

        const usuario =
            await ControleSessao.iniciar({
                exigirLogin: true,
                redirecionarPara: 'login.html'
            });


        if (!usuario) {
            return;
        }


        await this.carregarPerfil();

        this.configurarEventos();

    } catch (erro) {

        console.error(
            '❌ Erro ao iniciar edição:',
            erro
        );

        this.mostrarMensagem(
            'Não foi possível carregar seu perfil.',
            'erro'
        );

    }

},


async carregarPerfil() {

    const {

        data: {
            user
        },

        error: erroAuth

    } = await supabaseClient.auth.getUser();


    if (erroAuth || !user) {

        throw new Error(
            'Usuário autenticado não encontrado.'
        );

    }


    this.usuarioId = user.id;


    /*
     * Busca os dados básicos do usuário.
     */

    const {
        data: dadosUsuario,
        error: erroUsuario
    } = await supabaseClient

        .from('usuarios')

        .select(`
            id,
            nome,
            email,
            telefone,
            foto_url,
            ativo,
            created_at
        `)

        .eq('id', user.id)

        .maybeSingle();


    if (erroUsuario) {
        throw erroUsuario;
    }


    /*
     * Busca especificamente o perfil
     * do tipo contratante.
     */

    const {
        data: perfil,
        error: erroPerfil
    } = await supabaseClient

        .from('perfis')

        .select(`
            id,
            usuario_id,
            nome_exibicao,
            descricao,
            ativo,
            created_at,
            updated_at,
            tipos_perfil (
                id,
                nome,
                descricao
            )
        `)

        .eq('usuario_id', user.id)

        .eq('ativo', true)

        .eq(
            'tipos_perfil.nome',
            'contratante'
        )

        .maybeSingle();


    if (erroPerfil) {
        throw erroPerfil;
    }


    if (!dadosUsuario) {

        throw new Error(
            'Dados do usuário não encontrados.'
        );

    }


    if (!perfil) {

        throw new Error(
            'Perfil de contratante não encontrado.'
        );

    }


    const tipoPerfil =
        perfil?.tipos_perfil?.nome;


    if (tipoPerfil !== 'contratante') {

        throw new Error(
            'Esta página é exclusiva para contratantes.'
        );

    }


    this.perfilId = perfil.id;

    this.fotoUrlAtual =
        dadosUsuario.foto_url || null;


    this.preencherFormulario(
        dadosUsuario,
        perfil
    );

},


preencherFormulario(
    usuario,
    perfil
) {

    const nome =
        usuario.nome ||
        perfil.nome_exibicao ||
        '';


    const nomeCampo =
        document.getElementById('nome');


    const telefoneCampo =
        document.getElementById('telefone');


    const cidadeCampo =
        document.getElementById('cidade');


    const descricaoCampo =
        document.getElementById('descricao');


    const emailCampo =
        document.getElementById('email');


    const ativoCampo =
        document.getElementById('perfilAtivo');


    if (nomeCampo) {
        nomeCampo.value = nome;
    }


    if (telefoneCampo) {
        telefoneCampo.value =
            usuario.telefone || '';
    }


    /*
     * A cidade ainda não possui uma coluna
     * própria na tabela usuarios/perfis.
     *
     * Por isso deixamos vazia até criarmos
     * a estrutura específica de endereço.
     */

    if (cidadeCampo) {
        cidadeCampo.value = '';
    }


    if (descricaoCampo) {

        descricaoCampo.value =
            perfil.descricao || '';

        this.atualizarContadorDescricao();

    }


    if (emailCampo) {

        emailCampo.value =
            usuario.email ||
            '';

    }


    if (ativoCampo) {

        ativoCampo.checked =
            perfil.ativo !== false;

    }


    this.atualizarAvatar(
        nome,
        usuario.foto_url
    );

},


configurarEventos() {

    const btnVoltar =
        document.getElementById('btnVoltar');


    const btnCancelar =
        document.getElementById('btnCancelar');


    const btnSalvar =
        document.getElementById('btnSalvar');


    const btnSalvarTopo =
        document.getElementById('btnSalvarTopo');


    const btnAlterarFoto =
        document.getElementById('btnAlterarFoto');


    const btnRemoverFoto =
        document.getElementById('btnRemoverFoto');


    const inputFoto =
        document.getElementById('inputFoto');


    const descricao =
        document.getElementById('descricao');


    if (btnVoltar) {

        btnVoltar.addEventListener(
            'click',
            () => this.voltar()
        );

    }


    if (btnCancelar) {

        btnCancelar.addEventListener(
            'click',
            () => this.voltar()
        );

    }


    if (btnSalvar) {

        btnSalvar.addEventListener(
            'click',
            () => this.salvar()
        );

    }


    if (btnSalvarTopo) {

        btnSalvarTopo.addEventListener(
            'click',
            () => this.salvar()
        );

    }


    if (btnAlterarFoto && inputFoto) {

        btnAlterarFoto.addEventListener(
            'click',
            () => inputFoto.click()
        );

    }


    if (btnRemoverFoto) {

        btnRemoverFoto.addEventListener(
            'click',
            () => this.removerFoto()
        );

    }


    if (inputFoto) {

        inputFoto.addEventListener(
            'change',
            evento =>
                this.selecionarFoto(
                    evento
                )
        );

    }


    if (descricao) {

        descricao.addEventListener(
            'input',
            () =>
                this.atualizarContadorDescricao()
        );

    }

},


atualizarContadorDescricao() {

    const campo =
        document.getElementById('descricao');


    const contador =
        document.getElementById(
            'contadorDescricao'
        );


    if (!campo || !contador) {
        return;
    }


    contador.textContent =
        campo.value.length;

},


selecionarFoto(evento) {

    const arquivo =
        evento.target.files?.[0];


    if (!arquivo) {
        return;
    }


    if (!arquivo.type.startsWith('image/')) {

        this.mostrarMensagem(
            'Selecione uma imagem válida.',
            'erro'
        );

        return;

    }


    if (arquivo.size > 5 * 1024 * 1024) {

        this.mostrarMensagem(
            'A imagem deve ter no máximo 5 MB.',
            'erro'
        );

        return;

    }


    const leitor =
        new FileReader();


    leitor.onload = eventoLeitura => {

        this.fotoUrlTemporaria =
            eventoLeitura.target.result;

        this.atualizarAvatar(
            document.getElementById(
                'nome'
            )?.value || 'Usuário',
            this.fotoUrlTemporaria
        );

    };


    leitor.readAsDataURL(arquivo);

},


removerFoto() {

    this.fotoUrlTemporaria = '';

    this.atualizarAvatar(
        document.getElementById(
            'nome'
        )?.value || 'Usuário',
        null
    );

},


atualizarAvatar(
    nome,
    fotoUrl
) {

    const avatar =
        document.getElementById(
            'avatarEditar'
        );


    const letras =
        document.getElementById(
            'avatarLetras'
        );


    if (!avatar) {
        return;
    }


    if (fotoUrl) {

        avatar.style.backgroundImage =
            `url("${fotoUrl}")`;


        if (letras) {
            letras.style.display = 'none';
        }

    } else {

        avatar.style.backgroundImage =
            'linear-gradient(135deg, #2563eb, #60a5fa)';


        if (letras) {

            letras.textContent =
                this.obterIniciais(nome);

            letras.style.display =
                'flex';

        }

    }

},


async salvar() {

    if (!this.usuarioId || !this.perfilId) {

        this.mostrarMensagem(
            'Perfil ainda não carregado.',
            'erro'
        );

        return;

    }


    const btnSalvar =
        document.getElementById(
            'btnSalvar'
        );


    const nome =
        document.getElementById(
            'nome'
        )?.value.trim();


    const telefone =
        document.getElementById(
            'telefone'
        )?.value.trim();


    const descricao =
        document.getElementById(
            'descricao'
        )?.value.trim();


    const ativo =
        document.getElementById(
            'perfilAtivo'
        )?.checked;


    if (!nome) {

        this.mostrarMensagem(
            'Informe seu nome.',
            'erro'
        );

        return;

    }


    if (nome.length < 2) {

        this.mostrarMensagem(
            'O nome precisa ter pelo menos 2 caracteres.',
            'erro'
        );

        return;

    }


    if (btnSalvar) {

        btnSalvar.disabled = true;

        btnSalvar.textContent =
            'Salvando...';

    }


    try {

        /*
         * Atualiza os dados gerais
         * do usuário.
         */

        const {
            error: erroUsuario
        } = await supabaseClient

            .from('usuarios')

            .update({

                nome: nome,

                telefone:
                    telefone || null,

                foto_url:
                    this.fotoUrlTemporaria !== null
                        ? this.fotoUrlTemporaria || null
                        : this.fotoUrlAtual

            })

            .eq(
                'id',
                this.usuarioId
            );


        if (erroUsuario) {
            throw erroUsuario;
        }


        /*
         * Atualiza os dados específicos
         * do perfil de contratante.
         */

        const {
            error: erroPerfil
        } = await supabaseClient

            .from('perfis')

            .update({

                nome_exibicao:
                    nome,

                descricao:
                    descricao || null,

                ativo:
                    ativo !== false,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                'id',
                this.perfilId
            )

            .eq(
                'usuario_id',
                this.usuarioId
            );


        if (erroPerfil) {
            throw erroPerfil;
        }


        this.fotoUrlAtual =
            this.fotoUrlTemporaria !== null
                ? this.fotoUrlTemporaria || null
                : this.fotoUrlAtual;


        this.fotoUrlTemporaria = null;


        this.mostrarMensagem(
            'Perfil atualizado com sucesso!',
            'sucesso'
        );


        this.mostrarToast(
            'Perfil salvo com sucesso.'
        );


        setTimeout(
            () => {

                window.location.href =
                    'meu-perfil-contratante.html';

            },
            1000
        );


    } catch (erro) {

        console.error(
            '❌ Erro ao salvar perfil:',
            erro
        );


        this.mostrarMensagem(
            'Não foi possível salvar as alterações.',
            'erro'
        );


    } finally {

        if (btnSalvar) {

            btnSalvar.disabled = false;

            btnSalvar.textContent =
                'Salvar alterações';

        }

    }

},


voltar() {

    window.location.href =
        'meu-perfil-contratante.html';

},


obterIniciais(nome) {

    const partes =
        String(nome || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!partes.length) {
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


mostrarMensagem(
    mensagem,
    tipo
) {

    const elemento =
        document.getElementById(
            'mensagemFormulario'
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensagem;


    elemento.className =
        `mensagem-formulario ${tipo}`;

},


mostrarToast(mensagem) {

    const toast =
        document.getElementById(
            'toast'
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        mensagem;


    toast.classList.add(
        'visivel'
    );


    setTimeout(
        () => {

            toast.classList.remove(
                'visivel'
            );

        },
        2500
    );

}


};

window.EditarPerfilContratante =
EditarPerfilContratante;

document.addEventListener(
'DOMContentLoaded',
() => {


    EditarPerfilContratante.iniciar();

}


);
