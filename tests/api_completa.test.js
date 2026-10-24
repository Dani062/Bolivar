/**
 * Pruebas de usuarios, postulaciones, inscripciones y notificaciones.
 *
 * Usan la base de datos del .env. Todo lo que se crea se borra al final.
 *
 * Correr con: npm test
 */
require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const conectarDB = require('../config/db');
const Usuario = require('../models/Usuario');
const Oportunidad = require('../models/Oportunidad');
const Postulacion = require('../models/Postulacion');
const Inscripcion = require('../models/Inscripcion');
const Notificacion = require('../models/Notificacion');

const CORREO_ADMIN = process.env.ADMIN_EMAIL || 'admin@bolivar.com';
const CLAVE_ADMIN = process.env.ADMIN_PASSWORD || 'admin123';

const TITULO_PRUEBA = 'Oportunidad para pruebas de la API completa';

// Las oportunidades de prueba se crean con el sufijo " (laboral)" o
// " (académica)", así que se buscan por el inicio del título.
const REGEX_PRUEBA = new RegExp(`^${TITULO_PRUEBA}`);

let tokenAdmin;
let tokenUsuario;
let correoUsuario;
let idOportunidadLaboral;
let idOportunidadAcademica;

const opportunitiesDePrueba = async () => {
  await Oportunidad.deleteMany({ titulo: { $regex: REGEX_PRUEBA } });

  const laboral = await Oportunidad.create({
    titulo: `${TITULO_PRUEBA} (laboral)`,
    descripcion: 'Oferta laboral de prueba',
    clase: 'laboral',
    categoria: 'Trabajo',
    tipo: 'Ofertas laborales',
    municipio: 'Cartagena de Indias',
    empresa: 'Empresa de prueba',
    cargo: 'Cargo de prueba',
    estado: 'activa',
    creadoPor: (await Usuario.findOne({ email: CORREO_ADMIN }))._id
  });

  const academica = await Oportunidad.create({
    titulo: `${TITULO_PRUEBA} (académica)`,
    descripcion: 'Curso de prueba',
    clase: 'academica',
    categoria: 'Educación',
    tipo: 'Cursos',
    municipio: 'Cartagena de Indias',
    cupos: 10,
    estado: 'activa',
    creadoPor: (await Usuario.findOne({ email: CORREO_ADMIN }))._id
  });

  idOportunidadLaboral = laboral._id.toString();
  idOportunidadAcademica = academica._id.toString();
};

beforeAll(async () => {
  await conectarDB();

  await opportunitiesDePrueba();

  const loginAdmin = await request(app).post('/api/auth/login').send({
    email: CORREO_ADMIN,
    password: CLAVE_ADMIN
  });
  tokenAdmin = loginAdmin.body.token;

  correoUsuario = `prueba.api.${Date.now()}@example.com`;
  const registro = await request(app).post('/api/auth/registro').send({
    nombre: 'Ana',
    apellido: 'Pérez',
    email: correoUsuario,
    password: '123456',
    municipio: 'Cartagena de Indias',
    tipoPerfil: 'Estudiante'
  });
  tokenUsuario = registro.body.token;
});

afterAll(async () => {
  // Solo se borra lo que crearon estas pruebas, no los datos reales.
  const usuariosPrueba = await Usuario.find({
    email: { $regex: /^prueba\.(api|formulario)\./ }
  }).select('_id');
  const idsUsuario = usuariosPrueba.map((u) => u._id);

  const oportunidadesPrueba = await Oportunidad.find({ titulo: { $regex: REGEX_PRUEBA } }).select('_id');
  const idsOportunidad = oportunidadesPrueba.map((o) => o._id);

  await Postulacion.deleteMany({ usuario: { $in: idsUsuario } });
  await Postulacion.deleteMany({ oportunidad: { $in: idsOportunidad } });
  await Inscripcion.deleteMany({ usuario: { $in: idsUsuario } });
  await Inscripcion.deleteMany({ oportunidad: { $in: idsOportunidad } });
  await Notificacion.deleteMany({ usuario: { $in: idsUsuario } });

  await Oportunidad.deleteMany({ titulo: { $regex: REGEX_PRUEBA } });
  await Usuario.deleteMany({ email: { $regex: /^prueba\.(api|formulario)\./ } });

  await mongoose.connection.close();
});

