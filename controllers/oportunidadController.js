const Oportunidad = require('../models/Oportunidad');
const Favorito = require('../models/Favorito');
const Postulacion = require('../models/Postulacion');
const Inscripcion = require('../models/Inscripcion');
const { nitValido, formatearNit } = require('../utils/nit');
const { leerImagen } = require('../utils/imagen');

// Convierte pagina y limite en números válidos.
const paginacion = (pagina, limite, limitePorDefecto) => {
  const p = Math.max(parseInt(pagina, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limite, 10) || limitePorDefecto, 1), 100);
  return { p, l, salto: (p - 1) * l };
};

// Campos que el cliente no puede enviar: los controla el servidor.
const CAMPOS_PROTEGIDOS = [
  '_id', 'id', 'creadoPor', 'createdAt', 'updatedAt', '__v', 'empresaVerificada',
  'imagenDatos', 'imagenTipo', 'tieneImagen', 'imagenActualizada'
];

// Si llega un NIT, lo guarda con formato estándar y marca la empresa como verificada.
const aplicarNit = (datos) => {
  if (datos.nit === undefined) return datos;
  const valido = nitValido(datos.nit);
  datos.nit = valido ? formatearNit(datos.nit) : '';
  datos.empresaVerificada = valido;
  return datos;
};

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
      ...aplicarNit(soloCamposPermitidos(req.body)),
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
      aplicarNit(soloCamposPermitidos(req.body)),
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

// PUT /api/oportunidades/:id/imagen (solo administrador). Cuerpo: { imagen: '<base64>' }
const subirImagen = async (req, res, next) => {
  try {
    const { datos, tipo, error } = leerImagen(req.body?.imagen);
    if (error) return res.status(400).json({ mensaje: error });

    const oportunidad = await Oportunidad.findByIdAndUpdate(
      req.params.id,
      { imagenDatos: datos, imagenTipo: tipo, tieneImagen: true, imagenActualizada: new Date() },
      { new: true }
    );
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'Oportunidad no encontrada.' });
    }
    res.json({ mensaje: 'Foto guardada.', oportunidad });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/oportunidades/:id/imagen (solo administrador)
const quitarImagen = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.findByIdAndUpdate(
      req.params.id,
      { $unset: { imagenDatos: 1, imagenTipo: 1, imagenActualizada: 1 }, tieneImagen: false },
      { new: true }
    );
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'Oportunidad no encontrada.' });
    }
    res.json({ mensaje: 'Foto eliminada.', oportunidad });
  } catch (error) {
    next(error);
  }
};

// GET /api/oportunidades/:id/imagen (público): devuelve la foto tal cual
const verImagen = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.findById(req.params.id).select('+imagenDatos +imagenTipo');
    if (!oportunidad || !oportunidad.imagenDatos) {
      return res.status(404).json({ mensaje: 'Esta oportunidad no tiene foto.' });
    }
    res.set('Content-Type', oportunidad.imagenTipo || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.send(oportunidad.imagenDatos);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subirImagen,
  quitarImagen,
  verImagen,
  listarOportunidades,
  listarTodasOportunidades,
  obtenerOportunidad,
  crearOportunidad,
  actualizarOportunidad,
  eliminarOportunidad
};
