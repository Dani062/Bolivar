const mongoose = require('mongoose');

const favoritoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    oportunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Oportunidad', required: true }
  },
  { timestamps: true }
);

// Evita que un usuario guarde la misma oportunidad dos veces
favoritoSchema.index({ usuario: 1, oportunidad: 1 }, { unique: true });

module.exports = mongoose.model('Favorito', favoritoSchema);
