import fs from 'fs';
import path from 'path';

const JSON_PATH = path.join(process.cwd(), 'Arquivos', 'flamengo-rj-2026-09-13.json');
const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

const partidas = jsonData.partidas || [];
const campanhas = {};

for (const p of partidas) {
  // consider only 2026 matches for the current campaign or group by season
  const year = p.data.split('-')[0];
  if (year !== '2026') continue;
  
  const comp = p.competicao.chave;
  if (!campanhas[comp]) {
    campanhas[comp] = {
      id: comp + '-2026',
      competicao: p.competicao.nome,
      temporada: '2026',
      V: 0, E: 0, D: 0,
      golsPro: 0, golsContra: 0,
      jogos: 0,
      escanteiosPro: 0
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

// Also update agenda if there's a match in the future? The excel only has past matches probably.
// We can just save it.
fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
console.log('Campanhas 2026 atualizadas no JSON com base em todas as partidas (incluindo as do Excel).');
