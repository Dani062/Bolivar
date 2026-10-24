const express = require('express');
const router = express.Router();
const {
  listar,
  recientes,
  marcarLeida,
  marcarTodasLeidas,
  crear,
  eliminar
} = require('../controllers/notificacionController');
const { protegerRuta, permitirRoles } = require('../middleware/auth');

// Todas las rutas necesitan sesión iniciada.
router.use(protegerRuta);

// '/recientes' va antes de '/:id/leida' para que no se confunda con un id.
router.get('/recientes', permitirRoles('administrador'), recientes);
router.put('/leer-todas', marcarTodasLeidas);

router.get('/', listar);
router.put('/:id/leida', marcarLeida);
router.delete('/:id', eliminar);

// Solo el administrador manda alertas.
router.post('/', permitirRoles('administrador'), crear);

module.exports = router;
