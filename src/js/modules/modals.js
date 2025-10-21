import { products, productStates, formatPrice, getUnitDeclension, getAvailabilityUnit } from './products.js';
import { cart, addToCart, updateCartDisplay } from './cart.js';

export let currentProduct = null;
export let currentModalChanges = {};
export let openingFromCart = false;

export function initializeModals() {
    setupModalEventListeners();
    setupProductModalEventListeners();
    setupPaymentModalEventListeners();
}

function setupModalEventListeners() {
    const cartButton = document.querySelector('.cart-button');
    const cartModal = document.querySelector('.cart-modal');
    const productModal = document.querySelector('.product-modal');
    const paymentModal = document.querySelector('.payment-modal');
    const backButtons = document.querySelectorAll('.back-button');
    const productModalBack = document.querySelector('.product-modal-back');

    cartButton.addEventListener('click', function () {
        cartModal.style.display = 'block';
    });

    backButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (cartModal.style.display === 'block') {
                cartModal.style.display = 'none';
            } else if (paymentModal.style.display === 'block') {
                paymentModal.style.display = 'none';
                cartModal.style.display = 'block';
            }
        });
    });

    productModalBack.addEventListener('click', function () {
        currentModalChanges = {};
        productModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === productModal) {
            currentModalChanges = {};
            productModal.style.display = 'none';
        }
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
}

function setupProductModalEventListeners() {
    const addToCartModal = document.querySelector('.add-to-cart-modal');
    const quantityPlusModal = document.querySelector('.quantity-plus-modal');
    const quantityMinusModal = document.querySelector('.quantity-minus-modal');
    const quantityValueModal = document.querySelector('.quantity-value-modal');
    const unitButtonsModal = document.querySelectorAll('.unit-button-modal');

    addToCartModal.addEventListener('click', function () {
        const quantity = parseInt(quantityValueModal.value) || 1;
        const unit = document.querySelector('.unit-button-modal.active').textContent;

        if (quantity > 0 && currentProduct) {
            const warehouse = currentModalChanges.warehouse || document.querySelector('input[name="warehouse"]:checked').value;
            const diameter = currentModalChanges.diameter || document.querySelector('input[name="diameter"]:checked').value;
            const thickness = currentModalChanges.thickness || document.querySelector('input[name="thickness"]:checked').value;
            const steel = currentModalChanges.steel || document.querySelector('input[name="steel"]:checked').value;
            const finalQuantity = currentModalChanges.quantity || quantity;
            const finalUnit = currentModalChanges.unit || unit;

            addToCart(currentProduct, finalQuantity, finalUnit, warehouse, diameter, thickness, steel);
            document.querySelector('.product-modal').style.display = 'none';
        } else {
            alert('Выберите количество товара!');
        }
    });

    quantityPlusModal.addEventListener('click', function () {
        let value = parseInt(quantityValueModal.value) || 1;
        value += 1;
        quantityValueModal.value = value;
        updateModalPrice(value);

        if (currentProduct) {
            currentModalChanges.quantity = value;
        }
    });

    quantityMinusModal.addEventListener('click', function () {
        let value = parseInt(quantityValueModal.value) || 1;
        if (value > 1) {
            value -= 1;
            quantityValueModal.value = value;
            updateModalPrice(value);

            if (currentProduct) {
                currentModalChanges.quantity = value;
            }
        }
    });

    quantityValueModal.addEventListener('input', function () {
        let value = parseInt(this.value) || 1;
        updateModalPrice(value);

        if (currentProduct) {
            currentModalChanges.quantity = value;
        }
    });

    quantityValueModal.addEventListener('blur', function () {
        let value = parseInt(this.value) || 1;
        if (value < 1) {
            value = 1;
            this.value = value;
            updateModalPrice(value);

            if (currentProduct) {
                currentModalChanges.quantity = value;
            }
        }
    });

    unitButtonsModal.forEach(button => {
        button.addEventListener('click', function () {
            const toggle = this.parentElement;
            toggle.querySelectorAll('.unit-button-modal').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            updateAvailability();

            if (currentProduct) {
                currentModalChanges.unit = this.textContent;
            }
        });
    });

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const name = this.getAttribute('name');
            const value = this.value;
            const selectionElement = document.getElementById(`${name}-selection`);

            if (name === 'warehouse') {
                if (value === 'moscow') selectionElement.textContent = 'Москва';
                else if (value === 'spb') selectionElement.textContent = 'Санкт-Петербург';
                else if (value === 'ekb') selectionElement.textContent = 'Екатеринбург';
                else if (value === 'novosibirsk') selectionElement.textContent = 'Новосибирск';
            } else if (name === 'diameter') {
                selectionElement.textContent = `${value} мм`;
            } else if (name === 'thickness') {
                selectionElement.textContent = `${value} мм`;
            } else if (name === 'steel') {
                if (value === 'steel1') selectionElement.textContent = '09Г2С-15';
                else if (value === 'steel2') selectionElement.textContent = 'Ст3сп';
                else if (value === 'steel3') selectionElement.textContent = '20';
                else if (value === 'steel4') selectionElement.textContent = '12Х18Н10Т';
            }

            if (currentProduct) {
                currentModalChanges[name] = value;
            }
        });
    });
}

