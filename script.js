// =============================
//  CONFIGURACIÓN
// =============================
const API_URL = 'http://localhost:3000/api';

// =============================
//  MENÚ MÓVIL
// =============================
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('active');
  menuBtn.setAttribute('aria-expanded', isOpen);
  
  // Cambiar icono
  const icon = menuBtn.querySelector('box-icon');
  icon.setAttribute('name', isOpen ? 'x' : 'menu');
});

// Cerrar menú al hacer clic en un enlace
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    const icon = menuBtn.querySelector('box-icon');
    icon.setAttribute('name', 'menu');
  });
});

// =============================
//  NOTICIAS DINÁMICAS DESDE API
// =============================
async function loadNews() {
  const newsContainer = document.getElementById('news-container');
  
  // Verificar que el contenedor existe
  if (!newsContainer) {
    console.error('❌ Contenedor de noticias no encontrado');
    return;
  }
  
  try {
    console.log('📰 Cargando noticias desde:', `${API_URL}/news`);
    
    // Mostrar loading
    newsContainer.innerHTML = '<div class="loading">Cargando noticias...</div>';
    
    // Obtener noticias desde el backend
    const response = await fetch(`${API_URL}/news`);
    
    console.log('📥 Respuesta:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const news = await response.json();
    console.log('📊 Noticias recibidas:', news.length);
    console.log('📋 Datos completos:', news);
    
    // Limpiar el contenedor
    newsContainer.innerHTML = '';
    
    // Si no hay noticias
    if (!news || news.length === 0) {
      newsContainer.innerHTML = '<p class="no-data" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No hay noticias disponibles en este momento.</p>';
      return;
    }
    
    // Mostrar solo las últimas 4 noticias
    const latestNews = news.slice(0, 4);
    console.log('📋 Mostrando', latestNews.length, 'noticias');
    
    // Crear cards de noticias
    latestNews.forEach((newsItem, index) => {
      console.log(`\n📄 Procesando noticia ${index + 1}:`);
      console.log('  - ID:', newsItem.id);
      console.log('  - Título:', newsItem.title);
      console.log('  - Descripción:', newsItem.description);
      console.log('  - Fecha:', newsItem.date);
      console.log('  - Imagen:', newsItem.image);
      console.log('  - Link:', newsItem.link);
      
      // Validar que los campos existen
      const title = newsItem.title || 'Sin título';
      const description = newsItem.description || 'Sin descripción';
      const link = newsItem.link || '#';
      const image = newsItem.image || null;
      const date = newsItem.date ? new Date(newsItem.date) : new Date();
      
      // Formatear fecha
      const formattedDate = date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      console.log(`  ✅ Creando card con título: "${title}"`);
      
      // Crear card
      const newsCard = document.createElement('article');
      newsCard.className = 'card';
      
      // Construir HTML
      let cardHTML = '';
      
      // Agregar imagen si existe
      if (image && image !== 'null' && image !== null) {
        const imageUrl = image.startsWith('http') 
          ? image 
          : `${window.location.origin}${image}`;
        console.log('  🖼️ URL de imagen:', imageUrl);
        cardHTML += `<img src="${imageUrl}" alt="${title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0; margin: -30px -30px 15px -30px;" onerror="console.error('Error cargando imagen:', this.src); this.style.display='none';">`;
      }
      
      // Agregar contenido
      cardHTML += `
        <h4 style="color: #003366; margin-bottom: 10px; font-size: 20px;">${title}</h4>
        <span class="date" style="display: block; font-size: 13px; color: #777; margin-bottom: 10px;">${formattedDate}</span>
        <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">${description}</p>
      `;
      
      // Agregar enlace si existe y no es '#'
      if (link && link !== '#' && link !== 'null') {
        cardHTML += `<a href="${link}" class="read-more" style="color: #003366; font-weight: 600; text-decoration: none;" target="_blank" rel="noopener noreferrer">Leer más →</a>`;
      }
      
      newsCard.innerHTML = cardHTML;
      
      console.log('  📦 HTML generado:', cardHTML.substring(0, 100) + '...');
      
      newsContainer.appendChild(newsCard);
      console.log('  ✅ Card agregada al contenedor');
    });
    
    console.log('\n✅ Todas las noticias cargadas exitosamente');
    console.log('📊 Cards en el DOM:', newsContainer.children.length);
    
  } catch (error) {
    console.error('❌ Error cargando noticias:', error);
    console.error('Stack:', error.stack);
    newsContainer.innerHTML = `<p class="error-message" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">Error al cargar las noticias: ${error.message}<br><small>Revisa la consola (F12) para más detalles</small></p>`;
  }
}

// =============================
//  GALERÍA DINÁMICA DESDE API
// =============================
async function loadGallery() {
  const galleryContainer = document.querySelector('.gallery-grid');
  
  // Solo cargar si estamos en la página principal
  if (!galleryContainer) return;
  
  try {
    const response = await fetch(`${API_URL}/gallery`);
    
    if (!response.ok) {
      throw new Error('Error al cargar galería');
    }
    
    const gallery = await response.json();
    
    // Limpiar el contenedor
    galleryContainer.innerHTML = '';
    
    // Si no hay fotos, usar las predeterminadas
    if (gallery.length === 0) {
      // Mantener las imágenes estáticas originales
      return;
    }
    
    // Mostrar las últimas 4 fotos
    const latestPhotos = gallery.slice(0, 4);
    
    latestPhotos.forEach(photo => {
      const img = document.createElement('img');
      img.src = `${API_URL.replace('/api', '')}${photo.image}`;
      img.alt = photo.title || 'Foto de galería';
      img.loading = 'lazy';
      galleryContainer.appendChild(img);
    });
  } catch (error) {
    console.error('Error cargando galería:', error);
    // Mantener las imágenes predeterminadas en caso de error
  }
}

// Cargar noticias cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    loadGallery();
  });
} else {
  loadNews();
  loadGallery();
}

