import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const JSON_PATH = path.join(process.cwd(), 'Arquivos', 'flamengo-rj-2026-09-13.json');
const SERVICE_ACCOUNT = path.join(process.cwd(), 'service-account.json');
const sa = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function run() {
  const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const partidas = data.partidas || [];
  
  let matchesToUpdate = [];

  for (const p of partidas) {
    let changed = false;
    if (p.competicao?.chave?.includes('brasileir')) {
      p.competicao.chave = 'brasileirao';
      changed = true;
    }
    if (p.competicao?.chave?.includes('libertadores')) {
      p.competicao.chave = 'libertadores';
      changed = true;
    }
    if (changed) {
      matchesToUpdate.push(p);
    }
  }
  
  // Recalculate campaigns
  const campanhas = {};
  for (const p of partidas) {
    const year = p.data.split('-')[0];
    if (year !== '2026') continue;
    const comp = p.competicao?.chave;
    if (!comp) continue;
    
    if (!campanhas[comp]) {
      campanhas[comp] = {
        id: comp + '-2026',
        competicao: p.competicao.nome.replace(' 2026', ''),
        temporada: '2026',
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
  
  data.resumoPorCompeticaoTemporada = resumoArr;
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');

  // Push campaigns
  const batchC = db.batch();
  for (const c of resumoArr) {
    batchC.set(db.collection('stats_campanhas').doc(c.id), c);
  }
  await batchC.commit();

  // Delete wrong campaigns
  try {
    await db.collection('stats_campanhas').doc('brasileirão-2026-2026').delete();
    await db.collection('stats_campanhas').doc('libertadores-2026-2026').delete();
  } catch (e) {}
  
  // Push updated matches
  if (matchesToUpdate.length > 0) {
    let b = db.batch();
    for (const m of matchesToUpdate) {
      b.set(db.collection('stats_partidas').doc(m.eventId), m);
    }
    await b.commit();
  }
  
  console.log('Dados corrigidos e sincronizados!');
}
run().catch(console.error);
