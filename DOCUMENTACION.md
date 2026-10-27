# Documentación — Backend (Node.js + Express + MongoDB)

Carpeta: `C:\Users\Daniela Paez\OneDrive\Desktop\Archisvos\backend`
Puerto: **4000** · Base de datos: **MongoDB Atlas** (la URL está en `.env`, no compartirlo)
La app Flutter de Bolívar Aprende y Trabaja se conecta a `http://<IP-de-la-PC>:4000/api`.

---

## 1. ¿Qué es?

API REST que guarda las **oportunidades** (educación, trabajo, emprendimiento) y los **usuarios** en MongoDB. Es la fuente de verdad de la pantalla **Gestión de datos** de la app: si el servidor está apagado, la app no puede crear, editar ni borrar oportunidades.

---

## 2. Cómo levantarla

```powershell
Set-Location "C:\Users\Daniela Paez\OneDrive\Desktop\Archisvos\backend"
npm install        # solo la primera vez
npm run dev        # modo desarrollo (nodemon, se reinicia solo)
npm start          # modo normal (node server.js)
```

Probar que está viva: abrir `http://localhost:4000/api/salud` → `{"estado":"ok"}`.

Para que **el celular** llegue al servidor, la PC y el teléfono deben estar en la misma red Wi-Fi y la dirección que use la app debe ser la de la PC (hoy: `192.168.101.6`).

> **La dirección ya no hay que editarla a mano.** En la carpeta `backend`:
>
> ```powershell
> npm run url
> ```
>
> imprime la IP de la PC y el comando exacto de `flutter run` que hay que
> copiar. Y en la app, la pantalla de login tiene un botón **"Servidor: ..."**
> donde se puede cambiar la dirección sin recompilar.

### 2.1 Publicarla en internet (para entregar el APK)

El APK no lleva la base de datos: si el profesor lo instala en su casa,
necesita un backend accesible desde internet. La base ya lo está (MongoDB
Atlas); solo falta publicar el servidor.

