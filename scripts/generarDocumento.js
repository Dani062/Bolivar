// Genera el documento de Word con las capturas de la app.
// Uso: node scripts/generarDocumento.js
//
// Si el documento ya existe, NO se toca: asi se puede editar a mano y
// los cambios se respetan al re-empaquetar.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const carpeta = path.join(__dirname, '..', 'evidencias');
const destino = path.join(carpeta, 'Documentacion-Bolivar-Aprende-y-Trabaja.docx');

const T = (texto, nivel = 1) => ({ tipo: 'titulo', texto, nivel });
const P = (texto) => ({ tipo: 'parrafo', texto });
const L = (texto) => ({ tipo: 'lista', texto });
const IMG = (archivo, pie) => ({ tipo: 'imagen', archivo, pie });
const TABLA = (cabeceras, filas) => ({ tipo: 'tabla', cabeceras, filas });
const SALTO = () => ({ tipo: 'salto' });
const INDICE = () => ({ tipo: 'indice' });
const PAGINA = () => ({ tipo: 'pagina' });

const contenido = [
  // ---------------- PORTADA ----------------
  T('Bolívar Aprende y Trabaja', 0),
  P('API REST en Node.js + Express con MongoDB y aplicación móvil en Flutter'),
  SALTO(),
  TABLA(
    ['', ''],
    [
      ['Proyecto', 'Bolívar Aprende y Trabaja'],
      ['Materia', '(completar)'],
      ['Integrantes', '(completar)'],
      ['Docente', '(completar)'],
      ['Fecha', '(completar)'],
      ['Ciudad', '(completar)'],
    ]
  ),
  PAGINA(),

  // ---------------- ÍNDICE ----------------
  T('Tabla de contenido', 1),
  INDICE(),
  PAGINA(),

  // ---------------- 1. INTRODUCCIÓN ----------------
  T('1. Introducción', 1),
  P(
    'Bolívar Aprende y Trabaja es una aplicación móvil que centraliza las oportunidades de ' +
      'educación, trabajo y emprendimiento del departamento de Bolívar. Antes de este trabajo, ' +
      'cada usuario guardaba su propia copia de la información dentro del celular, lo que ' +
      'imposibilitaba que un administrador publicara una oferta y los demás la vieran.'
  ),
  P(
    'En esta versión, toda la información vive en una base de datos central (MongoDB) y la ' +
      'aplicación se convierte en el cliente de esa base de datos a través de una API REST ' +
      'escrita en Node.js con Express. La aplicación móvil no tiene base de datos propia: ' +
      'registra, consulta y modifica todo a través de la API.'
  ),
  P(
    'El documento presenta la descripción de la actividad, los requisitos que se definieron, ' +
      'la forma de dejar el proyecto funcionando, los resultados obtenidos con las pruebas ' +
      'y las capturas de la aplicación, y las conclusiones del trabajo.'
  ),

  // ---------------- 2. DESCRIPCIÓN DE LA ACTIVIDAD ----------------
  T('2. Descripción de la actividad', 1),
  P(
    'La actividad consiste en construir, sobre el tema de gestión de las actividades ' +
      'anteriores, una API REST en Node.js con la biblioteca Express que implemente un CRUD ' +
      'funcional (GET, POST, PUT y DELETE) sobre el módulo de gestión de oportunidades de la ' +
      'aplicación, y luego consumir esa API desde la aplicación móvil para que todo el ' +
      'sistema quede operativo. Como opción, los datos se pueden gestionar en un arreglo en ' +
      'memoria o en MongoDB; en este proyecto se eligió MongoDB.'
  ),
  P(
    'El módulo de gestión que se tomographyó como base es el de oportunidades: es donde el ' +
      'administrador publica los cursos, becas, talleres y ofertas laborales que después ven ' +
      'los estudiantes. Ese módulo quedó como el CRUD principal de la API y es el que se ' +
      'demuestra en las pruebas.'
  ),
  P('Lo que quedó construido:'),
  L('Una API REST con 39 endpoints repartidos en 6 módulos (oportunidades, autenticación, favoritos, postulaciones, inscripciones y notificaciones).'),
  L('Una base de datos en MongoDB (Atlas) con 6 colecciones que guardan cuentas, oportunidades, favoritos, postulaciones, inscripciones y notificaciones.'),
  L('Una aplicación móvil en Flutter (Android) que consume esa API en su totalidad: no tiene base de datos local.'),
  L('Pruebas automáticas: 31 del backend, 21 de la aplicación y 39 peticiones de Postman con 103 aserciones.'),
  L('Una colección de Postman y un reporte en HTML con el resultado de las pruebas.'),

  // ---------------- 3. REQUISITOS ----------------
  T('3. Requisitos', 1),

  T('3.1 Requisitos funcionales', 2),
  P('Lo que el sistema debe hacer:'),
  TABLA(
    ['#', 'Requisito', 'Dónde se cumple'],
    [
      ['RF1', 'Registrar una cuenta de usuario con nombre, apellido, identificación, correo, teléfono, municipio, contraseña y tipo de perfil.', 'POST /api/auth/registro'],
      ['RF2', 'Iniciar sesión y mantener la sesión iniciada al abrir la aplicación.', 'POST /api/auth/login'],
      ['RF3', 'Consultar y actualizar el perfil del usuario.', 'GET y PUT /api/auth/perfil'],
      ['RF4', 'Crear una oportunidad (el administrador).', 'POST /api/oportunidades'],
      ['RF5', 'Listar las oportunidades, con filtros por municipio, categoría, tipo y clase.', 'GET /api/oportunidades'],
      ['RF6', 'Consultar el detalle de una oportunidad.', 'GET /api/oportunidades/:id'],
      ['RF7', 'Actualizar una oportunidad, sin cambiar los campos que no se envían.', 'PUT /api/oportunidades/:id'],
      ['RF8', 'Eliminar una oportunidad.', 'DELETE /api/oportunidades/:id'],
      ['RF9', 'Ver todas las oportunidades, incluidas las cerradas, solo para el administrador.', 'GET /api/oportunidades/todas'],
      ['RF10', 'Postularse a una oferta laboral y anular la postulación.', '/api/postulaciones'],
      ['RF11', 'Inscribirse a un curso o beca y anular la inscripción.', '/api/inscripciones'],
      ['RF12', 'Recibir notificaciones y marcar como leídas.', '/api/notificaciones'],
      ['RF13', 'Enviar una alerta a todos los usuarios o a uno solo (administrador).', 'POST /api/notificaciones'],
      ['RF14', 'Marcar y quitar una oportunidad de favoritos.', '/api/favoritos'],
      ['RF15', 'Consultar el listado de usuarios registrados (administrador).', 'GET /api/auth/usuarios'],
      ['RF16', 'La aplicación móvil muestra los datos que vienen de la API en todas sus pantallas.', 'App Flutter'],
      ['RF17', 'La aplicación avisa cuando el servidor no está disponible y no guarda ningún cambio a medias.', 'App Flutter'],
    ]
  ),

  T('3.2 Requisitos no funcionales', 2),
  P('Las condiciones de calidad que debe cumplir el sistema:'),
  TABLA(
    ['#', 'Requisito', 'Cómo se cumple'],
    [
      ['RNF1', 'La información debe quedar guardada en un servidor, no en el dispositivo.', 'Toda la información pasa por la API y se guarda en MongoDB.'],
      ['RNF2', 'La sesión debe ser segura.', 'Token JWT firmado con JWT_SECRET, con vencimiento de 7 días.'],
      ['RNF3', 'Las contraseñas no se guardan en texto plano.', 'Hash con bcrypt y salt por usuario.'],
      ['RNF4', 'Solo el administrador puede modificar o borrar.', 'Middleware de roles (permitirRoles) en cada ruta protegida.'],
      ['RNF5', 'Los datos que llegan al servidor deben validarse.', 'express-validator en el servidor y validación de Mongoose en el modelo.'],
      ['RNF6', 'El sistema debe protegerse contra ataques comunes.', 'helmet, CORS, límite de intentos fallidos de login y manejo centralizado de errores.'],
      ['RNF7', 'La aplicación no debe colgarse si el servidor no responde.', 'Tiempo de espera en cada petición y aviso visible en pantalla.'],
      ['RNF8', 'La aplicación debe ser utilizable sin cambiar código.', 'La dirección del servidor se puede cambiar desde la pantalla de login.'],
      ['RNF9', 'El sistema debe ser comprobable de forma automática.', '31 pruebas del backend, 21 de la app y 39 peticiones de Postman.'],
      ['RNF10', 'El código debe estar organizado y ser legible.', 'Separación por capas (rutas, controladores, modelos, middleware) y comentarios en cada archivo.'],
      ['RNF11', 'El backend debe poder publicarse en internet.', 'Archivos render.yaml y Procfile, y configuración por variables de entorno.'],
    ]
  ),

  // ---------------- 4. CONFIGURACIÓN ----------------
  T('4. Configuración y puesta en marcha', 1),
  P('Requisitos previos: Node.js 18 o superior, y para la aplicación, Flutter 3.13 o superior con Android Studio.'),

  T('4.1 Cómo abrir la app y comprobar que funciona', 2),
  P(
    'La aplicación no tiene base de datos propia: todo lo que muestra viene de la API. ' +
      'Por eso, para abrirla y ver que funciona hay que tener la API encendida y el APK ' +
      'instalado. Son estos pasos:'
  ),
  P('Paso 1. Instalar Node.js 18 o superior (https://nodejs.org). Es el único programa que hay que instalar.'),
  P(
    'Paso 2. Encender la API. En la carpeta del paquete, hacer doble clic en ' +
      'INICIAR-API.bat. Ese archivo se encarga de todo: crea el archivo de ' +
      'configuración con la dirección de la base de datos, instala las dependencias, ' +
      'crea el administrador y enciende el servidor. La primera vez tarda un minuto.'
  ),
  P(
    'Al terminar, en esa misma ventana aparece el mensaje "API lista en ' +
      'http://localhost:4000". Para detenerla se presiona Ctrl + C en esa ventana.'
  ),
  P('Paso 3. Comprobar que la API está viva. En el navegador debe abrir http://localhost:4000/api/salud y mostrar: {"estado":"ok"}.'),
  P('Paso 4. Abrir la aplicación. Hay dos opciones:'),
  L('Instalar el APK (app-release.apk) en un celular Android: se le pasa el archivo, en el celular se va a Ajustes → Aplicaciones → acceso especial → Instalar aplicaciones desconocidas, se activa la app desde donde se abre el archivo, y luego se abre el APK y se le da a Instalar.'),
  L('O bien abrir el proyecto en Android Studio (carpeta bolivar_aprende_y_trabaja) y darle al botón Run, que abre el emulador.'),
  P('Paso 5. Iniciar sesión con el administrador: admin@bolivar.com y contraseña admin123.'),
  P(
    'Paso 6. Comprobar que todo está conectado. En el menú lateral se entra a ' +
      '"Gestión de datos": debe aparecer el chip verde "API conectada" y el listado de ' +
      'oportunidades que están guardadas en MongoDB. Si se crea una nueva, esta queda en la ' +
      'base de datos y aparece en el listado del inicio: ese es el ciclo completo de la API.'
  ),
  P(
    'Si la aplicación se abre en un celular físico y sale el aviso "Sin conexión con el ' +
      'servidor", es porque el celular tiene que buscar la API en la red local. En ese caso, ' +
      'en la pantalla de inicio de sesión se toca el botón "Servidor: ..." y se escribe la ' +
      'dirección del computador donde está la API, por ejemplo http://192.168.1.50:4000/api ' +
      '(el celular y el computador deben estar en la misma red). La aplicación la recuerda ' +
      'y las demás veces entra directo. En el emulador de Android Studio no hace falta nada ' +
      'de esto, porque ya apunta al localhost del computador.'
  ),

  T('4.2 Levantar la API', 2),
  P('1. Entrar a la carpeta del backend y instalar las dependencias:'),
  L('cd backend'),
  L('npm install'),
  P('2. Crear el archivo de configuración. Se copia el ejemplo y se completan los valores:'),
  L('cp .env.example .env'),
  TABLA(
    ['Variable', 'Para qué sirve'],
    [
      ['PORT', 'Puerto en el que escucha el servidor (4000).'],
      ['MONGO_URI', 'URL de conexión al cluster de MongoDB Atlas.'],
      ['JWT_SECRET', 'Texto largo e inventado con el que se firman los tokens.'],
      ['JWT_EXPIRES_IN', 'Vigencia del token (7d = 7 días).'],
      ['ADMIN_EMAIL / ADMIN_PASSWORD', 'Cuenta del administrador que crea npm run seed.'],
      ['RATE_LIMIT_MAX', 'Intentos de login fallidos permitidos en 15 minutos (100).'],
    ]
  ),
  P('3. Crear el administrador y unos datos de ejemplo, y encender el servidor:'),
  L('npm run seed       → crea admin@bolivar.com / admin123'),
  L('npm run semilla    → carga 7 oportunidades de ejemplo'),
  L('npm start          → http://localhost:4000'),
  P('4. Comprobar que la API está viva. En el navegador:'),
  L('http://localhost:4000/api/salud   →   {"estado":"ok"}'),
  P('La primera vez el servidor tarda unos 40 segundos en arrancar, porque la base de datos está en Atlas y la conexión es por internet.'),

  T('4.3 Correr la aplicación', 2),
  P('La dirección del servidor se indica al compilar. En el emulador de Android Studio se usa 10.0.2.2 (así el emulador ve el localhost del equipo); en un celular real se usa la IP local del equipo:'),
  L('flutter pub get'),
  L('flutter run --dart-define=API_URL=http://192.168.101.6:4000/api'),
  P(
    'Si el APK ya está compilado y se quiere cambiar de servidor, en la pantalla de ' +
      'inicio de sesión hay un botón "Servidor: ..." donde se escribe la dirección a mano. ' +
      'La aplicación también la busca sola al arrancar, de modo que funciona tanto en el ' +
      'emulador como en un teléfono real.'
  ),

  T('4.4 Compilar el APK de entrega', 2),
  L('flutter build apk --release --dart-define=API_URL=http://192.168.101.6:4000/api'),
  P('El archivo queda en build/app/outputs/flutter-apk/app-release.apk y se instala a mano en el celular (Ajustes → Aplicaciones → acceso especial → Instalar aplicaciones desconocidas).'),

  T('4.5 Instalar el APK en un celular', 2),
  L('Se le pasa el archivo app-release.apk al celular (WhatsApp, Drive o cable).'),
  L('En el celular: Ajustes → Aplicaciones → acceso especial → Instalar aplicaciones desconocidas → se activa la app desde donde se abre el archivo.'),
  L('Se abre el archivo y se le da a Instalar. Android pregunta si se permite la instalación: se acepta.'),
  P('El APK va firmado con la llave de depuración, que es lo normal en un proyecto académico: no hace falta ningún archivo de firma extra.'),

  T('4.6 Pruebas', 2),
  TABLA(
    ['Qué', 'Comando', 'Resultado'],
    [
      ['Pruebas del backend', 'npm test', '31 pruebas (Jest + Supertest)'],
      ['Pruebas de la API con Postman', 'npm run test:postman', '39 peticiones, 103 aserciones'],
      ['Reporte en HTML', 'npm run reporte:postman', 'postman/Reporte-pruebas-Postman.html'],
      ['Pruebas de la aplicación', 'flutter test --dart-define=API_URL=http://localhost:4000/api', '21 pruebas (Flutter Test)'],
      ['Ver los datos guardados', 'npm run ver', 'Muestra las colecciones de MongoDB'],
      ['Limpiar datos de prueba', 'npm run limpiar', 'Borra lo que dejaron las pruebas'],
      ['Ver la API sin conexión', 'npm run demo-apagada', 'Apaga la API y comprueba que no se guarda nada'],
    ]
  ),

  // ---------------- 5. RESULTADOS ----------------
  T('5. Resultados', 1),
  P('La aplicación quedó funcionando contra la API real. Las siguientes capturas se tomaron del celular, con el backend encendido.'),

  P('5.1 Inicio de sesión', 2),
  P('La pantalla de inicio de sesión. Abajo se ve la dirección del backend que la aplicación está usando; con el botón se puede cambiar sin recompilar.'),
  IMG('01-inicio-sesion.png', 'Figura 1. Inicio de sesión, con la dirección del servidor configurada.'),

  P('5.2 Panel del administrador', 2),
  P('El panel del administrador. Los contadores de cursos, ofertas y usuarios salen de la API, no de la base local del celular.'),
  IMG('02-inicio-admin.png', 'Figura 2. Panel del administrador con los datos leídos de la API.'),

  P('5.3 Menú lateral', 2),
  P('El menú lateral con las opciones disponibles para el administrador.'),
  IMG('03-menu-lateral.png', 'Figura 3. Menú lateral del administrador.'),

  P('5.4 Gestión de datos: el CRUD contra la API', 2),
  P(
    'La pantalla donde el administrador crea, edita y borra oportunidades. El chip verde ' +
      '"API conectada" confirma la comunicación con el servidor, y el texto "Datos guardados en ' +
      'la API del backend (MongoDB)" deja claro que no hay base de datos en el celular. ' +
      'Cada oportunidad tiene su botón de editar y el de borrar, que ejecutan el PUT y el ' +
      'DELETE contra la API.'
  ),
  IMG('04-gestion-datos.png', 'Figura 4. Pantalla de gestión de datos con la API conectada y las oportunidades publicadas.'),

  P('5.5 Formulario de creación', 2),
  P('El formulario de creación de una oportunidad académica. Al darle a Publicar se hace un POST a la API.'),
  IMG('05-formulario-oportunidad.png', 'Figura 5. Formulario de creación de oportunidad.'),

  P('5.6 Alertas', 2),
  P('La pestaña de alertas: el administrador puede enviar un aviso a todos los usuarios o a uno en particular.'),
  IMG('06-alertas.png', 'Figura 6. Pestaña de alertas del administrador.'),

  P('5.7 Resultado de las pruebas', 2),
  P('La colección de Postman cubre toda la API: 39 peticiones y 103 aserciones, todas en verde.'),
  IMG('07-reporte-postman.png', 'Figura 7. Reporte de las pruebas de Postman: 39 peticiones y 103 aserciones, 0 fallos.'),

  P('5.8 Resumen de las pruebas', 2),
  TABLA(
    ['Pruebas', 'Cantidad', 'Resultado'],
    [
      ['Backend (Jest + Supertest)', '31', '31 aprobadas'],
      ['Aplicación (Flutter Test)', '21', '21 aprobadas'],
      ['API con Postman', '39 peticiones / 103 aserciones', '0 fallos'],
    ]
  ),

  // ---------------- 6. CONCLUSIONES ----------------
  T('6. Conclusiones', 1),
  P(
    'Se implementó una API REST completa en Node.js con Express y MongoDB, con el CRUD de ' +
      'oportunidades, autenticación por token JWT, validación de los datos en el servidor y ' +
      'control de permisos por rol. Además se agregaron los módulos de favoritos, ' +
      'postulaciones, inscripciones y notificaciones, con 39 endpoints en total.'
  ),
  P(
    'La aplicación móvil quedó consumiendo esa API en su totalidad: se le quitó la base de ' +
      'datos local y ahora las cuentas, las oportunidades y las alertas se guardan en MongoDB. ' +
      'Eso hizo que el CRUD se notara de extremo a extremo: lo que el administrador publica en ' +
      '"Gestión de datos" aparece de inmediato en el listado de los usuarios, porque las dos ' +
      'pantallas leen de la misma fuente.'
  ),
  P(
    'Lo que más aprendí fue que una API no es solo escribir rutas: es también decidir qué ' +
      'puede ver cada rol, cómo se comportan los errores y cómo se comprueba que todo ' +
      'funciona. Durante el trabajo aparecieron varios errores reales que hubo que buscar y ' +
      'corregir: que el identificador de un documento se pudiera elegir desde el cliente, que ' +
      'las actualizaciones parciales fueran rechazadas, que el límite de intentos de login ' +
      'bloqueara las pruebas repetidas y que las pruebas de Postman no tuvieran en cuenta el ' +
      'orden en que se guardan las variables.'
  ),
  P(
    'Como trabajo futuro queda publicar la API en internet para que la aplicación se pueda ' +
      'usar desde cualquier red, y agregar la pantalla de favoritos en la aplicación, que la ' +
      'API ya soporta pero la app todavía no muestra.'
  ),

  // ---------------- 7. ANEXO ----------------
  T('7. Anexo', 1),

  T('7.1 Enlaces', 2),
  TABLA(
    ['Qué', 'Enlace'],
    [
      ['Aplicación móvil (APK)', '(completar: enlace de descarga)'],
      ['Código del backend (API, Node.js + Express)', 'https://github.com/Dani062/Bolivar'],
      ['Código de la aplicación (Android Studio, Flutter)', '(completar: enlace)'],
      ['Reporte de las pruebas de Postman', 'backend/postman/Reporte-pruebas-Postman.html'],
      ['Colección de Postman', 'backend/postman/Bolivar-Aprende-y-Trabaja.postman_collection.json'],
      ['Dirección de MongoDB Atlas', 'archivo configurar.env del paquete'],
    ]
  ),

  T('7.2 Contenido del paquete de entrega', 2),
  TABLA(
    ['Archivo', 'Qué es'],
    [
      ['INICIAR-API.bat', 'Doble clic y la API queda encendida (crea la configuración, instala y arranca).'],
      ['app-release.apk', 'La aplicación compilada, lista para instalar.'],
      ['Documentacion-Bolivar-Aprende-y-Trabaja.docx', 'Este documento.'],
      ['INSTRUCCIONES.md', 'Resumen: cómo abrir la app y cómo instalar el APK.'],
      ['configurar.env', 'El archivo de configuración de la base de datos.'],
      ['evidencias/', 'Las 7 capturas de la aplicación.'],
      ['backend/', 'El código de la API, sus pruebas y la colección de Postman.'],
      ['api-publica.txt', 'Dirección de la API publicada (para llenar).'],
    ]
  ),

  T('7.3 Estructura del proyecto', 2),
  TABLA(
    ['Carpeta o archivo', 'Contenido'],
    [
      ['backend/server.js', 'Punto de entrada: Express, seguridad, límite de intentos y rutas.'],
      ['backend/routes/', 'Definición de los endpoints de cada módulo.'],
      ['backend/controllers/', 'La lógica de cada endpoint.'],
      ['backend/models/', 'Los esquemas de Mongoose (6 colecciones).'],
      ['backend/middleware/', 'Verificación del token JWT y control de roles.'],
      ['backend/utils/', 'Los catálogos del dominio y las reglas de validación.'],
      ['backend/tests/', 'Las 31 pruebas automáticas del backend.'],
      ['backend/postman/', 'La colección de Postman y el reporte de las pruebas.'],
      ['app/lib/main.dart', 'Arranque de la aplicación y restauración de la sesión.'],
      ['app/lib/datos/api_cliente.dart', 'Cliente HTTP de toda la API.'],
      ['app/lib/datos/api_config.dart', 'Dirección del servidor y tiempos de espera.'],
      ['app/lib/datos/modelos.dart', 'Los modelos de la app (Usuario, Oferta, Postulación...).'],
      ['app/lib/datos/*_repositorio.dart', 'La capa que usa cada pantalla.'],
      ['app/lib/pantallas/', 'Las 5 pantallas de la aplicación.'],
      ['app/test/', 'Las 21 pruebas de la aplicación.'],
    ]
  ),
];

