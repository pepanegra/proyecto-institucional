
    const API_URL = 'https://proyecto-institucional-2.onrender.com/api';
    let token = localStorage.getItem('adminToken');

    // Elementos del DOM
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Verificar autenticación al cargar
    if (token) {
      showAdminPanel();
    }

    // Login
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          token = data.token;
          localStorage.setItem('adminToken', token);
          localStorage.setItem('username', data.user.username);
          showAdminPanel();
          document.getElementById("loginSection").classList.add("oculto")

        } else {
          showMessage('loginMessage', data.error, 'error');
        }
      } catch (error) {
        showMessage('loginMessage', 'Error de conexión', 'error');
      }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('username');
      token = null;
      location.reload();
    });

    function showAdminPanel() {
      loginSection.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      document.getElementById('username').textContent = localStorage.getItem('username');
      loadNews();
      loadGallery();
    }

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
      });
    });

    // Preview de imágenes
    document.getElementById('newsImage').addEventListener('change', (e) => {
      previewImage(e.target, 'newsImagePreview');
    });

    document.getElementById('galleryImage').addEventListener('change', (e) => {
      previewImage(e.target, 'galleryImagePreview');
    });

    function previewImage(input, previewId) {
      const preview = document.getElementById(previewId);
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.classList.add('show');
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    // Noticias
    document.getElementById('newsForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      console.log('📰 Intentando crear noticia...');
      
      const formData = new FormData();
      formData.append('title', document.getElementById('newsTitle').value);
      formData.append('description', document.getElementById('newsDescription').value);
      formData.append('link', document.getElementById('newsLink').value);
      
      const imageFile = document.getElementById('newsImage').files[0];
      if (imageFile) {
        console.log('📎 Imagen seleccionada:', imageFile.name, imageFile.size, 'bytes');
        formData.append('image', imageFile);
      } else {
        console.log('⚠️ No se seleccionó imagen');
      }

      // Mostrar contenido del FormData
      console.log('📋 Datos a enviar:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publicando...';

      try {
        console.log('🚀 Enviando petición...');
        const response = await fetch(`${API_URL}/news`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
            // NO incluir Content-Type, fetch lo establece automáticamente para FormData
          },
          body: formData
        });

        console.log('📥 Respuesta recibida:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📊 Datos de respuesta:', data);

        if (response.ok) {
          showMessage('newsMessage', '✅ Noticia publicada exitosamente', 'success');
          document.getElementById('newsForm').reset();
          document.getElementById('newsImagePreview').classList.remove('show');
          loadNews();
        } else {
          console.error('❌ Error del servidor:', data);
          showMessage('newsMessage', '❌ Error: ' + (data.error || 'Error desconocido'), 'error');
        }
      } catch (error) {
        console.error('❌ Error de red:', error);
        showMessage('newsMessage', '❌ Error de conexión: ' + error.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar Noticia';
      }
    });

    async function loadNews() {
      try {
        const response = await fetch(`${API_URL}/news`);
        const news = await response.json();
        
        document.getElementById('newsLoading').classList.add('hidden');
        const newsList = document.getElementById('newsList');
        newsList.innerHTML = '';

        news.forEach(item => {
          const card = createNewsCard(item);
          newsList.appendChild(card);
        });
      } catch (error) {
        console.error('Error cargando noticias:', error);
      }
    }

    function createNewsCard(item) {
      const card = document.createElement('div');
      card.className = 'item-card';
      
      const date = new Date(item.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      card.innerHTML = `
        ${item.image ? `<img src="${API_URL.replace('/api', '')}${item.image}" alt="${item.title}">` : ''}
        <div class="item-card-content">
          <h3>${item.title}</h3>
          <p class="date">${date}</p>
          <p>${item.description}</p>
          <div class="actions">
            <button class="btn btn-danger" onclick="deleteNews('${item.id}')">Eliminar</button>
          </div>
        </div>
      `;
      return card;
    }

    async function deleteNews(id) {
      if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;

      try {
        const response = await fetch(`${API_URL}/news/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          loadNews();
          showMessage('newsMessage', 'Noticia eliminada', 'success');
        }
      } catch (error) {
        showMessage('newsMessage', 'Error al eliminar', 'error');
      }
    }

    // Galería
    let currentGalleryFilter = 'all';
    let allGalleryPhotos = [];

    document.getElementById('galleryForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('title', document.getElementById('galleryTitle').value);
      formData.append('description', document.getElementById('galleryDescription').value);
      formData.append('category', document.getElementById('galleryCategory').value);
      formData.append('image', document.getElementById('galleryImage').files[0]);
      formData.append('type', 'gallery');

      try {
        const response = await fetch(`${API_URL}/gallery`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (response.ok) {
          showMessage('galleryMessage', 'Foto subida exitosamente', 'success');
          document.getElementById('galleryForm').reset();
          document.getElementById('galleryImagePreview').classList.remove('show');
          loadGallery();
        } else {
          const data = await response.json();
          showMessage('galleryMessage', data.error, 'error');
        }
      } catch (error) {
        showMessage('galleryMessage', 'Error al subir foto', 'error');
      }
    });

    async function loadGallery() {
      try {
        const response = await fetch(`${API_URL}/gallery`);
        allGalleryPhotos = await response.json();
        
        // Agregar categoría por defecto si no existe
        allGalleryPhotos = allGalleryPhotos.map(photo => ({
          ...photo,
          category: photo.category || 'otros'
        }));
        
        document.getElementById('galleryLoading').classList.add('hidden');
        updateGalleryStats();
        displayGalleryPhotos();
      } catch (error) {
        console.error('Error cargando galería:', error);
      }
    }

    function updateGalleryStats() {
      const totalPhotos = allGalleryPhotos.length;
      const categories = [...new Set(allGalleryPhotos.map(p => p.category))];
      
      document.getElementById('totalPhotosCount').textContent = totalPhotos;
      document.getElementById('categoriesCount').textContent = categories.length;
    }

    function displayGalleryPhotos() {
      const galleryList = document.getElementById('galleryList');
      const noResults = document.getElementById('noGalleryResults');
      
      let filteredPhotos = allGalleryPhotos;
      if (currentGalleryFilter !== 'all') {
        filteredPhotos = allGalleryPhotos.filter(p => p.category === currentGalleryFilter);
      }
      
      galleryList.innerHTML = '';
      
      if (filteredPhotos.length === 0) {
        noResults.style.display = 'block';
        galleryList.style.display = 'none';
        return;
      }
      
      noResults.style.display = 'none';
      galleryList.style.display = 'grid';

      filteredPhotos.forEach(item => {
        const card = createGalleryCard(item);
        galleryList.appendChild(card);
      });
    }

    function createGalleryCard(item) {
      const card = document.createElement('div');
      card.className = 'item-card';
      
      const date = new Date(item.date).toLocaleDateString('es-ES');
      
      const categoryLabels = {
        'eventos': 'Eventos',
        'academico': 'Académico',
        'deportes': 'Deportes',
        'cultural': 'Cultural',
        'graduacion': 'Graduación',
        'talleres': 'Talleres',
        'instalaciones': 'Instalaciones',
        'otros': 'Otros'
      };

      card.innerHTML = `
        <img src="${API_URL.replace('/api', '')}${item.image}" alt="${item.title}">
        <div class="item-card-content">
          <h3>${item.title}</h3>
          <span class="category-badge">${categoryLabels[item.category] || 'Sin categoría'}</span>
          <p class="date">${date}</p>
          ${item.description ? `<p>${item.description}</p>` : ''}
          <div class="actions">
            <button class="btn btn-danger" onclick="deleteGalleryItem('${item.id}')">Eliminar</button>
          </div>
        </div>
      `;
      return card;
    }

    // Filtros de galería
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentGalleryFilter = tab.dataset.category;
        
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        displayGalleryPhotos();
      });
    });

    async function deleteGalleryItem(id) {
      if (!confirm('¿Estás seguro de eliminar esta foto?')) return;

      try {
        const response = await fetch(`${API_URL}/gallery/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          loadGallery();
          showMessage('galleryMessage', 'Foto eliminada exitosamente', 'success');
        } else {
          showMessage('galleryMessage', 'Error al eliminar foto', 'error');
        }
      } catch (error) {
        showMessage('galleryMessage', 'Error al eliminar', 'error');
      }
    }

    function showMessage(elementId, message, type) {
      const messageEl = document.getElementById(elementId);
      messageEl.textContent = message;
      messageEl.className = `message ${type} show`;
      setTimeout(() => {
        messageEl.classList.remove('show');
      }, 5000);
    }
  