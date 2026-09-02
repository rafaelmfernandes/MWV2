/**
 * Aguarda o documento HTML carregar totalmente antes de executar qualquer script.
 */
document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================
     * 1. LÓGICA DO BANNER INFORMATIVO (Fechar ao clicar no 'X')
     * ========================================================== */
    const closeBtn = document.getElementById('closeBannerBtn');
    const banner = document.getElementById('infoBanner');

    if (closeBtn && banner) {
        closeBtn.addEventListener('click', () => {
            banner.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            banner.style.opacity = '0';
            banner.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                banner.remove();
            }, 300);
        });
    }

    /* ==========================================================
     * 2. LÓGICA DO MODAL DE ANÚNCIO (BOTTOM SHEET)
     * ========================================================== */
    const announceBtn = document.getElementById("announceBtn");
    const modalOverlay = document.getElementById("modalOverlay");

    if (announceBtn && modalOverlay) {
        announceBtn.addEventListener("click", (e) => {
            e.preventDefault();
            modalOverlay.classList.add("active");
        });

        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove("active");
            }
        });
    }

    /* ==========================================================
     * 3. LÓGICA DO MODAL DE FILTRO (BOTTOM SHEET)
     * ========================================================== */
    const filterBtn = document.querySelector(".filter-btn");
    const modalFilterOverlay = document.getElementById("modalFilterOverlay");
    const applyFilterBtn = document.getElementById("applyFilterBtn");

    if (filterBtn && modalFilterOverlay) {
        filterBtn.addEventListener("click", () => {
            modalFilterOverlay.classList.add("active");
        });

        modalFilterOverlay.addEventListener("click", (e) => {
            if (e.target === modalFilterOverlay) {
                modalFilterOverlay.classList.remove("active");
            }
        });
    }

    if (applyFilterBtn && modalFilterOverlay) {
        applyFilterBtn.addEventListener("click", () => {
            modalFilterOverlay.classList.remove("active");
        });
    }
});

/* ==========================================================
 * 4. FUNÇÃO DO TOGGLE DESLIZANTE DAS CATEGORIAS
 * ========================================================== */
function mudarCategoria(tipo, index) {
    const container = document.getElementById('categoriasTabs');
    if (!container) return;

    const botoes = container.querySelectorAll('.tab-btn');
    
    botoes.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('ativo');
        } else {
            btn.classList.remove('ativo');
        }
    });

    const slider = container.querySelector('.slider-bg-tres');
    if (slider) {
        slider.style.transform = `translateX(${index * 100}%)`;
    }
}