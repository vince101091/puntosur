/* =====================================================
   SURESTE CLARO - JavaScript Principal
   Conexion con Worker de Cloudflare
   ===================================================== */

const API_URL = 'https://puntosur.vinceremx.workers.dev';

// =====================================================
// UTILIDADES
// =====================================================

function formatearFecha(timestamp) {
  if (!timestamp) return '';
  try {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  } catch {
    return '';
  }
}

function formatearFechaCorta(timestamp) {
  if (!timestamp) return '';
  try {
    const fecha = new Date(timestamp);
    return fecha.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short' 
    });
  } catch {
    return '';
  }
}

function obtenerFechaHoy() {
  const fecha = new Date();
  const opciones = { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  let str = fecha.toLocaleDateString('es-MX', opciones);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Placeholder SVG como data URI
function placeholderImg() {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin imagen%3C/text%3E%3C/svg%3E';
}

// Obtener imagen con fallbacks
function getImagen(articulo) {
  if (!articulo) return placeholderImg();
  const url = articulo.img_url || articulo.imgurl || articulo.img_small || '';
  if (!url || url.trim() === '') return placeholderImg();
  return url;
}

function getMiniatura(articulo) {
  if (!articulo) return placeholderImg();
  const url = articulo.img_small || articulo.img_url || articulo.imgurl || '';
  if (!url || url.trim() === '') return placeholderImg();
  return url;
}

// Manejar error de imagen
function handleImgError(img) {
  img.onerror = null;
  img.src = placeholderImg();
}

// =====================================================
// API
// =====================================================

async function fetchNoticias(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.categoria) query.append('categoria', params.categoria);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    
    const url = `${API_URL}/api/noticias?${query.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Error de red:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.articulos || [];
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    return [];
  }
}

async function fetchNoticia(id) {
  try {
    if (!id) return null;
    
    const response = await fetch(`${API_URL}/api/noticia?id=${id}`);
    
    if (!response.ok) {
      console.error('Error de red:', response.status);
      return null;
    }
    
    const data = await response.json();
    return data.articulo || data || null;
  } catch (error) {
    console.error('Error obteniendo noticia:', error);
    return null;
  }
}

// =====================================================
// COMPONENTES DE RENDERIZADO
// =====================================================

function renderHeroCard(noticia) {
  if (!noticia) {
    return '<div class="empty-state">No hay noticias disponibles</div>';
  }
  
  const img = getImagen(noticia);
  const cat = noticia.categoria || 'General';
  const titulo = noticia.titulo || 'Sin titulo';
  const resumen = noticia.resumen || '';
  const autor = noticia.autor || 'Redaccion Sureste Claro';
  const fecha = formatearFecha(noticia.timestamp);
  
  return `
    <a href="noticia.html?id=${noticia.id}" class="hero-card">
      <div class="hero-img">
        <img src="${img}" alt="${titulo}" onerror="handleImgError(this)" loading="lazy">
      </div>
      <div class="hero-body">
        <span class="hero-cat">${cat}</span>
        <h1 class="hero-title">${titulo}</h1>
        ${resumen ? `<p class="hero-excerpt">${resumen}</p>` : ''}
        <div class="hero-meta">
          <span class="hero-author">${autor}</span>
          <span>${fecha}</span>
        </div>
      </div>
    </a>
  `;
}

function renderNewsCard(noticia) {
  if (!noticia) return '';
  
  const img = getMiniatura(noticia);
  const cat = noticia.categoria || 'General';
  const titulo = noticia.titulo || 'Sin titulo';
  const fecha = formatearFechaCorta(noticia.timestamp);
  
  return `
    <a href="noticia.html?id=${noticia.id}" class="news-card">
      <div class="news-card-img">
        <img src="${img}" alt="${titulo}" onerror="handleImgError(this)" loading="lazy">
      </div>
      <div class="news-card-body">
        <span class="news-card-cat">${cat}</span>
        <h3 class="news-card-title">${titulo}</h3>
        <span class="news-card-date">${fecha}</span>
      </div>
    </a>
  `;
}

function renderNewsItem(noticia) {
  if (!noticia) return '';
  
  const img = getMiniatura(noticia);
  const titulo = noticia.titulo || 'Sin titulo';
  const fecha = formatearFechaCorta(noticia.timestamp);
  
  return `
    <a href="noticia.html?id=${noticia.id}" class="news-item">
      <div class="news-item-img">
        <img src="${img}" alt="${titulo}" onerror="handleImgError(this)" loading="lazy">
      </div>
      <div class="news-item-body">
        <h3 class="news-item-title">${titulo}</h3>
        <span class="news-item-date">${fecha}</span>
      </div>
    </a>
  `;
}

function renderCategoryItem(noticia) {
  if (!noticia) return '';
  
  const img = getMiniatura(noticia);
  const titulo = noticia.titulo || 'Sin titulo';
  const resumen = noticia.resumen || '';
  const fecha = formatearFechaCorta(noticia.timestamp);
  
  return `
    <a href="noticia.html?id=${noticia.id}" class="category-item">
      <div class="category-item-img">
        <img src="${img}" alt="${titulo}" onerror="handleImgError(this)" loading="lazy">
      </div>
      <div class="category-item-body">
        <h3 class="category-item-title">${titulo}</h3>
        ${resumen ? `<p class="category-item-excerpt">${resumen}</p>` : ''}
        <span class="category-item-date">${fecha}</span>
      </div>
    </a>
  `;
}

// =====================================================
// PAGINA PRINCIPAL
// =====================================================

async function initHomePage() {
  // Fecha
  const fechaEl = document.getElementById('fechaHoy');
  if (fechaEl) fechaEl.textContent = obtenerFechaHoy();
  
  // Cargar noticias
  const noticias = await fetchNoticias({ limit: 20 });
  
  // Hero
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    if (noticias.length === 0) {
      heroSection.innerHTML = '<div class="empty-state">No hay noticias disponibles</div>';
    } else {
      let principal = noticias.find(n => n.es_principal == 1 || n.esprincipal == 1) || noticias[0];
      heroSection.innerHTML = renderHeroCard(principal);
    }
  }
  
  // Recientes
  const recientesEl = document.getElementById('noticiasRecientes');
  if (recientesEl) {
    const recientes = noticias.slice(1, 7);
    if (recientes.length === 0) {
      recientesEl.innerHTML = '<div class="empty-state">No hay mas noticias</div>';
    } else {
      recientesEl.innerHTML = recientes.map(renderNewsCard).join('');
    }
  }
  
  // Secciones
  loadSection('sureste', 'noticiasSureste');
  loadSection('nacional', 'noticiasNacional');
  loadSection('seguridad', 'noticiasSeguridad');
}

async function loadSection(categoria, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const noticias = await fetchNoticias({ categoria, limit: 3 });
  
  if (noticias.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay noticias en esta seccion</div>';
  } else {
    container.innerHTML = noticias.map(renderNewsItem).join('');
  }
}

// =====================================================
// PAGINA CATEGORIA
// =====================================================

async function initCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get('cat') || 'sureste';
  
  const titulos = {
    'sureste': 'Sureste',
    'nacional': 'Nacional',
    'seguridad': 'Seguridad',
    'deportes': 'Deportes'
  };
  
  // Titulo
  const tituloEl = document.getElementById('pageTitle');
  if (tituloEl) {
    tituloEl.textContent = titulos[categoria] || categoria;
  }
  document.title = `${titulos[categoria] || categoria} | Sureste Claro`;
  
  // Marcar link activo en nav
  document.querySelectorAll('.nav-link, .menu-mobile-link').forEach(link => {
    link.classList.remove('active');
    if (link.href && link.href.includes(`cat=${categoria}`)) {
      link.classList.add('active');
    }
  });
  
  // Cargar noticias
  const listEl = document.getElementById('newsList');
  if (!listEl) return;
  
  const noticias = await fetchNoticias({ categoria, limit: 20 });
  
  if (noticias.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No hay noticias en esta categoria</div>';
  } else {
    listEl.innerHTML = noticias.map(renderCategoryItem).join('');
  }
}

// =====================================================
// PAGINA NOTICIA
// =====================================================

function formatearCuerpo(texto) {
  if (!texto) return '';
  const parrafos = texto.split(/\n\n+/).filter(p => p.trim());
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

async function initArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  const container = document.getElementById('articleContent');
  if (!container) return;
  
  if (!id) {
    container.innerHTML = '<div class="empty-state">Noticia no encontrada</div>';
    return;
  }
  
  const noticia = await fetchNoticia(id);
  
  if (!noticia) {
    container.innerHTML = '<div class="empty-state">Noticia no encontrada</div>';
    return;
  }
  
  document.title = `${noticia.titulo || 'Noticia'} | Sureste Claro`;
  
  const img = getImagen(noticia);
  const cat = noticia.categoria || 'General';
  const titulo = noticia.titulo || 'Sin titulo';
  const autor = noticia.autor || 'Redaccion Sureste Claro';
  const cargo = noticia.cargo || '';
  const fecha = formatearFecha(noticia.timestamp);
  const cuerpo = noticia.cuerpo || noticia.resumen || '';
  
  container.innerHTML = `
    <article class="article">
      <header class="article-header">
        <span class="article-cat">${cat}</span>
        <h1 class="article-title">${titulo}</h1>
        <div class="article-meta">
          <span class="article-author">${autor}</span>
          ${cargo ? `<span>${cargo}</span>` : ''}
          <span>${fecha}</span>
        </div>
      </header>
      
      <div class="article-img">
        <img src="${img}" alt="${titulo}" onerror="handleImgError(this)">
      </div>
      
      <div class="article-content">
        ${formatearCuerpo(cuerpo)}
      </div>
    </article>
  `;
}

// =====================================================
// MENU MOVIL
// =====================================================

function initMobileMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menuMobile');
  const overlay = document.getElementById('menuOverlay');
  const closeBtn = document.getElementById('menuClose');
  
  if (!btn || !menu || !overlay) return;
  
  function openMenu() {
    menu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMenu() {
    menu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  btn.addEventListener('click', openMenu);
  overlay.addEventListener('click', closeMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  
  // Cerrar al hacer click en links
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// =====================================================
// INICIALIZACION
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  
  const path = window.location.pathname;
  
  if (path.includes('categoria.html')) {
    initCategoryPage();
  } else if (path.includes('noticia.html')) {
    initArticlePage();
  } else {
    initHomePage();
  }
});
