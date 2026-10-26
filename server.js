require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const conectarDB = require('./config/db');
const { manejadorDeErrores, rutaNoEncontrada } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const oportunidadRoutes = require('./routes/oportunidadRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const postulacionRoutes = require('./routes/postulacionRoutes');
const inscripcionRoutes = require('./routes/inscripcionRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');

const app = express();

// Seguridad y utilidades base
app.use(helmet());
app.use(cors());
app.use(express.json());

// Límite de intentos para evitar fuerza bruta en login/registro.
// Se puede cambiar con la variable RATE_LIMIT_MAX (útil al hacer
// demostraciones, donde la colección de Postman repite los logins).
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_MAX) || 50,
  message: { mensaje: 'Demasiados intentos. Intenta de nuevo más tarde.' }
});
app.use('/api/auth/login', limitadorAuth);
app.use('/api/auth/registro', limitadorAuth);

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/postulaciones', postulacionRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Ruta de salud, útil para probar que el servidor está vivo
app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

// Raíz: sirve de saludo cuando se abre la dirección del servidor en el
// navegador (por ejemplo al revisar el despliegue).
app.get('/', (req, res) => {
  res.json({
    proyecto: 'Bolívar Aprende y Trabaja - API',
    stack: 'Node.js + Express + MongoDB',
    endpoints: [
      '/api/salud',
      '/api/auth',
      '/api/oportunidades',
      '/api/favoritos',
      '/api/postulaciones',
      '/api/inscripciones',
      '/api/notificaciones'
    ]
  });
});

app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);

const PORT = process.env.PORT || 4000;


// Solo se enciende el servidor cuando el archivo se ejecuta directamente
// ("node server.js"). Si se importa desde una prueba (require('../server'))
// se devuelve la app sin abrir el puerto, para que las pruebas puedan correr
// con el servidor ya levantado.
if (require.main === module) {
  conectarDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  });
}

module.exports = app;
