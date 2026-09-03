const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/registro
const registrar = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, municipio } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe una cuenta con ese correo.' });
    }

    const usuario = await Usuario.create({ nombre, apellido, email, password, municipio });

    res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      token: generarToken(usuario._id),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        municipio: usuario.municipio,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const iniciarSesion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Esta cuenta está inactiva.' });
    }

    res.json({
      mensaje: 'Sesión iniciada correctamente.',
      token: generarToken(usuario._id),
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        municipio: usuario.municipio,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/perfil (protegido)
const obtenerPerfil = async (req, res) => {
  res.json({ usuario: req.usuario });
};

// PUT /api/auth/perfil (protegido)
const actualizarPerfil = async (req, res, next) => {
  try {
    const camposPermitidos = ['nombre', 'apellido', 'municipio'];
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        req.usuario[campo] = req.body[campo];
      }
    });

    await req.usuario.save();
    res.json({ mensaje: 'Perfil actualizado.', usuario: req.usuario });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, iniciarSesion, obtenerPerfil, actualizarPerfil };
