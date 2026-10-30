// Pruebas de la validación del NIT (no necesitan base de datos).
const { nitValido, formatearNit } = require('../utils/nit');

describe('Validación del NIT', () => {
  test('acepta NIT reales con su dígito de verificación', () => {
    expect(nitValido('800197268-4')).toBe(true); // DIAN
    expect(nitValido('890.903.938-8')).toBe(true); // Bancolombia
    expect(nitValido('899999068-1')).toBe(true); // Ecopetrol
  });

  test('rechaza un dígito de verificación equivocado', () => {
    expect(nitValido('800197268-5')).toBe(false);
  });

  test('rechaza textos vacíos o demasiado cortos', () => {
    expect(nitValido('')).toBe(false);
    expect(nitValido('123')).toBe(false);
    expect(nitValido('000000000-0')).toBe(false);
  });

  test('guarda el NIT con formato estándar', () => {
    expect(formatearNit('890.903.938 8')).toBe('890903938-8');
  });
});
