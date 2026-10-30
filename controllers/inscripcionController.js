const Inscripcion = require('../models/Inscripcion');
const Oportunidad = require('../models/Oportunidad');
const Usuario = require('../models/Usuario');
const Notificacion = require('../models/Notificacion');

// Avisa a todos los administradores activos.
const avisarAdmins = async (titulo, mensaje, icono = 'beca') => {
  const admins = await Usuario.find({ rol: 'administrador', activo: true }).select('_id');
  if (admins.length === 0) return;
  await Notificacion.insertMany(
    admins.map((a) => ({ usuario: a._id, titulo, mensaje, icono }))
  );
};

// POST /api/inscripciones   body: { oportunidadId }
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

    const yaEsta = await Inscripcion.findOne({
      usuario: req.usuario._id,
      oportunidad: oportunidadId
    });
    if (yaEsta) {
      return res.status(400).json({ mensaje: 'Ya estabas inscrito en esa oferta.' });
    }

    const inscripcion = await Inscripcion.create({
      usuario: req.usuario._id,
      oportunidad: oportunidadId
    });

    await avisarAdmins(
      'Nueva inscripción',
      `${req.usuario.nombre} ${req.usuario.apellido} se inscribió en "${oportunidad.titulo}".`
    );

    const completa = await Inscripcion.findById(inscripcion._id).populate('oportunidad');
    res.status(201).json({ mensaje: 'Inscripción registrada.', inscripcion: completa });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya estabas inscrito en esa oferta.' });
    }
    next(error);
  }
};

// GET /api/inscripciones/mias
const mias = async (req, res, next) => {
  try {
    const inscripciones = await Inscripcion.find({ usuario: req.usuario._id })
      .populate('oportunidad')
      .sort({ createdAt: -1 });

    // Si la oportunidad se borró, no se devuelve el registro vacío.
    res.json({ inscripciones: inscripciones.filter((x) => x.oportunidad) });
  } catch (error) {
    next(error);
  }
};

// GET /api/inscripciones (solo administrador): quién se inscribió en qué
const todas = async (req, res, next) => {
  try {
    const inscripciones = await Inscripcion.find({})
      .populate('usuario', 'nombre apellido email municipio')
      .populate('oportunidad')
      .sort({ createdAt: -1 });

    res.json({ inscripciones: inscripciones.filter((x) => x.oportunidad && x.usuario) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/inscripciones/:id  (el dueño o el administrador)
const eliminar = async (req, res, next) => {
  try {
    const inscripcion = await Inscripcion.findById(req.params.id);
    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'La inscripción no existe.' });
    }

    const esSuya = inscripcion.usuario.toString() === req.usuario._id.toString();
    if (!esSuya && req.usuario.rol !== 'administrador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción.' });
    }

    await inscripcion.deleteOne();
    res.json({ mensaje: 'Inscripción anulada.' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/inscripciones/oportunidad/:oportunidadId (botón "Anular" de la app)
const anularPorOportunidad = async (req, res, next) => {
  try {
    const inscripcion = await Inscripcion.findOne({
      usuario: req.usuario._id,
      oportunidad: req.params.oportunidadId
    });
    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'No estás inscrito en esa oportunidad.' });
    }

    await inscripcion.deleteOne();
    res.json({ mensaje: 'Inscripción anulada.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear, mias, todas, eliminar, anularPorOportunidad };
