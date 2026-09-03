# Backend - Bolívar Aprende y Trabaja

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
| POST | /registro | No | Crear cuenta nueva |
| POST | /login | No | Iniciar sesión, devuelve token JWT |
| GET | /perfil | Sí | Ver datos del usuario logueado |
| PUT | /perfil | Sí | Editar nombre/apellido/municipio |

Ejemplo body de registro:
```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "email": "ana@example.com",
  "password": "123456",
  "municipio": "Cartagena"
}
```

### Oportunidades (`/api/oportunidades`)
| Método | Ruta | Protegido | Descripción |
|--------|------|-----------|-------------|
| GET | / | No | Listar con filtros `?municipio=&categoria=&tipo=&pagina=&limite=` |
| GET | /:id | No | Ver el detalle de una oportunidad |
| POST | / | Sí (admin) | Crear oportunidad |
| PUT | /:id | Sí (admin) | Editar oportunidad |
| DELETE | /:id | Sí (admin) | Eliminar oportunidad |

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

## Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```
El token se obtiene al hacer login o registro.

## Roles

- `usuario`: puede ver oportunidades, guardar favoritos y editar su perfil.
- `administrador`: además puede crear, editar y eliminar oportunidades.

Para crear el primer administrador, regístralo como usuario normal y luego cambia su campo `rol` a `"administrador"` directamente en la base de datos (o crea un script/seed aparte).

## Pruebas

```bash
npm test
```

## Próximos pasos sugeridos

- Conectar con el frontend de Iván (definir la URL base de la API en un `.env` del frontend).
- Revisar con Keila que los nombres de campos coincidan con el modelo de datos y el diagrama entidad-relación.
- Agregar más pruebas (oportunidades y favoritos) junto con Yeison para el plan de pruebas.
