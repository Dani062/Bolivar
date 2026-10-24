// Demostración de que la app depende por completo de la API.
// Uso: npm run demo-apagada
//
// Qué hace:
//   1. Cuenta las oportunidades que hay en MongoDB.
//   2. Apaga el servidor de la API.
//   3. Intenta crear una oportunidad (como hace la app) -> falla.
//   4. Cuenta otra vez: sigue igual, o sea que NO se guardó nada.
//   5. Vuelve a encender el servidor y comprueba que ya funciona.
//
// Al final el servidor queda encendido, como estaba.
require('dotenv').config();
const { spawn, execSync } = require('child_process');
const mongoose = require('mongoose');
const conectarDB = require('../config/db');
const Oportunidad = require('../models/Oportunidad');
const Usuario = require('../models/Usuario');

const BASE = `http://localhost:${process.env.PORT || 4000}/api`;
const TITULO = 'Demo: no se guarda si la API está apagada';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// Pide el id de un proceso de node cuya comando incluya 'server.js'.
const idsDelServidor = () => {
  const salida = execSync(
    `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='node.exe'\\" | Where-Object { $_.CommandLine -like '*server.js*' } | ForEach-Object { $_.ProcessId }"`,
    { encoding: 'utf8' }
  );
  return salida
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^\d+$/.test(l))
    .map(Number);
};

const apagarServidor = () => {
  const ids = idsDelServidor().filter((id) => id !== process.pid);
  if (ids.length === 0) return false;
  for (const id of ids) {
    try {
      process.kill(id);
    } catch (_) {
      // si ya no existe, sigue
    }
  }
  return true;
};

const encenderServidor = () => {
  const hijo = spawn('node', ['server.js'], {
    detached: true,
    stdio: 'ignore',
    cwd: __dirname + '/..'
  });
  hijo.unref();
  return hijo.pid;
};

const pedir = async (metodo, ruta, cuerpo, token) => {
  const cabeceras = { 'Content-Type': 'application/json; charset=utf-8' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;
  try {
    const r = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    let json = null;
    try {
      json = await r.json();
    } catch (_) {
      json = null;
    }
    return { status: r.status, ok: r.ok, ...(json || {}) };
  } catch (e) {
    return { status: 0, ok: false, error: e.cause?.code || e.message };
  }
};

const empezar = async () => {
  console.log('=== DEMO: la app depende de la API ===\n');

  await conectarDB();
  const admin = await Usuario.findOne({ email: process.env.ADMIN_EMAIL || 'admin@bolivar.com' });

  const antes = await Oportunidad.countDocuments();
  console.log(`1) Oportunidades en MongoDB: ${antes}`);

  // El token del administrador.
  const login = await pedir('POST', '/auth/login', {
    email: process.env.ADMIN_EMAIL || 'admin@bolivar.com',
    password: process.env.ADMIN_PASSWORD || 'admin123'
  });
  const token = login.token;

  // --- Se apaga la API ---
  const apagado = apagarServidor();
  console.log(`\n2) API apagada: ${apagado ? 'sí' : 'no había ningún servidor corriendo'}`);
  await espera(2500);

  const salud = await pedir('GET', '/salud');
  console.log(`   GET /salud -> ${salud.status === 0 ? 'sin conexión (' + salud.error + ')' : salud.status}`);

  // --- La app intenta guardar ---
  const intento = await pedir('POST', '/oportunidades', {
    titulo: TITULO,
    descripcion: 'Esta oportunidad no debe existir',
    clase: 'academica',
    categoria: 'Educación',
    tipo: 'Cursos',
    municipio: 'Cartagena de Indias'
  }, token);
  console.log(`   POST /oportunidades (como la app) -> ${intento.status === 0 ? 'FALLÓ: sin conexión' : intento.status}`);

  const despues = await Oportunidad.countDocuments();
  console.log(`\n3) Oportunidades en MongoDB: ${despues}`);
  console.log(`   ${despues === antes ? '✔ NO se guardó nada (correcto)' : '✘ se guardó algo (mal)'}`);

  // --- Se vuelve a encender ---
  console.log('\n4) Encendiendo la API de nuevo...');
  const pid = encenderServidor();
  await espera(20000);

  const salud2 = await pedir('GET', '/salud');
  console.log(`   GET /salud -> ${salud2.status === 200 ? '200 OK, la API volvió' : salud2.status}`);

  const final = await Oportunidad.countDocuments();
  console.log(`\n5) Oportunidades en MongoDB: ${final} (siguen siendo las mismas)`);
  console.log('\nListo. El servidor quedó encendido (PID ' + pid + ').');

  await mongoose.connection.close();
  process.exit(0);
};

empezar().catch(async (error) => {
  console.error('Error en la demostración:', error.message);
  // Por si quedó apagado, se vuelve a encender.
  try {
    encenderServidor();
  } catch (_) {
    // nada
  }
  process.exit(1);
});