function setupPaymentModalEventListeners() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const payButton = document.querySelector('.pay-button');
    const formInputs = document.querySelectorAll('.payment-form .form-input');

    paymentMethods.forEach(method => {
        method.addEventListener('click', function () {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            checkFormValidity();
        });
    });

    formInputs.forEach(input => {
        input.addEventListener('input', checkFormValidity);
    });

    payButton.addEventListener('click', function () {
        alert('Заказ успешно оформлен!');
        document.querySelector('.payment-modal').style.display = 'none';

        const updatedCart = cart.filter(item => !item.selected);
        cart.length = 0;
        cart.push(...updatedCart);
        updateCartDisplay();
    });
}

export function openProductModal(productId, fromCart = false, cartItem = null) {
    currentProduct = productId;
    openingFromCart = fromCart;
    const product = products.find(p => p.id === productId);

    if (!openingFromCart) {
        currentModalChanges = {};
    }

    document.querySelectorAll('.product-option-group').forEach(detail => {
        detail.removeAttribute('open');
    });

    if (openingFromCart && cartItem) {
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
    } else {
        const mainState = productStates[productId];
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

    const quantity = parseInt(document.querySelector('.quantity-value-modal').value) || 1;
    updateModalPrice(quantity);
    updateAvailability();

    document.querySelector('.product-modal-name').textContent = product.name;
    document.querySelector('.product-modal-code').textContent = product.code;

    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        const name = radio.getAttribute('name');
        const value = radio.value;
        const selectionElement = document.getElementById(`${name}-selection`);

        if (name === 'warehouse') {
            if (value === 'moscow') selectionElement.textContent = 'Москва';
            else if (value === 'spb') selectionElement.textContent = 'Санкт-Петербург';
            else if (value === 'ekb') selectionElement.textContent = 'Екатеринбург';
            else if (value === 'novosibirsk') selectionElement.textContent = 'Новосибирск';
        } else if (name === 'diameter') {
            selectionElement.textContent = `${value} мм`;
        } else if (name === 'thickness') {
            selectionElement.textContent = `${value} мм`;
        } else if (name === 'steel') {
            if (value === 'steel1') selectionElement.textContent = '09Г2С-15';
            else if (value === 'steel2') selectionElement.textContent = 'Ст3сп';
            else if (value === 'steel3') selectionElement.textContent = '20';
            else if (value === 'steel4') selectionElement.textContent = '12Х18Н10Т';
        }
    });

    document.querySelector('.product-modal').style.display = 'block';
}

export function openPaymentModal(items) {
    const paymentProducts = document.querySelector('.payment-products');
    const productsPrice = document.getElementById('products-price');
    const totalPrice = document.getElementById('total-price');
    const paymentModal = document.querySelector('.payment-modal');
    const cartModal = document.querySelector('.cart-modal');

    paymentProducts.innerHTML = '';

    let totalProductsPrice = 0;

    items.forEach(item => {
        const totalItemPrice = item.price * item.quantity;
        totalProductsPrice += totalItemPrice;
        const unitDeclension = getUnitDeclension(item.quantity, item.unit);

        let warehouseText = '';
        if (item.warehouse === 'moscow') warehouseText = 'Москва';
        else if (item.warehouse === 'spb') warehouseText = 'Санкт-Петербург';
        else if (item.warehouse === 'ekb') warehouseText = 'Екатеринбург';
        else if (item.warehouse === 'novosibirsk') warehouseText = 'Новосибирск';

        let steelText = '';
        if (item.steel === 'steel1') steelText = '09Г2С-15';
        else if (item.steel === 'steel2') steelText = 'Ст3сп';
        else if (item.steel === 'steel3') steelText = '20';
        else if (item.steel === 'steel4') steelText = '12Х18Н10Т';

        const paymentProduct = document.createElement('div');
        paymentProduct.className = 'payment-product';
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
                <div class="payment-product-delivery">Цена: ${formatPrice(totalItemPrice)}</div>
            </div>
        `;
        paymentProducts.appendChild(paymentProduct);
    });

    productsPrice.textContent = formatPrice(totalProductsPrice);
    totalPrice.textContent = formatPrice(totalProductsPrice);

    document.querySelectorAll('.payment-method').forEach(method => method.classList.remove('active'));

    paymentModal.style.display = 'block';
    cartModal.style.display = 'none';

    checkFormValidity();
}

function updateModalPrice(quantity) {
    const priceModal = document.querySelector('.price-modal');
    if (currentProduct) {
        const product = products.find(p => p.id == currentProduct);
        const totalPrice = product.price * quantity;
        priceModal.textContent = formatPrice(totalPrice);
    }
}

function updateAvailability() {
    const availability = document.getElementById('availability');
    if (currentProduct) {
        const product = products.find(p => p.id == currentProduct);
        const unit = document.querySelector('.unit-button-modal.active').textContent;

        const availabilityUnit = getAvailabilityUnit(unit);
        availability.textContent = `В наличии: ${product.availability} ${availabilityUnit}`;
    }
}

function checkFormValidity() {
    const formInputs = document.querySelectorAll('.payment-form .form-input');
    const allFilled = Array.from(formInputs).every(input => input.value.trim() !== '');

    const innInput = document.querySelector('.inn-input');
    const innValid = innInput.value.length === 12 && /^\d+$/.test(innInput.value);

    const phoneInput = document.querySelector('.phone-input');
    const phoneValid = /^\+7\d{10}$/.test(phoneInput.value);

    const paymentSelected = document.querySelector('.payment-method.active') !== null;

    const payButton = document.querySelector('.pay-button');
    payButton.disabled = !(allFilled && innValid && phoneValid && paymentSelected);
}

window.openProductModal = openProductModal;
window.openPaymentModal = openPaymentModal;
