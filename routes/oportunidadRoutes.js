const express = require('express');
const router = express.Router();
const {
  listarOportunidades,
  listarTodasOportunidades,
  obtenerOportunidad,
  crearOportunidad,
  actualizarOportunidad,
  eliminarOportunidad
} = require('../controllers/oportunidadController');
const { protegerRuta, permitirRoles } = require('../middleware/auth');
const { reglasOportunidad, reglasActualizacionOportunidad } = require('../utils/validadores');

// Rutas públicas: cualquiera puede ver oportunidades sin necesidad de login
router.get('/', listarOportunidades);

// Listado completo para el administrador (incluye cerradas y pendientes).
// Va antes de '/:id' porque Express compara en el orden en que se declaran.
router.get('/todas', protegerRuta, permitirRoles('administrador'), listarTodasOportunidades);

router.get('/:id', obtenerOportunidad);

// Rutas protegidas: solo administradores pueden crear/editar/eliminar
router.post('/', protegerRuta, permitirRoles('administrador'), reglasOportunidad, crearOportunidad);
router.put('/:id', protegerRuta, permitirRoles('administrador'), reglasActualizacionOportunidad, actualizarOportunidad);
router.delete('/:id', protegerRuta, permitirRoles('administrador'), eliminarOportunidad);

module.exports = router;
