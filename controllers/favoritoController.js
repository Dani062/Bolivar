const Favorito = require('../models/Favorito');
const Oportunidad = require('../models/Oportunidad');

// GET /api/favoritos (protegido)
const listarFavoritos = async (req, res, next) => {
  try {
    const favoritos = await Favorito.find({ usuario: req.usuario._id }).populate('oportunidad');
    // Si la oportunidad se borró, el favorito se descarta: en la respuesta
    // nunca debe venir una oportunidad vacía.
    res.json({ favoritos: favoritos.filter((f) => f.oportunidad) });
  } catch (error) {
    next(error);
  }
};

// POST /api/favoritos/:oportunidadId (protegido)
const agregarFavorito = async (req, res, next) => {
  try {
    const oportunidad = await Oportunidad.findById(req.params.oportunidadId);
    if (!oportunidad) {
      return res.status(404).json({ mensaje: 'La oportunidad no existe.' });
    }

    const favorito = await Favorito.create({
      usuario: req.usuario._id,
      oportunidad: req.params.oportunidadId
    });
    res.status(201).json({ mensaje: 'Agregado a favoritos.', favorito });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya tienes esta oportunidad en favoritos.' });
    }
    next(error);
  }
};

// DELETE /api/favoritos/:oportunidadId (protegido)
const quitarFavorito = async (req, res, next) => {
  try {
    await Favorito.findOneAndDelete({
      usuario: req.usuario._id,
      oportunidad: req.params.oportunidadId
    });
    res.json({ mensaje: 'Eliminado de favoritos.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarFavoritos, agregarFavorito, quitarFavorito };
