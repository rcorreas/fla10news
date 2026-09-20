import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export async function getNextMatchStats() {
  try {
    const docRef = doc(db, 'stats_agenda', 'current');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar stats_agenda:", error);
    return null;
  }
}

export async function getCampaignStatsList() {
  try {
    const querySnapshot = await getDocs(collection(db, 'stats_campanhas'));
    const campaigns: any[] = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort by temporada descending
    campaigns.sort((a, b) => {
      const yearA = parseInt(a.temporada) || 0;
      const yearB = parseInt(b.temporada) || 0;
      return yearB - yearA;
    });

    return campaigns.slice(0, 10);
  } catch (error) {
    console.error("Erro ao buscar stats_campanhas:", error);
    return [];
  }
}
