// Crea (o corrige) el administrador de la app Android en MongoDB.
// Uso: npm run seed
require('dotenv').config();
const conectarDB = require('../config/db');
const Usuario = require('../models/Usuario');

const CORREO = process.env.ADMIN_EMAIL || 'admin@bolivar.com';
const CLAVE = process.env.ADMIN_PASSWORD || 'admin123';

const empezar = async () => {
  await conectarDB();

  const existe = await Usuario.findOne({ email: CORREO });

  if (existe) {
    existe.rol = 'administrador';
    existe.activo = true;
    // No se toca el password: así no se vuelve a hashear.
    await existe.save();
    console.log(`Ya existía "${CORREO}": rol actualizado a administrador.`);
  } else {
    await Usuario.create({
      nombre: 'Admin',
      apellido: 'Bolívar',
      email: CORREO,
      password: CLAVE,
      municipio: 'Cartagena',
      rol: 'administrador'
    });
    console.log(`Administrador creado: ${CORREO}`);
  }

  process.exit(0);
};

empezar().catch((error) => {
  console.error('Error al crear el administrador:', error.message);
  process.exit(1);
});
