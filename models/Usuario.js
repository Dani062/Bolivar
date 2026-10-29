const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MUNICIPIOS } = require('../utils/constantes');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String, required: true, minlength: 6, select: false },
    municipio: { type: String, enum: MUNICIOS_VALIDOS(), required: true },
    // Datos que pide el formulario de registro de la app
    identificacion: { type: String, trim: true },
    telefono: { type: String, trim: true },
    tipoPerfil: {
      type: String,
      enum: ['Estudiante', 'Profesional', 'Emprendedor'],
      default: 'Estudiante'
    },
    rol: { type: String, enum: ['usuario', 'administrador'], default: 'usuario' },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Municipios válidos para el usuario (sin "Todo Bolívar")
function MUNICIOS_VALIDOS() {
  return MUNICIPIOS.filter((m) => m !== 'Todo Bolívar');
}

// Hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas en el login
usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
