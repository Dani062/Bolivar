# Backend - Bolívar Aprende y Trabaja

API REST en Node.js + Express + MongoDB para la app Bolívar Aprende y Trabaja.

## Cómo encenderla

Requisitos: Node.js 18 o superior y conexión a internet (la base de datos está en MongoDB Atlas).

```bash
npm install
npm start
```

Cuando aparece `Servidor corriendo en http://localhost:4000`, la API está lista.
Para comprobarlo, abre http://localhost:4000/api/salud en el navegador: debe responder `{"estado":"ok"}`.

Al encender se crea solo el administrador (si no existe):

- Correo: `admin@bolivar.com`
- Contraseña: `admin123`

La configuración está en el archivo `.env` (ver `.env.example`).

## CRUD de oportunidades

| Método | Ruta | Permiso | Qué hace |
|---|---|---|---|
| GET | `/api/oportunidades` | Público | Lista las activas (filtros: municipio, categoria, tipo, clase, pagina, limite) |
| GET | `/api/oportunidades/todas` | Administrador | Lista todas, incluidas cerradas y pendientes |
| GET | `/api/oportunidades/:id` | Público | Devuelve una oportunidad |
| POST | `/api/oportunidades` | Administrador | Crea una oportunidad |
| PUT | `/api/oportunidades/:id` | Administrador | Actualiza solo los campos enviados |
| DELETE | `/api/oportunidades/:id` | Administrador | Borra la oportunidad y lo que depende de ella |
| GET | `/api/oportunidades/:id/imagen` | Público | Devuelve la foto de la oportunidad |
| PUT | `/api/oportunidades/:id/imagen` | Administrador | Sube o cambia la foto (`{ "imagen": "<base64>" }`, JPG, PNG o WEBP, máximo 2 MB) |
| DELETE | `/api/oportunidades/:id/imagen` | Administrador | Quita la foto |

Las rutas protegidas piden la cabecera `Authorization: Bearer <token>`, que devuelve `POST /api/auth/login`.

Las ofertas laborales (`clase: "laboral"`) exigen el campo `nit` de la empresa. La API revisa el dígito de verificación de la DIAN y, si es válido, guarda `empresaVerificada: true`.

## Otros módulos

| Ruta base | Para qué sirve |
|---|---|
| `/api/auth` | Registro, login, perfil y listado de usuarios |
| `/api/postulaciones` | Postulaciones a ofertas laborales |
| `/api/inscripciones` | Inscripciones a cursos y becas (el administrador ve todas) |
| `/api/notificaciones` | Avisos y alertas del administrador |
| `/api/favoritos` | Oportunidades favoritas |

## Estructura

```
server.js        punto de entrada
config/          conexión a MongoDB
models/          esquemas de Mongoose
routes/          rutas y permisos
controllers/     lógica de cada ruta
middleware/      token JWT, roles y errores
utils/           validaciones, NIT y listas fijas
scripts/         semilla.js: carga oportunidades de ejemplo (npm run semilla)
tests/           pruebas con Jest
postman/         colección de Postman y su entorno
```

## Pruebas

Con la API encendida:

```bash
npm test                 # pruebas con Jest
npm run test:postman     # las 39 peticiones de Postman en la terminal
npm run reporte:postman  # lo mismo y genera postman/Reporte-pruebas-Postman.html
```

En Postman: Import de `postman/Bolivar-Aprende-y-Trabaja.postman_collection.json` y de `postman/Bolivar-Entorno-Local.postman_environment.json`, elegir el entorno arriba a la derecha y darle a **Run collection**.
