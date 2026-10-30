// Pruebas de la validación de fotos (no necesitan base de datos).
const { leerImagen, TAMANO_MAXIMO } = require('../utils/imagen');

// Encabezados mínimos de cada formato.
const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);

describe('Validación de fotos', () => {
  test('reconoce JPG, PNG y WEBP por sus primeros bytes', () => {
    expect(leerImagen(JPG.toString('base64')).tipo).toBe('image/jpeg');
    expect(leerImagen(PNG.toString('base64')).tipo).toBe('image/png');
    expect(leerImagen(WEBP.toString('base64')).tipo).toBe('image/webp');
  });

  test('acepta el prefijo data: que agregan algunos clientes', () => {
    expect(leerImagen(`data:image/jpeg;base64,${JPG.toString('base64')}`).tipo).toBe('image/jpeg');
  });

  test('rechaza lo que no es una imagen', () => {
    expect(leerImagen(Buffer.from('hola mundo').toString('base64')).error).toMatch(/JPG, PNG o WEBP/);
    expect(leerImagen('').error).toBeDefined();
    expect(leerImagen(undefined).error).toBeDefined();
  });

  test('rechaza imágenes de más de 2 MB', () => {
    const grande = Buffer.concat([JPG, Buffer.alloc(TAMANO_MAXIMO)]);
    expect(leerImagen(grande.toString('base64')).error).toMatch(/2 MB/);
  });
});
