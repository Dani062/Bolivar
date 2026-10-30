// Validación del NIT colombiano con el dígito de verificación de la DIAN.
// Sirve para empresas (9 dígitos) y para personas con emprendimiento (NIT = cédula).
const PESOS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

// Deja solo los números: "900.123.456-8" -> "9001234568"
const soloDigitos = (nit) => String(nit ?? '').replace(/\D/g, '');

// Calcula el dígito de verificación de un NIT (sin el dígito).
const digitoVerificacion = (base) => {
  const suma = base
    .split('')
    .reverse()
    .reduce((total, d, i) => total + Number(d) * PESOS[i], 0);
  const resto = suma % 11;
  return resto > 1 ? 11 - resto : resto;
};

// true si el último dígito coincide con el dígito de verificación.
const nitValido = (nit) => {
  const d = soloDigitos(nit);
  const base = d.slice(0, -1);
  if (base.length < 6 || base.length > PESOS.length || /^0+$/.test(base)) return false;
  return digitoVerificacion(base) === Number(d.slice(-1));
};

// Formato estándar: "900123456-8"
const formatearNit = (nit) => {
  const d = soloDigitos(nit);
  return `${d.slice(0, -1)}-${d.slice(-1)}`;
};

module.exports = { nitValido, formatearNit, digitoVerificacion };
