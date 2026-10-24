// Listas fijas del dominio de la app.

// Los 44 municipios y 2 distritos del departamento de Bolívar, igual que la
// lista que usa la app (lib/datos/municipios.dart). Al final se dejan los
// nombres cortos que usaron las primeras versiones, para que los documentos
// que ya están en Atlas (el administrador, por ejemplo) sigan siendo válidos.
const MUNICIPIOS = [
  'Todo Bolívar',
  'Achí',
  'Altos del Rosario',
  'Arenal',
  'Arjona',
  'Arroyohondo',
  'Barranco de Loba',
  'Calamar',
  'Cantagallo',
  'Cartagena de Indias',
  'Cicuco',
  'Clemencia',
  'Córdoba',
  'El Carmen de Bolívar',
  'El Guamo',
  'El Peñón',
  'Hatillo de Loba',
  'Magangué',
  'Mahates',
  'Margarita',
  'María La Baja',
  'Montecristo',
  'Morales',
  'Norosí',
  'Pinillos',
  'Regidor',
  'Río Viejo',
  'San Cristóbal',
  'San Estanislao',
  'San Fernando',
  'San Jacinto',
  'San Jacinto del Cauca',
  'San Juan Nepomuceno',
  'San Martín de Loba',
  'San Pablo',
  'Santa Catalina',
  'Santa Cruz de Mompox',
  'Santa Rosa',
  'Santa Rosa del Sur',
  'Simití',
  'Soplaviento',
  'Talaigua Nuevo',
  'Tiquisio',
  'Turbaco',
  'Turbaná',
  'Villanueva',
  'Zambrano',
  // Nombres cortos de las primeras versiones (datos ya guardados en Atlas)
  'Cartagena',
  'Mompox'
];

const CATEGORIAS = ['Educación', 'Trabajo', 'Emprendimiento'];

const TIPOS_POR_CATEGORIA = {
  'Educación': ['Cursos', 'Becas', 'Técnicos', 'Tecnologías', 'Talleres', 'Capacitaciones'],
  'Trabajo': ['Ofertas laborales', 'Prácticas', 'Primer empleo', 'Ferias de empleo'],
  'Emprendimiento': ['Capital semilla', 'Convocatorias', 'Programas para emprendedores', 'Capacitaciones']
};

const TODOS_LOS_TIPOS = Object.values(TIPOS_POR_CATEGORIA).flat();

module.exports = { MUNICIPIOS, CATEGORIAS, TIPOS_POR_CATEGORIA, TODOS_LOS_TIPOS };
