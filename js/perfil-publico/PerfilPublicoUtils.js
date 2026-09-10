/* =========================================================
   MUSICALWORLD — PERFIL PÚBLICO
   Arquivo: PerfilPublicoUtils.js

   Responsabilidade:
   - Funções auxiliares compartilhadas pelos módulos
     do sistema de perfil público.
   - Normalização de dados.
   - Formatação de datas e valores.
   - Tratamento de HTML.
   - Iniciais.
   - Ícones.
   - Toasts.
   - Utilidades gerais.

   IMPORTANTE:
   Este arquivo NÃO contém regras específicas de Cantor,
   Músico ou qualquer outro tipo de perfil.
   ========================================================= */

(function (window) {

    "use strict";


    /* =====================================================
       OBJETO PRINCIPAL
       ===================================================== */

    const PerfilPublicoUtils = {


        /* =================================================
           NORMALIZAÇÃO DE TEXTO
           ================================================= */

        normalizarTexto(valor) {

            if (valor === null || valor === undefined) {
                return "";
            }

            return String(valor)
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

        },


        /* =================================================
           NORMALIZAÇÃO DE ARRAY
           ================================================= */

        normalizarArray(valor) {

            if (Array.isArray(valor)) {
                return valor.filter(item => {

                    return (
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== ""
                    );

                });
            }


            if (valor === null || valor === undefined) {
                return [];
            }


            if (typeof valor === "string") {

                const texto = valor.trim();

                if (!texto) {
                    return [];
                }


                /*
                 * Tenta interpretar JSON quando o banco
                 * retornar uma string contendo um array.
                 */

                if (
                    texto.startsWith("[") &&
                    texto.endsWith("]")
                ) {

                    try {

                        const resultado = JSON.parse(texto);

                        if (Array.isArray(resultado)) {
                            return resultado;
                        }

                    } catch (erro) {

                        console.warn(
                            "Não foi possível interpretar array JSON:",
                            erro
                        );

                    }

                }


                /*
                 * Caso seja uma lista simples separada
                 * por vírgulas.
                 */

                return texto
                    .split(",")
                    .map(item => item.trim())
                    .filter(Boolean);

            }


            return [valor];

        },


        /* =================================================
           OBTER PRIMEIRO VALOR VÁLIDO
           ================================================= */

        obterPrimeiroValor(...valores) {

            for (const valor of valores) {

                if (
                    valor !== null &&
                    valor !== undefined &&
                    String(valor).trim() !== ""
                ) {

                    return valor;

                }

            }

            return "";

        },


        /* =================================================
           OBTER VALOR MONETÁRIO
           ================================================= */

        obterValorMonetario(objeto, campos = []) {

            if (!objeto || typeof objeto !== "object") {
                return 0;
            }


            if (!Array.isArray(campos)) {
                campos = [campos];
            }


            for (const campo of campos) {

                if (
                    objeto[campo] !== null &&
                    objeto[campo] !== undefined &&
                    objeto[campo] !== ""
                ) {

                    const valor = this.converterParaNumero(
                        objeto[campo]
                    );

                    if (!Number.isNaN(valor)) {
                        return valor;
                    }

                }

            }


            return 0;

        },


        /* =================================================
           CONVERTER PARA NÚMERO
           ================================================= */

        converterParaNumero(valor) {

            if (
                valor === null ||
                valor === undefined ||
                valor === ""
            ) {

                return 0;

            }


            if (typeof valor === "number") {
                return Number.isFinite(valor) ? valor : 0;
            }


            let texto = String(valor)
                .trim()
                .replace(/[R$\s]/g, "");


            /*
             * Trata formatos brasileiros:
             *
             * 1.234,56
             * 1234,56
             */

            if (
                texto.includes(".") &&
                texto.includes(",")
            ) {

                texto = texto
                    .replace(/\./g, "")
                    .replace(",", ".");

            } else if (texto.includes(",")) {

                texto = texto.replace(",", ".");

            }


            const numero = Number(texto);

            return Number.isFinite(numero)
                ? numero
                : 0;

        },


        /* =================================================
           FORMATAR MOEDA
           ================================================= */

        formatarMoeda(valor) {

            const numero = this.converterParaNumero(valor);


            return numero.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        },


        /* =================================================
           FORMATAR NÚMERO
           ================================================= */

        formatarNumero(valor, casas = 1) {

            const numero = this.converterParaNumero(valor);


            return numero.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: casas,
                    maximumFractionDigits: casas
                }
            );

        },


        /* =================================================
           FORMATAR DATA
           ================================================= */

        formatarData(data, incluirHora = false) {

            if (!data) {
                return "Data não informada";
            }


            const dataConvertida = this.converterData(data);


            if (!dataConvertida) {
                return "Data não informada";
            }


            const opcoes = {

                day: "2-digit",
                month: "2-digit",
                year: "numeric"

            };


            if (incluirHora) {

                opcoes.hour = "2-digit";
                opcoes.minute = "2-digit";

            }


            return new Intl.DateTimeFormat(
                "pt-BR",
                opcoes
            ).format(dataConvertida);

        },


        /* =================================================
           FORMATAR DATA POR EXTENSO
           ================================================= */

        formatarDataExtenso(data) {

            if (!data) {
                return "Data não informada";
            }


            const dataConvertida = this.converterData(data);


            if (!dataConvertida) {
                return "Data não informada";
            }


            return new Intl.DateTimeFormat(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            ).format(dataConvertida);

        },


        /* =================================================
           CONVERTER DATA
           ================================================= */

        converterData(data) {

            if (data instanceof Date) {

                if (!Number.isNaN(data.getTime())) {
                    return data;
                }

                return null;

            }


            if (typeof data === "number") {

                const dataNumerica = new Date(data);

                return Number.isNaN(dataNumerica.getTime())
                    ? null
                    : dataNumerica;

            }


            if (typeof data !== "string") {
                return null;
            }


            let valor = data.trim();


            if (!valor) {
                return null;
            }


            /*
             * Trata datas no formato:
             *
             * DD/MM/YYYY
             */

            const formatoBrasileiro =
                valor.match(
                    /^(\d{2})\/(\d{2})\/(\d{4})$/
                );


            if (formatoBrasileiro) {

                const dia = Number(formatoBrasileiro[1]);
                const mes = Number(formatoBrasileiro[2]) - 1;
                const ano = Number(formatoBrasileiro[3]);

                const dataBrasileira =
                    new Date(
                        ano,
                        mes,
                        dia
                    );


                return Number.isNaN(
                    dataBrasileira.getTime()
                )
                    ? null
                    : dataBrasileira;

            }


            /*
             * Datas ISO vindas do Supabase.
             */

            const dataISO = new Date(valor);


            if (!Number.isNaN(dataISO.getTime())) {
                return dataISO;
            }


            return null;

        },


        /* =================================================
           FORMATAR DATA ISO
           ================================================= */

        formatarDataISO(data) {

            const dataConvertida = this.converterData(data);


            if (!dataConvertida) {
                return "";
            }


            const ano = dataConvertida.getFullYear();

            const mes = String(
                dataConvertida.getMonth() + 1
            ).padStart(2, "0");


            const dia = String(
                dataConvertida.getDate()
            ).padStart(2, "0");


            return `${ano}-${mes}-${dia}`;

        },


        /* =================================================
           VERIFICAR SE É HOJE
           ================================================= */

        ehHoje(data) {

            const dataConvertida = this.converterData(data);


            if (!dataConvertida) {
                return false;
            }


            const hoje = new Date();


            return (
                dataConvertida.getDate() === hoje.getDate() &&
                dataConvertida.getMonth() === hoje.getMonth() &&
                dataConvertida.getFullYear() === hoje.getFullYear()
            );

        },


        /* =================================================
           OBTER INICIAIS
           ================================================= */

        obterIniciais(nome) {

            if (!nome) {
                return "?";
            }


            const texto = String(nome)
                .trim()
                .replace(/\s+/g, " ");


            if (!texto) {
                return "?";
            }


            const partes = texto.split(" ");


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


        /* =================================================
           ESCAPAR HTML
           ================================================= */

        escaparHtml(valor) {

            if (
                valor === null ||
                valor === undefined
            ) {

                return "";

            }


            return String(valor)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        },


        /* =================================================
           DEFINIR TEXTO DE ELEMENTO
           ================================================= */

        definirTexto(id, texto, fallback = "Não informado") {

            const elemento =
                document.getElementById(id);


            if (!elemento) {

                console.warn(
                    `Elemento #${id} não encontrado.`
                );

                return;

            }


            if (
                texto === null ||
                texto === undefined ||
                String(texto).trim() === ""
            ) {

                elemento.textContent = fallback;

                return;

            }


            elemento.textContent = String(texto);

        },


        /* =================================================
           OBTER ELEMENTO
           ================================================= */

        obterElemento(id) {

            if (!id) {
                return null;
            }


            return document.getElementById(id);

        },


        /* =================================================
           MOSTRAR / ESCONDER ELEMENTO
           ================================================= */

        mostrarElemento(elemento, mostrar = true) {

            if (!elemento) {
                return;
            }


            elemento.hidden = !mostrar;


            if (mostrar) {

                elemento.removeAttribute("aria-hidden");

            } else {

                elemento.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        },


        /* =================================================
           ATUALIZAR ÍCONES LUCIDE
           ================================================= */

        renderizarIcones() {

            if (
                window.lucide &&
                typeof window.lucide.createIcons === "function"
            ) {

                window.lucide.createIcons();

            }

        },


        /* =================================================
           MOSTRAR TOAST
           ================================================= */

        mostrarToast(
            mensagem,
            tipo = "sucesso",
            duracao = 3000
        ) {

            const toast =
                document.getElementById("toast");

            const toastMessage =
                document.getElementById("toastMessage");


            if (!toast || !toastMessage) {

                console.warn(
                    "Elementos do toast não encontrados."
                );

                return;

            }


            toastMessage.textContent =
                mensagem || "Operação realizada.";


            /*
             * Remove classes anteriores.
             */

            toast.classList.remove(
                "sucesso",
                "erro",
                "aviso",
                "info",
                "show",
                "visible"
            );


            /*
             * Adiciona o tipo atual.
             */

            if (tipo) {
                toast.classList.add(tipo);
            }


            /*
             * Força uma nova renderização antes
             * de adicionar a classe de exibição.
             */

            void toast.offsetWidth;


            toast.classList.add("show");


            /*
             * Guarda o timer no próprio elemento para
             * evitar múltiplos timers simultâneos.
             */

            if (toast._timeoutToast) {

                clearTimeout(
                    toast._timeoutToast
                );

            }


            toast._timeoutToast =
                setTimeout(() => {

                    toast.classList.remove("show");

                }, duracao);

        },


        /* =================================================
           COPIAR TEXTO
           ================================================= */

        async copiarTexto(texto) {

            if (
                texto === null ||
                texto === undefined
            ) {

                return false;

            }


            const valor =
                String(texto);


            if (!valor) {
                return false;
            }


            try {

                if (
                    navigator.clipboard &&
                    typeof navigator.clipboard.writeText === "function"
                ) {

                    await navigator.clipboard.writeText(
                        valor
                    );

                    return true;

                }

            } catch (erro) {

                console.warn(
                    "Clipboard API indisponível:",
                    erro
                );

            }


            /*
             * Fallback para navegadores mais antigos.
             */

            try {

                const textarea =
                    document.createElement("textarea");


                textarea.value = valor;

                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                textarea.style.pointerEvents = "none";


                document.body.appendChild(
                    textarea
                );


                textarea.focus();
                textarea.select();


                const resultado =
                    document.execCommand("copy");


                textarea.remove();


                return resultado;

            } catch (erro) {

                console.error(
                    "Erro ao copiar texto:",
                    erro
                );

                return false;

            }

        },


        /* =================================================
           ABRIR URL
           ================================================= */

        abrirUrl(url, novaAba = true) {

            if (!url) {
                return;
            }


            try {

                if (novaAba) {

                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );

                } else {

                    window.location.href = url;

                }

            } catch (erro) {

                console.error(
                    "Erro ao abrir URL:",
                    erro
                );

            }

        },


        /* =================================================
           NORMALIZAR NOTA / AVALIAÇÃO
           ================================================= */

        normalizarNota(valor) {

            const numero =
                this.converterParaNumero(valor);


            if (numero <= 0) {
                return 0;
            }


            if (numero > 5) {
                return 5;
            }


            return numero;

        },


        /* =================================================
           OBTER TEXTO DE DISPONIBILIDADE
           ================================================= */

        obterTextoDisponibilidade(disponivel) {

            if (
                disponivel === true ||
                disponivel === "true" ||
                disponivel === 1 ||
                disponivel === "1"
            ) {

                return "Disponível";

            }


            if (
                disponivel === false ||
                disponivel === "false" ||
                disponivel === 0 ||
                disponivel === "0"
            ) {

                return "Indisponível";

            }


            return "Não informado";

        },


        /* =================================================
           VERIFICAR BOOLEANO
           ================================================= */

        converterParaBooleano(valor) {

            if (typeof valor === "boolean") {
                return valor;
            }


            if (
                valor === 1 ||
                valor === "1" ||
                valor === "true" ||
                valor === "TRUE" ||
                valor === "sim" ||
                valor === "SIM"
            ) {

                return true;

            }


            if (
                valor === 0 ||
                valor === "0" ||
                valor === "false" ||
                valor === "FALSE" ||
                valor === "nao" ||
                valor === "não" ||
                valor === "NAO" ||
                valor === "NÃO"
            ) {

                return false;

            }


            return Boolean(valor);

        },


        /* =================================================
           GERAR ID ÚNICO LOCAL
           ================================================= */

        gerarIdTemporario(prefixo = "item") {

            return (
                prefixo +
                "-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 9)
            );

        },


        /* =================================================
           ESPERAR
           ================================================= */

        esperar(milisegundos = 0) {

            return new Promise(resolve => {

                setTimeout(
                    resolve,
                    milisegundos
                );

            });

        },


        /* =================================================
           LOG CONTROLADO
           ================================================= */

        log(...argumentos) {

            if (
                window.MusicalWorldDebug === true
            ) {

                console.log(
                    "[PerfilPublico]",
                    ...argumentos
                );

            }

        },


        /* =================================================
           AVISO CONTROLADO
           ================================================= */

        aviso(...argumentos) {

            console.warn(
                "[PerfilPublico]",
                ...argumentos
            );

        },


        /* =================================================
           ERRO CONTROLADO
           ================================================= */

        erro(...argumentos) {

            console.error(
                "[PerfilPublico]",
                ...argumentos
            );

        }

    };


    /* =====================================================
       DISPONIBILIZAR GLOBALMENTE
       ===================================================== */

    window.PerfilPublicoUtils =
        PerfilPublicoUtils;


    /* =====================================================
       CONFIRMAÇÃO DE CARREGAMENTO
       ===================================================== */

    console.log(
        "PerfilPublicoUtils.js carregado."
    );


})(window);