// =============================
//  FORMULARIO DE CONTACTO
// =============================
const contactForm = document.querySelector('.contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
      nombre: document.getElementById('nombre').value,
      correo: document.getElementById('correo').value,
      mensaje: document.getElementById('mensaje').value
    };
    
    // Deshabilitar botón mientras se procesa
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    // Simular envío (aquí deberías conectar con tu backend/servicio de email)
    try {
      // Simulación de envío con delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Aquí irá tu lógica de envío real
      // Ejemplo: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
      
      // Mostrar mensaje de éxito
      if (formMessage) {
        formMessage.className = 'form-message success';
        formMessage.textContent = '¡Mensaje enviado con éxito! Te responderemos pronto.';
      } else {
        alert('¡Mensaje enviado con éxito! Te responderemos pronto.');
      }
      
      // Limpiar formulario
      contactForm.reset();
      
    } catch (error) {
      // Mostrar mensaje de error
      if (formMessage) {
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.';
      } else {
        alert('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
      }
    } finally {
      // Rehabilitar botón
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      // Ocultar mensaje después de 5 segundos
      if (formMessage) {
        setTimeout(() => {
          formMessage.textContent = '';
          formMessage.className = 'form-message';
        }, 5000);
      }
    }
  });
}

// =============================
//  SMOOTH SCROLL
// =============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Ignorar # solo
    if (href === '#') {
      e.preventDefault();
      return;
    }
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// =============================
//  ANIMACIÓN AL SCROLL
// =============================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observar secciones y cards
document.querySelectorAll('.section, .card').forEach(el => {
  observer.observe(el);
});

// =============================
//  AUTO-REFRESH DE CONTENIDO
// =============================
// Recargar noticias cada 5 minutos
setInterval(() => {
  loadNews();
  loadGallery();
}, 5 * 60 * 1000);