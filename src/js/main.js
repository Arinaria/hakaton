import { initializeProducts } from './modules/products.js';
import { initializeCart } from './modules/cart.js';
import { initializeFilters } from './modules/filters.js';
import { initializeModals } from './modules/modals.js';
import { initializeTelegram } from './modules/telegram.js';

document.addEventListener('DOMContentLoaded', function () {
    initializeProducts();
    initializeCart();
    initializeFilters();
    initializeModals();
    initializeTelegram();
});
