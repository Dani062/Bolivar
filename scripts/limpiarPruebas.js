// Limpia los datos que dejan las pruebas automáticas.
// Uso: npm run limpiar
//
// Borra las cuentas de prueba (correos que empiezan por "prueba", "sonda" o
// "probe"), lo que colgaba de ellas (postulaciones, inscripciones y
// notificaciones) y las oportunidades que se crearon solo para probar.
// NO toca las cuentas reales ni las oportunidades publicadas desde la app.
require('dotenv').config();
const conectarDB = require('../config/db');
const Usuario = require('../models/Usuario');
const Oportunidad = require('../models/Oportunidad');
const Postulacion = require('../models/Postulacion');
const Inscripcion = require('../models/Inscripcion');
const Notificacion = require('../models/Notificacion');

// Las oportunidades de prueba empiezan por estos textos.
const REGEX_OPORTUNIDAD_PRUEBA = /^Oportunidad (de prueba automatizada|para pruebas)/;

const CORREOS_PRUEBA = { $regex: /^(prueba\.|sonda\.|probe|humo\.|postman\.prueba@)/ };

const empezar = async () => {
  await conectarDB();

  const usuariosPrueba = await Usuario.find({ email: CORREOS_PRUEBA }).select('_id');
  const idsUsuario = usuariosPrueba.map((u) => u._id);

  const oportunidadesPrueba = await Oportunidad.find({
    titulo: { $regex: REGEX_OPORTUNIDAD_PRUEBA }
  }).select('_id');
  const idsOportunidad = oportunidadesPrueba.map((o) => o._id);

  const borrar = async (modelo, filtro, texto) => {
    const r = await modelo.deleteMany(filtro);
    if (r.deletedCount > 0) console.log(`  - ${r.deletedCount} ${texto}`);
  };

  console.log('Borrando datos de prueba...');

  await borrar(Postulacion, { usuario: { $in: idsUsuario } }, 'postulaciones');
  await borrar(Postulacion, { oportunidad: { $in: idsOportunidad } }, 'postulaciones');
  await borrar(Inscripcion, { usuario: { $in: idsUsuario } }, 'inscripciones');
  await borrar(Inscripcion, { oportunidad: { $in: idsOportunidad } }, 'inscripciones');
  await borrar(Notificacion, { usuario: { $in: idsUsuario } }, 'notificaciones');
  await borrar(
    Notificacion,
    { titulo: { $in: ['Alerta de prueba', 'Mensaje de prueba'] } },
    'notificaciones de alerta de prueba'
  );
  // Avisos que el backend mandó al administrador cuando las pruebas
  // postularon e inscribieron a usuarios de prueba.
  await borrar(
    Notificacion,
    {
      $or: [
        { mensaje: { $regex: /Oportunidad (de prueba automatizada|para pruebas)/ } },
        { mensaje: { $regex: /se postuló a|se inscribió en/ } }
      ]
    },
    'notificaciones de postulación e inscripción de prueba'
  );
  await borrar(
    Oportunidad,
    { titulo: { $regex: REGEX_OPORTUNIDAD_PRUEBA } },
    'oportunidades de prueba'
  );
  await borrar(Usuario, { _id: { $in: idsUsuario } }, 'cuentas de prueba');

  // Notificaciones que quedaron apuntando a usuarios que ya no existen
  // (por ejemplo, avisos de postulación que el backend mandó al admin).
  const usuariosVivos = await Usuario.find().select('_id');
  const idsVivos = usuariosVivos.map((u) => u._id);
  await borrar(
    Notificacion,
    { usuario: { $nin: idsVivos } },
    'notificaciones huérfanas'
  );

  console.log('\nListo. La base quedó con los datos reales.');
  process.exit(0);
};

empezar().catch((error) => {
  console.error('Error al limpiar:', error.message);
  process.exit(1);
});
