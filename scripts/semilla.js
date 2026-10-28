// Carga un conjunto de oportunidades de ejemplo en MongoDB.
// Uso: npm run semilla
//
// El script es idempotente: si ya existe una oportunidad con el mismo título
// no la vuelve a crear, así que se puede ejecutar las veces que haga falta.
require('dotenv').config();
const conectarDB = require('../config/db');
const Usuario = require('../models/Usuario');
const Oportunidad = require('../models/Oportunidad');

const CORREO = process.env.ADMIN_EMAIL || 'admin@bolivar.com';

const OPORTUNIDADES = [
  {
    titulo: 'Desarrollo Web Frontend',
    descripcion: 'Curso de programación web con HTML, CSS y JavaScript.',
    clase: 'academica',
    categoria: 'Educación',
    tipo: 'Cursos',
    municipio: 'Cartagena de Indias',
    entidadOrganizadora: 'Tecnológico de Bolívar',
    requisitos: 'Ninguno, curso para principiantes',
    cupos: 30
  },
  {
    titulo: 'Inglés para Negocios',
    descripcion: 'Curso de inglés aplicado al mundo empresarial.',
    clase: 'academica',
    categoria: 'Educación',
    tipo: 'Cursos',
    municipio: 'Cartagena de Indias',
    entidadOrganizadora: 'SENA Bolívar',
    requisitos: 'Nivel A2 en adelante',
    cupos: 25
  },
  {
    titulo: 'Beca 100% para estudios superiores',
    descripcion: 'Beca de porcentaje para cursar un programa de educación superior.',
    clase: 'academica',
    categoria: 'Educación',
    tipo: 'Becas',
    municipio: 'Todo Bolívar',
    entidadOrganizadora: 'Alcaldía de Bolívar',
    requisitos: 'Puntaje de admission vigente',
    cupos: 15
  },
  {
    titulo: 'Asistente de Marketing Digital',
    descripcion: 'Apoyo en campañas y redes sociales.',
    clase: 'laboral',
    categoria: 'Trabajo',
    tipo: 'Ofertas laborales',
    municipio: 'Cartagena de Indias',
    requisitos: 'Estudiante o técnico en mercadeo',
    cupos: 1,
    empresa: 'Agencia Creativa Heroica',
    cargo: 'Asistente de Marketing Digital',
    salario: '$1.5M - $1.8M COP',
    ubicacion: 'Cartagena de Indias',
    contacto: 'contacto@agenciaheroica.co'
  },
  {
    titulo: 'Desarrollo Frontend Junior',
    descripcion: 'Mantenimiento de aplicaciones web.',
    clase: 'laboral',
    categoria: 'Trabajo',
    tipo: 'Ofertas laborales',
    municipio: 'Turbaco',
    requisitos: 'Conocimientos en HTML, CSS y JavaScript',
    cupos: 1,
    empresa: 'Bolívar Tech Solutions',
    cargo: 'Desarrollo Frontend Junior',
    salario: '$2.2M - $2.6M COP',
    ubicacion: 'Turbaco (Híbrido)',
    contacto: 'empleo@bolivartech.co'
  },
  {
    titulo: 'Soporte Técnico',
    descripcion: 'Atención de incidencias de hardware y software.',
    clase: 'laboral',
    categoria: 'Trabajo',
    tipo: 'Ofertas laborales',
    municipio: 'Cartagena de Indias',
    requisitos: 'Conocimientos en sistemas',
    cupos: 1,
    empresa: 'Cámara de Comercio',
    cargo: 'Soporte Técnico',
    salario: '$1.3M COP',
    ubicacion: 'Cartagena de Indias',
    contacto: 'rrhh@camaracartagena.co'
  },
  {
    titulo: 'Gestor de Proyectos Sociales',
    descripcion: 'Coordinación de proyectos comunitarios.',
    clase: 'laboral',
    categoria: 'Trabajo',
    tipo: 'Ofertas laborales',
    municipio: 'Arjona',
    requisitos: 'Experiencia en trabajo social',
    cupos: 1,
    empresa: 'Fundación Bolívar',
    cargo: 'Gestor de Proyectos Sociales',
    salario: '$1.8M COP',
    ubicacion: 'Arjona',
    contacto: 'proyectos@fundacionbolivar.org'
  }
];

const empezar = async () => {
  await conectarDB();

  const admin = await Usuario.findOne({ email: CORREO });
  if (!admin) {
    console.error(
      `No existe el usuario "${CORREO}". Ejecuta primero "npm run seed" para crear el administrador.`
    );
    process.exit(1);
  }

  let creadas = 0;
  let repetidas = 0;

  for (const datos of OPORTUNIDADES) {
    const existe = await Oportunidad.findOne({ titulo: datos.titulo });
    if (existe) {
      repetidas++;
      continue;
    }
    await Oportunidad.create({
      ...datos,
      fechaPublicacion: new Date().toISOString().slice(0, 10),
      estado: 'activa',
      creadoPor: admin._id
    });
    creadas++;
    console.log(`  + ${datos.titulo}`);
  }

  console.log(`\nOportunidades de ejemplo: ${creadas} creadas, ${repetidas} ya existían.`);
  process.exit(0);
};

empezar().catch((error) => {
  console.error('Error al cargar las oportunidades de ejemplo:', error.message);
  process.exit(1);
});
