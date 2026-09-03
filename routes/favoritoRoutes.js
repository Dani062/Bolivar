const express = require('express');
const router = express.Router();
const { listarFavoritos, agregarFavorito, quitarFavorito } = require('../controllers/favoritoController');
const { protegerRuta } = require('../middleware/auth');

// Todas las rutas de favoritos requieren estar logueado
router.use(protegerRuta);

router.get('/', listarFavoritos);
router.post('/:oportunidadId', agregarFavorito);
router.delete('/:oportunidadId', quitarFavorito);

module.exports = router;
