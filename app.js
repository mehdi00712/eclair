<!-- Place this as a separate file: app.js -->
<script>
// Shared Firebase init (same as admin)
(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyDnYlw01KhjWRXLhatnr9fFcXA4Q_zOs10",
    authDomain: "eclair-501b7.firebaseapp.com",
    databaseURL: "https://eclair-501b7-default-rtdb.firebaseio.com",
    projectId: "eclair-501b7",
    storageBucket: "eclair-501b7.appspot.com",
    messagingSenderId: "1042027942352",
    appId: "1:1042027942352:web:fa760d5609f5713c0d69d5"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.__DB__ = firebase.database();
})();

// Load Featured (Home)
window.loadFeaturedProducts = function(limit = 6) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
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

// Load full shop (Menu)
window.loadShop = function() {
  const mount = document.getElementById('shop-grid');
  if (!mount) return;
  const db = window.__DB__;

  function render(list) {
    mount.innerHTML = list.map(p => `
      <div class="product-card">
        <img src="${p.image||''}" alt="${p.name||''}">
        <h4>${p.name||''}</h4>
        <p class="price">Rs ${Number(p.price||0)}</p>
        <button class="btn" data-add='${JSON.stringify({name:p.name,price:Number(p.price||0)})}'>Add to Cart</button>
      </div>
    `).join('');
    // Bind add-to-cart
    mount.querySelectorAll('[data-add]').forEach(btn=>{
      btn.onclick = () => {
        const item = JSON.parse(btn.getAttribute('data-add'));
        window.addToCart && window.addToCart(item.name, item.price);
      };
    });
  }

  db.ref('products').on('value', snap => {
    const obj = snap.val() || {};
    const items = Object.values(obj).filter(p => p.visible);
    // Optional category filter via hash ?cat=Drinks
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat');
    const filtered = cat ? items.filter(i=>i.category===cat) : items;
    // Group by category (optional) — for now render all
    render(filtered.sort((a,b)=> (b.createdAt||0)-(a.createdAt||0)));
  });
};
</script>
