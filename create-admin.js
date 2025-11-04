const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('=================================');
  console.log('🔧 Crear Usuario Administrador');
  console.log('=================================\n');

  try {
    // Solicitar datos
    const username = await question('Nombre de usuario: ');
    const password = await question('Contraseña: ');
    const confirmPassword = await question('Confirmar contraseña: ');

    // Validaciones
    if (!username || username.length < 3) {
      console.error('❌ El nombre de usuario debe tener al menos 3 caracteres');
      rl.close();
      return;
    }

    if (!password || password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      return;
    }

    if (password !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden');
      rl.close();
      return;
    }

    // Crear carpeta data si no existe
    await fs.mkdir('data', { recursive: true });

    // Leer usuarios existentes
    let users = [];
    try {
      const data = await fs.readFile('data/users.json', 'utf8');
      users = JSON.parse(data);
    } catch (error) {
      // Si no existe el archivo, se creará uno nuevo
    }

    // Verificar si el usuario ya existe
    if (users.find(u => u.username === username)) {
      console.error(`❌ El usuario "${username}" ya existe`);
      rl.close();
      return;
    }

    // Hash de la contraseña
    console.log('\n⏳ Procesando...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      username: username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Guardar en archivo
    await fs.writeFile('data/users.json', JSON.stringify(users, null, 2));

    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log('=================================');
    console.log(`Usuario: ${username}`);
    console.log(`ID: ${newUser.id}`);
    console.log(`Creado: ${new Date(newUser.createdAt).toLocaleString('es-ES')}`);
    console.log('=================================\n');
    console.log('🚀 Ya puedes iniciar sesión en el panel de administración');
    console.log('📍 URL: http://localhost:3000/admin.html\n');

  } catch (error) {
    console.error('❌ Error al crear usuario:', error.message);
  } finally {
    rl.close();
  }
}

// Ejecutar
createAdmin();