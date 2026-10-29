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

// Solo administrador. Va antes de '/:id' para que no se confunda con un id.
router.get('/todas', protegerRuta, permitirRoles('administrador'), listarTodasOportunidades);

router.get('/:id', obtenerOportunidad);

// Rutas protegidas: solo administradores pueden crear/editar/eliminar
router.post('/', protegerRuta, permitirRoles('administrador'), reglasOportunidad, crearOportunidad);
router.put('/:id', protegerRuta, permitirRoles('administrador'), reglasActualizacionOportunidad, actualizarOportunidad);
router.delete('/:id', protegerRuta, permitirRoles('administrador'), eliminarOportunidad);

module.exports = router;
