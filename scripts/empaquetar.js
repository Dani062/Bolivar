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
// 6. Las instrucciones y los datos de conexion, al lado del paquete (no
//    dentro del codigo del backend).
const INSTRUCCIONES = `# Bolívar Aprende y Trabaja — Entrega

Este paquete tiene todo lo necesario para abrir la app y probar la API.

## Cómo abrir la app (lo más fácil)

### 1. Encender la API: doble clic en INICIAR-API.bat

Ese archivo se encarga de todo: crea el archivo de configuración con la
dirección de la base de datos, instala las dependencias, crea el
administrador y enciende el servidor. La primera vez tarda un minuto.

Cuando termine, en esa misma ventana va a aparecer:

    API lista en http://localhost:4000

Para detenerla: Ctrl + C en esa ventana (o ciérrala).

### 2. Abrir la aplicación

Opción A — En un celular Android: instala el archivo app-release.apk.
  1. Pásale el archivo al celular.
  2. En el celular: Ajustes > Aplicaciones > acceso especial > Instalar
     aplicaciones desconocidas > activa la app desde donde se abre el archivo.
  3. Abre el archivo y dale a Instalar.

Opción B — En el computador: abre el proyecto en Android Studio (carpeta
  bolivar_aprende_y_trabaja) y dale al botón Run, que abre el emulador.

### 3. Iniciar sesión

    Correo:      admin@bolivar.com
    Contraseña:  admin123

### 4. Comprobar que todo está conectado

Entra en el menú lateral a "Gestión de datos": debe aparecer el chip verde
"API conectada" y el listado de oportunidades guardadas en MongoDB. Si creas
una nueva, queda en la base de datos y aparece en el listado del inicio: ese
es el ciclo completo de la API.

Si la app se abre en un celular físico y sale el aviso "Sin conexión con el
servidor", en la pantalla de inicio de sesión hay que tocar el botón
"Servidor: ..." y escribir la dirección del computador donde está la API, por
ejemplo http://192.168.1.50:4000/api (el celular y el computador deben
estar en la misma red). La app la recuerda. En el emulador de Android Studio
no hace falta esto, porque ya apunta al localhost del computador.

## Requisitos
- Node.js 18 o superior: https://nodejs.org  (el archivo INICIAR-API.bat
  te avisa si falta)
- La API usa la base de datos en la nube (MongoDB Atlas), así que se
  necesita internet.

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

## Que hay en el paquete
- INICIAR-API.bat        Doble clic y la API queda encendida.
- app-release.apk         La aplicacion.
- Documentacion-...docx   La documentacion del trabajo.
- INSTRUCCIONES.md        Este archivo.
- configurar.env          El archivo de configuracion de la base de datos.
- evidencias/             Las capturas de la app.
- backend/                El codigo de la API, sus pruebas y Postman.
- api-publica.txt         Donde anotar la direccion de la API publicada.
`;

// El archivo .bat de arranque.
// Sin acentos y sin BOM: el interprete de comandos de Windows lee el
// archivo con la codificacion de la consola y el BOM lo rompe.
const BAT = `@echo off
title API - Bolivar Aprende y Trabaja
cd /d "%~dp0backend"

echo.
echo ======================================================
echo    Iniciando la API de Bolivar Aprende y Trabaja
echo ======================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [FALTA] No se encontro Node.js.
  echo Descargalo de https://nodejs.org e instalalo, y despues
  echo vuelve a hacer doble clic en este archivo.
  echo.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist "..\\configurar.env" (
    copy /y "..\\configurar.env" ".env" >nul
    echo [1/3] Archivo de configuracion creado.
  ) else (
    echo [FALTA] No se encontro el archivo configurar.env
    pause
    exit /b 1
  )
) else (
  echo [1/3] Configuracion lista.
)

if not exist "node_modules" (
  echo [2/3] Instalando dependencias. La primera vez tarda un minuto...
  call npm install
  if errorlevel 1 (
    echo [FALLO] No se pudieron instalar las dependencias.
    pause
    exit /b 1
  )
) else (
  echo [2/3] Dependencias ya instaladas.
)

echo [3/3] Creando el administrador y encendiendo la API...
call npm run seed
echo.
echo ======================================================
echo    API lista en http://localhost:4000
echo    Comprobala en: http://localhost:4000/api/salud
echo    Para detenerla: Ctrl + C
echo ======================================================
echo.
call npm start
pause
`;

fs.writeFileSync(path.join(destino, 'INSTRUCCIONES.md'), INSTRUCCIONES, 'utf8');
console.log('  + INSTRUCCIONES.md');

fs.writeFileSync(path.join(destino, 'INICIAR-API.bat'), BAT.replace(/\n/g, '\r\n'), 'latin1');
console.log('  + INICIAR-API.bat');

// La direccion de MongoDB, en un .env listo para usar. Va al lado del
// paquete (no dentro del codigo del backend) y INICIAR-API.bat lo copia.
const archivoEnv = path.join(raizBackend, '.env');
if (fs.existsSync(archivoEnv)) {
  fs.copyFileSync(archivoEnv, path.join(destino, 'configurar.env'));
  console.log('  + configurar.env');
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
