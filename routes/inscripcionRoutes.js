const express = require('express');
const router = express.Router();
const { crear, mias, eliminar, anularPorOportunidad } = require('../controllers/inscripcionController');
const { protegerRuta } = require('../middleware/auth');

// Todas las rutas necesitan sesión iniciada.
router.use(protegerRuta);

router.post('/', crear);
router.get('/mias', mias);

// Anular por oportunidad: va antes de '/:id' para que Express no lo confunda
// con un identificador de inscripción.
router.delete('/oportunidad/:oportunidadId', anularPorOportunidad);

router.delete('/:id', eliminar);

module.exports = router;
