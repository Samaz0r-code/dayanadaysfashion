/**
 * ============================================================
 * DAYANADAYSFASHION — script.js
 * dayanadaysfashion.shop
 * ============================================================
 * PARA EL AGENTE DE IA (Antigravity / Gemini / Claude):
 * Lee CONTEXT.md antes de modificar este archivo.
 *
 * MÓDULOS (buscar por número de sección):
 *   1.  Utilidades           $ / $$ / on / debounce
 *   2.  GA4 Tracking         trackEvent() — wrapper para gtag()
 *   3.  Header scroll        initHeader()
 *   4.  Menú hamburguesa     initMobileMenu()
 *   5.  Swiper carrusel      initProductsSwiper()
 *   6.  Scroll animations    initScrollAnimations()
 *   7.  Carrito + Drawer     cartState / openCartDrawer() / renderCartDrawer()
 *   8.  Toast                showCartToast(name)
 *   9.  Newsletter           initNewsletter()
 *   10. Chatbot              initChatbot() / getBotResponse()
 *   11. Click tracking       initClickTracking()
 *   12. Smooth scroll        initSmoothScroll()
 *   13. Init                 DOMContentLoaded → llama a todo
 *
 * ESTADO GLOBAL:
 *   cartState.items[]        Array de productos en el carrito
 *   cartState.totalQty       Total de unidades
 *   cartState.totalPrice     Total en USD
 *
 * PARA AGREGAR UN PRODUCTO AL CATÁLOGO:
 *   Solo agregar el HTML en index.html (ver CONTEXT.md).
 *   initCartButtons() detecta automáticamente .btn-add-cart.
 *
 * PARA AGREGAR RESPUESTA AL CHATBOT:
 *   Agregar una entrada en el array CHATBOT_KB (línea ~300):
 *   { keywords: ['palabra1','palabra2'], responses: ['Respuesta aquí'] }
 *
 * PARA CONECTAR PAGO REAL:
 *   Reemplazar el alert() en el handler de #checkoutBtn (~línea 255)
 *   con la integración de Mercado Pago o Stripe.
 *
 * PARA ACTIVAR GA4:
 *   1. Reemplazar GA_ID con tu Measurement ID (G-XXXXXXXXXX)
 *   2. Pegar snippet de gtag.js en el <head> de index.html
 *      (instrucciones completas al final de este archivo)
 * ============================================================
 */
'use strict';