describe('Usuarios', () => {
  test('el registro guarda los datos del formulario y devuelve token', async () => {
    const correo = `prueba.formulario.${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/registro').send({
      nombre: 'Luis',
      apellido: 'Gómez',
      email: correo,
      password: '123456',
      municipio: 'Cartagena de Indias',
      identificacion: '10999999',
      telefono: '3001234567',
      tipoPerfil: 'Profesional'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.usuario.email).toBe(correo);
    expect(res.body.usuario.tipoPerfil).toBe('Profesional');
    expect(res.body.usuario.identificacion).toBe('10999999');
    expect(res.body.usuario.telefono).toBe('3001234567');
    expect(res.body.usuario.esAdministrador).toBe(false);
  });

  test('el login devuelve el usuario con su rol', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: CORREO_ADMIN,
      password: CLAVE_ADMIN
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.rol).toBe('administrador');
    expect(res.body.usuario.esAdministrador).toBe(true);
  });

  test('el perfil se lee y se actualiza', async () => {
    const perfil = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(perfil.statusCode).toBe(200);
    expect(perfil.body.usuario.email).toBe(correoUsuario);

    const actualizado = await request(app)
      .put('/api/auth/perfil')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ tipoPerfil: 'Emprendedor', telefono: '3009999999' });

    expect(actualizado.statusCode).toBe(200);
    expect(actualizado.body.usuario.tipoPerfil).toBe('Emprendedor');
  });

  test('el listado de usuarios es solo del administrador', async () => {
    const sinToken = await request(app).get('/api/auth/usuarios');
    expect(sinToken.statusCode).toBe(401);

    const comoUsuario = await request(app)
      .get('/api/auth/usuarios')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(comoUsuario.statusCode).toBe(403);

    const comoAdmin = await request(app)
      .get('/api/auth/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(comoAdmin.statusCode).toBe(200);
    expect(comoAdmin.body.usuarios.some((u) => u.email === correoUsuario)).toBe(true);
  });
});

describe('Postulaciones', () => {
  test('el usuario se postula a una oferta laboral', async () => {
    const res = await request(app)
      .post('/api/postulaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ oportunidadId: idOportunidadLaboral });

    expect(res.statusCode).toBe(201);
    expect(res.body.postulacion.oportunidad.empresa).toBe('Empresa de prueba');
  });

  test('no se puede postularse dos veces a la misma oferta', async () => {
    const res = await request(app)
      .post('/api/postulaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ oportunidadId: idOportunidadLaboral });

    expect(res.statusCode).toBe(400);
  });

  test('el usuario ve sus postulaciones y el admin las ve todas', async () => {
    const mias = await request(app)
      .get('/api/postulaciones/mias')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(mias.statusCode).toBe(200);
    expect(mias.body.postulaciones.length).toBeGreaterThan(0);

    const todas = await request(app)
      .get('/api/postulaciones')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(todas.statusCode).toBe(200);
    expect(todas.body.postulaciones[0].usuario.email).toBe(correoUsuario);
  });

  test('el administrador cambia el estado y el estudiante se entera', async () => {
    const mias = await request(app)
      .get('/api/postulaciones/mias')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    const idPostulacion = mias.body.postulaciones[0]._id;

    const cambio = await request(app)
      .put(`/api/postulaciones/${idPostulacion}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'Aceptada' });
    expect(cambio.statusCode).toBe(200);
    expect(cambio.body.postulacion.estado).toBe('Aceptada');

    const notificaciones = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(notificaciones.body.notificaciones.some((n) => n.titulo.includes('Aceptada'))).toBe(true);
  });

  test('un estado inválido se rechaza', async () => {
    const mias = await request(app)
      .get('/api/postulaciones/mias')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    const idPostulacion = mias.body.postulaciones[0]._id;

    const res = await request(app)
      .put(`/api/postulaciones/${idPostulacion}/estado`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ estado: 'Inventado' });
    expect(res.statusCode).toBe(400);
  });

  test('las postulaciones exigen token', async () => {
    const res = await request(app).get('/api/postulaciones/mias');
    expect(res.statusCode).toBe(401);
  });
});

describe('Inscripciones', () => {
  test('el usuario se inscribe en un curso y la puede anular', async () => {
    const crear = await request(app)
      .post('/api/inscripciones')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ oportunidadId: idOportunidadAcademica });
    expect(crear.statusCode).toBe(201);

    const mias = await request(app)
      .get('/api/inscripciones/mias')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(mias.body.inscripciones.length).toBeGreaterThan(0);
    expect(mias.body.inscripciones[0].oportunidad.titulo).toContain('académica');

    const anular = await request(app)
      .delete(`/api/inscripciones/oportunidad/${idOportunidadAcademica}`)
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(anular.statusCode).toBe(200);

    const despues = await request(app)
      .get('/api/inscripciones/mias')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(despues.body.inscripciones.length).toBe(0);
  });
});

describe('Notificaciones', () => {
  test('el usuario recibe la notificación de bienvenida', async () => {
    const res = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.notificaciones.some((n) => n.titulo.includes('Bienvenido'))).toBe(true);
  });

  test('se pueden marcar todas como leídas', async () => {
    const res = await request(app)
      .put('/api/notificaciones/leer-todas')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(res.statusCode).toBe(200);

    const listado = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(listado.body.notificaciones.every((n) => n.leida)).toBe(true);
  });

  test('el administrador manda una alerta a todos', async () => {
    const res = await request(app)
      .post('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Alerta de prueba', mensaje: 'Mensaje de prueba', icono: 'beca' });

    expect(res.statusCode).toBe(201);
    expect(res.body.enviadas).toBeGreaterThan(0);
  });

  test('un usuario normal no puede mandar alertas', async () => {
    const res = await request(app)
      .post('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`)
      .send({ titulo: 'No debería', mensaje: 'No debería' });

    expect(res.statusCode).toBe(403);
  });

  test('la alerta llega a los usuarios', async () => {
    const res = await request(app)
      .get('/api/notificaciones')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(res.body.notificaciones.some((n) => n.titulo === 'Alerta de prueba')).toBe(true);
  });
});
