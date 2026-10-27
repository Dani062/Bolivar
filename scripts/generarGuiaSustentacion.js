// Genera la guia de sustentacion en Word.
// Uso: node scripts/generarGuiaSustentacion.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const carpetaEntrega = path.join(__dirname, '..', '..', 'ENTREGA-Bolivar');
const destino = path.join(carpetaEntrega, 'Guia-de-Sustentacion.docx');

const T = (texto, nivel = 1) => ({ tipo: 'titulo', texto, nivel });
const P = (texto) => ({ tipo: 'parrafo', texto });
const L = (texto) => ({ tipo: 'lista', texto });
const TABLA = (cabeceras, filas) => ({ tipo: 'tabla', cabeceras, filas });
const SALTO = () => ({ tipo: 'salto' });

const contenido = [
  T('Guía de sustentación', 0),
  P('Bolívar Aprende y Trabaja — API REST en Node.js + Express con MongoDB y app móvil en Flutter'),
  P('Este documento tiene: qué decir, qué hacer en cada momento de la demo, las preguntas que puede hacerte el profesor con sus respuestas, los datos que debés tener a mano y qué hacer si algo falla.'),
  SALTO(),

  // ================= 1. ANTES =================
  T('1. Antes de sustentar (checklist)', 1),
  TABLA(
    ['#', 'Qué revisar', 'Cómo se comprueba'],
    [
      ['1', 'La API está encendida.', 'Abrir http://localhost:4000/api/salud → debe salir {"estado":"ok"}.'],
      ['2', 'La base de datos tiene datos.', 'En la terminal, dentro de backend: npm run ver → deben verse 2 usuarios y 7 oportunidades.'],
      ['3', 'El administrador existe.', 'Entrar con admin@bolivar.com / admin123 (la app lo pide).'],
      ['4', 'La app está abierta.', 'En el emulador de Android Studio, o el APK instalado en el celular.'],
      ['5', 'Postman tiene la colección importada.', 'Que se vea la colección "Bolivar Aprende y Trabaja - API" en la barra lateral.'],
      ['6', 'Tener a la mano estas cuatro cosas.', 'La documentación (Word), Postman, Android Studio con el proyecto de la app abierto, y una terminal en la carpeta backend.'],
    ]
  ),
  P('Consejo: no cierres la terminal del backend durante la sustentación, porque es la que sostiene la API.'),

  // ================= 2. EL GUION =================
  T('2. El guion: qué decir en cada parte', 1),
  P('Los textos entre comillas son lo que decís. Adaptalos a tu forma de hablar, pero mantené las ideas y los datos.'),

  T('2.1 Saludo y de qué se trata (30 segundos)', 2),
  P('"Buenos días. Mi nombre es [tu nombre] y les presento el proyecto Bolívar Aprende y Trabaja, que es una aplicación móvil donde los estudiantes del departamento de Bolívar encuentran oportunidades de educación, trabajo y emprendimiento."'),
  P('"El trabajo consistió en dos cosas: construir una API REST en Node.js con Express que maneja esa información, y hacer que la aplicación móvil la consuma. La idea es que la información viva en un servidor y no en el celular de cada persona."'),

  T('2.2 El problema que resuelve (1 minuto)', 2),
  P('"Antes, la información estaba guardada en el celular de cada usuario. Eso traía dos problemas: si alguien perdía el celular perdía los datos, y un administrador no podía publicar una oferta y que los demás la vieran, porque cada uno tenía su propia copia."'),
  P('"Con una API REST en el medio, la información está en una base de datos central. Un administrador publica y todos ven lo nuevo de inmediato."'),

  T('2.3 La arquitectura (1 minuto)', 2),
  P('"Son tres capas:"'),
  L('El celular: la aplicación en Flutter. Es el cliente. Importante: ya no tiene base de datos propia.'),
  L('La API: Node.js con Express. Expone los endpoints, valida los datos y controla los permisos.'),
  L('La base de datos: MongoDB en Atlas, en la nube. Ahí se guardan las seis colecciones.'),
  P('"Entre la app y la API hay un token JWT: la app inicia sesión, la API le devuelve un token y lo manda en cada petición. El rol decide qué puede hacer cada uno: ver es para todos, crear, editar, borrar y mandar alertas es solo del administrador."'),
  P('Si tenés un diagrama hecho en draw.io o similar, mostralo acá.'),

  T('2.4 La API y el CRUD (2 minutos)', 2),
  P('"La API expone 39 endpoints repartidos en 6 módulos. El CRUD principal es el de oportunidades, que es el tema de gestión de la actividad:"'),
  TABLA(
    ['Método', 'Ruta', 'Qué hace', 'Permiso'],
    [
      ['GET', '/api/oportunidades', 'Lista las activas, con filtros por municipio, categoría, tipo y clase', 'Público'],
      ['GET', '/api/oportunidades/todas', 'Lista todas, incluidas las cerradas y pendientes', 'Administrador'],
      ['GET', '/api/oportunidades/:id', 'Devuelve una oportunidad', 'Público'],
      ['POST', '/api/oportunidades', 'Crea una oportunidad', 'Administrador'],
      ['PUT', '/api/oportunidades/:id', 'Actualiza, validando solo los campos que llegan', 'Administrador'],
      ['DELETE', '/api/oportunidades/:id', 'Elimina una oportunidad', 'Administrador'],
    ]
  ),
  P('"Los otros módulos son autenticación, favoritos, postulaciones, inscripciones y notificaciones."'),
  P('"Dos detalles de seguridad que vale la pena mencionar: el identificador del documento lo pone el servidor, nunca el cliente; y el PUT valida únicamente los campos que se envían, para que se pueda cambiar un solo dato sin mandar la oportunidad completa."'),

  T('2.5 La base de datos (1 minuto)', 2),
  P('"MongoDB, con seis colecciones:"'),
  TABLA(
    ['Colección', 'Qué guarda'],
    [
      ['usuarios', 'nombre, apellido, email, contraseña con hash, municipio, identificación, teléfono, tipo de perfil, rol'],
      ['oportunidades', 'título, descripción, clase, categoría, tipo, municipio, requisitos, cupos, empresa, cargo, salario, estado, autor'],
      ['favoritos', 'usuario y oportunidad (con índice único para no repetir)'],
      ['postulaciones', 'usuario, oportunidad y estado (Enviada / En revisión / Aceptada / Rechazada)'],
      ['inscripciones', 'usuario, oportunidad y estado (Inscrito / Anulada)'],
      ['notificaciones', 'usuario, título, ícono, mensaje y si ya fue leída'],
    ]
  ),
  P('"Todas las referencias usan el ObjectId de MongoDB, que es un texto. Por eso en la app el id de cada oportunidad es un String y no un número."'),

  T('2.6 La aplicación (1 minuto)', 2),
  P('"La app tiene 5 pantallas: inicio de sesión, crear cuenta, panel principal, Gestión de datos y el menú lateral. Todo lo que se ve sale de la API."'),
  P('"Un detalle importante: si el backend está apagado, la app no se cae. Muestra un aviso de que no hay conexión y no guarda nada a medias, porque la base de datos es el servidor."'),
  P('"Y otra cosa que nos servió: la app busca sola cuál de las direcciones configuradas responde, de modo que el mismo APK funciona en el emulador de Android Studio y en un teléfono real sin cambiar nada."'),

  T('2.7 La demostración (3 minutos)', 2),
  P('"Ahora se los muestro funcionando." (Pasá a la sección 3, que es el paso a paso exacto.)'),

  T('2.8 Las pruebas (1 minuto)', 2),
  P('"Hay tres tipos de pruebas, todas automáticas:"'),
  L('31 pruebas del backend con Jest y Supertest: registro, login, permisos por rol, el CRUD completo, validaciones y los casos de error.'),
  L('21 pruebas de la aplicación con Flutter Test: integración contra el backend real y pruebas de la pantalla de login.'),
  L('39 peticiones de Postman con 103 aserciones, que cubren toda la API.'),
  P('"Las tres pasan. Acá muestro el reporte de Postman, que se genera con npm run reporte:postman." (Mostrá la imagen o el reporte HTML.)'),
  P('Si te piden cómo se corren: npm test en el backend, flutter test en la app, y npm run test:postman para la colección.'),

  T('2.9 Conclusión y cierre (1 minuto)', 2),
  P('"Para cerrar: se implementó una API REST completa en Node.js con Express y MongoDB, con el CRUD de oportunidades, autenticación por token JWT, validación de datos y control de permisos por rol. Y la aplicación móvil quedó consumiendo esa API en su totalidad: no tiene base de datos propia, todo se guarda en el servidor."'),
  P('"Lo que más aprendí es que una API no es solo escribir rutas: es también decidir qué puede ver cada rol, cómo se comportan los errores y cómo se comprueba que todo funciona. Durante el trabajo aparecieron varios errores reales que hubo que buscar y corregir: que el identificador de un documento se pudiera elegir desde el cliente, que las actualizaciones parciales fueran rechazadas, que el límite de intentos de login bloqueara las pruebas repetidas, y que las pruebas de Postman no tuvieran en cuenta el orden en que se guardan las variables."'),
  P('"Como trabajo futuro quedaría publicar la API en internet para que la aplicación se pueda usar desde cualquier red, y agregar la pantalla de favoritos, que la API ya soporta pero la app todavía no muestra."'),
  P('"Ese es el proyecto. ¿Tienen alguna pregunta?"'),

  // ================= 3. LA DEMO =================
  T('3. La demostración, paso a paso', 1),
  P('Hacé esto en este orden. La columna del medio es lo que hacés y la de la derecha es lo que decís mientras lo hacés.'),
  TABLA(
    ['Momento', 'Qué hacés', 'Qué decís'],
    [
      ['1', 'En el navegador, abrís http://localhost:4000/api/salud', '"Esta es la API, respondiendo."'],
      ['2', 'Abrís la terminal en la carpeta backend y ejecutás npm run ver', '"Esto es lo que hay guardado en MongoDB: los usuarios y las oportunidades."'],
      ['3', 'En la app: login con admin@bolivar.com / admin123', '"Entro como administrador."'],
      ['4', 'Menú lateral → "Gestión de datos"', '"Aquí es donde se publica. Miren el chip: dice API conectada, o sea que la app se está comunicando con el servidor."'],
      ['5', 'Mostrás las 3 oportunidades listadas', '"Estas son las que están en la base de datos, no en el celular."'],
      ['6', 'Tocás "+ Nueva oportunidad académica" y la creás (nombre, descripción, cupos)', '"Voy a publicar una nueva. Al darle a Publicar se hace un POST a la API."'],
      ['7', 'Ves que aparece en la lista', '"Ya está. Fue a la base de datos y volvió."'],
      ['8', ' Tocás el ícono de editar, cambias el título y guardás', '"Ahora un PUT: actualicé solo el título, y el resto de los datos quedó igual."'],
      ['9', 'Tocás el ícono de borrar y confirmás', '"Y ahora un DELETE. Si quieren, la revuelvo a crear para que les quede la base con los 7 datos de ejemplo."'],
      ['10', 'Vuelves al inicio y muestras el listado', '"Esto es lo mismo que ven los estudiantes: lo que publica el administrador aparece de inmediato, porque las dos pantallas leen de la misma API."'],
      ['11', 'Postman: abrís la colección y le das Run', '"Y estas son las 39 peticiones de la API, con sus pruebas automáticas. Todas en verde."'],
    ]
  ),
  P('Importante: después del paso 6 creaste una oportunidad de prueba. Si querés dejar la base como estaba, usá npm run limpiar en la carpeta backend.'),

  // ================= 4. PREGUNTAS =================
  T('4. Preguntas que puede hacerte y cómo responderlas', 1),

  T('4.1 Sobre la API', 2),
  TABLA(
    ['Pregunta', 'Respuesta'],
    [
      ['¿Por qué Express y no otro framework?', 'Es el más usado en Node.js, es liviano y tiene middlewares, que es justo lo que se necesita para la autenticación por token y el control de roles.'],
      ['¿Qué es un token JWT?', 'Un identificador firmado por el servidor. Cuando el usuario inicia sesión, la API le devuelve un token con su id y su rol; la app lo manda en cada petición y la API lo valida. No guarda contraseñas ni sesiones en el servidor.'],
      ['¿Cómo se valida que el que llama es administrador?', 'Con un middleware de roles: cada ruta protegida dice qué roles puede usarla. Si el rol no está, responde 403.'],
      ['¿Qué pasa si alguien intenta crear una oportunidad sin ser administrador?', 'La ruta responde 403 Forbidden. Está en las pruebas de Postman.'],
      ['¿Por qué guardan el identificador del documento en el servidor y no el cliente?', 'Porque si el cliente lo pudiera elegir, podría sobrescribir el documento de otro. El servidor lo pone siempre, y el POST ignora el _id que le manden.'],
      ['¿Cómo manejan los errores?', 'Todo error pasa por un manejador central que devuelve un JSON con un mensaje claro, en vez de la página en blanco de Node.'],
      ['¿Qué pasa si el backend se apaga?', 'La app no se cae: muestra un aviso de que no hay conexión y no guarda nada a medias, porque la base de datos es el servidor.'],
    ]
  ),

  T('4.2 Sobre la base de datos', 2),
  TABLA(
    ['Pregunta', 'Respuesta'],
    [
      ['¿Por qué MongoDB y no MySQL?', 'El enunciado lo daba como opción, y MongoDB funciona bien con documentos JSON, que es lo que maneja la API. Además ya estaba en Atlas, que es la nube, y eso permite entregar sin instalar nada.'],
      ['¿Cómo se guardan las contraseñas?', 'Con hash bcrypt y una sal por usuario. Aunque alguien viendo la base de datos no puede saber la contraseña original.'],
      ['¿Qué pasa con los datos duplicados?', 'Hay índices únicos: por ejemplo, un correo no se puede registrar dos veces, y un usuario no se puede postalar dos veces a la misma oferta.'],
      ['¿Las notificaciones las manda la app?', 'No. Las crea el servidor: cuando alguien se postula, el backend le avisa al administrador; cuando el administrador cambia el estado, le avisa al estudiante.'],
    ]
  ),

  T('4.3 Sobre la aplicación', 2),
  TABLA(
    ['Pregunta', 'Respuesta'],
    [
      ['¿La app tiene base de datos?', 'No. Se le quitó la base local (sqflite) justamente para que todo quede en el servidor. Lo único que se guarda en el celular es el token de la sesión y la foto de perfil.'],
      ['¿Cómo cambia de servidor?', 'En la pantalla de inicio de sesión hay un botón "Servidor: ..." donde se escribe la dirección. Además, al arrancar, la app busca sola cuál de las direcciones configuradas responde, por eso funciona en el emulador y en un teléfono real.'],
      ['¿Por qué Flutter y no nativo?', 'Porque el enunciado es de la materia y Flutter permite hacer la app para Android desde el mismo código, con una sola base de código.'],
      ['¿Qué probaron de la app?', '21 pruebas automáticas: integración contra el backend de verdad (registro, login, perfil, el CRUD, postulación, inscripción y notificaciones) y pruebas de la pantalla de login.'],
    ]
  ),

  T('4.4 Preguntas incómodas', 2),
  TABLA(
    ['Pregunta', 'Respuesta'],
    [
      ['¿Y si el profesor no tiene internet?', 'La base está en Atlas, así que la API necesita internet. Por eso el paquete incluye un archivo que levanta la API localmente con un doble clic.'],
      ['¿Cuánto tiempo les va a tomar?', 'La primera vez, instalar las dependencias de Node.js toma un minuto. Después, la API arranca en segundos.'],
      ['¿Esto ya está en producción?', 'No. Está preparada para publicarse: hay un archivo render.yaml que configura el despliegue en Render con un clic, y el README explica el proceso.'],
      ['¿Qué fue lo más difícil?', 'Que la app y la API se entendieran de verdad. Al principio la app guardaba sus datos en el celular y la API aparte; migrarlo todo fue lo que hizo que el CRUD funcionara de extremo a extremo.'],
    ]
  ),

  // ================= 5. DATOS =================
  T('5. Datos y números que tenés que tener a mano', 1),
  TABLA(
    ['Dato', 'Número'],
    [
      ['Endpoints de la API', '39 (12 grupos en la colección de Postman)'],
      ['Módulos de la API', '6 (oportunidades, autenticación, favoritos, postulaciones, inscripciones, notificaciones)'],
      ['Colecciones en MongoDB', '6'],
      ['Pruebas del backend', '31 (3 suites con Jest y Supertest)'],
      ['Pruebas de la aplicación', '21 (Flutter Test)'],
      ['Aserciones de Postman', '103 (0 fallos)'],
      ['Datos de ejemplo', '2 usuarios y 7 oportunidades'],
      ['Tecnología de la app', 'Flutter, Android, MVVM, paquete http'],
      ['Tecnología del backend', 'Node.js, Express, Mongoose, JWT, bcrypt, express-validator'],
      ['Puerto de la API', '4000'],
      ['Credenciales del administrador', 'admin@bolivar.com / admin123'],
      ['Cuenta para la API desde el emulador', 'http://10.0.2.2:4000/api'],
      ['Cuenta para la API desde un celular', 'la IP local del equipo, por ejemplo http://192.168.101.6:4000/api'],
    ]
  ),

  // ================= 6. PROBLEMAS =================
  T('6. Si algo falla durante la demostración', 1),
  TABLA(
    ['Qué pasa', 'Qué hacer'],
    [
      ['La app dice "Sin conexión con el servidor"', 'Levantar la API (doble clic en INICIAR-API.bat) y tocar "Reintentar" en la app.'],
      ['El login dice "El servidor no respondió a tiempo"', 'La API no está encendida, o la app está buscando en otra dirección. Comprobar http://localhost:4000/api/salud en el navegador.'],
      ['Postman muestra 429 Too Many Requests', 'Se hicieron demasiados intentos de login seguidos. Esperar un momento y volver a correr.'],
      ['La API no arranca', 'Mirar el mensaje en la ventana del .bat: si dice que falta Node.js, hay que instalarlo; si dice que falta configurar.env, se copió mal el archivo.'],
      ['No hay datos en la base', 'En la carpeta backend: npm run semilla (carga 7 oportunidades) y npm run seed (crea el administrador).'],
      ['La colección de Postman no aparece', 'Hay que activarla con el ícono del ojo, en la barra lateral derecha, y seleccionar el entorno en la esquina superior derecha.'],
    ]
  ),

  T('7. Frases útiles para los momentos difíciles', 1),
  TABLA(
    ['Momento', 'Qué decir'],
    [
      ['Si algo no responde', '"Permítanme reiniciarlo un momento." (Y usar el tiempo para revisar si la API quedó encendida.)'],
      ['Si te preguntan algo que no sabes', '"No lo tengo verificado en este momento, pero lo reviso y se lo envío." Es mejor que inventar.'],
      ['Si te piden cambiar algo en vivo', '"Se los muestro ahora mismo." (Y lo haces: es la mejor evidencia.)'],
      ['Si preguntan por algo que no hiciste', '"Eso quedó como trabajo futuro." (Y lo dices: por ejemplo la pantalla de favoritos y publicar la API en internet.)'],
    ]
  ),
];

const q = (s) => String(s).replace(/'/g, "''");

const ps = `
$ErrorActionPreference = 'Stop'
$destino = '${q(destino)}'

if (Test-Path $destino) { Remove-Item $destino -Force }
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()

function Poner-Texto($texto, $estilo) {
  $p = $doc.Content.Paragraphs.Add()
  $p.Range.Text = $texto
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

$doc.SaveAs2($destino, 16)
$doc.Close()
$word.Quit()
Write-Output "OK"
`;

const rutaPs = path.join(path.dirname(destino), '_guia.ps1');
fs.writeFileSync(rutaPs, '﻿' + ps, 'utf8');
try {
  const salida = execFileSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', rutaPs],
    { encoding: 'utf8' }
  );
  console.log(salida.trim());
  console.log('Guia generada:', destino);
} catch (e) {
  console.error('Error:', e.message);
  console.error(e.stdout || '');
} finally {
  fs.rmSync(rutaPs, { force: true });
}
