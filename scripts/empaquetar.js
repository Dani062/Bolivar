// Arma el paquete de entrega: un ZIP con el APK, el codigo del backend,
// la coleccion de Postman, las capturas y el documento de Word.
// Uso: npm run empaquetar
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const raizBackend = path.join(__dirname, '..');
// Lo de la entrega (el ZIP, el documento y las capturas) vive FUERA del
// codigo, en la carpeta hermana ENTREGA-Bolivar.
const raizEntrega = path.join(raizBackend, '..', 'ENTREGA-Bolivar');
const raizApp = 'C:/Users/Daniela Paez/AndroidStudioProjects/bolivar_aprende_y_trabaja';
const apk = path.join(raizApp, 'build', 'app', 'outputs', 'flutter-apk', 'app-release.apk');
const evidencias = path.join(raizEntrega, 'evidencias');

const destino = path.join(raizEntrega, 'entrega');
const zip = path.join(raizEntrega, 'Bolivar-Aprende-y-Trabaja-ENTREGA.zip');

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

// 6. El archivo de arranque y los datos de conexion van al lado del
//    paquete (no dentro del codigo del backend).
// 6. Las instrucciones y los datos de conexion, al lado del paquete (no
//    dentro del codigo del backend).


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
