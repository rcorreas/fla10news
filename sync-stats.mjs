import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const EXCEL_PATH = path.join(process.cwd(), 'stats', 'Fla10_Banco_Flamengo_Flashscore_2026_ESCALACOES_v2.xlsx');
const JSON_PATH = path.join(process.cwd(), 'Arquivos', 'flamengo-rj-2026-09-13.json');
const SERVICE_ACCOUNT = path.join(process.cwd(), 'service-account.json');

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

const sanitizeData = (data) => {
  if (Array.isArray(data)) {
    if (data.some(item => Array.isArray(item))) {
      const obj = {};
      data.forEach((val, i) => { obj[i] = sanitizeData(val); });
      return obj;
    }
    return data.map(sanitizeData);
  } else if (data !== null && typeof data === 'object') {
    const obj = {};
    for (const key in data) {
      if (data[key] !== undefined) obj[key] = sanitizeData(data[key]);
    }
    return obj;
  }
  return data;
};

async function run() {
  console.log('1. Lendo arquivo Excel...');
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Arquivo não encontrado: ${EXCEL_PATH}`);
    return;
  }
  
  const workbook = xlsx.readFile(EXCEL_PATH);
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  
  console.log(`2. Lendo arquivo JSON base...`);
  const rawData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const jsonData = sanitizeData(rawData);
  const partidasExistentes = jsonData.partidas || [];
  
  let partidasDoExcel = [];
  let novasPartidas = 0;

  for (const row of data) {
    if (!row.Data || !row['Adversário']) continue;
    let dataFormatada = row.Data;
    if (typeof row.Data === 'number') {
      dataFormatada = new Date(new Date(Date.UTC(1899, 11, 30)).getTime() + row.Data * 86400000).toISOString().split('T')[0];
    } else {
      dataFormatada = String(row.Data).split('T')[0];
    }
    
    // Normalizar a chave da competicao (Brasileirão -> brasileirao)
    let compKey = String(row['Competição'] || '').toLowerCase().replace(/ /g, '-');
    if (compKey.includes('brasileir')) compKey = 'brasileirao';
    if (compKey.includes('libertadores')) compKey = 'libertadores';

    const eventIdCustom = `excel_${dataFormatada.replace(/-/g, '')}_${row['Adversário'].replace(/[^a-zA-Z0-9]/g, '')}`;
    
    let match = partidasExistentes.find(p => p.eventId === eventIdCustom);

    if (!match) {
      match = {
        eventId: eventIdCustom,
        competicao: {
          chave: compKey,
          nome: String(row['Competição'] || '').replace(' 2026', ''),
          rodadaOuFase: String(row['Fase/Rodada'] || '')
        },
        data: dataFormatada,
        mando: String(row['Mando'] || '').toLowerCase(),
        flamengo: { nomeExibido: "Flamengo RJ", sigla: "FLA" },
        adversario: { nome: row['Adversário'] },
        derivado: {
          resultado: row['Resultado'] === 'Vitória' ? 'V' : (row['Resultado'] === 'Derrota' ? 'D' : 'E'),
          gols: { flamengo: Number(row['Gols Flamengo'] || 0), adversario: Number(row['Gols Adversário'] || 0) }
        }
      };
      partidasExistentes.push(match);
      novasPartidas++;
    }
    partidasDoExcel.push(match);
  }

  console.log(`3. Recalculando campanhas...`);
  const campanhas = {};
  for (const p of partidasExistentes) {
    const year = p.data.split('-')[0];
    if (year !== '2026') continue;
    
    // Normalizar também as já existentes caso estivessem erradas
    if (p.competicao?.chave?.includes('brasileir')) p.competicao.chave = 'brasileirao';
    if (p.competicao?.chave?.includes('libertadores')) p.competicao.chave = 'libertadores';
    
    const comp = p.competicao?.chave;
    if (!comp) continue;
    if (!campanhas[comp]) {
      campanhas[comp] = {
        id: comp + '-2026', competicao: p.competicao.nome, temporada: '2026',
        V: 0, E: 0, D: 0, golsPro: 0, golsContra: 0, jogos: 0, escanteiosPro: 0
      };
    }
    const c = campanhas[comp];
    c.jogos += 1;
    const res = p.derivado?.resultado;
    if (res === 'V') c.V += 1;
    else if (res === 'E') c.E += 1;
    else if (res === 'D') c.D += 1;
    c.golsPro += p.derivado?.gols?.flamengo || 0;
    c.golsContra += p.derivado?.gols?.adversario || 0;
    c.escanteiosPro += p.derivado?.escanteios90?.flamengo || 0;
  }
  const resumoArr = Object.values(campanhas).map(c => {
    c.escanteiosPro90 = c.jogos > 0 ? (c.escanteiosPro / c.jogos).toFixed(1) : "0";
    return c;
  });
  jsonData.resumoPorCompeticaoTemporada = resumoArr;
  jsonData.partidas = partidasExistentes;
  fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2), 'utf8');

  console.log(`4. Subindo atualizações para o Firebase...`);
  if (jsonData.agenda) await db.collection('stats_agenda').doc('current').set(jsonData.agenda);
  const batchCampanhas = db.batch();
  for (const campanha of resumoArr) {
    batchCampanhas.set(db.collection('stats_campanhas').doc(campanha.id), campanha);
  }
  await batchCampanhas.commit();
  
  let batch = db.batch();
  for (const partida of partidasDoExcel) {
    batch.set(db.collection('stats_partidas').doc(partida.eventId), partida);
  }
  if (partidasDoExcel.length > 0) {
    await batch.commit();
  }
  console.log(`\n✅ Sucesso! Processo concluído!`);
}
run().catch(console.error);

  console.log(`5. Limpando o cache do site (Next.js)...`);
  try {
    const res = await fetch('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'fla10-super-secret-sync' })
    });
    if (res.ok) {
      console.log('Cache do site limpo com sucesso! A página já mostrará os dados novos.');
    } else {
      console.log('Aviso: O servidor local do site não parece estar rodando no momento para limpar o cache automaticamente.');
    }
  } catch (err) {
    console.log('Aviso: O servidor local do site não está rodando (localhost:3000). O cache será atualizado quando o site for reiniciado.');
  }
