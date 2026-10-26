// Arma el paquete de entrega: un ZIP con el APK, el codigo del backend,
// la coleccion de Postman, las capturas y el documento de Word.
// Uso: npm run empaquetar
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raizBackend = path.join(__dirname, '..');
const raizApp = 'C:/Users/Daniela Paez/AndroidStudioProjects/bolivar_aprende_y_trabaja';
const apk = path.join(raizApp, 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
const evidencias = path.join(raizBackend, 'evidencias');

const destino = path.join(raizBackend, 'entrega');
const zip = path.join(raizBackend, 'Bolivar-Aprende-y-Trabaja-ENTREGA.zip');

// 1. Se limpia la carpeta de trabajo (las capturas viven en otra carpeta) y
//    el ZIP anterior, para que no se meta dentro de si mismo.
fs.rmSync(destino, { recursive: true, force: true });
fs.rmSync(zip, { force: true });
fs.mkdirSync(destino, { recursive: true });

// 2. Se genera el documento de Word con las capturas (si ya existe uno
//    editado a mano, se respeta: solo se crea si no esta).
const docFinal = path.join(evidencias, 'Documentacion-Bolivar-Aprende-y-Trabaja.docx');
if (!fs.existsSync(docFinal)) {
  try {
    execFileSync('node', [path.join(__dirname, 'generarDocumento.js')], {
      cwd: raizBackend,
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('  ! No se pudo generar el documento de Word:', e.message);
  }
} else {
  console.log('  = Documentacion-Bolivar-Aprende-y-Trabaja.docx (el que ya estaba)');
}

// 3. El APK.
if (fs.existsSync(apk)) {
  fs.copyFileSync(apk, path.join(destino, 'app-release.apk'));
  console.log('  + app-release.apk');
} else {
  console.log('  ! No se encontro el APK. Compilalo con: flutter build apk --release');
}

// 4. El codigo del backend, sin node_modules ni .git.
const copia = (origen, destinoNuevo) => {
  fs.mkdirSync(destinoNuevo, { recursive: true });
  for (const e of fs.readdirSync(origen, { withFileTypes: true })) {
    if (['node_modules', '.git', 'entrega'].includes(e.name)) continue;
    if (e.name === '.env') continue; // el .env lleva credenciales: no se entrega
    if (e.name.endsWith('.log')) continue;
    if (e.name === 'Bolivar-Aprende-y-Trabaja-ENTREGA.zip') continue;
    const o = path.join(origen, e.name);
    const d = path.join(destinoNuevo, e.name);
    if (e.isDirectory()) copia(o, d);
    else fs.copyFileSync(o, d);
  }
};
copia(raizBackend, path.join(destino, 'backend'));
console.log('  + backend/ (codigo, pruebas, postman, documentacion y evidencias)');

// 5. Las capturas, tambien en la raiz del paquete para encontrarlas rapido.
if (fs.existsSync(evidencias)) {
  copia(evidencias, path.join(destino, 'evidencias'));
  console.log('  + evidencias/ (capturas de la app)');
}

// 6. Las instrucciones al principio, con el nombre definitivo.
const instrucciones = path.join(destino, 'backend', 'ENTREGA-INSTRUCCIONES.md');
if (fs.existsSync(instrucciones)) {
  fs.copyFileSync(instrucciones, path.join(destino, 'INSTRUCCIONES.md'));
  fs.unlinkSync(instrucciones);
}

// 7. El lugar donde se anota la direccion publica de la API.
fs.writeFileSync(
  path.join(destino, 'api-publica.txt'),
  'Direccion de la API publicada (la que usa el APK):\n\n\n' +
    'Si todavia no la has publicado, mira la seccion "Publicar el backend en internet"\n' +
    'del README.md que esta en la carpeta backend/.\n',
  'utf8'
);
console.log('  + api-publica.txt');

// 8. Se comprime. A veces OneDrive bloquea el archivo un instante, asi que
//    se reintenta un par de veces.
const comprimir = () => {
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Compress-Archive -Path "${destino}\\*" -DestinationPath "${zip}" -Force`,
    ],
    { stdio: 'inherit' }
  );
};

let intentos = 0;
while (intentos < 3) {
  intentos++;
  try {
    fs.rmSync(zip, { force: true });
    comprimir();
    if (fs.existsSync(zip) && fs.statSync(zip).size > 0) break;
    console.log(`  ... el archivo salio vacio, se reintenta (${intentos})`);
  } catch (e) {
    console.log(`  ... no se pudo comprimir todavia (${intentos}), se reintenta`);
  }
}

if (fs.existsSync(zip)) {
  console.log(`\nPaquete listo: ${zip}`);
  console.log(`Tamano: ${(fs.statSync(zip).size / 1024 / 1024).toFixed(1)} MB`);
} else {
  console.error('\nNo se pudo crear el paquete. Intenta de nuevo: npm run empaquetar');
}
