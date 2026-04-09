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
  } catch (e) {
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
  } catch (e) {
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
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2364748b" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin imagen%3C/text%3E%3C/svg%3E';
}

// Obtener imagen con fallbacks - CORREGIDO para manejar todos los campos
function getImagen(articulo) {
  if (!articulo) return placeholderImg();
  
  // Intentar todos los posibles campos de imagen
  const url = articulo.img_url || articulo.imgurl || articulo.imgUrl || articulo.imagen || articulo.img_small || '';
  
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return placeholderImg();
  }
  
  return url.trim();
}

function getMiniatura(articulo) {
  if (!articulo) return placeholderImg();
  
  // Intentar miniatura primero, luego imagen principal
  const url = articulo.img_small || articulo.imgSmall || articulo.img_url || articulo.imgurl || articulo.imgUrl || articulo.imagen || '';
  
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return placeholderImg();
  }
  
  return url.trim();
}

// Manejar error de imagen
function handleImgError(img) {
  if (img) {
    img.onerror = null;
    img.src = placeholderImg();
  }
}

// Hacer funcion global
window.handleImgError = handleImgError;

// =====================================================
// API - CORREGIDO para manejar errores mejor
// =====================================================

async function fetchNoticias(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.categoria) query.append('categoria', params.categoria);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);
    
    const url = `${API_URL}/api/noticias?${query.toString()}`;
    console.log('[v0] Fetching noticias:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[v0] Error de red:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log('[v0] Noticias recibidas:', data);
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(data)) {
      return data;
    }
    
    return data.articulos || data.noticias || [];
  } catch (error) {
    console.error('[v0] Error obteniendo noticias:', error);
    return [];
  }
}

async function fetchNoticia(id) {
  try {
    if (!id) {
      console.error('[v0] ID no proporcionado');
      return null;
    }
    
    const url = `${API_URL}/api/noticia?id=${id}`;
    console.log('[v0] Fetching noticia:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[v0] Error de red:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log('[v0] Noticia recibida:', data);
    
    // Manejar diferentes formatos de respuesta
    return data.articulo || data.noticia || data || null;
  } catch (error) {
    console.error('[v0] Error obteniendo noticia:', error);
    return null;
  }
}

// =====================================================
// COMPONENTES DE RENDERIZADO
// =====================================================

function getCategoriaColor(cat) {
  const colores = {
    'sureste': '#B91C1C',
    'nacional': '#2563eb',
    'seguridad': '#dc2626',
    'deportes': '#059669'
  };
  return colores[cat?.toLowerCase()] || '#B91C1C';
}

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
        <span class="hero-cat" style="background: ${getCategoriaColor(cat)}">${cat}</span>
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
        <span class="news-card-cat" style="color: ${getCategoriaColor(cat)}">${cat}</span>
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
  console.log('[v0] Iniciando pagina principal');
  
  // Fecha
  const fechaEl = document.getElementById('fechaHoy');
  if (fechaEl) fechaEl.textContent = obtenerFechaHoy();
  
  // Cargar noticias principales
  const noticias = await fetchNoticias({ limit: 20 });
  console.log('[v0] Total noticias cargadas:', noticias.length);
  
  // Hero
  const heroSection = document.getElementById('heroSection');
  if (heroSection) {
    if (noticias.length === 0) {
      heroSection.innerHTML = '<div class="empty-state">No hay noticias disponibles. Publica desde el panel de administracion.</div>';
    } else {
      // Buscar noticia principal
      let principal = noticias.find(n => n.es_principal == 1 || n.esprincipal == 1 || n.esPrincipal == 1);
      if (!principal) principal = noticias[0];
      heroSection.innerHTML = renderHeroCard(principal);
    }
  }
  
  // Recientes (excluyendo la principal)
  const recientesEl = document.getElementById('noticiasRecientes');
  if (recientesEl) {
    const recientes = noticias.slice(1, 7);
    if (recientes.length === 0) {
      recientesEl.innerHTML = '<div class="empty-state">No hay mas noticias</div>';
    } else {
      recientesEl.innerHTML = recientes.map(renderNewsCard).join('');
    }
  }
  
  // Cargar secciones por categoria
  loadSection('sureste', 'noticiasSureste');
  loadSection('nacional', 'noticiasNacional');
  loadSection('seguridad', 'noticiasSeguridad');
  loadSection('deportes', 'noticiasDeportes');
}

async function loadSection(categoria, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  console.log('[v0] Cargando seccion:', categoria);
  const noticias = await fetchNoticias({ categoria, limit: 3 });
  console.log('[v0] Noticias para', categoria, ':', noticias.length);
  
  if (noticias.length === 0) {
    container.innerHTML = '<div class="empty-state">No hay noticias en esta seccion</div>';
  } else {
    container.innerHTML = noticias.map(renderNewsItem).join('');
  }
}

