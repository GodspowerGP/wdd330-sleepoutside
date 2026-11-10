import {
  addItemToCartList,
  getCartItems,
  saveCartItems,
  updateCartCount,
} from './utils.mjs';
import ProductData from './ProductData.mjs';

const dataSource = new ProductData('tents');

function showAddedFeedback(button, quantity) {
  const container = button.parentElement;
  if (!container) return;

  let feedback = container.querySelector('.cart-feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'cart-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    container.appendChild(feedback);
  }

  feedback.textContent =
    quantity > 1
      ? `Updated cart quantity to ${quantity}.`
      : 'Added to cart (Qty: 1).';
}

function addProductToCart(product) {
  const updatedCart = addItemToCartList(getCartItems(), product);
  saveCartItems(updatedCart);
  const savedItem = updatedCart.find((item) => item.Id === product.Id);
  return savedItem ? savedItem.quantity : 1;
}

async function addToCartHandler(e) {
  const button = e.currentTarget;
  const product = await dataSource.findProductById(button.dataset.id);
  if (product) {
    const quantity = addProductToCart(product);
    showAddedFeedback(button, quantity);
  }
}

updateCartCount();

const addToCartBtn = document.getElementById('addToCart');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', addToCartHandler);
}
