/**
 * Pruebas del CRUD de oportunidades (GET, POST, PUT y DELETE).
 *
 * Usan la base de datos del .env. La oportunidad de prueba se crea y se
 * borra al final, así que no deja basura.
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

const CORREO = process.env.ADMIN_EMAIL || 'admin@bolivar.com';
const CLAVE = process.env.ADMIN_PASSWORD || 'admin123';
const TITULO_PRUEBA = 'Oportunidad de prueba automatizada';

const nuevaOportunidad = {
  titulo: TITULO_PRUEBA,
  descripcion: 'Se crea y se borra dentro de las pruebas',
  clase: 'academica',
  categoria: 'Educación',
  tipo: 'Cursos',
  municipio: 'Cartagena de Indias',
  requisitos: 'Ninguno',
  cupos: 10
};

let tokenAdmin;
let tokenUsuario;
let idCreada;

beforeAll(async () => {
  await conectarDB();

  await Oportunidad.deleteMany({ titulo: TITULO_PRUEBA });

  // El administrador es el único rol que puede crear, editar y borrar.
  const loginAdmin = await request(app).post('/api/auth/login').send({
    email: CORREO,
    password: CLAVE
  });
  tokenAdmin = loginAdmin.body.token;

  // Un usuario normal, para comprobar los permisos.
  const correo = `prueba.crud.${Date.now()}@example.com`;
  const registro = await request(app).post('/api/auth/registro').send({
    nombre: 'Prueba',
    apellido: 'CRUD',
    email: correo,
    password: '123456',
    municipio: 'Cartagena de Indias'
  });
  tokenUsuario = registro.body.token;
});

afterAll(async () => {
  await Oportunidad.deleteMany({ titulo: TITULO_PRUEBA });
  await Usuario.deleteMany({ email: { $regex: /^prueba\.crud\./ } });
  await mongoose.connection.close();
});

describe('CRUD de oportunidades', () => {
  test('GET /api/oportunidades devuelve el listado público', async () => {
    const res = await request(app).get('/api/oportunidades');
    expect(res.statusCode).toBe(200);
    expect(res.body.oportunidades).toBeInstanceOf(Array);
    expect(res.body).toHaveProperty('total');
  });

  test('GET /api/oportunidades/todas pide token de administrador', async () => {
    const sinToken = await request(app).get('/api/oportunidades/todas');
    expect(sinToken.statusCode).toBe(401);

    const comoUsuario = await request(app)
      .get('/api/oportunidades/todas')
      .set('Authorization', `Bearer ${tokenUsuario}`);
    expect(comoUsuario.statusCode).toBe(403);

    const comoAdmin = await request(app)
      .get('/api/oportunidades/todas')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(comoAdmin.statusCode).toBe(200);
  });

  test('POST /api/oportunidades crea la oportunidad', async () => {
    const res = await request(app)
      .post('/api/oportunidades')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(nuevaOportunidad);

    expect(res.statusCode).toBe(201);
    expect(res.body.oportunidad.titulo).toBe(TITULO_PRUEBA);
    idCreada = res.body.oportunidad._id;
    expect(idCreada).toBeTruthy();
  });

  test('POST no deja que el cliente elija el _id', async () => {
    const res = await request(app)
      .post('/api/oportunidades')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...nuevaOportunidad, titulo: `${TITULO_PRUEBA} (id falso)`, _id: '111111111111111111111111' });

    expect(res.statusCode).toBe(201);
    expect(res.body.oportunidad._id).not.toBe('111111111111111111111111');

    await Oportunidad.deleteOne({ _id: res.body.oportunidad._id });
  });

  test('POST exige token de administrador', async () => {
    const res = await request(app).post('/api/oportunidades').send(nuevaOportunidad);
    expect(res.statusCode).toBe(401);
  });

  test('POST valida los datos de la oportunidad', async () => {
    const res = await request(app)
      .post('/api/oportunidades')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: '', descripcion: '', categoria: 'Inventada' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errores.length).toBeGreaterThan(0);
  });

  test('GET /api/oportunidades/:id devuelve la oportunidad creada', async () => {
    const res = await request(app).get(`/api/oportunidades/${idCreada}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.oportunidad.titulo).toBe(TITULO_PRUEBA);
  });

  test('GET /api/oportunidades/:id da 404 si no existe', async () => {
    const res = await request(app).get('/api/oportunidades/000000000000000000000000');
    expect(res.statusCode).toBe(404);
  });

  test('PUT /api/oportunidades/:id actualiza la oportunidad', async () => {
    const res = await request(app)
      .put(`/api/oportunidades/${idCreada}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...nuevaOportunidad, titulo: `${TITULO_PRUEBA} editada`, cupos: 42 });

    expect(res.statusCode).toBe(200);
    expect(res.body.oportunidad.titulo).toBe(`${TITULO_PRUEBA} editada`);
    expect(res.body.oportunidad.cupos).toBe(42);
  });

  test('PUT valida los datos y da 404 si no existe', async () => {
    const invalida = await request(app)
      .put(`/api/oportunidades/${idCreada}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...nuevaOportunidad, titulo: '' });
    expect(invalida.statusCode).toBe(400);

    const inexistente = await request(app)
      .put('/api/oportunidades/000000000000000000000000')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(nuevaOportunidad);
    expect(inexistente.statusCode).toBe(404);
  });

  test('DELETE /api/oportunidades/:id borra la oportunidad', async () => {
    const res = await request(app)
      .delete(`/api/oportunidades/${idCreada}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);

    const despues = await request(app).get(`/api/oportunidades/${idCreada}`);
    expect(despues.statusCode).toBe(404);
  });
});
