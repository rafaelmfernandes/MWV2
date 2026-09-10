"use strict";

/*

PERFIL ABAS
Controla o menu de abas dos perfis.
===================================

*/

window.PerfilAbas = (() => {


let estado = null;


function configurar(contexto) {

    estado = contexto;

}


function trocarAba(nome) {

    if (!estado) {
        return;
    }


    const abas =
        document.querySelectorAll(
            ".editor-tab"
        );


    const paineis =
        document.querySelectorAll(
            ".editor-panel"
        );


    abas.forEach(aba => {

        aba.classList.toggle(
            "ativo",
            aba.dataset.editorTab === nome
        );

    });


    paineis.forEach(painel => {

        painel.classList.toggle(
            "ativo",
            painel.dataset.editorPanel === nome
        );

    });


    estado.abaAtual =
        nome;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    PerfilUtils.atualizarIcones();

}


function inicializar() {

    document
        .querySelectorAll(".editor-tab")
        .forEach(aba => {

            aba.addEventListener(
                "click",
                () => {

                    trocarAba(
                        aba.dataset.editorTab
                    );

                }
            );

        });

}


return {

    configurar,
    trocarAba,
    inicializar

};


})();
