// Muestra el contenido de la base de datos MongoDB sin necesidad de Atlas.
// Uso: npm run ver   (o: node scripts/verContenido.js)
require('dotenv').config();
const mongoose = require('mongoose');

const empezar = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const colecciones = await db.listCollections().toArray();
  console.log('Base de datos:', db.databaseName);
  console.log('Colecciones:', colecciones.map((c) => c.name).join(', ') || '(ninguna)');

  for (const c of colecciones) {
    const docs = await db.collection(c.name).find().toArray();
    console.log(`\n===== ${c.name}  (${docs.length} registro(s)) =====`);
    for (const d of docs) {
      const copia = { ...d };
      delete copia.password; // la contraseña no se muestra
      console.log(JSON.stringify(copia));
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

empezar().catch((error) => {
  console.error('Error al leer la base de datos:', error.message);
  process.exit(1);
});
