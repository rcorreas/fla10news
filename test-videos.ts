import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { db } from './src/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function check() {
  const q = query(collection(db, 'videos'));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.title && data.title.includes('PAQUET')) {
      console.log('ID:', doc.id);
      console.log('Title:', data.title);
      console.log('Image:', data.image);
      console.log('VideoURL:', data.videoUrl);
    }
  });
  process.exit(0);
}
check();