// =====================================================
// PAGINA CATEGORIA - CORREGIDO
// =====================================================

async function initCategoryPage() {
  console.log('[v0] Iniciando pagina de categoria');
  
  // Obtener categoria de la URL
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get('cat') || 'sureste';
  console.log('[v0] Categoria:', categoria);
  
  // Fecha
  const fechaEl = document.getElementById('fechaHoy');
  if (fechaEl) fechaEl.textContent = obtenerFechaHoy();
  
  const titulos = {
    'sureste': 'Sureste',
    'nacional': 'Nacional',
    'seguridad': 'Seguridad',
    'deportes': 'Deportes'
  };
  
  const colores = {
    'sureste': '#B91C1C',
    'nacional': '#2563eb',
    'seguridad': '#dc2626',
    'deportes': '#059669'
  };
  
  // Titulo de la pagina
  const tituloEl = document.getElementById('pageTitle');
  if (tituloEl) {
    const nombreCategoria = titulos[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
    const color = colores[categoria] || '#B91C1C';
    tituloEl.innerHTML = `<span class="page-title-badge" style="background: ${color}">${nombreCategoria}</span>`;
  }
  
  document.title = `${titulos[categoria] || categoria} | Sureste Claro`;
  
  // Marcar link activo en navegacion
  document.querySelectorAll('.nav-link, .menu-mobile-link').forEach(link => {
    link.classList.remove('active');
    if (link.href && link.href.includes(`cat=${categoria}`)) {
      link.classList.add('active');
    }
  });
  
  // Cargar noticias de la categoria
  const listEl = document.getElementById('newsList');
  if (!listEl) {
    console.error('[v0] Elemento newsList no encontrado');
    return;
  }
  
  const noticias = await fetchNoticias({ categoria, limit: 30 });
  console.log('[v0] Noticias de categoria cargadas:', noticias.length);
  
  if (noticias.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No hay noticias en esta categoria</div>';
  } else {
    listEl.innerHTML = noticias.map(renderCategoryItem).join('');
  }
}

// =====================================================
// PAGINA NOTICIA - CORREGIDO
// =====================================================

function formatearCuerpo(texto) {
  if (!texto) return '<p>Sin contenido disponible.</p>';
  
  // Dividir en parrafos
  const parrafos = texto.split(/\n\n+/).filter(p => p.trim());
  
  if (parrafos.length === 0) {
    return `<p>${texto.replace(/\n/g, '<br>')}</p>`;
  }
  
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

async function initArticlePage() {
  console.log('[v0] Iniciando pagina de articulo');
  
  // Fecha
  const fechaEl = document.getElementById('fechaHoy');
  if (fechaEl) fechaEl.textContent = obtenerFechaHoy();
  
  // Obtener ID de la URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  console.log('[v0] ID de noticia:', id);
  
  const container = document.getElementById('articleContent');
  if (!container) {
    console.error('[v0] Elemento articleContent no encontrado');
    return;
  }
  
  if (!id) {
    container.innerHTML = '<div class="empty-state">Noticia no encontrada. No se proporciono un ID valido.</div>';
    return;
  }
  
  // Mostrar estado de carga
  container.innerHTML = `
    <div class="article">
      <div class="article-header">
        <div class="skeleton" style="width: 80px; height: 24px; margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 40px; margin-bottom: 12px;"></div>
        <div class="skeleton" style="width: 200px; height: 20px;"></div>
      </div>
      <div class="skeleton skeleton-img"></div>
      <div style="padding: 24px;">
        <div class="skeleton" style="height: 20px; margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 20px; margin-bottom: 16px;"></div>
        <div class="skeleton" style="height: 20px; width: 80%;"></div>
      </div>
    </div>
  `;
  
  const noticia = await fetchNoticia(id);
  
  if (!noticia) {
    container.innerHTML = '<div class="empty-state">Noticia no encontrada. Es posible que haya sido eliminada o el enlace sea incorrecto.</div>';
    return;
  }
  
  console.log('[v0] Noticia cargada:', noticia.titulo);
  
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
        <span class="article-cat" style="background: ${getCategoriaColor(cat)}">${cat}</span>
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
// INICIALIZACION - CORREGIDO
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[v0] DOM cargado, iniciando app');
  
  // Siempre inicializar menu movil
  initMobileMenu();
  
  // Determinar que pagina estamos viendo
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  
  console.log('[v0] Pagina actual:', filename);
  
  if (filename === 'categoria.html' || filename.startsWith('categoria')) {
    initCategoryPage();
  } else if (filename === 'noticia.html' || filename.startsWith('noticia')) {
    initArticlePage();
  } else {
    // Pagina principal (index.html o raiz)
    initHomePage();
  }
});
