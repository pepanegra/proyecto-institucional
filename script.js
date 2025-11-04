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
  
  try {
    // Mostrar loading
    newsContainer.innerHTML = '<div class="loading">Cargando noticias...</div>';
    
    // Obtener noticias desde el backend
    const response = await fetch(`${API_URL}/news`);
    
    if (!response.ok) {
      throw new Error('Error al cargar noticias');
    }
    
    const news = await response.json();
    
    // Limpiar el contenedor
    newsContainer.innerHTML = '';
    
    // Si no hay noticias
    if (news.length === 0) {
      newsContainer.innerHTML = '<p class="no-data">No hay noticias disponibles en este momento.</p>';
      return;
    }
    
    // Mostrar solo las últimas 4 noticias
    const latestNews = news.slice(0, 4);
    
    // Crear cards de noticias
    latestNews.forEach(newsItem => {
      const newsCard = document.createElement('article');
      newsCard.className = 'card';
      
      const date = new Date(newsItem.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      newsCard.innerHTML = `
        ${newsItem.image ? `<img src="${API_URL.replace('/api', '')}${newsItem.image}" alt="${newsItem.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px 8px 0 0; margin: -30px -30px 15px -30px;">` : ''}
        <h4>${newsItem.title}</h4>
        <span class="date">${date}</span>
        <p>${newsItem.description}</p>
        ${newsItem.link && newsItem.link !== '#' ? `<a href="${newsItem.link}" class="read-more">Leer más →</a>` : ''}
      `;
      newsContainer.appendChild(newsCard);
    });
  } catch (error) {
    console.error('Error cargando noticias:', error);
    newsContainer.innerHTML = '<p class="error-message">Error al cargar las noticias. Por favor, intenta más tarde.</p>';
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