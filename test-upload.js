const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('🧪 Probando sistema de archivos...\n');
  
  // Test 1: Crear carpetas
  try {
    fs.mkdirSync('uploads/test', { recursive: true });
    console.log('✅ Test 1: Carpetas se pueden crear');
  } catch (error) {
    console.log('❌ Test 1: Error creando carpetas:', error.message);
    return;
  }
  
  // Test 2: Escribir archivo
  try {
    fs.writeFileSync('uploads/test/test.txt', 'Prueba de escritura');
    console.log('✅ Test 2: Archivos se pueden escribir');
  } catch (error) {
    console.log('❌ Test 2: Error escribiendo archivo:', error.message);
    return;
  }
  
  // Test 3: Leer archivo
  try {
    const content = fs.readFileSync('uploads/test/test.txt', 'utf8');
    console.log('✅ Test 3: Archivos se pueden leer');
  } catch (error) {
    console.log('❌ Test 3: Error leyendo archivo:', error.message);
    return;
  }
  
  // Test 4: Eliminar archivo
  try {
    fs.unlinkSync('uploads/test/test.txt');
    fs.rmdirSync('uploads/test');
    console.log('✅ Test 4: Archivos se pueden eliminar');
  } catch (error) {
    console.log('❌ Test 4: Error eliminando archivo:', error.message);
    return;
  }
  
  console.log('\n✅ TODOS LOS TESTS PASARON - Sistema OK');
}

testUpload();

