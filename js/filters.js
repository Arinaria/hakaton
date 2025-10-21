class FilterManager {
    constructor(productManager) {
        this.productManager = productManager;
    }

    initializeFilters() {
        this.setupSearch();
        this.setupFilterButtons();
        this.setupFilterCheckboxes();
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const desktopSearchInput = document.getElementById('desktop-search-input');

        [searchInput, desktopSearchInput].forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        });
    }

    handleSearch(searchTerm) {
        const searchTermLower = searchTerm.toLowerCase().trim();
        const productCards = document.querySelectorAll('.product-card');
        let hasVisibleProducts = false;

        productCards.forEach(card => {
            const productName = card.querySelector('.product-name').textContent.toLowerCase();
            const productCode = card.querySelector('.product-code').textContent.toLowerCase();

            if (productName.includes(searchTermLower) || productCode.includes(searchTermLower)) {
                card.style.display = 'block';
                hasVisibleProducts = true;
            } else {
                card.style.display = 'none';
            }
        });

        this.updateNoProductsMessage(hasVisibleProducts);
    }

    setupFilterButtons() {
        const applyFilters = document.querySelector('.apply-filters');
        const resetFilters = document.querySelector('.reset-filters');

        applyFilters.addEventListener('click', () => {
            this.applyProductFilters();
        });

        resetFilters.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    setupFilterCheckboxes() {
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Optional: auto-apply filters on change
                // this.applyProductFilters();
            });
        });
    }

    resetFilters() {
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        this.applyProductFilters();
    }

    applyProductFilters() {
        const selectedWarehouses = this.getSelectedValues('warehouse');
        const selectedTypes = this.getSelectedValues('type');
        const selectedDiameters = this.getSelectedValues('diameter');
        const selectedThicknesses = this.getSelectedValues('thickness');
        const selectedGosts = this.getSelectedValues('gost');
        const selectedSteels = this.getSelectedValues('steel');

        const productCards = document.querySelectorAll('.product-card');
        let hasVisibleProducts = false;

        productCards.forEach(card => {
            const warehouse = card.getAttribute('data-warehouse');
            const type = card.getAttribute('data-type');
            const diameter = parseInt(card.getAttribute('data-diameter'));
            const thickness = parseInt(card.getAttribute('data-thickness'));
            const gost = card.getAttribute('data-gost');
            const steel = card.getAttribute('data-steel');

            let show = true;

            if (selectedWarehouses.length > 0 && !selectedWarehouses.includes(warehouse)) {
                show = false;
            }

            if (selectedTypes.length > 0 && !selectedTypes.includes(type)) {
                show = false;
            }

            if (selectedDiameters.length > 0) {
                let diameterMatch = false;
                selectedDiameters.forEach(d => {
                    const diameterValue = parseInt(d);
                    if (diameterValue === 50 && diameter <= 50) diameterMatch = true;
                    if (diameterValue === 100 && diameter > 50 && diameter <= 100) diameterMatch = true;
                    if (diameterValue === 200 && diameter > 100 && diameter <= 200) diameterMatch = true;
                    if (diameterValue === 300 && diameter > 200 && diameter <= 300) diameterMatch = true;
                    if (diameterValue === 400 && diameter > 300) diameterMatch = true;
                });
                if (!diameterMatch) show = false;
            }

            if (selectedThicknesses.length > 0) {
                let thicknessMatch = false;
                selectedThicknesses.forEach(t => {
                    const thicknessValue = parseInt(t);
                    if (thicknessValue === 3 && thickness <= 3) thicknessMatch = true;
                    if (thicknessValue === 5 && thickness > 3 && thickness <= 5) thicknessMatch = true;
                    if (thicknessValue === 8 && thickness > 5 && thickness <= 8) thicknessMatch = true;
                    if (thicknessValue === 12 && thickness > 8 && thickness <= 12) thicknessMatch = true;
                    if (thicknessValue === 20 && thickness > 12) thicknessMatch = true;
                });
                if (!thicknessMatch) show = false;
            }

            if (selectedGosts.length > 0 && !selectedGosts.includes(gost)) {
                show = false;
            }

            if (selectedSteels.length > 0 && !selectedSteels.includes(steel)) {
                show = false;
            }

            card.style.display = show ? 'block' : 'none';
            if (show) hasVisibleProducts = true;
        });

        this.updateNoProductsMessage(hasVisibleProducts);
    }

    getSelectedValues(filterType) {
        return Array.from(document.querySelectorAll(`.filter-checkbox[data-filter="${filterType}"]:checked`))
            .map(cb => cb.value);
    }

    updateNoProductsMessage(hasVisibleProducts) {
        const productsGrid = document.querySelector('.products-grid');
        let noProductsMessage = productsGrid.querySelector('.no-products');

        if (!hasVisibleProducts) {
            if (!noProductsMessage) {
                noProductsMessage = document.createElement('div');
                noProductsMessage.className = 'no-products';
                noProductsMessage.textContent = 'Товары не найдены';
                productsGrid.appendChild(noProductsMessage);
            }
        } else if (noProductsMessage) {
            noProductsMessage.remove();
        }
    }
}
