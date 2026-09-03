const express = require('express');
const router = express.Router();
const { registrar, iniciarSesion, obtenerPerfil, actualizarPerfil } = require('../controllers/authController');
const { protegerRuta } = require('../middleware/auth');
const { reglasRegistro, reglasLogin } = require('../utils/validadores');

router.post('/registro', reglasRegistro, registrar);
router.post('/login', reglasLogin, iniciarSesion);
router.get('/perfil', protegerRuta, obtenerPerfil);
router.put('/perfil', protegerRuta, actualizarPerfil);

module.exports = router;
