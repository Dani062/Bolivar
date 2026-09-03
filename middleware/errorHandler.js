// Middleware centralizado: cualquier error que llegue con next(error) termina aquí
const manejadorDeErrores = (err, req, res, next) => {
  console.error(err.stack);

  // Error de duplicado en Mongo (por ejemplo, email repetido)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({ mensaje: `Ya existe un registro con ese ${campo}.` });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ mensaje: 'Error de validación.', errores: mensajes });
  }

  res.status(err.statusCode || 500).json({
    mensaje: err.mensaje || 'Error interno del servidor.'
  });
};

const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.originalUrl}` });
};

module.exports = { manejadorDeErrores, rutaNoEncontrada };
