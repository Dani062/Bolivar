const express = require('express');
const router = express.Router();
const {
  crear,
  mias,
  todas,
  cambiarEstado,
  eliminar
} = require('../controllers/postulacionController');
const { protegerRuta, permitirRoles } = require('../middleware/auth');

// Todas las rutas necesitan sesión iniciada.
router.use(protegerRuta);

// Del usuario con la sesión iniciada.
router.post('/', crear);
router.get('/mias', mias);
router.delete('/:id', eliminar);

// Del administrador.
router.get('/', permitirRoles('administrador'), todas);
router.put('/:id/estado', permitirRoles('administrador'), cambiarEstado);

module.exports = router;
