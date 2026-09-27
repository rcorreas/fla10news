import xlsx from 'xlsx';

const workbook = xlsx.readFile('./stats/Fla10_Banco_Flamengo_Flashscore_2026_ESCALACOES_v2.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log("Cols:", Object.keys(data[0] || {}));
console.log("First row:", data[0]);