El proyecto incluye `render.yaml`, que configura el servicio solo en
[Render](https://render.com) (gratis):

1. Crear una cuenta en Render y **New → Blueprint** apuntando al
   repositorio `https://github.com/Dani062/Bolivar`.
2. Pegar el valor de `MONGO_URI` (es el del `.env` de esta máquina).
3. Render da una dirección tipo
   `https://bolivar-aprende-y-trabaja-api.onrender.com`.

Después se compila la app apuntando a esa dirección:

```powershell
flutter build apk --release --dart-define=API_URL=https://bolivar-aprende-y-trabaja-api.onrender.com/api
```

> El plan gratis de Render apaga el servicio si nadie lo usa 15 minutos, y
> tarda medio minuto en despertarse. Por eso la app espera hasta 45 segundos
> en el primer intento (el login).

### Scripts disponibles (`package.json`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor con nodemon |
| `npm start` | Servidor normal |
| `npm run seed` | Crea (o corrige) el administrador en MongoDB (`scripts/crearAdmin.js`) |
| `npm run semilla` | Carga oportunidades de ejemplo en MongoDB (`scripts/semilla.js`). Es idempotente: no duplica las que ya están. |
| `npm run limpiar` | Borra los datos que dejan las pruebas automáticas (`scripts/limpiarPruebas.js`). No toca las cuentas reales ni las oportunidades publicadas desde la app. |
| `npm run ver` | Imprime el contenido de todas las colecciones de Atlas (`scripts/verContenido.js`) |
| `npm run test:postman` | Corre la colección de Postman desde la terminal y muestra el resumen (`newman`) |
| `npm run reporte:postman` | Lo mismo, pero además genera el reporte HTML en la carpeta `postman/` (no se guarda en el repositorio: es una salida) |
| `npm run url` | Muestra la IP de la PC y el comando de `flutter run` que hay que copiar |
| `npm run demo-apagada` | Apaga la API, comprueba que no se guarda nada y la vuelve a encender |
| `npm run limpiar` | Borra los datos que dejan las pruebas automáticas |
| `npm test` | Pruebas con Jest + Supertest (`tests/`) |

---

## 3. Variables de entorno (`.env`)

| Variable | Uso |
|---|---|
| `PORT` | Puerto (4000) |
| `MONGO_URI` | URL de conexión a MongoDB Atlas |
| `JWT_SECRET` | Secreto con el que se firman los tokens |
| `JWT_EXPIRES_IN` | Vigencia del token (por defecto 7 días) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Datos opcionales para `npm run seed` |
| `RATE_LIMIT_MAX` | Intentos fallidos de login/registro permitidos en 15 minutos (100 por defecto) |

> El `.env` contiene credenciales reales de Atlas: **no subirlo a ningún repositorio ni compartirlas**. `.gitignore` ya lo excluye.

---

## 4. Estructura de archivos

```
backend/
├── server.js                 → Punto de entrada: Express, seguridad, rate limit, rutas
├── config/
│   └── db.js                 → Conexión a MongoDB con Mongoose
├── models/
│   ├── Usuario.js            → Esquema de usuario (con hash de contraseña)
│   ├── Oportunidad.js        → Esquema de oportunidad
│   ├── Favorito.js           → Esquema de favorito (usuario + oportunidad)
│   ├── Postulacion.js        → Postulación a una oferta laboral
│   ├── Inscripcion.js        → Inscripción a una oportunidad académica
│   └── Notificacion.js       → Aviso para un usuario
├── controllers/
│   ├── authController.js     → Registro, login, ver/editar perfil, listar usuarios
│   ├── oportunidadController.js → CRUD de oportunidades
│   ├── favoritoController.js → Listar/agregar/quitar favoritos
│   ├── postulacionController.js → Postulaciones (crear, listar, cambiar estado)
│   ├── inscripcionController.js → Inscripciones (crear, listar, anular)
│   └── notificacionController.js → Notificaciones (listar, leer, alertas)
├── routes/
│   ├── authRoutes.js         → /api/auth/*
│   ├── oportunidadRoutes.js  → /api/oportunidades/*
│   ├── favoritoRoutes.js     → /api/favoritos/*
│   ├── postulacionRoutes.js  → /api/postulaciones/*
│   ├── inscripcionRoutes.js  → /api/inscripciones/*
│   └── notificacionRoutes.js → /api/notificaciones/*
├── middleware/
│   ├── auth.js               → protegerRuta (JWT) y permitirRoles
│   └── errorHandler.js       → Manejador central de errores + 404
├── utils/
│   ├── constantes.js         → Municipios, categorías y tipos
│   └── validadores.js        → Reglas de express-validator
├── scripts/
│   ├── crearAdmin.js         → npm run seed
│   ├── semilla.js            → npm run semilla (oportunidades de ejemplo)
│   └── verContenido.js       → npm run ver
├── tests/
│   ├── auth.test.js          → Pruebas de registro/login
│   ├── oportunidad.test.js   → Pruebas del CRUD de oportunidades
│   └── api_completa.test.js  → Pruebas de usuarios, postulaciones, inscripciones y notificaciones
├── postman/                  → Colección de pruebas de Postman
├── .env                      → Configuración (NO compartir)
└── package.json
```

---

## 5. Archivo por archivo

### 5.1 `server.js` — Punto de entrada

1. Carga `.env` (`dotenv`).
2. Middlewares base: `helmet` (cabeceras de seguridad), `cors` (permite peticiones de otros orígenes), `express.json` (lee cuerpos JSON).
3. **Rate limit** en login y registro: máximo 20 intentos cada 15 minutos por IP; si se pasa responde "Demasiados intentos...".
4. Monta las rutas: `/api/auth`, `/api/oportunidades`, `/api/favoritos`.
5. `GET /api/salud` → `{"estado":"ok"}` (la app usa esto para el chip de estado).
6. `rutaNoEncontrada` (404) y `manejadorDeErrores` (errores centralizados) al final.
7. Conecta a MongoDB (`config/db.js`) y solo entonces abre el puerto (`PORT` o 4000). Si la base falla, el proceso se detiene.

### 5.2 `config/db.js`

`mongoose.connect(process.env.MONGO_URI)`. Si falla, imprime el error y hace `process.exit(1)`.

### 5.3 `models/Usuario.js`

Campos: `nombre`, `apellido`, `email` (único, en minúsculas), `password` (mínimo 6, **`select: false`**: no sale en las consultas), `municipio` (solo los de `constantes.js` sin "Todo Bolívar"), `rol` (`usuario` | `administrador`), `activo` (boolean), `timestamps`.

- Hook `pre('save')`: hashea la contraseña con `bcryptjs` (10 rondas) solo si cambió.
- Método `compararPassword(ingresada)`: compara en el login.

### 5.4 `models/Oportunidad.js`

Campos: `titulo` y `descripcion` (obligatorios), `clase` (`academica` | `laboral`), `categoria`, `tipo`, `municipio`, `entidadOrganizadora`, `requisitos`, `fechaCierre`, `enlaceExterno`, `imagenUrl`, `cupos`, y los campos laborales `empresa`, `cargo`, `salario`, `ubicacion`, `contacto`, `fechaPublicacion`; `estado` (`activa` | `cerrada` | `pendiente`), `creadoPor` (referencia al usuario que la creó), `timestamps`.

Índice compuesto `{ municipio, categoria, tipo }` para que los filtros sean rápidos.

### 5.5 `models/Favorito.js`

`usuario` + `oportunidad` (ambas referencias), `timestamps`, e índice **único** compuesto para que nadie guarde la misma oportunidad dos veces.

### 5.6 `middleware/auth.js`

| Función | Qué hace |
|---|---|
| `protegerRuta` | Exige el header `Authorization: Bearer <token>`, verifica el JWT, busca el usuario y comprueba que esté activo. Si no, responde 401. Deja el usuario en `req.usuario`. |
| `permitirRoles(...roles)` | Si el rol no está permitido responde 403. |

### 5.7 `middleware/errorHandler.js`

- `manejadorDeErrores`: recibe cualquier `next(error)`:
  - error 11000 de Mongo (campo duplicado) → 400 "Ya existe un registro con ese X";
  - `ValidationError` de Mongoose → 400 con la lista de mensajes;
  - cualquier otro → 500 "Error interno del servidor".
- `rutaNoEncontrada` → 404 con la ruta intentada.

### 5.8 `utils/constantes.js`

- `MUNICIPIOS`: "Todo Bolívar" + los 44 municipios y 2 distritos del departamento de Bolívar (la misma lista que usa la app en `lib/datos/municipios.dart`), más los nombres cortos "Cartagena" y "Mompox" de las primeras versiones para que los documentos que ya están en Atlas sigan siendo válidos.
- `CATEGORIAS`: Educación, Trabajo, Emprendimiento.
- `TIPOS_POR_CATEGORIA`: los tipos de cada categoría (Cursos, Becas, Ofertas laborales, Capital semilla...).
- `TODOS_LOS_TIPOS`: todos los tipos en una sola lista.

### 5.9 `utils/validadores.js`

Usa `express-validator`. La función `validar` corta la petición con 400 si hay errores.

| Regla | Campos y condiciones |
|---|---|
| `reglasRegistro` | nombre y apellido obligatorios, email válido, contraseña ≥ 6, municipio dentro de la lista |
| `reglasLogin` | email válido y contraseña obligatoria |
| `reglasOportunidad` | título y descripción obligatorios; clase, categoría, tipo y municipio válidos si vienen; cupos entero ≥ 0 |
| `reglasActualizacionOportunidad` | Igual que la anterior, pero solo valida los campos que llegan: permite cambiar un solo campo sin mandar la oportunidad completa |

### 5.10 `controllers/authController.js`

| Función | Ruta | Qué hace |
|---|---|---|
| `registrar` | `POST /api/auth/registro` | Comprueba que el correo no exista, crea el usuario y devuelve `token` + datos del usuario (201). |
| `iniciarSesion` | `POST /api/auth/login` | Busca el correo (con `+password`), compara la contraseña, comprueba `activo`, devuelve `token` (200). Errores: 401 credenciales, 403 inactiva. |
| `obtenerPerfil` | `GET /api/auth/perfil` | Devuelve `req.usuario`. |
| `actualizarPerfil` | `PUT /api/auth/perfil` | Solo permite cambiar `nombre`, `apellido`, `municipio`. |

`generarToken(id)` firma el JWT con `JWT_SECRET` y `JWT_EXPIRES_IN` (o 7 días).

### 5.11 `controllers/oportunidadController.js`

| Función | Ruta | Qué hace |
|---|---|---|
| `listarOportunidades` | `GET /api/oportunidades` | Lista las `activas` con filtros `?municipio=&categoria=&tipo=&clase=` y paginación `?pagina=&limite=`. Si filtra por un municipio concreto, también incluye las marcadas "Todo Bolívar". Devuelve `total`, `pagina`, `totalPaginas`, `oportunidades`. |
| `listarTodasOportunidades` | `GET /api/oportunidades/todas` | Igual que el anterior pero **sin** filtrar por estado: incluye las `cerradas` y `pendientes`. Solo el administrador (401 sin token, 403 con un usuario normal). Es la ruta que usa la pantalla "Gestión de datos" de la app, para que el administrador pueda volver a editar una oportunidad que ya cerró. |
| `obtenerOportunidad` | `GET /api/oportunidades/:id` | Devuelve una (404 si no existe). |
| `crearOportunidad` | `POST /api/oportunidades` | Crea y le pone `creadoPor = req.usuario._id` (201). |
| `actualizarOportunidad` | `PUT /api/oportunidades/:id` | Actualiza con validaciones de Mongoose (404 si no existe). |
| `eliminarOportunidad` | `DELETE /api/oportunidades/:id` | Borra (404 si no existe). |

**Campos protegidos.** Tanto el `POST` como el `PUT` pasan el cuerpo por
`soloCamposPermitidos()`, que descarta `_id`, `id`, `creadoPor`, `createdAt`,
`updatedAt` y `__v`. Así el cliente no puede elegir el identificador de una
oportunidad, cambiar su autor ni alterar las fechas de auditoría. El `PUT`
también aplica `reglasActualizacionOportunidad` (solo valida los campos que llegan:
clase/categoría/tipo/municipio dentro del catálogo, cupos entero >= 0).

### 5.12 `controllers/favoritoController.js`

| Función | Ruta | Qué hace |
|---|---|---|
| `listarFavoritos` | `GET /api/favoritos` | Devuelve los favoritos del usuario con la oportunidad rellenada (`populate`). |
| `agregarFavorito` | `POST /api/favoritos/:oportunidadId` | Guarda uno (201); si ya existía responde 400 por el índice único. |
| `quitarFavorito` | `DELETE /api/favoritos/:oportunidadId` | Lo elimina. |

### 5.13 `routes/` — Rutas y permisos

**`/api/auth`** (`authRoutes.js`)

| Método | Ruta | Protección |
|---|---|---|
| POST | `/registro` | pública (con `reglasRegistro`) |
| POST | `/login` | pública (con `reglasLogin`) |
| GET | `/perfil` | `protegerRuta` |
| PUT | `/perfil` | `protegerRuta` |

**`/api/oportunidades`** (`oportunidadRoutes.js`)

| Método | Ruta | Protección |
|---|---|---|
| GET | `/` | pública |
| GET | `/todas` | `protegerRuta` + `permitirRoles('administrador')` |
| GET | `/:id` | pública |
| POST | `/` | `protegerRuta` + `permitirRoles('administrador')` + `reglasOportunidad` |
| PUT | `/:id` | `protegerRuta` + `permitirRoles('administrador')` + `reglasActualizacionOportunidad` |
| DELETE | `/:id` | `protegerRuta` + `permitirRoles('administrador')` |

> `/todas` se declara **antes** de `/:id` porque Express compara las rutas en
> el orden en que se escriben; si se declarara después, "todas" se
> interpretaría como un id.

**`/api/favoritos`** (`favoritoRoutes.js`): todas requieren `protegerRuta` (se aplica con `router.use`).

**`/api/postulaciones`** (`postulacionRoutes.js`)

| Método | Ruta | Protección |
|---|---|---|
| POST | `/` | `protegerRuta` (el usuario con sesión se postula a una oferta) |
| GET | `/mias` | `protegerRuta` (las postulaciones del usuario con sesión) |
| GET | `/` | `protegerRuta` + `permitirRoles('administrador')` (todas, con el estudiante) |
| PUT | `/:id/estado` | `protegerRuta` + `permitirRoles('administrador')` |
| DELETE | `/:id` | `protegerRuta` (el dueño o el administrador) |

**`/api/inscripciones`** (`inscripcionRoutes.js`)

| Método | Ruta | Protección |
|---|---|---|
| POST | `/` | `protegerRuta` |
| GET | `/mias` | `protegerRuta` |
| DELETE | `/oportunidad/:oportunidadId` | `protegerRuta` (anula la inscripción a esa oportunidad) |
| DELETE | `/:id` | `protegerRuta` (el dueño o el administrador) |

**`/api/notificaciones`** (`notificacionRoutes.js`)

| Método | Ruta | Protección |
|---|---|---|
| GET | `/` | `protegerRuta` (las del usuario con sesión) |
| GET | `/recientes` | `protegerRuta` + `permitirRoles('administrador')` (historial de alertas) |
| PUT | `/leer-todas` | `protegerRuta` |
| PUT | `/:id/leida` | `protegerRuta` |
| DELETE | `/:id` | `protegerRuta` (el dueño, o el administrador para cualquiera) |
| POST | `/` | `protegerRuta` + `permitirRoles('administrador')` (envía la alerta) |

---

## 6. Esquema de MongoDB (colecciones)

| Colección | Documento |
|---|---|
| `usuarios` | `{ nombre, apellido, email, password (hash), municipio, identificacion, telefono, tipoPerfil, rol, activo, createdAt, updatedAt }` |
| `oportunidades` | `{ titulo, descripcion, clase, categoria, tipo, municipio, entidadOrganizadora, requisitos, fechaCierre, enlaceExterno, imagenUrl, cupos, empresa, cargo, salario, ubicacion, contacto, fechaPublicacion, estado, creadoPor, createdAt, updatedAt }` |
| `favoritos` | `{ usuario, oportunidad, createdAt, updatedAt }` |
| `postulaciones` | `{ usuario, oportunidad, estado (Enviada/En revisión/Aceptada/Rechazada), createdAt, updatedAt }` |
| `inscripciones` | `{ usuario, oportunidad, estado (Inscrito/Anulada), createdAt, updatedAt }` |
| `notificaciones` | `{ usuario, titulo, icono, mensaje, leida, createdAt, updatedAt }` |

**Todo lo de la app vive aquí.** No hay una segunda base de datos en el
celular: las cuentas, las oportunidades, las postulaciones, las
inscripciones y las notificaciones se guardan en MongoDB.

Para verla sin Atlas: `npm run ver`.

---

## 7. Autenticación

1. El cliente hace `POST /api/auth/login` con `{ email, password }`.
2. Recibe `{ token }` (JWT).
3. Envía en cada petición protegida: `Authorization: Bearer <token>`.
4. El token vence (7 días por defecto); al recibir 401 la app pide uno nuevo y reintenta una vez.

**Roles:** `usuario` (ver, favoritos, perfil) y `administrador` (además crear/editar/borrar oportunidades).

> La app **no lleva credenciales del administrador incrustadas**: cada quien
> entra con su propia cuenta y solo el rol `administrador` puede publicar o
> mandar alertas.

---

## 8. Pruebas

```powershell
npm test
```

`tests/auth.test.js` (Jest + Supertest) comprueba: registro exitoso (201 con token), correo repetido (400), login correcto (200 con token) y contraseña incorrecta (401).

`tests/oportunidad.test.js` comprueba el CRUD completo de oportunidades: listado, listado completo del administrador (401 sin token, 403 con usuario normal), creación (201), que el cliente **no pueda elegir el `_id`**, validaciones (400), lectura individual (200 y 404), actualización (200, 400 y 404) y borrado (200 y 404).

`tests/api_completa.test.js` comprueba usuarios (registro con todos los datos del formulario, login, perfil, listado solo del administrador), postulaciones (crear, no duplicar, listar, cambiar estado, estados inválidos, exigir token), inscripciones (crear y anular) y notificaciones (bienvenida, marcar como leídas, alerta del administrador, permisos).

> **Nota sobre el tiempo:** la base de datos está en Atlas, o sea por
> internet. Por eso en `package.json` el `jest` tiene `testTimeout` y
> `hookTimeout` en 30 segundos: con los 5 segundos por defecto las pruebas
> fallan de forma intermitente cuando la conexión está fría.
>
> Las pruebas usan la base del `.env`. Para no ensuciar la de producción,
> conviene apuntar `MONGO_URI` a una base aparte; y para limpiar lo que
> dejaron: `npm run limpiar`.

---

## 9. Demostración para la materia (encender/apagar la API)

```powershell
Set-Location "C:\Users\Daniela Paez\OneDrive\Desktop\Archisvos\backend"
node server.js
```

1. **Con la API encendida:** en Gestión de datos el chip dice "API conectada" y crear/editar/borrar funciona (aparece en Atlas con `npm run ver`).
2. **Apaga la API** (Ctrl+C): el chip cambia a "API apagada — no se pueden guardar cambios" y **ningún cambio se guarda** (regla del profesor).
3. **Enciéndela de nuevo:** el chip se repone y se puede seguir trabajando.

Requisitos: PC y celular en la misma red, IP de `lib/datos/api_config.dart` = IP de la PC.

### 9.1 Cómo consume la API la app

**La app no tiene base de datos propia.** Todo (usuarios, oportunidades,
postulaciones, inscripciones, notificaciones y favoritos) se guarda en MongoDB
a través de esta API. Lo único que queda en el celular es el token de la
sesión y el archivo de la foto de perfil.

Archivos de la app Flutter que hablan con esta API:

| Archivo | Qué hace |
|---|---|
| `lib/datos/api_config.dart` | Dirección del servidor, puerto y tiempo de espera. La dirección se cambia al compilar con `--dart-define=API_URL=...` (por defecto `http://10.0.2.2:4000/api`, que es el `localhost` del PC visto desde el emulador). |
| `lib/datos/api_cliente.dart` | Cliente HTTP: `GET /salud`, todo lo de `/auth`, el CRUD de `/oportunidades`, `/favoritos`, `/postulaciones`, `/inscripciones` y `/notificaciones`. Si una petición protegida responde 401, limpia la sesión y pide volver a iniciar sesión. |
| `lib/datos/modelos.dart` | Traduce el JSON de la API a los modelos de la app (Usuario, Oferta, Postulación, Notificación). |
| `lib/datos/oportunidad_api.dart` | Modelo de la oportunidad en formato JSON (traduce los nombres de la API a los de la app). |
| `lib/datos/*_repositorio.dart` | La capa que usa cada pantalla: usuarios, oportunidades, postulaciones, inscripciones y notificaciones. |
| `lib/pantallas/gestion_datos.dart` | Pantalla "Gestión de datos": chip de estado de la API + CRUD de oportunidades + envío de alertas. |
| `lib/pantallas/home.dart` | Pantalla principal: el listado sale de la API (se descarga al abrir y al volver de "Gestión de datos"). |

Reglas de la integración (siguiendo esta documentación):

- La **API es la fuente de verdad de todo**. Lo que se registra, publica,
  postula, inscribe o alerta queda en MongoDB, y es lo que ven todos los
  usuarios en sus pantallas.
- La sesión es un **token JWT**: la app lo guarda en el dispositivo
  (`SharedPreferences`) y lo manda en `Authorization: Bearer <token>`.
- El **id** de todo es el ObjectId de MongoDB (un texto de 24 caracteres).
- Si el servidor está apagado, la app lo avisa y **no se guarda ningún
  cambio**. El listado muestra la última copia descargada en esa sesión.
- La app **no lleva credenciales del administrador incrustadas**: cada quien
  entra con su propia cuenta, y solo el rol `administrador` puede crear,
  editar, borrar y mandar alertas.

#### Verificación automática

La app trae una prueba de integración que recorre toda la API usando la
**misma** clase de red que las pantallas (`ApiCliente`):

```powershell
Set-Location "C:\Users\Daniela Paez\AndroidStudioProjects\bolivar_aprende_y_trabaja"
flutter test --dart-define=API_URL=http://localhost:4000/api
```

Cubre el registro, el login, el perfil, el listado, el CRUD completo de
oportunidades, la postulación, la inscripción, las notificaciones y los
favoritos.

---

## 10. Estado actual de los datos en Atlas

- **usuarios:** el administrador `admin@bolivar.com` (`rol: administrador`) + los que se registren desde la app.
- **oportunidades:** 7 registros de prueba.
- **favoritos / postulaciones / inscripciones / notificaciones:** se llenan
  solos conforme se usa la app.

La app escribe en esta base **desde cualquier pantalla**: registro, perfil,
oportunidades, postulaciones, inscripciones y alertas. No queda nada guardado
solo en el celular.
