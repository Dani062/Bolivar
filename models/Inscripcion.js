const mongoose = require('mongoose');

// Inscripción de un usuario a una oportunidad académica (curso, beca,
// taller o evento).
const inscripcionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    oportunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Oportunidad', required: true, index: true },
    estado: {
      type: String,
      enum: ['Inscrito', 'Anulada'],
      default: 'Inscrito'
    }
  },
  { timestamps: true }
);

// Un usuario no se inscribe dos veces en la misma oportunidad.
inscripcionSchema.index({ usuario: 1, oportunidad: 1 }, { unique: true });

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
