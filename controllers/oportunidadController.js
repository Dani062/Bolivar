const Oportunidad = require('../models/Oportunidad');
const Favorito = require('../models/Favorito');
const Postulacion = require('../models/Postulacion');
const Inscripcion = require('../models/Inscripcion');

// Convierte pagina y limite en números válidos.
const paginacion = (pagina, limite, limitePorDefecto) => {
  const p = Math.max(parseInt(pagina, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limite, 10) || limitePorDefecto, 1), 100);
  return { p, l, salto: (p - 1) * l };
};

// Campos que el cliente no puede enviar: los controla el servidor.
const CAMPOS_PROTEGIDOS = ['_id', 'id', 'creadoPor', 'createdAt', 'updatedAt', '__v'];

// Deja en el cuerpo solo los campos que el cliente sí puede enviar.
const soloCamposPermitidos = (cuerpo) => {
  const limpio = {};
  for (const [clave, valor] of Object.entries(cuerpo || {})) {
    if (!CAMPOS_PROTEGIDOS.includes(clave)) limpio[clave] = valor;
  }
  return limpio;
};

// GET /api/oportunidades (público, solo las activas)
const listarOportunidades = async (req, res, next) => {
  try {
    const { municipio, categoria, tipo, clase, pagina, limite } = req.query;
    const { p, l, salto } = paginacion(pagina, limite, 10);

    const filtro = { estado: 'activa' };

    // Un municipio incluye también las oportunidades de "Todo Bolívar".
    if (municipio && municipio !== 'Todo Bolívar') {
      filtro.municipio = { $in: [municipio, 'Todo Bolívar'] };
    } else if (municipio === 'Todo Bolívar') {
      filtro.municipio = 'Todo Bolívar';
    }

    if (categoria) filtro.categoria = categoria;
    if (tipo) filtro.tipo = tipo;
    if (clase) filtro.clase = clase;

    const [oportunidades, total] = await Promise.all([
      Oportunidad.find(filtro)
        .sort({ createdAt: -1 })
        .skip(salto)
        .limit(l),
      Oportunidad.countDocuments(filtro)
    ]);

    res.json({
      total,
      pagina: p,
      totalPaginas: Math.ceil(total / l),
      oportunidades
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/oportunidades/todas (solo administrador, incluye cerradas)
const listarTodasOportunidades = async (req, res, next) => {
  try {
    const { municipio, categoria, tipo, clase, pagina, limite } = req.query;
    const { p, l, salto } = paginacion(pagina, limite, 100);

    const filtro = {};

    if (municipio && municipio !== 'Todo Bolívar') {
      filtro.municipio = { $in: [municipio, 'Todo Bolívar'] };
    }
    if (categoria) filtro.categoria = categoria;
    if (tipo) filtro.tipo = tipo;
    if (clase) filtro.clase = clase;

    const [oportunidades, total] = await Promise.all([
      Oportunidad.find(filtro)
        .sort({ createdAt: -1 })
        .skip(salto)
        .limit(l),
      Oportunidad.countDocuments(filtro)
    ]);

    res.json({
      total,
      pagina: p,
      totalPaginas: Math.ceil(total / l),
      oportunidades
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/oportunidades/:id
const obtenerOportunidad = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.findById(req.params.id);
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'Oportunidad no encontrada.' });
    }
    res.json({ oportunidad });
  } catch (error) {
    next(error);
  }
};

// POST /api/oportunidades (solo administrador)
const crearOportunidad = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.create({
      ...soloCamposPermitidos(req.body),
      creadoPor: req.usuario._id
    });
    res.status(201).json({ mensaje: 'Oportunidad creada.', oportunidad });
  } catch (error) {
    next(error);
  }
};

// PUT /api/oportunidades/:id (solo administrador)
const actualizarOportunidad = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.findByIdAndUpdate(
      req.params.id,
      soloCamposPermitidos(req.body),
      { new: true, runValidators: true }
    );
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'Oportunidad no encontrada.' });
    }
    res.json({ mensaje: 'Oportunidad actualizada.', oportunidad });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/oportunidades/:id (solo administrador)
const eliminarOportunidad = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.findByIdAndDelete(req.params.id);
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'Oportunidad no encontrada.' });
    }
    // Se borran también sus favoritos, postulaciones e inscripciones.
    await Promise.all([
      Favorito.deleteMany({ oportunidad: oportunidad._id }),
      Postulacion.deleteMany({ oportunidad: oportunidad._id }),
      Inscripcion.deleteMany({ oportunidad: oportunidad._id })
    ]);
    res.json({ mensaje: 'Oportunidad eliminada.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarOportunidades,
  listarTodasOportunidades,
  obtenerOportunidad,
  crearOportunidad,
  actualizarOportunidad,
  eliminarOportunidad
};
