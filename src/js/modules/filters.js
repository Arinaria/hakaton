import { products, renderProducts } from './products.js';

export function initializeFilters() {
    setupFilterEventListeners();
    setupSearch();
}

function setupFilterEventListeners() {
    const filtersToggle = document.querySelector('.filters-toggle');
    const desktopFiltersToggle = document.querySelector('.desktop-filters-toggle');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const applyFilters = document.querySelector('.apply-filters');
    const resetFilters = document.querySelector('.reset-filters');

    if (filtersToggle) {
        filtersToggle.addEventListener('click', function () {
            filtersSidebar.classList.toggle('active');
            filtersToggle.classList.toggle('active');
        });
    }

    if (desktopFiltersToggle) {
        desktopFiltersToggle.addEventListener('click', function () {
            filtersSidebar.classList.toggle('active');
            desktopFiltersToggle.classList.toggle('active');
        });
    }

    applyFilters.addEventListener('click', function () {
        applyProductFilters();
    });

    resetFilters.addEventListener('click', function () {
        document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        applyProductFilters();
    });

    document.addEventListener('click', function(event) {
        if (event.target === filtersSidebar) {
            filtersSidebar.classList.remove('active');
            if (desktopFiltersToggle) {
                desktopFiltersToggle.classList.remove('active');
            }
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const desktopSearchInput = document.getElementById('desktop-search-input');

    function setupSearchHandler(inputElement) {
        inputElement.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase().trim();
            const productCards = document.querySelectorAll('.product-card');
            let hasVisibleProducts = false;

            productCards.forEach(card => {
                const productName = card.querySelector('.product-name').textContent.toLowerCase();
                const productCode = card.querySelector('.product-code').textContent.toLowerCase();

                if (productName.includes(searchTerm) || productCode.includes(searchTerm)) {
                    card.style.display = 'block';
                    hasVisibleProducts = true;
                } else {
                    card.style.display = 'none';
                }
            });

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
        });
    }

    if (searchInput) setupSearchHandler(searchInput);
    if (desktopSearchInput) setupSearchHandler(desktopSearchInput);
}

function applyProductFilters() {
    const selectedWarehouses = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="warehouse"]:checked')).map(cb => cb.value);
    const selectedTypes = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="type"]:checked')).map(cb => cb.value);
    const selectedDiameters = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="diameter"]:checked')).map(cb => cb.value);
    const selectedThicknesses = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="thickness"]:checked')).map(cb => cb.value);
    const selectedGosts = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="gost"]:checked')).map(cb => cb.value);
    const selectedSteels = Array.from(document.querySelectorAll('.filter-checkbox[data-filter="steel"]:checked')).map(cb => cb.value);

    const productCards = document.querySelectorAll('.product-card');
    const productsGrid = document.querySelector('.products-grid');
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
