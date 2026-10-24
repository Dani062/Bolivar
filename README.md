# Backend - Bolívar Aprende y Trabaja

> **Documentación completa paso a paso:** ver [`DOCUMENTACION.md`](DOCUMENTACION.md) (archivos, endpoints, esquema de MongoDB, cómo correrlo y demo del API encendida/apagada).

API REST para la app que centraliza oportunidades de educación, trabajo y emprendimiento en el departamento de Bolívar.

## Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para el hash de contraseñas
- express-validator para validaciones
- helmet, cors y express-rate-limit para seguridad básica

## Instalación

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar el archivo de variables de entorno y completarlo:
   ```bash
   cp .env.example .env
   ```
3. Asegurarte de tener MongoDB corriendo (local o en Atlas) y poner la URL en `MONGO_URI`.
4. Levantar el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Probar que está vivo entrando a: `http://localhost:4000/api/salud`

## Estructura del proyecto

```
bolivar-backend/
├── config/          # Conexión a la base de datos
├── controllers/      # Lógica de cada módulo (auth, oportunidades, favoritos)
├── middleware/        # Autenticación, roles y manejo de errores
├── models/            # Esquemas de Mongoose (Usuario, Oportunidad, Favorito)
├── routes/            # Definición de endpoints
├── utils/              # Constantes del dominio y validadores
├── tests/              # Pruebas con Jest + Supertest
└── server.js           # Punto de entrada
```

## Endpoints principales

### Autenticación (`/api/auth`)
| Método | Ruta | Protegido | Descripción |
|--------|------|-----------|-------------|
| POST | /registro | No | Crear cuenta nueva (devuelve token) |
| POST | /login | No | Iniciar sesión, devuelve token JWT |
| GET | /perfil | Sí | Ver datos del usuario logueado |
| PUT | /perfil | Sí | Editar nombre/apellido/municipio/tipoPerfil/teléfono |
| GET | /usuarios | Sí (admin) | Listar los usuarios registrados |

Ejemplo body de registro:
```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "email": "ana@example.com",
  "password": "123456",
  "municipio": "Cartagena de Indias",
  "identificacion": "10999999",
  "telefono": "3001234567",
  "tipoPerfil": "Estudiante"
}
```

### Oportunidades (`/api/oportunidades`)
| Método | Ruta | Protegido | Descripción |
|--------|------|-----------|-------------|
| GET | / | No | Listar con filtros `?municipio=&categoria=&tipo=&clase=&pagina=&limite=` (solo las activas) |
| GET | /todas | Sí (admin) | Listado completo: incluye las cerradas y pendientes |
| GET | /:id | No | Ver el detalle de una oportunidad |
| POST | / | Sí (admin) | Crear oportunidad |
| PUT | /:id | Sí (admin) | Editar oportunidad |
| DELETE | /:id | Sí (admin) | Eliminar oportunidad |

> `/todas` va declarada antes de `/:id` porque Express compara las rutas en
> el orden en que se escriben.

Ejemplo body para crear una oportunidad:
```json
{
  "titulo": "Curso gratuito de Excel básico",
  "descripcion": "Curso virtual de 20 horas dirigido a jóvenes de El Carmen de Bolívar.",
  "categoria": "Educación",
  "tipo": "Cursos",
  "municipio": "El Carmen de Bolívar",
  "entidadOrganizadora": "SENA",
  "fechaCierre": "2026-12-01",
  "enlaceExterno": "https://ejemplo.com/curso-excel"
}
```

### Favoritos (`/api/favoritos`) — todas protegidas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | / | Ver mis favoritos |
| POST | /:oportunidadId | Guardar una oportunidad |
| DELETE | /:oportunidadId | Quitar una oportunidad de favoritos |

