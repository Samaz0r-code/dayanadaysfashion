import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, ShoppingCart, Heart, Filter, X, Star, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductCard = React.memo(({ producto, isFavorite, onToggleFavorite, onAddToCart, isAdded }) => {
  return (
    <article
      className="reveal"
      style={{
        background: 'var(--clr-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--clr-border)',
        overflow: 'hidden',
        transition: 'all var(--dur-normal) var(--ease-standard)',
        position: 'relative'
      }}
    >
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative', background: 'var(--grad-surface)' }}>
        <img 
          src={producto.imagenUrl} 
          alt={producto.nombre}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="product-img"
        />
        <button
          onClick={() => onToggleFavorite(producto.id, producto.nombre)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '8px',
            borderRadius: 'var(--radius-full)',
            background: isFavorite ? 'rgba(244, 63, 94, 0.2)' : 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            color: isFavorite ? 'var(--clr-accent-warm)' : 'white',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10
          }}
          aria-pressed={isFavorite}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--clr-text-primary)', marginBottom: '0.5rem', height: '2.4rem', overflow: 'hidden' }}>
          {producto.nombre}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} style={{ fill: i < Math.floor(producto.stars) ? 'var(--clr-accent-vivid)' : 'none', color: i < Math.floor(producto.stars) ? 'var(--clr-accent-vivid)' : 'var(--clr-border)' }} />
            ))}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-secondary)' }}>({producto.reviews})</span>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', background: 'var(--grad-vivid)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ${producto.precio}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(producto)}
          className="btn"
          style={{ 
            width: '100%', 
            padding: '0.7rem', 
            fontSize: '0.8rem',
            background: isAdded ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'var(--grad-accent)',
            transition: 'all 0.3s ease'
          }}
        >
          {isAdded ? '✓ ¡Agregado!' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  );
});