/* ============ TOAST SYSTEM ============ */
const Toast = {
  container: null,

  init() {
    try {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.setAttribute('role', 'region');
      this.container.setAttribute('aria-label', 'Notificaciones');
      this.container.setAttribute('aria-live', 'polite');
      this.container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(this.container);
    } catch (error) {
      console.error('Error inicializando Toast Container:', error);
    }
  },

  show(message, type = 'info', duration = 3000) {
    try {
      if (!this.container) this.init();
      
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'status');
      toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Cerrar notificación">✕</button>
        <div class="toast-progress"></div>
      `;

      toast.querySelector('.toast-close').addEventListener('click', () => this.dismiss(toast));
      this.container.appendChild(toast);

      // Animación de entrada
      window.requestAnimationFrame(() => toast.classList.add('toast-visible'));

      // Auto dismiss
      const timer = setTimeout(() => this.dismiss(toast), duration);
      toast.dataset.timer = timer;
    } catch (error) {
      console.error('Error mostrando Toast:', error);
    }
  },

  dismiss(toast) {
    clearTimeout(toast.dataset.timer);
    toast.classList.remove('toast-visible');
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 300);
  },

  success(msg, duration) { this.show(msg, 'success', duration); },
  error(msg, duration)   { this.show(msg, 'error', duration); },
  warning(msg, duration) { this.show(msg, 'warning', duration); },
  info(msg, duration)    { this.show(msg, 'info', duration); }
};

/* ============ WISHLIST SYSTEM ============ */
const Wishlist = {
  items: new Set(JSON.parse(localStorage.getItem('ddf-wishlist') || '[]')),

  save() {
    localStorage.setItem('ddf-wishlist', JSON.stringify([...this.items]));
  },

  toggle(productId, productName) {
    try {
      const btn = document.querySelector(`[data-wishlist-id="${productId}"]`);

      if (this.items.has(productId)) {
        this.items.delete(productId);
        if (btn) btn.setAttribute('aria-pressed', 'false');
        Toast.info(`${productName} eliminado de favoritos`);
      } else {
        this.items.add(productId);
        if (btn) {
          btn.setAttribute('aria-pressed', 'true');
          // Animación spring personalizada
          btn.style.transform = 'scale(1.3)';
          setTimeout(() => btn.style.transform = 'scale(1)', 300);
        }
        Toast.success(`${productName} guardado en favoritos`);
      }

      this.save();
    } catch (error) {
      console.error('Error al actualizar wishlist:', error);
    }
  },

  init() {
    try {
      // Marcar como activos los favoritos guardados en la carga inicial
      this.items.forEach(id => {
        const btn = document.querySelector(`[data-wishlist-id="${id}"]`);
        if (btn) btn.setAttribute('aria-pressed', 'true');
      });

      // Delegación de eventos eficiente
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wishlist-id]');
        if (btn) {
          const id = btn.dataset.wishlistId;
          const name = btn.dataset.wishlistName || 'Producto';
          this.toggle(id, name);
        }
      });
    } catch (error) {
      console.error('Error inicializando Wishlist:', error);
    }
  }
};
/* ============ SCROLL REVEAL SYSTEM ============ */
const initScrollReveal = () => {
  const elements = document.querySelectorAll('.reveal, .reveal-scale, .reveal-right');
  if (!elements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  try {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          
          setTimeout(() => {
            el.classList.add('visible');
          }, delay);
          
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } catch (error) {
    console.error('Error inicializando ScrollReveal:', error);
    elements.forEach(el => el.classList.add('visible')); // Fallback de gracia
  }
};
/* ============ 1. UTILIDADES ============ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => root.querySelectorAll(sel);
const on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, opts); };
const debounce = (fn, ms = 50) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

/* ============ 10. GA4 TRACKING ============
   INSTRUCCIONES:
   1. Ir a https://analytics.google.com
   2. Crear propiedad "Web" para dayanadaysfashion.shop
   3. Obtener tu Measurement ID (ej: G-XXXXXXXXXX)
   4. Reemplazar GA_ID abajo con el tuyo
   5. Agregar en el <head> del index.html:
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
      <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
*/
const GA_ID = 'G-XXXXXXXXXX'; // <- REEMPLAZAR con tu ID real

const trackEvent = (eventName, params = {}) => {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
  console.log('[GA4]', eventName, params);
};

/* ============ 2. HEADER SCROLL ============ */
const initHeaderScroll = () => {
  try {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;

          // Agregar clase scrolled después de 60px
          if (currentScroll > 60) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }

          // Ocultar al bajar, mostrar al subir
          if (currentScroll > lastScroll && currentScroll > 120) {
            header.classList.add('hidden');
          } else {
            header.classList.remove('hidden');
          }

          lastScroll = currentScroll <= 0 ? 0 : currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  } catch (error) {
    console.error('Error inicializando Header Scroll:', error);
  }
};

/* ============ 3. MENU HAMBURGUESA ============ */
const initMobileMenu = () => {
  try {
    const btn = document.querySelector('[aria-controls="mobile-menu"]');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    let isOpen = false;

    const toggleMenu = (open) => {
      isOpen = open;
      btn.setAttribute('aria-expanded', open);
      menu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';

      if (open) {
        btn.classList.add('is-active');
        menu.style.display = 'block';
        window.requestAnimationFrame(() => menu.classList.add('is-open'));
        
        // Focus al primer link/btn del menú (A11y)
        const firstLink = menu.querySelector('a, button');
        if (firstLink) setTimeout(() => firstLink.focus(), 100);
      } else {
        btn.classList.remove('is-active');
        menu.classList.remove('is-open');
        btn.focus();
        setTimeout(() => { if (!isOpen) menu.style.display = ''; }, 300);
      }
    };

    btn.addEventListener('click', () => {
      toggleMenu(!isOpen);
    });

    // Cerramos si se pulsa un link del menú
    document.querySelectorAll('[data-close-menu]').forEach(l => {
      l.addEventListener('click', () => toggleMenu(false));
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleMenu(false);
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (isOpen && !menu.contains(e.target) && !btn.contains(e.target)) {
        toggleMenu(false);
      }
    });
  } catch (error) {
    console.error('Error inicializando el menú móvil:', error);
  }
};

/* ============ 4. SWIPER ============ */
const initProductsSwiper = () => {
  if (typeof Swiper === 'undefined') return;
  new Swiper('.products-swiper', {
    slidesPerView: 1.1,
    spaceBetween: 16,
    grabCursor: true,
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true },
    breakpoints: {
      480: { slidesPerView: 1.5, spaceBetween: 20 },
      700: { slidesPerView: 2.2, spaceBetween: 24 },
      1024: { slidesPerView: 3, spaceBetween: 28 },
      1240: { slidesPerView: 3.5, spaceBetween: 28 },
    },
    on: {
      slideChange(sw) {
        trackEvent('carousel_navigate', { carousel_name: 'featured_products', slide_index: sw.realIndex });
      },
    },
  });
};

/* ============ 5. SCROLL ANIMATIONS (Reemplazado en cabecera) ============ */

/* ============ 6. CARRITO CON DRAWER ============ */
/* ============ 6. CARRITO (Cart Engine) ============ */
const Cart = {
  items: JSON.parse(localStorage.getItem('ddf-cart') || '[]'),
  
  init() {
    this.updateUI();
    this.initButtons();
  },

  save() {
    localStorage.setItem('ddf-cart', JSON.stringify(this.items));
    this.updateUI();
  },

  add(product) {
    try {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) {
        existing.qty = (existing.qty || 1) + 1;
      } else {
        this.items.push({ ...product, qty: 1, cartId: Date.now() });
      }
      this.save();
      Toast.success(`¡${product.name} agregado al carrito!`);
      this.openDrawer();

      trackEvent('add_to_cart', {
        currency: 'USD',
        value: product.price,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }]
      });
    } catch (error) {
      console.error('Error al añadir al carrito:', error);
    }
  },

  remove(cartId) {
    this.items = this.items.filter(i => i.cartId !== cartId);
    this.save();
    Toast.info('Producto eliminado del carrito');
  },

  updateQty(cartId, qty) {
    const item = this.items.find(i => i.cartId === cartId);
    if (item) {
      if (qty < 1) { this.remove(cartId); return; }
      item.qty = qty;
      this.save();
    }
  },

  get total() {
    return this.items.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
  },

  get count() {
    return this.items.reduce((sum, i) => sum + (i.qty || 1), 0);
  },

  updateUI() {
    // Actualizar contador en header
    const counter = document.getElementById('cartCount'); // Usar ID del HTML
    if (counter) {
      counter.textContent = this.count || '0';
      counter.style.display = this.count > 0 ? 'flex' : 'none';
      if (this.count > 0) {
        counter.style.transform = 'scale(1.2)';
        setTimeout(() => counter.style.transform = '', 200);
      }
    }
    this.renderDrawer();
  },

  renderDrawer() {
    const body = document.getElementById('cartDrawerBody');
    const totalEl = document.getElementById('cartTotal');
    const footer = document.getElementById('cartDrawerFooter');
    const empty = document.getElementById('cartDrawerEmpty');

    if (!body) return;

    if (this.items.length === 0) {
      body.innerHTML = '';
      if (empty) empty.style.display = 'flex';
      if (footer) footer.hidden = true;
    } else {
      if (empty) empty.style.display = 'none';
      if (footer) footer.hidden = false;
      
      body.innerHTML = this.items.map(item => `
        <div class="cart-item" data-cart-id="${item.cartId}">
          <div class="cart-item__img-placeholder">${item.emoji || '👟'}</div>
          <div class="cart-item__info">
            <span class="cart-item__name">${item.name}</span>
            <span class="cart-item__price">$${(item.price * (item.qty || 1)).toFixed(2)}</span>
            <div class="cart-item__qty">
              <button class="cart-item__qty-btn" onclick="Cart.updateQty(${item.cartId}, ${(item.qty||1)-1})" aria-label="Restar cantidad">−</button>
              <span class="cart-item__qty-num">${item.qty || 1}</span>
              <button class="cart-item__qty-btn" onclick="Cart.updateQty(${item.cartId}, ${(item.qty||1)+1})" aria-label="Sumar cantidad">+</button>
            </div>
          </div>
          <button class="cart-item__remove" onclick="Cart.remove(${item.cartId})" aria-label="Eliminar ${item.name}">&times;</button>
        </div>
      `).join('');
    }

    if (totalEl) totalEl.textContent = `$${this.total.toFixed(2)}`;
  },

  openDrawer() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      overlay?.classList.add('is-open');
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('cartDrawerClose')?.focus(), 300);
    }
  },

  closeDrawer() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      overlay?.classList.remove('is-open');
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  },

  initButtons() {
    // Botones de abrir/cerrar
    document.querySelector('.cart-btn')?.addEventListener('click', () => this.openDrawer());
    document.getElementById('cartDrawerClose')?.addEventListener('click', () => this.closeDrawer());
    document.getElementById('cartOverlay')?.addEventListener('click', () => this.closeDrawer());
    
    // Botones de "Agregar al carrito"
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.productId || btn.dataset.product?.replace(/\s/g, '-').toLowerCase() || String(Date.now());
        const name = btn.dataset.productName || btn.dataset.product || 'Producto';
        const price = parseFloat(btn.dataset.productPrice || btn.dataset.price) || 0;
        const emojis = { Running: '🏃', Lifestyle: '✨', Trail: '⛰️', Training: '💪', Court: '🏀' };
        const emoji = emojis[btn.dataset.category] || '👟';

        this.add({ id, name, price, emoji });

        // Efecto visual en el botón
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => btn.style.transform = '', 200);
      });
    });

    // Checkout
    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      trackEvent('begin_checkout', {
        currency: 'USD',
        value: this.total,
        items: this.items.map(i => ({ item_name: i.name, quantity: i.qty, price: i.price }))
      });
      alert('Redirigiendo a pasarela de pago...');
    });
  }
};

window.Cart = Cart; // Exponer globalmente para los onclick inline del renderDrawer

/* ============ 7. TOAST (Reemplazado por sistema Toast) ============ */


/* ============ 8. NEWSLETTER ============ */
const initNewsletter = () => {
  const form = $('#newsletterForm');
  const success = $('#newsletterSuccess');
  if (!form) return;
  on(form, 'submit', (e) => {
    e.preventDefault();
    const emailInput = $('#emailInput');
    const email = emailInput?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput.style.borderColor = '#f43f5e';
      emailInput.focus();
      setTimeout(() => emailInput.style.borderColor = '', 2000);
      return;
    }
    trackEvent('sign_up', { method: 'newsletter' });
    const btn = form.querySelector('.newsletter__submit');
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    setTimeout(() => {
      if (success) { success.hidden = false; success.focus(); }
      form.reset();
      btn.textContent = '¡Suscrita! 💕';
      btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
    }, 1200);
  });
};

/* ============ 9. CHATBOT ============ */
const CHATBOT_KB = [
  {
    keywords: ['hola', 'buenas', 'hey', 'saludos'],
    responses: ['¡Hola! 👋 Bienvenida a Dayanadaysfashion 👗 ¿En qué te puedo ayudar?', '¡Hola! Qué alegría que estés acá 💕 ¿En qué te ayudo hoy?']
  },
  {
    keywords: ['envio', 'envío', 'entrega', 'shipping', 'llegar', 'demora', 'tiempo'],
    responses: ['📦 Tienda física en Mérida y enviamos a toda Venezuela. Entregas en Mérida: 1-2 días. Resto del país: 2-5 días. ¡Envío gratis en pedidos +$100 USD! 🚚', '🚚 ¡Enviamos a donde estés en Venezuela! El tracking llega por email y WhatsApp una vez despachado.']
  },
  {
    keywords: ['precio', 'costo', 'cuanto', 'vale', 'cuesta', 'oferta', 'descuento'],
    responses: ['💰 Precios desde $45 hasta $230 USD. Tenemos promos de hasta 20% OFF. ¿Tenés un presupuesto en mente? 💕', '🏷️ Tenemos opciones para todos. ¿Buscás calzado, ropa o accesorios?']
  },
  {
    keywords: ['talla', 'talle', 'numero', 'medida', 'size'],
    responses: ['📏 Usamos talles internacionales (XS, S, M, L, XL) y numéricos para calzado. ¡Escribime tus medidas y te ayudo a elegir!', '👗 Para ropa medís busto, cintura y cadera. Para calzado medís el pie. ¿Cuál es tu medida?']
  },
  {
    keywords: ['devolucion', 'devolución', 'cambio', 'reembolso', 'garantia'],
    responses: ['🔄 30 días para cambios sin drama. El producto debe estar sin uso con etiquetas. Iniciamos el cambio por WhatsApp. ¿Qué necesitás cambiar?', '✅ ¡Política flexible! Cambio de talle, devolución por defecto, lo que necesites. Escribinos a hola@dayanadaysfashion.shop']
  },
  {
    keywords: ['coleccion', 'colección', 'nuevo', 'nueva', 'tendencia', 'novedad'],
    responses: ['✨ ¡La colección 2027 ya está! Nuevos modelos, sets coordinados y accesorios. Suscribite al newsletter para ser la primera en verlos 💌', '🔥 Esta temporada: colores vibrantes, materiales premium y looks que combinan comodidad con tendencia. ¿Qué tipo de prenda buscás?']
  },
  {
    keywords: ['pedido', 'rastrear', 'tracking', 'seguimiento', 'donde esta'],
    responses: ['📦 Para rastrear necesito tu número de orden (lo enviamos por email). También podés escribirnos por WhatsApp con tu nombre y te chequeamos al instante.', '🔍 El tracking llega por email en 24hs de despachado. ¿No lo encontrás? Revisá spam o escribinos.']
  },
  {
    keywords: ['pago', 'tarjeta', 'paypal', 'mercado pago', 'mp', 'cuotas', 'transferencia'],
    responses: ['💳 Aceptamos Mercado Pago (hasta 12 cuotas sin interés), transferencia, PayPal y criptomonedas. ¿Con qué método querés pagar?']
  },
  {
    keywords: ['agente', 'humano', 'persona', 'soporte', 'whatsapp', 'contacto'],
    responses: ['💬 ¡Te paso con el equipo! Horario: Lun-Sáb 9hs-20hs (VET). Email: hola@dayanadaysfashion.shop o seguinos como @dayanadaysfashion 💕']
  },
];

const GENERIC = [
  'Para esa consulta te recomiendo escribirnos a hola@dayanadaysfashion.shop ¡Respondemos rápido! 💕',
  '¡No quiero darte información incorrecta! 😅 Usá los botones de arriba o escribinos directamente.',
  '¡Tu equipo de Dayanadaysfashion te responde mejor esa pregunta! 💌 hola@dayanadaysfashion.shop',
];

const getBotResponse = (msg) => {
  const norm = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const e of CHATBOT_KB) {
    if (e.keywords.some(k => norm.includes(k))) return e.responses[Math.floor(Math.random() * e.responses.length)];
  }
  return GENERIC[Math.floor(Math.random() * GENERIC.length)];
};

const initChatbot = () => {
  const toggle = $('#chatToggle');
  const win = $('#chatWindow');
  const closeBtn = $('#chatClose');
  const msgs = $('#chatMessages');
  const form = $('#chatForm');
  const input = $('#chatInput');
  const qr = $('#quickReplies');
  const notif = $('#chatNotification');
  const openIcon = toggle?.querySelector('.chat-toggle__icon--open');
  const closeIcon = toggle?.querySelector('.chat-toggle__icon--close');

  if (!toggle || !win) return;
  let isOpen = false, greeted = false;

  const addMsg = (text, type) => {
    const el = document.createElement('div');
    el.className = `chat-bubble chat-bubble--${type}`;
    el.textContent = text;
    msgs?.appendChild(el);
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  };

  const botReply = (text, delay = 900) => {
    const t = document.createElement('div');
    t.className = 'typing-indicator'; t.id = 'typingIndicator';
    t.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    msgs?.appendChild(t);
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => { document.getElementById('typingIndicator')?.remove(); addMsg(text, 'bot'); }, delay);
  };

  const sendUser = (text) => {
    if (!text.trim()) return;
    addMsg(text, 'user');
    if (qr) qr.style.display = 'none';
    trackEvent('chat_message', { message_text: text.substring(0, 50) });
    botReply(getBotResponse(text));
  };

  const openChat = () => {
    isOpen = true;
    win.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (openIcon) openIcon.hidden = true;
    if (closeIcon) closeIcon.hidden = false;
    if (notif) notif.style.display = 'none';
    if (!greeted) { greeted = true; setTimeout(() => botReply('¡Hola! 👋 Bienvenida a Dayanadaysfashion 👗 ¿En qué te puedo ayudar hoy?', 400), 200); }
    setTimeout(() => input?.focus(), 400);
    trackEvent('chat_open', { trigger: 'toggle_button' });
  };

  const closeChat = () => {
    isOpen = false;
    win.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (openIcon) openIcon.hidden = false;
    if (closeIcon) closeIcon.hidden = true;
    toggle.focus();
  };

  on(toggle, 'click', () => isOpen ? closeChat() : openChat());
  on(closeBtn, 'click', closeChat);
  on(form, 'submit', (e) => {
    e.preventDefault();
    const msg = input?.value?.trim();
    if (!msg) return;
    sendUser(msg);
    input.value = '';
    input.focus();
  });
  $$('.quick-reply-btn').forEach(btn => on(btn, 'click', () => btn.dataset.message && sendUser(btn.dataset.message)));
  on(document, 'keydown', (e) => { if (e.key === 'Escape' && isOpen) closeChat(); });
  setTimeout(() => { if (!isOpen && notif) notif.style.display = 'flex'; }, 5000);
};

/* ============ CLICK TRACKING + SCROLL DEPTH ============ */
const initClickTracking = () => {
  $$('.category-card').forEach(card => {
    on(card, 'click', () => {
      const label = card.querySelector('.category-card__label')?.textContent?.trim();
      trackEvent('select_content', { content_type: 'category', content_id: label });
    });
  });
  $$('.hero__actions .btn').forEach(btn => {
    on(btn, 'click', () => trackEvent('cta_click', { cta_text: btn.textContent?.trim(), cta_location: 'hero' }));
  });
  const depths = [25, 50, 75, 100];
  const tracked = new Set();
  on(window, 'scroll', debounce(() => {
    const pct = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
    depths.forEach(d => {
      if (pct >= d && !tracked.has(d)) { tracked.add(d); trackEvent('scroll_depth', { depth_percentage: d }); }
    });
  }, 200), { passive: true });
};

/* ============ 12. UTILIDADES FINALES ============ */
const initFinalUtils = () => {
  // Año dinámico en footer
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth scroll para links de ancla (Nativo)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '72');
        window.scrollTo({ 
          top: target.offsetTop - hh, 
          behavior: 'smooth' 
        });
      }
    });
  });

  // Lazy load de imágenes con fallback
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
      img.classList.add('img-error');
    });
  });
};

/* ============ INIT ============ */
document.addEventListener('DOMContentLoaded', () => {
  console.log('%cDayanadaysfashion 2027', 'font-size:20px;font-weight:bold;color:#7c3aed;');
  console.log('%cdayanadaysfashion.shop - Con amor', 'color:#f43f5e;font-size:11px;');

  initHeaderScroll();
  Toast.init();
  Cart.init();
  Wishlist.init();
  initMobileMenu();
  initProductsSwiper();
  initScrollReveal();
  initNewsletter();
  initChatbot();
  initClickTracking();
  initFinalUtils();
  trackEvent('page_view', { page_title: document.title, page_location: window.location.href });
});

/*
  PARA ACTIVAR GOOGLE ANALYTICS 4 — pegar en el <head> de index.html:

  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('js',new Date());
    gtag('config','G-XXXXXXXXXX');
  </script>

  (Reemplazar G-XXXXXXXXXX con tu Measurement ID real)

  EVENTOS QUE SE TRACKEAN AUTOMATICAMENTE:
  page_view, add_to_cart, remove_from_cart, view_cart,
  begin_checkout, sign_up, select_content, cta_click,
  scroll_depth (25/50/75/100%), chat_open, chat_message,
  carousel_navigate
*/
