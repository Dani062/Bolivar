// Muestra la dirección del servidor y el comando exacto para compilar la app.
// Uso: npm run url
//
// La dirección cambia cuando cambias de red, así que este comando sirve
// para copiarla sin equivocarse.
const os = require('os');

const ipDelPc = () => {
  const interfaces = os.networkInterfaces();
  const candidatas = [];

  for (const [nombre, dirs] of Object.entries(interfaces)) {
    for (const dir of dirs || []) {
      if (dir.family !== 'IPv4' || dir.internal) continue;
      // Se descartan las direcciones de169.254.x.x (conexión local sin
      // internet) y las de VirtualBox/VirtualBox.
      if (dir.address.startsWith('169.254.')) continue;
      candidatas.push({ address: dir.address, nombre });
    }
  }

  // Se prefiere la de la interfaz Wi-Fi ("Wi-Fi" o "WLAN").
  const wifi = candidatas.find((c) => /wi-?fi|wlan/i.test(c.nombre));
  return (wifi || candidatas[0] || { address: '127.0.0.1' }).address;
};

const ip = ipDelPc();
const puerto = process.env.PORT || 4000;

console.log('\n=== Dirección del backend ===\n');
console.log(`IP de esta PC:            ${ip}`);
console.log(`Puerto:                   ${puerto}`);
console.log(`Emulador (10.0.2.2):      http://10.0.2.2:${puerto}/api`);
console.log(`Celular físico:           http://${ip}:${puerto}/api`);
console.log('\n=== Comandos para compilar la app ===\n');
console.log('# En el emulador de Android Studio:');
console.log(`flutter run --dart-define=API_URL=http://10.0.2.2:${puerto}/api\n`);
console.log('# En un celular de verdad (el celular debe estar en la MISMA red del PC):');
console.log(`flutter run --dart-define=API_URL=http://${ip}:${puerto}/api\n`);
console.log('=== Si el celular no conecta ===\n');
console.log('1. Revisa que el celular y el PC estén en la misma red Wi-Fi.');
console.log('2. Revisa que el backend esté encendido: npm start');
console.log('3. Si el Windows pide permiso de firewall, dale "Permitir".');
console.log('4. Comprueba desde el navegador del celular:');
console.log(`   http://${ip}:${puerto}/api/salud\n`);
