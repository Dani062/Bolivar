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
    if (e.name === '.env') continue; // el .env lleva credenciales: no va con el codigo
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

// 6. Las instrucciones y los datos de conexion, al lado del paquete (no
//    dentro del codigo del backend).
const INSTRUCCIONES = `# Bolívar Aprende y Trabaja — Entrega

Este paquete tiene todo lo necesario para ver la app funcionando y probar la API.

## Las 3 formas de ver la app

### A. En la sustentación, en el salón (lo más rápido)
1. Con el backend encendido en el equipo (npm start).
2. El profesor instala el APK en su celular.
3. El celular debe estar en la misma red Wi-Fi que el equipo.

El APK ya viene con la direccion de ese equipo, asi que la app se conecta
sola y muestra el chip verde "API conectada". Si el equipo cambia de red,
basta con tocar "Reintentar" en la app.

### B. El profesor lo prueba en su casa, con el codigo
1. Instala Node.js 18 o superior: https://nodejs.org
2. Descomprime el paquete y entra a la carpeta "backend".
3. Copia el archivo ".env.example" como ".env" y pega el valor de
   MONGO_URI que aparece en el archivo "conexion-base-de-datos.txt".
4. npm install
5. npm run seed    (crea el administrador: admin@bolivar.com / admin123)
6. npm start       (http://localhost:4000)
7. Instala el APK en su celular y abrelo:
   - En el emulador de Android Studio funciona directo, sin tocar nada.
   - En un celular fisico, toca el boton "Servidor: ..." de la pantalla de
     inicio de sesion y escribe la direccion de su computador, por ejemplo
     http://192.168.1.50:4000/api. La app la recuerda.

### C. Desde cualquier parte del mundo
Publicar la API en internet (gratis) y recompilar el APK apuntando a esa
direccion. Esta explicado en el README.md, en la seccion
"Publicar el backend en internet".

## Probar la API con Postman
1. Import > "Bolivar-Aprende-y-Trabaja.postman_collection.json"
2. Import > "Bolivar-Entorno-Local.postman_environment.json"
3. Arriba a la derecha, elegir el entorno "Bolivar Aprende y Trabaja - Local"
   (si no aparece, activarlo con el icono del ojo de la barra lateral).
4. Con la API encendida, darle al boton "> Run" de la coleccion.
5. Postman corre las 39 peticiones y al final muestra cuantas pruebas pasaron.

Sin Postman, desde la terminal del backend:
  npm run test:postman      (resumen en la consola)
  npm run reporte:postman   (ademas genera el reporte HTML)

## Instalar el APK
1. Pasarle el archivo app-release.apk al celular.
2. Ajustes > Aplicaciones > acceso especial > Instalar aplicaciones
   desconocidas > activar la app desde donde se abre el archivo.
3. Abrir el archivo e instalar.

## Que hay en el paquete
- app-release.apk              La aplicacion.
- Documentacion-...docx        La documentacion del trabajo.
- INSTRUCCIONES.md             Este archivo.
- conexion-base-de-datos.txt   La direccion de MongoDB para levantar la API.
- evidencias/                  Las capturas de la app.
- backend/                     El codigo de la API, sus pruebas y Postman.
- api-publica.txt              Donde anotar la direccion de la API publicada.
`;

fs.writeFileSync(path.join(destino, 'INSTRUCCIONES.md'), INSTRUCCIONES, 'utf8');
console.log('  + INSTRUCCIONES.md');

// La direccion de MongoDB, para que el profesor no tenga que buscarla.
const archivoEnv = path.join(raizBackend, '.env');
if (fs.existsSync(archivoEnv)) {
  const linea = fs
    .readFileSync(archivoEnv, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith('MONGO_URI='));
  fs.writeFileSync(
    path.join(destino, 'conexion-base-de-datos.txt'),
    'Pega este valor en el archivo backend/.env (linea MONGO_URI):\n\n' +
      (linea ? linea : 'MONGO_URI=') +
      '\n\nEl resto del .env se llena con los valores de .env.example.\n',
    'utf8'
  );
  console.log('  + conexion-base-de-datos.txt');
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
