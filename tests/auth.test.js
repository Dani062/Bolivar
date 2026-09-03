/**
 * Prueba de ejemplo para el flujo de registro/login.
 * Requiere una base de datos de pruebas corriendo (usa MONGO_URI en .env
 * apuntando a una base distinta a la de producción, ej: bolivar_test).
 *
 * Correr con: npm test
 */
require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const Usuario = require('../models/Usuario');

const usuarioPrueba = {
  nombre: 'Ana',
  apellido: 'Pérez',
  email: 'ana.prueba@example.com',
  password: '123456',
  municipio: 'Cartagena'
};

beforeAll(async () => {
  await Usuario.deleteMany({ email: usuarioPrueba.email });
});

afterAll(async () => {
  await Usuario.deleteMany({ email: usuarioPrueba.email });
  await mongoose.connection.close();
});

describe('Autenticación', () => {
  test('debe registrar un usuario nuevo', async () => {
    const res = await request(app).post('/api/auth/registro').send(usuarioPrueba);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('no debe permitir registrar el mismo correo dos veces', async () => {
    const res = await request(app).post('/api/auth/registro').send(usuarioPrueba);
    expect(res.statusCode).toBe(400);
  });

  test('debe iniciar sesión con credenciales correctas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: usuarioPrueba.email,
      password: usuarioPrueba.password
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('no debe iniciar sesión con contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: usuarioPrueba.email,
      password: 'contraseñaMala'
    });
    expect(res.statusCode).toBe(401);
  });
});