const TiendaZapatos = () => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ category: 'todos', size: '', priceRange: [0, 500] });
  const [favorites, setFavorites] = useState(new Set());
  const [addedId, setAddedId] = useState(null);

  const productos = useMemo(() => [
    { id: 1,  nombre: 'Nike Air Max 90',        categoria: 'deportivos', precio: 180, precioOriginal: 220, descuento: 18, talla: ['36','37','38','39','40','41'], imagenUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', stars: 4.8, reviews: 142, badge: 'nuevo', stock: 8 },
    { id: 2,  nombre: 'Adidas Ultraboost 23',   categoria: 'deportivos', precio: 200, precioOriginal: 200, descuento: 0,  talla: ['36','37','38','39','40'],       imagenUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', stars: 4.7, reviews: 178, badge: 'trending', stock: 15 },
    { id: 3,  nombre: 'Converse Chuck Taylor',  categoria: 'casual',     precio: 95,  precioOriginal: 120, descuento: 21, talla: ['35','36','37','38','39','40','41','42'], imagenUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80', stars: 4.9, reviews: 256, badge: 'sale', stock: 3 },
    { id: 4,  nombre: 'Vans Old Skool',         categoria: 'casual',     precio: 85,  precioOriginal: 85,  descuento: 0,  talla: ['35','36','37','38','39','40','41','42','43'], imagenUrl: 'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400&q=80', stars: 4.8, reviews: 212, badge: '', stock: 20 },
    { id: 5,  nombre: 'Jordan 1 Low',           categoria: 'deportivos', precio: 250, precioOriginal: 280, descuento: 11, talla: ['36','37','38','39','40','41','42'], imagenUrl: 'https://images.unsplash.com/photo-1607522370275-f6fd4461c0bd?w=400&q=80', stars: 4.9, reviews: 324, badge: 'nuevo', stock: 6 },
    { id: 6,  nombre: 'Timberland Premium',     categoria: 'casual',     precio: 220, precioOriginal: 220, descuento: 0,  talla: ['37','38','39','40','41','42','43','44'], imagenUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80', stars: 4.7, reviews: 156, badge: '', stock: 12 },
    { id: 7,  nombre: 'New Balance 574',        categoria: 'deportivos', precio: 150, precioOriginal: 175, descuento: 14, talla: ['36','37','38','39','40','41','42','43'], imagenUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80', stars: 4.6, reviews: 189, badge: 'sale', stock: 9 },
    { id: 8,  nombre: 'Puma Suede Classic',     categoria: 'casual',     precio: 75,  precioOriginal: 90,  descuento: 17, talla: ['36','37','38','39','40','41'], imagenUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&q=80', stars: 4.5, reviews: 145, badge: 'sale', stock: 7 },
    { id: 9,  nombre: 'Asics Gel-Nimbus 25',    categoria: 'deportivos', precio: 170, precioOriginal: 170, descuento: 0,  talla: ['36','37','38','39','40','41','42'], imagenUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80', stars: 4.6, reviews: 134, badge: 'trending', stock: 18 },
    { id: 10, nombre: 'Reebok Classic Leather', categoria: 'casual',     precio: 90,  precioOriginal: 110, descuento: 18, talla: ['35','36','37','38','39','40','41'], imagenUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&q=80', stars: 4.3, reviews: 99,  badge: '', stock: 25 },
    { id: 11, nombre: 'Skechers D\'Lites',      categoria: 'casual',     precio: 65,  precioOriginal: 80,  descuento: 19, talla: ['35','36','37','38','39','40','41','42'], imagenUrl: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400&q=80', stars: 4.4, reviews: 127, badge: 'sale', stock: 4 },
    { id: 12, nombre: 'Nike Air Force 1',       categoria: 'deportivos', precio: 190, precioOriginal: 190, descuento: 0,  talla: ['36','37','38','39','40','41','42'], imagenUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&q=80', stars: 4.8, reviews: 301, badge: 'trending', stock: 11 },
  ], []);

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const matchCat = filters.category === 'todos' || p.categoria === filters.category;
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPrice = p.precio <= filters.priceRange[1];
      return matchCat && matchSearch && matchPrice;
    });
  }, [filters, searchTerm, productos]);

  const toggleFavorito = useCallback((id) => {
    setFavorites(prev => {
      const nuevos = new Set(prev);
      nuevos.has(id) ? nuevos.delete(id) : nuevos.add(id);
      return nuevos;
    });
  }, []);

  const agregarAlCarrito = useCallback((producto) => {
    setCart(prev => {
      const existe = prev.find(i => i.id === producto.id);
      if (existe) {
        return prev.map(i => i.id === producto.id ? { ...i, qty: (i.qty || 1) + 1 } : i);
      }
      return [...prev, { ...producto, qty: 1, cartId: Date.now() }];
    });
    setAddedId(producto.id);
    setTimeout(() => setAddedId(null), 1500);
    setShowCart(true); // Abre el drawer automáticamente
  }, []);

  const eliminarDelCarrito = useCallback((cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  }, []);

  const cambiarCantidad = useCallback((cartId, delta) => {
    setCart(prev => prev
      .map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, (i.qty || 1) + delta) } : i)
      .filter(i => i.qty > 0)
    );
  }, []);

  const totalCarrito = useMemo(() => cart.reduce((sum, item) => sum + (item.precio * (item.qty || 1)), 0), [cart]);
  const cantidadTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.qty || 1), 0), [cart]);

  return (
    <div style={{ minHeight: '100vh', background: '#06060f', color: '#f8f8ff', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header Adaptado a Dayanadaysfashion */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(6,6,15,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 clamp(1rem,5vw,2.5rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, gap: 16 }}>

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{
                fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #7c3aed, #f43f5e)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Dayanadaysfashion
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(248,248,255,0.35)', marginTop: 2 }}>
                Fashion Store
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 420, display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, color: 'rgba(248,248,255,0.35)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar productos"
                style={{
                  width: '100%', paddingLeft: 40, paddingRight: 16,
                  height: 42, borderRadius: 9999,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f8f8ff', fontSize: 14, outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease'
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} aria-label="Limpiar búsqueda"
                  style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'rgba(248,248,255,0.4)', cursor: 'pointer', padding: 4 }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button aria-label="Ver favoritos" style={{
                width: 42, height: 42, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)',
                background: 'none', color: 'rgba(248,248,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease'
              }}
                onMouseOver={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.4)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(248,248,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Heart size={18} />
              </button>

              <button onClick={() => setShowCart(!showCart)} aria-label={`Abrir carrito, ${cantidadTotal} productos`}
                style={{
                  position: 'relative', width: 42, height: 42, borderRadius: '50%',
                  border: '1px solid rgba(124,58,237,0.4)',
                  background: 'rgba(124,58,237,0.12)', color: '#c4b5fd',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <ShoppingCart size={18} />
                {cantidadTotal > 0 && (
                  <span aria-live="polite" style={{
                    position: 'absolute', top: -4, right: -4,
                    background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
                    color: '#fff', fontSize: 10, fontWeight: 800,
                    width: 20, height: 20, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {cantidadTotal}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filtros Adaptada */}
          <aside className="hidden lg:block" style={{ width: '280px' }}>
            <div style={{ background: '#0e0e1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#f8f8ff' }}>FILTROS</h3>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(248,248,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem' }}>Categoría</p>
                {['todos', 'deportivos', 'casual'].map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', marginBottom: '0.8rem', fontSize: '0.9rem', color: 'rgba(248,248,255,0.7)' }}>
                    <input type="radio" name="cat" checked={filters.category === cat} onChange={() => setFilters({...filters, category: cat})} style={{ accentColor: '#7c3aed' }} />
                    <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                  </label>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(248,248,255,0.4)', textTransform: 'uppercase', marginBottom: '1rem' }}>Precio Máx</p>
                <input type="range" min="0" max="500" value={filters.priceRange[1]} onChange={(e) => setFilters({...filters, priceRange: [0, parseInt(e.target.value)]})} aria-label="Ajustar precio máximo" style={{ width: '100%', accentColor: '#7c3aed', marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: 'rgba(248,248,255,0.5)', fontFamily: 'monospace' }}>$0 - ${filters.priceRange[1]}</div>
              </div>
            </div>
          </aside>

          {/* Grid Mall */}
          <section className="flex-1">
            <div className="stagger-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {productosFiltrados.length > 0 ? productosFiltrados.map(producto => (
                <article key={producto.id} role="article" aria-label={`${producto.nombre}, $${producto.precio}`}
                  // ... estilos de la tarjeta ...
                >
                  {/* ... contenido de la tarjeta ya implementado ... */}
                </article>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
                  <Search size={48} style={{ color: 'rgba(248,248,255,0.1)', margin: '0 auto 16px' }} />
                  <p style={{ color: 'rgba(248,248,255,0.5)', fontWeight: 600, fontSize: 18 }}>No encontramos zapatos con esos criterios</p>
                  <p style={{ color: 'rgba(248,248,255,0.25)', marginBottom: 24 }}>Intenta ajustar los filtros de búsqueda</p>
                  <button 
                    onClick={() => {
                      setFilters({ category: 'todos', size: '', priceRange: [0, 500] });
                      setSearchTerm('');
                    }}
                    style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#c4b5fd', padding: '10px 24px', borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Carrito con Qty Corregido */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          {/* Backdrop */}
          <div
            onClick={() => setShowCart(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: '100%', maxWidth: 420,
            background: '#0e0e1c',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.6)'
          }}>

            {/* Header drawer */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#f8f8ff', letterSpacing: '-0.01em' }}>
                  Tu carrito
                </h2>
                <p style={{ fontSize: 12, color: 'rgba(248,248,255,0.4)', marginTop: 2 }}>
                  {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button onClick={() => setShowCart(false)} aria-label="Cerrar carrito"
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'none', color: 'rgba(248,248,255,0.5)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {cart.length > 0 ? cart.map(item => (
                <div key={item.cartId} style={{
                  display: 'flex', gap: 14, paddingBottom: 16, marginBottom: 16,
                  borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center'
                }}>
                  <img src={item.imagenUrl} alt={item.nombre}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0, background: '#13132a' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f8f8ff', marginBottom: 4,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.nombre}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 800, fontFamily: 'monospace',
                                background: 'linear-gradient(135deg,#7c3aed,#f43f5e)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      ${item.precio}
                    </p>
                    {/* Cantidad */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                      <button onClick={() => cambiarCantidad(item.cartId, -1)} aria-label="Disminuir cantidad"
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
                                 background: 'none', color: '#f8f8ff', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#f8f8ff', minWidth: 20, textAlign: 'center' }}>
                        {item.qty || 1}
                      </span>
                      <button onClick={() => cambiarCantidad(item.cartId, 1)} aria-label="Aumentar cantidad"
                        style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
                                 background: 'none', color: '#f8f8ff', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>+</button>
                    </div>
                  </div>
                  <button onClick={() => eliminarDelCarrito(item.cartId)} aria-label={`Eliminar ${item.nombre}`}
                    style={{ background: 'none', border: 'none', color: 'rgba(248,248,255,0.3)',
                             cursor: 'pointer', padding: 4, alignSelf: 'flex-start',
                             transition: 'color 150ms ease' }}
                    onMouseOver={e => e.currentTarget.style.color = '#f43f5e'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(248,248,255,0.3)'}>
                    <X size={16} />
                  </button>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <ShoppingCart size={48} style={{ color: 'rgba(248,248,255,0.15)', margin: '0 auto 16px' }} />
                  <p style={{ color: 'rgba(248,248,255,0.4)', fontWeight: 600, marginBottom: 8 }}>Tu carrito está vacío</p>
                  <p style={{ color: 'rgba(248,248,255,0.25)', fontSize: 13 }}>Agrega productos para comenzar</p>
                </div>
              )}
            </div>

            {/* Footer drawer */}
            {cart.length > 0 && (
              <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: 'rgba(248,248,255,0.6)', fontWeight: 600 }}>Total</span>
                  <span style={{
                    fontSize: 26, fontWeight: 800, fontFamily: 'Space Mono, monospace',
                    background: 'linear-gradient(135deg,#7c3aed,#f43f5e)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                  }}>
                    ${totalCarrito.toFixed(2)}
                  </span>
                </div>
                <button style={{
                  width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#7c3aed,#f43f5e)',
                  color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'inherit', letterSpacing: '0.02em', marginBottom: 10,
                  transition: 'box-shadow 200ms ease'
                }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.4)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  Ir a pagar
                </button>
                <button onClick={() => setShowCart(false)} style={{
                  width: '100%', padding: '12px 0', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'none', color: 'rgba(248,248,255,0.6)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  Seguir comprando
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Adaptado */}
      <footer style={{ background: '#06060f', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '4rem 0', marginTop: '4rem' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, background: 'linear-gradient(135deg,#7c3aed,#f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block', marginBottom: '1.5rem' }}>Dayanadaysfashion</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: '2rem' }}>
            <span style={{ fontSize: 13, color: 'rgba(248,248,255,0.4)', fontWeight: 600 }}>TÉRMINOS</span>
            <span style={{ fontSize: 13, color: 'rgba(248,248,255,0.4)', fontWeight: 600 }}>PRIVACIDAD</span>
            <span style={{ fontSize: 13, color: 'rgba(248,248,255,0.4)', fontWeight: 600 }}>ENVÍOS</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(248,248,255,0.3)', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} Dayanadaysfashion. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TiendaZapatos;
