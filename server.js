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

// Límite de intentos fallidos de login/registro (los exitosos no cuentan).
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  skipSuccessfulRequests: true,
  message: { mensaje: 'Demasiados intentos fallidos. Intenta de nuevo más tarde.' }
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

// Ruta de salud: comprueba que el servidor está encendido
app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

// Raíz: saludo al abrir la dirección del servidor en el navegador.
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

// Crea el administrador al encender el servidor si todavía no existe.
const asegurarAdministrador = async () => {
  const Usuario = require('./models/Usuario');
  const correo = (process.env.ADMIN_EMAIL || 'admin@bolivar.com').toLowerCase();
  try {
    if (!(await Usuario.exists({ email: correo }))) {
      await Usuario.create({
        nombre: 'Admin',
        apellido: 'Bolívar',
        email: correo,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        municipio: 'Cartagena de Indias',
        rol: 'administrador'
      });
      console.log(`👤 Administrador creado: ${correo}`);
    }
  } catch (error) {
    console.error('No se pudo crear el administrador:', error.message);
  }
};


// Solo se abre el puerto con "node server.js"; las pruebas importan la app sin encenderla.
if (require.main === module) {
  if (!process.env.JWT_SECRET) {
    console.error('❌ Falta JWT_SECRET en el archivo .env (copia .env.example como .env).');
    process.exit(1);
  }
  conectarDB()
    .then(asegurarAdministrador)
    .then(() => {
      app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
    });
}

module.exports = app;
