const Notificacion = require('../models/Notificacion');
const Usuario = require('../models/Usuario');

// GET /api/notificaciones
// Las notificaciones del usuario que tiene la sesión iniciada.
const listar = async (req, res, next) => {
  try {
    const notificaciones = await Notificacion.find({ usuario: req.usuario._id })
      .sort({ createdAt: -1 });

    res.json({ notificaciones });
  } catch (error) {
    next(error);
  }
};

// GET /api/notificaciones/recientes  (solo administrador)
// Historial de las últimas alertas enviadas, para que el administrador vea
// lo que ya publicó.
const recientes = async (req, res, next) => {
  try {
    const limite = Math.min(Number(req.query.limite) || 10, 100);
    const notificaciones = await Notificacion.find({})
      .populate('usuario', 'nombre apellido')
      .sort({ createdAt: -1 })
      .limit(limite);

    res.json({ notificaciones });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notificaciones/:id/leida
const marcarLeida = async (req, res, next) => {
  try {
    const notificacion = await Notificacion.findOne({
      _id: req.params.id,
      usuario: req.usuario._id
    });
    if (!notificacion) {
      return res.status(404).json({ mensaje: 'La notificación no existe.' });
    }

    notificacion.leida = true;
    await notificacion.save();
    res.json({ mensaje: 'Notificación marcada como leída.', notificacion });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notificaciones/leer-todas
const marcarTodasLeidas = async (req, res, next) => {
  try {
    const r = await Notificacion.updateMany(
      { usuario: req.usuario._id, leida: false },
      { leida: true }
    );
    res.json({ mensaje: 'Notificaciones marcadas como leídas.', actualizadas: r.modifiedCount });
  } catch (error) {
    next(error);
  }
};

// POST /api/notificaciones  (solo administrador)
// body: { titulo, mensaje, icono, usuarioId? }
// Si no viene usuarioId la alerta se envía a todos los usuarios activos.
const crear = async (req, res, next) => {
  try {
    const { titulo, mensaje, icono = 'notificacion', usuarioId } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ mensaje: 'El título de la alerta es obligatorio.' });
    }
    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({ mensaje: 'El mensaje de la alerta es obligatorio.' });
    }

    let destinos;
    if (usuarioId) {
      const usuario = await Usuario.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({ mensaje: 'El usuario no existe.' });
      }
      destinos = [usuario];
    } else {
      destinos = await Usuario.find({ activo: true }).select('_id');
    }

    await Notificacion.insertMany(
      destinos.map((u) => ({
        usuario: u._id,
        titulo: titulo.trim(),
        icono,
        mensaje: mensaje.trim()
      }))
    );

    res.status(201).json({
      mensaje: `Alerta enviada a ${destinos.length} usuario(s).`,
      enviadas: destinos.length
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notificaciones/:id
// El usuario borra las suyas; el administrador puede borrar cualquiera
// (las alertas que él mandó viven en la cuenta de cada usuario).
const eliminar = async (req, res, next) => {
  try {
    const filtro = { _id: req.params.id };
    if (req.usuario.rol !== 'administrador') {
      filtro.usuario = req.usuario._id;
    }

    const notificacion = await Notificacion.findOne(filtro);
    if (!notificacion) {
      return res.status(404).json({ mensaje: 'La notificación no existe.' });
    }

    await notificacion.deleteOne();
    res.json({ mensaje: 'Notificación eliminada.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, recientes, marcarLeida, marcarTodasLeidas, crear, eliminar };
