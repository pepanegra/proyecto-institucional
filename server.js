const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_cambiala_en_produccion';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Crear carpetas necesarias
const initFolders = async () => {
  const folders = ['uploads/news', 'uploads/gallery', 'data'];
  for (const folder of folders) {
    try {
      await fs.mkdir(folder, { recursive: true });
    } catch (error) {
      console.error(`Error creando carpeta ${folder}:`, error);
    }
  }
};

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Determinar carpeta según el tipo
      let folder = 'uploads/news';
      
      // Para galería, verificar si viene en el body o en la URL
      if (req.body.type === 'gallery' || req.path.includes('gallery')) {
        folder = 'uploads/gallery';
      }
      
      // Asegurar que la carpeta existe
      await fs.mkdir(folder, { recursive: true });
      cb(null, folder);
    } catch (error) {
      console.error('Error creando carpeta:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    
    console.log('📁 Guardando archivo:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    console.log('📤 Recibiendo archivo:', file.originalname);
    console.log('📋 Tipo MIME:', file.mimetype);
    
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('✅ Archivo aceptado');
      return cb(null, true);
    }
    console.log('❌ Archivo rechazado');
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
});

// Archivos de datos
const NEWS_FILE = 'data/news.json';
const GALLERY_FILE = 'data/gallery.json';
const USERS_FILE = 'data/users.json';

// Funciones auxiliares para leer/escribir JSON
const readJSON = async (file) => {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJSON = async (file, data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
};

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ============================
// RUTAS DE AUTENTICACIÓN
// ============================

// Registrar usuario (solo para desarrollo - en producción debes restringir esto)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const users = await readJSON(USERS_FILE);
    
    // Verificar si el usuario ya existe
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJSON(USERS_FILE, users);

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// ============================
// RUTAS DE NOTICIAS
// ============================

// Obtener todas las noticias (público)
app.get('/api/news', async (req, res) => {
  try {
    const news = await readJSON(NEWS_FILE);
    res.json(news.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

// Obtener una noticia específica
app.get('/api/news/:id', async (req, res) => {
  try {
    const news = await readJSON(NEWS_FILE);
    const item = news.find(n => n.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener noticia' });
  }
});

// Crear noticia (protegido)
app.post('/api/news', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, link } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Título y descripción son requeridos' });
    }

    const news = await readJSON(NEWS_FILE);
    
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      link: link || '#',
      date: new Date().toISOString(),
      image: req.file ? `/uploads/news/${req.file.filename}` : null,
      createdBy: req.user.username
    };

    news.push(newItem);
    await writeJSON(NEWS_FILE, news);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear noticia' });
  }
});

// Actualizar noticia (protegido)
app.put('/api/news/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const news = await readJSON(NEWS_FILE);
    const index = news.findIndex(n => n.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    const { title, description, link } = req.body;
    
    news[index] = {
      ...news[index],
      title: title || news[index].title,
      description: description || news[index].description,
      link: link || news[index].link,
      image: req.file ? `/uploads/news/${req.file.filename}` : news[index].image,
      updatedAt: new Date().toISOString()
    };

    await writeJSON(NEWS_FILE, news);
    res.json(news[index]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar noticia' });
  }
});

// Eliminar noticia (protegido)
app.delete('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const news = await readJSON(NEWS_FILE);
    const index = news.findIndex(n => n.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    // Eliminar imagen si existe
    if (news[index].image) {
      const imagePath = path.join(__dirname, news[index].image);
      try {
        await fs.unlink(imagePath);
      } catch (error) {
        console.error('Error eliminando imagen:', error);
      }
    }

    news.splice(index, 1);
    await writeJSON(NEWS_FILE, news);

    res.json({ message: 'Noticia eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar noticia' });
  }
});

// ============================
// RUTAS DE GALERÍA
// ============================

// Obtener todas las fotos (público)
app.get('/api/gallery', async (req, res) => {
  try {
    const gallery = await readJSON(GALLERY_FILE);
    res.json(gallery.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener galería' });
  }
});

// Subir foto a galería (protegido)
app.post('/api/gallery', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Imagen requerida' });
    }

    const { title, description, category } = req.body;
    const gallery = await readJSON(GALLERY_FILE);
    
    // Validar categoría
    const validCategories = ['eventos', 'academico', 'deportes', 'cultural', 'graduacion', 'talleres', 'instalaciones', 'otros'];
    const photoCategory = validCategories.includes(category) ? category : 'otros';
    
    const newItem = {
      id: Date.now().toString(),
      title: title || 'Sin título',
      description: description || '',
      category: photoCategory,
      image: req.file ? `/uploads/gallery/${req.file.filename}` : null,
      date: new Date().toISOString(),
      uploadedBy: req.user.username
    };

    gallery.push(newItem);
    await writeJSON(GALLERY_FILE, gallery);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

// Eliminar foto de galería (protegido)
app.delete('/api/gallery/:id', authenticateToken, async (req, res) => {
  try {
    const gallery = await readJSON(GALLERY_FILE);
    const index = gallery.findIndex(g => g.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    // Eliminar imagen
    const imagePath = path.join(__dirname, gallery[index].image);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }

    gallery.splice(index, 1);
    await writeJSON(GALLERY_FILE, gallery);

    res.json({ message: 'Foto eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar foto' });
  }
});

// ============================
// INICIAR SERVIDOR
// ============================

initFolders().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Panel de administración: http://localhost:${PORT}/admin.html`);
  });
});