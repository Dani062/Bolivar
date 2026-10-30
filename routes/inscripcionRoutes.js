const express = require('express');
const router = express.Router();
const { crear, mias, todas, eliminar, anularPorOportunidad } = require('../controllers/inscripcionController');
const { protegerRuta, permitirRoles } = require('../middleware/auth');

// Todas las rutas necesitan sesión iniciada.
router.use(protegerRuta);

router.post('/', crear);
router.get('/mias', mias);

// Del administrador: todas las inscripciones.
router.get('/', permitirRoles('administrador'), todas);

// Va antes de '/:id' para que Express no lo confunda con un id.
router.delete('/oportunidad/:oportunidadId', anularPorOportunidad);

router.delete('/:id', eliminar);

module.exports = router;
