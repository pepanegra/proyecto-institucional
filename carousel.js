// ========== CARRUSEL DE ALIADOS ==========
// Script para el carrusel automático de aliados estratégicos
// Archivo: carousel.js

(function() {
  'use strict';

  // Esperar a que el DOM esté completamente cargado
  function initCarousel() {
    setTimeout(() => {
      const container = document.getElementById('partnersContainer');
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const dotsContainer = document.getElementById('carouselDots');

      console.log('🎠 Inicializando carrusel de aliados...');
      console.log('Container:', container);
      console.log('PrevBtn:', prevBtn);
      console.log('NextBtn:', nextBtn);
      console.log('Dots:', dotsContainer);

      // Validar que todos los elementos existan
      if (!container || !prevBtn || !nextBtn || !dotsContainer) {
        console.error('❌ Error: Elementos del carrusel NO encontrados');
        return;
      }

      console.log('✅ Todos los elementos encontrados');

      // Variables globales del carrusel
      let currentSlide = 0;
      let autoplayTimer = null;
      const slides = container.querySelectorAll('.partner-slide');
      const totalSlides = slides.length;

      console.log('📊 Total de slides:', totalSlides);

      // Obtener número de slides visibles según el ancho de pantalla
      function getSlidesPerView() {
        const width = window.innerWidth;
        if (width <= 640) return 1;
        if (width <= 1024) return 2;
        return 3;
      }

      // Calcular el índice máximo permitido
      function getMaxSlide() {
        const slidesPerView = getSlidesPerView();
        return Math.max(0, totalSlides - slidesPerView);
      }

      // Crear los indicadores (dots) de navegación
      function createDots() {
        dotsContainer.innerHTML = '';
        const maxSlide = getMaxSlide();
        
        for (let i = 0; i <= maxSlide; i++) {
          const dot = document.createElement('button');
          dot.className = 'carousel-dot';
          dot.setAttribute('aria-label', `Ir al grupo ${i + 1}`);
          
          if (i === 0) {
            dot.classList.add('active');
          }
          
          dot.onclick = () => goToSlide(i);
          dotsContainer.appendChild(dot);
        }
        
        console.log('🔘 Dots creados:', maxSlide + 1);
      }

      // Actualizar la posición visual del carrusel
      function updateCarousel() {
        const slidesPerView = getSlidesPerView();
        const percentage = -(currentSlide * (100 / slidesPerView));
        
        // Aplicar transformación
        container.style.transform = `translateX(${percentage}%)`;
        
        console.log('🎬 Actualizando carrusel:', {
          slideActual: currentSlide,
          slidesPorVista: slidesPerView,
          porcentaje: percentage
        });

        // Actualizar estado de los dots
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
          if (index === currentSlide) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        // Actualizar estado de los botones
        const maxSlide = getMaxSlide();
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide >= maxSlide;
      }

      // Navegar a un slide específico
      function goToSlide(index) {
        const maxSlide = getMaxSlide();
        currentSlide = Math.max(0, Math.min(index, maxSlide));
        console.log('➡️ Ir a slide:', currentSlide);
        updateCarousel();
        restartAutoplay();
      }

      // Ir al siguiente slide
      function nextSlide() {
        const maxSlide = getMaxSlide();
        
        if (currentSlide < maxSlide) {
          currentSlide++;
        } else {
          currentSlide = 0; // Volver al inicio (loop)
        }
        
        console.log('⏭️ Siguiente slide:', currentSlide);
        updateCarousel();
      }

      // Ir al slide anterior
      function prevSlide() {
        const maxSlide = getMaxSlide();
        
        if (currentSlide > 0) {
          currentSlide--;
        } else {
          currentSlide = maxSlide; // Ir al final (loop)
        }
        
        console.log('⏮️ Slide anterior:', currentSlide);
        updateCarousel();
      }

      // Iniciar reproducción automática
      function startAutoplay() {
        console.log('▶️ Iniciando autoplay...');
        stopAutoplay(); // Detener cualquier timer previo
        
        autoplayTimer = setInterval(() => {
          console.log('⏱️ Autoplay tick - avanzando...');
          nextSlide();
        }, 3000); // Cambiar cada 3 segundos
      }

      // Detener reproducción automática
      function stopAutoplay() {
        if (autoplayTimer) {
          console.log('⏸️ Deteniendo autoplay');
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }

      // Reiniciar autoplay (detener y volver a iniciar)
      function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      // ========== EVENT LISTENERS ==========

      // Botón anterior
      prevBtn.onclick = () => {
        console.log('👆 Click en botón anterior');
        prevSlide();
        restartAutoplay();
      };

      // Botón siguiente
      nextBtn.onclick = () => {
        console.log('👆 Click en botón siguiente');
        nextSlide();
        restartAutoplay();
      };

      // Pausar al pasar el mouse
      container.onmouseenter = () => {
        console.log('🖱️ Mouse sobre carrusel - pausando');
        stopAutoplay();
      };
      
      // Reanudar al quitar el mouse
      container.onmouseleave = () => {
        console.log('🖱️ Mouse fuera del carrusel - reanudando');
        startAutoplay();
      };

      // Soporte para gestos táctiles (swipe)
      let touchStartX = 0;

      container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        stopAutoplay();
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const difference = touchStartX - touchEndX;
        
        // Si el deslizamiento es mayor a 50px
        if (Math.abs(difference) > 50) {
          if (difference > 0) {
            // Deslizar a la izquierda = siguiente
            nextSlide();
          } else {
            // Deslizar a la derecha = anterior
            prevSlide();
          }
        }
        
        startAutoplay();
      }, { passive: true });

      // Ajuste responsive al cambiar tamaño de ventana
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const maxSlide = getMaxSlide();
          
          // Ajustar slide actual si excede el máximo
          if (currentSlide > maxSlide) {
            currentSlide = maxSlide;
          }
          
          createDots();
          updateCarousel();
          console.log('📐 Ventana redimensionada - carrusel actualizado');
        }, 250);
      });

      // ========== INICIALIZACIÓN ==========
      console.log('🚀 Iniciando carrusel...');
      createDots();
      updateCarousel();
      startAutoplay();
      
      console.log('✅ Carrusel de aliados COMPLETAMENTE inicializado y funcionando');
      
    }, 500); // Esperar 500ms para asegurar que el DOM esté listo
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    // DOM ya está listo
    initCarousel();
  }

  console.log('📦 Script de carrusel cargado correctamente');

})();