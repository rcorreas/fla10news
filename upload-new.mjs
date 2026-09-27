import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import xlsx from 'xlsx';

const EXCEL_PATH = path.join(process.cwd(), 'stats', 'Fla10_Banco_Flamengo_Flashscore_2026_ESCALACOES_v2.xlsx');
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
  console.log('Lendo JSON base atualizado...');
  const jsonData = sanitizeData(JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')));
  
  // 1. Upload Agenda
  console.log('Subindo Agenda...');
  if (jsonData.agenda) {
    await db.collection('stats_agenda').doc('current').set(jsonData.agenda);
  }

  // 2. Upload Campanhas
  console.log('Subindo Campanhas...');
  let batchCamp = db.batch();
  for (const campanha of jsonData.resumoPorCompeticaoTemporada || []) {
    const id = campanha.id || campanha.competicao.replace(/[^a-zA-Z0-9]/g, "_");
    batchCamp.set(db.collection('stats_campanhas').doc(id), campanha);
  }
  await batchCamp.commit();

  // 3. Upload Apenas as novas partidas do Excel para evitar timeout
  console.log('Verificando partidas do Excel para upload...');
  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  const partidasDoExcel = [];
  const partidasExistentes = jsonData.partidas || [];
  
  for (const row of data) {
    if (!row.Data || !row['Adversário']) continue;
    let dataFormatada = row.Data;
    if (typeof row.Data === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const dateObj = new Date(excelEpoch.getTime() + row.Data * 86400000);
      dataFormatada = dateObj.toISOString().split('T')[0];
    } else {
      dataFormatada = String(row.Data).split('T')[0];
    }
    const eventIdCustom = `excel_${dataFormatada.replace(/-/g, '')}_${row['Adversário'].replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Find matching partida in JSON
    const match = partidasExistentes.find(p => p.eventId === eventIdCustom);
    if (match) partidasDoExcel.push(match);
  }

  console.log(`Subindo ${partidasDoExcel.length} partidas novas...`);
  let batch = db.batch();
  for (const partida of partidasDoExcel) {
    batch.set(db.collection('stats_partidas').doc(partida.eventId), partida);
  }
  if (partidasDoExcel.length > 0) {
    await batch.commit();
  }

  console.log('✅ Tudo atualizado com sucesso no Firebase!');
}

run().catch(console.error);
