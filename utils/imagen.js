// Validación de las fotos de las ofertas (se guardan en MongoDB).
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB

const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Reconoce el formato por los primeros bytes del archivo, no por lo que diga el cliente.
const tipoDeImagen = (datos) => {
  if (datos.length > 3 && datos[0] === 0xff && datos[1] === 0xd8 && datos[2] === 0xff) return 'image/jpeg';
  if (datos.length > 8 && datos.subarray(0, 8).equals(FIRMA_PNG)) return 'image/png';
  if (datos.length > 12 && datos.toString('ascii', 0, 4) === 'RIFF' && datos.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
};

// Convierte el texto base64 que manda la app en una imagen válida, o explica el error.
const leerImagen = (base64) => {
  if (typeof base64 !== 'string' || base64.trim() === '') return { error: 'Falta la imagen.' };
  const datos = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (datos.length === 0) return { error: 'La imagen está vacía.' };
  if (datos.length > TAMANO_MAXIMO) return { error: 'La imagen pesa más de 2 MB.' };
  const tipo = tipoDeImagen(datos);
  if (!tipo) return { error: 'Solo se aceptan imágenes JPG, PNG o WEBP.' };
  return { datos, tipo };
};

module.exports = { leerImagen, tipoDeImagen, TAMANO_MAXIMO };
