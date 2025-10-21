class TMKApp {
    constructor() {
        this.productManager = new ProductManager();
        this.cartManager = new CartManager(this.productManager);
        this.filterManager = new FilterManager(this.productManager);
        this.telegramIntegration = new TelegramIntegration();
        
        this.currentProduct = null;
        this.currentModalChanges = {};
    }

    async initialize() {
        await this.productManager.loadProducts();
        this.filterManager.initializeFilters();
        this.telegramIntegration.initialize();
        this.setupEventListeners();
        this.cartManager.updateCartDisplay();
    }

    setupEventListeners() {
        // Cart button
        document.querySelector('.cart-button').addEventListener('click', () => {
            document.querySelector('.cart-modal').style.display = 'block';
        });

        // Filter toggles
        document.querySelector('.filters-toggle').addEventListener('click', () => {
            this.toggleFilters();
        });

        document.querySelector('.desktop-filters-toggle').addEventListener('click', () => {
            this.toggleFilters();
        });

        // Modal controls
        document.querySelector('.quantity-plus-modal').addEventListener('click', () => {
            this.handleModalQuantityChange(1);
        });

        document.querySelector('.quantity-minus-modal').addEventListener('click', () => {
            this.handleModalQuantityChange(-1);
        });

        document.querySelector('.quantity-value-modal').addEventListener('input', (e) => {
            this.handleModalQuantityInput(e.target.value);
        });

        document.querySelector('.quantity-value-modal').addEventListener('blur', (e) => {
            this.handleModalQuantityBlur(e.target);
        });

        // Unit buttons in modal
        document.querySelectorAll('.unit-button-modal').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleModalUnitChange(e.target);
            });
        });

        // Radio buttons in product modal
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleModalOptionChange(e.target);
            });
        });

        // Add to cart modal button
        document.querySelector('.add-to-cart-modal').addEventListener('click', () => {
            this.addToCartFromModal();
        });

        // Select all checkbox
        document.querySelector('.select-all-checkbox').addEventListener('change', (e) => {
            this.handleSelectAllChange(e.target.checked);
        });

        // Checkout button
        document.querySelector('.checkout').addEventListener('click', () => {
            this.handleCheckout();
        });

        // Back buttons
        document.querySelectorAll('.back-button').forEach(button => {
            button.addEventListener('click', () => {
                this.handleBackButton();
            });
        });

        document.querySelector('.product-modal-back').addEventListener('click', () => {
            this.closeProductModal();
        });

        // Payment methods
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                this.handlePaymentMethodSelect(method);
            });
        });

        // Payment form validation
        document.querySelectorAll('.payment-form .form-input').forEach(input => {
            input.addEventListener('input', () => {
                this.checkPaymentFormValidity();
            });
        });

        // Pay button
        document.querySelector('.pay-button').addEventListener('click', () => {
            this.handlePayment();
        });

        // Outside clicks
        window.addEventListener('click', (e) => {
            this.handleOutsideClick(e);
        });
    }

    toggleFilters() {
        const filtersSidebar = document.querySelector('.filters-sidebar');
        const filtersToggle = document.querySelector('.filters-toggle');
        const desktopFiltersToggle = document.querySelector('.desktop-filters-toggle');

        filtersSidebar.classList.toggle('active');
        filtersToggle.classList.toggle('active');
        desktopFiltersToggle.classList.toggle('active');
    }

    openProductModal(productId, cartItem = null) {
        this.currentProduct = productId;
        const product = this.productManager.getProductById(productId);

        if (!this.productManager.openingFromCart) {
            this.currentModalChanges = {};
        }

        // Close all option groups
        document.querySelectorAll('.product-option-group').forEach(detail => {
            detail.removeAttribute('open');
        });

        if (this.productManager.openingFromCart && cartItem) {
            this.setModalValuesFromCartItem(cartItem);
        } else {
            this.setModalValuesFromProductState(product);
        }

        this.updateModalProductInfo(product);
        this.updateModalPrice();
        this.updateModalAvailability();

        document.querySelector('.product-modal').style.display = 'block';
    }

    setModalValuesFromCartItem(cartItem) {
        document.querySelector('.quantity-value-modal').value = cartItem.quantity;

        const unitButtons = document.querySelectorAll('.unit-button-modal');
        unitButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === cartItem.unit) {
                btn.classList.add('active');
            }
        });

        document.querySelector(`input[name="warehouse"][value="${cartItem.warehouse}"]`).checked = true;
        document.querySelector(`input[name="diameter"][value="${cartItem.diameter}"]`).checked = true;
        document.querySelector(`input[name="thickness"][value="${cartItem.thickness}"]`).checked = true;
        document.querySelector(`input[name="steel"][value="${cartItem.steel}"]`).checked = true;
    }

    setModalValuesFromProductState(product) {
        const mainState = this.productManager.getProductState(product.id);
        document.querySelector('.quantity-value-modal').value = mainState.quantity;

        const unitButtons = document.querySelectorAll('.unit-button-modal');
        unitButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent === mainState.unit) {
                btn.classList.add('active');
            }
        });

        document.querySelector(`input[name="warehouse"][value="${product.warehouse}"]`).checked = true;
        document.querySelector(`input[name="diameter"][value="${product.diameter}"]`).checked = true;
        document.querySelector(`input[name="thickness"][value="${product.thickness}"]`).checked = true;
        document.querySelector(`input[name="steel"][value="${product.steel}"]`).checked = true;
    }

    updateModalProductInfo(product) {
        document.querySelector('.product-modal-name').textContent = product.name;
        document.querySelector('.product-modal-code').textContent = product.code;

        // Update selection displays
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            this.updateSelectionDisplay(radio);
        });
    }

    updateSelectionDisplay(radio) {
        const name = radio.getAttribute('name');
        const value = radio.value;
        const selectionElement = document.getElementById(`${name}-selection`);

        const displayValues = {
            warehouse: {
                moscow: 'Москва',
                spb: 'Санкт-Петербург',
                ekb: 'Екатеринбург',
                novosibirsk: 'Новосибирск'
            },
            diameter: (val) => `${val} мм`,
            thickness: (val) => `${val} мм`,
            steel: {
                steel1: '09Г2С-15',
                steel2: 'Ст3сп',
                steel3: '20',
                steel4: '12Х18Н10Т'
            }
        };

        if (name === 'warehouse' || name === 'steel') {
            selectionElement.textContent = displayValues[name][value];
        } else {
            selectionElement.textContent = displayValues[name](value);
        }
    }

    handleModalQuantityChange(change) {
        const quantityInput = document.querySelector('.quantity-value-modal');
        let value = parseInt(quantityInput.value) || 1;
        value += change;
        if (value < 1) value = 1;
        quantityInput.value = value;
        this.updateModalPrice(value);

        if (this.currentProduct) {
            this.currentModalChanges.quantity = value;
        }
    }

    handleModalQuantityInput(value) {
        let numValue = parseInt(value) || 1;
        this.updateModalPrice(numValue);

        if (this.currentProduct) {
            this.currentModalChanges.quantity = numValue;
        }
    }

    handleModalQuantityBlur(input) {
        let value = parseInt(input.value) || 1;
        if (value < 1) {
            value = 1;
            input.value = value;
            this.updateModalPrice(value);

            if (this.currentProduct) {
                this.currentModalChanges.quantity = value;
            }
        }
    }

    handleModalUnitChange(button) {
        const toggle = button.parentElement;
        toggle.querySelectorAll('.unit-button-modal').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        this.updateModalAvailability();

        if (this.currentProduct) {
            this.currentModalChanges.unit = button.textContent;
        }
    }

    handleModalOptionChange(radio) {
        this.updateSelectionDisplay(radio);

        if (this.currentProduct) {
            const name = radio.getAttribute('name');
            this.currentModalChanges[name] = radio.value;
        }
    }

    updateModalPrice(quantity = null) {
        const priceModal = document.querySelector('.price-modal');
        if (this.currentProduct) {
            const product = this.productManager.getProductById(this.currentProduct);
            const currentQuantity = quantity || parseInt(document.querySelector('.quantity-value-modal').value) || 1;
            const totalPrice = product.price * currentQuantity;
            priceModal.textContent = this.productManager.formatPrice(totalPrice);
        }
    }

    updateModalAvailability() {
        const availability = document.getElementById('availability');
        if (this.currentProduct) {
            const product = this.productManager.getProductById(this.currentProduct);
            const unit = document.querySelector('.unit-button-modal.active').textContent;

            const availabilityUnit = this.getAvailabilityUnit(unit);
            availability.textContent = `В наличии: ${product.availability} ${availabilityUnit}`;
        }
    }

    getAvailabilityUnit(unit) {
        if (unit === 'Тонны') return 'тонн';
        if (unit === 'Метры') return 'метров';
        return unit;
    }

    addToCartFromModal() {
        const quantity = parseInt(document.querySelector('.quantity-value-modal').value) || 1;
        const unit = document.querySelector('.unit-button-modal.active').textContent;

        if (quantity > 0 && this.currentProduct) {
            const warehouse = this.currentModalChanges.warehouse || document.querySelector('input[name="warehouse"]:checked').value;
            const diameter = this.currentModalChanges.diameter || document.querySelector('input[name="diameter"]:checked').value;
            const thickness = this.currentModalChanges.thickness || document.querySelector('input[name="thickness"]:checked').value;
            const steel = this.currentModalChanges.steel || document.querySelector('input[name="steel"]:checked').value;
            const finalQuantity = this.currentModalChanges.quantity || quantity;
            const finalUnit = this.currentModalChanges.unit || unit;

            this.cartManager.addToCart(this.currentProduct, finalQuantity, finalUnit, warehouse, diameter, thickness, steel);
            this.closeProductModal();
        } else {
            alert('Выберите количество товара!');
        }
    }

    closeProductModal() {
        this.currentModalChanges = {};
        document.querySelector('.product-modal').style.display = 'none';
    }

    handleSelectAllChange(checked) {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = checked;
            this.cartManager.cart[index].selected = checked;
        });
        this.cartManager.updateCheckoutButton();
    }

    handleCheckout() {
        if (this.cartManager.cart.length > 0) {
            const selectedItems = this.cartManager.getSelectedItems();
            if (selectedItems.length > 0) {
                this.openPaymentModal(selectedItems);
            }
        }
    }

    openPaymentModal(items) {
        const paymentProducts = document.querySelector('.payment-products');
        paymentProducts.innerHTML = '';

        let totalProductsPrice = 0;

        items.forEach(item => {
            const paymentProduct = this.createPaymentProduct(item);
            paymentProducts.appendChild(paymentProduct);
            totalProductsPrice += item.price * item.quantity;
        });

        this.updatePaymentSummary(totalProductsPrice);
        this.resetPaymentForm();

        document.querySelector('.payment-modal').style.display = 'block';
        document.querySelector('.cart-modal').style.display = 'none';
    }

    createPaymentProduct(item) {
        const paymentProduct = document.createElement('div');
        paymentProduct.className = 'payment-product';
        const totalItemPrice = item.price * item.quantity;
        const unitDeclension = this.cartManager.getUnitDeclension(item.quantity, item.unit);

        const warehouseText = this.getWarehouseText(item.warehouse);
        const steelText = this.getSteelText(item.steel);

        paymentProduct.innerHTML = `
            <div class="payment-product-image">
                <div class="image-placeholder">Фото</div>
            </div>
            <div class="payment-product-info">
                <div class="payment-product-name">${item.name}</div>
                <div class="payment-product-details">Склад: ${warehouseText}</div>
                <div class="payment-product-details">Диаметр: ${item.diameter} мм</div>
                <div class="payment-product-details">Толщина: ${item.thickness} мм</div>
                <div class="payment-product-details">Марка стали: ${steelText}</div>
                <div class="payment-product-delivery">Количество: ${item.quantity} ${unitDeclension}</div>
                <div class="payment-product-delivery">Цена: ${this.productManager.formatPrice(totalItemPrice)}</div>
            </div>
        `;

        return paymentProduct;
    }

    getWarehouseText(warehouse) {
        const warehouses = {
            moscow: 'Москва',
            spb: 'Санкт-Петербург',
            ekb: 'Екатеринбург',
            novosibirsk: 'Новосибирск'
        };
        return warehouses[warehouse] || warehouse;
    }

    getSteelText(steel) {
        const steels = {
            steel1: '09Г2С-15',
            steel2: 'Ст3сп',
            steel3: '20',
            steel4: '12Х18Н10Т'
        };
        return steels[steel] || steel;
    }

    updatePaymentSummary(totalProductsPrice) {
        document.getElementById('products-price').textContent = this.productManager.formatPrice(totalProductsPrice);
        document.getElementById('total-price').textContent = this.productManager.formatPrice(totalProductsPrice);
    }

    resetPaymentForm() {
        document.querySelectorAll('.payment-method').forEach(method => method.classList.remove('active'));
        document.querySelectorAll('.payment-form .form-input').forEach(input => input.value = '');
        this.checkPaymentFormValidity();
    }

    handlePaymentMethodSelect(method) {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
        method.classList.add('active');
        this.checkPaymentFormValidity();
    }

    checkPaymentFormValidity() {
        const formInputs = document.querySelectorAll('.payment-form .form-input');
        const allFilled = Array.from(formInputs).every(input => input.value.trim() !== '');

        const innInput = document.querySelector('.inn-input');
        const innValid = innInput.value.length === 12 && /^\d+$/.test(innInput.value);

        const phoneInput = document.querySelector('.phone-input');
        const phoneValid = /^\+7\d{10}$/.test(phoneInput.value);

        const paymentSelected = document.querySelector('.payment-method.active') !== null;

        document.querySelector('.pay-button').disabled = !(allFilled && innValid && phoneValid && paymentSelected);
    }

    handlePayment() {
        alert('Заказ успешно оформлен!');
        document.querySelector('.payment-modal').style.display = 'none';
        this.cartManager.clearSelectedItems();
    }

    handleBackButton() {
        const cartModal = document.querySelector('.cart-modal');
        const paymentModal = document.querySelector('.payment-modal');

        if (paymentModal.style.display === 'block') {
            paymentModal.style.display = 'none';
            cartModal.style.display = 'block';
        } else if (cartModal.style.display === 'block') {
            cartModal.style.display = 'none';
        }
    }

    handleOutsideClick(event) {
        const cartModal = document.querySelector('.cart-modal');
        const productModal = document.querySelector('.product-modal');
        const paymentModal = document.querySelector('.payment-modal');
        const filtersSidebar = document.querySelector('.filters-sidebar');

        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === productModal) {
            this.closeProductModal();
        }
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
        if (event.target === filtersSidebar) {
            this.toggleFilters();
        }
    }
}

// Initialize the app
const app = new TMKApp();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});
