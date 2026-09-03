const mongoose = require('mongoose');
const { MUNICIPIOS, CATEGORIAS, TODOS_LOS_TIPOS } = require('../utils/constantes');

const oportunidadSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    categoria: { type: String, enum: CATEGORIAS, required: true },
    tipo: { type: String, enum: TODOS_LOS_TIPOS, required: true },
    municipio: { type: String, enum: MUNICIPIOS, required: true },
    entidadOrganizadora: { type: String, trim: true },
    requisitos: { type: String },
    fechaCierre: { type: Date },
    enlaceExterno: { type: String, trim: true },
    imagenUrl: { type: String, trim: true },
    estado: {
      type: String,
      enum: ['activa', 'cerrada', 'pendiente'],
      default: 'activa'
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

// Índices para que los filtros de búsqueda (municipio + categoria + tipo) sean rápidos
oportunidadSchema.index({ municipio: 1, categoria: 1, tipo: 1 });

module.exports = mongoose.model('Oportunidad', oportunidadSchema);
