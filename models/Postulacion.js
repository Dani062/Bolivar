const mongoose = require('mongoose');

// Postulación de un usuario a una oferta laboral.
const postulacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    oportunidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Oportunidad', required: true, index: true },
    estado: {
      type: String,
      enum: ['Enviada', 'En revisión', 'Aceptada', 'Rechazada'],
      default: 'Enviada'
    }
  },
  { timestamps: true }
);

// Un usuario no se postula dos veces a la misma oferta.
postulacionSchema.index({ usuario: 1, oportunidad: 1 }, { unique: true });

module.exports = mongoose.model('Postulacion', postulacionSchema);
