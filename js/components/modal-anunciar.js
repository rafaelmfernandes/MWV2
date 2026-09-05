const ModalAnunciar = {
inicializado: false,
animacaoEmAndamento: false,


iniciar() {
    if (this.inicializado) {
        return;
    }

    this.criarModal();

    const modal = document.getElementById('modal-anunciar');

    if (!modal) {
        console.warn('⚠️ Modal Anunciar não pôde ser criado.');
        return;
    }

    this.inicializado = true;

    console.log('📢 Modal Anunciar inicializado corretamente.');
},

criarModal() {
    if (document.getElementById('modal-anunciar')) {
        return;
    }

    let container = document.getElementById('modal-anunciar-container');

    if (!container) {
        container = document.createElement('div');
        container.id = 'modal-anunciar-container';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div
            id="modal-anunciar"
            class="modal-overlay modal-anunciar-overlay"
            aria-hidden="true"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-anunciar-titulo"
            onclick="fecharModalAnuncioFora(event)"
        >

            <div
                class="modal-sheet modal-anunciar-sheet"
                onclick="event.stopPropagation()"
            >

                <div class="modal-handle"></div>

                <div class="modal-header">
                    <h3 id="modal-anunciar-titulo">
                        Criar Anúncio
                    </h3>

                    <p>
                        O que você deseja anunciar na plataforma?
                    </p>
                </div>

                <div class="modal-options-list">

                    <button
                        type="button"
                        class="modal-option-item"
                        onclick="selecionarTipoAnuncio('cantor')"
                    >
                        <div class="modal-option-icon singer-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                                <path d="M19 10v1a7 7 0 0 1-14 0v-1"></path>
                                <line x1="12" y1="19" x2="12" y2="23"></line>
                                <line x1="8" y1="23" x2="16" y2="23"></line>
                            </svg>
                        </div>

                        <div class="modal-option-text">
                            <h4>Cantor / Dupla</h4>
                            <p>
                                Divulgue seu show, repertório e valores para contratantes
                            </p>
                        </div>

                        <span class="modal-arrow">›</span>
                    </button>


                    <button
                        type="button"
                        class="modal-option-item"
                        onclick="selecionarTipoAnuncio('musico')"
                    >
                        <div class="modal-option-icon musician-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>

                        <div class="modal-option-text">
                            <h4>Músico / Instrumentista</h4>
                            <p>
                                Ofereça seus serviços para bandas, gravações e diárias
                            </p>
                        </div>

                        <span class="modal-arrow">›</span>
                    </button>


                    <button
                        type="button"
                        class="modal-option-item"
                        onclick="selecionarTipoAnuncio('evento')"
                    >
                        <div class="modal-option-icon event-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                <path d="M8 14h.01"></path>
                                <path d="M12 14h.01"></path>
                                <path d="M16 14h.01"></path>
                                <path d="M8 18h.01"></path>
                                <path d="M12 18h.01"></path>
                            </svg>
                        </div>

                        <div class="modal-option-text">
                            <h4>Show / Evento</h4>
                            <p>
                                Busque talentos e músicos para o seu evento ou festa
                            </p>
                        </div>

                        <span class="modal-arrow">›</span>
                    </button>


                    <button
                        type="button"
                        class="modal-option-item"
                        onclick="selecionarTipoAnuncio('composicao')"
                    >
                        <div class="modal-option-icon song-icon">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>

                        <div class="modal-option-text">
                            <h4>Composição Inédita</h4>
                            <p>
                                Venda ou apresente suas letras e obras para gravação
                            </p>
                        </div>

                        <span class="modal-arrow">›</span>
                    </button>

                </div>

                <button
                    type="button"
                    class="modal-close-btn"
                    onclick="fecharModalAnuncio()"
                >
                    Cancelar
                </button>

            </div>
        </div>
    `;
},


/* =====================================================
   ABRIR
   ===================================================== */

abrir() {
    const modal = document.getElementById('modal-anunciar');

    if (!modal) {
        console.warn('⚠️ Modal de anúncio não encontrado.');
        return;
    }

    if (this.animacaoEmAndamento) {
        return;
    }

    this.animacaoEmAndamento = true;

    /*
     * Garantimos o estado inicial antes de mostrar
     * o modal.
     */
    modal.classList.remove('ativo');
    modal.classList.remove('fechando');

    modal.setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-anunciar-aberto');

    /*
     * Força o navegador a registrar o estado inicial.
     */
    void modal.offsetHeight;

    /*
     * Mostra o overlay primeiro.
     */
    modal.classList.add('ativo');

    /*
     * Libera novas interações depois que a animação
     * terminar.
     */
    setTimeout(() => {
        this.animacaoEmAndamento = false;
    }, 400);

    console.log('📢 Modal Anunciar aberto.');
},


/* =====================================================
   FECHAR
   ===================================================== */

fechar() {
    const modal = document.getElementById('modal-anunciar');

    if (!modal) {
        return;
    }

    if (!modal.classList.contains('ativo')) {
        return;
    }

    if (this.animacaoEmAndamento) {
        return;
    }

    this.animacaoEmAndamento = true;

    /*
     * Adiciona a classe que faz o painel deslizar
     * novamente para baixo.
     */
    modal.classList.add('fechando');

    modal.setAttribute('aria-hidden', 'true');

    /*
     * Aguarda exatamente o tempo da animação.
     */
    setTimeout(() => {

        modal.classList.remove('ativo');
        modal.classList.remove('fechando');

        document.body.classList.remove('modal-anunciar-aberto');

        this.animacaoEmAndamento = false;

        console.log('📢 Modal Anunciar fechado.');

    }, 400);
},


/* =====================================================
   FECHAR CLICANDO FORA
   ===================================================== */

fecharFora(event) {
    const modal = document.getElementById('modal-anunciar');

    if (!modal) {
        return;
    }

    if (event.target === modal) {
        this.fechar();
    }
},


/* =====================================================
   SELECIONAR TIPO
   ===================================================== */

selecionarTipo(tipo) {

    this.fechar();

    console.log('📢 Tipo de anúncio selecionado:', tipo);

    alert(
        `Redirecionando para o fluxo de cadastro de anúncio: ${tipo.toUpperCase()}`
    );
}


};

/* =========================================================
DISPONIBILIZAÇÃO GLOBAL
========================================================= */

window.ModalAnunciar = ModalAnunciar;

/* =========================================================
COMPATIBILIDADE
========================================================= */

window.abrirModalAnuncio = function () {
ModalAnunciar.abrir();
};

window.fecharModalAnuncio = function () {
ModalAnunciar.fechar();
};

window.fecharModalAnuncioFora = function (event) {
ModalAnunciar.fecharFora(event);
};

window.selecionarTipoAnuncio = function (tipo) {
ModalAnunciar.selecionarTipo(tipo);
};

/* =========================================================
INICIALIZAÇÃO
========================================================= */

if (document.readyState === 'loading') {


document.addEventListener('DOMContentLoaded', () => {
    ModalAnunciar.iniciar();
});


} else {


ModalAnunciar.iniciar();


}
