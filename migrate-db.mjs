import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_PROJECT_ID = 'fla10-f6f4b';
const TARGET_PROJECT_ID = 'fla10news-prod-2026';

const COLLECTIONS = [
  'news',
  'columns',
  'videos',
  'history',
  'voz_torcedor',
  'galeria',
  'raiox',
  'reportagens',
  'tirinhas',
  'authors',
  'users',
  'match_ratings',
  'dailyViews',
  'siteConfig',
];

// Initialize Firebase Admin for target project (fla10news-prod-2026)
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Arquivo service-account.json não encontrado em:', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: TARGET_PROJECT_ID,
});

const targetDb = admin.firestore();

/**
 * Converte um valor no formato REST do Firestore para o tipo nativo do Firebase Admin SDK
 */
function parseFirestoreValue(val) {
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return Boolean(val.booleanValue);
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return admin.firestore.Timestamp.fromDate(new Date(val.timestampValue));
  if ('geoPointValue' in val) {
    return new admin.firestore.GeoPoint(
      val.geoPointValue.latitude || 0,
      val.geoPointValue.longitude || 0
    );
  }
  if ('arrayValue' in val) {
    const values = val.arrayValue.values || [];
    return values.map(parseFirestoreValue);
  }
  if ('mapValue' in val) {
    const fields = val.mapValue.fields || {};
    const result = {};
    for (const [k, v] of Object.entries(fields)) {
      result[k] = parseFirestoreValue(v);
    }
    return result;
  }
  return null;
}

function parseFirestoreDoc(doc) {
  const parts = doc.name.split('/');
  const id = parts[parts.length - 1];
  const data = {};
  if (doc.fields) {
    for (const [k, v] of Object.entries(doc.fields)) {
      data[k] = parseFirestoreValue(v);
    }
  }
  return { id, data };
}

async function fetchCollectionFromSource(collectionName) {
  const docs = [];
  let pageToken = '';

  while (true) {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${SOURCE_PROJECT_ID}/databases/(default)/documents/${collectionName}`
    );
    url.searchParams.set('pageSize', '300');
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status} ao ler '${collectionName}': ${errText}`);
    }

    const json = await res.json();
    if (json.documents && json.documents.length > 0) {
      for (const rawDoc of json.documents) {
        docs.push(parseFirestoreDoc(rawDoc));
      }
    }

    if (json.nextPageToken) {
      pageToken = json.nextPageToken;
    } else {
      break;
    }
  }

  return docs;
}

async function writeCollectionToTarget(collectionName, docs) {
  if (docs.length === 0) return 0;

  let written = 0;
  const BATCH_SIZE = 400;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = targetDb.batch();

    for (const doc of chunk) {
      const ref = targetDb.collection(collectionName).doc(doc.id);
      batch.set(ref, doc.data, { merge: true });
    }

    await batch.commit();
    written += chunk.length;
  }

  return written;
}

async function main() {
  console.log(`🚀 Iniciando migração do Firestore: ${SOURCE_PROJECT_ID} -> ${TARGET_PROJECT_ID}\n`);

  let totalMigrated = 0;

  for (const col of COLLECTIONS) {
    process.stdout.write(`📦 Migrando coleção '${col}'... `);
    try {
      const docs = await fetchCollectionFromSource(col);
      const count = await writeCollectionToTarget(col, docs);
      totalMigrated += count;
      console.log(`✅ ${count} documento(s) copiado(s).`);
    } catch (err) {
      console.log(`❌ Erro:`);
      console.error(err.message);
      if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
        console.error(
          '\n⚠️ O projeto de origem (fla10-f6f4b) ainda está com a cota diária de leitura esgotada (HTTP 429).'
        );
        console.error(
          'A cota gratuita reinicia às 04h00/05h00 BRT (meia-noite no horário do Pacífico), ou imediatamente se vinculado à conta de faturamento existente.'
        );
        process.exit(2);
      }
    }
  }

  console.log(`\n🎉 Migração concluída com sucesso! Total de documentos migrados: ${totalMigrated}`);
}

main().catch((err) => {
  console.error('Erro fatal na migração:', err);
  process.exit(1);
});

