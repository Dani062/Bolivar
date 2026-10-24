const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Notificacion = require('../models/Notificacion');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Arma el objeto de usuario que devuelve la API. Es el mismo que espera la
// app, así que no hay que transformar nada del lado del celular.
const datosUsuario = (usuario) => ({
  id: usuario._id,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email,
  identificacion: usuario.identificacion || '',
  telefono: usuario.telefono || '',
  municipio: usuario.municipio,
  tipoPerfil: usuario.tipoPerfil || 'Estudiante',
  rol: usuario.rol,
  esAdministrador: usuario.rol === 'administrador'
});

// POST /api/auth/registro
const registrar = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, municipio, identificacion, telefono, tipoPerfil } = req.body;

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'Ya existe una cuenta con ese correo.' });
    }

    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      municipio,
      identificacion,
      telefono,
      tipoPerfil
    });

    // Aviso de bienvenida, igual que antes se guardaba en el celular.
    await Notificacion.create({
      usuario: usuario._id,
      titulo: 'Bienvenido a Bolívar Aprende y Trabaja',
      icono: 'bienvenida',
      mensaje:
        'Tu cuenta fue creada correctamente. Ya puedes explorar oportunidades académicas y laborales.'
    });

    res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      token: generarToken(usuario._id),
      usuario: datosUsuario(usuario)
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
      usuario: datosUsuario(usuario)
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/perfil (protegido)
const obtenerPerfil = async (req, res) => {
  res.json({ usuario: datosUsuario(req.usuario) });
};

// PUT /api/auth/perfil (protegido)
const actualizarPerfil = async (req, res, next) => {
  try {
    const camposPermitidos = ['nombre', 'apellido', 'municipio', 'tipoPerfil', 'telefono'];
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        req.usuario[campo] = req.body[campo];
      }
    });

    await req.usuario.save();
    res.json({ mensaje: 'Perfil actualizado.', usuario: datosUsuario(req.usuario) });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/usuarios (solo administrador)
// Lista de usuarios: la usa el panel del administrador para saber cuántos
// hay y para enviarle una alerta a uno en particular.
const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find({}).sort({ createdAt: -1 });
    res.json({
      total: usuarios.length,
      usuarios: usuarios.map((u) => ({
        ...datosUsuario(u),
        activo: u.activo,
        creadoEn: u.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrar,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil,
  listarUsuarios,
  datosUsuario
};
