import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const JSON_PATH = path.join(process.cwd(), 'Arquivos', 'flamengo-rj-2026-09-13.json');
const SERVICE_ACCOUNT = path.join(process.cwd(), 'service-account.json');

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

const sanitizeData = (data) => {
  if (Array.isArray(data)) {
    const hasNestedArray = data.some(item => Array.isArray(item));
    if (hasNestedArray) {
      const obj = {};
      data.forEach((val, i) => {
        obj[i] = sanitizeData(val);
      });
      return obj;
    }
    return data.map(sanitizeData);
  } else if (data !== null && typeof data === 'object') {
    const obj = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        obj[key] = sanitizeData(data[key]);
      }
    }
    return obj;
  }
  return data;
};

async function run() {
  console.log(`Lendo arquivo JSON base...`);
  const rawData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const jsonData = sanitizeData(rawData);

  console.log(`Subindo atualizações para o Firebase com dados sanitizados...`);
  
  let totalPartidas = 0;
  let batches = [];
  let currentBatch = db.batch();
  let count = 0;

  for (const partida of jsonData.partidas) {
    const id = partida.eventId || `${partida.data}-${partida.adversario?.nome || 'adv'}`.replace(/[^a-zA-Z0-9]/g, "_");
    currentBatch.set(db.collection('stats_partidas').doc(id), partida);
    count++;
    totalPartidas++;
    if (count === 450) {
      batches.push(currentBatch.commit());
      currentBatch = db.batch();
      count = 0;
    }
  }
  if (count > 0) batches.push(currentBatch.commit());
  
  await Promise.all(batches);
  console.log(`-> ${totalPartidas} Partidas atualizadas no banco de dados com sucesso!`);
}

run().catch(console.error);
