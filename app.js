/* =====================================================
   PUNTO SUR SURESTE - JAVASCRIPT PRINCIPAL
   Conexión con el Worker de Cloudflare
   ===================================================== */

// Configuración - CAMBIAR POR TU URL DEL WORKER
const API_URL = 'https://puntosur.vinceremx.workers.dev';

// =====================================================
// UTILIDADES
// =====================================================

function formatearFecha(timestamp) {
  if (!timestamp) return '';
  const fecha = new Date(timestamp);
  const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
  return fecha.toLocaleDateString('es-MX', opciones);
}

function formatearFechaCorta(timestamp) {
  if (!timestamp) return '';
  const fecha = new Date(timestamp);
  const opciones = { day: 'numeric', month: 'short' };
  return fecha.toLocaleDateString('es-MX', opciones);
}

function truncarTexto(texto, maxLength) {
  if (!texto) return '';
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength).trim() + '...';
}

function obtenerImagenPorDefecto() {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23E5E5E5" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin imagen%3C/text%3E%3C/svg%3E';
}

// =====================================================
// API - CONSUMO DEL WORKER
// =====================================================

async function obtenerNoticias(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.categoria) queryParams.append('categoria', params.categoria);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    
    const url = `${API_URL}/api/noticias?${queryParams.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Error al cargar noticias');
    
    const data = await response.json();
    return data.articulos || data || [];
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    return [];
  }
}

async function obtenerNoticia(id) {
  try {
    const response = await fetch(`${API_URL}/api/noticia?id=${id}`);
    if (!response.ok) throw new Error('Noticia no encontrada');
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo noticia:', error);
    return null;
  }
}

// =====================================================
// RENDERIZADO DE COMPONENTES
// =====================================================

function renderizarNoticiaPrincipal(noticia) {
  if (!noticia) return '';
  
  const imagen = noticia.imgurl || noticia.img_small || obtenerImagenPorDefecto();
  const categoria = noticia.categoria || 'General';
  const titulo = noticia.titulo || 'Sin título';
  const resumen = noticia.resumen || '';
  const autor = noticia.autor || 'Redacción Punto Sur Sureste';
  const fecha = formatearFecha(noticia.timestamp);
  
  return `
    <a href="noticia.html?id=${noticia.id}" class="noticia-principal-link">
      <div class="noticia-principal-imagen">
        <img src="${imagen}" alt="${titulo}" onerror="this.src='${obtenerImagenPorDefecto()}'">
        <span class="noticia-categoria">${categoria}</span>
      </div>
      <div class="noticia-principal-contenido">
        <h1 class="noticia-principal-titulo">${titulo}</h1>
        ${resumen ? `<p class="noticia-principal-resumen">${truncarTexto(resumen, 200)}</p>` : ''}
        <div class="noticia-meta">
          <span class="noticia-autor">${autor}</span>
          <span class="noticia-fecha">${fecha}</span>
        </div>
      </div>
    </a>
  `;
}

function renderizarNoticiaSecundaria(noticia) {
  if (!noticia) return '';
  
  const imagen = noticia.img_small || noticia.imgurl || obtenerImagenPorDefecto();
  const categoria = noticia.categoria || 'General';
  const titulo = noticia.titulo || 'Sin título';
  
  return `
    <article class="noticia-secundaria">
      <a href="noticia.html?id=${noticia.id}" style="display: flex; gap: 16px; width: 100%;">
        <div class="noticia-secundaria-imagen">
          <img src="${imagen}" alt="${titulo}" onerror="this.src='${obtenerImagenPorDefecto()}'">
        </div>
        <div class="noticia-secundaria-contenido">
          <span class="noticia-secundaria-categoria">${categoria}</span>
          <h3 class="noticia-secundaria-titulo">${titulo}</h3>
        </div>
      </a>
    </article>
  `;
}

function renderizarNoticiaLista(noticia) {
  if (!noticia) return '';
  
  const imagen = noticia.img_small || noticia.imgurl || obtenerImagenPorDefecto();
  const titulo = noticia.titulo || 'Sin título';
  const fecha = formatearFechaCorta(noticia.timestamp);
  
  return `
    <article class="noticia-lista-item">
      <a href="noticia.html?id=${noticia.id}" style="display: flex; gap: 12px; width: 100%;">
        <div class="noticia-lista-imagen">
          <img src="${imagen}" alt="${titulo}" onerror="this.src='${obtenerImagenPorDefecto()}'">
        </div>
        <div class="noticia-lista-contenido">
          <h3 class="noticia-lista-titulo">${titulo}</h3>
          <span class="noticia-lista-fecha">${fecha}</span>
        </div>
      </a>
    </article>
  `;
}

// =====================================================
// PÁGINA PRINCIPAL (INDEX)
// =====================================================

async function cargarPortada() {
  // Cargar noticia principal (la más reciente con esprincipal = 1)
  const principales = await obtenerNoticias({ limit: 1, tipo: 'principal' });
  const principal = principales[0];
  
  const contenedorPrincipal = document.getElementById('noticiaPrincipal');
  if (contenedorPrincipal && principal) {
    contenedorPrincipal.innerHTML = renderizarNoticiaPrincipal(principal);
  }
  
  // Cargar noticias secundarias (las siguientes más recientes)
  const secundarias = await obtenerNoticias({ limit: 4, offset: 0 });
  // Filtrar la principal si está incluida
  const sinPrincipal = secundarias.filter(n => n.id !== (principal?.id));
  const dosSecundarias = sinPrincipal.slice(0, 2);
  
  const contenedorSecundarias = document.getElementById('noticiasSecundarias');
  if (contenedorSecundarias) {
    contenedorSecundarias.innerHTML = dosSecundarias.map(renderizarNoticiaSecundaria).join('');
  }
}

async function cargarSeccion(categoria, contenedorId, limite = 3) {
  const noticias = await obtenerNoticias({ categoria, limit: limite });
  const contenedor = document.getElementById(contenedorId);
  
  if (contenedor) {
    if (noticias.length === 0) {
      contenedor.innerHTML = '<p class="empty-state">No hay noticias en esta sección</p>';
    } else {
      contenedor.innerHTML = noticias.map(renderizarNoticiaLista).join('');
    }
  }
}

async function inicializarPaginaPrincipal() {
  // Cargar portada
  await cargarPortada();
  
  // Cargar secciones en paralelo
  await Promise.all([
    cargarSeccion('sureste', 'noticiasRegion', 3),
    cargarSeccion('nacional', 'noticiasNacional', 3),
    cargarSeccion('seguridad', 'noticiasSeguridad', 3)
  ]);
}

// =====================================================
// PÁGINA DE CATEGORÍA
// =====================================================

async function inicializarPaginaCategoria() {
  const params = new URLSearchParams(window.location.search);
  const categoria = params.get('cat') || 'sureste';
  
  // Actualizar título de la página
  const tituloElemento = document.getElementById('tituloCategoria');
  if (tituloElemento) {
    const titulos = {
      'sureste': 'Sureste',
      'nacional': 'Nacional',
      'seguridad': 'Seguridad',
      'deportes': 'Deportes'
    };
    tituloElemento.textContent = titulos[categoria] || categoria;
    document.title = `${titulos[categoria] || categoria} | Punto Sur Sureste`;
  }
  
  // Cargar noticias de la categoría
  const noticias = await obtenerNoticias({ categoria, limit: 20 });
  const contenedor = document.getElementById('listaNoticias');
  
  if (contenedor) {
    if (noticias.length === 0) {
      contenedor.innerHTML = '<p class="empty-state">No hay noticias en esta categoría</p>';
    } else {
      contenedor.innerHTML = noticias.map(renderizarNoticiaLista).join('');
    }
  }
}

// =====================================================
// PÁGINA DE NOTICIA INDIVIDUAL
// =====================================================

async function inicializarPaginaNoticia() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id) {
    document.getElementById('contenidoNoticia').innerHTML = '<p class="empty-state">Noticia no encontrada</p>';
    return;
  }
  
  const noticia = await obtenerNoticia(id);
  
  if (!noticia) {
    document.getElementById('contenidoNoticia').innerHTML = '<p class="empty-state">Noticia no encontrada</p>';
    return;
  }
  
  // Actualizar título del documento
  document.title = `${noticia.titulo} | Punto Sur Sureste`;
  
  // Renderizar la noticia completa
  const imagen = noticia.imgurl || obtenerImagenPorDefecto();
  const categoria = noticia.categoria || 'General';
  const titulo = noticia.titulo || 'Sin título';
  const autor = noticia.autor || 'Redacción Punto Sur Sureste';
  const cargo = noticia.cargo || '';
  const fecha = formatearFecha(noticia.timestamp);
  const cuerpo = noticia.cuerpo || noticia.resumen || '';
  
  const html = `
    <article class="noticia-completa">
      <header class="noticia-header">
        <span class="noticia-categoria-badge">${categoria}</span>
        <h1 class="noticia-titulo-grande">${titulo}</h1>
        <div class="noticia-autor-info">
          <span class="noticia-autor-nombre">${autor}</span>
          ${cargo ? `<span class="noticia-autor-cargo">${cargo}</span>` : ''}
          <span class="noticia-fecha-publicacion">${fecha}</span>
        </div>
      </header>
      
      <figure class="noticia-imagen-principal">
        <img src="${imagen}" alt="${titulo}" onerror="this.src='${obtenerImagenPorDefecto()}'">
      </figure>
      
      <div class="noticia-cuerpo">
        ${formatearCuerpo(cuerpo)}
      </div>
    </article>
  `;
  
  document.getElementById('contenidoNoticia').innerHTML = html;
}

function formatearCuerpo(texto) {
  if (!texto) return '';
  // Convertir saltos de línea dobles en párrafos
  const parrafos = texto.split(/\n\n+/);
  return parrafos.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

// =====================================================
// MENÚ MÓVIL
// =====================================================

function inicializarMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic en un enlace
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar menú en todas las páginas
  inicializarMenu();
  
  // Detectar qué página es y cargar el contenido correspondiente
  const path = window.location.pathname;
  
  if (path.includes('categoria.html')) {
    inicializarPaginaCategoria();
  } else if (path.includes('noticia.html')) {
    inicializarPaginaNoticia();
  } else {
    // Página principal
    inicializarPaginaPrincipal();
  }
});
