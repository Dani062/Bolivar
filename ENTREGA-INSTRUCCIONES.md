# Bolívar Aprende y Trabaja — Entrega

Este paquete tiene todo lo necesario para que el profesor pueda **ver la app
funcionando** y **probar la API** por su cuenta.

---

## 0. Cómo puede ver la app (hay 3 formas, elige una)

### Forma A — En la sustentación, en el salón (lo más rápido)

1. Con el backend encendido en el equipo (`npm start`).
2. El profesor instala el APK en su celular.
3. **El celular del profesor debe estar en la misma red Wi-Fi que el equipo.**

El APK ya viene con la dirección de ese equipo, así que la app se conecta
sola y muestra el chip verde **"API conectada"**. Si el equipo cambia de red,
basta con tocar **Reintentar** en la app.

### Forma B — El profesor lo prueba en su casa, con el código

1. Instala [Node.js 18 o superior](https://nodejs.org) en su computador.
2. Descomprime el paquete y entra a la carpeta `backend`.
3. Crea el archivo `.env` a partir de `.env.example` y pega la
   `MONGO_URI` (ver la sección 4).
4. `npm install` y `npm start`.
5. Instala el APK en su celular, lo abre y toca el botón
   **"Servidor: ..."** que está en la pantalla de inicio de sesión.
6. Escribe la dirección de su computador, por ejemplo
   `http://192.168.1.50:4000/api`, y le da **Guardar**.

La app la recuerda, así que las demás veces entra directo. (El celular y el
computador deben estar en la misma red.)

### Forma C — Desde cualquier parte del mundo

Publicar la API en internet (gratis) para que la app apunte a una
dirección pública. Está explicado en el `README.md`, en la sección
"Publicar el backend en internet".

---

## 1. Qué hay en el paquete

```
entrega/
├── INSTRUCCIONES.md                  ← este archivo
├── app-release.apk                   ← la app (Android). Se instala a mano.
├── backend/                          ← el código de la API (Node.js + Express)
│   ├── server.js, routes/, controllers/, models/, middleware/, utils/
│   ├── tests/                        ← 31 pruebas automáticas
│   ├── postman/                      ← la colección de Postman (39 peticiones)
│   │   ├── Bolivar-Aprende-y-Trabaja.postman_collection.json
│   │   ├── Bolivar-Entorno-Local.postman_environment.json
│   │   └── Reporte-pruebas-Postman.html   ← reporte de las pruebas (abrir en el navegador)
│   ├── DOCUMENTACION.md              ← documentación técnica de la API
│   ├── README.md
│   └── .env.example
└── api-publica.txt                   ← la dirección de la API publicada (vacía hasta publicarla)
```

## 2. Probar la app

1. Instalar `app-release.apk` en el celular (ver sección 5).
2. Abrir la app e iniciar sesión con:
   - **Correo:** `admin@bolivar.com`
   - **Contraseña:** `admin123`
3. En el menú lateral está **"Gestión de datos"**: ahí se crean, editan y
   borran oportunidades, y se mandan alertas. Todo eso se guarda en la API.
4. Volver al inicio: lo publicado aparece en el listado. Ese es el ciclo
   completo de la API funcionando.

> La app no tiene base de datos propia: **todo** (las cuentas, las
> oportunidades, las postulaciones, las inscripciones, las alertas) vive en
> la base de datos de la API.

## 3. Probar la API sin instalar nada (Postman)

1. Instalar **Postman** (https://www.postman.com/downloads/).
2. **Import** → `backend/postman/Bolivar-Aprende-y-Trabaja.postman_collection.json`.
3. **Import** → `backend/postman/Bolivar-Entorno-Local.postman_environment.json`.
4. Arriba a la derecha, elegir el entorno
   *"Bolivar Aprende y Trabaja - Local"* (si no aparece, activarlo con el
   ícono del 👁 de la barra lateral).
5. Con la API encendida, darle al botón **▶ Run** de la colección.
6. Postman corre las 39 peticiones y al final muestra cuántas pruebas
   pasaron. Todas deberían salir en verde.

**Sin Postman**, desde la terminal del backend:

```bash
npm install
npm run test:postman        # resumen en la consola
npm run reporte:postman     # además genera el reporte HTML
```

## 4. Levantar la API en otra máquina

Hace falta [Node.js 18 o superior](https://nodejs.org).

```bash
cd backend
npm install
```

Crear el archivo `.env` a partir de `.env.example` y completar:

```
PORT=4000
MONGO_URI=<la URL del cluster de Atlas>
JWT_SECRET=<cualquier texto largo e inventado>
JWT_EXPIRES_IN=7d
```

Luego:

```bash
npm run seed     # crea el administrador (admin@bolivar.com / admin123)
npm run semilla  # carga 7 oportunidades de ejemplo
npm start        # http://localhost:4000
```

Comprobar que está viva:

```
http://localhost:4000/api/salud   →   {"estado":"ok"}
```

> La primera vez tarda unos 40 segundos: la base de datos está en Atlas
> (por internet).

### Pruebas automáticas del backend

```bash
npm test        # 31 pruebas (Jest + Supertest)
```

## 5. Instalar el APK en un celular

1. Pasarle el archivo `app-release.apk` al celular (WhatsApp, Drive, cable).
2. En el celular: **Ajustes → Aplicaciones → acceso especial → Instalar
   aplicaciones desconocidas** → activar la app desde donde se abre el
   archivo (WhatsApp, Archivos, Chrome…).
3. Abrir el archivo y darle a **Instalar**.
4. Android preguntará si quieres permitir la instalación: **sí**.

> El APK está firmado con la llave de depuración, que es lo normal en un
> proyecto académico: no hace falta ningún archivo de firma extra.

## 6. Si la app dice "sin conexión con el servidor"

Significa que la app no pudo encontrar la API. Hay dos motivos:

- **La API está apagada.** Encenderla con `npm start` y tocar **Reintentar**
  en la app.
- **La dirección cambió.** En la pantalla de login hay un botón
  **"Servidor: ..."** donde se puede escribir la dirección de la API a mano
  (por ejemplo `http://192.168.1.10:4000/api`, la IP local del equipo donde
  corre el backend). Se guarda en el dispositivo y la app la usa desde ahí.

## 7. Arquitectura en una línea

```
Celular (Flutter)  ──HTTP + JWT──▶  API (Node.js + Express)  ──▶  MongoDB Atlas
```

- **API REST** con el CRUD completo de oportunidades.
- **JWT** para la sesión: cada quien entra con su cuenta y solo el rol
  `administrador` puede crear, editar, borrar y mandar alertas.
- **Validación** de los datos en el servidor (express-validator) y en la base
  (Mongoose).
- **Protección contra fuerza bruta**: límite de intentos fallidos de login.