### Postulaciones (`/api/postulaciones`)
| Método | Ruta | Protegido | Descripción |
|--------|------|-----------|-------------|
| POST | / | Sí | El estudiante se postula a una oferta laboral |
| GET | /mias | Sí | Mis postulaciones |
| GET | / | Sí (admin) | Todas, con los datos del estudiante |
| PUT | /:id/estado | Sí (admin) | Cambiar el estado (Enviada / En revisión / Aceptada / Rechazada) |
| DELETE | /:id | Sí | Borrar (el dueño o el administrador) |

### Inscripciones (`/api/inscripciones`)
| Método | Ruta | Protegido | Descripción |
|--------|------|-----------|-------------|
| POST | / | Sí | El estudiante se inscribe a un curso, beca o taller |
| GET | /mias | Sí | Mis inscripciones |
| DELETE | /oportunidad/:oportunidadId | Sí | Anular la inscripción a esa oportunidad |

### Notificaciones (`/api/notificaciones`)
| Método | Ruta | Protegido | Descripción |
|--------|------|-----------|-------------|
| GET | / | Sí | Mis notificaciones |
| GET | /recientes | Sí (admin) | Historial de las alertas enviadas |
| PUT | /leer-todas | Sí | Marcar todas como leídas |
| PUT | /:id/leida | Sí | Marcar una como leída |
| DELETE | /:id | Sí | Borrar una notificación |
| POST | / | Sí (admin) | Enviar una alerta a todos o a un usuario |

## Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```
El token se obtiene al hacer login o registro.

## Roles

- `usuario`: puede ver oportunidades, guardar favoritos y editar su perfil.
- `administrador`: además puede crear, editar y eliminar oportunidades.

El administrador por defecto se crea con:

```bash
npm run seed      # admin@bolivar.com / admin123 (los mismos de .env)
npm run semilla   # carga oportunidades de ejemplo (no duplica las que ya están)
npm run limpiar   # borra los datos que dejan las pruebas automáticas
npm run ver       # muestra qué hay guardado en Atlas
npm run demo-apagada  # apaga y enciende la API comprobando que nada se guarda sin ella
```

## Cómo consume la API la app (Flutter)

**La app no tiene base de datos propia: todo se guarda en MongoDB.** La
sesión es un token JWT que la app guarda en el dispositivo y manda en cada
petición.

| Archivo de la app | Qué hace |
|---|---|
| `lib/datos/api_config.dart` | Dirección del servidor (se cambia al compilar con `--dart-define=API_URL=...`), puerto y tiempo de espera |
| `lib/datos/api_cliente.dart` | Cliente HTTP de todo: sesión, oportunidades, favoritos, postulaciones, inscripciones y notificaciones |
| `lib/datos/modelos.dart` | Traduce el JSON de la API a los modelos de la app |
| `lib/datos/*_repositorio.dart` | La capa que usa cada pantalla |
| `lib/pantallas/gestion_datos.dart` | Chip de estado ("API conectada" / "API apagada — no se pueden guardar cambios"), CRUD de oportunidades y envío de alertas |
| `lib/pantallas/home.dart` | Pantalla principal: el listado sale de la API |

Si el servidor está apagado, la app **no guarda ningún cambio** y el listado
muestra la última copia descargada.

Para comprobar que la app funciona contra este backend:

```bash
cd "C:\Users\Daniela Paez\AndroidStudioProjects\bolivar_aprende_y_trabaja"
flutter test --dart-define=API_URL=http://localhost:4000/api
```

Detalle completo en [`DOCUMENTACION.md`](DOCUMENTACION.md) (sección 9.1).

## Pruebas

```bash
npm test
```

31 pruebas con Jest + Supertest: registro, login, perfil, permisos por rol, el
CRUD completo de oportunidades (incluye que el cliente no pueda elegir el
`_id`), postulaciones, inscripciones y notificaciones.

## Próximos pasos sugeridos

- Revisar con Keila que los nombres de campos coincidan con el modelo de datos y el diagrama entidad-relación.
- Agregar pruebas de favoritos junto con Yeison para el plan de pruebas.
