const Oportunidad = require('../models/Oportunidad');

// Campos que el cliente NO puede escribir: los controla el servidor.
// Sin esta lista un POST podría elegir el _id y un PUT podría cambiar el
// autor de la publicación o las fechas de auditoría.
const CAMPOS_PROTEGIDOS = ['_id', 'id', 'creadoPor', 'createdAt', 'updatedAt', '__v'];

// Deja en el cuerpo solo los campos que el cliente sí puede enviar.
const soloCamposPermitidos = (cuerpo) => {
  const limpio = {};
  for (const [clave, valor] of Object.entries(cuerpo || {})) {
    if (!CAMPOS_PROTEGIDOS.includes(clave)) limpio[clave] = valor;
  }
  return limpio;
};

// GET /api/oportunidades?municipio=&categoria=&tipo=&pagina=&limite=
// Listado público: solo las oportunidades activas.
const listarOportunidades = async (req, res, next) => {
  try {
    const { municipio, categoria, tipo, clase, pagina = 1, limite = 10 } = req.query;

    const filtro = { estado: 'activa' };

    // Si el usuario filtra por un municipio específico, también mostramos
    // las oportunidades marcadas como "Todo Bolívar"
    if (municipio && municipio !== 'Todo Bolívar') {
      filtro.municipio = { $in: [municipio, 'Todo Bolívar'] };
    } else if (municipio === 'Todo Bolívar') {
      filtro.municipio = 'Todo Bolívar';
    }

    if (categoria) filtro.categoria = categoria;
    if (tipo) filtro.tipo = tipo;
    if (clase) filtro.clase = clase;

    const salto = (Number(pagina) - 1) * Number(limite);

    const [oportunidades, total] = await Promise.all([
      Oportunidad.find(filtro)
        .sort({ createdAt: -1 })
        .skip(salto)
        .limit(Number(limite)),
      Oportunidad.countDocuments(filtro)
    ]);

    res.json({
      total,
      pagina: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
      oportunidades
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/oportunidades/todas  (solo administrador)
// Listado completo: incluye las oportunidades cerradas y pendientes, que de
// otro modo el administrador no podría volver a editar desde la app.
const listarTodasOportunidades = async (req, res, next) => {
  try {
    const { municipio, categoria, tipo, clase, pagina = 1, limite = 100 } = req.query;

    const filtro = {};

    if (municipio && municipio !== 'Todo Bolívar') {
      filtro.municipio = { $in: [municipio, 'Todo Bolívar'] };
    }
    if (categoria) filtro.categoria = categoria;
    if (tipo) filtro.tipo = tipo;
    if (clase) filtro.clase = clase;

    const salto = (Number(pagina) - 1) * Number(limite);

    const [oportunidades, total] = await Promise.all([
      Oportunidad.find(filtro)
        .sort({ createdAt: -1 })
        .skip(salto)
        .limit(Number(limite)),
      Oportunidad.countDocuments(filtro)
    ]);

    res.json({
      total,
      pagina: Number(pagina),
      totalPaginas: Math.ceil(total / limite),
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
