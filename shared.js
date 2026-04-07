// ─── SHARED UTILITIES — Monkey Mog ───────────────────────────────────────────

// ── CART ──
function getCart() { return JSON.parse(localStorage.getItem('mm_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('mm_cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  el.textContent = total;
}
function addToCart(product) {
  const products = getProducts();
  const p = products.find(x => x.id === product.id);
  if (!p || p.stock <= 0) { showToast('Sorry, this item is out of stock.'); return; }
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  const currentQtyInCart = existing ? existing.qty : 0;
  if (currentQtyInCart >= p.stock) { showToast(`Only ${p.stock} in stock!`); return; }
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showToast(`"${product.name}" added to cart!`);
}

// ── PRODUCTS ──
// The "image" field should be a path like "images/morning-mug.jpg"
// If left blank (""), the emoji will show as a fallback.
function getProducts() {
  const stored = localStorage.getItem('mm_products');
  if (stored) return JSON.parse(stored);
  const defaults = [
    { id: 1, name: 'Morning Mug',     desc: 'A wide, comfortable mug perfect for your morning coffee or tea.', price: 55,  emoji: '☕', image: '', category: 'Mugs',         stock: 10 },
    { id: 2, name: 'Bud Vase',        desc: 'A slim, elegant vase for a single stem or small bouquet.',         price: 75,  emoji: '🌸', image: '', category: 'Vases',        stock: 6  },
    { id: 3, name: 'Serving Bowl',    desc: 'A generous hand-thrown bowl for salads, fruit, or display.',       price: 120, emoji: '🥗', image: '', category: 'Bowls',        stock: 4  },
    { id: 4, name: 'Spice Pinch Pot', desc: 'A small open vessel, ideal for salt, spices, or trinkets.',        price: 55,  emoji: '🏺', image: '', category: 'Small Pieces', stock: 12 },
    { id: 5, name: 'Tall Vase',       desc: 'A striking tall form that stands beautifully on its own.',         price: 150, emoji: '🌿', image: '', category: 'Vases',        stock: 3  },
    { id: 6, name: 'Soup Crock',      desc: 'A deep, lidded crock perfect for soups and stews.',                price: 95,  emoji: '🍲', image: '', category: 'Bowls',        stock: 5  },
  ];
  localStorage.setItem('mm_products', JSON.stringify(defaults));
  return defaults;
}
function saveProducts(products) { localStorage.setItem('mm_products', JSON.stringify(products)); }

// ── PRODUCT IMAGE HELPER ──
// Returns an <img> tag if the product has a real photo, otherwise shows the emoji.
function productThumb(p, size) {
  if (p.image && p.image.trim() !== '') {
    return `<img src="${p.image}" alt="${p.name}"
      style="width:100%;height:${size || '230px'};object-fit:cover;display:block;"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
      <div style="display:none;width:100%;height:${size || '230px'};align-items:center;justify-content:center;font-size:5rem;">${p.emoji}</div>`;
  }
  return `<div style="font-size:${size === '100%' ? '8rem' : '5rem'};width:100%;height:${size || '230px'};display:flex;align-items:center;justify-content:center;">${p.emoji}</div>`;
}

// ── DEPLETE STOCK ON ORDER ──
function depleteStock(cartItems) {
  const products = getProducts();
  cartItems.forEach(cartItem => {
    const p = products.find(x => x.id === cartItem.id);
    if (p) p.stock = Math.max(0, p.stock - cartItem.qty);
  });
  saveProducts(products);
}

// ── REVIEWS ──
function getReviews() {
  const stored = localStorage.getItem('mm_reviews');
  if (stored) return JSON.parse(stored);
  const defaults = [
    { name: 'Sarah K.', rating: 5, text: 'The morning mug I ordered is absolutely gorgeous. The glaze is so rich and it feels wonderful in my hands. Already ordered another!' },
    { name: 'James T.', rating: 5, text: 'Got the serving bowl as a gift. My friend was blown away. Ships fast and packaged beautifully. Highly recommend.' },
    { name: 'Maria L.', rating: 4, text: 'Beautiful work and great communication. The bud vase is even prettier in person than in the photo.' },
  ];
  localStorage.setItem('mm_reviews', JSON.stringify(defaults));
  return defaults;
}

// ── RENDER PRODUCTS ──
function renderFeatured(gridId, limit) {
  const products = limit ? getProducts().slice(0, limit) : getProducts();
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = products.map(p => {
    const oos = p.stock <= 0;
    const low = p.stock > 0 && p.stock <= 3;
    return `
    <div class="product-card${oos ? ' out-of-stock' : ''}"
      onclick="${oos ? '' : `window.location='product.html?id=${p.id}'`}"
      style="${oos ? 'opacity:0.6;cursor:default;' : ''}">
      <div class="product-img" style="position:relative;overflow:hidden;height:230px;">
        ${productThumb(p, '230px')}
        ${oos ? '<div class="oos-badge">Out of Stock</div>' : ''}
        ${low ? `<div class="low-badge">Only ${p.stock} left!</div>` : ''}
      </div>
      <div class="product-info">
        ${p.category ? `<div class="product-cat">${p.category}</div>` : ''}
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div>
            <div class="product-price">$${Number(p.price).toFixed(2)}</div>
            <div class="stock-count">${oos ? 'Out of stock' : `${p.stock} in stock`}</div>
          </div>
          ${oos
            ? '<span style="font-size:0.8rem;color:#999;">Unavailable</span>'
            : `<button class="add-to-cart-btn" onclick="event.stopPropagation();addToCart({id:${p.id},name:'${p.name.replace(/'/g,"\\'")}',price:${p.price},emoji:'${p.emoji}',image:'${(p.image||'').replace(/'/g,"\\'")}' })">Add to Cart</button>`
          }
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── RENDER REVIEWS ──
function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;
  const reviews = getReviews();
  grid.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">— ${r.name}</div>
    </div>
  `).join('');
}

// ── ORDER NUMBER ──
// Generates a 4-character random order number like #45s8
function generateOrderNumber() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '#';
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
