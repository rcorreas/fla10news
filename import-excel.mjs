import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// Caminhos dos arquivos
const EXCEL_PATH = path.join(process.cwd(), 'stats', 'Fla10_Banco_Flamengo_Flashscore_2026_ESCALACOES_v2.xlsx');
const JSON_PATH = path.join(process.cwd(), 'Arquivos', 'flamengo-rj-2026-09-13.json');

async function run() {
  console.log('Lendo arquivo Excel...');
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Arquivo não encontrado: ${EXCEL_PATH}`);
    return;
  }
  
  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
  console.log(`Lendo arquivo JSON base...`);
  const jsonData = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const partidasExistentes = jsonData.partidas || [];
  
  console.log(`Processando ${data.length} registros do Excel...`);
  let novasPartidasAdicionadas = 0;
  
  for (const row of data) {
    if (!row.Data || !row['Adversário']) continue;
    
    // Formatar a data se for número do Excel (serial)
    let dataFormatada = row.Data;
    if (typeof row.Data === 'number') {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const dateObj = new Date(excelEpoch.getTime() + row.Data * 86400000);
      dataFormatada = dateObj.toISOString().split('T')[0];
    } else {
      dataFormatada = String(row.Data).split('T')[0];
    }

    const eventIdCustom = `excel_${dataFormatada.replace(/-/g, '')}_${row['Adversário'].replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Verifica se a partida já existe (pela data e adversário ou pelo eventIdCustom)
    const jaExiste = partidasExistentes.some(p => 
      (p.data === dataFormatada && p.adversario?.nome?.toLowerCase() === row['Adversário'].toLowerCase()) ||
      p.eventId === eventIdCustom
    );

    if (jaExiste) continue;

    // Criar o objeto de partida seguindo a estrutura do JSON
    const novaPartida = {
      eventId: eventIdCustom,
      competicao: {
        chave: String(row['Competição'] || '').toLowerCase().replace(/ /g, '-'),
        nome: String(row['Competição'] || ''),
        rodadaOuFase: String(row['Fase/Rodada'] || '')
      },
      data: dataFormatada,
      mando: String(row['Mando'] || '').toLowerCase(),
      flamengo: {
        nomeExibido: "Flamengo RJ",
        sigla: "FLA"
      },
      adversario: {
        nome: row['Adversário']
      },
      derivado: {
        resultado: row['Resultado'] === 'Vitória' ? 'V' : (row['Resultado'] === 'Derrota' ? 'D' : 'E'),
        gols: {
          flamengo: Number(row['Gols Flamengo'] || 0),
          adversario: Number(row['Gols Adversário'] || 0)
        }
      }
    };

    partidasExistentes.push(novaPartida);
    novasPartidasAdicionadas++;
  }

  if (novasPartidasAdicionadas > 0) {
    jsonData.partidas = partidasExistentes;
    fs.writeFileSync(JSON_PATH, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`Sucesso! ${novasPartidasAdicionadas} novas partidas adicionadas ao JSON.`);
    console.log('Agora você pode acessar /admin/import-stats na sua aplicação para enviar as atualizações ao Firebase.');
  } else {
    console.log('Nenhuma partida nova para adicionar (todas já existiam no JSON).');
  }
}

run().catch(console.error);
