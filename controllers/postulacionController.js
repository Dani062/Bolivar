const Postulacion = require('../models/Postulacion');
const Oportunidad = require('../models/Oportunidad');
const Usuario = require('../models/Usuario');
const Notificacion = require('../models/Notificacion');

const ESTADOS = ['Enviada', 'En revisión', 'Aceptada', 'Rechazada'];

// Avisa a todos los administradores activos.
const avisarAdmins = async (titulo, mensaje, icono = 'postulacion') => {
  const admins = await Usuario.find({ rol: 'administrador', activo: true }).select('_id');
  if (admins.length === 0) return;
  await Notificacion.insertMany(
    admins.map((a) => ({ usuario: a._id, titulo, mensaje, icono }))
  );
};

// POST /api/postulaciones   body: { oportunidadId }
const crear = async (req, res, next) => {
  try {
    const { oportunidadId } = req.body;
    if (!oportunidadId) {
      return res.status(400).json({ mensaje: 'Falta el id de la oportunidad.' });
    }

    const oportunidad = await Oportunidad.findById(oportunidadId);
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'La oportunidad no existe.' });
    }

    const yaEsta = await Postulacion.findOne({
      usuario: req.usuario._id,
      oportunidad: oportunidadId
    });
    if (yaEsta) {
      return res.status(400).json({ mensaje: 'Ya te postulaste a esta oferta.' });
    }

    const postulacion = await Postulacion.create({
      usuario: req.usuario._id,
      oportunidad: oportunidadId
    });

    await avisarAdmins(
      'Nueva postulación recibida',
      `${req.usuario.nombre} ${req.usuario.apellido} se postuló a "${oportunidad.titulo}".`
    );

    const completa = await Postulacion.findById(postulacion._id).populate('oportunidad');
    res.status(201).json({ mensaje: 'Postulación registrada.', postulacion: completa });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya te postulaste a esta oferta.' });
    }
    next(error);
  }
};

// GET /api/postulaciones/mias
const mias = async (req, res, next) => {
  try {
    const postulaciones = await Postulacion.find({ usuario: req.usuario._id })
      .populate('oportunidad')
      .sort({ createdAt: -1 });

    // Si la oportunidad se borró, no se devuelve el registro vacío.
    res.json({ postulaciones: postulaciones.filter((x) => x.oportunidad) });
  } catch (error) {
    next(error);
  }
};

// GET /api/postulaciones  (solo administrador)
const todas = async (req, res, next) => {
  try {
    const postulaciones = await Postulacion.find({})
      .populate('usuario', 'nombre apellido email')
      .populate('oportunidad')
      .sort({ createdAt: -1 });

    // Si la oportunidad se borró, no se devuelve el registro vacío.
    res.json({ postulaciones: postulaciones.filter((x) => x.oportunidad) });
  } catch (error) {
    next(error);
  }
};

// PUT /api/postulaciones/:id/estado   body: { estado }  (solo administrador)
const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({
        mensaje: 'Estado inválido.',
        errores: [`El estado debe ser uno de: ${ESTADOS.join(', ')}.`]
      });
    }

    const postulacion = await Postulacion.findById(req.params.id);
    if (!postulacion) {
      return res.status(404).json({ mensaje: 'La postulación no existe.' });
    }

    postulacion.estado = estado;
    await postulacion.save();

    const completa = await Postulacion.findById(postulacion._id)
      .populate('usuario', 'nombre apellido email')
      .populate('oportunidad');

    // Se avisa al estudiante del cambio de estado.
    await Notificacion.create({
      usuario: postulacion.usuario,
      titulo: `Postulación ${estado}`,
      icono: 'postulacion',
      mensaje:
        estado === 'Aceptada'
          ? '¡Felicidades! Tu postulación fue aceptada. Revisa el contacto de la oferta.'
          : `Tu postulación fue revisada. Estado: ${estado}.`
    });

    res.json({ mensaje: 'Estado actualizado.', postulacion: completa });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/postulaciones/:id  (el dueño o el administrador)
const eliminar = async (req, res, next) => {
  try {
    const postulacion = await Postulacion.findById(req.params.id);
    if (!postulacion) {
      return res.status(404).json({ mensaje: 'La postulación no existe.' });
    }

    const esDueña = postulacion.usuario.toString() === req.usuario._id.toString();
    if (!esDueña && req.usuario.rol !== 'administrador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción.' });
    }

    await postulacion.deleteOne();
    res.json({ mensaje: 'Postulación eliminada.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear, mias, todas, cambiarEstado, eliminar, ESTADOS };
