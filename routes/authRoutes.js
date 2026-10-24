const express = require('express');
const router = express.Router();
const {
  registrar,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil,
  listarUsuarios
} = require('../controllers/authController');
const { protegerRuta, permitirRoles } = require('../middleware/auth');
const { reglasRegistro, reglasLogin } = require('../utils/validadores');

router.post('/registro', reglasRegistro, registrar);
router.post('/login', reglasLogin, iniciarSesion);
router.get('/perfil', protegerRuta, obtenerPerfil);
router.put('/perfil', protegerRuta, actualizarPerfil);

// Listado de usuarios: solo el administrador.
router.get('/usuarios', protegerRuta, permitirRoles('administrador'), listarUsuarios);

module.exports = router;
