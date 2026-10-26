// Genera el documento de Word con las capturas de la app.
// Uso: node scripts/generarDocumento.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// El documento se escribe en la carpeta de evidencias, al lado de las
// capturas: asi se puede editar a mano y no se pierde al re-empaquetar.
const carpeta = path.join(__dirname, '..', 'evidencias');
const destino = path.join(carpeta, 'Documentacion-Bolivar-Aprende-y-Trabaja.docx');

const T = (titulo, nivel = 1) => ({ tipo: 'titulo', texto: titulo, nivel });
const P = (texto) => ({ tipo: 'parrafo', texto });
const L = (texto) => ({ tipo: 'lista', texto });
const IMG = (archivo, pie) => ({ tipo: 'imagen', archivo, pie });
const TABLA = (cabeceras, filas) => ({ tipo: 'tabla', cabeceras, filas });
const SALTO = () => ({ tipo: 'salto' });

const contenido = [
  T('Bolívar Aprende y Trabaja', 0),
  P('API REST en Node.js + Express con MongoDB y app móvil en Flutter'),
  SALTO(),

  T('1. Introducción', 1),
  P(
    'Bolívar Aprende y Trabaja es una aplicación móvil que centraliza las oportunidades de ' +
      'educación, trabajo y emprendimiento del departamento de Bolívar. Antes de este cambio, ' +
      'cada usuario tenía su propia copia de la información dentro del celular, lo que hacía ' +
      'imposible que un administrador publicara una oferta y los demás la vieran. ' +
      'En esta versión, toda la información vive en una base de datos central (MongoDB) y la ' +
      'app se convierte en el cliente de esa base de datos a través de una API REST.'
  ),
  P(
    'El objetivo de este trabajo es construir una API REST funcional que implemente el CRUD ' +
      'completo (GET, POST, PUT y DELETE) sobre el módulo de gestión de oportunidades, y ' +
      'consumirla desde la aplicación móvil para que funcione de extremo a extremo.'
  ),

  T('2. Arquitectura', 1),
  P(
    'El sistema tiene tres capas. La app móvil (Flutter, Android) no tiene base de datos ' +
      'propia: es el cliente. La API (Node.js + Express) expone los endpoints, valida los ' +
      'datos y controla los permisos. La base de datos (MongoDB en Atlas) guarda todo lo que ' +
      'la app registra: cuentas, oportunidades, postulaciones, inscripciones, notificaciones y ' +
      'favoritos.'
  ),
  P('Celular (Flutter)  →  HTTP + JSON + token JWT  →  API (Express)  →  MongoDB Atlas'),
  P(
    'La sesión se maneja con tokens JWT: la app inicia sesión, la API devuelve un token y ' +
      'lo envía en cada petición protegida dentro del encabezado Authorization. Solo el rol ' +
      'administrador puede crear, editar y borrar oportunidades y enviar alertas.'
  ),

  T('3. La API', 1),
  P('La API expone 39 endpoints REST agrupados en módulos. El CRUD principal es el de oportunidades:'),
  TABLA(
    ['Método', 'Ruta', 'Descripción', 'Permiso'],
    [
      ['GET', '/api/oportunidades', 'Lista las oportunidades activas, con filtros por municipio, categoría, tipo y clase', 'Público'],
      ['GET', '/api/oportunidades/todas', 'Lista todas, incluidas las cerradas y pendientes', 'Administrador'],
      ['GET', '/api/oportunidades/:id', 'Devuelve una oportunidad', 'Público'],
      ['POST', '/api/oportunidades', 'Crea una oportunidad', 'Administrador'],
      ['PUT', '/api/oportunidades/:id', 'Actualiza (valida solo los campos que llegan)', 'Administrador'],
      ['DELETE', '/api/oportunidades/:id', 'Elimina una oportunidad', 'Administrador'],
    ]
  ),
  P('Los demás módulos:'),
  L('/api/auth — registro, inicio de sesión, perfil y listado de usuarios.'),
  L('/api/favoritos — marcar y quitar una oportunidad de favoritos.'),
  L('/api/postulaciones — postularse a una oferta laboral y cambiar su estado.'),
  L('/api/inscripciones — inscribirse a un curso y anular la inscripción.'),
  L('/api/notificaciones — avisos del usuario y alertas del administrador.'),
  P(
    'La API también incluye validación de datos en el servidor (express-validator), ' +
      'encriptación de contraseñas (bcrypt), protección contra fuerza bruta (límite de ' +
      'intentos fallidos) y un manejador central de errores.'
  ),

  T('4. La base de datos', 1),
  P('MongoDB, con seis colecciones:'),
  TABLA(
    ['Colección', 'Qué guarda'],
    [
      ['usuarios', 'nombre, apellido, email, contraseña (con hash), municipio, identificación, teléfono, tipo de perfil, rol, activo'],
      ['oportunidades', 'título, descripción, clase, categoría, tipo, municipio, entidad organizadora, requisitos, cupos, empresa, cargo, salario, ubicación, contacto, estado, autor'],
      ['favoritos', 'usuario y oportunidad (con índice único para no repetir)'],
      ['postulaciones', 'usuario, oportunidad y estado (Enviada / En revisión / Aceptada / Rechazada)'],
      ['inscripciones', 'usuario, oportunidad y estado (Inscrito / Anulada)'],
      ['notificaciones', 'usuario, título, ícono, mensaje y si ya fue leída'],
    ]
  ),
  P(
    'Todas las referencias usan el ObjectId de MongoDB (un texto de 24 caracteres). ' +
      'Por eso en la app el identificador de cada oportunidad es un String y no un número.'
  ),

  T('5. La aplicación móvil', 1),
  P(
    'La app tiene 5 pantallas: inicio de sesión, crear cuenta, panel principal, ' +
      'Gestión de datos (donde el administrador publica y borra) y el menú lateral. ' +
      'Todo lo que se ve sale de la API: al abrir la app se descargan las oportunidades, ' +
      'y al volver de "Gestión de datos" se vuelve a consultar, por lo que lo que el ' +
      'administrador publica aparece de inmediato en el listado de los usuarios.'
  ),
  P(
    'Un detalle importante: si el backend está apagado, la app no se cae. Muestra un aviso ' +
      '"Sin conexión con el servidor" y no guarda nada a medias, porque la base de datos ' +
      'es el backend. Además, al arrancar la app busca sola cuál de las direcciones ' +
      'configuradas responde, de modo que el mismo APK funciona en el emulador de Android ' +
      'Studio y en un teléfono real sin cambiar nada.'
  ),

  T('6. Pruebas', 1),
  P('Se hicieron tres tipos de pruebas, todas automatizadas:'),
  L('31 pruebas del backend con Jest y Supertest: registro, login, permisos por rol, el CRUD completo, validaciones y los casos de error.'),
  L('21 pruebas de la app con Flutter Test: integración contra el backend real y pruebas de la pantalla de login.'),
  L('39 peticiones de Postman con 102 aserciones, que cubren toda la API.'),
  P('Para correrlas:'),
  L('cd backend && npm test'),
  L('cd backend && npm run test:postman'),
  L('cd app && flutter test --dart-define=API_URL=http://localhost:4000/api'),
  P('El reporte de Postman quedó en postman/Reporte-pruebas-Postman.html y muestra que las 39 peticiones y las 102 aserciones pasan:'),
  IMG('07-reporte-postman.png', 'Figura 1. Reporte de las pruebas de Postman: 39 peticiones y 102 aserciones, todas en verde.'),

  T('7. Evidencias de la app funcionando', 1),
  P('Las siguientes capturas se tomaron del celular, con la app hablando con la API real:'),
  IMG('01-inicio-sesion.png', 'Figura 2. Pantalla de inicio de sesión. Abajo se ve la dirección del backend que la app está usando.'),
  IMG('02-inicio-admin.png', 'Figura 3. Panel del administrador. Los contadores (cursos, ofertas, usuarios) salen de la API.'),
  IMG('03-menu-lateral.png', 'Figura 4. Menú lateral con las opciones del administrador.'),
  IMG('04-gestion-datos.png', 'Figura 5. Pantalla "Gestión de datos": el chip verde "API conectada" confirma la conexión con el backend y las oportunidades son las que están guardadas en MongoDB.'),
  IMG('05-formulario-oportunidad.png', 'Figura 6. Formulario de creación. El texto "Se guarda en la API del backend (MongoDB)" indica que no hay base de datos local.'),
  IMG('06-alertas.png', 'Figura 7. Pestaña de alertas: el administrador puede mandar un aviso a todos o a un usuario.'),

  T('8. Conclusiones', 1),
  P(
    'Se implementó una API REST completa en Node.js con Express y MongoDB, con el CRUD de ' +
      'oportunidades, autenticación por token JWT, validación de datos y control de permisos ' +
      'por rol. La aplicación móvil quedó consumiendo esa API en su totalidad: no tiene base ' +
      'de datos propia y todo lo que registra o publica queda guardado en el servidor.'
  ),
  P(
    'Lo que más aprendí fue que una API no es solo escribir rutas: es también decidir qué ' +
      'datos puede ver cada rol, cómo se comportan los errores y cómo se comprueba que todo ' +
      'funciona. Durante el trabajo se encontraron y corrigieron varios errores reales, como ' +
      'que el identificador de un documento se pudiera elegir desde el cliente, que las ' +
      'actualizaciones parciales fueran rechazadas y que las pruebas de Postman no tuvieran ' +
      'en cuenta el orden en que se guardan las variables.'
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
  $shape.Width = 360
  $p.Range.InsertParagraphAfter()
  $q2 = $doc.Content.Paragraphs.Add()
  $q2.Range.Text = '${q(b.pie)}'
  $q2.Range.Style = $doc.Styles.Item(-35)
  $q2.Alignment = 1
  $q2.Range.InsertParagraphAfter()
}`
  )
  .join('\n')}

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
