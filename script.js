const cart = new Map();
const cartDrawer = document.querySelector(".cart-drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const cartItems = document.querySelector(".cart-items");
const emptyState = document.querySelector(".cart-empty");
const cartSummary = document.querySelector(".cart-summary");
const cartCount = document.querySelector(".cart-count");
const toast = document.querySelector(".toast");
let toastTimeout;
let lastFocusedElement;

function formatPrice(value) {
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(value)} €`;
}

function renderCart() {
  const products = [...cart.values()];
  const itemCount = products.reduce((total, item) => total + item.quantity, 0);
  const subtotal = products.reduce((total, item) => total + item.price * item.quantity, 0);

  cartCount.textContent = itemCount;
  cartItems.replaceChildren(...products.map((item) => {
    const row = document.createElement("article");
    row.className = "cart-line";
    row.innerHTML = `
      <div><h3></h3><div class="line-price"></div></div>
      <div class="quantity-control" aria-label="Menge für Produkt">
        <button type="button" data-action="decrease" aria-label="Ein Stück entfernen">−</button>
        <span aria-live="polite"></span>
        <button type="button" data-action="increase" aria-label="Ein Stück hinzufügen">+</button>
      </div>`;
    row.querySelector("h3").textContent = item.name;
    row.querySelector(".line-price").textContent = `${formatPrice(item.price)} pro Stück`;
    row.querySelector(".quantity-control span").textContent = item.quantity;
    row.querySelector('[data-action="decrease"]').dataset.product = item.id;
    row.querySelector('[data-action="increase"]').dataset.product = item.id;
    return row;
  }));

  emptyState.hidden = itemCount !== 0;
  cartSummary.hidden = itemCount === 0;
  document.querySelector(".subtotal-value").textContent = formatPrice(subtotal);
  document.querySelector(".checkout-note").textContent = "";
}

function openCart() {
  lastFocusedElement = document.activeElement;
  backdrop.hidden = false;
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  document.querySelector(".drawer-close").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
  window.setTimeout(() => { backdrop.hidden = true; }, 240);
  if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.product;
    const item = cart.get(id) ?? {
      id,
      name: button.dataset.name,
      price: Number(button.dataset.price),
      quantity: 0
    };
    item.quantity += 1;
    cart.set(id, item);
    renderCart();
    showToast(`${item.name} ist im Körbchen!`);
  });
});

document.querySelector(".cart-trigger").addEventListener("click", openCart);
document.querySelector(".drawer-close").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", () => {
  closeCart();
  document.querySelector("#schirme").scrollIntoView({ behavior: "smooth" });
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = cart.get(button.dataset.product);
  if (!item) return;
  item.quantity += button.dataset.action === "increase" ? 1 : -1;
  if (item.quantity <= 0) cart.delete(item.id);
  renderCart();
});

document.querySelector(".checkout-button").addEventListener("click", () => {
  document.querySelector(".checkout-note").textContent = "Das Körbchen ist gepackt! Der echte Shop kommt bald – Ella sagt Danke fürs Vorbeischauen.";
});

document.querySelector(".newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const feedback = form.querySelector(".form-feedback");
  feedback.textContent = "Juhu! Du stehst auf Ellas Regenpost-Liste.";
  form.querySelector("button").disabled = true;
  form.querySelector("button").textContent = "Eingetragen ✓";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
  if (event.key !== "Tab" || !cartDrawer.classList.contains("is-open")) return;
  const focusable = [...cartDrawer.querySelectorAll('button:not([disabled]), a[href], input:not([disabled])')];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

renderCart();
