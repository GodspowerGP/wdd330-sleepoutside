// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart");
  const count = Array.isArray(cartItems) ? cartItems.length : cartItems ? 1 : 0;

  const cartLink = document.querySelector(".cart a");
  if (!cartLink) return;

  let badge = cartLink.querySelector(".cart-count");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cart-count";
    cartLink.appendChild(badge);
  }

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hide");
  } else {
    badge.classList.add("hide");
  }
}
