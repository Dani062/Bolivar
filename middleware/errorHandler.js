// Manejo central de errores (todo lo que llega con next(error))
const manejadorDeErrores = (err, req, res, next) => {
  console.error(err.stack);

  // Error de duplicado en Mongo (por ejemplo, email repetido)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'valor';
    return res.status(400).json({ mensaje: `Ya existe un registro con ese ${campo}.` });
  }

  // Id con formato inválido (por ejemplo /api/oportunidades/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: `El valor de ${err.path} no es válido.` });
  }

  // JSON mal escrito en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' });
  }

  // Cuerpo demasiado grande (por ejemplo, una foto muy pesada)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'El archivo es demasiado grande (máximo 2 MB).' });
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
