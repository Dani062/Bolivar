// Listas fijas del dominio de la app.
// Si Keila define que estas listas deben ser editables desde un panel admin,
// se pueden mover a colecciones de MongoDB más adelante.

const MUNICIPIOS = [
  'Todo Bolívar',
  'Cartagena',
  'El Carmen de Bolívar',
  'San Juan Nepomuceno',
  'Magangué',
  'Arjona',
  'Turbaco',
  'Mompox',
  'San Jacinto',
  'Santa Rosa',
  'María La Baja'
];

const CATEGORIAS = ['Educación', 'Trabajo', 'Emprendimiento'];

const TIPOS_POR_CATEGORIA = {
  'Educación': ['Cursos', 'Becas', 'Técnicos', 'Tecnologías', 'Talleres', 'Capacitaciones'],
  'Trabajo': ['Ofertas laborales', 'Prácticas', 'Primer empleo', 'Ferias de empleo'],
  'Emprendimiento': ['Capital semilla', 'Convocatorias', 'Programas para emprendedores', 'Capacitaciones']
};

const TODOS_LOS_TIPOS = Object.values(TIPOS_POR_CATEGORIA).flat();

module.exports = { MUNICIPIOS, CATEGORIAS, TIPOS_POR_CATEGORIA, TODOS_LOS_TIPOS };
