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

const app = express();

// Seguridad y utilidades base
app.use(helmet());
app.use(cors());
app.use(express.json());

// Límite de intentos para evitar fuerza bruta en login/registro
const limitadorAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { mensaje: 'Demasiados intentos. Intenta de nuevo más tarde.' }
});
app.use('/api/auth/login', limitadorAuth);
app.use('/api/auth/registro', limitadorAuth);

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/favoritos', favoritoRoutes);

// Ruta de salud, útil para probar que el servidor está vivo
app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));

app.use(rutaNoEncontrada);
app.use(manejadorDeErrores);

const PORT = process.env.PORT || 4000;


conectarDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
});

module.exports = app;
