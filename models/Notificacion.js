const mongoose = require('mongoose');

// Aviso para un usuario de la app (postulación enviada, cambio de estado,
// alerta general del administrador...).
const notificacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    titulo: { type: String, required: true, trim: true },
    icono: { type: String, default: 'notificacion' },
    mensaje: { type: String, required: true, trim: true },
    leida: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notificacion', notificacionSchema);
