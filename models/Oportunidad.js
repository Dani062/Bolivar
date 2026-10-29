const mongoose = require('mongoose');
const { MUNICIPIOS, CATEGORIAS, TODOS_LOS_TIPOS } = require('../utils/constantes');

const oportunidadSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    // Académica o laboral
    clase: { type: String, enum: ['academica', 'laboral'], default: 'academica' },
    categoria: { type: String, enum: CATEGORIAS, default: 'Educación' },
    tipo: { type: String, enum: TODOS_LOS_TIPOS, default: 'Cursos' },
    municipio: { type: String, enum: MUNICIPIOS, default: 'Todo Bolívar' },
    entidadOrganizadora: { type: String, trim: true },
    requisitos: { type: String },
    fechaCierre: { type: Date },
    enlaceExterno: { type: String, trim: true },
    imagenUrl: { type: String, trim: true },
    // Campos del formulario académico de la app
    cupos: { type: Number, min: 0 },
    // Campos del formulario laboral de la app
    empresa: { type: String, trim: true },
    cargo: { type: String, trim: true },
    salario: { type: String, trim: true },
    ubicacion: { type: String, trim: true },
    contacto: { type: String, trim: true },
    fechaPublicacion: { type: String, trim: true },
    estado: {
      type: String,
      enum: ['activa', 'cerrada', 'pendiente'],
      default: 'activa'
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

// Índice para que los filtros de búsqueda sean rápidos
oportunidadSchema.index({ municipio: 1, categoria: 1, tipo: 1 });

module.exports = mongoose.model('Oportunidad', oportunidadSchema);