const q = (s) => String(s).replace(/'/g, "''");

const ps = `
$ErrorActionPreference = 'Stop'
$carpeta = '${q(carpeta)}'
$destino = '${q(destino)}'

if (Test-Path $destino) { Remove-Item $destino -Force }
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()

function Poner-Texto($texto, $estilo) {
  $p = $doc.Content.Paragraphs.Add()
  $p.Range.Text = $texto
  # Se usan los codigos de WdBuiltinStyle porque los nombres dependen del
  # idioma de Word (este esta en espanol).
  $p.Range.Style = $doc.Styles.Item($estilo)
  $p.Range.InsertParagraphAfter()
}

function Poner-Tabla($datos) {
  $filas = $datos.Count
  $cols = $datos[0].Count
  $rango = $doc.Range($doc.Content.End - 1, $doc.Content.End - 1)
  $tabla = $doc.Tables.Add($rango, $filas, $cols)
  for ($i = 0; $i -lt $filas; $i++) {
    for ($j = 0; $j -lt $cols; $j++) {
      $tabla.Cell($i + 1, $j + 1).Range.Text = [string]$datos[$i][$j]
    }
  }
  $tabla.Rows.Item(1).Range.Bold = $true
  $tabla.Borders.InsideLineStyle = 1
  $tabla.Borders.OutsideLineStyle = 1
  $tabla.Range.Font.Size = 9
  $doc.Content.InsertParagraphAfter()
}

${contenido
  .map((b) => {
    // Codigos de estilo de Word (independientes del idioma).
    const NORMAL = -1;
    const H1 = -2;
    const H2 = -3;
    const TITULO = -63;
    const LISTA = -180;

    if (b.tipo === 'titulo') {
      const est = b.nivel === 0 ? TITULO : b.nivel === 1 ? H1 : H2;
      return `Poner-Texto '${q(b.texto)}' (${est})`;
    }
    if (b.tipo === 'parrafo') return `Poner-Texto '${q(b.texto)}' (${NORMAL})`;
    if (b.tipo === 'lista') return `Poner-Texto '${q(b.texto)}' (${LISTA})`;
    if (b.tipo === 'salto') return `$doc.Content.InsertParagraphAfter()`;
    if (b.tipo === 'pagina')
      return `$p = $doc.Content.Paragraphs.Add(); $p.Range.InsertBreak(7); $doc.Content.InsertParagraphAfter()`;
    if (b.tipo === 'indice') {
      return `
$p = $doc.Content.Paragraphs.Add()
$toc = $doc.TablesOfContents.Add($p.Range, $true, 1, 2)
$doc.Content.InsertParagraphAfter()`;
    }
    if (b.tipo === 'tabla') {
      const datos = [b.cabeceras, ...b.filas];
      return `Poner-Tabla @(${datos
        .map((f) => '@(' + f.map((c) => `'${q(c)}'`).join(',') + ')')
        .join(',')})`;
    }
    return '';
  })
  .filter(Boolean)
  .join('\n')}

${contenido
  .filter((b) => b.tipo === 'imagen')
  .map(
    (b) => `
$ruta = Join-Path $carpeta '${b.archivo}'
if (Test-Path $ruta) {
  $p = $doc.Content.Paragraphs.Add()
  $shape = $p.Range.InlineShapes.AddPicture($ruta)
  $shape.LockAspectRatio = -1
  $shape.Width = 340
  $p.Range.InsertParagraphAfter()
  $q2 = $doc.Content.Paragraphs.Add()
  $q2.Range.Text = '${q(b.pie)}'
  $q2.Range.Style = $doc.Styles.Item(-35)
  $q2.Alignment = 1
  $q2.Range.InsertParagraphAfter()
}`
  )
  .join('\n')}

# Se actualiza la tabla de contenido para que salga con los numeros de pagina.
if ($doc.TablesOfContents.Count -gt 0) { $doc.TablesOfContents.Item(1).Update() }

$doc.SaveAs2($destino, 16)
$doc.Close()
$word.Quit()
Write-Output "OK"
`;

const rutaPs = path.join(carpeta, '_generar.ps1');
// Con BOM: si no, Windows PowerShell 5.1 lee el archivo como ANSI y rompe
// los textos con acentos y las flechas.
fs.writeFileSync(rutaPs, '\uFEFF' + ps, 'utf8');
try {
  const salida = execFileSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', rutaPs],
    { encoding: 'utf8' }
  );
  console.log(salida.trim());
  console.log('Documento generado:', destino);
} catch (e) {
  console.error('Error al generar el documento:', e.message);
  console.error(e.stdout || '');
} finally {
  fs.rmSync(rutaPs, { force: true });
}
