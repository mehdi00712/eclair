// Shared frontend logic (Firebase init + dynamic renders + cart + checkout)
// Uses Firebase compat scripts loaded in the page.

(function initFirebase(){
  const firebaseConfig = {
    apiKey: "AIzaSyDnYlw01KhjWRXLhatnr9fFcXA4Q_zOs10",
    authDomain: "eclair-501b7.firebaseapp.com",
    databaseURL: "https://eclair-501b7-default-rtdb.firebaseio.com",
    projectId: "eclair-501b7",
    storageBucket: "eclair-501b7.appspot.com",
    messagingSenderId: "1042027942352",
    appId: "1:1042027942352:web:fa760d5609f5713c0d69d5",
    measurementId: "G-BC1Z5MKSTH"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.__DB__ = firebase.database();
})();

// Featured on index.html
window.loadFeaturedProducts = function(limit = 6) {
  const grid = document.getElementById('featured-grid');
  if (!grid || !window.__DB__) return;
  const db = window.__DB__;
  db.ref('products').once('value').then(snap => {
    const obj = snap.val() || {};
    const items = Object.values(obj)
      .filter(p => p.visible)
      .sort((a,b)=> (b.createdAt||0)-(a.createdAt||0))
      .slice(0, limit);

    grid.innerHTML = items.map(p => `
      <div class="product-card">
        <img src="${p.image||''}" alt="${p.name||''}">
        <h4>${p.name||''}</h4>
        <p class="price">Rs ${Number(p.price||0)}</p>
        <a href="menu.html#shop" class="btn">Order</a>
      </div>
    `).join('');
  });
};

// Full shop on menu.html
let CART = [];
function updateCartBadge(){ const el = document.getElementById('cart-count'); if (el) el.textContent = CART.length; }
function renderCart(){
  const itemsDiv = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!itemsDiv || !totalEl) return;
  itemsDiv.innerHTML = '';
  let total = 0;
  CART.forEach((it, idx) => {
    total += Number(it.price||0);
    itemsDiv.innerHTML += `<div class="cart-item"><span>${it.name}</span><span>Rs ${it.price}</span><button onclick="removeFromCart(${idx})">❌</button></div>`;
  });
  totalEl.textContent = total;
  updateCartBadge();
}
window.addToCart = function(name, price){
  CART.push({name, price:Number(price||0)});
  renderCart();
};
window.removeFromCart = function(index){
  CART.splice(index,1);
  renderCart();
};
window.toggleCart = function(){
  const cartDiv = document.getElementById('cart');
  if (!cartDiv) return;
  cartDiv.style.display = cartDiv.style.display==='block' ? 'none' : 'block';
  renderCart();
};

window.loadShop = function(){
  const mount = document.getElementById('shop-grid');
  if (!mount || !window.__DB__) return;
  const db = window.__DB__;

  function render(list){
    mount.innerHTML = list.map(p => `
      <div class="product-card">
        <img src="${p.image||''}" alt="${p.name||''}">
        <h4>${p.name||''}</h4>
        <p class="price">Rs ${Number(p.price||0)}</p>
        <button class="btn" onclick='addToCart(${JSON.stringify(p.name)}, ${Number(p.price||0)})'>Add to Cart</button>
      </div>
    `).join('');
  }

  db.ref('products').on('value', snap => {
    const obj = snap.val() || {};
    let items = Object.values(obj).filter(p => p.visible);
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    if (cat) items = items.filter(i => i.category === cat);
    items.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0));
    render(items);
  });
};

// Checkout: push order to Realtime DB
window.checkout = function(){
  if (!window.__DB__) return alert("DB not ready");
  if (CART.length === 0) return alert("Cart is empty!");
  const name = (document.getElementById('customer-name')||{}).value?.trim();
  const phone = (document.getElementById('customer-phone')||{}).value?.trim();
  const method = (document.getElementById('payment-method')||{}).value || 'Pay at Pickup';
  const phoneRegex = /^5\d{7}$/; // Mauritius mobile pattern used earlier
  if (!name || !phoneRegex.test(phone||'')) return alert('Enter a name and a valid phone (starts with 5, 8 digits).');

  const order = {
    customer: { name, phone },
    items: CART,
    paymentMethod: method,
    createdAt: Date.now()
  };
  window.__DB__.ref('orders').push(order).then(() => {
    alert('Order placed successfully!');
    CART = [];
    renderCart();
    const cartDiv = document.getElementById('cart');
    if (cartDiv) cartDiv.style.display = 'none';
    if (document.getElementById('customer-name')) document.getElementById('customer-name').value='';
    if (document.getElementById('customer-phone')) document.getElementById('customer-phone').value='';
  }).catch(err => alert(err.message));
};
