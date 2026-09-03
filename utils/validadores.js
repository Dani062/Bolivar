const { body, validationResult } = require('express-validator');
const { MUNICIPIOS, CATEGORIAS, TODOS_LOS_TIPOS } = require('./constantes');

// Revisa el resultado de las validaciones anteriores y corta la petición si hay errores
const validar = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: 'Datos inválidos.', errores: errores.array() });
  }
  next();
};

const reglasRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio.'),
  body('email').isEmail().withMessage('El correo no es válido.'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  body('municipio')
    .isIn(MUNICIPIOS.filter((m) => m !== 'Todo Bolívar'))
    .withMessage('Municipio no válido.'),
  validar
];

const reglasLogin = [
  body('email').isEmail().withMessage('El correo no es válido.'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
  validar
];

const reglasOportunidad = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio.'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('categoria').isIn(CATEGORIAS).withMessage('Categoría no válida.'),
  body('tipo').isIn(TODOS_LOS_TIPOS).withMessage('Tipo no válido.'),
  body('municipio').isIn(MUNICIPIOS).withMessage('Municipio no válido.'),
  validar
];

module.exports = { reglasRegistro, reglasLogin, reglasOportunidad };
